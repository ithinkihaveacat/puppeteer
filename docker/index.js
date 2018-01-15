const fs = require('fs');

const launchOptions = (() => {
  if (fs.existsSync('/usr/bin/google-chrome-unstable')) {
    return {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: 'google-chrome-unstable'
    };
  } else {
    return {};
  }
})();

const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const iPhone = devices['iPhone 6'];

(async() => {
  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();
  await page.emulate(iPhone);
  await page.goto('https://www.washingtonpost.com/graphics/2018/lifestyle/oprah-for-president-the-highlights/');

  // Get the "viewport" of the page, as reported by the page.
  const dimensions = await page.evaluate(() => {
    return {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
      deviceScaleFactor: window.devicePixelRatio
    };
  });

  console.log('Dimensions:', dimensions);

  await page.screenshot({path: '/data/example.png'});

  await browser.close();
})();