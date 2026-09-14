export type Language = 'en' | 'mr';

export type CategoryId = 'dairy' | 'fruits_veggies' | 'snacks' | 'beverages' | 'instant' | 'household';

export type QuickAppId = 'blinkit' | 'zepto' | 'instamart' | 'bbnow' | 'quickmart';

export interface AppStoreListing {
  appId: QuickAppId;
  appName: string;
  brandColor: string; // Hex or tailwind class
  badgeColor: string;
  price: number;
  mrp: number;
  deliveryMins: number;
  deliveryFee: number;
  handlingFee: number;
  inStock: boolean;
  stockCount: number;
  tag?: string; // e.g., 'Cheapest', 'Fastest (9 min)', 'Price Match'
  directStoreUrl: string;
  offerText?: string;
}

export interface CompetitorComparison {
  blinkit: AppStoreListing;
  zepto: AppStoreListing;
  instamart: AppStoreListing;
  bbnow: AppStoreListing;
  quickmart?: AppStoreListing;
  cheapestApp: QuickAppId;
  fastestApp: QuickAppId;
  lowestPrice: number;
  highestPrice: number;
  maxSavingsAmount: number;
  lastFetchedAt: string;
}

export interface Product {
  id: string;
  name: string;
  nameMr: string;
  category: CategoryId;
  price: number;
  mrp: number;
  unit: string;
  unitMr: string;
  stock: number;
  initialStock: number;
  image: string;
  bestseller?: boolean;
  alternativeId?: string; // product id suggested when out of stock
  competitorComparison?: CompetitorComparison;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedPlatform?: QuickAppId;
}

export type GeofenceStatus = 'in_zone' | 'out_of_zone' | 'gps_error';

export interface LocationInfo {
  name: string;
  nameMr: string;
  address: string;
  addressMr: string;
  distanceKm: number;
  status: GeofenceStatus;
  darkStoreName: string;
  darkStoreNameMr: string;
  etaMinutes: number;
  lat: number;
  lng: number;
}

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cod';

export type PaymentFailureType = 'none' | 'network_timeout' | 'app_backgrounded' | 'gateway_crash';

export interface RefundRecord {
  id: string;
  orderAmount: number;
  refundAmount: number;
  reason: string;
  reasonMr: string;
  utrNumber: string;
  method: string;
  status: 'initiated' | 'processing' | 'credited';
  createdAt: string;
  creditedAt?: string;
  itemsSummary: string;
}

export interface SystemEventLog {
  id: string;
  timestamp: string;
  type: 'geo' | 'inventory' | 'payment' | 'refund' | 'order' | 'scrape';
  severity: 'info' | 'warning' | 'error' | 'success';
  title: string;
  details: string;
}

export interface ActiveOrder {
  id: string;
  items: CartItem[];
  totalAmount: number;
  deliveryAddress: string;
  status: 'confirmed' | 'packing' | 'out_for_delivery' | 'arrived';
  riderName: string;
  riderPhone: string;
  estimatedTimeSec: number;
  otp: string;
  createdAt: string;
  fulfillmentPlatform?: QuickAppId;
  platformTrackingUrl?: string;
}
