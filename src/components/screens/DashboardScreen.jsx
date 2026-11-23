import React from 'react';
import {
  FileText,
  PlusCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  MapPin,
  BookOpen,
  LogOut,
  Lock,
  CheckCircle,
  ChevronRight
} from 'lucide-react';
import PortalLayout from '../layout/PortalLayout';
import { useAuditPortal } from '../../context/AuditPortalContext';
import { useAuth } from '../../context/AuthContext';

export default function DashboardScreen() {
  const {
    setActiveScreen,
    protocolAccepted,
    setShowProtocolModal,
    setShowNewAuditModal,
    audits,
    isLoadingAudits
  } = useAuditPortal();
  const { currentUser, logout } = useAuth();

  const passedCount = audits.filter((a) => a.statusCategory === 'PASSED').length;
  const pendingCount = audits.filter((a) => a.statusCategory === 'PENDING').length;
  const otherFailCount = audits.filter((a) => a.statusCategory === 'OTHER_FAIL').length;
  const l3FailCount = audits.filter((a) => a.statusCategory === 'L3_FAIL').length;

  const dashboardCards = [
    {
      id: 'opi',
      label: 'Audit List',
      subtitle: 'View & manage store audits',
      badge: audits.length,
      icon: FileText,
      accent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      onClick: () => setActiveScreen('AUDIT_LIST')
    },
    {
      id: 'Butd',
      label: 'Add New Audit',
      subtitle: protocolAccepted ? 'Start a new store inspection' : 'Accept protocol to unlock',
      disabled: !protocolAccepted,
      icon: PlusCircle,
      accent: 'bg-[#064e2b] text-white border-[#064e2b]',
      primary: true,
      onClick: () => {
        if (protocolAccepted) {
          setShowNewAuditModal(true);
        } else {
          setShowProtocolModal(true);
        }
      }
    },
    {
      id: 'Button2',
      label: 'Passed Audits',
      subtitle: 'Compliant store inspections',
      badge: passedCount,
      icon: CheckCircle2,
      accent: 'bg-green-50 text-green-700 border-green-200',
      onClick: () => setActiveScreen('PASSED_LIST')
    },
    {
      id: 'uu',
      label: 'Pending Audits',
      subtitle: 'In-progress & draft audits',
      badge: pendingCount,
      icon: Clock,
      accent: 'bg-amber-50 text-amber-700 border-amber-200',
      onClick: () => setActiveScreen('PENDING_LIST')
    },
    {
      id: 'ueeu',
      label: 'Other Fails',
      subtitle: 'L1 & L2 non-conformances',
      badge: otherFailCount,
      icon: AlertTriangle,
      accent: 'bg-orange-50 text-orange-700 border-orange-200',
      onClick: () => setActiveScreen('OTHER_FAILED_LIST')
    },
    {
      id: 'Button3',
      label: 'L3 Fails',
      subtitle: 'Critical compliance alerts',
      badge: l3FailCount,
      icon: ShieldAlert,
      accent: 'bg-rose-50 text-rose-700 border-rose-200',
      onClick: () => setActiveScreen('L3_LIST')
    },
    {
      id: 'Button5',
      label: 'Store Map',
      subtitle: 'Locate assigned KFC stores',
      icon: MapPin,
      accent: 'bg-sky-50 text-sky-700 border-sky-200',
      onClick: () => setActiveScreen('MAP')
    },
    {
      id: 'Buthton5',
      label: 'KFC Audit Protocol',
      subtitle: protocolAccepted ? 'Reviewed & accepted' : 'Required before new audit',
      icon: BookOpen,
      highlight: !protocolAccepted,
      accent: 'bg-teal-50 text-teal-700 border-teal-200',
      onClick: () => setShowProtocolModal(true)
    },
    {
      id: 'Button4',
      label: 'Logout',
      subtitle: 'End current auditor session',
      icon: LogOut,
      accent: 'bg-slate-100 text-slate-600 border-slate-200',
      onClick: logout
    }
  ];

  return (
    <PortalLayout pageTitle="Dashboard" bgStyle="bg-[#f4f7f5]">
      {/* Hero Banner */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#064e2b] via-[#0a5c34] to-[#116d40] text-white p-5 sm:p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider bg-white/15 px-2.5 py-0.5 rounded-full text-emerald-100 mb-2">
              HFA Halal Compliance Portal
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Welcome, {currentUser?.username || 'Auditor'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-0.5">
              Assigned Store: <strong>{currentUser?.currentStore?.shortName || '—'}</strong> ({currentUser?.currentStore?.code || '—'}) &bull; Franchisee: <strong>{currentUser?.currentStore?.franchiseeName || '—'}</strong>
            </p>
          </div>

          {!protocolAccepted ? (
            <button
              type="button"
              onClick={() => setShowProtocolModal(true)}
              className="self-start sm:self-center text-xs bg-amber-400 hover:bg-amber-300 text-slate-900 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer shrink-0"
            >
              <Lock className="w-4 h-4" />
              <span>Accept Protocol to Unlock New Audit</span>
            </button>
          ) : (
            <div className="self-start sm:self-center text-xs bg-white/15 backdrop-blur-xs border border-white/20 text-emerald-50 px-3.5 py-2 rounded-xl font-semibold flex items-center gap-2 shrink-0">
              <CheckCircle className="w-4 h-4 text-emerald-300" />
              <span>Protocol Accepted &bull; Ready to Audit</span>
            </div>
          )}
        </div>
      </div>

      {/* 9 Modern Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {dashboardCards.map((card) => {
          const Icon = card.icon;
          const isPrimary = card.primary && !card.disabled;

          return (
            <button
              key={card.id}
              id={card.id}
              type="button"
              disabled={card.disabled}
              onClick={card.onClick}
              className={`group text-left rounded-2xl p-4 sm:p-5 border transition-all duration-150 flex items-center justify-between gap-3 relative ${
                card.disabled
                  ? 'bg-slate-100/80 border-slate-200 opacity-65 cursor-not-allowed'
                  : isPrimary
                  ? 'bg-gradient-to-br from-[#064e2b] to-[#0b663a] border-[#064e2b] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'
                  : card.highlight
                  ? 'bg-white border-amber-400 ring-2 ring-amber-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
                  : 'bg-white border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 hover:-translate-y-0.5 cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${
                    isPrimary
                      ? 'bg-white/15 border-white/20 text-white'
                      : card.accent
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div
                    className={`font-bold text-sm sm:text-base truncate ${
                      isPrimary ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    {card.label}
                  </div>
                  <div
                    className={`text-xs truncate mt-0.5 ${
                      isPrimary ? 'text-emerald-100' : 'text-slate-500'
                    }`}
                  >
                    {card.subtitle}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {typeof card.badge === 'number' && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isPrimary
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isLoadingAudits ? (
                      <span className="inline-block w-3 h-3 rounded-full bg-current opacity-30 animate-pulse align-middle" />
                    ) : (
                      card.badge
                    )}
                  </span>
                )}
                {card.disabled ? (
                  <Lock className="w-4 h-4 text-amber-600" />
                ) : (
                  <ChevronRight
                    className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
                      isPrimary ? 'text-emerald-200' : 'text-slate-300 group-hover:text-emerald-600'
                    }`}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </PortalLayout>
  );
}
