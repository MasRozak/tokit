'use client';
import { Heart, ShoppingCart } from "lucide-react";
import StarRating from "@/components/StarRating";
import Link from "next/link";
import { Product } from '@/types/product';
import { useEffect, useState } from 'react';
import toast from "react-hot-toast";

interface ExploreProductsProps {
  products: Product[];
}

interface ProductWithReviews extends Product {
  real_rating?: number;
  real_review_count?: number;
}

export default function ExploreProducts({ products }: ExploreProductsProps) {
  const [productsWithReviews, setProductsWithReviews] = useState<ProductWithReviews[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [addingToWishlist, setAddingToWishlist] = useState<string | null>(null);

  const validProducts = products?.filter(product =>
    product &&
    product.id_produk &&
    product.nama_produk &&
    typeof product.harga === 'number'
  ) || [];

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
      });      if (response.ok) {
        const data = await response.json();
        toast.success('Product added to cart successfully!');
        console.log('Added to cart:', data);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add product to cart');
    } finally {
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
      });      if (response.ok) {
        toast.success('Product added to wishlist successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to add product to wishlist');      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add product to wishlist');
    } finally {
      setAddingToWishlist(null);
    }
  };

  useEffect(() => {
    const fetchReviews = async () => {
      if (validProducts.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const productsWithReviewData = await Promise.all(
          validProducts.map(async (product) => {
            try {
              const response = await fetch(`http://localhost:8080/api/reviews/${product.id_produk}`);
              if (response.ok) {
                const data = await response.json();
                console.log(`Raw API response for product ${product.id_produk}:`, data);

                let reviews = [];                if (data.reviews && data.reviews.length > 0 && data.reviews[0].reviews) {
                  reviews = data.reviews[0].reviews;
                }
                console.log(`Extracted reviews for product ${product.id_produk}:`, reviews);                let real_rating = 0;
                const real_review_count = reviews.length;
                if (reviews.length > 0) {
                  const totalRating = reviews.reduce((sum: number, review: { rate?: number }) => sum + (review.rate || 0), 0);
                  real_rating = totalRating / reviews.length;
                  console.log(`Product ${product.id_produk}: Calculated rating=${real_rating}, count=${real_review_count}`);
                }

                return {
                  ...product,
                  real_rating,
                  real_review_count
                };
              } else {
                return {
                  ...product,
                  real_rating: 0,
                  real_review_count: 0
                };
              }
            } catch (error) {
              console.error(`Error fetching reviews for product ${product.id_produk}:`, error);
              return {
                ...product,
                real_rating: 0,
                real_review_count: 0
              };
            }
          })
        );

        setProductsWithReviews(productsWithReviewData);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setProductsWithReviews(validProducts.map(p => ({ ...p, real_rating: 0, real_review_count: 0 })));
      } finally {
        setLoading(false);
      }
    };    fetchReviews();
  }, [products, validProducts]);

  return (
    <div className="w-full bg-white">
      {}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-4 mb-2">          <div className="w-1 h-6 sm:h-8 bg-blue-500 rounded"></div>
          <span className="text-blue-500 font-medium text-sm sm:text-base">Our Products</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Explore Our Products</h2>
      </div>

      {}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="border rounded-lg p-4 animate-pulse">
              <div className="bg-gray-200 rounded-lg h-48 sm:h-56 mb-3 sm:mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : productsWithReviews.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {productsWithReviews.map((product) => (
            <Link
              key={product.id_produk}
              href={`/product/${product.id_produk}`}
              className="group relative border rounded-lg p-4 hover:shadow-lg transition flex flex-col"
            >
              {}
              <div className="relative bg-gray-100 rounded-lg h-48 sm:h-56 mb-3 sm:mb-4 flex items-center justify-center overflow-hidden">
                <img
                  src={product.image || 'https://via.placeholder.com/300x300?text=No+Image'}
                  alt={product.nama_produk}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/300x300?text=No+Image';
                  }}
                />
                  {}
                <div className="absolute top-3 right-3 hidden sm:flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 disabled:opacity-50"
                    onClick={(e) => handleAddToWishlist(product.id_produk, e)}
                    disabled={addingToWishlist === product.id_produk}
                  >
                    {addingToWishlist === product.id_produk ? (
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Heart className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>

                {}
                <div className="absolute top-2 right-2 flex sm:hidden flex-col gap-1">
                  <button
                    className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-md active:bg-gray-100 touch-manipulation disabled:opacity-50"
                    onClick={(e) => handleAddToWishlist(product.id_produk, e)}
                    disabled={addingToWishlist === product.id_produk}
                  >
                    {addingToWishlist === product.id_produk ? (
                      <div className="w-3.5 h-3.5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Heart className="w-3.5 h-3.5 text-gray-600" />
                    )}
                  </button>
                </div>

                {}
                <div className="absolute bottom-0 left-0 w-full opacity-0 translate-y-4 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 px-4 pb-4 hidden sm:block">
                  <button
                    className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={(e) => handleAddToCart(product.id_produk, e)}
                    disabled={addingToCart === product.id_produk}
                  >
                    {addingToCart === product.id_produk ? (
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

              {}
              <div className="flex-grow">
                <h3 className="font-medium text-gray-900 text-sm">{product.nama_produk}</h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-blue-500 font-semibold">Rp. {product.harga?.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <StarRating rating={product.real_rating ?? 0} />
                  <span className="text-gray-600 text-sm font-medium">{(product.real_rating ?? 0).toFixed(1)}</span>
                  <span className="text-gray-400 text-sm">({product.real_review_count ?? 0})</span>
                </div>
              </div>

              {}
              <div className="block sm:hidden">
                <button
                  className="w-full bg-black text-white py-2.5 rounded hover:bg-gray-800 active:bg-gray-800 transition-colors flex items-center justify-center gap-2 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={(e) => handleAddToCart(product.id_produk, e)}
                  disabled={addingToCart === product.id_produk}
                >
                  {addingToCart === product.id_produk ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">Adding...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span className="text-sm font-medium">Add To Cart</span>
                    </>
                  )}
                </button>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-12">
          <div className="flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium mb-2">No products available</p>
            <p className="text-sm text-gray-400">Please check back later or browse our other products.</p>
          </div>
        </div>
      )}

      {}
      <div className="flex justify-center mt-8 sm:mt-10">
        <Link href="/product" className="bg-blue-500 hover:bg-blue-600 active:bg-blue-600 text-white px-6 py-2.5 sm:py-2 rounded transition-colors touch-manipulation">
          View All Products
        </Link>
      </div>
    </div>
  );
}
