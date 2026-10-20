# Copyfeed 0.16.0

A Manifest V3 Chrome extension for local creator research, ranking, outlier analysis, hooks, transcripts and research exports.

[Download the installable extension ZIP](https://github.com/promityaas/copyfeed/raw/refs/heads/main/downloads/copyfeed-v0.16.0.zip?download=1) · [Download the repository source ZIP](https://github.com/promityaas/copyfeed/archive/refs/heads/main.zip)

The prebuilt extension is also stored in `downloads/`. Extract its ZIP before selecting **Load unpacked** in Chrome.

**Release candidate, not production-certified.** Automated and controlled browser fixtures pass. Installed-extension execution is blocked by administrator policy in the supplied cloud browser. Live authenticated Instagram, YouTube, Facebook and TikTok behavior, real CDN downloads and complete Whisper inference require the manual acceptance checks in [docs/MANUAL_TESTS.md](docs/MANUAL_TESTS.md). There is no claim of verified live-platform compatibility.

## Install in Chrome

1. Extract `dist/copyfeed-v0.16.0.zip` into a permanent folder.
2. In a Chrome 120+ profile where unpacked extensions are allowed, open `chrome://extensions`, enable Developer mode, select **Load unpacked** and choose that folder containing `manifest.json`.
3. Open a supported creator profile; refresh existing social tabs after an extension update.
4. Open Copyfeed, choose a post count (1–2,000) and sorting method, then **Sort profile**. Keep the source tab visible while it loads posts.
5. The modal collection screen blocks real page input. **Stop Collection** keeps the partial results. **Back to source page** restores the original page without a refresh.
6. Use **Recent captures** in the popup to open the research library. Select cards before using research tools, exports or downloads. No selection means all filtered posts.

Do not uninstall an existing Copyfeed installation to update it: uninstalling deletes local storage. Back up with **Storage & settings → Export complete library** first. For a Web Store installation, the publisher must update the existing listing to preserve extension identity and data. Loading an unpacked build with a different identity creates a separate local library.

## Research workflow

- Supported profile types and restrictions are listed in [docs/FEATURES.md](docs/FEATURES.md). Home feeds, private messages, search, tagged feeds and individual videos cannot start a profile scan.
- Cards and both workspaces share sorting/filtering: views, likes, comments, shares, saves, engagement/views, outlier, views/day, opportunity score and dates. Unknown metrics remain unavailable.
- **Research tools** includes content maps, sampled audience questions, topic-based gaps/opportunities, comparisons, observed history, editable local briefs, saved hooks and saved sessions. Configure a topic and score weights in Opportunities. Rename topics to combine clusters.
- Open a card, then **Video research · DNA, hooks & storyboard** for input explanations, source-labeled hooks, manual corrections, transcript-based timing, storyboard, comments and tags.
- **Transcript** uses the existing English-only on-device engine for accessible authorized non-YouTube media. Original audio language evidence is checked. Unknown language requires explicit confirmation of the exact English-only warning. Known non-English metadata blocks it. Latin-script/Hinglish captions and caption-track languages never prove English audio.
- For YouTube, open the original video in another tab and use **Retrieve native YouTube captions**. Only tracks exposed by the matching current player are attempted. Manual/automatic and untranslated/translated tracks are labeled; original language is preferred when audio metadata is available. A failed fetch is not proof of absent captions. Search, copy, TXT/SRT export and timestamp links are available in Video research after retrieval.
- Storyboard analysis accepts an authorized local video up to 100 MB / 10 minutes. It generates five small frames and flags large opening frame differences. Those are candidate visual changes, not confirmed cuts. OCR, semantic visual analysis and calibrated average shot length are unavailable; manually record observed on-screen hook text.
- Downloads use exposed authorized media links only. The manager supports retry, cancellation, completion status and available byte progress. ZIP has a 200-post / 300 MB bound. YouTube downloads, DRM, streaming-only sources and access bypass are unsupported.
- CSV, JSON, seven-sheet XLSX and tab-separated clipboard exports are available. Complete-library JSON additionally includes sessions, saved hooks, briefs, comments, storyboards and history. Text spreadsheet cells cannot execute formulas. Missing numeric data remains blank.

No API key or backend is required. All core research is local. Cloud audio uploading is disabled. **Save to website** is an explicit optional transfer to the existing `copyfeed.in` integration; website service availability was not verified and is not required for the local library. Whisper downloads model files from Hugging Face on first use without uploading audio. Network requests to original platforms are subject to their normal session/access limits.

## Development

Use the existing checkout in this isolated environment; do not create a worktree unless explicitly requested.

Requirements: Node 20+ (prepared cloud uses 24.19.0), npm, Python 3. Browser tests also need Chromium and ffmpeg. Set `CHROMIUM_PATH` if Chromium is not `/usr/bin/chromium`.

```sh
npm ci --ignore-scripts --cache /workspace/.npm-cache
npm run build
npm test
npm run test:browser
npm run package
```

`npm run build` concatenates explicitly ordered modules into isolated production bundles and regenerates `styles.js` from `surface.css`. Never edit bundles by hand. `npm run package` outputs the unpacked `dist/copyfeed-v0.16.0/` and a deterministic ZIP with its manifest at the root. No remote JavaScript or paid runtime dependency is introduced. Existing third-party runtime licenses are retained.

`npm run test:browser` runs real DOM/video decoding with simulated Chrome APIs and the actual background implementation. `npm run test:extension` is separate and requires permission to load unpacked extensions; it is blocked in this cloud environment. The latter is not replaced by the fixture suite.

`npm run icons` reproducibly renders the original SVG identity into 16/32/48/128 PNGs. Build/test output and artifacts are ignored by Git; source and lockfile are included in the separate source delivery archive.

See [architecture](docs/ARCHITECTURE.md), [feature inventory and capability matrix](docs/FEATURES.md), [test results](docs/TEST_RESULTS.md), [manual acceptance](docs/MANUAL_TESTS.md) and [changelog](CHANGELOG.md).
