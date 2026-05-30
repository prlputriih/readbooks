import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Dice5, 
  Sparkles, 
  BookOpen, 
  Bookmark, 
  BookmarkCheck, 
  RotateCcw, 
  Compass, 
  HelpCircle,
  HelpCircle as QuestionIcon,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Book } from '../types';

interface ShuffleModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  onOpenBookDetail: (book: Book) => void;
  onToggleBookmark: (bookId: number | string) => void;
  isBookSaved: (bookId: number | string) => boolean;
  dynamicCategories: string[];
}

export const ShuffleModal: React.FC<ShuffleModalProps> = ({
  isOpen,
  onClose,
  books,
  onOpenBookDetail,
  onToggleBookmark,
  isBookSaved,
  dynamicCategories,
}) => {
  const [step, setStep] = useState<'welcome' | 'rolling' | 'result'>('welcome');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [rolledBook, setRolledBook] = useState<Book | null>(null);
  
  // Animation states for the rolling step
  const [animationBook, setAnimationBook] = useState<Book | null>(null);
  const animationIndexRef = useRef<number>(0);
  const cycleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Filtered pool to shuffle from
  const getPool = () => {
    if (selectedCategory === 'Semua') {
      return books;
    }
    return books.filter(b => b.category === selectedCategory);
  };

  const pool = getPool();

  // Reset modal states when opened/closed
  useEffect(() => {
    if (isOpen) {
      setStep('welcome');
      setRolledBook(null);
      setAnimationBook(null);
    } else {
      if (cycleIntervalRef.current) {
        clearInterval(cycleIntervalRef.current);
      }
    }
  }, [isOpen]);

  const handleStartRoll = () => {
    if (pool.length === 0) return;
    
    setStep('rolling');
    setAnimationBook(pool[0]);
    animationIndexRef.current = 0;

    // Fast cycling for slots or dice roll visual effect
    let speed = 60; // ms per frame
    let duration = 0;
    const maxDuration = 1600; // roll duration 1.6s

    const cycle = () => {
      if (pool.length === 0) return;
      const nextIndex = (animationIndexRef.current + 1) % pool.length;
      animationIndexRef.current = nextIndex;
      setAnimationBook(pool[nextIndex]);
      
      duration += speed;
      if (duration >= maxDuration) {
        // Choose final book
        const finalRandomRes = pool[Math.floor(Math.random() * pool.length)];
        setRolledBook(finalRandomRes);
        setStep('result');
        if (cycleIntervalRef.current) {
          clearInterval(cycleIntervalRef.current);
        }
      } else {
        // Slowly increase wait time to make the wheel feel like deceleration
        if (duration > maxDuration * 0.7) {
          speed = 150;
          if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current);
          cycleIntervalRef.current = setInterval(cycle, speed);
        }
      }
    };

    cycleIntervalRef.current = setInterval(cycle, speed);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-lit-charcoal/45 backdrop-blur-xs transition-all duration-300">
      <div 
        className="w-full max-w-lg bg-white border border-lit-border rounded-3xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header HUD */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-lit-cream/40">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-lit-sage/10 text-lit-sage flex items-center justify-center">
              <Dice5 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-lit-charcoal">Dadu Literatur</h3>
              <p className="text-[10px] text-slate-500 font-medium">Temukan bacaan Anda hari ini</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body with custom heights */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col justify-center">
          
          {/* STEP 1: WELCOME SCREEN (Enter before Shuffling) */}
          {step === 'welcome' && (
            <div className="space-y-5 text-center py-4 animate-fade-in">
              <div className="w-16 h-16 bg-lit-sage/10 text-lit-sage rounded-2xl mx-auto flex items-center justify-center animate-bounce">
                <Dice5 className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-serif italic text-lg font-bold text-lit-charcoal">Siap memutar roda keselarasan?</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Dadu Literatur membantu Anda memecahkan kebimbangan membaca dengan memilih satu buku pilihan secara acak.
                </p>
              </div>

              {/* Pool details explanation cards */}
              <div className="p-4 bg-lit-cream border border-lit-border rounded-xl text-left text-xs space-y-3">
                <div className="flex gap-2 text-[11px] text-slate-600">
                  <HelpCircle className="w-4 h-4 text-lit-sage shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-lit-charcoal block mb-0.5">Metode Pengacakan:</span>
                    Kami mengumpulkan semua buku dari katalog utama Anda. Roda berputar dengan probabilitas merata 100% adil.
                  </div>
                </div>

                {/* Scope selector */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-[11px] font-bold text-lit-charcoal mb-2">
                    Skup Filter Kategori:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {dynamicCategories.map((cat) => {
                      const displayCat = cat === 'Semua' ? 'Semua Koleksi' : cat;
                      const isSelected = selectedCategory === cat;
                      
                      // Count of books in this cat
                      const count = cat === 'Semua' 
                        ? books.length 
                        : books.filter(b => b.category === cat).length;

                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-lit-sage text-white shadow-xs' 
                              : 'bg-white text-slate-600 border border-lit-border hover:bg-slate-50'
                          }`}
                        >
                          {displayCat} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartRoll}
                  disabled={pool.length === 0}
                  className="w-full bg-lit-sage hover:opacity-90 text-white font-bold text-xs py-3 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  <Dice5 className="w-4 h-4 animate-spin" />
                  <span>Kocok Sekarang (Pilih Dari {pool.length} Buku)</span>
                </button>
                {pool.length === 0 && (
                  <p className="text-[10px] text-red-500 font-medium mt-2 text-center">
                    Tidak ada buku dalam kategori ini untuk dikocok!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: CYCLING SHUFFLE ANIMATION SCREEN */}
          {step === 'rolling' && animationBook && (
            <div className="text-center py-8 space-y-6 animate-fade-in flex flex-col items-center">
              {/* Spinner layout mimicking slot or shuffling pile */}
              <div className="relative w-40 h-56 rounded-2xl shadow-xl overflow-hidden flex flex-col justify-end text-left border border-white/20 transition-all duration-150 transform hover:scale-102">
                {/* Book color cover background */}
                <div className={`absolute inset-0 ${animationBook.coverColor || 'bg-slate-900'} transition-all duration-150`} />
                
                {/* Book spine aesthetic pattern overlay */}
                <div className="absolute top-0 bottom-0 left-0 w-3 bg-black/10 z-10 border-r border-white/10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                
                <div className="p-4 relative z-20 space-y-1.5">
                  <span className="text-[9px] bg-white/25 text-white backdrop-blur-xs px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                    {animationBook.category}
                  </span>
                  <h5 className="font-serif font-bold text-sm text-white leading-tight line-clamp-2">
                    {animationBook.title}
                  </h5>
                  <p className="text-[10px] text-slate-300">
                    Oleh {animationBook.author}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-lit-sage tracking-widest uppercase animate-pulse flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  Memutar Roda Keselarasan...
                </h4>
                <p className="text-[11px] text-slate-500 font-medium italic">
                  &ldquo;Membuka helai-helai takdir membacamu...&rdquo;
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: REVEAL RESULTS SCREEN */}
          {step === 'result' && rolledBook && (
            <div className="space-y-4 animate-fade-in py-2">
              <div className="text-center pb-2">
                <span className="inline-flex items-center gap-1 text-[10px] px-3 py-1 bg-lit-sage/10 text-lit-sage rounded-full font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  Pilihan Takdir Membaca Anda!
                </span>
              </div>

              {/* Big Book Presenter Layout */}
              <div className="flex flex-col sm:flex-row gap-5 p-4 bg-lit-cream border border-lit-border rounded-2xl items-center sm:items-start text-center sm:text-left">
                {/* Cover representation */}
                <div className={`w-28 h-40 rounded-xl shadow-lg shrink-0 overflow-hidden relative flex flex-col justify-end text-left border border-white/25`}>
                  <div className={`absolute inset-0 ${rolledBook.coverColor || 'bg-slate-900'}`} />
                  <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-black/10 z-10 border-r border-white/10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                  <div className="p-2.5 relative z-20 space-y-1">
                    <span className="text-[7.5px] bg-white/20 text-white px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider">
                      {rolledBook.category}
                    </span>
                    <h6 className="font-serif font-bold text-xs text-white leading-tight line-clamp-2">
                      {rolledBook.title}
                    </h6>
                    <p className="text-[8px] text-slate-300">
                      Oleh {rolledBook.author}
                    </p>
                  </div>
                </div>

                {/* Specific details */}
                <div className="flex-1 space-y-2.5">
                  <div>
                    <h4 className="font-serif font-bold text-lg text-lit-charcoal leading-tight">
                      {rolledBook.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium font-serif italic mt-0.5">
                      Ditulis oleh {rolledBook.author}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3.5 text-[10px] font-mono text-slate-450">
                    <div className="flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-lit-sage" />
                      <span>{rolledBook.category}</span>
                    </div>
                    {rolledBook.pages && (
                      <div className="flex items-center space-x-1">
                        <span>•</span>
                        <span>{rolledBook.pages} Halaman</span>
                      </div>
                    )}
                    {rolledBook.duration && (
                      <div className="flex items-center space-x-1">
                        <span>•</span>
                        <span>Estimasi {rolledBook.duration}</span>
                      </div>
                    )}
                  </div>

                  {rolledBook.synopsis ? (
                    <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                      {rolledBook.synopsis}
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">
                      Tidak ada ringkasan sinopsis untuk buku khusus ini.
                    </p>
                  )}
                </div>
              </div>

              {/* Action Operations Bar inside Result */}
              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={handleStartRoll}
                  className="bg-white border border-lit-border hover:bg-slate-50 text-lit-charcoal font-bold text-xs py-3 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Kocok Ulang</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose(); // Close Shuffle Modal
                    onOpenBookDetail(rolledBook); // Open Detailed Book view with reviews
                  }}
                  className="bg-lit-sage hover:opacity-90 text-white font-bold text-xs py-3 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Buka Ulasan & Detail</span>
                </button>
              </div>

              {/* Quick Bookmark Save toggle widget */}
              <div className="p-3 bg-lit-cream border border-lit-border rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[11px] font-medium text-slate-500">
                  <Bookmark className="w-3.5 h-3.5 text-lit-sage" />
                  <span>Tambahkan ke daftar bacaan pribadi Anda?</span>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleBookmark(rolledBook.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1 transition-all cursor-pointer ${
                    isBookSaved(rolledBook.id)
                      ? 'bg-lit-charcoal text-white border-lit-charcoal'
                      : 'bg-white text-lit-charcoal border-lit-border hover:bg-slate-50'
                  }`}
                >
                  {isBookSaved(rolledBook.id) ? (
                    <>
                      <BookmarkCheck className="w-3 h-3 text-lit-sage" />
                      <span>Tersimpan</span>
                    </>
                  ) : (
                    <>
                      <span>+ Tambahkan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
