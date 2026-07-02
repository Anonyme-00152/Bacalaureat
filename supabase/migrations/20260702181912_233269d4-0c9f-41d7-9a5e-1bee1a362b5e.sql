
ALTER TABLE public.answers
  ADD COLUMN IF NOT EXISTS round_number integer NOT NULL DEFAULT 1;

ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS current_round integer NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS answers_room_round_idx
  ON public.answers (room_id, round_number);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'answers_room_player_round_unique'
  ) THEN
    ALTER TABLE public.answers
      ADD CONSTRAINT answers_room_player_round_unique
      UNIQUE (room_id, player_id, round_number);
  END IF;
END $$;
