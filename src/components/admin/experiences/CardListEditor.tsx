"use client";

import { newItemId, type ExperienceCard } from "@/lib/experiences-content";
import { DEFAULT_COVER_IMAGE } from "@/lib/journal";
import ItemList from "../page-editor/ItemList";
import ImageField from "./ImageField";
import TextField from "./TextField";

type CardListEditorProps = {
  cards: ExperienceCard[];
  onChange: (cards: ExperienceCard[]) => void;
  /** "card" or "slide", used in labels. */
  noun: string;
  max: number;
  canUpload: boolean;
  shape: "landscape" | "portrait";
};

/** Edits an ordered list of image cards (title, subtitle, photo). */
export default function CardListEditor({ cards, onChange, noun, max, canUpload, shape }: CardListEditorProps) {
  return (
    <ItemList
      items={cards}
      onChange={onChange}
      noun={noun}
      max={max}
      createItem={() => ({ id: newItemId(noun), title: `New ${noun}`, subtitle: "", image: DEFAULT_COVER_IMAGE })}
      describe={(card) => card.title}
      renderFields={(card, update) => (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <TextField label="Title" value={card.title} onChange={(title) => update({ title })} maxLength={80} isRequired />
            <TextField label="Subtitle" value={card.subtitle} onChange={(subtitle) => update({ subtitle })} maxLength={160} />
          </div>
          <ImageField label="Photo" value={card.image} onChange={(image) => update({ image })} canUpload={canUpload} shape={shape} />
        </div>
      )}
    />
  );
}
