import { DIMS, DIM_INFO, type Vector } from "../../data/dimensions";

export interface Series {
  values: Vector;
  color: string; // css colour or var()
  label: string;
  dashed?: boolean;
}

export function Radar({ series, size = 340, title }: { series: Series[]; size?: number; title: string }) {
  const c = size / 2;
  const R = size * 0.33;
  const pt = (i: number, v: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / DIMS.length;
    return [c + Math.cos(a) * R * v, c + Math.sin(a) * R * v] as const;
  };
  const ring = (k: number) => DIMS.map((_, i) => pt(i, k).join(",")).join(" ");
  const desc = series.map((s) => `${s.label}: ` + DIMS.map((d) => `${DIM_INFO[d].short} ${Math.round(s.values[d] * 100)}`).join(", ")).join(". ");
  return (
    <svg viewBox={`-50 0 ${size + 100} ${size}`} role="img" aria-label={`${title}. ${desc}`} style={{ width: "100%", maxWidth: size + 100, height: "auto", display: "block", margin: "0 auto" }}>
      {[0.25, 0.5, 0.75, 1].map((k) => (
        <polygon key={k} points={ring(k)} fill="none" stroke="var(--rule)" strokeWidth={k === 1 ? 1.5 : 1} />
      ))}
      {DIMS.map((d, i) => {
        const [x, y] = pt(i, 1);
        return <line key={d} x1={c} y1={c} x2={x} y2={y} stroke="var(--rule)" strokeWidth="1" />;
      })}
      {series.map((s) => (
        <polygon
          key={s.label}
          points={DIMS.map((d, i) => pt(i, Math.max(0.03, s.values[d])).join(",")).join(" ")}
          fill={`color-mix(in srgb, ${s.color} 16%, transparent)`}
          stroke={s.color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeDasharray={s.dashed ? "6 4" : undefined}
        />
      ))}
      {DIMS.map((d, i) => {
        const [x, y] = pt(i, 1.2);
        const anchor = Math.abs(x - c) < 6 ? "middle" : x > c ? "start" : "end";
        return (
          <text key={d} x={x} y={y + 4} textAnchor={anchor} fontSize="12" fill="var(--ink-2)" fontFamily="var(--font-body)">
            {DIM_INFO[d].short}
          </text>
        );
      })}
    </svg>
  );
}

export function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="legend">
      {items.map((it) => (
        <span key={it.label}>
          <i style={{ background: it.color }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}
