import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { Product, Category, User, Order, Coupon, Blog, Banner, WebSettings, Address, Review } from "../types.js";

// Initialize Supabase configuration and clients
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;


const TMP_DB_FILE = "/tmp/database-store.json";
const LOCAL_DB_FILE = path.join(process.cwd(), "database-store.json");

interface DBStructure {
  users: User[];
  userPasswords: Record<string, string>; // Maps userId to hashed password
  products: Product[];
  categories: Category[];
  orders: Order[];
  coupons: Coupon[];
  blogs: Blog[];
  banners: Banner[];
  settings: WebSettings;
}

// Initial seed data with premium products for Bangladesh
const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Electronics", slug: "electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80", icon: "Tv" },
  { id: "cat-2", name: "Smart Gadgets", slug: "smart-gadgets", image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80", icon: "Cpu" },
  { id: "cat-3", name: "Smart Watches", slug: "smart-watches", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80", icon: "Watch" },
  { id: "cat-4", name: "Mobile Accessories", slug: "mobile-accessories", image: "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=500&q=80", icon: "Smartphone" },
  { id: "cat-5", name: "Home Appliances", slug: "home-appliances", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&q=80", icon: "Home" },
  { id: "cat-6", name: "Fashion Products", slug: "fashion", image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500&q=80", icon: "Shirt" },
  { id: "cat-7", name: "Beauty & Lifestyle", slug: "beauty-lifestyle", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80", icon: "Sparkles" },
  { id: "cat-8", name: "Gaming & Computer Accessories", slug: "gaming-computer", image: "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=500&q=80", icon: "Gamepad" }
];

const DEFAULT_SETTINGS: WebSettings = {
  siteName: "ARA Mart",
  contactEmail: "support@aramart.com.bd",
  contactPhone: "+880 1609-181280",
  address: "House 25, Road 11, Banani, Dhaka, Bangladesh",
  insideDhakaShipping: 60,
  outsideDhakaShipping: 120,
  expressShippingMarkup: 50,
  taxPercentage: 5,
  freeShippingThreshold: 5000,
  whatsappNumber: "+8801609181280",
  messengerUrl: "https://m.me/aramart.bd"
};

const DEFAULT_COUPONS: Coupon[] = [
  { id: "cp-1", code: "ARA20", discountType: "Percentage", discountValue: 20, minPurchase: 1000, expiryDate: "2027-12-31", isActive: true },
  { id: "cp-2", code: "EID500", discountType: "Fixed", discountValue: 500, minPurchase: 4000, expiryDate: "2027-12-31", isActive: true },
  { id: "cp-3", code: "FREESHIP", discountType: "Percentage", discountValue: 0, minPurchase: 2000, expiryDate: "2027-12-31", isActive: true }
];

const DEFAULT_BANNERS: Banner[] = [
  {
    id: "b-1",
    title: "UP TO 40% OFF",
    subtitle: "Premium Smart Watches & Sport Fitness Trackers",
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=1200&q=80",
    link: "smart-watches",
    badge: "Exclusive Flagship Release"
  },
  {
    id: "b-2",
    title: "EID SPECIAL SALE",
    subtitle: "Modern Kitchen Appliances & Elegant Home Furnishings",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&q=80",
    link: "home-appliances",
    badge: "Limited Stock Deals"
  },
  {
    id: "b-3",
    title: "NEXT GEN GAMING",
    subtitle: "Custom Mechanical Keyboards, Studio Mics & Audio gear",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80",
    link: "gaming-computer",
    badge: "Level Up Accessories"
  }
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "p-1",
    name: "Amoled Active 3 Pro Smartwatch",
    description: "The Amoled Active 3 Pro is a luxury smartwatch customized with dynamic watch faces, 24/7 blood oxygen tracking, active sleep staging, stress telemetry, and up to 14 days of standalone battery life. Elegant brushed aviation-grade metal frame with responsive haptic crown. Engineered for high performance.",
    shortDescription: "Premium AMOLED 2.0-inch display smartwatch with heart, SpO2 tracking and calls.",
    category: "Smart Watches",
    brand: "XTouch",
    sku: "ARA-SW-AMOLED3",
    productCode: "1001",
    stockQuantity: 45,
    images: [
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&q=80",
      "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500&q=80"
    ],
    gallery: [
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&q=80",
      "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500&q=80"
    ],
    colorVariations: ["Carbon Black", "Milky Silver", "Sunset Gold"],
    sizeVariations: ["42mm", "46mm"],
    regularPrice: 4200,
    salePrice: 3800,
    discountPercentage: 10,
    rating: 4.8,
    reviews: [
      { id: "rev-1", userName: "Kazi Sazzad", rating: 5, comment: "Awesome AMOLED screen and great battery life. Highly recommended inside Dhaka!", createdAt: "2026-05-15" },
      { id: "rev-2", userName: "Aisha Rahman", rating: 4, comment: "Very stylish, works well with iOS. Took 2 days to get delivered.", createdAt: "2026-05-20" }
    ],
    featured: true,
    flashSale: true,
    createdAt: "2026-01-10"
  },
  {
    id: "p-2",
    name: "Anker Soundcore Space One ANC",
    description: "Immerse yourself in acoustic brilliance. The Soundcore Space One blocks out ambient noise up to 98% with an adaptive ANC processor. Hi-Res Audio certified with customized LCP drivers, LDAC high fidelity stream, and a massive 50-hour playback index. Premium leather ear-cups.",
    shortDescription: "Hi-Res Over-Ear Hybrid Active Noise Cancelling Headphones with 50-hour battery life.",
    category: "Electronics",
    brand: "Anker",
    sku: "ARA-HD-ANKER-S1",
    productCode: "1002",
    stockQuantity: 18,
    images: [
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&q=80"
    ],
    gallery: [
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&q=80"
    ],
    colorVariations: ["Matte Black", "Arctic White", "Space Blue"],
    regularPrice: 9500,
    salePrice: 8200,
    discountPercentage: 14,
    rating: 4.9,
    reviews: [
      { id: "rev-3", userName: "Nabil Khan", rating: 5, comment: "Heavy bass and pure noiseless travel. Authentic product and fast shipping.", createdAt: "2026-05-12" }
    ],
    featured: true,
    flashSale: false,
    createdAt: "2026-01-15"
  },
  {
    id: "p-3",
    name: "K88 Dual-Engine RGB Gaming Mechanical Keyboard",
    description: "A gorgeous, ergonomic 75% mechanical layout featuring hot-swappable yellow linear switches, sound-dampening high density foams, double-shot PBT custom keycaps, and mesmerizing customized RGB lighting templates. Responsive dual volume knobs.",
    shortDescription: "Hot-swappable linear mechanical gaming keyboard with customizable dynamic RGB.",
    category: "Gaming & Computer Accessories",
    brand: "Redragon",
    sku: "ARA-KB-K88",
    productCode: "1003",
    stockQuantity: 12,
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80",
      "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80"
    ],
    gallery: [],
    colorVariations: ["Slate Gray", "Vibrant Cyan"],
    regularPrice: 5500,
    salePrice: 4500,
    discountPercentage: 18,
    rating: 4.7,
    reviews: [],
    featured: true,
    flashSale: true,
    createdAt: "2026-02-02"
  },
  {
    id: "p-4",
    name: "Anker 65W GaNPrime 3-Port Wall Charger",
    description: "Power all devices at lightning speed. Anker GaNPrime features two USB-C ports and one USB-A port with PowerIQ 4.0 intelligent allocation metrics. Up to 65W total capability, designed with multiple layers of heat protection system.",
    shortDescription: "Ultra-compact travel wall charger with 65W GaN prime quick charge capabilities.",
    category: "Mobile Accessories",
    brand: "Anker",
    sku: "ARA-CH-GAN65",
    productCode: "1004",
    stockQuantity: 80,
    images: [
      "https://images.unsplash.com/photo-1624456113123-14901625fcca?w=500&q=80"
    ],
    gallery: [],
    colorVariations: ["Dark Gray", "Frost White"],
    regularPrice: 4500,
    salePrice: 3950,
    discountPercentage: 12,
    rating: 4.8,
    reviews: [
      { id: "rev-4", userName: "Tanzim Hasan", rating: 5, comment: "Charges my Macbook Air and phone at the same time perfectly. Authentic!", createdAt: "2026-05-28" }
    ],
    featured: false,
    flashSale: true,
    createdAt: "2026-02-18"
  },
  {
    id: "p-5",
    name: "Aesthetic Smart Air Fryer 4.5L",
    description: "Enjoy crispy gold dishes healthily with up to 90% less oil. Styled in gorgeous minimal glassmorphism, featuring double heating elements, 8 standard quick-cook programs, and smart heat-circulating fans. Completely stainless steel food basket.",
    shortDescription: "Sleek 4.5L low calorie air fryer with smart touch panel and glass viewing window.",
    category: "Home Appliances",
    brand: "Midea",
    sku: "ARA-KP-FRYER45",
    productCode: "1005",
    stockQuantity: 25,
    images: [
      "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=500&q=80"
    ],
    gallery: [],
    colorVariations: ["Emerald Green", "Glacier White", "Onyx Black"],
    regularPrice: 12500,
    salePrice: 9900,
    discountPercentage: 20,
    rating: 4.6,
    reviews: [
      { id: "rev-5", userName: "Mrs. Halder", rating: 4, comment: "Chicken fries are great, no oil required. Basket is easy to wash.", createdAt: "2026-04-10" }
    ],
    featured: true,
    flashSale: false,
    createdAt: "2026-03-01"
  },
  {
    id: "p-6",
    name: "Luxury Premium Silk Kurti for Women",
    description: "Made with authentic Bangladeshi raw georgette and silk blends. Handcrafted golden thread work design along the neck and sleeve, styled with a modern tailored cut. Light, airy, and stunningly gorgeous for festivals and wedding receptions.",
    shortDescription: "Premium handcrafted silk tunic dress for girls with gorgeous golden design work.",
    category: "Fashion Products",
    brand: "Deccani Heritage",
    sku: "ARA-FA-KURTI",
    productCode: "1006",
    stockQuantity: 15,
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80"
    ],
    gallery: [],
    colorVariations: ["Crimson Red", "Royal Blue", "Forest Jade"],
    sizeVariations: ["S", "M", "L", "XL"],
    regularPrice: 3800,
    salePrice: 2950,
    discountPercentage: 22,
    rating: 4.5,
    reviews: [],
    featured: false,
    flashSale: true,
    createdAt: "2026-03-12"
  },
  {
    id: "p-7",
    name: "Organic Vitamin C Serum 30ml",
    description: "Achieve radiant skin naturally. Infused with 20% pure Active Vitamin C, hyaluronic acid complexes, and cold-pressed botanical oils. Helps to clear spots, boost collagen, and nourish deep dermal barrier interfaces. Hypoallergenic.",
    shortDescription: "Radiant anti-aging face glow serum with 20% Vitamin C and hyaluronic hydration.",
    category: "Beauty & Lifestyle",
    brand: "GlowNatural",
    sku: "ARA-BY-VITC30",
    productCode: "1007",
    stockQuantity: 120,
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80"
    ],
    gallery: [],
    colorVariations: ["Default Glass"],
    regularPrice: 1800,
    salePrice: 1350,
    discountPercentage: 25,
    rating: 4.7,
    reviews: [
      { id: "rev-6", userName: "Tasfia Islam", rating: 5, comment: "I have sensitive skin and this didn't cause breakouts. Skin looks glowing!", createdAt: "2026-05-18" }
    ],
    featured: false,
    flashSale: true,
    createdAt: "2026-04-05"
  },
  {
    id: "p-8",
    name: "Ultra Precision Pixart 3395 Wireless Gaming Mouse",
    description: "Designed for esports legends. The absolute peak performance gaming companion featuring Pixart 3395 optical tracker, 26,000 DPI metric index, solid 1000Hz polling rate, and ultra lightweight 54g honeycomb chassis. Tri-mode support: 2.4G, Bluetooth & USB-C.",
    shortDescription: "Ultra-lightweight 54g tri-mode gaming mouse with high-tier 26K DPI optical tracker.",
    category: "Gaming & Computer Accessories",
    brand: "Fantech",
    sku: "ARA-MS-P3395",
    productCode: "1008",
    stockQuantity: 30,
    images: [
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80"
    ],
    gallery: [],
    colorVariations: ["Cyber White", "Phantom Black"],
    regularPrice: 4200,
    salePrice: 3600,
    discountPercentage: 14,
    rating: 4.9,
    reviews: [],
    featured: true,
    flashSale: false,
    createdAt: "2026-04-12"
  },
  {
    id: "p-9",
    name: "JBL Charge 5 Speaker",
    description: "Powerful JBL Original Pro Sound with its optimized long excursion driver, separate tweeter and dual pumping JBL bass radiators. Up to 20 hours of playtime and a handy built-in powerbank to keep your devices charged.",
    shortDescription: "IP67 waterproof portable speaker with rich bass and integrated powerbank.",
    category: "Electronics",
    brand: "JBL",
    sku: "ARA-EL-JBLC5",
    productCode: "1009",
    stockQuantity: 22,
    images: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80"
    ],
    gallery: [],
    colorVariations: ["Mineral Blue", "Forest Green", "Squad Camo"],
    regularPrice: 17500,
    salePrice: 15800,
    discountPercentage: 10,
    rating: 4.8,
    reviews: [],
    featured: false,
    flashSale: false,
    createdAt: "2026-04-18"
  },
  {
    id: "p-10",
    name: "Xiaomi Smart Projector 2",
    description: "Your portable home theater up to 120-inch screen size. Supports multi-angle auto-keystone correction, crystal clear 1080p resolution, and built-in Android TV with Google Assistant. Highly compact design.",
    shortDescription: "1080p portable mini smart projector with Android TV and dolby audio.",
    category: "Smart Gadgets",
    brand: "Xiaomi",
    sku: "ARA-SG-XMIPR2",
    productCode: "1010",
    stockQuantity: 15,
    images: [
      "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=500&q=80"
    ],
    gallery: [],
    colorVariations: ["Glacier White"],
    regularPrice: 48000,
    salePrice: 42500,
    discountPercentage: 11,
    rating: 4.7,
    reviews: [],
    featured: true,
    flashSale: true,
    createdAt: "2026-05-01"
  },
  {
    id: "p-11",
    name: "Realme Smart Body Composition Scale",
    description: "Keep track of your health indices with 16 comprehensive health measurements including body fat percentage, muscle mass, BMI, and heart rate. Equipped with high-precision BIA sensors and Realme Link app sync.",
    shortDescription: "Smart health analyzer scale with 16 measurements and heart rate index.",
    category: "Smart Gadgets",
    brand: "Realme",
    sku: "ARA-SG-RMSCALE",
    productCode: "1011",
    stockQuantity: 35,
    images: [
      "https://images.unsplash.com/photo-1574269661728-790be978a310?w=500&q=80"
    ],
    gallery: [],
    colorVariations: ["Pearl White", "Midnight Blue"],
    regularPrice: 3200,
    salePrice: 2450,
    discountPercentage: 23,
    rating: 4.6,
    reviews: [],
    featured: false,
    flashSale: false,
    createdAt: "2026-05-05"
  },
  {
    id: "p-12",
    name: "boAt Wave Call Smartwatch",
    description: "Stay connected always. Wave Call features a 1.69-inch HD curved screen, advanced Bluetooth calling with a dedicated dial pad, 150+ watch faces, and multi-sport tracking interfaces with up to 10 days of standby battery.",
    shortDescription: "1.69-inch HD display fitness smartwatch with advanced Bluetooth calling.",
    category: "Smart Watches",
    brand: "boAt",
    sku: "ARA-SW-WAVECALL",
    productCode: "1012",
    stockQuantity: 40,
    images: [
      "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=500&q=80"
    ],
    gallery: [],
    colorVariations: ["Active Black", "Deep Blue", "Cherry Blossom"],
    regularPrice: 2600,
    salePrice: 1990,
    discountPercentage: 23,
    rating: 4.5,
    reviews: [],
    featured: false,
    flashSale: false,
    createdAt: "2026-05-10"
  },
  {
    id: "p-13",
    name: "Ugreen Nexode 100W 4-Port Charger",
    description: "The ultimate power hub for your desk. Features 3 USB-C and 1 USB-A ports to charge 4 devices simultaneously in compact GaN tech. Intelligently matches exact device power indices up to 100W.",
    shortDescription: "4-Port GaN fast desktop wall charger for laptops and phones.",
    category: "Mobile Accessories",
    brand: "Ugreen",
    sku: "ARA-MA-UG100W",
    productCode: "1013",
    stockQuantity: 50,
    images: [
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&q=80"
    ],
    gallery: [],
    colorVariations: ["Space Gray"],
    regularPrice: 5800,
    salePrice: 4800,
    discountPercentage: 17,
    rating: 4.8,
    reviews: [],
    featured: false,
    flashSale: true,
    createdAt: "2026-04-25"
  },
  {
    id: "p-14",
    name: "Philips Pro Essential Airfryer",
    description: "Healthy frying with Rapid Air technology. Deliciously crispy fries with up to 90% less fat. Features a 4.1L capacity basket, easy manual temperature/timer settings, and dish-washer safe removable parts.",
    shortDescription: "Philips 4.1L high-performance convection airfryer with sleek interface.",
    category: "Home Appliances",
    brand: "Philips",
    sku: "ARA-HA-PHIL92",
    productCode: "1014",
    stockQuantity: 15,
    images: [
      "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=500&q=80"
    ],
    gallery: [],
    colorVariations: ["Ink Black"],
    regularPrice: 15500,
    salePrice: 13200,
    discountPercentage: 14,
    rating: 4.7,
    reviews: [],
    featured: false,
    flashSale: false,
    createdAt: "2026-03-25"
  },
  {
    id: "p-15",
    name: "Handcrafted Premium Cotton Panjabi",
    description: "Made from 100% fine Egyptian cotton with intricate designer embroidery on the collar and placket. Relaxed, classic silhouette tailored for comfort and absolute elegance on Eid, family gatherings, and traditional events.",
    shortDescription: "Elegant 100% Egyptian cotton designer Panjabi for Men.",
    category: "Fashion Products",
    brand: "ARA Crafts",
    sku: "ARA-FA-PANJABI",
    productCode: "1015",
    stockQuantity: 25,
    images: [
      "https://images.unsplash.com/photo-1623847796338-04fcd2796e62?w=500&q=80"
    ],
    gallery: [],
    colorVariations: ["Pure Ivory", "Deep Obsidian", "Midnight Navy"],
    sizeVariations: ["40", "42", "44", "46"],
    regularPrice: 4500,
    salePrice: 3450,
    discountPercentage: 23,
    rating: 4.7,
    reviews: [],
    featured: true,
    flashSale: true,
    createdAt: "2026-05-18"
  },
  {
    id: "p-16",
    name: "CeraVe Hydrating Facial Cleanser",
    description: "A unique formula with three essential ceramides and hyaluronic acid that cleanses, hydrates, and helps restore the protective skin barrier. Non-foaming, gentle face wash developed with top dermatologists.",
    shortDescription: "Moisturizing daily face wash for normal to dry skin with essential ceramides.",
    category: "Beauty & Lifestyle",
    brand: "CeraVe",
    sku: "ARA-BL-CERAVE-HYD",
    productCode: "1016",
    stockQuantity: 85,
    images: [
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&q=80"
    ],
    gallery: [],
    colorVariations: ["Default"],
    regularPrice: 2200,
    salePrice: 1850,
    discountPercentage: 15,
    rating: 4.9,
    reviews: [],
    featured: false,
    flashSale: false,
    createdAt: "2026-05-12"
  },
  {
    id: "p-17",
    name: "HyperX Cloud III Wired Headset",
    description: "Signature HyperX comfort meets legendary audio execution. Redesigned 53mm angled drivers for immersive spatial audio indices, soft memory foam leatherette ear pads, and ultra-clear detachable mic with noise-cancelling.",
    shortDescription: "High fidelity gaming headphones with metal frame comfort and crystal mic.",
    category: "Gaming & Computer Accessories",
    brand: "HyperX",
    sku: "ARA-GA-HYPERX3",
    productCode: "1017",
    stockQuantity: 20,
    images: [
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500&q=80"
    ],
    gallery: [],
    colorVariations: ["Black-Red", "All Black"],
    regularPrice: 9500,
    salePrice: 8800,
    discountPercentage: 7,
    rating: 4.8,
    reviews: [],
    featured: false,
    flashSale: false,
    createdAt: "2026-05-22"
  }
];

const DEFAULT_BLOGS: Blog[] = [
  {
    id: "b-1",
    title: "How to Choose the Best Smartwatch in Bangladesh (2026 Guide)",
    slug: "choose-best-smartwatch-bangladesh",
    summary: "A complete analysis of smartwatches evaluating display panels, oxygen tracking limits, battery longevity, and local pricing trends in Dhaka.",
    content: "When selecting a smartwatch in 2026, buyers are overwhelmed by options. Here are key criteria you must inspect:\n\n1. Display Quality: Always look for AMOLED displays for outdoor visibility under the heavy Bangladeshi sun. Cheap LCDs won't be readable in hot daylight.\n\n2. Health Sensors: Ensure SpO2 and Heart Rate monitors support actual organic light diagnostics rather than simulated data loops.\n\n3. Battery Lifespan: A reliable smartwatch should at least deliver 7-10 days of continuous operation to avoid daily charging hassles.\n\nWe outline top recommendations for budgets from 2,000 BDT to 10,000 BDT in our store catalogues.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    author: "Rafsan",
    tags: ["Smart Watches", "Tech Guide", "Bangladesh Tech"],
    createdAt: "2026-05-02"
  },
  {
    id: "b-2",
    title: "Why Air Fryers are Becoming the Star Accessory in Bangladeshi Kitchens",
    slug: "air-fryer-trend-bangladesh-kitchens",
    summary: "Discover how low-oil cooking is transforming traditional snacks like shingaras and begunis into heart-healthy bites.",
    content: "Bangladeshi diets love deep-fried delicacies. However, escalating cardiac lifestyle concerns and high cooking oil costs have fueled a massive transition to dynamic Air Fryers.\n\nUnder heated convection cycles, air fryers toast traditional foods using 90% less oil. We outline how to make crispy beguni and traditional samosas inside our custom 4.5L Smart Air Fryer seamlessly.",
    image: "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=800&q=80",
    author: "Mrs. Halder",
    tags: ["Home Appliances", "Healthy Lifestyle", "Kitchen Tips"],
    createdAt: "2026-05-20"
  }
];

// Load current DB from database-store.json or build seeds
function initializeDB(): DBStructure {
  try {
    if (fs.existsSync(TMP_DB_FILE)) {
      const content = fs.readFileSync(TMP_DB_FILE, "utf-8");
      return JSON.parse(content);
    }
    if (fs.existsSync(LOCAL_DB_FILE)) {
      const content = fs.readFileSync(LOCAL_DB_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.error("DB File loading failed, rebuilding seeds.", e);
  }

  // Create Seed state
  const salt = bcrypt.genSaltSync(10);
  const hashedAdminPassword = bcrypt.hashSync("Rafsan725@#", salt);
  const hashedCustomerPassword = bcrypt.hashSync("customer123", salt);

  const testCustomer: User = {
    id: "u-customer",
    username: "RafsanCustomer",
    email: "customer@aramart.com",
    role: "customer",
    phone: "+8801912111222",
    verified: true,
    addresses: [
      {
        id: "addr-1",
        label: "Home",
        fullName: "Rafsan Rahman",
        phone: "+8801912111222",
        district: "Dhaka",
        addressLine: "Flat B2, House 10, Road 4, Dhanmondi, Dhaka"
      }
    ],
    createdAt: new Date().toISOString()
  };

  const db: DBStructure = {
    users: [
      {
        id: "u-admin",
        username: "RafsanAdmin",
        email: "admin@aramart.com",
        role: "admin",
        phone: "+8801712725725",
        verified: true,
        addresses: [],
        createdAt: new Date().toISOString()
      },
      testCustomer
    ],
    userPasswords: {
      "u-admin": hashedAdminPassword,
      "u-customer": hashedCustomerPassword
    },
    products: DEFAULT_PRODUCTS,
    categories: DEFAULT_CATEGORIES,
    orders: [
      {
        id: "ord-1001",
        userId: "u-customer",
        customerName: "Rafsan Rahman",
        customerEmail: "customer@aramart.com",
        phone: "+8801912111222",
        address: "Flat B2, House 10, Road 4, Dhanmondi, Dhaka",
        district: "Dhaka",
        shippingMethod: "Standard",
        items: [
          {
            id: "oi-1",
            productId: "p-1",
            name: "Amoled Active 3 Pro Smartwatch",
            image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&q=80",
            price: 3800,
            quantity: 1,
            color: "Carbon Black",
            size: "46mm"
          }
        ],
        paymentMethod: "bKash",
        paymentStatus: "Paid",
        paymentDetails: {
          txID: "BKASH_TXID_8741A9S",
          phoneNumber: "+8801912111222"
        },
        shippingCharge: 60,
        tax: 190,
        discountAmount: 0,
        regularTotal: 3800,
        total: 4050,
        status: "Processing",
        trackingCode: "ARA-TRK-784112",
        estimatedDelivery: "2026-06-08",
        invoiceNumber: "INV-2026-0001",
        createdAt: "2026-06-04T12:00:00Z"
      }
    ],
    coupons: DEFAULT_COUPONS,
    blogs: DEFAULT_BLOGS,
    banners: DEFAULT_BANNERS,
    settings: DEFAULT_SETTINGS
  };

  saveDB(db);
  return db;
}

function saveDB(db: DBStructure) {
  try {
    fs.writeFileSync(TMP_DB_FILE, JSON.stringify(db, null, 2), "utf-8");
    if (process.env.NODE_ENV !== "production") {
      try {
        fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(db, null, 2), "utf-8");
      } catch (err) {
        // Ignored
      }
    }
  } catch (e) {
    console.error("Failed to commit transactional state to disk", e);
  }
}

// Instantiate singleton database store
const state = initializeDB();

// Dynamic background seeding if Supabase is connected
if (supabase) {
  (async () => {
    try {
      console.log("[ARA Mart] Checking Supabase database seeding...");
      
      // Seed Settings
      try {
        const { data: setRow } = await supabase.from("settings").select("id").eq("id", "default").maybeSingle();
        if (!setRow) {
          console.log("[ARA Mart] Seeding default settings into Supabase...");
          await supabase.from("settings").insert({
            id: "default",
            site_name: DEFAULT_SETTINGS.siteName,
            contact_email: DEFAULT_SETTINGS.contactEmail,
            contact_phone: DEFAULT_SETTINGS.contactPhone,
            address: DEFAULT_SETTINGS.address,
            inside_dhaka_shipping: DEFAULT_SETTINGS.insideDhakaShipping,
            outside_dhaka_shipping: DEFAULT_SETTINGS.outsideDhakaShipping,
            express_shipping_markup: DEFAULT_SETTINGS.expressShippingMarkup,
            tax_percentage: DEFAULT_SETTINGS.taxPercentage,
            free_shipping_threshold: DEFAULT_SETTINGS.freeShippingThreshold,
            whatsapp_number: DEFAULT_SETTINGS.whatsappNumber,
            messenger_url: DEFAULT_SETTINGS.messengerUrl
          });
        }
      } catch (e) {
        console.warn("[ARA Mart] Settings seeding bypassed", e);
      }

      // Seed Users
      try {
        const { count: userCount } = await supabase.from("users").select("id", { count: "exact", head: true });
        if (userCount === 0) {
          console.log("[ARA Mart] Seeding default users into Supabase...");
          for (const u of state.users) {
            const passHash = state.userPasswords[u.id] || "";
            await supabase.from("users").insert({
              id: u.id,
              name: u.username,
              email: u.email,
              password: passHash,
              role: u.role,
              phone: u.phone || "",
              verified: !!u.verified,
              addresses: u.addresses || [],
              created_at: u.createdAt
            });
          }
        }
      } catch (e) {
        console.warn("[ARA Mart] Users seeding bypassed", e);
      }

      // Seed Products
      try {
        const { count: prodCount } = await supabase.from("products").select("id", { count: "exact", head: true });
        if (prodCount === 0) {
          console.log("[ARA Mart] Seeding default products into Supabase...");
          for (const p of DEFAULT_PRODUCTS) {
            await supabase.from("products").insert({
              id: p.id,
              name: p.name,
              price: p.salePrice,
              category: p.category,
              image: p.images[0] || "",
              stock: p.stockQuantity,
              description: p.description,
              short_description: p.shortDescription || "",
              brand: p.brand,
              sku: p.sku,
              product_code: p.productCode,
              images: p.images,
              gallery: p.gallery || [],
              color_variations: p.colorVariations || [],
              size_variations: p.sizeVariations || [],
              regular_price: p.regularPrice,
              discount_percentage: p.discountPercentage,
              rating: p.rating,
              reviews: p.reviews,
              featured: !!p.featured,
              flash_sale: !!p.flashSale,
              created_at: p.createdAt
            });
          }
        }
      } catch (e) {
        console.warn("[ARA Mart] Products seeding bypassed", e);
      }

      // Seed Categories
      try {
        const { count: catCount } = await supabase.from("categories").select("id", { count: "exact", head: true });
        if (catCount === 0) {
          console.log("[ARA Mart] Seeding default categories into Supabase...");
          for (const c of DEFAULT_CATEGORIES) {
            await supabase.from("categories").insert(c);
          }
        }
      } catch (e) {
        console.warn("[ARA Mart] Categories seeding bypassed", e);
      }

      // Seed Coupons
      try {
        const { count: couponCount } = await supabase.from("coupons").select("id", { count: "exact", head: true });
        if (couponCount === 0) {
          console.log("[ARA Mart] Seeding default coupons into Supabase...");
          for (const cp of DEFAULT_COUPONS) {
            await supabase.from("coupons").insert({
              id: cp.id,
              code: cp.code,
              discount_type: cp.discountType,
              discount_value: cp.discountValue,
              min_purchase: cp.minPurchase,
              expiry_date: cp.expiryDate,
              is_active: cp.isActive
            });
          }
        }
      } catch (e) {
        console.warn("[ARA Mart] Coupons seeding bypassed", e);
      }

      // Seed Banners
      try {
        const { count: bannerCount } = await supabase.from("banners").select("id", { count: "exact", head: true });
        if (bannerCount === 0) {
          console.log("[ARA Mart] Seeding default banners into Supabase...");
          for (const b of DEFAULT_BANNERS) {
            await supabase.from("banners").insert(b);
          }
        }
      } catch (e) {
        console.warn("[ARA Mart] Banners seeding bypassed", e);
      }

      // Seed Blogs
      try {
        const { count: blogCount } = await supabase.from("blogs").select("id", { count: "exact", head: true });
        if (blogCount === 0) {
          console.log("[ARA Mart] Seeding default blogs into Supabase...");
          for (const b of DEFAULT_BLOGS) {
            await supabase.from("blogs").insert({
              id: b.id,
              title: b.title,
              slug: b.slug,
              summary: b.summary,
              content: b.content,
              image: b.image,
              author: b.author,
              tags: b.tags,
              created_at: b.createdAt
            });
          }
        }
      } catch (e) {
        console.warn("[ARA Mart] Blogs seeding bypassed", e);
      }

      console.log("[ARA Mart] Supabase seeding check completed!");
    } catch (err) {
      console.error("[ARA Mart] Supabase background seeding check failed:", err);
    }
  })();
}

export const Database = {
  // Config state
  getSettings: async (): Promise<WebSettings> => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from("settings").select("*").eq("id", "default").maybeSingle();
        if (data && !error) {
          return {
            siteName: data.site_name,
            contactEmail: data.contact_email,
            contactPhone: data.contact_phone,
            address: data.address,
            insideDhakaShipping: Number(data.inside_dhaka_shipping),
            outsideDhakaShipping: Number(data.outside_dhaka_shipping),
            expressShippingMarkup: Number(data.express_shipping_markup),
            taxPercentage: Number(data.tax_percentage),
            freeShippingThreshold: Number(data.free_shipping_threshold),
            whatsappNumber: data.whatsapp_number,
            messengerUrl: data.messenger_url
          };
        }
      } catch (e) {
        console.error("Failed to fetch settings from Supabase, returning state fallback", e);
      }
    }
    return state.settings;
  },
  updateSettings: async (newSettings: Partial<WebSettings>): Promise<WebSettings> => {
    if (supabase) {
      try {
        const mapped: any = {};
        if (newSettings.siteName !== undefined) mapped.site_name = newSettings.siteName;
        if (newSettings.contactEmail !== undefined) mapped.contact_email = newSettings.contactEmail;
        if (newSettings.contactPhone !== undefined) mapped.contact_phone = newSettings.contactPhone;
        if (newSettings.address !== undefined) mapped.address = newSettings.address;
        if (newSettings.insideDhakaShipping !== undefined) mapped.inside_dhaka_shipping = newSettings.insideDhakaShipping;
        if (newSettings.outsideDhakaShipping !== undefined) mapped.outside_dhaka_shipping = newSettings.outsideDhakaShipping;
        if (newSettings.expressShippingMarkup !== undefined) mapped.express_shipping_markup = newSettings.expressShippingMarkup;
        if (newSettings.taxPercentage !== undefined) mapped.tax_percentage = newSettings.taxPercentage;
        if (newSettings.freeShippingThreshold !== undefined) mapped.free_shipping_threshold = newSettings.freeShippingThreshold;
        if (newSettings.whatsappNumber !== undefined) mapped.whatsapp_number = newSettings.whatsappNumber;
        if (newSettings.messengerUrl !== undefined) mapped.messenger_url = newSettings.messengerUrl;

        await supabase.from("settings").update(mapped).eq("id", "default");
      } catch (e) {
        console.error("Failed to save settings updates to Supabase", e);
      }
    }
    state.settings = { ...state.settings, ...newSettings };
    saveDB(state);
    return state.settings;
  },

  // Auth & users
  getUsers: async (): Promise<User[]> => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from("users").select("*");
        if (data && !error) {
          return data.map((u: any) => ({
            id: u.id,
            username: u.name,
            email: u.email,
            role: u.role,
            phone: u.phone || "",
            verified: !!u.verified,
            addresses: Array.isArray(u.addresses) ? u.addresses : (typeof u.addresses === "string" ? JSON.parse(u.addresses) : []),
            createdAt: u.created_at
          }));
        }
      } catch (e) {
        console.error("Failed to query users from Supabase", e);
      }
    }
    return state.users;
  },
  getUserById: async (id: string): Promise<User | undefined> => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from("users").select("*").eq("id", id).maybeSingle();
        if (data && !error) {
          return {
            id: data.id,
            username: data.name,
            email: data.email,
            role: data.role,
            phone: data.phone || "",
            verified: !!data.verified,
            addresses: Array.isArray(data.addresses) ? data.addresses : (typeof data.addresses === "string" ? JSON.parse(data.addresses) : []),
            createdAt: data.created_at
          };
        }
      } catch (e) {
        console.error("Failed to query user by id from Supabase", e);
      }
    }
    return state.users.find((u) => u.id === id);
  },
  getUserByUsernameOrEmail: async (login: string): Promise<User | undefined> => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .or(`name.ilike."${login}",email.ilike."${login}"`)
          .maybeSingle();
        if (data && !error) {
          return {
            id: data.id,
            username: data.name,
            email: data.email,
            role: data.role,
            phone: data.phone || "",
            verified: !!data.verified,
            addresses: Array.isArray(data.addresses) ? data.addresses : (typeof data.addresses === "string" ? JSON.parse(data.addresses) : []),
            createdAt: data.created_at
          };
        }
      } catch (e) {
        console.error("Failed to query user by email/username from Supabase", e);
      }
    }
    return state.users.find(
      (u) => u.username.toLowerCase() === login.toLowerCase() || u.email.toLowerCase() === login.toLowerCase()
    );
  },
  getPasswordHash: async (userId: string): Promise<string | undefined> => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from("users").select("password").eq("id", userId).maybeSingle();
        if (data && !error) {
          return data.password;
        }
      } catch (e) {
        console.error("Failed to query password hash from Supabase", e);
      }
    }
    return state.userPasswords[userId];
  },
  createUser: async (user: Omit<User, "id" | "createdAt">, passwordHash: string): Promise<User> => {
    const newId = "u-" + Math.random().toString(36).substring(2, 9);
    const createdAt = new Date().toISOString();
    const fullUser: User = {
      ...user,
      id: newId,
      createdAt
    };
    if (supabase) {
      try {
        await supabase.from("users").insert({
          id: newId,
          name: user.username,
          email: user.email,
          password: passwordHash,
          role: user.role,
          phone: user.phone || "",
          verified: !!user.verified,
          addresses: user.addresses || [],
          created_at: createdAt
        });
      } catch (e) {
        console.error("Failed to save and register user to Supabase", e);
      }
    }
    state.users.push(fullUser);
    state.userPasswords[newId] = passwordHash;
    saveDB(state);
    return fullUser;
  },
  updateUserAddresses: async (userId: string, addresses: Address[]): Promise<User | undefined> => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from("users").update({ addresses }).eq("id", userId).select().maybeSingle();
        if (data && !error) {
          return {
            id: data.id,
            username: data.name,
            email: data.email,
            role: data.role,
            phone: data.phone || "",
            verified: !!data.verified,
            addresses: Array.isArray(data.addresses) ? data.addresses : (typeof data.addresses === "string" ? JSON.parse(data.addresses) : []),
            createdAt: data.created_at
          };
        }
      } catch (e) {
        console.error("Failed to save addresses back to Supabase", e);
      }
    }
    const user = state.users.find((u) => u.id === userId);
    if (user) {
      user.addresses = addresses;
      saveDB(state);
      return user;
    }
    return undefined;
  },
  updateUserProfile: async (userId: string, update: { username?: string, phone?: string }): Promise<User | undefined> => {
    if (supabase) {
      try {
        const m: any = {};
        if (update.username !== undefined) m.name = update.username;
        if (update.phone !== undefined) m.phone = update.phone;
        const { data, error } = await supabase.from("users").update(m).eq("id", userId).select().maybeSingle();
        if (data && !error) {
          return {
            id: data.id,
            username: data.name,
            email: data.email,
            role: data.role,
            phone: data.phone || "",
            verified: !!data.verified,
            addresses: Array.isArray(data.addresses) ? data.addresses : (typeof data.addresses === "string" ? JSON.parse(data.addresses) : []),
            createdAt: data.created_at
          };
        }
      } catch (e) {
        console.error("Failed to update profile to Supabase", e);
      }
    }
    const user = state.users.find((u) => u.id === userId);
    if (user) {
      if (update.username) user.username = update.username;
      if (update.phone) user.phone = update.phone;
      saveDB(state);
      return user;
    }
    return undefined;
  },

  // Products
  getProducts: async (): Promise<Product[]> => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from("products").select("*");
        if (data && !error) {
          return data.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description || "",
            shortDescription: p.short_description || "",
            category: p.category || "",
            brand: p.brand || "",
            sku: p.sku || "",
            productCode: p.product_code || "",
            stockQuantity: Number(p.stock !== undefined ? p.stock : (p.stock_quantity || 0)),
            images: Array.isArray(p.images) ? p.images : (typeof p.images === "string" ? JSON.parse(p.images) : (p.image ? [p.image] : [])),
            gallery: Array.isArray(p.gallery) ? p.gallery : (typeof p.gallery === "string" ? JSON.parse(p.gallery) : []),
            colorVariations: Array.isArray(p.color_variations) ? p.color_variations : (typeof p.color_variations === "string" ? JSON.parse(p.color_variations) : []),
            sizeVariations: Array.isArray(p.size_variations) ? p.size_variations : (typeof p.size_variations === "string" ? JSON.parse(p.size_variations) : []),
            regularPrice: Number(p.regular_price || p.price || 0),
            salePrice: Number(p.price || 0),
            discountPercentage: Number(p.discount_percentage || 0),
            rating: Number(p.rating || 5.0),
            reviews: Array.isArray(p.reviews) ? p.reviews : (typeof p.reviews === "string" ? JSON.parse(p.reviews) : []),
            featured: !!p.featured,
            flashSale: !!p.flash_sale,
            createdAt: p.created_at || new Date().toISOString()
          }));
        }
      } catch (e) {
        console.error("Failed to fetch products list from Supabase", e);
      }
    }
    return state.products;
  },
  getProductById: async (id: string): Promise<Product | undefined> => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
        if (data && !error) {
          return {
            id: data.id,
            name: data.name,
            description: data.description || "",
            shortDescription: data.short_description || "",
            category: data.category || "",
            brand: data.brand || "",
            sku: data.sku || "",
            productCode: data.product_code || "",
            stockQuantity: Number(data.stock !== undefined ? data.stock : (data.stock_quantity || 0)),
            images: Array.isArray(data.images) ? data.images : (typeof data.images === "string" ? JSON.parse(data.images) : (data.image ? [data.image] : [])),
            gallery: Array.isArray(data.gallery) ? data.gallery : (typeof data.gallery === "string" ? JSON.parse(data.gallery) : []),
            colorVariations: Array.isArray(data.color_variations) ? data.color_variations : (typeof data.color_variations === "string" ? JSON.parse(data.color_variations) : []),
            sizeVariations: Array.isArray(data.size_variations) ? data.size_variations : (typeof data.size_variations === "string" ? JSON.parse(data.size_variations) : []),
            regularPrice: Number(data.regular_price || data.price || 0),
            salePrice: Number(data.price || 0),
            discountPercentage: Number(data.discount_percentage || 0),
            rating: Number(data.rating || 5.0),
            reviews: Array.isArray(data.reviews) ? data.reviews : (typeof data.reviews === "string" ? JSON.parse(data.reviews) : []),
            featured: !!data.featured,
            flashSale: !!data.flash_sale,
            createdAt: data.created_at || new Date().toISOString()
          };
        }
      } catch (e) {
        console.error("Failed to fetch product detail from Supabase", e);
      }
    }
    return state.products.find((p) => p.id === id);
  },
  createProduct: async (product: Omit<Product, "id" | "createdAt">): Promise<Product> => {
    const newId = "p-" + Math.random().toString(36).substring(2, 9);
    const createdAt = new Date().toISOString();
    const fullProduct: Product = {
      ...product,
      id: newId,
      createdAt
    };
    if (supabase) {
      try {
        await supabase.from("products").insert({
          id: newId,
          name: product.name,
          price: product.salePrice,
          category: product.category,
          image: product.images[0] || "",
          stock: product.stockQuantity,
          description: product.description || "",
          short_description: product.shortDescription || "",
          brand: product.brand,
          sku: product.sku,
          product_code: product.productCode,
          images: product.images,
          gallery: product.gallery || [],
          color_variations: product.colorVariations || [],
          size_variations: product.sizeVariations || [],
          regular_price: product.regularPrice,
          discount_percentage: product.discountPercentage,
          rating: product.rating || 5.0,
          reviews: product.reviews || [],
          featured: !!product.featured,
          flash_sale: !!product.flashSale,
          created_at: createdAt
        });
      } catch (e) {
        console.error("Failed to insert product into Supabase", e);
      }
    }
    state.products.push(fullProduct);
    saveDB(state);
    return fullProduct;
  },
  updateProduct: async (id: string, updated: Partial<Product>): Promise<Product | undefined> => {
    if (supabase) {
      try {
        const mapped: any = {};
        if (updated.name !== undefined) mapped.name = updated.name;
        if (updated.salePrice !== undefined) mapped.price = updated.salePrice;
        if (updated.category !== undefined) mapped.category = updated.category;
        if (updated.images !== undefined) {
          mapped.images = updated.images;
          mapped.image = updated.images[0] || "";
        }
        if (updated.stockQuantity !== undefined) mapped.stock = updated.stockQuantity;
        if (updated.description !== undefined) mapped.description = updated.description;
        if (updated.shortDescription !== undefined) mapped.short_description = updated.shortDescription;
        if (updated.brand !== undefined) mapped.brand = updated.brand;
        if (updated.sku !== undefined) mapped.sku = updated.sku;
        if (updated.productCode !== undefined) mapped.product_code = updated.productCode;
        if (updated.gallery !== undefined) mapped.gallery = updated.gallery;
        if (updated.colorVariations !== undefined) mapped.color_variations = updated.colorVariations;
        if (updated.sizeVariations !== undefined) mapped.size_variations = updated.sizeVariations;
        if (updated.regularPrice !== undefined) mapped.regular_price = updated.regularPrice;
        if (updated.discountPercentage !== undefined) mapped.discount_percentage = updated.discountPercentage;
        if (updated.rating !== undefined) mapped.rating = updated.rating;
        if (updated.reviews !== undefined) mapped.reviews = updated.reviews;
        if (updated.featured !== undefined) mapped.featured = !!updated.featured;
        if (updated.flashSale !== undefined) mapped.flash_sale = !!updated.flashSale;

        await supabase.from("products").update(mapped).eq("id", id);
      } catch (e) {
        console.error("Failed to update product in Supabase", e);
      }
    }
    const index = state.products.findIndex((p) => p.id === id);
    if (index !== -1) {
      state.products[index] = { ...state.products[index], ...updated } as Product;
      saveDB(state);
      return state.products[index];
    }
    return undefined;
  },
  deleteProduct: async (id: string): Promise<boolean> => {
    if (supabase) {
      try {
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (!error) {
          state.products = state.products.filter((p) => p.id !== id);
          saveDB(state);
          return true;
        }
      } catch (e) {
        console.error("Failed to delete product in Supabase", e);
      }
    }
    const initLength = state.products.length;
    state.products = state.products.filter((p) => p.id !== id);
    const deleted = state.products.length < initLength;
    if (deleted) saveDB(state);
    return deleted;
  },
  addReviewToProduct: async (productId: string, review: Omit<Review, "id" | "createdAt">): Promise<Product | undefined> => {
    const product = await Database.getProductById(productId);
    if (product) {
      const fullReview: Review = {
        ...review,
        id: "rev-" + Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString().split("T")[0]
      };
      const updatedReviews = [...product.reviews, fullReview];
      const sum = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
      const rating = parseFloat((sum / updatedReviews.length).toFixed(1));

      await Database.updateProduct(productId, {
        reviews: updatedReviews,
        rating
      });

      return await Database.getProductById(productId);
    }
    return undefined;
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from("categories").select("*");
        if (data && !error) {
          return data;
        }
      } catch (e) {
        console.error("Failed to fetch product categories list from Supabase", e);
      }
    }
    return state.categories;
  },
  createCategory: async (cat: Omit<Category, "id">): Promise<Category> => {
    const newId = "cat-" + Math.random().toString(36).substring(2, 9);
    const fullCat: Category = { ...cat, id: newId };
    if (supabase) {
      try {
        await supabase.from("categories").insert(fullCat);
      } catch (e) {
        console.error("Failed to insert category into Supabase", e);
      }
    }
    state.categories.push(fullCat);
    saveDB(state);
    return fullCat;
  },
  deleteCategory: async (id: string): Promise<boolean> => {
    if (supabase) {
      try {
        const { error } = await supabase.from("categories").delete().eq("id", id);
        if (!error) {
          state.categories = state.categories.filter((c) => c.id !== id);
          saveDB(state);
          return true;
        }
      } catch (e) {
        console.error("Failed to delete category in Supabase", e);
      }
    }
    const initLength = state.categories.length;
    state.categories = state.categories.filter((c) => c.id !== id);
    const deleted = state.categories.length < initLength;
    if (deleted) saveDB(state);
    return deleted;
  },

  // Orders
  getOrders: async (): Promise<Order[]> => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from("orders").select("*");
        if (data && !error) {
          return data.map((o: any) => ({
            id: o.id,
            userId: o.user_id,
            customerName: o.customer_name,
            customerEmail: o.customer_email,
            phone: o.phone,
            address: o.address,
            district: o.district,
            shippingMethod: o.shipping_method,
            items: Array.isArray(o.items) ? o.items : (typeof o.items === "string" ? JSON.parse(o.items) : []),
            paymentMethod: o.payment_method,
            paymentStatus: o.payment_status,
            paymentDetails: typeof o.payment_details === "string" ? JSON.parse(o.payment_details) : (o.payment_details || {}),
            shippingCharge: Number(o.shipping_charge || 0),
            tax: Number(o.tax || 0),
            discountAmount: Number(o.discount_amount || 0),
            regularTotal: Number(o.regular_total || 0),
            total: Number(o.total || 0),
            status: o.status,
            trackingCode: o.tracking_code,
            estimatedDelivery: o.estimated_delivery,
            invoiceNumber: o.invoice_number,
            createdAt: o.created_at || new Date().toISOString()
          }));
        }
      } catch (e) {
        console.error("Failed to retrieve order logs from Supabase", e);
      }
    }
    return state.orders;
  },
  getOrderById: async (id: string): Promise<Order | undefined> => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .or(`id.eq."${id}",tracking_code.eq."${id}"`)
          .maybeSingle();
        if (data && !error) {
          return {
            id: data.id,
            userId: data.user_id,
            customerName: data.customer_name,
            customerEmail: data.customer_email,
            phone: data.phone,
            address: data.address,
            district: data.district,
            shippingMethod: data.shipping_method,
            items: Array.isArray(data.items) ? data.items : (typeof data.items === "string" ? JSON.parse(data.items) : []),
            paymentMethod: data.payment_method,
            paymentStatus: data.payment_status,
            paymentDetails: typeof data.payment_details === "string" ? JSON.parse(data.payment_details) : (data.payment_details || {}),
            shippingCharge: Number(data.shipping_charge || 0),
            tax: Number(data.tax || 0),
            discountAmount: Number(data.discount_amount || 0),
            regularTotal: Number(data.regular_total || 0),
            total: Number(data.total || 0),
            status: data.status,
            trackingCode: data.tracking_code,
            estimatedDelivery: data.estimated_delivery,
            invoiceNumber: data.invoice_number,
            createdAt: data.created_at || new Date().toISOString()
          };
        }
      } catch (e) {
        console.error("Failed to retrieve order detail from Supabase", e);
      }
    }
    return state.orders.find((o) => o.id === id || o.trackingCode === id);
  },
  getOrdersByUser: async (userId: string): Promise<Order[]> => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from("orders").select("*").eq("user_id", userId);
        if (data && !error) {
          return data.map((o: any) => ({
            id: o.id,
            userId: o.user_id,
            customerName: o.customer_name,
            customerEmail: o.customer_email,
            phone: o.phone,
            address: o.address,
            district: o.district,
            shippingMethod: o.shipping_method,
            items: Array.isArray(o.items) ? o.items : (typeof o.items === "string" ? JSON.parse(o.items) : []),
            paymentMethod: o.payment_method,
            paymentStatus: o.payment_status,
            paymentDetails: typeof o.payment_details === "string" ? JSON.parse(o.payment_details) : (o.payment_details || {}),
            shippingCharge: Number(o.shipping_charge || 0),
            tax: Number(o.tax || 0),
            discountAmount: Number(o.discount_amount || 0),
            regularTotal: Number(o.regular_total || 0),
            total: Number(o.total || 0),
            status: o.status,
            trackingCode: o.tracking_code,
            estimatedDelivery: o.estimated_delivery,
            invoiceNumber: o.invoice_number,
            createdAt: o.created_at || new Date().toISOString()
          }));
        }
      } catch (e) {
        console.error("Failed to query user order log from Supabase", e);
      }
    }
    return state.orders.filter((o) => o.userId === userId);
  },
  createOrder: async (order: Omit<Order, "id" | "trackingCode" | "invoiceNumber" | "createdAt">): Promise<Order> => {
    const num = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ord-${num}`;
    const invoiceNumber = `INV-2026-${num}`;
    const trackingCode = `ARA-TRK-${Math.floor(100000 + Math.random() * 900000)}`;
    const createdAt = new Date().toISOString();

    const fullOrder: Order = {
      ...order,
      id: orderId,
      invoiceNumber,
      trackingCode,
      createdAt
    };

    // Deduct inventory stock securely inside transactional engine
    for (const item of fullOrder.items) {
      const prod = await Database.getProductById(item.productId);
      if (prod) {
        const newStock = Math.max(0, prod.stockQuantity - item.quantity);
        await Database.updateProduct(item.productId, { stockQuantity: newStock });
      }
    }

    if (supabase) {
      try {
        await supabase.from("orders").insert({
          id: orderId,
          user_id: order.userId,
          customer_name: order.customerName,
          customer_email: order.customerEmail,
          phone: order.phone,
          address: order.address,
          district: order.district,
          shipping_method: order.shippingMethod,
          items: order.items,
          payment_method: order.paymentMethod,
          payment_status: order.paymentStatus,
          payment_details: order.paymentDetails || {},
          shipping_charge: order.shippingCharge,
          tax: order.tax,
          discount_amount: order.discountAmount,
          regular_total: order.regularTotal,
          total: order.total,
          status: "Pending",
          tracking_code: trackingCode,
          estimated_delivery: order.estimatedDelivery,
          invoice_number: invoiceNumber,
          created_at: createdAt
        });
      } catch (e) {
        console.error("Failed to create checkout order ledger on Supabase", e);
      }
    }

    state.orders.push(fullOrder);
    saveDB(state);
    return fullOrder;
  },
  updateOrderStatus: async (id: string, status: Order["status"], paymentStatus?: Order["paymentStatus"]): Promise<Order | undefined> => {
    if (supabase) {
      try {
        const mapped: any = { status };
        if (paymentStatus) {
          mapped.payment_status = paymentStatus;
        }
        await supabase.from("orders").update(mapped).eq("id", id);
      } catch (e) {
        console.error("Failed to push transactional status progression to Supabase", e);
      }
    }
    const order = state.orders.find((o) => o.id === id);
    if (order) {
      order.status = status;
      if (paymentStatus) {
        order.paymentStatus = paymentStatus;
      }
      saveDB(state);
      return order;
    }
    return undefined;
  },

  // Coupons
  getCoupons: async (): Promise<Coupon[]> => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from("coupons").select("*");
        if (data && !error) {
          return data.map((c: any) => ({
            id: c.id,
            code: c.code,
            discountType: c.discount_type,
            discountValue: Number(c.discount_value),
            minPurchase: Number(c.min_purchase),
            expiryDate: c.expiry_date,
            isActive: !!c.is_active
          }));
        }
      } catch (e) {
        console.error("Failed to pull active promotional coupons from Supabase", e);
      }
    }
    return state.coupons;
  },
  createCoupon: async (coupon: Omit<Coupon, "id">): Promise<Coupon> => {
    const newId = "cp-" + Math.random().toString(36).substring(2, 9);
    const fullCoupon: Coupon = { ...coupon, id: newId };
    if (supabase) {
      try {
        await supabase.from("coupons").insert({
          id: newId,
          code: coupon.code,
          discount_type: coupon.discountType,
          discount_value: coupon.discountValue,
          min_purchase: coupon.minPurchase,
          expiry_date: coupon.expiryDate,
          is_active: coupon.isActive
        });
      } catch (e) {
        console.error("Failed to seed and insert coupon ledger onto Supabase", e);
      }
    }
    state.coupons.push(fullCoupon);
    saveDB(state);
    return fullCoupon;
  },
  deleteCoupon: async (id: string): Promise<boolean> => {
    if (supabase) {
      try {
        const { error } = await supabase.from("coupons").delete().eq("id", id);
        if (!error) {
          state.coupons = state.coupons.filter((c) => c.id !== id);
          saveDB(state);
          return true;
        }
      } catch (e) {
        console.error("Failed to eliminate coupon record in Supabase", e);
      }
    }
    const initLength = state.coupons.length;
    state.coupons = state.coupons.filter((c) => c.id !== id);
    if (state.coupons.length < initLength) {
      saveDB(state);
      return true;
    }
    return false;
  },

  // Blogs
  getBlogs: async (): Promise<Blog[]> => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from("blogs").select("*");
        if (data && !error) {
          return data.map((b: any) => ({
            id: b.id,
            title: b.title,
            slug: b.slug,
            summary: b.summary || "",
            content: b.content,
            image: b.image || "",
            author: b.author || "",
            tags: Array.isArray(b.tags) ? b.tags : (typeof b.tags === "string" ? JSON.parse(b.tags) : []),
            createdAt: b.created_at || new Date().toISOString()
          }));
        }
      } catch (e) {
        console.error("Failed to load blog roll from Supabase", e);
      }
    }
    return state.blogs;
  },
  createBlog: async (blog: Omit<Blog, "id" | "slug" | "createdAt">): Promise<Blog> => {
    const newId = "b-" + Math.random().toString(36).substring(2, 9);
    const slug = blog.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const createdAt = new Date().toISOString().split("T")[0];
    const fullBlog: Blog = {
      ...blog,
      id: newId,
      slug,
      createdAt
    };
    if (supabase) {
      try {
        await supabase.from("blogs").insert({
          id: newId,
          title: blog.title,
          slug,
          summary: blog.summary,
          content: blog.content,
          image: blog.image,
          author: blog.author,
          tags: blog.tags,
          created_at: createdAt
        });
      } catch (e) {
        console.error("Failed to load news article onto Supabase systems", e);
      }
    }
    state.blogs.push(fullBlog);
    saveDB(state);
    return fullBlog;
  },
  deleteBlog: async (id: string): Promise<boolean> => {
    if (supabase) {
      try {
        const { error } = await supabase.from("blogs").delete().eq("id", id);
        if (!error) {
          state.blogs = state.blogs.filter((b) => b.id !== id);
          saveDB(state);
          return true;
        }
      } catch (e) {
        console.error("Failed to delete blog reference in Supabase", e);
      }
    }
    const initLen = state.blogs.length;
    state.blogs = state.blogs.filter((b) => b.id !== id);
    if (state.blogs.length < initLen) {
      saveDB(state);
      return true;
    }
    return false;
  },

  // Banners
  getBanners: async (): Promise<Banner[]> => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from("banners").select("*");
        if (data && !error) {
          return data;
        }
      } catch (e) {
        console.error("Failed to queries banner slide elements on Supabase system", e);
      }
    }
    return state.banners;
  },
  createBanner: async (b: Omit<Banner, "id">): Promise<Banner> => {
    const newId = "b-" + Math.random().toString(36).substring(2, 9);
    const fullBanner: Banner = { ...b, id: newId };
    if (supabase) {
      try {
        await supabase.from("banners").insert(fullBanner);
      } catch (e) {
        console.error("Failed to create and save banner into Supabase", e);
      }
    }
    state.banners.push(fullBanner);
    saveDB(state);
    return fullBanner;
  },
  deleteBanner: async (id: string): Promise<boolean> => {
    if (supabase) {
      try {
        const { error } = await supabase.from("banners").delete().eq("id", id);
        if (!error) {
          state.banners = state.banners.filter((b) => b.id !== id);
          saveDB(state);
          return true;
        }
      } catch (e) {
        console.error("Failed to delete banner slide from Supabase", e);
      }
    }
    const init = state.banners.length;
    state.banners = state.banners.filter((b) => b.id !== id);
    if (state.banners.length < init) {
      saveDB(state);
      return true;
    }
    return false;
  },
  resetDB: async (): Promise<any> => {
    try {
      if (fs.existsSync(TMP_DB_FILE)) {
        fs.unlinkSync(TMP_DB_FILE);
      }
      if (fs.existsSync(LOCAL_DB_FILE)) {
        fs.unlinkSync(LOCAL_DB_FILE);
      }
    } catch (e) {
      console.error("Failed to delete DB file", e);
    }
    if (supabase) {
      try {
        await supabase.from("orders").delete().neq("id", "");
        await supabase.from("products").delete().neq("id", "");
        await supabase.from("users").delete().neq("id", "");
        await supabase.from("categories").delete().neq("id", "");
        await supabase.from("coupons").delete().neq("id", "");
        await supabase.from("banners").delete().neq("id", "");
        await supabase.from("blogs").delete().neq("id", "");
        await supabase.from("settings").delete().eq("id", "default");
      } catch (err) {
        console.error("Failed to wipe Supabase database on reset request", err);
      }
    }
    const freshState = initializeDB();
    Object.keys(state).forEach((key) => {
      delete (state as any)[key];
    });
    Object.assign(state, freshState);
    return state;
  }
};

