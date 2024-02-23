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
	image?: string;
	price: string;
	shortDescription?: string;
	thumbnails?: string[];
	title: string;
	url: string;
}

export interface ProductRecommendation {
	id: string;
	recommendation: string;
	title: string;
}

export interface Env {
	AZURE_API_KEY: string;
	AZURE_API_URL: string;
	EBAY_CAMPAIGN_ID: string;
	EBAY_ENV: string;
	EBAY_PRODUCTION_CLIENT_ID: string;
	EBAY_PRODUCTION_CLIENT_SECRET: string;
	EBAY_PRODUCTION_REDIRECT_URI: string;
	EBAY_SANDBOX_CLIENT_ID: string;
	EBAY_SANDBOX_CLIENT_SECRET: string;
	EBAY_SANDBOX_REDIRECT_URI: string;
	REDIS_HOST: string;
	REDIS_PASSWORD: string;
	SEGMENT_WRITE_KEY: string;
	WHATSAPP_ACCESS_TOKEN: string;
	WHATSAPP_PHONE_NUMBER_ID: string;
	WHATSAPP_VERIFICATION_TOKEN: string;
}
