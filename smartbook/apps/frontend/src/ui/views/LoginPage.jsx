import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { env } from '../../lib/env';
import { supabase } from '../../lib/supabase';

const css = `
.lp-root {
  --lp-blue: #2563eb;
  --lp-blue-2: #1d4ed8;
  --lp-bg: #f1f5f9;
  --lp-card: #ffffff;
  --lp-text: #0f172a;
  --lp-muted: #64748b;
  --lp-border: #e2e8f0;
  --lp-input: #f3f4f6;
  --lp-shadow: 0 22px 60px rgba(15, 23, 42, 0.14);
  --lp-shadow-2: 0 12px 26px rgba(37, 99, 235, 0.20);

  min-height: 100vh;
  background: radial-gradient(1100px 420px at 50% 28%, rgba(37, 99, 235, 0.12), rgba(37, 99, 235, 0) 55%), var(--lp-bg);
  display: flex;
  justify-content: center;
  color: var(--lp-text);
}

.lp-root * { box-sizing: border-box; }

.lp-page {
  width: 100%;
  max-width: 430px;
  min-height: 100vh;
  padding: 22px 18px 18px;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 14px;
}

.lp-top {
  display: grid;
  justify-items: center;
  gap: 10px;
  padding-top: 6px;
}

.lp-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 900;
  font-size: 26px;
  letter-spacing: -0.02em;
}

.lp-mark {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--lp-blue);
  display: grid;
  place-items: center;
  box-shadow: 0 10px 22px rgba(37, 99, 235, 0.25);
}
.lp-mark svg { width: 18px; height: 18px; fill: white; }

.lp-subtitle {
  color: var(--lp-muted);
  font-weight: 700;
}

.lp-card-wrap {
  display: grid;
  align-content: start;
  padding-top: 8px;
}

.lp-card {
  border-radius: 22px;
  background: var(--lp-card);
  box-shadow: var(--lp-shadow);
  padding: 22px 18px 18px;
}

.lp-title {
  font-size: 28px;
  font-weight: 900;
  margin: 0;
}

.lp-underline {
  width: 86px;
  height: 4px;
  border-radius: 999px;
  background: var(--lp-blue);
  margin-top: 10px;
}

.lp-form {
  margin-top: 20px;
  display: grid;
  gap: 16px;
}

.lp-label {
  display: grid;
  gap: 10px;
  font-weight: 800;
}
.lp-label > span {
  font-size: 14px;
  color: #111827;
}

.lp-input {
  width: 100%;
  border: 1px solid transparent;
  background: var(--lp-input);
  border-radius: 14px;
  padding: 14px 14px;
  font-size: 16px;
  outline: none;
  transition: box-shadow 120ms ease, border-color 120ms ease;
}
.lp-input::placeholder { color: #6b7280; }
.lp-input:focus {
  border-color: rgba(37, 99, 235, 0.35);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
}

.lp-pass {
  position: relative;
  display: grid;
}
.lp-pass .lp-input { padding-right: 48px; }

.lp-eye {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  border: 0;
  background: transparent;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  cursor: pointer;
  color: #6b7280;
}
.lp-eye:hover { background: rgba(15, 23, 42, 0.06); }
.lp-eye svg { width: 20px; height: 20px; fill: currentColor; }

.lp-submit {
  margin-top: 4px;
  border: 0;
  cursor: pointer;
  border-radius: 16px;
  padding: 14px 16px;
  font-weight: 900;
  font-size: 18px;
  color: white;
  background: linear-gradient(180deg, var(--lp-blue) 0%, var(--lp-blue-2) 100%);
  box-shadow: var(--lp-shadow-2);
  transition: transform 120ms ease, filter 150ms ease;
}
.lp-submit:hover { filter: brightness(1.02); transform: translateY(-1px); }
.lp-submit:active { transform: translateY(0px); }
.lp-submit:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  filter: none;
  transform: none;
  box-shadow: none;
}

.lp-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 16px 0 14px;
}

.lp-bottom {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 8px;
  color: var(--lp-muted);
  font-weight: 700;
}

.lp-link {
  border: 0;
  background: transparent;
  cursor: pointer;
  color: var(--lp-blue);
  font-weight: 900;
  padding: 0;
}
.lp-link:hover { text-decoration: underline; }

.lp-footer {
  text-align: center;
  color: #94a3b8;
  font-weight: 700;
  font-size: 13px;
  padding-bottom: 4px;
}

@media (min-width: 900px) {
  .lp-root {
    align-items: center;
    padding: 28px 0;
  }
  .lp-page {
    min-height: auto;
    max-width: 980px;
    grid-template-rows: auto auto auto;
    padding: 26px 22px 18px;
  }
  .lp-card-wrap {
    padding-top: 6px;
    justify-items: center;
  }
  .lp-card {
    width: 520px;
  }
}
`;

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.5 3.5h10A2.5 2.5 0 0 1 19 6v13.2c0 .72-.58 1.3-1.3 1.3H7.6A2.6 2.6 0 0 0 5 23V6A2.5 2.5 0 0 1 7.5 3.5Zm.9 4.3h8.8c.5 0 .9-.4.9-.9s-.4-.9-.9-.9H7.4c-.5 0-.9.4-.9.9s.4.9.9.9Zm0 3.4h8.8c.5 0 .9-.4.9-.9s-.4-.9-.9-.9H7.4c-.5 0-.9.4-.9.9s.4.9.9.9Z" />
    </svg>
  );
}

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5c5.5 0 9.8 4.1 11 7-1.2 2.9-5.5 7-11 7S2.2 14.9 1 12c1.2-2.9 5.5-7 11-7Zm0 2C8 7 4.6 9.9 3.3 12 4.6 14.1 8 17 12 17s7.4-2.9 8.7-5C19.4 9.9 16 7 12 7Zm0 2.3A2.7 2.7 0 1 1 9.3 12 2.7 2.7 0 0 1 12 9.3Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.3 3.7a1 1 0 0 1 1.4 0l16.6 16.6a1 1 0 1 1-1.4 1.4l-2.3-2.3A12.4 12.4 0 0 1 12 19c-5.5 0-9.8-4.1-11-7a13.7 13.7 0 0 1 4.2-5.2L2.3 5.1a1 1 0 0 1 0-1.4Zm5.3 5.3a7.2 7.2 0 0 0-2.9 3c1.3 2.1 4.7 5 8.3 5a10 10 0 0 0 2.1-.2l-1.8-1.8a2.7 2.7 0 0 1-3.6-3.6L7.6 9Zm9.1 9.1-2-2a2.7 2.7 0 0 0-3.8-3.8l-2-2A10 10 0 0 1 12 7c4 0 7.4 2.9 8.7 5a13.8 13.8 0 0 1-4 4.1Z" />
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = useMemo(() => email.trim() && password.trim(), [email, password]);

  function humanizeAuthError(message) {
    const m = String(message || '').toLowerCase();
    if (m.includes('invalid login credentials')) return 'Неверный email или пароль.';
    if (m.includes('email not confirmed')) return 'Подтвердите email и попробуйте снова.';
    if (m.includes('too many requests')) return 'Слишком много попыток. Попробуйте позже.';
    if (m.includes('not an admin')) return 'У этого аккаунта нет доступа к панели управления.';
    if (m.includes('no center attached')) return 'Аккаунт не привязан к центру.';
    if (m.includes('missing bearer token') || m.includes('invalid token')) return 'Сессия устарела. Войдите заново.';
    if (m.includes('network') || m.includes('failed to fetch')) return 'Ошибка сети. Проверьте интернет и попробуйте снова.';
    return String(message || 'Ошибка входа');
  }

  async function resolveDefaultNext(accessToken) {
    const resp = await fetch(`${env.VITE_API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const body = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      const msg = body?.error || `Auth error: ${resp.status}`;
      throw new Error(humanizeAuthError(msg));
    }

    if (!body?.center?.slug) return null;
    return `/c/${body.center.slug}/admin`;
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      const session = data.session;
      if (!session?.access_token) return;

      const next = searchParams.get('next');
      if (next && next.startsWith('/')) {
        navigate(next, { replace: true });
        return;
      }

      try {
        const defaultNext = await resolveDefaultNext(session.access_token);
        if (defaultNext) {
          navigate(defaultNext, { replace: true });
        }
      } catch {
        // ignore and keep on login page
      }
    })();

    return () => {
      mounted = false;
    };
  }, [navigate, searchParams]);

  return (
    <div className="lp-root">
      <style>{css}</style>

      <div className="lp-page">
        <header className="lp-top">
          <div className="lp-brand" aria-label="SmartBook">
            <div className="lp-mark">
              <BookIcon />
            </div>
            SmartBook
          </div>
          <div className="lp-subtitle">Вход в панель управления</div>
        </header>

        <main className="lp-card-wrap">
          <section className="lp-card" aria-label="Вход">
            <h1 className="lp-title">Войти в аккаунт</h1>
            <div className="lp-underline" />

            <form className="lp-form" onSubmit={async (e) => {
              e.preventDefault();
              if (!canSubmit || submitting) return;

              setSubmitting(true);
              setError('');

              try {
                const { data, error: signInError } = await supabase.auth.signInWithPassword({
                  email: email.trim(),
                  password,
                });

                if (signInError) throw signInError;
                const accessToken = data.session?.access_token;
                if (!accessToken) throw new Error('Не удалось получить токен');

                const next = searchParams.get('next');
                if (next && next.startsWith('/')) {
                  navigate(next, { replace: true });
                  return;
                }

                const defaultNext = await resolveDefaultNext(accessToken);
                if (defaultNext) {
                  navigate(defaultNext, { replace: true });
                  return;
                }

                navigate('/', { replace: true });
              } catch (err) {
                const raw = String(err?.message ?? err ?? 'Ошибка входа');
                setError(humanizeAuthError(raw));
              } finally {
                setSubmitting(false);
              }
            }}>
              <label className="lp-label">
                <span>Email</span>
                <input
                  className="lp-input"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="example@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <label className="lp-label">
                <span>Пароль</span>
                <div className="lp-pass">
                  <input
                    className="lp-input"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    className="lp-eye"
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </label>

              <button className="lp-submit" type="submit" disabled={!canSubmit || submitting}>
                {submitting ? 'Входим…' : 'Войти'}
              </button>

              {error ? (
                <div style={{ color: '#b91c1c', fontWeight: 800, fontSize: 13, lineHeight: 1.4 }}>
                  {error}
                </div>
              ) : null}

              <div className="lp-divider" role="separator" />

              <div className="lp-bottom">
                <span>Нет аккаунта?</span>
                <button className="lp-link" type="button" onClick={() => navigate('/create-center')}>
                  Создать центр
                </button>
              </div>
            </form>
          </section>
        </main>

        <footer className="lp-footer">© 2026 SmartBook - Rajs</footer>
      </div>
    </div>
  );
}
