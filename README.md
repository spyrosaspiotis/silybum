# SILYBUM

First working homepage for **SILYBUM — Golden Moments. Elevated.**

## Current version

The page currently includes:

- cinematic hero area
- Easy Collection — 1.290€
- Comfort Collection — 2.490€
- Luxury Collection — 3.990€
- shared package benefits
- Premium Real Touch Florals
- Why Silybum
- notes and pricing conditions
- contact-interest form demo
- responsive desktop, tablet and mobile layouts

No booking, payment, invented services or extra collections have been added.

## Preview in VS Code

1. Open this folder in VS Code.
2. If the yellow Restricted Mode banner appears, choose **Trust** and then **Yes, I trust the authors**.
3. Open `index.html`.
4. Start a local preview from the terminal with:

   ```bash
   python3 -m http.server 5500
   ```

5. Open `http://localhost:5500` in a browser.

## Approved image slots

Place the final approved images in `assets/images` using these exact names:

- `hero.webp`
- `easy.webp`
- `comfort.webp`
- `luxury.webp`

Until those files are added, the site displays intentional luxury-colour placeholders instead of broken images.

The official logo is included at `assets/images/silybum-logo.png` and is used in the header and footer.

## Project structure

```text
silybum/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
└── assets/
    └── images/
```
