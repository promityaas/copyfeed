# Manual acceptance — prioritized production release gates

## Certification status and evidence

**Production certification is pending.** At commit `ccb2023c67d344f67049406568ef26d92085475b` (October 20, 2026), v0.16.0 is a release candidate. Automated and controlled browser fixtures are reported passing; those results do not certify installed-extension behavior on production platforms. Every gate below is **PENDING** unless explicitly marked **BLOCKED**. This document is a test plan, not a record of passed tests.

- **Installed extension: BLOCKED in the supplied cloud browser** by administrator policy. Run the gates in an unmanaged Chrome 120+ profile where installation is permitted. Do not disable managed-browser policy. `npm run test:extension` adds controlled installed-context evidence where permitted; it does not replace the live-platform checks.
- **Full Whisper inference: BLOCKED / unverified.** Model egress returned CONNECT 403 before the allowlist draft was applied. Recheck networking after settings are saved, then complete first-use model loading and known-audio inference. An allowlist draft or successful network probe alone is not an inference pass. Keep TLS/model verification enabled.

Use only authorized test accounts/content. For each gate execution record gate ID, date/tester, browser/version, platform URL type, extension version, expected/actual behavior, console errors and a sanitized evidence reference. Do not share cookies, private comments or credentials. Record PASS, FAIL, BLOCKED or PENDING per platform/variant; lack of an observable failure is not PASS.

## Release decision and minimum execution set

The priorities below are proposed release policy derived from the checklist, not previously recorded test outcomes.

- **P0 — unconditional blocker:** installation, safety, identity, data integrity or resource failures prevent release.
- **P1 — blocker for a shipped capability/platform:** must pass before shipping that scope. Deferral requires actually disabling/removing the affected capability/platform from the release and its claims, recording the decision, and retesting the reduced build. A warning alone does not satisfy a gate.
- **P2 — conditional integration gate:** optional external transfer may be excluded from scope; if enabled, it must pass.

For the full v0.16.0 scope, the smallest defensible set is **all P0 and P1 rows**, plus P2 if transfer ships. Reuse journeys and datasets rather than dropping checklist variants: one shared install/upgrade/data suite; one collection journey per platform with that platform's required variants; one shared analytics/research suite over those collected datasets; one YouTube caption suite; one non-YouTube speech suite; one shared accessibility/performance suite. Shared implementation checks need not be repeated on all four sites, but platform-dependent collection, native controls, media access and identity need evidence on each supported platform.

Run P0 first. Stop dependent certification when a prerequisite is blocked; independent tests may continue. Release only when every in-scope gate has recorded evidence and PASS, with no unresolved P0/P1 failures or blockers. Retest affected gates after fixes or scope changes. The detailed procedures below remain authoritative; bundling them into gates does not waive individual cases.

## P0 — unconditional blockers

| Gate | Platform/scope | Minimum execution and acceptance | Status | Checklist source |
| --- | --- | --- | --- | --- |
| P0-01 Installed release | Chrome 120+, shared | Load the actual release package; inspect manifest/service worker, files, permissions and CSP. Exercise popup/workspace in an allowed installed context. | BLOCKED in supplied cloud browser | [Installation and upgrades](#installation-and-upgrades) |
| P0-02 Upgrade and recovery | Shared; real 0.15.0 library | Back up; upgrade with same identity; restart; compare notes, flags, transcripts and every retained dataset. Export/import into a separate installation; inspect merge behavior. Stale tabs give a useful version/refresh error. | PENDING | [Installation and upgrades](#installation-and-upgrades), [Downloads and data](#downloads-and-data) |
| P0-03 Creator isolation | Instagram | Verify actual source URLs, creator/type, captions, metrics/unknowns; exclude recommendations. Include Reels/images/carousels, pinned/collaborative items; SPA changes never mix creators. | PENDING | [Each platform](#each-platform-instagram-youtube-facebook-tiktok) |
| P0-04 Creator isolation | YouTube | Same identity/source checks across channel-ID/handle, Videos/Shorts/streams and old/new Shorts renderers; exclude recommendations and SPA mixing. | PENDING | [Each platform](#each-platform-instagram-youtube-facebook-tiktok) |
| P0-05 Creator isolation | Facebook | Same identity/source checks across public page slug/numeric identity and video/Reel/Story variants; exclude recommendations and SPA mixing. | PENDING | [Each platform](#each-platform-instagram-youtube-facebook-tiktok) |
| P0-06 Creator isolation | TikTok | Same identity/source checks on authorized creator pages; exclude recommendations and SPA mixing. | PENDING | [Each platform](#each-platform-instagram-youtube-facebook-tiktok) |
| P0-07 Collection safety and cleanup | Each of Instagram, YouTube, Facebook, TikTok | Block underlying user input while programmatic scroll works; duplicate start, Stop, Escape, navigation, tab close and reload leave no orphan overlay and retain partial data. Sign-in/rate-limit/challenge stops without bypass; native controls recover without refresh. | PENDING per platform | [Each platform](#each-platform-instagram-youtube-facebook-tiktok) |
| P0-08 Export and storage integrity | Shared; Excel/LibreOffice | CSV/XLSX/JSON adversarial text and Unicode; inspect seven XLSX sheets and blank unknown numbers. Back up before quota test; visible quota errors preserve existing data. Deletion during jobs cannot be undone by late writes. | PENDING | [Downloads and data](#downloads-and-data) |
| P0-09 Speech authorization and language guard | Non-YouTube speech | Reject known Hindi/Hinglish/Spanish/Arabic/Tamil even with forged confirmation; caption language/Latin text do not authorize. Unknown speech requires exact warning and intentional confirmation; cancel starts no model/job. Confirm no audio upload. | PENDING | [Captions and speech](#captions-and-speech) |
| P0-10 Resource containment | Shared collection/media/offscreen worker | Observe 2,000 posts, repeated scans, long media and failed jobs; bounded concurrency, cancellation/timeouts and cleanup without persistent decoding/worker leaks. Cover malformed/oversized storyboard input. | PENDING | [Accessibility and performance](#accessibility-and-performance), [Analytics and research](#analytics-and-research), [Captions and speech](#captions-and-speech) |

## P1 — blockers for supported platforms and shipped capabilities

| Gate | Platform/scope | Minimum execution and acceptance | Status | Checklist source |
| --- | --- | --- | --- | --- |
| P1-01 Collection completeness | Each of Instagram, YouTube, Facebook, TikTok | Empty, small, >100-item and recommendation-exposed creators; request 50/100/200/500/custom; respect available targets, exhaustion/stalls and deduplication. Reopen saved session without rescan; resume; verify all sort/filter keys, missing-last order, scope/pagination in both workspaces, Unicode, empty/no/multiselections. | PENDING per platform | [Each platform](#each-platform-instagram-youtube-facebook-tiktok) |
| P1-02 Measurement correctness | Shared analytics; multi-platform datasets | Independently calculate outlier and opportunity samples; verify >=6 comparable videos, median/30-post window, pinned exclusion, five-comparison minimum, null/zero and format separation; labels match export. Check engagement/rates/dates/corrections and disclosed missing inputs. Repeat scans: timestamped deltas, real charts, no invented history; independent history deletion. Preserve differing platform view definitions. | PENDING | [Analytics and research](#analytics-and-research) |
| P1-03 Research evidence and persistence | Shared research | Hook labels/timing and Content DNA agree with evidence, disclose >5-second segments and heuristic roles, omit unsupported values. Edit/save/search/restart hooks/tags/notes; topic rename/combine and permitted comments retain sources, minimal author data and honest reply unknowns. Gaps with/without topic retain evidence IDs; directions separate from measurements. Brief edit/save/reopen/copy/Markdown/TXT uses original links and editable-suggestion labeling. | PENDING | [Analytics and research](#analytics-and-research) |
| P1-04 Storyboard validity | Local authorized files | Short/silent/rotated/long/malformed/unsupported-codec/oversized cases; frame times, cancel, timeout, limits and export. Motion/subtitles/fades are not confirmed cuts. | PENDING | [Analytics and research](#analytics-and-research) |
| P1-05 Caption access and accuracy | YouTube | Manual/auto/original non-English/translated/no accessible track/denied/expired cases; correct video identity and track labels; timestamps/search/jump/copy/TXT/SRT. Fetch failure means availability unknown. No authorization/CAPTCHA bypass. | PENDING | [Captions and speech](#captions-and-speech) |
| P1-06 Actual Whisper inference | Accessible authorized non-YouTube English audio | Recheck saved network settings; first-use model load through offscreen worker and known-transcript inspection. Cancel at load/decode/inference; no audio, model/download error, timeout and repeated-word cases clean up honestly. Keep verification enabled. | BLOCKED / full inference unverified | [Captions and speech](#captions-and-speech) |
| P1-07 Media delivery | Each supported platform/media type | Accessible authorized video/image/carousel and ZIP where supported: order, names/types, progress and actual Chrome completion. Cancel resolution/download/packaging; retry failures/expired URLs. Restart service worker and reconcile manager state; no premature completion. Unavailable/DRM/streaming/YouTube media retain original links without bypass. | PENDING per applicable platform/type | [Downloads and data](#downloads-and-data) |
| P1-08 Usable accessible controls | Shared popup/workspace/dialog; platform overlay controls | Keyboard-only journeys, Escape, focus visibility/restoration and screen reader labels; small viewport and reduced motion. Include Instagram's existing inline player controls in native-control recovery. | PENDING | [Accessibility and performance](#accessibility-and-performance), [Each platform](#each-platform-instagram-youtube-facebook-tiktok) |

## P2 — optional integration

| Gate | Platform/scope | Minimum execution and acceptance | Status | Checklist source |
| --- | --- | --- | --- | --- |
| P2-01 Explicit website transfer | External website, only if enabled | Verify explicit consent, transferred contents and website behavior separately. Website outage is a failed/blocked transfer, never a successful transfer. | PENDING; conditional on release scope | [Accessibility and performance](#accessibility-and-performance) |

## Detailed checklist procedures

The original checklist follows unchanged for traceability and execution coverage.

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
