/**
 * questionnaireDraft.js
 * Utility functions for managing the client-side questionnaire draft in sessionStorage
 * and formatting responses according to the BetterWithAarkesh response contract (2026-10-16-v1).
 */

import config from '../data/questionnaireConfig.json';

const DRAFT_ID_KEY = 'bwa_booking_draft_id';
const DRAFT_PREFIX = 'bwa_q_draft_';

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
 */
export function getOrCreateBookingDraftId() {
  if (!isSessionStorageAvailable()) {
    return `bwa_draft_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
  let draftId = sessionStorage.getItem(DRAFT_ID_KEY);
  if (!draftId) {
    draftId = `bwa_draft_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
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
 * Load draft from sessionStorage for the given draftId.
 */
export function loadQuestionnaireDraft(draftId) {
  if (!draftId || !isSessionStorageAvailable()) return null;
  try {
    const raw = sessionStorage.getItem(`${DRAFT_PREFIX}${draftId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load questionnaire draft from sessionStorage:', err);
    return null;
  }
}

/**
 * Save draft to sessionStorage.
 * Returns { success: boolean, storageAvailable: boolean, error?: string }
 */
export function saveQuestionnaireDraft(draftId, draftData) {
  const available = isSessionStorageAvailable();
  if (!available) {
    return { success: false, storageAvailable: false, error: 'Session storage unavailable' };
  }
  if (!draftId) {
    return { success: false, storageAvailable: true, error: 'No draft ID provided' };
  }
  try {
    sessionStorage.setItem(`${DRAFT_PREFIX}${draftId}`, JSON.stringify(draftData));
    return { success: true, storageAvailable: true };
  } catch (err) {
    console.warn('Quota or storage error saving questionnaire draft:', err);
    return { success: false, storageAvailable: false, error: err?.message || 'Storage quota exceeded' };
  }
}

/**
 * Remove questionnaire draft from sessionStorage.
 */
export function clearQuestionnaireDraft(draftId) {
  if (!isSessionStorageAvailable()) return;
  try {
    if (draftId) {
      sessionStorage.removeItem(`${DRAFT_PREFIX}${draftId}`);
    }
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
