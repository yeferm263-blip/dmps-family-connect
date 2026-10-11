DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_status') THEN
    CREATE TYPE public.content_status AS ENUM ('draft', 'published', 'archived');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'announcement_level') THEN
    CREATE TYPE public.announcement_level AS ENUM ('info', 'warning', 'urgent');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'content_admin', 'calendar_admin', 'editor', 'translator', 'reviewer');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.schools (
  id text PRIMARY KEY, slug text NOT NULL UNIQUE, name text NOT NULL, short_name text, level text,
  address text, city text, state text, postal_code text, phone text, website_url text,
  official_contact_url text, hours text, description text, is_visible boolean DEFAULT true,
  is_active boolean DEFAULT true, display_order numeric DEFAULT 0, image_url text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.school_translations (
  id text PRIMARY KEY, school_id text NOT NULL, language_code text NOT NULL, name text NOT NULL,
  description text, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.appearance_settings (
  id text PRIMARY KEY DEFAULT 'default',
  settings jsonb DEFAULT '{}'::jsonb,
  site_title text DEFAULT 'DMPS Family Info',
  site_tagline text DEFAULT 'Portal de Información Oficial y Recursos para Familias del Distrito Escolar',
  primary_color text DEFAULT '#002D62', accent_color text DEFAULT '#C49A45', neutral_color text DEFAULT '#333333',
  font_family text DEFAULT 'DM Sans, sans-serif', header_bg text DEFAULT '#002D62', footer_bg text DEFAULT '#001A38',
  logo_url text, logo_light_url text, logo_dark_url text, favicon_url text, logo_height numeric DEFAULT 56,
  logo_alt text DEFAULT 'DMPS Connect — Des Moines Public Schools', show_wordmark boolean DEFAULT true,
  dark_theme jsonb DEFAULT '{}'::jsonb, light_theme jsonb DEFAULT '{}'::jsonb, previous_settings jsonb,
  updated_by text, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY, id text, value jsonb DEFAULT '{}'::jsonb,
  site_name text DEFAULT 'DMPS Family Info', district_name text DEFAULT 'Des Moines Public Schools',
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.categories (
  id text PRIMARY KEY, slug text NOT NULL UNIQUE, name text NOT NULL, description text,
  icon text DEFAULT 'BookOpen', display_order numeric DEFAULT 0, is_featured boolean DEFAULT false,
  is_visible boolean DEFAULT true, school_id text DEFAULT 'lincoln', card_banner_url text, card_bg text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.category_translations (
  id text PRIMARY KEY, category_id text NOT NULL, language_code text NOT NULL, name text NOT NULL,
  description text, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.articles (
  id text PRIMARY KEY, slug text NOT NULL UNIQUE, title text, summary text, content text,
  status public.content_status DEFAULT 'published', category_id text, school_id text DEFAULT 'lincoln',
  is_featured boolean DEFAULT false, verification_status text DEFAULT 'verified', verification_details text,
  verified_at timestamptz, verified_by text, author_id text, source_authority text, source_url text,
  read_time_minutes numeric DEFAULT 3, featured_image_url text, card_banner_url text, card_bg text,
  published_at timestamptz DEFAULT now(), created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  contact_id text, card_banners jsonb DEFAULT '{}'::jsonb, featured_images jsonb DEFAULT '{}'::jsonb,
  image_alt text, bottom_nav jsonb DEFAULT '{}'::jsonb, starts_at timestamptz, ends_at timestamptz,
  source_name text, official_url text, admin_note text, source_id text, review_date date,
  scheduled_at timestamptz, is_demo boolean DEFAULT false, last_verified_at timestamptz,
  source_fetched_at timestamptz, view_count integer DEFAULT 0
);
CREATE TABLE IF NOT EXISTS public.article_translations (
  id text PRIMARY KEY, article_id text NOT NULL, language_code text NOT NULL, title text NOT NULL,
  summary text, content_blocks jsonb DEFAULT '[]'::jsonb, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.tags (
  id text PRIMARY KEY, name text NOT NULL, slug text NOT NULL UNIQUE, category_id text,
  is_visible boolean DEFAULT true, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.article_tags (id text PRIMARY KEY, article_id text NOT NULL, tag_id text NOT NULL);
CREATE TABLE IF NOT EXISTS public.article_relations (id text PRIMARY KEY, article_id text NOT NULL, related_article_id text NOT NULL);
CREATE TABLE IF NOT EXISTS public.contacts (
  id text PRIMARY KEY, school_id text DEFAULT 'lincoln', person_name text, role_title text DEFAULT 'Personal de contacto',
  job_title text, department text, email text, phone text, extension text, address text, hours text,
  category_ids text[] DEFAULT '{}'::text[], languages text[] DEFAULT '{es,en}'::text[],
  is_visible boolean DEFAULT true, is_emergency boolean DEFAULT false, display_order numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.resources (
  id text PRIMARY KEY, school_id text DEFAULT 'lincoln', category_id text, title text NOT NULL, slug text NOT NULL,
  resource_type text DEFAULT 'link', url text, description text, icon text DEFAULT 'GraduationCap',
  is_visible boolean DEFAULT true, display_order numeric DEFAULT 0, status text DEFAULT 'published',
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.resource_translations (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text, resource_id text NOT NULL, language_code text NOT NULL,
  title text NOT NULL, description text, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.social_media_channels (
  id text PRIMARY KEY, platform text NOT NULL, name text NOT NULL, handle text, url text,
  is_active boolean DEFAULT true, brand_color text, display_order numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.social_media_posts (
  id text PRIMARY KEY, platform text NOT NULL, title text NOT NULL, description text, url text, embed_url text,
  media_type text DEFAULT 'video', author_name text, author_handle text, thumbnail_url text,
  school_id text DEFAULT 'all', is_pinned boolean DEFAULT false, is_visible boolean DEFAULT true,
  likes_count numeric DEFAULT 0, comments_count numeric DEFAULT 0, published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.announcements (
  id text PRIMARY KEY, school_id text, level public.announcement_level DEFAULT 'info', priority text DEFAULT 'medium',
  show_on_home boolean DEFAULT true, is_pinned boolean DEFAULT false, link_url text,
  status public.content_status DEFAULT 'published', category_ids text[] DEFAULT '{}'::text[], created_by text,
  starts_at timestamptz DEFAULT now(), expires_at timestamptz, published_at timestamptz DEFAULT now(),
  sms_sent_at timestamptz, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.announcement_translations (
  id text PRIMARY KEY, announcement_id text NOT NULL, language_code text NOT NULL, title text NOT NULL,
  message text NOT NULL, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.events (
  id text PRIMARY KEY, school_id text, title text, description text, event_type text DEFAULT 'academic',
  location text, category_id text, contact_id text, all_day boolean DEFAULT false, is_cancelled boolean DEFAULT false,
  is_featured boolean DEFAULT false, image_url text, starts_at timestamptz DEFAULT now(), start_time text,
  end_date timestamptz, end_time text, status public.content_status DEFAULT 'published',
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.event_translations (
  id text PRIMARY KEY, event_id text NOT NULL, language_code text NOT NULL, title text NOT NULL,
  description text, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.programs (
  id text PRIMARY KEY, slug text NOT NULL UNIQUE, name text, description text, summary text, category_id text,
  contact_id text, grades text, is_free boolean DEFAULT true, cost text, enrollment_open boolean DEFAULT true,
  application_process text, documents jsonb DEFAULT '[]'::jsonb, image_url text, start_date timestamptz,
  end_date timestamptz, status public.content_status DEFAULT 'published',
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.program_translations (
  id text PRIMARY KEY, program_id text NOT NULL, language_code text NOT NULL, name text NOT NULL,
  summary text, description text, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.program_schools (id text PRIMARY KEY, program_id text NOT NULL, school_id text NOT NULL);
CREATE TABLE IF NOT EXISTS public.student_programs (
  id text PRIMARY KEY, slug text NOT NULL, school_id text NOT NULL DEFAULT 'lincoln', name_es text NOT NULL, name_en text,
  description_es text NOT NULL, description_en text, categories text DEFAULT 'general', requirements text,
  requirements_en text, how_to_participate text, how_to_participate_en text, audience text, audience_en text,
  cost text, cost_en text, location text, address text, hours text, phone text, email text, url text, image_url text,
  is_active boolean DEFAULT true, display_order numeric DEFAULT 0, enrollment_status text DEFAULT 'open',
  enrollment_note text, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.activities (
  id text PRIMARY KEY, school_id text, name text NOT NULL, activity_type text DEFAULT 'athletics', description text,
  grades text, gender text, season text, location text, official_url text, forms_url text, schedule_url text,
  image_url text, contact_id text, enrollment_open boolean DEFAULT true, status public.content_status DEFAULT 'published',
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.activity_translations (
  id text PRIMARY KEY, activity_id text NOT NULL, language_code text NOT NULL, name text NOT NULL,
  description text, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.faqs (
  id text PRIMARY KEY, school_id text, category_id text, article_id text, display_order numeric DEFAULT 0,
  status public.content_status DEFAULT 'published', created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.faq_translations (
  id text PRIMARY KEY, faq_id text NOT NULL, language_code text NOT NULL, question text NOT NULL, answer text NOT NULL,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.user_roles (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text, user_id text NOT NULL, role public.app_role NOT NULL DEFAULT 'admin',
  permissions jsonb DEFAULT '{}'::jsonb, school_id text DEFAULT 'all',
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.admin_invitations (
  id text PRIMARY KEY, email text NOT NULL, role public.app_role NOT NULL DEFAULT 'editor', token text NOT NULL,
  status text DEFAULT 'pending', invited_by text, accepted_by text, full_name text, notes text,
  permissions jsonb DEFAULT '{}'::jsonb, expires_at timestamptz, accepted_at timestamptz,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id text PRIMARY KEY, user_id text, action text NOT NULL, entity_type text, entity_id text,
  change_summary text, metadata jsonb DEFAULT '{}'::jsonb, created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.broken_link_reports (
  id text PRIMARY KEY, url text NOT NULL, entity_type text, entity_id text, message text,
  status text DEFAULT 'open', created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.feedback (
  id text PRIMARY KEY, article_id text, was_helpful boolean NOT NULL, anonymous_session_id text,
  comment text, created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.help_unanswered_searches (
  id text PRIMARY KEY, normalized_query text NOT NULL, sanitized_query text NOT NULL, language_code text DEFAULT 'es',
  occurrence_count numeric DEFAULT 1, school_id text, category_id text, review_status text DEFAULT 'pending',
  first_searched_at timestamptz DEFAULT now(), last_searched_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.help_settings (
  id text PRIMARY KEY, setting_key text NOT NULL UNIQUE, setting_value text, is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.page_views (
  id text PRIMARY KEY, article_id text, category_id text, language_code text, created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.search_analytics (
  id text PRIMARY KEY, anonymous_query text NOT NULL, results_count numeric DEFAULT 0, language_code text,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.update_requests (
  id text PRIMARY KEY, kind text NOT NULL, message text NOT NULL, page_url text, entity_type text, entity_id text,
  reporter_email text, status text DEFAULT 'open', resolution_note text, resolved_by text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.official_sources (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text, name text, url text, source_type text, school_id text,
  is_active boolean DEFAULT true, metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.dart_feed_status (
  feed_key text PRIMARY KEY, is_active boolean DEFAULT true, last_status text, last_success_at timestamptz,
  last_attempt_at timestamptz, error_message text, record_count numeric, duration_ms numeric,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.dart_routes (
  route_id text PRIMARY KEY, route_short_name text, route_long_name text, route_desc text, route_type numeric,
  route_url text, route_color text, route_text_color text, continuous_pickup numeric, continuous_drop_off numeric,
  is_active boolean DEFAULT true, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.dart_stops (
  stop_id text PRIMARY KEY, stop_code text, stop_name text NOT NULL, stop_desc text, stop_lat numeric, stop_lon numeric,
  zone_id text, stop_url text, location_type numeric, parent_station text, wheelchair_boarding numeric,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.dart_trips (
  trip_id text PRIMARY KEY, route_id text NOT NULL, service_id text NOT NULL, trip_headsign text, trip_short_name text,
  direction_id numeric, block_id text, shape_id text, wheelchair_accessible numeric, bikes_allowed numeric
);
CREATE TABLE IF NOT EXISTS public.dart_stop_times (
  id bigserial PRIMARY KEY, trip_id text NOT NULL, arrival_seconds numeric, departure_seconds numeric,
  stop_id text NOT NULL, stop_sequence numeric NOT NULL, stop_headsign text, pickup_type numeric,
  drop_off_type numeric, shape_dist_traveled numeric
);
CREATE TABLE IF NOT EXISTS public.dart_shapes (shape_id text PRIMARY KEY, points jsonb NOT NULL);
CREATE TABLE IF NOT EXISTS public.dart_service_calendars (
  service_id text PRIMARY KEY, monday boolean DEFAULT false, tuesday boolean DEFAULT false, wednesday boolean DEFAULT false,
  thursday boolean DEFAULT false, friday boolean DEFAULT false, saturday boolean DEFAULT false, sunday boolean DEFAULT false,
  start_date text NOT NULL, end_date text NOT NULL
);
CREATE TABLE IF NOT EXISTS public.dart_calendar_dates (
  id bigserial PRIMARY KEY, service_id text NOT NULL, date text NOT NULL, exception_type numeric NOT NULL
);
CREATE TABLE IF NOT EXISTS public.dart_service_alerts (
  alert_id text PRIMARY KEY, cause text, effect text, header_text text, description_text text, url text,
  severity_level text, informed_routes text[] DEFAULT '{}'::text[], informed_stops text[] DEFAULT '{}'::text[],
  informed_trips text[] DEFAULT '{}'::text[], active_from timestamptz, active_until timestamptz,
  feed_timestamp timestamptz, recorded_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.dart_vehicle_positions (
  id bigserial PRIMARY KEY, vehicle_id text NOT NULL, vehicle_label text, trip_id text, route_id text,
  direction_id numeric, latitude numeric, longitude numeric, bearing numeric, speed numeric, current_status text,
  stop_id text, occupancy_status text, feed_timestamp timestamptz, recorded_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.dart_trip_updates (
  id bigserial PRIMARY KEY, trip_id text NOT NULL, route_id text, vehicle_id text, stop_sequence numeric,
  stop_id text NOT NULL, arrival_time timestamptz, departure_time timestamptz, delay_seconds numeric,
  schedule_relationship text, feed_timestamp timestamptz, recorded_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.dart_sync_logs (
  id bigserial PRIMARY KEY, feed_key text NOT NULL, status text NOT NULL, records_processed numeric DEFAULT 0,
  duration_ms numeric, message text, triggered_by text, created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.dart_geocode_cache (
  id bigserial PRIMARY KEY, query_key text NOT NULL UNIQUE, display_name text NOT NULL, latitude numeric NOT NULL,
  longitude numeric NOT NULL, hit_count numeric DEFAULT 1, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_articles_school_id ON public.articles(school_id);
CREATE INDEX IF NOT EXISTS idx_articles_category_id ON public.articles(category_id);
CREATE INDEX IF NOT EXISTS idx_article_translations_lookup ON public.article_translations(article_id, language_code);
CREATE INDEX IF NOT EXISTS idx_category_translations_lookup ON public.category_translations(category_id, language_code);
CREATE INDEX IF NOT EXISTS idx_events_school_id ON public.events(school_id);
CREATE INDEX IF NOT EXISTS idx_announcements_school_id ON public.announcements(school_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_dart_stop_times_trip ON public.dart_stop_times(trip_id);
CREATE INDEX IF NOT EXISTS idx_dart_stop_times_stop ON public.dart_stop_times(stop_id);

CREATE OR REPLACE FUNCTION public.has_role(allowed_roles text[])
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = '' STABLE AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = (auth.uid())::text AND (ur.role)::text = ANY(allowed_roles));
$$;
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = '' STABLE AS $$
  SELECT public.has_role(ARRAY['super_admin','admin']); $$;
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid) RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = '' STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id::text AND role::text IN ('super_admin','admin')); $$;
CREATE OR REPLACE FUNCTION public.can_manage_content() RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = '' STABLE AS $$
  SELECT public.has_role(ARRAY['super_admin','admin','content_admin','editor']); $$;
CREATE OR REPLACE FUNCTION public.can_translate() RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = '' STABLE AS $$
  SELECT public.has_role(ARRAY['super_admin','admin','content_admin','editor','translator']); $$;
CREATE OR REPLACE FUNCTION public.can_manage_calendar() RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = '' STABLE AS $$
  SELECT public.has_role(ARRAY['super_admin','admin','content_admin','calendar_admin','editor']); $$;
CREATE OR REPLACE FUNCTION public.can_manage_users() RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = '' STABLE AS $$
  SELECT public.has_role(ARRAY['super_admin','admin']); $$;

DO $$
DECLARE f text;
BEGIN
  FOREACH f IN ARRAY ARRAY['has_role(text[])','is_admin()','is_admin(uuid)','can_manage_content()','can_translate()','can_manage_calendar()','can_manage_users()'] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC, anon', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated, service_role', f);
  END LOOP;
END $$;

DO $$
DECLARE t text; pol record;
  all_tables text[] := ARRAY['schools','school_translations','appearance_settings','site_settings','categories','category_translations','articles','article_translations','tags','article_tags','article_relations','contacts','resources','resource_translations','social_media_channels','social_media_posts','announcements','announcement_translations','events','event_translations','programs','program_translations','program_schools','student_programs','activities','activity_translations','faqs','faq_translations','user_roles','admin_invitations','audit_logs','broken_link_reports','feedback','help_unanswered_searches','help_settings','page_views','search_analytics','update_requests','official_sources','dart_feed_status','dart_routes','dart_stops','dart_trips','dart_stop_times','dart_shapes','dart_service_calendars','dart_calendar_dates','dart_service_alerts','dart_vehicle_positions','dart_trip_updates','dart_sync_logs','dart_geocode_cache'];
  public_read text[] := ARRAY['schools','school_translations','appearance_settings','site_settings','categories','category_translations','articles','article_translations','tags','article_tags','article_relations','contacts','resources','resource_translations','social_media_channels','social_media_posts','announcements','announcement_translations','events','event_translations','programs','program_translations','program_schools','student_programs','activities','activity_translations','faqs','faq_translations','official_sources','dart_feed_status','dart_routes','dart_stops','dart_trips','dart_stop_times','dart_shapes','dart_service_calendars','dart_calendar_dates','dart_service_alerts','dart_vehicle_positions','dart_trip_updates','dart_geocode_cache'];
BEGIN
  FOR pol IN SELECT tablename, policyname FROM pg_policies WHERE schemaname='public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
  FOREACH t IN ARRAY all_tables LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
  FOREACH t IN ARRAY public_read LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon', t);
    EXECUTE format('CREATE POLICY public_read ON public.%I FOR SELECT TO anon, authenticated USING (true)', t);
  END LOOP;
  FOREACH t IN ARRAY ARRAY['articles','tags','article_tags','article_relations','categories','schools','resources','programs','program_schools','student_programs','activities','faqs','official_sources'] LOOP
    EXECUTE format('CREATE POLICY content_manage ON public.%I FOR ALL TO authenticated USING (public.can_manage_content()) WITH CHECK (public.can_manage_content())', t);
  END LOOP;
  FOREACH t IN ARRAY ARRAY['article_translations','category_translations','school_translations','resource_translations','announcement_translations','event_translations','program_translations','activity_translations','faq_translations'] LOOP
    EXECUTE format('CREATE POLICY translation_manage ON public.%I FOR ALL TO authenticated USING (public.can_translate()) WITH CHECK (public.can_translate())', t);
  END LOOP;
  FOREACH t IN ARRAY ARRAY['events','announcements'] LOOP
    EXECUTE format('CREATE POLICY calendar_manage ON public.%I FOR ALL TO authenticated USING (public.can_manage_calendar()) WITH CHECK (public.can_manage_calendar())', t);
  END LOOP;
  FOREACH t IN ARRAY ARRAY['appearance_settings','site_settings','contacts','social_media_channels','social_media_posts','dart_feed_status','dart_routes','dart_stops','dart_trips','dart_stop_times','dart_shapes','dart_service_calendars','dart_calendar_dates','dart_service_alerts','dart_vehicle_positions','dart_trip_updates','dart_geocode_cache'] LOOP
    EXECUTE format('CREATE POLICY system_manage ON public.%I FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())', t);
  END LOOP;
  FOREACH t IN ARRAY ARRAY['feedback','broken_link_reports','page_views','search_analytics','help_unanswered_searches','update_requests'] LOOP
    EXECUTE format('GRANT INSERT ON public.%I TO anon', t);
    EXECUTE format('CREATE POLICY public_insert ON public.%I FOR INSERT TO anon, authenticated WITH CHECK (true)', t);
    EXECUTE format('CREATE POLICY admin_manage ON public.%I FOR ALL TO authenticated USING (public.can_manage_content()) WITH CHECK (public.can_manage_content())', t);
  END LOOP;
END $$;

CREATE POLICY user_roles_read ON public.user_roles FOR SELECT TO authenticated USING (public.is_admin() OR user_id = (auth.uid())::text);
CREATE POLICY user_roles_insert ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY user_roles_update ON public.user_roles FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY user_roles_delete ON public.user_roles FOR DELETE TO authenticated USING (public.is_admin());
CREATE POLICY admin_invitations_all ON public.admin_invitations FOR ALL TO authenticated USING (public.can_manage_users()) WITH CHECK (public.can_manage_users());
CREATE POLICY audit_logs_read ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY audit_logs_insert ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (user_id = (auth.uid())::text AND (public.can_manage_content() OR public.can_manage_calendar() OR public.is_admin()));
GRANT SELECT ON public.help_settings TO anon;
CREATE POLICY help_settings_public_read ON public.help_settings FOR SELECT TO anon, authenticated USING (is_public = true);
CREATE POLICY help_settings_admin ON public.help_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY dart_sync_logs_admin ON public.dart_sync_logs FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

INSERT INTO public.help_settings (id, setting_key, setting_value) VALUES
  (gen_random_uuid()::text,'PUBLIC_REVIEW_ENABLED','true'),
  (gen_random_uuid()::text,'PUBLIC_REVIEW_PROVIDER','trustpilot'),
  (gen_random_uuid()::text,'PUBLIC_REVIEW_URL','https://www.trustpilot.com/evaluate/familiasdmps.app')
ON CONFLICT (setting_key) DO NOTHING;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['articles','article_translations','announcements','announcement_translations','events','event_translations','categories','category_translations','appearance_settings','site_settings','update_requests'] LOOP
    EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL', t);
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename=t) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;
