import React from 'react';
import { 
  CheckCircle, 
  ShieldCheck, 
  RefreshCw, 
  ArrowRight, 
  Receipt, 
  Clock, 
  Sparkles, 
  X, 
  AlertCircle 
} from 'lucide-react';
import { RefundRecord, Language } from '../types';
import { translations } from '../utils/translations';
import { sounds } from '../utils/audio';

interface AutoRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  refundRecord: RefundRecord | null;
  onOpenPassbook: () => void;
}

export const AutoRefundModal: React.FC<AutoRefundModalProps> = ({
  isOpen,
  onClose,
  lang,
  refundRecord,
  onOpenPassbook,
}) => {
  if (!isOpen || !refundRecord) return null;

  const t = translations[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-emerald-300 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with reassuring green shield */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 text-center relative overflow-hidden">
          <button
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="absolute top-3 right-3 p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center mb-3 shadow-inner ring-4 ring-white/10">
            <ShieldCheck className="w-9 h-9 text-white" />
          </div>

          <span className="inline-block bg-emerald-900/60 text-emerald-200 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-1">
            {lang === 'mr' ? '१००% सुरक्षितता हमी' : '100% REVERSAL GUARANTEE'}
          </span>

          <h3 className="text-xl font-black font-display">
            {t.refundTriggeredTitle}
          </h3>
          <p className="text-xs text-emerald-100 mt-1 max-w-xs mx-auto leading-relaxed">
            {t.refundTriggeredDesc}
          </p>
        </div>

        {/* Refund Details Ticket */}
        <div className="p-6 space-y-4">
          
          {/* Amount Box */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-center">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-0.5">
              {lang === 'mr' ? 'परत केलेली रक्कम (Refund Amount)' : 'Amount Reversed to Source'}
            </span>
            <div className="text-3xl font-black text-emerald-600">
              ₹{refundRecord.refundAmount}
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 border border-emerald-200">
              <CheckCircle className="w-3 h-3" />
              {refundRecord.status === 'credited' ? t.statusCredited : t.statusInitiated}
            </span>
          </div>

          {/* Key Reference Data */}
          <div className="space-y-2.5 text-xs text-stone-700">
            <div className="flex justify-between py-1.5 border-b border-stone-100">
              <span className="text-stone-500">{t.refundUtr}:</span>
              <span className="font-mono font-bold text-stone-900">{refundRecord.utrNumber}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-stone-100">
              <span className="text-stone-500">{lang === 'mr' ? 'कारण' : 'Reason'}:</span>
              <span className="font-semibold text-rose-700 text-right max-w-[200px] truncate">
                {lang === 'mr' ? refundRecord.reasonMr : refundRecord.reason}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-stone-100">
              <span className="text-stone-500">{lang === 'mr' ? 'पेमेंट पद्धत' : 'Payment Source'}:</span>
              <span className="font-semibold text-stone-900">{refundRecord.method}</span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-stone-500">{lang === 'mr' ? 'अपेक्षित वेळ' : 'Estimated Credit'}:</span>
              <span className="font-bold text-emerald-700">{t.refundEta}</span>
            </div>
          </div>

          {/* Reassurance Note */}
          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs text-emerald-900 leading-relaxed flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              {lang === 'mr' ? (
                <span>
                  तुमची ऑर्डर नोंदवली गेली नाही कारण नेटवर्क अचानक तुटले. बँकेने कट केलेले पैसे सिस्टिमने तात्काळ डिटेक्ट करून थेट बँक खात्यावर रिफंड केले आहेत.
                </span>
              ) : (
                <span>
                  Our autonomous reconciliation engine detected the disconnected payment webhook and triggered instant refund via NPCI switch. No manual customer support ticket required.
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-bold transition-colors"
          >
            {lang === 'mr' ? 'ठीक आहे (Dismiss)' : 'Close'}
          </button>

          <button
            id="view-refund-passbook-modal-btn"
            onClick={() => {
              sounds.playPop();
              onClose();
              onOpenPassbook();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-xs transition-colors"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>{t.viewPassbook}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
