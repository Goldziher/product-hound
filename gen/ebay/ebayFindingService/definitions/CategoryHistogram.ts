/**
 * categoryHistogram
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.ebay.com/marketplace/search/v1/services`
 */
export interface CategoryHistogram {
	/** xs:string */
	categoryId?: string;
	/** xs:string */
	categoryName?: string;
	/** childCategoryHistogram[] */
	childCategoryHistogram?: CategoryHistogram[];
	/** xs:long */
	count?: string;
	/** xs:string */
	delimiter?: string;
}
