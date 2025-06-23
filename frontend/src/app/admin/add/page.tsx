'use client'
import ProductForm from '../../../components/ProductForm'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {jwtDecode} from 'jwt-decode'

export default function AddProductPage() {
  const router = useRouter()
  const token = sessionStorage.getItem('jwtToken')
  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        router.push('/login')
        return
      }      try {
        const decodedToken = jwtDecode<{ role: string }>(token)
        if (decodedToken.role !== 'admin') {
          router.push('/login')
          return
        }
      } catch (err) {
        console.error('Token validation error:', err)
        router.push('/login')
      }
    }

    checkAuth()
  }, [token, router])

  return <ProductForm mode="create" token={token || ''} />
}
