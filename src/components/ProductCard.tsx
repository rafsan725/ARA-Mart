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
}

export default function ProductCard({
  product,
  onNavigate,
  onAddToCart,
  onToggleWishlist,
  isInWishlist
}: ProductCardProps) {
  const hasDiscount = product.regularPrice > product.salePrice;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
    >
      {/* Upper Media Shell */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-950">
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
          className={`absolute top-3 right-3 p-2 rounded-full shadow-md backdrop-blur-md transition-all duration-200 z-10 cursor-pointer ${
            isInWishlist 
              ? "bg-white dark:bg-gray-800 text-red-500 scale-105" 
              : "bg-white/80 dark:bg-gray-900/80 text-gray-600 dark:text-gray-300 hover:scale-105 hover:bg-white dark:hover:bg-gray-800 hover:text-red-500"
          }`}
          title="Save to Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 ${isInWishlist ? "fill-current" : ""}`} />
        </button>

        {/* View Details Overlay (for hovering on desktop) */}
        <div 
          onClick={() => onNavigate("product-details", undefined, product.id)}
          className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 md:flex hidden items-center justify-center cursor-pointer"
        >
          <span className="bg-white/90 dark:bg-gray-900/95 text-gray-900 dark:text-gray-100 text-[10px] font-bold px-3 py-1.5 rounded-xl shadow backdrop-blur-sm tracking-wide">
            View Details
          </span>
        </div>

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
      <div className="p-4 flex-1 flex flex-col justify-between gap-3 font-sans">
        <div>
          <span className="text-[10px] font-mono tracking-wider text-emerald-600 dark:text-emerald-400 font-bold uppercase">
            {product.brand} • {product.category}
          </span>
          <h4 
            onClick={() => onNavigate("product-details", undefined, product.id)}
            className="text-xs font-semibold text-gray-900 dark:text-white mt-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 cursor-pointer transition truncate"
          >
            {product.name}
          </h4>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>

        <div>
          {/* Ratings display */}
          <div className="flex items-center gap-1 mb-2">
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
            <div>
              <span className="text-sm font-bold text-gray-950 dark:text-white">
                ৳{product.salePrice}
              </span>
              {hasDiscount && (
                <span className="text-[10px] text-gray-400 line-through ml-1.5">
                  ৳{product.regularPrice}
                </span>
              )}
            </div>

            {/* Quick Add trigger */}
            {product.stockQuantity > 0 && (
              <button
                id={`quick-add-${product.id}`}
                onClick={() => onAddToCart(product, 1, product.colorVariations[0])}
                className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition cursor-pointer"
                title="Add to Cart"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
