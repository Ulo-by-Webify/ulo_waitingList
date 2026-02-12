// src/components/SectionHeader.tsx
import React from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  align = "left",
}) => {
  return (
    <div
      className={`max-w-6xl mx-auto px-6 ${
        align === "center" ? "text-center" : "text-left"
      }`}
    >
      <h2 className="text-4xl font-semibold text-gray-900">{title}</h2>
      {subtitle && (
        <p className="mt-4 text-lg text-gray-600 max-w-xl">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
