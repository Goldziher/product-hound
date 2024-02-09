import { OpenAIClient } from '@azure/openai';

import { createProductQuery } from '@/openai/product-query.js';

describe('product query tests', () => {
	const spy = vi
		.spyOn(OpenAIClient.prototype, 'getChatCompletions')
		.mockResolvedValue({
			choices: [
				{
					finishReason: 'length',
					index: 0,
					message: {
						content: '{ "result": null }',
						role: 'system',
						toolCalls: [],
					},
				},
			],
			created: new Date(),
			id: '',
			promptFilterResults: [],
			systemFingerprint: '',
			usage: undefined,
		});

	it('should return null when all user inputs are empty', () => {
		const result = createProductQuery(['', ' ', '   ']);
		expect(result).toBeNull();
		expect(spy).not.toHaveBeenCalled();
	});
});
