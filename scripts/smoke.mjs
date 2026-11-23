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

async function enter(page, width) {
  const x = Math.floor(width / 2)
  await page.mouse.click(x, 420)
  await page.waitForTimeout(320)
  await page.mouse.click(x, 420)
  await page.waitForSelector('.login__card', { timeout: 8000 })
  await page.locator('.login__submit').click()
  await page.waitForSelector('.desktop', { timeout: 8000 })
  await page.waitForTimeout(450)
}

async function openApp(page, name) {
  await page.locator('.start-btn').click()
  await page.waitForSelector('.start')
  await page.getByRole('menuitem', { name }).click()
  await page.waitForTimeout(450)
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
await enter(page, 1440)
assert.equal(await page.locator('.desktop').count(), 1, 'desktop renders')
assert.equal(await page.locator('.term__input').count(), 1, 'terminal auto-opens')

await page.locator('.term__input').click()
await page.keyboard.type('help')
await page.keyboard.press('Enter')
await page.waitForTimeout(250)
const terminalText = await page.locator('.term__scroll').innerText()
assert.match(terminalText, /ДОСТУПНЫЕ КОМАНДЫ/, 'terminal help works')

await page.keyboard.type('theme amber')
await page.keyboard.press('Enter')
await page.waitForTimeout(150)
assert.equal(
  await page.evaluate(() => document.documentElement.dataset.theme),
  'amber',
  'theme command applies',
)

await page.keyboard.type('signal')
await page.keyboard.press('Enter')
await page.waitForTimeout(120)
assert.match(await page.locator('.term__scroll').innerText(), /ответ получен/i, 'signal easter egg')

const terminalWindow = page.locator('.win[data-app="terminal"]').first()
const before = await terminalWindow.boundingBox()
assert.ok(before, 'terminal has a box')
const bar = await terminalWindow.locator('.win__bar').boundingBox()
assert.ok(bar, 'titlebar has a box')
await page.mouse.move(bar.x + 180, bar.y + 14)
await page.mouse.down()
await page.mouse.move(bar.x + 260, bar.y + 58, { steps: 8 })
await page.mouse.up()
await page.waitForTimeout(200)
const after = await terminalWindow.boundingBox()
assert.ok(after && before, 'terminal still visible after drag')
assert.ok(after.x > before.x + 20, 'window drag moves the window')

await terminalWindow.locator('.win__ctl').nth(0).click()
await page.waitForTimeout(200)
assert.equal(await terminalWindow.isVisible(), false, 'minimize hides the window')
await page.locator('.task-chip', { hasText: 'ТЕРМИНАЛ' }).first().click()
await page.waitForTimeout(200)
assert.equal(await terminalWindow.isVisible(), true, 'taskbar restores the window')

await openApp(page, /АРХИВ/)
assert.equal(await page.locator('.files').count(), 1, 'files app opens')
await page.locator('.files__hidden').click()
await page.locator('.files__node', { hasText: '.протокол.txt' }).click()
await page.waitForTimeout(150)
assert.match(
  await page.locator('.files__content').innerText(),
  /ЕСЛИ ТЫ ЭТО ЧИТАЕШЬ/,
  'hidden file opens',
)

await openApp(page, /НАСТРОЙКИ/)
await page.locator('.settings__theme', { hasText: 'КОСТЬ' }).click()
await page.waitForTimeout(150)
assert.equal(
  await page.evaluate(() => document.documentElement.dataset.theme),
  'bone',
  'bone theme applies',
)
await page.locator('.settings__toggle', { hasText: 'CRT-ЭФФЕКТЫ' }).click()
assert.equal(
  await page.evaluate(() => document.documentElement.dataset.crt),
  'off',
  'CRT toggle applies',
)

await openApp(page, /ЖУРНАЛ/)
await page.locator('.notes__new').click()
await page.locator('.notes__body').fill('проверка автосохранения 47.2')
await page.waitForTimeout(700)
assert.match(
  await page.evaluate(() => localStorage.getItem('matrixx.notes.v1') ?? ''),
  /проверка автосохранения/,
  'notes persist',
)

await openApp(page, /ЗМЕЙ/)
await page.locator('.snake__start').click()
await page.waitForTimeout(300)
assert.equal(await page.locator('.snake__overlay').count(), 0, 'snake starts')
await page.keyboard.press('ArrowUp')
await page.waitForTimeout(300)

await openApp(page, /MATRIXX FM/)
await page.locator('.fm__play').click()
await page.waitForTimeout(700)
assert.equal(await page.locator('.fm__state').innerText(), 'ПЕРЕДАЧА', 'FM engine starts')
await page.locator('.fm__play').click()
await page.waitForTimeout(250)
assert.equal(await page.locator('.fm__state').innerText(), 'ОЖИДАНИЕ', 'FM engine stops')

const windowCount = await page.locator('.win').count()
assert.ok(windowCount >= 4, 'multiple windows are open')
await page.reload({ waitUntil: 'networkidle' })
await enter(page, 1440)
const restored = await page.locator('.win').count()
assert.ok(restored >= 3, `session restores windows (got ${restored})`)

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
await enter(mobilePage, 390)
const overflow = await mobilePage.evaluate(
  () => document.documentElement.scrollWidth - window.innerWidth,
)
assert.ok(overflow <= 1, `no horizontal overflow on mobile (overflow ${overflow})`)
await mobilePage.locator('.start-btn').click()
await mobilePage.waitForSelector('.start')
const menuBox = await mobilePage.locator('.start').boundingBox()
assert.ok(menuBox && menuBox.x >= 0 && menuBox.x + menuBox.width <= 390, 'start menu fits mobile')
assert.ok(await mobilePage.locator('.taskbar').isVisible(), 'taskbar visible on mobile')

await mobile.close()
await context.close()
await browser.close()

assert.deepEqual(errors, [], `browser errors: ${errors.join(' | ')}`)
console.log('SMOKE PASS: boot, login, WM, terminal, archive, settings, notes, snake, FM, persistence, mobile.')
