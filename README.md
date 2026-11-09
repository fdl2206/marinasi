# CV. Putra Nugraha — Company Profile & B2B E-Catalog

> **Status 9 November 2026:** Autentikasi, proteksi akses Pembeli/Penjual, endpoint CRUD kategori/produk, unggahan foto dan katalog publik berbasis database tersedia. Form operasional seller dan integrasi portal/detail buyer menjadi pekerjaan FE. Persistensi transaksi masih perlu dikerjakan. Lihat [PRD](dokum/refrences/PRD-Marinasi.md) dan [acuan kerja tahap 1](dokum/hasil/tahap-1-acuan-kerja.md).

## Katalog operasional tahap 3

Endpoint backend tersedia untuk membuat, memperbarui dan menghapus kategori/produk, termasuk status aktif. Kategori yang masih dipakai produk tidak dapat dihapus. Foto JPG/PNG/WebP maksimal 5 MB disimpan pada disk public. Jalankan `php artisan storage:link` pada lingkungan baru agar foto dapat diakses. Tautan tersebut sudah dibuat pada lingkungan lokal saat pengerjaan tahap 3.

Penyimpanan produk/metadata gambar menggunakan transaksi database, dengan pembersihan file unggahan baru jika penyimpanan gagal. Setelah produk/foto dihapus dari database, kegagalan pembersihan file dicatat pada log untuk ditindaklanjuti. Produk/kategori nonaktif disembunyikan dari katalog publik. Harga/stok nullable dan satu nilai harga mengikuti skema yang ada. Kebijakan harga rentang, reservasi stok dan produk yang pernah ditransaksikan masih menunggu keputusan.

Halaman Seller/Catalog tetap menggunakan placeholder asli FE. Portal buyer dan detail buyer menggunakan halaman Buyer/Home dan Buyer/Products yang sudah ada. Integrasi props, form CRUD serta tampilan foto diserahkan kepada FE sesuai arahan pengguna. Data seller tersedia pada props products/categories/filters dari GET seller/catalog; data katalog publik juga tersedia sebagai JSON dari GET katalog dan detailnya. RFQ/cart/checkout belum dihubungkan ke persistensi.

Perubahan JSX yang sempat dibuat agen pada tahap 3 telah dikembalikan sesuai arahan pengguna. Hasil verifikasi versi backend setelah koreksi dicatat pada respons pengerjaan. UAT integrasi FE dan pengujian pada MySQL masih perlu dilakukan.

## Data registrasi dan profil dasar buyer

Backend kini menyimpan phone, company_name dan company_address dari form registrasi yang sudah ada. Ketiganya opsional. Migration nullable `2026_11_09_100037_add_contact_details_to_users_table.php` sudah dijalankan pada database lokal.

GET buyer/profile menyediakan profil akun sendiri, props companyProfile dan array pics/addresses kosong untuk menggantikan fallback contoh. PATCH buyer/profile memperbarui tiga field kontak dasar, sedangkan PATCH profile tetap dipakai untuk nama/email dan kini juga menerima kontak. Tombol simpan profil masih perlu dihubungkan oleh FE.

[Kontrak integrasi backend](dokum/hasil/kontrak-integrasi-backend.md) menjelaskan payload, props, akses, error, upload dan redirect katalog/profil. Verifikasi terakhir lulus **140 test, 552 assertions** pada SQLite in-memory dan Pint berhasil. Tidak ada perubahan JSX pada pengerjaan ini.

## Prosedur akses akun tahap 2

Penjual sekaligus Admin memakai penanda `users.is_seller`. Nilai default `false` berlaku untuk pembeli baru dan akun lama setelah migration. Registrasi/profil tidak dapat mengisi penanda tersebut. Route buyer dan portal memerlukan akun pembeli, sedangkan route seller/admin memerlukan akun penjual. URL admin mengarah ke panel seller. Pilihan portal pada form login tidak memberikan akses.

Migration `database/migrations/2026_11_09_083946_add_is_seller_to_users_table.php` sudah diuji dalam SQLite in-memory dan pemeriksaan lokal terbaru menunjukkan status Ran. Gunakan akun pemilik yang sudah terdaftar untuk memberikan akses melalui terminal tepercaya:

```bash
php artisan users:grant-seller email-pemilik@example.com --no-interaction
```

Ganti alamat contoh dengan email akun pemilik yang sebenarnya. Perintah menolak email yang tidak terdaftar dan aman dijalankan ulang untuk akun yang sama. Pemberian akses akun proyek dilakukan operator melalui terminal.

Verifikasi tahap 2 menghasilkan **103 test, 335 assertions lulus** pada seluruh suite menggunakan SQLite in-memory. Pint berhasil. Hasil pada MySQL dan pengoperasian akun pemilik masih perlu diverifikasi.

Platform web monolithic berbasis SPA (Single Page Application) yang berfungsi sebagai **Company Profile Publik** dan sistem **B2B E-Catalog** pengadaan barang/jasa dengan alur permohonan negosiasi harga (RFQ), manajemen pesanan, dan verifikasi legalitas perusahaan.

---

## 🛠️ Tech Stack

- **Backend Framework**: Laravel 13 (PHP 8.3+)
- **SPA Bridge**: Inertia.js v2
- **Frontend Framework**: React.js 18
- **Styling**: Tailwind CSS (Dark Navy Blue theme: `#070d1e`)
- **Build Tool**: Vite
- **Database**: Target MySQL sesuai keputusan tim. PHPUnit memakai SQLite in-memory; konfigurasi aplikasi fallback ke SQLite jika koneksi tidak ditentukan. Koneksi/server aktual belum diverifikasi pada tahap 1.
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
