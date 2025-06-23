'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import RequireAuth from '@/components/RequireAuth'

interface OrderItem {
  id_detail_order: string
  product_id: string
  product_name: string
  price: number
  quantity: number
  subtotal: number
  image?: string
  description?: string
  rating?: number
  stock?: number
}

interface OrderDetails {
  id_order: string
  tracking_number?: string
  user_id: string
  total: number
  status_pembayaran: string
  status_pengiriman: string
  metode_pembayaran: string
  datetime: string
  coupon?: {
    kode_kupon: string
    diskon: number
  }
  shipping?: {
    recipient_name: string
    street_address: string
    city: string
    postal_code: string
    phone: string
    country: string
  }
  items: OrderItem[]
}

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('jwtToken')
    }
    return null
  }

  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true)
      setError(null)
      
      const resolvedParams = await params
      const orderId = resolvedParams.id
      
      const token = getAuthToken()
      if (!token) {
        setError('Please login to view order details')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Please login again - your session may have expired')
          }
          if (response.status === 404) {
            throw new Error('Order not found or access denied')
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('Order details from backend:', data)
        
        if (data.success) {
          setOrder(data.order)
        } else {
          throw new Error(data.message || 'Failed to load order details')
        }
        
      } catch (error) {
        console.error('Error loading order:', error)
        if (error instanceof Error) {
          setError(error.message)
        } else {
          setError('Failed to load order details')
        }
      } finally {
        setLoading(false)
      }
    }
    
    loadOrder()
  }, [params])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Error Loading Order</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link
            href="/order"
            className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Order not found</h2>
          <p className="text-gray-600 mb-8">The order you&apos;re looking for doesn&apos;t exist</p>
          <Link
            href="/order"
            className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getShippingStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-purple-100 text-purple-800'
      case 'cancelled': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  const formatCurrency = (amount: number) => {
    return `Rp. ${(amount || 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  const subtotal = order.items?.reduce((sum, item) => sum + (item.subtotal || 0), 0) || 0
  const discount = order.coupon?.diskon || 0
  const shipping = 0 
  const total = order.total || 0
  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50 py-8">        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <nav className="mb-4">
              <Link href="/order" className="text-blue-500 hover:text-blue-600 font-medium">
              ← Back to Orders
            </Link>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
              <p className="text-gray-600">Order #{order.id_order}</p>
            </div>
            <div className="mt-4 sm:mt-0 space-y-2">
              <div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.status_pembayaran)}`}>
                  Payment: {order.status_pembayaran ? order.status_pembayaran.charAt(0).toUpperCase() + order.status_pembayaran.slice(1) : 'Unknown'}
                </span>
              </div>
              <div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getShippingStatusColor(order.status_pengiriman)}`}>
                  Shipping: {order.status_pengiriman ? order.status_pengiriman.charAt(0).toUpperCase() + order.status_pengiriman.slice(1) : 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Items Ordered</h2>
              <div className="space-y-6">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item) => (                    <div key={item.id_detail_order} className="flex items-start space-x-6 p-6 border border-gray-100 rounded-lg bg-gray-50">
                      <div className="flex-shrink-0">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'}
                          alt={item.product_name}
                          className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'
                          }}
                        />                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 pr-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.product_name}</h3>
                            {item.description && (
                              <p className="text-sm text-gray-600 mb-3 leading-relaxed overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{item.description}</p>
                            )}
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Quantity: <span className="font-medium text-gray-900">{item.quantity}</span></span>
                              <span>•</span>
                              <span>Price: <span className="font-medium text-gray-900">{formatCurrency(item.price)}</span> each</span>
                            </div>                          </div>
                          
                          <div className="text-right flex-shrink-0">
                            <p className="text-lg font-semibold text-gray-900 mb-1">
                              {formatCurrency(item.subtotal)}
                            </p>
                            <p className="text-sm text-gray-500">Subtotal</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No items found in this order</p>
                  </div>
                )}
              </div>            </div>

            {order.shipping && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
                <div className="text-gray-700 space-y-1">
                  <p className="font-medium text-lg">{order.shipping.recipient_name}</p>
                  <p className="text-gray-600">{order.shipping.street_address}</p>
                  <p className="text-gray-600">
                    {order.shipping.city}, {order.shipping.postal_code}
                  </p>
                  <p className="text-gray-600">{order.shipping.country}</p>
                  {order.shipping.phone && (
                    <p className="text-gray-600 mt-3">
                      <span className="font-medium">Phone:</span> {order.shipping.phone}
                    </p>
                  )}
                </div>
              </div>            )}

            {order.tracking_number && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
                      <p className="font-mono text-lg font-medium text-gray-900">{order.tracking_number}</p>
                    </div>
                  </div>
                </div>
              </div>            )}

            {order.coupon && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Coupon Applied</h2>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 mb-1">Coupon Code</p>
                      <p className="font-mono text-lg font-medium text-green-900">{order.coupon.kode_kupon}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-600 mb-1">Discount</p>
                      <p className="text-lg font-semibold text-green-700">{(order.coupon.diskon)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            )}          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Order Date:</span>
                  <span className="font-medium">{new Date(order.datetime).toLocaleDateString()}</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Payment Method:</span>
                  <span className="font-medium uppercase">{order.metode_pembayaran}</span>
                </div>
                
                <hr className="my-4" />
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span className="font-medium">{(discount)}%</span>
                    </div>
                  )}
                  
                  <hr className="my-3" />
                  
                  <div className="flex justify-between font-semibold text-xl">
                    <span>Total:</span>
                    <span className="text-blue-600">{formatCurrency(total)}</span>
                  </div>
                </div>              </div>

              <div className="mt-8 space-y-3">
                {order.status_pengiriman === 'delivered' && (
                  <div className="space-y-2">
                  {order.items.map((item) => (
                    <Link
                    key={item.product_id}
                    href={`/product/${item.product_id}`}
                    className="w-full px-4 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium block text-center"
                    >
                    Review {item.product_name}
                    </Link>
                  ))}
                  </div>
                )}
                
                {(order.status_pembayaran === 'pending' || order.status_pengiriman === 'processing') && (
                  <button className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium">
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </RequireAuth>
  )
}
