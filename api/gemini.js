module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Hanya menerima method POST' });
    }

    try {
        const { instruction, text } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Teks dokumen kosong atau tidak terbaca.' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({ error: 'API Key belum terpasang di Vercel.' });
        }
        
        const finalPrompt = `${instruction}\n\n--- TEKS DOKUMEN ---\n${text}`;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: finalPrompt }] }]
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
};
