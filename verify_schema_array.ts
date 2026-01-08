
import { PrismaClient, BlogStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Verifying featuredImage schema...')

    const slug = `test-blog-${Date.now()}`

    try {
        const blog = await prisma.blog.create({
            data: {
                title: 'Test Blog with Single Image',
                seoSlug: slug,
                content: '<p>Test content</p>',
                author: 'Test Author',
                featuredImage: 'image1.jpg',
                tags: 'test',
                categoryId: BigInt(1), // Assuming category 1 exists
                status: 'published' // Using string literal which Prisma accepts for enum
            }
        })

        console.log('Created blog with id:', blog.id)
        console.log('Featured Image type:', typeof blog.featuredImage)
        console.log('Featured Image value:', blog.featuredImage)

        if (typeof blog.featuredImage === 'string' && blog.featuredImage === 'image1.jpg') {
            console.log('SUCCESS: featuredImage is a string with correct value.')
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
                    title: 'Test Blog with Single Image',
                    seoSlug: slug,
                    content: '<p>Test content</p>',
                    author: 'Test Author',
                    featuredImage: 'image1.jpg',
                    tags: 'test',
                    categoryId: BigInt(category.categoryId),
                    status: 'published'
                }
            })
            console.log('Created blog with id:', blog.id)
            console.log('Featured Image value:', blog.featuredImage)
            if (typeof blog.featuredImage === 'string') {
                console.log('SUCCESS: featuredImage is a string.')
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
