CREATE TABLE IF NOT EXISTS public.dmps_analytics_config (
  id text PRIMARY KEY DEFAULT 'default', enabled boolean NOT NULL DEFAULT true,
  retention_days integer NOT NULL DEFAULT 365, presence_timeout_seconds integer NOT NULL DEFAULT 60,
  track_page_views boolean NOT NULL DEFAULT true, track_searches boolean NOT NULL DEFAULT true,
  track_events boolean NOT NULL DEFAULT true, track_pwa boolean NOT NULL DEFAULT true,
  track_referrer boolean NOT NULL DEFAULT true, track_device boolean NOT NULL DEFAULT true,
  track_browser boolean NOT NULL DEFAULT true, track_os boolean NOT NULL DEFAULT true,
  track_language boolean NOT NULL DEFAULT true, track_country boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.dmps_analytics_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), anonymous_id uuid NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(), last_seen_at timestamptz NOT NULL DEFAULT now(), ended_at timestamptz,
  landing_path text NOT NULL, exit_path text, referrer text, user_agent text, device_type text, browser text,
  operating_system text, language text, country text, is_pwa boolean NOT NULL DEFAULT false,
  page_views integer NOT NULL DEFAULT 0, event_count integer NOT NULL DEFAULT 0, duration_seconds integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.dmps_analytics_page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), anonymous_id uuid NOT NULL,
  session_id uuid NOT NULL REFERENCES public.dmps_analytics_sessions(id) ON DELETE CASCADE,
  path text NOT NULL, title text, content_type text, content_id text, school_id text, language text,
  entered_at timestamptz NOT NULL DEFAULT now(), exited_at timestamptz, duration_seconds integer,
  referrer text, device_type text, browser text, operating_system text, is_pwa boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.dmps_analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), anonymous_id uuid NOT NULL,
  session_id uuid NOT NULL REFERENCES public.dmps_analytics_sessions(id) ON DELETE CASCADE,
  event_name text NOT NULL, event_category text, path text, content_type text, content_id text,
  school_id text, language text, metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.dmps_analytics_presence (
  anonymous_id uuid PRIMARY KEY, session_id uuid NOT NULL REFERENCES public.dmps_analytics_sessions(id) ON DELETE CASCADE,
  current_path text, current_content_type text, current_content_id text, language text, device_type text,
  is_pwa boolean NOT NULL DEFAULT false, started_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.dmps_analytics_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), anonymous_id uuid NOT NULL,
  session_id uuid NOT NULL REFERENCES public.dmps_analytics_sessions(id) ON DELETE CASCADE,
  query text NOT NULL, normalized_query text NOT NULL, result_count integer NOT NULL DEFAULT 0,
  language text, path text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.dmps_analytics_pwa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), anonymous_id uuid NOT NULL,
  session_id uuid REFERENCES public.dmps_analytics_sessions(id) ON DELETE SET NULL,
  event_type text NOT NULL, platform text, device_type text, browser text, operating_system text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.dmps_analytics_daily (
  date date PRIMARY KEY, unique_visitors integer NOT NULL DEFAULT 0, new_visitors integer NOT NULL DEFAULT 0,
  returning_visitors integer NOT NULL DEFAULT 0, sessions integer NOT NULL DEFAULT 0, page_views integer NOT NULL DEFAULT 0,
  active_users_peak integer NOT NULL DEFAULT 0, searches integer NOT NULL DEFAULT 0, search_no_results integer NOT NULL DEFAULT 0,
  pwa_installs integer NOT NULL DEFAULT 0, pwa_launches integer NOT NULL DEFAULT 0, events integer NOT NULL DEFAULT 0,
  total_engagement_seconds bigint NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dap_pv_created ON public.dmps_analytics_page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_dap_ev_created ON public.dmps_analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_dap_se_started ON public.dmps_analytics_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_dap_presence_seen ON public.dmps_analytics_presence(last_seen_at);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['dmps_analytics_config','dmps_analytics_sessions','dmps_analytics_page_views','dmps_analytics_events','dmps_analytics_presence','dmps_analytics_searches','dmps_analytics_pwa','dmps_analytics_daily'] LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS admin_select ON public.%I', t);
    EXECUTE format('CREATE POLICY admin_select ON public.%I FOR SELECT TO authenticated USING (public.is_admin())', t);
  END LOOP;
END $$;
DROP POLICY IF EXISTS config_admin_write ON public.dmps_analytics_config;
CREATE POLICY config_admin_write ON public.dmps_analytics_config FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.sanitize_dmps_analytics_metadata(p_metadata jsonb)
RETURNS jsonb LANGUAGE plpgsql IMMUTABLE SET search_path = '' AS $$
DECLARE v jsonb;
BEGIN
  IF p_metadata IS NULL OR jsonb_typeof(p_metadata) <> 'object' THEN RETURN '{}'::jsonb; END IF;
  v := p_metadata - 'email' - 'e-mail' - 'mail' - 'phone' - 'telefono' - 'tel' - 'name' - 'full_name'
    - 'first_name' - 'last_name' - 'nombre' - 'apellido' - 'address' - 'direccion' - 'password' - 'pass'
    - 'token' - 'access_token' - 'refresh_token' - 'secret' - 'cookie' - 'ip' - 'ip_address' - 'gps'
    - 'lat' - 'lng' - 'latitude' - 'longitude' - 'ssn' - 'medical' - 'financial';
  IF octet_length(v::text) > 4096 THEN RETURN jsonb_build_object('truncated', true); END IF;
  RETURN v;
END; $$;

CREATE OR REPLACE FUNCTION public.dmps_analytics_ensure_session(p_anonymous_id uuid, p_session_id uuid, p_path text, p_language text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  UPDATE public.dmps_analytics_sessions SET last_seen_at = now(), exit_path = COALESCE(p_path, exit_path),
    duration_seconds = GREATEST(0, EXTRACT(EPOCH FROM (now() - started_at))::integer)
  WHERE id = p_session_id AND anonymous_id = p_anonymous_id;
  IF NOT FOUND THEN
    INSERT INTO public.dmps_analytics_sessions (id, anonymous_id, landing_path, exit_path, language)
    VALUES (p_session_id, p_anonymous_id, COALESCE(p_path,'/'), COALESCE(p_path,'/'), p_language)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END; $$;
REVOKE ALL ON FUNCTION public.dmps_analytics_ensure_session(uuid, uuid, text, text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.record_session(
  p_anonymous_id uuid, p_landing_path text DEFAULT '/', p_referrer text DEFAULT NULL, p_user_agent text DEFAULT NULL,
  p_device_type text DEFAULT NULL, p_browser text DEFAULT NULL, p_operating_system text DEFAULT NULL,
  p_language text DEFAULT NULL, p_country text DEFAULT NULL, p_is_pwa boolean DEFAULT false, p_session_id uuid DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_id uuid; v_path text := COALESCE(NULLIF(left(btrim(p_landing_path),512),''),'/');
BEGIN
  IF p_anonymous_id IS NULL THEN RAISE EXCEPTION 'anonymous_id is required'; END IF;
  IF EXISTS (SELECT 1 FROM public.dmps_analytics_config WHERE id='default' AND NOT enabled) THEN
    RETURN COALESCE(p_session_id, gen_random_uuid());
  END IF;
  IF p_session_id IS NOT NULL THEN
    UPDATE public.dmps_analytics_sessions SET last_seen_at = now(), exit_path = v_path,
      duration_seconds = GREATEST(0, EXTRACT(EPOCH FROM (now() - started_at))::integer)
    WHERE id = p_session_id AND anonymous_id = p_anonymous_id RETURNING id INTO v_id;
    IF v_id IS NOT NULL THEN RETURN v_id; END IF;
  END IF;
  v_id := gen_random_uuid();
  INSERT INTO public.dmps_analytics_sessions (id, anonymous_id, landing_path, exit_path, referrer, user_agent,
    device_type, browser, operating_system, language, country, is_pwa, duration_seconds)
  VALUES (v_id, p_anonymous_id, v_path, v_path, left(p_referrer,512), left(p_user_agent,512), left(p_device_type,64),
    left(p_browser,64), left(p_operating_system,64), left(p_language,32), left(p_country,64), COALESCE(p_is_pwa,false), 0);
  RETURN v_id;
END; $$;

CREATE OR REPLACE FUNCTION public.heartbeat_presence(
  p_anonymous_id uuid, p_session_id uuid, p_current_path text DEFAULT NULL, p_current_content_type text DEFAULT NULL,
  p_current_content_id text DEFAULT NULL, p_language text DEFAULT NULL, p_device_type text DEFAULT NULL, p_is_pwa boolean DEFAULT false)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_path text := NULLIF(left(btrim(p_current_path),512),'');
BEGIN
  IF p_anonymous_id IS NULL OR p_session_id IS NULL THEN RAISE EXCEPTION 'anonymous_id and session_id are required'; END IF;
  IF EXISTS (SELECT 1 FROM public.dmps_analytics_config WHERE id='default' AND NOT enabled) THEN RETURN false; END IF;
  PERFORM public.dmps_analytics_ensure_session(p_anonymous_id, p_session_id, v_path, left(p_language,32));
  INSERT INTO public.dmps_analytics_presence (anonymous_id, session_id, current_path, current_content_type,
    current_content_id, language, device_type, is_pwa)
  VALUES (p_anonymous_id, p_session_id, v_path, left(p_current_content_type,64), left(p_current_content_id,128),
    left(p_language,32), left(p_device_type,64), COALESCE(p_is_pwa,false))
  ON CONFLICT (anonymous_id) DO UPDATE SET
    started_at = CASE WHEN public.dmps_analytics_presence.session_id <> EXCLUDED.session_id THEN now() ELSE public.dmps_analytics_presence.started_at END,
    session_id = EXCLUDED.session_id,
    current_path = COALESCE(EXCLUDED.current_path, public.dmps_analytics_presence.current_path),
    current_content_type = EXCLUDED.current_content_type, current_content_id = EXCLUDED.current_content_id,
    language = COALESCE(EXCLUDED.language, public.dmps_analytics_presence.language),
    device_type = COALESCE(EXCLUDED.device_type, public.dmps_analytics_presence.device_type),
    is_pwa = EXCLUDED.is_pwa, last_seen_at = now(), updated_at = now();
  RETURN true;
END; $$;

CREATE OR REPLACE FUNCTION public.record_page_view(
  p_anonymous_id uuid, p_session_id uuid, p_path text, p_title text DEFAULT NULL, p_content_type text DEFAULT NULL,
  p_content_id text DEFAULT NULL, p_school_id text DEFAULT NULL, p_language text DEFAULT NULL, p_referrer text DEFAULT NULL,
  p_device_type text DEFAULT NULL, p_browser text DEFAULT NULL, p_operating_system text DEFAULT NULL,
  p_is_pwa boolean DEFAULT false, p_previous_page_view_id uuid DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_id uuid; v_path text := NULLIF(left(btrim(p_path),512),'');
BEGIN
  IF p_anonymous_id IS NULL OR p_session_id IS NULL THEN RAISE EXCEPTION 'anonymous_id and session_id are required'; END IF;
  IF v_path IS NULL THEN RAISE EXCEPTION 'path is required'; END IF;
  IF EXISTS (SELECT 1 FROM public.dmps_analytics_config WHERE id='default' AND (NOT enabled OR NOT track_page_views)) THEN RETURN NULL; END IF;
  IF p_previous_page_view_id IS NOT NULL THEN
    UPDATE public.dmps_analytics_page_views SET exited_at = now(),
      duration_seconds = GREATEST(0, EXTRACT(EPOCH FROM (now() - entered_at))::integer)
    WHERE id = p_previous_page_view_id AND anonymous_id = p_anonymous_id AND session_id = p_session_id AND exited_at IS NULL;
  END IF;
  PERFORM public.dmps_analytics_ensure_session(p_anonymous_id, p_session_id, v_path, left(p_language,32));
  UPDATE public.dmps_analytics_sessions SET page_views = page_views + 1 WHERE id = p_session_id;
  v_id := gen_random_uuid();
  INSERT INTO public.dmps_analytics_page_views (id, anonymous_id, session_id, path, title, content_type, content_id,
    school_id, language, referrer, device_type, browser, operating_system, is_pwa)
  VALUES (v_id, p_anonymous_id, p_session_id, v_path, left(p_title,300), left(p_content_type,64), left(p_content_id,128),
    left(p_school_id,64), left(p_language,32), left(p_referrer,512), left(p_device_type,64), left(p_browser,64),
    left(p_operating_system,64), COALESCE(p_is_pwa,false));
  RETURN v_id;
END; $$;

CREATE OR REPLACE FUNCTION public.record_event(
  p_anonymous_id uuid, p_session_id uuid, p_event_name text, p_event_category text DEFAULT NULL, p_path text DEFAULT NULL,
  p_content_type text DEFAULT NULL, p_content_id text DEFAULT NULL, p_school_id text DEFAULT NULL,
  p_language text DEFAULT NULL, p_metadata jsonb DEFAULT '{}'::jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_id uuid; v_name text := NULLIF(left(btrim(p_event_name),100),''); v_meta jsonb; v_path text := NULLIF(left(btrim(p_path),512),'');
BEGIN
  IF p_anonymous_id IS NULL OR p_session_id IS NULL THEN RAISE EXCEPTION 'anonymous_id and session_id are required'; END IF;
  IF v_name IS NULL THEN RAISE EXCEPTION 'event_name must not be empty'; END IF;
  IF EXISTS (SELECT 1 FROM public.dmps_analytics_config WHERE id='default' AND (NOT enabled OR NOT track_events)) THEN RETURN NULL; END IF;
  v_meta := public.sanitize_dmps_analytics_metadata(p_metadata);
  PERFORM public.dmps_analytics_ensure_session(p_anonymous_id, p_session_id, v_path, left(p_language,32));
  UPDATE public.dmps_analytics_sessions SET event_count = event_count + 1,
    ended_at = CASE WHEN v_name = 'session_end' THEN now() ELSE ended_at END WHERE id = p_session_id;
  IF v_name = 'page_exit' AND (v_meta ? 'page_view_id') THEN
    BEGIN
      UPDATE public.dmps_analytics_page_views SET exited_at = now(),
        duration_seconds = GREATEST(0, EXTRACT(EPOCH FROM (now() - entered_at))::integer)
      WHERE id = (v_meta->>'page_view_id')::uuid AND anonymous_id = p_anonymous_id AND session_id = p_session_id AND exited_at IS NULL;
    EXCEPTION WHEN invalid_text_representation THEN NULL;
    END;
  END IF;
  v_id := gen_random_uuid();
  INSERT INTO public.dmps_analytics_events (id, anonymous_id, session_id, event_name, event_category, path,
    content_type, content_id, school_id, language, metadata)
  VALUES (v_id, p_anonymous_id, p_session_id, v_name, left(p_event_category,64), v_path, left(p_content_type,64),
    left(p_content_id,128), left(p_school_id,64), left(p_language,32), v_meta);
  RETURN v_id;
END; $$;

CREATE OR REPLACE FUNCTION public.record_search(
  p_anonymous_id uuid, p_session_id uuid, p_query text, p_normalized_query text DEFAULT NULL,
  p_result_count integer DEFAULT 0, p_language text DEFAULT NULL, p_path text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_id uuid; v_q text := NULLIF(left(btrim(p_query),200),''); v_n text;
BEGIN
  IF p_anonymous_id IS NULL OR p_session_id IS NULL THEN RAISE EXCEPTION 'anonymous_id and session_id are required'; END IF;
  IF v_q IS NULL THEN RAISE EXCEPTION 'query must not be empty'; END IF;
  IF EXISTS (SELECT 1 FROM public.dmps_analytics_config WHERE id='default' AND (NOT enabled OR NOT track_searches)) THEN RETURN NULL; END IF;
  v_q := regexp_replace(v_q, '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', '[redacted-email]', 'g');
  v_q := regexp_replace(v_q, '\m\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\M', '[redacted-phone]', 'g');
  v_n := left(lower(btrim(COALESCE(p_normalized_query, v_q))), 200);
  v_n := regexp_replace(v_n, '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', '[redacted-email]', 'g');
  v_n := regexp_replace(v_n, '\m\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\M', '[redacted-phone]', 'g');
  PERFORM public.dmps_analytics_ensure_session(p_anonymous_id, p_session_id, left(p_path,512), left(p_language,32));
  v_id := gen_random_uuid();
  INSERT INTO public.dmps_analytics_searches (id, anonymous_id, session_id, query, normalized_query, result_count, language, path)
  VALUES (v_id, p_anonymous_id, p_session_id, v_q, COALESCE(NULLIF(v_n,''), lower(v_q)), GREATEST(0, COALESCE(p_result_count,0)),
    left(p_language,32), left(p_path,512));
  RETURN v_id;
END; $$;

CREATE OR REPLACE FUNCTION public.record_pwa_event(
  p_anonymous_id uuid, p_event_type text, p_session_id uuid DEFAULT NULL, p_platform text DEFAULT NULL,
  p_device_type text DEFAULT NULL, p_browser text DEFAULT NULL, p_operating_system text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_id uuid; v_sid uuid; v_type text := NULLIF(left(btrim(p_event_type),64),'');
BEGIN
  IF p_anonymous_id IS NULL THEN RAISE EXCEPTION 'anonymous_id is required'; END IF;
  IF v_type IS NULL THEN RAISE EXCEPTION 'event_type must not be empty'; END IF;
  IF EXISTS (SELECT 1 FROM public.dmps_analytics_config WHERE id='default' AND (NOT enabled OR NOT track_pwa)) THEN RETURN NULL; END IF;
  IF p_session_id IS NOT NULL THEN
    SELECT id INTO v_sid FROM public.dmps_analytics_sessions WHERE id = p_session_id AND anonymous_id = p_anonymous_id;
  END IF;
  v_id := gen_random_uuid();
  INSERT INTO public.dmps_analytics_pwa (id, anonymous_id, session_id, event_type, platform, device_type, browser, operating_system)
  VALUES (v_id, p_anonymous_id, v_sid, v_type, left(p_platform,64), left(p_device_type,64), left(p_browser,64), left(p_operating_system,64));
  RETURN v_id;
END; $$;

REVOKE ALL ON FUNCTION public.record_session(uuid, text, text, text, text, text, text, text, text, boolean, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_session(uuid, text, text, text, text, text, text, text, text, boolean, uuid) TO anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.heartbeat_presence(uuid, uuid, text, text, text, text, text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.heartbeat_presence(uuid, uuid, text, text, text, text, text, boolean) TO anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.record_page_view(uuid, uuid, text, text, text, text, text, text, text, text, text, text, boolean, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_page_view(uuid, uuid, text, text, text, text, text, text, text, text, text, text, boolean, uuid) TO anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.record_event(uuid, uuid, text, text, text, text, text, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_event(uuid, uuid, text, text, text, text, text, text, text, jsonb) TO anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.record_search(uuid, uuid, text, text, integer, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_search(uuid, uuid, text, text, integer, text, text) TO anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.record_pwa_event(uuid, text, uuid, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_pwa_event(uuid, text, uuid, text, text, text, text) TO anon, authenticated, service_role;

CREATE TABLE IF NOT EXISTS public.podcasts (
  id text PRIMARY KEY, slug text NOT NULL UNIQUE, name text NOT NULL, description text,
  cover_url text, cover_storage_path text, banner_url text, banner_storage_path text, logo_url text, logo_storage_path text,
  language text NOT NULL DEFAULT 'es', status public.content_status NOT NULL DEFAULT 'draft', school_id text DEFAULT 'all',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.podcast_episodes (
  id text PRIMARY KEY, podcast_id text NOT NULL REFERENCES public.podcasts(id) ON DELETE CASCADE,
  slug text NOT NULL, title text NOT NULL, description text,
  episode_number integer NOT NULL DEFAULT 1, season_number integer NOT NULL DEFAULT 1, published_at timestamptz,
  duration_seconds integer NOT NULL DEFAULT 0, audio_url text, audio_storage_path text, audio_mime_type text, audio_size_bytes bigint,
  video_url text, video_storage_path text, video_mime_type text, video_size_bytes bigint, cover_url text, cover_storage_path text,
  language text NOT NULL DEFAULT 'es', status public.content_status NOT NULL DEFAULT 'draft',
  transcript_status text NOT NULL DEFAULT 'none' CHECK (transcript_status IN ('none','processing','review_ready','published','failed')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_podcast_episodes_podcast_slug UNIQUE (podcast_id, slug)
);
CREATE TABLE IF NOT EXISTS public.podcast_transcripts (
  id text PRIMARY KEY, episode_id text NOT NULL UNIQUE REFERENCES public.podcast_episodes(id) ON DELETE CASCADE,
  language text NOT NULL DEFAULT 'es', full_text text NOT NULL DEFAULT '', segments jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','processing','review_ready','published','failed')),
  provider text DEFAULT 'gemini-3.5-transcribe', generated_at timestamptz, reviewed_at timestamptz, published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.podcast_analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), anonymous_id uuid NOT NULL,
  session_id uuid REFERENCES public.dmps_analytics_sessions(id) ON DELETE SET NULL,
  podcast_id text NOT NULL REFERENCES public.podcasts(id) ON DELETE CASCADE,
  episode_id text NOT NULL REFERENCES public.podcast_episodes(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('play_start','play_progress','play_pause','play_resume','play_seek','play_complete','transcript_segment_click','speed_change')),
  position_seconds numeric NOT NULL DEFAULT 0, duration_seconds numeric NOT NULL DEFAULT 0, listened_seconds numeric NOT NULL DEFAULT 0,
  completion_percent numeric NOT NULL DEFAULT 0 CHECK (completion_percent >= 0 AND completion_percent <= 100),
  playback_rate numeric NOT NULL DEFAULT 1, device_type text, language text, is_pwa boolean NOT NULL DEFAULT false,
  playback_mode text NOT NULL DEFAULT 'audio' CHECK (playback_mode IN ('audio','video')), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_podcast ON public.podcast_episodes(podcast_id);
CREATE INDEX IF NOT EXISTS idx_podcast_analytics_episode ON public.podcast_analytics_events(episode_id, created_at DESC);

GRANT SELECT ON public.podcasts, public.podcast_episodes, public.podcast_transcripts TO anon;
GRANT INSERT ON public.podcast_analytics_events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.podcasts, public.podcast_episodes, public.podcast_transcripts, public.podcast_analytics_events TO authenticated;
GRANT ALL ON public.podcasts, public.podcast_episodes, public.podcast_transcripts, public.podcast_analytics_events TO service_role;
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcast_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcast_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcast_analytics_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS public_read ON public.podcasts;
DROP POLICY IF EXISTS content_manage ON public.podcasts;
DROP POLICY IF EXISTS public_read ON public.podcast_episodes;
DROP POLICY IF EXISTS content_manage ON public.podcast_episodes;
DROP POLICY IF EXISTS public_read ON public.podcast_transcripts;
DROP POLICY IF EXISTS content_manage ON public.podcast_transcripts;
DROP POLICY IF EXISTS public_insert ON public.podcast_analytics_events;
DROP POLICY IF EXISTS admin_manage ON public.podcast_analytics_events;
CREATE POLICY public_read ON public.podcasts FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY content_manage ON public.podcasts FOR ALL TO authenticated USING (public.can_manage_content()) WITH CHECK (public.can_manage_content());
CREATE POLICY public_read ON public.podcast_episodes FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY content_manage ON public.podcast_episodes FOR ALL TO authenticated USING (public.can_manage_content()) WITH CHECK (public.can_manage_content());
CREATE POLICY public_read ON public.podcast_transcripts FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY content_manage ON public.podcast_transcripts FOR ALL TO authenticated USING (public.can_manage_content()) WITH CHECK (public.can_manage_content());
CREATE POLICY public_insert ON public.podcast_analytics_events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY admin_manage ON public.podcast_analytics_events FOR ALL TO authenticated USING (public.can_manage_content() OR public.is_admin()) WITH CHECK (public.can_manage_content() OR public.is_admin());

ALTER TABLE public.appearance_settings ADD COLUMN IF NOT EXISTS pwa_icon_url text;
ALTER TABLE public.appearance_settings ADD COLUMN IF NOT EXISTS application_logo_storage_path text;
ALTER TABLE public.appearance_settings ADD COLUMN IF NOT EXISTS favicon_storage_path text;
ALTER TABLE public.appearance_settings ADD COLUMN IF NOT EXISTS pwa_icon_storage_path text;
ALTER TABLE public.appearance_settings ADD COLUMN IF NOT EXISTS branding_version text DEFAULT '1';

DROP POLICY IF EXISTS media_read ON storage.objects;
DROP POLICY IF EXISTS media_staff_insert ON storage.objects;
DROP POLICY IF EXISTS media_staff_update ON storage.objects;
DROP POLICY IF EXISTS media_staff_delete ON storage.objects;
CREATE POLICY media_read ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id IN ('podcast-media','branding-assets'));
CREATE POLICY media_staff_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('podcast-media','branding-assets') AND public.can_manage_content());
CREATE POLICY media_staff_update ON storage.objects FOR UPDATE TO authenticated USING (bucket_id IN ('podcast-media','branding-assets') AND public.can_manage_content());
CREATE POLICY media_staff_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id IN ('podcast-media','branding-assets') AND public.can_manage_content());

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

ALTER TABLE public.student_programs
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS official_url text,
  ADD COLUMN IF NOT EXISTS extra_links text,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;
ALTER TABLE public.student_programs ALTER COLUMN slug SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.student_programs ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS registration_info text,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS school_level text,
  ADD COLUMN IF NOT EXISTS schedule text,
  ADD COLUMN IF NOT EXISTS requirements text;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS show_in_ticker boolean NOT NULL DEFAULT false;