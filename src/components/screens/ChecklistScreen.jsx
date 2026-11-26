import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Plus,
  Trash2,
  ArrowLeft,
  LayoutDashboard,
  Edit3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Save,
  Loader2
} from 'lucide-react';
import { useAuditPortal } from '../../context/AuditPortalContext';
import {
  CHECKLIST_STEPS,
  CHECKLIST_SCORE_OPTIONS,
  SCORING_MATRIX,
  evaluateChecklistOutcome
} from '../../data/kfcAuditData';

export function ChecklistScreen({ mode = 'add' }) {
  const { selectedAudit, isSyncing, setActiveScreen, saveChecklistDraft, saveAuditChecklist } =
    useAuditPortal();
  const isViewOnly = mode === 'view';

  const [scores, setScores] = useState(() => ({
    ScoreCommentsA1: 'Pass',
    ScoreCommentsA2: 'Pass',
    ScoreCommentsA3: 'Pass',
    ScoreCommentsA4: 'Pass',
    ScoreCommentsB1: 'Pass',
    ScoreCommentsB2: 'Pass',
    ScoreCommentsB3: 'Pass',
    ScoreCommentsC1: 'Pass',
    ScoreCommentsC2: 'Pass',
    ScoreCommentsD1: 'Pass',
    ...(selectedAudit?.checklistScores || {})
  }));

  const [comments, setComments] = useState(() => ({
    MsgA1: '',
    MsgA2: '',
    MsgA3: '',
    MsgA4: '',
    MsgB1: '',
    MsgB2: '',
    MsgB3: '',
    MsgC1: '',
    MsgC2: '',
    MsgD1: '',
    ...(selectedAudit?.checklistComments || {})
  }));

  const [randomChecks, setRandomChecks] = useState(
    () => selectedAudit?.randomChecks || []
  );
  const [deliveryDate, setDeliveryDate] = useState('');
  const [checkItem, setCheckItem] = useState('');
  const [fsmsValue, setFsmsValue] = useState('');

  const [overallComment, setOverallComment] = useState(
    selectedAudit?.checklistOverallComment || ''
  );

  // Track active tab per step: { step1: '1.1', step2: '2.1', step3: '3.1', step4: '4.1' }
  const [activeTabs, setActiveTabs] = useState({
    step1: '1.1',
    step2: '2.1',
    step3: '3.1',
    step4: '4.1'
  });

  // Sticky Scoring Matrix expand/collapse state (expanded by default so auditors see it while scrolling)
  const [matrixExpanded, setMatrixExpanded] = useState(true);

  // Sync local state if the selected audit changes
  useEffect(() => {
    if (!selectedAudit) return;
    setScores({
      ScoreCommentsA1: 'Pass',
      ScoreCommentsA2: 'Pass',
      ScoreCommentsA3: 'Pass',
      ScoreCommentsA4: 'Pass',
      ScoreCommentsB1: 'Pass',
      ScoreCommentsB2: 'Pass',
      ScoreCommentsB3: 'Pass',
      ScoreCommentsC1: 'Pass',
      ScoreCommentsC2: 'Pass',
      ScoreCommentsD1: 'Pass',
      ...(selectedAudit.checklistScores || {})
    });
    setComments({
      MsgA1: '',
      MsgA2: '',
      MsgA3: '',
      MsgA4: '',
      MsgB1: '',
      MsgB2: '',
      MsgB3: '',
      MsgC1: '',
      MsgC2: '',
      MsgD1: '',
      ...(selectedAudit.checklistComments || {})
    });
    setRandomChecks(selectedAudit.randomChecks || []);
    setOverallComment(selectedAudit.checklistOverallComment || '');
  }, [selectedAudit?.appId]);

  if (!selectedAudit) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-600 mb-4">No active audit selected.</p>
        <button
          onClick={() => setActiveScreen('AUDIT_LIST')}
          className="px-4 py-2 bg-[#064e2b] text-white rounded-xl text-sm font-semibold cursor-pointer"
        >
          Back To Audit List
        </button>
      </div>
    );
  }

  const outcomeEval = evaluateChecklistOutcome(scores);

  const handleScoreChange = (scoreId, val) => {
    if (isViewOnly) return;
    const nextScores = { ...scores, [scoreId]: val };
    setScores(nextScores);
    saveChecklistDraft(selectedAudit.appId, {
      scores: nextScores,
      comments,
      randomChecks,
      overallComment
    });
  };

  const handleCommentChange = (commentId, val) => {
    if (isViewOnly) return;
    const nextComments = { ...comments, [commentId]: val };
    setComments(nextComments);
    saveChecklistDraft(selectedAudit.appId, {
      scores,
      comments: nextComments,
      randomChecks,
      overallComment
    });
  };

  const handleAddRandomCheck = (e) => {
    e.preventDefault();
    if (!deliveryDate.trim() && !checkItem.trim() && !fsmsValue.trim()) return;
    const newRow = {
      id: `rc-${Date.now()}`,
      deliveryDate: deliveryDate.trim() || 'N/A',
      checklist: checkItem.trim() || 'Checked',
      fsms: fsmsValue.trim() || 'Verified'
    };
    const nextChecks = [...randomChecks, newRow];
    setRandomChecks(nextChecks);
    setDeliveryDate('');
    setCheckItem('');
    setFsmsValue('');
    saveChecklistDraft(selectedAudit.appId, {
      scores,
      comments,
      randomChecks: nextChecks,
      overallComment
    });
  };

  const handleDeleteRandomCheck = (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      const nextChecks = randomChecks.filter((r) => r.id !== id);
      setRandomChecks(nextChecks);
      saveChecklistDraft(selectedAudit.appId, {
        scores,
        comments,
        randomChecks: nextChecks,
        overallComment
      });
    }
  };

  const handleOverallCommentChange = (val) => {
    if (isViewOnly) return;
    setOverallComment(val);
    saveChecklistDraft(selectedAudit.appId, {
      scores,
      comments,
      randomChecks,
      overallComment: val
    });
  };

  const handleSubmitChecklist = (e) => {
    e.preventDefault();
    saveAuditChecklist(selectedAudit.appId, {
      scores,
      comments,
      randomChecks,
      overallComment
    });
    setActiveScreen('AUDIT_LIST');
  };

  const getScoreBadgeColor = (val) => {
    if (val === 'Pass') return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (val === 'L1') return 'bg-amber-100 text-amber-800 border-amber-300';
    if (val === 'L2') return 'bg-orange-100 text-orange-800 border-orange-300';
    if (val === 'L3') return 'bg-rose-100 text-rose-800 border-rose-300';
    return 'bg-slate-100 text-slate-600 border-slate-300';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90">
        {/* Top Emerald Header */}
        <div className="bg-gradient-to-r from-[#064e2b] to-[#0b663a] text-white px-5 py-4 rounded-t-2xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <ClipboardCheck className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                {isViewOnly ? 'View Check List' : 'Check List'}
              </h2>
              <p className="text-xs text-emerald-100/90">
                Audit ID: <span className="font-mono font-semibold">{selectedAudit.appId}</span> &bull; Store:{' '}
                <span className="font-semibold">{selectedAudit.storeName}</span> ({selectedAudit.storeId})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                outcomeEval.category === 'PASSED'
                  ? 'bg-emerald-500/20 text-emerald-100 border-emerald-300/40'
                  : outcomeEval.category === 'L3_FAIL'
                  ? 'bg-rose-500 text-white border-rose-300'
                  : 'bg-amber-500 text-white border-amber-300'
              }`}
            >
              Outcome: {outcomeEval.label}
            </span>
            {isViewOnly && (
              <button
                type="button"
                onClick={() => setActiveScreen('ADD_CHECKLIST')}
                className="px-3.5 py-1.5 bg-white text-[#064e2b] hover:bg-emerald-50 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Sticky SCORING MATRIX Bar (stays visible while scrolling through the checklist) */}
        <div className="sticky top-[56px] sm:top-[60px] z-20 border-b border-emerald-200/80 bg-emerald-50/95 backdrop-blur-md shadow-sm">
          <div className="bg-[#04391f] text-white px-4 lg:px-5 py-2 lg:py-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
              <h3 className="text-xs sm:text-sm lg:text-base font-bold tracking-wide">
                SCORING MATRIX
              </h3>
              <span
                className={`px-2.5 py-0.5 lg:px-3 lg:py-1 rounded-full text-[11px] lg:text-xs font-bold border ${
                  outcomeEval.category === 'PASSED'
                    ? 'bg-emerald-600 text-white border-emerald-400'
                    : outcomeEval.category === 'L3_FAIL'
                    ? 'bg-rose-600 text-white border-rose-400'
                    : 'bg-amber-500 text-white border-amber-300'
                }`}
              >
                {outcomeEval.label}
              </span>
              <span className="text-[11px] lg:text-xs text-emerald-200 font-mono">
                L1: {outcomeEval.l1Count} | L2: {outcomeEval.l2Count} | L3: {outcomeEval.l3Count}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {!isViewOnly && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] lg:text-xs bg-white/15 text-emerald-100 px-2.5 py-0.5 lg:px-3 lg:py-1 rounded-full">
                  <Save className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                  {selectedAudit.checklistDraftUpdatedAt
                    ? `Draft saved ${selectedAudit.checklistDraftUpdatedAt}`
                    : 'Auto-saves draft'}
                </span>
              )}
              <button
                type="button"
                onClick={() => setMatrixExpanded((prev) => !prev)}
                className="px-2.5 py-1 lg:px-3 lg:py-1.5 bg-white/15 hover:bg-white/25 text-white text-[11px] lg:text-xs font-semibold rounded-lg inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{matrixExpanded ? 'Hide Rules' : 'Show Rules'}</span>
                {matrixExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {matrixExpanded && (
            <div className="p-2.5 sm:p-3 lg:p-4 grid grid-cols-1 md:grid-cols-3 gap-2 lg:gap-3.5 text-[11px] sm:text-xs lg:text-sm">
              {SCORING_MATRIX.map((item) => (
                <div
                  key={item.level}
                  className="p-2.5 lg:p-4 rounded-xl bg-white border border-emerald-200/70 flex items-start gap-2.5 lg:gap-3 shadow-2xs"
                >
                  <span
                    className={`px-2 py-0.5 lg:px-2.5 lg:py-1 rounded-md font-bold text-[11px] lg:text-xs shrink-0 border ${getScoreBadgeColor(
                      item.level
                    )}`}
                  >
                    {item.level}
                  </span>
                  <span className="text-slate-700 leading-snug lg:leading-relaxed">{item.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3.5 sm:p-6 space-y-6">
          {/* 4 Steps Checklist Sections */}
          {CHECKLIST_STEPS.map((step) => {
            const activeCode = activeTabs[step.stepKey] || step.points[0].code;

            return (
              <div
                key={step.stepKey}
                className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white shadow-xs"
              >
                {/* Step Title Header */}
                <div className="bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold tracking-tight">
                      {step.stepTitle}
                    </h3>
                    {step.stepSubtitle && (
                      <p className="text-[11px] text-slate-300">{step.stepSubtitle}</p>
                    )}
                  </div>
                  <span className="text-[11px] bg-white/10 px-2.5 py-0.5 rounded-full text-emerald-200 font-medium">
                    {step.points.length} Audit Point{step.points.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Step Sub-Point Tabs */}
                <div className="bg-slate-50 px-3 sm:px-4 py-2.5 border-b border-slate-200 flex flex-wrap gap-2">
                  {step.points.map((pt) => {
                    const isTabActive = activeCode === pt.code;
                    const currentVal = scores[pt.scoreId] || 'Select Option';
                    return (
                      <button
                        key={pt.code}
                        type="button"
                        onClick={() =>
                          setActiveTabs((prev) => ({ ...prev, [step.stepKey]: pt.code }))
                        }
                        className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                          isTabActive
                            ? 'bg-[#064e2b] text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <span>{pt.code}</span>
                        <span
                          className={`px-2 py-0.5 text-[10px] rounded-full border ${getScoreBadgeColor(
                            currentVal
                          )}`}
                        >
                          {currentVal === 'Select Option' ? 'Unscored' : currentVal}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Active Tab Content */}
                {step.points
                  .filter((pt) => pt.code === activeCode)
                  .map((pt) => (
                    <div key={pt.code} className="p-3.5 sm:p-5">
                      {/* Mobile Stacked Card Layout */}
                      <div className="lg:hidden space-y-4">
                        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-1">
                            Audit Point {pt.code}
                          </div>
                          <div className="text-sm font-bold text-slate-900">{pt.auditPoint}</div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                            Checks
                          </h4>
                          <ul className="list-disc pl-4 space-y-1.5 text-xs sm:text-sm text-slate-700">
                            {pt.checks.map((chk, idx) => (
                              <li key={idx} className="leading-relaxed">
                                {chk}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                            Scoring Criteria
                          </h4>
                          <ul className="space-y-1.5">
                            {pt.scoring.map((sc, idx) => (
                              <li
                                key={idx}
                                className="text-xs leading-relaxed text-slate-700 pb-1.5 border-b border-slate-200 last:border-b-0 last:pb-0"
                              >
                                {sc}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200/70 space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              Score
                            </label>
                            {isViewOnly ? (
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getScoreBadgeColor(
                                  scores[pt.scoreId]
                                )}`}
                              >
                                {scores[pt.scoreId] || 'Not Scored'}
                              </span>
                            ) : (
                              <div className="space-y-2">
                                <div className="grid grid-cols-4 gap-1.5">
                                  {['Pass', 'L1', 'L2', 'L3'].map((opt) => {
                                    const active = scores[pt.scoreId] === opt;
                                    return (
                                      <button
                                        key={opt}
                                        type="button"
                                        onClick={() => handleScoreChange(pt.scoreId, opt)}
                                        className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                          active
                                            ? `${getScoreBadgeColor(opt)} ring-2 ring-offset-1 ring-[#064e2b]`
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                      >
                                        {opt}
                                      </button>
                                    );
                                  })}
                                </div>
                                <select
                                  value={scores[pt.scoreId] || 'Select Option'}
                                  onChange={(e) => handleScoreChange(pt.scoreId, e.target.value)}
                                  className="w-full h-10 px-3 text-sm font-semibold border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#064e2b]"
                                >
                                  {CHECKLIST_SCORE_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Comments
                            </label>
                            {isViewOnly ? (
                              <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 min-h-[54px]">
                                {comments[pt.commentId] || 'No comments recorded.'}
                              </div>
                            ) : (
                              <textarea
                                rows={3}
                                value={comments[pt.commentId] || ''}
                                onChange={(e) =>
                                  handleCommentChange(pt.commentId, e.target.value)
                                }
                                placeholder={`Add remarks for ${pt.code}...`}
                                className="w-full p-3 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#064e2b]"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Desktop Structured Table */}
                      <div className="hidden lg:block overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full table-fixed text-left border-collapse text-sm">
                          <thead>
                            <tr className="bg-[#064e2b] text-white text-xs uppercase tracking-wider">
                              <th className="py-3 px-3.5 border-r border-white/15 w-[15%]">
                                Audit Point ({pt.code})
                              </th>
                              <th className="py-3 px-3.5 border-r border-white/15 w-[44%]">
                                Checks
                              </th>
                              <th className="py-3 px-3 border-r border-white/15 w-[19%]">
                                Scoring Criteria
                              </th>
                              <th className="py-3 px-3.5 w-[22%]">Score / Comments</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="align-top bg-white">
                              <td className="p-3.5 border-r border-slate-200 font-bold text-[#064e2b] bg-emerald-50/40">
                                <div className="text-[11px] uppercase tracking-wider text-emerald-700 mb-1">
                                  Point {pt.code}
                                </div>
                                {pt.auditPoint}
                              </td>

                              <td className="p-3.5 border-r border-slate-200">
                                <ul className="list-disc pl-4 space-y-1.5 text-slate-700 text-xs sm:text-sm">
                                  {pt.checks.map((chk, idx) => (
                                    <li key={idx} className="leading-relaxed">
                                      {chk}
                                    </li>
                                  ))}
                                </ul>
                              </td>

                              <td className="p-3 border-r border-slate-200 bg-slate-50/60">
                                <ul className="space-y-1">
                                  {pt.scoring.map((sc, idx) => (
                                    <li
                                      key={idx}
                                      className="text-[11px] leading-snug text-slate-700 pb-1 border-b border-slate-200 last:border-b-0 last:pb-0"
                                    >
                                      {sc}
                                    </li>
                                  ))}
                                </ul>
                              </td>

                              <td className="p-3.5 space-y-3 bg-slate-50/40">
                                <div>
                                  <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Score
                                  </label>
                                  {isViewOnly ? (
                                    <span
                                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getScoreBadgeColor(
                                        scores[pt.scoreId]
                                      )}`}
                                    >
                                      {scores[pt.scoreId] || 'Not Scored'}
                                    </span>
                                  ) : (
                                    <select
                                      id={pt.scoreId}
                                      value={scores[pt.scoreId] || 'Select Option'}
                                      onChange={(e) =>
                                        handleScoreChange(pt.scoreId, e.target.value)
                                      }
                                      className="w-full h-9 px-2.5 text-sm font-semibold border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#064e2b]"
                                    >
                                      {CHECKLIST_SCORE_OPTIONS.map((opt) => (
                                        <option key={opt} value={opt}>
                                          {opt}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Comments
                                  </label>
                                  {isViewOnly ? (
                                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 min-h-[54px]">
                                      {comments[pt.commentId] || 'No comments recorded.'}
                                    </div>
                                  ) : (
                                    <textarea
                                      id={pt.commentId}
                                      rows={3}
                                      value={comments[pt.commentId] || ''}
                                      onChange={(e) =>
                                        handleCommentChange(pt.commentId, e.target.value)
                                      }
                                      placeholder={`Add remarks for ${pt.code}...`}
                                      className="w-full p-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#064e2b]"
                                    />
                                  )}
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
              </div>
            );
          })}

          {/* Random Checks Traceability Section (#khjgf) */}
          <div className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="bg-slate-900 text-white px-4 py-3">
              <h3 className="text-sm sm:text-base font-bold">Random Checks</h3>
              <p className="text-xs text-slate-300">
                Random check of 3 previous deliveries — cross-referencing Halal Delivery Checklist &amp; FSMS
              </p>
            </div>

            <div className="p-4 space-y-4">
              {!isViewOnly && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Date Of Delivery
                    </label>
                    <input
                      type="text"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      placeholder="e.g. 08-Nov-2026"
                      className="w-full h-9 px-3 text-xs sm:text-sm border border-slate-200 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Check List
                    </label>
                    <input
                      type="text"
                      value={checkItem}
                      onChange={(e) => setCheckItem(e.target.value)}
                      placeholder="Delivery Check List status"
                      className="w-full h-9 px-3 text-xs sm:text-sm border border-slate-200 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">FSMS</label>
                    <input
                      type="text"
                      value={fsmsValue}
                      onChange={(e) => setFsmsValue(e.target.value)}
                      placeholder="FSMS record status"
                      className="w-full h-9 px-3 text-xs sm:text-sm border border-slate-200 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handleAddRandomCheck}
                      className="w-full sm:w-auto px-4 h-9 bg-[#064e2b] hover:bg-[#053e22] text-white text-xs sm:text-sm font-semibold rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table id="khjgf" className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#064e2b] text-white text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">Date Of Delivery</th>
                      <th className="py-2.5 px-3">Check List</th>
                      <th className="py-2.5 px-3">FSMS</th>
                      {!isViewOnly && <th className="py-2.5 px-3 text-center w-24">Delete</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {randomChecks.length === 0 ? (
                      <tr>
                        <td
                          colSpan={isViewOnly ? 3 : 4}
                          className="py-6 text-center text-slate-500"
                        >
                          No random delivery check records added yet.
                        </td>
                      </tr>
                    ) : (
                      randomChecks.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-medium text-slate-900">
                            {row.deliveryDate}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">{row.checklist}</td>
                          <td className="py-2.5 px-3 text-slate-700">{row.fsms}</td>
                          {!isViewOnly && (
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteRandomCheck(row.id)}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 text-xs font-semibold rounded-lg inline-flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Overall Checklist Comment & Submit Button */}
          <form onSubmit={handleSubmitChecklist} className="space-y-3 pt-2 border-t border-slate-100">
            <label className="block text-xs sm:text-sm font-bold text-slate-800">
              Overall Checklist Comment
            </label>
            {isViewOnly ? (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 min-h-[60px]">
                {overallComment || 'No overall checklist comment provided.'}
              </div>
            ) : (
              <textarea
                rows={3}
                value={overallComment}
                onChange={(e) => handleOverallCommentChange(e.target.value)}
                placeholder="Enter overall checklist summary or remarks..."
                className="w-full p-3.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#064e2b]"
              />
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {isViewOnly ? (
                <button
                  type="button"
                  onClick={() => setActiveScreen('ADD_CHECKLIST')}
                  className="px-5 py-2.5 bg-[#064e2b] hover:bg-[#053e22] text-white text-xs sm:text-sm font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Check List
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSyncing}
                  className="px-6 py-2.5 bg-[#064e2b] hover:bg-[#053e22] disabled:opacity-70 text-white text-xs sm:text-sm font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {isSyncing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {isSyncing ? 'Submitting...' : 'Submit Check List'}
                </button>
              )}

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
          </form>
        </div>
      </div>
    </div>
  );
}
