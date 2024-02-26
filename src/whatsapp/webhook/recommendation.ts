import { CombinedLoggingMessage } from '@/analytics/client.js';
import { evaluateProductRecommendation } from '@/openai/evaluate-recommendation-query.js';
import { createRecommendationQuery } from '@/openai/recommendation-query.js';
import { NormalizedProductData, ProductRecommendation } from '@/types.js';

const NO_PRODUCTS_FOUND_MESSAGE =
	"I'm sorry but I was not able to find a product matching the query. Perhaps try again with a different wording?";

export async function handleRecommendation({
	query,
	ebayData,
	callCount,
}: {
	callCount: number;
	ebayData: Record<string, NormalizedProductData>;
	query: string;
}): Promise<{
	loggingMessage: Omit<CombinedLoggingMessage, 'callId' | 'context'>;
	result: string | ProductRecommendation;
}> {
	const result = await createRecommendationQuery(
		query,
		Object.values(ebayData),
	);

	if (typeof result === 'string') {
		return {
			loggingMessage: {
				eventId: 'ModelRecommendationFailure',
				level: 'warn',
				value: {
					ebayData,
					message: NO_PRODUCTS_FOUND_MESSAGE,
					query,
					recursiveInvocationCount: callCount,
					result,
				},
			},
			result: NO_PRODUCTS_FOUND_MESSAGE,
		};
	}

	const passEvaluation = await evaluateProductRecommendation(
		ebayData[result.id],
		query,
	);
	if (!passEvaluation) {
		if (callCount < 3) {
			const clonedData = structuredClone(ebayData);
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete clonedData[result.id];

			if (Object.keys(clonedData).length > 0) {
				return await handleRecommendation({
					callCount: callCount + 1,
					ebayData: clonedData,
					query,
				});
			}
		}

		return {
			loggingMessage: {
				eventId: 'EvaluationRecommendationFailure',
				level: 'warn',
				value: {
					ebayData,
					message: NO_PRODUCTS_FOUND_MESSAGE,
					query,
					recursiveInvocationCount: callCount,
					result,
				},
			},
			result: NO_PRODUCTS_FOUND_MESSAGE,
		};
	}

	return {
		loggingMessage: {
			eventId: 'RecommendationEvaluated',
			level: 'info',
			value: {
				ebayData,
				query,
				recursiveInvocationCount: callCount,
				result,
			},
		},
		result,
	};
}
