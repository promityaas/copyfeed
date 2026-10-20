# Feature inventory and platform capabilities

This is a release candidate. “Implemented” below describes source behavior and fixture coverage, not verified compatibility with a live authenticated platform.

| Platform | Implemented profile path and evidence | Access limitations / unverified behavior |
|---|---|---|
| Instagram | Creator posts/Reels; existing connection IDs, DOM fallback, detail enrichment, media/images/carousels and inline controls preserved | Current login/account layouts, collaborative/pinned variants, rate limits and live downloads require acceptance testing. Tagged/home/saved/explore/inbox collection excluded. |
| YouTube | Handle/channel Videos/Shorts/streams rich grids, continuation entries, Shorts lockups, visible grid fallback, matching player-exposed native captions | No video downloads or local transcription of YouTube streams. Caption retrieval requires original video open. Live channel structures and captions unverified; no authorized track produces an honest fallback. |
| TikTok | Creator profile records with matching author, stats/statsV2 and user-post DOM fallback | Accessible video URLs only; current anti-bot/login/region-specific structures and CDN downloads unverified. No bypass. |
| Facebook | Public-page observed Video/Story objects with matching owner; legacy/nested media fields and accessible post identity | Conservative ownership can exclude valid posts when page slug cannot be matched to numeric owner ID. Generic DOM cards without owner evidence are excluded. Photo/carousel and other GraphQL variants are not comprehensively supported. Live page/Reel/video structures unverified. |

| Specification area | Implementation / exact fallback |
|---|---|
| 1. Platform adapters | Shared identity/scope/model, observed owner matching, deduplication, bounded infinite scroll, SPA stop/reset. Unknown unsupported pages have explanations. |
| 2. Universal sorting | All requested sort keys; 50/100/200/500 presets and custom 1–2,000; type/date/topic/platform/duration/view/outlier filters; full-screen modal with elapsed time and cancellation. ETA is omitted because loading rates are unreliable. |
| 3. Outliers | View-based median of 30 other comparable recent posts, five-sample minimum, pinned-baseline exclusion, badges and methodology. Shorts/Reels separated from long videos. Missing views/sample/zero baseline yield unavailable. |
| 4. Performance intelligence | Labeled engagement inputs, share/save rates, views/day, observed growth, consistency, neutral anomalies, conservative evergreen and explainable weighted opportunity score. No paid-promotion inference. |
| 5. YouTube captions | Permitted exposed native tracks; original preference when known; source/auto/translation labels; timing/search/copy/TXT/SRT/timestamp links. Failed retrieval does not claim caption absence. |
| 6. Local transcription | English-only metadata gate, exact uncertainty confirmation, conservative Hinglish/script signals, coordinator/offscreen enforcement, cancellation/timeouts/errors/worker cleanup. Full model inference and installed offscreen execution unverified. |
| 7. Hook intelligence | Fifteen local rule categories, multiple labels, title/caption/transcript/manual visual evidence, segment boundaries, heuristic confidence and corrections. Not a validated semantic classifier. |
| 8. Content DNA | Actual timed speech intervals, candidate structural roles, duration and speaking rates when timing supports them. Semantic emotional intent, visual pacing, automatic on-screen text and editing-format recognition unavailable without validated visual evidence. |
| 9. Storyboard | Real local video decoding, five timestamped JPEGs, frame exports, bounded opening difference sampling, saved frames in JSON backups. Average shot length withheld; unvalidated motion differences do not establish cuts. |
| 10. Content map | Local interpretable keyword clustering, source post membership, counts/medians/consistency/strongest references/hook summary; inspect, rename, combine and export. Ambiguous topics require correction. |
| 11. Audience miner | Up to 200 visible source-comment texts, linked sources and automatic question/objection/confusion/fear/demo/explanation/follow-up/value groupings. Does not infer complete audience representation or unanswered status; unavailable comment likes stay null. |
| 12. Gaps | User-topic token evidence, observed pillar coverage and performance, reference IDs and explicitly suggested angles. Does not prove a topic is absent from a creator's entire account. |
| 13. Comparison | Creator/platform groups, sample counts, medians, posting frequency, outlier counts, hook distribution, pillars, consistency and observed growth. Cross-platform view definitions remain different. |
| 14. Opportunities | Topic-based dashboard, reference evidence, scores/weights/missing inputs, format/platform filters and audience/industry creative context. Audience demographics are not inferred. No predictive efficacy claim. |
| 15. Briefs | Editable local reference-and-analysis template, explicitly suggested original direction, copy/Markdown/TXT, persistent briefs. No paid AI backend, DOCX generation or cloned scripts. Storyboard frames are separately exportable; not embedded in Markdown briefs. |
| 16. Hook library | Bulk save source hooks, URL/categories/outlier/tags/notes, search/edit/copy; separately labeled template direction alternatives. Not freeform AI rewriting. |
| 17. Trend radar | Timestamped metric snapshots, observed view deltas/velocity, conservative evergreen signal, charts/tables and delete history. No synthetic history, scheduled scraping, or validated semantic “strategy change” detector. Newly collected posts are available through timestamped saved sessions. |
| 18. Downloads | Available authorized image/video/carousel queues, Chrome-confirmed completion, retries/cancel/duplicates, byte progress where available, ZIP limits and original links. DRM/streaming-only/restricted/YouTube download fallback is the original post. Real downloads unverified. |
| 19. Library | Posts/profiles through creator filter, saved sessions with reopening, hooks/briefs/notes/tags/transcripts/storyboards/comments/history, schema migration and complete-library backup/merge. Storage quota errors are visible. |
| 20. Exports | Unicode/formula-safe CSV/clipboard, JSON, seven-sheet XLSX. Separate readable transcript and brief exports. Complete JSON preserves retained local datasets. XLSX independently parsed with openpyxl; manual Excel/LibreOffice opening pending. |
| 21. Brand | Original vector bolt and four PNG sizes, near-black/red/charcoal UI, animated collection bolt, subtle reveal and reduced-motion options. No reference lightning image or screen recording accompanied the uploaded ZIP. |
| 22. UX | Popup, in-page workspace, standalone library, video research detail, storage/display settings, focus states and modal dialogs. Full assistive-technology audit pending. |
| 23. Engineering | Reproducible bundle build, MV3, bounded jobs, URL/sender checks, additive persistence, local defaults, cloud uploads disabled and unused prototype permission removed. |
| 24–26. Testing/release | Unit/runtime/release tests, Chromium fixtures, media decoding, independent XLSX parsing, manual acceptance document, source/extension ZIPs. Installed/live checks remain blocked or unrun; production definition of done is NOT yet met. |

## Known release gates

1. Administrator policy blocks unpacked-extension installation here. Test in a Chrome profile that permits it; do not bypass managed policy.
2. Validate all four live platforms with authorized accounts, including navigation, lazy-loading exhaustion and recommendation exclusion. Fixture structures are synthetic representative variants, not a current captured-page corpus.
3. Full English Whisper inference/model-loading, no-audio behavior in the installed offscreen context and accuracy require live validation. Cloud Hugging Face access initially returned proxy CONNECT 403; requested allowlist changes are saved only as a draft.
4. Real captions, signed CDN downloads, canceled Chrome downloads, actual browser restart/storage upgrades and Web Store packaging acceptance remain manual gates.
5. Semantic visual analysis, calibrated cut/shot measurements, comprehensive Facebook formats, automatic reply-completeness detection and automatic content-strategy shift interpretation are limited as described above.
