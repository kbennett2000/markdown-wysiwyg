# Installing on Mac 🍎

Welcome! This guide gets the editor running on your Mac. It's written for people who
have **never** done anything like this before, so we'll go slowly and explain
everything. You genuinely can't break your Mac by following these steps. 💙

There are just **two things** to do: install a free helper called **Docker**, then
paste **one line** to start the editor. Let's go.

---

## What you'll need

- A Mac with macOS (anything reasonably recent is fine).
- About 10 minutes, mostly waiting for downloads.

> Works on **both** kinds of Mac — the newer Apple Silicon ones (M1/M2/M3/M4) and
> the older Intel ones. You don't need to know which you have; it just works.

---

## Step 1 — Install Docker Desktop

"Docker" is a free program that knows how to run apps like this one in a tidy little box.

1. Go to **<https://www.docker.com/products/docker-desktop/>**.
2. Click **Download for Mac**. (If it offers a choice, **Apple Chip** is for
   M1/M2/M3/M4 Macs and **Intel Chip** is for older ones. Not sure? Click the Apple
   menu  → *About This Mac* and look at "Chip" or "Processor".)
3. Open the downloaded **`Docker.dmg`** file.
4. In the window that appears, **drag the Docker whale 🐳 into the Applications folder.**
5. Open **Docker** from your Applications (or Launchpad). The first time it may ask
   for your password and to accept an agreement — that's normal; click **Accept**.

> ⏳ Give it a minute. When the **whale icon** 🐳 in the menu bar at the top stops
> animating and sits still, Docker is ready. You only ever do Step 1 once.

---

## Step 2 — Open the Terminal

The "Terminal" is just a window where you can paste a command. You'll only paste one line.

1. Press **Command (⌘) + Space** to open Spotlight search.
2. Type **`terminal`**.
3. Press **Enter**.

A window with text opens. That's the Terminal. 👍

---

## Step 3 — Start the editor

Copy the line below, click into the Terminal window, **paste** it (**Command (⌘) + V**),
then press **Enter**:

```bash
docker run --rm -p 8080:8080 ghcr.io/kbennett2000/markdown-wysiwyg:latest
```

The first time, it downloads the app — you'll see text scrolling. That's normal.
When it settles down and mentions it's *ready to accept connections*, the editor is
running.

> 💡 Keep this Terminal window open while you're writing. It's quietly running the
> editor for you.

---

## Step 4 — Open the editor in your browser

Open your web browser (Safari, Chrome, Firefox… any is fine) and go to:

### 👉 <http://localhost:8080>

You should see this:

![The editor open in a browser](images/editor-light.png)

🎉 **You're in!** Start typing. Head over to the
**[Using the editor](using-the-editor.md)** tour to see what all the buttons do.

---

## Stopping and starting again

- **To stop it:** click the Terminal window and press **Control + C**. (You can also
  just close the window.)
- **To start it again later:** open Terminal again and paste the same line from
  Step 3. No need to reinstall anything.

## Changing the port (optional)

If something else is already using `8080`, pick another number — for example `9000`.
Run this instead, then visit <http://localhost:9000>:

```bash
docker run --rm -e APP_PORT=9000 -p 9000:9000 ghcr.io/kbennett2000/markdown-wysiwyg:latest
```

## If something goes wrong 🛟

- **A red error mentioning Docker, or "command not found: docker"** — Docker Desktop
  probably isn't running yet. Open it from Applications, wait for the menu‑bar whale
  to go still, then try Step 3 again.
- **"port is already allocated"** — something else is using `8080`. Use the
  "Changing the port" steps above to pick a different number.
- **The browser page won't load** — wait a few more seconds after Step 3, then
  refresh. Make sure the Terminal window is still open.

---

[← Back to the main page](../README.md) · [Using the editor →](using-the-editor.md)
