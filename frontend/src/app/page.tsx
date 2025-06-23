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
  { src: 'https://www.bechtle.com/dam/jcr:3664adb4-bc64-46a5-b0f8-1a48852e1150/cw04_mainbanner_samsung-eu.jpg', alt: 'First Slide' },
  { src: 'https://cdn.shopify.com/s/files/1/0537/6563/6266/files/digital-walker_1000XM6-1920x614_HOMEPAGE_BANNER.jpg?v=1747300079', alt: 'Second Slide' },
  { src: 'https://thetechrevolutionist.com/wp-content/uploads/2024/09/AMD-Ryzen-Banner.jpg', alt: 'Third Slide' },
];

async function getBestSellingProducts(): Promise<bestSellingProduct[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/products/bs`, {
      cache: 'no-store', // Temporary: No cache for immediate updates
    });

    if (!res.ok) {
      console.error('Failed to fetch best selling products:', res.status);
      return [];
    }    const data = await res.json();

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
  try {    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/products`, {
      cache: 'no-store', // Temporary: No cache for immediate updates
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
