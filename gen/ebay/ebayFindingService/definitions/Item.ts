import { Attribute } from './Attribute';
import { Condition } from './Condition';
import { DiscountPriceInfo } from './DiscountPriceInfo';
import { GalleryInfoContainer } from './GalleryInfoContainer';
import { ListingInfo } from './ListingInfo';
import { PrimaryCategory } from './PrimaryCategory';
import { SellerInfo } from './SellerInfo';
import { SellingStatus } from './SellingStatus';
import { ShippingInfo } from './ShippingInfo';
import { StoreInfo } from './StoreInfo';
import { UnitPrice } from './UnitPrice';

/**
 * item
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.ebay.com/marketplace/search/v1/services`
 */
export interface Item {
	/** attribute[] */
	attribute?: Attribute[];
	/** xs:boolean */
	autoPay?: string;
	/** xs:string */
	charityId?: string;
	/** xs:string */
	compatibility?: string;
	/** condition */
	condition?: Condition;
	/** xs:token */
	country?: string;
	/** xs:string */
	delimiter?: string;
	/** discountPriceInfo */
	discountPriceInfo?: DiscountPriceInfo;
	/** xs:double */
	distance?: string;
	/** xs:token */
	globalId?: string;
	/** xs:string */
	productId?: string;
	/** xs:anyURI */
	pictureURLSuperSize?: string;
	/** xs:string */
	title?: string;
	/** xs:string */
	postalCode?: string;
	/** shippingInfo */
	shippingInfo?: ShippingInfo;
	/** secondaryCategory */
	secondaryCategory?: PrimaryCategory;
	/** xs:string */
	itemId?: string;
	/** sellerInfo */
	sellerInfo?: SellerInfo;
	/** xs:string */
	location?: string;
	/** xs:token */
	paymentMethod?: string[];
	/** xs:anyURI */
	pictureURLLarge?: string;
	/** xs:boolean */
	returnsAccepted?: string;
	/** xs:anyURI */
	galleryPlusPictureURL?: string[];
	/** xs:string */
	subtitle?: string;
	/** xs:anyURI */
	viewItemURL?: string;
	/** primaryCategory */
	primaryCategory?: PrimaryCategory;
	/** xs:boolean */
	isMultiVariationListing?: string;
	/** galleryInfoContainer */
	galleryInfoContainer?: GalleryInfoContainer;
	/** sellingStatus */
	sellingStatus?: SellingStatus;
	/** listingInfo */
	listingInfo?: ListingInfo;
	/** storeInfo */
	storeInfo?: StoreInfo;
	/** unitPrice */
	unitPrice?: UnitPrice;
	/** xs:anyURI */
	galleryURL?: string;
	/** xs:boolean */
	topRatedListing?: string;
	/** xs:string */
	eekStatus?: string[];
	/** xs:boolean */
	eBayPlusEnabled?: string;
}
