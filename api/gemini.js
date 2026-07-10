export default async function handler(req, res) {
    // Pastikan web hanya menembak menggunakan method POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Hanya menerima method POST' });
    }

    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Teks dokumen kosong atau tidak terbaca.' });
        }

        // Mengambil API Key dari "brankas" Vercel (Environment Variable)
        const apiKey = process.env.GEMINI_API_KEY;
        
        // Menggunakan model Gemini Flash Lite terbaru
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite-preview-02-05:generateContent?key=${apiKey}`;

        // Prompt / Perintah untuk AI (Bisa Anda modifikasi sendiri kata-katanya)
        const prompt = `Tolong buatkan ringkasan yang terstruktur, profesional, dan mudah dipahami dalam bahasa Indonesia dari teks dokumen berikut:\n\n${text}`;

        // Proses mengirim data ke Google Gemini
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || 'Gagal merespons dari server Google AI.');
        }

        // Menangkap jawaban dari Gemini
        const resultText = data.candidates[0].content.parts[0].text;

        // Mengirimkan jawaban AI kembali ke web Frontend TwidyTools Anda
        res.status(200).json({ result: resultText });

    } catch (error) {
        console.error("Error dari backend:", error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server AI.' });
    }
}