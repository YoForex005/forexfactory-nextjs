import Link from "next/link";
import { authorInitials, authorSlug } from "@/lib/author-profile";

interface AuthorPopoverProps {
  authorName: string;
  className?: string;
}

/**
 * Kept under its original export name so existing article templates continue to
 * work. Author details now live on a dedicated, shareable profile page.
 */
export function AuthorPopover({ authorName, className = "" }: AuthorPopoverProps) {
  const name = authorName.trim() || "Author";

  if (!authorName.trim()) {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand to-indigo-600 text-xs font-bold text-white">?</span>
        <span className="font-medium text-white">Author</span>
      </div>
    );
  }

  return (
    <Link href={`/author/${authorSlug(name)}`} className={`group inline-flex items-center gap-2.5 ${className}`}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-indigo-600 text-xs font-bold text-white shadow-lg shadow-brand/20">
        {authorInitials(name)}
      </span>
      <span className="font-medium text-white underline-offset-4 transition-colors group-hover:text-brand group-hover:underline">{name}</span>
    </Link>
  );
}
