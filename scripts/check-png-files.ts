import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPngFiles() {
    console.log('Checking for .png files in the database...\n');

    try {
        // 1. Check Blog featured images
        const blogsWithPng = await prisma.blog.findMany({
            where: {
                featuredImage: {
                    contains: '.png'
                }
            },
            select: {
                id: true,
                title: true,
                featuredImage: true
            }
        });
        console.log(`📸 Blogs with .png featured images: ${blogsWithPng.length}`);
        if (blogsWithPng.length > 0) {
            console.log('Sample:', blogsWithPng.slice(0, 3).map(b => ({
                id: b.id,
                image: b.featuredImage
            })));
        }
        console.log();

        // 2. Check Admin profile pictures
        const adminsWithPng = await prisma.admin.findMany({
            where: {
                profilePic: {
                    contains: '.png'
                }
            },
            select: {
                id: true,
                name: true,
                profilePic: true
            }
        });
        console.log(`👤 Admins with .png profile pics: ${adminsWithPng.length}`);
        if (adminsWithPng.length > 0) {
            console.log('Sample:', adminsWithPng.slice(0, 3).map(a => ({
                id: a.id,
                image: a.profilePic
            })));
        }
        console.log();

        // 3. Check SEO Meta OG Images
        const seoMetaWithPng = await prisma.seoMeta.findMany({
            where: {
                ogImage: {
                    contains: '.png'
                }
            },
            select: {
                id: true,
                ogImage: true
            }
        });
        console.log(`🔍 SEO Meta with .png OG images: ${seoMetaWithPng.length}`);
        if (seoMetaWithPng.length > 0) {
            console.log('Sample:', seoMetaWithPng.slice(0, 3).map(s => ({
                id: s.id,
                image: s.ogImage
            })));
        }
        console.log();

        // 4. Check Media file paths
        const mediaWithPng = await prisma.media.findMany({
            where: {
                OR: [
                    { filePath: { contains: '.png' } },
                    { fileName: { contains: '.png' } }
                ]
            },
            select: {
                id: true,
                fileName: true,
                filePath: true
            }
        });
        console.log(`📁 Media with .png files: ${mediaWithPng.length}`);
        if (mediaWithPng.length > 0) {
            console.log('Sample:', mediaWithPng.slice(0, 3).map(m => ({
                id: m.id,
                fileName: m.fileName,
                path: m.filePath
            })));
        }
        console.log();

        // 5. Check Signal file paths
        const signalsWithPng = await prisma.signal.findMany({
            where: {
                filePath: {
                    contains: '.png'
                }
            },
            select: {
                id: true,
                title: true,
                filePath: true
            }
        });
        console.log(`📊 Signals with .png files: ${signalsWithPng.length}`);
        if (signalsWithPng.length > 0) {
            console.log('Sample:', signalsWithPng.slice(0, 3).map(s => ({
                id: s.id,
                path: s.filePath
            })));
        }
        console.log();

        console.log('═══════════════════════════════════════');
        console.log('Summary:');
        console.log('═══════════════════════════════════════');
        console.log(`Total records to update: ${blogsWithPng.length +
            adminsWithPng.length +
            seoMetaWithPng.length +
            mediaWithPng.length +
            signalsWithPng.length
            }`);
        console.log('═══════════════════════════════════════');

    } catch (error) {
        console.error('❌ Error checking files:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the check
checkPngFiles()
    .then(() => {
        console.log('\n✅ Check completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Check failed:', error);
        process.exit(1);
    });
