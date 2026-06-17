export type Mode = 'editor' | 'split' | 'source'
export type Theme = 'light' | 'dark'

export interface Fmt {
  bold?: boolean
  italic?: boolean
  strike?: boolean
  ul?: boolean
  ol?: boolean
  quote?: boolean
  block?: string
}

export interface DialogState {
  type: 'link' | 'image'
  url: string
  text: string
}

export interface ToastState {
  msg: string
  err: boolean
}

import type { DriveFile } from './lib/drive'
export type ModalState =
  | { kind: 'driveSetup'; value: string }
  | { kind: 'driveOpen'; loading: boolean; files: DriveFile[] }

export interface DriveState {
  clientId: string | null
  token: string | null
  email: string | null
  fileId: string | null
}
