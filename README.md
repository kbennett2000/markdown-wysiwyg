# Markdown WYSIWYG Editor

A word-processor-style WYSIWYG markdown editor that only exposes formatting
markdown can express. Three view modes — **Editor** (rich), **Split** (rich + raw,
live-synced), and **Source** (raw markdown) — plus light/dark themes and local
file import/export (Markdown / HTML / PDF). Editing is bidirectional: the rich
editor serializes to markdown and vice-versa.

Built with **React + Vite + TypeScript**. Markdown→HTML via
[marked](https://marked.js.org/); HTML→markdown via
[turndown](https://github.com/mixmark-io/turndown) + the GFM plugin.

## Offline by design 🛜🚫

The running editor has **zero internet dependencies** and works **100% offline**:

- `marked`, `turndown`, `turndown-plugin-gfm` and the **IBM Plex** fonts
  (via `@fontsource/*`) are all bundled into the build — no CDN, no Google Fonts.
- The only feature that ever touches the network is the **optional Google Drive
  integration**, which is an *online-only progressive enhancement*: its SDK is
  lazy-loaded from Google **only when you click a Drive action**, and it fails
  gracefully with an error toast when offline. Everything else — editing,
  conversion, local open/save, HTML & PDF export — runs entirely locally.

You can verify this: build the app and grep `dist/` (see *Offline audit* below),
or run the container with `--network none` and confirm the editor still loads and
works.

## Quick start (Docker)

Serves on **http://localhost:8080** by default.

```bash
docker compose up --build
```

or with plain Docker:

```bash
docker build -t markdown-wysiwyg .
docker run --rm -p 8080:8080 markdown-wysiwyg
```

### Changing the port

The port is configurable two ways:

- **Published (host) port** — change the left side of the `-p` mapping:
  ```bash
  docker run --rm -p 3000:8080 markdown-wysiwyg      # → http://localhost:3000
  ```
- **Internal listen port** — set `APP_PORT` (nginx renders it into its config at
  startup). Map the same port through:
  ```bash
  docker run --rm -e APP_PORT=9000 -p 9000:9000 markdown-wysiwyg
  ```

With docker compose, set the env vars (e.g. in a `.env` file or inline):

```bash
APP_PORT=9000 HOST_PORT=9000 docker compose up --build
```

`HOST_PORT` is the port on your machine; `APP_PORT` is the port nginx listens on
inside the container. Both default to `8080`.

## Local development

```bash
npm install
npm run dev        # Vite dev server (hot reload)
npm run build      # type-check + production build → dist/
npm run preview    # serve the production build locally
```

## Google Drive (optional, online-only)

Disabled-by-default in spirit: nothing loads until you use it. To enable real
sign-in you need a Google OAuth **Client ID** from a Cloud project with the Drive
API enabled, with the app's URL added as an **Authorized JavaScript origin**.

- **Recommended:** bake it in at build time via `VITE_GDRIVE_CLIENT_ID`:
  ```bash
  docker build --build-arg VITE_GDRIVE_CLIENT_ID=xxxx.apps.googleusercontent.com -t markdown-wysiwyg .
  # or for compose: export VITE_GDRIVE_CLIENT_ID=... before `docker compose up --build`
  ```
- **Otherwise:** the first Drive action opens a dialog to paste a Client ID,
  which is stored in `localStorage`.

If neither the network nor a Client ID is available, Drive actions simply show a
toast; the rest of the editor is unaffected.

## Offline audit

```bash
npm run build
# Should report no font/CDN references; the only external URLs are the (unused
# unless clicked) Drive SDK/API strings and inert content/namespace strings.
grep -rEi "fonts\.(googleapis|gstatic)|cdn\.|jsdelivr|unpkg" dist/   # → no matches
grep -oE "url\([^)]*\)" dist/assets/*.css | sort -u                  # → all ./*.woff2
```

## Project layout

```
src/
  main.tsx              React root + local font imports
  App.tsx               editor component: state, refs, all handlers
  sample.ts             default sample document + table template
  styles/               tokens.css (theme vars) + app.css (ported design)
  lib/
    convert.ts          marked + turndown configuration
    exporters.ts        standalone HTML, download, PDF-via-print
    drive.ts            lazy GIS loader + Drive REST helpers (online-only)
  components/            TopBar, Toolbar, FileMenu, dialogs, status, toast, icons
Dockerfile              multi-stage: node build → nginx serve
nginx.conf.template     listen ${APP_PORT}; SPA fallback; asset caching
docker-compose.yml      build + APP_PORT / HOST_PORT wiring
```

## Architecture notes

- The markdown string is the **single source of truth**, held in a `useRef`
  outside React state so typing never triggers a re-render that would disturb the
  caret.
- The rich editor (`contenteditable`) and the source `<textarea>` are
  **uncontrolled**; their contents are set imperatively on load, on mode switch,
  and (in Split) when the inactive pane changes. Active formatting state is read
  from the selection on `selectionchange` (rAF-coalesced) to drive the toolbar.
