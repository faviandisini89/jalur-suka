import { useEffect, useMemo, useState } from "react";
import { Bullet } from "../components/app/Bullet";
import { Legend, Radar } from "../components/app/Radar";
import { facultyById } from "../data/faculties";
import { accumulate, explain, type Ranked } from "../engine/engine";
import { go, href } from "../lib/router";
import { downloadFallback, renderShareCard, saveBlob } from "../lib/share";
import { useSession } from "../lib/session";

function Reasons({ r, ev, vector }: { r: Ranked; ev: ReturnType<typeof accumulate>; vector: Parameters<typeof explain>[2] }) {
  const { reasons, cautions } = useMemo(() => explain(r.program, ev, vector), [r, ev, vector]);
  return (
    <>
      {reasons.length > 0 && (
        <>
          <h3 className="h-sec">Kenapa cocok</h3>
          <ul className="reasons">{reasons.map((x) => <li key={x.dim}>{x.text}</li>)}</ul>
        </>
      )}
      {cautions.map((c) => <p className="caution" key={c.dim}><b>Perlu diperhatikan.</b> {c.text}</p>)}
    </>
  );
}

export function Result() {
  const { session, result, start } = useSession();
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!session || !result) go("/tes");
  }, [session, result]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const ev = useMemo(() => (session ? accumulate(session.answers) : null), [session]);
  if (!session || !result || !ev) return <div className="shell page" />;

  const top = result.ranked.slice(0, 3);
  const [first, second, third] = top;
  const near = result.ranked.slice(3, 8);

  const share = async () => {
    setBusy(true);
    try {
      const blob = await renderShareCard(top, result.vector);
      const outcome = await saveBlob("kartu-hasil-jalur-suka.png", blob);
      if (outcome === "saved") setToast("Kartu hasil tersimpan.");
      else if (outcome === "declined") setToast("Penyimpanan dibatalkan.");
      else {
        setPreview(URL.createObjectURL(blob));
        downloadFallback("kartu-hasil-jalur-suka.png", blob);
      }
    } catch {
      setToast("Kartu hasil gagal dibuat. Coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  const fac = facultyById(first.program.facultyId);

  return (
    <div className="shell page">
      <div className="page-head">
        <div>
          <h1>Stasiun tujuanmu</h1>
          <p>Berdasarkan {session.answers.length} jawabanmu, ini tiga prodi yang paling dekat dengan minatmu. Persentase menunjukkan kecocokan relatif antar prodi, bukan peluang diterima.</p>
        </div>
        <div className="hero-actions" style={{ marginTop: 0 }}>
          <button className="btn btn-sm" onClick={share} disabled={busy}>{busy ? "Membuat kartu..." : "Unduh kartu hasil"}</button>
          <button className="btn btn-sm btn-quiet" onClick={() => { start(); go("/tes"); }}>Ulangi tes</button>
        </div>
      </div>

      <div className="result-grid">
        <div className="stack" style={{ ["--gap" as string]: "22px" }}>
          <article className="ticket" data-fac={first.program.facultyId} aria-label={`Rekomendasi utama: ${first.program.name}`}>
            <div className="ticket-body">
              <div className="ticket-top">
                <Bullet facultyId={first.program.facultyId} full />
                <div className="pct"><b className="num">{first.percent}%</b><small>tingkat kecocokan</small></div>
              </div>
              <h2>{first.program.name}</h2>
              <p style={{ marginTop: 10, color: "var(--ink-2)" }}>{first.program.summary}</p>
              <div className="perf" aria-hidden="true" />
              <Reasons r={first} ev={ev} vector={result.vector} />
              <div className="ticket-actions">
                <a className="btn btn-primary btn-sm" href={href(`/prodi/${first.program.id}`)}>Lihat detail prodi</a>
                <a className="btn btn-sm" href={href(`/bandingkan?a=${first.program.id}&b=${second.program.id}`)}>Bandingkan dengan nomor 2</a>
              </div>
            </div>
          </article>

          <div className="stack" style={{ ["--gap" as string]: "14px" }}>
            <h2 className="h-sec" style={{ marginBottom: 0 }}>Pilihan lain yang dekat</h2>
            {[second, third].map((r, i) => (
              <article className="mini" key={r.program.id} data-fac={r.program.facultyId}>
                <div className="mini-body">
                  <div className="mini-top">
                    <Bullet facultyId={r.program.facultyId} />
                    <div className="pct"><b className="num">{r.percent}%</b></div>
                  </div>
                  <h3>{r.program.name}</h3>
                  <p>{r.program.summary}</p>
                  <div className="mini-actions">
                    <a className="btn btn-sm" href={href(`/prodi/${r.program.id}`)}>Detail</a>
                    <a className="btn btn-sm btn-quiet" href={href(`/bandingkan?a=${first.program.id}&b=${r.program.id}`)}>Bandingkan dengan nomor 1</a>
                  </div>
                  <span className="sr-only" style={{ position: "absolute", left: -9999 }}>Peringkat {i + 2}</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="stack" style={{ ["--gap" as string]: "22px" }}>
          <section className="panel">
            <h2 className="h-sec">Peta minatmu dan profil {first.program.short ?? first.program.name}</h2>
            <Radar title="Peta minat dibandingkan profil prodi teratas" series={[
              { label: "Prodi", values: first.program.profile, color: `var(--${fac.color})` },
              { label: "Minatmu", values: result.vector, color: "var(--user)" },
            ]} />
            <Legend items={[{ label: "Minatmu", color: "var(--user)" }, { label: first.program.short ?? first.program.name, color: `var(--${fac.color})` }]} />
          </section>
          <section className="panel">
            <h2 className="h-sec">Transit ke prodi lain</h2>
            <ul className="near">
              {near.map((r) => (
                <li key={r.program.id} data-fac={r.program.facultyId}>
                  <a href={href(`/prodi/${r.program.id}`)}>{r.program.name}</a>
                  <span className="num">{r.percent}%</span>
                  <span className="bar"><i style={{ width: `${r.percent}%` }} /></span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <p className="notice" style={{ marginTop: 28 }}>
        Jalur Suka adalah alat bantu eksplorasi minat, bukan tes psikometri baku. Profil prodi adalah penilaian awal; untuk keputusan akhir, cek kurikulum dan syarat masuk di situs resmi prodi.
      </p>

      {preview && (
        <dialog className="modal" open aria-label="Kartu hasil">
          <img src={preview} alt="Kartu hasil Jalur Suka" />
          <p className="notice" style={{ margin: "10px 0" }}>Tekan lama atau klik kanan gambar untuk menyimpannya.</p>
          <button className="btn btn-sm" onClick={() => setPreview(null)}>Tutup</button>
        </dialog>
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
