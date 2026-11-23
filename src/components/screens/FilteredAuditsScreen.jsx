import React, { useState } from 'react';
import {
  Search,
  LayoutDashboard,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Eye,
  Loader2
} from 'lucide-react';
import { useAuditPortal } from '../../context/AuditPortalContext';

const FILTER_CONFIG = {
  PASSED: {
    title: 'Passed Audits',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: CheckCircle2
  },
  PENDING: {
    title: 'Pending Audits',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: Clock
  },
  OTHER_FAIL: {
    title: 'Other Failed',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: AlertTriangle
  },
  L3_FAIL: {
    title: 'L3 List',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
    icon: ShieldAlert
  }
};

export function FilteredAuditsScreen({ filterType = 'PASSED' }) {
  const { audits, isLoadingAudits, setSelectedAuditId, setActiveScreen } = useAuditPortal();
  const [dateSearch, setDateSearch] = useState('');

  const config = FILTER_CONFIG[filterType] || FILTER_CONFIG.PASSED;
  const IconComp = config.icon;

  const matchingAudits = audits.filter((a) => {
    const matchesCategory = a.statusCategory === filterType;
    const matchesDate =
      !dateSearch.trim() ||
      a.date.toLowerCase().includes(dateSearch.trim().toLowerCase());
    return matchesCategory && matchesDate;
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden">
        {/* Top Emerald Header */}
        <div className="bg-gradient-to-r from-[#064e2b] to-[#0b663a] text-white px-5 py-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <IconComp className="w-5 h-5 text-emerald-200" />
            <h2 className="text-base sm:text-lg font-bold tracking-tight">{config.title}</h2>
          </div>
          <span className="text-xs bg-white/15 px-3 py-1 rounded-full font-semibold">
            {matchingAudits.length} Audit(s)
          </span>
        </div>

        {/* Date Search Bar */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center gap-2.5">
          <label className="text-xs sm:text-sm font-semibold text-slate-700">Date:</label>
          <input
            type="text"
            value={dateSearch}
            onChange={(e) => setDateSearch(e.target.value)}
            placeholder="e.g. 10-Nov-2026"
            className="h-9 px-3 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#064e2b]"
          />
          <button
            type="button"
            className="h-9 px-4 bg-[#064e2b] hover:bg-[#053e22] text-white text-xs sm:text-sm font-semibold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            Search
          </button>
        </div>

        {/* Mobile Cards (< md) */}
        <div className="p-3.5 space-y-3 md:hidden">
          {isLoadingAudits && matchingAudits.length === 0 ? (
            <div className="space-y-3">
              {[1, 2].map((n) => (
                <div key={n} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2.5 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="h-3 bg-slate-200 rounded w-3/4" />
                  <div className="h-9 bg-slate-200 rounded-xl w-full" />
                </div>
              ))}
            </div>
          ) : matchingAudits.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              No records currently in <strong>{config.title}</strong>.
            </div>
          ) : (
            matchingAudits.map((a) => (
              <div
                key={a.appId}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm text-[#064e2b]">
                    {a.storeName} ({a.storeId})
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${config.badgeClass}`}>
                    {a.date}
                  </span>
                </div>
                <div className="text-slate-600">{a.address}</div>
                <div className="grid grid-cols-2 gap-2 text-slate-700 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Representative</span>
                    <strong>{a.storeRep}</strong> ({a.designation})
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Auditor / Time</span>
                    <strong>{a.auditor}</strong> &bull; {a.timeIn}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAuditId(a.appId);
                    setActiveScreen('AUDIT_LIST');
                  }}
                  className="w-full py-2.5 bg-[#064e2b] hover:bg-[#053e22] text-white text-xs font-semibold rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Open Audit
                </button>
              </div>
            ))
          )}
        </div>

        {/* Desktop #GridView1 Table (md+) */}
        <div className="hidden md:block p-4 overflow-x-auto">
          <table
            id="GridView1"
            className="w-full text-left border-collapse border border-slate-200 rounded-xl text-xs sm:text-sm overflow-hidden"
          >
            <thead>
              <tr className="bg-[#064e2b] text-white text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3">Store ID</th>
                <th className="py-3 px-3">Store Address</th>
                <th className="py-3 px-3">Store Representative</th>
                <th className="py-3 px-3">Auditor</th>
                <th className="py-3 px-3">Designation</th>
                <th className="py-3 px-3">Audit Date</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Time In</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingAudits && matchingAudits.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-500">
                    <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading {config.title.toLowerCase()}...
                    </span>
                  </td>
                </tr>
              ) : matchingAudits.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-500">
                    No records currently in <strong>{config.title}</strong>.
                  </td>
                </tr>
              ) : (
                matchingAudits.map((a) => (
                  <tr key={a.appId} className="hover:bg-emerald-50/40">
                    <td className="py-2.5 px-3 font-mono font-semibold text-[#064e2b]">
                      {a.storeId}
                    </td>
                    <td className="py-2.5 px-3">{a.address}</td>
                    <td className="py-2.5 px-3">{a.storeRep}</td>
                    <td className="py-2.5 px-3">{a.auditor}</td>
                    <td className="py-2.5 px-3">{a.designation}</td>
                    <td className="py-2.5 px-3">{a.outcomeData?.ncrDate || a.date}</td>
                    <td className="py-2.5 px-3">{a.date}</td>
                    <td className="py-2.5 px-3 font-mono">{a.timeIn}</td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAuditId(a.appId);
                          setActiveScreen('AUDIT_LIST');
                        }}
                        className="px-3 py-1.5 bg-[#064e2b] hover:bg-[#053e22] text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        Open
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t border-slate-100 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveScreen('AUDIT_LIST')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ClipboardList className="w-4 h-4" />
            Audit List
          </button>
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
