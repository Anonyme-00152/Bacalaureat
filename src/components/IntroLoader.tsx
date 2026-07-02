import { useEffect, useState } from "react";

const WORDS = ["BACCALAURÉAT", "İSİM ŞEHİR"];

export function IntroLoader({ onDone }: { onDone: () => void }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [phase, setPhase] = useState<"in" | "out" | "done">("in");

  const currentWord = WORDS[wordIndex];
  const letters = currentWord.split("");
  const inStagger = 90;
  const holdAfterIn = 500;
  const outStagger = 70;
  const betweenWords = 300;

  useEffect(() => {
    const inDuration = letters.length * inStagger + 600;
    const outStart = inDuration + holdAfterIn;
    const outDuration = letters.length * outStagger + 600;

    const t1 = setTimeout(() => setPhase("out"), outStart);
    const t2 = setTimeout(() => {
      if (wordIndex < WORDS.length - 1) {
        setPhase("in");
        setWordIndex((prev) => prev + 1);
      } else {
        setPhase("done");
        onDone();
      }
    }, outStart + outDuration + betweenWords);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [wordIndex]);

  if (phase === "done") return null;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-background"
      style={{ backgroundImage: "var(--gradient-radial)" }}
    >
      {/* Base gradient drift */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "var(--gradient-radial)",
          animation: "intro-bg-drift 12s ease-in-out infinite alternate",
        }}
      />

      {/* Rotating conic sweep using the same gradient palette */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-[30%] opacity-40 mix-blend-screen"
        style={{
          backgroundImage: "var(--gradient-radial)",
          filter: "blur(60px)",
          animation: "intro-bg-rotate 22s linear infinite",
        }}
      />

      {/* Floating orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="intro-orb intro-orb-1" />
        <span className="intro-orb intro-orb-2" />
        <span className="intro-orb intro-orb-3" />
        <span className="intro-orb intro-orb-4" />
      </div>

      {/* Pulsing glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage: "var(--gradient-radial)",
          filter: "blur(40px)",
          animation: "intro-bg-pulse 6s ease-in-out infinite",
        }}
      />

      {/* Scanning shimmer line */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          background:
            "linear-gradient(115deg, transparent 30%, hsl(0 0% 100% / 0.35) 50%, transparent 70%)",
          backgroundSize: "250% 100%",
          animation: "intro-shimmer 4.5s ease-in-out infinite",
        }}
      />

      {/* Grid overlay drift */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(0 0% 100% / 0.6) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          animation: "intro-grid-pan 18s linear infinite",
        }}
      />

      <h1
        className="relative font-display text-5xl md:text-8xl tracking-tight flex overflow-hidden"
        aria-label={currentWord}
        key={wordIndex + phase}
      >
        {letters.map((ch, i) => {
          const delay =
            phase === "in"
              ? `${i * inStagger}ms`
              : `${i * outStagger}ms`;
          return (
            <span
              key={i}
              className="inline-block"
              style={{
                animation:
                  phase === "in"
                    ? `intro-up 0.6s cubic-bezier(0.2,0.7,0.2,1) both`
                    : `intro-out 0.6s cubic-bezier(0.6,0,0.8,0.3) both`,
                animationDelay: delay,
              }}
            >
              {ch === " " ? "\u00A0" : ch}
            </span>
          );
        })}
      </h1>
      <style>{`
        @keyframes intro-up {
          0% { transform: translateY(110%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes intro-out {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-110%); opacity: 0; }
        }
        @keyframes intro-bg-drift {
          0%   { transform: translate3d(-3%, -2%, 0) scale(1.05); }
          50%  { transform: translate3d(2%, 3%, 0) scale(1.1); }
          100% { transform: translate3d(3%, -3%, 0) scale(1.05); }
        }
        @keyframes intro-bg-pulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50%      { opacity: 0.85; transform: scale(1.08); }
        }
        @keyframes intro-bg-rotate {
          0%   { transform: rotate(0deg) scale(1.2); }
          100% { transform: rotate(360deg) scale(1.2); }
        }
        @keyframes intro-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -100% 0; }
        }
        @keyframes intro-grid-pan {
          0%   { background-position: 0 0, 0 0; }
          100% { background-position: 48px 48px, 48px 48px; }
        }
        @keyframes intro-orb-float-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(60px, -40px) scale(1.2); }
        }
        @keyframes intro-orb-float-b {
          0%, 100% { transform: translate(0, 0) scale(1.1); }
          50%      { transform: translate(-70px, 50px) scale(0.9); }
        }
        @keyframes intro-orb-float-c {
          0%, 100% { transform: translate(0, 0) scale(0.95); }
          50%      { transform: translate(40px, 60px) scale(1.15); }
        }
        @keyframes intro-orb-float-d {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(-50px, -60px) scale(1.1); }
        }
        .intro-orb {
          position: absolute;
          border-radius: 9999px;
          filter: blur(70px);
          mix-blend-mode: screen;
          background-image: var(--gradient-radial);
          opacity: 0.7;
        }
        .intro-orb-1 { width: 380px; height: 380px; top: -80px; left: -60px; animation: intro-orb-float-a 9s ease-in-out infinite; }
        .intro-orb-2 { width: 320px; height: 320px; bottom: -80px; right: -60px; animation: intro-orb-float-b 11s ease-in-out infinite; }
        .intro-orb-3 { width: 260px; height: 260px; top: 30%; right: 15%; animation: intro-orb-float-c 8s ease-in-out infinite; }
        .intro-orb-4 { width: 300px; height: 300px; bottom: 20%; left: 20%; animation: intro-orb-float-d 10s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
