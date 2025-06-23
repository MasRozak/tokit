'use client'
import ProductForm from '../../../components/ProductForm'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {jwtDecode} from 'jwt-decode'

export default function AddProductPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const storageToken = sessionStorage.getItem('jwtToken')
      setToken(storageToken)
      
      if (!storageToken) {
        router.push('/login')
        return
      }

      try {
        const decodedToken = jwtDecode<{ role: string }>(storageToken)
        if (decodedToken.role !== 'admin') {
          router.push('/login')
          return
        }
      } catch (err) {
        console.error('Token validation error:', err)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    )
  }

  return <ProductForm mode="create" token={token || ''} />
}
