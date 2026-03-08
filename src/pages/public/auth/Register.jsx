import React from 'react';
import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReCAPTCHA from "react-google-recaptcha";
import api from '../../../api/axios'; // Sesuaikan path axios Anda

export default function Register() {
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  
  const [captchaToken, setCaptchaToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg(''); // Hilangkan pesan error saat user mulai mengetik ulang
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
    setErrorMsg('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // 1. Validasi Front-end (Double Check Password)
    if (formData.password !== formData.password_confirmation) {
      setErrorMsg("Password dan Konfirmasi Password tidak cocok!");
      return;
    }

    // 2. Validasi Front-end (Captcha)
    if (!captchaToken) {
      setErrorMsg("Mohon centang kotak 'I'm not a robot' terlebih dahulu.");
      return;
    }

    setLoading(true);
    try {
      // 3. Kirim ke Backend
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        'g-recaptcha-response': captchaToken
      };

      const res = await api.post('/register', payload);

      if (res.data.success) {
        // Opsional: Langsung simpan token dan redirect, ATAU arahkan ke halaman Login
        localStorage.setItem('token', res.data.access_token);
        alert("Pendaftaran Berhasil! Selamat datang di Riff Fashion.");
        window.location.href = '/Home'; // Redirect kasar agar state otentikasi refresh
      }
    } catch (error) {
      console.error("Register Error:", error.response);
      
      // Mengambil pesan error dari validasi Laravel
      if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0][0];
        setErrorMsg(firstError);
      } else {
        setErrorMsg(error.response?.data?.message || "Terjadi kesalahan pada server.");
      }
      
      // Reset Captcha jika terjadi error server (agar tidak expired)
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
        setCaptchaToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md border-8 border-black p-8 md:p-10 bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        
        <div className="text-center mb-10 border-b-4 border-black pb-6">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">Bergabung.</h1>
          <p className="font-bold uppercase tracking-widest text-gray-500 text-xs mt-2">Buat Akun Riff Fashion</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 border-4 border-red-500 bg-red-50 text-red-700 font-bold uppercase text-xs tracking-widest text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2">Nama Lengkap</label>
            <input 
              type="text" 
              name="name" 
              required 
              className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold text-sm uppercase"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2">Email Valid</label>
            <input 
              type="email" 
              name="email" 
              required 
              className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold text-sm lowercase"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2">Password</label>
            <input 
              type="password" 
              name="password" 
              required 
              minLength="8"
              className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold text-sm"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2">Ulangi Password</label>
            <input 
              type="password" 
              name="password_confirmation" 
              required 
              minLength="8"
              className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold text-sm"
              value={formData.password_confirmation}
              onChange={handleChange}
            />
          </div>

          {/* AREA GOOGLE RECAPTCHA */}
          <div className="pt-2 flex justify-center">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              onChange={handleCaptchaChange}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !captchaToken}
            className={`w-full mt-6 py-4 border-4 border-black text-sm font-black uppercase tracking-widest transition-all ${
              (loading || !captchaToken)
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(209,213,219,1)] hover:bg-white hover:text-black hover:-translate-y-1'
            }`}
          >
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="mt-8 text-center border-t-4 border-black pt-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Sudah Punya Akun? <br/>
            <Link to="/login" className="text-black hover:text-gray-400 mt-2 inline-block border-b-2 border-black pb-1">
              Login di Sini
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
