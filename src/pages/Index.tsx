import React, { useRef } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import VideoShowcaseSection from "@/components/VideoShowcaseSection";
import VideoContentSection from "@/components/VideoContentSection";
import Footer from "@/components/Footer";
import ScrollDotsSection from "@/components/ScrollDotsSection";
import { heroContent } from "@/data";
import { useIsMobile } from "@/hooks/use-mobile";
import ServicesCarousel from "@/components/ServicesCarousel";
import ExperienceSection, { HowToJoinSectionRef } from "@/components/ExperienceSection";

const Index = () => {

  const experienceRef = useRef<HowToJoinSectionRef>(null);

  const isMobile = useIsMobile();
  console.log(isMobile);
  return (
    <div className="min-h-screen bg-white">
      <Header howToJoinSectionRef={experienceRef} />

      <div className="">
        <HeroSection heroContent={heroContent} />

        <VideoShowcaseSection heroContent={heroContent} />

        <ScrollDotsSection />

          <VideoContentSection
            title1="Hands‑Free Management"
            subtitle1="From bookings and cleaning to check-outs, Ulô takes care of every detail—so you earn effortlessly while we manage everything."
            video1="/icons/hands-free.png"
            media1ClassName="w-[300px] md:w-[500px] object-contain mx-auto"
            title2="Focus on what matters most"
            subtitle2="From messages to check-ins, calendars to care, we take care of everything for you."
            video2="/videos/new/HANNDSFREE-MANAGEMENT.mp4"
            media2ClassName="w-full max-h-[320px] md:max-h-[520px] object-contain"
            listItems={[
              "Human-managed bookings and updates.",
              "24/7 guest support from trained professionals.",
              "Seamless check-in, check-out and cleaning.",
            ]}
            sectionId="handsfree-section"
          />

          
          <VideoContentSection
            title1="Xperience Gallery"
            subtitle1="From vibrant cities to cultural local events, capture and save meaningful moments throughout your journey—making every trip unforgettable."
            video1="/xperience-gallery.png"
            media1WrapperClassName="relative overflow-hidden"
            media1ClassName="w-full lg:w-[550px] h-[650px] object-cover object-top mx-auto"
            title2="See the soul of every stay"
            subtitle2="Your journey is richer when every experience and special moment is captured."
            video2="/videos/new/XPERIENCE-GALLERY.mp4"
            media2ClassName="w-full max-h-[320px] md:max-h-[520px] object-contain"
            listItems={[
              "Create your own city experience album.",
              "See past guest experiences before booking.",
              "Get inspired by local experiences for your next trip.",
            ]}
            sectionId="xperience-section"
            bottomFade={true}
            backgroundClassName="bg-gray-50"
          />


        <VideoContentSection
          title1="Borderless Payment"
          subtitle1="Ulô Cowries makes every transaction, from booking to last-minute extras, simple, seamless, and secure."
          video1="/icons/coweries.png"
          media1ClassName="w-[300px] md:w-[500px] object-contain mx-auto"
          title2="Seamless Journeys, Simple Payments"
          subtitle2="Ulô Cowries enables you to focus stays on the adventure, not the transaction."
          video2="/cowries-wallet.png"
          media2ClassName="w-full lg:w-[550px] max-h-[320px] md:max-h-[520px] object-contain"
          listItems={[
            "Convert with USD valuation—1 ACW = 1 USD.",
            "Share Cowries easily with family & friends.",
            "Withdraw in any African currency with ease.",
          ]}
          sectionId="borderless-section"
        />

        <VideoContentSection
          title1="Ulô Associates"
          subtitle1="A trained and certified professional dedicated to ensuring your stay is prepared, seamless, and fully supported—from arrival to checkout."
          video1="/icons/ulo-associates.png"
          media1ClassName="w-[300px] md:w-[500px] object-contain mx-auto"
          title2="Feel the city, not the stress"
          subtitle2="Welcomes you like family and supported every step for a truly effortless stay."
          video2="/icons/ulo-badge.png"
          media2ClassName="w-full max-h-[320px] md:max-h-[520px] object-contain"
          listItems={[
            " Arrive to a fully prepared, clean home.",
            " Enjoy a smooth, stress-free stay.",
            " Get reliable 24/7 professional support.",
          ]}
          sectionId="associates-section"
          backgroundClassName="bg-gray-50"
        />

        <VideoContentSection
          title1="Guest Navbook"
          subtitle1="Your ultimate guide to every stay. Explore neighborhoods, discover local secrets, and navigate Africa with confidence."
          video1="/icons/navbook.png"
          media1ClassName="w-[300px] md:w-[500px] object-contain mx-auto"
          title2="Navigate the city like a local"
          subtitle2="Get insider tips and local know-how to explore every corner with confidence."
          video2="/guest-navbook.png"
          media2ClassName="w-full max-h-[320px] md:max-h-[520px] object-contain"
          listItems={[
            "Know where to eat, shop, and explore safely.",
            "Access hidden spots and authentic cultural experiences.",
            "Access help when needed.",
          ]}
          sectionId="navbook-section"
        />

        <VideoContentSection
            title1="Triplink"
            subtitle1="Turn every group trip into a seamless, shared experience. Plan together, manage logistics, and capture memories."
            video1="/icons/triplinkicon.png"
            media1WrapperClassName="relative overflow-hidden"
            media1ClassName="w-full lg:w-[450px] h-[450px] object-cover object-top mx-auto"
            title2="Create good memories together"
            subtitle2="Turn every trip into shared stories, laughter, and moments you’ll never forget."
            video2="/videos/new/TRIPLINK.mp4"
            media2ClassName="w-full max-h-[320px] md:max-h-[520px] object-contain"
            listItems={[
              "Invite friends, manage plans, stay in sync.",
              "Pool funds and track payments easily.",
              "Save and share itineraries and memories.",
            ]}
            sectionId="triplink-section"
            backgroundClassName="bg-gray-50"
          />

        <ServicesCarousel sectionId="services-section" />

        <ExperienceSection ref={experienceRef} />

        <Footer />
      </div>
      {/* 
      <MusicToggleButton containerClassName="fixed left-8 bottom-8 z-50 hover:opacity-100 opacity-70" /> */}
    </div>
  );
};

export default Index;
