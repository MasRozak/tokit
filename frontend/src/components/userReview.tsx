'use client';
import React, { useState, useEffect } from 'react';
import StarRating from '@/components/StarRating';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';

export interface Review {
  id: number;
  username: string;
  date: string;
  rate: number;
  comment: string;
}

interface UserReviewProps {
  id_produk: string;
}

export default function UserReview({ id_produk }: UserReviewProps) {  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/reviews/${id_produk}`);
          if (!res.ok) {
          throw new Error('Failed to fetch reviews');
        }
          const responseData = await res.json();
        console.log('Raw API response:', responseData);

        let parsedReviews: Review[] = [];

        if (responseData.reviews && Array.isArray(responseData.reviews) && responseData.reviews.length > 0) {

          const reviewDocument = responseData.reviews[0];

          if (reviewDocument.reviews && Array.isArray(reviewDocument.reviews)) {
            parsedReviews = reviewDocument.reviews.map((review: { username?: string; date: string; rate?: number; comment?: string }, index: number) => ({
              id: index + 1,
              username: review.username || 'Anonymous',
              date: new Date(review.date).toISOString().slice(0, 10),
              rate: review.rate || 0,
              comment: review.comment || ''
            }));
          }
        }

        console.log('Parsed reviews:', parsedReviews);
        setReviews(parsedReviews);      } catch (err) {
        console.error('Error fetching reviews:', err);
        console.error('Error fetching reviews:', err instanceof Error ? err.message : 'Failed to fetch reviews');
        toast.error('Gagal menampilkan review');

        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    if (id_produk) {
      fetchReviews();
    }
  }, [id_produk]);
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/reviews/${id_produk}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('jwtToken') || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: newRating,
          comment: newComment
        })
      });      if (response.ok) {

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/reviews/${id_produk}`);
        if (res.ok) {
          const responseData = await res.json();

          let parsedReviews: Review[] = [];

          if (responseData.reviews && Array.isArray(responseData.reviews) && responseData.reviews.length > 0) {
            const reviewDocument = responseData.reviews[0];
              if (reviewDocument.reviews && Array.isArray(reviewDocument.reviews)) {
              parsedReviews = reviewDocument.reviews.map((review: { username?: string; date: string; rate?: number; comment?: string }, index: number) => ({
                id: index + 1,
                username: review.username || 'Anonymous',
                date: new Date(review.date).toISOString().slice(0, 10),
                rate: review.rate || 0,
                comment: review.comment || ''
              }));
            }
          }
          setReviews(parsedReviews);
          toast.success('Review berhasil ditambahkan!');
        } else {
          toast.error('Review ditambahkan tapi gagal memuat ulang data');
        }} else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || 'Tidak bisa kirim review');
      }    } catch (error) {
      console.error('Error adding review:', error);
      toast.error('Tidak bisa kirim review');

      const next: Review = {
        id: reviews.length + 1,
        username: 'You',
        date: new Date().toISOString().slice(0, 10),
        rate: newRating,
        comment: newComment
      };
      setReviews([next, ...reviews]);
    }

    setNewRating(5);
    setNewComment('');
    setShowModal(false);
  };

  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rate, 0) / reviews.length : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded shadow p-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="bg-white rounded shadow p-4 h-60">
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {}
      <div className="bg-white rounded shadow p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StarRating rating={avgRating} />
          <span className="text-sm text-gray-500">
            Penilaian Produk ({reviews.length} Reviews)
          </span>
        </div>
        <button onClick={() => setShowModal(true)}>
          <img
            src="/image 64.png"
            alt="Add Review"
            className="w-16 h-16 object-cover rounded"
          />
        </button>
      </div>      {}
      <div className="bg-white rounded shadow p-4 space-y-6 h-60 overflow-y-auto">
        {reviews.map(review => (
          <div key={review.id} className="space-y-2">            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{review.username}</span>
              <span>{review.date}</span>
            </div>
            <StarRating rating={review.rate} />
            <p className="text-gray-700 text-sm">{review.comment}</p>
          </div>
        ))}
      </div>

      {}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center">
          <form
            className="z-60 bg-white rounded p-6 w-full max-w-md space-y-4"
            onSubmit={handleAddReview}
          >
            <h2 className="text-lg font-semibold">Tambah Review</h2>
            <div>
              <label className="block text-sm mb-1">Rating</label>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(n => (
                  <Star
                    key={n}
                    className={
                      `w-6 h-6 cursor-pointer ${n <= newRating ? 'text-yellow-400' : 'text-gray-300'}`
                    }
                    onClick={() => setNewRating(n)}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">Komentar</label>
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                rows={4}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded border"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-500 text-white"
              >
                Kirim
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
