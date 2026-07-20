// Navigasi Layar
const screens = {
    home: document.getElementById('home-screen'),
    loading: document.getElementById('loading-screen'),
    quiz: document.getElementById('quiz-screen'),
    result: document.getElementById('result-screen')
};

function switchScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenName].classList.add('active');
}

// Variabel State Game
let soalData = [];
let currentIndex = 0;
let skorSatuSoal = 0;
let totalBenar = 0;
let totalSalah = 0;

// Elemen UI
const btnStart = document.getElementById('btn-start');
const soalCounter = document.getElementById('soal-counter');
const skorLive = document.getElementById('skor-live');
const pertanyaanEl = document.getElementById('pertanyaan');
const opsiContainer = document.getElementById('opsi-container');
const feedbackBox = document.getElementById('feedback-box');
const feedbackTitle = document.getElementById('feedback-title');
const feedbackDesc = document.getElementById('feedback-desc');
const btnNext = document.getElementById('btn-next');
const btnRestart = document.getElementById('btn-restart');

// Memulai Kuis
btnStart.addEventListener('click', async () => {
    const tingkat = document.getElementById('tingkat').value;
    const kesulitan = document.getElementById('kesulitan').value;
    const jumlah = parseInt(document.getElementById('jumlah-soal').value);

    // Reset State
    soalData = [];
    currentIndex = 0;
    totalBenar = 0;
    totalSalah = 0;
    skorSatuSoal = 100 / jumlah; // Hitung bobot per soal

    switchScreen('loading');

    try {
        const response = await fetch('/api/quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tingkat, kesulitan, jumlah })
        });

        if (!response.ok) throw new Error('Gagal mengambil data dari server.');
        
        soalData = await response.json();
        
        if (soalData && soalData.length > 0) {
            loadSoal();
            switchScreen('quiz');
        } else {
            throw new Error('Data soal kosong.');
        }

    } catch (error) {
        alert('Terjadi Kesalahan: ' + error.message);
        switchScreen('home');
    }
});

// Memuat Pertanyaan ke Layar
function loadSoal() {
    const soal = soalData[currentIndex];
    
    // Update Header
    soalCounter.textContent = `Soal ${currentIndex + 1} / ${soalData.length}`;
    skorLive.textContent = `Skor: ${Math.round(totalBenar * skorSatuSoal)}`;
    
    pertanyaanEl.textContent = soal.pertanyaan;
    opsiContainer.innerHTML = '';
    feedbackBox.classList.add('hidden');

    // Acak posisi opsi agar tidak ketahuan posisinya
    const opsiAcak = [...soal.opsi].sort(() => Math.random() - 0.5);

    opsiAcak.forEach(opsi => {
        const btn = document.createElement('button');
        btn.className = 'opsi-btn';
        btn.textContent = opsi;
        btn.onclick = () => verifikasiJawaban(btn, opsi, soal.jawaban_benar, soal.penjelasan);
        opsiContainer.appendChild(btn);
    });
}

// Mengecek Jawaban
function verifikasiJawaban(tombolTerpilih, jawabanUser, jawabanBenar, penjelasan) {
    // Matikan interaksi opsi
    const semuaTombol = document.querySelectorAll('.opsi-btn');
    semuaTombol.forEach(btn => btn.disabled = true);

    if (jawabanUser === jawabanBenar) {
        tombolTerpilih.classList.add('correct');
        feedbackTitle.textContent = '✅ Jawaban Tepat!';
        feedbackTitle.style.color = 'var(--success)';
        feedbackBox.style.borderLeftColor = 'var(--success)';
        totalBenar++;
    } else {
        tombolTerpilih.classList.add('wrong');
        feedbackTitle.textContent = '❌ Jawaban Salah!';
        feedbackTitle.style.color = 'var(--danger)';
        feedbackBox.style.borderLeftColor = 'var(--danger)';
        totalSalah++;
        
        // Tunjukkan tombol mana yang seharusnya benar
        semuaTombol.forEach(btn => {
            if (btn.textContent === jawabanBenar) btn.classList.add('correct');
        });
    }

    // Update skor live langsung
    skorLive.textContent = `Skor: ${Math.round(totalBenar * skorSatuSoal)}`;

    // Tampilkan Penjelasan
    feedbackDesc.textContent = penjelasan;
    feedbackBox.classList.remove('hidden');
    
    // Ubah teks tombol next jika ini soal terakhir
    if (currentIndex === soalData.length - 1) {
        btnNext.textContent = 'Lihat Hasil Akhir 🏆';
    } else {
        btnNext.textContent = 'Soal Selanjutnya ➡️';
    }
}

// Tombol Next Ditekan
btnNext.addEventListener('click', () => {
    currentIndex++;
    if (currentIndex < soalData.length) {
        loadSoal();
    } else {
        tampilkanHasil();
    }
});

// Layar Hasil Akhir
function tampilkanHasil() {
    switchScreen('result');
    const skorAkhir = Math.round(totalBenar * skorSatuSoal);
    
    document.getElementById('final-score').textContent = skorAkhir;
    document.getElementById('stat-benar').textContent = totalBenar;
    document.getElementById('stat-salah').textContent = totalSalah;

    // Ubah warna lingkaran skor berdasarkan nilai
    const circle = document.querySelector('.score-circle');
    if(skorAkhir >= 80) circle.style.background = 'var(--success)';
    else if(skorAkhir >= 50) circle.style.background = '#F59E0B'; // Kuning (Warning)
    else circle.style.background = 'var(--danger)';
}

// Tombol Main Lagi
btnRestart.addEventListener('click', () => {
    switchScreen('home');
});
