import { faker } from '@faker-js/faker';
import {
	WhatsAppContactFactory,
	WhatsAppImageMessageFactory,
	WhatsAppTextMessageFactory,
} from 'testing/factories.js';

import {
	WhatsAppMessageChangeValue,
	WhatsAppWebHookRequest,
	WhatsAppWebHookRequestEntry,
} from '@/whatsapp/webhook/types.js';
import { parseWebhookRequest } from '@/whatsapp/webhook/utils.js';

describe('utils tests', () => {
	describe('parseWhatsAppChatMessages tests', () => {
		const contact = WhatsAppContactFactory.buildSync();

		const imageMessage = WhatsAppImageMessageFactory.buildSync({
			from: contact.wa_id,
		});
		const textMessages = WhatsAppTextMessageFactory.batchSync(2, {
			from: contact.wa_id,
		});

		const changeValues = {
			contacts: [contact],
			messages: [imageMessage, ...textMessages],
			messaging_product: 'whatsapp',
			metadata: {
				display_phone_number: faker.phone.number(),
				phone_number_id: faker.number
					.int({ max: 999_999_999, min: 100_000_000 })
					.toString(),
			},
		} satisfies WhatsAppMessageChangeValue;

		const request = {
			entry: [
				{
					changes: [{ field: 'messages', value: changeValues }],
					id: faker.string.uuid(),
				} satisfies WhatsAppWebHookRequestEntry,
			],
			object: 'whatsapp_business_account',
		} satisfies WhatsAppWebHookRequest;

		it('should return an array of parsed messages', () => {
			const result = parseWebhookRequest(request);
			expect(result).toHaveLength(1);

			expect(result[0].profileName).toBe(contact.profile.name);
			expect(result[0].whatsAppId).toBe(contact.wa_id);
			expect(result[0].phoneNumberId).toBe(
				changeValues.metadata.phone_number_id,
			);
			expect(result[0].displayPhoneNumber).toBe(
				changeValues.metadata.display_phone_number,
			);
			expect(result[0].messages[0].id).toBe(textMessages[0].id);
			expect(result[0].messages[0].text).toBe(textMessages[0].text.body);
			expect(result[0].messages[0].timestamp).toBe(
				Number.parseInt(textMessages[0].timestamp),
			);
		});
	});
});
