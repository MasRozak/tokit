'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import CouponForm from '../../../../../components/CouponForm'
import { Coupon } from '../../../../../types/coupon'
import { jwtDecode } from 'jwt-decode'

export default function EditCouponPage() {
  const [loading, setLoading] = useState(true)
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams()
  const couponId = params.id as string

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
          return        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/coupon/${couponId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch coupon')
        }

        const data = await response.json()
        setCoupon(data.data || data) // Handle different response formats
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (couponId) {
      checkAuthAndFetch()
    }
  }, [router, couponId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-blue-500">Error: {error}</div>
      </div>
    )
  }

  if (!coupon) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-500">Coupon not found</div>
      </div>
    )
  }

  return <CouponForm mode="edit" coupon={coupon} />
}
