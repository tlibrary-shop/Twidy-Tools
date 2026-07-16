const fs = require('fs');
const path = require('path');
const os = require('os');
const { IncomingForm } = require('formidable');
const PDFServicesSdk = require('@adobe/pdfservices-node-sdk');

// Konfigurasi ini penting agar Vercel tidak memotong file yang diunggah
export const config = {
    api: { bodyParser: false }
};

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Hanya menerima method POST' });

    // Membaca file dari frontend
    const form = new IncomingForm({ keepExtensions: true });
    
    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(500).json({ error: 'Gagal membaca berkas yang diunggah.' });

        const file = Array.isArray(files.file) ? files.file[0] : files.file;
        const convType = Array.isArray(fields.conversionType) ? fields.conversionType[0] : fields.conversionType;

        if (!file) return res.status(400).json({ error: 'Tidak ada berkas yang ditemukan.' });

        const clientId = process.env.ADOBE_CLIENT_ID;
        const clientSecret = process.env.ADOBE_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            return res.status(500).json({ error: 'API Key Adobe belum dipasang di sistem Vercel.' });
        }

        try {
            // 1. Inisialisasi Kredensial Adobe API
            const credentials = PDFServicesSdk.Credentials.servicePrincipalCredentialsBuilder()
                .withClientId(clientId)
                .withClientSecret(clientSecret)
                .build();

            const executionContext = PDFServicesSdk.ExecutionContext.create(credentials);
            
            // 2. Siapkan lokasi file output sementara
            const outputFileName = `Twidy_${Date.now()}`;
            let outputPath = path.join(os.tmpdir(), outputFileName);
            let operation;

            // 3. Logika Penentuan Tipe Konversi Adobe
            if (['word-to-pdf', 'ppt-to-pdf', 'excel-to-pdf', 'txt-to-pdf', 'rtf-to-pdf'].includes(convType)) {
                // Konversi dari Office/Text menuju PDF
                operation = PDFServicesSdk.CreatePDF.Operation.createNew();
                const inputRef = PDFServicesSdk.FileRef.createFromLocalFile(file.filepath);
                operation.setInput(inputRef);
                outputPath += '.pdf';
            } 
            else if (['pdf-to-word', 'pdf-to-ppt', 'pdf-to-excel'].includes(convType)) {
                // Konversi dari PDF menuju Office (Export)
                operation = PDFServicesSdk.ExportPDF.Operation.createNew();
                const inputRef = PDFServicesSdk.FileRef.createFromLocalFile(file.filepath);
                operation.setInput(inputRef);
                
                // PERBAIKAN DI SINI: Memanggil kamus format yang benar sesuai versi SDK
                const ExportPDFTargetFormat = PDFServicesSdk.ExportPDF.options.ExportPDFTargetFormat;
                
                if (convType === 'pdf-to-word') {
                    operation.setTargetFormat(ExportPDFTargetFormat.DOCX);
                    outputPath += '.docx';
                } else if (convType === 'pdf-to-ppt') {
                    operation.setTargetFormat(ExportPDFTargetFormat.PPTX);
                    outputPath += '.pptx';
                } else if (convType === 'pdf-to-excel') {
                    operation.setTargetFormat(ExportPDFTargetFormat.XLSX);
                    outputPath += '.xlsx';
                }
            } else {
                return res.status(400).json({ error: 'Tipe konversi ini belum didukung oleh mesin Adobe.' });
            }

            // 4. Eksekusi Pemrosesan ke Server Adobe
            const result = await operation.execute(executionContext);
            await result.saveAsFile(outputPath);

            // 5. Kirim file hasil kembali ke Client/Browser pengguna
            const stat = fs.statSync(outputPath);
            res.writeHead(200, {
                'Content-Length': stat.size,
                'Content-Disposition': `attachment; filename="${path.basename(outputPath)}"`,
            });

            const readStream = fs.createReadStream(outputPath);
            readStream.pipe(res);
            
            // 6. Bersihkan memori server Vercel setelah selesai
            readStream.on('close', () => {
                try { fs.unlinkSync(file.filepath); fs.unlinkSync(outputPath); } catch (e) { /* Abaikan error pembersihan */ }
            });

        } catch (error) {
            console.error("Adobe API Error:", error);
            res.status(500).json({ error: error.message || 'Gagal terhubung ke mesin Adobe PDF.' });
        }
    });
}
