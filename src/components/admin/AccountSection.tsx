import { format, parseISO } from "date-fns";

export function formatAccountDate(iso: string | null, fallback: string): string {
  return iso ? format(parseISO(iso), "d MMM yyyy, HH:mm") : fallback;
}

interface AccountSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function AccountSection({ title, description, children }: AccountSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">{children}</section>
    </div>
  );
}
