pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let currentTool = null;
let selectedFiles = [];

const toolConfig = {
    // ECOSYSTEM
    'twidy-bill': { title: 'TwidyBill Maker', desc: 'Aplikasi pembuat invoice & tagihan otomatis.', icon: 'fa-file-invoice-dollar', color: 'text-emerald-500', isIframe: true, iframeUrl: 'https://twidybill.netlify.app/' },

    // AI INTELLIGENCE
    'ai-summarizer': { title: 'AI Summarizer', desc: 'Ringkas otomatis dokumen PDF Anda yang panjang.', icon: 'fa-brain', color: 'text-purple-600', accept: '.pdf', multi: false },
    'translate-pdf': { 
        title: 'Translate PDF', desc: 'Terjemahkan teks PDF ke bahasa yang Anda inginkan.', icon: 'fa-language', color: 'text-sky-500', accept: '.pdf', multi: false,
        settings: [{ id: 'target-lang', label: 'Bahasa Tujuan (Contoh: Inggris, Jawa, Jepang)', type: 'text', placeholder: 'Masukkan bahasa tujuan' }] 
    },
    'smart-extract': { 
        title: 'Smart Data Extract', desc: 'Tarik data spesifik (nama, nilai, dll) dari PDF acak.', icon: 'fa-filter', color: 'text-teal-500', accept: '.pdf', multi: false,
        settings: [{ id: 'extract-query', label: 'Data apa yang ingin diekstrak?', type: 'text', placeholder: 'Contoh: Ambil Nama dan NISN' }] 
    },
    'chat-pdf': { 
        title: 'Chat with PDF', desc: 'Tanya jawab seputar isi dokumen PDF Anda.', icon: 'fa-comments', color: 'text-indigo-400', accept: '.pdf', multi: false,
        settings: [{ id: 'chat-query', label: 'Pertanyaan Anda', type: 'text', placeholder: 'Contoh: Apa syarat utama dokumen ini?' }] 
    },

    // ORGANIZE PDF
    'pdf-merge': { title: 'Merge PDF', desc: 'Gabung & urutkan banyak file PDF.', icon: 'fa-object-group', color: 'text-red-500', accept: '.pdf', multi: true },
    'pdf-split': { title: 'Split PDF', desc: 'Pisah halaman PDF.', icon: 'fa-scissors', color: 'text-orange-500', accept: '.pdf', multi: false, settings: [{ id: 'split-range', label: 'Rentang Halaman (Contoh: 1-3, 5)', type: 'text', placeholder: 'Kosongkan jika semua' }] },
    'remove-pages': { title: 'Remove pages', desc: 'Hapus halaman.', icon: 'fa-minus-circle', color: 'text-rose-500', accept: '.pdf', multi: false, settings: [{ id: 'remove-range', label: 'Halaman Dihapus (Contoh: 1, 3)', type: 'text', placeholder: 'Ketik halaman' }] },
    'extract-pages': { title: 'Extract pages', desc: 'Ambil halaman tertentu jadi PDF baru.', icon: 'fa-share-square', color: 'text-blue-500', accept: '.pdf', multi: false, settings: [{ id: 'extract-range', label: 'Halaman Diambil (Contoh: 2, 4)', type: 'text', placeholder: 'Ketik halaman' }] },
    'organize-pdf': { title: 'Organize PDF', desc: 'Susun ulang posisi halaman PDF.', icon: 'fa-sort-alpha-down', color: 'text-indigo-500', accept: '.pdf', multi: false, settings: [{ id: 'organize-order', label: 'Urutan Baru (Contoh: 3, 1, 2)', type: 'text', placeholder: 'Ketik urutan baru' }] },
    'scan-to-pdf': { title: 'Scan to PDF', desc: 'Gabungkan gambar pindaian dari galeri/kamera ke PDF.', icon: 'fa-qrcode', color: 'text-slate-500', accept: '.jpg,.jpeg,.png', multi: true },

    // OPTIMIZE & CONVERT
    'pdf-compress': { title: 'Compress PDF', desc: 'Optimalkan ukuran dokumen tanpa mengurangi kualitas.', icon: 'fa-compress-arrows-alt', color: 'text-green-500', accept: '.pdf', multi: false },
    'ocr-pdf': { title: 'OCR PDF', desc: 'Ekstrak susunan teks tersembunyi dari PDF hasil scan.', icon: 'fa-search-plus', color: 'text-sky-500', accept: '.pdf', multi: false },
    'pdf-to-markdown': { title: 'PDF to Markdown', desc: 'Ubah teks dokumen PDF ke format teks Markdown (.md).', icon: 'fa-markdown', color: 'text-slate-600', accept: '.pdf', multi: false },
    'image-to-pdf': { title: 'JPG to PDF', desc: 'Ubah rangkaian berkas gambar jadi file PDF ringkas.', icon: 'fa-image', color: 'text-yellow-500', accept: '.jpg,.jpeg,.png', multi: true },
    'word-to-pdf': { title: 'WORD to PDF', desc: 'Konversi file Microsoft Word (.docx) langsung ke PDF.', icon: 'fa-file-word', color: 'text-blue-600', accept: '.docx', multi: false },
    'excel-to-pdf': { title: 'EXCEL to PDF', desc: 'Ubah spreadsheet tabel Excel (.xlsx) langsung ke PDF.', icon: 'fa-file-excel', color: 'text-green-600', accept: '.xlsx', multi: false },

    // EDITING
    'pdf-nup': { title: 'Padatkan (2-in-1)', desc: 'Susun 2 halaman PDF vertikal dalam satu lembar cetak A4.', icon: 'fa-columns', color: 'text-teal-600', accept: '.pdf', multi: false },
    'pdf-rotate': { title: 'Rotate PDF', desc: 'Putar orientasi sudut halaman dokumen PDF.', icon: 'fa-redo', color: 'text-purple-500', accept: '.pdf', multi: false },
    'page-numbers': { title: 'Add page numbers', desc: 'Beri penomoran halaman otomatis di bagian bawah tengah.', icon: 'fa-sort-numeric-down', color: 'text-pink-500', accept: '.pdf', multi: false },
    'crop-pdf': { title: 'Crop PDF', desc: 'Pangkas margin luar halaman PDF secara rata.', icon: 'fa-crop', color: 'text-teal-500', accept: '.pdf', multi: false, settings: [{ id: 'crop-margin', label: 'Potong Margin (Angka)', type: 'number', placeholder: '20' }] },
    'pdf-watermark': { title: 'Add watermark', desc: 'Beri stempel teks transparan di atas halaman PDF.', icon: 'fa-stamp', color: 'text-indigo-400', accept: '.pdf', multi: false, settings: [{ id: 'wm-text', label: 'Teks Watermark', type: 'text', placeholder: 'TWIDYTOOLS' }] },

    // BACKEND PLACEHOLDERS
    'repair-pdf': { title: 'Repair PDF', desc: 'Perbaiki indeks dokumen PDF yang korup/rusak.', icon: 'fa-wrench', color: 'text-amber-500', accept: '.pdf', multi: false },
    'ppt-to-pdf': { title: 'POWERPOINT to PDF', desc: 'Ubah file presentasi PPTX langsung menjadi PDF.', icon: 'fa-file-powerpoint', color: 'text-orange-600', accept: '.pptx,.ppt', multi: false },
    'html-to-pdf': { title: 'HTML to PDF', desc: 'Ubah kode halaman website HTML menjadi dokumen PDF.', icon: 'fa-html5', color: 'text-orange-500', accept: '.html', multi: false },
    'pdf-to-image': { title: 'PDF to JPG', desc: 'Ubah lembaran halaman PDF menjadi deretan gambar JPG.', icon: 'fa-images', color: 'text-yellow-500', accept: '.pdf', multi: false },
    'pdf-to-word': { title: 'PDF to WORD', desc: 'Konversi susunan teks PDF ke file dokumen Word.', icon: 'fa-file-word', color: 'text-blue-500', accept: '.pdf', multi: false },
    'pdf-to-ppt': { title: 'PDF to POWERPOINT', desc: 'Ubah halaman PDF menjadi slide presentasi PPTX.', icon: 'fa-file-powerpoint', color: 'text-orange-500', accept: '.pdf', multi: false },
    'pdf-to-excel': { title: 'PDF to EXCEL', desc: 'Ekstrak struktur data tabel PDF ke spreadsheet Excel.', icon: 'fa-file-excel', color: 'text-green-500', accept: '.pdf', multi: false },
    'pdf-to-pdfa': { title: 'PDF to PDF/A', desc: 'Ubah dokumen PDF ke standar kearsipan jangka panjang PDF/A.', icon: 'fa-file-pdf', color: 'text-red-500', accept: '.pdf', multi: false },
    'edit-pdf': { title: 'Edit PDF', desc: 'Tambahkan teks, bentuk gambar atau anotasi khusus.', icon: 'fa-edit', color: 'text-amber-600', accept: '.pdf', multi: false },
    'pdf-forms': { title: 'PDF Forms', desc: 'Isi atau manipulasi field formulir digital interaktif.', icon: 'fa-list-alt', color: 'text-cyan-600', accept: '.pdf', multi: false },
    'pdf-unlock': { title: 'Unlock PDF', desc: 'Buka pembatasan enkripsi kata sandi dokumen PDF.', icon: 'fa-unlock', color: 'text-teal-500', accept: '.pdf', multi: false },
    'pdf-protect': { title: 'Protect PDF', desc: 'Kunci berkas dokumen PDF menggunakan enkripsi password.', icon: 'fa-lock', color: 'text-red-600', accept: '.pdf', multi: false, settings: [{ id: 'pt-pass', label: 'Set Password', type: 'text', placeholder: '***' }] },
    'sign-pdf': { title: 'Sign PDF', desc: 'Bubuhkan tanda tangan elektronik di atas halaman PDF.', icon: 'fa-signature', color: 'text-blue-700', accept: '.pdf', multi: false },
    'redact-pdf': { title: 'Redact PDF', desc: 'Sensor/blok hitam permanen teks informasi sensitif.', icon: 'fa-eraser', color: 'text-slate-800', accept: '.pdf', multi: false },
    'compare-pdf': { title: 'Compare PDF', desc: 'Analisis perbedaan konten visual antara dua file PDF.', icon: 'fa-not-equal', color: 'text-orange-400', accept: '.pdf', multi: true }
};

const categories = {
    'TWIDY ECOSYSTEM': ['twidy-bill'],
    'PDF AI INTELLIGENCE': ['ai-summarizer', 'translate-pdf', 'smart-extract', 'chat-pdf'],
    'ORGANIZE PDF': ['pdf-merge', 'pdf-split', 'remove-pages', 'extract-pages', 'organize-pdf', 'scan-to-pdf'],
    'EDIT & OPTIMIZE': ['pdf-nup', 'pdf-rotate', 'page-numbers', 'crop-pdf', 'pdf-watermark', 'pdf-compress', 'ocr-pdf', 'pdf-to-markdown', 'image-to-pdf', 'word-to-pdf', 'excel-to-pdf'],
    'SERVER DEMAND FEATURES': ['repair-pdf', 'ppt-to-pdf', 'html-to-pdf', 'pdf-to-image', 'pdf-to-word', 'pdf-to-ppt', 'pdf-to-excel', 'pdf-to-pdfa', 'edit-pdf', 'pdf-forms', 'pdf-unlock', 'pdf-protect', 'sign-pdf', 'redact-pdf', 'compare-pdf']
};

document.addEventListener('DOMContentLoaded', function() {
    renderDashboard();
    setupDropZone();
    setupFileInput();
    initTheme();
    setInterval(updateDateTime, 1000);
    updateDateTime();
    
    const hash = window.location.hash.substring(1);
    if (hash && toolConfig[hash]) selectTool(hash);
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
            <div class="mb-10">
                <h3 class="text-xl font-bold text-slate-700 dark:text-slate-200 mb-5 border-b pb-2 border-slate-200 dark:border-slate-700">${catName}</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        `;
        
        tools.forEach(toolId => {
            const t = toolConfig[toolId];
            catHTML += `
                <div onclick="selectTool('${toolId}')" class="group bg-white dark:bg-darkCard p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg cursor-pointer transition-all hover:-translate-y-1">
                    <div class="${t.color} text-4xl mb-4 transition-transform group-hover:scale-110"><i class="fas ${t.icon}"></i></div>
                    <h4 class="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-500 mb-1 leading-tight">${t.title}</h4>
                    <p class="text-slate-500 dark:text-slate-400 text-xs leading-snug line-clamp-3">${t.desc}</p>
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
        sidebar.classList.toggle('-translate-x-full');
        sidebar.classList.toggle('translate-x-0');
        overlay.classList.toggle('hidden');
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
                        <input type="${set.type}" id="${set.id}" placeholder="${set.placeholder}" class="w-full text-sm px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white outline-none">
                    </div>
                `;
            });
            settingsPanel.classList.remove('hidden');
        } else {
            settingsPanel.classList.add('hidden');
        }
    }
    clearFiles();
}

function goBack() {
    history.pushState("", document.title, window.location.pathname);
    document.title = "TwidyTools - Solusi PDF";
    document.getElementById('uploadSection').classList.add('hidden');
    document.getElementById('toolsSection').classList.remove('hidden');
    document.getElementById('iframeContainer').classList.add('hidden');
    document.getElementById('appIframe').src = '';
    clearFiles();
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
    renderFileList();
}

function renderFileList() {
    const flist = document.getElementById('fileList');
    const actBtn = document.getElementById('actionButtons');
    flist.innerHTML = '';
    
    if (selectedFiles.length === 0 || (toolConfig[currentTool] && toolConfig[currentTool].isIframe)) {
        actBtn.classList.add('hidden'); return;
    }
    
    actBtn.classList.remove('hidden');
    flist.innerHTML = `<ul id="sortable-list" class="space-y-2"></ul>`;
    const listEl = document.getElementById('sortable-list');

    selectedFiles.forEach((f, i) => {
        const li = document.createElement('li');
        li.className = "flex items-center justify-between p-3 bg-white dark:bg-slate-800 border rounded-lg shadow-sm cursor-move";
        li.innerHTML = `
            <div class="flex items-center gap-3 truncate">
                <i class="fas fa-grip-vertical text-slate-400"></i>
                <i class="fas fa-file-pdf text-red-500 text-2xl"></i>
                <div class="truncate"><p class="text-sm font-bold truncate">${f.name}</p><p class="text-xs text-slate-400">${(f.size/1024/1024).toFixed(2)} MB</p></div>
            </div>
            <button onclick="removeFile(${i})" class="text-slate-400 hover:text-red-500"><i class="fas fa-times text-lg"></i></button>
        `;
        listEl.appendChild(li);
    });

    if (toolConfig[currentTool].multi) {
        new Sortable(listEl, { animation: 150, onEnd: evt => { const item = selectedFiles.splice(evt.oldIndex, 1)[0]; selectedFiles.splice(evt.newIndex, 0, item); } });
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
    area.innerHTML = `<div class="p-3 font-bold rounded-lg text-sm ${cl}">${msg}</div>`;
    setTimeout(() => area.innerHTML = '', 5000);
}
function triggerDownload(blob, fname) {
    const u = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = u; a.download = fname; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(u);
}

function parseRange(str, max) {
    let s = new Set();
    if(!str) return Array.from({length: max}, (_, i) => i);
    str.split(',').forEach(p => { if(p.includes('-')){ let [a,b]=p.split('-').map(Number); if(a&&b) for(let i=a;i<=b;i++) s.add(i-1); } else { let n=parseInt(p); if(n) s.add(n-1); } });
    return Array.from(s).filter(x => x>=0 && x<max).sort((a,b)=>a-b);
}

// ============ ENGINE PROSES ============
async function processFiles() {
    if (selectedFiles.length === 0) return;
    updateProgress(5, 'Menyiapkan berkas...');
    try {
        switch(currentTool) {
            // AI Features
            case 'ai-summarizer': await executeAI("Tolong buatkan ringkasan yang terstruktur, profesional, dan mudah dipahami dalam bahasa Indonesia dari teks berikut:", 'Twidy_Summary.txt'); break;
            case 'translate-pdf': 
                const lang = document.getElementById('target-lang').value || 'Inggris';
                await executeAI(`Terjemahkan dengan akurat teks dokumen berikut ini ke dalam bahasa ${lang}:`, `Twidy_Translate_${lang}.txt`); break;
            case 'smart-extract': 
                const extractQuery = document.getElementById('extract-query').value || 'Nama, Alamat, Tanggal';
                await executeAI(`Ekstrak dan carikan informasi spesifik berikut: [${extractQuery}] dari teks di bawah ini. Sajikan dalam format list yang rapi:`, 'Twidy_Extracted_Data.txt'); break;
            case 'chat-pdf': 
                const chatQuery = document.getElementById('chat-query').value || 'Apa isi utama dokumen ini?';
                await executeAI(`Berdasarkan teks dokumen di bawah ini, tolong jawab pertanyaan berikut dengan jelas: "${chatQuery}"`, 'Twidy_Chat_Answer.txt'); break;
            
            // Organize & Edit
            case 'pdf-merge': await executeMerge(); break;
            case 'pdf-split': await executeSplit(); break;
            case 'remove-pages': await executeRemovePages(); break;
            case 'extract-pages': await executeExtractPages(); break;
            case 'organize-pdf': await executeOrganizePdf(); break;
            case 'scan-to-pdf': await executeScanToPdf(); break;
            case 'pdf-nup': await executePadatkanPdf(); break;
            case 'pdf-rotate': await executeRotate(); break;
            case 'page-numbers': await executePageNumbers(); break;
            case 'crop-pdf': await executeCropPdf(); break;
            case 'pdf-watermark': await executeWatermark(); break;
            case 'pdf-compress': await executeCompress(); break;
            case 'pdf-to-markdown': await executePdfToMarkdown(); break;
            case 'image-to-pdf': await executeImageToPdf(); break;
            case 'word-to-pdf': await executeWordToPdf(); break;
            case 'excel-to-pdf': await executeExcelToPdf(); break;
            case 'ocr-pdf': await executeOcrPdf(); break;
            
            // Backend-reliant feature placeholders
            case 'repair-pdf':
            case 'ppt-to-pdf':
            case 'html-to-pdf':
            case 'pdf-to-image':
            case 'pdf-to-word':
            case 'pdf-to-ppt':
            case 'pdf-to-excel':
            case 'pdf-to-pdfa':
            case 'edit-pdf':
            case 'pdf-forms':
            case 'pdf-unlock':
            case 'pdf-protect':
            case 'sign-pdf':
            case 'redact-pdf':
            case 'compare-pdf':
                await executeAdvancedPlaceholder();
                break;
        }
        updateProgress(100, 'Selesai!');
        alertUser('Dokumen berhasil diproses!', 'success');
        setTimeout(hideProgress, 2000);
    } catch (e) {
        alertUser(`Error: ${e.message}`, 'error');
        hideProgress();
    }
}

async function extractTextFromPDF(fileBuffer) {
    const pdf = await pdfjsLib.getDocument({data: fileBuffer}).promise;
    let txt = "";
    for(let i=1; i<=Math.min(pdf.numPages, 10); i++) {
        txt += (await (await pdf.getPage(i)).getTextContent()).items.map(t=>t.str).join(" ") + "\n";
    }
    return txt.substring(0, 20000);
}

async function executeAI(instruction, filename) {
    updateProgress(30, 'Mengekstrak teks PDF...');
    const text = await extractTextFromPDF(await selectedFiles[0].arrayBuffer());
    
    updateProgress(70, 'Menganalisis dengan Gemini AI...');
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction: instruction, text: text })
    });
    const data = await response.json();
    if(!response.ok) throw new Error(data.error || "Gagal dari API");
    triggerDownload(new Blob([data.result], {type: 'text/plain;charset=utf-8'}), filename);
}

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
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    const pages = parseRange(document.getElementById('split-range')?.value, doc.getPageCount());
    const zip = new JSZip();
    for(let i of pages) {
        const sub = await PDFLib.PDFDocument.create();
        const [p] = await sub.copyPages(doc, [i]);
        sub.addPage(p);
        zip.file(`Page_${i+1}.pdf`, await sub.save());
    }
    triggerDownload(await zip.generateAsync({type: 'blob'}), 'Twidy_Splitted.zip');
}

async function executeRemovePages() {
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    const toRemove = parseRange(document.getElementById('remove-range')?.value, doc.getPageCount());
    const newPdf = await PDFLib.PDFDocument.create();
    const keep = Array.from({length: doc.getPageCount()}, (_, i) => i).filter(i => !toRemove.includes(i));
    if(keep.length===0) throw new Error("Tidak boleh menghapus semua halaman.");
    const copied = await newPdf.copyPages(doc, keep);
    copied.forEach(p => newPdf.addPage(p));
    triggerDownload(new Blob([await newPdf.save()], {type: 'application/pdf'}), 'Twidy_Removed.pdf');
}

async function executeExtractPages() {
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    const toExtract = parseRange(document.getElementById('extract-range')?.value, doc.getPageCount());
    if(toExtract.length===0) throw new Error("Masukkan halaman.");
    const newPdf = await PDFLib.PDFDocument.create();
    const copied = await newPdf.copyPages(doc, toExtract);
    copied.forEach(p => newPdf.addPage(p));
    triggerDownload(new Blob([await newPdf.save()], {type: 'application/pdf'}), 'Twidy_Extracted.pdf');
}

async function executeOrganizePdf() {
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    const str = document.getElementById('organize-order')?.value;
    if(!str) throw new Error("Masukkan urutan.");
    const order = str.split(',').map(n => parseInt(n.trim()) - 1).filter(n => n>=0 && n<doc.getPageCount());
    const newPdf = await PDFLib.PDFDocument.create();
    const copied = await newPdf.copyPages(doc, order);
    copied.forEach(p => newPdf.addPage(p));
    triggerDownload(new Blob([await newPdf.save()], {type: 'application/pdf'}), 'Twidy_Organized.pdf');
}

async function executeScanToPdf() {
    const outPdf = await PDFLib.PDFDocument.create();
    for(let i=0; i<selectedFiles.length; i++){
        const file = selectedFiles[i];
        const bytes = await file.arrayBuffer();
        const img = file.type.includes('png') ? await outPdf.embedPng(bytes) : await outPdf.embedJpg(bytes);
        outPdf.addPage([img.width, img.height]).drawImage(img, {x:0, y:0, width:img.width, height:img.height});
    }
    triggerDownload(new Blob([await outPdf.save()], {type: 'application/pdf'}), 'Twidy_Scan.pdf');
}

async function executePadatkanPdf() {
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    const newDoc = await PDFLib.PDFDocument.create();
    const pages = doc.getPages();
    const w = 595.28, h = 841.89;
    for (let i=0; i<pages.length; i+=2) {
        const newPage = newDoc.addPage([w, h]);
        const p1 = await newDoc.embedPage(pages[i]);
        const s1 = Math.min(w/p1.width, (h/2)/p1.height);
        newPage.drawPage(p1, { x:(w-p1.width*s1)/2, y:(h/2)+((h/2-p1.height*s1)/2), xScale:s1, yScale:s1 });
        if (i+1 < pages.length) {
            const p2 = await newDoc.embedPage(pages[i+1]);
            const s2 = Math.min(w/p2.width, (h/2)/p2.height);
            newPage.drawPage(p2, { x:(w-p2.width*s2)/2, y:((h/2-p2.height*s2)/2), xScale:s2, yScale:s2 });
        }
    }
    triggerDownload(new Blob([await newDoc.save()], {type: 'application/pdf'}), 'Twidy_Padat_Vertikal.pdf');
}

async function executeRotate() {
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    doc.getPages().forEach(p => p.setRotation(PDFLib.degrees(p.getRotation().angle + 90)));
    triggerDownload(new Blob([await doc.save()], {type: 'application/pdf'}), 'Twidy_Rotated.pdf');
}

async function executePageNumbers() {
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    const font = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
    doc.getPages().forEach((p, i) => p.drawText(String(i+1), {x: p.getSize().width/2-5, y: 20, size: 12, font: font}));
    triggerDownload(new Blob([await doc.save()], {type: 'application/pdf'}), 'Twidy_Numbered.pdf');
}

async function executeCropPdf() {
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    const m = parseInt(document.getElementById('crop-margin')?.value) || 20;
    doc.getPages().forEach(p => { const {x,y,width,height}=p.getCropBox(); p.setCropBox(x+m, y+m, width-(m*2), height-(m*2)); });
    triggerDownload(new Blob([await doc.save()], {type: 'application/pdf'}), 'Twidy_Cropped.pdf');
}

async function executeWatermark() {
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    const font = await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);
    const txt = document.getElementById('wm-text').value || "TWIDY";
    doc.getPages().forEach(p => p.drawText(txt, {x: 100, y: 100, size: 50, font: font, opacity: 0.3, rotate: PDFLib.degrees(45)}));
    triggerDownload(new Blob([await doc.save()], {type: 'application/pdf'}), 'Twidy_Watermarked.pdf');
}

async function executeCompress() {
    const doc = await PDFLib.PDFDocument.load(await selectedFiles[0].arrayBuffer());
    triggerDownload(new Blob([await doc.save({useObjectStreams: true})], {type: 'application/pdf'}), 'Twidy_Compressed.pdf');
}

async function executePdfToMarkdown() {
    const txt = await extractTextFromPDF(await selectedFiles[0].arrayBuffer());
    triggerDownload(new Blob(["# Hasil Ekstraksi PDF\n\n" + txt], {type: 'text/markdown;charset=utf-8'}), 'Twidy_Markdown.md');
}

async function executeImageToPdf() {
    const outPdf = await PDFLib.PDFDocument.create();
    for(let i=0; i<selectedFiles.length; i++){
        const img = selectedFiles[i].type.includes('png') ? await outPdf.embedPng(await selectedFiles[i].arrayBuffer()) : await outPdf.embedJpg(await selectedFiles[i].arrayBuffer());
        outPdf.addPage([img.width, img.height]).drawImage(img, {x:0, y:0, width:img.width, height:img.height});
    }
    triggerDownload(new Blob([await outPdf.save()], {type: 'application/pdf'}), 'Twidy_Images_to_PDF.pdf');
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

async function executeOcrPdf() {
    updateProgress(30, 'Memuat Tesseract OCR...');
    if(!window.Tesseract) throw new Error("Library OCR gagal dimuat.");
    const pdf = await pdfjsLib.getDocument({data: await selectedFiles[0].arrayBuffer()}).promise;
    const page = await pdf.getPage(1);
    const cvs = document.createElement('canvas'); const vp = page.getViewport({scale: 2.0});
    cvs.width = vp.width; cvs.height = vp.height;
    await page.render({canvasContext: cvs.getContext('2d'), viewport: vp}).promise;
    updateProgress(60, 'Menganalisis gambar ke teks...');
    const result = await Tesseract.recognize(cvs, 'eng+ind');
    triggerDownload(new Blob([result.data.text], {type: 'text/plain;charset=utf-8'}), 'Twidy_OCR_Result.txt');
}

async function executeAdvancedPlaceholder() {
    updateProgress(50, 'Mengecek modul server...');
    await new Promise(r => setTimeout(r, 1200));
    throw new Error(`Fitur "${toolConfig[currentTool].title}" memerlukan integrasi server backend tingkat lanjut (seperti Python/Node OS engine) untuk memproses struktur internal file.`);
}
