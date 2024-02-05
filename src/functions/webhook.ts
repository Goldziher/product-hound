import {
	app,
	HttpRequest,
	HttpResponseInit,
	InvocationContext,
} from '@azure/functions';

import { WhatsAppWebHookRequest } from '@/lib/types';
import { parseWhatsAppChatMessages } from '@/lib/utils';

export async function handler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const payload = (await request.json()) as WhatsAppWebHookRequest;

	const parsedMessages = parseWhatsAppChatMessages(payload);

	context.log(
		`received request url: "${request.url}", payload: "${JSON.stringify(parsedMessages)}"`,
	);

	return { body: `called with ${parsedMessages}` };
}

app.http('whatsapp-bot', {
	authLevel: 'anonymous',
	handler,
	methods: ['POST'],
});
