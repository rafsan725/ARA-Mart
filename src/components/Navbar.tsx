import React, { useState, useEffect } from "react";
import { Search, ShoppingBag, Heart, User, Menu, X, Sun, Moon, Sparkles, LogOut, LayoutDashboard, Compass, Camera } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product, Category, User as UserType, CartItem } from "../types.js";
import { CountdownTimer } from "./CountdownTimer";

interface NavbarProps {
  categories: Category[];
  cart: CartItem[];
  wishlist: Product[];
  currentUser: UserType | null;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onNavigate: (page: string, categoryId?: string, productId?: string) => void;
  products: Product[];
  onLogout: () => void;
}

export default function Navbar({
  categories,
  cart,
  wishlist,
  currentUser,
  darkMode,
  setDarkMode,
  onNavigate,
  products,
  onLogout
}: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [photoRecognizedName, setPhotoRecognizedName] = useState("");

  const handlePhotoSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingPhoto(true);
    setPhotoRecognizedName("");

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        try {
          const response = await fetch("/api/photo-search", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ image: base64String }),
          });

          if (!response.ok) {
            throw new Error("Visual search analysis endpoint error");
          }

          const data = await response.json();
          if (data && data.keywords) {
            setSearchQuery(data.keywords);
            setPhotoRecognizedName(data.recognizedItem || "Matched Products");
            setShowSearchDropdown(true);
          }
        } catch (err) {
          console.error("Failed visual search fetch:", err);
        } finally {
          setIsAnalyzingPhoto(false);
        }
      };

      reader.onerror = () => {
        setIsAnalyzingPhoto(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsAnalyzingPhoto(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
    setSearchResults(filtered.slice(0, 5));
  }, [searchQuery, products]);

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300 shadow-md border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950 backdrop-blur-md">
      {/* Top Bar for Customer Support */}
      <div className="bg-emerald-600 dark:bg-emerald-800 text-white text-[10px] md:text-xs py-2 px-3 md:px-4 flex justify-between items-center font-sans font-medium">
        <div className="flex items-center gap-2 md:gap-4">
          <a 
            href="tel:+8801609181280" 
            className="hover:text-emerald-100 flex items-center gap-1 transition-colors group cursor-pointer"
            title="Click to Call support phone directly"
          >
            <span className="group-hover:underline">📞 Support: +880 1609-181280</span>
          </a>
          <span className="hidden md:inline">🇧🇩 Proudly Serving Bangladesh with Nationwide Delivery</span>
        </div>
        <div className="flex items-center gap-2.5 md:gap-3">
          <button 
            id="nav-track-btn"
            onClick={() => onNavigate("track-order")} 
            className="hover:underline flex items-center gap-1 cursor-pointer"
          >
            🚚 Track Order
          </button>
          <span className="text-emerald-300">|</span>
          <button 
            id="nav-blog-btn"
            onClick={() => onNavigate("blog")} 
            className="hover:underline flex items-center gap-1 cursor-pointer"
          >
            📰 Blog
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3 md:gap-4">
        {/* Logo */}
        <div 
          id="logo-brand"
          onClick={() => onNavigate("home")} 
          className="flex items-center gap-2 cursor-pointer group shrink-0 select-none"
        >
          <div className="flex items-center gap-1.5 sm:gap-2 h-10">
            {/* Styled Icon Wrapper with Accent Shadow */}
            <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white" strokeWidth={2.5} />
              <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300 -z-10" />
            </div>
            {/* Stylized Logo Typography */}
            <div className="flex flex-col justify-center">
              <div className="flex items-baseline leading-none">
                <span className="font-display font-extrabold text-base sm:text-lg md:text-xl tracking-tight text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors duration-200">
                  ARA
                </span>
                <span className="font-display font-light text-sm sm:text-base tracking-wider text-emerald-500 ml-1">
                  MART
                </span>
              </div>
              <p className="hidden sm:block text-[8px] font-mono text-gray-400 dark:text-gray-500 tracking-widest uppercase font-semibold mt-0.5">Premium E-Commerce</p>
            </div>
          </div>
        </div>

        {/* Desktop Search (Live search engine + Photo Search) */}
        <div className="hidden md:flex flex-1 max-w-lg relative">
          <div className="w-full relative flex items-center">
            <input
              id="desktop-search-input"
              type="text"
              placeholder="Search accessories, gadgets, clothing in Bangladesh..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
                if (photoRecognizedName) setPhotoRecognizedName("");
              }}
              onFocus={() => setShowSearchDropdown(true)}
              className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl py-2.5 pl-4 pr-20 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white transition-all duration-200"
            />
            
            {/* Visual Photo Search Trigger */}
            <div className="absolute right-3 top-2 flex items-center gap-1.5 z-10">
              <label 
                htmlFor="desktop-photo-search" 
                className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-550 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 cursor-pointer flex items-center justify-center transition-colors relative group"
                title="Search with Photo (Powered by Gemini AI)"
              >
                {isAnalyzingPhoto ? (
                  <span className="w-4 h-4 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" />
                ) : (
                  <Camera className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                )}
                <input
                  id="desktop-photo-search"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSearch}
                  className="hidden"
                  disabled={isAnalyzingPhoto}
                />
                
                {/* Tooltip */}
                <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  Search by Photo 📷
                </span>
              </label>
              
              <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-700" />
              <Search className="w-4 h-4 text-gray-400 cursor-pointer hover:text-emerald-500 transition-colors" />
            </div>
          </div>

          {/* Search Dropdown */}
          <AnimatePresence>
            {showSearchDropdown && (searchQuery.trim() !== "" || photoRecognizedName !== "") && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute top-12 left-0 w-full bg-white dark:bg-gray-900 shadow-xl rounded-xl border border-gray-100 dark:border-gray-800 p-2 z-50"
              >
                {/* Visual Search recognition indicator tag */}
                {photoRecognizedName && (
                  <div className="mx-2 mb-2 p-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 rounded-lg flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-300 animate-fade-in font-sans">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                      Visual AI recognized: <strong className="font-bold text-emerald-900 dark:text-emerald-100">{photoRecognizedName}</strong>
                    </span>
                    <button 
                      onClick={() => {
                        setPhotoRecognizedName("");
                        setSearchQuery("");
                      }}
                      className="text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-200 font-bold ml-1 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between px-3 py-1 border-b border-gray-100 dark:border-gray-800 mb-2">
                  <span className="text-xs text-gray-400 uppercase tracking-widest font-mono">Suggested Matches ({searchResults.length})</span>
                  <button 
                    id="close-search-dropdown-btn"
                    onClick={() => setShowSearchDropdown(false)} 
                    className="text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {searchResults.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 p-4 text-center">No products matched "{searchQuery}"</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {searchResults.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          setSearchQuery("");
                          setPhotoRecognizedName("");
                          setShowSearchDropdown(false);
                          onNavigate("product-details", undefined, prod.id);
                        }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      >
                        <img src={prod.images[0]} alt={prod.name} className="w-10 h-10 object-cover rounded-lg" referrerPolicy="no-referrer" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{prod.name}</p>
                          <p className="text-[10px] text-emerald-500 font-medium">{prod.brand} • {prod.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-gray-900 dark:text-white">৳{prod.salePrice}</p>
                          {prod.regularPrice > prod.salePrice && (
                            <p className="text-[10px] text-gray-400 line-through">৳{prod.regularPrice}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Top Navbar Actions (Cart, Wishlist, User, Dark Mode) */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Theme toggler */}
          <button
            id="theme-toggler-btn"
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Mobile Search Button (In place of wishlist on mobile, clicking triggers mobile search focus) */}
          <button
            id="mobile-search-trigger-btn"
            onClick={() => {
              setMobileMenuOpen(true);
              setTimeout(() => {
                const input = document.getElementById("mobile-search-input");
                input?.focus();
              }, 150);
            }}
            className="md:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            title="Search Products"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Wishlist Button (Desktop Only) */}
          <button
            id="wishlist-trigger-btn"
            onClick={() => onNavigate("wishlist")}
            className="hidden md:block p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative cursor-pointer"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Trigger */}
          <button
            id="cart-trigger-btn"
            onClick={() => onNavigate("cart")}
            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative cursor-pointer"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {totalCartItems}
              </span>
            )}
          </button>

          {/* User Section / Portal */}
          {currentUser ? (
            <div className="relative group">
              <button
                id="user-portal-dropdown-btn"
                onClick={() => onNavigate(currentUser.role === "admin" ? "admin-dashboard" : "customer-dashboard")}
                className="flex items-center gap-2 p-1 md:px-3 md:py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-xs uppercase">
                  {currentUser.username[0]}
                </div>
                <span className="hidden lg:inline text-xs font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[80px]">
                  {currentUser.role === "admin" ? "Admin" : currentUser.username}
                </span>
              </button>

              {/* Portal Desktop Dropdown hovering helper */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl py-2 border border-gray-100 dark:border-gray-800 hidden group-hover:block z-50">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 mb-1">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">My Account</p>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{currentUser.email}</p>
                </div>
                {currentUser.role === "admin" ? (
                  <button
                    id="dropdown-admin-dashboard"
                    onClick={() => onNavigate("admin-dashboard")}
                    className="w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" /> Admin Panel
                  </button>
                ) : (
                  <button
                    id="dropdown-customer-dashboard"
                    onClick={() => onNavigate("customer-dashboard")}
                    className="w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                  >
                    <Compass className="w-3.5 h-3.5" /> Dashboard
                  </button>
                )}
                <button
                  id="dropdown-logout"
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 border-t border-gray-100 dark:border-gray-800 mt-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Log Out
                </button>
              </div>
            </div>
          ) : (
            <button
              id="login-redirect-btn"
              onClick={() => onNavigate("customer-login")}
              className="p-2 md:px-4 md:py-2 rounded-xl bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 md:bg-gray-900 md:dark:bg-white text-gray-600 dark:text-gray-300 md:text-white md:dark:text-gray-900 text-xs font-bold hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-1.5"
              title="Register / Sign In"
            >
              <User className="w-5 h-5 md:w-3.5 md:h-3.5" />
              <span className="hidden md:inline">Register / Sign In</span>
            </button>
          )}

          {/* Mobile Menu Toggler icon */}
          <button
            id="mobile-menu-toggler-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors border border-transparent dark:border-gray-800/40"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Desktop Bottom Mega Menu Strip */}
      <nav className="hidden md:block bg-gray-50/95 dark:bg-gray-900/98 border-t border-gray-100 dark:border-gray-800 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              id="nav-shop-all"
              onClick={() => onNavigate("shop")}
              className="py-3 text-xs font-bold text-gray-800 dark:text-gray-200 hover:text-emerald-500 dark:hover:text-emerald-400 tracking-wide uppercase flex items-center gap-1 cursor-pointer"
            >
              🛒 Shop Catalog
            </button>

            {/* Categorized Dropdown List in Navbar Strip */}
            <div className="relative">
              <button
                id="nav-catalog-trigger"
                onMouseEnter={() => setShowMegaMenu(true)}
                onClick={() => setShowMegaMenu(!showMegaMenu)}
                className="py-3 text-xs font-bold text-gray-800 dark:text-gray-200 hover:text-emerald-500 dark:hover:text-emerald-400 tracking-wide uppercase flex items-center gap-1 cursor-pointer"
              >
                🛍️ Browse Categories
              </button>

              <AnimatePresence>
                {showMegaMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    onMouseLeave={() => setShowMegaMenu(false)}
                    className="absolute left-0 top-full bg-white dark:bg-gray-900 shadow-xl rounded-b-xl border-x border-b border-gray-100 dark:border-gray-800 p-4 w-72 grid grid-cols-1 gap-1 z-50 origin-top-left"
                  >
                    <p className="text-[10px] font-mono tracking-widest text-gray-400 uppercase pb-2 border-b border-gray-100 dark:border-gray-800 mb-2">Catalogs</p>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        id={`nav-cat-item-${cat.slug}`}
                        onClick={() => {
                          setShowMegaMenu(false);
                          onNavigate("shop", cat.slug);
                        }}
                        className="text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-emerald-600 dark:hover:text-emerald-300 rounded-lg font-medium transition-all cursor-pointer truncate"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3">
              <button
                id="nav-flash-sales"
                onClick={() => onNavigate("shop", "flash-sale")}
                className="py-3 text-xs font-bold text-gray-800 dark:text-gray-200 hover:text-red-500 dark:hover:text-red-400 tracking-wide uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span className="relative flex h-2 w-2 mr-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
                <span>Flash Deals</span>
                <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400 text-[9px] px-2 py-0.5 rounded-full font-mono font-black border border-red-200/50 dark:border-red-900/30 shadow-sm shadow-red-500/5">
                  ⏰ LIMITED TIME
                </span>
              </button>

              <CountdownTimer />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-sans">
              ARA Mart Guarantee: 100% Authentic Products
            </span>
          </div>
        </div>
      </nav>

      {/* Mobile Menu expanded Drawer overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 absolute top-full left-0 w-full shadow-2xl flex flex-col gap-4 z-40 overflow-hidden"
          >
            {/* Mobile Search input */}
            <div className="w-full relative flex items-center">
              <input
                id="mobile-search-input"
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (photoRecognizedName) setPhotoRecognizedName("");
                }}
                className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl py-2 pl-4 pr-20 text-sm text-gray-900 dark:text-white focus:outline-none"
              />
              
              {/* Mobile Visual Search Trigger */}
              <div className="absolute right-3 top-1.5 flex items-center gap-1.5 z-10">
                <label 
                  htmlFor="mobile-photo-search" 
                  className="p-1 rounded-lg text-gray-400 hover:text-emerald-500 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 cursor-pointer flex items-center justify-center transition-colors"
                >
                  {isAnalyzingPhoto ? (
                    <span className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" />
                  ) : (
                    <Camera className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                  )}
                  <input
                    id="mobile-photo-search"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSearch}
                    className="hidden"
                    disabled={isAnalyzingPhoto}
                  />
                </label>
                <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-700" />
                <Search className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Mobile Photo Recognized Alert Banner */}
            {photoRecognizedName && (
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 rounded-lg flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-300 font-sans">
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                  Recognized: <strong className="font-bold text-emerald-900 dark:text-emerald-100">{photoRecognizedName}</strong>
                </span>
                <button 
                  onClick={() => {
                    setPhotoRecognizedName("");
                    setSearchQuery("");
                  }}
                  className="text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-200 font-bold cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                id="mobile-nav-home"
                onClick={() => { setMobileMenuOpen(false); onNavigate("home"); }}
                className="text-left py-2 text-sm font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-50 dark:border-gray-800/40"
              >
                🏠 Home
              </button>
              <button
                id="mobile-nav-shop"
                onClick={() => { setMobileMenuOpen(false); onNavigate("shop"); }}
                className="text-left py-2 text-sm font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-50 dark:border-gray-800/40"
              >
                🛒 View Catalog Shop
              </button>
              <button
                id="mobile-nav-wishlist"
                onClick={() => { setMobileMenuOpen(false); onNavigate("wishlist"); }}
                className="text-left py-2 text-sm font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-50 dark:border-gray-800/40 flex items-center justify-between"
              >
                <span>❤️ Saved Wishlist ({wishlist.length})</span>
                {wishlist.length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] py-0.5 px-2 rounded-full font-sans font-bold">
                    {wishlist.length} Items
                  </span>
                )}
              </button>
              <button
                id="mobile-nav-track"
                onClick={() => { setMobileMenuOpen(false); onNavigate("track-order"); }}
                className="text-left py-2 text-sm font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-50 dark:border-gray-800/40"
              >
                🚚 Track My Order
              </button>
              <button
                id="mobile-nav-blog"
                onClick={() => { setMobileMenuOpen(false); onNavigate("blog"); }}
                className="text-left py-2 text-sm font-semibold text-gray-800 dark:text-gray-200"
              >
                📰 Blog & News
              </button>
            </div>

            {/* Categories List in Mobile */}
            <div>
              <p className="text-[10px] font-mono tracking-widest text-gray-400 uppercase mb-2">Popular Categories</p>
              <div className="grid grid-cols-2 gap-2">
                {categories.slice(0, 4).map((cat) => (
                  <button
                    key={cat.id}
                    id={`mobile-cat-item-${cat.slug}`}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate("shop", cat.slug);
                    }}
                    className="bg-gray-50 dark:bg-gray-800 p-2.5 rounded-xl text-left text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-600 transition"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
