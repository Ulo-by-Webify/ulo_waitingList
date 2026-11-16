"use client";

import {
  EXPERIENCES_LIMITS,
  describeContentPath,
  experiencesContentSchema,
  type ExperiencesContent,
} from "@/lib/experiences-content";
import CollapsibleSection from "../CollapsibleSection";
import SaveBar from "../page-editor/SaveBar";
import { usePageEditor } from "../page-editor/usePageEditor";
import CardListEditor from "./CardListEditor";
import ImageField from "./ImageField";
import RowsEditor from "./RowsEditor";
import TextField from "./TextField";

type ExperiencesEditorProps = {
  initial: ExperiencesContent;
  isCustom: boolean;
  updatedLabel: string | null;
  canUpload: boolean;
};

/** Edits the whole /experiences page and saves it in one go. */
export default function ExperiencesEditor({ initial, isCustom, updatedLabel, canUpload }: ExperiencesEditorProps) {
  const editor = usePageEditor({
    initial,
    schema: experiencesContentSchema,
    endpoint: "/api/admin/experiences",
    pageName: "Experiences page",
    describePath: describeContentPath,
  });
  const { content, setContent, patch: set } = editor;

  const cardCount = content.rows.reduce((total, row) => total + row.cards.length, 0);

  return (
    <div className="space-y-6 pb-28">
      {editor.confirmDialog}

      <CollapsibleSection storageKey="experiences:hero" title="Hero" description="The full-screen photo and heading at the top of the page.">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <TextField label="Heading" value={content.hero.title} onChange={(title) => set("hero", { title })} maxLength={80} isRequired />
            <TextField
              label="Text"
              value={content.hero.subtitle}
              onChange={(subtitle) => set("hero", { subtitle })}
              maxLength={300}
              isMultiline
            />
          </div>
          <ImageField
            label="Background photo"
            value={content.hero.image}
            onChange={(image) => set("hero", { image })}
            canUpload={canUpload}
            hint="Landscape, at least 2400 × 1350 px. White text sits on top, so darker photos read best."
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        storageKey="experiences:showcase"
        title="Showcase"
        description="The rotating slideshow under the hero."
        badge={{ label: `${content.showcase.slides.length} slides` }}
      >
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Heading" value={content.showcase.title} onChange={(title) => set("showcase", { title })} maxLength={80} isRequired />
            <TextField label="Text" value={content.showcase.body} onChange={(body) => set("showcase", { body })} maxLength={500} isMultiline />
          </div>
          <CardListEditor
            cards={content.showcase.slides}
            onChange={(slides) => set("showcase", { slides })}
            noun="slide"
            max={EXPERIENCES_LIMITS.slides}
            canUpload={canUpload}
            shape="landscape"
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        storageKey="experiences:rows"
        title="Service rows"
        description="The scrolling rows of cards, such as Live Comfortably and Move With Ease."
        badge={{ label: `${content.rows.length} rows · ${cardCount} cards` }}
      >
        <RowsEditor rows={content.rows} onChange={(rows) => setContent((current) => ({ ...current, rows }))} canUpload={canUpload} />
      </CollapsibleSection>

      <CollapsibleSection storageKey="experiences:early-access" title="Get Early Access" description="The heading above the “Get Early Access →” button.">
        <TextField
          label="Heading"
          value={content.earlyAccess.title}
          onChange={(title) => set("earlyAccess", { title })}
          maxLength={160}
          hint="Leave blank to show only the button."
        />
      </CollapsibleSection>

      <CollapsibleSection storageKey="experiences:provider" title="Become a provider" description="The last section, inviting people to offer their services.">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <TextField label="Heading" value={content.provider.title} onChange={(title) => set("provider", { title })} maxLength={80} isRequired />
            <TextField
              label="Text"
              value={content.provider.subtitle}
              onChange={(subtitle) => set("provider", { subtitle })}
              maxLength={300}
              isMultiline
            />
            <TextField
              label="Link text"
              value={content.provider.linkLabel}
              onChange={(linkLabel) => set("provider", { linkLabel })}
              maxLength={40}
              isRequired
            />
          </div>
          <ImageField label="Photo" value={content.provider.image} onChange={(image) => set("provider", { image })} canUpload={canUpload} />
        </div>
      </CollapsibleSection>

      <SaveBar editor={editor} isCustom={isCustom} updatedLabel={updatedLabel} viewHref="/experiences" />
    </div>
  );
}
