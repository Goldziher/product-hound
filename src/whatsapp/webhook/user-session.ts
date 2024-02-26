import { getCacheInstance } from '@/cache/index.js';

export async function getOrCreateUserSession(whatsAppId: string) {
	const cache = await getCacheInstance();
	let session = await cache.get(whatsAppId);
	const isNewUser = !session;

	session = session
		? { ...session, lastSeen: Date.now() }
		: { createdAt: Date.now(), lastSeen: Date.now() };
	await cache.set(whatsAppId, session);

	return { isNewUser };
}
