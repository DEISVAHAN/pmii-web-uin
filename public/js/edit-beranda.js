// public/js/edit-beranda.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { updateAuthUI, handleAuthClick, getAuthData } from './auth.js';
import { getHomepageSections, updateHomepageSection, getApprovedNews, getApprovedActivities, getApprovedGalleryItems, uploadFile } from './api.js';

document.addEventListener('DOMContentLoaded', async function () { // Tambahkan async
    // --- Data Injeksi dari PHP (diakses melalui window global) ---
    const phpLoggedInUser = window.phpLoggedInUser;

    // --- Global State & Elements ---
    const LOCAL_STORAGE_USER_KEY = 'loggedInUser';
    let loggedInUser = null;

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

    // Pastikan penanganan klik autentikasi untuk tombol login/logout di navbar berfungsi
    if (authLinkMain) {
        authLinkMain.removeEventListener('click', handleAuthClick);
        authLinkMain.addEventListener('click', handleAuthClick);
    }
    if (authLinkMobile) {
        authLinkMobile.removeEventListener('click', handleAuthClick);
        authLinkMobile.addEventListener('click', handleAuthClick);
    }

    // --- Pemeriksaan Otentikasi dan Kontrol Akses Halaman ---
    async function initializePageAccess() {
        const allowedRolesForThisPage = ['komisariat']; // Hanya admin komisariat yang bisa mengakses halaman ini
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
            window.showCustomMessage("Anda tidak memiliki hak akses ke halaman ini. Silakan login sebagai Admin Komisariat.", 'error', () => {
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

        // Jika pengguna memiliki akses, update UI header
        if (hasAccess) {
            // Update header titles (SINTAKSIS logic)
            const loggedInTitle = 'SINTAKSIS (Sistem Informasi Terintegrasi Kaderisasi)';
            if (headerTitleText) {
                headerTitleText.textContent = loggedInTitle;
            }
            if (mobileHeaderTitleText) {
                mobileHeaderTitleText.textContent = loggedInTitle;
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


    // --- Elemen Konten Utama edit-beranda.php ---
    const form = document.getElementById('edit-homepage-form');
    const responseMessage = document.getElementById('form-response-message');
    const cancelButton = document.getElementById('cancel-button');
    
    const pageSpecificModal = document.getElementById('custom-modal');
    const pageSpecificModalMessage = document.getElementById('modal-message');
    const pageSpecificModalConfirmBtn = document.getElementById('modal-confirm-btn');
    const pageSpecificModalCancelBtn = document.getElementById('modal-cancel-btn');
    let pageSpecificModalCallback = null;

    let homepageContent = { // Akan diisi dari API
        heroMainTitle: '',
        announcementText: '',
        aboutP1: '',
        news: [],
        activities: [],
        gallery: []
    };

    // Bidang formulir statis yang tidak berulang
    const staticFields = ['heroTitle', 'heroSubtitle', 'heroMotto', 'announcementText', 'aboutP1'];
    
    // --- Fungsi Modal Kustom (pengganti alert/confirm) untuk halaman ini ---
    function showPageSpecificModal(message, confirmText, callback) {
        pageSpecificModalMessage.textContent = message;
        pageSpecificModalConfirmBtn.textContent = confirmText;
        if (confirmText.includes('Hapus')) {
            pageSpecificModalConfirmBtn.className = 'btn bg-red-500 text-white hover:bg-red-600 btn-sm';
        } else {
            pageSpecificModalConfirmBtn.className = 'btn btn-primary-pmii btn-sm';
        }
        pageSpecificModal.classList.add('open');
        pageSpecificModalCallback = callback;
    }

    pageSpecificModalConfirmBtn.addEventListener('click', () => {
        if (pageSpecificModalCallback) {
            pageSpecificModalCallback(true);
        }
        pageSpecificModal.classList.remove('open');
        pageSpecificModalCallback = null;
    });

    pageSpecificModalCancelBtn.addEventListener('click', () => {
        if (pageSpecificModalCallback) {
            pageSpecificModalCallback(false);
        }
        pageSpecificModal.classList.remove('open');
        pageSpecificModalCallback = null;
    });

    // --- Logika Drag & Drop ---
    let draggedItem = null;

    function handleDragStart(e) {
        draggedItem = this;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
        this.classList.add('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (this !== draggedItem && this.classList.contains('item-list-entry')) {
            this.classList.add('drag-over');
        }
    }

    function handleDragLeave() {
        this.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        this.classList.remove('drag-over');

        if (draggedItem && this !== draggedItem && this.classList.contains('item-list-entry')) {
            const parentId = this.parentElement.id;
            let sectionArray;
            if (parentId === 'news-list') sectionArray = homepageContent.news;
            else if (parentId === 'activities-list') sectionArray = homepageContent.activities;
            else if (parentId === 'gallery-list') sectionArray = homepageContent.gallery;

            if (sectionArray) {
                const fromId = draggedItem.dataset.id;
                const toId = this.dataset.id;

                const fromIndex = sectionArray.findIndex(item => item.id === fromId);
                const toIndex = sectionArray.findIndex(item => item.id === toId);
                
                if (fromIndex !== -1 && toIndex !== -1) {
                    const [itemToMove] = sectionArray.splice(fromIndex, 1);
                    sectionArray.splice(toIndex, 0, itemToMove);

                    if (parentId === 'news-list') newsManager.render();
                    else if (parentId === 'activities-list') activityManager.render();
                    else if (parentId === 'gallery-list') galleryManager.render();
                } else {
                    showResponseMessage('Error: Posisi drag-and-drop tidak valid.', 'error');
                }
            }
        }
    }

    function handleDragEnd() {
        if (draggedItem) {
            draggedItem.classList.remove('dragging');
        }
        document.querySelectorAll('.item-list-entry').forEach(item => {
            item.classList.remove('drag-over');
        });
        draggedItem = null;
    }

    function generateUniqueId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    // --- Manajer Bagian Dinamis (Buat/Render/Perbarui/Hapus) ---
    function createSectionManager(sectionName, listContainerId, addButtonId, itemFields, renderItemHtmlFunction) {
        const listContainer = document.getElementById(listContainerId);
        const addButton = document.getElementById(addButtonId);

        function renderList() {
            listContainer.querySelectorAll('textarea.tinymce-editor').forEach(textarea => {
                const editor = tinymce.get(textarea.id);
                if (editor) {
                    editor.destroy();
                }
            });

            listContainer.innerHTML = '';
            if (!homepageContent[sectionName] || homepageContent[sectionName].length === 0) {
                listContainer.innerHTML = `<p class="text-gray-500 text-sm italic">Belum ada item ditambahkan di bagian ini.</p>`;
                return;
            }
            homepageContent[sectionName].forEach((item, index) => {
                if (!item.id) item.id = generateUniqueId();
                const itemElement = renderItemHtmlFunction(item, index);
                itemElement.dataset.id = item.id;
                itemElement.setAttribute('draggable', true);
                itemElement.dataset.index = index;

                itemElement.addEventListener('dragstart', handleDragStart);
                itemElement.addEventListener('dragover', handleDragOver);
                itemElement.addEventListener('dragleave', handleDragLeave);
                itemElement.addEventListener('drop', handleDrop);
                itemElement.addEventListener('dragend', handleDragEnd);
                listContainer.appendChild(itemElement);

                const textareaId = `${sectionName}-desc-${item.id}`;
                const textareaEl = document.getElementById(textareaId);
                if (textareaEl) {
                    if (!tinymce.get(textareaId)) {
                         tinymce.init({
                            selector: `#${textareaId}`,
                            plugins: 'autolink lists link image anchor',
                            toolbar: 'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                            menubar: false, branding: false, height: 100,
                            content_style: 'body { font-family: \'Poppins\', sans-serif; font-size: 13px; }',
                            setup: function (editor) {
                                editor.on('change', function () { editor.save(); const event = new Event('change', { bubbles: true }); textareaEl.dispatchEvent(event); });
                                editor.on('init', function () { if (item.description) { editor.setContent(item.description); } });
                            }
                        });
                    } else {
                        tinymce.get(textareaId).setContent(item.description || '');
                    }
                }
            });
        }

        function addItem() {
            const newItem = {};
            itemFields.forEach(field => {
                newItem[field.name] = field.default || '';
            });
            newItem.id = generateUniqueId();
            if (!homepageContent[sectionName]) {
                homepageContent[sectionName] = [];
            }
            homepageContent[sectionName].push(newItem);
            renderList();
            listContainer.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        if (addButton) addButton.addEventListener('click', addItem);
        return { render: renderList };
    }

    // --- Manajer Bagian Berita ---
    const newsManager = createSectionManager(
        'news', 'news-list', 'add-news-btn',
        [{name: 'category', default: 'Berita'}, {name: 'title', default: 'Judul Berita Baru'}, {name: 'description', default: ''}, {name: 'image_url', default: 'https://placehold.co/600x400/eeeeee/cccccc?text=Gambar'}],
        (item, index) => {
            const el = document.createElement('div');
            el.className = 'item-list-entry flex-col sm:flex-row items-start sm:items-center relative group';
            const newsDescriptionId = `news-desc-${item.id}`;
            const filenameInitialStyle = (item.image_url && item.image_url.startsWith('data:image')) ? 'block' : 'none';
            const filenameInitialText = (item.image_url && item.image_url.startsWith('data:image')) ? 'Gambar diunggah sebelumnya' : '';

            el.innerHTML = `
                <div class="flex-grow pr-4 w-full sm:w-auto">
                    <label for="news-title-${item.id}" class="sr-only">Judul Berita</label>
                    <input type="text" id="news-title-${item.id}" value="${item.title}" data-id="${item.id}" data-field="title" class="form-input form-input-sm mb-1 news-field font-semibold" placeholder="Judul Berita" required>
                    <label for="news-category-${item.id}" class="sr-only">Kategori</label>
                    <input type="text" id="news-category-${item.id}" value="${item.category}" data-id="${item.id}" data-field="category" class="form-input form-input-sm text-xs w-1/3 mb-2 news-field" placeholder="Kategori">
                    <label for="${newsDescriptionId}" class="sr-only">Deskripsi singkat</label>
                    <textarea id="${newsDescriptionId}" data-id="${item.id}" data-field="description" class="form-input form-input-sm text-xs news-field tinymce-editor" rows="2" placeholder="Deskripsi singkat">${item.description}</textarea>
                    
                    <div class="mt-2">
                        <label for="news-image-upload-${item.id}" class="block text-xs font-medium text-text-secondary">Unggah Gambar</label>
                        <div class="image-upload-area">
                            <input type="file" id="news-image-upload-${item.id}" data-id="${item.id}" data-field="uploadedImage" class="news-field" accept="image/png, image/jpeg, image/gif">
                            <img id="news-preview-${item.id}" src="${item.image_url}" onerror="this.onerror=null;this.src='https://placehold.co/100x100/eeeeee/cccccc?text=Error';" class="image-preview-upload" style="${item.image_url ? 'display:block;' : 'display:none;'}" alt="News Image Preview">
                            <div id="news-filename-${item.id}" class="text-xs text-text-muted mt-1" style="display: ${filenameInitialStyle};">${filenameInitialText}</div>
                            <div class="image-upload-placeholder-text" style="${item.image_url ? 'display:none;' : 'display:flex;'}">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <span>Klik atau Seret</span>
                            </div>
                        </div>
                        <p class="text-xs text-text-muted text-center mt-1">ATAU</p>
                        <label for="news-image-url-${item.id}" class="sr-only">URL Gambar</label>
                        <input type="url" id="news-image-url-${item.id}" value="${item.image_url && !item.image_url.startsWith('data:image') ? item.image_url : ''}" data-id="${item.id}" data-field="image_url" class="form-input form-input-sm text-xs mt-1 news-field" placeholder="URL Gambar (http://...)" pattern="https?://.+">
                        <p class="text-xs text-gray-500 mt-1">Isi salah satu saja (URL atau Unggah)</p>
                    </div>
                </div>
                <button type="button" class="btn bg-red-500 text-white hover:bg-red-600 btn-sm delete-news-btn absolute top-2 right-2 sm:relative sm:top-auto sm:right-auto sm:ml-4 mt-2 sm:mt-0" data-id="${item.id}" title="Hapus Berita"><i class="fas fa-trash"></i></button>
            `;
            return el;
        }
    );

    document.getElementById('news-list').addEventListener('input', async (e) => {
        const target = e.target;
        const { id, field } = target.dataset;
        if (!id || !field || !target.classList.contains('news-field')) return;

        const itemIndex = homepageContent.news.findIndex(item => item.id === id);
        if (itemIndex === -1) return;

        if (target.type === 'file') {
            const result = await handleFileUploadAndDisplay(target, document.getElementById(`news-filename-${id}`), 'image');
            if (result.file_url) {
                homepageContent.news[itemIndex].image_url = result.file_url;
                document.getElementById(`news-preview-${id}`).src = result.file_url;
                document.getElementById(`news-preview-${id}`).style.display = 'block';
                document.getElementById(`news-image-url-${id}`).value = '';
                document.getElementById(`news-image-url-${id}`).classList.remove('invalid');
                target.closest('.image-upload-area').querySelector('.image-upload-placeholder-text').style.display = 'none';
            } else {
                homepageContent.news[itemIndex].image_url = '';
                document.getElementById(`news-preview-${id}`).src = '';
                document.getElementById(`news-preview-${id}`).style.display = 'none';
                document.getElementById(`news-image-url-${id}`).value = ''; // Pastikan URL juga kosong
                target.closest('.image-upload-area').querySelector('.image-upload-placeholder-text').style.display = 'flex';
            }
        } else if (field === 'image_url') {
            homepageContent.news[itemIndex].image_url = target.value;
            document.getElementById(`news-preview-${id}`).src = target.value;
            document.getElementById(`news-preview-${id}`).style.display = 'block';
            document.getElementById(`news-image-upload-${id}`).value = '';
            document.getElementById(`news-filename-${id}`).textContent = '';
            target.closest('.image-upload-area').querySelector('.image-upload-placeholder-text').style.display = 'none';
        } else if (field !== 'description') { // Deskripsi ditangani oleh TinyMCE setup
            homepageContent.news[itemIndex][field] = target.value;
        }
    });

    document.getElementById('news-list').addEventListener('click', (e) => {
        if (e.target.closest('.delete-news-btn')) {
            const idToDelete = e.target.closest('.delete-news-btn').dataset.id;
            showPageSpecificModal('Apakah Anda yakin ingin menghapus berita ini?', 'Ya, Hapus', (confirmed) => {
                if (confirmed) {
                    const textareaId = `news-desc-${idToDelete}`;
                    const editor = tinymce.get(textareaId);
                    if (editor) editor.destroy();

                    homepageContent.news = homepageContent.news.filter(item => item.id !== idToDelete);
                    newsManager.render();
                    showResponseMessage('Berita berhasil dihapus!', 'success');
                }
            });
        }
    });

    // --- Manajer Bagian Kegiatan ---
    const activityManager = createSectionManager(
        'activities', 'activities-list', 'add-activity-btn',
        [{name: 'day', default: '01'}, {name: 'month', default: 'JAN'}, {name: 'year', default: new Date().getFullYear().toString()}, {name: 'title', default: 'Judul Kegiatan Baru'}, {name: 'time', default: '00:00 - 00:00 WIB'}, {name: 'location', default: 'Lokasi Kegiatan'}, {name: 'link', default: '#'}, {name: 'image_url', default: 'https://placehold.co/600x400/eeeeee/cccccc?text=Gambar'}],
        (item, index) => {
            const el = document.createElement('div');
            el.className = 'item-list-entry flex-wrap relative group';
            const filenameInitialStyle = (item.image_url && item.image_url.startsWith('data:image')) ? 'block' : 'none';
            const filenameInitialText = (item.image_url && item.image_url.startsWith('data:image')) ? 'Gambar diunggah sebelumnya' : '';

            el.innerHTML = `
                 <div class="flex items-center gap-2 mb-2 w-full sm:w-auto">
                    <label for="activity-day-${item.id}" class="sr-only">Tanggal</label>
                    <input type="number" id="activity-day-${item.id}" value="${item.day}" data-id="${item.id}" data-field="day" class="form-input form-input-sm w-16 text-center activity-field" placeholder="Tgl (ex: 01)" min="1" max="31" required>
                    <label for="activity-month-${item.id}" class="sr-only">Bulan</label>
                    <input type="text" id="activity-month-${item.id}" value="${item.month}" data-id="${item.id}" data-field="month" class="form-input form-input-sm w-20 text-center activity-field" placeholder="Bulan (ex: JAN)" required>
                    <label for="activity-year-${item.id}" class="sr-only">Tahun</label>
                    <input type="number" id="activity-year-${item.id}" value="${item.year}" data-id="${item.id}" data-field="year" class="form-input form-input-sm w-20 text-center activity-field" placeholder="Tahun" min="2000" max="2100" required>
                </div>
                <div class="flex-grow pl-0 sm:pl-4 w-full sm:w-auto">
                    <label for="activity-title-${item.id}" class="sr-only">Judul Kegiatan</label>
                    <input type="text" id="activity-title-${item.id}" value="${item.title}" data-id="${item.id}" data-field="title" class="form-input form-input-sm mb-1 activity-field font-semibold" placeholder="Judul Kegiatan" required>
                    <label for="activity-time-${item.id}" class="sr-only">Waktu Kegiatan</label>
                    <input type="text" id="activity-time-${item.id}" value="${item.time}" data-id="${item.id}" data-field="time" class="form-input form-input-sm text-xs mb-1 activity-field" placeholder="Waktu (e.g., 13:00 - 16:00 WIB)">
                    <label for="activity-location-${item.id}" class="sr-only">Lokasi Kegiatan</label>
                    <input type="text" id="activity-location-${item.id}" value="${item.location}" data-id="${item.id}" data-field="location" class="form-input form-input-sm text-xs mb-1 activity-field" placeholder="Lokasi">
                    <label for="activity-link-${item.id}" class="sr-only">Link Kegiatan</label>
                    <input type="url" id="activity-link-${item.id}" value="${item.link}" data-id="${item.id}" data-field="link" class="form-input form-input-sm text-xs activity-field" placeholder="Link (opsional)">
                    
                    <div class="mt-2">
                        <label for="activity-image-upload-${item.id}" class="block text-xs font-medium text-text-secondary">Unggah Gambar</label>
                        <div class="image-upload-area">
                            <input type="file" id="activity-image-upload-${item.id}" data-id="${item.id}" data-field="uploadedImage" class="activity-field" accept="image/png, image/jpeg, image/gif">
                            <img id="activity-preview-${item.id}" src="${item.image_url}" onerror="this.onerror=null;this.src='https://placehold.co/100x100/eeeeee/cccccc?text=Error';" class="image-preview-upload" style="${item.image_url ? 'display:block;' : 'display:none;'}" alt="Activity Image Preview">
                            <div id="activity-filename-${item.id}" class="text-xs text-text-muted mt-1" style="display: ${filenameInitialStyle};">${filenameInitialText}</div>
                            <div class="image-upload-placeholder-text" style="${item.image_url ? 'display:none;' : 'display:flex;'}">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <span>Klik atau Seret</span>
                            </div>
                        </div>
                        <p class="text-xs text-text-muted text-center mt-1">ATAU</p>
                        <label for="activity-image-url-${item.id}" class="sr-only">URL Gambar</label>
                        <input type="url" id="activity-image-url-${item.id}" value="${item.image_url && !item.image_url.startsWith('data:image') ? item.image_url : ''}" data-id="${item.id}" data-field="image_url" class="form-input form-input-sm text-xs mt-1 activity-field" placeholder="URL Gambar (http://...)" pattern="https?://.+">
                        <p class="text-xs text-gray-500 mt-1">Isi salah satu saja (URL atau Unggah)</p>
                    </div>
                </div>
                <button type="button" class="btn bg-red-500 text-white hover:bg-red-600 btn-sm delete-activity-btn absolute top-2 right-2 sm:relative sm:top-auto sm:right-auto sm:ml-4 mt-2 sm:mt-0" data-id="${item.id}" title="Hapus Kegiatan"><i class="fas fa-trash"></i></button>
            `;
            return el;
        }
    );
    document.getElementById('activities-list').addEventListener('input', async (e) => {
        const target = e.target;
        const { id, field } = target.dataset;
        if (!id || !field || !target.classList.contains('activity-field')) return;

        const itemIndex = homepageContent.activities.findIndex(item => item.id === id);
        if (itemIndex === -1) return;

        if (target.type === 'file') {
            const result = await handleFileUploadAndDisplay(target, document.getElementById(`activity-filename-${id}`), 'image');
            if (result.file_url) {
                homepageContent.activities[itemIndex].image_url = result.file_url;
                document.getElementById(`activity-preview-${id}`).src = result.file_url;
                document.getElementById(`activity-preview-${id}`).style.display = 'block';
                document.getElementById(`activity-image-url-${id}`).value = '';
                document.getElementById(`activity-image-url-${id}`).classList.remove('invalid');
                target.closest('.image-upload-area').querySelector('.image-upload-placeholder-text').style.display = 'none';
            } else {
                homepageContent.activities[itemIndex].image_url = '';
                document.getElementById(`activity-preview-${id}`).src = '';
                document.getElementById(`activity-preview-${id}`).style.display = 'none';
                document.getElementById(`activity-image-url-${id}`).value = ''; // Pastikan URL juga kosong
                target.closest('.image-upload-area').querySelector('.image-upload-placeholder-text').style.display = 'flex';
            }
        } else if (field === 'image_url') {
            homepageContent.activities[itemIndex].image_url = target.value;
            document.getElementById(`activity-preview-${id}`).src = target.value;
            document.getElementById(`activity-preview-${id}`).style.display = 'block';
            document.getElementById(`activity-image-upload-${id}`).value = '';
            document.getElementById(`activity-filename-${id}`).textContent = '';
            target.closest('.image-upload-area').querySelector('.image-upload-placeholder-text').style.display = 'none';
        } else {
            homepageContent.activities[itemIndex][field] = target.value;
        }
    });

    document.getElementById('activities-list').addEventListener('click', (e) => {
         if (e.target.closest('.delete-activity-btn')) {
            const idToDelete = e.target.closest('.delete-activity-btn').dataset.id;
            showPageSpecificModal('Apakah Anda yakin ingin menghapus kegiatan ini?', 'Ya, Hapus', (confirmed) => {
                if (confirmed) {
                    homepageContent.activities = homepageContent.activities.filter(item => item.id !== idToDelete);
                    activityManager.render();
                    showResponseMessage('Kegiatan berhasil dihapus!', 'success');
                }
            });
        }
    });

    // --- Manajer Bagian Galeri ---
    const galleryManager = createSectionManager(
        'gallery', 'gallery-list', 'add-gallery-btn',
        [{name: 'image_url', default: 'https://placehold.co/400x400/eeeeee/cccccc?text=Foto'}, {name: 'caption', default: 'Keterangan Foto'}],
        (item, index) => {
            const el = document.createElement('div');
            el.className = 'relative group rounded-lg overflow-hidden border border-gray-200';
            const filenameInitialStyle = (item.image_url && item.image_url.startsWith('data:image')) ? 'block' : 'none';
            const filenameInitialText = (item.image_url && item.image_url.startsWith('data:image')) ? 'Gambar diunggah sebelumnya' : '';

            el.innerHTML = `
                <div class="image-upload-area mb-2">
                    <input type="file" id="gallery-image-upload-${item.id}" data-id="${item.id}" data-field="uploadedImage" class="gallery-field" accept="image/png, image/jpeg, image/gif">
                    <img id="gallery-preview-${item.id}" src="${item.image_url}" onerror="this.onerror=null;this.src='https://placehold.co/100x100/eeeeee/cccccc?text=Error';" class="image-preview-upload" style="${item.image_url ? 'display:block;' : 'display:none;'}" alt="Gallery Image Preview">
                    <div id="gallery-filename-${item.id}" class="text-xs text-text-muted mt-1" style="display: ${filenameInitialStyle};">${filenameInitialText}</div>
                    <div class="image-upload-placeholder-text" style="${item.image_url ? 'display:none;' : 'display:flex;'}">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <span>Klik atau Seret</span>
                    </div>
                </div>
                <label for="gallery-caption-${item.id}" class="sr-only">Keterangan Foto</label>
                <input type="text" id="gallery-caption-${item.id}" value="${item.caption}" data-id="${item.id}" data-field="caption" class="form-input form-input-sm text-xs gallery-field" placeholder="Keterangan">
                <label for="gallery-image-url-${item.id}" class="sr-only">URL Gambar</label>
                <input type="url" id="gallery-image-url-${item.id}" value="${item.image_url && !item.image_url.startsWith('data:image') ? item.image_url : ''}" data-id="${item.id}" data-field="image_url" class="form-input form-input-sm text-xs mt-1 gallery-field" placeholder="URL Gambar (http://...)" pattern="https?://.+" >
                <p class="text-xs text-gray-500 mt-1 mb-2">Isi salah satu saja (URL atau Unggah)</p>
                <button type="button" class="btn bg-red-500 text-white hover:bg-red-600 btn-sm delete-gallery-btn absolute top-1 right-1" data-id="${item.id}" title="Hapus Foto"><i class="fas fa-trash"></i></button>
            `;
            return el;
        }
    );
    document.getElementById('gallery-list').addEventListener('input', async (e) => {
        const target = e.target;
        const { id, field } = target.dataset;
        if (!id || !field || !target.classList.contains('gallery-field')) return;

        const itemIndex = homepageContent.gallery.findIndex(item => item.id === id);
        if (itemIndex === -1) return;

        if (target.type === 'file') {
            const result = await handleFileUploadAndDisplay(target, document.getElementById(`gallery-filename-${id}`), 'image');
            if (result.file_url) {
                homepageContent.gallery[itemIndex].image_url = result.file_url;
                document.getElementById(`gallery-preview-${id}`).src = result.file_url;
                document.getElementById(`gallery-preview-${id}`).style.display = 'block';
                document.getElementById(`gallery-image-url-${id}`).value = '';
                document.getElementById(`gallery-image-url-${id}`).classList.remove('invalid');
                target.closest('.image-upload-area').querySelector('.image-upload-placeholder-text').style.display = 'none';
            } else {
                homepageContent.gallery[itemIndex].image_url = '';
                document.getElementById(`gallery-preview-${id}`).src = '';
                document.getElementById(`gallery-preview-${id}`).style.display = 'none';
                document.getElementById(`gallery-image-url-${id}`).value = ''; // Pastikan URL juga kosong
                target.closest('.image-upload-area').querySelector('.image-upload-placeholder-text').style.display = 'flex';
            }
        } else if (field === 'image_url') {
            homepageContent.gallery[itemIndex].image_url = target.value;
            document.getElementById(`gallery-preview-${id}`).src = target.value;
            document.getElementById(`gallery-preview-${id}`).style.display = 'block';
            document.getElementById(`gallery-image-upload-${id}`).value = '';
            document.getElementById(`gallery-filename-${id}`).textContent = '';
            target.closest('.image-upload-area').querySelector('.image-upload-placeholder-text').style.display = 'none';
        } else {
            homepageContent.gallery[itemIndex][field] = target.value;
        }
    });

    document.getElementById('gallery-list').addEventListener('click', (e) => {
         if (e.target.closest('.delete-gallery-btn')) {
            const idToDelete = e.target.closest('.delete-gallery-btn').dataset.id;
            showPageSpecificModal('Apakah Anda yakin ingin menghapus foto ini?', 'Ya, Hapus', (confirmed) => {
                if (confirmed) {
                    homepageContent.gallery = homepageContent.gallery.filter(item => item.id !== idToDelete);
                    galleryManager.render();
                    showResponseMessage('Foto berhasil dihapus!', 'success');
                }
            });
        }
    });

    // --- Fungsi Unggah File dan Tampilan ---
    // Menggunakan fungsi uploadFile dari api.js.
    async function handleFileUploadAndDisplay(inputElement, fileNameDisplayElement, type) {
        const file = inputElement.files[0];
        if (!file) {
            if (fileNameDisplayElement) fileNameDisplayElement.textContent = 'Tidak ada file dipilih.';
            return { filename: null, file_url: null };
        }

        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        let isValidType = false;
        if (type === 'image') isValidType = allowedImageTypes.includes(file.type);
        else isValidType = true; // Untuk tipe lain, biarkan API yang validasi lebih lanjut

        if (!isValidType) {
            window.showCustomMessage(`Format file tidak didukung untuk ${file.name}.`, 'error');
            inputElement.value = '';
            if (fileNameDisplayElement) fileNameDisplayElement.textContent = 'Tidak ada file dipilih.';
            return { filename: null, file_url: null };
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            window.showCustomMessage(`Ukuran file "${file.name}" terlalu besar. Maksimal 5MB.`, 'error');
            inputElement.value = '';
            if (fileNameDisplayElement) fileNameDisplayElement.textContent = 'Tidak ada file dipilih.';
            return { filename: null, file_url: null };
        }

        if (fileNameDisplayElement) fileNameDisplayElement.textContent = `Mengunggah ${file.name}...`;
        try {
            const uploadResponse = await uploadFile(inputElement, { type: type }); // Kirim user_id jika perlu
            if (uploadResponse && uploadResponse.file_url) {
                if (fileNameDisplayElement) fileNameDisplayElement.textContent = file.name;
                window.showCustomMessage(`File "${file.name}" berhasil diunggah.`, 'success');
                return { filename: file.name, file_url: uploadResponse.file_url };
            } else {
                throw new Error(uploadResponse.message || "Unggah file gagal.");
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            window.showCustomMessage(`Gagal mengunggah file "${file.name}". ${error.message}`, 'error');
            inputElement.value = '';
            if (fileNameDisplayElement) fileNameDisplayElement.textContent = 'Gagal unggah.';
            return { filename: null, file_url: null };
        }
    }


    // --- Muat dan Simpan Konten Utama ---
    async function loadHomepageContentFromAPI() {
        try {
            const sectionsResponse = await getHomepageSections(); // Ambil semua bagian homepage
            if (sectionsResponse && sectionsResponse.data) {
                // Inisialisasi homepageContent dengan nilai default jika tidak ada dari API
                homepageContent = {
                    heroMainTitle: 'Pergerakan Mahasiswa Islam Indonesia',
                    announcementText: 'Pengumuman penting tentang kegiatan terbaru kami dapat dilihat <a href="#kegiatan">di sini</a>.',
                    aboutP1: 'PMII (Pergerakan Mahasiswa Islam Indonesia) adalah organisasi kemahasiswaan yang berlandaskan Islam Ahlusunnah Wal Jama\'ah dan berasaskan Pancasila. Berdiri pada tanggal 17 April 1960, PMII berkomitmen untuk menjadi wadah pengembangan diri mahasiswa yang menjunjung tinggi nilai-nilai keislaman, keindonesiaan, dan kemahasiswaan. Kami berupaya mencetak kader-kader ulul albab yang berintelektual, profesional, dan berakhlakul karimah, siap menjadi agen perubahan sosial di tengah masyarakat.',
                    news: [],
                    activities: [],
                    gallery: []
                };

                sectionsResponse.data.forEach(section => {
                    if (section.section_name === 'hero' && section.content_json) {
                        homepageContent.heroMainTitle = section.content_json.mainTitle || homepageContent.heroMainTitle;
                        // Tambahkan heroSubtitle dan heroMotto jika API mengembalikan ini juga
                        homepageContent.heroSubtitle = section.content_json.subtitle || '';
                        homepageContent.heroMotto = section.content_json.motto || '';
                        homepageContent.announcementText = section.content_json.announcementText || homepageContent.announcementText;
                    } else if (section.section_name === 'about' && section.content_json) {
                        homepageContent.aboutP1 = section.content_json.p1 || homepageContent.aboutP1;
                    }
                    // Tambahkan logika untuk news_config, activities_config, gallery_config jika Anda ingin mengatur data yang dimuat
                });
            } else {
                console.warn("Tidak ada data homepage sections dari API. Menggunakan nilai default.");
                window.showCustomMessage("Gagal memuat konten beranda dari server. Menggunakan data default.", "info");
            }

            // Ambil data dinamis untuk News, Activities, Gallery
            const newsResponse = await getApprovedNews();
            if (newsResponse && newsResponse.data) {
                homepageContent.news = newsResponse.data.map(item => ({
                    id: item.id, // Pastikan ada ID unik
                    category: item.category,
                    title: item.title,
                    description: item.description,
                    image_url: item.image_url // Pastikan ini adalah URL gambar
                }));
            }

            const activitiesResponse = await getApprovedActivities();
            if (activitiesResponse && activitiesResponse.data) {
                homepageContent.activities = activitiesResponse.data.map(item => ({
                    id: item.id, // Pastikan ada ID unik
                    day: new Date(item.activity_date).getDate().toString().padStart(2, '0'),
                    month: new Date(item.activity_date).toLocaleString('id-ID', { month: 'short' }).toUpperCase(),
                    year: new Date(item.activity_date).getFullYear().toString(),
                    title: item.title,
                    time: item.activity_time,
                    location: item.location,
                    link: item.registration_link || '#', // Asumsi ada registration_link
                    image_url: item.image_url
                }));
            }

            const galleryResponse = await getApprovedGalleryItems();
            if (galleryResponse && galleryResponse.data) {
                homepageContent.gallery = galleryResponse.data.map(item => ({
                    id: item.id, // Pastikan ada ID unik
                    image_url: item.image_url,
                    caption: item.caption
                }));
            }

        } catch (error) {
            console.error("Error loading homepage content from API:", error);
            window.showCustomMessage("Terjadi kesalahan saat memuat konten beranda. Menampilkan data default.", "error");
        } finally {
            // Setelah semua data dimuat (atau gagal), isi form dan render
            fillFormWithHomepageContent();
            newsManager.render();
            activityManager.render();
            galleryManager.render();
        }
    }

    function fillFormWithHomepageContent() {
        staticFields.forEach(field => {
            const element = form.elements[field];
            if (element) {
                const editor = tinymce.get(element.id);
                if (editor) {
                    editor.on('init', function() {
                        editor.setContent(homepageContent[field] || '');
                    });
                    if (editor.initialized) {
                        editor.setContent(homepageContent[field] || '');
                    }
                } else {
                    element.value = homepageContent[field] || '';
                }
            }
        });
    }


    function showResponseMessage(message, type) {
        responseMessage.textContent = message;
        responseMessage.classList.remove('hidden', 'form-message-success', 'form-message-error', 'form-message-info');
        responseMessage.innerHTML = '';
        if (type === 'success') {
            responseMessage.classList.add('form-message-success');
            responseMessage.innerHTML = '<i class="fas fa-check-circle mr-2"></i>' + message;
        } else if (type === 'error') {
            responseMessage.classList.add('form-message-error');
            responseMessage.innerHTML = '<i class="fas fa-times-circle mr-2"></i>' + message;
        } else if (type === 'info') {
            responseMessage.classList.add('form-message-info');
            responseMessage.innerHTML = '<i class="fas fa-info-circle mr-2"></i>' + message;
        }

        window.scrollTo(0, 0);

        setTimeout(() => {
            responseMessage.classList.add('hidden');
        }, 4000);
    }

    // Tangani pengiriman formulir
    form.addEventListener('submit', async function(e) { // Tambahkan async
        e.preventDefault();
        
        let isValid = true;

        staticFields.forEach(field => {
            const element = form.elements[field];
            if (element) {
                const editor = tinymce.get(element.id);
                let value = editor ? editor.getContent() : element.value;

                if (element.hasAttribute('required') && value.trim() === '') {
                    element.classList.add('invalid');
                    isValid = false;
                } else {
                    element.classList.remove('invalid');
                }
                homepageContent[field] = value;
            }
        });

        if (homepageContent.news) {
            homepageContent.news.forEach((item) => {
                const titleInput = document.getElementById(`news-title-${item.id}`);
                const imageUrlInput = document.getElementById(`news-image-url-${item.id}`);
                // const imageUploadInput = document.getElementById(`news-image-upload-${item.id}`); // Not directly validated here
                const descriptionTextarea = document.getElementById(`news-desc-${item.id}`);

                if (titleInput && titleInput.value.trim() === '') {
                    titleInput.classList.add('invalid'); isValid = false;
                } else if (titleInput) { titleInput.classList.remove('invalid'); }

                // Validasi gambar: salah satu URL atau file harus ada
                let imageIsPresent = !!item.image_url && item.image_url.trim() !== '';
                if (!imageIsPresent) {
                     if (imageUrlInput) imageUrlInput.classList.add('invalid');
                     isValid = false;
                } else {
                     if (imageUrlInput) imageUrlInput.classList.remove('invalid');
                }

                if (descriptionTextarea && tinymce.get(descriptionTextarea.id).getContent().trim() === '') {
                     descriptionTextarea.classList.add('invalid'); isValid = false;
                } else if (descriptionTextarea) { descriptionTextarea.classList.remove('invalid'); }
            });
        }
        
        if (homepageContent.activities) {
            homepageContent.activities.forEach((item) => {
                const dayInput = document.getElementById(`activity-day-${item.id}`);
                const monthInput = document.getElementById(`activity-month-${item.id}`);
                const yearInput = document.getElementById(`activity-year-${item.id}`);
                const titleInput = document.getElementById(`activity-title-${item.id}`);
                const timeInput = document.getElementById(`activity-time-${item.id}`);
                const locationInput = document.getElementById(`activity-location-${item.id}`);

                if (dayInput && (dayInput.value.trim() === '' || parseInt(dayInput.value) < 1 || parseInt(dayInput.value) > 31)) {
                    dayInput.classList.add('invalid'); isValid = false;
                } else if (dayInput) { dayInput.classList.remove('invalid'); }
                
                const validMonths = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGS", "SEP", "OKT", "NOV", "DES"];
                if (monthInput && (monthInput.value.trim() === '' || !validMonths.includes(monthInput.value.toUpperCase()))) {
                    monthInput.classList.add('invalid'); isValid = false;
                } else if (monthInput) { monthInput.classList.remove('invalid'); }

                if (yearInput && (yearInput.value.trim() === '' || parseInt(yearInput.value) < 2000 || parseInt(yearInput.value) > 2100)) {
                    yearInput.classList.add('invalid'); isValid = false;
                } else if (yearInput) { yearInput.classList.remove('invalid'); }

                if (titleInput && titleInput.value.trim() === '') {
                    titleInput.classList.add('invalid'); isValid = false;
                } else if (titleInput) { titleInput.classList.remove('invalid'); }

                if (timeInput && timeInput.value.trim() === '') {
                    timeInput.classList.add('invalid'); isValid = false;
                } else if (timeInput) { timeInput.classList.remove('invalid'); }

                if (locationInput && locationInput.value.trim() === '') {
                    locationInput.classList.add('invalid'); isValid = false;
                } else if (locationInput) { locationInput.classList.remove('invalid'); }

                // Validasi gambar
                let activityImageIsPresent = !!item.image_url && item.image_url.trim() !== '';
                if (!activityImageIsPresent) {
                    const imageUrlInput = document.getElementById(`activity-image-url-${item.id}`);
                     if (imageUrlInput) imageUrlInput.classList.add('invalid');
                     isValid = false;
                } else {
                    const imageUrlInput = document.getElementById(`activity-image-url-${item.id}`);
                    if (imageUrlInput) imageUrlInput.classList.remove('invalid');
                }
            });
        }

        if (homepageContent.gallery) {
            homepageContent.gallery.forEach((item) => {
                const captionInput = document.getElementById(`gallery-caption-${item.id}`);
                if (captionInput && captionInput.value.trim() === '') {
                    captionInput.classList.add('invalid'); isValid = false;
                } else if (captionInput) { captionInput.classList.remove('invalid'); }

                // Validasi gambar galeri
                let galleryImageIsPresent = !!item.image_url && item.image_url.trim() !== '';
                if (!galleryImageIsPresent) {
                    const imageUrlInput = document.getElementById(`gallery-image-url-${item.id}`);
                     if (imageUrlInput) imageUrlInput.classList.add('invalid');
                     isValid = false;
                } else {
                    const imageUrlInput = document.getElementById(`gallery-image-url-${item.id}`);
                    if (imageUrlInput) imageUrlInput.classList.remove('invalid');
                }
            });
        }

        if (!isValid) {
            showResponseMessage('Harap lengkapi semua bidang yang wajib diisi dan perbaiki kesalahan input!', 'error');
            return;
        }

        // Siapkan data untuk dikirim ke API
        const dataToSave = {
            hero: {
                mainTitle: homepageContent.heroMainTitle,
                subtitle: homepageContent.heroSubtitle,
                motto: homepageContent.heroMotto,
                announcementText: homepageContent.announcementText
            },
            about: {
                p1: homepageContent.aboutP1
            },
            news: homepageContent.news.map(item => ({ // Filter properti yang tidak diperlukan backend
                category: item.category,
                title: item.title,
                description: item.description,
                image_url: item.image_url
            })),
            activities: homepageContent.activities.map(item => ({
                activity_date: `${item.year}-${item.monthToNumber(item.month)}-${item.day}`, // Konversi ke YYYY-MM-DD
                title: item.title,
                activity_time: item.time,
                location: item.location,
                registration_link: item.link,
                image_url: item.image_url
            })),
            gallery: homepageContent.gallery.map(item => ({
                image_url: item.image_url,
                caption: item.caption
            }))
        };

        try {
            // Panggil API untuk memperbarui setiap bagian
            await updateHomepageSection('hero', dataToSave.hero);
            await updateHomepageSection('about', dataToSave.about);
            // Untuk news, activities, gallery, Anda mungkin perlu endpoint batch update atau loop melalui setiap item jika API tidak mendukung batch
            // Untuk kesederhanaan, saya akan menunjukkan bagaimana Anda bisa memperbarui *semua* berita/kegiatan/galeri sebagai satu payload.
            // ASUMSI: Ada endpoint API yang menerima seluruh array data untuk News, Activities, Gallery homepage sections.
            // Jika tidak, Anda perlu memanggil API CRUD untuk setiap item secara terpisah (add, update, delete).
            await updateHomepageSection('news_display', dataToSave.news); // Asumsi section_name 'news_display'
            await updateHomepageSection('activities_display', dataToSave.activities); // Asumsi section_name 'activities_display'
            await updateHomepageSection('gallery_display', dataToSave.gallery); // Asumsi section_name 'gallery_display'

            showResponseMessage('Perubahan beranda berhasil disimpan!', 'success');
        } catch (error) {
            console.error('Error saving homepage changes:', error);
            showResponseMessage(error.message || 'Terjadi kesalahan saat menyimpan perubahan beranda.', 'error');
        }
    });
    
    // Tangani tombol batal
    cancelButton.addEventListener('click', function() {
        showPageSpecificModal('Apakah Anda yakin ingin membatalkan? Semua perubahan yang belum disimpan akan hilang.', 'Ya, Batalkan', (confirmed) => {
            if (confirmed) {
                window.location.href = '../index.php'; // Kembali ke halaman utama
            }
        });
    });

    // Inisialisasi TinyMCE untuk textarea statis
    tinymce.init({
        selector: 'textarea.tinymce-editor', // Targetkan semua textarea dengan class ini
        plugins: 'autolink lists link image anchor code', // Tambahkan 'code' untuk melihat HTML
        toolbar: 'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help | code',
        menubar: false,
        branding: false,
        height: 200,
        content_style: 'body { font-family: \'Poppins\', sans-serif; font-size: 14px; }',
        setup: function (editor) {
            editor.on('change', function () {
                editor.save();
                const event = new Event('change', { bubbles: true });
                editor.getElement().dispatchEvent(event); // Picu event 'change' pada textarea yang mendasari
            });
            // Handle initial content if editor is not yet initialized
            editor.on('init', function() {
                const textareaEl = editor.getElement();
                const fieldName = textareaEl.id; // Asumsi ID elemen adalah nama field
                if (homepageContent[fieldName]) {
                    editor.setContent(homepageContent[fieldName]);
                }
            });
        }
    });


    // --- Inisialisasi Halaman ---
    const pageCanContinue = await initializePageAccess(); // Tunggu hasil pengecekan akses

    if (pageCanContinue) {
        await loadHomepageContentFromAPI(); // Muat konten dari API
        // Scroll to top button functionality
        const scrollToTopBtnManajemenAkun = document.getElementById('scrollToTopBtnManajemenAkun');
        window.addEventListener('scroll', () => {
            if (scrollToTopBtnManajemenAkun) {
                if (window.pageYOffset > 200) {
                    scrollToTopBtnManajemenAkun.classList.remove('hidden');
                    scrollToTopBtnManajemenAkun.classList.add('flex');
                } else {
                    scrollToTopBtnManajemenAkun.classList.add('hidden');
                    scrollToTopBtnManajemenAkun.classList.remove('flex');
                }
            }
        });

        if (scrollToTopBtnManajemenAkun) {
            scrollToTopBtnManajemenAkun.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
        
        document.getElementById('tahun-footer-manajemen-akun').textContent = new Date().getFullYear();
    }
});