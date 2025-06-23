import { Suspense } from 'react';
import Carousel from '@/components/Carousel';
import BestSellingProducts from '@/components/BestSellingProduct';
import DiscoveryProduct from '@/components/DiscoveryProduct';
import CategorySection from "@/components/Category";
import { Product } from '@/types/product';

interface bestSellingProduct {
  id_produk: number;
  nama_produk: string;
  harga: number;
  image: string;
  avg_rating?: number;
  total_review?: number;
  total_quantity?: number;

}

const images = [
  { src: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=400&fit=crop', alt: 'First Slide' },
  { src: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=400&fit=crop', alt: 'Second Slide' },
  { src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=400&fit=crop', alt: 'Third Slide' },
];

async function getBestSellingProducts(): Promise<bestSellingProduct[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/products/bs`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!res.ok) {
      console.error('Failed to fetch best selling products:', res.status);
      return [];
    }

    const data = await res.json();

    if (Array.isArray(data)) {
      return data.slice(0, 5);
    } else {
      console.error('Best selling products response is not an array:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching best selling products:', error);
    return [];
  }
}

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/products`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!res.ok) {
      console.error('Failed to fetch products:', res.status);
      return [];
    }

    const data = await res.json();

    if (Array.isArray(data)) {
      return data.slice(0, 4);
    } else {
      console.error('Products response is not an array:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export default async function Home() {
  const [products, bestSelling] = await Promise.all([
    getProducts(),
    getBestSellingProducts()
  ]);

  return (
    <div className="min-h-screen">
      {}
      <div className="w-full">
        <Carousel images={images} />
      </div>      {}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Suspense fallback={
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading categories...</span>
          </div>
        }>
          <CategorySection />
        </Suspense>
      </div>

      {}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <BestSellingProducts products={bestSelling} />
      </div>

      {}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <DiscoveryProduct products={products} />
      </div>
    </div>
  );
}
