import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { accumulate, rankPrograms, type Answer, type Ranked, userVector } from "../engine/engine";
import type { Vector } from "../data/dimensions";
import { load, save, remove } from "./storage";

export interface Session {
  id: string;
  seed: string;
  startedAt: number;
  answers: Answer[];
  finishedAt?: number;
}

export interface HistoryEntry {
  id: string;
  finishedAt: number;
  top: { id: string; percent: number }[];
}

const KEY = "jalursuka:session:v1";
const HKEY = "jalursuka:history:v1";

const newSession = (): Session => {
  const id = Math.random().toString(36).slice(2, 10);
  return { id, seed: id, startedAt: Date.now(), answers: [] };
};

interface Ctx {
  session: Session | null;
  history: HistoryEntry[];
  start: () => void;
  answer: (qid: string, value: number) => void;
  back: () => void;
  finish: () => void;
  reset: () => void;
  result: { ranked: Ranked[]; vector: Vector } | null;
}

const SessionCtx = createContext<Ctx | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => load<Session | null>(KEY, null));
  const [history, setHistory] = useState<HistoryEntry[]>(() => load<HistoryEntry[]>(HKEY, []));

  useEffect(() => {
    if (session) save(KEY, session);
    else remove(KEY);
  }, [session]);

  const start = useCallback(() => setSession(newSession()), []);
  const answer = useCallback((qid: string, value: number) => {
    setSession((s) => (s ? { ...s, answers: [...s.answers.filter((a) => a.qid !== qid), { qid, value }] } : s));
  }, []);
  const back = useCallback(() => {
    setSession((s) => (s && s.answers.length ? { ...s, answers: s.answers.slice(0, -1), finishedAt: undefined } : s));
  }, []);
  const finish = useCallback(() => {
    setSession((s) => {
      if (!s || s.finishedAt) return s;
      const done = { ...s, finishedAt: Date.now() };
      const ranked = rankPrograms(accumulate(done.answers));
      setHistory((h) => {
        const next = [{ id: s.id, finishedAt: done.finishedAt!, top: ranked.slice(0, 3).map((r) => ({ id: r.program.id, percent: r.percent })) }, ...h.filter((x) => x.id !== s.id)].slice(0, 6);
        save(HKEY, next);
        return next;
      });
      return done;
    });
  }, []);
  const reset = useCallback(() => setSession(null), []);

  const result = useMemo(() => {
    if (!session || session.answers.length === 0) return null;
    const ev = accumulate(session.answers);
    const vector = userVector(ev);
    return { ranked: rankPrograms(ev, vector), vector };
  }, [session]);

  const value = useMemo(() => ({ session, history, start, answer, back, finish, reset, result }), [session, history, start, answer, back, finish, reset, result]);
  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>;
}

export function useSession(): Ctx {
  const c = useContext(SessionCtx);
  if (!c) throw new Error("SessionProvider missing");
  return c;
}
