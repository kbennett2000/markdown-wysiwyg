import type { ToastState } from '../types'

export default function Toast({ toast }: { toast: ToastState }) {
  return <div className={'toast' + (toast.err ? ' err' : '')}>{toast.msg}</div>
}
