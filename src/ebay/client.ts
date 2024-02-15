import { InvocationContext } from '@azure/functions';
import EbayAuthToken from 'ebay-oauth-nodejs-client';

import { HttpMethod } from '@/constants/generic.js';
import {
	EbayBrowseItemsErrorResponse,
	EbayBrowseItemsSuccessResponse,
} from '@/ebay/types.js';
import { parseEbayResponse } from '@/ebay/utils.js';
import { FindProductsParameters } from '@/types.js';
import { ConfigurationError } from '@/utils/errors.js';
import { fetcher } from '@/utils/fetcher.js';

const EBAY_AFFILIATE_HEADER = 'X-EBAY-C-ENDUSERCTX';
const EBAY_MARKETPLACE_HEADER = 'X-EBAY-C-MARKETPLACE-ID';
const EBAY_BROWSE_API_ITEMS_SUMMARY_ENDPOINT =
	'/buy/browse/v1/item_summary/search';
const EBAY_API_BASE_URL_PRODUCTION = 'https://api.ebay.com';
const EBAY_API_BASE_URL_SANDBOX = 'https://api.sandbox.ebay.com';

const isErrResponse = (
	value: EbayBrowseItemsErrorResponse | EbayBrowseItemsSuccessResponse,
): value is EbayBrowseItemsErrorResponse => Reflect.has(value, 'warnings');

export class EbayClient {
	private readonly ebayCampaignId: string;
	private readonly auth: EbayAuthToken;
	private readonly baseUrl: string;

	private apiAccessToken: { expiration: number; value: string } | null = null;

	constructor() {
		const ebayCampaignId = process.env.EBAY_CAMPAIGN_ID;
		if (!ebayCampaignId) {
			throw new Error('EBAY_CAMPAIGN_ID environment variable is not set');
		}
		this.ebayCampaignId = ebayCampaignId;

		const clientSecret = process.env.EBAY_CLIENT_SECRET;
		if (!clientSecret) {
			throw new Error(
				'EBAY_CLIENT_SECRET environment variable is not set',
			);
		}
		const clientId = process.env.EBAY_CLIENT_ID;
		if (!clientId) {
			throw new Error('EBAY_CLIENT_ID environment variable is not set');
		}
		const redirectUri = process.env.EBAY_REDIRECT_URI;
		if (!redirectUri) {
			throw new Error(
				'EBAY_REDIRECT_URI environment variable is not set',
			);
		}

		const env =
			process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'SANDBOX';

		this.auth = new EbayAuthToken({
			clientId,
			clientSecret,
			env,
			redirectUri,
		});

		this.baseUrl =
			process.env.NODE_ENV === 'production'
				? EBAY_API_BASE_URL_PRODUCTION
				: EBAY_API_BASE_URL_SANDBOX;
	}

	async getToken() {
		if (
			this.apiAccessToken &&
			this.apiAccessToken.expiration < Date.now()
		) {
			return this.apiAccessToken.value;
		}

		const encodedToken = await this.auth.getApplicationToken(
			process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'SANDBOX',
		);
		const { access_token, expires_in } = JSON.parse(encodedToken) as {
			access_token: string;
			expires_in: number;
			token_type: string;
		};

		this.apiAccessToken = {
			expiration: Date.now() + expires_in * 1000,
			value: access_token,
		};

		return access_token;
	}

	async search(
		context: InvocationContext,
		{
			keywords,
			minPrice,
			maxPrice,
			allowRefurbished,
		}: FindProductsParameters,
	) {
		const filters = [
			'deliveryCountry:US',
			'buyingOptions:{FIXED_PRICE}',
			// see: https://developer.ebay.com/devzone/finding/callref/Enums/conditionIdList.html
			`conditionIds:{1000|1500${allowRefurbished ? '|2000|2010|2020|2030|2500' : ''}}`,
		];

		if (minPrice ?? maxPrice) {
			filters.push(
				'priceCurrency:USD',
				minPrice === undefined
					? `price:[..${maxPrice}]`
					: maxPrice === undefined
						? `price:[${minPrice}]`
						: `price:[${minPrice}..${maxPrice}]`,
			);
		}

		const queryParams = {
			auto_correct: 'KEYWORD',
			fieldgroups: 'EXTENDED,MATCHING_ITEMS',
			filter: filters.join(','),
			limit: '25',
			q: keywords.map((v) => v.trim()).join(' '),
		};

		const response = await fetcher<
			EbayBrowseItemsSuccessResponse | EbayBrowseItemsErrorResponse
		>({
			headers: {
				Authorization: `Bearer ${await this.getToken()}`,
				[EBAY_AFFILIATE_HEADER]: `affiliateCampaignId=${this.ebayCampaignId}`,
				[EBAY_MARKETPLACE_HEADER]: 'EBAY_US',
			},
			method: HttpMethod.Get,
			queryParams,
			url: this.baseUrl + EBAY_BROWSE_API_ITEMS_SUMMARY_ENDPOINT,
		});

		if (isErrResponse(response)) {
			context.debug('ebay warnings', response.warnings);
			throw new ConfigurationError(
				'ebay API returned warnings',
				response.warnings,
			);
		}

		return parseEbayResponse(response);
	}
}
