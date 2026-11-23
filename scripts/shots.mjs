import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const base = process.env.SHOTS_URL ?? 'http://localhost:4173/'
const outDir = 'screenshots'

async function launch() {
  try {
    return await chromium.launch({ channel: 'msedge', headless: true })
  } catch {
    return chromium.launch({
      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      headless: true,
    })
  }
}

async function enter(page, width, height, screenshotLogin) {
  const x = Math.floor(width / 2)
  const y = Math.floor(height / 2)
  await page.mouse.click(x, y)
  await page.waitForTimeout(280)
  if (screenshotLogin) {
    await page.waitForTimeout(160)
    await page.screenshot({ path: `${outDir}/02-systemd.png` })
  }
  await page.mouse.click(x, y)
  await page.waitForSelector('.gdm__panel', { timeout: 8000 })
  await page.waitForTimeout(400)
  if (screenshotLogin) await page.screenshot({ path: `${outDir}/03-login.png` })
  await page.locator('.gdm__form input').fill('password')
  await page.locator('.gdm__form button').click()
  await page.waitForSelector('.desktop', { timeout: 8000 })
  await page.waitForTimeout(600)
}

async function openDock(page, title) {
  await page.locator(`.dock__app[title="${title}"]`).click()
  await page.waitForTimeout(450)
}

async function closeAll(page) {
  let guard = 0
  while ((await page.locator('.win').count()) > 0 && guard < 14) {
    guard += 1
    await page.locator('.win .win__ctl--close').last().click()
    await page.waitForTimeout(100)
  }
}

await mkdir(outDir, { recursive: true })
await mkdir('public', { recursive: true })
const browser = await launch()
const errors = []

const desktop = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
})
const page = await desktop.newPage()
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(`console: ${message.text()}`)
})
page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))

await page.goto(base, { waitUntil: 'networkidle' })
await page.waitForTimeout(350)
await page.screenshot({ path: `${outDir}/01-grub.png` })

await page.mouse.click(720, 420)
await page.waitForTimeout(260)
await page.screenshot({ path: `${outDir}/02-systemd.png` })
await page.mouse.click(720, 420)
await page.waitForSelector('.gdm__panel', { timeout: 8000 })
await page.waitForTimeout(400)
await page.screenshot({ path: `${outDir}/03-login.png` })

await page.locator('.gdm__form input').fill('password')
await page.locator('.gdm__form button').click()
await page.waitForSelector('.desktop', { timeout: 8000 })
await page.waitForTimeout(700)
await page.screenshot({ path: `${outDir}/04-desktop.png` })

await closeAll(page)
await page.waitForTimeout(250)
await page.screenshot({ path: `${outDir}/04b-clean.png` })

await openDock(page, 'Terminal')
await openDock(page, 'Files')
await page.locator('.activities-btn').click()
await page.waitForSelector('.overview')
await page.waitForTimeout(400)
await page.screenshot({ path: `${outDir}/05-activities.png` })
await page.locator('.overview__pill').click()
await page.waitForSelector('.appgrid')
await page.waitForTimeout(350)
await page.screenshot({ path: `${outDir}/06-appgrid.png` })
await page.keyboard.press('Escape')
await page.waitForTimeout(200)

await page.locator('.status-btn').click()
await page.waitForSelector('.quick')
await page.waitForTimeout(300)
await page.screenshot({ path: `${outDir}/07-quick-settings.png` })
await page.keyboard.press('Escape')

await openDock(page, 'Terminal')
await page.locator('.term__input').click()
await page.keyboard.type('fastfetch')
await page.keyboard.press('Enter')
await page.waitForTimeout(400)
await page.screenshot({ path: `${outDir}/08-terminal.png` })

await closeAll(page)
await openDock(page, 'Files')
await page.locator('.files__hidden').click()
await page.locator('.files__node', { hasText: '.protocol' }).click()
await page.waitForTimeout(350)
await page.screenshot({ path: `${outDir}/09-files.png` })

await closeAll(page)
await openDock(page, 'Settings')
await page.waitForTimeout(350)
await page.screenshot({ path: `${outDir}/10-settings.png` })

await closeAll(page)
await openDock(page, 'Music')
await page.locator('.fm__play').click()
await page.waitForTimeout(750)
await page.screenshot({ path: `${outDir}/11-music.png` })

await closeAll(page)
await openDock(page, 'Snake')
await page.waitForTimeout(350)
await page.screenshot({ path: `${outDir}/12-snake.png` })

await closeAll(page)
await openDock(page, 'About')
await page.waitForTimeout(350)
await page.screenshot({ path: `${outDir}/13-about.png` })

const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
})
const mobilePage = await mobile.newPage()
mobilePage.on('console', (message) => {
  if (message.type() === 'error') errors.push(`mobile console: ${message.text()}`)
})
mobilePage.on('pageerror', (error) => errors.push(`mobile pageerror: ${error.message}`))
await mobilePage.goto(base, { waitUntil: 'networkidle' })
await mobilePage.waitForTimeout(350)
await mobilePage.mouse.click(195, 420)
await mobilePage.waitForTimeout(280)
await mobilePage.mouse.click(195, 420)
await mobilePage.waitForSelector('.gdm__panel', { timeout: 8000 })
await mobilePage.locator('.gdm__form button').click()
await mobilePage.waitForSelector('.desktop', { timeout: 8000 })
await mobilePage.waitForTimeout(500)
await mobilePage.screenshot({ path: `${outDir}/14-mobile-desktop.png` })

await mobilePage.locator('.activities-btn').click()
await mobilePage.waitForSelector('.overview')
await mobilePage.locator('.overview__pill').click()
await mobilePage.waitForSelector('.appgrid')
await mobilePage.waitForTimeout(300)
await mobilePage.screenshot({ path: `${outDir}/15-mobile-appgrid.png` })
await mobilePage.getByRole('button', { name: 'Open Terminal' }).click()
await mobilePage.waitForTimeout(500)
await mobilePage.screenshot({ path: `${outDir}/16-mobile-terminal.png` })

const social = await browser.newContext({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
})
const socialPage = await social.newPage()
socialPage.on('pageerror', (error) => errors.push(`social pageerror: ${error.message}`))
await socialPage.goto(base, { waitUntil: 'networkidle' })
await socialPage.waitForTimeout(350)
await socialPage.mouse.click(600, 300)
await socialPage.waitForTimeout(280)
await socialPage.mouse.click(600, 300)
await socialPage.waitForSelector('.gdm__panel', { timeout: 8000 })
await socialPage.locator('.gdm__form button').click()
await socialPage.waitForSelector('.desktop', { timeout: 8000 })
await socialPage.waitForTimeout(500)
await closeAll(socialPage)
await socialPage.waitForTimeout(350)
await socialPage.screenshot({ path: `${outDir}/00-og.png` })
await socialPage.screenshot({ path: 'public/og.png' })

await social.close()
await mobile.close()
await desktop.close()
await browser.close()

if (errors.length) {
  console.log('BROWSER ERRORS:')
  for (const error of errors) console.log(` - ${error}`)
  process.exitCode = 1
} else {
  console.log('Screenshots captured without browser errors.')
}
