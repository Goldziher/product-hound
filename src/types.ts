export interface FindProductsParameters {
	allowRefurbished?: boolean;
	keywords: string[];
	maxPrice?: number;
	minPrice?: number;
}

export interface NormalizedProductData {
	categories: string[];
	condition: string;
	currency: string;
	id: string;
	price: string;
	shortDescription: string;
	title: string;
	url: string;
}

export interface ProductRecommendation {
	id: string;
	recommendation: string;
}
