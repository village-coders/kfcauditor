import React, { useState } from 'react';
import { MapPin, Search, LayoutDashboard, Navigation } from 'lucide-react';
import { useAuditPortal } from '../../context/AuditPortalContext';
import { useAuth } from '../../context/AuthContext';

export function MapScreen() {
  const { setActiveScreen, selectedAudit } = useAuditPortal();
  const { currentUser } = useAuth();

  const defaultQuery =
    selectedAudit?.address ||
    currentUser?.currentStore?.address ||
    currentUser?.currentStore?.name ||
    '';

  const [locationInput, setLocationInput] = useState(defaultQuery);
  const [mapQuery, setMapQuery] = useState(defaultQuery);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!locationInput.trim()) return;
    setMapQuery(locationInput.trim());
  };

  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    mapQuery
  )}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden">
        {/* Top Emerald Header */}
        <div className="bg-gradient-to-r from-[#064e2b] to-[#0b663a] text-white px-5 py-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-5 h-5 text-emerald-200" />
            <h2 className="text-base sm:text-lg font-bold tracking-tight">
              Store Location Finder
            </h2>
          </div>
          <span className="text-xs text-emerald-100 bg-white/15 px-3 py-1 rounded-full flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5" />
            {mapQuery}
          </span>
        </div>

        {/* Location Search Form */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-200">
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3"
          >
            <div className="flex-1">
              <label
                htmlFor="txt_location"
                className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1"
              >
                Enter Your Location Details
              </label>
              <input
                id="txt_location"
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Enter store address, city, or postcode..."
                className="w-full h-10 px-3.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#064e2b]"
              />
            </div>
            <button
              id="Search"
              type="submit"
              className="h-10 px-5 bg-[#064e2b] hover:bg-[#053e22] text-white text-sm font-semibold rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </form>
        </div>

        {/* Map Canvas Container */}
        <div className="p-4">
          <div
            id="map_populate"
            className="w-full h-[380px] sm:h-[500px] rounded-2xl border border-slate-200 overflow-hidden bg-slate-100"
          >
            <iframe
              title="KFC Store Location Map"
              src={embedUrl}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveScreen('DASHBOARD')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4" />
            Back To Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
