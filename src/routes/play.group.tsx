import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Users,
  Crown,
  LogIn,
  Sparkles,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getPlayerId, getPlayerName, setPlayerName } from "@/lib/player-identity";

export const Route = createFileRoute("/play/group")({
  head: () => ({
    meta: [
      { title: "Salon multijoueur — Le Jeu du Baccalauréat" },
      {
        name: "description",
        content:
          "Créez une salle multijoueur ou rejoignez vos amis avec un code pour une partie du Baccalauréat.",
      },
    ],
  }),
  component: GroupPlayPage,
});

const generateRoomCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

const savePlayerInRoom = async ({
  roomId,
  playerId,
  name,
  isHost,
}: {
  roomId: string;
  playerId: string;
  name: string;
  isHost: boolean;
}) => {
  const { error: updateError } = await supabase
    .from("players")
    .update({ name, is_host: isHost })
    .eq("room_id", roomId)
    .eq("player_id", playerId);

  if (updateError) throw updateError;

  const { data: existing, error: readError } = await supabase
    .from("players")
    .select("id")
    .eq("room_id", roomId)
    .eq("player_id", playerId)
    .maybeSingle();

  if (readError) throw readError;
  if (existing) return;

  const { error: insertError } = await supabase.from("players").insert({
    room_id: roomId,
    player_id: playerId,
    name,
    is_host: isHost,
  });

  if (insertError) throw insertError;
};

function GroupPlayPage() {
  const navigate = useNavigate();
  const [name, setName] = useState<string>(() => (typeof window !== "undefined" ? getPlayerName() : ""));
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState<"create" | "join" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ensureName = () => {
    const n = name.trim();
    if (!n) {
      setError("Entrez votre pseudo pour continuer.");
      return null;
    }
    setPlayerName(n);
    return n;
  };

  const handleCreate = async () => {
    setError(null);
    const playerName = ensureName();
    if (!playerName) return;
    setBusy("create");
    try {
      const playerId = getPlayerId();
      // Try a few times in case of code collision
      let created: { code: string; id: string } | null = null;
      for (let i = 0; i < 5 && !created; i++) {
        const code = generateRoomCode();
        const { data, error: err } = await supabase
          .from("rooms")
          .insert({ code, host_id: playerId, status: "waiting" })
          .select("id, code")
          .single();
        if (!err && data) created = data as { code: string; id: string };
      }
      if (!created) throw new Error("Impossible de créer la salle. Réessayez.");

      await savePlayerInRoom({
        roomId: created.id,
        playerId,
        name: playerName,
        isHost: true,
      });

      navigate({ to: "/play/room/$code", params: { code: created.code } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue.");
      setBusy(null);
    }
  };

  const handleJoin = async () => {
    setError(null);
    const playerName = ensureName();
    if (!playerName) return;
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 4) {
      setError("Le code doit contenir 4 lettres.");
      return;
    }
    setBusy("join");
    try {
      const { data: room, error: rErr } = await supabase
        .from("rooms")
        .select("id, code, status")
        .eq("code", code)
        .maybeSingle();
      if (rErr) throw rErr;
      if (!room) throw new Error("Aucune salle trouvée avec ce code.");
      if (room.status === "ended") throw new Error("Cette partie est terminée.");

      const playerId = getPlayerId();
      await savePlayerInRoom({
        roomId: room.id,
        playerId,
        name: playerName,
        isHost: false,
      });

      navigate({ to: "/play/room/$code", params: { code: room.code } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue.");
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8 md:py-12">
      <Link
        to="/play"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Retour à la sélection
      </Link>

      <div className="mt-8 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" /> Le Jeu du Baccalauréat
        </div>
        <div className="mt-6 grid h-20 w-20 place-items-center rounded-2xl bg-secondary text-secondary-foreground md:h-24 md:w-24">
          <Users className="h-10 w-10 md:h-12 md:w-12" />
        </div>
        <h1 className="mt-6 font-display text-3xl tracking-tight md:text-5xl">
          Salon multijoueur
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground md:text-base">
          Créez une partie, partagez le code avec vos amis, ou rejoignez une
          salle existante pour jouer ensemble en temps réel.
        </p>
      </div>

      {/* Pseudo */}
      <div className="mx-auto mt-8 w-full max-w-md">
        <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
          Votre pseudo
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          placeholder="Ex : Alex"
          maxLength={20}
          className="w-full rounded-xl border border-hairline bg-surface-elevated px-4 py-3 text-center text-base text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Créer */}
        <section className="flex flex-col rounded-2xl border border-hairline bg-surface p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand text-brand-foreground">
              <Crown className="h-5 w-5" />
            </div>
            <div className="min-w-0 text-left">
              <h2 className="font-display text-xl leading-tight md:text-2xl">
                Créer une partie
              </h2>
              <p className="text-xs text-muted-foreground md:text-sm">
                Vous serez l'hôte de la salle.
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Un code à 4 lettres sera généré. Partagez-le à vos amis pour qu'ils
            vous rejoignent instantanément.
          </p>
          <button
            onClick={handleCreate}
            disabled={busy !== null}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground transition hover:bg-brand/90 disabled:opacity-60"
          >
            {busy === "create" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {busy === "create" ? "Création..." : "Créer une salle"}
          </button>
        </section>

        {/* Rejoindre */}
        <section className="flex flex-col rounded-2xl border border-hairline bg-surface p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
              <LogIn className="h-5 w-5" />
            </div>
            <div className="min-w-0 text-left">
              <h2 className="font-display text-xl leading-tight md:text-2xl">
                Rejoindre vos amis
              </h2>
              <p className="text-xs text-muted-foreground md:text-sm">
                Saisissez le code reçu de l'hôte.
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Demandez le code à la personne qui a créé la partie et entrez-le
            ci-dessous.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => {
                setJoinCode(e.target.value.toUpperCase().slice(0, 4));
                setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              placeholder="ABCD"
              maxLength={4}
              className="w-full rounded-xl border border-hairline bg-surface-elevated px-4 py-3 text-center font-mono text-2xl tracking-[0.5em] text-foreground placeholder:text-muted-foreground/40 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              onClick={handleJoin}
              disabled={busy !== null}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-60"
            >
              {busy === "join" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {busy === "join" ? "Connexion..." : "Rejoindre"}
            </button>
          </div>
        </section>
      </div>

      {error && (
        <p className="mx-auto mt-6 max-w-md text-center text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
