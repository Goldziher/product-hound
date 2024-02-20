import { createClient, RedisClientType, SetOptions } from 'redis';

import { loadEnv } from '@/utils/env.js';

const redisClient = await createClient<any, any, any>({
	password: loadEnv('REDIS_PASSWORD'),
	url: loadEnv('REDIS_HOST'),
}).connect();

export class Cache {
	private client!: RedisClientType<any, any, any>;

	constructor() {
		this.client = redisClient;
	}

	async get<T extends Record<string, any>>(key: string) {
		const value = await this.client.get(key);
		return value ? (JSON.parse(value) as T) : undefined;
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
