DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['dmps_analytics_config','dmps_analytics_sessions','dmps_analytics_page_views','dmps_analytics_events','dmps_analytics_presence','dmps_analytics_searches','dmps_analytics_pwa','dmps_analytics_daily'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS admin_select ON public.%I', t);
    EXECUTE format('CREATE POLICY admin_select ON public.%I FOR SELECT TO authenticated USING (public.is_admin())', t);
  END LOOP;
END $$;
DROP POLICY IF EXISTS config_admin_write ON public.dmps_analytics_config;
CREATE POLICY config_admin_write ON public.dmps_analytics_config FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['podcasts','podcast_episodes','podcast_transcripts'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS public_read ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS content_manage ON public.%I', t);
    EXECUTE format('CREATE POLICY public_read ON public.%I FOR SELECT TO anon, authenticated USING (status = ''published'')', t);
    EXECUTE format('CREATE POLICY content_manage ON public.%I FOR ALL TO authenticated USING (public.can_manage_content()) WITH CHECK (public.can_manage_content())', t);
  END LOOP;
END $$;
DROP POLICY IF EXISTS public_insert ON public.podcast_analytics_events;
DROP POLICY IF EXISTS admin_manage ON public.podcast_analytics_events;
CREATE POLICY public_insert ON public.podcast_analytics_events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY admin_manage ON public.podcast_analytics_events FOR ALL TO authenticated USING (public.can_manage_content() OR public.is_admin()) WITH CHECK (public.can_manage_content() OR public.is_admin());
