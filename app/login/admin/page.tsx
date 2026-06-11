"use client";

import api from '../../../lib/axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function AdminLoginPage() {
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

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', {
        identifier: formData.identifier,
        password: formData.password,
        type: 'user' // backend expects type 'user' for penyelenggara/superadmin
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      if (res.data.user.role === 'superadmin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/organizer/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal login. Periksa kembali email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative flex flex-col justify-center items-center py-12 px-4">
      {/* Background Accent from Dashboard */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-slate-900 rounded-b-[3rem] shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-900 rounded-full opacity-40 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-amber-500 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="w-full max-w-md p-8 sm:p-10 bg-white rounded-3xl border border-gray-100 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Portal Admin</h1>
          <p className="text-gray-500 text-sm font-medium">Masuk sebagai Penyelenggara / Admin</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="flex flex-col gap-5 mb-6">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Email</label>
            <input
              type="email"
              name="identifier"
              required
              value={formData.identifier}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400 text-sm font-medium"
              placeholder="admin@kampus.ac.id"
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400 text-sm font-medium"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-slate-800 text-white py-3.5 rounded-xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-900 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:transform-none"
          >
            {loading ? 'Memproses...' : 'Masuk Portal'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500 font-medium">
          <p>
            Masuk sebagai <Link href="/login" className="text-indigo-600 font-bold hover:text-indigo-500 transition-colors">Mahasiswa?</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
