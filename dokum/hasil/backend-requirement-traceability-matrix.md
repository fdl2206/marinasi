# Backend Requirement Traceability Matrix — Marinasi

> **Tujuan:** Memetakan seluruh Functional Requirements (FR) dalam SRS terhadap halaman frontend, route, dan implementasi backend repository.
>
> **Sumber kebutuhan:** `dokum/refrences/SRS-Website-CV-Putra-Nugrha (2).docx`, Bab 3 §3.1, tabel kebutuhan fungsional. Daftar isi menempatkan §3.1 mulai halaman 5. Nomor halaman individual setiap baris tabel tidak dapat dipastikan dari ekstraksi DOCX; referensi karena itu memakai subbab FR dan bagian dokumen, bukan nomor halaman per baris.
>
> **Pembaruan tahap 1, 9 November 2026:** Acuan kode adalah branch `be/denis`, commit `71ffe9c`. Fondasi Product/Category dan controller katalog publik sudah tersedia. Route yang merender halaman saja belum membuktikan alur transaksi berfungsi. Test/build dan kondisi database aktif belum diverifikasi pada tahap ini. Lihat [hasil tahap 1](tahap-1-acuan-kerja.md) untuk keputusan tim, inventaris katalog dan pertanyaan meeting.

> **Pembaruan tahap 2:** Proteksi aktor Pembeli dan Penjual/Admin sudah ditambahkan dalam kode melalui gates dan kolom `is_seller`. Seluruh suite lulus 103 test, 335 assertions pada SQLite in-memory. Aktivasi migration/akses pemilik serta verifikasi MySQL masih tertunda. Keterangan tahap 1 merekam kondisi sebelum implementasi.

> **Pembaruan tahap 3:** Controller CRUD kategori/produk serta upload/hapus foto tersedia. Status FR-PNJ-02/03/04 pada tabel di bawah merupakan snapshot tahap 1; endpoint CRUD, upload dan update stok sudah diimplementasikan. Form operasional seller dan integrasi portal/detail Buyer tetap menjadi pekerjaan FE. Perubahan JSX agen dan pemilihan halaman Buyer telah dikembalikan sesuai arahan pengguna. Enforcement stok saat order menunggu modul transaksi. Tahap 3 masih memerlukan integrasi FE dan UAT; hasil test versi backend setelah koreksi dicatat pada respons pengerjaan.

> **Pembaruan profil dasar:** Telepon, nama perusahaan dan alamat perusahaan sudah diterima serta disimpan saat registrasi. Telepon sudah ada di form FE, sehingga klaim audit awal bahwa field FE belum ada dikoreksi melalui pemeriksaan Register.jsx:10. GET/PATCH buyer/profile kini membaca/memperbarui data akun sendiri, dengan kontrak integrasi FE terpisah. Migration kontak sudah dijalankan pada database lokal. Verifikasi terbaru lulus 140 test, 552 assertions pada SQLite in-memory. Jenis buyer serta fitur profil lanjutan tetap tertunda.

## FR-CP — Company Profile

**Sumber:** SRS §3.1.1, “Modul Company Profile” (Bab 3 §3.1; dimulai hlm. 5). Aktor tidak ditetapkan terpisah per requirement.

| FR ID | Deskripsi Requirement | Aktor | Halaman Frontend | Route | Backend yang Dibutuhkan | Status Implementasi | Prioritas SRS |
|---|---|---|---|---|---|---|---|
| FR-CP-01 | Sistem menampilkan header berisi logo dan nama Putra Nugraha Computer serta menu Beranda, Tentang Perusahaan, Katalog Produk atau Layanan, Portofolio, Testimoni, dan Kontak Perusahaan. | Pengunjung/Pembeli (akses publik; aktor tidak disebut per baris) | Layout publik; `Public/Home.jsx`, `Public/About.jsx`, `Public/Catalog/*`, `Public/Portfolio.jsx`, `Public/Testimonials.jsx`, `Public/Contact.jsx` | `/`, `/tentang-kami`, `/katalog`, `/portofolio`, `/testimoni`, `/kontak` | Penyajian navigasi; penyimpanan logo/nama jika harus dikelola dinamis | Halaman dan route tersedia. Backend pengelolaan logo/konten tidak ditemukan. | Tinggi |
| FR-CP-02 | Halaman Beranda menampilkan media gambar dan ringkasan perusahaan. | Pengunjung/Pembeli | `resources/js/Pages/Public/Home.jsx` | `GET /` | Konten dan gambar dari konfigurasi/CMS jika harus diubah tanpa deployment | Halaman ada; sumber data dinamis dan penyimpanan konten tidak ditemukan. | Tinggi |
| FR-CP-03 | Halaman Tentang Perusahaan menampilkan deskripsi, bidang usaha (service, jual beli, dan pengadaan laptop, komputer, dan printer; spare part dan jaringan; aksesoris komputer; pemasangan CCTV), serta dokumen legalitas yang dipublikasikan penjual. | Pengunjung/Pembeli; Penjual mengelola legalitas | `Public/About.jsx`, `Seller/Legality/Index.jsx` | `GET /tentang-kami`, `GET /seller/legality` | Konten profil, metadata/file legalitas, upload, validasi, aturan publikasi dan akses | Halaman ada; model, migration, upload, validasi dan penyimpanan tidak ditemukan. | Tinggi |
| FR-CP-04 | Halaman Katalog Produk atau Layanan menampilkan ringkasan barang dan jasa beserta tautan menuju e-catalog. | Pengunjung/Pembeli | `Public/Catalog/Index.jsx` | `GET /katalog` | Sumber data produk/jasa dan tautan katalog | Controller mengirim data produk/kategori aktif dari database. React menerima props katalog. Bukti kode pada `PublicCatalogController.php:15` dan `Public/Catalog/Index.jsx:6`. | Tinggi |
| FR-CP-05 | Halaman Portofolio menampilkan dokumentasi pekerjaan yang pernah dilakukan perusahaan. | Pengunjung/Pembeli | `Public/Portfolio.jsx` | `GET /portofolio` | Penyimpanan/penyajian konten dan media portofolio jika dinamis | Halaman ada; backend/persistensi portofolio tidak ditemukan. | Sedang |
| FR-CP-06 | Halaman Testimoni menampilkan ulasan dari pembeli atau mitra. | Pengunjung/Pembeli | `Public/Testimonials.jsx` | `GET /testimoni` | Penyimpanan dan penyajian testimoni jika dinamis | Halaman ada; model dan backend testimoni tidak ditemukan. | Sedang |
| FR-CP-07 | Halaman Kontak Perusahaan menampilkan alamat, nomor telepon, dan email perusahaan. | Pengunjung/Pembeli | `Public/Contact.jsx` | `GET /kontak` | Sumber/configuration kontak bila dikelola melalui panel | Halaman ada; backend pengelolaan kontak tidak ditemukan. | Tinggi |
| FR-CP-08 | Tersedia tautan kontak pribadi ke WhatsApp yang membuka percakapan dengan penjual. | Pengunjung/Pembeli | Halaman publik/layout terkait | Route halaman publik | Tautan eksternal; backend tidak diperlukan untuk URL statis, tetapi dibutuhkan bila penjual mengubahnya dari panel | Backend pengaturan WhatsApp tidak ditemukan. Keberadaan link aktif perlu dipastikan dari JSX, bukan dari route. | Sedang |
| FR-CP-09 | Tersedia tautan media sosial perusahaan pada header atau footer. | Pengunjung/Pembeli | Layout publik | Route halaman publik | Tautan statis atau pengelolaan konfigurasi bila harus dapat diedit | Backend konfigurasi tidak ditemukan; route tidak membuktikan tautan eksternal ada/aktif. | Sedang |
| FR-CP-10 | Halaman Kebijakan Privasi menjelaskan data yang dikumpulkan dan cara penggunaannya. | Pengunjung/Pembeli | `Public/PrivacyPolicy.jsx` | `GET /kebijakan-privasi` | Konten statis atau pengelolaan konten bila perlu | Halaman dan route ada; backend pengelolaan kebijakan tidak ditemukan. | Sedang |

## FR-AK — Akun dan Autentikasi

**Sumber:** SRS §3.1.2, “Modul Akun dan Autentikasi” (Bab 3 §3.1; dimulai hlm. 5). Aktor mengikuti istilah yang disebut dalam deskripsi.

| FR ID | Deskripsi Requirement | Aktor | Halaman Frontend | Route | Backend yang Dibutuhkan | Status Implementasi | Prioritas SRS |
|---|---|---|---|---|---|---|---|
| FR-AK-01 | Pengunjung dapat mendaftar akun dengan mengisi nama, email, nomor telepon, dan kata sandi. | Pengunjung | `Auth/Register.jsx` | Route auth `/register` (GET/POST, `routes/auth.php`) | Validasi, pembuatan user, penyimpanan nomor telepon | Registrasi kini menyimpan telepon serta nama/alamat perusahaan dari payload FE. Ketiga field tambahan opsional; status wajib final mengikuti konfirmasi mitra. Migration lokal sudah dijalankan. | Tinggi |
| FR-AK-02 | Pengguna dapat masuk dan keluar dari akun. | Pengguna | `Auth/Login.jsx` dan halaman auth terkait | Route auth `/login`, `/logout` | Autentikasi dan session | Autentikasi Laravel standar tersedia. | Tinggi |
| FR-AK-03 | Pembeli dapat melihat dan mengubah data profilnya. | Pembeli | `Profile/Edit.jsx`, Buyer profile page | `GET/PATCH /profile` (auth); `GET/PATCH /buyer/profile` (buyer) | Pengambilan/pembaruan profil dan field buyer tambahan jika berlaku | Endpoint profil dasar dan kontak sudah tersedia dengan pembatasan akun sendiri. Props buyer menggantikan contoh profil. Tombol simpan buyer masih perlu integrasi FE. PIC tambahan/perpajakan/termin/alamat terpisah belum dibangun. | Sedang |
| FR-AK-04 | Pengguna dapat mengatur ulang kata sandi yang terlupa. | Pengguna | `Auth/ForgotPassword.jsx`, `Auth/ResetPassword.jsx` | Route auth forgot/reset password | Password broker, validasi token dan penyimpanan password | Alur reset password Laravel standar tersedia. | Rendah |
| FR-AK-05 | Saat mendaftar, pembeli memilih jenis pembeli (umum atau instansi) dan mengisi nama instansi bila berlaku. | Pengunjung/Pembeli | `Auth/Register.jsx` | POST `/register` | Field tipe buyer dan nama instansi, validasi dan penyimpanan | Halaman registrasi ada, tetapi field, kolom database dan proses penyimpanan jenis/nama instansi tidak ditemukan. | Sedang |

## FR-PMB — Fitur Pembeli (E-Catalog)

**Sumber:** SRS §3.1.3, “Fitur Pembeli (E-Catalog)” (Bab 3 §3.1; dimulai hlm. 5). Aktor: Pembeli.

| FR ID | Deskripsi Requirement | Aktor | Halaman Frontend | Route | Backend yang Dibutuhkan | Status Implementasi | Prioritas SRS |
|---|---|---|---|---|---|---|---|
| FR-PMB-01 | Header e-catalog menampilkan logo, bantuan, akun, kategori, kolom pencarian, keranjang, dan tautan profil perusahaan. | Pembeli | Layout katalog publik dan halaman Buyer | `/katalog`, `/buyer/*` | Data katalog/kategori bila dinamis; autentikasi dan cart bila persisten | Sebagian halaman ada. Belum ada bukti seluruh kontrol berfungsi atau memakai data backend. | Tinggi |
| FR-PMB-02 | Kolom pencarian memungkinkan pembeli mencari barang atau jasa berdasarkan nama atau kata kunci, dan hasilnya dapat disaring menurut kategori. | Pembeli | `Public/Catalog/Index.jsx` | `GET /katalog` | Query pencarian/filter pada data produk dan kategori | Query nama/SKU, kategori, tipe dan pagination tersedia; React mengirim filter ke server. Bukti `PublicCatalogController.php:17` dan `Public/Catalog/Index.jsx:29`. Test tersedia, belum dijalankan ulang. | Tinggi |
| FR-PMB-03 | Halaman detail menampilkan nama, foto, deskripsi, spesifikasi, harga, dan ketersediaan stok, beserta tombol tambah ke keranjang dan ajukan penawaran. | Pembeli | `Public/Catalog/Show.jsx`, `Buyer/Products/Show.jsx` | `GET /katalog/{product}`, `GET /buyer/products/{id}` | Ambil data produk, harga/stok; validasi aksi cart/RFQ | Detail publik mengambil model dan menolak produk/kategori nonaktif (`PublicCatalogController.php:90`). Foto publik baru berupa jumlah metadata gambar (`Public/Catalog/Show.jsx:24`). Detail Buyer masih menerima ID dan memakai fallback dummy. Aksi cart/RFQ belum tersimpan. | Tinggi |
| FR-PMB-04 | Pembeli dapat memilih beberapa produk (usulan maksimal empat) dan melihat harga serta spesifikasinya berdampingan. | Pembeli | Halaman perbandingan tidak ditemukan | Route tidak ditemukan | Sumber data produk dan state/perbandingan | Halaman, route, dan backend pembandingan tidak ditemukan. | Sedang |
| FR-PMB-05 | Pembeli dapat menambah, mengubah jumlah, dan menghapus produk pada keranjang, dan sistem menghitung total harga secara otomatis. | Pembeli | `Buyer/Cart/Index.jsx` | `GET /buyer/cart` | Cart/item, kuantitas, validasi stok/harga, perhitungan total tepercaya | UI mengubah state dan menghitung lokal; item fallback dummy. Model, migration, write route tidak ditemukan. | Tinggi |
| FR-PMB-06 | Pembeli mengisi data pemesanan saat checkout, lalu sistem membuat pesanan dengan nomor unik dan tahap awal MOU/Pesanan. | Pembeli | `Buyer/Checkout/Index.jsx` | `GET /buyer/checkout` | Validasi checkout, order/items, nomor unik, status awal, penyimpanan transaksional | Halaman ada; submit/pembuatan order, model, migration dan validasi bisnis tidak ditemukan. | Tinggi |
| FR-PMB-07 | Setelah pesanan dibuat, sistem mengarahkan pembeli ke WhatsApp penjual dengan ringkasan pesanan terisi otomatis untuk menyepakati pembayaran tunai atau DP. | Pembeli | `Buyer/Checkout/Index.jsx` | `GET /buyer/checkout`; route pembuatan order/redirect tidak ditemukan | Membuat order, membangun ringkasan dan tautan WhatsApp | Checkout hanya simulasi lokal; order tersimpan dan ringkasan WhatsApp dari data transaksi tidak ditemukan. | Tinggi |
| FR-PMB-08 | Pembeli dapat mengajukan request penawaran harga dengan mengisi jumlah, harga yang diinginkan, dan catatan. | Pembeli | `Public/Catalog/Show.jsx`, `Buyer/Quotations/Index.jsx` | `GET /buyer/rfq/create` hanya merender halaman quotations; submit tidak ditemukan | Validasi dan penyimpanan RFQ yang terkait buyer/produk | Jumlah/catatan pada detail bersifat lokal; tombol menuju login. Quotations berisi sample; submit/persistensi tidak ditemukan. | Tinggi |
| FR-PMB-09 | Pembeli dapat melihat balasan dan status penawaran (Diajukan, Dibalas, Disepakati, Ditolak), dan penawaran yang disepakati dapat dilanjutkan menjadi pesanan. | Pembeli | `Buyer/Quotations/Index.jsx` | `GET /buyer/quotations` | Data RFQ/quotation, status/balasan, otorisasi, konversi menjadi order | Sample UI tersedia; model, status workflow, query dan konversi tidak ditemukan. | Tinggi |
| FR-PMB-10 | Pembeli dapat melacak tahap pesanan (MOU/Pesanan, DP/Verifikasi, Penyiapan Unit, Pengiriman, Serah Terima) beserta nomor resi pada tahap pengiriman. | Pembeli | `Buyer/Orders/Index.jsx` | `GET /buyer/orders` | Status order, resi, riwayat perubahan dan akses berdasarkan buyer | Halaman memakai sample/aksi lokal; backend status dan resi tidak ditemukan. | Tinggi |
| FR-PMB-11 | Pembeli dapat melihat riwayat transaksinya. | Pembeli | `Buyer/Orders/Index.jsx`, `Buyer/Invoices/Index.jsx` | `GET /buyer/orders`, `/buyer/invoices` | Query transaksi milik buyer, filter/pagination jika diperlukan | Halaman ada, tetapi sumber transaksi tersimpan dan backend retrieval tidak ditemukan. | Tinggi |
| FR-PMB-12 | Pembeli dapat mengunduh bukti pembelian untuk transaksi yang pembayarannya sudah dikonfirmasi penjual. | Pembeli | `Buyer/Invoices/Index.jsx`, `Buyer/Orders/Index.jsx` | `GET /buyer/invoices`, `/buyer/orders` | Status konfirmasi, otorisasi dokumen, generator/unduhan PDF | Halaman ada; pembayaran tersimpan, generator PDF dan endpoint dokumen tidak ditemukan. | Tinggi |
| FR-PMB-13 | Halaman utama katalog menampilkan produk terbaru, rekomendasi jasa, rekomendasi barang, dan daftar kerjasama. | Pembeli | Halaman home/catalog publik | `/`, `/katalog` | Query produk terbaru/rekomendasi, layanan dan konten kerjasama | Halaman ada; sumber data/domain backend tidak ditemukan. | Sedang |
| FR-PMB-14 | Halaman Bantuan memuat panduan singkat penggunaan website dan kontak perusahaan. | Pembeli | Halaman Bantuan tidak ditemukan | Route bantuan tidak ditemukan | Konten bantuan statis atau pengelolaan konten jika diminta | Halaman dan route tidak ditemukan. | Rendah |
| FR-PMB-15 | Tersedia tombol yang mengarahkan pengguna ke profil penyedia CV. Putra Nugrha di Inaproc (E-Katalog pemerintah). | Pembeli/Pengunjung | Halaman katalog/company profile yang sesuai perlu diverifikasi | Tautan eksternal; route internal tidak diperlukan | URL eksternal statis atau pengaturan URL jika dikelola seller | Keberadaan link belum dipastikan dari route audit; URL eksternal bukan bukti backend. | Tinggi |

## FR-PNJ — Fitur Penjual (Panel Admin)

**Sumber:** SRS §3.1.4, “Fitur Penjual (Panel Admin)” (Bab 3 §3.1; dimulai hlm. 5). Aktor: Penjual.

| FR ID | Deskripsi Requirement | Aktor | Halaman Frontend | Route | Backend yang Dibutuhkan | Status Implementasi | Prioritas SRS |
|---|---|---|---|---|---|---|---|
| FR-PNJ-01 | Penjual masuk melalui halaman login dan dashboard yang terpisah dari tampilan pembeli, baik pembeli umum maupun instansi. | Penjual sekaligus Admin | `Auth/Login.jsx`, `Seller/Dashboard.jsx` | `/login`, `/seller/dashboard` | Pembatasan aktor pembeli dan penjual, autentikasi serta otorisasi | Gates access-seller/access-buyer pada AppServiceProvider dan middleware auth/can melindungi route. Dashboard mengikuti penanda akun is_seller. URL admin menjadi alias seller. Registrasi dan profil tidak memberi hak penjual. Test batas akses lulus pada SQLite; aktivasi database proyek belum dilakukan. | Tinggi |
| FR-PNJ-02 | Penjual dapat menambah, mengubah, menonaktifkan, dan menghapus barang atau jasa, termasuk foto, harga, dan kategorinya. | Penjual | `Seller/Catalog/Index.jsx` | `GET /seller/catalog`; operasi CRUD tidak ditemukan | CRUD product/service, upload, validasi dan otorisasi | Model, migration dan Form Request tersedia. Controller/endpoint CRUD serta file storage belum tersedia. Form Request mengizinkan semua request pada `StoreProductRequest.php:14`; belum menjadi pembatasan akses. | Tinggi |
| FR-PNJ-03 | Penjual dapat mengubah ketersediaan stok. Produk dengan stok habis ditandai Stok Habis dan tidak dapat dipesan. | Penjual; Pembeli terdampak saat memesan | `Seller/Catalog/Index.jsx`, halaman detail/cart | `/seller/catalog`, `/katalog/{product}`, `/buyer/cart` | Simpan stok, update stok dan pemeriksaan saat pemesanan | Kolom stok nullable dan unit tersedia dalam migration produk baris 23–24. Endpoint update, pemeriksaan order dan aturan reservasi stok belum tersedia. | Tinggi |
| FR-PNJ-04 | Penjual dapat mengelola kategori produk. | Penjual | `Seller/Catalog/Index.jsx` | `/seller/catalog`; endpoint kategori tidak ditemukan | CRUD kategori, relasi produk dan validasi | Model Category, migration, relasi dan StoreCategoryRequest tersedia. Controller/endpoint CRUD belum tersedia. | Tinggi |
| FR-PNJ-05 | Penjual dapat melihat request penawaran yang masuk, lalu menyetujui, menolak, atau membalas dengan harga tandingan. | Penjual | `Seller/Negotiations/Index.jsx` | `GET /seller/negotiations`; mutation tidak ditemukan | Query RFQ, respons/counteroffer, status, otorisasi dan validasi | Halaman placeholder; backend penawaran tidak ditemukan. | Tinggi |
| FR-PNJ-06 | Penjual dapat melihat pesanan masuk, memverifikasi DP, dan memperbarui tahap pesanan. | Penjual | `Seller/Orders/Index.jsx` | `GET /seller/orders`, `GET /admin/orders`; mutation tidak ditemukan | Order/payment, validasi perubahan status dan histori | Halaman memakai sample dan state lokal; model/penyimpanan/update endpoint tidak ditemukan. | Tinggi |
| FR-PNJ-07 | Penjual dapat mencetak dokumen transaksi (faktur, bukti pembelian, dan dokumen kontrak) dari setiap pesanan. | Penjual | `Seller/Orders/Index.jsx` | Route halaman order ada; endpoint dokumen tidak ditemukan | Data order, generator/unduhan dokumen dan otorisasi | Tombol UI/toast tidak menghasilkan dokumen backend; generator dan data order tidak ditemukan. | Tinggi |
| FR-PNJ-08 | Penjual dapat memperbarui status pengiriman dan mengisi nomor resi. | Penjual | `Seller/Orders/Index.jsx` | `/seller/orders`; mutation tidak ditemukan | Penyimpanan status/resi dan validasi otorisasi | Endpoint update dan penyimpanan shipment tidak ditemukan. | Tinggi |
| FR-PNJ-09 | Penjual dapat mengunggah dokumen legalitas dan mengubah profil perusahaan. | Penjual | `Seller/Legality/Index.jsx`, `Seller/Settings/Index.jsx` | `GET /seller/legality`, `/seller/settings` | Upload/storage, validasi file, metadata legalitas dan profil perusahaan | Halaman ada; controller, model, migration, validasi dan penyimpanan tidak ditemukan. | Tinggi |
| FR-PNJ-10 | Penjual dapat mengubah konten company profile: deskripsi, media gambar, portofolio, testimoni, kontak, tautan WhatsApp dan media sosial, serta kebijakan privasi. | Penjual | Halaman public terkait; `Seller/Settings/Index.jsx`, `Seller/Services/Index.jsx` | Route halaman public dan `/seller/settings`, `/seller/services` | CRUD konten/media, validasi dan publikasi | Sebagian halaman ada; content-management backend tidak ditemukan. | Tinggi |
| FR-PNJ-11 | Penjual dapat melihat dan menonaktifkan akun pembeli. | Penjual | `Seller/Clients/Index.jsx` | `GET /seller/clients`; mutation tidak ditemukan | Daftar akun, perubahan status, otorisasi dan audit | Halaman placeholder; backend listing/nonaktifkan tidak ditemukan. | Sedang |
| FR-PNJ-12 | Dashboard menampilkan ringkasan pesanan baru, penawaran yang belum ditanggapi, dan stok menipis. | Penjual | `Seller/Dashboard.jsx` | `GET /seller/dashboard` | Query agregasi order/RFQ/stok | Dashboard ada; data domain dan agregasi backend tidak ditemukan. | Rendah |
| FR-PNJ-13 | Penjual dapat mencatat identitas instansi (misalnya Polda Jabar, Polres, atau Kejaksaan) beserta nomor kontrak atau SPK pada pesanan. | Penjual | `Seller/Orders/Index.jsx` | `/seller/orders`; mutation tidak ditemukan | Field order, validasi dan penyimpanan identitas instansi/kontrak/SPK; akses terbatas | Form/sample lokal tidak menyimpan data; field dan backend order tidak ditemukan. | Tinggi |

## Fitur Backend yang Belum Diimplementasikan

Berdasarkan repository yang diaudit, gap utama adalah:

- Jenis buyer dan pemetaan identitas instansi sesuai SRS. Telepon serta nama/alamat perusahaan sudah tersedia pada registrasi/profil. Akses seller/buyer sudah diimplementasikan pada tahap 2.
- CRUD produk/jasa dan kategori, file foto, update harga/stok, integrasi portal Buyer serta perbandingan. Query katalog publik dan skema dasar sudah tersedia.
- Cart persisten dan pemeriksaan stok/harga di sisi server.
- RFQ, balasan/counteroffer, status, histori, dan konversi quotation ke order.
- Order bernomor unik, detail item, data penerima/instansi, pembatalan dan histori status.
- Pencatatan tunai/DP dan verifikasi penjual.
- Status pengiriman, resi dan serah terima.
- Invoice/bukti pembelian/dokumen kontrak dan PDF.
- Manajemen legalitas dan konten company profile.
- Daftar/nonaktifkan akun buyer serta dashboard seller berbasis data.
- Validasi bisnis dan otorisasi kepemilikan data untuk operasi domain yang belum dibangun. Pembatasan aktor pada route telah tersedia pada tahap 2.

## Urutan Pengerjaan Berdasarkan Dependensi

1. Gunakan keputusan dan daftar pertanyaan pada hasil tahap 1. Aktor Penjual/Admin, satu pengelola sementara, pembayaran WhatsApp/tunai, MySQL dan batas 5 MB sudah ditetapkan tim.
2. Lengkapi autentikasi dan otorisasi: profil/jenis buyer serta proteksi route dan aksi seller.
3. Lengkapi fondasi kategori/katalog yang ada dengan CRUD, file media dan integrasi portal Buyer.
4. Bangun cart: tentukan persistensi dan validasi harga/stok terhadap katalog.
5. Bangun RFQ/quotation: penyimpanan request/respons, status dan transisi.
6. Bangun order: buat dari checkout atau quotation disetujui, lengkap dengan item dan nomor unik.
7. Tambahkan pembayaran manual dan fulfillment: verifikasi DP, status, shipment/resi, serah terima.
8. Tambahkan dokumen transaksi setelah format dan syarat penerbitan disepakati.
9. Bangun panel konten/admin: legalitas, profil, portfolio, testimoni, kontak, kategori dan pengelolaan buyer.
10. Integrasikan dan uji alur end-to-end, otorisasi, validasi dan kegagalan transaksi.

Urutan ini rekomendasi dependensi, bukan pengganti prioritas bisnis asli di tabel FR.

## Dapat Dikerjakan Tanpa Menunggu Keputusan Klien

- Audit/pengujiannya autentikasi Laravel yang sudah ada dan identifikasi selisih field registrasi/profil terhadap SRS.
- Menyepakati kontrak prop Inertia dengan frontend dan melanjutkan integrasi portal Buyer pada katalog publik yang sudah terhubung.
- Menyiapkan pengujian pola otorisasi dan akses halaman privat setelah role minimal Seller/Buyer dari SRS diterapkan.
- Meninjau data workbook katalog untuk dibawa ke proses verifikasi mitra; jangan langsung mempublikasikan sebagai data live.
- Menerapkan batas unggahan 5 MB sesuai keputusan tim; format per fitur masih perlu diselaraskan.

## Wajib Menunggu Konfirmasi

- Bentuk teknis pemberian akses akun pengelola dan penggunaan alias URL admin/seller. Aktor bisnisnya satu, dengan satu pengelola sementara.
- Apakah organisasi buyer memiliki banyak akun, dan field wajib buyer umum versus instansi.
- RFQ satu produk atau multi-item; bentuk dan riwayat counteroffer.
- Transisi quotation ke order dan aturan pembatalan.
- Kapan stok dikunci/dikurangi dan bagaimana stok dipulihkan saat pembatalan.
- Cara mencatat DP/pelunasan serta bukti konfirmasi, tanpa mengasumsikan payment gateway.
- Jenis dokumen transaksi, format dan waktu/otorisasi unduhan.
- Dokumen legalitas mana yang publik dan mana yang hanya seller.
- Jenis berkas per fitur. Ukuran final sudah 5 MB sesuai klarifikasi tim.
- Versi dan kesiapan lingkungan MySQL. Pilihan engine final sudah MySQL sesuai klarifikasi tim.
- Validitas katalog XLSX: harga, status aktif, stok, foto, deskripsi dan kategori sebelum ditampilkan ke publik.

## Batas Audit

- Route/page yang tersedia tidak dianggap sebagai bukti proses backend berfungsi.
- Prioritas Tinggi/Sedang/Rendah dan deskripsi FR mengikuti SRS; tidak ada ID requirement baru yang dibuat.
- Tidak ada migration, model, controller atau kode baru dalam dokumen ini.
