import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";

const features = [
  {
    emoji: "🎤",
    title: "Simulated interview",
    description: "Walk through a guided interview experience with realistic questions.",
    gradient: "from-indigo-500/10 via-indigo-500/5 to-transparent",
    ring: "group-hover:ring-indigo-300/60",
  },
  {
    emoji: "💡",
    title: "Thoughtful prompts",
    description: "Answer questions in a focused, distraction-free flow.",
    gradient: "from-violet-500/10 via-violet-500/5 to-transparent",
    ring: "group-hover:ring-violet-300/60",
  },
  {
    emoji: "📈",
    title: "Actionable feedback",
    description: "Review strengths and areas to improve afterward.",
    gradient: "from-fuchsia-500/10 via-fuchsia-500/5 to-transparent",
    ring: "group-hover:ring-fuchsia-300/60",
  },
];

export default function HomePage() {
  return (
    <PageContainer className="max-w-6xl">
      <div className="space-y-16">
        {/* Hero section */}
        <div className="animate-fade-up space-y-6 pt-6 text-center sm:pt-10">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/70 px-4 py-1.5 backdrop-blur">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-content-muted">
              AI-Powered Interview Practice
            </span>
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-content sm:text-5xl lg:text-6xl">
            Practice interviews with an{" "}
            <span className="gradient-text">AI agent</span>
          </h1>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-content-muted sm:text-lg">
            AI Interview Agent helps you rehearse real interview conversations,
            receive structured feedback, and improve with every session — like a
            personal coach in your pocket.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 pt-4 sm:flex-row">
            <Button href="/interview" className="w-full sm:w-auto">
              <span>🚀</span> Start interview
            </Button>
            <Button href="/feedback" variant="secondary" className="w-full sm:w-auto">
              <span>📋</span> View feedback preview
            </Button>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((item, i) => (
            <article
              key={item.title}
              className={`group relative animate-fade-up overflow-hidden rounded-2xl border border-white/50 bg-white/70 p-6 shadow-card backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow-lg ring-4 ring-transparent ${item.ring} ${
                item.gradient
              }`}
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-hero-gradient opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                {item.emoji}
              </div>
              <h2 className="text-lg font-bold text-content group-hover:text-accent transition-colors">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-content-muted">
                {item.description}
              </p>
            </article>
          ))}
        </div>

        {/* CTA banner */}
        <div className="animate-fade-up relative overflow-hidden rounded-3xl bg-hero-gradient p-8 text-center shadow-glow-lg sm:p-12">
          <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 animate-float rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 animate-float rounded-full bg-white/10 blur-2xl [animation-delay:2s]" />
          <h2 className="relative text-2xl font-bold text-white sm:text-3xl">
            Ready to ace your next interview?
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-sm text-white/80 sm:text-base">
            Jump into a live session now and get instant, structured feedback on
            your responses.
          </p>
          <div className="relative mt-6">
            <Button
              href="/interview"
              className="bg-white text-accent hover:bg-white/90 shadow-none"
            >
              Begin now →
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
