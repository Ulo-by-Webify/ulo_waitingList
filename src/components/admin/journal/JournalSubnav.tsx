import Link from "next/link";

const TABS = [
  { href: "/admin/journal", label: "Posts" },
  { href: "/admin/journal/categories", label: "Categories" },
  { href: "/admin/journal/comments", label: "Comments" },
] as const;

export default function JournalSubnav({ active }: { active: (typeof TABS)[number]["href"] }) {
  return (
    <nav aria-label="Journal sections" className="flex gap-6 border-b border-gray-200">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={tab.href === active ? "page" : undefined}
          className={`-mb-px border-b-2 px-1 pb-2 text-sm font-medium ${
            tab.href === active ? "border-primary text-gray-900" : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
