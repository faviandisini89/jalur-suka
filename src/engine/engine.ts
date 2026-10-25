import { DIMS, DIM_INFO, type Dim, type Vector, type Weights } from "../data/dimensions";
import { PROGRAMS, type Program } from "../data/programs";
import { QUESTIONS, questionById, type Question } from "../data/questions";

export const TOTAL_QUESTIONS = 20;
const SCREENING_COUNT = 5;
const SHRINK_K = 0.8;
const UNCHOSEN_C = -0.6;
const AFFINITY_SIGNAL = 1.5;
const AFFINITY_MIX = 0.22;
const DIM_CAP = 5;

/** likert: 1..5; scenario: 0 or 1 (chosen option index) */
export interface Answer {
  qid: string;
  value: number;
}

export interface Evidence {
  sum: Record<Dim, number>;
  exposure: Record<Dim, number>;
  aff: Record<string, { sum: number; abs: number }>;
  asked: Set<string>;
}

const zero = (): Record<Dim, number> => Object.fromEntries(DIMS.map((d) => [d, 0])) as Record<Dim, number>;

// ───────── evidence ─────────
export function accumulate(answers: Answer[]): Evidence {
  const ev: Evidence = { sum: zero(), exposure: zero(), aff: {}, asked: new Set() };
  const addDims = (w: Weights, c: number) => {
    for (const d of DIMS) {
      const x = w[d];
      if (!x) continue;
      ev.sum[d] += c * x;
      ev.exposure[d] += Math.abs(x);
    }
  };
  const addAff = (a: Record<string, number> | undefined, c: number) => {
    if (!a) return;
    for (const [id, x] of Object.entries(a)) {
      const e = (ev.aff[id] ??= { sum: 0, abs: 0 });
      e.sum += c * x;
      e.abs += Math.abs(x);
    }
  };
  for (const a of answers) {
    const q = questionById(a.qid);
    if (!q) continue;
    ev.asked.add(q.id);
    if (q.type === "likert") {
      const c = (a.value - 3) / 2;
      addDims(q.weights, c);
      addAff(q.affinity, c);
    } else {
      q.options.forEach((o, i) => {
        const c = i === a.value ? 1 : UNCHOSEN_C;
        addDims(o.weights, c);
        addAff(o.affinity, c);
      });
    }
  }
  return ev;
}

/** estimated interest per dimension, 0..1 (0.5 = neutral / unknown) */
export function userVector(ev: Evidence): Vector {
  const v = {} as Vector;
  for (const d of DIMS) {
    const e = ev.exposure[d];
    if (e <= 1e-9) { v[d] = 0.5; continue; }
    const u = ev.sum[d] / e;
    const shrink = e / (e + SHRINK_K);
    v[d] = 0.5 + 0.5 * u * shrink;
  }
  return v;
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

function correlation(p: Vector, m: Vector): number {
  const pa = DIMS.map((d) => p[d]);
  const ma = DIMS.map((d) => m[d]);
  const pm = mean(pa), mm = mean(ma);
  let num = 0, dp = 0, dm = 0;
  for (let i = 0; i < pa.length; i++) {
    const x = pa[i] - pm, y = ma[i] - mm;
    num += x * y; dp += x * x; dm += y * y;
  }
  if (dp < 1e-9 || dm < 1e-9) return 0;
  return num / Math.sqrt(dp * dm);
}

export interface Ranked {
  program: Program;
  r: number;
  affinity: number;
  score: number; // -1..1
  percent: number; // 0..100
}

export function rankPrograms(ev: Evidence, uv: Vector = userVector(ev)): Ranked[] {
  const out = PROGRAMS.map((program) => {
    const r = correlation(uv, program.profile);
    const e = ev.aff[program.id];
    const affinity = e ? e.sum / (e.abs + 1) : 0;
    const score = (1 - AFFINITY_MIX) * r + AFFINITY_MIX * affinity;
    const percent = Math.round(Math.max(0, Math.min(1, (score + 0.25) / 1.25)) * 100);
    return { program, r, affinity, score, percent };
  });
  out.sort((a, b) => b.score - a.score);
  return out;
}

// ───────── question selection ─────────
function dot(w: Weights, prof: Vector): number {
  let s = 0;
  for (const d of DIMS) {
    const x = w[d];
    if (x) s += x * prof[d];
  }
  return s;
}

function signal(q: Question, p: Program): number {
  if (q.type === "likert") return dot(q.weights, p.profile) + AFFINITY_SIGNAL * (q.affinity?.[p.id] ?? 0);
  const [a, b] = q.options;
  return (dot(b.weights, p.profile) + AFFINITY_SIGNAL * (b.affinity?.[p.id] ?? 0))
       - (dot(a.weights, p.profile) + AFFINITY_SIGNAL * (a.affinity?.[p.id] ?? 0));
}

function variance(xs: number[]): number {
  const m = mean(xs);
  return mean(xs.map((x) => (x - m) ** 2));
}

export function primaryDim(q: Question): Dim {
  const acc = zero();
  const take = (w: Weights) => { for (const d of DIMS) acc[d] += Math.abs(w[d] ?? 0); };
  if (q.type === "likert") take(q.weights); else q.options.forEach((o) => take(o.weights));
  return DIMS.reduce((best, d) => (acc[d] > acc[best] ? d : best), DIMS[0]);
}

const PRIMARY = new Map<string, Dim>(QUESTIONS.map((q) => [q.id, primaryDim(q)]));

function affinityKeys(q: Question): string[] {
  const keys = new Set<string>();
  if (q.type === "likert") Object.keys(q.affinity ?? {}).forEach((k) => keys.add(k));
  else q.options.forEach((o) => Object.keys(o.affinity ?? {}).forEach((k) => keys.add(k)));
  return [...keys];
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function noise(seed: string, qid: string): number {
  return (hash(seed + ":" + qid) % 1000) / 1000; // 0..1
}

export type Phase = "screening" | "cluster" | "micro";
export const phaseFor = (n: number): Phase => (n < SCREENING_COUNT ? "screening" : n < 12 ? "cluster" : "micro");

export function nextQuestion(answers: Answer[], seed: string): Question | null {
  const n = answers.length;
  if (n >= TOTAL_QUESTIONS) return null;
  const ev = accumulate(answers);
  const uv = userVector(ev);
  const ranked = rankPrograms(ev, uv);

  const dimCount = zero();
  for (const id of ev.asked) dimCount[PRIMARY.get(id)!]++;

  let pool = QUESTIONS.filter((q) => !ev.asked.has(q.id) && (q.stage === "micro" || dimCount[PRIMARY.get(q.id)!] < DIM_CAP));

  let candidates: Program[];
  if (n < SCREENING_COUNT) {
    pool = pool.filter((q) => q.stage === "screening");
    candidates = PROGRAMS;
  } else {
    const K = n < 12 ? 8 : 5;
    candidates = ranked.slice(0, K).map((r) => r.program);
    const top8 = new Set(ranked.slice(0, 8).map((r) => r.program.id));
    pool = pool.filter((q) => {
      if (q.stage !== "micro") return true;
      if (n < 8) return false;
      return affinityKeys(q).some((k) => top8.has(k));
    });
    if (pool.length === 0) pool = QUESTIONS.filter((q) => !ev.asked.has(q.id));
  }

  const top5 = new Set(ranked.slice(0, 5).map((r) => r.program.id));
  let best: Question = pool[0];
  let bestScore = -Infinity;
  for (const q of pool) {
    const spread = variance(candidates.map((p) => signal(q, p)));
    const dim = PRIMARY.get(q.id)!;
    const novelty = 0.05 * (1 - ev.exposure[dim] / (ev.exposure[dim] + 2));
    const bonus = n >= 12 && affinityKeys(q).filter((k) => top5.has(k)).length >= 2 ? 0.12 : 0;
    const coverPenalty = n < SCREENING_COUNT && dimCount[dim] > 0 ? 0.35 : 0;
    const score = spread + novelty + bonus - coverPenalty + 0.015 * noise(seed, q.id);
    if (score > bestScore) { bestScore = score; best = q; }
  }
  return best;
}

// ───────── explanations ─────────
export interface Reason { dim: Dim; text: string }
export interface Caution { dim: Dim; text: string }

export function explain(program: Program, ev: Evidence, uv: Vector): { reasons: Reason[]; cautions: Caution[] } {
  const mm = mean(DIMS.map((d) => program.profile[d]));
  const contrib = DIMS
    .map((d) => ({ d, c: (uv[d] - 0.5) * (program.profile[d] - mm) }))
    .filter((x) => uv[x.d] >= 0.55 && program.profile[x.d] >= 0.45)
    .sort((a, b) => b.c - a.c)
    .slice(0, 3);
  const reasons: Reason[] = contrib.map(({ d }) => ({
    dim: d,
    text: `Kamu ${DIM_INFO[d].user}, dan ${program.name} menuntut ${DIM_INFO[d].demand}.`,
  }));
  const cautions: Caution[] = DIMS
    .filter((d) => program.profile[d] >= 0.65 && uv[d] <= 0.4 && ev.exposure[d] >= 1)
    .sort((a, b) => program.profile[b] - program.profile[a])
    .slice(0, 2)
    .map((d) => ({
      dim: d,
      text: `Prodi ini cukup menuntut ${DIM_INFO[d].demand}, sementara jawabanmu menunjukkan minat yang lebih rendah di sana.`,
    }));
  return { reasons, cautions };
}

// ───────── session helpers ─────────
export function topIdsAfter(answers: Answer[], k = 3): string[] {
  const ev = accumulate(answers);
  return rankPrograms(ev).slice(0, k).map((r) => r.program.id);
}

/** early-finish hint: ≥15 answers, top-1 leads top-2 by ≥8 points, top-3 unchanged for last 3 answers */
export function canFinishEarly(answers: Answer[]): boolean {
  const n = answers.length;
  if (n < 15 || n >= TOTAL_QUESTIONS) return false;
  const ranked = rankPrograms(accumulate(answers));
  if (ranked[0].percent - ranked[1].percent < 8) return false;
  const now = topIdsAfter(answers).join();
  for (let back = 1; back <= 2; back++) {
    if (topIdsAfter(answers.slice(0, n - back)).join() !== now) return false;
  }
  return true;
}

/** which faculty currently leads (for the route progress colour) */
export function leadingFaculty(answers: Answer[]): string | null {
  if (answers.length < 3) return null;
  const ranked = rankPrograms(accumulate(answers));
  const tally: Record<string, number> = {};
  ranked.slice(0, 5).forEach((r, i) => { tally[r.program.facultyId] = (tally[r.program.facultyId] ?? 0) + (5 - i); });
  return Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0];
}
