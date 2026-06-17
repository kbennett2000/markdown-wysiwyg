import type { Mode } from '../types'
import { FileGlyph, ChevronDown, Moon, Sun } from './icons'

interface Props {
  fileName: string
  dirty: boolean
  mode: Mode
  onToggleMenu: () => void
  onSetMode: (m: Mode) => void
  onToggleTheme: () => void
}

export default function TopBar({ fileName, dirty, mode, onToggleMenu, onSetMode, onToggleTheme }: Props) {
  return (
    <div className="bar">
      <div className="bar-left">
        <div className="brand">
          <FileGlyph />
          <span className="fname">{fileName}</span>
          <span className={'dot' + (dirty ? '' : ' saved')} />
        </div>
        <button className="menubtn" onClick={onToggleMenu}>
          File <ChevronDown />
        </button>
      </div>
      <div className="bar-right">
        <div className="segwrap">
          <button className={'seg' + (mode === 'editor' ? ' on' : '')} onClick={() => onSetMode('editor')}>
            Editor
          </button>
          <button className={'seg' + (mode === 'split' ? ' on' : '')} onClick={() => onSetMode('split')}>
            Split
          </button>
          <button className={'seg' + (mode === 'source' ? ' on' : '')} onClick={() => onSetMode('source')}>
            Source
          </button>
        </div>
        <button className="iconbtn" title="Toggle theme" onClick={onToggleTheme}>
          <Moon />
          <Sun />
        </button>
      </div>
    </div>
  )
}
