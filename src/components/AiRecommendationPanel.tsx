import React, { useState } from 'react';
import { HelpCircle, Sparkles, BookOpen, Clock, Plus, Loader2 } from 'lucide-react';
import { Book } from '../types';

interface AiRecommendation {
  title: string;
  author: string;
  category: string;
  duration: string;
  pages: number;
  synopsis: string;
  reason: string;
}

interface AiRecommendationPanelProps {
  onAddAiBookToCatalog: (book: Book) => void;
  existingBooksCount: number;
}

// Vibrant cover themes matching the cozy atmosphere
const COVER_THEMES = [
  'bg-emerald-950', 'bg-red-950', 'bg-cyan-950', 'bg-amber-950',
  'bg-violet-950', 'bg-blue-950', 'bg-purple-950', 'bg-neutral-800'
];

export const AiRecommendationPanel: React.FC<AiRecommendationPanelProps> = ({
  onAddAiBookToCatalog,
  existingBooksCount,
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AiRecommendation[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successAddMap, setSuccessAddMap] = useState<Record<string, boolean>>({});

  const handleFetchRecommendations = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setErrorMsg('Tolong tuliskan apa yang sedang Anda cari terlebih dahulu.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setResults([]);
    setSuccessAddMap({});

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Terjadi kesalahan sistem.');
      }

      const data = await res.json();
      if (data.recommendations && Array.isArray(data.recommendations)) {
        setResults(data.recommendations);
      } else {
        throw new Error('Format rekomendasi tidak sesuai.');
      }
    } catch (err: any) {
      console.error('AI Error:', err);
      setErrorMsg(err.message || 'Gagal memanggil asisten AI. Pastikan server sudah siap.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToLibrary = (aiBook: AiRecommendation, idx: number) => {
    const randomCover = COVER_THEMES[Math.floor(Math.random() * COVER_THEMES.length)];
    
    // Construct a standard Book type object
    const newBookId = `ai-${Date.now()}-${idx}`;
    const newCatalogBook: Book = {
      id: newBookId,
      title: aiBook.title,
      author: aiBook.author,
      category: aiBook.category || 'Fiksi',
      rating: 0, // Freshly added by AI
      reviewsCount: 0,
      reviews: [],
      duration: aiBook.duration || '4 jam',
      pages: aiBook.pages || 250,
      coverColor: randomCover,
      synopsis: aiBook.synopsis,
      isCustom: true,
    };

    onAddAiBookToCatalog(newCatalogBook);

    // Track successfully added list to display immediate localized feedback
    setSuccessAddMap(prev => ({
      ...prev,
      [aiBook.title]: true
    }));
  };

  const popularPrompts = [
    "buku fiksi sejarah dengan bumbu romantis",
    "buku pengembangan diri penenang kecemasan",
    "buku strategi bisnis modern untuk pemula",
    "fiksi sains tentang kecerdasan buatan"
  ];

  return (
    <div className="bg-lit-cream rounded-2xl border border-lit-border p-6 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-lit-sage flex items-center justify-center text-white shrink-0 shadow-sm">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h4 className="font-serif italic font-bold text-lg text-lit-charcoal flex items-center gap-1.5">
            Rekomendasi Cerdas
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Butuh asisten mencari bacaan? Tulis topik, genre, atau suasana hati Anda di bawah, dan kami akan mencarikan 3 buku terbaik yang paling cocok dengan Anda.
          </p>
        </div>
      </div>

      {/* Input Form with direct prompts helper */}
      <form onSubmit={handleFetchRecommendations} className="space-y-3.5">
        <label htmlFor="ai-input" className="sr-only">Tanyakan asisten AI...</label>
        <div className="relative">
          <input 
            id="ai-input"
            type="text"
            placeholder="Ketik topik: 'saya ingin novel realisme magis Indonesia yang dramatis'..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            className="w-full text-xs pl-4 pr-32 py-3.5 bg-white border border-lit-border rounded-lg focus:ring-1 focus:ring-lit-sage outline-none transition-all placeholder:text-gray-400 font-medium"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-lit-sage hover:opacity-95 text-white font-bold text-[11px] px-5 py-2 rounded-md transition-all h-[36px] flex items-center justify-center gap-1 cursor-pointer disabled:bg-slate-300"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                <span>Rekomendasikan</span>
              </>
            )}
          </button>
        </div>

        {/* Clickable prompt suggestions */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
          <span className="font-semibold text-lit-sage">Coba ide ini:</span>
          {popularPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setPrompt(p)}
              disabled={loading}
              className="px-2 py-1 bg-white hover:bg-lit-cream border border-lit-border rounded-md transition-colors cursor-pointer text-slate-600"
            >
              "{p}"
            </button>
          ))}
        </div>
      </form>

      {/* Errors display */}
      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs flex gap-2 font-medium">
          <HelpCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Loading Block Screen */}
      {loading && (
        <div className="py-12 flex flex-col items-center justify-center space-y-3 bg-white rounded-2xl border border-lit-border/55">
          <Loader2 className="w-8 h-8 text-lit-sage animate-spin" />
          <div className="text-center">
            <h5 className="font-serif italic font-bold text-sm text-lit-charcoal">Merajut Saran Istimewa...</h5>
            <p className="text-[11px] text-slate-500 max-w-xs mt-1">
              Gemini AI sedang menyeleksi sinopsis dan alasan kecocokan khusus untuk Anda. Harap tunggu sebentar.
            </p>
          </div>
        </div>
      )}

      {/* Results Deck */}
      {results.length > 0 && (
        <div className="space-y-4 pt-2">
          <h5 className="font-serif italic font-bold text-sm text-lit-charcoal border-b border-lit-border pb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-lit-sage" />
            <span>Rekomendasi Terpilih Khusus Anda</span>
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {results.map((aiBook, idx) => {
              const wasAdded = successAddMap[aiBook.title];
              return (
                <div 
                  key={idx} 
                  className={`bg-white rounded-xl border border-lit-border p-4 shadow-xs flex flex-col justify-between transition-all duration-300 relative ${
                    wasAdded ? 'bg-lit-sage/5 border-emerald-200 ring-1 ring-emerald-100' : ''
                  }`}
                >
                  <div className="space-y-2.5">
                    <span className="bg-lit-sage/10 text-lit-sage border border-lit-sage/20 px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                      {aiBook.category}
                    </span>
                    <div>
                      <h6 className="font-serif font-bold text-sm text-lit-charcoal leading-tight">
                        {aiBook.title}
                      </h6>
                      <p className="text-[10px] text-slate-500 mt-0.5">Penulis: {aiBook.author}</p>
                    </div>

                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-medium">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 text-slate-400 mr-1" />
                        <span>{aiBook.duration}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center">
                        <BookOpen className="w-3 h-3 text-slate-400 mr-1" />
                        <span>{aiBook.pages} Hal.</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed">
                      {aiBook.synopsis}
                    </p>

                    {/* Highly important custom match explanation */}
                    <div className="bg-lit-cream border border-lit-border p-2.5 rounded-lg text-[11px] leading-relaxed text-slate-700 italic">
                      <b className="font-sans block text-[9px] not-italic uppercase tracking-widest text-lit-sage font-bold mb-0.5">Analisis AI:</b>
                      "{aiBook.reason}"
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-lit-border/40">
                    {wasAdded ? (
                      <button
                        type="button"
                        disabled
                        className="w-full bg-emerald-50 text-emerald-800 text-[11px] font-bold py-2 rounded-lg border border-emerald-200/50"
                      >
                        ✓ Ditambahkan ke Pustaka
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddToLibrary(aiBook, idx)}
                        className="w-full bg-lit-sage hover:opacity-95 text-white font-bold text-[11px] py-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Tambahkan ke Pustaka</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
