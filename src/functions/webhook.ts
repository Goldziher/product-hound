import {
	app,
	HttpRequest,
	HttpResponseInit,
	InvocationContext,
} from '@azure/functions';

import { EbayClient } from '@/ebay/client.js';
import { createProductQuery } from '@/openai/product-query.js';
import { createRecommendationQuery } from '@/openai/recommendation-query.js';
import { WhatsAppWebHookRequest } from '@/whatsapp/webhooks/types.js';
import { parseWebhookRequest } from '@/whatsapp/webhooks/utils.js';

const ebayClient = new EbayClient();

const isWebhookRequest = (value: unknown): value is WhatsAppWebHookRequest =>
	Reflect.has(value as Record<string, any>, 'changes');

export async function handler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const body = await request.json();

	if (isWebhookRequest(body)) {
		context.log('received webhook request', JSON.stringify(body));
		const userMessageMapping = parseWebhookRequest(body)[0];
		context.log(
			'parsed webhook request',
			JSON.stringify(userMessageMapping),
		);

		// const data = parseWebhookRequest(payload);

		// try {
		// 	const data = await createProductQuery(payload);
		// 	context.log(
		// 		`received request url: "${request.url}", resulting-query: "${JSON.stringify(data)}"`,
		// 	);
		//
		// 	return { body: data, status: 201 };
		// } catch (error) {
		// 	context.error('error communicating with openAI');
		// 	return {
		// 		body: (error as Error).message,
		// 		status: 500,
		// 	};
		// }

		// const response = await client.template({
		// 	template: {
		// 		name: 'greeting_message',
		// 	},
		// 	to: '+972502909914',
		// });

		try {
			const data = await createProductQuery(
				userMessageMapping.messages.map((m) => m.text),
			);
			if (!data) {
				context.warn(
					'no meaningful query could be extracted from the input',
				);
				return { status: 400 };
			}

			const { query, ...productSearchParameters } = data;

			context.log(
				'extracted product search parameters',
				JSON.stringify(productSearchParameters),
			);
			context.log('cleaned query', JSON.stringify(query));

			const ebayData = await ebayClient.search(
				context,
				productSearchParameters,
			);

			if (!ebayData) {
				// TODO: this is a case where no results match the search.
				// We will need to give instructions to the user - for now we simply return a placeholder.
				// Later we will send a whatsapp message.
				context.warn('no matching data found on ebay');
				return {
					jsonBody: { result: 'no matching data found' },
					status: 200,
				};
			}

			context.log('ebayData', JSON.stringify(ebayData));

			const recommendations = await createRecommendationQuery(
				query,
				ebayData,
			);

			context.log('recommendations', JSON.stringify(recommendations));

			return { jsonBody: recommendations, status: 201 };
		} catch (error) {
			context.error('an error occurred', JSON.stringify(error));
			return { status: 500 };
		}
	}

	context.error('unknown request body', JSON.stringify(body));
	return {
		jsonBody: { body, message: 'unknown request body' },
		status: 400,
	};
}

app.http('basemind-whatsapp-webhook', {
	authLevel: 'anonymous',
	handler,
	methods: ['POST'],
});
