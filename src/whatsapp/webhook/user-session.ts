import { getCacheInstance } from '@/cache/index.js';

interface Session {
	createdAt: number;
	isSubscribed: boolean;
	lastSeen: number;
	whatsAppId: string;
}

class UserSession implements Session {
	createdAt: number;
	lastSeen: number;
	isSubscribed: boolean;
	whatsAppId: string;

	constructor({ createdAt, lastSeen, isSubscribed, whatsAppId }: Session) {
		this.createdAt = createdAt;
		this.lastSeen = lastSeen;
		this.isSubscribed = isSubscribed;
		this.whatsAppId = whatsAppId;
	}

	async setSubscribed(isSubscribed: boolean) {
		const cache = await getCacheInstance();
		this.isSubscribed = isSubscribed;

		await cache.set(this.whatsAppId, {
			createdAt: this.createdAt,
			isSubscribed: this.isSubscribed,
			lastSeen: this.lastSeen,
			whatsAppId: this.whatsAppId,
		});
	}
}

export async function getOrCreateUserSession(whatsAppId: string) {
	const cache = await getCacheInstance();
	let session = await cache.get<Session>(whatsAppId);
	const isNewUser = !session;

	session = session
		? { ...session, lastSeen: Date.now() }
		: {
				createdAt: Date.now(),
				isSubscribed: true,
				lastSeen: Date.now(),
				whatsAppId,
			};

	await cache.set(whatsAppId, session);
	return { isNewUser, session: new UserSession(session) };
}
