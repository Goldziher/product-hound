import {
	WhatsAppTextMessage,
	WhatsAppWebHookRequest,
} from '@/whatsapp/types.js';

export interface UserMessageMapping {
	displayPhoneNumber: string;
	messages: {
		id: string;
		text: string;
		timestamp: number;
	}[];
	phoneNumberId: string;
	profileName: string;
	whatsAppId: string;
}

export function parseWebhookRequest(
	payload: WhatsAppWebHookRequest,
): UserMessageMapping[] {
	const result: Record<string, UserMessageMapping> = {};

	for (const entry of payload.entry) {
		for (const change of entry.changes.filter(
			(c) => c.field === 'messages',
		)) {
			const contacts = Object.fromEntries(
				change.value.contacts.map((c) => [c.wa_id, c.profile.name]),
			);

			for (const message of change.value.messages.filter(
				(m) => m.type === 'text' && m.text.body.trim(),
			)) {
				result[message.from] ??= {
					displayPhoneNumber:
						change.value.metadata.display_phone_number,
					messages: [],
					phoneNumberId: change.value.metadata.phone_number_id,
					profileName: contacts[message.from],
					whatsAppId: message.from,
				};

				result[message.from].messages.push({
					id: message.id,
					text: (message as WhatsAppTextMessage).text.body,
					timestamp: Number.parseInt(message.timestamp),
				});
			}
		}
	}

	return Object.values(result);
}
