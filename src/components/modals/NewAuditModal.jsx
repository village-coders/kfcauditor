import React, { useState, useEffect } from 'react';
import { useAuditPortal } from '../../context/AuditPortalContext';
import { useAuth } from '../../context/AuthContext';

export default function NewAuditModal() {
  const { showNewAuditModal, setShowNewAuditModal, createNewAudit } = useAuditPortal();
  const { currentUser } = useAuth();

  const [address, setAddress] = useState('');
  const [storeRep, setStoreRep] = useState('');
  const [designation, setDesignation] = useState('');
  const [auditType, setAuditType] = useState('...Select Option...');
  const [error, setError] = useState('');

  useEffect(() => {
    if (showNewAuditModal) {
      setAddress(currentUser?.currentStore?.address || currentUser?.currentStore?.shortName || '');
      setStoreRep('');
      setDesignation('');
      setAuditType('...Select Option...');
      setError('');
    }
  }, [showNewAuditModal, currentUser]);

  if (!showNewAuditModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!storeRep.trim()) {
      setError('Store Representative is required.');
      return;
    }
    if (!designation.trim()) {
      setError('Designation is required.');
      return;
    }
    if (auditType === '...Select Option...') {
      setError('Please select an Audit Type.');
      return;
    }

    createNewAudit({
      address: address.trim(),
      storeRep: storeRep.trim(),
      designation: designation.trim(),
      auditType
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-[#064e2b] to-[#0b663a] text-white px-5 py-3.5 text-center font-bold text-base tracking-wide">
          New Audit
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-left">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Franchisee (First) */}
          <div className="flex flex-col sm:flex-row sm:items-center rounded border border-gray-300 overflow-hidden">
            <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-2.5 sm:w-44 border-b sm:border-b-0 sm:border-r border-gray-300 shrink-0">
              Franchisee:
            </span>
            <input
              type="text"
              readOnly
              value={currentUser?.currentStore?.franchiseeName || '—'}
              className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-50 outline-none"
            />
          </div>

          {/* Store Name */}
          <div className="flex flex-col sm:flex-row sm:items-center rounded border border-gray-300 overflow-hidden">
            <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-2.5 sm:w-44 border-b sm:border-b-0 sm:border-r border-gray-300 shrink-0">
              Store:
            </span>
            <input
              type="text"
              readOnly
              value={currentUser?.currentStore?.shortName || '—'}
              className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-50 outline-none"
            />
          </div>

          {/* Store Address */}
          <div className="flex flex-col sm:flex-row sm:items-center rounded border border-gray-300 overflow-hidden">
            <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-2.5 sm:w-44 border-b sm:border-b-0 sm:border-r border-gray-300 shrink-0">
              Store Address:
            </span>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Store Address"
              className="w-full px-3 py-2 text-sm text-gray-800 bg-gray-50 outline-none focus:bg-white"
            />
          </div>

          {/* Store Representative */}
          <div className="flex flex-col sm:flex-row sm:items-center rounded border border-gray-300 overflow-hidden focus-within:border-[#006600]">
            <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-2.5 sm:w-44 border-b sm:border-b-0 sm:border-r border-gray-300 shrink-0">
              Store Representative:
            </span>
            <input
              type="text"
              value={storeRep}
              onChange={(e) => {
                setStoreRep(e.target.value);
                setError('');
              }}
              placeholder="Enter Representative Name"
              required
              className="w-full px-3 py-2 text-sm text-gray-800 outline-none"
            />
          </div>

          {/* Designation */}
          <div className="flex flex-col sm:flex-row sm:items-center rounded border border-gray-300 overflow-hidden focus-within:border-[#006600]">
            <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-2.5 sm:w-44 border-b sm:border-b-0 sm:border-r border-gray-300 shrink-0">
              Designation:
            </span>
            <input
              type="text"
              value={designation}
              onChange={(e) => {
                setDesignation(e.target.value);
                setError('');
              }}
              placeholder="e.g. Shift Runner / Manager"
              required
              className="w-full px-3 py-2 text-sm text-gray-800 outline-none"
            />
          </div>

          {/* Audit Type */}
          <div className="flex flex-col sm:flex-row sm:items-center rounded border border-gray-300 overflow-hidden focus-within:border-[#006600]">
            <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-2.5 sm:w-44 border-b sm:border-b-0 sm:border-r border-gray-300 shrink-0">
              Audit Type:
            </span>
            <select
              value={auditType}
              onChange={(e) => {
                setAuditType(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 text-sm text-gray-800 bg-white outline-none cursor-pointer"
            >
              <option value="...Select Option...">...Select Option...</option>
              <option value="Existing Store">Existing Store</option>
              <option value="New / Converted Store">New / Converted Store</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={() => setShowNewAuditModal(false)}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#064e2b] hover:bg-[#053e22] transition-colors shadow-xs cursor-pointer"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

