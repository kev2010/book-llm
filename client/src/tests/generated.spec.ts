import { test } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Click on the suggestion that contains "Tell me more"
  await page.getByText('Tell me more', { exact: false }).first().click();
});