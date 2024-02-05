import { faker } from '@faker-js/faker';
import { TypeFactory } from 'interface-forge';

import {
	WhatsAppContact,
	WhatsAppImageMessage,
	WhatsAppReactionMessage,
	WhatsAppTextMessage,
} from '@/lib/types';

faker.seed(100);

export const WhatsAppTextMessageFactory = new TypeFactory<WhatsAppTextMessage>(
	() => ({
		from: faker.number
			.int({ max: 9_999_999_999, min: 1_000_000_000 })
			.toString(),
		id: faker.string.alphanumeric({ length: 10 }),
		text: { body: faker.lorem.sentence() },
		timestamp: faker.date.recent().getTime().toString(),
		type: 'text',
	}),
);

export const WhatsAppImageMessageFactory =
	new TypeFactory<WhatsAppImageMessage>(() => ({
		from: faker.number
			.int({ max: 9_999_999_999, min: 1_000_000_000 })
			.toString(),
		id: faker.string.alphanumeric({ length: 10 }),
		image: {
			id: faker.string.alphanumeric({ length: 10 }),
			mime_type: 'image/png',
			sha256: faker.string.uuid(),
		},
		timestamp: faker.date.recent().getTime().toString(),
		type: 'image',
	}));

export const WhatsAppReactionMessageFactory =
	new TypeFactory<WhatsAppReactionMessage>(() => ({
		from: faker.number
			.int({ max: 9_999_999_999, min: 1_000_000_000 })
			.toString(),
		id: faker.string.alphanumeric({ length: 10 }),
		reaction: '😂',
		timestamp: faker.date.recent().getTime().toString(),
		type: 'reaction',
	}));

export const WhatsAppContactFactory = new TypeFactory<WhatsAppContact>(() => ({
	profile: { name: faker.person.fullName() },
	wa_id: faker.number
		.int({ max: 9_999_999_999, min: 1_000_000_000 })
		.toString(),
}));
