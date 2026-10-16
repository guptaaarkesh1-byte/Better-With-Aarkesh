/**
 * questionnaireValidator.js
 * Server-side validator for the BetterWithAarkesh questionnaire submission (2026-10-16-v1).
 * Validates IDs, option membership, selection limits, exclusive choices, and string lengths.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, '../data/questionnaireConfig.json');
let config = null;

try {
  const raw = fs.readFileSync(configPath, 'utf8');
  config = JSON.parse(raw);
} catch (e) {
  console.error('Failed to load questionnaireConfig.json in server:', e);
}

// Build map of questions for fast lookup
const questionsMap = new Map();
if (config?.sections) {
  config.sections.forEach((sec) => {
    (sec.questions || []).forEach((q) => {
      questionsMap.set(q.id, q);
    });
  });
}

/**
 * Validate and sanitize questionnaire submission.
 * @param {object|null} rawPayload
 * @returns {{ valid: boolean, errors: string[], cleanPayload: object|null }}
 */
export function validateQuestionnaireSubmission(rawPayload) {
  const errors = [];

  if (!rawPayload) {
    return { valid: true, errors: [], cleanPayload: null };
  }

  // If payload was not opened or is empty
  const opened = !!rawPayload.opened;
  const questionnaireId = rawPayload.questionnaire_id || config?.questionnaire_id || 'bwa_optional_coaching';
  const contentVersion = rawPayload.content_version || config?.content_version || '2026-10-16-v1';
  const bookingDraftId = typeof rawPayload.booking_draft_id === 'string' ? rawPayload.booking_draft_id.slice(0, 100) : null;

  if (!opened && (!rawPayload.responses || !Array.isArray(rawPayload.responses))) {
    return {
      valid: true,
      errors: [],
      cleanPayload: {
        questionnaire_id: questionnaireId,
        content_version: contentVersion,
        booking_draft_id: bookingDraftId,
        opened: false,
        saved_at: new Date().toISOString(),
        responses: []
      }
    };
  }

  const incomingResponses = Array.isArray(rawPayload.responses) ? rawPayload.responses : [];
  const responsesMap = new Map();
  incomingResponses.forEach((r) => {
    if (r && r.question_id) {
      responsesMap.set(r.question_id, r);
    }
  });

  const validatedResponses = [];

  // Iterate over all 45 questions in canonical config order
  questionsMap.forEach((qDef, qId) => {
    const rawR = responsesMap.get(qId);

    if (!rawR || rawR.state === 'unanswered') {
      validatedResponses.push({
        question_id: qId,
        state: 'unanswered',
        selected_option_ids: [],
        text: null,
        other_text_by_option_id: {}
      });
      return;
    }

    if (rawR.state === 'skipped') {
      validatedResponses.push({
        question_id: qId,
        state: 'skipped',
        selected_option_ids: [],
        text: null,
        other_text_by_option_id: {}
      });
      return;
    }

    if (rawR.state !== 'answered') {
      // Unrecognized state defaults to unanswered
      validatedResponses.push({
        question_id: qId,
        state: 'unanswered',
        selected_option_ids: [],
        text: null,
        other_text_by_option_id: {}
      });
      return;
    }

    // Question is answered
    if (qDef.type === 'long_text') {
      const rawText = typeof rawR.text === 'string' ? rawR.text.trim() : '';
      if (!rawText) {
        validatedResponses.push({
          question_id: qId,
          state: 'unanswered',
          selected_option_ids: [],
          text: null,
          other_text_by_option_id: {}
        });
      } else {
        validatedResponses.push({
          question_id: qId,
          state: 'answered',
          selected_option_ids: [],
          text: rawText.slice(0, 2000), // Max 2000 chars as plain text
          other_text_by_option_id: {}
        });
      }
      return;
    }

    // Option-based questions (multi_select, single_select, integer_choice)
    const validOptionIds = new Set((qDef.options || []).map((o) => o.id));
    const rawOptionIds = Array.isArray(rawR.selected_option_ids) ? rawR.selected_option_ids : [];

    // Filter to valid option IDs only
    const filteredOptionIds = rawOptionIds.filter((id) => validOptionIds.has(id));

    if (filteredOptionIds.length === 0) {
      validatedResponses.push({
        question_id: qId,
        state: 'unanswered',
        selected_option_ids: [],
        text: null,
        other_text_by_option_id: {}
      });
      return;
    }

    // Check single choice limit
    if (qDef.type === 'single_select' || qDef.type === 'integer_choice') {
      const chosenId = filteredOptionIds[0];
      const optDef = qDef.options?.find((o) => o.id === chosenId);

      const cleanOther = {};
      if (optDef?.write_in && rawR.other_text_by_option_id?.[chosenId]) {
        cleanOther[chosenId] = String(rawR.other_text_by_option_id[chosenId]).trim().slice(0, 300);
      }

      validatedResponses.push({
        question_id: qId,
        state: 'answered',
        selected_option_ids: [chosenId],
        text: null,
        other_text_by_option_id: cleanOther
      });
      return;
    }

    // Multi select
    if (qDef.type === 'multi_select') {
      // Check exclusive options
      const exclusiveSelected = filteredOptionIds.find((id) => {
        const o = qDef.options?.find((opt) => opt.id === id);
        return o?.exclusive;
      });

      let finalOptionIds = filteredOptionIds;
      if (exclusiveSelected) {
        finalOptionIds = [exclusiveSelected];
      } else if (qDef.max_selections && filteredOptionIds.length > qDef.max_selections) {
        // Truncate to max_selections if client exceeded
        finalOptionIds = filteredOptionIds.slice(0, qDef.max_selections);
      }

      const cleanOther = {};
      finalOptionIds.forEach((id) => {
        const optDef = qDef.options?.find((o) => o.id === id);
        if (optDef?.write_in && rawR.other_text_by_option_id?.[id]) {
          cleanOther[id] = String(rawR.other_text_by_option_id[id]).trim().slice(0, 300);
        }
      });

      validatedResponses.push({
        question_id: qId,
        state: 'answered',
        selected_option_ids: finalOptionIds,
        text: null,
        other_text_by_option_id: cleanOther
      });
      return;
    }
  });

  const cleanPayload = {
    questionnaire_id: questionnaireId,
    content_version: contentVersion,
    booking_draft_id: bookingDraftId,
    opened: true,
    saved_at: new Date().toISOString(),
    responses: validatedResponses
  };

  return {
    valid: errors.length === 0,
    errors,
    cleanPayload
  };
}

export default {
  validateQuestionnaireSubmission
};
