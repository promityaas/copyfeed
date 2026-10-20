# Manual acceptance — required before production release

Use only authorized test accounts/content. This checklist is intentionally pending; it is not a record of passed tests. Record browser/version, platform URL type, extension version, expected/actual behavior and console errors. Do not share cookies, private comments or credentials in reports.

## Installation and upgrades

- In an unmanaged Chrome 120+ profile, load `dist/copyfeed-v0.16.0`. Confirm no manifest/service-worker errors and all files exist. `npm run test:extension` provides additional controlled installed-context checks where policy permits it.
- Back up a real 0.15.0 library. Update in place with the same extension identity; confirm notes, saved flags and transcripts survive. Restart Chrome and inspect the library again. Export then import into a separate test installation and compare all retained datasets, including history, comments, hooks, briefs and storyboards.
- Open a stale tab after an update: confirm a useful refresh/version error rather than mixed bundles.
- Inspect requested host/extension permissions and CSP warnings. Do not disable managed-browser policy to run the tests.

## Each platform (Instagram, YouTube, Facebook, TikTok)

Use at least an empty profile, a small profile, one with >100 items, and a creator with posts that appear in recommendations elsewhere. On YouTube test both channel-ID and handle paths, Videos/Shorts/streams and old/new Shorts renderers. On Facebook test public page slug and numeric identity, video/Reel/Story variants. Instagram must include Reels, images, carousels, pinned/collaborative items and the existing inline player controls.

- Confirm correct creator/platform/type, actual content URLs, captions, metrics and unknown values. Compare a sample manually against the source page; recommendations from another account must not enter the session.
- Request 50/100/200/500/custom. Confirm target respected when available, exhausted feed/stalled pages stop, duplicates collapse and sign-in/rate-limit/challenge pages stop without bypass.
- While collecting, click/scroll/type against the underlying page: interaction must stay blocked while programmatic scrolling continues. Try duplicate start, Stop, Escape, URL navigation, tab close and extension reload. Confirm no orphan overlay and partial data retained.
- Return to original page without a refresh, use native controls, resume research and reopen a saved session without rescanning. Change profile through SPA navigation and ensure results do not mix.
- Verify all sorting/filter keys, missing-last ordering, creator scope and pagination in both workspaces. Use Unicode searches, empty filters, no selections and multiselections.

## Analytics and research

- Inspect outlier baseline IDs manually for a creator with >=6 measured comparable videos. Verify median, 30-post window, pinned-baseline exclusion, five-comparison minimum, null views, all-zero baseline and format separation. Compare labels to exported values.
- Verify engagement denominator/actions, share/save rates, sub-day views/day, unknown/future dates and counter corrections. Change opportunity topic/weights and independently calculate a small sample; unavailable inputs must be disclosed.
- Make repeated authorized scans at different times. Confirm timestamped observations, view deltas/growth, no single-scan historical claims, real chart data and independent history deletion.
- Inspect hook labels against title/caption/spoken evidence. Long first transcript segments must disclose that their timing crosses five seconds. Correct a hook, save multiple hooks, edit tags/notes, search and verify persistence after restart.
- Inspect Content DNA timestamps/speaking pace against real speech. Candidate structural roles must be labeled as heuristic and unsupported semantic/visual values omitted.
- Run local storyboard on short, silent, rotated, long, malformed, unsupported-codec and oversized authorized files. Verify frame times, cancellation, timeout, memory limits and export. Test camera motion, subtitle changes and fades; they must not be claimed as confirmed cuts.
- Inspect topic maps and source posts; rename/combine topics. Sample visible permitted comments on original posts, inspect source text/links, absence of unnecessary author information and honest unknown reply status. Test no comments, hidden comments and incomplete replies.
- Compare multiple creators and platforms without equating different view definitions. Request gaps with/without a topic; every suggestion must retain evidence IDs and creative directions must be separate from measurements.
- Generate/edit/save/reopen/copy/Markdown/TXT a brief. Confirm references are original links and the template is an editable suggestion, never a claimed complete source-video analysis.

## Captions and speech

- On open YouTube videos with permitted manual, auto, original non-English, translated, no accessible track and denied/expired caption endpoints, verify matching video identity, track labeling, timestamps/search/jump/copy/TXT/SRT. A fetch error must say availability is unknown, not that captions do not exist. No authorization/CAPTCHA bypass.
- For an accessible authorized non-YouTube video with explicit English audio metadata, run first-use model loading through the offscreen worker and inspect a known transcript. Confirm no audio upload.
- Known Hindi/Hinglish/Spanish/Arabic/Tamil metadata must block English-only processing, even if confirmation is forged through an extension-page message. Caption-track language and Latin characters must not automatically enable processing.
- Unknown speech must show the exact required warning and require intentional confirmation. Cancel the warning; no model/job should start. Confirm and test worker cancel during model load, decoding and inference, no audio, model/download errors, timeout, repeated-word output and cleanup.
- Full inference is currently unverified; the cloud egress check for the model returned CONNECT 403 before the allowlist draft was applied. Recheck networking after settings are saved. Keep TLS/model verification enabled.

## Downloads and data

- Download authorized accessible video/image/carousel assets and a ZIP; inspect ordering, filenames/content type, real progress and actual Chrome completion. Cancel while resolving, downloading and packaging. Retry failures and expired links.
- Stop/restart the service worker during a download and reconcile with Chrome's download manager; no premature complete status. For unavailable/DRM/streaming/YouTube media, preserve the original link and do not attempt a bypass.
- Test CSV/XLSX/JSON with Unicode and captions beginning `=`, `+`, `-`, `@`, leading whitespace, quotes, tabs and newlines. Open XLSX in Excel/LibreOffice, inspect all seven sheets and blank unknown numeric cells. Test large datasets within documented bounds.
- Export before quota testing. Fill ordinary Chrome local storage; expect a visible quota error and intact existing data. Delete during active jobs and verify late writes cannot restore deleted references. Inspect the full-library import merge policy.

## Accessibility and performance

- Keyboard-only popup/workspace/dialog usage, Escape, visible focus, screen reader labels and focus restoration; small viewport and reduced-motion preference/settings.
- Observe CPU/memory for 2,000 posts, repeated scans, long media and failed worker jobs. Verify bounded concurrency and no persistent decoding/worker leaks.
- External website transfer is optional and explicit. Verify consent/contents and website behavior separately; do not consider a website outage a successful transfer.
