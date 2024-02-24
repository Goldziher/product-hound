import { Analytics } from '@segment/analytics-node';

import { ConfigurationError } from '@/utils/errors.js';

const writeKey = process.env.SEGMENT_WRITE_KEY;

if (!writeKey) {
	throw new ConfigurationError(
		'SEGMENT_WRITE_KEY environment variable is not set',
	);
}

const analytics = new Analytics({
	flushAt: 1,
	writeKey,
});

export const identify = async (
	userId: string,
	traits: object,
): Promise<void> => {
	analytics.identify({ traits, userId });
	await analytics.flush();
};

export const track = async (
	userId: string,
	event: string,
	properties: object,
): Promise<void> => {
	analytics.track({ event, properties, userId });
	await analytics.flush();
};
