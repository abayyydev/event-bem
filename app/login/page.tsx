"use client";

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import api from '../../lib/axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import Swal from 'sweetalert2';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', {
        identifier: formData.identifier,
        password: formData.password,
        type: 'mahasiswa'
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      Swal.fire({
        icon: 'success',
        title: 'Login Berhasil',
        text: 'Selamat datang kembali!',
        timer: 1500,
        showConfirmButton: false
      });
      router.push('/mahasiswa/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal login. Periksa kembali data Anda.');
    } finally {
      setLoading(false);
    }
  };

    const handleGoogleSuccess = async (credentialResponse: any) => {
      try {
        const { credential } = credentialResponse;
        const res = await api.post('/auth/google', { token: credential, action: 'login' });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        Swal.fire({
          icon: 'success',
          title: 'Login Berhasil',
          text: 'Selamat datang kembali!',
          timer: 1500,
          showConfirmButton: false
        });
        router.push('/mahasiswa/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal login via Google');
    }
  };

  const handleGoogleError = () => {
    setError('Login Google dibatalkan atau gagal.');
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy_client_id_for_now'}>
      <div className="min-h-screen bg-gray-50 font-sans relative flex flex-col justify-center items-center py-12 px-4">
        {/* Background Accent from Dashboard */}
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-indigo-900 rounded-b-[3rem] shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-800 rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-500 rounded-full opacity-20 blur-2xl"></div>
        </div>

        <div className="w-full max-w-md p-8 sm:p-10 bg-white rounded-3xl border border-gray-100 shadow-2xl relative z-10 mt-8">
          <div className="text-center mb-8">
            <img src="/logo-bem.png" alt="Logo BEM El Rahma" className="w-20 h-20 object-contain mx-auto mb-4 drop-shadow-md" />
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Selamat Datang</h1>
            <p className="text-gray-500 text-sm font-medium">Masuk sebagai Mahasiswa ke CampusEvent</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleManualLogin} className="flex flex-col gap-5 mb-6">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">NIM atau Email</label>
              <input
                type="text"
                name="identifier"
                required
                value={formData.identifier}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400 text-sm font-medium"
                placeholder="Masukkan NIM atau Email Anda"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400 text-sm font-medium"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:transform-none"
            >
              {loading ? 'Memproses...' : 'Masuk Akun'}
            </button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400 font-medium">Atau masuk dengan</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 items-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              shape="pill"
              text="continue_with"
            />
          </div>

          <div className="mt-8 text-center text-sm text-gray-500 font-medium flex flex-col gap-3">
            <p>
              Belum punya akun? <Link href="/register" className="text-indigo-600 font-bold hover:text-indigo-500 transition-colors">Daftar di sini</Link>
            </p>
            <p>
              Masuk sebagai <Link href="/login/admin" className="text-indigo-600 font-bold hover:text-indigo-500 transition-colors">Penyelenggara / Admin?</Link>
            </p>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}