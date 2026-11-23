import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const url = 'http://localhost:4173/'

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
  await page.waitForTimeout(320)
  await page.mouse.click(720, 420)
  await page.waitForSelector('.login__card')
  await page.locator('.login__submit').click()
  await page.waitForSelector('.desktop')
  await page.waitForTimeout(400)
}

async function openApp(page, name) {
  await page.locator('.start-btn').click()
  await page.waitForSelector('.start')
  await page.getByRole('menuitem', { name }).click()
  await page.waitForTimeout(400)
}

const browser = await launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await context.newPage()
const errors = []
page.on('pageerror', (error) => errors.push(error.message))

await page.goto(url, { waitUntil: 'networkidle' })
await page.evaluate(() => {
  localStorage.setItem('matrixx.fm.v1', 'null')
  localStorage.setItem('matrixx.snake.v1', 'null')
  localStorage.setItem('matrixx.settings.v1', 'null')
  localStorage.setItem('matrixx.session.v1', 'null')
})
await page.reload({ waitUntil: 'networkidle' })
await enter(page)

await openApp(page, /MATRIXX FM/)
assert.equal(await page.locator('.fm').count(), 1, 'FM opens with null storage')
assert.equal(await page.locator('.error-screen').count(), 0, 'FM null storage does not brick the OS')

await openApp(page, /ЗМЕЙ/)
assert.equal(await page.locator('.snake').count(), 1, 'snake opens with null storage')
assert.equal(await page.locator('.error-screen').count(), 0, 'snake null storage does not brick the OS')

await openApp(page, /ЖУРНАЛ/)
await page.locator('.notes__new').click()
await page.locator('.notes__body').fill('маркер-47.2-до-закрытия')
await page.locator('.win[data-app="notes"] .win__ctl--close').click()
await page.waitForTimeout(150)
await openApp(page, /ЖУРНАЛ/)
assert.match(
  await page.locator('.notes__body').inputValue(),
  /маркер-47\.2-до-закрытия/,
  'notes flush on unmount',
)

await openApp(page, /ТЕРМИНАЛ/)
const lastTerminal = page.locator('.win[data-app="terminal"]').last()
await lastTerminal.locator('.term__input').click()
await page.keyboard.type('open __proto__')
await page.keyboard.press('Enter')
await page.waitForTimeout(200)
assert.match(await lastTerminal.locator('.term__scroll').innerText(), /неизвестный модуль/i, 'prototype alias rejected')
assert.equal(await page.locator('.error-screen').count(), 0, 'no crash on prototype alias')

const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').count()
assert.equal(csp, 1, 'CSP meta present')

assert.deepEqual(errors, [], `page errors: ${errors.join(' | ')}`)
console.log('SECURITY REGRESSION PASS: null storage, unmount flush, prototype alias, CSP.')

await context.close()
await browser.close()
