/**
 * shippingInfo
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.ebay.com/marketplace/search/v1/services`
 */
export interface ShippingInfo {
	/** xs:string */
	delimiter?: string;
	/** xs:boolean */
	expeditedShipping?: string;
	/** xs:int */
	handlingTime?: string;
	/** xs:boolean */
	intermediatedShipping?: string;
	/** xs:boolean */
	oneDayShippingAvailable?: string;
	/** xs:string */
	shipToLocations?: string[];
	/** xs:double */
	shippingServiceCost?: string;
	/** xs:token */
	shippingType?: string;
}
