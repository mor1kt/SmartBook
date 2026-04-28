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
.al-mini.primary{ border-color: rgba(37,99,235,.25); background: rgba(37,99,235,.08); color: var(--al-blue); }
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

function ruWaitStatus(status) {
  return status === 'processed' ? 'Обработано' : 'Ожидает';
}

export default function AdminFutureRequestsPage() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [waitlist, setWaitlist] = useState([]);

  const requests = useMemo(
    () => waitlist.filter((w) => String(w?.message || '').startsWith('future:')),
    [waitlist]
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
          navigate(`/login?next=${encodeURIComponent(`/c/${slug}/admin/future`)}`, { replace: true });
          return;
        }
        if (!mounted) return;
        setToken(accessToken);

        const resp = await fetch(`${env.VITE_API_BASE_URL}/c/${slug}/admin/waitlist`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const body = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(body?.error || `Ошибка: ${resp.status}`);
        if (!mounted) return;
        setWaitlist(Array.isArray(body) ? body : []);
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

  const setStatus = async (id, status) => {
    if (!token) return;
    setError('');
    try {
      const resp = await fetch(`${env.VITE_API_BASE_URL}/c/${slug}/admin/waitlist/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(body?.error || 'Не удалось обновить заявку');
      setWaitlist((prev) => prev.map((w) => (w?.id === id ? body : w)));
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
          <h1 className="al-title">Записи на дальнейшее время</h1>
          {loading ? <div className="al-empty">Загрузка…</div> : null}
          {error ? <div className="al-empty" style={{ color: '#b91c1c' }}>{error}</div> : null}

          <div className="al-list">
            {!loading && requests.length === 0 ? <div className="al-empty">Пока нет заявок.</div> : null}
            {requests.map((w) => (
              <div className="al-item" key={w.id}>
                <div className="al-item-top">
                  <div>
                    <div className="al-item-title">{w?.student_phone || 'Телефон'}</div>
                    <div className="al-item-meta">
                      {w?.created_at ? formatDate(w.created_at) : null}
                      {w?.message ? ` • ${String(w.message).replace(/^future:/, '').slice(0, 140)}` : null}
                    </div>
                  </div>
                  <div className="al-chip">{ruWaitStatus(w?.status)}</div>
                </div>
                <div className="al-actions">
                  {w?.status !== 'processed' ? (
                    <button className="al-mini primary" type="button" onClick={() => setStatus(w.id, 'processed')}>
                      Обработано
                    </button>
                  ) : (
                    <button className="al-mini" type="button" onClick={() => setStatus(w.id, 'waiting')}>
                      Вернуть в ожидание
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

