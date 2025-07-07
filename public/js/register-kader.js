// public/js/register-kader.js

// Impor fungsi-fungsi dari modul auth.js dan api.js
import { registerKader } from './api.js'; // Menggunakan registerKader dari api.js
import { redirectToAppropriateDashboard } from './auth.js'; // Untuk redirect setelah sukses
import { getAllRayons } from './api.js'; // Untuk mengisi dropdown rayon

document.addEventListener('DOMContentLoaded', async function() {
    // --- Data Injeksi dari PHP ---
    const phpLoggedInUser = window.phpLoggedInUser;
    const phpRayonsData = window.phpRayonsData; // Data rayon dari PHP

    // --- DOM Element References ---
    const registerForm = document.getElementById('register-kader-form');
    const registerMessageContainer = document.getElementById('register-message');
    const registerMessageText = document.getElementById('register-message-text');
    
    const nimInput = document.getElementById('register-nim');
    const namaInput = document.getElementById('register-nama');
    const emailInput = document.getElementById('register-email');
    const rayonSelect = document.getElementById('register-rayon');
    const passwordInput = document.getElementById('register-password');
    const confirmPasswordInput = document.getElementById('register-confirm-password');
    const registerSubmitButton = document.getElementById('register-submit-button');

    // --- Utility Functions ---
    // Fungsi untuk mengupdate kelas floating label
    function updateLabelClass(input) {
        const label = input.nextElementSibling; // Asumsi label ada tepat setelah input
        if (label && label.classList.contains('input-label')) {
            if (input.value.trim() !== '' || (input.tagName === 'SELECT' && input.value !== '')) {
                input.classList.add('has-value');
            } else {
                input.classList.remove('has-value');
            }
        }
    }

    // Fungsi untuk menampilkan pesan (sukses/gagal)
    function displayMessage(text, isSuccess) {
        registerMessageText.textContent = text;
        registerMessageContainer.classList.remove('success', 'error'); // Hapus kelas sebelumnya
        if (isSuccess) {
            registerMessageContainer.classList.add('success');
        } else {
            registerMessageContainer.classList.add('error');
        }
        registerMessageContainer.style.display = 'flex';
    }

    // --- Populate Rayon Dropdown ---
    async function populateRayonDropdown() {
        let rayons = [];
        try {
            const response = await getAllRayons(); // Panggil API untuk mendapatkan data rayon
            if (response && response.data) {
                rayons = response.data;
            } else {
                // Fallback ke data PHP injected jika API gagal atau kosong
                rayons = phpRayonsData || [];
                showCustomMessage('Gagal memuat daftar rayon dari server. Menampilkan data default.', 'error');
            }
        } catch (error) {
            console.error('Error fetching rayons for dropdown:', error);
            rayons = phpRayonsData || [];
            showCustomMessage('Terjadi kesalahan saat memuat daftar rayon. Menampilkan data default.', 'error');
        }

        rayonSelect.innerHTML = '<option value="" disabled selected>Pilih Asal Rayon</option>';
        rayons.forEach(rayon => {
            const option = document.createElement('option');
            option.value = rayon.id; // Gunakan ID rayon sebagai nilai
            option.textContent = rayon.name;
            rayonSelect.appendChild(option);
        });
        updateLabelClass(rayonSelect); // Update label setelah mengisi
    }

    // --- Event Listeners ---
    // Inisialisasi floating labels untuk semua input saat DOMContentLoaded
    const inputs = document.querySelectorAll('.input-field');
    inputs.forEach(input => {
        updateLabelClass(input); // Panggil saat memuat untuk nilai awal
        input.addEventListener('input', updateLabelClass);
        input.addEventListener('change', updateLabelClass); // Untuk select
        input.addEventListener('blur', updateLabelClass);
    });

    if(registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Sembunyikan pesan sebelumnya
            registerMessageContainer.style.display = 'none'; 
            registerMessageContainer.classList.remove('success', 'error');

            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            const nim = nimInput.value.trim();
            const nama = namaInput.value.trim();
            const email = emailInput.value.trim();
            const rayonId = rayonSelect.value; // Ambil ID rayon yang dipilih

            if (password !== confirmPassword) {
                displayMessage('Password dan konfirmasi password tidak cocok!', false);
                return;
            }
            if (!nim || !email || !nama || !rayonId || !password) { // Pastikan password juga dicek
                displayMessage('Semua bidang wajib diisi.', false);
                return;
            }

            try {
                // Data yang akan dikirim ke API registerKader
                const userData = {
                    nim_username: nim, // Gunakan NIM sebagai username
                    name: nama,
                    email: email,
                    password: password,
                    rayon_id: rayonId, // Kirim ID rayon
                    role: 'kader', // Peran sudah ditentukan
                    klasifikasi: 'Kader Mujahid' // Asumsi klasifikasi default, bisa ditambahkan input
                    // Anda bisa menambahkan field lain dari tabel kaders_profile di sini jika form mengumpulkannya
                    // misal: no_hp: document.getElementById('register-no-hp').value,
                };

                // Panggil fungsi registerKader dari api.js
                const response = await registerKader(userData);

                displayMessage(response.message || 'Pendaftaran berhasil! Anda akan diarahkan ke halaman login.', true);
                
                registerForm.reset();
                inputs.forEach(input => input.classList.remove('has-value')); // Reset floating labels

                setTimeout(() => {
                    window.location.assign('login.php?tab=kader'); // Arahkan ke login.php
                }, 2000);

            } catch (error) {
                console.error('Error saat pendaftaran kader:', error);
                displayMessage(error.message || `Terjadi kesalahan saat mendaftar.`, false);
            }
        });
    }

    // Panggil fungsi untuk mengisi dropdown rayon saat halaman dimuat
    populateRayonDropdown();
});
