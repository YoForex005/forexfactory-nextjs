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
import { ProgressBar } from "@/components/blog/ProgressBar";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { ArrowLeft, Calendar, Clock, Eye, ChevronRight, Bookmark, Share2 } from "lucide-react";
import { DownloadBox } from "@/components/blog/DownloadBox";
import { SaveButton } from "@/components/blog/SaveButton";
import { BlogVisitTracker } from "@/components/blog/BlogVisitTracker";
import { AIBlogMeta } from "@/components/blog/AIBlogMeta";

import { BlogHeroSlideshow } from "@/components/blog/BlogHeroSlideshow";

function resolveUrl(value: string): string | null {
  const r2PublicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL?.replace(/\/$/, "");

  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return value;

  if (value.startsWith("blog-images/")) {
    return r2PublicUrl ? `${r2PublicUrl}/${value}` : `/${value}`;
  }

  if (value.startsWith("admin/") || value.startsWith("media/")) {
    return `/${value}`;
  }

  if (r2PublicUrl) {
    return `${r2PublicUrl}/${value}`;
  }

  return null;
}

function getSafeImageUrl(images?: string[] | null): string | null {
  if (!images || images.length === 0) return null;
  const src = images[0];
  if (!src) return null;
  return resolveUrl(src);
}

function getSafeImageUrls(images?: string[] | null): string[] {
  if (!images || images.length === 0) return [];
  const urls: string[] = [];

  images.forEach(src => {
    if (src) {
      const resolved = resolveUrl(src);
      if (resolved) urls.push(resolved);
    }
  });

  return urls;
}

function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

function processContent(content: string) {
  const headings: { id: string; text: string; level: number }[] = [];

  const contentWithIds = content.replace(/<h([2-3])([^>]*)>(.*?)<\/h\1>/g, (match, levelStr, attrs, innerText) => {
    const level = parseInt(levelStr);
    const plainText = innerText.replace(/<[^>]*>/g, "").trim();
    const id = plainText.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

    headings.push({ id, text: plainText, level });

    return `<h${level} id="${id}"${attrs}>${innerText}</h${level}>`;
  });

  return { contentWithIds, headings };
}

const getBlog = cache(async (slug: string) => {
  const blogSelect = {
    id: true,
    title: true,
    seoSlug: true,
    status: true,
    views: true,
    createdAt: true,
    content: true,
    author: true,
    featuredImage: true,
    tags: true,
    categoryId: true,
    downloadLink: true,
    // AI Generation Metadata
    isAiGenerated: true,
    primaryKeyword: true,
    secondaryKeywords: true,
    targetAudience: true,
    searchIntent: true,
    contentType: true,
    personaType: true,
    customPersona: true,
    tone: true,
    style: true,
    pov: true,
    emojiUsage: true,
    humanizationLevel: true,
    lsiKeywords: true,
    faqSchema: true,
    ctaText: true,
    metaTitle: true,
    metaDescription: true,
    // Relations
    seoMeta: true,
    categories: {
      include: {
        category: true
      }
    }
  } as const;

  // Try to find by seoSlug first
  let blog = await prisma.blog.findFirst({
    where: { seoSlug: slug },
    select: blogSelect
  });

  // If not found by slug, try by id (for numeric slugs)
  if (!blog && /^\d+$/.test(slug)) {
    const id = parseInt(slug, 10);
    blog = await prisma.blog.findFirst({
      where: { id },
      select: blogSelect
    });
  }

  return blog;
});

const getRelatedBlogs = cache(async (categoryId: number, currentBlogId: number) => {
  return prisma.blog.findMany({
    where: {
      categoryId: categoryId,
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
  const ogImage = seo?.ogImage ? resolveUrl(seo.ogImage) : null;
  const featuredImage = getSafeImageUrl(blog.featuredImage);
  const image = ogImage || featuredImage || DEFAULT_OG_IMAGE;

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

  const relatedBlogs = await getRelatedBlogs(blog.categoryId, blog.id);
  const { contentWithIds, headings } = processContent(blog.content);
  const readTime = calculateReadTime(blog.content);
  const imageUrl = getSafeImageUrl(blog.featuredImage);
  const imageUrls = getSafeImageUrls(blog.featuredImage);

  const jsonLd = generateArticleSchema({
    title: blog.title,
    description: blog.seoMeta[0]?.seoDescription || blog.content.substring(0, 160),
    datePublished: blog.createdAt.toISOString(),
    dateModified: blog.createdAt.toISOString(),
    author: blog.author,
    image: imageUrl || DEFAULT_OG_IMAGE,
    url: `${SITE_URL}/blog/${blog.seoSlug}`
  });

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <ProgressBar />
      <Navbar />
      <BlogVisitTracker blogId={blog.id} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="border-b border-white/5 bg-[#0d0d14]">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-zinc-500">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-zinc-300 truncate max-w-[200px]">{blog.title}</span>
          </nav>
        </div>
      </div>

      <main className="pb-20">
        {/* Hero Section */}
        <div className="relative">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand/5 via-transparent to-transparent pointer-events-none" />

          <div className="container mx-auto px-4 pt-12 pb-8">
            <div className="max-w-4xl mx-auto text-center">
              {/* Category Badge */}
              {blog.categories && blog.categories.length > 0 && (
                <div className="inline-flex items-center gap-2 mb-6">
                  {blog.categories.slice(0, 2).map((cat: any) => (
                    <span
                      key={cat.categoryId}
                      className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand bg-brand/10 rounded-md border border-brand/20"
                    >
                      {cat.category.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
                {blog.title}
              </h1>

              {/* Author & Meta */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-400">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                    {blog.author.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium">{blog.author}</p>
                    <p className="text-xs text-zinc-500">Author</p>
                  </div>
                </div>

                <span className="w-px h-6 bg-white/10 hidden sm:block" />

                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-zinc-500" />
                  <span>{format(new Date(blog.createdAt), "MMM d, yyyy")}</span>
                </div>

                <span className="w-px h-6 bg-white/10 hidden sm:block" />

                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-zinc-500" />
                  <span>{readTime} min read</span>
                </div>

                {blog.views !== null && (
                  <>
                    <span className="w-px h-6 bg-white/10 hidden sm:block" />
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-4 w-4 text-zinc-500" />
                      <span>{blog.views.toLocaleString()} views</span>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-center gap-3">
                <SaveButton blogId={blog.id} />
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-300 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all">
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Image Slideshow */}
        <div className="container mx-auto px-4 mb-12">
          <div className="max-w-4xl mx-auto">
            <BlogHeroSlideshow images={imageUrls} title={blog.title} />
          </div>
        </div>

        {/* Content Layout */}
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid gap-12 lg:grid-cols-[1fr_260px]">

            {/* Article Content */}
            <article className="min-w-0">
              <div
                className="prose prose-lg prose-invert max-w-none
                  prose-headings:font-bold prose-headings:text-white prose-headings:scroll-mt-24
                  prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                  prose-p:text-zinc-300 prose-p:leading-7
                  prose-a:text-brand prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-white prose-strong:font-semibold
                  prose-blockquote:border-l-2 prose-blockquote:border-brand prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-zinc-400
                  prose-ul:text-zinc-300 prose-ol:text-zinc-300
                  prose-li:marker:text-brand
                  prose-code:text-brand prose-code:bg-brand/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                  prose-pre:bg-[#0d0d14] prose-pre:border prose-pre:border-white/5 prose-pre:rounded-xl
                  prose-img:rounded-xl prose-img:shadow-xl"
                dangerouslySetInnerHTML={{ __html: contentWithIds }}
              />

              {/* Download Box - Always visible at end of blog */}
              <DownloadBox downloadLink={blog.downloadLink} />

              {/* AI Blog Metadata - Shows for AI-generated content */}
              <AIBlogMeta
                isAiGenerated={blog.isAiGenerated}
                primaryKeyword={blog.primaryKeyword}
                searchIntent={blog.searchIntent}
                contentType={blog.contentType}
                personaType={blog.personaType}
                targetAudience={blog.targetAudience}
                lsiKeywords={blog.lsiKeywords}
                faqSchema={blog.faqSchema}
                tone={blog.tone}
                style={blog.style}
              />

              {/* Tags */}
              {blog.tags && (
                <div className="mt-12 pt-8 border-t border-white/10">
                  <p className="text-xs uppercase tracking-wider text-zinc-500 mb-4">Topics</p>
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.split(',').map((tag: string) => (
                      <Link
                        key={tag}
                        href={`/search?q=${tag.trim()}`}
                        className="px-3 py-1.5 text-sm text-zinc-400 bg-white/5 hover:bg-brand hover:text-white rounded-lg border border-white/10 transition-all"
                      >
                        {tag.trim()}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Author Card */}
              <div className="mt-12 p-6 bg-[#0d0d14] rounded-2xl border border-white/5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand to-indigo-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                    {blog.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white mb-1">Written by {blog.author}</p>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      Forex trading expert sharing insights on algorithmic trading, Expert Advisors, and MetaTrader development.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                <TableOfContents headings={headings} />

                {/* Quick Links */}
                <div className="p-5 bg-[#0d0d14] rounded-xl border border-white/5">
                  <p className="text-xs uppercase tracking-wider text-zinc-500 mb-4">Quick Links</p>
                  <div className="space-y-2">
                    <Link href="/downloads" className="block text-sm text-zinc-400 hover:text-brand transition-colors">
                      → Download EAs
                    </Link>
                    <Link href="/signals" className="block text-sm text-zinc-400 hover:text-brand transition-colors">
                      → Trading Signals
                    </Link>
                    <Link href="/blog" className="block text-sm text-zinc-400 hover:text-brand transition-colors">
                      → More Articles
                    </Link>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Related Posts */}
        {relatedBlogs.length > 0 && (
          <div className="mt-20 py-16 bg-[#0d0d14] border-t border-white/5">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-white">Related Articles</h2>
                  <Link href="/blog" className="text-sm text-brand hover:underline">
                    View all →
                  </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {relatedBlogs.map((related: any) => (
                    <Link
                      href={`/blog/${related.seoSlug}`}
                      key={related.seoSlug}
                      className="group block bg-[#0a0a0f] rounded-xl border border-white/5 overflow-hidden hover:border-brand/30 transition-all"
                    >
                      <div className="relative aspect-[16/10] bg-zinc-900">
                        {getSafeImageUrl(related.featuredImage) ? (

                          // Using standard img tag to support any domain without next.config.js restrictions
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={getSafeImageUrl(related.featuredImage)!}
                            alt={related.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <span className="text-zinc-700 text-4xl">📄</span>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold text-white group-hover:text-brand transition-colors line-clamp-2 mb-3">
                          {related.title}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-zinc-500">
                          <span>{related.author}</span>
                          <span>{format(new Date(related.createdAt), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Back to Top */}
        <div className="container mx-auto px-4 mt-12">
          <div className="max-w-4xl mx-auto text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-brand transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to all articles
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
