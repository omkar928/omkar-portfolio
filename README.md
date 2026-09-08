# Omkar Deshmukh — Portfolio

Personal profile website of **Omkar Deshmukh** — Software Engineer · Researcher · Innovator.
Built from the CV: 7 patents filed (4 granted, India + US), ₹17 Cr IP valuation, ₹30.45 L research funding, 8+ publications, 36+ certifications, TEDxSNPSU Organizer & Licensee, President of BioBridge, Team Leader of Team Vidyut (ISRO STRC 2026), NUS Young Fellow (FIERD).

## Highlights

- **Custom 3D engine, zero dependencies** — the hero renders a rotating neural-constellation sphere, wireframe icosahedron, orbital rings, a DNA double helix and star dust with a hand-written perspective projector on a 2D canvas. No Three.js, no build step, loads instantly.
- **Mouse-reactive 3D** — the scene, the portrait and every card tilt in 3D with the cursor.
- **Cinematic motion** — preloader, staggered headline reveal, typewriter roles, animated counters, scroll-progress bar, growing timeline, marquee awards, particle contact field.
- **Fully responsive** — desktop, tablet and mobile layouts, `prefers-reduced-motion` respected.

## Structure

```
index.html        # all content (sections mirror the CV)
style.css         # design system: black + gold, Syne / Inter / JetBrains Mono
main.js           # 3D engine, animations, interactions
assets/           # portrait photos
.github/workflows # GitHub Pages deployment
```

## Run locally

Just open `index.html`, or serve the folder:

```bash
python3 -m http.server 8080
# → http://localhost:8080
```

## Deploy

Push to `main`. The included workflow publishes the site to GitHub Pages
(Settings → Pages → Source: **GitHub Actions**).

## Editing content

All text lives in `index.html`. Stats in the counter strip use `data-count`, `data-prefix`, `data-suffix`.
Colours are CSS variables at the top of `style.css` (`--gold`, `--bg`, …).
