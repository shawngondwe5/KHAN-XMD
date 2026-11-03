# System32 WB

A WhatsApp multi-device bot built with Node.js, Express and the Baileys library.

## What it includes

- WhatsApp QR and phone-number pairing
- A small web page showing connection status
- Command-based utilities and media tools
- Optional group moderation and automation features
- Configurable command prefix and public/private operating mode

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- A WhatsApp account to link as a companion device

## Run locally

```bash
git clone https://github.com/shawngondwe5/KHAN-XMD.git
cd KHAN-XMD
npm install
cp .env.example config.env
```

Edit `config.env` before starting the bot. At minimum, set an owner number and choose a login method:

- `PAIRING_NUMBER`: phone number in international format, digits only (for example, `265991234567`). Leave empty to use QR pairing.
- `SESSION_ID`: optional MEGA session file ID if you already have a saved session.
- `PREFIX`: command prefix; defaults to `.`.
- `MODE`: operating mode; the example file defaults to `private`.
- `OWNER_NUMBER`: owner's WhatsApp number in international format.

Start the bot:

```bash
npm start
```

The status page is served on the configured port (defaults to `3000`). Open `http://localhost:3000`. If the page is hosted publicly, set a strong `STATUS_TOKEN` so the pairing QR/code is not exposed to everyone, then open the page with `/?token=YOUR_SECRET`.

## Commands

Send `.menu` (or `.help`) in WhatsApp to see the core command directory. The menu intentionally excludes audio-forwarding, Quran/religious, channel and regional-staff commands; those plugin files are not removed by this display filter.

The `.alive` command reports uptime and `.ping` checks command response time. The actual prefix is controlled by `PREFIX`.

## Validation

Run the repository-wide JavaScript syntax check:

```bash
npm run check
```

This checks JavaScript files in the project while skipping dependency and generated directories.

## Security notes

- Never commit `config.env`, session credentials, pairing codes or access tokens.
- Keep `STATUS_TOKEN` private when the status page is internet-accessible.
- This project is not affiliated with WhatsApp or Meta. Use it in accordance with WhatsApp's terms and local law.

## Project

- Source: https://github.com/shawngondwe5/KHAN-XMD
- Issues: https://github.com/shawngondwe5/KHAN-XMD/issues

