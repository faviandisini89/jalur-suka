import { useEffect, useMemo, useState } from "react";
import { Bullet } from "../components/app/Bullet";
import { facultyById } from "../data/faculties";
import type { Question } from "../data/questions";
import { canFinishEarly, leadingFaculty, nextQuestion, TOTAL_QUESTIONS } from "../engine/engine";
import { go, href } from "../lib/router";
import { useSession } from "../lib/session";

const LIKERT = ["Sangat tidak setuju", "Tidak setuju", "Netral", "Setuju", "Sangat setuju"];

export function Test() {
  const { session, start, answer, back, finish } = useSession();
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    if (!session) start();
  }, [session, start]);

  const answers = session?.answers ?? [];
  const n = answers.length;

  const q: Question | null = useMemo(() => (session ? nextQuestion(session.answers, session.seed) : null), [session]);
  const lead = useMemo(() => leadingFaculty(answers), [answers]);
  const early = useMemo(() => canFinishEarly(answers), [answers]);

  const choose = (value: number) => {
    if (!q || picked !== null) return;
    setPicked(value);
    window.setTimeout(() => {
      answer(q.id, value);
      setPicked(null);
      if (n + 1 >= TOTAL_QUESTIONS) {
        finish();
        go("/analisis");
      }
    }, 200);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!q || e.metaKey || e.ctrlKey || e.altKey) return;
      if (q.type === "likert" && /^[1-5]$/.test(e.key)) choose(Number(e.key));
      if (q.type === "scenario") {
        if (e.key === "1" || e.key.toLowerCase() === "a") choose(0);
        if (e.key === "2" || e.key.toLowerCase() === "b") choose(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!session) return <div className="shell page" />;
  if (!q || session.finishedAt || n >= TOTAL_QUESTIONS) {
    return (
      <div className="shell page">
        <div className="test-wrap">
          <h1 className="q-text">Tesmu sudah selesai</h1>
          <p className="q-hint">Lihat hasilnya, atau mulai perjalanan baru dari soal pertama.</p>
          <div className="hero-actions">
            <a className="btn btn-primary" href={href("/hasil")}>Lihat hasil</a>
            <button className="btn" onClick={() => { start(); }}>Ulangi tes</button>
          </div>
        </div>
      </div>
    );
  }

  const lineStyle = lead ? ({ ["--line" as string]: `var(--${facultyById(lead).color})` } as React.CSSProperties) : undefined;
  const stops = Array.from({ length: TOTAL_QUESTIONS }, (_, i) => i);

  return (
    <div className="shell page">
      <div className="test-wrap" style={lineStyle}>
        <div className="route" role="progressbar" aria-valuemin={0} aria-valuemax={TOTAL_QUESTIONS} aria-valuenow={n} aria-label="Kemajuan tes">
          {stops.map((i) => (
            <div key={i} className={"stop" + (i < n ? " done" : "") + (i === n ? " now" : "")} />
          ))}
        </div>
        <div className="test-meta">
          <span className="num">Soal {n + 1} dari {TOTAL_QUESTIONS}</span>
          <span className="focus-chip" aria-live="polite">
            {lead ? (
              <span>Mengerucut ke <Bullet facultyId={lead} full /></span>
            ) : (
              <span>Menjajaki minat umummu</span>
            )}
          </span>
        </div>

        <div className="q-card" style={lineStyle}>
          <h1 className="q-text" key={q.id}>{q.text}</h1>
          {q.type === "likert" ? (
            <>
              <p className="q-hint">Seberapa setuju kamu dengan pernyataan ini?</p>
              <div className="likert" role="radiogroup" aria-label="Tingkat persetujuan">
                {LIKERT.map((label, i) => (
                  <button key={label} role="radio" aria-checked={picked === i + 1} onClick={() => choose(i + 1)}>
                    <b>{i + 1}</b>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="q-hint">Pilih yang paling mendekati kecenderunganmu.</p>
              <div className="scenario" role="radiogroup" aria-label="Pilihan">
                {q.options.map((o, i) => (
                  <button key={o.label} role="radio" aria-checked={picked === i} onClick={() => choose(i)}>
                    <b>{i === 0 ? "A" : "B"}</b>
                    <span>{o.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {early && (
          <div className="early">
            <span>Hasilmu sudah cukup jelas. Lihat sekarang atau lanjutkan sampai soal ke-{TOTAL_QUESTIONS}.</span>
            <button className="btn btn-sm" onClick={() => { finish(); go("/analisis"); }}>Lihat hasil sekarang</button>
          </div>
        )}

        <div className="test-foot">
          <button className="btn btn-sm btn-quiet" onClick={back} disabled={n === 0}>Kembali ke soal sebelumnya</button>
          <a className="btn btn-sm btn-quiet" href={href("/")}>Simpan dan keluar</a>
        </div>
      </div>
    </div>
  );
}
