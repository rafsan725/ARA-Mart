import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Database } from "./db.js";
import { User, Order } from "../types.js";
import { GoogleGenAI, Type } from "@google/genai";

export const apiRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || "ARA_MART_JWT_SECRET_KEY_BD_2026";

// Extend Request interface to include user property
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: "admin" | "customer";
    email: string;
  };
}

// Authentication Middlewares
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token is missing" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user as AuthenticatedRequest["user"];
    next();
  });
}

export function authorizeAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Administrative privilege required" });
  }
  next();
}

// PUBLIC CONFIG & SETTINGS
apiRouter.get("/settings", (req, res) => {
  res.json(Database.getSettings());
});

apiRouter.get("/banners", (req, res) => {
  res.json(Database.getBanners());
});

// AUTHENTICATION ENDPOINTS
apiRouter.post("/auth/register", (req, res) => {
  const { username, email, password, phone } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Required fields (username, email, password) are remaining vacant" });
  }

  const existing = Database.getUserByUsernameOrEmail(username) || Database.getUserByUsernameOrEmail(email);
  if (existing) {
    return res.status(400).json({ error: "A client already holds this username or email portal" });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const newUser = Database.createUser({
    username,
    email,
    role: "customer",
    phone: phone || "",
    verified: true,
    addresses: []
  }, passwordHash);

  const token = jwt.sign({ id: newUser.id, role: newUser.role, email: newUser.email }, JWT_SECRET, { expiresIn: "7d" });
  res.status(210).json({ token, user: newUser });
});

apiRouter.post("/auth/login", (req, res) => {
  const { login, password } = req.body; // 'login' can be email or username

  if (!login || !password) {
    return res.status(400).json({ error: "Login credit boundaries must not remain blank" });
  }

  const user = Database.getUserByUsernameOrEmail(login);
  if (!user) {
    return res.status(401).json({ error: "Invalid username, email or password matching indexes" });
  }

  const hash = Database.getPasswordHash(user.id);
  if (!hash || !bcrypt.compareSync(password, hash)) {
    return res.status(401).json({ error: "Invalid credentials specified" });
  }

  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user });
});

apiRouter.get("/auth/me", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized access" });
  const user = Database.getUserById(req.user.id);
  if (!user) return res.status(404).json({ error: "User detail records not matched" });
  res.json({ user });
});

apiRouter.put("/auth/profile", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized access" });
  const { username, phone } = req.body;
  const updatedUser = Database.updateUserProfile(req.user.id, { username, phone });
  if (!updatedUser) return res.status(404).json({ error: "User profile updates failed" });
  res.json({ user: updatedUser, message: "Profile successfully modified" });
});

apiRouter.put("/auth/addresses", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized access" });
  const { addresses } = req.body;
  if (!Array.isArray(addresses)) {
    return res.status(400).json({ error: "Addresses parameters must constitute a structural list" });
  }
  const updatedUser = Database.updateUserAddresses(req.user.id, addresses);
  if (!updatedUser) return res.status(404).json({ error: "User profile data not resolved" });
  res.json({ user: updatedUser, message: "Delivery addresses successfully committed" });
});


// CUSTOMER PRODUCT CATALOG
apiRouter.get("/products", (req, res) => {
  const { category, brand, query, minPrice, maxPrice, rating, limit, sort } = req.query;
  let products = [...Database.getProducts()];

  // Filter criteria
  if (category) {
    products = products.filter(
      (p) => p.category.toLowerCase() === (category as string).toLowerCase()
    );
  }

  if (brand) {
    products = products.filter(
      (p) => p.brand.toLowerCase() === (brand as string).toLowerCase()
    );
  }

  if (query) {
    const q = (query as string).toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    );
  }

  if (minPrice) {
    products = products.filter((p) => p.salePrice >= parseFloat(minPrice as string));
  }

  if (maxPrice) {
    products = products.filter((p) => p.salePrice <= parseFloat(maxPrice as string));
  }

  if (rating) {
    products = products.filter((p) => p.rating >= parseFloat(rating as string));
  }

  // Sorting metrics
  if (sort) {
    switch (sort as string) {
      case "price-asc":
        products.sort((a, b) => a.salePrice - b.salePrice);
        break;
      case "price-desc":
        products.sort((a, b) => b.salePrice - a.salePrice);
        break;
      case "newest":
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "rating":
        products.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Default sorting remains untouched
        break;
    }
  }

  if (limit) {
    products = products.slice(0, parseInt(limit as string));
  }

  res.json(products);
});

apiRouter.get("/products/:id", (req, res) => {
  const product = Database.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product file entry could not be matched" });
  }
  res.json(product);
});

apiRouter.post("/products/:id/review", (req, res) => {
  const { userName, rating, comment } = req.body;
  if (!userName || !rating) {
    return res.status(400).json({ error: "Review specifications (name, count score) can not be empty" });
  }

  const updatedProduct = Database.addReviewToProduct(req.params.id, {
    userName,
    rating: parseInt(rating),
    comment: comment || ""
  });

  if (!updatedProduct) {
    return res.status(404).json({ error: "Target product record of this review is not resolved" });
  }

  res.json({ message: "Review posted successfully", product: updatedProduct });
});

apiRouter.get("/categories", (req, res) => {
  res.json(Database.getCategories());
});

apiRouter.get("/blogs", (req, res) => {
  res.json(Database.getBlogs());
});

// COUPONS PROMOTIONAL LOGIC
apiRouter.get("/coupons", (req, res) => {
  res.json(Database.getCoupons().filter((c) => c.isActive));
});

apiRouter.post("/coupons/apply", (req, res) => {
  const { code, cartTotal } = req.body;
  if (!code) return res.status(400).json({ error: "Promo code boundary not specifiied" });

  const coupon = Database.getCoupons().find(
    (c) => c.code.toUpperCase() === code.toUpperCase() && c.isActive
  );

  if (!coupon) {
    return res.status(404).json({ error: "The provided promo code is invalid or expired" });
  }

  if (cartTotal < coupon.minPurchase) {
    return res.status(400).json({
      error: `Minimum order total to redeem this coupon is BDT ${coupon.minPurchase}. Cart balance is currently BDT ${cartTotal}.`
    });
  }

  res.json({ coupon, message: "Campaign discount successfully linked to checkouts" });
});


// ORDERS MANAGEMENT
apiRouter.post("/orders", (req, res) => {
  const {
    userId,
    customerName,
    customerEmail,
    phone,
    address,
    district,
    shippingMethod,
    items,
    paymentMethod,
    paymentDetails,
    regularTotal,
    discountAmount
  } = req.body;

  if (!customerName || !phone || !address || !items || !items.length) {
    return res.status(400).json({ error: "Incomplete details in customer checkout inputs" });
  }

  // Double check calculations
  const settings = Database.getSettings();
  let calculatedShippingCharge = district === "Dhaka" ? settings.insideDhakaShipping : settings.outsideDhakaShipping;
  if (shippingMethod === "Express") {
    calculatedShippingCharge += settings.expressShippingMarkup;
  }

  // Rule: Free Shipping over state thresholds
  if (regularTotal >= settings.freeShippingThreshold) {
    calculatedShippingCharge = 0;
  }

  const calculatedTax = Math.round(regularTotal * (settings.taxPercentage / 100));
  const finalTotal = regularTotal + calculatedShippingCharge + calculatedTax - (discountAmount || 0);

  // Auto approve simulated digital payment wallets
  const paymentStatus = paymentMethod === "COD" ? "Pending" : "Paid";

  const order = Database.createOrder({
    userId,
    customerName,
    customerEmail,
    phone,
    address,
    district,
    shippingMethod,
    items,
    paymentMethod,
    paymentStatus,
    paymentDetails: paymentDetails || {},
    shippingCharge: calculatedShippingCharge,
    tax: calculatedTax,
    discountAmount: discountAmount || 0,
    regularTotal,
    total: finalTotal,
    status: "Pending",
    estimatedDelivery: district === "Dhaka" ? "2-3 business days" : "4-6 business days"
  });

  res.status(201).json({ message: "Checkout order processed and generated index successfully", order });
});

apiRouter.get("/orders/track/:id", (req, res) => {
  const order = Database.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: "No matching order id or tracker key was registered in database" });
  }
  res.json(order);
});

apiRouter.get("/orders/user/:userId", authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized identity" });
  // Prevent customer searching other items
  if (req.user.role !== "admin" && req.user.id !== req.params.userId) {
    return res.status(403).json({ error: "Permission to retrieve other client records denied" });
  }
  res.json(Database.getOrdersByUser(req.params.userId));
});


// ==========================================
// ADMINISTRATOR EXCLUSIVE PROTECTED SUITE
// ==========================================

apiRouter.get("/admin/dashboard", authenticateToken, authorizeAdmin, (req, res) => {
  const products = Database.getProducts();
  const orders = Database.getOrders();
  const users = Database.getUsers();

  const totalSales = orders.filter((o) => o.paymentStatus === "Paid" || o.status === "Delivered").reduce((acc, o) => acc + o.total, 0);
  const totalRevenue = orders.filter((o) => o.status !== "Cancelled").reduce((acc, o) => acc + o.total, 0);
  const lowStock = products.filter((p) => p.stockQuantity < 10);

  // Group daily metrics
  const salesHistory = orders.map((o) => ({
    date: o.createdAt.split("T")[0],
    amount: o.total
  }));

  res.json({
    totals: {
      sales: totalSales,
      revenue: totalRevenue,
      customers: users.filter((u) => u.role === "customer").length,
      orders: orders.length,
      products: products.length
    },
    lowStock,
    salesHistory
  });
});

apiRouter.get("/admin/orders", authenticateToken, authorizeAdmin, (req, res) => {
  res.json(Database.getOrders());
});

apiRouter.put("/admin/orders/:id", authenticateToken, authorizeAdmin, (req, res) => {
  const { status, paymentStatus } = req.body;
  const updated = Database.updateOrderStatus(req.params.id, status, paymentStatus);
  if (!updated) return res.status(404).json({ error: "Target order record not located" });
  res.json({ message: "Store transaction advanced successfully", order: updated });
});

apiRouter.post("/admin/products", authenticateToken, authorizeAdmin, (req, res) => {
  const prodData = req.body;
  if (!prodData.name || !prodData.category || !prodData.regularPrice) {
    return res.status(400).json({ error: "Incomplete details in custom product upload properties" });
  }

  // Complete calculations
  const discount = prodData.discountPercentage || 0;
  const regular = parseFloat(prodData.regularPrice);
  const sale = Math.round(regular - (regular * (discount / 100)));

  const product = Database.createProduct({
    ...prodData,
    regularPrice: regular,
    salePrice: sale,
    discountPercentage: discount,
    stockQuantity: parseInt(prodData.stockQuantity || 10),
    rating: 5.0,
    reviews: []
  });

  res.status(201).json({ message: "Digital index entry cataloged successfully", product });
});

apiRouter.put("/admin/products/:id", authenticateToken, authorizeAdmin, (req, res) => {
  const updatedData = req.body;
  const existing = Database.getProductById(req.params.id);
  if (!existing) return res.status(404).json({ error: "Target catalog file not located" });

  const discount = updatedData.discountPercentage !== undefined ? parseFloat(updatedData.discountPercentage) : existing.discountPercentage;
  const regular = updatedData.regularPrice !== undefined ? parseFloat(updatedData.regularPrice) : existing.regularPrice;
  const sale = Math.round(regular - (regular * (discount / 100)));

  const updated = Database.updateProduct(req.params.id, {
    ...updatedData,
    regularPrice: regular,
    salePrice: sale,
    discountPercentage: discount,
    stockQuantity: updatedData.stockQuantity !== undefined ? parseInt(updatedData.stockQuantity) : existing.stockQuantity
  });

  res.json({ message: "Catalog file successfully written to cluster storage", product: updated });
});

apiRouter.delete("/admin/products/:id", authenticateToken, authorizeAdmin, (req, res) => {
  const success = Database.deleteProduct(req.params.id);
  if (!success) return res.status(404).json({ error: "Target catalog item not found in file systems" });
  res.json({ message: "Retirement transaction successful" });
});

apiRouter.post("/admin/categories", authenticateToken, authorizeAdmin, (req, res) => {
  const { name, slug, image, icon } = req.body;
  if (!name || !slug) return res.status(400).json({ error: "Category names and slugs must not remain empty" });

  const cat = Database.createCategory({
    name,
    slug,
    image: image || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80",
    icon: icon || "Cpu"
  });

  res.status(201).json({ message: "Catalog category entry integrated perfectly", category: cat });
});

apiRouter.delete("/admin/categories/:id", authenticateToken, authorizeAdmin, (req, res) => {
  const success = Database.deleteCategory(req.params.id);
  if (!success) return res.status(404).json({ error: "Target classification not resolved" });
  res.json({ message: "Catalog classification successfully deleted" });
});

apiRouter.put("/admin/settings", authenticateToken, authorizeAdmin, (req, res) => {
  const updated = Database.updateSettings(req.body);
  res.json({ message: "E-Commerce control metrics recalculated", settings: updated });
});

apiRouter.post("/admin/reset-db", authenticateToken, authorizeAdmin, (req, res) => {
  try {
    Database.resetDB();
    res.json({ message: "Database reset to original seed data successfully completed" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to reset database" });
  }
});

// Blog Admin Support
apiRouter.post("/admin/blogs", authenticateToken, authorizeAdmin, (req, res) => {
  const { title, summary, content, image, author, tags } = req.body;
  if (!title || !content) return res.status(400).json({ error: "Content titles and bodies are necessary" });

  const blog = Database.createBlog({
    title,
    summary: summary || title,
    content,
    image: image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    author: author || "ARA Mart Team",
    tags: tags || []
  });

  res.json({ message: "Press release updated on system server", blog });
});

apiRouter.delete("/admin/blogs/:id", authenticateToken, authorizeAdmin, (req, res) => {
  const success = Database.deleteBlog(req.params.id);
  if (!success) return res.status(404).json({ error: "Press release catalog node not active" });
  res.json({ message: "Blog entry successfully retired" });
});

// Coupon Admin Support
apiRouter.post("/admin/coupons", authenticateToken, authorizeAdmin, (req, res) => {
  const { code, discountType, discountValue, minPurchase, expiryDate } = req.body;
  if (!code || !discountValue) return res.status(400).json({ error: "Coupon codes and monetary ratios are necessary" });

  const coupon = Database.createCoupon({
    code: code.toUpperCase(),
    discountType: discountType || "Percentage",
    discountValue: parseFloat(discountValue),
    minPurchase: parseFloat(minPurchase || 0),
    expiryDate: expiryDate || "2027-12-31",
    isActive: true
  });

  res.status(201).json({ message: "Promotional coupon campaign code entered into active indices", coupon });
});

apiRouter.delete("/admin/coupons/:id", authenticateToken, authorizeAdmin, (req, res) => {
  const success = Database.deleteCoupon(req.params.id);
  if (!success) return res.status(404).json({ error: "Target campaign coupon not found" });
  res.json({ message: "Campaign code successfully terminated" });
});

// Banner Admin Support
apiRouter.post("/admin/banners", authenticateToken, authorizeAdmin, (req, res) => {
  const banner = Database.createBanner(req.body);
  res.status(201).json({ message: "Hero layout slider element linked", banner });
});

apiRouter.delete("/admin/banners/:id", authenticateToken, authorizeAdmin, (req, res) => {
  const success = Database.deleteBanner(req.params.id);
  if (!success) return res.status(444).json({ error: "Failure to locate slide panel component" });
  res.json({ message: "Slider element defused" });
});

// PHOTO / VISUAL SEARCH ENDPOINT Powered by Gemini (gemini-3.5-flash)
apiRouter.post("/photo-search", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Please provide a valid photo or image key to search" });
    }

    let base64Data = image;
    let mimeType = "image/jpeg";

    if (image.startsWith("data:")) {
      const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        base64Data = matches[2];
      }
    }

    if (!process.env.GEMINI_API_KEY) {
      console.warn("[ARA Mart] GEMINI_API_KEY is not defined in environments. Simulating search matches.");
      return res.json({
        keywords: "watch smartwatch wearable accessories",
        recognizedItem: "Smart Watch/Fitness Tracker",
        suggestedCategory: "Wearables"
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        },
        "This is an image uploaded by a customer. Identify the product shown in this picture. Provide exactly 3 or 4 relevant searchable keywords, the recognized name, and the most logical store classification. Output the result in structured JSON format."
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            keywords: {
              type: Type.STRING,
              description: "A space-separated list of highly searchable descriptive keywords matching the product (e.g. 'smart watch ultra black font', 'wireless charging pad fast', 'men leather wallet standard brown'). Max 3-5 keywords."
            },
            recognizedItem: {
              type: Type.STRING,
              description: "The name of the detected e-commerce product in english."
            },
            suggestedCategory: {
              type: Type.STRING,
              description: "The classification (e.g. Accessories, Wearables, Gadgets, Fashion, Audio, Appliances, etc.)."
            }
          },
          required: ["keywords", "recognizedItem", "suggestedCategory"]
        }
      }
    });

    const textResult = response.text;
    if (!textResult) {
      throw new Error("No response output returned from Gemini server");
    }

    const parsed = JSON.parse(textResult.trim());
    res.json(parsed);

  } catch (error: any) {
    console.error("Visual / photo search backend error:", error);
    res.status(500).json({ error: error.message || "Visual search parsing encountered an error" });
  }
});
