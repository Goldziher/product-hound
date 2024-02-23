import { getOpenAIClient } from '@/openai/client.js';

describe('client tests', () => {
	describe('getOpenAIClient', () => {
		beforeEach(() => {
			process.env.AZURE_API_KEY = 'abc';
			process.env.AZURE_RESOURCE_NAME = 'def';
		});

		it('should return a singleton', () => {
			process.env.AZURE_API_KEY = 'abc';
			process.env.AZURE_RESOURCE_NAME = 'def';

			const client1 = getOpenAIClient();
			const client2 = getOpenAIClient();
			expect(client1).toBe(client2);
		});
	});
});
