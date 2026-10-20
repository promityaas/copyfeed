# Verification report — Copyfeed 0.16.0 release candidate

Prepared on 2026-10-21 (Asia/Kolkata). Source was restored from the supplied 0.15.0 ZIP into the empty checkout. The GitHub remote had no branches/commits at inspection; no commit or push was performed.

## Passed in the cloud machine

- Dependency installation with `npm ci` and the pinned lockfile, preserving integrity/TLS checks. Writable npm cache explicitly uses `/workspace/.npm-cache`.
- Reproducible production build: MAIN and isolated bundles rebuilt from source; all executable manifest entry files present and top-level JavaScript parses.
- `npm test`: **45 tests passed, 0 failed, 0 skipped**. Includes all four synthetic platform adapter variants, correct owner exclusion, identity/deduplication, bounded capture, cancellation, navigation including navigation during a pending scan, view-only outlier math/format separation/low sample, null metrics, filtering/sorting, engagement/scoring, hooks/DNA, keyword clusters/questions, Unicode/formula-safe exports, language gates, native-caption parsing/track validation, additive storage migration/snapshots, media completion/cancel/retry/restart and late-write protection. Release checks compare regenerated bundle bytes with the checked-in/generated files.
- Chromium fixture suite: actual production bundles and actual background implementation run with **simulated Chrome APIs**, real browser input and controlled DOM/network fixtures. All four platforms collect/scope/store results, block real source clicks during capture, stop immediately, retain partial sessions, reveal research and restore the source page. SPA navigation removes the blocker. Library maps/comparison/editable briefs and local persistence flows pass. Additional checks cover language enforcement, backup merge, native-caption bridge responses, exact uncertainty-warning UI, real local video decoding and storyboard cancellation. The machine-readable report is `artifacts/browser-results.json`.
- Local storyboard: a generated four-second VP8 video actually decodes in Chromium into five JPEG frames; pre-aborted work cancels. This does not validate real-platform codec coverage or scene-cut accuracy.
- XLSX: separately parsed with Python/openpyxl, verifying seven sheets, literal formula-looking title text, Hindi Unicode and blank unavailable view counts. This is not a claim that Excel/LibreOffice was launched.
- Original SVG bolt rendered to PNG in all four required sizes with Chromium.

## Blocked, failed or unrun — distinct from passing fixtures

- **Installed-extension test blocked**: `npm run test:extension` fails before extension installation with `Extensions.loadUnpacked: Loading of unpacked extensions is disabled by the administrator.` No browser policy was changed or bypassed. Actual MV3 background/offscreen behavior, installed permissions and browser-restart persistence therefore remain unverified.
- **Model network request denied**: a read-only HEAD request to the public Whisper config returned proxy CONNECT HTTP 403. Hugging Face domains and reproducible instructions were saved in the environment configuration draft; saving does not apply runtime access or publish it. Full Whisper model loading/inference on actual English media was not verified in this run. Unit tests cover the guardrails/coordinator/speech-quality helpers, not model accuracy.
- **Live authenticated platform tests unrun**: no claims of verified current Instagram/YouTube/Facebook/TikTok behavior, native live captions, private content access, CDN downloads or account-wide completeness. Platform fixtures are representative synthetic variants, not fresh captures of every live layout.
- **Manual upgrade and release gates pending**: real Chrome storage upgrade/restart, Web Store install/review, real download completion after service-worker suspension, caption language fidelity and accessibility/performance acceptance. See `MANUAL_TESTS.md`.

## Release assessment

The local development/build/test workflow and packaged candidate are prepared. Production definition of done is **not met** until installed-browser and authorized live-platform gates pass, and the documented capability limitations are accepted or further implemented. In particular, semantic visual analysis/calibrated shot measurements, comprehensive Facebook formats and automatic strategy-change interpretation are not represented as verified capabilities.

Cloud configuration saving, publishing the filesystem snapshot, Chrome installation and Chrome Web Store publication are separate actions. Only draft saving is confirmed in this session. No external release was published.
