# Verification

## Release 2 — 26 September 2026 (tablet fit, spoken hints, icons, offline)

- `npm test`: 11 of 11 pass — the 8 model tests, plus 3 offline checks (the `precache.json` file list matches the files on disk, every entry is a relative path that exists, and the web manifest parses with its icons present).
- `tests/browser_controls.py` passes. The thumb pad is now off by default, so the phone check first turns it on in Settings, then walks with it.
- `tests/browser_playthrough.py` passes: the tutorial and all five clinic days, through the real controls.
- All 76 bundled MP3 files decode, including the 8 new voice clips.
- Layout, checked with screenshots at iPad landscape (1024×768), iPad portrait (768×1024), desktop (1440×900) and phone (390×844): the page does not scroll, and the whole clinic, top bar and bag are visible. The thumb pad no longer covers the map. No console errors.
- Spoken hints, checked by logging each voice clip at the start of Day 1: each clip waits for the one before it to end, and the supply hint plays once, not twice.
- Knee and arm close-ups, checked on Day 3 (scrape) and Day 5 (arm): each checkup completes, and no page errors.
- Offline, checked locally and on the live Cloudflare site: after one visit, all files are cached, and with the network off the game reloads, starts a clinic day, and loads a voice clip.
- Live deploy: `main` at `b3f0977` deployed to https://doctor-ayden-game.jlim87ind.workers.dev. The play screen loads with no JavaScript errors.

## Release 1 — 26 September 2026

- Eight model tests pass: every room/bed route, six complete care sequences, bag capacity and required supplies, hidden treatment requests before checkups, queue capacity, patient happiness, malformed-save recovery, and arm-treatment ordering.
- Browser playthroughs completed the tutorial and all five clinic days through the actual controls. The final day was rerun after fixing patient/room hit-target overlap. Both wheelchair patients completed procedure, bandaging, and transport back to recovery; the day finished with four patients helped, 7,150 points, and three stars.
- No browser JavaScript errors or failed resource requests in the completed final-day run. Completion persisted after reload.
- Keyboard movement, hold/release/cancel, paused clinic clock, full bags, item returns, wrong-medicine rejection, music ducking during voice, mute, and saved volume settings pass.
- Phone touch joystick, scrolling camera, patient clipboard, and no horizontal page overflow pass. Desktop, tablet, and phone layouts were inspected with browser screenshots.
- All 68 bundled MP3 files decode and have non-zero durations. Browser playback confirmed the voice clip was ready and playing; music volume dropped during speech, and mute silenced all active media.
- Music and voice play after the first user interaction, as required by browser autoplay policies.
- The Cloudflare Worker deployment served the public page, JavaScript modules, CSS, music, voice, and font with successful responses and correct content types. A browser completed the live Skip tutorial to Day 1 flow and opened a patient checkup with no JavaScript errors or failed requests.

Screenshots are stored alongside this file in `screenshots/`. Run commands and source descriptions are in `README.md`.
