import ConvertAPI from 'convertapi';
import formidable from 'formidable';
import fs from 'fs';

// Konfigurasi wajib Vercel agar tidak mem-parse body secara otomatis (karena kita pakai formidable)
export const config = {
    api: {
        bodyParser: false,
    },
};

// Inisialisasi ConvertAPI menggunakan API Key / Secret dari Environment Variables Vercel
const convertapi = new ConvertAPI(process.env.CONVERTAPI_SECRET);

export default async function handler(req, res) {
    // Hanya menerima request POST
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    if (!process.env.CONVERTAPI_SECRET) {
        return res.status(500).json({ error: 'Server Error: CONVERTAPI_SECRET belum dikonfigurasi di Vercel.' });
    }

    const form = formidable({});

    try {
        // 1. Parse data berkas dan fields dari request
        const [fields, files] = await form.parse(req);
        
        const fileData = files.file ? files.file[0] : null;
        const conversionType = fields.conversionType ? fields.conversionType[0] : null;

        if (!fileData || !conversionType) {
            return res.status(400).json({ error: 'File atau tipe konversi (conversionType) tidak ditemukan.' });
        }

        // 2. Tentukan parameter input & output format berdasarkan conversionType dari frontend
        let fromFormat = '';
        let toFormat = '';

        switch (conversionType) {
            case 'word-to-pdf':
                fromFormat = 'docx'; // ConvertAPI mendukung doc/docx langsung lewat deteksi atau spesifik format
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

        // 3. Jalankan proses konversi via ConvertAPI
        // Menggunakan path file lokal sementara hasil parse dari formidable
        const result = await convertapi.convert(toFormat, {
            File: fileData.filepath
        }, fromFormat);

        // 4. Ambil URL file hasil konversi dan unduh sebagai buffer untuk dikirim balik ke frontend
        const resultFile = result.files[0];
        const fileUrl = resultFile.url;
        
        const fileResponse = await fetch(fileUrl);
        if (!fileResponse.ok) {
            throw new Error('Gagal mengunduh berkas hasil konversi dari server ConvertAPI.');
        }
        
        const arrayBuffer = await fileResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 5. Bersihkan file sampah temporer di server Vercel agar tidak penuh
        fs.unlink(fileData.filepath, (err) => {
            if (err) console.error('Gagal menghapus berkas temp:', err);
        });

        // 6. Set header response sesuai jenis file output dan kirim filenya
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename=${resultFile.filename}`);
        return res.status(200).send(buffer);

    } catch (error) {
        console.error('ConvertAPI Error:', error);
        return res.status(500).json({ error: error.message || 'Terjadi kesalahan saat memproses dokumen.' });
    }
}
