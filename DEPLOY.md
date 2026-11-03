# Deploying and testing

## 1. Run it locally first

```bash
npm install
cp .env.example config.env   # then edit config.env
npm start
```

The bot prints either a **pairing code** or a **QR code**.

- Pairing code: create `config.env` with `PAIRING_NUMBER=265991234567`
  (your number, international format, digits only).
  Then in WhatsApp open **Settings → Linked devices → Link with phone number**
  and type the 8-character code.
- QR code: leave `PAIRING_NUMBER` empty. Scan the printed QR in
  **WhatsApp → Linked devices → Link a device**.

Once connected, `sessions/creds.json` is created. Keep it private.

## 2. Useful checks

| Command | What it does |
| --- | --- |
| `.menu` | Lists every loaded command |
| `.help` | Same as `.menu` |
| `.alive` | Uptime, prefix and mode |
| `.ping` | Response time |
| `.uptime` | Process uptime |

HTTP check: `curl http://localhost:8080/api/status`

That endpoint is public, so the QR and pairing code are **not** included by
default. To see them, set `STATUS_TOKEN` and open
`/api/status?token=YOUR_SECRET`.

## 3. Google Cloud Run notes

The GitHub repo is connected to Cloud Run, so **pushing to `main` redeploys**.

Cloud Run is designed for request/response web apps, not for long-lived
socket processes, so configure it carefully:

1. **Minimum instances = 1** and **CPU always allocated**. Otherwise the
   container is frozen/stopped and the WhatsApp socket drops.
2. **Login is lost on every cold start** because the container filesystem is
   temporary. To keep it:
   - log in once locally,
   - upload the generated `sessions/creds.json` to MEGA,
   - set `SESSION_ID` to that MEGA file id.
   Alternatively keep `PAIRING_NUMBER` set and re-pair after a restart.
3. **Port:** the app listens on `process.env.PORT` (Cloud Run sets `8080`).
   Leave the Cloud Run container port at `8080`.
4. **Secrets:** set `SESSION_ID`, `PAIRING_NUMBER`, `OWNER_NUMBER` as
   environment variables in Cloud Run, not in `config.js`.

## 4. Environment variables

| Variable | Meaning |
| --- | --- |
| `SESSION_ID` | MEGA file id with a saved `creds.json` |
| `PAIRING_NUMBER` | Number for pairing-code login |
| `STATUS_TOKEN` | Secret that unlocks QR/pairing code on `/api/status` |
| `OWNER_NUMBER` | Bot owner's WhatsApp number |
| `PREFIX` | Command prefix (default `.`) |
| `MODE` | `public`, `private`, `inbox` or `group` |
| `PORT` | HTTP port (Cloud Run sets this) |

## 5. Before going public

- Change `MODE` to `private` while testing.
- Use a spare WhatsApp number. Automation can get a number banned.
- Never commit `sessions/`, `config.env` or `creds.json` (see `.gitignore`).
