(async() => {

const puppeteer = require('puppeteer');

const browser = await puppeteer.launch();
const page = await browser.newPage();
// await page.goto('https://s3.amazonaws.com/time-inc-stamp/model-look-alikes/index.html', { waitUntil: 'networkidle0' });
await page.goto('https://www.quirksmode.org/html5/tests/video.html', { waitUntil: 'networkidle0' });
await page.$('html[foo]');
// console.log(await page.content());
await page.screenshot({path: 'screenshot.png'});

await browser.close();

})();