/**
 * Highly Resilient Client-Side Fallback Database & API Simulation Router
 * Auto-activates on static environments like Netlify (*.netlify.app) or where the backend server is unreachable.
 */

import { Product, Category, User, Order, Coupon, Blog, Banner, WebSettings, Review, Address } from "../types";

const IS_BROWSER = typeof window !== "undefined";

// Key for local storage persistence
const DB_STORAGE_KEY = "ara_mart_simulated_db";
const CURRENT_USER_TOKEN_KEY = "ara_mart_token";

// Define the simulated schema
interface SimulatedDB {
  users: User[];
  userPasswords: Record<string, string>;
  products: Product[];
  categories: Category[];
  orders: Order[];
  coupons: Coupon[];
  blogs: Blog[];
  banners: Banner[];
  settings: WebSettings;
}

// Default backup data matching initial server db seeds
const SEED_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Electronics", slug: "electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80", icon: "Tv" },
  { id: "cat-2", name: "Smart Gadgets", slug: "smart-gadgets", image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80", icon: "Cpu" },
  { id: "cat-3", name: "Smart Watches", slug: "smart-watches", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80", icon: "Watch" },
  { id: "cat-4", name: "Mobile Accessories", slug: "mobile-accessories", image: "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=500&q=80", icon: "Smartphone" },
  { id: "cat-5", name: "Home Appliances", slug: "home-appliances", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&q=80", icon: "Home" },
  { id: "cat-6", name: "Fashion Products", slug: "fashion", image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500&q=80", icon: "Shirt" },
  { id: "cat-7", name: "Beauty & Lifestyle", slug: "beauty-lifestyle", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80", icon: "Sparkles" },
  { id: "cat-8", name: "Gaming & Computer Accessories", slug: "gaming-computer", image: "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=500&q=80", icon: "Gamepad" }
];

const SEED_SETTINGS: WebSettings = {
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

const SEED_COUPONS: Coupon[] = [
  { id: "cp-1", code: "ARA20", discountType: "Percentage", discountValue: 20, minPurchase: 1000, expiryDate: "2027-12-31", isActive: true },
  { id: "cp-2", code: "EID500", discountType: "Fixed", discountValue: 500, minPurchase: 4000, expiryDate: "2027-12-31", isActive: true },
  { id: "cp-3", code: "FREESHIP", discountType: "Percentage", discountValue: 0, minPurchase: 2000, expiryDate: "2027-12-31", isActive: true }
];

const SEED_BANNERS: Banner[] = [
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

const SEED_PRODUCTS: Product[] = [
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
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&q=80"
    ],
    colorVariations: ["Carbon Black", "Milky Silver", "Sunset Gold"],
    sizeVariations: ["42mm", "46mm"],
    regularPrice: 4200,
    salePrice: 3800,
    discountPercentage: 10,
    rating: 4.8,
    reviews: [
      { id: "rev-1", userName: "Kazi Sazzad", rating: 5, comment: "Awesome AMOLED screen and great battery life. Highly recommended!", createdAt: "2026-05-15" },
      { id: "rev-2", userName: "Aisha Rahman", rating: 4, comment: "Very stylish, works well with iOS. Highly satisfied.", createdAt: "2026-05-20" }
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
    name: "K88 Dual-Engine RGB Keyboard",
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
    name: "Anker 65W GaNPrime Charger",
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
      { id: "rev-4", userName: "Tanzim Hasan", rating: 5, comment: "Charges my Macbook perfectly.", createdAt: "2026-05-28" }
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
    stockQuantity: 15,
    images: [
      "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=500&q=80"
    ],
    gallery: [],
    colorVariations: ["Arctic White", "Graphene Matte"],
    regularPrice: 12500,
    salePrice: 10500,
    discountPercentage: 16,
    rating: 4.6,
    reviews: [
      { id: "rev-5", userName: "Subrina Yeasmin", rating: 4, comment: "Excellent air fryer. Made fully crispy beguni without any oil!", createdAt: "2026-05-29" }
    ],
    featured: true,
    flashSale: false,
    createdAt: "2026-03-01"
  }
];

const SEED_BLOGS: Blog[] = [
  {
    id: "blog-1",
    title: "Unboxing the Amoled Active 3 Pro: High-End Feature Breakdown",
    slug: "amoled-active-3-pro-full-breakdown",
    summary: "An immersive deep dive into the flagship Amoled smartwatch, evaluating wellness metrics and battery indexes.",
    content: "Our team tested the high performance Amoled Active smartwatch across dynamic stress tests. The results were outstanding. We deep-dive into the sensor telemetry and sleep cycling functionality below.",
    image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80",
    author: "Rafsan",
    tags: ["Smart Watches", "Tech Guide", "Bangladesh Tech"],
    createdAt: "2026-05-02"
  },
  {
    id: "blog-2",
    title: "Why Air Fryers are Becoming the Star Accessory in Bangladeshi Kitchens",
    slug: "air-fryer-trend-bangladesh-kitchens",
    summary: "Discover how low-oil cooking is transforming traditional snacks like shingaras and begunis into heart-healthy bites.",
    content: "Bangladeshi diets love deep-fried delicacies. Under convection cycles, air fryers toast traditional foods using 90% less oil. Perfect for samosas and shingaras.",
    image: "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=800&q=80",
    author: "Mrs. Halder",
    tags: ["Home Appliances", "Healthy Lifestyle", "Kitchen Tips"],
    createdAt: "2026-05-20"
  }
];

// Initialize the database with default structure and values
function getInitialDB(): SimulatedDB {
  return {
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
    ],
    userPasswords: {
      "u-admin": "Rafsan725@#",
      "u-customer": "customer123"
    },
    products: SEED_PRODUCTS,
    categories: SEED_CATEGORIES,
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
        status: "Delivered",
        trackingCode: "TRK605122501",
        estimatedDelivery: "2026-06-08",
        invoiceNumber: "INV-20260605-1001",
        createdAt: "2026-06-05T09:00:00Z"
      }
    ],
    coupons: SEED_COUPONS,
    blogs: SEED_BLOGS,
    banners: SEED_BANNERS,
    settings: SEED_SETTINGS
  };
}

// Global local database state manager
class StoreDBEngine {
  private state: SimulatedDB;

  constructor() {
    this.state = this.load();
  }

  private load(): SimulatedDB {
    if (!IS_BROWSER) return getInitialDB();
    const data = localStorage.getItem(DB_STORAGE_KEY);
    if (!data) {
      const initial = getInitialDB();
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(data);
    } catch {
      return getInitialDB();
    }
  }

  public save() {
    if (!IS_BROWSER) return;
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(this.state));
  }

  public reset() {
    this.state = getInitialDB();
    this.save();
  }

  // Getters
  public getProducts() { return this.state.products; }
  public getCategories() { return this.state.categories; }
  public getOrders() { return this.state.orders; }
  public getCoupons() { return this.state.coupons; }
  public getBlogs() { return this.state.blogs; }
  public getBanners() { return this.state.banners; }
  public getSettings() { return this.state.settings; }
  public getUsers() { return this.state.users; }

  // User auth helpers
  public findUserByLogin(login: string): User | undefined {
    const term = login.toLowerCase();
    return this.state.users.find(u => u.username.toLowerCase() === term || u.email.toLowerCase() === term);
  }

  public registerUser(user: Omit<User, "id" | "createdAt">, pass: string): User {
    const id = "u-" + Math.random().toString(36).substr(2, 9);
    const newUser: User = { ...user, id, createdAt: new Date().toISOString() };
    this.state.users.push(newUser);
    this.state.userPasswords[id] = pass;
    this.save();
    return newUser;
  }

  public getUserById(id: string) {
    return this.state.users.find(u => u.id === id);
  }

  public updateUserProfile(id: string, updates: { username: string; phone?: string }) {
    const user = this.getUserById(id);
    if (user) {
      user.username = updates.username;
      user.phone = updates.phone;
      this.save();
    }
    return user;
  }

  public updateUserAddresses(id: string, addresses: Address[]) {
    const user = this.getUserById(id);
    if (user) {
      user.addresses = addresses;
      this.save();
    }
    return user;
  }

  public getPassword(userId: string) {
    return this.state.userPasswords[userId];
  }

  // Admin and mutating utilities
  public updateSettings(settings: WebSettings) {
    this.state.settings = settings;
    this.save();
    return settings;
  }

  public createProduct(prod: Omit<Product, "id" | "createdAt" | "rating" | "reviews">) {
    const id = "p-" + Math.random().toString(36).substr(2, 9);
    const newProd: Product = {
      ...prod,
      id,
      rating: 5,
      reviews: [],
      createdAt: new Date().toISOString().split("T")[0]
    };
    this.state.products.push(newProd);
    this.save();
    return newProd;
  }

  public updateProduct(id: string, updates: Partial<Product>) {
    const index = this.state.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.state.products[index] = { ...this.state.products[index], ...updates };
      this.save();
      return this.state.products[index];
    }
    return null;
  }

  public deleteProduct(id: string) {
    const len = this.state.products.length;
    this.state.products = this.state.products.filter(p => p.id !== id);
    this.save();
    return this.state.products.length < len;
  }

  public addReview(productId: string, rev: Omit<Review, "id" | "createdAt">) {
    const prod = this.state.products.find(p => p.id === productId);
    if (prod) {
      const review: Review = {
        ...rev,
        id: "rev-" + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString().split("T")[0]
      };
      prod.reviews.push(review);
      // Recalc score
      const total = prod.reviews.reduce((sum, r) => sum + r.rating, 0);
      prod.rating = parseFloat((total / prod.reviews.length).toFixed(1));
      this.save();
      return prod;
    }
    return null;
  }

  public createCategory(cat: Omit<Category, "id">) {
    const id = "cat-" + Math.random().toString(36).substr(2, 9);
    const newCat = { ...cat, id };
    this.state.categories.push(newCat);
    this.save();
    return newCat;
  }

  public deleteCategory(id: string) {
    const len = this.state.categories.length;
    this.state.categories = this.state.categories.filter(c => c.id !== id);
    this.save();
    return this.state.categories.length < len;
  }

  public createCoupon(cp: Omit<Coupon, "id">) {
    const id = "cp-" + Math.random().toString(36).substr(2, 9);
    const newCp = { ...cp, id };
    this.state.coupons.push(newCp);
    this.save();
    return newCp;
  }

  public deleteCoupon(id: string) {
    const len = this.state.coupons.length;
    this.state.coupons = this.state.coupons.filter(c => c.id !== id);
    this.save();
    return this.state.coupons.length < len;
  }

  public createBlog(bl: Omit<Blog, "id" | "createdAt">) {
    const id = "blog-" + Math.random().toString(36).substr(2, 9);
    const newBl = { ...bl, id, createdAt: new Date().toISOString().split("T")[0] };
    this.state.blogs.push(newBl);
    this.save();
    return newBl;
  }

  public deleteBlog(id: string) {
    const len = this.state.blogs.length;
    this.state.blogs = this.state.blogs.filter(b => b.id !== id);
    this.save();
    return this.state.blogs.length < len;
  }

  public createOrder(ord: Omit<Order, "id" | "createdAt" | "status" | "trackingCode" | "estimatedDelivery" | "invoiceNumber">) {
    const idCode = Math.floor(1000 + Math.random() * 9000);
    const id = `ord-${idCode}`;
    const trackingCode = "TRK" + Date.now().toString().substr(-8) + Math.floor(10 + Math.random() * 90);
    const invoiceNumber = `INV-${new Date().toISOString().slice(0,10).replace(/-/g, "")}-${idCode}`;
    
    const settings = this.getSettings();
    const regularTotal = parseFloat((ord.regularTotal ?? 0).toString());
    const discountAmount = parseFloat((ord.discountAmount ?? 0).toString());
    
    let calculatedShippingCharge = ord.district === "Dhaka" ? settings.insideDhakaShipping : settings.outsideDhakaShipping;
    if (ord.shippingMethod === "Express") {
      calculatedShippingCharge += settings.expressShippingMarkup;
    }
    if (regularTotal >= settings.freeShippingThreshold) {
      calculatedShippingCharge = 0;
    }
    
    const calculatedTax = Math.round(regularTotal * (settings.taxPercentage / 100));
    const finalTotal = regularTotal + calculatedShippingCharge + calculatedTax - discountAmount;
    const paymentStatus = ord.paymentMethod === "COD" ? "Pending" : "Paid";
    
    const newOrder: Order = {
      ...ord,
      id,
      trackingCode,
      invoiceNumber,
      status: "Pending",
      paymentStatus: (ord as any).paymentStatus || paymentStatus,
      shippingCharge: (ord as any).shippingCharge !== undefined ? parseFloat((ord as any).shippingCharge) : calculatedShippingCharge,
      tax: (ord as any).tax !== undefined ? parseFloat((ord as any).tax) : calculatedTax,
      regularTotal: regularTotal,
      discountAmount: discountAmount,
      total: (ord as any).total !== undefined ? parseFloat((ord as any).total) : finalTotal,
      estimatedDelivery: (ord as any).estimatedDelivery || (ord.district === "Dhaka" ? "2-3 business days" : "4-6 business days"),
      createdAt: new Date().toISOString()
    };
    
    this.state.orders.push(newOrder);
    this.save();
    return newOrder;
  }

  public updateOrderStatus(id: string, status: Order["status"], paymentStatus?: Order["paymentStatus"]) {
    const order = this.state.orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      if (paymentStatus) {
        order.paymentStatus = paymentStatus;
      }
      this.save();
    }
    return order;
  }
}

// Instantiate active Db
const simulationDB = new StoreDBEngine();

// Simple mock token signing & payload retrieval helper
function createMockJWT(payload: { id: string; role: string; email: string }) {
  return "simulated-jwt-" + btoa(JSON.stringify(payload));
}

function verifyAndExtractToken(token: string): { id: string; role: string; email: string } | null {
  if (!token || !token.startsWith("Bearer simulated-jwt-")) return null;
  try {
    const raw = token.replace("Bearer simulated-jwt-", "");
    return JSON.parse(atob(raw));
  } catch {
    return null;
  }
}

// Mock Responses Maker
function makeResponse(data: any, status = 200): Response {
  const jsonString = JSON.stringify(data);
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => data,
    text: async () => jsonString,
    blob: async () => new Blob([jsonString]),
    clone: () => makeResponse(data, status)
  } as unknown as Response;
}

// Router interceptor logic
export async function simulateAPIRequest(url: string, init?: RequestInit): Promise<Response> {
  const method = init?.method?.toUpperCase() || "GET";
  const pathPart = url.split("?")[0];
  const queryPart = url.includes("?") ? url.split("?")[1] : "";

  // Parse authorization headers
  const authHeader = (init?.headers as any)?.["Authorization"] || (init?.headers as any)?.["authorization"];
  const userPayload = verifyAndExtractToken(authHeader);

  // Helper to parse JSON body
  let body: any = {};
  if (init?.body) {
    try {
      body = JSON.parse(init.body as string);
    } catch {
      body = {};
    }
  }

  // --- MOCK ROUTING ---

  // Health check
  if (pathPart.endsWith("/api/health")) {
    return makeResponse({ site: "ARA Mart Server (Simulated Fallback Mode)", status: "active", uptime: 100 });
  }

  // Auth: Register
  if (pathPart.endsWith("/api/auth/register") && method === "POST") {
    const { username, email, password, phone } = body;
    if (!username || !email || !password) {
      return makeResponse({ error: "Required fields vacant" }, 400);
    }
    const existing = simulationDB.findUserByLogin(username) || simulationDB.findUserByLogin(email);
    if (existing) {
      return makeResponse({ error: "Username or email registry conflicts exist" }, 400);
    }
    const newUser = simulationDB.registerUser({
      username,
      email,
      role: "customer",
      phone: phone || "",
      verified: true,
      addresses: []
    }, password);

    const token = createMockJWT({ id: newUser.id, role: newUser.role, email: newUser.email });
    return makeResponse({ token, user: newUser }, 200);
  }

  // Auth: Login
  if (pathPart.endsWith("/api/auth/login") && method === "POST") {
    const { login, password } = body;
    const user = simulationDB.findUserByLogin(login);
    if (!user) {
      return makeResponse({ error: "Invalid username, email or password inputs" }, 401);
    }
    const realPass = simulationDB.getPassword(user.id);
    if (realPass !== password) {
      return makeResponse({ error: "Invalid credentials specified" }, 401);
    }
    const token = createMockJWT({ id: user.id, role: user.role, email: user.email });
    return makeResponse({ token, user }, 200);
  }

  // Auth: Me
  if (pathPart.endsWith("/api/auth/me") && method === "GET") {
    if (!userPayload) {
      return makeResponse({ error: "Access token expired or unauthorized" }, 401);
    }
    const user = simulationDB.getUserById(userPayload.id);
    if (!user) return makeResponse({ error: "User profile metadata missing" }, 404);
    return makeResponse({ user }, 200);
  }

  // Auth: Update profile
  if (pathPart.endsWith("/api/auth/profile") && method === "PUT") {
    if (!userPayload) return makeResponse({ error: "Unauthorized" }, 401);
    const { username, phone } = body;
    const user = simulationDB.updateUserProfile(userPayload.id, { username, phone });
    if (!user) return makeResponse({ error: "Profile write error" }, 404);
    return makeResponse({ user, message: "Profile successfully modified" }, 200);
  }

  // Auth: Update addresses
  if (pathPart.endsWith("/api/auth/addresses") && method === "PUT") {
    if (!userPayload) return makeResponse({ error: "Unauthorized" }, 401);
    const { addresses } = body;
    const user = simulationDB.updateUserAddresses(userPayload.id, addresses);
    if (!user) return makeResponse({ error: "Addresses write error" }, 404);
    return makeResponse({ user, message: "Delivery addresses successfully committed" }, 200);
  }

  // Products: Get list and Filter
  if (pathPart.endsWith("/api/products") && method === "GET") {
    let list = [...simulationDB.getProducts()];
    
    // Parse query search filter
    const params = new URLSearchParams(queryPart);
    const cat = params.get("category");
    const brand = params.get("brand");
    const q = params.get("query")?.toLowerCase();
    const minPr = params.get("minPrice");
    const maxPr = params.get("maxPrice");
    const ratingLimit = params.get("rating");
    const sorting = params.get("sort");
    const limitLimit = params.get("limit");

    if (cat) {
      const filterCat = cat.toLowerCase();
      list = list.filter(p => {
        if (!p.category) return false;
        const cats = p.category.split(",").map(c => c.trim().toLowerCase());
        return cats.includes(filterCat);
      });
    }
    if (brand) {
      list = list.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
    }
    if (q) {
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }
    if (minPr) {
      list = list.filter(p => p.salePrice >= parseFloat(minPr));
    }
    if (maxPr) {
      list = list.filter(p => p.salePrice <= parseFloat(maxPr));
    }
    if (ratingLimit) {
      list = list.filter(p => p.rating >= parseFloat(ratingLimit));
    }

    if (sorting) {
      if (sorting === "price-asc") list.sort((a,b) => a.salePrice - b.salePrice);
      else if (sorting === "price-desc") list.sort((a,b) => b.salePrice - a.salePrice);
      else if (sorting === "rating") list.sort((a,b) => b.rating - a.rating);
      else if (sorting === "newest") list.sort((a,b) => b.id.localeCompare(a.id));
    }

    if (limitLimit) {
      list = list.slice(0, parseInt(limitLimit));
    }

    return makeResponse(list, 200);
  }

  // Product reviews
  const reviewMatch = pathPart.match(/\/api\/products\/([^/]+)\/review$/);
  if (reviewMatch && method === "POST") {
    const prodId = reviewMatch[1];
    const { userName, rating, comment } = body;
    const prod = simulationDB.addReview(prodId, { userName, rating: parseInt(rating), comment: comment || "" });
    if (!prod) return makeResponse({ error: "Product not located" }, 404);
    return makeResponse({ message: "Review registered successfully", product: prod }, 200);
  }

  // Categories
  if (pathPart.endsWith("/api/categories") && method === "GET") {
    return makeResponse(simulationDB.getCategories(), 200);
  }

  // Banners
  if (pathPart.endsWith("/api/banners") && method === "GET") {
    return makeResponse(simulationDB.getBanners(), 200);
  }

  // Settings
  if (pathPart.endsWith("/api/settings") && method === "GET") {
    return makeResponse(simulationDB.getSettings(), 200);
  }

  // Coupons
  if (pathPart.endsWith("/api/coupons") && method === "GET") {
    return makeResponse(simulationDB.getCoupons(), 200);
  }

  // Blogs
  if (pathPart.endsWith("/api/blogs") && method === "GET") {
    return makeResponse(simulationDB.getBlogs(), 200);
  }

  // Create Order
  if (pathPart.endsWith("/api/orders") && method === "POST") {
    const ord = simulationDB.createOrder(body);
    return makeResponse({ message: "Order placed successfully", order: ord }, 200);
  }

  // Track Order
  const trackMatch = pathPart.match(/\/api\/orders\/track\/([^/]+)$/);
  if (trackMatch && method === "GET") {
    const code = trackMatch[1];
    const order = simulationDB.getOrders().find(o => o.trackingCode === code || o.id === code);
    if (!order) return makeResponse({ error: "Order tracking records not identified" }, 404);
    return makeResponse(order, 200);
  }

  // User Orders
  const userOrdersMatch = pathPart.match(/\/api\/orders\/user\/([^/]+)$/);
  if (userOrdersMatch && method === "GET") {
    const userId = userOrdersMatch[1];
    const orders = simulationDB.getOrders().filter(o => o.userId === userId);
    return makeResponse(orders, 200);
  }

  // Photo Search mock
  if (pathPart.endsWith("/api/photo-search") && method === "POST") {
    // Just mock search and return 1-2 random products of interest
    const products = simulationDB.getProducts().slice(0, 2);
    return makeResponse({
      queryDetected: "Selected gadget style",
      products
    }, 200);
  }

  // ===================================
  // ADMIN SECURE ENDPOINTS
  // ===================================

  // Check admin role
  if (pathPart.includes("/api/admin")) {
    if (!userPayload || userPayload.role !== "admin") {
      return makeResponse({ error: "Administrative privilege required" }, 403);
    }
  }

  // Reset database simulation
  if (pathPart.endsWith("/api/admin/reset-db") && method === "POST") {
    simulationDB.reset();
    return makeResponse({ message: "Database reset to original seed data successfully completed" }, 200);
  }

  // Admin Dashboard info
  if (pathPart.endsWith("/api/admin/dashboard") && method === "GET") {
    const prods = simulationDB.getProducts();
    const ords = simulationDB.getOrders();
    const usrs = simulationDB.getUsers();

    const totalSales = ords.filter(o => o.paymentStatus === "Paid" || o.status === "Delivered").reduce((acc, o) => acc + o.total, 0);
    const totalRev = ords.filter(o => o.status !== "Cancelled").reduce((acc, o) => acc + o.total, 0);
    const lowStk = prods.filter(p => p.stockQuantity < 10);

    const salesHist = ords.map(o => ({
      date: o.createdAt.split("T")[0],
      amount: o.total
    }));

    return makeResponse({
      totals: {
        sales: totalSales,
        revenue: totalRev,
        customers: usrs.filter(u => u.role === "customer").length,
        orders: ords.length,
        products: prods.length
      },
      lowStock: lowStk,
      salesHistory: salesHist
    }, 200);
  }

  // Admin: Category Operations
  if (pathPart.endsWith("/api/admin/categories") && method === "POST") {
    const newCat = simulationDB.createCategory(body);
    return makeResponse({ message: "Added category successfully", category: newCat }, 200);
  }

  const deleteCategoryMatch = pathPart.match(/\/api\/admin\/categories\/([^/]+)$/);
  if (deleteCategoryMatch && method === "DELETE") {
    const success = simulationDB.deleteCategory(deleteCategoryMatch[1]);
    if (!success) return makeResponse({ error: "Category not located" }, 444);
    return makeResponse({ message: "Category deleted successfully" }, 200);
  }

  // Admin: Coupon Operations
  if (pathPart.endsWith("/api/admin/coupons") && method === "POST") {
    const newCp = simulationDB.createCoupon(body);
    return makeResponse({ message: "Coupon generated successfully", coupon: newCp }, 200);
  }

  const deleteCouponMatch = pathPart.match(/\/api\/admin\/coupons\/([^/]+)$/);
  if (deleteCouponMatch && method === "DELETE") {
    const success = simulationDB.deleteCoupon(deleteCouponMatch[1]);
    if (!success) return makeResponse({ error: "Coupon component missing" }, 444);
    return makeResponse({ message: "Coupon code destroyed" }, 200);
  }

  // Admin: Blog Operations
  if (pathPart.endsWith("/api/admin/blogs") && method === "POST") {
    const newBlog = simulationDB.createBlog(body);
    return makeResponse({ message: "Blog published successfully", blog: newBlog }, 200);
  }

  const deleteBlogMatch = pathPart.match(/\/api\/admin\/blogs\/([^/]+)$/);
  if (deleteBlogMatch && method === "DELETE") {
    const success = simulationDB.deleteBlog(deleteBlogMatch[1]);
    if (!success) return makeResponse({ error: "Blog item missing" }, 444);
    return makeResponse({ message: "Blog post removed" }, 200);
  }

  // Admin: Settings write
  if (pathPart.endsWith("/api/admin/settings") && (method === "POST" || method === "PUT")) {
    const updated = simulationDB.updateSettings(body);
    return makeResponse({ message: "Web parameters updated successfully", settings: updated }, 200);
  }

  // Admin: Orders Operations
  if (pathPart.endsWith("/api/admin/orders") && method === "GET") {
    return makeResponse(simulationDB.getOrders(), 200);
  }

  // Admin: Users Operations
  if (pathPart.endsWith("/api/admin/users") && method === "GET") {
    return makeResponse(simulationDB.getUsers(), 200);
  }

  const orderIdMatch = pathPart.match(/\/api\/admin\/orders\/([^/]+)$/);
  if (orderIdMatch && method === "PUT") {
    const orderId = orderIdMatch[1];
    const { status, paymentStatus } = body;
    const order = simulationDB.updateOrderStatus(orderId, status, paymentStatus);
    if (!order) return makeResponse({ error: "Order details missing" }, 404);
    return makeResponse({ message: "Transaction state updated", order }, 200);
  }

  // Admin: Products Operations
  if (pathPart.endsWith("/api/admin/products") && method === "POST") {
    const regular = parseFloat(body.regularPrice);
    const discount = body.discountPercentage || 0;
    const sale = Math.round(regular - (regular * (discount / 100)));

    const newProd = simulationDB.createProduct({
      ...body,
      regularPrice: regular,
      salePrice: sale,
      stockQuantity: parseInt(body.stockQuantity) || 0
    });
    return makeResponse({ message: "Product created successfully", product: newProd }, 200);
  }

  const productIdMatch = pathPart.match(/\/api\/admin\/products\/([^/]+)$/);
  if (productIdMatch) {
    const prodId = productIdMatch[1];
    if (method === "PUT") {
      const regular = parseFloat(body.regularPrice);
      const discount = body.discountPercentage || 0;
      const sale = Math.round(regular - (regular * (discount / 100)));

      const prod = simulationDB.updateProduct(prodId, {
        ...body,
        regularPrice: regular,
        salePrice: sale,
        stockQuantity: parseInt(body.stockQuantity) || 0
      });
      if (!prod) return makeResponse({ error: "Product profile missing" }, 404);
      return makeResponse({ message: "Product updated successfully", product: prod }, 200);
    } else if (method === "DELETE") {
      const success = simulationDB.deleteProduct(prodId);
      if (!success) return makeResponse({ error: "Product not located" }, 444);
      return makeResponse({ message: "Product successfully deleted from indexes" }, 200);
    }
  }

  // Catch-all mock 404
  return makeResponse({ error: `Not Found: Simulated route for ${method} ${pathPart} is missing` }, 404);
}

// Global window interceptor
export function activateFallbackDatabase() {
  if (!IS_BROWSER || !(window as any)._ara_mart_mock_active) {
    (window as any)._ara_mart_mock_active = true;

    const originalFetch = window.fetch;
    window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const url = typeof input === "string" ? input : input.toString();

      // Only handle active backend API requests
      if (url.includes("/api/")) {
        const isStaticHost =
          window.location.hostname.includes("github.io");

        if (isStaticHost) {
          return simulateAPIRequest(url, init);
        }

        // Try standard container backend first, fallback on a per-request basis if offline/refused
        try {
          const res = await originalFetch(input, init);
          
          // Check if the response returned an SPA fallback HTML page (meaning 404 on the server)
          const contentType = res.headers.get("content-type") || "";
          if (contentType.toLowerCase().includes("text/html")) {
            console.warn(`API returned HTML instead of JSON for ${url}. Routing to client-side simulator...`);
            return simulateAPIRequest(url, init);
          }
          return res;
        } catch (err) {
          console.warn(`Connection refused or offline for ${url}. Recovering with simulated fallback...`, err);
          return simulateAPIRequest(url, init);
        }
      }

      return originalFetch(input, init);
    };

    console.log("🛠️ ARA Mart client-side auto-healing fallback database layer integrated successfully.");
  }
}
