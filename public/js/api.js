// public/js/api.js

// Modul ini menyediakan fungsi-fungsi pembantu untuk melakukan panggilan HTTP (fetch) ke API backend.

// Base URL untuk API Anda.
// URL ini mengasumsikan server Anda sudah dikonfigurasi dengan benar
// menggunakan .htaccess untuk menangani URL rewriting.
const API_BASE_URL = '/api';

/**
 * Fungsi pembantu untuk membuat permintaan API terautentikasi.
 * @param {string} endpoint - Endpoint API (misal: '/homepage-sections').
 * @param {string} method - Metode HTTP (misal: 'GET', 'POST').
 * @param {Object} [data=null] - Data yang akan dikirim dengan permintaan (untuk POST/PUT).
 * @param {boolean} [includeAuth=true] - Apakah akan menyertakan token otorisasi.
 * @returns {Promise<Object>} - Respons JSON dari API.
 */
async function apiFetch(endpoint, method = 'GET', data = null, includeAuth = true) {
    const headers = {
        'Content-Type': 'application/json',
    };

    // Dapatkan token dari localStorage (asumsi auth.js menanganinya)
    if (includeAuth) {
        const token = localStorage.getItem('authToken'); // Asumsi token disimpan di sini
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const options = {
        method: method,
        headers: headers,
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const contentType = response.headers.get("content-type");

        if (!response.ok) {
            let errorMessage;
            // Jika respons adalah JSON, gunakan pesan dari API
            if (contentType && contentType.includes("application/json")) {
                const errorData = await response.json();
                errorMessage = errorData.message || JSON.stringify(errorData);
            } else {
                // Jika bukan JSON (kemungkinan besar halaman error HTML)
                const errorText = await response.text();
                errorMessage = `Server returned a non-JSON response (Status: ${response.status}). Response start: ${errorText.substring(0, 150)}...`;
            }
            console.error(`Error API (${response.status}):`, errorMessage);
            throw new Error(errorMessage);
        }

        // Jika respons OK, coba parse sebagai JSON
        // Tambahkan pengecekan contentType untuk memastikan responsnya benar-benar JSON
        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        } else {
            // Jika respons OK tapi bukan JSON, ini juga bisa jadi masalah
            const responseText = await response.text();
            throw new Error(`Expected JSON response, but received another format. Response: ${responseText.substring(0,150)}...`);
        }

    } catch (error) {
        console.error('Jaringan atau permintaan API gagal:', error);
        throw error; // Lempar ulang untuk ditangkap oleh fungsi pemanggil
    }
}

// --- Fungsi-fungsi API spesifik untuk modul Anda (contoh) ---

// Autentikasi
export const loginUser = (email, password) => apiFetch('/auth/login', 'POST', { email, password }, false); // Login tidak memerlukan token
export const registerKader = (userData) => apiFetch('/auth/register', 'POST', userData, false); // Registrasi tidak memerlukan token
export const forgotPassword = (identifierData) => apiFetch('/auth/forgot-password', 'POST', identifierData, false);
export const resetPassword = (resetData) => apiFetch('/auth/reset-password', 'POST', resetData, false);

// Pengguna (memerlukan autentikasi dan peran)
export const getUsers = () => apiFetch('/users', 'GET');
export const createUser = (userData) => apiFetch('/users', 'POST', userData);
export const getUserById = (id) => apiFetch(`/users/${id}`, 'GET');
export const updateUser = (id, userData) => apiFetch(`/users/${id}`, 'PUT', userData);
export const deleteUser = (id) => apiFetch(`/users/${id}`, 'DELETE');
export const resetUserPassword = (id, newPassword) => apiFetch(`/users/${id}/reset-password`, 'POST', { new_password: newPassword });

// Rayon
export const getAllRayons = () => apiFetch('/rayons', 'GET', null, false); // Bisa diakses publik
export const getRayonById = (id) => apiFetch(`/rayons/${id}`, 'GET', null, false); // Bisa diakses publik
export const updateRayon = (id, rayonData) => apiFetch(`/rayons/${id}`, 'PUT', rayonData);

// Profil Kader
export const getKaderProfile = (userId) => apiFetch(`/kaders/profile/${userId}`, 'GET');
export const updateKaderProfile = (userId, profileData) => apiFetch(`/kaders/profile/${userId}`, 'PUT', profileData);

// Berita & Artikel
export const getApprovedNews = () => apiFetch('/news', 'GET', null, false);
export const getNewsById = (id) => apiFetch(`/news/${id}`, 'GET', null, false);
export const submitNews = (newsData) => apiFetch('/news', 'POST', newsData);
export const updateNews = (id, newsData) => apiFetch(`/news/${id}`, 'PUT', newsData);
export const deleteNews = (id) => apiFetch(`/news/${id}`, 'DELETE');
export const getPendingNews = () => apiFetch('/news/pending', 'GET');
export const approveNews = (id) => apiFetch(`/news/${id}/approve`, 'PUT');
export const rejectNews = (id) => apiFetch(`/news/${id}/reject`, 'PUT');

// Kegiatan
export const getApprovedActivities = () => apiFetch('/activities', 'GET', null, false);
export const getActivityById = (id) => apiFetch(`/activities/${id}`, 'GET', null, false);
export const submitActivity = (activityData) => apiFetch('/activities', 'POST', activityData);
export const updateActivity = (id, activityData) => apiFetch(`/activities/${id}`, 'PUT', activityData);
export const deleteActivity = (id) => apiFetch(`/activities/${id}`, 'DELETE');
export const getPendingActivities = () => apiFetch('/activities/pending', 'GET');
export const approveActivity = (id) => apiFetch(`/activities/${id}/approve`, 'PUT');
export const rejectActivity = (id) => apiFetch(`/activities/${id}/reject`, 'PUT');
export const registerForActivity = (activityId, registrationData) => apiFetch(`/activities/${activityId}/register`, 'POST', registrationData);
export const getActivityRegistrants = (activityId) => apiFetch(`/activities/${activityId}/registrants`, 'GET');
export const deleteActivityRegistration = (id) => apiFetch(`/activities/registrations/${id}`, 'DELETE');

// Galeri
export const getApprovedGalleryItems = () => apiFetch('/gallery', 'GET', null, false);
export const getGalleryItemById = (id) => apiFetch(`/gallery/${id}`, 'GET', null, false);
export const uploadGalleryItem = (galleryData) => apiFetch('/gallery', 'POST', galleryData);
export const updateGalleryItem = (id, galleryData) => apiFetch(`/gallery/${id}`, 'PUT', galleryData);
export const deleteGalleryItem = (id) => apiFetch(`/gallery/${id}`, 'DELETE');
export const getPendingGalleryItems = () => apiFetch('/gallery/pending', 'GET');
export const approveGalleryItem = (id) => apiFetch(`/gallery/${id}/approve`, 'PUT');
export const rejectGalleryItem = (id) => apiFetch(`/gallery/${id}/reject`, 'PUT');

// Pengaturan Situs
export const getSiteSettings = () => apiFetch('/settings', 'GET');
export const updateSiteSettings = (settingsData) => apiFetch('/settings', 'PUT', settingsData);

// Bagian Beranda
export const getHomepageSections = () => apiFetch('/homepage-sections', 'GET'); // Untuk publik
export const updateHomepageSection = (sectionName, content) => apiFetch(`/homepage-sections/${sectionName}`, 'PUT', { content_json: content });

// Pengumuman
export const getAnnouncements = (activeOnly = true) => apiFetch(`/announcements?active=${activeOnly ? 'true' : 'false'}`, 'GET', null, activeOnly); // Public can get active, admin can get all
export const createAnnouncement = (announcementData) => apiFetch('/announcements', 'POST', announcementData);
export const updateAnnouncement = (id, announcementData) => apiFetch(`/announcements/${id}`, 'PUT', announcementData);
export const deleteAnnouncement = (id) => apiFetch(`/announcements/${id}`, 'DELETE');
export const activateAnnouncement = (id) => apiFetch(`/announcements/${id}/activate`, 'PUT');
export const deactivateAnnouncement = (id) => apiFetch(`/announcements/${id}/deactivate`, 'PUT');

// Tautan Media Sosial
export const getSocialMediaLinks = (activeOnly = true) => apiFetch(`/social-media?active=${activeOnly ? 'true' : 'false'}`, 'GET', null, activeOnly); // Public can get active, admin can get all
export const createSocialMediaLink = (linkData) => apiFetch('/social-media', 'POST', linkData);
export const updateSocialMediaLink = (platform, linkData) => apiFetch(`/social-media/${platform}`, 'PUT', linkData);
export const deleteSocialMediaLink = (platform) => apiFetch(`/social-media/${platform}`, 'DELETE');

// Notifikasi
export const getNotifications = () => apiFetch('/notifications', 'GET'); // Endpoint untuk notifikasi pengguna
export const getSentNotifications = () => apiFetch('/notifications/sent', 'GET');
export const getMyNotifications = () => apiFetch('/notifications/my', 'GET');
export const sendManualNotification = (notificationData) => apiFetch('/notifications/send', 'POST', notificationData);
export const deleteNotification = (id) => apiFetch(`/notifications/${id}`, 'DELETE');
export const triggerAutomaticNotifications = () => apiFetch('/notifications/trigger-auto', 'POST');
// export const markNotificationAsRead = (id) => apiFetch(`/notifications/${id}/read`, 'PUT'); // Jika ada fitur ini

// Log Aktivitas Sistem
export const getSystemActivityLogs = (filters = {}) => apiFetch(`/logs/activities?${new URLSearchParams(filters).toString()}`, 'GET');
export const getSystemActivityLogById = (id) => apiFetch(`/logs/activities/${id}`, 'GET');
export const getUserActivityLogs = (userId) => apiFetch(`/logs/activities/${userId}`, 'GET');
export const deleteSystemActivityLog = (id) => apiFetch(`/logs/activities/${id}`, 'DELETE');

// TTD Digital & QR Link
export const generateQrCode = (qrData) => apiFetch('/digital-signatures/generate', 'POST', qrData);
export const getQrCodeDetails = (id) => apiFetch(`/digital-signatures/${id}`, 'GET');
export const verifyPublicQrCode = (id) => apiFetch(`/digital-signatures/verify/${id}`, 'GET', null, false); // Publik, tidak perlu autentikasi

// Arsip Kepengurusan
export const getKepengurusanArchives = (filters = {}) => apiFetch(`/archives/kepengurusan?${new URLSearchParams(filters).toString()}`, 'GET');
export const getKepengurusanArchiveById = (id) => apiFetch(`/archives/kepengurusan/${id}`, 'GET');
export const createKepengurusanArchive = (archiveData) => apiFetch('/archives/kepengurusan', 'POST', archiveData);
export const updateKepengurusanArchive = (id, archiveData) => apiFetch(`/archives/kepengurusan/${id}`, 'PUT', archiveData);
export const deleteKepengurusanArchive = (id) => apiFetch(`/archives/kepengurusan/${id}`, 'DELETE');

// Kategori Digilib
export const getDigilibCategories = (activeOnly = true) => apiFetch(`/digilib/categories?active=${activeOnly ? 'true' : 'false'}`, 'GET', null, activeOnly);
export const createDigilibCategory = (categoryData) => apiFetch('/digilib/categories', 'POST', categoryData);
export const updateDigilibCategory = (id, categoryData) => apiFetch(`/digilib/categories/${id}`, 'PUT', categoryData);
export const deleteDigilibCategory = (id) => apiFetch(`/digilib/categories/${id}`, 'DELETE');

// Item Digilib
export const getDigilibItems = (filters = {}) => apiFetch(`/digilib/items?${new URLSearchParams(filters).toString()}`, 'GET', null, false); // Publik
export const getDigilibItemById = (id) => apiFetch(`/digilib/items/${id}`, 'GET', null, false); // Publik
export const uploadDigilibItem = (itemData) => apiFetch('/digilib/items', 'POST', itemData);
export const updateDigilibItem = (id, itemData) => apiFetch(`/digilib/items/${id}`, 'PUT', itemData);
export const deleteDigilibItem = (id) => apiFetch(`/digilib/items/${id}`, 'DELETE');
export const approveDigilibItem = (id) => apiFetch(`/digilib/items/${id}/approve`, 'PUT');
export const rejectDigilibItem = (id) => apiFetch(`/digilib/items/${id}/reject`, 'PUT');

// Karya Ilmiah
export const getScientificWorks = (filters = {}) => apiFetch(`/scientific-works?${new URLSearchParams(filters).toString()}`, 'GET', null, false); // Publik
export const getMyScientificWorks = (userId) => apiFetch(`/scientific-works/my?author_user_id=${userId}`, 'GET');
export const getScientificWorkById = (id) => apiFetch(`/scientific-works/${id}`, 'GET', null, false); // Publik
export const uploadScientificWork = (workData) => apiFetch('/scientific-works', 'POST', workData);
export const updateScientificWork = (id, workData) => apiFetch(`/scientific-works/${id}`, 'PUT', workData);
export const deleteScientificWork = (id) => apiFetch(`/scientific-works/${id}`, 'DELETE');
export const approveScientificWork = (id) => apiFetch(`/scientific-works/${id}/approve`, 'PUT');
export const rejectScientificWork = (id) => apiFetch(`/scientific-works/${id}/reject`, 'PUT');

// Pengaturan Akses OJS
export const getOjsSettings = () => apiFetch('/ojs-settings', 'GET');
export const updateOjsSettings = (id, settingsData) => apiFetch(`/ojs-settings/${id}`, 'PUT', settingsData);
export const syncOjsData = () => apiFetch('/ojs-settings/sync', 'POST');

// Laporan & Analisis
export const generateReport = (reportData) => apiFetch('/reports/generate', 'POST', reportData);
export const exportReport = (reportType, filters = {}) => apiFetch(`/reports/export/${reportType}?${new URLSearchParams(filters).toString()}`, 'GET');

// Unggah File Umum
// Catatan: Untuk unggah file, Anda perlu menggunakan FormData, bukan JSON.
// Fungsi apiFetch ini tidak dirancang untuk FormData secara langsung.
// Anda mungkin perlu fungsi terpisah untuk unggah file.
export async function uploadFile(fileInput, metadata = {}) {
    const formData = new FormData();
    // Jika multiple files
    if (fileInput.files && fileInput.files.length > 1) {
        for (const file of fileInput.files) {
            formData.append('file[]', file); // Backend mengharapkan 'file[]'
        }
    } else if (fileInput.files && fileInput.files.length === 1) {
        formData.append('file', fileInput.files[0]); // Backend mengharapkan 'file'
    } else {
        throw new Error('No file selected for upload.');
    }

    // Tambahkan metadata lain jika diperlukan oleh backend
    for (const key in metadata) {
        formData.append(key, metadata[key]);
    }

    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        throw new Error('Authentication token is missing for file upload. Please log in.');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/upload/file`, {
            method: 'POST',
            // PENTING: Jangan set Content-Type untuk FormData, browser akan menanganinya secara otomatis
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });

        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.message || `File upload error: ${response.status} ${response.statusText}`);
        }
        return responseData;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}
