# decks/

Self-contained HTML presentations. Each deck is a single file — open it in a browser, no build step, no dependencies.

Netlify publishes this folder automatically. A file at `decks/foo.html` is live at `darynfillis.com/decks/foo.html`.

---

## third-borrower.html

**The third borrower.** — a 30-minute talk for real estate agents on California condo warrantability, built on the Sales Talks That Sell (STTS) framework.

Live at: **darynfillis.com/decks/third-borrower.html**

### Presenting

| Key | Does |
|---|---|
| `→` / `←` / `space` | Advance / go back (also steps through click-reveals within a slide) |
| `F` | Fullscreen |
| `P` | **Floating notes** — stays on top of fullscreen. Best for in-person. |
| `N` | **Presenter view** — opens a second window. Best for dual-screen / Zoom. |
| `M` | Toggle lobby music |
| `L` | Back to the lobby |

Clicking the left 30% of the slide goes back; anywhere else advances.

### URL options

| Param | Effect |
|---|---|
| `?mins=0` | **Skip the lobby entirely.** Silent, straight to the title slide. Use this in person. |
| `?mins=10` | 10-minute countdown from when you press "Open the room" |
| `?start=2026-08-14T18:30` | Count down to a specific Pacific wall-clock time |
| `?track=other.mp3` | Use a different music file for this event |

Default with no params: 5-minute countdown.

### Lobby music

The deck looks for **`decks/lobby.mp3`** first. If that file exists, it plays (looped, fades out when the countdown hits zero).

If there's no MP3, it falls back to a **track generated live in the browser** from oscillators — no files, no licensing, works offline. That fallback is always there, so the deck never breaks.

**To add your own music:** drop an MP3 named `lobby.mp3` in this folder. That's it.

⚠️ **Use a track you're licensed to perform publicly** — Epidemic Sound, Artlist, Uppbeat, etc. Spotify and Apple Music tracks are *not* legal for this (public performance + sync licensing) and their DRM won't play in a browser page regardless.

### Editing

Everything lives in the one file:

- **Slides** — `<section class="slide">` blocks, in order
- **Click-reveals** — add `class="frag"` to any element; it reveals on the next arrow press
- **Presenter notes** — the `NOTES` object near the bottom, keyed by slide number (`"1"`, `"2"`, …). Lines wrapped in `[square brackets]` render as italic stage directions.
- **Colors** — the `:root` CSS variables at the top

The QR code (slides 21 and 23) is a base64 data URI in the `ASSETS` object, pointing to `darynfillis.com/cal-condo`. To change the destination, regenerate it — don't hand-edit the string.
