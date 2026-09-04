"use client";

// src/components/ExperienceCard.tsx
import React from "react";

interface ExperienceCardProps {
  title: string;
  description: React.ReactNode;
  icon: string;
  onClick?: () => void;
  isActive?: boolean;
  highlight?: boolean; // new optional prop for temporary highlight
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({
  title,
  description,
  icon,
  onClick,
  isActive = false,
  highlight = false, // default false
}) => {
  const isImage = icon.startsWith("/");

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-3xl p-8 w-full max-w-sm bg-white cursor-pointer transition-all duration-300
        ${
          isActive
            ? "border border-gray-700 shadow-lg"
            : "border border-gray-300 hover:border-gray-500"
        }
        ${highlight ? "ring-4 ring-primary/50 shadow-2xl transform scale-105" : ""}
      `}
    >
      {/* Radio Circle */}
      <div
        className={`absolute top-6 right-6 w-6 h-6 rounded-full border transition-all duration-300
          ${
            isActive
              ? "border-gray-700 bg-gray-700"
              : "border-gray-300 group-hover:border-gray-500"
          }
        `}
      />

      {/* Icon */}
      <div className="mb-20">
        {isImage ? (
          <img
            src={icon}
            alt={title}
            className="w-16 h-16 object-contain"
          />
        ) : (
          <span className="text-4xl">{icon}</span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-3xl font-semibold text-gray-900">{title}</h3>

      {/* Description */}
      <p className="mt-4 text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

export default ExperienceCard;