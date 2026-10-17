# CV. Putra Nugraha — Company Profile & B2B E-Catalog

> **Status Saat Ini:** Baseline Architecture & Blueprint Wireframe Template (Menunggu integrasi mockup visual final).

Platform web monolithic berbasis SPA (Single Page Application) yang berfungsi sebagai **Company Profile Publik** dan sistem **B2B E-Catalog** pengadaan barang/jasa dengan alur permohonan negosiasi harga (RFQ), manajemen pesanan, dan verifikasi legalitas perusahaan.

---

## 🛠️ Tech Stack

- **Backend Framework**: Laravel 12 (PHP 8.3+)
- **SPA Bridge**: Inertia.js v2
- **Frontend Framework**: React.js 18
- **Styling**: Tailwind CSS (Dark Navy Blue theme: `#070d1e`)
- **Build Tool**: Vite
- **Database**: MySQL (Default template) / SQLite (Local testing fallback)
- **Icons**: Lucide React

---

## 🏛️ Arsitektur Direktori 3 Zona

```text
resources/js/
├── Components/
│   └── Public/
│       ├── Navbar.jsx              # Header blueprint & navigasi responsif
│       └── Footer.jsx              # Footer informasi resmi & wireframe legalitas
├── Layouts/
│   ├── MainLayout.jsx              # Layout global zona publik (Dark Navy)
│   ├── BuyerLayout.jsx             # Layout sidebar & topbar khusus Buyer
│   └── SellerLayout.jsx            # Layout sidebar & topbar operasional Seller
└── Pages/
    ├── Public/                     # [ZONA 1: PROFIL PUBLIK & E-KATALOG]
    │   ├── Home.jsx                # Beranda (Hero, wireframe stepper & slot metrics)
    │   ├── About.jsx               # Profil perusahaan, visi, misi, legalitas KBLI
    │   ├── Catalog/
    │   │   ├── Index.jsx           # Katalog komoditas, pencarian SKU, filter
    │   │   └── Show.jsx            # Detail produk & formulir pengajuan RFQ
    │   ├── Portfolio.jsx           # Rekam jejak proyek & BAST
    │   ├── Testimonials.jsx        # Testimoni PPK / Mitra pengadaan
    │   ├── Contact.jsx             # Alamat kantor & form permohonan penawaran
    │   └── PrivacyPolicy.jsx       # Kebijakan privasi & kerahasiaan harga RFQ
    │
    ├── Buyer/                      # [ZONA 2: BUYER DASHBOARD]
    │   ├── Dashboard.jsx           # Ringkasan RFQ, pesanan aktif, & invoice
    │   ├── Quotations/Index.jsx    # Alur negosiasi harga kuantitas besar
    │   ├── Orders/Index.jsx        # Pelacakan pengiriman logistik
    │   └── Invoices/Index.jsx      # Arsip faktur pajak & dokumen BAST
    │
    └── Seller/                     # [ZONA 3: SELLER DASHBOARD]
        ├── Dashboard.jsx           # Ringkasan seller, antrean respon RFQ
        ├── Catalog/Index.jsx       # Manajemen inventaris stok & harga
        ├── Negotiations/Index.jsx  # Respon tawar-menawar & penerbitan SPH
        ├── Orders/Index.jsx        # Pemrosesan pesanan & surat jalan
        └── Legality/Index.jsx      # Unggah berkas NIB, NPWP, PKP
```

---

## 🚀 Menjalankan Proyek Secara Lokal

1. **Clone repository & install dependencies:**
   ```bash
   composer install
   npm install --legacy-peer-deps
   ```

2. **Setup Environment:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Jalankan Database Migration:**
   ```bash
   php artisan migrate
   ```

4. **Jalankan Development Server:**
   ```bash
   # Terminal 1: Backend Server
   php artisan serve

   # Terminal 2: Frontend Vite HMR
   npm run dev
   ```

5. **Akses URL Aplikasi:**
   - **Public Home**: `http://localhost:8000/`
   - **Katalog Produk**: `http://localhost:8000/katalog`
   - **Portal Buyer**: `http://localhost:8000/buyer/dashboard`
   - **Portal Seller**: `http://localhost:8000/seller/dashboard`
