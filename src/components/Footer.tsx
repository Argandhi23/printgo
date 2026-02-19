"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Printer } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-400 py-16 border-t border-zinc-900 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12"
      >
        <div className="md:col-span-2 space-y-6">
          <Link href="/" className="flex items-center gap-2">
            <Printer className="w-6 h-6 text-zinc-100" />
            <span className="text-2xl font-bold text-zinc-100 tracking-tighter">
              PRINT GO.
            </span>
          </Link>
          <p className="text-sm leading-relaxed max-w-sm text-zinc-500">
            Platform cetak digital modern. Unggah dokumen Anda secara aman, pantau status secara real-time, dan ambil di gerai kami saat sudah siap. Tanpa antre, tanpa ribet.
          </p>
        </div>
        
        <div>
          <h3 className="text-zinc-100 font-semibold mb-6">Navigasi</h3>
          <ul className="space-y-4 text-sm">
            <li><Link href="/" className="hover:text-zinc-100 transition-colors">Beranda</Link></li>
            <li><Link href="/order" className="hover:text-zinc-100 transition-colors">Order Print</Link></li>
            <li><Link href="/cek-status" className="hover:text-zinc-100 transition-colors">Cek Status</Link></li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-zinc-100 font-semibold mb-6">Kontak</h3>
          <ul className="space-y-4 text-sm text-zinc-500">
            <li>Jl. Teknologi No. 42, Jakarta</li>
            <li>hello@printgo.com</li>
            <li>WA: +62 812 3456 7890</li>
          </ul>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.3 }}
        className="max-w-7xl mx-auto px-6 lg:px-8 mt-16 pt-8 border-t border-zinc-900 text-sm flex flex-col md:flex-row justify-between items-center gap-4"
      >
        <p>&copy; {new Date().getFullYear()} Print Go. Hak cipta dilindungi.</p>
        <div className="flex space-x-6">
          <Link href="#" className="hover:text-zinc-100 transition-colors">Kebijakan Privasi</Link>
          <Link href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</Link>
        </div>
      </motion.div>
    </footer>
  );
}