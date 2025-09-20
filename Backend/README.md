# EduLink Lanka - KuppiRoom 2.0

A tiny Node.js app.

## Setup

1. Copy `.env.example` to `.env` and set `MONGO_URI`:
	- Example: `mongodb+srv://USERNAME:PASSWORD@cluster0.tljpzbh.mongodb.net/DB_NAME?retryWrites=true&w=majority`
	- If your password has special characters, URL-encode them (e.g., `@` → `%40`).
2. Install deps and run:
	- `npm start` (or `npm run dev` for auto-restart)

## Scripts

- `npm start` — runs the app with Node (`node app.js`)
- `npm run dev` — runs the app with nodemon for auto-restart on changes

## Troubleshooting Atlas auth errors

If you see `bad auth : Authentication failed`:

- Confirm the database user and password in Atlas are correct; reset if unsure.
- Ensure the connection string includes a database name after `.net/` (e.g., `/mydb`).
- Check your IP Access List in Atlas (allow your IP or `0.0.0.0/0` temporarily for testing).
- URL-encode special characters in the password or use an environment variable.
- Make sure you are not using your Atlas account login—use a Database User instead.

## Connection string tips

- For Atlas SRV URIs (`mongodb+srv://`), do NOT include a port number. SRV resolves hosts and ports via DNS.
- If you must specify ports, use the non-SRV scheme:
	- `mongodb://host1:27017,host2:27017/DB_NAME?replicaSet=...`
	- Include your database name after the host list.
