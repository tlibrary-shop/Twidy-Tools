module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Hanya menerima method POST' });
    }

    try {
        const { text, action, customPrompt } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Teks dokumen kosong atau tidak terbaca.' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({ error: 'API Key belum terpasang di Vercel.' });
        }
        
        // Setup dinamis System Prompt
        let systemPrompt = "";
        
        switch(action) {
            case "summarize":
                systemPrompt = "Tolong buatkan ringkasan yang terstruktur, profesional, dan mudah dipahami dalam bahasa Indonesia dari teks dokumen berikut:\n\n";
                break;
            case "translate":
                systemPrompt = "Tolong terjemahkan seluruh isi teks dokumen berikut ini ke dalam bahasa Indonesia yang baku, natural, dan profesional. Jaga struktur paragrafnya jika memungkinkan:\n\n";
                break;
            case "proofread":
                systemPrompt = "Tolong perbaiki ejaan (typo), tata bahasa, dan struktur kalimat pada teks berikut ini agar menjadi bahasa Indonesia yang sangat rapi, formal, dan sesuai PUEBI (Pedoman Umum Ejaan Bahasa Indonesia):\n\n";
                break;
            case "extract_entities":
                systemPrompt = "Tolong ekstrak semua informasi dan entitas penting dari teks berikut. Carikan Nama Orang, Nama Organisasi/Perusahaan, Jabatan, Tanggal/Waktu, Lokasi, dan Angka/Nominal penting. Sajikan hasilnya dalam bentuk list bullet points yang rapi:\n\n";
                break;
            case "generate_quiz":
                systemPrompt = "Berperanlah sebagai seorang guru. Berdasarkan isi teks dokumen berikut, tolong buatkan 5 soal pertanyaan pilihan ganda (A, B, C, D) yang menguji pemahaman. Di bagian paling bawah, sertakan kunci jawabannya:\n\n";
                break;
            case "analyze_sentiment":
                systemPrompt = "Tolong lakukan analisis sentimen dan nada (tone) dari teks dokumen berikut. Jelaskan apakah teks ini bersikap positif, negatif, atau netral, serta emosi/kesan utama apa yang ingin disampaikan oleh penulis dokumen:\n\n";
                break;
            case "ask_question":
                systemPrompt = `Berdasarkan teks dokumen di bawah ini, tolong jawab pertanyaan berikut dengan akurat: "${customPrompt}". \nJika jawabannya tidak ada di dalam teks, katakan saja bahwa informasi tidak ditemukan di dokumen.\n\nTeks Dokumen:\n\n`;
                break;
            default:
                systemPrompt = "Tolong analisis dan perjelas teks dokumen berikut:\n\n";
        }

        const finalPrompt = systemPrompt + text;
        
        // REVISI FINAL: Menggunakan model terbaru gemini-3.1-flash-lite yang aktif saat ini
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
            console.error("Error Response API Google:", data);
            return res.status(500).json({ error: 'Gagal mendapat respon dari Google AI.' });
        }

        const resultText = data.candidates[0].content.parts[0].text;
        res.status(200).json({ result: resultText });

    } catch (error) {
        console.error("Error Backend Terjadi:", error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server backend.' });
    }
}
