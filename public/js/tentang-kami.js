// public/js/tentang-kami.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, getAuthData } from './auth.js';
import { getHomepageSections } from './api.js'; // Untuk mengambil data bagian 'about'

document.addEventListener('DOMContentLoaded', async function () {
    // --- Data Injeksi dari PHP ---
    const phpLoggedInUser = window.phpLoggedInUser;
    const phpAboutUsData = window.phpAboutUsData; // Data tentang kami dari PHP

    // --- Global State & Elements ---
    // Navbar & Auth Elements (diambil dari index.php, tapi perlu diinisialisasi di sini juga)
    const headerTitleText = document.getElementById('header-title-text');
    const mobileHeaderTitleText = document.getElementById('mobile-header-title-text');
    const authLinkMain = document.getElementById('auth-link-main');
    const authLinkMobile = document.getElementById('mobile-logout-link'); // ID dari HTML mobile menu
    const desktopKaderMenuContainer = document.getElementById('desktop-kader-menu-container');
    const desktopAdminMenuContainer = document.getElementById('desktop-admin-menu-container');
    
    // Kumpulkan elemen-elemen untuk updateAuthUI
    const authElements = {
        authLinkMain, authLinkMobile, desktopKaderMenuContainer,
        desktopAdminMenuContainer, headerTitleText, mobileHeaderTitleText
    };

    // Fungsi global untuk pesan kustom (digunakan oleh auth.js)
    window.showCustomMessage = window.showCustomMessage || function(message, type = 'info', callback = null) {
        const messageBox = document.getElementById('customMessageBox');
        if (!messageBox) return; // Ensure element exists
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

    // Fungsi global untuk modal konfirmasi kustom (digunakan oleh auth.js)
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
        confirmYesBtn.onclick = () => { if (currentConfirmCallback) currentConfirmCallback(); hideCustomConfirm(); };
        confirmCancelBtn.onclick = () => { if (onCancel) onCancel(); hideCustomConfirm(); };
        function hideCustomConfirm() { customConfirmModal.classList.remove('active'); currentConfirmCallback = null; }
        customConfirmModal.addEventListener('click', function(event) { if (event.target === customConfirmModal) hideCustomConfirm(); });
    };

    // Panggil updateAuthUI dari modul auth.js untuk menginisialisasi status login di UI
    updateAuthUI(authElements);

    // --- Logika Spesifik Halaman Tentang Kami ---
    const aboutUsContentP1 = document.getElementById('about-us-content-p1');
    const visiContent = document.getElementById('visi-content'); // ID baru untuk konten visi
    const misiContent = document.getElementById('misi-content'); // ID baru untuk konten misi (ul)

    /**
     * Memuat konten "Tentang Kami" dari API atau menggunakan data PHP injected sebagai fallback.
     */
    async function loadAboutUsContent() {
        let aboutContent = {};
        try {
            const response = await getHomepageSections(); // Ambil semua bagian homepage
            if (response && response.data) {
                const aboutSection = response.data.find(section => section.section_name === 'about');
                if (aboutSection && aboutSection.content_json) {
                    aboutContent = aboutSection.content_json;
                    console.log('Data Tentang Kami dari API:', aboutContent);
                } else {
                    aboutContent = phpAboutUsData; // Fallback
                    window.showCustomMessage('Gagal memuat konten "Tentang Kami" dari API. Menampilkan data default.', 'error');
                }
            } else {
                aboutContent = phpAboutUsData; // Fallback
                window.showCustomMessage('Gagal memuat konten "Tentang Kami" dari API. Menampilkan data default.', 'error');
            }
        } catch (error) {
            console.error('Error fetching About Us content:', error);
            aboutContent = phpAboutUsData; // Fallback
            window.showCustomMessage('Terjadi kesalahan saat memuat konten "Tentang Kami". Menampilkan data default.', 'error');
        } finally {
            renderAboutUsContent(aboutContent); // Selalu render setelah mencoba memuat data
        }
    }

    /**
     * Merender konten "Tentang Kami" ke DOM.
     * @param {Object} content - Objek yang berisi data paragraf, visi, dan misi.
     */
    function renderAboutUsContent(content) {
        if (aboutUsContentP1) {
            aboutUsContentP1.textContent = content.p1 || phpAboutUsData.p1;
        }
        // Visi dan Misi biasanya statis atau bagian dari data "about" yang lebih besar.
        // Jika visi dan misi juga dinamis, mereka harus ada di content.
        // Untuk saat ini, kita akan mengisi dari data statis di HTML jika tidak ada dari API.
        if (visiContent && !content.visi) { // Jika API tidak memberikan visi, gunakan yang statis
            visiContent.innerHTML = `
                Sesuai dengan Anggaran Dasar Anggaran Rumah Tangga Bab IV Pasal 4 <br><br>
                Terbentuknya pribadi muslim Indonesia yang bertakwa kepada Allah SWT, berbudi luhur, berilmu, cakap dan
                bertanggung jawab dalam mengamalkan ilmunya serta komitmen memperjuangkan cita-cita kemerdekaan
                Indonesia.
            `;
        } else if (visiContent && content.visi) {
            visiContent.innerHTML = content.visi;
        }

        if (misiContent && !content.misi) { // Jika API tidak memberikan misi, gunakan yang statis
            misiContent.innerHTML = `
                <li>Sesuai dengan Anggaran Dasar Anggaran Rumah Tangga Bab IV Pasal 5</li>
                <li>Menghimpun dan membina mahasiswa Islam Indonesia sesuai dengan sifat dan tujuan PMII serta
                peraturan perundang-undangan dan NDP PMII yang berlaku;</li>
                <li>Melaksanakan kegiatan-kegiatan dalam berbagai bidang sesuai dengan asas, tujuan, dan paradigma PMII
                serta mewujudkan pribadi insan ulul albab.</li>
            `;
        } else if (misiContent && content.misi) {
            // Jika misi dari API adalah array, format sebagai list
            if (Array.isArray(content.misi)) {
                misiContent.innerHTML = content.misi.map(item => `<li>${item}</li>`).join('');
            } else {
                misiContent.innerHTML = content.misi; // Jika string biasa
            }
        }
    }

    // --- General UI (from index.php) ---
    const navbar = document.getElementById('navbar');
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    window.addEventListener('scroll', () => {
        if(navbar) navbar.classList.toggle('navbar-scrolled', window.scrollY > 50);
        if (scrollToTopBtn) {
            scrollToTopBtn.classList.toggle('hidden', window.pageYOffset <= 300);
            scrollToTopBtn.classList.toggle('flex', window.pageYOffset > 300);
        }
    });
    if (scrollToTopBtn) scrollToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    
    // Set current year in footer
    const tahunFooter = document.getElementById('tahun-footer'); // Assuming 'tahun-footer' is the ID for this page's footer year
    if (tahunFooter) {
        tahunFooter.textContent = new Date().getFullYear();
    }

    // Intersection Observer for section animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.animated-section').forEach(section => observer.observe(section));

    // --- Initializations ---
    loadAboutUsContent(); // Muat data "Tentang Kami" dari API
});
