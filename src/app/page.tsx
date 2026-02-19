"use client";

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { Player } from '@lottiefiles/react-lottie-player';

// Pastikan path ini sesuai dengan lokasi file Lottie Anda di folder public
import heroAnimationData from "../../public/animations/hero-print.json"; 

export default function Home() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    // UBAH 1: Tambahkan bg-white di wrapper utama agar seluruh halaman putih
    <div className="overflow-hidden font-sans pt-28 bg-white">
      
      {/* --- HERO SECTION --- */}
      <section className="relative max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-20 flex flex-col-reverse lg:flex-row items-center justify-between gap-16">
        
        {/* Dekorasi Background Halus (Opsional: Bisa dihapus jika ingin putih polos total tanpa bias warna) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-zinc-100 via-zinc-50 to-white blur-3xl rounded-full mix-blend-multiply"></div>
        </div>

        {/* Teks Kiri */}
        <motion.div 
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="w-full lg:w-3/5 text-center lg:text-left z-10"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-zinc-200 shadow-sm text-zinc-700 text-sm font-medium mb-8">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            Status: Operasional (08:00 - 21:00)
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-extrabold tracking-tight text-zinc-900 leading-[1.1] mb-6">
            Cetak Dokumen <br />
            {/* UBAH 2: Mengubah gradien menjadi warna abu-abu solid */}
            <span className="text-zinc-500">
              Tanpa Antre.
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-xl text-zinc-600 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Solusi cetak digital instan untuk kebutuhan profesional & akademik. Unggah file Anda, kami proses otomatis, dan ambil saat siap.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link 
              href="/order" 
              className="inline-flex justify-center items-center bg-zinc-900 text-white font-semibold py-4 px-8 rounded-full shadow-lg hover:bg-zinc-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ring-2 ring-zinc-900 ring-offset-2"
            >
              Mulai Cetak Sekarang
            </Link>
            <Link 
              href="/cek-status" 
              className="inline-flex justify-center items-center bg-white text-zinc-700 font-semibold py-4 px-8 rounded-full shadow-sm border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all duration-300"
            >
              Lacak Pesanan
            </Link>
          </motion.div>

          {/* Trust Badge Kecil */}
          <motion.div variants={itemVariants} className="mt-12 flex items-center justify-center lg:justify-start gap-4 text-sm text-zinc-500 font-medium">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-zinc-100 border-2 border-white flex items-center justify-center text-xs overflow-hidden"></div>
              ))}
             </div>
             <p>Dipercaya oleh 500+ Mahasiswa & Pekerja</p>
          </motion.div>
        </motion.div>

        {/* Animasi Kanan (LOTTIE PLAYER DENGAN FILE LOKAL) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full lg:w-2/5 relative z-10 flex justify-center"
        >
          <div className="relative w-full max-w-lg">
             {/* UBAH 3: Menghapus atau menyamarkan blob background agar tidak kontras dengan background putih */}
             <div className="absolute inset-0 bg-gradient-to-tr from-zinc-100 to-zinc-50 blur-3xl rounded-full transform rotate-12 scale-110 -z-10 opacity-50"></div>
             
             <Player
                autoplay
                loop
                src={heroAnimationData} 
                style={{ width: '100%', height: 'auto' }}
             />
          </div>
        </motion.div>
      </section>

      {/* --- CARA KERJA SECTION --- */}
      {/* UBAH 4: Menghapus border-t agar sambungan terlihat mulus putih */}
      <section className="bg-white py-24 relative z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl mb-6">
              Proses yang <span className="text-zinc-500">Sangat Sederhana.</span>
            </h2>
            <p className="text-zinc-500 max-w-2xl mx-auto text-lg">
              Kami menghilangkan kerumitan proses pencetakan konvensional. Hemat waktu Anda untuk hal yang lebih penting.
            </p>
          </motion.div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
          >
            {/* Step 1 */}
            <motion.div variants={itemVariants} className="group relative p-10 rounded-[2.5rem] bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-zinc-100 transition-colors shadow-sm">
                <svg className="w-7 h-7 text-zinc-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-4">1. Unggah File</h3>
              <p className="text-zinc-600 leading-relaxed">
                Drag & drop dokumen PDF atau Word Anda. Sistem pintar kami akan langsung memvalidasi formatnya.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div variants={itemVariants} className="group relative p-10 rounded-[2.5rem] bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-zinc-100 transition-colors shadow-sm">
                <svg className="w-7 h-7 text-zinc-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-4">2. Pembayaran Instan</h3>
              <p className="text-zinc-600 leading-relaxed">
                Harga dihitung otomatis. Bayar dengan aman menggunakan QRIS dalam hitungan detik.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div variants={itemVariants} className="group relative p-10 rounded-[2.5rem] bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-zinc-100 transition-colors shadow-sm">
                <svg className="w-7 h-7 text-zinc-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-4">3. Ambil & Selesai</h3>
              <p className="text-zinc-600 leading-relaxed">
                Dapatkan notifikasi WhatsApp saat siap. Datang ke gerai dan ambil dokumen tanpa antre.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}