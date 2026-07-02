import { createFileRoute } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Sparkles,
  Users,
  FileText,
  Calendar,
  Video,
  Coffee,
  Star,
  Zap,
  Globe,
} from "lucide-react";
import { IntroLoader } from "@/components/IntroLoader";

export const Route = createFileRoute("/")({
  component: Landing,
});

/* ---------------------- i18n ---------------------- */
type Lang = "fr" | "tr";

const translations = {
  fr: {
    brand: "Le Baccalauréat",
    nav: { rules: "Règles", categories: "Catégories", variants: "Variantes", play: "Jouer" },
    signIn: "Se connecter",
    playNow: "Jouer Maintenant",
    heroBadge: "Le jeu culte des soirées entre amis",
    heroTitle1: "Le Jeu du Baccalauréat, le jeu",
    heroTitleItalic: "de lettres",
    heroTitle2: "intemporel",
    heroDesc:
      "Un jeu simple et addictif : on tire une lettre au hasard et chaque joueur doit trouver un mot pour chaque catégorie. Le plus rapide crie \"Bac !\"",
    planSoloEyebrow: "Classique",
    planSoloTitle: "Solo",
    planSoloDesc: "Parfait pour s'entraîner seul ou pour débuter tranquillement.",
    planSoloCta: "Jouer gratuitement",
    planGroupEyebrow: "À plusieurs",
    planGroupTitle: "En groupe",
    planGroupDesc: "La vraie ambiance soirée, plus on est de fous plus on rit.",
    planGroupCta: "Inviter des amis",
    statPlayers: "Joueurs actifs",
    statCats: "Catégories",
    statWords: "Mots trouvés",
    bacValid: "Bac validé !",
    justNow: "À l'instant",
    featuresEyebrow: "Règles & Catégories",
    featuresTitle1: "Les secrets pour gagner",
    featuresTitleItalic: "à chaque partie",
    featuresBig:
      "Un résumé simple des règles pour bien débuter chaque partie du Baccalauréat.",
    featuresBigItalic: "règles",
    readRules: "Lire les règles",
    speedTitle: "Rapidité & Mémoire",
    speedDesc: "Le Baccalauréat réveille votre mémoire et vos réflexes. Soyez le plus rapide !",
    lettersTitle: "Toutes les Lettres du Baccalauréat",
    lettersDesc: "De A à Z, aucune lettre n'est oubliée dans une partie complète.",
    stratEyebrow: "Les Catégories",
    stratTitle1: "Maîtrisez les thèmes",
    stratTitleItalic: "à chaque tour",
    firstNameTitle: "Prénom",
    firstNameDesc: "Le classique absolu. L'originalité rapporte des points bonus.",
    firstNameInM: "Prénom en \"M\"",
    top: "Top",
    score: "Score",
    pts: "3 pts",
    cityTitle: "Ville / Pays",
    cityDesc: "Montrez votre culture géographique avec style et originalité.",
    tokyo: "Tokyo, Japon",
    capital: "Capitale",
    turnValid: "Tour validé · En cours",
    animalTitle: "Animal & Fruit",
    animalDesc: "Du lion à la banane, soyez créatif pour marquer des points.",
    chat1: "Le perroquet mange une mangue 🦜",
    chat2: "Génial, j'ai aussi \"pêche\" !",
    scoreTitle: "Score & Gagnant",
    scoreDesc: "Comptez vos points et couronnez le champion de la soirée.",
    winnerName: "Alex Martin",
    winnerLabel: "Gagnant du Baccalauréat",
    schedTitle1: "Une lettre, un",
    schedTitleItalic: "chronomètre",
    schedDesc:
      "Tirez une lettre au hasard et remplissez vos grilles en un temps record. Le joueur le plus rapide crie \"Bac\" et arrête le tour.",
    schedItems: [
      "Lettre tirée au hasard",
      "Chronomètre intégré",
      "Validation des mots par les joueurs",
    ],
    start: "Commencer",
    turnFlow: "Déroulement du tour",
    letterM: "Lettre : M",
    event1Title: "Tour 1 : Lettre M",
    event1Time: "Grille à remplir",
    event2Title: "Pause & Validation",
    event2Time: "Vérification des réponses",
    event3Title: "Annonce du gagnant",
    event3Time: "Comptage des points",
    ecoEyebrow: "Thèmes",
    ecoTitle1: "Les catégories les plus",
    ecoTitleItalic: "populaires du Baccalauréat",
    tools: ["Prénom", "Ville", "Pays", "Métier", "Animal", "Fruit", "Couleur", "Célébrité", "Marque", "Sport", "Fleur", "Film"],
    testiTitle: "Ce que les joueurs en disent",
    testi1Stat: "99,9%",
    testi1Desc: "de taux de fous rires lors des parties en groupe.",
    testi2Name: "Sophie Martin",
    testi2Role: "Experte du Baccalauréat depuis 10 ans",
    testi3Text:
      "Le Jeu du Baccalauréat, c'est le meilleur moyen de tester sa culture tout en s'amusant. Un incontournable des soirées !",
    ctaEyebrow: "C'est parti",
    ctaTitle1: "Prêt à devenir le",
    ctaTitleItalic: "maître du Baccalauréat ?",
    ctaDesc:
      "Rejoignez des milliers de joueurs qui se défient chaque soir et découvrez qui a la meilleure culture générale.",
    ctaPlay: "Jouer gratuitement",
    ctaRules: "Voir les règles",
    footerRights: "Tous droits réservés.",
    footerCopy: "© 2026 Le Jeu du Baccalauréat.",
    footerCols: [
      { title: "Jeu", items: ["Règles", "Catégories", "Variantes", "Historique"] },
      { title: "À propos", items: ["Blog", "Astuces", "Contact"] },
      { title: "Mentions", items: ["Confidentialité", "Conditions", "Sécurité"] },
    ],
    langToggle: "🇹🇷 TR (İsim Şehir)",
  },
  tr: {
    brand: "İsim Şehir",
    nav: { rules: "Kurallar", categories: "Kategoriler", variants: "Varyantlar", play: "Oyna" },
    signIn: "Giriş yap",
    playNow: "Hemen Oyna",
    heroBadge: "Arkadaş buluşmalarının efsane oyunu",
    heroTitle1: "İsim Şehir, zamansız",
    heroTitleItalic: "harf",
    heroTitle2: "oyunu",
    heroDesc:
      "Basit ve bağımlılık yapan bir oyun: rastgele bir harf seçilir ve her oyuncu her kategori için bir kelime bulur. En hızlısı \"Bac!\" diye bağırır.",
    planSoloEyebrow: "Klasik",
    planSoloTitle: "Tek Kişilik",
    planSoloDesc: "Tek başına antrenman yapmak veya rahat başlamak için ideal.",
    planSoloCta: "Ücretsiz oyna",
    planGroupEyebrow: "Çok kişili",
    planGroupTitle: "Grupla",
    planGroupDesc: "Gerçek parti havası, ne kadar kalabalıksak o kadar eğlenceli.",
    planGroupCta: "Arkadaş davet et",
    statPlayers: "Aktif oyuncular",
    statCats: "Kategoriler",
    statWords: "Bulunan kelimeler",
    bacValid: "Bac onaylandı!",
    justNow: "Az önce",
    featuresEyebrow: "Kurallar & Kategoriler",
    featuresTitle1: "Her oyunu kazanmanın",
    featuresTitleItalic: "sırları",
    featuresBig:
      "Her partiye iyi başlamak için İsim Şehir kurallarının basit bir özeti.",
    featuresBigItalic: "kuralların",
    readRules: "Kuralları oku",
    speedTitle: "Hız & Hafıza",
    speedDesc: "İsim Şehir hafızanızı ve reflekslerinizi harekete geçirir. En hızlısı olun!",
    lettersTitle: "İsim Şehir'in Tüm Harfleri",
    lettersDesc: "A'dan Z'ye, tam bir partide hiçbir harf unutulmaz.",
    stratEyebrow: "Kategoriler",
    stratTitle1: "Her turda temaları",
    stratTitleItalic: "ustalaşın",
    firstNameTitle: "İsim",
    firstNameDesc: "Mutlak klasik. Özgünlük bonus puan kazandırır.",
    firstNameInM: "\"M\" ile İsim",
    top: "En iyi",
    score: "Skor",
    pts: "3 puan",
    cityTitle: "Şehir / Ülke",
    cityDesc: "Coğrafya kültürünüzü şık ve özgün bir şekilde gösterin.",
    tokyo: "Tokyo, Japonya",
    capital: "Başkent",
    turnValid: "Tur onaylandı · Devam ediyor",
    animalTitle: "Hayvan & Meyve",
    animalDesc: "Aslandan muza, puan kazanmak için yaratıcı olun.",
    chat1: "Papağan mango yiyor 🦜",
    chat2: "Süper, bende de \"şeftali\" var!",
    scoreTitle: "Skor & Kazanan",
    scoreDesc: "Puanları sayın ve gecenin şampiyonunu belirleyin.",
    winnerName: "Alex Martin",
    winnerLabel: "İsim Şehir Kazananı",
    schedTitle1: "Bir harf, bir",
    schedTitleItalic: "kronometre",
    schedDesc:
      "Rastgele bir harf çekin ve tablonuzu rekor sürede doldurun. En hızlı oyuncu \"Bac\" der ve turu durdurur.",
    schedItems: [
      "Rastgele çekilen harf",
      "Entegre kronometre",
      "Kelimelerin oyuncularca onayı",
    ],
    start: "Başla",
    turnFlow: "Turun akışı",
    letterM: "Harf: M",
    event1Title: "Tur 1: M Harfi",
    event1Time: "Doldurulacak tablo",
    event2Title: "Mola & Onay",
    event2Time: "Cevapların kontrolü",
    event3Title: "Kazananın ilanı",
    event3Time: "Puan sayımı",
    ecoEyebrow: "Temalar",
    ecoTitle1: "İsim Şehir'in en",
    ecoTitleItalic: "popüler kategorileri",
    tools: ["İsim", "Şehir", "Ülke", "Meslek", "Hayvan", "Meyve", "Renk", "Ünlü", "Marka", "Spor", "Çiçek", "Film"],
    testiTitle: "Oyuncular ne diyor",
    testi1Stat: "%99,9",
    testi1Desc: "grup partilerinde kahkaha oranı.",
    testi2Name: "Sophie Martin",
    testi2Role: "10 yıllık İsim Şehir uzmanı",
    testi3Text:
      "İsim Şehir, eğlenirken kültürünüzü test etmenin en iyi yolu. Partilerin vazgeçilmezi!",
    ctaEyebrow: "Başlıyoruz",
    ctaTitle1: "İsim Şehir ustası olmaya",
    ctaTitleItalic: "hazır mısın?",
    ctaDesc:
      "Her akşam birbirleriyle yarışan binlerce oyuncuya katılın ve en iyi genel kültüre kimin sahip olduğunu keşfedin.",
    ctaPlay: "Ücretsiz oyna",
    ctaRules: "Kuralları gör",
    footerRights: "Tüm hakları saklıdır.",
    footerCopy: "© 2026 İsim Şehir.",
    footerCols: [
      { title: "Oyun", items: ["Kurallar", "Kategoriler", "Varyantlar", "Tarihçe"] },
      { title: "Hakkında", items: ["Blog", "İpuçları", "İletişim"] },
      { title: "Yasal", items: ["Gizlilik", "Koşullar", "Güvenlik"] },
    ],
    langToggle: "🇫🇷 FR (Le Baccalauréat)",
  },
} as const;

type Dict = (typeof translations)[Lang];

const LangContext = createContext<{ lang: Lang; t: Dict; toggle: () => void }>({
  lang: "fr",
  t: translations.fr,
  toggle: () => {},
});

const useT = () => useContext(LangContext);

function Landing() {
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Lang>("fr");

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = loading ? "hidden" : "";
    }
  }, [loading]);

  const toggle = () => setLang((l) => (l === "fr" ? "tr" : "fr"));
  const t = translations[lang];

  return (
    <LangContext.Provider value={{ lang, t, toggle }}>
      <div className="min-h-screen bg-background text-foreground">
        {loading && <IntroLoader onDone={() => setLoading(false)} />}
        <div
          className={`transition-all duration-[1200ms] ease-out ${
            loading
              ? "opacity-0 translate-y-4 blur-sm"
              : "opacity-100 translate-y-0 blur-0"
          }`}
        >
          <Nav />
          <main>
            <Hero />
            <Features />
            <Strategy />
            <Scheduling />
            <Ecosystem />
            <Testimonials />
            <CTA />
          </main>
          <Footer />
        </div>
      </div>
    </LangContext.Provider>
  );
}

/* ---------------------- Nav ---------------------- */
function Nav() {
  const { t, toggle } = useT();
  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="#" className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-brand text-brand-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-display text-lg">{t.brand}</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">{t.nav.rules}</a>
          <a href="#solutions" className="hover:text-foreground">{t.nav.categories}</a>
          <a href="#ecosystem" className="hover:text-foreground">{t.nav.variants}</a>
          <a href="/play" className="hover:text-foreground">{t.nav.play}</a>
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-surface-elevated hover:text-foreground"
          >
            <Globe className="h-3.5 w-3.5" />
            {t.langToggle}
          </button>
          <button className="hidden text-sm text-muted-foreground hover:text-foreground sm:block">
            {t.signIn}
          </button>
          <a
            href="/play"
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
          >
            {t.playNow} <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </header>
  );
}

/* ---------------------- Hero ---------------------- */
function Hero() {
  const { t } = useT();
  return (
    <section
      className="relative overflow-hidden px-6 pt-20 pb-24 md:pt-28 md:pb-32"
      style={{ backgroundImage: "var(--gradient-radial)" }}
    >
      <div className="mx-auto max-w-5xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-xs text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand" />
          {t.heroBadge}
        </div>

        <h1 className="mt-8 font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
          {t.heroTitle1}{" "}
          <span className="italic text-muted-foreground">{t.heroTitleItalic}</span>
          <br />
          {t.heroTitle2}
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
          {t.heroDesc}
        </p>

        <div className="mx-auto mt-14 grid max-w-3xl gap-4 sm:grid-cols-2">
          <PlanCard
            eyebrow={t.planSoloEyebrow}
            title={t.planSoloTitle}
            desc={t.planSoloDesc}
            cta={t.planSoloCta}
            href="/play/solo"
            featured
          />
          <PlanCard
            eyebrow={t.planGroupEyebrow}
            title={t.planGroupTitle}
            desc={t.planGroupDesc}
            cta={t.planGroupCta}
            href="/play/group"
          />
        </div>

        <div className="relative mx-auto mt-20 max-w-4xl">
          <div className="relative overflow-hidden rounded-2xl border border-hairline bg-surface p-4 shadow-[var(--shadow-elegant)]">
            <div className="rounded-xl border border-hairline bg-surface-elevated p-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <MiniStat icon={<Users className="h-4 w-4" />} label={t.statPlayers} value="12" />
                <MiniStat icon={<Zap className="h-4 w-4" />} label={t.statCats} value="26" />
                <MiniStat icon={<CheckCircle2 className="h-4 w-4" />} label={t.statWords} value="847" />
              </div>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 hidden w-56 rounded-xl border border-hairline bg-surface p-4 shadow-[var(--shadow-elegant)] md:block">
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-brand text-brand-foreground">
                <Check className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">{t.bacValid}</div>
                <div className="text-xs text-muted-foreground">{t.justNow}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlanCard({
  eyebrow,
  title,
  desc,
  cta,
  href,
  featured,
}: {
  eyebrow: string;
  title: string;
  desc: string;
  cta: string;
  href?: string;
  featured?: boolean;
}) {
  const card = (
    <div
      className={`rounded-2xl border p-6 text-left transition ${
        featured
          ? "border-transparent bg-brand text-brand-foreground"
          : "border-hairline bg-surface hover:bg-surface-elevated"
      }`}
    >
      <div className="text-xs uppercase tracking-wider opacity-70">{eyebrow}</div>
      <div className="mt-2 font-display text-2xl">{title}</div>
      <p className={`mt-2 text-sm ${featured ? "opacity-80" : "text-muted-foreground"}`}>
        {desc}
      </p>
      <button
        className={`mt-6 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium ${
          featured
            ? "bg-brand-foreground text-brand"
            : "bg-foreground text-background"
        }`}
      >
        {cta} <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        {card}
      </a>
    );
  }

  return card;
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-hairline bg-surface p-4 text-left">
      <div className="grid h-9 w-9 place-items-center rounded-md bg-surface-elevated text-brand">
        {icon}
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-display text-xl">{value}</div>
      </div>
    </div>
  );
}

/* ---------------------- Features ---------------------- */
function Features() {
  const { t } = useT();
  return (
    <section id="features" className="border-t border-hairline px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={t.featuresEyebrow}
          title={
            <>
              {t.featuresTitle1}{" "} <br />
              <span className="italic text-muted-foreground">{t.featuresTitleItalic}</span>
            </>
          }
        />

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <div className="flex h-full min-h-[280px] flex-col justify-between">
              <p className="font-display text-2xl leading-tight md:text-3xl">
                {t.featuresBig}
              </p>
              <button className="mt-8 inline-flex w-fit items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">
                {t.readRules} <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </Card>

          <Card>
            <div className="flex h-full min-h-[280px] flex-col justify-between">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-hairline bg-surface-elevated px-3 py-1 text-xs">
                <Sparkles className="h-3 w-3 text-brand" /> 🧠
              </div>
              <div>
                <div className="font-display text-xl">{t.speedTitle}</div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t.speedDesc}
                </p>
              </div>
            </div>
          </Card>

          <Card className="md:col-span-3">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <div className="font-display text-xl">{t.lettersTitle}</div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t.lettersDesc}
                </p>
              </div>
              <div className="flex -space-x-2">
                {["A", "B", "C", "D"].map((c, i) => (
                  <div
                    key={c}
                    className="grid h-9 w-9 place-items-center rounded-full border-2 border-surface bg-surface-elevated text-xs"
                    style={{ zIndex: 10 - i }}
                  >
                    {c}
                  </div>
                ))}
                <div className="grid h-9 w-9 place-items-center rounded-full border-2 border-surface bg-brand text-xs text-brand-foreground">
                  +22
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

/* ---------------------- Strategy ---------------------- */
function Strategy() {
  const { t } = useT();
  return (
    <section id="solutions" className="border-t border-hairline px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={t.stratEyebrow}
          title={
            <>
              {t.stratTitle1}{" "} <br />
              <span className="italic text-muted-foreground">{t.stratTitleItalic}</span>
            </>
          }
        />

        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StrategyCard
            title={t.firstNameTitle}
            desc={t.firstNameDesc}
            body={
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>{t.firstNameInM}</span>
                  <span className="rounded-full bg-brand px-2 py-0.5 text-xs text-brand-foreground">
                    {t.top}
                  </span>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t.score}</span>
                    <span>{t.pts}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated">
                    <div className="h-full w-3/4 rounded-full bg-brand" />
                  </div>
                </div>
              </div>
            }
          />

          <StrategyCard
            title={t.cityTitle}
            desc={t.cityDesc}
            body={
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg border border-hairline bg-surface-elevated p-3">
                  <FileText className="h-4 w-4 text-brand" />
                  <div className="flex-1">
                    <div className="text-sm">{t.tokyo}</div>
                    <div className="text-xs text-muted-foreground">{t.capital}</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {t.turnValid}
                </div>
              </div>
            }
          />

          <StrategyCard
            title={t.animalTitle}
            desc={t.animalDesc}
            body={
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-full bg-surface-elevated" />
                  <div className="rounded-lg rounded-tl-none bg-surface-elevated px-3 py-2 text-xs">
                    {t.chat1}
                  </div>
                </div>
                <div className="flex items-start justify-end gap-2">
                  <div className="rounded-lg rounded-tr-none bg-brand px-3 py-2 text-xs text-brand-foreground">
                    {t.chat2}
                  </div>
                </div>
              </div>
            }
          />

          <StrategyCard
            title={t.scoreTitle}
            desc={t.scoreDesc}
            body={
              <div className="flex items-center gap-3 rounded-lg border border-hairline bg-surface-elevated p-3">
                <div className="h-10 w-10 rounded-full bg-brand" />
                <div className="flex-1">
                  <div className="text-sm">{t.winnerName}</div>
                  <div className="text-xs text-muted-foreground">{t.winnerLabel}</div>
                </div>
                <button className="rounded-full border border-hairline p-1.5">
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            }
          />
        </div>
      </div>
    </section>
  );
}

function StrategyCard({
  title,
  desc,
  body,
}: {
  title: string;
  desc: string;
  body: React.ReactNode;
}) {
  return (
    <Card>
      <div className="flex h-full min-h-[240px] flex-col justify-between gap-6">
        <div>{body}</div>
        <div>
          <div className="font-display text-lg">{title}</div>
          <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
    </Card>
  );
}

/* ---------------------- Scheduling ---------------------- */
function Scheduling() {
  const { t } = useT();
  const events = [
    { icon: <Users className="h-4 w-4" />, title: t.event1Title, time: t.event1Time },
    { icon: <Coffee className="h-4 w-4" />, title: t.event2Title, time: t.event2Time },
    { icon: <Video className="h-4 w-4" />, title: t.event3Title, time: t.event3Time },
  ];
  return (
    <section className="border-t border-hairline px-6 py-24">
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="font-display text-4xl leading-tight md:text-5xl">
            {t.schedTitle1}{" "} <br />
            <span className="italic text-muted-foreground">{t.schedTitleItalic}</span>
          </h2>
          <p className="mt-6 max-w-md text-muted-foreground">
            {t.schedDesc}
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {t.schedItems.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-brand text-brand-foreground">
                  <Check className="h-3 w-3" />
                </span>
                {f}
              </li>
            ))}
          </ul>
          <button className="mt-10 inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background">
            {t.start} <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="rounded-2xl border border-hairline bg-surface p-4">
          <div className="mb-3 flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-brand" />
              {t.turnFlow}
            </div>
            <div className="text-xs text-muted-foreground">{t.letterM}</div>
          </div>
          <div className="space-y-2">
            {events.map((e) => (
              <div
                key={e.title}
                className="flex items-center gap-4 rounded-xl border border-hairline bg-surface-elevated p-4"
              >
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-surface text-brand">
                  {e.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{e.title}</div>
                  <div className="text-xs text-muted-foreground">{e.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------- Ecosystem ---------------------- */
function Ecosystem() {
  const { t } = useT();
  return (
    <section id="ecosystem" className="border-t border-hairline px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={t.ecoEyebrow}
          title={
            <>
              {t.ecoTitle1}{" "} <br />
              <span className="italic text-muted-foreground">{t.ecoTitleItalic}</span>
            </>
          }
        />
        <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {t.tools.map((tool) => (
            <div
              key={tool}
              className="flex items-center justify-center rounded-xl border border-hairline bg-surface py-6 text-sm text-muted-foreground transition hover:bg-surface-elevated hover:text-foreground"
            >
              {tool}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------- Testimonials ---------------------- */
function Testimonials() {
  const { t } = useT();
  return (
    <section className="border-t border-hairline px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-display text-4xl md:text-5xl">{t.testiTitle}</h2>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          <Card>
            <div className="font-display text-5xl">{t.testi1Stat}</div>
            <p className="mt-3 text-sm text-muted-foreground">
              {t.testi1Desc}
            </p>
            <div className="mt-8 h-16 rounded-lg bg-gradient-to-r from-brand/40 to-brand/10" />
          </Card>

          <Card>
            <div className="mb-6 h-40 rounded-lg bg-surface-elevated" />
            <div className="font-display text-lg">{t.testi2Name}</div>
            <div className="text-sm text-muted-foreground">{t.testi2Role}</div>
          </Card>

          <Card>
            <div className="font-display text-6xl leading-none text-brand">&ldquo;</div>
            <p className="mt-4 text-sm">
              {t.testi3Text}
            </p>
            <div className="mt-6 flex gap-1 text-brand">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

/* ---------------------- CTA ---------------------- */
function CTA() {
  const { t } = useT();
  return (
    <section
      id="cta"
      className="border-t border-hairline px-6 py-32"
      style={{ backgroundImage: "var(--gradient-radial)" }}
    >
      <div className="mx-auto max-w-3xl text-center">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">
          {t.ctaEyebrow}
        </div>
        <h2 className="mt-4 font-display text-5xl leading-[1.05] md:text-6xl">
          {t.ctaTitle1}{" "} <br />
          <span className="italic text-muted-foreground">{t.ctaTitleItalic}</span>
        </h2>
        <p className="mt-6 text-muted-foreground">
          {t.ctaDesc}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground"
          >
            {t.ctaPlay} <ArrowRight className="h-3.5 w-3.5" />
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-5 py-2.5 text-sm font-medium"
          >
            {t.ctaRules}
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------------------- Footer ---------------------- */
function Footer() {
  const { t } = useT();
  return (
    <footer className="border-t border-hairline px-6 py-16">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-brand text-brand-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-display text-lg">{t.brand}</span>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {t.footerCopy} <br />
            {t.footerRights}
          </p>
        </div>
        {t.footerCols.map((c) => (
          <div key={c.title}>
            <div className="text-sm font-medium">{c.title}</div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {c.items.map((i) => (
                <li key={i}>
                  <a href="#" className="hover:text-foreground">{i}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}

/* ---------------------- Primitives ---------------------- */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-hairline bg-surface p-6 transition hover:bg-surface-elevated ${className}`}
    >
      {children}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: React.ReactNode;
}) {
  return (
    <div>
      <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-xs text-muted-foreground">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand" />
        {eyebrow}
      </div>
      <h2 className="mt-6 font-display text-4xl leading-tight md:text-5xl">{title}</h2>
    </div>
  );
}
