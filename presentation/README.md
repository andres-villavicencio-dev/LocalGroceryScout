# Local Grocery Scout - Presentation Deck

## Overview

This is a custom-built presentation deck using **reveal.js** that tells the comprehensive story of Local Grocery Scout - from the problem space through technical architecture to production-ready monetization.

## Features

- **28 Slides** covering the complete technical and product narrative
- **3 Interactive Charts** (Chart.js powered):
  - State machine visualization
  - Development timeline graph
  - Architecture component breakdown
- **Custom Design System** with:
  - Original color palette (ocean/ice/horizon theme abstracted into pure design)
  - Gradient animations
  - Hover effects and transitions
  - Dark theme optimized for projection
- **Responsive Layout** adapts to different screen sizes
- **Self-Contained** - single HTML file, no build step required

## How to Use

### Opening the Presentation

Simply open `index.html` in a modern web browser:

```bash
# Option 1: Open directly
open presentation/index.html

# Option 2: Serve locally (recommended for best experience)
cd presentation
python3 -m http.server 8000
# Then visit: http://localhost:8000
```

### Navigation Controls

- **Arrow Keys**: Navigate slides
  - Right/Down: Next slide
  - Left/Up: Previous slide
- **Space**: Next slide
- **Shift + Space**: Previous slide
- **Home**: First slide
- **End**: Last slide
- **Esc**: Overview mode (see all slides)
- **F**: Fullscreen mode
- **S**: Speaker notes (if enabled)
- **B** or **.**: Pause/blackout

### Presentation Tips

1. **Start in fullscreen** (press F) for best visual experience
2. **Use overview mode** (Esc) to jump to specific sections
3. **Fragment animations** will appear progressively as you click through certain slides
4. **Charts are interactive** - they animate in when the slide appears

## Slide Structure

### Act I: The Problem (Slides 1-3)
- Title slide with animated gradient
- The chaotic state of grocery price discovery
- Vision for clarity and intelligence

### Act II: The Solution (Slides 4-9)
- Architecture overview with component grid
- Gemini AI dual-tool integration
- Data parsing innovation
- Security layers visualization
- Data model explanation
- State machine chart

### Act III: The Business (Slides 10-14)
- Monetization journey timeline
- Payment infrastructure flow
- Webhook event handling
- Economic model breakdown
- Development timeline chart

### Act IV: The Craft (Slides 15-22)
- Technical achievements
- Key metrics ("By the Numbers")
- User experience flow
- What makes it special
- Tech stack deep dive
- Code architecture
- Production readiness

### Act V: The Future (Slides 23-28)
- Lessons learned
- Future horizons
- Impact vision
- System architecture chart
- Narrative summary
- Closing slide with stats

## Customization

### Colors

The presentation uses a custom color palette defined in CSS variables:

```css
--color-void: #0a0a0f      /* Deep background */
--color-horizon: #1a1a2e   /* Mid background */
--color-sky: #16213e       /* Accent background */
--color-water: #0f3460     /* Primary accent */
--color-ice: #53a8b6       /* Primary highlight */
--color-frost: #79c2d0     /* Secondary highlight */
--color-snow: #e8f4f8      /* Text */
--color-sun: #f39c12       /* Warning/emphasis */
--color-fire: #e74c3c      /* Error/critical */
--color-earth: #95a5a6     /* Muted text */
```

To change the theme, modify these variables in the `<style>` section.

### Fonts

Currently uses:
- **Inter** (300, 400, 600, 700, 900) for body and headings
- **JetBrains Mono** for code blocks

### Adding Slides

Insert new `<section>` elements within the `.slides` container:

```html
<section>
    <h2>Your Slide Title</h2>
    <p>Your content here</p>
</section>
```

For split layouts:
```html
<section>
    <h2>Title</h2>
    <div class="slide-split">
        <div>Left content</div>
        <div>Right content</div>
    </div>
</section>
```

For triple columns:
```html
<div class="slide-triple">
    <div>Column 1</div>
    <div>Column 2</div>
    <div>Column 3</div>
</div>
```

### Fragment Animations

Add `class="fragment"` to any element to make it appear progressively:

```html
<ul>
    <li class="fragment">Appears first</li>
    <li class="fragment">Appears second</li>
    <li class="fragment">Appears third</li>
</ul>
```

## Chart Customization

Charts are created dynamically when their slides appear. Find the chart initialization code in the `<script>` section at the bottom.

Example chart structure:
```javascript
Reveal.on('slidechanged', event => {
    if (event.indexh === 9) { // Slide index
        const ctx = document.getElementById('stateChart').getContext('2d');
        new Chart(ctx, {
            // Chart.js configuration
        });
    }
});
```

## Exporting to PDF

To create a PDF version:

1. Open presentation in Chrome/Chromium
2. Add `?print-pdf` to the URL: `index.html?print-pdf`
3. Open Print dialog (Cmd+P / Ctrl+P)
4. Set destination to "Save as PDF"
5. Set margins to "None"
6. Enable "Background graphics"
7. Save

## Technical Details

### Dependencies (loaded via CDN)

- **reveal.js** 5.0.4 - Presentation framework
- **Chart.js** 4.4.0 - Interactive charts
- **Google Fonts** - Inter & JetBrains Mono

### Browser Compatibility

Tested and optimized for:
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance

- All assets loaded via CDN (no local dependencies)
- Charts only initialize when slides become visible
- CSS animations use GPU acceleration
- Minimal JavaScript for fast loading

## Design Philosophy

The visual design is inspired by themes of **navigation, discovery, and clarity** - reflecting the journey from chaotic price searching to intelligent, location-aware results. The color palette evokes depth (dark blues), clarity (ice/frost tones), and warmth (sun/fire accents), but abstracts these concepts into pure design language.

Key visual metaphors:
- **Layers** - Representing security tiers and architectural depth
- **Flows** - Showing data movement and state transitions
- **Gradients** - Suggesting transformation and progress
- **Metrics boxes** - Quantifying achievements

The design intentionally avoids literal representations (no grocery icons, no shopping carts) to focus attention on the technical and intellectual achievements.

## License

This presentation template is part of the Local Grocery Scout project.

## Credits

- **Reveal.js**: https://revealjs.com/
- **Chart.js**: https://www.chartjs.org/
- **Google Fonts**: https://fonts.google.com/

---

**Built with care to tell the story of transforming chaos into clarity through intelligent systems.**
