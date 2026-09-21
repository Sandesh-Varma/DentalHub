# Customizing DentFlow look & feel

The app ships with a professional teal dental palette and Framer Motion animations. **You do not need to do anything** to run it.

If you want a personalized clinic brand, send or add:

| Item | Example |
|------|---------|
| Clinic name | "Smile Studio Dental" |
| Logo file | `client/public/logo.svg` |
| Primary color | `#0d9488` (current default) |
| Accent color | `#2dd4bf` |
| Font | "Plus Jakarta Sans" or link to Google Font |

**Where colors live:** `client/src/index.css` → `@theme` block.

**Where motion lives:** `client/src/components/motion/PageTransition.tsx`.

After you share preferences, update `index.css` and swap the logo in `PublicLayout` / `AppLayout`.
