import React from "react";
import { Star, ShoppingCart, Eye, Heart } from "lucide-react";
import { motion } from "motion/react";
import { Product } from "../types.js";

interface ProductCardProps {
  key?: string | number;
  product: Product;
  onNavigate: (page: string, categoryId?: string, productId?: string) => void;
  onAddToCart: (product: Product, quantity: number, color?: string, size?: string) => void;
  onToggleWishlist: (product: Product) => void;
  isInWishlist: boolean;
  viewMode?: "grid" | "list";
}

export default function ProductCard({
  product,
  onNavigate,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  viewMode = "grid"
}: ProductCardProps) {
  const hasDiscount = product.regularPrice > product.salePrice;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden ${
        viewMode === "list" ? "md:flex-row md:items-stretch" : "h-full"
      }`}
    >
      {/* Upper Media Shell */}
      <div className={`relative bg-gray-50 dark:bg-gray-950 overflow-hidden shrink-0 ${
        viewMode === "list" ? "aspect-square md:aspect-[4/3] w-full md:w-64" : "aspect-square w-full"
      }`}>
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />

        {/* Wishlist Button Overlay - Directly clickable on mobile & desktop */}
        <button
          id={`toggle-wishlist-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-md backdrop-blur-md transition-all duration-200 z-30 cursor-pointer ${
            isInWishlist 
              ? "bg-white dark:bg-gray-800 text-red-500 scale-105" 
              : "bg-white/80 dark:bg-gray-900/80 text-gray-600 dark:text-gray-300 hover:scale-105 hover:bg-white dark:hover:bg-gray-800 hover:text-red-500"
          }`}
          title="Save to Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 ${isInWishlist ? "fill-current" : ""}`} />
        </button>

        {/* Hover Dimming Background & Quick View Center Action */}
        <div 
          className="absolute inset-0 bg-black/30 dark:bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 flex items-center justify-center pointer-events-none group-hover:pointer-events-auto"
        >
          <button
            type="button"
            id={`hover-quick-view-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate("product-details", undefined, product.id);
            }}
            className="transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 scale-95 hover:scale-105 transition-all duration-300 ease-out bg-white/95 dark:bg-gray-900/95 text-gray-800 dark:text-gray-100 text-[11px] font-bold px-3.5 py-2 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-800/80 hover:border-emerald-500/55 hover:bg-white dark:hover:bg-gray-800 flex items-center gap-1.5 cursor-pointer backdrop-blur-sm"
          >
            <Eye className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300 group-hover:text-emerald-500" />
            Quick View
          </button>
        </div>

        {/* Hover Slide Up "Add to Cart" Option */}
        {product.stockQuantity > 0 ? (
          <button
            type="button"
            id={`hover-add-to-cart-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product, 1, product.colorVariations?.[0] || "Carbon Black");
            }}
            className="absolute bottom-0 left-0 right-0 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 text-xs flex items-center justify-center gap-1.5 transition-all duration-300 ease-out transform translate-y-full group-hover:translate-y-0 z-20 shadow-lg cursor-pointer font-display tracking-wider"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add to Cart
          </button>
        ) : (
          <div className="absolute bottom-0 left-0 right-0 w-full bg-gray-700 dark:bg-gray-800 text-white text-[10px] font-bold py-2 text-center uppercase tracking-wider transform translate-y-full group-hover:translate-y-0 z-20">
            Out of Stock
          </div>
        )}

        {/* Discount Badge Overlay */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-display font-bold px-2 py-1 rounded-lg shadow-sm">
            {product.discountPercentage}% OFF
          </div>
        )}

        {/* Stock Status Alert */}
        {product.stockQuantity === 0 ? (
          <div className="absolute bottom-3 left-3 bg-gray-900/90 text-white text-[9px] font-sans font-bold uppercase tracking-widest px-2 py-1 rounded-md">
            Out of Stock
          </div>
        ) : product.stockQuantity < 10 ? (
          <div className="absolute bottom-3 left-3 bg-yellow-500/90 text-gray-900 text-[9px] font-sans font-bold uppercase tracking-widest px-2 py-1 rounded-md">
            Only {product.stockQuantity} Left
          </div>
        ) : null}
      </div>

      {/* Description Metrics */}
      <div className={`flex-1 flex flex-col justify-between font-sans ${
        viewMode === "list" ? "p-5 md:p-6 md:pl-8 gap-4 md:gap-6" : "p-4 gap-3"
      }`}>
        <div>
          <span className="text-[10px] font-mono tracking-wider text-emerald-600 dark:text-emerald-400 font-bold uppercase">
            {product.brand} • {product.category}
          </span>
          <h4 
            onClick={() => onNavigate("product-details", undefined, product.id)}
            className={`font-semibold text-gray-900 dark:text-white mt-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 cursor-pointer transition truncate ${
              viewMode === "list" ? "text-sm md:text-base font-bold whitespace-normal line-clamp-1" : "text-xs"
            }`}
          >
            {product.name}
          </h4>
          <p className={`text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed ${
            viewMode === "list" ? "text-xs line-clamp-3 md:line-clamp-4" : "text-[11px] line-clamp-2"
          }`}>
            {product.shortDescription}
          </p>
        </div>

        <div>
          {/* Ratings display */}
          <div className="flex items-center gap-1.5 mb-2.5">
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star
                  key={idx}
                  className={`w-3 h-3 ${
                    idx < Math.round(product.rating) ? "fill-current" : "opacity-30"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">
              {product.rating} ({product.reviews.length})
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-gray-50 dark:border-gray-800/40 pt-3">
            {/* Pricing Tag */}
            <div className="flex items-baseline gap-1.5">
              <span className={`font-bold text-gray-950 dark:text-white ${
                viewMode === "list" ? "text-base md:text-lg" : "text-sm"
              }`}>
                ৳{product.salePrice}
              </span>
              {hasDiscount && (
                <span className={`text-gray-400 line-through ${
                  viewMode === "list" ? "text-xs font-medium" : "text-[10px]"
                }`}>
                  ৳{product.regularPrice}
                </span>
              )}
            </div>

            {/* Quick Add trigger */}
            <div className="flex items-center gap-2">
              {viewMode === "list" && product.stockQuantity > 0 && (
                <button
                  type="button"
                  onClick={() => onAddToCart(product, 1, product.colorVariations?.[0] || "Carbon Black")}
                  className="hidden md:flex items-center gap-2 px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md cursor-pointer transition duration-200"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Add to Cart
                </button>
              )}
              {product.stockQuantity > 0 && (
                <button
                  id={`quick-add-${product.id}`}
                  onClick={() => onAddToCart(product, 1, product.colorVariations?.[0] || "Carbon Black")}
                  className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition cursor-pointer"
                  title="Add to Cart"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
