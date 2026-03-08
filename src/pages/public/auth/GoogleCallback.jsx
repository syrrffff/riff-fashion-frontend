import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Tangkap token dari URL (?token=14|KKxEiBs...)
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      // 2. Simpan token ke brankas browser (localStorage)
      localStorage.setItem('auth_token', token);
      
      // 3. Arahkan ke halaman utama (CustomerLayout akan mendeteksi token ini)
      // Kita pakai window.location.href agar aplikasi me-reload state user dengan sempurna
      window.location.href = '/Home';
    } else if (error) {
      // Jika ada error dari Google, kembalikan ke halaman login
      navigate('/login?error=google_failed');
    } else {
      // Jika tidak ada apa-apa, kembalikan ke login
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-gray-900 uppercase tracking-widest">Memproses Login...</h2>
        <p className="text-gray-500 mt-2">Mohon tunggu sebentar.</p>
      </div>
    </div>
  );
}
