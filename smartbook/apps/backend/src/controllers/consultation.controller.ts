import { Request, Response } from 'express';

import { supabase } from '../db/supabase.js';

function parseTimeHHMM(value: any, fallback: string) {
  const raw = String(value ?? '').trim();
  if (!/^\d{2}:\d{2}$/.test(raw)) return fallback;
  return raw;
}

function toYmd(date: Date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function utcIsoFromYmdHm(ymd: string, hm: string) {
  const [y, m, d] = ymd.split('-').map((v) => Number.parseInt(v, 10));
  const [hh, mm] = hm.split(':').map((v) => Number.parseInt(v, 10));
  const dt = new Date(Date.UTC(y, m - 1, d, hh, mm, 0, 0));
  return dt.toISOString();
}

function addMinutesUtcIso(iso: string, minutes: number) {
  const d = new Date(iso);
  const dt = new Date(d.getTime() + minutes * 60_000);
  return dt.toISOString();
}

function minutesBetweenHHMM(a: string, b: string) {
  const [ah, am] = a.split(':').map((v) => Number.parseInt(v, 10));
  const [bh, bm] = b.split(':').map((v) => Number.parseInt(v, 10));
  return (bh * 60 + bm) - (ah * 60 + am);
}

export const getConfig = async (req: Request, res: Response) => {
  try {
    const centerId = req.centerId;
    if (!centerId) return res.status(400).json({ error: 'Missing centerId' });

    const { data: centerRows, error: centerError } = await supabase
      .from('centers')
      .select('id,slug,name,schedule_settings')
      .eq('id', centerId)
      .limit(1);

    if (centerError) return res.status(500).json({ error: centerError.message });
    const center: any = centerRows?.[0];
    if (!center) return res.status(404).json({ error: 'Center not found' });

    const ss: any = center.schedule_settings ?? {};
    const workStart = parseTimeHHMM(ss.workStart, '09:00');
    const workEnd = parseTimeHHMM(ss.workEnd, '18:00');
    const intervalMinutes = Math.max(15, Number.parseInt(String(ss.consultationIntervalMinutes ?? '30'), 10) || 30);
    const consultationPrice = Math.max(0, Number.parseInt(String(ss.consultationPrice ?? '0'), 10) || 0);
    const bookingWindowWeeks = Math.max(1, Number.parseInt(String(ss.bookingWindowWeeks ?? '4'), 10) || 4);

    return res.json({
      center: { id: center.id, slug: center.slug, name: center.name },
      scheduleSettings: { workStart, workEnd, intervalMinutes, consultationPrice, bookingWindowWeeks },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message ?? 'Internal Server Error' });
  }
};

async function ensureConsultationCourse(centerId: string, price: number) {
  const categoryName = 'Консультации';
  const courseName = 'Индивидуальная консультация';

  const { data: catRows, error: catError } = await supabase
    .from('categories')
    .select('id')
    .eq('center_id', centerId)
    .eq('name', categoryName)
    .limit(1);
  if (catError) throw catError;

  let categoryId = catRows?.[0]?.id as string | undefined;
  if (!categoryId) {
    const { data: newCat, error: newCatError } = await supabase
      .from('categories')
      .insert({ center_id: centerId, name: categoryName })
      .select()
      .single();
    if (newCatError) throw newCatError;
    categoryId = newCat.id;
  }

  const { data: courseRows, error: courseError } = await supabase
    .from('courses')
    .select('id, price')
    .eq('center_id', centerId)
    .eq('category_id', categoryId)
    .eq('name', courseName)
    .limit(1);

  if (courseError) throw courseError;
  const existing: any = courseRows?.[0];
  if (existing?.id) {
    const currentPrice = Number(existing.price ?? 0);
    if (Number.isFinite(price) && currentPrice !== price) {
      await supabase.from('courses').update({ price }).eq('id', existing.id).eq('center_id', centerId);
    }
    return String(existing.id);
  }

  const { data: course, error: createError } = await supabase
    .from('courses')
    .insert({
      center_id: centerId,
      category_id: categoryId,
      name: courseName,
      description: null,
      teacher_name: null,
      price,
      booking_type: 'individual',
      group_capacity: null,
      is_active: false,
    })
    .select()
    .single();

  if (createError) throw createError;
  return String(course.id);
}

async function ensureFutureCourse(centerId: string) {
  const categoryName = 'Будущие записи';
  const courseName = 'Запись на будущее';

  const { data: catRows, error: catError } = await supabase
    .from('categories')
    .select('id')
    .eq('center_id', centerId)
    .eq('name', categoryName)
    .limit(1);
  if (catError) throw catError;

  let categoryId = catRows?.[0]?.id as string | undefined;
  if (!categoryId) {
    const { data: newCat, error: newCatError } = await supabase
      .from('categories')
      .insert({ center_id: centerId, name: categoryName })
      .select()
      .single();
    if (newCatError) throw newCatError;
    categoryId = newCat.id;
  }

  const { data: courseRows, error: courseError } = await supabase
    .from('courses')
    .select('id')
    .eq('center_id', centerId)
    .eq('category_id', categoryId)
    .eq('name', courseName)
    .limit(1);
  if (courseError) throw courseError;

  const existing: any = courseRows?.[0];
  if (existing?.id) return String(existing.id);

  const { data: course, error: createError } = await supabase
    .from('courses')
    .insert({
      center_id: centerId,
      category_id: categoryId,
      name: courseName,
      description: null,
      teacher_name: null,
      price: 0,
      booking_type: 'individual',
      group_capacity: null,
      is_active: false,
    })
    .select()
    .single();

  if (createError) throw createError;
  return String(course.id);
}

export const createWaitlist = async (req: Request, res: Response) => {
  try {
    const centerId = req.centerId;
    if (!centerId) return res.status(400).json({ error: 'Missing centerId' });

    const student_name = String(req.body?.student_name ?? '').trim();
    const student_phone = String(req.body?.student_phone ?? '').trim();
    const starts_at = String(req.body?.starts_at ?? '').trim();
    const ends_at = String(req.body?.ends_at ?? '').trim();

    if (!student_name || !student_phone || !starts_at || !ends_at) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data: centerRows, error: centerError } = await supabase
      .from('centers')
      .select('schedule_settings')
      .eq('id', centerId)
      .limit(1);
    if (centerError) return res.status(500).json({ error: centerError.message });
    const ss: any = centerRows?.[0]?.schedule_settings ?? {};
    const consultationPrice = Math.max(0, Number.parseInt(String(ss.consultationPrice ?? '0'), 10) || 0);

    const courseId = await ensureConsultationCourse(centerId, consultationPrice);

    const message = `slot:${starts_at}|${ends_at}`;

    const { data: existingRows, error: existingError } = await supabase
      .from('waitlist_requests')
      .select('id')
      .eq('center_id', centerId)
      .eq('status', 'waiting')
      .eq('message', message)
      .limit(1);

    if (existingError) return res.status(500).json({ error: existingError.message });
    if (existingRows?.[0]?.id) return res.status(400).json({ error: 'Этот слот уже занят' });

    const { data: entry, error } = await supabase
      .from('waitlist_requests')
      .insert({
        center_id: centerId,
        course_id: courseId,
        student_name,
        student_phone,
        message,
        status: 'waiting',
      })
      .select(`
        *,
        courses ( name )
      `)
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(entry);
  } catch (error: any) {
    return res.status(500).json({ error: error?.message ?? 'Internal Server Error' });
  }
};

export const createFutureWaitlist = async (req: Request, res: Response) => {
  try {
    const centerId = req.centerId;
    if (!centerId) return res.status(400).json({ error: 'Missing centerId' });

    const student_phone = String(req.body?.student_phone ?? '').trim();
    const wishes = String(req.body?.wishes ?? '').trim();
    if (!student_phone) return res.status(400).json({ error: 'Введите номер телефона' });

    const courseId = await ensureFutureCourse(centerId);
    const message = `future:${wishes || '-'}`;

    const { data: entry, error } = await supabase
      .from('waitlist_requests')
      .insert({
        center_id: centerId,
        course_id: courseId,
        student_name: 'Без имени',
        student_phone,
        message,
        status: 'waiting',
      })
      .select(`
        *,
        courses ( name )
      `)
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(entry);
  } catch (error: any) {
    return res.status(500).json({ error: error?.message ?? 'Internal Server Error' });
  }
};

export const getSlots = async (req: Request, res: Response) => {
  try {
    const centerId = req.centerId;
    if (!centerId) return res.status(400).json({ error: 'Missing centerId' });

    const { data: centerRows, error: centerError } = await supabase
      .from('centers')
      .select('id,slug,name,schedule_settings')
      .eq('id', centerId)
      .limit(1);

    if (centerError) return res.status(500).json({ error: centerError.message });
    const center: any = centerRows?.[0];
    if (!center) return res.status(404).json({ error: 'Center not found' });

    const ss: any = center.schedule_settings ?? {};
    const workStart = parseTimeHHMM(ss.workStart, '09:00');
    const workEnd = parseTimeHHMM(ss.workEnd, '18:00');
    const intervalMinutes = Math.max(15, Number.parseInt(String(ss.consultationIntervalMinutes ?? '30'), 10) || 30);
    const bookingWindowWeeks = Math.max(1, Number.parseInt(String(ss.bookingWindowWeeks ?? '4'), 10) || 4);

    const totalMinutes = minutesBetweenHHMM(workStart, workEnd);
    if (totalMinutes <= 0) return res.status(400).json({ error: 'Invalid working hours' });

    const now = new Date();
    const maxDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    maxDate.setUTCDate(maxDate.getUTCDate() + bookingWindowWeeks * 7);
    const maxYmd = toYmd(maxDate);

    const days: Array<{ date: string; slots: any[] }> = [];
    for (let i = 0; i < 7; i += 1) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
      d.setUTCDate(d.getUTCDate() + i);
      const ymd = toYmd(d);
      if (ymd > maxYmd) break;

      const slots: any[] = [];
      for (let minutes = 0; minutes + intervalMinutes <= totalMinutes; minutes += intervalMinutes) {
        const startIso = addMinutesUtcIso(utcIsoFromYmdHm(ymd, workStart), minutes);
        const endIso = addMinutesUtcIso(startIso, intervalMinutes);
        slots.push({
          startsAt: startIso,
          endsAt: endIso,
          start: startIso.slice(11, 16),
          end: endIso.slice(11, 16),
          key: `slot:${startIso}|${endIso}`,
        });
      }
      days.push({ date: ymd, slots });
    }

    const { data: reqRows, error: reqError } = await supabase
      .from('waitlist_requests')
      .select('message')
      .eq('center_id', centerId)
      .eq('status', 'waiting')
      .limit(2000);

    if (reqError) return res.status(500).json({ error: reqError.message });

    const bookedKeys = new Set<string>();
    for (const r of reqRows ?? []) {
      const msg = String((r as any).message ?? '');
      if (msg.startsWith('slot:')) bookedKeys.add(msg);
    }

    const outDays = days.map((day) => ({
      date: day.date,
      slots: day.slots.map((s) => ({
        startsAt: s.startsAt,
        endsAt: s.endsAt,
        start: s.start,
        end: s.end,
        booked: bookedKeys.has(s.key),
      })),
    }));

    return res.json({ center: { id: center.id, slug: center.slug, name: center.name }, intervalMinutes, days: outDays });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message ?? 'Internal Server Error' });
  }
};
