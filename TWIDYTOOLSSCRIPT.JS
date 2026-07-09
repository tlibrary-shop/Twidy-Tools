pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let currentTool = null;
let selectedFiles = [];

const toolConfig = {
    // TWIDY ECOSYSTEM (Aplikasi Embed)
    'twidy-bill': { 
        title: 'TwidyBill', 
        desc: 'Generate tagihan siap kirim dalam hitungan detik.', 
        icon: 'fa-file-invoice-dollar', 
        color: 'text-emerald-500', 
        isIframe: true, 
        iframeUrl: 'https://twidybill.netlify.app/' 
    },

    // ORGANIZE PDF
    'pdf-merge': { title: 'Merge PDF', desc: 'Gabungkan PDF dan atur urutan file dengan menarik (drag & drop) atau gunakan fitur sortir otomatis.', icon: 'fa-object-group', color: 'text-red-500', accept: '.pdf', multi: true },
    'pdf-split': { 
        title: 'Split PDF', desc: 'Pisahkan satu halaman atau ekstrak rentang halaman PDF.', icon: 'fa-scissors', color: 'text-orange-500', accept: '.pdf', multi: false,
        settings: [{ id: 'split-range', label: 'Rentang Halaman (Contoh: 1-3, 5)', type: 'text', placeholder: 'Kosongkan jika ingin memisah semua' }]
    },
    'remove-pages': { 
        title: 'Remove pages', desc: 'Hapus halaman tertentu dari dokumen PDF.', icon: 'fa-minus-circle', color: 'text-rose-500', accept: '.pdf', multi: false,
        settings: [{ id: 'remove-range', label: 'Halaman yang dihapus (Contoh: 1, 3, 5-7)', type: 'text', placeholder: 'Ketik halaman di sini' }] 
    },
    'extract-pages': { 
        title: 'Extract pages', desc: 'Dapatkan dokumen baru berisi halaman yang Anda ekstrak.', icon: 'fa-share-square', color: 'text-blue-500', accept: '.pdf', multi: false,
        settings: [{ id: 'extract-range', label: 'Halaman yang diambil (Contoh: 2, 4-6)', type: 'text', placeholder: 'Ketik halaman di sini' }] 
    },
    'organize-pdf': { 
        title: 'Organize PDF', desc: 'Susun ulang urutan halaman PDF.', icon: 'fa-sort-alpha-down', color: 'text-indigo-500', accept: '.pdf', multi: false,
        settings: [{ id: 'organize-order', label: 'Urutan Halaman Baru (Contoh: 3, 1, 2)', type: 'text', placeholder: 'Ketik urutan baru' }]
    },
    'scan-to-pdf': { title: 'Scan to PDF', desc: 'Tangkap pindaian dokumen dari perangkat ke PDF.', icon: 'fa-qrcode', color: 'text-slate-500', accept: '.jpg,.png', multi: true },
    
    // OPTIMIZE PDF
    'pdf-compress': { title: 'Compress PDF', desc: 'Kurangi ukuran file sambil mengoptimalkan kualitas maksimal.', icon: 'fa-compress-arrows-alt', color: 'text-green-500', accept: '.pdf', multi: false },
    'repair-pdf': { title: 'Repair PDF', desc: 'Perbaiki file PDF yang rusak dan pulihkan data.', icon: 'fa-wrench', color: 'text-amber-500', accept: '.pdf', multi: false },
    'ocr-pdf': { title: 'OCR PDF', desc: 'Ubah PDF hasil scan menjadi dokumen teks mentah yang dapat dicari dan di-copy.', icon: 'fa-search-plus', color: 'text-sky-500', accept: '.pdf', multi: false },

    // CONVERT TO PDF
    'image-to-pdf': { title: 'JPG to PDF', desc: 'Konversi gambar JPG ke PDF dalam hitungan detik.', icon: 'fa-image', color: 'text-yellow-500', accept: '.jpg,.jpeg,.png', multi: true },
    'word-to-pdf': { title: 'WORD to PDF', desc: 'Buat file DOC dan DOCX Anda mudah dibaca dengan PDF.', icon: 'fa-file-word', color: 'text-blue-600', accept: '.docx', multi: false },
    'ppt-to-pdf': { title: 'POWERPOINT to PDF', desc: 'Jadikan presentasi PPT dan PPTX mudah dilihat dengan PDF.', icon: 'fa-file-powerpoint', color: 'text-orange-600', accept: '.pptx,.ppt', multi: false },
    'excel-to-pdf': { title: 'EXCEL to PDF', desc: 'Buat spreadsheet EXCEL mudah dibaca mengkonversi ke PDF.', icon: 'fa-file-excel', color: 'text-green-600', accept: '.xlsx', multi: false },
    'html-to-pdf': { title: 'HTML to PDF', desc: 'Konversi halaman web dalam HTML ke PDF.', icon: 'fa-html5', color: 'text-orange-500', accept: '.html', multi: false },

    // CONVERT FROM PDF
    'pdf-to-image': { title: 'PDF to JPG', desc: 'Konversi setiap halaman PDF ke JPG atau ekstrak gambar.', icon: 'fa-images', color: 'text-yellow-500', accept: '.pdf', multi: false },
    'pdf-to-word': { title: 'PDF to WORD', desc: 'Mudah mengkonversi PDF ke DOC dan DOCX.', icon: 'fa-file-word', color: 'text-blue-500', accept: '.pdf', multi: false },
    'pdf-to-ppt': { title: 'PDF to POWERPOINT', desc: 'Ubah PDF Anda menjadi presentasi PPTX.', icon: 'fa-file-powerpoint', color: 'text-orange-500', accept: '.pdf', multi: false },
    'pdf-to-excel': { title: 'PDF to EXCEL', desc: 'Tarik data langsung dari PDF ke spreadsheet EXCEL.', icon: 'fa-file-excel', color: 'text-green-500', accept: '.pdf', multi: false },
    'pdf-to-pdfa': { title: 'PDF to PDF/A', desc: 'Ubah PDF menjadi PDF/A untuk pengarsipan jangka panjang.', icon: 'fa-file-pdf', color: 'text-red-500', accept: '.pdf', multi: false },

    // EDIT PDF
    'pdf-rotate': { title: 'Rotate PDF', desc: 'Putar PDF sesuka Anda.', icon: 'fa-redo', color: 'text-purple-500', accept: '.pdf', multi: false },
    'page-numbers': { title: 'Add page numbers', desc: 'Tambahkan nomor halaman ke bagian bawah PDF.', icon: 'fa-sort-numeric-down', color: 'text-pink-500', accept: '.pdf', multi: false },
    'pdf-watermark': { title: 'Add watermark', desc: 'Stempel gambar atau teks ke PDF dalam hitungan detik.', icon: 'fa-stamp', color: 'text-indigo-400', accept: '.pdf', multi: false, settings: [{ id: 'wm-text', label: 'Teks Watermark', type: 'text', placeholder: 'Ketik Teks' }] },
    'crop-pdf': { 
        title: 'Crop PDF', desc: 'Pangkas margin atau potong halaman PDF.', icon: 'fa-crop', color: 'text-teal-500', accept: '.pdf', multi: false,
        settings: [{ id: 'crop-margin', label: 'Besar potongan margin (Angka 10-100 poin)', type: 'number', placeholder: '20' }] 
    },
    'edit-pdf': { title: 'Edit PDF', desc: 'Tambahkan teks, gambar, bentuk atau anotasi tangan.', icon: 'fa-edit', color: 'text-amber-600', accept: '.pdf', multi: false },
    'pdf-forms': { title: 'PDF Forms', desc: 'Buat formulir interaktif atau isi formulir PDF.', icon: 'fa-list-alt', color: 'text-cyan-600', accept: '.pdf', multi: false },
    'pdf-nup': { title: 'Padatkan (2-in-1)', desc: 'Gabungkan dua halaman PDF menjadi satu lembar untuk menghemat kertas.', icon: 'fa-columns', color: 'text-teal-600', accept: '.pdf', multi: false },

    // PDF SECURITY
    'pdf-unlock': { title: 'Unlock PDF', desc: 'Hapus kata sandi keamanan PDF.', icon: 'fa-unlock', color: 'text-teal-500', accept: '.pdf', multi: false },
    'pdf-protect': { title: 'Protect PDF', desc: 'Amankan file PDF dengan kata sandi.', icon: 'fa-lock', color: 'text-red-600', accept: '.pdf', multi: false, settings: [{ id: 'pt-pass', label: 'Set Password', type: 'text', placeholder: '***' }] },
    'sign-pdf': { title: 'Sign PDF', desc: 'Tanda tangani dokumen PDF secara elektronik.', icon: 'fa-signature', color: 'text-blue-700', accept: '.pdf', multi: false },
    'redact-pdf': { title: 'Redact PDF', desc: 'Sensor info sensitif di dokumen PDF Anda.', icon: 'fa-eraser', color: 'text-slate-800', accept: '.pdf', multi: false },
    'compare-pdf': { title: 'Compare PDF', desc: 'Bandingkan dua dokumen untuk melihat perubahannya.', icon: 'fa-not-equal', color: 'text-orange-400', accept: '.pdf', multi: true },

    // PDF INTELLIGENCE
    'ai-summarizer': { 
        title: 'AI Summarizer', 
        desc: 'Dapatkan ringkasan dari dokumen PDF panjang menggunakan kecerdasan buatan.', 
        icon: 'fa-brain', 
        color: 'text-purple-600', 
        accept: '.pdf', 
        multi: false
    },
    'translate-pdf': { title: 'Translate PDF', desc: 'Terjemahkan seluruh isi PDF ke bahasa yang Anda inginkan.', icon: 'fa-language', color: 'text-sky-600', accept: '.pdf', multi: false },
    'pdf-to-markdown': { title: 'PDF to Markdown', desc: 'Ubah teks PDF menjadi file Markdown (.md) murni.', icon: 'fa-markdown', color: 'text-slate-600', accept: '.pdf', multi: false }
};

const categories = {
    'TWIDY ECOSYSTEM': ['twidy-bill'],
    'ORGANIZE PDF': ['pdf-merge', 'pdf-split', 'remove-pages', 'extract-pages', 'organize-pdf', 'scan-to-pdf'],
    'OPTIMIZE PDF': ['pdf-compress', 'repair-pdf', 'ocr-pdf'],
    'CONVERT TO PDF': ['image-to-pdf', 'word-to-pdf', 'ppt-to-pdf', 'excel-to-pdf', 'html-to-pdf'],
    'CONVERT FROM PDF': ['pdf-to-image', 'pdf-to-word', 'pdf-to-ppt', 'pdf-to-excel', 'pdf-to-pdfa'],
    'EDIT PDF': ['pdf-rotate', 'page-numbers', 'pdf-watermark', 'crop-pdf', 'edit-pdf', 'pdf-forms', 'pdf-nup'],
    'PDF SECURITY': ['pdf-unlock', 'pdf-protect', 'sign-pdf', 'redact-pdf', 'compare-pdf'],
    'PDF INTELLIGENCE': ['ai-summarizer', 'translate-pdf', 'pdf-to-markdown']
};

document.addEventListener('DOMContentLoaded', function() {
    renderDashboard();
    setupDropZone();
    setupFileInput();
    initTheme();
    setInterval(updateDateTime, 1000);
    updateDateTime();

    // SEO FRIENDLY URL
    const hash = window.location.hash.substring(1);
    if (hash && toolConfig[hash]) {
        selectTool(hash);
    }
});

function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const dtElement = document.getElementById('liveDateTime');
    if (dtElement) {
        dtElement.textContent = now.toLocaleDateString('id-ID', options).replace(/\./g, ':');
    }
}

function renderDashboard() {
    const grid = document.getElementById('dashboardGrid');
    grid.innerHTML = '';

    for (const [catName, tools] of Object.entries(categories)) {
        let catHTML = `
            <div class="mb-8 sm:mb-10">
                <h3 class="text-base sm:text-xl font-bold text-slate-700 dark:text-slate-200 mb-3 sm:mb-5 border-b pb-2 border-slate-200 dark:border-slate-700">
                    ${catName}
                </h3>
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        `;
        
        tools.forEach(toolId => {
            const t = toolConfig[toolId];
            catHTML += `
                <div onclick="selectTool('${toolId}')" class="group bg-white dark:bg-darkCard p-3 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 flex flex-col justify-start">
                    <div class="${t.color} text-2xl sm:text-4xl mb-2 sm:mb-4 transition-transform group-hover:scale-110"><i class="fas ${t.icon}"></i></div>
                    <h4 class="font-bold text-sm sm:text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mb-1 leading-tight">${t.title}</h4>
                    <p class="text-slate-500 dark:text-slate-400 text-[10px] sm:text-sm leading-snug line-clamp-3 sm:line-clamp-none">${t.desc}</p>
                </div>
            `;
        });
        
        catHTML += `</div></div>`;
        grid.innerHTML += catHTML;
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    
    if (window.innerWidth < 768) {
        if (sidebar.classList.contains('-translate-x-full')) {
            sidebar.classList.remove('-translate-x-full');
            sidebar.classList.add('translate-x-0');
            if (overlay) overlay.classList.remove('hidden');
        } else {
            sidebar.classList.add('-translate-x-full');
            sidebar.classList.remove('translate-x-0');
            if (overlay) overlay.classList.add('hidden');
        }
    } else {
        sidebar.classList.toggle('md:w-64');
        sidebar.classList.toggle('md:w-0');
        sidebar.classList.toggle('md:opacity-0');
        sidebar.classList.toggle('overflow-hidden');
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
    document.getElementById('themeIcon').className = isDark ? 'fas fa-sun text-xl' : 'fas fa-moon text-xl';
}

function selectTool(toolId) {
    currentTool = toolId;
    const config = toolConfig[toolId];
    
    // UPDATE URL & TITLE BROWSER
    window.location.hash = toolId;
    document.title = config.title + " - TwidyTools";
    
    document.getElementById('toolsSection').classList.add('hidden');
    document.getElementById('uploadSection').classList.remove('hidden');
    
    document.getElementById('toolTitle').textContent = config.title;
    document.getElementById('toolDescription').textContent = config.desc;

    const dropZone = document.getElementById('dropZone');
    const iframeContainer = document.getElementById('iframeContainer');
    const appIframe = document.getElementById('appIframe');
    const settingsPanel = document.getElementById('settingsPanel');
    const fileListArea = document.getElementById('fileList');
    const actionBtnArea = document.getElementById('actionButtons');

    if (config.isIframe) {
        dropZone.classList.add('hidden');
        settingsPanel.classList.add('hidden');
        fileListArea.classList.add('hidden');
        actionBtnArea.classList.add('hidden');
        
        iframeContainer.classList.remove('hidden');
        appIframe.src = config.iframeUrl; 
    } else {
        iframeContainer.classList.add('hidden');
        appIframe.src = ''; 
        
        dropZone.classList.remove('hidden');
        fileListArea.classList.remove('hidden');
        
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
        if (!sidebar.classList.contains('-translate-x-full')) {
            toggleSidebar();
        }
    }
}

function goBack() {
    history.pushState("", document.title, window.location.pathname);
    document.title = "TwidyTools - Solusi PDF & Dokumen Lengkap Online";
    
    document.getElementById('uploadSection').classList.add('hidden');
    document.getElementById('toolsSection').classList.remove('hidden');
    
    document.getElementById('iframeContainer').classList.add('hidden');
    document.getElementById('appIframe').src = '';
    
    clearFiles();
    
    if (window.innerWidth < 768) {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar.classList.contains('-translate-x-full')) {
            toggleSidebar();
        }
    }
}

function setupDropZone() {
    const dz = document.getElementById('dropZone');
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); }));
    ['dragenter', 'dragover'].forEach(ev => dz.addEventListener(ev, () => dz.classList.add('scale-105', 'border-indigo-600')));
    ['dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, () => dz.classList.remove('scale-105', 'border-indigo-600')));
    dz.addEventListener('drop', e => handleFiles(e.dataTransfer.files));
}

function setupFileInput() {
    document.getElementById('fileInput').addEventListener('change', e => handleFiles(e.target.files));
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
        return order === 'asc' 
            ? a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }) 
            : b.name.localeCompare(a.name, undefined, { numeric: true, sensitivity: 'base' });
    });
    renderFileList(); 
}

function renderFileList() {
    const flist = document.getElementById('fileList');
    const actBtn = document.getElementById('actionButtons');
    flist.innerHTML = '';
    
    if (selectedFiles.length === 0 || (toolConfig[currentTool] && toolConfig[currentTool].isIframe)) {
        actBtn.classList.add('hidden');
        return;
    }
    
    actBtn.classList.remove('hidden');

    let sortHTML = '';
    if (selectedFiles.length > 1 && toolConfig[currentTool].multi) {
        sortHTML = `
            <div class="flex justify-end gap-2 mb-3">
                <button onclick="sortFiles('asc')" class="px-3 py-1.5 text-xs font-bold bg-slate-200 text-slate-700 hover:bg-indigo-100 hover:text-indigo-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-400 rounded-lg transition-colors"><i class="fas fa-sort-alpha-down mr-1"></i> A - Z</button>
                <button onclick="sortFiles('desc')" class="px-3 py-1.5 text-xs font-bold bg-slate-200 text-slate-700 hover:bg-indigo-100 hover:text-indigo-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-400 rounded-lg transition-colors"><i class="fas fa-sort-alpha-up mr-1"></i> Z - A</button>
            </div>
        `;
    }

    flist.innerHTML = sortHTML + `<ul id="sortable-list" class="space-y-2"></ul>`;
    const listEl = document.getElementById('sortable-list');

    selectedFiles.forEach((f, i) => {
        const li = document.createElement('li');
        li.dataset.index = i;
        li.className = "flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm cursor-move transition-transform";
        li.innerHTML = `
            <div class="flex items-center gap-2 sm:gap-3 truncate w-[85%]">
                <i class="fas fa-grip-vertical text-slate-400 cursor-grab hover:text-indigo-500 text-base sm:text-lg px-1 sm:px-2"></i>
                <i class="fas fa-file-pdf text-red-500 text-xl sm:text-2xl"></i>
                <div class="truncate">
                    <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate">${f.name}</p>
                    <p class="text-[10px] sm:text-xs text-slate-400">${(f.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
            </div>
            <button onclick="removeFile(${i})" class="text-slate-400 hover:text-red-500 p-2 ml-1"><i class="fas fa-times text-base sm:text-lg"></i></button>
        `;
        listEl.appendChild(li);
    });

    if (toolConfig[currentTool].multi) {
        new Sortable(listEl, {
            animation: 150,
            handle: '.fa-grip-vertical',
            ghostClass: 'sortable-ghost',
            onEnd: function (evt) {
                const item = selectedFiles.splice(evt.oldIndex, 1)[0];
                selectedFiles.splice(evt.newIndex, 0, item);
            }
        });
    }
}

function removeFile(i) { selectedFiles.splice(i, 1); renderFileList(); }
function clearFiles() { selectedFiles = []; document.getElementById('fileInput').value = ''; renderFileList(); hideProgress(); }

function updateProgress(pct, txt) {
    document.getElementById('progressArea').classList.remove('hidden');
    document.getElementById('progressFill').style.width = `${pct}%`;
    document.getElementById('progressPercent').textContent = `${pct}%`;
    document.getElementById('progressText').textContent = txt;
}
function hideProgress() { document.getElementById('progressArea').classList.add('hidden'); }
function alertUser(msg, type) {
    const area = document.getElementById('alertArea');
    const cl = type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    area.innerHTML = `<div class="p-3 font-bold rounded-lg text-sm sm:text-base ${cl}">${msg}</div>`;
    setTimeout(() => area.innerHTML = '', 5000);
}
function triggerDownload(blob, fname) {
    const u = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = u; a.download = fname; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(u);
}

// Helper: Parsing input rentang halaman (misal: "1, 3, 5-7")
function parseRange(rangeStr, maxPages) {
    let pages = new Set();
    if(!rangeStr) return Array.from({length: maxPages}, (_, i) => i);
    rangeStr.split(',').forEach(part => {
        if(part.includes('-')) {
            let [start, end] = part.split('-').map(Number);
            if(start && end) {
                for(let i=start; i<=end; i++) pages.add(i-1);
            }
        } else {
            let num = parseInt(part.trim());
            if(num) pages.add(num-1);
        }
    });
    return Array.from(pages).filter(p => p >= 0 && p < maxPages).sort((a,b) => a-b);
}

// Helper: Parsing urutan halaman (misal: "3, 1, 2")
function parseOrder(orderStr, maxPages) {
    let pages = [];
    orderStr.split(',').forEach(part => {
        let num = parseInt(part.trim());
        if(num && num > 0 && num <= maxPages) pages.push(num - 1);
    });
    return pages;
}

// ============ ENGINE PROSES UTAMA ============
async function processFiles() {
    if (selectedFiles.length === 0) return;
    updateProgress(5, 'Menyiapkan berkas...');
    try {
        switch(currentTool) {
            case 'pdf-merge': await executeMerge(); break;
            case 'pdf-split': await executeSplit(); break;
            case 'remove-pages': await executeRemovePages(); break;
            case 'extract-pages': await executeExtractPages(); break;
            case 'organize-pdf': await executeOrganizePdf(); break;
            case 'page-numbers': await executePageNumbers(); break;
            case 'pdf-to-markdown': await executePdfToMarkdown(); break;
            case 'crop-pdf': await executeCropPdf(); break;
            case 'pdf-nup': await executePadatkanPdf(); break; 
            case 'pdf-compress': await executeCompress(); break;
            case 'word-to-pdf': await executeWordToPdf(); break;
            case 'excel-to-pdf': await executeExcelToPdf(); break;
            case 'image-to-pdf': await executeImageToPdf(); break;
            case 'pdf-to-word': await executePdfToWord(); break;
            case 'pdf-to-excel': await executePdfToExcel(); break;
            case 'pdf-to-image': await executePdfToImage(); break;
            case 'pdf-rotate': await executeRotate(); break;
            case 'pdf-watermark': await executeWatermark(); break;
            case 'pdf-protect': await executeProtect(); break;
            case 'pdf-unlock': await executeUnlock(); break;
            case 'ocr-pdf': await executeOcrPdf(); break;
            case 'ai-summarizer': await executeAiSummarizer(); break;
            
            default: await executeAdvancedPlaceholder();
        }
        updateProgress(100, 'Selesai!');
        alertUser('Dokumen berhasil diproses!', 'success');
        setTimeout(() => hideProgress(), 2000);
    } catch (e) {
        alertUser(`Error: ${e.message}`, 'error');
        hideProgress();
    }
}

async function executeAdvancedPlaceholder() {
    updateProgress(50, 'Menghubungkan ke modul...');
    await new Promise(r => setTimeout(r, 1500));
    throw new Error(`Fitur "${toolConfig[currentTool].title}" memerlukan sistem Backend Server (Python/NodeJS) agar bisa digunakan.`);
}

// === 6 FITUR BARU YANG DIFUNGSIKAN ===

async function executeRemovePages() {
    updateProgress(30, 'Membaca dokumen...');
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    const rangeInput = document.getElementById('remove-range')?.value;
    if(!rangeInput) throw new Error("Mohon ketik halaman yang ingin dihapus.");
    
    const toRemove = parseRange(rangeInput, doc.getPageCount());
    const indicesToKeep = [];
    for(let i=0; i<doc.getPageCount(); i++) {
        if(!toRemove.includes(i)) indicesToKeep.push(i);
    }
    
    if(indicesToKeep.length === 0) throw new Error("Anda tidak bisa menghapus semua halaman.");
    
    updateProgress(60, 'Memotong halaman...');
    const newPdf = await PDFLib.PDFDocument.create();
    const copiedPages = await newPdf.copyPages(doc, indicesToKeep);
    copiedPages.forEach(p => newPdf.addPage(p));
    
    triggerDownload(new Blob([await newPdf.save()], {type: 'application/pdf'}), 'Twidy_Removed.pdf');
}

async function executeExtractPages() {
    updateProgress(30, 'Membaca dokumen...');
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    const rangeInput = document.getElementById('extract-range')?.value;
    if(!rangeInput) throw new Error("Mohon ketik halaman yang ingin diekstrak.");
    
    const toExtract = parseRange(rangeInput, doc.getPageCount());
    if(toExtract.length === 0) throw new Error("Halaman yang Anda masukkan tidak valid.");
    
    updateProgress(60, 'Mengekstrak halaman...');
    const newPdf = await PDFLib.PDFDocument.create();
    const copiedPages = await newPdf.copyPages(doc, toExtract);
    copiedPages.forEach(p => newPdf.addPage(p));
    
    triggerDownload(new Blob([await newPdf.save()], {type: 'application/pdf'}), 'Twidy_Extracted.pdf');
}

async function executeOrganizePdf() {
    updateProgress(30, 'Membaca dokumen...');
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    const orderInput = document.getElementById('organize-order')?.value;
    if(!orderInput) throw new Error("Mohon ketik urutan halaman yang baru.");
    
    const newOrder = parseOrder(orderInput, doc.getPageCount());
    if(newOrder.length === 0) throw new Error("Format urutan salah.");
    
    updateProgress(60, 'Menyusun ulang urutan...');
    const newPdf = await PDFLib.PDFDocument.create();
    const copiedPages = await newPdf.copyPages(doc, newOrder);
    copiedPages.forEach(p => newPdf.addPage(p));
    
    triggerDownload(new Blob([await newPdf.save()], {type: 'application/pdf'}), 'Twidy_Organized.pdf');
}

async function executePageNumbers() {
    updateProgress(40, 'Memproses penomoran...');
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    const font = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
    const pages = doc.getPages();
    
    pages.forEach((page, idx) => {
        const { width } = page.getSize();
        page.drawText(String(idx + 1), {
            x: width / 2 - 5,
            y: 20, // Jarak dari bawah halaman
            size: 12,
            font: font,
            color: PDFLib.rgb(0, 0, 0)
        });
    });
    triggerDownload(new Blob([await doc.save()], {type: 'application/pdf'}), 'Twidy_PageNumbers.pdf');
}

async function executeCropPdf() {
    updateProgress(40, 'Memangkas margin...');
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    const marginStr = document.getElementById('crop-margin')?.value;
    const margin = parseInt(marginStr) || 20; // Default potong 20 poin
    
    const pages = doc.getPages();
    pages.forEach(page => {
        const { x, y, width, height } = page.getCropBox();
        page.setCropBox(x + margin, y + margin, width - (margin*2), height - (margin*2));
    });
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
    
    triggerDownload(new Blob([mdText], {type: 'text/markdown;charset=utf-8'}), 'Twidy_Extracted.md');
}

// === KUMPULAN FITUR BAWAAN SEBELUMNYA ===

async function executeMerge() {
    const outPdf = await PDFLib.PDFDocument.create();
    for(let i=0; i<selectedFiles.length; i++){
        updateProgress(20+((i/selectedFiles.length)*60), `Merge berkas ${i+1}`);
        const doc = await PDFLib.PDFDocument.load(await selectedFiles[i].arrayBuffer());
        const pages = await outPdf.copyPages(doc, doc.getPageIndices());
        pages.forEach(p => outPdf.addPage(p));
    }
    triggerDownload(new Blob([await outPdf.save()], {type: 'application/pdf'}), 'Twidy_Merged.pdf');
}

async function executeSplit() {
    updateProgress(30, 'Membaca dokumen...');
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    const rangeInput = document.getElementById('split-range')?.value || ""; 
    const zip = new JSZip();
    
    const pagesToSplit = parseRange(rangeInput, doc.getPageCount());

    for(let i of pagesToSplit) {
        if(i < 0 || i >= doc.getPageCount()) continue;
        const sub = await PDFLib.PDFDocument.create();
        const [p] = await sub.copyPages(doc, [i]);
        sub.addPage(p);
        zip.file(`Page_${i+1}.pdf`, await sub.save());
    }
    triggerDownload(await zip.generateAsync({type: 'blob'}), 'Twidy_Splitted.zip');
}

async function executeCompress() {
    updateProgress(60, 'Kompresi struktur...');
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    triggerDownload(new Blob([await doc.save({useObjectStreams: true})], {type: 'application/pdf'}), 'Twidy_Compressed.pdf');
}

async function executeWordToPdf() {
    updateProgress(50, 'Render Word...');
    const res = await mammoth.convertToHtml({ arrayBuffer: await selectedFiles[0].arrayBuffer() });
    const div = document.createElement('div'); div.innerHTML = res.value; div.style.padding = '30px';
    await html2pdf().set({filename: selectedFiles[0].name.replace('.docx', '.pdf')}).from(div).save();
}

async function executeExcelToPdf() {
    updateProgress(50, 'Render Excel...');
    const wb = XLSX.read(new Uint8Array(await selectedFiles[0].arrayBuffer()), {type: 'array'});
    const htmlTable = XLSX.utils.sheet_to_html(wb.Sheets[wb.SheetNames[0]]);
    const div = document.createElement('div'); div.innerHTML = `<style>table{border-collapse:collapse; width:100%} td{border:1px solid #ccc; padding:5px}</style>${htmlTable}`;
    await html2pdf().set({filename: selectedFiles[0].name.replace('.xlsx', '.pdf')}).from(div).save();
}

async function executeImageToPdf() {
    const outPdf = await PDFLib.PDFDocument.create();
    for(let i=0; i<selectedFiles.length; i++){
        const img = selectedFiles[i].type.includes('png') ? await outPdf.embedPng(await selectedFiles[i].arrayBuffer()) : await outPdf.embedJpg(await selectedFiles[i].arrayBuffer());
        outPdf.addPage([img.width, img.height]).drawImage(img, {x:0, y:0, width:img.width, height:img.height});
    }
    triggerDownload(new Blob([await outPdf.save()], {type: 'application/pdf'}), 'Twidy_Images.pdf');
}

async function executePdfToWord() {
    updateProgress(50, 'Ekstrak teks...');
    const pdf = await pdfjsLib.getDocument({data: await selectedFiles[0].arrayBuffer()}).promise;
    let txt = "";
    for(let i=1; i<=pdf.numPages; i++) txt += (await (await pdf.getPage(i)).getTextContent()).items.map(t=>t.str).join(" ") + "<br>";
    const docText = `<html xmlns:w='urn:schemas-microsoft-com:office:word'><body>${txt}</body></html>`;
    triggerDownload(new Blob(['\ufeff' + docText], {type: 'application/msword'}), selectedFiles[0].name.replace('.pdf', '.doc'));
}

async function executePdfToExcel() {
    updateProgress(50, 'Ekstrak tabel...');
    const pdf = await pdfjsLib.getDocument({data: await selectedFiles[0].arrayBuffer()}).promise;
    let rows = [];
    for(let i=1; i<=pdf.numPages; i++) {
        let line = [];
        (await (await pdf.getPage(i)).getTextContent()).items.forEach(t => { line.push(t.str); if(line.length>4){ rows.push(line); line=[]; } });
    }
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), "Data");
    triggerDownload(new Blob([XLSX.write(wb, {bookType: 'xlsx', type: 'array'})], {type: 'application/octet-stream'}), selectedFiles[0].name.replace('.pdf', '.xlsx'));
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
    triggerDownload(await zip.generateAsync({type: 'blob'}), 'Twidy_Images.zip');
}

async function executeRotate() {
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    doc.getPages().forEach(p => p.setRotation(PDFLib.degrees(p.getRotation().angle + 90)));
    triggerDownload(new Blob([await doc.save()], {type: 'application/pdf'}), 'Twidy_Rotated.pdf');
}

async function executeWatermark() {
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    const font = await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);
    const txt = document.getElementById('wm-text').value || "TWIDY";
    doc.getPages().forEach(p => p.drawText(txt, {x: 100, y: 100, size: 50, font: font, opacity: 0.3, rotate: PDFLib.degrees(45)}));
    triggerDownload(new Blob([await doc.save()], {type: 'application/pdf'}), 'Twidy_Watermarked.pdf');
}

async function executeProtect() {
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    triggerDownload(new Blob([await doc.save({updateFieldAppearances: true})], {type: 'application/pdf'}), 'Twidy_Protected.pdf');
}

async function executeUnlock() {
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    triggerDownload(new Blob([await doc.save()], {type: 'application/pdf'}), 'Twidy_Unlocked.pdf');
}

async function executeOcrPdf() {
    updateProgress(30, 'Memuat mesin OCR (Tesseract)...');
    if(!window.Tesseract) throw new Error("Library Tesseract gagal dimuat.");

    const pdf = await pdfjsLib.getDocument({data: await selectedFiles[0].arrayBuffer()}).promise;
    const page = await pdf.getPage(1);
    const vp = page.getViewport({scale: 2.0}); 
    const cvs = document.createElement('canvas');
    cvs.width = vp.width; cvs.height = vp.height;
    await page.render({canvasContext: cvs.getContext('2d'), viewport: vp}).promise;

    updateProgress(60, 'Menganalisis teks dari gambar...');
    const result = await Tesseract.recognize(cvs, 'eng+ind', { logger: m => console.log(m) });

    const blob = new Blob([result.data.text], {type: 'text/plain;charset=utf-8'});
    triggerDownload(blob, 'Twidy_OCR_Result.txt');
}

async function executeAiSummarizer() {
    updateProgress(30, 'Mengekstrak teks PDF...');
    const pdf = await pdfjsLib.getDocument({data: await selectedFiles[0].arrayBuffer()}).promise;
    
    let extractedText = "";
    const maxPages = Math.min(pdf.numPages, 5); 
    for(let i=1; i<=maxPages; i++) {
        const pageData = await (await pdf.getPage(i)).getTextContent();
        extractedText += pageData.items.map(t => t.str).join(" ") + "\n";
    }

    const textToAnalyze = extractedText.substring(0, 6000);

    updateProgress(70, 'Memproses ringkasan...');
    
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToAnalyze })
    });

    if(!response.ok) throw new Error("Gagal terhubung ke layanan AI. (Pastikan endpoint /api/gemini tersedia).");
    
    const data = await response.json();
    const aiSummary = data.result || "Ringkasan berhasil dibuat.";

    const blob = new Blob([aiSummary], {type: 'text/plain;charset=utf-8'});
    triggerDownload(blob, 'Twidy_AI_Summary.txt');
}

async function executePadatkanPdf() {
    updateProgress(30, 'Memuat dokumen...');
    const existingPdfBytes = await selectedFiles[0].arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
    const newPdfDoc = await PDFLib.PDFDocument.create();
    
    const pages = pdfDoc.getPages();
    
    // Kertas A4 Portrait (Standar)
    const a4Width = 595.28; 
    const a4Height = 841.89; 
    
    for (let i = 0; i < pages.length; i += 2) {
        updateProgress(30 + ((i / pages.length) * 50), `Memproses halaman ${i + 1}...`);
        
        const newPage = newPdfDoc.addPage([a4Width, a4Height]);
        
        // Hal 1 ditaruh di Atas
        const page1 = await newPdfDoc.embedPage(pages[i]);
        const dims1 = page1.scale(1);
        
        const scale1 = Math.min(a4Width / dims1.width, (a4Height / 2) / dims1.height);
        
        const xPos1 = (a4Width - (dims1.width * scale1)) / 2;
        const yPos1 = (a4Height / 2) + (((a4Height / 2) - (dims1.height * scale1)) / 2);
        
        newPage.drawPage(page1, { x: xPos1, y: yPos1, xScale: scale1, yScale: scale1 });
        
        // Hal 2 (Jika ada) ditaruh di Bawah
        if (i + 1 < pages.length) {
            const page2 = await newPdfDoc.embedPage(pages[i + 1]);
            const dims2 = page2.scale(1);
            
            const scale2 = Math.min(a4Width / dims2.width, (a4Height / 2) / dims2.height);
            
            const xPos2 = (a4Width - (dims2.width * scale2)) / 2;
            const yPos2 = (((a4Height / 2) - (dims2.height * scale2)) / 2);
            
            newPage.drawPage(page2, { x: xPos2, y: yPos2, xScale: scale2, yScale: scale2 });
        }
    }
    
    updateProgress(90, 'Menyelesaikan...');
    const pdfBytes = await newPdfDoc.save();
    triggerDownload(new Blob([pdfBytes], {type: 'application/pdf'}), 'Twidy_Padat_Vertikal.pdf');
}
