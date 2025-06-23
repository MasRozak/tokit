'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import StarRating from '@/components/StarRating';
import { formatImageUrl } from "@/utils/imageUtils";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  quantity: number;
}

function ProductContent() {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestSelling = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/products/bs`
        );
        const data = await res.json();        const mapped = await Promise.all(
          data.map(async (p: { id_produk: number; nama_produk: string; image: string; harga: number; deskripsi: string; avg_rating: number; total_review: number; kategori?: string; total_quantity?: number }) => {
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
                category: p.kategori || 'Uncategorized',
                image: formatImageUrl(p.image, '/placeholder.png'),
                rating: real_rating,
                reviews: real_review_count,
                quantity: p.total_quantity ?? 0,
              };
            } catch (error) {
              console.error(`Error processing product ${p.id_produk}:`, error);
              return {
                id: p.id_produk,
                name: p.nama_produk,
                price: p.harga,
                category: p.kategori || 'Uncategorized',
                image: formatImageUrl(p.image, '/placeholder.png'),
                rating: 0,
                reviews: 0,
                quantity: p.total_quantity ?? 0,
              };
            }
          })
        );

        setProducts(mapped);
      } catch (err) {
        console.error('Failed to fetch best selling products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSelling();
  }, []);

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products;

  if (loading) {
    return <div className="text-center py-12">Loading products...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mt-8 sm:mt-12">
        <h3 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
          {selectedCategory ? `Explore Our ${selectedCategory}` : 'Best Selling Products'}
        </h3>        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 py-4">
          {filteredProducts.map(product => (
            <Link key={product.id} href={`/product/${product.id}`} className="group border rounded-lg p-3 sm:p-4 hover:shadow-md transition">
              <div className="relative bg-gray-100 rounded-md flex items-center justify-center h-48 sm:h-64 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/300x300?text=No+Image';
                  }}
                />
              </div>
              <div className="mt-3 sm:mt-4">
                <h4 className="font-medium text-base sm:text-lg text-gray-800 line-clamp-2 mb-2">{product.name}</h4>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                  <p className="text-blue-500 font-semibold text-base sm:text-lg">Rp. {product.price?.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <span className="text-gray-400 text-sm">({product.quantity} terjual)</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <StarRating rating={product.rating} />
                  <span className="text-gray-600 text-sm font-medium">{product.rating.toFixed(1)}</span>
                  <span className="text-gray-400 text-sm">({product.reviews} reviews)</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading products...</div>}>
      <ProductContent />
    </Suspense>
  );
}
