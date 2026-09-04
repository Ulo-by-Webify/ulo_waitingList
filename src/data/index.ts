import { HeroContent, BusinessSlide, FlippedSlide, JournalFeaturedStory, JournalStory } from "@/types";

export const heroContent: HeroContent = {
  title: "Stand out on Ulo with a free Business Profile",
  description:
    "Stay in soulful homes. Participate in local festivals. Experience Africa beyond tourism.",
  videoUrl: "/videos/ULÔ_SHORT_FILM.mp4",
};

export const businessSlides: BusinessSlide[] = [
  {
    id: 0,
    title: "Hands-Free Management",
    description:
      "Earn without the effort. We handle bookings, cleaning, and guest support — so you can relax, travel, or focus on what matters.",
    videoUrl:
      "https://res.cloudinary.com/dfcsaxtru/video/upload/q_40/v1752930081/HOST_XPE-_zjlufk.mp4",
  },
  {
    id: 1,
    title: "Xperience Reels",
    description:
      "See it before you stay. Watch real videos from past guests and hosts to feel the vibe, explore the space, and book with confidence.",
    videoUrl:
      "https://res.cloudinary.com/dfcsaxtru/video/upload/q_40/v1752930082/XPERIENCE_REELS_zg6mrp.mp4",
  },
  {
    id: 2,
    title: "Ulô Associates",
    description:
      "Don’t just visit — connect. Our trusted on-ground associates help you explore, belong, and make the most of every moment in Africa.",
    videoUrl:
      "/videos/ULÔ-ASSOCIATE.mp4",
  },
  {
    id: 3,
    title: "Local Payment, Global Ease",
    description:
      "Pay in your own currency, and earn in yours. Ulô makes transactions smooth and secure — no stress, no conversion headaches.",
    videoUrl:
      "https://res.cloudinary.com/dfcsaxtru/video/upload/q_40/v1752584118/PAYMENT_xomfml.mp4",
  },
];

export const flippedSlides: FlippedSlide[] = [
  {
    id: 0,
    title: "Private Car & Airport Transfers",
    description:
      "Arrive and explore stress-free. Reliable cars, self-drive or chauffeur, with smooth airport pickup & drop-off.",
    contentType: "component",
    icon: "/icons/CAR.png",
    spotlightTitle: "Airport Pick-up and Drop-off or Personal Ride",
    spotlightDescription: "Airport Pick-up and Drop-off or Personal Ride.",
  },
  {
    id: 1,
    title: "Private Chef Experience",
    description:
      "Taste Africa and beyond. Certified chefs craft gourmet meals tailored to your cravings — right in your home.",
    contentType: "component",
    icon: "/icons/HELICOPTER.png",
    spotlightTitle: "Luxury transfers and scenic aerial tours",
    spotlightDescription: "Luxury transfers and scenic aerial tours.",
  },
  {
    id: 2,
    title: "Herbal Spa & Wellness",
    description:
      "Rebalance body & soul. Traditional massages, herbal therapies, and natural skincare rituals at your doorstep.",
    contentType: "component",
    icon: "/icons/SECURITY.png",
    spotlightTitle: "Professional personal protection and security",
    spotlightDescription: "Professional personal protection and security.",
  },
  {
    id: 3,
    title: " Laundry & Garment Care",
    description:
      "Stay fresh, effortlessly. Premium laundry with quick pick-up & delivery during your stay.",
    contentType: "component",
    icon: "/icons/HEBARL CARE.png",
    spotlightTitle: "Traditional African wellness and healing treatments",
    spotlightDescription:
      "Traditional African wellness and healing treatments.",
  },
  {
    id: 4,
    title: "Personal Security",
    description:
      "Peace of mind, always. Trusted local escorts ensure safety wherever you go.",
    contentType: "component",
    icon: "/icons/LAUNDARY.png",
    spotlightTitle: "Premium garment care and cleaning services",
    spotlightDescription: "Premium garment care and cleaning services.",
  },
  {
    id: 5,
    title: "African-Inspired Yoga",
    description:
      "Stretch, breathe, and flow. Guided yoga infused with African rhythms and soul.",
    contentType: "component",
    icon: "/icons/CHEF.png",
    spotlightTitle: "Professional culinary services for any occasion",
    spotlightDescription: "Professional culinary services for any occasion.",
  },
  {
    id: 6,
    title: " Helicopter Rides",
    description:
      "See Africa from the sky. Luxury transfers and breathtaking scenic tours above city and nature.",
    contentType: "component",
    icon: "/icons/YOGA.png",
    spotlightTitle: "Personalized yoga and wellness sessions",
    spotlightDescription: "Personalized yoga and wellness sessions.",
  },
];

export const journalFeaturedStories: JournalFeaturedStory[] = [
  {
    id: 0,
    tag: "Featured",
    title: "Inside a Lagos Home That Feels Like a Retreat",
    description:
      "Step into a space where design, culture, and quiet living come together, and discover how modern African homes are redefining comfort.",
    image: "/Urban.jpg",
    href: "/journal/thoughtfully-designed-african-home",
  },
  {
    id: 1,
    tag: "Featured",
    title: "The Coastal Towns Rewriting Africa's Story",
    description:
      "From Accra to Zanzibar, a new wave of coastal communities is blending heritage and hospitality into unforgettable stays.",
    image: "/Eden.jpg",
    href: "/journal/top-cultural-festivals-in-africa-2026",
  },
  {
    id: 2,
    tag: "Featured",
    title: "What It Means to Belong, Wherever You Land",
    description:
      "A closer look at the people and places turning short stays into lasting connections across the continent.",
    image: "/Africanna.jpg",
    href: "/journal/aso-ebi-nigerian-culture-today",
  },
];

export const journalStories: JournalStory[] = [
  {
    id: 0,
    slug: "aso-ebi-nigerian-culture-today",
    title: "What Is Aso-Ebi and Why It Matters in Nigerian Culture Today",
    excerpt:
      "More than coordinated outfits, Aso-Ebi reflects identity, belonging, and a shared language of celebration across communities.",
    image: "/Africanna.jpg",
    category: "Culture",
    date: "Mar 8, 2026",
    author: "Tunde Balogun",
    href: "/journal/aso-ebi-nigerian-culture-today",
    badge: "Open Story",
    likes: 17,
    commentsCount: 95,
    shares: 901,
    content: [
      {
        type: "paragraph",
        text: "If you have ever attended a Nigerian wedding, funeral, or milestone birthday, you have likely been swept up in a sea of vibrant, coordinated colors and intricate patterns. This isn't a coincidence; it is **Aso-Ebi.**",
      },
      {
        type: "paragraph",
        text: 'Derived from the Yoruba words Aso (cloth) and Ebi (family), Aso-Ebi literally translates to "family cloth." However, in modern Nigeria, its reach extends far beyond bloodlines. It is a premium lifestyle statement, a visual symphony of solidarity, and the ultimate "access layer" to the heart of African celebration.',
      },
      { type: "heading", text: 'The Evolution of the "Family Cloth"' },
      {
        type: "paragraph",
        text: 'Historically, Aso-Ebi was a way for family members to identify one another during large communal events. It served as a uniform of kinship. Today, while it still honors those roots, it has evolved into a sophisticated social phenomenon. It is now a shared language used by friends, colleagues, and social circles to say, "I am with them."',
      },
      {
        type: "paragraph",
        text: "To wear the chosen fabric is to move from being an observer to being a participant. It is the difference between watching a story and living it.",
      },
      { type: "heading", text: "Why Aso-Ebi Matters: The Pillars of Belonging" },
      {
        type: "paragraph",
        text: 'Aso-Ebi is often misunderstood by outsiders as a mere "dress code." In reality, it serves several deep-seated cultural functions:',
      },
      {
        type: "list",
        items: [
          "**Visual Solidarity:** When a group of a hundred people enters a room wearing the same lace or Ankara, it creates an immediate sense of power and unity. It shows the world that the celebrant is loved and supported.",
          '**Identity and Status:** The choice of fabric—ranging from high-end Swiss lace to hand-loomed Aso-Oke—communicates the prestige of the event. It is a display of "quiet luxury" rooted in tradition.',
          "**Economic Ecosystem:** The Aso-Ebi culture supports a massive network of local artisans, from the textile traders to the tailors who bring each outfit to life, sustaining local economies with every celebration.",
        ],
      },
    ],
  },
  {
    id: 1,
    slug: "top-cultural-festivals-in-africa-2026",
    title: "Top Cultural Festivals in Africa You Should Experience in 2026",
    excerpt:
      "From vibrant street celebrations to deeply rooted traditions, these festivals offer more than spectacle, they bring you into the rhythm, energy, and…",
    image: "/Eden.jpg",
    category: "Travel",
    date: "Mar 10, 2026",
    author: "Adaeze Okonkwo",
    href: "/journal/top-cultural-festivals-in-africa-2026",
    likes: 12,
    commentsCount: 41,
    shares: 236,
  },
  {
    id: 2,
    slug: "thoughtfully-designed-african-home",
    title: "What It Truly Feels Like to Stay in a Thoughtfully Designed African Home",
    excerpt:
      "Step into spaces where design meets culture, and where living becomes more personal, slower, and deeply connected to place.",
    image: "/Urban.jpg",
    category: "Living",
    date: "Mar 18, 2026",
    author: "Alexandra Tope",
    href: "/journal/thoughtfully-designed-african-home",
    likes: 9,
    commentsCount: 22,
    shares: 118,
  },
  {
    id: 3,
    slug: "food-stories-memory-identity",
    title: "The Dishes That Carry Stories, Memory, and Cultural Identity",
    excerpt:
      "From shared tables to quiet meals, African food is more than taste, it's a reflection of history, people, and connection.",
    image: "/thumbnail.jpg",
    category: "Food",
    date: "Mar 25, 2026",
    author: "Alexandra Tope",
    href: "/journal/food-stories-memory-identity",
    likes: 14,
    commentsCount: 33,
    shares: 174,
  },
  {
    id: 4,
    slug: "moving-through-the-city-with-ease",
    title: "Moving Through the City with Ease, Comfort, and a Sense of Control",
    excerpt:
      "The way you move shapes your experience, from the ride you choose to the comfort and calm it brings along the journey.",
    category: "Movement",
    date: "Jun 24, 2026",
    author: "Alexandra Tope",
    href: "/journal/moving-through-the-city-with-ease",
    likes: 6,
    commentsCount: 11,
    shares: 58,
  },
  {
    id: 5,
    slug: "meaning-behind-aso-ebi-nigerian-weddings",
    title: "The Meaning Behind Aso-Ebi at Nigerian Weddings",
    excerpt:
      "More than fashion, it's a language of belonging, celebration, and identity.",
    category: "Culture",
    date: "Jun 24, 2026",
    author: "Alexandra Tope",
    href: "/journal/meaning-behind-aso-ebi-nigerian-weddings",
    likes: 15,
    commentsCount: 27,
    shares: 132,
  },
  {
    id: 6,
    slug: "ulo-associates-turn-stays-into-stories",
    title: "How Ulô Associates Turn Stays Into Stories",
    excerpt:
      "Meet the certified professionals behind the scenes, guiding guests from arrival to unforgettable departure.",
    category: "People",
    date: "Jul 2, 2026",
    author: "Tunde Balogun",
    href: "/journal/ulo-associates-turn-stays-into-stories",
    likes: 8,
    commentsCount: 14,
    shares: 76,
  },
  {
    id: 7,
    slug: "markets-makers-slow-travel",
    title: "Markets, Makers, and the Art of Slow Travel",
    excerpt:
      "Skip the checklist. The best way to know a city is to wander its markets and talk to the people who built it.",
    category: "Travel",
    date: "Jul 9, 2026",
    author: "Adaeze Okonkwo",
    href: "/journal/markets-makers-slow-travel",
    likes: 10,
    commentsCount: 19,
    shares: 94,
  },
  {
    id: 8,
    slug: "borderless-payments-ulo-cowries",
    title: "Borderless Payments, Local Currency: How Ulô Cowries Work",
    excerpt:
      "A simple guide to paying, sharing, and withdrawing with Ulô Cowries, wherever your journey takes you.",
    category: "Guides",
    date: "Jul 15, 2026",
    author: "Alexandra Tope",
    href: "/journal/borderless-payments-ulo-cowries",
    likes: 11,
    commentsCount: 16,
    shares: 87,
  },
];
