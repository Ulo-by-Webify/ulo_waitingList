"use client";

import { HOME_LIMITS, type Place } from "@/lib/home-content";
import { newItemId } from "@/lib/content-fields";
import { DEFAULT_COVER_IMAGE } from "@/lib/journal";
import ImageField from "../experiences/ImageField";
import TextField from "../experiences/TextField";
import ItemList from "../page-editor/ItemList";

type PlacesFieldsProps = {
  places: Place[];
  onChange: (places: Place[]) => void;
  canUpload: boolean;
};

/** City cards in "Curated Places". */
export default function PlacesFields({ places, onChange, canUpload }: PlacesFieldsProps) {
  return (
    <ItemList
      items={places}
      onChange={onChange}
      noun="place"
      max={HOME_LIMITS.places}
      createItem={() => ({ id: newItemId("place"), city: "New city", country: "Country", countryCode: "ng", tagline: "", image: DEFAULT_COVER_IMAGE })}
      describe={(place) => place.city}
      renderFields={(place, update) => (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="City" value={place.city} onChange={(city) => update({ city })} maxLength={40} isRequired />
              <TextField label="Country" value={place.country} onChange={(country) => update({ country })} maxLength={40} isRequired />
            </div>
            <TextField
              label="Country code"
              value={place.countryCode.toUpperCase()}
              onChange={(code) => update({ countryCode: code.toLowerCase() })}
              maxLength={2}
              isRequired
              hint="Two letters, e.g. NG, GH, KE. Sets the flag."
            />
            <TextField label="Tagline" value={place.tagline} onChange={(tagline) => update({ tagline })} maxLength={80} />
          </div>
          <ImageField label="Photo" value={place.image} onChange={(image) => update({ image })} canUpload={canUpload} shape="portrait" />
        </div>
      )}
    />
  );
}
