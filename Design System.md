# Design System — Tropical Playful

## Overview

The visual identity for LearnBasilan is **Tropical Playful** — warm, organic, and culturally resonant with Basilan. Think coral sunsets over the Sulu Sea, lush palm canopies, and the warmth of a one-room classroom where every child belongs.

## Design Direction

| Attribute | Choice |
|---|---|
| **Emotional tone** | Warm, encouraging, playful, safe |
| **Audience** | Elementary students (ages 6–12) in Basilan |
| **Visual direction** | Tropical Playful |
| **One thing to remember** | "Parang naglalaro, pero natututo" (Like playing, but learning) |

## Color Palette

```
 Coral     #FF7E5F   → Primary actions, buttons, highlights
 CoralDark #E86548   → Hover/pressed states
 CoralGlow #FFF0EB   → Subtle backgrounds

 Teal      #2EC4B6   → Secondary actions, progress indicators
 TealDark  #219A8F   → Hover/pressed states
 TealGlow  #E8F8F6   → Subtle backgrounds

 Gold      #FFD93D   → XP, stars, achievements, celebrations
 GoldGlow  #FFF8E0   → XP section backgrounds

 Green     #6BCB77   → Success, completion, correct answers
 GreenGlow #EDF8EF   → Completed item backgrounds

 Ocean     #1A535C   → Primary text, splash screen bg
 OceanLight #2D7A87  → Secondary text

 Cream     #FFF8F0   → App background
 CreamDark #F5E6D5   → Borders, dividers

 White     #FFFFFF   → Card backgrounds
```

## Typography

| Role | Font | Weight | Size |
|---|---|---|---|
| **Display** | Fredoka | 600–700 | 28–40px (headings) |
| **Body** | Nunito | 400–700 | 14–18px (text, labels, inputs) |
| **Small** | Nunito | 500–600 | 11–13px (meta, nav labels) |

Both fonts have rounded, friendly terminals. Fredoka provides the playful "kiddie" energy; Nunito keeps long-form reading comfortable.

## Spacing Rhythm

| Token | Value |
|---|---|
| `--radius-sm` | 12px |
| `--radius-md` | 18px |
| `--radius-lg` | 24px |
| `--radius-xl` | 32px |
| `--radius-full` | 9999px |
| Card padding | 16–20px |
| Screen padding | 20px horizontal, 60px top safe, 80px bottom safe |

## Shadows

| Token | Value |
|---|---|
| `--shadow-sm` | `0 2px 8px rgba(26, 83, 92, 0.08)` |
| `--shadow-md` | `0 4px 20px rgba(26, 83, 92, 0.12)` |
| `--shadow-lg` | `0 8px 40px rgba(26, 83, 92, 0.16)` |
| `--shadow-coral` | `0 4px 20px rgba(255, 126, 95, 0.35)` |

## Motion Language

1. **Screen transitions**: Slide up + fade (0.5s cubic-bezier(0.16, 1, 0.3, 1))
2. **XP bars**: Animate width from 0 on screen enter (1–2s)
3. **Buttons**: Lift on hover, press scale to 0.98
4. **Cards**: Hover lift 4px, press scale
5. **Splash**: Logo bounce (2s infinite) + ring pulse + staggered dots
6. **Inputs**: Coral border + glow ring on focus

## Key Screens

| Screen | Elements |
|---|---|
| **Splash** | Ocean gradient bg, animated logo, tagline, wave curves |
| **Language Selection** | 5 language cards with flag emoji, radio selection, primary CTA |
| **Onboarding** | 3 feature cards (Learn, Play, Share) with staggered reveal |
| **Login** | Bag illustration, form inputs with focus states, secondary link |
| **Register** | Pencil illustration, grade level grid selector, full name + username + password fields |
| **Home Dashboard** | Greeting header, avatar, XP card with streak fire, continue-learning CTA, 2×2 subject grid, bottom tab bar |
| **Subject Detail** | Coral hero with gradient, back button, stats, chapter list with locked/unlocked/completed states |

## Component Library (prototyped)

All components defined in `design-prototype/index.html`:
- Buttons (primary, secondary, teal, ghost, small)
- Form inputs (text, password, checkbox)
- Cards (subject, language, onboarding, continue-learning, chapter)
- Progress bars (XP bar, subject bars, chapter progress)
- Navigation (bottom tab bar, back buttons)
- Status bar (time + icons)
- Modals/alerts (illustration containers)

## Implementation Status

- [x] Design system defined (colors, typography, spacing, shadows, motion)
- [x] Splash screen prototyped
- [x] Language selection screen prototyped
- [x] Onboarding screen prototyped
- [x] Login screen prototyped
- [x] Register screen prototyped
- [x] Home dashboard prototyped
- [x] Subject detail screen prototyped
- [ ] React Native + NativeWind translation (next phase)

## File

`design-prototype/index.html` — open in browser to view interactive prototype.
