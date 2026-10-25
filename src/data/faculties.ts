export interface Faculty {
  id: string;
  code: string;
  name: string;
  color: string; // CSS var name suffix
  url?: string;
  about: string;
}

export const FACULTIES: Faculty[] = [
  { id: "fadib", code: "FADIB", name: "Fakultas Adab dan Ilmu Budaya", color: "fadib", url: "http://adab.uin-suka.ac.id", about: "Dibuka pada 12 Oktober 1961, berawal dari Jurusan Sastra Arab dan Sejarah dan Kebudayaan Islam." },
  { id: "fdk", code: "FDK", name: "Fakultas Dakwah dan Komunikasi", color: "fdk", url: "http://dakwah.uin-suka.ac.id", about: "Berdiri 30 September 1970, dengan laboratorium dakwah yang mencakup studio radio, televisi, dan biro konseling." },
  { id: "fsh", code: "FSH", name: "Fakultas Syariah dan Hukum", color: "fsh", url: "http://syariah.uin-suka.ac.id", about: "Disebut sebagai fakultas syariah tertua di Indonesia, berusia lebih dari setengah abad." },
  { id: "fitk", code: "FITK", name: "Fakultas Ilmu Tarbiyah dan Keguruan", color: "fitk", url: "http://tarbiyah.uin-suka.ac.id", about: "Berakar dari PTAIN (1950) dan ADIA (1957), pusat pendidikan guru agama dan sains." },
  { id: "fupi", code: "FUPI", name: "Fakultas Ushuluddin dan Pemikiran Islam", color: "fupi", url: "http://ushuluddin.uin-suka.ac.id", about: "Dibuka bersamaan dengan peresmian IAIN pada 24 Agustus 1960, berfokus pada sumber pokok Islam dan pemikiran." },
  { id: "fst", code: "FST", name: "Fakultas Sains dan Teknologi", color: "fst", url: "http://saintek.uin-suka.ac.id", about: "Mulai menerima mahasiswa pada tahun ajaran 2004/2005, memadukan sains dan teknologi dengan keislaman." },
  { id: "fishum", code: "FISHUM", name: "Fakultas Ilmu Sosial dan Humaniora", color: "fishum", url: "http://isoshum.uin-suka.ac.id", about: "Memadukan studi keislaman, ilmu sosial, dan humaniora dalam pendidikan dan penelitian." },
  { id: "febi", code: "FEBI", name: "Fakultas Ekonomi dan Bisnis Islam", color: "febi", url: "http://febi.uin-suka.ac.id", about: "Rumpun ekonomi, keuangan, dan akuntansi berbasis prinsip syariah." },
];

export const facultyById = (id: string) => FACULTIES.find((f) => f.id === id)!;
