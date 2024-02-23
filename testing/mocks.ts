import { faker } from '@faker-js/faker';

import { Env } from '@/types.js';

export const mockFetch = vi.fn();

export const mockEnv = {
	AZURE_API_KEY: faker.string.uuid(),
	AZURE_API_URL: faker.string.uuid(),
	EBAY_CAMPAIGN_ID: faker.string.uuid(),
	EBAY_ENV: 'PRODUCTION',
	EBAY_PRODUCTION_CLIENT_ID: faker.string.uuid(),
	EBAY_PRODUCTION_CLIENT_SECRET: faker.string.uuid(),
	EBAY_PRODUCTION_REDIRECT_URI: faker.string.uuid(),
	EBAY_SANDBOX_CLIENT_ID: faker.string.uuid(),
	EBAY_SANDBOX_CLIENT_SECRET: faker.string.uuid(),
	EBAY_SANDBOX_REDIRECT_URI: faker.string.uuid(),
	REDIS_HOST: faker.string.uuid(),
	REDIS_PASSWORD: faker.string.uuid(),
	SEGMENT_WRITE_KEY: faker.string.uuid(),
	WHATSAPP_ACCESS_TOKEN: faker.string.uuid(),
	WHATSAPP_PHONE_NUMBER_ID: faker.string.uuid(),
	WHATSAPP_VERIFICATION_TOKEN: faker.string.uuid(),
} satisfies Env;

beforeEach(() => {
	mockFetch.mockReset();
	mockFetch.mockResolvedValue({
		json: () => Promise.resolve({}),
		ok: true,
		status: 200,
	});
	global.fetch = mockFetch;

	process.env = { ...process.env, ...mockEnv };
});
