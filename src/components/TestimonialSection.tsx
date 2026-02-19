interface Testimonial {
  body: string;
  author: string;
  role: string;
}

const testimonials: Testimonial[] = [
  {
    body: "Antarmukanya sangat intuitif. Saya bisa upload bahan skripsi dari kos, bayar pakai QRIS, dan tinggal ambil di tempat tanpa harus antre berjam-jam.",
    author: "Bagas Pratama",
    role: "Mahasiswa Tingkat Akhir",
  },
  {
    body: "Sangat terbantu dengan fitur kalkulasi harga otomatis. Tidak ada biaya tersembunyi, dan notifikasi WhatsApp-nya sangat responsif.",
    author: "Nadia Larasati",
    role: "Freelance Designer",
  },
  {
    body: "Dulu sering khawatir file berantakan saat dibuka di komputer tempat print. Dengan fitur validasi dan anjuran PDF di PRINT GO, masalah itu hilang sepenuhnya.",
    author: "Reza Mahendra",
    role: "Karyawan Swasta",
  },
];

export default function TestimonialSection() {
  return (
    <section className="py-24 bg-zinc-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Dipercaya oleh Ratusan Pelanggan
          </h2>
          <p className="mt-4 text-zinc-500">
            Pengalaman mereka menggunakan efisiensi pencetakan digital kami.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-zinc-900" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-zinc-700 leading-relaxed mb-6">
                "{testimonial.body}"
              </blockquote>
              <div>
                <div className="font-semibold text-zinc-900">{testimonial.author}</div>
                <div className="text-sm text-zinc-500">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}