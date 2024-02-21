/*
 * OpenAI tool definitions
 *
 * see: https://platform.openai.com/docs/guides/function-calling
 * */
import {
	ChatCompletionsFunctionToolDefinition,
	type ChatRequestMessage,
} from '@azure/openai';

import { getOpenAIClient } from '@/openai/client.js';
import { ModelDeployments } from '@/openai/enums.js';
import { productDataSchema } from '@/openai/schemas.js';
import { NormalizedProductData } from '@/types.js';
import { RuntimeError } from '@/utils/errors.js';

const tools: ChatCompletionsFunctionToolDefinition[] = [
	{
		function: {
			description: 'sends product recommendations to the user',
			name: 'evaluateProductRecommendation',
			parameters: {
				properties: {
					score: {
						description:
							'The score of the appropriateness of the product to the query. The score is between 0-10, with 0 being worst and 10 being best.',
						maximum: 10,
						minimum: 0,
						type: 'number',
					},
				},
				required: ['score'],
				type: 'object',
			},
		},
		type: 'function',
	},
];

const createProductQuerySystemMessages: ChatRequestMessage[] = [
	{
		content: 'You are a helpful evaluation assistant.',
		role: 'system',
	},
	{
		content: `You will be a query string and an object that adhere to the following JSON schema: ${JSON.stringify(productDataSchema)}.`,
		role: 'system',
	},
	{
		content: `Please evaluate whether the object selection fits the query. Evaluate the product title, description, price and categories. Use the "evaluateProductRecommendation" function to send the evaluation result as a score. The score should be between 0 (worst) to 10 (best), with values below 5 being considered a failure.`,
		role: 'system',
	},
];

export async function evaluateProductRecommendation(
	{
		title,
		shortDescription,
		categories,
		price,
		condition,
	}: NormalizedProductData,
	query: string,
): Promise<number> {
	const userMessage = {
		content: `The query is '${query}' and the product data is ${JSON.stringify({ categories, condition, price, shortDescription, title })}.`,
		role: 'user',
	} satisfies ChatRequestMessage;

	const response = await getOpenAIClient().getChatCompletions(
		ModelDeployments.GPT_35,
		[...createProductQuerySystemMessages, userMessage],
		{ tools },
	);

	if (!response.choices.length) {
		throw new RuntimeError('No choices returned from OpenAI', response);
	}

	const [{ finishReason, message }] = response.choices;

	if (finishReason === 'tool_calls' && message?.toolCalls.length) {
		const [
			{
				function: { arguments: params },
			},
		] = message.toolCalls;
		const { score } = JSON.parse(params) as { score: number };
		return score;
	}

	throw new RuntimeError('No tool calls returned from OpenAI', response);
}
