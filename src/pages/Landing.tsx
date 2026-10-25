import { HeroArt } from "../components/app/HeroArt";
import { href, go } from "../lib/router";
import { useSession } from "../lib/session";
import { TOTAL_QUESTIONS } from "../engine/engine";
import { QUESTIONS } from "../data/questions";
import { PROGRAMS } from "../data/programs";

export function Landing() {
  const { session, start, reset } = useSession();
  const inProgress = session && !session.finishedAt && session.answers.length > 0 && session.answers.length < TOTAL_QUESTIONS;
  const finished = session && (session.finishedAt || session.answers.length >= TOTAL_QUESTIONS);

  const begin = () => {
    start();
    go("/tes");
  };

  return (
    <div className="shell page">
      <section className="hero">
        <div>
          <h1>Tentukan stasiun tujuanmu di UIN Sunan Kalijaga</h1>
          <p className="lead">
            Jawab {TOTAL_QUESTIONS} pertanyaan yang menyesuaikan diri dengan jawabanmu. Hasilnya tiga prodi yang paling cocok, lengkap dengan alasannya.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={begin}>Mulai tes</button>
            <a className="btn" href={href("/jelajah")}>Jelajahi {PROGRAMS.length} prodi</a>
          </div>
          {inProgress && (
            <div className="resume">
              <span>Tesmu berhenti di soal {session!.answers.length + 1}.</span>
              <a className="btn btn-sm" href={href("/tes")}>Lanjutkan</a>
              <button className="btn btn-sm btn-quiet" onClick={reset}>Buang</button>
            </div>
          )}
          {finished && (
            <div className="resume">
              <span>Kamu sudah punya hasil tes.</span>
              <a className="btn btn-sm" href={href("/hasil")}>Lihat hasil</a>
            </div>
          )}
        </div>
        <HeroArt />
      </section>

      <section className="facts" aria-label="Ringkasan">
        <div className="fact-card">
          <div className="fact-icon">⏱</div>
          <b>Sekitar 5 menit</b>
          <p>{TOTAL_QUESTIONS} soal dipilih dari bank {QUESTIONS.length} soal, jadi tiap orang mendapat urutan berbeda.</p>
        </div>
        <div className="fact-card">
          <div className="fact-icon">🎯</div>
          <b>Hasil bisa dijelaskan</b>
          <p>Tiap rekomendasi disertai alasan mendalam dan poin yang perlu kamu pertimbangkan.</p>
        </div>
        <div className="fact-card">
          <div className="fact-icon">🔒</div>
          <b>Tanpa akun</b>
          <p>Jawabanmu tersimpan di perangkat ini saja, aman dan tidak dikirim ke server mana pun.</p>
        </div>
      </section>

      <section className="how">
        <div className="how-intro">
          <h2>Cara kerja perjalanannya</h2>
          <p>Alur eksplorasi yang dirancang runtut untuk membantumu menemukan prodi yang tepat di UIN Sunan Kalijaga.</p>
        </div>
        <ol className="how-list">
          <li className="how-item">
            <span className="how-num">1</span>
            <div className="how-content">
              <b>Lima soal pertama menyaring arah</b>
              <p>Soal umum tentang cara berpikir dan gaya kerjamu membentuk gambaran awal minat.</p>
            </div>
          </li>
          <li className="how-item">
            <span className="how-num">2</span>
            <div className="how-content">
              <b>Soal berikutnya menyesuaikan</b>
              <p>Mesin memilih pertanyaan yang paling membedakan kandidat teratas. Warna indikator menunjukkan fakultas yang sedang memimpin.</p>
            </div>
          </li>
          <li className="how-item">
            <span className="how-num">3</span>
            <div className="how-content">
              <b>Soal terakhir membedakan prodi mirip</b>
              <p>Menjelaskan pembeda halus seperti Biologi vs Pendidikan Biologi, atau Akuntansi vs Perbankan Syariah.</p>
            </div>
          </li>
          <li className="how-item">
            <span className="how-num">4</span>
            <div className="how-content">
              <b>Hasil berupa tiga stasiun tujuan</b>
              <p>Dapatkan kecocokan teratas, buka detail kurikulum tiap prodi, dan simpan kartu hasilmu.</p>
            </div>
          </li>
        </ol>
      </section>
    </div>
  );
}
