# vPhone — Setup Guide

How to set up and run this project from scratch on a new machine.

**Stack:** NestJS backend (TypeScript REST API, TypeORM, JWT auth) · Plain HTML/CSS/JS frontend · MySQL database (via XAMPP)

The project is split into two folders: a **backend** (the NestJS API server) and a **frontend** (the website you see in the browser). You'll set up the database first, then the backend, then the frontend.

---

## 1. Prerequisites

Install these once before anything else:

- **[XAMPP](https://www.apachefriends.org/)** — provides the MySQL database and phpMyAdmin.
- **[Node.js](https://nodejs.org/)** — LTS version recommended. This also installs `npm`.
- **[VS Code](https://code.visualstudio.com/)** — recommended, mainly for the Live Server extension used to run the frontend.
- **[Git](https://git-scm.com/)** — to clone the repo.

Verify Node installed correctly:

```bash
node -v
npm -v
```

Both should print a version number.

---

## 2. Get the code

```bash
git clone <your-repo-url>
cd V-Phone-Project
```

---

## 3. Database setup (XAMPP + phpMyAdmin)

1. Open the **XAMPP Control Panel** and click **Start** on both **Apache** and **MySQL**.
2. In your browser, go to **http://localhost/phpmyadmin**.
3. Click **New** in the left sidebar and create a database named exactly:

   ```
   vphone
   ```

   (Collation `utf8mb4_general_ci` is a safe default.)
4. Select the new `vphone` database in the left sidebar, then open the **Import** tab.
5. Click **Choose File**, pick the project's `.sql` dump (the file you normally import to get the tables — see the note below), and click **Import** / **Go**.
6. After it finishes, you should see the tables appear under `vphone` in the sidebar.

> **Heads up:** the `.sql` file doesn't appear to be committed in the repo, so a fresh clone won't have it. Make sure it lives somewhere in the project (e.g. a `backend/database/` folder) and commit it — otherwise anyone following this guide will have no tables to import. If your TypeORM config in `backend/src/app.module.ts` has `synchronize: true`, NestJS will create the tables automatically on first run, and the `.sql` would only be needed for seed data (products, etc.).

> The default XAMPP MySQL setup uses user `root` with **no password** on port `3306` — which is exactly what the backend's `.env` expects, so no changes are needed there.

---

## 4. Backend setup

```bash
cd backend
npm install
```

Create your `.env` file from the template:

- **Windows:** `copy .env.example .env`
- **Mac/Linux:** `cp .env.example .env`

Open the new `.env` and review the values. For a default XAMPP setup you can leave the `DB_*` values as they are. **Do** set a real `JWT_SECRET` — generate a strong random one with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Paste the output as your `JWT_SECRET`.

Your `.env` should look like this:

```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=vphone
PORT=3000
JWT_SECRET=<paste the generated value here>
JWT_EXPIRES_IN=7d
```

Start the backend:

```bash
npm run start:dev
```

It should run on **http://localhost:3000**. Leave this terminal open — the server keeps running here.

---

## 5. Frontend setup

The frontend is plain HTML/CSS/JS, so there's **no install or build step**. You just need to serve it (opening the file directly with `file://` often breaks API calls, so serve it properly).

**Option A — VS Code Live Server (easiest):**
1. Install the **Live Server** extension in VS Code.
2. Open the `frontend/` folder in VS Code.
3. Right-click `index.html` → **Open with Live Server**.
4. It opens at something like **http://localhost:5500**.

**Option B — command line:**

```bash
npx serve frontend
```

This serves the static files and prints a local URL.

> **Check the API URL:** somewhere in the frontend JS there's likely a line like
> `const API_URL = "http://localhost:3000";`
> Make sure it points to wherever the backend is running. If you ever change the backend `PORT`, update it here too.

---

## 6. Running the app day-to-day

Once the one-time setup above is done, the routine to start everything is:

1. **XAMPP:** start **MySQL** (and Apache).
2. **Backend:** in the `backend/` folder, run `npm run start:dev`.
3. **Frontend:** open it via Live Server (or `npx serve frontend`).
4. Visit the frontend URL in your browser.

To stop: close the browser tab, press `Ctrl + C` in the backend terminal, and stop the services in XAMPP.

---

## Troubleshooting

| Problem | Likely cause / fix |
| --- | --- |
| Backend won't start: "port 3000 in use" | Another process is using it. Change `PORT` in `.env`, or stop the other process. |
| "ECONNREFUSED" / database connection error | MySQL isn't running in XAMPP, or `DB_NAME` doesn't match the database you created. |
| Frontend loads but no data / network errors | Backend isn't running, or the `API_URL` in the frontend JS points to the wrong address. |
| CORS errors in the browser console | The backend needs to allow the frontend's origin (e.g. `http://localhost:5500`) in its CORS settings. |
| 401 / "unauthorized" after logging in | `JWT_SECRET` may be missing or was changed (which invalidates existing logins — just log in again). |
| phpMyAdmin import fails: file too large | Increase `upload_max_filesize`/`post_max_size` in XAMPP's `php.ini`, or import via the MySQL command line. |
