const fs = require('fs');
const path = require('path');
const os = require('os');
const { IncomingForm } = require('formidable');
const PDFServicesSdk = require('@adobe/pdfservices-node-sdk');

export const config = {
    api: { bodyParser: false }
};

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Hanya menerima method POST' });

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
            const inputRef = PDFServicesSdk.FileRef.createFromLocalFile(file.filepath);
            
            const outputFileName = `Twidy_${Date.now()}`;
            let outputPath = path.join(os.tmpdir(), outputFileName);
            let operation;

            // 2. Tentukan Operasi (PERBAIKAN LOGIKA FORMAT ADOBE)
            if (['word-to-pdf', 'ppt-to-pdf', 'excel-to-pdf', 'txt-to-pdf', 'rtf-to-pdf'].includes(convType)) {
                
                // Konversi dari Office/Text menuju PDF
                operation = PDFServicesSdk.CreatePDF.Operation.createNew();
                operation.setInput(inputRef);
                outputPath += '.pdf';
                
            } 
            else if (['pdf-to-word', 'pdf-to-ppt', 'pdf-to-excel'].includes(convType)) {
                
                let targetFormat;
                
                if (convType === 'pdf-to-word') {
                    targetFormat = PDFServicesSdk.ExportPDF.SupportedTargetFormats.DOCX;
                    outputPath += '.docx';
                } else if (convType === 'pdf-to-ppt') {
                    targetFormat = PDFServicesSdk.ExportPDF.SupportedTargetFormats.PPTX;
                    outputPath += '.pptx';
                } else if (convType === 'pdf-to-excel') {
                    targetFormat = PDFServicesSdk.ExportPDF.SupportedTargetFormats.XLSX;
                    outputPath += '.xlsx';
                }

                // FIX: Target format WAJIB dilempar ke dalam createNew() untuk ExportPDF
                operation = PDFServicesSdk.ExportPDF.Operation.createNew(targetFormat);
                operation.setInput(inputRef);
                
            } else {
                return res.status(400).json({ error: 'Tipe konversi ini belum didukung oleh mesin Adobe.' });
            }

            // 3. Eksekusi Pemrosesan ke Server Adobe
            const result = await operation.execute(executionContext);
            await result.saveAsFile(outputPath);

            // 4. Kirim file hasil kembali ke Client/Browser
            const stat = fs.statSync(outputPath);
            res.writeHead(200, {
                'Content-Length': stat.size,
                'Content-Disposition': `attachment; filename="${path.basename(outputPath)}"`,
            });

            const readStream = fs.createReadStream(outputPath);
            readStream.pipe(res);
            
            // 5. Bersihkan memori server sementara
            readStream.on('close', () => {
                try { fs.unlinkSync(file.filepath); fs.unlinkSync(outputPath); } catch (e) { /* Abaikan */ }
            });

        } catch (error) {
            console.error("Adobe API Error:", error);
            res.status(500).json({ error: error.message || 'Gagal terhubung ke mesin Adobe PDF.' });
        }
    });
}
