import { href, type Route } from "../../lib/router";
import { useTheme } from "../../lib/theme";
import logo from "../../assets/logo.png";

const links = [
  { to: "/tes", label: "Tes", match: ["tes", "analisis", "hasil"] },
  { to: "/jelajah", label: "Jelajahi", match: ["jelajah", "prodi"] },
  { to: "/bandingkan", label: "Bandingkan", match: ["bandingkan"] },
  { to: "/uji", label: "Uji engine", match: ["uji"] },
];

export function Header({ route }: { route: Route }) {
  const { toggle, dark } = useTheme();
  const here = route.path[0] ?? "";
  return (
    <header className="topbar">
      <div className="shell topbar-in">
        <a className="brand" href={href("/")} aria-label="Jalur Suka, ke beranda">
          <img src={logo} className="brand-mark" alt="Logo Jalur Suka" />
          <span className="brand-title">
            Jalur <span className="brand-accent">Suka</span>
          </span>
        </a>
        <nav className="nav" aria-label="Menu utama">
          {links.map((l) => (
            <a key={l.to} href={href(l.to)} aria-current={l.match.includes(here) ? "page" : undefined}>
              {l.label}
            </a>
          ))}
        </nav>
        <button className="icon-btn" onClick={toggle} aria-label={dark ? "Pakai tema terang" : "Pakai tema gelap"} title={dark ? "Tema terang" : "Tema gelap"}>
          {dark ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
          )}
        </button>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell">
        <span>Jalur Suka adalah alat bantu eksplorasi minat, bukan tes psikometri baku.</span>
        <span>Data prodi disalin dari halaman fakultas; cek nama dan kurikulum terkini di situs resmi.</span>
      </div>
    </footer>
  );
}
