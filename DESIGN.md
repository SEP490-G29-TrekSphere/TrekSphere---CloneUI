---
trigger: always_on
---

---

version: alpha
name: Blue Ocean
description: Deep ocean navy on ice-blue canvas. Coral sunset accent. Moderate rounding.
colors:
primary: "#0B3D5C"
secondary: "#5C7A99"
tertiary: "#E8623D"
neutral: "#EAF4F8"
surface: "#FFFFFF"
on-primary: "#FFFFFF"
typography:
display:
fontFamily: Inter
fontSize: 4.5rem
fontWeight: 700
letterSpacing: "-0.025em"
h1:
fontFamily: Inter
fontSize: 2.3rem
fontWeight: 600
body:
fontFamily: Inter
fontSize: 1rem
lineHeight: 1.6
label:
fontFamily: Inter
fontSize: 0.78rem
fontWeight: 600
letterSpacing: "0.04em"
rounded:
sm: 8px
md: 12px
lg: 20px
spacing:
sm: 8px
md: 16px
lg: 32px
components:
button-primary:
backgroundColor: "{colors.tertiary}"
textColor: "{colors.on-primary}"
rounded: "{rounded.md}"
padding: 12px 20px
card:
backgroundColor: "{colors.surface}"
textColor: "{colors.primary}"
rounded: "{rounded.lg}"
padding: 24px

---

## Overview

Blue Ocean: deep navy carries authority and trust (booking, safety, vendor trust), an ice-blue canvas keeps pages light and airy, and a single coral-sunset accent gives every CTA a warm, energetic pop against the cool palette — evoking sunrise over water on a trekking/adventure platform.

## Colors

The palette is built around high-contrast cool neutrals and a single warm accent that drives interaction.

- **Primary (`#0B3D5C`):** Headlines and core text.
- **Secondary (`#5C7A99`):** Borders, captions, and metadata.
- **Tertiary (`#E8623D`):** The sole driver for interaction. Reserve it.
- **Neutral (`#EAF4F8`):** The page foundation.
- **Surface (`#FFFFFF`):** Cards and elevated content sit on white, not neutral, to stay crisp.

## Typography

- **display:** Inter 4.5rem
- **h1:** Inter 2.3rem
- **body:** Inter 1rem
- **label:** Inter 0.78rem

## Do's and Don'ts

- **Do** use Tertiary for exactly one action per screen (Book Tour, Join Group, SOS excluded — SOS keeps its own alert color, never Tertiary).
- **Do** let Neutral carry the composition — negative space is a feature.
- **Do** reserve Surface (pure white) for cards/panels so they lift off the Neutral page background.
- **Don't** introduce gradients. This system is flat on purpose.
- **Don't** mix Tertiary with alternate accents; the single-accent rule is load-bearing.
- **Don't** revert to full-pill (100px) rounding — Blue Ocean uses moderate radii (8–20px) to read as trustworthy/outdoor, not cafe-soft.
