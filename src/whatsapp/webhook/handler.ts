import {
	HttpRequest,
	HttpResponseInit,
	InvocationContext,
} from '@azure/functions';

import { AnalyticsClient, CombinedLoggingMessage } from '@/analytics/client.js';
import { AnalyticEvents } from '@/constants/analytics.js';
import { HttpStatus } from '@/constants/generic.js';
import { WhatAppTemplateNames } from '@/constants/whatsapp.js';
import { EbayClient } from '@/ebay/client.js';
import { createProductQuery } from '@/openai/product-query.js';
import { ApiError, RuntimeError } from '@/utils/errors.js';
import { WhatsAppClient } from '@/whatsapp/cloud-api/client.js';
import { handleRecommendation } from '@/whatsapp/webhook/recommendation.js';
import { WhatsAppWebHookRequest } from '@/whatsapp/webhook/types.js';
import { getOrCreateUserSession } from '@/whatsapp/webhook/user-session.js';
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

async function handleUserMessage(
	userMessageMapping: UserMessageMapping,
	context: InvocationContext,
): Promise<Omit<CombinedLoggingMessage, 'callId' | 'context'>> {
	try {
		await analyticsClient.identify(userMessageMapping.whatsAppId, {
			messages: userMessageMapping.messages,
			name: userMessageMapping.profileName,
			phone: userMessageMapping.displayPhoneNumber,
			phoneId: userMessageMapping.phoneNumberId,
			whatsAppId: userMessageMapping.whatsAppId,
		});

		const { isNewUser, session } = await getOrCreateUserSession(
			userMessageMapping.whatsAppId,
		);

		if (isNewUser) {
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
			context.info("new user's session created");
		}

		if (
			userMessageMapping.messages.some(
				(m) => m.text.toLowerCase().trim() === 'unsubscribe',
			)
		) {
			await session.setSubscribed(false);
			await whatsAppClient.text({
				text: {
					body: 'You have been unsubscribed from our service. To resubscribe, send us a message saying "resubscribe".',
				},
				to: userMessageMapping.whatsAppId,
			});
			return {
				eventId: 'Unsubscribed',
				level: 'info',
				value: {
					userId: userMessageMapping.whatsAppId,
				},
			};
		} else if (
			userMessageMapping.messages.some(
				(m) => m.text.toLowerCase().trim() === 'resubscribe',
			)
		) {
			await session.setSubscribed(true);
			await whatsAppClient.text({
				text: {
					body: 'You have been resubscribed to our service. To unsubscribe, send us a message saying "unsubscribe".',
				},
				to: userMessageMapping.whatsAppId,
			});
		} else if (!session.isSubscribed) {
			await whatsAppClient.text({
				text: {
					body: 'You have previously unsubscribed from our service. To resubscribe, send us a message saying "resubscribe".',
				},
				to: userMessageMapping.whatsAppId,
			});
			return {
				eventId: 'NotSubscribed',
				level: 'info',
				value: {
					userId: userMessageMapping.whatsAppId,
				},
			};
		}

		const data = await createProductQuery(
			userMessageMapping.messages.map((m) => m.text),
		);
		if (!data) {
			// if this is a new user, he or she just saw the greeting message with instructions, so we do not need to send this.
			if (!isNewUser) {
				await whatsAppClient.template({
					template: { name: WhatAppTemplateNames.NO_QUERY },
					to: userMessageMapping.whatsAppId,
				});
			}

			return {
				eventId: 'NoQueryExtractedFromMessages',
				level: 'warn',
				value: {
					messages: userMessageMapping.messages,
					userId: userMessageMapping.whatsAppId,
				},
			};
		}

		const { query, ...productSearchParameters } = data;
		await analyticsClient.combinedLogging({
			callId: 'handleUserMessage',
			context,
			eventId: 'QueryExtractedFromMessages',
			level: 'info',
			value: {
				messages: userMessageMapping.messages,
				productSearchParameters,
				query,
				userId: userMessageMapping.whatsAppId,
			},
		});

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

		if (!ebayData || Object.keys(ebayData).length === 0) {
			await whatsAppClient.text({
				text: {
					body: "I'm sorry but I didn't find any matching products. Please try again with different keywords.",
				},
				to: userMessageMapping.whatsAppId,
			});
			return {
				eventId: 'NoMatchingDataFoundOnEbay',
				level: 'warn',
				value: {
					ebayData,
					productSearchParameters,
					query,
					userId: userMessageMapping.whatsAppId,
				},
			};
		}

		await whatsAppClient.text({
			text: {
				body: '🧠 Creating Recommendations... (this can take some time)',
			},
			to: userMessageMapping.whatsAppId,
		});

		const { result, loggingMessage } = await handleRecommendation({
			callCount: 0,
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
			return loggingMessage;
		}

		await analyticsClient.combinedLogging({
			callId: 'handleUserMessage',
			context,
			...loggingMessage,
		});

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

		return {
			eventId: 'RecommendationSent',
			level: 'info',
			value: {
				ebayData,
				productSearchParameters,
				query,
				recommendation,
				userId: userMessageMapping.whatsAppId,
			},
		};
	} catch (error) {
		if (error instanceof ApiError) {
			return {
				eventId: error.name,
				level: 'error',
				value: {
					error,
					userId: userMessageMapping.whatsAppId,
				},
			};
		}
		return {
			eventId:
				error instanceof RuntimeError ? error.name : 'UnhandledError',
			level: 'error',
			value: error as Error,
		};
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

	context.info('valid verification request received from WhatsApp');
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
		try {
			await Promise.all(
				parseWebhookRequest(context, body).map(
					async (userMessageMapping) => {
						const result = await handleUserMessage(
							userMessageMapping,
							context,
						);
						await analyticsClient.combinedLogging({
							callId: 'handleUserMessage',
							context,
							...result,
						});
					},
				),
			);

			return { status: HttpStatus.OK };
		} catch (error) {
			await analyticsClient.combinedLogging({
				callId: 'whatsAppWebhookHandler',
				context,
				eventId: 'UnhandledError',
				level: 'error',
				value: { error },
			});

			return { jsonBody: error, status: HttpStatus.InternalServerError };
		}
	}

	await analyticsClient.combinedLogging({
		callId: 'whatsAppWebhookHandler',
		context,
		eventId: 'UnhandledRequestBody',
		level: 'error',
		value: { body },
	});
	return {
		jsonBody: body as Record<string, any>,
		status: HttpStatus.InternalServerError,
	};
}
