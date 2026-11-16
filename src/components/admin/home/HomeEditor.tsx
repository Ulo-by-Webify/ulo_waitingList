"use client";

import { describeHomePath, homeContentSchema, type HomeContent } from "@/lib/home-content";
import CollapsibleSection from "../CollapsibleSection";
import ImageField from "../experiences/ImageField";
import TextField from "../experiences/TextField";
import VideoField from "../experiences/VideoField";
import SaveBar from "../page-editor/SaveBar";
import { usePageEditor } from "../page-editor/usePageEditor";
import HomesPhotosFields from "./HomesPhotosFields";
import ListingCardsFields from "./ListingCardsFields";
import PlacesFields from "./PlacesFields";

type HomeEditorProps = {
  initial: HomeContent;
  isCustom: boolean;
  updatedLabel: string | null;
  canUpload: boolean;
};

const TWO_COLUMNS = "grid gap-4 md:grid-cols-2";

/** Edits the text and images of every homepage section and saves them in one go. */
export default function HomeEditor({ initial, isCustom, updatedLabel, canUpload }: HomeEditorProps) {
  const editor = usePageEditor({
    initial,
    schema: homeContentSchema,
    endpoint: "/api/admin/home",
    pageName: "homepage",
    describePath: describeHomePath,
  });
  const { content, patch } = editor;
  const { hero, listing, introducing, closer, showcase, places, homes } = content;

  return (
    <div className="space-y-6 pb-28">
      {editor.confirmDialog}

      <CollapsibleSection storageKey="home:hero" title="Hero" description="The full-screen video and heading at the top of the page.">
        <div className="space-y-4">
          <VideoField
            label="Background video"
            value={hero.video}
            onChange={(video) => patch("hero", { video })}
            canUpload={canUpload}
            hint="Plays silently on a loop behind the heading. Keep it short and small (under 15 MB) so the page loads fast."
          />
          <div className={TWO_COLUMNS}>
            <TextField label="Heading" value={hero.title} onChange={(title) => patch("hero", { title })} maxLength={60} isRequired />
            <TextField
              label="Second line"
              value={hero.emphasis}
              onChange={(emphasis) => patch("hero", { emphasis })}
              maxLength={40}
              hint="Shown larger and lighter under the heading, e.g. “Experience it.”"
            />
          </div>
          <TextField label="Text" value={hero.text} onChange={(text) => patch("hero", { text })} maxLength={300} isMultiline />
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        storageKey="home:listing"
        title="Africa is not a listing"
        description="The heading and scrolling cards under the hero."
        badge={{ label: `${listing.cards.length} cards` }}
      >
        <div className="space-y-5">
          <div className={TWO_COLUMNS}>
            <TextField label="Heading" value={listing.titleLine1} onChange={(titleLine1) => patch("listing", { titleLine1 })} maxLength={60} isRequired />
            <TextField label="Heading second line" value={listing.titleLine2} onChange={(titleLine2) => patch("listing", { titleLine2 })} maxLength={60} />
            <TextField label="Text" value={listing.subtitle} onChange={(subtitle) => patch("listing", { subtitle })} maxLength={200} />
            <TextField
              label="Button text"
              value={listing.linkLabel}
              onChange={(linkLabel) => patch("listing", { linkLabel })}
              maxLength={40}
              isRequired
              hint="Scrolls down to Curated Places."
            />
          </div>
          <ListingCardsFields cards={listing.cards} onChange={(cards) => patch("listing", { cards })} canUpload={canUpload} />
        </div>
      </CollapsibleSection>

      <CollapsibleSection storageKey="home:introducing" title="Introducing Ulô" description="The heading above the plane-to-Africa path.">
        <div className={TWO_COLUMNS}>
          <TextField label="Heading" value={introducing.title} onChange={(title) => patch("introducing", { title })} maxLength={60} isRequired />
          <TextField label="Text" value={introducing.subtitle} onChange={(subtitle) => patch("introducing", { subtitle })} maxLength={120} />
        </div>
      </CollapsibleSection>

      <CollapsibleSection storageKey="home:closer" title="Every step brings you closer" description="The full-width photo with curved edges.">
        <div className="grid gap-5 lg:grid-cols-2">
          <TextField label="Heading" value={closer.title} onChange={(title) => patch("closer", { title })} maxLength={80} isRequired />
          <ImageField
            label="Background photo"
            value={closer.image}
            onChange={(image) => patch("closer", { image })}
            canUpload={canUpload}
            hint="Landscape, at least 2400 × 1200 px. White text sits on top, so darker photos read best."
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection storageKey="home:showcase" title="This Is Africa" description="The heading, text and film.">
        <div className="space-y-4">
          <TextField label="Heading" value={showcase.title} onChange={(title) => patch("showcase", { title })} maxLength={60} isRequired />
          <div className={TWO_COLUMNS}>
            <TextField label="First line" value={showcase.line1} onChange={(line1) => patch("showcase", { line1 })} maxLength={120} />
            <TextField label="Second line" value={showcase.line2} onChange={(line2) => patch("showcase", { line2 })} maxLength={120} />
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <VideoField
              label="Film"
              value={showcase.film}
              onChange={(film) => patch("showcase", { film })}
              canUpload={canUpload}
              hint="Plays with sound when someone presses play."
            />
            <VideoField
              label="Preview loop"
              value={showcase.previewVideo}
              onChange={(previewVideo) => patch("showcase", { previewVideo })}
              canUpload={canUpload}
              hint="Short silent loop shown behind the play button."
            />
            <ImageField
              label="Poster image"
              value={showcase.poster}
              onChange={(poster) => patch("showcase", { poster })}
              canUpload={canUpload}
              hint="Shown while the videos load."
            />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        storageKey="home:places"
        title="Curated Places"
        description="“Begin Somewhere Meaningful” and the scrolling city cards."
        badge={{ label: `${places.items.length} places` }}
      >
        <div className="space-y-5">
          <div className={TWO_COLUMNS}>
            <TextField label="Tag" value={places.tag} onChange={(tag) => patch("places", { tag })} maxLength={40} hint="The small pill above the heading." />
            <TextField label="Heading" value={places.title} onChange={(title) => patch("places", { title })} maxLength={80} isRequired />
            <TextField label="Text" value={places.body} onChange={(body) => patch("places", { body })} maxLength={400} isMultiline />
            <TextField
              label="Link text"
              value={places.linkLabel}
              onChange={(linkLabel) => patch("places", { linkLabel })}
              maxLength={40}
              isRequired
              hint="Links to Begin your journey."
            />
          </div>
          <PlacesFields places={places.items} onChange={(items) => patch("places", { items })} canUpload={canUpload} />
        </div>
      </CollapsibleSection>

      <CollapsibleSection storageKey="home:homes" title="Find Homes With Soul" description="The photo grid of homes.">
        <div className="space-y-5">
          <div className={TWO_COLUMNS}>
            <TextField label="Heading" value={homes.title} onChange={(title) => patch("homes", { title })} maxLength={80} isRequired />
            <TextField label="Text" value={homes.subtitle} onChange={(subtitle) => patch("homes", { subtitle })} maxLength={200} />
          </div>
          <HomesPhotosFields photos={homes.photos} onChange={(photos) => patch("homes", { photos })} canUpload={canUpload} />
          <div className={TWO_COLUMNS}>
            <TextField
              label="Caption heading"
              value={homes.captionTitle}
              onChange={(captionTitle) => patch("homes", { captionTitle })}
              maxLength={120}
              hint="Under the bottom-right photo."
            />
            <TextField label="Caption text" value={homes.captionText} onChange={(captionText) => patch("homes", { captionText })} maxLength={160} />
            <TextField
              label="Link text"
              value={homes.linkLabel}
              onChange={(linkLabel) => patch("homes", { linkLabel })}
              maxLength={40}
              isRequired
              hint="Links to Begin your journey."
            />
          </div>
        </div>
      </CollapsibleSection>

      <SaveBar editor={editor} isCustom={isCustom} updatedLabel={updatedLabel} viewHref="/" />
    </div>
  );
}
