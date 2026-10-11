export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          activity_type: string | null
          contact_id: string | null
          created_at: string | null
          description: string | null
          enrollment_open: boolean | null
          forms_url: string | null
          gender: string | null
          grades: string | null
          id: string
          image_url: string | null
          location: string | null
          name: string
          official_url: string | null
          registration_info: string | null
          requirements: string | null
          schedule: string | null
          schedule_url: string | null
          school_id: string | null
          school_level: string | null
          season: string | null
          slug: string | null
          status: Database["public"]["Enums"]["content_status"] | null
          updated_at: string | null
          verified_at: string | null
        }
        Insert: {
          activity_type?: string | null
          contact_id?: string | null
          created_at?: string | null
          description?: string | null
          enrollment_open?: boolean | null
          forms_url?: string | null
          gender?: string | null
          grades?: string | null
          id: string
          image_url?: string | null
          location?: string | null
          name: string
          official_url?: string | null
          registration_info?: string | null
          requirements?: string | null
          schedule?: string | null
          schedule_url?: string | null
          school_id?: string | null
          school_level?: string | null
          season?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Update: {
          activity_type?: string | null
          contact_id?: string | null
          created_at?: string | null
          description?: string | null
          enrollment_open?: boolean | null
          forms_url?: string | null
          gender?: string | null
          grades?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          name?: string
          official_url?: string | null
          registration_info?: string | null
          requirements?: string | null
          schedule?: string | null
          schedule_url?: string | null
          school_id?: string | null
          school_level?: string | null
          season?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      activity_translations: {
        Row: {
          activity_id: string
          created_at: string | null
          description: string | null
          id: string
          language_code: string
          name: string
          updated_at: string | null
        }
        Insert: {
          activity_id: string
          created_at?: string | null
          description?: string | null
          id: string
          language_code: string
          name: string
          updated_at?: string | null
        }
        Update: {
          activity_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          language_code?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string | null
          email: string
          expires_at: string | null
          full_name: string | null
          id: string
          invited_by: string | null
          notes: string | null
          permissions: Json | null
          role: Database["public"]["Enums"]["app_role"]
          status: string | null
          token: string
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string | null
          email: string
          expires_at?: string | null
          full_name?: string | null
          id: string
          invited_by?: string | null
          notes?: string | null
          permissions?: Json | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string | null
          token: string
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string | null
          full_name?: string | null
          id?: string
          invited_by?: string | null
          notes?: string | null
          permissions?: Json | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string | null
          token?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      announcement_translations: {
        Row: {
          announcement_id: string
          created_at: string | null
          id: string
          language_code: string
          message: string
          title: string
          updated_at: string | null
        }
        Insert: {
          announcement_id: string
          created_at?: string | null
          id: string
          language_code: string
          message: string
          title: string
          updated_at?: string | null
        }
        Update: {
          announcement_id?: string
          created_at?: string | null
          id?: string
          language_code?: string
          message?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          category_ids: string[] | null
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_pinned: boolean | null
          level: Database["public"]["Enums"]["announcement_level"] | null
          link_url: string | null
          priority: string | null
          published_at: string | null
          school_id: string | null
          show_in_ticker: boolean
          show_on_home: boolean | null
          sms_sent_at: string | null
          starts_at: string | null
          status: Database["public"]["Enums"]["content_status"] | null
          updated_at: string | null
        }
        Insert: {
          category_ids?: string[] | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id: string
          is_pinned?: boolean | null
          level?: Database["public"]["Enums"]["announcement_level"] | null
          link_url?: string | null
          priority?: string | null
          published_at?: string | null
          school_id?: string | null
          show_in_ticker?: boolean
          show_on_home?: boolean | null
          sms_sent_at?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          updated_at?: string | null
        }
        Update: {
          category_ids?: string[] | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_pinned?: boolean | null
          level?: Database["public"]["Enums"]["announcement_level"] | null
          link_url?: string | null
          priority?: string | null
          published_at?: string | null
          school_id?: string | null
          show_in_ticker?: boolean
          show_on_home?: boolean | null
          sms_sent_at?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      appearance_settings: {
        Row: {
          accent_color: string | null
          application_logo_storage_path: string | null
          branding_version: string | null
          created_at: string | null
          dark_theme: Json | null
          favicon_storage_path: string | null
          favicon_url: string | null
          font_family: string | null
          footer_bg: string | null
          header_bg: string | null
          id: string
          light_theme: Json | null
          logo_alt: string | null
          logo_dark_url: string | null
          logo_height: number | null
          logo_light_url: string | null
          logo_url: string | null
          neutral_color: string | null
          previous_settings: Json | null
          primary_color: string | null
          pwa_icon_storage_path: string | null
          pwa_icon_url: string | null
          settings: Json | null
          show_wordmark: boolean | null
          site_tagline: string | null
          site_title: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          accent_color?: string | null
          application_logo_storage_path?: string | null
          branding_version?: string | null
          created_at?: string | null
          dark_theme?: Json | null
          favicon_storage_path?: string | null
          favicon_url?: string | null
          font_family?: string | null
          footer_bg?: string | null
          header_bg?: string | null
          id?: string
          light_theme?: Json | null
          logo_alt?: string | null
          logo_dark_url?: string | null
          logo_height?: number | null
          logo_light_url?: string | null
          logo_url?: string | null
          neutral_color?: string | null
          previous_settings?: Json | null
          primary_color?: string | null
          pwa_icon_storage_path?: string | null
          pwa_icon_url?: string | null
          settings?: Json | null
          show_wordmark?: boolean | null
          site_tagline?: string | null
          site_title?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          accent_color?: string | null
          application_logo_storage_path?: string | null
          branding_version?: string | null
          created_at?: string | null
          dark_theme?: Json | null
          favicon_storage_path?: string | null
          favicon_url?: string | null
          font_family?: string | null
          footer_bg?: string | null
          header_bg?: string | null
          id?: string
          light_theme?: Json | null
          logo_alt?: string | null
          logo_dark_url?: string | null
          logo_height?: number | null
          logo_light_url?: string | null
          logo_url?: string | null
          neutral_color?: string | null
          previous_settings?: Json | null
          primary_color?: string | null
          pwa_icon_storage_path?: string | null
          pwa_icon_url?: string | null
          settings?: Json | null
          show_wordmark?: boolean | null
          site_tagline?: string | null
          site_title?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      article_relations: {
        Row: {
          article_id: string
          id: string
          related_article_id: string
        }
        Insert: {
          article_id: string
          id: string
          related_article_id: string
        }
        Update: {
          article_id?: string
          id?: string
          related_article_id?: string
        }
        Relationships: []
      }
      article_tags: {
        Row: {
          article_id: string
          id: string
          tag_id: string
        }
        Insert: {
          article_id: string
          id: string
          tag_id: string
        }
        Update: {
          article_id?: string
          id?: string
          tag_id?: string
        }
        Relationships: []
      }
      article_translations: {
        Row: {
          article_id: string
          content_blocks: Json | null
          created_at: string | null
          id: string
          language_code: string
          summary: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          article_id: string
          content_blocks?: Json | null
          created_at?: string | null
          id: string
          language_code: string
          summary?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          article_id?: string
          content_blocks?: Json | null
          created_at?: string | null
          id?: string
          language_code?: string
          summary?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      articles: {
        Row: {
          admin_note: string | null
          author_id: string | null
          bottom_nav: Json | null
          card_banner_url: string | null
          card_banners: Json | null
          card_bg: string | null
          category_id: string | null
          contact_id: string | null
          content: string | null
          created_at: string | null
          ends_at: string | null
          featured_image_url: string | null
          featured_images: Json | null
          id: string
          image_alt: string | null
          is_demo: boolean | null
          is_featured: boolean | null
          last_verified_at: string | null
          official_url: string | null
          published_at: string | null
          read_time_minutes: number | null
          review_date: string | null
          scheduled_at: string | null
          school_id: string | null
          slug: string
          source_authority: string | null
          source_fetched_at: string | null
          source_id: string | null
          source_name: string | null
          source_url: string | null
          starts_at: string | null
          status: Database["public"]["Enums"]["content_status"] | null
          summary: string | null
          title: string | null
          updated_at: string | null
          verification_details: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
          view_count: number | null
        }
        Insert: {
          admin_note?: string | null
          author_id?: string | null
          bottom_nav?: Json | null
          card_banner_url?: string | null
          card_banners?: Json | null
          card_bg?: string | null
          category_id?: string | null
          contact_id?: string | null
          content?: string | null
          created_at?: string | null
          ends_at?: string | null
          featured_image_url?: string | null
          featured_images?: Json | null
          id: string
          image_alt?: string | null
          is_demo?: boolean | null
          is_featured?: boolean | null
          last_verified_at?: string | null
          official_url?: string | null
          published_at?: string | null
          read_time_minutes?: number | null
          review_date?: string | null
          scheduled_at?: string | null
          school_id?: string | null
          slug: string
          source_authority?: string | null
          source_fetched_at?: string | null
          source_id?: string | null
          source_name?: string | null
          source_url?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          summary?: string | null
          title?: string | null
          updated_at?: string | null
          verification_details?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          view_count?: number | null
        }
        Update: {
          admin_note?: string | null
          author_id?: string | null
          bottom_nav?: Json | null
          card_banner_url?: string | null
          card_banners?: Json | null
          card_bg?: string | null
          category_id?: string | null
          contact_id?: string | null
          content?: string | null
          created_at?: string | null
          ends_at?: string | null
          featured_image_url?: string | null
          featured_images?: Json | null
          id?: string
          image_alt?: string | null
          is_demo?: boolean | null
          is_featured?: boolean | null
          last_verified_at?: string | null
          official_url?: string | null
          published_at?: string | null
          read_time_minutes?: number | null
          review_date?: string | null
          scheduled_at?: string | null
          school_id?: string | null
          slug?: string
          source_authority?: string | null
          source_fetched_at?: string | null
          source_id?: string | null
          source_name?: string | null
          source_url?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          summary?: string | null
          title?: string | null
          updated_at?: string | null
          verification_details?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          change_summary: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          change_summary?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          change_summary?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      broken_link_reports: {
        Row: {
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          message: string | null
          status: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id: string
          message?: string | null
          status?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string | null
          status?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          card_banner_url: string | null
          card_bg: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_featured: boolean | null
          is_visible: boolean | null
          name: string
          school_id: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          card_banner_url?: string | null
          card_bg?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id: string
          is_featured?: boolean | null
          is_visible?: boolean | null
          name: string
          school_id?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          card_banner_url?: string | null
          card_bg?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_featured?: boolean | null
          is_visible?: boolean | null
          name?: string
          school_id?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      category_translations: {
        Row: {
          category_id: string
          created_at: string | null
          description: string | null
          id: string
          language_code: string
          name: string
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          description?: string | null
          id: string
          language_code: string
          name: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          language_code?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          address: string | null
          avatar_rotate: number | null
          avatar_scale: number | null
          avatar_url: string | null
          avatar_x: number | null
          avatar_y: number | null
          bio: string | null
          category_ids: string[] | null
          created_at: string | null
          department: string | null
          display_order: number | null
          email: string | null
          extension: string | null
          hours: string | null
          id: string
          is_emergency: boolean | null
          is_visible: boolean | null
          job_title: string | null
          languages: string[] | null
          person_name: string | null
          phone: string | null
          role_title: string | null
          school_id: string | null
          updated_at: string | null
          verification_status: string | null
          verified_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          avatar_rotate?: number | null
          avatar_scale?: number | null
          avatar_url?: string | null
          avatar_x?: number | null
          avatar_y?: number | null
          bio?: string | null
          category_ids?: string[] | null
          created_at?: string | null
          department?: string | null
          display_order?: number | null
          email?: string | null
          extension?: string | null
          hours?: string | null
          id: string
          is_emergency?: boolean | null
          is_visible?: boolean | null
          job_title?: string | null
          languages?: string[] | null
          person_name?: string | null
          phone?: string | null
          role_title?: string | null
          school_id?: string | null
          updated_at?: string | null
          verification_status?: string | null
          verified_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          avatar_rotate?: number | null
          avatar_scale?: number | null
          avatar_url?: string | null
          avatar_x?: number | null
          avatar_y?: number | null
          bio?: string | null
          category_ids?: string[] | null
          created_at?: string | null
          department?: string | null
          display_order?: number | null
          email?: string | null
          extension?: string | null
          hours?: string | null
          id?: string
          is_emergency?: boolean | null
          is_visible?: boolean | null
          job_title?: string | null
          languages?: string[] | null
          person_name?: string | null
          phone?: string | null
          role_title?: string | null
          school_id?: string | null
          updated_at?: string | null
          verification_status?: string | null
          verified_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      dart_calendar_dates: {
        Row: {
          date: string
          exception_type: number
          id: number
          service_id: string
        }
        Insert: {
          date: string
          exception_type: number
          id?: number
          service_id: string
        }
        Update: {
          date?: string
          exception_type?: number
          id?: number
          service_id?: string
        }
        Relationships: []
      }
      dart_feed_status: {
        Row: {
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          feed_key: string
          is_active: boolean | null
          last_attempt_at: string | null
          last_status: string | null
          last_success_at: string | null
          record_count: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          feed_key: string
          is_active?: boolean | null
          last_attempt_at?: string | null
          last_status?: string | null
          last_success_at?: string | null
          record_count?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          feed_key?: string
          is_active?: boolean | null
          last_attempt_at?: string | null
          last_status?: string | null
          last_success_at?: string | null
          record_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      dart_geocode_cache: {
        Row: {
          created_at: string | null
          display_name: string
          hit_count: number | null
          id: number
          latitude: number
          longitude: number
          query_key: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name: string
          hit_count?: number | null
          id?: number
          latitude: number
          longitude: number
          query_key: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string
          hit_count?: number | null
          id?: number
          latitude?: number
          longitude?: number
          query_key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      dart_routes: {
        Row: {
          continuous_drop_off: number | null
          continuous_pickup: number | null
          created_at: string | null
          is_active: boolean | null
          route_color: string | null
          route_desc: string | null
          route_id: string
          route_long_name: string | null
          route_short_name: string | null
          route_text_color: string | null
          route_type: number | null
          route_url: string | null
          updated_at: string | null
        }
        Insert: {
          continuous_drop_off?: number | null
          continuous_pickup?: number | null
          created_at?: string | null
          is_active?: boolean | null
          route_color?: string | null
          route_desc?: string | null
          route_id: string
          route_long_name?: string | null
          route_short_name?: string | null
          route_text_color?: string | null
          route_type?: number | null
          route_url?: string | null
          updated_at?: string | null
        }
        Update: {
          continuous_drop_off?: number | null
          continuous_pickup?: number | null
          created_at?: string | null
          is_active?: boolean | null
          route_color?: string | null
          route_desc?: string | null
          route_id?: string
          route_long_name?: string | null
          route_short_name?: string | null
          route_text_color?: string | null
          route_type?: number | null
          route_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      dart_service_alerts: {
        Row: {
          active_from: string | null
          active_until: string | null
          alert_id: string
          cause: string | null
          description_text: string | null
          effect: string | null
          feed_timestamp: string | null
          header_text: string | null
          informed_routes: string[] | null
          informed_stops: string[] | null
          informed_trips: string[] | null
          recorded_at: string | null
          severity_level: string | null
          url: string | null
        }
        Insert: {
          active_from?: string | null
          active_until?: string | null
          alert_id: string
          cause?: string | null
          description_text?: string | null
          effect?: string | null
          feed_timestamp?: string | null
          header_text?: string | null
          informed_routes?: string[] | null
          informed_stops?: string[] | null
          informed_trips?: string[] | null
          recorded_at?: string | null
          severity_level?: string | null
          url?: string | null
        }
        Update: {
          active_from?: string | null
          active_until?: string | null
          alert_id?: string
          cause?: string | null
          description_text?: string | null
          effect?: string | null
          feed_timestamp?: string | null
          header_text?: string | null
          informed_routes?: string[] | null
          informed_stops?: string[] | null
          informed_trips?: string[] | null
          recorded_at?: string | null
          severity_level?: string | null
          url?: string | null
        }
        Relationships: []
      }
      dart_service_calendars: {
        Row: {
          end_date: string
          friday: boolean | null
          monday: boolean | null
          saturday: boolean | null
          service_id: string
          start_date: string
          sunday: boolean | null
          thursday: boolean | null
          tuesday: boolean | null
          wednesday: boolean | null
        }
        Insert: {
          end_date: string
          friday?: boolean | null
          monday?: boolean | null
          saturday?: boolean | null
          service_id: string
          start_date: string
          sunday?: boolean | null
          thursday?: boolean | null
          tuesday?: boolean | null
          wednesday?: boolean | null
        }
        Update: {
          end_date?: string
          friday?: boolean | null
          monday?: boolean | null
          saturday?: boolean | null
          service_id?: string
          start_date?: string
          sunday?: boolean | null
          thursday?: boolean | null
          tuesday?: boolean | null
          wednesday?: boolean | null
        }
        Relationships: []
      }
      dart_shapes: {
        Row: {
          points: Json
          shape_id: string
        }
        Insert: {
          points: Json
          shape_id: string
        }
        Update: {
          points?: Json
          shape_id?: string
        }
        Relationships: []
      }
      dart_stop_times: {
        Row: {
          arrival_seconds: number | null
          departure_seconds: number | null
          drop_off_type: number | null
          id: number
          pickup_type: number | null
          shape_dist_traveled: number | null
          stop_headsign: string | null
          stop_id: string
          stop_sequence: number
          trip_id: string
        }
        Insert: {
          arrival_seconds?: number | null
          departure_seconds?: number | null
          drop_off_type?: number | null
          id?: number
          pickup_type?: number | null
          shape_dist_traveled?: number | null
          stop_headsign?: string | null
          stop_id: string
          stop_sequence: number
          trip_id: string
        }
        Update: {
          arrival_seconds?: number | null
          departure_seconds?: number | null
          drop_off_type?: number | null
          id?: number
          pickup_type?: number | null
          shape_dist_traveled?: number | null
          stop_headsign?: string | null
          stop_id?: string
          stop_sequence?: number
          trip_id?: string
        }
        Relationships: []
      }
      dart_stops: {
        Row: {
          created_at: string | null
          location_type: number | null
          parent_station: string | null
          stop_code: string | null
          stop_desc: string | null
          stop_id: string
          stop_lat: number | null
          stop_lon: number | null
          stop_name: string
          stop_url: string | null
          updated_at: string | null
          wheelchair_boarding: number | null
          zone_id: string | null
        }
        Insert: {
          created_at?: string | null
          location_type?: number | null
          parent_station?: string | null
          stop_code?: string | null
          stop_desc?: string | null
          stop_id: string
          stop_lat?: number | null
          stop_lon?: number | null
          stop_name: string
          stop_url?: string | null
          updated_at?: string | null
          wheelchair_boarding?: number | null
          zone_id?: string | null
        }
        Update: {
          created_at?: string | null
          location_type?: number | null
          parent_station?: string | null
          stop_code?: string | null
          stop_desc?: string | null
          stop_id?: string
          stop_lat?: number | null
          stop_lon?: number | null
          stop_name?: string
          stop_url?: string | null
          updated_at?: string | null
          wheelchair_boarding?: number | null
          zone_id?: string | null
        }
        Relationships: []
      }
      dart_sync_logs: {
        Row: {
          created_at: string | null
          duration_ms: number | null
          feed_key: string
          id: number
          message: string | null
          records_processed: number | null
          status: string
          triggered_by: string | null
        }
        Insert: {
          created_at?: string | null
          duration_ms?: number | null
          feed_key: string
          id?: number
          message?: string | null
          records_processed?: number | null
          status: string
          triggered_by?: string | null
        }
        Update: {
          created_at?: string | null
          duration_ms?: number | null
          feed_key?: string
          id?: number
          message?: string | null
          records_processed?: number | null
          status?: string
          triggered_by?: string | null
        }
        Relationships: []
      }
      dart_trip_updates: {
        Row: {
          arrival_time: string | null
          delay_seconds: number | null
          departure_time: string | null
          feed_timestamp: string | null
          id: number
          recorded_at: string | null
          route_id: string | null
          schedule_relationship: string | null
          stop_id: string
          stop_sequence: number | null
          trip_id: string
          vehicle_id: string | null
        }
        Insert: {
          arrival_time?: string | null
          delay_seconds?: number | null
          departure_time?: string | null
          feed_timestamp?: string | null
          id?: number
          recorded_at?: string | null
          route_id?: string | null
          schedule_relationship?: string | null
          stop_id: string
          stop_sequence?: number | null
          trip_id: string
          vehicle_id?: string | null
        }
        Update: {
          arrival_time?: string | null
          delay_seconds?: number | null
          departure_time?: string | null
          feed_timestamp?: string | null
          id?: number
          recorded_at?: string | null
          route_id?: string | null
          schedule_relationship?: string | null
          stop_id?: string
          stop_sequence?: number | null
          trip_id?: string
          vehicle_id?: string | null
        }
        Relationships: []
      }
      dart_trips: {
        Row: {
          bikes_allowed: number | null
          block_id: string | null
          direction_id: number | null
          route_id: string
          service_id: string
          shape_id: string | null
          trip_headsign: string | null
          trip_id: string
          trip_short_name: string | null
          wheelchair_accessible: number | null
        }
        Insert: {
          bikes_allowed?: number | null
          block_id?: string | null
          direction_id?: number | null
          route_id: string
          service_id: string
          shape_id?: string | null
          trip_headsign?: string | null
          trip_id: string
          trip_short_name?: string | null
          wheelchair_accessible?: number | null
        }
        Update: {
          bikes_allowed?: number | null
          block_id?: string | null
          direction_id?: number | null
          route_id?: string
          service_id?: string
          shape_id?: string | null
          trip_headsign?: string | null
          trip_id?: string
          trip_short_name?: string | null
          wheelchair_accessible?: number | null
        }
        Relationships: []
      }
      dart_vehicle_positions: {
        Row: {
          bearing: number | null
          current_status: string | null
          direction_id: number | null
          feed_timestamp: string | null
          id: number
          latitude: number | null
          longitude: number | null
          occupancy_status: string | null
          recorded_at: string | null
          route_id: string | null
          speed: number | null
          stop_id: string | null
          trip_id: string | null
          vehicle_id: string
          vehicle_label: string | null
        }
        Insert: {
          bearing?: number | null
          current_status?: string | null
          direction_id?: number | null
          feed_timestamp?: string | null
          id?: number
          latitude?: number | null
          longitude?: number | null
          occupancy_status?: string | null
          recorded_at?: string | null
          route_id?: string | null
          speed?: number | null
          stop_id?: string | null
          trip_id?: string | null
          vehicle_id: string
          vehicle_label?: string | null
        }
        Update: {
          bearing?: number | null
          current_status?: string | null
          direction_id?: number | null
          feed_timestamp?: string | null
          id?: number
          latitude?: number | null
          longitude?: number | null
          occupancy_status?: string | null
          recorded_at?: string | null
          route_id?: string | null
          speed?: number | null
          stop_id?: string | null
          trip_id?: string | null
          vehicle_id?: string
          vehicle_label?: string | null
        }
        Relationships: []
      }
      dmps_analytics_config: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          presence_timeout_seconds: number
          retention_days: number
          track_browser: boolean
          track_country: boolean
          track_device: boolean
          track_events: boolean
          track_language: boolean
          track_os: boolean
          track_page_views: boolean
          track_pwa: boolean
          track_referrer: boolean
          track_searches: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          presence_timeout_seconds?: number
          retention_days?: number
          track_browser?: boolean
          track_country?: boolean
          track_device?: boolean
          track_events?: boolean
          track_language?: boolean
          track_os?: boolean
          track_page_views?: boolean
          track_pwa?: boolean
          track_referrer?: boolean
          track_searches?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          presence_timeout_seconds?: number
          retention_days?: number
          track_browser?: boolean
          track_country?: boolean
          track_device?: boolean
          track_events?: boolean
          track_language?: boolean
          track_os?: boolean
          track_page_views?: boolean
          track_pwa?: boolean
          track_referrer?: boolean
          track_searches?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      dmps_analytics_daily: {
        Row: {
          active_users_peak: number
          created_at: string
          date: string
          events: number
          new_visitors: number
          page_views: number
          pwa_installs: number
          pwa_launches: number
          returning_visitors: number
          search_no_results: number
          searches: number
          sessions: number
          total_engagement_seconds: number
          unique_visitors: number
          updated_at: string
        }
        Insert: {
          active_users_peak?: number
          created_at?: string
          date: string
          events?: number
          new_visitors?: number
          page_views?: number
          pwa_installs?: number
          pwa_launches?: number
          returning_visitors?: number
          search_no_results?: number
          searches?: number
          sessions?: number
          total_engagement_seconds?: number
          unique_visitors?: number
          updated_at?: string
        }
        Update: {
          active_users_peak?: number
          created_at?: string
          date?: string
          events?: number
          new_visitors?: number
          page_views?: number
          pwa_installs?: number
          pwa_launches?: number
          returning_visitors?: number
          search_no_results?: number
          searches?: number
          sessions?: number
          total_engagement_seconds?: number
          unique_visitors?: number
          updated_at?: string
        }
        Relationships: []
      }
      dmps_analytics_events: {
        Row: {
          anonymous_id: string
          content_id: string | null
          content_type: string | null
          created_at: string
          event_category: string | null
          event_name: string
          id: string
          language: string | null
          metadata: Json
          path: string | null
          school_id: string | null
          session_id: string
        }
        Insert: {
          anonymous_id: string
          content_id?: string | null
          content_type?: string | null
          created_at?: string
          event_category?: string | null
          event_name: string
          id?: string
          language?: string | null
          metadata?: Json
          path?: string | null
          school_id?: string | null
          session_id: string
        }
        Update: {
          anonymous_id?: string
          content_id?: string | null
          content_type?: string | null
          created_at?: string
          event_category?: string | null
          event_name?: string
          id?: string
          language?: string | null
          metadata?: Json
          path?: string | null
          school_id?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dmps_analytics_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "dmps_analytics_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      dmps_analytics_page_views: {
        Row: {
          anonymous_id: string
          browser: string | null
          content_id: string | null
          content_type: string | null
          created_at: string
          device_type: string | null
          duration_seconds: number | null
          entered_at: string
          exited_at: string | null
          id: string
          is_pwa: boolean
          language: string | null
          operating_system: string | null
          path: string
          referrer: string | null
          school_id: string | null
          session_id: string
          title: string | null
        }
        Insert: {
          anonymous_id: string
          browser?: string | null
          content_id?: string | null
          content_type?: string | null
          created_at?: string
          device_type?: string | null
          duration_seconds?: number | null
          entered_at?: string
          exited_at?: string | null
          id?: string
          is_pwa?: boolean
          language?: string | null
          operating_system?: string | null
          path: string
          referrer?: string | null
          school_id?: string | null
          session_id: string
          title?: string | null
        }
        Update: {
          anonymous_id?: string
          browser?: string | null
          content_id?: string | null
          content_type?: string | null
          created_at?: string
          device_type?: string | null
          duration_seconds?: number | null
          entered_at?: string
          exited_at?: string | null
          id?: string
          is_pwa?: boolean
          language?: string | null
          operating_system?: string | null
          path?: string
          referrer?: string | null
          school_id?: string | null
          session_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dmps_analytics_page_views_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "dmps_analytics_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      dmps_analytics_presence: {
        Row: {
          anonymous_id: string
          created_at: string
          current_content_id: string | null
          current_content_type: string | null
          current_path: string | null
          device_type: string | null
          is_pwa: boolean
          language: string | null
          last_seen_at: string
          session_id: string
          started_at: string
          updated_at: string
        }
        Insert: {
          anonymous_id: string
          created_at?: string
          current_content_id?: string | null
          current_content_type?: string | null
          current_path?: string | null
          device_type?: string | null
          is_pwa?: boolean
          language?: string | null
          last_seen_at?: string
          session_id: string
          started_at?: string
          updated_at?: string
        }
        Update: {
          anonymous_id?: string
          created_at?: string
          current_content_id?: string | null
          current_content_type?: string | null
          current_path?: string | null
          device_type?: string | null
          is_pwa?: boolean
          language?: string | null
          last_seen_at?: string
          session_id?: string
          started_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dmps_analytics_presence_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "dmps_analytics_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      dmps_analytics_pwa: {
        Row: {
          anonymous_id: string
          browser: string | null
          created_at: string
          device_type: string | null
          event_type: string
          id: string
          operating_system: string | null
          platform: string | null
          session_id: string | null
        }
        Insert: {
          anonymous_id: string
          browser?: string | null
          created_at?: string
          device_type?: string | null
          event_type: string
          id?: string
          operating_system?: string | null
          platform?: string | null
          session_id?: string | null
        }
        Update: {
          anonymous_id?: string
          browser?: string | null
          created_at?: string
          device_type?: string | null
          event_type?: string
          id?: string
          operating_system?: string | null
          platform?: string | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dmps_analytics_pwa_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "dmps_analytics_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      dmps_analytics_searches: {
        Row: {
          anonymous_id: string
          created_at: string
          id: string
          language: string | null
          normalized_query: string
          path: string | null
          query: string
          result_count: number
          session_id: string
        }
        Insert: {
          anonymous_id: string
          created_at?: string
          id?: string
          language?: string | null
          normalized_query: string
          path?: string | null
          query: string
          result_count?: number
          session_id: string
        }
        Update: {
          anonymous_id?: string
          created_at?: string
          id?: string
          language?: string | null
          normalized_query?: string
          path?: string | null
          query?: string
          result_count?: number
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dmps_analytics_searches_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "dmps_analytics_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      dmps_analytics_sessions: {
        Row: {
          anonymous_id: string
          browser: string | null
          country: string | null
          created_at: string
          device_type: string | null
          duration_seconds: number | null
          ended_at: string | null
          event_count: number
          exit_path: string | null
          id: string
          is_pwa: boolean
          landing_path: string
          language: string | null
          last_seen_at: string
          operating_system: string | null
          page_views: number
          referrer: string | null
          started_at: string
          user_agent: string | null
        }
        Insert: {
          anonymous_id: string
          browser?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          event_count?: number
          exit_path?: string | null
          id?: string
          is_pwa?: boolean
          landing_path: string
          language?: string | null
          last_seen_at?: string
          operating_system?: string | null
          page_views?: number
          referrer?: string | null
          started_at?: string
          user_agent?: string | null
        }
        Update: {
          anonymous_id?: string
          browser?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          event_count?: number
          exit_path?: string | null
          id?: string
          is_pwa?: boolean
          landing_path?: string
          language?: string | null
          last_seen_at?: string
          operating_system?: string | null
          page_views?: number
          referrer?: string | null
          started_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      event_translations: {
        Row: {
          created_at: string | null
          description: string | null
          event_id: string
          id: string
          language_code: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_id: string
          id: string
          language_code: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_id?: string
          id?: string
          language_code?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          all_day: boolean | null
          category_id: string | null
          contact_id: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          end_time: string | null
          event_type: string | null
          id: string
          image_url: string | null
          is_cancelled: boolean | null
          is_featured: boolean | null
          location: string | null
          school_id: string | null
          start_time: string | null
          starts_at: string | null
          status: Database["public"]["Enums"]["content_status"] | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          all_day?: boolean | null
          category_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          event_type?: string | null
          id: string
          image_url?: string | null
          is_cancelled?: boolean | null
          is_featured?: boolean | null
          location?: string | null
          school_id?: string | null
          start_time?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          all_day?: boolean | null
          category_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          event_type?: string | null
          id?: string
          image_url?: string | null
          is_cancelled?: boolean | null
          is_featured?: boolean | null
          location?: string | null
          school_id?: string | null
          start_time?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      faq_translations: {
        Row: {
          answer: string
          created_at: string | null
          faq_id: string
          id: string
          language_code: string
          question: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          created_at?: string | null
          faq_id: string
          id: string
          language_code: string
          question: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          created_at?: string | null
          faq_id?: string
          id?: string
          language_code?: string
          question?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      faqs: {
        Row: {
          article_id: string | null
          category_id: string | null
          created_at: string | null
          display_order: number | null
          id: string
          school_id: string | null
          status: Database["public"]["Enums"]["content_status"] | null
          updated_at: string | null
        }
        Insert: {
          article_id?: string | null
          category_id?: string | null
          created_at?: string | null
          display_order?: number | null
          id: string
          school_id?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          updated_at?: string | null
        }
        Update: {
          article_id?: string | null
          category_id?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          school_id?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          anonymous_session_id: string | null
          article_id: string | null
          comment: string | null
          created_at: string | null
          id: string
          was_helpful: boolean
        }
        Insert: {
          anonymous_session_id?: string | null
          article_id?: string | null
          comment?: string | null
          created_at?: string | null
          id: string
          was_helpful: boolean
        }
        Update: {
          anonymous_session_id?: string | null
          article_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          was_helpful?: boolean
        }
        Relationships: []
      }
      help_settings: {
        Row: {
          created_at: string | null
          id: string
          is_public: boolean | null
          setting_key: string
          setting_value: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          is_public?: boolean | null
          setting_key: string
          setting_value?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          setting_key?: string
          setting_value?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      help_unanswered_searches: {
        Row: {
          category_id: string | null
          created_at: string | null
          first_searched_at: string | null
          id: string
          language_code: string | null
          last_searched_at: string | null
          normalized_query: string
          occurrence_count: number | null
          review_status: string | null
          sanitized_query: string
          school_id: string | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          first_searched_at?: string | null
          id: string
          language_code?: string | null
          last_searched_at?: string | null
          normalized_query: string
          occurrence_count?: number | null
          review_status?: string | null
          sanitized_query: string
          school_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          first_searched_at?: string | null
          id?: string
          language_code?: string | null
          last_searched_at?: string | null
          normalized_query?: string
          occurrence_count?: number | null
          review_status?: string | null
          sanitized_query?: string
          school_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      official_sources: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string | null
          school_id: string | null
          source_type: string | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string | null
          school_id?: string | null
          source_type?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string | null
          school_id?: string | null
          source_type?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          article_id: string | null
          category_id: string | null
          created_at: string | null
          id: string
          language_code: string | null
        }
        Insert: {
          article_id?: string | null
          category_id?: string | null
          created_at?: string | null
          id: string
          language_code?: string | null
        }
        Update: {
          article_id?: string | null
          category_id?: string | null
          created_at?: string | null
          id?: string
          language_code?: string | null
        }
        Relationships: []
      }
      podcast_analytics_events: {
        Row: {
          anonymous_id: string
          completion_percent: number
          created_at: string
          device_type: string | null
          duration_seconds: number
          episode_id: string
          event_type: string
          id: string
          is_pwa: boolean
          language: string | null
          listened_seconds: number
          playback_mode: string
          playback_rate: number
          podcast_id: string
          position_seconds: number
          session_id: string | null
        }
        Insert: {
          anonymous_id: string
          completion_percent?: number
          created_at?: string
          device_type?: string | null
          duration_seconds?: number
          episode_id: string
          event_type: string
          id?: string
          is_pwa?: boolean
          language?: string | null
          listened_seconds?: number
          playback_mode?: string
          playback_rate?: number
          podcast_id: string
          position_seconds?: number
          session_id?: string | null
        }
        Update: {
          anonymous_id?: string
          completion_percent?: number
          created_at?: string
          device_type?: string | null
          duration_seconds?: number
          episode_id?: string
          event_type?: string
          id?: string
          is_pwa?: boolean
          language?: string | null
          listened_seconds?: number
          playback_mode?: string
          playback_rate?: number
          podcast_id?: string
          position_seconds?: number
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "podcast_analytics_events_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "podcast_episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "podcast_analytics_events_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "podcast_analytics_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "dmps_analytics_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      podcast_episodes: {
        Row: {
          audio_mime_type: string | null
          audio_size_bytes: number | null
          audio_storage_path: string | null
          audio_url: string | null
          cover_storage_path: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          duration_seconds: number
          episode_number: number
          id: string
          language: string
          metadata: Json
          podcast_id: string
          published_at: string | null
          season_number: number
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          transcript_status: string
          updated_at: string
          video_mime_type: string | null
          video_size_bytes: number | null
          video_storage_path: string | null
          video_url: string | null
        }
        Insert: {
          audio_mime_type?: string | null
          audio_size_bytes?: number | null
          audio_storage_path?: string | null
          audio_url?: string | null
          cover_storage_path?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          duration_seconds?: number
          episode_number?: number
          id: string
          language?: string
          metadata?: Json
          podcast_id: string
          published_at?: string | null
          season_number?: number
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          transcript_status?: string
          updated_at?: string
          video_mime_type?: string | null
          video_size_bytes?: number | null
          video_storage_path?: string | null
          video_url?: string | null
        }
        Update: {
          audio_mime_type?: string | null
          audio_size_bytes?: number | null
          audio_storage_path?: string | null
          audio_url?: string | null
          cover_storage_path?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          duration_seconds?: number
          episode_number?: number
          id?: string
          language?: string
          metadata?: Json
          podcast_id?: string
          published_at?: string | null
          season_number?: number
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          transcript_status?: string
          updated_at?: string
          video_mime_type?: string | null
          video_size_bytes?: number | null
          video_storage_path?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "podcast_episodes_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      podcast_transcripts: {
        Row: {
          created_at: string
          episode_id: string
          full_text: string
          generated_at: string | null
          id: string
          language: string
          provider: string | null
          published_at: string | null
          reviewed_at: string | null
          segments: Json
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          episode_id: string
          full_text?: string
          generated_at?: string | null
          id: string
          language?: string
          provider?: string | null
          published_at?: string | null
          reviewed_at?: string | null
          segments?: Json
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          episode_id?: string
          full_text?: string
          generated_at?: string | null
          id?: string
          language?: string
          provider?: string | null
          published_at?: string | null
          reviewed_at?: string | null
          segments?: Json
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "podcast_transcripts_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: true
            referencedRelation: "podcast_episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      podcasts: {
        Row: {
          banner_storage_path: string | null
          banner_url: string | null
          cover_storage_path: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          language: string
          logo_storage_path: string | null
          logo_url: string | null
          metadata: Json
          name: string
          school_id: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
        }
        Insert: {
          banner_storage_path?: string | null
          banner_url?: string | null
          cover_storage_path?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id: string
          language?: string
          logo_storage_path?: string | null
          logo_url?: string | null
          metadata?: Json
          name: string
          school_id?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Update: {
          banner_storage_path?: string | null
          banner_url?: string | null
          cover_storage_path?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          language?: string
          logo_storage_path?: string | null
          logo_url?: string | null
          metadata?: Json
          name?: string
          school_id?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Relationships: []
      }
      program_schools: {
        Row: {
          id: string
          program_id: string
          school_id: string
        }
        Insert: {
          id: string
          program_id: string
          school_id: string
        }
        Update: {
          id?: string
          program_id?: string
          school_id?: string
        }
        Relationships: []
      }
      program_translations: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          language_code: string
          name: string
          program_id: string
          summary: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: string
          language_code: string
          name: string
          program_id: string
          summary?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          language_code?: string
          name?: string
          program_id?: string
          summary?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      programs: {
        Row: {
          application_process: string | null
          category_id: string | null
          contact_id: string | null
          cost: string | null
          created_at: string | null
          description: string | null
          documents: Json | null
          end_date: string | null
          enrollment_open: boolean | null
          grades: string | null
          id: string
          image_url: string | null
          is_free: boolean | null
          name: string | null
          slug: string
          start_date: string | null
          status: Database["public"]["Enums"]["content_status"] | null
          summary: string | null
          updated_at: string | null
        }
        Insert: {
          application_process?: string | null
          category_id?: string | null
          contact_id?: string | null
          cost?: string | null
          created_at?: string | null
          description?: string | null
          documents?: Json | null
          end_date?: string | null
          enrollment_open?: boolean | null
          grades?: string | null
          id: string
          image_url?: string | null
          is_free?: boolean | null
          name?: string | null
          slug: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          summary?: string | null
          updated_at?: string | null
        }
        Update: {
          application_process?: string | null
          category_id?: string | null
          contact_id?: string | null
          cost?: string | null
          created_at?: string | null
          description?: string | null
          documents?: Json | null
          end_date?: string | null
          enrollment_open?: boolean | null
          grades?: string | null
          id?: string
          image_url?: string | null
          is_free?: boolean | null
          name?: string | null
          slug?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          summary?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      resource_translations: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          language_code: string
          resource_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          language_code: string
          resource_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          language_code?: string
          resource_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_visible: boolean | null
          resource_type: string | null
          school_id: string | null
          slug: string
          status: string | null
          title: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id: string
          is_visible?: boolean | null
          resource_type?: string | null
          school_id?: string | null
          slug: string
          status?: string | null
          title: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          resource_type?: string | null
          school_id?: string | null
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      school_translations: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          language_code: string
          name: string
          school_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: string
          language_code: string
          name: string
          school_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          language_code?: string
          name?: string
          school_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      schools: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          hours: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_visible: boolean | null
          level: string | null
          name: string
          official_contact_url: string | null
          phone: string | null
          postal_code: string | null
          short_name: string | null
          slug: string
          state: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          hours?: string | null
          id: string
          image_url?: string | null
          is_active?: boolean | null
          is_visible?: boolean | null
          level?: string | null
          name: string
          official_contact_url?: string | null
          phone?: string | null
          postal_code?: string | null
          short_name?: string | null
          slug: string
          state?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          hours?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_visible?: boolean | null
          level?: string | null
          name?: string
          official_contact_url?: string | null
          phone?: string | null
          postal_code?: string | null
          short_name?: string | null
          slug?: string
          state?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      search_analytics: {
        Row: {
          anonymous_query: string
          created_at: string | null
          id: string
          language_code: string | null
          results_count: number | null
        }
        Insert: {
          anonymous_query: string
          created_at?: string | null
          id: string
          language_code?: string | null
          results_count?: number | null
        }
        Update: {
          anonymous_query?: string
          created_at?: string | null
          id?: string
          language_code?: string | null
          results_count?: number | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string | null
          district_name: string | null
          id: string | null
          key: string
          site_name: string | null
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          created_at?: string | null
          district_name?: string | null
          id?: string | null
          key: string
          site_name?: string | null
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          created_at?: string | null
          district_name?: string | null
          id?: string | null
          key?: string
          site_name?: string | null
          updated_at?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      social_media_channels: {
        Row: {
          brand_color: string | null
          created_at: string | null
          display_order: number | null
          handle: string | null
          id: string
          is_active: boolean | null
          name: string
          platform: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          brand_color?: string | null
          created_at?: string | null
          display_order?: number | null
          handle?: string | null
          id: string
          is_active?: boolean | null
          name: string
          platform: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          brand_color?: string | null
          created_at?: string | null
          display_order?: number | null
          handle?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          platform?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      social_media_posts: {
        Row: {
          author_handle: string | null
          author_name: string | null
          comments_count: number | null
          created_at: string | null
          description: string | null
          embed_url: string | null
          id: string
          is_pinned: boolean | null
          is_visible: boolean | null
          likes_count: number | null
          media_type: string | null
          platform: string
          published_at: string | null
          school_id: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          author_handle?: string | null
          author_name?: string | null
          comments_count?: number | null
          created_at?: string | null
          description?: string | null
          embed_url?: string | null
          id: string
          is_pinned?: boolean | null
          is_visible?: boolean | null
          likes_count?: number | null
          media_type?: string | null
          platform: string
          published_at?: string | null
          school_id?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          author_handle?: string | null
          author_name?: string | null
          comments_count?: number | null
          created_at?: string | null
          description?: string | null
          embed_url?: string | null
          id?: string
          is_pinned?: boolean | null
          is_visible?: boolean | null
          likes_count?: number | null
          media_type?: string | null
          platform?: string
          published_at?: string | null
          school_id?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      student_programs: {
        Row: {
          address: string | null
          audience: string | null
          audience_en: string | null
          categories: string | null
          cost: string | null
          cost_en: string | null
          created_at: string | null
          description_en: string | null
          description_es: string
          display_order: number | null
          email: string | null
          enrollment_note: string | null
          enrollment_status: string | null
          extra_links: string | null
          hours: string | null
          how_to_participate: string | null
          how_to_participate_en: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean
          is_visible: boolean
          location: string | null
          name: string | null
          name_en: string | null
          name_es: string | null
          official_url: string | null
          phone: string | null
          requirements: string | null
          requirements_en: string | null
          school_id: string
          slug: string
          updated_at: string | null
          url: string | null
          verified_at: string | null
        }
        Insert: {
          address?: string | null
          audience?: string | null
          audience_en?: string | null
          categories?: string | null
          cost?: string | null
          cost_en?: string | null
          created_at?: string | null
          description_en?: string | null
          description_es: string
          display_order?: number | null
          email?: string | null
          enrollment_note?: string | null
          enrollment_status?: string | null
          extra_links?: string | null
          hours?: string | null
          how_to_participate?: string | null
          how_to_participate_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean
          is_visible?: boolean
          location?: string | null
          name?: string | null
          name_en?: string | null
          name_es?: string | null
          official_url?: string | null
          phone?: string | null
          requirements?: string | null
          requirements_en?: string | null
          school_id?: string
          slug?: string
          updated_at?: string | null
          url?: string | null
          verified_at?: string | null
        }
        Update: {
          address?: string | null
          audience?: string | null
          audience_en?: string | null
          categories?: string | null
          cost?: string | null
          cost_en?: string | null
          created_at?: string | null
          description_en?: string | null
          description_es?: string
          display_order?: number | null
          email?: string | null
          enrollment_note?: string | null
          enrollment_status?: string | null
          extra_links?: string | null
          hours?: string | null
          how_to_participate?: string | null
          how_to_participate_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean
          is_visible?: boolean
          location?: string | null
          name?: string | null
          name_en?: string | null
          name_es?: string | null
          official_url?: string | null
          phone?: string | null
          requirements?: string | null
          requirements_en?: string | null
          school_id?: string
          slug?: string
          updated_at?: string | null
          url?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          is_visible: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id: string
          is_visible?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      update_requests: {
        Row: {
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          kind: string
          message: string
          page_url: string | null
          reporter_email: string | null
          resolution_note: string | null
          resolved_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id: string
          kind: string
          message: string
          page_url?: string | null
          reporter_email?: string | null
          resolution_note?: string | null
          resolved_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          kind?: string
          message?: string
          page_url?: string | null
          reporter_email?: string | null
          resolution_note?: string | null
          resolved_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          permissions: Json | null
          role: Database["public"]["Enums"]["app_role"]
          school_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["app_role"]
          school_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["app_role"]
          school_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_calendar: { Args: never; Returns: boolean }
      can_manage_content: { Args: never; Returns: boolean }
      can_manage_users: { Args: never; Returns: boolean }
      can_translate: { Args: never; Returns: boolean }
      dmps_analytics_ensure_session: {
        Args: {
          p_anonymous_id: string
          p_language: string
          p_path: string
          p_session_id: string
        }
        Returns: undefined
      }
      has_role: { Args: { allowed_roles: string[] }; Returns: boolean }
      heartbeat_presence: {
        Args: {
          p_anonymous_id: string
          p_current_content_id?: string
          p_current_content_type?: string
          p_current_path?: string
          p_device_type?: string
          p_is_pwa?: boolean
          p_language?: string
          p_session_id: string
        }
        Returns: boolean
      }
      is_admin:
        | { Args: never; Returns: boolean }
        | { Args: { _user_id: string }; Returns: boolean }
      record_event: {
        Args: {
          p_anonymous_id: string
          p_content_id?: string
          p_content_type?: string
          p_event_category?: string
          p_event_name: string
          p_language?: string
          p_metadata?: Json
          p_path?: string
          p_school_id?: string
          p_session_id: string
        }
        Returns: string
      }
      record_page_view: {
        Args: {
          p_anonymous_id: string
          p_browser?: string
          p_content_id?: string
          p_content_type?: string
          p_device_type?: string
          p_is_pwa?: boolean
          p_language?: string
          p_operating_system?: string
          p_path: string
          p_previous_page_view_id?: string
          p_referrer?: string
          p_school_id?: string
          p_session_id: string
          p_title?: string
        }
        Returns: string
      }
      record_pwa_event: {
        Args: {
          p_anonymous_id: string
          p_browser?: string
          p_device_type?: string
          p_event_type: string
          p_operating_system?: string
          p_platform?: string
          p_session_id?: string
        }
        Returns: string
      }
      record_search: {
        Args: {
          p_anonymous_id: string
          p_language?: string
          p_normalized_query?: string
          p_path?: string
          p_query: string
          p_result_count?: number
          p_session_id: string
        }
        Returns: string
      }
      record_session: {
        Args: {
          p_anonymous_id: string
          p_browser?: string
          p_country?: string
          p_device_type?: string
          p_is_pwa?: boolean
          p_landing_path?: string
          p_language?: string
          p_operating_system?: string
          p_referrer?: string
          p_session_id?: string
          p_user_agent?: string
        }
        Returns: string
      }
      sanitize_dmps_analytics_metadata: {
        Args: { p_metadata: Json }
        Returns: Json
      }
    }
    Enums: {
      announcement_level: "info" | "warning" | "urgent"
      app_role:
        | "super_admin"
        | "admin"
        | "content_admin"
        | "calendar_admin"
        | "editor"
        | "translator"
        | "reviewer"
      content_status: "draft" | "published" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      announcement_level: ["info", "warning", "urgent"],
      app_role: [
        "super_admin",
        "admin",
        "content_admin",
        "calendar_admin",
        "editor",
        "translator",
        "reviewer",
      ],
      content_status: ["draft", "published", "archived"],
    },
  },
} as const
