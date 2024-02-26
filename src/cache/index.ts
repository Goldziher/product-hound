import { createClient, RedisClientType, SetOptions } from 'redis';

import { loadEnv } from '@/utils/env.js';

let instance: Cache | null;

export class Cache {
	private client!: RedisClientType<any, any, any>;

	constructor(client: RedisClientType<any, any, any>) {
		this.client = client;
	}

	static async create() {
		const client = await createClient<any, any, any>({
			password: loadEnv('REDIS_PASSWORD'),
			url: loadEnv('REDIS_HOST'),
		}).connect();
		await client.ping();
		return new Cache(client);
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

export async function getCacheInstance() {
	if (!instance) {
		instance = await Cache.create();
	}
	return instance;
}
