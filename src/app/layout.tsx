import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Import komponen-komponen global
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PRINT GO - Layanan Cetak Digital Profesional",
  description: "Cetak dokumen Anda secara online. Cepat, aman, dan tanpa antre.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 text-zinc-900 selection:bg-indigo-100 selection:text-indigo-900 flex flex-col min-h-screen`}
      >
        {/* Navbar Fixed di atas */}
        <NavBar />
        
        {/* Konten Utama (akan terdorong ke bawah oleh padding di page.tsx) */}
        <main className="grow">
            {children}
        </main>

        {/* Footer di bawah */}
        <Footer />
        
      </body>
    </html>
  );
}