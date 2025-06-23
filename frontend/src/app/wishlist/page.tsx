'use client';

import { ShoppingCart, Trash2, Heart } from "lucide-react";
import StarRating from "@/components/StarRating";
import RequireAuth from "@/components/RequireAuth";
import React, { useEffect, useState } from "react";
import { formatImageUrl } from "@/utils/imageUtils";
import Link from "next/link";
import toast from "react-hot-toast";

interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  const [errorWishlist, setErrorWishlist] = useState<string | null>(null);
  const [lastView, setLastView] = useState<Product[]>([]);
  const [loadingLastView, setLoadingLastView] = useState(true);
  const [errorLastView, setErrorLastView] = useState<string | null>(null);
  const [addingToWishlist, setAddingToWishlist] = useState<number | null>(null);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  useEffect(() => {    const userStr = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('jwtToken') || '';
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        console.log('User ID:', userObj.id || userObj.id_user || '');
      } catch {
        console.log('User ID parsing failed');
      }
    }

    if (!token) {
      setErrorWishlist('Token tidak ditemukan.');
      setLoadingWishlist(false);
      
    } else {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/wishlist`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(async data => {

          if (Array.isArray(data.wishlist?.produk) && typeof data.wishlist.produk[0] === 'string') {
            const products = await Promise.all(
              data.wishlist.produk.map(async (id: string) => {
                try {
                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/products/${id}`);
                  if (!res.ok) throw new Error('Gagal fetch produk');
                  const p = await res.json();                  return {
                    id: p.id_produk || p.id,
                    name: p.nama_produk || p.name,
                    price: p.harga || p.price,
                    image: formatImageUrl(p.image),
                    rating: p.avg_rating ? parseFloat(p.avg_rating) : (p.rating ? parseFloat(p.rating) : 0),
                    reviews: p.total_review || p.reviews || 0,
                  };
                } catch {
                  return { id, name: `Product ${id}`, price: 0, image: '/shopit.svg', rating: 0, reviews: 0 };
                }              })
            );
            setWishlist(products);
          } else if (Array.isArray(data.wishlist?.produk)) {            const mapped = data.wishlist.produk.map((p: { id_produk?: number; id?: number; nama_produk?: string; name?: string; harga?: number; price?: number; image: string; avg_rating?: string; rating?: string; total_review?: number; reviews?: number }) => ({
              id: p.id_produk || p.id,
              name: p.nama_produk || p.name,
              price: p.harga || p.price,
              image: formatImageUrl(p.image),
              rating: p.avg_rating ? parseFloat(p.avg_rating) : (p.rating ? parseFloat(p.rating) : 0),
              reviews: p.total_review || p.reviews || 0,
            }));
            setWishlist(mapped);
          } else {
            setWishlist([]);
          }
          setLoadingWishlist(false);
        })
        .catch(() => {
          setErrorWishlist('Gagal mengambil wishlist');
          setLoadingWishlist(false);
        });
    }
    if (!token) {
      setErrorLastView('Token tidak ditemukan.');
      setLoadingLastView(false);
    } else {
     fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/lastview`, {
        headers: { 'Authorization': `Bearer ${token}` },
        method: 'GET'
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(async (data) => {
          console.log('Last view response:', data);

          if (data.rows && Array.isArray(data.rows)) {            const productsWithReviews = await Promise.all(
              data.rows.map(async (p: { id_produk?: number; id?: number; nama_produk?: string; name?: string; harga?: number; price?: number; image: string }) => {
                let real_rating = 0;
                let real_review_count = 0;

                try {
                  const reviewRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/reviews/${p.id_produk || p.id}`);
                  if (reviewRes.ok) {
                    const reviewData = await reviewRes.json();
                    console.log(`Last view reviews for ${p.id_produk}:`, reviewData);

                    let reviews = [];
                    if (reviewData.reviews && reviewData.reviews.length > 0 && reviewData.reviews[0].reviews) {
                      reviews = reviewData.reviews[0].reviews;
                    }

                    real_review_count = reviews.length;
                    if (reviews.length > 0) {
                      const totalRating = reviews.reduce((sum: number, review: { rate?: number }) => sum + (review.rate || 0), 0);
                      real_rating = totalRating / reviews.length;
                    }
                  }
                } catch (error) {
                  console.error(`Error fetching reviews for lastview product ${p.id_produk}:`, error);
                }

                return {
                  id: p.id_produk || p.id,
                  name: p.nama_produk || p.name,
                  price: p.harga || p.price,
                  image: formatImageUrl(p.image),
                  rating: real_rating,
                  reviews: real_review_count,
                };
              })
            );

            setLastView(productsWithReviews);
          } else {
            setLastView([]);
          }
          setLoadingLastView(false);
        })
        .catch((error) => {
          console.error('Error fetching last view:', error);
          setErrorLastView("Gagal mengambil last view");
          setLoadingLastView(false);        });
    }
  }, []);

  const handleAddToWishlist = async (productId: number, e: React.MouseEvent) => {
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
          product_id: productId.toString()
        })
      });

      if (response.ok) {
        toast.success('Product added to wishlist successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to add product to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);      toast.error('Failed to add product to wishlist');
    } finally {
      setAddingToWishlist(null);
    }
  };

  return (
    <RequireAuth>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <h2 className="text-lg sm:text-xl font-semibold">Wishlist ({wishlist.length})</h2>
          <button
            className="border px-4 py-2.5 rounded hover:bg-gray-100 active:bg-gray-100 text-sm sm:text-base touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={async () => {
              const token = sessionStorage.getItem('jwtToken');
              if (!token) {
          toast.error('Please login to add items to cart');
          return;
              }

              if (wishlist.length === 0) {
          toast.error('Wishlist is empty');
          return;
              }

              setAddingToCart(-1);

              try {
          const promises = wishlist.map(product =>
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/cart/add`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                product_id: product.id.toString(),
                qty: 1
              })
            })
          );

          const results = await Promise.all(promises);
          const successCount = results.filter(res => res.ok).length;

          if (successCount === wishlist.length) {
            toast.success(`All ${successCount} items added to cart successfully!`);
          } else if (successCount > 0) {
            toast.success(`${successCount} of ${wishlist.length} items added to cart`);
          } else {
            toast.error('Failed to add items to cart');
          }
              } catch (error) {
          console.error('Error adding all to cart:', error);
          toast.error('Failed to add items to cart');
              } finally {
          setAddingToCart(null);
              }
            }}
            disabled={addingToCart === -1 || wishlist.length === 0}
          >
            {addingToCart === -1 ? (
              <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
          Adding to Cart...
              </div>
            ) : (
              'Move All To Bag'
            )}
          </button>
        </div>
        {}
        {loadingWishlist ? (
          <div className="text-center py-7">Loading wishlist...</div>
        ) : errorWishlist ? (
          <div className="text-center text-blue-500 py-8">{errorWishlist}</div>
        ) : wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <img src="https://res.cloudinary.com/dlwxkdjek/image/upload/v1750433799/capybara-turu_ledsfn.jpg" alt="Kosong" className="w-48 h-48 object-contain mb-6" />
            <div className="text-lg text-gray-700 font-medium mb-2">Wishlist mu masih kosong</div>
            <div className="text-gray-500">Ayo Jelajahi dan penuhi wishlist mu</div>
          </div>        ) : (          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
            {wishlist.map((product: Product) => (
              <Link key={product.id} href={`/product/${product.id}`} className="group">
                {}
                <div className="relative bg-gray-100 rounded-lg mb-4 h-48 sm:h-64 flex items-center justify-center overflow-hidden">
                  <img
                    src={product.image || '/shopit.svg'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/shopit.svg';
                    }}
                  />

                  {}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex">
                    <button
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 disabled:opacity-50"
                      onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      const token = sessionStorage.getItem('jwtToken');
                      if (!token) {
                        toast.error('Please login to remove items from wishlist');
                        return;
                      }

                      try {
                        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/wishlist/${product.id}`, {
                        method: 'DELETE',
                        headers: {
                          'Authorization': `Bearer ${token}`
                        }
                        });

                        if (response.ok) {
                        toast.success('Product removed from wishlist');
                        window.location.reload();
                        } else {
                        const errorData = await response.json();
                        toast.error(errorData.message || 'Failed to remove product from wishlist');
                        }
                      } catch (error) {
                        console.error('Error removing from wishlist:', error);
                        toast.error('Failed to remove product from wishlist');
                      }
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-gray-600" />
                    </button>
                    </div>

                  {}
                  <button
                    className="absolute top-2 right-2 bg-white/90 rounded-full w-7 h-7 flex items-center justify-center text-black active:bg-gray-200 transition-colors z-10 sm:hidden touch-manipulation"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {}
                  <div className="absolute bottom-0 left-0 w-full opacity-0 translate-y-4 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 px-4 pb-4 hidden sm:block">
                    <button
                      className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                      }}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add To Cart
                    </button>
                  </div>
                </div>

                {}
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900 line-clamp-2">{product.name}</h3>

                  {}
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500 font-medium">Rp. {product.price?.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    {product.originalPrice && (
                      <span className="text-gray-400 line-through">Rp. {product.originalPrice?.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    )}
                  </div>

                  {}
                  {product.rating !== undefined && product.rating > 0 && (
                    <div className="flex items-center gap-2">
                      <StarRating rating={product.rating} />
                      <span className="text-gray-600 text-sm font-medium">{product.rating.toFixed(1)}</span>
                      <span className="text-gray-400 text-sm">({product.reviews || 0})</span>
                    </div>
                  )}

                  {}
                  <div className="block sm:hidden">
                    <button
                      className="w-full bg-black text-white py-2.5 rounded hover:bg-gray-800 active:bg-gray-800 transition-colors flex items-center justify-center gap-2 touch-manipulation"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                      }}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span className="text-sm">Add To Cart</span>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      {}
      <div className="flex items-center gap-4 mb-4 sm:mb-6">
        <div className="w-1 h-5 sm:h-6 bg-blue-500 rounded"></div>
        <h3 className="text-base sm:text-lg font-semibold">Last View</h3>
      </div>
      {}
      {loadingLastView ? (
        <div className="text-center py-8">Loading last view...</div>
      ) : errorLastView || lastView.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <img src="https://res.cloudinary.com/dlwxkdjek/image/upload/v1750433799/capybara-turu_ledsfn.jpg" alt="Kosong" className="w-48 h-48 object-contain mb-6" />          <div className="text-lg text-gray-700 font-medium mb-2">Last View mu masih kosong</div>
          <div className="text-gray-500">Ayo cek produk dan temukan favoritmu!</div>
          {errorLastView && (
            <div className="text-blue-500 mt-4">{errorLastView}</div>
          )}
        </div>      ) : (        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {lastView.map((product: Product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="group">
              {}
              <div className="relative bg-gray-100 rounded-lg mb-4 h-48 sm:h-64 flex items-center justify-center overflow-hidden">
                <img
                  src={product.image || '/shopit.svg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/shopit.svg';
                  }}
                />                {}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex">
                  <button
                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 disabled:opacity-50"
                    onClick={(e) => handleAddToWishlist(product.id, e)}
                    disabled={addingToWishlist === product.id}
                  >
                    {addingToWishlist === product.id ? (
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Heart className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>

                {}
                <button
                  className="absolute top-2 right-2 bg-white/90 rounded-full w-7 h-7 flex items-center justify-center text-black active:bg-gray-200 transition-colors z-10 sm:hidden touch-manipulation disabled:opacity-50"
                  onClick={(e) => handleAddToWishlist(product.id, e)}
                  disabled={addingToWishlist === product.id}
                >
                  {addingToWishlist === product.id ? (
                    <div className="w-3.5 h-3.5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Heart className="w-4 h-4" />
                  )}
                </button>

                {}
                <div className="absolute bottom-0 left-0 w-full opacity-0 translate-y-4 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 px-4 pb-4 hidden sm:block">
                  <button
                    className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                    }}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add To Cart
                  </button>
                </div>
              </div>

              {}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 line-clamp-2">{product.name}</h3>

                {}
                <div className="flex items-center gap-2">
                  <span className="text-blue-500 font-medium">Rp. {product.price?.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  {product.originalPrice && (
                    <span className="text-gray-400 line-through">Rp. {product.originalPrice?.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  )}
                </div>

                {}
                <div className="flex items-center gap-2">
                  <StarRating rating={product.rating || 0} />
                  <span className="text-gray-600 text-sm font-medium">{(product.rating || 0).toFixed(1)}</span>
                  <span className="text-gray-400 text-sm">({product.reviews || 0})</span>
                </div>

                {}
                <div className="block sm:hidden">
                  <button
                    className="w-full bg-black text-white py-2.5 rounded hover:bg-gray-800 active:bg-gray-800 transition-colors flex items-center justify-center gap-2 touch-manipulation"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                    }}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="text-sm">Add To Cart</span>
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
    </RequireAuth>
  );
}
