import { QuickAppId } from '../types';

export interface PlatformMeta {
  id: QuickAppId;
  name: string;
  nameMr: string;
  tagline: string;
  taglineMr: string;
  color: string;
  bgLight: string;
  borderLight: string;
  textLight: string;
  badgeBg: string;
  iconText: string;
  baseDeliveryFee: number;
  baseHandlingFee: number;
  avgDeliveryMins: number;
  webUrl: string;
  appScheme?: string;
}

export const PLATFORMS: Record<QuickAppId, PlatformMeta> = {
  blinkit: {
    id: 'blinkit',
    name: 'Blinkit',
    nameMr: 'ब्लिंकिट (Blinkit)',
    tagline: 'Instant Delivery by Zomato',
    taglineMr: 'झोमॅटोची इन्स्टंट डिलिव्हरी',
    color: '#F8CB46',
    bgLight: 'bg-amber-50',
    borderLight: 'border-amber-300',
    textLight: 'text-amber-900',
    badgeBg: 'bg-amber-500 text-stone-950 font-black',
    iconText: '💛 Blinkit',
    baseDeliveryFee: 15,
    baseHandlingFee: 5,
    avgDeliveryMins: 13,
    webUrl: 'https://blinkit.com',
  },
  zepto: {
    id: 'zepto',
    name: 'Zepto',
    nameMr: 'झिप्टो (Zepto)',
    tagline: '10-Minute Grocery Delivery',
    taglineMr: '१० मिनिटांत किराणा डिलिव्हरी',
    color: '#7C3AED',
    bgLight: 'bg-purple-50',
    borderLight: 'border-purple-300',
    textLight: 'text-purple-900',
    badgeBg: 'bg-purple-600 text-white font-black',
    iconText: '💜 Zepto',
    baseDeliveryFee: 15,
    baseHandlingFee: 6,
    avgDeliveryMins: 11,
    webUrl: 'https://www.zeptonow.com',
  },
  instamart: {
    id: 'instamart',
    name: 'Swiggy Instamart',
    nameMr: 'स्विगी इन्स्टामार्ट',
    tagline: 'Groceries Delivered in Minutes',
    taglineMr: 'स्विगीची जलद किराणा सेवा',
    color: '#FC8019',
    bgLight: 'bg-orange-50',
    borderLight: 'border-orange-300',
    textLight: 'text-orange-900',
    badgeBg: 'bg-orange-500 text-white font-black',
    iconText: '🧡 Instamart',
    baseDeliveryFee: 16,
    baseHandlingFee: 5,
    avgDeliveryMins: 17,
    webUrl: 'https://www.swiggy.com/instamart',
  },
  bbnow: {
    id: 'bbnow',
    name: 'BigBasket BB Now',
    nameMr: 'बिगबास्केट बीबी नाऊ',
    tagline: 'Tata Digital Quick Grocery',
    taglineMr: 'टाटा डिजिटलची सुपरफास्ट किराणा डिलिव्हरी',
    color: '#E11D48',
    bgLight: 'bg-rose-50',
    borderLight: 'border-rose-300',
    textLight: 'text-rose-900',
    badgeBg: 'bg-rose-600 text-white font-black',
    iconText: '❤️ BB Now',
    baseDeliveryFee: 15,
    baseHandlingFee: 4,
    avgDeliveryMins: 16,
    webUrl: 'https://www.bigbasket.com',
  },
  quickmart: {
    id: 'quickmart',
    name: 'QuickMart Express',
    nameMr: 'क्विकमार्ट एक्सप्रेस',
    tagline: 'Lowest Price Guarantee Hub',
    taglineMr: 'किमान दर हमी डायरेक्ट डार्कस्टोअर',
    color: '#059669',
    bgLight: 'bg-emerald-50',
    borderLight: 'border-emerald-300',
    textLight: 'text-emerald-900',
    badgeBg: 'bg-emerald-600 text-white font-black',
    iconText: '⚡ QuickMart',
    baseDeliveryFee: 0,
    baseHandlingFee: 4,
    avgDeliveryMins: 10,
    webUrl: '#',
  },
};

/**
 * Direct search & product deep link URL generator for external shopping
 */
export function getProductPlatformUrl(platformId: QuickAppId, productName: string): string {
  const query = encodeURIComponent(productName.trim());
  switch (platformId) {
    case 'blinkit':
      return `https://blinkit.com/s/?q=${query}`;
    case 'zepto':
      return `https://www.zeptonow.com/search?query=${query}`;
    case 'instamart':
      return `https://www.swiggy.com/instamart/search?query=${query}`;
    case 'bbnow':
      return `https://www.bigbasket.com/ps/?q=${query}`;
    case 'quickmart':
    default:
      return '#';
  }
}
