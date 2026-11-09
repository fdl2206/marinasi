# PRD Marinasi — Company Profile dan E-Katalog B2B CV. Putra Nugraha

**Versi 0.2 · 9 November 2026 · Draf kerja untuk pembahasan tim dan mitra**

Pembaca: pengelola CV. Putra Nugraha, PM, tim backend, tim frontend, dan penguji proyek konsultasi.

[Hasil tahap 1](../hasil/tahap-1-acuan-kerja.md) mencatat inventaris katalog, keputusan tim, kesiapan lingkungan uji dan agenda meeting. Penyusunan acuan selesai; pemeriksaan sampel oleh pemilik dan koneksi MySQL aktual masih terbuka.

Pembaruan tahap 2 pada 9 November 2026 menambahkan akses `is_seller`, proteksi route buyer/seller/admin, redirect dashboard berdasarkan akun, dan perintah `users:grant-seller` untuk akun terdaftar. Seluruh suite lulus 103 test dan 335 assertions pada SQLite in-memory, serta Pint berhasil. Migration baru dan pemberian akses belum dijalankan pada database proyek. Bagian 3 tetap merekam titik awal audit sebelum perubahan ini. Prosedur aktivasi tersedia pada [README](../../README.md).

Pembaruan tahap 3 menyediakan endpoint CRUD kategori/produk dan unggahan/hapus foto pada disk public. Sesuai arahan pengguna, pengerjaan agen dibatasi pada backend. Form operasional seller, tampilan foto dan integrasi portal/detail buyer dikerjakan FE. JSX serta pemilihan halaman buyer dikembalikan ke kondisi sebelum tahap 3. Format JPG/PNG/WebP mengikuti validator yang sudah ada. Harga rentang dan aturan stok transaksi tetap mengikuti agenda meeting. Tahap 3 secara keseluruhan masih memerlukan integrasi FE dan UAT.

Pekerjaan backend lanjutan sebelum meeting menyimpan phone, company_name dan company_address dari form registrasi yang sudah ada serta menyediakan baca/perbarui profil dasar buyer. Field kontak dibuat opsional untuk mendukung akun lama dan pembeli umum; status wajib final dapat ditetapkan mitra. Migration kontak telah dijalankan pada database lokal. Kontrak bagi FE tersedia pada [dokumen integrasi](../hasil/kontrak-integrasi-backend.md). JSX tidak diubah. Jenis buyer, perpajakan, PIC tambahan, alamat terpisah dan termin pembayaran masih perlu konfirmasi.

Integrasi buyer kemudian disetujui pengguna dengan lima item terpilih dari katalog XLSX dan stok null. Halaman Buyer/Home dan Buyer/Products yang sudah tersedia kini terhubung ke data aktif melalui BuyerCatalogController. Pengikatan JSX disesuaikan untuk hasil kosong, harga/stok null, foto kosong dan penghapusan fallback dummy/diskon otomatis. Tidak ada halaman baru yang dibuat. Database lokal terisi tiga kategori dan lima produk/jasa aktif. Kontrak integrasi mencatat props dan sumber sel yang dipakai. Test akhir integrasi lulus 149 test dan 735 assertions pada SQLite in-memory.

## 1. Tujuan produk

Pengunjung perlu mengenal perusahaan dan menemukan barang atau jasa yang sesuai. Pembeli umum dan instansi perlu memesan atau meminta harga khusus, lalu mengetahui apa yang disepakati dan sejauh mana pesanan telah diproses. Pengelola perusahaan perlu memperbarui katalog dan menangani transaksi sendiri, tanpa meminta tim pengembang mengubah kode setiap kali harga, foto, atau status pesanan berubah.

Website menjadi tempat pencatatan katalog, penawaran, pesanan, dan status. WhatsApp menjadi saluran koordinasi pembayaran di luar website. Setelah percakapan selesai, pengelola mencatat hasil verifikasi di panel agar pembeli dapat melihat status terakhir.

**Ukuran keberhasilan saat serah terima**

- Pengunjung dapat menemukan barang atau jasa dari kategori atau kata kunci dan membuka detail yang benar. Demonstrasi memakai sedikitnya lima produk sampel yang diperiksa mitra.
- Pengelola dapat memperbarui satu produk dan memeriksa hasilnya di katalog publik tanpa bantuan developer.
- Pembeli dapat menelusuri pesanan langsung serta pesanan dari penawaran yang disepakati. Nomor, item, harga yang disepakati, dan status tetap tersedia setelah keluar dan masuk kembali.
- Dalam UAT, pembeli kedua gagal mengakses transaksi pembeli pertama, dan pengunjung maupun pembeli gagal membuka panel operasional melalui URL langsung.

## 2. Keputusan, aktor, dan batas produk

| Pokok | Dasar kerja |
|---|---|
| Aktor internal | Penjual sekaligus Admin adalah **satu aktor**. Sampai akhir pengembangan hanya pemilik yang mengelola perusahaan. Registrasi publik diperuntukkan bagi pembeli. |
| Pembeli | Pembeli umum dan instansi memiliki alur pengadaan yang sama, dengan identitas instansi bila berlaku. Penjual mencatat nomor kontrak/SPK untuk pengadaan instansi. |
| Pembayaran | Tim menetapkan koordinasi melalui WhatsApp dan pembayaran tunai/manual. SRS mencakup DP. Cara mencatat DP, pelunasan, dan bukti verifikasi menunggu mitra. FE menentukan tampilan yang mengikuti alur ini. |
| Platform | Satu repository Laravel 13, PHP 8.3+, React 18 dan Inertia. Target basis data yang diputuskan tim adalah **MySQL**. Nama database proyek yang diberikan adalah `cv_putra_nugraha`. Versi server dan koneksi aktif perlu diverifikasi terpisah. Keputusan MySQL menggantikan penyebutan SQL Server dalam SRS serta konteks MariaDB sebelumnya. |
| Unggahan | Maksimal **5 MB per berkas**, termasuk foto dan dokumen legalitas. Keputusan ini menyelesaikan perbedaan angka 2 MB dan 5 MB pada SRS. Jenis berkas dibatasi menurut tujuan penggunaan. |
| Batas versi pertama | Koordinasi via tautan WhatsApp, tautan profil penyedia di Inaproc, dan pembaruan pengiriman manual sesuai SRS. Payment gateway/VA, chat langsung dalam aplikasi, sinkronisasi Inaproc, integrasi ekspedisi, dan pengelolaan banyak penjual berada di luar cakupan versi ini. |

**Hak akses yang dituju**

| Aktivitas | Pengunjung | Pembeli masuk | Penjual/Admin masuk |
|---|---|---|---|
| Lihat profil, katalog aktif, kontak dan legalitas yang dipublikasikan | Ya | Ya | Ya |
| Kelola profil pembeli, keranjang, RFQ dan pesanan | Perlu login | Data sendiri | Tangani transaksi melalui panel |
| Lihat status dan unduh bukti pembelian yang telah terbit | Perlu login | Transaksi sendiri | Sesuai pesanan yang dikelola |
| Kelola katalog, stok, balasan, DP, pengiriman, konten dan akun pembeli | Tidak | Tidak | Ya |
| Lihat data kontrak/SPK internal | Tidak | Tidak | Ya |

Semua pemeriksaan akses berlaku pada permintaan ke server, termasuk permintaan langsung dengan ID transaksi atau berkas. Nama URL `/seller` atau `/admin` serta pilihan portal pada halaman login tidak menentukan hak akses.

## 3. Titik awal pengembangan

Fakta berikut berasal dari audit branch `be/denis` pada commit `71ffe9c`. Status “tersedia” menunjukkan kode yang ditemukan. Hasil UAT, kondisi data aktif, keberhasilan build, dan hasil test saat ini belum diverifikasi.

| Area | Implementasi yang dapat digunakan | Pekerjaan tersisa dan bukti |
|---|---|---|
| Akun | Registrasi, login, reset kata sandi dan profil dasar tersedia. | Registrasi menyimpan nama, email dan kata sandi. Belum ada penanda penjual pada skema pengguna. Lihat `app/Http/Controllers/Auth/RegisteredUserController.php:34` dan `database/migrations/0001_01_01_000000_create_users_table.php:14`. |
| Akses | Login memeriksa kredensial lalu membaca pilihan portal untuk redirect. Sebagian URL admin merender halaman Seller yang sama. | Grup buyer, seller dan admin tidak memasang pembatasan aktor. Lihat `app/Http/Controllers/Auth/AuthenticatedSessionController.php:36` dan `routes/web.php:54,103,115`. |
| Produk, kategori, foto | Skema dan relasi tersedia. Produk memiliki satu kategori, jenis barang/jasa, spesifikasi, harga dan stok yang dapat kosong, MOQ opsional serta beberapa metadata gambar. | Form Request tersedia, tetapi belum terhubung ke CRUD penjual atau penyimpanan file. Lihat `database/migrations/2026_11_08_194925_create_products_table.php:14`, `app/Http/Requests/StoreProductRequest.php:14`, `routes/web.php:120`. |
| Katalog | Katalog publik memakai query database, pencarian nama/SKU, filter kategori/tipe, pagination serta detail. Produk atau kategori nonaktif disembunyikan. | Halaman detail publik menampilkan jumlah gambar. Detail di portal pembeli menerima ID dan masih dapat memakai data contoh. Lihat `app/Http/Controllers/PublicCatalogController.php:15`, `resources/js/Pages/Public/Catalog/Show.jsx:24`, `routes/web.php:91`. |
| Transaksi | Tersedia tampilan keranjang, RFQ, quotation, checkout dan order. | Route bisnis tersebut hanya merender halaman. Tombol RFQ publik menuju login, detail buyer melakukan POST ke route cart yang hanya mendukung GET, dan checkout menampilkan sukses lewat timer. Belum ditemukan persistensi domain transaksi. Lihat `routes/web.php:59`, `resources/js/Pages/Public/Catalog/Show.jsx:87`, `resources/js/Pages/Buyer/Products/Show.jsx:329`, `resources/js/Pages/Buyer/Checkout/Index.jsx:73`. |
| Verifikasi | Ada test autentikasi/profil, empat test Product/Category dan delapan test katalog publik. | PHPUnit menggunakan SQLite in-memory. Perlu bukti perilaku pada MySQL dan integrasi FE untuk rilis. Lihat `tests/Feature/ProductCategoryTest.php:18`, `tests/Feature/PublicCatalogControllerTest.php:15`, `phpunit.xml:24`. |

## 4. Perjalanan pengguna dan kebutuhan fungsional

### 4.1 Menemukan perusahaan dan membandingkan pilihan

Pengunjung membuka profil, melihat bidang usaha dan portofolio, lalu menuju katalog. Ia dapat mencari barang atau jasa, menyaring kategori, dan menilai spesifikasi sebelum menghubungi perusahaan, masuk ke akun, atau mengikuti tautan penyedia di Inaproc.

| Acuan SRS | Kebutuhan dan kriteria penerimaan |
|---|---|
| FR-CP-01–10 | Beranda, tentang perusahaan, katalog, portofolio, testimoni, kontak, dan kebijakan privasi dapat dijangkau dari navigasi. Kontak WhatsApp dan media sosial mengarah ke tujuan yang disetujui mitra. Hanya legalitas yang dipilih untuk publikasi muncul di halaman perusahaan. |
| FR-PMB-01–03 | Header memberi akses ke pencarian, kategori, bantuan, akun dan keranjang. Hasil sesuai filter atau menampilkan keadaan kosong. Detail menampilkan data produk aktual, foto bila tersedia, spesifikasi, harga/keterangan, dan ketersediaan. Produk nonaktif tidak tampil meski URL dibuka langsung. |
| FR-PMB-04 | Pembeli dapat membandingkan harga dan spesifikasi produk di katalog perusahaan secara berdampingan. Batas empat pilihan merupakan usulan SRS untuk dikonfirmasi. |
| FR-PMB-13–15 | Beranda katalog memuat produk terbaru, rekomendasi barang/jasa dan daftar kerja sama. Bantuan menjelaskan cara memesan atau meminta penawaran. Tautan Inaproc memakai URL penyedia yang diverifikasi pemilik. |

### 4.2 Membuka akun dan mengelola katalog

| Acuan SRS | Kebutuhan dan kriteria penerimaan |
|---|---|
| FR-AK-01–05 | Pengunjung mendaftar dengan nama, email, telepon, kata sandi dan jenis pembeli. Untuk instansi, nama instansi dicatat. Pembeli dapat masuk, keluar, mengubah profil sendiri dan mereset kata sandi. Manipulasi isian registrasi tidak memberikan hak penjual. |
| FR-PNJ-01, 11 | Pengelola masuk ke panel internal yang dibatasi server dan dapat melihat serta menonaktifkan akun pembeli. Pembeli aktif dapat masuk ke area sendiri. Akun yang dinonaktifkan kehilangan akses privat, termasuk lewat sesi yang sebelumnya aktif. |
| FR-PNJ-02–04 | Pengelola membuat, mengubah, menonaktifkan dan menghapus produk/jasa serta mengelola kategori, foto, harga dan stok. Perubahan yang valid terlihat setelah halaman dimuat ulang. Kategori yang masih dipakai tidak dapat dihapus. Produk dengan stok habis diberi penanda dan pemesanannya ditolak server. Kebijakan penghapusan produk bertransaksi serta arti stok kosong menunggu keputusan. |

### 4.3 Membeli langsung atau meminta harga khusus

**Jalur langsung.** Pembeli memilih produk, mengatur jumlah di keranjang, meninjau total, lalu mengisi data checkout. Server memeriksa kembali harga, produk dan ketersediaan, menyimpan order bernomor unik, lalu menyediakan tautan WhatsApp dengan ringkasan order. Jika WhatsApp gagal dibuka, order yang sama masih bisa ditemukan di riwayat.

**Jalur negosiasi.** Pembeli mengajukan RFQ (*request for quotation*) berisi kebutuhan, jumlah, harga yang diinginkan, dan catatan. Penjual membaca permintaan, lalu menerima, menolak, atau membalas dengan harga tandingan. Pembeli membaca balasan dan dapat menyepakati penawaran. SRS mengaitkan satu penawaran dengan satu produk. Cakupan item, aturan revisi, dan pemicu pembuatan order masih menunggu meeting.

| Acuan SRS | Kebutuhan dan kriteria penerimaan |
|---|---|
| FR-PMB-05–07 | Tambah, ubah, dan hapus item tersimpan pada keranjang pembeli. Total dihitung server. Checkout yang valid menghasilkan satu order dan tahap awal **MOU/Pesanan**. Pengiriman ulang permintaan yang sama tidak menggandakan pesanan. Ringkasan WhatsApp mengambil nomor dan rincian dari order tersimpan. |
| FR-PMB-08–09, FR-PNJ-05 | Status acuan ialah **Diajukan, Dibalas, Disepakati, Ditolak**. Pemilik permintaan dapat membaca riwayat balasan, dan penjual menerima pemberitahuan permintaan baru. Hanya penawaran yang disepakati dapat dilanjutkan menjadi order. Harga dan jumlah yang disimpan mengikuti kesepakatan yang diterima. |
| FR-PMB-10–12, FR-PNJ-06–08, 13 | Penjual memverifikasi pembayaran manual dan memperbarui tahap serta resi. Pembeli melihat riwayat dan status terakhir. Bukti pembelian tersedia untuk pesanan sendiri setelah pembayaran dikonfirmasi. Penjual dapat mencetak faktur, bukti pembelian dan dokumen kontrak sesuai format yang disetujui. |

Tahap order menurut SRS adalah **MOU/Pesanan → DP/Verifikasi → Penyiapan Unit → Pengiriman → Serah Terima**. Untuk instansi, pengelola mencatat identitas instansi dan kontrak/SPK. Perlakuan order tunai tanpa DP, koreksi verifikasi, pembatalan, serta bukti serah terima harus mengikuti keputusan mitra.

### 4.4 Mengelola konten dan memantau pekerjaan

| Acuan SRS | Kebutuhan dan kriteria penerimaan |
|---|---|
| FR-PNJ-09–10 | Pengelola memperbarui profil, media, portofolio, testimoni, kontak, tautan, privasi dan legalitas. Perubahan yang dipublikasikan muncul pada halaman terkait. Berkas internal tetap terlindungi ketika alamat unduhan diakses langsung. |
| FR-PNJ-12 | Dashboard menampilkan pesanan baru, penawaran yang menunggu balasan, dan stok menipis dari data tersimpan. Ambang stok menipis perlu ditetapkan sebelum angka dipakai oleh pengelola. |

## 5. Data dan kebutuhan kualitas

**Data yang harus dapat ditelusuri.** Kategori mengelompokkan barang/jasa dan fotonya. Keranjang dimiliki pembeli. RFQ menyimpan pengaju, kebutuhan, balasan, dan status. Order menyimpan pembeli, detail item, jumlah, harga saat transaksi, sumber checkout/penawaran, dan tahap. Pembayaran manual, resi, histori perubahan, dan dokumen terhubung ke order. Perubahan harga katalog setelah transaksi tidak mengubah nilai pada riwayat atau bukti pembelian. Ini adalah kebutuhan data, bukan skema database final.

| Acuan SRS | Target dan cara memeriksa |
|---|---|
| NFR-01, 07, 10 | Ukur beranda maksimal 3 detik dan hasil pencarian maksimal 2 detik pada koneksi normal yang kondisi ujinya dicatat. Siapkan uji kapasitas ratusan produk dan demo minimal lima sampel mitra. Target ketersediaan 99% bergantung pada hosting dan memerlukan pemantauan selama periode yang disepakati. |
| NFR-02–04, 11 | Hash kata sandi, validasi input, lindungi tampilan dari XSS, terapkan HTTPS dan kedaluwarsa sesi tidak aktif. Uji akses lintas akun dan privasi kontrak. Uji berkas tepat 5 MB, di atas batas, dan jenis tidak sesuai. SRS menyebut PDF/JPG/PNG; tentukan daftar per fitur, termasuk apakah WebP pada validator saat ini diterima mitra. |
| NFR-05–06, 09 | Navigasi berbahasa Indonesia, responsif pada ponsel dan komputer. Uji perjalanan utama di Chrome, Firefox, Edge dan Safari. Halaman publik memiliki judul, deskripsi dan URL yang mudah dipahami. |
| NFR-08, 12 | Pengelola dapat mengubah konten tanpa perubahan kode. Jadwalkan backup dan demonstrasikan pemulihan pada lingkungan uji. Periksa hasil unduh/cetak PDF terhadap contoh yang disetujui mitra. |

## 6. Tahapan kerja dan syarat selesai

Tahap 1–3 dapat dimulai dengan keputusan yang tersedia. Pembahasan tahap 4 dapat berjalan bersamaan. Hasil meeting membuka pekerjaan yang bergantung pada keputusan tersebut. Urutan menunjukkan dependensi, bukan komitmen tanggal rilis.

| Tahap | Pekerjaan dan penanggung jawab utama | Syarat selesai |
|---|---|---|
| 1. Acuan kerja | PM dan tim mencocokkan SRS, kode, keputusan mitra, dan daftar pertanyaan. Inventaris data katalog mitra serta lingkungan uji MySQL. | Tim dapat membedakan fitur tersedia, target, serta keputusan tertunda. Tersedia daftar sampel untuk diperiksa pemilik. |
| 2. Akun dan otorisasi | BE melindungi akses server dan menyediakan satu akun pengelola melalui prosedur internal. FE menyelaraskan login, profil, dan navigasi. | Uji tamu, pembeli, dan penjual melalui URL langsung serta permintaan tulis. Registrasi publik tidak dapat memberi hak internal. Katalog publik tetap dapat dibaca tamu. |
| 3. Katalog operasional | BE melengkapi CRUD kategori, produk/jasa dan media. FE menyambungkan panel serta portal pembeli ke data katalog publik yang sudah tersedia. Gunakan skema yang ada sambil menunggu aturan transaksi. | Pemilik dapat memasukkan sampel, mengganti gambar dan menonaktifkan produk. Detail publik mengikuti perubahan dan berkas tidak valid ditolak. |
| 4. Keputusan transaksi | PM memandu meeting memakai contoh satu barang, satu jasa, dan satu pembelian instansi. BE/FE mencatat pilihan mitra dan contoh penerimaan. | Ada keputusan tertulis untuk pertanyaan yang memengaruhi tahap 5–7; pertanyaan yang belum dijawab tetap memiliki pemilik dan tahap terdampak. |
| 5. Keranjang dan penawaran | BE/FE membangun cart persisten dan jalur RFQ, balasan, riwayat serta persetujuan sesuai keputusan. | Dua pembeli memiliki data terpisah. Perubahan jumlah dan balasan bertahan setelah login ulang. Permintaan ditolak atau disepakati sesuai skenario mitra. |
| 6. Order dan pembayaran manual | BE membuat order dari checkout dan penawaran disepakati, menerapkan aturan stok serta verifikasi tunai/DP. FE menampilkan ringkasan dan tautan WhatsApp dari order tersimpan. | Kedua jalur menghasilkan nomor unik, nilai transaksi konsisten, serta status yang dapat diperiksa. Uji pengiriman ganda, stok tidak cukup, dan pembayaran belum dikonfirmasi. |
| 7. Pengiriman dan dokumen | BE/FE menyelesaikan tahap pesanan, riwayat, resi, identitas instansi, dan PDF. Mitra memeriksa format dokumen. | Pembeli dapat mengikuti pesanan sampai serah terima. Dokumen milik pembeli lain dan kontrak internal tidak dapat diunduh pembeli. |
| 8. Profil perusahaan dan pelengkap SRS | Tim melengkapi CMS, legalitas, pengelolaan pembeli, dashboard, perbandingan, rekomendasi, bantuan dan tautan eksternal. Konten publik dapat dikerjakan paralel setelah akses pengelola siap. | Pemilik memperbarui konten tanpa developer. Ringkasan panel sesuai transaksi uji. Mitra menilai kebutuhan pelengkap dan mencatat penundaan jika ada. |
| 9. UAT dan serah terima | Tim uji menjalankan test terkait, build FE, verifikasi pada MySQL serta UAT bersama pemilik. PM mencatat hasil per kebutuhan. | Ada hasil aktual dan daftar masalah beserta keputusan mitra, panduan kerja pengelola, prosedur backup/pemulihan, serta daftar kebutuhan diterima atau ditunda. |

## 7. Agenda keputusan meeting

| Keputusan yang dibutuhkan | Contoh pertanyaan untuk pemilik | Tahap terdampak |
|---|---|---|
| Bentuk dan umur penawaran | Jika pelanggan meminta SSD dan jasa pemasangan, apakah keduanya ada dalam satu RFQ? Siapa yang dapat membalas lagi, kapan harga kedaluwarsa, dan tindakan siapa yang membuat order? | 5–6 |
| Harga, MOQ dan stok | Apakah harga kosong berarti wajib meminta penawaran? Apa arti stok kosong untuk jasa atau indent? Berapa satuan dan jumlah minimum? Kapan stok ditahan, dikurangi atau dikembalikan jika batal? | 3 untuk kebijakan akhir, 5–6 untuk transaksi |
| Verifikasi manual | Apa yang dicatat saat DP dan saat lunas? Siapa mengonfirmasi, bukti apa yang diperlukan, dan tahap apa yang dilalui pembayaran tunai penuh? | 6–7 |
| Pengiriman dan dokumen | Apakah semua order perlu resi, termasuk jasa? Bagaimana serah terima dibuktikan? Minta contoh faktur, bukti pembelian, serta kontrak/SPK dan syarat penerbitannya. | 7 |
| Data publik dan aturan katalog | Produk, harga, foto dan legalitas mana yang boleh dipublikasikan? Boleh menghapus produk yang sudah dipesan? Apakah empat item pembanding dan ambang stok menipis sesuai kebutuhan? | 3 dan 8 |

PM mencatat keputusan, contoh kasus, tanggal, pihak yang menyetujui dan FR terdampak. Sampai ada jawaban, tipe kolom nullable, contoh data workbook dan perilaku mock di UI tetap berstatus asumsi teknis atau bahan diskusi.

## 8. Sumber dan bukti penerimaan

- Sumber lokal `SRS-Website-CV-Putra-Nugrha (2).docx`, terutama §3.1–3.2, use case pembelian dan penawaran, rancangan data §5, dan Lampiran B. ID FR/NFR pada PRD merujuk dokumen ini.
- Sumber lokal `Notulensi Rapat Pengembangan Sistem Web Catalog CP Putra Nugraha.docx` untuk konteks katalog, pembayaran, pengadaan instansi dan SPK. `Katalog_Produk_dan_Jasa_CV_Putra_Nugraha.xlsx` sebagai bahan validasi data bersama pemilik. Berkas sumber tersebut berada di dokum/refrences pada workspace penyusun dan disimpan terpisah dari commit kode/dokumentasi kerja.
- [Matriks kebutuhan backend](../hasil/backend-requirement-traceability-matrix.md) untuk keterlacakan FR, diperbarui pada tahap 1 terhadap commit yang diaudit. [Asumsi Product/Category](../../PRODUCT_CATEGORY_ASSUMPTIONS.md) menjelaskan keputusan skema yang masih perlu konfirmasi.
- Klarifikasi tim pada 9 November 2026 menjadi dasar keputusan satu pengelola, WhatsApp/tunai, MySQL dan unggahan 5 MB. Keputusan terbuka pada bagian 7 dibawa ke meeting mitra.

Untuk setiap skenario UAT, catat FR/NFR, aktor, data uji, langkah, hasil yang diharapkan, hasil aktual, dan keputusan mitra. Lampirkan bukti untuk dua jalur order, akses yang ditolak, publikasi katalog, serta unduh dokumen. Status lulus diisi setelah pengujian dilakukan.
