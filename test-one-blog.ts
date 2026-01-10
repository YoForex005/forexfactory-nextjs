/**
 * Simple test - just try to inject one blog and see what happens
 */

async function simpleTest() {
    console.log('🧪 Testing Super Admin Blog Injection\n')

    const payload = {
        h1: 'Test Blog Title - Forex Trading Guide',
        meta_title: 'Complete Forex Trading Guide',
        meta_description: 'Learn forex trading from scratch with our comprehensive guide.',
        body_html: '<h1>Test Blog Title</h1><p>This is test content for validation.</p>',
        primary_keyword: 'forex trading',
        secondary_keywords: ['forex', 'trading', 'guide'],
        post_status: 'Publish',
        author: 'Test Author',
        download_link: 'https://example.com/download.zip'
    }

    console.log('Sending payload to API...')
    console.log('Payload:', JSON.stringify(payload, null, 2))

    try {
        const response = await fetch('http://localhost:3005/api/super-admin/inject', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        })

        console.log('\nResponse Status:', response.status)
        console.log('Response OK:', response.ok)

        const result = await response.json()
        console.log('\nResponse Body:', JSON.stringify(result, null, 2))

        if (result.success) {
            console.log('\n✅ SUCCESS!')
            console.log('Blog ID:', result.blogId)
            console.log('Slug:', result.slug)
            console.log('\n🔍 Now verifying in database...')

            // Import Prisma and check
            const { PrismaClient } = await import('@prisma/client')
            const prisma = new PrismaClient()

            const blog = await prisma.blog.findUnique({
                where: { id: BigInt(result.blogId) },
                select: {
                    id: true,
                    title: true,
                    seoSlug: true,
                    author: true,
                    status: true,
                    seoMeta: {
                        select: {
                            seoTitle: true,
                            seoDescription: true,
                            ogTitle: true,
                            ogDescription: true
                        }
                    }
                }
            })

            console.log('\nDatabase Record:')
            console.log('Title:', blog?.title)
            console.log('Title Length:', blog?.title?.length)
            console.log('Title is valid:', blog?.title && blog.title.trim().length > 0 ? '✅' : '❌')
            console.log('Slug:', blog?.seoSlug)
            console.log('Author:', blog?.author)
            console.log('Status:', blog?.status)

            if (blog?.seoMeta && blog.seoMeta.length > 0) {
                const seo = blog.seoMeta[0]
                console.log('\nSEO Meta:')
                console.log('SEO Title:', seo.seoTitle)
                console.log('SEO Description:', seo.seoDescription)
                console.log('OG Title:', seo.ogTitle)
                console.log('Description has HTML:', seo.seoDescription?.includes('<') ? '❌' : '✅')
            }

            // Final verdict
            const titleValid = blog?.title && blog.title.trim().length > 0
            const seoValid = blog?.seoMeta && blog.seoMeta.length > 0 &&
                blog.seoMeta[0].seoTitle && blog.seoMeta[0].seoTitle.trim().length > 0
            const descClean = blog?.seoMeta && blog.seoMeta.length > 0 &&
                !blog.seoMeta[0].seoDescription?.includes('<')

            console.log('\n' + '='.repeat(60))
            console.log('FINAL VERDICT:')
            console.log('Title Valid:', titleValid ? '✅ YES' : '❌ NO')
            console.log('SEO Valid:', seoValid ? '✅ YES' : '❌ NO')
            console.log('Description Clean:', descClean ? '✅ YES' : '❌ NO')

            if (titleValid && seoValid && descClean) {
                console.log('\n🎉 ALL CHECKS PASSED! Injection works perfectly!')
            } else {
                console.log('\n⚠️  Some checks failed')
            }

            // Cleanup
            console.log('\n🧹 Cleaning up test blog...')
            await prisma.blog.delete({ where: { id: BigInt(result.blogId) } })
            console.log('✅ Test blog deleted')

            await prisma.$disconnect()
        } else {
            console.log('\n❌ FAILED!')
            console.log('Error:', result.error || 'Unknown error')
        }

    } catch (error) {
        console.log('\n❌ ERROR!')
        console.log(error)
    }
}

simpleTest()
