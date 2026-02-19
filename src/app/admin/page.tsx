"use client"

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { Database } from '@/types/supabase'
import { motion } from 'framer-motion'

type Order = Database['public']['Tables']['orders']['Row']

export default function AdminPage() {
  const supabase = createClient()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [cleaning, setCleaning] = useState(false)

  // --- FUNGSI AMBIL DATA ---
  const fetchOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) console.error('Error fetching orders:', error)
    else setOrders(data || [])
    
    setLoading(false)
  }

  // --- FUNGSI UPDATE STATUS ---
  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus } as any)
      .eq('id', id)

    if (error) alert('Gagal update status')
    else fetchOrders()
  }

  // --- FUNGSI BERSIH-BERSIH (AUTO DELETE > 3 HARI) ---
  const handleCleanup = async () => {
    const confirmDelete = confirm('Apakah kamu yakin ingin menghapus semua order dan file yang lebih lama dari 3 hari? Data yang dihapus tidak bisa kembali.')
    if (!confirmDelete) return

    setCleaning(true)

    const limitDate = new Date()
    limitDate.setDate(limitDate.getDate() - 3)
    const isoLimitDate = limitDate.toISOString()

    try {
      const { data: oldOrders, error: fetchError } = await supabase
        .from('orders')
        .select('id, file_url')
        .lt('created_at', isoLimitDate)

      if (fetchError) throw fetchError
      if (!oldOrders || oldOrders.length === 0) {
        alert('Tidak ada file lama yang perlu dihapus.')
        setCleaning(false)
        return
      }

      const filesToDelete = oldOrders.map(order => {
        const parts = order.file_url.split('/')
        return parts[parts.length - 1]
      })

      if (filesToDelete.length > 0) {
        const { error: storageError } = await supabase
          .storage
          .from('print-files')
          .remove(filesToDelete)
        
        if (storageError) throw storageError
      }

      const idsToDelete = oldOrders.map(order => order.id)
      const { error: dbError } = await supabase
        .from('orders')
        .delete()
        .in('id', idsToDelete)

      if (dbError) throw dbError

      alert(`Sukses! ${idsToDelete.length} data lama dan filenya telah dihapus. Storage kamu lega lagi! 🧹`)
      fetchOrders() 

    } catch (error: any) {
      console.error(error)
      alert('Gagal membersihkan data: ' + error.message)
    } finally {
      setCleaning(false)
    }
  }

  // --- REALTIME SUBSCRIPTION ---
  useEffect(() => {
    fetchOrders()

    const channel = supabase
      .channel('realtime orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setOrders((prev) => [payload.new as Order, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setOrders((prev) => prev.map((o) => o.id === (payload.new as Order).id ? (payload.new as Order) : o))
        } else if (payload.eventType === 'DELETE') {
           setOrders((prev) => prev.filter((o) => o.id !== (payload.old as any).id))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    // Tambah pt-32 agar tidak nabrak navbar dan bg-white
    <div className="min-h-screen bg-white py-12 px-6 font-sans text-zinc-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6"
        >
          <div>
            <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Dashboard Admin</h1>
            <p className="text-zinc-500 mt-2 font-medium">Kelola pesanan masuk dan bersihkan penyimpanan.</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
                onClick={fetchOrders} 
                className="inline-flex items-center gap-2 bg-white border border-zinc-200 text-zinc-700 px-6 py-2.5 rounded-full hover:bg-zinc-50 transition-all shadow-sm font-semibold text-sm"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Refresh
            </button>
            
            <button 
                onClick={handleCleanup} 
                disabled={cleaning}
                className="inline-flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-600 px-6 py-2.5 rounded-full hover:bg-rose-100 hover:border-rose-200 transition-all shadow-sm font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                {cleaning ? 'Sedang Membersihkan...' : 'Hapus Data Lama (> 3 Hari)'}
            </button>
          </div>
        </motion.div>

        {/* Tabel Data */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] border border-zinc-100 overflow-hidden"
        >
          {loading ? (
            <div className="text-center py-20 text-zinc-400 font-medium flex flex-col items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-zinc-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Memuat data order...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full leading-normal">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100 text-zinc-400 uppercase text-[10px] font-bold tracking-widest text-left">
                    <th className="py-4 px-6 whitespace-nowrap">Waktu & Klien</th>
                    <th className="py-4 px-6 whitespace-nowrap">Detail Dokumen</th>
                    <th className="py-4 px-6 text-center whitespace-nowrap">Tautan File</th>
                    <th className="py-4 px-6 text-center whitespace-nowrap">Pembayaran</th>
                    <th className="py-4 px-6 text-center whitespace-nowrap">Status</th>
                    <th className="py-4 px-6 text-center whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                      
                      {/* Klien */}
                      <td className="py-5 px-6 whitespace-nowrap">
                        <div className="font-bold text-zinc-900 mb-0.5">{order.customer_name}</div>
                        <div className="text-xs text-zinc-400 mb-2 font-medium">
                          {new Date(order.created_at || '').toLocaleString('id-ID', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                        <a 
                          href={`https://wa.me/${order.phone_number.replace(/^0/, '62')}`} 
                          target="_blank"
                          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-full hover:bg-emerald-100 transition-colors"
                        >
                          WhatsApp
                        </a>
                      </td>

                      {/* Detail Print */}
                      <td className="py-5 px-6 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-bold text-zinc-900">{order.paper_size}</span>
                          <span className="text-zinc-300">•</span>
                          <span className="text-zinc-600 font-medium">{order.print_qty} Lbr</span>
                          {order.is_color ? (
                            <span className="bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold tracking-wider ml-1">COLOR</span>
                          ) : (
                            <span className="bg-zinc-100 text-zinc-500 border border-zinc-200 text-[9px] px-2 py-0.5 rounded-full font-bold tracking-wider ml-1">B/W</span>
                          )}
                        </div>
                        <div className="font-extrabold text-zinc-900 mb-2">
                          Rp {(order.total_price || 0).toLocaleString('id-ID')}
                        </div>
                        {order.notes && (
                          <div className="text-xs bg-zinc-50 text-zinc-500 p-2.5 rounded-xl border border-zinc-100 italic">
                            "{order.notes}"
                          </div>
                        )}
                      </td>

                      {/* Tautan File */}
                      <td className="py-5 px-6 text-center">
                        <a 
                          href={order.file_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-block bg-zinc-900 text-white py-1.5 px-4 rounded-full text-xs font-semibold hover:bg-zinc-800 transition-colors shadow-sm"
                        >
                          Download
                        </a>
                      </td>

                      {/* Metode */}
                      <td className="py-5 px-6 text-center">
                         <span className={`py-1.5 px-3 rounded-full text-[10px] font-bold tracking-widest uppercase border ${
                          order.payment_method === 'qris' 
                            ? 'bg-indigo-50 text-indigo-600 border-indigo-100' 
                            : 'bg-zinc-50 text-zinc-600 border-zinc-200'
                        }`}>
                          {order.payment_method}
                        </span>
                      </td>

                      {/* Status Terkini */}
                      <td className="py-5 px-6 text-center">
                        <span className={`py-1.5 px-3 rounded-full text-[10px] font-bold tracking-widest uppercase border ${
                          order.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          order.status === 'processing' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                          order.status === 'cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {order.status === 'pending' ? 'MENUNGGU' : order.status}
                        </span>
                      </td>

                      {/* Aksi Ubah Status */}
                      <td className="py-5 px-6 text-center">
                        <select 
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className="border border-zinc-200 rounded-xl py-2 px-3 text-xs bg-white text-zinc-700 font-medium outline-none focus:ring-2 focus:ring-zinc-900 cursor-pointer appearance-none text-center shadow-sm"
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="processing">⚙️ Proses</option>
                          <option value="completed">✅ Selesai</option>
                          <option value="cancelled">❌ Batal</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {orders.length === 0 && (
                <div className="py-24 text-center flex flex-col items-center justify-center text-zinc-400">
                  <svg className="w-16 h-16 mb-4 text-zinc-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="font-medium text-lg text-zinc-500">Belum ada pesanan masuk.</p>
                  <p className="text-sm mt-1">Data pesanan akan muncul otomatis di sini.</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}