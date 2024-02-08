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

		it('should throw an error if AZURE_API_KEY is not set', () => {
			delete process.env.AZURE_API_KEY;
			expect(() => getOpenAIClient()).toThrowError(
				'AZURE_API_KEY environment variable is not set',
			);
		});

		it('should throw an error if AZURE_RESOURCE_NAME is not set', () => {
			delete process.env.AZURE_RESOURCE_NAME;
			expect(() => getOpenAIClient()).toThrowError(
				'AZURE_RESOURCE_NAME environment variable is not set',
			);
		});
	});
});
