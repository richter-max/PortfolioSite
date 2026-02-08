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
- **Build Tool:** Vite 6.4.1
- **Design:** Custom CSS with glassmorphism and 3D transforms
- **Animations:** Canvas API (matrix background), Intersection Observer
- **Typography:** Google Fonts (Inter, JetBrains Mono)

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

Built with ☕ and attention to detail. Optimized for Big Tech recruiters.
