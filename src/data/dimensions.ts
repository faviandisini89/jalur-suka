export type Dim =
  | "ANA" | "TEK" | "SOS" | "ENT" | "KRE"
  | "KON" | "KEI" | "SPI" | "MEN" | "HUK";

export const DIMS: Dim[] = ["ANA", "TEK", "SOS", "ENT", "KRE", "KON", "KEI", "SPI", "MEN", "HUK"];

export type Vector = Record<Dim, number>;
export type Weights = Partial<Record<Dim, number>>;

export interface DimInfo {
  code: Dim;
  name: string;
  short: string;
  desc: string;
  /** phrase completing "Kamu ..." */
  user: string;
  /** phrase for demand: "Prodi ini menuntut ..." */
  demand: string;
}

export const DIM_INFO: Record<Dim, DimInfo> = {
  ANA: { code: "ANA", name: "Analitis", short: "Analitis", desc: "Logika, angka, data, dan pembuktian", user: "senang berpikir logis dan bekerja dengan angka atau data", demand: "penalaran logis dan analisis data" },
  TEK: { code: "TEK", name: "Teknis", short: "Teknis", desc: "Merancang dan membangun sistem atau alat", user: "senang mengutak-atik sistem, kode, atau alat", demand: "keterampilan teknis dan perancangan sistem" },
  SOS: { code: "SOS", name: "Sosial", short: "Sosial", desc: "Memahami dan mendampingi orang", user: "peduli pada orang lain dan perilaku sosial", demand: "kepekaan sosial dan interaksi dengan banyak orang" },
  ENT: { code: "ENT", name: "Kepemimpinan dan bisnis", short: "Bisnis", desc: "Strategi, pengelolaan, dan usaha", user: "suka mengatur strategi, memimpin, dan mengelola", demand: "kemampuan memimpin dan mengelola" },
  KRE: { code: "KRE", name: "Kreatif dan komunikasi", short: "Kreatif", desc: "Konten, bahasa, dan penyampaian pesan", user: "suka berkreasi dan menyampaikan pesan", demand: "kreativitas dan kemampuan berkomunikasi" },
  KON: { code: "KON", name: "Teratur dan detail", short: "Teliti", desc: "Ketelitian, dokumen, dan administrasi", user: "nyaman dengan pekerjaan yang rapi, teliti, dan terstruktur", demand: "ketelitian dan kerja yang terstruktur" },
  KEI: { code: "KEI", name: "Keilmuan dan riset", short: "Riset", desc: "Membaca, menelaah, dan meneliti", user: "gemar membaca, menelaah, dan mendalami gagasan", demand: "kegemaran membaca, menelaah, dan meneliti" },
  SPI: { code: "SPI", name: "Spiritual-keagamaan", short: "Keagamaan", desc: "Kajian teks dan nilai agama", user: "ingin ilmu yang dekat dengan nilai dan ajaran agama", demand: "kedekatan dengan kajian dan nilai keagamaan" },
  MEN: { code: "MEN", name: "Mengajar", short: "Mengajar", desc: "Menjelaskan dan membimbing belajar", user: "senang menjelaskan dan membimbing orang belajar", demand: "minat mengajar dan membimbing" },
  HUK: { code: "HUK", name: "Hukum dan aturan", short: "Hukum", desc: "Aturan, keadilan, dan argumentasi", user: "tertarik pada aturan, keadilan, dan argumentasi", demand: "minat pada aturan hukum dan argumentasi" },
};
