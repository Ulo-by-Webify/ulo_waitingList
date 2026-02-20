import { Heart, ChevronLeft, ChevronRight } from "lucide-react"

export default function ExploreSection() {
  return (
    <div className="bg-gray-50 min-h-screen py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        {/* ---------------- HERO TEXT ---------------- */}
        <h1 className="text-4xl md:text-5xl font-semibold text-neutral-900">
          Handpicked homes across Africa
        </h1>
        <p className="text-neutral-500 mt-4 text-lg">
          Browse trusted homes, choose your style,<br />
          and book with confidence.
        </p>

        {/* ---------------- CAROUSEL ---------------- */}
        <div className="relative mt-14 flex items-center justify-center">
          {/* Left Arrow */}
          <button className="absolute -left-10 bg-white shadow-md w-10 h-10 rounded-full flex items-center justify-center">
            <ChevronLeft size={20} />
          </button>

          {/* Side Card (Left Preview) */}
          <div className="hidden md:block absolute -left-40 w-[420px] h-[260px] rounded-3xl overflow-hidden shadow-md opacity-70">
            <img
              src="https://images.unsplash.com/photo-1505691938895-1758d7feb511"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Main Card */}
          <div className="relative w-[650px] h-[380px] rounded-3xl overflow-hidden shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750"
              className="w-full h-full object-cover"
            />

            {/* Heart */}
            <div className="absolute top-4 right-4 bg-white/70 backdrop-blur-md rounded-full p-2">
              <Heart size={18} />
            </div>

            {/* Bottom Gradient */}
            <div className="absolute bottom-0 left-0 w-full h-36 bg-gradient-to-t from-black/70 to-transparent p-6 flex flex-col justify-end">
              <h3 className="text-white text-xl font-semibold">
                Tranquil Hut Kigali
              </h3>
              <p className="text-white/80 text-sm">
                A89 for 2 nights • ★ 3.5
              </p>
            </div>
          </div>

          {/* Side Card (Right Preview) */}
          <div className="hidden md:block absolute -right-40 w-[420px] h-[260px] rounded-3xl overflow-hidden shadow-md opacity-70">
            <img
              src="https://images.unsplash.com/photo-1507089947368-19c1da9775ae"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Arrow */}
          <button className="absolute -right-10 bg-white shadow-md w-10 h-10 rounded-full flex items-center justify-center">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* ---------------- WAYS TO STAY ---------------- */}
        <div className="mt-24">
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
            image="https://images.unsplash.com/photo-1599076312465-f235771c623d"
            icon="/icons/africana-icon.svg"
            title="Africana"
            description="Rooted in heritage. Built with native materials and cultural design."
          />

          {/* Card 2 */}
          <CategoryCard
            image="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"
            icon="/icons/urban-icon.svg"
            title="Urban"
            description="Modern city homes designed for comfort and convenience."
          />

          {/* Card 3 */}
          <CategoryCard
            image="https://images.unsplash.com/photo-1662568804386-df831feb6c0c"
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
      <div className="relative rounded-2xl overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-64 object-cover"
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
        <h3 className="text-xl font-semibold text-neutral-900">
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