// File: api/convertapi.js

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Hanya menerima method POST' });
    }

    try {
        const { fromFormat, toFormat, fileName, fileData } = req.body;
        const secret = process.env.CONVERTAPI_SECRET;

        if (!secret) {
            return res.status(500).json({ error: 'API Key ConvertAPI belum di-set di Vercel.' });
        }

        // Endpoint resmi dari ConvertAPI
        const url = `https://v2.convertapi.com/convert/${fromFormat}/to/${toFormat}?Secret=${secret}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Parameters: [
                    {
                        Name: "File",
                        FileValue: {
                            Name: fileName,
                            Data: fileData // Base64 Data dikirim ke sini
                        }
                    }
                ]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data.Message || 'Konversi gagal di server ConvertAPI.' });
        }

        // Kembalikan URL download langsung dari ConvertAPI ke web kamu
        res.status(200).json({ url: data.Files[0].Url });

    } catch (error) {
        console.error("ConvertAPI Error:", error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server konversi.' });
    }
}
