import { sendJson } from '../../../_lib/http';
import { supabaseService } from '../../../_lib/supabase';
import { resolveCenterBySlug } from '../../../_lib/center';

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
  return new Date(d.getTime() + minutes * 60_000).toISOString();
}

function minutesBetweenHHMM(a: string, b: string) {
  const [ah, am] = a.split(':').map((v) => Number.parseInt(v, 10));
  const [bh, bm] = b.split(':').map((v) => Number.parseInt(v, 10));
  return (bh * 60 + bm) - (ah * 60 + am);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const slug = String(req.query?.slug || '').trim();
    if (!slug) return sendJson(res, 400, { error: 'Missing slug' });

    const supabase = supabaseService();
    const center = await resolveCenterBySlug(slug);
    if (!center) return sendJson(res, 404, { error: 'Center not found' });

    const ss: any = (center as any).schedule_settings ?? {};
    const workStart = parseTimeHHMM(ss.workStart, '09:00');
    const workEnd = parseTimeHHMM(ss.workEnd, '18:00');
    const intervalMinutes = Math.max(15, Number.parseInt(String(ss.consultationIntervalMinutes ?? '30'), 10) || 30);
    const bookingWindowWeeks = Math.max(1, Number.parseInt(String(ss.bookingWindowWeeks ?? '4'), 10) || 4);

    const totalMinutes = minutesBetweenHHMM(workStart, workEnd);
    if (totalMinutes <= 0) return sendJson(res, 400, { error: 'Invalid working hours' });

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
      .eq('center_id', (center as any).id)
      .eq('status', 'waiting')
      .limit(2000);
    if (reqError) return sendJson(res, 500, { error: reqError.message });

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

    return sendJson(res, 200, { center: { id: (center as any).id, slug: (center as any).slug, name: (center as any).name }, intervalMinutes, days: outDays });
  } catch (e: any) {
    return sendJson(res, 500, { error: e?.message ?? 'Internal Server Error' });
  }
}

