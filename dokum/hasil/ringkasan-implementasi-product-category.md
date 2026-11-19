# Ringkasan Implementasi Backend — Product & Category

Pembaruan tahap 3 menyediakan endpoint CRUD kategori/produk dan upload/hapus foto. Form seller dan integrasi portal/detail Buyer menjadi pekerjaan FE sesuai arahan pengguna. Perubahan JSX agen telah dikembalikan. Bagian bertanda tahap 1 di bawah merekam kondisi sebelumnya. Hasil terkini dan prosedur penggunaan ada pada [README](../../README.md).

## Tujuan

Menjelaskan fondasi backend Laravel untuk kategori, barang/jasa, gambar dan katalog publik. Pembaruan tahap 1 pada 9 November 2026 mengacu ke commit `71ffe9c`. Endpoint CRUD seller dan penyimpanan file gambar belum tersedia.

## Perubahan yang Dibuat

### Database

- Migration `2026_11_08_194924_create_categories_table.php` membuat kategori dengan nama unik dan status aktif.
- Migration `2026_11_08_194925_create_products_table.php` membuat produk dengan kategori, nama, tipe, SKU opsional, deskripsi, spesifikasi JSON, harga nullable, stok nullable, unit stok, MOQ opsional, dan status aktif.
- Migration `2026_11_08_194926_create_product_images_table.php` menyimpan beberapa gambar untuk satu produk, termasuk path, alt text, dan urutan.
- Relasi kategori ke produk menggunakan foreign key yang mencegah penghapusan kategori yang masih dipakai. Penghapusan produk menghapus metadata gambar terkait.

### Eloquent

- `Category` memiliki relasi `products()`.
- `Product` memiliki relasi `category()` dan `images()`; gambar diurutkan berdasarkan `sort_order`.
- `ProductImage` memiliki relasi `product()`.
- Cast Eloquent disediakan untuk boolean, decimal, dan specifications JSON.

### Factory, Seeder, dan Validasi

- Factory dibuat untuk Category, Product, dan ProductImage.
- `ProductCategorySeeder` adalah seeder terpisah dengan contoh kategori, barang, dan jasa. Seeder menggunakan `firstOrCreate`. Riwayat eksekusi database tidak diverifikasi pada tahap 1.
- `StoreCategoryRequest` memvalidasi nama kategori unik dan status.
- `StoreProductRequest` memvalidasi kategori aktif, nama, tipe `goods`/`service`, SKU unik, harga/stok nonnegatif, MOQ, specifications, dan unggahan gambar.
- Karena controller dan route CRUD belum termasuk cakupan, Form Request belum terhubung ke endpoint.

### Dokumentasi dan Test

- `PRODUCT_CATEGORY_ASSUMPTIONS.md` mendokumentasikan keputusan sementara dan hal yang perlu dikonfirmasi.
- `tests/Feature/ProductCategoryTest.php` menguji persistensi/relasi, JSON cast, urutan gambar, dan validasi.

### Katalog publik yang sudah ditambahkan

- `PublicCatalogController.php:15` menyediakan pencarian nama/SKU, filter kategori/tipe, pagination dan daftar kategori aktif.
- `PublicCatalogController.php:90` menyediakan detail produk dan menolak produk/kategori nonaktif.
- Respons tersedia melalui props Inertia atau JSON. Halaman React publik sudah menerima data dan mengirim filter ke server.
- `tests/Feature/PublicCatalogControllerTest.php` memuat delapan test katalog publik. Test Product/Category memuat empat test.

## Catatan verifikasi historis

Daftar di bawah berasal dari catatan implementasi sebelumnya. Tahap 1 tidak mengulang perintah tersebut dan tidak mengonfirmasi kondisi koneksi, migration, isi tabel maupun hasil test saat ini. Target database terbaru menurut tim adalah MySQL.

- Koneksi Laravel menggunakan MariaDB `cv_putra_nugraha`; konfigurasi `.env` tidak diubah.
- Ketiga migration katalog berhasil dijalankan secara aditif. Migration baseline tidak diubah.
- `migrate:status` menunjukkan tiga migration baru berstatus **Ran**.
- Tes SQLite in-memory lulus **4 test, 11 assertions**.
- Laravel Pint dijalankan tanpa kegagalan.
- Seeder tidak dijalankan; pemeriksaan tabel menunjukkan **0 categories, 0 products, 0 product_images** setelah migration.
- `php artisan db:table` dapat mengenali tabel, tetapi command melaporkan error pemformatan karena ekstensi PHP `intl` tidak tersedia. Ini tidak menghalangi migration atau test.

## Asumsi Sementara

- Satu produk memiliki satu kategori.
- Tipe produk hanya `goods` atau `service`.
- Harga adalah satu nilai nullable; harga rentang belum didukung.
- Kuantitas stok nullable; jasa boleh tidak memiliki stok numerik.
- Specifications berupa JSON nullable.
- SKU dan MOQ opsional; SKU unik bila diisi.
- Kategori dan produk memiliki status aktif/nonaktif.
- Gambar memakai tabel terpisah; file disimpan sebagai path. Upload/storage file belum diimplementasikan.
- Validator menerima JPG/JPEG/PNG/WEBP maksimal 5 MB. Ukuran 5 MB sudah ditetapkan tim; format per fitur masih perlu diselaraskan.

## Belum Termasuk

- Controller dan route CRUD.
- Integrasi data portal Buyer dan dashboard seller. Katalog publik sudah terhubung ke controller database.
- Penyimpanan file gambar dan penghapusan file fisik.
- RFQ, quotation, order, payment, shipment, autentikasi role, dan otorisasi seller.
- Seeder production atau pengisian database target MySQL.

## Acuan kerja terbaru

[Hasil tahap 1](tahap-1-acuan-kerja.md) memuat keputusan yang tersedia, inventaris katalog XLSX, kesiapan lingkungan uji, serta pertanyaan sebelum transaksi dibangun. Test, build dan pemeriksaan database belum dijalankan pada tahap 1.

## File Implementasi

```text
app/Http/Requests/StoreCategoryRequest.php
app/Http/Requests/StoreProductRequest.php
app/Models/Category.php
app/Models/Product.php
app/Models/ProductImage.php
database/factories/CategoryFactory.php
database/factories/ProductFactory.php
database/factories/ProductImageFactory.php
database/migrations/2026_11_08_194924_create_categories_table.php
database/migrations/2026_11_08_194925_create_products_table.php
database/migrations/2026_11_08_194926_create_product_images_table.php
database/seeders/ProductCategorySeeder.php
tests/Feature/ProductCategoryTest.php
PRODUCT_CATEGORY_ASSUMPTIONS.md
```
