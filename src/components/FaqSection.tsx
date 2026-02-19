"use client";

import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "Berapa lama estimasi waktu pencetakan?",
    answer: "Untuk dokumen standar (di bawah 50 halaman), proses memakan waktu 10-15 menit. Anda akan menerima notifikasi WhatsApp saat dokumen siap diambil.",
  },
  {
    question: "Apakah format file yang didukung?",
    answer: "Kami menyarankan format PDF untuk menghindari perubahan tata letak (layout). Namun, kami juga menerima format DOCX, PPTX, dan gambar (JPG/PNG).",
  },
  {
    question: "Bagaimana dengan privasi dan keamanan dokumen saya?",
    answer: "Sistem kami dirancang untuk menghapus dokumen Anda secara otomatis dari server dan storage (Supabase) dalam waktu 3 hari setelah status pesanan selesai.",
  },
];

export default function FaqSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Pertanyaan Umum
          </h2>
          <p className="mt-4 text-zinc-500">
            Segala hal yang perlu Anda ketahui tentang layanan PRINT GO.
          </p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-zinc-200 rounded-lg overflow-hidden transition-colors duration-300 hover:border-zinc-300"
            >
              <button
                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                onClick={() => toggleFaq(index)}
              >
                <span className="font-medium text-zinc-900">{faq.question}</span>
                <span className="ml-6 shrink-0 text-zinc-400">
                  <svg
                    className={`w-5 h-5 transition-transform duration-300 ${
                      activeIndex === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  activeIndex === index ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-5 text-zinc-500 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}