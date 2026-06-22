# Proposal: Phase 6 — Accessibility

## Intent

Bake in a full accessibility suite from day one. Three core features: dyslexia-friendly font selection (Lexend, Atkinson Hyperlegible), colorblind-safe palette switching (protanopia, deuteranopia, tritanopia modes), and reduced motion support that respects the user's OS preference by default. These are not afterthoughts — they're foundational to making ArticleViz genuinely useful for neurodiverse users.

## Scope

**In scope:**
- Font toggle component with three options (Inter, Lexend, Atkinson Hyperlegible) via Google Fonts
- Colorblind palette switcher with multiple safe palettes (protanopia, deuteranopia, tritanopia)
- Motion toggle that respects `prefers-reduced-motion` OS setting by default, with manual override
- CSS custom properties for all theming (fonts, colors) on `<html>` element
- React context for preference state management
- All preferences persisted in browser localStorage

**Out of scope:**
- Screen reader optimization for React Flow diagrams (future phase)
- High contrast mode beyond colorblind palettes
- Language translation or text-to-speech (future phase)
- WCAG 2.3+ specific features (dyslexia-specific spacing, etc.)

## Approach

1. Define CSS custom properties for all themeable values (fonts, colors) on `:root`
2. Create a React context (`PreferencesContext`) that manages font, color palette, and motion settings
3. Build toggle components for each setting:
   - **FontToggle:** Dropdown with three font options, applies via `data-font` attribute on `<html>`
   - **ColorModeToggle:** Palette switcher, applies via `data-color-mode` attribute on `<html>`
   - **MotionToggle:** Toggle with OS preference detection via `prefers-reduced-motion` media query
4. Load saved preferences from localStorage on app mount
5. Apply Motion's `<MotionConfig reducedMode="user">` based on motion setting

## ADHD/Neurodiversity Consideration

This is not an accessibility add-on — it's core to the product. ADHD readers have different visual processing needs: some fonts reduce letter confusion, some color palettes reduce visual noise, and unnecessary motion can be genuinely distracting. By making these controls prominent and easy to adjust, we let each user customize their experience in real time — no need to find the "perfect" settings on first try.
