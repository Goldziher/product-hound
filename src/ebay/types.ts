interface Category {
	categoryId: string;
	categoryName: string;
}

interface Price {
	currency: string;
	value: string;
}

interface Seller {
	feedbackScore: number;
}

interface ShippingOption {
	shippingCost: Price;
	shippingCostType: string;
}

interface ItemLocation {
	city?: string;
	country: string;
}

interface ItemSummary {
	adultOnly: boolean;
	availableCoupons: boolean;
	buyingOptions: string[];
	categories: Category[];
	condition: string;
	conditionId: string;
	itemAffiliateWebUrl: string;
	itemCreationDate: string;
	itemHref: string;
	itemId: string;
	itemLocation: ItemLocation;
	itemWebUrl: string;
	leafCategoryIds: string[];
	legacyItemId: string;
	listingMarketplaceId: string;
	price: Price;
	priorityListing: boolean;
	seller: Seller;
	shippingOptions: ShippingOption[];
	shortDescription?: string;
	title: string;
	topRatedBuyingExperience: boolean;
}

export interface EbayBrowseItemsSuccessResponse {
	href: string; // request url
	itemSummaries: ItemSummary[];
	// pagination data
	limit: number;
	offset: number;
	total: number;
}

export interface EbayBrowseItemsErrorResponse {
	warnings: Record<string, any>[];
}
