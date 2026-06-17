# Installing on Linux 🐧

Welcome! This guide gets the editor running on your Linux machine. It's written to be
friendly even if you're new to this. There are just **two things** to do: install a
free helper called **Docker**, then run **one line** to start the editor. 💙

---

## What you'll need

- Any modern Linux desktop (Ubuntu, Fedora, Debian, Mint, etc.).
- About 10 minutes.

---

## Step 1 — Install Docker

"Docker" is a free program that knows how to run apps like this one in a tidy little box.

**The easy, works‑everywhere way.** Open your terminal (see Step 2 if you're not sure
how) and run:

```bash
curl -fsSL https://get.docker.com | sh
```

This official script installs Docker for you. When it finishes, run this once so you
can use Docker without typing `sudo` every time (then **log out and back in**, or
restart, for it to take effect):

```bash
sudo usermod -aG docker $USER
```

> Prefer your distribution's own instructions? They're here:
> **<https://docs.docker.com/engine/install/>**. On Ubuntu/Fedora/etc. you can also
> install **Docker Desktop** if you'd rather have a graphical app.

---

## Step 2 — Open a terminal

Most desktops: press the **Super (Windows) key**, type **`terminal`**, and press
**Enter**. Or look for **Terminal** / **Console** in your applications menu.

---

## Step 3 — Start the editor

Run this **one line**:

```bash
docker run --rm -p 8080:8080 ghcr.io/kbennett2000/markdown-wysiwyg:latest
```

The first time, it downloads the app — you'll see text scrolling. That's normal. When
it settles and mentions it's *ready to accept connections*, the editor is running.

> 💡 Keep this terminal open while you're writing — it's running the editor for you.
>
> If you see a **"permission denied"** error, either you haven't logged out and back
> in since Step 1, or you can simply put `sudo` in front:
> `sudo docker run --rm -p 8080:8080 ghcr.io/kbennett2000/markdown-wysiwyg:latest`

---

## Step 4 — Open the editor in your browser

Open your web browser and go to:

### 👉 <http://localhost:8080>

You should see this:

![The editor open in a browser](images/editor-light.png)

🎉 **You're in!** Start typing. Head over to the
**[Using the editor](using-the-editor.md)** tour to see what all the buttons do.

---

## Stopping and starting again

- **To stop it:** click the terminal and press **Ctrl + C**.
- **To start it again later:** run the same line from Step 3. No reinstalling needed.

## Changing the port (optional)

If something else is already using `8080`, pick another number — for example `9000`.
Run this instead, then visit <http://localhost:9000>:

```bash
docker run --rm -e APP_PORT=9000 -p 9000:9000 ghcr.io/kbennett2000/markdown-wysiwyg:latest
```

## If something goes wrong 🛟

- **"permission denied while trying to connect to the Docker daemon"** — log out and
  back in (so the group change from Step 1 applies), or prefix the command with
  `sudo`.
- **"Cannot connect to the Docker daemon"** — start Docker with
  `sudo systemctl start docker`, then try again.
- **"port is already allocated"** — something else is using `8080`. Use the "Changing
  the port" steps above.
- **The browser page won't load** — wait a few seconds, refresh, and make sure the
  terminal is still running.

---

[← Back to the main page](../README.md) · [Using the editor →](using-the-editor.md)
