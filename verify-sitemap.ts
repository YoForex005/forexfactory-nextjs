
import sitemap from './src/app/sitemap';

async function verify() {
    console.log('Starting sitemap generation verification...');
    try {
        const entries = await sitemap();
        console.log(`Successfully generated ${entries.length} sitemap entries.`);
        if (entries.length > 0) {
            console.log('First entry URL:', entries[0].url);
            console.log('Last entry URL:', entries[entries.length - 1].url);
        }

        // Check for any URLs starting with undefined or null
        const badEntries = entries.filter(e => e.url.startsWith('undefined') || e.url.startsWith('null') || !e.url.startsWith('http'));
        if (badEntries.length > 0) {
            console.error('Found bad entries:', badEntries.slice(0, 5));
            process.exit(1);
        } else {
            console.log('All URLs look valid (start with http).');
        }

    } catch (error) {
        console.error('Sitemap generation failed:', error);
        process.exit(1);
    }
}

verify();
