import type {
  Candidate,
  InterviewRequest,
  InterviewResponse,
} from "@/types/interview";

/** Base URL of the FastAPI backend. */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (body?.detail) detail = body.detail;
    } catch {
      // ignore body parse errors
    }
    throw new Error(detail);
  }
  return (await res.json()) as T;
}

/** Start a new interview session with a candidate profile. */
export async function startInterview(
  sessionId: string,
  candidate: Candidate,
): Promise<InterviewResponse> {
  const res = await fetch(`${API_BASE_URL}/api/interview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, candidate } satisfies InterviewRequest),
  });
  return handleResponse<InterviewResponse>(res);
}

/** Continue an existing interview session with a candidate message. */
export async function continueInterview(
  sessionId: string,
  message: string,
): Promise<InterviewResponse> {
  const res = await fetch(`${API_BASE_URL}/api/interview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, message } satisfies InterviewRequest),
  });
  return handleResponse<InterviewResponse>(res);
}

/** Fetch the list of available candidate profiles. */
export async function fetchCandidates(): Promise<Candidate[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/candidates`);
  return handleResponse<Candidate[]>(res);
}
