import React from 'react';
import { 
  X, 
  History, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ShieldCheck, 
  Receipt, 
  ExternalLink 
} from 'lucide-react';
import { RefundRecord, Language } from '../types';
import { translations } from '../utils/translations';
import { sounds } from '../utils/audio';

interface RefundPassbookProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  refunds: RefundRecord[];
  onMarkCredited: (refundId: string) => void;
}

export const RefundPassbook: React.FC<RefundPassbookProps> = ({
  isOpen,
  onClose,
  lang,
  refunds,
  onMarkCredited,
}) => {
  if (!isOpen) return null;

  const t = translations[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500 text-stone-950 font-bold">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold font-display">
                {t.passbookTitle}
              </h3>
              <p className="text-xs text-stone-400">
                Automated Bank Reconciliation & Reversals Ledger
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {refunds.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <Receipt className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-stone-600 max-w-xs mx-auto">
                {t.noRefundsYet}
              </p>
            </div>
          ) : (
            refunds.map((ref) => (
              <div
                key={ref.id}
                className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-stone-50 transition-colors space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-emerald-700">
                        +₹{ref.refundAmount}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        ref.status === 'credited'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                      }`}>
                        {ref.status === 'credited' ? t.statusCredited : t.statusInitiated}
                      </span>
                    </div>

                    <p className="text-xs text-stone-800 font-semibold mt-1">
                      {lang === 'mr' ? ref.reasonMr : ref.reason}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-stone-400 block font-mono">
                      {ref.createdAt}
                    </span>
                    <span className="text-[11px] text-stone-500 font-semibold">
                      Via {ref.method}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <div className="font-mono text-stone-500 text-[11px]">
                    <span className="text-stone-400">UTR: </span>
                    <strong className="text-stone-800">{ref.utrNumber}</strong>
                  </div>

                  {ref.status !== 'credited' ? (
                    <button
                      id={`mark-credited-btn-${ref.id}`}
                      onClick={() => {
                        sounds.playSuccess();
                        onMarkCredited(ref.id);
                      }}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{t.instantCreditedBtn}</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{lang === 'mr' ? 'खात्यात जमा' : 'Settled to Bank'}</span>
                    </span>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Educational Note */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold mb-0.5">
                {lang === 'mr' ? 'ऑटो-रिफंड प्रणाली कशी सुरक्षित ठेवते?' : 'Autonomous Payment Reconciliation:'}
              </strong>
              {lang === 'mr' ? (
                <span>
                  जेव्हा पेमेंट गेटवेकडून ५०० (Internal Server Error) किंवा टाईमआउट येतो, तेव्हा सिस्टिम बँकेच्या रिवर्सल API (Reversal Webhook) ला आपोआप कॉल करते. ग्राहकाला कस्टमर केअरशी संपर्क साधण्याची किंवा टिकट रेज करण्याची अजिबात गरज नसते.
                </span>
              ) : (
                <span>
                  Quick commerce transaction volume demands instant auto-reversals. If an order placement fails after bank capture, an idempotent refund payload is dispatched automatically via webhook, zeroing customer friction.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors"
          >
            {lang === 'mr' ? 'बंद करा (Close)' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
