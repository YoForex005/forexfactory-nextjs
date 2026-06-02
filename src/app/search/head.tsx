import { SITE_NAME, SITE_URL } from "@/lib/seo";

export default function Head() {
  const title = `Search | ${SITE_NAME}`;
  const description = `Search ${SITE_NAME} for blog posts, trading signals, and expert advisors.`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="noindex,follow" />
      <link rel="canonical" href={`${SITE_URL}/search`} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`${SITE_URL}/search`} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </>
  );
}
