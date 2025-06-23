'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface CarouselProps {
  images: { src: string; alt?: string }[];
}

const Carousel: React.FC<CarouselProps> = ({ images }) => {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto">
        <style jsx>{`
          .carousel-container .swiper-pagination-bullet {
            background: rgba(255, 255, 255, 0.5);
            opacity: 1;
          }
          .carousel-container .swiper-pagination-bullet-active {
            background: #ffffff;
          }
          .carousel-container .swiper-button-next,
          .carousel-container .swiper-button-prev {
            color: #ffffff;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 50%;
            width: 40px;
            height: 40px;
          }
          .carousel-container .swiper-button-next:after,
          .carousel-container .swiper-button-prev:after {
            font-size: 16px;
          }
        `}</style>        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          pagination={{
            clickable: true,
            bulletClass: 'swiper-pagination-bullet',
            bulletActiveClass: 'swiper-pagination-bullet-active'
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={true}
          className="carousel-container rounded-xl shadow-lg overflow-hidden bg-white"
        >{images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <img
                  src={image.src}
                  alt={image.alt || `Slide ${index + 1}`}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                  onError={(e) => {
                    console.error(`Failed to load image: ${image.src}`);
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=400&fit=crop&auto=format';
                  }}
                  onLoad={() => {
                    console.log(`Successfully loaded image: ${image.src}`);
                  }}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default Carousel;
