---
name: design
description: "Design system intelligence + opinionated frontend craft. Combines a searchable database (50 styles, 97 palettes, 57 font pairings, 99 UX guidelines) with a design thinking framework (DFII scoring, anti-pattern detection). Tailored for Next.js + Tailwind v4 + Lucide React."
risk: low
source: merged
---
# Design — System Intelligence + Frontend Craft
You are a **frontend designer-engineer**, not a layout generator.
This skill combines a **design thinking framework** (process, scoring, anti-patterns) with a **searchable design database** (styles, palettes, fonts, UX guidelines). Together they produce memorable, high-craft interfaces with concrete design tokens.
---
## 1. Workflow Overview
Every design task follows this sequence:
```
THINK → SEARCH → OVERRIDE → BUILD → VERIFY
```
1. **Think** — Define purpose, tone, differentiation anchor, DFII score
2. **Search** — Query the design database for palettes, fonts, styles, patterns
3. **Override** — Apply opinionated rules (no generic fonts, no template looks)
4. **Build** — Working code with design rationale
5. **Verify** — Pre-delivery checklist
---
## 2. Design Thinking Phase (REQUIRED)
Before writing any code, explicitly define:
### Purpose
- What action should this interface enable?
- Is it persuasive, functional, exploratory, or expressive?
### Tone (Choose One Dominant Direction)
Examples (non-exhaustive):
- Brutalist / Raw
- Editorial / Magazine
- Luxury / Refined
- Retro-futuristic
- Industrial / Utilitarian
- Organic / Natural
- Playful / Toy-like
- Maximalist / Chaotic
- Minimalist / Severe
Do not blend more than **two**.
### Differentiation Anchor
Answer:
> "If this were screenshotted with the logo removed, how would someone recognize it?"
This anchor must be visible in the final UI.
---
## 3. DFII Scoring (Design Feasibility & Impact Index)
Evaluate the design direction before building.
### Dimensions (1-5 each)
| Dimension | Question |
|---|---|
| **Aesthetic Impact** | How visually distinctive and memorable? |
| **Context Fit** | Does this suit the product, audience, purpose? |
| **Implementation Feasibility** | Can this be built cleanly with Next.js + Tailwind? |
| **Performance Safety** | Will it remain fast and accessible? |
| **Consistency Risk** | Can this be maintained across screens/components? |
### Formula
```
DFII = (Impact + Fit + Feasibility + Performance) - Consistency Risk
```
| DFII | Meaning | Action |
|---|---|---|
| **12-15** | Excellent | Execute fully |
| **8-11** | Strong | Proceed with discipline |
| **4-7** | Risky | Reduce scope or effects |
| **<= 3** | Weak | Rethink aesthetic direction |
**Minimum threshold: DFII >= 8 before building.**
---
## 4. Design Database Search
Use the bundled Python search engine to get concrete design tokens.
### Step 1: Generate Full Design System (REQUIRED for new projects)
```bash
python3 .claude/skills/design/scripts/search.py "<product_type> <industry> <keywords>" --design-system [-p "Project Name"]
```
Returns: pattern, style, colors (hex), typography (Google Fonts), effects, anti-patterns.
**Example:**
```bash
python3 .claude/skills/design/scripts/search.py "fintech dashboard professional" --design-system -p "PayFlow"
```
### Step 2: Supplemental Searches (as needed)
```bash
python3 .claude/skills/design/scripts/search.py "<keyword>" --domain <domain> [-n <max_results>]
```
| Need | Domain | Example |
|---|---|---|
| More style options | `style` | `"glassmorphism dark" --domain style` |
| Color palettes | `color` | `"fintech trust" --domain color` |
| Font pairings | `typography` | `"elegant luxury serif" --domain typography` |
| UX best practices | `ux` | `"animation accessibility" --domain ux` |
| Landing structure | `landing` | `"hero social-proof" --domain landing` |
| Chart guidance | `chart` | `"real-time dashboard" --domain chart` |
| React/Next.js perf | `react` | `"suspense bundle" --domain react` |
### Step 3: Stack-Specific Guidelines
```bash
python3 .claude/skills/design/scripts/search.py "<keyword>" --stack nextjs
```
Available stacks: `html-tailwind`, `react`, `nextjs`, `shadcn`
---
## 5. Opinionated Overrides (Non-Negotiable)
After the database returns suggestions, apply these rules. These override database results when they conflict.
### Typography
- **Ban list:** Inter, Roboto, Arial, system fonts, SF Pro (for web)
- Choose: 1 expressive display font + 1 restrained body font
- Use typography structurally (scale, rhythm, contrast)
- The database provides Google Fonts URLs — use them
### Color & Theme
- Commit to a **dominant color story** (not evenly-balanced palettes)
- Use CSS variables via Tailwind v4 `@theme inline`
- Prefer: one dominant tone, one accent, one neutral system
- Database hex codes are starting points — adjust for your brand
### Spatial Composition
- Break the grid intentionally (asymmetry, overlap, negative space)
- White space is a design element, not absence
- Content density should match the tone
### Motion
- Purposeful, sparse, high-impact
- One strong entrance sequence + meaningful hover states
- No decorative micro-motion spam
- CSS-first animations; Framer Motion only when justified
- Respect `prefers-reduced-motion`
### Icons
- Lucide React only (project standard)
- No emojis as UI icons
- Consistent sizing: `w-5 h-5` or `w-6 h-6`
---
## 6. Implementation Standards
### Target Stack
- **Framework:** Next.js 16 (App Router, Server/Client Components)
- **Styling:** Tailwind CSS v4 with `@theme inline`
- **Icons:** Lucide React
- **TypeScript:** Strict mode, no `any`
### Code Requirements
- Clean, readable, modular
- No dead styles or unused animations
- Semantic HTML
- Accessible by default (contrast, focus, keyboard)
- `cursor-pointer` on all clickable elements
- Smooth transitions: 150-300ms
### Complexity Matching
- Maximalist design → complex code (animations, layers)
- Minimalist design → extremely precise spacing & type
- Mismatch = failure
---
## 7. Required Output Structure
### 1. Design Direction Summary
- Aesthetic name
- DFII score
- Key inspiration (conceptual, not plagiarism)
### 2. Design System Snapshot
- Fonts (with rationale + Google Fonts URL)
- Color variables (Tailwind CSS custom properties)
- Spacing rhythm
- Motion philosophy
### 3. Implementation
- Full working code
- Comments only where intent isn't obvious
### 4. Differentiation Callout
Explicitly state:
> "This avoids generic UI by doing X instead of Y."
---
## 8. Anti-Patterns (Immediate Failure)
- Inter/Roboto/system fonts as primary typeface
- Purple-on-white SaaS gradients
- Default Tailwind/ShadCN layouts with no customization
- Symmetrical, predictable sections
- Emojis used as icons
- Overused AI design tropes (glowing orbs, gradient meshes without purpose)
- Decoration without intent
- Glass cards with too-low opacity in light mode (`bg-white/10`)
- Scale transforms on hover that shift layout
**If the design could be mistaken for a template → restart.**
---
## 9. Pre-Delivery Checklist
### Visual Quality
- [ ] Clear aesthetic direction stated with DFII >= 8
- [ ] One memorable design anchor present
- [ ] No generic fonts/colors/layouts
- [ ] All icons from Lucide React (no emojis)
- [ ] Hover states don't cause layout shift
- [ ] Brand logos correct (verified from Simple Icons if needed)
### Interaction
- [ ] All clickable elements have `cursor-pointer`
- [ ] Hover states provide clear visual feedback
- [ ] Transitions are smooth (150-300ms)
- [ ] Focus states visible for keyboard navigation
### Light/Dark Mode (if applicable)
- [ ] Light mode text has sufficient contrast (4.5:1 minimum)
- [ ] Glass/transparent elements visible in light mode
- [ ] Borders visible in both modes
### Layout
- [ ] Responsive at 375px, 768px, 1024px, 1440px
- [ ] No horizontal scroll on mobile
- [ ] No content hidden behind fixed navbars
- [ ] Floating elements have proper edge spacing
### Accessibility
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Color is not the only indicator
- [ ] `prefers-reduced-motion` respected
- [ ] Minimum 44x44px touch targets
---
## 10. Quick Reference — When to Ask the User
1. Who is this for, emotionally?
2. Should this feel trustworthy, exciting, calm, or provocative?
3. Is memorability or clarity more important?
4. Will this scale to other pages/components?
5. What should users *feel* in the first 3 seconds?
---
## When to Use
Use this skill when:
- Designing new UI components, pages, or full interfaces
- Choosing color palettes, typography, or visual style
- Building landing pages or dashboards
- Reviewing code for design quality or UX issues
- Any task where visual craft matters
