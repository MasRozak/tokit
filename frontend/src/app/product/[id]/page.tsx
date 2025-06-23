'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DetailProduct from "@/components/DetailProduct";
import UserReview from '@/components/userReview';
import RelatedProductsCarousel from '@/components/RelatedProductsCarousel';

export default function ProductDetailPage() {
  const params = useParams();
  const id_produk = params.id as string;
  const [related, setRelated] = useState([]);
  useEffect(() => {
    const addToLastView = async () => {
      try {
        const produk = id_produk;
        const token = sessionStorage.getItem('jwtToken');
        if (token) {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/lastview`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ produk })
          });
        }
      } catch (error) {
        console.error('Error adding to last view:', error);
      }    };

    const fetchRelatedProducts = async () => {
      try {
        const productRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/products/${id_produk}`);
        
        if (productRes.ok) {
          const currentProduct = await productRes.json();
          
          const allProductsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/products`);
          
          if (allProductsRes.ok) {
            const allProducts = await allProductsRes.json();            const relatedProducts = allProducts.filter((p: { category: string; id_produk: number }) => 
              p.category === currentProduct.category && p.id_produk !== parseInt(id_produk as string)
            );
            setRelated(relatedProducts);
          }
        }
      } catch (error) {
        console.error('Error fetching related products:', error);
      }
    };

    addToLastView();
    fetchRelatedProducts();
  }, [id_produk]);  return (
    <main className="max-w-7xl mx-auto p-6">
      <DetailProduct id_produk={id_produk} />
        <div className="mt-8">
        <UserReview id_produk={id_produk} />
      </div>
      
      <div className="mt-12">        <div className="inline-flex justify-start items-center gap-4">
          <div className="w-5 h-10 relative">
            <div className="w-5 h-10 left-0 top-0 absolute bg-blue-500 rounded" />
          </div>
          <div className="justify-start text-blue-500 text-base font-semibold font-['Poppins'] leading-tight">Related Item</div>
        </div>

        <div className="mt-6">
          <RelatedProductsCarousel products={related} />
        </div>
      </div>
    </main>
  );
}
