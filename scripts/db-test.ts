import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing connection...');
        await prisma.$connect();
        console.log('Connected successfully!');

        console.log('Testing signals table...');
        const signals = await prisma.signal.findMany({ take: 1 });
        console.log('Signals found:', signals.length);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
