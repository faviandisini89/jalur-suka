import { useEffect, useMemo, useRef, useState } from "react";
import { DIMS } from "../data/dimensions";
import { FACULTIES, facultyById } from "../data/faculties";
import { PROGRAMS, programById } from "../data/programs";
import { QUESTIONS } from "../data/questions";
import { PERSONAS, runPersona, runRandom, type PersonaResult } from "../engine/sim";
import { href } from "../lib/router";
import { useSession } from "../lib/session";

const N_SIM = 300;

export function Lab() {
  const { history } = useSession();
  const [personas, setPersonas] = useState<PersonaResult[] | null>(null);
  const [tally, setTally] = useState<Record<string, number> | null>(null);
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const cancel = useRef(false);

  useEffect(() => {
    const t = window.setTimeout(() => setPersonas(PERSONAS.map(runPersona)), 30);
    return () => window.clearTimeout(t);
  }, []);
  useEffect(() => () => { cancel.current = true; }, []);

  const run = () => {
    cancel.current = false;
    setRunning(true); setProgress(0); setTally(null);
    const acc: Record<string, number> = {};
    let i = 0;
    const step = () => {
      if (cancel.current) return;
      const end = Math.min(i + 20, N_SIM);
      for (; i < end; i++) {
        const id = runRandom(i + 1)[0].program.id;
        acc[id] = (acc[id] ?? 0) + 1;
      }
      setProgress(i);
      if (i < N_SIM) window.setTimeout(step, 0);
      else { setTally({ ...acc }); setRunning(false); }
    };
    window.setTimeout(step, 0);
  };

  const byStage = useMemo(() => ({
    screening: QUESTIONS.filter((q) => q.stage === "screening").length,
    cluster: QUESTIONS.filter((q) => q.stage === "cluster").length,
    micro: QUESTIONS.filter((q) => q.stage === "micro").length,
    scenario: QUESTIONS.filter((q) => q.type === "scenario").length,
  }), []);

  const passed = personas?.filter((p) => p.pass).length ?? 0;
  const sorted = tally ? PROGRAMS.map((p) => ({ p, n: tally[p.id] ?? 0 })).sort((a, b) => b.n - a.n) : [];
  const distinct = sorted.filter((x) => x.n > 0).length;
  const top3share = sorted.slice(0, 3).reduce((s, x) => s + x.n, 0) / N_SIM;
  const max = sorted[0]?.n ?? 1;

  return (
    <div className="shell page">
      <div className="page-head">
        <div>
          <h1>Uji engine</h1>
          <p>Halaman ini memeriksa mesin rekomendasi langsung di browsermu: kelengkapan data, uji persona, dan simulasi jawaban acak. Tujuannya agar hasil tes bisa dipertanggungjawabkan.</p>
        </div>
      </div>

      <section className="sec" style={{ marginTop: 0 }}>
        <h2>Isi data</h2>
        <div className="stat-row">
          <div className="stat"><b className="num">{PROGRAMS.length}</b><span>prodi S1 di {FACULTIES.length} fakultas</span></div>
          <div className="stat"><b className="num">{QUESTIONS.length}</b><span>soal di bank ({byStage.scenario} soal skenario)</span></div>
          <div className="stat"><b className="num">{DIMS.length}</b><span>dimensi minat</span></div>
          <div className="stat"><b className="num">{byStage.screening} / {byStage.cluster} / {byStage.micro}</b><span>soal screening, cluster, micro</span></div>
        </div>
      </section>

      <section className="sec">
        <h2>Uji persona</h2>
        <p className="notice" style={{ marginBottom: 10 }}>Tiap persona menjawab {20} soal secara konsisten dengan profil minatnya. Lolos bila salah satu prodi yang diharapkan masuk tiga besar.</p>
        <div className="panel tbl-wrap">
          {!personas ? <p>Menjalankan uji...</p> : (
            <table className="tbl">
              <thead><tr><th>Persona</th><th>Tiga besar hasil</th><th>Status</th></tr></thead>
              <tbody>
                {personas.map(({ persona, top3, pass }) => (
                  <tr key={persona.id}>
                    <td><b>{persona.name}</b><br /><span className="notice">{persona.blurb}</span></td>
                    <td>{top3.map((r) => (<div key={r.program.id}>{r.program.name} <span className="num" style={{ color: "var(--ink-3)" }}>{r.percent}%</span></div>))}</td>
                    <td><span className={"pass" + (pass ? "" : " fail")}>{pass ? "Lolos" : "Gagal"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {personas && <p className="notice" style={{ marginTop: 8 }}>{passed} dari {personas.length} persona lolos.</p>}
      </section>

      <section className="sec">
        <h2>Simulasi jawaban acak</h2>
        <p className="notice" style={{ marginBottom: 12 }}>Menjalankan {N_SIM} responden fiktif yang menjawab secara acak, lalu menghitung prodi yang muncul di peringkat pertama. Hasil yang sehat menyebar ke banyak prodi dan tidak didominasi satu atau dua prodi.</p>
        <button className="btn btn-primary" onClick={run} disabled={running}>{running ? `Berjalan ${progress}/${N_SIM}` : tally ? "Jalankan ulang" : "Jalankan simulasi"}</button>
        {tally && (
          <div className="panel" style={{ marginTop: 16 }}>
            <div className="stat-row">
              <div className="stat"><b className="num">{distinct}</b><span>dari {PROGRAMS.length} prodi pernah jadi peringkat 1</span></div>
              <div className="stat"><b className="num">{Math.round(top3share * 100)}%</b><span>porsi tiga prodi terbanyak</span></div>
              <div className="stat"><b className="num">{sorted[0].n}</b><span>jumlah terbanyak untuk satu prodi</span></div>
              <div className="stat"><b className="num">{PROGRAMS.length - distinct}</b><span>prodi yang tidak pernah muncul</span></div>
            </div>
            <div className="hbars">
              {sorted.map(({ p, n }) => (
                <div key={p.id} data-fac={p.facultyId}>
                  <span title={p.name}>{p.name}</span>
                  <span className="bar"><i style={{ width: `${(n / max) * 100}%` }} /></span>
                  <span className="num">{n}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="sec">
        <h2>Riwayat di perangkat ini</h2>
        {history.length === 0 ? (
          <p className="empty">Belum ada tes yang selesai. <a href={href("/tes")}>Mulai tes</a> untuk melihat riwayatmu di sini.</p>
        ) : (
          <div className="panel tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Selesai</th><th>Tiga besar</th></tr></thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td className="num">{new Date(h.finishedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</td>
                    <td>{h.top.map((t) => { const p = programById(t.id); return p ? <div key={t.id}>{p.name} <span style={{ color: "var(--ink-3)" }}>({facultyById(p.facultyId).code}, {t.percent}%)</span></div> : null; })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="notice" style={{ marginTop: 8 }}>Riwayat hanya tersimpan di browser ini dan tidak dikirim ke server.</p>
      </section>
    </div>
  );
}
