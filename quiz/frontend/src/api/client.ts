import type { ListResponse, Problem, GradeResponse } from "../types";

const BASE = "/api";

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export interface ListParams {
  q?: string;
  difficulty?: string;
  topic?: string;
  limit?: number;
  offset?: number;
}

export function listProblems(params: ListParams = {}): Promise<ListResponse> {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.difficulty) sp.set("difficulty", params.difficulty);
  if (params.topic) sp.set("topic", params.topic);
  if (params.limit) sp.set("limit", String(params.limit));
  if (params.offset) sp.set("offset", String(params.offset));
  return fetchJSON<ListResponse>(`${BASE}/problems?${sp}`);
}

export function getProblem(id: number): Promise<Problem> {
  return fetchJSON<Problem>(`${BASE}/problems/${id}`);
}

export function listTopics(): Promise<string[]> {
  return fetchJSON<string[]>(`${BASE}/topics`);
}

export interface SmokeResponse {
  ok: boolean;
  model_reply?: string;
  error?: string;
}

export function smokeTest(): Promise<SmokeResponse> {
  return fetchJSON<SmokeResponse>(`${BASE}/smoke`);
}

export function gradeAnswer(
  problemId: number,
  answer: string,
): Promise<GradeResponse> {
  return fetchJSON<GradeResponse>(`${BASE}/grade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ problem_id: problemId, answer }),
  });
}
