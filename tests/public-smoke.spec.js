import { test, expect } from '@playwright/test';

const publicRoutes = [
  ['/', 'Find your school. Learn with certainty.'],
  ['/about', 'A platform for Torah learning at scale.'],
  ['/how-it-works', 'Publish. Protect. Teach.'],
  ['/pricing', 'Pricing that scales with schools.'],
  ['/faq', 'Frequently asked questions'],
  ['/contact', 'Talk to us'],
  ['/privacy', 'Privacy Policy'],
  ['/terms', 'Terms of Service'],
  ['/login/student', 'Student login'],
  ['/login/teacher', 'Teacher login'],
];

for (const [path, heading] of publicRoutes) {
  test(`public route ${path} renders`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(heading);
  });
}
