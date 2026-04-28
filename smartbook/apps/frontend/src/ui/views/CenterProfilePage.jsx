import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { env } from '../../lib/env';

const css = `
.cp-page {
  --cp-blue: #2563eb;
  --cp-blue-2: #1d4ed8;
  --cp-blue-50: #eff6ff;
  --cp-text: #0f172a;
  --cp-muted: #64748b;
  --cp-border: #e2e8f0;
  --cp-bg: #f8fafc;
  --cp-card: #ffffff;
  --cp-shadow: 0 12px 40px rgba(15, 23, 42, 0.10);

  min-height: 100vh;
  background: var(--cp-bg);
  display: flex;
  justify-content: center;
}
.cp-page * { box-sizing: border-box; }

.cp-shell {
  width: 100%;
  max-width: 430px;
  min-height: 100vh;
  background: var(--cp-bg);
}

.cp-topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(248, 250, 252, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--cp-border);
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cp-back {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  border: 1px solid var(--cp-border);
  background: white;
  display: grid;
  place-items: center;
  cursor: pointer;
}
.cp-back svg { width: 18px; height: 18px; fill: #334155; }

.cp-brand {
  font-weight: 900;
  letter-spacing: -0.02em;
  color: var(--cp-text);
}

.cp-avatar {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 2px solid rgba(37, 99, 235, 0.8);
  background: white;
  display: grid;
  place-items: center;
  overflow: hidden;
}
.cp-avatar img { width: 100%; height: 100%; object-fit: cover; }
.cp-avatar-fallback {
  font-weight: 900;
  color: var(--cp-blue);
  font-size: 13px;
}

.cp-main { padding: 18px 16px 26px; }

.cp-title {
  margin: 10px 0 10px;
  font-size: 30px;
  line-height: 0.98;
  letter-spacing: -0.04em;
  font-weight: 1000;
  color: var(--cp-text);
}
  .sb-title {
  margin: 18px 0 12px;
  font-size: 34px;
  line-height: 1.12;
  letter-spacing: -0.03em;
  font-weight: 900;
}
.cp-desc {
  margin: 0 0 16px;
  color: var(--cp-muted);
  font-size: 14px;
  line-height: 1.7;
}

.cp-cta {
  margin-top: 10px;
  display: grid;
  gap: 10px;
}

.cp-cards { display: grid; gap: 14px; margin-top: 10px; }

.cp-card {
  background: var(--cp-card);
  border: 1px solid var(--cp-border);
  border-radius: 22px;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.06);
  padding: 16px;
}

.cp-card-top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.cp-ic {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  display: grid;
  place-items: center;
  font-weight: 1000;
  font-size: 18px;
  color: #0f172a;
}

.cp-card-title {
  margin: 2px 0 6px;
  font-weight: 1000;
  font-size: 22px;
  letter-spacing: -0.02em;
  color: var(--cp-text);
}

.cp-card-desc {
  margin: 0;
  color: var(--cp-muted);
  font-size: 13.5px;
  line-height: 1.55;
}

.cp-actions { display: grid; gap: 10px; margin-top: 14px; }

.cp-btn {
  border: 0;
  width: 100%;
  background: var(--cp-blue);
  color: white;
  border-radius: 18px;
  padding: 14px 16px;
  font-weight: 1000;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 16px 34px rgba(37, 99, 235, 0.22);
}
.cp-btn:hover { background: var(--cp-blue-2); }
.cp-btn.secondary {
  background: #0b56da;
  box-shadow: 0 14px 28px rgba(11, 86, 218, 0.18);
}
.cp-btn[disabled] {
  cursor: not-allowed;
  opacity: 0.55;
  box-shadow: none;
}

.cp-footer {
  margin-top: 26px;
  padding: 26px 16px 34px;
  display: grid;
  gap: 10px;
  justify-items: center;
  color: #334155;
}
.cp-footer-brand { font-weight: 900; }
.cp-footer-copy { margin: 0; color: #94a3b8; font-size: 12.5px; }
.cp-footer-link {
  color: var(--cp-blue);
  text-decoration: none;
  font-weight: 700;
  font-size: 13px;
}
.cp-footer-link:hover { text-decoration: underline; }

.cp-state {
  margin-top: 18px;
  border: 1px dashed #cbd5e1;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.6);
  padding: 14px;
  color: #475569;
  font-size: 13.5px;
}

.cp-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.55);
  display: grid;
  place-items: end center;
  padding: 16px;
  z-index: 50;
}
.cp-modal {
  width: 100%;
  max-width: 430px;
  background: white;
  border-radius: 22px;
  border: 1px solid var(--cp-border);
  box-shadow: 0 40px 120px rgba(2, 6, 23, 0.35);
  overflow: hidden;
}
.cp-modal-head {
  padding: 14px 16px;
  border-bottom: 1px solid var(--cp-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.cp-modal-title { font-weight: 1000; color: var(--cp-text); }
.cp-x {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  border: 1px solid var(--cp-border);
  background: white;
  cursor: pointer;
  display: grid;
  place-items: center;
}
.cp-x svg { width: 18px; height: 18px; fill: #64748b; }
.cp-modal-body { padding: 14px 16px 16px; display: grid; gap: 10px; }
.cp-label {
  font-size: 11px;
  letter-spacing: 0.08em;
  color: #94a3b8;
  font-weight: 1000;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.cp-input {
  width: 100%;
  border: 1px solid var(--cp-border);
  border-radius: 14px;
  background: #f8fafc;
  padding: 12px 12px;
  font-size: 14px;
  outline: none;
  color: var(--cp-text);
}
.cp-input:focus {
  background: white;
  border-color: rgba(37, 99, 235, 0.55);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}
.cp-modal-actions { display: grid; gap: 10px; padding: 0 16px 16px; }

@media (min-width: 900px) {
  .cp-page { padding: 24px 0; align-items: flex-start; }
  .cp-shell { max-width: 1100px; min-height: auto; border-radius: 26px; overflow: hidden; box-shadow: var(--cp-shadow); }
  .cp-main { padding: 18px 22px 26px; }
  .cp-cards { grid-template-columns: 1fr 1fr; }
  .cp-card { height: 100%; }
  .cp-actions { grid-template-columns: 1fr 1fr; }
}
`;

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 11H7.83l4.58-4.59L11 5l-7 7 7 7 1.41-1.41L7.83 13H19v-2z" />
    </svg>
  );
}

function hashHue(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) hash = (hash * 31 + input.charCodeAt(i)) | 0;
  return Math.abs(hash) % 360;
}

export default function CenterProfilePage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);

  const [ok, setOk] = useState('');

  useEffect(() => {
    let canceled = false;
    const run = async () => {
      setLoading(true);
      setError('');
      setOk('');
      try {
        const resp = await fetch(`${env.VITE_API_BASE_URL}/c/${slug}/profile`);
        const json = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(json?.error || 'Не удалось загрузить профиль');
        if (!canceled) setProfile(json);
      } catch (e) {
        if (!canceled) setError(e instanceof Error ? e.message : 'Ошибка');
      } finally {
        if (!canceled) setLoading(false);
      }
    };

    if (slug) run();
    return () => {
      canceled = true;
    };
  }, [slug]);

  const center = profile?.center ?? null;
  const subjects = profile?.subjects ?? [];

  const avatarLetter = useMemo(() => {
    const raw = (center?.name || '').trim();
    return raw ? raw[0].toUpperCase() : 'S';
  }, [center?.name]);

  const goToCourse = (courseId) => {
    if (!courseId) return;
    navigate(`/c/${slug}/course/${courseId}`);
  };

  return (
    <div className="cp-page">
      <style>{css}</style>

      <div className="cp-shell">
        <header className="cp-topbar">
          <button className="cp-back" type="button" onClick={() => navigate(-1)} aria-label="Назад">
            <ArrowLeftIcon />
          </button>
          <div className="cp-brand">SmartBook</div>
          <div className="cp-avatar" aria-label="Логотип центра">
            {center?.logo_url ? (
              <img src={center.logo_url} alt={center?.name || 'Center'} />
            ) : (
              <div className="cp-avatar-fallback">{avatarLetter}</div>
            )}
          </div>
        </header>

        <main className="cp-main">
          {loading ? (
            <div className="cp-state">Загружаем профиль центра…</div>
          ) : error ? (
            <div className="cp-state">{error}</div>
          ) : !center ? (
            <div className="cp-state">Центр не найден.</div>
          ) : (
            <>
              <h1 className="cp-title">{center.name}</h1>
              {center.description ? <p className="cp-desc">{center.description}</p> : null}

              <div className="cp-cta">
                <button className="cp-btn" type="button" onClick={() => navigate(`/c/${slug}/consultation`)}>
                  Индивидуальная консультация
                </button>
              </div>

              {ok ? <div className="cp-state">{ok}</div> : null}

              <section className="cp-cards" aria-label="Предметы">
                {subjects.length === 0 ? (
                  <div className="cp-state">Пока нет активных услуг.</div>
                ) : (
                  subjects.map((s) => {
                    const hue = hashHue(String(s.categoryName || ''));
                    const bg = `hsl(${hue} 85% 96%)`;
                    const fg = `hsl(${hue} 85% 34%)`;
                    const letter = String(s.categoryName || '').trim().slice(0, 1).toUpperCase() || '•';

                    return (
                      <article className="cp-card" key={s.categoryId}>
                        <div className="cp-card-top">
                          <div className="cp-ic" style={{ background: bg, color: fg }}>
                            {letter}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className="cp-card-title">{s.categoryName}</div>
                            {s.description ? <p className="cp-card-desc">{s.description}</p> : null}
                          </div>
                        </div>

                        <div className="cp-actions">
                            <button
                              className="cp-btn"
                              type="button"
                              disabled={!s.groupCourse?.id}
                              onClick={() => goToCourse(s.groupCourse?.id)}
                            >
                              Групповые занятия
                            </button>
                            <button
                              className="cp-btn secondary"
                              type="button"
                              disabled={!s.individualCourse?.id}
                              onClick={() => goToCourse(s.individualCourse?.id)}
                            >
                              Индивидуальные занятия
                            </button>
                        </div>
                      </article>
                    );
                  })
                )}
              </section>

              <footer className="cp-footer">
                <div className="cp-footer-brand">SmartBook</div>
                <p className="cp-footer-copy">© 2026 SmartBook - Rajs</p>
                <a
                  className="cp-footer-link"
                  href={`/login?next=${encodeURIComponent(`/c/${slug}/admin`)}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/login?next=${encodeURIComponent(`/c/${slug}/admin`)}`);
                  }}
                >
                  Войти как Админ
                </a>
              </footer>
            </>
          )}
        </main>
      </div>

      {/* group booking now opens a dedicated page; individual sends a simple request */}
    </div>
  );
}
