import Link from "next/link";
import { format } from "date-fns";
import { Blog } from "@prisma/client";
import Image from "next/image";

interface BlogCardProps {
  blog: any;
}

function getSafeImageUrl(src?: string | null): string | null {
  if (!src) return null;
  const value = src.trim();
  if (!value) return null;

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("/")) {
    return value;
  }

  if (value.startsWith("blog-images/")) {
    const base = process.env.CLOUDFLARE_R2_PUBLIC_URL;
    if (base) {
      return `${base.replace(/\/$/, "")}/${value}`;
    }
    return `/${value}`;
  }

  if (value.startsWith("admin/") || value.startsWith("media/")) {
    return `/${value}`;
  }

  const base = process.env.CLOUDFLARE_R2_PUBLIC_URL;
  if (base) {
    return `${base.replace(/\/$/, "")}/${value}`;
  }

  return null;
}

export function BlogCard({ blog }: BlogCardProps) {
  // Ensure we have a valid slug - fallback to id if seoSlug is missing
  const slug = blog.seoSlug || blog.id.toString();
  const articleUrl = `/blog/${slug}`;
  const imageUrl = getSafeImageUrl(blog.featuredImage);

  return (
    <Link
      href={articleUrl}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all hover:border-brand/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-brand/10"
    >
      <div className="aspect-video relative w-full overflow-hidden bg-gradient-to-br from-brand/20 to-purple-500/20">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={blog.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-2 text-4xl">📝</div>
              <div className="text-xs text-zinc-500">Blog Post</div>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-3 text-xs font-medium text-zinc-400">
          <span className="rounded-full bg-brand/10 px-2 py-1 text-brand">
            Article
          </span>
          <span>{format(new Date(blog.createdAt), "MMM d, yyyy")}</span>
          <span>•</span>
          <span>{blog.views || 0} views</span>
        </div>

        <h3 className="mb-2 text-xl font-bold leading-tight text-white transition-colors group-hover:text-brand">
          {blog.title}
        </h3>

        <p className="mb-4 line-clamp-2 text-sm text-zinc-400">
          Click to read this article about trading strategies and insights.
        </p>

        <div className="mt-auto flex items-center gap-2 text-sm font-medium text-brand">
          Read Article <span className="transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </Link>
  );
}
