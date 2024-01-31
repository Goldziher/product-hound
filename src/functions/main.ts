import {
	app,
	HttpRequest,
	HttpResponseInit,
	InvocationContext,
} from '@azure/functions';

export async function handler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const payload = await request.json();

	context.log(
		`received request url: "${request.url}", payload: "${JSON.stringify(payload)}"`,
	);

	return { body: 'called' };
}

app.http('whatsapp-bot', {
	authLevel: 'anonymous',
	handler,
	methods: ['GET', 'POST'],
});
