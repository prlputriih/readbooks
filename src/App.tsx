import React, { useState, useEffect, useMemo } from 'react';
import { Book, Review, ReadingListItem } from './types';
import { BookCard } from './components/BookCard';
import { BookDetailModal } from './components/BookDetailModal';
import { AiRecommendationPanel } from './components/AiRecommendationPanel';
import { AddBookForm } from './components/AddBookForm';
import { AuthModal } from './components/AuthModal';
import { ShuffleModal } from './components/ShuffleModal';
import { 
  BookOpen, 
  Compass, 
  Bookmark, 
  Dice5, 
  Search, 
  Sparkles, 
  FileText,
  Calendar,
  Instagram,
  Twitter,
  Github,
  Mail,
  Phone,
  CheckCircle2,
  BookmarkCheck,
  Award,
  Bell,
  X,
  LogIn,
  LogOut,
  User,
  Check,
  Loader2
} from 'lucide-react';
import { db, auth, OperationType, handleFirestoreError } from './firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, updateDoc, deleteDoc, collection, onSnapshot, getDocs } from 'firebase/firestore';

// Seeding Initial 12 Indonesia reading database catalog
const SEED_BOOKS: Book[] = [
  {
    id: 1,
    title: "Bumi Manusia",
    author: "Pramoedya Ananta Toer",
    category: "Fiksi",
    rating: 4.8,
    reviewsCount: 3,
    reviews: [
      { id: 'r1-1', reviewerName: 'Hendra Wijaya', rating: 5, comment: 'Sebuah mahakarya sastra Indonesia. Penggambaran sejarah feodalisme dan kolonialismenya sangat membekas di hati.', createdAt: '2026-02-15' },
      { id: 'r1-2', reviewerName: 'Siti Rahma', rating: 4, comment: 'Cinta Minke dan Annelies sungguh romantis namun tragis. Karakter Nyai Ontosoroh luar biasa tangguh.', createdAt: '2026-03-01' },
      { id: 'r1-3', reviewerName: 'Dewi Lestari', rating: 5, comment: 'Buku wajib untuk semua generasi muda Indonesia agar memahami arti kebebasan berpikir.', createdAt: '2026-05-10' }
    ],
    duration: "6-8 jam",
    pages: 535,
    coverColor: "bg-red-900",
    synopsis: "Sebuah novel sejarah monumental yang berlatar pada pergantian abad ke-20 di zaman Hindia Belanda. Mengisahkan perjuangan asmara antara Minke, seorang pemuda pribumi revolusioner, dan Annelies Mellema, gadis Indo-Eropa yang tegar. Buku ini menyoroti diskriminasi rasial, cinta, kebebasan, dan benderang fajar kesadaran nasional.",
    buyUrl: "https://www.gramedia.com/products/bumi-manusia"
  },
  {
    id: 2,
    title: "Laut Bercerita",
    author: "Leila S. Chudori",
    category: "Fiksi",
    rating: 4.9,
    reviewsCount: 2,
    reviews: [
      { id: 'r2-1', reviewerName: 'Ahmad Fauzi', rating: 5, comment: 'Menangis membaca buku ini. Sangat puitis dan menguras emosi menceritakan hilangnya martir perjuangan mahasiswa 98.', createdAt: '2026-04-12' },
      { id: 'r2-2', reviewerName: 'Riska Indah', rating: 5, comment: 'Sudut pandang keluarga korban yang ditinggalkan sungguh mengharukan. Salah satu novel fiksi terbaik abad ini.', createdAt: '2026-05-18' }
    ],
    duration: "5 jam",
    pages: 379,
    coverColor: "bg-cyan-950",
    synopsis: "Mengangkat tema penindasan rezim orde baru, novel fiksi ini mengisahkan kelamnya hilangnya para aktivis mahasiswa di era 1998 dari dua sudut pandang: Biru Laut yang merupakan korban penyiksaan, dan Asmara Jati, adiknya yang menatap luka dari luar penjara perjuangan.",
    buyUrl: "https://www.gramedia.com/products/laut-bercerita"
  },
  {
    id: 3,
    title: "Atomic Habits",
    author: "James Clear",
    category: "Pengembangan Diri",
    rating: 4.8,
    reviewsCount: 2,
    reviews: [
      { id: 'r3-1', reviewerName: 'Michael', rating: 5, comment: 'Sangat praktis! Konsep 1% perbaikan harian sungguh masuk akal dan mudah diterapkan dalam rutinitas kerja saya.', createdAt: '2026-01-20' },
      { id: 'r3-2', reviewerName: 'Sarah Amalia', rating: 5, comment: 'Buku non-fiksi paling berdampak. Mengajarkan cara membuat kebiasaan buruk menjadi tidak terlihat.', createdAt: '2026-04-05' }
    ],
    duration: "4 jam",
    pages: 320,
    coverColor: "bg-blue-950",
    synopsis: "Sebuah buku panduan praktis paling terkenal di dunia tentang bagaimana cara mengubah hidup Anda dengan membangun kebiasaan kecil sebanyak 1% setiap harinya. Dipandu dengan riset ilmiah mumpuni dan strategi harian konkret.",
    buyUrl: "https://www.gramedia.com/products/atomic-habits"
  },
  {
    id: 4,
    title: "Filosofi Teras",
    author: "Henry Manampiring",
    category: "Pengembangan Diri",
    rating: 4.7,
    reviewsCount: 3,
    reviews: [
      { id: 'r4-1', reviewerName: 'Budi Santoso', rating: 5, comment: 'Membantu meredakan overthinking saya. Penjelasannya renyah dan relevan sekali dengan rintangan hidup komuter kota besar.', createdAt: '2026-03-30' },
      { id: 'r4-2', reviewerName: 'Santi', rating: 4, comment: 'Konsep dikotomi kendali membantu saya merelakan hal-hal yang tidak bisa saya kontrol di tempat kerja.', createdAt: '2026-04-15' },
      { id: 'r-custom-4', reviewerName: 'GenZ Reader', rating: 5, comment: 'Buku wajib untuk siapa saja yang sering merasa cemas akibat media sosial.', createdAt: '2026-05-24' }
    ],
    duration: "4 jam",
    pages: 320,
    coverColor: "bg-yellow-900",
    synopsis: "Pengantar filsafat Stoisisme kuno Yunani-Romawi yang dikemas ramah dan praktis untuk generasi milenial dan Gen-Z di Indonesia. Buku ini mengajarkan kita cara mengendalikan emosi negatif dan menumbuhkan kedamaian batin dalam kehidupan sehari-hari.",
    buyUrl: "https://www.gramedia.com/products/filosofi-teras"
  },
  {
    id: 5,
    title: "Psychology of Money",
    author: "Morgan Housel",
    category: "Bisnis",
    rating: 4.8,
    reviewsCount: 2,
    reviews: [
      { id: 'r5-1', reviewerName: 'Gerry Hartono', rating: 5, comment: 'Buku tentang keuangan terpenting yang pernah saya baca. Menyadari bahwa kaya dan makmur adalah dua hal berbeda.', createdAt: '2026-02-18' },
      { id: 'r5-2', reviewerName: 'Mega', rating: 4, comment: 'Cerita pendeknya sangat mencerahkan pikiran. Tidak membosankan seperti buku ekonomi pada umumnya.', createdAt: '2026-05-12' }
    ],
    duration: "3 jam",
    pages: 262,
    coverColor: "bg-emerald-950",
    synopsis: "Mengelola uang tidak melulu soal hitung-hitungan rumus matematika finansial rumit, melainkan soal psikologi dan perilaku manusia. Penulis menyajikan 19 kisah pendek mencerahkan tentang bagaimana orang kaya sesungguhnya berpikir tentang kekayaan.",
    buyUrl: "https://www.gramedia.com/products/psychology-of-money"
  },
  {
    id: 6,
    title: "Zero to One",
    author: "Peter Thiel",
    category: "Bisnis",
    rating: 4.6,
    reviewsCount: 1,
    reviews: [
      { id: 'r6-1', reviewerName: 'Ferry Startup', rating: 5, comment: 'Inspiratif bagi yang ingin merintis bisnis teknologi baru. Teori monopolinya sangat mendalam.', createdAt: '2026-03-10' }
    ],
    duration: "3 jam",
    pages: 224,
    coverColor: "bg-slate-900",
    synopsis: "Co-founder PayPal dan investor awal Facebook membongkar cara membangun startup masa depan. Peter Thiel menjelaskan bahwa inovasi sejati tidak menyalin kesuksesan yang sudah ada, melainkan menciptakan lompatan dari 0 ke 1.",
    buyUrl: "https://www.gramedia.com/products/zero-to-one"
  },
  {
    id: 7,
    title: "Sapiens: Riwayat Sejarah Manusia",
    author: "Yuval Noah Harari",
    category: "Sains & Teknologi",
    rating: 4.9,
    reviewsCount: 2,
    reviews: [
      { id: 'r7-1', reviewerName: 'Prof. Junaedi', rating: 5, comment: 'Karya sejarah paling menakjubkan. Menghubungkan arkeologi dengan sosiologi modern secara brilian.', createdAt: '2026-01-15' },
      { id: 'r7-2', reviewerName: 'Lisa', rating: 4, comment: 'Sangat tebal namun gaya bahasanya asyik diikuti. Sudut pandang revolusi kognitifnya mengubah pandangan hidup saya.', createdAt: '2026-04-20' }
    ],
    duration: "7 jam",
    pages: 544,
    coverColor: "bg-amber-950",
    synopsis: "Bagaimana sebuah spesies primata biasa bertransformasi menguasai bumi seutuhnya? Harari membongkar tuntas sejarah revolusi kognitif, revolusi pertanian, dan revolusi sains umat manusia secara provokatif, segar, dan luar biasa mengagumkan.",
    buyUrl: "https://www.gramedia.com/products/sapiens"
  },
  {
    id: 8,
    title: "Life 3.0: Manusia di Era AI",
    author: "Max Tegmark",
    category: "Sains & Teknologi",
    rating: 4.5,
    reviewsCount: 2,
    reviews: [
      { id: 'r8-1', reviewerName: 'Eka Pramudya', rating: 5, comment: 'Sangat relevan di tengah kepungan tren ChatGPT sekarang ini. Menyoroti tanggung jawab moral developer AI.', createdAt: '2026-05-14' },
      { id: 'r8-2', reviewerName: 'Wawan', rating: 4, comment: 'Buku sains futuristik bernilai tinggi bagi penggemar teknologi modern.', createdAt: '2026-05-22' }
    ],
    duration: "5-6 jam",
    pages: 410,
    coverColor: "bg-violet-950",
    synopsis: "Fisikawan MIT mengajak kita menatap era kecerdasan buatan masa depan yang ekstrem. Apakah AI akan membantu umat manusia semakin sejahtera atau malah mendepak eksistensi manusia dari jajaran puncak rantai kehidupan di semesta?",
    buyUrl: "https://www.gramedia.com/products/life-30"
  },
  {
    id: 9,
    title: "Cantik Itu Luka",
    author: "Eka Kurniawan",
    category: "Fiksi",
    rating: 4.8,
    reviewsCount: 1,
    reviews: [
      { id: 'r9-1', reviewerName: 'Amara', rating: 5, comment: 'Realisme magis Indonesia yang magis, kasar, sensual, dan sarat sejarah kolonial. Sangat memukau semenjak baris pertama kalimatnya.', createdAt: '2026-03-12' }
    ],
    duration: "6 jam",
    pages: 478,
    coverColor: "bg-indigo-950",
    synopsis: "Karya realisme magis Indonesia yang diakui dunia internasional. Mengisahkan petaka dan keelokan nasib Dewi Ayu, seorang pelacur legendaris keturunan Belanda, dan anak-anak perempuannya yang dikutuk kecantikan luar biasa namun menyakitkan.",
    buyUrl: "https://www.gramedia.com/products/cantik-itu-luka"
  },
  {
    id: 10,
    title: "Grit: Passion & Kegigihan",
    author: "Angela Duckworth",
    category: "Pengembangan Diri",
    rating: 4.6,
    reviewsCount: 1,
    reviews: [
      { id: 'r10-1', reviewerName: 'Dhoni', rating: 4, comment: 'Riset ilmiah membuktikan bahwa kegigihan mengalahkan bakat mentah. Sangat memotivasi bagi siapapun yang merasa biasa saja.', createdAt: '2026-04-18' }
    ],
    duration: "4 jam",
    pages: 350,
    coverColor: "bg-purple-900",
    synopsis: "Riset membuktikan bahwa bakat bawaan lahir tidak menentukan kesuksesan jangka panjang. Kunci kesuksesan sesungguhnya adalah perpaduan tangguh antara ketertarikan (passion) serta kegigihan ekstrem (grit) untuk bangkit berkali-kali.",
    buyUrl: "https://www.gramedia.com/products/grit"
  },
  {
    id: 11,
    title: "Good to Great",
    author: "Jim Collins",
    category: "Bisnis",
    rating: 4.7,
    reviewsCount: 1,
    reviews: [
      { id: 'r11-1', reviewerName: 'Setyadi', rating: 5, comment: 'Analisis mendalam mengapa sebuah perusahaan tidak hanya sekadar bisa tumbuh, melainkan bertahan melintasi badai krisis global.', createdAt: '2026-02-28' }
    ],
    duration: "4 jam",
    pages: 380,
    coverColor: "bg-amber-900",
    synopsis: "Sebuah mahakarya riset korporat terlama yang mengupas rahasia bagaimana perusahaan berskala biasa bertransformasi menjadi korporasi luar biasa yang terus menguntungkan secara konsisten melintasi rentang dekade bisnis.",
    buyUrl: "https://www.gramedia.com/products/good-to-great"
  },
  {
    id: 12,
    title: "Dunia Sophie",
    author: "Jostein Gaarder",
    category: "Fiksi",
    rating: 4.7,
    reviewsCount: 2,
    reviews: [
      { id: 'r12-1', reviewerName: 'Hesti', rating: 4, comment: 'Mempelajari filsafat barat dengan cara yang unik dan menyenangkan. Novel misteri yang asyik.', createdAt: '2026-04-01' },
      { id: 'r12-2', reviewerName: 'Aldo', rating: 5, comment: 'Sejauh ini merupakan novel pengantar filsafat terbaik dunia untuk pemula. Teori Plato dan Socrates jadi sangat mudah dipahami.', createdAt: '2026-05-15' }
    ],
    duration: "8 jam",
    pages: 650,
    coverColor: "bg-slate-900",
    synopsis: "Sebuah novel misteri mendebarkan yang merangkap sebagai salah satu buku pengantar filsafat barat paling asyik dan mudah dicerna untuk pemula dari masa pra-Socrates hingga era pasca-modern.",
    buyUrl: "https://www.gramedia.com/products/dunia-sophie"
  }
];

interface Toast {
  id: string;
  message: string;
}

const MOTIVATIONAL_QUOTES = [
  {
    text: "Membaca satu buku yang baik itu ibarat melakukan perjalanan waktu yang mulia bersama pikiran-pikiran cerdas masa lampau.",
    author: "René Descartes"
  },
  {
    text: "Buku adalah cermin: Anda hanya melihat di dalamnya apa yang sudah Anda miliki di dalam diri Anda.",
    author: "Carlos Ruiz Zafón"
  },
  {
    text: "Aku rela dipenjara bersama buku, karena dengan buku aku bebas.",
    author: "Mohammad Hatta"
  },
  {
    text: "Membaca adalah alat paling mendasar untuk meraih kearifan hidup.",
    author: "Mortimer J. Adler"
  },
  {
    text: "Ada lebih banyak harta karun di dalam buku daripada di semua jarahan bajak laut di Pulau Harta.",
    author: "Walt Disney"
  },
  {
    text: "Buku adalah sahabat paling setia, ia tidak pernah membelakangi kita.",
    author: "Pramoedya Ananta Toer"
  },
  {
    text: "Kamar tanpa buku seperti tubuh tanpa jiwa.",
    author: "Marcus Tullius Cicero"
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'jelajah' | 'bacaan'>('jelajah');

  // Quotes system that persists across multiple minutes to avoid rapid changes
  const [activeQuote, setActiveQuote] = useState(() => {
    const savedQuote = localStorage.getItem('pustakapilihan_active_quote');
    const savedTime = localStorage.getItem('pustakapilihan_quote_timestamp');
    const now = Date.now();
    const ROTATION_INTERVAL = 5 * 60 * 1000; // 5 menit

    if (savedQuote && savedTime) {
      if (now - parseInt(savedTime, 10) < ROTATION_INTERVAL) {
        try {
          return JSON.parse(savedQuote);
        } catch (e) {
          console.error("Gagal memuat kutipan tersimpan:", e);
        }
      }
    }

    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    const chosen = MOTIVATIONAL_QUOTES[randomIndex];
    localStorage.setItem('pustakapilihan_active_quote', JSON.stringify(chosen));
    localStorage.setItem('pustakapilihan_quote_timestamp', now.toString());
    return chosen;
  });

  useEffect(() => {
    const ROTATION_INTERVAL = 5 * 60 * 1000; // 5 menit
    const interval = setInterval(() => {
      const now = Date.now();
      const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
      const chosen = MOTIVATIONAL_QUOTES[randomIndex];
      setActiveQuote(chosen);
      localStorage.setItem('pustakapilihan_active_quote', JSON.stringify(chosen));
      localStorage.setItem('pustakapilihan_quote_timestamp', now.toString());
    }, ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, []);
  
  // Authentication states
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Monitor auth status change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        try {
          await setDoc(userDocRef, {
            userId: user.uid,
            displayName: user.displayName || 'Pembaca Setia',
            email: user.email || '',
            photoURL: user.photoURL || '',
            updatedAt: new Date().toLocaleDateString('id-ID')
          }, { merge: true });
        } catch (e) {
          console.error("Gagal menyinkronkan profil user:", e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setAuthLoading(true);
      const result = await signInWithPopup(auth, provider);
      triggerToast(`Selamat datang kembali, ${result.user.displayName}! Buku-buku Anda sudah tersinkronisasi. ✨`);
    } catch (error) {
      console.error("Gagal masuk dengan Google:", error);
      triggerToast("Gagal masuk dengan akun Google.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowAccountModal(false);
      triggerToast("Berhasil keluar. Anda kembali menggunakan penyimpanan lokal sbg tamu.");
    } catch (error) {
      console.error("Gagal keluar:", error);
      triggerToast("Gagal keluar akun.");
    }
  };

  // Database of books (Seeds + custom added) cached locally
  const [books, setBooks] = useState<Book[]>(SEED_BOOKS);

  // Synchronize Custom Books from Firestore live snapshot
  useEffect(() => {
    if (!currentUser) {
      const saved = localStorage.getItem('pustakapilihan_books');
      if (saved) {
        try {
          setBooks(JSON.parse(saved));
        } catch (e) {
          setBooks(SEED_BOOKS);
        }
      } else {
        setBooks(SEED_BOOKS);
      }
      return;
    }

    const booksPath = `users/${currentUser.uid}/books`;
    const unsubscribe = onSnapshot(collection(db, booksPath), (snapshot) => {
      const fbCustomBooks: Book[] = [];
      snapshot.forEach((docSnap) => {
        fbCustomBooks.push(docSnap.data() as Book);
      });
      // Merge with static SEED_BOOKS safely
      setBooks(() => {
        return [...fbCustomBooks, ...SEED_BOOKS];
      });
    }, (error) => {
      console.error("Error loading custom books:", error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Reading bookmarks saved
  const [readingList, setReadingList] = useState<ReadingListItem[]>([]);

  // Synchronize Reading List from Firestore live snapshot
  useEffect(() => {
    if (!currentUser) {
      const saved = localStorage.getItem('pustakapilihan_reading_list');
      setReadingList(saved ? JSON.parse(saved) : []);
      return;
    }

    const rlistPath = `users/${currentUser.uid}/readingList`;
    const unsubscribe = onSnapshot(collection(db, rlistPath), (snapshot) => {
      const items: ReadingListItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as ReadingListItem);
      });
      setReadingList(items);
    }, (error) => {
      console.error("Error loading reading list:", error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Notebook personal text
  const [notepadText, setNotepadText] = useState('');

  // Synchronize Notepad notes from Firestore live snapshot
  useEffect(() => {
    if (!currentUser) {
      setNotepadText(localStorage.getItem('pustakapilihan_notepad') || '');
      return;
    }

    const unsubscribe = onSnapshot(doc(db, `users/${currentUser.uid}/notes`, 'notepad'), (docSnap) => {
      if (docSnap.exists()) {
        setNotepadText(docSnap.data().text || '');
      } else {
        setNotepadText('');
      }
    }, (error) => {
      console.error("Error loading notepad text:", error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Currently focused modal book
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Loading indicator for "Kocok Rekomendasi" (Surprise Me)
  const [shuffling, setShuffling] = useState(false);
  const [showShuffleModal, setShowShuffleModal] = useState(false);

  // Dynamic inside Toast message queue
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Local storage synchronization for guests
  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem('pustakapilihan_books', JSON.stringify(books));
    }
  }, [books, currentUser]);

  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem('pustakapilihan_reading_list', JSON.stringify(readingList));
    }
  }, [readingList, currentUser]);

  // Toast Notification dispatcher helper
  const triggerToast = (message: string) => {
    const freshId = Date.now().toString();
    setToasts(prev => [...prev, { id: freshId, message }]);
    
    // Auto-remove toast after 4s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== freshId));
    }, 4000);
  };

  // Add customized book to state catalog or Firestore
  const handleAddNewBook = async (newBook: Book) => {
    if (currentUser) {
      const docPath = `users/${currentUser.uid}/books/${newBook.id}`;
      try {
        const enrichedBook = {
          ...newBook,
          createdBy: currentUser.uid,
          createdAt: new Date().toLocaleDateString('id-ID')
        };
        await setDoc(doc(db, `users/${currentUser.uid}/books`, String(newBook.id)), enrichedBook);
        triggerToast(`Buku "${newBook.title}" berhasil disinkronisasi ke katalog cloud Anda! ✨`);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, docPath);
      }
    } else {
      setBooks(prev => [newBook, ...prev]);
      triggerToast(`Buku "${newBook.title}" berhasil didaftarkan di katalog utama! (Lokal)`);
    }
  };

  // Toggle Bookmark logic with Firestore sync helper
  const handleToggleBookmark = async (e: React.MouseEvent | null, bookId: number | string) => {
    if (e) {
      e.stopPropagation(); // Avoid triggering details modal background click
    }

    if (!currentUser) {
      setShowAuthModal(true);
      triggerToast("Silakan login/masuk terlebih dahulu untuk menyimpan buku ke Daftar Bacaan Anda. 📖");
      return;
    }

    const isBookmarked = readingList.some(item => item.bookId === String(bookId));
    const targetBook = books.find(b => b.id === bookId);

    const docPath = `users/${currentUser.uid}/readingList/${bookId}`;
    try {
      if (isBookmarked) {
        await deleteDoc(doc(db, `users/${currentUser.uid}/readingList`, String(bookId)));
        if (targetBook) {
          triggerToast(`"${targetBook.title}" dihapus dari Daftar Bacaan.`);
        }
      } else {
        const newBookmark: ReadingListItem = {
          bookId: String(bookId),
          progressStatus: 'ingin_dibaca',
          savedAt: new Date().toLocaleDateString('id-ID'),
          userId: currentUser.uid
        };
        await setDoc(doc(db, `users/${currentUser.uid}/readingList`, String(bookId)), newBookmark);
        if (targetBook) {
          triggerToast(`"${targetBook.title}" ditambahkan ke Daftar Bacaan! ✨`);
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  };

  // Update book reading status (Ingin Dibaca, Sedang Dibaca, Selesai)
  const handleUpdateReadingStatus = async (bookId: number | string, status: 'ingin_dibaca' | 'sedang_dibaca' | 'selesai') => {
    const targetBook = books.find(b => b.id === bookId);
    const statusLabels = {
      ingin_dibaca: 'Ingin Dibaca',
      sedang_dibaca: 'Sedang Dibaca',
      selesai: 'Selesai Dibaca'
    };

    if (currentUser) {
      const docPath = `users/${currentUser.uid}/readingList/${bookId}`;
      try {
        await updateDoc(doc(db, `users/${currentUser.uid}/readingList`, String(bookId)), {
          progressStatus: status
        });
        if (targetBook) {
          triggerToast(`Status bacaan "${targetBook.title}" diubah menjadi: ${statusLabels[status]}.`);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, docPath);
      }
    } else {
      setReadingList(prev => prev.map(item => {
        if (item.bookId === bookId) {
          return { ...item, progressStatus: status };
        }
        return item;
      }));
      if (targetBook) {
        triggerToast(`Status bacaan "${targetBook.title}" diubah menjadi: ${statusLabels[status]}.`);
      }
    }
  };

  // Writing a feedback review / comment
  const handleAddReview = async (bookId: number | string, reviewerName: string, rating: number, comment: string) => {
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      reviewerName,
      rating,
      comment,
      createdAt: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
    };

    if (currentUser) {
      const docPath = `reviews/${newReview.id}`;
      try {
        const fbReviewPayload = {
          ...newReview,
          bookId: String(bookId),
          userId: currentUser.uid
        };
        await setDoc(doc(db, 'reviews', newReview.id), fbReviewPayload);
        triggerToast('Ulasan Anda berhasil dipublikasikan secara real-time ke cloud! ✨');
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, docPath);
      }
    } else {
      setBooks(prev => prev.map(book => {
        if (book.id === bookId) {
          const updatedReviews = [newReview, ...book.reviews];
          const totalRatingPoints = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
          const newAverageRating = Number((totalRatingPoints / updatedReviews.length).toFixed(1));

          const updatedBook = {
            ...book,
            reviews: updatedReviews,
            reviewsCount: updatedReviews.length,
            rating: newAverageRating
          };

          if (selectedBook && selectedBook.id === bookId) {
            setSelectedBook(updatedBook);
          }

          return updatedBook;
        }
        return book;
      }));
      triggerToast('Ulasan dan rating Anda berhasil dipublikasikan secara lokal! Terima kasih.');
    }
  };

  // Bookmark stats aggregation
  const bookmarkStats = useMemo(() => {
    const savedCount = readingList.length;
    const completedCount = readingList.filter(item => item.progressStatus === 'selesai').length;
    const readingNowCount = readingList.filter(item => item.progressStatus === 'sedang_dibaca').length;

    return {
      total: savedCount,
      completed: completedCount,
      readingNow: readingNowCount
    };
  }, [readingList]);

  // Dynamic categories list based on existing books in the catalog
  const dynamicCategories = useMemo(() => {
    const defaultCats = ['Semua', 'Fiksi', 'Pengembangan Diri', 'Bisnis', 'Sains & Teknologi'];
    const customCats = books
      .map(b => b.category)
      .filter((cat): cat is string => typeof cat === 'string' && cat.trim() !== '' && cat !== 'Semua' && !defaultCats.includes(cat));
    const uniqueCustom = Array.from(new Set(customCats));
    return [...defaultCats, ...uniqueCustom];
  }, [books]);

  // Catalog filtering calculation
  const filteredCatalog = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return books.filter(book => {
      const matchesCategory = selectedCategory === 'Semua' || book.category === selectedCategory;
      const matchesSearch = query === '' || 
        book.title.toLowerCase().includes(query) || 
        book.author.toLowerCase().includes(query) ||
        book.synopsis.toLowerCase().includes(query) ||
        book.category.toLowerCase().includes(query);
      
      return matchesCategory && matchesSearch;
    });
  }, [books, searchQuery, selectedCategory]);

  // Open the dedicated interactive shuffle modal
  const handleSurpriseRoll = () => {
    if (books.length === 0) {
      triggerToast("Katalog buku sedang kosong. Silakan tambahkan beberapa buku terlebih dahulu!");
      return;
    }
    setShowShuffleModal(true);
  };

  // Scroll smooth anchor
  const handleScrollToExplore = () => {
    setActiveTab('jelajah');
    const el = document.getElementById('catalog-anchor');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="font-sans antialiased min-h-screen flex flex-col bg-lit-parchment selection:bg-lit-sage/30 text-lit-charcoal">
      
      {/* Toast Notification Container HUD Overlay */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none" id="toasts-portal">
        {toasts.map(t => (
          <div 
            key={t.id} 
            className="pointer-events-auto flex items-center justify-between p-4 bg-white border-l-4 border-lit-sage rounded-lg shadow-lg border border-lit-border transition-all transform animate-fade-in hover:scale-102"
          >
            <div className="flex items-center space-x-3.5">
              <div className="text-lit-sage">
                <Bell className="w-4 h-4 animate-bounce" />
              </div>
              <p className="text-xs font-semibold text-lit-charcoal">{t.message}</p>
            </div>
            <button 
              type="button" 
              onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
              className="text-slate-400 hover:text-slate-600 ml-3.5 focus:outline-none"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Primary Top Header Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-lit-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Platform Branding Logo */}
            <div 
              onClick={() => { setActiveTab('jelajah'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-9 h-9 bg-lit-sage rounded-lg flex items-center justify-center text-white shadow-sm transform group-hover:rotate-6 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-lg font-bold font-serif text-lit-charcoal tracking-tight">ReadBooks</h1>
                <p className="text-[9px] text-lit-sage tracking-wider font-semibold uppercase">Your Reading Compass</p>
              </div>
            </div>

            {/* Navigation Tabs (Desktop screen) */}
            <nav className="flex space-x-1 bg-lit-cream p-1 rounded-lg border border-lit-border">
              <button 
                onClick={() => setActiveTab('jelajah')} 
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'jelajah' 
                    ? 'bg-lit-sage text-white shadow-xs' 
                    : 'text-slate-600 hover:text-lit-charcoal'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Jelajah Buku</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('bacaan')} 
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 relative cursor-pointer ${
                  activeTab === 'bacaan' 
                    ? 'bg-lit-sage text-white shadow-xs' 
                    : 'text-slate-600 hover:text-lit-charcoal'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Daftar Bacaan</span>
                {readingList.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-lit-charcoal text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-white">
                    {readingList.length}
                  </span>
                )}
              </button>
            </nav>

            {/* Right Group: Surprise Me + Authentication Dropdown/Button */}
            <div className="flex items-center space-x-3.5">
              <div className="hidden md:block">
                <button 
                  onClick={handleSurpriseRoll}
                  disabled={shuffling}
                  className="bg-lit-sage hover:opacity-90 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs transform active:scale-95 cursor-pointer disabled:bg-slate-300"
                >
                  <Dice5 className="w-3.5 h-3.5" />
                  <span>Kocok Rekomendasi</span>
                </button>
              </div>

              {/* Authentication Controls */}
              {authLoading ? (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                </div>
              ) : currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setShowAccountModal(true)}
                    className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-slate-50 transition-all border border-lit-border bg-white cursor-pointer group"
                    title="Buka Profil Akun"
                    id="account-profile-trigger"
                  >
                    {currentUser.photoURL ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt={currentUser.displayName || ''} 
                        className="w-7 h-7 rounded-full object-cover border border-lit-sage/20"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-lit-sage/15 text-lit-sage font-bold flex items-center justify-center text-xs">
                        {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'P'}
                      </div>
                    )}
                    <span className="hidden sm:block text-xs font-semibold text-slate-700 pr-1 group-hover:text-lit-charcoal">
                      {currentUser.displayName?.split(' ')[0]}
                    </span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-2xs transform active:scale-95 cursor-pointer"
                  id="google-login-trigger"
                >
                  <LogIn className="w-3.5 h-3.5 text-lit-sage" />
                  <span>Masuk Akun</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Main Container screen */}
      <main className="flex-grow">
        
        {/* Dynamic Marketing Hero Intro */}
        <section className="relative bg-lit-cream overflow-hidden py-12 md:py-16 border-b border-lit-border shadow-2xs">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 w-48 h-48 rounded-full bg-lit-sage blur-3xl" />
            <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-slate-400 blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column Copywriting */}
              <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
                <div className="inline-flex items-center space-x-2 bg-white border border-lit-border text-lit-sage px-3 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider">
                  <Award className="w-3 h-3 text-lit-sage" />
                  <span>Katalog Buku Sederhana</span>
                </div>
                
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-extrabold text-lit-charcoal tracking-tight leading-tight">
                  Temukan <span className="text-lit-sage italic font-serif">Sahabat Membaca</span> Terbaikmu Hari Ini
                </h2>
                
                <p className="text-xs sm:text-sm text-slate-650 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Bosan membaca buku yang itu-itu saja? ReadBooks memudahkan Anda melacak daftar bacaan, memberikan ulasan ulasan, membagikan rating bintang, dan mendapatkan rekomendasi buku terbaik untuk Anda.
                </p>

                <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3">
                  <button 
                    onClick={handleScrollToExplore}
                    className="bg-lit-sage hover:opacity-95 text-white font-bold text-xs px-6 py-3 rounded-lg shadow-xs hover:shadow-sm transition-all flex items-center justify-center space-x-2.5 cursor-pointer group"
                  >
                    <span>Mulai Jelajah Buku</span>
                    <span className="group-hover:translate-x-1.5 transition-transform">→</span>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('bacaan')}
                    className="bg-white hover:bg-lit-cream text-lit-charcoal border border-lit-border font-bold text-xs px-6 py-3 rounded-lg shadow-3xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Daftar Bacaan Saya</span>
                  </button>
                </div>
              </div>

              {/* Right Column Illustration */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-64 sm:w-72 h-64 sm:h-72 select-none">
                  <div className="absolute inset-0 bg-lit-sage/10 rounded-full scale-95 animate-pulse opacity-60" />
                  
                  {/* Cozy Stacked Books Vector Logo Drawing */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Ambient Glows */}
                    <circle cx="250" cy="260" r="170" fill="#8A9A5B" opacity="0.12" />
                    <circle cx="230" cy="220" r="120" fill="#E6C594" opacity="0.15" />
                    
                    {/* Stars and Magic Sparkles */}
                    {/* Star 1 */}
                    <path d="M360 170l3 5l5 3l-5 3l-3 5l-3-5l-5-3l5-3z" fill="#E6C594" opacity="0.8" />
                    {/* Star 2 */}
                    <path d="M130 210l2 4l4 2l-4 2l-2 4l-2-4l-4-2l4-2z" fill="#8A9A5B" opacity="0.6" />
                    {/* Star 3 (Top right spark) */}
                    <path d="M390 120l4 7l7 4l-7 4l-4 7l-4-7l-7-4l7-4z" fill="#E6C594" />
                    
                    {/* Tiny Floating Hearts/Leaves */}
                    <path d="M150 160c-2-3-6-3-8 0c-2 3 1 7 8 11c7-4 10-8 8-11c-2-3-6-3-8 0z" fill="#D5897A" opacity="0.4" />
                    
                    {/* Soft Botanical Leaf Accents */}
                    <path d="M110 370c5-20 20-30 40-35" stroke="#8A9A5B" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
                    <path d="M125 350c-5-5-15-5-20-2" fill="#8A9A5B" opacity="0.4" />
                    <path d="M140 342c-2-6-10-8-15-5" fill="#8A9A5B" opacity="0.4" />
                    
                    <path d="M390 370c-5-20-20-30-40-35" stroke="#8A9A5B" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
                    <path d="M375 350c5-5 15-5 20-2" fill="#8A9A5B" opacity="0.4" />
                    
                    {/* Table Surface with shadow */}
                    <ellipse cx="250" cy="385" rx="160" ry="20" fill="#FAF9F6" opacity="0.9" />
                    <ellipse cx="250" cy="387" rx="140" ry="12" fill="#EADCC9" opacity="0.5" />

                    {/* Book 1 (Bottom - Wide, Cozy Forest Sage) */}
                    {/* Shadows under Book 1 */}
                    <rect x="135" y="340" width="230" height="30" rx="6" fill="#C5B5A1" opacity="0.5" />
                    
                    {/* Cover Base */}
                    <rect x="130" y="332" width="240" height="28" rx="5" fill="#586A5A" />
                    {/* Book spine line highlight */}
                    <rect x="130" y="332" width="16" height="28" rx="2" fill="#4B5B4D" />
                    {/* Spine horizontal decorative gold bars */}
                    <line x1="130" y1="338" x2="146" y2="338" stroke="#E6C594" strokeWidth="1.5" />
                    <line x1="130" y1="354" x2="146" y2="354" stroke="#E6C594" strokeWidth="1.5" />
                    
                    {/* Pages block (Creamy edge) */}
                    <rect x="146" y="335" width="220" height="22" rx="3" fill="#FFFDF9" />
                    {/* Page texture lines */}
                    <line x1="152" y1="340" x2="360" y2="340" stroke="#F1EDE2" strokeWidth="1" />
                    <line x1="152" y1="346" x2="363" y2="346" stroke="#F1EDE2" strokeWidth="1" strokeDasharray="3 1" />
                    <line x1="152" y1="352" x2="361" y2="352" stroke="#F1EDE2" strokeWidth="1" />
                    
                    {/* Bookmark Ribbon Hanging Out */}
                    <path d="M290 357c2 15 10 20 8 32l-10-4l-10 4c1-12 8-17 12-32z" fill="#D5897A" />

                    {/* Book 2 (Middle - Slightly rotated/slanted, Warm Rose) */}
                    <g transform="rotate(-3, 250, 300)">
                      {/* Book Shadow */}
                      <rect x="155" y="295" width="190" height="26" rx="4" fill="#42352F" opacity="0.12" />
                      {/* Cover */}
                      <rect x="150" y="290" width="200" height="26" rx="4" fill="#D5897A" />
                      {/* Spine */}
                      <rect x="150" y="290" width="14" height="26" rx="2" fill="#BD7365" />
                      {/* Pages block */}
                      <rect x="164" y="293" width="182" height="20" rx="2" fill="#FFFDF9" />
                      {/* Page lines */}
                      <line x1="170" y1="297" x2="340" y2="297" stroke="#F1EDE2" strokeWidth="1" />
                      <line x1="170" y1="303" x2="340" y2="303" stroke="#F1EDE2" strokeWidth="1" />
                      <line x1="170" y1="309" x2="340" y2="309" stroke="#F1EDE2" strokeWidth="1" />
                    </g>

                    {/* Book 3 (Top - Cute Mustard Book, flat but offset right) */}
                    {/* Cover base */}
                    <rect x="170" y="252" width="160" height="24" rx="4" fill="#E6C594" />
                    {/* Spine block */}
                    <rect x="170" y="252" width="12" height="24" rx="2" fill="#D19E5B" />
                    {/* Decorative star on spine */}
                    <polygon points="176,261 177,263 179,263 177,265 178,267 176,266 174,267 175,265 173,263 175,263" fill="#FAF9F6" />
                    {/* Pages block */}
                    <rect x="182" y="255" width="145" height="18" rx="2" fill="#FFFDF9" />
                    <line x1="186" y1="259" x2="322" y2="259" stroke="#F1EDE2" strokeWidth="1" />
                    <line x1="186" y1="264" x2="322" y2="264" stroke="#F1EDE2" strokeWidth="1" />
                    <line x1="186" y1="269" x2="322" y2="269" stroke="#F1EDE2" strokeWidth="1" />

                    {/* Cozy Sitting/Sleeping Little Ginger Cat on top */}
                    {/* Cat sleeping shadow */}
                    <ellipse cx="245" cy="248" rx="45" ry="8" fill="#8B7B6B" opacity="0.15" />
                    
                    {/* Cat body */}
                    <path d="M210 248 c0-15 15-28 35-28 c20 0 35 12 35 25 c0 8-5 12-15 14 c-10 2-35 2-45-4 z" fill="#E9967A" />
                    {/* Cat tail wrap */}
                    <path d="M265 246c10 2 18-3 20-8c2-5-1-10-5-11" stroke="#E9967A" strokeWidth="7" strokeLinecap="round" />
                    {/* Cat cream colored belly details */}
                    <ellipse cx="242" cy="238" rx="18" ry="10" fill="#FFFDF9" opacity="0.8" />
                    
                    {/* Cat head */}
                    <circle cx="215" cy="226" r="14" fill="#E9967A" />
                    {/* Cat right ear */}
                    <polygon points="208,214 212,224 204,222" fill="#E9967A" />
                    <polygon points="209,216 211,223 206,222" fill="#F4C2C2" />
                    {/* Cat left ear */}
                    <polygon points="218,214 222,224 214,222" fill="#E9967A" />
                    <polygon points="219,216 221,223 216,222" fill="#F4C2C2" />
                    
                    {/* Cat sleeping eyes */}
                    <path d="M208 228c1 2 3 2 4 0" stroke="#7A4E42" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M216 228c1 2 3 2 4 0" stroke="#7A4E42" strokeWidth="1.5" strokeLinecap="round" />
                    {/* Nose/mouth */}
                    <path d="M212 231l1 1l1-1" stroke="#7A4E42" strokeWidth="1" />
                    
                    {/* Sleeping Cat Zzz */}
                    <path d="M190 205h6l-5 6h5" stroke="#D19E5B" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6" />
                    <path d="M182 195h4l-3 4h3" stroke="#D19E5B" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4" />

                    {/* Cute Tiny Steaming Cup/Mug (Next to Book) */}
                    {/* Mug base */}
                    <rect x="330" y="240" width="22" height="22" rx="4" fill="#8A9D8B" />
                    {/* Handle */}
                    <path d="M352 245c3 0 5 2 5 5c0 3-2 5-5 5" stroke="#8A9D8B" strokeWidth="2.5" fill="none" />
                    {/* Tea tag hanging out */}
                    <path d="M336 242l4 8l-2 1" stroke="#E6C594" strokeWidth="1.5" fill="none" />
                    {/* Gentle Steam Lines */}
                    <path d="M335 233c0-4 3-4 3-8" stroke="#8A9D8B" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                    <path d="M341 235c0-4 3-4 3-8" stroke="#8A9D8B" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                  </svg>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* TAB CONTAINER 1: JELAJAH BUKU */}
        {activeTab === 'jelajah' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10" id="catalog-anchor">
                  {/* Search Input and Filters Area */}
            <div className="bg-lit-cream rounded-xl p-5 border border-lit-border shadow-2xs relative z-20">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                
                {/* Search Bar Input */}
                <div className="lg:col-span-4 relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Cari judul, penulis, ulasan..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs pl-10 pr-4 py-2.5 bg-[#FAF9F6] border border-lit-border rounded-lg focus:ring-1 focus:ring-lit-sage outline-none hover:border-slate-350 transition-all placeholder:text-gray-400 font-medium"
                  />
                  {searchQuery && (
                    <button 
                      type="button" 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      Batal
                    </button>
                  )}
                </div>

                {/* Filter Pills pills for book classification */}
                <div className="lg:col-span-8 flex flex-wrap gap-2 justify-start lg:justify-end">
                  {dynamicCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-lit-sage text-white shadow-xs'
                          : 'bg-white hover:bg-lit-cream border border-lit-border text-slate-600 hover:text-lit-charcoal shadow-3xs'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

              </div>
            </div>

            {/* AI smart engine slot integrations */}
            <AiRecommendationPanel 
              onAddAiBookToCatalog={handleAddNewBook}
              existingBooksCount={books.length}
            />

            {/* Custom Book register block */}
            <AddBookForm onAddBook={handleAddNewBook} />

            {/* Dynamic Catalog Section */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-lit-border pb-3">
                <div>
                  <h3 className="text-xl font-serif italic font-bold text-lit-charcoal">
                    Katalog Buku {selectedCategory !== 'Semua' ? `: ${selectedCategory}` : ''}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Silakan lihat detail untuk membaca sinopsis, rating, serta menuliskan ulasan Anda sendiri.
                  </p>
                </div>
                <div className="bg-lit-cream text-lit-sage border border-lit-border px-3.5 py-1 rounded-lg text-xs font-bold shrink-0 self-start sm:self-auto">
                  Menampilkan {filteredCatalog.length} Buku
                </div>
              </div>

              {/* Grid books catalog rendering */}
              {filteredCatalog.length === 0 ? (
                <div className="text-center py-20 bg-lit-cream rounded-xl border border-dashed border-lit-border p-8">
                  <div className="w-16 h-16 bg-white rounded-lg border border-lit-border flex items-center justify-center mx-auto mb-4 text-lit-sage">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold font-serif italic text-lit-charcoal">Pencarian Tidak Ditemukan</h4>
                  <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto leading-relaxed">
                    Kami tidak dapat menemukan kecocokan untuk pencarian Anda saat ini. Silakan coba ganti filter kategori atau masukkan kata kunci buku yang lain.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCatalog.map(book => (
                    <BookCard 
                      key={book.id}
                      book={book}
                      isSaved={readingList.some(item => item.bookId === book.id)}
                      onSelect={(b) => setSelectedBook(b)}
                      onToggleSave={(e, id) => handleToggleBookmark(e, id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTAINER 2: DAFTAR BACAANKU */}
        {activeTab === 'bacaan' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {!currentUser ? (
              <div className="max-w-md mx-auto text-center py-16 bg-lit-cream rounded-3xl border border-lit-border p-8 shadow-sm">
                <div className="w-16 h-16 bg-white border border-lit-border rounded-xl flex items-center justify-center mx-auto mb-5 text-lit-sage shadow-md">
                  <Bookmark className="w-6 h-6 animate-pulse text-lit-sage" />
                </div>
                <h4 className="text-xl font-serif italic font-bold text-lit-charcoal">Akses Daftar Bacaan Terkunci</h4>
                <p className="text-slate-650 text-xs mt-2.5 max-w-sm mx-auto leading-relaxed">
                  Fitur Daftar Bacaan Pribadi hanya tersedia bagi pembaca yang sudah masuk. Daftarkan diri Anda sekarang untuk menyimpan, memantau kemajuan membaca, dan mencatat ulasan buku menarik lainnya.
                </p>
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="mt-6 bg-lit-sage hover:opacity-95 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Masuk Sekarang
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column list view cards (Col span 8) */}
              <div className="lg:col-span-8 space-y-6">
                          {/* Statistics Box */}
                <div className="bg-lit-cream rounded-xl p-5 border border-lit-border shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-serif italic font-bold text-lit-charcoal">Daftar Bacaan Saya</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Kelola kemajuan dan ulas buku yang sedang Anda baca disini.</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-white px-3.5 py-2 rounded-lg border border-lit-border text-center shrink-0">
                      <span className="block text-xl font-bold text-lit-sage font-mono leading-none">{bookmarkStats.total}</span>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block mt-1">Disimpan</span>
                    </div>

                    <div className="bg-white px-3.5 py-2 rounded-lg border border-lit-border text-center shrink-0">
                      <span className="block text-xl font-bold text-slate-700 font-mono leading-none">{bookmarkStats.readingNow}</span>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block mt-1">Dibaca</span>
                    </div>

                    <div className="bg-white px-3.5 py-2 rounded-lg border border-lit-border text-center shrink-0">
                      <span className="block text-xl font-bold text-emerald-850 font-mono leading-none">{bookmarkStats.completed}</span>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block mt-1">Selesai</span>
                    </div>
                  </div>
                </div>

                {/* Bookmark List feeds layout */}
                {readingList.length === 0 ? (
                  <div className="text-center py-20 bg-lit-cream rounded-xl border border-dashed border-lit-border p-6">
                    <div className="w-14 h-14 bg-white border border-lit-border rounded-lg flex items-center justify-center mx-auto mb-4 text-lit-sage shadow-3xs">
                      <Bookmark className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-serif italic font-bold text-lit-charcoal">Daftar Bacaan Anda Masih Kosong</h4>
                    <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto leading-relaxed">
                      Jelajahi halaman awal, klik ikon penanda bintang simpan untuk mengumpulkan buku-buku bagus kesayangan Anda.
                    </p>
                    <button 
                      onClick={() => setActiveTab('jelajah')}
                      className="mt-5 bg-lit-sage hover:opacity-95 text-white font-bold text-xs py-2.5 px-5 rounded-lg shadow-xs transition-all cursor-pointer"
                    >
                      Ayo Cari Buku Bagus
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {readingList.map(item => {
                      const book = books.find(b => b.id === item.bookId);
                      if (!book) return null;

                      return (
                        <div 
                          key={item.bookId}
                          className={`p-4 rounded-xl border border-lit-border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-3xs ${
                            item.progressStatus === 'selesai' 
                              ? 'bg-emerald-50/15 border-emerald-200' 
                              : item.progressStatus === 'sedang_dibaca'
                                ? 'bg-slate-50/20 border-slate-300'
                                : 'bg-white border-lit-border'
                          }`}
                        >
                          {/* Mini book banner title */}
                          <div className="flex gap-4 items-center">
                            <div className={`w-10 h-14 rounded shrink-0 ${book.coverColor} text-white flex flex-col justify-center items-center text-center p-1.5 shadow relative overflow-hidden select-none`}>
                              <div className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-r from-black/20 to-transparent" />
                              <span className="text-[6px] font-bold line-clamp-2 uppercase leading-tight font-serif">{book.title}</span>
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-1.5">
                                {/* Display status badge colors */}
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                  item.progressStatus === 'selesai'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : item.progressStatus === 'sedang_dibaca'
                                      ? 'bg-slate-100 text-slate-755 border border-slate-200'
                                      : 'bg-lit-sage/10 text-lit-sage border border-lit-sage/20'
                                }`}>
                                  {item.progressStatus === 'selesai' ? 'Selesai Dibaca' : item.progressStatus === 'sedang_dibaca' ? 'Sedang Dibaca' : 'Ingin Dibaca'}
                                </span>
                                <span className="text-[9px] text-slate-400 font-medium">Disimpan {item.savedAt}</span>
                              </div>

                              <h4 className="font-serif font-bold text-lit-charcoal text-sm mt-1.5">{book.title}</h4>
                              <p className="text-[10px] text-slate-400">oleh {book.author} • {book.category}</p>
                            </div>
                          </div>

                          {/* Interactive status selectors */}
                          <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
                            <div className="flex items-center rounded-lg bg-[#F5F2ED] p-1 border border-lit-border">
                              <button
                                type="button"
                                onClick={() => handleUpdateReadingStatus(book.id, 'ingin_dibaca')}
                                className={`text-[10px] px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
                                  item.progressStatus === 'ingin_dibaca' 
                                    ? 'bg-white text-lit-sage shadow-3xs' 
                                    : 'text-slate-500 hover:text-slate-900'
                                }`}
                              >
                                Ingin Baca
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => handleUpdateReadingStatus(book.id, 'sedang_dibaca')}
                                className={`text-[10px] px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
                                  item.progressStatus === 'sedang_dibaca' 
                                    ? 'bg-white text-slate-700 shadow-3xs' 
                                    : 'text-slate-500 hover:text-slate-900'
                                }`}
                              >
                                Dibaca
                              </button>

                              <button
                                type="button"
                                onClick={() => handleUpdateReadingStatus(book.id, 'selesai')}
                                className={`text-[10px] px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
                                  item.progressStatus === 'selesai' 
                                    ? 'bg-white text-emerald-850 shadow-3xs' 
                                    : 'text-slate-500 hover:text-slate-900'
                                }`}
                              >
                                Selesai
                              </button>
                            </div>

                            <button 
                              type="button"
                              onClick={() => setSelectedBook(book)}
                              className="p-2 bg-[#FAF9F6] border border-lit-border hover:bg-white rounded-lg text-slate-600 transition-colors cursor-pointer flex items-center justify-center h-[30px] w-[30px]"
                              title="Lihat ulasan detail"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                            </button>
                            
                            <button 
                              type="button"
                              onClick={(e) => handleToggleBookmark(e, book.id)}
                              className="p-2 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg text-red-650 transition-colors cursor-pointer flex items-center justify-center font-bold text-xs h-[30px] w-[30px]"
                              title="Hapus dari daftar bacaan"
                            >
                              ✕
                            </button>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

              </div>

              {/* Right Column Motivation Quotes and Widget Pad notes (Col span 4) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Lit Motivation Quote Widget Card */}
                <div className="bg-lit-sage text-white rounded-xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute -top-10 -right-10 w-28 h-28 bg-white/5 rounded-full" />
                  <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-white/5 rounded-full" />
                  
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-wider font-bold text-white/80 block mb-3">Quote Penyemangat Hari Ini</span>
                    <blockquote className="font-serif italic text-sm font-light text-white/95 leading-relaxed mb-5">
                      "{activeQuote.text}"
                    </blockquote>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-xs font-semibold text-white/80">— {activeQuote.author}</span>
                  </div>
                </div>

                {/* Free Personal Sticky Notebookpad */}
                <div className="bg-lit-cream rounded-xl p-5 border border-lit-border shadow-2xs space-y-4">
                  <div className="flex items-center space-x-2 border-b border-lit-border/40 pb-2">
                    <FileText className="w-4 h-4 text-lit-sage" />
                    <h4 className="font-serif italic font-bold text-base text-lit-charcoal">Catatan Membaca Pribadi</h4>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Tuliskan poin penting, gagasan brilian, sasaran bulanan, atau kutipan favorit secara bebas di notepad aman ini.
                  </p>

                  <textarea 
                    value={notepadText}
                    onChange={(e) => {
                      const text = e.target.value;
                      setNotepadText(text);
                      if (currentUser) {
                        try {
                          setDoc(doc(db, `users/${currentUser.uid}/notes`, 'notepad'), {
                            text,
                            updatedAt: new Date().toLocaleDateString('id-ID'),
                            userId: currentUser.uid
                          });
                        } catch (err) {
                          console.error("Gagal menyinkronkan notepad ke cloud:", err);
                        }
                      } else {
                        localStorage.setItem('pustakapilihan_notepad', text);
                      }
                    }}
                    placeholder="Contoh: 'Tahun ini wajib selesaikan Filosofi Teras. Buku Atomic Habits mengajarkan saya bahwa perubahan kecil sangat menentukan...' "
                    rows={6}
                    className="w-full text-xs p-3 bg-white border border-lit-border rounded-lg focus:ring-1 focus:ring-lit-sage outline-none transition-all placeholder:text-gray-400 leading-relaxed resize-none custom-scrollbar font-sans"
                  />

                  <div className="flex items-center justify-between">
                    {currentUser ? (
                      <span className="text-[9px] text-emerald-600 font-medium italic flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        Tersinkronisasi ke Cloud
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-400 italic">Disimpan otomatis di browser</span>
                    )}
                    <button 
                      type="button"
                      onClick={() => {
                        if (currentUser) {
                          triggerToast("Catatan Anda otomatis disinkronkan ke cloud dengan aman! 🔒");
                        } else {
                          triggerToast("Catatan Anda telah disinkronkan ke local storage browser!");
                        }
                      }}
                      className="bg-white hover:bg-lit-cream border border-lit-border text-lit-sage text-[10px] px-3 py-1 rounded-md font-bold cursor-pointer transition-colors"
                    >
                      Paham
                    </button>
                  </div>
                </div>

              </div>

            </div>
            )}
          </div>
        )}

      </main>

      {/* Main Books Description & Reviews Dialog Modal */}
      <BookDetailModal 
        book={selectedBook}
        isOpen={selectedBook !== null}
        onClose={() => setSelectedBook(null)}
        isSaved={selectedBook ? readingList.some(item => item.bookId === selectedBook.id) : false}
        onToggleSave={() => selectedBook && handleToggleBookmark(null, selectedBook.id)}
        onSubmitReview={handleAddReview}
        isLoggedIn={!!currentUser}
        onTriggerAuth={() => setShowAuthModal(true)}
      />

      {/* Interactive Literature Dice Roll Modal */}
      <ShuffleModal
        isOpen={showShuffleModal}
        onClose={() => setShowShuffleModal(false)}
        books={books}
        onOpenBookDetail={(book) => setSelectedBook(book)}
        onToggleBookmark={(bookId) => handleToggleBookmark(null, bookId)}
        isBookSaved={(bookId) => readingList.some(item => item.bookId === bookId)}
        dynamicCategories={dynamicCategories}
      />

      {/* Auth Account Manual & Google Registration / Login Dialog Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        triggerToast={triggerToast}
      />

      {/* User Account / Profile Info Dialog Modal */}
      {showAccountModal && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-lit-charcoal/45 backdrop-blur-xs transition-opacity duration-300">
          <div 
            className="w-full max-w-md bg-white border border-lit-border rounded-3xl shadow-xl overflow-hidden animate-fade-in"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-lit-cream/40">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-lit-sage" />
                <h3 className="font-serif font-bold text-lg text-lit-charcoal">Akun Membaca Anda</h3>
              </div>
              <button
                onClick={() => setShowAccountModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-lit-charcoal hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              
              {/* Profile Card Info */}
              <div className="flex items-center space-x-4 bg-lit-cream p-4.5 rounded-2xl border border-lit-border">
                {currentUser.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt={currentUser.displayName || ''} 
                    className="w-14 h-14 rounded-full object-cover border-2 border-lit-sage"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-lit-sage text-white font-bold flex items-center justify-center text-xl shadow-xs">
                    {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'P'}
                  </div>
                )}
                <div>
                  <h4 className="font-serif font-semibold text-slate-805 text-base">{currentUser.displayName || 'Pembaca Setia'}</h4>
                  <p className="text-xs text-slate-500">{currentUser.email}</p>
                </div>
              </div>

              {/* Synchronized Stats Info Grid */}
              <div className="space-y-3">
                <h5 className="text-[10px] uppercase tracking-wider font-mono font-bold text-lit-sage mb-2">Statistik Pustaka Tersinkronisasi</h5>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                    <span className="text-xl font-bold text-lit-charcoal block">
                      {books.filter(b => b.createdBy === currentUser.uid).length}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Buku Baru</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                    <span className="text-xl font-bold text-lit-charcoal block">
                      {readingList.length}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Daftar Bacaan</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                    <span className="text-xl font-bold text-lit-charcoal block">
                      {readingList.filter(i => i.progressStatus === 'selesai').length}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Selesai</span>
                  </div>
                </div>
              </div>

              {/* Sync Status Banner */}
              <div className="bg-emerald-50 border border-emerald-150 p-4 rounded-xl flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <h6 className="text-xs font-bold text-emerald-800">Sinkronisasi Cloud Aktif</h6>
                  <p className="text-[11px] text-emerald-700/90 leading-relaxed mt-0.5">
                    Seluruh catatan pribadi, ulasan buku, status kemajuan membaca, dan buku kustom Anda kini tersimpan dengan aman di database cloud kami secara real-time.
                  </p>
                </div>
              </div>

            </div>

            {/* Modal Actions Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-xs font-bold text-red-650 hover:text-red-700 border border-red-200 hover:bg-red-50 rounded-lg transition-all flex items-center space-x-1.5 bg-white cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar Akun</span>
              </button>
              
              <button
                onClick={() => setShowAccountModal(false)}
                className="px-5 py-2 bg-lit-sage hover:opacity-95 text-white text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Full-bleed Footer Section */}
      <footer className="bg-lit-charcoal text-white/90 py-12 mt-20 border-t border-lit-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Logo description */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-lit-sage rounded-lg flex items-center justify-center text-white font-serif font-bold text-lg">
                  R
                </div>
                <span className="text-lg font-bold font-serif tracking-tight">ReadBooks</span>
              </div>
              <p className="text-slate-300 text-xs max-w-sm leading-relaxed">
                Platform rekomendasi buku cerdas terkurasi. Kami percaya di antara ribuan lembar tulisan di luar sana, selalu ada satu buku istimewa yang bisa menetapkan takdir kebaikan hidup Anda berikutnya. Mari membaca bersama.
              </p>
            </div>

            {/* Quick Links Nav */}
            <div>
              <h5 className="text-lit-sage text-xs font-bold uppercase tracking-widest mb-4">Navigasi Utama</h5>
              <ul className="space-y-2.5 text-xs text-slate-350">
                <li>
                  <button 
                    onClick={() => { setActiveTab('jelajah'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Katalog Jelajah
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setActiveTab('bacaan'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Daftar Bacaanku
                  </button>
                </li>
                <li>
                  <button 
                    onClick={handleSurpriseRoll} 
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Kocok Buku Acak
                  </button>
                </li>
              </ul>
            </div>

            {/* Contacts Column */}
            <div>
              <h5 className="text-lit-sage text-xs font-bold uppercase tracking-widest mb-4">Hubungi Kami</h5>
              <ul className="space-y-2.5 text-xs text-slate-350">
                <li className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-lit-sage" />
                  <a href="mailto:readbookswme@gmail.com" className="hover:text-white transition-colors">
                    readbookswme@gmail.com
                  </a>
                </li>
              </ul>
            </div>

          </div>

          {/* Copyright legal stuff */}
          <div className="border-t border-lit-border/30 mt-8 pt-8 text-center md:flex md:items-center md:justify-between text-xs text-slate-400/60">
            <p>&copy; 2026 ReadBooks. Dibuat dengan dedikasi untuk seluruh pencinta buku di Indonesia.</p>
            <div className="flex justify-center space-x-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="hover:text-white transition-colors"><Github className="w-4 h-4" /></a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
