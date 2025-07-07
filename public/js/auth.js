// public/js/auth.js

// Modul ini mengelola status autentikasi pengguna di sisi frontend,
// termasuk penyimpanan token, data pengguna, dan pengalihan halaman.

import { loginUser } from './api.js'; // Impor fungsi loginUser dari api.js

const AUTH_TOKEN_KEY = 'authToken';
const LOGGED_IN_USER_KEY = 'loggedInUser';

/**
 * Menyimpan token autentikasi dan data pengguna ke localStorage.
 * @param {string} token Token JWT yang diterima dari backend.
 * @param {object} userData Objek data pengguna (id, name, role, dll.) dari backend.
 */
export function saveAuthData(token, userData) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(userData));
}

/**
 * Mengambil token autentikasi dan data pengguna dari localStorage.
 * @returns {{token: string|null, userData: object|null}} Objek berisi token dan data pengguna.
 */
export function getAuthData() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const userData = localStorage.getItem(LOGGED_IN_USER_KEY);
    return {
        token: token,
        userData: userData ? JSON.parse(userData) : null
    };
}

/**
 * Menghapus semua data autentikasi dari localStorage.
 */
export function clearAuthData() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(LOGGED_IN_USER_KEY);
    // Hapus juga flag lama jika masih ada dari versi simulasi
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('isKaderLoggedIn');
}

/**
 * Memeriksa apakah pengguna sedang login (memiliki token).
 * @returns {boolean} True jika token ada, false jika tidak.
 */
export function isLoggedIn() {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Mengambil peran pengguna yang sedang login.
 * @returns {string|null} Peran pengguna (kader, rayon, komisariat) atau null.
 */
export function getLoggedInUserRole() {
    const { userData } = getAuthData();
    return userData ? userData.user_role : null; // Gunakan user_role dari payload token/data user
}

/**
 * Mengambil ID pengguna yang sedang login.
 * @returns {string|null} ID pengguna atau null.
 */
export function getLoggedInUserId() {
    const { userData } = getAuthData();
    return userData ? userData.user_id : null; // Gunakan user_id dari payload token/data user
}

/**
 * Mengarahkan pengguna ke halaman dashboard yang sesuai berdasarkan perannya.
 * Atau ke halaman login jika tidak ada peran yang cocok.
 */
export function redirectToAppropriateDashboard() {
    const role = getLoggedInUserRole();
    if (role === 'komisariat') {
        window.location.href = '/dashboard/admin-dashboard-komisariat.html';
    } else if (role === 'rayon') {
        window.location.href = '/dashboard/admin-dashboard-rayon.html';
    } else if (role === 'kader') {
        window.location.href = '/index.php'; // Kader mungkin kembali ke beranda atau dashboard kader
    } else {
        window.location.href = '/login.html';
    }
}

/**
 * Menangani proses login dari form.
 * @param {string} email Email pengguna.
 * @param {string} password Password pengguna.
 * @returns {Promise<object>} Promise yang me-resolve dengan data respons login.
 * @throws {Error} Melemparkan error jika login gagal.
 */
export async function handleLogin(email, password) {
    try {
        const responseData = await loginUser(email, password); // Panggil fungsi API login
        saveAuthData(responseData.token, responseData.user); // Simpan token dan data user
        return responseData;
    } catch (error) {
        console.error('Login failed in auth.js:', error);
        clearAuthData(); // Pastikan data auth dihapus jika login gagal
        throw error; // Lemparkan error agar bisa ditangani di UI
    }
}

/**
 * Menangani proses logout.
 * Ini akan menghapus data autentikasi dan mengarahkan ke halaman login.
 */
export function handleLogout() {
    clearAuthData();
    // Redirect ke halaman login atau halaman utama
    window.location.href = '/login.html';
}

/**
 * Memeriksa status autentikasi saat halaman dimuat dan memperbarui UI navbar.
 * @param {object} elements Objek berisi elemen DOM yang perlu diperbarui.
 */
export function updateAuthUI(elements) {
    const { authLinkMain, authLinkMobile, desktopKaderMenuContainer, mobileKaderMenuGroup, desktopAdminMenuContainer, mobileAdminMenuGroup, mobileAdminMenuSeparator, headerTitleText, mobileHeaderTitleText, editActivitiesButtonContainer } = elements;

    const loggedIn = isLoggedIn();
    const role = getLoggedInUserRole();
    const userName = getAuthData().userData ? getAuthData().userData.user_name : ''; // Ambil nama dari data user

    const defaultTitle = 'PK PMII UIN Sunan Gunung Djati Cabang Kota Bandung';
    const loggedInTitle = 'SINTAKSIS (Sistem Informasi Terintegrasi Kaderisasi)';

    // Perbarui judul header
    if (headerTitleText) {
        headerTitleText.textContent = loggedIn ? loggedInTitle : defaultTitle;
    }
    if (mobileHeaderTitleText) {
        mobileHeaderTitleText.textContent = loggedIn ? loggedInTitle : defaultTitle;
    }

    // Perbarui tombol Login/Logout
    if (authLinkMain) {
        authLinkMain.textContent = loggedIn ? 'Logout' : 'Login';
        authLinkMain.dataset.action = loggedIn ? 'logout' : 'login';
        authLinkMain.classList.toggle('logout-active', loggedIn);
        authLinkMain.classList.toggle('logged-out-styles', !loggedIn);
        // Hapus listener lama dan tambahkan yang baru untuk mencegah duplikasi
        authLinkMain.removeEventListener('click', handleAuthLinkClick);
        authLinkMain.addEventListener('click', handleAuthLinkClick);
    }
    if (authLinkMobile) {
        authLinkMobile.textContent = loggedIn ? 'Logout' : 'Login';
        authLinkMobile.dataset.action = loggedIn ? 'logout' : 'login';
        authLinkMobile.classList.toggle('logout-active', loggedIn);
        authLinkMobile.classList.toggle('logged-out-styles', !loggedIn);
        authLinkMobile.removeEventListener('click', handleAuthLinkClick);
        authLinkMobile.addEventListener('click', handleAuthLinkClick);
    }

    // Sembunyikan semua menu admin/kader secara default
    if (desktopKaderMenuContainer) desktopKaderMenuContainer.classList.add('hidden');
    if (mobileKaderMenuGroup) mobileKaderMenuGroup.classList.add('hidden');
    if (desktopAdminMenuContainer) desktopAdminMenuContainer.classList.add('hidden');
    if (mobileAdminMenuGroup) mobileAdminMenuGroup.classList.add('hidden');
    if (mobileAdminMenuSeparator) mobileAdminMenuSeparator.classList.add('hidden');
    if (editActivitiesButtonContainer) editActivitiesButtonContainer.classList.add('hidden'); // Tombol edit kegiatan

    // Tampilkan menu berdasarkan peran jika login
    if (loggedIn) {
        // Tentukan tautan mana yang harus terlihat
        const adminMenuLinks = {
            manajemenAkun: { desktop: document.getElementById('manajemen-akun-link-desktop'), mobile: null },
            manajemenKader: { desktop: document.getElementById('manajemen-kader-link-desktop'), mobile: null },
            repositoryIlmiah: { desktop: document.getElementById('repository-ilmiah-link-desktop'), mobile: null },
            pengajuanSurat: { desktop: document.getElementById('pengajuan-surat-link-desktop'), mobile: null },
            verifikasiSurat: { desktop: document.getElementById('verifikasi-surat-link-desktop'), mobile: null },
            dashboardRayon: { desktop: document.getElementById('dashboard-rayon-link-desktop'), mobile: null },
            adminDashboard: { desktop: document.getElementById('admin-dashboard-link-desktop'), mobile: null },
            editBeranda: { desktop: document.getElementById('edit-beranda-link-desktop'), mobile: null },
            jurnalAlharokahAdmin: { desktop: document.getElementById('jurnal-alharokah-link-desktop-admin'), mobile: null },
            editProfilKader: { desktop: document.getElementById('edit-profil-kader-link-desktop'), mobile: null },
            pengaturanAkunKader: { desktop: document.getElementById('pengaturan-akun-kader-link-desktop'), mobile: null },
            jurnalAlharokahKader: { desktop: document.getElementById('jurnal-alharokah-link-desktop-kader'), mobile: null },
            pengajuanSuratKader: { desktop: document.getElementById('pengajuan-surat-link-desktop-kader'), mobile: null },
            verifikasiKontenRayon: { desktop: document.getElementById('verifikasi-konten-link-desktop'), mobile: null },
            tambahBeritaRayon: { desktop: document.getElementById('tambah-berita-link-desktop'), mobile: null },
            tambahKegiatanRayon: { desktop: document.getElementById('tambah-kegiatan-link-desktop'), mobile: null },
            tambahGaleriRayon: { desktop: document.getElementById('tambah-galeri-link-desktop'), mobile: null },
            editProfilRayon: { desktop: document.getElementById('edit-profil-rayon-link-desktop'), mobile: null },
            pengaturanSitus: { desktop: document.getElementById('pengaturan-situs-link-desktop'), mobile: null },
            dashboardStatistik: { desktop: document.getElementById('dashboard-statistik-link-desktop'), mobile: null },
            kelolaNotifikasi: { desktop: document.getElementById('kelola-notifikasi-link-desktop'), mobile: null },
            laporanAnalisis: { desktop: document.getElementById('laporan-analisis-link-desktop'), mobile: null },
            ttdDigital: { desktop: document.getElementById('ttd-digital-link-desktop'), mobile: null },
            arsiparisKepengurusan: { desktop: document.getElementById('arsiparis-kepengurusan-link-desktop'), mobile: null }
        };

        let visibleDesktopLinksKeys = [];
        if (role === "rayon") {
            if (desktopAdminMenuContainer) desktopAdminMenuContainer.classList.remove('hidden');
            visibleDesktopLinksKeys = [
                'manajemenKader', 'repositoryIlmiah',
                'pengajuanSurat', 'dashboardRayon',
                'jurnalAlharokahAdmin', 'tambahBeritaRayon',
                'tambahKegiatanRayon', 'tambahGaleriRayon',
                'verifikasiKontenRayon', 'editProfilRayon'
            ];
        } else if (role === "komisariat") {
            if (desktopAdminMenuContainer) desktopAdminMenuContainer.classList.remove('hidden');
            visibleDesktopLinksKeys = [
                'manajemenAkun', 'manajemenKader',
                'repositoryIlmiah', 'pengajuanSurat',
                'verifikasiSurat', 'adminDashboard',
                'editBeranda', 'jurnalAlharokahAdmin',
                'verifikasiKontenRayon', 'editProfilRayon',
                'pengaturanSitus', 'dashboardStatistik',
                'kelolaNotifikasi', 'laporanAnalisis',
                'ttdDigital', 'arsiparisKepengurusan'
            ];
            if (editActivitiesButtonContainer) editActivitiesButtonContainer.classList.remove('hidden'); // Hanya Komisariat yang bisa mengedit kegiatan
        } else if (role === "kader") {
            if (desktopKaderMenuContainer) desktopKaderMenuContainer.classList.remove('hidden');
            visibleDesktopLinksKeys = [
                'editProfilKader', 'pengaturanAkunKader',
                'jurnalAlharokahKader', 'pengajuanSuratKader'
            ];
        }

        // Tampilkan tautan spesifik
        for (const key of visibleDesktopLinksKeys) {
            const linkEl = adminMenuLinks[key].desktop;
            if (linkEl) {
                // Sesuaikan href untuk menunjuk ke direktori dashboard jika diperlukan
                let href = linkEl.getAttribute('href');
                if (href && !href.includes('index.php') && !href.includes('digilib.html') && !href.includes('akses-ojs.html') && !href.includes('generate-qr.html')) {
                    linkEl.href = `dashboard/${href}`;
                }
                linkEl.style.display = 'flex'; // Gunakan flex untuk item dropdown
            }
        }
    }
}

/**
 * Handle klik pada tombol Login/Logout di navbar.
 * @param {Event} e Event klik.
 */
function handleAuthLinkClick(e) {
    e.preventDefault();
    const action = e.target.dataset.action;

    if (action === 'login') {
        window.location.href = 'login.html';
    } else if (action === 'logout') {
        // Tampilkan modal konfirmasi kustom untuk logout
        // Asumsi showCustomConfirm tersedia secara global (dari index.php)
        if (typeof showCustomConfirm !== 'undefined') {
            showCustomConfirm('Konfirmasi Logout', 'Apakah Anda yakin ingin logout?', () => {
                // Jika pengguna mengonfirmasi (klik Ya)
                // Asumsi body.fade-out-page class ada di CSS
                document.body.classList.add('fade-out-page');
                setTimeout(() => {
                    handleLogout(); // Panggil fungsi logout
                    window.location.reload(); // Muat ulang halaman setelah logout
                }, 500); // Sesuaikan durasi fade-out CSS
            }, () => {
                // Jika pengguna membatalkan (klik Tidak)
                // Asumsi showCustomMessage tersedia secara global
                if (typeof showCustomMessage !== 'undefined') {
                    showCustomMessage('Logout dibatalkan.', 'info');
                }
            });
        } else {
            // Fallback jika showCustomConfirm tidak tersedia
            if (confirm('Apakah Anda yakin ingin logout?')) {
                document.body.classList.add('fade-out-page');
                setTimeout(() => {
                    handleLogout();
                    window.location.reload();
                }, 500);
            }
        }
    }
}
