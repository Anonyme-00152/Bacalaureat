import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Play, Flag, RotateCcw, Sparkles, Timer, Shuffle } from "lucide-react";

export const Route = createFileRoute("/play/solo")({
  head: () => ({
    meta: [
      { title: "Solo — Le Jeu du Baccalauréat" },
      { name: "description", content: "Lance une partie solo du Baccalauréat : choisis une lettre, remplis les catégories avant la fin du chrono." },
    ],
  }),
  component: SoloPlayPage,
});

const ALLOWED_LETTERS = "ABCDEFGHIJKLMNOPRSTUVWXYZ".split("");
const DEFAULT_CATEGORIES = ["Prénom", "Animal", "Ville ou Pays", "Métier", "Objet"];
const SUGGESTED_CATEGORIES = [
  "Prénom", "Animal", "Ville ou Pays", "Métier", "Objet",
  "Plat", "Marque", "Sport", "Film", "Couleur", "Fruit ou Légume", "Instrument",
];

type Phase = "idle" | "playing" | "done";

function SoloPlayPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [letter, setLetter] = useState<string>("");
  const [manualLetter, setManualLetter] = useState<string>("");
  const [duration, setDuration] = useState<number>(60);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (phase !== "playing") return;
    if (timeLeft <= 0) {
      setPhase("done");
      return;
    }
    const id = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, timeLeft]);

  const start = (chosen?: string) => {
    const l = (chosen && chosen.trim().toUpperCase()) || ALLOWED_LETTERS[Math.floor(Math.random() * ALLOWED_LETTERS.length)];
    setLetter(l);
    setAnswers({});
    setTimeLeft(duration);
    setPhase("playing");
  };

  const finish = () => setPhase("done");
  const reset = () => {
    setPhase("idle");
    setLetter("");
    setAnswers({});
    setTimeLeft(duration);
  };

  const toggleCategory = (c: string) => {
    setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  const progress = useMemo(() => (duration ? (timeLeft / duration) * 100 : 0), [timeLeft, duration]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <a href="/play" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Retour à la sélection
      </a>

      <header className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" /> Le Jeu du Baccalauréat
        </div>
        <h1 className="mt-4 font-display text-4xl tracking-tight md:text-5xl">Prêt pour une partie ?</h1>
        <p className="mt-3 text-muted-foreground">Choisis une lettre, remplis toutes les catégories avant la fin du chrono.</p>
      </header>

      {phase === "idle" && (
        <section className="mt-10 rounded-2xl border border-hairline bg-surface p-6 md:p-8">
          <h2 className="text-lg font-semibold">1. Choisis ta lettre</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {ALLOWED_LETTERS.map((l) => (
              <button
                key={l}
                onClick={() => setManualLetter(l)}
                className={`h-10 w-10 rounded-lg border text-sm font-semibold transition ${
                  manualLetter === l
                    ? "border-foreground bg-foreground text-background"
                    : "border-hairline bg-surface-elevated hover:border-foreground/30"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <h2 className="mt-8 text-lg font-semibold">2. Choisis tes catégories</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {SUGGESTED_CATEGORIES.map((c) => {
              const active = categories.includes(c);
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
          <p className="mt-2 text-xs text-muted-foreground">{categories.length} catégorie(s) sélectionnée(s)</p>

          <h2 className="mt-8 text-lg font-semibold">3. Durée du chrono</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {[30, 60, 90, 120].map((d) => (
              <button
                key={d}
                onClick={() => { setDuration(d); setTimeLeft(d); }}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  duration === d
                    ? "border-foreground bg-foreground text-background"
                    : "border-hairline bg-surface-elevated hover:border-foreground/30"
                }`}
              >
                {d}s
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => start(manualLetter)}
              disabled={!manualLetter || categories.length === 0}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-40"
            >
              <Play className="h-4 w-4" /> Lancer la partie
            </button>
            <button
              onClick={() => start()}
              disabled={categories.length === 0}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-hairline bg-surface-elevated px-5 py-3 text-sm font-medium transition hover:border-foreground/30 disabled:opacity-40"
            >
              <Shuffle className="h-4 w-4" /> Lettre aléatoire
            </button>
          </div>
        </section>
      )}

      {phase === "playing" && (
        <section className="mt-10">
          <div className="rounded-2xl border border-hairline bg-surface p-6 text-center md:p-8">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Lettre imposée</p>
            <div className="mt-2 font-display text-[8rem] leading-none md:text-[10rem]">{letter}</div>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Timer className="h-4 w-4" />
              <span className="tabular-nums">{timeLeft}s</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-elevated">
              <div
                className="h-full bg-foreground transition-all duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {categories.map((cat) => {
              const val = answers[cat] ?? "";
              const valid = val.trim().toUpperCase().startsWith(letter);
              return (
                <div key={cat} className="rounded-xl border border-hairline bg-surface p-4">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{cat}</label>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="font-display text-2xl text-muted-foreground">{letter}</span>
                    <input
                      value={val}
                      onChange={(e) => setAnswers((a) => ({ ...a, [cat]: e.target.value }))}
                      placeholder={`Un(e) ${cat.toLowerCase()} en ${letter}...`}
                      className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/60"
                    />
                    {val && (
                      <span className={`text-xs font-medium ${valid ? "text-emerald-500" : "text-red-500"}`}>
                        {valid ? "✓" : "✗"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={finish}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:opacity-90"
          >
            <Flag className="h-4 w-4" /> J'ai fini !
          </button>
        </section>
      )}

      {phase === "done" && (
        <section className="mt-10">
          <div className="rounded-2xl border border-hairline bg-surface p-6 text-center md:p-8">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Partie terminée</p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">Bac ! Lettre {letter}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {Object.values(answers).filter((v) => v.trim().toUpperCase().startsWith(letter)).length} / {categories.length} réponses valides
            </p>
          </div>

          <div className="mt-6 grid gap-3">
            {categories.map((cat) => {
              const val = (answers[cat] ?? "").trim();
              const valid = val.toUpperCase().startsWith(letter);
              return (
                <div key={cat} className="flex items-center justify-between rounded-xl border border-hairline bg-surface p-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{cat}</p>
                    <p className="mt-0.5 text-base">{val || <span className="text-muted-foreground/60">— aucune réponse —</span>}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${valid ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                    {valid ? "Valide" : "Invalide"}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            onClick={reset}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:opacity-90"
          >
            <RotateCcw className="h-4 w-4" /> Rejouer
          </button>
        </section>
      )}
    </div>
  );
}
