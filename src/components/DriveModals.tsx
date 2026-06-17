import { useEffect, useRef } from 'react'
import type { ModalState } from '../types'
import type { DriveFile } from '../lib/drive'
import { FileSmall } from './icons'

interface Props {
  modal: ModalState
  onClose: () => void
  onSetupChange: (value: string) => void
  onSetupConfirm: () => void
  onOpenFile: (f: DriveFile) => void
  fmtWhen: (iso?: string) => string
}

export default function DriveModals({
  modal,
  onClose,
  onSetupChange,
  onSetupConfirm,
  onOpenFile,
  fmtWhen,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (modal.kind === 'driveSetup') inputRef.current?.focus()
  }, [modal.kind])

  if (modal.kind === 'driveSetup') {
    const onKey = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        onSetupConfirm()
      } else if (e.key === 'Escape') {
        onClose()
      }
    }
    return (
      <div className="dlg-back" onMouseDown={onClose}>
        <div className="dlg dlg-wide" onMouseDown={(e) => e.stopPropagation()}>
          <h4>Connect Google Drive</h4>
          <p className="dnote">
            Paste a Google OAuth <b>Client ID</b> from a Cloud project with the Drive API enabled, and
            add this page's URL as an <b>Authorized JavaScript origin</b>.{' '}
            <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">
              Open Google Cloud console ↗
            </a>
          </p>
          <label>OAuth Client ID</label>
          <input
            ref={inputRef}
            value={modal.value}
            onChange={(e) => onSetupChange(e.target.value)}
            onKeyDown={onKey}
            placeholder="xxxxx.apps.googleusercontent.com"
            spellCheck={false}
            autoComplete="off"
          />
          <div className="dlg-actions">
            <button className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-primary" onClick={onSetupConfirm}>
              Connect
            </button>
          </div>
        </div>
      </div>
    )
  }

  // driveOpen
  const empty = !modal.loading && (!modal.files || modal.files.length === 0)
  return (
    <div className="dlg-back" onMouseDown={onClose}>
      <div className="dlg dlg-wide" onMouseDown={(e) => e.stopPropagation()}>
        <h4>Open from Google Drive</h4>
        {modal.loading && <p className="dnote">Loading your markdown files…</p>}
        <div className="dlist">
          {modal.files.map((f) => (
            <button key={f.id} className="dfile" onClick={() => onOpenFile(f)}>
              <FileSmall />
              <span className="name">{f.name}</span>
              <span className="meta">{fmtWhen(f.modifiedTime)}</span>
            </button>
          ))}
        </div>
        {empty && <div className="dempty">No markdown files found in your Drive.</div>}
        <div className="dlg-actions">
          <button className="btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
