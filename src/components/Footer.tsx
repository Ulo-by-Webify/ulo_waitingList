"use client";

import React from 'react';
import { SocialIcons } from '@/components/SocialLinksProvider';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#F7F1E8]">
      {/* Belonging statement */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-36 pb-10">
        <h3 className="text-4xl lg:text-5xl text-center font-bold text-gray-900 mb-3">
          Now you can belong <br />anywhere in Africa.
        </h3>
        <p className="text-xl text-center text-gray-600">
          Experience Africa from Inside.
        </p>
        <img src="/ulo-icon.png" alt="Ulo" className="h-16 mx-auto mt-16 mb-10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-400 pt-8 text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Ulo Africa LLC. All rights reserved.</p>
          <SocialIcons />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
