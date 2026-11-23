import React, { useState } from 'react';
import { Smartphone, Monitor } from 'lucide-react';

export default function MobileContainer({ children }) {
  const [isPhoneFrame, setIsPhoneFrame] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f7f5] via-[#eef5f0] to-[#e6f0ea] flex flex-col justify-between">
      {/* Top Bar with View Mode Toggle */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between text-xs text-slate-600 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#064e2b] tracking-tight">KFC AUDITOR</span>
          <span className="text-slate-300">|</span>
          <span className="hidden sm:inline text-slate-500">Halal Food Authority (HFA) Portal</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setIsPhoneFrame(false)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              !isPhoneFrame
                ? 'bg-white text-[#064e2b] shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
          <button
            onClick={() => setIsPhoneFrame(true)}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              isPhoneFrame
                ? 'bg-white text-[#064e2b] shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Device Preview</span>
          </button>
        </div>
      </div>

      {/* Main Centered Area */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-6 md:p-8">
        {isPhoneFrame ? (
          /* Realistic Smartphone Mockup Frame for Desktop Testing */
          <div className="relative w-full max-w-[400px] bg-black rounded-[44px] p-3 shadow-2xl ring-1 ring-gray-900/10">
            {/* Dynamic Island / Speaker notch */}
            <div className="w-28 h-4 bg-black rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-gray-900" />
            </div>
            
            {/* Phone Screen Screen */}
            <div className="bg-white rounded-[32px] overflow-hidden min-h-[640px] max-h-[820px] overflow-y-auto flex flex-col justify-center py-6">
              {children}
            </div>

            {/* Home indicator line */}
            <div className="w-32 h-1 bg-gray-700 rounded-full mx-auto mt-2" />
          </div>
        ) : (
          /* Native Full Mobile View */
          <div className="w-full flex justify-center items-center">
            {children}
          </div>
        )}
      </div>

      {/* Mobile-Friendly Footer */}
      <footer className="text-center py-3 text-[11px] text-gray-400">
        Halal Food Authority (HFA) &bull; KFC Auditing &amp; Compliance System
      </footer>
    </div>
  );
}

