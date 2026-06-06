import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, ShoppingBag, Star, Tag, Truck, ShieldCheck, RotateCcw, Award, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product, Banner } from "../types.js";

interface HeroSliderProps {
  products: Product[];
  banners: Banner[];
  onNavigate: (page: string, categorySlug?: string, productId?: string) => void;
}

export default function HeroSlider({ products, banners = [], onNavigate }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Compute 3 slides from Supabase banners table
  const slides = React.useMemo(() => {
    // If the database banners are empty, use default mock banners corresponding to the database
    const activeBanners = banners && banners.length > 0 ? banners : [
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

    // Take exactly 3 slides
    return activeBanners.slice(0, 3).map((banner) => {
      // Find a matching product
      let matchedProduct = products.find((p) => {
        const linkLower = (banner.link || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
        const catLower = (p.category || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
        const nameLower = (p.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
        return (
          catLower.includes(linkLower) ||
          linkLower.includes(catLower) ||
          nameLower.includes(linkLower) ||
          linkLower.includes(nameLower)
        );
      });

      // fallback by ID if not found automatically
      if (!matchedProduct && products.length > 0) {
        if (banner.id === "b-1" || banner.link === "smart-watches") {
          matchedProduct = products.find(p => p.id === "p-1") || products[0];
        } else if (banner.id === "b-2" || banner.link === "home-appliances") {
          matchedProduct = products.find(p => p.id === "p-5") || products[0];
        } else if (banner.id === "b-3" || banner.link === "gaming-computer") {
          matchedProduct = products.find(p => p.id === "p-3") || products[0];
        } else {
          matchedProduct = products[0];
        }
      }

      return {
        id: banner.id,
        backgroundImage: banner.image,
        title: banner.title,
        subtitle: banner.subtitle,
        productName: matchedProduct ? matchedProduct.name : banner.title,
        price: matchedProduct ? matchedProduct.salePrice : 3800,
        productId: matchedProduct ? matchedProduct.id : "p-1",
        badge: banner.badge || banner.title
      };
    });
  }, [banners, products]);

  // Autoplay functionality: 5 seconds interval
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [slides, activeIndex]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (slides.length === 0) {
    return (
      <section className="relative w-full aspect-[21/9] md:aspect-[3/1] bg-gray-100 dark:bg-gray-900 animate-pulse rounded-2xl flex items-center justify-center">
        <div className="text-gray-400 text-xs font-mono">LOADING SPOTLIGHT ACCESSORIES...</div>
      </section>
    );
  }

  const currentSlide = slides[activeIndex];

  return (
    <section className="relative w-full min-h-[460px] md:min-h-[500px] bg-gray-950 dark:bg-black overflow-hidden group/slider rounded-3xl flex flex-col justify-between">
      {/* Background Image with elegant dark color-safe overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none">
        <img
          src={currentSlide.backgroundImage}
          alt={currentSlide.productName}
          className="w-full h-full object-cover transition-all duration-1000 transform scale-105 group-hover/slider:scale-110"
          referrerPolicy="no-referrer"
        />
        {/* Layered overlay to guarantee extreme visual safety and high contrast readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/70 to-transparent dark:from-black dark:via-black/75 dark:to-transparent z-10" />
      </div>

      {/* Slide Content Interface (Left) */}
      <div className="relative w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 flex items-center z-10 flex-1 py-12 sm:py-16 md:py-20">
        <div className="w-full max-w-2xl select-none space-y-4 sm:space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 35 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -35 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Promo Badge details */}
              {currentSlide.badge && (
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-1 rounded-full text-emerald-400 font-mono text-[10px] sm:text-xs tracking-widest uppercase font-black w-fit shadow-sm">
                  <Tag className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{currentSlide.badge}</span>
                </div>
              )}

              {/* Product Name Title */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight leading-tight text-white drop-shadow-md">
                {currentSlide.productName}
              </h1>

              {/* Description Subtitle */}
              {currentSlide.subtitle && (
                <p className="text-xs sm:text-sm md:text-base text-gray-200 font-medium max-w-xl leading-relaxed drop-shadow-sm line-clamp-3">
                  {currentSlide.subtitle}
                </p>
              )}

              {/* Pricing Tags */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono tracking-wider text-gray-300 uppercase font-black">Offer Price</span>
                <span className="text-xl sm:text-3.5xl font-display font-extrabold text-emerald-400 drop-shadow-lg">
                  ৳{currentSlide.price.toLocaleString()}
                </span>
              </div>

              {/* Main Call to Action Button */}
              <div className="pt-2">
                <button
                  id={`hero-action-buy-${currentSlide.id}`}
                  onClick={() => onNavigate("product-details", undefined, currentSlide.productId)}
                  className="group/btn inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-black py-3 px-8 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 transform active:scale-95 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" /> View Product
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Manual Arrow Clickers */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-[50%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/45 hover:bg-emerald-500 text-white flex items-center justify-center backdrop-blur-md border border-white/10 md:opacity-0 group-hover/slider:opacity-100 transition-all duration-300 md:hover:scale-110 active:scale-95 cursor-pointer"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-[50%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/45 hover:bg-emerald-500 text-white flex items-center justify-center backdrop-blur-md border border-white/10 md:opacity-0 group-hover/slider:opacity-100 transition-all duration-300 md:hover:scale-110 active:scale-95 cursor-pointer"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-[66px] sm:bottom-[70px] left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === activeIndex 
                ? "w-6 bg-emerald-500" 
                : "w-1.5 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Trust/Feature Bar */}
      <div className="relative z-10 w-full border-t border-white/5 bg-black/50 backdrop-blur-md py-4 px-6 sm:px-12 lg:px-20 mt-auto select-none pointer-events-none">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2.5 justify-center lg:justify-start">
            <Truck className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
            <div className="text-left">
              <p className="text-white text-xs font-bold leading-none">Free Delivery</p>
              <p className="text-gray-400 text-[10px] leading-tight mt-1">Orders over ৳5,000</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 justify-center lg:justify-start">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
            <div className="text-left">
              <p className="text-white text-xs font-bold leading-none">Secure Payment</p>
              <p className="text-gray-400 text-[10px] leading-tight mt-1">100% Secure Checkout</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 justify-center lg:justify-start">
            <RotateCcw className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
            <div className="text-left">
              <p className="text-white text-xs font-bold leading-none">Easy Return</p>
              <p className="text-gray-400 text-[10px] leading-tight mt-1">7-Day Easy Claim policy</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 justify-center lg:justify-start">
            <Award className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
            <div className="text-left">
              <p className="text-white text-xs font-bold leading-none">100% Authentic</p>
              <p className="text-gray-400 text-[10px] leading-tight mt-1">Direct From Brand Sourcing</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
