import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [['json', { outputFile: 'test-results/report.json' }]],
  testDir: 'src/tests',
}); 