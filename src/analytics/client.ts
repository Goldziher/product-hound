import { Analytics } from '@segment/analytics-node';

const analytics = new Analytics({
	flushAt: 1,
	writeKey: process.env.SEGMENT_WRITE_KEY ?? '<MY_WRITE_KEY>',
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
