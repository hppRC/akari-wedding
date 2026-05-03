# Akari Wedding Gift Website Technical Spec

## Purpose

Wedding gift selection website for the gift recipient.

The recipient opens a shared URL, reviews gift candidates, selects one preferred item, and sends that selection to the gift giver. The gift giver receives a notification through LINE or an equivalent channel.

## Current Inputs

- Repository: `/Users/hpp/ghq/github.com/hppRC/akari-wedding`
- Existing overview image: `images/overview.png`
- Existing individual product images:
  - `images/IMG_0016.jpg`
  - `images/IMG_0017.jpg`
  - `images/IMG_0018.jpg`
  - `images/IMG_0019.jpg`
  - `images/IMG_0020.jpg`
  - `images/IMG_0021.jpg`
  - `images/IMG_0022.jpg`
  - `images/IMG_0025.jpg`
  - `images/IMG_0026.jpg`
- Individual images are currently 2048 x 2048 JPEG files.
- Overview image is currently 1415 x 2000 PNG.

## Product Candidates

The overview image shows these 9 items:

| ID | Item | Message in Overview | Image File |
| --- | --- | --- | --- |
| pajama | おそろいパジャマ | おそろいのパジャマで仲良く過ごしてね | `images/IMG_0022.jpg` |
| air-cleaner | ジアイーノ | よっしーの作った綺麗な空気で過ごしてね | `images/IMG_0021.jpg` |
| facial-device | 美顔器 | ツルツルお肌になっちゃおう！ | `images/IMG_0020.jpg` |
| bread-maker | ホームベーカリー | 美味しいパンで幸せ家庭になってね | `images/IMG_0019.jpg` |
| hair-dryer | ドライヤー | 2人で美髪になってね | `images/IMG_0018.jpg` |
| garment-steamer | 衣類スチーマー | シワなし服のシゴデキ夫婦を応援します | `images/IMG_0017.jpg` |
| shower-head | シャワーヘッド | 優雅なお風呂時間を過ごしてね | `images/IMG_0016.jpg` |
| hot-plate | ホットプレート | パーティだ！ | `images/IMG_0026.jpg` |
| air-fryer | エアフライヤー | 時短で美味しく〜 | `images/IMG_0025.jpg` |

Product data should be stored in JSON or TypeScript data so item text and image paths are not hard-coded in components.
Product display names should follow the overview image.

## Hosting Requirements

### Desired

- No self-managed server.
- Static hosting preferred:
  - GitHub Pages, or
  - AWS S3 static website hosting / S3 + CloudFront.

### Implications

Static hosting can serve the website and images, but cannot safely hold secrets such as LINE channel access tokens or webhook credentials in frontend code.

Notification therefore needs one of the following:

1. External form/backend service
   - Examples: Google Forms, Formspree, Netlify Forms, Airtable Forms, Typeform, Google Apps Script web app.
   - Lowest operational burden.
   - Data and notification behavior depend on the service.

2. Serverless function
   - Examples: AWS API Gateway + Lambda, AWS Lambda Function URL, Cloudflare Workers, Vercel Serverless Functions, Netlify Functions.
   - Keeps LINE credentials server-side.
   - More setup than pure static hosting, but still serverless.

3. Client-side `mailto:` / LINE share fallback
   - No backend.
   - Recipient must manually send the message.
   - Least reliable because notification is not automatic.

### Hosting Decision Draft

Recommended for v1:

- Frontend: GitHub Pages.
- Notification endpoint: Google Apps Script Web App.
- Notification channel: email for v1.

Rationale:

- GitHub Pages gives free HTTPS and a simple deploy path.
- The site contains no sensitive purchase details, personal data, or secrets.
- Notification-only requirements do not justify AWS complexity unless stronger access control is required.
- Google Apps Script can keep notification details outside the frontend and can notify multiple email recipients. It can also post to Slack via Incoming Webhook later if the notification adapter is changed.
- Google Apps Script is easier than maintaining AWS IAM/API Gateway/Lambda for this small notification-only use case.

Use AWS S3 + CloudFront instead if:

- CloudFront signed URLs/cookies are required.
- The public page must be harder to access than an unlisted GitHub Pages URL.
- AWS ownership is preferred for takedown, logs, and access-control knobs.

## Recommended Architecture Draft

### Frontend

- Astro static site.
- Tailwind CSS for styling.
- Japanese-only UI.
- Responsive layout for mobile and desktop.
- Product grid built from individual images, not from `overview.png`.
- Product detail modal or detail sheet for larger individual images.
- Recipient can select exactly one gift.
- Show confirmation screen/modal before submit.
- Confirmation submit button text: `これを選ぶ！`
- Success screen text: `選んでくれてありがとう！贈る側にお知らせしました。`
- No recipient name field.
- No free-text comment field.
- No deadline display for v1.
- Re-submission is allowed.
- Use local browser state only for small UX conveniences, such as showing the last submitted item; do not block re-submission.

### Frontend Visual Direction

- Preserve the pastel, hand-drawn wedding catalogue mood.
- Lean cute and hand-drawn rather than formal/elegant.
- Pixel-perfect reproduction of the overview image is not required.
- The site should feel polished and gift-like, not like a generic form.
- Avoid heavy marketing-page structure; first screen should immediately show the gift-selection experience.
- Use individual product cards with:
  - image,
  - item name,
  - one-line message,
  - selected state.
- Wedding-like motion is welcome, but should be lightweight and non-disruptive:
  - slow floating line-art petals/sparkles,
  - subtle card reveal,
  - gentle selected-card animation,
  - confirmation transition.
- Use CSS animation for v1.
- Do not use Three.js/WebGL in v1.

### Frontend Stack

Proposed packages:

- `astro`
- `tailwindcss`
- `@tailwindcss/vite` or Astro's Tailwind integration, depending on the chosen Astro version.
- Do not add `three` for v1.

Build output must be static assets deployable to GitHub Pages or S3.

### Data Model

Product data example:

```ts
type GiftProduct = {
  id: string;
  name: string;
  message: string;
  image: string;
};
```

Submission payload example:

```json
{
  "giftId": "hair-dryer",
  "giftName": "ドライヤー",
  "submittedAt": "2026-05-03T00:00:00.000Z"
}
```

### Notification Backend

Preferred technical design for v1:

- Static frontend submits selection via HTTPS `POST` to a lightweight serverless/form endpoint.
- Endpoint sends notification to one or more gift givers.
- Endpoint returns success/failure JSON.
- No persistent storage is required for v1.

The frontend should call a single notification API abstraction, not email-specific code directly. This keeps the current email backend replaceable with Slack, LINE Messaging API, or another serverless endpoint later.

Notification channel priority:

1. Email
   - Easiest multi-recipient option.
   - Works well through Google Apps Script or form services.
   - v1 target recipients:
     - `yanonay3@gmail.com`
     - `hpp.ricecake@gmail.com`
2. Slack
   - Simple if there is a Slack workspace/channel.
   - Incoming Webhook can notify a channel with multiple people.
   - Later replacement/addition candidate.
3. LINE
   - Requires setup of a LINE Official Account and Messaging API channel.
   - For group/multi-person chat notification, the bot must be added to the target chat and the group/room id must be obtained.
   - LINE Notify should not be used because it has been discontinued.
   - Later replacement/addition candidate.

### Notification Text

Initial notification text:

```text
あかりさんがギフトを選びました。

選択: ドライヤー
送信日時: 2026-05-03 10:30
```

If the final recipient label should not be "あかりさん", change before implementation.

### Data Storage

The current implementation stores shared selected-gift state in Google Sheets
through the Google Apps Script endpoint.

- `current` sheet:
  - stores the latest selected gift as one data row.
  - used by the frontend to show the same selected state across devices.
- `history` sheet:
  - append-only submission log.
  - preserves re-submission history for the gift givers.

The spreadsheet is created automatically by Apps Script on first submission or
by calling:

```sh
curl -L "$PUBLIC_NOTIFY_ENDPOINT?action=setup"
```

Apps Script Web Apps usually respond with a temporary redirect before the final
JSON response, so CLI checks should follow redirects.

Selection locking is not required because:

- the URL is intended for one couple only,
- re-submission is allowed,
- only one final choice needs to be acted on by the giver.

The frontend reads shared state with JSONP:

```text
GET $PUBLIC_NOTIFY_ENDPOINT?action=status&callback=...
```

## Access Control

Goal:

- The site should not be easy for unrelated people to find.
- Strong authentication is not required for v1.

Recommended v1:

- Use an unlisted URL.
- Add `robots.txt` and `noindex` meta tags.
- Do not require a passphrase.
- Do not require signed URLs for v1.
- Do not remember any access state in the browser.

Important limitation:

- If hosted as a purely static GitHub Pages site, static assets are public to anyone with the URL.
- `noindex` and an unlisted URL only prevent casual discovery; they are not strong access control.

Stronger alternatives:

1. S3 + CloudFront signed URL
   - Can restrict access to the static site with a signed URL.
   - More setup and a less friendly URL.
   - Long-lived signed URLs can stay open until manually revoked, but operational handling is more complex than a passphrase.

2. CloudFront Functions / Lambda@Edge basic gate
   - Can check a cookie or path token before serving the site.
   - More AWS-specific setup.

3. Cloudflare Pages + Access / Worker gate
   - Often simpler than AWS for gated static pages.
   - Outside the initial GitHub Pages/S3 preference.

Decision:

- Use "unlisted URL + noindex" for v1.
- Do not use a passphrase or signed URL in v1.
- Revisit S3 + CloudFront signed URLs only if stronger access control becomes necessary.

## V1 Recommendation

Build v1 with:

- Astro static site.
- Tailwind CSS.
- GitHub Pages hosting.
- Product data in `src/data/gifts.ts` or `src/data/gifts.json`.
- CSS-first wedding animation.
- Google Apps Script notification endpoint.
- Email notification to multiple recipients.
- Optional Slack Incoming Webhook if a Slack channel is desired.

Defer from v1:

- LINE Messaging API, unless LINE is chosen as mandatory.
- CloudFront signed URLs.
- Passphrase gate.
- Three.js/WebGL decoration.
- Persistent storage.
- CAPTCHA/rate limiting.
- Strong account-based authentication.

Reasoning:

- This satisfies the core experience with the least operational weight.
- It keeps secrets out of the frontend.
- It allows multiple recipients through email or Slack.
- It is simple enough for an unlisted, temporary, low-risk gift-selection site, assuming casual discovery prevention is sufficient.
- It can be moved to S3/CloudFront later without changing the Astro frontend much.

## Implementation Milestones

1. Scaffold Astro + Tailwind.
2. Add structured gift data and image mapping.
3. Build responsive gift-selection page.
4. Add confirmation modal.
5. Add success/error states.
6. Add lightweight wedding animation.
7. Add noindex/robots controls.
8. Create Google Apps Script email notification endpoint.
9. Wire frontend submission to endpoint through a notification abstraction.
10. Test locally and on deployed GitHub Pages URL.
11. Optional: add Slack notification or LINE Messaging API.

## Open Questions

### Gift Selection Flow

Resolved:

- Recipient chooses exactly one item.
- Re-submission is allowed.
- The URL is intended for one couple only.
- Show a confirmation screen.
- Confirmation submit button text is `これを選ぶ！`.
- Success screen text is `選んでくれてありがとう！贈る側にお知らせしました。`.
- Show only illustration, item name, and one-line message.
- No recipient name field.
- No free-text comment field.
- No deadline for v1.

Open:

1. What should the final confirmation button text be?
2. What should the success screen say after submission?

### Notification

Resolved:

- LINE, email, or Slack are acceptable.
- Simple implementation is preferred.
- Multiple notification recipients would be useful.
- LINE Official Account / Messaging API channel does not exist yet.
- External services are acceptable.
- Notification-only is enough; persistent storage is not required.
- Email is the v1 notification channel.
- v1 email recipients are `yanonay3@gmail.com` and `hpp.ricecake@gmail.com`.
- Notification implementation should remain replaceable so Slack or LINE can be added later.
- Notification text can keep "あかりさんがギフトを選びました。"

Open:

1. If Slack is added later: which workspace/channel and webhook should be used?
2. If LINE is added later: should we create a LINE Official Account and Messaging API setup?

### Hosting and Domain

Resolved:

- GitHub Pages or AWS S3 are both acceptable.
- Prefer whichever is secure and simple.
- No custom domain.
- Temporary site, but should remain open until manually unpublished.
- Abuse prevention is not required for v1.

Open:

1. If stronger access control becomes required, should we choose S3 + CloudFront signed URL instead of GitHub Pages?

### Visual Design

Resolved:

- Design quality is important.
- Preserve the pastel/hand-drawn direction.
- Pixel-perfect reproduction is not required.
- Rebuild the grid using individual images.
- Responsive for mobile and PC.
- Japanese only.
- Simple wedding-like animation is welcome.
- Astro and Tailwind are preferred.
- Three.js/WebGL is welcome if it creates a beautiful result without fragility.
- Visual direction should lean cute and hand-drawn.
- Use CSS animation for v1.
- Do not use Three.js/WebGL in v1.

Open:

1. Is background music/sound explicitly unwanted? Current assumption: no sound.

### Product Data

Resolved:

- Image mapping:
  - `IMG_0016.jpg`: シャワーヘッド
  - `IMG_0017.jpg`: 衣類スチーマー
  - `IMG_0018.jpg`: ドライヤー
  - `IMG_0019.jpg`: ホームベーカリー
  - `IMG_0020.jpg`: 美顔器
  - `IMG_0021.jpg`: ジアイーノ
  - `IMG_0022.jpg`: おそろいパジャマ
  - `IMG_0025.jpg`: エアフライヤー
  - `IMG_0026.jpg`: ホットプレート
- Purchase URLs/model numbers are for the giver only and should not be displayed.
- Product data should be JSON/structured data.
- Product display names should follow the overview image.

Open:

1. Should `時短で美味しく〜` use the wave dash as-is, or normalize to `時短で美味しくね` / another wording?

### Privacy and Abuse Prevention

Resolved:

- URL is shared with one couple only.
- No name/comment fields for v1, so personal information collection is minimized.
- Abuse prevention is not required for v1.
- No passphrase for v1.
- No signed URL for v1.
- No browser memory for authentication/access state.

## Decisions

Record confirmed decisions here as they are made.

- 2026-05-03: Website should be serverless.
- 2026-05-03: Static hosting candidates are GitHub Pages or AWS S3.
- 2026-05-03: Notification should go to the gift giver through LINE or a similar channel.
- 2026-05-03: Recipient can choose exactly one gift.
- 2026-05-03: Re-submission is allowed.
- 2026-05-03: The URL is intended for one couple only.
- 2026-05-03: Show a confirmation screen before submission.
- 2026-05-03: Show illustration, item name, and one-line message only.
- 2026-05-03: No recipient name, comment field, or deadline for v1.
- 2026-05-03: Notification-only is enough; persistent storage is not required for v1.
- 2026-05-03: No custom domain.
- 2026-05-03: No abuse prevention for v1 beyond endpoint validation.
- 2026-05-03: Japanese-only UI.
- 2026-05-03: Use Astro and Tailwind for the frontend.
- 2026-05-03: Use structured product data, preferably JSON or TypeScript data.
- 2026-05-03: Use email notification for v1.
- 2026-05-03: v1 email recipients are `yanonay3@gmail.com` and `hpp.ricecake@gmail.com`.
- 2026-05-03: Keep the notification implementation replaceable so Slack or LINE can be added later.
- 2026-05-03: Do not use a passphrase for v1.
- 2026-05-03: Do not use signed URLs for v1.
- 2026-05-03: Product display names should follow the overview image.
- 2026-05-03: Visual direction should lean cute and hand-drawn.
- 2026-05-03: Notification text can keep "あかりさんがギフトを選びました。"
- 2026-05-03: Confirmation submit button text is `これを選ぶ！`.
- 2026-05-03: Success screen text is `選んでくれてありがとう！贈る側にお知らせしました。`.
- 2026-05-03: Use CSS animation for v1 and do not use Three.js/WebGL.

## Implementation Notes

No implementation has started yet. This document is the working specification source for future development.

Before implementation, decide only if needed:

1. final deploy target, if not GitHub Pages.
