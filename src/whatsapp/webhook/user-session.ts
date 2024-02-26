import { getCacheInstance } from '@/cache/index.js';

interface Session {
	createdAt: number;
	isSubscribed: boolean;
	lastSeen: number;
	whatsAppId: string;
}

export class UserSession implements Session {
	createdAt: number;
	lastSeen: number;
	isSubscribed: boolean;
	whatsAppId: string;

	constructor({
		createdAt = Date.now(),
		lastSeen = Date.now(),
		isSubscribed = true,
		whatsAppId,
	}: Partial<Session> & { whatsAppId: string }) {
		this.createdAt = createdAt;
		this.lastSeen = lastSeen;
		this.isSubscribed = isSubscribed;
		this.whatsAppId = whatsAppId;
	}

	isNewUser() {
		return this.createdAt === this.lastSeen;
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
	const cachedSession = await cache.get<Session>(whatsAppId);

	const session = new UserSession({
		...cachedSession,
		whatsAppId,
	});

	await cache.set(whatsAppId, session);
	return session;
}
