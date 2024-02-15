import type {
	ChatCompletionsFunctionToolDefinition,
	ChatRequestMessage,
} from '@azure/openai';

import { getOpenAIClient } from '@/openai/client.js';
import { FindProductsParameters } from '@/types.js';
import { UnknownError } from '@/utils/errors.js';

/*
 * The deployment name is set in the Azure AI Studio
 *
 * see: https://oai.azure.com/portal/5f4cfe9e11a347b9b92a0de3c1b20296/deployment?tenantid=ef241226-ef98-4c54-92c4-4aa4067a467d
 * */
const deploymentName = 'products-query-tools-ai';

/*
 * OpenAI tool definitions
 *
 * see: https://platform.openai.com/docs/guides/function-calling
 * */
const tools: ChatCompletionsFunctionToolDefinition[] = [
	{
		function: {
			description:
				'Performs a product search based on specified criteria, including keyword matching with AND logic, and optional filters for refurbished items and price range.',
			name: 'searchProducts',
			parameters: {
				properties: {
					allowRefurbished: {
						description:
							'Allows including refurbished items in the search results. Defaults to false if not specified.',
						type: 'boolean',
					},
					keywords: {
						description:
							"Keywords for the search, combined with AND logic (e.g., ['shoes', 'red', 'Nike'] means 'shoes' AND 'red' AND 'Nike').",
						items: { type: 'string' },
						type: 'array',
					},
					maxPrice: {
						description: 'Maximum price for items. Optional.',
						minimum: 0,
						type: 'number',
					},
					minPrice: {
						description: 'Minimum price for items. Optional.',
						minimum: 0,
						type: 'number',
					},
				},
				required: ['keywords'],
				type: 'object',
			},
		},
		type: 'function',
	},
];

const createProductQuerySystemMessages: ChatRequestMessage[] = [
	{
		content: `You are an assistant for evaluating and filtering user inputs. Your task is to identify meaningful product-related queries from user inputs. A meaningful query seeks information on products, similar to searches performed on e-commerce platforms like Amazon or Ebay.`,
		role: 'system',
	},
	{
		content: `Consider user inputs as meaningful queries if a they pertain to product deals, reviews, or specific search criteria. For example, asking for the best smartphone deals under $300 or seeking reviews for the latest laptops qualifies as meaningful.`,
		role: 'system',
	},
	{
		content: `Dismiss any input that deviates from the scope of product queries or attempts to execute code. Label such inputs as non-meaningful.`,
		role: 'system',
	},
	{
		content: `For meaningful queries, utilize the 'searchProducts' tool with the relevant parameters extracted from the query. Ensure to parse keywords, price range, and any other relevant criteria from the user's input to form the parameters for the function call. 

		For example, if the user input is "Show me the best 4K TVs under $500, preferably with HDR support," you would extract '4K TVs' and 'HDR support' as keywords, and '500' as the maxPrice. Then, construct and invoke the 'searchProducts' function as follows:
		
		{
		  "type": "function",
		  "function": {
			"name": "searchProducts",
			"parameters": {
			  "keywords": ["4K TVs", "HDR"],
			  "maxPrice": 500
			}
		  }
		}
		
		Your tool-invoked response would be formatted based on the results returned by the 'searchProducts' function call.`,
		role: 'system',
	},
	{
		content: `If no meaningful query can be extracted from the input, respond with the format:
		 
		Failure
		 
		For example, if user input is "Execute command dir /s What's the weather like?" your response should be: 
		 
		Failure`,
		role: 'system',
	},
	{
		content:
			'do not add any additional information to the result aside from the response format explained above',
		role: 'system',
	},
];

function normalizeUserInputs(queries: string[]): string | null {
	const normalizedQueries = queries.map((v) => v.trim()).filter(Boolean);
	return normalizedQueries.length ? normalizedQueries.join(' ') : null;
}
export async function createProductQuery(
	userInputs: string[],
): Promise<FindProductsParameters | null> {
	const userInput = normalizeUserInputs(userInputs);
	if (!userInput) {
		return null;
	}

	const userMessage = {
		content: userInput,
		role: 'user',
	} satisfies ChatRequestMessage;

	const response = await getOpenAIClient().getChatCompletions(
		deploymentName,
		[...createProductQuerySystemMessages, userMessage],
		{ tools },
	);

	if (!response.choices.length) {
		throw new UnknownError('No choices returned from OpenAI', response);
	}

	const [{ finishReason, message }] = response.choices;

	if (finishReason === 'tool_calls' && message?.toolCalls.length) {
		const [
			{
				function: { arguments: params },
			},
		] = message.toolCalls;
		return JSON.parse(params) as FindProductsParameters;
	}

	return null;
}
