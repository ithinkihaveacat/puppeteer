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

(async() => {
  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();
  await page.goto('https://example.com');

  // Get the "viewport" of the page, as reported by the page.
  const dimensions = await page.evaluate(() => {
    return {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
      deviceScaleFactor: window.devicePixelRatio
    };
  });

  console.log('Dimensions:', dimensions);

  await page.screenshot({path: '/screenshots/example.png'});

  await browser.close();
})();