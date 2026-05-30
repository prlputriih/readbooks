import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { X, Mail, Lock, User, LogIn, UserPlus, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerToast: (message: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, triggerToast }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Loading & error status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleGoogleLoginInner = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      setErrorMsg('');
      const result = await signInWithPopup(auth, provider);
      triggerToast(`Selamat datang kembali, ${result.user.displayName}! Buku-buku Anda sudah tersinkronisasi. ✨`);
      onClose();
    } catch (error: any) {
      console.error("Gagal masuk dengan Google:", error);
      setErrorMsg("Gagal masuk dengan akun Google. Silakan coba kembali.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Client-side validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Format email tidak valid.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Kata sandi harus minimal 6 karakter.');
      return;
    }

    if (activeTab === 'register' && !name.trim()) {
      setErrorMsg('Nama lengkap wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      if (activeTab === 'login') {
        // Manual Sign In
        const result = await signInWithEmailAndPassword(auth, email.trim(), password);
        triggerToast(`Selamat datang kembali, ${result.user.displayName || 'Pembaca'}! ✨`);
        onClose();
      } else {
        // Manual Registration
        const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
        
        // Update user display profile
        if (result.user) {
          await updateProfile(result.user, {
            displayName: name.trim()
          });

          // Seed user in Firestore users list
          const userDocRef = doc(db, 'users', result.user.uid);
          await setDoc(userDocRef, {
            userId: result.user.uid,
            displayName: name.trim(),
            email: email.trim(),
            photoURL: '',
            updatedAt: new Date().toLocaleDateString('id-ID')
          }, { merge: true });

          triggerToast(`Penorehan akun sukses! Selamat datang, ${name.trim()}! 📖`);
          onClose();
        }
      }
    } catch (err: any) {
      console.error("Manual Auth Error:", err);
      let friendlyMessage = 'Terjadi kesalahan saat otentikasi.';
      
      switch (err.code) {
        case 'auth/email-already-in-use':
          friendlyMessage = 'Alamat email ini sudah terdaftar. Silakan langsung masuk.';
          break;
        case 'auth/invalid-email':
          friendlyMessage = 'Alamat email tidak valid.';
          break;
        case 'auth/weak-password':
          friendlyMessage = 'Kata sandi terlalu pendek/lemah. Gunakan sandi yang lebih panjang.';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          friendlyMessage = 'Kombinasi email atau kata sandi salah. Silakan periksa kembali.';
          break;
        default:
          if (err.message) {
            friendlyMessage = err.message;
          }
      }
      setErrorMsg(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-lit-charcoal/45 backdrop-blur-xs transition-all duration-300">
      <div 
        className="w-full max-w-md bg-white border border-lit-border rounded-3xl shadow-2xl overflow-hidden animate-fade-in"
        role="dialog"
        aria-modal="true"
        id="manual-auth-modal"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-lit-cream/30">
          <h3 className="font-serif font-bold text-lg text-lit-charcoal">
            {activeTab === 'login' ? 'Masuk ke ReadBooks' : 'Buat Akun Membaca Baru'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-lit-charcoal hover:bg-slate-100 transition-all cursor-pointer"
            id="close-auth-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Tabs switch */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'login' 
                  ? 'bg-white text-lit-charcoal shadow-xs' 
                  : 'text-slate-500 hover:text-slate-805'
              }`}
              id="switch-tab-login"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'register' 
                  ? 'bg-white text-lit-charcoal shadow-xs' 
                  : 'text-slate-500 hover:text-slate-805'
              }`}
              id="switch-tab-register"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar Akun</span>
            </button>
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-100 text-red-750 px-4 py-2.5 rounded-xl text-xs leading-relaxed font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleManualAuth} className="space-y-4">
            {activeTab === 'register' && (
              <div className="space-y-1.5">
                <label className="text-slate-600 text-xs font-semibold block">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    disabled={loading}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-lit-sage/50 focus:bg-white rounded-xl py-2 px-3 pl-10 text-xs text-slate-805 outline-hidden transition-all"
                    id="input-auth-name"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-slate-600 text-xs font-semibold block">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  disabled={loading}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-lit-sage/50 focus:bg-white rounded-xl py-2 px-3 pl-10 text-xs text-slate-850 outline-hidden transition-all"
                  id="input-auth-email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-600 text-xs font-semibold block">Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 karakter"
                  disabled={loading}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-lit-sage/50 focus:bg-white rounded-xl py-2 px-3 pl-10 text-xs text-slate-850 outline-hidden transition-all"
                  id="input-auth-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-lit-sage hover:opacity-95 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-350"
              id="submit-auth-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Sedang Diproses...</span>
                </>
              ) : (
                <>
                  {activeTab === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span>{activeTab === 'login' ? 'Masuk Sekarang' : 'Daftar Akun'}</span>
                </>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-mono tracking-wider uppercase">atau</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          {/* Google SSO Login option */}
          <button
            onClick={handleGoogleLoginInner}
            disabled={loading}
            className="w-full bg-white hover:bg-slate-50 text-slate-750 border border-slate-205 rounded-xl py-2 px-4 text-xs font-bold shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            id="google-sso-auth-btn"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Masuk dengan Google</span>
          </button>
        </div>

        {/* Modal Info Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 text-[10px] text-center text-slate-500 font-medium">
          Dapatkan sinkronisasi instan catatan & kemajuan bacaan Anda di lintas perangkat.
        </div>
      </div>
    </div>
  );
};
