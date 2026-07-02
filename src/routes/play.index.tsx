import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, User, Users, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/play/")({
  head: () => ({
    meta: [
      { title: "Choisir un mode — Le Jeu du Baccalauréat" },
      { name: "description", content: "Choisissez votre mode de jeu : entraînez-vous en solo ou affrontez vos amis en groupe." },
    ],
  }),
  component: ModeSelectionPage,
});

function ModeSelectionPage() {
  const navigate = useNavigate();

  const onSelectMode = (mode: "solo" | "group") => {
    if (mode === "solo") {
      navigate({ to: "/play/solo" });
    } else {
      navigate({ to: "/play/group" });
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
      <a href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
      </a>

      <header className="mt-10 text-center md:mt-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" /> Le Jeu du Baccalauréat
        </div>
        <h1 className="mt-4 font-display text-4xl tracking-tight md:text-6xl">Choisissez votre mode de jeu</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground md:text-lg">
          Prêt à relever le défi ? Lancez une partie rapide en solo ou retrouvez vos amis pour une bataille de lettres.
        </p>
      </header>

      <section className="mt-10 flex flex-1 items-center justify-center md:mt-14">
        <div className="grid w-full max-w-3xl gap-6 md:grid-cols-2">
          {/* Solo */}
          <button
            onClick={() => onSelectMode("solo")}
            className="group relative rounded-2xl border border-hairline bg-surface p-8 text-left transition-all duration-300 hover:scale-105 hover:border-foreground/20 hover:bg-surface-elevated hover:shadow-[var(--shadow-elegant)]"
          >
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand text-brand-foreground transition duration-300 group-hover:scale-110">
              <User className="h-6 w-6" />
            </div>
            <h2 className="mt-6 font-display text-2xl md:text-3xl">Mode Solo</h2>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Entraînez-vous, battez votre propre record et jouez contre le chronomètre.
            </p>
            <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition group-hover:opacity-90">
              Jouer seul <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </div>
          </button>

          {/* Group */}
          <button
            onClick={() => onSelectMode("group")}
            className="group relative rounded-2xl border border-hairline bg-surface p-8 text-left transition-all duration-300 hover:scale-105 hover:border-foreground/20 hover:bg-surface-elevated hover:shadow-[var(--shadow-elegant)]"
          >
            <div className="absolute right-5 top-5 rounded-full border border-hairline bg-surface-elevated px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Bientôt disponible
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-secondary-foreground transition duration-300 group-hover:scale-110">
              <Users className="h-6 w-6" />
            </div>
            <h2 className="mt-6 font-display text-2xl md:text-3xl">Mode En Groupe</h2>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Créez une table ou rejoignez vos amis en ligne pour vous affronter en temps réel.
            </p>
            <div className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface-elevated px-4 py-2 text-sm font-medium transition group-hover:border-foreground/30">
              Jouer à plusieurs <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}
