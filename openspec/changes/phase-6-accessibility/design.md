# Design: Phase 6 — Accessibility

## Technical Approach

All themeable values are CSS custom properties on `:root`. Preference state is managed in a React context that reads from localStorage. Toggle components update the context, which applies `data-*` attributes to `<html>` and updates CSS custom properties. Motion's reduced motion support is wired through the context.

## Architecture Decisions

### Decision: CSS custom properties over CSS-in-JS
CSS variables on `:root` are the most performant theming approach — no JavaScript re-renders needed to switch fonts or colors. The browser handles it natively via attribute selectors (`[data-font="lexend"]`). This is especially important for font switching, which should feel instant.

### Decision: `data-*` attributes on `<html>` over class names
Using semantic attribute selectors (`[data-font="lexend"]`, `[data-color-mode="protanopia"]`) is more explicit and easier to debug than class names. It also makes it trivial to add new options without touching CSS — just define the attribute selector and custom properties.

### Decision: React context over Redux/Zustand
A simple React context is sufficient for three boolean/string preferences. There's no complex state management needed — just read from localStorage on mount, write to localStorage on change. Zustand would be overkill for this scope.

### Decision: OS preference detection as default
Motion toggle defaults to the user's OS `prefers-reduced-motion` setting. This respects their system-level choice while still allowing manual override if they want motion enabled despite the OS setting. This is the principle of least surprise — most users won't touch it, and those who do can customize.

### Decision: Google Fonts for accessibility fonts
Lexend and Atkinson Hyperlegible are available on Google Fonts, which provides:
- Fast CDN delivery with caching
- No self-hosting complexity
- Consistent rendering across browsers
- Easy font loading with `next/font/google`

### Decision: Colorblind palettes as complete CSS variable sets
Each colorblind mode defines a full set of CSS custom properties for all colors used in the app (diagram nodes, accents, backgrounds). This is more work than swapping a single variable, but ensures every element uses accessible colors — no partially inaccessible components.

## File Changes

- `frontend/src/styles/globals.css` (modified) — add CSS custom properties for all themes
- `frontend/src/contexts/PreferencesContext.tsx` (new) — React context for font/color/motion preferences
- `frontend/src/components/ui/FontToggle.tsx` (new) — font selection dropdown
- `frontend/src/components/ui/ColorModeToggle.tsx` (new) — colorblind palette switcher
- `frontend/src/components/ui/MotionToggle.tsx` (new) — reduced motion toggle with OS detection
- `frontend/src/app/layout.tsx` (modified) — wire up PreferencesContext, load from localStorage
- `frontend/package.json` (no changes needed — all deps already installed in Phase 1)
