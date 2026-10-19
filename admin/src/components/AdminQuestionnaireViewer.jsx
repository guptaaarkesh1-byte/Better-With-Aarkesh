import React, { useRef, useState, useMemo } from 'react';
import config from '../data/questionnaireConfig.json';

export default function AdminQuestionnaireViewer({ 
  questionnaireAnswers, 
  clientName = 'Client', 
  appointmentDate = '' 
}) {
  const printContainerRef = useRef(null);
  const [filterMode, setFilterMode] = useState('answered'); // 'answered' | 'all'

  // Safely parse JSON if provided as string
  const parsedData = useMemo(() => {
    if (!questionnaireAnswers) return null;
    if (typeof questionnaireAnswers === 'string') {
      try {
        return JSON.parse(questionnaireAnswers);
      } catch (e) {
        return { rawText: questionnaireAnswers };
      }
    }
    return questionnaireAnswers;
  }, [questionnaireAnswers]);

  if (!parsedData) {
    return (
      <div className="bwa-box" style={{ background: 'rgba(0,0,0,0.02)', borderStyle: 'dashed', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="bwa-pill" style={{ background: '#eee', color: '#777', fontSize: '0.65rem' }}>
            Not started
          </span>
          <h4 style={{ fontSize: '0.88rem', color: '#7a756b', margin: 0 }}>Optional Coaching Questionnaire</h4>
        </div>
        <p style={{ margin: 0, fontSize: '0.78rem', color: '#9c9689' }}>
          Client did not open or complete the optional questionnaire for this session.
        </p>
      </div>
    );
  }

  // Raw unparsed text fallback
  if (parsedData.rawText) {
    return (
      <div className="bwa-box">
        <h4 className="big" style={{ margin: '0 0 8px' }}>Questionnaire Responses</h4>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.82rem', background: '#faf7f2', padding: '12px', borderRadius: '8px' }}>
          {parsedData.rawText}
        </pre>
      </div>
    );
  }

  const contentVersion = parsedData.content_version || parsedData.contentVersion || '2026-10-16-v1';
  const savedAt = parsedData.saved_at || parsedData.savedAt;

  // Build a normalized response map for quick lookup
  const { responseMap, legacyList } = useMemo(() => {
    const map = new Map();
    const legacy = [];

    // Extract list of responses
    let rawList = [];
    if (Array.isArray(parsedData.responses)) {
      rawList = parsedData.responses;
    } else if (Array.isArray(parsedData.answers)) {
      rawList = parsedData.answers;
    } else if (Array.isArray(parsedData)) {
      rawList = parsedData;
    } else if (typeof parsedData === 'object' && parsedData !== null) {
      // Could be key-value pairs like { q01: [...], q02: "text" }
      const entries = Object.entries(parsedData.answers || parsedData);
      entries.forEach(([k, v]) => {
        if (['questionnaire_id', 'content_version', 'booking_draft_id', 'opened', 'saved_at', 'status'].includes(k)) return;
        rawList.push({ question_id: k, ...(typeof v === 'object' && v !== null && v.state ? v : { value: v }) });
      });
    }

    rawList.forEach((r, idx) => {
      if (!r) return;
      const qId = r.question_id || r.questionId || r.id || r.q;
      if (qId) {
        const normId = String(qId).toLowerCase();
        map.set(normId, r);
        // Map q1 <-> q01
        if (normId.startsWith('q')) {
          const num = parseInt(normId.replace('q', ''), 10);
          if (!isNaN(num)) {
            map.set(`q${num}`, r);
            map.set(`q${String(num).padStart(2, '0')}`, r);
          }
        }
      } else if (r.question || r.answer || typeof r === 'string') {
        legacy.push({
          question: r.question || `Question ${idx + 1}`,
          answer: r.answer || (typeof r === 'object' ? JSON.stringify(r) : String(r))
        });
      }
    });

    return { responseMap: map, legacyList: legacy };
  }, [parsedData]);

  // Calculate statistics across all 9 sections
  let answeredCount = 0;
  let skippedCount = 0;
  let unansweredCount = 0;

  (config.sections || []).forEach((sec) => {
    (sec.questions || []).forEach((q) => {
      const resp = responseMap.get(q.id.toLowerCase()) || responseMap.get(`q${q.number}`);
      const isAnswered = resp && (
        resp.state === 'answered' ||
        (Array.isArray(resp.selected_option_ids) && resp.selected_option_ids.length > 0) ||
        (Array.isArray(resp.value) && resp.value.length > 0) ||
        (typeof resp.text === 'string' && resp.text.trim()) ||
        (typeof resp.value === 'string' && resp.value.trim()) ||
        (typeof resp.answer === 'string' && resp.answer.trim())
      );
      const isSkipped = resp && resp.state === 'skipped';

      if (isAnswered) answeredCount++;
      else if (isSkipped) skippedCount++;
      else unansweredCount++;
    });
  });

  // If no structured matches were found but legacy list exists
  if (answeredCount === 0 && legacyList.length > 0) {
    return (
      <div className="bwa-box">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h4 className="big" style={{ margin: 0 }}>Client Questionnaire Answers</h4>
          <span className="bwa-pill p-done" style={{ fontSize: '0.65rem' }}>{legacyList.length} Answered ✓</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {legacyList.map((item, idx) => (
            <div key={idx} style={{ background: '#faf7f2', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--accent, #c9542f)', marginBottom: '4px' }}>
                {item.question}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#111010', lineHeight: 1.45 }}>
                {item.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    const printContent = printContainerRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Questionnaire Responses - ${clientName}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #111; padding: 24px; line-height: 1.5; font-size: 13px; }
            h1 { font-size: 20px; margin-bottom: 4px; font-weight: 600; color: #111; }
            .meta { font-size: 11px; color: #666; margin-bottom: 20px; border-bottom: 1px solid #ddd; padding-bottom: 12px; }
            .section { margin-top: 24px; page-break-inside: avoid; }
            .section-title { font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; color: #c9542f; margin-bottom: 8px; border-bottom: 2px solid #c9542f; padding-bottom: 4px; }
            .q-box { margin-bottom: 12px; border: 1px solid #e0ded9; border-radius: 8px; padding: 10px 14px; background: #faf7f2; page-break-inside: avoid; }
            .q-title { font-weight: 600; font-size: 13px; margin-bottom: 4px; color: #111; }
            .q-badge { display: inline-block; font-size: 9px; text-transform: uppercase; font-weight: 700; padding: 2px 6px; border-radius: 4px; margin-left: 8px; }
            .b-ans { background: #e6f4ea; color: #137333; }
            .b-skp { background: #f1f3f4; color: #5f6368; }
            .b-una { background: #f8f9fa; color: #80868b; }
            .answer { font-size: 12.5px; color: #222; margin-top: 4px; }
            .details { color: #555; font-style: italic; }
            ul { margin: 4px 0 0 18px; padding: 0; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>${config.title || 'Optional Coaching Questionnaire'}</h1>
          <div class="meta">
            <strong>Client:</strong> ${clientName} | 
            <strong>Date:</strong> ${appointmentDate || 'Coaching Session'} | 
            <strong>Version:</strong> ${contentVersion} | 
            <strong>Completed:</strong> ${answeredCount} answered, ${skippedCount} skipped, ${unansweredCount} unanswered
          </div>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="bwa-box" style={{ padding: '20px 22px' }}>
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '16px', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h4 className="big" style={{ margin: 0 }}>Optional Coaching Questionnaire</h4>
            <span className="bwa-pill" style={{ background: '#fbf0eb', color: '#c9542f', borderColor: '#e8c4e2', fontSize: '0.65rem', fontWeight: 700 }}>
              v{contentVersion}
            </span>
          </div>
          <p className="hint" style={{ margin: 0 }}>
            {savedAt ? `Recorded on ${new Date(savedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}` : 'Submitted by client during booking.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="bwa-pill p-done" style={{ fontSize: '0.7rem' }}>
            {answeredCount} Answered ✓
          </span>
          {skippedCount > 0 && (
            <span className="bwa-pill" style={{ background: '#f0ede8', color: '#7a756b', fontSize: '0.7rem' }}>
              {skippedCount} Skipped
            </span>
          )}
          {unansweredCount > 0 && (
            <span className="bwa-pill" style={{ background: '#faf8f5', color: '#9c9689', fontSize: '0.7rem' }}>
              {unansweredCount} Unanswered
            </span>
          )}
          <button
            type="button"
            className="bwa-btn sm"
            onClick={handlePrint}
            style={{ marginLeft: '4px', cursor: 'pointer' }}
          >
            🖨️ Printable View
          </button>
        </div>
      </div>

      {/* FILTER BAR: ANSWERED ONLY VS ALL 45 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#faf7f2', padding: '8px 12px', borderRadius: '8px', marginBottom: '18px', border: '1px solid rgba(0,0,0,0.06)' }}>
        <span style={{ fontSize: '0.78rem', color: '#7a756b', fontWeight: 500 }}>
          Showing: <strong style={{ color: '#111' }}>{filterMode === 'answered' ? `${answeredCount} Answered questions` : 'All 45 questions (9 sections)'}</strong>
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setFilterMode('answered')}
            style={{
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: filterMode === 'answered' ? '1px solid #c9542f' : '1px solid #ddd',
              background: filterMode === 'answered' ? '#c9542f' : '#fff',
              color: filterMode === 'answered' ? '#fff' : '#666',
              cursor: 'pointer'
            }}
          >
            Answered Only ({answeredCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            style={{
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: filterMode === 'all' ? '1px solid #c9542f' : '1px solid #ddd',
              background: filterMode === 'all' ? '#c9542f' : '#fff',
              color: filterMode === 'all' ? '#fff' : '#666',
              cursor: 'pointer'
            }}
          >
            All 45 Questions
          </button>
        </div>
      </div>

      {/* QUESTIONNAIRE BODY (9 SECTIONS) */}
      <div ref={printContainerRef} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {(config.sections || []).map((sec) => {
          // Filter questions in this section
          const sectionQuestions = (sec.questions || []).filter((q) => {
            const resp = responseMap.get(q.id.toLowerCase()) || responseMap.get(`q${q.number}`);
            const isAnswered = resp && (
              resp.state === 'answered' ||
              (Array.isArray(resp.selected_option_ids) && resp.selected_option_ids.length > 0) ||
              (Array.isArray(resp.value) && resp.value.length > 0) ||
              (typeof resp.text === 'string' && resp.text.trim()) ||
              (typeof resp.value === 'string' && resp.value.trim()) ||
              (typeof resp.answer === 'string' && resp.answer.trim())
            );
            if (filterMode === 'answered') return isAnswered;
            return true;
          });

          if (sectionQuestions.length === 0 && filterMode === 'answered') {
            return null; // hide section if no answered questions in this section
          }

          return (
            <div key={sec.id} className="section" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '4px' }}>
                <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, color: 'var(--accent, #c9542f)' }}>
                  Section {sec.id.replace('s0', '').replace('s', '')}: {sec.title}
                </div>
                {sec.intro && (
                  <div style={{ fontSize: '0.75rem', color: '#7a756b', fontStyle: 'italic', marginTop: '2px' }}>
                    {sec.intro}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sectionQuestions.map((q) => {
                  const resp = responseMap.get(q.id.toLowerCase()) || responseMap.get(`q${q.number}`);
                  const isAnswered = resp && (
                    resp.state === 'answered' ||
                    (Array.isArray(resp.selected_option_ids) && resp.selected_option_ids.length > 0) ||
                    (Array.isArray(resp.value) && resp.value.length > 0) ||
                    (typeof resp.text === 'string' && resp.text.trim()) ||
                    (typeof resp.value === 'string' && resp.value.trim()) ||
                    (typeof resp.answer === 'string' && resp.answer.trim())
                  );
                  const isSkipped = resp && resp.state === 'skipped';

                  // Options and text extraction
                  const selectedOptions = resp?.selected_option_ids || (Array.isArray(resp?.value) ? resp.value : resp?.value ? [resp.value] : []);
                  const textAnswer = resp?.text || (typeof resp?.value === 'string' ? resp.value : null) || resp?.answer || null;
                  const writeIns = resp?.other_text_by_option_id || {};

                  return (
                    <div
                      key={q.id}
                      className="q-box"
                      style={{
                        background: isAnswered ? '#ffffff' : '#faf7f2',
                        border: isAnswered ? '1px solid rgba(201, 84, 47, 0.3)' : '1px solid rgba(0,0,0,0.06)',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        boxShadow: isAnswered ? '0 1px 3px rgba(0,0,0,0.03)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                        <div className="q-title" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111010', lineHeight: 1.4 }}>
                          <span style={{ color: '#c9542f', marginRight: '6px', fontFamily: 'monospace' }}>
                            Q{q.number}.
                          </span>
                          {q.prompt}
                        </div>

                        <span
                          className={`q-badge ${isAnswered ? 'b-ans' : isSkipped ? 'b-skp' : 'b-una'}`}
                          style={{
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            whiteSpace: 'nowrap',
                            background: isAnswered ? '#e6f4ea' : isSkipped ? '#f0ede8' : '#faf8f5',
                            color: isAnswered ? '#137333' : isSkipped ? '#5f6368' : '#9c9689'
                          }}
                        >
                          {isAnswered ? 'Answered' : isSkipped ? 'Skipped' : 'Unanswered'}
                        </span>
                      </div>

                      {/* ANSWER DETAIL */}
                      {isAnswered && (
                        <div className="answer" style={{ marginTop: '8px', fontSize: '0.84rem', color: '#222' }}>
                          {/* Long text / Free form answer */}
                          {(q.type === 'long_text' || (!selectedOptions.length && textAnswer)) && (
                            <div style={{ background: '#faf7f2', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.06)', whiteSpace: 'pre-wrap', lineHeight: 1.5, color: '#111010' }}>
                              {textAnswer || resp?.text || 'Response submitted'}
                            </div>
                          )}

                          {/* Options selected */}
                          {selectedOptions.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              {selectedOptions.map((optId) => {
                                const optDef = (q.options || []).find((o) => o.id === optId);
                                const writeInVal = writeIns[optId];

                                // Q39 scale confidence display
                                let labelDisplay = optDef?.label || optId;
                                if (q.id === 'q39') {
                                  if (optId === 'q39_0') labelDisplay = '0 — Not at all confident';
                                  else if (optId === 'q39_10') labelDisplay = '10 — Very confident';
                                  else if (optId === 'q39_not_sure') labelDisplay = 'Not sure';
                                  else labelDisplay = `Rating: ${optDef?.label || optId}`;
                                }

                                return (
                                  <div key={optId} style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                                    <span style={{ color: '#c9542f', fontSize: '0.85rem' }}>✓</span>
                                    <span style={{ fontWeight: 600, color: '#111010' }}>{labelDisplay}</span>
                                    {writeInVal && (
                                      <span className="details" style={{ color: '#666', fontStyle: 'italic', fontSize: '0.8rem', background: '#f5f2eb', padding: '2px 6px', borderRadius: '4px' }}>
                                        Details: "{writeInVal}"
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {!isAnswered && (
                        <div style={{ fontSize: '0.78rem', color: '#9c9689', fontStyle: 'italic', marginTop: '4px' }}>
                          {isSkipped ? 'Client skipped this question.' : 'No response recorded.'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
