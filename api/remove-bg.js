const fs = require('fs');
const { IncomingForm } = require('formidable');

export const config = {
    api: { bodyParser: false }
};

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Hanya menerima method POST' });

    const form = new IncomingForm({ keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(500).json({ error: 'Gagal membaca gambar yang diunggah.' });

        const file = Array.isArray(files.file) ? files.file[0] : files.file;
        if (!file) return res.status(400).json({ error: 'Tidak ada berkas yang ditemukan.' });

        const apiKey = process.env.POOF_BG_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'API Key Remove BG belum dipasang di sistem Vercel.' });
        }

        try {
            // 1. Membaca gambar yang diunggah
            const fileData = fs.readFileSync(file.filepath);
            const fileBlob = new Blob([fileData], { type: file.mimetype });

            // 2. Menyiapkan paket data sesuai dokumentasi Poof.bg
            const formData = new FormData();
            formData.append('image_file', fileBlob, file.originalFilename || 'image.jpg');
            formData.append('format', 'png');
            formData.append('size', 'full');

            // 3. Mengirim ke Endpoint API Poof.bg (URL diperbarui)
            const response = await fetch('https://api.poof.bg/v1/remove', {
                method: 'POST',
                headers: {
                    // Gunakan trim() untuk membuang spasi tidak sengaja yang ikut tersalin di Vercel
                    'x-api-key': apiKey.trim() 
                },
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server API menolak permintaan: ${response.status} - ${errorText}`);
            }

            // 4. Menerima gambar hasil transparansi dan meneruskannya ke pengguna
            const buffer = await response.arrayBuffer();
            
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Content-Disposition', `attachment; filename="Twidy_NoBG_${file.originalFilename.replace(/\.[^/.]+$/, "")}.png"`);
            res.send(Buffer.from(buffer));

            // 5. Bersihkan memori server
            fs.unlinkSync(file.filepath);

        } catch (error) {
            console.error("Remove BG Error:", error);
            res.status(500).json({ error: error.message || 'Gagal memproses penghapusan latar belakang.' });
            try { fs.unlinkSync(file.filepath); } catch (e) { /* Abaikan error pembersihan */ }
        }
    });
}
