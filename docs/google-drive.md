# Connecting Google Drive (optional) ☁️

Most people never need this. The editor saves perfectly well to your own computer
(**Download Markdown / HTML / PDF**), works **completely offline**, and keeps your
writing private. Google Drive is an **optional extra** for people who want to open
and save `.md` files straight from their Drive.

> **Heads up:** this is the one feature that uses the internet and a Google account.
> If that's not for you, just ignore the Drive buttons — everything else works
> without it.

---

## Why a little setup is required

Google won't let *any* website touch your Drive without the app first being
registered with Google. That registration produces an **OAuth Client ID** — a public
string that identifies *this app* to Google. It is **not** a password and **not** a
login; it's a one-time piece of configuration done by whoever runs the editor.

Being signed into Google in your browser is **not** enough on its own: Google still
needs you to approve this specific app's access to your Drive, once, via its own
pop-up. (After that first approval, it reconnects quietly — and if you're already
signed in, that approval is a single click.)

Once you provide a Client ID (below), the editor **skips the "paste a Client ID"
dialog entirely** and goes straight to Google's normal sign-in/consent pop-up.

---

## Step 1 — Create a Google OAuth Client ID

You only do this once. It's free.

1. Go to the **[Google Cloud Console](https://console.cloud.google.com/)** and create
   a project (or pick an existing one).
2. **Enable the Drive API:** *APIs & Services → Library →* search **"Google Drive
   API"** → **Enable**.
3. **Configure the consent screen:** *APIs & Services → OAuth consent screen.* Choose
   **External**, give the app a name and your email, and save. While it's in
   "Testing", add your own Google account under **Test users**.
4. **Create the credential:** *APIs & Services → Credentials → Create Credentials →
   OAuth client ID → Application type: **Web application***.
5. Under **Authorized JavaScript origins**, add the exact address you'll open the
   editor at — including the port:
   - `http://localhost:8080`
   - …and one line for **each** other port you use (e.g. `http://localhost:9000`).
     This matters because the editor lets you change the port — every port you
     actually use must be listed here, or Google will refuse the connection.
6. Click **Create**. Copy the **Client ID** — it looks like
   `1234567890-abcdef.apps.googleusercontent.com`.

> The Client ID is **public by design** (it's visible in any browser that loads the
> app), so it's perfectly safe to put on a command line or in a compose file.

---

## Step 2 — Run the editor with your Client ID

Pass it in with `-e GDRIVE_CLIENT_ID=…`:

```bash
docker run --rm \
  -e GDRIVE_CLIENT_ID=1234567890-abcdef.apps.googleusercontent.com \
  -p 8080:8080 \
  ghcr.io/kbennett2000/markdown-wysiwyg:latest
```

Using **docker compose**? Set it once in your environment (or a `.env` file) and the
existing `docker-compose.yml` picks it up:

```bash
GDRIVE_CLIENT_ID=1234567890-abcdef.apps.googleusercontent.com docker compose up
```

That's it. Open the **File** menu → **Connect Google Drive**, pick your account in
Google's pop-up, approve access once, and you can now **Open from Drive** and **Save
to Drive**.

---

## How it works under the hood

At container start, the image writes a tiny `/config.js` from the `GDRIVE_CLIENT_ID`
you provided. The app reads that value, so the **same prebuilt image** can be
configured per‑deployment — no rebuilding. With no value set, `config.js` is empty
and Drive falls back to asking for a Client ID in‑app (the old behavior), so nothing
breaks.

The Google sign‑in code is still **lazy‑loaded only when you click a Drive action**,
so the editor remains fully offline until you choose to use Drive.

## Troubleshooting

- **"Error 400: redirect_uri_mismatch" / "origin mismatch"** — the address in your
  browser isn't in **Authorized JavaScript origins**. Add the exact
  `http://localhost:<port>` you're using and wait a minute for Google to update.
- **"Access blocked / app not verified"** — while your consent screen is in Testing,
  add your Google account under **Test users** (Step 1.3).
- **The paste‑a‑Client‑ID dialog still appears** — the container didn't receive
  `GDRIVE_CLIENT_ID`. Double‑check the `-e GDRIVE_CLIENT_ID=…` flag, then reload.

---

[← Back to the main page](../README.md)
