
ALTER TABLE public.answers
  ADD COLUMN IF NOT EXISTS letter text;
