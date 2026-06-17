import type { Fmt } from '../types'
import {
  ChevronDown,
  CodeChevrons,
  BulletList,
  TaskList,
  Outdent,
  Indent,
  Quote,
  LinkIcon,
  ImageIcon,
  TableIcon,
  HrIcon,
} from './icons'

export interface ToolbarCmds {
  bold: () => void
  italic: () => void
  strike: () => void
  inlineCode: () => void
  codeBlock: () => void
  ul: () => void
  ol: () => void
  task: () => void
  outdent: () => void
  indent: () => void
  quote: () => void
  openLink: () => void
  openImage: () => void
  table: () => void
  hr: () => void
  undo: () => void
  redo: () => void
  applyBlock: (tag: string) => void
}

interface Props {
  fmt: Fmt
  blockLabel: string
  blockMenuOpen: boolean
  onToggleBlockMenu: () => void
  onCloseBlockMenu: () => void
  keepFocus: (e: React.MouseEvent) => void
  cmds: ToolbarCmds
}

const BLOCKS: { tag: string; label: string; style: React.CSSProperties; match: string[] }[] = [
  { tag: 'P', label: 'Paragraph', style: { fontSize: 14 }, match: ['p', '', 'li'] },
  { tag: 'H1', label: 'Heading 1', style: { fontSize: 20, fontWeight: 600, letterSpacing: '-.01em' }, match: ['h1'] },
  { tag: 'H2', label: 'Heading 2', style: { fontSize: 17, fontWeight: 600 }, match: ['h2'] },
  { tag: 'H3', label: 'Heading 3', style: { fontSize: 15, fontWeight: 600 }, match: ['h3'] },
  { tag: 'H4', label: 'Heading 4', style: { fontSize: 14, fontWeight: 650 }, match: ['h4'] },
  { tag: 'H5', label: 'Heading 5', style: { fontSize: 13, fontWeight: 650 }, match: ['h5'] },
  { tag: 'H6', label: 'Heading 6', style: { fontSize: 12, fontWeight: 650, textTransform: 'uppercase', letterSpacing: '.05em' }, match: ['h6'] },
]

export default function Toolbar({
  fmt,
  blockLabel,
  blockMenuOpen,
  onToggleBlockMenu,
  onCloseBlockMenu,
  keepFocus,
  cmds,
}: Props) {
  const blk = fmt.block || ''
  const cls = (on?: boolean) => 'tb' + (on ? ' on' : '')
  return (
    <div className="toolbar" onMouseDown={keepFocus}>
      <div className="blockwrap">
        <button className="blockbtn" title="Text style" onClick={onToggleBlockMenu}>
          {blockLabel} <ChevronDown />
        </button>
        {blockMenuOpen && (
          <>
            <div className="menu-back" onMouseDown={onCloseBlockMenu} />
            <div className="blockmenu">
              {BLOCKS.map((b) => (
                <button
                  key={b.tag}
                  className={'bmi' + (b.match.includes(blk) ? ' on' : '')}
                  style={b.style}
                  onClick={() => cmds.applyBlock(b.tag)}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <span className="sep" />
      <button className={cls(fmt.bold) + ' b'} title="Bold  (⌘B)" onClick={cmds.bold}>
        B
      </button>
      <button className={cls(fmt.italic) + ' i'} title="Italic  (⌘I)" onClick={cmds.italic}>
        I
      </button>
      <button className={cls(fmt.strike) + ' s'} title="Strikethrough" onClick={cmds.strike}>
        S
      </button>
      <span className="sep" />
      <button className="tb" title="Inline code" onClick={cmds.inlineCode}>
        <CodeChevrons />
      </button>
      <button className="tb" title="Code block" onClick={cmds.codeBlock}>
        {'{ }'}
      </button>
      <span className="sep" />
      <button className={cls(fmt.ul)} title="Bullet list" onClick={cmds.ul}>
        <BulletList />
      </button>
      <button className={cls(fmt.ol)} title="Numbered list" onClick={cmds.ol}>
        1.
      </button>
      <button className="tb" title="Task list" onClick={cmds.task}>
        <TaskList />
      </button>
      <button className="tb" title="Outdent" onClick={cmds.outdent}>
        <Outdent />
      </button>
      <button className="tb" title="Indent" onClick={cmds.indent}>
        <Indent />
      </button>
      <span className="sep" />
      <button className={cls(fmt.quote)} title="Blockquote" onClick={cmds.quote}>
        <Quote />
      </button>
      <button className="tb" title="Link" onClick={cmds.openLink}>
        <LinkIcon />
      </button>
      <button className="tb" title="Image" onClick={cmds.openImage}>
        <ImageIcon />
      </button>
      <button className="tb" title="Table" onClick={cmds.table}>
        <TableIcon />
      </button>
      <button className="tb" title="Horizontal rule" onClick={cmds.hr}>
        <HrIcon />
      </button>
      <span className="spacer" />
      <button className="tb" title="Undo" onClick={cmds.undo}>
        ↶
      </button>
      <button className="tb" title="Redo" onClick={cmds.redo}>
        ↷
      </button>
    </div>
  )
}
