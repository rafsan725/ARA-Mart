import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initial seed data with premium products for Bangladesh
const DEFAULT_CATEGORIES = [
  { id: "cat-1", name: "Electronics", slug: "electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80", icon: "Tv" },
  { id: "cat-2", name: "Smart Gadgets", slug: "smart-gadgets", image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80", icon: "Cpu" },
  { id: "cat-3", name: "Smart Watches", slug: "smart-watches", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80", icon: "Watch" },
  { id: "cat-4", name: "Mobile Accessories", slug: "mobile-accessories", image: "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=500&q=80", icon: "Smartphone" },
  { id: "cat-5", name: "Home Appliances", slug: "home-appliances", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&q=80", icon: "Home" },
  { id: "cat-6", name: "Fashion Products", slug: "fashion", image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500&q=80", icon: "Shirt" },
  { id: "cat-7", name: "Beauty & Lifestyle", slug: "beauty-lifestyle", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80", icon: "Sparkles" },
  { id: "cat-8", name: "Gaming & Computer Accessories", slug: "gaming-computer", image: "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=500&q=80", icon: "Gamepad" }
];

const DEFAULT_SETTINGS = {
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

const DEFAULT_COUPONS = [
  { id: "cp-1", code: "ARA20", discountType: "Percentage", discountValue: 20, minPurchase: 1000, expiryDate: "2027-12-31", isActive: true },
  { id: "cp-2", code: "EID500", discountType: "Fixed", discountValue: 500, minPurchase: 4000, expiryDate: "2027-12-31", isActive: true },
  { id: "cp-3", code: "FREESHIP", discountType: "Percentage", discountValue: 0, minPurchase: 2000, expiryDate: "2027-12-31", isActive: true }
];

const DEFAULT_BANNERS = [
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

const DEFAULT_PRODUCTS = [
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

const DEFAULT_BLOGS = [
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

const salt = bcrypt.genSaltSync(10);
const hashedAdminPassword = bcrypt.hashSync("Rafsan725@#", salt);
const hashedCustomerPassword = bcrypt.hashSync("customer123", salt);

const DEFAULT_USERS = [
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
  {
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
  }
];

async function seed() {
  console.log("Starting full database clear and seeding process...");

  // Clear existing to avoid primary key conflicts
  const tablesToClear = ["settings", "users", "products", "categories", "coupons", "banners", "blogs"];
  for (const table of tablesToClear) {
    console.log(`Clearing table: ${table}...`);
    try {
      const { error } = await supabase.from(table).delete().neq("id", "");
      if (error) {
        console.warn(`Non-blocking warning clearing ${table}:`, error.message);
      } else {
        console.log(`Cleaned table ${table} successfully.`);
      }
    } catch (e: any) {
      console.warn(`Exception clearing table ${table}:`, e.message);
    }
  }

  // Insert Settings
  console.log("Seeding Settings...");
  try {
    const { error } = await supabase.from("settings").insert({
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
    if (error) console.error("Error seeding settings:", error);
    else console.log("Settings seeded successfully!");
  } catch (e) {
    console.error("Exception seeding settings:", e);
  }

  // Insert Users
  console.log("Seeding Users...");
  try {
    for (const u of DEFAULT_USERS) {
      const passHash = u.id === "u-admin" ? hashedAdminPassword : hashedCustomerPassword;
      const { error } = await supabase.from("users").insert({
        id: u.id,
        name: u.username,
        email: u.email,
        password: passHash,
        role: u.role,
        phone: u.phone,
        verified: u.verified,
        addresses: u.addresses,
        created_at: u.createdAt
      });
      if (error) console.error(`Error seeding user ${u.username}:`, error);
      else console.log(`User ${u.username} seeded successfully.`);
    }
  } catch (e) {
    console.error("Exception seeding users:", e);
  }

  // Insert Categories
  console.log("Seeding Categories...");
  try {
    const { error } = await supabase.from("categories").insert(DEFAULT_CATEGORIES);
    if (error) console.error("Error seeding categories:", error);
    else console.log("Categories seeded successfully!");
  } catch (e) {
    console.error("Exception seeding categories:", e);
  }

  // Insert Products
  console.log("Seeding Products...");
  try {
    for (const p of DEFAULT_PRODUCTS) {
      const { error } = await supabase.from("products").insert({
        id: p.id,
        name: p.name,
        price: p.salePrice,
        category: p.category,
        image: p.images[0] || "",
        stock: p.stockQuantity,
        description: p.description,
        short_description: p.shortDescription,
        brand: p.brand,
        sku: p.sku,
        product_code: p.productCode,
        images: p.images,
        gallery: p.gallery,
        color_variations: p.colorVariations,
        size_variations: p.sizeVariations || [],
        regular_price: p.regularPrice,
        discount_percentage: p.discountPercentage,
        rating: p.rating,
        reviews: p.reviews,
        featured: p.featured,
        flash_sale: p.flashSale,
        created_at: p.createdAt
      });
      if (error) console.error(`Error seeding product ${p.name}:`, error);
      else console.log(`Product ${p.name} seeded successfully.`);
    }
  } catch (e) {
    console.error("Exception seeding products:", e);
  }

  // Insert Coupons
  console.log("Seeding Coupons...");
  try {
    for (const cp of DEFAULT_COUPONS) {
      const { error } = await supabase.from("coupons").insert({
        id: cp.id,
        code: cp.code,
        discount_type: cp.discountType,
        discount_value: cp.discountValue,
        min_purchase: cp.minPurchase,
        expiry_date: cp.expiryDate,
        is_active: cp.isActive
      });
      if (error) console.error(`Error seeding coupon ${cp.code}:`, error);
      else console.log(`Coupon ${cp.code} seeded successfully.`);
    }
  } catch (e) {
    console.error("Exception seeding coupons:", e);
  }

  // Insert Banners
  console.log("Seeding Banners...");
  try {
    const { error } = await supabase.from("banners").insert(DEFAULT_BANNERS);
    if (error) console.error("Error seeding banners:", error);
    else console.log("Banners seeded successfully!");
  } catch (e) {
    console.error("Exception seeding banners:", e);
  }

  // Insert Blogs
  console.log("Seeding Blogs...");
  try {
    for (const b of DEFAULT_BLOGS) {
      const { error } = await supabase.from("blogs").insert({
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
      if (error) console.error(`Error seeding blog ${b.title}:`, error);
      else console.log(`Blog ${b.title} seeded successfully.`);
    }
  } catch (e) {
    console.error("Exception seeding blogs:", e);
  }

  console.log("=== SEED COMPLETE ===");
}

seed().then(() => {
  console.log("Done!");
  process.exit(0);
}).catch(err => {
  console.error("Fail:", err);
  process.exit(1);
});
