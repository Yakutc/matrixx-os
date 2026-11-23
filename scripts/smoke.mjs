import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const url = process.env.SMOKE_URL ?? 'http://localhost:4173/'

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
  await page.waitForTimeout(300)
  await page.mouse.click(x, y)
  await page.waitForSelector('.gdm__panel', { timeout: 8000 })
  await page.locator('.gdm__form input').fill('password')
  await page.locator('.gdm__form button').click()
  await page.waitForSelector('.desktop', { timeout: 8000 })
  await page.waitForTimeout(500)
}

async function openDock(page, title) {
  await page.locator(`.dock__app[title="${title}"]`).click()
  await page.waitForTimeout(450)
}

async function closeAll(page) {
  let guard = 0
  while ((await page.locator('.win').count()) > 0 && guard < 12) {
    guard += 1
    await page.locator('.win .win__ctl--close').last().click()
    await page.waitForTimeout(120)
  }
}

const browser = await launch()
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
})
const page = await context.newPage()
const errors = []
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(`console: ${message.text()}`)
})
page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))

await page.goto(url, { waitUntil: 'networkidle' })
await enter(page, 1440, 900)

assert.equal(await page.locator('.topbar').count(), 1, 'top bar renders')
assert.equal(await page.locator('.dock').count(), 1, 'dock renders')
assert.equal(await page.locator('.term__input').count(), 1, 'terminal auto-opens')
assert.equal(
  await page.evaluate(() => document.documentElement.dataset.theme),
  'dark',
  'default Yaru dark theme',
)

const terminal = page.locator('.win[data-app="terminal"]').first()
await terminal.locator('.term__input').click()
await page.keyboard.type('help')
await page.keyboard.press('Enter')
await page.waitForTimeout(250)
assert.match(await terminal.locator('.term__scroll').innerText(), /Available commands/, 'terminal help')

await page.keyboard.type('theme light')
await page.keyboard.press('Enter')
await page.waitForTimeout(200)
assert.equal(
  await page.evaluate(() => document.documentElement.dataset.theme),
  'light',
  'theme command applies',
)

await page.keyboard.type('theme dark')
await page.keyboard.press('Enter')
await page.waitForTimeout(150)

await page.keyboard.type('signal')
await page.keyboard.press('Enter')
await page.waitForTimeout(200)
assert.match(await terminal.locator('.term__scroll').innerText(), /Answer received/i, 'signal easter egg')

const before = await terminal.boundingBox()
assert.ok(before, 'terminal has a box')
const bar = await terminal.locator('.win__bar').boundingBox()
assert.ok(bar, 'title bar has a box')
await page.mouse.move(bar.x + 220, bar.y + 20)
await page.mouse.down()
await page.mouse.move(bar.x + 290, bar.y + 64, { steps: 8 })
await page.mouse.up()
await page.waitForTimeout(200)
const after = await terminal.boundingBox()
assert.ok(after && before, 'terminal visible after drag')
assert.ok(after.x > before.x + 20, 'window drag works')

await terminal.locator('.win__ctl').nth(0).click()
await page.waitForTimeout(200)
assert.equal(await terminal.isVisible(), false, 'minimize hides the window')
await page.locator('.dock__app[title="Terminal"]').click()
await page.waitForTimeout(250)
assert.equal(await terminal.isVisible(), true, 'dock restores the window')

await page.locator('.activities-btn').click()
await page.waitForSelector('.overview')
const windowCards = await page.locator('.window-card').count()
assert.ok(windowCards >= 1, 'activities shows window cards')
await page.locator('.overview__pill').click()
await page.waitForSelector('.appgrid')
assert.equal(await page.locator('.appgrid__item').count(), 8, 'app grid lists all applications')
await page.keyboard.press('Escape')
await page.waitForTimeout(150)

await page.locator('.status-btn').click()
await page.waitForSelector('.quick')
assert.match(await page.locator('.quick').innerText(), /Wi-Fi/, 'quick settings renders')
await page.keyboard.press('Escape')

await openDock(page, 'Files')
assert.equal(await page.locator('.files').count(), 1, 'files opens')
await page.locator('.files__hidden').click()
await page.locator('.files__node', { hasText: '.protocol' }).click()
await page.waitForTimeout(150)
assert.match(
  await page.locator('.files__content').innerText(),
  /IF YOU ARE READING THIS/,
  'hidden file opens',
)
await page.locator('.win[data-app="files"] .win__ctl--close').click()

await openDock(page, 'Settings')
assert.equal(await page.locator('.settings').count(), 1, 'settings opens')
await page.locator('.settings__theme', { hasText: 'Light' }).click()
await page.waitForTimeout(150)
assert.equal(
  await page.evaluate(() => document.documentElement.dataset.theme),
  'light',
  'light theme applies',
)
await page.locator('.settings__theme', { hasText: 'Dark' }).click()
await page.waitForTimeout(150)
await page.locator('.gnome-row', { hasText: 'Night Light' }).click()
assert.equal(
  await page.evaluate(() => document.documentElement.dataset.nightLight),
  'on',
  'night light applies',
)
await page.locator('.gnome-row', { hasText: 'Night Light' }).click()
await page.locator('.win[data-app="settings"] .win__ctl--close').click()

await openDock(page, 'Text Editor')
await page.locator('.notes__new').click()
await page.locator('.notes__body').fill('autosave check 47.2')
await page.waitForTimeout(650)
assert.match(
  await page.evaluate(() => localStorage.getItem('matrixx.notes.v1') ?? ''),
  /autosave check 47\.2/,
  'editor autosaves',
)
await page.locator('.win[data-app="notes"] .win__ctl--close').click()

await openDock(page, 'Snake')
await page.locator('.snake__start').click()
await page.waitForTimeout(300)
assert.equal(await page.locator('.snake__overlay').count(), 0, 'snake starts')
await page.keyboard.press('ArrowUp')
await page.waitForTimeout(250)
await page.locator('.win[data-app="snake"] .win__ctl--close').click()

await openDock(page, 'Music')
await page.locator('.fm__play').click()
await page.waitForTimeout(650)
assert.equal(await page.locator('.fm__state').innerText(), 'Playing', 'music engine starts')
await page.locator('.fm__play').click()
await page.waitForTimeout(250)
assert.equal(await page.locator('.fm__state').innerText(), 'Stopped', 'music engine stops')
await page.locator('.win[data-app="fm"] .win__ctl--close').click()

const windowsBefore = await page.locator('.win').count()
assert.ok(windowsBefore >= 1, 'a window remains before reload')
await page.reload({ waitUntil: 'networkidle' })
await enter(page, 1440, 900)
const restored = await page.locator('.win').count()
assert.ok(restored >= 1, `session restores windows (got ${restored})`)

const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 1,
})
const mobilePage = await mobile.newPage()
mobilePage.on('pageerror', (error) => errors.push(`mobile pageerror: ${error.message}`))
mobilePage.on('console', (message) => {
  if (message.type() === 'error') errors.push(`mobile console: ${message.text()}`)
})
await mobilePage.goto(url, { waitUntil: 'networkidle' })
await enter(mobilePage, 390, 844)
assert.equal(await mobilePage.locator('.win').count(), 0, 'mobile starts with a clean desktop')
const overflow = await mobilePage.evaluate(
  () => document.documentElement.scrollWidth - window.innerWidth,
)
assert.ok(overflow <= 1, `no horizontal overflow on mobile (overflow ${overflow})`)
assert.ok(await mobilePage.locator('.dock').isVisible(), 'dock visible on mobile')
await mobilePage.locator('.activities-btn').click()
await mobilePage.waitForSelector('.overview')
await mobilePage.locator('.overview__pill').click()
await mobilePage.waitForSelector('.appgrid')
await mobilePage.getByRole('button', { name: 'Open Terminal' }).click()
await mobilePage.waitForTimeout(400)
assert.equal(await mobilePage.locator('.win[data-app="terminal"]').count(), 1, 'mobile opens terminal')

await mobile.close()
await context.close()
await browser.close()

assert.deepEqual(errors, [], `browser errors: ${errors.join(' | ')}`)
console.log('SMOKE PASS: GRUB/GDM, dock, windows, terminal, activities, quick settings, files, settings, editor, snake, music, persistence, mobile.')
