import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { env } from '../../lib/env';

const css = `
.ic-page{
  --ic-blue:#2563eb;
  --ic-blue-2:#1d4ed8;
  --ic-text:#0f172a;
  --ic-muted:#64748b;
  --ic-border:#e2e8f0;
  --ic-bg:#f6f8fb;
  --ic-card:#ffffff;
  --ic-shadow: 0 18px 50px rgba(15,23,42,.10);
  --ic-shadow-2: 0 12px 26px rgba(15,23,42,.06);
  min-height:100vh;
  background:var(--ic-bg);
  display:flex;
  justify-content:center;
  color:var(--ic-text);
}
.ic-page *{ box-sizing:border-box; }
.ic-shell{ width:100%; max-width:430px; min-height:100vh; background:var(--ic-bg); }
.ic-topbar{
  position:sticky; top:0; z-index:10;
  background:rgba(246,248,251,.92);
  backdrop-filter: blur(10px);
  border-bottom:1px solid var(--ic-border);
  padding:12px 16px;
  display:flex;
  align-items:center;
  justify-content:space-between;
}
.ic-brand{ font-weight:900; letter-spacing:-0.02em; }
.ic-avatar{
  width:34px; height:34px;
  border-radius:999px;
  border:1px solid var(--ic-border);
  background:white;
  display:grid;
  place-items:center;
}
.ic-avatar svg{ width:18px; height:18px; fill:#334155; }
.ic-main{ padding:16px 16px 26px; }

.ic-hero{
  background:white;
  border-radius:22px;
  box-shadow: var(--ic-shadow-2);
  padding:16px;
}

.ap-brand{ font-weight:1000; letter-spacing:-0.02em; }

.ic-badge{
  font-size:11px;
  letter-spacing:.14em;
  font-weight:1000;
  color: #2563eb;
  text-transform:uppercase;
  margin-bottom:8px;
}
.ic-title{ margin:0; font-size:30px; font-weight:1000; letter-spacing:-0.03em; line-height:1.05; }
.ic-sub{ margin:8px 0 0; color:var(--ic-muted); font-weight:800; }
.ic-price{
  margin-top:12px;
  width:max-content;
  border-radius:18px;
  border:1px solid #dbeafe;
  background:#eff6ff;
  padding:12px 14px;
}
.ic-price .k{ font-size:10px; letter-spacing:.12em; font-weight:1000; color:#475569; text-transform:uppercase; }
.ic-price .v{ margin-top:4px; font-weight:1000; font-size:26px; color:#1d4ed8; }

.ic-h2{ margin:22px 0 2px; font-size:26px; font-weight:1000; letter-spacing:-0.03em; }
.ic-p{ margin:0; color:var(--ic-muted); font-weight:800; line-height:1.5; }

.ic-days{
  margin-top:12px;
  display:flex;
  gap:10px;
  overflow:auto;
  padding-bottom:4px;
}
.ic-day{
  min-width:72px;
  border-radius:16px;
  border:1px solid var(--ic-border);
  background:white;
  padding:10px 10px;
  display:grid;
  justify-items:center;
  gap:3px;
  cursor:pointer;
}
.ic-day.active{
  border-color: transparent;
  background: linear-gradient(180deg, var(--ic-blue) 0%, var(--ic-blue-2) 100%);
  color:white;
  box-shadow: 0 18px 30px rgba(37,99,235,.25);
}
.ic-dow{ font-weight:1000; font-size:11px; letter-spacing:.12em; text-transform:uppercase; }
.ic-dom{ font-weight:1000; font-size:20px; }
.ic-mon{ font-weight:900; font-size:11px; opacity:.9; text-transform:uppercase; }

.ic-slots{
  margin-top:14px;
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px;
}
.ic-slot{
  border-radius:14px;
  border:1px solid var(--ic-border);
  background:white;
  padding:12px 10px;
  font-weight:1000;
  text-align:center;
  cursor:pointer;
}
.ic-slot.active{
  background:#d1d5db;
  border-color:#d1d5db;
}
.ic-slot:disabled{
  opacity:.55;
  cursor:not-allowed;
}

.ic-form{
  margin-top:18px;
  background:white;
  border-radius:22px;
  box-shadow: var(--ic-shadow);
  padding:16px;
  text-align:center;
}
.ic-form h3{ margin:0; font-size:26px; font-weight:1000; letter-spacing:-0.03em; }
.ic-form p{ margin:6px 0 0; color:var(--ic-muted); font-weight:800; line-height:1.5; }
.ic-field{ margin-top:14px; text-align:left; }
.ic-label{ font-size:11px; letter-spacing:.12em; font-weight:1000; text-transform:uppercase; color:#64748b; margin-bottom:6px; }
.ic-input{
  width:100%;
  border:1px solid transparent;
  background:#f1f5f9;
  border-radius:14px;
  padding:12px 12px;
  outline:none;
  font-size:14px;
}
.ic-input:focus{
  background:white;
  border-color:rgba(37,99,235,.55);
  box-shadow:0 0 0 3px rgba(37,99,235,.12);
}
.ic-submit{
  margin-top:16px;
  width:100%;
  border:0;
  border-radius:16px;
  padding:14px 14px;
  font-weight:1000;
  color:white;
  cursor:pointer;
  background: linear-gradient(180deg, var(--ic-blue) 0%, var(--ic-blue-2) 100%);
  box-shadow: 0 18px 30px rgba(37,99,235,.25);
}
.ic-submit:disabled{ opacity:.55; cursor:not-allowed; box-shadow:none; }
.ic-later{
  margin-top:12px;
  border:0;
  background:transparent;
  color:var(--ic-muted);
  font-weight:1000;
  cursor:pointer;
}
.ic-later:hover{ text-decoration:underline; }

.ic-error{ margin-top:12px; color:#b91c1c; font-weight:900; font-size:13px; line-height:1.4; text-align:left; }
.ic-ok{ margin-top:12px; color:#047857; font-weight:900; font-size:13px; line-height:1.4; text-align:left; }

.ic-footer{
  margin-top:18px;
  text-align:center;
  color:#94a3b8;
  font-weight:800;
  font-size:13px;
  padding:18px 0 8px;
}
.ic-footer strong{ color:#0f172a; font-weight:1000; }
.ic-footer a{
  display:inline-block;
  margin-top:10px;
  color:var(--ic-blue);
  text-decoration:none;
  font-weight:1000;
}
.ic-footer a:hover{ text-decoration:underline; }

@media (min-width: 900px) {
  .ic-page { padding: 24px 0; align-items: flex-start; }
  .ic-shell { max-width: 1100px; min-height: auto; border-radius: 26px; overflow: hidden; box-shadow: var(--ic-shadow); }
  .ic-main { padding: 18px 22px 26px; }
  .ic-hero { max-width: 760px; }
  .ic-days { max-width: 760px; }
  .ic-slots { max-width: 760px; grid-template-columns: 1fr 1fr 1fr; }
  .ic-form { max-width: 760px; }
  .ic-footer { max-width: 760px; margin-left: auto; margin-right: auto; }
}
`;

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12a4.6 4.6 0 1 0-4.6-4.6A4.6 4.6 0 0 0 12 12Zm0 2c-4.4 0-8 2.2-8 4.9V21h16v-2.1C20 16.2 16.4 14 12 14Z" />
    </svg>
  );
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function toYmdUTC(d) {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

// slot generation comes from backend (/consultation/slots)

const RU_DOW = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const RU_MON = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

export default function IndividualConsultationPage() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const [centerName, setCenterName] = useState('');
  const [workStart, setWorkStart] = useState('09:00');
  const [workEnd, setWorkEnd] = useState('18:00');
  const [intervalMinutes, setIntervalMinutes] = useState(30);
  const [consultationPrice, setConsultationPrice] = useState(0);
  const [bookingWindowWeeks, setBookingWindowWeeks] = useState(4);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const days = useMemo(() => {
    const now = new Date();
    const max = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    max.setUTCDate(max.getUTCDate() + bookingWindowWeeks * 7);

    const out = [];
    for (let i = 0; i < 7; i += 1) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
      d.setUTCDate(d.getUTCDate() + i);
      if (d.getTime() > max.getTime()) break;
      out.push({
        date: toYmdUTC(d),
        dow: RU_DOW[d.getUTCDay()],
        dom: d.getUTCDate(),
        mon: RU_MON[d.getUTCMonth()],
      });
    }
    return out;
  }, [bookingWindowWeeks]);

  const [daysWithSlots, setDaysWithSlots] = useState([]);

  const slots = useMemo(() => {
    const day = daysWithSlots.find((d) => d?.date === selectedDate);
    return day?.slots || [];
  }, [daysWithSlots, selectedDate]);

  const canSubmit = useMemo(() => {
    return Boolean(String(fullName).trim() && String(phone).trim() && selectedSlot);
  }, [fullName, phone, selectedSlot]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      setOk('');
      try {
        const resp = await fetch(`${env.VITE_API_BASE_URL}/c/${slug}/consultation/config`);
        const body = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(body?.error || `Ошибка: ${resp.status}`);

        if (!mounted) return;
        setCenterName(body?.center?.name || '');
        const ss = body?.scheduleSettings || {};
        if (ss.workStart) setWorkStart(String(ss.workStart));
        if (ss.workEnd) setWorkEnd(String(ss.workEnd));
        if (ss.intervalMinutes != null) setIntervalMinutes(Number(ss.intervalMinutes) || 30);
        if (ss.consultationPrice != null) setConsultationPrice(Number(ss.consultationPrice) || 0);
        if (ss.bookingWindowWeeks != null) setBookingWindowWeeks(Number(ss.bookingWindowWeeks) || 4);

        const first = (days[0] && days[0].date) || '';
        setSelectedDate(first);

        const slotsResp = await fetch(`${env.VITE_API_BASE_URL}/c/${slug}/consultation/slots`);
        const slotsBody = await slotsResp.json().catch(() => ({}));
        if (!slotsResp.ok) throw new Error(slotsBody?.error || `Ошибка: ${slotsResp.status}`);
        if (!mounted) return;
        setDaysWithSlots(Array.isArray(slotsBody?.days) ? slotsBody.days : []);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : 'Ошибка');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [days, slug]);

  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedDate]);

  const onSubmit = async () => {
    if (!selectedSlot) return;
    if (!String(fullName).trim() || !String(phone).trim()) return;
    if (selectedSlot.booked) {
      setError('Этот слот уже занят. Выберите другое время.');
      return;
    }

    setSubmitting(true);
    setError('');
    setOk('');
    try {
      const resp = await fetch(`${env.VITE_API_BASE_URL}/c/${slug}/consultation/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_name: String(fullName).trim(),
          student_phone: String(phone).trim(),
          starts_at: selectedSlot.startsAt,
          ends_at: selectedSlot.endsAt,
        }),
      });
      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(body?.error || 'Не удалось отправить заявку');

      setOk('Заявка отправлена. Центр скоро свяжется с вами.');
      setFullName('');
      setPhone('');
      setSelectedSlot(null);

      const slotsResp = await fetch(`${env.VITE_API_BASE_URL}/c/${slug}/consultation/slots`);
      const slotsBody = await slotsResp.json().catch(() => ({}));
      if (slotsResp.ok) setDaysWithSlots(Array.isArray(slotsBody?.days) ? slotsBody.days : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ic-page">
      <style>{css}</style>
      <div className="ic-shell">
        <header className="ic-topbar">
          <button
            className="ap-brand"
            type="button"
            onClick={() => navigate('/')}
            style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 0 }}
            aria-label="SmartBook"
          >
            SmartBook
          </button>
          <div className="ic-avatar" aria-hidden="true">
            <UserIcon />
          </div>
        </header>

        <main className="ic-main">
          <section className="ic-hero" aria-label="Индивидуальная консультация">
            <div className="ic-badge">Услуга записи</div>
            <h1 className="ic-title">Индивидуальная консультация</h1>
            <div className="ic-sub">
              {centerName || 'Центр'} • сессия {intervalMinutes} минут
            </div>
            <div className="ic-price" aria-label="Стоимость">
              <div className="k">Стоимость</div>
              <div className="v">{consultationPrice}тг</div>
            </div>
          </section>

          <h2 className="ic-h2">Выберите дату</h2>
          <p className="ic-p">Доступные окна на эту неделю</p>
          <div className="ic-days" role="tablist" aria-label="Дни недели">
            {days.map((d) => (
              <button
                key={d.date}
                className={`ic-day ${d.date === selectedDate ? 'active' : ''}`}
                type="button"
                onClick={() => setSelectedDate(d.date)}
              >
                <div className="ic-dow">{d.dow}</div>
                <div className="ic-dom">{d.dom}</div>
                <div className="ic-mon">{d.mon}</div>
              </button>
            ))}
          </div>

          <h2 className="ic-h2" style={{ marginTop: 18 }}>
            Выберите время
          </h2>
          <p className="ic-p">Доступные слоты на {selectedDate || 'выбранную дату'}</p>
          <div className="ic-slots" aria-label="Слоты времени">
            {slots.map((s) => (
              <button
                key={s.startsAt}
                className={`ic-slot ${selectedSlot?.startsAt === s.startsAt ? 'active' : ''}`}
                type="button"
                onClick={() => setSelectedSlot(s)}
                disabled={Boolean(s.booked)}
              >
                {s.start}-{s.end}
              </button>
            ))}
          </div>

          <section className="ic-form" aria-label="Ваши данные">
            <h3>Ваши данные</h3>
            <p>Заполните ваши данные</p>

            <div className="ic-field">
              <div className="ic-label">ФИО</div>
              <input
                className="ic-input"
                placeholder="Напр. Алексей Иванов"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="ic-field">
              <div className="ic-label">Номер телефона</div>
              <input
                className="ic-input"
                placeholder="+7 (900) 000-00-00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <button className="ic-submit" type="button" disabled={!canSubmit || submitting || loading} onClick={onSubmit}>
              {submitting ? 'Отправляем…' : 'Подтвердить запись'}
            </button>
            <button className="ic-later" type="button" onClick={() => navigate(`/c/${slug}/future`)}>
              Записаться на потом
            </button>

            {error ? <div className="ic-error">{error}</div> : null}
            {ok ? <div className="ic-ok">{ok}</div> : null}
          </section>

          <footer className="ic-footer">
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
