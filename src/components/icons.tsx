// Inline stroke SVG icons copied from the prototype markup. No external icon set.
import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>

export const FileGlyph = (p: P) => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" {...p}>
    <rect x="2.5" y="1.5" width="9" height="13" rx="1.6" />
    <line x1="4.6" y1="5" x2="9.4" y2="5" />
    <line x1="4.6" y1="8" x2="9.4" y2="8" />
    <line x1="4.6" y1="11" x2="7.4" y2="11" />
  </svg>
)

export const ChevronDown = (p: P) => (
  <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M2 3.5 L5 6.5 L8 3.5" />
  </svg>
)

export const Moon = (p: P) => (
  <svg className="i-moon" width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" {...p}>
    <path d="M13.4 9.6A5.6 5.6 0 0 1 6.4 2.6 5.6 5.6 0 1 0 13.4 9.6Z" />
  </svg>
)

export const Sun = (p: P) => (
  <svg className="i-sun" width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" {...p}>
    <circle cx="8" cy="8" r="3" />
    <line x1="8" y1="1" x2="8" y2="2.4" />
    <line x1="8" y1="13.6" x2="8" y2="15" />
    <line x1="1" y1="8" x2="2.4" y2="8" />
    <line x1="13.6" y1="8" x2="15" y2="8" />
    <line x1="3.05" y1="3.05" x2="4.05" y2="4.05" />
    <line x1="11.95" y1="11.95" x2="12.95" y2="12.95" />
    <line x1="3.05" y1="12.95" x2="4.05" y2="11.95" />
    <line x1="11.95" y1="4.05" x2="12.95" y2="3.05" />
  </svg>
)

export const CodeChevrons = (p: P) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M5.6 4 L2 8 L5.6 12" />
    <path d="M10.4 4 L14 8 L10.4 12" />
  </svg>
)

export const BulletList = (p: P) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" {...p}>
    <circle cx="2.5" cy="4" r="1" fill="currentColor" stroke="none" />
    <circle cx="2.5" cy="8" r="1" fill="currentColor" stroke="none" />
    <circle cx="2.5" cy="12" r="1" fill="currentColor" stroke="none" />
    <line x1="6" y1="4" x2="14" y2="4" />
    <line x1="6" y1="8" x2="14" y2="8" />
    <line x1="6" y1="12" x2="14" y2="12" />
  </svg>
)

export const TaskList = (p: P) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="1.5" y="2.4" width="4.2" height="4.2" rx="1.1" />
    <path d="M2.4 4.5 L3.3 5.4 L4.9 3.5" />
    <line x1="8.4" y1="4.5" x2="14" y2="4.5" />
    <rect x="1.5" y="9.4" width="4.2" height="4.2" rx="1.1" />
    <line x1="8.4" y1="11.5" x2="14" y2="11.5" />
  </svg>
)

export const Outdent = (p: P) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <line x1="7" y1="3.5" x2="14" y2="3.5" />
    <line x1="7" y1="8" x2="14" y2="8" />
    <line x1="7" y1="12.5" x2="14" y2="12.5" />
    <path d="M4.5 6 L2 8 L4.5 10" />
  </svg>
)

export const Indent = (p: P) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <line x1="7" y1="3.5" x2="14" y2="3.5" />
    <line x1="7" y1="8" x2="14" y2="8" />
    <line x1="7" y1="12.5" x2="14" y2="12.5" />
    <path d="M2 6 L4.5 8 L2 10" />
  </svg>
)

export const Quote = (p: P) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" {...p}>
    <rect x="2" y="3" width="2.2" height="10" rx="1.1" fill="currentColor" stroke="none" />
    <line x1="7" y1="5" x2="14" y2="5" />
    <line x1="7" y1="8" x2="14" y2="8" />
    <line x1="7" y1="11" x2="11.5" y2="11" />
  </svg>
)

export const LinkIcon = (p: P) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M6.4 9.6 L9.6 6.4" />
    <path d="M8.3 4.7 L9.8 3.2 a2.4 2.4 0 0 1 3.4 3.4 L11.7 8" />
    <path d="M7.7 11.3 L6.2 12.8 a2.4 2.4 0 0 1 -3.4 -3.4 L4.3 8" />
  </svg>
)

export const ImageIcon = (p: P) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="1.6" y="2.6" width="12.8" height="10.8" rx="1.6" />
    <circle cx="5.4" cy="6" r="1.2" />
    <path d="M2.4 12 L6 8.6 L8.8 11 L11.4 8.4 L14.4 11.2" />
  </svg>
)

export const TableIcon = (p: P) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" {...p}>
    <rect x="1.6" y="2.6" width="12.8" height="10.8" rx="1.2" />
    <line x1="1.6" y1="6.6" x2="14.4" y2="6.6" />
    <line x1="8" y1="2.6" x2="8" y2="13.4" />
  </svg>
)

export const HrIcon = (p: P) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...p}>
    <line x1="2" y1="8" x2="14" y2="8" />
  </svg>
)

export const NewDoc = (p: P) => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M9 1.5 H3.5 A1.5 1.5 0 0 0 2 3 V13 A1.5 1.5 0 0 0 3.5 14.5 H12.5 A1.5 1.5 0 0 0 14 13 V6.5 Z" />
    <path d="M9 1.5 V6.5 H14" />
  </svg>
)

export const OpenFolder = (p: P) => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M1.8 4.5 A1.2 1.2 0 0 1 3 3.3 H6 L7.5 5 H13 A1.2 1.2 0 0 1 14.2 6.2 V11.5 A1.2 1.2 0 0 1 13 12.7 H3 A1.2 1.2 0 0 1 1.8 11.5 Z" />
  </svg>
)

export const DriveIcon = (p: P) => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" {...p}>
    <path d="M5.6 2 L10.4 2 L14 8.2 L11.6 12.4 L7.8 5.7 Z" />
    <path d="M2 9.3 L4.4 5.1 L7.8 5.7 L5.4 9.9 Z" />
    <path d="M5.4 9.9 L11.6 9.9 L11.6 12.4 L4 12.4 Z" />
  </svg>
)

export const DownloadIcon = (p: P) => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M8 1.8 V10" />
    <path d="M5 7 L8 10 L11 7" />
    <path d="M2.5 13.2 H13.5" />
  </svg>
)

export const PdfIcon = (p: P) => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M4.5 6 V2.5 H11.5 V6" />
    <rect x="2.5" y="6" width="11" height="5" rx="1" />
    <path d="M4.5 10 H11.5 V14 H4.5 Z" />
  </svg>
)

export const SaveIcon = (p: P) => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M2.5 3.5 A1 1 0 0 1 3.5 2.5 H10.5 L13.5 5.5 V12.5 A1 1 0 0 1 12.5 13.5 H3.5 A1 1 0 0 1 2.5 12.5 Z" />
    <path d="M5 2.5 V6 H10 V2.5" />
    <path d="M5 13.5 V9.5 H11 V13.5" />
  </svg>
)

export const ShareIcon = (p: P) => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="12" cy="3.5" r="1.9" />
    <circle cx="4" cy="8" r="1.9" />
    <circle cx="12" cy="12.5" r="1.9" />
    <line x1="5.7" y1="7.1" x2="10.3" y2="4.4" />
    <line x1="5.7" y1="8.9" x2="10.3" y2="11.6" />
  </svg>
)

export const FileSmall = (p: P) => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="2.5" y="1.5" width="9" height="13" rx="1.4" />
    <line x1="4.5" y1="5" x2="9.5" y2="5" />
    <line x1="4.5" y1="8" x2="9.5" y2="8" />
  </svg>
)
