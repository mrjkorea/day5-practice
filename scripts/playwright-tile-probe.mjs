import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://127.0.0.1:8765/intermediate/';

async function main() {
  const browser = await chromium.launch();
  const viewport = { width: 1366, height: 600 };
  const page = await browser.newPage({ viewport });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__d5 && window.__d5.renderTileItem);
  await page.evaluate(() => window.__d5.renderTileItem('int2c', 'int2c-unit03-t7-02'));
  await page.waitForSelector('button.check');
  for (const letter of ['m', 'o', 'n', 'e', 'y']) {
    await page.locator('.tray .tile').filter({ hasText: letter }).first().click();
  }
  const check = page.locator('button.check');
  const disabled = await check.isDisabled();
  const box = await check.boundingBox();
  const inView = box && box.y + box.height <= viewport.height && box.y >= 0;
  console.log(JSON.stringify({ disabled, inView, box, viewport }, null, 2));
  if (disabled) process.exit(2);
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
