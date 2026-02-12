// src/components/ExperienceSection.tsx
import React from "react";
import SectionHeader from "./SectionHeader";
import ExperienceCard from "./ExperienceCard";

const ExperienceSection: React.FC = () => {
  return (
    <section className="py-40 bg-gray-50">
      <SectionHeader
        title="Experience Ulô as a"
        align="center"
      />

      <div className="mt-16 flex flex-col md:flex-row justify-center items-center gap-10 px-6">
        <ExperienceCard
          icon="👤"
          title="Guest"
          description={
            <>
            Stay in curated spaces. <br />
            Feel culture, comfort, and connection.
            </>
          }
        />

        <ExperienceCard
          icon="🏠"
          title="Host"
          description={
            <>
            List your home on Ulô. <br />
            Earn confidently with trusted support.
            </>
          }
        />

        <ExperienceCard
            icon="🏺"
            title="Service"
            description={
                <>
                Render your services to Ulô guests. <br />
                Deliver quality. Earn reliably.
                </>
            }
        />
      </div>
    </section>
  );
};

export default ExperienceSection;