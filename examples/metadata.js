'use strict';

// TODO
//
// Protocol error on:
//
// https://s3.amazonaws.com/time-inc-stamp/model-look-alikes/index.html ... buggy:  Error: Protocol error (Runtime.callFunctionOn): Cannot find context with specified id undefined

const HEADLESS = true;

(async() => {

const path = 'screenshot.png';

const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');

const ua = devices['Nexus 6'];
// const ua = devices['iPhone 6'];

if (process.argv.length <= 2) {
  process.stderr.write(`usage: ${process.argv[1]} URL|copy_as_cURL\n`);
  process.exit(1);
}

function seq(first, last) {
  if (first < last)
    return [first].concat(seq(first + 1, last));
  else if (first > last)
    return [last].concat(seq(first, last - 1));
  else
    return [first];
}

const url = process.argv[2] === 'curl' ? process.argv[3] : process.argv[2];

const headers = seq(2, process.argv.length - 1)
    .filter(n => process.argv[n] === '-H')
    .map(n => process.argv[n + 1])
    .map(s => {
      const [h, ...v] = s.split(': ');
      return [h, v.join('')];
    });

process.stderr.write(`Processing ${url} ... `);

const browser = await puppeteer.launch({headless: HEADLESS});
const page = await browser.newPage();

const resources = {};

// Would prefer to use page.on('response', ...) to count bytes but
// that doesn't work: https://github.com/GoogleChrome/puppeteer/issues/1274
page._client.on('Network.dataReceived', event => {
  // process.stderr.write('.');
  const request = page._networkManager._requestIdToRequest.get(event.requestId);
  if (!request.url.startsWith('data:')) {
    // encodedDataLength is supposed to be the amount of data received
    // over the wire, but it's often 0...
    // https://chromedevtools.github.io/devtools-protocol/tot/Network/#event-dataReceived
    // const length = event.encodedDataLength > 0 ? event.encodedDataLength : event.dataLength;
    const length = event.dataLength;
    if (request.url in resources)
      resources[request.url] += length;
    else
      resources[request.url] = length;
  }
});

const cookies = (() => {
  const m = new Map(headers);
  const c = m.get('Cookie') || m.get('cookie') || null;
  if (!c) return [];
  return c.split('; ').map(s => {
    const [k, ...v] = s.split('=');
    return {
      name: k,
      value: v.join('='), // TODO Split on first '='
      url
    };
  });
})();

await Promise.all([
  page.emulate(ua),
  page.setCookie.apply(page, cookies),
  // page.setExtraHTTPHeaders(new Map(headers))
]);

await page.goto(url, { waitUntil: 'networkidle0' });
// await page.waitFor(1000);
try {
  if (await page.$('html[amp] amp-story amp-story-page')) {
    await Promise.race([
      page.waitFor("amp-story-page[class~='i-amp-story-page-loaded']"),
      page.waitFor("amp-story-page[class~='i-amphtml-story-page-loaded']")
    ]);
  }
} catch (e) {
  console.log('buggy: ', e);
  // Bug: for some pages, if page.$() is execute too quickly after page.goto(),
  // Puppeteer complains of a "Protocol error".
}
await page.screenshot({ path, fullPage: false });
browser.close();

process.stderr.write('done!\n');

const total = Object.values(resources).reduce((a, n) => a += n, 0);
console.log(resources);
console.log(`TOTAL = ${total} (uncompressed)`);

})();