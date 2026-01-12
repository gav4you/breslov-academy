import { test, expect } from '@playwright/test';

const hasAuth = !!process.env.PLAYWRIGHT_STORAGE_STATE;
const role = String(process.env.PLAYWRIGHT_ROLE || '').toLowerCase();
const hasTeacher = role === 'teacher' || role === 'admin' || role === 'superadmin';
const hasAdmin = role === 'admin' || role === 'superadmin';
const hasSuperAdmin = role === 'superadmin';

test.describe('portal smoke (requires auth)', () => {
  test.skip(!hasAuth, 'Set PLAYWRIGHT_STORAGE_STATE to run portal smoke tests.');

  test('student dashboard loads', async ({ page }) => {
    await page.goto('/student/dashboard');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Welcome back');
  });

  test('teacher dashboard loads', async ({ page }) => {
    test.skip(!hasTeacher, 'Set PLAYWRIGHT_ROLE=teacher|admin|superadmin to run teacher portal tests.');
    await page.goto('/teacher/dashboard');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Shalom');
  });

  test('admin dashboard loads', async ({ page }) => {
    test.skip(!hasAdmin, 'Set PLAYWRIGHT_ROLE=admin|superadmin to run admin portal tests.');
    await page.goto('/admin/dashboard');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Shalom');
  });

  test('superadmin network admin loads', async ({ page }) => {
    test.skip(!hasSuperAdmin, 'Set PLAYWRIGHT_ROLE=superadmin to run superadmin tests.');
    await page.goto('/superadmin/NetworkAdmin');
    await expect(page.getByText('Network Administration')).toBeVisible();
  });
});
