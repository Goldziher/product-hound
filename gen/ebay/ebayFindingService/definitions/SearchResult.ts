import { Item } from './Item';

/**
 * searchResult
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.ebay.com/marketplace/search/v1/services`
 */
export interface SearchResult {
	/** xs:string */
	delimiter?: string;
	/** item[] */
	item?: Item[];
}
