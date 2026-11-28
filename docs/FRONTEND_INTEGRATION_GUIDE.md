# Panduan Integrasi & Handoff Frontend — Marinasi (CV. Putra Nugraha)

Dokumen ini menjadi acuan resmi untuk tim **Frontend** saat melanjutkan pengembangan, redesign, atau poles UI/UX di repositori **Marinasi** (Laravel 13 + Inertia.js v2 + React 18 + Tailwind CSS).

Seluruh modul backend utama (**Build #1 – Build #6**) sudah selesai diimplementasikan dan terhubung ke database asli. **Tim FE bebas mempercantik tampilan, layout, komponen, responsivitas, dan dark/light mode**, selama tetap menjaga:
1. **Nama file Inertia Page** (`resources/js/Pages/...`),
2. **Nama props** yang diterima dari controller,
3. **Endpoint & nama field payload** saat submit form / mutasi, dan
4. **Aturan bisnis & flag guard** yang dikirim backend.

---

## 1. Setup Lokal Setelah Pull Branch Terbaru

Setiap kali menarik perubahan terbaru dari `main` atau `be/denis-akmal`, jalankan:

```powershell
composer install
php artisan migrate
php artisan storage:link
npm install
npm run build
```

Untuk verifikasi bahwa perubahan FE/BE tidak merusak alur aplikasi:

```powershell
php artisan test
npm run build
```

---

## 2. Shared Global Props (Tersedia di Semua Halaman via `usePage().props`)

Diatur di `app/Http/Middleware/HandleInertiaRequests.php`:

```js
const { auth, cartCount, flash, errors } = usePage().props;
```

| Prop | Struktur / Isi | Kegunaan di FE |
|---|---|---|
| `auth.user` | `id`, `name`, `email`, `phone`, `company_name`, `company_address`, `is_seller`, `is_active`, `verification_status` (`unverified` \| `pending` \| `verified` \| `rejected`), `is_verified_buyer` (`boolean`) | Tampilkan identitas asli user/perusahaan (JANGAN hardcode nama perusahaan dummy). |
| `cartCount` | `number` | Badge jumlah item aktif di keranjang (navbar buyer). |
| `flash` | `{ success, error, order_number, whatsapp_url }` | Banner notifikasi sukses/gagal & tombol konfirmasi WhatsApp setelah buat pesanan. |
| `errors` | `{ [field]: string }` | Pesan error validasi berbahasa Indonesia dari backend. |

> **Helper Profil Buyer:** gunakan `getBuyerClientProfile(auth?.user)` dari `resources/js/Utils/buyerProfile.js` agar nama perusahaan, PIC, dan badge status verifikasi konsisten di seluruh halaman Buyer.

---

## 3. Aturan Bisnis yang Sudah Dikunci Backend (Wajib Dipatuhi UI)

1. **Barang (`goods`) vs Jasa (`service`):**
   - `goods` menggunakan stok kuantitatif (`stock_quantity`, `stock_unit`, bisa restock, diblokir jika stok `< 1`).
   - `service` **tidak pernah memakai stok** (`stock_quantity` selalu dipaksa `null` oleh backend). Ketersediaannya dikontrol murni lewat status **Aktif/Nonaktif** (`is_active`). Di form katalog seller, input stok disembunyikan saat tipe `service`.
2. **Verifikasi Akun Buyer:**
   - Buyer `unverified` / `pending` / `rejected` **tetap boleh** tambah/ubah/hapus Keranjang, **tetapi diblokir** mengakses `/buyer/checkout` dan `/buyer/rfq/create` (otomatis redirect ke `/buyer/profile` dengan `errors.verification`).
   - Buyer `rejected` dapat mengunggah ulang dokumen verifikasi; Admin dapat menyetujui atau menolak ulang dengan alasan wajib.
   - Admin dapat menonaktifkan akun buyer (`is_active = false`); sesi buyer otomatis terhapus dan tidak bisa login.
3. **Alur Pesanan 5 Tahap + Pembatalan:**
   - Status tunggal: `mou_order` (*MOU / Pesanan*) → `dp_verification` (*DP / Verifikasi*) → `unit_preparation` (*Penyiapan Unit*) → `shipping` (*Pengiriman*) → `handover` (*Serah Terima*), ditambah `cancelled` (*Dibatalkan*).
   - Admin hanya boleh memajukan status **1 tahap secara berurutan** (tidak bisa lompat / mundur).
   - **Pengiriman (`shipping`):** mendukung 2 metode:
     - `expedition` (*Ekspedisi / Kurir*): **wajib isi `tracking_number`** untuk pesanan yang berisi barang (`goods`).
     - `internal_delivery` (*Antar Langsung — Armada Internal Bandung*): `tracking_number` **opsional**.
   - **Pembatalan:** hanya boleh **sebelum `unit_preparation`** (yakni di `mou_order` atau `dp_verification`), wajib isi `cancellation_reason` (min 5 karakter), dan otomatis mengembalikan stok barang (untuk Direct Checkout).
   - **Guard Pembatalan Buyer:** jika DP sudah diverifikasi admin (`hasVerifiedPayment`), Buyer tidak bisa batal sepihak (`order.can_cancel = false` untuk buyer) — pembatalan harus lewat koordinasi Admin.
4. **RFQ & Penawaran Harga (SPH):**
   - Setelah Buyer menyetujui SPH (`POST /buyer/quotations/{rfq}/agree`), **harga & jumlah terkunci permanen (`is_locked = true`)** dan otomatis dikonversi menjadi Order (`source = 'rfq'`, status `mou_order`).
   - Menyetujui RFQ **tidak** menambah/mengubah stok gudang.
   - Jika butuh ubah harga/qty setelah sepakat, wajib ajukan RFQ baru.
   - SPH yang melewati tanggal `valid_until` (`is_expired = true`) tidak bisa disetujui Buyer.
   - `target_delivery_date` tidak boleh tanggal di masa lalu.
5. **Pembayaran Manual, Invoice, e-Faktur, & Bukti Pembelian:**
   - **Anti-overpayment:** nominal tidak boleh melebihi `remaining_amount`, tanggal bayar tidak boleh di masa depan (`before_or_equal:today`), dan pesanan yang sudah lunas / punya Bukti Pembelian / `handover` tanpa DP tidak bisa di-upload bukti bayar lagi (ikuti flag `order.can_upload_payment` & `order.can_record_payment`).
   - **Invoice Resmi (`INV-PN-...`):** hanya boleh diterbitkan setelah tahap `≥ dp_verification` **DAN** minimal ada pembayaran DP terverifikasi (`order.can_issue_invoice`).
   - **Bukti Pembelian (`BKT-PN-...`):** hanya boleh diterbitkan setelah pembayaran **LUNAS** **DAN** tahap `handover` (`order.can_issue_purchase_receipt`).
   - **e-Faktur PPN 11% (PDF):** diunggah Admin minimal tahap `dp_verification` (disimpan di disk privat `local`).
   - **BAST (PDF):** diunggah Admin minimal tahap `shipping` (`stage_index >= 4`).
6. **Aktor Internal Tunggal:**
   - Hanya ada 1 peran internal (`Seller` = Owner/Admin). Tidak ada fitur multi-staf RBAC.

---

## 4. Peta Lengkap Halaman, Props, & Endpoint

### A. Zona Publik (Visitor / Guest)

| Route | Inertia Page | Props Utama | Catatan FE |
|---|---|---|---|
| `GET /` | `Public/Home` | — | Redirect otomatis ke `/portal` (buyer) atau `/seller/dashboard` (seller) jika sudah login. |
| `GET /katalog` | `Public/Catalog/Index` | `products`, `categories`, `filters` (`search`, `category_id`, `type`) | Sudah diredesign agar selaras landing page & dark mode. |
| `GET /katalog/{product}` | `Public/Catalog/Show` | `product` (termasuk `images`, `category`, `specifications`) | Tombol utama sadar status login (`auth.user`). |
| `GET /tentang-kami`, `/portofolio`, `/testimoni`, `/kontak`, `/kebijakan-privasi` | `Public/About`, `Portfolio`, `Testimonials`, `Contact`, `PrivacyPolicy` | — | Konten company profile statis, siap dipoles aset & copywriting oleh FE. |

---

### B. Zona Buyer (`auth` + `can:access-buyer`)

| Halaman / Fitur | Route & Method | Props / Payload | Guard & Catatan Penting |
|---|---|---|---|
| **Dashboard Buyer** | `GET /buyer/dashboard` (`Buyer/Dashboard`) | Props: `metrics`, `active_order`, `recent_orders`, `recent_rfqs` | Semua angka asli dari DB, terisolasi per user. |
| **Portal Katalog Buyer** | `GET /portal` (`Buyer/Home`) | Props: `products`, `categories`, `filters`, `pagination`, `paginationLinks`, `cartCount` | Query: `search`, `kategori`, `sort` (`newest`, `price_asc`, `price_desc`, `ready_stock`), `min_price`, `max_price`. |
| **Detail Produk Buyer** | `GET /buyer/products/{product}` (`Buyer/Products/Show`) | Props: `product`, `categories`, `related_products`, `cartCount` | Tombol tambah keranjang ikuti `product.cart_enabled` & `product.moq`. |
| **Keranjang** | `GET /buyer/cart` (`Buyer/Cart/Index`)<br>`POST /buyer/cart/items`<br>`PATCH /buyer/cart/items/{cartItem}`<br>`DELETE /buyer/cart/items/{cartItem}` | Store: `{ product_id, quantity }`<br>Update: `{ quantity }` | Boleh diakses buyer belum terverifikasi. Saat lanjut checkout kirim query `items[]`, `pr_reference`, `npwp_number`, `shipping_notes`. |
| **Direct Checkout** | `GET /buyer/checkout` (`Buyer/Checkout/Index`)<br>`POST /buyer/checkout` | Props: `checkout_items`, `idempotency_key`, `summary`, `prefill`<br>Store: `{ idempotency_key, cart_item_ids[], company_name, buyer_name, buyer_phone, shipping_address, shipping_notes?, pr_reference?, npwp_number? }` | **Wajib `verified.buyer`.** Kirim `idempotency_key` untuk cegah double-submit. Redirect ke `/buyer/orders` dengan `flash.whatsapp_url`. |
| **Riwayat Pesanan Buyer** | `GET /buyer/orders` (`Buyer/Orders/Index`)<br>`POST /buyer/orders/{order}/cancel`<br>`POST /buyer/orders/{order}/payments`<br>`GET /buyer/payments/{payment}/proof` | Cancel: `{ cancellation_reason }`<br>Payment (multipart): `{ payment_type, amount, payment_method, payment_reference?, paid_at, notes?, proof? }` | Tampilkan tombol Batalkan hanya jika `order.can_cancel`, tombol Upload Bukti hanya jika `order.can_upload_payment`. Gunakan `<a>` biasa untuk `proof.download_url`. |
| **Form Ajukan RFQ** | `GET /buyer/rfq/create` (`Buyer/Rfq/Create`)<br>`POST /buyer/rfq` | Props: `prefill_items`, `catalog_products`<br>Store (multipart `forceFormData: true`): `{ company_name, pic_name, pic_email, pic_phone, npwp_number?, shipping_address, payment_terms_note?, target_delivery_date?, buyer_notes?, attachment?, items: [{ product_id?, product_name, product_type, unit?, quantity, requested_unit_price? }] }` | **Wajib `verified.buyer`.** Mendukung query `?source=cart` atau `?product_id=X&quantity=Y`. Attachment maks 5 MB. |
| **Status RFQ & SPH** | `GET /buyer/quotations` (`Buyer/Quotations/Index`)<br>`POST /buyer/quotations/{rfq}/agree`<br>`POST /buyer/quotations/{rfq}/reject`<br>`POST /buyer/quotations/{rfq}/cancel`<br>`GET /buyer/quotations/{rfq}/attachment` | Reject: `{ rejection_reason }` | Tampilkan tombol Setujui hanya jika `rfq.can_agree` (otomatis `false` jika `is_locked` atau `is_expired`). Agree otomatis redirect ke Order baru. |
| **Dokumen & Faktur Pajak** | `GET /buyer/invoices` (`Buyer/Invoices/Index`)<br>`GET /buyer/documents/{document}/print`<br>`GET /buyer/documents/{document}/download` | Props: `documents`, `counts`, `summary`, `filters` | **WAJIB pakai tag `<a>` biasa** (bukan Inertia `<Link>`) untuk `print_url` (`target="_blank"`) dan `download_url`. |
| **Layanan Jasa Buyer** | `GET /buyer/services` (`Buyer/Services/Index`) | Props: `service_orders`, `metrics`, `filters` | Menampilkan pesanan buyer yang memuat item tipe `service`. |
| **Profil & Verifikasi Buyer** | `GET /buyer/profile` (`Buyer/Profile/Index`)<br>`PATCH /buyer/profile`<br>`PUT /password`<br>`POST /buyer/verification`<br>`GET /buyer/verification/documents/{document}` | Verification (multipart): `{ notes?, documents: [{ document_type, file }] }` | Upload dokumen verifikasi privat (PDF/JPG/PNG maks 5 MB). |

---

### C. Zona Seller / Admin (`auth` + `can:access-seller`)

| Halaman / Fitur | Route & Method | Props / Payload | Catatan Penting |
|---|---|---|---|
| **Dashboard Admin** | `GET /seller/dashboard` (`Seller/Dashboard`) | Props: `metrics`, `recent_orders`, `pending_rfqs`, `low_stock_products` | Semua angka agregasi real-time dari DB. |
| **Katalog Produk & Kategori** | `GET /seller/catalog` (`Seller/Catalog/Index`)<br>`POST /seller/products`, `PUT /seller/products/{id}`, `DELETE /seller/products/{id}`<br>`DELETE /seller/products/{product}/images/{image}`<br>`POST /seller/categories`, `PATCH /seller/categories/{id}`, `DELETE /seller/categories/{id}` | Props: `products`, `categories`, `filters`, `stats` | Untuk update produk dengan upload gambar via Inertia, gunakan `POST` + `_method: 'put'` + `forceFormData: true`. |
| **Manajemen Klien & Verifikasi** | `GET /seller/clients` (`Seller/Clients/Index`)<br>`POST /seller/clients/{client}/verification/approve`<br>`POST /seller/clients/{client}/verification/reject`<br>`PATCH /seller/clients/{client}/active`<br>`GET /seller/clients/verification-documents/{document}` | Reject: `{ rejection_reason }`<br>Toggle active: `{ is_active? }` | Dokumen verifikasi diunduh lewat `<a>` biasa. |
| **Antrean RFQ & Kirim SPH** | `GET /seller/negotiations` (`Seller/Negotiations/Index`)<br>`POST /seller/negotiations/{rfq}/quote`<br>`POST /seller/negotiations/{rfq}/reject`<br>`GET /seller/negotiations/{rfq}/attachment` | Quote: `{ valid_days, payment_terms_note?, seller_notes?, items: [{ id, quoted_quantity, quoted_unit_price }] }`<br>Reject: `{ rejection_reason }` | Tombol Buat/Revisi SPH hanya muncul jika `rfq.can_quote` (`false` setelah deal/terkunci). |
| **Manajemen Pesanan & Pengiriman** | `GET /seller/orders` (`Seller/Orders/Index`)<br>`POST /seller/orders/{order}/status`<br>`PATCH /seller/orders/{order}/shipping`<br>`POST /seller/orders/{order}/cancel`<br>`POST /seller/orders/{order}/payments`<br>`POST /seller/orders/{order}/invoice`<br>`POST /seller/orders/{order}/receipt`<br>`POST /seller/orders/{order}/documents` | Advance status: `{ target_status, note?, spk_number?, delivery_method?, courier_name?, tracking_number? }`<br>Upload doc (multipart): `{ type: 'efaktur' \| 'bast', document_number, tax_period?, notes?, file }` | Ikuti flag `order.next_status`, `order.can_cancel`, `order.can_record_payment`, `order.can_issue_invoice`, `order.can_issue_purchase_receipt`. |
| **Pusat e-Faktur, Invoice & Pembayaran** | `GET /seller/legality` (`Seller/Legality/Index`)<br>`POST /seller/payments/{payment}/verify`<br>`POST /seller/payments/{payment}/reject`<br>`GET /seller/payments/{payment}/proof`<br>`GET /seller/documents/{document}/print`<br>`GET /seller/documents/{document}/download` | Props: `documents`, `pending_payments`, `eligible_orders`, `counts`, `filters` | Antrean bukti transfer buyer & manajemen seluruh dokumen resmi dalam 1 layar. |
| **Layanan Jasa Seller** | `GET /seller/services` (`Seller/Services/Index`) | Props: `service_orders`, `metrics`, `filters` | Daftar pesanan yang berisi item jasa. |
| **Pengaturan Owner & Perusahaan** | `GET /seller/settings` (`Seller/Settings/Index`)<br>`PATCH /seller/settings/account`<br>`PATCH /seller/settings/company`<br>`PUT /password` | Account: `{ name, email, phone? }`<br>Company: `{ company_name, tagline?, npwp?, is_pkp, whatsapp_number, display_phone, email?, address?, default_payment_terms?, tax_note?, bank_accounts: [{ bank_name, account_number, account_holder }] }` | Perubahan `whatsapp_number` otomatis dipakai pada link konfirmasi WA pesanan buyer. |

---

## 5. Arahan & Checklist Pekerjaan Lanjutan untuk Tim FE

Secara fungsional, seluruh halaman di atas sudah **berfungsi 100% dengan data asli**, namun tampilan UI-nya sengaja dibuat bersih/fungsional dulu oleh BE. Berikut area yang paling bernilai untuk dipoles FE:

### Prioritas Tinggi (Poles Visual & UX Halaman Transaksional)
1. **Halaman Seller yang baru dibangun fungsionalnya:**
   - `Seller/Dashboard.jsx` — tambah visualisasi chart / tata letak card KPI yang lebih kaya (tetap pakai props `metrics`, `recent_orders`, `pending_rfqs`, `low_stock_products`).
   - `Seller/Orders/Index.jsx` — rapikan modal **Bayar & Dok** (misal jadi tab *Pembayaran* & *Dokumen* biar lebih lega di layar laptop 13").
   - `Seller/Negotiations/Index.jsx`, `Seller/Legality/Index.jsx`, `Seller/Clients/Index.jsx`, `Seller/Services/Index.jsx`, `Seller/Settings/Index.jsx` — samakan komponen tabel, badge, empty state, dan modal dengan design system `SellerLayout`.
2. **Halaman Buyer yang baru disambungkan ke DB:**
   - `Buyer/Dashboard.jsx`, `Buyer/Checkout/Index.jsx`, `Buyer/Orders/Index.jsx`, `Buyer/Rfq/Create.jsx`, `Buyer/Quotations/Index.jsx`, `Buyer/Invoices/Index.jsx`, `Buyer/Services/Index.jsx` — poles animasi transisi, stepper 5 tahap pesanan (terutama tampilan mobile), dan konsistensi komponen sidebar Buyer (bisa di-extract jadi 1 komponen reusable `<BuyerSidebar activeMenu="..." />` supaya tidak duplikat di 6 file!).
3. **Template Cetak Dokumen A4:**
   - `resources/views/documents/order-document.blade.php` — bisa ditambahkan logo CV. Putra Nugraha, stempel/tanda tangan digital resmi, dan rekening bank dari `CompanySetting::current()` jika aset resminya sudah siap.

### Prioritas Menengah (Halaman Publik & Aset)
4. **Company Profile & Bantuan:**
   - Lengkapi foto asli proyek/produk, testimoni nyata, alamat & kontak resmi di `Public/Home.jsx`, `Public/About.jsx`, `Public/Portfolio.jsx`, `Public/Testimonials.jsx`, `Public/Contact.jsx`, dan `Buyer/Help/Index.jsx`.

### Pantangan Teknis (Agar Integrasi Backend Tidak Rusak)
- **JANGAN** menambahkan kembali konstanta fallback dummy (`DEFAULT_CLIENT`, `DEFAULT_ORDERS`, `DEFAULT_QUOTATIONS`, `DEFAULT_DOCUMENTS`). Jika data dari server kosong (`[]`), tampilkan **Empty State** yang rapi.
- **JANGAN** gunakan Inertia `<Link>` untuk route unduh file / cetak dokumen (`download_url`, `print_url`, `proof.download_url`, `attachment.download_url`) — selalu gunakan tag `<a href={...}>` biasa.
- **SELALU** gunakan `{ forceFormData: true }` pada `router.post(...)` ketika mengirim file upload (`attachment`, `proof`, `file`, `images`, `documents`).
- **JANGAN** sembunyikan pesan `props.errors` — selalu tampilkan error validasi dari backend agar user tahu jika suatu aksi ditolak guard bisnis (misal stok kurang, SPH kedaluwarsa, atau belum verifikasi).
