/**
 * listingInfo
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.ebay.com/marketplace/search/v1/services`
 */
export interface ListingInfo {
	/** xs:boolean */
	bestOfferEnabled?: string;
	/** xs:boolean */
	buyItNowAvailable?: string;
	/** xs:double */
	buyItNowPrice?: string;
	/** xs:double */
	convertedBuyItNowPrice?: string;
	/** xs:string */
	delimiter?: string;
	/** xs:dateTime */
	endTime?: string;
	/** xs:boolean */
	gift?: string;
	/** xs:token */
	listingType?: string;
	/** xs:dateTime */
	startTime?: string;
	/** xs:int */
	watchCount?: string;
}
