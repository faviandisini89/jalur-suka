import { FACULTIES } from "../../data/faculties";

/** Metro-style bundle: eight faculty lines funnel through one interchange and fan out again. */
export function HeroArt() {
  const left = (i: number) => 38 + i * 50;
  const track = (i: number) => 174 + i * 9;
  const paths = FACULTIES.map((f, i) => {
    const ly = left(i), ty = track(i);
    const dy = Math.abs(ly - ty);
    const dir = ty > ly ? 1 : -1;
    const x1 = 230 - dy, x2 = 290 + dy;
    const d = `M64 ${ly} H${x1} L230 ${ty} H290 L${x2} ${ly} H${456}`;
    void dir;
    return { f, d, ly, i };
  });
  return (
    <svg className="hero-art" viewBox="0 0 520 440" aria-hidden="true" focusable="false">
      {paths.map(({ f, d, i }) => (
        <path key={f.id} className="route-draw" style={{ ["--i" as string]: i }} pathLength={1} d={d} fill="none" stroke={`var(--${f.color})`} strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" />
      ))}
      {paths.map(({ f, ly }) => (
        <g key={f.id + "t"}>
          <rect x="4" y={ly - 12} width="62" height="24" rx="12" fill="var(--surface)" stroke={`var(--${f.color})`} strokeWidth="3" />
          <text x="35" y={ly + 4.5} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--ink)" fontFamily="var(--font-body)">{f.code}</text>
          <circle cx="456" cy={ly} r="8" fill="var(--surface)" stroke={`var(--${f.color})`} strokeWidth="5" />
        </g>
      ))}
      <g>
        <circle cx="260" cy="210" r="19" fill="var(--surface)" stroke="var(--ink)" strokeWidth="5" />
        <rect x="190" y="252" width="140" height="30" rx="15" fill="var(--signal)" stroke="#1b1500" strokeWidth="2" />
        <text x="260" y="272" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1b1500" fontFamily="var(--font-body)">Kamu di sini</text>
      </g>
      <text x="456" y="430" textAnchor="end" fontSize="12.5" fill="var(--ink-3)" fontFamily="var(--font-body)">41 prodi S1, 8 fakultas</text>
    </svg>
  );
}
