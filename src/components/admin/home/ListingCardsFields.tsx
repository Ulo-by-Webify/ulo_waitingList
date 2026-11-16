"use client";

import { useId } from "react";
import { HOME_LIMITS, type ListingCard } from "@/lib/home-content";
import { newItemId } from "@/lib/content-fields";
import { DEFAULT_COVER_IMAGE } from "@/lib/journal";
import { adminInputClass } from "../PasswordInput";
import ImageField from "../experiences/ImageField";
import TextField from "../experiences/TextField";
import ItemList from "../page-editor/ItemList";

type ListingCardsFieldsProps = {
  cards: ListingCard[];
  onChange: (cards: ListingCard[]) => void;
  canUpload: boolean;
};

const NEW_CARD_BACKGROUND = "#1F2937";

function StyleFields({ card, update }: { card: ListingCard; update: (patch: Partial<ListingCard>) => void }) {
  const styleId = useId();
  const colorId = useId();
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1">
        <label htmlFor={styleId} className="text-sm font-medium text-gray-700">
          Card style
        </label>
        <select
          id={styleId}
          value={card.style}
          onChange={(e) => update({ style: e.target.value as ListingCard["style"] })}
          className={`${adminInputClass} py-2.5`}
        >
          <option value="photo">Photo fills the card</option>
          <option value="icon">Icon on a colour</option>
        </select>
      </div>
      {card.style === "icon" && (
        <div className="space-y-1">
          <label htmlFor={colorId} className="text-sm font-medium text-gray-700">
            Background colour
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={card.background}
              onChange={(e) => update({ background: e.target.value.toUpperCase() })}
              aria-label="Pick background colour"
              className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-gray-200 bg-white p-1"
            />
            <input
              id={colorId}
              value={card.background}
              onChange={(e) => update({ background: e.target.value.trim() })}
              maxLength={7}
              placeholder="#5B3A29"
              className={`${adminInputClass} py-2.5 font-mono uppercase`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/** Cards in the "Africa is not a listing" carousel. */
export default function ListingCardsFields({ cards, onChange, canUpload }: ListingCardsFieldsProps) {
  return (
    <ItemList
      items={cards}
      onChange={onChange}
      noun="card"
      max={HOME_LIMITS.listingCards}
      createItem={() => ({
        id: newItemId("card"),
        title: "New card",
        subtitle: "",
        style: "photo" as const,
        image: DEFAULT_COVER_IMAGE,
        background: NEW_CARD_BACKGROUND,
      })}
      describe={(card) => card.title}
      renderFields={(card, update) => (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <TextField label="Title" value={card.title} onChange={(title) => update({ title })} maxLength={80} isRequired />
            <TextField label="Subtitle" value={card.subtitle} onChange={(subtitle) => update({ subtitle })} maxLength={160} />
            <StyleFields card={card} update={update} />
          </div>
          <ImageField
            label={card.style === "icon" ? "Icon" : "Photo"}
            value={card.image}
            onChange={(image) => update({ image })}
            canUpload={canUpload}
            hint={card.style === "icon" ? "A PNG or WebP with a transparent background works best." : undefined}
          />
        </div>
      )}
    />
  );
}
