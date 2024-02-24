// there are other parameter types as well
// see: https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
export type WhatsAppTemplateComponent =
	| {
			parameters: (
				| {
						text: string;
						type: 'text';
				  }
				| {
						image: {
							caption?: string;
							id?: string;
							link: string;
						};
						type: 'image';
				  }
			)[];
			type: 'body' | 'header';
	  }
	| {
			index: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
			parameters: {
				text: string;
				type: 'text';
			}[];
			sub_type: 'url';
			type: 'button';
	  }
	| {
			index: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
			parameters: {
				payload: string;
				type: 'payload';
			}[];
			sub_type: 'quick_reply';
			type: 'button';
	  };

export interface WhatsAppTemplateMessage {
	components?: WhatsAppTemplateComponent[];
	language: {
		code: 'en';
	};
	name: string;
}

export interface WhatsAppTextMessage {
	body: string;
	preview_url?: string;
}

export interface WhatsAppReactionMessage {
	emoji: string;
	message_id: string;
}
