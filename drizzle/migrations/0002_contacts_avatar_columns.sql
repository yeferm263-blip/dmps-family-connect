ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS avatar_scale numeric DEFAULT 1,
  ADD COLUMN IF NOT EXISTS avatar_x numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avatar_y numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avatar_rotate numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS verification_status text,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz;