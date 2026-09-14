import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Banknote, 
  WifiOff, 
  SmartphoneNfc, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Loader2 
} from 'lucide-react';
import { PaymentMethod, PaymentFailureType, Language, CartItem, QuickAppId } from '../types';
import { PLATFORMS } from '../data/platforms';
import { translations } from '../utils/translations';
import { sounds } from '../utils/audio';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  amount: number;
  items: CartItem[];
  deliveryAddress: string;
  fulfillmentPlatform?: QuickAppId;
  onPaymentSuccess: (platform?: QuickAppId) => void;
  onTriggerAutoRefund: (simulatedReason: string, failureType: PaymentFailureType) => void;
  onLogEvent: (title: string, details: string, severity: 'info' | 'warning' | 'error' | 'success') => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  lang,
  amount,
  items,
  deliveryAddress,
  fulfillmentPlatform = 'quickmart',
  onPaymentSuccess,
  onTriggerAutoRefund,
  onLogEvent,
}) => {
  if (!isOpen) return null;

  const t = translations[lang];
  const platformMeta = PLATFORMS[fulfillmentPlatform];

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');
  const [upiId, setUpiId] = useState('user@okaxis');
  const [selectedFailureMode, setSelectedFailureMode] = useState<PaymentFailureType>('none');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatusText, setProcessingStatusText] = useState('');

  const handlePay = () => {
    sounds.playPop();
    setIsProcessing(true);

    if (selectedFailureMode === 'none') {
      // Normal flow
      setProcessingStatusText(lang === 'mr' ? 'बँकेशी सुरक्षित संपर्क साधत आहे...' : 'Contacting issuing bank via UPI 2.0...');
      
      setTimeout(() => {
        setProcessingStatusText(lang === 'mr' ? 'पेमेंट पडताळणी पूर्ण झाली!' : 'Payment verified by NPCI gateway!');
        sounds.playSuccess();
        setTimeout(() => {
          setIsProcessing(false);
          onPaymentSuccess(fulfillmentPlatform);
          onLogEvent(
            'Order Confirmed & Paid',
            `Successfully processed ₹${amount} via ${selectedMethod.toUpperCase()} routed to ${platformMeta.name}.`,
            'success'
          );
        }, 800);
      }, 1500);

    } else if (selectedFailureMode === 'network_timeout') {
      // Simulated Internet Drop after debit!
      setProcessingStatusText(lang === 'mr' ? 'खात्यातून रक्कम वजा झाली. ऑर्डर कन्फर्मेशनची वाट पाहत आहे...' : 'Bank debited ₹' + amount + '. Awaiting order handshake...');
      
      setTimeout(() => {
        setProcessingStatusText(lang === 'mr' ? '⚠️ इंटरनेट डिस्कनेक्ट झाले! कनेक्शन टाईमआउट...' : '⚠️ Network disconnected! Gateway callback timed out after 30s...');
        sounds.playWarning();
        
        setTimeout(() => {
          setIsProcessing(false);
          onClose();
          onTriggerAutoRefund(
            lang === 'mr' 
              ? 'पेमेंट करताना इंटरनेट खंडित झाले (Network Disconnect Timeout)' 
              : 'Network disconnect during payment callback verification',
            'network_timeout'
          );
          onLogEvent(
            'Payment Timeout - Auto-Refund Triggered',
            `Bank debited ₹${amount}, but client network dropped. Orphaned debit caught. Reversal initiated.`,
            'error'
          );
        }, 1200);
      }, 2000);

    } else if (selectedFailureMode === 'app_backgrounded') {
      // Simulated App Backgrounding / Session Drop
      setProcessingStatusText(lang === 'mr' ? 'OTP विंडो चालू आहे. ॲप बॅकग्राउंडला टाकले गेले...' : 'App switched to background during bank 3DS OTP verification...');
      
      setTimeout(() => {
        setProcessingStatusText(lang === 'mr' ? '⚠️ ॲप सेशन बंद झाले! बँकेकडून पैसे कट झाल्याचे आढळले...' : '⚠️ App session expired! Orphaned debit detected at gateway reconciliation...');
        sounds.playWarning();
        
        setTimeout(() => {
          setIsProcessing(false);
          onClose();
          onTriggerAutoRefund(
            lang === 'mr' 
              ? 'OTP पडताळणीदरम्यान ॲप बॅकग्राउंडला गेले (App Backgrounded / Session Killed)' 
              : 'App backgrounded during 3DS OTP confirmation',
            'app_backgrounded'
          );
          onLogEvent(
            'App Backgrounded - Auto-Refund Triggered',
            `Session killed before order lock. Reconciliation agent auto-refunded ₹${amount} back to VPA.`,
            'error'
          );
        }, 1200);
      }, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500 text-stone-950 font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold font-display">
                {t.paymentTitle}
              </h3>
              <p className="text-xs text-stone-300">
                128-bit Bank Grade Encryption • Instant Order Lock
              </p>
            </div>
          </div>
          <button
            disabled={isProcessing}
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount bar */}
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-800 font-semibold block">
              {t.toPay}
            </span>
            <span className="text-2xl font-black text-emerald-950">
              ₹{amount}
            </span>
          </div>
          <div className="text-right flex flex-col items-end gap-1">
            <span 
              className="text-xs font-black px-2.5 py-1 rounded-full border shadow-xs"
              style={{ backgroundColor: platformMeta.bgLight, color: platformMeta.color, borderColor: platformMeta.borderLight }}
            >
              Fulfillment via {platformMeta.name}
            </span>
            <span className="text-[10px] text-stone-500 font-semibold">
              ⚡ {platformMeta.avgDeliveryMins} Mins Delivery
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* QA Edge Case Selector Box (Crucial for Prompt requirement) */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-300">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-200 px-2 py-0.5 rounded">
                🧪 QA Simulation Control
              </span>
              <span className="text-xs font-bold text-amber-800">
                {t.paymentSimTitle}
              </span>
            </div>

            <div className="space-y-2 mt-2">
              {/* Option 1: Normal */}
              <label 
                className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  selectedFailureMode === 'none'
                    ? 'bg-white border-emerald-600 ring-2 ring-emerald-600/20 text-stone-900 font-semibold'
                    : 'bg-white/60 border-stone-200 text-stone-600 hover:bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="simMode"
                  checked={selectedFailureMode === 'none'}
                  onChange={() => setSelectedFailureMode('none')}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-bold text-stone-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {t.simNormalSuccess}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    {lang === 'mr' ? 'सुरळीत पेमेंट, रायडर त्वरित असाइन होईल' : 'Normal smooth payment, rider instantly assigned'}
                  </div>
                </div>
              </label>

              {/* Option 2: Network Timeout (Bank Debited) */}
              <label 
                className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  selectedFailureMode === 'network_timeout'
                    ? 'bg-white border-rose-600 ring-2 ring-rose-600/20 text-stone-900 font-semibold'
                    : 'bg-white/60 border-stone-200 text-stone-600 hover:bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="simMode"
                  checked={selectedFailureMode === 'network_timeout'}
                  onChange={() => setSelectedFailureMode('network_timeout')}
                  className="mt-0.5 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <div className="font-bold text-rose-700 flex items-center gap-1.5">
                    <WifiOff className="w-3.5 h-3.5 text-rose-600" />
                    {t.simNetworkTimeout}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    {lang === 'mr' ? 'पैसे कट झाल्यावर इंटरनेट तुटते -> ऑटो-रिफंड सुरू होतो' : 'Simulate money debited + 4G drop -> triggers auto-refund engine'}
                  </div>
                </div>
              </label>

              {/* Option 3: App Backgrounded */}
              <label 
                className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  selectedFailureMode === 'app_backgrounded'
                    ? 'bg-white border-amber-600 ring-2 ring-amber-600/20 text-stone-900 font-semibold'
                    : 'bg-white/60 border-stone-200 text-stone-600 hover:bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="simMode"
                  checked={selectedFailureMode === 'app_backgrounded'}
                  onChange={() => setSelectedFailureMode('app_backgrounded')}
                  className="mt-0.5 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <div className="font-bold text-amber-800 flex items-center gap-1.5">
                    <SmartphoneNfc className="w-3.5 h-3.5 text-amber-600" />
                    {t.simAppBackgrounded}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    {lang === 'mr' ? 'OTP वेळी ॲप मिनिमाइज केले -> रिकन्सिलिएशनने ऑटो-रिफंड दिला' : 'Simulate WebView killed during OTP -> webhook auto-reverses money'}
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block mb-3">
              {lang === 'mr' ? 'पेमेंट पद्धत निवडा' : 'Select Payment Method'}
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              {/* UPI */}
              <button
                type="button"
                onClick={() => setSelectedMethod('upi')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                  selectedMethod === 'upi'
                    ? 'border-emerald-600 bg-emerald-50/60 font-bold text-emerald-950'
                    : 'border-stone-200 hover:border-stone-300 text-stone-700'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="text-xs font-extrabold">UPI / GPay / PhonePe</div>
                  <div className="text-[10px] text-stone-500">Fastest (10s)</div>
                </div>
              </button>

              {/* Cards */}
              <button
                type="button"
                onClick={() => setSelectedMethod('card')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                  selectedMethod === 'card'
                    ? 'border-emerald-600 bg-emerald-50/60 font-bold text-emerald-950'
                    : 'border-stone-200 hover:border-stone-300 text-stone-700'
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="text-xs font-extrabold">Credit / Debit Card</div>
                  <div className="text-[10px] text-stone-500">Visa / Mastercard</div>
                </div>
              </button>

              {/* NetBanking */}
              <button
                type="button"
                onClick={() => setSelectedMethod('netbanking')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                  selectedMethod === 'netbanking'
                    ? 'border-emerald-600 bg-emerald-50/60 font-bold text-emerald-950'
                    : 'border-stone-200 hover:border-stone-300 text-stone-700'
                }`}
              >
                <Building2 className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="text-xs font-extrabold">Net Banking</div>
                  <div className="text-[10px] text-stone-500">All major banks</div>
                </div>
              </button>

              {/* Cash On Delivery */}
              <button
                type="button"
                onClick={() => setSelectedMethod('cod')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                  selectedMethod === 'cod'
                    ? 'border-emerald-600 bg-emerald-50/60 font-bold text-emerald-950'
                    : 'border-stone-200 hover:border-stone-300 text-stone-700'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="text-xs font-extrabold">Cash on Delivery</div>
                  <div className="text-[10px] text-stone-500">Cash / UPI at door</div>
                </div>
              </button>
            </div>

            {selectedMethod === 'upi' && (
              <div className="mt-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                <label className="text-[11px] font-bold text-stone-600 block mb-1">
                  UPI ID (VPA)
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs text-stone-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            )}
          </div>

          {/* Processing State Overlay */}
          {isProcessing && (
            <div className="p-4 rounded-xl bg-stone-900 text-white flex items-center gap-3 animate-in fade-in">
              <Loader2 className="w-5 h-5 text-emerald-400 animate-spin shrink-0" />
              <div className="text-xs font-bold leading-tight">
                {processingStatusText}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>NPCI UPI 2.0 Certified</span>
          </div>

          <button
            id="confirm-payment-btn"
            disabled={isProcessing}
            onClick={handlePay}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-sm shadow-md transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{lang === 'mr' ? 'प्रक्रिया सुरू...' : 'Processing...'}</span>
              </>
            ) : (
              <>
                <span>{t.payNow} ₹{amount}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
