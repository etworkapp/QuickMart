import React from 'react';
import { 
  X, 
  FlaskConical, 
  MapPin, 
  PackageMinus, 
  RotateCcw, 
  WifiOff, 
  Smartphone, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Activity, 
  Zap 
} from 'lucide-react';
import { 
  Language, 
  LocationInfo, 
  SystemEventLog, 
  Product 
} from '../types';
import { translations } from '../utils/translations';
import { sounds } from '../utils/audio';

interface TestingLabPanelProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  location: LocationInfo;
  onSetLocationScenario: (type: 'serviceable' | 'out_of_zone' | 'gps_fault') => void;
  onTriggerFlashStockDrop: () => void;
  onResetInventory: () => void;
  onTriggerSimulatedPaymentDrop: (type: 'timeout' | 'background') => void;
  systemLogs: SystemEventLog[];
  onClearLogs: () => void;
  products: Product[];
  onUpdateProductStock: (productId: string, newStock: number) => void;
}

export const TestingLabPanel: React.FC<TestingLabPanelProps> = ({
  isOpen,
  onClose,
  lang,
  location,
  onSetLocationScenario,
  onTriggerFlashStockDrop,
  onResetInventory,
  onTriggerSimulatedPaymentDrop,
  systemLogs,
  onClearLogs,
  products,
  onUpdateProductStock,
}) => {
  if (!isOpen) return null;

  const t = translations[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 bg-stone-950 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-black">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold font-display">
                  {t.testingLab}
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded">
                  Zepto / Blinkit Edge Cases
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {lang === 'mr' 
                  ? 'जिओ-फेन्सिंग, इन्व्हेंटरी शून्य होणे आणि पेमेंट ऑटो-रिफंड टेस्टिंग'
                  : 'Interactive test triggers for Geofencing, Inventory Concurrency & Payment Auto-Refund'}
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

        {/* 2-Column QA Layout: Left Controls, Right System Event Stream */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-stone-200">
          
          {/* Left Column: Interactive Scenario Triggers (7 cols) */}
          <div className="lg:col-span-7 p-6 space-y-6 overflow-y-auto">
            
            {/* 1. Geofencing Testing Section */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                    1
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-stone-900">
                    {t.geoTestingTitle}
                  </h4>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  location.status === 'in_zone'
                    ? 'bg-emerald-100 text-emerald-800'
                    : location.status === 'out_of_zone'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  Current: {location.status === 'in_zone' ? 'Inside (1.2 km)' : location.status === 'out_of_zone' ? 'Outside (5.4 km)' : 'GPS Fault'}
                </span>
              </div>

              <p className="text-xs text-stone-600">
                {lang === 'mr'
                  ? 'डिलिव्हरी झोनच्या बाहेर (२.५ किमीपेक्षा जास्त) युजर गेल्यावर ॲप काय एरर दाखवते ते तपासा:'
                  : 'Test system behavior when customer location exceeds 2.5km dark store SLA radius:'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <button
                  id="lab-inside-zone-btn"
                  onClick={() => {
                    sounds.playPop();
                    onSetLocationScenario('serviceable');
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all text-left ${
                    location.status === 'in_zone'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white hover:bg-stone-100 border-stone-300 text-stone-700'
                  }`}
                >
                  <div className="font-extrabold">✓ Inside Zone</div>
                  <div className="text-[10px] opacity-80">1.2 km (Serviceable)</div>
                </button>

                <button
                  id="lab-outside-zone-btn"
                  onClick={() => {
                    sounds.playWarning();
                    onSetLocationScenario('out_of_zone');
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all text-left ${
                    location.status === 'out_of_zone'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white hover:bg-stone-100 border-stone-300 text-stone-700'
                  }`}
                >
                  <div className="font-extrabold">✕ Outside Zone</div>
                  <div className="text-[10px] opacity-80">5.4 km (Blocked)</div>
                </button>

                <button
                  id="lab-gps-fault-btn"
                  onClick={() => {
                    sounds.playWarning();
                    onSetLocationScenario('gps_fault');
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all text-left ${
                    location.status === 'gps_error'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-white hover:bg-stone-100 border-stone-300 text-stone-700'
                  }`}
                >
                  <div className="font-extrabold">⚠️ GPS Fault</div>
                  <div className="text-[10px] opacity-80">Lost sensor signal</div>
                </button>
              </div>
            </div>

            {/* 2. Inventory Sync & Flash Drop Section */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs">
                    2
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-stone-900">
                    {t.inventoryTestingTitle}
                  </h4>
                </div>
              </div>

              <p className="text-xs text-stone-600">
                {lang === 'mr'
                  ? 'कार्टमध्ये वस्तू आधीच ॲड केलेली असताना गोदामातील स्टॉक अचानक ० (Out of stock) करा व चेकआउट करून बघा:'
                  : 'Simulate concurrent warehouse buyers exhausting stock while item is already in customer\'s cart:'}
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  id="lab-flash-stock-drop-btn"
                  onClick={() => {
                    sounds.playWarning();
                    onTriggerFlashStockDrop();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-xs active:scale-95"
                >
                  <PackageMinus className="w-4 h-4" />
                  <span>{t.triggerStockDrop}</span>
                </button>

                <button
                  id="lab-reset-inventory-btn"
                  onClick={() => {
                    sounds.playSuccess();
                    onResetInventory();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 font-bold text-xs transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{lang === 'mr' ? 'स्टॉक पूर्ववत करा' : 'Reset Inventory'}</span>
                </button>
              </div>

              {/* Quick stock adjusters for key items */}
              <div className="pt-2 border-t border-stone-200/80 space-y-2">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  Quick Stock Adjuster:
                </span>
                {products.slice(0, 3).map(p => (
                  <div key={p.id} className="flex items-center justify-between text-xs py-1">
                    <span className="truncate max-w-[180px] font-medium text-stone-800">
                      {lang === 'mr' ? p.nameMr : p.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-black px-2 py-0.5 rounded ${
                        p.stock === 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        Stock: {p.stock}
                      </span>
                      <button
                        onClick={() => onUpdateProductStock(p.id, 0)}
                        className="px-2 py-0.5 text-[10px] font-bold bg-stone-200 hover:bg-rose-100 hover:text-rose-700 rounded text-stone-700 transition-colors"
                      >
                        Set 0
                      </button>
                      <button
                        onClick={() => onUpdateProductStock(p.id, 10)}
                        className="px-2 py-0.5 text-[10px] font-bold bg-stone-200 hover:bg-emerald-100 hover:text-emerald-700 rounded text-stone-700 transition-colors"
                      >
                        Set 10
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Payment Timeout & Auto-refund Section */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs">
                    3
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-stone-900">
                    Payment Timeout & Auto-Refund Engine
                  </h4>
                </div>
              </div>

              <p className="text-xs text-stone-600">
                {lang === 'mr'
                  ? 'पेमेंट करताना इंटरनेट गेले किंवा ॲप बॅकग्राउंडला टाकले, तर पैसे कट झाल्यावर ऑटो-रिफंड कसा होतो ते तपासा:'
                  : 'Test automated reconciliation when money is deducted by bank but order cannot confirm:'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  id="lab-test-timeout-btn"
                  onClick={() => {
                    sounds.playWarning();
                    onTriggerSimulatedPaymentDrop('timeout');
                  }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-white hover:bg-rose-50 border border-stone-200 hover:border-rose-300 text-left transition-all shadow-xs"
                >
                  <WifiOff className="w-4 h-4 text-rose-600 shrink-0" />
                  <div>
                    <div className="text-xs font-extrabold text-stone-900">
                      Simulate 4G Internet Drop
                    </div>
                    <div className="text-[11px] text-stone-500">
                      Bank debited ₹249 • 30s timeout
                    </div>
                  </div>
                </button>

                <button
                  id="lab-test-background-btn"
                  onClick={() => {
                    sounds.playWarning();
                    onTriggerSimulatedPaymentDrop('background');
                  }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-white hover:bg-amber-50 border border-stone-200 hover:border-amber-300 text-left transition-all shadow-xs"
                >
                  <Smartphone className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <div className="text-xs font-extrabold text-stone-900">
                      Simulate App Backgrounded
                    </div>
                    <div className="text-[11px] text-stone-500">
                      User switched apps during OTP
                    </div>
                  </div>
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Live Event Stream / Audit Logs (5 cols) */}
          <div className="lg:col-span-5 p-6 bg-stone-900 text-stone-100 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-extrabold tracking-wider uppercase text-stone-200">
                    System Event Stream
                  </span>
                </div>
                <button
                  onClick={() => {
                    sounds.playPop();
                    onClearLogs();
                  }}
                  className="text-[10px] font-mono text-stone-400 hover:text-stone-200"
                >
                  Clear Logs
                </button>
              </div>

              {/* Log List */}
              <div className="mt-4 space-y-2.5 max-h-[480px] overflow-y-auto pr-1 font-mono text-xs">
                {systemLogs.length === 0 ? (
                  <div className="text-center py-12 text-stone-500 text-xs">
                    No system events yet. Trigger a test scenario to monitor event bus in real-time.
                  </div>
                ) : (
                  systemLogs.map(log => (
                    <div 
                      key={log.id}
                      className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                        log.severity === 'success'
                          ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                          : log.severity === 'error'
                          ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                          : log.severity === 'warning'
                          ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                          : 'bg-stone-800/60 border-stone-700 text-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1.5">
                          {log.severity === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                          {log.severity === 'error' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                          {log.severity === 'warning' && <Zap className="w-3.5 h-3.5 text-amber-400" />}
                          {log.title}
                        </span>
                        <span className="text-[10px] text-stone-500">
                          {log.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] opacity-90 leading-relaxed font-sans">
                        {log.details}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                Webhook Listener: Active
              </span>
              <span>Hub #07 • v2.4</span>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-stone-100 border-t border-stone-200 flex justify-end">
          <button
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors"
          >
            {lang === 'mr' ? 'पूर्ण झाले (Close)' : 'Close Lab'}
          </button>
        </div>
      </div>
    </div>
  );
};
