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
