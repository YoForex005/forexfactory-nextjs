-- Instructions:
-- 1. Log in to your database manager (phpMyAdmin, Workbench, etc.)
-- 2. Select your database 'fore_dashboard'
-- 3. Run the following SQL query to create the missing tables

-- Create UserDownload table
CREATE TABLE IF NOT EXISTS `user_downloads` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `user_id` INTEGER NOT NULL,
  `blog_id` INTEGER,
  `signal_id` INTEGER,
  `title` VARCHAR(500) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `file_size` VARCHAR(50),
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  
  PRIMARY KEY (`id`),
  INDEX `user_downloads_user_id_idx`(`user_id`),
  CONSTRAINT `user_downloads_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create SavedArticle table
CREATE TABLE IF NOT EXISTS `saved_articles` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `user_id` INTEGER NOT NULL,
  `blog_id` INTEGER NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE INDEX `saved_articles_user_id_blog_id_key`(`user_id`, `blog_id`),
  INDEX `saved_articles_user_id_idx`(`user_id`),
  CONSTRAINT `saved_articles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `saved_articles_blog_id_fkey` FOREIGN KEY (`blog_id`) REFERENCES `blogs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
