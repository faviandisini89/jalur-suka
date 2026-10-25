import { Bullet } from "../components/app/Bullet";
import { Legend, Radar } from "../components/app/Radar";
import { DIMS, DIM_INFO } from "../data/dimensions";
import { facultyById } from "../data/faculties";
import { programById } from "../data/programs";
import { href } from "../lib/router";
import { useSession } from "../lib/session";

export function ProgramPage({ id }: { id: string }) {
  const p = programById(id);
  const { result } = useSession();
  if (!p) {
    return (
      <div className="shell page">
        <h1 className="q-text">Prodi tidak ditemukan</h1>
        <p className="q-hint">Cek kembali tautannya, atau pilih prodi dari daftar.</p>
        <div className="hero-actions"><a className="btn btn-primary" href={href("/jelajah")}>Lihat semua prodi</a></div>
      </div>
    );
  }
  const f = facultyById(p.facultyId);
  const mine = result?.ranked.find((r) => r.program.id === p.id);
  const dims = [...DIMS].sort((a, b) => p.profile[b] - p.profile[a]);

  return (
    <div className="shell page" data-fac={p.facultyId}>
      <header className="prog-head">
        <Bullet facultyId={p.facultyId} full />
        <h1>{p.name}</h1>
        <p>{p.summary}</p>
        <div className="hero-actions" style={{ marginTop: 18 }}>
          <a className="btn btn-primary btn-sm" href={href("/tes")}>Cari tahu kecocokanku</a>
          <a className="btn btn-sm" href={href(`/bandingkan?a=${p.id}&b=${p.similarTo[0]}`)}>Bandingkan dengan prodi serupa</a>
          {f.url && <a className="btn btn-sm btn-quiet" href={f.url} target="_blank" rel="noreferrer">Situs {f.code}</a>}
        </div>
        {mine && <p className="notice" style={{ marginTop: 14 }}>Dari tesmu, prodi ini ada di peringkat {result!.ranked.indexOf(mine) + 1} dengan kecocokan {mine.percent}%.</p>}
      </header>

      <div className="prog-grid">
        <div className="stack" style={{ ["--gap" as string]: "22px" }}>
          <section className="panel">
            <h2 className="h-sec">Yang dipelajari</h2>
            <ul className="plain-list">{p.topics.map((t) => <li key={t}>{t}</li>)}</ul>
          </section>
          <section className="panel">
            <h2 className="h-sec">Contoh jalur karier</h2>
            <ul className="plain-list">{p.careers.map((t) => <li key={t}>{t}</li>)}</ul>
          </section>
          <section className="panel">
            <h2 className="h-sec">Gambaran sehari sebagai mahasiswa</h2>
            <p className="day">{p.dayInLife}</p>
          </section>
          <section className="panel">
            <h2 className="h-sec">Transit ke prodi serupa</h2>
            <div className="chips">
              {p.similarTo.map((sid) => {
                const s = programById(sid);
                return s ? <a key={sid} className="chip" data-fac={s.facultyId} href={href(`/prodi/${sid}`)}>{s.name}</a> : null;
              })}
            </div>
          </section>
        </div>

        <aside className="stack" style={{ ["--gap" as string]: "22px" }}>
          <section className="panel">
            <h2 className="h-sec">Profil minat prodi</h2>
            <Radar title={`Profil minat ${p.name}`} series={[{ label: p.name, values: p.profile, color: `var(--${f.color})` }, ...(result ? [{ label: "Minatmu", values: result.vector, color: "var(--user)", dashed: true }] : [])]} />
            {result && <Legend items={[{ label: p.short ?? p.name, color: `var(--${f.color})` }, { label: "Minatmu", color: "var(--user)" }]} />}
            <div className="dim-bars">
              {dims.map((d) => (
                <div key={d}>
                  <span>{DIM_INFO[d].short}</span>
                  <span className="bar"><i style={{ width: `${Math.round(p.profile[d] * 100)}%` }} /></span>
                  <span className="num">{Math.round(p.profile[d] * 100)}</span>
                </div>
              ))}
            </div>
          </section>
          <p className="notice">
            Ringkasan, topik, dan karier di halaman ini adalah gambaran umum.{p.verifyName ? " Nama prodi ini berbeda di beberapa sumber, jadi cek nama yang berlaku saat ini." : ""} Untuk kurikulum dan syarat masuk, rujuk situs resmi fakultas dan portal PMB.
          </p>
        </aside>
      </div>
    </div>
  );
}
