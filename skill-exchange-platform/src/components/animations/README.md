# Animation Components

This folder contains reusable Framer Motion animation components for the Skill Exchange Platform.

## 🎬 Available Components

### 1. **FadeInView** - Initial Page Load Animations
Fade and slide in elements when component mounts.

**Usage:**
```jsx
import { FadeInView } from '../components/animations';

<FadeInView delay={0.2} direction="up">
  <div>Your content here</div>
</FadeInView>
```

**Props:**
- `delay`: Number (default: 0) - Delay before animation starts
- `direction`: 'up' | 'down' | 'left' | 'right' (default: 'up')
- `className`: String - Additional CSS classes

---

### 2. **ScrollReveal** - Scroll-Triggered Animations
Animate elements when they scroll into view.

**Usage:**
```jsx
import { ScrollReveal } from '../components/animations';

<ScrollReveal delay={0.1} direction="up">
  <div className="card">Your content</div>
</ScrollReveal>
```

**Props:**
- `delay`: Number (default: 0) - Delay after element is in view
- `direction`: 'up' | 'down' | 'left' | 'right' (default: 'up')
- `className`: String - Additional CSS classes

---

### 3. **StaggerChildren** - Sequential List Animations
Animate child elements one after another with stagger effect.

**Usage:**
```jsx
import { StaggerChildren, StaggerItem } from '../components/animations';

<StaggerChildren staggerDelay={0.15}>
  <StaggerItem>
    <div>Item 1</div>
  </StaggerItem>
  <StaggerItem>
    <div>Item 2</div>
  </StaggerItem>
  <StaggerItem>
    <div>Item 3</div>
  </StaggerItem>
</StaggerChildren>
```

**Props:**
- `staggerDelay`: Number (default: 0.1) - Delay between each child
- `className`: String - Additional CSS classes

---

### 4. **HoverScale** - Scale on Hover
Scale up element smoothly on hover.

**Usage:**
```jsx
import { HoverScale } from '../components/animations';

<HoverScale scale={1.05}>
  <button>Click me</button>
</HoverScale>
```

**Props:**
- `scale`: Number (default: 1.05) - Scale multiplier
- `className`: String - Additional CSS classes

---

### 5. **HoverGlow** - Glow Effect on Hover
Add glowing box shadow on hover.

**Usage:**
```jsx
import { HoverGlow } from '../components/animations';

<HoverGlow glowColor="#3b82f6">
  <div className="card">Hover for glow</div>
</HoverGlow>
```

**Props:**
- `glowColor`: String (default: '#3b82f6') - Hex color for glow
- `className`: String - Additional CSS classes

---

### 6. **HoverLift** - Lift Effect on Hover
Lift element up with shadow on hover.

**Usage:**
```jsx
import { HoverLift } from '../components/animations';

<HoverLift liftAmount={-8}>
  <div className="card">Hover to lift</div>
</HoverLift>
```

**Props:**
- `liftAmount`: Number (default: -8) - Pixels to lift (negative = up)
- `className`: String - Additional CSS classes

---

### 7. **HoverRotate** - Rotate on Hover
Subtle rotation animation on hover.

**Usage:**
```jsx
import { HoverRotate } from '../components/animations';

<HoverRotate rotation={5}>
  <svg>Icon</svg>
</HoverRotate>
```

**Props:**
- `rotation`: Number (default: 5) - Degrees to rotate
- `className`: String - Additional CSS classes

---

## 📦 Import All at Once

```jsx
import { 
  FadeInView, 
  ScrollReveal, 
  StaggerChildren, 
  StaggerItem,
  HoverScale,
  HoverGlow,
  HoverLift,
  HoverRotate 
} from '../components/animations';
```

---

## 🎨 Real-World Examples

### Hero Section with Sequential Animations
```jsx
<FadeInView delay={0.2}>
  <h1>Main Heading</h1>
</FadeInView>

<FadeInView delay={0.4}>
  <p>Subheading</p>
</FadeInView>

<FadeInView delay={0.6}>
  <HoverScale>
    <button>Get Started</button>
  </HoverScale>
</FadeInView>
```

### Feature Cards with Scroll Reveal
```jsx
<ScrollReveal delay={0.1}>
  <HoverLift>
    <div className="feature-card">Feature 1</div>
  </HoverLift>
</ScrollReveal>

<ScrollReveal delay={0.2}>
  <HoverLift>
    <div className="feature-card">Feature 2</div>
  </HoverLift>
</ScrollReveal>
```

### Stats Counter with Stagger
```jsx
<StaggerChildren staggerDelay={0.15}>
  {stats.map(stat => (
    <StaggerItem key={stat.id}>
      <HoverLift>
        <div className="stat-card">
          <h3>{stat.value}</h3>
          <p>{stat.label}</p>
        </div>
      </HoverLift>
    </StaggerItem>
  ))}
</StaggerChildren>
```

---

## 🚀 Performance Tips

1. **Use `once: true`** in ScrollReveal for better performance (already implemented)
2. **Avoid wrapping large lists** - Use StaggerChildren for small lists (< 20 items)
3. **Combine effects wisely** - Don't nest too many animation components
4. **Test on mobile** - Reduce animation complexity for mobile devices

---

## 🎯 When to Use What

| Use Case | Component | Example |
|----------|-----------|---------|
| Page load hero | `FadeInView` | Hero heading, CTA buttons |
| Scroll sections | `ScrollReveal` | Feature cards, testimonials |
| List animations | `StaggerChildren` | Stats, badges, skill tags |
| Buttons | `HoverScale` | Primary CTAs, navigation |
| Cards | `HoverLift` | Feature cards, product cards |
| Icons | `HoverRotate` | Social icons, arrow icons |
| Important CTAs | `HoverGlow` | Sign up buttons, buy now |

---

## 📚 Learn More

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Animation Best Practices](https://web.dev/animations/)
