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

async function enter(page, width, height) {
  const x = Math.floor(width / 2)
  const y = Math.floor(height / 2)
  await page.mouse.click(x, y)
  await page.waitForTimeout(340)
  await page.mouse.click(x, y)
  await page.waitForSelector('.login__card', { timeout: 8000 })
  await page.locator('.login__submit').click()
  await page.waitForSelector('.desktop', { timeout: 8000 })
  await page.waitForTimeout(500)
}

async function openApp(page, name) {
  await page.locator('.start-btn').click()
  await page.waitForSelector('.start')
  await page.getByRole('menuitem', { name }).click()
  await page.waitForTimeout(500)
}

async function closeAllWindows(page) {
  let guard = 0
  while ((await page.locator('.win').count()) > 0 && guard < 12) {
    guard += 1
    await page.locator('.win .win__ctl--close').last().click()
    await page.waitForTimeout(140)
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
await page.waitForTimeout(900)
await page.screenshot({ path: `${outDir}/01-boot.png` })

await page.mouse.click(720, 420)
await page.waitForTimeout(340)
await page.mouse.click(720, 420)
await page.waitForSelector('.login__card', { timeout: 8000 })
await page.screenshot({ path: `${outDir}/02-login.png` })

await page.locator('.login__submit').click()
await page.waitForSelector('.desktop', { timeout: 8000 })
await page.waitForTimeout(600)
await page.screenshot({ path: `${outDir}/03-desktop.png` })

await closeAllWindows(page)
await page.waitForTimeout(300)
await page.screenshot({ path: `${outDir}/03b-desktop-clean.png` })

await page.locator('.icon-tile', { hasText: 'ТЕРМИНАЛ' }).dblclick()
await page.waitForTimeout(450)
await page.locator('.term__input').click()
await page.keyboard.type('neofetch')
await page.keyboard.press('Enter')
await page.waitForTimeout(350)
await page.screenshot({ path: `${outDir}/04-terminal.png` })

await page.locator('.start-btn').click()
await page.waitForSelector('.start')
await page.screenshot({ path: `${outDir}/05-start-menu.png` })
await page.getByRole('menuitem', { name: /MATRIXX FM/ }).click()
await page.waitForTimeout(700)
await page.screenshot({ path: `${outDir}/06-fm.png` })

await openApp(page, /ЗМЕЙ/)
await page.screenshot({ path: `${outDir}/07-snake.png` })

await openApp(page, /НАСТРОЙКИ/)
await page.screenshot({ path: `${outDir}/08-settings.png` })
await page.locator('.settings__theme', { hasText: 'КОСТЬ' }).click()
await page.waitForTimeout(300)
await page.screenshot({ path: `${outDir}/08b-bone.png` })

await openApp(page, /АРХИВ/)
await page.screenshot({ path: `${outDir}/09-files.png` })

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
await mobilePage.waitForTimeout(700)
await enter(mobilePage, 390, 844)
await closeAllWindows(mobilePage)
await mobilePage.waitForTimeout(300)
await mobilePage.screenshot({ path: `${outDir}/10-mobile-desktop.png` })
await mobilePage.locator('.start-btn').click()
await mobilePage.waitForSelector('.start')
await mobilePage.screenshot({ path: `${outDir}/11-mobile-menu.png` })
await mobilePage.getByRole('menuitem', { name: /ТЕРМИНАЛ/ }).click()
await mobilePage.waitForTimeout(500)
await mobilePage.screenshot({ path: `${outDir}/12-mobile-terminal.png` })

const social = await browser.newContext({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
})
const socialPage = await social.newPage()
socialPage.on('pageerror', (error) => errors.push(`social pageerror: ${error.message}`))
await socialPage.goto(base, { waitUntil: 'networkidle' })
await socialPage.waitForTimeout(800)
await enter(socialPage, 1200, 630)
await closeAllWindows(socialPage)
await socialPage.waitForTimeout(400)
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
