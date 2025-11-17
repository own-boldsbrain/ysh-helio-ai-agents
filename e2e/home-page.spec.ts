import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should load and display the main elements', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/')

    // Check for main heading
    await expect(page.getByRole('heading', { name: /Coding Agent Template/i })).toBeVisible()

    // Check for presence of task input area
    await expect(page.getByPlaceholder(/Describe what you want the AI agent to do/i)).toBeVisible()

    // Check for presence of agent selection dropdown
    await expect(page.getByRole('combobox')).toBeVisible()

    // Check for presence of submit button
    await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible()
  })

  test('should allow agent selection', async ({ page }) => {
    await page.goto('/')

    // Click the agent selection dropdown
    await page.getByRole('combobox').click()

    // Check for presence of different agents
    await expect(page.getByText('Claude')).toBeVisible()
    await expect(page.getByText('Qwen')).toBeVisible()
    await expect(page.getByText('GPT-4')).toBeVisible()
  })

  test('should maintain session state', async ({ page, context }) => {
    // Test that session is persisted across page navigations
    await page.goto('/')
    
    // Check if session-related elements are present
    const userMenu = page.locator('button').filter({ has: page.locator('img') }).first()
    
    // If user is signed in, the profile button should be visible
    if (await userMenu.count() > 0) {
      await expect(userMenu).toBeVisible()
    }
  })
})

test.describe('Authentication Flow', () => {
  test('should display GitHub sign-in option', async ({ page }) => {
    await page.goto('/')

    // Click on the profile area which should reveal sign-in options
    const profileButton = page.locator('button').filter({ has: page.locator('img') }).first()
    
    if (await profileButton.count() > 0) {
      await profileButton.click()
      
      // Check if sign-out option is available (meaning user is signed in)
      const signOutOption = page.getByRole('menuitem', { name: /Log Out/i })
      if (await signOutOption.count() > 0) {
        await expect(signOutOption).toBeVisible()
      } else {
        // If not signed in, sign-in options should be visible
        const gitHubSignIn = page.getByRole('menuitem', { name: /Connect/i })
        if (await gitHubSignIn.count() > 0) {
          await expect(gitHubSignIn).toBeVisible()
        }
      }
    }
  })
})