'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CategorySection from "@/components/Category";
import StarRating from "@/components/StarRating";
import { formatImageUrl } from "@/utils/imageUtils";
import Link from "next/link";
import { ShoppingCart, Heart } from "lucide-react";
import toast from "react-hot-toast";

function ProductContent() {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category');  const searchQuery = searchParams.get('search');
    const [products, setProducts] = useState<Array<{
    id: number;
    id_produk?: number;
    name: string;
    price: number;
    image: string;
    description?: string;
    rating?: number;
    reviews?: number;
    avg_rating?: number;
    total_review?: number;
    category?: string;
    quantity?: number;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [addingToWishlist, setAddingToWishlist] = useState<string | null>(null);
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/products`;
      if (selectedCategory) {
        url += `?category=${encodeURIComponent(selectedCategory)}`;
      }

      if (searchQuery) {
        url += `?search=${encodeURIComponent(searchQuery)}`;
      }
      console.log(url);

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Gagal fetch produk');
        const data = await res.json();

        const mapped = Array.isArray(data) ? await Promise.all(          data.map(async (p: { id_produk: number; nama_produk: string; image: string; harga: number; deskripsi?: string; avg_rating?: number; total_review?: number; kategori?: string; total_quantity?: number }) => {
            try {

              const reviewRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/reviews/${p.id_produk}`);
              let real_rating = 0;
              let real_review_count = 0;
                if (reviewRes.ok) {
                const reviewData = await reviewRes.json();

                let reviews = [];                if (reviewData.reviews && reviewData.reviews.length > 0 && reviewData.reviews[0].reviews) {
                  reviews = reviewData.reviews[0].reviews;
                }
                real_review_count = reviews.length;

                if (reviews.length > 0) {
                  const totalRating = reviews.reduce((sum: number, review: { rate?: number }) => sum + (review.rate || 0), 0);
                  real_rating = totalRating / reviews.length;
                }
              }

              return {
                id: p.id_produk,
                name: p.nama_produk,
                price: p.harga,
                image: formatImageUrl(p.image, '/tokit.svg'),
                rating: real_rating,
                reviews: real_review_count,
              };
            } catch (error) {
              console.error(`Error processing product ${p.id_produk}:`, error);
              return {
                id: p.id_produk,
                name: p.nama_produk,
                price: p.harga,
                image: formatImageUrl(p.image, '/tokit.svg'),
                rating: 0,
                reviews: 0,
              };
            }
          })
        ) : [];        setProducts(mapped);
        setLoading(false);
      } catch (err) {
        console.error('Gagal mengambil produk:', err);
        setLoading(false);
      }
    };
      fetchProducts();
  }, [selectedCategory, searchQuery]);

  const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const token = sessionStorage.getItem('jwtToken');
    if (!token) {
      toast.error('Please login to add items to cart');
      return;
    }

    setAddingToCart(productId);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: productId,
          qty: 1
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Product added to cart successfully!');
        console.log('Added to cart:', data);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add product to cart');    } finally {
      setAddingToCart(null);
    }
  };

  const handleAddToWishlist = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const token = sessionStorage.getItem('jwtToken');
    if (!token) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    setAddingToWishlist(productId);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: productId
        })
      });

      if (response.ok) {
        toast.success('Product added to wishlist successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to add product to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add product to wishlist');
    } finally {
      setAddingToWishlist(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <Suspense fallback={<div>Loading categories...</div>}>
        <CategorySection />
      </Suspense>

      <div className="mt-8 sm:mt-12">
        <h3 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
          {selectedCategory ? `Explore Our ${selectedCategory}` : 'All Products'}
        </h3>
        {loading ? (
          <div className="text-center py-8">Loading products...</div>
        ) : error ? (
          <div className="text-center text-blue-500 py-8">{error}</div>
        ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <img src="https://res.cloudinary.com/dlwxkdjek/image/upload/v1750433799/capybara-turu_ledsfn.jpg" alt="Kosong" className="w-48 h-48 object-contain mb-6" />
          <div className="text-center py-8 text-gray-700 font-medium mb-2">Produk Tidak Ditemukan</div>
        </div>
      ) : (          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 py-4">
            {products.map(product => (
              <Link key={product.id_produk || product.id} href={`/product/${product.id_produk || product.id}`} className="group border rounded-lg p-3 sm:p-4 hover:shadow-md transition">
                <div className="relative bg-gray-100 rounded-md flex items-center justify-center h-52 sm:h-64 overflow-hidden mb-3">
                  <img
                    src={product.image || '/shopit.svg'}
                    alt={product.name}
                    className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = '/shopit.svg';
                    }}
                  />
                    {}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 disabled:opacity-50"                      onClick={(e) => handleAddToWishlist((product.id_produk || product.id).toString(), e)}
                      disabled={addingToWishlist === (product.id_produk || product.id).toString()}
                    >
                      {addingToWishlist === (product.id_produk || product.id).toString() ? (
                        <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Heart className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>

                  {}
                  <div className="absolute bottom-0 left-0 w-full opacity-0 translate-y-4 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 px-4 pb-4">
                    <button
                      className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"                      onClick={(e) => handleAddToCart((product.id_produk || product.id).toString(), e)}
                      disabled={addingToCart === (product.id_produk || product.id).toString()}
                    >
                      {addingToCart === (product.id_produk || product.id).toString() ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          Add To Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="mt-3 sm:mt-4">
                  <h4 className="font-medium text-base sm:text-lg text-gray-800 line-clamp-2 mb-2">{product.name}</h4>
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                    <p className="text-blue-500 font-semibold text-base sm:text-lg">Rp. {product.price?.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StarRating rating={product.rating || 0} />
                    <span className="text-gray-600 text-sm font-medium">{(product.rating || 0).toFixed(1)}</span>
                    <span className="text-gray-400 text-sm">({product.reviews || 0} reviews)</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductPage() {
  return (
    <Suspense fallback={<div>Loading products...</div>}>
      <ProductContent />
    </Suspense>
  );
}
