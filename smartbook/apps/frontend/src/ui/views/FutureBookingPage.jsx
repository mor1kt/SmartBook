import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { env } from '../../lib/env';

const css = `
.fb-root{
  --fb-blue:#2563eb;
  --fb-blue-2:#1d4ed8;
  --fb-text:#0f172a;
  --fb-muted:#64748b;
  --fb-border:#e2e8f0;
  --fb-bg:#f6f8fb;
  --fb-card:#ffffff;
  --fb-shadow: 0 18px 50px rgba(15,23,42,.10);
  --fb-shadow-2: 0 12px 26px rgba(15,23,42,.06);
  min-height:100vh;
  background:var(--fb-bg);
  display:flex;
  justify-content:center;
  color:var(--fb-text);
}
.fb-root *{ box-sizing:border-box; }
.fb-shell{ width:100%; max-width:430px; min-height:100vh; background:var(--fb-bg); }
.fb-topbar{
  position:sticky; top:0; z-index:10;
  background:rgba(246,248,251,.92);
  backdrop-filter: blur(10px);
  border-bottom:1px solid var(--fb-border);
  padding:12px 16px;
  display:flex;
  align-items:center;
  justify-content:space-between;
}
.fb-brand{ font-weight:900; letter-spacing:-0.02em; }
.fb-avatar{
  width:34px; height:34px;
  border-radius:999px;
  border:1px solid var(--fb-border);
  background:white;
  display:grid;
  place-items:center;
}
.fb-avatar svg{ width:18px; height:18px; fill:#334155; }
.fb-main{ padding:18px 16px 26px; }
.fb-title{
  margin:10px 0 8px;
  font-size:44px;
  font-weight:1000;
  letter-spacing:-0.04em;
  line-height:0.96;
}
.fb-title .accent{ color:var(--fb-blue); }
.fb-sub{
  margin:0 0 16px;
  color:var(--fb-muted);
  font-weight:800;
  line-height:1.55;
}
.fb-card{
  margin-top:10px;
  background:white;
  border-radius:22px;
  box-shadow:var(--fb-shadow);
  padding:16px;
}
.fb-label{
  margin-top:14px;
  font-size:11px;
  letter-spacing:.12em;
  font-weight:1000;
  text-transform:uppercase;
  color:#0f172a;
}
.fb-input, .fb-textarea{
  width:100%;
  border:1px solid transparent;
  background:#f1f5f9;
  border-radius:14px;
  padding:12px 12px;
  outline:none;
  font-size:14px;
  margin-top:8px;
}
.fb-textarea{ min-height:120px; resize:vertical; }
.fb-input:focus, .fb-textarea:focus{
  background:white;
  border-color:rgba(37,99,235,.55);
  box-shadow:0 0 0 3px rgba(37,99,235,.12);
}
.fb-hint{
  margin-top:10px;
  color:var(--fb-muted);
  font-weight:800;
  font-size:12.5px;
  line-height:1.4;
}
.fb-submit{
  margin-top:14px;
  width:100%;
  border:0;
  border-radius:16px;
  padding:14px 14px;
  font-weight:1000;
  color:white;
  cursor:pointer;
  background: linear-gradient(180deg, var(--fb-blue) 0%, var(--fb-blue-2) 100%);
  box-shadow: 0 18px 30px rgba(37,99,235,.25);
  display:flex;
  align-items:center;
  justify-content:center;
  gap:10px;
}
.fb-submit:disabled{ opacity:.55; cursor:not-allowed; box-shadow:none; }
.fb-error{ margin-top:12px; color:#b91c1c; font-weight:900; font-size:13px; line-height:1.4; }
.fb-ok{ margin-top:12px; color:#047857; font-weight:900; font-size:13px; line-height:1.4; }
.fb-footer{
  margin-top:26px;
  text-align:center;
  color:#94a3b8;
  font-weight:800;
  font-size:13px;
  padding:18px 0 8px;
}
.fb-footer strong{ color:#0f172a; font-weight:1000; }
.fb-footer a{
  display:inline-block;
  margin-top:10px;
  color:var(--fb-blue);
  text-decoration:none;
  font-weight:1000;
}
.fb-footer a:hover{ text-decoration:underline; }

@media (min-width: 900px) {
  .fb-root { padding: 24px 0; align-items: flex-start; }
  .fb-shell { max-width: 1100px; min-height: auto; border-radius: 26px; overflow: hidden; box-shadow: var(--fb-shadow); }
  .fb-main { padding: 18px 22px 26px; }
  .fb-card { max-width: 560px; }
  .fb-footer { max-width: 560px; margin-left: auto; margin-right: auto; }
}
`;

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12a4.6 4.6 0 1 0-4.6-4.6A4.6 4.6 0 0 0 12 12Zm0 2c-4.4 0-8 2.2-8 4.9V21h16v-2.1C20 16.2 16.4 14 12 14Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" style={{ fill: 'currentColor' }}>
      <path d="M13 5a1 1 0 0 1 1.7-.7l6 6a1 1 0 0 1 0 1.4l-6 6A1 1 0 0 1 13 17v-3H4a1 1 0 1 1 0-2h9V5Z" />
    </svg>
  );
}

export default function FutureBookingPage() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const [phone, setPhone] = useState('');
  const [wishes, setWishes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const canSubmit = useMemo(() => Boolean(String(phone).trim()), [phone]);

  const submit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError('');
    setOk('');
    try {
      const resp = await fetch(`${env.VITE_API_BASE_URL}/c/${slug}/future/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_phone: String(phone).trim(),
          wishes: String(wishes).trim(),
        }),
      });
      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(body?.error || 'Не удалось отправить заявку');
      setOk('Заявка отправлена. Мы свяжемся с вами, когда появится подходящее окно.');
      setPhone('');
      setWishes('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fb-root">
      <style>{css}</style>
      <div className="fb-shell">
        <header className="fb-topbar">
          <div className="fb-brand">SmartBook</div>
          <div className="fb-avatar" aria-hidden="true">
            <UserIcon />
          </div>
        </header>

        <main className="fb-main">
          <h1 className="fb-title">
            Забронируйте
            <br />
            место на
            <br />
            <span className="accent">будущее</span>
          </h1>
          <p className="fb-sub">
            Наши группы быстро заполняются. Запишитесь в лист ожидания, и мы сообщим вам о свободном месте.
          </p>

          <section className="fb-card" aria-label="Форма записи на будущее">
            <div className="fb-label">Контактный номер</div>
            <input
              className="fb-input"
              placeholder="+7 (999) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <div className="fb-label">Пожелания</div>
            <textarea
              className="fb-textarea"
              placeholder={"например: 'хотим в июле' или\n'утренние смены'"}
              value={wishes}
              onChange={(e) => setWishes(e.target.value)}
            />
            <div className="fb-hint">
              Укажите желаемые месяцы или удобный график, чтобы мы подобрали вариант быстрее.
            </div>

            <button className="fb-submit" type="button" onClick={submit} disabled={!canSubmit || submitting}>
              {submitting ? 'Отправляем…' : 'Отправить заявку'} <ArrowIcon />
            </button>

            {error ? <div className="fb-error">{error}</div> : null}
            {ok ? <div className="fb-ok">{ok}</div> : null}
          </section>

          <footer className="fb-footer">
            <div>
              <strong>SmartBook</strong>
            </div>
            <div>© 2026 SmartBook - Rajs</div>
            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                navigate('/login');
              }}
            >
              Войти как Админ
            </a>
          </footer>
        </main>
      </div>
    </div>
  );
}
