import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, CalendarDays, ChevronLeft, Eye, FileText, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { BlogCard } from "@/components/blog/BlogCard";
import { authorInitials, authorSlug, getAuthorProfile } from "@/lib/author-profile";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, generateCanonicalUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

function formatCount(value: bigint | null) {
  return new Intl.NumberFormat("en-US").format(value ?? BigInt(0));
}

async function getAuthorPageData(slug: string) {
  const authors = await prisma.blog.findMany({
    where: { status: "published" },
    distinct: ["author"],
    select: { author: true },
  });
  const authorName = authors.find((item) => authorSlug(item.author) === slug)?.author;
  if (!authorName) return null;

  const where = { status: "published" as const, author: authorName };
  const [summary, articles] = await Promise.all([
    prisma.blog.aggregate({ where, _count: { _all: true }, _sum: { views: true } }),
    prisma.blog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true, title: true, seoSlug: true, featuredImage: true, createdAt: true,
        views: true, author: true,
        categories: { include: { category: { select: { name: true } } } },
      },
    }),
  ]);

  const categories = Array.from(new Set(articles.flatMap((article) => article.categories.map((item) => item.category.name)))).slice(0, 6);
  return { authorName, summary, articles, categories };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getAuthorPageData(slug);
  if (!data) return { title: `Author not found | ${SITE_NAME}` };

  const profile = getAuthorProfile(data.authorName);
  const url = generateCanonicalUrl(`/author/${slug}`);
  return {
    title: `${profile.name} | ${SITE_NAME}`,
    description: `${profile.role} at ${SITE_NAME}. Read ${data.summary._count._all} published articles and explore their latest trading education content.`,
    alternates: { canonical: url },
    openGraph: { title: `${profile.name} | ${SITE_NAME}`, description: profile.bio, url, type: "profile", images: [DEFAULT_OG_IMAGE] },
    twitter: { card: "summary_large_image", title: `${profile.name} | ${SITE_NAME}`, description: profile.bio, images: [DEFAULT_OG_IMAGE] },
  };
}

export default async function AuthorPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getAuthorPageData(slug);
  if (!data) notFound();

  const profile = getAuthorProfile(data.authorName);
  const publishedLabel = data.articles[0]
    ? new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(data.articles[0].createdAt)
    : "—";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.role,
    description: profile.bio,
    url: `${SITE_URL}/author/${slug}`,
    worksFor: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface-100">
      <Navbar />
      <main className="flex-1">
        <section className="relative isolate overflow-hidden border-b border-white/10 bg-surface-50 py-12 sm:py-16">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_15%,rgba(10,132,255,0.22),transparent_35%),radial-gradient(circle_at_85%_15%,rgba(99,102,241,0.16),transparent_30%)]" />
          <div className="container mx-auto px-4">
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition hover:text-white"><ChevronLeft className="h-4 w-4" /> Back to the blog</Link>
            <div className="mt-9 grid gap-8 lg:grid-cols-[auto_1fr_auto] lg:items-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-brand/30 bg-gradient-to-br from-brand to-indigo-600 text-3xl font-bold text-white shadow-2xl shadow-brand/25">{authorInitials(profile.name)}</div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">ForexFactory author</p>
                <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">{profile.name}</h1>
                <p className="mt-2 text-lg font-medium text-brand-light">{profile.role}</p>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">{profile.bio}</p>
              </div>
              <div className="flex flex-wrap gap-2 lg:max-w-48 lg:justify-end">
                {profile.expertise.map((item) => <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300">{item}</span>)}
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10 sm:py-12">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><FileText className="h-5 w-5 text-brand" /><p className="mt-4 text-2xl font-bold text-white">{data.summary._count._all}</p><p className="mt-1 text-sm text-zinc-500">Published articles</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><Eye className="h-5 w-5 text-brand" /><p className="mt-4 text-2xl font-bold text-white">{formatCount(data.summary._sum.views)}</p><p className="mt-1 text-sm text-zinc-500">Article views</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><CalendarDays className="h-5 w-5 text-brand" /><p className="mt-4 text-2xl font-bold text-white">{publishedLabel}</p><p className="mt-1 text-sm text-zinc-500">Most recent publication</p></div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-14 sm:pb-20">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">Latest from {profile.name.split(" ")[0]}</p><h2 className="mt-2 text-3xl font-bold text-white">Published articles</h2></div>
            {data.categories.length > 0 && <div className="flex flex-wrap gap-2">{data.categories.map((category) => <span key={category} className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-400">{category}</span>)}</div>}
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.articles.map((article, index) => <BlogCard key={article.id.toString()} blog={{ ...article, id: article.id.toString(), views: article.views === null ? null : Number(article.views), createdAt: article.createdAt.toISOString() }} priority={index < 3} />)}
          </div>
          <div className="mt-10 rounded-2xl border border-brand/20 bg-brand/5 p-6 sm:flex sm:items-center sm:justify-between">
            <div><div className="flex items-center gap-2 text-sm font-semibold text-white"><BookOpen className="h-4 w-4 text-brand" /> Editorial approach</div><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Articles are designed to help readers evaluate tools and ideas with clear information, responsible risk awareness, and practical platform context.</p></div>
            <div className="mt-4 flex items-center gap-2 text-sm text-zinc-400 sm:mt-0"><ShieldCheck className="h-4 w-4 text-brand" /> Read, evaluate, then test</div>
          </div>
        </section>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
