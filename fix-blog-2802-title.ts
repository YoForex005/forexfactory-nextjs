import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixBlog2802() {
    try {
        console.log('Fixing Blog 2802...')

        // Get the blog first
        const blog = await prisma.blog.findUnique({
            where: { id: BigInt(2802) },
            select: {
                id: true,
                title: true,
                content: true,
                seoSlug: true,
                seoMeta: {
                    select: {
                        id: true,
                        seoTitle: true
                    }
                }
            }
        })

        if (!blog) {
            console.log('Blog 2802 not found!')
            return
        }

        console.log('Current Title:', `"${blog.title}"`)
        console.log('Current SEO Slug:', blog.seoSlug)

        // Extract title from content or use a default
        let newTitle = 'Untitled AI Blog'

        // Try to extract h1 from content
        const h1Match = blog.content.match(/<h1[^>]*>(.*?)<\/h1>/i)
        if (h1Match && h1Match[1]) {
            newTitle = h1Match[1].replace(/<[^>]*>/g, '').trim()
        } else {
            // Try to extract first heading
            const headingMatch = blog.content.match(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/i)
            if (headingMatch && headingMatch[1]) {
                newTitle = headingMatch[1].replace(/<[^>]*>/g, '').trim()
            } else {
                // Use first 100 characters of content
                const textContent = blog.content.replace(/<[^>]*>/g, '').trim()
                if (textContent.length > 0) {
                    newTitle = textContent.substring(0, 80) + '...'
                }
            }
        }

        console.log('New Title (extracted):', newTitle)

        // Generate new slug from title
        const newSlug = newTitle.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
            .substring(0, 200) // Limit length

        console.log('New Slug:', newSlug)

        // Check if slug already exists
        const existingSlug = await prisma.blog.findFirst({
            where: {
                seoSlug: newSlug,
                id: { not: BigInt(2802) }
            }
        })

        const finalSlug = existingSlug ? `${newSlug}-${Date.now()}` : newSlug

        // Update blog
        const updatedBlog = await prisma.blog.update({
            where: { id: BigInt(2802) },
            data: {
                title: newTitle,
                seoSlug: finalSlug
            }
        })

        console.log('✅ Blog updated successfully!')
        console.log('New Title:', updatedBlog.title)
        console.log('New Slug:', updatedBlog.seoSlug)

        // Update SEO meta if exists
        if (blog.seoMeta && blog.seoMeta.length > 0) {
            await prisma.seoMeta.update({
                where: { id: blog.seoMeta[0].id },
                data: {
                    seoTitle: newTitle,
                    ogTitle: newTitle,
                    seoSlug: finalSlug
                }
            })
            console.log('✅ SEO Meta updated successfully!')
        }

    } catch (error) {
        console.error('Error fixing blog:', error)
    } finally {
        await prisma.$disconnect()
    }
}

fixBlog2802()
