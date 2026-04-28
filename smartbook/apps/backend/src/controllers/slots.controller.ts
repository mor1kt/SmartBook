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

export const getCourseSlots = async (req: Request, res: Response) => {
  try {
    const centerId = req.centerId;
    if (!centerId) return res.status(400).json({ error: 'Missing centerId' });

    const { courseId } = req.params as any;
    if (!courseId) return res.status(400).json({ error: 'Missing courseId' });

    const { data: courseRows, error: courseError } = await supabase
      .from('courses')
      .select('id, booking_type, name, price')
      .eq('id', courseId)
      .eq('center_id', centerId)
      .limit(1);

    if (courseError) return res.status(500).json({ error: courseError.message });
    const course: any = courseRows?.[0];
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (course.booking_type !== 'individual') {
      return res.status(400).json({ error: 'Course is not individual' });
    }

    const { data: centerRows, error: centerError } = await supabase
      .from('centers')
      .select('schedule_settings')
      .eq('id', centerId)
      .limit(1);

    if (centerError) return res.status(500).json({ error: centerError.message });
    const scheduleSettings: any = centerRows?.[0]?.schedule_settings ?? {};

    const workStart = parseTimeHHMM(scheduleSettings.workStart, '09:00');
    const workEnd = parseTimeHHMM(scheduleSettings.workEnd, '18:00');
    const intervalMinutes = Math.max(15, Number.parseInt(String(scheduleSettings.consultationIntervalMinutes ?? '30'), 10) || 30);
    const bookingWindowWeeks = Math.max(1, Number.parseInt(String(scheduleSettings.bookingWindowWeeks ?? '4'), 10) || 4);

    const totalMinutes = minutesBetweenHHMM(workStart, workEnd);
    if (totalMinutes <= 0) {
      return res.status(400).json({ error: 'Invalid working hours' });
    }

    const now = new Date();
    const todayYmd = toYmd(now);
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
        const startHm = addMinutesUtcIso(utcIsoFromYmdHm(ymd, workStart), minutes)
          .slice(11, 16);
        const endHm = endIso.slice(11, 16);
        slots.push({ startIso, endIso, start: startHm, end: endHm });
      }
      days.push({ date: ymd, slots });
    }

    // Load existing slots for the window
    const windowStartIso = utcIsoFromYmdHm(todayYmd, '00:00');
    const windowEndIso = addMinutesUtcIso(utcIsoFromYmdHm(maxYmd, '23:59'), 1);

    const { data: existingSlots, error: slotsError } = await supabase
      .from('time_slots')
      .select('id, starts_at, ends_at')
      .eq('center_id', centerId)
      .eq('course_id', courseId)
      .gte('starts_at', windowStartIso)
      .lt('starts_at', windowEndIso);

    if (slotsError) return res.status(500).json({ error: slotsError.message });

    const byStartIso = new Map<string, any>();
    for (const s of existingSlots ?? []) {
      byStartIso.set(String((s as any).starts_at), s);
    }

    const toInsert: any[] = [];
    for (const day of days) {
      for (const s of day.slots) {
        if (!byStartIso.has(s.startIso)) {
          toInsert.push({
            center_id: centerId,
            course_id: courseId,
            starts_at: s.startIso,
            ends_at: s.endIso,
          });
        }
      }
    }

    if (toInsert.length) {
      // best-effort create missing slots; ignore duplicates (race)
      const { error: insertError } = await supabase.from('time_slots').insert(toInsert);
      if (insertError) {
        const msg = String(insertError.message ?? '');
        if (!msg.toLowerCase().includes('duplicate') && !msg.toLowerCase().includes('overlap')) {
          return res.status(500).json({ error: insertError.message });
        }
      }
    }

    const { data: allSlots, error: allSlotsError } = await supabase
      .from('time_slots')
      .select('id, starts_at, ends_at')
      .eq('center_id', centerId)
      .eq('course_id', courseId)
      .gte('starts_at', windowStartIso)
      .lt('starts_at', windowEndIso);

    if (allSlotsError) return res.status(500).json({ error: allSlotsError.message });

    const slotIdByStartIso = new Map<string, any>();
    const slotIds: string[] = [];
    for (const s of allSlots ?? []) {
      const iso = String((s as any).starts_at);
      slotIdByStartIso.set(iso, s);
      if ((s as any).id) slotIds.push((s as any).id);
    }

    const bookedIds = new Set<string>();
    if (slotIds.length) {
      const { data: bookingsRows, error: bookingsError } = await supabase
        .from('bookings')
        .select('time_slot_id')
        .eq('center_id', centerId)
        .eq('status', 'confirmed')
        .in('time_slot_id', slotIds);

      if (bookingsError) return res.status(500).json({ error: bookingsError.message });
      for (const b of bookingsRows ?? []) {
        if ((b as any).time_slot_id) bookedIds.add(String((b as any).time_slot_id));
      }
    }

    const outDays = days.map((day) => {
      const outSlots = day.slots.map((s) => {
        const row = slotIdByStartIso.get(s.startIso);
        const id = row?.id ? String(row.id) : null;
        return {
          id,
          start: s.start,
          end: s.end,
          startsAt: s.startIso,
          endsAt: s.endIso,
          booked: id ? bookedIds.has(id) : false,
        };
      });
      return { date: day.date, slots: outSlots };
    });

    return res.json({
      course: { id: course.id, name: course.name, price: course.price },
      intervalMinutes,
      days: outDays,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message ?? 'Internal Server Error' });
  }
};

