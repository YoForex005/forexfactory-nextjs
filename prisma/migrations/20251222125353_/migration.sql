/*
  Warnings:

  - You are about to drop the column `post_id` on the `indexing_logs` table. All the data in the column will be lost.
  - You are about to drop the column `post_id` on the `seo_automations` table. All the data in the column will be lost.
  - You are about to drop the `posts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `serp_previews` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "indexing_post_id_idx";

-- DropIndex
DROP INDEX "post_id_idx";

-- AlterTable
ALTER TABLE "blogs" ADD COLUMN     "cta_text" VARCHAR(500),
ADD COLUMN     "custom_persona" TEXT,
ADD COLUMN     "emoji_usage" VARCHAR(20),
ADD COLUMN     "humanization_level" INTEGER,
ADD COLUMN     "pov" VARCHAR(50),
ADD COLUMN     "secondary_keywords" TEXT,
ADD COLUMN     "style" VARCHAR(100),
ADD COLUMN     "target_audience" VARCHAR(500),
ADD COLUMN     "tone" VARCHAR(100);

-- AlterTable
ALTER TABLE "indexing_logs" DROP COLUMN "post_id",
ADD COLUMN     "blog_id" INTEGER;

-- AlterTable
ALTER TABLE "seo_automations" DROP COLUMN "post_id",
ADD COLUMN     "blog_id" INTEGER;

-- DropTable
DROP TABLE "posts";

-- DropTable
DROP TABLE "serp_previews";

-- DropEnum
DROP TYPE "PostStatus";

-- CreateIndex
CREATE INDEX "indexing_blog_id_idx" ON "indexing_logs"("blog_id");

-- CreateIndex
CREATE INDEX "blog_id_idx" ON "seo_automations"("blog_id");

-- RenameIndex
ALTER INDEX "is_ai_generated_idx" RENAME TO "blogs_is_ai_generated_idx";
