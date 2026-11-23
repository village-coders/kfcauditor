import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  CheckCircle, 
  ClipboardCheck, 
  Clock, 
  LogOut, 
  MapPin, 
  ShieldCheck, 
  Thermometer, 
  User, 
  Camera, 
  FileText,
  ChevronRight,
  Store
} from 'lucide-react';

export default function AuditorDashboard() {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('checklist');

  const auditChecklist = [
    { id: 1, title: 'HFA Halal Certificate displayed publicly', status: 'verified', critical: true },
    { id: 2, title: 'Chicken batch tags match approved halal supplier', status: 'verified', critical: true },
    { id: 3, title: 'Walk-in freezer temperature (-18°C to -22°C)', status: 'pending', critical: true },
    { id: 4, title: 'Breading station cross-contamination barrier', status: 'pending', critical: false },
    { id: 5, title: 'Store oil filtration & shortening expiry logs', status: 'verified', critical: false }
  ];

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col shadow-lg border-x border-gray-200">
      {/* Mobile Top Header */}
      <header className="bg-[#006a19] text-white px-4 py-3.5 sticky top-0 z-20 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src="/hfa-logo.png"
            alt="HFA Approved"
            className="h-8 w-auto bg-white rounded p-0.5"
          />
          <div>
            <h1 className="text-sm font-bold leading-tight">KFC Auditor Portal</h1>
            <p className="text-[11px] text-emerald-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
              Audit Session Active
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded transition-colors text-white"
          title="Logout"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="p-4 flex-1 space-y-4">
        {/* Auditor Profile Card */}
        <div className="bg-white rounded-lg p-3.5 border border-gray-200 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-emerald-100 text-[#006a19] flex items-center justify-center font-bold text-base shrink-0">
            {currentUser?.fullName?.[0] || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-gray-900 truncate">
                {currentUser?.fullName}
              </h2>
              <span className="text-[10px] bg-emerald-50 text-[#006a19] font-semibold px-1.5 py-0.5 rounded border border-emerald-200">
                Auditor
              </span>
            </div>
            <p className="text-xs text-gray-500 truncate">{currentUser?.role}</p>
          </div>
        </div>

        {/* Selected Store Card */}
        <div className="bg-gradient-to-br from-emerald-900 to-[#005213] text-white rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
            <Store className="w-32 h-32" />
          </div>

          <div className="flex items-center justify-between text-xs text-emerald-200 mb-1">
            <span className="flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-300" />
              Audited Store Location
            </span>
            <span className="bg-emerald-800/80 px-2 py-0.5 rounded text-[10px] font-mono">
              {currentUser?.currentStore?.code || 'KFC-LOC'}
            </span>
          </div>

          <h3 className="text-lg font-black tracking-tight text-white mt-1">
            {currentUser?.currentStore?.name || currentUser?.currentStore?.shortName || 'KFC Store'}
          </h3>

          <p className="text-xs text-emerald-100 mt-0.5">
            Region: {currentUser?.currentStore?.region || 'Assigned Zone'}
          </p>

          <div className="mt-3.5 pt-3 border-t border-white/15 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-emerald-200">
              <Clock className="w-3.5 h-3.5" />
              <span>Started: Just now</span>
            </div>
            <span className="bg-white text-[#006a19] font-bold text-[11px] px-2 py-0.5 rounded-full shadow-xs">
              In Progress
            </span>
          </div>
        </div>

        {/* Quick Action Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <button className="bg-white p-3 rounded-lg border border-gray-200 hover:border-emerald-600 flex flex-col items-center justify-center text-center group transition-colors shadow-xs">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#006a19] flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <Camera className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-gray-800">Add Photo</span>
          </button>

          <button className="bg-white p-3 rounded-lg border border-gray-200 hover:border-emerald-600 flex flex-col items-center justify-center text-center group transition-colors shadow-xs">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <Thermometer className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-gray-800">Log Temp</span>
          </button>

          <button className="bg-white p-3 rounded-lg border border-gray-200 hover:border-emerald-600 flex flex-col items-center justify-center text-center group transition-colors shadow-xs">
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-gray-800">Summary</span>
          </button>
        </div>

        {/* Store Audit Checklist Items */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-[#006a19]" />
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                Halal Compliance Checklist
              </h4>
            </div>
            <span className="text-[11px] text-gray-500 font-medium">2 of 5 Verified</span>
          </div>

          <div className="divide-y divide-gray-100">
            {auditChecklist.map((item) => (
              <div
                key={item.id}
                className="p-3.5 flex items-start gap-3 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="mt-0.5">
                  {item.status === 'verified' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 fill-emerald-100" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-medium text-gray-800 leading-snug">
                      {item.title}
                    </p>
                  </div>
                  {item.critical && (
                    <span className="inline-block mt-1 text-[10px] text-red-600 font-semibold bg-red-50 px-1.5 py-0.2 rounded">
                      Critical Point
                    </span>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Submit Audit Button */}
        <div className="pt-2">
          <button
            onClick={() => alert(`Audit saved for ${currentUser?.currentStore?.name}`)}
            className="w-full py-3 bg-[#006a19] hover:bg-[#005213] text-white font-semibold text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Complete Store Audit</span>
          </button>
        </div>
      </main>
    </div>
  );
}

