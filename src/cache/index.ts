import { createClient, RedisClientType, SetOptions } from 'redis';

const url = process.env.REDIS_CONNECTION_STRING;
if (!url) {
	throw new Error('REDIS_CONNECTION_STRING environment variable is not set');
}
const redisClient = await createClient<any, any, any>({ url }).connect();

export class Cache {
	private client!: RedisClientType<any, any, any>;

	constructor() {
		this.client = redisClient;
	}

	async get<T extends Record<string, any>>(key: string) {
		const value = await this.client.get(key);
		return value ? (JSON.parse(value) as T) : null;
	}

	async set<T extends Record<string, any>>(
		key: string,
		value: T,
		options?: SetOptions,
	) {
		await this.client.set(key, JSON.stringify(value), options);
		return value;
	}
}
