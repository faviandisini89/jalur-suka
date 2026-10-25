import { DIMS, DIM_INFO, type Vector } from "../data/dimensions";
import { facultyById } from "../data/faculties";
import type { Ranked } from "../engine/engine";

interface ClaudeRuntime {
  use: (name: string) => Promise<unknown>;
}
declare global {
  interface Window {
    claude?: ClaudeRuntime;
  }
}

const COLORS: Record<string, string> = {
  fadib: "#d7263d", fdk: "#e8731a", fsh: "#8a5a36", fitk: "#2e9e5b",
  fupi: "#2166c9", fst: "#0e8e9b", fishum: "#c2347f", febi: "#5f8c1a",
};

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number, maxLines = 3): number {
  const words = text.split(" ");
  let line = "";
  let lines = 0;
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y);
      y += lh; lines++; line = w;
      if (lines >= maxLines) return y;
    } else line = test;
  }
  if (line) { ctx.fillText(line, x, y); y += lh; }
  return y;
}

export async function renderShareCard(top: Ranked[], vector: Vector): Promise<Blob> {
  try {
    await Promise.all([
      document.fonts.load('800 80px "Bricolage Grotesque"'),
      document.fonts.load('600 32px "Instrument Sans"'),
    ]);
  } catch { /* fall back to system fonts */ }

  const W = 1080, H = 1350;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  const display = '"Bricolage Grotesque", "Segoe UI", system-ui, sans-serif';
  const body = '"Instrument Sans", "Segoe UI", system-ui, sans-serif';

  ctx.fillStyle = "#edf1f2"; ctx.fillRect(0, 0, W, H);
  const first = top[0];
  const lineColor = COLORS[first.program.facultyId];
  ctx.fillStyle = lineColor; ctx.fillRect(0, 0, W, 28);

  ctx.fillStyle = "#13222c";
  ctx.font = `700 34px ${body}`;
  ctx.fillText("Stasiun tujuanku di UIN Sunan Kalijaga", 72, 112);

  // main ticket
  const tx = 72, ty = 150, tw = W - 144, th = 470;
  ctx.fillStyle = "#ffffff"; ctx.fillRect(tx, ty, tw, th);
  ctx.strokeStyle = "#13222c"; ctx.lineWidth = 4; ctx.strokeRect(tx, ty, tw, th);
  ctx.fillStyle = lineColor; ctx.fillRect(tx, ty, 22, th);

  ctx.fillStyle = "#13222c";
  ctx.font = `600 30px ${body}`;
  ctx.fillText(facultyById(first.program.facultyId).code, tx + 60, ty + 70);
  ctx.font = `800 128px ${display}`;
  ctx.textAlign = "right";
  ctx.fillText(`${first.percent}%`, tx + tw - 44, ty + 150);
  ctx.font = `500 26px ${body}`;
  ctx.fillStyle = "#435663";
  ctx.fillText("tingkat kecocokan", tx + tw - 44, ty + 192);
  ctx.textAlign = "left";
  ctx.fillStyle = "#13222c";
  ctx.font = `800 70px ${display}`;
  wrap(ctx, first.program.name, tx + 60, ty + 280, tw - 120, 74, 2);
  ctx.font = `500 30px ${body}`;
  ctx.fillStyle = "#435663";
  wrap(ctx, first.program.summary, tx + 60, ty + 410, tw - 120, 40, 2);

  // alternatives
  ctx.fillStyle = "#13222c";
  ctx.font = `700 30px ${body}`;
  ctx.fillText("Pilihan lain yang dekat", 72, 700);
  top.slice(1, 3).forEach((r, i) => {
    const y = 730 + i * 96;
    ctx.fillStyle = "#ffffff"; ctx.fillRect(72, y, W - 144, 80);
    ctx.fillStyle = COLORS[r.program.facultyId]; ctx.fillRect(72, y, 14, 80);
    ctx.fillStyle = "#13222c"; ctx.font = `700 34px ${display}`;
    ctx.fillText(r.program.name.length > 36 ? r.program.name.slice(0, 35) + "…" : r.program.name, 108, y + 51);
    ctx.textAlign = "right"; ctx.font = `800 40px ${display}`;
    ctx.fillText(`${r.percent}%`, W - 100, y + 54);
    ctx.textAlign = "left";
  });

  // radar
  const cx = W / 2, cy = 1100, R = 150;
  const pt = (i: number, v: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / DIMS.length;
    return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v] as const;
  };
  ctx.strokeStyle = "#cdd7dc"; ctx.lineWidth = 2;
  [0.25, 0.5, 0.75, 1].forEach((k) => {
    ctx.beginPath();
    DIMS.forEach((_, i) => { const [x, y] = pt(i, k); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.closePath(); ctx.stroke();
  });
  const poly = (v: Vector, stroke: string, fill: string, lw: number) => {
    ctx.beginPath();
    DIMS.forEach((d, i) => { const [x, y] = pt(i, v[d]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke();
  };
  poly(first.program.profile, lineColor, lineColor + "26", 3);
  poly(vector, "#13222c", "#13222c1f", 4);
  ctx.fillStyle = "#13222c"; ctx.font = `500 22px ${body}`; ctx.textAlign = "center";
  DIMS.forEach((d, i) => { const [x, y] = pt(i, 1.28); ctx.fillText(DIM_INFO[d].short, x, y + 7); });
  ctx.textAlign = "left";

  ctx.fillStyle = "#435663"; ctx.font = `500 24px ${body}`;
  ctx.fillText("Garis tebal: minatku. Garis berwarna: profil prodi.", 72, 1290);
  ctx.textAlign = "right"; ctx.fillText("Jalur Suka", W - 72, 1290); ctx.textAlign = "left";

  return await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("canvas"))), "image/png"));
}

export type SaveOutcome = "saved" | "declined" | "unavailable";

export async function saveBlob(filename: string, blob: Blob): Promise<SaveOutcome> {
  try {
    const rt = window.claude;
    if (!rt) return "unavailable";
    const dl = (await rt.use("downloads")) as { save: (a: { filename: string; data: Blob }) => Promise<unknown> } | null;
    if (!dl) return "unavailable";
    await dl.save({ filename, data: blob });
    return "saved";
  } catch (e) {
    const code = (e as { code?: string })?.code;
    return code === "declined" ? "declined" : "unavailable";
  }
}

export function downloadFallback(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
