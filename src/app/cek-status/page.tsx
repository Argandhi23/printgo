"use client"

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { Database } from '@/types/supabase'
import { motion } from 'framer-motion'

type Order = Database['public']['Tables']['orders']['Row']

export default function CekStatusPage() {
  const supabase = createClient()
  const [phone, setPhone] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone) return

    setLoading(true)
    setSearched(true)
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('phone_number', phone)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
    } else {
      setOrders(data || [])
    }
    setLoading(false)
  }

  return (
    // Tambah pt-32 agar tidak menabrak navbar
    <div className="min-h-screen bg-white pt-32 pb-20 px-6 font-sans text-zinc-900">
      <div className="max-w-2xl mx-auto">
        
        {/* Header & Form Pencarian */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-extrabold text-zinc-900 mb-4 tracking-tight">Lacak Pesanan</h1>
          <p className="text-zinc-500 mb-8 max-w-md mx-auto">Masukkan nomor WhatsApp yang Anda gunakan saat memesan untuk melihat status dokumen.</p>
          
          <form onSubmit={handleSearch} className="max-w-md mx-auto relative flex items-center">
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contoh: 081234567890"
              className="w-full border border-zinc-200 py-4 pl-6 pr-32 rounded-full focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all bg-zinc-50 focus:bg-white text-zinc-900 font-medium"
              required
            />
            <button 
              type="submit" 
              disabled={loading}
              className="absolute right-2 bg-zinc-900 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-zinc-800 disabled:bg-zinc-300 disabled:text-zinc-500 transition-all"
            >
              {loading ? 'Mencari...' : 'Lacak'}
            </button>
          </form>
        </motion.div>

        {/* Hasil Pencarian */}
        {searched && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {orders.length === 0 ? (
              <div className="text-center text-zinc-400 py-12 bg-zinc-50 rounded-[2rem] border border-zinc-100">
                <svg className="w-12 h-12 mx-auto mb-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium text-lg">Tidak ada pesanan ditemukan</p>
                <p className="text-sm mt-1">Pastikan nomor WhatsApp sudah benar.</p>
              </div>
            ) : (
              orders.map((order, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={order.id} 
                  className="bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-zinc-100 hover:border-zinc-200 transition-all flex flex-col md:flex-row md:justify-between md:items-center gap-6"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-zinc-400 bg-zinc-100 px-3 py-1 rounded-full">
                        {new Date(order.created_at || '').toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                      {/* Badge Status yang lebih elegan */}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                        order.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        order.status === 'processing' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                        order.status === 'cancelled' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                        'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {order.status === 'pending' ? 'Menunggu' : order.status}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-zinc-900 mb-1">
                      Kertas {order.paper_size} <span className="text-zinc-400 font-medium">({order.print_qty} lembar)</span>
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 mt-3">
                      <p className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${order.is_color ? 'bg-gradient-to-r from-violet-500 to-cyan-500' : 'bg-zinc-800'}`}></span>
                        {order.is_color ? 'Cetak Berwarna' : 'Hitam Putih'}
                      </p>
                      <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
                      <p className="font-semibold text-zinc-900">Rp {(order.total_price || 0).toLocaleString('id-ID')}</p>
                    </div>

                    {order.notes && (
                      <div className="mt-4 bg-zinc-50 p-3 rounded-xl text-sm text-zinc-600 border border-zinc-100 flex items-start gap-2">
                        <span className="text-zinc-400 text-base">"</span>
                        <p className="italic">{order.notes}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}