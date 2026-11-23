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

async function enter(page) {
  await page.mouse.click(720, 420)
  await page.waitForTimeout(300)
  await page.mouse.click(720, 420)
  await page.waitForSelector('.gdm__panel')
  await page.locator('.gdm__form input').fill('password')
  await page.locator('.gdm__form button').click()
  await page.waitForSelector('.desktop')
  await page.waitForTimeout(450)
}

async function openDock(page, title) {
  await page.locator(`.dock__app[title="${title}"]`).click()
  await page.waitForTimeout(400)
}

const browser = await launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await context.newPage()
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})

await page.goto(url, { waitUntil: 'networkidle' })
await page.evaluate(() => {
  localStorage.setItem('matrixx.fm.v1', 'null')
  localStorage.setItem('matrixx.snake.v1', 'null')
  localStorage.setItem('matrixx.settings.v1', 'null')
  localStorage.setItem('matrixx.session.v1', 'null')
  localStorage.setItem('matrixx.notes.v1', 'null')
})
await page.reload({ waitUntil: 'networkidle' })
await enter(page)

const terminal = page.locator('.win[data-app="terminal"]').first()
assert.equal(await terminal.count(), 1, 'terminal auto-opens with corrupt storage')
await terminal.locator('.term__input').click()
await page.keyboard.type('open __proto__')
await page.keyboard.press('Enter')
await page.waitForTimeout(200)
assert.match(
  await terminal.locator('.term__scroll').innerText(),
  /unknown application/i,
  'prototype alias is rejected',
)
assert.equal(await page.locator('.error-screen').count(), 0, 'prototype alias does not crash the shell')

await openDock(page, 'Music')
assert.equal(await page.locator('.fm').count(), 1, 'music opens with null storage')
assert.equal(await page.locator('.error-screen').count(), 0, 'null FM storage does not brick the OS')
await page.locator('.win[data-app="fm"] .win__ctl--close').click()

await openDock(page, 'Snake')
assert.equal(await page.locator('.snake').count(), 1, 'snake opens with null storage')
assert.equal(await page.locator('.error-screen').count(), 0, 'null snake storage does not brick the OS')
await page.locator('.win[data-app="snake"] .win__ctl--close').click()

await openDock(page, 'Text Editor')
await page.locator('.notes__new').click()
await page.locator('.notes__body').fill('unmount-marker-47.2')
await page.locator('.win[data-app="notes"] .win__ctl--close').click()
await page.waitForTimeout(150)
await openDock(page, 'Text Editor')
assert.match(
  await page.locator('.notes__body').inputValue(),
  /unmount-marker-47\.2/,
  'editor flushes pending changes on close',
)

const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').count()
assert.equal(csp, 1, 'CSP meta is present')
assert.equal(await page.locator('.error-screen').count(), 0, 'no fatal error screen')

assert.deepEqual(errors, [], `page errors: ${errors.join(' | ')}`)
console.log('SECURITY REGRESSION PASS: null storage, unmount flush, prototype alias, CSP.')

await context.close()
await browser.close()
