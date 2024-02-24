import { InvocationContext } from '@azure/functions';

import { WhatAppTemplateNames } from '@/constants/whatsapp.js';
import { NormalizedProductData } from '@/types.js';
import { WhatsAppTemplateMessage } from '@/whatsapp/cloud-api/types.js';
import {
	WhatsAppTextMessage,
	WhatsAppWebHookRequest,
} from '@/whatsapp/webhook/types.js';

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
	context: InvocationContext,
	payload: WhatsAppWebHookRequest,
): UserMessageMapping[] {
	const result: Record<string, UserMessageMapping> = {};

	for (const entry of payload.entry) {
		for (const change of entry.changes.filter(
			(c) => c.field === 'messages',
		)) {
			if (change.value.messages && change.value.contacts) {
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
			} else if (!Reflect.get(change.value, 'statuses')) {
				context.warn(
					'unexpected change.value',
					JSON.stringify(change.value),
				);
			}
		}
	}

	return Object.values(result);
}

export function createEbayRecommendationMessage(
	data: NormalizedProductData,
	recommendation: string,
	title: string,
): Pick<WhatsAppTemplateMessage, 'name' | 'components'> {
	// for now we do not send images - since this is too slow on the whatsapp size.
	// TODO: experiment in using the thumbnails returned by ebay to see whether we can make this faster
	// see: https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search#h2-output

	// if (false && data.image) {
	// 	return {
	// 		components: [
	// 			{
	// 				parameters: [
	// 					{
	// 						image: {
	// 							link: data.image,
	// 						},
	// 						type: 'image',
	// 					},
	// 				],
	// 				type: 'header',
	// 			},
	// 			{
	// 				parameters: [
	// 					{
	// 						text: data.title.trim(),
	// 						type: 'text',
	// 					},
	// 					{
	// 						text: recommendation,
	// 						type: 'text',
	// 					},
	// 				],
	// 				type: 'body',
	// 			},
	// 			{
	// 				index: 0,
	// 				parameters: [
	// 					{
	// 						text: data.url.replace(
	// 							'https://www.ebay.com/itm/',
	// 							'',
	// 						),
	// 						type: 'text',
	// 					},
	// 				],
	// 				sub_type: 'url',
	// 				type: 'button',
	// 			},
	// 		],
	// 		name: WhatAppTemplateNames.EBAY_PRODUCT_RECOMMENDATION_WITH_IMAGE,
	// 	};
	// }

	return {
		components: [
			{
				parameters: [
					{
						text:
							title.trim().length > 60
								? title.trim().slice(0, 60)
								: title.trim(),
						type: 'text',
					},
				],
				type: 'header',
			},
			{
				parameters: [
					{
						text: recommendation,
						type: 'text',
					},
				],
				type: 'body',
			},
			{
				index: 0,
				parameters: [
					{
						text: data.url.replace('https://www.ebay.com/itm/', ''),
						type: 'text',
					},
				],
				sub_type: 'url',
				type: 'button',
			},
		],
		name: WhatAppTemplateNames.EBAY_PRODUCT_RECOMMENDATION_WITHOUT_IMAGE,
	};
}
