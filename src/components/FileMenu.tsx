import { NewDoc, OpenFolder, ShareIcon, DownloadIcon, CodeChevrons, PdfIcon } from './icons'

interface Props {
  onClose: () => void
  onNew: () => void
  onOpenLocal: () => void
  onShare: () => void
  onExportMd: () => void
  onExportHtml: () => void
  onExportPdf: () => void
}

export default function FileMenu({
  onClose,
  onNew,
  onOpenLocal,
  onShare,
  onExportMd,
  onExportHtml,
  onExportPdf,
}: Props) {
  return (
    <>
      <div className="menu-back" onMouseDown={onClose} />
      <div className="menu">
        <div className="grp">Open</div>
        <button className="mi" onClick={onNew}>
          <NewDoc />
          New document
        </button>
        <button className="mi" onClick={onOpenLocal}>
          <OpenFolder />
          Open file…
          <span className="k">.md .html</span>
        </button>
        <div className="mdiv" />
        <div className="grp">Export</div>
        <button className="mi" onClick={onShare}>
          <ShareIcon />
          Share…
          <span className="k">save anywhere</span>
        </button>
        <button className="mi" onClick={onExportMd}>
          <DownloadIcon />
          Download Markdown
          <span className="k">.md</span>
        </button>
        <button className="mi" onClick={onExportHtml}>
          <CodeChevrons />
          Download HTML
          <span className="k">.html</span>
        </button>
        <button className="mi" onClick={onExportPdf}>
          <PdfIcon />
          Export PDF
          <span className="k">print</span>
        </button>
      </div>
    </>
  )
}
