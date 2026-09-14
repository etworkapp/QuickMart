import React from 'react';
import { 
  Zap, 
  MapPin, 
  Search, 
  ShoppingBag, 
  FlaskConical, 
  Languages, 
  ShieldAlert, 
  History, 
  ChevronDown, 
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Store,
  TrendingDown
} from 'lucide-react';
import { Language, LocationInfo } from '../types';
import { translations } from '../utils/translations';
import { sounds } from '../utils/audio';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  location: LocationInfo;
  onOpenLocationModal: () => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenTestLab: () => void;
  onOpenPassbook: () => void;
  activeRefundsCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRescanRates?: () => void;
  isScanning?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  location,
  onOpenLocationModal,
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenTestLab,
  onOpenPassbook,
  activeRefundsCount,
  searchQuery,
  onSearchChange,
  onRescanRates,
  isScanning = false,
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      {/* Top micro announcement / dark store guarantee bar */}
      <div className="bg-emerald-700 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center bg-emerald-500 text-emerald-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
              ⚡ 10 MINS
            </span>
            <span className="font-medium text-emerald-100 hidden sm:inline">
              {location.status === 'in_zone' ? (
                <>Delivering hot & fresh from <strong className="text-white">{lang === 'mr' ? location.darkStoreNameMr : location.darkStoreName}</strong></>
              ) : (
                <span className="text-amber-200 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {t.unserviceable}
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* QA Testing Lab button */}
            <button
              id="header-test-lab-btn"
              onClick={() => {
                sounds.playPop();
                onOpenTestLab();
              }}
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold px-2.5 py-0.5 rounded text-[11px] transition-all shadow-xs"
              title="Open QA Edge Case Simulator"
            >
              <FlaskConical className="w-3 h-3 text-stone-900" />
              <span>{t.testingLabShort}</span>
            </button>

            {/* Language toggle */}
            <button
              id="header-lang-btn"
              onClick={() => {
                sounds.playPop();
                onToggleLang();
              }}
              className="flex items-center gap-1 text-emerald-100 hover:text-white font-medium text-xs px-2 py-0.5 rounded bg-emerald-800/60 border border-emerald-600/40"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'मराठी' : 'English'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-600/20">
                <Zap className="w-6 h-6 fill-amber-300 text-amber-300" />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 font-display flex items-center gap-1">
                  {t.appName}
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                    Aggregator
                  </span>
                </span>
                <span className="text-[11px] font-bold text-stone-500 block -mt-0.5">
                  Find Cheapest • Order Direct • 10-Min Delivery
                </span>
              </div>
            </div>
          </div>

          {/* Location selector button */}
          <button
            id="location-picker-btn"
            onClick={() => {
              sounds.playPop();
              onOpenLocationModal();
            }}
            className={`hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all text-left max-w-xs ${
              location.status === 'in_zone'
                ? 'bg-stone-50 hover:bg-stone-100 border-stone-200'
                : location.status === 'out_of_zone'
                ? 'bg-rose-50 hover:bg-rose-100/80 border-rose-300'
                : 'bg-amber-50 hover:bg-amber-100/80 border-amber-300'
            }`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 ${
              location.status === 'in_zone'
                ? 'bg-emerald-100 text-emerald-700'
                : location.status === 'out_of_zone'
                ? 'bg-rose-100 text-rose-700'
                : 'bg-amber-100 text-amber-700'
            }`}>
              <MapPin className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 truncate">
                <span>{lang === 'mr' ? location.nameMr : location.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              </div>
              <p className="text-[11px] text-stone-500 truncate">
                {location.status === 'in_zone' ? (
                  <span className="text-emerald-700 font-semibold">{t.serviceable} ({location.distanceKm} km)</span>
                ) : location.status === 'out_of_zone' ? (
                  <span className="text-rose-700 font-semibold">{t.unserviceable} ({location.distanceKm} km)</span>
                ) : (
                  <span className="text-amber-700 font-semibold">{t.gpsError}</span>
                )}
              </p>
            </div>
          </button>

          {/* Search bar */}
          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="catalog-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={lang === 'mr' ? 'दूध, अंडी, भाज्या किंवा ब्रँड शोधा...' : 'Search milk, chips, coke or brand across apps...'}
              className="w-full bg-stone-100 hover:bg-stone-100/90 focus:bg-white text-stone-900 pl-10 pr-4 py-2 rounded-xl text-sm border border-stone-200/80 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-stone-400 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 px-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right Action Buttons: Passbook/Refunds & Cart */}
          <div className="flex items-center gap-2">
            {/* Refunds Passbook Button */}
            <button
              id="refunds-passbook-btn"
              onClick={() => {
                sounds.playPop();
                onOpenPassbook();
              }}
              className="relative flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/70 rounded-xl text-xs font-semibold transition-all border border-stone-200/80"
              title="Refunds & Auto-Reversals"
            >
              <History className="w-4 h-4 text-stone-600" />
              <span className="hidden sm:inline">Passbook</span>
              {activeRefundsCount > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {activeRefundsCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              id="header-cart-btn"
              onClick={() => {
                sounds.playPop();
                onOpenCart();
              }}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white px-3.5 py-2 rounded-xl text-sm font-bold transition-all shadow-xs"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-400 text-stone-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-emerald-700">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="text-left hidden sm:block leading-tight">
                {cartCount > 0 ? (
                  <>
                    <div className="text-[11px] text-emerald-200 font-semibold">{cartCount} {t.items}</div>
                    <div className="text-xs font-extrabold">₹{cartTotal}</div>
                  </>
                ) : (
                  <span>{t.cartTitle}</span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Live Aggregator Status Bar */}
        <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            <span className="bg-emerald-100 text-emerald-900 font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shrink-0">
              <Sparkles className="w-2.5 h-2.5 text-emerald-700" />
              Live Sync Active
            </span>
            <div className="flex items-center gap-2 text-[11px] text-stone-600 shrink-0">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <strong>Blinkit</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <strong>Zepto</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <strong>Swiggy Instamart</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <strong>BB Now</strong>
              </span>
            </div>
          </div>

          {onRescanRates && (
            <button
              id="header-rescan-rates-btn"
              onClick={() => {
                sounds.playPop();
                onRescanRates();
              }}
              disabled={isScanning}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin text-emerald-600' : ''}`} />
              <span>{isScanning ? (lang === 'mr' ? 'दर फेच होत आहेत...' : 'Fetching Live Rates...') : (lang === 'mr' ? 'सर्व ॲप्स रिफ्रेश करा' : 'Rescan All Apps')}</span>
            </button>
          )}
        </div>

        {/* Mobile location bar */}
        <div className="mt-2 pt-2 border-t border-stone-100 md:hidden flex items-center justify-between">
          <button
            onClick={() => {
              sounds.playPop();
              onOpenLocationModal();
            }}
            className="flex items-center gap-2 text-left text-xs font-medium text-stone-800"
          >
            <MapPin className={`w-3.5 h-3.5 ${location.status === 'in_zone' ? 'text-emerald-600' : 'text-rose-600'}`} />
            <span className="truncate max-w-[200px]">{lang === 'mr' ? location.nameMr : location.name}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              location.status === 'in_zone' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {location.status === 'in_zone' ? '10 mins' : t.unserviceable}
            </span>
          </button>

          <button 
            onClick={onOpenLocationModal}
            className="text-[11px] text-emerald-700 font-bold hover:underline"
          >
            {lang === 'mr' ? 'बदला' : 'Change'}
          </button>
        </div>
      </div>
    </header>
  );
};
