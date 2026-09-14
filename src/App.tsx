/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Zap, 
  MapPin, 
  ShoppingBag, 
  Layers, 
  Sparkles, 
  AlertTriangle, 
  ArrowRight, 
  FlaskConical, 
  ShieldCheck, 
  CheckCircle2, 
  PackageCheck, 
  RefreshCw, 
  PhoneCall, 
  History,
  TrendingDown,
  ArrowUpDown,
  Filter,
  Scale,
  Store,
  ExternalLink
} from 'lucide-react';
import { 
  Product, 
  CartItem, 
  Language, 
  LocationInfo, 
  CategoryId, 
  RefundRecord, 
  SystemEventLog, 
  ActiveOrder, 
  PaymentFailureType,
  QuickAppId
} from './types';
import { INITIAL_PRODUCTS, PRESET_LOCATIONS } from './data/catalog';
import { PLATFORMS } from './data/platforms';
import { translations } from './utils/translations';
import { sounds } from './utils/audio';

import { Header } from './components/Header';
import { GeofenceBanner } from './components/GeofenceBanner';
import { GeofenceModal } from './components/GeofenceModal';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { StockConflictModal } from './components/StockConflictModal';
import { PaymentModal } from './components/PaymentModal';
import { AutoRefundModal } from './components/AutoRefundModal';
import { RefundPassbook } from './components/RefundPassbook';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { TestingLabPanel } from './components/TestingLabPanel';
import { PriceComparisonModal } from './components/PriceComparisonModal';

export default function App() {
  // Primary App State
  const [lang, setLang] = useState<Language>('en'); // Default to English
  const [location, setLocation] = useState<LocationInfo>(PRESET_LOCATIONS.serviceable);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cartItems, setCartItems] = useState<CartItem[]>([
    // Pre-populate with 1 Amul Milk so user can test inventory and price aggregation immediately
    { product: INITIAL_PRODUCTS[0], quantity: 1 }
  ]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceSort, setPriceSort] = useState<'featured' | 'low_to_high' | 'high_savings'>('featured');
  const [platformFilter, setPlatformFilter] = useState<'all' | QuickAppId>('all');
  const [preferredPlatform, setPreferredPlatform] = useState<QuickAppId>('quickmart');
  const [isScanningRates, setIsScanningRates] = useState(false);
  const [isAutoFetching, setIsAutoFetching] = useState(false);
  const [lastAutoFetchedTime, setLastAutoFetchedTime] = useState<string>('Just now');
  const [autoFetchMetrics, setAutoFetchMetrics] = useState({
    blinkitLatency: 18,
    zeptoLatency: 14,
    instamartLatency: 22,
    bbnowLatency: 26,
  });

  // Modals & Panels Visibility
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTestLabOpen, setIsTestLabOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAutoRefundModalOpen, setIsAutoRefundModalOpen] = useState(false);
  const [isRefundPassbookOpen, setIsRefundPassbookOpen] = useState(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [isStockConflictModalOpen, setIsStockConflictModalOpen] = useState(false);
  const [isPriceComparisonOpen, setIsPriceComparisonOpen] = useState(false);
  const [selectedProductForComparison, setSelectedProductForComparison] = useState<Product | null>(null);

  // Flow State
  const [stockConflictedItems, setStockConflictedItems] = useState<{
    cartItem: CartItem;
    alternativeProduct?: Product;
  }[]>([]);
  const [latestRefund, setLatestRefund] = useState<RefundRecord | null>(null);
  const [refundsList, setRefundsList] = useState<RefundRecord[]>([]);
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);

  // System Event Logs
  const [systemLogs, setSystemLogs] = useState<SystemEventLog[]>([
    {
      id: 'log-init-1',
      timestamp: new Date().toLocaleTimeString(),
      type: 'order',
      severity: 'success',
      title: 'Aggregator Scraper Connected',
      details: 'Active webhooks connected to Blinkit, Zepto, Swiggy Instamart, and BB Now darkstores.',
    },
    {
      id: 'log-init-2',
      timestamp: new Date().toLocaleTimeString(),
      type: 'geo',
      severity: 'info',
      title: 'Geofence Active (2.5 km SLA)',
      details: 'Pincode 411038 / Indiranagar micro-fulfillment grid locked.',
    },
    {
      id: 'log-init-3',
      timestamp: new Date().toLocaleTimeString(),
      type: 'inventory',
      severity: 'info',
      title: 'Real-Time Inventory Synced',
      details: 'Catalog loaded with 16 SKUs across 4 platforms.',
    }
  ]);

  const t = translations[lang];

  // Helper: log system events
  const addSystemLog = (
    title: string, 
    details: string, 
    severity: 'info' | 'warning' | 'error' | 'success',
    type: 'geo' | 'inventory' | 'payment' | 'refund' | 'order' = 'order'
  ) => {
    const newLog: SystemEventLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      severity,
      title,
      details,
    };
    setSystemLogs(prev => [newLog, ...prev]);
  };

  // Rescan all 4 apps live
  const handleRescanRates = () => {
    sounds.playPop();
    setIsScanningRates(true);
    addSystemLog(
      'Scraping 4 Darkstore Networks',
      'Fetching live landing prices and stocks from Blinkit, Zepto, Swiggy Instamart, and BB Now for your pincode...',
      'info',
      'order'
    );

    setTimeout(() => {
      setIsScanningRates(false);
      sounds.playSuccess();
      setLastAutoFetchedTime(new Date().toLocaleTimeString());
      addSystemLog(
        'Live Sync Completed Across All Apps',
        'Updated latest rates and surge charges across all 4 quick-commerce competitor networks.',
        'success',
        'order'
      );
    }, 900);
  };

  // Automatic Rate Fetching on Search Query Change
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setIsAutoFetching(true);
      const timer = setTimeout(() => {
        setIsAutoFetching(false);
        setLastAutoFetchedTime(new Date().toLocaleTimeString());
        setAutoFetchMetrics({
          blinkitLatency: Math.floor(10 + Math.random() * 14),
          zeptoLatency: Math.floor(8 + Math.random() * 12),
          instamartLatency: Math.floor(12 + Math.random() * 15),
          bbnowLatency: Math.floor(14 + Math.random() * 18),
        });
        addSystemLog(
          `Auto-Fetched Rates: "${searchQuery}"`,
          `Live prices automatically fetched from Blinkit, Zepto, Swiggy Instamart, and BB Now for query "${searchQuery}".`,
          'success',
          'order'
        );
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // Periodic Background Auto-Fetch Every 25s
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAutoFetching(true);
      setTimeout(() => {
        setIsAutoFetching(false);
        setLastAutoFetchedTime(new Date().toLocaleTimeString());
        setAutoFetchMetrics({
          blinkitLatency: Math.floor(10 + Math.random() * 14),
          zeptoLatency: Math.floor(8 + Math.random() * 12),
          instamartLatency: Math.floor(12 + Math.random() * 15),
          bbnowLatency: Math.floor(14 + Math.random() * 18),
        });
      }, 400);
    }, 25000);
    return () => clearInterval(interval);
  }, []);

  // Cart Totals
  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const itemTotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cartItems]);

  const deliveryFee = itemTotal >= 99 ? 0 : 15;
  const handlingFee = itemTotal > 0 ? 4 : 0;
  const finalTotal = itemTotal > 0 ? itemTotal + deliveryFee + handlingFee : 0;

  // Cart operations
  const handleAddToCart = (product: Product, platform?: QuickAppId) => {
    if (platform) {
      setPreferredPlatform(platform);
    }
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  // Geofence Location Selection
  const handleSelectLocationPreset = (presetKey: keyof typeof PRESET_LOCATIONS) => {
    const preset = PRESET_LOCATIONS[presetKey];
    setLocation(preset);
  };

  // Checkout Pre-flight Checks (Inventory concurrency check & Geofence check)
  const handleProceedToCheckout = (chosenPlatform?: QuickAppId) => {
    if (chosenPlatform) {
      setPreferredPlatform(chosenPlatform);
    }

    // Check 1: Geofence verification
    if (location.status === 'out_of_zone') {
      sounds.playWarning();
      addSystemLog(
        'Checkout Blocked: Geofence Violation',
        `User address is ${location.distanceKm} km away. Maximum service limit is 2.5 km.`,
        'error',
        'geo'
      );
      return;
    }

    if (location.status === 'gps_error') {
      sounds.playWarning();
      addSystemLog(
        'Checkout Blocked: GPS Unresolved',
        'Cannot verify courier dispatch coordinates. User must select valid address.',
        'warning',
        'geo'
      );
      return;
    }

    // Check 2: Real-time inventory sync & out-of-stock race condition check!
    const conflicts: { cartItem: CartItem; alternativeProduct?: Product }[] = [];

    cartItems.forEach(cartItem => {
      const currentProductState = products.find(p => p.id === cartItem.product.id);
      if (!currentProductState || currentProductState.stock <= 0) {
        let alternative: Product | undefined;
        if (cartItem.product.alternativeId) {
          alternative = products.find(p => p.id === cartItem.product.alternativeId && p.stock > 0);
        }
        conflicts.push({
          cartItem,
          alternativeProduct: alternative,
        });
      }
    });

    if (conflicts.length > 0) {
      sounds.playWarning();
      setStockConflictedItems(conflicts);
      setIsStockConflictModalOpen(true);
      addSystemLog(
        'Stock Concurrency Conflict Caught',
        `${conflicts.length} item(s) depleted to 0 in warehouse while user was checking out. Triggering replacement dialog.`,
        'error',
        'inventory'
      );
      return;
    }

    // If all checks pass, proceed to payment
    setIsCartOpen(false);
    setIsPaymentModalOpen(true);
  };

  // Stock Conflict resolution: Replace with Alternative
  const handleReplaceItemWithAlternative = (oldProductId: string, newProduct: Product) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.product.id === oldProductId) {
          return { product: newProduct, quantity: 1 };
        }
        return item;
      });
    });

    setStockConflictedItems(prev => prev.filter(c => c.cartItem.product.id !== oldProductId));

    addSystemLog(
      'Item Substituted Successfully',
      `Replaced depleted item with ${newProduct.name} without cart discard.`,
      'success',
      'inventory'
    );
  };

  // Stock Conflict resolution: Remove Item
  const handleRemoveConflictedItem = (productId: string) => {
    handleRemoveItem(productId);
    setStockConflictedItems(prev => prev.filter(c => c.cartItem.product.id !== productId));
    addSystemLog(
      'Depleted Item Removed',
      `Removed out-of-stock item from cart. Total re-indexed.`,
      'info',
      'inventory'
    );
  };

  // Payment Success Flow
  const handlePaymentSuccess = (fulfillment?: QuickAppId) => {
    const platform = fulfillment || preferredPlatform || 'quickmart';
    const meta = PLATFORMS[platform];
    setIsPaymentModalOpen(false);

    // Deduct stock for items ordered
    setProducts(prev => {
      return prev.map(p => {
        const cartMatch = cartItems.find(c => c.product.id === p.id);
        if (cartMatch) {
          return { ...p, stock: Math.max(0, p.stock - cartMatch.quantity) };
        }
        return p;
      });
    });

    // Create Active Order routed to that specific platform!
    const riderNames: Record<QuickAppId, string> = {
      blinkit: 'Vikram Singh',
      zepto: 'Sameer Khan',
      instamart: 'Ramesh Patil',
      bbnow: 'Manoj Kumar',
      quickmart: 'Rahul Sharma',
    };

    const newOrder: ActiveOrder = {
      id: `${platform.slice(0, 2).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
      items: [...cartItems],
      totalAmount: finalTotal,
      deliveryAddress: location.address,
      status: 'confirmed',
      riderName: riderNames[platform] || 'Rahul Sharma',
      riderPhone: '+91 98230 45892',
      estimatedTimeSec: meta.avgDeliveryMins * 60,
      otp: `${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toLocaleTimeString(),
      fulfillmentPlatform: platform,
      platformTrackingUrl: meta.webUrl,
    };

    setActiveOrder(newOrder);
    setCartItems([]);
    setIsOrderTrackingOpen(true);

    addSystemLog(
      `Order Dispatched via ${meta.name}`,
      `Order #${newOrder.id} successfully locked with ${meta.name} darkstore. Rider ${newOrder.riderName} assigned. OTP: ${newOrder.otp}.`,
      'success',
      'order'
    );
  };

  // Payment Timeout & Auto-Refund Flow
  const handleTriggerAutoRefund = (reason: string, failureType: PaymentFailureType) => {
    sounds.playRefundChime();

    const refundId = `REF-${Date.now().toString().slice(-6)}`;
    const utr = `UTR-${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    const newRefund: RefundRecord = {
      id: refundId,
      orderAmount: finalTotal,
      refundAmount: finalTotal,
      reason,
      reasonMr: lang === 'mr' ? 'नेटवर्क डिस्कनेक्ट झाल्यामुळे ऑर्डर अपूर्ण राहिली' : reason,
      utrNumber: utr,
      method: 'UPI Auto-Reversal',
      status: 'initiated',
      createdAt: new Date().toLocaleTimeString(),
      itemsSummary: cartItems.map(i => i.product.name).join(', '),
    };

    setLatestRefund(newRefund);
    setRefundsList(prev => [newRefund, ...prev]);
    setIsAutoRefundModalOpen(true);

    addSystemLog(
      'Autonomous Refund Dispatched',
      `Idempotent reversal of ₹${finalTotal} issued via NPCI Switch. UTR: ${utr}. Reason: ${reason}.`,
      'success',
      'refund'
    );
  };

  // Advance Order Tracking status
  const handleAdvanceOrderStatus = () => {
    if (!activeOrder) return;
    const orderFlow: ActiveOrder['status'][] = ['confirmed', 'packing', 'out_for_delivery', 'arrived'];
    const currentIdx = orderFlow.indexOf(activeOrder.status);
    if (currentIdx < orderFlow.length - 1) {
      const nextStatus = orderFlow[currentIdx + 1];
      setActiveOrder({ ...activeOrder, status: nextStatus });
      sounds.playSuccess();
      addSystemLog(
        `Order Status: ${nextStatus.toUpperCase()}`,
        `Fulfillment updated to ${nextStatus}. Rider ETA refreshed.`,
        'info',
        'order'
      );
    }
  };

  // Testing Lab Trigger: Flash Out-of-Stock
  const handleTriggerFlashStockDrop = () => {
    setProducts(prev => {
      return prev.map(p => {
        if (p.id === 'prod-milk-1' || p.id === 'prod-chips-1') {
          return { ...p, stock: 0 };
        }
        return p;
      });
    });

    addSystemLog(
      '⚡ Flash Stock Depletion Simulated',
      'Amul Taaza Milk (prod-milk-1) & Lay\'s Chips (prod-chips-1) warehouse inventory set to 0. Checkout will intercept conflict.',
      'warning',
      'inventory'
    );
  };

  // Testing Lab: Reset Inventory
  const handleResetInventory = () => {
    setProducts(INITIAL_PRODUCTS.map(p => ({ ...p, stock: p.initialStock })));
    addSystemLog(
      'Inventory Restored',
      'All warehouse SKUs reset to standard stock baseline.',
      'info',
      'inventory'
    );
  };

  // Testing Lab: Trigger Simulated Payment Drop directly
  const handleTriggerSimulatedPaymentDropFromLab = (type: 'timeout' | 'background') => {
    const reason = type === 'timeout' 
      ? 'Payment 4G network timeout mid-handshake' 
      : 'App backgrounded and killed during 3DS OTP';
    handleTriggerAutoRefund(reason, type === 'timeout' ? 'network_timeout' : 'app_backgrounded');
  };

  // Direct 1-Click order from a specific product & platform
  const handleDirectOrderNow = (product: Product, platform?: QuickAppId) => {
    sounds.playSuccess();
    const chosen = platform || product.competitorComparison?.cheapestApp || 'quickmart';
    setPreferredPlatform(chosen);
    
    // Set cart item with chosen platform
    setCartItems([{ product, quantity: 1, selectedPlatform: chosen }]);
    setIsCartOpen(false);
    setIsPriceComparisonOpen(false);

    const price = product.competitorComparison ? product.competitorComparison[chosen]?.price || product.price : product.price;

    addSystemLog(
      `Direct Buy on ${PLATFORMS[chosen].name}`,
      `Routing order for ${product.name} directly to ${PLATFORMS[chosen].name} darkstore at ₹${price}. Opening instant checkout.`,
      'success',
      'order'
    );

    // Open Payment Modal immediately
    setIsPaymentModalOpen(true);
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch = searchQuery.trim() === '' || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.nameMr.includes(searchQuery);
      
      const comp = p.competitorComparison;
      const matchesPlatformFilter = platformFilter === 'all' || 
        (comp && comp.cheapestApp === platformFilter);

      return matchesCat && matchesSearch && matchesPlatformFilter;
    });

    if (priceSort === 'low_to_high') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (priceSort === 'high_savings') {
      result = [...result].sort((a, b) => 
        (b.competitorComparison?.maxSavingsAmount ?? 0) - (a.competitorComparison?.maxSavingsAmount ?? 0)
      );
    }

    return result;
  }, [products, selectedCategory, searchQuery, platformFilter, priceSort]);

  // Categories list
  const categories: { id: CategoryId | 'all'; label: string; labelMr: string; icon: string }[] = [
    { id: 'all', label: 'All Essentials', labelMr: 'सर्व उत्पादने', icon: '🛒' },
    { id: 'dairy', label: 'Dairy & Bread', labelMr: 'दूध व ब्रेड', icon: '🥛' },
    { id: 'fruits_veggies', label: 'Fruits & Veg', labelMr: 'फळे व भाज्या', icon: '🥦' },
    { id: 'snacks', label: 'Snacks & Chips', labelMr: 'स्नॅक्स व चिप्स', icon: '🍿' },
    { id: 'beverages', label: 'Cold Drinks', labelMr: 'थंड पेये', icon: '🥤' },
    { id: 'instant', label: 'Instant Food', labelMr: 'इन्स्टंट नूडल्स', icon: '🍜' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* 1. Header with Live Scraper Radar */}
      <Header
        lang={lang}
        onToggleLang={() => setLang(prev => prev === 'en' ? 'mr' : 'en')}
        location={location}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        cartCount={cartCount}
        cartTotal={finalTotal}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTestLab={() => setIsTestLabOpen(true)}
        onOpenPassbook={() => setIsRefundPassbookOpen(true)}
        activeRefundsCount={refundsList.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRescanRates={handleRescanRates}
        isScanning={isScanningRates}
      />

      {/* 2. Geofence Serviceability Warning Banner */}
      <GeofenceBanner
        lang={lang}
        location={location}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onSelectInsideZone={() => handleSelectLocationPreset('serviceable')}
      />

      {/* 3. Quick QA Edge Case Bar */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-stone-950 font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
              <FlaskConical className="w-3 h-3" />
              {lang === 'mr' ? '३ मुख्य समस्या टेस्टिंग' : '3 Key Problem Testers'}
            </span>
            <span className="font-semibold text-stone-700 hidden md:inline">
              {lang === 'mr' 
                ? 'जिओ-फेन्सिंग, इन्व्हेंटरी शून्य होणे आणि पेमेंट ऑटो-रिफंड त्वरित तपासा:' 
                : 'Click any test trigger to evaluate edge-case handling:'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Test 1: Outside Geofence */}
            <button
              id="quick-test-outside-zone"
              onClick={() => {
                sounds.playWarning();
                handleSelectLocationPreset(location.status === 'out_of_zone' ? 'serviceable' : 'out_of_zone');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 border ${
                location.status === 'out_of_zone'
                  ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                  : 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300'
              }`}
            >
              <MapPin className="w-3 h-3 text-rose-500" />
              <span>{lang === 'mr' ? '१. झोनबाहेर (5.4km)' : '1. Outside Zone (5.4km)'}</span>
            </button>

            {/* Test 2: Flash Stock Depletion */}
            <button
              id="quick-test-flash-stock"
              onClick={() => {
                sounds.playWarning();
                handleTriggerFlashStockDrop();
              }}
              className="px-2.5 py-1 rounded-lg font-bold bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 transition-all flex items-center gap-1"
            >
              <Zap className="w-3 h-3 text-amber-500" />
              <span>{lang === 'mr' ? '२. स्टॉक ० करा (Stock: 0)' : '2. Deplete Stock to 0'}</span>
            </button>

            {/* Test 3: Payment Timeout & Auto-Refund */}
            <button
              id="quick-test-auto-refund"
              onClick={() => {
                sounds.playRefundChime();
                handleTriggerSimulatedPaymentDropFromLab('timeout');
              }}
              className="px-2.5 py-1 rounded-lg font-bold bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 transition-all flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3 text-emerald-600" />
              <span>{lang === 'mr' ? '३. ऑटो-रिफंड टेस्ट' : '3. Auto-Refund Test'}</span>
            </button>

            {/* Full QA Lab Modal */}
            <button
              id="quick-open-full-lab"
              onClick={() => {
                sounds.playPop();
                setIsTestLabOpen(true);
              }}
              className="px-2.5 py-1 rounded-lg font-bold bg-stone-900 hover:bg-stone-800 text-white transition-all flex items-center gap-1"
            >
              <FlaskConical className="w-3 h-3 text-amber-400" />
              <span>{lang === 'mr' ? 'सर्व लॅब टूल्स' : 'Full QA Lab'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Active Order Banner if an order is in flight */}
        {activeOrder && (
          <div 
            className="text-white rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg transition-all"
            style={{ backgroundColor: PLATFORMS[activeOrder.fulfillmentPlatform || 'quickmart'].color }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
                <PackageCheck className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase bg-black/30 px-2 py-0.5 rounded">
                    ⚡ Fulfilling on {PLATFORMS[activeOrder.fulfillmentPlatform || 'quickmart'].name}
                  </span>
                  <span className="text-xs font-bold text-white/90">
                    Order #{activeOrder.id}
                  </span>
                </div>
                <h3 className="text-base font-extrabold mt-0.5">
                  Rider {activeOrder.riderName} ({PLATFORMS[activeOrder.fulfillmentPlatform || 'quickmart'].name} Partner) is en-route!
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                id="view-active-tracking-btn"
                onClick={() => {
                  sounds.playPop();
                  setIsOrderTrackingOpen(true);
                }}
                className="px-4 py-2 bg-white hover:bg-stone-100 text-stone-950 font-extrabold text-xs rounded-xl transition-all shadow-xs"
              >
                {lang === 'mr' ? 'लाइव्ह ट्रॅकिंग पहा' : 'Track Order'}
              </button>
            </div>
          </div>
        )}

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-btn-${cat.id}`}
                onClick={() => {
                  sounds.playPop();
                  setSelectedCategory(cat.id);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200/80'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{lang === 'mr' ? cat.labelMr : cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Price Comparison Engine & Store Filter Bar */}
        <div className="bg-white border border-stone-200 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-stone-900 font-display">
                    {lang === 'mr' ? 'सर्व ॲप्समधून सर्वात स्वस्त शोधा व थेट ऑर्डर करा' : 'Cross-App Price Hunter & Direct Order'}
                  </span>
                  <span className="bg-amber-400 text-stone-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                    4 Apps Scanned
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-medium">
                  {lang === 'mr' 
                    ? 'Blinkit, Zepto, Instamart आणि BB Now वरून दर फेच करून सर्वात स्वस्त स्टोअरवरून ऑर्डर करा' 
                    : 'Fetches rates live from Blinkit, Zepto, Swiggy Instamart & BB Now. Order from whichever is cheapest.'}
                </p>
              </div>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-stone-500 mr-1 flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3 text-stone-400" />
                {lang === 'mr' ? 'क्रमवारी:' : 'Sort:'}
              </span>

              <button
                id="sort-featured-btn"
                onClick={() => setPriceSort('featured')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  priceSort === 'featured'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {lang === 'mr' ? 'सर्व' : 'Featured'}
              </button>

              <button
                id="sort-low-price-btn"
                onClick={() => setPriceSort('low_to_high')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                  priceSort === 'low_to_high'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                <span>₹</span>
                <span>{lang === 'mr' ? 'कमीत कमी दर' : 'Lowest Price'}</span>
              </button>

              <button
                id="sort-high-savings-btn"
                onClick={() => setPriceSort('high_savings')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                  priceSort === 'high_savings'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                <TrendingDown className="w-3 h-3" />
                <span>{lang === 'mr' ? 'जास्त बचत' : 'Max Savings'}</span>
              </button>
            </div>
          </div>

          {/* Live Automatic Value Fetch Telemetry Bar */}
          <div className="bg-stone-950 text-white rounded-2xl p-3 sm:p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-inner border border-stone-800">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className={`w-3 h-3 rounded-full ${isAutoFetching ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                <div className={`w-3 h-3 rounded-full absolute inset-0 ${isAutoFetching ? 'bg-amber-400' : 'bg-emerald-500'}`} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black tracking-wide text-emerald-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-current text-amber-400" />
                    {lang === 'mr' ? 'ऑटोमॅटिक लाईव्ह फेच' : 'Automatic Live Price Fetch'}
                  </span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.2 rounded-full border ${
                    isAutoFetching 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse' 
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {isAutoFetching ? '🔄 Auto-Fetching Now...' : '⚡ Auto-Sync Active'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-300 mt-0.5">
                  {lang === 'mr' 
                    ? `सर्व ॲप्स (Blinkit, Zepto, Swiggy Instamart, BB Now) वरून दर आपोआप फेच झाले • वेळ: ${lastAutoFetchedTime}` 
                    : `Values auto-fetched across Blinkit, Zepto, Swiggy Instamart & BB Now • Last Synced: ${lastAutoFetchedTime}`}
                </p>
              </div>
            </div>

            {/* Micro API Health & Ping Indicator */}
            <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-bold">
              <span className="bg-stone-900 border border-stone-800 px-2 py-1 rounded-lg flex items-center gap-1.5 text-amber-300 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Blinkit ({autoFetchMetrics.blinkitLatency}ms)
              </span>
              <span className="bg-stone-900 border border-stone-800 px-2 py-1 rounded-lg flex items-center gap-1.5 text-purple-300 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Zepto ({autoFetchMetrics.zeptoLatency}ms)
              </span>
              <span className="bg-stone-900 border border-stone-800 px-2 py-1 rounded-lg flex items-center gap-1.5 text-orange-300 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Instamart ({autoFetchMetrics.instamartLatency}ms)
              </span>
              <span className="bg-stone-900 border border-stone-800 px-2 py-1 rounded-lg flex items-center gap-1.5 text-rose-300 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                BB Now ({autoFetchMetrics.bbnowLatency}ms)
              </span>
            </div>
          </div>

          {/* Quick-Filter by Winning Platform */}
          <div className="pt-2 border-t border-stone-100 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-stone-400 mr-1 shrink-0">
              {lang === 'mr' ? 'कुठे सर्वात स्वस्त:' : 'Cheapest on:'}
            </span>

            <button
              id="filter-platform-all"
              onClick={() => setPlatformFilter('all')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all shrink-0 ${
                platformFilter === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              All Platforms (16)
            </button>

            <button
              id="filter-platform-zepto"
              onClick={() => setPlatformFilter('zepto')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 border ${
                platformFilter === 'zepto'
                  ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                  : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border-purple-200'
              }`}
            >
              <span>💜 Zepto Lowest</span>
            </button>

            <button
              id="filter-platform-blinkit"
              onClick={() => setPlatformFilter('blinkit')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 border ${
                platformFilter === 'blinkit'
                  ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-xs'
                  : 'bg-amber-50 text-amber-950 hover:bg-amber-100 border-amber-300'
              }`}
            >
              <span>💛 Blinkit Lowest</span>
            </button>

            <button
              id="filter-platform-instamart"
              onClick={() => setPlatformFilter('instamart')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 border ${
                platformFilter === 'instamart'
                  ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                  : 'bg-orange-50 text-orange-950 hover:bg-orange-100 border-orange-200'
              }`}
            >
              <span>🧡 Instamart Lowest</span>
            </button>

            <button
              id="filter-platform-bbnow"
              onClick={() => setPlatformFilter('bbnow')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 border ${
                platformFilter === 'bbnow'
                  ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                  : 'bg-rose-50 text-rose-950 hover:bg-rose-100 border-rose-200'
              }`}
            >
              <span>❤️ BB Now Lowest</span>
            </button>
          </div>
        </div>

        {/* Section Heading with Dark Store info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 font-display">
              {selectedCategory === 'all' 
                ? (lang === 'mr' ? 'दैनिक किराणा व ताजी उत्पादने' : 'Live Products Across All Dark Stores')
                : (lang === 'mr' 
                    ? categories.find(c => c.id === selectedCategory)?.labelMr 
                    : categories.find(c => c.id === selectedCategory)?.label)}
            </h2>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              {location.status === 'in_zone' ? (
                <>Comparing prices for deliverable pincode <strong>{location.address}</strong></>
              ) : (
                <span className="text-rose-600 font-bold">
                  ⚠️ {t.unserviceable} ({location.distanceKm} km away from micro-hub)
                </span>
              )}
            </p>
          </div>

          <div className="text-xs font-bold text-stone-500">
            {filteredProducts.length} items found
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map(product => {
            const cartItem = cartItems.find(item => item.product.id === product.id);
            const qty = cartItem ? cartItem.quantity : 0;

            return (
              <ProductCard
                key={product.id}
                product={product}
                quantityInCart={qty}
                onAddToCart={(prod, plat) => handleAddToCart(prod, plat)}
                onBuyDirectly={(prod, plat) => handleDirectOrderNow(prod, plat)}
                onUpdateQuantity={handleUpdateQuantity}
                onOpenPriceComparison={(prod) => {
                  setSelectedProductForComparison(prod);
                  setIsPriceComparisonOpen(true);
                }}
                lang={lang}
              />
            );
          })}
        </div>

        {/* If no products match search */}
        {filteredProducts.length === 0 && (
          <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-2">
            <p className="text-stone-700 font-bold text-sm">
              {lang === 'mr' ? 'कोणतेही उत्पादन सापडले नाही' : 'No products found'}
            </p>
            <p className="text-xs text-stone-400">
              Try changing the platform filter or searching for "milk", "eggs", or "chips"
            </p>
          </div>
        )}

      </main>

      {/* Floating Bottom Cart Bar */}
      {cartItems.length > 0 && !isCartOpen && (
        <div className="sticky bottom-4 z-30 max-w-xl mx-auto px-4 w-full animate-in slide-in-from-bottom-3 duration-200">
          <div className={`p-3.5 rounded-2xl shadow-xl flex items-center justify-between text-white ${
            location.status === 'in_zone'
              ? 'bg-stone-900 ring-2 ring-emerald-500/50'
              : 'bg-rose-700 ring-2 ring-rose-500/40'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white shadow-xs">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold">
                  {cartCount} {t.items} • ₹{finalTotal}
                </div>
                <div className="text-[11px] text-stone-300 font-medium">
                  {location.status === 'in_zone' ? (
                    <span className="text-emerald-400 font-bold">⚡ Best rates compared</span>
                  ) : (
                    <span className="text-rose-200 font-bold">⚠️ {t.unserviceable}</span>
                  )}
                </div>
              </div>
            </div>

            <button
              id="sticky-view-cart-btn"
              onClick={() => {
                sounds.playPop();
                setIsCartOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs transition-colors shadow-xs"
            >
              <span>{t.viewCart}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      
      {/* 1. Location & Geofencing Radar Modal */}
      <GeofenceModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        lang={lang}
        currentLocation={location}
        onSelectLocation={handleSelectLocationPreset}
        onLogEvent={(title, details, severity) => addSystemLog(title, details, severity, 'geo')}
      />

      {/* 2. Cart Drawer with Cross-App Basket Comparison */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        lang={lang}
        cartItems={cartItems}
        location={location}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={(preferredApp) => handleProceedToCheckout(preferredApp)}
        onOpenLocationModal={() => {
          setIsCartOpen(false);
          setIsLocationModalOpen(true);
        }}
      />

      {/* 3. Stock Concurrency Conflict Resolution Modal */}
      <StockConflictModal
        isOpen={isStockConflictModalOpen}
        onClose={() => setIsStockConflictModalOpen(false)}
        lang={lang}
        conflictedItems={stockConflictedItems}
        onReplaceItem={handleReplaceItemWithAlternative}
        onRemoveItem={handleRemoveConflictedItem}
        onResolveAllAndProceed={() => {
          setIsStockConflictModalOpen(false);
          setIsPaymentModalOpen(true);
        }}
      />

      {/* 4. Payment Gateway Modal with Edge-Case Simulations & App Routing */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        lang={lang}
        amount={finalTotal}
        items={cartItems}
        deliveryAddress={location.address}
        fulfillmentPlatform={preferredPlatform}
        onPaymentSuccess={(platform) => handlePaymentSuccess(platform)}
        onTriggerAutoRefund={handleTriggerAutoRefund}
        onLogEvent={(title, details, severity) => addSystemLog(title, details, severity, 'payment')}
      />

      {/* 5. Auto-Refund Alert Modal */}
      <AutoRefundModal
        isOpen={isAutoRefundModalOpen}
        onClose={() => setIsAutoRefundModalOpen(false)}
        lang={lang}
        refundRecord={latestRefund}
        onOpenPassbook={() => setIsRefundPassbookOpen(true)}
      />

      {/* 6. Refund Passbook & Audit Log */}
      <RefundPassbook
        isOpen={isRefundPassbookOpen}
        onClose={() => setIsRefundPassbookOpen(false)}
        lang={lang}
        refunds={refundsList}
        onMarkCredited={(refundId) => {
          setRefundsList(prev => 
            prev.map(r => r.id === refundId ? { ...r, status: 'credited' } : r)
          );
          if (latestRefund && latestRefund.id === refundId) {
            setLatestRefund(prev => prev ? { ...prev, status: 'credited' } : null);
          }
          addSystemLog(
            'Refund Reconciled by Bank',
            `Refund #${refundId} credited back to customer bank account.`,
            'success',
            'refund'
          );
        }}
      />

      {/* 7. Live 10-Minute Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isOrderTrackingOpen}
        onClose={() => setIsOrderTrackingOpen(false)}
        lang={lang}
        order={activeOrder}
        onAdvanceOrderStatus={handleAdvanceOrderStatus}
      />

      {/* 8. Full Edge-Case QA Testing Lab Panel */}
      <TestingLabPanel
        isOpen={isTestLabOpen}
        onClose={() => setIsTestLabOpen(false)}
        lang={lang}
        location={location}
        onSetLocationScenario={handleSelectLocationPreset}
        onTriggerFlashStockDrop={handleTriggerFlashStockDrop}
        onResetInventory={handleResetInventory}
        onTriggerSimulatedPaymentDrop={handleTriggerSimulatedPaymentDropFromLab}
        systemLogs={systemLogs}
        onClearLogs={() => setSystemLogs([])}
        products={products}
        onUpdateProductStock={(productId, newStock) => {
          setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
          addSystemLog(
            'Inventory Stock Adjusted',
            `Manual stock update for ${productId} -> ${newStock} units.`,
            'info',
            'inventory'
          );
        }}
      />

      {/* 9. Quick-Commerce Live Price Comparison & Direct Order Modal */}
      <PriceComparisonModal
        isOpen={isPriceComparisonOpen}
        onClose={() => setIsPriceComparisonOpen(false)}
        product={selectedProductForComparison}
        lang={lang}
        onAddToCart={(product, platform) => {
          handleAddToCart(product, platform);
          addSystemLog(
            'Price Match Guarantee Active',
            `${product.name} added at lowest verified price (₹${product.price}) for ${PLATFORMS[platform || 'quickmart'].name}.`,
            'success',
            'order'
          );
        }}
        onOrderNow={(product, platform) => {
          handleDirectOrderNow(product, platform);
        }}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-12 py-6 px-4 text-center text-xs text-stone-500 space-y-1">
        <p className="font-bold text-stone-700">
          QuickMart • Real-Time Quick Commerce Price Hunter & Universal Order Routing Hub
        </p>
        <p>
          {lang === 'mr' 
            ? 'Blinkit, Zepto, Swiggy Instamart आणि BB Now चे दर तपासून सर्वात स्वस्त दरात १० मिनिटांत डिलिव्हरी' 
            : 'Aggregating live darkstore rates across Blinkit, Zepto, Swiggy Instamart & BigBasket BB Now for 10-minute delivery'}
        </p>
      </footer>
    </div>
  );
}
