
async function checkSitemap() {
    try {
        const res = await fetch('http://localhost:3000/sitemap.xml');
        console.log('Status:', res.status);
        console.log('Content-Type:', res.headers.get('content-type'));
        const text = await res.text();
        console.log('Body length:', text.length);
        console.log('First 500 chars:', text.substring(0, 500));
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

checkSitemap();
