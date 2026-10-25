import { useMemo, useState } from "react";
import { Bullet } from "../components/app/Bullet";
import { FACULTIES } from "../data/faculties";
import { programsOf } from "../data/programs";
import { href } from "../lib/router";

export function Explore() {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const lines = useMemo(
    () =>
      FACULTIES.map((f) => ({
        f,
        progs: programsOf(f.id).filter((p) => !query || p.name.toLowerCase().includes(query) || f.code.toLowerCase().includes(query) || f.name.toLowerCase().includes(query)),
      })).filter((l) => l.progs.length > 0),
    [query],
  );
  return (
    <div className="shell page">
      <div className="page-head">
        <div>
          <h1>Peta jalur prodi</h1>
          <p>Setiap fakultas adalah satu jalur, dan setiap prodi adalah stasiunnya. Pilih stasiun untuk melihat detailnya.</p>
        </div>
        <label>
          <span className="h-sec" style={{ display: "block" }}>Cari prodi atau fakultas</span>
          <input className="search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Misalnya: hukum, FST, psikologi" />
        </label>
      </div>
      {lines.length === 0 ? (
        <p className="empty">Tidak ada prodi yang cocok dengan "{q}". Coba kata lain, atau hapus pencarian.</p>
      ) : (
        <div className="lines">
          {lines.map(({ f, progs }) => (
            <section className="line-card" key={f.id} data-fac={f.id}>
              <Bullet facultyId={f.id} />
              <h2>{f.name}</h2>
              <p className="about">{f.about}</p>
              <ul className="stations">
                {progs.map((p) => (
                  <li key={p.id}><a href={href(`/prodi/${p.id}`)}>{p.name}</a></li>
                ))}
              </ul>
              {f.url && <a className="btn btn-sm btn-quiet" style={{ marginTop: 12 }} href={f.url} target="_blank" rel="noreferrer">Situs fakultas</a>}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
