import React from 'react';
import { AlertOctagon, MapPinOff, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Language, LocationInfo } from '../types';
import { translations } from '../utils/translations';
import { sounds } from '../utils/audio';

interface GeofenceBannerProps {
  lang: Language;
  location: LocationInfo;
  onOpenLocationModal: () => void;
  onSelectInsideZone: () => void;
}

export const GeofenceBanner: React.FC<GeofenceBannerProps> = ({
  lang,
  location,
  onOpenLocationModal,
  onSelectInsideZone,
}) => {
  const t = translations[lang];

  if (location.status === 'in_zone') {
    return null;
  }

  const isOutside = location.status === 'out_of_zone';

  return (
    <div className={`w-full border-b transition-all ${
      isOutside 
        ? 'bg-gradient-to-r from-rose-50 via-rose-100/60 to-rose-50 border-rose-200 text-rose-950'
        : 'bg-gradient-to-r from-amber-50 via-amber-100/60 to-amber-50 border-amber-200 text-amber-950'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
            isOutside ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
          }`}>
            {isOutside ? (
              <AlertOctagon className="w-5 h-5" />
            ) : (
              <MapPinOff className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm sm:text-base">
                {isOutside ? t.unserviceableBannerTitle : t.gpsBannerTitle}
              </h4>
              <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                isOutside ? 'bg-rose-200 text-rose-900' : 'bg-amber-200 text-amber-900'
              }`}>
                {isOutside ? `+${location.distanceKm} km AWAY` : 'SENSOR_FAULT'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5 max-w-2xl leading-relaxed">
              {isOutside ? t.unserviceableBannerDesc : t.gpsBannerDesc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0 w-full sm:w-auto justify-end">
          <button
            onClick={() => {
              sounds.playPop();
              onSelectInsideZone();
            }}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{lang === 'mr' ? 'झोनमधील पत्ता वापरा' : 'Switch to Serviceable Address'}</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              onOpenLocationModal();
            }}
            className="flex items-center gap-1.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-xs"
          >
            <span>{lang === 'mr' ? 'जिओ-फेन्स मॅप पहा' : 'View Geofence Map'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
