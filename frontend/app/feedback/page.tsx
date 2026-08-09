"use client";

import { useEffect, useState } from "react";

import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "ai-interview-feedback";

type FeedbackList = {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
};

const listConfig = {
  positive: {
    emoji: "🌟",
    ring: "ring-emerald-200",
    header: "from-emerald-500 to-teal-500",
    chip: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  warning: {
    emoji: "🎯",
    ring: "ring-amber-200",
    header: "from-amber-500 to-orange-500",
    chip: "border-amber-200 bg-amber-50 text-amber-800",
  },
  info: {
    emoji: "🧭",
    ring: "ring-sky-200",
    header: "from-sky-500 to-indigo-500",
    chip: "border-sky-200 bg-sky-50 text-sky-800",
  },
} as const;

function FeedbackList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: keyof typeof listConfig;
}) {
  const cfg = listConfig[tone];

  return (
    <section className="animate-fade-up rounded-2xl border border-white/50 bg-white/70 p-6 shadow-card ring-4 ring-transparent backdrop-blur transition-shadow duration-300 hover:shadow-glow-lg">
      <div className="mb-4 flex items-center gap-3">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${cfg.header} text-xl text-white shadow-lg`}
        >
          {cfg.emoji}
        </span>
        <h2 className="text-lg font-bold text-content">{title}</h2>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-content-muted">No items.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li
              key={idx}
              className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm leading-relaxed ${cfg.chip}`}
            >
              <span className="mt-0.5 select-none text-xs font-bold opacity-60">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackList | null>(null);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        setFeedback(JSON.parse(raw) as FeedbackList);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  return (
    <PageContainer className="max-w-4xl">
      <div className="space-y-8">
        <div className="animate-fade-up space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-content sm:text-3xl">
            Interview <span className="gradient-text">feedback</span>
          </h1>
          <p className="text-sm text-content-muted sm:text-base">
            {feedback
              ? "Here is your structured feedback from the completed interview."
              : "Complete an interview to see your structured feedback here."}
          </p>
        </div>

        {feedback ? (
          <>
            <section className="animate-fade-up relative overflow-hidden rounded-2xl border border-white/50 bg-gradient-to-r from-indigo-500/10 via-white/70 to-fuchsia-500/10 p-6 shadow-card backdrop-blur">
              <span className="absolute -top-6 -right-6 text-8xl opacity-10">
                📝
              </span>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-hero-gradient text-xl text-white shadow-glow">
                  📊
                </span>
                <h2 className="text-lg font-bold text-content">Summary</h2>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-content">
                {feedback.summary}
              </p>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              <FeedbackList
                title="Strengths"
                items={feedback.strengths}
                tone="positive"
              />
              <FeedbackList
                title="Areas to improve"
                items={feedback.gaps}
                tone="warning"
              />
            </div>

            <FeedbackList
              title="Recommended next steps"
              items={feedback.next}
              tone="info"
            />
          </>
        ) : (
          <section className="animate-fade-up rounded-2xl border border-dashed border-accent/40 bg-white/70 p-10 text-center backdrop-blur">
            <div className="mx-auto mb-4 flex h-16 w-16 animate-float items-center justify-center rounded-2xl bg-hero-gradient text-3xl text-white shadow-glow">
              💬
            </div>
            <p className="text-content-muted">
              No completed interview found yet. Start an interview to generate
              feedback.
            </p>
          </section>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href="/interview" variant="secondary">
            Back to interview
          </Button>
          <Button href="/">Return home</Button>
        </div>
      </div>
    </PageContainer>
  );
}
