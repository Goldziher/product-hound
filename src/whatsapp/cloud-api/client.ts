import { HttpMethod } from '@/constants/generic.js';
import { fetcher } from '@/utils/fetcher.js';
import {
	WhatsAppReactionMessage,
	WhatsAppTemplateMessage,
	WhatsAppTextMessage,
} from '@/whatsapp/cloud-api/types.js';

export class WhatsAppClient {
	private readonly accessToken: string;
	private readonly phoneNumberId: string;

	constructor() {
		const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
		const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

		if (!accessToken) {
			throw new Error(
				'WHATSAPP_ACCESS_TOKEN environment variable is not set',
			);
		}
		if (!phoneNumberId) {
			throw new Error(
				'WHATSAPP_PHONE_NUMBER_ID environment variable is not set',
			);
		}

		this.accessToken = accessToken;
		this.phoneNumberId = phoneNumberId;
	}

	/*
	 * Post a message to the whatsapp cloud API.
	 * See: https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages#examples
	 */
	async post<T extends Record<string, any>>({
		to,
		data,
	}: {
		data: T;
		to: string;
	}) {
		return await fetcher({
			data: {
				to,
				...data,
				messaging_product: 'whatsapp',
				recipient_type: 'individual',
			},
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
			},
			method: HttpMethod.Post,
			url: `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`,
		});
	}

	/*
	 * Send a WhatsApp template message
	 * The template must correlate with a template configured in the developer console.
	 * */
	async template({
		to,
		template,
	}: {
		template: Pick<WhatsAppTemplateMessage, 'name' | 'components'>;
		to: string;
	}) {
		return await this.post({
			data: {
				template: {
					...template,
					language: {
						code: 'en',
					},
				},
				type: 'template',
			},
			to,
		});
	}

	/*
	 * Send a WhatsApp text message
	 * */
	async text({ to, text }: { text: WhatsAppTextMessage; to: string }) {
		return await this.post({
			data: {
				text,
				type: 'text',
			},
			to,
		});
	}

	/*
	 * Send a WhatsApp reaction message
	 * Note: reaction is an emoji
	 * */
	async reaction({
		to,
		reaction,
	}: {
		reaction: WhatsAppReactionMessage;
		to: string;
	}) {
		return await this.post({
			data: {
				reaction,
				type: 'reaction',
			},
			to,
		});
	}
}
