import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  TrendingDown, 
  Zap, 
  Clock, 
  ShieldCheck, 
  ExternalLink, 
  ShoppingBag,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Store,
  Check,
  AlertCircle
} from 'lucide-react';
import { Product, Language, QuickAppId } from '../types';
import { PLATFORMS, PlatformMeta } from '../data/platforms';
import { sounds } from '../utils/audio';

interface PriceComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  lang: Language;
  onAddToCart: (product: Product, platform?: QuickAppId) => void;
  onOrderNow: (product: Product, platform?: QuickAppId) => void;
}

export const PriceComparisonModal: React.FC<PriceComparisonModalProps> = ({
  isOpen,
  onClose,
  product,
  lang,
  onAddToCart,
  onOrderNow,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<QuickAppId | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const comp = product.competitorComparison;

  // Platform listings array
  const platformList: {
    appId: QuickAppId;
    meta: PlatformMeta;
    price: number;
    deliveryMins: number;
    deliveryFee: number;
    handlingFee: number;
    total: number;
    inStock: boolean;
    isCheapest: boolean;
    isFastest: boolean;
    savingsVsHighest: number;
  }[] = [];

  const apps: QuickAppId[] = ['blinkit', 'zepto', 'instamart', 'bbnow', 'quickmart'];

  let minTotal = Infinity;
  let maxTotal = 0;
  let cheapestPlatform: QuickAppId = 'quickmart';
  let fastestPlatform: QuickAppId = 'quickmart';
  let fastestTime = Infinity;

  apps.forEach((appId) => {
    const meta = PLATFORMS[appId];
    let price = product.price;
    let deliveryMins = meta.avgDeliveryMins;
    let deliveryFee = meta.baseDeliveryFee;
    let handlingFee = meta.baseHandlingFee;
    let inStock = true;

    if (comp) {
      if (appId === 'blinkit') {
        price = comp.blinkit.price;
        deliveryMins = comp.blinkit.deliveryMins;
        deliveryFee = comp.blinkit.deliveryFee;
      } else if (appId === 'zepto') {
        price = comp.zepto.price;
        deliveryMins = comp.zepto.deliveryMins;
        deliveryFee = comp.zepto.deliveryFee;
      } else if (appId === 'instamart') {
        price = comp.instamart.price;
        deliveryMins = comp.instamart.deliveryMins;
        deliveryFee = comp.instamart.deliveryFee;
      } else if (appId === 'bbnow') {
        price = comp.bbnow.price;
        deliveryMins = comp.bbnow.deliveryMins;
        deliveryFee = comp.bbnow.deliveryFee;
      } else if (appId === 'quickmart') {
        price = product.price;
        deliveryMins = 10;
        deliveryFee = 0;
      }
    }

    const total = price + deliveryFee + handlingFee;
    if (total < minTotal) {
      minTotal = total;
      cheapestPlatform = appId;
    }
    if (total > maxTotal) {
      maxTotal = total;
    }
    if (deliveryMins < fastestTime) {
      fastestTime = deliveryMins;
      fastestPlatform = appId;
    }

    platformList.push({
      appId,
      meta,
      price,
      deliveryMins,
      deliveryFee,
      handlingFee,
      total,
      inStock,
      isCheapest: false,
      isFastest: false,
      savingsVsHighest: 0,
    });
  });

  // Flag cheapest & fastest
  platformList.forEach((item) => {
    item.isCheapest = item.appId === cheapestPlatform;
    item.isFastest = item.appId === fastestPlatform;
    item.savingsVsHighest = Math.max(0, maxTotal - item.total);
  });

  // Sort: cheapest first
  platformList.sort((a, b) => a.total - b.total);

  const bestOption = platformList[0];
  const activeAppChoice = selectedPlatform || bestOption.appId;
  const activeItem = platformList.find(p => p.appId === activeAppChoice) || bestOption;

  const handleSimulateRescan = () => {
    sounds.playPop();
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      sounds.playSuccess();
    }, 800);
  };

  const handleLaunchExternal = (appMeta: PlatformMeta) => {
    sounds.playPop();
    const query = encodeURIComponent(product.name);
    let targetUrl = appMeta.webUrl;
    if (appMeta.id === 'blinkit') {
      targetUrl = `https://blinkit.com/s/?q=${query}`;
    } else if (appMeta.id === 'zepto') {
      targetUrl = `https://www.zeptonow.com/search?query=${query}`;
    } else if (appMeta.id === 'instamart') {
      targetUrl = `https://www.swiggy.com/instamart/search?custom_back=true&query=${query}`;
    } else if (appMeta.id === 'bbnow') {
      targetUrl = `https://www.bigbasket.com/ps/?q=${query}`;
    }
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-linear-to-r from-emerald-50 via-teal-50 to-amber-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-stone-900 font-display">
                  {lang === 'mr' ? 'सर्व ॲप्सवरून लाईव्ह दर आणि थेट ऑर्डर' : 'Fetch & Compare Across All Apps'}
                </h3>
                <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Live Sync
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-600 font-medium">
                {lang === 'mr'
                  ? 'Blinkit, Zepto, Swiggy Instamart आणि BB Now चे दर तपासून सर्वात स्वस्त दरात ऑर्डर करा'
                  : 'Scans Blinkit, Zepto, Swiggy Instamart & BB Now. Order directly from the cheapest!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="rescan-product-rates-btn"
              onClick={handleSimulateRescan}
              disabled={isRefreshing}
              title="Rescan rates across all darkstores"
              className="p-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 transition-colors flex items-center gap-1 text-xs font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
              <span className="hidden sm:inline">{lang === 'mr' ? 'रीफ्रेश' : 'Sync'}</span>
            </button>
            <button
              id="close-price-comparison-modal"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white border border-stone-200 hover:bg-stone-100 text-stone-600 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Selected Product Summary Card */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 flex items-center gap-3.5">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-16 h-16 rounded-xl object-cover border border-stone-200 bg-white shrink-0 shadow-2xs"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-emerald-700 font-black uppercase tracking-wider">
                {product.category}
              </div>
              <h4 className="text-sm sm:text-base font-extrabold text-stone-900 truncate">
                {lang === 'mr' ? product.nameMr : product.name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-stone-600 font-bold bg-white border border-stone-200 px-2 py-0.5 rounded-md">
                  {lang === 'mr' ? product.unitMr : product.unit}
                </span>
                <span className="text-[11px] text-stone-400 line-through">
                  MRP ₹{product.mrp}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] font-bold text-stone-500 uppercase block">
                {lang === 'mr' ? 'किमान दर' : 'Best Rate'}
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-700">₹{bestOption.price}</span>
            </div>
          </div>

          {/* Winner Announcement Banner */}
          <div className="bg-linear-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-3.5 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-white shrink-0">
                🏆
              </div>
              <div>
                <div className="text-xs sm:text-sm font-black flex items-center gap-1.5 flex-wrap">
                  <span>{lang === 'mr' ? 'हे उत्पादन सर्वात स्वस्त आहे:' : 'Cheapest on:'}</span>
                  <span className="bg-white text-emerald-950 px-2 py-0.5 rounded-md font-black text-xs">
                    {bestOption.meta.name} (₹{bestOption.price})
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100 font-medium mt-0.5">
                  {lang === 'mr'
                    ? `तुम्ही एकूण ₹${bestOption.savingsVsHighest} पर्यंत बचत करत आहात (${bestOption.deliveryMins} मिनिटांत डिलिव्हरी)`
                    : `Saves up to ₹${bestOption.savingsVsHighest} vs other apps with delivery in ${bestOption.deliveryMins} mins.`}
                </p>
              </div>
            </div>

            <button
              id="order-from-cheapest-winner-btn"
              onClick={() => {
                sounds.playSuccess();
                onOrderNow(product, bestOption.appId);
                onClose();
              }}
              className="bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-black px-3.5 py-2 rounded-xl shrink-0 shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{lang === 'mr' ? 'थेट ऑर्डर' : '1-Click Order'}</span>
            </button>
          </div>

          {/* All Apps Live Comparison List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-black uppercase text-stone-600 tracking-wider flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-stone-500" />
                <span>{lang === 'mr' ? 'सर्व ॲप्समधील तुलनात्मक दर (Live Scraped Rates)' : 'Live Scraped Rates by Platform'}</span>
              </h5>
              <span className="text-[10px] text-stone-500 font-semibold">
                Pincode 411038 / Indiranagar
              </span>
            </div>

            <div className="space-y-2">
              {platformList.map((item) => {
                const isSelected = activeAppChoice === item.appId;
                return (
                  <div
                    key={item.appId}
                    onClick={() => {
                      setSelectedPlatform(item.appId);
                      sounds.playPop();
                    }}
                    className={`border rounded-2xl p-3 sm:p-3.5 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/40 shadow-xs ring-2 ring-emerald-500/20'
                        : item.isCheapest
                        ? 'border-amber-400 bg-amber-50/30 hover:border-amber-500'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    {/* Left: Platform Brand & Timings */}
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 shadow-2xs border"
                        style={{ backgroundColor: item.meta.bgLight, color: item.meta.color, borderColor: item.meta.borderLight }}
                      >
                        {item.appId === 'blinkit' && '💛 BL'}
                        {item.appId === 'zepto' && '💜 ZP'}
                        {item.appId === 'instamart' && '🧡 IM'}
                        {item.appId === 'bbnow' && '❤️ BB'}
                        {item.appId === 'quickmart' && '⚡ QM'}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-stone-900 text-sm">
                            {lang === 'mr' ? item.meta.nameMr : item.meta.name}
                          </span>
                          {item.isCheapest && (
                            <span className="bg-amber-400 text-stone-950 font-black text-[9px] px-1.5 py-0.2 rounded uppercase">
                              {lang === 'mr' ? 'सर्वात स्वस्त 🥇' : 'Cheapest 🥇'}
                            </span>
                          )}
                          {item.isFastest && (
                            <span className="bg-purple-100 text-purple-800 font-bold text-[9px] px-1.5 py-0.2 rounded flex items-center gap-0.5">
                              <Zap className="w-2.5 h-2.5" />
                              {item.deliveryMins}m Fastest
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-stone-500 font-medium mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-stone-400" />
                            {item.deliveryMins} {lang === 'mr' ? 'मिनिटे' : 'mins'}
                          </span>
                          <span>•</span>
                          <span>
                            {item.deliveryFee === 0 ? (
                              <strong className="text-emerald-700">Free Delivery</strong>
                            ) : (
                              `₹${item.deliveryFee} delivery`
                            )}
                          </span>
                          <span>•</span>
                          <span>₹{item.handlingFee} fee</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Price Breakdown & Action Buttons */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                      <div className="text-left sm:text-right">
                        <div className="flex items-baseline gap-1">
                          <span className="text-base sm:text-lg font-black text-stone-900">
                            ₹{item.price}
                          </span>
                          <span className="text-[10px] text-stone-500 font-semibold">
                            (Total: ₹{item.total})
                          </span>
                        </div>
                        {item.savingsVsHighest > 0 ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded block sm:inline">
                            Save ₹{item.savingsVsHighest}
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-stone-400">
                            Base rate
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Order Directly via this App */}
                        <button
                          id={`order-via-${item.appId}-btn`}
                          onClick={(e) => {
                            e.stopPropagation();
                            sounds.playSuccess();
                            onOrderNow(product, item.appId);
                            onClose();
                          }}
                          className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-colors flex items-center gap-1 shadow-2xs ${
                            item.isCheapest
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-stone-900 hover:bg-stone-800 text-white'
                          }`}
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>
                            {lang === 'mr' 
                              ? `${item.meta.name} वरून ऑर्डर` 
                              : `Order on ${item.meta.name}`}
                          </span>
                        </button>

                        {/* Open external app/website */}
                        <button
                          id={`open-external-${item.appId}-btn`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLaunchExternal(item.meta);
                          }}
                          title={`Open ${item.meta.name} Store`}
                          className="p-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-600 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Aggregator Guarantee Box */}
          <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200 flex items-start gap-3 text-xs text-stone-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-stone-900 block">
                {lang === 'mr' ? 'युनिव्हर्सल ऑर्डरिंग हमी (Universal Routing Engine)' : 'Unified Quick-Commerce Fulfillment'}
              </span>
              <p className="mt-0.5 text-[11px] leading-relaxed text-stone-600">
                {lang === 'mr'
                  ? 'QuickMart सर्व प्रमुख ॲप्स (Blinkit, Zepto, Instamart, BB Now) वरून थेट दर आणि स्टॉक तपासते. तुम्ही ज्या ॲपवर सर्वात स्वस्त आहे तिथून एका क्लिकवर ऑर्डर करू शकता किंवा थेट त्या ॲपवर जाऊ शकता!'
                  : 'QuickMart monitors inventory, surge rates, and delivery slots across Blinkit, Zepto, Swiggy Instamart, and BB Now. Order directly from whichever darkstore has the lowest landing price.'}
              </p>
            </div>
          </div>

        </div>

        {/* Footer Action Bar */}
        <div className="p-3.5 sm:p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
          <div className="hidden sm:block text-xs text-stone-500">
            Selected: <strong className="text-stone-900">{PLATFORMS[activeAppChoice].name}</strong> (₹{activeItem.price})
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-3.5 py-2 border border-stone-300 text-stone-700 hover:bg-stone-100 rounded-xl font-bold text-xs transition-colors"
            >
              {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
            </button>

            <button
              id="add-to-cart-selected-platform-btn"
              onClick={() => {
                sounds.playPop();
                onAddToCart(product, activeAppChoice);
                onClose();
              }}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>
                {lang === 'mr' ? 'कार्टमध्ये जोडा' : 'Add to Cart'}
              </span>
            </button>

            <button
              id="instant-order-selected-platform-btn"
              onClick={() => {
                sounds.playSuccess();
                onOrderNow(product, activeAppChoice);
                onClose();
              }}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>
                {lang === 'mr' 
                  ? `ऑर्डर करा (${PLATFORMS[activeAppChoice].name} - ₹${activeItem.price})` 
                  : `Order Now (${PLATFORMS[activeAppChoice].name} - ₹${activeItem.price})`}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
