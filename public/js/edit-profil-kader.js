// public/js/edit-profil-kader.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, handleAuthClick, getAuthData } from './auth.js';
import { getKaderProfile, updateKaderProfile, getAllRayons, uploadFile } from './api.js'; // Import API untuk kader dan upload

document.addEventListener('DOMContentLoaded', async function () { // Tambahkan async di sini
    // --- Data Injeksi dari PHP (diakses melalui window global) ---
    const phpLoggedInUser = window.phpLoggedInUser;

    // --- Global State & Elements ---
    const LOCAL_STORAGE_USER_KEY = 'loggedInUser';
    let loggedInUser = null; // Ini akan menampung data user yang di-parse dari localStorage

    // Navbar & Auth Elements
    const headerTitleText = document.getElementById('header-title-text');
    const mobileHeaderTitleText = document.getElementById('mobile-header-title-text');
    const authLinkMain = document.getElementById('auth-link-main');
    const authLinkMobile = document.getElementById('mobile-logout-link'); // ID dari HTML mobile menu

    const authElements = {
        authLinkMain, authLinkMobile,
        // Ini harus ada di edit-profil-kader.php, jika tidak, mereka akan null
        desktopKaderMenuContainer: document.getElementById('desktop-kader-menu-container'),
        desktopAdminMenuContainer: document.getElementById('desktop-admin-menu-container'),
        headerTitleText, mobileHeaderTitleText
    };

    // Panggil updateAuthUI dari modul auth.js untuk menginisialisasi status login di UI
    updateAuthUI(authElements);

    // Dapatkan data pengguna yang login setelah updateAuthUI() dipanggil
    const authData = getAuthData();
    loggedInUser = authData.userData || phpLoggedInUser; // Prioritaskan data dari auth.js/localStorage, fallback ke PHP

    // Elemen spesifik untuk Edit Profil Kader
    const kaderNameHeader = document.getElementById('kader-name-header');
    const authInfoHeader = document.getElementById('auth-info-header'); // Ini adalah tombol Logout/Login di header

    // Elemen Form Profil Kader
    const profileEditForm = document.getElementById('profileEditForm');
    const profilePicturePreview = document.getElementById('profilePicturePreview');
    const profilePictureInput = document.getElementById('profilePictureInput');
    const kaderNama = document.getElementById('kaderNama');
    const kaderNIM = document.getElementById('kaderNIM'); // Pastikan ini ada jika tidak readonly
    const kaderNIK = document.getElementById('kaderNIK');
    const kaderTempatLahir = document.getElementById('kaderTempatLahir');
    const kaderTanggalLahir = document.getElementById('kaderTanggalLahir');
    const kaderJenisKelamin = document.getElementById('kaderJenisKelamin');
    const kaderAlamat = document.getElementById('kaderAlamat');
    const kaderNoHP = document.getElementById('kaderNoHP');
    const kaderEmailPribadi = document.getElementById('kaderEmailPribadi');
    const kaderUniversitas = document.getElementById('kaderUniversitas');
    const kaderFakultasJurusan = document.getElementById('kaderFakultasJurusan');
    const kaderTahunMasukKuliah = document.getElementById('kaderTahunMasukKuliah');
    const kaderStatusMahasiswa = document.getElementById('kaderStatusMahasiswa');
    const kaderIPK = document.getElementById('kaderIPK');
    const kaderNIMReadonly = document.getElementById('kaderNIMReadonly'); // NIM readonly
    const kaderRayon = document.getElementById('kaderRayon');
    const kaderKomisariat = document.getElementById('kaderKomisariat');
    const kaderKlasifikasi = document.getElementById('kaderKlasifikasi');
    const kaderTahunMasukPMII = document.getElementById('kaderTahunMasukPMII');
    const kaderRiwayatJabatan = document.getElementById('kaderRiwayatJabatan');
    const kaderKeahlianMinat = document.getElementById('kaderKeahlianMinat');
    const kaderMediaSosial = document.getElementById('kaderMediaSosial');
    const kaderKaryaTulis = document.getElementById('kaderKaryaTulis');
    const profileEditFormResponse = document.getElementById('profile-edit-form-response');

    // Additional Buttons & New File Uploads
    const ajukanPerubahanBtn = document.getElementById('ajukanPerubahanBtn');
    const downloadBiodataBtn = document.getElementById('downloadBiodataBtn');

    // New file upload elements
    const uploadIPKTranscript = document.getElementById('uploadIPKTranscript');
    const fileNameIPKTranscript = document.getElementById('fileNameIPKTranscript');
    const uploadKTP = document.getElementById('uploadKTP');
    const fileNameKTP = document.getElementById('fileNameKTP');
    const uploadKTM = document.getElementById('uploadKTM');
    const fileNameKTM = document.getElementById('fileNameKTM');
    const uploadSertifikatKaderisasi = document.getElementById('uploadSertifikatKaderisasi');
    const fileNameSertifikatKaderisasi = document.getElementById('fileNameSertifikatKaderisasi');

    // Event listener untuk tombol login/logout di header
    if (authInfoHeader) {
        authInfoHeader.addEventListener('click', handleAuthClick);
    }

    // --- Fungsi Kotak Pesan Kustom (akan diakses oleh berbagai fungsi) ---
    window.showCustomMessage = window.showCustomMessage || function(message, type = 'info', callback = null) {
        const messageBox = document.getElementById('customMessageBox');
        if (!messageBox) return;
        messageBox.textContent = message;
        messageBox.className = 'fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-xl text-white text-sm font-semibold transition-all duration-300 transform translate-x-full opacity-0';
        if (type === 'success') { messageBox.classList.add('bg-green-500'); } else if (type === 'error') { messageBox.classList.add('bg-red-500'); } else { messageBox.classList.add('bg-blue-500'); }
        messageBox.classList.remove('translate-x-full', 'opacity-0');
        messageBox.classList.add('translate-x-0', 'opacity-100');
        setTimeout(() => {
            messageBox.classList.remove('translate-x-0', 'opacity-100');
            messageBox.classList.add('translate-x-full', 'opacity-0');
            if (callback) messageBox.addEventListener('transitionend', function handler() { callback(); messageBox.removeEventListener('transitionend', handler); });
        }, 3000);
    };

    window.showCustomConfirm = window.showCustomConfirm || function(title, message, onConfirm, onCancel = null) {
        const customConfirmModal = document.getElementById('customConfirmModal');
        const confirmModalTitle = document.getElementById('confirmModalTitle');
        const confirmModalMessage = document.getElementById('confirmModalMessage');
        const confirmYesBtn = document.getElementById('confirmYesBtn');
        const confirmCancelBtn = document.getElementById('confirmCancelBtn');
        let currentConfirmCallback = null;
        if (!customConfirmModal || !confirmModalTitle || !confirmModalMessage || !confirmYesBtn || !confirmCancelBtn) return;
        confirmModalTitle.textContent = title; confirmModalMessage.textContent = message;
        customConfirmModal.classList.add('active'); currentConfirmCallback = onConfirm;
        confirmYesBtn.onclick = () => { if (currentConfirmCallback) { currentConfirmCallback(); } hideCustomConfirm(); };
        confirmCancelBtn.onclick = () => { if (onCancel) { onCancel(); } hideCustomConfirm(); };
        function hideCustomConfirm() { customConfirmModal.classList.remove('active'); currentConfirmCallback = null; }
        customConfirmModal.addEventListener('click', function(event) { if (event.target === customConfirmModal) hideCustomConfirm(); });
    };


    // --- Fungsi Otentikasi & Akses Halaman ---
    async function initializePageAccess() {
        // Logika pemeriksaan peran pengguna
        const allowedRolesForThisPage = ['kader'];
        const currentPage = window.location.pathname.split('/').pop();

        let hasAccess = false;
        let userRole = loggedInUser ? loggedInUser.role : null;

        if (userRole && allowedRolesForThisPage.includes(userRole)) {
            hasAccess = true;
        }

        // Halaman yang selalu diizinkan tanpa login (halaman publik)
        const defaultAllowedPages = [
            'index.php', 'login.php', 'digilib.php', 'tentang-kami.php',
            'berita-artikel.php', 'agenda-kegiatan.php', 'galeri-foto.php',
            'all-rayons.php', 'rayon-profile.php', 'akses-ojs.php',
            'lupa-password.php', 'register-kader.php', 'status-ttd.php',
            'generate-qr.php',
            ''
        ];

        if (!defaultAllowedPages.includes(currentPage) && !hasAccess) {
            window.showCustomMessage("Anda tidak memiliki hak akses ke halaman ini. Silakan login sebagai Kader.", 'error', () => {
                window.location.assign('../login.php');
            });
            document.body.innerHTML = `
                <div class="main-content-wrapper flex flex-col items-center justify-center min-h-screen text-center bg-pmii-darkblue text-white p-8">
                    <i class="fas fa-exclamation-triangle text-6xl text-pmii-yellow mb-4 animate-bounce"></i>
                    <h1 class="text-3xl lg:text-4xl font-bold mb-4">Akses Ditolak</h1>
                    <p class="text-lg mb-6">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
                    <a href="../login.php" class="btn btn-primary-pmii text-lg">
                        <i class="fas fa-sign-in-alt mr-2"></i> Kembali ke Login
                    </a>
                </div>
            `;
            return false;
        }

        // Jika memiliki akses, update nama kader di header
        if (hasAccess) {
            if (kaderNameHeader) {
                kaderNameHeader.textContent = `Halo, ${loggedInUser.nama || 'Kader'}`;
                kaderNameHeader.classList.remove('hidden');
            }
        } else {
            // Jika tidak memiliki akses atau halaman publik, sembunyikan nama kader
            if (kaderNameHeader) kaderNameHeader.classList.add('hidden');
        }
        return true;
    }


    // --- Fungsi Memuat Data Profil Kader dari API ---
    async function loadKaderProfileData() {
        if (!loggedInUser || !loggedInUser.user_id) { // Asumsi `user_id` adalah ID unik dari user login
            console.error("User tidak login atau user_id tidak ditemukan.");
            window.showCustomMessage("Gagal memuat profil: Pengguna tidak teridentifikasi.", "error");
            return;
        }

        try {
            // Panggil API untuk mendapatkan profil kader
            const profileResponse = await getKaderProfile(loggedInUser.user_id); // Mengambil profil berdasarkan user_id
            if (profileResponse && profileResponse.data) {
                const kaderData = profileResponse.data;
                populateForm(kaderData);
                window.showCustomMessage("Profil kader berhasil dimuat.", "success");
            } else {
                // Jika API tidak mengembalikan data, mungkin ini kader baru
                console.warn("Data profil kader tidak ditemukan di backend. Menggunakan data default.");
                window.showCustomMessage("Profil belum lengkap. Silakan lengkapi data Anda.", "info");
                // Reset form atau biarkan kosong untuk diisi
                profileEditForm.reset();
                kaderNIMReadonly.value = loggedInUser.nim || ''; // Pastikan NIM dari login tetap ada
                kaderKomisariat.value = 'UIN Sunan Gunung Djati Bandung'; // Komisariat default
            }
        } catch (error) {
            console.error("Error loading kader profile from API:", error);
            window.showCustomMessage("Gagal memuat profil kader. Silakan coba lagi.", "error");
        }
    }

    // --- Fungsi Memuat Daftar Rayon untuk Dropdown dari API ---
    async function populateRayonsDropdown() {
        try {
            const rayonsResponse = await getAllRayons(); // Asumsi ini mengambil semua rayon
            if (rayonsResponse && rayonsResponse.data) {
                kaderRayon.innerHTML = '<option value="">Pilih Rayon...</option>';
                rayonsResponse.data.forEach(rayon => {
                    const option = document.createElement('option');
                    option.value = rayon.id; // Asumsi ID rayon
                    option.textContent = rayon.name; // Asumsi nama rayon
                    kaderRayon.appendChild(option);
                });
            } else {
                console.warn("Gagal memuat daftar rayon dari API. Menggunakan opsi default.");
                 kaderRayon.innerHTML = `
                    <option value="">Pilih Rayon...</option>
                    <option value="Rayon Syariah">Rayon Syariah</option>
                    <option value="Rayon Tarbiyah">Rayon Tarbiyah</option>
                    <option value="Rayon Ushuluddin">Rayon Ushuluddin</option>
                    <option value="Rayon Dakwah">Rayon Dakwah</option>
                    <option value="Rayon Sains dan Teknologi">Rayon Sains dan Teknologi</option>
                    <option value="Rayon Adab dan Humaniora">Rayon Adab dan Humaniora</option>
                    <option value="Rayon Psikologi">Rayon Psikologi</option>
                    <option value="Rayon Ilmu Sosial dan Ilmu Politik">Rayon Ilmu Sosial dan Ilmu Politik</option>
                    <option value="Rayon Ekonomi dan Bisnis Islam">Rayon Ekonomi dan Bisnis Islam</option>
                    <option value="Lainnya">Lainnya</option>
                `;
            }
        } catch (error) {
            console.error("Error fetching rayons for dropdown:", error);
            window.showCustomMessage("Gagal memuat daftar rayon.", "error");
        }
    }

    // --- Fungsi mengisi formulir dengan data yang dimuat ---
    function populateForm(data) {
        kaderNama.value = data.full_name || '';
        kaderNIM.value = data.nim || ''; // Jika ini bukan readonly
        kaderNIK.value = data.nik || '';
        kaderTempatLahir.value = data.place_of_birth || '';
        kaderTanggalLahir.value = data.date_of_birth || '';
        kaderJenisKelamin.value = data.gender || '';
        kaderAlamat.value = data.address || '';
        kaderNoHP.value = data.phone_number || '';
        kaderEmailPribadi.value = data.personal_email || '';
        kaderUniversitas.value = data.university || '';
        kaderFakultasJurusan.value = data.faculty_major || '';
        kaderTahunMasukKuliah.value = data.entry_year_university || '';
        kaderStatusMahasiswa.value = data.student_status || '';
        kaderIPK.value = data.ipk || '';
        kaderNIMReadonly.value = data.nim || '';
        kaderRayon.value = data.rayon_id || ''; // Menggunakan rayon_id dari data
        kaderKomisariat.value = data.komisariat || 'UIN Sunan Gunung Djati Bandung';
        kaderKlasifikasi.value = data.cadre_level || '';
        kaderTahunMasukPMII.value = data.pmii_entry_year || '';
        kaderRiwayatJabatan.value = data.pmii_positions_history || '';
        kaderKeahlianMinat.value = data.skills_interests || '';
        kaderMediaSosial.value = data.social_media ? data.social_media.join(', ') : '';
        kaderKaryaTulis.value = data.written_works || '';

        // Tampilkan gambar profil jika ada
        if (data.profile_picture_url) {
            profilePicturePreview.src = data.profile_picture_url;
        } else {
            profilePicturePreview.src = "https://placehold.co/120x120/cccccc/444444?text=Avatar";
        }
        
        // Tampilkan nama file yang sudah diunggah jika ada
        fileNameIPKTranscript.textContent = data.ipk_transcript_filename || 'Tidak ada file dipilih.';
        fileNameKTP.textContent = data.ktp_filename || 'Tidak ada file dipilih.';
        fileNameKTM.textContent = data.ktm_filename || 'Tidak ada file dipilih.';
        fileNameSertifikatKaderisasi.textContent = data.cadre_certificate_filename || 'Tidak ada file dipilih.';

        // Perbarui status floating label
        document.querySelectorAll('.form-input-modern').forEach(input => updateLabelClass(input));
    }

    // Fungsi untuk mengupdate kelas floating label
    function updateLabelClass(input) {
        const label = input.nextElementSibling;
        if (label && label.classList.contains('form-label-modern')) {
            if (input.value.trim() !== '' || (input.tagName === 'SELECT' && input.value !== '')) {
                input.classList.add('has-value');
            } else {
                input.classList.remove('has-value');
            }
        }
    }

    // Inisialisasi floating labels untuk semua input
    const allInputs = document.querySelectorAll('.form-input-modern');
    allInputs.forEach(input => {
        updateLabelClass(input);
        input.addEventListener('input', () => updateLabelClass(input));
        input.addEventListener('change', () => updateLabelClass(input));
        input.addEventListener('blur', () => updateLabelClass(input));
        input.addEventListener('focus', () => {
            const label = input.nextElementSibling;
            if(label && label.classList.contains('form-label-modern')) label.classList.add('active-label-style');
        });
        input.addEventListener('blur', () => {
            const label = input.nextElementSibling;
            updateLabelClass(input);
            if(label && label.classList.contains('form-label-modern')) label.classList.remove('active-label-style');
        });
    });


    // --- Penanganan Unggah File (akan menggunakan fungsi uploadFile dari api.js) ---
    async function handleFileUploadAndDisplay(inputElement, fileNameDisplayElement, type) {
        const file = inputElement.files[0];
        if (!file) {
            fileNameDisplayElement.textContent = 'Tidak ada file dipilih.';
            return { filename: null, file_url: null };
        }

        const allowedTypes = {
            'image': ['image/jpeg', 'image/png', 'image/gif'],
            'document': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        };

        let isValidType = false;
        if (type === 'image') isValidType = allowedTypes.image.includes(file.type);
        else if (type === 'document') isValidType = allowedTypes.document.includes(file.type);
        else if (type === 'all') isValidType = allowedTypes.image.includes(file.type) || allowedTypes.document.includes(file.type);

        if (!isValidType) {
            window.showCustomMessage(`Format file tidak didukung untuk ${file.name}.`, 'error');
            inputElement.value = ''; // Reset input
            fileNameDisplayElement.textContent = 'Tidak ada file dipilih.';
            return { filename: null, file_url: null };
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            window.showCustomMessage(`Ukuran file "${file.name}" terlalu besar. Maksimal 5MB.`, 'error');
            inputElement.value = ''; // Reset input
            fileNameDisplayElement.textContent = 'Tidak ada file dipilih.';
            return { filename: null, file_url: null };
        }

        fileNameDisplayElement.textContent = `Mengunggah ${file.name}...`;
        try {
            const uploadResponse = await uploadFile(inputElement, { type: type, user_id: loggedInUser.user_id }); // Kirim user_id
            if (uploadResponse && uploadResponse.file_url) {
                fileNameDisplayElement.textContent = file.name;
                window.showCustomMessage(`File "${file.name}" berhasil diunggah.`, 'success');
                return { filename: file.name, file_url: uploadResponse.file_url };
            } else {
                throw new Error(uploadResponse.message || "Unggah file gagal.");
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            window.showCustomMessage(`Gagal mengunggah file "${file.name}". ${error.message}`, 'error');
            fileNameDisplayElement.textContent = 'Gagal unggah.';
            inputElement.value = ''; // Reset input on failure
            return { filename: null, file_url: null };
        }
    }


    // Event listener untuk unggah gambar profil
    profilePictureInput.addEventListener('change', async () => {
        const result = await handleFileUploadAndDisplay(profilePictureInput, { textContent: 'Mengunggah foto...' }, 'image');
        if (result.file_url) {
            profilePicturePreview.src = result.file_url;
            profilePicturePreview.classList.remove('hidden');
            // Simpan URL ke objek loggedInUser sementara agar bisa disubmit nanti
            if (loggedInUser) {
                loggedInUser.profile_picture_url = result.file_url;
            }
        } else {
            profilePicturePreview.src = "https://placehold.co/120x120/cccccc/444444?text=Avatar";
            profilePicturePreview.classList.add('hidden');
            if (loggedInUser) {
                delete loggedInUser.profile_picture_url;
            }
        }
    });
    // Event listeners untuk unggahan dokumen
    uploadIPKTranscript.addEventListener('change', async () => {
        const result = await handleFileUploadAndDisplay(uploadIPKTranscript, fileNameIPKTranscript, 'document');
        if (loggedInUser) {
            loggedInUser.ipk_transcript_filename = result.filename;
            loggedInUser.ipk_transcript_url = result.file_url;
        }
    });
    uploadKTP.addEventListener('change', async () => {
        const result = await handleFileUploadAndDisplay(uploadKTP, fileNameKTP, 'document');
        if (loggedInUser) {
            loggedInUser.ktp_filename = result.filename;
            loggedInUser.ktp_url = result.file_url;
        }
    });
    uploadKTM.addEventListener('change', async () => {
        const result = await handleFileUploadAndDisplay(uploadKTM, fileNameKTM, 'document');
        if (loggedInUser) {
            loggedInUser.ktm_filename = result.filename;
            loggedInUser.ktm_url = result.file_url;
        }
    });
    uploadSertifikatKaderisasi.addEventListener('change', async () => {
        const result = await handleFileUploadAndDisplay(uploadSertifikatKaderisasi, fileNameSertifikatKaderisasi, 'document');
        if (loggedInUser) {
            loggedInUser.cadre_certificate_filename = result.filename;
            loggedInUser.cadre_certificate_url = result.file_url;
        }
    });


    // --- Penanganan Form Submission ---
    profileEditForm?.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!loggedInUser || !loggedInUser.user_id) {
            window.showCustomMessage("Anda harus login untuk menyimpan profil.", "error");
            return;
        }

        // Validasi dasar form input (HTML5 required attribute cukup untuk awal)
        const requiredInputs = profileEditForm.querySelectorAll('[required]');
        let allFieldsValid = true;
        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('invalid');
                allFieldsValid = false;
            } else {
                input.classList.remove('invalid');
            }
        });

        // Validasi file wajib (walaupun sudah ada di handleFileUploadAndDisplay, cek lagi di sini)
        if (!fileNameIPKTranscript.textContent || fileNameIPKTranscript.textContent === 'Tidak ada file dipilih.') {
            window.showCustomMessage('Transkrip Nilai / KHS wajib diunggah.', 'error');
            allFieldsValid = false;
        }
        if (!fileNameKTP.textContent || fileNameKTP.textContent === 'Tidak ada file dipilih.') {
            window.showCustomMessage('File KTP wajib diunggah.', 'error');
            allFieldsValid = false;
        }
        if (!fileNameKTM.textContent || fileNameKTM.textContent === 'Tidak ada file dipilih.') {
            window.showCustomMessage('File KTM wajib diunggah.', 'error');
            allFieldsValid = false;
        }
        if (!fileNameSertifikatKaderisasi.textContent || fileNameSertifikatKaderisasi.textContent === 'Tidak ada file dipilih.') {
            window.showCustomMessage('File Sertifikat Kaderisasi wajib diunggah.', 'error');
            allFieldsValid = false;
        }


        if (!allFieldsValid) {
            window.showCustomMessage('Harap lengkapi semua bidang yang wajib diisi dan perbaiki kesalahan.', 'error');
            return;
        }

        // Kumpulkan data dari formulir
        const updatedProfileData = {
            full_name: kaderNama.value,
            nik: kaderNIK.value,
            place_of_birth: kaderTempatLahir.value,
            date_of_birth: kaderTanggalLahir.value,
            gender: kaderJenisKelamin.value,
            address: kaderAlamat.value,
            phone_number: kaderNoHP.value,
            personal_email: kaderEmailPribadi.value,
            university: kaderUniversitas.value,
            faculty_major: kaderFakultasJurusan.value,
            entry_year_university: parseInt(kaderTahunMasukKuliah.value),
            student_status: kaderStatusMahasiswa.value,
            ipk: parseFloat(kaderIPK.value),
            rayon_id: kaderRayon.value, // Kirim ID rayon
            komisariat: kaderKomisariat.value, // Tetap UIN Sunan Gunung Djati Bandung
            cadre_level: kaderKlasifikasi.value,
            pmii_entry_year: parseInt(kaderTahunMasukPMII.value),
            pmii_positions_history: kaderRiwayatJabatan.value,
            skills_interests: kaderKeahlianMinat.value,
            social_media: kaderMediaSosial.value.split(',').map(s => s.trim()).filter(Boolean),
            written_works: kaderKaryaTulis.value,
            
            // Sertakan URL file yang sudah diunggah atau yang sudah ada
            profile_picture_url: profilePicturePreview.src.startsWith('https://placehold.co') ? null : profilePicturePreview.src,
            ipk_transcript_filename: fileNameIPKTranscript.textContent === 'Tidak ada file dipilih.' ? null : fileNameIPKTranscript.textContent,
            ipk_transcript_url: loggedInUser.ipk_transcript_url || null,
            ktp_filename: fileNameKTP.textContent === 'Tidak ada file dipilih.' ? null : fileNameKTP.textContent,
            ktp_url: loggedInUser.ktp_url || null,
            ktm_filename: fileNameKTM.textContent === 'Tidak ada file dipilih.' ? null : fileNameKTM.textContent,
            ktm_url: loggedInUser.ktm_url || null,
            cadre_certificate_filename: fileNameSertifikatKaderisasi.textContent === 'Tidak ada file dipilih.' ? null : fileNameSertifikatKaderisasi.textContent,
            cadre_certificate_url: loggedInUser.cadre_certificate_url || null
        };

        try {
            // Panggil API untuk memperbarui profil kader
            const response = await updateKaderProfile(loggedInUser.user_id, updatedProfileData);
            if (response && response.success) {
                window.showCustomMessage('Profil berhasil diperbarui!', 'success');
                // Perbarui loggedInUser di localStorage dengan data terbaru
                localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify({ ...loggedInUser, ...updatedProfileData }));
            } else {
                throw new Error(response.message || 'Gagal memperbarui profil.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            window.showCustomMessage(error.message || 'Terjadi kesalahan saat menyimpan perubahan.', 'error');
        }
    });

    // Simulate "Ajukan Perubahan" - ini mungkin akan mengirim email ke admin
    ajukanPerubahanBtn?.addEventListener('click', function() {
        window.showCustomMessage('Perubahan profil Anda telah diajukan untuk ditinjau admin.', 'info');
    });

    // Simulate "Unduh Biodata (PDF)" - ini perlu terintegrasi dengan backend yang menghasilkan PDF
    downloadBiodataBtn?.addEventListener('click', async function() {
        if (!loggedInUser || !loggedInUser.user_id) {
            window.showCustomMessage('Tidak ada data profil untuk diunduh.', 'error');
            return;
        }
        window.showCustomMessage('Mempersiapkan dokumen untuk diunduh...', 'info');
        // Contoh: mengarahkan ke endpoint API yang menghasilkan PDF
        // Anda perlu endpoint backend yang menerima user_id dan mengembalikan file PDF
        // window.location.href = `/api/kaders/${loggedInUser.user_id}/download-biodata`;
        
        // Untuk simulasi frontend saja, buat blob teks
        const biodataText = `
Nama Lengkap: ${kaderNama.value}
NIM: ${kaderNIMReadonly.value}
NIK: ${kaderNIK.value}
Tempat, Tanggal Lahir: ${kaderTempatLahir.value}, ${kaderTanggalLahir.value}
Jenis Kelamin: ${kaderJenisKelamin.value}
Alamat: ${kaderAlamat.value}
No. HP: ${kaderNoHP.value}
Email Pribadi: ${kaderEmailPribadi.value}

Universitas: ${kaderUniversitas.value}
Fakultas/Jurusan: ${kaderFakultasJurusan.value}
Tahun Masuk Kuliah: ${kaderTahunMasukKuliah.value}
Status Mahasiswa: ${kaderStatusMahasiswa.value}
IPK Terakhir: ${kaderIPK.value}
File Transkrip/KHS: ${fileNameIPKTranscript.textContent}

Rayon: ${kaderRayon.options[kaderRayon.selectedIndex].text}
Komisariat: ${kaderKomisariat.value}
Tingkat Kaderisasi: ${kaderKlasifikasi.value}
Tahun Masuk PMII: ${kaderTahunMasukPMII.value}
Riwayat Jabatan: ${kaderRiwayatJabatan.value}

Keahlian/Minat: ${kaderKeahlianMinat.value}
Media Sosial: ${kaderMediaSosial.value}
Karya Tulis/Kontribusi: ${kaderKaryaTulis.value}

Dokumen Unggahan:
KTP: ${fileNameKTP.textContent}
KTM: ${fileNameKTM.textContent}
Sertifikat Kaderisasi: ${fileNameSertifikatKaderisasi.textContent}
        `;
        const blob = new Blob([biodataText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Biodata_${kaderNama.value.replace(/\s/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // Bersihkan URL objek
        window.showCustomMessage('Biodata berhasil diunduh.', 'success');
    });


    // --- Inisialisasi Halaman ---
    const pageCanContinue = await initializePageAccess(); // Tunggu hasil pengecekan akses

    if (pageCanContinue) {
        await populateRayonsDropdown(); // Populasikan dropdown rayon sebelum memuat data profil
        await loadKaderProfileData(); // Muat data profil kader dari API

        // Scroll to top button functionality
        const scrollToTopBtnEditProfil = document.getElementById('scrollToTopBtnEditProfil');
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 200) {
                scrollToTopBtnEditProfil.classList.remove('hidden');
                scrollToTopBtnEditProfil.classList.add('flex');
            } else {
                scrollToTopBtnEditProfil.classList.add('hidden');
                scrollToTopBtnEditProfil.classList.remove('flex');
            }
        });

        if (scrollToTopBtnEditProfil) {
            scrollToTopBtnEditProfil.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // Update footer year
        const tahunFooterKaderProfile = document.getElementById('tahun-footer-kader-profile');
        if (tahunFooterKaderProfile) {
            tahunFooterKaderProfile.textContent = new Date().getFullYear();
        }
    }
});