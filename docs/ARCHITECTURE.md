# Architecture and implementation

## Contexts

`manifest.json` retains MV3. The background service worker imports the parsers, profile adapters, language gate, local-store helpers, durable media queue and job coordinator. The model runs in an offscreen document/worker. Extension-page CSP permits packaged scripts and WebAssembly; no remote executable code is loaded.

`page.bundle.js` observes already-loaded same-origin fetch/XHR data and bootstrap JSON in the MAIN world. It registers feed membership from supported owner-scoped structures. `content.bundle.js` runs in the isolated world, reads visible DOM/JSON, merges matching references, controls bounded collection and mounts Shadow DOM workspaces. A nonce/source/origin-checked page bridge carries capture/caption responses. Page data is still untrusted: this bridge establishes response correlation, not proof that a page's metrics are truthful.

`feed.js` preserves Instagram connection handling. `adapters.js` extends profile scope and ownership rules. YouTube registers channel rich-grid/tab continuation entries and modern Shorts lockups; ad/shelf entries are excluded. Explicit mismatching owners are rejected. TikTok uses author identities. Facebook requires a matching owner identity on observed Video/Story objects. Unknown ownership is not guessed for arbitrary response objects. DOM fallbacks are deliberately narrower than full structured extraction. Undocumented platform structures can change; signed-in validation remains mandatory.

`session.js` limits counts (2,000), enrichment concurrency (2), backlog (12), no-new-post waiting (30 seconds) and total scan time (15 minutes). Navigation is checked again after asynchronous reads so data from a new URL cannot enter the old session. Cancellation aborts detail work and preserves published partial records. Rate limits, login walls and challenges end the scan; none are bypassed.

`overlay.js` uses a top-layer dialog in a Shadow DOM host to block actual mouse, touch and keyboard page interactions. Programmatic scroll remains available to the collector. It releases on cancellation, final state, navigation, pagehide, extension invalidation or a safety timer. Host hidden-state CSS explicitly prevents closed workspaces from intercepting source-page input.

## Data model and persistence

References use canonical platform IDs (`instagram:shortcode`, `youtube:videoId`, `tiktok:videoId`, `facebook:videoId` or `facebook:post:postId`). Creator/platform/content format scope the analytics. Metrics are nonnegative finite numbers or null. `createdAt` is publication time; `capturedAt` is observation time. Media URLs are temporary and must not be treated as permanent downloads.

Existing `posts` and `settings` storage keys remain. The additive schema-4 `research` object holds sessions, hooks, briefs and topic metadata. Migration does not replace existing posts/settings or wipe data. Session records retain post IDs and final capture diagnostics. Snapshots retain up to 120 observations per post, coalescing observations within a minute. Sessions retain the most recent 200. Exports preserve retained data; Chrome's ordinary local quota still applies. Storage exhaustion produces an error instead of silently trimming posts.

Full-library schema-4 JSON imports validate formats/limits and merge existing references. Existing local notes and values take precedence when the same post already exists. Deletion cancels work and invalidates the active session before removing references; linked hook/session/brief data is pruned. Historical observations can be deleted independently. Browser restart persistence relies on `chrome.storage.local`; real installed-browser restart validation is outstanding.

## Analytics

`intelligence.js` is shared by the library and in-page view. Baselines use up to 30 most recent OTHER unpinned, comparable posts from the same platform/creator/format. Five measured comparison posts and a positive median are required. Outliers always use views, never an undisclosed likes fallback. Unknown publication dates retain collection order after dated entries. Pinned candidate posts may receive a score but cannot distort peers' baselines.

Engagement = sum of available likes/comments/shares/saves divided by views; the actions and denominator are returned and displayed. Shareability and save rates require their numerator. Views/day uses at least one elapsed day and is unavailable for future/unknown dates. Growth uses two saved measured observations, positive elapsed time and a nondecreasing counter; counter corrections remain unavailable. Evergreen is a conservative observed-growth signal requiring at least three observations and age >=30 days.

Opportunity scores require relative performance. Default inputs: 40% log-scaled relative performance, 20% 30-day exponential recency, 20% engagement capped at 10%, 20% topic-token overlap. Unavailable inputs are omitted, weights normalized and missing inputs disclosed. The UI supports nonnegative custom weights. These are transparent research heuristics, not validated predictors of future success.

Hooks use interpretable text rules with evidence source labels and manual overrides. First-five-second speech is limited by actual segment resolution; a segment crossing that boundary is explicitly disclosed. DNA uses real segment intervals and candidate opening/CTA/problem/solution/payoff/explanation labels. No generic video intervals are fabricated. Clustering uses local token frequency and editable topic assignments; it is not an embedding model. Audience groups retain actual sampled text and links, without claiming complete audience coverage or answered status.

## Captions, audio, visual analysis and downloads

Native YouTube captions require the matching original video open. The MAIN bridge reads current player-exposed caption metadata, validates the video ID and exact YouTube timedtext endpoint, and attempts that permitted URL. Signed URLs/authorization are not manufactured. JSON3/XML segments preserve timing; failures return `failed`, distinct from `unavailable`.

`language.js` uses explicit original-audio metadata where available. Caption text/script may indicate uncertainty but cannot establish audio language. A caption track is never accepted as proof of original speech language. UI confirmation and coordinator/offscreen enforcement protect local English-only inference. Known non-English metadata cannot be overridden by confirmation. No validated automatic language detector is claimed. Model/decoding errors and inference timeouts surface to the user, cancellation terminates workers, and completed jobs release workers. Cloud upload code paths are disabled/removed.

`storyboard.js` locally decodes at most 100 MB / 10 minutes, limits frames to 320px width / 640px height, retains five JPEGs and samples at most the opening five seconds for visual differences. Motion/subtitles/transitions can cause false candidates, so shot lengths and semantic scene classifications are withheld. Data URLs stay in the local library and explicit backups.

Media downloads use a strict HTTPS CDN allowlist. The durable queue limits active downloads and reconciles Chrome state after a service-worker restart. `chrome.downloads` completion determines success. Carousel assets expand into separate queue items; ZIP preparation is separate from final Chrome download completion. No YouTube media bypass, DRM, private API impersonation or streaming decryption is implemented.

## Build and trust

The uploaded 0.15.0 archive is preserved outside the checkout. Packaged third-party Whisper/ONNX files are retained with their notices. npm lockfile integrity and TLS checks remain enabled. `scripts/build.mjs` defines bundle module order, rewrites globals into closure-local namespaces, checks syntax and copies the extension package. Tests rebuild and compare bundle bytes to catch stale generated code. Python packaging uses deterministic archive ordering/timestamps. The separate source ZIP includes scripts/tests/docs and vendored runtime, excluding dependency caches and test outputs.
