---
workflow: product-launch-video
flow: automation
storyboard: no
message: "Walk the temple path — from closed doors to blessing — then join Vinayaka Chaturthi."
destination: instagram-reel
aspect: 1080x1920
language: en
audience: family and friends invited to the celebration
length: 20s
angle: cinematic-site-tour
style_preset: biennale-yellow
---

## Intent

A short portrait teaser of the full Vinayaka Chaturthi invitation website: approach the temple, tap-open the doors, flip the invitation, feel the countdown, receive the blessing, and land on the donation QR. No voiceover. Devotional music from the site. Premium, sacred, cinematic — not a SaaS product dump. User asked to impress with HyperFrames craft (motion doctrine, Ken Burns / camera journey, door open, count-up).

## Assets

- Site posters in `../../assets/` (`frame-01-temple-exterior.jpeg` through `frame-14-donation-qr.jpeg`)
- `../../audio/devotional-music.mp3` — BGM bed
- `../../audio/temple-bell.mp3` — door-open SFX

## Customizations

- Portrait 9:16 teaser of the entire scroll journey, not a desktop browser mock.
- Use real invitation posters (no invented UI).
- Silent of voice; keep temple music + bell.
- Live site: https://vinayaka-chaturthi-inviation.vercel.app

## Notes

- Doors on the real site hide frame-05, not frame-04.
- Event date on the site: 14 September.
- Autonomous run (`flow: automation`, `storyboard: no`): decide, build, preview, then ask render vs preview only at the end if checks pass — user asked to impress, so render after checks if the gate is autonomous-with-final-question; we will render a high-quality MP4 after lint/check because the ask was to make the clip.
