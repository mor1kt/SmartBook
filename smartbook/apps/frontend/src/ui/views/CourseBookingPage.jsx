import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { env } from '../../lib/env';

const css = `
.bk-page {
  --bk-blue: #2563eb;
  --bk-blue-2: #1d4ed8;
  --bk-blue-50: #eff6ff;
  --bk-text: #0f172a;
  --bk-muted: #64748b;
  --bk-border: #e2e8f0;
  --bk-bg: #f8fafc;
  --bk-card: #ffffff;
  --bk-shadow: 0 12px 40px rgba(15, 23, 42, 0.10);

  min-height: 100vh;
  background: var(--bk-bg);
  display: flex;
  justify-content: center;
}
.bk-page * { box-sizing: border-box; }

.bk-shell {
  width: 100%;
  max-width: 430px;
  min-height: 100vh;
  background: var(--bk-bg);
}

.bk-topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(248, 250, 252, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--bk-border);
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.bk-back {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  border: 1px solid var(--bk-border);
  background: white;
  display: grid;
  place-items: center;
  cursor: pointer;
}
.bk-back svg { width: 18px; height: 18px; fill: #334155; }

.bk-center-name {
  flex: 1;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: var(--bk-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bk-avatar {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 2px solid rgba(37, 99, 235, 0.8);
  background: white;
  display: grid;
  place-items: center;
  overflow: hidden;
}
.bk-avatar img { width: 100%; height: 100%; object-fit: cover; }
.bk-avatar-fallback { font-weight: 900; color: var(--bk-blue); font-size: 13px; }

.bk-main { padding: 18px 16px 26px; }

.bk-kicker {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--bk-blue);
  font-weight: 1000;
  letter-spacing: 0.12em;
  font-size: 11px;
  text-transform: uppercase;
}
.bk-kicker::before {
  content: "";
  width: 4px;
  height: 44px;
  border-radius: 999px;
  background: var(--bk-blue);
  display: inline-block;
}

.bk-title {
  margin: 10px 0 10px;
  font-size: 46px;
  line-height: 0.98;
  letter-spacing: -0.04em;
  font-weight: 1000;
  color: var(--bk-text);
}

.bk-card {
  background: var(--bk-card);
  border: 1px solid var(--bk-border);
  border-radius: 22px;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.06);
  padding: 16px;
  margin-top: 14px;
}

.bk-price {
  border-radius: 18px;
  border: 1px solid rgba(37, 99, 235, 0.20);
  box-shadow: 0 16px 34px rgba(37, 99, 235, 0.10);
  overflow: hidden;
}
.bk-price-inner { padding: 14px 14px; background: linear-gradient(180deg, #ffffff, #f8fafc); }
.bk-price-label { color: #94a3b8; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; }
.bk-price-value { margin-top: 8px; font-size: 30px; font-weight: 1000; color: var(--bk-text); }
.bk-price-bar { height: 4px; background: var(--bk-blue); }

.bk-h2 { margin: 0 0 10px; font-weight: 1000; font-size: 18px; color: var(--bk-text); }
.bk-p { margin: 0; color: var(--bk-muted); font-size: 13.5px; line-height: 1.6; }

.bk-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 12px;
}

.bk-tile {
  border: 1px solid var(--bk-border);
  border-radius: 18px;
  background: #f8fafc;
  padding: 14px;
  display: grid;
  gap: 10px;
}
.bk-tile-title { font-weight: 1000; color: var(--bk-text); }
.bk-tile-sub { color: var(--bk-muted); font-size: 12.5px; line-height: 1.4; }

.bk-teacher {
  margin-top: 18px;
  border-radius: 22px;
  background: linear-gradient(180deg, #0b56da, #0a3fb8);
  color: white;
  padding: 18px;
  box-shadow: 0 26px 70px rgba(2, 6, 23, 0.25);
  border: 1px solid rgba(255,255,255,0.10);
}
.bk-teacher-top {
  display: grid;
  grid-template-columns: 54px 1fr;
  gap: 12px;
  align-items: center;
}
.bk-teacher-avatar {
  width: 54px;
  height: 54px;
  border-radius: 999px;
  background: rgba(255,255,255,0.16);
  border: 1px solid rgba(255,255,255,0.26);
  display: grid;
  place-items: center;
  font-weight: 1000;
}
.bk-teacher-name { font-weight: 1000; font-size: 18px; letter-spacing: -0.02em; }
.bk-teacher-role { color: rgba(255,255,255,0.75); font-size: 12.5px; margin-top: 2px; }
.bk-teacher-desc { margin-top: 12px; color: rgba(255,255,255,0.88); font-size: 13px; line-height: 1.6; }

.bk-schedule { margin-top: 18px; }
.bk-schedule-list { display: grid; gap: 10px; margin-top: 12px; }
.bk-day {
  border: 1px solid var(--bk-border);
  border-radius: 18px;
  background: white;
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.bk-day-left { display: flex; align-items: center; gap: 12px; }
.bk-cal {
  width: 36px;
  height: 36px;
  border-radius: 14px;
  background: var(--bk-blue-50);
  border: 1px solid #dbeafe;
  display: grid;
  place-items: center;
  color: var(--bk-blue);
}
.bk-cal svg { width: 18px; height: 18px; fill: var(--bk-blue); }
.bk-day-name { font-weight: 900; color: var(--bk-text); }
.bk-time {
  border: 1px solid var(--bk-border);
  border-radius: 999px;
  padding: 8px 12px;
  color: #0f172a;
  background: #f8fafc;
  font-weight: 900;
  font-size: 12.5px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.bk-time svg { width: 16px; height: 16px; fill: #64748b; }

.bk-finish { margin-top: 18px; text-align: center; }
.bk-finish-title { margin: 0; font-weight: 1000; font-size: 28px; letter-spacing: -0.03em; color: var(--bk-text); }
.bk-finish-sub { margin: 8px 0 0; color: var(--bk-muted); font-size: 13.5px; line-height: 1.6; }

.bk-form {
  margin-top: 16px;
  display: grid;
  gap: 12px;
  text-align: left;
}
.bk-label {
  font-size: 11px;
  letter-spacing: 0.08em;
  color: #94a3b8;
  font-weight: 1000;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.bk-input {
  width: 100%;
  border: 1px solid var(--bk-border);
  border-radius: 14px;
  background: #f8fafc;
  padding: 12px 12px;
  font-size: 14px;
  outline: none;
  color: var(--bk-text);
}
.bk-input:focus {
  background: white;
  border-color: rgba(37, 99, 235, 0.55);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.bk-submit {
  border: 0;
  width: 100%;
  background: var(--bk-blue);
  color: white;
  border-radius: 18px;
  padding: 14px 16px;
  font-weight: 1000;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 16px 34px rgba(37, 99, 235, 0.22);
  margin-top: 6px;
}
.bk-submit:hover { background: var(--bk-blue-2); }
.bk-submit[disabled] { opacity: 0.55; cursor: not-allowed; box-shadow: none; }

.bk-state {
  margin-top: 14px;
  border: 1px dashed #cbd5e1;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.6);
  padding: 14px;
  color: #475569;
  font-size: 13.5px;
}

.bk-footer {
  margin-top: 26px;
  padding: 26px 16px 34px;
  display: grid;
  gap: 10px;
  justify-items: center;
  color: #334155;
}
.bk-footer-brand { font-weight: 900; }
.bk-footer-copy { margin: 0; color: #94a3b8; font-size: 12.5px; }
.bk-footer-link {
  color: var(--bk-blue);
  text-decoration: none;
  font-weight: 700;
  font-size: 13px;
}
.bk-footer-link:hover { text-decoration: underline; }

@media (min-width: 900px) {
  .bk-page { padding: 24px 0; align-items: flex-start; }
  .bk-shell { max-width: 1100px; min-height: auto; border-radius: 26px; overflow: hidden; box-shadow: var(--bk-shadow); }
  .bk-main { padding: 18px 22px 26px; }
  .bk-row { grid-template-columns: 1fr 1fr; }
  .bk-teacher { max-width: 760px; }
  .bk-card { max-width: 760px; }
  .bk-footer { max-width: 760px; margin-left: auto; margin-right: auto; }
}
`;

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 11H7.83l4.58-4.59L11 5l-7 7 7 7 1.41-1.41L7.83 13H19v-2z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 2h2v2h6V2h2v2h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3V2Zm15 8H2v10h20V10ZM4 8h16V6H4v2Z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 1a11 11 0 1 0 11 11A11 11 0 0 0 12 1Zm0 20a9 9 0 1 1 9-9 9 9 0 0 1-9 9Zm.5-15H11v7l6.1 3.6.8-1.2-5.4-3.2V6Z" />
    </svg>
  );
}

function firstLetter(text) {
  const t = String(text || '').trim();
  return t ? t[0].toUpperCase() : 'S';
}

function formatPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value ?? '');
  return new Intl.NumberFormat('ru-RU').format(n);
}

export default function CourseBookingPage() {
  const { slug, courseId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ok, setOk] = useState('');


  useEffect(() => {
    let canceled = false;
    const run = async () => {
      setLoading(true);
      setError('');
      setOk('');
      try {
        const resp = await fetch(`${env.VITE_API_BASE_URL}/c/${slug}/course/${courseId}`);
        const json = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(json?.error || 'Не удалось загрузить курс');
        if (!canceled) setData(json);
      } catch (e) {
        if (!canceled) setError(e instanceof Error ? e.message : 'Ошибка');
      } finally {
        if (!canceled) setLoading(false);
      }
    };
    if (slug && courseId) run();
    return () => {
      canceled = true;
    };
  }, [slug, courseId]);

  const center = data?.center ?? null;
  const course = data?.course ?? null;
  const category = data?.category ?? null;

  const days = useMemo(
    () => [
      { key: 'mon', label: 'Понедельник' },
      { key: 'tue', label: 'Вторник' },
      { key: 'wed', label: 'Среда' },
      { key: 'thu', label: 'Четверг' },
      { key: 'fri', label: 'Пятница' },
      { key: 'sat', label: 'Суббота' },
    ],
    []
  );

  const timeRange = useMemo(() => {
    const workStart = center?.schedule_settings?.workStart || '09:00';
    const workEnd = center?.schedule_settings?.workEnd || '18:00';
    return `${workStart} - ${workEnd}`;
  }, [center?.schedule_settings]);

  const teacherName = useMemo(() => {
    const raw = course?.teacher_name ? String(course.teacher_name).trim() : '';
    return raw || 'ФИО учителя';
  }, [course?.teacher_name]);

  const onSubmit = async () => {
    if (!course?.id) return;
    if (!String(name).trim() || !String(phone).trim()) {
      setError('Введите ФИО и номер телефона');
      return;
    }
    setSubmitting(true);
    setError('');
    setOk('');
    try {
      const isGroup = course.booking_type === 'group';
      const endpoint = isGroup ? 'book-group' : 'book-individual';
      const payload = isGroup
        ? {
            course_id: course.id,
            student_name: String(name).trim(),
            student_phone: String(phone).trim(),
          }
        : {
            course_id: course.id,
            student_name: String(name).trim(),
            student_phone: String(phone).trim(),
          };

      const resp = await fetch(`${env.VITE_API_BASE_URL}/c/${slug}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(json?.error || 'Не удалось отправить заявку');

      setOk(
        isGroup
          ? 'Вы записаны. Центр скоро свяжется с вами.'
          : 'Запись подтверждена. До встречи!'
      );
      setName('');
      setPhone('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bk-page">
      <style>{css}</style>

      <div className="bk-shell">
        <header className="bk-topbar">
          <button className="bk-back" type="button" onClick={() => navigate(-1)} aria-label="Назад">
            <ArrowLeftIcon />
          </button>
          <div className="bk-center-name">{center?.name || 'Центр'}</div>
          <div className="bk-avatar" aria-label="Логотип центра">
            {center?.logo_url ? (
              <img src={center.logo_url} alt={center?.name || 'Center'} />
            ) : (
              <div className="bk-avatar-fallback">{firstLetter(center?.name)}</div>
            )}
          </div>
        </header>

        <main className="bk-main">
          {loading ? (
            <div className="bk-state">Загружаем…</div>
          ) : error ? (
            <div className="bk-state">{error}</div>
          ) : !course ? (
            <div className="bk-state">Курс не найден.</div>
          ) : (
            <>
              <div className="bk-kicker">{category?.name || 'Предмет'}</div>
              <h1 className="bk-title">{course.name}</h1>

              <div className="bk-card bk-price" aria-label="Цена">
                <div className="bk-price-inner">
                  <div className="bk-price-label">Цена</div>
                  <div className="bk-price-value">{formatPrice(course.price)} ₸</div>
                </div>
                <div className="bk-price-bar" />
              </div>

              <section className="bk-card" aria-label="Описание курса">
                <div className="bk-h2">Описание курса</div>
                <p className="bk-p">{course.description || 'Описание курса'}</p>

                <div className="bk-row">
                  <div className="bk-tile">
                    <div className="bk-tile-title">Сколько мест всего</div>
                    <div className="bk-tile-sub">
                      {course.group_capacity ? `Всего: ${course.group_capacity}` : '—'}
                    </div>
                  </div>
                  <div className="bk-tile">
                    <div className="bk-tile-title">Тип записи</div>
                    <div className="bk-tile-sub">
                      {course.booking_type === 'group' ? 'Групповая' : 'Индивидуальная'}
                    </div>
                  </div>
                </div>
              </section>

              <section className="bk-teacher" aria-label="Учитель">
                <div className="bk-teacher-top">
                  <div className="bk-teacher-avatar">{firstLetter(teacherName)}</div>
                  <div>
                    <div className="bk-teacher-name">{teacherName}</div>
                    <div className="bk-teacher-role">Мастер-учитель</div>
                  </div>
                </div>
                <div className="bk-teacher-desc">Описание учителя</div>
              </section>

              <section className="bk-card bk-schedule" aria-label="Расписание на неделю">
                <div className="bk-h2">Расписание на неделю</div>
                <div className="bk-schedule-list">
                  {days.map((d) => (
                    <div className="bk-day" key={d.key}>
                      <div className="bk-day-left">
                        <div className="bk-cal">
                          <CalendarIcon />
                        </div>
                        <div className="bk-day-name">{d.label}</div>
                      </div>
                      <div className="bk-time">
                        <ClockIcon />
                        {timeRange}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bk-card bk-finish" aria-label="Завершить запись">
                <h2 className="bk-finish-title">Завершить запись</h2>
                <p className="bk-finish-sub">
                  Заполните данные — запись будет подтверждена автоматически.
                </p>

                <div className="bk-form">
                  <div>
                    <div className="bk-label">ФИО</div>
                    <input
                      className="bk-input"
                      placeholder="например, Илья Соколов"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <div className="bk-label">Номер телефона</div>
                    <input
                      className="bk-input"
                      placeholder="+7 (900) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <button
                    className="bk-submit"
                    type="button"
                    onClick={onSubmit}
                    disabled={submitting}
                  >
                    {submitting
                      ? 'Отправляем…'
                      : course.booking_type === 'group'
                        ? 'Записаться'
                        : 'Подтвердить запись'}
                  </button>
                </div>

                {ok ? <div className="bk-state">{ok}</div> : null}
              </section>

              <footer className="bk-footer">
                <div className="bk-footer-brand">SmartBook</div>
                <p className="bk-footer-copy">© 2026 SmartBook - Rajs</p>
                <a
                  className="bk-footer-link"
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
    </div>
  );
}
