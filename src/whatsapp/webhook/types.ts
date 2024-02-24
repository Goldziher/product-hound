export interface WhatsAppTextMessage {
	from: string;
	id: string;
	text: {
		body: string;
	};
	timestamp: string;
	type: 'text';
}

export interface WhatsAppImageMessage {
	from: string;
	id: string;
	image: {
		id: string;
		mime_type: string;
		sha256: string;
	};
	timestamp: string;
	type: 'image';
}

export interface WhatsAppReactionMessage {
	from: string;
	id: string;
	reaction: string;
	timestamp: string;
	type: 'reaction';
}

export type WhatsAppMessage =
	| WhatsAppTextMessage
	| WhatsAppImageMessage
	| WhatsAppReactionMessage;

export interface WhatsAppContact {
	profile: { name: string };
	wa_id: string;
}

export interface WhatsAppStatus {
	id: string;
	recipient_id: string;
	status: string;
	timestamp: string;
}

export interface WhatsAppMessageChangeValue {
	contacts?: WhatsAppContact[];
	messages?: WhatsAppMessage[];
	messaging_product: 'whatsapp';
	metadata: {
		display_phone_number: string;
		phone_number_id: string;
	};
	statuses?: WhatsAppStatus[];
}

export interface WhatsAppWebHookRequestEntry {
	changes: [
		{
			field: string;
			value: WhatsAppMessageChangeValue;
		},
	];
	id: string;
}

export interface WhatsAppWebHookRequest {
	entry: WhatsAppWebHookRequestEntry[];
	object: 'whatsapp_business_account';
}
