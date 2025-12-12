import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SITE_URL, generateArticleSchema, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { cache } from "react";
import Image from "next/image";

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

// Memoized blog fetch - runs only ONCE per request even if called multiple times
const getBlog = cache(async (slug: string) => {
  let blog = await prisma.blog.findFirst({
    where: { seoSlug: slug },
    include: {
      seoMeta: true,
      categories: {
        include: {
          category: true
        }
      }
    }
  });

  if (!blog && /^\d+$/.test(slug)) {
    const id = parseInt(slug, 10);
    blog = await prisma.blog.findFirst({
      where: { id },
      include: {
        seoMeta: true,
        categories: {
          include: {
            category: true
          }
        }
      }
    });
  }

  return blog;
});

const getRelatedBlogs = cache(async (categoryId: number, currentBlogId: number) => {
  return prisma.blog.findMany({
    where: {
      categoryId: categoryId, // Using the direct categoryId for simplicity/relevance
      id: { not: currentBlogId },
      status: "published"
    },
    take: 3,
    orderBy: { createdAt: 'desc' },
    select: {
      title: true,
      seoSlug: true,
      featuredImage: true,
      createdAt: true,
      author: true,
      views: true
    }
  });
});

interface BlogDetailProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) {
    return {};
  }

  const seo = blog.seoMeta[0];
  const title = seo?.seoTitle || blog.title;
  const description = seo?.seoDescription || blog.content.substring(0, 160);
  const image = getSafeImageUrl(seo?.ogImage || blog.featuredImage) || DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    openGraph: {
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      url: `${SITE_URL}/blog/${blog.seoSlug}`,
      images: [{ url: image }],
      type: 'article',
      publishedTime: blog.createdAt.toISOString(),
      authors: [blog.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo?.seoTitle || title,
      description: seo?.seoDescription || description,
      images: [image],
    },
    alternates: {
      canonical: seo?.canonicalUrl || `${SITE_URL}/blog/${blog.seoSlug}`,
    }
  };
}

export default async function BlogDetailPage({ params }: BlogDetailProps) {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) {
    return notFound();
  }

  // Fetch related blogs
  const relatedBlogs = await getRelatedBlogs(blog.categoryId, blog.id);

  // JSON-LD Schema
  const jsonLd = generateArticleSchema({
    title: blog.title,
    description: blog.seoMeta[0]?.seoDescription || blog.content.substring(0, 160),
    datePublished: blog.createdAt.toISOString(),
    dateModified: blog.createdAt.toISOString(),
    author: blog.author,
    image: getSafeImageUrl(blog.featuredImage) || DEFAULT_OG_IMAGE,
    url: `${SITE_URL}/blog/${blog.seoSlug}`
  });

  return (
    <div className="flex min-h-screen flex-col bg-surface-50 font-sans selection:bg-brand/30 selection:text-brand-light">
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-1 pb-24">
        {/* Full-width Hero Section with Parallax-like feel */}
        <div className="relative flex min-h-[60vh] w-full items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            {getSafeImageUrl(blog.featuredImage) ? (
              <Image
                src={getSafeImageUrl(blog.featuredImage)!}
                alt={blog.title}
                fill
                className="object-cover opacity-40 blur-sm transition-transform duration-700 hover:scale-105"
                priority
              />
            ) : (
              <div className="h-full w-full bg-surface-200" />
            )}
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-surface-50 via-surface-50/80 to-surface-100/30" />
            <div className="absolute inset-0 bg-gradient-to-b from-surface-50/50 via-transparent to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 container mx-auto px-4 pt-20 text-center">
            <Link
              href="/blog"
              className="group mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white"
            >
              <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Blog
            </Link>

            <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-7xl drop-shadow-xl">
              {blog.title}
            </h1>

            {/* Meta Info Pill */}
            <div className="mx-auto flex w-fit max-w-3xl flex-wrap items-center justify-center gap-4 rounded-2xl border border-white/5 bg-white/5 px-6 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/20 text-xs font-bold text-brand ring-2 ring-brand/20">
                  {blog.author.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-zinc-200">{blog.author}</span>
              </div>
              <span className="text-zinc-600">•</span>
              <div className="flex items-center gap-2 text-zinc-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{format(new Date(blog.createdAt), "MMMM d, yyyy")}</span>
              </div>
              {blog.views !== null && (
                <>
                  <span className="text-zinc-600">•</span>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{blog.views.toLocaleString()} views</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="container mx-auto px-4">
          <div className="relative mx-auto -mt-20 max-w-4xl rounded-3xl border border-white/5 bg-surface-100/80 p-6 md:p-12 shadow-2xl backdrop-blur-3xl ring-1 ring-white/10">

            {/* Tags Header */}
            {blog.tags && (
              <div className="mb-10 flex flex-wrap gap-2">
                {blog.tags.split(',').map((tag) => (
                  <Link
                    key={tag}
                    href={`/search?q=${tag.trim()}`}
                    className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand transition-colors hover:bg-brand/20"
                  >
                    #{tag.trim()}
                  </Link>
                ))}
              </div>
            )}

            {/* Actual Post Content */}
            <article
              className="prose prose-lg prose-invert max-w-none 
                prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white 
                prose-h1:text-4xl prose-h2:mt-12 prose-h2:border-b prose-h2:border-white/5 prose-h2:pb-4 prose-h2:text-2xl 
                prose-p:text-zinc-300 prose-p:leading-relaxed 
                prose-a:text-brand prose-a:no-underline prose-a:transition-colors prose-a:hover:text-brand-light 
                prose-blockquote:border-l-brand prose-blockquote:bg-surface-200/50 prose-blockquote:px-6 prose-blockquote:py-2 prose-blockquote:not-italic prose-blockquote:text-zinc-200
                prose-img:rounded-2xl prose-img:shadow-lg prose-img:ring-1 prose-img:ring-white/10
                prose-code:rounded-md prose-code:bg-surface-300 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-brand-light prose-code:before:content-none prose-code:after:content-none
                prose-strong:text-white prose-ul:list-disc prose-ul:text-zinc-300 prose-li:marker:text-brand"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Share / Interaction Footer within card */}
            <div className="mt-16 border-t border-white/10 pt-8">
              <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                <div className="text-zinc-400">
                  Did you find this article helpful?
                </div>
                <div className="flex gap-3">
                  {/* Share Buttons (Placeholders) */}
                  <button className="flex items-center gap-2 rounded-lg bg-surface-200 px-4 py-2 text-sm font-medium text-white transition-hover hover:bg-surface-300">
                    Share on Twitter
                  </button>
                  <button className="flex items-center gap-2 rounded-lg bg-surface-200 px-4 py-2 text-sm font-medium text-white transition-hover hover:bg-surface-300">
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Posts Section */}
        {relatedBlogs.length > 0 && (
          <div className="container mx-auto px-4 mt-24 max-w-6xl">
            <div className="mb-10 flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
              <h2 className="text-2xl font-bold text-white">Related Articles</h2>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {relatedBlogs.map((related) => (
                <Link
                  href={`/blog/${related.seoSlug}`}
                  key={related.seoSlug}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-surface-100 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand/10 hover:border-brand/20"
                >
                  {/* Card Image */}
                  <div className="relative aspect-video w-full overflow-hidden bg-surface-200">
                    {getSafeImageUrl(related.featuredImage) ? (
                      <Image
                        src={getSafeImageUrl(related.featuredImage)!}
                        alt={related.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-600">
                        <span className="text-4xl opacity-20">Image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-100 via-transparent to-transparent opacity-80" />
                  </div>

                  {/* Card Content */}
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="mb-3 text-lg font-bold leading-snug text-white transition-colors group-hover:text-brand line-clamp-2">
                      {related.title}
                    </h3>

                    <div className="mt-auto flex items-center justify-between text-xs text-zinc-400">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-surface-300" /> {/* Placeholder avatar */}
                        <span>{related.author}</span>
                      </div>
                      <span>{format(new Date(related.createdAt), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
