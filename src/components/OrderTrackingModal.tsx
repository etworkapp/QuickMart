import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Phone, 
  Bike, 
  Package, 
  Store, 
  ShieldCheck, 
  MapPin, 
  FastForward, 
  Sparkles,
  ExternalLink,
  Check
} from 'lucide-react';
import { ActiveOrder, Language } from '../types';
import { PLATFORMS } from '../data/platforms';
import { translations } from '../utils/translations';
import { sounds } from '../utils/audio';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  order: ActiveOrder | null;
  onAdvanceOrderStatus: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  lang,
  order,
  onAdvanceOrderStatus,
}) => {
  if (!isOpen || !order) return null;

  const t = translations[lang];
  const fulfillmentPlatform = order.fulfillmentPlatform || 'quickmart';
  const platformMeta = PLATFORMS[fulfillmentPlatform];

  const steps: { key: ActiveOrder['status']; title: string; titleMr: string; time: string }[] = [
    { 
      key: 'confirmed', 
      title: `Order Received by ${platformMeta.name}`, 
      titleMr: `${platformMeta.name} कडे ऑर्डर प्राप्त झाली`, 
      time: `${platformMeta.avgDeliveryMins} mins` 
    },
    { 
      key: 'packing', 
      title: `Packed at ${platformMeta.name} Dark Store`, 
      titleMr: `${platformMeta.name} डार्क स्टोअरमध्ये पॅकिंग पूर्ण`, 
      time: `${Math.max(2, platformMeta.avgDeliveryMins - 3)} mins` 
    },
    { 
      key: 'out_for_delivery', 
      title: `${platformMeta.name} Rider on the Way`, 
      titleMr: `${platformMeta.name} डिलिव्हरी पार्टनर निघाला`, 
      time: '3 mins' 
    },
    { 
      key: 'arrived', 
      title: 'Arrived at Doorstep!', 
      titleMr: 'तुमच्या दारात पोहोचले!', 
      time: '0 mins' 
    },
  ];

  const currentIndex = steps.findIndex(s => s.key === order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Celebration Bar with Brand Colors */}
        <div 
          className="text-white px-6 py-5 flex items-center justify-between transition-colors"
          style={{ backgroundColor: platformMeta.color }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-inner">
              <Bike className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-black/30 text-white px-2 py-0.5 rounded">
                  Fulfillment Partner: {platformMeta.name}
                </span>
                <span className="bg-white text-stone-950 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                  ⚡ {platformMeta.avgDeliveryMins} Mins
                </span>
              </div>
              <h3 className="text-lg font-black mt-1">
                {t.orderConfirmed}
              </h3>
              <p className="text-xs text-white/90">
                Dispatched from closest darkstore hub
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-black/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* OTP & Order ID Card */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                {t.otpLabel}
              </span>
              <span className="text-2xl font-black font-mono tracking-widest text-stone-900">
                {order.otp}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-stone-500 block">
                {lang === 'mr' ? 'डिलिव्हरी पार्टनरला हा कोड द्या' : 'Share OTP with delivery rider'}
              </span>
              <span className="text-xs font-extrabold text-emerald-700">
                Order #{order.id}
              </span>
            </div>
          </div>

          {/* Stepper tracking */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-stone-900 uppercase tracking-wider">
                {lang === 'mr' ? 'लाईव्ह ट्रॅकिंग' : 'Live Dark Store Fulfillment'}
              </span>
              <button
                id="fast-forward-order-btn"
                onClick={() => {
                  sounds.playPop();
                  onAdvanceOrderStatus();
                }}
                className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-xl transition-colors"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>{t.simulateStep}</span>
              </button>
            </div>

            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-stone-200 before:z-0">
              {steps.map((step, idx) => {
                const isPassed = idx <= currentIndex;
                const isCurrent = idx === currentIndex;

                return (
                  <div key={step.key} className="flex items-start gap-3.5 relative z-10">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                      isCurrent
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 animate-pulse'
                        : isPassed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-200 text-stone-500'
                    }`}>
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isCurrent ? 'text-emerald-700 font-extrabold' : 'text-stone-800'}`}>
                          {lang === 'mr' ? step.titleMr : step.title}
                        </span>
                        <span className="text-[11px] text-stone-400 font-medium">
                          {step.time}
                        </span>
                      </div>
                      {isCurrent && (
                        <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                          {lang === 'mr' ? 'सध्या प्रक्रिया सुरू आहे' : 'Active status update'}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rider Profile card */}
          <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white"
                style={{ backgroundColor: platformMeta.color }}
              >
                {fulfillmentPlatform.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h5 className="text-xs font-bold text-stone-900">
                  {order.riderName} ({platformMeta.name} Fleet)
                </h5>
                <p className="text-[11px] text-stone-500">
                  {lang === 'mr' ? 'इलेक्ट्रिक व्हेईकल रायडर • प्रमाणित हेल्मेट' : 'EV Delivery Partner • Verified Safe'}
                </p>
              </div>
            </div>

            <a
              href={`tel:${order.riderPhone}`}
              className="p-2.5 rounded-xl bg-white border border-stone-200 text-emerald-700 hover:bg-stone-100 transition-colors"
              title="Call Rider"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>

          {/* Order Items list */}
          <div>
            <span className="text-xs font-extrabold text-stone-600 uppercase tracking-wider block mb-2">
              {t.orderSummary} ({order.items.length} items)
            </span>
            <div className="divide-y divide-stone-100 max-h-32 overflow-y-auto pr-1">
              {order.items.map(item => (
                <div key={item.product.id} className="py-1.5 flex items-center justify-between text-xs">
                  <div className="truncate mr-2">
                    <span className="font-semibold text-stone-800">
                      {item.quantity}x {lang === 'mr' ? item.product.nameMr : item.product.name}
                    </span>
                  </div>
                  <span className="font-bold text-stone-900 shrink-0">
                    ₹{item.product.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <button
            onClick={() => {
              sounds.playPop();
              window.open(platformMeta.webUrl, '_blank');
            }}
            className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open {platformMeta.name} App</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors"
          >
            {lang === 'mr' ? 'पूर्ण झाले (Done)' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
