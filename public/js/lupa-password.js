// public/js/lupa-password.js

// Impor fungsi-fungsi yang mungkin dibutuhkan, misalnya untuk API
import { resetPassword } from './api.js'; // Asumsi ada fungsi resetPassword di api.js

document.addEventListener('DOMContentLoaded', function() {
    // --- Data Injeksi dari PHP ---
    // const phpLoggedInUser = window.phpLoggedInUser; // Tidak digunakan di halaman ini, tapi bisa dipertahankan
    // const BASE_PATH = window.BASE_PATH; // Tidak digunakan di halaman ini, tapi bisa dipertahankan

    // --- DOM Element References ---
    const lupaPasswordForm = document.getElementById('lupa-password-form');
    const messageContainer = document.getElementById('lupa-password-message');
    const messageText = document.getElementById('lupa-password-message-text');
    const identifierInput = document.getElementById('reset-identifier');
    const identifierLabel = document.getElementById('identifier-label');
    const subtitle = document.getElementById('lupa-password-subtitle');
    const resetSubmitButton = document.getElementById('reset-submit-button');

    // --- Custom Message Box Function (for this page) ---
    // This is a local implementation, as the global one might be in main.js
    function showCustomMessage(message, type = 'info') {
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
        }, 3000);
    }

    // --- Logic untuk menyesuaikan teks berdasarkan tipe pengguna (admin/kader) ---
    const urlParams = new URLSearchParams(window.location.search);
    const userType = urlParams.get('type'); 

    if (userType === 'admin') {
        if(identifierLabel) identifierLabel.textContent = 'Username Admin';
        if(subtitle) subtitle.textContent = 'Masukkan username admin Anda untuk mereset password.';
    } else if (userType === 'kader') {
        if(identifierLabel) identifierLabel.textContent = 'NIM Kader';
        if(subtitle) subtitle.textContent = 'Masukkan NIM Anda untuk mereset password.';
    }

    // --- Floating Label Logic ---
    const inputs = document.querySelectorAll('.input-field');
    inputs.forEach(input => {
        const updateLabelClass = () => {
            if (input.value.trim() !== '') {
                input.classList.add('has-value');
            } else {
                input.classList.remove('has-value');
            }
        };
        updateLabelClass(); // Set initial state on load
        input.addEventListener('input', updateLabelClass);
        input.addEventListener('blur', updateLabelClass);
    });

    // --- Form Submission Logic ---
    if(lupaPasswordForm) {
        lupaPasswordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Sembunyikan pesan sebelumnya
            messageContainer.style.display = 'none';
            messageContainer.classList.remove('success', 'error');

            const identifier = identifierInput.value.trim();

            if (!identifier) {
                messageText.textContent = 'Mohon masukkan ' + (userType === 'admin' ? 'username' : 'NIM atau email') + ' Anda.';
                messageContainer.classList.add('error');
                messageContainer.style.display = 'flex';
                return;
            }

            // Tampilkan spinner atau indikator loading
            if (resetSubmitButton) {
                resetSubmitButton.classList.add('loading'); // Asumsi ada kelas 'loading' untuk spinner
            }

            try {
                // Panggil fungsi resetPassword dari api.js
                const response = await resetPassword(identifier, userType); 
                
                if (response.success) {
                    messageText.textContent = response.message || 'Instruksi reset password telah dikirim ke email Anda.';
                    messageContainer.classList.add('success');
                } else {
                    throw new Error(response.message || 'Gagal mengirim instruksi reset password.');
                }
                messageContainer.style.display = 'flex';
                
                lupaPasswordForm.reset();
                inputs.forEach(input => input.classList.remove('has-value')); // Reset floating labels

            } catch (error) {
                console.error('Error saat permintaan reset password:', error);
                messageText.textContent = error.message || `Terjadi kesalahan saat mengirim instruksi reset password.`;
                messageContainer.classList.add('error');
                messageContainer.style.display = 'flex';
            } finally {
                // Sembunyikan spinner atau indikator loading
                if (resetSubmitButton) {
                    resetSubmitButton.classList.remove('loading');
                }
            }
        });
    }
});
