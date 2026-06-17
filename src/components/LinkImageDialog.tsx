import { useEffect, useRef } from 'react'
import type { DialogState } from '../types'

interface Props {
  dialog: DialogState
  onChange: (patch: Partial<DialogState>) => void
  onConfirm: () => void
  onCancel: () => void
}

export default function LinkImageDialog({ dialog, onChange, onConfirm, onCancel }: Props) {
  const urlRef = useRef<HTMLInputElement>(null)
  const isImg = dialog.type === 'image'

  // Focus the URL input when the dialog opens.
  useEffect(() => {
    urlRef.current?.focus()
  }, [])

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onConfirm()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
  }

  return (
    <div className="dlg-back" onMouseDown={onCancel}>
      <div className="dlg" onMouseDown={(e) => e.stopPropagation()}>
        <h4>{isImg ? 'Insert image' : 'Insert link'}</h4>
        <label>{isImg ? 'Image URL' : 'Link URL'}</label>
        <input
          ref={urlRef}
          value={dialog.url}
          onChange={(e) => onChange({ url: e.target.value })}
          onKeyDown={onKey}
          placeholder="https://"
          autoComplete="off"
          spellCheck={false}
        />
        <label>{isImg ? 'Alt text (optional)' : 'Link text (optional)'}</label>
        <input
          value={dialog.text}
          onChange={(e) => onChange({ text: e.target.value })}
          onKeyDown={onKey}
          placeholder={isImg ? 'description' : 'shown text'}
          autoComplete="off"
        />
        <div className="dlg-actions">
          <button className="btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-primary" onClick={onConfirm}>
            Insert
          </button>
        </div>
      </div>
    </div>
  )
}
