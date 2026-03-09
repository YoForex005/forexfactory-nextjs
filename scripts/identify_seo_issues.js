const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src', 'app');
const componentsDir = path.join(__dirname, '..', 'src', 'components');

let missingMetadata = [];
let missingJSONLD = [];
let missingH1 = [];
let missingAlt = [];

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
                let dirContent = content;
                const layoutPath = path.join(dir, 'layout.tsx');
                if (fs.existsSync(layoutPath)) {
                    dirContent += fs.readFileSync(layoutPath, 'utf8');
                }
                if (!dirContent.includes('export const metadata') && !dirContent.includes('export async function generateMetadata')) {
                    missingMetadata.push(fullPath);
                }
                if (!dirContent.includes('JSONLD') && !dirContent.includes('application/ld+json')) {
                    missingJSONLD.push(fullPath);
                }
                if (!dirContent.includes('<h1') && !dirContent.includes('title=')) {
                    missingH1.push(fullPath);
                }
            }

            const imgMatch = content.match(/<Image[^>]+>/g) || [];
            imgMatch.forEach((img) => {
                if (!img.includes('alt=')) {
                    missingAlt.push(fullPath);
                }
            });
        }
    }
}

scanDir(srcDir, true);
scanDir(componentsDir, false);

console.log("Pages Missing Metadata:", missingMetadata.map(p => path.relative(path.join(__dirname, '..'), p)));
console.log("Pages Missing JSON-LD:", missingJSONLD.map(p => path.relative(path.join(__dirname, '..'), p)));
console.log("Pages Missing H1:", missingH1.map(p => path.relative(path.join(__dirname, '..'), p)));
console.log("Components Missing Alt:", missingAlt.map(p => path.relative(path.join(__dirname, '..'), p)));
