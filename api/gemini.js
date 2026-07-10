module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Hanya menerima method POST' });
    }

    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Teks dokumen kosong atau tidak terbaca.' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({ error: 'API Key belum terpasang di Vercel.' });
        }
        
        // REVISI: Menggunakan model stabil gemini-1.5-flash yang dijamin tidak 404
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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

        const resultText = data.candidates[0].content.parts[0].text;
        res.status(200).json({ result: resultText });

    } catch (error) {
        console.error("Error Backend Terjadi:", error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server backend.' });
    }
}
