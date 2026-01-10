import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkBlog2802() {
    try {
        const blog = await prisma.blog.findUnique({
            where: { id: BigInt(2802) },
            select: {
                id: true,
                title: true,
                seoSlug: true,
                author: true,
                content: true,
                featuredImage: true,
                tags: true,
                categoryId: true,
                downloadLink: true,
                status: true,
                createdAt: true,
                seoMeta: true
            }
        })

        console.log('====== BLOG 2802 FULL DETAILS ======')
        console.log('ID:', blog?.id)
        console.log('Title:', `"${blog?.title}"`)
        console.log('Title Length:', blog?.title?.length)
        console.log('Title Bytes:', Buffer.from(blog?.title || '').toString('hex'))
        console.log('SEO Slug:', blog?.seoSlug)
        console.log('Author:', blog?.author)
        console.log('Status:', blog?.status)
        console.log('Category ID:', blog?.categoryId)
        console.log('Download Link:', blog?.downloadLink)
        console.log('Featured Image:', blog?.featuredImage)
        console.log('Tags:', blog?.tags)
        console.log('Created At:', blog?.createdAt)
        console.log('\n--- Content Preview (first 200 chars) ---')
        console.log(blog?.content?.substring(0, 200))
        console.log('\n--- SEO Meta ---')
        console.log(JSON.stringify(blog?.seoMeta, null, 2))
        console.log('====================================')

    } catch (error) {
        console.error('Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

checkBlog2802()
