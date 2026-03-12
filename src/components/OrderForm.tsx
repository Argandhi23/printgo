"use client"

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function OrderForm() {
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const [qty, setQty] = useState<number | ''>(0)
  const [qtyPensil, setQtyPensil] = useState<number | ''>(0)
  const [qtyBolpoin, setQtyBolpoin] = useState<number | ''>(0)

  const [isColor, setIsColor] = useState(false)
  const [estimatedPrice, setEstimatedPrice] = useState(0)

  const [orderSuccess, setOrderSuccess] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [isStoreClosed, setIsStoreClosed] = useState(false)

  useEffect(() => {
    const checkStoreHours = () => {
      const currentHour = new Date().getHours()
      if (currentHour < 8 || currentHour >= 21) {
        setIsStoreClosed(true)
      } else {
        setIsStoreClosed(false)
      }
    }
    checkStoreHours()

    const pricePerSheet = isColor ? 1500 : 1000
    const totalPrint = (Number(qty) || 0) * pricePerSheet
    const totalPensil = (Number(qtyPensil) || 0) * 1500
    const totalBolpoin = (Number(qtyBolpoin) || 0) * 2000

    setEstimatedPrice(totalPrint + totalPensil + totalBolpoin)
  }, [qty, isColor, qtyPensil, qtyBolpoin])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) {
      setFile(null)
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('⚠️ File terlalu besar! Maksimal ukuran file adalah 10MB.')
      e.target.value = ''
      setFile(null)
      return
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ]

    if (!allowedTypes.includes(selectedFile.type)) {
      alert('⚠️ Format file tidak didukung! Harap upload PDF, Word, atau Gambar (JPG/PNG).')
      e.target.value = ''
      setFile(null)
      return
    }

    setFile(selectedFile)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // --- TAMBAHAN PENGAMAN 1: Mencegah checkout jika qty 0 atau kosong ---
    if (qty === '' || Number(qty) <= 0) {
      alert('⚠️ Jumlah lembar cetak tidak boleh kosong atau 0. Minimal 1 lembar ya!')
      setLoading(false)
      return
    }
    // ----------------------------------------------------------------------

    // --- TAMBAHAN PENGAMAN 2: Wajib upload file jika mau print ---
    if (!file) {
      alert('⚠️ Tolong upload file dokumennya ya!')
      setLoading(false)
      return
    }
    // -------------------------------------------------------------

    const formData = new FormData(e.currentTarget)
    const nama = formData.get('nama') as string
    const nohp = formData.get('nohp') as string
    const ukuran = formData.get('ukuran') as string
    const waktuAmbil = formData.get('waktu_ambil') as string
    const metodeBayar = formData.get('metode_bayar') as "cash" | "qris"
    const catatan = formData.get('catatan') as string

    let finalNotes = catatan
    const pQty = Number(qtyPensil) || 0
    const bQty = Number(qtyBolpoin) || 0

    if (pQty > 0 || bQty > 0) {
      const tambahan = []
      if (pQty > 0) tambahan.push(`Pensil (${pQty} pcs)`)
      if (bQty > 0) tambahan.push(`Bolpoin (${bQty} pcs)`)
      finalNotes += `\n\n(Tambahan Pembelian: ${tambahan.join(', ')})`
    }

    try {
      let publicUrl = ''

      if (file) {
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const fileName = `${Date.now()}-${cleanFileName}`

        const { error: uploadError } = await supabase.storage
          .from('print-files')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('print-files')
          .getPublicUrl(fileName)

        publicUrl = urlData.publicUrl
      }

      const { error: insertError } = await supabase
        .from('orders')
        .insert({
          customer_name: nama,
          phone_number: nohp,
          paper_size: ukuran,
          print_qty: Number(qty) || 0,
          pickup_time: new Date(waktuAmbil).toISOString(),
          pickup_location: 'Toko Utama',
          payment_method: metodeBayar,
          file_url: publicUrl,
          notes: finalNotes,
          is_color: isColor,
          total_price: estimatedPrice,
        })

      if (insertError) throw insertError

      setCustomerName(nama)
      setSelectedMethod(metodeBayar)
      setOrderSuccess(true)

    } catch (error: any) {
      console.error('Error:', error)
      setMessage(`❌ Terjadi kesalahan: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // TAMPILAN SUKSES
  if (orderSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto bg-white p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 text-center"
      >
        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold mb-3 text-zinc-900 tracking-tight">Order Diterima!</h2>
        <p className="text-zinc-500 mb-8">Data pesananmu sudah aman di sistem kami.</p>

        {selectedMethod === 'qris' ? (
          <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 mb-8">
            <h3 className="font-bold text-lg mb-3 text-zinc-800">Scan QRIS</h3>

            <div className="w-64 sm:w-72 mx-auto mb-5 bg-white border border-zinc-200 rounded-2xl flex items-center justify-center shadow-sm overflow-hidden p-4">
              <Image
                src="/qris.jpeg"
                alt="QRIS Pembayaran"
                width={400}
                height={550}
                className="w-full h-auto object-contain"
                priority
              />
            </div>

            <p className="text-sm text-zinc-500">Total Pembayaran: <br /><span className="text-2xl font-bold text-zinc-900">Rp {estimatedPrice.toLocaleString('id-ID')}</span></p>
          </div>
        ) : (
          <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 mb-8">
            <p className="font-bold text-lg text-zinc-800 mb-2">Pembayaran Tunai</p>
            <p className="text-zinc-600">Siapkan uang tunai sebesar <br /><span className="text-2xl font-bold text-zinc-900">Rp {estimatedPrice.toLocaleString('id-ID')}</span></p>
          </div>
        )}

        <a
          href={`https://wa.me/6281556893252?text=${encodeURIComponent(`Halo Admin PRINT GO! 👋\n\nSaya sudah order atas nama: *${customerName}*\nTotal Biaya: Rp ${estimatedPrice.toLocaleString('id-ID')}\nFile: Sudah diupload di web.\n\nMohon segera diproses ya. Terima kasih!`)}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-zinc-900 text-white font-semibold py-4 px-4 rounded-full mb-3 hover:bg-zinc-800 transition shadow-md"
        >
          Konfirmasi via WhatsApp
        </a>

        <button
          onClick={() => window.location.reload()}
          className="block w-full bg-white text-zinc-600 font-semibold py-4 px-4 rounded-full border border-zinc-200 hover:bg-zinc-50 transition"
        >
          Buat Order Baru
        </button>
      </motion.div>
    )
  }

  // TAMPILAN FORM ORDER
  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-zinc-100 space-y-6"
    >
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Mulai Cetak</h2>
        <p className="text-zinc-500 mt-2">Lengkapi detail dokumen Anda di bawah ini.</p>
      </div>

      {isStoreClosed && (
        <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl text-zinc-600 text-sm flex gap-4 items-start">
          <span className="text-xl">🌙</span>
          <div>
            <p className="font-bold text-zinc-900">Toko Sedang Istirahat</p>
            <p className="mt-1">Jam operasional 08:00 - 21:00. Orderan akan diproses besok pagi!</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-2">Nama Lengkap</label>
          <input name="nama" type="text" required className="w-full border border-zinc-200 p-3.5 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all bg-zinc-50 focus:bg-white" placeholder="Budi Santoso" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-2">No. WhatsApp</label>
          <input name="nohp" type="tel" required className="w-full border border-zinc-200 p-3.5 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all bg-zinc-50 focus:bg-white" placeholder="0812xxxxxxxx" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-2">Upload Dokumen (Max 10MB)</label>
        <div className="border-2 border-dashed border-zinc-200 rounded-2xl p-6 text-center hover:bg-zinc-50 transition-colors">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.png"
            onChange={handleFileChange}
            className="w-full text-sm text-zinc-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-900 file:text-white hover:file:bg-zinc-800 cursor-pointer"
          />
        </div>
        <p className="text-xs text-zinc-400 mt-2 ml-2">*Format: PDF, Word, JPG, PNG.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-2">Ukuran Kertas</label>
          <select name="ukuran" className="w-full border border-zinc-200 p-3.5 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-none transition-all bg-zinc-50 focus:bg-white appearance-none cursor-pointer">
            <option value="A4">Kertas A4</option>
            <option value="F4">Kertas F4</option>
            <option value="A3">Kertas A3</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-2">Jumlah Lembar Cetak</label>
          {/* UBAH DI SINI: Atribut min jadi "1" */}
          <input
            name="jumlah" type="number" min="1" value={qty}
            onChange={(e) => setQty(e.target.value === '' ? '' : parseInt(e.target.value))}
            required
            className="w-full border border-zinc-200 p-3.5 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-none transition-all bg-zinc-50 focus:bg-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-3">Jenis Cetak</label>
        <div className="grid grid-cols-2 gap-4">
          <label className={`border p-4 rounded-xl cursor-pointer text-center transition-all duration-200 ${!isColor ? 'bg-zinc-900 border-zinc-900 text-white shadow-md transform scale-[1.02]' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}>
            <input type="radio" name="warna" className="hidden" checked={!isColor} onChange={() => setIsColor(false)} />
            <span className="font-bold block text-base mb-1">Hitam Putih</span>
            <span className={`text-xs ${!isColor ? 'text-zinc-300' : 'text-zinc-400'}`}>Rp 1.000 / lbr</span>
          </label>
          <label className={`border p-4 rounded-xl cursor-pointer text-center transition-all duration-200 ${isColor ? 'bg-zinc-900 border-zinc-900 text-white shadow-md transform scale-[1.02]' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}>
            <input type="radio" name="warna" className="hidden" checked={isColor} onChange={() => setIsColor(true)} />
            <span className="font-bold block text-base mb-1">Berwarna</span>
            <span className={`text-xs ${isColor ? 'text-zinc-300' : 'text-zinc-400'}`}>Rp 1.500 / lbr</span>
          </label>
        </div>
      </div>

      {/* SECTION TAMBAHAN ALAT TULIS */}
      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-3">Tambahan Alat Tulis (Opsional)</label>
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-zinc-200 p-3 md:p-4 rounded-xl bg-white flex justify-between items-center transition-all hover:border-zinc-300">
            <div>
              <span className="font-bold block text-sm text-zinc-800">Pensil</span>
              <span className="text-xs text-zinc-500">Rp 1.500 / pcs</span>
            </div>
            <input
              type="number" min="0" value={qtyPensil}
              onChange={(e) => setQtyPensil(e.target.value === '' ? '' : parseInt(e.target.value))}
              className="w-16 border border-zinc-200 p-2 rounded-lg text-center outline-none focus:ring-2 focus:ring-zinc-900 bg-zinc-50"
              placeholder="0"
            />
          </div>
          <div className="border border-zinc-200 p-3 md:p-4 rounded-xl bg-white flex justify-between items-center transition-all hover:border-zinc-300">
            <div>
              <span className="font-bold block text-sm text-zinc-800">Bolpoin</span>
              <span className="text-xs text-zinc-500">Rp 2.000 / pcs</span>
            </div>
            <input
              type="number" min="0" value={qtyBolpoin}
              onChange={(e) => setQtyBolpoin(e.target.value === '' ? '' : parseInt(e.target.value))}
              className="w-16 border border-zinc-200 p-2 rounded-lg text-center outline-none focus:ring-2 focus:ring-zinc-900 bg-zinc-50"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-2">Waktu Ambil</label>
          <input name="waktu_ambil" type="datetime-local" required className="w-full border border-zinc-200 p-3.5 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-none transition-all bg-zinc-50 focus:bg-white" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-2">Pembayaran</label>
          <select name="metode_bayar" className="w-full border border-zinc-200 p-3.5 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-none transition-all bg-zinc-50 focus:bg-white appearance-none cursor-pointer">
            <option value="cash">Bayar Tunai di Tempat</option>
            <option value="qris">QRIS (Scan di Toko)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-zinc-700 mb-2">Catatan Tambahan (Opsional)</label>
        <textarea
          name="catatan" rows={3}
          className="w-full border border-zinc-200 p-4 rounded-xl focus:ring-2 focus:ring-zinc-900 outline-none transition-all bg-zinc-50 focus:bg-white resize-none"
          placeholder="Contoh: Tolong dijilid spiral, Print halaman 1-10 saja..."
        ></textarea>
      </div>

      <div className="bg-zinc-50 p-6 rounded-2xl flex justify-between items-center border border-zinc-200 mt-8">
        <span className="text-zinc-500 font-medium">Estimasi Biaya</span>
        <span className="text-2xl font-extrabold text-zinc-900">
          Rp {estimatedPrice.toLocaleString('id-ID')}
        </span>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-zinc-900 text-white py-4 rounded-full font-bold text-lg hover:bg-zinc-800 disabled:bg-zinc-300 disabled:text-zinc-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl mt-6"
      >
        {loading ? 'Memproses Pesanan...' : 'Kirim Pesanan Sekarang'}
      </button>

      {message && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center border border-red-100 font-medium">
          {message}
        </div>
      )}
    </motion.form>
  )
}