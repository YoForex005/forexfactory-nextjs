
import { PrismaClient, BlogStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Verifying featuredImage array schema...')

    const slug = `test-blog-array-${Date.now()}`

    try {
        const blog = await prisma.blog.create({
            data: {
                title: 'Test Blog with Multiple Images',
                seoSlug: slug,
                content: '<p>Test content</p>',
                author: 'Test Author',
                featuredImage: ['image1.jpg', 'image2.jpg', 'image3.jpg'],
                tags: 'test',
                categoryId: 1, // Assuming category 1 exists, if not we might fail unless we create one.
                isAiGenerated: false,
                status: 'published' // Using string literal which Prisma accepts for enum
            }
        })

        console.log('Created blog with id:', blog.id)
        console.log('Featured Image type:', Array.isArray(blog.featuredImage) ? 'Array' : typeof blog.featuredImage)
        console.log('Featured Image value:', blog.featuredImage)

        if (Array.isArray(blog.featuredImage) && blog.featuredImage.length === 3) {
            console.log('SUCCESS: featuredImage is an array with 3 elements.')
        } else {
            console.error('FAILURE: featuredImage is not correct.')
            process.exit(1)
        }

        // Cleanup
        await prisma.blog.delete({ where: { id: blog.id } })
        console.log('Cleanup successful.')

    } catch (e) {
        console.error('Error during verification:', e)
        // If category 1 doesn't exist, we might fail.
        if (String(e).includes('Foreign key constraint failed')) {
            console.log("Attempting to create a category first...")
            const category = await prisma.category.create({
                data: {
                    name: `Test Cat ${Date.now()}`,
                    description: "Test"
                }
            })
            // Retry blog creation
            const blog = await prisma.blog.create({
                data: {
                    title: 'Test Blog with Multiple Images',
                    seoSlug: slug,
                    content: '<p>Test content</p>',
                    author: 'Test Author',
                    featuredImage: ['image1.jpg', 'image2.jpg', 'image3.jpg'],
                    tags: 'test',
                    categoryId: category.categoryId,
                    isAiGenerated: false,
                    status: 'published'
                }
            })
            console.log('Created blog with id:', blog.id)
            console.log('Featured Image value:', this.featuredImage) // Typo fix: blog.featuredImage
            if (Array.isArray(blog.featuredImage) && blog.featuredImage.length === 3) {
                console.log('SUCCESS: featuredImage is an array with 3 elements.')
            }
            await prisma.blog.delete({ where: { id: blog.id } })
            await prisma.category.delete({ where: { categoryId: category.categoryId } })
            console.log('Cleanup successful.')
        } else {
            process.exit(1)
        }
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
