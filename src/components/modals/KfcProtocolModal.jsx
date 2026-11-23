import React from 'react';
import { X, Check, ShieldCheck, BookOpen } from 'lucide-react';
import { KFC_AUDIT_PROTOCOL_SECTIONS } from '../../data/kfcAuditData';
import { useAuditPortal } from '../../context/AuditPortalContext';

export default function KfcProtocolModal() {
  const { showProtocolModal, setShowProtocolModal, acceptProtocol, protocolAccepted } = useAuditPortal();

  if (!showProtocolModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#064e2b] to-[#0b663a] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-emerald-200 shrink-0" />
            <h4 className="text-base sm:text-lg font-bold tracking-wide uppercase">
              KFC AUDIT PROTOCOL
            </h4>
          </div>
          <button
            type="button"
            onClick={() => setShowProtocolModal(false)}
            className="p-1.5 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-left text-gray-800 text-sm leading-relaxed flex-1">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#006600] shrink-0" />
            <span>
              <strong>HFA Official Protocol:</strong> Please read and click <strong>Accept</strong> below to unlock the <strong>Add New Audit</strong> button on your dashboard.
            </span>
          </div>

          {KFC_AUDIT_PROTOCOL_SECTIONS.length === 0 ? (
            <div className="p-4 rounded-lg border border-gray-200 bg-slate-50 text-xs sm:text-sm text-gray-600 text-center">
              No protocol content loaded. Connect your backend API to load the audit protocol, or click <strong>Accept</strong> to proceed.
            </div>
          ) : (
            KFC_AUDIT_PROTOCOL_SECTIONS.map((sec, idx) => (
              <div key={idx} className="bg-slate-50/80 p-3.5 rounded-lg border border-gray-200/80">
                <h5 className="font-bold text-[#003300] text-sm mb-1.5">
                  {idx + 1}. {sec.title}
                </h5>
                <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {sec.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowProtocolModal(false)}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={acceptProtocol}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#064e2b] hover:bg-[#053e22] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{protocolAccepted ? 'Accepted' : 'Accept'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

