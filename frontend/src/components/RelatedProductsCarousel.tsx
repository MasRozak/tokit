'use client';
import React, { useRef, useEffect, useState } from 'react';
import StarRating from '@/components/StarRating';
import { Product } from '@/lib/dummyProducts';
import Link from 'next/link';

interface CarouselProps {
  products: Product[];
}

interface ProductWithReviews extends Product {
  real_rating?: number;
  real_review_count?: number;
}

export default function RelatedProductsCarousel({ products }: CarouselProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [productsWithReviews, setProductsWithReviews] = useState<ProductWithReviews[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!products || products.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const productsWithReviewData = await Promise.all(
          products.map(async (product) => {
            try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/reviews/${product.id_produk}`);
              if (response.ok) {
                const data = await response.json();

                let reviews = [];                if (data.reviews && data.reviews.length > 0 && data.reviews[0].reviews) {
                  reviews = data.reviews[0].reviews;
                }                let real_rating = 0;
                const real_review_count = reviews.length;
                if (reviews.length > 0) {
                  const totalRating = reviews.reduce((sum: number, review: { rate?: number }) => sum + (review.rate || 0), 0);
                  real_rating = totalRating / reviews.length;
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
        setProductsWithReviews(products.map(p => ({ ...p, real_rating: 0, real_review_count: 0 })));
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [products]);

  const scroll = (dir: number) => {
    if (ref.current) {
      ref.current.scrollBy({ left: dir * 240, behavior: 'smooth' });
    }
  };
  if (loading) {
    return (
      <div className="relative">
        <div className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth py-2 no-scrollbar">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="min-w-[250px] max-w-[250px] flex-shrink-0 border rounded-lg p-4 animate-pulse">
              <div className="bg-gray-200 rounded-lg h-48 sm:h-56 mb-3 sm:mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-md"
      >
        ‹
      </button>      <div
        ref={ref}
        className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth py-2 no-scrollbar"
      >
        {productsWithReviews.map(prod => (
          <Link
            key={prod.id_produk}
            href={`/product/${prod.id_produk}`}
            className="min-w-[250px] max-w-[250px] flex-shrink-0 group border rounded-lg p-4 hover:shadow-lg transition flex flex-col"
          >
            {}
            <div className="relative bg-gray-100 rounded-lg h-48 sm:h-56 mb-3 sm:mb-4 flex items-center justify-center overflow-hidden">
              <img
                src={prod.image || 'https://via.placeholder.com/300x300?text=No+Image'}
                alt={prod.nama_produk}
                className="object-cover w-full h-full"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/300x300?text=No+Image';
                }}
              />
            </div>

            {}
            <div className="flex-grow">
              <h3 className="font-medium text-gray-900 text-sm">{prod.nama_produk}</h3>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-blue-500 font-semibold">Rp. {prod.harga?.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <StarRating rating={prod.real_rating ?? 0} />
                <span className="text-gray-600 text-sm font-medium">{(prod.real_rating ?? 0).toFixed(1)}</span>
                <span className="text-gray-400 text-sm">({prod.real_review_count ?? 0})</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <button
        type="button"
        onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-md"
      >
        ›
      </button>
    </div>
  );
}
