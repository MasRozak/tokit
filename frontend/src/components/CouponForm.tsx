
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Coupon } from '@/types/coupon'

interface CouponFormProps {
  coupon?: Coupon
  mode: 'create' | 'edit'
}

export default function CouponForm({ coupon, mode }: CouponFormProps) {
  const router = useRouter()

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''


    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    const formatted = `${year}-${month}-${day}T${hours}:${minutes}`
    console.log('Date formatting:', { input: dateString, output: formatted })
    return formatted
  }
  const [formData, setFormData] = useState({
    kode_kupon: coupon?.kode_kupon || '',
    expired_at: formatDateForInput(coupon?.expired_at || ''),
    status: coupon?.status || 'active',
    diskon: coupon?.diskon?.toString() || ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
    useEffect(() => {
    if (coupon) {
      console.log('Coupon data received:', coupon)
      setFormData({
        kode_kupon: coupon.kode_kupon,
        expired_at: formatDateForInput(coupon.expired_at),
        status: coupon.status,
        diskon: coupon.diskon?.toString() || ''
      })
    }
  }, [coupon])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {      setIsSubmitting(true)

      await new Promise(resolve => setTimeout(resolve, 1000))

      const couponData: Coupon = {
        id_kupon: coupon?.id_kupon || '',        kode_kupon: formData.kode_kupon,
        expired_at: formData.expired_at,
        status: formData.status as 'active' | 'expired',
        diskon: formData.diskon ? parseFloat(formData.diskon) : 0
      }

      let response
      const token = sessionStorage.getItem('jwtToken')

      if (mode === 'create') {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/coupon`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(couponData)
        })
      } else if (mode === 'edit' && coupon) {
        couponData.id_kupon = coupon.id_kupon

        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/coupon/${couponData.id_kupon}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(couponData)
        })
      }      if (!response?.ok) {
        throw new Error(`Gagal ${mode === 'create' ? 'menambahkan' : 'memperbarui'} kupon`)
      }

      if (mode === 'create') {
        router.push('/admin')
      } else {
        router.push('/admin/coupon/list')
      }
    } catch (catchError) {
      console.error('Error submitting coupon:', catchError)
      alert(`Terjadi kesalahan saat ${mode === 'create' ? 'menambahkan' : 'memperbarui'} kupon`)
    } finally {
      setIsSubmitting(false)
    }
  }
  const isCreateMode = mode === 'create'
  const title = isCreateMode ? 'Tambah Kupon Baru' : 'Edit Kupon'
  const submitText = isCreateMode ? 'Simpan Kupon' : 'Perbarui Kupon'
  const submittingText = isCreateMode ? 'Menyimpan...' : 'Memperbarui...'
  const cancelHref = isCreateMode ? '/admin' : '/admin/coupon/list'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold mb-8">{title}</h1>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kode Kupon *
              </label>
              <input
                type="text"
                name="kode_kupon"
                value={formData.kode_kupon}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan kode kupon (contoh: DISKON20)"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Kadaluwarsa *
              </label>              <input
                type="datetime-local"
                name="expired_at"
                value={formData.expired_at}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Aktif</option>
                <option value="expired">Kadaluwarsa</option>
                <option value="used">Terpakai</option>
              </select>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diskon (%) *
              </label>
              <input
                type="number"
                name="diskon"
                value={formData.diskon}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
                max="100"
                step="0.01"
                required
              />
              <p className="text-sm text-gray-500 mt-1">Masukkan nilai diskon dalam persen (0-100)</p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? submittingText : submitText}
              </button>              <Link
                href={cancelHref}
                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors inline-block text-center"
              >
                Batal
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
