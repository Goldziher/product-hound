import {
	app,
	HttpRequest,
	HttpResponseInit,
	InvocationContext,
} from '@azure/functions';

import { Cache } from '@/cache/index.js';
import { HttpStatus } from '@/constants/generic.js';
import { WhatAppTemplateNames } from '@/constants/whatsapp.js';
import { EbayClient } from '@/ebay/client.js';
import { createProductQuery } from '@/openai/product-query.js';
import { createRecommendationQuery } from '@/openai/recommendation-query.js';
import { NormalizedProductData } from '@/types.js';
import { WhatsAppClient } from '@/whatsapp/cloud-api/client.js';
import { WhatsAppTemplateMessage } from '@/whatsapp/cloud-api/types.js';
import { WhatsAppWebHookRequest } from '@/whatsapp/webhooks/types.js';
import {
	parseWebhookRequest,
	UserMessageMapping,
} from '@/whatsapp/webhooks/utils.js';

const ebayClient = new EbayClient();
const whatsAppClient = new WhatsAppClient();
const cache = new Cache();

const whatsAppVerificationToken = process.env.WHATSAPP_VERIFICATION_TOKEN;

const isWebhookRequest = (value: unknown): value is WhatsAppWebHookRequest =>
	Reflect.has(value as Record<string, any>, 'entry');

function createEbayRecommendationMessage(
	data: NormalizedProductData,
	recommendation: string,
	id: string,
): Pick<WhatsAppTemplateMessage, 'name' | 'components'> {
	if (data.image) {
		return {
			components: [
				{
					parameters: {
						image: {
							id,
							link: data.image,
						},
						type: 'image',
					},
					type: 'header',
				},
				{
					parameters: {
						text: data.title.trim(),
						type: 'text',
					},
					type: 'body',
				},
				{
					parameters: {
						text: recommendation,
						type: 'text',
					},
					type: 'body',
				},
				{
					index: 'First',
					parameters: {
						payload: data.url.replace(
							'https://www.ebay.com/itm/',
							'',
						),
						type: 'payload',
					},
					sub_type: 'url',
					type: 'button',
				},
			],
			name: WhatAppTemplateNames.EBAY_PRODUCT_RECOMMENDATION_WITH_IMAGE,
		};
	}

	return {
		components: [
			{
				parameters: {
					text: data.title.trim(),
					type: 'text',
				},
				type: 'header',
			},
			{
				parameters: {
					text: recommendation,
					type: 'text',
				},
				type: 'body',
			},
			{
				index: 'First',
				parameters: {
					payload: data.url.replace('https://www.ebay.com/itm/', ''),
					type: 'payload',
				},
				sub_type: 'url',
				type: 'button',
			},
		],
		name: WhatAppTemplateNames.EBAY_PRODUCT_RECOMMENDATION_WITHOUT_IMAGE,
	};
}

async function handleUserMessage(
	userMessageMapping: UserMessageMapping,
	context: InvocationContext,
) {
	context.log('parsed webhook request', JSON.stringify(userMessageMapping));

	try {
		const session = await cache.get(userMessageMapping.whatsAppId);
		if (!session?.greetingMessage) {
			await cache.set(userMessageMapping.whatsAppId, {
				...session,
				greetingMessage: true,
			});
			await whatsAppClient.template({
				template: { name: WhatAppTemplateNames.GREETING },
				to: userMessageMapping.whatsAppId,
			});
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

		await whatsAppClient.text({
			text: {
				body: "I'm on it!",
			},
			to: userMessageMapping.whatsAppId,
		});

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

		context.log('ebayData', JSON.stringify(ebayData));

		const recommendations = await createRecommendationQuery(
			query,
			ebayData,
		);

		if (recommendations?.length) {
			const [{ recommendation, id }] = recommendations;

			const datum = ebayData[id];

			context.log(
				`sending whatsapp recommendation to +${userMessageMapping.whatsAppId}`,
				JSON.stringify(datum),
			);

			await whatsAppClient.template({
				template: createEbayRecommendationMessage(
					datum,
					recommendation,
					id,
				),
				to: userMessageMapping.whatsAppId,
			});
		}

		context.log('recommendations', JSON.stringify(recommendations));

		return { message: 'success' };
	} catch (error) {
		context.error(
			`an unexpected error occurred: ${(error as Error).message}`,
			{ stack: (error as Error).stack },
		);

		return { message: (error as Error).message };
	}
}

export async function handler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	if (request.method === 'GET') {
		// GET requests sent from WhatsApp / Facebook are verification requests
		// see: https://developers.facebook.com/docs/graph-api/webhooks/getting-started/
		const token = request.query.get('hub.verify_token');
		const challenge = request.query.get('hub.challenge');

		if (!token || !challenge || token !== whatsAppVerificationToken) {
			context.error('invalid verification token');
			return {
				body: 'invalid verification token',
				status: HttpStatus.Forbidden,
			};
		}

		context.log(
			'verification token is valid, responding to code challenge',
		);
		return {
			body: challenge,
			status: HttpStatus.OK,
		};
	}

	const body = await request.json();

	if (isWebhookRequest(body)) {
		context.log('received webhook request', JSON.stringify(body));

		const results = await Promise.all(
			parseWebhookRequest(body).map((userMessageMapping) =>
				handleUserMessage(userMessageMapping, context),
			),
		);

		return { jsonBody: { results }, status: HttpStatus.OK };
	}

	context.error('unknown request body', JSON.stringify(body));
	return {
		jsonBody: { body, message: 'unknown request body' },
		// we must return 200 if we do not want whatsapp to retry sending the message
		status: HttpStatus.OK,
	};
}

app.http('whatsapp-webhook', {
	authLevel: 'anonymous',
	handler,
	methods: ['POST', 'GET'],
});
