const puppeteer = require("puppeteer");
const devices = require("puppeteer/DeviceDescriptors");

const ua = devices["Nexus 5"];

if (process.argv.length !== 3) {
  console.error(`usage: ${process.argv[2]} copy_as_cURL`);
  process.exit(1);
}

function seq(first, last) {
  if (first < last) {
    return [first].concat(seq(first + 1, last));
  } else if (first > last) {
    return [last].concat(seq(first, last - 1));
  } else {
    return [first];
  }
}

const url = process.argv[2];

const headers = seq(2, process.argv.length - 1)
  .filter(n => process.argv[n] == "-H")
  .map(n => process.argv[n + 1])
  .map(s => {
    const [h, ...v] = s.split(": ");
    return [h, v.join("")];
  });

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.emulate(ua);
  await page.setExtraHTTPHeaders(new Map(headers));
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.documentElement.outerHTML).then(console.log);
  browser.close();
})();
