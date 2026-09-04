export interface ExperienceCardItem {
  title: string;
  subtitle: string;
  image: string;
}

export interface ExperienceCategory {
  id: string;
  title: string;
  subtitle: string;
  items: ExperienceCardItem[];
}

export interface ExperienceShowcaseSlide {
  id: number;
  caption: string;
  subtitle: string;
  image: string;
}

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?q=80&w=1200&auto=format&fit=crop`;

export const experiencesHeroImage = unsplash("1543269865-cbf427effbad");

export const experienceShowcaseSlides: ExperienceShowcaseSlide[] = [
  {
    id: 0,
    caption: "Feel Africa, not just visit",
    subtitle: "Care, culture, and connection — built into every stay.",
    image: unsplash("1523301343968-6a6ebf63c672"),
  },
  {
    id: 1,
    caption: "More than a place to stay",
    subtitle: "Local hospitality that feels like home, wherever you are.",
    image: "/Eden.jpg",
  },
  {
    id: 2,
    caption: "Every detail, thoughtfully handled",
    subtitle: "From arrival to departure, we take care of the little things.",
    image: "/Africanna.jpg",
  },
];

export const experienceCategories: ExperienceCategory[] = [
  {
    id: "live-comfortably",
    title: "Live Comfortably",
    subtitle: "Feel at home, with everything handled around you.",
    items: [
      {
        title: "Private Chef Experience",
        subtitle: "Meals prepared just for you, in your space",
        image: unsplash("1583394293214-28ded15ee548"),
      },
      {
        title: "Home Care & Laundry",
        subtitle: "Stay fresh without lifting a finger",
        image: unsplash("1556910103-1c02745aae4d"),
      },
      {
        title: "Private Security Support",
        subtitle: "Discreet, trusted protection when needed",
        image: unsplash("1552058544-f2b08422138a"),
      },
      {
        title: "In-Home Dining Setup",
        subtitle: "Curated meals for special moments",
        image: unsplash("1414235077428-338989a2e8c0"),
      },
    ],
  },
  {
    id: "move-with-ease",
    title: "Move With Ease",
    subtitle: "Navigate the city comfortably, confidently, and on your terms.",
    items: [
      {
        title: "City Driver",
        subtitle: "Move through the city with ease and local awareness",
        image: unsplash("1449965408869-eaa3f722e40d"),
      },
      {
        title: "Private Car Hire",
        subtitle: "Comfortable, on-demand mobility",
        image: unsplash("1502877338535-766e1452684a"),
      },
      {
        title: "Airport Pickup",
        subtitle: "Smooth arrivals, no friction",
        image: unsplash("1436491865332-7a61a109cc05"),
      },
      {
        title: "Coastal & Boat Experience",
        subtitle: "Explore beyond the shoreline",
        image: unsplash("1500375592092-40eb2168fd21"),
      },
      {
        title: "Helicopter Transfers",
        subtitle: "See the city from above",
        image: unsplash("1509316785289-025f5b846b35"),
      },
    ],
  },
  {
    id: "experience-more",
    title: "Experience More",
    subtitle: "Go beyond the surface and into the culture.",
    items: [
      {
        title: "Local Guide",
        subtitle: "Your connection to the real city",
        image: unsplash("1541963463532-d68292c34b19"),
      },
      {
        title: "Cultural Tours",
        subtitle: "Beyond landmarks, into stories",
        image: unsplash("1523805009345-7448845a9e53"),
      },
      {
        title: "Photography",
        subtitle: "Capture moments that matter",
        image: unsplash("1502920917128-1aa500764cbd"),
      },
      {
        title: "Event Planning",
        subtitle: "From intimate gatherings to full experiences",
        image: unsplash("1519167758481-83f550bb49b3"),
      },
      {
        title: "Food & Culinary Tours",
        subtitle: "Taste the culture, one dish at a time",
        image: unsplash("1504674900247-0877df9cc836"),
      },
    ],
  },
  {
    id: "feel-your-best",
    title: "Feel Your Best",
    subtitle: "Relax, reset, and restore.",
    items: [
      {
        title: "African Spa Rituals",
        subtitle: "Rooted relaxation and body care",
        image: unsplash("1544161515-4ab6ce6db874"),
      },
      {
        title: "African Yoga",
        subtitle: "Slow down, stretch, and reconnect",
        image: unsplash("1544367567-0f2fcb009e0b"),
      },
      {
        title: "Hair Styling",
        subtitle: "From everyday looks to cultural styling",
        image: unsplash("1560066984-138dadb4c035"),
      },
      {
        title: "Makeup Artistry",
        subtitle: "For events, special occasions, or shoots",
        image: unsplash("1487412720507-e7ab37603c6f"),
      },
      {
        title: "Barber Services",
        subtitle: "Sharp cuts, classic care",
        image: unsplash("1503951914875-452162b0f3f1"),
      },
    ],
  },
];
