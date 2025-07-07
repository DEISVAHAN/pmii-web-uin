<?php
// public/akses-ojs.php

// --- INISIALISASI BACKEND DAN DATA AWAL ---
require_once __DIR__ . '/../vendor/autoload.php';

// Muat variabel lingkungan dari .env
\App\Core\DotenvLoader::load();

// Asumsi: Data pengguna yang login akan tersedia di $_SERVER['user_data']
$loggedInUser = $_SERVER['user_data'] ?? null;

// Injeksi data pengguna yang login ke JavaScript
$loggedInUserJson = json_encode($loggedInUser);

?>
<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jurnal Al Harokah - Open Journal System | PK PMII UIN SGD Bandung</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="icon" href="img/logo-pmii.png" type="image/png" onerror="this.onerror=null;this.src='https://placehold.co/32x32/005c97/FFFFFF?text=P';">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Memuat CSS eksternal -->
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/akses-ojs.css">
</head>
<body>

    <!-- Header section -->
    <header class="ojs-header py-3">
        <div class="container mx-auto px-4 lg:px-8 flex justify-between items-center">
            <a href="#" id="home-link" class="flex items-center space-x-2.5">
                <img src="img/logo-pmii.png" alt="Logo PMII" class="h-9 w-9 rounded-full" onerror="this.onerror=null;this.src='https://placehold.co/36x36/005c97/FFFFFF?text=P';">
                <div>
                    <span class="text-base md:text-lg logo-text block">Jurnal Al Harokah</span>
                    <span class="text-xs text-gray-200">P-ISSN: 2580-0000 | E-ISSN: 2580-1111</span>
                </div>
            </a>
            <nav class="ojs-header-nav hidden md:flex space-x-2 items-center">
                <a href="#" id="desktop-home-link" class="text-sm active">Beranda</a>
                <a href="#" class="text-sm">Arsip</a>
                <a href="#" id="ojs-submit-link" class="text-sm">Submit Artikel</a>
                <a href="#" class="text-sm">Etika & Kebijakan</a>
                <a href="#" class="text-sm">Dewan Editor</a>
                <a href="#" id="panduan-penulis-desktop-link" class="text-sm">Panduan Penulis</a>
                <a href="#" class="text-sm">Kontak</a>
                <a href="#" id="ojs-login-logout-link" class="text-sm">Login</a>
            </nav>
            <div class="md:hidden">
                <button id="mobile-ojs-menu-button" class="text-white p-2 focus:outline-none">
                    <i class="fas fa-bars text-xl"></i>
                </button>
            </div>
        </div>
        <!-- Mobile menu, hidden by default -->
        <div id="mobile-ojs-menu" class="md:hidden bg-pmii-darkblue/90 backdrop-blur-sm absolute top-full left-0 right-0 hidden animate-fadeInUp" style="animation-duration: 0.3s;">
            <nav class="flex flex-col p-4 space-y-2">
                <a href="#" id="mobile-home-link" class="text-white hover:bg-pmii-blue/50 px-3 py-2 rounded-md text-sm">Beranda</a>
                <a href="#" class="text-white hover:bg-pmii-blue/50 px-3 py-2 rounded-md text-sm">Arsip</a>
                <a href="#" id="mobile-ojs-submit-link" class="text-white hover:bg-pmii-blue/50 px-3 py-2 rounded-md text-sm">Submit Artikel</a>
                <a href="#" class="text-white hover:bg-pmii-blue/50 px-3 py-2 rounded-md text-sm">Etika & Kebijakan</a>
                <a href="#" class="text-white hover:bg-pmii-blue/50 px-3 py-2 rounded-md text-sm">Dewan Editor</a>
                <a href="#" id="panduan-penulis-mobile-link" class="text-white hover:bg-pmii-blue/50 px-3 py-2 rounded-md text-sm">Panduan Penulis</a>
                <a href="#" class="text-white hover:bg-pmii-blue/50 px-3 py-2 rounded-md text-sm">Kontak</a>
                <a href="#" id="mobile-ojs-login-logout-link" class="text-white hover:bg-pmii-blue/50 px-3 py-2 rounded-md text-sm">Login</a>
                 <a href="#" id="mobile-ojs-upload-link" class="text-pmii-yellow hover:bg-pmii-blue/50 px-3 py-2 rounded-md text-sm hidden"><i class="fas fa-upload mr-2"></i>Unggah Jurnal</a>
            </nav>
        </div>
    </header>

    <div class="main-content-area">
        <!-- Hero section with journal title and search bar -->
        <section id="hero-section-ojs" class="ojs-hero animate-fadeInUp">
            <div class="ojs-hero-content">
                <h1 id="ojs-journal-title">Jurnal Al Harokah</h1> 
                <p>Wadah Publikasi Ilmiah Kader Pergerakan Mahasiswa Islam Indonesia <br> PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</p>
                <p class="text-sm italic mt-2">Terbit 2 kali setahun (Juni & Desember) | <span class="font-bold">Call for Papers!</span> Kirimkan artikel Anda sekarang!</p>
                <div class="search-bar">
                    <input type="search" id="ojsSearchInputHero" placeholder="Cari artikel, penulis, atau kata kunci...">
                    <button type="button" id="ojsSearchButtonHero" aria-label="Cari Jurnal">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
            </div>
        </section>

        <section id="main-journal-list-section" class="container mx-auto px-4 py-8 lg:py-12">
            <!-- Button to go back to main website index -->
            <div class="mb-6">
                <a href="index.php" class="btn-modern btn-outline-modern">
                    <i class="fas fa-home mr-2"></i> Kembali ke Situs Utama
                </a>
            </div>

            <!-- Statistics Bar -->
            <div class="stats-bar animate-fadeInUp" style="animation-delay: 0.1s;">
                <div class="stat-item">
                    <span class="stat-number" id="statTotalJurnal">0</span>
                    <span class="stat-label">Total Jurnal</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number" id="statTotalPenulis">0</span>
                    <span class="stat-label">Total Penulis</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number" id="statTotalUnduhan">0</span>
                    <span class="stat-label">Total Unduhan</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number" id="statJurnalBaru">0</span>
                    <span class="stat-label">Jurnal Bulan Ini</span>
                </div>
            </div>

            <!-- Filter and Upload Bar -->
            <div class="filter-bar mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end animate-fadeInUp" style="animation-delay: 0.2s;">
                <div>
                    <label for="filterTahunJurnalOjs">Tahun Terbit:</label>
                    <select id="filterTahunJurnalOjs" class="w-full mt-1">
                        <option value="">Semua Tahun</option>
                    </select>
                </div>
                <div>
                    <label for="filterKategoriJurnalOjs">Kategori:</label>
                    <select id="filterKategoriJurnalOjs" class="w-full mt-1">
                        <option value="">Semua Kategori</option>
                        <option value="Sosial">Sosial</option>
                        <option value="Agama">Agama</option>
                        <option value="Politik">Politik</option>
                        <option value="Budaya">Budaya</option>
                        <option value="Pendidikan">Pendidikan</option>
                        <option value="Ekonomi">Ekonomi</option>
                        <option value="Lainnya">Lainnya</option>
                    </select>
                </div>
                <div class="sm:col-span-2 lg:col-span-1">
                    <button id="btnOpenUploadModalOjsPage" class="btn-modern btn-primary-modern w-full mt-4 sm:mt-0 hidden">
                        <i class="fas fa-upload mr-2"></i>Unggah Jurnal
                    </button>
                </div>
                 <div class="sm:col-span-2 lg:col-span-1">
                    <a href="digilib.php" class="btn-modern btn-secondary-modern w-full mt-2 sm:mt-0">
                        <i class="fas fa-book-reader mr-2"></i>Ke Digilib PMII
                    </a>
                </div>
            </div>

            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold text-gray-800">Artikel Terbaru</h2>
                <button id="sortMostReadBtn" class="btn-modern btn-outline-modern !py-1 !px-2 !text-sm">
                    <i class="fas fa-fire mr-1"></i>Paling Banyak Dibaca
                </button>
            </div>


            <!-- Journal List Container -->
            <div id="daftarJurnalContainerOjs" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeInUp" style="animation-delay: 0.4s;">
                <p id="jurnalLoadingOjs" class="text-text-muted col-span-full text-center py-10 text-lg">Memuat daftar jurnal...</p>
            </div>
            
            <!-- Admin Verification Panel -->
            <div id="panelVerifikasiAdminOjs" class="mt-12 content-section hidden animate-fadeInUp" style="animation-delay: 0.6s;">
                <h2 class="text-xl font-semibold mb-6 text-center">Verifikasi Jurnal Menunggu Persetujuan</h2>
                <div id="jurnalMenungguVerifikasiContainerOjs" class="space-y-4">
                    <p class="text-text-muted text-center">Tidak ada jurnal yang menunggu verifikasi saat ini.</p>
                </div>
            </div>
        </section>

        <!-- Article Guidelines Section -->
        <section id="panduan-penulis-section" class="container mx-auto px-4 py-8 lg:py-12 hidden content-section">
            <div class="article-guidelines-content bg-white p-6 rounded-lg shadow-md">
                <button onclick="showContentSection('main-journal-list-section')" class="btn-modern btn-outline-modern mb-6">
                    <i class="fas fa-arrow-left mr-2"></i> Kembali ke Halaman Utama Jurnal
                </button>

                <h2 class="text-3xl font-bold text-pmii-darkblue mb-4 border-b-2 border-pmii-blue pb-2">Pedoman Penulisan Artikel untuk Jurnal Al-Bayan</h2>

                <p>Berikut adalah pedoman penulisan artikel yang akan diajukan ke Al-Bayan: Jurnal Studi Al-Qur'an dan Tafsir. Dengan mengikuti templat dan aturan di dalamnya, akan lebih mudah bagi kami untuk memproses artikel yang Anda kirimkan ke jurnal kami.</p>

                <h3 class="text-2xl font-semibold text-text-primary mt-8 mb-4">Judul Artikel</h3>
                <p>Judul artikel harus singkat, jelas, dan informatif, menggambarkan isi penelitian. Jumlah kata maksimum dalam judul adalah 20 kata.</p>

                <p class="mt-4"><strong>Nama Penulis 1*, Nama Penulis 2 dan Nama Penulis 3</strong></p>
                <ol class="list-decimal list-inside ml-4">
                    <li>Afiliasi Penulis 1; e-mail@e-mail.com</li>
                    <li>Afiliasi Penulis 2; e-mail@e-mail.com</li>
                    <li>Afiliasi Penulis 3; e-mail@e-mail.com</li>
                </ol>
                <p>* Korespondensi: e-mail@e-mail.com; Tel.: (opsional; sertakan kode negara; jika ada beberapa penulis korespondensi, tambahkan inisial penulis) +xx-xxxx-xxx-xxxx (F.L.)</p>
                <p>Diterima: tanggal; Diterima: tanggal; Dipublikasikan: tanggal</p>

                <h3 class="text-2xl font-semibold text-text-primary mt-8 mb-4">Abstrak</h3>
                <p>Abstrak harus ditulis dalam satu paragraf (150-250 kata) yang memuat secara jelas dan ringkas:</p>
                <ul class="list-disc list-inside ml-4">
                    <li><strong>Latar Belakang:</strong> menjelaskan isu, fenomena, atau kesenjangan penelitian yang memotivasi studi Anda;</li>
                    <li><strong>Tujuan Penelitian:</strong> menyatakan secara spesifik apa yang ingin dicapai oleh studi;</li>
                    <li><strong>Metodologi:</strong> menyatakan pendekatan, jenis data, dan metode analitis yang digunakan;</li>
                    <li><strong>Hasil:</strong> menguraikan temuan utama penelitian;</li>
                    <li><strong>Kesimpulan:</strong> merangkum temuan secara singkat dan tegas; dan</li>
                    <li><strong>Kontribusi Akademik:</strong> menjelaskan secara eksplisit bagaimana penelitian ini memberikan kontribusi baru pada studi Al-Qur'an dan tafsir, baik dari segi teori, metode, maupun relevansi praktis.</li>
                </ul>
                <p>Abstrak tidak perlu menyertakan kutipan, referensi, atau data statistik yang terlalu rinci. Pastikan alur logis dan mudah dipahami oleh pembaca lintas disiplin, serta sejalan dengan tujuan dan ruang lingkup Jurnal Al-Bayan.</p>

                <h3 class="text-2xl font-semibold text-text-primary mt-8 mb-4">Kata Kunci</h3>
                <p>kata kunci 1; kata kunci 2; kata kunci 3 (Daftar tiga hingga lima kata kunci relevan yang spesifik untuk artikel; namun cukup umum dalam disiplin ilmu terkait; gunakan huruf kecil kecuali untuk nama diri)</p>

                <h3 class="text-2xl font-semibold text-text-primary mt-8 mb-4">1. Pendahuluan</h3>
                <p>Pendahuluan harus mencakup tiga hal:</p>
                <ol class="list-decimal list-inside ml-4">
                    <li>masalah yang diteliti;</li>
                    <li>urgensi mengatasi masalah yang diteliti; dan</li>
                    <li>cara penulis mengatasi masalah tersebut.</li>
                </ol>
                <p>Untuk itu, penulis perlu memperhatikan poin-poin berikut:</p>
                <ul class="list-disc list-inside ml-4">
                    <li><strong>Pertama,</strong> penulis menguraikan masalah inti yang akan dibahas, latar belakangnya, dan posisi artikel penulis di tengah studi-studi terkait. Dalam hal ini, penulis dapat menggambarkan hubungan artikelnya dengan artikel atau karya lain yang telah diterbitkan, melakukan tinjauan singkat terhadap artikel atau karya tersebut, dan menunjukkan orisinalitas artikel penulis.</li>
                    <li><strong>Kedua,</strong> penulis menguraikan aspek-aspek penting yang terkait dengan masalah yang diteliti. Dalam hal ini, penulis juga dapat menyebutkan alasan dan tujuan membahas masalah tersebut dalam artikel yang bersangkutan. Bagian ini dimaksudkan untuk menunjukkan kontribusi ilmiah penulis dalam artikel yang ditulisnya – bahwa masalah yang diangkat oleh penulis sangat penting untuk dipublikasikan.</li>
                    <li><strong>Ketiga,</strong> penulis menguraikan metodologi atau metode yang digunakan dalam membahas isu-isu terkait. Misalnya, penulis secara singkat menjelaskan pendekatan atau perspektif yang digunakan.</li>
                </ul>
                <p>Penulisan kutipan menggunakan sitasi dalam teks (body note) sebagai berikut: (Kamba, 2018) atau (Marchlewska et al., 2019) atau (Cichocka, 2016; Hidayat & Khalika, 2019; Ikhwan, 2019; Madjid, 2002) atau (Miller & Josephs, 2009, hlm. 12) atau Rakhmat (1989). Lihat bagian akhir panduan ini untuk informasi lebih detail. Simbol-simbol dan singkatan-singkatan yang dipergunakan dalam artikel harus dijelaskan terlebih dahulu pada saat pertama kali disebutkan.</p>

                <h3 class="text-2xl font-semibold text-text-primary mt-8 mb-4">2. Hasil Penelitian</h3>
                <p>Hasil yang diperoleh dari penelitian harus didukung oleh data yang cukup. Hasil penelitian dan temuan harus menjadi jawaban, atau hipotesis penelitian yang telah disebutkan sebelumnya di bagian pendahuluan.</p>
                <p>Penulisan kutipan menggunakan sitasi dalam teks (body note) sebagai berikut: (Kamba, 2018) atau (Marchlewska et al., 2019) atau (Cichocka, 2016; Hidayat & Khalika, 2019; Ikhwan, 2019; Madjid, 2002) atau (Miller & Josephs, 2009, hlm. 12) atau Rakhmat (1989). Lihat bagian akhir panduan ini untuk lebih jelas. Simbol dan singkatan yang digunakan dalam artikel harus dijelaskan pertama kali disebutkan.</p>

                <h4 class="text-xl font-semibold text-text-primary mt-6 mb-3">2.1. Subbagian</h4>
                <p><strong>Judul 1:</strong> gunakan gaya ini untuk judul tingkat pertama</p>
                <p><strong>Judul 2:</strong> gunakan gaya ini untuk judul tingkat kedua</p>
                <p><strong>Judul 3:</strong> gunakan gaya ini untuk judul tingkat ketiga</p>
                <p><em>Judul 4:</em> buat judul dalam huruf miring.</p>
                <p>Daftar berpoin terlihat seperti ini:</p>
                <ul class="list-disc list-inside ml-4">
                    <li>Poin pertama</li>
                    <li>Poin kedua</li>
                    <li>Poin ketiga</li>
                </ul>
                <p>Daftar bernomor dapat ditambahkan sebagai berikut:</p>
                <ol class="list-decimal list-inside ml-4">
                    <li>Item pertama</li>
                    <li>Item kedua</li>
                    <li>Item ketiga</li>
                </ol>
                <p>Teks berlanjut di sini.</p>

                <h4 class="text-xl font-semibold text-text-primary mt-6 mb-3">2.2. Gambar, Tabel, dan Skema</h4>
                <p>Semua gambar dan tabel harus dikutip dalam teks utama sebagai Gambar 1, Tabel 1, dll.</p>
                <div class="text-center my-4">
                    <img src="https://placehold.co/600x200/cccccc/333333?text=Contoh+Gambar" alt="Contoh Gambar" class="mx-auto rounded-md shadow-sm">
                    <p class="text-sm text-gray-600 mt-2"><strong>Gambar 1.</strong> Ini adalah gambar. Skema mengikuti format yang sama. Jika ada beberapa panel, mereka harus dicantumkan sebagai: (a) Deskripsi apa yang terkandung dalam panel pertama; (b) Deskripsi apa yang terkandung dalam panel kedua. Gambar harus ditempatkan dalam teks utama dekat dengan pertama kali dikutip. Keterangan pada satu baris harus berada di tengah.</p>
                </div>

                <p class="text-center my-4"><strong>Tabel 1.</strong> Ini adalah tabel. Tabel harus ditempatkan dalam teks utama dekat dengan pertama kali dikutip.</p>
                <table class="w-full mb-4">
                    <thead>
                        <tr>
                            <th>Judul 1</th>
                            <th>Judul 2</th>
                            <th>Judul 3</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>entri 1</td>
                            <td>data</td>
                            <td>data</td>
                        </tr>
                        <tr>
                            <td>entri 2</td>
                            <td>data</td>
                            <td>data 1</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3"><sup>1</sup> Tabel mungkin memiliki catatan kaki.</td>
                        </tr>
                    </tfoot>
                </table>

                <h4 class="text-xl font-semibold text-text-primary mt-6 mb-3">2.3. Pemformatan Komponen Matematika (jika ada)</h4>
                <p>Ini adalah contoh persamaan:</p>
                <div class="math-equation">
                    <span>$a = 1$</span> <span class="equation-number">(1)</span>
                </div>
                <p>Teks yang mengikuti persamaan tidak perlu menjadi paragraf baru. Harap tanda baca persamaan sebagai teks biasa.</p>
                <p>Lingkungan tipe teorema (termasuk proposisi, lemma, korolarium, dll.) dapat diformat sebagai berikut:</p>
                <blockquote class="text-base my-4">
                    <strong>Contoh Teks Kutipan.</strong> Kutipan kutipan kutipan kutipan kutipan kutipan kutipan kutipan kutipan kutipan kutipan kutipan kutipan kutipan kutipan kutipan kutipan kutipan kutipan kutipan kutipan kutipan kutipan kutipan kutipan kutipan. Teks berlanjut di sini.
                </blockquote>
                <p>Bukti harus diformat sebagai berikut:</p>
                <div class="border-l-4 border-gray-400 p-4 bg-gray-50 my-4 text-gray-700 italic">
                    Teks berlanjut di sini.
                </div>

                <h3 class="text-2xl font-semibold text-text-primary mt-8 mb-4">Template Artikel</h3>
                <p>Templat artikel yang rapi dan konsisten, berformat .doc/.docx dan .pdf.</p>
                <p class="mt-2">Silakan unduh templat artikel di sini:</p>
                <div class="flex flex-col sm:flex-row gap-3 mt-4">
                    <a href="https://www.africau.edu/images/default/sample.pdf" download="Template_Artikel_Jurnal_Al-Bayan.pdf" class="btn-modern btn-primary-modern">
                        <i class="fas fa-file-pdf mr-2"></i> Unduh Templat PDF
                    </a>
                    <a href="https://file-examples.com/storage/fe9452b1b363595186b4034/2017/10/file-example_PPT_250kB.ppt" download="Template_Artikel_Jurnal_Al-Bayan.docx" class="btn-modern btn-outline-modern">
                        <i class="fas fa-file-word mr-2"></i> Unduh Templat DOCX
                    </a>
                </div>
                <p class="mt-4">Wajib mencantumkan: judul, nama penulis, afiliasi, email, abstrak (Bahasa dan Inggris), kata kunci, isi artikel, kutipan, daftar pustaka, DOI.</p>

                <h3 class="text-2xl font-semibold text-text-primary mt-8 mb-4">Diskusi</h3>
                <p>Diskusi ditonjolkan melalui judul dan subjudul bagian bila diperlukan. Penulis harus mendiskusikan hasil dan bagaimana mereka dapat diinterpretasikan dari perspektif studi sebelumnya dan hipotesis kerja. Temuan dan implikasinya harus dibahas dalam konteks seluas mungkin. Arah penelitian selanjutnya juga dapat disorot. Komponen-komponen berikut harus dibahas dalam diskusi: Bagaimana hasil Anda berhubungan dengan pertanyaan atau tujuan asli yang diuraikan di bagian Pendahuluan (apa/bagaimana)? Apakah Anda memberikan interpretasi ilmiah untuk setiap hasil atau temuan Anda yang disajikan (mengapa)? Apakah hasil Anda konsisten dengan apa yang telah dilaporkan oleh peneliti lain (apa lagi)? Atau adakah perbedaan?</p>

                <h3 class="text-2xl font-semibold text-text-primary mt-8 mb-4">Kesimpulan</h3>
                <p>Kesimpulan harus menjawab tujuan penelitian dan temuan penelitian. Pernyataan penutup tidak boleh hanya berisi pengulangan hasil dan diskusi atau abstrak. Anda juga harus menyarankan penelitian di masa depan dan menunjukkan penelitian yang sedang berjalan.</p>

                <h3 class="text-2xl font-semibold text-text-primary mt-8 mb-4">Ucapan Terima Kasih</h3>
                <p>Di bagian ini, Anda dapat mengakui dukungan apa pun yang diberikan, yang tidak tercakup dalam bagian kontribusi penulis atau pendanaan. Ini mungkin termasuk dukungan administratif dan teknis, atau sumbangan dalam bentuk barang (misalnya, bahan yang digunakan untuk percobaan).</p>

                <h3 class="text-2xl font-semibold text-text-primary mt-8 mb-4">Konflik Kepentingan</h3>
                <p>Nyatakan konflik kepentingan atau nyatakan "Para penulis menyatakan tidak ada konflik kepentingan." Penulis harus mengidentifikasi dan menyatakan keadaan atau kepentingan pribadi apa pun yang mungkin dianggap memengaruhi secara tidak pantas representasi atau interpretasi hasil penelitian yang dilaporkan.</p>

                <h3 class="text-2xl font-semibold text-text-primary mt-8 mb-4">Daftar Pustaka</h3>
                <p>Literatur yang tercantum dalam Daftar Pustaka hanya berisi sumber-sumber yang direferensikan atau disertakan dalam artikel. Kami merekomendasikan untuk menyiapkan daftar pustaka dengan paket perangkat lunak bibliografi, seperti Mendeley, EndNote, Reference Manager, atau Zotero untuk menghindari kesalahan pengetikan dan referensi ganda. Sumber rujukan harus menyediakan 80% artikel jurnal, prosiding, atau hasil penelitian dari lima tahun terakhir. Teknik penulisan daftar pustaka, menggunakan sistem sitasi gaya APA (American Psychological Association) edisi ke-6.</p>

                <p class="mt-4"><strong>Contoh:</strong></p>
                <p class="mt-2"><strong>Artikel Jurnal</strong></p>
                <ul class="list-none ml-4">
                    <li>Cichocka, A. (2016). Understanding defensive and secure in-group positivity: The role of collective narcissism. <em>European Review of Social Psychology</em>, <em>27</em>(1), 283–317.</li>
                    <li>Marchlewska, M., Cichocka, A., Łozowski, F., Górska, P., & Winiewski, M. (2019). In search of an imaginary enemy: Catholic collective narcissism and the endorsement of gender conspiracy beliefs. <em>The Journal of Social Psychology</em>, <em>159</em>(6), 766--779.</li>
                </ul>

                <p class="mt-2"><strong>Situs Web Internet</strong></p>
                <ul class="list-none ml-4">
                    <li>Hidayat, R., & Khalika, N. N. (2019). Bisnis dan Kontroversi Gerakan Indonesia Tanpa Pacaran. Diakses 17 Oktober 2019, dari situs web tirto.id: <a href="https://tirto.id/bisnis-dan-kontroversi-gerakan-indonesia-tanpa-pacaran-cK25" target="_blank" class="text-pmii-blue hover:underline">https://tirto.id/bisnis-dan-kontroversi-gerakan-indonesia-tanpa-pacaran-cK25</a></li>
                </ul>

                <p class="mt-2"><strong>Buku</strong></p>
                <ul class="list-none ml-4">
                    <li>Kamba, M. N. (2018). <em>Kids Zaman Now Menemukan Kembali Islam</em>. Tangerang Selatan: Pustaka IIMaN.</li>
                    <li>Madjid, N. (2002). <em>Manusia Modern Mendamba Allah: Renungan Tasawuf Positif</em>. Jakarta: IIMaN & Hikmah.</li>
                </ul>

                <p class="mt-2"><strong>Bagian Buku</strong></p>
                <ul class="list-none ml-4">
                    <li>Ikhwan, M. (2019). Ulama dan Konservatisme Islam Publik di Bandung: Islam, Politik Identitas, dan Tantangan Relasi Horizontal. Dalam I. Burdah, N. Kailani, & M. Ikhwan (Eds.), <em>Ulama, Politik, dan Narasi Kebangsaan</em>. Yogyakarta: PusPIDeP.</li>
                </ul>

                <p class="text-sm text-gray-500 mt-6 border-t pt-4 border-gray-200">
                    © 2020 oleh para penulis. Diajukan untuk kemungkinan publikasi akses terbuka di bawah syarat dan ketentuan lisensi Creative Commons Attribution (CC BY SA) (<a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" class="text-pmii-blue hover:underline">https://creativecommons.org/licenses/by-sa/3.0/</a>).
                </p>
            </div>
        </section>

    </div>

    <!-- Upload Journal Modal -->
    <div id="uploadJurnalModalOjs" class="modal-overlay">
        <div class="modal-content animate-scaleIn">
            <div class="modal-header">
                <h3 class="modal-title">Formulir Unggah Jurnal/Karya Ilmiah</h3>
                <button type="button" class="text-gray-400 hover:text-gray-600 text-2xl leading-none" onclick="closeModal('uploadJurnalModalOjs')">&times;</button>
            </div>
            <form id="formUploadJurnalOjs" class="space-y-4 mt-4">
                <div class="input-group-modern">
                    <input type="text" id="uploadJudulOjs" name="judul" class="form-input-modern" required>
                    <label for="uploadJudulOjs" class="form-label-modern">Judul Karya Ilmiah</label>
                </div>
                <div class="input-group-modern">
                    <input type="text" id="uploadPenulisOjs" name="penulis" class="form-input-modern" required>
                    <label for="uploadPenulisOjs" class="form-label-modern">Nama Penulis (Utama)</label>
                </div>
                 <div class="input-group-modern">
                    <input type="text" id="uploadORCID" name="orcid" class="form-input-modern" placeholder="Cth: 0000-0001-2345-6789">
                    <label for="uploadORCID" class="form-label-modern">ORCID (Opsional)</label>
                </div>
                <div class="input-group-modern">
                    <textarea id="uploadAbstrakOjs" name="abstrak" class="form-input-modern" rows="4" required></textarea>
                    <label for="uploadAbstrakOjs" class="form-label-modern">Abstrak (Maks. 300 kata)</label>
                </div>
                 <div class="input-group-modern">
                    <select id="uploadKategoriOjs" name="kategori" class="form-input-modern" required>
                        <option value="" disabled selected></option>
                        <option value="Sosial">Sosial</option>
                        <option value="Agama">Agama</option>
                        <option value="Politik">Politik</option>
                        <option value="Budaya">Budaya</option>
                        <option value="Pendidikan">Pendidikan</option>
                        <option value="Ekonomi">Ekonomi</option>
                        <option value="Lainnya">Lainnya</option>
                    </select>
                    <label for="uploadKategoriOjs" class="form-label-modern">Kategori</label>
                </div>
                <div>
                    <label for="uploadFileOjs" class="block mb-1 text-sm font-medium text-gray-700">Upload File (PDF, Maks. 5MB)</label>
                    <input type="file" id="uploadFileOjs" name="file" class="form-input-file-modern" accept=".pdf" required>
                    <p id="uploadFileErrorOjs" class="text-xs text-red-600 mt-1 hidden"></p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-modern btn-outline-modern" onclick="closeModal('uploadJurnalModalOjs')">Batal</button>
                    <button type="submit" class="btn-modern btn-primary-modern">Unggah Karya</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Journal Detail Modal -->
    <div id="detailJurnalModalOjs" class="modal-overlay">
        <div class="modal-content max-w-3xl animate-scaleIn">
            <div class="modal-header">
                <h3 class="modal-title" id="detailJudulOjs">Judul Jurnal</h3>
                <button type="button" class="text-gray-400 hover:text-gray-600 text-2xl leading-none" onclick="closeModal('detailJurnalModalOjs')">&times;</button>
            </div>
            <div id="detailJurnalContentOjs" class="mt-4 space-y-3 text-sm">
                <p><strong>Penulis:</strong> <span id="detailPenulisOjs"></span></p>
                <p><strong class="mr-1">ORCID:</strong> <span id="detailORCID">Tidak Tersedia</span></p>
                <p><strong>Tanggal Publikasi:</strong> <span id="detailTanggalOjs"></span></p>
                <p><strong>Kategori:</strong> <span id="detailKategoriOjs"></span></p>
                <p><strong>DOI:</strong> <a id="detailDoiOjs" href="#" target="_blank" class="text-pmii-blue hover:underline"></a></p>
                <p><strong>Status:</strong> <span id="detailStatusOjs" class="status-badge"></span></p>
                <p><strong>Jumlah Dilihat:</strong> <span id="detailViewCountOjs"></span> kali</p>
                <p><strong>Jumlah Sitasi:</strong> <span id="detailCitationCountOjs"></span> kali (simulasi)</p>
                <h4 class="font-semibold text-md text-pmii-darkblue mt-3 pt-2 border-t border-gray-200">Abstrak:</h4>
                <p id="detailAbstrakOjs" class="text-text-secondary whitespace-pre-wrap"></p>
                <div id="detailFileLinkContainerOjs" class="mt-4 space-x-2">
                    <a href="#" id="detailFileLinkOjs" target="_blank" class="btn-modern btn-secondary-modern text-xs">
                        <i class="fas fa-file-pdf mr-2"></i>Lihat/Unduh PDF
                    </a>
                    <button id="btnEksporSitasi" class="btn-modern btn-outline-modern text-xs">
                        <i class="fas fa-quote-right mr-2"></i>Ekspor Sitasi
                    </button>
                </div>
                <div id="komentarSectionOjs" class="mt-6 pt-4 border-t border-gray-200 hidden">
                    <h4 class="font-semibold text-md text-pmii-darkblue mb-2">Komentar</h4>
                    <div id="daftarKomentarOjs" class="space-y-3 max-h-40 overflow-y-auto mb-3">
                        <p class="text-text-muted">Belum ada komentar.</p>
                    </div>
                    <form id="formKomentarOjs" class="hidden">
                        <textarea id="inputKomentarOjs" rows="2" class="form-input-modern !pt-2 !pb-2" placeholder="Tulis komentar Anda..."></textarea>
                        <button type="submit" class="btn-modern btn-primary-modern text-xs mt-2">Kirim Komentar</button>
                    </form>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-modern btn-outline-modern" onclick="closeModal('detailJurnalModalOjs')">Tutup</button>
            </div>
        </div>
    </div>


    <!-- Footer section -->
    <footer class="internal-footer py-10 mt-auto">
        <div class="container mx-auto px-4 text-center">
            <img src="img/logo-pmii.png" alt="Logo PMII Footer" class="h-12 w-12 mx-auto mb-2.5 rounded-full" onerror="this.onerror=null;this.src='https://placehold.co/48x48/005c97/FFFFFF?text=P';">
            <p class="text-md font-semibold footer-title">PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</p>
            <p class="text-xs mt-3">Alamat Redaksi: Jl. A.H. Nasution No.105, Cipadung, Cibiru, Kota Bandung, Jawa Barat 40614</p>
            <p class="text-xs">Email Resmi: jurnal.alharokah@example.com | URL Jurnal: <a href="#" class="text-yellow-300 hover:underline">jurnalalharokah.or.id</a></p>
            <p class="text-xs mt-2">&copy; <span id="tahun-footer-ojs-page"></span> Jurnal Al Harokah. Hak Cipta dilindungi. Dilisensikan di bawah <a href="etika-kebijakan.html#lisensi" class="text-yellow-300 hover:underline">Creative Commons Attribution 4.0 International License</a>.</p>
            
            <div class="mt-6">
                <h4 class="text-white text-md font-semibold mb-3">Terindeks Oleh:</h4>
                <div class="flex flex-wrap justify-center items-center gap-4">
                    <img src="https://placehold.co/80x30/FFFFFF/000000?text=Google+Scholar" alt="Google Scholar" class="h-8 filter brightness(0) invert(1)">
                    <img src="https://placehold.co/80x30/FFFFFF/000000?text=GARUDA" alt="GARUDA" class="h-8 filter brightness(0) invert(1)">
                    <img src="https://placehold.co/80x30/FFFFFF/000000?text=DOAJ" alt="DOAJ" class="h-8 filter brightness(0) invert(1)">
                    <img src="https://placehold.co/80x30/FFFFFF/000000?text=SINTA" alt="SINTA" class="h-8 filter brightness(0) invert(1)">
                </div>
            </div>

            <div class="mt-6">
                <h4 class="text-white text-md font-semibold mb-3">Diarsipkan Oleh:</h4>
                <div class="flex flex-wrap justify-center items-center gap-4">
                    <img src="https://placehold.co/80x30/FFFFFF/000000?text=PKP+PLN" alt="PKP PLN" class="h-8 filter brightness(0) invert(1)">
                    <img src="https://placehold.co/80x30/FFFFFF/000000?text=LOCKSS" alt="LOCKSS" class="h-8 filter brightness(0) invert(1)">
                    <img src="https://placehold.co/80x30/FFFFFF/000000?text=CLOCKSS" alt="CLOCKSS" class="h-8 filter brightness(0) invert(1)">
                </div>
            </div>

            <div class="mt-6">
                <h4 class="text-white text-md font-semibold mb-3">Ikuti Kami:</h4>
                <div class="flex justify-center space-x-4">
                    <a href="https://facebook.com/jurnalalharokah" target="_blank" class="text-gray-300 hover:text-white text-2xl"><i class="fab fa-facebook"></i></a>
                    <a href="https://twitter.com/jurnalalharokah" target="_blank" class="text-gray-300 hover:text-white text-2xl"><i class="fab fa-twitter"></i></a>
                    <a href="https://instagram.com/jurnalalharokah" target="_blank" class="text-gray-300 hover:text-white text-2xl"><i class="fab fa-instagram"></i></a>
                </div>
            </div>

        </div>
    </footer>
    
    <!-- Scroll to top button -->
    <button id="scrollToTopBtnOjsPage" title="Kembali ke atas" class="hidden fixed bottom-6 right-6 z-50 items-center justify-center hover:bg-yellow-300 focus:outline-none">
        <i class="fas fa-arrow-up text-lg"></i>
    </button>

    <script type="module">
        // Injeksi data PHP ke JavaScript
        window.phpLoggedInUser = <?php echo $loggedInUserJson; ?>;

        // Memuat JavaScript utama untuk halaman ini
        import './js/akses-ojs.js';
        import { updateAuthUI } from './js/auth.js'; // Impor updateAuthUI
        
        document.addEventListener('DOMContentLoaded', function() {
            // Kumpulkan elemen-elemen untuk updateAuthUI (dari index.php)
            const headerTitleText = document.getElementById('header-title-text');
            const mobileHeaderTitleText = document.getElementById('mobile-header-title-text');
            const authLinkMain = document.getElementById('auth-link-main');
            const authLinkMobile = document.getElementById('mobile-logout-link');
            const desktopKaderMenuContainer = document.getElementById('desktop-kader-menu-container');
            const desktopAdminMenuContainer = document.getElementById('desktop-admin-menu-container');

            const authElements = {
                authLinkMain, authLinkMobile, desktopKaderMenuContainer,
                desktopAdminMenuContainer, headerTitleText, mobileHeaderTitleText
            };
            updateAuthUI(authElements); // Panggil untuk memperbarui UI navigasi
        });
    </script>
</body>
</html>
