import React, { useState } from "react";
import { X, CheckCircle, ShieldCheck, CreditCard, DollarSign, Wallet, ArrowRight, Smartphone, Key, User, Mail, Phone, MapPin, Truck } from "lucide-react";
import { motion } from "motion/react";
import { CartItem, Coupon, Order, WebSettings } from "../types.js";

interface CheckoutModalProps {
  onClose: () => void;
  cart: CartItem[];
  settings: WebSettings;
  coupons: Coupon[];
  currentUser: { id: string; email: string; username: string } | null;
  onOrderSuccess: (order: Order) => void;
  onClearCart: () => void;
}

export default function CheckoutModal({
  onClose,
  cart,
  settings,
  coupons,
  currentUser,
  onOrderSuccess,
  onClearCart
}: CheckoutModalProps) {
  // Checkout coordinates
  const [customerName, setCustomerName] = useState(currentUser?.username || "");
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState<"Dhaka" | "Outside Dhaka">("Dhaka");
  const [shippingMethod, setShippingMethod] = useState<"Standard" | "Express">("Standard");
  const [paymentMethod, setPaymentMethod] = useState<"bKash" | "Nagad" | "Rocket" | "Visa" | "COD">("COD");

  // Coupon promo state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // Simulated gateway staging
  const [gatewayStep, setGatewayStep] = useState<"form" | "mfs_phone" | "mfs_otp" | "mfs_pin" | "card" | "processing">("form");
  const [mfsNumber, setMfsNumber] = useState("");
  const [mfsOTP, setMfsOTP] = useState("");
  const [mfsPIN, setMfsPIN] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const brandConfigs = {
    bKash: {
      primaryColor: "bg-[#e2136e]",
      hoverColor: "hover:bg-[#c20f5c]",
      textColor: "text-[#e2136e]",
      borderColor: "border-[#e2136e]",
      gradientBg: "from-[#e2136e]/5 to-white dark:from-[#b00f54]/10 dark:to-gray-950",
      gradientBorder: "border-[#e2136e]/20",
      logoAlt: "bKash"
    },
    Nagad: {
      primaryColor: "bg-[#ef5924]",
      hoverColor: "hover:bg-[#d5491d]",
      textColor: "text-[#ef5924]",
      borderColor: "border-[#ef5924]",
      gradientBg: "from-[#ef5924]/5 to-white dark:from-[#cf481c]/10 dark:to-gray-950",
      gradientBorder: "border-[#ef5924]/20",
      logoAlt: "Nagad"
    },
    Rocket: {
      primaryColor: "bg-[#8c3494]",
      hoverColor: "hover:bg-[#722a79]",
      textColor: "text-[#8c3494]",
      borderColor: "border-[#8c3494]",
      gradientBg: "from-[#8c3494]/5 to-white dark:from-[#762c7d]/10 dark:to-gray-950",
      gradientBorder: "border-[#8c3494]/20",
      logoAlt: "Rocket"
    },
    Visa: {
      primaryColor: "bg-[#1a1f71]",
      hoverColor: "hover:bg-[#131754]",
      textColor: "text-[#1a1f71]",
      borderColor: "border-[#1a1f71]",
      gradientBg: "from-[#1a1f71]/5 to-white dark:from-[#0f1345]/10 dark:to-gray-950",
      gradientBorder: "border-[#1a1f71]/20",
      logoAlt: "Visa"
    },
    COD: {
      primaryColor: "bg-emerald-600",
      hoverColor: "hover:bg-emerald-500",
      textColor: "text-emerald-700 dark:text-emerald-400",
      borderColor: "border-emerald-500",
      gradientBg: "from-emerald-50/50 to-white dark:from-emerald-950/10 dark:to-gray-950",
      gradientBorder: "border-emerald-500/20",
      logoAlt: "Cash On Delivery"
    }
  };

  const activeBrandConfig = brandConfigs[paymentMethod] || brandConfigs.COD;

  // Subtotals calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.salePrice * item.quantity, 0);
  
  // Shipping charge logic
  let shippingCharge = district === "Dhaka" ? settings.insideDhakaShipping : settings.outsideDhakaShipping;
  if (shippingMethod === "Express") {
    shippingCharge += settings.expressShippingMarkup;
  }
  // Rule: Free Shipping over freeShippingThreshold
  if (cartSubtotal >= settings.freeShippingThreshold) {
    shippingCharge = 0;
  }

  // Tax and coupons discount values
  const taxAmount = Math.round(cartSubtotal * (settings.taxPercentage / 100));
  
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "Percentage") {
      discountAmount = Math.round(cartSubtotal * (appliedCoupon.discountValue / 100));
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
  }

  const orderTotal = cartSubtotal + shippingCharge + taxAmount - discountAmount;

  // Coupon lookup handler
  const handleApplyCoupon = () => {
    setCouponError("");
    setCouponSuccess("");
    if (!couponCode.trim()) return;

    const matched = coupons.find(
      (c) => c.code.toUpperCase() === couponCode.toUpperCase() && c.isActive
    );

    if (!matched) {
      setCouponError("Invalid or expired coupon code");
      setAppliedCoupon(null);
      return;
    }

    if (cartSubtotal < matched.minPurchase) {
      setCouponError(`Min purchase of BDT ${matched.minPurchase} required`);
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(matched);
    setCouponSuccess(`Coupon '${matched.code}' applied successfully!`);
  };

  // Order submission processor
  const handleProcessCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");

    if (!customerName || !customerEmail || !phone || !address) {
      setErrorText("Please complete all delivery profile input fields.");
      return;
    }

    if (paymentMethod === "bKash" || paymentMethod === "Nagad" || paymentMethod === "Rocket") {
      setMfsNumber(phone);
      setGatewayStep("mfs_phone");
    } else if (paymentMethod === "Visa") {
      setGatewayStep("card");
    } else {
      // COD directly launches order saving
      commitOrderToDB();
    }
  };

  const commitOrderToDB = async (txDetails?: object) => {
    setIsSubmitting(true);
    setGatewayStep("processing");

    const orderPayload = {
      userId: currentUser?.id,
      customerName,
      customerEmail,
      phone,
      address,
      district,
      shippingMethod,
      items: cart.map((item) => ({
        id: Math.random().toString(36).substring(7),
        productId: item.product.id,
        name: item.product.name,
        image: item.product.images[0],
        price: item.product.salePrice,
        quantity: item.quantity,
        color: item.selectedColor,
        size: item.selectedSize
      })),
      paymentMethod,
      paymentDetails: txDetails || {},
      regularTotal: cartSubtotal,
      discountAmount
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });
      const data = await response.json();
      if (response.ok) {
        onClearCart();
        onOrderSuccess(data.order);
      } else {
        setErrorText(data.error || "Failed to commit order. Try again.");
        setGatewayStep("form");
      }
    } catch (err) {
      setErrorText("Network connection to server timed out. Try again.");
      setGatewayStep("form");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row h-auto max-h-[90vh]"
      >
        
        {/* Left Side: Delivery and checkout configurations */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto border-r border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-500 font-bold">Secure Gateway Process</span>
              <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">Delivery Coordinates</h2>
            </div>
            <button 
              id="close-checkout-modal"
              onClick={onClose} 
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorText && (
            <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs mb-4">
              ⚠️ {errorText}
            </div>
          )}

          {gatewayStep === "form" && (
            <form onSubmit={handleProcessCheckout} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-750 dark:text-gray-300 font-extrabold text-[11px] mb-1.5">Full Name *</label>
                  <input
                    id="checkout-name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100/50 dark:hover:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/60 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-800 focus:ring-1 focus:ring-emerald-500/20 text-gray-950 dark:text-white transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-gray-750 dark:text-gray-300 font-extrabold text-[11px] mb-1.5">Email *</label>
                  <input
                    id="checkout-email"
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100/50 dark:hover:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/60 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-800 focus:ring-1 focus:ring-emerald-500/20 text-gray-950 dark:text-white transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium"
                    placeholder="name@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-750 dark:text-gray-300 font-extrabold text-[11px] mb-1.5">Mobile Contact Number (Bangladesh) *</label>
                <input
                  id="checkout-phone"
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100/50 dark:hover:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/60 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-800 focus:ring-1 focus:ring-emerald-500/20 text-gray-950 dark:text-white transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 font-semibold"
                  placeholder="e.g., +88017XXXXXXXX"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-750 dark:text-gray-300 font-extrabold text-[11px] mb-1.5">Delivery District *</label>
                  <select
                    id="checkout-district"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value as any)}
                    className="w-full bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100/50 dark:hover:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/60 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-800 focus:ring-1 focus:ring-emerald-500/20 text-gray-950 dark:text-white transition-all font-semibold cursor-pointer"
                  >
                    <option value="Dhaka">Inside Dhaka (৳{settings.insideDhakaShipping})</option>
                    <option value="Outside Dhaka">Outside Dhaka (৳{settings.outsideDhakaShipping})</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-750 dark:text-gray-300 font-extrabold text-[11px] mb-1.5">Delivery Method *</label>
                  <select
                    id="checkout-shipping-method"
                    value={shippingMethod}
                    onChange={(e) => setShippingMethod(e.target.value as any)}
                    className="w-full bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100/50 dark:hover:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/60 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-800 focus:ring-1 focus:ring-emerald-500/20 text-gray-950 dark:text-white transition-all font-semibold cursor-pointer"
                  >
                    <option value="Standard">Standard Courier</option>
                    <option value="Express">Express Speed Delivery (+৳{settings.expressShippingMarkup})</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-750 dark:text-gray-300 font-extrabold text-[11px] mb-1.5">Detail Address *</label>
                <textarea
                  id="checkout-address"
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100/50 dark:hover:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/60 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-800 focus:ring-1 focus:ring-emerald-500/20 text-gray-950 dark:text-white resize-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium"
                  placeholder="Holding number, Flat code, Area details, Landmarks..."
                />
              </div>

              {/* Payment Select blocks */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2.5">Select Payment Method</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Cash On Delivery */}
                  <button
                    id="pay-cod-btn"
                    type="button"
                    onClick={() => setPaymentMethod("COD")}
                    className={`relative p-3 rounded-2xl border text-left flex items-center justify-between transition-all duration-300 group cursor-pointer ${
                      paymentMethod === "COD"
                        ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-1 ring-emerald-500/25 shadow-sm"
                        : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40 hover:border-gray-300 dark:hover:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                        paymentMethod === "COD" ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-gray-100/60 dark:bg-gray-800"
                      }`}>
                        <DollarSign className={`w-5 h-5 transition-colors duration-300 ${
                          paymentMethod === "COD" ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400"
                        }`} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">Cash On Delivery</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Pay cash upon delivery</p>
                      </div>
                    </div>
                    {paymentMethod === "COD" && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>

                  {/* bKash */}
                  <button
                    id="pay-bkash-btn"
                    type="button"
                    onClick={() => setPaymentMethod("bKash")}
                    className={`relative p-3 rounded-2xl border text-left flex items-center justify-between transition-all duration-300 group cursor-pointer ${
                      paymentMethod === "bKash"
                        ? "border-[#e2136e] bg-[#e2136e]/5 dark:bg-[#e2136e]/10 ring-1 ring-[#e2136e]/20 shadow-sm"
                        : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40 hover:border-gray-300 dark:hover:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 p-1 rounded-xl flex items-center justify-center bg-white border border-gray-100 dark:border-gray-700/50 shadow-inner">
                        {!imageErrors.bKash ? (
                          <img
                            src="https://download.logo.wine/logo/BKash/BKash-Logo.wine.png"
                            alt="bKash"
                            className="w-10 h-10 object-contain"
                            onError={() => setImageErrors(prev => ({ ...prev, bKash: true }))}
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="text-[9px] font-extrabold text-[#e2136e]">bKash</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">bKash Mobile Pay</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Instant Wallet Pay</p>
                      </div>
                    </div>
                    {paymentMethod === "bKash" && (
                      <div className="w-5 h-5 rounded-full bg-[#e2136e] flex items-center justify-center text-white shrink-0">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>

                  {/* Nagad */}
                  <button
                    id="pay-nagad-btn"
                    type="button"
                    onClick={() => setPaymentMethod("Nagad")}
                    className={`relative p-3 rounded-2xl border text-left flex items-center justify-between transition-all duration-300 group cursor-pointer ${
                      paymentMethod === "Nagad"
                        ? "border-[#ef5924] bg-[#ef5924]/5 dark:bg-[#ef5924]/10 ring-1 ring-[#ef5924]/20 shadow-sm"
                        : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40 hover:border-gray-300 dark:hover:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 p-1 rounded-xl flex items-center justify-center bg-white border border-gray-100 dark:border-gray-700/50 shadow-inner">
                        {!imageErrors.Nagad ? (
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/e/ea/Nagad_mfs_logo.svg"
                            alt="Nagad"
                            className="w-10 h-10 object-contain"
                            onError={() => setImageErrors(prev => ({ ...prev, Nagad: true }))}
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="text-[9px] font-extrabold text-[#ef5924]">Nagad</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">Nagad Mobile Pay</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Easy Digital Payments</p>
                      </div>
                    </div>
                    {paymentMethod === "Nagad" && (
                      <div className="w-5 h-5 rounded-full bg-[#ef5924] flex items-center justify-center text-white shrink-0">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>

                  {/* Rocket */}
                  <button
                    id="pay-rocket-btn"
                    type="button"
                    onClick={() => setPaymentMethod("Rocket")}
                    className={`relative p-3 rounded-2xl border text-left flex items-center justify-between transition-all duration-300 group cursor-pointer ${
                      paymentMethod === "Rocket"
                        ? "border-[#8c3494] bg-[#8c3494]/5 dark:bg-[#8c3494]/10 ring-1 ring-[#8c3494]/20 shadow-sm"
                        : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40 hover:border-gray-300 dark:hover:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 p-1 rounded-xl flex items-center justify-center bg-white border border-gray-100 dark:border-gray-700/50 shadow-inner">
                        {!imageErrors.Rocket ? (
                          <img
                            src="https://logos-download.com/wp-content/uploads/2022/01/Rocket_Logo.png"
                            alt="Rocket"
                            className="w-10 h-10 object-contain"
                            onError={() => setImageErrors(prev => ({ ...prev, Rocket: true }))}
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="text-[9px] font-extrabold text-[#8c3494]">Rocket</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">Rocket Banking</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">DBBL Mobile Banking</p>
                      </div>
                    </div>
                    {paymentMethod === "Rocket" && (
                      <div className="w-5 h-5 rounded-full bg-[#8c3494] flex items-center justify-center text-white shrink-0">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>

                  {/* Credit / Debit Cards */}
                  <button
                    id="pay-card-btn"
                    type="button"
                    onClick={() => setPaymentMethod("Visa")}
                    className={`relative p-3 rounded-2xl border text-left flex items-center justify-between transition-all duration-300 group cursor-pointer ${
                      paymentMethod === "Visa"
                        ? "border-[#1a1f71] bg-[#1a1f71]/5 dark:bg-[#1a1f71]/10 ring-1 ring-[#1a1f71]/20 shadow-sm"
                        : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40 hover:border-gray-300 dark:hover:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 p-1 rounded-xl flex items-center justify-center bg-white border border-gray-100 dark:border-gray-700/50 shadow-inner">
                        {!imageErrors.Visa ? (
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                            alt="Cards"
                            className="w-10 h-10 object-contain"
                            onError={() => setImageErrors(prev => ({ ...prev, Visa: true }))}
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <CreditCard className="w-5 h-5 text-blue-900" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">Credit / Debit Card</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Visa, MasterCard, etc.</p>
                      </div>
                    </div>
                    {paymentMethod === "Visa" && (
                      <div className="w-5 h-5 rounded-full bg-[#1a1f71] flex items-center justify-center text-white shrink-0">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* DYNAMIC CONFIRMED ORDER SUMMING ACTIONS */}
              {paymentMethod === "COD" ? (
                <button
                  id="checkout-primary-submit"
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  <CheckCircle className="w-4 h-4" /> Confirm Cash On Delivery Order (৳{orderTotal})
                </button>
              ) : (
                <button
                  id="checkout-primary-submit"
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  <Wallet className="w-4 h-4" /> Pay & Complete Order with {paymentMethod} (৳{orderTotal}) <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </form>
          )}

          {/* SIMULATED MFS: bKash / Nagad / Rocket payment overlay design */}
          {(gatewayStep === "mfs_phone" || gatewayStep === "mfs_otp" || gatewayStep === "mfs_pin") && (
            <div className={`bg-gradient-to-b ${activeBrandConfig.gradientBg} border ${activeBrandConfig.gradientBorder} p-6 rounded-3xl flex flex-col items-center justify-center min-h-[400px] text-center font-sans shadow-xl relative overflow-hidden transition-all duration-300`}>
              {/* Brand logo container inside overlay */}
              <div className="w-20 h-20 rounded-2xl bg-white p-2.5 flex items-center justify-center shadow-md mb-4 border border-gray-100 relative">
                {paymentMethod === "bKash" && (
                  <img
                    src="https://download.logo.wine/logo/BKash/BKash-Logo.wine.png"
                    alt="bKash"
                    className="w-16 h-16 object-contain"
                    referrerPolicy="no-referrer"
                  />
                )}
                {paymentMethod === "Nagad" && (
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/e/ea/Nagad_mfs_logo.svg"
                    alt="Nagad"
                    className="w-16 h-16 object-contain"
                    referrerPolicy="no-referrer"
                  />
                )}
                {paymentMethod === "Rocket" && (
                  <img
                    src="https://logos-download.com/wp-content/uploads/2022/01/Rocket_Logo.png"
                    alt="Rocket"
                    className="w-16 h-16 object-contain"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
              
              <h3 className="font-display font-black text-gray-900 dark:text-white tracking-tight uppercase text-sm">
                {paymentMethod} Secure Payment Portal
              </h3>
              <p className="text-gray-500 text-[10px] mb-6">Verified transaction secured by Bangladesh Bank gateway protocols</p>

              {gatewayStep === "mfs_phone" && (
                <div className="w-full max-w-sm space-y-4">
                  <div className="text-left">
                    <label className="block text-[11px] text-gray-600 dark:text-gray-400 font-bold mb-1.5">Enter {paymentMethod} Wallet Mobile Number</label>
                    <div className="flex gap-2">
                      <span className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 p-2.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center shadow-sm">+880</span>
                      <input
                        id="mfs-phone-input"
                        type="text"
                        placeholder="1XXXXXXXX"
                        maxLength={10}
                        value={mfsNumber.startsWith("+880") ? mfsNumber.replace("+880", "") : mfsNumber}
                        onChange={(e) => setMfsNumber(e.target.value)}
                        className={`flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 text-xs text-gray-950 dark:text-white font-bold focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500 shadow-sm`}
                      />
                    </div>
                  </div>
                  <button
                    id="mfs-send-otp-btn"
                    onClick={() => setGatewayStep("mfs_otp")}
                    className={`w-full ${activeBrandConfig.primaryColor} ${activeBrandConfig.hoverColor} text-white font-bold text-xs py-2.5 rounded-xl transition duration-200 active:scale-[0.98] shadow-md shadow-black/10 cursor-pointer`}
                  >
                    Request Verification Code (OTP)
                  </button>
                </div>
              )}

              {gatewayStep === "mfs_otp" && (
                <div className="w-full max-w-sm space-y-4">
                  <div className="text-left">
                    <label className="block text-[11px] text-gray-600 dark:text-gray-400 font-bold mb-1.5 flex items-center gap-1">
                      <Smartphone className={`w-3.5 h-3.5 ${activeBrandConfig.textColor}`} /> Enter 6-Digit SMS Verification OTP code
                    </label>
                    <input
                      id="mfs-otp-input"
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={mfsOTP}
                      onChange={(e) => setMfsOTP(e.target.value)}
                      className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 text-center tracking-[0.4em] text-lg rounded-xl p-2.5 text-gray-950 dark:text-white font-black shadow-sm"
                    />
                    <p className="text-[9px] text-gray-400 mt-1">Hint: Any 6 digits code works in this simulation sandbox.</p>
                  </div>
                  <button
                    id="mfs-verify-otp-btn"
                    onClick={() => setGatewayStep("mfs_pin")}
                    className={`w-full ${activeBrandConfig.primaryColor} ${activeBrandConfig.hoverColor} text-white font-bold text-xs py-2.5 rounded-xl transition duration-200 active:scale-[0.98] shadow-md shadow-black/10 cursor-pointer`}
                  >
                    Verify & Next
                  </button>
                </div>
              )}

              {gatewayStep === "mfs_pin" && (
                <div className="w-full max-w-sm space-y-4">
                  <div className="text-left">
                    <label className="block text-[11px] text-gray-600 dark:text-gray-400 font-bold mb-1.5 flex items-center gap-1">
                      <Key className={`w-3.5 h-3.5 ${activeBrandConfig.textColor}`} /> Enter Secure Wallet PIN
                    </label>
                    <input
                      id="mfs-pin-input"
                      type="password"
                      maxLength={5}
                      placeholder="•••••"
                      value={mfsPIN}
                      onChange={(e) => setMfsPIN(e.target.value)}
                      className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 text-center tracking-[0.5em] text-lg rounded-xl p-2.5 text-gray-950 dark:text-white font-bold shadow-sm"
                    />
                    <p className="text-[9px] text-gray-400 mt-1">Your payment credentials are processed with bank-level encryption.</p>
                  </div>
                  <button
                    id="mfs-complete-pay-btn"
                    onClick={() => commitOrderToDB({ gateway: "MFS", mfsNumber, senderAccount: mfsNumber, txID: "ARA_TX_" + Math.random().toString(36).substring(3, 9).toUpperCase() })}
                    className={`w-full ${activeBrandConfig.primaryColor} ${activeBrandConfig.hoverColor} text-white font-bold text-xs py-2.5 rounded-xl transition duration-200 active:scale-[0.98] shadow-md shadow-black/10 cursor-pointer`}
                  >
                    Confirm & Transact BDT {orderTotal}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SIMULATED CARDS INTERACTION */}
          {gatewayStep === "card" && (
            <div className="bg-gradient-to-b from-[#1a1f71]/5 to-white dark:from-gray-950 dark:to-gray-900 border border-[#1a1f71]/10 p-6 rounded-3xl flex flex-col items-center justify-center min-h-[400px] text-center font-sans shadow-xl transition-all duration-300">
              <div className="flex gap-2.5 mb-3.5">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6 object-contain" referrerPolicy="no-referrer" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg" alt="MasterCard" className="h-6 object-contain" referrerPolicy="no-referrer" />
              </div>
              <h3 className="font-display font-bold text-gray-900 dark:text-white text-sm">Visa / MasterCard Gateway</h3>
              <p className="text-gray-500 text-[10px] mb-6">Secured via SSLCommerz certified payment system</p>

              <div className="w-full max-w-sm space-y-4 text-left">
                <div>
                  <label className="block text-[11px] text-gray-600 dark:text-gray-400 font-bold mb-1">Cardholder Name</label>
                  <input
                    id="card-name-input"
                    type="text"
                    placeholder="E.g., Rafsan Rahman"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 text-xs text-gray-950 dark:text-white font-bold shadow-sm focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-600 dark:text-gray-400 font-bold mb-1">16-Digit Card Number</label>
                  <input
                    id="card-number-input"
                    type="text"
                    maxLength={19}
                    placeholder="4000 1234 5678 9010"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 text-xs text-gray-950 dark:text-white font-mono shadow-sm focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-gray-600 dark:text-gray-400 font-bold mb-1">Expiry Date</label>
                    <input
                      id="card-expiry-input"
                      type="text"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 text-xs text-gray-950 dark:text-white text-center font-mono shadow-sm focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-600 dark:text-gray-400 font-bold mb-1">CVV Security PIN</label>
                    <input
                      id="card-cvv-input"
                      type="password"
                      maxLength={3}
                      placeholder="•••"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 text-xs text-gray-950 dark:text-white text-center font-mono shadow-sm focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <button
                  id="card-submit-pay-btn"
                  onClick={() => commitOrderToDB({ gateway: "Card", cardholder: cardName, cardLast4: cardNumber.slice(-4) })}
                  className="w-full bg-[#1a1f71] hover:bg-[#131754] text-white font-bold text-xs py-2.5 rounded-xl transition text-center shadow-md shadow-[#1a1f71]/10 cursor-pointer"
                >
                  Confirm & Pay BDT {orderTotal}
                </button>
              </div>
            </div>
          )}

          {/* PROCESSING STATE WITH SPINNING RINGS */}
          {gatewayStep === "processing" && (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center font-sans space-y-4">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <h3 className="font-display font-bold text-gray-900 dark:text-white">Connecting To Secure Bank Nodes</h3>
              <p className="text-gray-500 text-xs">Authenticating and verifying transactions index. Please do not close or reload window...</p>
            </div>
          )}
        </div>

        {/* Right Side: Order checkout cart listing (Compact design & space efficient) */}
        <div className="w-full md:w-80 bg-gray-50/50 dark:bg-gray-950/60 p-4 md:p-5 flex flex-col justify-between font-sans text-xs border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800/60 transition-all shrink-0">
          <div>
            <h3 className="font-display font-bold text-gray-900 dark:text-white text-xs md:text-sm border-b border-gray-200/60 dark:border-gray-800/40 pb-2 mb-3 flex items-center justify-between">
              <span>Your Orders</span>
              <span className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-extrabold">{cart.length} items</span>
            </h3>

            {/* Scrollable checklist items - Tighter heights */}
            <div className="space-y-2.5 max-h-[130px] md:max-h-[200px] overflow-y-auto pr-1 mb-3 scrollbar-thin">
              {cart.map((item) => (
                <div key={item.product.id + (item.selectedColor || "")} className="flex gap-2.5 items-center bg-white/50 dark:bg-gray-900/40 p-1.5 rounded-xl border border-gray-100/50 dark:border-gray-800/10">
                  <img src={item.product.images[0]} alt={item.product.name} className="w-8 h-8 object-cover rounded-lg shrink-0 border border-gray-100 dark:border-gray-800/30" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[10.5px] text-gray-800 dark:text-gray-200 truncate">{item.product.name}</p>
                    <p className="text-[9px] text-gray-400 font-bold tracking-tight">Qty: {item.quantity} • {item.selectedColor || "Default"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-extrabold text-[11px] text-gray-950 dark:text-white">৳{item.product.salePrice * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Campaign Code Input - Highly compact */}
            <div className="border-t border-gray-200/60 dark:border-gray-800/40 pt-3 mb-3 flex flex-col">
              <label className="block text-gray-600 dark:text-gray-400 font-extrabold text-[10px] mb-1">Have a Coupon Code?</label>
              <div className="flex gap-1.5 matches-coupon">
                <input
                  id="coupon-input"
                  type="text"
                  placeholder="e.g. ARA20"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="bg-white dark:bg-gray-900 text-gray-950 dark:text-white border border-gray-200 dark:border-gray-800 rounded-lg px-2 py-1 focus:border-emerald-500 uppercase flex-1 font-extrabold text-[11px] outline-none"
                />
                <button
                  id="apply-coupon-btn"
                  onClick={handleApplyCoupon}
                  className="bg-gray-900 hover:bg-gray-850 dark:bg-white dark:hover:bg-gray-50 text-white dark:text-gray-900 px-3 py-1 rounded-lg font-bold hover:scale-[1.02] transition duration-200 cursor-pointer text-[10px]"
                >
                  Apply
                </button>
              </div>
              {couponError && <p className="text-red-500 text-[9px] mt-0.5 font-bold">❌ {couponError}</p>}
              {couponSuccess && <p className="text-emerald-500 text-[9px] mt-0.5 font-bold">✅ {couponSuccess}</p>}
            </div>
          </div>

          {/* Pricing totals summary blocks - Tighter spacing */}
          <div className="border-t border-gray-200/60 dark:border-gray-800/40 pt-2.5 space-y-1.5 text-[11px] md:text-xs">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Cart Subtotal</span>
              <span className="font-bold text-gray-900 dark:text-white">৳{cartSubtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Delivery Charge</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {shippingCharge === 0 ? "FREE" : `৳${shippingCharge}`}
              </span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span className="font-semibold">VAT / Tax ({settings.taxPercentage}%)</span>
              <span className="font-bold text-gray-900 dark:text-white">৳{taxAmount}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-rose-500 font-extrabold">
                <span>Discount / Reduction</span>
                <span>- ৳{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-xs md:text-sm font-black text-gray-950 dark:text-white border-t border-gray-200/60 dark:border-gray-800/45 pt-2 mt-1.5">
              <span>Grand Total</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-sm">৳{orderTotal}</span>
            </div>

            <div className="flex items-center gap-1 text-[9px] text-gray-400 pt-2 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>SSL Secure 256-Bit encrypted payment.</span>
            </div>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
}
