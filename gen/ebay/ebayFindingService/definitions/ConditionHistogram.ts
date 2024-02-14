import { Condition } from './Condition';

/**
 * conditionHistogram
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.ebay.com/marketplace/search/v1/services`
 */
export interface ConditionHistogram {
	/** condition */
	condition?: Condition;
	/** xs:int */
	count?: string;
	/** xs:string */
	delimiter?: string;
}
