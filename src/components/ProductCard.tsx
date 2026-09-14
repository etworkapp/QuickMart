import React from 'react';
import { Plus, Minus, AlertCircle, Sparkles, TrendingDown, Store, ExternalLink, Zap } from 'lucide-react';
import { Product, Language, QuickAppId } from '../types';
import { PLATFORMS, getProductPlatformUrl } from '../data/platforms';
import { translations } from '../utils/translations';
import { sounds } from '../utils/audio';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onAddToCart: (product: Product, platform?: QuickAppId) => void;
  onBuyDirectly?: (product: Product, platform: QuickAppId) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onOpenPriceComparison?: (product: Product) => void;
  lang: Language;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantityInCart,
  onAddToCart,
  onBuyDirectly,
  onUpdateQuantity,
  onOpenPriceComparison,
  lang,
}) => {
  const t = translations[lang];
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;
  const discountPercent = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const comp = product.competitorComparison;

  // Determine who has the lowest price
  const cheapestAppId = comp?.cheapestApp || 'quickmart';
  const cheapestMeta = PLATFORMS[cheapestAppId];
  const lowestPrice = comp?.lowestPrice || product.price;

  const handleExternalLaunch = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playPop();
    const url = getProductPlatformUrl(cheapestAppId, product.name);
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`group bg-white rounded-3xl border transition-all duration-200 flex flex-col justify-between overflow-hidden relative shadow-xs ${
      isOutOfStock 
        ? 'border-stone-200 opacity-80' 
        : 'border-stone-200 hover:border-emerald-500 hover:shadow-md'
    }`}>
      {/* Top badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start max-w-[75%]">
        {/* Cheapest Platform Badge */}
        {comp && (
          <span 
            className="text-white font-black text-[9px] px-2 py-0.5 rounded-lg tracking-wide shadow-xs flex items-center gap-1 border border-white/20"
            style={{ backgroundColor: cheapestMeta.color }}
          >
            <span>🏆</span>
            <span className="truncate">
              {lang === 'mr' ? `${cheapestMeta.name} वर सर्वात स्वस्त` : `Cheapest on ${cheapestMeta.name}`}
            </span>
          </span>
        )}
        {product.bestseller && (
          <span className="bg-amber-400 text-stone-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-md tracking-wider shadow-xs flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            {t.bestseller}
          </span>
        )}
      </div>

      {/* Real-time Inventory badge on top-right */}
      <div className="absolute top-2.5 right-2.5 z-10">
        {isOutOfStock ? (
          <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 animate-pulse">
            <AlertCircle className="w-3 h-3" />
            {t.outOfStock}
          </span>
        ) : isLowStock ? (
          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            {product.stock} {t.leftCount}!
          </span>
        ) : (
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            {product.stock} in stock
          </span>
        )}
      </div>

      {/* Product Image */}
      <div 
        onClick={() => {
          if (onOpenPriceComparison) onOpenPriceComparison(product);
        }}
        className="w-full h-36 sm:h-44 bg-stone-50/80 relative overflow-hidden flex items-center justify-center p-3 cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105 ${
            isOutOfStock ? 'grayscale-50' : ''
          }`}
          loading="lazy"
        />
      </div>

      {/* Details */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Unit / Weight */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wide block mb-1">
              {lang === 'mr' ? product.unitMr : product.unit}
            </span>
            {discountPercent > 0 && (
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Product Name */}
          <h4 
            onClick={() => {
              if (onOpenPriceComparison) onOpenPriceComparison(product);
            }}
            className="text-sm font-bold text-stone-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors cursor-pointer"
          >
            {lang === 'mr' ? product.nameMr : product.name}
          </h4>

          {/* All Apps Live Price Comparison Pill */}
          {comp && (
            <button
              type="button"
              id={`compare-btn-${product.id}`}
              onClick={(e) => {
                e.stopPropagation();
                sounds.playPop();
                if (onOpenPriceComparison) {
                  onOpenPriceComparison(product);
                }
              }}
              className="mt-2 w-full text-left bg-stone-50 hover:bg-stone-100 border border-stone-200/90 rounded-xl p-2 transition-all cursor-pointer group/comp shadow-2xs"
            >
              <div className="flex items-center justify-between text-[10px] text-stone-800 font-black">
                <span className="flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    {lang === 'mr' ? 'लाईव्ह दर तुलना:' : 'Auto-Fetched Rates:'}
                  </span>
                </span>
                <span className="text-emerald-700 underline font-black group-hover/comp:text-emerald-900">
                  {lang === 'mr' ? 'सर्व ॲप्स' : 'Compare All'}
                </span>
              </div>
              <div className="text-[10px] text-stone-600 mt-1 font-semibold flex items-center gap-1 flex-wrap">
                <span className={`px-1.5 py-0.5 rounded text-[9px] ${comp.cheapestApp === 'blinkit' ? 'bg-amber-100 text-amber-950 font-black ring-1 ring-amber-400' : 'bg-white border border-stone-200'}`}>
                  Blinkit: ₹{comp.blinkit.price}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] ${comp.cheapestApp === 'zepto' ? 'bg-purple-100 text-purple-950 font-black ring-1 ring-purple-400' : 'bg-white border border-stone-200'}`}>
                  Zepto: ₹{comp.zepto.price}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] ${comp.cheapestApp === 'instamart' ? 'bg-orange-100 text-orange-950 font-black ring-1 ring-orange-400' : 'bg-white border border-stone-200'}`}>
                  Instamart: ₹{comp.instamart.price}
                </span>
                {comp.bbnow && (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] ${comp.cheapestApp === 'bbnow' ? 'bg-rose-100 text-rose-950 font-black ring-1 ring-rose-400' : 'bg-white border border-stone-200'}`}>
                    BB: ₹{comp.bbnow.price}
                  </span>
                )}
              </div>
            </button>
          )}
        </div>

        {/* Pricing and Action Button */}
        <div className="mt-3 pt-2.5 border-t border-stone-100 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-black text-stone-900">
                  ₹{lowestPrice}
                </span>
                {product.mrp > lowestPrice && (
                  <span className="text-xs text-stone-400 line-through">
                    ₹{product.mrp}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-bold text-emerald-700 block">
                {lang === 'mr' ? 'किमान दर' : 'Lowest Live Rate'}
              </span>
            </div>

            {/* Add / Stepper Button */}
            <div>
              {isOutOfStock ? (
                <button
                  disabled
                  className="px-3 py-1.5 rounded-xl bg-stone-100 text-stone-400 text-xs font-bold border border-stone-200 cursor-not-allowed"
                >
                  {t.outOfStock}
                </button>
              ) : quantityInCart === 0 ? (
                <button
                  id={`add-btn-${product.id}`}
                  onClick={() => {
                    sounds.playAdd();
                    onAddToCart(product, cheapestAppId);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-black transition-all active:scale-95 shadow-xs flex items-center gap-1 uppercase tracking-wider"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.add}</span>
                </button>
              ) : (
                <div className="flex items-center bg-stone-900 text-white rounded-xl shadow-xs overflow-hidden">
                  <button
                    id={`decrement-btn-${product.id}`}
                    onClick={() => {
                      sounds.playPop();
                      onUpdateQuantity(product.id, -1);
                    }}
                    className="px-2.5 py-1.5 hover:bg-stone-800 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 text-xs font-extrabold select-none">
                    {quantityInCart}
                  </span>
                  <button
                    id={`increment-btn-${product.id}`}
                    disabled={quantityInCart >= product.stock}
                    onClick={() => {
                      sounds.playAdd();
                      onUpdateQuantity(product.id, 1);
                    }}
                    className={`px-2.5 py-1.5 transition-colors ${
                      quantityInCart >= product.stock
                        ? 'opacity-40 cursor-not-allowed'
                        : 'hover:bg-stone-800'
                    }`}
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Direct Buy From That Specific Platform Action Button */}
          {!isOutOfStock && (
            <div className="flex items-center gap-1.5 pt-1">
              <button
                id={`buy-from-platform-btn-${product.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  sounds.playSuccess();
                  if (onBuyDirectly) {
                    onBuyDirectly(product, cheapestAppId);
                  } else {
                    onAddToCart(product, cheapestAppId);
                  }
                }}
                className="flex-1 py-1.5 px-2.5 rounded-xl text-[11px] font-black text-white flex items-center justify-center gap-1 shadow-xs transition-transform active:scale-98"
                style={{ backgroundColor: cheapestMeta.color }}
              >
                <Zap className="w-3 h-3 fill-current" />
                <span className="truncate">
                  {lang === 'mr' 
                    ? `${cheapestMeta.name} वरून थेट खरेदी (₹${lowestPrice})` 
                    : `Buy on ${cheapestMeta.name} (₹${lowestPrice})`}
                </span>
              </button>

              <button
                id={`open-app-link-${product.id}`}
                onClick={handleExternalLaunch}
                title={`Open ${cheapestMeta.name} app / web store`}
                className="p-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600 transition-colors shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
