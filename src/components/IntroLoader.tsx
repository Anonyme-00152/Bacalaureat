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
      {/* Animated background layers — same gradient, subtle motion */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "var(--gradient-radial)",
          animation: "intro-bg-drift 12s ease-in-out infinite alternate",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage: "var(--gradient-radial)",
          filter: "blur(40px)",
          animation: "intro-bg-pulse 6s ease-in-out infinite",
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
      `}</style>
    </div>
  );
}
