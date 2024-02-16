import {
	app,
	HttpRequest,
	HttpResponseInit,
	InvocationContext,
} from '@azure/functions';

import { EbayClient } from '@/ebay/client.js';
import { createProductQuery } from '@/openai/product-query.js';
import { createRecommendationQuery } from '@/openai/recommendation-query.js';

const ebayClient = new EbayClient();

export async function handler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const payload = (await request.json()) as string[];
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
		const data = await createProductQuery(payload);
		if (!data) {
			context.warn(
				'no meaningful query could be extracted from the input',
			);
			return { status: 400 };
		}

		const { query, ...productSearchParameters } = data;

		const ebayData = await ebayClient.search(
			context,
			productSearchParameters,
		);

		const result = await createRecommendationQuery(query, ebayData);

		return { jsonBody: result, status: 201 };
	} catch (error) {
		context.error(error);
		return { status: 500 };
	}
}

app.http('whatsapp-bot', {
	authLevel: 'anonymous',
	handler,
	methods: ['POST'],
});
