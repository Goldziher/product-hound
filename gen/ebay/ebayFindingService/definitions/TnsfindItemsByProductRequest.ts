import { Affiliate } from './Affiliate';
import { ItemFilter } from './ItemFilter';
import { PaginationInput } from './PaginationInput';

/** tns:FindItemsByProductRequest */
export interface TnsfindItemsByProductRequest {
	/** affiliate */
	affiliate?: Affiliate;
	/** xs:string */
	buyerPostalCode?: string;
	/** itemFilter[] */
	itemFilter?: ItemFilter[];
	/** OutputSelectorType|xs:string|SellerInfo,StoreInfo,CategoryHistogram,AspectHistogram,ConditionHistogram,GalleryInfo,PictureURLSuperSize,PictureURLLarge,UnitPriceInfo */
	outputSelector?: string[];
	/** paginationInput */
	paginationInput?: PaginationInput;
	/** xs:string */
	productId?: string;
	/** SortOrderType|xs:string|BestMatch,CurrentPriceHighest,DistanceNearest,EndTimeSoonest,PricePlusShippingLowest,PricePlusShippingHighest,StartTimeNewest,BidCountMost,BidCountFewest,CountryAscending,CountryDescending,WatchCountDecreaseSort */
	sortOrder?: string;
}
