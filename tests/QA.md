# Verification — 26 September 2026

- Eight model tests pass: every room/bed route, six complete care sequences, bag capacity and required supplies, hidden treatment requests before checkups, queue capacity, patient happiness, malformed-save recovery, and arm-treatment ordering.
- Browser playthroughs completed the tutorial and all five clinic days through the actual controls. The final day was rerun after fixing patient/room hit-target overlap. Both wheelchair patients completed procedure, bandaging, and transport back to recovery; the day finished with four patients helped, 7,150 points, and three stars.
- No browser JavaScript errors or failed resource requests in the completed final-day run. Completion persisted after reload.
- Keyboard movement, hold/release/cancel, paused clinic clock, full bags, item returns, wrong-medicine rejection, music ducking during voice, mute, and saved volume settings pass.
- Phone touch joystick, scrolling camera, patient clipboard, and no horizontal page overflow pass. Desktop, tablet, and phone layouts were inspected with browser screenshots.
- All 68 bundled MP3 files decode and have non-zero durations. Browser playback confirmed the voice clip was ready and playing; music volume dropped during speech, and mute silenced all active media.
- Music and voice play after the first user interaction, as required by browser autoplay policies.
- The Cloudflare Worker deployment served the public page, JavaScript modules, CSS, music, voice, and font with successful responses and correct content types. A browser completed the live Skip tutorial to Day 1 flow and opened a patient checkup with no JavaScript errors or failed requests.

Screenshots are stored alongside this file in `screenshots/`. Run commands and source descriptions are in `README.md`.
