# AR Reality — Troubleshooting

## No AR button appears
- Check the device: AR button only shows on ARCore-supported Android or AR-capable iOS, and only when served over **HTTPS** (AR will not activate on plain HTTP or `file://`).
- Confirm `ar` attribute is present on `<model-viewer>` and `ar-modes` includes the right mode for the platform.
- On Android, Google Play Services for AR must be installed (usually automatic on supported devices).

## iOS won't launch Quick Look
- Requires a valid `ios-src` pointing to a `.usdz` file — `.glb` alone will not trigger Quick Look.
- Must be opened in Safari (or an app using `SFSafariViewController`) — some in-app browsers block it.

## Model appears at the wrong scale or floats above the surface
- Check the model's real-world units at export time (glTF/USDZ expect meters). A model authored in centimeters will appear 100x too large.
- Make sure the model's origin/pivot is at its base, not its center, so it sits on the detected surface instead of floating.

## Model loads slowly or looks blocky on mobile
- Compress textures (KTX2/Basis Universal) and geometry (Draco compression) — aim under ~100k triangles and a few MB total.
- Large, uncompressed textures are the most common cause of a multi-second load on mobile data.

## Hotspots are misplaced
- `data-position` and `data-normal` are in the model's local coordinate space, not screen space — small adjustments require re-checking against the model's actual dimensions, ideally in a 3D editor (Blender) to read off real coordinates.

## Works on desktop preview but AR mode fails on phone
- Desktop `camera-controls` preview only proves the 3D file loads — it doesn't test AR mode at all. Always test the actual AR button on a real phone before shipping.
