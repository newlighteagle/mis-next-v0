/** 🌍 Daftar region (districts) */
export const regions = [
  "All District",
  "Kampar",
  "Rokan Hulu",
  "Siak",
  "Pelalawan",
] as const;

/** 🧩 Daftar ICS dan region-nya */
export interface ICSData {
  name: string;
  region: string;
  farmers: number;
  trained: number;
  certified: number;
}

export const icsData: ICSData[] = [
  // Kampar
  { name: "KBM", region: "Kampar", farmers: 240, trained: 180, certified: 120 },
  { name: "SGO", region: "Kampar", farmers: 210, trained: 150, certified: 100 },
  { name: "KTM", region: "Kampar", farmers: 300, trained: 240, certified: 160 },

  // Rokan Hulu
  {
    name: "IM",
    region: "Rokan Hulu",
    farmers: 250,
    trained: 200,
    certified: 140,
  },
  {
    name: "7P",
    region: "Rokan Hulu",
    farmers: 220,
    trained: 180,
    certified: 110,
  },
  {
    name: "KRE",
    region: "Rokan Hulu",
    farmers: 190,
    trained: 160,
    certified: 100,
  },

  // Siak
  {
    name: "KPM KM",
    region: "Siak",
    farmers: 260,
    trained: 210,
    certified: 150,
  },
  {
    name: "APKASDU",
    region: "Siak",
    farmers: 230,
    trained: 190,
    certified: 130,
  },

  // Pelalawan
  {
    name: "KUD Mulia",
    region: "Pelalawan",
    farmers: 280,
    trained: 230,
    certified: 160,
  },
];

// --- REVISI TIPE RETURN UNTUK STATISTIK REGION ---
export interface RegionStats {
  icsCount: number; // Tambahkan hitungan ICS
  farmers: number;
  trained: number;
  certified: number;
}

/** 🔎 Dapatkan ICS list berdasarkan region */
export function getICSByRegion(region: string): string[] {
  if (region === "All District") return icsData.map((d) => d.name);
  return icsData.filter((d) => d.region === region).map((d) => d.name);
}

/** 📊 Dapatkan data statistik per ICS */
// Menggunakan Omit untuk kompatibilitas, namun menambahkan icsCount (1) jika diperlukan di ScoreCard
export function getICSStats(ics: string) {
  const data = icsData.find((d) => d.name === ics);
  // Tambahkan icsCount: 1 untuk ICS tunggal agar konsisten saat di-render
  return data ? { ...data, icsCount: 1 } : undefined;
}

/** 📈 Agregasi total statistik berdasarkan region (TERMASUK HITUNGAN ICS) */
export function getRegionStats(region: string): RegionStats {
  const filtered =
    region === "All District"
      ? icsData
      : icsData.filter((d) => d.region === region);

  const stats = filtered.reduce(
    (acc, d) => {
      acc.farmers += d.farmers;
      acc.trained += d.trained;
      acc.certified += d.certified;
      return acc;
    },
    { farmers: 0, trained: 0, certified: 0 }
  );

  // *** INI REVISI UTAMANYA: Menambahkan jumlah ICS yang difilter ***
  return {
    icsCount: filtered.length,
    ...stats,
  };
}

/** 🧮 Data total seluruh region */
export function getAllStats(): RegionStats {
  return getRegionStats("All District");
}
