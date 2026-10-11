ALTER TABLE public.student_programs
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS official_url text,
  ADD COLUMN IF NOT EXISTS extra_links text,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;
ALTER TABLE public.student_programs ALTER COLUMN name_es DROP NOT NULL;
ALTER TABLE public.student_programs ALTER COLUMN slug SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.student_programs ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS registration_info text,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS school_level text,
  ADD COLUMN IF NOT EXISTS schedule text,
  ADD COLUMN IF NOT EXISTS requirements text;