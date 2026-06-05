import React, { useState, useEffect } from "react";
import { 
  Compass, ShoppingBag, Heart, User, MapPin, Search, Star, 
  HelpCircle, MessageSquare, ShieldCheck, Mail, Phone, ExternalLink, 
  ChevronRight, Calendar, ArrowLeft, Truck, X, Eye, ShoppingCart, Lock, Plus, Minus, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product, Category, User as UserType, CartItem, Blog, Banner, WebSettings, Order } from "./types";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProductCard from "./components/ProductCard";
import CheckoutModal from "./components/CheckoutModal";
import AdminPanel from "./components/AdminPanel";
import CustomerDashboard from "./components/CustomerDashboard";
import HeroSlider from "./components/HeroSlider";

export default function App() {
  // Page rendering routers coordinates
  const [currentPage, setCurrentPage] = useState<string>("home");
  const [shopCategory, setShopCategory] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  // Global persistent lists
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [couponsList, setCouponsList] = useState<any[]>([]);
  const [settings, setSettings] = useState<WebSettings | null>(null);

  const [activeMediaTab, setActiveMediaTab] = useState<"image" | "video">("image");
  const [selectedColor, setSelectedColor] = useState<string>("");

  useEffect(() => {
    setActiveMediaTab("image");
    const foundProduct = selectedProductId ? products.find((p) => p.id === selectedProductId) : null;
    if (foundProduct && foundProduct.colorVariations && foundProduct.colorVariations.length > 0) {
      setSelectedColor(foundProduct.colorVariations[0]);
    } else {
      setSelectedColor("");
    }
  }, [selectedProductId, products]);

  // Cart/Wishlist states (Preloaded from localStorage securely)
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("ara_mart_cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const saved = localStorage.getItem("ara_mart_wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  // Client authorizations
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem("ara_mart_token"));

  // Checkouts/Success staging states
  const [checkoutActive, setCheckoutActive] = useState(false);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [trackError, setTrackError] = useState("");

  // Customer credentials formulations
  const [loginForm, setLoginForm] = useState({ login: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", email: "", password: "", phone: "" });
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // Admin access forms
  const [adminForm, setAdminForm] = useState({ username: "", password: "" });
  const [adminError, setAdminError] = useState("");

  // Shop page interactive sidebar controls
  const [filterBrand, setFilterBrand] = useState("");
  const [filterMinPrice, setFilterMinPrice] = useState("");
  const [filterMaxPrice, setFilterMaxPrice] = useState("");
  const [filterRating, setFilterRating] = useState("");
  const [shopSort, setShopSort] = useState("newest");
  const [searchText, setSearchText] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // App Theme
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("ara_mart_dark");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("ara_mart_dark", darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Sync state modifications onto storage cache
  useEffect(() => {
    localStorage.setItem("ara_mart_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("ara_mart_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Boot queries: download data clusters
  const downloadStoreAssets = async () => {
    try {
      const prodRes = await fetch("/api/products");
      setProducts(await prodRes.json());

      const catRes = await fetch("/api/categories");
      setCategories(await catRes.json());

      const blgRes = await fetch("/api/blogs");
      setBlogs(await blgRes.json());

      const bnrRes = await fetch("/api/banners");
      setBanners(await bnrRes.json());

      const setRes = await fetch("/api/settings");
      setSettings(await setRes.json());

      const coupRes = await fetch("/api/coupons");
      setCouponsList(await coupRes.json());
    } catch (e) {
      console.error("Endpoint data streams downloading failed", e);
    }
  };

  useEffect(() => {
    downloadStoreAssets();
  }, []);

  // Sync token authentication on startups
  const checkUserSession = async () => {
    if (!authToken) return;
    try {
      const res = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
      } else {
        handleLogout();
      }
    } catch {
      handleLogout();
    }
  };

  useEffect(() => {
    if (authToken) {
      checkUserSession();
    }
  }, [authToken]);

  const handleLogout = () => {
    localStorage.removeItem("ara_mart_token");
    setAuthToken(null);
    setCurrentUser(null);
    setCurrentPage("home");
  };

  // User auth login submission
  const handleClientLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm)
      });
      let data: any;
      try {
        data = await res.json();
      } catch (jsonErr: any) {
        throw new Error(`Server returned non-JSON response. Status: ${res.status}.`);
      }
      if (res.ok) {
        localStorage.setItem("ara_mart_token", data.token);
        setAuthToken(data.token);
        setCurrentUser(data.user);
        setAuthSuccess("Authenticated perfectly!");
        setCurrentPage(data.user.role === "admin" ? "admin-dashboard" : "customer-dashboard");
      } else {
        setAuthError(data.error || "Authentication failed.");
      }
    } catch (err: any) {
      console.error("Login submission failed:", err);
      setAuthError("Auth gateway is unresponsive. " + (err?.message || err || ""));
    }
  };

  // User auth registration
  const handleClientRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm)
      });
      let data: any;
      try {
        data = await res.json();
      } catch (jsonErr: any) {
        throw new Error(`Server returned non-JSON response. Status: ${res.status}.`);
      }
      if (res.ok) {
        localStorage.setItem("ara_mart_token", data.token);
        setAuthToken(data.token);
        setCurrentUser(data.user);
        setAuthSuccess("Account integrated successfully!");
        setCurrentPage("customer-dashboard");
      } else {
        setAuthError(data.error);
      }
    } catch (err: any) {
      console.error("Registration failed:", err);
      setAuthError("Registration server connection error. " + (err?.message || err || ""));
    }
  };

  // Admin explicit login
  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: adminForm.username, password: adminForm.password })
      });
      let data: any;
      try {
        data = await res.json();
      } catch (jsonErr: any) {
        throw new Error(`Server returned non-JSON response. Status: ${res.status}.`);
      }
      if (res.ok) {
        if (data.user.role !== "admin") {
          setAdminError("Insufficient credentials permissions.");
          return;
        }
        localStorage.setItem("ara_mart_token", data.token);
        setAuthToken(data.token);
        setCurrentUser(data.user);
        setCurrentPage("admin-dashboard");
      } else {
        setAdminError(data.error || "Invalid username or password index.");
      }
    } catch (err: any) {
      console.error("Admin login failed:", err);
      setAdminError("Offline or unreachable administration panel server. Details: " + (err?.message || err || ""));
    }
  };

  const fetchTrackingData = async (code: string) => {
    setTrackError("");
    setTrackedOrder(null);
    if (!code.trim()) return;

    try {
      const res = await fetch(`/api/orders/track/${code.trim()}`);
      const data = await res.json();
      if (res.ok) {
        setTrackedOrder(data);
      } else {
        setTrackError(data.error || "No order matched this tracking index.");
      }
    } catch {
      setTrackError("Server tracker database unreadable.");
    }
  };

  // Navigation controller helper
  const handleNavigate = (page: string, categoryId?: string, productId?: string, trackingCode?: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    if (categoryId) {
      setShopCategory(categoryId);
    } else {
      if (page !== "product-details") {
        setShopCategory(null);
      }
    }

    if (productId) {
      setSelectedProductId(productId);
    }

    if (trackingCode) {
      setTrackingNumberInput(trackingCode);
      fetchTrackingData(trackingCode);
    }
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number, color?: string, size?: string) => {
    const existingIndex = cart.findIndex(
      (item) => item.product.id === product.id && item.selectedColor === color && item.selectedSize === size
    );

    if (existingIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += quantity;
      setCart(updatedCart);
    } else {
      setCart([...cart, { product, quantity, selectedColor: color, selectedSize: size }]);
    }
  };

  const handleUpdateCartQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      const filtered = cart.filter((_, i) => i !== index);
      setCart(filtered);
    } else {
      const updated = [...cart];
      updated[index].quantity = quantity;
      setCart(updated);
    }
  };

  const handleRemoveFromCart = (index: number) => {
    const filtered = cart.filter((_, i) => i !== index);
    setCart(filtered);
  };

  // Wishlist actions
  const handleToggleWishlist = (product: Product) => {
    const exists = wishlist.some((p) => p.id === product.id);
    if (exists) {
      setWishlist(wishlist.filter((p) => p.id !== product.id));
    } else {
      setWishlist([...wishlist, product]);
    }
  };

  // Shipment Tracker
  const handleTrackOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumberInput.trim()) return;
    await fetchTrackingData(trackingNumberInput);
  };

  const activeProduct = selectedProductId ? products.find((p) => p.id === selectedProductId) : null;
  const filteredShopProducts = products.filter((p) => {
    // Category check
    if (shopCategory) {
      if (shopCategory === "flash-sale") {
        if (!p.flashSale) return false;
      } else if (p.category.toLowerCase() !== shopCategory.toLowerCase()) {
        return false;
      }
    }
    // Brand check
    if (filterBrand && p.brand.toLowerCase() !== filterBrand.toLowerCase()) return false;
    // Price checks
    if (filterMinPrice && p.salePrice < parseFloat(filterMinPrice)) return false;
    if (filterMaxPrice && p.salePrice > parseFloat(filterMaxPrice)) return false;
    // Rating check
    if (filterRating && p.rating < parseFloat(filterRating)) return false;
    // Search text check
    if (searchText) {
      const s = searchText.toLowerCase();
      if (!p.name.toLowerCase().includes(s) && !p.brand.toLowerCase().includes(s) && !p.category.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  // Sort filtered shop items
  if (shopSort === "price-asc") {
    filteredShopProducts.sort((a, b) => a.salePrice - b.salePrice);
  } else if (shopSort === "price-desc") {
    filteredShopProducts.sort((a, b) => b.salePrice - a.salePrice);
  } else if (shopSort === "rating") {
    filteredShopProducts.sort((a, b) => b.rating - a.rating);
  } else if (shopSort === "newest") {
    filteredShopProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Related products query helper
  const getRelatedProducts = (category: string, currentId: string) => {
    return products.filter((p) => p.category === category && p.id !== currentId).slice(0, 4);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-105 transition-all text-xs font-sans flex flex-col justify-between">
      
      {/* GLOBAL BANNER SLIDES & STICKY NAVIGATION */}
      <Navbar
        categories={categories}
        cart={cart}
        wishlist={wishlist}
        currentUser={currentUser}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onNavigate={handleNavigate}
        products={products}
        onLogout={handleLogout}
      />

      {/* RENDER BODY PAGES */}
      <div className="flex-1 pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >

        {/* 1. HOME VIEW */}
        {currentPage === "home" && (
          <div className="space-y-16 animate-fade-in">
            {/* Banner Slider */}
            <HeroSlider products={products} onNavigate={handleNavigate} />

            {/* Browse Categories Slider Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
              <div className="flex items-end justify-between border-b border-gray-100 dark:border-gray-900 pb-3 mb-8">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-500 font-bold">Featured Catalogues</span>
                  <h2 className="text-lg font-display font-medium text-gray-900 dark:text-white mt-1">Classified Core Departments</h2>
                </div>
                <button 
                  onClick={() => handleNavigate("shop")} 
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-500 flex items-center gap-0.5 cursor-pointer"
                >
                  View All Catalogs <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    id={`catalog-grid-${cat.slug}`}
                    onClick={() => handleNavigate("shop", cat.slug)}
                    className="group relative h-40 rounded-2xl overflow-hidden shadow-sm cursor-pointer border border-gray-100 dark:border-gray-800"
                  >
                    <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 brightness-[0.7]" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-4">
                      <h4 className="font-display font-black text-white text-xs tracking-tight">{cat.name}</h4>
                      <p className="text-[9px] text-emerald-400 font-mono mt-0.5 uppercase tracking-widest">Explore →</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Flash Sales Section */}
            <section className="bg-red-50/50 dark:bg-red-950/10 py-12 border-y border-red-100 dark:border-red-950/20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between border-b border-red-200/50 dark:border-red-950/40 pb-3 mb-8">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-red-500 font-black">⚡ Flash Sales Limited Stocks</span>
                    <h2 className="text-lg font-display font-medium text-gray-900 dark:text-white mt-1">Mega Discounts Live (EID Special)</h2>
                  </div>
                  <span className="text-xs font-bold text-red-600 font-mono bg-red-100 dark:bg-red-950/40 dark:text-red-400 px-3 py-1.5 rounded-lg border border-red-200/40">
                    Offers Expire Soon
                  </span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {products.filter((p) => p.flashSale).slice(0, 4).map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onNavigate={handleNavigate}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={handleToggleWishlist}
                      isInWishlist={wishlist.some((item) => item.id === p.id)}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Featured Luxury Collections Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between border-b border-gray-100 dark:border-gray-900 pb-3 mb-8">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-500 font-bold">Trending Right Now</span>
                  <h2 className="text-lg font-display font-medium text-gray-900 dark:text-white mt-1 font-display">Featured Curated Catalogues</h2>
                </div>
                <button
                  onClick={() => handleNavigate("shop")}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-500 flex items-center gap-0.5 cursor-pointer"
                >
                  Explore Shop <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {products.filter((p) => p.featured).slice(0, 4).map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onNavigate={handleNavigate}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                    isInWishlist={wishlist.some((item) => item.id === p.id)}
                  />
                ))}
              </div>
            </section>

            {/* Blogs snippet */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between border-b border-gray-100 dark:border-gray-900 pb-3 mb-8">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-500 font-bold">Read our Gazette</span>
                  <h2 className="text-lg font-display font-medium text-gray-900 dark:text-white mt-1">Lifestyle Tech & Cooking Tips</h2>
                </div>
                <button 
                  onClick={() => handleNavigate("blog")} 
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-500 flex items-center gap-0.5 cursor-pointer"
                >
                  All Articles <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {blogs.slice(0, 2).map((b) => (
                  <div
                    key={b.id}
                    onClick={() => {
                      setSelectedBlog(b);
                      handleNavigate("blog-details");
                    }}
                    className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-150 dark:border-gray-800 flex flex-col sm:flex-row gap-4 cursor-pointer hover:shadow-xl transition shadow-sm"
                  >
                    <img src={b.image} alt={b.title} className="w-full sm:w-40 aspect-[4/3] object-cover rounded-xl" referrerPolicy="no-referrer" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-mono tracking-wider text-emerald-600 font-bold uppercase">{b.tags[0]}</span>
                        <h4 className="font-bold text-gray-900 dark:text-white mt-1 text-sm line-clamp-2 leading-snug">{b.title}</h4>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{b.summary}</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-4 inline-block font-mono">Read Article →</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* 2. SHOP CATALOGUE WITH ADVANCED FILTERING */}
        {currentPage === "shop" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in font-sans">
            <div className="flex items-center gap-1 text-gray-400 text-[10px] tracking-wider mb-6">
              <span className="cursor-pointer hover:text-gray-600" onClick={() => handleNavigate("home")}>Home</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-900 dark:text-white font-bold">Catalog Shop</span>
              {shopCategory && (
                <>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold capitalize">{shopCategory}</span>
                </>
              )}
            </div>

            <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
              
              {/* Mobile Filter Toggle Trigger button */}
              <div className="lg:hidden w-full flex items-center justify-between gap-3 mb-2">
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="flex-1 py-3 px-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer border border-emerald-100 dark:border-emerald-950/20 transition-all duration-200"
                >
                  🔍 {showMobileFilters ? "Hide Filter Options" : "Show Filter Options"}
                  {(filterBrand || filterMinPrice || filterMaxPrice || filterRating) && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                </button>
                {(filterBrand || filterMinPrice || filterMaxPrice || filterRating) && (
                  <button
                    onClick={() => {
                      setFilterBrand("");
                      setFilterMinPrice("");
                      setFilterMaxPrice("");
                      setFilterRating("");
                      setSearchText("");
                    }}
                    className="px-4 py-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-rose-400 border border-red-150 dark:border-red-950/40 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Product Filtering Sidebar - responsive layout */}
              <aside className={`${showMobileFilters ? "block" : "hidden lg:block"} w-full lg:w-64 shrink-0 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 h-fit space-y-6 transition-all duration-350`}>
                <div>
                  <h4 className="font-display font-bold text-gray-950 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800 text-sm">Catalog Filters</h4>
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <span className="block text-[10px] uppercase font-mono tracking-widest text-gray-400 font-bold mb-1">Category Catalogs</span>
                  <select
                    id="shop-filter-cat"
                    value={shopCategory || ""}
                    onChange={(e) => setShopCategory(e.target.value || null)}
                    className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-2.5 outline-none text-gray-950 dark:text-white border-none font-bold text-xs"
                  >
                    <option value="">All Categories</option>
                    <option value="flash-sale">⚡ Flash Deals</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Brands input text search filter */}
                <div className="space-y-2">
                  <span className="block text-[10px] uppercase font-mono tracking-widest text-gray-400 font-bold mb-1">Search Brands</span>
                  <input
                    id="shop-filter-brand"
                    type="text"
                    placeholder="e.g. Anker"
                    value={filterBrand}
                    onChange={(e) => setFilterBrand(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-2.5 outline-none border-none text-gray-950 dark:text-white text-xs font-medium"
                  />
                </div>

                {/* Pricing Boundaries */}
                <div className="space-y-2">
                  <span className="block text-[10px] uppercase font-mono tracking-widest text-gray-400 font-bold mb-1">Pricing Boundaries (BDT)</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      id="shop-filter-min"
                      type="number"
                      placeholder="Min"
                      value={filterMinPrice}
                      onChange={(e) => setFilterMinPrice(e.target.value)}
                      className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2 font-mono outline-none border-none text-gray-950 dark:text-white text-center text-xs"
                    />
                    <input
                      id="shop-filter-max"
                      type="number"
                      placeholder="Max"
                      value={filterMaxPrice}
                      onChange={(e) => setFilterMaxPrice(e.target.value)}
                      className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2 font-mono outline-none border-none text-gray-950 dark:text-white text-center text-xs"
                    />
                  </div>
                </div>

                {/* Minimum ratings criteria */}
                <div className="space-y-2">
                  <span className="block text-[10px] uppercase font-mono tracking-widest text-gray-400 font-bold mb-1">Ratings Star</span>
                  <select
                    id="shop-filter-rating"
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-2.5 outline-none text-gray-950 dark:text-white border-none font-bold text-xs"
                  >
                    <option value="">Any Ratings</option>
                    <option value="4.5">4.5 ★ & Above</option>
                    <option value="4.0">4.0 ★ & Above</option>
                    <option value="3.5">3.5 ★ & Above</option>
                  </select>
                </div>

                <button
                  id="reset-filters-btn"
                  onClick={() => {
                    setFilterBrand("");
                    setFilterMinPrice("");
                    setFilterMaxPrice("");
                    setFilterRating("");
                    setSearchText("");
                  }}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition cursor-pointer text-xs"
                >
                  Clear Filters Index
                </button>
              </aside>

              {/* Product Listing Main */}
              <div className="flex-1 space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  <p className="font-bold text-gray-900 dark:text-white">
                    Showing {filteredShopProducts.length} premium products index
                  </p>
                  
                  {/* Sorting dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-semibold text-[10px]">Sort Index:</span>
                    <select
                      id="shop-sort-select"
                      value={shopSort}
                      onChange={(e) => setShopSort(e.target.value)}
                      className="bg-gray-100 dark:bg-gray-800 border-none rounded-lg p-2 outline-none text-gray-900 dark:text-white text-xs font-bold"
                    >
                      <option value="newest">Newest Released</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="rating">Top Customer Rated</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredShopProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onNavigate={handleNavigate}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={handleToggleWishlist}
                      isInWishlist={wishlist.some((item) => item.id === p.id)}
                    />
                  ))}
                  {filteredShopProducts.length === 0 && (
                    <div className="col-span-full py-16 text-center text-gray-400">
                      <p className="text-sm font-semibold">No products matched your specific sidebar filtering.</p>
                      <button 
                        onClick={() => { setShopCategory(null); setFilterBrand(""); setFilterMinPrice(""); setFilterMaxPrice(""); setFilterRating(""); }} 
                        className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition"
                      >
                        Reset All Filters list
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 3. PRODUCT DETAILS VIEW */}
        {currentPage === "product-details" && activeProduct && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in font-sans">
            <button
              id="product-details-back-btn"
              onClick={() => handleNavigate("shop")}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 transition mb-6 font-bold cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalogue Catalog Shop
            </button>

            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Product Gallery Media */}
              <div className="space-y-4">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-center">
                  {activeMediaTab === "video" && activeProduct.video ? (
                    <video
                      id="pdp-media-video"
                      src={activeProduct.video}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img
                      src={activeProduct.images[0]}
                      alt={activeProduct.name}
                      className="w-full h-full object-contain p-4"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>

                {activeProduct.video && (
                  <div className="flex justify-center gap-2">
                    <button
                      id="media-tab-image-btn"
                      onClick={() => setActiveMediaTab("image")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                        activeMediaTab === "image"
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/20"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      🖼️ Product Photo
                    </button>
                    <button
                      id="media-tab-video-btn"
                      onClick={() => setActiveMediaTab("video")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                        activeMediaTab === "video"
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/20"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      🎥 Video Player
                    </button>
                  </div>
                )}
              </div>

              {/* Product Configurations Controls */}
              <div className="space-y-6 text-left">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
                    {activeProduct.brand} Brand Category Catalogue
                  </span>
                  <h1 className="text-xl sm:text-2xl font-display font-medium text-gray-950 dark:text-white mt-1 leading-snug">
                    {activeProduct.name}
                  </h1>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} className={`w-3.5 h-3.5 ${idx < Math.round(activeProduct.rating) ? "fill-current" : "opacity-30"}`} />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                      {activeProduct.rating} ({activeProduct.reviews.length} Verified Reviews)
                    </span>
                  </div>
                </div>

                <div className="border-y border-gray-100 dark:border-gray-800 py-4 flex items-baseline gap-3">
                  <span className="text-2xl font-display font-extrabold text-emerald-600 dark:text-emerald-400">
                    ৳{activeProduct.salePrice}
                  </span>
                  {activeProduct.regularPrice > activeProduct.salePrice && (
                    <>
                      <span className="text-xs text-gray-400 line-through">
                        ৳{activeProduct.regularPrice}
                      </span>
                      <span className="text-[10px] bg-red-150 text-red-650 dark:bg-red-950/40 dark:text-red-400 font-black px-2 py-0.5 rounded">
                        SAVE {activeProduct.discountPercentage}%
                      </span>
                    </>
                  )}
                </div>

                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-semibold">
                    {activeProduct.shortDescription}
                  </p>
                </div>

                {/* Color choices selection */}
                {activeProduct.colorVariations.length > 0 && (
                  <div>
                    <span className="block text-[10px] uppercase font-mono tracking-widest text-gray-400 font-bold mb-2">Select Aesthetics Color</span>
                    <div className="flex flex-wrap gap-2">
                      {activeProduct.colorVariations.map((col) => {
                        const isSelected = selectedColor === col;
                        return (
                          <button
                            key={col}
                            id={`col-choice-${col}`}
                            onClick={() => setSelectedColor(col)}
                            className={`px-4 py-2 border rounded-xl font-semibold text-xs transition duration-200 cursor-pointer ${
                              isSelected
                                ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/20 scale-[1.03]"
                                : "border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                          >
                            🎨 {col}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Checkout CTA triggers */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                  {activeProduct.stockQuantity > 0 ? (
                    <>
                      <button
                        id="pdp-add-to-cart"
                        onClick={() => {
                          handleAddToCart(activeProduct, 1, selectedColor || activeProduct.colorVariations[0]);
                          alert(`Product (${selectedColor || activeProduct.colorVariations[0]}) has been added to your shopping bag.`);
                        }}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition duration-300 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase shadow-md shadow-emerald-500/10"
                      >
                        <ShoppingCart className="w-4 h-4" /> Add to Cart
                      </button>
                      
                      <button
                        id="pdp-buy-now"
                        onClick={() => {
                          handleAddToCart(activeProduct, 1, selectedColor || activeProduct.colorVariations[0]);
                          setCheckoutActive(true);
                        }}
                        className="flex-1 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold py-3 px-4 rounded-xl transition duration-300 text-center text-xs uppercase cursor-pointer"
                      >
                        Buy it Now
                      </button>
                    </>
                  ) : (
                    <button disabled className="w-full bg-gray-200 text-gray-400 py-3.5 rounded-xl text-center uppercase tracking-wider font-extrabold text-xs">
                      Out of Stock
                    </button>
                  )}
                </div>

                {/* Legal compliance warranties indicators */}
                <div className="grid grid-cols-2 gap-4 border-t border-gray-150 py-6 text-[10px]">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Truck className="w-4 h-4 text-emerald-500" />
                    <span>7-Day Free return warranty</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Nationwide Cash on Delivery</span>
                  </div>
                </div>

                {/* Long description specification Tabs */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                  <span className="block text-[10px] uppercase font-mono tracking-widest text-gray-400 font-bold mb-2">Technical Specifications</span>
                  <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-sans space-y-2">
                    <p>{activeProduct.description}</p>
                    <p className="mt-2 font-mono text-[10px] text-gray-400">SKU Code: {activeProduct.sku} | Catalog: {activeProduct.category} | SKU Code: {activeProduct.productCode}</p>
                  </div>
                </div>

                {/* Product reviews list section */}
                <div className="border-t border-gray-150 dark:border-gray-800 pt-6 space-y-4">
                  <span className="block text-[10px] uppercase font-mono tracking-widest text-gray-400 font-black">Customer Reviews ({activeProduct.reviews.length})</span>
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {activeProduct.reviews.map((rev) => (
                      <div key={rev.id} className="py-3 text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 dark:text-white text-xs">{rev.userName}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{rev.createdAt}</span>
                        </div>
                        <div className="flex text-amber-400 my-1">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star key={idx} className={`w-3 h-3 ${idx < rev.rating ? "fill-current" : "opacity-30"}`} />
                          ))}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">{rev.comment}</p>
                      </div>
                    ))}
                    {activeProduct.reviews.length === 0 && <p className="text-gray-500 text-xs">Be the first to review this organic authentic smartwatch!</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Related products recommendation carousel */}
            <div className="mt-16 sm:mt-24 text-left">
              <div className="border-b border-gray-150 dark:border-gray-800 pb-3 mb-8">
                <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-500 font-bold">Recommended Lists</span>
                <h3 className="text-lg font-display font-medium text-gray-950 dark:text-white">Related Products Recommendation</h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {getRelatedProducts(activeProduct.category, activeProduct.id).map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onNavigate={handleNavigate}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                    isInWishlist={wishlist.some((item) => item.id === p.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. CART VIEW PAGE */}
        {currentPage === "cart" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in font-sans text-xs">
            <h1 className="text-xl font-display font-bold text-gray-950 dark:text-white mb-8">Shopping Checkout Bag</h1>

            {cart.length === 0 ? (
              <div className="py-20 text-center text-gray-400">
                <span className="text-4xl">🛍️</span>
                <p className="text-sm font-semibold mt-4">Your shopping cart bag is completely empty.</p>
                <button
                  id="cart-shop-now"
                  onClick={() => handleNavigate("shop")}
                  className="mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition cursor-pointer"
                >
                  Return to Catalogue Shop
                </button>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart list details */}
                <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl overflow-hidden p-6 md:p-8 h-fit space-y-6">
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {cart.map((item, index) => (
                      <div key={item.product.id + (item.selectedColor || "")} className="py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          <img src={item.product.images[0]} alt={item.product.name} className="w-14 h-14 object-cover rounded-xl bg-gray-50 border" referrerPolicy="no-referrer" />
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 dark:text-white truncate">{item.product.name}</h4>
                            <p className="text-[10px] text-emerald-600 font-mono font-medium mt-0.5">Aesthetics: {item.selectedColor || "Default Tone"}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                          {/* Quantity selector with layout */}
                          <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                            <button
                              id={`cart-qty-minus-${index}`}
                              onClick={() => handleUpdateCartQuantity(index, item.quantity - 1)}
                              className="p-1 text-gray-500 hover:text-gray-900 hover:bg-white rounded transition"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-bold font-mono text-gray-900 dark:text-white">{item.quantity}</span>
                            <button
                              id={`cart-qty-plus-${index}`}
                              onClick={() => handleUpdateCartQuantity(index, item.quantity + 1)}
                              className="p-1 text-gray-500 hover:text-gray-900 hover:bg-white rounded transition"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-bold text-gray-900 dark:text-white text-xs">৳{item.product.salePrice * item.quantity}</p>
                            </div>
                            <button
                              id={`cart-remove-btn-${index}`}
                              onClick={() => handleRemoveFromCart(index)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-rose-100 dark:border-rose-950/20 text-[10px] font-bold"
                              title="Remove item from shopping cart"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subtotals bar */}
                <div className="w-full lg:w-80 bg-gray-50 dark:bg-gray-950 p-6 md:p-8 rounded-2xl h-fit border border-gray-150 dark:border-gray-900 flex flex-col gap-4">
                  <h3 className="font-display font-bold text-gray-950 dark:text-white mb-2">Order Price Summary</h3>
                  
                  <div className="flex justify-between border-b pb-3 text-gray-600 dark:text-gray-400">
                    <span>Aesthetic Products Subtotal</span>
                    <span className="font-extrabold text-gray-900 dark:text-white">
                      ৳{cart.reduce((acc, item) => acc + item.product.salePrice * item.quantity, 0)}
                    </span>
                  </div>

                  <p className="text-[10px] text-gray-450 leading-relaxed">
                    VAT tax ratios, shipping estimates and regional district delivery fees inside or outside Dhaka calculated during checkouts.
                  </p>

                  <button
                    id="cart-checkout-trigger"
                    onClick={() => setCheckoutActive(true)}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition duration-200 text-center uppercase tracking-wider cursor-pointer"
                  >
                    Proceed to Delivery Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. WISHLIST VIEW */}
        {currentPage === "wishlist" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in font-sans text-xs">
            <h1 className="text-xl font-display font-bold text-gray-990 dark:text-white mb-8">My Saved Catalog Wishlist</h1>

            {wishlist.length === 0 ? (
              <div className="py-20 text-center text-gray-400">
                <span className="text-4xl">❤️</span>
                <p className="text-sm font-semibold mt-4">No saved lists verified.</p>
                <button
                  onClick={() => handleNavigate("shop")}
                  className="mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition cursor-pointer"
                >
                  Browse Catalogue Shop
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {wishlist.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onNavigate={handleNavigate}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                    isInWishlist={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. SHIPMENT TRACKER VIEW PAGE */}
        {currentPage === "track-order" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in font-sans text-xs">
            <div className="max-w-xl mx-auto bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-md">
              <h1 className="text-lg font-display font-bold text-gray-950 dark:text-white text-center">Track Shipment Cargo</h1>
              <p className="text-center text-gray-400 mt-1 uppercase tracking-wider text-[9px]">ARA Mart Instant Tracking Platform</p>

              <form onSubmit={handleTrackOrderSubmit} className="mt-6 flex flex-col sm:flex-row gap-2">
                <input
                  id="tracking-code-input"
                  type="text"
                  required
                  placeholder="Enter Order ID or Tracking Code (e.g., ARA-TRK-784112)"
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  className="flex-1 bg-gray-50 dark:bg-gray-800 text-gray-950 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-mono font-bold"
                />
                <button
                  id="tracking-submit-btn"
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-3 rounded-xl transition cursor-pointer text-xs uppercase tracking-wider"
                >
                  Track
                </button>
              </form>

              {trackError && <p className="text-red-500 mt-3 font-bold text-center">❌ {trackError}</p>}

              {/* TRACKING REPORT TEMPLATE VISUALIZATION */}
              {trackedOrder && (
                <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-mono">Invoice Index</p>
                      <h4 className="font-bold text-gray-900 dark:text-white mt-0.5">{trackedOrder.invoiceNumber}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 uppercase font-mono">Scheduled Delivery</p>
                      <h4 className="font-bold text-gray-900 dark:text-white mt-0.5">{trackedOrder.estimatedDelivery}</h4>
                    </div>
                  </div>

                  <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-100 flex items-center justify-between">
                    <span className="font-bold text-emerald-800 dark:text-emerald-400 text-xs uppercase">Shipment Status:</span>
                    <span className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg tracking-wider text-[10px] uppercase">{trackedOrder.status}</span>
                  </div>

                  {/* Shipment milestones */}
                  <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold ${
                        ["Pending", "Processing", "Shipped", "Delivered"].includes(trackedOrder.status) ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-400"
                      }`}>✓</div>
                      <div>
                        <h5 className="font-bold text-gray-900 dark:text-white">Order Registered</h5>
                        <p className="text-gray-400 text-[10px]">Payment verified, packing materials ordered.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold ${
                        ["Processing", "Shipped", "Delivered"].includes(trackedOrder.status) ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-400"
                      }`}>✓</div>
                      <div>
                        <h5 className="font-bold text-gray-900 dark:text-white">Quality Check & Packaged</h5>
                        <p className="text-gray-400 text-[10px]">Passed premium quality parameters at Banani fulfillment HQ.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold ${
                        ["Shipped", "Delivered"].includes(trackedOrder.status) ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-400"
                      }`}>✓</div>
                      <div>
                        <h5 className="font-bold text-gray-900 dark:text-white">Shipped Out / Dispatched</h5>
                        <p className="text-gray-400 text-[10px]">Assigned to local Dhaka couriers block transit systems.</p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold ${
                        trackedOrder.status === "Delivered" ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-400"
                      }`}>✓</div>
                      <div>
                        <h5 className="font-bold text-gray-900 dark:text-white">Completed Delivery</h5>
                        <p className="text-gray-400 text-[10px]">Receiver signature successfully captured.</p>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        )}

        {/* 7. CUSTOMER LOGIN */}
        {currentPage === "customer-login" && (
          <div className="max-w-xl mx-auto px-4 py-16 animate-fade-in font-sans text-xs text-left">
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-8 rounded-2xl shadow-lg space-y-6">
              <div className="text-center">
                <h1 className="text-lg font-display font-bold text-gray-900 dark:text-white">Registration / Access Sign In</h1>
                <p className="text-gray-400 uppercase tracking-wider text-[9px] mt-1 font-mono">ARA Mart SECURE IDENTITY VAULT</p>
              </div>

              {authError && <div className="p-3 bg-red-50 text-red-600 rounded-lg">{authError}</div>}
              {authSuccess && <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">{authSuccess}</div>}

              <form onSubmit={handleClientLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 font-semibold mb-1">Username or Email *</label>
                  <input
                    id="login-username"
                    type="text" required
                    value={loginForm.login} onChange={(e) => setLoginForm({ ...loginForm, login: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border-none text-gray-950 dark:text-white"
                    placeholder="Enter your email or username"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 font-semibold mb-1">Secure Account Password *</label>
                  <input
                    id="login-password"
                    type="password" required
                    value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border-none text-gray-950 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  id="login-submit"
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition"
                >
                  Access My Account
                </button>
              </form>

              <div className="border-t pt-4 text-center">
                <p className="text-gray-400">
                  New client or brand enthusiast?{" "}
                  <button onClick={() => setCurrentPage("customer-register")} className="text-emerald-500 font-bold hover:underline cursor-pointer">
                    Register New Account →
                  </button>
                </p>
                <button onClick={() => setCurrentPage("admin-login")} className="text-xs text-gray-400 mt-4 hover:underline cursor-pointer flex items-center justify-center gap-1 mx-auto">
                  <Lock className="w-3 h-3 text-emerald-500" /> Administrative Staff Login Gateway
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 8. CUSTOMER REGISTER */}
        {currentPage === "customer-register" && (
          <div className="max-w-xl mx-auto px-4 py-12 animate-fade-in font-sans text-xs text-left">
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-8 rounded-2xl shadow-lg space-y-6">
              <div className="text-center">
                <h1 className="text-lg font-display font-bold text-gray-900 dark:text-white">Register Unified Client Profile</h1>
                <p className="text-gray-400 uppercase tracking-wider text-[9px] mt-1 font-mono">Join ARA Mart Bangladesh</p>
              </div>

              {authError && <div className="p-3 bg-red-50 text-red-650 rounded-lg">{authError}</div>}

              <form onSubmit={handleClientRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 font-semibold mb-1">Pick Username *</label>
                  <input
                    id="register-username"
                    type="text" required
                    value={registerForm.username} onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border-none text-gray-950 dark:text-white"
                    placeholder="Choose username"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 font-semibold mb-1">Your Email Address *</label>
                  <input
                    id="register-email"
                    type="email" required
                    value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border-none text-gray-950 dark:text-white"
                    placeholder="name@email.com"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 font-semibold mb-1 font-mono">Primary Phone Number (Bangladesh)</label>
                  <input
                    id="register-phone"
                    type="text"
                    value={registerForm.phone} onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border-none text-gray-950 dark:text-white"
                    placeholder="+88017XXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 font-semibold mb-1">Account Lock Password *</label>
                  <input
                    id="register-password"
                    type="password" required
                    value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border-none text-gray-950 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  id="register-submit"
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition"
                >
                  Create My Profile
                </button>
              </form>

              <p className="text-center text-gray-400">
                Already registered with us?{" "}
                <button onClick={() => setCurrentPage("customer-login")} className="text-emerald-500 font-bold hover:underline cursor-pointer">
                  Go Sign In →
                </button>
              </p>
            </div>
          </div>
        )}

        {/* 9. ADMIN GENERAL STAFF LOGIN GATE */}
        {currentPage === "admin-login" && (
          <div className="max-w-xl mx-auto px-4 py-16 animate-fade-in font-sans text-xs text-left">
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-8 rounded-2xl shadow-lg space-y-6">
              <div className="text-center">
                <h1 className="text-lg font-display font-bold text-gray-900 dark:text-white">Admin Staff Portal</h1>
                <p className="text-gray-400 uppercase tracking-wider text-[9px] mt-1 font-mono">ARA MART SECURE INFRASTRUCTURE</p>
              </div>

              {adminError && <div className="p-3 bg-red-50 text-red-650 rounded-lg">{adminError}</div>}

              <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 font-semibold mb-1">Administrative Username *</label>
                  <input
                    id="admin-username"
                    type="text" required
                    value={adminForm.username} onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border-none text-gray-950 dark:text-white font-bold"
                    placeholder="Staff Username (e.g., RafsanAdmin)"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 font-semibold mb-1">Access PIN Password *</label>
                  <input
                    id="admin-password"
                    type="password" required
                    value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border-none text-gray-950 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-950/30 p-3 rounded-lg border border-yellow-250 text-yellow-800 text-[10px] font-semibold dark:text-yellow-400 leading-normal">
                  ⚠️ Administrative staff actions are logged and subject to encryption monitors. Required secure keys for operations.
                </div>

                <button
                  id="admin-submit-btn"
                  type="submit"
                  className="w-full py-3 bg-gray-950 text-white font-bold rounded-xl transition cursor-pointer"
                >
                  Authenticate staff profile
                </button>
              </form>

              <button onClick={() => setCurrentPage("customer-login")} className="text-xs text-gray-400 hover:underline mx-auto block text-center cursor-pointer">
                Return to Customer Access login
              </button>
            </div>
          </div>
        )}

        {/* 10. CUSTOMERS DASHBOARD MOUNT */}
        {currentPage === "customer-dashboard" && currentUser && (
          <CustomerDashboard
            currentUser={currentUser}
            token={authToken!}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
          />
        )}

        {/* 11. ADMIN INTERFACES MASTER DASHBOARD MOUNT */}
        {currentPage === "admin-dashboard" && authToken && (
          <AdminPanel
            onNavigate={handleNavigate}
            token={authToken}
          />
        )}

        {/* 12. PRESS GAZETTE ARTICLES DIRECTORY */}
        {currentPage === "blog" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in font-sans text-xs">
            <h1 className="text-xl font-display font-bold text-gray-950 dark:text-white mb-8">Press Gazette & Dynamic Blog</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {blogs.map((b) => (
                <div
                  key={b.id}
                  onClick={() => {
                    setSelectedBlog(b);
                    handleNavigate("blog-details");
                  }}
                  className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 flex flex-col md:flex-row gap-6 cursor-pointer hover:shadow-2xl transition shadow-sm"
                >
                  <img src={b.image} alt={b.title} className="w-full md:w-48 aspect-square object-cover rounded-2xl bg-gray-50" referrerPolicy="no-referrer" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-100 text-emerald-850 px-2 py-0.5 rounded text-[9px] font-bold uppercase">{b.tags[0]}</span>
                        <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1"><Calendar className="w-3 h-3" /> {b.createdAt}</span>
                      </div>
                      <h3 className="font-display font-medium text-gray-900 dark:text-white text-md mt-2 leading-snug line-clamp-2">{b.title}</h3>
                      <p className="text-gray-500 mt-2 line-clamp-3 leading-relaxed">{b.summary}</p>
                    </div>

                    <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono mt-4 inline-block">Read full article →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 13. GAZETTE DETAILS NODE */}
        {currentPage === "blog-details" && selectedBlog && (
          <div className="max-w-3xl mx-auto px-4 py-10 animate-fade-in font-sans text-xs text-left">
            <button
              onClick={() => handleNavigate("blog")}
              className="flex items-center gap-1 text-gray-400 hover:text-emerald-500 transition mb-6 font-bold cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Gazette Catalogues
            </button>

            <article className="space-y-6">
              <span className="bg-emerald-100 text-emerald-850 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase">{selectedBlog.tags[0]}</span>
              <h1 className="text-lg sm:text-2xl font-display font-bold text-gray-950 dark:text-white leading-snug">{selectedBlog.title}</h1>
              
              <div className="flex items-center gap-4 text-[10px] text-gray-400 font-mono border-y border-gray-100 dark:border-gray-800 py-3">
                <span>By Assistant Author: {selectedBlog.author}</span>
                <span>•</span>
                <span>Published: {selectedBlog.createdAt}</span>
              </div>

              <img src={selectedBlog.image} alt={selectedBlog.title} className="w-full aspect-[2/1] object-cover rounded-3xl" referrerPolicy="no-referrer" />
              
              <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-sans space-y-4">
                <p className="font-bold">{selectedBlog.summary}</p>
                <p className="whitespace-pre-line">{selectedBlog.content}</p>
              </div>
            </article>
          </div>
        )}

        {/* 14. ABOUT US PAGE */}
        {currentPage === "about" && (
          <div className="max-w-4xl mx-auto px-4 py-10 animate-fade-in text-left font-sans text-xs space-y-8">
            <h1 className="text-2xl font-display font-bold text-gray-950 dark:text-white">Our Heritage Story & Purpose</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              ARA Mart represents a dedication to extreme e-commerce accessibility inside Bangladesh, linking premium accessories directly into customer doors under rigid, verified parameters of trust. From smart gadgets and amoled watches to artisanal Bangladeshi silk wear, every catalog entry passed quality-compliance controls safely.
            </p>
          </div>
        )}

        {/* 15. CONTACT US PAGE */}
        {currentPage === "contact" && (
          <div className="max-w-4xl mx-auto px-4 py-10 animate-fade-in text-left font-sans text-xs space-y-6">
            <h1 className="text-2xl font-display font-bold text-gray-950 dark:text-white">Corporate Support Contacts</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              <div className="p-5 bg-gray-50 dark:bg-gray-900 border rounded-2xl">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1"><Mail className="w-4 h-4 text-emerald-500" /> Corporate Mailing Vault</h4>
                <p className="text-[11px] text-gray-400 mt-1">support@aramart.com.bd</p>
              </div>
              <div className="p-5 bg-gray-50 dark:bg-gray-900 border rounded-2xl">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1"><Phone className="w-4 h-4 text-emerald-500" /> Phone Call Support</h4>
                <p className="text-[11px] text-gray-400 mt-1">
                  <a href="tel:+8801609181280" className="text-emerald-600 dark:text-emerald-400 font-extrabold hover:underline cursor-pointer block mt-1">+880 1609-181280</a>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 16. FREQUENTLY ASKED QUESTIONS */}
        {currentPage === "faq" && (
          <div className="max-w-4xl mx-auto px-4 py-10 animate-fade-in text-left font-sans text-xs space-y-6">
            <h1 className="text-2xl font-display font-bold text-gray-950 dark:text-white">Frequently Asked Inquiries</h1>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <h4 className="font-bold text-gray-900 dark:text-white">What is the average shipping duration inside Bangladesh?</h4>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Inside Dhaka deliveries completed within 2 business days. Outside Dhaka couriers average 4-6 business days.</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <h4 className="font-bold text-gray-900 dark:text-white">How does Cash on Delivery (COD) operate?</h4>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Customers check the parameters of product packages before handing over money to shippers safely.</p>
              </div>
            </div>
          </div>
        )}

        {/* 17. REPLICATED FORMAL POLICY PAGES */}
        {["privacy-policy", "terms-conditions", "return-policy", "refund-policy", "shipping-policy"].includes(currentPage) && (
          <div className="max-w-4xl mx-auto px-4 py-10 animate-fade-in text-left font-sans text-xs space-y-6">
            <h1 className="text-2xl font-display font-bold text-gray-950 dark:text-white capitalize">
              {currentPage.replace("-", " ")} Agreement Page
            </h1>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-sans">
              Welcome to ARA Mart's statutory policy ledger. In purchasing smart gadgets and wearable fitness accessories in our channels, customers enter into covenants protecting both parties against transaction irregularities. Delivery indexes, tracking and transactional refund pathways operate according to legal framework controls of Bangladesh. Contact customer nodes for clarifications.
            </p>
          </div>
        )}
          </motion.div>
        </AnimatePresence>

      </div>

      {/* FLOAT CHAT OVERWRITES */}
      <a
        id="whatsapp-floating-widget"
        href="https://wa.me/8801609181280"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 p-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xl flex items-center justify-center cursor-pointer transition hover:scale-105 duration-300 z-50 animate-bounce"
        title="Chat on WhatsApp"
      >
        <MessageSquare className="w-6 h-6" />
      </a>

      {/* RENDER CHECKOUT SIMULATION OVERLAYS */}
      <AnimatePresence>
        {checkoutActive && settings && (
          <CheckoutModal
            onClose={() => setCheckoutActive(false)}
            cart={cart}
            settings={settings}
            coupons={couponsList}
            currentUser={currentUser}
            onClearCart={() => setCart([])}
            onOrderSuccess={(order) => {
              setCheckoutActive(false);
              setSuccessOrder(order);
            }}
          />
        )}
      </AnimatePresence>

      {/* CHECKOUT ORDER SUCCESS OVERLAYS DESIGN */}
      <AnimatePresence>
        {successOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full border border-gray-100 dark:border-gray-800 text-center space-y-6 shadow-2xl font-sans text-xs"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-lg font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">Order Consigned Successfully</h2>
                <p className="text-gray-400 mt-1 uppercase text-[9px] font-mono">Invoice indices generated perfectly</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-400">Order ID Key</span>
                  <span className="font-bold text-gray-900 dark:text-white font-mono">{successOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Invoice Number</span>
                  <span className="font-bold text-gray-900 dark:text-white font-mono">{successOrder.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Shipment Track Code</span>
                  <span className="font-mono">{successOrder.trackingCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment Status</span>
                  <span className="font-bold text-gray-900 dark:text-white">{successOrder.paymentStatus}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-950 dark:text-white border-t pt-2 mt-1">
                  <span>Grand Total Paid</span>
                  <span>৳{successOrder.total}</span>
                </div>
              </div>

              <p className="text-gray-400 leading-normal">
                E-Commerce dispatch agents are packing your accessories. Standard shipment scheduled to deliver within {successOrder.estimatedDelivery}. Use the tracking code to query logs.
              </p>

              <button
                id="success-acknowledged-btn"
                onClick={() => {
                  setSuccessOrder(null);
                  setCurrentPage("home");
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition cursor-pointer"
              >
                Back to Home page
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER METRICS AND POLICIES */}
      <Footer onNavigate={(page) => handleNavigate(page)} />

    </div>
  );
}
const CheckCircle2 = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" /></svg>;
