"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import { EXPERIENCES_LIMITS, newItemId, type ExperienceRow } from "@/lib/experiences-content";
import { DEFAULT_COVER_IMAGE } from "@/lib/journal";
import { useConfirm } from "../ConfirmDialog";
import { ItemControls } from "../page-editor/ItemList";
import CardListEditor from "./CardListEditor";
import TextField from "./TextField";
import { move, removeAt, replaceAt } from "./list-utils";

type RowsEditorProps = {
  rows: ExperienceRow[];
  onChange: (rows: ExperienceRow[]) => void;
  canUpload: boolean;
};

function newRow(): ExperienceRow {
  return {
    id: newItemId("row"),
    title: "New row",
    subtitle: "",
    cards: [{ id: newItemId("card"), title: "New card", subtitle: "", image: DEFAULT_COVER_IMAGE }],
  };
}

/** Edits the service rows (e.g. "Live Comfortably", "Move With Ease") and the cards in each. */
export default function RowsEditor({ rows, onChange, canUpload }: RowsEditorProps) {
  const [confirm, confirmDialog] = useConfirm();
  const update = (index: number, patch: Partial<ExperienceRow>) => onChange(replaceAt(rows, index, { ...rows[index], ...patch }));

  async function remove(index: number) {
    const confirmed = await confirm({
      title: `Remove “${rows[index].title || `row ${index + 1}`}”?`,
      description: `This removes the row and its ${rows[index].cards.length} cards from the editor. Nothing changes on the site until you save.`,
      confirmLabel: "Remove row",
    });
    if (confirmed) onChange(removeAt(rows, index));
  }

  return (
    <div className="space-y-5">
      {confirmDialog}
      {rows.length === 0 && (
        <p className="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
          No service rows. The page goes straight from the showcase to “Get Early Access”.
        </p>
      )}

      {rows.map((row, index) => (
        <div key={row.id} className="rounded-2xl border border-gray-200 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900">
              Row {index + 1}
              {index === 0 && <span className="font-normal text-gray-400"> · shows the “Be Among the First →” link</span>}
            </p>
            <ItemControls
              label={`row ${index + 1}`}
              index={index}
              count={rows.length}
              minCount={0}
              onMove={(direction) => onChange(move(rows, index, direction))}
              onRemove={() => remove(index)}
            />
          </div>
          <div className="mb-5 grid gap-4 md:grid-cols-2">
            <TextField label="Row title" value={row.title} onChange={(title) => update(index, { title })} maxLength={80} isRequired />
            <TextField
              label="Row subtitle"
              value={row.subtitle}
              onChange={(subtitle) => update(index, { subtitle })}
              maxLength={200}
            />
          </div>
          <CardListEditor
            cards={row.cards}
            onChange={(cards) => update(index, { cards })}
            noun="card"
            max={EXPERIENCES_LIMITS.cardsPerRow}
            canUpload={canUpload}
            shape="portrait"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...rows, newRow()])}
        disabled={rows.length >= EXPERIENCES_LIMITS.rows}
        className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
      >
        <PlusIcon className="h-4 w-4" aria-hidden="true" />
        {rows.length >= EXPERIENCES_LIMITS.rows ? `Up to ${EXPERIENCES_LIMITS.rows} rows` : "Add row"}
      </button>
    </div>
  );
}
