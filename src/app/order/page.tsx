import OrderForm from '@/components/OrderForm'

export const metadata = {
  title: 'Order Print | PRINT GO!',
  description: 'Pesan cetak dokumen Anda dengan mudah.',
}

export default function OrderPage() {
  return (
    // Container utama diletakkan di sini agar rapi dan tidak dobel
    <main className="min-h-screen bg-white pt-32 pb-20 px-4 sm:px-6 font-sans text-zinc-900">
      <OrderForm />
    </main>
  )
}