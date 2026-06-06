import React, { useState, useEffect } from "react";
import { 
  BarChart, Package, ShoppingCart, Users, Settings, Tag, FileText, 
  Trash2, Edit3, Plus, ArrowRight, TrendingUp, AlertTriangle, CheckCircle,
  Clock, Activity, XCircle
} from "lucide-react";
import { Product, Category, Order, Coupon, Blog, WebSettings, User } from "../types.js";

interface AdminPanelProps {
  onNavigate: (page: string) => void;
  token: string;
  onRefreshAssets?: () => void;
}

export default function AdminPanel({ onNavigate, token, onRefreshAssets }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders" | "categories" | "coupons" | "blogs" | "settings" | "accounts">("overview");
  
  // Dynamic business metrics
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [settings, setSettings] = useState<WebSettings | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // States for addition forms
  const [newProduct, setNewProduct] = useState<any>({
    name: "", description: "", shortDescription: "", category: "", brand: "", 
    sku: "", productCode: "", regularPrice: "", discountPercentage: "0", stockQuantity: "10",
    images: [], colorVariations: "Carbon Black", sizeVariations: "",
    featured: false, flashSale: false, video: "", colorImageMap: {}
  });
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [customColorInput, setCustomColorInput] = useState("");
  const [quickCategoryInput, setQuickCategoryInput] = useState("");
  const [quickCategoryError, setQuickCategoryError] = useState("");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; type: "product" | "category" | "coupon" | "blog"; title: string } | null>(null);
  const [resetDbConfirmActive, setResetDbConfirmActive] = useState<boolean>(false);
  const [overviewStatusFilter, setOverviewStatusFilter] = useState<"Pending" | "Live" | "Delivered" | "Cancelled" | null>(null);

  const [newCategory, setNewCategory] = useState({ name: "", slug: "", image: "", icon: "Package" });

  // Helper to generate dynamic next SKU & Product Code suggestions
  const getNextProductSuffix = (prods: Product[]) => {
    if (!prods || prods.length === 0) return { sku: "ARA-PROD-201", code: "201" };
    
    // Find highest numeric suffix or product code
    let maxNum = 200;
    for (const p of prods) {
      if (p.productCode) {
        const num = parseInt(p.productCode.replace(/\D/g, ""));
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
    const nextNum = maxNum + 1;
    return {
      sku: `ARA-PROD-${nextNum}`,
      code: `${nextNum}`
    };
  };

  useEffect(() => {
    if (!editingProductId && products.length > 0) {
      const suggestions = getNextProductSuffix(products);
      setNewProduct(prev => {
        // Only override if they are empty
        if (!prev.sku && !prev.productCode) {
          return {
            ...prev,
            sku: suggestions.sku,
            productCode: suggestions.code
          };
        }
        return prev;
      });
    }
  }, [products, editingProductId]);

  const handleQuickCreateCategory = async () => {
    setQuickCategoryError("");
    const trimmed = quickCategoryInput.trim();
    if (!trimmed) {
      setQuickCategoryError("Category name cannot be empty.");
      return;
    }
    try {
      const slugVal = trimmed.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: trimmed,
          slug: slugVal,
          image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80",
          icon: "Package"
        })
      });
      if (res.ok) {
        setQuickCategoryInput("");
        // Toggles selection for newly created category
        const selectedCats = typeof newProduct.category === "string"
          ? newProduct.category.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [];
        if (!selectedCats.includes(trimmed)) {
          const updated = [...selectedCats, trimmed];
          setNewProduct({ ...newProduct, category: updated.join(", ") });
        }
        await loadAllData();
      } else {
        const errData = await res.json().catch(() => ({}));
        setQuickCategoryError(errData.error || "Failed to add category.");
      }
    } catch {
      setQuickCategoryError("Error creating category branch.");
    }
  };
  const [newCoupon, setNewCoupon] = useState({ code: "", discountType: "Percentage" as any, discountValue: "", minPurchase: "0", expiryDate: "2027-12-31" });
  const [newBlog, setNewBlog] = useState({ title: "", summary: "", content: "", image: "" });

  // System status flags
  const [statusText, setStatusText] = useState("");
  const [errorText, setErrorText] = useState("");

  const clearAlerts = () => {
    setStatusText("");
    setErrorText("");
  };

  const loadAllData = async () => {
    try {
      const headers = { "Authorization": `Bearer ${token}` };

      // Dashboard
      const dashRes = await fetch("/api/admin/dashboard", { headers });
      const dashData = await dashRes.json();
      setDashboardData(dashData);

      // Orders
      const ordRes = await fetch("/api/admin/orders", { headers });
      setOrders(await ordRes.json());

      // Products
      const prodRes = await fetch("/api/products");
      const fetchedProds = await prodRes.json();
      setProducts(fetchedProds);

      // Categories
      const catRes = await fetch("/api/categories");
      setCategories(await catRes.json());

      // Coupons
      const coupRes = await fetch("/api/coupons");
      setCoupons(await coupRes.json());

      // Blogs
      const blogRes = await fetch("/api/blogs");
      setBlogs(await blogRes.json());

      // Settings
      const setRes = await fetch("/api/settings");
      setSettings(await setRes.json());

      // Fetch users accounts list
      const usersRes = await fetch("/api/admin/users", { headers });
      if (usersRes.ok) {
        setUsers(await usersRes.json());
      }

      // Notify App.tsx to instantly reload storefront cache
      if (onRefreshAssets) {
        onRefreshAssets();
      }

    } catch (e) {
      setErrorText("Error communicating with servers. Try reloading.");
    }
  };

  useEffect(() => {
    if (token) {
      loadAllData();
    }
  }, [token, activeTab]);

  // Handle setting updates
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (!settings) return;
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setStatusText("Control settings successfully committed.");
        loadAllData();
      }
    } catch {
      setErrorText("Failed to sync settings.");
    }
  };

  const handleResetDatabase = async (bypassConfirm = false) => {
    if (!bypassConfirm) {
      setResetDbConfirmActive(true);
      return;
    }
    setResetDbConfirmActive(false);
    clearAlerts();
    try {
      const res = await fetch("/api/admin/reset-db", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setStatusText(data.message || "Database reset successful.");
        loadAllData();
      } else {
        setErrorText(data.error || "Failed to reset database.");
      }
    } catch {
      setErrorText("Error communicating with servers for database reset.");
    }
  };

  // Order status progression
  const handleCycleOrder = async (orderId: string, payload: { status: string; paymentStatus?: string }) => {
    clearAlerts();
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setStatusText(`Order ${orderId} successfully advanced.`);
        loadAllData();
      }
    } catch {
      setErrorText("Order status updating failed.");
    }
  };

  // Product submission
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();

    const productImages = Array.isArray(newProduct.images) 
      ? newProduct.images.filter(Boolean) 
      : (newProduct.images ? [newProduct.images] : []);

    const payload = {
      ...newProduct,
      images: productImages.length > 0 ? productImages : ["https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80"],
      colorVariations: typeof newProduct.colorVariations === "string" 
        ? newProduct.colorVariations.split(",").map((s: string) => s.trim()).filter(Boolean) 
        : (Array.isArray(newProduct.colorVariations) ? newProduct.colorVariations : ["Carbon Black"]),
      sizeVariations: typeof newProduct.sizeVariations === "string" 
        ? newProduct.sizeVariations.split(",").map((s: string) => s.trim()).filter(Boolean) 
        : (Array.isArray(newProduct.sizeVariations) ? newProduct.sizeVariations : undefined),
      featured: !!newProduct.featured,
      flashSale: !!newProduct.flashSale
    };

    try {
      const method = editingProductId ? "PUT" : "POST";
      const url = editingProductId ? `/api/admin/products/${editingProductId}` : "/api/admin/products";
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setStatusText(editingProductId ? "Product customized successfully." : "New catalog index created.");
        setNewProduct({
          name: "", description: "", shortDescription: "", category: "", brand: "", 
          sku: "", productCode: "", regularPrice: "", discountPercentage: "0", stockQuantity: "10",
          images: [], colorVariations: "Carbon Black", sizeVariations: "",
          featured: false, flashSale: false, video: "", colorImageMap: {}
        });
        setImageUrlInput("");
        setEditingProductId(null);
        loadAllData();
      } else {
        const errorData = await res.json().catch(() => ({}));
        setErrorText(errorData.error || "Failed to submit product specifications.");
      }
    } catch {
      setErrorText("Database error during saving product.");
    }
  };

  // Product deletion
  const handleDeleteProduct = async (id: string, bypassConfirm = false) => {
    if (!bypassConfirm) {
      setDeleteConfirm({ id, type: "product", title: "Product" });
      return;
    }
    setDeleteConfirm(null);
    clearAlerts();
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setStatusText("Catalog item successfully deleted.");
        loadAllData();
      } else {
        const errorData = await res.json().catch(() => ({}));
        setErrorText(errorData.error || "Failed to execute deletion.");
      }
    } catch {
      setErrorText("Failed to execute deletion.");
    }
  };

  // Quick stock replenishment adjust controls
  const handleQuickStockAdjust = async (id: string, delta: number) => {
    clearAlerts();
    try {
      const prod = products.find((p) => p.id === id);
      if (!prod) return;
      const nextStock = Math.max(0, prod.stockQuantity + delta);
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ stockQuantity: nextStock })
      });
      if (res.ok) {
        setStatusText("Inventory level successfully adjusted.");
        loadAllData();
      } else {
        const errorData = await res.json().catch(() => ({}));
        setErrorText(errorData.error || "Failed to adjust stock.");
      }
    } catch {
      setErrorText("Error communicating with servers during stock adjust.");
    }
  };

  // Category addition
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newCategory)
      });
      if (res.ok) {
        setStatusText("New category classification appended.");
        setNewCategory({ name: "", slug: "", image: "", icon: "Package" });
        loadAllData();
      }
    } catch {
      setErrorText("Failed to insert category.");
    }
  };

  // Category deletion
  const handleDeleteCategory = async (id: string, bypassConfirm = false) => {
    if (!bypassConfirm) {
      setDeleteConfirm({ id, type: "category", title: "Category" });
      return;
    }
    setDeleteConfirm(null);
    clearAlerts();
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setStatusText("Category catalog item deleted successfully.");
        loadAllData();
      }
    } catch {
      setErrorText("Error deleting catalog branch.");
    }
  };

  // Coupon configuration
  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newCoupon)
      });
      if (res.ok) {
        setStatusText("Campaign coupon code configured successfully.");
        setNewCoupon({ code: "", discountType: "Percentage", discountValue: "", minPurchase: "0", expiryDate: "2027-12-31" });
        loadAllData();
      }
    } catch {
      setErrorText("Failed to record coupon.");
    }
  };

  // Coupon deletion
  const handleDeleteCoupon = async (id: string, bypassConfirm = false) => {
    if (!bypassConfirm) {
      setDeleteConfirm({ id, type: "coupon", title: "Promo Coupon" });
      return;
    }
    setDeleteConfirm(null);
    clearAlerts();
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setStatusText("Coupon deleted.");
        loadAllData();
      }
    } catch {
      setErrorText("Failed to purge coupon.");
    }
  };

  // Blog publishing
  const handlePublishBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    try {
      const res = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newBlog)
      });
      if (res.ok) {
        setStatusText("Press release article successfully published.");
        setNewBlog({ title: "", summary: "", content: "", image: "" });
        loadAllData();
      }
    } catch {
      setErrorText("Failed block save on server.");
    }
  };

  const handleDeleteBlog = async (id: string, bypassConfirm = false) => {
    if (!bypassConfirm) {
      setDeleteConfirm({ id, type: "blog", title: "Press Blog Post" });
      return;
    }
    setDeleteConfirm(null);
    clearAlerts();
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setStatusText("Press release article retracted.");
        loadAllData();
      }
    } catch {
      setErrorText("Failed to expire blog node.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans flex flex-col md:flex-row text-xs">
      
      {/* Mobile Top Navigation Tab Strip */}
      <div className="md:hidden bg-indigo-950 text-gray-300 p-4 border-b border-gray-800 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase font-mono tracking-widest text-[#f59e0b] font-black">ARA Mart HQ</span>
          <span className="px-2 py-0.5 bg-yellow-400/10 text-[#f59e0b] font-bold rounded text-[8px] uppercase font-mono">Mobile terminal active</span>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
              activeTab === "overview" ? "bg-emerald-600 text-white" : "bg-gray-800 text-gray-400"
            }`}
          >
            <BarChart className="w-3.5 h-3.5" /> Metrics
          </button>
          <button
            onClick={() => { setActiveTab("products"); setEditingProductId(null); }}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
              activeTab === "products" ? "bg-emerald-600 text-white" : "bg-gray-800 text-gray-400"
            }`}
          >
            <Package className="w-3.5 h-3.5" /> Products (+ Add)
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
              activeTab === "orders" ? "bg-emerald-600 text-white" : "bg-gray-800 text-gray-400"
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" /> Orders
          </button>
          <button
            onClick={() => setActiveTab("accounts")}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
              activeTab === "accounts" ? "bg-emerald-600 text-white" : "bg-gray-800 text-gray-400"
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Customers
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
              activeTab === "categories" ? "bg-emerald-600 text-white" : "bg-gray-800 text-gray-400"
            }`}
          >
            <Package className="w-3.5 h-3.5" /> Classes
          </button>
          <button
            onClick={() => setActiveTab("coupons")}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
              activeTab === "coupons" ? "bg-emerald-600 text-white" : "bg-gray-800 text-gray-400"
            }`}
          >
            <Tag className="w-3.5 h-3.5" /> Coupons
          </button>
          <button
            onClick={() => setActiveTab("blogs")}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
              activeTab === "blogs" ? "bg-emerald-600 text-white" : "bg-gray-800 text-gray-400"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Blogs
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
              activeTab === "settings" ? "bg-emerald-600 text-white" : "bg-gray-800 text-gray-400"
            }`}
          >
            <Settings className="w-3.5 h-3.5" /> Config
          </button>
        </div>
      </div>

      {/* Sidebar Command Suite */}
      <aside className="w-64 bg-gray-900 text-gray-300 hidden md:flex flex-col border-r border-gray-800 p-6 gap-6 shrink-0">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#f59e0b] font-bold">Administrative Dashboard</span>
          <h2 className="text-lg font-display font-bold text-white tracking-tight">ARA Mart HQ</h2>
        </div>

        <nav className="flex flex-col gap-1">
          <button
            id="tab-overview"
            onClick={() => setActiveTab("overview")}
            className={`w-full text-left py-2.5 px-4 rounded-xl font-bold flex items-center gap-3 transition ${
              activeTab === "overview" ? "bg-emerald-600 text-white" : "hover:bg-gray-800 text-gray-400"
            }`}
          >
            <BarChart className="w-4 h-4" /> HQ Live Metrics
          </button>
          <button
            id="tab-products"
            onClick={() => { setActiveTab("products"); setEditingProductId(null); }}
            className={`w-full text-left py-2.5 px-4 rounded-xl font-bold flex items-center gap-3 transition ${
              activeTab === "products" ? "bg-emerald-600 text-white" : "hover:bg-gray-800 text-gray-400"
            }`}
          >
            <Package className="w-4 h-4" /> Products (+ Add New)
          </button>
          <button
            id="tab-orders"
            onClick={() => setActiveTab("orders")}
            className={`w-full text-left py-2.5 px-4 rounded-xl font-bold flex items-center gap-3 transition ${
              activeTab === "orders" ? "bg-emerald-600 text-white" : "hover:bg-gray-800 text-gray-400"
            }`}
          >
            <ShoppingCart className="w-4 h-4" /> Market Orders
          </button>
          <button
            id="tab-accounts"
            onClick={() => setActiveTab("accounts")}
            className={`w-full text-left py-2.5 px-4 rounded-xl font-bold flex items-center gap-3 transition ${
              activeTab === "accounts" ? "bg-emerald-600 text-white" : "hover:bg-gray-800 text-gray-400"
            }`}
          >
            <Users className="w-4 h-4" /> Customer Accounts
          </button>
          <button
            id="tab-categories"
            onClick={() => setActiveTab("categories")}
            className={`w-full text-left py-2.5 px-4 rounded-xl font-bold flex items-center gap-3 transition ${
              activeTab === "categories" ? "bg-emerald-600 text-white" : "hover:bg-gray-800 text-gray-400"
            }`}
          >
            <Package className="w-4 h-4" /> Catalog Classes
          </button>
          <button
            id="tab-coupons"
            onClick={() => setActiveTab("coupons")}
            className={`w-full text-left py-2.5 px-4 rounded-xl font-bold flex items-center gap-3 transition ${
              activeTab === "coupons" ? "bg-emerald-600 text-white" : "hover:bg-gray-800 text-gray-400"
            }`}
          >
            <Tag className="w-4 h-4" /> Coupon Settings
          </button>
          <button
            id="tab-blogs"
            onClick={() => setActiveTab("blogs")}
            className={`w-full text-left py-2.5 px-4 rounded-xl font-bold flex items-center gap-3 transition ${
              activeTab === "blogs" ? "bg-emerald-600 text-white" : "hover:bg-gray-800 text-gray-400"
            }`}
          >
            <FileText className="w-4 h-4" /> Press Release
          </button>
          <button
            id="tab-settings"
            onClick={() => setActiveTab("settings")}
            className={`w-full text-left py-2.5 px-4 rounded-xl font-bold flex items-center gap-3 transition ${
              activeTab === "settings" ? "bg-emerald-600 text-white" : "hover:bg-gray-800 text-gray-400"
            }`}
          >
            <Settings className="w-4 h-4" /> Core Config
          </button>
        </nav>
      </aside>

      {/* Main Terminal Window */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* Notices */}
        {statusText && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl border border-emerald-100 dark:border-emerald-950/40 font-bold mb-6">
            ✅ {statusText}
          </div>
        )}
        {errorText && (
          <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-100 dark:border-red-950/40 font-bold mb-6 font-mono">
            ⚠️ DB EXCEPTION: {errorText}
          </div>
        )}

        {/* METRICS VIEW TAB */}
        {activeTab === "overview" && dashboardData && (() => {
          // Process salesHistory aggregated daily data securely
          const salesByDate: Record<string, number> = {};
          if (dashboardData.salesHistory) {
            dashboardData.salesHistory.forEach((item: any) => {
              const d = item.date;
              salesByDate[d] = (salesByDate[d] || 0) + item.amount;
            });
          }
          const sortedDates = Object.keys(salesByDate).sort();
          const chartValues = sortedDates.map(d => salesByDate[d]);
          const maxVal = Math.max(...chartValues, 5000);

          return (
            <div className="space-y-8 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white font-sans">Business Intelligence Reports</h3>
                  <p className="text-gray-500 mt-1 uppercase tracking-wider text-[9px] font-mono">ARA Mart Global Aggregated Indexes</p>
                </div>
                <span className="px-3 py-1 bg-yellow-105 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-405 font-bold rounded-lg uppercase font-mono text-[9px]">HQ Connection Secure</span>
              </div>

              {/* Quick Management Shortcuts */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl p-5 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4 border border-emerald-500/20">
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base font-display tracking-tight">Need to upload or adjust products?</h4>
                  <p className="text-emerald-100 text-[10px] sm:text-xs font-sans">You can publish new products, upload custom photos, insert display videos, or configure size/color choices easily.</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setActiveTab("products"); setEditingProductId(null); }}
                  className="bg-white text-emerald-700 hover:bg-emerald-50 px-5 py-3 rounded-xl font-black transition-all text-xs cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md hover:scale-[1.02] active:scale-95 duration-200"
                >
                  <Plus className="w-4 h-4 font-extrabold" /> Create & Add Product Form
                </button>
              </div>

              {/* Visual Performance SVG Chart */}
              {sortedDates.length > 0 && (
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-sm animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-xs font-sans">Revenue distribution timeline</h4>
                      <p className="text-[9px] text-gray-400">Aggregated sales track across active transaction codes</p>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded">Live state synchronized</span>
                  </div>

                  <div className="h-40 w-full flex items-end justify-between gap-3 pt-6 border-b border-gray-150 dark:border-gray-800">
                    {sortedDates.map((date, idx) => {
                      const amount = salesByDate[date];
                      const pct = Math.max(8, (amount / maxVal) * 100);
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                          <div
                            style={{ height: `${pct}%` }}
                            className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-lg hover:from-emerald-500 hover:to-teal-350 transition-all duration-300 relative cursor-pointer"
                          >
                            {/* Interactive Micro Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 dark:bg-gray-800 text-white text-[8px] font-mono px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 whitespace-nowrap">
                              ৳{amount} BDT ({date})
                            </div>
                          </div>
                          <span className="text-[8px] text-gray-400 dark:text-gray-500 font-mono mt-1.5 truncate w-full text-center select-none">
                            {date.substring(5)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* General metrics cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-sm">
                  <p className="text-gray-400 uppercase tracking-wider text-[9px] font-mono">Gross Transaction Book</p>
                  <p className="text-lg font-display font-black text-gray-900 dark:text-white mt-2">৳{dashboardData.totals.revenue}</p>
                  <span className="text-[10px] text-emerald-500 flex items-center gap-0.5 mt-1 font-bold">
                    <TrendingUp className="w-3 h-3" /> +14.2% Growth Index
                  </span>
                </div>

                <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-sm">
                  <p className="text-gray-400 uppercase tracking-wider text-[9px] font-mono">Net Paid Sales</p>
                  <p className="text-lg font-display font-black text-gray-900 dark:text-white mt-2">৳{dashboardData.totals.sales}</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">Excluding COD Pending</span>
                </div>

                <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-sm">
                  <p className="text-gray-400 uppercase tracking-wider text-[9px] font-mono">Total Sales Count</p>
                  <p className="text-lg font-display font-black text-gray-900 dark:text-white mt-2">{dashboardData.totals.orders} Orders</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">Registered in cluster state</span>
                </div>

                <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-sm">
                  <p className="text-gray-400 uppercase tracking-wider text-[9px] font-mono">Reg Customers</p>
                  <p className="text-lg font-display font-black text-gray-900 dark:text-white mt-2">{dashboardData.totals.customers}</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">Secure profiles verified</span>
                </div>
              </div>

              {/* HQ Live Pipeline Trackers */}
              {(() => {
                const pendingOrdersList = orders.filter(o => o.status === "Pending");
                const liveOrdersList = orders.filter(o => o.status === "Processing" || o.status === "Shipped");
                const completedOrdersList = orders.filter(o => o.status === "Delivered");
                const cancelledOrdersList = orders.filter(o => o.status === "Cancelled");

                const pendingCount = pendingOrdersList.length;
                const pendingTotal = pendingOrdersList.reduce((acc, o) => acc + o.total, 0);

                const liveCount = liveOrdersList.length;
                const liveTotal = liveOrdersList.reduce((acc, o) => acc + o.total, 0);

                const completedCount = completedOrdersList.length;
                const completedTotal = completedOrdersList.reduce((acc, o) => acc + o.total, 0);

                const cancelledCount = cancelledOrdersList.length;
                const cancelledTotal = cancelledOrdersList.reduce((acc, o) => acc + o.total, 0);

                return (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest font-mono">📊 Live Order Pipeline Metrics (অর্ডার পাইপলাইন ট্র্যাকার)</h4>
                      </div>
                      {overviewStatusFilter && (
                        <button
                          onClick={() => setOverviewStatusFilter(null)}
                          className="text-[10px] text-red-500 hover:text-red-400 border border-red-500/10 px-2 py-0.5 rounded-lg font-bold font-mono transition bg-red-50/10 cursor-pointer"
                        >
                          Clear Active Segment Filter [x]
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                      {/* PENDING CARD */}
                      <div 
                        onClick={() => setOverviewStatusFilter(overviewStatusFilter === "Pending" ? null : "Pending")}
                        className={`p-5 rounded-3xl border transition-all duration-200 cursor-pointer relative overflow-hidden group select-none ${
                          overviewStatusFilter === "Pending" 
                            ? "bg-amber-500/10 border-amber-500 shadow-md ring-2 ring-amber-500/20" 
                            : "bg-white dark:bg-gray-900 border-gray-150 dark:border-gray-800 shadow-xs hover:border-amber-400 dark:hover:border-amber-950 hover:scale-[1.01]"
                        }`}
                      >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full translate-x-6 -translate-y-6 group-hover:scale-125 transition-transform duration-300 pointer-events-none" />
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center animate-pulse">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">Pending Orders</p>
                            <p className="text-[9px] text-amber-600 dark:text-amber-405 font-medium font-sans">অপেক্ষমান অর্ডার</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-baseline justify-between">
                          <p className="text-2xl font-black text-gray-950 dark:text-white tracking-tight">{pendingCount}</p>
                          <p className="text-[11px] font-bold font-mono text-gray-500 dark:text-gray-300">৳{pendingTotal}</p>
                        </div>
                        <div className="mt-2 text-[9px] text-gray-500 dark:text-gray-400 font-sans flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                          Awaiting Response (ক্লিক করুন)
                        </div>
                      </div>

                      {/* LIVE ORDERS CARD */}
                      <div 
                        onClick={() => setOverviewStatusFilter(overviewStatusFilter === "Live" ? null : "Live")}
                        className={`p-5 rounded-3xl border transition-all duration-200 cursor-pointer relative overflow-hidden group select-none ${
                          overviewStatusFilter === "Live" 
                            ? "bg-blue-500/10 border-blue-500 shadow-md ring-2 ring-blue-500/20" 
                            : "bg-white dark:bg-gray-900 border-gray-150 dark:border-gray-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-950 hover:scale-[1.01]"
                        }`}
                      >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full translate-x-6 -translate-y-6 group-hover:scale-125 transition-transform duration-300 pointer-events-none" />
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <Activity className="w-4 h-4 animate-pulse" />
                          </div>
                          <div>
                            <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">Live / Active</p>
                            <p className="text-[9px] text-blue-600 dark:text-blue-405 font-medium font-sans">চলতি অর্ডার</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-baseline justify-between">
                          <p className="text-2xl font-black text-gray-950 dark:text-white tracking-tight">{liveCount}</p>
                          <p className="text-[11px] font-bold font-mono text-gray-500 dark:text-gray-300">৳{liveTotal}</p>
                        </div>
                        <div className="mt-2 text-[9px] text-gray-500 dark:text-gray-400 font-sans flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span>
                          Processing & Shipped (ক্লিক করুন)
                        </div>
                      </div>

                      {/* COMPLETE CARD */}
                      <div 
                        onClick={() => setOverviewStatusFilter(overviewStatusFilter === "Delivered" ? null : "Delivered")}
                        className={`p-5 rounded-3xl border transition-all duration-200 cursor-pointer relative overflow-hidden group select-none ${
                          overviewStatusFilter === "Delivered" 
                            ? "bg-emerald-500/10 border-emerald-500 shadow-md ring-2 ring-emerald-500/20" 
                            : "bg-white dark:bg-gray-900 border-gray-150 dark:border-gray-800 shadow-xs hover:border-emerald-400 dark:hover:border-emerald-950 hover:scale-[1.01]"
                        }`}
                      >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full translate-x-6 -translate-y-6 group-hover:scale-125 transition-transform duration-300 pointer-events-none" />
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">Complete Orders</p>
                            <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium font-sans">সফল ডেলিভারি</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-baseline justify-between">
                          <p className="text-2xl font-black text-gray-950 dark:text-white tracking-tight">{completedCount}</p>
                          <p className="text-[11px] font-bold font-mono text-gray-500 dark:text-gray-300">৳{completedTotal}</p>
                        </div>
                        <div className="mt-2 text-[9px] text-gray-500 dark:text-gray-400 font-sans flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                          Delivered to Customer (ক্লিক করুন)
                        </div>
                      </div>

                      {/* CANCELLED CARD */}
                      <div 
                        onClick={() => setOverviewStatusFilter(overviewStatusFilter === "Cancelled" ? null : "Cancelled")}
                        className={`p-5 rounded-3xl border transition-all duration-200 cursor-pointer relative overflow-hidden group select-none ${
                          overviewStatusFilter === "Cancelled" 
                            ? "bg-red-500/10 border-red-500 shadow-md ring-2 ring-red-500/20" 
                            : "bg-white dark:bg-gray-900 border-gray-150 dark:border-gray-800 shadow-xs hover:border-red-400 dark:hover:border-red-950 hover:scale-[1.01]"
                        }`}
                      >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/5 rounded-full translate-x-6 -translate-y-6 group-hover:scale-125 transition-transform duration-300 pointer-events-none" />
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-650 dark:text-red-400 flex items-center justify-center">
                            <XCircle className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">Cancelled Orders</p>
                            <p className="text-[9px] text-red-600 dark:text-red-405 font-medium font-sans">বাতিল অর্ডার</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-baseline justify-between">
                          <p className="text-2xl font-black text-gray-950 dark:text-white tracking-tight">{cancelledCount}</p>
                          <p className="text-[11px] font-bold font-mono text-gray-500 dark:text-gray-300">৳{cancelledTotal}</p>
                        </div>
                        <div className="mt-2 text-[9px] text-gray-500 dark:text-gray-400 font-sans flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                          Retracted Orders (ক্লিক করুন)
                        </div>
                      </div>
                    </div>

                    {/* INTERACTIVE WORKFLOW STATUS STREAM VIEWER */}
                    {overviewStatusFilter && (() => {
                      const filteredList = orders.filter(ord => {
                        if (overviewStatusFilter === "Pending") return ord.status === "Pending";
                        if (overviewStatusFilter === "Live") return ord.status === "Processing" || ord.status === "Shipped";
                        if (overviewStatusFilter === "Delivered") return ord.status === "Delivered";
                        if (overviewStatusFilter === "Cancelled") return ord.status === "Cancelled";
                        return false;
                      });

                      return (
                        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-xs space-y-4 animate-fade-in">
                          <div className="flex items-center justify-between border-b border-gray-150 dark:border-gray-800 pb-3">
                            <div className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full animate-ping ${
                                overviewStatusFilter === "Pending" ? "bg-amber-500" :
                                overviewStatusFilter === "Live" ? "bg-blue-500" :
                                overviewStatusFilter === "Delivered" ? "bg-emerald-500" : "bg-red-500"
                              }`} />
                              <h5 className="font-bold text-gray-950 dark:text-white font-mono text-[11px] uppercase tracking-wide">
                                Realtime Stream Filter: {overviewStatusFilter} Orders ({filteredList.length} items found)
                              </h5>
                            </div>
                            <button 
                              onClick={() => setOverviewStatusFilter(null)}
                              className="px-2 py-1 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-750 text-[10px] rounded-lg font-bold text-gray-500 dark:text-gray-300 transition cursor-pointer"
                            >
                              Close Filter
                            </button>
                          </div>

                          {filteredList.length === 0 ? (
                            <p className="text-center py-6 text-gray-400 font-mono text-[10px]">
                              No transaction logs currently match the {overviewStatusFilter} parameter list.
                            </p>
                          ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800/60 max-h-[420px] overflow-y-auto pr-1 space-y-3.5">
                              {filteredList.map((ord) => (
                                <div key={ord.id} className="pt-3.5 first:pt-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                  <div className="space-y-1.5 min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-bold text-gray-950 dark:text-white font-mono text-[11px]">{ord.invoiceNumber}</span>
                                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono tracking-wider ${
                                        ord.paymentStatus === "Paid" ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400" : "bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-400"
                                      }`}>
                                        {ord.paymentStatus}
                                      </span>
                                      <span className="text-[9px] text-gray-400 font-mono">🚚 Tracking: {ord.trackingCode}</span>
                                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${
                                        ord.status === "Pending" ? "bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400" :
                                        ord.status === "Processing" ? "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400" :
                                        ord.status === "Shipped" ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400" :
                                        ord.status === "Delivered" ? "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400" :
                                        "bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400"
                                      }`}>
                                        {ord.status}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-0.5 dark:text-gray-400">
                                      {ord.customerName} ({ord.phone}) • {ord.address}, {ord.district}
                                    </p>
                                    
                                    {/* Items block */}
                                    <div className="flex flex-wrap gap-2 pt-1 border-t border-dashed border-gray-100 dark:border-gray-800/80">
                                      {ord.items.map((item) => (
                                        <div key={item.id} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-850/40 rounded-lg p-1 pr-2 border border-gray-100 dark:border-gray-800 text-[9px]">
                                          <img 
                                            src={item.image} 
                                            alt={item.name} 
                                            className="w-5 h-5 object-cover rounded" 
                                            referrerPolicy="no-referrer"
                                          />
                                          <span className="text-gray-800 dark:text-gray-200 font-medium truncate max-w-[140px]">{item.name}</span>
                                          <span className="text-gray-400 font-mono">x{item.quantity}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 w-full md:w-auto self-end md:self-center justify-between md:justify-end border-t md:border-t-0 border-gray-100 dark:border-gray-800/60 pt-3 md:pt-0">
                                    <div className="text-right">
                                      <p className="font-extrabold text-gray-950 dark:text-white">৳{ord.total}</p>
                                      <p className="text-[9px] text-gray-400 font-mono">via {ord.paymentMethod}</p>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <select
                                        id={`quick-status-change-ref-${ord.id}`}
                                        value={ord.status}
                                        onChange={(e) => handleCycleOrder(ord.id, { status: e.target.value as any })}
                                        className="bg-gray-50 dark:bg-gray-805 text-[10px] rounded p-1 text-gray-900 dark:text-white focus:outline-none border border-gray-200 dark:border-gray-700 cursor-pointer font-bold"
                                      >
                                        <option value="Pending">Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                      </select>

                                      {ord.paymentStatus !== "Paid" && (
                                        <button
                                          id={`quick-status-change-paid-ref-${ord.id}`}
                                          onClick={() => handleCycleOrder(ord.id, { status: ord.status, paymentStatus: "Paid" })}
                                          className="p-1 px-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 hover:bg-emerald-100 rounded text-[9px] font-black cursor-pointer border border-emerald-500/10 transition"
                                        >
                                          Mark Paid
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                );
              })()}

              {/* Stock warnings banner */}
              <div className="bg-amber-50 dark:bg-amber-950/20 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/40 flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-amber-900 dark:text-amber-400 text-sm">Low Stock Alarm Indicators</h4>
                  <p className="text-gray-600 dark:text-gray-400 mt-1 text-xs font-medium">These active catalog products are carrying less than 10 units in stock quantity balance interfaces. Replenishment ordered.</p>
                  <div className="mt-3 flex flex-wrap gap-2 animate-fade-in">
                    {dashboardData.lowStock.map((prod: Product) => (
                      <span key={prod.id} className="bg-white dark:bg-gray-900 px-3 py-1 rounded-lg text-[10px] border border-gray-200 dark:border-gray-800 font-bold shadow-sm">
                        {prod.name} ({prod.stockQuantity} Left)
                      </span>
                    ))}
                    {dashboardData.lowStock.length === 0 && <span className="text-xs text-gray-500 font-bold font-mono">All catalogs hold optimum quantities.</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* CATALOG INVENTORY EDITOR */}
        {activeTab === "products" && (
          <div className="space-y-8 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-md font-display font-semibold text-gray-900 dark:text-white">
                  {editingProductId ? `Edit Product: ${newProduct.name}` : "Create/Add Catalog Product"}
                </h3>
                <p className="text-gray-400 text-[10px]">Add physical assets into database arrays</p>
              </div>
              {editingProductId && (
                <button
                  id="cancel-edit-product"
                  onClick={() => {
                    setEditingProductId(null);
                    setNewProduct({
                      name: "", description: "", shortDescription: "", category: "", brand: "", 
                      sku: "", productCode: "", regularPrice: "", discountPercentage: "0", stockQuantity: "10",
                      images: [], colorVariations: "Carbon Black", sizeVariations: "",
                      featured: false, flashSale: false, video: ""
                    });
                  }}
                  className="bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded-lg border text-gray-700 font-bold"
                >
                  Cancel Custom Editing
                </button>
              )}
            </div>

            <form onSubmit={handleProductSubmit} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Product Name *</label>
                <input
                  id="admin-prod-name"
                  type="text" required
                  value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-500 border-none text-gray-950 dark:text-white"
                  placeholder="Amoled Smartwatch Elite"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1 text-[11px] flex items-center gap-1">
                  📁 Category Classifications * <span className="text-[9px] font-normal text-gray-400 dark:text-gray-500">(Choose multiple below)</span>
                </label>
                
                {(() => {
                  const selectedCats = typeof newProduct.category === "string"
                    ? newProduct.category.split(",").map((s: string) => s.trim()).filter(Boolean)
                    : [];

                  const handleCategoryToggle = (catName: string) => {
                    let updated: string[];
                    if (selectedCats.includes(catName)) {
                      updated = selectedCats.filter((c) => c !== catName);
                    } else {
                      updated = [...selectedCats, catName];
                    }
                    setNewProduct({ ...newProduct, category: updated.join(", ") });
                  };

                  return (
                    <div className="bg-gray-50/50 dark:bg-gray-950/25 p-3 rounded-xl border border-gray-150 dark:border-gray-800 space-y-3">
                      {/* Active badge list */}
                      <div>
                        <span className="text-[9px] text-gray-400 font-mono uppercase block mb-1">Selected:</span>
                        <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                          {selectedCats.length === 0 ? (
                            <span className="text-gray-400 dark:text-gray-500 text-[10px] italic">No categories selected. Please tap available branches below.</span>
                          ) : (
                            selectedCats.map((cat, idx) => (
                              <span 
                                key={idx} 
                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/30 rounded-full text-[10.5px] font-semibold text-emerald-700 dark:text-emerald-400 shadow-xs"
                              >
                                <span>{cat}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCategoryToggle(cat)}
                                  className="text-emerald-600 dark:text-emerald-500 hover:text-red-500 rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold text-[9px] focus:outline-none transition cursor-pointer"
                                >
                                  ✕
                                </button>
                              </span>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Options Grid */}
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-800/40">
                        <span className="text-[9px] text-gray-400 font-mono uppercase block mb-1.5">Tap catalog branches to add/remove:</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                          {categories.map((c) => {
                            const isSelected = selectedCats.includes(c.name);
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => handleCategoryToggle(c.name)}
                                className={`flex items-center gap-1.5 p-1.5 px-2.5 rounded-lg text-[10px] border text-left font-bold transition-all duration-200 cursor-pointer ${
                                  isSelected 
                                    ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/50" 
                                    : "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-850 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 shadow-xs"
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                <span className="truncate">{c.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Create Category Option directly from there */}
                      <div className="pt-3 border-t border-gray-100 dark:border-gray-800/40">
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold block mb-1">
                          ➕ Can't find a category? Add direct option:
                        </span>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="Add New Category (e.g. Smart Projectors)"
                            value={quickCategoryInput}
                            onChange={(e) => setQuickCategoryInput(e.target.value)}
                            onKeyDown={async (e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                await handleQuickCreateCategory();
                              }
                            }}
                            className="flex-grow bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-2.5 py-1 text-[11px] text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={handleQuickCreateCategory}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] px-3 rounded-lg active:scale-95 transition cursor-pointer"
                          >
                            + Add Branch
                          </button>
                        </div>
                        {quickCategoryError && (
                          <span className="text-[9.5px] text-red-500 mt-1 block">{quickCategoryError}</span>
                        )}
                      </div>

                      {/* Hidden validator input */}
                      <input 
                        type="text" 
                        className="hidden w-0 h-0" 
                        required 
                        value={newProduct.category} 
                        onChange={() => {}}
                      />
                    </div>
                  );
                })()}
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Brand Name *</label>
                <input
                  id="admin-prod-brand"
                  type="text" required
                  value={newProduct.brand} onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-500 border-none text-gray-950 dark:text-white"
                  placeholder="Anker / Lenovo"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold">Stock SKU code *</label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const currentSku = newProduct.sku || "";
                        const m = currentSku.match(/(\d+)$/);
                        if (m) {
                          const numDigits = m[1].length;
                          const val = parseInt(m[1], 10);
                          const newVal = String(val + 1).padStart(numDigits, "0");
                          const updatedSku = currentSku.substring(0, m.index) + newVal;
                          setNewProduct({ ...newProduct, sku: updatedSku });
                        } else {
                          setNewProduct({ ...newProduct, sku: currentSku + "1" });
                        }
                      }}
                      className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 active:scale-95 rounded text-[9px] font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-200 transition cursor-pointer"
                      title="Increment last digit"
                    >
                      +1 SKU
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const currentSku = newProduct.sku || "";
                        const m = currentSku.match(/(\d+)$/);
                        if (m) {
                          const numDigits = m[1].length;
                          const val = parseInt(m[1], 10);
                          const newVal = String(Math.max(0, val - 1)).padStart(numDigits, "0");
                          const updatedSku = currentSku.substring(0, m.index) + newVal;
                          setNewProduct({ ...newProduct, sku: updatedSku });
                        }
                      }}
                      className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 active:scale-95 rounded text-[9px] font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-200 transition cursor-pointer"
                      title="Decrement last digit"
                    >
                      -1 SKU
                    </button>
                  </div>
                </div>
                <input
                  id="admin-prod-sku"
                  type="text" required
                  value={newProduct.sku} onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-500 border-none text-gray-950 dark:text-white font-mono text-sm"
                  placeholder="ARA-HD-XXXX"
                />
                <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-1">Default code is set; customize/increment the last digits.</p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold">Stock Product Code *</label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const currentCode = newProduct.productCode || "";
                        const m = currentCode.match(/(\d+)$/);
                        if (m) {
                          const numDigits = m[1].length;
                          const val = parseInt(m[1], 10);
                          const newVal = String(val + 1).padStart(numDigits, "0");
                          const updatedCode = currentCode.substring(0, m.index) + newVal;
                          setNewProduct({ ...newProduct, productCode: updatedCode });
                        } else {
                          setNewProduct({ ...newProduct, productCode: currentCode + "1" });
                        }
                      }}
                      className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 active:scale-95 rounded text-[9px] font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-200 transition cursor-pointer"
                    >
                      +1 Code
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const currentCode = newProduct.productCode || "";
                        const m = currentCode.match(/(\d+)$/);
                        if (m) {
                          const numDigits = m[1].length;
                          const val = parseInt(m[1], 10);
                          const newVal = String(Math.max(0, val - 1)).padStart(numDigits, "0");
                          const updatedCode = currentCode.substring(0, m.index) + newVal;
                          setNewProduct({ ...newProduct, productCode: updatedCode });
                        }
                      }}
                      className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 active:scale-95 rounded text-[9px] font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-200 transition cursor-pointer"
                    >
                      -1 Code
                    </button>
                  </div>
                </div>
                <input
                  id="admin-prod-code"
                  type="text" required
                  value={newProduct.productCode} onChange={(e) => setNewProduct({ ...newProduct, productCode: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-500 border-none text-gray-950 dark:text-white font-mono text-sm"
                  placeholder="100X"
                />
                <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-1">Numerical index sequence generated automatically.</p>
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Stock Quantity Balance *</label>
                <input
                  id="admin-prod-stock"
                  type="number" required
                  value={newProduct.stockQuantity} onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-500 border-none text-gray-950 dark:text-white"
                  placeholder="10"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Regular Price Index *</label>
                <input
                  id="admin-prod-price"
                  type="number" required
                  value={newProduct.regularPrice} onChange={(e) => setNewProduct({ ...newProduct, regularPrice: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-500 border-none text-gray-950 dark:text-white font-mono"
                  placeholder="Regular Selling Price"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Discount % Markdown</label>
                <input
                  id="admin-prod-discount"
                  type="number"
                  value={newProduct.discountPercentage} onChange={(e) => setNewProduct({ ...newProduct, discountPercentage: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-500 border-none text-gray-950 dark:text-white font-mono"
                  placeholder="0 if none"
                />
              </div>
              <div className="md:col-span-3 bg-gray-50 dark:bg-gray-950 p-5 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Image Section */}
                <div className="space-y-4">
                  <span className="block text-gray-900 dark:text-white font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1.5">🖼️ Product Multiple Images Upload</span>
                  
                  <div>
                    <label className="block text-gray-500 dark:text-gray-400 font-semibold mb-1">Upload Local Image Files (Multiple allowed)</label>
                    <div className="relative flex items-center justify-center p-3 border-2 border-dashed border-emerald-500/20 hover:border-emerald-500/40 rounded-xl bg-white dark:bg-gray-900 transition group cursor-pointer text-center">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            const newImages: string[] = [];
                            let loadedCount = 0;
                            const targetLength = files.length;
                            
                            for (let i = 0; i < files.length; i++) {
                              const file = files[i];
                              const reader = new FileReader();
                              reader.onload = () => {
                                if (typeof reader.result === "string") {
                                  newImages[i] = reader.result;
                                }
                                loadedCount++;
                                if (loadedCount === targetLength) {
                                  const validNew = newImages.filter(Boolean);
                                  setNewProduct(prev => {
                                    const currentImages = Array.isArray(prev.images) ? prev.images : (prev.images ? [prev.images] : []);
                                    return { 
                                      ...prev, 
                                      images: [...currentImages, ...validNew] 
                                    };
                                  });
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="space-y-1">
                        <span className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline">📷 Choose One or More Images</span>
                        <span className="block text-[8px] text-gray-400">Supports JPG, PNG, WEBP, GIF formats</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-500 dark:text-gray-400 font-semibold mb-1">Or Add Image Address URL</label>
                    <div className="flex gap-2">
                      <input
                        id="admin-prod-img-url"
                        type="text"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        className="flex-1 bg-white dark:bg-gray-900 rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-500 border border-gray-200 dark:border-gray-800 text-gray-950 dark:text-white font-mono text-xs"
                        placeholder="e.g. https://images.unsplash.com/your-image.jpg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (imageUrlInput.trim()) {
                            setNewProduct(prev => {
                              const currentImages = Array.isArray(prev.images) ? prev.images : (prev.images ? [prev.images] : []);
                              return {
                                ...prev,
                                images: [...currentImages, imageUrlInput.trim()]
                              };
                            });
                            setImageUrlInput("");
                          }
                        }}
                        className="bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-bold px-3 py-2 rounded-lg text-xs shrink-0 cursor-pointer"
                      >
                        Add URL
                      </button>
                    </div>
                  </div>

                  {/* Gallery List Preview */}
                  {Array.isArray(newProduct.images) && newProduct.images.length > 0 && (
                    <div className="space-y-2 pt-1 border-t border-gray-150 dark:border-gray-800">
                      <span className="block text-[9.5px] uppercase font-mono font-bold text-gray-500 dark:text-gray-400">
                        Selected Gallery ({newProduct.images.length} images)
                      </span>
                      <div className="grid grid-cols-4 gap-3 border border-gray-100 dark:border-gray-800 p-2.5 rounded-xl bg-white dark:bg-gray-900/50">
                        {newProduct.images.map((imgUrl, index) => {
                          const selectedColors = typeof newProduct.colorVariations === "string"
                            ? newProduct.colorVariations.split(",").map((s: string) => s.trim()).filter(Boolean)
                            : (Array.isArray(newProduct.colorVariations) ? newProduct.colorVariations : []);
                          
                          const currentMap = newProduct.colorImageMap || {};
                          const mappedColor = Object.keys(currentMap).find(k => currentMap[k] === imgUrl) || "";

                          return (
                            <div key={index} className="space-y-1.5 flex flex-col">
                              <div className="relative aspect-square group rounded-lg overflow-hidden border border-gray-250 dark:border-gray-850 bg-gray-50 dark:bg-gray-800">
                                <img
                                  src={imgUrl}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                {/* Position Overlay */}
                                <span className="absolute top-1 left-1 bg-gray-950/80 text-white font-mono text-[8px] font-bold px-1 py-0.5 rounded select-none">
                                  #{index + 1}
                                </span>
                                {/* Actions Overlay */}
                                <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                  {index > 0 && (
                                    <button
                                      type="button"
                                      title="Move Left"
                                      onClick={() => {
                                        setNewProduct(prev => {
                                          const arr = [...prev.images];
                                          const temp = arr[index];
                                          arr[index] = arr[index - 1];
                                          arr[index - 1] = temp;
                                          return { ...prev, images: arr };
                                        });
                                      }}
                                      className="w-5 h-5 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-white text-[9px] cursor-pointer"
                                    >
                                      ←
                                    </button>
                                  )}
                                  {index < newProduct.images.length - 1 && (
                                    <button
                                      type="button"
                                      title="Move Right"
                                      onClick={() => {
                                        setNewProduct(prev => {
                                          const arr = [...prev.images];
                                          const temp = arr[index];
                                          arr[index] = arr[index + 1];
                                          arr[index + 1] = temp;
                                          return { ...prev, images: arr };
                                        });
                                      }}
                                      className="w-5 h-5 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 text-white text-[9px] cursor-pointer"
                                    >
                                      →
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    title="Delete Photo"
                                    onClick={() => {
                                      setNewProduct(prev => {
                                        const updatedMap = { ...(prev.colorImageMap || {}) };
                                        for (const key of Object.keys(updatedMap)) {
                                          if (updatedMap[key] === imgUrl) {
                                            delete updatedMap[key];
                                          }
                                        }
                                        return {
                                          ...prev,
                                          images: prev.images.filter((_, idx) => idx !== index),
                                          colorImageMap: updatedMap
                                        };
                                      });
                                    }}
                                    className="w-5 h-5 flex items-center justify-center rounded bg-red-600 hover:bg-red-500 text-white text-[9px] cursor-pointer font-bold"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                              {/* Color dropdown selector */}
                              {selectedColors.length > 0 && (
                                <div className="space-y-0.5">
                                  <label className="text-[8px] text-gray-400 dark:text-gray-500 font-bold block leading-none">Map Color:</label>
                                  <select
                                    value={mappedColor}
                                    onChange={(e) => {
                                      const chosenCol = e.target.value;
                                      setNewProduct(prev => {
                                        const updatedMap = { ...(prev.colorImageMap || {}) };
                                        if (chosenCol) {
                                          updatedMap[chosenCol] = imgUrl;
                                        }
                                        if (mappedColor && mappedColor !== chosenCol) {
                                          delete updatedMap[mappedColor];
                                        }
                                        return { ...prev, colorImageMap: updatedMap };
                                      });
                                    }}
                                    className="w-full bg-gray-100 dark:bg-gray-800 text-gray-950 dark:text-white border-none rounded px-1 py-0.5 text-[9px] focus:ring-1 focus:ring-emerald-500 font-semibold cursor-pointer outline-none"
                                  >
                                    <option value="">🌈 None</option>
                                    {selectedColors.map((col) => (
                                      <option key={col} value={col}>
                                        {col}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setNewProduct({ ...newProduct, images: [] })}
                          className="text-[9.5px] text-red-500 hover:underline font-bold hover:text-red-400"
                        >
                          Reset / Clear All Photos
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Section */}
                <div className="space-y-3 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-800 pt-5 md:pt-0 md:pl-5">
                  <span className="block text-gray-900 dark:text-white font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1.5">🎥 Product Video Upload & Link</span>
                  
                  <div>
                    <label className="block text-gray-500 dark:text-gray-400 font-semibold mb-1">Direct Upload Local Video File</label>
                    <div className="relative flex items-center justify-center p-3.5 border-2 border-dashed border-cyan-500/20 hover:border-cyan-500/40 rounded-xl bg-white dark:bg-gray-900 transition group cursor-pointer text-center">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (typeof reader.result === "string") {
                                setNewProduct(prev => ({ ...prev, video: reader.result }));
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="space-y-1">
                        <span className="block text-xs font-bold text-cyan-600 dark:text-cyan-400 group-hover:underline">🎥 Click & Choose Video File</span>
                        <span className="block text-[8px] text-gray-400">Supports MP4, WebM formats</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-500 dark:text-gray-400 font-semibold mb-0.5">Or Paste Direct Video Address URL (Optional)</label>
                    <input
                      id="admin-prod-vid-url"
                      type="text"
                      value={newProduct.video || ""}
                      onChange={(e) => setNewProduct({ ...newProduct, video: e.target.value })}
                      className="w-full bg-white dark:bg-gray-900 rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-500 border border-gray-200 dark:border-gray-800 text-gray-950 dark:text-white font-mono"
                      placeholder="e.g. https://www.w3schools.com/html/mov_bbb.mp4"
                    />
                  </div>

                  {newProduct.video && (
                    <div className="p-2.5 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg border bg-black flex items-center justify-center text-sm shadow-inner select-none pointer-events-none">
                          🎬
                        </div>
                        <div className="text-[10px] truncate flex-1 leading-normal">
                          <span className="text-cyan-500 font-bold block">✓ Video Selected</span>
                          <span className="text-gray-400 text-[8px] font-mono block truncate">
                            {newProduct.video.startsWith("data:") ? "Assembled Base64 Stream Source" : newProduct.video}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNewProduct({ ...newProduct, video: "" })}
                          className="text-red-500 font-bold hover:underline px-2 text-xs"
                        >
                          Reset
                        </button>
                      </div>

                      {/* Instant live player preview */}
                      <div className="border border-gray-150 dark:border-gray-800 rounded-lg overflow-hidden max-h-24 bg-black">
                        <video src={newProduct.video} controls className="w-full max-h-24 object-contain" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-3 space-y-3">
                <label className="block text-gray-700 dark:text-gray-300 font-bold text-xs">
                  Aesthetic Color variations (অ্যাক্টিভ কালার সেটআপ)
                </label>
                
                {/* Active selection pills */}
                {(() => {
                  const selectedColors = typeof newProduct.colorVariations === "string"
                    ? newProduct.colorVariations.split(",").map((s: string) => s.trim()).filter(Boolean)
                    : (Array.isArray(newProduct.colorVariations) ? newProduct.colorVariations : []);

                  const getColorPreview = (colorName: string) => {
                    const norm = colorName.toLowerCase().trim();
                    if (norm.includes("black") || norm === "slate" || norm === "dark") return "#111827";
                    if (norm.includes("white") || norm === "milk" || norm === "light") return "#f3f4f6";
                    if (norm.includes("gold") || norm.includes("silver") || norm === "yellow") return "#e5c158";
                    if (norm.includes("gray") || norm.includes("grey") || norm === "titanium") return "#6b7280";
                    if (norm.includes("green") || norm === "emerald" || norm === "mint") return "#10b981";
                    if (norm.includes("blue") || norm === "navy" || norm === "royal" || norm === "sky") return "#3b82f6";
                    if (norm.includes("red") || norm === "crimson" || norm === "cherry") return "#ef4444";
                    if (norm.includes("rose") || norm === "pink") return "#f43f5e";
                    if (norm.includes("violet") || norm.includes("purple") || norm === "amethyst") return "#8b5cf6";
                    if (norm.includes("orange") || norm === "sunset") return "#f97316";
                    return "#14b8a6"; // default teal
                  };

                  const handleAdd = (color: string) => {
                    const trimmed = color.trim();
                    if (!trimmed) return;
                    if (selectedColors.some((c: string) => c.toLowerCase() === trimmed.toLowerCase())) return;
                    const updated = [...selectedColors, trimmed];
                    setNewProduct({ ...newProduct, colorVariations: updated.join(", ") });
                  };

                  const handleRemove = (color: string) => {
                    const updated = selectedColors.filter((c: string) => c !== color);
                    setNewProduct({ ...newProduct, colorVariations: updated.join(", ") });
                  };

                  const presets = [
                    { name: "Carbon Black", hex: "#111827" },
                    { name: "Milk White", hex: "#f3f4f6", border: true },
                    { name: "Silver Gold", hex: "#e5c158" },
                    { name: "Titanium Gray", hex: "#6b7280" },
                    { name: "Royal Blue", hex: "#1d4ed8" },
                    { name: "Crimson Red", hex: "#b91c1c" },
                    { name: "Emerald Green", hex: "#047857" },
                    { name: "Rose Gold", hex: "#e0a899" },
                    { name: "Midnight Violet", hex: "#6d28d9" },
                    { name: "Sunset Orange", hex: "#ea580c" }
                  ];

                  return (
                    <div className="space-y-3 bg-gray-55/60 bg-gray-50/50 dark:bg-gray-950/20 p-4 rounded-xl border border-gray-150 dark:border-gray-800">
                      
                      {/* Active color tags list */}
                      <div>
                        <span className="text-[10px] text-gray-400 font-mono uppercase block mb-1.5">Selected Colors:</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedColors.length === 0 ? (
                            <span className="text-gray-400 text-[10px] italic">No colors chosen (default is Carbon Black)</span>
                          ) : (
                            selectedColors.map((col: string, idx: number) => {
                              const bg = getColorPreview(col);
                              return (
                                <span 
                                  key={idx} 
                                  className="inline-flex items-center gap-1.5 px-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 py-1 rounded-full text-[11px] font-semibold text-gray-800 dark:text-gray-200 shadow-xs"
                                >
                                  <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10 dark:border-white/10" style={{ backgroundColor: bg }} />
                                  <span>{col}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemove(col)}
                                    className="ml-1 text-gray-400 hover:text-red-500 rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold text-[10px] focus:outline-none transition cursor-pointer"
                                  >
                                    ✕
                                  </button>
                                </span>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* Interactive presets buttons */}
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-800/40">
                        <span className="text-[10px] text-gray-400 font-mono uppercase block mb-2">Click preset color potions to add:</span>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {presets.map((p) => {
                            const isSelected = selectedColors.some((c: string) => c.toLowerCase() === p.name.toLowerCase());
                            return (
                              <button
                                key={p.name}
                                type="button"
                                disabled={isSelected}
                                onClick={() => handleAdd(p.name)}
                                className={`flex items-center gap-2 p-1.5 px-2.5 rounded-xl text-[10px] border text-left font-semibold transition-all duration-200 cursor-pointer ${
                                  isSelected 
                                    ? "bg-gray-100 dark:bg-gray-900/60 text-gray-400 border-gray-200 dark:border-gray-800/60 opacity-50 cursor-not-allowed" 
                                    : "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-850 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-800 shadow-xs active:scale-95"
                                }`}
                              >
                                <span 
                                  className={`w-3 h-3 rounded-full shrink-0 ${p.border ? 'border border-gray-300 dark:border-gray-600' : 'border border-black/10 dark:border-white/10'}`} 
                                  style={{ backgroundColor: p.hex }} 
                                />
                                <span className="truncate">{p.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom color manual adder form */}
                      <div className="pt-2.5 border-t border-gray-100 dark:border-gray-800/40 flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            id="admin-prod-colors-custom-input"
                            type="text"
                            value={customColorInput}
                            onChange={(e) => setCustomColorInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAdd(customColorInput);
                                setCustomColorInput("");
                              }
                            }}
                            className="w-full bg-white dark:bg-gray-900 rounded-lg p-2 pr-12 focus:ring-1 focus:ring-emerald-500 border border-gray-200 dark:border-gray-800 text-[10px] text-gray-950 dark:text-white"
                            placeholder="Type custom color (e.g. Lavender Purple, Space Silver)"
                          />
                          {customColorInput && (
                            <span 
                              className="absolute right-3 top-2.5 w-3.5 h-3.5 rounded-full border border-black/10 transition duration-300" 
                              style={{ backgroundColor: getColorPreview(customColorInput) }}
                            />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            handleAdd(customColorInput);
                            setCustomColorInput("");
                          }}
                          className="p-2 px-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer shadow-xs whitespace-nowrap"
                        >
                          + Add Color
                        </button>
                      </div>

                      {/* Comma-separated back-up viewer strictly synchronized */}
                      <div className="pt-2 text-[9px] text-gray-400 font-mono">
                        <span>Database value: </span>
                        <span className="text-gray-500 dark:text-gray-300 select-all">{newProduct.colorVariations}</span>
                      </div>

                    </div>
                  );
                })()}
              </div>

              <div className="md:col-span-3">
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Brief shortDescription *</label>
                <input
                  id="admin-prod-short"
                  type="text" required
                  value={newProduct.shortDescription} onChange={(e) => setNewProduct({ ...newProduct, shortDescription: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-500 border-none text-gray-950 dark:text-white"
                  placeholder="Excellent AMOLED screen with fitness metrics tracking..."
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Detailed HTML/Text description content *</label>
                <textarea
                  id="admin-prod-desc"
                  required rows={3}
                  value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-500 border-none text-gray-950 dark:text-white resize-none"
                  placeholder="Enter deep specifications parameters here..."
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Size / Dimension variations (comma separated list, e.g. M, L, XL or 42mm, 46mm)</label>
                <input
                  id="admin-prod-sizes"
                  type="text"
                  value={newProduct.sizeVariations || ""} onChange={(e) => setNewProduct({ ...newProduct, sizeVariations: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-500 border-none text-gray-950 dark:text-white"
                  placeholder="e.g. S, M, L or 42mm, 46mm"
                />
              </div>

              <div className="md:col-span-3 flex flex-col sm:flex-row sm:items-center gap-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-800">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-700 dark:text-gray-300 text-xs">
                  <input
                    type="checkbox"
                    checked={!!newProduct.featured}
                    onChange={(e) => setNewProduct({ ...newProduct, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 cursor-pointer"
                  />
                  Featured Product (Hero/Favorites lists)
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-700 dark:text-gray-300 text-xs">
                  <input
                    type="checkbox"
                    checked={!!newProduct.flashSale}
                    onChange={(e) => setNewProduct({ ...newProduct, flashSale: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 cursor-pointer"
                  />
                  Flash Sale Banner (Active countdown promotions)
                </label>
              </div>

              <button
                id="admin-prod-submit"
                type="submit"
                className="md:col-span-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition cursor-pointer"
              >
                {editingProductId ? "Confirm and Save Catalog Modifications" : "Catalog Index Into System State Store"}
              </button>
            </form>

            {/* RECENTLY ADDED PRODUCTS SECTION */}
            {products.length > 0 && (
              <div className="bg-gradient-to-r from-emerald-50/50 to-emerald-50/10 dark:from-emerald-950/25 dark:to-gray-900/10 p-5 rounded-2xl border border-emerald-500/15 dark:border-emerald-500/10 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-mono">Recently Added Products (সম্প্রতি যুক্তকৃত প্রোডাক্ট)</h4>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">Real-time Session State</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...products]
                    .sort((a, b) => {
                      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                      const valB = isNaN(timeB) ? 0 : timeB;
                      const valA = isNaN(timeA) ? 0 : timeA;
                      return valB - valA;
                    })
                    .slice(0, 4)
                    .map((prod) => (
                      <div key={`recent-prod-${prod.id}`} className="bg-white dark:bg-gray-900 border border-emerald-400/20 dark:border-emerald-950/60 rounded-xl p-3 relative flex items-center gap-3 shadow-xs">
                        <div className="absolute top-2 right-2 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[8px] font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                          NEW
                        </div>
                        <img src={prod.images[0]} alt={prod.name} className="w-10 h-10 object-cover rounded-lg border border-gray-150 dark:border-emerald-900/30" referrerPolicy="no-referrer" />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-gray-950 dark:text-gray-100 truncate text-[11px] mt-0.5">{prod.name}</p>
                          <p className="text-[9px] text-gray-500 font-mono">৳{prod.salePrice} • Stock: {prod.stockQuantity}</p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <button
                              onClick={() => {
                                setEditingProductId(prod.id);
                                setNewProduct({
                                  name: prod.name || "",
                                  description: prod.description || "",
                                  shortDescription: prod.shortDescription || "",
                                  category: prod.category || "",
                                  brand: prod.brand || "",
                                  sku: prod.sku || "",
                                  productCode: prod.productCode || "",
                                  regularPrice: (prod.regularPrice ?? 0).toString(),
                                  discountPercentage: (prod.discountPercentage ?? 0).toString(),
                                  stockQuantity: (prod.stockQuantity ?? 10).toString(),
                                  images: Array.isArray(prod.images) ? [...prod.images] : (prod.images ? [prod.images] : []),
                                  colorVariations: Array.isArray(prod.colorVariations) ? prod.colorVariations.join(", ") : (typeof prod.colorVariations === "string" ? prod.colorVariations : "Carbon Black"),
                                  sizeVariations: Array.isArray(prod.sizeVariations) ? prod.sizeVariations.join(", ") : (typeof prod.sizeVariations === "string" ? prod.sizeVariations : ""),
                                  featured: !!prod.featured,
                                  flashSale: !!prod.flashSale,
                                  video: prod.video || "",
                                  colorImageMap: prod.colorImageMap || {}
                                });
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="px-2 py-0.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-600 dark:text-emerald-400 rounded text-[9px] font-bold transition flex items-center gap-1 border border-gray-100 dark:border-gray-700 cursor-pointer"
                            >
                              <Edit3 className="w-2.5 h-2.5" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="px-2 py-0.5 bg-red-50 hover:bg-red-105 dark:bg-red-950/20 text-red-500 rounded text-[9px] font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-2.5 h-2.5" /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Products grid lists */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 font-bold text-gray-800 dark:text-white text-xs">
                Active Catalog Inventory Indices ({products.length} Items)
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {products.map((prod) => (
                  <div key={prod.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <img src={prod.images[0]} alt={prod.name} className="w-12 h-12 object-cover rounded-xl border border-gray-150 dark:border-gray-800 bg-gray-50 dark:bg-gray-800" referrerPolicy="no-referrer" />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-xs">{prod.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">SKU: {prod.sku} | Brand: {prod.brand}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-semibold text-gray-500 font-mono">{prod.category}</span>
                          {prod.featured && <span className="text-[8px] px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded font-bold font-sans uppercase">Featured</span>}
                          {prod.flashSale && <span className="text-[8px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded font-bold font-sans uppercase">Flash Deal</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 justify-between sm:justify-end w-full sm:w-auto">
                      {/* Interactive Stock Adjust */}
                      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-xl border border-gray-200 dark:border-gray-800 select-none">
                        <span className="text-[9px] text-gray-400 mr-1.5 font-mono">Stock:</span>
                        <span className={`text-[10px] font-bold font-mono mr-1 ${prod.stockQuantity < 10 ? "text-amber-500" : "text-gray-900 dark:text-gray-100"}`}>{prod.stockQuantity}</span>
                        <button
                          onClick={() => handleQuickStockAdjust(prod.id, -1)}
                          className="px-1.5 py-0.5 bg-gray-200 hover:bg-red-100 hover:text-red-605 dark:bg-gray-800 dark:hover:bg-red-950/30 dark:hover:text-red-400 text-gray-600 dark:text-gray-300 rounded text-[9px] font-bold font-mono transition cursor-pointer"
                          title="Reduce stock by 1"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => handleQuickStockAdjust(prod.id, 5)}
                          className="px-1.5 py-0.5 bg-gray-200 hover:bg-emerald-100 hover:text-emerald-605 dark:bg-gray-800 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400 text-gray-600 dark:text-gray-300 rounded text-[9px] font-bold font-mono transition cursor-pointer"
                          title="Replenish stock by 5"
                        >
                          +5
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">৳{prod.salePrice}</p>
                        {prod.regularPrice > prod.salePrice && <p className="text-[10px] text-gray-400 line-through">৳{prod.regularPrice}</p>}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          id={`edit-prod-btn-${prod.id}`}
                          onClick={() => {
                            setEditingProductId(prod.id);
                            setNewProduct({
                              name: prod.name || "",
                              description: prod.description || "",
                              shortDescription: prod.shortDescription || "",
                              category: prod.category || "",
                              brand: prod.brand || "",
                              sku: prod.sku || "",
                              productCode: prod.productCode || "",
                              regularPrice: (prod.regularPrice ?? 0).toString(),
                              discountPercentage: (prod.discountPercentage ?? 0).toString(),
                              stockQuantity: (prod.stockQuantity ?? 10).toString(),
                              images: Array.isArray(prod.images) ? [...prod.images] : (prod.images ? [prod.images] : []),
                              colorVariations: Array.isArray(prod.colorVariations) ? prod.colorVariations.join(", ") : (typeof prod.colorVariations === "string" ? prod.colorVariations : "Carbon Black"),
                              sizeVariations: Array.isArray(prod.sizeVariations) ? prod.sizeVariations.join(", ") : (typeof prod.sizeVariations === "string" ? prod.sizeVariations : ""),
                              featured: !!prod.featured,
                              flashSale: !!prod.flashSale,
                              video: prod.video || "",
                              colorImageMap: prod.colorImageMap || {}
                            });
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-600 dark:text-gray-300 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`delete-prod-btn-${prod.id}`}
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/35 text-red-500 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ORDER TRAFFIC CONTROL */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <h3 className="text-md font-display font-semibold text-gray-950 dark:text-white">Marketplace Transactions Order List</h3>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden text-xs">
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {orders.map((ord) => (
                  <div key={ord.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-white font-mono">{ord.invoiceNumber}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          ord.paymentStatus === "Paid" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                        }`}>
                          {ord.paymentStatus}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">🚚 {ord.trackingCode}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 dark:text-gray-400">
                        {ord.customerName} ({ord.phone}) • {ord.address}, {ord.district}
                      </p>
                      <div className="mt-3.5 space-y-1.5 border-t border-gray-100 dark:border-gray-800/60 pt-2.5">
                        <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 dark:text-gray-500">
                          Ordered Items
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {ord.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/40 rounded-xl p-1.5 pr-3 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all"
                            >
                              <img
                                src={item.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100"}
                                alt={item.name}
                                className="w-8 h-8 object-cover rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-750"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <p className="font-bold text-gray-900 dark:text-gray-100 text-[10px] max-w-[220px] truncate">
                                  {item.name}
                                </p>
                                <p className="text-[9px] text-gray-550 dark:text-gray-400 flex items-center gap-1.5 font-medium">
                                  <span>Qty: <span className="font-extrabold text-gray-850 dark:text-gray-250">{item.quantity}</span></span>
                                  <span>•</span>
                                  <span>৳{item.price}</span>
                                  {item.color && (
                                    <>
                                      <span>•</span>
                                      <span className="px-1 py-0.25 bg-gray-200/50 dark:bg-gray-700/50 rounded text-[8px] font-mono capitalize">{item.color}</span>
                                    </>
                                  )}
                                  {item.size && (
                                    <>
                                      <span>•</span>
                                      <span className="px-1 py-0.25 bg-gray-200/50 dark:bg-gray-700/50 rounded text-[8px] font-mono uppercase">{item.size}</span>
                                    </>
                                  )}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-extrabold text-gray-900 dark:text-white">৳{ord.total}</p>
                        <p className="text-[9px] text-gray-400 font-mono">via {ord.paymentMethod}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <select
                          id={`change-status-select-${ord.id}`}
                          value={ord.status}
                          onChange={(e) => handleCycleOrder(ord.id, { status: e.target.value as any })}
                          className="bg-gray-50 dark:bg-gray-800 text-[10px] rounded p-1 text-gray-900 dark:text-white focus:outline-none border-none"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>

                        <button
                          id={`mark-paid-btn-${ord.id}`}
                          onClick={() => handleCycleOrder(ord.id, { status: ord.status, paymentStatus: "Paid" })}
                          className="p-1 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded text-[10px] font-black cursor-pointer"
                        >
                          Mark Paid
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && <p className="text-gray-500 text-xs p-6 text-center">No transactions registered.</p>}
              </div>
            </div>
          </div>
        )}

        {/* CUSTOMER ACCOUNTS VIEWER */}
        {activeTab === "accounts" && (
          <div className="space-y-6 text-xs">
            <h3 className="text-md font-display font-semibold text-gray-950 dark:text-white">Registered Customer Accounts ({users.length})</h3>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-gray-500 uppercase text-[10px] tracking-wider font-mono">
                      <th className="p-4 font-bold">Customer</th>
                      <th className="p-4 font-bold">Contact</th>
                      <th className="p-4 font-bold">Addresses Saved</th>
                      <th className="p-4 font-bold">Privilege Profile</th>
                      <th className="p-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {users.map((usr) => (
                      <tr key={usr.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-sm font-sans uppercase">
                              {usr.username.slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-950 dark:text-white">{usr.username}</p>
                              <p className="text-[10px] text-gray-400 font-mono mt-0.5">{usr.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{usr.email}</p>
                          <p className="text-gray-500 dark:text-gray-400 mt-1">{usr.phone || "No phone added"}</p>
                        </td>
                        <td className="p-4">
                          {usr.addresses && usr.addresses.length > 0 ? (
                            <div className="space-y-1">
                              {usr.addresses.map((addr) => (
                                <p key={addr.id} className="text-[11px] text-gray-600 dark:text-gray-300">
                                  <span className="font-bold text-[9px] uppercase px-1 py-0.25 bg-gray-100 dark:bg-gray-800 rounded mr-1 text-gray-500 font-mono">{addr.label}</span>
                                  {addr.fullName} ({addr.phone}) • {addr.addressLine}, {addr.district}
                                </p>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">No addresses saved yet</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${
                            usr.role === "admin" 
                              ? "bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/20 dark:border-red-900/45 dark:text-red-400" 
                              : "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/45 dark:text-emerald-400"
                          }`}>
                            {usr.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-gray-500 text-center p-8">No registered user accounts registered in database.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOM CATEGORIES EDITOR */}
        {activeTab === "categories" && (
          <div className="space-y-8 text-xs">
            <h3 className="text-md font-display font-semibold text-gray-950 dark:text-white">Manage Catalog Classes</h3>
            
            <form onSubmit={handleAddCategory} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Catalog Category Name *</label>
                <input
                  id="cat-name-input"
                  type="text" required
                  value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-0]/g, "-") })}
                  className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-500 border-none text-gray-950 dark:text-white"
                  placeholder="e.g. Smart Watches"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Slug descriptor *</label>
                <input
                  id="cat-slug-input"
                  type="text" required
                  value={newCategory.slug} onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-500 border-none text-gray-950 dark:text-white font-mono"
                  placeholder="smart-watches"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Illustrative Image link</label>
                <input
                  id="cat-img-input"
                  type="text"
                  value={newCategory.image} onChange={(e) => setNewCategory({ ...newCategory, image: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-500 border-none text-gray-950 dark:text-white"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
              <button
                id="cat-submit-btn"
                type="submit"
                className="sm:col-span-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition"
              >
                Insert Category Node
              </button>
            </form>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
              <span className="font-bold text-gray-800 dark:text-white">Active Catalog Branch listings ({categories.length})</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                {categories.map((c) => (
                  <div key={c.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-800 relative flex flex-col justify-between aspect-[3/4]">
                    <div>
                      <img src={c.image} alt={c.name} className="w-full aspect-square object-cover rounded-lg border mb-2" referrerPolicy="no-referrer" />
                      <p className="font-bold text-gray-900 dark:text-white truncate">{c.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono">slug: {c.slug}</p>
                    </div>
                    <button
                      id={`delete-cat-btn-${c.id}`}
                      onClick={() => handleDeleteCategory(c.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PROMO COUPONS EDITOR */}
        {activeTab === "coupons" && (
          <div className="space-y-8 text-xs">
            <h3 className="text-md font-display font-semibold text-gray-900 dark:text-white">Configure Promotional Discount Campaigns</h3>

            <form onSubmit={handleAddCoupon} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Coupon Code (Uppercase) *</label>
                <input
                  id="coupon-code-input"
                  type="text" required
                  value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-500 border-none text-gray-950 dark:text-white font-bold"
                  placeholder="E.g., ARA30"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Discount Type *</label>
                <select
                  id="coupon-type-select"
                  value={newCoupon.discountType} onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value as any })}
                  className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-500 border-none text-gray-900 dark:text-white"
                >
                  <option value="Percentage">Percentage % reduction</option>
                  <option value="Fixed">Fixed currency flat markdown (BDT)</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Reduction Value *</label>
                <input
                  id="coupon-val-input"
                  type="number" required
                  value={newCoupon.discountValue} onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-500 border-none text-gray-950 dark:text-white"
                  placeholder="30 for 30% or 500 for 500 BDT"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Minimum purchase amount required (BDT)</label>
                <input
                  id="coupon-min-purchase"
                  type="number"
                  value={newCoupon.minPurchase} onChange={(e) => setNewCoupon({ ...newCoupon, minPurchase: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-500 border-none text-gray-950 dark:text-white"
                  placeholder="1000"
                />
              </div>

              <button
                id="coupon-submit-btn"
                type="submit"
                className="sm:col-span-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition"
              >
                Insert Promotional Code
              </button>
            </form>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
              <span className="font-bold text-gray-900 dark:text-white">Active Promotional campaigns</span>
              <div className="divide-y divide-gray-100 dark:divide-gray-800 mt-4">
                {coupons.map((c) => (
                  <div key={c.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{c.code} ({c.discountType})</p>
                      <p className="text-[10px] text-gray-400">Value: {c.discountValue} | Min purchase: BDT {c.minPurchase} | Expires: {c.expiryDate}</p>
                    </div>
                    <button
                      id={`delete-coupon-btn-${c.id}`}
                      onClick={() => handleDeleteCoupon(c.id)}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PR BLOG RELEASE POSTS */}
        {activeTab === "blogs" && (
          <div className="space-y-8 text-xs">
            <h3 className="text-md font-display font-semibold text-gray-950 dark:text-white">Publish Customer Newsletter & Press Node</h3>

            <form onSubmit={handlePublishBlog} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 grid grid-cols-1 gap-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Article Title *</label>
                <input
                  id="blog-title-input"
                  type="text" required
                  value={newBlog.title} onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-500 border-none text-gray-950 dark:text-white"
                  placeholder="Smartwatch Trends in Dhaka (2026 Edition)"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Brief summary of post</label>
                <input
                  id="blog-summary-input"
                  type="text"
                  value={newBlog.summary} onChange={(e) => setNewBlog({ ...newBlog, summary: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-500 border-none text-gray-950 dark:text-white"
                  placeholder="A detailed guide highlighting display qualities, batteries and sensor thresholds"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">HTML/Text Body Content *</label>
                <textarea
                  id="blog-content-input"
                  required rows={5}
                  value={newBlog.content} onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-500 border-none text-gray-950 dark:text-white resize-none"
                  placeholder="Describe your article content here..."
                />
              </div>
              <button
                id="blog-submit-btn"
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition"
              >
                Publish Article Entry
              </button>
            </form>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
              <span className="font-bold text-gray-900 dark:text-white">Active articles published ({blogs.length})</span>
              <div className="divide-y divide-gray-100 dark:divide-gray-800 mt-4">
                {blogs.map((b) => (
                  <div key={b.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{b.title}</p>
                      <p className="text-[10px] text-gray-400">Author: {b.author} | {b.createdAt} | Slug: {b.slug}</p>
                    </div>
                    <button
                      id={`delete-blog-btn-${b.id}`}
                      onClick={() => handleDeleteBlog(b.id)}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SYSTEM COREGULATION METRICS */}
        {activeTab === "settings" && settings && (
          <div className="space-y-6 text-xs">
            <h3 className="text-md font-display font-semibold text-gray-950 dark:text-white">E-Commerce Core Parameters Settings</h3>

            <form onSubmit={handleUpdateSettings} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Corporate Site Brand Name</label>
                  <input
                    id="setting-name"
                    type="text"
                    value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-lg p-2.5 text-gray-950 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Corporate Contact Email</label>
                  <input
                    id="setting-email"
                    type="email"
                    value={settings.contactEmail} onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-lg p-2.5 text-gray-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Inside Dhaka Shipping fee (BDT)</label>
                  <input
                    id="setting-inside-fee"
                    type="number"
                    value={settings.insideDhakaShipping} onChange={(e) => setSettings({ ...settings, insideDhakaShipping: parseInt(e.target.value) })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-lg p-2.5 text-gray-950 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Outside Dhaka Shipping fee (BDT)</label>
                  <input
                    id="setting-outside-fee"
                    type="number"
                    value={settings.outsideDhakaShipping} onChange={(e) => setSettings({ ...settings, outsideDhakaShipping: parseInt(e.target.value) })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-lg p-2.5 text-gray-950 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Express Service Premium fee (BDT)</label>
                  <input
                    id="setting-express-fee"
                    type="number"
                    value={settings.expressShippingMarkup} onChange={(e) => setSettings({ ...settings, expressShippingMarkup: parseInt(e.target.value) })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-lg p-2.5 text-gray-950 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">State Value Added Tax (VAT % ratio)</label>
                  <input
                    id="setting-tax-ratio"
                    type="number"
                    value={settings.taxPercentage} onChange={(e) => setSettings({ ...settings, taxPercentage: parseFloat(e.target.value) })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-lg p-2.5 text-gray-950 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Free Delivery Cart Total Threshold (BDT)</label>
                  <input
                    id="setting-free-threshold"
                    type="number"
                    value={settings.freeShippingThreshold} onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseInt(e.target.value) })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-lg p-2.5 text-gray-950 dark:text-white font-mono"
                  />
                </div>
              </div>

              <button
                id="setting-submit-btn"
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition"
              >
                Recalculate & Commit core parameters
              </button>
            </form>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4 mt-6">
              <h4 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> System Maintenance & Database Control
              </h4>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-[11px]">
                Reset all e-commerce transaction logs, user records, added categories, products, coupons, and customer reviews to the original default seed data. This option will revert the store state to its pristine, freshly installed configuration.
              </p>
              <button
                id="reset-db-btn"
                type="button"
                onClick={handleResetDatabase}
                className="bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-950/30 dark:text-red-400 font-bold py-2.5 px-4 rounded-xl transition inline-flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Revert/Reset Database to Seed State
              </button>
            </div>
          </div>
        )}

      </main>

      {/* CUSTOM DELETION CONFIRMATION DIALOG */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in animate-duration-200">
          <div id="delete-confirm-dialog" className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-950/40 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mx-auto font-sans">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <h4 className="text-md font-display font-semibold text-gray-950 dark:text-white">Confirm Delete {deleteConfirm.title}</h4>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-[11px] font-sans">
              Are you sure you want to permanently remove this {deleteConfirm.type} from the database? This process is irreversible and cannot be undone.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-805 text-gray-750 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-750 transition text-[11px] cursor-pointer border border-transparent dark:border-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm.type === "product") handleDeleteProduct(deleteConfirm.id, true);
                  else if (deleteConfirm.type === "category") handleDeleteCategory(deleteConfirm.id, true);
                  else if (deleteConfirm.type === "coupon") handleDeleteCoupon(deleteConfirm.id, true);
                  else if (deleteConfirm.type === "blog") handleDeleteBlog(deleteConfirm.id, true);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition text-[11px] cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM DATABASE RESET CONFIRMATION DIALOG */}
      {resetDbConfirmActive && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in animate-duration-200">
          <div id="reset-confirm-dialog" className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-950/40 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mx-auto">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <h4 className="text-md font-display font-semibold text-gray-950 dark:text-white">Confirm Database Reset</h4>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-[11px]">
              This will clear all custom orders, customer accounts, custom products, categories, coupons, blog posts, and reviews, restoring clean seeded data. Are you sure you want to continue?
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setResetDbConfirmActive(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-805 text-gray-750 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-750 transition text-[11px] cursor-pointer border border-transparent dark:border-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResetDatabase(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition text-[11px] cursor-pointer"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
