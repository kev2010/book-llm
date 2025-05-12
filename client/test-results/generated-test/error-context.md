# Test info

- Name: test
- Location: /Users/kj/Documents/GitHub/book-llm/client/src/tests/generated.spec.ts:3:5

# Error details

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByText('Tell me more!')

    at /Users/kj/Documents/GitHub/book-llm/client/src/tests/generated.spec.ts:5:41
```

# Page snapshot

```yaml
- heading "BookLLM" [level=1]
- img
- text: Search...
- paragraph: ⌘K
- text: Books
- img "Book Icon"
- heading "Born Of This Land" [level=2]
- img
- paragraph: Today
- paragraph: New Chat
- img "Chung Ju-Yung"
- paragraph: Chung Ju-Yung
- paragraph: "Hi, I’m Chung Ju-Yung! My family and I grew up so poor that we once had to eat tree bark to survive. Since then, I've done a lot of things in my life: creating Hyundai, helping bring the 1988 Seoul Olympics to my country, and even driving 1,001 cows across the DMZ to promote peace with North Korea. What would you like to know about me?"
- paragraph:
  - text: "Ask anything! Personality and answers are based on his autobiography:"
  - link "Born Of This Land":
    - /url: https://oceanofpdf.com/authors/chung-ju-yung/pdf-born-of-this-land-my-life-story-download/
  - img "Link"
- paragraph: Tell me more about yourself!
- paragraph: Can you share with me your most interesting story?
- paragraph: What are your principles?
- textbox "Ask anything..."
- button [disabled]:
  - img
- alert
```

# Test source

```ts
  1 | import { test, expect } from '@playwright/test';
  2 |
  3 | test('test', async ({ page }) => {
  4 |   await page.goto('http://localhost:3000/');
> 5 |   await page.getByText('Tell me more!').click();
    |                                         ^ Error: locator.click: Test timeout of 30000ms exceeded.
  6 | });
```