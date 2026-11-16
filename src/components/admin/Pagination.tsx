import Link from "next/link";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  buildHref: (page: number) => string;
}

export default function Pagination({ page, pageSize, total, buildHref }: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const linkClass = "rounded-full border border-gray-200 bg-white px-4 py-1.5 hover:bg-gray-50";
  return (
    <div className="flex items-center justify-between text-sm text-gray-600">
      <span>
        Page {page} of {pageCount} · {total} total
      </span>
      <div className="flex gap-2">
        {page > 1 && <Link className={linkClass} href={buildHref(page - 1)}>Previous</Link>}
        {page < pageCount && <Link className={linkClass} href={buildHref(page + 1)}>Next</Link>}
      </div>
    </div>
  );
}
