-- AlterTable
ALTER TABLE "blogs" ADD COLUMN     "content_type" VARCHAR(50),
ADD COLUMN     "faq_schema" TEXT,
ADD COLUMN     "is_ai_generated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lsi_keywords" TEXT,
ADD COLUMN     "meta_description" VARCHAR(500),
ADD COLUMN     "meta_title" VARCHAR(255),
ADD COLUMN     "persona_type" VARCHAR(50),
ADD COLUMN     "primary_keyword" VARCHAR(255),
ADD COLUMN     "search_intent" VARCHAR(50);

-- CreateIndex
CREATE INDEX "is_ai_generated_idx" ON "blogs"("is_ai_generated");
