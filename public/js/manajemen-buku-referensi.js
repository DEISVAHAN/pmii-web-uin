// public/js/manajemen-buku-referensi.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, handleAuthClick, getAuthData } from './auth.js';
import { getDigilibItems, getDigilibItemById, uploadFile, uploadDigilibItem, updateDigilibItem, deleteDigilibItem } from './api.js';

document.addEventListener('DOMContentLoaded', async function () { // Tambahkan async
    // --- Data Injeksi dari PHP ---
    const phpLoggedInUser = window.phpLoggedInUser;

    // --- Global State & Elements ---
    const LOCAL_STORAGE_USER_KEY = 'loggedInUser';
    let loggedInUser = null;
    let bukuData = []; // Akan menampung semua data buku dari API

    // Navbar & Auth Elements
    const adminNameHeader = document.getElementById('admin-name-header');
    const authInfoHeader = document.getElementById('auth-info-header');
    const headerTitleText = document.getElementById('header-title-text');
    const mobileHeaderTitleText = document.getElementById('mobile-header-title-text');
    const authLinkMain = document.getElementById('auth-link-main');
    const authLinkMobile = document.getElementById('mobile-logout-link');

    const authElements = {
        authLinkMain, mobileAuthLink: authLinkMobile,
        desktopKaderMenuContainer: document.getElementById('desktop-kader-menu-container'),
        desktopAdminMenuContainer: document.getElementById('desktop-admin-menu-container'),
        headerTitleText, mobileHeaderTitleText
    };

    // Panggil updateAuthUI dari modul auth.js untuk menginisialisasi status login di UI
    updateAuthUI(authElements);

    const authData = getAuthData();
    loggedInUser = authData.userData || phpLoggedInUser;

    // Elemen DOM spesifik untuk halaman manajemen buku
    const bukuForm = document.getElementById('bukuForm');
    const bukuList = document.getElementById('buku-list');
    const formResponse = document.getElementById('form-response'); // Untuk pesan form
    const bukuIdInput = document.getElementById('bukuId'); // Hidden ID for editing
    const bukuJudulInput = document.getElementById('bukuJudul');
    const bukuPenulisInput = document.getElementById('bukuPenulis');
    const bukuTahunInput = document.getElementById('bukuTahun');
    const bukuPenerbitInput = document.getElementById('bukuPenerbit');
    const bukuISBNInput = document.getElementById('bukuISBN');
    const bukuRingkasanTextarea = document.getElementById('bukuRingkasan');
    const bukuFileInput = document.getElementById('bukuFile');
    const fileNamePreview = document.getElementById('fileNamePreview');
    const bukuLinkEksternalInput = document.getElementById('bukuLinkEksternal');

    let stagedFile = null; // Untuk menyimpan file yang diunggah sementara


    // --- Custom Message Box & Confirm Modal (Global Helper Functions) ---
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

    // --- AUTHENTICATION & UI SETUP ---
    async function updateManajemenBukuUI() {
        const allowedRolesForThisPage = ['komisariat']; // Hanya admin komisariat yang bisa akses
        const defaultAllowedPages = [
            'index.php', 'login.php', 'digilib.php', 'tentang-kami.php',
            'berita-artikel.php', 'agenda-kegiatan.php', 'galeri-foto.php',
            'all-rayons.php', 'rayon-profile.php', 'akses-ojs.php',
            'lupa-password.php', 'register-kader.php', 'status-ttd.php',
            'generate-qr.php'
        ];

        const currentPage = window.location.pathname.split('/').pop();
        let hasAccess = false;
        let userRole = loggedInUser ? loggedInUser.role : 'public';

        if (userRole && allowedRolesForThisPage.includes(userRole)) {
            hasAccess = true;
        }

        if (!defaultAllowedPages.includes(currentPage) && !hasAccess) {
            window.showCustomMessage("Anda tidak memiliki hak akses ke halaman ini. Silakan login sebagai Admin Komisariat.", 'error', () => {
                window.location.assign('../login.php');
            });
            document.body.innerHTML = `
                <div class="main-content-wrapper flex flex-col items-center justify-center min-h-screen text-center bg-gray-900 text-white p-8">
                    <i class="fas fa-exclamation-triangle text-6xl text-pmii-yellow mb-4 animate-bounce"></i>
                    <h1 class="text-3xl lg:text-4xl font-bold mb-4">Akses Ditolak</h1>
                    <p class="text-lg mb-6">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
                    <a href="../login.php" class="btn bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600">
                        <i class="fas fa-sign-in-alt mr-2"></i> Kembali ke Login
                    </a>
                </div>
            `;
            return false;
        }

        if (hasAccess) {
            if (adminNameHeader) {
                adminNameHeader.textContent = `Halo, ${loggedInUser.nama || 'Admin Komisariat'}`;
                adminNameHeader.classList.remove('hidden');
            }
            if (authInfoHeader) {
                authInfoHeader.textContent = 'Logout';
                authInfoHeader.href = '#';
                authInfoHeader.classList.add('logout-active');
                authInfoHeader.addEventListener('click', handleAuthClick);
            }
        } else {
            if (adminNameHeader) adminNameHeader.classList.add('hidden');
            if (authInfoHeader) {
                authInfoHeader.textContent = 'Login';
                authInfoHeader.href = '../login.php';
                authInfoHeader.classList.remove('logout-active');
                authInfoHeader.removeEventListener('click', handleAuthClick);
            }
        }
        return true;
    }

    // --- DATA HANDLING (API-BASED) ---
    async function loadBukuData() {
        if (!bukuList) return;
        bukuList.innerHTML = '<p class="text-text-muted text-center py-4">Memuat buku...</p>';
        try {
            // Asumsi getDigilibItems bisa difilter berdasarkan category_name
            const response = await getDigilibItems({ category_name: 'Buku Referensi' });
            if (response && response.data) {
                bukuData = response.data.map(item => ({
                    id: item.item_id,
                    judul: item.title,
                    penulis: item.author,
                    tahun: item.publication_year,
                    penerbit: item.publisher,
                    isbn: item.isbn,
                    ringkasan: item.description,
                    fileName: item.file_name,
                    fileUrl: item.file_path, // Asumsi file_path adalah URL
                    linkEksternal: item.external_link // Asumsi ada field external_link
                }));
                renderBukuList();
            } else {
                bukuData = [];
                renderBukuList();
                window.showCustomMessage('Gagal memuat daftar buku dari server.', 'error');
            }
        } catch (error) {
            console.error("Error loading book data:", error);
            bukuData = [];
            renderBukuList();
            window.showCustomMessage(error.message || "Terjadi kesalahan saat memuat buku.", "error");
        }
    }

    // --- UI RENDERING ---
    function renderBukuList() {
        if (!bukuList) return;
        bukuList.innerHTML = '';
        if (bukuData.length === 0) {
            bukuList.innerHTML = '<p class="text-text-muted text-center py-4">Belum ada buku yang ditambahkan.</p>';
            return;
        }
        bukuData.forEach(buku => {
            const itemElement = document.createElement('div');
            itemElement.className = 'item-list-entry';
            itemElement.innerHTML = `
                <div class="item-info">
                    <div class="item-title">${buku.judul}</div>
                    <div class="item-meta">Oleh: ${buku.penulis} (${buku.tahun}) - Penerbit: ${buku.penerbit} ${buku.isbn ? `(ISBN: ${buku.isbn})` : ''}</div>
                    <div class="item-meta">
                        ${buku.fileName ? `File: <a href="${buku.fileUrl}" target="_blank" class="text-pmii-blue hover:underline">${buku.fileName}</a>` : 'Tidak ada file'}
                        ${buku.linkEksternal ? ` | Link Eksternal: <a href="${buku.linkEksternal}" target="_blank" class="text-pmii-blue hover:underline">Lihat</a>` : ''}
                    </div>
                </div>
                <div class="item-actions">
                    <button data-id="${buku.id}" class="btn-modern btn-outline-modern btn-sm edit-btn">Edit</button>
                    <button data-id="${buku.id}" class="btn-modern btn-danger-modern btn-sm delete-btn">Hapus</button>
                </div>
            `;
            bukuList.appendChild(itemElement);
        });

        bukuList.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => editBuku(e.currentTarget.dataset.id));
        });
        bukuList.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => deleteBuku(e.currentTarget.dataset.id));
        });
    }

    // --- FORM HANDLING ---
    // Function to update floating label class (copied for consistency)
    const allInputs = document.querySelectorAll('.form-input-modern');
    allInputs.forEach(input => {
        const label = input.nextElementSibling;
        const updateLabel = () => {
            if (label && label.classList.contains('form-label-modern')) {
                if (input.type === 'file') { // Special handling for file inputs
                    if (input.files.length > 0) {
                        input.classList.add('has-value');
                    } else {
                        input.classList.remove('has-value');
                    }
                } else if (input.value.trim() !== '' || (input.tagName === 'SELECT' && input.value !== '')) {
                    input.classList.add('has-value');
                } else {
                    input.classList.remove('has-value');
                }
            }
        };
        updateLabel();
        input.addEventListener('input', updateLabel);
        input.addEventListener('change', updateLabel);
        input.addEventListener('blur', updateLabel);
        input.addEventListener('focus', () => {
            if (label && label.classList.contains('form-label-modern')) label.classList.add('active-label-style');
        });
        input.addEventListener('blur', () => {
            updateLabel();
            if (label && label.classList.contains('form-label-modern')) label.classList.remove('active-label-style');
        });
    });

    // Handle file input label and preview
    bukuFileInput.addEventListener('change', function() {
        fileNamePreview.textContent = this.files[0] ? this.files[0].name : 'Tidak ada file dipilih.';
        updateLabelClass(this);
    });

    // Form submission handler
    bukuForm.addEventListener('submit', async function (e) { // Tambahkan async
        e.preventDefault();

        const id = bukuIdInput.value || null; // Will be empty for new entry
        const judul = bukuJudulInput.value.trim();
        const penulis = bukuPenulisInput.value.trim();
        const tahun = parseInt(bukuTahunInput.value);
        const penerbit = bukuPenerbitInput.value.trim();
        const isbn = bukuISBNInput.value.trim();
        const ringkasan = bukuRingkasanTextarea.value.trim();
        const linkEksternal = bukuLinkEksternalInput.value.trim();
        const file = bukuFileInput.files[0];

        // Validasi dasar
        if (!judul || !penulis || !tahun || !penerbit) {
            window.showCustomMessage('Judul, Penulis, Tahun Terbit, dan Penerbit wajib diisi.', 'error');
            return;
        }

        let fileUrl = null;
        let fileName = null;

        if (file) {
            try {
                // Asumsi uploadFile mengembalikan { file_url, file_name }
                const uploadResponse = await uploadFile(bukuFileInput, { type: 'document', category_name: 'Buku Referensi' });
                if (uploadResponse && uploadResponse.file_url) {
                    fileUrl = uploadResponse.file_url;
                    fileName = uploadResponse.file_name;
                    window.showCustomMessage(`File "${fileName}" berhasil diunggah.`, 'success');
                } else {
                    throw new Error(uploadResponse.message || "Gagal mengunggah file.");
                }
            } catch (error) {
                console.error("Error uploading file:", error);
                window.showCustomMessage(`Gagal mengunggah file: ${error.message}`, 'error');
                return; // Hentikan proses jika unggah gagal
            }
        } else if (id) {
            // If editing and no new file uploaded, retain existing file info
            const existingBuku = bukuData.find(item => item.id === id);
            if (existingBuku) {
                fileUrl = existingBuku.fileUrl;
                fileName = existingBuku.fileName;
            }
        }

        if (!fileUrl && !linkEksternal) { // Require either file or external link
            window.showCustomMessage('Mohon unggah file buku atau berikan link eksternal.', 'error');
            return;
        }

        const itemData = {
            title: judul,
            author: penulis,
            publication_year: tahun,
            publisher: penerbit,
            isbn: isbn,
            description: ringkasan,
            file_path: fileUrl, // Map to API's 'file_path'
            file_name: fileName,
            external_link: linkEksternal,
            category_name: 'Buku Referensi' // Kategori untuk API DigilibItem
        };

        try {
            let response;
            if (id) {
                response = await updateDigilibItem(id, itemData); // Panggil API update
            } else {
                response = await uploadDigilibItem(itemData); // Panggil API upload (create)
            }

            if (response && response.success) {
                window.showCustomMessage(`Buku berhasil ${id ? 'diperbarui' : 'ditambahkan'}!`, 'success');
                bukuForm.reset(); // Reset form
                bukuIdInput.value = ''; // Clear hidden ID
                fileNamePreview.textContent = 'Tidak ada file dipilih.'; // Reset file preview
                bukuFileInput.value = ''; // Clear file input
                await loadBukuData(); // Muat ulang data setelah perubahan
            } else {
                throw new Error(response.message || `Gagal ${id ? 'memperbarui' : 'menambahkan'} buku.`);
            }
        } catch (error) {
            console.error(`Error saving buku:`, error);
            window.showCustomMessage(error.message || `Terjadi kesalahan saat menyimpan buku.`, 'error');
        }
    });

    // Edit function
    function editBuku(id) {
        const bukuToEdit = bukuData.find(item => item.id === id);
        if (!bukuToEdit) {
            window.showCustomMessage('Buku tidak ditemukan.', 'error');
            return;
        }

        bukuIdInput.value = bukuToEdit.id;
        bukuJudulInput.value = bukuToEdit.judul;
        bukuPenulisInput.value = bukuToEdit.penulis;
        bukuTahunInput.value = bukuToEdit.tahun;
        bukuPenerbitInput.value = bukuToEdit.penerbit;
        bukuISBNInput.value = bukuToEdit.isbn || '';
        bukuRingkasanTextarea.value = bukuToEdit.ringkasan || '';
        bukuLinkEksternalInput.value = bukuToEdit.linkEksternal || '';

        fileNamePreview.textContent = bukuToEdit.fileName || 'Tidak ada file dipilih.';
        bukuFileInput.value = ''; // Clear file input so user can choose new file

        // Update floating labels after populating form
        allInputs.forEach(input => updateLabelClass(input));
        
        // Scroll to top of the form
        bukuForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Delete function
    async function deleteBuku(id) {
        window.showCustomConfirm('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus buku ini? Tindakan ini tidak dapat dibatalkan.', async () => {
            try {
                const response = await deleteDigilibItem(id); // Panggil API delete
                if (response && response.success) {
                    window.showCustomMessage('Buku berhasil dihapus!', 'success');
                    await loadBukuData(); // Muat ulang data setelah penghapusan
                } else {
                    throw new Error(response.message || 'Gagal menghapus buku.');
                }
            } catch (error) {
                console.error("Error deleting buku:", error);
                window.showCustomMessage(error.message || 'Terjadi kesalahan saat menghapus buku.', 'error');
            }
        });
    }

    // Reset Form button handler
    document.querySelector('button[type="reset"]').addEventListener('click', function() {
        bukuForm.reset();
        bukuIdInput.value = ''; // Clear hidden ID
        fileNamePreview.textContent = 'Tidak ada file dipilih.'; // Reset file preview
        bukuFileInput.value = ''; // Clear file input
        allInputs.forEach(input => updateLabelClass(input)); // Update labels
    });


    // --- INITIALIZATION ---
    const pageCanContinue = await updateManajemenBukuUI(); // Tunggu hasil pengecekan akses

    if (pageCanContinue) {
        await loadBukuData(); // Muat data buku dari API saat halaman dimuat

        // Setel tahun di footer
        document.getElementById('tahun-footer').textContent = new Date().getFullYear();

        // Scroll to top button functionality
        const scrollToTopBtn = document.getElementById('scrollToTopBtn');
        if (scrollToTopBtn) {
            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 200) {
                    scrollToTopBtn.classList.remove('hidden');
                    scrollToTopBtn.classList.add('flex');
                } else {
                    scrollToTopBtn.classList.add('hidden');
                    scrollToTopBtn.classList.remove('flex');
                }
            });
            scrollToTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }
});