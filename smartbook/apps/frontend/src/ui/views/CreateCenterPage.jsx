import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { env } from '../../lib/env';

const css = `
.cc-page {
  --cc-blue: #2563eb;
  --cc-blue-2: #1d4ed8;
  --cc-blue-50: #eff6ff;
  --cc-text: #0f172a;
  --cc-muted: #64748b;
  --cc-border: #e2e8f0;
  --cc-bg: #f8fafc;
  --cc-card: #ffffff;
  --cc-shadow: 0 12px 40px rgba(15, 23, 42, 0.10);

  min-height: 100vh;
  background: var(--cc-bg);
  display: flex;
  justify-content: center;
}

.cc-shell {
  width: 100%;
  max-width: 430px;
  min-height: 100vh;
  background: var(--cc-bg);
}

.cc-topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(248, 250, 252, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--cc-border);
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cc-back {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  border: 1px solid var(--cc-border);
  background: white;
  display: grid;
  place-items: center;
  cursor: pointer;
}
.cc-back svg { width: 18px; height: 18px; fill: #334155; }

.cc-brand {
  font-weight: 900;
  letter-spacing: -0.02em;
  color: var(--cc-text);
}

.cc-main { padding: 18px 16px 26px; }

.cc-hero {
  text-align: center;
  padding: 16px 8px 6px;
}
.cc-hero h1 {
  margin: 8px 0 8px;
  font-size: 28px;
  line-height: 1.12;
  font-weight: 900;
  letter-spacing: -0.03em;
  color: var(--cc-text);
}
.cc-hero p {
  margin: 0;
  color: var(--cc-muted);
  font-size: 13.5px;
  line-height: 1.55;
}

.cc-card {
  background: var(--cc-card);
  border: 1px solid var(--cc-border);
  border-radius: 22px;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.06);
  padding: 16px;
  margin-top: 14px;
}

.cc-card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 900;
  color: var(--cc-text);
  margin-bottom: 14px;
}
.cc-ic {
  width: 32px;
  height: 32px;
  border-radius: 14px;
  background: var(--cc-blue-50);
  border: 1px solid #dbeafe;
  display: grid;
  place-items: center;
  color: var(--cc-blue);
}
.cc-ic svg { width: 18px; height: 18px; }

.cc-grid { display: grid; gap: 12px; }
.cc-label {
  font-size: 11px;
  letter-spacing: 0.08em;
  color: #94a3b8;
  font-weight: 900;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.cc-input, .cc-textarea, .cc-select {
  width: 100%;
  border: 1px solid var(--cc-border);
  border-radius: 14px;
  background: #f8fafc;
  padding: 12px 12px;
  font-size: 14px;
  outline: none;
  color: var(--cc-text);
}
.cc-textarea { min-height: 92px; resize: vertical; }
.cc-input:focus, .cc-textarea:focus, .cc-select:focus {
  background: white;
  border-color: rgba(37, 99, 235, 0.55);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.cc-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

.cc-logo {
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: 6px 0 4px;
}
.cc-logo-btn {
  width: 88px;
  height: 88px;
  border-radius: 999px;
  border: 1px dashed #cbd5e1;
  background: #f8fafc;
  display: grid;
  place-items: center;
  cursor: pointer;
  overflow: hidden;
}
.cc-logo-btn img { width: 100%; height: 100%; object-fit: cover; }
.cc-logo-hint { color: var(--cc-muted); font-size: 12px; }
.cc-logo-btn svg { width: 22px; height: 22px; fill: #94a3b8; }

.cc-section {
  margin-top: 14px;
  border-left: 4px solid var(--cc-blue);
  padding-left: 12px;
}

.cc-block {
  border: 1px solid var(--cc-border);
  background: white;
  border-radius: 18px;
  padding: 14px;
  margin-top: 12px;
}
.cc-block-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.cc-block-title { font-weight: 900; }
.cc-remove {
  width: 36px;
  height: 36px;
  border-radius: 14px;
  border: 1px solid var(--cc-border);
  background: white;
  cursor: pointer;
  display: grid;
  place-items: center;
}
.cc-remove svg { width: 18px; height: 18px; fill: #64748b; }

.cc-seg {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.cc-pill {
  border: 1px solid var(--cc-border);
  background: #f8fafc;
  border-radius: 14px;
  padding: 10px 10px;
  font-weight: 900;
  font-size: 13px;
  cursor: pointer;
}
.cc-pill.active {
  border-color: rgba(37, 99, 235, 0.65);
  background: rgba(37, 99, 235, 0.08);
  color: var(--cc-blue);
}

.cc-add {
  width: 100%;
  margin-top: 12px;
  border: 2px dashed #cbd5e1;
  background: transparent;
  border-radius: 18px;
  padding: 14px;
  cursor: pointer;
  font-weight: 900;
  color: #334155;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}
.cc-add svg { width: 18px; height: 18px; fill: #334155; }

.cc-actions {
  margin-top: 16px;
  display: grid;
  gap: 10px;
}
.cc-submit {
  border: 0;
  width: 100%;
  background: var(--cc-blue);
  color: white;
  border-radius: 18px;
  padding: 14px 16px;
  font-weight: 900;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 16px 34px rgba(37, 99, 235, 0.22);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.cc-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.cc-submit svg { width: 18px; height: 18px; fill: white; }

.cc-error, .cc-ok {
  border-radius: 16px;
  padding: 12px 12px;
  font-size: 13px;
  line-height: 1.45;
}
.cc-error { border: 1px solid #fecaca; background: #fff1f2; color: #9f1239; }
.cc-ok { border: 1px solid #bbf7d0; background: #f0fdf4; color: #166534; }

@media (min-width: 900px) {
  .cc-page { padding: 24px 0; align-items: flex-start; }
  .cc-shell { max-width: 1100px; min-height: auto; border-radius: 26px; overflow: hidden; box-shadow: 0 18px 60px rgba(15, 23, 42, 0.10); }
  .cc-main { padding: 18px 22px 26px; }
  .cc-row2 { grid-template-columns: 1fr 1fr; }
  .cc-seg { grid-template-columns: 1fr 1fr; }
  .cc-actions { max-width: 560px; }
}
`;

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14.7 6.3a1 1 0 0 1 0 1.4L10.4 12l4.3 4.3a1 1 0 1 1-1.4 1.4l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 0 1 1.4 0Z" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9.5 5.5 10.6 4h2.8l1.1 1.5H18a3 3 0 0 1 3 3v8.5a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8.5a3 3 0 0 1 3-3h3.5ZM6 7a1.5 1.5 0 0 0-1.5 1.5V17A1.5 1.5 0 0 0 6 18.5h12A1.5 1.5 0 0 0 19.5 17V8.5A1.5 1.5 0 0 0 18 7H6Zm6 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 1.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H6a1 1 0 1 1 0-2h5V6a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 3a1 1 0 0 0-1 1v1H5a1 1 0 1 0 0 2h1v13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7h1a1 1 0 1 0 0-2h-3V4a1 1 0 0 0-1-1H9Zm1 2h4v0H10v0Zm-2 2h8v13H8V7Zm2 2a1 1 0 0 1 1 1v7a1 1 0 1 1-2 0v-7a1 1 0 0 1 1-1Zm5 0a1 1 0 0 1 1 1v7a1 1 0 1 1-2 0v-7a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

function CheckArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.5 5.5a1 1 0 0 1 1.4 0l6 6a1 1 0 0 1 0 1.4l-6 6a1 1 0 1 1-1.4-1.4l4.3-4.3H4a1 1 0 1 1 0-2h13.8l-4.3-4.3a1 1 0 0 1 0-1.4Z" />
    </svg>
  );
}

function SectionIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6 4h12a2 2 0 0 1 2 2v2H4V6a2 2 0 0 1 2-2Zm-2 6h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8Zm4 2a1 1 0 0 0 0 2h5a1 1 0 1 0 0-2H8Z"
      />
    </svg>
  );
}

const emptyService = () => ({
  categoryName: '',
  courseName: '',
  bookingType: 'individual',
  price: '',
  groupCapacity: '',
  description: '',
  teacherName: '',
});

export default function CreateCenterPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [centerName, setCenterName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [centerDescription, setCenterDescription] = useState('');
  const [logoDataUrl, setLogoDataUrl] = useState('');

  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [ownerPassword2, setOwnerPassword2] = useState('');

  const [services, setServices] = useState([emptyService()]);

  const [workStart, setWorkStart] = useState('09:00');
  const [workEnd, setWorkEnd] = useState('18:00');
  const [consultationIntervalMinutes, setConsultationIntervalMinutes] = useState('15');
  const [consultationPrice, setConsultationPrice] = useState('2000');
  const [defaultGroupLimit, setDefaultGroupLimit] = useState('10');
  const [bookingWindowWeeks, setBookingWindowWeeks] = useState('2');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const canSubmit = useMemo(() => {
    if (!centerName.trim()) return false;
    if (!ownerEmail.trim()) return false;
    if (!ownerPassword || ownerPassword.length < 6) return false;
    if (ownerPassword !== ownerPassword2) return false;

    for (const s of services) {
      if (!s.categoryName.trim()) return false;
      if (!s.courseName.trim()) return false;
      const p = Number(String(s.price).trim());
      if (!Number.isFinite(p) || p < 0) return false;
      if (s.bookingType === 'group') {
        const cap = Number(String(s.groupCapacity).trim());
        if (!Number.isFinite(cap) || cap <= 0) return false;
      }
    }

    return true;
  }, [centerName, ownerEmail, ownerPassword, ownerPassword2, services]);

  const pickLogo = () => fileInputRef.current?.click?.();

  const onLogoFile = async (file) => {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setError('Логотип слишком большой (макс. 3MB).');
      return;
    }

    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('read failed'));
      reader.readAsDataURL(file);
    });

    setLogoDataUrl(dataUrl);
  };

  const updateService = (idx, patch) => {
    setServices((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const addService = () => setServices((prev) => [...prev, emptyService()]);
  const removeService = (idx) =>
    setServices((prev) => prev.filter((_, i) => i !== idx).length ? prev.filter((_, i) => i !== idx) : [emptyService()]);

  const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Удаляем спецсимволы
    .replace(/\s+/g, '-')     // Заменяем пробелы на дефисы
    .trim();
};
  const submit = async () => {
    setError('');
    setOk('');

    if (!canSubmit) {
      setError('Проверьте обязательные поля (и совпадение паролей).');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        center: {
          name: centerName.trim(),
          slug: generateSlug(centerName),
          address: address.trim() || null,
          phone: phone.trim() || null,
          description: centerDescription.trim() || null,
          logoDataUrl: logoDataUrl || null,
        },
        owner: {
          fullName: ownerName.trim() || null,
          email: ownerEmail.trim(),
          password: ownerPassword,
        },
        services: services.map((s) => ({
          categoryName: s.categoryName.trim(),
          courseName: s.courseName.trim(),
          bookingType: s.bookingType,
          price: Number(String(s.price).trim()),
          groupCapacity:
            s.bookingType === 'group' ? Number(String(s.groupCapacity).trim()) : null,
          description: s.description.trim() || null,
          teacherName: s.teacherName.trim() || null,
        })),
        schedule: {
          workStart: workStart || null,
          workEnd: workEnd || null,
          consultationIntervalMinutes: Number(consultationIntervalMinutes),
          consultationPrice: Number(consultationPrice),
          defaultGroupLimit: Number(defaultGroupLimit),
          bookingWindowWeeks: Number(bookingWindowWeeks),
        },
      };

      const resp = await fetch(`${env.VITE_API_BASE_URL}/api/centers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(json?.error || 'Не удалось создать центр');
      }

      setOk(`Центр создан. Слаг: ${json?.center?.slug || json?.center?.slug || ''}`.trim());
      setTimeout(
        () => navigate(json?.center?.slug ? `/c/${json.center.slug}` : '/'),
        800
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cc-page">
      <style>{css}</style>

      <div className="cc-shell">
        <header className="cc-topbar">
          <button className="cc-back" type="button" onClick={() => navigate(-1)} aria-label="Назад">
            <ArrowLeftIcon />
          </button>
          <div className="cc-brand">SmartBook</div>
          <div style={{ width: 38 }} />
        </header>

        <main className="cc-main">
          <section className="cc-hero">
            <h1>Создание центра</h1>
            <p>
              Давайте настроим ваше рабочее пространство. <br />
              Это займёт всего пару минут.
            </p>
          </section>

          {error ? <div className="cc-error">{error}</div> : null}
          {ok ? <div className="cc-ok">{ok}</div> : null}

          <section className="cc-card" aria-label="Информация о центре">
            <div className="cc-card-title">
              <div className="cc-ic">
                <SectionIcon />
              </div>
              Информация о центре
            </div>

            <div className="cc-logo">
              <button className="cc-logo-btn" type="button" onClick={pickLogo} aria-label="Загрузить логотип">
                {logoDataUrl ? <img src={logoDataUrl} alt="Логотип" /> : <CameraIcon />}
              </button>
              <div className="cc-logo-hint">Загрузить логотип</div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => onLogoFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="cc-grid">
              <div>
                <div className="cc-label">Название центра</div>
                <input
                  className="cc-input"
                  placeholder="например, YourTeacher"
                  value={centerName}
                  onChange={(e) => setCenterName(e.target.value)}
                />
              </div>

              <div>
                <div className="cc-label">Адрес</div>
                <input
                  className="cc-input"
                  placeholder="Улица, дом, город"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div>
                <div className="cc-label">Контактный телефон</div>
                <input
                  className="cc-input"
                  placeholder="+7 (999) 000-00-00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <div className="cc-label">Описание</div>
                <textarea
                  className="cc-textarea"
                  placeholder="Расскажите клиентам о ваших услугах..."
                  value={centerDescription}
                  onChange={(e) => setCenterDescription(e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="cc-card" aria-label="Аккаунт владельца">
            <div className="cc-card-title">
              <div className="cc-ic">
                <SectionIcon />
              </div>
              Аккаунт владельца
            </div>

            <div className="cc-grid">
              <div>
                <div className="cc-label">Имя владельца</div>
                <input
                  className="cc-input"
                  placeholder="ФИО"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                />
              </div>
              <div>
                <div className="cc-label">Email</div>
                <input
                  className="cc-input"
                  placeholder="owner@example.com"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                />
              </div>
              <div>
                <div className="cc-label">Пароль</div>
                <input
                  className="cc-input"
                  type="password"
                  placeholder="••••••••"
                  value={ownerPassword}
                  onChange={(e) => setOwnerPassword(e.target.value)}
                />
              </div>
              <div>
                <div className="cc-label">Подтвердите пароль</div>
                <input
                  className="cc-input"
                  type="password"
                  placeholder="••••••••"
                  value={ownerPassword2}
                  onChange={(e) => setOwnerPassword2(e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="cc-section" aria-label="Услуги и категории">
            <div className="cc-card-title" style={{ marginTop: 14 }}>
              <div className="cc-ic">
                <SectionIcon />
              </div>
              Услуги и категории
            </div>

            {services.map((s, idx) => (
              <div className="cc-block" key={idx}>
                <div className="cc-block-top">
                  <div className="cc-block-title">Категория {idx + 1}</div>
                  {services.length > 1 ? (
                    <button className="cc-remove" type="button" onClick={() => removeService(idx)} aria-label="Удалить">
                      <TrashIcon />
                    </button>
                  ) : null}
                </div>

                <div className="cc-grid" style={{ marginTop: 12 }}>
                  <div>
                    <div className="cc-label">Название категории</div>
                    <input
                      className="cc-input"
                      placeholder="Математика"
                      value={s.categoryName}
                      onChange={(e) => updateService(idx, { categoryName: e.target.value })}
                    />
                  </div>

                  <div>
                    <div className="cc-label">Название предмета</div>
                    <input
                      className="cc-input"
                      placeholder="Алгебра"
                      value={s.courseName}
                      onChange={(e) => updateService(idx, { courseName: e.target.value })}
                    />
                  </div>

                  <div className="cc-row2">
                    <div>
                      <div className="cc-label">Тип записи</div>
                      <div className="cc-seg">
                        <button
                          className={`cc-pill ${s.bookingType === 'individual' ? 'active' : ''}`}
                          type="button"
                          onClick={() => updateService(idx, { bookingType: 'individual' })}
                        >
                          Индивидуально
                        </button>
                        <button
                          className={`cc-pill ${s.bookingType === 'group' ? 'active' : ''}`}
                          type="button"
                          onClick={() => updateService(idx, { bookingType: 'group' })}
                        >
                          Группа
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="cc-label">Цена (тенге) в месяц</div>
                      <input
                        className="cc-input"
                        inputMode="numeric"
                        placeholder="5000"
                        value={s.price}
                        onChange={(e) => updateService(idx, { price: e.target.value })}
                      />
                    </div>
                  </div>

                  {s.bookingType === 'group' ? (
                    <div>
                      <div className="cc-label">Лимит группы</div>
                      <input
                        className="cc-input"
                        inputMode="numeric"
                        placeholder="10"
                        value={s.groupCapacity}
                        onChange={(e) => updateService(idx, { groupCapacity: e.target.value })}
                      />
                    </div>
                  ) : null}

                  <div>
                    <div className="cc-label">Описание</div>
                    <textarea
                      className="cc-textarea"
                      placeholder="Интенсивное занятие 1 на 1, ориентированное на ваши личные цели..."
                      value={s.description}
                      onChange={(e) => updateService(idx, { description: e.target.value })}
                    />
                  </div>

                  <div>
                    <div className="cc-label">Имя учителя</div>
                    <input
                      className="cc-input"
                      placeholder="Иван Николаевич"
                      value={s.teacherName}
                      onChange={(e) => updateService(idx, { teacherName: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            ))}

            <button className="cc-add" type="button" onClick={addService}>
              <PlusIcon /> Добавить категорию
            </button>

            <div className="cc-card" style={{ marginTop: 14 }} aria-label="Настройки расписания">
              <div className="cc-card-title">
                <div className="cc-ic">
                  <SectionIcon />
                </div>
                Настройки расписания
              </div>

              <div className="cc-grid">
                <div className="cc-row2">
                  <div>
                    <div className="cc-label">Рабочие часы</div>
                    <input
                      className="cc-input"
                      type="time"
                      value={workStart}
                      onChange={(e) => setWorkStart(e.target.value)}
                    />
                  </div>
                  <div>
                    <div className="cc-label">&nbsp;</div>
                    <input
                      className="cc-input"
                      type="time"
                      value={workEnd}
                      onChange={(e) => setWorkEnd(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <div className="cc-label">Интервал консультации</div>
                  <select
                    className="cc-select"
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
                  <div className="cc-label">Цена (тенге) консультации</div>
                  <input
                    className="cc-input"
                    inputMode="numeric"
                    value={consultationPrice}
                    onChange={(e) => setConsultationPrice(e.target.value)}
                  />
                </div>

                <div>
                  <div className="cc-label">Лимит группы</div>
                  <input
                    className="cc-input"
                    inputMode="numeric"
                    value={defaultGroupLimit}
                    onChange={(e) => setDefaultGroupLimit(e.target.value)}
                  />
                </div>

                <div>
                  <div className="cc-label">Окно записи</div>
                  <select
                    className="cc-select"
                    value={bookingWindowWeeks}
                    onChange={(e) => setBookingWindowWeeks(e.target.value)}
                  >
                    <option value="1">на 1 неделю вперёд</option>
                    <option value="2">на 2 недели вперёд</option>
                    <option value="4">на 4 недели вперёд</option>
                    <option value="8">на 8 недель вперёд</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="cc-actions">
              <button className="cc-submit" type="button" onClick={submit} disabled={submitting || !canSubmit}>
                {submitting ? 'Создаём…' : 'Создать центр'} <CheckArrowIcon />
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
