import React, { useMemo, useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  MapPin, 
  AlertTriangle, 
  Sparkles,
  TrendingDown,
  ExternalLink,
  Store,
  Check
} from 'lucide-react';
import { CartItem, Language, LocationInfo, QuickAppId } from '../types';
import { PLATFORMS } from '../data/platforms';
import { translations } from '../utils/translations';
import { sounds } from '../utils/audio';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  cartItems: CartItem[];
  location: LocationInfo;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: (preferredPlatform?: QuickAppId) => void;
  onOpenLocationModal: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  lang,
  cartItems,
  location,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onOpenLocationModal,
}) => {
  const [selectedBasketApp, setSelectedBasketApp] = useState<QuickAppId>('quickmart');

  if (!isOpen) return null;

  const t = translations[lang];

  // Base QuickMart total
  const itemTotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const deliveryFee = itemTotal >= 99 ? 0 : 15;
  const handlingFee = itemTotal > 0 ? 4 : 0;
  const toPay = itemTotal + deliveryFee + handlingFee;

  // Real-time comparison across all 4 platforms for this entire basket
  const platformBaskets = useMemo(() => {
    const apps: QuickAppId[] = ['quickmart', 'zepto', 'blinkit', 'instamart', 'bbnow'];

    const results = apps.map((appId) => {
      const meta = PLATFORMS[appId];
      let basketItemTotal = 0;

      cartItems.forEach((item) => {
        const comp = item.product.competitorComparison;
        let itemPrice = item.product.price;
        if (comp) {
          if (appId === 'blinkit') itemPrice = comp.blinkit.price;
          else if (appId === 'zepto') itemPrice = comp.zepto.price;
          else if (appId === 'instamart') itemPrice = comp.instamart.price;
          else if (appId === 'bbnow') itemPrice = comp.bbnow.price;
        }
        basketItemTotal += itemPrice * item.quantity;
      });

      const dFee = appId === 'quickmart' && basketItemTotal >= 99 ? 0 : meta.baseDeliveryFee;
      const hFee = meta.baseHandlingFee;
      const grandTotal = basketItemTotal > 0 ? basketItemTotal + dFee + hFee : 0;

      return {
        appId,
        meta,
        basketItemTotal,
        deliveryFee: dFee,
        handlingFee: hFee,
        grandTotal,
        etaMins: meta.avgDeliveryMins,
      };
    });

    let minCost = Infinity;
    let winner: QuickAppId = 'quickmart';

    results.forEach((r) => {
      if (r.grandTotal > 0 && r.grandTotal < minCost) {
        minCost = r.grandTotal;
        winner = r.appId;
      }
    });

    return {
      list: results,
      cheapestApp: winner,
      cheapestTotal: minCost,
      maxSavings: Math.max(0, Math.max(...results.map(r => r.grandTotal)) - minCost),
    };
  }, [cartItems]);

  const isOutsideZone = location.status === 'out_of_zone';
  const isGpsError = location.status === 'gps_error';
  const hasLocationBlock = isOutsideZone || isGpsError;

  const currentChosenApp = selectedBasketApp || platformBaskets.cheapestApp;
  const currentBasketData = platformBaskets.list.find(b => b.appId === currentChosenApp) || platformBaskets.list[0];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="fixed inset-y-0 right-0 max-w-full flex pl-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Drawer Header */}
          <div className="px-5 py-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-stone-900 font-display">
                  {t.cartTitle}
                </h3>
                <span className="text-xs text-stone-500 font-medium">
                  {cartItems.length} {t.items}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playPop();
                onClose();
              }}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery Address Banner */}
          <div className={`px-5 py-2.5 border-b text-xs flex items-center justify-between ${
            hasLocationBlock 
              ? 'bg-rose-50 border-rose-200 text-rose-900' 
              : 'bg-emerald-50/60 border-emerald-100 text-emerald-950'
          }`}>
            <div className="flex items-center gap-2 overflow-hidden">
              <MapPin className={`w-3.5 h-3.5 shrink-0 ${hasLocationBlock ? 'text-rose-600' : 'text-emerald-700'}`} />
              <div className="truncate">
                <span className="font-bold">
                  {location.status === 'in_zone' ? '10 Mins to: ' : 'Address: '}
                </span>
                <span className="truncate">{lang === 'mr' ? location.nameMr : location.name}</span>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playPop();
                onOpenLocationModal();
              }}
              className="text-[11px] font-bold text-emerald-800 hover:underline shrink-0 ml-2"
            >
              {lang === 'mr' ? 'बदला' : 'Change'}
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-300">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-stone-800">
                  {t.emptyCart}
                </h4>
                <p className="text-xs text-stone-400 max-w-xs mx-auto">
                  {t.emptyCartSub}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {cartItems.map(({ product, quantity }) => {
                  const isStockZero = product.stock <= 0;

                  return (
                    <div key={product.id} className="py-3 flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className={`w-13 h-13 object-contain rounded-xl bg-stone-50 border border-stone-200 p-1 shrink-0 ${
                          isStockZero ? 'grayscale' : ''
                        }`}
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-extrabold text-stone-900 truncate">
                          {lang === 'mr' ? product.nameMr : product.name}
                        </h4>
                        <p className="text-[11px] text-stone-500">
                          {lang === 'mr' ? product.unitMr : product.unit}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-black text-stone-900">
                            ₹{product.price * quantity}
                          </span>
                          {product.competitorComparison && (
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 rounded font-bold">
                              Cheapest: {PLATFORMS[product.competitorComparison.cheapestApp].name}
                            </span>
                          )}
                          {isStockZero && (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">
                              {t.outOfStock}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center bg-stone-100 rounded-xl p-1 shrink-0">
                        <button
                          onClick={() => {
                            sounds.playPop();
                            onUpdateQuantity(product.id, -1);
                          }}
                          className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-stone-700 hover:text-stone-900 shadow-xs active:scale-95"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-black text-stone-900 select-none">
                          {quantity}
                        </span>
                        <button
                          onClick={() => {
                            sounds.playAdd();
                            onUpdateQuantity(product.id, 1);
                          }}
                          className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-stone-700 hover:text-stone-900 shadow-xs active:scale-95"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => {
                          sounds.playPop();
                          onRemoveItem(product.id);
                        }}
                        className="text-stone-400 hover:text-rose-600 p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Whole Basket Price Optimizer Across All 4 Apps */}
            {cartItems.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-linear-to-br from-emerald-50 via-teal-50 to-stone-50 border border-emerald-200 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-black text-stone-900 uppercase tracking-wide">
                      {lang === 'mr' ? 'संपूर्ण बास्केट तुलना (Basket Comparison)' : 'Basket Price Across All Apps'}
                    </span>
                  </div>
                  {platformBaskets.maxSavings > 0 && (
                    <span className="bg-emerald-700 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {lang === 'mr' ? `₹${platformBaskets.maxSavings} कमाल बचत` : `Save up to ₹${platformBaskets.maxSavings}`}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-stone-600 font-medium">
                  {lang === 'mr'
                    ? 'ज्या ॲपवर एकूण बिल सर्वात कमी पडते ते निवडा आणि थेट तिथून ऑर्डर करा:'
                    : 'Choose which platform to route this order to for the lowest landing total:'}
                </p>

                {/* Platform Selection Cards */}
                <div className="space-y-1.5 pt-1">
                  {platformBaskets.list.map((p) => {
                    const isWinner = p.appId === platformBaskets.cheapestApp;
                    const isSelected = p.appId === currentChosenApp;

                    return (
                      <div
                        key={p.appId}
                        onClick={() => {
                          sounds.playPop();
                          setSelectedBasketApp(p.appId);
                        }}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/30 shadow-xs'
                            : 'border-stone-200 bg-white/70 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-stone-900">
                                {p.meta.name}
                              </span>
                              {isWinner && (
                                <span className="bg-amber-400 text-stone-950 font-black text-[9px] px-1.5 py-0.2 rounded uppercase">
                                  {lang === 'mr' ? 'किमान दर 🥇' : 'Cheapest 🥇'}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-stone-500">
                              {p.etaMins} mins • Fee: ₹{p.deliveryFee + p.handlingFee}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-black text-stone-900 block">
                            ₹{p.grandTotal}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bill Details */}
            {cartItems.length > 0 && (
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-stone-900 uppercase tracking-wider block">
                    {t.billDetails} ({PLATFORMS[currentChosenApp].name})
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    Fulfillment Partner
                  </span>
                </div>

                <div className="flex justify-between text-xs text-stone-600">
                  <span>{t.itemTotal}</span>
                  <span className="font-semibold text-stone-900">₹{currentBasketData.basketItemTotal}</span>
                </div>

                <div className="flex justify-between text-xs text-stone-600">
                  <span>{t.deliveryFee}</span>
                  {currentBasketData.deliveryFee === 0 ? (
                    <span className="font-bold text-emerald-700">{t.free}</span>
                  ) : (
                    <span className="font-semibold text-stone-900">₹{currentBasketData.deliveryFee}</span>
                  )}
                </div>

                <div className="flex justify-between text-xs text-stone-600">
                  <span>{t.handlingFee}</span>
                  <span className="font-semibold text-stone-900">₹{currentBasketData.handlingFee}</span>
                </div>

                <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-black text-stone-900">
                  <span>{t.toPay}</span>
                  <span className="text-emerald-700 text-base">₹{currentBasketData.grandTotal}</span>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Bottom Footer with Proceed Button */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-stone-200 bg-white space-y-2.5">
              
              {/* If outside zone warning */}
              {hasLocationBlock && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">
                      {isOutsideZone ? t.locationErrorProceedDisabled : t.gpsErrorProceedDisabled}
                    </strong>
                    <button
                      onClick={() => {
                        sounds.playPop();
                        onOpenLocationModal();
                      }}
                      className="text-emerald-700 font-extrabold underline mt-0.5 block"
                    >
                      {lang === 'mr' ? 'डिलिव्हरी झोन मधील पत्ता निवडा' : 'Switch to Serviceable 2.5km Address'}
                    </button>
                  </div>
                </div>
              )}

              <button
                id="drawer-proceed-btn"
                disabled={hasLocationBlock}
                onClick={() => {
                  sounds.playPop();
                  onProceedToCheckout(currentChosenApp);
                }}
                className={`w-full py-3.5 px-4 rounded-2xl flex items-center justify-between font-extrabold text-sm transition-all shadow-md ${
                  hasLocationBlock
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                    : 'text-white active:scale-98 shadow-md'
                }`}
                style={{
                  backgroundColor: hasLocationBlock ? undefined : PLATFORMS[currentChosenApp].color
                }}
              >
                <div className="text-left">
                  <div className="text-[11px] opacity-90 font-medium flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-current" />
                    Buy on {PLATFORMS[currentChosenApp].name}
                  </div>
                  <div className="text-base font-black">
                    ₹{currentBasketData.grandTotal}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-sm bg-black/20 backdrop-blur-xs px-3 py-1.5 rounded-xl font-black">
                  <span>{lang === 'mr' ? 'थेट ऑर्डर करा' : 'Buy Now'}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              {/* Also launch platform app */}
              <button
                id="drawer-open-platform-app-btn"
                onClick={() => {
                  sounds.playPop();
                  const url = PLATFORMS[currentChosenApp].webUrl;
                  if (url && url !== '#') {
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }
                }}
                className="w-full py-2 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                <span>Open in {PLATFORMS[currentChosenApp].name} Official App / Web</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
