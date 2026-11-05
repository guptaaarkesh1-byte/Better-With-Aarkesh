import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, DownloadSimple, ShieldCheck, WarningCircle } from '@phosphor-icons/react';
import { API_URL } from '../utils/apiUrl';

export default function DigitalAgreement() {
  const { token } = useParams();

  const [loading, setLoading] = useState(true);
  const [agreement, setAgreement] = useState(null);
  const [error, setError] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [acceptedSuccess, setAcceptedSuccess] = useState(false);
  const [acceptedAt, setAcceptedAt] = useState(null);
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState('');

  // Fetch agreement details by token
  useEffect(() => {
    if (!token) {
      setError('Invalid agreement link. Please check your email for the correct URL.');
      setLoading(false);
      return;
    }

    let isMounted = true;
    fetch(`${API_URL}/api/appointments/agreement-by-token/${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Unable to load coaching agreement.');
        }
        return data;
      })
      .then((data) => {
        if (!isMounted) return;
        setAgreement(data);
        if (data.isAccepted) {
          setAcceptedSuccess(true);
          setAcceptedAt(data.acceptedAt);
        }
        setPdfDownloadUrl(data.pdfUrl || `${API_URL}/api/appointments/agreement-pdf-by-token/${token}`);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load agreement. Please try again.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Handle client digital acceptance submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/appointments/agreement-accept/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accepted: true })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit agreement acceptance.');
      }

      setAcceptedSuccess(true);
      setAcceptedAt(data.acceptedAt || new Date().toISOString());
      if (data.pdfUrl) {
        setPdfDownloadUrl(data.pdfUrl.startsWith('http') ? data.pdfUrl : `${API_URL}${data.pdfUrl}`);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert(err.message || 'An error occurred while saving your acceptance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDisplayDate = (d) => {
    if (!d) return '';
    try {
      return new Date(d).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return String(d);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center py-20 px-4">
        <div className="text-center max-w-md">
          <div className="w-10 h-10 border-3 border-[#c9542f] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="font-serif text-xl text-[#111010] mb-2 font-semibold">Loading Coaching Agreement...</h2>
          <p className="text-sm text-[#7a7269]">Verifying your secure link and retrieving agreement terms.</p>
        </div>
      </div>
    );
  }

  if (error || !agreement) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center py-20 px-4">
        <div className="max-w-lg w-full bg-white rounded-2xl border border-[#eae3d9] p-8 md:p-10 text-center shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
          <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-5 text-2xl">
            <WarningCircle size={32} weight="duotone" />
          </div>
          <h2 className="font-serif text-2xl text-[#111010] font-bold mb-3">Notice Regarding Agreement Link</h2>
          <p className="text-[#555047] text-sm leading-relaxed mb-6">
            {error || 'This agreement link is invalid or has expired. If you need a fresh link, please reach out to Aarkesh Gupta directly.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#111010] text-[#f5f1e8] text-xs uppercase tracking-wider font-semibold hover:bg-[#2b2723] transition-colors"
            >
              Return to Homepage
            </Link>
            <a
              href="mailto:guptaaarkesh1@gmail.com"
              className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-[#d6cfc7] text-[#111010] text-xs uppercase tracking-wider font-semibold hover:bg-stone-50 transition-colors"
            >
              Contact Coach
            </a>
          </div>
        </div>
      </div>
    );
  }

  const {
    clientName,
    clientEmail,
    clientPhone,
    sessionDate,
    sessionTime,
    duration,
    modeOfCoaching,
    meetLink,
    betweenSessionSupport,
    additionalAgreedTerms,
    agreementDate,
    isExpired
  } = agreement;

  const isPackage = Boolean(
    agreement.isPackage || 
    agreement.packageId || 
    (agreement.packageSessions && agreement.packageSessions.length > 0) || 
    (agreement.totalSessions && agreement.totalSessions > 1)
  );

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#2b2723]" style={{ fontFamily: 'inherit' }}>
      {/* Minimal top bar — only "Back to My Journey" */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: '#faf8f5',
        borderBottom: '1px solid #e8e2d9',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link
          to="/my-journey"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            color: '#c9542f',
            fontWeight: 700,
            fontSize: '0.82rem',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            textDecoration: 'none',
            padding: '7px 16px',
            borderRadius: '999px',
            border: '1.5px solid #c9542f',
            transition: 'background 0.18s, color 0.18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#c9542f'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#c9542f'; }}
        >
          <span style={{ fontSize: '1rem', lineHeight: 1 }}>←</span>
          Back to My Journey
        </Link>
        <span style={{ fontSize: '0.72rem', color: '#a08c78', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>
          Coaching Agreement
        </span>
      </div>

      <div className="max-w-[760px] mx-auto px-4 sm:px-6 py-10 md:py-14">

        {/* Accepted Success Banner */}
        {acceptedSuccess && (
          <div className="mb-8 bg-[#f0fdf4] border border-[#86efac] rounded-2xl p-6 md:p-8 text-center shadow-[0_4px_20px_rgba(22,101,52,0.06)]">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 text-2xl">
              <CheckCircle size={28} weight="fill" />
            </div>
            <h2 className="font-serif text-xl md:text-2xl font-bold text-emerald-950 mb-2">
              Coaching Agreement Accepted
            </h2>
            <p className="text-sm text-emerald-900/80 max-w-lg mx-auto leading-relaxed mb-5">
              Thank you, <strong>{clientName}</strong>! Your Coaching Agreement was digitally accepted and recorded on <strong>{formatDisplayDate(acceptedAt)}</strong>. A formal PDF document has been archived for our records.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={pdfDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-800 text-white text-xs uppercase tracking-wider font-bold hover:bg-emerald-900 transition-all shadow-xs"
              >
                <DownloadSimple size={15} weight="bold" />
                <span>Download / View Agreement PDF</span>
              </a>
            </div>
          </div>
        )}

        {/* Expired State Warning */}
        {isExpired && !acceptedSuccess && (
          <div className="mb-8 bg-[#fffbeb] border border-[#fde68a] rounded-2xl p-6 text-center">
            <h3 className="font-serif text-lg font-bold text-[#92400e] mb-1">
              Agreement Link Has Expired
            </h3>
            <p className="text-xs text-[#78350f] max-w-md mx-auto mb-4">
              This review link has passed its validity window. Please reach out to Aarkesh to receive a fresh agreement link.
            </p>
            <a
              href="mailto:guptaaarkesh1@gmail.com"
              className="inline-block px-5 py-2 rounded-full bg-[#92400e] text-white text-xs uppercase tracking-wider font-semibold"
            >
              Request Fresh Link
            </a>
          </div>
        )}

        {/* Formal Legal Agreement Document Card */}
        <article className="bg-white rounded-2xl md:rounded-3xl border border-[#eae3d9] p-6 sm:p-10 md:p-12 shadow-[0_12px_45px_rgba(40,30,20,0.04)] mb-8 leading-relaxed">
          
          <div className="border-b border-[#eae3d9] pb-6 mb-8 text-center">
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#111010] mb-2">
              COACHING AGREEMENT
            </h1>
            <p className="text-xs sm:text-sm text-[#7a7269]">
              This Coaching Agreement is entered into between <strong className="text-[#111010]">Aarkesh Gupta / BetterWithAarkesh</strong> (&ldquo;Coach&rdquo;) and:
            </p>
          </div>

          {/* Meta Details Grid */}
          <div className="bg-[#faf8f5] border border-[#ede7df] rounded-xl p-5 mb-8 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <span className="text-[#7a7269] text-xs uppercase tracking-wider font-semibold block mb-0.5">Client Name</span>
                <span className="font-semibold text-[#111010]">{clientName || 'Valued Client'}</span>
              </div>
              <div>
                <span className="text-[#7a7269] text-xs uppercase tracking-wider font-semibold block mb-0.5">Email</span>
                <span className="font-semibold text-[#111010]">{clientEmail}</span>
              </div>
              <div>
                <span className="text-[#7a7269] text-xs uppercase tracking-wider font-semibold block mb-0.5">Phone</span>
                <span className="font-semibold text-[#111010]">{clientPhone || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-[#7a7269] text-xs uppercase tracking-wider font-semibold block mb-0.5">Agreement Date</span>
                <span className="font-semibold text-[#111010]">{agreementDate}</span>
              </div>
            </div>
          </div>

          {/* Section 1 */}
          <section className="mb-7">
            <h2 className="font-serif text-lg font-bold text-[#111010] mb-2.5">
              1. Coaching Engagement
            </h2>
            <div className="space-y-2 text-sm text-[#3b3631]">
              <div className="flex items-center gap-4">
                <span><strong>Sessions:</strong></span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-xs border border-[#111010] flex items-center justify-center text-[10px] font-bold">
                    {!isPackage ? '✓' : ''}
                  </span>
                  Single
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-xs border border-[#111010] flex items-center justify-center text-[10px] font-bold">
                    {isPackage ? '✓' : ''}
                  </span>
                  Package {agreement?.totalSessions ? `(${agreement.totalSessions} Sessions)` : ''}
                </span>
              </div>
              {isPackage ? (
                <div className="pt-2">
                  <p className="font-semibold mb-2 text-sm text-[#111010]">
                    Package Session Schedule ({agreement.totalSessions || agreement.packageSessions?.length || 'Multiple'} Sessions):
                  </p>
                  {agreement.packageSessions && agreement.packageSessions.length > 0 ? (
                    <div className="space-y-2 pl-3 border-l-2 border-[#c9542f]/40 py-1 bg-[#faf8f5] rounded-r-lg p-3">
                      {agreement.packageSessions.map((s, idx) => (
                        <div key={idx} className="text-xs sm:text-sm text-[#3b3631] flex flex-wrap items-center justify-between gap-2">
                          <span>
                            <strong>Session {s.sessionNumber || idx + 1}:</strong> {s.date} at {s.time} (IST)
                          </span>
                          {s.meetLink && (
                            <a href={s.meetLink} target="_blank" rel="noopener noreferrer" className="text-[#c9542f] text-xs underline font-medium">
                              Google Meet
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#7a7269]">
                      First Session: {sessionDate} at {sessionTime} (IST) · {duration} Minutes
                    </p>
                  )}
                  {agreement.totalAmount && (
                    <p className="mt-3 text-xs sm:text-sm text-[#555047]">
                      <strong>Total Package Fee Paid:</strong> ₹{Number(agreement.totalAmount).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              ) : (
                <p><strong>Scheduled Time:</strong> {sessionDate} at {sessionTime} (IST) · {duration} Minutes</p>
              )}
              <p><strong>Mode of Coaching:</strong> {modeOfCoaching}</p>
              {meetLink && (
                <p>
                  <strong>Meeting Link:</strong>{' '}
                  <a href={meetLink} target="_blank" rel="noopener noreferrer" className="text-[#c9542f] underline font-semibold break-all">
                    {meetLink}
                  </a>
                </p>
              )}
            </div>
          </section>

          <hr className="border-[#eae3d9] my-6" />

          {/* Section 2 */}
          <section className="mb-7">
            <h2 className="font-serif text-lg font-bold text-[#111010] mb-2.5">
              2. Coaching Focus
            </h2>
            <p className="text-sm text-[#3b3631] mb-2">
              The focus of the coaching engagement will be established collaboratively by the Client and Coach during the course of coaching.
            </p>
            <p className="text-sm text-[#3b3631] mb-2">
              It may include specific goals, challenges, patterns, behaviours or areas of development that both parties agree are useful to explore.
            </p>
            <p className="text-sm text-[#3b3631]">
              The focus may evolve or change as the coaching progresses.
            </p>
          </section>

          <hr className="border-[#eae3d9] my-6" />

          {/* Section 3 */}
          <section className="mb-7">
            <h2 className="font-serif text-lg font-bold text-[#111010] mb-2.5">
              3. Nature of the Engagement
            </h2>
            <p className="text-sm text-[#3b3631] mb-2">
              Coaching is a collaborative process intended to support reflection, decision-making, behavioural change and personal development.
            </p>
            <p className="text-sm text-[#3b3631] mb-2">
              The Coach may provide questions, observations, feedback, exercises, frameworks and recommendations. The Client remains responsible for their own decisions, actions and outcomes.
            </p>
            <p className="text-sm text-[#3b3631]">
              Coaching is not psychotherapy, medical treatment, psychiatric care, legal advice, financial advice or another regulated professional service.
            </p>
          </section>

          <hr className="border-[#eae3d9] my-6" />

          {/* Section 4 */}
          <section className="mb-7">
            <h2 className="font-serif text-lg font-bold text-[#111010] mb-2.5">
              4. Sessions, Cancellation &amp; Rescheduling
            </h2>
            <p className="text-sm text-[#3b3631] mb-2">
              Sessions are reserved specifically for the Client.
            </p>
            <p className="text-sm text-[#3b3631] mb-2">
              A session may be cancelled or rescheduled without penalty where notice is received <strong>at least 48 hours</strong> before the scheduled start time. Requests made within 48 hours will ordinarily result in the session being treated as used.
            </p>
            <p className="text-sm text-[#3b3631] mb-2">
              No-shows will ordinarily be treated as used sessions. If the Client arrives late, the session will still normally end at the originally scheduled time.
            </p>
            <p className="text-sm text-[#3b3631]">
              The full Refund &amp; Cancellation Policy and Rescheduling Policy available on{' '}
              <a href="https://aarkeshgupta.com" target="_blank" rel="noopener noreferrer" className="text-[#c9542f] underline font-semibold">
                www.aarkeshgupta.com
              </a>{' '}
              apply to this engagement.
            </p>
          </section>

          <hr className="border-[#eae3d9] my-6" />

          {/* Section 5 */}
          <section className="mb-7">
            <h2 className="font-serif text-lg font-bold text-[#111010] mb-2.5">
              5. Confidentiality
            </h2>
            <p className="text-sm text-[#3b3631] mb-2">
              Information discussed during coaching will be treated as confidential, subject to the exceptions described in the BetterWithAarkesh Terms &amp; Conditions and Privacy Policy.
            </p>
            <p className="text-sm text-[#3b3631]">
              Neither party may record a coaching session without the knowledge and agreement of the other.
            </p>
          </section>

          <hr className="border-[#eae3d9] my-6" />

          {/* Section 6 */}
          <section className="mb-7">
            <h2 className="font-serif text-lg font-bold text-[#111010] mb-2.5">
              6. Between-Session Communication
            </h2>
            <p className="text-sm text-[#3b3631] mb-2">
              Unless otherwise agreed, communication between sessions is primarily for scheduling, administration and brief follow-up.
            </p>
            {Boolean(betweenSessionSupport && betweenSessionSupport.trim()) && (
              <p className="text-sm text-[#3b3631]">
                <strong>Additional agreed support:</strong>{' '}
                <span className="italic text-[#555047]">
                  {betweenSessionSupport.trim()}
                </span>
              </p>
            )}
          </section>

          <hr className="border-[#eae3d9] my-6" />

          {/* Section 7 */}
          <section className="mb-7">
            <h2 className="font-serif text-lg font-bold text-[#111010] mb-2.5">
              7. Ending the Coaching Engagement
            </h2>
            <p className="text-sm text-[#3b3631] mb-2">
              Either the Client or Coach may decide to end the coaching relationship.
            </p>
            <p className="text-sm text-[#3b3631]">
              Once coaching has commenced, unused sessions are ordinarily non-refundable unless both the Client and Coach agree that continuing the coaching engagement is no longer necessary or appropriate. Any eligible unused portion will be handled according to the BetterWithAarkesh Refund &amp; Cancellation Policy.
            </p>
          </section>

          <hr className="border-[#eae3d9] my-6" />

          {/* Section 8 */}
          <section className="mb-7">
            <h2 className="font-serif text-lg font-bold text-[#111010] mb-2.5">
              8. Applicable Policies
            </h2>
            <p className="text-sm text-[#3b3631] mb-2">
              By accepting this Agreement, the Client confirms that they have been given access to and agree to the relevant BetterWithAarkesh policies:
            </p>
            <ul className="list-disc list-inside text-sm text-[#555047] space-y-1 ml-2">
              <li>Terms &amp; Conditions</li>
              <li>Privacy Policy</li>
              <li>Refund &amp; Cancellation Policy</li>
              <li>Rescheduling Policy</li>
            </ul>
            <p className="text-xs text-[#7a7269] mt-2">
              Available at <a href="https://aarkeshgupta.com" target="_blank" rel="noopener noreferrer" className="text-[#c9542f] underline">www.aarkeshgupta.com</a>.
            </p>
          </section>

          <hr className="border-[#eae3d9] my-6" />

          {/* Section 9 */}
          <section className="mb-7">
            <h2 className="font-serif text-lg font-bold text-[#111010] mb-2.5">
              9. Agreement
            </h2>
            <p className="text-sm text-[#3b3631] font-medium leading-relaxed">
              Both parties confirm that the information above accurately reflects the coaching arrangement agreed between them.
            </p>
          </section>

          {/* Additional Agreed Terms if present */}
          {additionalAgreedTerms && additionalAgreedTerms.trim() && (
            <>
              <hr className="border-[#eae3d9] my-6" />
              <section className="mb-7">
                <h2 className="font-serif text-lg font-bold text-[#111010] mb-2.5">
                  Additional Agreed Terms
                </h2>
                <div className="bg-[#faf8f5] border-l-3 border-[#c9542f] p-4 rounded-r-lg text-sm text-[#3b3631] italic">
                  {additionalAgreedTerms}
                </div>
              </section>
            </>
          )}

          {/* Digital Acceptance Stamp Footer if already accepted */}
          {acceptedSuccess && (
            <div className="mt-8 pt-6 border-t border-[#eae3d9] bg-emerald-50/50 rounded-xl p-4 text-center">
              <span className="text-xs font-semibold text-emerald-800 tracking-wide block">
                ✓ Accepted digitally on {formatDisplayDate(acceptedAt)} (IST) by {clientName}
              </span>
            </div>
          )}

        </article>

        {/* Digital Acceptance Checkbox & Submit Form (Only if not yet accepted) */}
        {!acceptedSuccess && !isExpired && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border-2 border-[#c9542f]/30 p-6 sm:p-8 shadow-[0_8px_30px_rgba(201,84,47,0.08)] text-center transition-all"
          >
            <div className="flex items-center justify-center gap-2 mb-3 text-xs uppercase tracking-wider font-bold text-[#c9542f]">
              <ShieldCheck size={18} weight="bold" />
              <span>Digital Acceptance Confirmation</span>
            </div>

            <label className="flex items-start justify-center gap-3 cursor-pointer text-left max-w-lg mx-auto mb-6 select-none group">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 rounded-md border-[#d6cfc7] text-[#c9542f] focus:ring-[#c9542f] accent-[#c9542f] cursor-pointer"
              />
              <span className="text-sm text-[#111010] font-medium leading-relaxed group-hover:text-[#c9542f] transition-colors">
                I have read, understood, and agree to the terms of this Coaching Agreement.
              </span>
            </label>

            <button
              type="submit"
              disabled={!agreed || submitting}
              className={`w-full sm:w-auto px-10 py-3.5 rounded-full font-serif text-sm uppercase tracking-[0.14em] font-bold transition-all shadow-md ${
                agreed && !submitting
                  ? 'bg-[#c9542f] hover:bg-[#b04523] text-white cursor-pointer hover:shadow-lg hover:scale-[1.01]'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed opacity-75'
              }`}
            >
              {submitting ? 'Recording Acceptance...' : 'Submit / Accept Agreement'}
            </button>

            <p className="text-[11px] text-[#7a7269] mt-3">
              By clicking Submit, your digital acceptance is securely logged along with your timestamp and IP address as legal proof of consent.
            </p>
          </form>
        )}

      </div>
    </div>
  );
}
