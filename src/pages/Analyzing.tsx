import { useEffect } from "react";
import { DIMS, DIM_INFO } from "../data/dimensions";
import { go } from "../lib/router";
import { useSession } from "../lib/session";

export function Analyzing() {
  const { result, session } = useSession();
  useEffect(() => {
    if (!session || !result) { go("/tes"); return; }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => go("/hasil"), reduce ? 300 : 2400);
    return () => window.clearTimeout(t);
  }, [session, result]);
  if (!result) return <div className="shell page" />;
  const dims = [...DIMS].sort((a, b) => result.vector[b] - result.vector[a]).slice(0, 5);
  return (
    <div className="shell page">
      <div className="analyse" role="status" aria-live="polite">
        <h2>Menghitung rutemu</h2>
        <p className="notice">Mencocokkan minatmu dengan 41 prodi.</p>
        <div className="meter">
          {dims.map((d, i) => (
            <div key={d} style={{ ["--i" as string]: i, ["--w" as string]: `${Math.round(result.vector[d] * 100)}%` }}>
              <em>{DIM_INFO[d].short}</em>
              <span className="track"><i /></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
