import { NewDoc, OpenFolder, DriveIcon, DownloadIcon, CodeChevrons, PdfIcon, SaveIcon } from './icons'

interface Props {
  driveLabel: string
  onClose: () => void
  onNew: () => void
  onOpenLocal: () => void
  onOpenDrive: () => void
  onExportMd: () => void
  onExportHtml: () => void
  onExportPdf: () => void
  onSaveDrive: () => void
  onDriveToggle: () => void
}

export default function FileMenu({
  driveLabel,
  onClose,
  onNew,
  onOpenLocal,
  onOpenDrive,
  onExportMd,
  onExportHtml,
  onExportPdf,
  onSaveDrive,
  onDriveToggle,
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
        <button className="mi" onClick={onOpenDrive}>
          <DriveIcon />
          Open from Drive…
        </button>
        <div className="mdiv" />
        <div className="grp">Export</div>
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
        <button className="mi" onClick={onSaveDrive}>
          <SaveIcon />
          Save to Drive
        </button>
        <div className="mdiv" />
        <button className="mi" onClick={onDriveToggle}>
          <DriveIcon />
          {driveLabel}
        </button>
      </div>
    </>
  )
}
