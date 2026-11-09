# Tahap 1 — Acuan Kerja Marinasi

Tanggal pencatatan 9 November 2026. Acuan kode branch `be/denis`, commit `71ffe9c`. Dokumen ini merupakan hasil penyelarasan kebutuhan, keputusan tim dan fakta repository untuk melanjutkan pengembangan.

## 1. Hasil dan status

| Hasil tahap 1 | Status |
|---|---|
| Acuan kebutuhan dan tahap kerja | PRD tersedia. Matriks FR, ringkasan Product/Category, asumsi dan pengantar README diselaraskan terhadap kode katalog terbaru. |
| Keputusan yang tersedia | Dicatat pada bagian 2 beserta sumbernya. |
| Keputusan tertunda | Agenda pada bagian 5 siap dipakai saat meeting, dengan pemilik tindak lanjut dan tahap terdampak. |
| Inventaris katalog | Empat sheet sumber diperiksa read-only. Lima calon sampel dipilih untuk diperiksa pemilik, belum disetujui untuk publikasi. |
| Lingkungan uji | Konfigurasi dan ekstensi terinventarisasi. Koneksi dan versi MySQL aktual belum terverifikasi. Tindak lanjut dicatat pada bagian 4. |

Penyusunan acuan tahap 1 selesai. Pengesahan data produk oleh pemilik dan verifikasi server MySQL tetap menjadi pekerjaan terbuka yang tercatat. Persetujuan keputusan transaksi dilakukan pada tahap 4.

## 2. Keputusan yang dapat dipakai

| Keputusan | Sumber dan batas penerapan |
|---|---|
| Penjual sekaligus Admin merupakan satu aktor | SRS §2 dan §3.1.4 serta klarifikasi pengguna. URL admin/seller tidak mewakili dua role bisnis. |
| Sementara hanya pemilik yang mengelola perusahaan | Klarifikasi pengguna pada chat 9 November 2026. Jumlah staf tambahan belum menjadi kebutuhan pengembangan ini. |
| Koordinasi pembayaran WhatsApp/tunai | Klarifikasi pengguna, sejalan dengan FR-PMB-07. Rincian DP/pelunasan masih perlu meeting. Penyesuaian tampilan dikoordinasikan dengan FE. |
| Database target MySQL | Klarifikasi terbaru pengguna menggantikan SQL Server pada SRS serta konteks MariaDB awal. Versi server dan keberadaan database `cv_putra_nugraha` belum diverifikasi. |
| Maksimal 5 MB per berkas unggahan | Klarifikasi pengguna menyelesaikan konflik angka pada SRS. Format dan jumlah berkas per fitur masih perlu ditentukan. |

Klarifikasi tersebut berasal dari anggota tim proyek. Catatan pengesahan langsung pemilik dapat ditambahkan setelah meeting. Skema nullable, harga tunggal, MOQ dan SKU yang ada di kode tetap merupakan pilihan implementasi sementara.

## 3. Katalog sumber dan sampel untuk mitra

Sumber lokal `dokum/refrences/Katalog_Produk_dan_Jasa_CV_Putra_Nugraha.xlsx`, yang disimpan terpisah dari commit kode dan dokumentasi kerja. Inventaris dihitung dari baris item bernomor, dengan header/judul dikecualikan. Data dibaca dari sel sumber OOXML, tanpa mengubah atau menghitung ulang workbook. Formula ringkasan tidak dipakai untuk menetapkan jumlah.

### Struktur dan jumlah

| Sheet | Area terisi yang terdeteksi | Temuan |
|---|---|---|
| Ringkasan & Dashboard | A1:G16 | Ringkasan sepuluh kategori aktif dan satu kelompok belum aktif. Sheet ringkasan mengulang data sheet detail. |
| Katalog Aktif | A1:H118 | 113 item pada baris 5–117, terdiri dari 74 Barang dan 39 Jasa. Memiliki kategori, nama, jenis, harga minimum/maksimum, label harga dan lokasi halaman sumber. |
| Katalog Belum Aktif | A1:G76 | 71 item bernomor. Status belum aktif merupakan label workbook. |
| Semua Data (Master) | A1:H188 | 184 item bernomor. Jumlah sesuai 113 + 71. Ini pemeriksaan jumlah, belum pembuktian identitas/deduplikasi setiap record antar-sheet. |

Status “Aktif” menjelaskan isi dokumen sumber, belum menjadi keputusan publikasi di website. Master dan sheet detail memuat representasi katalog yang sama sehingga tidak boleh dijumlahkan sebagai item baru saat pemetaan impor.

| Kategori pada Katalog Aktif | Jumlah item |
|---|---|
| Layanan Servis, Perbaikan & Pemeliharaan IT | 13 |
| Layanan Servis Printer, Fotokopi & Peralatan Kantor | 12 |
| Jasa Teknik, AC, Kelistrikan & Fasilitas | 12 |
| Perangkat Keras, Komponen & Aksesoris PC/Laptop | 21 |
| Perangkat Jaringan (Networking) & Komunikasi | 8 |
| Printer, Mesin Kantor, Suku Cadang & Tinta/Toner | 18 |
| Software & Lisensi | 3 |
| Kelistrikan, Baterai, Perkakas & Pelumas | 16 |
| Perlengkapan Kantor & Keamanan | 5 |
| Lainnya | 5 |
| **Total** | **113** |

### Pemetaan yang perlu perhatian

- Sebanyak 16 dari 113 item aktif memiliki harga minimum berbeda dari maksimum pada kolom E/F. Skema `products.price` hanya satu nilai nullable. Pilihan harga minimum, rentang, atau harga khusus RFQ harus diputuskan mitra sebelum pemetaan harga.
- Kolom Jenis menggunakan Barang/Jasa. Kode memakai `goods/service`. Pemetaan istilah dapat disepakati tanpa mengubah data sumber.
- Stok, unit stok, MOQ, SKU, deskripsi terstruktur, spesifikasi dan lokasi file foto tidak tersedia sebagai kolom pada Katalog Aktif A:H. Jangan mengisi angka stok atau SKU hasil karangan. Arsip workbook tidak memiliki berkas gambar pada `xl/media`.
- Kelompok “Belum Aktif” pada master merupakan status pengelompokan dokumen. Jangan otomatis menjadikannya kategori bisnis baru pada website.
- Sebagian nama menyatukan beberapa varian seperti RAM DDR3/DDR4 dan SSD SATA. Perlu diputuskan apakah dipisah menjadi produk atau disajikan sebagai satu layanan/produk dengan spesifikasi yang jelas.
- Harga sumber belum dibuktikan masih berlaku, termasuk pajak, ongkos kirim dan jasa pemasangan. Nilai nol pada item belum aktif perlu ditanyakan sebelum dianggap harga jual.

### Lima calon sampel

Pemilihan berikut merupakan usulan tim untuk mencakup barang/jasa dengan harga tunggal dan rentang. Semua berstatus **menunggu pemeriksaan pemilik**.

| Sel pada Katalog Aktif | Nama persis dari sumber | Jenis | Harga sumber | Pertanyaan saat validasi |
|---|---|---|---|---|
| C45:F45 | SSD V-GeN 256GB | Barang | Rp450.000 | Konfirmasi model, harga, satuan, stok, garansi dan foto. |
| C46:F46 | SSD SATA 2.5" | Barang | Rp450.000–Rp650.000 | Varian apa yang membedakan harga? Apakah perlu produk terpisah? |
| C50:F50 | RAM PC DDR3 / DDR4 V-GeN | Barang | Rp450.000 | Konfirmasi kapasitas/varian. Apakah satu harga berlaku untuk semua varian? |
| C5:F5 | Jasa Recovery Back Up Data | Jasa | Rp50.000 | Konfirmasi cakupan pekerjaan, satuan biaya dan kapan perlu RFQ. |
| C8:F8 | Jasa Service Komputer / Perawatan PC | Jasa | Rp100.000–Rp150.000 | Konfirmasi dasar harga dan apakah komponen pengganti ditagih terpisah. |

PM mencatat untuk tiap sampel tanggal pemeriksaan, nama pemeriksa, koreksi nama/kategori/harga, data stok atau arti stok kosong, foto yang boleh dipakai, serta izin publikasi. Pilihan boleh diganti pemilik. Referensi sel mempertahankan lokasi sumber jika sampel diganti.

## 4. Inventaris lingkungan dan bukti pengujian

| Pemeriksaan | Hasil aktual | Implikasi |
|---|---|---|
| Git | Branch `be/denis`, HEAD `71ffe9c`. Folder `dokum/` sudah untracked sejak awal audit. | Perubahan lokal dipertahankan. Dokumen sumber lokal belum menjadi bukti yang committed. |
| Dependency PHP | Audit sebelumnya menjalankan `composer show --direct`: Laravel 13.37.0, Inertia Laravel 2.0.28, PHPUnit 12.5.40. PHP CLI 8.5.12. | Versi manifest Laravel 13 dan PHP ^8.3 sesuai arah platform. |
| Driver PHP | `php -m` menemukan PDO, pdo_mysql dan pdo_sqlite. | Driver MySQL tersedia pada CLI yang diperiksa. Ini belum membuktikan koneksi. |
| Executable database | `Get-Command mysql,mysqld,mariadb` tidak menemukan executable pada PATH. | Client/server mungkin tersedia melalui instalasi lain, container, atau host terpisah. Lokasinya belum diketahui. |
| Windows services | Pemeriksaan awal ditolak Windows. Pemeriksaan read-only dengan izin tambahan kemudian berhasil dan tidak menemukan nama layanan yang cocok dengan mysql/maria. | Belum ada bukti server MySQL yang berjalan. Hasil ini tidak mencakup container atau server remote. |
| Konfigurasi repository | `config/database.php:20` fallback SQLite; koneksi mysql pada baris 47 dan mariadb pada baris 67 tersedia. | Pilihan engine di konfigurasi belum membuktikan engine aktif. |
| PHPUnit | `phpunit.xml:24` memakai SQLite `:memory:`. Test Product/Category, katalog publik, auth dan profil tersedia. | Test suite bukan konfigurasi uji MySQL. Test belum dijalankan pada tahap 1. |
| Build | `package.json` menyediakan script build Vite. Artefak build sudah ditemukan pada audit awal. | Build terbaru belum dijalankan. Artefak lama tidak memberi hasil verifikasi source saat ini. |

**Persiapan uji MySQL yang perlu dituntaskan saat lingkungan tersedia**

1. BE mengidentifikasi server/container dan mencatat versi engine dari sumber runtime yang aman, tanpa menyalin kredensial ke dokumen.
2. BE bersama pemilik lingkungan memastikan database khusus pengujian terpisah dari database operasional `cv_putra_nugraha`. Test Laravel yang memakai refresh database dapat menghapus tabel pada database yang ditunjuk.
3. Setelah lingkungan uji siap dan pekerjaan implementasi terkait diizinkan, catat pemeriksaan koneksi, status skema, serta hasil test relevan pada MySQL. Jangan memakai klaim hasil SQLite sebagai hasil MySQL.

Tahap 1 tidak membaca `.env`, membuat database, menjalankan migration/seeder atau mengeksekusi test yang menulis data. Riwayat “4 test, 11 assertions”, tabel kosong dan migration Ran pada catatan lama diberi label historis pada ringkasan Product/Category.

## 5. Keputusan tertunda dan pemilik tindak lanjut

Penanggung jawab di tabel adalah peran yang diusulkan untuk koordinasi. PM menetapkan nama orangnya bersama tim.

| ID pembahasan | Pertanyaan yang harus menghasilkan keputusan | Penjawab / pencatat | Dibutuhkan sebelum |
|---|---|---|---|
| T1-01 | RFQ satu produk seperti rancangan data SRS atau beberapa item? Bagaimana counteroffer, revisi, masa berlaku dan pemicu order? | Pemilik / PM dibantu BE-FE | Tahap 5 dan 6 |
| T1-02 | Apa arti harga/stok kosong, kuantitas pecahan, MOQ dan satuan jasa? Bagaimana 16 harga rentang dipetakan dan varian dipisah? | Pemilik / PM-BE | Kebijakan akhir katalog tahap 3 dan transaksi tahap 5 |
| T1-03 | Kapan stok dicadangkan/dikurangi dan dipulihkan? Siapa boleh membatalkan, sampai tahap apa, serta apa akibatnya untuk DP? | Pemilik / PM-BE | Tahap 6 |
| T1-04 | Apa bukti, nominal dan waktu pencatatan tunai/DP/lunas? Bagaimana koreksi kesalahan dan alur order yang dibayar penuh? | Pemilik / PM-BE-FE | Tahap 6 |
| T1-05 | Apakah jasa dan ambil di tempat perlu tahap pengiriman/resi? Apa bukti serah terima? | Pemilik / PM | Tahap 7 |
| T1-06 | Format, penomoran, syarat terbit dan akses faktur/bukti pembelian/kontrak? Legalitas mana yang publik? | Pemilik / PM-FE-BE | Tahap 7 dan 8 |
| T1-07 | Apakah JPG/PNG/PDF cukup per fitur? WebP, jumlah foto dan penghapusan produk yang pernah ditransaksikan bagaimana? | Pemilik / PM-BE | Tahap 3 |
| T1-08 | Data lima sampel, kontak WhatsApp, tautan Inaproc, kategori dan konten mana yang disetujui publikasi? | Pemilik / PM-FE | Demo katalog dan tahap 8 |
| T1-09 | Apakah /admin dan /seller menjadi alias panel yang sama? Bagaimana penyiapan awal dan pemulihan akses akun pengelola? | Tim BE-FE dan pemilik / PM | Tahap 2 |
| T1-10 | Versi/lokasi server MySQL dan database uji yang boleh digunakan? | Pemilik lingkungan / BE | Pengujian MySQL |

ID T1 dipakai untuk agenda tindak lanjut, bukan ID requirement SRS. Setelah meeting, PM mencatat keputusan, contoh kasus, tanggal dan pihak yang menyetujui, lalu memperbarui PRD/matriks yang terdampak.

## 6. Acuan pekerjaan berikutnya

Tahap 2 dapat mulai dari pembatasan Pengunjung, Pembeli dan Penjual/Admin serta pengujian akses. Tahap 3 dapat melengkapi CRUD dan unggahan memakai fondasi yang ada. Aturan transaksi dan pemetaan harga/stok mengikuti keputusan terbuka di atas.

- [PRD dan tahapan](../refrences/PRD-Marinasi.md)
- [Matriks FR](backend-requirement-traceability-matrix.md)
- [Ringkasan Product/Category](ringkasan-implementasi-product-category.md)
- [Asumsi skema](../../PRODUCT_CATEGORY_ASSUMPTIONS.md)
