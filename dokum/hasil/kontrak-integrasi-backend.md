# Kontrak Integrasi Backend Marinasi

Diperbarui 9 November 2026. Dokumen ini ditujukan untuk tim FE dan BE. Endpoint yang dicatat sudah tersedia dalam kode. Migration `2026_11_09_100037_add_contact_details_to_users_table.php` telah dijalankan khusus pada database lokal. Lingkungan lain memerlukan migration tersebut sebelum menyimpan field kontak.

## 1. Autentikasi dan respons

- Gunakan session web Laravel dan mekanisme CSRF yang sudah dipakai aplikasi. Inertia memakai cookie sesi yang sama dengan login.
- Akun pembeli memiliki `is_seller=false`. Akun Penjual/Admin memiliki `is_seller=true`. Input portal di form login tidak menentukan kewenangan.
- Tamu yang mengakses halaman privat diarahkan ke login. Permintaan JSON tanpa sesi mendapat 401. Akun yang tidak berwenang mendapat 403.
- Endpoint mutasi di dokumen ini mengembalikan redirect setelah berhasil. Gunakan `useForm` atau router Inertia untuk mengikuti redirect dan menerima props terbaru. Mutasi belum memiliki format respons sukses JSON tersendiri.
- Validasi Inertia dikembalikan melalui session dan `page.props.errors`. Permintaan dengan `Accept: application/json` menerima status 422 dengan `message` dan `errors`. Contoh error field adalah `errors.name`, `errors.category_id`, `errors["images.0"]`.
- Nilai decimal harga/stok diserialisasi sebagai string. ID berupa angka, status aktif berupa boolean, dan data opsional dapat bernilai null. Hindari mengubah null menjadi angka nol saat menampilkan data.
- Seluruh contoh ID, nama, harga dan nomor kontak pada dokumen ini merupakan ilustrasi payload.

## 2. Registrasi dan data profil

### POST register

Route `register` dipakai oleh form registrasi yang sudah ada. Field berikut dikenali backend.

| Field | Ketentuan |
|---|---|
| name | Wajib, string, maksimal 255 karakter. |
| email | Wajib, huruf kecil, format email, unik, maksimal 255 karakter. |
| password | Wajib, sesuai aturan password aplikasi dan harus cocok dengan password_confirmation. |
| phone | Opsional/null, string maksimal 50 karakter. Disimpan sebagai teks agar nol awal dan tanda + tetap tersedia. Format internasional belum diwajibkan. |
| company_name | Opsional/null, string maksimal 255 karakter. Field ini tidak otomatis menetapkan jenis buyer umum/instansi. |
| company_address | Opsional/null, string maksimal 2000 karakter. Alamat dasar perusahaan/instansi, belum menjadi alamat pengiriman atau penagihan transaksi. |

Berhasil membuat akun pembeli, masuk ke akun tersebut dan redirect ke route dashboard. Field is_seller, role atau portal dari registrasi tidak memberikan akses internal. Checkbox terms pada FE belum memiliki pencatatan persetujuan/versioning di backend. Kebutuhan persetujuan dan teks final dibahas tim, bukan ditafsirkan sebagai kebijakan baru dari dokumen ini.

### GET buyer/profile

Route `buyer.profile.index`, hanya pembeli. Respons Inertia memakai komponen `Buyer/Profile/Index`. Header `Accept: application/json` menghasilkan objek JSON dengan bentuk yang sama dengan props di bawah.

```json
{
  "profile": {
    "name": "Pembeli",
    "email": "buyer@example.com",
    "phone": "08123456789",
    "company_name": "CV Contoh",
    "company_address": "Jalan Contoh 10"
  },
  "companyProfile": {
    "company_name": "CV Contoh",
    "company_address": "Jalan Contoh 10",
    "phone": "08123456789",
    "business_entity": "",
    "npwp_number": "",
    "npwp_name": "",
    "npwp_address": "",
    "tax_status": "",
    "sppkp_file": "",
    "nib_number": "",
    "top_terms": "",
    "top_status": ""
  },
  "pics": [],
  "addresses": []
}
```

Data selalu diambil dari akun yang sedang login. Parameter user_id/id tidak memilih akun lain. Field kontak yang belum diisi bernilai null pada profile dan string kosong pada companyProfile untuk kompatibilitas input FE. Status perpajakan/termin tidak diisi dengan klaim verifikasi atau persetujuan. PIC tambahan dan daftar alamat terpisah belum diimplementasikan.

Props companyProfile/pics/addresses mengisi kontrak halaman FE yang ada agar fallback contoh profil tidak dipakai. Tombol simpan pada JSX saat ini masih menggunakan timer lokal. Badge serta teks statis lain di halaman tetap perlu diperiksa FE ketika menghubungkan data aktual.

### PATCH buyer/profile

Route `buyer.profile.update`, hanya pembeli. Body berupa field datar berikut.

```json
{
  "phone": "08123456789",
  "company_name": "CV Contoh Baru",
  "company_address": "Jalan Contoh 11"
}
```

Ketiga field opsional dan memakai batas yang sama dengan registrasi. Field yang tidak dikirim mempertahankan nilai lama. Kirim null atau string kosong untuk menghapus nilai. Berhasil redirect ke buyer.profile.index. Endpoint menyimpan field tervalidasi pada akun sesi, tidak menerima pemilihan akun tujuan.

Nama dan email akun tetap dapat diubah melalui PATCH profile, route `profile.update`. Endpoint tersebut membutuhkan name dan email, dan kini juga menerima tiga field kontak opsional. Perubahan email mengosongkan email_verified_at. Jika field kontak tidak dikirim, nilai lamanya dipertahankan.

## 3. Panel katalog seller

Semua endpoint seller membutuhkan akun Penjual/Admin.

### GET seller/catalog

Route `seller.catalog.index`. Respons berupa props Inertia untuk `Seller/Catalog/Index`. Halaman FE saat ini masih placeholder. Query search opsional, string maksimal 255 karakter, mencari nama atau SKU. Query page mengikuti pagination Laravel, 15 produk per halaman.

| Prop | Bentuk |
|---|---|
| products | Paginator Laravel dengan data, current_page, last_page, total, prev_page_url dan next_page_url. Item diurutkan ID terbaru, termasuk produk nonaktif. |
| products.data[] | Field model products beserta relasi category dan images. category memuat is_active. images diurutkan sort_order. |
| categories | Array seluruh kategori aktif/nonaktif, dengan id, name, is_active, products_count dan timestamp. |
| filters | Objek search, berupa string kosong jika filter tidak dipakai. |

Setiap gambar memuat id, product_id, path, url, alt_text dan sort_order. Gunakan url untuk src gambar. path adalah lokasi relatif pada disk public. Timestamp tambahan dapat disertakan model.

### Kategori

| Metode dan path | Nama route | Body / hasil |
|---|---|---|
| POST seller/categories | seller.categories.store | name wajib, string maksimal 255 dan unik. is_active opsional boolean, default database true. |
| PUT atau PATCH seller/categories/{category} | seller.categories.update | name wajib dan unik selain kategori sendiri. is_active opsional boolean. |
| DELETE seller/categories/{category} | seller.categories.destroy | Body kosong. Kategori yang masih digunakan ditolak melalui error field category. |

Semua mutasi berhasil redirect ke seller.catalog.index. Nonaktifnya kategori membuat produk di kategori tersebut tidak tampil pada katalog publik. Produk tersebut tetap tersedia dalam data panel seller.

### Produk dan jasa

| Metode dan path | Nama route | Hasil |
|---|---|---|
| POST seller/products | seller.products.store | Membuat produk dan menambahkan foto. |
| PUT atau PATCH seller/products/{product} | seller.products.update | Memperbarui field produk dan menambahkan foto baru. |
| DELETE seller/products/{product} | seller.products.destroy | Menghapus produk dan metadata fotonya, lalu membersihkan file pada disk public. |
| DELETE seller/products/{product}/images/{image} | seller.products.images.destroy | Menghapus satu foto. Foto harus milik produk pada path; ketidakcocokan mendapat 404. |

Semua mutasi berhasil redirect ke seller.catalog.index. Kegagalan pembersihan file setelah penghapusan database dicatat pada log untuk ditindaklanjuti BE.

| Field produk | Ketentuan |
|---|---|
| category_id | Wajib, integer kategori aktif. Saat update, kategori lama yang nonaktif boleh tetap dipertahankan. |
| name | Wajib, string maksimal 255. |
| type | Wajib, goods atau service. |
| sku | Opsional/null, string maksimal 255, unik selain produk sendiri saat update. |
| description | Opsional/null, string. |
| specifications | Opsional/null, array/objek. Contoh {"kapasitas":"256 GB"}. |
| price | Opsional/null, nonnegatif, maksimal 9999999999999.99 dan dua angka desimal. Satu harga acuan sesuai skema saat ini. |
| stock_quantity | Opsional/null, nonnegatif, maksimal 999999999.999 dan tiga angka desimal. |
| stock_unit | Opsional/null, string maksimal 50. |
| moq | Opsional/null, integer antara 1 dan 4294967295. |
| is_active | Opsional, boolean. Produk baru default database true. |
| images | Opsional, array file gambar JPG/JPEG/PNG/WebP, maksimal 5120 KB per berkas. Foto ditambahkan setelah foto lama dalam urutan sort_order. |

Update tetap memerlukan name, type dan category_id. Field opsional yang tidak dikirim dipertahankan. Kirim null untuk menghapus nilai opsional, termasuk specifications. Jangan mengirim path/url file sebagai pengganti array file images. Penghapusan gambar menggunakan endpoint tersendiri.

Untuk upload melalui Inertia, gunakan POST FormData dan method spoofing saat memperbarui.

```jsx
form.transform(data => ({ ...data, _method: 'put' }));
form.post(route('seller.products.update', product.id), {
    forceFormData: true,
    preserveScroll: true,
});
```

Pada FormData, gunakan images[0], images[1], dan seterusnya untuk file. Objek spesifikasi dapat dikirim sebagai specifications[kapasitas]. Gunakan representasi boolean 1/0. Untuk mengosongkan spesifikasi di FormData, kirim string kosong sehingga middleware Laravel mengubahnya menjadi null.

Penyimpanan metadata menggunakan transaksi. Jika terjadi kegagalan database setelah upload baru, metadata di-rollback dan file baru dibersihkan. Harga/stok nullable serta batas format berkas mengikuti implementasi yang tersedia. Aturan harga rentang, stok transaksi, pemesanan jasa dan produk yang pernah ditransaksikan tetap memerlukan keputusan mitra.

## 4. Katalog publik

GET katalog dan GET katalog/{product} tetap dapat dibaca tamu. Prop Inertia atau JSON dari endpoint ini dapat dipakai untuk menghubungkan komponen katalog FE.

| Query pada GET katalog | Ketentuan |
|---|---|
| search | Opsional, nama/SKU, maksimal 255 karakter. |
| category_id | Opsional, ID kategori yang ada. Hasil tetap dibatasi pada kategori aktif. |
| type | Opsional, goods/service. |
| page | Opsional, integer minimal 1. |
| per_page | Opsional, integer 1–100; default 12. |

Respons JSON daftar memuat data, links (first/last/prev/next), meta pagination, filters dan categories. Props Inertia memuat products sebagai array, categories, filters, pagination dan paginationLinks (previous/next).

Respons JSON detail memuat objek product. Objek produk berisi id, category (id/name), name, type, sku, description, specifications, price, stock_quantity, stock_unit, moq, is_active dan images. Gambar berisi id, path, url, alt_text serta sort_order. Produk/kategori nonaktif dan produk tidak ditemukan menghasilkan 404 pada detail.

Halaman Buyer/Home dan Buyer/Products saat ini masih memerlukan integrasi data dari FE. Layout serta JSX-nya dipertahankan. Endpoint cart, RFQ, checkout dan transaksi belum menyediakan persistensi domain.

## 5. Aktivasi dan pemeriksaan tim

1. Pada lingkungan baru, jalankan migration kontak setelah memastikan target database. File migration menambahkan kolom nullable agar akun lama tetap tersedia. Pada database lokal, perintah migrate khusus file tersebut selesai berhasil pada 9 November 2026.
2. Untuk seller, gunakan akun yang sudah memiliki akses Penjual/Admin. Pastikan tautan storage tersedia pada lingkungan baru melalui artisan storage:link.
3. Periksa registrasi lewat form FE yang sudah ada. Data kontak kini diterima backend. Penyajian error tambahan pada field telepon/perusahaan/alamat perlu dihubungkan FE bila belum tersedia.
4. Hubungkan tombol simpan profil ke buyer.profile.update dan form katalog ke route di atas. Uji validasi, hak akses, reload setelah menyimpan, foto 5 MB, serta penolakan foto di atas batas.
5. Catat hasil uji MySQL dan UAT bersama pemilik. Test SQLite in-memory memverifikasi logika yang tersedia, sedangkan target aplikasi tetap MySQL sesuai keputusan tim.

Verifikasi pengerjaan ini menghasilkan 140 test dan 552 assertions lulus pada SQLite in-memory, serta Pint berhasil. Migration aditif berhasil pada koneksi database lokal aplikasi. Test suite yang menggunakan refresh database tidak dijalankan pada database lokal berisi akun pengguna.
