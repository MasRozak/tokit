// Nanti setelah data benar, ganti kembali ke:
// next: { revalidate: 300 } // 5 menit
// atau 
// next: { revalidate: 600 } // 10 menit

// Untuk production yang stabil
async function getBestSellingProducts(): Promise<bestSellingProduct[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/products/bs`, {
      next: { revalidate: 300 }, // 5 minutes - balance between performance and freshness
    });
    // ... rest of code
  }
}
