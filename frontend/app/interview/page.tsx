"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import {
  continueInterview,
  fetchCandidates,
  startInterview,
} from "@/lib/api";
import type {
  Candidate,
  ChatMessage,
  Feedback,
  InterviewResponse,
} from "@/types/interview";

const FEEDBACK_STORAGE_KEY = "ai-interview-feedback";

function persistFeedback(feedback: Feedback) {
  try {
    window.sessionStorage.setItem(
      FEEDBACK_STORAGE_KEY,
      JSON.stringify(feedback),
    );
  } catch {
    // ignore storage errors
  }
}

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// Simple deterministic avatar color from name
function avatarColor(name: string): string {
  const gradients = [
    "from-indigo-500 to-violet-500",
    "from-violet-500 to-fuchsia-500",
    "from-fuchsia-500 to-pink-500",
    "from-blue-500 to-indigo-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return gradients[sum % gradients.length];
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function InterviewPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null,
  );

  const [sessionId] = useState<string>(generateSessionId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Load the candidate roster on mount.
  useEffect(() => {
    let active = true;
    fetchCandidates()
      .then((list) => {
        if (active) setCandidates(list);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load candidate profiles.",
          );
        }
      })
      .finally(() => {
        if (active) setLoadingCandidates(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Keep the transcript scrolled to the bottom.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const pushInterviewer = useCallback((reply: string) => {
    setMessages((prev) => [...prev, { role: "interviewer", content: reply }]);
  }, []);

  const pushCandidate = useCallback((content: string) => {
    setMessages((prev) => [...prev, { role: "candidate", content }]);
  }, []);

  const beginInterview = useCallback(
    async (candidate: Candidate) => {
      setError(null);
      setLoadingCandidates(false);
      setSelectedCandidate(candidate);
      setThinking(true);
      try {
        const res: InterviewResponse = await startInterview(
          sessionId,
          candidate,
        );
        pushInterviewer(res.reply);
        if (res.done && res.feedback) {
          setFeedback(res.feedback);
          persistFeedback(res.feedback);
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Could not start the interview.",
        );
      } finally {
        setThinking(false);
      }
    },
    [sessionId, pushInterviewer],
  );

  const sendMessage = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || thinking || feedback) return;

      pushCandidate(trimmed);
      setInput("");
      setThinking(true);
      setError(null);

      try {
        const res: InterviewResponse = await continueInterview(
          sessionId,
          trimmed,
        );
        pushInterviewer(res.reply);
        if (res.done && res.feedback) {
          setFeedback(res.feedback);
          persistFeedback(res.feedback);
        }
      } catch (err: unknown) {
        pushInterviewer(
          "Sorry, something went wrong while processing your response. Please try again.",
        );
        setError(
          err instanceof Error ? err.message : "Could not continue the interview.",
        );
      } finally {
        setThinking(false);
      }
    },
    [input, thinking, feedback, sessionId, pushCandidate, pushInterviewer],
  );

  const resetInterview = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <PageContainer className="max-w-4xl">
      <div className="space-y-6">
        <div className="animate-fade-up space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-content sm:text-3xl">
            Interview
          </h1>
          <p className="text-sm text-content-muted sm:text-base">
            {selectedCandidate
              ? `Interviewing ${selectedCandidate.member.name} (${selectedCandidate.member.jobRole})`
              : "Select a candidate to begin a live AI interview."}
          </p>
        </div>

        {error ? (
          <div className="animate-fade-in rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        ) : null}

        {/* Candidate selection */}
        {!selectedCandidate ? (
          <section className="animate-fade-up rounded-2xl border border-white/50 bg-white/70 p-6 shadow-card backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-hero-gradient text-xl shadow-glow">
                👥
              </span>
              <div>
                <h2 className="text-lg font-bold text-content">
                  Choose a candidate
                </h2>
                <p className="text-sm text-content-muted">
                  Pick a profile to start the interview flow.
                </p>
              </div>
            </div>

            {loadingCandidates ? (
              <div className="mt-6 flex items-center justify-center gap-3 py-8 text-sm text-content-muted">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                Loading candidates…
              </div>
            ) : (
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {candidates.map((c, idx) => (
                  <li key={c.member.id} className="animate-fade-up" style={{ animationDelay: `${idx * 40}ms` }}>
                    <button
                      type="button"
                      onClick={() => beginInterview(c)}
                      className="group flex w-full items-center gap-3 rounded-xl border border-border bg-surface-muted p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:bg-hero-gradient hover:text-white hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarColor(
                          c.member.name,
                        )} text-sm font-bold text-white shadow-sm transition-transform duration-300 group-hover:scale-110`}
                      >
                        {initials(c.member.name)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">
                          {c.member.name}
                        </span>
                        <span className="mt-0.5 block truncate text-xs opacity-80">
                          {c.member.jobRole} · {c.member.yearsExperience} yrs
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : (
          <>
            {/* Chat transcript */}
            <section className="animate-fade-up flex h-[28rem] flex-col overflow-hidden rounded-2xl border border-white/50 bg-white/70 shadow-card backdrop-blur">
              {/* Chat header */}
              <div className="flex items-center justify-between border-b border-border bg-white/50 px-5 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${avatarColor(
                      selectedCandidate.member.name,
                    )} text-xs font-bold text-white`}
                  >
                    {initials(selectedCandidate.member.name)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-content">
                      {selectedCandidate.member.name}
                    </p>
                    <p className="text-xs text-content-muted">
                      AI Interview in progress
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Live
                </span>
              </div>

              <div
                ref={scrollRef}
                className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6"
              >
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex items-end gap-2 ${
                      m.role === "candidate" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {m.role === "interviewer" ? (
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-hero-gradient text-xs text-white shadow-sm">
                        AI
                      </span>
                    ) : null}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                        m.role === "candidate"
                          ? "rounded-br-md bg-hero-gradient text-white"
                          : "rounded-bl-md bg-surface-muted text-content"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {thinking ? (
                  <div className="flex items-end gap-2 justify-start">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-hero-gradient text-xs text-white shadow-sm">
                      AI
                    </span>
                    <div className="flex gap-1.5 rounded-2xl rounded-bl-md bg-surface-muted px-4 py-3.5">
                      {[0, 1, 2].map((d) => (
                        <span
                          key={d}
                          className="h-2 w-2 animate-bounce rounded-full bg-accent"
                          style={{ animationDelay: `${d * 150}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Feedback action after completion */}
              {feedback ? (
                <div className="border-t border-border bg-white/50 p-4">
                  <p className="mb-3 text-sm text-content-muted">
                    🎉 The interview is complete. Review your structured
                    feedback.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button href="/feedback">View feedback</Button>
                    <Button variant="secondary" onClick={resetInterview}>
                      Start a new interview
                    </Button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={sendMessage}
                  className="flex items-center gap-2 border-t border-border bg-white/50 p-3"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your answer…"
                    disabled={thinking}
                    className="flex-1 rounded-xl border border-border bg-surface-muted px-4 py-2.5 text-sm text-content placeholder:text-content-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={thinking || !input.trim()}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-hero-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow-lg disabled:pointer-events-none disabled:opacity-50 active:scale-95"
                  >
                    Send
                    <span aria-hidden>➤</span>
                  </button>
                </form>
              )}
            </section>

            {/* Session controls */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button href="/feedback" variant="secondary">
                Go to feedback
              </Button>
              <Button variant="ghost" onClick={resetInterview}>
                Reset session
              </Button>
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}
