import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Test Super Admin Blog Injection
 * Simulates what the super admin sends and verifies the result
 */

async function testInjection() {
    console.log('🧪 TESTING SUPER ADMIN BLOG INJECTION API')
    console.log('='.repeat(60))

    const testCases = [
        {
            name: 'Test 1: Valid Title & SEO',
            payload: {
                h1: 'Complete Guide to Forex EA Trading',
                meta_title: 'Forex EA Trading Guide 2024',
                meta_description: 'Learn everything about Expert Advisors in forex trading.',
                body_html: '<h1>Complete Guide to Forex EA Trading</h1><p>Expert Advisors are automated trading systems...</p>',
                primary_keyword: 'forex EA',
                secondary_keywords: ['forex', 'expert advisor', 'automated trading'],
                post_status: 'Publish',
                author: 'Test Author'
            }
        },
        {
            name: 'Test 2: Empty h1 (Edge Case)',
            payload: {
                h1: '',
                meta_title: '',
                meta_description: 'Testing empty title handling',
                body_html: '<p>Content without title</p>',
                post_status: 'Publish'
            }
        },
        {
            name: 'Test 3: Whitespace h1 (Edge Case)',
            payload: {
                h1: '   ',
                meta_title: '   ',
                meta_description: 'Testing whitespace title',
                body_html: '<p>Content with whitespace</p>',
                post_status: 'Publish'
            }
        }
    ]

    const results = []
    const createdIds = []

    for (const testCase of testCases) {
        console.log(`\n📝 ${testCase.name}`)
        console.log('-'.repeat(60))

        try {
            // Call API
            const response = await fetch('http://localhost:3005/api/super-admin/inject', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testCase.payload)
            })

            const result = await response.json()

            if (!result.success) {
                console.log('❌ API Error:', result.error)
                results.push({ name: testCase.name, status: 'FAILED', error: result.error })
                continue
            }

            console.log('✅ Blog Created')
            console.log('   ID:', result.blogId)
            console.log('   Slug:', result.slug)

            createdIds.push(BigInt(result.blogId))

            // Verify in database
            const blog = await prisma.blog.findUnique({
                where: { id: BigInt(result.blogId) },
                select: {
                    id: true,
                    title: true,
                    seoSlug: true,
                    seoMeta: {
                        select: {
                            seoTitle: true,
                            seoDescription: true,
                            ogTitle: true
                        }
                    }
                }
            })

            if (!blog) {
                console.log('❌ Blog not found in database!')
                results.push({ name: testCase.name, status: 'FAILED', error: 'Not in DB' })
                continue
            }

            // Validate title
            const hasValidTitle = blog.title && blog.title.trim().length > 0
            const titleIsNotEmpty = blog.title !== ''

            console.log(`   Title: "${blog.title}"`)
            console.log(`   Title Valid: ${hasValidTitle ? '✅' : '❌'}`)
            console.log(`   Title Not Empty: ${titleIsNotEmpty ? '✅' : '❌'}`)

            // Validate SEO
            if (blog.seoMeta && blog.seoMeta.length > 0) {
                const seo = blog.seoMeta[0]
                const hasValidSeoTitle = seo.seoTitle && seo.seoTitle.trim().length > 0
                const hasCleanDescription = seo.seoDescription && !seo.seoDescription.includes('<')

                console.log(`   SEO Title: "${seo.seoTitle}"`)
                console.log(`   SEO Title Valid: ${hasValidSeoTitle ? '✅' : '❌'}`)
                console.log(`   SEO Description Clean: ${hasCleanDescription ? '✅' : '❌'}`)

                const testPassed = hasValidTitle && titleIsNotEmpty && hasValidSeoTitle && hasCleanDescription
                results.push({
                    name: testCase.name,
                    status: testPassed ? 'PASSED' : 'FAILED',
                    details: { title: blog.title, seoTitle: seo.seoTitle }
                })
            } else {
                console.log('❌ No SEO Meta!')
                results.push({ name: testCase.name, status: 'FAILED', error: 'No SEO' })
            }

        } catch (error) {
            console.log('❌ Exception:', error instanceof Error ? error.message : String(error))
            results.push({ name: testCase.name, status: 'FAILED', error: String(error) })
        }
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 TEST SUMMARY')
    console.log('='.repeat(60))

    results.forEach(r => {
        const icon = r.status === 'PASSED' ? '✅' : '❌'
        console.log(`${icon} ${r.name}: ${r.status}`)
        if (r.error) console.log(`   Error: ${r.error}`)
        if (r.details) console.log(`   Title: "${r.details.title}" | SEO: "${r.details.seoTitle}"`)
    })

    const passed = results.filter(r => r.status === 'PASSED').length
    const failed = results.filter(r => r.status === 'FAILED').length

    console.log('\n' + '-'.repeat(60))
    console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`)

    if (passed === results.length) {
        console.log('\n🎉 ALL TESTS PASSED! Super Admin injection works perfectly!')
    } else {
        console.log('\n⚠️  Some tests failed')
    }

    console.log(`\n📝 Created ${createdIds.length} test blogs`)

    // Cleanup option
    if (createdIds.length > 0) {
        console.log('\n🧹 Cleaning up test blogs...')
        const deleted = await prisma.blog.deleteMany({
            where: {
                id: { in: createdIds }
            }
        })
        console.log(`✅ Deleted ${deleted.count} test blogs`)
    }

    await prisma.$disconnect()
}

testInjection().catch(console.error)
