Sistem Informasi Terintegrasi Kaderisasi (SINTAKSIS) PMII UIN Sunan Gunung Djati Cabang Kota Bandung
SINTAKSIS adalah aplikasi web dinamis yang dirancang untuk mengelola berbagai aspek operasional dan kaderisasi di lingkungan Pergerakan Mahasiswa Islam Indonesia (PMII) Komisariat UIN Sunan Gunung Djati Cabang Kota Bandung. Aplikasi ini mencakup manajemen akun, profil rayon, pengajuan surat, berita, kegiatan, galeri, arsip kepengurusan, perpustakaan digital, dan fitur-fitur internal lainnya.

Fitur Utama
Manajemen Akun: Pendaftaran, login, manajemen peran (Kader, Admin Rayon, Admin Komisariat).

Profil Rayon: Informasi detail setiap rayon, dapat diakses publik dan dikelola admin.

Pengajuan & Verifikasi Surat: Sistem alur kerja pengajuan dan verifikasi surat internal.

Berita & Artikel: Publikasi dan manajemen konten berita serta artikel organisasi.

Agenda Kegiatan: Daftar kegiatan yang akan datang dan yang sudah terlaksana, dengan opsi pendaftaran.

Galeri Foto: Arsip foto kegiatan dengan fitur unggah dan verifikasi.

Arsiparis Kepengurusan: Dokumentasi digital struktur kepengurusan dari waktu ke waktu.

Perpustakaan Digital (Digilib): Repositori makalah kader, buku referensi, prosiding seminar, naskah sejarah, dan integrasi OJS.

Dashboard Statistik: Visualisasi data dan laporan aktivitas sistem.

Notifikasi: Sistem notifikasi internal dan eksternal (email/WhatsApp).

TTD Digital & QR Code: Generasi dan verifikasi tanda tangan digital serta QR Code untuk akses cepat.

Teknologi yang Digunakan
Frontend: HTML5, CSS3 (Tailwind CSS), JavaScript (Vanilla JS, Chart.js, Fancybox).

Backend: PHP (dengan struktur MVC kustom atau framework seperti Laravel/Lumen).

Database: MySQL.

Web Server: Apache / Nginx.

Manajemen Dependensi: Composer (PHP), npm/Yarn (JavaScript).

Struktur Direktori Proyek
pmii-web-uin/
├── public/                 # File yang dapat diakses publik (HTML, CSS, JS, Gambar)
│   ├── index.php           # Halaman utama dinamis
│   ├── css/
│   ├── js/
│   ├── img/
│   └── dashboard/          # Halaman-halaman admin/internal
├── app/                    # Kode aplikasi backend (PHP)
│   ├── config/             # Konfigurasi aplikasi
│   ├── core/               # Kelas inti (misal Database.php)
│   ├── controllers/        # Logika API
│   ├── models/             # Interaksi database
│   ├── services/           # Logika bisnis kompleks
│   ├── middleware/         # Filter permintaan
│   └── routes/             # Definisi rute API
├── database/               # Skrip database
│   ├── migrations/         # Skema perubahan database
│   ├── seeds/              # Data awal/dummy
│   └── sql_schemas/        # Skema database lengkap (pmii_uin_bandung_schema.sql)
├── storage/                # Penyimpanan file yang diunggah (non-publik)
├── vendor/                 # Dependensi PHP (Composer)
├── .env                    # Variabel lingkungan (TIDAK DI-COMMIT KE GIT)
├── .gitignore              # Daftar file/folder yang diabaikan Git
├── composer.json           # Konfigurasi Composer
├── package.json            # Konfigurasi npm/Yarn
└── README.md               # Dokumentasi proyek ini


Persiapan & Instalasi
1. Kloning Repositori (Jika menggunakan Git)
git clone [https://github.com/your-username/pmii-web-uin.git](https://github.com/your-username/pmii-web-uin.git)
cd pmii-web-uin

(Ganti URL repositori dengan URL Anda jika sudah ada)

2. Konfigurasi Lingkungan (.env)
Buat salinan file .env.example (jika ada) atau buat file .env baru di root proyek:

cp .env.example .env
# Atau buat manual: touch .env

Buka file .env dan sesuaikan variabel-variabel berikut:

APP_NAME="SINTAKSIS PMII UIN SGD Bandung"
APP_ENV=local
APP_KEY=base64:YOUR_GENERATED_APP_KEY_HERE # **PENTING: Ganti ini dengan kunci unik yang kuat!**
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pmii_uin_bandung
DB_USERNAME=root
DB_PASSWORD=your_mysql_password # **PENTING: Isi password MySQL Anda**

# Konfigurasi Email (opsional)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@pmii-sintaksis.com"
MAIL_FROM_NAME="${APP_NAME}"

# Konfigurasi WhatsApp API (opsional)
# WHATSAPP_API_URL=
# WHATSAPP_API_KEY=
# WHATSAPP_SENDER_ID=

# Konfigurasi OJS API (opsional)
# OJS_BASE_URL=
# OJS_API_KEY=
# OJS_ADMIN_USERNAME=
# OJS_ADMIN_PASSWORD=

Pastikan untuk mengganti placeholder dengan nilai yang sesuai.

3. Instalasi Dependensi PHP (Composer)
Pastikan Anda memiliki Composer terinstal. Kemudian jalankan:

composer install

4. Instalasi Dependensi JavaScript (npm/Yarn)
Pastikan Anda memiliki Node.js dan npm (atau Yarn) terinstal. Kemudian jalankan:

npm install # atau yarn install

5. Konfigurasi Database MySQL
Pastikan MySQL Server Anda berjalan.

Buat database baru dengan nama pmii_uin_bandung:

CREATE DATABASE IF NOT EXISTS pmii_uin_bandung CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

Anda bisa menjalankan ini melalui phpMyAdmin atau CLI MySQL.

Impor skema database dari file SQL yang disediakan:

# Masuk ke database Anda di CLI MySQL: mysql -u root -p pmii_uin_bandung
# Kemudian jalankan:
SOURCE database/sql_schemas/pmii_uin_bandung_schema.sql;

(Ganti root dengan username MySQL Anda jika berbeda)

6. Jalankan Seeder (Data Awal)
Impor data awal ke database Anda (opsional, untuk pengujian):

# Masuk ke database Anda di CLI MySQL: mysql -u root -p pmii_uin_bandung
# Kemudian jalankan setiap file seeder:
SOURCE database/seeds/users_seeder.sql;
SOURCE database/seeds/rayons_seeder.sql;
SOURCE database/seeds/kaders_profile_seeder.sql;
SOURCE database/seeds/site_settings_seeder.sql;
SOURCE database/seeds/homepage_sections_seeder.sql;
SOURCE database/seeds/announcements_seeder.sql;
SOURCE database/seeds/social_media_links_seeder.sql;
SOURCE database/seeds/news_articles_seeder.sql;
SOURCE database/seeds/activities_seeder.sql;
SOURCE database/seeds/gallery_items_seeder.sql;
SOURCE database/seeds/digilib_categories_seeder.sql;
# ... dan seeder lainnya jika ada

7. Buat Tautan Simbolik (Symlink) untuk Storage
Untuk membuat file yang diunggah dapat diakses publik, Anda perlu membuat symlink dari public/storage ke storage/app/public.

# Dari root proyek (pmii-web-uin/)
php -r "symlink('storage/app/public', 'public/storage');"
# Atau secara manual di Linux/macOS:
# ln -s ../storage/app/public public/storage

Pastikan direktori storage/app/public memiliki izin tulis yang benar (misal chmod -R 775 storage/)

8. Konfigurasi Web Server (Apache/Nginx)
Konfigurasi web server Anda (Apache atau Nginx) harus menunjuk DocumentRoot ke direktori public/ di proyek Anda. Ini juga harus mengarahkan semua permintaan yang tidak cocok dengan file fisik ke index.php (Front Controller).

Contoh Konfigurasi Apache (dalam VirtualHost):

<VirtualHost *:80>
    ServerName pmii-uin.test # Ganti dengan domain lokal/produksi Anda
    DocumentRoot "/path/to/your/pmii-web-uin/public"

    <Directory "/path/to/your/pmii-web-uin/public">
        AllowOverride All
        Require all granted
    </Directory>

    RewriteEngine On
    # Tangani Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]

    ErrorLog "${APACHE_LOG_DIR}/pmii-web-uin_error.log"
    CustomLog "${APACHE_LOG_DIR}/pmii-web-uin_access.log" combined
</VirtualHost>

Setelah mengedit konfigurasi server, jangan lupa me-restart layanan Apache/Nginx.

Menjalankan Aplikasi
Setelah semua langkah persiapan selesai, Anda dapat mengakses aplikasi Anda melalui browser:

[http://pmii-uin.test/](http://pmii-uin.test/)   # Jika Anda menggunakan Virtual Host lokal
http://localhost:8000/  # Jika Anda menggunakan server pengembangan PHP built-
