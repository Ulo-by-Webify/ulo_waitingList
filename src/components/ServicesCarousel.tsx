"use client";

// src/components/ServicesCarousel.tsx
import React, { useState, useEffect } from "react";
import SectionHeader from "./SectionHeader";

const airportIcon = "/service-icons/airport-pickup.png";
const chefIcon = "/service-icons/chef.png";
const laundryIcon = "/service-icons/laundry.png";
const yogaIcon = "/service-icons/yoga.png";
const hairStylistIcon = "/service-icons/hair-stylist.png";
const boatCruiseIcon = "/service-icons/boat-cruise.png";
const photographyIcon = "/service-icons/photography.png";
const helicopterIcon = "/service-icons/helicopter.png";

interface ServicesCarouselProps {
  sectionId: string;
}

const services = [
  { label: "Airport Pick-up", icon: airportIcon },
  { label: "Private Chefs", icon: chefIcon },
  { label: "Laundry", icon: laundryIcon },
  { label: "African Yoga", icon: yogaIcon },
  { label: "Hair Stylist", icon: hairStylistIcon },
  { label: "Boat Cruise", icon: boatCruiseIcon },
  { label: "Photographer", icon: photographyIcon },
  { label: "Helicopter", icon: helicopterIcon },
];

const ServicesCarousel: React.FC<ServicesCarouselProps> = ({ sectionId }) => {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const visibleSlides = 3;
  const maxIndex = services.length - visibleSlides;

  // Auto-slide (pauses on hover)
  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      setCurrent((prev) =>
        prev >= maxIndex ? 0 : prev + 1
      );
    }, 3500);

    return () => clearInterval(interval);
  }, [isHovered, maxIndex]);

  const nextSlide = () =>
    setCurrent((prev) =>
      prev >= maxIndex ? 0 : prev + 1
    );

  const prevSlide = () =>
    setCurrent((prev) =>
      prev <= 0 ? maxIndex : prev - 1
    );

  return (
    <section className="pt-40 pb-44" id={sectionId}>
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        
        {/* LEFT SIDE - SLIDER */}
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Track */}
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              transform: `translateX(-${(100 / visibleSlides) * current}%)`,
            }}
          >
            {services.map((service, index) => (
              <div
                key={index}
                className="w-1/3 flex-shrink-0 flex flex-col items-center text-center space-y-4"
              >
                <img
                  src={service.icon}
                  alt={service.label}
                  className="w-20 h-20 object-contain"
                />
                <span className="text-lg font-medium text-gray-800">
                  {service.label}
                </span>
              </div>
            ))}
          </div>

          {/* Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl px-3 py-1 hover:opacity-60"
          >
            ‹
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-2xl px-3 py-1 hover:opacity-60"
          >
            ›
          </button>

          {/* Dots */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-3">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <div
                key={index}
                onClick={() => setCurrent(index)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  current === index
                    ? "w-8 bg-black"
                    : "w-2 bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>

        {/* RIGHT SIDE TEXT */}
        <SectionHeader
          title="Beyond your Stay"
          subtitle="Add ease and local depth to your journey with services you can trust."
        />
      </div>
    </section>
  );
};

export default ServicesCarousel;