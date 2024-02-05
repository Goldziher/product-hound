import { WhatsAppTextMessage, WhatsAppWebHookRequest } from '@/lib/types';

export interface ParsedWhatsAppMessage {
	from: {
		displayPhoneNumber: string;
		phoneNumberId: string;
		profileName: string;
		whatsAppId: string;
	};
	messageId: string;
	text: string;
	timestamp: number;
}

export function parseWhatsAppChatMessages(
	payload: WhatsAppWebHookRequest,
): ParsedWhatsAppMessage[] {
	const result: ParsedWhatsAppMessage[] = [];

	for (const entry of payload.entry) {
		for (const change of entry.changes) {
			if (change.field === 'messages') {
				const contacts = Object.fromEntries(
					change.value.contacts.map((c) => [c.wa_id, c.profile.name]),
				);
				result.push(
					...change.value.messages
						.filter((m) => m.type === 'text' && m.text.body.trim())
						.map((m) => ({
							from: {
								displayPhoneNumber:
									change.value.metadata.display_phone_number,
								phoneNumberId:
									change.value.metadata.phone_number_id,
								profileName: contacts[m.from],
								whatsAppId: m.from,
							},
							messageId: m.id,
							text: (m as WhatsAppTextMessage).text.body,
							timestamp: Number.parseInt(m.timestamp),
						})),
				);
			}
		}
	}

	return result;
}
