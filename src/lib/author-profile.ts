export type AuthorProfile = {
  name: string;
  role: string;
  bio: string;
  expertise: string[];
};

const AUTHOR_PROFILES: Record<string, Omit<AuthorProfile, "name">> = {
  sayan: {
    role: "Content Marketing Manager",
    bio: "Sayan is a digital marketing and content strategist focused on SaaS, fintech, trading technology, and B2B software. Their work turns complex products and technical concepts into clear, practical content for modern traders.",
    expertise: ["Trading technology", "Content strategy", "SEO", "Market education"],
  },
};

export function authorSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function authorInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "?";
  return words.length === 1
    ? words[0].charAt(0).toUpperCase()
    : `${words[0].charAt(0)}${words.at(-1)?.charAt(0) ?? ""}`.toUpperCase();
}

export function getAuthorProfile(name: string): AuthorProfile {
  const profile = AUTHOR_PROFILES[authorSlug(name)];
  return {
    name,
    role: profile?.role ?? "ForexFactory Editorial Contributor",
    bio: profile?.bio ?? `${name} contributes practical articles and research for the ForexFactory community, with a focus on helping readers understand trading tools, market topics, and platform workflows.`,
    expertise: profile?.expertise ?? ["Forex education", "Trading tools", "Market research", "Platform guides"],
  };
}
