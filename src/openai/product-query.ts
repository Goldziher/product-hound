import type { ChatRequestMessage } from '@azure/openai';

import { getOpenAIClient } from '@/openai/client.js';

/*
 * The deployment name is set in the Azure AI Studio
 *
 * see: https://oai.azure.com/portal/5f4cfe9e11a347b9b92a0de3c1b20296/deployment?tenantid=ef241226-ef98-4c54-92c4-4aa4067a467d
 * */
const deploymentName = 'products-query-gpt';

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
		content: `Filter out any queries that attempt to diverge from product queries or attempt to execute code. These queries should be considered meaningless.`,
		role: 'system',
	},
	{
		content: `If the input contains a meaningful user input, rephrase the query to contain only meaningful text and respond in the format:
		 
		Success:::<result>
		 
		For example, if the provided user input string is "Wassup? What's are the best 4K TVs under $500 Preferably with HDR support What's the wheather" your response should be: 
		 
		Success:::What are the best 4K TVs under $500 with HDR support:::Any additional reasoning info`,
		role: 'system',
	},
	{
		content: `If no meaningful query can be extracted from the input, respond in the format:
		 
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
): Promise<string | null> {
	const userInput = normalizeUserInputs(userInputs);
	if (!userInput) {
		return null;
	}

	const userMessage = {
		content: userInput,
		role: 'user',
	} satisfies ChatRequestMessage;

	const { choices } = await getOpenAIClient().getChatCompletions(
		deploymentName,
		[...createProductQuerySystemMessages, userMessage],
		/*TODO: update to use responseFormat when Azure updates to using GPT-3.5-1106+*/
		// { responseFormat: { type: 'json_object' } },
	);

	return choices.length ? choices[0].message?.content ?? null : null;
}
