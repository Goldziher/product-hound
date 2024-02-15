import { EbayBrowseItemsSuccessResponse } from '@/ebay/types.js';
import { NormalizedProductData } from '@/types.js';

const conditionIdMap = {
	'1000': 'New',
	'1500': 'NewOther (Packaging may be missing or opened. The item may be a factory second or have defects.)',
	'2000': 'CertifiedRefurbished',
	'2010': 'ExcellentRefurbished',
	'2020': 'VeryGoodRefurbished',
	'2030': 'GoodRefurbished',
	'2500': 'SellerRefurbished',
};

export function parseEbayResponse({
	itemSummaries,
}: EbayBrowseItemsSuccessResponse): Record<string, NormalizedProductData> {
	return itemSummaries.reduce<Record<string, NormalizedProductData>>(
		(
			acc,
			{
				price: { currency, value },
				title,
				conditionId,
				categories,
				itemAffiliateWebUrl,
				shortDescription = '',
				itemId,
			},
		) => {
			acc[itemId] = {
				categories: categories.map(({ categoryName }) => categoryName),
				condition:
					conditionIdMap[conditionId as keyof typeof conditionIdMap],
				currency,
				id: itemId,
				price: value,
				shortDescription,
				title,
				url: itemAffiliateWebUrl,
			};
			return acc;
		},
		{},
	);
}
