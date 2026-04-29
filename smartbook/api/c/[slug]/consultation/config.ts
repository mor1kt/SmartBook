import { sendJson } from '../../../_lib/http.js';
import { resolveCenterBySlug } from '../../../_lib/center.js';

function parseTimeHHMM(value: any, fallback: string) {
  const raw = String(value ?? '').trim();
  if (!/^\d{2}:\d{2}$/.test(raw)) return fallback;
  return raw;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const slug = String(req.query?.slug || '').trim();
    if (!slug) return sendJson(res, 400, { error: 'Missing slug' });

    const center = await resolveCenterBySlug(slug);
    if (!center) return sendJson(res, 404, { error: 'Center not found' });

    const ss: any = (center as any).schedule_settings ?? {};
    const workStart = parseTimeHHMM(ss.workStart, '09:00');
    const workEnd = parseTimeHHMM(ss.workEnd, '18:00');
    const intervalMinutes = Math.max(
      15,
      Number.parseInt(String(ss.consultationIntervalMinutes ?? '30'), 10) || 30,
    );
    const consultationPrice = Math.max(
      0,
      Number.parseInt(String(ss.consultationPrice ?? '0'), 10) || 0,
    );
    const bookingWindowWeeks = Math.max(
      1,
      Number.parseInt(String(ss.bookingWindowWeeks ?? '4'), 10) || 4,
    );

    return sendJson(res, 200, {
      center: { id: (center as any).id, slug: (center as any).slug, name: (center as any).name },
      scheduleSettings: {
        workStart,
        workEnd,
        intervalMinutes,
        consultationPrice,
        bookingWindowWeeks,
      },
    });
  } catch (e: any) {
    return sendJson(res, 500, { error: e?.message ?? 'Internal Server Error' });
  }
}
