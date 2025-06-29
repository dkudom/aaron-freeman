const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Navigate to the local development server
  await page.goto('http://localhost:3000');
  
  // Wait for the page to load completely
  await page.waitForTimeout(3000);
  
  // Take screenshot of the homepage
  await page.screenshot({ path: 'homepage-before-admin.png', fullPage: true });
  console.log('Homepage screenshot taken: homepage-before-admin.png');
  
  // Test the secret admin access by typing "adminaccess"
  await page.keyboard.type('adminaccess');
  
  // Wait for admin panel to appear
  await page.waitForTimeout(2000);
  
  // Take screenshot with admin panel open
  await page.screenshot({ path: 'homepage-with-admin.png', fullPage: true });
  console.log('Admin panel screenshot taken: homepage-with-admin.png');
  
  // Check if admin panel is visible
  const adminPanel = await page.locator('h2:has-text("Admin Dashboard")').isVisible();
  if (adminPanel) {
    console.log('✅ Admin dashboard is visible and properly positioned!');
  } else {
    console.log('❌ Admin dashboard is not visible');
  }
  
  await browser.close();
})(); 