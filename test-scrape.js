const cheerio = require('cheerio');

async function testScrape() {
    // The user's URL example from the image
    const rawUrl = 'https://www.linkedin.com/jobs/collections/recommended/?currentJobId=4123'; // Some ID

    // First try normal cheerio (what our API does currently)
    try {
        const res1 = await fetch(rawUrl);
        const html = await res1.text();
        const $ = cheerio.load(html);
        $('script, style, noscript, nav, footer, header').remove();
        console.log("---- CHEERIO OUTPUT ----");
        console.log($('body').text().replace(/\s+/g, ' ').trim().substring(0, 300));
    } catch (e) { console.error(e); }

    // Second try Jina Reader
    try {
        const res2 = await fetch('https://r.jina.ai/' + rawUrl);
        const text = await res2.text();
        console.log("---- JINA READER OUTPUT ----");
        console.log(text.substring(0, 300));
    } catch (e) { console.error(e); }
}

testScrape();
