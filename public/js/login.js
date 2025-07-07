// public/js/login.js

// Impor fungsi autentikasi dari modul auth.js
// Diasumsikan auth.js berada di direktori yang sama (./auth.js)
import { handleLogin, setAuthData } from './auth.js';
// Impor fungsi API dari modul api.js
import { loginUser } from './api.js';

document.addEventListener('DOMContentLoaded', function () {
    // --- Data Injeksi dari PHP ---
    const phpLoggedInUser = window.phpLoggedInUser;
    const BASE_PATH = window.BASE_PATH; // Base path dari PHP

    // --- Elemen DOM ---
    const adminTabButton = document.getElementById('admin-tab-button');
    const kaderTabButton = document.getElementById('kader-tab-button');
    const adminLoginSection = document.getElementById('admin-login-section');
    const kaderLoginSection = document.getElementById('kader-login-section');

    const adminLoginForm = document.getElementById('admin-login-form');
    const adminUsernameInput = document.getElementById('admin-username');
    const adminPasswordInput = document.getElementById('admin-password');
    const adminLoginSubmitButton = document.getElementById('admin-login-submit-button');
    const adminLoginErrorMsg = document.getElementById('admin-login-error-msg');

    const kaderLoginForm = document.getElementById('kader-login-form');
    const kaderNimInput = document.getElementById('kader-nim');
    const kaderPasswordInput = document.getElementById('kader-password');
    const kaderLoginSubmitButton = document.getElementById('kader-login-submit-button');
    const kaderLoginErrorMsg = document.getElementById('kader-login-error-msg');

    const customMessageBox = document.getElementById('customMessageBox');


    // --- Fungsi Kotak Pesan Kustom (Jika belum ada di auth.js atau file global lainnya) ---
    // Definisikan secara defensif untuk memastikan tersedia
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


    // --- Fungsi Utama ---

    // Fungsi untuk menampilkan pesan error form
    function showFormError(element, message) {
        element.querySelector('span').textContent = message;
        element.classList.add('show');
    }

    // Fungsi untuk menyembunyikan pesan error form
    function hideFormError(element) {
        element.classList.remove('show');
    }

    // Fungsi untuk mengaktifkan/menonaktifkan spinner
    function toggleLoading(button, isLoading) {
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    // Fungsi untuk mengganti tab login
    function switchTab(tabType) {
        if (tabType === 'admin') {
            adminTabButton.classList.add('active');
            kaderTabButton.classList.remove('active');
            adminLoginSection.classList.remove('hidden-form');
            kaderLoginSection.classList.add('hidden-form');
            hideFormError(kaderLoginErrorMsg);
        } else {
            adminTabButton.classList.remove('active');
            kaderTabButton.classList.add('active');
            adminLoginSection.classList.add('hidden-form');
            kaderLoginSection.classList.remove('hidden-form');
            hideFormError(adminLoginErrorMsg);
        }
    }

    // Fungsi untuk memuat data awal (misal: cek jika sudah login)
    function initializeLogin() {
        if (phpLoggedInUser && phpLoggedInUser.user_id) { // Jika ada data pengguna dari PHP
            // Redirect ke dashboard atau halaman utama jika sudah login
            const role = phpLoggedInUser.role;
            let redirectUrl = BASE_PATH; // Default ke halaman utama

            if (role === 'komisariat') {
                redirectUrl = BASE_PATH + 'dashboard/admin-dashboard-komisariat.php';
            } else if (role === 'rayon') {
                redirectUrl = BASE_PATH + 'dashboard/admin-dashboard-rayon.php';
            } else if (role === 'kader') {
                redirectUrl = BASE_PATH + 'dashboard/edit-profil-kader.php';
            }
            
            window.showCustomMessage(`Anda sudah login sebagai ${role}. Mengarahkan...`, 'info', () => {
                window.location.assign(redirectUrl);
            });
        } else {
            // Default ke tab admin saat halaman dimuat
            switchTab('admin');
        }
    }

    // --- Event Listeners ---
    adminTabButton.addEventListener('click', () => switchTab('admin'));
    kaderTabButton.addEventListener('click', () => switchTab('kader'));

    // Admin Login Form Submission
    adminLoginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        hideFormError(adminLoginErrorMsg);
        toggleLoading(adminLoginSubmitButton, true);

        const username = adminUsernameInput.value.trim();
        const password = adminPasswordInput.value.trim();

        if (!username || !password) {
            showFormError(adminLoginErrorMsg, 'Username dan password tidak boleh kosong.');
            toggleLoading(adminLoginSubmitButton, false);
            return;
        }

        try {
            // Panggil fungsi loginUser dari api.js
            const response = await loginUser(username, password); // Asumsi loginUser mengambil username/email & password

            if (response && response.success) {
                // Asumsi response.data berisi token dan user_data
                const token = response.data.token;
                const userData = response.data.user_data;

                // Simpan token dan data user menggunakan auth.js
                setAuthData(token, userData);

                window.showCustomMessage('Login Admin berhasil!', 'success', () => {
                    let redirectUrl = BASE_PATH; // Default
                    if (userData.role === 'komisariat') {
                        redirectUrl = BASE_PATH + 'dashboard/admin-dashboard-komisariat.php';
                    } else if (userData.role === 'rayon') {
                        redirectUrl = BASE_PATH + 'dashboard/admin-dashboard-rayon.php';
                    }
                    window.location.assign(redirectUrl);
                });
            } else {
                showFormError(adminLoginErrorMsg, response.message || 'Username atau password admin tidak valid.');
            }
        } catch (error) {
            console.error('Error Admin Login:', error);
            showFormError(adminLoginErrorMsg, error.message || 'Terjadi kesalahan saat login admin. Silakan coba lagi.');
        } finally {
            toggleLoading(adminLoginSubmitButton, false);
        }
    });

    // Kader Login Form Submission
    kaderLoginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        hideFormError(kaderLoginErrorMsg);
        toggleLoading(kaderLoginSubmitButton, true);

        const nim = kaderNimInput.value.trim();
        const password = kaderPasswordInput.value.trim();

        if (!nim || !password) {
            showFormError(kaderLoginErrorMsg, 'NIM dan password tidak boleh kosong.');
            toggleLoading(kaderLoginSubmitButton, false);
            return;
        }

        try {
            // Panggil fungsi loginUser dari api.js (asumsi bisa menangani login kader juga)
            // Atau Anda mungkin punya fungsi terpisah seperti loginKader(nim, password)
            const response = await loginUser(nim, password); // Asumsi NIM digunakan sebagai 'email' atau 'username' di backend

            if (response && response.success) {
                const token = response.data.token;
                const userData = response.data.user_data;

                // Validasi peran untuk memastikan ini adalah kader
                if (userData.role === 'kader') {
                    setAuthData(token, userData); // Simpan token dan data user

                    window.showCustomMessage('Login Kader berhasil!', 'success', () => {
                        window.location.assign(BASE_PATH + 'dashboard/edit-profil-kader.php'); // Redirect ke halaman profil kader
                    });
                } else {
                    // Jika login sukses tapi peran bukan kader, ini bisa jadi celah.
                    // Hapus data autentikasi yang salah dan tampilkan error.
                    handleLogin(null); // Clear auth data
                    showFormError(kaderLoginErrorMsg, 'Akses tidak diizinkan untuk peran ini melalui login kader.');
                }
            } else {
                showFormError(kaderLoginErrorMsg, response.message || 'NIM atau password tidak valid.');
            }
        } catch (error) {
            console.error('Error Kader Login:', error);
            showFormError(kaderLoginErrorMsg, error.message || 'Terjadi kesalahan saat login kader. Silakan coba lagi.');
        } finally {
            toggleLoading(kaderLoginSubmitButton, false);
        }
    });

    // --- Inisialisasi Floating Labels (from edit-profil-kader.js) ---
    const allInputs = document.querySelectorAll('.input-field');
    allInputs.forEach(input => {
        const label = input.nextElementSibling; // Asumsi label adalah sibling setelah input

        // Fungsi untuk mengupdate kelas floating label
        const updateLabel = () => {
            if (label && label.classList.contains('input-label')) {
                if (input.value.trim() !== '') {
                    input.classList.add('has-value');
                } else {
                    input.classList.remove('has-value');
                }
            }
        };

        // Picu sekali saat halaman dimuat jika ada nilai awal (misal dari browser autofill)
        updateLabel();

        // Event listeners untuk update dinamis
        input.addEventListener('input', updateLabel);
        input.addEventListener('change', updateLabel);
        input.addEventListener('blur', updateLabel);
        input.addEventListener('focus', () => {
            if (label && label.classList.contains('input-label')) label.classList.add('active-label-style');
        });
        input.addEventListener('blur', () => {
            updateLabel();
            if (label && label.classList.contains('input-label')) label.classList.remove('active-label-style');
        });
    });


    // --- Jalankan Inisialisasi ---
    initializeLogin();
});