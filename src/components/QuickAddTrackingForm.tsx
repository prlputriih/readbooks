import React, { useState, useMemo } from 'react';
import { Book, ReadingListItem } from '../types';
import { Plus, BookOpen, Search, Compass, Layers } from 'lucide-react';

interface QuickAddTrackingFormProps {
  books: Book[];
  readingList: ReadingListItem[];
  onAddSelectedBook: (bookId: number | string, currentPage: number, totalPages: number) => void;
  onAddCustomBook: (title: string, author: string, category: string, totalPages: number, currentPage: number, coverColor: string) => void;
}

const CATEGORIES = ['Fiksi', 'Pengembangan Diri', 'Bisnis', 'Sains & Teknologi', 'Filsafat & Agama', 'Lainnya'];

const THEMES = [
  { name: 'Hangat', bg: 'bg-amber-900', hoverBg: 'hover:bg-amber-800' },
  { name: 'Koleksi', bg: 'bg-red-900', hoverBg: 'hover:bg-red-800' },
  { name: 'Sage', bg: 'bg-[#606C5D]', hoverBg: 'hover:bg-[#4E584B]' },
  { name: 'Filosofis', bg: 'bg-cyan-950', hoverBg: 'hover:bg-cyan-900' },
  { name: 'Misteri', bg: 'bg-violet-950', hoverBg: 'hover:bg-violet-900' },
  { name: 'Akademis', bg: 'bg-blue-950', hoverBg: 'hover:bg-blue-900' },
];

export const QuickAddTrackingForm: React.FC<QuickAddTrackingFormProps> = ({
  books,
  readingList,
  onAddSelectedBook,
  onAddCustomBook,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'custom'>('catalog');
  
  // Search state for catalog sub-tab
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookId, setSelectedBookId] = useState<number | string | ''>('');
  const [selectedBookCurrentPage, setSelectedBookCurrentPage] = useState<number>(0);
  const [selectedBookTotalPages, setSelectedBookTotalPages] = useState<number>(250);

  // Custom book states
  const [customTitle, setCustomTitle] = useState('');
  const [customAuthor, setCustomAuthor] = useState('');
  const [customCategory, setCustomCategory] = useState('Fiksi');
  const [customTotalPages, setCustomTotalPages] = useState<number>(250);
  const [customCurrentPage, setCustomCurrentPage] = useState<number>(0);
  const [customCoverColor, setCustomCoverColor] = useState('bg-[#606C5D]');

  // Success / Error triggers
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filtering books that are NOT already in the user's reading list
  const availableBooks = useMemo(() => {
    return books.filter(
      (b) => !readingList.some((item) => String(item.bookId) === String(b.id))
    );
  }, [books, readingList]);

  // Filter books based on search query
  const filteredAvailableBooks = useMemo(() => {
    if (!searchQuery.trim()) return availableBooks;
    const q = searchQuery.toLowerCase();
    return availableBooks.filter(
      (b) =>
        b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
    );
  }, [availableBooks, searchQuery]);

  // Automatically update the total pages input when a book is selected from the catalog list
  const handleSelectBook = (bookId: number | string) => {
    setSelectedBookId(bookId);
    const book = books.find((b) => b.id === bookId);
    if (book) {
      setSelectedBookTotalPages(book.pages || 250);
      setSelectedBookCurrentPage(0);
    }
  };

  const handleCatalogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId) {
      setErrorMsg('Silakan pilih salah satu buku dari katalog terlebih dahulu.');
      return;
    }

    if (selectedBookCurrentPage < 0) {
      setErrorMsg('Halaman bacaan saat ini tidak boleh bernilai negatif.');
      return;
    }

    if (selectedBookTotalPages < 1) {
      setErrorMsg('Total halaman buku harus minimal 1 halaman.');
      return;
    }

    if (selectedBookCurrentPage > selectedBookTotalPages) {
      setErrorMsg('Halaman bacaan tidak boleh melebihi total halaman buku.');
      return;
    }

    onAddSelectedBook(selectedBookId, selectedBookCurrentPage, selectedBookTotalPages);
    
    // Clear state
    setSelectedBookId('');
    setSelectedBookCurrentPage(0);
    setSelectedBookTotalPages(250);
    setSearchQuery('');
    setErrorMsg('');
    setSuccessMsg('Buku dari katalog berhasil ditambahkan ke rencana pantauan Anda! 📖');
    
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) {
      setErrorMsg('Silakan lengkapi judul buku Anda.');
      return;
    }
    if (!customAuthor.trim()) {
      setErrorMsg('Silakan lengkapi nama pengarang buku.');
      return;
    }
    if (customCurrentPage < 0) {
      setErrorMsg('Halaman bacaan saat ini tidak boleh bernilai negatif.');
      return;
    }
    if (customTotalPages < 1) {
      setErrorMsg('Total halaman harus minimal 1 halaman.');
      return;
    }
    if (customCurrentPage > customTotalPages) {
      setErrorMsg('Halaman bacaan saat ini tidak boleh melebihi total halaman buku.');
      return;
    }

    onAddCustomBook(
      customTitle.trim(),
      customAuthor.trim(),
      customCategory,
      customTotalPages,
      customCurrentPage,
      customCoverColor
    );

    // Reset states
    setCustomTitle('');
    setCustomAuthor('');
    setCustomCategory('Fiksi');
    setCustomTotalPages(250);
    setCustomCurrentPage(0);
    setErrorMsg('');
    setSuccessMsg('Buku baru berhasil dibuat dan langsung dipantau di daftar bacaan! 🚀');

    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div id="quick-track-container" className="bg-white rounded-2xl border border-lit-border p-5 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-lit-sage/10 text-lit-sage flex items-center justify-center">
            <BookOpen className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-lit-charcoal text-sm leading-tight">Mulai Lacak Buku Baru</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Pantau halaman membaca Anda secara real-time</p>
          </div>
        </div>

        <button
          id="btn-toggle-quick-track"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
            isOpen 
              ? 'bg-[#F2EFE9] border-[#DCD5C9] text-slate-700' 
              : 'bg-lit-sage text-white border-lit-sage hover:opacity-95 shadow-3xs'
          }`}
        >
          <Plus className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-45' : ''}`} />
          <span>{isOpen ? 'Tutup Formulir' : 'Lacak Buku Sekarang'}</span>
        </button>
      </div>

      {isOpen && (
        <div className="mt-5 pt-4 border-t border-lit-border/40 animate-fade-in">
          
          {/* Sub tabs: select from Catalog vs Create Custom */}
          <div className="flex rounded-xl bg-[#FAF9F6] p-1 border border-lit-border/80 mb-4.5">
            <button
              type="button"
              id="subtab-catalog"
              onClick={() => {
                setActiveSubTab('catalog');
                setErrorMsg('');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeSubTab === 'catalog'
                  ? 'bg-white text-lit-sage shadow-3xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Pilih Dari Katalog</span>
            </button>
            <button
              type="button"
              id="subtab-custom"
              onClick={() => {
                setActiveSubTab('custom');
                setErrorMsg('');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeSubTab === 'custom'
                  ? 'bg-white text-[#8B7E66] shadow-3xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tulis Buku Baru Sendiri</span>
            </button>
          </div>

          {/* Messages info popup notifications */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-100 text-red-750 text-[11px] p-2.5 rounded-xl mb-4 font-medium flex items-center gap-1.5">
              <span>⚠️ {errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] p-2.5 rounded-xl mb-4 font-medium flex items-center gap-1.5">
              <span>🎉 {successMsg}</span>
            </div>
          )}

          {/* TAB CONTENT A: CHOOSE EXISTING BOOKS CATALOG */}
          {activeSubTab === 'catalog' && (
            <form onSubmit={handleCatalogSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                  Pencarian Buku Di Katalog
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    id="search-catalog-track"
                    placeholder="Ketik judul buku atau pengarang..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-lit-cream border border-lit-border rounded-xl text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-lit-sage"
                  />
                </div>
              </div>

              {/* List selection area */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                  Pilih Buku ({filteredAvailableBooks.length} Buku Tersisa)
                </span>
                
                {filteredAvailableBooks.length === 0 ? (
                  <div className="text-center py-4 bg-[#FAF9F6] border border-dashed border-slate-200 rounded-xl">
                    <p className="text-[11px] text-slate-400 italic">
                      {searchQuery ? 'Buku tidak ditemukan.' : 'Seluruh buku di katalog sudah masuk dalam pelacak Anda.'}
                    </p>
                  </div>
                ) : (
                  <div className="max-h-32 overflow-y-auto pr-1 border border-lit-border/60 rounded-xl p-1.5 space-y-1 bg-[#FAF9F6]">
                    {filteredAvailableBooks.map((book) => (
                      <button
                        type="button"
                        key={book.id}
                        onClick={() => handleSelectBook(book.id)}
                        className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-colors cursor-pointer text-xs ${
                          selectedBookId === book.id
                            ? 'bg-lit-sage text-white'
                            : 'bg-white hover:bg-slate-50 border border-slate-100 text-slate-700'
                        }`}
                      >
                        <div>
                          <p className="font-bold line-clamp-1">{book.title}</p>
                          <p className={`text-[10px] ${selectedBookId === book.id ? 'text-slate-200' : 'text-slate-400'}`}>
                            oleh {book.author}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-[9px] font-semibold px-2 py-0.5 rounded border ${
                            selectedBookId === book.id
                              ? 'bg-white/10 text-white border-white/20'
                              : 'bg-slate-50 text-slate-550 border-slate-200'
                          }`}>
                            {book.pages || 250} Hal
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Input for Current page progress */}
              {selectedBookId && (
                <div className="grid grid-cols-2 gap-4 bg-lit-cream/40 p-3 rounded-xl border border-lit-border/50">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono mb-1">
                      Halaman Mulai Lacak
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={selectedBookTotalPages}
                      value={selectedBookCurrentPage}
                      onChange={(e) => setSelectedBookCurrentPage(parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-bold font-mono text-slate-805"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono mb-1">
                      Total Halaman Buku
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={selectedBookTotalPages}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setSelectedBookTotalPages(val);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-bold font-mono text-slate-500"
                    />
                  </div>
                </div>
              )}

              {/* Submit btn */}
              <button
                type="submit"
                disabled={!selectedBookId}
                className="w-full bg-lit-sage text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer hover:opacity-95 disabled:opacity-40 flex items-center justify-center gap-1.5 h-10 shadow-3xs"
              >
                <Plus className="w-4 h-4" />
                <span>Mulai Lacak Buku Terpilih</span>
              </button>
            </form>
          )}

          {/* TAB CONTENT B: CHOOSE CUSTOM BOOK CREATION */}
          {activeSubTab === 'custom' && (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                    Judul Buku Baru
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Sang Pemimpi, Laskar Pelangi..."
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full py-2 px-3 bg-lit-cream border border-lit-border rounded-xl text-xs font-medium placeholder-slate-400 focus:outline-none"
                  />
                </div>

                {/* Author */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                    Nama Pengarang / Penulis
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Andrea Hirata, dsb..."
                    value={customAuthor}
                    onChange={(e) => setCustomAuthor(e.target.value)}
                    className="w-full py-2 px-3 bg-lit-cream border border-lit-border rounded-xl text-xs font-medium placeholder-slate-400 focus:outline-none"
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                    Kategori Buku
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full py-2 px-2.5 bg-lit-cream border border-lit-border rounded-xl text-xs font-medium focus:outline-none text-slate-650"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom Color Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                    Warna Sampul Visual
                  </label>
                  <div className="flex items-center gap-1.5 py-1">
                    {THEMES.map((theme) => (
                      <button
                        type="button"
                        key={theme.name}
                        onClick={() => setCustomCoverColor(theme.bg)}
                        className={`w-6 h-6 rounded-full ${theme.bg} ${theme.hoverBg} border-2 transition-all cursor-pointer shrink-0 ${
                          customCoverColor === theme.bg ? 'border-lit-charcoal scale-110 shadow-xs' : 'border-transparent'
                        }`}
                        title={theme.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Total Pages */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                    Total Halaman Buku
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={customTotalPages}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setCustomTotalPages(val);
                    }}
                    className="w-full py-2 px-3 bg-lit-cream border border-lit-border rounded-xl text-xs font-bold font-mono text-slate-500 focus:outline-none"
                  />
                </div>

                {/* Current Page */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                    Sedang Membaca s.d Halaman
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={customTotalPages}
                    value={customCurrentPage}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setCustomCurrentPage(val);
                    }}
                    className="w-full py-2 px-3 bg-lit-cream border border-lit-border rounded-xl text-xs font-bold font-mono text-slate-805 focus:outline-none"
                  />
                </div>

              </div>

              {/* Action submission custom button */}
              <button
                type="submit"
                className="w-full bg-[#8B7E66] text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer hover:bg-[#786D57] flex items-center justify-center gap-1.5 h-10 shadow-3xs mt-1"
              >
                <Plus className="w-4 h-4" />
                <span>Tambahkan Buku Baru & Mulai Pantau</span>
              </button>
            </form>
          )}

        </div>
      )}
    </div>
  );
};
