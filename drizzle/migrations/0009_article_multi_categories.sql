ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS category_ids text[] NOT NULL DEFAULT '{}'::text[];
UPDATE public.articles SET category_ids = ARRAY[category_id] WHERE category_id IS NOT NULL AND (category_ids IS NULL OR cardinality(category_ids) = 0);
CREATE INDEX IF NOT EXISTS articles_category_ids_gin ON public.articles USING gin (category_ids);