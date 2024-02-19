import {
	app,
	HttpRequest,
	HttpResponseInit,
	InvocationContext,
} from '@azure/functions';

import { HttpStatus } from '@/constants/generic.js';
import { EbayClient } from '@/ebay/client.js';
import { createProductQuery } from '@/openai/product-query.js';
import { createRecommendationQuery } from '@/openai/recommendation-query.js';
import { WhatsAppClient } from '@/whatsapp/cloud-api/client.js';
import { WhatsAppWebHookRequest } from '@/whatsapp/webhooks/types.js';
import {
	parseWebhookRequest,
	UserMessageMapping,
} from '@/whatsapp/webhooks/utils.js';

const ebayClient = new EbayClient();
const whatsAppClient = new WhatsAppClient();
const whatsAppVerificationToken = process.env.WHATSAPP_VERIFICATION_TOKEN;

const isWebhookRequest = (value: unknown): value is WhatsAppWebHookRequest =>
	Reflect.has(value as Record<string, any>, 'entry');

async function handleUserMessage(
	userMessageMapping: UserMessageMapping,
	context: InvocationContext,
) {
	context.log('parsed webhook request', JSON.stringify(userMessageMapping));

	try {
		const data = await createProductQuery(
			userMessageMapping.messages.map((m) => m.text),
		);
		if (!data) {
			context.warn(
				'no meaningful query could be extracted from the input',
			);
			return { message: 'no query' };
		}

		const { query, ...productSearchParameters } = data;

		const ebayData = await ebayClient.search(
			context,
			productSearchParameters,
		);

		if (!ebayData) {
			// TODO: this is a case where no results match the search.
			// We will need to give instructions to the user - for now we simply return a placeholder.
			// Later we will send a whatsapp message.
			context.warn('no matching data found on ebay');
			return { message: 'no matching data found' };
		}

		context.log('ebayData', JSON.stringify(ebayData));

		const recommendations = await createRecommendationQuery(
			query,
			ebayData,
		);

		if (recommendations?.length) {
			const [{ recommendation, id }] = recommendations;

			const datum = ebayData[id];

			await whatsAppClient.text({
				text: {
					body: `${datum.title}
					${recommendation}
					
					${datum.url}
					`,
				},
				to: userMessageMapping.whatsAppId,
			});
		}

		context.log('recommendations', JSON.stringify(recommendations));

		return { message: 'success' };
	} catch (error) {
		context.error('an error occurred', JSON.stringify(error));

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
