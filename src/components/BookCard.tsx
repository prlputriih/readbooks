import React from 'react';
import { Book } from '../types';
import { Star, BookOpen, Bookmark, BookmarkCheck } from 'lucide-react';

interface BookCardProps {
  book: Book;
  isSaved: boolean;
  onSelect: (book: Book) => void;
  onToggleSave: (e: React.MouseEvent, bookId: number | string) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  isSaved,
  onSelect,
  onToggleSave,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-lit-border overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full group">
      {/* Dynamic Book Spine styled cover cover container */}
      <div 
        onClick={() => onSelect(book)}
        className={`h-48 relative flex items-center justify-center p-5 cursor-pointer overflow-hidden ${book.coverColor} transition-colors`}
      >
        {/* Soft light reflection and physical book shadow overlay */}
        <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/25 to-transparent blur-[0.5px]" />
        <div className="absolute inset-y-0 left-3 w-1.5 bg-white/10" />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />

        {/* Category Label */}
        <span className="absolute top-3 left-4 bg-white/20 backdrop-blur-md text-white text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded shadow-sm">
          {book.category}
        </span>

        {/* Bookmark Indicator if Saved */}
        {isSaved && (
          <span className="absolute top-3 right-4 bg-lit-sage text-white text-[10px] p-1.5 rounded-full shadow-md animate-fade-in animate-pulse">
            <BookmarkCheck className="w-3.5 h-3.5" />
          </span>
        )}

        {/* Elegant typography pairing: Serif font for book title, Mono for author */}
        <div className="text-center text-white px-3 select-none pointer-events-none drop-shadow-sm">
          <h4 className="font-serif font-bold text-base leading-snug line-clamp-2 uppercase tracking-wide">
            {book.title}
          </h4>
          <p className="text-[10px] font-mono tracking-widest mt-2 uppercase opacity-80">
            {book.author}
          </p>
        </div>
      </div>

      {/* Book description & stats footer */}
      <div className="p-5 flex-grow flex flex-col justify-between space-y-4 bg-white">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 text-xs text-gray-400 font-medium">
            <div className="flex items-center text-lit-sage font-bold">
              <Star className="w-3 h-3 fill-lit-sage stroke-lit-sage mr-1" />
              <span>{book.rating > 0 ? book.rating.toFixed(1) : 'Baru'}</span>
            </div>
            <span>•</span>
            <div className="flex items-center text-gray-500">
              <BookOpen className="w-3 h-3 text-gray-400 mr-1" />
              <span>{book.pages} Halaman</span>
            </div>
          </div>

          <h4 
            onClick={() => onSelect(book)}
            className="font-serif italic font-bold text-lit-charcoal text-base leading-snug hover:text-lit-sage transition-colors cursor-pointer line-clamp-1"
          >
            {book.title}
          </h4>
          <p className="text-xs text-slate-500 italic">oleh {book.author}</p>
          
          {book.synopsis && (
            <p className="text-[12px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
              {book.synopsis}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 pt-3 border-t border-lit-border/40">
          <button 
            onClick={() => onSelect(book)}
            className="flex-grow py-2 text-xs font-bold border border-lit-sage text-lit-sage rounded-lg hover:bg-lit-sage hover:text-white transition-all text-center cursor-pointer"
          >
            Lihat Ulasan
          </button>
          
          <button 
            type="button"
            onClick={(e) => onToggleSave(e, book.id)}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              isSaved 
                ? 'bg-lit-sage/10 text-lit-sage border-lit-sage/20' 
                : 'bg-white text-gray-400 border-lit-border hover:border-lit-sage hover:text-lit-sage'
            }`}
            title={isSaved ? "Hapus dari Daftar Bacaan" : "Simpan ke Daftar Bacaan"}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-lit-sage text-lit-sage' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
