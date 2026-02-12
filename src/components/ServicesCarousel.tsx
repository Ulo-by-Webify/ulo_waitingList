// src/components/ServicesCarousel.tsx
import React from "react";
import SectionHeader from "./SectionHeader";

const services = [
  { label: "Airport pick-up", icon: "🚗" },
  { label: "Chefs", icon: "🍲" },
  { label: "Laundry", icon: "🧺" },
  { label: "African yoga", icon: "🧘🏾" },
];

const ServicesCarousel: React.FC = () => {
  return (
    <section className="pt-40 pb-40">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        {/* Left: Services */}
        <div className="flex items-center justify-center gap-10 relative">
          {services.map((service, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center space-y-3"
            >
              <div className="text-5xl">{service.icon}</div>
              <span className="text-sm text-gray-700">
                {service.label}
              </span>
            </div>
          ))}

          {/* Dots */}
          <div className="absolute -bottom-10 flex gap-2">
            <span className="w-8 h-1 bg-black rounded-full"></span>
            <span className="w-2 h-1 bg-gray-400 rounded-full"></span>
            <span className="w-2 h-1 bg-gray-400 rounded-full"></span>
            <span className="w-2 h-1 bg-gray-400 rounded-full"></span>
          </div>
        </div>

        {/* Right: Text */}
        <SectionHeader
          title="Beyond your Stay"
          subtitle="Add ease and local depth to your journey with services you can trust."
        />
      </div>
    </section>
  );
};

export default ServicesCarousel;