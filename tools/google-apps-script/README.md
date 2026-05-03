# Google Apps Script Notification Endpoint

This folder contains the Google Apps Script code for the v1 email notification endpoint.

## Setup

1. Create a new Google Apps Script project.
2. Paste `Code.gs` into the project.
3. Deploy as a Web App.
4. Set access to "Anyone" or "Anyone with the link", depending on the available Google Apps Script UI.
5. Copy the Web App URL.
6. Add the URL to the GitHub repository secret `PUBLIC_NOTIFY_ENDPOINT`.
7. Re-run the GitHub Pages deploy workflow.

The frontend sends a simple form-encoded `POST` with:

- `giftId`
- `giftName`
- `submittedAt`

The frontend uses `fetch(..., { mode: 'no-cors' })` so the browser receives an opaque response. The UI treats a completed request as success. This avoids CORS issues with Apps Script and keeps the implementation small for the temporary gift-selection site.
