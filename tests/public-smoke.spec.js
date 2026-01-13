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
  ['/login', 'Log in'],
  ['/login/student', 'Student login'],
  ['/login/teacher', 'Teacher login'],
  ['/login/admin', 'Admin login'],
  ['/signup', 'Join Breslov Academy'],
  ['/signup/student', 'Join as a Student'],
  ['/signup/teacher', 'Join as a Teacher'],
  ['/signup/school', 'Start a New School'],
];

for (const [path, heading] of publicRoutes) {
  test(`public route ${path} renders`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(heading);
  });
}
