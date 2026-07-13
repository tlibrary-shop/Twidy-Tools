import ConvertAPI from 'convertapi';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false,
    },
};

const convertapi = new ConvertAPI(process.env.CONVERTAPI_SECRET);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    if (!process.env.CONVERTAPI_SECRET) {
        return res.status(500).json({ error: 'Server Error: CONVERTAPI_SECRET belum dikonfigurasi di Vercel.' });
    }

    // --- KUNCI PERBAIKANNYA DI SINI ---
    const form = formidable({
        keepExtensions: true, // Wajib di-true agar .docx/.pdf tidak hilang
        maxFileSize: 20 * 1024 * 1024, // Batas maksimal 20MB
    });

    try {
        const [fields, files] = await form.parse(req);
        
        // Memastikan kompatibilitas dengan berbagai versi formidable
        const fileData = files.file ? (Array.isArray(files.file) ? files.file[0] : files.file) : null;
        const conversionType = fields.conversionType ? (Array.isArray(fields.conversionType) ? fields.conversionType[0] : fields.conversionType) : null;

        if (!fileData || !conversionType) {
            return res.status(400).json({ error: 'File atau tipe konversi (conversionType) tidak ditemukan.' });
        }

        let fromFormat = '';
        let toFormat = '';

        switch (conversionType) {
            case 'word-to-pdf':
                fromFormat = 'docx'; 
                toFormat = 'pdf';
                break;
            case 'excel-to-pdf':
                fromFormat = 'xlsx';
                toFormat = 'pdf';
                break;
            case 'ppt-to-pdf':
                fromFormat = 'pptx';
                toFormat = 'pdf';
                break;
            case 'pdf-to-word':
                fromFormat = 'pdf';
                toFormat = 'docx';
                break;
            case 'pdf-to-excel':
                fromFormat = 'pdf';
                toFormat = 'xlsx';
                break;
            case 'pdf-to-ppt':
                fromFormat = 'pdf';
                toFormat = 'pptx';
                break;
            default:
                return res.status(400).json({ error: `Tipe konversi '${conversionType}' tidak didukung.` });
        }

        // Proses konversi via ConvertAPI
        const result = await convertapi.convert(toFormat, {
            File: fileData.filepath
        }, fromFormat);

        const resultFile = result.files[0];
        const fileUrl = resultFile.url;
        
        const fileResponse = await fetch(fileUrl);
        if (!fileResponse.ok) {
            throw new Error('Gagal mengunduh berkas hasil konversi dari server ConvertAPI.');
        }
        
        const arrayBuffer = await fileResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Hapus file sementara
        fs.unlink(fileData.filepath, (err) => {
            if (err) console.error('Gagal menghapus berkas temp:', err);
        });

        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${resultFile.filename}"`);
        return res.status(200).send(buffer);

    } catch (error) {
        console.error('ConvertAPI Error:', error);
        
        // Menangkap pesan error spesifik dari ConvertAPI jika ada
        const errorMsg = error.response && error.response.data 
            ? JSON.stringify(error.response.data) 
            : error.message || 'Terjadi kesalahan saat memproses dokumen.';
            
        return res.status(500).json({ error: errorMsg });
    }
}
