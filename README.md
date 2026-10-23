# Vidyasutra — Minimalist Peer-to-Peer Campus Learning Network

**Vidyasutra** connects students who want to learn with peers who love to teach. Students can search mentors by skill-specific ratings, generate structured learning roadmaps, ask technical questions in the community feed, send skill-barter requests, and collaborate in real time on a cross-tab synced whiteboard.

## What Was Fixed, Optimized & Redesigned

1. **Complete Technical Audit & Bug Fixes:**
   - **Restored Missing Stylesheets (`styles.css` & `style.css`):** Created a unified, responsive stylesheet powering `index.html`, `login.html`, `signup.html`, `dashboard.html`, and auxiliary pages.
   - **Restored Missing Scripts & Pages (`script.js`, `signup.html`, `signup.js`, `forgot-password.html`, `terms.html`, `privacy.html`):** Fixed all broken navigation links, login validation, registration flows, password reset, and the `?demo=1` Instant Demo flow.
   - **Fixed Broken Image Assets:** Replaced missing `campus.png` and outdated `SkillSwap`-watermarked raster images with crisp, scalable SVG illustrations (`assets/campus-hero.svg`, `assets/auth-visual.svg`, `assets/favicon.svg`).
2. **Performance & Smoothness Optimization:**
   - Added hardware-accelerated transitions (`220ms cubic-bezier(0.22, 1, 0.36, 1)`), smooth scrolling, and responsive canvas scaling for high-DPI screens.
3. **Minimalist UI/UX & Complete Rebranding to Vidyasutra:**
   - Rebranded every page title, navbar logo, hero section, form prompt, community post, and footer to **Vidyasutra**.
   - Designed a warm alabaster (`#FAF8F5`), deep espresso (`#141413`), and forest emerald (`#156B4D`) high-contrast palette with `Plus Jakarta Sans` and `Inter` typography.

## Running Locally

Open `index.html` directly in any modern browser, or serve the folder locally:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.
