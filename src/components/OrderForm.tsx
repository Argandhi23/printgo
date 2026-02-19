'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'

export default function OrderForm() {
  const supabase = createClient()
  
  // --- STATE MANAGEMENT ---
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [file, setFile] = useState<File | null>(null)
  
  // State untuk kalkulasi harga
  const [qty, setQty] = useState(1)
  const [isColor, setIsColor] = useState(false) // false = BW, true = Color
  const [estimatedPrice, setEstimatedPrice] = useState(0)

  // State setelah sukses order
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState('')
  const [customerName, setCustomerName] = useState('')

  // State untuk jam operasional toko
  const [isStoreClosed, setIsStoreClosed] = useState(false)

  // --- CEK JAM OPERASIONAL & RUMUS HARGA ---
  useEffect(() => {
    // 1. Cek Jam Buka Toko (Misal: 08:00 - 21:00)
    const checkStoreHours = () => {
      const currentHour = new Date().getHours()
      // Jika jam kurang dari 8 pagi ATAU lebih dari/sama dengan 9 malam
      if (currentHour < 8 || currentHour >= 21) {
        setIsStoreClosed(true)
      } else {
        setIsStoreClosed(false)
      }
    }
    checkStoreHours()

    // 2. Hitung Estimasi Harga
    const pricePerSheet = isColor ? 1500 : 1000
    setEstimatedPrice(qty * pricePerSheet)
  }, [qty, isColor])

  // --- FUNGSI VALIDASI FILE ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    
    if (!selectedFile) {
      setFile(null)
      return
    }

    // 1. Validasi Ukuran (Max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('⚠️ File terlalu besar! Maksimal ukuran file adalah 10MB.')
      e.target.value = '' // Reset input
      setFile(null)
      return
    }

    // 2. Validasi Tipe File
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

  // --- FUNGSI SUBMIT ORDER ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const formData = new FormData(e.currentTarget)
    const nama = formData.get('nama') as string
    const nohp = formData.get('nohp') as string
    const ukuran = formData.get('ukuran') as string
    const waktuAmbil = formData.get('waktu_ambil') as string
    const metodeBayar = formData.get('metode_bayar') as "cash" | "qris"
    const catatan = formData.get('catatan') as string

    if (!file) {
      alert('Tolong upload file dokumennya ya!')
      setLoading(false)
      return
    }

    try {
      // 1. Upload File ke Storage
      const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`
      const { error: uploadError } = await supabase.storage
        .from('print-files')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // 2. Ambil URL Publik File
      const { data: urlData } = supabase.storage
        .from('print-files')
        .getPublicUrl(fileName)

      // 3. Simpan Data ke Database
      const { error: insertError } = await supabase
        .from('orders')
        .insert({
          customer_name: nama,
          phone_number: nohp,
          paper_size: ukuran,
          print_qty: qty,
          pickup_time: new Date(waktuAmbil).toISOString(),
          pickup_location: 'Toko Utama',
          payment_method: metodeBayar,
          file_url: urlData.publicUrl,
          notes: catatan,
          is_color: isColor,
          total_price: estimatedPrice,
        })

      if (insertError) throw insertError

      // 4. Set State Sukses
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

  // --- TAMPILAN SUKSES & WA ---
  if (orderSuccess) {
    const messageWa = `Halo Admin PRINT GO! 👋\n\nSaya sudah order atas nama: *${customerName}*\nTotal Biaya: Rp ${estimatedPrice.toLocaleString('id-ID')}\nFile: Sudah diupload di web.\n\nMohon segera diproses ya. Terima kasih!`
    
    // GANTI NOMOR INI DENGAN NOMOR WA ADMIN ASLI (Format 62...)
    const adminPhone = '6285806912873' 
    const waLink = `https://wa.me/${adminPhone}?text=${encodeURIComponent(messageWa)}`

    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center border-t-4 border-green-500">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Order Berhasil Diterima!</h2>
        <p className="text-gray-600 mb-6">Data pesananmu sudah masuk ke sistem admin.</p>

        {/* Info Pembayaran */}
        {selectedMethod === 'qris' ? (
          <div className="bg-gray-100 p-4 rounded border mb-6">
            <h3 className="font-bold text-lg mb-2 text-gray-800">Silahkan Scan QRIS Ini</h3>
            {/* Placeholder QRIS sementara sampai dari toko siap */}
            <div className="w-40 h-40 mx-auto mb-2 bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-500 text-sm">
              [Gambar QRIS Nanti]
            </div>
            <p className="text-sm text-gray-500">Total: <span className="font-bold text-black">Rp {estimatedPrice.toLocaleString('id-ID')}</span></p>
          </div>
        ) : (
          <div className="bg-blue-50 p-4 rounded border mb-6 text-blue-800">
            <p className="font-bold text-lg">💵 Pembayaran Tunai</p>
            <p className="text-sm">Siapkan uang tunai sebesar <span className="font-bold">Rp {estimatedPrice.toLocaleString('id-ID')}</span> saat pengambilan.</p>
          </div>
        )}

        {/* Tombol WhatsApp */}
        <a 
          href={waLink}
          target="_blank"
          rel="noreferrer"
          className="block w-full bg-green-500 text-white font-bold py-3 px-4 rounded mb-3 hover:bg-green-600 transition items-center justify-center gap-2"
        >
          <span>💬 Konfirmasi via WhatsApp</span>
        </a>

        <button 
          onClick={() => window.location.reload()}
          className="block w-full bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded hover:bg-gray-300 transition"
        >
          Buat Order Baru
        </button>
      </div>
    )
  }

  // --- TAMPILAN FORM ORDER ---
  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md space-y-4 text-gray-800 border-t-4 border-blue-600">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Form Order Print</h2>

      {/* --- BANNER TOKO TUTUP --- */}
      {isStoreClosed && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-4 rounded text-orange-800 text-sm shadow-sm">
          <p className="font-bold flex items-center gap-2">
            <span>🌙</span> Toko Sedang Tutup
          </p>
          <p className="mt-1">
            Jam operasional kami <strong>08:00 - 21:00</strong>. Orderan kamu tetap bisa dikirim sekarang, tapi baru akan mulai kami proses <strong>besok pagi</strong> ya!
          </p>
        </div>
      )}

      {/* Nama Lengkap */}
      <div>
        <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
        <input name="nama" type="text" required className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contoh: Budi Santoso" />
      </div>

      {/* No HP */}
      <div>
        <label className="block text-sm font-medium mb-1">No. WhatsApp</label>
        <input name="nohp" type="tel" required className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0812xxxxxxxx" />
      </div>

      {/* Ukuran Kertas */}
      <div>
        <label className="block text-sm font-medium mb-1">Ukuran Kertas</label>
        <select name="ukuran" className="w-full border p-2 rounded bg-white">
          <option value="A4">A4</option>
          <option value="F4">F4</option>
          <option value="A3">A3</option>
        </select>
      </div>

      {/* Pilihan Warna */}
      <div>
        <label className="block text-sm font-medium mb-2">Jenis Cetak</label>
        <div className="grid grid-cols-2 gap-4">
          <label className={`border p-3 rounded cursor-pointer text-center transition ${!isColor ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-gray-50 hover:bg-gray-100'}`}>
            <input type="radio" name="warna" className="hidden" checked={!isColor} onChange={() => setIsColor(false)} />
            <span className="font-bold block text-gray-800">Hitam Putih</span>
            <span className="text-xs text-gray-500">Rp 1.000 / lbr</span>
          </label>
          <label className={`border p-3 rounded cursor-pointer text-center transition ${isColor ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-gray-50 hover:bg-gray-100'}`}>
            <input type="radio" name="warna" className="hidden" checked={isColor} onChange={() => setIsColor(true)} />
            <span className="font-bold block text-gray-800">Berwarna</span>
            <span className="text-xs text-gray-500">Rp 1.500 / lbr</span>
          </label>
        </div>
      </div>

      {/* Jumlah Print */}
      <div>
        <label className="block text-sm font-medium mb-1">Jumlah Lembar</label>
        <input 
          name="jumlah" 
          type="number" 
          min="1" 
          value={qty}
          onChange={(e) => setQty(parseInt(e.target.value) || 1)}
          required 
          className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
        />
      </div>

      {/* Total Harga Live */}
      <div className="bg-gray-100 p-3 rounded flex justify-between items-center font-bold border border-gray-200">
        <span className="text-gray-600">Total Estimasi:</span>
        <span className="text-blue-700 text-xl">
          Rp {estimatedPrice.toLocaleString('id-ID')}
        </span>
      </div>

      {/* Catatan Tambahan */}
      <div>
        <label className="block text-sm font-medium mb-1">Catatan Tambahan (Opsional)</label>
        <textarea 
          name="catatan" 
          rows={3}
          className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Contoh: Tolong dijilid spiral, Print halaman 1-10 saja..."
        ></textarea>
      </div>

      {/* Waktu Ambil */}
      <div>
        <label className="block text-sm font-medium mb-1">Tanggal & Jam Ambil</label>
        <input name="waktu_ambil" type="datetime-local" required className="w-full border p-2 rounded" />
      </div>

      {/* Metode Pembayaran */}
      <div>
        <label className="block text-sm font-medium mb-1">Metode Pembayaran</label>
        <select name="metode_bayar" className="w-full border p-2 rounded bg-white">
          <option value="cash">Bayar Tunai di Tempat</option>
          <option value="qris">QRIS (Scan Nanti di Toko)</option>
        </select>
      </div>

      {/* Upload File */}
      <div>
        <label className="block text-sm font-medium mb-1">Upload Dokumen (Max 10MB)</label>
        <input 
          type="file" 
          accept=".pdf,.doc,.docx,.jpg,.png" 
          onChange={handleFileChange}
          className="w-full border p-2 rounded bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
        />
        <p className="text-xs text-gray-500 mt-1">*Format: PDF, Word, JPG, PNG.</p>
      </div>

      {/* Tombol Submit */}
      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-lg mt-4"
      >
        {loading ? 'Sedang Mengirim...' : `Kirim Order (Rp ${estimatedPrice.toLocaleString('id-ID')})`}
      </button>

      {/* Pesan Error */}
      {message && (
        <div className="p-3 bg-red-100 text-red-700 rounded text-sm text-center border border-red-200">
          {message}
        </div>
      )}
    </form>
  )
}