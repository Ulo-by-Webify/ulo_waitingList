"use client";

import { HOME_PHOTO_LABELS, HOME_PHOTO_SLOTS, type HomeContent, type HomePhotoSlot } from "@/lib/home-content";
import ImageField from "../experiences/ImageField";
import TextField from "../experiences/TextField";

type Photos = HomeContent["homes"]["photos"];

type HomesPhotosFieldsProps = {
  photos: Photos;
  onChange: (photos: Photos) => void;
  canUpload: boolean;
};

const PORTRAIT_SLOTS: ReadonlySet<HomePhotoSlot> = new Set(["tall"]);

/** The five fixed spots in the "Find Homes With Soul" photo grid. */
export default function HomesPhotosFields({ photos, onChange, canUpload }: HomesPhotosFieldsProps) {
  const update = (slot: HomePhotoSlot, patch: Partial<Photos[HomePhotoSlot]>) =>
    onChange({ ...photos, [slot]: { ...photos[slot], ...patch } });

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {HOME_PHOTO_SLOTS.map((slot) => (
        <div key={slot} className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/60 p-4">
          <ImageField
            label={HOME_PHOTO_LABELS[slot]}
            value={photos[slot].image}
            onChange={(image) => update(slot, { image })}
            canUpload={canUpload}
            shape={PORTRAIT_SLOTS.has(slot) ? "portrait" : "landscape"}
          />
          <TextField
            label="Description"
            value={photos[slot].alt}
            onChange={(alt) => update(slot, { alt })}
            maxLength={120}
            hint="Read aloud by screen readers. Describe what's in the photo."
          />
        </div>
      ))}
    </div>
  );
}
