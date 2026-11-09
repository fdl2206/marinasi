# Product & Category: Asumsi Implementasi Sementara

Dokumen ini mencatat keputusan teknis sementara untuk modul Product & Category. Asumsi perlu ditinjau bersama PM/mitra sebelum dianggap sebagai kontrak bisnis final.

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
- Upload gambar (jika dikirim bersama payload produk) dibatasi JPG/JPEG/PNG/WEBP maksimal 5 MB. Ketentuan ini sementara; SRS memuat batas yang berbeda untuk foto/dokumen.

## Data contoh

`ProductCategorySeeder` merupakan seeder terpisah untuk kategori Komponen Komputer/Layanan IT dan contoh SSD/jasa maintenance. Seeder sengaja tidak dipanggil dari seeder utama dan tidak dijalankan pada MariaDB.

## Belum diputuskan

- Apakah produk boleh berada pada banyak kategori.
- Harga tetap, rentang, estimasi, atau khusus quotation.
- Apakah SKU wajib dan format SKU resmi.
- Unit stok, aturan stok untuk jasa/indent, serta kapan stok dikurangi.
- Definisi MOQ dan apakah pecahan kuantitas diperbolehkan.
- Format spesifikasi dan jumlah foto per produk.
- Batas ukuran/format foto final dan media storage.
- Apakah produk yang pernah dipakai dalam transaksi hanya boleh dinonaktifkan/diarsipkan.
- Apakah kategori nonaktif masih dapat ditampilkan untuk produk lama.

## Batas cakupan

Implementasi ini hanya menyediakan schema, model, relasi, factory, seeder, dan Form Request dasar. Belum ada route/controller CRUD, proses upload file, integrasi halaman React, RFQ, quotation, order, payment, atau shipment.
