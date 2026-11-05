# my personal portfolio website 🌲

Hey, this is my personal portfolio website (Soham Kumar Shrivastava).
I built this using plain HTML, CSS, and vanilla JavaScript with GSAP and Lenis for smooth animations. 

Went for a calm, editorial forest green & beige color scheme instead of the typical neon glow / purple mesh gradient look that everyone uses these days.

---

## 🎨 Color Palette

Keeping it strictly to forest greens and warm beiges:

| Token | Hex | What it's used for |
| :--- | :--- | :--- |
| `--deep` | `#14261C` | Main dark background (hero, projects, experience, education, footer) |
| `--forest` | `#1F3D2B` | Dark cards & container background |
| `--mid` | `#2F5A3F` | Borders, subtle outlines & tags |
| `--moss` | `#4A7A55` | Main accent (cursor, progress bar, timeline line, primary buttons) |
| `--cream` | `#F4EBDA` | Light section background (about, skills, certs, contact) |
| `--sand` | `#E6D5B8` | Light card background, quick facts box |
| `--tan` | `#CDB891` | Warm borders & divider lines |

Fonts:
- Headings: `Playfair Display`
- Body: `Inter`
- Terminal & code bits: `JetBrains Mono`

---

## ✨ Cool Stuff Included

- **Lenis smooth scroll**: Buttery smooth scrolling (fixed the double-raf bug so mouse wheel works normally now).
- **Terminal intro**: Types out `$ whoami` and the tagline with a blinking cursor.
- **Top progress line**: Tracks scroll depth across the page.
- **Custom mouse cursor**: Small dot + lagging follower circle (desktop only, doesn't get in the way of phone touchscreens).
- **Projects horizontal track**: Scrolls horizontally on desktop (pins at top 70px so the title isn't hidden under the navbar), stacks normally on mobile.
- **Timeline animation**: Moss line draws itself down through the experience section as you scroll.
- **Adaptive nav**: Automatically swaps text colors between dark and light sections so the menu is always readable.
- **Magnetic buttons**: Subtle elastic pull toward your mouse cursor.
- **Prefers-reduced-motion**: Disables heavy animations if someone turned that on in their OS settings.

---

## 📁 Files

```
Portfolio/
├── index.html                                        # Main markup
├── style.css                                         # Styles & responsive rules
├── script.js                                         # GSAP & Lenis interactions
├── profile.jpeg                                      # Profile picture
└── README.md                                         # This file
```

---

## 💻 Running Locally

You can test it with Python's built-in server:

```bash
python3 -m http.server 8080
```

Then just open `http://localhost:8080` in your browser.

---

## 🚀 Deploying to GitHub Pages

Takes like 2 minutes:

1. **Commit your files**:
   ```bash
   git init
   git add .
   git commit -m "initial commit: portfolio"
   ```

2. **Create a repo on GitHub**:
   - Go to [github.com/new](https://github.com/new)
   - Name it `sohammm-txt.github.io` (for a user site) or `portfolio`
   - Keep it Public and leave the "Add a README" box unchecked.

3. **Push to main**:
   ```bash
   git remote add origin https://github.com/sohammm-txt/<repo-name>.git
   git branch -M main
   git push -u origin main
   ```

4. **Turn on Pages**:
   - In your GitHub repo, go to **Settings** > **Pages**
   - Under **Build and deployment**, set Source to `Deploy from a branch`
   - Pick `main` branch and `/ (root)` folder, then hit **Save**
   - Give it a minute or two and your site will be live!

---

## ➕ Adding More Projects Later

To add a new project card, just open `index.html`, find `<!-- note for future me: just copy one of the cards above to add a new project -->` inside `.projects__track`, and copy-paste an existing card:

```html
<article class="project-card" aria-label="Project Title">
  <div class="project-card__header">
    <span class="project-card__num">04</span>
    <div class="project-card__tags">
      <span class="tag">Python</span>
      <span class="tag">Security</span>
    </div>
  </div>
  <h3 class="project-card__title">Project Name</h3>
  <p class="project-card__description">What this thing does.</p>
  <ul class="project-card__features" role="list">
    <li>Feature or protocol detail</li>
    <li>Another cool detail</li>
  </ul>
  <div class="project-card__footer">
    <a href="https://github.com/sohammm-txt/repo" target="_blank" rel="noopener noreferrer" class="btn btn--outline magnetic-btn">
      <span>github.com/sohammm-txt/repo</span>
      <span class="btn__arrow">&rarr;</span>
    </a>
  </div>
</article>
```
Everything automatically resizes and updates!
