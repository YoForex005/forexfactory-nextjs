
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Searching for 'MT4' blog...");
    const blog = await prisma.blog.findFirst({
        where: {
            title: {
                contains: 'MT4'
            }
        }
    });

    if (blog) {
        console.log("SUCCESS: Found blog!", blog.title, "ID:", blog.id);
        console.log("Content Type:", blog.contentType?.substring(0, 50) + "...");
    } else {
        console.log("NOT FOUND: The MT4 blog is not in the database yet.");
        console.log("Please trigger the injection from Super Admin again.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
