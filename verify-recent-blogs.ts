import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Manual verification - Check the most recent 3 blogs to see if they have valid titles
 */

async function verifyRecentBlogs() {
    console.log('🔍 VERIFYING RECENT BLOG INJECTIONS')
    console.log('='.repeat(70))

    try {
        const recentBlogs = await prisma.blog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                title: true,
                seoSlug: true,
                author: true,
                status: true,
                createdAt: true,
                seoMeta: {
                    select: {
                        seoTitle: true,
                        seoDescription: true
                    }
                }
            }
        })

        console.log(`\nFound ${recentBlogs.length} most recent blogs:\n`)

        recentBlogs.forEach((blog, index) => {
            console.log(`${index + 1}. Blog ID: ${blog.id}`)
            console.log(`   Created: ${blog.createdAt.toISOString()}`)
            console.log(`   Title: "${blog.title}"`)
            console.log(`   Slug: ${blog.seoSlug}`)
            console.log(`   Author: ${blog.author}`)
            console.log(`   Status: ${blog.status}`)

            // Validation checks
            const titleValid = blog.title && blog.title.trim().length > 0
            const titleNotEmpty = blog.title !== ''

            console.log(`   ✓ Title Valid: ${titleValid ? '✅ YES' : '❌ NO'}`)
            console.log(`   ✓ Title Not Empty: ${titleNotEmpty ? '✅ YES' : '❌ NO'}`)

            if (blog.seoMeta && blog.seoMeta.length > 0) {
                const seo = blog.seoMeta[0]
                const seoTitleValid = seo.seoTitle && seo.seoTitle.trim().length > 0
                const descClean = seo.seoDescription && !seo.seoDescription.includes('<')

                console.log(`   ✓ SEO Title: "${seo.seoTitle}"`)
                console.log(`   ✓ SEO Title Valid: ${seoTitleValid ? '✅ YES' : '❌ NO'}`)
                console.log(`   ✓ SEO Description Clean: ${descClean ? '✅ YES' : '❌ NO'}`)

                if (seo.seoDescription) {
                    const preview = seo.seoDescription.substring(0, 60)
                    console.log(`   ✓ Description Preview: "${preview}..."`)
                }
            } else {
                console.log(`   ❌ No SEO Meta found!`)
            }

            console.log('')
        })

        console.log('='.repeat(70))
        console.log('SUMMARY:')
        console.log('='.repeat(70))

        const validTitles = recentBlogs.filter(b => b.title && b.title.trim().length > 0).length
        const validSeo = recentBlogs.filter(b =>
            b.seoMeta && b.seoMeta.length > 0 &&
            b.seoMeta[0].seoTitle && b.seoMeta[0].seoTitle.trim().length > 0
        ).length
        const cleanDescriptions = recentBlogs.filter(b =>
            b.seoMeta && b.seoMeta.length > 0 &&
            b.seoMeta[0].seoDescription && !b.seoMeta[0].seoDescription.includes('<')
        ).length

        console.log(`\nValid Titles: ${validTitles}/${recentBlogs.length} ${validTitles === recentBlogs.length ? '✅' : '❌'}`)
        console.log(`Valid SEO Meta: ${validSeo}/${recentBlogs.length} ${validSeo === recentBlogs.length ? '✅' : '❌'}`)
        console.log(`Clean Descriptions: ${cleanDescriptions}/${recentBlogs.length} ${cleanDescriptions === recentBlogs.length ? '✅' : '❌'}`)

        if (validTitles === recentBlogs.length &&
            validSeo === recentBlogs.length &&
            cleanDescriptions === recentBlogs.length) {
            console.log('\n🎉 ALL RECENT BLOGS ARE PROPERLY FORMATTED!')
            console.log('✅ Super Admin injection is working perfectly!')
        } else {
            console.log('\n⚠️  Some blogs have issues. Please check the details above.')
        }

    } catch (error) {
        console.error('Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

verifyRecentBlogs()
