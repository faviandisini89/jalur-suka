import { DIMS, type Dim } from "../data/dimensions";
import type { Question } from "../data/questions";
import { accumulate, nextQuestion, rankPrograms, TOTAL_QUESTIONS, type Answer, type Ranked } from "./engine";

export type Pref = Partial<Record<Dim, number>>; // -1..1

export interface Persona {
  id: string;
  name: string;
  blurb: string;
  pref: Pref;
  expected: string[]; // program ids; pass if any appears in top 3
}

const base = (over: Pref, fill = -0.5): Pref =>
  Object.fromEntries(DIMS.map((d) => [d, over[d] ?? fill])) as Pref;

export const PERSONAS: Persona[] = [
  { id: "coder", name: "Pecinta kode dan data", blurb: "Logika dan teknologi tinggi, minat sosial rendah", pref: base({ ANA: 1, TEK: 1, KON: 0.3, KEI: 0.2, KRE: 0.2, ENT: 0.1 }, -0.6), expected: ["ti", "mat", "tind"] },
  { id: "teacher", name: "Calon pendidik", blurb: "Mengajar dan sosial tinggi", pref: base({ MEN: 1, SOS: 0.7, SPI: 0.4, KRE: 0.3 }, -0.4), expected: ["pai", "pgmi", "pgra", "pba", "ki"] },
  { id: "debater", name: "Pendebat dan peminat aturan", blurb: "Hukum dan riset tinggi", pref: base({ HUK: 1, KEI: 0.6, SOS: 0.2, ANA: 0.3 }, -0.5), expected: ["ih", "siyasah", "ahwal", "muamalat", "pmz"] },
  { id: "creator", name: "Kreator dan komunikator", blurb: "Kreatif, bisnis, dan sosial tinggi", pref: base({ KRE: 1, ENT: 0.6, SOS: 0.5, TEK: 0.2 }, -0.5), expected: ["ikom", "kpi"] },
  { id: "scholar", name: "Penelaah teks keagamaan", blurb: "Spiritual dan riset tinggi", pref: base({ SPI: 1, KEI: 0.9 }, -0.5), expected: ["iat", "hadis", "akf", "pmz"] },
  { id: "finance", name: "Pengelola keuangan", blurb: "Teliti, bisnis, dan analitis tinggi", pref: base({ ENT: 0.7, KON: 1, ANA: 0.7 }, -0.5), expected: ["pbs", "aks", "mks", "es"] },
  { id: "sci-teacher", name: "Calon guru sains", blurb: "Mengajar dan analitis tinggi", pref: base({ MEN: 1, ANA: 0.8, SOS: 0.3, KEI: 0.2 }, -0.5), expected: ["pmat", "pfis", "pkim", "pbio"] },
  { id: "sci-researcher", name: "Peneliti sains murni", blurb: "Analitis dan riset tinggi, tidak ingin mengajar", pref: base({ ANA: 1, KEI: 0.8, TEK: 0.6, MEN: -0.9 }, -0.5), expected: ["mat", "fis", "kim", "bio"] },
  { id: "social-helper", name: "Pendamping sosial", blurb: "Sosial dan spiritual tinggi", pref: base({ SOS: 1, SPI: 0.4, ENT: 0.3 }, -0.5), expected: ["bpi", "pmi", "iks"] },
];

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

function sig(w: Partial<Record<Dim, number>>, pref: Pref): number {
  let s = 0, abs = 0;
  for (const d of DIMS) {
    const x = w[d];
    if (!x) continue;
    s += x * (pref[d] ?? 0); abs += Math.abs(x);
  }
  return abs ? s / abs : 0;
}

/** domain interest: persona likes some programs; affinity questions about other programs pull the answer down */
function domainShift(aff: Record<string, number> | undefined, likes: string[] | undefined): number {
  if (!aff || !likes) return 0;
  const entries = Object.entries(aff).filter(([, v]) => v > 0);
  if (entries.length === 0) return 0;
  const hit = Math.max(0, ...entries.filter(([k]) => likes.includes(k)).map(([, v]) => v));
  return hit > 0 ? 0.5 * hit : -0.6;
}

export function respond(q: Question, pref: Pref, likes?: string[]): number {
  if (q.type === "likert") return clamp(Math.round(3 + 2 * clamp(sig(q.weights, pref) + domainShift(q.affinity, likes), -1, 1)), 1, 5);
  const [a, b] = q.options;
  const sa = sig(a.weights, pref) + domainShift(a.affinity, likes);
  const sb = sig(b.weights, pref) + domainShift(b.affinity, likes);
  return sb > sa ? 1 : 0;
}

export function respondRandom(q: Question, rnd: () => number): number {
  return q.type === "likert" ? 1 + Math.floor(rnd() * 5) : rnd() < 0.5 ? 0 : 1;
}

export function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function runSession(seed: string, answerFn: (q: Question) => number): { answers: Answer[]; ranked: Ranked[] } {
  const answers: Answer[] = [];
  for (let i = 0; i < TOTAL_QUESTIONS; i++) {
    const q = nextQuestion(answers, seed);
    if (!q) break;
    answers.push({ qid: q.id, value: answerFn(q) });
  }
  return { answers, ranked: rankPrograms(accumulate(answers)) };
}

export interface PersonaResult { persona: Persona; top3: Ranked[]; pass: boolean }

export function runPersona(persona: Persona): PersonaResult {
  const { ranked } = runSession("persona:" + persona.id, (q) => respond(q, persona.pref, persona.expected));
  const top3 = ranked.slice(0, 3);
  return { persona, top3, pass: top3.some((r) => persona.expected.includes(r.program.id)) };
}

export function runRandom(seed: number): Ranked[] {
  const rnd = mulberry32(seed);
  return runSession("rnd:" + seed, (q) => respondRandom(q, rnd)).ranked;
}
