# Design System - Unified Styles Guide

## Overview
This document describes the comprehensive design system implemented for consistent styling across all SkillSwap components.

---

## CSS Variables & Design Tokens

### Typography Scale
```css
--font-xs: 0.75rem;      /* 12px */
--font-sm: 0.875rem;     /* 14px */
--font-base: 1rem;       /* 16px */
--font-lg: 1.125rem;     /* 18px */
--font-xl: 1.25rem;      /* 20px */
--font-2xl: 1.5rem;      /* 24px */
--font-3xl: 1.875rem;    /* 30px */
--font-4xl: 2.25rem;     /* 36px */
--font-5xl: 3rem;        /* 48px */
```

### Spacing Scale
```css
--space-xs: 0.25rem;     /* 4px */
--space-sm: 0.5rem;      /* 8px */
--space-md: 1rem;        /* 16px */
--space-lg: 1.5rem;      /* 24px */
--space-xl: 2rem;        /* 32px */
--space-2xl: 3rem;       /* 48px */
--space-3xl: 4rem;       /* 64px */
```

### Border Radius
```css
--radius-sm: 0.5rem;     /* 8px */
--radius-md: 0.75rem;    /* 12px */
--radius-lg: 1rem;       /* 16px */
--radius-xl: 1.5rem;     /* 24px */
--radius-full: 9999px;
```

### Transitions
```css
--transition-fast: 150ms ease-in-out;
--transition-base: 200ms ease-in-out;
--transition-slow: 300ms ease-in-out;
```

---

## Button System

### Button Sizes
| Class | Padding | Font Size | Border Radius |
|-------|---------|-----------|---------------|
| `.btn-sm` | 8px 16px | 14px | 12px |
| `.btn-md` | 16px 32px | 16px | 16px |
| `.btn-lg` | 24px 48px | 18px | 24px |

### Button Variants

#### Primary Button
```html
<button class="btn btn-primary btn-md">Click Me</button>
```
- **Background**: Blue-to-indigo gradient
- **Color**: White
- **Hover**: Darker gradient + lift effect
- **Use for**: Main CTAs, important actions

#### Secondary Button  
```html
<button class="btn btn-secondary btn-md">Cancel</button>
```
- **Background**: White / Dark slate
- **Border**: Gray
- **Hover**: Light gray background
- **Use for**: Secondary actions, cancel buttons

#### Outline Button
```html
<button class="btn btn-outline btn-md">Learn More</button>
```
- **Background**: Transparent
- **Border**: Blue
- **Hover**: Light blue background
- **Use for**: Tertiary actions, less prominent CTAs

#### Danger Button
```html
<button class="btn btn-danger btn-md">Delete</button>
```
- **Background**: Red gradient
- **Color**: White
- **Hover**: Darker red + lift effect
- **Use for**: Destructive actions

#### Ghost Button
```html
<button class="btn btn-ghost btn-md">Close</button>
```
- **Background**: Transparent
- **Hover**: Light gray background
- **Use for**: Icon buttons, minimal actions

### Button States
- **Disabled**: 50% opacity, no pointer events
- **Loading**: Spinning icon + "Loading..." text
- **Focus**: Blue outline (accessibility)

---

## Input System

### Standard Input
```html
<input class="input" type="text" placeholder="Enter text..." />
```

**Specifications**:
- Padding: 16px 24px
- Font size: 16px
- Font weight: 500
- Border: 2px solid gray
- Border radius: 16px
- Focus: Blue border + subtle shadow

### With Label
```html
<div>
  <label htmlFor="email" class="label block mb-2">Email</label>
  <input id="email" class="input" type="email" />
</div>
```

### Error State
```html
<input class="input !border-red-500" aria-invalid="true" />
<p class="mt-2 body-sm text-red-600" role="alert">This field is required</p>
```

### States
- **Default**: Gray border
- **Focus**: Blue border with glow
- **Error**: Red border
- **Disabled**: Light gray background, no interaction

---

## Card System

### Basic Card
```html
<div class="card">
  <h3 class="heading-3">Card Title</h3>
  <p class="body-base">Card content goes here...</p>
</div>
```

**Specifications**:
- Background: White / Dark slate
- Border: 1px solid gray
- Border radius: 24px
- Padding: 32px
- Shadow: Subtle elevation

### Hoverable Card
```html
<div class="card card-hover">
  <!-- Content -->
</div>
```

**Hover Effect**:
- Lifts up 2px
- Shadow increases
- Border color intensifies
- Smooth transition (200ms)

---

## Typography System

### Headings

#### Heading 1
```html
<h1 class="heading-1">Page Title</h1>
```
- Font size: 48px
- Font weight: 800
- Line height: 1.1
- Use for: Page titles

#### Heading 2
```html
<h2 class="heading-2">Section Title</h2>
```
- Font size: 36px
- Font weight: 700
- Line height: 1.2
- Use for: Section headings

#### Heading 3
```html
<h3 class="heading-3">Subsection Title</h3>
```
- Font size: 30px
- Font weight: 700
- Line height: 1.3
- Use for: Subsections

#### Heading 4
```html
<h4 class="heading-4">Card Title</h4>
```
- Font size: 24px
- Font weight: 600
- Line height: 1.4
- Use for: Card headings, smaller titles

### Body Text

#### Large Body
```html
<p class="body-lg">Important paragraph text...</p>
```
- Font size: 18px
- Font weight: 400
- Line height: 1.7

#### Base Body
```html
<p class="body-base">Regular paragraph text...</p>
```
- Font size: 16px
- Font weight: 400
- Line height: 1.6

#### Small Body
```html
<p class="body-sm">Smaller text for captions...</p>
```
- Font size: 14px
- Font weight: 400
- Line height: 1.5

### Labels
```html
<label class="label">Form Label</label>
```
- Font size: 14px
- Font weight: 600
- Letter spacing: 0.01em
- Text transform: uppercase
- Color: Muted gray

---

## Component Examples

### Login Form
```html
<form class="space-y-5">
  <div>
    <label htmlFor="email" class="label block mb-2">Email Address</label>
    <input id="email" type="email" class="input" placeholder="you@example.com" />
  </div>
  
  <div>
    <label htmlFor="password" class="label block mb-2">Password</label>
    <input id="password" type="password" class="input" placeholder="••••••••" />
  </div>
  
  <button type="submit" class="btn btn-primary btn-lg w-full">
    Sign In
  </button>
</form>
```

### Navigation Buttons
```html
<!-- Desktop -->
<nav class="flex items-center gap-8">
  <button class="btn btn-secondary btn-md">Logout</button>
  <a href="/login" class="btn btn-primary btn-md">Sign In</a>
</nav>

<!-- Mobile -->
<button class="btn btn-ghost btn-sm !p-2" aria-label="Open menu">
  <svg><!-- Icon --></svg>
</button>
```

### Landing Page CTA
```html
<div class="flex flex-col sm:flex-row gap-6">
  <button class="btn btn-primary btn-lg min-w-[200px]">
    Get Started Free →
  </button>
  <button class="btn btn-outline btn-lg min-w-[200px]">
    Explore Skills ✨
  </button>
</div>
```

### Card Grid
```html
<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  <div class="card card-hover">
    <h3 class="heading-4 mb-4">Feature Title</h3>
    <p class="body-base text-gray-600 dark:text-gray-400">
      Feature description goes here...
    </p>
  </div>
  <!-- More cards -->
</div>
```

---

## Color System

### Primary Colors
- **Blue**: #3b82f6 (Primary actions)
- **Indigo**: #6366f1 (Gradients)
- **Purple**: #8b5cf6 (Accents)

### Neutral Colors
- **Gray 50**: #f9fafb (Backgrounds)
- **Gray 200**: #e5e7eb (Borders)
- **Gray 600**: #4b5563 (Secondary text)
- **Gray 900**: #111827 (Primary text)

### Dark Mode
- **Slate 800**: #1e293b (Cards)
- **Slate 900**: #0f172a (Backgrounds)
- **Slate 700**: #334155 (Borders)

### Semantic Colors
- **Success**: #10b981 (Green)
- **Error**: #ef4444 (Red)
- **Warning**: #f59e0b (Amber)
- **Info**: #3b82f6 (Blue)

---

## Spacing Guidelines

### Page Padding
- **Desktop**: 4rem (64px)
- **Tablet**: 2rem (32px)
- **Mobile**: 1rem (16px)

### Section Spacing
- **Between sections**: 3-4rem (48-64px)
- **Within sections**: 1.5-2rem (24-32px)

### Component Spacing
- **Form fields**: 1.25rem (20px) gap
- **Button groups**: 1rem (16px) gap
- **Card grid**: 1.5rem (24px) gap

---

## Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 767px) { }

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) { }

/* Desktop */
@media (min-width: 1024px) { }

/* Large Desktop */
@media (min-width: 1280px) { }
```

---

## Accessibility

### Focus States
- All interactive elements have visible focus indicators
- Blue outline with 2px width and 2px offset
- High contrast mode increases to 3px

### Color Contrast
- All text meets WCAG 2.1 AA standards (4.5:1 minimum)
- Important UI elements meet AAA standards (7:1)

### Screen Reader Support
- Labels use `.label` class (uppercase, 14px, semibold)
- Error messages use `role="alert"`
- Loading states use `role="status"`

---

## Migration Guide

### Before (Old Styles)
```html
<button class="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">
  Click Me
</button>
```

### After (New Design System)
```html
<button class="btn btn-primary btn-md">
  Click Me
</button>
```

### Benefits
- ✅ Consistent sizing across all buttons
- ✅ Unified hover effects
- ✅ Proper disabled states
- ✅ Dark mode support built-in
- ✅ Accessibility features included
- ✅ Reduced code duplication

---

## Best Practices

### DO ✅
- Use design system classes (`.btn`, `.input`, `.card`)
- Follow spacing scale (`--space-md`, `--space-lg`)
- Use semantic HTML (`<button>`, `<input>`, `<label>`)
- Include ARIA labels for accessibility
- Test in both light and dark modes

### DON'T ❌
- Create one-off button styles
- Use inline styles for common patterns
- Skip accessibility attributes
- Hardcode pixel values
- Forget to test responsive behavior

---

## Component Checklist

When creating a new component:
- [ ] Uses design system classes
- [ ] Follows spacing guidelines
- [ ] Has proper dark mode support
- [ ] Includes accessibility attributes
- [ ] Responsive across all breakpoints
- [ ] Consistent with existing patterns
- [ ] Documented in code comments

---

*Last Updated: November 3, 2025*
*Version: 1.0.0*
