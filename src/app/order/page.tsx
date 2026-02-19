import OrderForm from '@/components/OrderForm'

export const metadata = {
  title: 'Order Print | PRINT GO!',
  description: 'Pesan cetak dokumen Anda dengan mudah.',
}

export default function OrderPage() {
  return (
    <main className="bg-white min-h-screen">
      <OrderForm />
    </main>
  )
}