import React, { useState } from 'react';
import { Book } from '../types';
import { Plus, BookOpen, Clock, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface AddBookFormProps {
  onAddBook: (book: Book) => void;
}

const CATEGORIES = ['Fiksi', 'Pengembangan Diri', 'Bisnis', 'Sains & Teknologi'];

const MOODS_THEMES = [
  { name: 'Kuning Hangat / Cozy', class: 'bg-amber-900' },
  { name: 'Merah Berani / Sejarah', class: 'bg-red-900' },
  { name: 'Cyan Tenang / Filosofis', class: 'bg-cyan-950' },
  { name: 'Hijau Hutan / Inspirasi', class: 'bg-emerald-900' },
  { name: 'Ungu Mistis / Misteri', class: 'bg-violet-950' },
  { name: 'Biru Gelap / Akademis', class: 'bg-blue-950' },
  { name: 'Hitam Modern / Strategi', class: 'bg-slate-900' },
];

export const AddBookForm: React.FC<AddBookFormProps> = ({ onAddBook }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Fiksi');
  const [pages, setPages] = useState<number>(250);
  const [duration, setDuration] = useState('4 jam');
  const [synopsis, setSynopsis] = useState('');
  const [coverColor, setCoverColor] = useState('bg-amber-900');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !synopsis.trim()) {
      setErrorMsg('Harap isi judul, pengarang, dan sinopsis singkat untuk mendaftarkan buku.');
      return;
    }

    const newBookId = `custom-${Date.now()}`;
    const newBook: Book = {
      id: newBookId,
      title: title.trim(),
      author: author.trim(),
      category,
      rating: 0,
      reviewsCount: 0,
      reviews: [],
      duration: duration.trim() || '4 jam',
      pages: Number(pages) || 200,
      coverColor,
      synopsis: synopsis.trim(),
      isCustom: true,
    };

    onAddBook(newBook);

    // Reset Form
    setTitle('');
    setAuthor('');
    setCategory('Fiksi');
    setPages(250);
    setDuration('4 jam');
    setSynopsis('');
    setCoverColor('bg-amber-900');
    setErrorMsg('');
    setSuccessMsg('Buku baru berhasil ditambahkan ke pustaka utama!');
    
    // Auto-dismiss feedback message after 3 seconds
    setTimeout(() => {
      setSuccessMsg('');
    }, 3500);
  };

  return (
    <div className="bg-white rounded-2xl border border-lit-border p-6 shadow-sm">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left font-serif font-bold text-lg text-lit-charcoal italic focus:outline-none cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-lit-sage" />
          <span>Daftarkan / Tambah Buku Baru</span>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 pt-4 border-t border-lit-border/40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Title & Author */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-lit-sage uppercase tracking-widest mb-1.5 font-mono">
                  Judul Buku
                </label>
                <input
                  type="text"
                  placeholder="Masukkan judul buku..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2.5 bg-lit-cream border border-lit-border rounded-lg focus:ring-1 focus:ring-lit-sage outline-none transition-all placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-lit-sage uppercase tracking-widest mb-1.5 font-mono">
                  Nama Penulis / Pengarang
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama penulis..."
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full text-xs p-2.5 bg-lit-cream border border-lit-border rounded-lg focus:ring-1 focus:ring-lit-sage outline-none transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Category selector */}
              <div>
                <label className="block text-[10px] font-bold text-lit-sage uppercase tracking-widest mb-1.5 font-mono">
                  Kategori Buku
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`text-xs px-3 py-2.5 rounded-lg border font-medium transition-all cursor-pointer ${
                        category === cat
                          ? 'bg-lit-sage/10 border-lit-sage/30 text-lit-sage font-bold'
                          : 'bg-lit-cream border-lit-border text-slate-650 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Metas & Cover Style */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-lit-sage uppercase tracking-widest mb-1.5 font-mono flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Jumlah Halaman</span>
                  </label>
                  <input
                    type="number"
                    value={pages}
                    onChange={(e) => setPages(Number(e.target.value))}
                    min={1}
                    className="w-full text-xs p-2.5 bg-lit-cream border border-lit-border rounded-lg focus:ring-1 focus:ring-lit-sage outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-lit-sage uppercase tracking-widest mb-1.5 font-mono flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Estimasi Durasi</span>
                  </label>
                  <input
                    type="text"
                    placeholder="misal '4 jam'"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full text-xs p-2.5 bg-lit-cream border border-lit-border rounded-lg focus:ring-1 focus:ring-lit-sage outline-none transition-all"
                  />
                </div>
              </div>

              {/* Cover Color Picker */}
              <div>
                <label className="block text-[10px] font-bold text-lit-sage uppercase tracking-widest mb-1.5 font-mono">
                  Pilih Tema Warna Sampul Buku
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {MOODS_THEMES.map((theme) => (
                    <button
                      key={theme.class}
                      type="button"
                      onClick={() => setCoverColor(theme.class)}
                      className={`text-[11px] p-2 rounded-lg border flex items-center gap-2 cursor-pointer transition-all ${
                        coverColor === theme.class
                          ? 'border-lit-sage ring-1 ring-lit-sage/10 bg-lit-sage/5 text-lit-charcoal'
                          : 'border-lit-border bg-white hover:bg-[#FAF9F6] text-slate-600'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full shrink-0 ${theme.class}`} />
                      <span className="truncate">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Synopsis */}
          <div>
            <label className="block text-[10px] font-bold text-lit-sage uppercase tracking-widest mb-1.5 font-mono">
              Sinopsis Buku Singkat
            </label>
            <textarea
              placeholder="Tuliskan gambaran cerita atau pembahasan singkat dalam buku agar pembaca lain tertarik..."
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              rows={3}
              className="w-full text-xs p-3 bg-lit-cream border border-lit-border rounded-lg focus:ring-1 focus:ring-lit-sage outline-none transition-all placeholder:text-gray-400 resize-none leading-relaxed"
            />
          </div>

          {/* Feedback & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
            <div>
              {errorMsg && <p className="text-xs text-red-500 font-semibold">{errorMsg}</p>}
              {successMsg && <p className="text-xs text-emerald-600 font-semibold">{successMsg}</p>}
            </div>

            <button
              type="submit"
              className="bg-lit-sage hover:opacity-90 text-white font-bold text-xs py-3 px-6 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Daftarkan Buku</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
