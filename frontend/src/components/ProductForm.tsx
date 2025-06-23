
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Product } from '@/types/product'

interface ProductFormProps {
  product?: Product
  mode: 'create' | 'edit'
  token?: string
}

export default function ProductForm({ product, mode, token }: ProductFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: product?.nama_produk || '',
    description: product?.description || '',
    image: product?.image || '',
    price: product?.harga.toString() || '',
    kategori: product?.kategori || '',
    stock: product?.stock?.toString() || ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.nama_produk,
        description: product.description,
        image: product.image,
        price: product.harga?.toString() || '',
        kategori: product.kategori || '',
        stock: product.stock?.toString()|| ''
      })
    }
  }, [product])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
    setIsSubmitting(true)

    await new Promise(resolve => setTimeout(resolve, 1000))

    const productData: Product = {
      id_produk: product?.id_produk || '',
      nama_produk: formData.name,
      description: formData.description,
      avg_rating: product?.avg_rating || 0,
      harga: formData.price ? parseFloat(formData.price) : 0,
      total_review: product?.total_review || 0,
      kategori: product?.kategori || formData.kategori,
      image: formData.image,
      stock: parseInt(formData.stock, 10)
    }

    let response

    if (mode === 'create') {
      console.log(token)
      response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/product`,{
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      })
    } else if (mode === 'edit' && product) {
      productData.id_produk = product.id_produk

      response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/product/${productData.id_produk}`,{
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      })
    }

    if (!response?.ok) {
      throw new Error(`Gagal ${mode === 'create' ? 'menambahkan' : 'memperbarui'} produk`)
    }

    router.push('/admin')
  } catch (catchError) {
    console.error('Error submitting product:', catchError)
    alert(`Terjadi kesalahan saat ${mode === 'create' ? 'menambahkan' : 'memperbarui'} produk`)
  } finally {
    setIsSubmitting(false)
  }
  }

  const isCreateMode = mode === 'create'
  const title = isCreateMode ? 'Tambah Produk Baru' : 'Edit Produk'
  const submitText = isCreateMode ? 'Simpan Produk' : 'Perbarui Produk'
  const submittingText = isCreateMode ? 'Menyimpan...' : 'Memperbarui...'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold mb-8">{title}</h1>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Produk *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan nama produk"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Produk *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan deskripsi produk"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori
              </label>
              <select
                name="kategori"
                value={formData.kategori}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Pilih Kategori</option>
                <option value="gaming">Gaming</option>
                <option value="phone">Phone</option>
                <option value="audio">Audio</option>
                <option value="camera">Camera</option>
                <option value="computer">Computer</option>
                <option value="watch">Smart Watch</option>

                </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Gambar *
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
                required
              />
              {formData.image && (
                <div className="mt-2">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-20 h-20 object-contain border rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>
            <div className={`mb-6`}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harga *
                </label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stok *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? submittingText : submitText}
              </button>
              <Link
                href="/admin"
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
