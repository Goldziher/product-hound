import {
	HttpRequest,
	HttpResponseInit,
	InvocationContext,
} from '@azure/functions';

import { AnalyticsClient } from '@/analytics/client.js';
import { getCacheInstance } from '@/cache/index.js';
import { AnalyticEvents } from '@/constants/analytics.js';
import { HttpStatus } from '@/constants/generic.js';
import { WhatAppTemplateNames } from '@/constants/whatsapp.js';
import { EbayClient } from '@/ebay/client.js';
import { evaluateProductRecommendation } from '@/openai/evaluate-recommendation-query.js';
import { createProductQuery } from '@/openai/product-query.js';
import { createRecommendationQuery } from '@/openai/recommendation-query.js';
import { NormalizedProductData } from '@/types.js';
import { ApiError, RuntimeError } from '@/utils/errors.js';
import { WhatsAppClient } from '@/whatsapp/cloud-api/client.js';
import { WhatsAppWebHookRequest } from '@/whatsapp/webhook/types.js';
import {
	createEbayRecommendationMessage,
	parseWebhookRequest,
	UserMessageMapping,
} from '@/whatsapp/webhook/utils.js';

const ebayClient = new EbayClient();
const whatsAppClient = new WhatsAppClient();
const analyticsClient = new AnalyticsClient();
const whatsAppVerificationToken = process.env.WHATSAPP_VERIFICATION_TOKEN;

const isWebhookRequest = (value: unknown): value is WhatsAppWebHookRequest =>
	Reflect.has(value as Record<string, any>, 'entry');

async function handleRecommendation({
	query,
	ebayData,
	callCount,
	context,
}: {
	callCount: number;
	context: InvocationContext;
	ebayData: Record<string, NormalizedProductData>;
	query: string;
}) {
	const result = await createRecommendationQuery(
		query,
		Object.values(ebayData),
	);

	if (typeof result === 'string') {
		return result;
	}

	const datum = ebayData[result.id];

	const passEvaluation = await evaluateProductRecommendation(datum, query);

	if (!passEvaluation) {
		if (callCount < 3) {
			const clonedData = structuredClone(ebayData);
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete clonedData[result.id];

			if (Object.keys(clonedData).length > 0) {
				return await handleRecommendation({
					callCount: callCount + 1,
					context,
					ebayData: clonedData,
					query,
				});
			}
		}
		return "I'm sorry but I was not able to find a product matching the query. Perhaps try again with a different wording?";
	}

	return result;
}

async function handleUserMessage(
	userMessageMapping: UserMessageMapping,
	context: InvocationContext,
) {
	try {
		await analyticsClient.identify(userMessageMapping.whatsAppId, {
			messages: userMessageMapping.messages,
			name: userMessageMapping.profileName,
			phone: userMessageMapping.displayPhoneNumber,
			phoneId: userMessageMapping.phoneNumberId,
			whatsAppId: userMessageMapping.whatsAppId,
		});
		const cache = await getCacheInstance(context);
		const session = await cache.get(userMessageMapping.whatsAppId);
		if (!session?.greetingMessage) {
			await cache.set(userMessageMapping.whatsAppId, {
				...session,
				greetingMessage: true,
			});
			await whatsAppClient.template({
				template: { name: WhatAppTemplateNames.AD_CLICK_MESSAGE },
				to: userMessageMapping.whatsAppId,
			});
			await analyticsClient.track(
				userMessageMapping.whatsAppId,
				AnalyticEvents.TRACK_NEW_USER,
				{
					messages: userMessageMapping.messages,
					name: userMessageMapping.profileName,
					phone: userMessageMapping.displayPhoneNumber,
					phoneId: userMessageMapping.phoneNumberId,
					whatsAppId: userMessageMapping.whatsAppId,
				},
			);
			return { message: 'ad-click message sent' };
		}

		const data = await createProductQuery(
			userMessageMapping.messages.map((m) => m.text),
		);
		if (!data) {
			await whatsAppClient.template({
				template: { name: WhatAppTemplateNames.NO_QUERY },
				to: userMessageMapping.whatsAppId,
			});

			context.warn(
				'no meaningful query could be extracted from the input',
			);
			return { message: 'no query' };
		}

		const { query, ...productSearchParameters } = data;

		await whatsAppClient.text({
			text: {
				body: '🔍 Searching Ebay...',
			},
			to: userMessageMapping.whatsAppId,
		});
		const ebayData = await ebayClient.search(
			context,
			productSearchParameters,
		);

		if (!ebayData) {
			context.warn('no matching data found on ebay');
			await whatsAppClient.text({
				text: {
					body: "I'm sorry but I didn't find any matching products. Please try again with different keywords.",
				},
				to: userMessageMapping.whatsAppId,
			});
			return { message: 'no matching data found' };
		}

		await whatsAppClient.text({
			text: {
				body: '🧠 Creating Recommendations...',
			},
			to: userMessageMapping.whatsAppId,
		});

		const result = await handleRecommendation({
			callCount: 0,
			context,
			ebayData,
			query,
		});

		if (typeof result === 'string') {
			await whatsAppClient.text({
				text: {
					body: result,
				},
				to: userMessageMapping.whatsAppId,
			});
			return { message: 'no recommendation found' };
		}

		const { recommendation, id, title } = result;

		const datum = ebayData[id];
		const template = createEbayRecommendationMessage(
			datum,
			recommendation,
			title,
		);

		await whatsAppClient.template({
			template,
			to: userMessageMapping.whatsAppId,
		});

		void analyticsClient.track(
			userMessageMapping.whatsAppId,
			AnalyticEvents.TRACK_USER_RECOMMENDATION,
			{
				messages: userMessageMapping.messages,
				name: userMessageMapping.profileName,
				phone: userMessageMapping.displayPhoneNumber,
				phoneId: userMessageMapping.phoneNumberId,
				whatsAppId: userMessageMapping.whatsAppId,
			},
		);

		return { message: 'success' };
	} catch (error) {
		if (error instanceof ApiError) {
			context.error(
				`an api error occurred: ${JSON.stringify(error, null, 2)}`,
			);
		} else if (error instanceof RuntimeError) {
			context.error(
				`a runtime error occurred: ${(error as Error).message}`,
				{
					context: JSON.stringify(error.context),
					stack: (error as Error).stack,
				},
			);
		} else {
			context.error(
				`an unhandled error occurred: ${(error as Error).message}`,
				{
					stack: (error as Error).stack,
				},
			);
		}

		return { message: (error as Error).message };
	}
}

export function handleValidationRequest(
	request: HttpRequest,
	context: InvocationContext,
): HttpResponseInit {
	const token = request.query.get('hub.verify_token');
	const challenge = request.query.get('hub.challenge');

	if (!token || !challenge || token !== whatsAppVerificationToken) {
		context.error('invalid WhatsApp verification token');
		return {
			status: HttpStatus.Forbidden,
		};
	}

	return {
		body: challenge,
		status: HttpStatus.OK,
	};
}

export async function whatsAppWebhookHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	if (request.method === 'GET') {
		// GET requests sent from WhatsApp / Facebook are verification requests
		// see: https://developers.facebook.com/docs/graph-api/webhooks/getting-started/
		return handleValidationRequest(request, context);
	}

	const body = await request.json();

	if (isWebhookRequest(body)) {
		const results = await Promise.all(
			parseWebhookRequest(context, body).map((userMessageMapping) =>
				handleUserMessage(userMessageMapping, context),
			),
		);

		return { jsonBody: { results }, status: HttpStatus.OK };
	}

	return {
		jsonBody: { body, message: 'unknown request body' },
		// we must return 200 if we do not want whatsapp to retry sending the message
		status: HttpStatus.BadRequest,
	};
}
