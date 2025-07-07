// public/js/edit-profil-rayon.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, handleAuthClick, getAuthData } from './auth.js';
import { getRayonById, getAllRayons, updateRayon, uploadFile } from './api.js'; // Impor API untuk rayon dan upload

document.addEventListener('DOMContentLoaded', async function () { // Tambahkan async
    // --- Data Injeksi dari PHP (diakses melalui window global) ---
    const phpLoggedInUser = window.phpLoggedInUser;
    const phpRayonIdFromUrl = window.phpRayonIdFromUrl; // ID rayon dari URL jika ada

    // --- Global State & Elements ---
    const LOCAL_STORAGE_USER_KEY = 'loggedInUser';
    let loggedInUser = null;
    let currentRayonId = null; // ID rayon yang sedang diedit

    // Navbar & Auth Elements
    const headerTitleText = document.getElementById('header-title-text');
    const mobileHeaderTitleText = document.getElementById('mobile-header-title-text');
    const authLinkMain = document.getElementById('auth-link-main');
    const authLinkMobile = document.getElementById('mobile-logout-link');

    const authElements = {
        authLinkMain, authLinkMobile,
        desktopKaderMenuContainer: document.getElementById('desktop-kader-menu-container'),
        desktopAdminMenuContainer: document.getElementById('desktop-admin-menu-container'),
        headerTitleText, mobileHeaderTitleText
    };

    updateAuthUI(authElements);

    const authData = getAuthData();
    loggedInUser = authData.userData || phpLoggedInUser;

    // --- Elemen DOM ---
    const profileForm = document.getElementById('profile-form');
    const logoUploadInput = document.getElementById('logo-upload');
    const logoPreview = document.getElementById('logo-preview');
    const chairmanPhotoUploadInput = document.getElementById('chairman-photo-upload');
    const chairmanPhotoPreview = document.getElementById('chairman-photo-preview');
    const rayonSelectContainer = document.getElementById('rayon-select-container');
    const rayonSelect = document.getElementById('rayon-select');
    const rayonNameInput = document.getElementById('rayon-name');
    const rayonChairmanInput = document.getElementById('rayon-chairman');
    const rayonDescriptionTextarea = document.getElementById('rayon-description');
    const rayonContactInput = document.getElementById('rayon-contact');
    const rayonEmailInput = document.getElementById('rayon-email');
    const rayonAddressTextarea = document.getElementById('rayon-address');
    const socialInstagramInput = document.getElementById('social-instagram');
    const socialFacebookInput = document.getElementById('social-facebook');
    const socialTwitterInput = document.getElementById('social-twitter');
    const socialYoutubeInput = document.getElementById('social-youtube');
    const cadreCountInput = document.getElementById('cadre-count');
    const establishedDateInput = document.getElementById('established-date');
    const rayonVisionTextarea = document.getElementById('rayon-vision');
    const rayonMissionTextarea = document.getElementById('rayon-mission');
    const saveButton = profileForm.querySelector('button[type="submit"]');

    let allRayons = []; // Untuk dropdown rayon (jika admin komisariat)

    // --- Fungsi Kotak Pesan Kustom ---
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

    // Pastikan penanganan klik autentikasi untuk tombol login/logout di navbar berfungsi
    if (authLinkMain) {
        authLinkMain.removeEventListener('click', handleAuthClick);
        authLinkMain.addEventListener('click', handleAuthClick);
    }
    if (authLinkMobile) {
        authLinkMobile.removeEventListener('click', handleAuthClick);
        authLinkMobile.addEventListener('click', handleAuthClick);
    }

    // --- Fungsi Otentikasi & Akses Halaman ---
    async function initializePageAccess() {
        const allowedRolesForThisPage = ['rayon', 'komisariat'];
        const defaultAllowedPages = [
            'index.php', 'login.php', 'digilib.php', 'tentang-kami.php',
            'berita-artikel.php', 'agenda-kegiatan.php', 'galeri-foto.php',
            'all-rayons.php', 'rayon-profile.php', 'akses-ojs.php',
            'lupa-password.php', 'register-kader.php', 'status-ttd.php',
            'generate-qr.php',
            ''
        ];

        const currentPage = window.location.pathname.split('/').pop();

        let hasAccess = false;
        let userRole = loggedInUser ? loggedInUser.role : null;

        if (userRole && allowedRolesForThisPage.includes(userRole)) {
            hasAccess = true;
        }

        if (!defaultAllowedPages.includes(currentPage) && !hasAccess) {
            window.showCustomMessage("Anda tidak memiliki hak akses ke halaman ini. Silakan login dengan akun yang sesuai.", 'error', () => {
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

        // Jika memiliki akses, update UI header
        if (hasAccess) {
            const loggedInTitle = 'SINTAKSIS (Sistem Informasi Terintegrasi Kaderisasi)';
            if (headerTitleText) {
                headerTitleText.textContent = loggedInTitle;
            }
            if (mobileHeaderTitleText) {
                mobileHeaderTitleText.textContent = loggedInTitle;
            }

            // Tentukan ID rayon yang akan diedit
            if (userRole === 'komisariat' && phpRayonIdFromUrl) {
                currentRayonId = phpRayonIdFromUrl;
                rayonSelectContainer.style.display = 'block';
                await populateRayonsDropdown(); // Populasikan dropdown untuk komisariat
                rayonSelect.value = currentRayonId; // Pilih rayon yang dari URL jika ada
                rayonSelect.dispatchEvent(new Event('change')); // Picu event change untuk memuat data

            } else if (userRole === 'rayon' && loggedInUser.rayon_id) {
                currentRayonId = loggedInUser.rayon_id;
                rayonSelectContainer.style.display = 'none'; // Sembunyikan dropdown untuk admin rayon
                // Muat langsung data rayon untuk admin rayon
                await loadRayonData(currentRayonId);
                // Aktifkan semua field setelah data dimuat
                profileForm.querySelectorAll('input, textarea, button').forEach(el => el.disabled = false);
                logoUploadInput.disabled = false;
                chairmanPhotoUploadInput.disabled = false;
                saveButton.disabled = false;
            } else {
                // Skenario fallback jika tidak ada ID rayon atau peran tidak sesuai
                window.showCustomMessage("Data rayon tidak dapat ditentukan. Silakan hubungi admin.", "error");
                profileForm.querySelectorAll('input, textarea, select, button').forEach(el => el.disabled = true);
                return false;
            }
        } else {
            // Jika tidak memiliki akses, atau halaman publik, pastikan header normal
            const defaultTitle = 'PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung';
            if (headerTitleText) {
                headerTitleText.textContent = defaultTitle;
            }
            if (mobileHeaderTitleText) {
                mobileHeaderTitleText.textContent = defaultTitle;
            }
        }
        return true;
    }

    // --- Fungsi Memuat Data Rayon dari API ---
    async function loadRayonData(rayonId) {
        try {
            const response = await getRayonById(rayonId);
            if (response && response.data) {
                populateForm(response.data);
                window.showCustomMessage("Profil rayon berhasil dimuat.", "success");
                return response.data;
            } else {
                console.warn(`Data profil rayon untuk ID ${rayonId} tidak ditemukan.`);
                window.showCustomMessage("Data profil rayon tidak ditemukan.", "error");
                clearForm();
                profileForm.querySelectorAll('input, textarea, select, button').forEach(el => el.disabled = true);
                return null;
            }
        } catch (error) {
            console.error("Error loading rayon profile:", error);
            window.showCustomMessage("Gagal memuat profil rayon. Silakan coba lagi.", "error");
            clearForm();
            profileForm.querySelectorAll('input, textarea, select, button').forEach(el => el.disabled = true);
            return null;
        }
    }

    // --- Fungsi Memuat Daftar Rayon untuk Dropdown (Admin Komisariat) ---
    async function populateRayonsDropdown() {
        try {
            const response = await getAllRayons();
            if (response && response.data) {
                allRayons = response.data; // Simpan untuk penggunaan nanti
                rayonSelect.innerHTML = '<option value="">Pilih Rayon...</option>';
                allRayons.forEach(rayon => {
                    const option = document.createElement('option');
                    option.value = rayon.id;
                    option.textContent = rayon.name;
                    rayonSelect.appendChild(option);
                });
            } else {
                console.warn("Gagal memuat daftar rayon dari API.");
                window.showCustomMessage('Gagal memuat daftar rayon untuk pemilihan.', 'error');
            }
        } catch (error) {
            console.error("Error fetching rayons for dropdown:", error);
            window.showCustomMessage('Terjadi kesalahan saat memuat daftar rayon.', 'error');
        }
    }

    // --- Fungsi mengisi formulir dengan data yang dimuat ---
    function populateForm(data) {
        rayonNameInput.value = data.name || '';
        rayonChairmanInput.value = data.chairman_name || ''; // Sesuaikan dengan nama field API
        rayonDescriptionTextarea.value = data.description || '';
        rayonContactInput.value = data.contact_phone || ''; // Sesuaikan dengan nama field API
        rayonEmailInput.value = data.email || '';
        rayonAddressTextarea.value = data.address || '';
        socialInstagramInput.value = data.instagram_url || ''; // Sesuaikan dengan nama field API
        socialFacebookInput.value = data.facebook_url || '';
        socialTwitterInput.value = data.twitter_url || '';
        socialYoutubeInput.value = data.youtube_url || '';
        cadreCountInput.value = data.cadre_count || 0; // Sesuaikan dengan nama field API
        establishedDateInput.value = data.established_date ? data.established_date.split('T')[0] : ''; // Format YYYY-MM-DD
        rayonVisionTextarea.value = data.vision || '';
        rayonMissionTextarea.value = data.mission || '';

        if (data.logo_url) {
            logoPreview.src = data.logo_url;
            logoPreview.classList.remove('hidden');
        } else {
            logoPreview.src = "https://placehold.co/200x200/e0e0e0/9e9e9e?text=Logo";
            logoPreview.classList.add('hidden');
        }
        if (data.chairman_photo_url) { // Sesuaikan dengan nama field API
            chairmanPhotoPreview.src = data.chairman_photo_url;
            chairmanPhotoPreview.classList.remove('hidden');
        } else {
            chairmanPhotoPreview.src = "https://placehold.co/160x160/e0e0e0/9e9e9e?text=Ketua";
            chairmanPhotoPreview.classList.add('hidden');
        }
    }

    // Fungsi untuk mengosongkan formulir
    function clearForm() {
        profileForm.reset();
        logoPreview.src = "https://placehold.co/200x200/e0e0e0/9e9e9e?text=Logo";
        logoPreview.classList.add('hidden');
        chairmanPhotoPreview.src = "https://placehold.co/160x160/e0e0e0/9e9e9e?text=Ketua";
        chairmanPhotoPreview.classList.add('hidden');
        if (rayonSelect) rayonSelect.value = "";
        profileForm.querySelectorAll('input, textarea, select').forEach(el => el.classList.remove('invalid'));
    }

    // Helper function for image file handling using uploadFile API
    async function handleImageUpload(inputElement, previewElement, type) {
        const file = inputElement.files[0];
        if (!file) {
            previewElement.src = previewElement.dataset.originalSrc || (type === 'logo' ? "https://placehold.co/200x200/e0e0e0/9e9e9e?text=Logo" : "https://placehold.co/160x160/e0e0e0/9e9e9e?text=Ketua");
            previewElement.classList.add('hidden');
            return null;
        }

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            window.showCustomMessage('Ukuran gambar terlalu besar. Maksimal 2MB.', 'error');
            inputElement.value = '';
            previewElement.src = previewElement.dataset.originalSrc || (type === 'logo' ? "https://placehold.co/200x200/e0e0e0/9e9e9e?text=Logo" : "https://placehold.co/160x160/e0e0e0/9e9e9e?text=Ketua");
            previewElement.classList.add('hidden');
            return null;
        }

        try {
            const uploadResponse = await uploadFile(inputElement, { type: type, rayon_id: currentRayonId }); // Sertakan ID rayon
            if (uploadResponse && uploadResponse.file_url) {
                previewElement.src = uploadResponse.file_url;
                previewElement.classList.remove('hidden');
                window.showCustomMessage(`Gambar berhasil diunggah!`, 'success');
                return uploadResponse.file_url;
            } else {
                throw new Error(uploadResponse.message || "Unggah gambar gagal.");
            }
        } catch (error) {
            console.error(`Error uploading ${type} image:`, error);
            window.showCustomMessage(`Gagal mengunggah gambar ${type}. ${error.message}`, 'error');
            inputElement.value = '';
            previewElement.src = previewElement.dataset.originalSrc || (type === 'logo' ? "https://placehold.co/200x200/e0e0e0/9e9e9e?text=Logo" : "https://placehold.co/160x160/e0e0e0/9e9e9e?text=Ketua");
            previewElement.classList.add('hidden');
            return null;
        }
    }


    // --- Event Listeners ---
    // Inisialisasi floating labels untuk semua input
    const allInputs = document.querySelectorAll('.form-input');
    allInputs.forEach(input => {
        // Asumsi gaya floating label diimplementasikan dengan kelas .has-value
        input.addEventListener('input', () => {
            if (input.value.trim() !== '') {
                input.classList.add('has-value');
            } else {
                input.classList.remove('has-value');
            }
        });
        // Picu sekali saat halaman dimuat jika ada nilai awal
        if (input.value.trim() !== '') {
            input.classList.add('has-value');
        }
    });

    logoUploadInput.addEventListener('change', () => handleImageUpload(logoUploadInput, logoPreview, 'logo'));
    chairmanPhotoUploadInput.addEventListener('change', () => handleImageUpload(chairmanPhotoUploadInput, chairmanPhotoPreview, 'chairman_photo'));

    // Event listener untuk pilihan rayon (hanya untuk admin komisariat)
    rayonSelect.addEventListener('change', async (e) => {
        const selectedRayonId = e.target.value;
        if (selectedRayonId) {
            currentRayonId = selectedRayonId;
            const rayonData = await loadRayonData(currentRayonId);
            if (rayonData) {
                // Aktifkan semua field setelah rayon dipilih dan datanya dimuat
                profileForm.querySelectorAll('input, textarea, button').forEach(el => el.disabled = false);
                logoUploadInput.disabled = false;
                chairmanPhotoUploadInput.disabled = false;
                saveButton.disabled = false;
            } else {
                // Jika data tidak ditemukan, nonaktifkan field
                profileForm.querySelectorAll('input, textarea, button').forEach(el => el.disabled = true);
                logoUploadInput.disabled = true;
                chairmanPhotoUploadInput.disabled = true;
                saveButton.disabled = true;
            }
        } else {
            // Jika "Pilih Rayon..." dipilih, kosongkan dan nonaktifkan form
            currentRayonId = null;
            clearForm();
            profileForm.querySelectorAll('input, textarea, button').forEach(el => el.disabled = true);
            logoUploadInput.disabled = true;
            chairmanPhotoUploadInput.disabled = true;
            saveButton.disabled = true;
        }
    });


    // Form submission handler
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!currentRayonId) {
            window.showCustomMessage('Harap pilih rayon terlebih dahulu.', 'error');
            return;
        }

        // Basic validation
        const requiredFields = [
            rayonNameInput, rayonChairmanInput, rayonDescriptionTextarea,
            rayonContactInput, rayonEmailInput, rayonAddressTextarea,
            cadreCountInput, establishedDateInput, rayonVisionTextarea, rayonMissionTextarea
        ];
        let isValid = true;
        requiredFields.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('invalid');
                isValid = false;
            } else {
                input.classList.remove('invalid');
            }
        });

        // Validasi URL media sosial (opsional, tapi jika diisi harus valid)
        const urlInputs = [socialInstagramInput, socialFacebookInput, socialTwitterInput, socialYoutubeInput];
        urlInputs.forEach(input => {
            if (input.value.trim() !== '' && !input.checkValidity()) {
                input.classList.add('invalid');
                isValid = false;
            } else {
                input.classList.remove('invalid');
            }
        });

        if (!isValid) {
            window.showCustomMessage('Harap lengkapi semua bidang yang wajib diisi dan perbaiki kesalahan input!', 'error');
            return;
        }

        // Kumpulkan data
        const updatedRayonData = {
            name: rayonNameInput.value,
            chairman_name: rayonChairmanInput.value,
            description: rayonDescriptionTextarea.value,
            contact_phone: rayonContactInput.value,
            email: rayonEmailInput.value,
            address: rayonAddressTextarea.value,
            instagram_url: socialInstagramInput.value,
            facebook_url: socialFacebookInput.value,
            twitter_url: socialTwitterInput.value,
            youtube_url: socialYoutubeInput.value,
            cadre_count: parseInt(cadreCountInput.value) || 0,
            established_date: establishedDateInput.value,
            vision: rayonVisionTextarea.value,
            mission: rayonMissionTextarea.value,
            logo_url: logoPreview.src.startsWith('https://placehold.co') ? null : logoPreview.src, // Gunakan URL dari preview
            chairman_photo_url: chairmanPhotoPreview.src.startsWith('https://placehold.co') ? null : chairmanPhotoPreview.src // Gunakan URL dari preview
        };

        try {
            const response = await updateRayon(currentRayonId, updatedRayonData);
            if (response && response.success) {
                window.showCustomMessage('Profil rayon berhasil diperbarui!', 'success');
            } else {
                throw new Error(response.message || 'Gagal memperbarui profil rayon.');
            }
        } catch (error) {
            console.error('Error updating rayon profile:', error);
            window.showCustomMessage(error.message || 'Terjadi kesalahan saat menyimpan perubahan.', 'error');
        }
    });


    // --- Inisialisasi Halaman ---
    const pageCanContinue = await initializePageAccess(); // Tunggu hasil pengecekan akses

    if (pageCanContinue) {
        // Event listener untuk tombol kembali ke dashboard yang sesuai
        const backToDashboardLink = document.getElementById('back-to-dashboard-link');
        if (backToDashboardLink && loggedInUser) {
            if (loggedInUser.role === 'komisariat') {
                backToDashboardLink.href = 'admin-dashboard-komisariat.php';
            } else if (loggedInUser.role === 'rayon') {
                backToDashboardLink.href = 'admin-dashboard-rayon.php';
            } else {
                backToDashboardLink.href = '../index.php'; // Fallback
            }
        } else if (backToDashboardLink) {
            backToDashboardLink.href = '../index.php'; // Default jika tidak login
        }

        // Scroll to top button functionality
        const scrollToTopBtn = document.getElementById('scrollToTopBtn');
        window.addEventListener('scroll', () => {
            if (scrollToTopBtn) {
                if (window.pageYOffset > 200) {
                    scrollToTopBtn.classList.remove('hidden');
                    scrollToTopBtn.classList.add('flex');
                } else {
                    scrollToTopBtn.classList.add('hidden');
                    scrollToTopBtn.classList.remove('flex');
                }
            }
        });

        if (scrollToTopBtn) {
            scrollToTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
        
        // Update footer year
        const tahunFooterKader = document.getElementById('tahun-footer-kader');
        if (tahunFooterKader) {
            tahunFooterKader.textContent = new Date().getFullYear();
        }
    }
});