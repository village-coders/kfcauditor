import React, { useState, useRef, useEffect } from 'react';
import {
  FileSignature,
  RotateCcw,
  CheckCircle2,
  ArrowLeft,
  LayoutDashboard,
  Search,
  Edit3,
  Loader2
} from 'lucide-react';
import { useAuditPortal } from '../../context/AuditPortalContext';
import { useToast } from '../../context/ToastContext';

/**
 * Reusable Touch & Mouse HTML5 Signature Pad matching #sketchpad and #Canvas1
 */
function SignaturePad({ id, label, initialDataUrl, onChange }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(Boolean(initialDataUrl));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0f172a';

    if (initialDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = initialDataUrl;
    }
  }, [initialDataUrl]);

  const getCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches && e.touches.length > 0) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas && onChange) {
      onChange(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    if (onChange) onChange('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between max-w-[420px]">
        <span className="text-xs font-bold text-[#064e2b]">{label}</span>
        {hasSignature && (
          <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
            Signature captured
          </span>
        )}
      </div>
      <div className="border-2 border-dashed border-slate-300 hover:border-emerald-400 transition-colors rounded-2xl bg-white overflow-hidden max-w-[420px] relative">
        <canvas
          id={id}
          ref={canvasRef}
          width={400}
          height={200}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-[170px] sm:h-[190px] touch-none cursor-crosshair block bg-white"
        />
        {!hasSignature && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-[11px] text-slate-400">
            Sign above using finger or mouse
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={clearCanvas}
        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Clear Signature
      </button>
    </div>
  );
}

export function OutcomeSheetScreen({ mode = 'add' }) {
  const {
    selectedAudit,
    audits,
    isSyncing,
    setSelectedAuditId,
    setActiveScreen,
    saveAuditOutcome
  } = useAuditPortal();
  const toast = useToast();

  const [dateSearch, setDateSearch] = useState('');

  // Form states for Add Outcome Sheet (#AddUdit)
  const [storeRep, setStoreRep] = useState(selectedAudit?.storeRep || '');
  const [designation, setDesignation] = useState(selectedAudit?.designation || '');
  const [auditorName, setAuditorName] = useState(selectedAudit?.auditor || '');
  const [timeIn, setTimeIn] = useState(selectedAudit?.timeIn || '');

  // Card 2: NCR
  const [ncrDate, setNcrDate] = useState(
    selectedAudit?.outcomeData?.ncrDate || selectedAudit?.date || ''
  );
  const [ncrSignature, setNcrSignature] = useState(
    selectedAudit?.outcomeData?.ncrSignature || ''
  );
  const [ncrPrintName, setNcrPrintName] = useState(
    selectedAudit?.outcomeData?.ncrPrintName || selectedAudit?.auditor || ''
  );

  // Card 3: RSR
  const [rsrResponse, setRsrResponse] = useState(
    selectedAudit?.outcomeData?.rsrResponse || ''
  );
  const [rsrSignature, setRsrSignature] = useState(
    selectedAudit?.outcomeData?.rsrSignature || ''
  );
  const [rsrPrintName, setRsrPrintName] = useState(
    selectedAudit?.outcomeData?.rsrPrintName || selectedAudit?.storeRep || ''
  );

  // Card 4: Others (3 file uploads)
  const [files, setFiles] = useState(
    selectedAudit?.outcomeData?.files || { file1: null, file2: null, file3: null }
  );
  const [fileError, setFileError] = useState('');

  const handleFileChange = (slot, e) => {
    setFileError('');
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      const msg = `"${file.name}" exceeds the maximum allowed size of 500KB.`;
      setFileError(msg);
      toast.error(msg, 'File Too Large');
      e.target.value = '';
      return;
    }
    toast.success(`Attached "${file.name}" (${Math.round(file.size / 1024)} KB).`, 'File Attached');
    setFiles((prev) => ({
      ...prev,
      [slot]: { name: file.name, sizeKB: Math.round(file.size / 1024) }
    }));
  };

  const handleSubmitOutcome = (e) => {
    e.preventDefault();
    if (!selectedAudit) return;
    saveAuditOutcome(selectedAudit.appId, {
      storeRep,
      designation,
      auditorName,
      timeIn,
      ncrDate,
      ncrSignature,
      ncrPrintName,
      rsrResponse,
      rsrSignature,
      rsrPrintName,
      files,
      submittedAt: new Date().toLocaleString()
    });
    setActiveScreen('VIEW_OUTCOME');
  };

  // VIEW MODE: Audit Sheet List (AuditList.aspx) + Outcome Sheet Details
  if (mode === 'view') {
    const submittedAudits = audits.filter((a) => {
      const matchesDate =
        !dateSearch.trim() ||
        a.date.toLowerCase().includes(dateSearch.trim().toLowerCase());
      return matchesDate;
    });

    return (
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden">
          <div className="bg-gradient-to-r from-[#064e2b] to-[#0b663a] text-white px-5 py-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base sm:text-lg font-bold tracking-tight">
              Audit Sheet List
            </h2>
            <span className="text-xs bg-white/15 px-3 py-1 rounded-full font-semibold">
              {submittedAudits.length} Record(s)
            </span>
          </div>

          {/* Search By Date Bar */}
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
            {submittedAudits.map((a) => (
              <div
                key={a.appId}
                className={`rounded-2xl border p-3.5 space-y-2.5 text-xs ${
                  selectedAudit?.appId === a.appId
                    ? 'border-emerald-300 bg-emerald-50/50'
                    : 'border-slate-200 bg-slate-50/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm text-[#064e2b]">
                    {a.storeName} ({a.storeId})
                  </span>
                  <span className="font-mono text-[11px] bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                    {a.date}
                  </span>
                </div>
                <div className="text-slate-600">{a.address}</div>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
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
                    setActiveScreen('ADD_OUTCOME');
                  }}
                  className="w-full py-2.5 bg-[#064e2b] hover:bg-[#053e22] text-white text-xs font-semibold rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {a.outcomeSubmitted ? 'Edit Outcome Sheet' : 'Fill Outcome Sheet'}
                </button>
              </div>
            ))}
          </div>

          {/* Desktop GridView1 Table (md+) */}
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
                {submittedAudits.map((a) => (
                  <tr
                    key={a.appId}
                    className={`hover:bg-emerald-50/40 ${
                      selectedAudit?.appId === a.appId ? 'bg-emerald-50/70' : 'bg-white'
                    }`}
                  >
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
                          setActiveScreen('ADD_OUTCOME');
                        }}
                        className="px-3 py-1.5 bg-[#064e2b] hover:bg-[#053e22] text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        {a.outcomeSubmitted ? 'Edit Sheet' : 'Fill Sheet'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Selected Audit Outcome Summary Preview */}
          {selectedAudit?.outcomeData && (
            <div className="mx-4 mb-4 p-4 sm:p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200 pb-3">
                <h3 className="text-sm sm:text-base font-bold text-[#064e2b]">
                  Submitted Outcome Sheet — Audit #{selectedAudit.appId}
                </h3>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-0.5 rounded-full">
                  Submitted: {selectedAudit.outcomeData.submittedAt}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-[#064e2b] border-b border-slate-100 pb-1.5">
                    NCR (Auditor Acknowledgement)
                  </h4>
                  <p>
                    <strong>Understood Date:</strong> {selectedAudit.outcomeData.ncrDate}
                  </p>
                  <p>
                    <strong>Print Name:</strong> {selectedAudit.outcomeData.ncrPrintName}
                  </p>
                  {selectedAudit.outcomeData.ncrSignature && (
                    <div className="pt-1">
                      <p className="text-xs text-slate-500 mb-1">Signature:</p>
                      <img
                        src={selectedAudit.outcomeData.ncrSignature}
                        alt="NCR Signature"
                        className="h-20 border border-slate-200 rounded-xl bg-white"
                      />
                    </div>
                  )}
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-[#064e2b] border-b border-slate-100 pb-1.5">
                    RSR (Shift Runner Representation)
                  </h4>
                  <p>
                    <strong>Representation:</strong>{' '}
                    {selectedAudit.outcomeData.rsrResponse || 'None recorded'}
                  </p>
                  <p>
                    <strong>Print Name:</strong> {selectedAudit.outcomeData.rsrPrintName}
                  </p>
                  {selectedAudit.outcomeData.rsrSignature && (
                    <div className="pt-1">
                      <p className="text-xs text-slate-500 mb-1">Signature:</p>
                      <img
                        src={selectedAudit.outcomeData.rsrSignature}
                        alt="RSR Signature"
                        className="h-20 border border-slate-200 rounded-xl bg-white"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="p-4 border-t border-slate-100 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setActiveScreen('AUDIT_LIST')}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back To Audit List
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

  // ADD MODE: Add Outcome Sheet
  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-2xl shadow-xs border border-slate-200/90 bg-white overflow-hidden">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#064e2b] to-[#0b663a] text-white px-5 py-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <FileSignature className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Outcome Sheet
              </h2>
              <p className="text-xs text-emerald-100/90">
                Audit ID: <span className="font-mono font-semibold">{selectedAudit?.appId}</span> &bull; Store:{' '}
                <span className="font-semibold">{selectedAudit?.storeName}</span>
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmitOutcome} className="p-4 sm:p-6 space-y-6 bg-[#f6faf7]">
          {/* Card 1: First Step */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
            <div className="bg-slate-900 text-white px-4 py-2.5 font-bold text-sm">
              1. Store &amp; Auditor Details
            </div>
            <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-600 mb-1">Address</label>
                <input
                  id="StoAddress"
                  type="text"
                  readOnly
                  value={selectedAudit?.address || ''}
                  className="w-full h-10 px-3.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">
                  Store Representative
                </label>
                <input
                  id="StRep"
                  type="text"
                  value={storeRep}
                  onChange={(e) => setStoreRep(e.target.value)}
                  className="w-full h-10 px-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#064e2b]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Designation</label>
                <input
                  id="Descri"
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full h-10 px-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#064e2b]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Auditor</label>
                <input
                  id="Audi"
                  type="text"
                  value={auditorName}
                  onChange={(e) => setAuditorName(e.target.value)}
                  className="w-full h-10 px-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#064e2b]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Time In</label>
                <input
                  id="TIn"
                  type="text"
                  value={timeIn}
                  onChange={(e) => setTimeIn(e.target.value)}
                  className="w-full h-10 px-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#064e2b]"
                />
              </div>
            </div>
          </div>

          {/* Card 2: NCR */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
            <div className="bg-slate-900 text-white px-4 py-2.5 font-bold text-sm">
              2. NCR — Non-Conformances Raised
            </div>
            <div className="p-4 sm:p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-800 mb-1.5 leading-relaxed">
                  The Non-Conformances raised (if any) have been discussed and understood with me by the Auditor on
                </label>
                <input
                  id="UDerStud"
                  type="text"
                  value={ncrDate}
                  onChange={(e) => setNcrDate(e.target.value)}
                  placeholder="DD-MMM-YYYY"
                  className="w-full max-w-xs h-10 px-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#064e2b]"
                />
              </div>

              <SignaturePad
                id="sketchpad"
                label="Auditor / NCR Signature Pad"
                initialDataUrl={ncrSignature}
                onChange={setNcrSignature}
              />

              <div className="max-w-sm">
                <label className="block font-semibold text-slate-600 mb-1">Print Name</label>
                <input
                  id="PRintA"
                  type="text"
                  value={ncrPrintName}
                  onChange={(e) => setNcrPrintName(e.target.value)}
                  placeholder="Enter Print Name"
                  className="w-full h-10 px-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#064e2b]"
                />
              </div>
            </div>
          </div>

          {/* Card 3: R S R */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
            <div className="bg-slate-900 text-white px-4 py-2.5 font-bold text-sm">
              3. R S R — Shift Runner Representation
            </div>
            <div className="p-4 sm:p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Representation from the Shift Runner
                </label>
                <textarea
                  id="Respon"
                  rows={4}
                  value={rsrResponse}
                  onChange={(e) => setRsrResponse(e.target.value)}
                  placeholder="Enter Shift Runner representation..."
                  className="w-full p-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#064e2b]"
                />
              </div>

              <SignaturePad
                id="Canvas1"
                label="Shift Runner Signature Pad"
                initialDataUrl={rsrSignature}
                onChange={setRsrSignature}
              />

              <div className="max-w-sm">
                <label className="block font-semibold text-slate-600 mb-1">Print Name</label>
                <input
                  id="PriD"
                  type="text"
                  value={rsrPrintName}
                  onChange={(e) => setRsrPrintName(e.target.value)}
                  placeholder="Enter Shift Runner Print Name"
                  className="w-full h-10 px-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#064e2b]"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Others */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
            <div className="bg-slate-900 text-white px-4 py-2.5 font-bold text-sm">
              4. Attachments &amp; Summary Comments
            </div>
            <div className="p-4 sm:p-5 space-y-4 text-xs sm:text-sm">
              <div className="space-y-3">
                <p className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl">
                  Maximum file size allowed: 500KB per attachment
                </p>

                {fileError && (
                  <p className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-xl">
                    {fileError}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['file1', 'file2', 'file3']).map((slot, idx) => (
                    <div
                      key={slot}
                      className="p-3.5 border border-dashed border-slate-300 rounded-xl bg-slate-50/70 space-y-1.5"
                    >
                      <label className="block font-bold text-slate-700">
                        File {idx + 1}
                      </label>
                      <input
                        id={`FileUpload${idx + 1}`}
                        type="file"
                        onChange={(e) => handleFileChange(slot, e)}
                        className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#064e2b] file:text-white hover:file:bg-[#053e22]"
                      />
                      {files[slot] && (
                        <p className="text-[11px] text-emerald-700 font-medium truncate">
                          Attached: {files[slot].name} ({files[slot].sizeKB} KB)
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">
                  Comment (Product List)
                </label>
                <textarea
                  id="MsgP1"
                  rows={2}
                  readOnly
                  value={selectedAudit?.productComment || ''}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">
                  Comment (Check List)
                </label>
                <textarea
                  id="MsgC1"
                  rows={2}
                  readOnly
                  value={selectedAudit?.checklistOverallComment || ''}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-600"
                />
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  id="Submit1"
                  type="submit"
                  disabled={isSyncing}
                  className="px-6 py-2.5 bg-[#064e2b] hover:bg-[#053e22] disabled:opacity-70 text-white font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {isSyncing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {isSyncing ? 'Submitting...' : 'Submit Outcome Sheet'}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveScreen('AUDIT_LIST')}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back To Audit List
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
