# Installing on Windows 🪟

Welcome! This guide gets the editor running on your Windows PC. It's written for
people who have **never** done anything like this before, so we'll go slowly and
explain everything. You can't break your computer by following these steps. 💙

There are just **two things** to do: install a free helper called **Docker**, then
paste **one line** to start the editor. Let's go.

---

## What you'll need

- A Windows 10 or Windows 11 computer (64‑bit — almost all PCs from the last several years).
- About 10 minutes, mostly waiting for things to download.

---

## Step 1 — Install Docker Desktop

"Docker" is a free program that knows how to run apps like this one in a tidy little box.

1. Go to **<https://www.docker.com/products/docker-desktop/>**.
2. Click **Download for Windows**.
3. Open the file you downloaded (it's called something like `Docker Desktop Installer.exe`).
4. Click **OK** / **Next** through the installer, then click **Close** when it finishes.
   It may ask you to **restart your computer** — go ahead and let it.
5. After restarting, open **Docker Desktop** from the Start menu. The first time, it
   may ask you to accept an agreement — click **Accept**.

> ⏳ Give it a minute. When the little **whale icon** 🐳 near your clock stops
> animating and sits still, Docker is ready. You only ever have to do Step 1 once.

---

## Step 2 — Open the terminal

The "terminal" is just a window where you can paste a command. Don't worry, you'll
only paste one line.

1. Click the **Start** button.
2. Type **`powershell`**.
3. Click **Windows PowerShell** when it appears.

A dark window with text opens. That's the terminal. 👍

---

## Step 3 — Start the editor

Copy the line below, click into the terminal window, and **paste** it
(right‑click, or press **Ctrl + V**), then press **Enter**:

```powershell
docker run --rm -p 8080:8080 ghcr.io/kbennett2000/markdown-wysiwyg:latest
```

The first time, it will download the app — you'll see some text scrolling. That's
normal. When it settles down and shows a line mentioning it's *ready to accept
connections*, the editor is running.

> 💡 Keep this terminal window open while you're writing. It's quietly running the
> editor for you.

---

## Step 4 — Open the editor in your browser

Open your web browser (Edge, Chrome, Firefox… any is fine) and go to:

### 👉 <http://localhost:8080>

You should see this:

![The editor open in a browser](images/editor-light.png)

🎉 **You're in!** Start typing. Head over to the
**[Using the editor](using-the-editor.md)** tour to see what all the buttons do.

---

## Stopping and starting again

- **To stop it:** click the terminal window and press **Ctrl + C**. (You can also
  just close the window.)
- **To start it again later:** open PowerShell again and paste the same line from
  Step 3. No need to reinstall anything.

## Changing the port (optional)

If something else is already using `8080`, you can pick another number — for example
`9000`. Run this instead, then visit <http://localhost:9000>:

```powershell
docker run --rm -e APP_PORT=9000 -p 9000:9000 ghcr.io/kbennett2000/markdown-wysiwyg:latest
```

## If something goes wrong 🛟

- **"docker: command not found" or a red error about Docker** — Docker Desktop
  probably isn't running yet. Open it from the Start menu, wait for the whale icon to
  go still, then try Step 3 again.
- **"port is already allocated"** — something else is using `8080`. Use the
  "Changing the port" steps above to pick a different number.
- **The browser page won't load** — give it a few more seconds after Step 3, then
  refresh. Make sure the terminal window is still open.

---

[← Back to the main page](../README.md) · [Using the editor →](using-the-editor.md)
