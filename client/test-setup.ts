import { test as base } from '@playwright/test';
import fs from 'fs';

base.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    const safeTitle = testInfo.title.replace(/[^a-zA-Z0-9-_]/g, '_');
    await page.screenshot({ path: `test-results/${safeTitle}-failed.png`, fullPage: true });
    await fs.promises.writeFile(`test-results/${safeTitle}-failed.html`, await page.content());
  }
});

export { base as test }; 