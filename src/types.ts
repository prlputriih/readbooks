export interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Book {
  id: number | string; // Custom books can have string UUIDs
  title: string;
  author: string;
  category: string;
  rating: number;
  reviewsCount: number;
  reviews: Review[];
  duration: string;
  pages: number;
  coverColor: string; // Tailwind bg class names
  synopsis: string;
  buyUrl?: string;
  isCustom?: boolean;
}

export interface ReadingListItem {
  bookId: number | string;
  progressStatus: 'ingin_dibaca' | 'sedang_dibaca' | 'selesai';
  notes?: string;
  savedAt: string;
  userId?: string;
}
