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

## Google Apps Script CLI

This repo uses `@google/clasp` for Google Apps Script CLI deployment.

Initial login opens Google OAuth once:

```sh
npm run gas:login
```

Before creating a project, enable the Google Apps Script API for the logged-in
Google account. This is a Google account setting, so the toggle itself happens
in the browser:

```sh
npm run gas:settings
```

Open the printed URL, turn on `Google Apps Script API`, then wait a minute or
two if Google still reports that it is disabled.

Create the Apps Script project:

```sh
npm run gas:create
```

Push and deploy:

```sh
npm run gas:deploy
```

List deployments again later:

```sh
npm run gas:deployments
```

For first-time authorization, open the Apps Script editor URL:

```sh
npm run gas:script-url
```

Open the printed URL, choose the `setup` function in the Apps Script editor,
and run it once. This grants the script's own scopes and creates the backing
Google Sheet. Do not use `clasp login --use-project-scopes` here; Google's
default clasp OAuth client can be blocked for these project scopes.

Before running `setup`, configure the recipient email addresses in Apps Script:

```text
Project Settings -> Script Properties -> Add script property
RECIPIENT_EMAILS=first@example.com,second@example.com
```

Recipient email addresses are intentionally kept out of the repository.

The Apps Script endpoint stores shared selected-gift state in a Google Sheet.
The sheet is created automatically on first submission, or can be created from
the CLI after deployment:

```sh
curl -L "$PUBLIC_NOTIFY_ENDPOINT?action=setup"
```

Apps Script Web Apps usually respond with a temporary redirect first, so `curl`
checks should use `-L`.
