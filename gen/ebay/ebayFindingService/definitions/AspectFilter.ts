/**
 * aspectFilter
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.ebay.com/marketplace/search/v1/services`
 */
export interface AspectFilter {
	/** xs:string */
	aspectName?: string;
	/** xs:string */
	aspectValueName?: string[];
	/** xs:string */
	delimiter?: string;
}
