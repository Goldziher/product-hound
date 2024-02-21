import type {
	ChatCompletionsFunctionToolDefinition,
	ChatRequestMessage,
} from '@azure/openai';

import { getOpenAIClient } from '@/openai/client.js';
import { ModelDeployments } from '@/openai/enums.js';
import { productDataSchema } from '@/openai/schemas.js';
import { NormalizedProductData, ProductRecommendation } from '@/types.js';
import { RuntimeError } from '@/utils/errors.js';

/*
 * OpenAI tool definitions
 *
 * see: https://platform.openai.com/docs/guides/function-calling
 * */
const tools: ChatCompletionsFunctionToolDefinition[] = [
	{
		function: {
			description: 'sends product recommendations to the user',
			name: 'sendProductRecommendation',
			parameters: {
				properties: {
					id: {
						description: 'The unique identifier for the product',
						type: 'string',
					},
					recommendation: {
						description:
							'A short, natural language recommendation explaining why the product is a good fit',
						type: 'string',
					},
					title: {
						description:
							'A concise title for the product. Must be at maximum 60 characters long',
						maxLength: 60,
						minLength: 3,
						type: 'string',
					},
				},
				required: ['id', 'recommendation', 'title'],
				type: 'object',
			},
		},
		type: 'function',
	},
	{
		function: {
			description: 'sends product recommendations to the user',
			name: 'sendFailureMessage',
			parameters: {
				properties: {
					message: {
						description:
							'A message explaining the nature of the failure in recommending a product.',
						example:
							"I'm sorry but I couldn't find any products that matched the query.",
						type: 'string',
					},
				},
				required: ['message'],
				type: 'object',
			},
		},
		type: 'function',
	},
];

const createProductQuerySystemMessages: ChatRequestMessage[] = [
	{
		content: 'You are a helpful product recommendation assistant.',
		role: 'system',
	},
	{
		content: `You will be given an array of JSON objects, each of which adheres to the following JSON schema: ${JSON.stringify(productDataSchema)}.`,
		role: 'system',
	},
	{
		content: `Please identify and return the best match for the user's request, using the "sendProductRecommendation" function. When selecting a product, factor in the categories of the product and evaluate their appropriateness to the query. Do not select a product that does not fit exactly the query.`,
		role: 'system',
	},
	{
		content: `If no product sufficiently matches the query, use the "sendFailureMessage" function instead.`,
		role: 'system',
	},
];

export async function createRecommendationQuery(
	query: string,
	productMapping: NormalizedProductData[],
) {
	const systemProductMessage = {
		content: `This is the array of product data from which you should select: ${JSON.stringify(
			productMapping.map(
				({
					id,
					categories,
					condition,
					price,
					shortDescription,
					title,
				}) => ({
					categories,
					condition,
					id,
					price,
					shortDescription,
					title,
				}),
			),
		)}`,
		role: 'system',
	} as ChatRequestMessage;

	const userMessage = {
		content: query,
		role: 'user',
	} satisfies ChatRequestMessage;

	const response = await getOpenAIClient().getChatCompletions(
		ModelDeployments.GPT_4,
		[
			...createProductQuerySystemMessages,
			systemProductMessage,
			userMessage,
		],
		{ tools },
	);

	if (!response.choices.length) {
		throw new RuntimeError('No choices returned from OpenAI', response);
	}

	const [{ finishReason, message }] = response.choices;

	if (finishReason === 'tool_calls' && message?.toolCalls.length) {
		const [
			{
				function: { arguments: params, name },
			},
		] = message.toolCalls;

		if (name === 'sendFailureMessage') {
			const { message } = JSON.parse(params) as { message: string };
			return message;
		}
		return JSON.parse(params) as ProductRecommendation;
	}

	throw new RuntimeError('No tool calls returned from OpenAI', response);
}
