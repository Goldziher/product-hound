import { InvocationContext } from '@azure/functions';
import { Analytics } from '@segment/analytics-node';

import { loadEnv } from '@/utils/env.js';

export interface CombinedLoggingMessage {
	callId: string;
	context: InvocationContext;
	eventId: string;
	level: 'info' | 'error' | 'debug' | 'warn';
	value: Record<string, any>;
}

export class AnalyticsClient {
	private readonly analytics: Analytics;

	constructor() {
		this.analytics = new Analytics({
			flushAt: 1,
			writeKey: loadEnv('SEGMENT_WRITE_KEY'),
		});
	}

	async identify(userId: string, traits: Record<string, any>): Promise<void> {
		this.analytics.identify({ traits, userId });
		await this.analytics.flush();
	}

	async track(
		userId: string,
		event: string,
		properties: Record<string, any>,
	): Promise<void> {
		this.analytics.track({ event, properties, userId });
		await this.analytics.flush();
	}

	async combinedLogging({
		context,
		callId,
		eventId,
		value,
		level,
	}: CombinedLoggingMessage) {
		const data: Record<string, any> = {
			level,
			value,
		};
		if (value instanceof Error) {
			data.stack = value.stack;
		}

		context[level](`${callId}: ${eventId}`, JSON.stringify(data, null, 2));
		await this.track(callId, eventId, data);
	}
}
