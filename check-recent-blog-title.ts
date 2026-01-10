import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkRecentBlog() {
    try {
        // Get the most recent blog
        const recentBlog = await prisma.blog.findFirst({
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                title: true,
                seoSlug: true,
                author: true,
                content: true,
                createdAt: true,
                status: true,
                seoMeta: {
                    select: {
                        seoTitle: true,
                        seoDescription: true
                    }
                }
            }
        })

        console.log('====== MOST RECENT BLOG ======')
        console.log('ID:', recentBlog?.id)
        console.log('Title:', recentBlog?.title)
        console.log('Title Length:', recentBlog?.title?.length)
        console.log('Title is empty?:', !recentBlog?.title || recentBlog?.title.trim() === '')
        console.log('SEO Slug:', recentBlog?.seoSlug)
        console.log('Author:', recentBlog?.author)
        console.log('Status:', recentBlog?.status)
        console.log('Created At:', recentBlog?.createdAt)
        console.log('Content Length:', recentBlog?.content?.length)
        console.log('Content Preview:', recentBlog?.content?.substring(0, 100))
        console.log('SEO Meta:', recentBlog?.seoMeta)
        console.log('==============================')

        // Get last 5 blogs to compare
        const last5Blogs = await prisma.blog.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            take: 5,
            select: {
                id: true,
                title: true,
                seoSlug: true,
                createdAt: true
            }
        })

        console.log('\n====== LAST 5 BLOGS ======')
        last5Blogs.forEach((blog, index) => {
            console.log(`${index + 1}. ID: ${blog.id} | Title: "${blog.title}" | Slug: ${blog.seoSlug}`)
        })
        console.log('========================\n')

    } catch (error) {
        console.error('Error checking blog:', error)
    } finally {
        await prisma.$disconnect()
    }
}

checkRecentBlog()
