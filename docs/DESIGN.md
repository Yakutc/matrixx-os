# Design notes

## Direction

Matrixx Linux 24.04 LTS is an Ubuntu/GNOME-inspired desktop, not a generic "web OS"
theme. The goal is immediate recognition: GRUB, systemd, GDM, a black top bar,
Activities, a left dock, GNOME header bars, Yaru colors and Ubuntu typography.

The fiction is subtle: the hostname is `matrixx`, Sector 09 exists in `/opt`, and
the 47.2 Hz receiver is still warm. The interface itself stays a believable Linux
desktop — no neon cyberpunk, no purple gradients, no fake terminal overlay.

## Tokens

Defined in `src/styles/tokens.css`:

| Role | Dark (Yaru) | Light | High Contrast |
| --- | --- | --- | --- |
| Background | `#1e1e1e` | `#f2f2f2` | `#000000` |
| Surface | `#242424` | `#fafafa` | `#000000` |
| Header bar | `#303030` | `#ebebeb` | `#000000` |
| Text | `#ffffff` | `#1d1d1d` | `#ffffff` |
| Accent | `#e95420` | `#e95420` | `#ffd700` |
| Green | `#2ec27e` | `#26a269` | `#6bff6b` |
| Red | `#e01b24` | `#c01c28` | `#ff6b6b` |

Rounded windows (12px), soft shadows, 8px controls, orange focus rings.

## Typography

- **Ubuntu** for the shell and applications.
- **Ubuntu Mono** for Terminal, file previews and the Text Editor buffer.

Both are self-hosted via Fontsource and bundled into `dist/assets`.

## Shell

- 32px black top bar: Activities, active app, clock, status cluster.
- 68px left dock, translucent, 48px colorful app icons, running indicators.
- Activities overview: search, window cards, favorites, application grid.
- GNOME quick settings: Wi-Fi, Bluetooth, Night Light, Do Not Disturb, volume,
  lock, settings, power.
- Desktop icons for Home and Trash, like an Ubuntu session.
- Windows use GNOME header bars and support drag, resize, minimize, maximize,
  double-click maximize, and `Super + arrow` snapping.

## Applications

The apps are styled as native GTK/GNOME programs, not web dashboards:

- Terminal: dark, monospace, tab strip, block cursor.
- Files: Nautilus-style places sidebar and preview.
- Text Editor: document list, autosave, monospace buffer.
- Settings: sidebar pages (Appearance, Sound, System, About).
- System Monitor: Resources/Processes tabs, graphs and integrity check.
- Music: album art, controls, spectrum.
- Snake: clean dark game board with GTK-style overlay.
- About: GNOME Settings About page.

## Motion and sound

Animations are short (120–180ms) and functional: GDM reveal, window open, overview
fade, quick settings slide, dock indicator. `prefers-reduced-motion` and the
"Animations" setting disable them. System sounds are a login chime and optional test
sound; the Music app generates its own audio.

## Anti-slop rules

- No fake "AI startup" gradients, glassmorphism cards, or emoji icons.
- No Inter/Roboto/Space Grotesk.
- No external CDNs or runtime network requests.
- No random rounded cards without a Linux reason.
- Every decorative detail should exist in GNOME, Ubuntu, or a Linux tiling setup.
