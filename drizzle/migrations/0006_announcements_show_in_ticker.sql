ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS show_in_ticker boolean NOT NULL DEFAULT false;
UPDATE public.announcements SET show_in_ticker = true WHERE show_on_home = true;