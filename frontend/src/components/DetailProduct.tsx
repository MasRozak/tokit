'use client';
import React, { useState, useEffect } from 'react';
import StarRating from '@/components/StarRating';
import { Heart } from 'lucide-react';
import toast from "react-hot-toast";

export type ProductDetailProps = { id_produk: string };

interface Product {
  id_produk: number;
  nama_produk: string;
  image: string;
  harga: number;
  description: string;
  avg_rating: number;
  total_review: number;
  stock: number;
  category: string;
}

export default function DetailProduct({ id_produk }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/products/${id_produk}`);

        if (!res.ok) {
          throw new Error('Product not found');
        }

        const productData = await res.json();
        setProduct(productData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    const checkWishlistStatus = async () => {
      const token = sessionStorage.getItem('jwtToken');
      if (!token) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/wishlist`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.wishlist?.produk) {
            const productIds = Array.isArray(data.wishlist.produk)
              ? data.wishlist.produk.map((p: { id_produk?: number; id?: number } | number) => 
                  typeof p === 'number' ? p : p.id_produk || p.id || p
                )
              : [];
            setIsInWishlist(productIds.includes(id_produk) || productIds.includes(parseInt(id_produk)));
          }
        }
      } catch (error) {
        console.error('Error checking wishlist status:', error);
      }
    };

    if (id_produk) {
      fetchProduct();
      checkWishlistStatus();
    }
  }, [id_produk]);

  const handleAddToCart = async () => {
    const token = sessionStorage.getItem('jwtToken');
    if (!token) {
      toast.error('Please login to add items to cart');
      return;
    }

    setAddingToCart(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: id_produk,
          qty: quantity
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`${quantity} item(s) added to cart successfully!`);
        console.log('Added to cart:', data);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add product to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    const token = sessionStorage.getItem('jwtToken');
    if (!token) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    setAddingToWishlist(true);

    try {
      if (isInWishlist) {

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/wishlist/${id_produk}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsInWishlist(false);
          toast.success('Product removed from wishlist');
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Failed to remove product from wishlist');
        }
      } else {

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/wishlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            product_id: id_produk
          })
        });

        if (response.ok) {
          setIsInWishlist(true);
          toast.success('Product added to wishlist successfully!');
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Failed to add product to wishlist');
        }
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setAddingToWishlist(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
            <div className="bg-gray-200 rounded-lg aspect-square"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600">{error || 'The product you are looking for does not exist.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">        {}
        <div className="w-full">
          <div className="bg-neutral-100 rounded-lg overflow-hidden aspect-square">
            <img
              className="w-full h-full object-cover"
              src={product.image}
              alt={product.nama_produk}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-product.png';
              }}
            />
          </div>
        </div>

        {}
        <div className="w-full space-y-4 sm:space-y-6">
          {}
          <h1 className="text-xl sm:text-2xl font-semibold text-black leading-tight">
            {product.nama_produk}
          </h1>

          {}
          <div className="flex items-center gap-3 text-sm">
            <StarRating rating={product.avg_rating} />
            <span className="opacity-70">({product.total_review} Reviews)</span>
            <span className="mx-1 opacity-50">|</span>
            <span className="text-green-500 font-medium">In Stock</span>
          </div>

          {}
          <div className="text-xl sm:text-2xl font-normal text-black">
            Rp. {product.harga?.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>

          {}
          <div className="text-sm text-black leading-relaxed opacity-90 max-w-md">
            {product.description}
          </div>

          {}
          <div className="border-t border-black/20 my-4 sm:my-6"></div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
              {}
              <div className="flex items-center border border-black/50 rounded overflow-hidden h-11 w-fit">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-11 flex items-center justify-center border-r border-black/50 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 active:bg-gray-100 touch-manipulation"
                >
                  <span className="text-xl font-medium text-black">-</span>
                </button>

                <div className="w-20 h-11 flex items-center justify-center">
                  <span className="text-xl font-medium text-black">{quantity}</span>
                </div>

                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                  className="w-10 h-11 flex items-center justify-center bg-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 active:bg-blue-600 touch-manipulation"
                >
                  <span className="text-xl font-medium text-white">+</span>
                </button>
              </div>              {}
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || quantity > product.stock}
                className="flex-1 sm:flex-none h-11 px-8 sm:px-12 bg-blue-500 hover:bg-blue-600 active:bg-blue-600 rounded text-white font-medium transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {addingToCart ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding...
                  </>
                ) : (
                  'Add to Cart'
                )}
              </button>              {}
              <button
                onClick={handleAddToWishlist}
                disabled={addingToWishlist}
                className={`w-11 h-11 rounded border flex items-center justify-center transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed ${
                  isInWishlist
                    ? 'bg-blue-500 border-blue-500 hover:bg-blue-600 active:bg-blue-600'
                    : 'border-black/50 hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                {addingToWishlist ? (
                  <div className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${
                    isInWishlist ? 'border-white' : 'border-gray-600'
                  }`}></div>
                ) : (
                  <Heart className={`w-5 h-5 ${
                    isInWishlist ? 'text-white fill-red' : 'text-gray-700'
                  }`} />
                )}
              </button>
            </div>
          </div>

          {}
          <div className="border border-black/20 rounded p-4 space-y-4">
            {}
            <div className="flex items-start gap-4">
              <img src="/icon-delivery.svg" alt="Delivery" className="w-8 h-8 flex-shrink-0" />
              <div className="space-y-1">
                <div className="text-base font-medium text-black">Free Delivery</div>
                <div className="text-xs text-black/70">Enter your postal code for Delivery Availability</div>
              </div>
            </div>

            {}
            <div className="border-t border-black/20"></div>

            {}
            <div className="flex items-start gap-4">
              <img src="/Icon-return.png" alt="Return" className="w-8 h-8 flex-shrink-0" />
              <div className="space-y-1">
                <div className="text-base font-medium text-black">Return Delivery</div>
                <div className="text-xs text-black/70">
                  Free 30 Days Delivery Returns.{' '}
                  <span className="underline cursor-pointer">Details</span>
                </div>
              </div>
            </div>
          </div>        </div>
      </div>
    </div>
  );
}
