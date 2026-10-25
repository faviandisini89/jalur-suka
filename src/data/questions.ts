import type { Weights } from "./dimensions";

export type Stage = "screening" | "cluster" | "micro";
export type Affinity = Record<string, number>;

export interface Option {
  label: string;
  weights: Weights;
  affinity?: Affinity;
}

export interface LikertQuestion {
  id: string;
  type: "likert";
  stage: Stage;
  text: string;
  weights: Weights;
  affinity?: Affinity;
}

export interface ScenarioQuestion {
  id: string;
  type: "scenario";
  stage: Stage;
  text: string;
  options: [Option, Option];
}

export type Question = LikertQuestion | ScenarioQuestion;

const L = (id: string, stage: Stage, text: string, weights: Weights, affinity?: Affinity): LikertQuestion =>
  ({ id, type: "likert", stage, text, weights, affinity });

const S = (id: string, stage: Stage, text: string, a: Option, b: Option): ScenarioQuestion =>
  ({ id, type: "scenario", stage, text, options: [a, b] });

const O = (label: string, weights: Weights, affinity?: Affinity): Option => ({ label, weights, affinity });

export const QUESTIONS: Question[] = [
  // ───────── Screening: dua soal per dimensi ─────────
  L("s01", "screening", "Aku senang memecahkan soal logika, angka, atau teka-teki yang rumit.", { ANA: 1, KEI: 0.2 }),
  L("s02", "screening", "Aku biasanya mencari data atau bukti dulu sebelum menyimpulkan sesuatu.", { ANA: 0.9, KEI: 0.4 }),
  L("s03", "screening", "Aku penasaran bagaimana aplikasi, mesin, atau alat bekerja, dan ingin bisa membuatnya sendiri.", { TEK: 1, ANA: 0.4 }),
  L("s04", "screening", "Aku senang mengutak-atik perangkat, kode, atau peralatan laboratorium.", { TEK: 0.9, ANA: 0.3 }),
  L("s05", "screening", "Orang sering bercerita masalah pribadinya kepadaku, dan aku senang mendengarkan.", { SOS: 1, MEN: 0.2 }),
  L("s06", "screening", "Aku tertarik memahami mengapa orang atau kelompok bersikap dan berperilaku tertentu.", { SOS: 0.8, KEI: 0.5 }),
  L("s07", "screening", "Aku suka mengatur strategi, memimpin tim, atau mengurus kegiatan dan proyek.", { ENT: 1, KON: 0.2 }),
  L("s08", "screening", "Aku tertarik pada cara sebuah usaha atau organisasi tumbuh dan menghasilkan keuntungan.", { ENT: 0.9, ANA: 0.3 }),
  L("s09", "screening", "Aku senang membuat konten, tulisan, desain, atau presentasi yang menarik.", { KRE: 1 }),
  L("s10", "screening", "Aku mudah tertarik pada bahasa, kata-kata, dan cara orang menyampaikan pesan.", { KRE: 0.8, KEI: 0.3 }),
  L("s11", "screening", "Aku nyaman dengan pekerjaan yang rapi dan detail, seperti mencatat, mengarsipkan, atau menghitung.", { KON: 1 }),
  L("s12", "screening", "Aku tidak suka kesalahan kecil dan senang memeriksa ulang pekerjaan sampai benar.", { KON: 0.9, ANA: 0.2 }),
  L("s13", "screening", "Aku betah membaca buku atau jurnal tebal untuk memahami suatu topik secara mendalam.", { KEI: 1 }),
  L("s14", "screening", "Aku sering bertanya \"mengapa\" tentang hal mendasar, seperti makna, sejarah, atau asal-usul sesuatu.", { KEI: 0.9, SPI: 0.2 }),
  L("s15", "screening", "Aku ingin ilmu yang kupelajari dekat dengan nilai dan ajaran agama.", { SPI: 1 }),
  L("s16", "screening", "Aku tertarik mendalami Al-Qur'an, hadis, atau pemikiran keislaman.", { SPI: 0.95, KEI: 0.4 }),
  L("s17", "screening", "Aku senang menjelaskan sesuatu sampai orang lain benar-benar paham.", { MEN: 1, SOS: 0.3 }),
  L("s18", "screening", "Aku membayangkan diriku berdiri di depan kelas atau mendampingi murid belajar.", { MEN: 1 }),
  L("s19", "screening", "Aku tertarik pada aturan, hak dan kewajiban, serta bagaimana keadilan ditegakkan.", { HUK: 1 }),
  L("s20", "screening", "Aku senang berdebat dengan argumen yang kuat berdasarkan aturan atau dalil.", { HUK: 0.8, KEI: 0.3 }),

  // ───────── Cluster: rumpun sains dan teknik ─────────
  L("c01", "cluster", "Aku ingin bekerja di laboratorium atau di depan komputer untuk menguji dan membuktikan sesuatu.", { ANA: 0.7, TEK: 0.7, KEI: 0.3, SOS: -0.2 }),
  S("c02", "cluster", "Dalam proyek kelompok, kamu diberi dua pilihan tugas. Mana yang kamu ambil?",
    O("Membuat model atau program yang menyelesaikan masalah nyata", { TEK: 1, ANA: 0.5 }),
    O("Menyusun penjelasan yang membuat anggota lain paham konsepnya", { MEN: 1, SOS: 0.4 })),
  L("c03", "cluster", "Aku lebih suka mempelajari alam dan makhluk hidup lewat pengamatan dan eksperimen.", { ANA: 0.6, KEI: 0.7, TEK: 0.3 }),
  S("c04", "cluster", "Sebuah usaha kecil sering terlambat mengirim pesanan. Kamu lebih tertarik...",
    O("Menganalisis alur produksi dan mencari cara mempercepatnya", { TEK: 0.8, ANA: 0.7, ENT: 0.4 }),
    O("Merancang aplikasi untuk mencatat dan memantau pesanan", { TEK: 1, ANA: 0.5, KON: 0.3 })),
  L("c05", "cluster", "Aku tertarik pada pola dan pembuktian matematis, bahkan jika belum terlihat gunanya.", { ANA: 1, KEI: 0.5 }),
  // rumpun ekonomi dan hukum
  S("c06", "cluster", "Kamu bekerja di lembaga keuangan. Tugas mana yang lebih menarik?",
    O("Menyusun laporan dan memastikan semua angka akurat", { KON: 1, ANA: 0.5 }),
    O("Merancang produk atau strategi untuk menarik nasabah baru", { ENT: 1, KRE: 0.4 })),
  L("c07", "cluster", "Aku tertarik memahami bagaimana uang, harga, dan pasar bergerak.", { ENT: 0.7, ANA: 0.7, KEI: 0.3 }),
  L("c08", "cluster", "Aku senang membaca pasal atau peraturan dan menimbang mana yang berlaku dalam suatu kasus.", { HUK: 1, KEI: 0.4, KON: 0.3 }),
  S("c09", "cluster", "Ada sengketa antara dua pihak. Peran mana yang paling menarik bagimu?",
    O("Mencari penyelesaian lewat dasar hukum dan aturan", { HUK: 1, KEI: 0.4 }),
    O("Mendamaikan kedua pihak lewat dialog dan empati", { SOS: 1, HUK: 0.2 })),
  L("c10", "cluster", "Aku ingin tahu bagaimana negara dan pemerintahan dijalankan, dan siapa memegang kekuasaan.", { HUK: 0.7, ENT: 0.4, KEI: 0.5, SOS: 0.3 }),
  // rumpun sosial dan komunikasi
  L("c11", "cluster", "Aku senang menjadi penghubung dan membangun hubungan baik antar orang atau kelompok.", { SOS: 0.8, ENT: 0.4, KRE: 0.3 }),
  S("c12", "cluster", "Kamu bergabung dengan sebuah komunitas. Kontribusi apa yang kamu pilih?",
    O("Menjadi pembawa acara, penulis, atau pengelola media sosialnya", { KRE: 1, ENT: 0.3 }),
    O("Mendampingi anggota yang sedang mengalami masalah", { SOS: 1, SPI: 0.2 })),
  L("c13", "cluster", "Aku tertarik meneliti fenomena sosial, seperti perubahan budaya atau perilaku masyarakat.", { SOS: 0.7, KEI: 0.8, ANA: 0.4 }),
  L("c14", "cluster", "Aku ingin turun langsung ke masyarakat untuk membantu kelompok yang membutuhkan.", { SOS: 0.9, ENT: 0.3, SPI: 0.3 }),
  S("c15", "cluster", "Sebuah pesan penting harus sampai ke banyak orang. Kamu akan...",
    O("Membuat video, poster, atau tulisan yang menarik perhatian", { KRE: 1, TEK: 0.2 }),
    O("Mengatur strategi penyebaran dan mengoordinasi tim lapangan", { ENT: 1, SOS: 0.5 })),
  // rumpun keislaman
  L("c16", "cluster", "Aku ingin memahami teks agama langsung dari sumbernya, dengan kaidah dan metode yang ketat.", { SPI: 1, KEI: 0.7, KON: 0.3 }),
  L("c17", "cluster", "Aku tertarik mempelajari perbedaan pandangan antar agama, mazhab, atau aliran pemikiran.", { KEI: 0.8, SPI: 0.6, SOS: 0.3 }),
  S("c18", "cluster", "Kamu mengikuti kajian keislaman. Bagian mana yang paling menarik?",
    O("Menelusuri makna dan sumber dalil secara teliti", { SPI: 1, KEI: 0.6, KON: 0.3 }),
    O("Membahas bagaimana ajaran itu diterapkan pada masalah masyarakat", { SOS: 0.7, SPI: 0.5, HUK: 0.3 })),
  L("c19", "cluster", "Aku tertarik pada sejarah peradaban dan budaya Islam beserta tokoh-tokohnya.", { KEI: 0.9, SPI: 0.4, KRE: 0.2 }),
  L("c20", "cluster", "Aku ingin mendalami filsafat: logika, etika, dan pertanyaan besar tentang keberadaan.", { KEI: 0.9, ANA: 0.5, SPI: 0.4 }),
  // rumpun pendidikan
  L("c21", "cluster", "Melihat murid akhirnya paham sesuatu yang sulit memberiku kepuasan.", { MEN: 1, SOS: 0.4 }),
  S("c22", "cluster", "Kamu bekerja di sebuah sekolah. Peran mana yang paling cocok?",
    O("Guru yang berinteraksi langsung dengan murid setiap hari", { MEN: 1, SOS: 0.5 }),
    O("Pengelola yang mengatur kurikulum, jadwal, dan mutu sekolah", { ENT: 0.8, KON: 0.7, MEN: 0.3 })),
  L("c23", "cluster", "Aku sabar menghadapi anak-anak dan senang membuat belajar jadi menyenangkan.", { MEN: 0.8, SOS: 0.7, KRE: 0.5 }),
  L("c24", "cluster", "Aku tertarik merancang cara belajar yang kreatif, seperti permainan, media, atau praktik.", { MEN: 0.7, KRE: 0.8 }),
  S("c25", "cluster", "Mana yang lebih menarik untuk kamu ajarkan?",
    O("Ilmu agama", { MEN: 0.8, SPI: 0.9 }),
    O("Ilmu alam atau matematika", { MEN: 0.8, ANA: 0.9 })),
  // rumpun bahasa dan informasi
  L("c26", "cluster", "Aku senang belajar bahasa asing, termasuk tata bahasa dan cara pengucapannya.", { KRE: 0.8, KEI: 0.5 }),
  L("c27", "cluster", "Aku menikmati membaca dan membedah karya sastra, puisi, atau teks klasik.", { KEI: 0.8, KRE: 0.7 }),
  S("c28", "cluster", "Kemampuan bahasamu paling ingin dipakai untuk...",
    O("Menerjemahkan dan meneliti teks", { KEI: 1, KON: 0.3, KRE: 0.3 }),
    O("Berkomunikasi dan tampil di depan banyak orang", { KRE: 1, SOS: 0.4, ENT: 0.3 })),
  L("c29", "cluster", "Aku tertarik pada bahasa Arab sebagai kunci memahami sumber keilmuan Islam.", { SPI: 0.7, KEI: 0.7, KRE: 0.4 }),
  L("c30", "cluster", "Aku tertarik bekerja dengan buku, arsip, atau informasi dan membantu orang menemukannya.", { KON: 0.8, KEI: 0.5, TEK: 0.3 }),

  // ───────── Micro: pembeda antar prodi mirip ─────────
  // sains murni vs pendidikan sains
  S("m01", "micro", "Setelah lulus, kamu paling ingin...",
    O("Meneliti atau bekerja di laboratorium, industri, atau pusat data", { ANA: 0.7, TEK: 0.6, KEI: 0.6, MEN: -0.5 }, { mat: 0.8, fis: 0.8, kim: 0.8, bio: 0.8, pmat: -0.5, pfis: -0.5, pkim: -0.5, pbio: -0.5 }),
    O("Mengajar sains di sekolah atau madrasah", { MEN: 1, SOS: 0.4 }, { pmat: 0.8, pfis: 0.8, pkim: 0.8, pbio: 0.8, mat: -0.4, fis: -0.4, kim: -0.4, bio: -0.4 })),
  L("m02", "micro", "Aku lebih suka mengerjakan eksperimen atau analisis sendiri daripada menyiapkan bahan ajar.", { ANA: 0.6, TEK: 0.4, KEI: 0.5, MEN: -0.8 }, { mat: 0.6, fis: 0.6, kim: 0.6, bio: 0.6, pmat: -0.4, pfis: -0.4, pkim: -0.4, pbio: -0.4 }),
  L("m03", "micro", "Aku senang menyederhanakan konsep sains yang rumit agar mudah dipahami pelajar.", { MEN: 1, KRE: 0.4, ANA: 0.3 }, { pmat: 0.7, pfis: 0.7, pkim: 0.7, pbio: 0.7, mat: -0.3, fis: -0.3, kim: -0.3, bio: -0.3 }),
  S("m04", "micro", "Dalam sebuah proyek sains, kamu memilih...",
    O("Mengumpulkan data dan menganalisisnya secara mendalam", { ANA: 1, KEI: 0.6, MEN: -0.3 }, { mat: 0.6, fis: 0.6, kim: 0.6, bio: 0.6 }),
    O("Merancang demonstrasi atau alat peraga untuk kelas", { MEN: 0.9, KRE: 0.6, TEK: 0.4 }, { pmat: 0.6, pfis: 0.6, pkim: 0.6, pbio: 0.6 })),
  L("m05", "micro", "Bagiku memahami ilmunya sendiri sudah cukup; mengajarkannya bukan tujuan utamaku.", { KEI: 0.6, ANA: 0.4, MEN: -1 }, { mat: 0.5, fis: 0.5, kim: 0.5, bio: 0.5, pmat: -0.5, pfis: -0.5, pkim: -0.5, pbio: -0.5 }),
  // bidang sains
  L("m06", "micro", "Aku penasaran pada bilangan, pola, dan pembuktian matematis.", { ANA: 0.7, KEI: 0.4 }, { mat: 1, pmat: 1 }),
  L("m07", "micro", "Aku penasaran pada gerak benda, energi, cahaya, dan alam semesta.", { ANA: 0.5, TEK: 0.3, KEI: 0.3 }, { fis: 1, pfis: 1 }),
  L("m08", "micro", "Aku penasaran pada zat, reaksi, dan bagaimana bahan berubah.", { ANA: 0.5, TEK: 0.3 }, { kim: 1, pkim: 1 }),
  L("m09", "micro", "Aku penasaran pada makhluk hidup, tumbuhan, dan ekosistem.", { ANA: 0.4, KEI: 0.4 }, { bio: 1, pbio: 1 }),
  L("m10", "micro", "Aku ingin membuat perangkat lunak atau sistem komputer sendiri.", { TEK: 1, ANA: 0.5 }, { ti: 1 }),
  L("m11", "micro", "Aku tertarik mengoptimalkan proses kerja pabrik atau layanan agar efisien.", { TEK: 0.5, ANA: 0.6, ENT: 0.5 }, { tind: 1 }),
  S("m12", "micro", "Di bidang teknik, kamu lebih tertarik...",
    O("Membangun aplikasi atau sistem cerdas dari nol", { TEK: 0.8, ANA: 0.5, KRE: 0.3 }, { ti: 1, mat: 0.3, tind: -0.3 }),
    O("Merancang alur, jadwal, dan tata letak produksi", { TEK: 0.6, ANA: 0.5, ENT: 0.5, KON: 0.4 }, { tind: 1, ti: -0.3 })),
  // ekonomi dan keuangan
  S("m13", "micro", "Di dunia keuangan, kamu lebih tertarik...",
    O("Mengelola portofolio, investasi, dan arus kas", { ENT: 0.8, ANA: 0.7 }, { mks: 1, es: 0.3 }),
    O("Melayani nasabah dan mengembangkan produk perbankan", { SOS: 0.5, ENT: 0.5, KON: 0.4 }, { pbs: 1 })),
  L("m14", "micro", "Aku senang mencatat transaksi, menyusun laporan, dan memastikan setiap angka cocok.", { KON: 1, ANA: 0.5 }, { aks: 1 }),
  L("m15", "micro", "Aku ingin memahami kebijakan ekonomi, kemiskinan, dan sistem ekonomi berbasis nilai syariah.", { ANA: 0.5, KEI: 0.5, ENT: 0.4, SPI: 0.3 }, { es: 1 }),
  L("m16", "micro", "Aku tertarik pada cara bank syariah bekerja dan produk seperti pembiayaan dan tabungan.", { KON: 0.5, ENT: 0.5 }, { pbs: 1 }),
  L("m17", "micro", "Aku tertarik memeriksa apakah sebuah laporan keuangan wajar dan sesuai aturan.", { KON: 0.8, HUK: 0.5, ANA: 0.5 }, { aks: 1 }),
  S("m18", "micro", "Kamu lebih suka menjadi...",
    O("Analis yang mengkaji data ekonomi dan merumuskan rekomendasi", { ANA: 1, KEI: 0.5 }, { es: 1, mks: 0.3 }),
    O("Manajer yang mengambil keputusan keuangan sehari-hari", { ENT: 1, KON: 0.5 }, { mks: 1, pbs: 0.4 })),
  // hukum
  L("m19", "micro", "Aku tertarik pada hukum keluarga: pernikahan, waris, dan perwalian.", { HUK: 0.6, SOS: 0.5 }, { ahwal: 1 }),
  L("m20", "micro", "Aku senang membandingkan pendapat para ulama dan alasan di balik perbedaannya.", { SPI: 0.7, KEI: 0.7, HUK: 0.5 }, { pmz: 1 }),
  L("m21", "micro", "Aku tertarik pada politik dan pemerintahan, serta cara kekuasaan diatur dalam konstitusi maupun dalam Islam.", { HUK: 0.6, ENT: 0.4, KEI: 0.5 }, { siyasah: 1, ih: 0.4 }),
  L("m22", "micro", "Aku tertarik pada hukum transaksi: jual beli, kontrak, dan bisnis yang sesuai syariah.", { HUK: 0.6, ENT: 0.5, KON: 0.4 }, { muamalat: 1 }),
  L("m23", "micro", "Aku ingin berkarier sebagai pengacara, jaksa, atau hakim dalam sistem hukum nasional.", { HUK: 0.9, ENT: 0.3 }, { ih: 1, ahwal: 0.3 }),
  S("m24", "micro", "Dasar hukum mana yang paling ingin kamu kuasai?",
    O("Fikih dan sumber hukum Islam", { SPI: 1, HUK: 0.6, KEI: 0.5 }, { pmz: 0.7, ahwal: 0.5, muamalat: 0.4 }),
    O("Undang-undang dan hukum positif", { HUK: 1, KON: 0.3 }, { ih: 1, siyasah: 0.5 })),
  // dakwah dan kesejahteraan sosial
  L("m25", "micro", "Aku ingin menyampaikan pesan kebaikan lewat media seperti radio, video, atau siaran.", { KRE: 0.9, SPI: 0.5 }, { kpi: 1 }),
  L("m26", "micro", "Aku ingin mendampingi individu menyelesaikan masalah psikologis atau spiritualnya lewat konseling.", { SOS: 1, SPI: 0.5 }, { bpi: 1 }),
  L("m27", "micro", "Aku ingin menggerakkan warga desa atau komunitas agar mandiri dan berdaya.", { SOS: 0.8, ENT: 0.6 }, { pmi: 1 }),
  L("m28", "micro", "Aku ingin mengelola lembaga dakwah, masjid, atau organisasi keagamaan.", { ENT: 0.9, KON: 0.5, SPI: 0.4 }, { md: 1 }),
  L("m29", "micro", "Aku tertarik pada kesejahteraan kelompok rentan, seperti lansia, anak, dan penyandang disabilitas.", { SOS: 0.9, HUK: 0.3, KON: 0.3 }, { iks: 1 }),
  S("m30", "micro", "Kamu lebih tertarik membantu orang dengan cara...",
    O("Konseling tatap muka yang personal", { SOS: 1 }, { bpi: 1, psi: 0.4 }),
    O("Program pemberdayaan atau kebijakan untuk banyak orang", { ENT: 0.6, SOS: 0.6, KON: 0.3 }, { pmi: 0.8, iks: 0.8, md: 0.3 })),
  // komunikasi dan ilmu sosial
  L("m31", "micro", "Aku tertarik pada jurnalisme, periklanan, humas, atau produksi media.", { KRE: 1, ENT: 0.5 }, { ikom: 1 }),
  L("m32", "micro", "Aku tertarik memahami perilaku, emosi, dan proses mental individu.", { SOS: 0.7, ANA: 0.5, KEI: 0.6 }, { psi: 1, bpi: 0.3 }),
  L("m33", "micro", "Aku tertarik menganalisis struktur masyarakat, kelas sosial, dan perubahan sosial.", { SOS: 0.6, KEI: 0.7, ANA: 0.5 }, { sos: 1, sa: 0.5 }),
  L("m34", "micro", "Aku tertarik melihat peran agama dalam kehidupan sosial dan budaya masyarakat.", { SOS: 0.5, KEI: 0.7, SPI: 0.4 }, { sa: 1, pa: 0.4 }),
  S("m35", "micro", "Mana yang lebih menarik untuk diteliti?",
    O("Mengapa seseorang berpikir dan merasa seperti itu", { ANA: 0.5, KEI: 0.6 }, { psi: 1 }),
    O("Mengapa masyarakat bertindak seperti itu secara kolektif", { SOS: 0.6, KEI: 0.6 }, { sos: 0.9, sa: 0.5 })),
  // kajian keislaman
  L("m36", "micro", "Aku tertarik menafsirkan ayat dan memahami ilmu-ilmu Al-Qur'an.", { SPI: 1, KEI: 0.6 }, { iat: 1 }),
  L("m37", "micro", "Aku tertarik meneliti keaslian dan kualitas riwayat hadis.", { SPI: 0.8, KEI: 0.7, KON: 0.5, ANA: 0.4 }, { hadis: 1 }),
  L("m38", "micro", "Aku tertarik pada filsafat Islam, tasawuf, dan pertanyaan tentang hakikat Tuhan dan manusia.", { KEI: 0.8, SPI: 0.6, ANA: 0.3 }, { akf: 1 }),
  L("m39", "micro", "Aku tertarik mempelajari berbagai agama dan tradisi keyakinan dengan sikap terbuka.", { KEI: 0.7, SOS: 0.5, SPI: 0.3 }, { pa: 1 }),
  S("m40", "micro", "Mana yang lebih menarik untuk dikaji?",
    O("Teks suci dan penafsirannya", { SPI: 1, KON: 0.3 }, { iat: 0.8, hadis: 0.8 }),
    O("Gagasan dan argumen para pemikir", { KEI: 1, ANA: 0.5 }, { akf: 0.9, pa: 0.6 })),
  // pendidikan Islam dan jenjang
  L("m41", "micro", "Aku ingin mengajar anak usia dini lewat bermain, bernyanyi, dan bercerita.", { MEN: 0.7, SOS: 0.7, KRE: 0.6 }, { pgra: 1 }),
  L("m42", "micro", "Aku ingin mengajar anak usia sekolah dasar di madrasah.", { MEN: 0.8, SOS: 0.6 }, { pgmi: 1 }),
  L("m43", "micro", "Aku ingin mengajarkan akidah, akhlak, dan ibadah kepada pelajar.", { MEN: 0.7, SPI: 0.8 }, { pai: 1 }),
  L("m44", "micro", "Aku tertarik mengelola mutu, kurikulum, dan kepemimpinan lembaga pendidikan.", { ENT: 0.7, KON: 0.6, MEN: 0.4 }, { ki: 1 }),
  L("m45", "micro", "Aku ingin mengajarkan bahasa Arab kepada pelajar.", { MEN: 0.7, KRE: 0.5, KEI: 0.4 }, { pba: 1, bsa: 0.3 }),
  // bahasa dan sastra
  L("m46", "micro", "Aku tertarik pada sastra dan bahasa Arab, klasik maupun modern.", { KEI: 0.7, KRE: 0.5, SPI: 0.4 }, { bsa: 1 }),
  L("m47", "micro", "Aku tertarik pada sastra, linguistik, dan budaya berbahasa Inggris.", { KRE: 0.8, KEI: 0.6 }, { sasing: 1 }),
  S("m48", "micro", "Kamu lebih tertarik...",
    O("Meneliti sastra dan bahasa sebagai bidang kajian", { KEI: 1, KRE: 0.5, MEN: -0.3 }, { bsa: 0.7, sasing: 0.7, pba: -0.3 }),
    O("Mengajarkan bahasa kepada pelajar", { MEN: 1, SOS: 0.4 }, { pba: 1, sasing: -0.2 })),
  // sejarah dan perpustakaan
  L("m49", "micro", "Aku tertarik pada sejarah, naskah kuno, dan perkembangan peradaban Islam.", { KEI: 0.9, SPI: 0.4 }, { ski: 1 }),
  L("m50", "micro", "Aku tertarik mengelola koleksi: mengklasifikasi, menyimpan, dan membantu orang menemukannya.", { KON: 0.8, TEK: 0.4, KEI: 0.4 }, { ilpus: 1 }),
  L("m51", "micro", "Aku tertarik pada teknologi untuk mengatur pengetahuan dan data digital.", { TEK: 0.6, KON: 0.6 }, { ilpus: 0.8, ti: 0.2 }),
  S("m52", "micro", "Kamu lebih suka...",
    O("Menelusuri sumber sejarah dan menulis ulang peristiwa masa lalu", { KEI: 1, KRE: 0.3 }, { ski: 1 }),
    O("Menata dan melestarikan sumber agar mudah diakses", { KON: 1, TEK: 0.4 }, { ilpus: 1 })),
  L("m53", "micro", "Aku senang menulis kode atau menyusun algoritma untuk memecahkan masalah.", { TEK: 1, ANA: 0.6 }, { ti: 1, mat: 0.3 }),
  L("m54", "micro", "Aku tertarik pada kecerdasan buatan, pengolahan data, dan pembuatan aplikasi.", { TEK: 0.8, ANA: 0.7, KRE: 0.2 }, { ti: 1, mat: 0.4 }),
];

export const questionById = (id: string) => QUESTIONS.find((q) => q.id === id)!;
