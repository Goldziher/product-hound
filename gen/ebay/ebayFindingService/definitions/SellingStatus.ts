/**
 * sellingStatus
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.ebay.com/marketplace/search/v1/services`
 */
export interface SellingStatus {
	/** xs:int */
	bidCount?: string;
	/** xs:double */
	convertedCurrentPrice?: string;
	/** xs:double */
	currentPrice?: string;
	/** xs:string */
	delimiter?: string;
	/** xs:token */
	sellingState?: string;
	/** xs:duration */
	timeLeft?: string;
}
