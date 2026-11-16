"use client";

import { ArrowDownIcon, ArrowUpIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import EmptyState from "../EmptyState";
import type { ContentBlock } from "@/lib/journal";

/** Editor-side block: list items are edited as one item per line. */
export type EditorBlock = { key: string; type: ContentBlock["type"]; text: string };

const BLOCK_LABELS: Record<EditorBlock["type"], string> = {
  paragraph: "Paragraph",
  heading: "Heading",
  list: "Bullet list",
};

let keyCounter = 0;
export const newBlockKey = () => `b${Date.now().toString(36)}${(keyCounter++).toString(36)}`;

export function toEditorBlocks(blocks: ContentBlock[]): EditorBlock[] {
  return blocks.map((b) => ({
    key: newBlockKey(),
    type: b.type,
    text: b.type === "list" ? b.items.join("\n") : b.text,
  }));
}

/** Drops empty blocks/lines so drafts can be saved mid-edit without validation errors. */
export function fromEditorBlocks(blocks: EditorBlock[]): ContentBlock[] {
  return blocks.flatMap<ContentBlock>((b) => {
    if (b.type === "list") {
      const items = b.text.split("\n").map((l) => l.replace(/^\s*[-*•]\s*/, "").trim()).filter(Boolean);
      return items.length ? [{ type: "list", items }] : [];
    }
    const text = b.text.trim();
    return text ? [{ type: b.type, text }] : [];
  });
}

interface BlockEditorProps {
  blocks: EditorBlock[];
  onChange: (blocks: EditorBlock[]) => void;
}

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const update = (key: string, patch: Partial<EditorBlock>) =>
    onChange(blocks.map((b) => (b.key === key ? { ...b, ...patch } : b)));
  const remove = (key: string) => onChange(blocks.filter((b) => b.key !== key));
  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  const add = (type: EditorBlock["type"]) => onChange([...blocks, { key: newBlockKey(), type, text: "" }]);

  return (
    <div className="space-y-3">
      {blocks.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300">
          <EmptyState
            variant="compact"
            icon={PencilSquareIcon}
            title="No content yet"
            description="Add a paragraph, heading or list below to start writing."
          />
        </div>
      )}

      {blocks.map((block, index) => (
        <div key={block.key} className="group rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-3 py-1.5">
            <select
              value={block.type}
              onChange={(e) => update(block.key, { type: e.target.value as EditorBlock["type"] })}
              aria-label={`Block ${index + 1} type`}
              className="rounded-md bg-transparent py-1 text-xs font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {Object.entries(BLOCK_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1 text-gray-400">
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move block up" className="rounded p-1 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30">
                <ArrowUpIcon className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === blocks.length - 1} aria-label="Move block down" className="rounded p-1 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30">
                <ArrowDownIcon className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => remove(block.key)} aria-label="Remove block" className="rounded p-1 hover:bg-red-50 hover:text-red-600">
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          {block.type === "heading" ? (
            <input
              value={block.text}
              onChange={(e) => update(block.key, { text: e.target.value })}
              placeholder="Section heading"
              aria-label={`Block ${index + 1} heading`}
              className="w-full rounded-b-xl px-4 py-3 text-lg font-semibold text-gray-900 placeholder:text-gray-300 focus:outline-none"
            />
          ) : (
            <textarea
              value={block.text}
              onChange={(e) => update(block.key, { text: e.target.value })}
              rows={block.type === "list" ? 4 : 5}
              placeholder={block.type === "list" ? "One item per line" : "Write a paragraph… use **bold** for emphasis"}
              aria-label={`Block ${index + 1} ${BLOCK_LABELS[block.type].toLowerCase()}`}
              className="block w-full resize-y rounded-b-xl px-4 py-3 text-sm leading-relaxed text-gray-800 placeholder:text-gray-300 focus:outline-none"
            />
          )}
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        {(Object.keys(BLOCK_LABELS) as EditorBlock["type"][]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => add(type)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            + {BLOCK_LABELS[type]}
          </button>
        ))}
      </div>
    </div>
  );
}
