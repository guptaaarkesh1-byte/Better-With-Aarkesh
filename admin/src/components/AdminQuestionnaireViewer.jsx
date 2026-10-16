import React, { useRef } from 'react';
import config from '../data/questionnaireConfig.json';

export default function AdminQuestionnaireViewer({ 
  questionnaireAnswers, 
  clientName = 'Client', 
  appointmentDate = '' 
}) {
  const printContainerRef = useRef(null);

  if (!questionnaireAnswers) {
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

  // Handle new structured response contract
  const isStructured = questionnaireAnswers && typeof questionnaireAnswers === 'object' && Array.isArray(questionnaireAnswers.responses);

  if (!isStructured) {
    // Legacy fallback format (array of strings or { question, answer })
    const legacyList = Array.isArray(questionnaireAnswers)
      ? questionnaireAnswers
      : Object.entries(questionnaireAnswers).map(([k, v]) => ({ question: k, answer: typeof v === 'object' ? JSON.stringify(v) : String(v) }));

    if (legacyList.length === 0) {
      return (
        <div className="bwa-box" style={{ background: 'rgba(0,0,0,0.02)', borderStyle: 'dashed', padding: '16px 20px' }}>
          <span className="bwa-pill" style={{ background: '#eee', color: '#777', fontSize: '0.65rem' }}>
            Not started
          </span>
          <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: '#9c9689' }}>
            No questionnaire answers recorded.
          </p>
        </div>
      );
    }

    return (
      <div className="bwa-box">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h4 className="big" style={{ margin: 0 }}>Questionnaire Answers (Legacy)</h4>
          <span className="bwa-pill p-done" style={{ fontSize: '0.65rem' }}>{legacyList.length} Answered ✓</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {legacyList.map((item, idx) => (
            <div key={idx} style={{ background: '#faf7f2', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '10px', padding: '10px 14px' }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--accent, #c9542f)', marginBottom: '3px' }}>
                Q{idx + 1}: {item.question || item.q || `Question ${idx + 1}`}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#111010', lineHeight: 1.45 }}>
                {item.answer || item.a || String(item)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Structured response contract processing
  const { questionnaire_id, content_version, opened, saved_at, responses = [] } = questionnaireAnswers;

  if (!opened && responses.length === 0) {
    return (
      <div className="bwa-box" style={{ background: 'rgba(0,0,0,0.02)', borderStyle: 'dashed', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="bwa-pill" style={{ background: '#eee', color: '#777', fontSize: '0.65rem' }}>
            Not started
          </span>
          <h4 style={{ fontSize: '0.88rem', color: '#7a756b', margin: 0 }}>Optional Coaching Questionnaire</h4>
        </div>
        <p style={{ margin: 0, fontSize: '0.78rem', color: '#9c9689' }}>
          Client did not open the optional questionnaire for this session.
        </p>
      </div>
    );
  }

  // Create response lookup map
  const responseMap = new Map();
  responses.forEach((r) => {
    if (r && r.question_id) {
      responseMap.set(r.question_id, r);
    }
  });

  // Calculate summary counts
  let answeredCount = 0;
  let skippedCount = 0;
  let unansweredCount = 0;

  (config.sections || []).forEach((sec) => {
    (sec.questions || []).forEach((q) => {
      const resp = responseMap.get(q.id);
      if (resp && resp.state === 'answered') {
        answeredCount++;
      } else if (resp && resp.state === 'skipped') {
        skippedCount++;
      } else {
        unansweredCount++;
      }
    });
  });

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
            <strong>Version:</strong> ${contentVersion || '2026-10-16-v1'} | 
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
    <div className="bwa-box" style={{ padding: '20px 24px' }}>
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '16px', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h4 className="big" style={{ margin: 0 }}>Optional Coaching Questionnaire</h4>
            <span className="bwa-pill" style={{ background: '#fbf0eb', color: '#c9542f', borderColor: '#e8c4e2', fontSize: '0.65rem', fontWeight: 700 }}>
              v{contentVersion || '2026-10-16-v1'}
            </span>
          </div>
          <p className="hint" style={{ margin: 0 }}>
            {saved_at ? `Responses recorded on ${new Date(saved_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}` : 'Saved during booking confirmation.'}
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

      {/* QUESTIONNAIRE BODY (9 SECTIONS) */}
      <div ref={printContainerRef} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {(config.sections || []).map((sec) => (
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
              {(sec.questions || []).map((q) => {
                const resp = responseMap.get(q.id);
                const isAnswered = resp && resp.state === 'answered';
                const isSkipped = resp && resp.state === 'skipped';

                return (
                  <div
                    key={q.id}
                    className="q-box"
                    style={{
                      background: isAnswered ? '#ffffff' : '#faf7f2',
                      border: isAnswered ? '1px solid rgba(201, 84, 47, 0.25)' : '1px solid rgba(0,0,0,0.06)',
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
                      <div className="answer" style={{ marginTop: '6px', fontSize: '0.84rem', color: '#222' }}>
                        {/* Text questions */}
                        {q.type === 'long_text' && (
                          <div style={{ background: '#faf7f2', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)', whiteSpace: 'pre-wrap', lineHeight: 1.5, color: '#111010' }}>
                            {resp.text}
                          </div>
                        )}

                        {/* Option based questions */}
                        {['multi_select', 'single_select', 'integer_choice'].includes(q.type) && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {(resp.selected_option_ids || []).map((optId) => {
                              const optDef = (q.options || []).find((o) => o.id === optId);
                              const writeIn = resp.other_text_by_option_id?.[optId];

                              // Q39 special confidence display
                              let labelDisplay = optDef?.label || optId;
                              if (q.id === 'q39') {
                                if (optId === 'q39_0') labelDisplay = '0 — Not at all confident';
                                else if (optId === 'q39_10') labelDisplay = '10 — Very confident';
                                else if (optId === 'q39_not_sure') labelDisplay = 'Not sure';
                                else labelDisplay = `Confidence level: ${optDef?.label || optId}`;
                              }

                              return (
                                <div key={optId} style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                  <span style={{ color: '#c9542f', fontSize: '0.8rem' }}>•</span>
                                  <span style={{ fontWeight: 600, color: '#111010' }}>{labelDisplay}</span>
                                  {writeIn && (
                                    <span className="details" style={{ color: '#666', fontStyle: 'italic', fontSize: '0.8rem' }}>
                                      — Details: "{writeIn}"
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
                      <div style={{ fontSize: '0.78rem', color: '#9c9689', fontStyle: 'italic' }}>
                        {isSkipped ? 'Client chose to skip this question.' : 'No response provided.'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
