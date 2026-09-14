import { Product, LocationInfo, CompetitorComparison, QuickAppId, AppStoreListing } from '../types';
import { PLATFORMS } from './platforms';

function createStoreListing(
  appId: QuickAppId,
  price: number,
  mrp: number,
  deliveryMins: number,
  inStock: boolean = true,
  stockCount: number = 10,
  offerText?: string
): AppStoreListing {
  const meta = PLATFORMS[appId];
  return {
    appId,
    appName: meta.name,
    brandColor: meta.color,
    badgeColor: meta.badgeBg,
    price,
    mrp,
    deliveryMins,
    deliveryFee: meta.baseDeliveryFee,
    handlingFee: meta.baseHandlingFee,
    inStock,
    stockCount,
    directStoreUrl: meta.webUrl,
    offerText,
  };
}

function buildComparison(
  productName: string,
  basePrice: number,
  mrp: number,
  prices: {
    blinkit: { price: number; mins: number; inStock?: boolean };
    zepto: { price: number; mins: number; inStock?: boolean };
    instamart: { price: number; mins: number; inStock?: boolean };
    bbnow: { price: number; mins: number; inStock?: boolean };
  }
): CompetitorComparison {
  const qmPrice = basePrice;
  const bList = createStoreListing('blinkit', prices.blinkit.price, mrp, prices.blinkit.mins, prices.blinkit.inStock ?? true);
  const zList = createStoreListing('zepto', prices.zepto.price, mrp, prices.zepto.mins, prices.zepto.inStock ?? true);
  const iList = createStoreListing('instamart', prices.instamart.price, mrp, prices.instamart.mins, prices.instamart.inStock ?? true);
  const bbList = createStoreListing('bbnow', prices.bbnow.price, mrp, prices.bbnow.mins, prices.bbnow.inStock ?? true);
  const qmList = createStoreListing('quickmart', qmPrice, mrp, 10, true, 20);

  const allListings = [
    { app: 'blinkit' as QuickAppId, listing: bList },
    { app: 'zepto' as QuickAppId, listing: zList },
    { app: 'instamart' as QuickAppId, listing: iList },
    { app: 'bbnow' as QuickAppId, listing: bbList },
    { app: 'quickmart' as QuickAppId, listing: qmList },
  ];

  // Find lowest price
  let minPrice = Infinity;
  let cheapest: QuickAppId = 'quickmart';
  let fastest: QuickAppId = 'quickmart';
  let fastestMins = Infinity;
  let maxPrice = 0;

  for (const { app, listing } of allListings) {
    if (listing.price < minPrice) {
      minPrice = listing.price;
      cheapest = app;
    }
    if (listing.price > maxPrice) {
      maxPrice = listing.price;
    }
    if (listing.deliveryMins < fastestMins) {
      fastestMins = listing.deliveryMins;
      fastest = app;
    }
  }

  // Assign tags
  bList.tag = cheapest === 'blinkit' ? 'Cheapest 🥇' : fastest === 'blinkit' ? 'Fastest ⚡' : undefined;
  zList.tag = cheapest === 'zepto' ? 'Cheapest 🥇' : fastest === 'zepto' ? 'Fastest ⚡' : undefined;
  iList.tag = cheapest === 'instamart' ? 'Cheapest 🥇' : fastest === 'instamart' ? 'Fastest ⚡' : undefined;
  bbList.tag = cheapest === 'bbnow' ? 'Cheapest 🥇' : fastest === 'bbnow' ? 'Fastest ⚡' : undefined;
  qmList.tag = cheapest === 'quickmart' ? 'Cheapest 🥇' : '10 Min Direct ⚡';

  return {
    blinkit: bList,
    zepto: zList,
    instamart: iList,
    bbnow: bbList,
    quickmart: qmList,
    cheapestApp: cheapest,
    fastestApp: fastest,
    lowestPrice: minPrice,
    highestPrice: maxPrice,
    maxSavingsAmount: Math.max(0, maxPrice - minPrice),
    lastFetchedAt: 'Just now (Live darkstore API)',
  };
}

export const INITIAL_PRODUCTS: Product[] = [
  // 1. Dairy, Bread & Eggs
  {
    id: 'prod-milk-1',
    name: 'Amul Taaza Homogenised Toned Milk',
    nameMr: 'अमुल ताझा टोन्ड दूध',
    category: 'dairy',
    price: 27,
    mrp: 30,
    unit: '500 ml',
    unitMr: '५०० मिली',
    stock: 2, // Low stock for race testing
    initialStock: 2,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60',
    bestseller: true,
    alternativeId: 'prod-milk-2',
    competitorComparison: buildComparison('Amul Taaza Milk', 27, 30, {
      blinkit: { price: 30, mins: 13 },
      zepto: { price: 28, mins: 10 },
      instamart: { price: 30, mins: 16 },
      bbnow: { price: 29, mins: 15 },
    }),
  },
  {
    id: 'prod-milk-2',
    name: 'Nandini GoodLife UHT Milk',
    nameMr: 'नंदिनी गुडलाईफ दूध',
    category: 'dairy',
    price: 32,
    mrp: 35,
    unit: '500 ml',
    unitMr: '५०० मिली',
    stock: 15,
    initialStock: 15,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=60',
    competitorComparison: buildComparison('Nandini GoodLife Milk', 32, 35, {
      blinkit: { price: 34, mins: 14 },
      zepto: { price: 33, mins: 11 },
      instamart: { price: 35, mins: 18 },
      bbnow: { price: 32, mins: 15 },
    }),
  },
  {
    id: 'prod-bread-1',
    name: 'Modern 100% Whole Wheat Bread',
    nameMr: 'मॉडर्न होल व्हीट ब्रेड',
    category: 'dairy',
    price: 45,
    mrp: 50,
    unit: '400 g',
    unitMr: '४०० ग्रॅम',
    stock: 8,
    initialStock: 8,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60',
    bestseller: true,
    competitorComparison: buildComparison('Modern Wheat Bread', 45, 50, {
      blinkit: { price: 44, mins: 12 }, // Blinkit cheapest!
      zepto: { price: 48, mins: 10 },
      instamart: { price: 47, mins: 17 },
      bbnow: { price: 46, mins: 16 },
    }),
  },
  {
    id: 'prod-butter-1',
    name: 'Amul Salted Pasteurized Butter',
    nameMr: 'अमुल बटर (लोणी)',
    category: 'dairy',
    price: 56,
    mrp: 60,
    unit: '100 g',
    unitMr: '१०० ग्रॅम',
    stock: 12,
    initialStock: 12,
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&auto=format&fit=crop&q=60',
    competitorComparison: buildComparison('Amul Butter', 56, 60, {
      blinkit: { price: 59, mins: 14 },
      zepto: { price: 57, mins: 11 },
      instamart: { price: 60, mins: 18 },
      bbnow: { price: 55, mins: 14 }, // BB Now cheapest!
    }),
  },
  {
    id: 'prod-eggs-1',
    name: 'Farm Fresh White Table Eggs',
    nameMr: 'ताजी पांढरी अंडी (६ नग)',
    category: 'dairy',
    price: 52,
    mrp: 65,
    unit: '6 pcs',
    unitMr: '६ नग',
    stock: 20,
    initialStock: 20,
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&auto=format&fit=crop&q=60',
    competitorComparison: buildComparison('Fresh Eggs', 52, 65, {
      blinkit: { price: 58, mins: 13 },
      zepto: { price: 54, mins: 10 },
      instamart: { price: 62, mins: 16 },
      bbnow: { price: 57, mins: 15 },
    }),
  },

  // 2. Fruits & Vegetables
  {
    id: 'prod-onion-1',
    name: 'Nashik Fresh Hybrid Onions',
    nameMr: 'नाशिक कांदे',
    category: 'fruits_veggies',
    price: 34,
    mrp: 45,
    unit: '1 kg',
    unitMr: '१ किलो',
    stock: 25,
    initialStock: 25,
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop&q=60',
    bestseller: true,
    competitorComparison: buildComparison('Nashik Onions', 34, 45, {
      blinkit: { price: 39, mins: 14 },
      zepto: { price: 35, mins: 11 },
      instamart: { price: 42, mins: 19 },
      bbnow: { price: 33, mins: 16 }, // BB now cheapest!
    }),
  },
  {
    id: 'prod-tomato-1',
    name: 'Desi Red Ripe Tomatoes',
    nameMr: 'लाल पिकलेले गावरान टोमॅटो',
    category: 'fruits_veggies',
    price: 28,
    mrp: 35,
    unit: '500 g',
    unitMr: '५०० ग्रॅम',
    stock: 18,
    initialStock: 18,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=60',
    competitorComparison: buildComparison('Desi Tomatoes', 28, 35, {
      blinkit: { price: 32, mins: 13 },
      zepto: { price: 29, mins: 11 },
      instamart: { price: 34, mins: 17 },
      bbnow: { price: 31, mins: 15 },
    }),
  },
  {
    id: 'prod-banana-1',
    name: 'Robusta Fresh Bananas',
    nameMr: 'ताजी केळी (६ नग)',
    category: 'fruits_veggies',
    price: 49,
    mrp: 60,
    unit: '6 pcs',
    unitMr: '६ नग',
    stock: 14,
    initialStock: 14,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=60',
    competitorComparison: buildComparison('Robusta Bananas', 49, 60, {
      blinkit: { price: 54, mins: 15 },
      zepto: { price: 48, mins: 12 }, // Zepto cheapest!
      instamart: { price: 55, mins: 18 },
      bbnow: { price: 52, mins: 16 },
    }),
  },
  {
    id: 'prod-potato-1',
    name: 'Jyoti Baby Potatoes',
    nameMr: 'नवीन बटाटे',
    category: 'fruits_veggies',
    price: 32,
    mrp: 40,
    unit: '1 kg',
    unitMr: '१ किलो',
    stock: 30,
    initialStock: 30,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=60',
    competitorComparison: buildComparison('Baby Potatoes', 32, 40, {
      blinkit: { price: 36, mins: 13 },
      zepto: { price: 34, mins: 10 },
      instamart: { price: 38, mins: 17 },
      bbnow: { price: 35, mins: 15 },
    }),
  },

  // 3. Snacks & Munchies
  {
    id: 'prod-chips-1',
    name: "Lay's India's Magic Masala Potato Chips",
    nameMr: 'लेज मॅजिक मसाला चिप्स',
    category: 'snacks',
    price: 20,
    mrp: 20,
    unit: '48 g',
    unitMr: '४८ ग्रॅम',
    stock: 1, // Low stock for race testing
    initialStock: 1,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=60',
    bestseller: true,
    alternativeId: 'prod-chips-2',
    competitorComparison: buildComparison("Lay's Chips", 20, 20, {
      blinkit: { price: 20, mins: 12 },
      zepto: { price: 19, mins: 9 }, // Zepto ₹1 cheaper
      instamart: { price: 20, mins: 16 },
      bbnow: { price: 20, mins: 14 },
    }),
  },
  {
    id: 'prod-chips-2',
    name: 'Kurkure Masala Munch Crisps',
    nameMr: 'कुरकुरे मसाला मंच',
    category: 'snacks',
    price: 20,
    mrp: 20,
    unit: '75 g',
    unitMr: '७५ ग्रॅम',
    stock: 16,
    initialStock: 16,
    image: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=500&auto=format&fit=crop&q=60',
    competitorComparison: buildComparison('Kurkure Masala Munch', 20, 20, {
      blinkit: { price: 20, mins: 13 },
      zepto: { price: 20, mins: 10 },
      instamart: { price: 19, mins: 15 }, // Instamart ₹1 cheaper
      bbnow: { price: 20, mins: 15 },
    }),
  },
  {
    id: 'prod-biscuit-1',
    name: 'Parle-G Gold Glucose Biscuits',
    nameMr: 'पारले-जी ग्लुकोज बिस्किटे',
    category: 'snacks',
    price: 10,
    mrp: 10,
    unit: '130 g',
    unitMr: '१३० ग्रॅम',
    stock: 40,
    initialStock: 40,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&auto=format&fit=crop&q=60',
    competitorComparison: buildComparison('Parle-G Gold', 10, 10, {
      blinkit: { price: 10, mins: 12 },
      zepto: { price: 10, mins: 9 },
      instamart: { price: 10, mins: 15 },
      bbnow: { price: 9, mins: 14 }, // BB Now ₹1 cheaper
    }),
  },

  // 4. Cold Drinks & Juices
  {
    id: 'prod-drink-1',
    name: 'Coca-Cola Original Chilled Soft Drink',
    nameMr: 'कोका-कोला चिल्ड कॅन',
    category: 'beverages',
    price: 40,
    mrp: 40,
    unit: '300 ml',
    unitMr: '३०० मिली',
    stock: 18,
    initialStock: 18,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60',
    bestseller: true,
    competitorComparison: buildComparison('Coca-Cola Can', 40, 40, {
      blinkit: { price: 40, mins: 12 },
      zepto: { price: 38, mins: 10 }, // Zepto ₹38
      instamart: { price: 40, mins: 16 },
      bbnow: { price: 39, mins: 14 },
    }),
  },
  {
    id: 'prod-drink-2',
    name: 'Real Fruit Power Mixed Fruit Juice',
    nameMr: 'रियल मिक्स फ्रूट ज्यूस',
    category: 'beverages',
    price: 110,
    mrp: 130,
    unit: '1 Litre',
    unitMr: '१ लिटर',
    stock: 9,
    initialStock: 9,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&auto=format&fit=crop&q=60',
    competitorComparison: buildComparison('Real Mixed Fruit Juice', 110, 130, {
      blinkit: { price: 118, mins: 14 },
      zepto: { price: 114, mins: 11 },
      instamart: { price: 122, mins: 17 },
      bbnow: { price: 112, mins: 15 },
    }),
  },

  // 5. Instant Food
  {
    id: 'prod-instant-1',
    name: 'Maggi 2-Minute Masala Noodles',
    nameMr: 'मॅगी २-मिनिट मसाला नूडल्स (४ पॅक)',
    category: 'instant',
    price: 54,
    mrp: 56,
    unit: '4 x 70 g',
    unitMr: '४ x ७० ग्रॅम',
    stock: 22,
    initialStock: 22,
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=60',
    bestseller: true,
    competitorComparison: buildComparison('Maggi Masala Noodles', 54, 56, {
      blinkit: { price: 53, mins: 12 }, // Blinkit ₹53
      zepto: { price: 54, mins: 10 },
      instamart: { price: 55, mins: 16 },
      bbnow: { price: 54, mins: 14 },
    }),
  },
  {
    id: 'prod-instant-2',
    name: 'Knorr Classic Hot & Sour Veg Soup',
    nameMr: 'नॉर हॉट अँड सोर व्हेज सूप',
    category: 'instant',
    price: 48,
    mrp: 55,
    unit: '43 g',
    unitMr: '४३ ग्रॅम',
    stock: 12,
    initialStock: 12,
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&auto=format&fit=crop&q=60',
    competitorComparison: buildComparison('Knorr Veg Soup', 48, 55, {
      blinkit: { price: 51, mins: 14 },
      zepto: { price: 49, mins: 11 },
      instamart: { price: 52, mins: 17 },
      bbnow: { price: 47, mins: 15 }, // BB Now ₹47
    }),
  },
];

export const PRESET_LOCATIONS: Record<string, LocationInfo> = {
  serviceable: {
    name: 'Flat 402, Green Meadows',
    nameMr: 'फ्लॅट ४०२, ग्रीन मेडोज',
    address: '4th Cross, Indiranagar, Bengaluru, KA - 560038',
    addressMr: '४था क्रॉस, इंदिरानगर, बेंगळुरू - ५६००३८',
    distanceKm: 1.2,
    status: 'in_zone',
    darkStoreName: 'QuickHub Multi-Darkstore Cluster #07 (Indiranagar)',
    darkStoreNameMr: 'क्विकहब मल्टी-डार्कस्टोअर क्लस्टर #०७ (इंदिरानगर)',
    etaMinutes: 9,
    lat: 12.9784,
    lng: 77.6408,
  },
  out_of_zone: {
    name: 'Plot 12, Hill View Residency',
    nameMr: 'प्लॉट १२, हिल व्ह्यू रेसिडेन्सी',
    address: 'Outer Ring Road, Sarjapur Ext, Bengaluru - 562125',
    addressMr: 'आउटर रिंग रोड, सर्जापूर, बेंगळुरू - ५६२१२५',
    distanceKm: 5.4,
    status: 'out_of_zone',
    darkStoreName: 'Nearest Cluster is 5.4 km away (Outside quick radius)',
    darkStoreNameMr: 'जवळचे क्लस्टर हे ५.४ किमी अंतरावर आहे',
    etaMinutes: 0,
    lat: 12.8942,
    lng: 77.7214,
  },
  gps_fault: {
    name: 'Current Location (GPS Fault)',
    nameMr: 'वर्तमान स्थान (जीपीएस त्रुटी)',
    address: 'Unknown Coordinates / Low Precision GPS Sensor',
    addressMr: 'अस्पष्ट स्थान / कमजोर जीपीएस सिग्नल',
    distanceKm: 99.9,
    status: 'gps_error',
    darkStoreName: 'Location signal unverified across 4 app darkstores',
    darkStoreNameMr: 'स्थान पडताळणी अयशस्वी',
    etaMinutes: 0,
    lat: 0,
    lng: 0,
  }
};
