import { ConditionHistogram } from './ConditionHistogram';

/**
 * conditionHistogramContainer
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.ebay.com/marketplace/search/v1/services`
 */
export interface ConditionHistogramContainer {
	/** conditionHistogram[] */
	conditionHistogram?: ConditionHistogram[];
	/** xs:string */
	delimiter?: string;
}
