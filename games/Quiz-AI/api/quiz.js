const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = async function handler(req, res) {
    // Hanya izinkan POST request
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { tingkat, kesulitan, jumlah } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API Key Gemini belum diatur di Vercel.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

    // Prompt cerdas untuk memastikan balasan murni JSON Array
    const prompt = `Buatkan ${jumlah} pertanyaan kuis pilihan ganda yang edukatif, bervariasi, dan menantang untuk tingkat ${tingkat} dengan tingkat kesulitan ${kesulitan}.
    PENTING: Balas HANYA dengan array JSON murni, tanpa teks pembuka, tanpa blok markdown (\`\`\`json). Format persis seperti ini:
    [
        {
            "pertanyaan": "Tulis pertanyaan di sini",
            "opsi": ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
            "jawaban_benar": "Pilihan yang benar (harus sama persis dengan salah satu isi array opsi)",
            "penjelasan": "Penjelasan singkat dan padat mengapa jawaban tersebut benar"
        }
    ]`;

    try {
        const result = await model.generateContent(prompt);
        let responseText = result.response.text().trim();
        
        // Membersihkan markdown jika AI tetap menambahkannya
        responseText = responseText.replace(/^```json/i, '').replace(/```$/i, '').trim();
        
        const quizData = JSON.parse(responseText);
        res.status(200).json(quizData);
    } catch (error) {
        console.error("Error dari Gemini:", error);
        res.status(500).json({ error: 'Gagal mengambil soal dari AI. Silakan coba lagi.' });
    }
};
