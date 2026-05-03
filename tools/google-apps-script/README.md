# Google Apps Script Endpoint

This folder contains the Google Apps Script Web App used by the static wedding
gift site.

It handles:

- email notification to the gift givers,
- shared selected-gift state across devices,
- append-only submission history in Google Sheets.

## CLI Setup

Most setup can be done from the CLI with `clasp`.

The expected browser steps are Google OAuth login and enabling the account-level
Google Apps Script API setting.

```sh
npm run gas:login
```

Print the Apps Script user settings URL:

```sh
npm run gas:settings
```

Open the printed URL, turn on `Google Apps Script API`, then wait a minute or
two if `clasp create` still reports:

```text
User has not enabled the Apps Script API.
```

Create the Apps Script project:

```sh
npm run gas:create
```

This writes `tools/google-apps-script/.clasp.json`. Keep it locally if you do
not want to commit the Apps Script script id.

If `gas:create` fails, `gas:deploy` and `gas:deployments` will also fail with
`Project settings not found` because `.clasp.json` has not been created yet.

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
Google Sheet.

Do not use `clasp login --use-project-scopes` or `clasp run setup` for this
project. Google's default clasp OAuth client can be blocked for these project
scopes, and `clasp run` also requires an Execution API deployment.

Copy the Web App URL printed by `clasp deploy`, then use it as:

```sh
PUBLIC_NOTIFY_ENDPOINT="https://script.google.com/macros/s/.../exec"
```

For GitHub Pages, add the same value as the repository secret
`PUBLIC_NOTIFY_ENDPOINT`.

## Shared State

No Google Sheet needs to be created manually.

On the first submission, `Code.gs` creates a spreadsheet named
`akari-wedding-selection`, stores its id in Script Properties, and creates:

- `current`: latest selected gift, one data row.
- `history`: append-only submission log.

To create the spreadsheet before the first real submission, call the deployed
Web App setup endpoint from the CLI:

```sh
curl -L "$PUBLIC_NOTIFY_ENDPOINT?action=setup"
```

Apps Script Web Apps usually respond with a temporary redirect first, so `curl`
checks should use `-L`.

## Frontend API

The frontend submits a form-encoded `POST` with:

- `giftId`
- `giftName`
- `giftMessage`
- `submittedAt`

The frontend uses `fetch(..., { mode: 'no-cors' })` for POST because Apps Script
does not provide normal CORS control for this use case.

The frontend reads shared selection state with JSONP:

```text
GET $PUBLIC_NOTIFY_ENDPOINT?action=status&callback=...
```

Example response:

```js
callback({
  ok: true,
  selected: {
    giftId: "pajama",
    giftName: "おそろいパジャマ",
    giftMessage: "おそろいのパジャマで仲良く過ごしてね",
    submittedAt: "2026-05-03T00:00:00.000Z",
    receivedAt: "2026-05-03T00:00:01.000Z"
  }
});
```
