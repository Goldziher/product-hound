export interface WhatsAppTemplateComponent {
	// there are other parameter types as well
	// TODO: add them as required, see: https://github.com/WhatsApp/WhatsApp-Nodejs-SDK/blob/main/src/types/messages.ts#L157
	parameters:
		| {
				text: string;
				type: 'text';
		  }
		| {
				image: {
					caption?: string;
					id: string;
					link?: string;
				};
				type: 'image';
		  };
	type: 'body' | 'header' | 'footer' | 'button';
}

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
