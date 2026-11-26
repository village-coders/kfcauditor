import React, { useState } from 'react';
import {
  LayoutGrid,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  MapPin,
  LogOut,
  Menu,
  X,
  BookOpen,
  UserCheck
} from 'lucide-react';
import { useAuditPortal } from '../../context/AuditPortalContext';
import { useAuth } from '../../context/AuthContext';
import KfcProtocolModal from '../modals/KfcProtocolModal';
import NewAuditModal from '../modals/NewAuditModal';

export default function PortalLayout({ children, pageTitle, bgStyle = 'bg-[#f4f7f5]' }) {
  const { activeScreen, setActiveScreen, setShowProtocolModal } = useAuditPortal();
  const { currentUser, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutGrid },
    { id: 'AUDIT_LIST', label: 'Audit List', icon: FileText },
    { id: 'PASSED_LIST', label: 'Passed List', icon: CheckCircle2 },
    { id: 'PENDING_LIST', label: 'Pending', icon: Clock },
    { id: 'OTHER_FAILED_LIST', label: 'Other Failed', icon: AlertTriangle },
    { id: 'L3_LIST', label: 'L3 List', icon: ShieldAlert },
    { id: 'MAP', label: 'Map', icon: MapPin }
  ];

  const handleNavClick = (screenId) => {
    setActiveScreen(screenId);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f4f7f5]">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sleek Left Sidebar (drawer on mobile, static/pinned full-height on lg+) */}
      <aside
        className={`fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-50 w-68 bg-white border-r border-slate-200/80 shadow-xl lg:shadow-none flex flex-col transition-transform duration-200 ease-out shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="bg-gradient-to-br from-[#064e2b] via-[#043d21] to-[#022c17] p-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleNavClick('DASHBOARD')}
            className="bg-white/95 rounded-xl px-3 py-2 flex items-center justify-center shadow-sm hover:bg-white transition-colors mx-auto lg:mx-0 cursor-pointer"
          >
            <img
              src="/hfa-logo.png"
              alt="Halal Food Authority Logo"
              className="h-14 w-auto object-contain"
            />
          </button>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-emerald-100 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto">
          <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#064e2b] text-white shadow-sm shadow-emerald-950/20'
                    : 'text-slate-600 hover:bg-emerald-50/80 hover:text-[#064e2b]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-emerald-300' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 mt-3 border-t border-slate-100 space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Compliance &amp; Account
            </div>
            <button
              type="button"
              onClick={() => {
                setSidebarOpen(false);
                setShowProtocolModal(true);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-emerald-50/80 hover:text-[#064e2b] transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>KFC Audit Protocol</span>
            </button>

            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0 text-rose-500" />
              <span>Logout</span>
            </button>
          </div>
        </nav>

        {/* Active Session Card */}
        <div className="p-3.5 m-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-slate-50 border border-emerald-200/70 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-[#064e2b] uppercase tracking-wider text-[10px]">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Active Session</span>
          </div>
          <div className="text-slate-600 flex justify-between gap-2">
            <span className="font-medium">Franchisee:</span>
            <span className="text-[#064e2b] font-bold truncate">
              {currentUser?.currentStore?.franchiseeName || '—'}
            </span>
          </div>
          <div className="text-slate-600 flex justify-between gap-2">
            <span className="font-medium">Store:</span>
            <span className="text-[#064e2b] font-bold truncate">
              {currentUser?.currentStore?.shortName || '—'}
            </span>
          </div>
          <div className="text-slate-600 flex justify-between gap-2">
            <span className="font-medium">Auditor:</span>
            <span className="text-[#064e2b] font-bold truncate">
              {currentUser?.username || '—'}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${bgStyle}`}>
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-30 bg-[#064e2b]/95 backdrop-blur-md text-white px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm border-b border-emerald-800/40">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold leading-tight truncate">
                {pageTitle || 'Halal Food Authority (KFC Auditor)'}
              </h1>
              <p className="text-[11px] text-emerald-200/90 truncate">
                Franchisee: {currentUser?.currentStore?.franchiseeName || '—'} &bull; Store:{' '}
                {currentUser?.currentStore?.shortName || '—'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowProtocolModal(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs bg-white/12 hover:bg-white/20 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-200" />
              <span>Protocol</span>
            </button>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 text-xs bg-rose-500/90 hover:bg-rose-600 px-3 py-1.5 rounded-lg font-semibold transition-colors shadow-xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-3 sm:p-6 max-w-6xl w-full mx-auto pb-24 lg:pb-8">
          {children}
        </main>

        {/* Subtle Footer */}
        <footer className="hidden lg:block border-t border-slate-200/80 bg-white/80 px-6 py-3 text-xs text-slate-500">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-4">
              <span>
                <strong className="text-slate-700">Franchisee:</strong>{' '}
                {currentUser?.currentStore?.franchiseeName || '—'}
              </span>
              <span>
                <strong className="text-slate-700">Store:</strong>{' '}
                {currentUser?.currentStore?.shortName || '—'}
              </span>
              <span>
                <strong className="text-slate-700">Auditor:</strong>{' '}
                {currentUser?.username || '—'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              HFA KFC Audit Portal &bull; Store ID: {currentUser?.currentStore?.code || '—'}
            </div>
          </div>
        </footer>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 grid grid-cols-5 py-1.5 px-1 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          {[
            { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutGrid },
            { id: 'AUDIT_LIST', label: 'Audits', icon: FileText },
            { id: 'PASSED_LIST', label: 'Passed', icon: CheckCircle2 },
            { id: 'PENDING_LIST', label: 'Pending', icon: Clock },
            { id: 'MAP', label: 'Map', icon: MapPin }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeScreen === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveScreen(tab.id)}
                className={`flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-[#064e2b]' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div
                  className={`p-1 rounded-lg mb-0.5 transition-colors ${
                    isActive ? 'bg-emerald-100 text-[#064e2b]' : ''
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Shared Modals */}
      <KfcProtocolModal />
      <NewAuditModal />
    </div>
  );
}
