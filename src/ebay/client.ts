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
	value:
		| EbayBrowseItemsErrorResponse
		| EbayBrowseItemsSuccessResponse
		| Record<string, never>,
): value is EbayBrowseItemsErrorResponse => Reflect.has(value, 'warnings');

const isSuccessResponse = (
	value: EbayBrowseItemsSuccessResponse | Record<string, never>,
): value is EbayBrowseItemsSuccessResponse =>
	Reflect.has(value, 'itemSummaries');

export class EbayClient {
	private readonly auth: EbayAuthToken;
	private readonly baseUrl: string;
	private readonly ebayCampaignId: string;
	private readonly ebayEnv: 'PRODUCTION' | 'SANDBOX';

	private apiAccessToken: { expiration: number; value: string } | null = null;

	constructor() {
		const ebayEnv = process.env.EBAY_ENV as
			| 'PRODUCTION'
			| 'SANDBOX'
			| undefined;

		if (!ebayEnv) {
			throw new Error('EBAY_ENV environment variable is not set');
		}
		this.ebayEnv = ebayEnv;

		const ebayCampaignId = process.env.EBAY_CAMPAIGN_ID;
		if (!ebayCampaignId) {
			throw new Error('EBAY_CAMPAIGN_ID environment variable is not set');
		}
		this.ebayCampaignId = ebayCampaignId;

		const clientSecret = process.env[`EBAY_${ebayEnv}_CLIENT_SECRET`];
		if (!clientSecret) {
			throw new Error(
				'EBAY_CLIENT_SECRET environment variable is not set',
			);
		}

		const clientId = process.env[`EBAY_${ebayEnv}_CLIENT_ID`];
		if (!clientId) {
			throw new Error('EBAY_CLIENT_ID environment variable is not set');
		}

		const redirectUri = process.env[`EBAY_${ebayEnv}_REDIRECT_URI`];
		if (!redirectUri) {
			throw new Error(
				'EBAY_REDIRECT_URI environment variable is not set',
			);
		}

		this.auth = new EbayAuthToken({
			clientId,
			clientSecret,
			env: ebayEnv,
			redirectUri,
		});

		this.baseUrl =
			ebayEnv === 'PRODUCTION'
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

		const encodedToken = await this.auth.getApplicationToken(this.ebayEnv);
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
			// the keyword combinations have an OR relation
			// see: https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search
			q: `(${keywords.join(', ')})`,
		};

		const response = await fetcher<
			| EbayBrowseItemsSuccessResponse
			| EbayBrowseItemsErrorResponse
			| Record<string, never>
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

		if (isSuccessResponse(response)) {
			return parseEbayResponse(response);
		}

		return null;
	}
}
