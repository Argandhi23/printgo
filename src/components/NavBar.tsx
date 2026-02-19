"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Printer, Menu, X } from "lucide-react";

export default function NavBar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  // State untuk deteksi scroll
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Tutup menu mobile jika ganti halaman
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Logika Upscroll (Sembunyi saat turun, muncul saat naik)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Deteksi untuk ubah background jadi blur
      setIsScrolled(currentScrollY > 20);

      // Logika sembunyi/muncul
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Sedang scroll ke bawah -> sembunyikan Navbar
        setIsHidden(true);
      } else {
        // Sedang scroll ke atas -> munculkan Navbar
        setIsHidden(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // --- LOGIKA SEMBUNYIKAN NAVBAR DI ADMIN ---
  // Pastikan logika ini ditaruh di sini (setelah semua hooks dieksekusi)
  const isAdminPage = pathname?.startsWith('/admin');
  if (isAdminPage) {
    return null;
  }

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Order Print", href: "/order" },
    { name: "Cek Status", href: "/cek-status" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: isHidden ? "-100%" : "0%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
          isScrolled || isOpen
            ? "bg-white/80 backdrop-blur-xl border-b border-zinc-200/50 shadow-sm"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group z-50">
              <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center group-hover:bg-zinc-700 transition-colors duration-300">
                <Printer className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900">
                PRINT GO.
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                      isActive ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-900"
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute left-0 right-0 -bottom-[22px] h-[2px] bg-zinc-900"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Right Button */}
            <div className="hidden md:flex items-center">
              <Link
                href="/order"
                className="inline-flex justify-center items-center bg-zinc-900 text-white text-sm font-medium py-2.5 px-6 rounded-full shadow-sm hover:bg-zinc-800 hover:shadow-md transition-all duration-300 ring-1 ring-zinc-900"
              >
                Cetak Sekarang
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors z-50 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 top-0 z-40 bg-white shadow-xl pt-24 pb-8 px-6 md:hidden border-b border-zinc-200"
          >
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-3 rounded-xl text-lg font-medium transition-colors ${
                    pathname === link.href
                      ? "bg-zinc-100 text-zinc-900"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Backdrop */}
       <AnimatePresence>
        {isOpen && (
          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             onClick={() => setIsOpen(false)}
             className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden"
          />
        )}
       </AnimatePresence>
    </>
  );
}