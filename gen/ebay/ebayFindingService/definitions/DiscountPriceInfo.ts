/**
 * discountPriceInfo
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.ebay.com/marketplace/search/v1/services`
 */
export interface DiscountPriceInfo {
	/** MapExposureEnum|xs:string|PreCheckout,DuringCheckout */
	minimumAdvertisedPriceExposure?: string;
	/** xs:double */
	originalRetailPrice?: string;
	/** PriceTreatmentEnum|xs:string|STP,MAP */
	pricingTreatment?: string;
	/** xs:boolean */
	soldOffEbay?: string;
	/** xs:boolean */
	soldOnEbay?: string;
}
