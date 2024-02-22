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
					result: {
						description:
							'A boolean indicating whether the given product object is a good fit for the given query.',
						type: 'boolean',
					},
				},
				required: ['result'],
				type: 'object',
			},
		},
		type: 'function',
	},
];

const createProductQuerySystemMessages: ChatRequestMessage[] = [
	{
		content:
			'Your role is to assist in evaluating product recommendations.',
		role: 'system',
	},
	{
		content: `You'll receive a query and an object conforming to this JSON schema: ${JSON.stringify(productDataSchema)}.`,
		role: 'system',
	},
	{
		content: `Assess if the product matches the query by evaluating its title, description, price, and categories. Use the "evaluateProductRecommendation" function to submit your verdict: return true for a good match, and false otherwise.`,
		role: 'system',
	},
	{
		content: `A suitable product must closely align with the query. For instance, if the query is 'recommend a new iPhone 15', a mobile phone would be a suitable recommendation, whereas a phone case would not.`,
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
): Promise<boolean> {
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
		const { result } = JSON.parse(params) as {
			result: boolean;
		};
		return result;
	}

	throw new RuntimeError('No tool calls returned from OpenAI', response);
}
