## MIS Prototype – Implementation Plan

### 1) Tujuan

- **Dashboard operasional** untuk Smallholder HUB dengan navigasi sidebar, theming, dan kartu metrik.
- **Scalable**: mudah ditambah halaman (Farmers, Land Parcel, Training, Certification) dan sumber data API.

### 2) Ruang Lingkup (MVP)

- Routing App Router Next.js: `dashboard/main` sebagai landing pasca-redirect.
- Sidebar + Navbar fungsional dengan tautan ke halaman-halaman dasar.
- Dashboard: filter Region/ICS, 4 metrik utama (ICS, Farmers, Trained, Certified).
- UI konsisten (shadcn/Radix), theme switcher, font dengan `next/font`.

### 3) Gambaran Arsitektur Saat Ini

- Next.js 16 (App Router), React 19, TypeScript strict, Tailwind v4, Radix UI.
- Layout global di `app/layout.tsx` memuat `ThemeProvider`, `SidebarProvider`, `AppSidebar`, `Navbar`.
- Data dashboard sekarang diambil dari Postgres (Neon) via API route server `app/api/main-dashboard/route.ts` (native SQL dengan `pg`).
- Sidebar menu (`components/AppSidebar.tsx`) berisi grouping dan item dummy `/#`.

### 4) Rencana Peningkatan Bertahap

- Navigasi: perbaiki tautan sidebar ke rute yang benar.
- Tambahkan halaman stub untuk menu inti agar alur tidak buntu.
- Ekstraksi komponen `FilterBar` reusable dari dashboard.
- Siapkan kerangka API route untuk data nyata (tanpa mengubah UI), lalu integrasi fetch di client/server. (SELESAI)
- Hardening: aksesibilitas dasar, empty/loading states, dan error boundaries.

### 5) Detail Implementasi

- Routing & Pages
  - `app/page.tsx` tetap redirect ke `/dashboard/main`.
  - Tambah halaman:
    - `app/dashboard/farmers/page.tsx`
    - `app/dashboard/land-parcel/page.tsx`
    - `app/dashboard/training/page.tsx`
    - `app/dashboard/certification/page.tsx`
- Sidebar
  - Ganti href item ke rute aktual: `/dashboard/main`, `/dashboard/farmers`, dsb.
- Dashboard
  - Buat `components/filters/FilterBar.tsx` gunakan komponen Select shadcn.
  - Gunakan `FilterBar` di `app/dashboard/main/page.tsx`.
- Data & API
  - API route: `app/api/main-dashboard/route.ts` (GET) – native SQL:
    ```sql
    select name, region, farmers, trained, certified from main_dashboard;
    ```
  - Client: `app/dashboard/main/page.tsx` fetch ke `/api/main-dashboard?region=...&ics=...` dan merender `stats` + opsi filter.
  - DB: koneksi via `pg` di `lib/db.ts` (pooling), kredensial dari `.env.local`.
- UX/Quality
  - Loading skeleton untuk kartu metrik.
  - State kosong saat filter tanpa data.
  - A11y: label, `aria-*`, focus ring konsisten.

### 6) Struktur Data (Target API)

```json
{
  "regions": ["All District", "Kampar", "Rokan Hulu", "Siak", "Pelalawan"],
  "ics": [
    {
      "name": "KBM",
      "region": "Kampar",
      "farmers": 240,
      "trained": 180,
      "certified": 120
    }
  ],
  "stats": {
    "region": { "icsCount": 0, "farmers": 0, "trained": 0, "certified": 0 },
    "ics": { "icsCount": 1, "farmers": 0, "trained": 0, "certified": 0 }
  }
}
```

### 7) Checklist Pekerjaan

- [ ] Sidebar: perbaiki semua href ke rute valid
- [ ] Tambah halaman stub: Farmers, Land Parcel, Training, Certification
- [ ] Ekstrak `FilterBar` reusable (Region/ICS)
- [ ] Integrasi `FilterBar` ke dashboard
- [ ] Tambah empty/loading states
- [x] API route dashboard (`GET /api/main-dashboard`) dengan native SQL
- [x] Ganti sumber data dashboard → fetch API
- [ ] Setup env/dependency lokal (install `pg`, isi `.env.local`)
- [ ] A11y pass dan polishing UI kecil

### 8) Risiko & Mitigasi

- Versi React 19 + Next 16: perhatikan kompatibilitas libs. Mitigasi: tetap pada pola App Router standar dan komponen client/server yang jelas.
- Transisi mock → API: pastikan struktur response sesuai util lama agar minim refactor.

### 9) Timeline (Estimasi)

- Hari 1: Sidebar routing, halaman stub, FilterBar, integrasi di dashboard.
- Hari 2: API mock, fetch integrasi, loading/empty states, polish UI/A11y.

### 10) Next Steps (langsung dikerjakan)

1. Update link sidebar ke rute final.
2. Tambah halaman stub empat fitur.
3. Buat `FilterBar` dan pakai di dashboard.
4. Setup local env (`pg` + `.env.local`) bila belum.

### 11) Konfigurasi Lingkungan (ringkas)

- Tambah file `.env.local`:
  ```dotenv
  PGHOST=ep-old-glade-a1igghil-pooler.ap-southeast-1.aws.neon.tech
  PGDATABASE=neondb
  PGUSER=neondb_owner
  PGPASSWORD=npg_ipqjSC62MsHc
  PGSSLMODE=require
  PGCHANNELBINDING=require
  # PGPORT=5432
  ```
- Install dependency: `npm i pg`
