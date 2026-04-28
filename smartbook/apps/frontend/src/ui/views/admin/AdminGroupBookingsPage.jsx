import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { env } from '../../../lib/env';
import { supabase } from '../../../lib/supabase';

const css = `
.al-root{
  --al-blue:#2563eb;
  --al-blue-2:#1d4ed8;
  --al-text:#0f172a;
  --al-muted:#64748b;
  --al-border:#e2e8f0;
  --al-bg:#f6f8fb;
  --al-card:#ffffff;
  --al-shadow: 0 18px 50px rgba(15,23,42,.10);
  --al-shadow-2: 0 12px 26px rgba(15,23,42,.06);
  min-height:100vh;
  background:var(--al-bg);
  display:flex;
  justify-content:center;
  color:var(--al-text);
}
.al-root *{ box-sizing:border-box; }
.al-shell{ width:100%; max-width:430px; min-height:100vh; background:var(--al-bg); }
.al-topbar{
  position:sticky; top:0; z-index:10;
  background:rgba(246,248,251,.92);
  backdrop-filter: blur(10px);
  border-bottom:1px solid var(--al-border);
  padding:12px 16px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 10px;
}
.al-brand{ font-weight:1000; letter-spacing:-0.02em; }
.al-back{
  border:1px solid var(--al-border);
  background:white;
  border-radius:12px;
  padding:8px 10px;
  font-weight:1000;
  cursor:pointer;
}
.al-main{ padding:16px 16px 26px; }
.al-title{ margin:10px 0 10px; font-size:22px; font-weight:1000; letter-spacing:-0.03em; }
.al-list{ display:grid; gap:10px; }
.al-item{
  border:1px solid var(--al-border);
  background:white;
  border-radius:16px;
  padding:12px;
  box-shadow: var(--al-shadow-2);
  display:grid;
  gap: 10px;
}
.al-item-top{ display:flex; justify-content:space-between; gap:10px; align-items:flex-start; }
.al-item-title{ font-weight:1000; }
.al-item-meta{ margin-top:4px; color:var(--al-muted); font-weight:800; font-size:12.5px; line-height:1.35; }
.al-chip{
  font-weight:1000;
  font-size:12px;
  color:#475569;
  background:#f1f5f9;
  border-radius:999px;
  padding:6px 10px;
  height: fit-content;
}
.al-actions{ display:flex; gap:8px; flex-wrap:wrap; }
.al-mini{
  border:1px solid var(--al-border);
  background:white;
  border-radius:12px;
  padding:8px 10px;
  font-weight:1000;
  font-size:12.5px;
  cursor:pointer;
}
.al-mini.ok{ border-color: rgba(5,150,105,.25); background: rgba(5,150,105,.08); color:#047857; }
.al-mini.danger{ border-color: rgba(185,28,28,.25); background: rgba(185,28,28,.06); color:#b91c1c; }
.al-mini:disabled{ opacity:.55; cursor:not-allowed; }
.al-empty{ color:var(--al-muted); font-weight:900; font-size:12.5px; }
@media (min-width: 900px) {
  .al-root { padding: 24px 0; align-items: flex-start; }
  .al-shell { max-width: 1100px; min-height: auto; border-radius: 26px; overflow: hidden; box-shadow: var(--al-shadow); }
  .al-main { padding: 18px 22px 26px; }
  .al-list { grid-template-columns: 1fr 1fr; }
}
`;

function formatDate(value) {
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function ruAttendance(status) {
  if (status === 'attended') return 'Был';
  if (status === 'missed') return 'Не был';
  return 'Ожидает';
}

export default function AdminGroupBookingsPage() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState([]);

  const groupBookings = useMemo(
    () => bookings.filter((b) => b?.courses?.booking_type === 'group'),
    [bookings]
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token;
        if (!accessToken) {
          navigate(`/login?next=${encodeURIComponent(`/c/${slug}/admin/bookings/group`)}`, { replace: true });
          return;
        }
        if (!mounted) return;
        setToken(accessToken);

        const resp = await fetch(`${env.VITE_API_BASE_URL}/c/${slug}/admin/bookings`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const body = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(body?.error || `Ошибка: ${resp.status}`);
        if (!mounted) return;
        setBookings(Array.isArray(body) ? body : []);
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
  }, [navigate, slug]);

  const setAttendance = async (bookingId, status) => {
    if (!token) return;
    setError('');
    try {
      const resp = await fetch(`${env.VITE_API_BASE_URL}/c/${slug}/bookings/${bookingId}/attendance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(body?.error || 'Не удалось обновить посещаемость');
      setBookings((prev) => prev.map((b) => (b?.id === bookingId ? { ...b, attendance_status: body?.attendance_status ?? status } : b)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    }
  };

  return (
    <div className="al-root">
      <style>{css}</style>
      <div className="al-shell">
        <header className="al-topbar">
          <button className="al-back" type="button" onClick={() => navigate(`/c/${slug}/admin`)}>
            Назад
          </button>
          <div className="al-brand">SmartBook</div>
          <div style={{ width: 60 }} />
        </header>

        <main className="al-main">
          <h1 className="al-title">Записи на групповые занятия</h1>
          {loading ? <div className="al-empty">Загрузка…</div> : null}
          {error ? <div className="al-empty" style={{ color: '#b91c1c' }}>{error}</div> : null}

          <div className="al-list">
            {!loading && groupBookings.length === 0 ? <div className="al-empty">Пока нет записей.</div> : null}
            {groupBookings.map((b) => (
              <div className="al-item" key={b.id}>
                <div className="al-item-top">
                  <div>
                    <div className="al-item-title">{b?.student_name || 'Студент'}</div>
                    <div className="al-item-meta">
                      {b?.courses?.name ? `Курс: ${b.courses.name}` : null}
                      {b?.created_at ? ` • ${formatDate(b.created_at)}` : null}
                    </div>
                  </div>
                  <div className="al-chip">{ruAttendance(b?.attendance_status)}</div>
                </div>
                <div className="al-actions">
                  <button className="al-mini ok" type="button" onClick={() => setAttendance(b.id, 'attended')}>
                    Был
                  </button>
                  <button className="al-mini danger" type="button" onClick={() => setAttendance(b.id, 'missed')}>
                    Не был
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

