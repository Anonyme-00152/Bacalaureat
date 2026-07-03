ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS current_round integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS letter text;

ALTER TABLE public.answers
  ADD COLUMN IF NOT EXISTS round_number integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS letter text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'answers_room_player_round_unique'
      AND conrelid = 'public.answers'::regclass
  ) THEN
    ALTER TABLE public.answers
      ADD CONSTRAINT answers_room_player_round_unique
      UNIQUE (room_id, player_id, round_number);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_answers_room_round
  ON public.answers (room_id, round_number);

-- Assure que les réponses existantes sans lettre ne bloquent pas la contrainte NOT NULL
-- et que les parties en cours commencent à la manche 1.
UPDATE public.answers SET round_number = 1 WHERE round_number IS NULL;
UPDATE public.rooms SET current_round = 1 WHERE current_round IS NULL;