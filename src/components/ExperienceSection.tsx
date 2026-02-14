// src/components/ExperienceSection.tsx
import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import SectionHeader from "./SectionHeader";
import ExperienceCard from "./ExperienceCard";
import MailerLiteModal from "@/components/mailer-lite/MailerLiteModal";

export interface HowToJoinSectionRef {
  scrollIntoView: (options?: ScrollIntoViewOptions) => void;
  highlightCards: () => void;
}

type UserType = "host" | "guest" | "associate";

const ExperienceSection = forwardRef<HowToJoinSectionRef>((_, ref) => {
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [highlight, setHighlight] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);

  const handleUserTypeClick = (type: UserType) => {
    setSelectedType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Expose functions via ref
  useImperativeHandle(ref, () => ({
    scrollIntoView: (options?: ScrollIntoViewOptions) => {
      sectionRef.current?.scrollIntoView(options);
    },
    highlightCards: () => {
      setHighlight(true);
      // Remove highlight after animation duration
      setTimeout(() => setHighlight(false), 1200);
    },
  }));

  return (
    <section ref={sectionRef} className="py-40 bg-gray-50">
      <SectionHeader title="Experience Ulô as a" align="center" />

      <div className="mt-16 flex flex-col md:flex-row justify-center items-center gap-10 px-6">
        <ExperienceCard
          icon="/icons/guest-icon.png"
          title="Guest"
          isActive={selectedType === "guest"}
          highlight={highlight}
          onClick={() => handleUserTypeClick("guest")}
          description={
            <>
              Stay in curated spaces. <br />
              Feel culture, comfort, and connection.
            </>
          }
        />

        <ExperienceCard
          icon="/icons/host-icon.png"
          title="Host"
          isActive={selectedType === "host"}
          highlight={highlight}
          onClick={() => handleUserTypeClick("host")}
          description={
            <>
              List your home on Ulô. <br />
              Earn confidently with trusted support.
            </>
          }
        />

        <ExperienceCard
          icon="/icons/service-icon.png"
          title="Associate"
          isActive={selectedType === "associate"}
          highlight={highlight}
          onClick={() => handleUserTypeClick("associate")}
          description={
            <>
              Represent Ulô globally. <br />
              Deliver quality. Earn reliably.
            </>
          }
        />
      </div>

      {selectedType && (
        <MailerLiteModal
          isOpen={isModalOpen}
          onClose={closeModal}
          userType={selectedType}
        />
      )}
    </section>
  );
});

export default ExperienceSection;