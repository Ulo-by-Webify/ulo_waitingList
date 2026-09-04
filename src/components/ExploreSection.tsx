"use client";

import { Heart, ChevronLeft, ChevronRight } from "lucide-react"

export default function ExploreSection() {
  return (
    <div className="bg-gray-50 min-h-screen pb-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <div className="">
          <h2 className="text-3xl font-semibold text-neutral-900">
            Ways to Stay on Ulô
          </h2>
          <p className="text-neutral-500 mt-3">
            Every home has its own character, choose the<br />
            one that fits your journey.
          </p>

          {/* Pills */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {[
              "Family beach house",
              "Traditional African house",
              "Forest retreat",
              "Nature lodge",
              "Romantic getaway",
              "Beachfront stay",
              "Private villa",
              "Tranquil homes",
              "Weekend getaway",
              "Sunset view house",
            ].map((item) => (
              <button
                key={item}
                className="px-6 py-2 border border-neutral-400 rounded-full text-sm font-medium text-neutral-800 hover:bg-neutral-900 hover:text-white transition"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* ---------------- CATEGORY CARDS ---------------- */}
        <div className="mt-20 grid md:grid-cols-3 gap-10">
          {/* Card 1 */}
          <CategoryCard
            image="/Africanna.jpg"
            icon="/icons/africana-icon.svg"
            title="Africana"
            description="Rooted in heritage. Built with native materials and cultural design."
          />

          {/* Card 2 */}
          <CategoryCard
            image="/Urban.jpg"
            icon="/icons/urban-icon.svg"
            title="Urban"
            description="Modern city homes designed for comfort and convenience."
          />

          {/* Card 3 */}
          <CategoryCard
            image="/Eden.jpg"
            icon="/icons/eden-icon.svg"
            title="Eden"
            description="Nature-immersed retreats near forests, countryside, or the sea."
          />
        </div>
      </div>
    </div>
  )
}

function CategoryCard({
  image,
  icon,
  title,
  description,
}: {
  image: string
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="bg-white rounded-[28px] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_14px_40px_rgba(0,0,0,0.12)] transition-all duration-300">
      {/* Image Wrapper */}
      <div className="relative rounded-2xl overflow-hidden aspect-square">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />

        {/* SVG Icon Badge */}
        <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
          <img
            src={icon}
            alt={`${title} icon`}
            className="w-5 h-5 object-contain"
          />
        </div>
      </div>

      {/* Content */}
      <div className="mt-6 px-2 pb-4 text-left">
        <h3 className="text-3xl font-semibold text-primary mb-3">
          {title}
        </h3>

        <p className="text-neutral-500 text-sm mt-2 leading-relaxed">
          {description}
        </p>

        <button className="mt-6 w-full bg-neutral-900 text-white py-3 rounded-full font-medium hover:bg-neutral-800 transition">
          Book home
        </button>
      </div>
    </div>
  )
}