// src/components/ServicesCarousel.tsx
import React, { useState, useEffect } from "react";
import SectionHeader from "./SectionHeader";

import airportIcon from "/service-icons/airport-pickup.png";
import chefIcon from "/service-icons/chef.png";
import laundryIcon from "/service-icons/laundry.png";
import yogaIcon from "/service-icons/yoga.png";
import hairStylistIcon from "/service-icons/hair-stylist.png";
import boatCruiseIcon from "/service-icons/boat-cruise.png";
import photographyIcon from "/service-icons/photography.png";
import helicopterIcon from "/service-icons/helicopter.png";

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

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % services.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () =>
    setCurrent((prev) => (prev + 1) % services.length);

  const prevSlide = () =>
    setCurrent((prev) =>
      prev === 0 ? services.length - 1 : prev - 1
    );

  return (
    <section className="pt-40 pb-44" id={sectionId}>
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT SIDE - SLIDER */}
        <div className="relative flex items-center justify-center">

          {/* Slides */}
          <div className="flex items-center justify-center gap-12 transition-all duration-500">
            {[0, 1, 2].map((offset) => {
              const index = (current + offset) % services.length;
              const service = services[index];

              return (
                <div
                  key={index}
                  className="flex flex-col items-center text-center space-y-4"
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
              );
            })}
          </div>

          {/* Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 text-2xl px-3 py-1 hover:opacity-60"
          >
            ‹
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 text-2xl px-3 py-1 hover:opacity-60"
          >
            ›
          </button>

          {/* Dots */}
          <div className="absolute -bottom-10 flex gap-3">
            {services.map((_, index) => (
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