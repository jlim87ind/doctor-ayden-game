# Doctor Ayden to the Rescue!

A cheerful browser game built from `doctor_ayden_game_scope.md`.

Play the deployed game at **https://doctor-ayden-game.jlim87ind.workers.dev**.

## Play

On this Mac, double-click **Play Doctor Ayden.command**. It starts a local web server and opens the game.

Or run:

```sh
python3 tools/serve.py --open
```

Open **http://localhost:8765**. Keep the server's Terminal window open while playing. Press Control-C in that window to stop it. Open the game through the server, rather than opening `index.html` directly.

The game needs no internet after download, account, microphone, paid service, or package installation. Python 3 is needed to run the local server. It binds only to this computer. To play on a separate tablet, serve this folder through a web host; it is a static site with no backend.

## Play offline / add to iPad home screen

After one visit online, the game keeps working with no internet — every file, including all audio, is cached by a service worker. On an iPad, open the game in Safari, tap the Share button, then **Add to Home Screen**. It opens full-screen like an app and still works offline.

Run `npm run precache` after adding or removing any game file (a new sound, an icon) so `precache.json` — the list of files the service worker caches — stays in sync. `npm test` checks that it is.

## Cloudflare deployment

The public game runs on Cloudflare Workers Static Assets. After changing the source, run `npm run deploy` from this folder. This stages only the browser files in `dist/` and deploys them using `wrangler.jsonc`. Wrangler must be signed in to the Cloudflare account that owns the Worker.

Scores and stickers are saved in each browser's local storage. Progress on `localhost` does not transfer to the Cloudflare address or between devices.

## Included

- Optional tutorial and five clinic days. Day 1 is available from the start. Use **Skip tutorial** on the clinic map or at any point during the tutorial, including checkups and treatment screens. The tutorial stays available to replay; skipping does not award its sticker or stars.
- Six distinct patients and six conditions: fever, allergy, cough, scrape, bruise, and a sore arm.
- Waiting/reception, four patient beds, supplies, procedure room, and recovery corner.
- Keyboard walking, tap-to-walk pathfinding, an optional touch thumb pad (Settings → Thumb pad), and interaction controls.
- Fits a whole tablet screen while playing: the clinic, the top bar and the bag are all visible on an iPad without scrolling.
- Spoken hints for children who cannot read yet: each new task is read aloud once, and every hint, patient line and mini-game has a speaker button to hear it again.
- Drawn icons (`icons.js`) instead of emoji, so pictures look the same on every device. Preview them at `tools/icon-gallery.html`.
- Symptoms first, checkups, treatment cards, a patient clipboard, and a 1–3-item bag.
- Ten small games: temperature, listening, visual checkup, cleaning, bandaging, ice pack, matching medicine, comfort/rest, pretend scan alignment, and a comfort patch.
- Fetch an empty wheelchair, seat a patient, push them to the procedure room, then return them to recovery.
- Patient queue, happiness, reassurance, handwashing, caring/skill/efficiency scores, reports, confetti, and six collectible stickers.
- Saved unlocks, best scores, ratings, stickers, and sound/accessibility settings.
- 50 Microsoft Aria voice clips, including “Good job,” “High five,” and “All better.”
- Four acoustic music cues and 22 short recorded foley effects. No generated oscillator music or electronic beat loop.
- Separate music, voice, and effects volume controls; mute; reduced motion; walking speed; smaller bags; and optional gentle challenge timers. Timers are off by default.

Procedures always use a friendly pretend patch. The game does not give real medicine names, doses, or injection instructions. Future expansions in the spec—online co-op, hospital economics, custom outfits, and additional departments—are outside this first release.

## Controls

| Action | Controls |
|---|---|
| Walk | WASD / arrow keys, tap the floor, or the thumb pad (turn on in Settings) |
| Visit a patient or room | Tap it; Ayden walks there |
| Interact | E / Space / Help button |
| Clipboard | C / Tab / Patients button |
| Pause | Escape / P / Pause button |
| Hold treatment tool | Hold pointer, or hold Space/Enter on the focused target |
| Wrap / clean | Drag across targets, or tap them |
| Scan alignment | Drag slider, or use arrow keys on it |

Tap a bag item to return it. Ask Nurse Lily for a hint and a walking route. Closing a mini-game keeps the patient's prior progress. A partly completed clinic day restarts if the page is refreshed; completed days remain saved in this browser.

## Source and checks

- `data.js`: patients, conditions, levels, items, and defaults.
- `core.js`: patient progression, inventory, scoring, queue, and navigation.
- `draw.js`: original scalable character and hospital illustrations.
- `icons.js`: the drawn icon set, used by both the page (SVG) and the canvas.
- `app.js`: screens, input, interactions, settings, and save flow.
- `minigames.js`: pointer, touch, and keyboard treatment interactions.
- `audio.js`: bundled recorded audio playback, voice ducking, mute, and pause.
- `tools/build_audio.py`: rebuild Microsoft narration (requires `edge-tts` and internet).
- `tools/build_assets.py`: rebuild licensed music, foley, and font assets (requires FFmpeg and internet).

Code style is set by Prettier (`.prettierrc.json`). Run `npm run format` before a commit.

```sh
npm test
python3 tests/browser_playthrough.py
python3 tests/browser_controls.py
```

Browser checks require Python Playwright and its Chromium browser. Keep the local server running. The six-day playthrough uses the actual interface, collects supplies, completes each treatment, transports patients, and checks saved stickers. Screenshots go in `tests/screenshots/`.

See [CREDITS.md](CREDITS.md) for audio and font licenses. Credits are also available from inside the game.
