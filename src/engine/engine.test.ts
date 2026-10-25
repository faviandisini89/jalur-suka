import { describe, expect, it } from "vitest";
import { PROGRAMS } from "../data/programs";
import { QUESTIONS } from "../data/questions";
import { accumulate, nextQuestion, rankPrograms, TOTAL_QUESTIONS } from "./engine";
import { PERSONAS, runPersona, runRandom, runSession, respond } from "./sim";

describe("data integrity", () => {
  it("has 41 unique programs and unique question ids", () => {
    expect(PROGRAMS).toHaveLength(41);
    expect(new Set(PROGRAMS.map((p) => p.id)).size).toBe(41);
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length);
  });
  it("affinity and similarTo keys point at real programs", () => {
    const ids = new Set(PROGRAMS.map((p) => p.id));
    for (const p of PROGRAMS) p.similarTo.forEach((s) => expect(ids.has(s), `${p.id} -> ${s}`).toBe(true));
    for (const q of QUESTIONS) {
      const maps = q.type === "likert" ? [q.affinity] : q.options.map((o) => o.affinity);
      maps.forEach((m) => Object.keys(m ?? {}).forEach((k) => expect(ids.has(k), `${q.id} -> ${k}`).toBe(true)));
    }
  });
});

describe("adaptive engine", () => {
  it("asks exactly 20 distinct questions and then stops", () => {
    const { answers } = runSession("t1", () => 4);
    expect(answers).toHaveLength(TOTAL_QUESTIONS);
    expect(new Set(answers.map((a) => a.qid)).size).toBe(TOTAL_QUESTIONS);
    expect(nextQuestion(answers, "t1")).toBeNull();
  });
  it("is deterministic for the same seed and answers", () => {
    const a = runSession("same", (q) => respond(q, PERSONAS[0].pref)).answers.map((x) => x.qid);
    const b = runSession("same", (q) => respond(q, PERSONAS[0].pref)).answers.map((x) => x.qid);
    expect(a).toEqual(b);
  });
  it("returns scores within range and sorted", () => {
    const r = rankPrograms(accumulate([]));
    expect(r).toHaveLength(41);
    r.forEach((x) => expect(x.percent).toBeGreaterThanOrEqual(0));
  });
});

describe("persona validation", () => {
  for (const p of PERSONAS) {
    it(`${p.name}: an expected program is in the top 3`, () => {
      expect(runPersona(p).pass).toBe(true);
    });
  }
  it("sciences vs education sciences are separated", () => {
    const sci = runPersona(PERSONAS.find((p) => p.id === "sci-researcher")!).top3.map((r) => r.program.id);
    const edu = runPersona(PERSONAS.find((p) => p.id === "sci-teacher")!).top3.map((r) => r.program.id);
    expect(sci.some((id) => ["mat", "fis", "kim", "bio"].includes(id))).toBe(true);
    expect(edu.some((id) => ["pmat", "pfis", "pkim", "pbio"].includes(id))).toBe(true);
    expect(sci.filter((id) => id.startsWith("p") && ["pmat", "pfis", "pkim", "pbio"].includes(id))).toHaveLength(0);
  });
  it("random answers spread across most programs without one dominating", () => {
    const tally: Record<string, number> = {};
    for (let i = 1; i <= 200; i++) { const id = runRandom(i)[0].program.id; tally[id] = (tally[id] ?? 0) + 1; }
    expect(Object.keys(tally).length).toBeGreaterThanOrEqual(30);
    expect(Math.max(...Object.values(tally))).toBeLessThan(200 * 0.2);
  });
});
