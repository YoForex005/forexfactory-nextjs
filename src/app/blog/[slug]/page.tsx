import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SITE_URL, generateArticleSchema, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";

interface BlogDetailProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await prisma.blog.findFirst({
    where: { seoSlug: slug },
    include: { seoMeta: true }
  });

  if (!blog) {
    return {};
  }

  const seo = blog.seoMeta[0];
  const title = seo?.seoTitle || blog.title;
  const description = seo?.seoDescription || blog.content.substring(0, 160);
  const image = seo?.ogImage || blog.featuredImage || DEFAULT_OG_IMAGE;

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
  const blog = await prisma.blog.findFirst({
    where: { seoSlug: slug },
    include: { seoMeta: true }
  });

  if (!blog) {
    notFound();
  }

  // JSON-LD Schema
  const jsonLd = generateArticleSchema({
    title: blog.title,
    description: blog.seoMeta[0]?.seoDescription || blog.content.substring(0, 160),
    datePublished: blog.createdAt.toISOString(),
    dateModified: blog.createdAt.toISOString(),
    author: blog.author,
    image: blog.featuredImage,
    url: `${SITE_URL}/blog/${blog.seoSlug}`
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-1 bg-surface-100 pb-20">
        {/* Hero / Header */}
        <div className="relative h-[400px] w-full overflow-hidden bg-gradient-to-br from-brand/20 via-purple-500/20 to-surface-100">
          <div className="absolute inset-0 bg-gradient-to-t from-surface-100 via-surface-100/50 to-transparent" />
          
          <div className="absolute bottom-0 left-0 w-full p-4">
            <div className="container mx-auto">
              <Link href="/blog" className="mb-4 inline-flex items-center text-sm text-zinc-400 hover:text-brand">
                ← Back to Blog
              </Link>
              <h1 className="mb-4 max-w-4xl text-4xl font-bold leading-tight text-white md:text-5xl">
                {blog.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-zinc-400">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-brand/20 flex items-center justify-center text-brand font-bold">
                    {blog.author.charAt(0).toUpperCase()}
                  </div>
                  <span>{blog.author}</span>
                </div>
                <span>•</span>
                <span>{format(new Date(blog.createdAt), "MMMM d, yyyy")}</span>
                <span>•</span>
                <span>{blog.views || 0} views</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <article className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-3xl">
            <div 
              className="prose prose-invert prose-lg max-w-none prose-a:text-brand prose-headings:text-white prose-strong:text-white text-zinc-300"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Tags */}
            {blog.tags && (
              <div className="mt-12 flex flex-wrap gap-2 pt-8 border-t border-white/10">
                {blog.tags.split(',').map((tag) => (
                  <span key={tag} className="rounded-full bg-white/5 px-3 py-1 text-sm text-zinc-400">
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
