---
name: Modern Academic CRM
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e5'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fe'
  surface-container: '#ededf9'
  surface-container-high: '#e7e7f3'
  surface-container-highest: '#e1e2ed'
  on-surface: '#191b23'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3039'
  inverse-on-surface: '#f0f0fb'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ed'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Manrope
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-margin: 20px
  stack-gap: 16px
  inline-gap: 12px
  section-padding: 24px
  card-internal-padding: 20px
---

## Brand & Style
The design system is anchored in trust, clarity, and precision. It targets a dual audience: busy parents seeking peace of mind and students requiring focus. The aesthetic is **Minimalist-Professional**, drawing inspiration from modern Flutter architectures that prioritize smooth transitions and structural integrity.

The visual narrative avoids the cluttered "dashboard" look of legacy educational software. Instead, it utilizes generous whitespace, a high-fidelity blue-based palette, and a "layered-sheet" philosophy where content is organized into distinct, soft-edged containers. The result is a UI that feels reliable like an enterprise tool but as effortless as a lifestyle app.

## Colors
The palette is built on a "Refined Blue" foundation. **#2563EB (Royal Blue)** serves as the primary anchor for actions and branding, ensuring high legibility and a sense of authority. 

To maintain a premium feel, the system utilizes a range of "Cool Slates" for secondary elements. Surfaces and backgrounds move between pure white and a very soft **#F8FAFC** to create subtle separation without the need for harsh borders. Status colors are desaturated slightly to remain professional while providing clear feedback for grades, attendance, and alerts.

## Typography
The system employs a pairing of **Manrope** for headings and **Inter** for functional text. Manrope provides a modern, geometric warmth that feels contemporary and premium. Inter is utilized for body copy and labels due to its exceptional legibility at small sizes and high x-height, which is critical for data-dense CRM views.

Hierarchy is established through weight rather than dramatic size shifts. Title elements use Semibold (600) to stand out against the background, while data labels use Medium (500) with slight letter spacing to ensure they are easily scannable on mobile screens.

## Layout & Spacing
The layout follows a **Fluid Mobile Grid** based on an 8px spacing logic. A standard 20px horizontal margin is enforced across all screens to prevent content from feeling cramped against device edges.

Components are organized in a vertical stack with 16px gaps, creating a clear rhythm. For grouped data within cards, a tighter 12px gap is used. The philosophy is "Content-First": large headers lead the page, followed by high-level summary cards, then detailed lists. This allows parents to get a "glance-and-go" experience.

## Elevation & Depth
Depth is created through **Ambient Shadows** and tonal shifts rather than lines. Shadows are highly diffused (Y: 4, Blur: 20) with a very low opacity (6-8%) blue-tinted black. This makes cards appear to float gently above the base white background.

Interactive elements use a "Press-In" effect where the shadow depth reduces on tap, mimicking physical feedback. Secondary surfaces use a subtle inner-glow or a light grey fill (#F1F5F9) to denote nested information or inactive states.

## Shapes
The shape language is defined by significant corner rounding to evoke friendliness and safety. Primary containers and cards utilize a **20px radius**, creating a soft, tablet-like feel within the mobile viewport. 

Buttons and input fields use a slightly tighter **12px radius** to maintain a sense of precision and "tapability." All icons should follow a consistent corner radius of 2-4px on their internal paths to match the overall soft-geometric aesthetic.

## Components
- **Primary Buttons:** High-contrast blue (#2563EB) with white text. Height: 52px for accessibility. No borders, only soft depth.
- **Academic Cards:** White background, 20px radius, subtle shadow. Used for grade summaries, attendance streaks, or upcoming events.
- **Status Chips:** Small, pill-shaped indicators with a 10% opacity background of the status color (e.g., light green background for "Present" with dark green text).
- **Form Fields:** Ghost-style inputs with a light #F1F5F9 fill. On focus, they transition to a white background with a 1.5px primary blue border.
- **Iconography:** Linear, 24px grid icons with a 1.5px stroke weight. Use "Lucide" or "Feather" style icons for a clean, non-cluttered look.
- **Progress Indicators:** Thick, rounded-cap linear bars. Use the primary blue for completion and a light slate for the track.
- **List Items:** Separated by whitespace or a very faint 1px divider (#F1F5F9). Never use heavy lines; prioritize padding to create visual separation.