<?php
// public/dashboard/edit-profil-kader.php

// --- INISIALISASI BACKEND DAN DATA AWAL ---
// Muat autoloader Composer
require_once __DIR__ . '/../../vendor/autoload.php';

// Muat variabel lingkungan dari .env
\App\Core\DotenvLoader::load();

// Asumsi: Data pengguna yang login akan tersedia di $_SERVER['user_data']
// setelah AuthMiddleware memverifikasi token.
$loggedInUser = $_SERVER['user_data'] ?? null;

// Konversi data PHP ke JSON untuk dapat diakses oleh JavaScript
$loggedInUserJson = json_encode($loggedInUser);

?>
<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Profil Kader - PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="icon" href="../img/logo-pmii.png" type="image/png">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/style.css"> <link rel="stylesheet" href="../css/edit-profil-kader.css"> </head>
<body>

    <header class="internal-header py-3 sticky top-0 z-50">
        <div class="container mx-auto px-4 lg:px-8 flex justify-between items-center">
            <a href="../index.php" class="flex items-center space-x-2.5">
                <img src="../img/logo-pmii.png" alt="Logo PMII" class="h-9 w-9 rounded-full">
                <span class="text-sm md:text-base font-semibold logo-text">PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung - Sistem Internal</span>
            </a>
            <div class="flex items-center space-x-3 md:space-x-4">
                <span id="kader-name-header" class="text-xs sm:text-sm font-medium hidden"></span>
                <a href="#" id="auth-info-header" class="text-xs sm:text-sm">Logout</a>
            </div>
        </div>
    </header>

    <div class="main-content-wrapper">
        <main class="container mx-auto px-4 py-8 lg:py-12">
            <div class="mb-6">
                <a href="../index.php" class="btn-modern btn-outline-modern">
                    <i class="fas fa-arrow-left mr-2"></i>
                    Kembali ke Beranda
                </a>
            </div>

            <section id="edit-profil-kader-content">
                <div class="text-center mb-10 md:mb-14">
                    <h1 class="text-3xl lg:text-4xl page-title">Edit Profil Kader</h1>
                    <p class="text-md text-text-muted mt-2">Perbarui informasi pribadi dan kepengkaderan Anda.</p>
                </div>

                <div class="content-section mb-8">
                    <h3 class="text-lg font-semibold mb-6">Informasi Pribadi</h3>
                    <div id="profile-edit-form-response" class="hidden form-message mb-5"></div>
                    <form id="profileEditForm" class="space-y-6">
                        <div class="profile-picture-upload">
                            <img id="profilePicturePreview" src="https://placehold.co/120x120/cccccc/444444?text=Avatar" alt="Foto Profil" class="profile-picture-preview">
                            <div class="upload-btn-wrapper">
                                <i class="fas fa-camera mr-2"></i>Unggah Foto Profil
                                <input type="file" id="profilePictureInput" name="profilePicture" accept="image/*">
                            </div>
                        </div>

                        <h4 class="text-md font-semibold text-pmii-darkblue mb-3 border-b border-gray-200 pb-2">Data Diri</h4>
                        <div class="input-group-modern">
                            <input type="text" id="kaderNama" name="nama" class="form-input-modern" required placeholder=" ">
                            <label for="kaderNama" class="form-label-modern">Nama Lengkap</label>
                        </div>
                        <div class="input-group-modern">
                            <input type="text" id="kaderNIK" name="nik" class="form-input-modern" placeholder=" ">
                            <label for="kaderNIK" class="form-label-modern">NIK</label>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="input-group-modern">
                                <input type="text" id="kaderTempatLahir" name="tempat_lahir" class="form-input-modern" placeholder=" ">
                                <label for="kaderTempatLahir" class="form-label-modern">Tempat Lahir</label>
                            </div>
                            <div class="input-group-modern">
                                <input type="date" id="kaderTanggalLahir" name="tanggal_lahir" class="form-input-modern" placeholder=" ">
                                <label for="kaderTanggalLahir" class="form-label-modern">Tanggal Lahir</label>
                            </div>
                        </div>
                        <div class="input-group-modern">
                            <select id="kaderJenisKelamin" name="jenis_kelamin" class="form-input-modern">
                                <option value=""></option>
                                <option value="Laki-laki">Laki-laki</option>
                                <option value="Perempuan">Perempuan</option>
                            </select>
                            <label for="kaderJenisKelamin" class="form-label-modern">Jenis Kelamin</label>
                        </div>
                        <div class="input-group-modern">
                            <textarea id="kaderAlamat" name="alamat" class="form-input-modern" rows="3" placeholder=" "></textarea>
                            <label for="kaderAlamat" class="form-label-modern">Alamat Lengkap</label>
                        </div>
                        <div class="input-group-modern">
                            <input type="tel" id="kaderNoHP" name="no_hp" class="form-input-modern" placeholder=" ">
                            <label for="kaderNoHP" class="form-label-modern">No. HP / WhatsApp Aktif</label>
                        </div>
                        <div class="input-group-modern">
                            <input type="email" id="kaderEmailPribadi" name="email_pribadi" class="form-input-modern" placeholder=" ">
                            <label for="kaderEmailPribadi" class="form-label-modern">Email Pribadi (opsional)</label>
                        </div>

                        <h4 class="text-md font-semibold text-pmii-darkblue mb-3 border-b border-gray-200 pb-2 pt-4">Pendidikan</h4>
                        <div class="input-group-modern">
                            <input type="text" id="kaderUniversitas" name="universitas" class="form-input-modern" placeholder=" ">
                            <label for="kaderUniversitas" class="form-label-modern">Universitas / Institusi</label>
                        </div>
                        <div class="input-group-modern">
                            <input type="text" id="kaderFakultasJurusan" name="fakultas_jurusan" class="form-input-modern" placeholder=" ">
                            <label for="kaderFakultasJurusan" class="form-label-modern">Fakultas / Jurusan</label>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="input-group-modern">
                                <input type="number" id="kaderTahunMasukKuliah" name="tahun_masuk_kuliah" class="form-input-modern" min="1900" max="2100" placeholder=" ">
                                <label for="kaderTahunMasukKuliah" class="form-label-modern">Tahun Masuk Kuliah</label>
                            </div>
                            <div class="input-group-modern">
                                <select id="kaderStatusMahasiswa" name="status_mahasiswa" class="form-input-modern">
                                    <option value=""></option>
                                    <option value="Aktif">Aktif</option>
                                    <option value="Lulus">Lulus</option>
                                    <option value="Cuti">Cuti</option>
                                </select>
                                <label for="kaderStatusMahasiswa" class="form-label-modern">Status Mahasiswa</label>
                            </div>
                        </div>
                        <div class="input-group-modern">
                            <input type="number" step="0.01" id="kaderIPK" name="ipk" class="form-input-modern" placeholder=" ">
                            <label for="kaderIPK" class="form-label-modern">IPK Terakhir</label>
                        </div>
                        <div class="file-upload-group">
                            <label class="upload-btn-wrapper">
                                <i class="fas fa-upload"></i> Unggah Transkrip / KHS
                                <input type="file" id="uploadIPKTranscript" accept=".pdf,image/*">
                            </label>
                            <span id="fileNameIPKTranscript" class="file-name-display">Tidak ada file dipilih.</span>
                            <span class="required-label">*Wajib</span>
                        </div>


                        <h4 class="text-md font-semibold text-pmii-darkblue mb-3 border-b border-gray-200 pb-2 pt-4">Keanggotaan PMII</h4>
                        <div class="input-group-modern">
                            <input type="text" id="kaderNIMReadonly" name="nim" class="form-input-modern" required readonly placeholder=" ">
                            <label for="kaderNIMReadonly" class="form-label-modern">NIM</label>
                        </div>
                        <div class="input-group-modern">
                            <select id="kaderRayon" name="rayon" class="form-input-modern">
                                <option value=""></option>
                                </select>
                            <label for="kaderRayon" class="form-label-modern">Rayon</label>
                        </div>
                        <div class="input-group-modern">
                            <input type="text" id="kaderKomisariat" name="komisariat" class="form-input-modern" readonly placeholder=" ">
                            <label for="kaderKomisariat" class="form-label-modern">Komisariat</label>
                        </div>
                        <div class="input-group-modern">
                            <select id="kaderKlasifikasi" name="klasifikasi" class="form-input-modern">
                                <option value=""></option>
                                <option value="Kader Mu'taqid">Kader Mu’taqid</option>
                                <option value="Kader Mujahid">Kader Mujahid</option>
                                <option value="Kader Mujtahid">Kader Mujtahid</option>
                                <option value="Kader Muharik">Kader Muharik</option>
                            </select>
                            <label for="kaderKlasifikasi" class="form-label-modern">Tingkat Kaderisasi</label>
                        </div>
                        <div class="input-group-modern">
                            <input type="number" id="kaderTahunMasukPMII" name="tahun_masuk_pmii" class="form-input-modern" min="1900" max="2100" placeholder=" ">
                            <label for="kaderTahunMasukPMII" class="form-label-modern">Tahun Masuk PMII</label>
                        </div>
                        <div class="input-group-modern">
                            <textarea id="kaderRiwayatJabatan" name="riwayat_jabatan" class="form-input-modern" rows="2" placeholder=" "></textarea>
                            <label for="kaderRiwayatJabatan" class="form-label-modern">Riwayat Jabatan (opsional)</label>
                        </div>

                        <h4 class="text-md font-semibold text-pmii-darkblue mb-3 border-b border-gray-200 pb-2 pt-4">Keterangan Tambahan</h4>
                        <div class="input-group-modern">
                            <textarea id="kaderKeahlianMinat" name="keahlian_minat" class="form-input-modern" rows="2" placeholder=" "></textarea>
                            <label for="kaderKeahlianMinat" class="form-label-modern">Keahlian / Minat</label>
                        </div>
                        <div class="input-group-modern">
                            <textarea id="kaderMediaSosial" name="media_sosial" class="form-input-modern" rows="2" placeholder=" "></textarea>
                            <label for="kaderMediaSosial" class="form-label-modern">Media Sosial (Pisahkan dengan koma)</label>
                        </div>
                        <div class="input-group-modern">
                            <textarea id="kaderKaryaTulis" name="karya_tulis" class="form-input-modern" rows="2" placeholder=" "></textarea>
                            <label for="kaderKaryaTulis" class="form-label-modern">Karya Tulis / Kontribusi</label>
                        </div>

                        <h4 class="text-md font-semibold text-pmii-darkblue mb-3 border-b border-gray-200 pb-2 pt-4">Dokumen Pendukung</h4>
                        <div class="file-upload-group">
                            <label class="upload-btn-wrapper">
                                <i class="fas fa-upload"></i> Unggah KTP
                                <input type="file" id="uploadKTP" accept=".pdf,image/*">
                            </label>
                            <span id="fileNameKTP" class="file-name-display">Tidak ada file dipilih.</span>
                            <span class="required-label">*Wajib</span>
                        </div>
                        <div class="file-upload-group">
                            <label class="upload-btn-wrapper">
                                <i class="fas fa-upload"></i> Unggah KTM
                                <input type="file" id="uploadKTM" accept=".pdf,image/*">
                            </label>
                            <span id="fileNameKTM" class="file-name-display">Tidak ada file dipilih.</span>
                            <span class="required-label">*Wajib</span>
                        </div>
                        <div class="file-upload-group">
                            <label class="upload-btn-wrapper">
                                <i class="fas fa-upload"></i> Unggah Sertifikat Kaderisasi
                                <input type="file" id="uploadSertifikatKaderisasi" accept=".pdf,image/*">
                            </label>
                            <span id="fileNameSertifikatKaderisasi" class="file-name-display">Tidak ada file dipilih.</span>
                            <span class="required-label">*Wajib</span>
                        </div>

                        <div class="space-y-4 pt-4">
                            <button type="submit" class="btn-modern btn-primary-modern w-full">
                                <i class="fas fa-save mr-2"></i>Simpan Perubahan Profil
                            </button>
                            <button type="button" id="ajukanPerubahanBtn" class="btn-modern btn-outline-modern w-full">
                                <i class="fas fa-paper-plane mr-2"></i>Ajukan Perubahan ke Admin
                            </button>
                            <button type="button" id="downloadBiodataBtn" class="btn-modern btn-outline-modern w-full">
                                <i class="fas fa-download mr-2"></i>Unduh Biodata (PDF)
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    </div>

    <footer class="main-footer py-10 mt-auto">
        <div class="container mx-auto px-4 text-center">
            <img src="../img/logo-pmii.png" alt="Logo PMII Footer" class="h-12 w-12 mx-auto mb-2.5 rounded-full">
            <p class="text-md font-semibold footer-title">PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung</p>
            <p class="text-xs mt-3">&copy; <span id="tahun-footer-kader-profile"></span> PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung. All Rights Reserved.</p>
        </div>
    </footer>

    <button id="scrollToTopBtnEditProfil" title="Kembali ke atas" class="hidden fixed bottom-6 right-6 z-50 items-center justify-center hover:bg-yellow-300 focus:outline-none">
        <i class="fas fa-arrow-up text-lg"></i>
    </button>

<script type="module">
    // Injeksi data PHP ke JavaScript
    window.phpLoggedInUser = <?php echo $loggedInUserJson; ?>;
</script>
<script type="module" src="../js/edit-profil-kader.js"></script>
</body>
</html>