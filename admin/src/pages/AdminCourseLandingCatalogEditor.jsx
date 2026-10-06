import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import Icon from '../components/common/AdminIcons';
import AdminStickyBar from '../components/common/AdminStickyBar';
import AdminConfirmModal from '../components/common/AdminConfirmModal';

import { API_URL } from '../utils/apiUrl';

const CATALOG_STEPS = [
  { id: 'hero', icon: 'layout', label: 'Hero Banner', subtitle: 'Main title, proof points & buttons' },
  { id: 'moreCourses', icon: 'list', label: 'More Masterclasses', subtitle: 'Catalog grid title & subtitle' },
  { id: 'allCoursesPage', icon: 'layout', label: 'All Programs Page', subtitle: 'Header for /course/all page' },
  { id: 'faq', icon: 'info', label: 'FAQ Section', subtitle: 'Frequently asked questions' },
  { id: 'cta', icon: 'rupee', label: 'Final Call to Action', subtitle: 'Bottom enrollment banner' }
];

export default function AdminCourseLandingCatalogEditor() {
  const { showSuccess, showError } = useToast();
  const [step, setStep] = useState('hero');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Fetch Settings
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/courses/landing-settings`);
      if (res.ok) {
        const data = await res.json();
        setSettings({
          hero: data.hero || {
            tag: 'Learn. Practise. Lead.',
            heading: 'THE *BETTER* MAN',
            subheading: 'Masterclasses in calm authority, magnetic communication and self-command, taught by Aarkesh.',
            proof1Bold: '3 private',
            proof1Text: '1-on-1 sessions with Aarkesh',
            proof2Bold: 'Lifetime',
            proof2Text: 'access, no recurring charges',
            primaryBtnText: 'Register Now',
            showPrimaryBtn: true,
            secondaryBtnText: 'Check Course',
            secondaryBtnLink: '/course/better-man',
            showSecondaryBtn: true,
            bgImageUrl: '',
            overlayOpacity: 40
          },
          moreCourses: data.moreCourses || {
            eyebrowText: 'MORE MASTERCLASSES',
            heading: 'More Masterclasses',
            subheading: 'Each one is a standalone course with its own private sessions.',
            viewAllBtnText: 'View All Masterclasses',
            viewAllBtnLink: '/course/all',
            showViewAllBtn: true
          },
          allCoursesPage: data.allCoursesPage || {
            tag: 'ALL PROGRAMS',
            heading: 'All Masterclasses & Programs',
            subheading: 'Each masterclass is an intensive, transformative curriculum paired with private 1-on-1 mentorship sessions with Aarkesh.',
            backBtnText: '← Back to overview'
          },
          faq: data.faq || {
            tag: 'FAQS',
            heading: 'Frequently Asked Questions From Our Students',
            subheading: 'Clear answers about the masterclass, private mentorship, and enrollment.',
            items: [
              { question: 'How long do I have access to the course materials?', answer: 'You get lifetime access to all masterclass modules, downloadable resources, and all future updates with no recurring charges.' },
              { question: 'How do the 3 free coaching sessions work?', answer: 'Once enrolled, you can book your private 1-on-1 sessions directly with Aarkesh through your course profile dashboard.' }
            ]
          },
          cta: data.cta || {
            label: 'ENROLL TODAY',
            heading: 'Ready To Become The Man People Trust?',
            description: 'Master the psychology of calm authority, magnetic communication and effortless self-command with lifetime curriculum access and 3 private 1-on-1 coaching sessions.',
            badge1: '3 Private Coaching Calls',
            badge2: 'Lifetime Video Access',
            primaryBtnText: 'Register Now',
            exploreBtnText: 'Explore Courses',
            bgImageUrl: ''
          }
        });
      }
    } catch (err) {
      console.error(err);
      showError('Failed to load catalog settings.');
    } finally {
      setLoading(false);
      setDirty(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateField = (path, val) => {
    setSettings(prev => {
      const copy = JSON.parse(JSON.stringify(prev || {}));
      const keys = path.split('.');
      const last = keys.pop();
      let target = copy;
      keys.forEach(k => {
        if (!target[k]) target[k] = {};
        target = target[k];
      });
      target[last] = val;
      return copy;
    });
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/courses/landing-settings/hero`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings.hero)
      });

      await Promise.all([
        fetch(`${API_URL}/api/courses/landing-settings/moreCourses`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(settings.moreCourses)
        }),
        fetch(`${API_URL}/api/courses/landing-settings/allCoursesPage`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(settings.allCoursesPage)
        }),
        fetch(`${API_URL}/api/courses/landing-settings/faq`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(settings.faq)
        }),
        fetch(`${API_URL}/api/courses/landing-settings/cta`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(settings.cta)
        })
      ]);

      setDirty(false);
      showSuccess('Catalog page settings saved successfully!');
    } catch (err) {
      showError('Error saving catalog settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bwa-sv dirty">
          <i /> Loading catalog page editor...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Sticky Bar */}
      <AdminStickyBar
        title="Course Catalog Page Editor (/course)"
        dirty={dirty}
        isSaving={saving}
        onSave={handleSave}
        extraRight={
          <a href="/course" target="_blank" rel="noreferrer" className="bwa-btn">
            View /course page
          </a>
        }
      />

      <div className="bwa-body nop">
        {/* Left Stepper */}
        <aside className="bwa-left">
          <div className="bwa-grp">Catalog Page Sections</div>
          {CATALOG_STEPS.map(s => (
            <button
              key={s.id}
              type="button"
              className={`bwa-ni ${step === s.id ? 'on' : ''}`}
              onClick={() => {
                setStep(s.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <span className="ico"><Icon name={s.icon} size={18} /></span>
              <span>
                <b>{s.label}</b>
                <small>{s.subtitle}</small>
              </span>
            </button>
          ))}
        </aside>

        {/* Main Content Area */}
        <main className="bwa-main">
          {/* STEP 1: HERO */}
          {step === 'hero' && (
            <div>
              <h1>Catalog Hero Banner</h1>
              <p className="bwa-lead">The main hero section shown at the top of the /course catalog landing page.</p>

              <div className="bwa-card">
                <h3>Hero Headline &amp; Tag</h3>
                <div className="bwa-f">
                  <label>Eyebrow tag</label>
                  <input
                    type="text"
                    value={settings.hero?.tag || ''}
                    onChange={(e) => updateField('hero.tag', e.target.value)}
                    placeholder="Learn. Practise. Lead."
                  />
                </div>
                <div className="bwa-f">
                  <label>Main headline (wrap boxed word in *asterisks*)</label>
                  <input
                    type="text"
                    value={settings.hero?.heading || ''}
                    onChange={(e) => updateField('hero.heading', e.target.value)}
                    placeholder="THE *BETTER* MAN"
                  />
                  <div className="hint">Example: THE *BETTER* MAN displays "BETTER" inside the framed glow box.</div>
                </div>
                <div className="bwa-f">
                  <label>Subheading</label>
                  <textarea
                    rows={3}
                    value={settings.hero?.subheading || ''}
                    onChange={(e) => updateField('hero.subheading', e.target.value)}
                  />
                </div>
              </div>

              <div className="bwa-card">
                <h3>Proof Points</h3>
                <div className="bwa-grid2">
                  <div>
                    <div className="bwa-f">
                      <label>Proof Point 1 Bold</label>
                      <input
                        type="text"
                        value={settings.hero?.proof1Bold || ''}
                        onChange={(e) => updateField('hero.proof1Bold', e.target.value)}
                        placeholder="3 private"
                      />
                    </div>
                    <div className="bwa-f">
                      <label>Proof Point 1 Text</label>
                      <input
                        type="text"
                        value={settings.hero?.proof1Text || ''}
                        onChange={(e) => updateField('hero.proof1Text', e.target.value)}
                        placeholder="1-on-1 sessions with Aarkesh"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="bwa-f">
                      <label>Proof Point 2 Bold</label>
                      <input
                        type="text"
                        value={settings.hero?.proof2Bold || ''}
                        onChange={(e) => updateField('hero.proof2Bold', e.target.value)}
                        placeholder="Lifetime"
                      />
                    </div>
                    <div className="bwa-f">
                      <label>Proof Point 2 Text</label>
                      <input
                        type="text"
                        value={settings.hero?.proof2Text || ''}
                        onChange={(e) => updateField('hero.proof2Text', e.target.value)}
                        placeholder="access, no recurring charges"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bwa-card">
                <h3>Action Buttons &amp; Background</h3>
                <div className="bwa-grid2">
                  <div className="bwa-f">
                    <label>Primary button label</label>
                    <input
                      type="text"
                      value={settings.hero?.primaryBtnText || 'Register Now'}
                      onChange={(e) => updateField('hero.primaryBtnText', e.target.value)}
                    />
                  </div>
                  <div className="bwa-f">
                    <label>Secondary button label</label>
                    <input
                      type="text"
                      value={settings.hero?.secondaryBtnText || 'Check Course'}
                      onChange={(e) => updateField('hero.secondaryBtnText', e.target.value)}
                    />
                  </div>
                </div>
                <div className="bwa-f">
                  <label>Background image URL</label>
                  <input
                    type="text"
                    value={settings.hero?.bgImageUrl || ''}
                    onChange={(e) => updateField('hero.bgImageUrl', e.target.value)}
                    placeholder="https://... or /assets/course-hero.webp"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: MORE MASTERCLASSES */}
          {step === 'moreCourses' && (
            <div>
              <h1>More Masterclasses Grid</h1>
              <p className="bwa-lead">Headline and section introduction for the course catalog grid on the /course page.</p>

              <div className="bwa-card">
                <h3>Section Header</h3>
                <div className="bwa-f">
                  <label>Eyebrow tag</label>
                  <input
                    type="text"
                    value={settings.moreCourses?.eyebrowText || ''}
                    onChange={(e) => updateField('moreCourses.eyebrowText', e.target.value)}
                  />
                </div>
                <div className="bwa-f">
                  <label>Headline</label>
                  <input
                    type="text"
                    value={settings.moreCourses?.heading || ''}
                    onChange={(e) => updateField('moreCourses.heading', e.target.value)}
                  />
                </div>
                <div className="bwa-f">
                  <label>Subheading</label>
                  <textarea
                    rows={2}
                    value={settings.moreCourses?.subheading || ''}
                    onChange={(e) => updateField('moreCourses.subheading', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ALL PROGRAMS DIRECTORY */}
          {step === 'allCoursesPage' && (
            <div>
              <h1>All Programs Directory Page (/course/all)</h1>
              <p className="bwa-lead">Headers and description for the full directory view.</p>

              <div className="bwa-card">
                <h3>Directory Header</h3>
                <div className="bwa-f">
                  <label>Tag</label>
                  <input
                    type="text"
                    value={settings.allCoursesPage?.tag || ''}
                    onChange={(e) => updateField('allCoursesPage.tag', e.target.value)}
                  />
                </div>
                <div className="bwa-f">
                  <label>Heading</label>
                  <input
                    type="text"
                    value={settings.allCoursesPage?.heading || ''}
                    onChange={(e) => updateField('allCoursesPage.heading', e.target.value)}
                  />
                </div>
                <div className="bwa-f">
                  <label>Subheading</label>
                  <textarea
                    rows={3}
                    value={settings.allCoursesPage?.subheading || ''}
                    onChange={(e) => updateField('allCoursesPage.subheading', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: FAQ */}
          {step === 'faq' && (
            <div>
              <h1>Catalog FAQ Section</h1>
              <p className="bwa-lead">Frequently asked questions shown at the bottom of the /course landing page.</p>

              <div className="bwa-card">
                <div className="bwa-row" style={{ marginBottom: '14px' }}>
                  <h3>Questions &amp; Answers</h3>
                  <button
                    type="button"
                    className="bwa-btn sm pri"
                    onClick={() => {
                      const items = settings.faq?.items || [];
                      updateField('faq.items', [
                        ...items,
                        { question: 'New Question', answer: 'Answer text...' }
                      ]);
                    }}
                  >
                    <Icon name="plus" size={14} /> Add FAQ item
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(settings.faq?.items || []).map((it, i) => (
                    <div key={i} className="bwa-card" style={{ background: '#FAF6EE', padding: '16px' }}>
                      <div className="bwa-row" style={{ marginBottom: '8px' }}>
                        <b>FAQ {i + 1}</b>
                        <button
                          type="button"
                          className="bwa-ib del"
                          onClick={() => {
                            const next = settings.faq.items.filter((_, idx) => idx !== i);
                            updateField('faq.items', next);
                          }}
                          aria-label="Delete"
                        >
                          <Icon name="trash" size={14} />
                        </button>
                      </div>
                      <div className="bwa-f">
                        <input
                          type="text"
                          value={it.question}
                          onChange={(e) => updateField(`faq.items.${i}.question`, e.target.value)}
                          placeholder="Question"
                        />
                      </div>
                      <div className="bwa-f">
                        <textarea
                          rows={2}
                          value={it.answer}
                          onChange={(e) => updateField(`faq.items.${i}.answer`, e.target.value)}
                          placeholder="Answer"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: CTA */}
          {step === 'cta' && (
            <div>
              <h1>Final Call to Action</h1>
              <p className="bwa-lead">The bottom enrollment banner on the /course catalog page.</p>

              <div className="bwa-card">
                <h3>CTA Banner</h3>
                <div className="bwa-f">
                  <label>Eyebrow label</label>
                  <input
                    type="text"
                    value={settings.cta?.label || ''}
                    onChange={(e) => updateField('cta.label', e.target.value)}
                  />
                </div>
                <div className="bwa-f">
                  <label>Heading</label>
                  <input
                    type="text"
                    value={settings.cta?.heading || ''}
                    onChange={(e) => updateField('cta.heading', e.target.value)}
                  />
                </div>
                <div className="bwa-f">
                  <label>Description</label>
                  <textarea
                    rows={3}
                    value={settings.cta?.description || ''}
                    onChange={(e) => updateField('cta.description', e.target.value)}
                  />
                </div>
                <div className="bwa-grid2">
                  <div className="bwa-f">
                    <label>Badge 1</label>
                    <input
                      type="text"
                      value={settings.cta?.badge1 || ''}
                      onChange={(e) => updateField('cta.badge1', e.target.value)}
                    />
                  </div>
                  <div className="bwa-f">
                    <label>Badge 2</label>
                    <input
                      type="text"
                      value={settings.cta?.badge2 || ''}
                      onChange={(e) => updateField('cta.badge2', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
