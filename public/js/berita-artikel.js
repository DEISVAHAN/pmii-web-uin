// public/js/berita-artikel.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, getAuthData } from './auth.js';
import { getApprovedNews } from './api.js';

document.addEventListener('DOMContentLoaded', async function () {
    // --- Data Injeksi dari PHP ---
    const phpLoggedInUser = window.phpLoggedInUser;
    const phpNewsArticlesData = window.phpNewsArticlesData; // Data berita dari PHP

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

    // --- Logika Spesifik Halaman Berita & Artikel ---
    const newsListFull = document.getElementById('news-list-full');
    const noNewsMessage = document.getElementById('no-news-message');

    /**
     * Memuat data berita/artikel dari API atau menggunakan data PHP injected sebagai fallback.
     */
    async function loadNewsArticlesData() {
        let news = [];
        try {
            const response = await getApprovedNews(); // Panggil API untuk mendapatkan berita/artikel yang disetujui
            if (response && response.data) {
                news = response.data;
                console.log('Data Berita & Artikel dari API:', news);
            } else {
                // Fallback ke data PHP injected jika API gagal atau kosong
                news = phpNewsArticlesData;
                console.log('Data Berita & Artikel dari PHP (fallback):', news);
                window.showCustomMessage('Gagal memuat berita dan artikel dari server. Menampilkan data default.', 'error');
            }
        } catch (error) {
            console.error('Error fetching news articles:', error);
            news = phpNewsArticlesData;
            console.log('Data Berita & Artikel dari PHP (fallback karena error API):', news);
            window.showCustomMessage('Terjadi kesalahan saat memuat berita dan artikel. Menampilkan data default.', 'error');
        } finally {
            renderNewsArticles(news); // Selalu render setelah mencoba memuat data
        }
    }

    /**
     * Merender daftar berita/artikel secara dinamis ke DOM.
     * @param {Array<Object>} news - Array objek berita/artikel.
     */
    function renderNewsArticles(news) {
        if (!newsListFull) return;

        newsListFull.innerHTML = ''; // Kosongkan konten yang ada
        if (news.length === 0) {
            noNewsMessage.classList.remove('hidden');
        } else {
            noNewsMessage.classList.add('hidden');
            // Urutkan berdasarkan tanggal publikasi (terbaru dulu)
            news.sort((a, b) => new Date(b.publication_date) - new Date(a.publication_date));

            news.forEach(item => {
                const newsItem = `
                    <div class="news-item">
                        <img src="${item.image_url}" onerror="this.onerror=null;this.src='https://placehold.co/600x400/CCCCCC/333333?text=Image+Not+Found';" alt="${item.title}">
                        <div class="news-item-content">
                            <span class="category">${item.category || 'Umum'}</span>
                            <h3 class="title">${item.title}</h3>
                            <p class="description">${item.description}</p>
                            <a href="#" class="read-more">Baca Selengkapnya <i class="fas fa-arrow-right ml-2"></i></a>
                        </div>
                    </div>
                `;
                newsListFull.innerHTML += newsItem;
            });
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
    loadNewsArticlesData(); // Muat data berita/artikel dari API
});
