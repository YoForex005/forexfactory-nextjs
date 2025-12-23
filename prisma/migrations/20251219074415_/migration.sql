-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('admin', 'editor');

-- CreateEnum
CREATE TYPE "BlogStatus" AS ENUM ('published', 'draft');

-- CreateEnum
CREATE TYPE "CategoryStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "MetaRobots" AS ENUM ('index, follow', 'noindex, follow', 'index, nofollow', 'noindex, nofollow');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'editor', 'viewer');

-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "phone" VARCHAR(15),
    "password" VARCHAR(255) NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'editor',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profile_pic" VARCHAR(255),
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blogs" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "seo_slug" VARCHAR(500) NOT NULL,
    "status" "BlogStatus" NOT NULL,
    "views" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "author" VARCHAR(255) NOT NULL,
    "featured_image" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "download_link" TEXT,

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_categories" (
    "blog_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "blog_categories_pkey" PRIMARY KEY ("blog_id","category_id")
);

-- CreateTable
CREATE TABLE "categories" (
    "category_id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "CategoryStatus" DEFAULT 'active',

    CONSTRAINT "categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" SERIAL NOT NULL,
    "post_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" SERIAL NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_path" VARCHAR(255) NOT NULL,
    "uploaded_by" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" VARCHAR(64) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "image" VARCHAR(255),
    "author_id" INTEGER NOT NULL,
    "category" VARCHAR(100),
    "featured_image" VARCHAR(255),
    "status" "PostStatus" DEFAULT 'draft',
    "meta_title" VARCHAR(255),
    "meta_description" TEXT,
    "meta_keywords" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_meta" (
    "id" SERIAL NOT NULL,
    "post_id" INTEGER NOT NULL,
    "seo_title" VARCHAR(255),
    "seo_description" TEXT,
    "seo_keywords" TEXT,
    "seo_slug" VARCHAR(255),
    "canonical_url" VARCHAR(255),
    "meta_robots" "MetaRobots" DEFAULT 'index, follow',
    "og_title" VARCHAR(255),
    "og_description" TEXT,
    "og_image" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seo_meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signals" (
    "id" SERIAL NOT NULL,
    "uuid" VARCHAR(32) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "file_path" VARCHAR(500) NOT NULL,
    "mime" VARCHAR(100) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'viewer',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phone" VARCHAR(20),
    "name" VARCHAR(255),
    "country_code" VARCHAR(10) DEFAULT '+91',
    "country" VARCHAR(50) DEFAULT 'IN',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_downloads" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "blog_id" INTEGER,
    "signal_id" INTEGER,
    "title" VARCHAR(500) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "file_size" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_downloads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_articles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "blog_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recent_blogs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "blog_id" INTEGER NOT NULL,
    "visited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recent_blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_templates" (
    "id" SERIAL NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "template" TEXT NOT NULL,
    "variables" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_automations" (
    "id" SERIAL NOT NULL,
    "post_id" INTEGER,
    "taskType" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "input" TEXT,
    "output" TEXT,
    "error" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seo_automations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indexing_logs" (
    "id" SERIAL NOT NULL,
    "post_id" INTEGER,
    "url" VARCHAR(500) NOT NULL,
    "service" VARCHAR(50) NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "response" TEXT,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "indexing_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "serp_previews" (
    "id" SERIAL NOT NULL,
    "post_id" INTEGER NOT NULL,
    "google_title" VARCHAR(60),
    "google_description" VARCHAR(160),
    "bing_title" VARCHAR(60),
    "bing_description" VARCHAR(160),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "serp_previews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_subscriptions" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "confirm_token" VARCHAR(255),
    "unsubscribe_token" VARCHAR(255),
    "subscribed_at" TIMESTAMP(3),
    "confirmed_at" TIMESTAMP(3),
    "unsubscribed_at" TIMESTAMP(3),
    "last_email_sent_at" TIMESTAMP(3),
    "bounce_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "newsletter_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" SERIAL NOT NULL,
    "recipient" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(500) NOT NULL,
    "template_key" VARCHAR(100),
    "status" VARCHAR(20) NOT NULL,
    "message_id" VARCHAR(255),
    "error" TEXT,
    "metadata" TEXT,
    "sent_at" TIMESTAMP(3),
    "opened_at" TIMESTAMP(3),
    "clicked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");

-- CreateIndex
CREATE INDEX "blogs_status_created_at_idx" ON "blogs"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "blogs_seo_slug_key" ON "blogs"("seo_slug");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");

-- CreateIndex
CREATE INDEX "created_at_idx" ON "signals"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "user_downloads_user_id_idx" ON "user_downloads"("user_id");

-- CreateIndex
CREATE INDEX "saved_articles_user_id_idx" ON "saved_articles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "saved_articles_user_id_blog_id_key" ON "saved_articles"("user_id", "blog_id");

-- CreateIndex
CREATE INDEX "recent_blogs_user_id_idx" ON "recent_blogs"("user_id");

-- CreateIndex
CREATE INDEX "recent_blogs_visited_at_idx" ON "recent_blogs"("visited_at");

-- CreateIndex
CREATE UNIQUE INDEX "recent_blogs_user_id_blog_id_key" ON "recent_blogs"("user_id", "blog_id");

-- CreateIndex
CREATE UNIQUE INDEX "seo_templates_key_key" ON "seo_templates"("key");

-- CreateIndex
CREATE INDEX "post_id_idx" ON "seo_automations"("post_id");

-- CreateIndex
CREATE INDEX "status_idx" ON "seo_automations"("status");

-- CreateIndex
CREATE INDEX "indexing_post_id_idx" ON "indexing_logs"("post_id");

-- CreateIndex
CREATE INDEX "service_status_idx" ON "indexing_logs"("service", "status");

-- CreateIndex
CREATE UNIQUE INDEX "serp_previews_post_id_key" ON "serp_previews"("post_id");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscriptions_email_key" ON "newsletter_subscriptions"("email");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscriptions_confirm_token_key" ON "newsletter_subscriptions"("confirm_token");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscriptions_unsubscribe_token_key" ON "newsletter_subscriptions"("unsubscribe_token");

-- CreateIndex
CREATE INDEX "subscription_status_idx" ON "newsletter_subscriptions"("status");

-- CreateIndex
CREATE INDEX "email_recipient_idx" ON "email_logs"("recipient");

-- CreateIndex
CREATE INDEX "email_status_idx" ON "email_logs"("status");
