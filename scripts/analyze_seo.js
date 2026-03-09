const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src', 'app');
const componentsDir = path.join(__dirname, '..', 'src', 'components');

let stats = {
    totalPages: 0,
    hasMetadata: 0,
    hasJSONLD: 0,
    hasH1: 0,
    totalImages: 0,
    imagesWithAlt: 0,
    legacyImgTags: 0,
    technicalFiles: {
        robots: fs.existsSync(path.join(srcDir, 'robots.ts')),
        sitemap: fs.existsSync(path.join(srcDir, 'sitemap.ts')),
        manifest: fs.existsSync(path.join(srcDir, 'manifest.ts'))
    }
};

function scanDir(dir, isAppDir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath, isAppDir);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf8');

            if (isAppDir && file === 'page.tsx') {
                stats.totalPages++;
                let dirContent = content;
                const layoutPath = path.join(dir, 'layout.tsx');
                if (fs.existsSync(layoutPath)) {
                    dirContent += fs.readFileSync(layoutPath, 'utf8');
                }
                if (dirContent.includes('export const metadata') || dirContent.includes('export async function generateMetadata')) {
                    stats.hasMetadata++;
                }
                if (dirContent.includes('JSONLD') || dirContent.includes('application/ld+json')) {
                    stats.hasJSONLD++;
                }
                if (dirContent.includes('<h1') || dirContent.includes('title=')) {
                    // simplified H1 check
                    stats.hasH1++;
                }
            }

            // Image checks
            const imgMatch = content.match(/<Image[^>]+>/g) || [];
            stats.totalImages += imgMatch.length;
            stats.imagesWithAlt += imgMatch.filter(m => m.includes('alt=')).length;

            const legacyMatch = content.match(/<img[^>]+>/g) || [];
            stats.legacyImgTags += legacyMatch.length;
        }
    }
}

scanDir(srcDir, true);
scanDir(componentsDir, false);

const structureScore = stats.totalPages === 0 ? 0 : ((stats.hasMetadata + stats.hasJSONLD + stats.hasH1) / (stats.totalPages * 3)) * 100;
const mediaScore = stats.totalImages === 0 ? 100 : (stats.imagesWithAlt / stats.totalImages) * 100;
const technicalScore = ((stats.technicalFiles.robots ? 1 : 0) + (stats.technicalFiles.sitemap ? 1 : 0) + (stats.technicalFiles.manifest ? 1 : 0)) / 3 * 100;

const totalScore = (structureScore * 0.4) + (mediaScore * 0.4) + (technicalScore * 0.2);

console.log('--- SEO AUDIT RESULTS ---');
console.log(`Structure: ${Math.round(structureScore)}% (${stats.hasMetadata}/${stats.totalPages} Metadata, ${stats.hasJSONLD}/${stats.totalPages} JSON-LD, ${stats.hasH1}/${stats.totalPages} H1)`);
console.log(`Media: ${Math.round(mediaScore)}% (${stats.imagesWithAlt}/${stats.totalImages} Alt text, ${stats.legacyImgTags} legacy <img> tags)`);
console.log(`Technical: ${Math.round(technicalScore)}% (robots: ${stats.technicalFiles.robots}, sitemap: ${stats.technicalFiles.sitemap}, manifest: ${stats.technicalFiles.manifest})`);
console.log(`\nOVERALL SEO GRADE: ${Math.round(totalScore)}%`);

if (stats.legacyImgTags > 0) {
    console.log(`WARNING: Found ${stats.legacyImgTags} legacy <img> tags! Please replace with next/image.`);
}
if (stats.totalImages > stats.imagesWithAlt) {
    console.log(`WARNING: Missing alt text on ${stats.totalImages - stats.imagesWithAlt} <Image> components!`);
}
