// Digital Showroom Type Definitions

export type ProductType = 'resell' | 'external' | 'produce_on_demand' | 'white_label' | 'co_lab';
export type ProductStatus = 'active' | 'draft' | 'archived';
export type PriceTier = {
  minQuantity: number;
  maxQuantity?: number;
  price: number;
};

export interface ShowroomProduct {
  id: string;
  partnerId: string;
  partnerName: string;
  productType: ProductType;
  sku: string;
  gtin?: string;
  title: string;
  description: string;
  brand: string;
  category: string;
  images: string[];
  color?: string;
  size?: string;
  season?: string;
  condition?: string;
  fabric?: string;
  sustainabilityFlags?: string[];
  msrp: number;
  wholesalePrice: number;
  priceTiers: PriceTier[];
  moq: number; // Minimum Order Quantity
  leadTime: number; // in days
  availabilityWindow: {
    start: string; // ISO date
    end: string; // ISO date
  };
  stock?: number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LineSheet {
  id: string;
  partnerId: string;
  name: string;
  productIds: string[];
  priceTier?: PriceTier;
  availabilityWindow: {
    start: string;
    end: string;
  };
  markets: string[]; // country codes
  shareToken?: string;
  visibility: 'private' | 'public';
  createdAt: string;
  status: 'active' | 'expired' | 'draft';
}

export type OrderStatus = 
  | 'submitted' 
  | 'in_review' 
  | 'approved' 
  | 'rejected' 
  | 'fulfillment' 
  | 'shipped' 
  | 'closed';

export type RFQStatus = 
  | 'pending' 
  | 'negotiation' 
  | 'accepted' 
  | 'declined';

export interface SizeQuantity {
  size: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  sku: string;
  title: string;
  variant?: string;
  quantity: number;
  pricePerUnit: number;
  subtotal: number;
  image?: string;
  sizeBreakdown?: SizeQuantity[]; // For apparel with size-based ordering
}

export interface ShowroomOrder {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerCompany: string;
  partnerId: string;
  partnerName: string;
  type: 'po' | 'rfq';
  status: OrderStatus | RFQStatus;
  items: OrderItem[];
  subtotal: number;
  shippingTerms: string;
  requestedDeliveryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  shipmentId?: string; // Delivery note ID when shipped
  shipment?: {
    carrier: string;
    trackingNumber: string;
    shippedDate: string;
    estimatedDelivery: string;
  };
}

export interface ShowroomMessage {
  id: string;
  threadId: string; // orderId
  author: string;
  authorRole: 'buyer' | 'partner';
  body: string;
  attachments?: string[];
  createdAt: string;
}

export interface CartItem {
  productId: string;
  sku: string;
  title: string;
  variant?: string;
  quantity: number;
  pricePerUnit: number;
  image?: string;
  partnerId: string;
  partnerName: string;
  moq: number;
  sizeBreakdown?: SizeQuantity[]; // For apparel with size-based ordering
}

export interface ShowroomCart {
  id: string;
  buyerId: string;
  items: CartItem[];
  updatedAt: string;
}

export interface ShowroomAnalytics {
  views: number;
  productDetailViews: number;
  addToCart: number;
  rfqSubmitted: number;
  poSubmitted: number;
  conversionRate: number;
  topProducts: Array<{ productId: string; title: string; views: number }>;
  topCategories: Array<{ category: string; views: number }>;
}

export interface CatalogImportMapping {
  sourceColumn: string;
  targetField: string;
}

export interface ImportValidationError {
  row: number;
  column: string;
  value: string;
  error: string;
}
