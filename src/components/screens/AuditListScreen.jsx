import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  ChevronDown,
  Edit3,
  Package,
  ClipboardList,
  Eye,
  FileSignature,
  FileCheck,
  Calendar,
  X,
  Loader2
} from 'lucide-react';
import PortalLayout from '../layout/PortalLayout';
import { useAuditPortal } from '../../context/AuditPortalContext';

export default function AuditListScreen() {
  const {
    audits,
    isLoadingAudits,
    setActiveScreen,
    setSelectedAuditId,
    setShowNewAuditModal,
    updateAuditMetadata
  } = useAuditPortal();

  const [dateFilter, setDateFilter] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [editingAudit, setEditingAudit] = useState(null);

  useEffect(() => {
    const closeOnEscape = (e) => {
      if (e.key === 'Escape') setOpenDropdownId(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  const filteredAudits = audits.filter((a) => {
    if (!dateFilter.trim()) return true;
    return a.date.toLowerCase().includes(dateFilter.trim().toLowerCase());
  });

  const handleActionSelect = (auditId, targetScreen) => {
    setSelectedAuditId(auditId);
    setOpenDropdownId(null);
    setActiveScreen(targetScreen);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingAudit) return;
    updateAuditMetadata(editingAudit.appId, {
      address: editingAudit.address,
      storeRep: editingAudit.storeRep,
      designation: editingAudit.designation,
      auditType: editingAudit.auditType
    });
    setEditingAudit(null);
  };

  return (
    <PortalLayout pageTitle="Audit List">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Audit List</h2>
            {isLoadingAudits && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-700">
                <Loader2 className="w-3 h-3 animate-spin" />
                Syncing...
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage store inspections, products, checklists, and outcome sheets
          </p>
        </div>
        <button
          id="MAPC"
          type="button"
          onClick={() => setShowNewAuditModal(true)}
          className="px-4 py-2.5 bg-[#064e2b] hover:bg-[#053e22] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Audit</span>
        </button>
      </div>

      {/* Date Filter Bar */}
      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <div className="flex items-stretch rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs max-w-sm w-full sm:w-auto">
          <span className="bg-slate-50 text-slate-600 text-xs font-semibold px-3 py-2.5 flex items-center gap-1.5 border-r border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-[#064e2b]" />
            Date
          </span>
          <input
            type="text"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            placeholder="e.g. 10-Nov-2026"
            className="px-3 py-2 text-xs sm:text-sm text-slate-800 outline-none flex-1 min-w-[140px]"
          />
          {dateFilter ? (
            <button
              type="button"
              onClick={() => setDateFilter('')}
              className="px-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="Clear filter"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="px-3 flex items-center text-slate-400">
              <Search className="w-4 h-4" />
            </span>
          )}
        </div>
      </div>

      {/* Mobile-First Workflow Cards */}
      <div className="space-y-3.5 md:hidden mb-6">
        {filteredAudits.map((audit) => (
          <div
            key={audit.appId}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#064e2b] to-[#0b663a] text-white px-4 py-3 flex items-center justify-between text-xs">
              <div className="font-bold truncate">
                {audit.storeName} &bull;{' '}
                <span className="text-emerald-200 font-medium">{audit.franchiseeName}</span>
              </div>
              <span className="bg-white/15 px-2.5 py-0.5 rounded-full font-mono text-[11px] shrink-0">
                {audit.date}
              </span>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Store Rep
                  </span>
                  <strong>{audit.storeRep}</strong> ({audit.designation})
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Session / Type
                  </span>
                  <strong>{audit.sessionRound || 'Active'}</strong> &bull; {audit.auditType}
                </div>
              </div>

              {/* 3 Step Status Pills */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <div
                  className={`p-2 rounded-xl text-center border text-[10px] font-semibold ${
                    audit.productsSubmitted
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}
                >
                  Product(s)
                  <div className="font-bold mt-0.5">
                    {audit.productsSubmitted ? `Submitted (${audit.products.length})` : 'Pending'}
                  </div>
                </div>
                <div
                  className={`p-2 rounded-xl text-center border text-[10px] font-semibold ${
                    audit.checklistSubmitted
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}
                >
                  Check List
                  <div className="font-bold mt-0.5">
                    {audit.checklistSubmitted ? 'Submitted' : 'Draft / Open'}
                  </div>
                </div>
                <div
                  className={`p-2 rounded-xl text-center border text-[10px] font-semibold ${
                    audit.outcomeSubmitted
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}
                >
                  Outcome
                  <div className="font-bold mt-0.5">
                    {audit.outcomeSubmitted ? 'Submitted' : 'Pending'}
                  </div>
                </div>
              </div>

              {/* Mobile Action Buttons */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleActionSelect(audit.appId, 'PRODUCTS')}
                  className="px-3 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Products</span>
                </button>

                <button
                  type="button"
                  disabled={!audit.productsSubmitted || audit.checklistSubmitted}
                  onClick={() => handleActionSelect(audit.appId, 'ADD_CHECKLIST')}
                  className="px-3 py-2.5 bg-[#064e2b] hover:bg-[#053e22] text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>Add Check List</span>
                </button>

                <button
                  type="button"
                  disabled={!audit.productsSubmitted && !audit.checklistSubmitted}
                  onClick={() => handleActionSelect(audit.appId, 'VIEW_CHECKLIST')}
                  className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Check List</span>
                </button>

                <button
                  type="button"
                  disabled={!audit.checklistSubmitted}
                  onClick={() => handleActionSelect(audit.appId, 'ADD_OUTCOME')}
                  className="px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <FileSignature className="w-3.5 h-3.5" />
                  <span>Outcome Sheet</span>
                </button>

                <button
                  type="button"
                  disabled={!audit.checklistSubmitted}
                  onClick={() => handleActionSelect(audit.appId, 'VIEW_OUTCOME')}
                  className="px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>View Outcome</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditingAudit({ ...audit })}
                  className="px-3 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Audit</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table (#Coslskka) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-x-auto min-h-[340px]">
        <table id="Coslskka" className="w-full text-left border-collapse min-w-[980px]">
          <thead>
            <tr className="bg-[#064e2b] text-white text-[11px] uppercase tracking-wider font-semibold">
              <th className="py-3 px-3">Action</th>
              <th className="py-3 px-3">Edit</th>
              <th className="py-3 px-3">Franchisee</th>
              <th className="py-3 px-3">Store</th>
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3">Check List</th>
              <th className="py-3 px-3">Product(s)</th>
              <th className="py-3 px-3">Audit Sheet</th>
              <th className="py-3 px-3">Store Rep</th>
              <th className="py-3 px-3">Designation</th>
              <th className="py-3 px-3">Time</th>
              <th className="py-3 px-3">Address</th>
              <th className="py-3 px-3">Session</th>
              <th className="py-3 px-3">Audit Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {filteredAudits.map((audit, idx) => (
              <tr
                key={audit.appId}
                className={`hover:bg-emerald-50/40 transition-colors ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                }`}
              >
                {/* Action Dropdown Column */}
                <td className="py-2.5 px-3 relative">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDropdownId(openDropdownId === audit.appId ? null : audit.appId)
                    }
                    className="px-3 py-1.5 bg-[#064e2b] hover:bg-[#053e22] text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Actions</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {openDropdownId === audit.appId && (
                    <div className="absolute left-3 top-11 z-30 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => handleActionSelect(audit.appId, 'PRODUCTS')}
                        className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 font-medium text-slate-800 flex items-center gap-2 cursor-pointer"
                      >
                        <Package className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Add \ View Product(s)</span>
                      </button>

                      <button
                        type="button"
                        disabled={!audit.productsSubmitted || audit.checklistSubmitted}
                        onClick={() => handleActionSelect(audit.appId, 'ADD_CHECKLIST')}
                        className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 font-medium text-slate-800 disabled:text-slate-300 disabled:hover:bg-transparent disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                      >
                        <ClipboardList className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Add Check List</span>
                      </button>

                      <button
                        type="button"
                        disabled={!audit.productsSubmitted && !audit.checklistSubmitted}
                        onClick={() => handleActionSelect(audit.appId, 'VIEW_CHECKLIST')}
                        className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 font-medium text-slate-800 disabled:text-slate-300 disabled:hover:bg-transparent disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-sky-600" />
                        <span>View Check List</span>
                      </button>

                      <button
                        type="button"
                        disabled={!audit.checklistSubmitted}
                        onClick={() => handleActionSelect(audit.appId, 'ADD_OUTCOME')}
                        className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 font-medium text-slate-800 disabled:text-slate-300 disabled:hover:bg-transparent disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                      >
                        <FileSignature className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Add Outcome Sheet</span>
                      </button>

                      <button
                        type="button"
                        disabled={!audit.checklistSubmitted}
                        onClick={() => handleActionSelect(audit.appId, 'VIEW_OUTCOME')}
                        className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 font-medium text-slate-800 disabled:text-slate-300 disabled:hover:bg-transparent disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
                        <span>View Outcome Sheet</span>
                      </button>
                    </div>
                  )}
                </td>

                {/* Edit Audit Button */}
                <td className="py-2.5 px-3">
                  <button
                    type="button"
                    onClick={() => setEditingAudit({ ...audit })}
                    className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </td>

                <td className="py-2.5 px-3 font-medium">{audit.franchiseeName}</td>
                <td className="py-2.5 px-3 font-bold text-[#064e2b]">{audit.storeName}</td>
                <td className="py-2.5 px-3 whitespace-nowrap">{audit.date}</td>
                <td className="py-2.5 px-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      audit.checklistSubmitted
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {audit.checklistSubmitted ? 'Submitted' : 'Not Submitted'}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      audit.productsSubmitted
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {audit.productsSubmitted ? 'Submitted' : 'Not Submitted'}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      audit.outcomeSubmitted
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {audit.outcomeSubmitted ? 'Submitted' : 'Not Submitted'}
                  </span>
                </td>
                <td className="py-2.5 px-3">{audit.storeRep}</td>
                <td className="py-2.5 px-3">{audit.designation}</td>
                <td className="py-2.5 px-3 font-mono">{audit.timeIn}</td>
                <td className="py-2.5 px-3">{audit.address}</td>
                <td className="py-2.5 px-3">{audit.sessionRound}</td>
                <td className="py-2.5 px-3">{audit.auditType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Inline Edit Audit Popup */}
      {editingAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="bg-[#064e2b] text-white px-5 py-3.5 flex items-center justify-between font-bold text-base">
              <span>Edit Audit</span>
              <button
                type="button"
                onClick={() => setEditingAudit(null)}
                className="p-1 text-emerald-200 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-5 space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Store Address
                </label>
                <input
                  type="text"
                  value={editingAudit.address}
                  onChange={(e) => setEditingAudit({ ...editingAudit, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm text-slate-800 rounded-xl border border-slate-200 focus:border-[#064e2b] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Store Representative
                </label>
                <input
                  type="text"
                  value={editingAudit.storeRep}
                  onChange={(e) => setEditingAudit({ ...editingAudit, storeRep: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 text-sm text-slate-800 rounded-xl border border-slate-200 focus:border-[#064e2b] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  value={editingAudit.designation}
                  onChange={(e) => setEditingAudit({ ...editingAudit, designation: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 text-sm text-slate-800 rounded-xl border border-slate-200 focus:border-[#064e2b] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Audit Type
                </label>
                <select
                  value={editingAudit.auditType}
                  onChange={(e) => setEditingAudit({ ...editingAudit, auditType: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white rounded-xl border border-slate-200 focus:border-[#064e2b] outline-none"
                >
                  <option value="Existing Store">Existing Store</option>
                  <option value="New / Converted Store">New / Converted Store</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAudit(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#064e2b] hover:bg-[#053e22] cursor-pointer"
                >
                  Update Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
