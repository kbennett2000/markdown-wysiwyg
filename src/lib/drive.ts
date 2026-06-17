// Google Drive integration — ONLINE-ONLY progressive enhancement.
//
// The core editor is fully offline. Nothing here runs until the user explicitly
// triggers a Drive action, and the GIS SDK is lazy-loaded from Google only then.
// When offline, ensureGis() rejects and callers surface a graceful error toast.

const GIS_SRC = 'https://accounts.google.com/gsi/client'
const DRIVE_SCOPE =
  'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/userinfo.email'

interface TokenResponse {
  access_token?: string
}
interface TokenClient {
  requestAccessToken: (opts?: { prompt?: string }) => void
}
interface GoogleOAuth2 {
  initTokenClient: (cfg: {
    client_id: string
    scope: string
    callback: (resp: TokenResponse) => void
  }) => TokenClient
  revoke: (token: string, done?: () => void) => void
}
declare global {
  interface Window {
    google?: { accounts?: { oauth2?: GoogleOAuth2 } }
  }
}

export interface DriveFile {
  id: string
  name: string
  modifiedTime?: string
}

/** The configured client id (build-time env, else null → caller prompts). */
export function envClientId(): string | null {
  return import.meta.env.VITE_GDRIVE_CLIENT_ID || null
}

let gisPromise: Promise<void> | null = null

/** Lazy-load the Google Identity Services SDK. Rejects when offline. */
export function ensureGis(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  if (gisPromise) return gisPromise
  gisPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById('gis-sdk') as HTMLScriptElement | null
    const onload = () => {
      if (window.google?.accounts?.oauth2) resolve()
      else reject(new Error('Google sign-in unavailable'))
    }
    if (existing) {
      existing.addEventListener('load', onload)
      existing.addEventListener('error', () => reject(new Error('offline')))
      return
    }
    const s = document.createElement('script')
    s.id = 'gis-sdk'
    s.src = GIS_SRC
    s.async = true
    s.defer = true
    s.onload = onload
    s.onerror = () => {
      gisPromise = null
      reject(new Error('Google Drive needs an internet connection'))
    }
    document.head.appendChild(s)
  })
  return gisPromise
}

/** Request an OAuth access token (loads GIS first). */
export async function requestToken(clientId: string): Promise<string> {
  await ensureGis()
  const oauth2 = window.google!.accounts!.oauth2!
  return new Promise<string>((resolve, reject) => {
    const client = oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPE,
      callback: (resp) => {
        if (resp && resp.access_token) resolve(resp.access_token)
        else reject(new Error('Drive authorization failed'))
      },
    })
    client.requestAccessToken({ prompt: 'consent' })
  })
}

export function revokeToken(token: string): void {
  try {
    window.google?.accounts?.oauth2?.revoke(token, () => {})
  } catch {
    /* ignore */
  }
}

export async function fetchEmail(token: string): Promise<string | null> {
  try {
    const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: 'Bearer ' + token },
    })
    const j = await r.json()
    return j && j.email ? (j.email as string) : null
  } catch {
    return null
  }
}

/** Multipart upload (create or update). Returns the saved file id + name. */
export async function saveToDrive(
  token: string,
  name: string,
  md: string,
  fileId: string | null
): Promise<{ id: string; name: string }> {
  const meta = { name, mimeType: 'text/markdown' }
  const boundary = 'mdedit' + Date.now()
  const body =
    '\r\n--' +
    boundary +
    '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(meta) +
    '\r\n--' +
    boundary +
    '\r\nContent-Type: text/markdown\r\n\r\n' +
    (md || '') +
    '\r\n--' +
    boundary +
    '--'
  const url = fileId
    ? 'https://www.googleapis.com/upload/drive/v3/files/' + fileId + '?uploadType=multipart'
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart'
  const r = await fetch(url, {
    method: fileId ? 'PATCH' : 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'multipart/related; boundary=' + boundary,
    },
    body,
  })
  const j = await r.json()
  if (!j || !j.id) throw new Error('Drive save failed')
  return { id: j.id, name: j.name || name }
}

export async function listDrive(token: string): Promise<DriveFile[]> {
  const q =
    "(name contains '.md' or name contains '.markdown') and mimeType != 'application/vnd.google-apps.folder' and trashed = false"
  const url =
    'https://www.googleapis.com/drive/v3/files?q=' +
    encodeURIComponent(q) +
    '&fields=' +
    encodeURIComponent('files(id,name,modifiedTime)') +
    '&orderBy=modifiedTime desc&pageSize=50'
  const r = await fetch(url, { headers: { Authorization: 'Bearer ' + token } })
  const j = await r.json()
  return (j && j.files) || []
}

export async function openDriveFile(token: string, fileId: string): Promise<string> {
  const r = await fetch('https://www.googleapis.com/drive/v3/files/' + fileId + '?alt=media', {
    headers: { Authorization: 'Bearer ' + token },
  })
  return r.text()
}
