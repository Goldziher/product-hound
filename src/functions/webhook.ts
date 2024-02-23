import { app } from '@azure/functions';

import { whatsAppWebhookHandler } from '@/whatsapp/webhook/handler.js';

/*
 * This is an Azure Functions entry point.
 * */
app.http('whatsapp-webhook', {
	authLevel: 'anonymous',
	handler: whatsAppWebhookHandler,
	methods: ['POST', 'GET'],
});
