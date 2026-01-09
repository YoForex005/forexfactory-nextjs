import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BASE_URL = 'https://pub-9fc60e9b8d334d298b6a4a22f06229c0.r2.dev/images/';

async function checkAndFixImageUrls() {
    console.log('Checking and fixing image URLs...\n');

    try {
        // 1. Check images without URL prefix
        const withoutPrefix = await prisma.blog.count({
            where: {
                AND: [
                    { featuredImage: { not: { startsWith: 'http' } } },
                    { featuredImage: { not: { equals: '' } } }
                ]
            }
        });
        console.log(`📸 Images without URL prefix: ${withoutPrefix}`);

        // 2. Check images with .png extension
        const withPng = await prisma.blog.count({
            where: {
                featuredImage: { contains: '.png' }
            }
        });
        console.log(`🖼️  Images with .png extension: ${withPng}`);

        // 3. Get samples
        const sampleWithoutPrefix = await prisma.blog.findMany({
            where: {
                AND: [
                    { featuredImage: { not: { startsWith: 'http' } } },
                    { featuredImage: { not: { equals: '' } } }
                ]
            },
            select: {
                id: true,
                featuredImage: true
            },
            take: 3
        });

        if (sampleWithoutPrefix.length > 0) {
            console.log('\nSample images without prefix:');
            sampleWithoutPrefix.forEach(blog => {
                console.log(`  ${blog.featuredImage}`);
            });
        }

        const sampleWithPng = await prisma.blog.findMany({
            where: {
                featuredImage: { contains: '.png' }
            },
            select: {
                id: true,
                featuredImage: true
            },
            take: 3
        });

        if (sampleWithPng.length > 0) {
            console.log('\nSample images with .png:');
            sampleWithPng.forEach(blog => {
                console.log(`  ${blog.featuredImage}`);
            });
        }

        console.log('\n═══════════════════════════════════════');
        console.log('Total issues found:');
        console.log(`  Missing URL prefix: ${withoutPrefix}`);
        console.log(`  PNG extensions: ${withPng}`);
        console.log('═══════════════════════════════════════');

        if (withoutPrefix > 0 || withPng > 0) {
            console.log('\n⚠️  Issues detected! Run the fix script to resolve them.');
        } else {
            console.log('\n✅ All images are properly formatted!');
        }

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

checkAndFixImageUrls()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Failed:', error);
        process.exit(1);
    });
