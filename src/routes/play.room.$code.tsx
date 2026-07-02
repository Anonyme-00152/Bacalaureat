import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Crown,
  Copy,
  Check,
  Play,
  Flag,
  Timer,
  Users,
  Loader2,
  Trophy,
  RotateCcw,
  LogOut,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getPlayerId, getPlayerName } from "@/lib/player-identity";

export const Route = createFileRoute("/play/room/$code")({
  head: ({ params }) => ({
    meta: [
      { title: `Salle ${params.code} — Le Jeu du Baccalauréat` },
      { name: "description", content: "Partie multijoueur en temps réel." },
    ],
  }),
  component: RoomPage,
});

const ALLOWED_LETTERS = "ABCDEFGHIJKLMNOPRSTUVWXYZ".split("");
const SUGGESTED_CATEGORIES = [
  "Prénom", "Animal", "Ville ou Pays", "Métier", "Objet",
  "Plat", "Marque", "Sport", "Film", "Couleur", "Fruit ou Légume", "Instrument",
];
const DURATION_OPTIONS = [30, 60, 90, 120, 180];

type Room = {
  id: string;
  code: string;
  host_id: string;
  status: "waiting" | "playing" | "ended";
  letter: string | null;
  categories: string[];
  duration: number;
  started_at: string | null;
  current_round: number;
};

type Player = {
  id: string;
  room_id: string;
  player_id: string;
  name: string;
  is_host: boolean;
};

type AnswerRow = {
  player_id: string;
  name: string;
  answers: Record<string, string>;
  round_number: number;
  letter: string | null;
};

function RoomPage() {
  const { code } = Route.useParams();
  const navigate = useNavigate();

  const [playerId] = useState(() => (typeof window !== "undefined" ? getPlayerId() : ""));
  const [playerName] = useState(() => (typeof window !== "undefined" ? getPlayerName() : ""));

  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [answersList, setAnswersList] = useState<AnswerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [myAnswers, setMyAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const submittedRef = useRef(false);

  const isHost = room && room.host_id === playerId;
  const [letterPool, setLetterPool] = useState<string[]>(ALLOWED_LETTERS);
  const [savingConfig, setSavingConfig] = useState(false);

  const currentRound = room?.current_round ?? 1;
  const categories = room?.categories ?? [];

  // Answers of the current round only (clean recap)
  const currentRoundAnswers = useMemo(
    () => answersList.filter((a) => a.round_number === currentRound),
    [answersList, currentRound],
  );

  // Cumulative scores across all rounds played in this room
  const cumulativeScores = useMemo(() => {
    const scores = new Map<string, { name: string; total: number; rounds: number }>();
    for (const a of answersList) {
      const letter = (a.letter ?? "").toUpperCase();
      if (!letter) continue;
      const valid = categories.filter((c) =>
        (a.answers[c] ?? "").trim().toUpperCase().startsWith(letter),
      ).length;
      const prev = scores.get(a.player_id);
      scores.set(a.player_id, {
        name: a.name,
        total: (prev?.total ?? 0) + valid,
        rounds: (prev?.rounds ?? 0) + 1,
      });
    }
    return Array.from(scores.entries())
      .map(([player_id, v]) => ({ player_id, ...v }))
      .sort((a, b) => b.total - a.total);
  }, [answersList, categories]);

  // If no pseudo, send back to lobby
  useEffect(() => {
    if (!playerName) navigate({ to: "/play/group" });
  }, [playerName, navigate]);

  // Initial fetch + realtime subscription
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data: r } = await supabase
        .from("rooms")
        .select("*")
        .eq("code", code)
        .maybeSingle();
      if (cancelled) return;
      if (!r) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setRoom(r as Room);
      const [{ data: pl }, { data: an }] = await Promise.all([
        supabase.from("players").select("*").eq("room_id", r.id).order("created_at"),
        supabase.from("answers").select("player_id, name, answers, round_number, letter").eq("room_id", r.id),
      ]);
      if (cancelled) return;
      setPlayers((pl ?? []) as Player[]);
      setAnswersList((an ?? []) as AnswerRow[]);
      setLoading(false);

      const channel = supabase
        .channel(`room:${r.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "rooms", filter: `id=eq.${r.id}` },
          (payload) => {
            if (payload.eventType === "DELETE") {
              setNotFound(true);
              return;
            }
            setRoom(payload.new as Room);
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "players", filter: `room_id=eq.${r.id}` },
          async () => {
            const { data } = await supabase
              .from("players")
              .select("*")
              .eq("room_id", r.id)
              .order("created_at");
            setPlayers((data ?? []) as Player[]);
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "answers", filter: `room_id=eq.${r.id}` },
          async () => {
            const { data } = await supabase
              .from("answers")
              .select("player_id, name, answers, round_number, letter")
              .eq("room_id", r.id);
            setAnswersList((data ?? []) as AnswerRow[]);
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    const cleanupPromise = load();
    return () => {
      cancelled = true;
      cleanupPromise.then((fn) => fn && fn());
    };
  }, [code]);

  // Synced timer
  const timeLeft = useMemo(() => {
    if (!room || room.status !== "playing" || !room.started_at) return room?.duration ?? 0;
    const start = new Date(room.started_at).getTime();
    const remaining = Math.max(0, room.duration - Math.floor((now - start) / 1000));
    return remaining;
  }, [room, now]);

  useEffect(() => {
    if (room?.status !== "playing") return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [room?.status]);

  // Reset local answers whenever the current round changes or a new round starts
  useEffect(() => {
    setMyAnswers({});
    setSubmitted(false);
    submittedRef.current = false;
  }, [room?.current_round, room?.started_at]);

  const submitMyAnswers = useCallback(async () => {
    if (!room || submittedRef.current) return;
    submittedRef.current = true;
    setSubmitted(true);
    const roundNumber = room.current_round ?? 1;

    // Upsert answer for the current round (unique on room_id + player_id + round_number)
    await supabase.from("answers").upsert(
      {
        room_id: room.id,
        player_id: playerId,
        name: playerName,
        answers: myAnswers,
        round_number: roundNumber,
        letter: room.letter,
      },
      { onConflict: "room_id,player_id,round_number" },
    );
  }, [room, myAnswers, playerId, playerName]);

  // Auto-submit when timer hits 0 (and end the round for everyone if host)
  useEffect(() => {
    if (room?.status !== "playing") return;
    if (timeLeft > 0) return;
    submitMyAnswers();
    if (isHost) {
      supabase.from("rooms").update({ status: "ended" }).eq("id", room.id);
    }
  }, [timeLeft, room?.status, room?.id, isHost, submitMyAnswers]);

  const handleStart = async () => {
    if (!room || !isHost) return;
    const pool = letterPool.length > 0 ? letterPool : ALLOWED_LETTERS;
    const letter = pool[Math.floor(Math.random() * pool.length)];
    const nextRound = (room.current_round ?? 1) + (room.status === "ended" ? 1 : 0);
    // Purge any residual entries for the round we're about to play (defensive)
    await supabase
      .from("answers")
      .delete()
      .eq("room_id", room.id)
      .eq("round_number", nextRound);
    await supabase
      .from("rooms")
      .update({
        status: "playing",
        letter,
        started_at: new Date().toISOString(),
        current_round: nextRound,
      })
      .eq("id", room.id);
  };

  const updateRoomConfig = async (patch: Partial<Pick<Room, "categories" | "duration">>) => {
    if (!room || !isHost) return;
    setSavingConfig(true);
    // Optimistic update
    setRoom({ ...room, ...patch });
    await supabase.from("rooms").update(patch).eq("id", room.id);
    setSavingConfig(false);
  };

  const toggleCategory = (c: string) => {
    if (!room) return;
    const current = room.categories ?? [];
    const next = current.includes(c) ? current.filter((x) => x !== c) : [...current, c];
    updateRoomConfig({ categories: next });
  };

  const toggleLetter = (l: string) => {
    setLetterPool((prev) => (prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]));
  };


  const handleFinish = async () => {
    await submitMyAnswers();
    if (isHost && room) {
      await supabase.from("rooms").update({ status: "ended" }).eq("id", room.id);
    }
  };

  const handleReplay = async () => {
    if (!room || !isHost) return;
    // Bump the round counter; we keep past-round answers for the cumulative score
    const nextRound = (room.current_round ?? 1) + 1;
    await supabase
      .from("rooms")
      .update({
        status: "waiting",
        letter: null,
        started_at: null,
        current_round: nextRound,
      })
      .eq("id", room.id);
  };

  const handleLeave = async () => {
    if (room) {
      await supabase.from("players").delete().eq("room_id", room.id).eq("player_id", playerId);
    }
    navigate({ to: "/play/group" });
  };

  const handleCopy = async () => {
    if (!room) return;
    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound || !room) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-2xl">Salle introuvable</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette salle n'existe pas ou a été fermée.
        </p>
        <Link
          to="/play/group"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background hover:opacity-90"
        >
          <ArrowLeft className="h-4 w-4" /> Retour au salon
        </Link>
      </div>
    );
  }

  const progress = room.status === "playing" ? (timeLeft / room.duration) * 100 : 0;

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-8">
      <div className="flex items-center justify-between">
        <Link
          to="/play/group"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Salon
        </Link>
        <button
          onClick={handleLeave}
          className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-surface px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" /> Quitter
        </button>
      </div>

      {/* Header room info */}
      <div className="mt-6 flex flex-col items-center text-center">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">
          Code de la salle
        </div>
        <div className="mt-2 flex items-center gap-3">
          <span className="font-mono text-4xl font-semibold tracking-[0.4em] text-foreground md:text-5xl">
            {room.code}
          </span>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-surface px-3 py-2 text-xs font-medium hover:bg-secondary"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copié" : "Copier"}
          </button>
        </div>
      </div>

      {/* Players list */}
      <section className="mt-8 rounded-2xl border border-hairline bg-surface p-5">
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          {players.length} joueur{players.length > 1 ? "s" : ""} en ligne
        </div>
        <div className="flex flex-wrap gap-2">
          {players.map((p) => (
            <div
              key={p.id}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm ${
                p.player_id === playerId
                  ? "border-foreground/40 bg-surface-elevated text-foreground"
                  : "border-hairline bg-surface-elevated text-muted-foreground"
              }`}
            >
              {p.is_host && <Crown className="h-3.5 w-3.5 text-brand" />}
              <span>{p.name}</span>
              {p.player_id === playerId && <span className="text-xs opacity-60">(vous)</span>}
            </div>
          ))}
        </div>
      </section>

      {/* Waiting */}
      {room.status === "waiting" && (
        <section className="mt-6 rounded-2xl border border-hairline bg-surface p-6 md:p-8">
          <div className="text-center">
            <h2 className="font-display text-2xl md:text-3xl">En attente du lancement</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {isHost
                ? "Configurez la partie ci-dessous puis lancez-la quand tout le monde est prêt."
                : "Seul l'hôte peut configurer et lancer la partie. Patientez un instant..."}
            </p>
          </div>

          {isHost ? (
            <div className="mt-8 space-y-8 text-left">
              {/* Letters pool */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Lettres autorisées</h3>
                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={() => setLetterPool(ALLOWED_LETTERS)}
                      className="rounded-md border border-hairline px-2 py-1 text-muted-foreground hover:text-foreground"
                    >
                      Tout
                    </button>
                    <button
                      onClick={() => setLetterPool([])}
                      className="rounded-md border border-hairline px-2 py-1 text-muted-foreground hover:text-foreground"
                    >
                      Aucune
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {ALLOWED_LETTERS.map((l) => {
                    const active = letterPool.includes(l);
                    return (
                      <button
                        key={l}
                        onClick={() => toggleLetter(l)}
                        className={`h-9 w-9 rounded-lg border text-sm font-semibold transition ${
                          active
                            ? "border-foreground bg-foreground text-background"
                            : "border-hairline bg-surface-elevated text-muted-foreground hover:border-foreground/30"
                        }`}
                      >
                        {l}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {letterPool.length} lettre(s) — une sera tirée au hasard.
                </p>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-sm font-semibold">Catégories</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SUGGESTED_CATEGORIES.map((c) => {
                    const active = (room.categories ?? []).includes(c);
                    return (
                      <button
                        key={c}
                        onClick={() => toggleCategory(c)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                          active
                            ? "border-foreground bg-foreground text-background"
                            : "border-hairline bg-surface-elevated text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {(room.categories ?? []).length} catégorie(s) sélectionnée(s)
                </p>
              </div>

              {/* Duration */}
              <div>
                <h3 className="text-sm font-semibold">Durée du chrono</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {DURATION_OPTIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => updateRoomConfig({ duration: d })}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                        room.duration === d
                          ? "border-foreground bg-foreground text-background"
                          : "border-hairline bg-surface-elevated hover:border-foreground/30"
                      }`}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handleStart}
                  disabled={
                    players.length < 1 ||
                    letterPool.length === 0 ||
                    (room.categories ?? []).length === 0 ||
                    savingConfig
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand/90 disabled:opacity-50"
                >
                  <Play className="h-4 w-4" /> Lancer la partie
                </button>
                {(letterPool.length === 0 || (room.categories ?? []).length === 0) && (
                  <p className="text-xs text-destructive">
                    Sélectionnez au moins une lettre et une catégorie.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              <div className="rounded-xl border border-hairline bg-surface-elevated p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider">Durée</p>
                <p className="mt-1 text-base text-foreground">{room.duration}s</p>
              </div>
              <div className="rounded-xl border border-hairline bg-surface-elevated p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider">Catégories</p>
                <p className="mt-1 text-base text-foreground">{(room.categories ?? []).length}</p>
              </div>
              <div className="rounded-xl border border-hairline bg-surface-elevated p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider">Joueurs</p>
                <p className="mt-1 text-base text-foreground">{players.length}</p>
              </div>
            </div>
          )}
        </section>
      )}



      {/* Playing */}
      {room.status === "playing" && room.letter && (
        <>
          <section className="mt-6 rounded-2xl border border-hairline bg-surface p-6 text-center md:p-8">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Lettre imposée
            </p>
            <div className="mt-2 font-display text-[7rem] leading-none md:text-[9rem]">
              {room.letter}
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Timer className="h-4 w-4" />
              <span className="tabular-nums">{timeLeft}s</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-elevated">
              <div
                className="h-full bg-foreground transition-all duration-200 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </section>

          <div className="mt-6 grid gap-3">
            {room.categories.map((cat) => {
              const val = myAnswers[cat] ?? "";
              const valid = val.trim().toUpperCase().startsWith(room.letter!);
              return (
                <div key={cat} className="rounded-xl border border-hairline bg-surface p-4">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {cat}
                  </label>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="font-display text-2xl text-muted-foreground">
                      {room.letter}
                    </span>
                    <input
                      value={val}
                      disabled={submitted}
                      onChange={(e) =>
                        setMyAnswers((a) => ({ ...a, [cat]: e.target.value }))
                      }
                      placeholder={`Un(e) ${cat.toLowerCase()} en ${room.letter}...`}
                      className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/60 disabled:opacity-60"
                    />
                    {val && (
                      <span
                        className={`text-xs font-medium ${
                          valid ? "text-emerald-500" : "text-red-500"
                        }`}
                      >
                        {valid ? "✓" : "✗"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleFinish}
            disabled={submitted}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
          >
            {submitted ? (
              <>
                <Check className="h-4 w-4" /> Réponses envoyées — en attente des autres…
              </>
            ) : (
              <>
                <Flag className="h-4 w-4" /> J'ai fini !
              </>
            )}
          </button>
        </>
      )}

      {/* Ended */}
      {room.status === "ended" && (
        <section className="mt-6">
          <div className="rounded-2xl border border-hairline bg-surface p-6 text-center md:p-8">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-brand text-brand-foreground">
              <Trophy className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-display text-3xl md:text-4xl">
              Manche {currentRound} terminée{room.letter ? ` — Lettre ${room.letter}` : ""}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Récapitulatif des réponses de cette manche.
            </p>
          </div>

          {/* Cumulative scoreboard */}
          {cumulativeScores.length > 0 && (
            <div className="mt-6 rounded-2xl border border-hairline bg-surface p-5">
              <h3 className="text-sm font-semibold">
                Classement général ({cumulativeScores[0]?.rounds ?? 0} manche
                {(cumulativeScores[0]?.rounds ?? 0) > 1 ? "s" : ""})
              </h3>
              <ol className="mt-3 space-y-2">
                {cumulativeScores.map((s, i) => (
                  <li
                    key={s.player_id}
                    className="flex items-center justify-between rounded-lg border border-hairline bg-surface-elevated px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-muted-foreground tabular-nums">{i + 1}.</span>
                      {s.player_id === room.host_id && <Crown className="h-3.5 w-3.5 text-brand" />}
                      <span>{s.name}</span>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {s.total} pt{s.total > 1 ? "s" : ""}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="mt-6 grid gap-4">
            {currentRoundAnswers.length === 0 && (
              <p className="text-center text-sm text-muted-foreground">
                Aucune réponse envoyée pour cette manche.
              </p>
            )}
            {currentRoundAnswers.map((a) => {
              const validCount = room.categories.filter((c) =>
                (a.answers[c] ?? "").trim().toUpperCase().startsWith(room.letter ?? ""),
              ).length;
              return (
                <div key={a.player_id} className="rounded-2xl border border-hairline bg-surface p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {a.player_id === room.host_id && <Crown className="h-4 w-4 text-brand" />}
                      <h3 className="font-display text-lg">{a.name}</h3>
                    </div>
                    <span className="rounded-full bg-surface-elevated px-3 py-1 text-xs font-medium">
                      {validCount} / {room.categories.length}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {room.categories.map((cat) => {
                      const val = (a.answers[cat] ?? "").trim();
                      const valid =
                        !!val && val.toUpperCase().startsWith(room.letter ?? "");
                      return (
                        <div
                          key={cat}
                          className="flex items-center justify-between rounded-lg border border-hairline bg-surface-elevated px-3 py-2 text-sm"
                        >
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              {cat}
                            </p>
                            <p className="mt-0.5">
                              {val || (
                                <span className="text-muted-foreground/60">—</span>
                              )}
                            </p>
                          </div>
                          <span
                            className={`text-xs font-medium ${
                              valid ? "text-emerald-500" : "text-red-500"
                            }`}
                          >
                            {valid ? "✓" : "✗"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>


          {isHost && (
            <button
              onClick={handleReplay}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background hover:opacity-90"
            >
              <RotateCcw className="h-4 w-4" /> Nouvelle manche
            </button>
          )}
        </section>
      )}
    </div>
  );
}
