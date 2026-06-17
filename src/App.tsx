import { useCallback, useEffect, useRef, useState } from 'react'
import type { Mode, Theme, Fmt, DialogState, ToastState, ModalState, DriveState } from './types'
import { SAMPLE, DEFAULT_TABLE } from './sample'
import { makeTurndown, mdToHtml, htmlToMd } from './lib/convert'
import { buildStandaloneHtml, download, exportPdf } from './lib/exporters'
import {
  envClientId,
  requestToken,
  revokeToken,
  fetchEmail,
  saveToDrive,
  listDrive,
  openDriveFile,
  type DriveFile,
} from './lib/drive'
import TopBar from './components/TopBar'
import Toolbar, { type ToolbarCmds } from './components/Toolbar'
import FileMenu from './components/FileMenu'
import LinkImageDialog from './components/LinkImageDialog'
import DriveModals from './components/DriveModals'
import StatusBar from './components/StatusBar'
import Toast from './components/Toast'
import LoadingOverlay from './components/LoadingOverlay'

// ---- tweakable props (exposed on the prototype root) ----
interface AppProps {
  accentColor?: string
  startMode?: Mode
  serifBody?: boolean
}

// ---- pure DOM helpers (no component state) ----
const esc = (s: string) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const escAttr = (s: string) => String(s).replace(/"/g, '&quot;')
const selText = () => {
  const s = window.getSelection()
  return s ? s.toString() : ''
}
const queryState = (c: string) => {
  try {
    return document.queryCommandState(c)
  } catch {
    return false
  }
}
function currentBlock(): string {
  const sel = window.getSelection()
  if (!sel || !sel.rangeCount) return ''
  let n: Node | null = sel.anchorNode
  if (n && n.nodeType === 3) n = n.parentElement
  const el = n as Element | null
  const b = el && el.closest && el.closest('h1,h2,h3,h4,h5,h6,blockquote,pre,li')
  return b ? b.tagName.toLowerCase() : ''
}
function currentLi(): HTMLElement | null {
  const sel = window.getSelection()
  if (!sel || !sel.rangeCount) return null
  let n: Node | null = sel.anchorNode
  if (n && n.nodeType === 3) n = n.parentElement
  const el = n as Element | null
  return el && el.closest ? (el.closest('li') as HTMLElement | null) : null
}
function caretInto(el: Element) {
  try {
    const r = document.createRange()
    r.selectNodeContents(el)
    r.collapse(true)
    const s = window.getSelection()!
    s.removeAllRanges()
    s.addRange(r)
  } catch {
    /* ignore */
  }
}
function computeFmt(): Fmt {
  const block = currentBlock()
  return {
    bold: queryState('bold'),
    italic: queryState('italic'),
    strike: queryState('strikeThrough'),
    ul: queryState('insertUnorderedList'),
    ol: queryState('insertOrderedList'),
    block,
    quote: block === 'blockquote',
  }
}
const BLOCK_LABELS: Record<string, string> = {
  p: 'Paragraph',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  h5: 'Heading 5',
  h6: 'Heading 6',
  blockquote: 'Quote',
  pre: 'Code block',
  li: 'List item',
}

export default function App({ accentColor = '#3061e8', startMode = 'editor', serifBody = false }: AppProps) {
  const [mode, setMode] = useState<Mode>('editor')
  const [theme, setTheme] = useState<Theme>('light')
  const [ready, setReady] = useState(false)
  const [fmt, setFmt] = useState<Fmt>({})
  const [words, setWords] = useState(0)
  const [chars, setChars] = useState(0)
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [blockMenuOpen, setBlockMenuOpen] = useState(false)
  const [fileName, setFileName] = useState('untitled.md')
  const [dirty, setDirty] = useState(false)
  const [toastState, setToastState] = useState<ToastState | null>(null)
  const [modal, setModal] = useState<ModalState | null>(null)
  const [drive, setDrive] = useState<DriveState>({ clientId: null, token: null, email: null, fileId: null })

  // markdown — single source of truth, kept OUTSIDE React state so typing never
  // triggers a re-render that would disturb the caret.
  const mdRef = useRef<string>('')
  const editorRef = useRef<HTMLDivElement | null>(null)
  const sourceRef = useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const savedRange = useRef<Range | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef<number | null>(null)
  // mirror drive state into a ref so async handlers read current values
  const driveRef = useRef(drive)
  driveRef.current = drive

  const toast = useCallback((msg: string, err = false) => {
    setToastState({ msg, err })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastState(null), 2800)
  }, [])

  // ---- counts / sync ----
  const updateCounts = useCallback(() => {
    const tmp = document.createElement('div')
    tmp.innerHTML = mdToHtml(mdRef.current || '')
    const text = (tmp.textContent || '').trim()
    setWords(text ? (text.match(/\S+/g) || []).length : 0)
    setChars((mdRef.current || '').length)
  }, [])

  const syncFromEditor = useCallback(() => {
    const ed = editorRef.current
    if (!ed) return
    mdRef.current = htmlToMd(ed.innerHTML)
    if (sourceRef.current) sourceRef.current.value = mdRef.current
    updateCounts()
  }, [updateCounts])

  const enhance = useCallback(() => {
    const ed = editorRef.current
    if (!ed) return
    ed.querySelectorAll('input[type=checkbox]').forEach((cb) => {
      const box = cb as HTMLInputElement
      box.disabled = false
      box.addEventListener('change', () => syncFromEditor())
    })
  }, [syncFromEditor])

  const renderEditor = useCallback(() => {
    const ed = editorRef.current
    if (!ed) return
    ed.innerHTML = mdToHtml(mdRef.current || '')
    enhance()
  }, [enhance])

  const loadMd = useCallback(
    (md: string) => {
      mdRef.current = md || ''
      renderEditor()
      if (sourceRef.current) sourceRef.current.value = mdRef.current
      updateCounts()
    },
    [renderEditor, updateCounts]
  )

  const markDirty = useCallback(() => setDirty(true), [])

  const onEditorInput = useCallback(() => {
    syncFromEditor()
    markDirty()
  }, [syncFromEditor, markDirty])

  const onSourceInput = useCallback(
    (e: React.FormEvent<HTMLTextAreaElement>) => {
      mdRef.current = e.currentTarget.value
      if (mode === 'split' && editorRef.current && document.activeElement !== editorRef.current) renderEditor()
      updateCounts()
      markDirty()
    },
    [mode, renderEditor, updateCounts, markDirty]
  )

  // ---- boot + listeners ----
  useEffect(() => {
    makeTurndown()
    try {
      // emit <b>/<i>/<strike> tags (not styled spans) so output serializes cleanly
      document.execCommand('styleWithCSS', false, 'false')
    } catch {
      /* ignore */
    }
    mdRef.current = SAMPLE
    renderEditor()
    if (sourceRef.current) sourceRef.current.value = mdRef.current
    updateCounts()
    setReady(true)
    setMode(startMode)

    // restore a configured Drive client id (env build-time, else last-used)
    let storedCid: string | null = null
    try {
      storedCid = envClientId() || localStorage.getItem('mdedit_gdrive_client')
    } catch {
      storedCid = envClientId()
    }
    if (storedCid) setDrive((d) => ({ ...d, clientId: storedCid }))

    const onSelChange = () => {
      if (document.activeElement !== editorRef.current) return
      if (rafRef.current != null) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        setFmt(computeFmt())
      })
    }
    document.addEventListener('selectionchange', onSelChange)
    return () => {
      document.removeEventListener('selectionchange', onSelChange)
      if (toastTimer.current) clearTimeout(toastTimer.current)
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- mode switch: repopulate newly-visible panes from md ----
  useEffect(() => {
    if (!ready) return
    if ((mode === 'editor' || mode === 'split') && document.activeElement !== editorRef.current) renderEditor()
    if ((mode === 'source' || mode === 'split') && sourceRef.current) sourceRef.current.value = mdRef.current
  }, [mode, ready, renderEditor])

  // ---- command primitives ----
  const focusEd = () => editorRef.current?.focus()
  const afterCmd = useCallback(() => {
    syncFromEditor()
    setFmt(computeFmt())
  }, [syncFromEditor])
  const exec = useCallback(
    (cmd: string) => {
      focusEd()
      try {
        document.execCommand(cmd, false)
      } catch {
        /* ignore */
      }
      afterCmd()
    },
    [afterCmd]
  )
  const insertHTML = useCallback(
    (html: string) => {
      focusEd()
      try {
        document.execCommand('insertHTML', false, html)
      } catch {
        /* ignore */
      }
      afterCmd()
    },
    [afterCmd]
  )
  const toggleBlock = useCallback(
    (tag: string) => {
      focusEd()
      const cur = currentBlock()
      const target = cur === tag.toLowerCase() ? 'P' : tag
      try {
        document.execCommand('formatBlock', false, target)
      } catch {
        /* ignore */
      }
      afterCmd()
    },
    [afterCmd]
  )
  const applyBlock = useCallback(
    (tag: string) => {
      focusEd()
      try {
        document.execCommand('formatBlock', false, tag)
      } catch {
        /* ignore */
      }
      setBlockMenuOpen(false)
      afterCmd()
    },
    [afterCmd]
  )

  const task = useCallback(() => {
    focusEd()
    try {
      document.execCommand('insertUnorderedList', false)
    } catch {
      /* ignore */
    }
    const li = currentLi()
    if (li && !li.querySelector('input[type=checkbox]')) {
      const box = document.createElement('input')
      box.type = 'checkbox'
      box.addEventListener('change', () => syncFromEditor())
      li.insertBefore(document.createTextNode(' '), li.firstChild)
      li.insertBefore(box, li.firstChild)
    }
    afterCmd()
  }, [afterCmd, syncFromEditor])

  const hr = useCallback(() => {
    focusEd()
    try {
      document.execCommand('insertHorizontalRule', false)
    } catch {
      try {
        document.execCommand('insertHTML', false, '<hr>')
      } catch {
        /* ignore */
      }
    }
    afterCmd()
  }, [afterCmd])

  const indent = useCallback(() => {
    focusEd()
    const li = currentLi()
    if (li) {
      let prev = li.previousElementSibling
      while (prev && prev.tagName !== 'LI') prev = prev.previousElementSibling
      if (prev && prev.tagName === 'LI') {
        const tag = (li.parentElement?.tagName || 'UL').toLowerCase()
        let sub = prev.querySelector(':scope > ul, :scope > ol')
        if (!sub) {
          sub = document.createElement(tag)
          prev.appendChild(sub)
        }
        sub.appendChild(li)
        caretInto(li)
      }
    } else {
      try {
        document.execCommand('indent', false)
      } catch {
        /* ignore */
      }
    }
    afterCmd()
  }, [afterCmd])

  const outdent = useCallback(() => {
    focusEd()
    const li = currentLi()
    if (li) {
      const sublist = li.parentElement
      const parentLi = sublist && sublist.parentElement
      if (parentLi && parentLi.tagName === 'LI') {
        const grand = parentLi.parentElement!
        grand.insertBefore(li, parentLi.nextSibling)
        if (!sublist!.querySelector('li')) sublist!.remove()
        caretInto(li)
      }
    } else {
      try {
        document.execCommand('outdent', false)
      } catch {
        /* ignore */
      }
    }
    afterCmd()
  }, [afterCmd])

  // ---- link / image dialog ----
  const saveRange = () => {
    const s = window.getSelection()
    savedRange.current = s && s.rangeCount ? s.getRangeAt(0).cloneRange() : null
  }
  const restoreRange = () => {
    focusEd()
    if (savedRange.current) {
      const s = window.getSelection()!
      s.removeAllRanges()
      s.addRange(savedRange.current)
    }
  }
  const openLink = () => {
    saveRange()
    setDialog({ type: 'link', url: '', text: selText() })
  }
  const openImage = () => {
    saveRange()
    setDialog({ type: 'image', url: '', text: '' })
  }
  const dialogConfirm = () => {
    const d = dialog
    if (!d) return
    const url = (d.url || '').trim()
    if (url) {
      restoreRange()
      if (d.type === 'link') {
        if (selText()) {
          try {
            document.execCommand('createLink', false, url)
          } catch {
            /* ignore */
          }
        } else {
          try {
            document.execCommand('insertHTML', false, '<a href="' + escAttr(url) + '">' + esc(d.text || url) + '</a>')
          } catch {
            /* ignore */
          }
        }
      } else {
        try {
          document.execCommand('insertHTML', false, '<img src="' + escAttr(url) + '" alt="' + esc(d.text || '') + '">')
        } catch {
          /* ignore */
        }
      }
      syncFromEditor()
    }
    setDialog(null)
  }

  const cmds: ToolbarCmds = {
    bold: () => exec('bold'),
    italic: () => exec('italic'),
    strike: () => exec('strikeThrough'),
    inlineCode: () => insertHTML('<code>' + esc(selText() || 'code') + '</code>'),
    codeBlock: () => insertHTML('<pre><code>' + esc(selText() || 'code') + '</code></pre>'),
    ul: () => exec('insertUnorderedList'),
    ol: () => exec('insertOrderedList'),
    task,
    outdent,
    indent,
    quote: () => toggleBlock('BLOCKQUOTE'),
    openLink,
    openImage,
    table: () => insertHTML(DEFAULT_TABLE),
    hr,
    undo: () => exec('undo'),
    redo: () => exec('redo'),
    applyBlock,
  }

  // ---- file helpers ----
  const baseName = () => (fileName || 'untitled.md').replace(/\.[^.]+$/, '') || 'untitled'
  const withExt = (ext: string) => baseName() + '.' + ext

  const doNew = () => {
    loadMd('# Untitled\n\n')
    setMenuOpen(false)
    setFileName('untitled.md')
    setDirty(false)
    setDrive((d) => ({ ...d, fileId: null }))
  }
  const doOpenLocal = () => {
    setMenuOpen(false)
    fileInputRef.current?.click()
  }
  const onFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      let text = String(reader.result || '')
      const isHtml = /\.(html?|htm)$/i.test(file.name) || /^\s*<(!doctype|html|div|h\d|p|article)/i.test(text)
      if (isHtml) text = htmlToMd(text)
      loadMd(text)
      const name = file.name.replace(/\.(html?|htm|txt)$/i, '.md')
      setFileName(name)
      setDirty(false)
      setDrive((d) => ({ ...d, fileId: null }))
      toast('Opened ' + file.name)
    }
    reader.readAsText(file)
    e.target.value = ''
  }
  const doExportMd = () => {
    setMenuOpen(false)
    download(withExt('md'), 'text/markdown;charset=utf-8', mdRef.current || '')
    toast('Downloaded ' + withExt('md'))
  }
  const doExportHtml = () => {
    setMenuOpen(false)
    download(withExt('html'), 'text/html;charset=utf-8', buildStandaloneHtml(mdRef.current || '', baseName()))
    toast('Downloaded ' + withExt('html'))
  }
  const doExportPdf = () => {
    setMenuOpen(false)
    exportPdf(mdRef.current || '', baseName())
    toast('Opening print dialog… choose “Save as PDF”')
  }

  // ---- google drive (online-only) ----
  const driveErr = (e: unknown) => (e instanceof Error ? e.message : 'Google Drive error')
  const getToken = async (cid: string): Promise<string | null> => {
    if (driveRef.current.token) return driveRef.current.token
    try {
      const t = await requestToken(cid)
      setDrive((d) => ({ ...d, token: t }))
      fetchEmail(t).then((email) => {
        if (email) setDrive((d) => ({ ...d, email }))
      })
      return t
    } catch (e) {
      toast(driveErr(e), true)
      return null
    }
  }
  const ensureToken = async (): Promise<string | null> => {
    const cid = driveRef.current.clientId || envClientId()
    if (!cid) {
      setMenuOpen(false)
      setModal({ kind: 'driveSetup', value: '' })
      return null
    }
    return getToken(cid)
  }
  const doSaveDrive = async () => {
    setMenuOpen(false)
    const tok = await ensureToken()
    if (!tok) return
    try {
      const res = await saveToDrive(tok, withExt('md'), mdRef.current || '', driveRef.current.fileId)
      setDrive((d) => ({ ...d, fileId: res.id }))
      setFileName(res.name)
      setDirty(false)
      toast('Saved to Google Drive')
    } catch {
      toast('Drive save failed', true)
    }
  }
  const doOpenDrive = async () => {
    setMenuOpen(false)
    const tok = await ensureToken()
    if (!tok) return
    setModal({ kind: 'driveOpen', loading: true, files: [] })
    try {
      const files = await listDrive(tok)
      setModal({ kind: 'driveOpen', loading: false, files })
    } catch {
      setModal(null)
      toast('Could not list Drive files', true)
    }
  }
  const onOpenDriveFile = async (f: DriveFile) => {
    const tok = driveRef.current.token
    if (!tok) return
    try {
      const txt = await openDriveFile(tok, f.id)
      loadMd(txt)
      setFileName(f.name)
      setDrive((d) => ({ ...d, fileId: f.id }))
      setDirty(false)
      setModal(null)
      toast('Opened ' + f.name)
    } catch {
      toast('Could not open file', true)
    }
  }
  const doDriveToggle = async () => {
    setMenuOpen(false)
    if (driveRef.current.token) {
      revokeToken(driveRef.current.token)
      setDrive((d) => ({ ...d, token: null, email: null, fileId: null }))
      toast('Disconnected from Drive')
    } else {
      const tok = await ensureToken()
      if (tok) toast('Google Drive connected')
    }
  }
  const saveClientId = async () => {
    const v = (modal && modal.kind === 'driveSetup' ? modal.value : '').trim()
    if (!v) return
    try {
      localStorage.setItem('mdedit_gdrive_client', v)
    } catch {
      /* ignore */
    }
    setDrive((d) => ({ ...d, clientId: v }))
    setModal(null)
    const tok = await getToken(v)
    if (tok) toast('Google Drive connected')
  }
  const fmtWhen = (iso?: string) => {
    if (!iso) return ''
    try {
      return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    } catch {
      return ''
    }
  }

  // ---- derived view values ----
  const blockLabel = BLOCK_LABELS[fmt.block || ''] || 'Paragraph'
  const driveLabel = drive.email
    ? drive.email + ' · Disconnect'
    : drive.token
      ? 'Disconnect Drive'
      : 'Connect Google Drive'
  const shellStyle = {
    ['--accent' as string]: accentColor,
    ['--accent-soft' as string]: accentColor + '20',
  } as React.CSSProperties

  return (
    <div
      className={'shell' + (ready ? ' ready' : '')}
      data-mode={mode}
      data-theme={theme}
      style={shellStyle}
    >
      <TopBar
        fileName={fileName}
        dirty={dirty}
        mode={mode}
        onToggleMenu={() => setMenuOpen((o) => !o)}
        onSetMode={setMode}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      />

      <Toolbar
        fmt={fmt}
        blockLabel={blockLabel}
        blockMenuOpen={blockMenuOpen}
        onToggleBlockMenu={() => {
          setBlockMenuOpen((o) => !o)
          setFmt(computeFmt())
        }}
        onCloseBlockMenu={() => setBlockMenuOpen(false)}
        keepFocus={(e) => e.preventDefault()}
        cmds={cmds}
      />

      <div className="panes">
        <div className="pane pane-editor">
          <div className="page">
            <div
              className={'doc' + (serifBody ? ' serif' : '')}
              contentEditable
              suppressContentEditableWarning
              spellCheck
              ref={editorRef}
              onInput={onEditorInput}
            />
          </div>
        </div>
        <div className="pane pane-source">
          <textarea className="src" spellCheck={false} ref={sourceRef} onInput={onSourceInput} />
        </div>
      </div>

      <StatusBar words={words} chars={chars} />

      {dialog && (
        <LinkImageDialog
          dialog={dialog}
          onChange={(patch) => setDialog((d) => (d ? { ...d, ...patch } : d))}
          onConfirm={dialogConfirm}
          onCancel={() => setDialog(null)}
        />
      )}

      <input
        type="file"
        accept=".md,.markdown,.txt,.html,.htm,text/markdown,text/html"
        ref={fileInputRef}
        onChange={onFileChosen}
        style={{ display: 'none' }}
      />

      {menuOpen && (
        <FileMenu
          driveLabel={driveLabel}
          onClose={() => setMenuOpen(false)}
          onNew={doNew}
          onOpenLocal={doOpenLocal}
          onOpenDrive={doOpenDrive}
          onExportMd={doExportMd}
          onExportHtml={doExportHtml}
          onExportPdf={doExportPdf}
          onSaveDrive={doSaveDrive}
          onDriveToggle={doDriveToggle}
        />
      )}

      {modal && (
        <DriveModals
          modal={modal}
          onClose={() => setModal(null)}
          onSetupChange={(value) => setModal((m) => (m && m.kind === 'driveSetup' ? { ...m, value } : m))}
          onSetupConfirm={saveClientId}
          onOpenFile={onOpenDriveFile}
          fmtWhen={fmtWhen}
        />
      )}

      {toastState && <Toast toast={toastState} />}

      {!ready && <LoadingOverlay />}
    </div>
  )
}
