import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogListingPage } from "@/app/blog/page";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";

export const revalidate = 300;

type BlogPaginationPageProps = {
  params: Promise<{ page: string }>;
};

export function generateStaticParams() {
  // Prebuild the first few archive pages, which receive the majority of
  // navigation traffic. Remaining pages use the same ISR cache on demand.
  return [2, 3, 4, 5].map((page) => ({ page: String(page) }));
}

export async function generateMetadata({ params }: BlogPaginationPageProps): Promise<Metadata> {
  const { page } = await params;
  const pageNumber = Number(page);
  const url = `${SITE_URL}/blog/page/${pageNumber}`;
  const title = `Trading Blog Page ${pageNumber} | ${SITE_NAME}`;

  return {
    title,
    alternates: { canonical: url },
    openGraph: { title, url, type: "website", images: [DEFAULT_OG_IMAGE] },
    robots: { index: true, follow: true },
  };
}

export default async function BlogPaginationPage({ params }: BlogPaginationPageProps) {
  const { page } = await params;
  const pageNumber = Number(page);

  if (!Number.isSafeInteger(pageNumber) || pageNumber < 2) notFound();

  return <BlogListingPage currentPage={pageNumber} />;
}
