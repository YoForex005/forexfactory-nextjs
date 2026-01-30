import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

async function validateSitemap() {
    const url = 'http://localhost:3000/sitemap.xml';
    console.log(`Fetching sitemap from ${url}...`);

    try {
        const response = await axios.get(url);
        const xmlData = response.data;

        // Check if it's valid XML
        const parser = new XMLParser({
            ignoreAttributes: false,
        });
        const result = parser.parse(xmlData);

        if (!result.urlset || !result.urlset.url) {
            throw new Error('Sitemap does not contain valid <urlset> or <url> tags.');
        }

        const urls = Array.isArray(result.urlset.url) ? result.urlset.url : [result.urlset.url];
        console.log(`Found ${urls.length} URLs in sitemap.`);

        // Basic validation of required tags
        const issues = [];
        urls.forEach((u: any, index: number) => {
            if (!u.loc) issues.push(`URL at index ${index} is missing <loc>`);
            if (!u.lastmod) issues.push(`URL at index ${index} (${u.loc}) is missing <lastmod>`);
            if (!u.changefreq) issues.push(`URL at index ${index} (${u.loc}) is missing <changefreq>`);
            if (!u.priority) issues.push(`URL at index ${index} (${u.loc}) is missing <priority>`);
        });

        if (issues.length > 0) {
            console.error('Validation issues found:');
            issues.forEach(issue => console.error(`- ${issue}`));
            process.exit(1);
        }

        console.log('Sitemap is valid against Google standards!');

        // Check for unique URLs
        const locs = urls.map((u: any) => u.loc);
        const uniqueLocs = new Set(locs);
        if (locs.length !== uniqueLocs.size) {
            console.warn(`Warning: Sitemap contains ${locs.length - uniqueLocs.size} duplicate URLs.`);
        }

        // List some categories and blogs for manual verification
        const categories = locs.filter((l: string) => l.includes('/category/'));
        const blogs = locs.filter((l: string) => l.includes('/blog/'));

        console.log(`- Static Routes: ${locs.length - categories.length - blogs.length}`);
        console.log(`- Categories: ${categories.length}`);
        console.log(`- Blogs: ${blogs.length}`);

    } catch (error: any) {
        if (error.code === 'ECONNREFUSED') {
            console.error('Failed to connect to dev server. Make sure "npm run dev" is running at http://localhost:3000');
        } else {
            console.error('Validation failed:', error.message);
        }
        process.exit(1);
    }
}

validateSitemap();
