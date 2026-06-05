import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, ShoppingBag, Star, Tag, Truck, ShieldCheck, RotateCcw, Award, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product } from "../types.js";

interface HeroSliderProps {
  products: Product[];
  onNavigate: (page: string, categorySlug?: string, productId?: string) => void;
}

export default function HeroSlider({ products, onNavigate }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Take up to 5 products for our slider (preferably featured, otherwise fallback to first 5)
  const sliderProducts = React.useMemo(() => {
    if (!products || products.length === 0) {
      return [];
    }
    // Filter featured first, then standard, up to 5
    const featured = products.filter((p) => p.featured || p.flashSale);
    if (featured.length >= 5) {
      return featured.slice(0, 5);
    }
    const combined = [...featured, ...products.filter((p) => !p.featured && !p.flashSale)];
    // Deduplicate by ID
    const unique = combined.reduce((acc: Product[], current) => {
      const x = acc.find((item) => item.id === current.id);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);
    return unique.slice(0, 5);
  }, [products]);

  // Autoplay functionality
  useEffect(() => {
    if (sliderProducts.length <= 1) return;
    const interval = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(interval);
  }, [sliderProducts, activeIndex]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % sliderProducts.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + sliderProducts.length) % sliderProducts.length);
  };

  if (sliderProducts.length === 0) {
    return (
      <section className="relative w-full aspect-[21/9] md:aspect-[3/1] bg-gray-100 dark:bg-gray-900 animate-pulse rounded-2xl flex items-center justify-center">
        <div className="text-gray-400 text-xs font-mono">LOADING SPOTLIGHT ACCESSORIES...</div>
      </section>
    );
  }

  const currentProduct = sliderProducts[activeIndex];
  const discountLabel = currentProduct.discountPercentage > 0 
    ? `${currentProduct.discountPercentage}% Special Off` 
    : currentProduct.regularPrice > currentProduct.salePrice
    ? `Save ৳${currentProduct.regularPrice - currentProduct.salePrice}`
    : "Best Seller Edition";

  return (
    <section className="relative w-full min-h-[420px] sm:min-h-0 sm:aspect-[20/9] md:aspect-[21/7.5] bg-gray-950 dark:bg-black overflow-hidden group/slider rounded-3xl flex flex-col justify-between">
      {/* Background Ambience/Blur Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={currentProduct.images[0]}
          alt=""
          className="w-full h-full object-cover scale-150 blur-2xl opacity-20 dark:opacity-20 transition-all duration-1000"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/80 to-transparent z-10" />
      </div>

      {/* Main Slide Carousel container */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 flex items-center z-10 flex-1 py-3 sm:py-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 lg:gap-12 w-full items-center py-2">
          
          {/* Informational Column (Left) */}
          <div className="md:col-span-7 flex flex-col justify-center text-left order-2 md:order-1 select-none space-y-2 sm:space-y-3.5 md:space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-2 sm:space-y-3.5 md:space-y-4"
              >
                {/* Promo Badge details */}
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full text-emerald-400 font-mono text-[9px] sm:text-xs tracking-widest uppercase font-bold w-fit">
                  <Tag className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{discountLabel}</span>
                </div>

                {/* Main Heading title */}
                <h1 className="text-lg sm:text-2xl lg:text-3.5xl xl:text-4.5xl font-display font-black tracking-tight leading-tight text-white line-clamp-2">
                  {currentProduct.name}
                </h1>

                {/* Rating Display Section */}
                <div className="flex items-center gap-2 text-sm select-none">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => {
                      const ratingValue = i + 1;
                      const isFilled = ratingValue <= Math.round(currentProduct.rating || 4.9);
                      return (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            isFilled ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
                          }`}
                        />
                      );
                    })}
                  </div>
                  <span className="text-white text-xs font-bold font-mono mt-0.5">
                    {(currentProduct.rating || 4.9).toFixed(1)}
                  </span>
                  <span className="text-gray-400 text-[11px] mt-0.5">
                    ({currentProduct.reviews?.length || 18} reviews)
                  </span>
                </div>

                {/* Subtitle / summary */}
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-300 font-normal leading-relaxed line-clamp-2">
                  {currentProduct.shortDescription || currentProduct.description}
                </p>

                {/* Price indicators tag */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="text-base sm:text-xl md:text-2xl font-display font-extrabold text-white">
                    ৳{currentProduct.salePrice}
                  </div>
                  {currentProduct.regularPrice > currentProduct.salePrice && (
                    <div className="text-[11px] sm:text-sm text-gray-500 line-through mt-0.5">
                      ৳{currentProduct.regularPrice}
                    </div>
                  )}
                  {currentProduct.discountPercentage > 0 && (
                    <div className="bg-rose-500/20 text-rose-400 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-rose-500/30 shrink-0">
                      -{currentProduct.discountPercentage}% OFF
                    </div>
                  )}
                </div>

                {/* Direct Action Link Call Button */}
                <div className="pt-0.5 flex flex-wrap items-center gap-3">
                  <button
                    id={`hero-action-buy-${currentProduct.id}`}
                    onClick={() => onNavigate("product-details", undefined, currentProduct.id)}
                    className="group/btn flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-5 sm:py-3 px-6 sm:px-8 rounded-xl text-[10px] sm:text-xs md:text-sm uppercase tracking-wider transition-all duration-300 transform active:scale-95 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 select-none cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> View Product
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </button>

                  <button
                    id={`hero-action-catalog-${currentProduct.id}`}
                    onClick={() => onNavigate("shop", currentProduct.category.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}
                    className="flex items-center gap-1 border border-white/5 hover:border-white/10 hover:bg-white/5 text-gray-400 hover:text-white hover:underline underline-offset-4 font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-xl text-[10px] sm:text-xs transition duration-300 select-none cursor-pointer"
                  >
                    Similar Items
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Product Media Column (Right) */}
          <div className="md:col-span-5 flex items-center justify-center order-1 md:order-2 h-[110px] sm:h-[140px] md:h-[220px] lg:h-[250px] relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.9, rotate: 2 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="relative h-full w-full flex items-center justify-center p-2 select-none"
              >
                {/* Circle light background overlay */}
                <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-2xl w-[75%] h-[75%] mx-auto my-auto pointer-events-none" />

                <div className="bg-transparent flex items-center justify-center h-full w-full pointer-events-none">
                  <img
                    src={currentProduct.images[0]}
                    alt={currentProduct.name}
                    className="max-h-full max-w-[85%] object-contain mix-blend-multiply filter brightness-[0.95] contrast-[1.1] drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Manual Sliding Left and Right Clickers (arrows) */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-[40%] -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-emerald-500 text-white flex items-center justify-center backdrop-blur-sm border border-white/5 md:opacity-0 group-hover/slider:opacity-100 transition-all duration-300 md:hover:scale-110 active:scale-95 cursor-pointer"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-[40%] -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-emerald-500 text-white flex items-center justify-center backdrop-blur-sm border border-white/5 md:opacity-0 group-hover/slider:opacity-100 transition-all duration-300 md:hover:scale-110 active:scale-95 cursor-pointer"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-[66px] sm:bottom-[70px] left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {sliderProducts.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === activeIndex 
                ? "w-5 bg-emerald-500" 
                : "w-1.5 bg-white/30 hover:bg-white/65"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Trust/Feature Bar */}
      <div className="relative z-10 w-full border-t border-white/5 bg-black/50 backdrop-blur-md py-3 px-4 sm:px-8 lg:px-16 mt-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2.5 justify-center lg:justify-start">
            <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-left">
              <p className="text-white text-[10px] sm:text-xs font-bold leading-none">Free Delivery</p>
              <p className="text-gray-400 text-[8px] sm:text-[9px] leading-tight mt-0.5">Orders over ৳5,000</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 justify-center lg:justify-start">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-left">
              <p className="text-white text-[10px] sm:text-xs font-bold leading-none">Secure Payment</p>
              <p className="text-gray-400 text-[8px] sm:text-[9px] leading-tight mt-0.5">100% Secure Checkout</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 justify-center lg:justify-start">
            <RotateCcw className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-left">
              <p className="text-white text-[10px] sm:text-xs font-bold leading-none">Easy Return</p>
              <p className="text-gray-400 text-[8px] sm:text-[9px] leading-tight mt-0.5">7-Day Easy Claim policy</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 justify-center lg:justify-start">
            <Award className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-left">
              <p className="text-white text-[10px] sm:text-xs font-bold leading-none">100% Authentic</p>
              <p className="text-gray-400 text-[8px] sm:text-[9px] leading-tight mt-0.5">Direct From Brand Sourcing</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
