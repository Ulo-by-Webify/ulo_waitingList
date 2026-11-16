"use client";

import React from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import NotAListingSection from "@/components/NotAListingSection";
import VideoShowcaseSection from "@/components/VideoShowcaseSection";
import Footer from "@/components/Footer";
import ScrollDotsSection from "@/components/ScrollDotsSection";
import CloserBanner from "@/components/CloserBanner";
import CuratedPlacesSection from "@/components/CuratedPlacesSection";
import HomesWithSoulSection from "@/components/HomesWithSoulSection";
import type { HomeContent } from "@/lib/home-content";

type IndexClientProps = {
  /** Homepage text and images, edited on the admin Home page. */
  content: HomeContent;
};

const IndexClient = ({ content }: IndexClientProps) => {

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="">
        <HeroSection hero={content.hero} />

        <NotAListingSection listing={content.listing} />

        <ScrollDotsSection title={content.introducing.title} subtitle={content.introducing.subtitle} />

        <CloserBanner title={content.closer.title} image={content.closer.image} />

        <VideoShowcaseSection showcase={content.showcase} />

        <CuratedPlacesSection places={content.places} />

        <HomesWithSoulSection homes={content.homes} />

        <Footer />
      </div>
      {/* 
      <MusicToggleButton containerClassName="fixed left-8 bottom-8 z-50 hover:opacity-100 opacity-70" /> */}
    </div>
  );
};

export default IndexClient;
