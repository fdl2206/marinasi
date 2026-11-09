# Product & Category: Asumsi Implementasi Sementara

Dokumen ini mencatat keputusan teknis sementara untuk modul Product & Category. Asumsi perlu ditinjau bersama PM/mitra sebelum dianggap sebagai kontrak bisnis final.

Pembaruan tahap 1 pada 9 November 2026 menggunakan commit `71ffe9c`. Tim telah menetapkan MySQL dan batas unggahan **5 MB per berkas**. Makna harga/stok nullable, SKU, MOQ, rentang harga dan kebijakan transaksi masih perlu keputusan mitra. Lihat [acuan kerja tahap 1](dokum/hasil/tahap-1-acuan-kerja.md).

## Skema yang diterapkan

- Satu produk memiliki satu kategori melalui `products.category_id`; kategori tidak dapat dihapus selama masih direferensikan produk (`restrictOnDelete`).
- Kategori mempunyai nama unik dan `is_active` default `true`.
- Produk memiliki `type` bernilai `goods` atau `service`.
- `price` nullable, berupa satu nilai desimal 15,2; model harga rentang/estimasi belum diterapkan.
- `stock_quantity` nullable berupa desimal 12,3. Jasa dapat tidak mempunyai stok kuantitatif.
- `stock_unit` nullable hanya sebagai unit tampilan; makna/unit final belum ditentukan.
- `specifications` nullable disimpan sebagai JSON dan dicast menjadi array oleh Eloquent.
- `sku` nullable dan unik jika diisi. `moq` nullable dan bilangan bulat positif jika diisi.
- Produk memiliki `is_active` default `true`; status aktif berbeda dari ketersediaan stok.
- Gambar disimpan pada tabel `product_images` dengan path, alt text opsional, dan urutan. File gambar sendiri belum diunggah/disimpan oleh implementasi ini.
- Penghapusan kategori direstrict saat dipakai; penghapusan produk menghapus metadata gambar terkait melalui cascade. Kebijakan arsip produk yang sudah dipakai transaksi belum diterapkan karena modul transaksi belum dibuat.

## Validasi sementara

- Nama kategori wajib, teks maksimal 255 karakter dan unik.
- Nama produk wajib maksimal 255 karakter; kategori harus ada dan aktif.
- Tipe produk wajib `goods` atau `service`.
- Harga dan stok, bila diisi, tidak negatif. `moq`, bila diisi, minimal 1.
- SKU, bila diisi, unik.
- Spesifikasi harus berupa array/struktur JSON.
- Upload gambar pada validator dibatasi JPG/JPEG/PNG/WEBP maksimal 5 MB. Ukuran 5 MB sudah diputuskan tim; jenis berkas, termasuk WebP, masih perlu diselaraskan per fitur dengan SRS.

## Data contoh

`ProductCategorySeeder` merupakan seeder terpisah untuk kategori Komponen Komputer/Layanan IT dan contoh SSD/jasa maintenance. Riwayat eksekusinya tidak diverifikasi pada tahap 1. Katalog XLSX sumber berisi harga rentang untuk 16 dari 113 item berlabel aktif; pemetaan ke satu nilai `price` menunggu keputusan mitra.

## Belum diputuskan

- Apakah produk boleh berada pada banyak kategori.
- Harga tetap, rentang, estimasi, atau khusus quotation.
- Apakah SKU wajib dan format SKU resmi.
- Unit stok, aturan stok untuk jasa/indent, serta kapan stok dikurangi.
- Definisi MOQ dan apakah pecahan kuantitas diperbolehkan.
- Format spesifikasi dan jumlah foto per produk.
- Format foto per fitur dan media storage; ukuran final sudah 5 MB.
- Apakah produk yang pernah dipakai dalam transaksi hanya boleh dinonaktifkan/diarsipkan.
- Apakah kategori nonaktif masih dapat ditampilkan untuk produk lama.

## Batas cakupan

Pembaruan tahap 3 menyediakan endpoint CRUD seller untuk kategori dan produk/jasa, unggahan foto pada disk public serta hapus file gambar. Katalog publik memakai PublicCatalogController untuk daftar, filter dan detail. Form seller serta integrasi portal/detail Buyer menjadi pekerjaan FE. Perubahan JSX buatan agen telah dikembalikan sesuai arahan pengguna. RFQ, quotation, order, payment, dan shipment masih perlu dilengkapi. Batas format gambar mengikuti validator yang sudah ada (JPG/PNG/WebP); belum ada perubahan keputusan harga rentang atau stok transaksi.
