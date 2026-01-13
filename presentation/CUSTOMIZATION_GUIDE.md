# Presentation Customization Guide

## Advanced Customization Options

### 1. Changing the Color Scheme

The presentation uses a cohesive color system based on ocean/horizon/ice themes. To change it:

#### Option A: Modify Existing Palette

Edit the CSS variables in `index.html`:

```css
:root {
    /* Dark mode - Blues/Cyans */
    --color-void: #0a0a0f;      /* Darkest background */
    --color-horizon: #1a1a2e;   /* Mid background */
    --color-sky: #16213e;       /* Light background */
    --color-water: #0f3460;     /* Dark accent */
    --color-ice: #53a8b6;       /* Primary brand color */
    --color-frost: #79c2d0;     /* Light brand color */
    --color-snow: #e8f4f8;      /* Text color */

    /* Accent colors */
    --color-sun: #f39c12;       /* Yellow/orange */
    --color-fire: #e74c3c;      /* Red/error */
    --color-earth: #95a5a6;     /* Gray/muted */
}
```

#### Option B: Complete Theme Overhaul

For a **warm/earthy theme**:
```css
:root {
    --color-void: #1a1410;
    --color-horizon: #2d241e;
    --color-sky: #3d302a;
    --color-water: #8b6f47;
    --color-ice: #d4a574;
    --color-frost: #e8c9a0;
    --color-snow: #f5f1ed;
    --color-sun: #ff9f1c;
    --color-fire: #c1666b;
    --color-earth: #a39a92;
}
```

For a **purple/magenta tech theme**:
```css
:root {
    --color-void: #0d0a1a;
    --color-horizon: #1a1333;
    --color-sky: #2a1f4d;
    --color-water: #4a2d7a;
    --color-ice: #8b5cf6;
    --color-frost: #a78bfa;
    --color-snow: #f3f0ff;
    --color-sun: #fbbf24;
    --color-fire: #ef4444;
    --color-earth: #9ca3af;
}
```

### 2. Typography Changes

#### Change Font Families

Replace the Google Fonts import in `<head>`:

```html
<!-- Original -->
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&family=JetBrains+Mono:wght@400;600&display=swap');

<!-- Alternative: Roboto + Source Code Pro -->
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700;900&family=Source+Code+Pro:wght@400;600&display=swap');
```

Then update the CSS:
```css
.reveal {
    font-family: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
}

.reveal code {
    font-family: 'Source Code Pro', monospace;
}
```

#### Adjust Font Sizes

For larger venues (more readable from distance):
```css
.reveal h1 { font-size: 4.5em; }
.reveal h2 { font-size: 3em; }
.reveal h3 { font-size: 2.2em; }
.reveal p, .reveal li { font-size: 1.4em; }
```

For smaller screens:
```css
.reveal h1 { font-size: 2.8em; }
.reveal h2 { font-size: 2em; }
.reveal h3 { font-size: 1.5em; }
.reveal p, .reveal li { font-size: 1.1em; }
```

### 3. Adding Your Logo

Add your logo to the presentation:

```html
<!-- In index.html, add after <div class="slides"> -->
<div style="position: fixed; bottom: 20px; left: 20px; z-index: 1000;">
    <img src="your-logo.svg" alt="Logo" style="width: 100px; opacity: 0.8;">
</div>
```

For a logo that appears on every slide:
```css
/* Add to <style> section */
.reveal::before {
    content: '';
    position: fixed;
    bottom: 20px;
    left: 20px;
    width: 100px;
    height: 40px;
    background: url('your-logo.svg') no-repeat center;
    background-size: contain;
    opacity: 0.6;
    z-index: 1000;
}
```

### 4. Chart Customization

#### Change Chart Colors

Find the chart initialization in the `<script>` section:

```javascript
// Example: State Machine Chart
backgroundColor: [
    'rgba(83, 168, 182, 0.6)',  // Change these RGB values
    'rgba(121, 194, 208, 0.6)',
    // ... more colors
]
```

Use your theme colors:
```javascript
backgroundColor: [
    'rgba(139, 92, 246, 0.6)',  // Purple
    'rgba(167, 139, 250, 0.6)',  // Light purple
    'rgba(251, 191, 36, 0.6)',   // Yellow
    // etc.
]
```

#### Change Chart Types

Convert the bar chart to a line chart:
```javascript
// Change type
type: 'bar'  // Original
type: 'line' // New

// Add these options for line charts
datasets: [{
    // ... existing data
    fill: true,
    tension: 0.4,
    borderWidth: 3
}]
```

### 5. Transitions and Animations

#### Change Slide Transitions

In the `Reveal.initialize()` call:

```javascript
transition: 'slide',  // Options: 'none', 'fade', 'slide', 'convex', 'concave', 'zoom'
transitionSpeed: 'default', // 'default', 'fast', 'slow'
```

#### Add Custom Animations

Create custom fragment animations:
```css
/* Add to <style> section */
.reveal .fragment.fade-rotate {
    opacity: 0;
    transform: rotate(-10deg);
}

.reveal .fragment.fade-rotate.visible {
    opacity: 1;
    transform: rotate(0deg);
    transition: all 0.8s ease;
}
```

Use in slides:
```html
<div class="fragment fade-rotate">This will fade and rotate in</div>
```

### 6. Adding Speaker Notes

Add notes that only you see in presenter mode:

```html
<section>
    <h2>Slide Title</h2>
    <p>Visible content</p>

    <aside class="notes">
        - Remember to mention the security implications
        - Reference the diagram on the next slide
        - Anecdote about initial challenges
    </aside>
</section>
```

Press **S** during presentation to open speaker view with notes.

### 7. Background Customization

#### Per-Slide Backgrounds

```html
<!-- Solid color -->
<section data-background-color="#0a0a0f">
    <h2>Dark Slide</h2>
</section>

<!-- Gradient -->
<section data-background-gradient="linear-gradient(to bottom, #0a0a0f, #1a1a2e)">
    <h2>Gradient Slide</h2>
</section>

<!-- Image -->
<section data-background-image="path/to/image.jpg" data-background-opacity="0.3">
    <h2>Image Background</h2>
</section>

<!-- Video -->
<section data-background-video="path/to/video.mp4" data-background-video-loop data-background-video-muted>
    <h2>Video Background</h2>
</section>
```

#### Global Background Pattern

Add a subtle pattern to all slides:
```css
.reveal {
    background-image:
        linear-gradient(135deg, var(--color-void) 0%, var(--color-horizon) 50%, var(--color-sky) 100%),
        url('data:image/svg+xml,<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><rect width="1" height="1" fill="rgba(255,255,255,0.02)"/></svg>');
}
```

### 8. Interactive Elements

#### Add a Progress Bar

Already included by default via `progress: true` in configuration.

To customize its color:
```css
.reveal .progress span {
    background: var(--color-ice);
    height: 4px;
}
```

#### Add Slide Numbers

Customize the slide number format in configuration:
```javascript
slideNumber: 'c/t',  // Current/Total
// Options: 'h.v' (horizontal.vertical), 'h/v', 'c', 'c/t'
```

Style it:
```css
.reveal .slide-number {
    color: var(--color-frost);
    background: rgba(10, 10, 15, 0.6);
    font-family: 'JetBrains Mono', monospace;
    padding: 8px 12px;
    border-radius: 4px;
}
```

### 9. Responsive Design Tweaks

#### Adjust for Ultra-Wide Screens

```css
@media (min-width: 1920px) {
    .reveal h1 { font-size: 5em; }
    .reveal h2 { font-size: 3.5em; }
    .stat-box { padding: 3em; }
}
```

#### Optimize for Tablets

```css
@media (max-width: 1024px) and (min-width: 769px) {
    .slide-split { grid-template-columns: 1fr; }
    .reveal h1 { font-size: 3em; }
}
```

### 10. Export Customization

#### For Print/PDF

Add print-specific styles:
```css
@media print {
    .reveal {
        background: white !important;
        color: black !important;
    }

    .reveal h1, .reveal h2 {
        color: #2c3e50 !important;
    }

    /* Hide interactive elements */
    .reveal .controls,
    .reveal .progress {
        display: none !important;
    }
}
```

#### High-Resolution Export

When printing to PDF:
1. Use Chrome/Chromium for best results
2. Add `?print-pdf&showNotes=true` to URL to include speaker notes
3. Set scale to 100%
4. Enable "Background graphics"

### 11. Adding New Slide Layouts

#### Create a "Featured Metric" Layout

Add to CSS:
```css
.slide-metric-hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.metric-hero-number {
    font-size: 10em;
    font-weight: 900;
    background: linear-gradient(135deg, var(--color-ice), var(--color-sun));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1;
}

.metric-hero-label {
    font-size: 2em;
    color: var(--color-frost);
    margin-top: 0.5em;
}
```

Use in a slide:
```html
<section class="slide-metric-hero">
    <div class="metric-hero-number">40+</div>
    <div class="metric-hero-label">Commits to Production</div>
</section>
```

#### Create a "Quote with Attribution" Layout

CSS:
```css
.quote-attributed {
    position: relative;
    padding: 3em;
    border-left: 8px solid var(--color-sun);
}

.quote-attributed::before {
    content: '"';
    font-size: 6em;
    position: absolute;
    top: -0.2em;
    left: 0.2em;
    color: var(--color-ice);
    opacity: 0.3;
}

.quote-attribution {
    margin-top: 2em;
    font-size: 1.2em;
    color: var(--color-earth);
    font-style: normal;
}
```

HTML:
```html
<section>
    <div class="quote-attributed">
        <p style="font-size: 1.5em; font-style: italic; color: var(--color-frost);">
            The best way to predict the future is to invent it.
        </p>
        <div class="quote-attribution">— Alan Kay</div>
    </div>
</section>
```

### 12. Performance Optimization

#### Lazy-Load Heavy Content

For slides with images:
```html
<section>
    <h2>Architecture Diagram</h2>
    <img data-src="large-diagram.png" alt="Architecture">
    <!-- data-src instead of src loads on demand -->
</section>
```

Enable lazy loading in config:
```javascript
Reveal.initialize({
    // ... other options
    preloadIframes: true,
    autoPlayMedia: false
});
```

#### Optimize Chart Rendering

Only create charts when needed:
```javascript
let chartInstances = {};

Reveal.on('slidechanged', event => {
    // Destroy previous charts to free memory
    Object.values(chartInstances).forEach(chart => {
        if (chart) chart.destroy();
    });
    chartInstances = {};

    // Create new chart
    if (event.indexh === 9) {
        const ctx = document.getElementById('stateChart').getContext('2d');
        chartInstances.state = new Chart(ctx, { /* config */ });
    }
});
```

### 13. Accessibility Improvements

#### Add ARIA Labels

```html
<section aria-label="Introduction to Local Grocery Scout">
    <h1>Local Grocery Scout</h1>
    <!-- content -->
</section>
```

#### Improve Contrast for Key Text

```css
.reveal strong {
    font-weight: 700;
    color: var(--color-snow); /* Ensure AAA contrast */
}
```

#### Add Keyboard Navigation Hints

```html
<!-- Add to first slide -->
<div style="position: fixed; bottom: 10px; right: 10px; font-size: 0.7em; color: var(--color-earth);">
    Use arrow keys to navigate • Press ESC for overview
</div>
```

---

## Quick Reference: Key Classes

| Class | Purpose |
|-------|---------|
| `.slide-title` | Centered title slide layout |
| `.slide-split` | Two-column grid layout |
| `.slide-triple` | Three-column grid layout |
| `.stat-box` | Metric display box with hover effect |
| `.flow-container` | Horizontal flow diagram |
| `.layer` | Layered information block |
| `.timeline` | Vertical timeline with dots |
| `.highlight-box` | Emphasized content box |
| `.quote` | Styled blockquote |
| `.fragment` | Progressive reveal element |

## Tips for Great Presentations

1. **One idea per slide** - Don't overcrowd
2. **Use fragments** to reveal points progressively
3. **Contrast matters** - Ensure text is readable
4. **Test on actual hardware** - Projectors can wash out colors
5. **Practice transitions** - Know when animations trigger
6. **Have a backup** - Export to PDF as fallback
7. **Use speaker notes** - Keep yourself on track
8. **Time yourself** - 1-2 minutes per slide is typical

---

**Happy presenting! 🎤**
