// Captures app screenshots for the docs, fully offline, against a local preview
// server. Run: npm run screenshots  (builds first, see package.json)
import { chromium } from 'playwright-core'
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const out = resolve(root, 'docs/images')
mkdirSync(out, { recursive: true })

const PORT = 4319
const BASE = `http://localhost:${PORT}/`

// ---- start `vite preview` and wait until it answers ----
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
  cwd: root,
  stdio: 'ignore',
})
const waitForServer = async () => {
  for (let i = 0; i < 100; i++) {
    try {
      const r = await fetch(BASE)
      if (r.ok) return
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 150))
  }
  throw new Error('preview server did not start')
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

try {
  await waitForServer()
  const browser = await chromium.launch({ channel: 'chrome' })
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 })
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForSelector('.shell.ready', { timeout: 15000 })
  await page.evaluate(() => document.fonts.ready)
  await sleep(400)

  const shot = (name) => page.screenshot({ path: resolve(out, name) })
  const seg = (label) => page.locator('button.seg', { hasText: label }).click()

  // Editor, light
  await shot('editor-light.png')

  // Toolbar close-up (clipped to the toolbar element)
  const tb = await page.$('.toolbar')
  await tb.screenshot({ path: resolve(out, 'toolbar.png') })

  // File menu open
  await page.locator('.menubtn').click()
  await sleep(250)
  await shot('file-menu.png')
  await page.keyboard.press('Escape')
  await page.locator('.menu-back').click({ force: true }).catch(() => {})
  await sleep(150)

  // Split view
  await seg('Split')
  await sleep(300)
  await shot('split.png')

  // Source view
  await seg('Source')
  await sleep(300)
  await shot('source.png')

  // Back to editor, then dark theme
  await seg('Editor')
  await sleep(200)
  await page.locator('.iconbtn[title="Toggle theme"]').click()
  await sleep(300)
  await shot('editor-dark.png')

  await browser.close()
  console.log('wrote screenshots to docs/images/')
} finally {
  server.kill('SIGTERM')
}
