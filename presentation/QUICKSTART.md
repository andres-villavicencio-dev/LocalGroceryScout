# Quick Start - Presentation Deck

## 🚀 View the Presentation in 3 Steps

### Option 1: Quick View (Simplest)
```bash
cd presentation
./view.sh
```
Then open http://localhost:8000 in your browser.

### Option 2: Direct Open
```bash
open presentation/index.html
```
Or double-click `index.html` in your file browser.

---

## 📊 What You Get

✨ **28 professionally designed slides** covering:
- Problem statement & vision
- Technical architecture
- AI integration (Gemini 2.5)
- Security layers (3-tier defense)
- Payment infrastructure (Stripe)
- Monetization strategy
- Development journey
- Future roadmap

📈 **3 interactive charts**:
- State machine visualization
- Development timeline
- Architecture breakdown

🎨 **Beautiful design**:
- Custom color palette
- Animated transitions
- Responsive layout
- Dark theme optimized for projection

---

## ⌨️ Essential Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **→** or **Space** | Next slide |
| **←** or **Shift+Space** | Previous slide |
| **ESC** | Overview mode (see all slides) |
| **F** | Fullscreen |
| **Home** | First slide |
| **End** | Last slide |
| **B** or **.** | Pause/blackout |

---

## 🎯 Presentation Tips

1. **Start in fullscreen** (press `F`) for best experience
2. **Use overview mode** (`ESC`) to jump between sections
3. **Practice once** - some slides have fragment animations
4. **Charts are interactive** - they appear when you reach those slides
5. **Time estimate**: ~25-30 minutes for full deck

---

## 📐 Slide Structure at a Glance

| Slides | Section | Content |
|--------|---------|---------|
| 1-3 | Problem | The chaos of price discovery |
| 4-9 | Solution | Architecture & AI engine |
| 10-14 | Business | Monetization & economics |
| 15-22 | Craft | Technical achievements |
| 23-28 | Future | Lessons & impact |

---

## 🎨 Quick Customization

### Change Colors
Edit CSS variables in `index.html`:
```css
--color-ice: #53a8b6;     /* Primary brand color */
--color-frost: #79c2d0;   /* Light brand color */
--color-sun: #f39c12;     /* Accent color */
```

### Add Your Logo
Insert after `<div class="slides">`:
```html
<div style="position: fixed; bottom: 20px; left: 20px; z-index: 1000;">
    <img src="logo.svg" alt="Logo" style="width: 100px;">
</div>
```

### Add Speaker Notes
```html
<section>
    <h2>Slide Title</h2>
    <p>Content</p>
    <aside class="notes">
        Your private notes here
    </aside>
</section>
```
Press **S** during presentation to see notes.

---

## 📤 Export to PDF

1. Open in **Chrome/Chromium**
2. Add `?print-pdf` to URL: `index.html?print-pdf`
3. Print dialog: **Cmd+P** (Mac) or **Ctrl+P** (Windows/Linux)
4. Destination: **Save as PDF**
5. Margins: **None**
6. ✓ Enable **Background graphics**
7. Save

---

## 🛠️ Need More Help?

- **Full documentation**: See `README.md`
- **Customization guide**: See `CUSTOMIZATION_GUIDE.md`
- **Reveal.js docs**: https://revealjs.com/

---

## 🎭 The Story Arc

This presentation tells a complete narrative:

**Act I: Discovery**
> The problem of fragmented grocery pricing

**Act II: Architecture**
> How we built an intelligent solution

**Act III: Security & Scale**
> Production-grade implementation

**Act IV: Business**
> Sustainable monetization model

**Act V: Impact**
> What it means for users and the future

---

**Ready to present?** Run `./view.sh` and open your browser! 🎉
