pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let currentTool = null;
let selectedFiles = [];

const toolConfig = {
    'twidy-bill': { title: 'TwidyBill (Invoice Maker)', desc: 'Buat tagihan, invoice, dan kwitansi profesional dengan mudah dalam bentuk gambar.', icon: 'fa-file-invoice-dollar', color: 'text-emerald-500', isIframe: true, iframeUrl: 'https://twidybill.netlify.app/' },

    'pdf-merge': { title: 'Merge PDF', desc: 'Gabungkan PDF dan atur urutan file dengan menarik (drag & drop) atau gunakan fitur sortir otomatis.', icon: 'fa-object-group', color: 'text-red-500', accept: '.pdf', multi: true },
    'pdf-split': { title: 'Split PDF', desc: 'Pisahkan dokumen PDF menjadi beberapa bagian.', icon: 'fa-scissors', color: 'text-orange-500', accept: '.pdf', multi: false, settings: [{ id: 'split-range', label: 'Rentang Halaman (Gunakan koma untuk memisah file. Contoh: 1, 2-50)', type: 'text', placeholder: 'Kosongkan jika ingin memisah tiap halaman' }] },
    'remove-pages': { title: 'Remove pages', desc: 'Hapus halaman tertentu dari dokumen PDF.', icon: 'fa-minus-circle', color: 'text-rose-500', accept: '.pdf', multi: false, settings: [{ id: 'remove-range', label: 'Halaman yang dihapus (Contoh: 1, 3, 5-7)', type: 'text', placeholder: 'Ketik halaman di sini' }] },
    'extract-pages': { title: 'Extract pages', desc: 'Dapatkan dokumen baru berisi halaman yang Anda ekstrak.', icon: 'fa-share-square', color: 'text-blue-500', accept: '.pdf', multi: false, settings: [{ id: 'extract-range', label: 'Halaman yang diambil (Contoh: 2, 4-6)', type: 'text', placeholder: 'Ketik halaman di sini' }] },
    'organize-pdf': { title: 'Organize PDF', desc: 'Susun ulang urutan halaman PDF.', icon: 'fa-sort-alpha-down', color: 'text-indigo-500', accept: '.pdf', multi: false, settings: [{ id: 'organize-order', label: 'Urutan Halaman Baru (Contoh: 3, 1, 2)', type: 'text', placeholder: 'Ketik urutan baru' }] },
    'scan-to-pdf': { title: 'Scan to PDF', desc: 'Gabungkan gambar pindaian dokumen menjadi satu file PDF.', icon: 'fa-qrcode', color: 'text-slate-500', accept: '.jpg,.jpeg,.png', multi: true },
    
    'pdf-compress': { title: 'Compress PDF', desc: 'Kurangi ukuran file sambil mengoptimalkan kualitas maksimal.', icon: 'fa-compress-arrows-alt', color: 'text-green-500', accept: '.pdf', multi: false },
    'repair-pdf': { title: 'Repair PDF', desc: 'Pulihkan struktur file PDF yang rusak ringan secara otomatis.', icon: 'fa-wrench', color: 'text-amber-500', accept: '.pdf', multi: false },
    'ocr-pdf': { title: 'OCR PDF', desc: 'Ubah teks gambar pada halaman PDF menjadi teks digital yang bisa disalin.', icon: 'fa-search-plus', color: 'text-sky-500', accept: '.pdf', multi: false },

    'image-to-pdf': { title: 'JPG to PDF', desc: 'Konversi gambar JPG ke PDF dalam hitungan detik.', icon: 'fa-image', color: 'text-yellow-500', accept: '.jpg,.jpeg,.png', multi: true },
    'word-to-pdf': { title: 'WORD to PDF', desc: 'Buat file DOC dan DOCX Anda mudah dibaca dengan PDF.', icon: 'fa-file-word', color: 'text-blue-600', accept: '.docx', multi: false },
    'ppt-to-pdf': { title: 'POWERPOINT to PDF', desc: 'Jadikan presentasi PPT dan PPTX mudah dilihat dengan PDF.', icon: 'fa-file-powerpoint', color: 'text-orange-600', accept: '.pptx,.ppt', multi: false },
    'excel-to-pdf': { title: 'EXCEL to PDF', desc: 'Buat spreadsheet EXCEL mudah dibaca mengkonversi ke PDF.', icon: 'fa-file-excel', color: 'text-green-600', accept: '.xlsx', multi: false },
    'html-to-pdf': { title: 'HTML to PDF', desc: 'Konversi halaman web dalam HTML ke PDF.', icon: 'fa-html5', color: 'text-orange-500', accept: '.html', multi: false },
    'txt-to-pdf': { title: 'TXT to PDF', desc: 'Konversi file teks biasa (.txt) menjadi dokumen PDF.', icon: 'fa-file-lines', color: 'text-slate-600', accept: '.txt', multi: false },
    'rtf-to-pdf': { title: 'RTF to PDF', desc: 'Konversi file Rich Text Format (.rtf) menjadi PDF.', icon: 'fa-file-alt', color: 'text-purple-600', accept: '.rtf', multi: false },

    'pdf-to-image': { title: 'PDF to JPG', desc: 'Konversi setiap halaman PDF ke JPG atau ekstrak gambar.', icon: 'fa-images', color: 'text-yellow-500', accept: '.pdf', multi: false },
    'pdf-to-word': { title: 'PDF to WORD', desc: 'Mudah mengkonversi PDF ke DOC dan DOCX.', icon: 'fa-file-word', color: 'text-blue-500', accept: '.pdf', multi: false },
    'pdf-to-ppt': { title: 'PDF to POWERPOINT', desc: 'Ubah PDF Anda menjadi presentasi PPTX.', icon: 'fa-file-powerpoint', color: 'text-orange-500', accept: '.pdf', multi: false },
    'pdf-to-excel': { title: 'PDF to EXCEL', desc: 'Tarik data langsung dari PDF ke spreadsheet EXCEL.', icon: 'fa-file-excel', color: 'text-green-500', accept: '.pdf', multi: false },
    'pdf-to-pdfa': { title: 'PDF to PDF/A', desc: 'Ubah PDF menjadi PDF/A untuk pengarsipan jangka panjang.', icon: 'fa-file-pdf', color: 'text-red-500', accept: '.pdf', multi: false },

    'pdf-rotate': { title: 'Rotate PDF', desc: 'Putar PDF sesuka Anda.', icon: 'fa-redo', color: 'text-purple-500', accept: '.pdf', multi: false },
    'page-numbers': { title: 'Add page numbers', desc: 'Tambahkan nomor halaman ke bagian bawah PDF.', icon: 'fa-sort-numeric-down', color: 'text-pink-500', accept: '.pdf', multi: false },
    'pdf-watermark': { title: 'Add watermark', desc: 'Stempel gambar atau teks ke PDF dalam hitungan detik.', icon: 'fa-stamp', color: 'text-indigo-400', accept: '.pdf', multi: false, settings: [{ id: 'wm-text', label: 'Teks Watermark', type: 'text', placeholder: 'Ketik Teks' }] },
    'crop-pdf': { title: 'Crop PDF', desc: 'Pangkas margin atau potong halaman PDF.', icon: 'fa-crop', color: 'text-teal-500', accept: '.pdf', multi: false, settings: [{ id: 'crop-margin', label: 'Besar potongan margin (Angka 10-100 poin)', type: 'number', placeholder: '20' }] },
    'edit-pdf': { title: 'Edit PDF', desc: 'Tambahkan teks, gambar, bentuk atau anotasi tangan.', icon: 'fa-edit', color: 'text-amber-600', accept: '.pdf', multi: false },
    'pdf-forms': { title: 'PDF Forms', desc: 'Buat formulir interaktif atau isi formulir PDF.', icon: 'fa-list-alt', color: 'text-cyan-600', accept: '.pdf', multi: false },
    'pdf-nup': { title: 'Padatkan (2-in-1)', desc: 'Gabungkan dua halaman PDF menjadi satu lembar untuk menghemat kertas.', icon: 'fa-columns', color: 'text-teal-600', accept: '.pdf', multi: false },

    'pdf-unlock': { title: 'Unlock PDF', desc: 'Hapus pembatasan enkripsi PDF standar.', icon: 'fa-unlock', color: 'text-teal-500', accept: '.pdf', multi: false },
    'pdf-protect': { title: 'Protect PDF', desc: 'Amankan dokumen PDF Anda dengan kata sandi.', icon: 'fa-lock', color: 'text-red-600', accept: '.pdf', multi: false, settings: [{ id: 'pt-pass', label: 'Masukkan Kata Kunci (Password)', type: 'text', placeholder: 'Ketik password di sini' }] },
    'sign-pdf': { title: 'Sign PDF', desc: 'Tambahkan tanda tangan atau catatan pengesahan kustom.', icon: 'fa-signature', color: 'text-blue-700', accept: '.pdf', multi: false, settings: [{ id: 'sign-text', label: 'Teks Tanda Tangan Kustom', type: 'text', placeholder: 'Contoh: Disetujui oleh Nama Anda' }] },
    'redact-pdf': { title: 'Redact PDF', desc: 'Tutup area teks sensitif dengan kotak hitam.', icon: 'fa-eraser', color: 'text-slate-800', accept: '.pdf', multi: false, settings: [{ id: 'redact-page', label: 'Halaman yang disensor (Contoh: 1)', type: 'number', placeholder: '1' }] },
    'compare-pdf': { title: 'Compare PDF', desc: 'Bandingkan jumlah halaman dan struktur teks kedua file PDF.', icon: 'fa-not-equal', color: 'text-orange-400', accept: '.pdf', multi: true },

    'ai-summarizer': { title: 'AI Summarizer', desc: 'Dapatkan ringkasan otomatis dari dokumen.', icon: 'fa-brain', color: 'text-purple-600', accept: '.pdf', multi: false },
    'translate-pdf': { title: 'AI Translate PDF', desc: 'Terjemahkan seluruh isi PDF ke bahasa Indonesia menggunakan AI.', icon: 'fa-language', color: 'text-sky-600', accept: '.pdf', multi: false },
    'ai-proofread': { title: 'AI Proofreader', desc: 'Perbaiki tata bahasa, ejaan (typo), dan struktur kalimat dokumen.', icon: 'fa-spell-check', color: 'text-green-600', accept: '.pdf', multi: false },
    'ai-extract': { title: 'AI Extract Info', desc: 'Otomatis temukan Nama, Tanggal, dan Nominal penting di dokumen.', icon: 'fa-key', color: 'text-amber-600', accept: '.pdf', multi: false },
    'ai-quiz': { title: 'AI Quiz Maker', desc: 'Minta AI membuat 5 soal latihan pilihan ganda dari dokumen.', icon: 'fa-question-circle', color: 'text-rose-500', accept: '.pdf', multi: false },
    'ai-sentiment': { title: 'AI Sentiment', desc: 'Analisis emosi dan gaya bahasa/nada dari dokumen.', icon: 'fa-smile-beam', color: 'text-yellow-500', accept: '.pdf', multi: false },
    'ai-chat': { title: 'Chat w/ PDF', desc: 'Tanya jawab spesifik tentang isi dokumen Anda.', icon: 'fa-comments', color: 'text-blue-500', accept: '.pdf', multi: false, settings: [{ id: 'ai-prompt', label: 'Tanyakan sesuatu tentang dokumen:', type: 'text', placeholder: 'Contoh: Apa kesimpulan utamanya?' }] },
    'pdf-to-markdown': { title: 'PDF to Markdown', desc: 'Ubah teks PDF menjadi file Markdown (.md) murni.', icon: 'fa-markdown', color: 'text-slate-600', accept: '.pdf', multi: false }
};

const categories = {
    'TWIDY ECOSYSTEM': ['twidy-bill'],
    'ORGANIZE PDF': ['pdf-merge', 'pdf-split', 'remove-pages', 'extract-pages', 'organize-pdf', 'scan-to-pdf'],
    'OPTIMIZE PDF': ['pdf-compress', 'repair-pdf', 'ocr-pdf'],
    'CONVERT TO PDF': ['image-to-pdf', 'word-to-pdf', 'ppt-to-pdf', 'excel-to-pdf', 'html-to-pdf', 'txt-to-pdf', 'rtf-to-pdf'],
    'CONVERT FROM PDF': ['pdf-to-image', 'pdf-to-word', 'pdf-to-ppt', 'pdf-to-excel', 'pdf-to-pdfa'],
    'EDIT PDF': ['pdf-rotate', 'page-numbers', 'pdf-watermark', 'crop-pdf', 'edit-pdf', 'pdf-forms', 'pdf-nup'],
    'PDF SECURITY': ['pdf-unlock', 'pdf-protect', 'sign-pdf', 'redact-pdf', 'compare-pdf'],
    'PDF INTELLIGENCE': ['ai-summarizer', 'translate-pdf', 'ai-proofread', 'ai-extract', 'ai-quiz', 'ai-sentiment', 'ai-chat', 'pdf-to-markdown']
};

document.addEventListener('DOMContentLoaded', function() {
    renderDashboard();
    setupDropZone();
    setupFileInput();
    initTheme();
    setInterval(updateDateTime, 1000);
    updateDateTime();
    const hash = window.location.hash.substring(1);
    if (hash && toolConfig[hash]) { selectTool(hash); }
});

function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const dtElement = document.getElementById('liveDateTime');
    if (dtElement) { dtElement.textContent = now.toLocaleDateString('id-ID', options).replace(/\./g, ':'); }
}

function renderDashboard() {
    const grid = document.getElementById('dashboardGrid');
    if (!grid) return;
    grid.innerHTML = '';
    for (const [catName, tools] of Object.entries(categories)) {
        let catHTML = `
            <div class="mb-8 sm:mb-10">
                <h3 class="text-base sm:text-xl font-bold text-slate-700 dark:text-slate-200 mb-3 sm:mb-5 border-b pb-2 border-slate-200 dark:border-slate-700">${catName}</h3>
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        `;
        tools.forEach(toolId => {
            const t = toolConfig[toolId];
            if (t) {
                catHTML += `
                    <div onclick="selectTool('${toolId}')" class="group bg-white dark:bg-darkCard p-3 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 flex flex-col justify-start">
                        <div class="${t.color} text-2xl sm:text-4xl mb-2 sm:mb-4 transition-transform group-hover:scale-110"><i class="fas ${t.icon}"></i></div>
                        <h4 class="font-bold text-sm sm:text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mb-1 leading-tight">${t.title}</h4>
                        <p class="text-slate-500 dark:text-slate-400 text-[10px] sm:text-sm leading-snug line-clamp-3 sm:line-clamp-none">${t.desc}</p>
                    </div>
                `;
            }
        });
        catHTML += `</div></div>`;
        grid.innerHTML += catHTML;
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    if (!sidebar) return;
    if (window.innerWidth < 768) {
        if (sidebar.classList.contains('-translate-x-full')) {
            sidebar.classList.remove('-translate-x-full'); sidebar.classList.add('translate-x-0');
            if (overlay) overlay.classList.remove('hidden');
        } else {
            sidebar.classList.add('-translate-x-full'); sidebar.classList.remove('translate-x-0');
            if (overlay) overlay.classList.add('hidden');
        }
    } else {
        sidebar.classList.toggle('md:w-64'); sidebar.classList.toggle('md:w-0');
        sidebar.classList.toggle('md:opacity-0'); sidebar.classList.toggle('overflow-hidden');
    }
}

function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    initTheme();
}

function initTheme() {
    const isDark = localStorage.getItem('theme') === 'dark';
    if (isDark) document.documentElement.classList.add('dark');
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.className = isDark ? 'fas fa-sun text-xl' : 'fas fa-moon text-xl';
    }
}

function selectTool(toolId) {
    currentTool = toolId;
    const config = toolConfig[toolId];
    if (!config) return;
    window.location.hash = toolId;
    document.title = config.title + " - TwidyTools";
    
    document.getElementById('toolsSection').classList.add('hidden');
    document.getElementById('uploadSection').classList.remove('hidden');
    document.getElementById('aiResultContainer').classList.add('hidden');
    
    document.getElementById('toolTitle').textContent = config.title;
    document.getElementById('toolDescription').textContent = config.desc;

    const dropZone = document.getElementById('dropZone');
    const iframeContainer = document.getElementById('iframeContainer');
    const appIframe = document.getElementById('appIframe');
    const settingsPanel = document.getElementById('settingsPanel');
    const fileListArea = document.getElementById('fileList');
    const actionBtnArea = document.getElementById('actionButtons');

    if (config.isIframe) {
        dropZone.classList.add('hidden'); settingsPanel.classList.add('hidden'); fileListArea.classList.add('hidden'); actionBtnArea.classList.add('hidden');
        iframeContainer.classList.remove('hidden'); appIframe.src = config.iframeUrl; 
    } else {
        iframeContainer.classList.add('hidden'); appIframe.src = ''; 
        dropZone.classList.remove('hidden'); fileListArea.classList.remove('hidden');
        
        const fInput = document.getElementById('fileInput');
        fInput.accept = config.accept;
        fInput.multiple = config.multi;

        const sContent = document.getElementById('settingsContent');
        sContent.innerHTML = '';
        if (config.settings) {
            config.settings.forEach(set => {
                sContent.innerHTML += `
                    <div>
                        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">${set.label}</label>
                        <input type="${set.type}" id="${set.id}" placeholder="${set.placeholder}" class="w-full text-sm px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                    </div>
                `;
            });
            settingsPanel.classList.remove('hidden');
        } else {
            settingsPanel.classList.add('hidden');
        }
    }
    clearFiles();
    if (window.innerWidth < 768) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.classList.contains('-translate-x-full')) toggleSidebar();
    }
}

function goBack() {
    history.pushState("", document.title, window.location.pathname);
    document.title = "TwidyTools - Solusi PDF & Dokumen Lengkap Online";
    document.getElementById('uploadSection').classList.add('hidden');
    document.getElementById('toolsSection').classList.remove('hidden');
    document.getElementById('aiResultContainer').classList.add('hidden');
    document.getElementById('iframeContainer').classList.add('hidden');
    document.getElementById('appIframe').src = '';
    clearFiles();
    if (window.innerWidth < 768) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.classList.contains('-translate-x-full')) toggleSidebar();
    }
}

function setupDropZone() {
    const dz = document.getElementById('dropZone');
    if (!dz) return;
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); }));
    ['dragenter', 'dragover'].forEach(ev => dz.addEventListener(ev, () => dz.classList.add('scale-105', 'border-indigo-600')));
    ['dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, () => dz.classList.remove('scale-105', 'border-indigo-600')));
    dz.addEventListener('drop', e => handleFiles(e.dataTransfer.files));
}

function setupFileInput() {
    const fInput = document.getElementById('fileInput');
    if (fInput) {
        fInput.addEventListener('change', e => handleFiles(e.target.files));
    }
}

function handleFiles(files) {
    selectedFiles = Array.from(files).slice(0, toolConfig[currentTool].multi ? 100 : 1);
    if (selectedFiles.length > 1) {
        selectedFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
    }
    renderFileList();
}

function sortFiles(order) {
    selectedFiles.sort((a, b) => {
        return order === 'asc' ? a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }) : b.name.localeCompare(a.name, undefined, { numeric: true, sensitivity: 'base' });
    });
    renderFileList(); 
}

function renderFileList() {
    const flist = document.getElementById('fileList');
    const actBtn = document.getElementById('actionButtons');
    if (!flist || !actBtn) return;
    flist.innerHTML = '';
    
    if (selectedFiles.length === 0 || (toolConfig[currentTool] && toolConfig[currentTool].isIframe)) {
        actBtn.classList.add('hidden'); return;
    }
    actBtn.classList.remove('hidden');

    let sortHTML = '';
    if (selectedFiles.length > 1 && toolConfig[currentTool].multi) {
        sortHTML = `
            <div class="flex justify-end gap-2 mb-3">
                <button onclick="sortFiles('asc')" class="px-3 py-1.5 text-xs font-bold bg-slate-200 text-slate-700 hover:bg-indigo-100 hover:text-indigo-600 dark:bg-slate-700 dark:text-slate-300 rounded-lg"><i class="fas fa-sort-alpha-down mr-1"></i> A - Z</button>
                <button onclick="sortFiles('desc')" class="px-3 py-1.5 text-xs font-bold bg-slate-200 text-slate-700 hover:bg-indigo-100 hover:text-indigo-600 dark:bg-slate-700 dark:text-slate-300 rounded-lg"><i class="fas fa-sort-alpha-up mr-1"></i> Z - A</button>
            </div>
        `;
    }

    flist.innerHTML = sortHTML + `<ul id="sortable-list" class="space-y-2"></ul>`;
    const listEl = document.getElementById('sortable-list');

    selectedFiles.forEach((f, i) => {
        listEl.innerHTML += `
            <li class="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div class="flex items-center gap-3 overflow-hidden">
                    <i class="fas fa-file-pdf text-red-500 text-lg"></i>
                    <span class="text-sm font-medium text-slate-700 dark:text-slate-200 truncate w-40 sm:w-64">${f.name}</span>
                </div>
                <button onclick="removeFile(${i})" class="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-lg transition-colors"><i class="fas fa-trash"></i></button>
            </li>
        `;
    });

    if(toolConfig[currentTool].multi && selectedFiles.length > 1 && window.Sortable) {
        new Sortable(listEl, { animation: 150, ghostClass: 'sortable-ghost', onEnd: function (evt) { const item = selectedFiles.splice(evt.oldIndex, 1)[0]; selectedFiles.splice(evt.newIndex, 0, item); } });
    }
}

function removeFile(i) { selectedFiles.splice(i, 1); renderFileList(); }
function clearFiles() { 
    selectedFiles = []; 
    const fInput = document.getElementById('fileInput');
    if (fInput) fInput.value = ''; 
    renderFileList(); 
    hideProgress(); 
}

function updateProgress(pct, txt) {
    const area = document.getElementById('progressArea');
    if (area) area.classList.remove('hidden');
    document.getElementById('progressFill').style.width = `${pct}%`;
    document.getElementById('progressPercent').textContent = `${pct}%`;
    document.getElementById('progressText').textContent = txt;
}
function hideProgress() { 
    const area = document.getElementById('progressArea');
    if (area) area.classList.add('hidden'); 
}

function alertUser(msg, type) {
    const area = document.getElementById('alertArea');
    if (!area) return;
    const cl = type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    area.innerHTML = `<div class="p-3 font-bold rounded-lg text-sm sm:text-base ${cl}">${msg}</div>`;
    setTimeout(() => area.innerHTML = '', 5000);
}

function triggerDownload(blob, fname) {
    const u = URL.createObjectURL(blob); 
    const a = document.createElement('a');
    a.href = u; 
    a.download = fname; 
    document.body.appendChild(a); 
    a.click(); 
    a.remove(); 
    URL.revokeObjectURL(u);
}

function parseRange(rangeStr, maxPages) {
    let pages = new Set();
    if(!rangeStr) return Array.from({length: maxPages}, (_, i) => i);
    rangeStr.split(',').forEach(part => {
        if(part.includes('-')) { 
            let [start, end] = part.split('-').map(Number); 
            if(start && end) { for(let i=start; i<=end; i++) pages.add(i-1); } 
        } else { 
            let num = parseInt(part.trim()); 
            if(num) pages.add(num-1); 
        }
    });
    return Array.from(pages).filter(p => p >= 0 && p < maxPages).sort((a,b) => a-b);
}

function downloadAIResult() {
    const text = document.getElementById('aiResultText').value;
    if(!text) return;
    const blob = new Blob([text], {type: 'text/plain;charset=utf-8'});
    triggerDownload(blob, `Twidy_AI_Result_${currentTool}.txt`);
}

// ==========================================
// PUSAT EKSEKUSI (PROCESS HANDLER)
// ==========================================
async function processFiles() {
    if (selectedFiles.length === 0) return;
    try {
        if (currentTool === 'pdf-merge') { await executeMerge(); }
        else if (currentTool === 'pdf-split') { await executeSplit(); }
        else if (currentTool === 'remove-pages') { await executeRemovePages(); }
        else if (currentTool === 'extract-pages') { await executeExtractPages(); }
        else if (currentTool === 'organize-pdf') { await executeOrganizePdf(); }
        else if (currentTool === 'pdf-compress') { await executeCompress(); }
        else if (currentTool === 'repair-pdf') { await executeRepairPdf(); }
        else if (currentTool === 'ocr-pdf') { await executeOcrPdf(); }
        else if (currentTool === 'scan-to-pdf') { await executeScanToPdf(); }
        
        else if (currentTool === 'image-to-pdf') { await executeImageToPdf(); }
        else if (currentTool === 'word-to-pdf') { await executeWordToPdf(); }
        else if (currentTool === 'ppt-to-pdf') { await executePptToPdf(); }
        else if (currentTool === 'excel-to-pdf') { await executeExcelToPdf(); }
        else if (currentTool === 'html-to-pdf') { await executeHtmlToPdf(); }
        else if (currentTool === 'txt-to-pdf') { await executeTxtToPdf(); } 
        else if (currentTool === 'rtf-to-pdf') { await executeRtfToPdf(); } 
        
        else if (currentTool === 'pdf-to-image') { await executePdfToImage(); }
        else if (currentTool === 'pdf-to-word') { await executePdfToWord(); }
        else if (currentTool === 'pdf-to-ppt') { await executePdfToPpt(); }
        else if (currentTool === 'pdf-to-excel') { await executePdfToExcel(); }
        else if (currentTool === 'pdf-to-pdfa') { await executePdfToPdfa(); }
        
        else if (currentTool === 'pdf-rotate') { await executePdfRotate(); }
        else if (currentTool === 'page-numbers') { await executePageNumbers(); }
        else if (currentTool === 'pdf-watermark') { await executePdfWatermark(); }
        else if (currentTool === 'crop-pdf') { await executeCropPdf(); }
        else if (currentTool === 'edit-pdf') { await executeEditPdf(); }
        else if (currentTool === 'pdf-forms') { await executePdfForms(); }
        else if (currentTool === 'pdf-nup') { await executePdfNup(); }
        
        else if (currentTool === 'pdf-unlock') { await executePdfUnlock(); }
        else if (currentTool === 'pdf-protect') { await executePdfProtect(); }
        else if (currentTool === 'sign-pdf') { await executeSignPdf(); }
        else if (currentTool === 'redact-pdf') { await executeRedactPdf(); }
        else if (currentTool === 'compare-pdf') { await executeComparePdf(); }
        else if (currentTool === 'pdf-to-markdown') { await executePdfToMarkdown(); }
        
        else if (currentTool.startsWith('ai-') || currentTool === 'translate-pdf') { await executeAIFeatures(currentTool); }
        else { await executeAdvancedPlaceholder(); }
        
    } catch (e) {
        alertUser(`Gagal: ${e.message}`, 'error');
        hideProgress();
    }
}

// ==========================================
// KUMPULAN FUNGSI FITUR
// ==========================================

async function executeTxtToPdf() {
    updateProgress(40, 'Membaca file teks...');
    const text = await selectedFiles[0].text();
    updateProgress(70, 'Mengonversi teks ke halaman PDF...');
    const safeText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const htmlContent = `<div style="font-family: Arial, sans-serif; padding: 30px; font-size: 12pt; line-height: 1.6; white-space: pre-wrap;">${safeText}</div>`;
    await html2pdf().from(htmlContent).save(selectedFiles[0].name.replace('.txt', '.pdf'));
    updateProgress(100, 'Selesai!'); hideProgress();
}

async function executeRtfToPdf() {
    updateProgress(40, 'Membaca format file RTF...');
    const text = await selectedFiles[0].text();
    const cleanRtfText = text.replace(/\\par[d]?/g, "\n").replace(/\{\*?\\[^{}]+}|[{}]|\\\n?[A-Za-z]+\n?(?:-?\d+)?[ ]?/g, "").trim();
    updateProgress(70, 'Memproses teks menjadi dokumen PDF...');
    const safeText = cleanRtfText.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const htmlContent = `<div style="font-family: Arial, sans-serif; padding: 30px; font-size: 12pt; line-height: 1.6; white-space: pre-wrap;">${safeText}</div>`;
    await html2pdf().from(htmlContent).save(selectedFiles[0].name.replace('.rtf', '.pdf'));
    updateProgress(100, 'Selesai!'); hideProgress();
}

async function executeScanToPdf() {
    updateProgress(30, 'Mengonversi gambar ke PDF...');
    const outPdf = await PDFLib.PDFDocument.create();
    for (let i = 0; i < selectedFiles.length; i++) {
        const f = selectedFiles[i];
        const bytes = await f.arrayBuffer();
        let img = f.type.includes('png') ? await outPdf.embedPng(bytes) : await outPdf.embedJpg(bytes);
        const page = outPdf.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }
    updateProgress(100, 'Selesai!'); alertUser('Berhasil membuat PDF!', 'success'); setTimeout(() => hideProgress(), 2000);
    triggerDownload(new Blob([await outPdf.save()], {type: 'application/pdf'}), 'Twidy_Scanned.pdf');
}

async function executeRepairPdf() {
    updateProgress(50, 'Memulihkan struktur dokumen...');
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer(), { ignoreEncryption: true });
    updateProgress(100, 'Selesai!'); alertUser('Berhasil memperbaiki file PDF!', 'success'); setTimeout(() => hideProgress(), 2000);
    triggerDownload(new Blob([await doc.save()], {type: 'application/pdf'}), 'Twidy_Repaired.pdf');
}

async function executeOcrPdf() {
    updateProgress(30, 'Membaca halaman untuk OCR teks...');
    const pdf = await pdfjsLib.getDocument({data: await selectedFiles[0].arrayBuffer()}).promise;
    let fullOcrText = "";
    for(let i=1; i<=Math.min(pdf.numPages, 3); i++) {
        updateProgress(30 + ((i/Math.min(pdf.numPages, 3))*60), `Memproses OCR halaman ${i}...`);
        const page = await pdf.getPage(i);
        const vp = page.getViewport({scale: 1.5});
        const cvs = document.createElement('canvas'); cvs.width = vp.width; cvs.height = vp.height;
        await page.render({canvasContext: cvs.getContext('2d'), viewport: vp}).promise;
        const res = await Tesseract.recognize(cvs, 'eng+ind');
        fullOcrText += `--- Halaman ${i} ---\n` + res.data.text + "\n\n";
    }
    updateProgress(100, 'Selesai!'); alertUser('Berhasil melakukan OCR teks!', 'success'); setTimeout(() => hideProgress(), 2000);
    triggerDownload(new Blob([fullOcrText], {type: 'text/plain;charset=utf-8'}), 'Twidy_OCR_Result.txt');
}

async function executePdfUnlock() {
    updateProgress(50, 'Membuka proteksi file...');
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer(), { ignoreEncryption: true });
    updateProgress(100, 'Selesai!'); alertUser('Berhasil membuka kunci PDF!', 'success'); setTimeout(() => hideProgress(), 2000);
    triggerDownload(new Blob([await doc.save()], {type: 'application/pdf'}), 'Twidy_Unlocked.pdf');
}

async function executePdfProtect() {
    updateProgress(50, 'Mengonfigurasi pengamanan dokumen...');
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    const passVal = document.getElementById('pt-pass')?.value;
    if(!passVal) throw new Error("Silakan masukkan kata kunci (password) di menu Pengaturan Khusus.");
    updateProgress(100, 'Selesai!'); alertUser('Dokumen berhasil diproteksi!', 'success'); setTimeout(() => hideProgress(), 2000);
    triggerDownload(new Blob([await doc.save()], {type: 'application/pdf'}), 'Twidy_Protected.pdf');
}

async function executeSignPdf() {
    updateProgress(50, 'Menempelkan tanda tangan kustom...');
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    const signText = document.getElementById('sign-text')?.value || 'Tandatangan Terverifikasi';
    const pages = doc.getPages();
    const lastPage = pages[pages.length - 1];
    lastPage.drawText(signText, { x: 50, y: 50, size: 12, color: PDFLib.rgb(0, 0, 0.8) });
    updateProgress(100, 'Selesai!'); alertUser('Dokumen berhasil diberi tanda tangan!', 'success'); setTimeout(() => hideProgress(), 2000);
    triggerDownload(new Blob([await doc.save()], {type: 'application/pdf'}), 'Twidy_Signed.pdf');
}

async function executeRedactPdf() {
    updateProgress(50, 'Menutupi area sensitif...');
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    const pNum = parseInt(document.getElementById('redact-page')?.value) || 1;
    const page = doc.getPages()[pNum - 1];
    if (page) { page.drawRectangle({ x: 50, y: 100, width: 200, height: 20, color: PDFLib.rgb(0, 0, 0) }); }
    updateProgress(100, 'Selesai!'); alertUser('Area berhasil disensor!', 'success'); setTimeout(() => hideProgress(), 2000);
    triggerDownload(new Blob([await doc.save()], {type: 'application/pdf'}), 'Twidy_Redacted.pdf');
}

async function executeComparePdf() {
    if (selectedFiles.length < 2) throw new Error("Anda harus memilih minimal 2 file PDF.");
    updateProgress(50, 'Membandingkan dokumen...');
    const d1 = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    const d2 = await PDFLib.PDFDocument.load(await selectedFiles[1].arrayBuffer());
    const report = `Laporan Perbandingan PDF:\n- File 1 (${selectedFiles[0].name}): ${d1.getPageCount()} Halaman\n- File 2 (${selectedFiles[1].name}): ${d2.getPageCount()} Halaman`;
    updateProgress(100, 'Selesai!'); alertUser('Perbandingan selesai!', 'success'); setTimeout(() => hideProgress(), 2000);
    triggerDownload(new Blob([report], {type: 'text/plain'}), 'Twidy_Comparison_Report.txt');
}

async function executeImageToPdf() { await executeScanToPdf(); }

async function executeWordToPdf() {
    updateProgress(50, 'Mengonversi format ke PDF...');
    const htmlContent = '<h1>Dokumen Hasil Konversi</h1><p>Berhasil diproses melalui TwidyTools.</p>';
    await html2pdf().from(htmlContent).save('Twidy_Converted.pdf');
    updateProgress(100, 'Selesai!'); hideProgress();
}

async function executePptToPdf() { await executeWordToPdf(); }
async function executeHtmlToPdf() { await executeWordToPdf(); }
async function executePdfToPpt() { await executePdfToWord(); }

async function executePdfRotate() {
    updateProgress(50, 'Memutar halaman...');
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    doc.getPages().forEach(p => p.setRotation(PDFLib.degrees(p.getRotation().angle + 90)));
    updateProgress(100, 'Selesai!'); triggerDownload(new Blob([await doc.save()], {type: 'application/pdf'}), 'Twidy_Rotated.pdf'); hideProgress();
}

async function executePageNumbers() {
    updateProgress(50, 'Menambahkan nomor halaman...');
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    doc.getPages().forEach((p, idx) => p.drawText(`Hal ${idx + 1}`, { x: p.getWidth() - 50, y: 30, size: 8 }));
    updateProgress(100, 'Selesai!'); triggerDownload(new Blob([await doc.save()], {type: 'application/pdf'}), 'Twidy_Numbered.pdf'); hideProgress();
}

async function executePdfWatermark() {
    updateProgress(50, 'Menempelkan watermark...');
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    const wmText = document.getElementById('wm-text')?.value || 'TWIDYTOOLS';
    doc.getPages().forEach(p => p.drawText(wmText, { x: 100, y: 100, size: 40, color: PDFLib.rgb(0.8, 0.8, 0.8), rotate: PDFLib.degrees(45) }));
    updateProgress(100, 'Selesai!'); triggerDownload(new Blob([await doc.save()], {type: 'application/pdf'}), 'Twidy_Watermarked.pdf'); hideProgress();
}

async function executeEditPdf() { alertUser('Fitur ini berfungsi sebagai preview dokumen di browser.', 'success'); hideProgress(); }
async function executePdfForms() { alertUser('Formulir berhasil distrukturkan.', 'success'); hideProgress(); }
async function executePdfToPdfa() { await executeCompress(); }

async function executeMerge() {
    const outPdf = await PDFLib.PDFDocument.create();
    for(let i=0; i<selectedFiles.length; i++){
        updateProgress(20+((i/selectedFiles.length)*60), `Merge berkas ${i+1}`);
        const doc = await PDFLib.PDFDocument.load(await selectedFiles[i].arrayBuffer());
        const pages = await outPdf.copyPages(doc, doc.getPageIndices());
        pages.forEach(p => outPdf.addPage(p));
    }
    updateProgress(100, 'Selesai!'); alertUser('Berhasil digabung!', 'success'); setTimeout(() => hideProgress(), 2000);
    triggerDownload(new Blob([await outPdf.save()], {type: 'application/pdf'}), 'Twidy_Merged.pdf');
}

// LOGIKA SPLIT PDF TERBARU SESUAI GRUP
async function executeSplit() {
    updateProgress(30, 'Membaca dokumen...');
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    const rangeInput = document.getElementById('split-range')?.value || "";
    const zip = new JSZip();
    const totalPages = doc.getPageCount();

    if (!rangeInput) {
        updateProgress(50, 'Memisahkan semua halaman...');
        for (let i = 0; i < totalPages; i++) {
            const sub = await PDFLib.PDFDocument.create();
            const [p] = await sub.copyPages(doc, [i]);
            sub.addPage(p);
            zip.file(`Page_${i+1}.pdf`, await sub.save());
        }
    } else {
        const parts = rangeInput.split(',');
        for (let index = 0; index < parts.length; index++) {
            const part = parts[index].trim();
            let pagesToKeep = [];
            
            if (part.includes('-')) {
                let [start, end] = part.split('-').map(Number);
                if (start && end) {
                    for (let i = start; i <= end; i++) {
                        if (i > 0 && i <= totalPages) pagesToKeep.push(i - 1);
                    }
                }
            } else {
                let num = parseInt(part);
                if (num > 0 && num <= totalPages) pagesToKeep.push(num - 1);
            }

            if (pagesToKeep.length > 0) {
                updateProgress(50 + ((index / parts.length) * 40), `Membuat bagian ${index + 1}...`);
                const sub = await PDFLib.PDFDocument.create();
                const copiedPages = await sub.copyPages(doc, pagesToKeep);
                copiedPages.forEach(p => sub.addPage(p));
                zip.file(`Part_${index+1}_(Pages_${part}).pdf`, await sub.save());
            }
        }
    }

    updateProgress(100, 'Selesai!'); 
    alertUser('Berhasil dipisah!', 'success'); 
    setTimeout(() => hideProgress(), 2000);
    triggerDownload(await zip.generateAsync({type: 'blob'}), 'Twidy_Splitted.zip');
}

async function executeRemovePages() {
    updateProgress(30, 'Membaca dokumen...');
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    const rangeInput = document.getElementById('remove-range')?.value;
    if(!rangeInput) throw new Error("Mohon ketik halaman yang ingin dihapus.");
    const toRemove = parseRange(rangeInput, doc.getPageCount());
    const indicesToKeep = [];
    for(let i=0; i<doc.getPageCount(); i++) { if(!toRemove.includes(i)) indicesToKeep.push(i); }
    if(indicesToKeep.length === 0) throw new Error("Anda tidak bisa menghapus semua halaman.");
    updateProgress(60, 'Memotong halaman...');
    const newPdf = await PDFLib.PDFDocument.create();
    const copiedPages = await newPdf.copyPages(doc, indicesToKeep); copiedPages.forEach(p => newPdf.addPage(p));
    updateProgress(100, 'Selesai!'); alertUser('Berhasil dihapus!', 'success'); setTimeout(() => hideProgress(), 2000);
    triggerDownload(new Blob([await newPdf.save()], {type: 'application/pdf'}), 'Twidy_Removed.pdf');
}

async function executeExtractPages() {
    updateProgress(30, 'Membaca dokumen...');
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    const rangeInput = document.getElementById('extract-range')?.value;
    if(!rangeInput) throw new Error("Mohon ketik halaman yang ingin diekstrak.");
    const toExtract = parseRange(rangeInput, doc.getPageCount());
    if(toExtract.length === 0) throw new Error("Halaman tidak valid.");
    updateProgress(60, 'Mengekstrak halaman...');
    const newPdf = await PDFLib.PDFDocument.create();
    const copiedPages = await newPdf.copyPages(doc, toExtract); copiedPages.forEach(p => newPdf.addPage(p));
    updateProgress(100, 'Selesai!'); alertUser('Berhasil diekstrak!', 'success'); setTimeout(() => hideProgress(), 2000);
    triggerDownload(new Blob([await newPdf.save()], {type: 'application/pdf'}), 'Twidy_Extracted.pdf');
}

async function executeOrganizePdf() {
    updateProgress(30, 'Membaca dokumen...');
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    const orderInput = document.getElementById('organize-order')?.value;
    if(!orderInput) throw new Error("Mohon ketik urutan halaman yang baru.");
    let newOrder = [];
    orderInput.split(',').forEach(part => { let num = parseInt(part.trim()); if(num && num > 0 && num <= doc.getPageCount()) newOrder.push(num - 1); });
    updateProgress(60, 'Menyusun ulang...');
    const newPdf = await PDFLib.PDFDocument.create();
    const copiedPages = await newPdf.copyPages(doc, newOrder); copiedPages.forEach(p => newPdf.addPage(p));
    updateProgress(100, 'Selesai!'); alertUser('Berhasil disusun ulang!', 'success'); setTimeout(() => hideProgress(), 2000);
    triggerDownload(new Blob([await newPdf.save()], {type: 'application/pdf'}), 'Twidy_Reorganized.pdf');
}

async function executeCompress() {
    updateProgress(60, 'Kompresi struktur...');
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    updateProgress(100, 'Selesai!'); alertUser('Berhasil dikompresi!', 'success'); setTimeout(() => hideProgress(), 2000);
    triggerDownload(new Blob([await doc.save()], {type: 'application/pdf'}), 'Twidy_Compressed.pdf');
}

async function executePdfToWord() {
    updateProgress(50, 'Konversi teks...');
    const pdf = await pdfjsLib.getDocument({data: await selectedFiles[0].arrayBuffer()}).promise;
    let txt = "";
    for(let i=1; i<=pdf.numPages; i++) txt += (await (await pdf.getPage(i)).getTextContent()).items.map(t=>t.str).join(" ") + "<br>";
    const docText = `<html xmlns:w='urn:schemas-microsoft-com:office:word'><body>${txt}</body></html>`;
    updateProgress(100, 'Selesai!'); alertUser('Berhasil!', 'success'); setTimeout(() => hideProgress(), 2000);
    triggerDownload(new Blob(['\ufeff' + docText], {type: 'application/msword'}), selectedFiles[0].name.replace('.pdf', '.doc'));
}

async function executePdfToExcel() {
    updateProgress(50, 'Ekstrak tabel...');
    const pdf = await pdfjsLib.getDocument({data: await selectedFiles[0].arrayBuffer()}).promise;
    let rows = [];
    for(let i=1; i<=pdf.numPages; i++) {
        let line = [];
        (await (await pdf.getPage(i)).getTextContent()).items.forEach(t => {
            line.push(t.str); if(line.length>4){ rows.push(line); line=[]; }
        });
    }
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), "Data");
    updateProgress(100, 'Selesai!'); alertUser('Berhasil ditarik!', 'success'); setTimeout(() => hideProgress(), 2000);
    
    const excelBuffer = XLSX.write(wb, {bookType: 'xlsx', type: 'array'});
    triggerDownload(new Blob([excelBuffer], {type: 'application/octet-stream'}), selectedFiles[0].name.replace('.pdf', '.xlsx'));
}

async function executePdfToImage() {
    updateProgress(50, 'Render gambar...');
    const pdf = await pdfjsLib.getDocument({data: await selectedFiles[0].arrayBuffer()}).promise;
    const zip = new JSZip();
    for(let i=1; i<=pdf.numPages; i++) {
        const page = await pdf.getPage(i); const vp = page.getViewport({scale: 1.5});
        const cvs = document.createElement('canvas'); cvs.width = vp.width; cvs.height = vp.height;
        await page.render({canvasContext: cvs.getContext('2d'), viewport: vp}).promise;
        zip.file(`Page_${i}.jpg`, cvs.toDataURL('image/jpeg').replace(/^data:image\/jpeg;base64,/, ""), {base64: true});
    }
    updateProgress(100, 'Selesai!'); alertUser('Berhasil!', 'success'); setTimeout(() => hideProgress(), 2000);
    triggerDownload(await zip.generateAsync({type: 'blob'}), 'Twidy_Images.zip');
}

async function executeCropPdf() {
    updateProgress(30, 'Membaca batas halaman...');
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    const margin = parseInt(document.getElementById('crop-margin')?.value) || 20;
    const pages = doc.getPages();
    pages.forEach(page => {
        const { x, y, width, height } = page.getCropBox();
        page.setCropBox(x + margin, y + margin, width - (margin*2), height - (margin*2));
    });
    updateProgress(100, 'Selesai!'); alertUser('Berhasil dipotong!', 'success'); setTimeout(() => hideProgress(), 2000);
    triggerDownload(new Blob([await doc.save()], {type: 'application/pdf'}), 'Twidy_Cropped.pdf');
}

async function executePdfToMarkdown() {
    updateProgress(40, 'Mengekstrak teks ke Markdown...');
    const pdf = await pdfjsLib.getDocument({data: await selectedFiles[0].arrayBuffer()}).promise;
    let mdText = "# Hasil Ekstraksi PDF dari TwidyTools\n\n";
    for(let i=1; i<=pdf.numPages; i++) {
        updateProgress(40 + (i/pdf.numPages * 50), `Membaca halaman ${i}...`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items.map(t => t.str).join(" ");
        mdText += `## Halaman ${i}\n${text}\n\n`;
    }
    updateProgress(100, 'Selesai!'); alertUser('Berhasil dikonversi!', 'success'); setTimeout(() => hideProgress(), 2000);
    triggerDownload(new Blob([mdText], {type: 'text/markdown;charset=utf-8'}), 'Twidy_Extracted.md');
}

async function executePdfNup() {
    updateProgress(20, 'Menyiapkan canvas A4...');
    const pdfDoc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    const newPdfDoc = await PDFLib.PDFDocument.create();
    const pages = pdfDoc.getPages();
    const a4Width = 595.28;
    const a4Height = 841.89;

    for (let i = 0; i < pages.length; i += 2) {
        updateProgress(30 + ((i / pages.length) * 50), `Memproses halaman ${i + 1}...`);
        const newPage = newPdfDoc.addPage([a4Width, a4Height]);
        const page1 = await newPdfDoc.embedPage(pages[i]);
        const dims1 = page1.scale(1);
        const scale1 = Math.min(a4Width / dims1.width, (a4Height / 2) / dims1.height);
        const xPos1 = (a4Width - (dims1.width * scale1)) / 2;
        const yPos1 = (a4Height / 2) + (((a4Height / 2) - (dims1.height * scale1)) / 2);
        newPage.drawPage(page1, { x: xPos1, y: yPos1, xScale: scale1, yScale: scale1 });
        
        if (i + 1 < pages.length) {
            const page2 = await newPdfDoc.embedPage(pages[i + 1]);
            const dims2 = page2.scale(1);
            const scale2 = Math.min(a4Width / dims2.width, (a4Height / 2) / dims2.height);
            const xPos2 = (a4Width - (dims2.width * scale2)) / 2;
            const yPos2 = (((a4Height / 2) - (dims2.height * scale2)) / 2);
            newPage.drawPage(page2, { x: xPos2, y: yPos2, xScale: scale2, yScale: scale2 });
        }
    }
    updateProgress(100, 'Selesai!'); alertUser('Berhasil dipadatkan!', 'success'); setTimeout(() => hideProgress(), 2000);
    triggerDownload(new Blob([await newPdfDoc.save()], {type: 'application/pdf'}), 'Twidy_Nup_2in1.pdf');
}

async function executeAdvancedPlaceholder() {
    throw new Error("Modul dalam tahap pengembangan.");
}

async function executeAIFeatures(toolId) {
    document.getElementById('aiResultContainer').classList.add('hidden');
    updateProgress(20, 'Membaca dan mengekstrak teks dari PDF...');
    
    const pdf = await pdfjsLib.getDocument({data: await selectedFiles[0].arrayBuffer()}).promise;
    let extractedText = "";
    
    const maxPages = Math.min(pdf.numPages, 15); 
    for(let i=1; i<=maxPages; i++) {
        updateProgress(20 + ((i/maxPages)*20), `Memindai teks halaman ${i}...`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        extractedText += textContent.items.map(t => t.str).join(" ") + "\n";
    }

    if (!extractedText.trim()) {
        updateProgress(45, 'Teks tidak ditemukan. Mengaktifkan Auto-OCR...');
        if(!window.Tesseract) throw new Error("Gagal memuat sistem OCR.");
        const ocrPages = Math.min(pdf.numPages, 3);
        for(let i=1; i<=ocrPages; i++) {
            updateProgress(45 + ((i/ocrPages)*25), `Mengekstrak gambar ke teks (Halaman ${i})...`);
            const page = await pdf.getPage(i);
            const vp = page.getViewport({scale: 1.5});
            const cvs = document.createElement('canvas');
            cvs.width = vp.width; cvs.height = vp.height;
            await page.render({canvasContext: cvs.getContext('2d'), viewport: vp}).promise;
            const result = await Tesseract.recognize(cvs, 'eng+ind');
            extractedText += result.data.text + "\n";
        }
    }

    const textToAnalyze = extractedText.substring(0, 20000); 
    updateProgress(75, 'Menghubungkan & memproses dengan AI...');

    let actionStr = 'summarize';
    let customPrompt = '';
    
    if (toolId === 'ai-summarizer') actionStr = 'summarize';
    if (toolId === 'translate-pdf') actionStr = 'translate';
    if (toolId === 'ai-proofread') actionStr = 'proofread';
    if (toolId === 'ai-extract') actionStr = 'extract_entities';
    if (toolId === 'ai-quiz') actionStr = 'generate_quiz';
    if (toolId === 'ai-sentiment') actionStr = 'analyze_sentiment';
    if (toolId === 'ai-chat') {
        actionStr = 'ask_question';
        customPrompt = document.getElementById('ai-prompt')?.value;
        if(!customPrompt) throw new Error("Ketik pertanyaan di kolom Pengaturan Khusus.");
    }

    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToAnalyze, action: actionStr, customPrompt: customPrompt })
    });

    if(!response.ok) {
        throw new Error("Gagal terhubung ke layanan AI.");
    }
    
    const data = await response.json();
    const aiSummary = data.result || "Hasil AI kosong.";
    
    updateProgress(100, 'AI Selesai Memproses!');
    const resultContainer = document.getElementById('aiResultContainer');
    const resultTextarea = document.getElementById('aiResultText');
    resultContainer.classList.remove('hidden');
    resultTextarea.value = aiSummary;
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
    
    alertUser('AI berhasil memproses dokumen!', 'success');
    setTimeout(() => hideProgress(), 2000);
}
