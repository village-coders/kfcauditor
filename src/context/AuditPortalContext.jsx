import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { evaluateChecklistOutcome } from '../data/kfcAuditData';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { apiRequest } from '../services/apiClient';

const AuditPortalContext = createContext(null);

function matchesLoggedInStore(audit, currentStore) {
  if (!currentStore) return true;
  const targetCode = String(
    currentStore.branchCode || currentStore.code || currentStore.id || ''
  )
    .trim()
    .toLowerCase();
  const targetName = String(currentStore.shortName || currentStore.name || '')
    .trim()
    .toLowerCase();
  const auditCode = String(audit.storeId || '').trim().toLowerCase();
  const auditName = String(audit.storeName || '').trim().toLowerCase();

  if (targetCode && auditCode && targetCode === auditCode) return true;
  if (targetName && auditName && targetName === auditName) return true;
  return false;
}

function mapBackendCategoryToLocal(category) {
  if (category === 'Passed') return 'PASSED';
  if (category === 'L3 Critical Fail') return 'L3_FAIL';
  if (category === 'Other Fail') return 'OTHER_FAIL';
  return 'PENDING';
}

function mapLocalCategoryToBackend(statusCategory, recommendedCategory, explicitBackendCategory) {
  if (explicitBackendCategory) return explicitBackendCategory;
  if (statusCategory === 'PASSED') return 'Passed';
  if (statusCategory === 'L3_FAIL') return 'L3 Critical Fail';
  if (statusCategory === 'OTHER_FAIL') return 'Other Fail';
  if (recommendedCategory === 'L3_FAIL') return 'L3 Critical Fail';
  if (recommendedCategory === 'OTHER_FAIL') return 'Other Fail';
  return 'Recommend For Pass';
}

function fromBackendAudit(doc) {
  const idStr = String(doc._id || doc.id || '');
  const appId = doc.appId || String(doc.legacyId || idStr);
  const outcomeSubmitted = Boolean(doc.outcomeSubmitted || doc.signatureAuditor || doc.signatureStoreRep);
  const checklistSubmitted = Boolean(doc.checklistSubmitted || outcomeSubmitted);
  const products = Array.isArray(doc.products) ? doc.products : [];
  const productsSubmitted = Boolean(doc.productsSubmitted || products.length > 0 || checklistSubmitted);

  return {
    backendId: idStr,
    appId,
    assignmentId: String(doc.assignmentId || ''),
    franchiseeId: String(doc.franchiseeId || ''),
    franchiseeName: doc.franchisee || '',
    storeId: String(doc.branchCode || doc.storeId || ''),
    storeName: doc.storeName || '',
    address: doc.address || '',
    storeRep: doc.storeRepresentative || 'Store Manager',
    designation: doc.designation || 'Shift Runner',
    auditor: doc.auditor || '',
    auditType: doc.auditType || 'Existing Store',
    sessionRound: doc.session || 'Round Two 2026',
    date: doc.auditDate || formatAuditDate(),
    timeIn: doc.timeIn || '09:00:00',
    timeOut: doc.timeOut || '',
    productsSubmitted,
    checklistSubmitted,
    outcomeSubmitted,
    products,
    productComment: doc.productComment || '',
    checklistScores: doc.checklistScores || {},
    checklistComments: doc.checklistComments || {},
    randomChecks: Array.isArray(doc.randomChecks) ? doc.randomChecks : [],
    checklistOverallComment: doc.checklistOverallComment || doc.complianceSummary?.auditorNotes || '',
    outcomeData: doc.outcomeData || (outcomeSubmitted ? {
      ncrDate: doc.auditDate || '',
      ncrSignature: doc.signatureAuditor || '',
      ncrPrintName: doc.auditor || '',
      rsrResponse: doc.complianceSummary?.auditorNotes || '',
      rsrSignature: doc.signatureStoreRep || '',
      rsrPrintName: doc.storeRepresentative || ''
    } : null),
    backendCategory: doc.category || '',
    recommendationReason: doc.recommendationReason || '',
    finalized: Boolean(doc.finalized),
    finalizedAt: doc.finalizedAt || '',
    statusCategory: mapBackendCategoryToLocal(doc.category)
  };
}

function toBackendAuditPayload(audit) {
  return {
    appId: audit.appId,
    assignmentId: audit.assignmentId || '',
    storeId: audit.storeId,
    storeName: audit.storeName,
    branchCode: audit.storeId || '0000',
    address: audit.address,
    franchisee: audit.franchiseeName,
    franchiseeId: Number(audit.franchiseeId) || 0,
    auditor: audit.auditor,
    auditDate: audit.date,
    timeIn: audit.timeIn,
    timeOut: audit.timeOut,
    session: audit.sessionRound || 'Round Two 2026',
    category: mapLocalCategoryToBackend(
      audit.statusCategory,
      audit.recommendedCategory,
      audit.backendCategory
    ),
    storeRepresentative: audit.storeRep,
    designation: audit.designation,
    auditType: audit.auditType,
    signatureAuditor: audit.outcomeData?.ncrSignature || '',
    signatureStoreRep: audit.outcomeData?.rsrSignature || '',
    productsSubmitted: audit.productsSubmitted,
    checklistSubmitted: audit.checklistSubmitted,
    outcomeSubmitted: audit.outcomeSubmitted,
    products: audit.products,
    productComment: audit.productComment,
    checklistScores: audit.checklistScores,
    checklistComments: audit.checklistComments,
    randomChecks: audit.randomChecks,
    checklistOverallComment: audit.checklistOverallComment,
    outcomeData: audit.outcomeData,
    recommendationReason: audit.recommendationReason || '',
    finalized: Boolean(audit.finalized),
    finalizedAt: audit.finalizedAt || '',
    complianceSummary: {
      auditorNotes:
        audit.recommendationReason ||
        audit.checklistOverallComment ||
        audit.outcomeData?.rsrResponse ||
        ''
    }
  };
}

const AUDITS_STORAGE_KEY = 'kfc_hfa_portal_audits_v1';
const ACTIVE_SCREEN_KEY = 'kfc_hfa_active_screen_v1';
const SELECTED_AUDIT_KEY = 'kfc_hfa_selected_audit_v1';
const PROTOCOL_KEY = 'kfc_hfa_protocol_accepted';

const MONTHS_LOWER = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

function parseLocalDay(dateStr) {
  if (!dateStr) return null;
  const s = String(dateStr).trim();

  const dmyText = s.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  if (dmyText) {
    const m = MONTHS_LOWER.indexOf(dmyText[2].toLowerCase());
    if (m >= 0) return new Date(Number(dmyText[3]), m, Number(dmyText[1])).getTime();
  }

  const ymd = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (ymd) {
    return new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3])).getTime();
  }

  const dmySlash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmySlash) {
    return new Date(Number(dmySlash[3]), Number(dmySlash[2]) - 1, Number(dmySlash[1])).getTime();
  }

  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime())) {
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()).getTime();
  }
  return null;
}

function isAuditForCurrentAssignment(audit, currentUser) {
  if (!audit) return false;
  const currentStore = currentUser?.currentStore;
  const activeAssignmentId = String(currentStore?.assignmentId || '').trim();

  // Direct match by assignmentId (audits created in this assignment)
  if (activeAssignmentId && audit.assignmentId && String(audit.assignmentId) === activeAssignmentId) {
    return true;
  }

  // Otherwise match by current auditor + date within the active assignment window [startDate, endDate]
  const activeUsername = String(currentUser?.username || '').trim().toLowerCase();
  const auditAuditor = String(audit.auditor || '').trim().toLowerCase();
  if (activeUsername && auditAuditor && activeUsername !== auditAuditor) {
    return false;
  }

  const auditTs = parseLocalDay(audit.date);
  if (auditTs === null) return false;

  const startTs = parseLocalDay(currentStore?.startDate || currentStore?.date);
  const endTs = parseLocalDay(currentStore?.endDate || currentStore?.startDate || currentStore?.date);

  if (startTs !== null) {
    const effectiveEnd = endTs !== null ? endTs : startTs;
    return auditTs >= startTs && auditTs <= effectiveEnd;
  }

  // Fallback if assignment dates are absent: only audits created today by this auditor
  const todayTs = parseLocalDay(formatAuditDate());
  return auditTs === todayTs;
}

function formatAuditDate(d = new Date()) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(d.getDate()).padStart(2, '0');
  const mon = months[d.getMonth()];
  const yr = d.getFullYear();
  return `${day}-${mon}-${yr}`;
}

function formatTime(d = new Date()) {
  return d.toTimeString().split(' ')[0];
}

export function AuditPortalProvider({ children }) {
  const { currentUser } = useAuth();
  const toast = useToast();
  const [activeScreen, setActiveScreen] = useState(() => {
    return localStorage.getItem(ACTIVE_SCREEN_KEY) || 'DASHBOARD';
  });
  const [selectedAuditId, setSelectedAuditId] = useState(() => {
    return localStorage.getItem(SELECTED_AUDIT_KEY) || null;
  });
  const [protocolAccepted, setProtocolAccepted] = useState(() => {
    return sessionStorage.getItem(PROTOCOL_KEY) === 'true';
  });
  const [showProtocolModal, setShowProtocolModal] = useState(false);
  const [showNewAuditModal, setShowNewAuditModal] = useState(false);
  const [isLoadingAudits, setIsLoadingAudits] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const draftSyncTimerRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_SCREEN_KEY, activeScreen);
    } catch {
      // ignore
    }
  }, [activeScreen]);

  useEffect(() => {
    try {
      if (selectedAuditId) {
        localStorage.setItem(SELECTED_AUDIT_KEY, selectedAuditId);
      }
    } catch {
      // ignore
    }
  }, [selectedAuditId]);

  const [audits, setAudits] = useState(() => {
    try {
      const saved = localStorage.getItem(AUDITS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(AUDITS_STORAGE_KEY, JSON.stringify(audits));
    } catch {
      // ignore
    }
  }, [audits]);

  // Fetch all audits (including site history for Passed, Other Failed, L3) for the logged-in store
  useEffect(() => {
    let cancelled = false;
    async function syncFromBackend() {
      if (!currentUser?.username) return;
      setIsLoadingAudits(true);
      const storeQuery =
        currentUser?.currentStore?.branchCode ||
        currentUser?.currentStore?.code ||
        currentUser?.currentStore?.shortName ||
        currentUser?.currentStore?.name ||
        '';
      try {
        const res = await apiRequest(
          `/audits?search=${encodeURIComponent(storeQuery)}&limit=500`
        );
        const list = Array.isArray(res?.data) ? res.data : [];
        if (!cancelled && list.length > 0) {
          const mapped = list
            .map(fromBackendAudit)
            .filter((a) => matchesLoggedInStore(a, currentUser?.currentStore));
          setAudits((prev) => {
            // Preserve local drafts that have not been submitted yet
            const byAppId = new Map(prev.map((a) => [a.appId, a]));
            const merged = mapped.map((remote) => {
              const local = byAppId.get(remote.appId);
              if (local && local.checklistDraftUpdatedAt && !remote.checklistSubmitted) {
                return { ...remote, ...local, backendId: remote.backendId };
              }
              return remote;
            });
            // Keep any unsynced local-only audits at the top
            const remoteIds = new Set(mapped.map((m) => m.appId));
            const localOnly = prev.filter((a) => !remoteIds.has(a.appId) && !a.backendId);
            return [...localOnly, ...merged];
          });
        }
      } catch {
        // Offline / backend not running — keep localStorage audits
      } finally {
        if (!cancelled) setIsLoadingAudits(false);
      }
    }
    syncFromBackend();
    return () => {
      cancelled = true;
    };
  }, [
    currentUser?.username,
    currentUser?.currentStore?.code,
    currentUser?.currentStore?.branchCode,
    currentUser?.currentStore?.shortName
  ]);

  const syncAuditToBackend = async (auditObj, isNew = false, { silent = false } = {}) => {
    setIsSyncing(true);
    try {
      const payload = toBackendAuditPayload(auditObj);
      if (isNew || !auditObj.backendId) {
        const res = await apiRequest('/audits', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        const createdId = String(res?.data?._id || res?.data?.id || '');
        if (createdId) {
          setAudits((prev) =>
            prev.map((a) => (a.appId === auditObj.appId ? { ...a, backendId: createdId } : a))
          );
        }
      } else {
        try {
          await apiRequest(`/audits/${encodeURIComponent(auditObj.backendId)}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
          });
        } catch (putErr) {
          // If record was not found by backendId, create it in MongoDB
          if (putErr?.status === 404) {
            const res = await apiRequest('/audits', {
              method: 'POST',
              body: JSON.stringify(payload)
            });
            const createdId = String(res?.data?._id || res?.data?.id || '');
            if (createdId) {
              setAudits((prev) =>
                prev.map((a) => (a.appId === auditObj.appId ? { ...a, backendId: createdId } : a))
              );
            }
          } else {
            throw putErr;
          }
        }
      }
    } catch (err) {
      if (!silent && err?.status && err.status >= 400) {
        toast.error(err.message || 'Could not save audit update to database.', 'Database Error');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const acceptProtocol = () => {
    setProtocolAccepted(true);
    sessionStorage.setItem(PROTOCOL_KEY, 'true');
    setShowProtocolModal(false);
    toast.success('KFC Audit Protocol accepted. You can now start a new audit.', 'Protocol Accepted');
  };

  const storeAudits = useMemo(
    () => audits.filter((a) => matchesLoggedInStore(a, currentUser?.currentStore)),
    [audits, currentUser?.currentStore]
  );

  // Split audits into Current Assignment (top) vs Past Store Audits (bottom), sorted newest-first
  const { currentAssignmentAudits, pastAudits } = useMemo(() => {
    const current = [];
    const past = [];
    storeAudits.forEach((a) => {
      if (isAuditForCurrentAssignment(a, currentUser)) {
        current.push(a);
      } else {
        past.push(a);
      }
    });
    const byDateDesc = (a, b) => (parseLocalDay(b.date) || 0) - (parseLocalDay(a.date) || 0);
    current.sort(byDateDesc);
    past.sort(byDateDesc);
    return { currentAssignmentAudits: current, pastAudits: past };
  }, [storeAudits, currentUser]);

  // Only disable "New Audit" if the auditor has already created an audit for the current assignment
  const hasAddedAudit = currentAssignmentAudits.length > 0;

  const selectedAudit =
    storeAudits.find((a) => a.appId === selectedAuditId) ||
    currentAssignmentAudits[0] ||
    pastAudits[0] ||
    null;

  // Create New Audit (from Dashboard or Audit List modal)
  const createNewAudit = ({ franchiseeId, franchiseeName, storeId, storeName, address, storeRep, designation, auditType }) => {
    if (hasAddedAudit) {
      toast.warning('An audit has already been added for this assignment. You cannot add another one.', 'Audit Already Added');
      setShowNewAuditModal(false);
      return null;
    }
    const newId = String(Math.floor(262940 + Math.random() * 9000));
    const newAudit = {
      appId: newId,
      assignmentId: currentUser?.currentStore?.assignmentId || '',
      franchiseeId: franchiseeId || currentUser?.currentStore?.franchiseeId || '',
      franchiseeName: franchiseeName || currentUser?.currentStore?.franchiseeName || '',
      storeId: storeId || currentUser?.currentStore?.code || '',
      storeName: storeName || currentUser?.currentStore?.shortName || '',
      address: address || currentUser?.currentStore?.address || '',
      storeRep: storeRep || 'Store Manager',
      designation: designation || 'Shift Runner',
      auditor: currentUser?.username || '',
      auditType: auditType === '...Select Option...' ? 'Existing Store' : auditType,
      sessionRound: 'Round Three 2026',
      date: formatAuditDate(),
      timeIn: formatTime(),
      timeOut: '',
      productsSubmitted: false,
      checklistSubmitted: false,
      outcomeSubmitted: false,
      products: [],
      productComment: '',
      checklistScores: {
        ScoreCommentsA1: 'Select Option',
        ScoreCommentsA2: 'Select Option',
        ScoreCommentsA3: 'Select Option',
        ScoreCommentsA4: 'Select Option',
        ScoreCommentsB1: 'Select Option',
        ScoreCommentsB2: 'Select Option',
        ScoreCommentsB3: 'Select Option',
        ScoreCommentsC1: 'Select Option',
        ScoreCommentsC2: 'Select Option',
        ScoreCommentsD1: 'Select Option'
      },
      checklistComments: {
        MsgA1: '',
        MsgA2: '',
        MsgA3: '',
        MsgA4: '',
        MsgB1: '',
        MsgB2: '',
        MsgB3: '',
        MsgC1: '',
        MsgC2: '',
        MsgD1: ''
      },
      randomChecks: [],
      checklistOverallComment: '',
      outcomeData: null,
      statusCategory: 'PENDING'
    };

    setAudits((prev) => [newAudit, ...prev]);
    setSelectedAuditId(newId);
    setShowNewAuditModal(false);
    setActiveScreen('AUDIT_LIST');
    syncAuditToBackend(newAudit, true);
    toast.success(`Audit #${newId} created for ${newAudit.storeName}.`, 'New Audit Created');
    return newAudit;
  };

  // Edit existing Audit metadata
  const updateAuditMetadata = (appId, { address, storeRep, designation, auditType }) => {
    const target = audits.find((a) => a.appId === appId);
    if (!target) return;
    const updatedAudit = {
      ...target,
      address: address ?? target.address,
      storeRep: storeRep ?? target.storeRep,
      designation: designation ?? target.designation,
      auditType: auditType ?? target.auditType
    };
    setAudits((prev) => prev.map((a) => (a.appId === appId ? updatedAudit : a)));
    syncAuditToBackend(updatedAudit);
    toast.success(`Audit #${appId} details saved.`, 'Audit Updated');
  };

  // Add products to an audit
  const addProductsToAudit = (appId, newProducts) => {
    const target = audits.find((a) => a.appId === appId);
    if (!target) return;
    const existingNames = new Set(target.products.map((p) => p.name.toLowerCase()));
    const uniqueAdditions = newProducts.filter((p) => !existingNames.has(p.name.toLowerCase()));
    const updatedList = [...target.products, ...uniqueAdditions];
    const updatedAudit = {
      ...target,
      products: updatedList,
      productsSubmitted: updatedList.length > 0
    };
    setAudits((prev) => prev.map((a) => (a.appId === appId ? updatedAudit : a)));
    syncAuditToBackend(updatedAudit);
  };

  const removeProductFromAudit = (appId, productName) => {
    const target = audits.find((a) => a.appId === appId);
    if (!target) return;
    const updatedList = target.products.filter((p) => p.name !== productName);
    const updatedAudit = {
      ...target,
      products: updatedList,
      productsSubmitted: updatedList.length > 0
    };
    setAudits((prev) => prev.map((a) => (a.appId === appId ? updatedAudit : a)));
    syncAuditToBackend(updatedAudit);
  };

  const updateProductComment = (appId, comment) => {
    const target = audits.find((a) => a.appId === appId);
    if (!target) return;
    const updatedAudit = {
      ...target,
      productComment: comment,
      productsSubmitted: target.products.length > 0 || Boolean(comment?.trim())
    };
    setAudits((prev) => prev.map((a) => (a.appId === appId ? updatedAudit : a)));
    syncAuditToBackend(updatedAudit);
  };

  // Auto-save Check List draft to localStorage & MongoDB (debounced) without submitting/locking it
  const saveChecklistDraft = (appId, { scores, comments, randomChecks, overallComment }) => {
    const target = audits.find((a) => a.appId === appId);
    if (!target) return;
    const updatedAudit = {
      ...target,
      checklistScores: scores ?? target.checklistScores,
      checklistComments: comments ?? target.checklistComments,
      randomChecks: randomChecks ?? target.randomChecks,
      checklistOverallComment: overallComment ?? target.checklistOverallComment,
      checklistDraftUpdatedAt: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };
    setAudits((prev) => prev.map((a) => (a.appId === appId ? updatedAudit : a)));

    if (draftSyncTimerRef.current) {
      clearTimeout(draftSyncTimerRef.current);
    }
    draftSyncTimerRef.current = setTimeout(() => {
      syncAuditToBackend(updatedAudit, false, { silent: true });
    }, 600);
  };

  // Save Check List (final submit)
  const saveAuditChecklist = (appId, { scores, comments, randomChecks, overallComment }) => {
    if (draftSyncTimerRef.current) {
      clearTimeout(draftSyncTimerRef.current);
    }
    const target = audits.find((a) => a.appId === appId);
    if (!target) return;
    const evalResult = evaluateChecklistOutcome(scores);
    const updatedAudit = {
      ...target,
      checklistScores: scores,
      checklistComments: comments,
      randomChecks: randomChecks || target.randomChecks,
      checklistOverallComment: overallComment,
      checklistSubmitted: true,
      statusCategory: target.outcomeSubmitted ? evalResult.category : 'PENDING'
    };
    setAudits((prev) => prev.map((a) => (a.appId === appId ? updatedAudit : a)));
    syncAuditToBackend(updatedAudit);
    toast.success('Check List submitted! Proceed to Outcome Sheet.', 'Check List Submitted');
  };

  // Save Outcome Sheet (signatures & representation; Time Out is recorded when auditor finishes via Recommend)
  const saveAuditOutcome = (appId, outcomePayload) => {
    const target = audits.find((a) => a.appId === appId);
    if (!target) return;
    const updatedAudit = {
      ...target,
      storeRep: outcomePayload.storeRep || target.storeRep,
      designation: outcomePayload.designation || target.designation,
      auditor: outcomePayload.auditorName || target.auditor,
      timeIn: outcomePayload.timeIn || target.timeIn,
      outcomeSubmitted: true,
      outcomeData: outcomePayload
    };
    setAudits((prev) => prev.map((a) => (a.appId === appId ? updatedAudit : a)));
    syncAuditToBackend(updatedAudit);
    toast.success(
      'Outcome Sheet saved. Review the checklist summary and submit your final recommendation to Admin.',
      'Outcome Sheet Saved'
    );
  };

  // Finalize Audit & Submit Auditor Recommendation to HFA Admin (records exact Time Out)
  const submitFinalRecommendation = async (appId, { backendCategory, label, reason }) => {
    const target = audits.find((a) => a.appId === appId);
    if (!target) return false;
    const localStatus =
      backendCategory === 'L3 Critical Fail'
        ? 'L3_FAIL'
        : backendCategory === 'Other Fail'
        ? 'OTHER_FAIL'
        : 'PENDING';
    const finalizedAt = new Date().toLocaleString();
    const completedTimeOut = formatTime();
    const updatedAudit = {
      ...target,
      backendCategory,
      statusCategory: localStatus,
      recommendationReason: (reason || '').trim(),
      finalized: true,
      finalizedAt,
      timeOut: completedTimeOut
    };
    setAudits((prev) => prev.map((a) => (a.appId === appId ? updatedAudit : a)));
    await syncAuditToBackend(updatedAudit);
    toast.success(
      `Audit #${appId} finalized at ${completedTimeOut} and sent to HFA Admin as "${label}".`,
      'Audit Finished & Submitted'
    );
    return true;
  };

  return (
    <AuditPortalContext.Provider
      value={{
        activeScreen,
        setActiveScreen,
        selectedAuditId,
        setSelectedAuditId,
        selectedAudit,
        protocolAccepted,
        acceptProtocol,
        showProtocolModal,
        setShowProtocolModal,
        showNewAuditModal,
        setShowNewAuditModal,
        isLoadingAudits,
        isSyncing,
        hasAddedAudit,
        audits: storeAudits,
        currentAssignmentAudits,
        pastAudits,
        createNewAudit,
        updateAuditMetadata,
        addProductsToAudit,
        removeProductFromAudit,
        updateProductComment,
        saveChecklistDraft,
        saveAuditChecklist,
        saveAuditOutcome,
        submitFinalRecommendation
      }}
    >
      {children}
    </AuditPortalContext.Provider>
  );
}

export function useAuditPortal() {
  const ctx = useContext(AuditPortalContext);
  if (!ctx) {
    throw new Error('useAuditPortal must be used within AuditPortalProvider');
  }
  return ctx;
}

