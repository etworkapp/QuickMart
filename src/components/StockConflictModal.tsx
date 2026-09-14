import React from 'react';
import { 
  AlertTriangle, 
  RefreshCw, 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  PackageX, 
  Check 
} from 'lucide-react';
import { CartItem, Product, Language } from '../types';
import { translations } from '../utils/translations';
import { sounds } from '../utils/audio';

interface StockConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  conflictedItems: {
    cartItem: CartItem;
    alternativeProduct?: Product;
  }[];
  onReplaceItem: (oldProductId: string, newProduct: Product) => void;
  onRemoveItem: (productId: string) => void;
  onResolveAllAndProceed: () => void;
}

export const StockConflictModal: React.FC<StockConflictModalProps> = ({
  isOpen,
  onClose,
  lang,
  conflictedItems,
  onReplaceItem,
  onRemoveItem,
  onResolveAllAndProceed,
}) => {
  if (!isOpen || conflictedItems.length === 0) return null;

  const t = translations[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-rose-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning Banner Header */}
        <div className="bg-gradient-to-r from-rose-600 to-amber-600 text-white px-6 py-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-xs text-white shrink-0">
            <PackageX className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-rose-900/60 px-2 py-0.5 rounded">
              {lang === 'mr' ? 'इन्व्हेंटरी सिंक अलर्ट' : 'INVENTORY CONFLICT DETECTED'}
            </span>
            <h3 className="text-base font-extrabold leading-tight mt-0.5">
              {t.stockConflictTitle}
            </h3>
          </div>
        </div>

        {/* Modal Description */}
        <div className="px-6 py-3 bg-rose-50/70 border-b border-rose-100 text-xs text-rose-900 leading-relaxed">
          {t.stockConflictDesc}
        </div>

        {/* Conflicted Items List */}
        <div className="p-6 overflow-y-auto space-y-4">
          {conflictedItems.map(({ cartItem, alternativeProduct }) => (
            <div 
              key={cartItem.product.id}
              className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-3"
            >
              {/* Depleted Item info */}
              <div className="flex items-center gap-3">
                <img 
                  src={cartItem.product.image} 
                  alt={cartItem.product.name} 
                  className="w-14 h-14 object-contain rounded-lg bg-white border border-stone-200 p-1 shrink-0 grayscale"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
                      {t.outOfStock} (Stock: 0)
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Cart: {cartItem.quantity} qty
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-stone-900 truncate mt-0.5">
                    {lang === 'mr' ? cartItem.product.nameMr : cartItem.product.name}
                  </h4>
                  <span className="text-xs text-stone-500 font-semibold">
                    ₹{cartItem.product.price}
                  </span>
                </div>
              </div>

              {/* Recommended Replacement if available */}
              {alternativeProduct && (
                <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      {t.replaceWith}:
                    </span>
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      In Stock ({alternativeProduct.stock} left)
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <img 
                        src={alternativeProduct.image} 
                        alt={alternativeProduct.name} 
                        className="w-10 h-10 object-contain rounded-lg bg-white border border-emerald-200 p-1 shrink-0"
                      />
                      <div className="truncate">
                        <p className="text-xs font-bold text-stone-900 truncate">
                          {lang === 'mr' ? alternativeProduct.nameMr : alternativeProduct.name}
                        </p>
                        <p className="text-[11px] text-stone-600 font-semibold">
                          ₹{alternativeProduct.price} • {lang === 'mr' ? alternativeProduct.unitMr : alternativeProduct.unit}
                        </p>
                      </div>
                    </div>

                    <button
                      id={`replace-item-btn-${cartItem.product.id}`}
                      onClick={() => {
                        sounds.playSuccess();
                        onReplaceItem(cartItem.product.id, alternativeProduct);
                      }}
                      className="shrink-0 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-xs"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>{t.replaceAction}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Or Remove Option */}
              <div className="flex justify-end">
                <button
                  id={`remove-conflicted-btn-${cartItem.product.id}`}
                  onClick={() => {
                    sounds.playPop();
                    onRemoveItem(cartItem.product.id);
                  }}
                  className="flex items-center gap-1 text-xs text-rose-700 hover:text-rose-900 font-bold hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.removeAction}</span>
                </button>
              </div>
            </div>
          ))}

          {/* Quick Commerce Engineering Note */}
          <div className="p-3 bg-stone-100 rounded-xl text-[11px] text-stone-600 leading-relaxed border border-stone-200">
            <strong className="text-stone-800 block mb-0.5">
              {lang === 'mr' ? '💡 सिस्टिम बिहेव्हिअर (Concurrency Lock):' : '💡 Engineering Note:'}
            </strong>
            {lang === 'mr' ? (
              <span>
                झेप्टो आणि ब्लिंकिटमध्ये ग्राहक कार्टमध्ये वस्तू ठेवतात तेव्हा तात्पुरते आरक्षण नसते (No soft reservation). अंतिम "Proceed to Pay" बटणावर क्लिक होताच डार्क स्टोअर इन्व्हेंटरीवर ॲटॉमिक लॉक (Atomic Lock) लावला जातो. जर स्टॉक ० झाला असेल, तर ग्राहकाची दिशाभूल होऊ नये म्हणून वरीलप्रमाणे तात्काळ पर्याय सुचवला जातो.
              </span>
            ) : (
              <span>
                Quick commerce apps don't lock stock when added to cart to prevent artificial hoarding. Inventory is atomically verified at checkout. When race condition occurs, seamless substitute suggestions prevent drop-offs.
              </span>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <button
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 text-xs font-bold transition-colors"
          >
            {lang === 'mr' ? 'कार्टमध्ये परत जा' : 'Back to Cart'}
          </button>

          {conflictedItems.length === 0 && (
            <button
              onClick={() => {
                sounds.playSuccess();
                onResolveAllAndProceed();
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <span>{lang === 'mr' ? 'पेमेंटसाठी पुढे जा' : 'Proceed to Checkout'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
