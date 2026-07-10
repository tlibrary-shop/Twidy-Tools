module.exports = async function handler(req, res) {
    // 1. Pastikan hanya menerima POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Hanya menerima method POST' });
    }

    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Teks dokumen kosong atau tidak terbaca.' });
        }

        // 2. Ambil API Key dari Environment Variables Vercel
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({ error: 'API Key belum terpasang di Vercel.' });
        }
        
        // 3. Setup URL Gemini Flash Lite
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite-preview-02-05:generateContent?key=${apiKey}`;

        // 4. Tembak ke Google API
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Tolong buatkan ringkasan yang terstruktur, profesional, dan mudah dipahami dalam bahasa Indonesia dari teks dokumen berikut:\n\n${text}` }] }]
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error("Error Response API:", data);
            return res.status(500).json({ error: 'Gagal mendapat respon dari Google AI.' });
        }

        // 5. Kembalikan hasil ke web Anda
        const resultText = data.candidates[0].content.parts[0].text;
        res.status(200).json({ result: resultText });

    } catch (error) {
        console.error("Error Backend Terjadi:", error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server backend.' });
    }
}
