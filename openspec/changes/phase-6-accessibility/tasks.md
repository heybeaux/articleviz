# Tasks: Phase 6 — Accessibility

## 1. CSS Custom Properties Foundation
- [ ] 1.1 Define base CSS custom properties in `globals.css` (Inter font, default colors)
- [ ] 1.2 Define Lexend font custom properties (`[data-font="lexend"]`)
- [ ] 1.3 Define Atkinson Hyperlegible font custom properties (`[data-font="atkinson"]`)
- [ ] 1.4 Define colorblind-safe palette sets (protanopia, deuteranopia, tritanopia)
- [ ] 1.5 Ensure all existing component colors use CSS custom properties (not hardcoded values)

## 2. Preferences Context
- [ ] 2.1 Create `frontend/src/contexts/PreferencesContext.tsx` with React context
- [ ] 2.2 Implement font preference state (default: "inter", options: inter/lexend/atkinson)
- [ ] 2.3 Implement color mode preference state (default: "standard", options for palettes)
- [ ] 2.4 Implement motion preference state (default: detect OS `prefers-reduced-motion`)
- [ ] 2.5 Wire localStorage persistence (save on change, load on mount)
- [ ] 2.6 Apply `data-font`, `data-color-mode` attributes to `<html>` element on preference change

## 3. Font Toggle Component
- [ ] 3.1 Create `frontend/src/components/ui/FontToggle.tsx` — font selection dropdown
- [ ] 2.2 Display current font as the selected option in the dropdown
- [ ] 3.3 Show live preview of each font option (sample text rendered in that font)
- [ ] 3.4 Wire to PreferencesContext for state management

## 4. Color Mode Toggle Component
- [ ] 4.1 Create `frontend/src/components/ui/ColorModeToggle.tsx` — palette switcher
- [ ] 4.2 Display color swatches for each available palette option
- [ ] 4.3 Highlight the currently active palette in the switcher
- [ ] 4.4 Wire to PreferencesContext for state management

## 5. Motion Toggle Component
- [ ] 5.1 Create `frontend/src/components/ui/MotionToggle.tsx` — reduced motion toggle
- [ ] 5.2 Detect OS `prefers-reduced-motion` setting on mount (default state)
- [ ] 5.3 Display toggle switch with clear on/off states
- [ ] 5.4 Wire to Motion's `<MotionConfig reducedMode="user">` in the app layout
- [ ] 5.5 Wire to PreferencesContext for state management

## 6. Integration
- [ ] 6.1 Wire PreferencesContext into `frontend/src/app/layout.tsx` as the root provider
- [ ] 6.2 Load saved preferences from localStorage on initial page load
- [ ] 6.3 Add accessibility toggle components to the settings page or a floating toolbar
- [ ] 6.4 Test font switching across all pages and components (instant, no flash)
- [ ] 6.5 Test colorblind palette switching across all components (diagrams, UI elements)
- [ ] 6.6 Test motion toggle disables all scroll animations when reduced motion is enabled

## 7. Verification
- [ ] 7.1 Verify all three fonts render correctly and are readable at various sizes
- [ ] 7.2 Verify colorblind palettes pass WCAG AA contrast ratios for all text
- [ ] 7.3 Verify reduced motion mode disables Motion animations without breaking layout
- [ ] 7.4 Verify preferences persist across page reloads (localStorage works)
- [ ] 7.5 Verify OS `prefers-reduced-motion` is respected by default
