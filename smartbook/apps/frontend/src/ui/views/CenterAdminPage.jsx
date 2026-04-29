import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { env } from '../../lib/env';
import { supabase } from '../../lib/supabase';

const css = `
.ap-root{
  --ap-blue:#2563eb;
  --ap-blue-2:#1d4ed8;
  --ap-blue-50:#eff6ff;
  --ap-text:#0f172a;
  --ap-muted:#64748b;
  --ap-border:#e2e8f0;
  --ap-bg:#f6f8fb;
  --ap-card:#ffffff;
  --ap-shadow: 0 18px 50px rgba(15,23,42,.10);
  --ap-shadow-2: 0 12px 26px rgba(15,23,42,.06);

  min-height:100vh;
  background:var(--ap-bg);
  display:flex;
  justify-content:center;
  color:var(--ap-text);
}
.ap-root *{ box-sizing:border-box; }
.ap-shell{ width:100%; max-width:430px; min-height:100vh; background:var(--ap-bg); }

.ap-topbar{
  position:sticky; top:0; z-index:10;
  background:rgba(246,248,251,.92);
  backdrop-filter: blur(10px);
  border-bottom:1px solid var(--ap-border);
  padding:12px 16px;
  display:flex;
  align-items:center;
  justify-content:space-between;
}
.ap-brand{ font-weight:900; letter-spacing:-0.02em; }
.ap-avatar{
  width:34px; height:34px;
  border-radius:999px;
  border:1px solid var(--ap-border);
  background:white;
  display:grid;
  place-items:center;
}
.ap-avatar svg{ width:18px; height:18px; fill:#334155; }

.ap-main{ padding:14px 16px 26px; }
.ap-center-title{ margin:10px 0 10px; font-size:26px; font-weight:900; letter-spacing:-0.02em; }

.ap-linkcard{
  margin-top: 8px;
  background: var(--ap-card);
  border-radius: 18px;
  box-shadow: var(--ap-shadow-2);
  padding: 14px;
  display: grid;
  gap: 10px;
}
.ap-linkrow{
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
}
.ap-linkinput{
  width: 100%;
  border: 1px solid var(--ap-border);
  background: #f8fafc;
  border-radius: 14px;
  padding: 12px 12px;
  font-weight: 900;
  color: var(--ap-text);
  font-size: 13px;
}
.ap-copybtn{
  border: 0;
  border-radius: 14px;
  padding: 12px 12px;
  font-weight: 1000;
  cursor: pointer;
  background: rgba(37,99,235,.10);
  color: var(--ap-blue);
  min-width: 120px;
}
.ap-copybtn:hover{ filter: brightness(0.98); }

.ap-profile-btn{
  width:100%;
  border:2px solid var(--ap-blue);
  background:transparent;
  color:var(--ap-blue);
  border-radius:14px;
  padding:12px 12px;
  font-weight:900;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:10px;
  cursor:pointer;
}
.ap-profile-btn svg{ width:25px; height:25px; fill:currentColor; }

.ap-cards{ margin-top:16px; display:grid; gap:14px; }
.ap-card.clickable{ cursor: pointer; }
.ap-card.clickable:hover{ transform: translateY(-1px); transition: transform 120ms ease; }
.ap-card{
  background:var(--ap-card);
  border-radius:18px;
  box-shadow:var(--ap-shadow-2);
  padding:14px;
  display:grid;
  gap:10px;
}
.ap-card-top{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:10px;
}
.ap-ic{
  width:42px; height:42px;
  border-radius:12px;
  display:grid;
  place-items:center;
}
.ap-ic.blue{ background:rgba(37,99,235,.10); color:var(--ap-blue); }
.ap-ic.green{ background:rgba(16,185,129,.12); color:#059669; }
.ap-ic.gray{ background:rgba(148,163,184,.18); color:#475569; }
.ap-ic svg{ width:22px; height:22px; fill:currentColor; }
.ap-count{ font-weight:1000; font-size:18px; letter-spacing:-0.02em; }
.ap-card-title{ font-weight:900; line-height:1.22; }
.ap-card-sub{ color:var(--ap-muted); font-size:12.5px; font-weight:700; margin-top:4px; }

.ap-h2{ margin:26px 0 6px; font-size:28px; font-weight:1000; letter-spacing:-0.03em; line-height:1.05; }
.ap-desc{ margin:0; color:var(--ap-muted); line-height:1.55; font-weight:700; font-size:13px; }

.ap-form-card{
  margin-top:14px;
  background:var(--ap-card);
  border-radius:18px;
  box-shadow:var(--ap-shadow);
  padding:14px;
}
.ap-section-tag{
  display:flex;
  align-items:center;
  gap:10px;
  font-weight:1000;
  font-size:12px;
  color:var(--ap-blue);
  text-transform:lowercase;
}
.ap-section-tag::before{
  content:"";
  width:22px;
  height:3px;
  border-radius:999px;
  background:var(--ap-blue);
}
.ap-section-tag.green{ color:#059669; }
.ap-section-tag.green::before{ background:#059669; }
.ap-section-tag.gray{ color:#475569; }
.ap-section-tag.gray::before{ background:#475569; }

.ap-grid{ margin-top:12px; display:grid; gap:12px; }
.ap-label{ font-size:11px; letter-spacing:.08em; text-transform:uppercase; font-weight:1000; color:#94a3b8; margin-bottom:6px; }
.ap-input, .ap-select, .ap-textarea{
  width:100%;
  border:1px solid transparent;
  background:#f1f5f9;
  border-radius:14px;
  padding:12px 12px;
  outline:none;
  font-size:14px;
}
.ap-textarea{ min-height:86px; resize:vertical; }
.ap-input:focus, .ap-select:focus, .ap-textarea:focus{
  background:white;
  border-color:rgba(37,99,235,.55);
  box-shadow:0 0 0 3px rgba(37,99,235,.12);
}
.ap-row2{ display:grid; grid-template-columns: 1fr 1fr; gap:10px; }
.ap-actions{ margin-top:14px; display:grid; gap:10px; }
.ap-primary{
  border:0;
  border-radius:14px;
  background:linear-gradient(180deg, var(--ap-blue) 0%, var(--ap-blue-2) 100%);
  color:white;
  padding:14px 14px;
  font-weight:1000;
  cursor:pointer;
}
.ap-secondary{
  border:0;
  border-radius:14px;
  background:#eef2ff;
  color:var(--ap-blue);
  padding:12px 14px;
  font-weight:1000;
  cursor:pointer;
}
.ap-primary:disabled, .ap-secondary:disabled{
  opacity:.55;
  cursor:not-allowed;
}

.ap-note{ margin-top:10px; color:var(--ap-muted); font-weight:800; font-size:12.5px; line-height:1.4; }
.ap-error{ margin-top:10px; color:#b91c1c; font-weight:900; font-size:12.5px; line-height:1.4; }
.ap-ok{ margin-top:10px; color:#047857; font-weight:900; font-size:12.5px; line-height:1.4; }

.ap-footer{
  margin-top:18px;
  text-align:center;
  color:#94a3b8;
  font-weight:800;
  font-size:13px;
  padding:18px 0 8px;
}
.ap-footer strong{ color:#0f172a; font-weight:1000; }
.ap-footer a{
  display:inline-block;
  margin-top:10px;
  color:var(--ap-blue);
  text-decoration:none;
  font-weight:1000;
}
.ap-footer a:hover{ text-decoration:underline; }
.ap-logout{
  margin-top: 14px;
  width: 100%;
  max-width: 320px;
  border: 1px solid var(--ap-border);
  background: white;
  border-radius: 16px;
  padding: 12px 14px;
  font-weight: 1000;
  cursor: pointer;
}
.ap-logout:hover{ filter: brightness(0.99); }

.ap-lists{ margin-top:18px; display:grid; gap:14px; }
.ap-divider{
  margin-top: 18px;
  display:flex;
  align-items:center;
  gap:12px;
}
.ap-divider::before, .ap-divider::after{
  content:"";
  height: 1px;
  background: var(--ap-border);
  flex: 1;
}
.ap-divider span{
  color: var(--ap-muted);
  font-weight: 1000;
  font-size: 12px;
  letter-spacing: .12em;
  text-transform: uppercase;
}
.ap-list-card{
  background:var(--ap-card);
  border-radius:18px;
  box-shadow:var(--ap-shadow-2);
  padding:14px;
}
.ap-list-head{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  margin-bottom:10px;
}
.ap-list-title{ font-weight:1000; letter-spacing:-0.02em; }
.ap-chip{
  font-weight:1000;
  font-size:12px;
  color:#475569;
  background:#f1f5f9;
  border-radius:999px;
  padding:6px 10px;
}
.ap-list{
  display:grid;
  gap:10px;
}
.ap-item{
  border:1px solid var(--ap-border);
  background:white;
  border-radius:16px;
  padding:12px;
  display:grid;
  gap:10px;
}
.ap-item-top{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:10px;
}
.ap-item-title{ font-weight:1000; }
.ap-item-meta{
  margin-top:4px;
  color:var(--ap-muted);
  font-weight:800;
  font-size:12.5px;
  line-height:1.35;
}
.ap-item-actions{
  display:flex;
  flex-wrap:wrap;
  gap:8px;
}
.ap-mini{
  border:1px solid var(--ap-border);
  background:white;
  border-radius:12px;
  padding:8px 10px;
  font-weight:1000;
  font-size:12.5px;
  cursor:pointer;
}
.ap-mini.primary{
  border-color: rgba(37,99,235,.25);
  background: rgba(37,99,235,.08);
  color: var(--ap-blue);
}
.ap-mini.danger{
  border-color: rgba(185,28,28,.25);
  background: rgba(185,28,28,.06);
  color: #b91c1c;
}
.ap-mini.ok{
  border-color: rgba(5,150,105,.25);
  background: rgba(5,150,105,.08);
  color: #047857;
}
.ap-mini:disabled{ opacity:.55; cursor:not-allowed; }
.ap-phone{
  display:inline-flex;
  align-items:center;
  gap:6px;
  color: var(--ap-blue);
  font-weight:1000;
  text-decoration:none;
}
.ap-phone:hover{ text-decoration:underline; }
.ap-empty{ color:var(--ap-muted); font-weight:900; font-size:12.5px; }

@media (min-width: 900px) {
  .ap-root { padding: 24px 0; align-items: flex-start; }
  .ap-shell { max-width: 1100px; min-height: auto; border-radius: 26px; overflow: hidden; box-shadow: var(--ap-shadow); }
  .ap-main { padding: 18px 22px 26px; }
  .ap-cards { grid-template-columns: repeat(3, 1fr); }
  .ap-lists { grid-template-columns: 1fr 1fr; }
  .ap-form-card { max-width: 860px; }
  .ap-grid { grid-template-columns: 1fr 1fr; }
  .ap-grid .ap-row2 { grid-template-columns: 1fr 1fr; }
  .ap-actions { grid-template-columns: 1fr 1fr; }
}
`;

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12a4.6 4.6 0 1 0-4.6-4.6A4.6 4.6 0 0 0 12 12Zm0 2c-4.4 0-8 2.2-8 4.9V21h16v-2.1C20 16.2 16.4 14 12 14Z" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9.4 12a3.8 3.8 0 1 0-3.8-3.8A3.8 3.8 0 0 0 9.4 12Zm0 1.8c-3.5 0-6.4 1.8-6.4 4V21h12.8v-3.2c0-2.2-2.9-4-6.4-4ZM17.2 12.2a3.2 3.2 0 0 0 .3-6.4 3.4 3.4 0 0 1 0 6.4h-.3Zm.7 1.6c-.6 0-1.1.1-1.6.2 1.7.9 2.8 2.2 2.8 3.8V21H22v-3.1c0-2.1-2-4.1-4.1-4.1Z" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12a4.6 4.6 0 1 0-4.6-4.6A4.6 4.6 0 0 0 12 12Zm0 2c-4.4 0-8 2.2-8 4.9V21h16v-2.1C20 16.2 16.4 14 12 14Z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm12 8H5v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9ZM6 6a1 1 0 0 0-1 1v1h14V7a1 1 0 0 0-1-1H6Z" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" />
    </svg>
  );
}

function parseIntSafe(value, fallback = 0) {
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) ? n : fallback;
}

export default function CenterAdminPage() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const next = useMemo(() => `/c/${slug}/admin`, [slug]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const [token, setToken] = useState('');
  const [copied, setCopied] = useState(false);

  const [centerName, setCenterName] = useState('');
  const [counts, setCounts] = useState({
    groupBookings: 0,
    individualWaitlist: 0,
    futureBookings: 0,
  });

  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [waitlist, setWaitlist] = useState([]);

  const [categoryName, setCategoryName] = useState('');
  const [bookingType, setBookingType] = useState('group');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [teacherAbout, setTeacherAbout] = useState('');

  const [workStart, setWorkStart] = useState('09:00');
  const [workEnd, setWorkEnd] = useState('18:00');
  const [consultationIntervalMinutes, setConsultationIntervalMinutes] = useState('30');
  const [consultationPrice, setConsultationPrice] = useState('0');
  const [groupLimit, setGroupLimit] = useState('10');
  const [bookingWindowWeeks, setBookingWindowWeeks] = useState('4');

  const canSubmit = useMemo(() => {
    if (!String(categoryName).trim()) return false;
    const priceInt = parseIntSafe(price, -1);
    if (priceInt < 0) return false;
    if (bookingType === 'group') {
      const cap = parseIntSafe(groupLimit, 0);
      if (cap <= 0) return false;
    }
    return true;
  }, [bookingType, categoryName, groupLimit, price]);

  async function fetchSummary(accessToken) {
    const resp = await fetch(`${env.VITE_API_BASE_URL}/c/${slug}/admin/summary`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const body = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(body?.error || `Ошибка: ${resp.status}`);
    return body;
  }

  async function fetchBookings(accessToken) {
    const resp = await fetch(`${env.VITE_API_BASE_URL}/c/${slug}/admin/bookings`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const body = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(body?.error || `Ошибка: ${resp.status}`);
    return Array.isArray(body) ? body : [];
  }

  async function fetchWaitlist(accessToken) {
    const resp = await fetch(`${env.VITE_API_BASE_URL}/c/${slug}/admin/waitlist`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const body = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(body?.error || `Ошибка: ${resp.status}`);
    return Array.isArray(body) ? body : [];
  }

  function parseSlotMessage(message) {
    const raw = String(message || '').trim();
    if (!raw.startsWith('slot:')) return null;
    const rest = raw.slice(5);
    let a = '';
    let b = '';
    if (rest.includes('|')) {
      [a, b] = rest.split('|');
    } else if (rest.includes('~')) {
      [a, b] = rest.split('~');
    } else {
      const z = rest.lastIndexOf('Z');
      if (z !== -1 && rest[z + 1] === '-') {
        a = rest.slice(0, z + 1);
        b = rest.slice(z + 2);
      }
    }
    if (!a || !b) return null;
    const date = a.slice(0, 10);
    const start = a.slice(11, 16);
    const end = b.slice(11, 16);
    if (!date || !start || !end) return null;
    return { date, start, end };
  }

  function formatDate(value) {
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return '';
      return d.toLocaleString('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }

  const groupBookings = useMemo(
    () => bookings.filter((b) => b?.courses?.booking_type === 'group'),
    [bookings]
  );
  const individualBookings = useMemo(
    () => bookings.filter((b) => b?.courses?.booking_type === 'individual'),
    [bookings]
  );

  const consultationRequests = useMemo(
    () => waitlist.filter((w) => String(w?.message || '').startsWith('slot:')),
    [waitlist]
  );
  const futureRequests = useMemo(
    () => waitlist.filter((w) => String(w?.message || '').startsWith('future:')),
    [waitlist]
  );

  function startOfTodayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  const todayKey = useMemo(() => startOfTodayKey(), []);

  function isToday(iso) {
    if (!iso) return false;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return false;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return key === todayKey;
  }

  const groupBookingsToday = useMemo(() => groupBookings.filter((b) => isToday(b?.created_at)), [groupBookings, todayKey]);
  const individualBookingsToday = useMemo(() => individualBookings.filter((b) => isToday(b?.created_at)), [individualBookings, todayKey]);
  const consultationToday = useMemo(
    () =>
      consultationRequests.filter((w) => {
        const slot = parseSlotMessage(w?.message);
        return slot ? slot.date === todayKey : isToday(w?.created_at);
      }),
    [consultationRequests, todayKey]
  );
  const futureToday = useMemo(() => futureRequests.filter((w) => isToday(w?.created_at)), [futureRequests, todayKey]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      setOk('');

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData.session;
        const accessToken = session?.access_token;
        if (!accessToken) {
          navigate(`/login?next=${encodeURIComponent(next)}`, { replace: true });
          return;
        }
        if (!mounted) return;
        setToken(accessToken);

        const summaryBody = await fetchSummary(accessToken);
        if (!mounted) return;
        setCenterName(summaryBody?.center?.name || '');
        setCounts(summaryBody?.counts || {});

        const ss = summaryBody?.scheduleSettings || {};
        if (ss.workStart) setWorkStart(String(ss.workStart));
        if (ss.workEnd) setWorkEnd(String(ss.workEnd));
        if (ss.consultationIntervalMinutes != null)
          setConsultationIntervalMinutes(String(ss.consultationIntervalMinutes));
        if (ss.consultationPrice != null) setConsultationPrice(String(ss.consultationPrice));
        if (ss.defaultGroupLimit != null) setGroupLimit(String(ss.defaultGroupLimit));
        if (ss.bookingWindowWeeks != null) setBookingWindowWeeks(String(ss.bookingWindowWeeks));

        setBookingsLoading(true);
        setWaitlistLoading(true);
        const [bookingsBody, waitlistBody] = await Promise.all([
          fetchBookings(accessToken),
          fetchWaitlist(accessToken),
        ]);
        if (!mounted) return;
        setBookings(bookingsBody);
        setWaitlist(waitlistBody);
      } catch (err) {
        if (!mounted) return;
        setError(String(err?.message ?? err ?? 'Ошибка'));
      } finally {
        if (!mounted) return;
        setBookingsLoading(false);
        setWaitlistLoading(false);
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [navigate, next, slug]);

  async function submit({ keepFilled }) {
    if (!token) return;
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setError('');
    setOk('');

    try {
      const scheduleSettings = {
        workStart: String(workStart || '').trim(),
        workEnd: String(workEnd || '').trim(),
        consultationIntervalMinutes: parseIntSafe(consultationIntervalMinutes, 30),
        consultationPrice: parseIntSafe(consultationPrice, 0),
        defaultGroupLimit: parseIntSafe(groupLimit, 10),
        bookingWindowWeeks: parseIntSafe(bookingWindowWeeks, 4),
      };

      const scheduleResp = await fetch(`${env.VITE_API_BASE_URL}/c/${slug}/admin/schedule`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ scheduleSettings }),
      });
      const scheduleJson = await scheduleResp.json().catch(() => ({}));
      if (!scheduleResp.ok) throw new Error(scheduleJson?.error || 'Не удалось сохранить настройки');

      const baseDescription = String(description || '').trim();
      const teacherNote = String(teacherAbout || '').trim();
      const combinedDescription =
        teacherNote && baseDescription ? `${baseDescription}\n\n${teacherNote}` : baseDescription || teacherNote || null;

      const payload = {
        categoryName: String(categoryName).trim(),
        name: String(categoryName).trim(),
        booking_type: bookingType,
        price: parseIntSafe(price, 0),
        group_capacity: bookingType === 'group' ? parseIntSafe(groupLimit, 10) : null,
        description: combinedDescription,
        teacher_name: String(teacherName || '').trim() || null,
        is_active: true,
      };

      const resp = await fetch(`${env.VITE_API_BASE_URL}/c/${slug}/admin/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(json?.error || 'Не удалось добавить предмет');

      const summaryBody = await fetchSummary(token);
      setCounts(summaryBody?.counts || counts);

      const [bookingsBody, waitlistBody] = await Promise.all([fetchBookings(token), fetchWaitlist(token)]);
      setBookings(bookingsBody);
      setWaitlist(waitlistBody);

      setOk('Предмет добавлен');
      if (!keepFilled) {
        setCategoryName('');
        setBookingType('group');
      }
      setDescription('');
      setPrice('');
      setTeacherName('');
      setTeacherAbout('');
    } catch (err) {
      setError(String(err?.message ?? err ?? 'Ошибка'));
    } finally {
      setSubmitting(false);
    }
  }

  async function setAttendance(bookingId, status) {
    if (!token) return;
    try {
      const resp = await fetch(`${env.VITE_API_BASE_URL}/c/${slug}/bookings/${bookingId}/attendance`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(body?.error || 'Не удалось обновить посещаемость');
      setBookings((prev) =>
        prev.map((b) => (b?.id === bookingId ? { ...b, attendance_status: body?.attendance_status ?? status } : b))
      );
    } catch (err) {
      setError(String(err?.message ?? err ?? 'Ошибка'));
    }
  }

  function ruAttendance(status) {
    if (status === 'attended') return 'Был';
    if (status === 'missed') return 'Не был';
    return 'Ожидает';
  }

  function ruWaitStatus(status) {
    return status === 'processed' ? 'Обработано' : 'Ожидает';
  }

  async function setWaitlistStatus(id, status) {
    if (!token) return;
    try {
      const resp = await fetch(`${env.VITE_API_BASE_URL}/c/${slug}/admin/waitlist/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(body?.error || 'Не удалось обновить заявку');

      setWaitlist((prev) => prev.map((w) => (w?.id === id ? body : w)));
      const summaryBody = await fetchSummary(token);
      setCounts(summaryBody?.counts || counts);
    } catch (err) {
      setError(String(err?.message ?? err ?? 'Ошибка'));
    }
  }

  return (
    <div className="ap-root">
      <style>{css}</style>

      <div className="ap-shell">
        <header className="ap-topbar">
          <button
            className="ap-brand"
            type="button"
            onClick={() => navigate('/')}
            style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 0 }}
            aria-label="SmartBook"
          >
            SmartBook
          </button>
          <button
            type="button"
            className="ap-avatar"
            aria-label="Выйти"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate('/', { replace: true });
            }}
          >
            <UserIcon />
          </button>
        </header>

        <main className="ap-main">
          <h1 className="ap-center-title">{centerName || 'Название центра'}</h1>

          <section className="ap-linkcard" aria-label="Ссылка на профиль">
            <div style={{ fontWeight: 1000 }}>Ссылка на профиль центра</div>
            <div className="ap-linkrow">
              <input
                className="ap-linkinput"
                readOnly
                value={`${window.location.origin}/c/${slug}`}
                onFocus={(e) => e.target.select()}
              />
              <button
                className="ap-copybtn"
                type="button"
                onClick={async () => {
                  const url = `${window.location.origin}/c/${slug}`;
                  try {
                    await navigator.clipboard.writeText(url);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1200);
                  } catch {
                    // fallback
                    try {
                      const el = document.createElement('textarea');
                      el.value = url;
                      el.style.position = 'fixed';
                      el.style.opacity = '0';
                      document.body.appendChild(el);
                      el.focus();
                      el.select();
                      document.execCommand('copy');
                      document.body.removeChild(el);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1200);
                    } catch {
                      setError('Не удалось скопировать ссылку');
                    }
                  }
                }}
              >
                {copied ? 'Скопировано' : 'Копировать'}
              </button>
            </div>
          </section>

          <button className="ap-profile-btn" type="button" onClick={() => navigate(`/c/${slug}`)}>
            В профиль центра <GridIcon />
          </button>

          <section className="ap-cards" aria-label="Статистика записей">
            <article className="ap-card clickable" role="button" tabIndex={0} onClick={() => navigate(`/c/${slug}/admin/bookings/group`)}>
              <div className="ap-card-top">
                <div className="ap-ic blue">
                  <PeopleIcon />
                </div>
                <div className="ap-count">{loading ? '…' : String(groupBookings.length)}</div>
              </div>
              <div>
                <div className="ap-card-title">Записи на групповые занятия</div>
              </div>
            </article>

            <article className="ap-card clickable" role="button" tabIndex={0} onClick={() => navigate(`/c/${slug}/admin/bookings/individual`)}>
              <div className="ap-card-top">
                <div className="ap-ic green">
                  <PersonIcon />
                </div>
                <div className="ap-count">{loading ? '…' : String(individualBookings.length)}</div>
              </div>
              <div>
                <div className="ap-card-title">Записи на индивидуальные занятия</div>
              </div>
            </article>

            <article className="ap-card clickable" role="button" tabIndex={0} onClick={() => navigate(`/c/${slug}/admin/consultations`)}>
              <div className="ap-card-top">
                <div className="ap-ic blue">
                  <CalendarIcon />
                </div>
                <div className="ap-count">{loading ? '…' : String(consultationRequests.length)}</div>
              </div>
              <div>
                <div className="ap-card-title">Записи на индивидуальные консультации</div>
              </div>
            </article>

            <article className="ap-card clickable" role="button" tabIndex={0} onClick={() => navigate(`/c/${slug}/admin/future`)}>
              <div className="ap-card-top">
                <div className="ap-ic gray">
                  <CalendarIcon />
                </div>
                <div className="ap-count">{loading ? '…' : String(futureRequests.length)}</div>
              </div>
              <div>
                <div className="ap-card-title">Записи на дальнейшее время</div>
              </div>
            </article>
          </section>

          <div className="ap-divider" aria-label="Записи на сегодня">
            <span>Записи на сегодня</span>
          </div>

          <section className="ap-lists" aria-label="Заявки и записи">
            <div className="ap-list-card">
              <div className="ap-list-head">
                <div className="ap-list-title">Записи (групповые занятия)</div>
                <div className="ap-chip">{groupBookingsToday.length}</div>
              </div>
              <div className="ap-list">
                {bookingsLoading ? <div className="ap-empty">Загрузка…</div> : null}
                {!bookingsLoading && groupBookingsToday.length === 0 ? (
                  <div className="ap-empty">Пока нет записей.</div>
                ) : null}
                {groupBookingsToday.slice(0, 20).map((b) => (
                  <div className="ap-item" key={b.id}>
                    <div className="ap-item-top">
                      <div>
                        <div className="ap-item-title">{b?.student_name || 'Студент'}</div>
                        <div className="ap-item-meta">
                          {b?.courses?.name ? `Курс: ${b.courses.name}` : null}
                          {b?.created_at ? ` • ${formatDate(b.created_at)}` : null}
                        </div>
                      </div>
                      <div className="ap-chip">{ruAttendance(b?.attendance_status)}</div>
                    </div>

                    <div className="ap-item-actions">
                      {b?.student_phone ? (
                        <a className="ap-phone" href={`tel:${String(b.student_phone).replace(/\s+/g, '')}`}>
                          {b.student_phone}
                        </a>
                      ) : null}
                      <button className="ap-mini ok" type="button" onClick={() => setAttendance(b.id, 'attended')}>
                        Был
                      </button>
                      <button className="ap-mini danger" type="button" onClick={() => setAttendance(b.id, 'missed')}>
                        Не был
                      </button>
                      <button className="ap-mini" type="button" onClick={() => setAttendance(b.id, 'pending')}>
                        Ожидает
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ap-list-card">
              <div className="ap-list-head">
                <div className="ap-list-title">Заявки (индивидуальные консультации)</div>
                <div className="ap-chip">{consultationToday.length}</div>
              </div>
              <div className="ap-list">
                {waitlistLoading ? <div className="ap-empty">Загрузка…</div> : null}
                {!waitlistLoading && consultationToday.length === 0 ? (
                  <div className="ap-empty">Пока нет заявок.</div>
                ) : null}
                {consultationToday.slice(0, 20).map((w) => {
                  const slot = parseSlotMessage(w?.message);
                  return (
                  <div className="ap-item" key={w.id}>
                    <div className="ap-item-top">
                      <div>
                        <div className="ap-item-title">{w?.student_name || 'Студент'}</div>
                        <div className="ap-item-meta">
                          {w?.courses?.name ? `Курс: ${w.courses.name}` : null}
                          {w?.created_at ? ` • ${formatDate(w.created_at)}` : null}
                          {slot ? ` • ${slot.date} ${slot.start}-${slot.end}` : w?.message ? ` • ${String(w.message).slice(0, 80)}` : null}
                        </div>
                      </div>
                      <div className="ap-chip">{ruWaitStatus(w?.status)}</div>
                    </div>

                    <div className="ap-item-actions">
                      {w?.student_phone ? (
                        <a className="ap-phone" href={`tel:${String(w.student_phone).replace(/\s+/g, '')}`}>
                          {w.student_phone}
                        </a>
                      ) : null}
                      {w?.status !== 'processed' ? (
                        <button className="ap-mini primary" type="button" onClick={() => setWaitlistStatus(w.id, 'processed')}>
                          Подтвердить
                        </button>
                      ) : (
                        <button className="ap-mini" type="button" onClick={() => setWaitlistStatus(w.id, 'waiting')}>
                          Вернуть в ожидание
                        </button>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>

            <div className="ap-list-card">
              <div className="ap-list-head">
                <div className="ap-list-title">Записи на дальнейшее время</div>
                <div className="ap-chip">{futureToday.length}</div>
              </div>
              <div className="ap-list">
                {waitlistLoading ? <div className="ap-empty">Загрузка…</div> : null}
                {!waitlistLoading && futureToday.length === 0 ? (
                  <div className="ap-empty">Пока нет заявок.</div>
                ) : null}
                {futureToday.slice(0, 20).map((w) => (
                  <div className="ap-item" key={w.id}>
                    <div className="ap-item-top">
                      <div>
                        <div className="ap-item-title">{w?.student_phone || 'Телефон'}</div>
                        <div className="ap-item-meta">
                          {w?.created_at ? formatDate(w.created_at) : null}
                          {w?.message ? ` • ${String(w.message).replace(/^future:/, '').slice(0, 120)}` : null}
                        </div>
                      </div>
                      <div className="ap-chip">{ruWaitStatus(w?.status)}</div>
                    </div>
                    <div className="ap-item-actions">
                      {w?.student_phone ? (
                        <a className="ap-phone" href={`tel:${String(w.student_phone).replace(/\s+/g, '')}`}>
                          {w.student_phone}
                        </a>
                      ) : null}
                      {w?.status !== 'processed' ? (
                        <button className="ap-mini primary" type="button" onClick={() => setWaitlistStatus(w.id, 'processed')}>
                          Обработано
                        </button>
                      ) : (
                        <button className="ap-mini" type="button" onClick={() => setWaitlistStatus(w.id, 'waiting')}>
                          Вернуть
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ap-list-card">
              <div className="ap-list-head">
                <div className="ap-list-title">Записи (индивидуальные занятия)</div>
                <div className="ap-chip">{individualBookingsToday.length}</div>
              </div>
              <div className="ap-list">
                {bookingsLoading ? <div className="ap-empty">Загрузка…</div> : null}
                {!bookingsLoading && individualBookingsToday.length === 0 ? (
                  <div className="ap-empty">Пока нет индивидуальных записей.</div>
                ) : null}
                {individualBookingsToday.slice(0, 20).map((b) => (
                  <div className="ap-item" key={b.id}>
                    <div className="ap-item-top">
                      <div>
                        <div className="ap-item-title">{b?.student_name || 'Студент'}</div>
                        <div className="ap-item-meta">
                          {b?.courses?.name ? `Курс: ${b.courses.name}` : null}
                          {b?.time_slots?.starts_at ? ` • ${formatDate(b.time_slots.starts_at)}` : null}
                          {b?.created_at ? ` • ${formatDate(b.created_at)}` : null}
                        </div>
                      </div>
                      <div className="ap-chip">{ruAttendance(b?.attendance_status)}</div>
                    </div>

                    <div className="ap-item-actions">
                      {b?.student_phone ? (
                        <a className="ap-phone" href={`tel:${String(b.student_phone).replace(/\s+/g, '')}`}>
                          {b.student_phone}
                        </a>
                      ) : null}
                      <button className="ap-mini ok" type="button" onClick={() => setAttendance(b.id, 'attended')}>
                        Был
                      </button>
                      <button className="ap-mini danger" type="button" onClick={() => setAttendance(b.id, 'missed')}>
                        Не был
                      </button>
                      <button className="ap-mini" type="button" onClick={() => setAttendance(b.id, 'pending')}>
                        Ожидает
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <h2 className="ap-h2">
            Добавление
            <br />
            нового предмета
          </h2>
          <p className="ap-desc">
            Заполните детали учебной программы, назначьте преподавателя и установите правила записи.
          </p>

          <section className="ap-form-card" aria-label="Добавление предмета">
            <div className="ap-section-tag">основная информация</div>
            <div className="ap-grid">
              <div>
                <div className="ap-label">Название категории</div>
                <input
                  className="ap-input"
                  placeholder="Напр. Подготовка к ЕНТ"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              </div>

              <div>
                <div className="ap-label">Тип занятия</div>
                <select className="ap-select" value={bookingType} onChange={(e) => setBookingType(e.target.value)}>
                  <option value="group">Групповое</option>
                  <option value="individual">Индивидуальное</option>
                </select>
              </div>

              <div>
                <div className="ap-label">Описание</div>
                <textarea
                  className="ap-textarea"
                  placeholder="Краткое описание курса..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <div className="ap-label">Стоимость (тг)</div>
                <input
                  className="ap-input"
                  inputMode="numeric"
                  placeholder="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

            <div style={{ height: 14 }} />
            <div className="ap-section-tag green">преподаватель</div>
            <div className="ap-grid">
              <div>
                <div className="ap-label">Имя учителя</div>
                <input
                  className="ap-input"
                  placeholder="Иван Иванов"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                />
              </div>
              <div>
                <div className="ap-label">Описание учителя</div>
                <textarea
                  className="ap-textarea"
                  placeholder="Опыт, квалификация..."
                  value={teacherAbout}
                  onChange={(e) => setTeacherAbout(e.target.value)}
                />
              </div>
            </div>

            <div style={{ height: 14 }} />
            <div className="ap-section-tag gray">расписание и лимиты</div>
            <div className="ap-grid">
              <div>
                <div className="ap-label">Рабочие часы</div>
                <div className="ap-row2">
                  <input className="ap-input" type="time" value={workStart} onChange={(e) => setWorkStart(e.target.value)} />
                  <input className="ap-input" type="time" value={workEnd} onChange={(e) => setWorkEnd(e.target.value)} />
                </div>
              </div>

              <div>
                <div className="ap-label">Интервал консультации</div>
                <select
                  className="ap-select"
                  value={consultationIntervalMinutes}
                  onChange={(e) => setConsultationIntervalMinutes(e.target.value)}
                >
                  <option value="15">15 минут</option>
                  <option value="30">30 минут</option>
                  <option value="45">45 минут</option>
                  <option value="60">60 минут</option>
                </select>
              </div>

              <div>
                <div className="ap-label">Цена (тенге) консультации</div>
                <input
                  className="ap-input"
                  inputMode="numeric"
                  value={consultationPrice}
                  onChange={(e) => setConsultationPrice(e.target.value)}
                />
              </div>

              <div>
                <div className="ap-label">Лимит группы</div>
                <input className="ap-input" inputMode="numeric" value={groupLimit} onChange={(e) => setGroupLimit(e.target.value)} />
                <div className="ap-note">Для индивидуального типа лимит группы игнорируется.</div>
              </div>

              <div>
                <div className="ap-label">Окно записи</div>
                <select
                  className="ap-select"
                  value={bookingWindowWeeks}
                  onChange={(e) => setBookingWindowWeeks(e.target.value)}
                >
                  <option value="1">на 1 неделю вперед</option>
                  <option value="2">на 2 недели вперед</option>
                  <option value="4">на 4 недели вперед</option>
                  <option value="8">на 8 недель вперед</option>
                </select>
              </div>
            </div>

            <div className="ap-actions">
              <button className="ap-primary" type="button" disabled={!canSubmit || submitting || loading} onClick={() => submit({ keepFilled: false })}>
                {submitting ? 'Добавляем…' : 'Добавить'}
              </button>
              <button className="ap-secondary" type="button" disabled={!canSubmit || submitting || loading} onClick={() => submit({ keepFilled: true })}>
                {submitting ? 'Добавляем…' : 'Добавить еще'}
              </button>
            </div>

            {error ? <div className="ap-error">{error}</div> : null}
            {ok ? <div className="ap-ok">{ok}</div> : null}
          </section>

          <footer className="ap-footer">
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

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                className="ap-logout"
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate('/', { replace: true });
                }}
              >
                Выйти из аккаунта
              </button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
