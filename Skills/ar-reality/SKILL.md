---
name: ar-reality
description: Build "AR Reality" experiences — web-based augmented reality (WebAR) where a user scans a QR code with their phone and instantly views a 3D model in AR, with full 360-degree rotation, walk-around/place-in-room viewing, and interactive elements (tap animations, hotspots, sound). No app install required — works via Apple Quick Look, Google Scene Viewer, and WebXR. Use this skill whenever the user wants to create a QR-triggered AR/WebAR experience, embed an interactive 3D model viewer with AR support on a website, generate AR QR codes, add "view in AR" to a product page, or asks about model-viewer, Scene Viewer, Quick Look, WebXR, GLB/USDZ files, or any "scan to see it in AR" workflow — even if they don't use the exact words "AR" or "augmented reality."
---

# AR Reality — QR-Triggered WebAR Builder

Helps a user go from "I have (or want) a 3D object" to a working, shareable experience: **scan QR → phone opens AR → user rotates/places/interacts with the model in real space**, entirely in the browser, no app download.

## Core technology

The engine behind this is Google's open-source `<model-viewer>` web component (used by Shopify, Google Search's 3D results, etc.). One HTML element handles both platforms:

- **iOS** → Apple **Quick Look** (needs a `.usdz` file)
- **Android** → Google **Scene Viewer** / **WebXR** (needs a `.glb` file)

Both files usually come from the same source model, so plan to produce both.

## Workflow

Walk the user through these steps in order. Skip steps they've already done (e.g. if they already have a GLB/USDZ pair, jump to step 2).

### 1. Get the 3D model
Ask how they want to source it if unclear:
- Photogrammetry scan of a real object (phone scanning apps, or video → 3D via a service)
- An existing/purchased/commissioned GLB or USDZ model
- An AI-generated model from a photo or text prompt

Constraints to flag: keep geometry under ~100k triangles and compress textures (KTX2/Draco) — heavy models blow past mobile's ~5-second load tolerance and make the experience feel broken. Need **both** a `.glb` and a `.usdz` of the same model for full iOS+Android coverage (many tools/converters can export both from one source, or a GLB can be converted to USDZ with Apple's `usdzconvert` / Reality Converter).

### 2. Build the viewer page
Use `assets/viewer-template.html` as the starting point — it's a complete, working `<model-viewer>` page with the AR button, 360° drag rotation, auto-rotate, and camera controls already wired up. Just swap in the user's `src`/`ios-src` paths and copy.

Key attributes to know:
- `ar ar-modes="scene-viewer webxr quick-look"` — enables the AR button with automatic fallback ordering
- `camera-controls` — lets desktop/mobile-browser users drag to view all 360° before ever entering AR
- `auto-rotate` — spins the model slowly when idle, a nice default for a preview state
- `ios-src` — the USDZ path Quick Look needs (Scene Viewer/WebXR use `src`)

### 3. Add interactivity ("feel it / sense it")
This is the differentiator between a static viewer and an actual experience. Options, roughly in order of effort:
- **Tap-to-animate**: if the GLB has animation clips baked in (e.g. a lid opening, a part rotating), trigger them on click via `model-viewer`'s `.play()`/`.pause()` JS API.
- **Hotspots**: anchor floating info labels/buttons to specific points on the model using `<button slot="hotspot-...">` with `data-position`/`data-normal` attributes — good for "tap to learn more about this part."
- **Sound**: fire a short audio cue on tap or on AR-activation for extra presence.
- **Scale/material swaps**: expose simple controls (color variants, size toggle) via `model-viewer`'s scripting API.

Be honest with the user: this is visual + audio interactivity through the phone screen and camera — there's no real haptic/tactile feedback in WebAR. True touch-feedback requires a headset with controllers, which is a different and much heavier build. Don't overpromise "feel it" as physical sensation.

### 4. Host it
Any static host works — the user's own domain, GitHub Pages, Netlify, Vercel. AR Quick Look and Scene Viewer only need a public HTTPS URL to the HTML page (and the GLB/USDZ files it references). No backend required for a single-model experience.

### 5. Generate the QR code
The QR just needs to encode the hosted page's URL. Use `scripts/generate_qr.py` if the user wants one made locally, or point them to any QR generator — the code itself is generic, nothing AR-specific about it.

### 6. Test on real devices
Always test on an actual iPhone (Safari) and an actual Android phone (Chrome + ARCore support) before calling it done — AR entry behavior genuinely differs between platforms, and emulators won't surface real issues like model scale, lighting, or load time.

## Bundled resources

- `assets/viewer-template.html` — drop-in `<model-viewer>` page with AR button, hotspot example, and comments marking what to customize
- `scripts/generate_qr.py` — generates a QR code PNG for a given URL (requires `qrcode` package; installs with `pip install qrcode[pil] --break-system-packages` if missing)
- `references/troubleshooting.md` — common failure modes (model doesn't appear, AR button missing, wrong scale, iOS won't launch Quick Look, etc.) and fixes

## Notes on scope

- If the user wants a no-code/fast route instead of building this themselves, mention SaaS alternatives (AR Code, echo3D, ARViewer, Vivid3D) as a faster but less customizable/branded option — don't push them toward a paid platform by default.
- If the user's need is really "3D scanning a real-world object," that's step 1 above, not a separate skill — keep guiding them through the full pipeline.
