import {
	app,
	HttpRequest,
	HttpResponseInit,
	InvocationContext,
} from '@azure/functions';

import { createProductQuery } from '@/openai/product-query.js';

export async function handler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const payload = (await request.json()) as string[];
	// const data = parseWebhookRequest(payload);

	try {
		const data = await createProductQuery(payload);
		context.log(
			`received request url: "${request.url}", resulting-query: "${JSON.stringify(data)}"`,
		);

		return { body: data, status: 201 };
	} catch (error) {
		context.error('error communicating with openAI');
		return {
			body: (error as Error).message,
			status: 500,
		};
	}
}

app.http('whatsapp-bot', {
	authLevel: 'anonymous',
	handler,
	methods: ['POST'],
});
