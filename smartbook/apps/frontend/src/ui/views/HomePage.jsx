import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { env } from '../../lib/env';
import { supabase } from '../../lib/supabase';

const css = `
.sb-home {
  --sb-blue: #2563eb;
  --sb-blue-2: #1d4ed8;
  --sb-blue-50: #eff6ff;
  --sb-blue-100: #dbeafe;
  --sb-text: #0f172a;
  --sb-muted: #64748b;
  --sb-border: #e2e8f0;
  --sb-bg: #f8fafc;
  --sb-card: #ffffff;
  --sb-shadow: 0 12px 40px rgba(15, 23, 42, 0.10);
  --sb-shadow-2: 0 8px 30px rgba(37, 99, 235, 0.16);

  min-height: 100vh;
  background: var(--sb-bg);
  color: var(--sb-text);
  display: flex;
  justify-content: center;
  padding: 0;
}

.sb-home * { box-sizing: border-box; }

.sb-page {
  width: 100%;
  max-width: 430px;
  min-height: 100vh;
  background: var(--sb-card);
  overflow: hidden;
}

.sb-nav {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--sb-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
}

.sb-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 1000;
  font-size: 23px;
  letter-spacing: -0.02em;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  color: inherit;
}
.sb-brand:focus-visible { outline: 3px solid rgba(37, 99, 235, 0.25); outline-offset: 3px; border-radius: 12px; }

.sb-mark {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--sb-blue);
  display: grid;
  place-items: center;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.22);
}
.sb-mark svg { width: 40px; height: 40px; fill: white; }

.sb-login {
  border: 0;
  cursor: pointer;
  background: var(--sb-blue);
  color: white;
  border-radius: 999px;
  padding: 9px 18px;
  font-weight: 700;
  font-size: 25px;
  transition: transform 120ms ease, background 150ms ease;
}
.sb-login:hover { background: var(--sb-blue-2); transform: translateY(-1px); }
.sb-login:active { transform: translateY(0px); }
.sb-login.hidden { display: none; }

.sb-hero {
  padding: 34px 22px 0;
}

.sb-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  background: var(--sb-blue-50);
  color: var(--sb-blue);
  padding: 7px 12px;
  font-size: 18px;
  font-weight: 700;
}
.sb-badge svg { width: 14px; height: 14px; }

.sb-title {
  margin: 18px 0 12px;
  font-size: 34px;
  line-height: 1.12;
  letter-spacing: -0.03em;
  font-weight: 900;
}
.sb-title .accent { color: var(--sb-blue); }

.sb-subtitle {
  margin: 0 0 26px;
  color: var(--sb-muted);
  font-size: 20px;
  line-height: 1.6;
}

.sb-mockup-wrap {
  margin: 0 -8px;
  padding: 0 8px 18px;
}

.sb-mockup {
  border-radius: 22px;
  background: linear-gradient(180deg, var(--sb-blue-50) 0%, #ffffff 70%);
  padding: 18px 16px 0;
  box-shadow: 0 18px 60px rgba(2, 6, 23, 0.08);
  position: relative;
  overflow: hidden;
}

.sb-mockup::after {
  content: "";
  position: absolute;
  right: -30px;
  top: 90px;
  width: 110px;
  height: 110px;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 30%, rgba(37,99,235,0.35), rgba(37,99,235,0.0) 60%);
}

.sb-window {
  background: white;
  border: 1px solid var(--sb-border);
  border-radius: 14px;
  box-shadow: var(--sb-shadow-2);
  overflow: hidden;
}

.sb-window-top {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--sb-border);
}
.sb-dot { width: 8px; height: 8px; border-radius: 999px; }
.sb-dot.red { background: #fb7185; }
.sb-dot.yellow { background: #fbbf24; }
.sb-dot.green { background: #34d399; }

.sb-window-body {
  padding: 14px;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 10px;
}

.sb-lines { display: grid; gap: 8px; }
.sb-line { height: 10px; border-radius: 999px; background: var(--sb-blue-100); }
.sb-line.w1 { width: 78%; }
.sb-line.w2 { width: 60%; }
.sb-line.w3 { width: 45%; }
.sb-card-mini {
  height: 56px;
  border-radius: 12px;
  background: #0f172a;
  opacity: 0.9;
}

.sb-side {
  display: grid;
  gap: 8px;
  align-content: start;
}
.sb-side-tile {
  border-radius: 12px;
  border: 1px solid var(--sb-border);
  background: white;
  padding: 10px;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.06);
}
.sb-side-tile .sb-line { height: 8px; }
.sb-side-tile .sb-line.w1 { width: 65%; background: var(--sb-blue); }
.sb-side-tile .sb-line.w2 { width: 78%; }

.sb-window-bottom {
  padding: 14px;
  display: grid;
  grid-template-columns: 1fr 72px;
  gap: 10px;
  border-top: 1px solid var(--sb-border);
  background: #ffffff;
}
.sb-stack {
  display: grid;
  gap: 10px;
}
.sb-slab {
  border-radius: 14px;
  background: #f1f5f9;
  height: 62px;
}
.sb-slab.big { height: 116px; }
.sb-bar {
  border-radius: 16px;
  background: var(--sb-blue);
  height: 188px;
}

.sb-section {
  padding: 18px 22px 0;
}

.sb-action {
  border: 1px solid var(--sb-border);
  border-radius: 20px;
  padding: 18px 16px;
  background: white;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.06);
  display: grid;
  gap: 12px;
  margin-bottom: 14px;
}

.sb-action-top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.sb-action-ic {
  width:150px;
  height: 40px;
  border-radius: 14px;
  background: var(--sb-blue);
  display: grid;
  place-items: center;
  color: white;
}
.sb-action-ic.alt {
  background: #f1f5f9;
  color: var(--sb-text);
  border: 1px solid var(--sb-border);
}
.sb-action-ic svg { width: 30px; height: 30px; }
.sb-action-title {
  font-weight: 900;
  font-size: 20px;
  line-height: 1.2;
  margin-top: 2px;
}
.sb-action-desc {
  margin: 0;
  color: var(--sb-muted);
  font-size: 18px;
  line-height: 1.5;
}

.sb-action-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  width: fit-content;
  border: 0;
  cursor: pointer;
  padding: 15px 30px;
  border-radius: 14px;
  background: var(--sb-blue);
  color: white;
  font-weight: 800;
  font-size: 17px;
  transition: background 150ms ease, transform 120ms ease;
}
.sb-action-cta.secondary {
  background: white;
  color: var(--sb-blue);
  border: 1px solid var(--sb-blue);
}
.sb-action-cta.hidden { display: none; }
.sb-action-cta:hover { background: var(--sb-blue-2); transform: translateY(-1px); }
.sb-action-cta.secondary:hover { background: var(--sb-blue-50); transform: translateY(-1px); }
.sb-action-cta svg { width: 16px; height: 16px; }

.sb-value {
  padding: 26px 22px 0;
}
.sb-value h2 {
  margin: 0 0 10px;
  font-size: 33px;
  line-height: 1.12;
  font-weight: 900;
  letter-spacing: -0.03em;
}
.sb-value p {
  margin: 0 0 18px;
  color: var(--sb-muted);
  font-size: 19px;
  line-height: 1.6;
}

.sb-features {
  display: grid;
  gap: 12px;
  padding-bottom: 26px;
}
.sb-feature {
  border: 1px solid var(--sb-border);
  border-radius: 18px;
  padding: 16px;
  background: white;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.05);
  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 12px;
}
.sb-feature-ic {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid var(--sb-border);
  display: grid;
  place-items: center;
  color: var(--sb-blue);
}
.sb-feature-ic svg { width: 23px; height: 23px; }
.sb-feature-title { font-weight: 900; font-size: 23px; margin-bottom: 4px; }
.sb-feature-desc { margin: 0; color: var(--sb-muted); font-size: 12.5px; line-height: 1.55; }

.sb-footer {
  border-top: 1px solid var(--sb-border);
  padding: 22px 22px 28px;
  background: #f8fafc;
  color: var(--sb-muted);
}
.sb-footer-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--sb-text);
  font-weight: 900;
  margin-bottom: 10px;
}
.sb-footer-brand .sb-mark { box-shadow: none; }
.sb-footer-copy {
  margin: 0 0 12px;
  font-size: 12px;
  line-height: 1.5;
}
.sb-footer-link {
  display: inline-block;
  color: var(--sb-blue);
  font-weight: 700;
  font-size: 12px;
  text-decoration: none;
  margin-bottom: 12px;
}
.sb-footer-link:hover { text-decoration: underline; }
.sb-socials { display: flex; gap: 10px; }
.sb-social {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: 1px solid var(--sb-border);
  background: white;
  display: grid;
  place-items: center;
  cursor: pointer;
}
.sb-social svg { width: 18px; height: 18px; fill: #475569; }
.sb-social:hover svg { fill: var(--sb-blue); }

@media (min-width: 520px) {
  .sb-home { padding: 14px 0; }
  .sb-page { border-radius: 18px; box-shadow: 0 18px 60px rgba(15, 23, 42, 0.10); }
}

@media (min-width: 900px) {
  .sb-home { padding: 24px 0; align-items: flex-start; }
  .sb-page { max-width: 1100px; min-height: auto; border-radius: 26px; }
  .sb-hero { padding: 38px 28px 0; }
  .sb-section { padding: 18px 28px 0; }
  .sb-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .sb-action { margin-bottom: 0; }
  .sb-footer { padding: 22px 28px 28px; }
}
`;

function LogoMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 7.25C6 6.01 7.01 5 8.25 5h7.5C16.99 5 18 6.01 18 7.25v9.5c0 1.24-1.01 2.25-2.25 2.25h-7.5C7.01 19 6 17.99 6 16.75v-9.5Zm2.25-.75a.75.75 0 0 0-.75.75v9.5c0 .41.34.75.75.75h7.5c.41 0 .75-.34.75-.75v-9.5a.75.75 0 0 0-.75-.75h-7.5Z" />
      <path d="M9 9.25c0-.41.34-.75.75-.75h4.5c.41 0 .75.34.75.75 0 .41-.34.75-.75.75h-4.5A.75.75 0 0 1 9 9.25Zm0 3.5c0-.41.34-.75.75-.75h3c.41 0 .75.34.75.75 0 .41-.34.75-.75.75h-3a.75.75 0 0 1-.75-.75Z" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2.5l1.8 5.3 5.3 1.8-5.3 1.8L12 16.7l-1.8-5.3L4.9 9.6l5.3-1.8L12 2.5Z"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M13.5 5.5a1 1 0 0 1 1.4 0l6 6a1 1 0 0 1 0 1.4l-6 6a1 1 0 1 1-1.4-1.4l4.3-4.3H4a1 1 0 1 1 0-2h13.8l-4.3-4.3a1 1 0 0 1 0-1.4Z"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 5a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H6a1 1 0 1 1 0-2h5V6a1 1 0 0 1 1-1Z"
      />
    </svg>
  );
}

function DoorIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9.41a2 2 0 0 0-.59-1.41l-3.41-3.41A2 2 0 0 0 13.59 4H7Zm6.5 2.5v3a1 1 0 0 0 1 1h3V19a.5.5 0 0 1-.5.5H7a.5.5 0 0 1-.5-.5V5a.5.5 0 0 1 .5-.5h6.5Z"
      />
      <path fill="currentColor" d="M10.75 12a1.25 1.25 0 1 0 0 2.5A1.25 1.25 0 0 0 10.75 12Z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7.6 2.5h8.8c1.1 0 2 .9 2 2v15c0 1.1-.9 2-2 2H7.6c-1.1 0-2-.9-2-2v-15c0-1.1.9-2 2-2Zm0 2a.5.5 0 0 0-.5.5v15c0 .28.22.5.5.5h8.8a.5.5 0 0 0 .5-.5v-15a.5.5 0 0 0-.5-.5H7.6Zm3.4 14.5a1 1 0 1 0 2 0 1 1 0 0 0-2 0Z"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 2.5a1 1 0 0 1 1 1V5h8V3.5a1 1 0 1 1 2 0V5h1a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1V3.5a1 1 0 0 1 1-1Zm12 8H5v8.5a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5V10.5ZM5 7v1.5h14V7a.5.5 0 0 0-.5-.5H5.5A.5.5 0 0 0 5 7Z"
      />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 4h7v7H4V4Zm2 2v3h3V6H6Zm7-2h7v7h-7V4Zm2 2v3h3V6h-3ZM4 13h7v7H4v-7Zm2 2v3h3v-3H6Zm11-2h-2v2h2v-2Zm1 0h2v4h-4v-2h2v-2Zm-2 6h2v1h-2v-1Zm3-2h1v3h-3v-1h2v-2Zm-6 0h2v3h-2v-3Z"
      />
    </svg>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [authReady, setAuthReady] = useState(false);
  const [adminPath, setAdminPath] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token || '';
        if (!mounted) return;
        if (!token) {
          setAdminPath('');
          setAuthReady(true);
          return;
        }

        const resp = await fetch(`${env.VITE_API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await resp.json().catch(() => ({}));
        if (!mounted) return;
        if (resp.ok && body?.center?.slug) {
          setAdminPath(`/c/${body.center.slug}/admin`);
        } else {
          setAdminPath('');
        }
        setAuthReady(true);
      } catch {
        if (!mounted) return;
        setAdminPath('');
        setAuthReady(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const isAuthed = useMemo(() => authReady && Boolean(adminPath), [adminPath, authReady]);

  return (
    <div className="sb-home">
      <style>{css}</style>

      <div className="sb-page">
        <header className="sb-nav">
          <button className="sb-brand" type="button" aria-label="SmartBook" onClick={() => navigate('/')}>
            <div className="sb-mark">
              <LogoMark />
            </div>
            SmartBook
          </button>
          <button
            className={`sb-login ${isAuthed ? 'hidden' : ''}`}
            type="button"
            onClick={() => navigate('/login')}
          >
            Войти
          </button>
        </header>

        <section className="sb-hero">
          <div className="sb-badge">
            <SparkIcon />
            Представляем SmartBook
          </div>

          <h1 className="sb-title">
            Автоматизируйте запись в ваш <span className="accent">образовательный центр</span>
          </h1>

          <p className="sb-subtitle">
            Управляйте учениками, расписанием и регистрациями в одном месте. Хватит
            бороться с таблицами - начните увеличивать набор.
          </p>

          <div className="sb-mockup-wrap" aria-hidden="true">
            <div className="sb-mockup">
              <div className="sb-window">
                <div className="sb-window-top">
                  <div className="sb-dot red" />
                  <div className="sb-dot yellow" />
                  <div className="sb-dot green" />
                </div>
                <div className="sb-window-body">
                  <div className="sb-lines">
                    <div className="sb-line w1" />
                    <div className="sb-line w2" />
                    <div className="sb-line w3" />
                    <div className="sb-card-mini" />
                  </div>
                  <div className="sb-side">
                    <div className="sb-side-tile">
                      <div className="sb-line w1" />
                      <div className="sb-line w2" />
                    </div>
                    <div className="sb-side-tile">
                      <div className="sb-line w2" />
                      <div className="sb-line w3" />
                    </div>
                  </div>
                </div>
                <div className="sb-window-bottom">
                  <div className="sb-stack">
                    <div className="sb-slab" />
                    <div className="sb-slab big" />
                  </div>
                  <div className="sb-bar" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sb-section" aria-label="Действия">
          <article className="sb-action">
            <div className="sb-action-top">

              <div>
                <div className="sb-action-title">Создать центр</div>
                <p className="sb-action-desc">
                  Настройте профиль центра и начните принимать заявки от родителей и студентов
                  менее чем за 10 минут.
                </p>
              </div>
            </div>
            <button
              className={`sb-action-cta ${isAuthed ? 'hidden' : ''}`}
              type="button"
              onClick={() => navigate('/create-center')}
            >
              Начать сейчас <ArrowRightIcon />
            </button>
          </article>

          <article className="sb-action">
            <div className="sb-action-top">
              <div>
                <div className="sb-action-title">Вход для администратора</div>
                <p className="sb-action-desc">
                  Используйте личную панель для управления расписанием, просмотра отчётов по
                  посещаемости и финансовых выписок.
                </p>
              </div>
            </div>
            <button
              className="sb-action-cta secondary"
              type="button"
              onClick={() => (isAuthed ? navigate(adminPath) : navigate('/login'))}
            >
              В панель управления <ArrowRightIcon />
            </button>
          </article>
        </section>

        <section className="sb-value" aria-label="Преимущества">
          <h2>Создано для операционной эффективности</h2>
          <p>
            Мы устраняем все сложности в управлении центром, чтобы вы могли
            сосредоточиться на обучении.
          </p>

          <div className="sb-features">
            <div className="sb-feature">
              <div className="sb-feature-ic">
                <PhoneIcon />
              </div>
              <div>
                <div className="sb-feature-title">Без лишних звонков</div>
                <p className="sb-feature-desc">
                  Портал самообслуживания позволяет студентам регистрироваться 24/7 без вашего участия.
                </p>
              </div>
            </div>

            <div className="sb-feature">
              <div className="sb-feature-ic">
                <CalendarIcon />
              </div>
              <div>
                <div className="sb-feature-title">Автоматическое расписание</div>
                <p className="sb-feature-desc">
                  Умное разрешение конфликтов гарантирует запись без двойных броней для преподавателей и аудиторий.
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="sb-footer">
          <div className="sb-footer-brand">
            <div className="sb-mark">
              <LogoMark />
            </div>
            SmartBook
          </div>
          <p className="sb-footer-copy">© 2026 SmartBook - Rajs</p>

          <div className="sb-socials" aria-label="Социальные сети">
            <a
              className="sb-social"
              href="https://t.me/moril1e"
              target="_blank"
              rel="noreferrer"
              aria-label="Telegram"
            >
              <svg viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0h-.056Zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635Z" />
              </svg>
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
