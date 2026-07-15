module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Hanya menerima method POST' });
    }

    try {
        // Menerima tambahan payload fileData (Base64) dan mimeType dari frontend
        const { text, action, customPrompt, fileData, mimeType } = req.body;
        
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({ error: 'API Key belum terpasang di Vercel.' });
        }
        
        let systemPrompt = "";
        
        switch(action) {
            // --- TEXT AI ACTIONS ---
            case "summarize":
                systemPrompt = "Tolong buatkan ringkasan yang terstruktur, profesional, dan mudah dipahami dalam bahasa Indonesia dari teks dokumen berikut:\n\n";
                break;
            case "translate":
                systemPrompt = "Tolong terjemahkan seluruh isi teks dokumen berikut ini ke dalam bahasa Indonesia yang baku, natural, dan profesional. Jaga struktur paragrafnya jika memungkinkan:\n\n";
                break;
            case "proofread":
                systemPrompt = "Tolong perbaiki ejaan (typo), tata bahasa, dan struktur kalimat pada teks berikut ini agar menjadi bahasa Indonesia yang sangat rapi, formal, dan sesuai PUEBI:\n\n";
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
                systemPrompt = `Berdasarkan teks/file di bawah ini, tolong jawab pertanyaan berikut dengan akurat: "${customPrompt}". \nJika jawabannya tidak ada, katakan saja bahwa informasi tidak ditemukan.\n\nData:\n\n`;
                break;

            // --- MULTIMEDIA AI ACTIONS ---
            case "image_caption":
                systemPrompt = "Tolong berikan deskripsi (caption) yang sangat detail, menarik, dan profesional untuk gambar yang saya lampirkan ini dalam bahasa Indonesia.";
                break;
            case "transcribe_audio":
                systemPrompt = "Tolong transkripsikan (ubah menjadi teks) semua ucapan atau suara yang ada di dalam file audio yang saya lampirkan ini secara akurat dalam bahasa Indonesia.";
                break;

            // --- UNSUPPORTED AI ACTIONS BY GEMINI (Needs Diffusion/TTS Models) ---
            case "upscale_image":
            case "colorize_bw":
            case "remove_object":
                return res.status(400).json({ error: 'Fitur manipulasi gambar ini memerlukan API Model Difusi (seperti Stable Diffusion). Gemini adalah model analitik teks/bahasa.' });
            case "text_to_audio":
                return res.status(400).json({ error: 'Fitur Text-to-Speech memerlukan integrasi API khusus suara (seperti Google Cloud TTS).' });
                
            default:
                systemPrompt = "Tolong analisis dan perjelas data berikut:\n\n";
        }

        const finalPrompt = systemPrompt + (text || "");
        
        // Membangun array 'parts' untuk dikirim ke Gemini
        const parts = [{ text: finalPrompt }];
        
        // Jika ada file gambar/audio yang diunggah, sisipkan ke dalam array parts sebagai inlineData
        if (fileData && mimeType) {
            parts.push({
                inlineData: {
                    mimeType: mimeType,
                    data: fileData
                }
            });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: parts }]
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error("Error Response API Google:", data);
            return res.status(500).json({ error: data.error?.message || 'Gagal mendapat respon dari Google AI.' });
        }

        const resultText = data.candidates[0].content.parts[0].text;
        res.status(200).json({ result: resultText });

    } catch (error) {
        console.error("Error Backend Terjadi:", error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server backend.' });
    }
}
