import { supabase } from '../db/supabase.js';

export type CreateCenterInput = {
  center: {
    name: string;
    address?: string | null;
    phone?: string | null;
    description?: string | null;
    logoDataUrl?: string | null;
  };
  owner: {
    fullName?: string | null;
    email: string;
    password: string;
  };
  services: Array<{
    categoryName: string;
    courseName: string;
    bookingType: 'group' | 'individual';
    price: number;
    groupCapacity?: number | null;
    description?: string | null;
    teacherName?: string | null;
  }>;
  schedule?: {
    workStart?: string | null; // "09:00"
    workEnd?: string | null; // "18:00"
    consultationIntervalMinutes?: number | null;
    consultationPrice?: number | null;
    defaultGroupLimit?: number | null;
    bookingWindowWeeks?: number | null;
  } | null;
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function ensureUniqueSlug(baseSlug: string) {
  let slug = baseSlug;
  let attempt = 1;


  while (true) {
    const { data, error } = await supabase
      .from('centers')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    if (!data) return slug;

    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }
}

export const createCenter = async (input: CreateCenterInput) => {
  const baseSlug = slugify(input.center.name);
  const slug = await ensureUniqueSlug(baseSlug);

  let centerId: string | null = null;
  let authUserId: string | null = null;

  try {
    const centerInsertBase = {
      name: input.center.name,
      slug,
      address: input.center.address ?? null,
      phone: input.center.phone ?? null,
      description: input.center.description ?? null,
      logo_url: input.center.logoDataUrl ?? null,
    };

    const tryInsertCenter = async (withScheduleSettings: boolean) => {
      const payload = withScheduleSettings
        ? { ...centerInsertBase, schedule_settings: input.schedule ?? {} }
        : centerInsertBase;

      return supabase.from('centers').insert(payload).select().single();
    };

    let center: any;
    let centerError: any;

    ({ data: center, error: centerError } = await tryInsertCenter(true));

    if (centerError) {
      const message = String(centerError?.message ?? '');
      const isMissingScheduleSettingsColumn =
        message.includes('schedule_settings') &&
        (message.includes('schema cache') || message.includes('column'));

      if (isMissingScheduleSettingsColumn) {
        ({ data: center, error: centerError } = await tryInsertCenter(false));
      }
    }

    if (centerError) throw centerError;
    centerId = center.id;

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: input.owner.email,
      password: input.owner.password,
      email_confirm: true,
      user_metadata: {
        full_name: input.owner.fullName ?? null,
      },
    });

    if (authError) throw authError;
    authUserId = authData.user?.id ?? null;
    if (!authUserId) throw new Error('Failed to create auth user');

    const { data: userRow, error: userError } = await supabase
      .from('users')
      .insert({
        center_id: centerId,
        auth_id: authUserId,
        email: input.owner.email,
        full_name: input.owner.fullName ?? null,
        role: 'admin',
      })
      .select()
      .single();

    if (userError) {
      const message = String(userError?.message ?? '');
      if (message.includes('permission denied') && message.includes('users')) {
        throw new Error(
          "Supabase DB permissions error: service role cannot write to table 'users'. Grant privileges to role 'service_role' (or run the schema/grants SQL) and retry."
        );
      }
      throw userError;
    }

    const createdCourses: any[] = [];

    for (const svc of input.services) {
      const { data: existingCategory, error: catLookupError } = await supabase
        .from('categories')
        .select('id')
        .eq('center_id', centerId)
        .eq('name', svc.categoryName)
        .maybeSingle();

      if (catLookupError) throw catLookupError;

      let categoryId: string;
      if (!existingCategory) {
        const { data: newCategory, error: catCreateError } = await supabase
          .from('categories')
          .insert({ center_id: centerId, name: svc.categoryName })
          .select()
          .single();

        if (catCreateError) throw catCreateError;
        categoryId = newCategory.id;
      } else {
        categoryId = existingCategory.id;
      }

      const defaultCapacity = input.schedule?.defaultGroupLimit ?? null;
      const groupCapacity =
        svc.bookingType === 'group' ? (svc.groupCapacity ?? defaultCapacity ?? 10) : null;

      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
          center_id: centerId,
          category_id: categoryId,
          name: svc.courseName,
          description: svc.description ?? null,
          price: svc.price,
          booking_type: svc.bookingType,
          group_capacity: groupCapacity,
          teacher_name: svc.teacherName ?? null,
        })
        .select()
        .single();

      if (courseError) throw courseError;
      createdCourses.push(course);
    }

    return { center, admin: userRow, courses: createdCourses };
  } catch (error) {
    // best-effort rollback
    try {
      if (authUserId) {
        await supabase.auth.admin.deleteUser(authUserId);
      }
    } catch {
      // ignore
    }

    try {
      if (centerId) {
        await supabase.from('centers').delete().eq('id', centerId);
      }
    } catch {
      // ignore
    }

    throw error;
  }
};
