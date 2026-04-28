-- ============================================================
-- SmartBook — Clean Production Schema (Supabase / PostgreSQL)
-- Multi-tenant SaaS for educational centers
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. CENTERS (tenant root)
-- ============================================================
CREATE TABLE centers (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  address    TEXT,
  phone      TEXT,
  description TEXT,
  logo_url   TEXT,
  schedule_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. USERS (admin / staff)
-- ============================================================
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id     UUID UNIQUE, -- Supabase auth UID
  center_id   UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  role        TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (center_id, email)
);

CREATE INDEX idx_users_center ON users(center_id);

-- ============================================================
-- 3. CATEGORIES
-- ============================================================
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  center_id   UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (center_id, name),
  UNIQUE (center_id, id)
);

CREATE INDEX idx_categories_center ON categories(center_id);

-- ============================================================
-- 4. COURSES
-- ============================================================
CREATE TABLE courses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  center_id       UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
  category_id     UUID NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  teacher_name    TEXT,
  price           INT NOT NULL,
  booking_type    TEXT NOT NULL CHECK (booking_type IN ('group', 'individual')),
  group_capacity  INT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- consistency: category must belong to same center
  CONSTRAINT fk_course_category
  FOREIGN KEY (center_id, category_id)
  REFERENCES categories(center_id, id)
  ON DELETE RESTRICT,

  -- enforce capacity logic
  CHECK (
    (booking_type = 'group' AND group_capacity IS NOT NULL AND group_capacity > 0)
    OR
    (booking_type = 'individual' AND group_capacity IS NULL)
  )

  UNIQUE (center_id, id)
);

CREATE INDEX idx_courses_center ON courses(center_id);

-- ============================================================
-- 5. TIME SLOTS (only for individual courses)
-- ============================================================
CREATE TABLE time_slots (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  center_id   UUID NOT NULL,
  course_id   UUID NOT NULL,
  starts_at   TIMESTAMPTZ NOT NULL,
  ends_at     TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CHECK (ends_at > starts_at),

  CONSTRAINT fk_slot_course
  FOREIGN KEY (center_id, course_id)
  REFERENCES courses(center_id, id)
  ON DELETE CASCADE

  UNIQUE (center_id, id)
);

CREATE INDEX idx_time_slots_center ON time_slots(center_id);
CREATE INDEX idx_time_slots_course ON time_slots(course_id);

-- prevent overlapping slots per course
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE time_slots
ADD CONSTRAINT no_overlap_slots
EXCLUDE USING gist (
  course_id WITH =,
  tstzrange(starts_at, ends_at, '[)') WITH &&
);

-- ============================================================
-- 6. BOOKINGS
-- ============================================================
CREATE TABLE bookings (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  center_id          UUID NOT NULL,
  course_id          UUID NOT NULL,
  time_slot_id       UUID,
  student_name       TEXT NOT NULL,
  student_phone      TEXT NOT NULL,

  status             TEXT NOT NULL DEFAULT 'confirmed'
                     CHECK (status IN ('confirmed', 'cancelled')),

  attendance_status  TEXT NOT NULL DEFAULT 'pending'
                     CHECK (attendance_status IN ('pending', 'attended', 'missed')),

  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_booking_course
  FOREIGN KEY (center_id, course_id)
  REFERENCES courses(center_id, id),

  CONSTRAINT fk_booking_slot
  FOREIGN KEY (center_id, time_slot_id)
  REFERENCES time_slots(center_id, id)
);

CREATE INDEX idx_bookings_center ON bookings(center_id);
CREATE INDEX idx_bookings_course ON bookings(course_id);
CREATE INDEX idx_bookings_slot   ON bookings(time_slot_id);

-- prevent double booking of time slots
CREATE UNIQUE INDEX uniq_time_slot_booking
ON bookings(time_slot_id)
WHERE status = 'confirmed' AND time_slot_id IS NOT NULL;

-- ============================================================
-- 7. GROUP CAPACITY CONTROL (trigger)
-- ============================================================
CREATE OR REPLACE FUNCTION check_group_capacity()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_type     TEXT;
  v_capacity INT;
  v_count    INT;
BEGIN
  SELECT booking_type, group_capacity
  INTO v_type, v_capacity
  FROM courses
  WHERE id = NEW.course_id;

  IF v_type = 'group' AND NEW.status = 'confirmed' THEN
    SELECT COUNT(*) INTO v_count
    FROM bookings
    WHERE course_id = NEW.course_id
      AND status = 'confirmed'
      AND id <> NEW.id;

    IF v_count >= v_capacity THEN
      RAISE EXCEPTION 'Group capacity exceeded';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_group_capacity
BEFORE INSERT OR UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION check_group_capacity();

-- ============================================================
-- 8. WAITLIST
-- ============================================================
CREATE TABLE waitlist_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  center_id       UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
  course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_name    TEXT NOT NULL,
  student_phone   TEXT NOT NULL,
  message         TEXT,
  status          TEXT NOT NULL DEFAULT 'waiting'
                   CHECK (status IN ('waiting', 'processed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_waitlist_center ON waitlist_requests(center_id);

-- ============================================================
-- 9. RLS (Supabase)
-- ============================================================
ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses           ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots        ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist_requests ENABLE ROW LEVEL SECURITY;

-- helper function
CREATE OR REPLACE FUNCTION current_center_id()
RETURNS UUID LANGUAGE sql STABLE AS $$
  SELECT center_id FROM users WHERE auth_id = auth.uid() LIMIT 1;
$$;

-- policies

CREATE POLICY tenant_isolation_users
ON users FOR ALL
USING (center_id = current_center_id());

CREATE POLICY tenant_isolation_categories
ON categories FOR ALL
USING (center_id = current_center_id());

CREATE POLICY tenant_isolation_courses
ON courses FOR ALL
USING (center_id = current_center_id());

CREATE POLICY tenant_isolation_slots
ON time_slots FOR ALL
USING (center_id = current_center_id());

CREATE POLICY tenant_isolation_bookings
ON bookings FOR ALL
USING (center_id = current_center_id());

CREATE POLICY tenant_isolation_waitlist
ON waitlist_requests FOR ALL
USING (center_id = current_center_id());

-- public access for center lookup
ALTER TABLE centers ENABLE ROW LEVEL SECURITY;

CREATE POLICY public_read_centers
ON centers FOR SELECT
USING (true);

-- ============================================================
-- 10. PRIVILEGES (service_role)
-- ============================================================
-- If you use Supabase service role key from a backend server, ensure the DB role
-- `service_role` has privileges on your tables (otherwise you'll see:
-- "permission denied for table ...").
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO service_role;
