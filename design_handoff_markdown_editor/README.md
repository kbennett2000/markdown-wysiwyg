# Handoff: WYSIWYG Markdown Editor

## Overview
A WYSIWYG markdown editor with a word-processor feel that only exposes formatting markdown can express. It has three view modes — **Editor** (rich WYSIWYG), **Split** (rich + raw, live-synced), and **Source** (raw markdown) — plus light/dark themes, local file import/export (Markdown, HTML, PDF), and read/write to Google Drive. Editing is bidirectional: changes in the rich editor serialize to markdown and vice-versa.

## About the Design Files
The file in this bundle (`Markdown Editor.dc.html`) is a **design reference created in HTML** — a working prototype demonstrating the intended look, behavior, and data flow. It is **not production code to copy directly**. The task is to **recreate this design in your target codebase** (React, Vue, Svelte, etc.) using its established patterns, component library, and state management. If no front-end environment exists yet, pick the most appropriate framework and implement there.

> The prototype is authored as a "Design Component" (a single streaming HTML file with an inline template + a small logic class). Ignore that wrapper format — only the markup, styles, and behavior described below matter for reimplementation.

## Fidelity
**High-fidelity (hifi)** and **fully functional.** Final colors, typography, spacing, interactions, and a complete bidirectional markdown engine are all implemented. Recreate the UI pixel-accurately and preserve the documented behavior. The two third-party libraries below do the heavy lifting and should be reused rather than reinvented.

### Core dependencies (reuse these)
- **[marked](https://marked.js.org/)** — markdown → HTML (GFM enabled: tables, task lists, strikethrough).
- **[turndown](https://github.com/mixmark-io/turndown)** + **[turndown-plugin-gfm](https://github.com/mixmark-io/turndown-plugin-gfm)** — HTML → markdown (GFM). Options used: `headingStyle:'atx'`, `codeBlockStyle:'fenced'`, `bulletListMarker:'-'`, `emDelimiter:'*'`, `hr:'---'`, `linkStyle:'inlined'`, plus a custom rule mapping `del,s,strike` → `~~...~~`.
- The rich editor is a native `contenteditable` div driven by `document.execCommand` for inline styles + custom DOM manipulation for block/list operations. In a modern codebase consider a purpose-built editor (e.g. ProseMirror/TipTap, Lexical, CodeMirror for source) — but the execCommand approach documented here is what the prototype ships and is a valid lightweight path.

## Architecture / Data Flow (important)
- **Single source of truth:** a markdown string (`md`). It is held outside the reactive view layer in the prototype (an instance field) so typing never forces a re-render that would disturb the caret. In your framework, keep the markdown in a ref/store and avoid making the `contenteditable`'s `innerHTML` a controlled value.
- **The rich editor (`contenteditable`) is NOT React/Vue-controlled.** Its `innerHTML` is set imperatively (a) on load, (b) when entering Editor/Split mode, and (c) in Split when the source pane changes while the editor isn't focused. Never bind innerHTML reactively — it destroys the caret. Render the element with no reactive children.
- **The source pane is an uncontrolled `<textarea>`** whose `.value` is set imperatively. On input it updates `md`; if Split is active and the editor isn't focused, the editor is re-rendered from `md`.
- **Sync rules:**
  - Edit in rich editor → `md = turndown(editor.innerHTML)` → set source textarea value → update counts.
  - Edit in source → `md = textarea.value` → if Split, re-render editor from `marked(md)` → update counts.
  - Switch mode → repopulate whichever pane(s) became visible from `md`.
- **Selection state** (which inline/block formats are active) is read on `selectionchange` (only when the editor is focused), coalesced with `requestAnimationFrame`, and used to highlight active toolbar buttons and label the block-style dropdown.
- `document.execCommand('styleWithCSS', false, false)` is called once so bold/italic/strike produce `<b>/<i>/<strike>` tags (not styled spans), which serialize cleanly.

## Screens / Views

### 1. Top Bar (height 48px)
- **Purpose:** file identity + view-mode switching + theme.
- **Layout:** `display:flex; align-items:center; justify-content:space-between; padding:0 16px; height:48px; background:var(--bar); border-bottom:1px solid var(--border)`.
- **Left group** (`display:flex; gap:13px`):
  - File glyph icon (15px, stroke `currentColor`, color `--faint`).
  - Filename, e.g. `untitled.md` — IBM Plex Mono 13px/500, color `--text`.
  - Dirty dot: 6px circle. Unsaved = filled `--accent` (opacity .75); saved = transparent with `1.5px solid var(--border-strong)` border.
  - **File menu button** ("File ▾"): IBM Plex Mono 11px/600, `1px solid var(--border)`, bg `--toolbar`, radius 7px, padding 7px 10px. Hover: text `--text`, border `--border-strong`.
- **Right group** (`display:flex; gap:10px`):
  - **Segmented mode control:** container `padding:3px; bg --toolbar; border 1px --border; radius 9px; gap 2px`. Three buttons (Editor / Split / Source), IBM Plex Mono 10.5px/600, uppercase, letter-spacing .05em, padding 6px 11px, radius 6px. Active: bg `--shell`, color `--accent`, `box-shadow:0 1px 2px rgba(0,0,0,.14)`. Inactive: color `--dim`, hover → `--text`.
  - **Theme toggle:** 32px square icon button, `1px solid var(--border)`, bg `--toolbar`, radius 8px. Shows moon in light mode, sun in dark mode.

### 2. Formatting Toolbar (auto height, wraps)
- **Layout:** `display:flex; align-items:center; gap:3px; flex-wrap:wrap; padding:7px 13px; background:var(--toolbar); border-bottom:1px solid var(--border)`.
- **Disabled in Source mode:** `opacity:.38; pointer-events:none`.
- **Important:** the toolbar container has an `onMouseDown` that calls `preventDefault()` so clicking a button does **not** blur the editor / lose the selection. Replicate this — it's essential for execCommand to act on the current selection.
- **Button base (`.tb`):** `min-width:30px; height:30px; padding:0 8px; border:none; background:transparent; color:var(--dim); font:600 12.5px/1 'IBM Plex Mono'; border-radius:7px`. Hover: bg `--accent-soft`, color `--text`. Active/toggled: bg `--accent-soft`, color `--accent`.
- **Groups (separated by a 1px × 18px `--border` divider with 0 5px margin):**
  1. **Block-style dropdown** (`.blockbtn`): `min-width:116px; height:30px; bg --shell; border 1px --border; radius 7px; IBM Plex Mono 12px/600`, shows current block label + caret. Opens a 178px menu (`.blockmenu`, bg `--shell`, border `--border-strong`, radius 10px, shadow `0 16px 40px rgba(0,0,0,.26)`, pop animation) listing: **Paragraph, Heading 1–6** (each rendered at descending size/weight as a preview). Selecting calls `formatBlock`. Active item: bg `--accent-soft`, color `--accent`.
  2. **Inline:** Bold (`B`, 700 weight), Italic (`I`, italic), Strikethrough (`S`, line-through). Text glyphs, IBM Plex Mono.
  3. **Code:** Inline code (`</>` chevron SVG), Code block (`{ }` text).
  4. **Lists:** Bullet list (dotted-lines SVG), Numbered list (`1.` text), Task list (checkbox SVG), **Outdent** (left-arrow SVG), **Indent** (right-arrow SVG).
  5. **Insert:** Blockquote (bar+lines SVG), Link (chain SVG → opens dialog), Image (frame SVG → opens dialog), Table (grid SVG → inserts 2×2 GFM table), Horizontal rule (line SVG).
  6. **Right-aligned** (pushed by `flex:1` spacer): Undo (`↶`), Redo (`↷`).

### 3. Editor Pane (`.pane-editor`)
- Scroll container, bg `--bg`. Inner `.page`: `max-width:760px; margin:0 auto; padding:54px 30px 160px` (a centered "measure" like a document).
- `.doc` is the `contenteditable`. Typography below under **Rendered content styles**.

### 4. Source Pane (`.pane-source`)
- Uncontrolled `<textarea>`: `max-width:840px; margin:0 auto; padding:48px 30px 160px; border:none; outline:none; resize:none; background:transparent; color:var(--text); font:400 13.5px/1.8 'IBM Plex Mono'; tab-size:2; white-space:pre-wrap; caret-color:var(--accent)`.
- In **Split**, both panes are `flex:1` and the source pane gets `border-left:1px solid var(--border)`. Mode show/hide is driven by a `data-mode` attribute on the shell with CSS: `[data-mode="editor"] .pane-source{display:none}`, `[data-mode="source"] .pane-editor{display:none}`.

### 5. Status Bar (height 30px)
- `display:flex; align-items:center; gap:18px; padding:0 16px; background:var(--bar); border-top:1px solid var(--border); font:500 11px/1 'IBM Plex Mono'; color:var(--dim)`.
- Items: `<b>N</b> words`, `<b>N</b> chars`, `~N min read` (words/200, min 1), and a right-aligned badge `MARKDOWN · GFM` (`margin-left:auto; color:--accent; 1px solid --border; padding 3px 9px; radius 5px`). `<b>` numbers use color `--text`.

### 6. File Menu (dropdown, 252px)
Anchored under the File button (`top:46px; left:14px`), bg `--shell`, border `--border-strong`, radius 12px, shadow `0 18px 46px rgba(0,0,0,.28)`, pop animation. A fixed transparent backdrop closes it on outside click. Sections:
- **OPEN:** New document · Open file… (`.md .html`) · Open from Drive…
- **EXPORT:** Download Markdown (`.md`) · Download HTML (`.html`) · Export PDF (`print`) · Save to Drive
- Divider, then a Drive status/toggle row: "Connect Google Drive" / "<email> · Disconnect".
- Item (`.mi`): `padding:9px 10px; font:500 13px 'IBM Plex Sans'; radius 8px`; hover bg `--accent-soft`; leading 15px stroke icon (color `--dim`); optional right-aligned mono shortcut hint (`.k`, color `--faint`).

### 7. Dialogs (link / image / Drive)
Centered-top modal: backdrop `rgba(0,0,0,.2)`, padding-top 96px. Card `.dlg`: bg `--shell`, border `--border-strong`, radius 12px, shadow `0 18px 50px rgba(0,0,0,.3)`, width 390px (460px for wide Drive dialogs), padding 18px. Title IBM Plex Mono 13px/600. Labels: mono 10px uppercase, letter-spacing .09em, color `--faint`. Inputs: bg `--toolbar`, border `--border`, radius 8px, focus border `--accent`. Actions row right-aligned: ghost button (transparent, border `--border`) + primary button (bg `--accent`, color `--on-accent`). Enter submits, Escape cancels.

### 8. Toast
Bottom-right (`right:16px; bottom:42px`), bg `--text`, color `--bg`, IBM Plex Mono 12px, radius 9px, shadow `0 12px 32px rgba(0,0,0,.32)`, pop animation, auto-dismiss ~2.8s. Error variant: bg `#cc3b33`, white text.

### 9. Loading state
Until the markdown libraries are ready, a full-cover overlay shows "initializing editor_" (mono, color `--dim`, blinking underscore). Unmount it once libs are loaded and initial content rendered.

## Rendered content styles (`.doc` and exported HTML)
Body: `font:16px/1.72 'IBM Plex Sans'; color:var(--text)`. (Optional serif mode swaps to `'IBM Plex Serif', Georgia, serif`.)
- `h1` 1.95em/600, line 1.2, letter-spacing -.022em, margin `1.5em 0 .5em`
- `h2` 1.5em/600, ls -.015em
- `h3` 1.2em/600
- `h4` 1.05em/650 · `h5` .95em/650 · `h6` .86em/650 uppercase, ls .06em, color `--dim`
- `p` margin `0 0 1.05em`
- `ul,ol` `padding-left:1.5em; margin 0 0 1.05em`; `li` margin `.3em 0`; markers color `--faint`
- Task items: `li:has(>input[type=checkbox]){list-style:none; margin-left:-1.35em}`; checkbox 15px, `accent-color:var(--accent)`, enabled & toggling re-serializes the doc
- `a` color `--accent`, underline, offset 2px
- `strong` 650; `em` italic; `del,s` color `--dim`
- inline `code` IBM Plex Mono .86em, bg `--code-bg`, `1px solid var(--border)`, padding `.1em .36em`, radius 5px
- `pre` bg `--code-bg`, border `--border`, radius 10px, padding `15px 18px`; `pre code` no bg/border, .85em, `white-space:pre`
- `blockquote` `border-left:3px solid var(--accent)`, padding-left 1.1em, color `--dim`
- `table` collapsed, width 100%, .93em; `th,td` `1px solid var(--border-strong)`, padding `8px 13px`; `th` bg `--toolbar`, 600
- `img` max-width 100%, radius 10px, `1px solid var(--border)`
- `hr` `border-top:1px solid var(--border-strong)`, margin `1.8em 0`

## Interactions & Behavior
- **Mode switch:** repopulate newly-visible panes from `md`; do not touch a pane the user is currently typing in.
- **Toolbar commands** (all act on the current selection, then re-serialize + refresh active states):
  - Bold/Italic/Strike → `execCommand('bold'|'italic'|'strikeThrough')` (native ⌘B/⌘I also work in contenteditable).
  - Block style → `execCommand('formatBlock', false, 'P'|'H1'..'H6')`.
  - Bullet/Numbered → `execCommand('insertUnorderedList'|'insertOrderedList')`.
  - Task list → insert unordered list, then prepend a `<input type=checkbox>` to the current `<li>`.
  - **Indent/Outdent are custom for lists** (execCommand indent is unreliable): Indent moves the current `<li>` into a nested list inside its previous sibling `<li>` (creating the sublist if needed). Outdent moves it back out after its parent `<li>` and removes the sublist if empty. Falls back to `execCommand` for non-list blocks.
  - Inline code / code block → wrap selection in `<code>` / `<pre><code>` (HTML-escaped).
  - Link → dialog (URL + optional text); if text is selected use `createLink`, else insert `<a>`. Image → dialog (URL + alt) inserts `<img>`. Table → insert default 2-col × 2-row GFM table. HR → `insertHorizontalRule`.
  - Undo/Redo → `execCommand('undo'|'redo')`.
- **Dirty tracking:** any user edit sets `dirty=true`; New/Open/Save sets it false.
- **Counts:** computed from the text content of `marked(md)` (words = `\S+` matches; chars = `md.length`).
- **Hover/active:** documented per component above. Active toolbar state derives from `queryCommandState` + nearest block tag.

## Import / Export
- **Open file (local):** hidden `<input type="file" accept=".md,.markdown,.txt,.html,.htm">`. Read as text; if HTML, convert via turndown; else load as markdown. Set filename (HTML/txt → `.md`).
- **Download Markdown / HTML:** create a `Blob` and trigger an `<a download>`. HTML export wraps `marked(md)` in a standalone document with an embedded clean stylesheet (see `EXPORT_CSS` in the file) and `<title>` = filename.
- **Export PDF:** build the standalone HTML, write it into a hidden `<iframe>`, then call `iframe.contentWindow.print()` (with `@page{margin:18mm}`). User chooses "Save as PDF". This avoids popup blockers; clean up the iframe on `afterprint`.

## Google Drive integration
Uses **Google Identity Services** (`https://accounts.google.com/gsi/client`) for OAuth tokens + the **Drive REST API** via `fetch` (no gapi/picker).
- **Requires a Google OAuth Client ID** from a Cloud project with the Drive API enabled, and this app's URL added as an **Authorized JavaScript origin**. The prototype prompts for the Client ID and stores it in `localStorage` (`mdedit_gdrive_client`). In production, configure the Client ID via env/config, not a user prompt.
- **Scopes:** `https://www.googleapis.com/auth/drive` + `.../auth/userinfo.email`. (Full `drive` scope is used so arbitrary `.md` files can be listed; if you only need app-created files, downgrade to `drive.file` and use the Google Picker for opening.)
- **Connect:** `google.accounts.oauth2.initTokenClient({client_id, scope, callback}).requestAccessToken()`; store the access token in memory; fetch email from `oauth2/v3/userinfo`.
- **Save:** multipart upload to `POST /upload/drive/v3/files?uploadType=multipart` (or `PATCH .../{fileId}` to update), `Content-Type: multipart/related`, metadata `{name, mimeType:'text/markdown'}` + the markdown body. Store the returned `fileId` for subsequent saves.
- **Open:** `GET /drive/v3/files?q=(name contains '.md' or name contains '.markdown') and mimeType != 'application/vnd.google-apps.folder' and trashed=false&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc`; show the list in a dialog; on pick `GET /drive/v3/files/{id}?alt=media` and load the text.
- **Disconnect:** `google.accounts.oauth2.revoke(token)` and clear token/email/fileId.

> **Note for production:** the sandbox origin the prototype runs on is not an authorized origin for any real Client ID, so live Drive auth will not complete in the preview. The code path is correct for a properly-configured deployment.

## State Management
- `md` (string) — source of truth, kept outside the reactive layer (ref/store).
- `mode` — `'editor' | 'split' | 'source'`.
- `theme` — `'light' | 'dark'` (sets `data-theme` on the shell).
- `ready` — libs loaded + initial render done.
- `fmt` — `{ bold, italic, strike, ul, ol, quote, block }` derived from the current selection.
- `fileName`, `dirty`.
- `menuOpen`, `blockMenuOpen`, `dialog` (`{type:'link'|'image', url, text}`), `modal` (`{kind:'driveSetup'|'driveOpen', ...}`), `toast`.
- `drive` — `{ clientId, token, email, fileId }`.

## Design Tokens
Defined as CSS variables; `[data-theme="dark"]` overrides them.

**Light**
- `--bg #f6f6f3` · `--shell #ffffff` · `--bar #fbfbf9` · `--toolbar #f2f2ee`
- `--border #e7e7e1` · `--border-strong #d6d6cd`
- `--text #1b1b18` · `--dim #76766c` · `--faint #a6a69c`
- `--accent #3061e8` · `--accent-soft rgba(48,97,232,.11)` · `--on-accent #ffffff`
- `--code-bg #edede8` · `--sel rgba(48,97,232,.16)`

**Dark**
- `--bg #15161a` · `--shell #1c1e24` · `--bar #1e2026` · `--toolbar #23252c`
- `--border #2c2f37` · `--border-strong #3b3f49`
- `--text #e8e9ec` · `--dim #9aa0ab` · `--faint #686d77`
- `--accent #7aa2ff` · `--accent-soft rgba(122,162,255,.15)` · `--on-accent #12141a`
- `--code-bg #23252c` · `--sel rgba(122,162,255,.22)`

**Type:** IBM Plex Sans (UI + document body), IBM Plex Mono (toolbar tokens, source, filenames, status, labels), IBM Plex Serif (optional document body via serif toggle).
**Radii:** buttons 7px · cards/menus 10–12px · code inline 5px · code block / images 10px.
**Shadows:** menu `0 16–18px 40–46px rgba(0,0,0,.26–.28)` · dialog `0 18px 50px rgba(0,0,0,.3)` · toast `0 12px 32px rgba(0,0,0,.32)`.
**Tweakable props** (exposed on the prototype root): `accentColor` (color), `startMode` (editor|split|source), `serifBody` (boolean → serif document font).

## Assets
- **Fonts:** IBM Plex Sans / Mono / Serif via Google Fonts.
- **Icons:** inline stroke SVGs drawn in the markup (file, folder, download, chevrons, list/task/quote/link/image/table/hr, sun/moon, Drive triangle). No external icon set. Swap for your codebase's icon library.
- No raster images or logos.

## Files
- `Markdown Editor.dc.html` — the complete working prototype (markup + styles + logic). Open it in a browser to see all behavior. Treat its inline `<helmet>` stylesheet and the `Component` logic class as the reference for styling and behavior; the surrounding Design-Component wrapper is not relevant to your implementation.
