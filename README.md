# Portfolio Site

Professional portfolio website for security engineering roles at Big Tech companies.

## Overview

Modern, interactive portfolio showcasing security engineering projects, technical expertise, and professional background. Built with vanilla JavaScript and optimized for recruiter readability.

**Live Demo:** [Coming Soon]

## Features

- **Unique Design Elements**
  - Custom animated cursor with magnetic hover effects
  - Matrix rain background (security-themed)
  - Glassmorphism UI with 3D card tilts
  - Neon accent colors (cyan, blue, purple)
  - Terminal-style aesthetic

- **Organized Sections**
  - Hero with typing animation
  - About & Philosophy
  - 6 Featured Security Projects
  - Categorized Technical Stack
  - Discipline & Performance

- **Performance Optimized**
  - 60fps animations
  - GPU-accelerated transforms
  - Responsive design (mobile/tablet/desktop)
  - Accessibility support (`prefers-reduced-motion`)

## Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Build Tool:** Vite 6
- **Design:** Custom CSS with glassmorphism, sticky nav, scroll reveals
- **Animations:** Canvas API (matrix background), IntersectionObserver, CSS transitions
- **Typography:** Google Fonts (Inter, JetBrains Mono)

## Site UX / Recruiter Mode

### Recruiter Mode

A toggle in the top navigation marked **"Recruiter Mode"** switches the site into a condensed, skimmable layout:
- Shorter introductory paragraphs surface key facts immediately
- AEGIS flagship project shows prominent **GitHub** and **CI/Actions** proof links
- Evidence cards (CI/CD, testing, security scanning) remain fully visible
- Toggle state is persisted in `localStorage` and applied before first paint (no flash)

> Keyboard accessible: toggle is keyboard-focusable and announces state via `aria-pressed`.

### Scroll Animations

Elements reveal as they enter the viewport using **IntersectionObserver + CSS transitions** (no Framer Motion, no heavy library):
- Opacity: `0 → 1`
- Y-translate: `12px → 0` (desktop) / `6px → 0` (mobile)
- Duration: `300ms`, easing: `cubic-bezier(0.2, 0.8, 0.2,1)`
- Each element fires **once** (observer is disconnected after trigger — no re-trigger on scroll up)
- Sibling elements stagger by `60ms` for natural cascade

### Disabling Motion (`prefers-reduced-motion`)

All animations respect the OS/browser reduced-motion preference:

```
# macOS: System Settings → Accessibility → Display → Reduce Motion
# Windows: Settings → Ease of Access → Display → Show animations
# Chrome DevTools: Rendering panel → Emulate CSS media: prefers-reduced-motion: reduce
```

When `prefers-reduced-motion: reduce` is active:
- Translate is removed entirely (opacity-only fade)
- Typing animation and scroll arrow animation are disabled
- Custom cursor animations stop
- Matrix background canvas still runs (visual noise, not motion-dependent)

## Installation

```bash
# Clone repository
git clone https://github.com/cleamax/PortfolioSite.git
cd PortfolioSite

# Install dependencies
npm install

# Start development server
npm run dev
```

Development server runs at `http://localhost:5173`

## Build

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

Build output is in the `dist/` directory.

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Vercel auto-detects Vite configuration
4. Deploy with one click

### Netlify
1. Run `npm run build`
2. Drag & drop `dist/` folder to [netlify.com](https://netlify.com)
3. Get instant URL

### GitHub Pages
1. Run `npm run build`
2. Push `dist/` contents to `gh-pages` branch
3. Enable GitHub Pages in repository settings

## Project Structure

```
PortfolioSite/
├── src/
│   ├── styles/
│   │   └── index.css         # Complete design system
│   ├── main.js               # Entry point
│   └── effects.js            # Interactive effects
├── index.html                # Main HTML structure
├── package.json              # Dependencies & scripts
└── README.md
```

## 🎨 Design Philosophy

- **Recruiter-Optimized:** Clear sections for quick scanning
- **Memorable:** Unique visual elements that stand out
- **Professional:** Balanced effects, not overwhelming
- **Accessible:** Keyboard navigation, reduced motion support

## 🔧 Customization

### Update Content
Edit `index.html` sections:
- Hero: Line 46 (name, tagline)
- About: Line 61 (bio, philosophy)
- Projects: Line 85 (project details, links)
- Tech Stack: Line 196 (skills, categories)

### Modify Colors
Edit CSS variables in `src/styles/index.css`:
```css
--neon-cyan: #00ff9f;
--neon-blue: #00d4ff;
--neon-purple: #a855f7;
```

### Adjust Effects
Configure animations in `src/effects.js`:
- Matrix background speed
- Typing animation messages
- Cursor sensitivity
- Tilt intensity

## 📱 Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive (cursor disabled)

## 🤝 Contact

**Max Richter**
- GitHub: [@cleamax](https://github.com/cleamax)
- LinkedIn: [maxrichter](https://linkedin.com/in/maxrichter)

## 📄 License

This project is open source and available for personal use.

---

Built with ☕ and attention to detail.
