// Renders the README banner as a PNG, fully offline, using the app's bundled
// IBM Plex fonts + accent color. Run: npm run banner
import { chromium } from 'playwright-core'
import { readFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const out = resolve(root, 'docs/images')
mkdirSync(out, { recursive: true })

const ACCENT = '#3061e8'

const font = (pkg, file) => {
  const p = resolve(root, 'node_modules/@fontsource', pkg, 'files', file)
  return 'data:font/woff2;base64,' + readFileSync(p).toString('base64')
}
const sans400 = font('ibm-plex-sans', 'ibm-plex-sans-latin-400-normal.woff2')
const sans600 = font('ibm-plex-sans', 'ibm-plex-sans-latin-600-normal.woff2')
const sans700 = font('ibm-plex-sans', 'ibm-plex-sans-latin-700-normal.woff2')
const mono500 = font('ibm-plex-mono', 'ibm-plex-mono-latin-500-normal.woff2')

const W = 1280
const H = 340

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'IBM Plex Sans';font-weight:400;src:url(${sans400}) format('woff2')}
@font-face{font-family:'IBM Plex Sans';font-weight:600;src:url(${sans600}) format('woff2')}
@font-face{font-family:'IBM Plex Sans';font-weight:700;src:url(${sans700}) format('woff2')}
@font-face{font-family:'IBM Plex Mono';font-weight:500;src:url(${mono500}) format('woff2')}
*{margin:0;padding:0;box-sizing:border-box}
.banner{width:${W}px;height:${H}px;position:relative;overflow:hidden;
  background:
    radial-gradient(120% 140% at 88% -20%, rgba(48,97,232,.20), transparent 55%),
    radial-gradient(90% 120% at 10% 120%, rgba(48,97,232,.10), transparent 50%),
    linear-gradient(135deg,#fbfbff 0%, #f4f6fd 45%, #eef2fe 100%);
  font-family:'IBM Plex Sans',sans-serif;display:flex;align-items:center}
.left{padding:0 0 0 72px;max-width:660px}
.eyebrow{display:inline-flex;align-items:center;gap:8px;font-family:'IBM Plex Mono',monospace;
  font-weight:500;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:${ACCENT};
  background:rgba(48,97,232,.10);border:1px solid rgba(48,97,232,.22);
  padding:6px 12px;border-radius:999px;margin-bottom:22px}
.eyebrow .dot{width:7px;height:7px;border-radius:50%;background:${ACCENT}}
h1{font-weight:700;font-size:60px;line-height:1.04;letter-spacing:-.025em;color:#16181d}
h1 .accent{color:${ACCENT}}
.tag{margin-top:18px;font-weight:400;font-size:22px;line-height:1.5;color:#5b5f6b;max-width:560px}
/* faux app window on the right */
.win{position:absolute;right:-40px;top:46px;width:430px;height:300px;background:#fff;
  border:1px solid #e7e7e1;border-radius:16px 16px 0 0;
  box-shadow:0 30px 70px rgba(30,40,80,.20);overflow:hidden}
.win .bar{height:38px;background:#fbfbf9;border-bottom:1px solid #ecece6;display:flex;align-items:center;gap:7px;padding:0 14px}
.win .bar i{width:11px;height:11px;border-radius:50%;display:block}
.win .bar .r{background:#f0625a}.win .bar .y{background:#f4bf4f}.win .bar .g{background:#5bc46b}
.win .tb{height:34px;background:#f2f2ee;border-bottom:1px solid #e7e7e1;display:flex;align-items:center;gap:6px;padding:0 14px}
.win .tb b{font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:12px;color:#76766c;
  background:#fff;border:1px solid #e7e7e1;border-radius:6px;padding:5px 9px}
.win .tb s{width:26px;height:22px;border-radius:6px;background:rgba(48,97,232,.10);display:block;text-decoration:none}
.win .doc{padding:22px 22px}
.win .doc .h{height:18px;width:62%;background:#1b1b18;border-radius:5px;opacity:.85}
.win .doc .l{height:10px;border-radius:5px;background:#d9d9d2;margin-top:14px}
.win .doc .l.w1{width:92%}.win .doc .l.w2{width:84%}.win .doc .l.w3{width:70%}
.win .doc .chip{display:inline-block;height:10px;width:120px;border-radius:5px;background:rgba(48,97,232,.30);margin-top:18px}
</style></head><body>
<div class="banner">
  <div class="left">
    <span class="eyebrow"><span class="dot"></span>Markdown, made friendly</span>
    <h1>Markdown <span class="accent">WYSIWYG</span></h1>
    <p class="tag">Write beautifully &mdash; like a normal word processor.<br>No symbols to learn, no syntax to memorize.</p>
  </div>
  <div class="win">
    <div class="bar"><i class="r"></i><i class="y"></i><i class="g"></i></div>
    <div class="tb"><b>Paragraph &#9662;</b><s></s><s></s><s></s></div>
    <div class="doc">
      <div class="h"></div>
      <div class="l w1"></div><div class="l w2"></div><div class="l w3"></div>
      <span class="chip"></span>
    </div>
  </div>
</div>
</body></html>`

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 })
await page.setContent(html, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
const el = await page.$('.banner')
await el.screenshot({ path: resolve(out, 'banner.png') })
await browser.close()
console.log('wrote docs/images/banner.png')
