/**
 * questionnaireDraft.js
 * Utility functions for managing the client-side questionnaire draft in sessionStorage
 * and formatting responses according to the BetterWithAarkesh response contract (2026-10-16-v1).
 */

import config from '../data/questionnaireConfig.json';

const DRAFT_ID_KEY = 'bwa_booking_draft_id';
const DRAFT_PREFIX = 'bwa_q_draft_';
const LOCAL_DRAFT_KEY = 'bwa_saved_questionnaire_draft';

/**
 * Check if sessionStorage is available and functional
 */
export function isSessionStorageAvailable() {
  try {
    const testKey = '__bwa_storage_test__';
    sessionStorage.setItem(testKey, testKey);
    sessionStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get or create a random booking_draft_id for the current session.
 * Re-uses existing draftId from localStorage if a previous unbooked draft exists.
 */
export function getOrCreateBookingDraftId() {
  let draftId = null;
  if (isSessionStorageAvailable()) {
    draftId = sessionStorage.getItem(DRAFT_ID_KEY);
  }
  if (!draftId) {
    try {
      const rawLocal = localStorage.getItem(LOCAL_DRAFT_KEY);
      if (rawLocal) {
        const parsed = JSON.parse(rawLocal);
        if (parsed?.draftId) {
          draftId = parsed.draftId;
        }
      }
    } catch (e) {}
  }
  if (!draftId) {
    draftId = `bwa_draft_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
  if (isSessionStorageAvailable()) {
    try {
      sessionStorage.setItem(DRAFT_ID_KEY, draftId);
    } catch (e) {
      console.warn('Could not persist booking_draft_id to sessionStorage:', e);
    }
  }
  return draftId;
}

/**
 * Flatten all questions from the configuration into an ordered array of 45 questions
 */
export function getAllQuestions() {
  const list = [];
  if (!config?.sections) return list;
  config.sections.forEach((section) => {
    (section.questions || []).forEach((q) => {
      list.push({
        ...q,
        sectionId: section.id,
        sectionTitle: section.title,
        sectionIntro: section.intro,
      });
    });
  });
  return list;
}

/**
 * Load draft from sessionStorage or localStorage for the given draftId.
 */
export function loadQuestionnaireDraft(draftId) {
  // 1. Try sessionStorage first
  if (draftId && isSessionStorageAvailable()) {
    try {
      const raw = sessionStorage.getItem(`${DRAFT_PREFIX}${draftId}`);
      if (raw) return JSON.parse(raw);
    } catch (err) {}
  }

  // 2. Fallback to localStorage (survives back navigation, tab reload, browser restarts)
  try {
    const rawLocal = localStorage.getItem(LOCAL_DRAFT_KEY);
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal);
      if (parsed?.draftData) {
        // Sync into current sessionStorage
        if (draftId && isSessionStorageAvailable()) {
          try {
            sessionStorage.setItem(`${DRAFT_PREFIX}${draftId}`, JSON.stringify(parsed.draftData));
          } catch (e) {}
        }
        return parsed.draftData;
      }
    }
  } catch (err) {}

  return null;
}

/**
 * Save draft to both sessionStorage and localStorage.
 * Returns { success: boolean, storageAvailable: boolean, error?: string }
 */
export function saveQuestionnaireDraft(draftId, draftData) {
  const available = isSessionStorageAvailable();
  if (!draftId) {
    return { success: false, storageAvailable: available, error: 'No draft ID provided' };
  }
  try {
    if (available) {
      sessionStorage.setItem(`${DRAFT_PREFIX}${draftId}`, JSON.stringify(draftData));
    }
  } catch (err) {}
  try {
    localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify({
      draftId,
      draftData,
      savedAt: Date.now()
    }));
  } catch (err) {}
  return { success: true, storageAvailable: true };
}

/**
 * Remove questionnaire draft from sessionStorage and localStorage.
 */
export function clearQuestionnaireDraft(draftId) {
  try {
    if (draftId && isSessionStorageAvailable()) {
      sessionStorage.removeItem(`${DRAFT_PREFIX}${draftId}`);
    }
    if (isSessionStorageAvailable()) {
      sessionStorage.removeItem(DRAFT_ID_KEY);
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (key && (key.startsWith(DRAFT_PREFIX) || key === DRAFT_ID_KEY)) {
          sessionStorage.removeItem(key);
        }
      }
    }
    // Remove persistent draft so fresh booking starts clean
    localStorage.removeItem(LOCAL_DRAFT_KEY);
  } catch (err) {
    console.error('Error clearing questionnaire draft:', err);
  }
}

/**
 * Calculate the number of questions that have an 'answered' state in the draft.
 */
export function countAnsweredQuestions(draft) {
  if (!draft || !draft.answers) return 0;
  let count = 0;
  Object.values(draft.answers).forEach((ans) => {
    if (ans && ans.state === 'answered') {
      count++;
    }
  });
  return count;
}

/**
 * Build the exact response payload conforming to response_contract (2026-10-16-v1).
 * All 45 questions are included in fixed order.
 */
export function buildResponseContractPayload(draft, draftId) {
  const resolvedDraftId = draftId || draft?.booking_draft_id || getOrCreateBookingDraftId();
  const allQuestions = getAllQuestions();
  const answersMap = draft?.answers || {};

  const responses = allQuestions.map((q) => {
    const rawAnswer = answersMap[q.id];

    if (!rawAnswer || rawAnswer.state === 'unanswered') {
      return {
        question_id: q.id,
        state: 'unanswered',
        selected_option_ids: [],
        text: null,
        other_text_by_option_id: {},
      };
    }

    if (rawAnswer.state === 'skipped') {
      return {
        question_id: q.id,
        state: 'skipped',
        selected_option_ids: [],
        text: null,
        other_text_by_option_id: {},
      };
    }

    // State is 'answered'
    // Ensure write-in text is only retained for options that are actively selected
    const activeOptionIds = Array.isArray(rawAnswer.selected_option_ids)
      ? rawAnswer.selected_option_ids
      : [];

    const cleanOtherText = {};
    if (rawAnswer.other_text_by_option_id && typeof rawAnswer.other_text_by_option_id === 'object') {
      activeOptionIds.forEach((optId) => {
        const txt = rawAnswer.other_text_by_option_id[optId];
        if (typeof txt === 'string' && txt.trim().length > 0) {
          cleanOtherText[optId] = txt.slice(0, 300);
        }
      });
    }

    let cleanText = null;
    if (q.type === 'written_answer' && typeof rawAnswer.text === 'string') {
      cleanText = rawAnswer.text.slice(0, 2000);
    }

    return {
      question_id: q.id,
      state: 'answered',
      selected_option_ids: activeOptionIds,
      text: cleanText,
      other_text_by_option_id: cleanOtherText,
    };
  });

  return {
    questionnaire_id: config.questionnaire_id || 'bwa_optional_coaching',
    content_version: config.content_version || '2026-10-16-v1',
    booking_draft_id: resolvedDraftId,
    opened: !!draft?.opened,
    responses,
  };
}

export default {
  isSessionStorageAvailable,
  getOrCreateBookingDraftId,
  getAllQuestions,
  loadQuestionnaireDraft,
  saveQuestionnaireDraft,
  clearQuestionnaireDraft,
  countAnsweredQuestions,
  buildResponseContractPayload,
};
