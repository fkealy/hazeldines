# Hazeldines

Landing page for [Hazeldines Coffee House](https://www.instagram.com/hazeldines25/) —
specialty coffee at Psychopomp Micro-Distillery, 145 St Michael's Hill, Bristol.

Static site: plain HTML/CSS/JS with [GSAP](https://gsap.com) (ScrollTrigger + SplitText)
and [Lenis](https://lenis.darkroom.engineering/) smooth scroll, loaded from CDN.
No build step.

## Run locally

```sh
python3 -m http.server 4173
# → http://localhost:4173
```

## Structure

- `index.html` — everything content-related, including the inline SVG brand ornament, truck & friends
- `css/style.css` — design system (colors, Fraunces/Karla type), layout, responsive + reduced-motion rules
- `js/main.js` — preloader, smooth scroll, scroll-driven animations, mobile menu, custom cursor

Hours: Mon–Fri 7.30–4.30 · Sat 9–12
