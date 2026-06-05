export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  category: string;
  brand: string;
  sku: string;
  productCode: string;
  stockQuantity: number;
  images: string[];
  gallery: string[];
  video?: string;
  colorVariations: string[];
  sizeVariations?: string[];
  storageVariations?: string[];
  regularPrice: number;
  salePrice: number;
  discountPercentage: number;
  rating: number;
  reviews: Review[];
  featured?: boolean;
  flashSale?: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  icon: string;
}

export interface Address {
  id: string;
  label: string; // e.g. "Home", "Office"
  fullName: string;
  phone: string;
  district: string;
  addressLine: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'customer';
  phone?: string;
  verified: boolean;
  addresses: Address[];
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
}

export interface Order {
  id: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  district: 'Dhaka' | 'Outside Dhaka';
  shippingMethod: 'Standard' | 'Express';
  items: OrderItem[];
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'Visa' | 'MasterCard' | 'COD';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  paymentDetails?: {
    txID?: string;
    phoneNumber?: string;
    senderNumber?: string;
    cardLast4?: string;
  };
  shippingCharge: number;
  tax: number;
  discountAmount: number;
  regularTotal: number;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  trackingCode: string;
  estimatedDelivery: string;
  invoiceNumber: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'Percentage' | 'Fixed';
  discountValue: number;
  minPurchase: number;
  expiryDate: string;
  isActive: boolean;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  image: string;
  author: string;
  tags: string[];
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  badge?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface WebSettings {
  siteName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  facebookUrl?: string;
  whatsappNumber?: string;
  messengerUrl?: string;
  insideDhakaShipping: number;
  outsideDhakaShipping: number;
  expressShippingMarkup: number;
  taxPercentage: number;
  freeShippingThreshold: number;
}
