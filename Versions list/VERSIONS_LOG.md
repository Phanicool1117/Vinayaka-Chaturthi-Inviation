# 📜 Versions List & Change History

This directory stores historical snapshot versions of the codebase for archival, rollback, and version tracking.

---

## 🗂️ Version Index

| Version | Date & Time | Description | Files Included |
| :--- | :--- | :--- | :--- |
| **v1.9.0_ar_reality_skill_upgrade** | 2026-08-30 02:30 | Integrated Skills/ar-reality/ standards: Google <model-viewer> WebXR integration, interactive 3D hotspots (Pooja Schedule modal, Donation Seva modal with QR & copy actions, Temple Bell chime with flower burst), and responsive gesture handling. | r.html, index.html, css/ar.css, css/experience.css, js/ar.js, js/experience.js, js/audio.js, ssets/ar-invitation-qr.png |
| **v1.8.0_ar_controls_touch_and_audio_fix** | 2026-08-30 02:05 | Fixed AR 3D gesture controls (pinch zoom, 360° swipe rotate, 2-finger pan) using a dedicated capture plane, added working AR Auto Play Pause/Resume button, and connected full postMessage audio and autoplay synchronization. | r.html, index.html, css/ar.css, css/experience.css, js/ar.js, js/experience.js, js/audio.js, ssets/ar-invitation-qr.png |
| **v1.7.0_unified_ar_surface_scanner** | 2026-08-30 02:01 | Unified 3D AR view without separate tabs, realistic room depth distance (scale: 0.78, 	ranslateZ: -140px), welcoming Camera Permission Gate (View AR Experience / Continue to Website), and golden camera scanner reveal animation. | r.html, index.html, css/ar.css, css/experience.css, js/ar.js, js/experience.js, ssets/ar-invitation-qr.png |
| **v1.6.0_spatial_3d_webar_mandapam** | 2026-08-30 01:41 | Complete 3D spatial temple mandapam AR overhaul with 3D Gopuram, carved pillars, pedestal with diyas, ringing temple bell, 3D marigold shower, and gesture controls. | r.html, index.html, css/ar.css, css/experience.css, js/ar.js, js/experience.js, ssets/ar-invitation-qr.png |
| **v1.5.0_webar_immersive_experience** | 2026-08-30 01:32 | Added initial WebAR experience, AR QR code generator, and fullscreen web fallback. | r.html, index.html, css/ar.css, css/experience.css, js/ar.js, js/experience.js, ssets/ar-invitation-qr.png |
| **v1.4.0_updated_qr_and_upi_id** | 2026-08-29 23:11 | Replaced Qr Code.jpeg & rame-14-donation-qr.jpeg images and updated UPI ID to Q178007075@ybl across popup & copy handlers. | index.html, css/experience.css, js/experience.js, js/audio.js, js/countdown.js, Qr Code.jpeg, rame-14-donation-qr.jpeg |
| **v1.3.0_autoplay_donation_popup** | 2026-08-27 02:27 | Auto Play now automatically reveals the donation popup at the end of the tour. | index.html, css/experience.css, js/experience.js, js/audio.js, js/countdown.js, Qr Code.jpeg |
| **v1.2.0_donation_popup_qr_update** | 2026-08-26 18:45 | Popup only on tap without auto-copy, dedicated in-modal Copy UPI & Copy No., and added ssets/Qr Code.jpeg into modal. | index.html, css/experience.css, js/experience.js, js/audio.js, js/countdown.js, Qr Code.jpeg |
| **v1.1.0_donation_popup_frame** | 2026-08-26 18:29 | Added smooth rame-14-donation-qr popup with QR view, direct copy buttons, diya glow, and seamless transitions. | index.html, css/experience.css, js/experience.js, js/audio.js, js/countdown.js |
| **v1.0.0_base_experience** | 2026-08-26 18:28 | Base release with dynamic forward-only Auto Play, background audio auto-pause/resume, 9:16 layout, and strict door locking. | index.html, css/experience.css, js/experience.js, js/audio.js, js/countdown.js |

---

## 📌 Version Highlights

### 1.9.0_ar_reality_skill_upgrade (Latest)
- **AR Reality Skill Hotspots:** Integrated interactive 3D hotspots for **Pooja Schedule** and **Donation Seva** with in-AR modal dialogs, QR display, and copy actions.
- **Google <model-viewer> Integration:** Loaded model-viewer v3.5.0 supporting WebXR standards.
- **Enhanced Bell & Diya Interactions:** Sound chimes, flower petal explosion, and realistic flame flicker.
