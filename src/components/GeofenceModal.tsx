import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  CheckCircle2, 
  Compass, 
  Radio, 
  Layers, 
  LocateFixed, 
  Info 
} from 'lucide-react';
import { Language, LocationInfo, GeofenceStatus } from '../types';
import { translations } from '../utils/translations';
import { PRESET_LOCATIONS } from '../data/catalog';
import { sounds } from '../utils/audio';

interface GeofenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentLocation: LocationInfo;
  onSelectLocation: (presetKey: keyof typeof PRESET_LOCATIONS) => void;
  onLogEvent: (title: string, details: string, severity: 'info' | 'warning' | 'error' | 'success') => void;
}

export const GeofenceModal: React.FC<GeofenceModalProps> = ({
  isOpen,
  onClose,
  lang,
  currentLocation,
  onSelectLocation,
  onLogEvent,
}) => {
  if (!isOpen) return null;

  const t = translations[lang];

  const handleSelect = (presetKey: keyof typeof PRESET_LOCATIONS) => {
    sounds.playPop();
    const loc = PRESET_LOCATIONS[presetKey];
    onSelectLocation(presetKey);

    if (loc.status === 'in_zone') {
      sounds.playSuccess();
      onLogEvent(
        'Geofence Check Passed',
        `User coordinate verified inside 2.5km polygon (${loc.distanceKm} km from ${loc.darkStoreName}). ETA: 9 mins.`,
        'success'
      );
    } else if (loc.status === 'out_of_zone') {
      sounds.playWarning();
      onLogEvent(
        'Geofence Breach Detected',
        `User coordinate is ${loc.distanceKm} km away. Maximum allowed threshold is 2.5 km. Ordering blocked.`,
        'error'
      );
    } else {
      sounds.playWarning();
      onLogEvent(
        'GPS Sensor / Spoofing Anomaly',
        'Inaccurate HDOP (Horizontal Dilution of Precision) or permission revoked. Geolocation rejected.',
        'warning'
      );
    }
  };

  // Coordinates for visual map representation
  // Center is Dark Store (x=160, y=140)
  // 2.5 km radius = 80px
  let userPinX = 160;
  let userPinY = 140;

  if (currentLocation.status === 'in_zone') {
    // 1.2km -> ~38px offset
    userPinX = 160 + 28;
    userPinY = 140 - 26;
  } else if (currentLocation.status === 'out_of_zone') {
    // 5.4km -> ~170px offset (well outside the 80px circle)
    userPinX = 160 + 105;
    userPinY = 140 + 65;
  } else {
    // GPS fault -> drifting jitter
    userPinX = 45;
    userPinY = 50;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-stone-900 font-display">
                {t.geoTestingTitle}
              </h3>
              <p className="text-xs text-stone-500">
                {t.geoDesc}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Visual Geofence Radar / Satellite representation */}
          <div className="relative w-full h-64 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center select-none">
            {/* Grid Lines */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

            <svg className="w-full h-full absolute inset-0" viewBox="0 0 320 280">
              {/* Distance Rings */}
              <circle cx="160" cy="140" r="130" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="160" cy="140" r="80" fill="rgba(16, 185, 129, 0.08)" stroke="#10b981" strokeWidth="2" strokeDasharray="6 3" />
              <circle cx="160" cy="140" r="40" fill="rgba(16, 185, 129, 0.05)" stroke="#059669" strokeWidth="1" />

              {/* 2.5km Zone Label */}
              <text x="165" y="68" fill="#34d399" fontSize="10" fontWeight="bold">
                2.5 km Geofence (10-Min Service Zone)
              </text>
              <text x="165" y="260" fill="#64748b" fontSize="9">
                5.0 km Buffer (Unserviceable Zone)
              </text>

              {/* Hub Marker */}
              <g transform="translate(160, 140)">
                <circle r="18" fill="#10b981" opacity="0.2" className="animate-ping" />
                <circle r="12" fill="#047857" stroke="#34d399" strokeWidth="2" />
                <text x="0" y="4" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">HUB</text>
              </g>

              {/* Distance Line between Hub and User Pin */}
              {currentLocation.status !== 'gps_error' && (
                <line 
                  x1="160" 
                  y1="140" 
                  x2={userPinX} 
                  y2={userPinY} 
                  stroke={currentLocation.status === 'in_zone' ? '#34d399' : '#f87171'} 
                  strokeWidth="1.5" 
                  strokeDasharray="3 3" 
                />
              )}

              {/* User Pin */}
              <g transform={`translate(${userPinX}, ${userPinY})`}>
                {currentLocation.status === 'in_zone' ? (
                  <>
                    <circle r="10" fill="#22c55e" opacity="0.3" className="animate-pulse" />
                    <circle r="6" fill="#16a34a" stroke="#ffffff" strokeWidth="1.5" />
                    <text x="0" y="-12" fill="#86efac" fontSize="9" fontWeight="bold" textAnchor="middle">
                      {currentLocation.distanceKm} km (Inside Zone)
                    </text>
                  </>
                ) : currentLocation.status === 'out_of_zone' ? (
                  <>
                    <circle r="10" fill="#ef4444" opacity="0.3" className="animate-pulse" />
                    <circle r="6" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
                    <text x="0" y="-12" fill="#fca5a5" fontSize="9" fontWeight="bold" textAnchor="middle">
                      {currentLocation.distanceKm} km (BREACH)
                    </text>
                  </>
                ) : (
                  <>
                    <circle r="12" fill="#f59e0b" opacity="0.4" stroke="#fbbf24" strokeDasharray="2 2" className="animate-spin" />
                    <circle r="5" fill="#d97706" />
                    <text x="0" y="-14" fill="#fde68a" fontSize="9" fontWeight="bold" textAnchor="middle">
                      GPS Sensor Error
                    </text>
                  </>
                )}
              </g>
            </svg>

            {/* Floating Status Pill inside Map */}
            <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-xs border border-slate-700 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 text-white">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Micro-Fulfillment Hub #07</span>
            </div>

            <div className={`absolute bottom-3 right-3 px-3 py-1.5 rounded-lg text-xs font-bold border ${
              currentLocation.status === 'in_zone'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700'
                : currentLocation.status === 'out_of_zone'
                ? 'bg-rose-950/90 text-rose-300 border-rose-700'
                : 'bg-amber-950/90 text-amber-300 border-amber-700'
            }`}>
              {currentLocation.status === 'in_zone' 
                ? '✓ Serviceable: 10 Min Guarantee Active' 
                : currentLocation.status === 'out_of_zone'
                ? '✕ Outside Zone: Delivery Disabled'
                : '⚠️ GPS Signal Inaccurate'}
            </div>
          </div>

          {/* Preset Buttons for Geofence Testing */}
          <div>
            <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block mb-2.5">
              {lang === 'mr' ? 'खालील ३ टेस्ट परिस्थितींपैकी एक निवडा:' : 'Select one of 3 QA Test Scenarios:'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* 1. Inside Delivery Zone */}
              <button
                id="geo-test-inside-btn"
                onClick={() => handleSelect('serviceable')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all relative ${
                  currentLocation.status === 'in_zone'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-extrabold text-emerald-800">
                    Scenario 1
                  </span>
                  <CheckCircle2 className={`w-4 h-4 ${currentLocation.status === 'in_zone' ? 'text-emerald-600' : 'text-stone-300'}`} />
                </div>
                <div className="text-sm font-bold text-stone-900">
                  {lang === 'mr' ? 'झोनच्या आत (१.२ किमी)' : 'Inside Zone (1.2 km)'}
                </div>
                <div className="text-xs text-stone-500 mt-1">
                  {lang === 'mr' ? '१० मिनिटांत डिलिव्हरी सुरू' : 'Normal 10-min fulfillment'}
                </div>
              </button>

              {/* 2. Outside Geofence */}
              <button
                id="geo-test-outside-btn"
                onClick={() => handleSelect('out_of_zone')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all relative ${
                  currentLocation.status === 'out_of_zone'
                    ? 'border-rose-600 bg-rose-50/70 ring-2 ring-rose-600/20'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-extrabold text-rose-800">
                    Scenario 2
                  </span>
                  <AlertTriangle className={`w-4 h-4 ${currentLocation.status === 'out_of_zone' ? 'text-rose-600' : 'text-stone-300'}`} />
                </div>
                <div className="text-sm font-bold text-stone-900">
                  {lang === 'mr' ? 'झोनच्या बाहेर (५.४ किमी)' : 'Outside Zone (5.4 km)'}
                </div>
                <div className="text-xs text-stone-500 mt-1">
                  {lang === 'mr' ? 'डिलिव्हरी ब्लॉक व एरर' : 'Unserviceable location error'}
                </div>
              </button>

              {/* 3. GPS Fault */}
              <button
                id="geo-test-gps-fault-btn"
                onClick={() => handleSelect('gps_fault')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all relative ${
                  currentLocation.status === 'gps_error'
                    ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-600/20'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-extrabold text-amber-800">
                    Scenario 3
                  </span>
                  <Radio className={`w-4 h-4 ${currentLocation.status === 'gps_error' ? 'text-amber-600' : 'text-stone-300'}`} />
                </div>
                <div className="text-sm font-bold text-stone-900">
                  {lang === 'mr' ? 'जीपीएस त्रुटी / सिग्नल लॉस' : 'GPS Signal Fault'}
                </div>
                <div className="text-xs text-stone-500 mt-1">
                  {lang === 'mr' ? 'स्थान पडताळणी अयशस्वी' : 'Weak/Spoofed GPS sensor'}
                </div>
              </button>
            </div>
          </div>

          {/* Explanation Box */}
          <div className="p-3.5 rounded-xl bg-stone-100 border border-stone-200/80 text-xs text-stone-700 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900 block font-semibold mb-0.5">
                {lang === 'mr' ? 'क्विक कॉमर्स जिओ-फेन्सिंग कसे काम करते?' : 'How Quick Commerce Geofencing Works:'}
              </strong>
              {lang === 'mr' ? (
                <span>
                  Blinkit किंवा Zepto सारख्या ॲप्समध्ये १० मिनिटांत डिलिव्हरी देण्यासाठी डार्क स्टोअरभोवती अचूक २ ते ३ किमीचा जिओ-फेन्स (Geofence) तयार केलेला असतो. युजर जर या झोनच्या बाहेर असेल, तर रायडरला वेळेवर पोहोचणे अशक्य असते; म्हणून ॲप चेकआउट रोखते आणि स्पष्ट एरर संदेश दाखवते.
                </span>
              ) : (
                <span>
                  To guarantee 10-minute order turnaround, micro-fulfillment dark stores operate strictly within a 2.5 km polygonal boundary. If an address falls outside, the system automatically marks it unserviceable and blocks checkout to prevent failed courier SLAs.
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm transition-colors"
          >
            {lang === 'mr' ? 'पूर्ण झाले (Done)' : 'Close & Apply'}
          </button>
        </div>
      </div>
    </div>
  );
};
