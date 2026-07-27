import type { FAQItem } from "@/lib/seo";

function parseStoredFaq(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function normalizeBlogFaq(value: unknown): FAQItem[] {
  const parsed = parseStoredFaq(value);

  if (!Array.isArray(parsed)) {
    return [];
  }

  const seenQuestions = new Set<string>();
  const faqItems: FAQItem[] = [];

  for (const item of parsed) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      continue;
    }

    const { question, answer } = item as Record<string, unknown>;

    if (typeof question !== "string" || typeof answer !== "string") {
      continue;
    }

    const normalizedQuestion = question.trim();
    const normalizedAnswer = answer.trim();
    const questionKey = normalizedQuestion.toLocaleLowerCase();

    if (!normalizedQuestion || !normalizedAnswer || seenQuestions.has(questionKey)) {
      continue;
    }

    seenQuestions.add(questionKey);
    faqItems.push({
      question: normalizedQuestion,
      answer: normalizedAnswer,
    });
  }

  return faqItems;
}

function removeFaqHeadingBlock(content: string): string {
  const headings = [...content.matchAll(/<h2\b[^>]*>[\s\S]*?<\/h2\s*>/gi)];
  const faqHeadingIndex = headings.findIndex((heading) => {
    const headingText = heading[0]
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

    return /^frequently asked questions$/i.test(headingText);
  });

  if (faqHeadingIndex === -1) {
    return content;
  }

  const faqStart = headings[faqHeadingIndex].index;
  const nextHeading = headings[faqHeadingIndex + 1];
  const faqEnd = nextHeading?.index ?? content.length;

  return `${content.slice(0, faqStart)}${content.slice(faqEnd)}`;
}

export function removeEmbeddedBlogFaq(content: string): string {
  const withoutFaqSections = content.replace(
    /<section\b(?=[^>]*\bdata-block\s*=\s*(?:"faq"|'faq'))[^>]*>[\s\S]*?<\/section\s*>/gi,
    "",
  );

  return removeFaqHeadingBlock(withoutFaqSections);
}
