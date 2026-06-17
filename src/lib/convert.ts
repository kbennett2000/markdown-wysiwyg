import { marked } from 'marked'
import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'

// marked: GFM is enabled by default in v12 (tables, task lists, strikethrough).
// `breaks:false` and `gfm:true` mirror the prototype's expectations.
marked.setOptions({ gfm: true, breaks: false })

let td: TurndownService | null = null

/** Build the configured Turndown (HTML → markdown) instance once. */
export function makeTurndown(): TurndownService {
  if (td) return td
  const t = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '*',
    hr: '---',
    linkStyle: 'inlined',
  })
  t.use(gfm)
  // Map <del>/<s>/<strike> to GFM strikethrough.
  t.addRule('strike', {
    filter: ['del', 's', 'strike' as keyof HTMLElementTagNameMap],
    replacement: (content) => '~~' + content + '~~',
  })
  td = t
  return t
}

/** markdown → HTML string. */
export function mdToHtml(md: string): string {
  try {
    return marked.parse(md ?? '') as string
  } catch {
    return '<p>' + (md ?? '') + '</p>'
  }
}

/** HTML → markdown string. */
export function htmlToMd(html: string): string {
  try {
    return makeTurndown().turndown(html)
  } catch {
    return html
  }
}
