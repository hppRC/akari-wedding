# akari-wedding

Wedding gift selection website built with Astro and Tailwind CSS.

## Development

This project uses npm's official `min-release-age` setting in `.npmrc`:

```ini
min-release-age=7
```

That prevents npm from installing package versions published less than 7 days ago.

Install and run:

```sh
npm install
npm run dev
```

Local URL:

```text
http://127.0.0.1:4321/
```

## Build

```sh
npm run build
```

The static output is written to `dist/`.

## Notification Endpoint

The frontend reads the email notification endpoint from:

```text
PUBLIC_NOTIFY_ENDPOINT
```

For GitHub Pages, set this as a repository secret named `PUBLIC_NOTIFY_ENDPOINT`.

Google Apps Script code and setup notes are in:

```text
tools/google-apps-script/
```
