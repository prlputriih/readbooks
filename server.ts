import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI client lazily or safely
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } else {
    console.warn("⚠️ GEMINI_API_KEY is not defined in environment variables.");
  }
} catch (err) {
  console.error("❌ Failed to initialize GoogleGenAI client:", err);
}

// 1. API Endpoint: Book recommendations from Gemini AI
app.post("/api/recommend", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Permintaan tidak valid. Harap berikan deskripsi buku kata kunci." });
  }

  if (!ai) {
    return res.status(503).json({
      error: "Asisten AI belum siap karena kunci API (GEMINI_API_KEY) belum dikonfigurasi di Settings > Secrets."
    });
  }

  try {
    const formattedPrompt = `Rekomendasikan 3 buku nyata yang terkenal dan berkualitas tinggi yang sangat sesuai dengan kriteria pembaca berikut: "${prompt}".
Tolong sesuaikan agar bukunya mudah ditemukan atau populer di Indonesia (bisa karya lokal atau terjemahan).
Gunakan bahasa Indonesia yang ramah, hangat, dan profesional.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedPrompt,
      config: {
        systemInstruction: "Anda adalah kurator buku profesional di platform 'ReadBooks'. Tugas Anda adalah memberikan rekomendasi 3 buku riil yang akurat, menarik, dan sangat relevan dengan apa yang diminta pengguna. Selalu kembalikan respons dalam format JSON valid berupa Array of Objects.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "Judul buku yang nyata.",
              },
              author: {
                type: Type.STRING,
                description: "Nama penulis buku asli.",
              },
              category: {
                type: Type.STRING,
                description: "Kategori utama buku. Pilih dari salah satu: 'Fiksi', 'Pengembangan Diri', 'Bisnis', 'Sains & Teknologi'.",
              },
              duration: {
                type: Type.STRING,
                description: "Estimasi waktu baca, misalnya '4 jam', '5-6 jam', '8 jam'.",
              },
              pages: {
                type: Type.INTEGER,
                description: "Jumlah halaman buku riil (perkiraan numerik jika Anda kurang yakin, kisaran 100-800).",
              },
              synopsis: {
                type: Type.STRING,
                description: "Sinopsis singkat buku dalam Bahasa Indonesia yang menggugah rasa penasaran, minimal 3 kalimat.",
              },
              reason: {
                type: Type.STRING,
                description: "Alasan mengapa buku tertentu ini sangat direkomendasikan khusus untuk kebutuhan & suasana hati pengguna saat ini, minimal 2 kalimat.",
              }
            },
            required: ["title", "author", "category", "duration", "pages", "synopsis", "reason"]
          }
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Tidak menerima respons teks dari AI.");
    }

    const recommendations = JSON.parse(responseText.trim());
    return res.json({ recommendations });

  } catch (error: any) {
    console.error("Error generating recommendations via Gemini API:", error);
    return res.status(500).json({
      error: "Gagal memproses rekomendasi AI.",
      details: error.message || "Kesalahan internal."
    });
  }
});

// 2. Setup Vite middleware or static files
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

setupViteOrStatic().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ReadBooks] Server berjalan pada http://0.0.0.0:${PORT}`);
  });
}).catch(err => {
  console.error("Gagal memulai server Vite/Express:", err);
});
