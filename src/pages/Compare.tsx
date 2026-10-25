import { useMemo } from "react";
import { Bullet } from "../components/app/Bullet";
import { Legend, Radar } from "../components/app/Radar";
import { DIMS, DIM_INFO } from "../data/dimensions";
import { FACULTIES, facultyById } from "../data/faculties";
import { PROGRAMS, programById, programsOf } from "../data/programs";
import { go, href, type Route } from "../lib/router";
import { useSession } from "../lib/session";

export function Compare({ route }: { route: Route }) {
  const { result } = useSession();
  const defA = result?.ranked[0].program.id ?? "bio";
  const defB = result?.ranked[1].program.id ?? "pbio";
  const aId = route.query.get("a") ?? defA;
  const bId = route.query.get("b") ?? defB;
  const a = programById(aId) ?? programById(defA)!;
  const b = programById(bId) ?? programById(defB)!;
  const fa = facultyById(a.facultyId), fb = facultyById(b.facultyId);

  const diffs = useMemo(
    () =>
      DIMS.map((d) => ({ d, delta: a.profile[d] - b.profile[d] }))
        .filter((x) => Math.abs(x.delta) >= 0.2)
        .sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta))
        .slice(0, 4),
    [a, b],
  );

  const set = (k: "a" | "b", v: string) => go(`/bandingkan?a=${k === "a" ? v : a.id}&b=${k === "b" ? v : b.id}`);
  const ra = result?.ranked.find((r) => r.program.id === a.id);
  const rb = result?.ranked.find((r) => r.program.id === b.id);

  const Picker = ({ k, cur, fac }: { k: "a" | "b"; cur: string; fac: string }) => (
    <label data-fac={fac}>
      <span className="h-sec" style={{ display: "block" }}>Prodi {k === "a" ? "pertama" : "kedua"}</span>
      <select className="select" value={cur} onChange={(e) => set(k, e.target.value)}>
        {FACULTIES.map((f) => (
          <optgroup key={f.id} label={f.code}>
            {programsOf(f.id).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </optgroup>
        ))}
      </select>
    </label>
  );

  return (
    <div className="shell page">
      <div className="page-head">
        <div>
          <h1>Bandingkan dua prodi</h1>
          <p>Lihat apa yang membedakan prodi yang mirip, mulai dari minat yang dituntut sampai gambaran kariernya.</p>
        </div>
      </div>

      <div className="pick">
        <Picker k="a" cur={a.id} fac={a.facultyId} />
        <Picker k="b" cur={b.id} fac={b.facultyId} />
      </div>

      <div className="result-grid" style={{ marginTop: 24 }}>
        <section className="panel">
          <h2 className="h-sec">Profil minat</h2>
          <Radar title={`Profil minat ${a.name} dan ${b.name}`} series={[
            { label: a.name, values: a.profile, color: `var(--${fa.color})` },
            { label: b.name, values: b.profile, color: `var(--${fb.color})`, dashed: a.facultyId === b.facultyId },
          ]} />
          <Legend items={[{ label: a.name, color: `var(--${fa.color})` }, { label: b.name, color: `var(--${fb.color})` }]} />
        </section>
        <section className="panel">
          <h2 className="h-sec">Yang membedakan</h2>
          {diffs.length === 0 ? (
            <p>Kedua prodi ini punya profil minat yang sangat mirip. Bedanya lebih banyak pada topik dan karier di bawah.</p>
          ) : (
            <ul className="diff">
              {diffs.map(({ d, delta }) => {
                const hi = delta > 0 ? a : b, lo = delta > 0 ? b : a;
                return (
                  <li key={d}>
                    <b>{hi.name}</b> lebih menuntut <b>{DIM_INFO[d].name.toLowerCase()}</b> daripada {lo.name}
                    <span className="num" style={{ color: "var(--ink-3)" }}> ({Math.round(hi.profile[d] * 100)} berbanding {Math.round(lo.profile[d] * 100)})</span>.
                  </li>
                );
              })}
            </ul>
          )}
          {ra && rb && <p className="notice" style={{ marginTop: 14 }}>Dari tesmu: {a.name} {ra.percent}%, {b.name} {rb.percent}%.</p>}
        </section>
      </div>

      <div className="cmp">
        {[a, b].map((p) => (
          <div key={p.id + "h"} data-fac={p.facultyId}>
            <Bullet facultyId={p.facultyId} full />
            <h3 style={{ fontSize: 24, marginTop: 10 }}>{p.name}</h3>
            <p style={{ marginTop: 8, color: "var(--ink-2)" }}>{p.summary}</p>
            <a className="btn btn-sm" style={{ marginTop: 12 }} href={href(`/prodi/${p.id}`)}>Detail prodi</a>
          </div>
        ))}
        {[a, b].map((p) => (
          <div key={p.id + "t"}><h4>Yang dipelajari</h4><ul className="plain-list">{p.topics.map((t) => <li key={t}>{t}</li>)}</ul></div>
        ))}
        {[a, b].map((p) => (
          <div key={p.id + "c"}><h4>Contoh jalur karier</h4><ul className="plain-list">{p.careers.map((t) => <li key={t}>{t}</li>)}</ul></div>
        ))}
        {[a, b].map((p) => (
          <div key={p.id + "d"}><h4>Sehari sebagai mahasiswa</h4><p>{p.dayInLife}</p></div>
        ))}
      </div>
      <p className="notice" style={{ marginTop: 18 }}>Ada {PROGRAMS.length} prodi yang bisa dibandingkan; ganti pilihan di atas kapan saja.</p>
    </div>
  );
}
