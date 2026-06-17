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
