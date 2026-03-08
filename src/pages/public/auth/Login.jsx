
import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../../../api/axios'; // Pastikan path ini benar sesuai struktur folder Anda

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Cukup gunakan SATU state error untuk semua jenis kegagalan (Biasa & Google)
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Membaca query parameter dari URL (misal: ?error=banned)
    const queryParams = new URLSearchParams(location.search);
    const errorParam = queryParams.get('error');

    if (errorParam === 'banned') {
      setError('AKSES DITOLAK: Akun Anda telah diblokir secara permanen oleh Admin karena melanggar kebijakan toko.');
    } else if (errorParam === 'true') {
      setError('Terjadi kesalahan saat otentikasi Google. Silakan coba lagi.');
    }

    // JURUS RAHASIA: Bersihkan URL bar dari ?error=banned agar terlihat profesional
    if (errorParam) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [location.search]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Bersihkan error sebelumnya saat mencoba login lagi

    try {
      const response = await api.post('/login', {
        email: email,
        password: password
      });

      const token = response.data.token || response.data.access_token;
      if (token) {
        localStorage.setItem('auth_token', token);
        navigate('/Home');
      } else {
        setError('Token tidak ditemukan dari server.');
      }
    } catch (err) {
      // Tangkap pesan error dari Laravel (termasuk pesan Banned dari login biasa)
      setError(err.response?.data?.message || 'Gagal login. Periksa email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk mengarahkan user ke halaman login Google bawaan Laravel Socialite
  const handleGoogleLogin = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    // Sesuaikan URL ini dengan route Socialite di Laravel Anda
    window.location.href = `${baseUrl}/auth/google/redirect`;
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md border-8 border-black p-8 md:p-10 bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">

        {/* HEADER */}
        <div className="text-center mb-8 border-b-4 border-black pb-6">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">Login.</h2>
          <p className="font-bold uppercase tracking-widest text-gray-500 text-xs mt-2">Masuk ke Riff Fashion</p>
        </div>

        {/* ERROR MESSAGE (Satu tempat untuk semua error) */}
        {error && (
          <div className="mb-6 p-4 border-4 border-red-900 bg-red-100 text-red-800 font-black uppercase text-xs tracking-widest text-center">
            {error}
          </div>
        )}

        {/* FORM LOGIN */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold text-sm lowercase"
              placeholder="alamat@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold text-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-6 py-4 border-4 border-black text-sm font-black uppercase tracking-widest transition-all ${
              loading
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(209,213,219,1)] hover:bg-white hover:text-black hover:-translate-y-1'
            }`}
          >
            {loading ? 'Memproses...' : 'Masuk Sekarang'}
          </button>
        </form>

        {/* BAGIAN LOGIN GOOGLE */}
        <div className="mt-8">
          <div className="relative border-t-4 border-black pt-6 flex justify-center">
            <span className="absolute -top-3 px-4 bg-white text-black font-black uppercase tracking-widest text-xs">
              Atau
            </span>
          </div>

          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex justify-center items-center py-4 px-4 border-4 border-black bg-white text-sm font-black text-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase tracking-widest transition-all mt-4"
          >
            <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Masuk dengan Google
          </button>
        </div>

        {/* LINK DAFTAR */}
        <div className="mt-8 text-center border-t-4 border-black pt-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Belum punya akun? <br/>
            <Link to="/register" className="text-black hover:text-gray-400 mt-2 inline-block border-b-2 border-black pb-1">
              Daftar di sini
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
