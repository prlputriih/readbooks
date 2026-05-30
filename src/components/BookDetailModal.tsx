import React, { useState, useEffect, useMemo } from 'react';
import { Book, Review } from '../types';
import { X, Star, BookOpen, Clock, Bookmark, ShoppingBag, Send } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface BookDetailModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
  onSubmitReview: (bookId: number | string, name: string, rating: number, comment: string) => void;
  isLoggedIn: boolean;
  onTriggerAuth: () => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  isOpen,
  onClose,
  isSaved,
  onToggleSave,
  onSubmitReview,
  isLoggedIn,
  onTriggerAuth,
}) => {
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [fbReviews, setFbReviews] = useState<Review[]>([]);

  // Auto-fill authenticated user's name
  useEffect(() => {
    if (isOpen) {
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.displayName) {
        setReviewerName(currentUser.displayName);
      } else {
        setReviewerName('');
      }
    }
  }, [isOpen]);

  // Sync real-time public reviews from Firestore for this book
  useEffect(() => {
    if (!isOpen || !book) return;

    const q = query(collection(db, 'reviews'), where('bookId', '==', String(book.id)));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedReviews: Review[] = [];
      snapshot.forEach((doc) => {
        loadedReviews.push(doc.data() as Review);
      });
      setFbReviews(loadedReviews);
    }, (error) => {
      console.error("Gagal memuat ulasan publik real-time:", error);
    });

    return () => unsubscribe();
  }, [isOpen, book?.id]);

  const combinedReviews = useMemo(() => {
    if (!book) return [];
    const combined = [...fbReviews, ...(book.reviews || [])];
    const seen = new Set();
    return combined.filter(r => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
  }, [fbReviews, book?.reviews]);

  if (!isOpen || !book) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !comment.trim()) {
      setErrorMsg('Harap lengkapi nama Anda dan ulasan komentar Anda.');
      return;
    }
    setErrorMsg('');
    onSubmitReview(book.id, reviewerName.trim(), rating, comment.trim());
    
    // Reset form
    const currentUser = auth.currentUser;
    setReviewerName(currentUser?.displayName || '');
    setRating(5);
    setComment('');
  };

  const formattedBuyUrl = book.buyUrl || `https://www.google.com/search?q=beli+buku+${encodeURIComponent(book.title)}+${encodeURIComponent(book.author)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Dark overlay backdrop screen */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-gray-900 bg-opacity-65 backdrop-blur-xs transition-opacity" 
      />

      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal panel wrapper code */}
        <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full border border-lit-border animate-fade-in">
          {/* Close Floating button */}
          <div className="absolute top-5 right-5 z-10">
            <button 
              type="button"
              onClick={onClose}
              className="bg-slate-150 hover:bg-lit-sage/20 hover:text-lit-sage text-gray-500 rounded-full w-8 h-8 flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white px-6 pt-8 pb-6 sm:p-8">
            <div className="sm:flex sm:items-start gap-8">
              
              {/* Dynamic Spine Book Mock on Left Side */}
              <div className="w-full sm:w-44 flex-shrink-0 flex justify-center mb-6 sm:mb-0">
                <div className={`w-40 h-56 rounded-xl shadow-lg relative flex flex-col justify-between p-4 text-white overflow-hidden ${book.coverColor}`}>
                  {/* Book Spine texture overlay */}
                  <div className="absolute inset-y-0 left-0 w-3.5 bg-gradient-to-r from-black/25 to-transparent blur-[0.5px]" />
                  <div className="absolute inset-y-0 left-3.5 w-1 bg-white/10" />
                  <div className="absolute inset-0 bg-black/5" />
                  
                  <span className="text-[10px] font-bold tracking-widest uppercase opacity-75 relative z-10">
                    {book.category}
                  </span>
                  
                  <h4 className="font-serif font-bold text-sm leading-tight mt-6 line-clamp-4 uppercase tracking-wide relative z-10 text-shadow">
                    {book.title}
                  </h4>
                  
                  <p className="text-[9px] font-mono tracking-wider mt-auto font-medium z-10 opacity-90">
                    {book.author}
                  </p>
                </div>
              </div>

              {/* Book Metadata and Main Panels */}
              <div className="flex-grow space-y-5">
                <div>
                  <span className="bg-lit-sage/10 text-lit-sage border border-lit-sage/20 text-[10px] font-bold tracking-wider px-3 py-1 rounded-full uppercase">
                    Kategori: {book.category}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-lit-charcoal mt-2.5 leading-snug">
                    {book.title}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">oleh {book.author}</p>
                </div>

                {/* Rating and quick facts */}
                <div className="flex flex-wrap gap-4 border-y border-lit-border/30 py-3 text-xs font-medium text-slate-600">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-lit-sage stroke-lit-sage text-lit-sage" />
                    <span className="font-bold text-slate-800 text-sm">
                      {book.rating > 0 ? book.rating.toFixed(1) : '-'}
                    </span>
                    <span className="text-slate-400">({book.reviewsCount} Ulasan)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Durasi: {book.duration || 'Waktu Fleksibel'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    <span>{book.pages} Hal.</span>
                  </div>
                </div>

                {/* Synopsis */}
                <div>
                  <h4 className="text-[10px] font-bold text-lit-sage uppercase tracking-wider mb-1.5 font-mono">Sinopsis Singkat</h4>
                  <p className="text-sm text-slate-600 leading-relaxed font-sans bg-lit-cream p-3.5 rounded-xl border border-lit-border">
                    {book.synopsis || 'Sinopsis belum tersedia untuk ulasan ini.'}
                  </p>
                </div>

                {/* Main Interactive Button Actions */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={onToggleSave}
                    className={`font-semibold text-sm px-6 py-3 rounded-lg transition-all shadow-xs flex items-center justify-center space-x-2 flex-grow sm:flex-grow-0 cursor-pointer ${
                      isSaved 
                        ? 'bg-lit-sage/15 hover:bg-lit-sage/25 text-lit-charcoal border border-lit-sage/35'
                        : 'bg-lit-sage hover:opacity-95 text-white'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-lit-sage text-lit-sage' : ''}`} />
                    <span>{isSaved ? 'Tersimpan di Pustaka ulasan' : 'Simpan ke Pustaka ulasan'}</span>
                  </button>

                  <a 
                    href={formattedBuyUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-lit-cream hover:bg-lit-highlight text-lit-charcoal border border-lit-border font-semibold text-sm px-6 py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <ShoppingBag className="w-4 h-4 text-lit-sage" />
                    <span>Cari Buku ke Toko</span>
                  </a>
                </div>
              </div>

            </div>

            {/* LOWER PORTION: REVIEWS LIST AND ADD REVIEW FORM */}
            {!isLoggedIn ? (
              <div className="mt-8 border-t border-slate-100 pt-8">
                <div className="text-center py-10 px-6 bg-lit-cream rounded-3xl border border-lit-border shadow-3xs">
                  <div className="w-12 h-12 bg-white border border-lit-border rounded-xl flex items-center justify-center mx-auto mb-4 text-lit-sage shadow-xs">
                    <Bookmark className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-serif italic font-bold text-lit-charcoal">Ulasan & Daftar Bacaan Terkunci</h4>
                  <p className="text-slate-600 text-xs mt-2 max-w-sm mx-auto leading-relaxed">
                    Ulasan pembaca, penilaian rating, dan fitur daftar bacaan buku ini hanya tersedia bagi pengguna terdaftar. Silakan masuk terlebih dahulu melalui laman login.
                  </p>
                  <button
                    type="button"
                    onClick={onTriggerAuth}
                    className="mt-5 bg-lit-sage hover:opacity-95 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Masuk Sekarang
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-8 border-t border-slate-100 pt-8 grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* Reviews Feed list (Col Span 7) */}
                <div className="md:col-span-7 space-y-4">
                  <h4 className="font-serif italic font-bold text-lg text-lit-charcoal md:text-xl">Ulasan Pembaca ({combinedReviews.length})</h4>
                  
                  <div className="space-y-4.5 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {combinedReviews.length === 0 ? (
                      <div className="text-center py-8 bg-lit-cream rounded-xl border border-dashed border-lit-border">
                        <p className="text-gray-400 text-xs">Belum ada ulasan untuk buku ini. Jadilah yang pertama mengulasnya! ✒</p>
                      </div>
                    ) : (
                      combinedReviews.map((rev) => (
                        <div key={rev.id} className="bg-lit-cream/70 p-4 rounded-xl border border-lit-border/40 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-xs text-slate-805 block">{rev.reviewerName}</span>
                              <span className="text-[10px] text-gray-400 font-mono italic">{rev.createdAt}</span>
                            </div>
                            <div className="flex items-center bg-lit-sage/10 px-2 py-0.5 rounded-md">
                              <Star className="w-3 h-3 fill-lit-sage stroke-lit-sage mr-1 text-lit-sage" />
                              <span className="text-xs font-bold text-lit-sage">{rev.rating}</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-650 leading-relaxed font-sans italic">
                            "{rev.comment}"
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Form add new review (Col Span 5) */}
                <div className="md:col-span-5 bg-lit-cream p-5 rounded-2xl border border-lit-border space-y-4">
                  <h4 className="font-serif italic font-bold text-base text-lit-charcoal flex items-center space-x-1.5">
                    <span>Berikan Ulasan Anda</span>
                  </h4>

                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    {/* Name Input */}
                    <div>
                      <label className="block text-[10px] font-bold text-lit-sage uppercase tracking-wider mb-1.5 font-mono">
                        Nama Pembaca
                      </label>
                      <input 
                        type="text" 
                        placeholder="Masukkan nama Anda..."
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-lit-border rounded-lg focus:ring-1 focus:ring-lit-sage focus:border-lit-sage outline-none transition-all placeholder:text-gray-400"
                      />
                    </div>

                    {/* Rating Selector */}
                    <div>
                      <label className="block text-[10px] font-bold text-lit-sage uppercase tracking-wider mb-1.5 font-mono">
                        Penilaian Rating
                      </label>
                      <div className="flex items-center space-x-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className="p-0.5 hover:scale-110 transition-all text-[#8A9A5B] cursor-pointer bg-transparent border-none"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                          >
                            <Star 
                              className={`w-6 h-6 ${
                                star <= (hoverRating ?? rating) 
                                  ? 'fill-lit-sage stroke-[#8A9A5B] text-lit-sage' 
                                  : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comment input widget */}
                    <div>
                      <label className="block text-[10px] font-bold text-lit-sage uppercase tracking-wider mb-1.5 font-mono">
                        Ulasan / Komentar Buku
                      </label>
                      <textarea 
                        placeholder="Bagaimana pendapat atau ulasan Anda mengenai isi bacaan buku ini?..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        className="w-full text-xs p-2.5 bg-white border border-lit-border rounded-lg focus:ring-1 focus:ring-lit-sage focus:border-lit-sage outline-none transition-all placeholder:text-gray-400 resize-none leading-relaxed"
                      />
                    </div>

                    {errorMsg && (
                      <p className="text-[11px] text-red-500 font-medium">{errorMsg}</p>
                    )}

                    <button 
                      type="submit"
                      className="w-full bg-lit-sage hover:opacity-90 text-white font-bold text-xs py-3 rounded-lg transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Ulasan</span>
                    </button>
                  </form>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
