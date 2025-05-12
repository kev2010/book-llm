import { test as base, expect } from '@playwright/test';
import fs from 'fs';

// Extend the base test with our custom fixtures
export const test = base.extend({
  // Add any custom fixtures here if needed
});

// This will automatically apply to all tests
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    const safeTitle = testInfo.title.replace(/[^a-zA-Z0-9-_]/g, '_');
    const screenshotPath = `test-results/${safeTitle}-failed.png`;
    const htmlPath = `test-results/${safeTitle}-failed.html`;
    
    // Ensure test-results directory exists
    if (!fs.existsSync('test-results')) {
      fs.mkdirSync('test-results', { recursive: true });
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    
    // Save page content
    const content = await page.content();
    await fs.promises.writeFile(htmlPath, content);
    
    // Log additional context
    console.log(`Test failed: ${testInfo.title}`);
    console.log(`Screenshot saved to: ${screenshotPath}`);
    console.log(`HTML content saved to: ${htmlPath}`);
  }
}); 