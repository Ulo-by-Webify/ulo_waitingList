import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, Star, Tag } from 'lucide-react';

// --- Mock Data for the Carousel ---
const PROPERTIES = [
  {
    id: 1,
    title: "Tranquil Hut Kigali",
    price: "89",
    nights: "2 nights",
    rating: 3.5,
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=2565&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Sahara Desert Villa",
    price: "120",
    nights: "1 night",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2670&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Cape Town Penthouse",
    price: "250",
    nights: "3 nights",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2671&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Maasai Mara Lodge",
    price: "150",
    nights: "2 nights",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2670&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "Zanzibar Beach House",
    price: "180",
    nights: "5 nights",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2525&auto=format&fit=crop",
  }
];

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const getIndex = (offset: number) => {
    return (currentIndex + offset + PROPERTIES.length) % PROPERTIES.length;
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % PROPERTIES.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + PROPERTIES.length) % PROPERTIES.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const currentProperty = PROPERTIES[currentIndex];
  const prevProperty = PROPERTIES[getIndex(-1)];
  const nextProperty = PROPERTIES[getIndex(1)];

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-slate-900 overflow-x-hidden selection:bg-orange-200">
      
      {/* --- HERO SECTION --- */}
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-12 text-center">
        <h1 className="text-3xl font-semibold text-primary mb-3">
          Handpicked homes across Africa
        </h1>
        <p className="text-neutral-500 mt-4 text-lg">
          Browse trusted homes, choose your style,<br />
          and book with confidence.
        </p>
      </div>

      {/* --- CAROUSEL SECTION --- */}
      <div className="relative w-full max-w-[1600px] mx-auto h-[600px] flex items-center justify-center mb-24" style={{ perspective: '1000px' }}>
            
        {/* Navigation Arrows */}
        <button 
          onClick={handlePrev}
          className="absolute left-4 md:left-40 z-50 bg-white shadow-lg hover:shadow-xl hover:scale-105 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group border border-slate-100"
        >
          <ChevronLeft size={24} className="text-slate-700 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <button 
          onClick={handleNext}
          className="absolute right-4 md:right-40 z-50 bg-white shadow-lg hover:shadow-xl hover:scale-105 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group border border-slate-100"
        >
          <ChevronRight size={24} className="text-slate-700 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Carousel Container */}
        <div className="relative w-full h-full flex items-center justify-center">
            
          {/* Left Preview Card */}
          <div 
            className="hidden md:block absolute w-[320px] lg:w-[420px] h-[300px] lg:h-[440px] rounded-[2.5rem] overflow-hidden shadow-2xl opacity-80 brightness-90 transition-all duration-500 ease-out"
            style={{ 
              transform: 'translateX(-65%) scale(0.85) rotateY(25deg) rotateZ(-6deg)',
              transformOrigin: 'center center'
            }}
          >
            <img src={prevProperty.image} className="w-full h-full object-cover" alt="Previous" />
          </div>

          {/* Main Active Card */}
          <div className="relative w-[90%] md:w-[600px] lg:w-[750px] h-[400px] md:h-[480px] rounded-[2.5rem] overflow-hidden shadow-2xl z-20 transition-all duration-500 ease-out bg-white">
            <img 
              src={currentProperty.image} 
              alt={currentProperty.title} 
              className="w-full h-full object-cover"
            />
            
            {/* Top Right Heart */}
            <button className="absolute top-6 right-6 bg-white/30 backdrop-blur-md hover:bg-white/50 transition-colors p-3 rounded-full text-white border border-white/40">
              <Heart size={24} fill="white" className="opacity-90" />
            </button>

            {/* Bottom Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-10 text-left">
              <h2 className="text-white text-3xl md:text-4xl font-bold mb-2 tracking-tight">
                {currentProperty.title}
              </h2>
              
              {/* UPDATED PRICE SECTION WITH ICON */}
              <div className="flex items-center gap-3 text-white/90 text-lg">
                <div className="flex items-center gap-1.5 font-medium">
                  {/* Icon replacing the 'A' */}
                  <img src="/icons/cowries-light.svg" alt="" /> 
                  <span>{currentProperty.price}</span>
                </div>
                <span className="text-white/60">for {currentProperty.nights}</span>
                <span className="mx-1 text-white/40">•</span>
                <div className="flex items-center gap-1">
                  <Star size={18} className="fill-yellow-400 text-yellow-400" />
                  <span>{currentProperty.rating}</span>
                </div>
              </div>
              
              {/* Pagination Dots */}
              <div className="flex gap-2 mt-6">
                {PROPERTIES.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? 'w-8 bg-white' : 'w-1.5 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Preview Card */}
          <div 
            className="hidden md:block absolute w-[320px] lg:w-[420px] h-[300px] lg:h-[440px] rounded-[2.5rem] overflow-hidden shadow-2xl opacity-80 brightness-90 transition-all duration-500 ease-out"
            style={{ 
              transform: 'translateX(65%) scale(0.85) rotateY(-25deg) rotateZ(6deg)',
              transformOrigin: 'center center'
            }}
          >
            <img src={nextProperty.image} className="w-full h-full object-cover" alt="Next" />
          </div>

        </div>
      </div>

    </div>
  );
}