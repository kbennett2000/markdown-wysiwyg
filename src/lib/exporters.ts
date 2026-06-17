import { mdToHtml } from './convert'

// Clean standalone stylesheet for exported HTML / PDF (ported from the prototype).
const EXPORT_CSS =
  "html{-webkit-print-color-adjust:exact;print-color-adjust:exact}body{margin:0;background:#fff;color:#1b1b18}.md{max-width:720px;margin:0 auto;padding:48px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.7}.md>*:first-child{margin-top:0}.md h1{font-size:2em;font-weight:600;line-height:1.2;letter-spacing:-.02em;margin:1.4em 0 .5em}.md h2{font-size:1.5em;font-weight:600;margin:1.4em 0 .45em;padding-bottom:.2em;border-bottom:1px solid #ecece6}.md h3{font-size:1.2em;font-weight:600;margin:1.3em 0 .4em}.md h4,.md h5,.md h6{font-weight:600;margin:1.2em 0 .4em}.md p{margin:0 0 1em}.md ul,.md ol{margin:0 0 1em;padding-left:1.6em}.md li{margin:.3em 0}.md li:has(>input[type=checkbox]){list-style:none;margin-left:-1.4em}.md input[type=checkbox]{margin-right:.5em}.md a{color:#2456d6}.md strong{font-weight:650}.md code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.88em;background:#f1f1ec;border:1px solid #e6e6df;padding:.1em .35em;border-radius:4px}.md pre{background:#f6f6f1;border:1px solid #e6e6df;border-radius:8px;padding:14px 16px;overflow:auto;margin:0 0 1em}.md pre code{background:none;border:none;padding:0;font-size:.85em;line-height:1.6}.md blockquote{margin:0 0 1em;padding:.2em 0 .2em 1em;border-left:3px solid #2456d6;color:#5a5a52}.md table{border-collapse:collapse;width:100%;margin:0 0 1em;font-size:.95em}.md th,.md td{border:1px solid #d7d7ce;padding:8px 12px;text-align:left}.md th{background:#f4f4ee;font-weight:600}.md img{max-width:100%;border-radius:8px}.md hr{border:none;border-top:1px solid #d7d7ce;margin:1.6em 0}"

function esc(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Build a self-contained HTML document from markdown. */
export function buildStandaloneHtml(md: string, title: string, forPrint = false): string {
  const body = mdToHtml(md || '')
  const pageCss = forPrint ? '@page{margin:18mm}' : ''
  return (
    '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' +
    esc(title) +
    '</title><style>' +
    EXPORT_CSS +
    pageCss +
    '</style></head><body><article class="md">' +
    body +
    '</article></body></html>'
  )
}

/** Trigger a browser download of `content` as `filename`. */
export function download(filename: string, mime: string, content: string): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

/**
 * Export to PDF by writing standalone HTML into a hidden iframe and invoking the
 * browser print dialog ("Save as PDF"). Avoids popup blockers; iframe is cleaned
 * up on afterprint (with a long-timeout fallback).
 */
export function exportPdf(md: string, title: string): void {
  const html = buildStandaloneHtml(md, title, true)
  const ifr = document.createElement('iframe')
  ifr.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0'
  document.body.appendChild(ifr)
  const d = ifr.contentWindow!.document
  d.open()
  d.write(html)
  d.close()
  const fire = () => {
    try {
      ifr.contentWindow!.focus()
      ifr.contentWindow!.print()
    } catch {
      /* ignore */
    }
  }
  ifr.contentWindow!.onafterprint = () => {
    setTimeout(() => ifr.remove(), 200)
  }
  setTimeout(fire, 350)
  setTimeout(() => {
    if (ifr.parentNode) ifr.remove()
  }, 60000)
}
