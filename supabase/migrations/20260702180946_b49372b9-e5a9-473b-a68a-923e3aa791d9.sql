CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  host_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  letter TEXT,
  categories TEXT[] NOT NULL DEFAULT ARRAY['Prénom','Pays','Ville','Animal','Métier','Objet','Plante','Marque']::text[],
  duration INTEGER NOT NULL DEFAULT 90,
  started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms TO anon, authenticated;
GRANT ALL ON public.rooms TO service_role;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public rooms access" ON public.rooms FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  name TEXT NOT NULL,
  is_host BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (room_id, player_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.players TO anon, authenticated;
GRANT ALL ON public.players TO service_role;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public players access" ON public.players FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  name TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (room_id, player_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.answers TO anon, authenticated;
GRANT ALL ON public.answers TO service_role;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public answers access" ON public.answers FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.rooms REPLICA IDENTITY FULL;
ALTER TABLE public.players REPLICA IDENTITY FULL;
ALTER TABLE public.answers REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.answers;