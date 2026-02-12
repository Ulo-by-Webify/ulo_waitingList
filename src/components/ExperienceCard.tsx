// src/components/ExperienceCard.tsx
import React from "react";

interface ExperienceCardProps {
  title: string;
  description: React.ReactNode;
  icon: string;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({
  title,
  description,
  icon,
}) => {
  return (
    <div className="relative border border-gray-300 hover:border-gray-500 rounded-3xl p-8 w-full max-w-sm bg-white transition">
      {/* Radio Circle */}
      <div className="absolute top-6 right-6 w-5 h-5 border border-gray-300 hover:border-gray-500 rounded-full"></div>

      {/* Icon */}
      <div className="text-4xl mb-6">{icon}</div>

      {/* Title */}
      <h3 className="text-3xl font-semibold text-gray-900">
        {title}
      </h3>

      {/* Description */}
      <p className="mt-4 text-gray-600 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default ExperienceCard;