export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/40 bg-white/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-6 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <p className="text-sm text-content-muted">
          AI Interview Agent — Hackathon prototype
        </p>
        <p className="flex items-center gap-1.5 text-sm text-content-muted">
          <span className="inline-block h-2 w-2 animate-pulse-ring rounded-full bg-accent" />
          Powered by AI
        </p>
      </div>
    </footer>
  );
}
