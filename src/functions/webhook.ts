import {
	app,
	HttpRequest,
	HttpResponseInit,
	InvocationContext,
} from '@azure/functions';

import { EbayClient } from '@/ebay/client.js';

const ebayClient = new EbayClient();

export async function handler(
	_: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	// const payload = (await request.json()) as string[];
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
		const result = await ebayClient.search(context, {
			allowRefurbished: true,
			keywords: ['iPhone', '13', 'pro'],
			maxPrice: 1000,
			minPrice: 0,
		});

		context.log(JSON.stringify(result));
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
