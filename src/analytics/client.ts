import { Analytics } from '@segment/analytics-node';

import { loadEnv } from '@/utils/env.js';

export class AnalyticsClient {
	private readonly analytics: Analytics;

	constructor() {
		this.analytics = new Analytics({
			flushAt: 1,
			writeKey: loadEnv('SEGMENT_WRITE_KEY'),
		});
	}

	async identify(userId: string, traits: object): Promise<void> {
		this.analytics.identify({ traits, userId });
		await this.analytics.flush();
	}

	async track(
		userId: string,
		event: string,
		properties: object,
	): Promise<void> {
		this.analytics.track({ event, properties, userId });
		await this.analytics.flush();
	}
}
