'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CouponCard from '../../../../components/CouponCard'
import { Coupon } from '../../../../types/coupon'
import { jwtDecode } from 'jwt-decode'

export default function AdminCouponListPage() {
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const token = sessionStorage.getItem('jwtToken')

      if (!token) {
        router.push('/login')
        return
      }

      try {
        const decodedToken = jwtDecode<{ role: string }>(token)
        if (decodedToken.role !== 'admin') {
          router.push('/login')
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/coupon`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch coupons')
        }

        const data = await response.json()
        setCoupons(data.data || data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    checkAuthAndFetch()
  }, [router])

  const filteredCoupons = coupons.filter(coupon =>
    coupon.kode_kupon.toLowerCase().includes(search.toLowerCase())
  )

  const handleEdit = (id: string) => {
    router.push(`/admin/coupon/edit/${id}`)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      try {
        const token = sessionStorage.getItem('jwtToken')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/coupon/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        })

        if (!response.ok) {
          throw new Error('Failed to delete coupon')
        }

        setCoupons(coupons.filter(coupon => coupon.id_kupon !== id))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while deleting the coupon')
      }
    }
  }

  const handleAddCoupon = () => {
    router.push('/admin/coupon/')
  }

  if (loading) {
    return <div className="p-10 text-center text-gray-600">Loading...</div>
  }

  if (error) {
    return <div className="p-10 text-center text-blue-500">{error}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-8 py-8">
        {}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Kelola Kupon</h1>
          <button
            onClick={handleAddCoupon}
            className="border border-blue-300 px-6 py-2 rounded-md text-blue-700 hover:bg-blue-50 transition-colors font-medium"
          >
            Tambah Kupon Baru
          </button>
        </div>

        {}
        <div className="mb-8 max-w-sm">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari kode kupon..."
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {}
        {filteredCoupons.length === 0 && (
          <div className="text-center text-gray-500 mb-8">
            <p className="text-lg">Tidak ada kupon ditemukan</p>
            <p className="text-sm">Tambahkan kupon baru atau ubah kata kunci pencarian.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16">
          {filteredCoupons.map(coupon => (
            <CouponCard
              key={coupon.id_kupon}
              coupon={coupon}
              onEdit={() => handleEdit(coupon.id_kupon!)}
              onDelete={() => handleDelete(coupon.id_kupon!)}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
