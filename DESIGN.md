---
name: wimdeblauwe.com
description: Practical Java & Spring Boot writing from a working practitioner, set on warm paper with navy and copper.
colors:
  navy: "#13202f"
  navy-soft: "#1c2d40"
  navy-deep: "#27405a"
  copper: "#c2702e"
  copper-bright: "#e08a4e"
  copper-soft: "#f6e8da"
  copper-ink: "#965722"
  copper-fill: "#a85f25"
  copper-fill-hover: "#8f511d"
  paper: "#faf9f5"
  paper-soft: "#f1efe8"
  card: "#ffffff"
  code-paper: "#fdfdfb"
  ink: "#1b2531"
  ink-soft: "#5d6673"
  hairline: "#e6e2d9"
  cream-on-navy: "#f0ece5"
  mist-on-navy: "#b8c2cd"
  code-copper: "#9a5a24"
  note-tint: "#eef1f5"
  warning-tint: "#f9ebe9"
  warning: "#b3261e"
typography:
  display:
    fontFamily: "Barlow, sans-serif"
    fontSize: "clamp(2.2rem, 5.2vw, 3.4rem)"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Barlow, sans-serif"
    fontSize: "clamp(1.9rem, 4.6vw, 2.9rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Barlow, sans-serif"
    fontSize: "1.45rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title-sm:
    fontFamily: "Barlow, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Hanken Grotesk, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.65
  body-sm:
    fontFamily: "Hanken Grotesk, sans-serif"
    fontSize: "0.94rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Geist Mono, monospace"
    fontSize: "0.68rem"
    fontWeight: 400
    letterSpacing: "0.14em"
  code:
    fontFamily: "Geist Mono, monospace"
    fontSize: "0.85rem"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "16px"
  xl: "20px"
  pill: "99px"
spacing:
  gutter: "1.6rem"
  block: "1.35rem"
  section: "2.7rem"
  frame: "960px"
  prose-frame: "740px"
components:
  button-primary:
    backgroundColor: "{colors.copper-fill}"
    textColor: "{colors.card}"
    typography: "{typography.title-sm}"
    rounded: "{rounded.sm}"
    padding: "0.7rem 1.5rem"
  button-primary-hover:
    backgroundColor: "{colors.copper-fill-hover}"
    textColor: "{colors.card}"
  button-ghost-on-navy:
    backgroundColor: "transparent"
    textColor: "#d8dee5"
    rounded: "{rounded.sm}"
    padding: "0.65rem 1.4rem"
  tag-chip:
    backgroundColor: "{colors.copper-soft}"
    textColor: "{colors.copper-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.2rem 0.7rem"
  tag-chip-hover:
    backgroundColor: "{colors.copper-fill}"
    textColor: "{colors.card}"
  badge:
    backgroundColor: "{colors.copper-fill}"
    textColor: "{colors.card}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.3rem 0.9rem"
  card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.md}"
    padding: "1.15rem 1.3rem"
  navy-panel:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.cream-on-navy}"
    rounded: "{rounded.lg}"
    padding: "1.6rem 1.8rem"
  search-prompt:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "1rem 1.3rem"
  input-email:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0.7rem 1.1rem"
  code-block:
    backgroundColor: "{colors.code-paper}"
    textColor: "{colors.ink}"
    typography: "{typography.code}"
    rounded: "{rounded.md}"
    padding: "1.25rem 1.4rem"
---

# Design System: wimdeblauwe.com

## Overview

**Creative North Star: "The Workshop Bench"**

The site is a craftsman's well-kept bench: warm paper underfoot, navy steel for the heavy parts, copper for the fittings you reach for. Everything on it is there because it gets used. Nothing is there for show. The palette comes from the *Crafting Spring Boot Starters* cover, so the books and the blog read as work from the same bench.

Readers mostly arrive from search, looking for one answer. The system serves that reader first. Prose and code sit on a calm, light surface in a single centred column. Navy is reserved for heavy structural pieces: the footer, the code-block title bar, and the one book ad. Copper appears only in small, purposeful marks: links, tags, buttons, the reading-progress bar, the heading diamonds, and the search prompt's block cursor. A few small terminal touches (the `❯` prompt, mono labels, the blinking cursor) mark the site as a developer's without becoming a costume.

The site is not a SaaS landing page. There are no purple gradients, no glassmorphism, and no stock-template hero sections. It doesn't push sales either: no popups, no sticky banners, no ads inside the article body. It is light-only.

**Key Characteristics:**
- Warm off-white paper (never pure white as the page) with white cards for lift.
- Navy + copper duo; copper is always a small accent, never a large fill.
- Barlow display at heavy weight with tight negative tracking, Hanken Grotesk for reading, Geist Mono for labels, dates, tags and code.
- Soft, generous radii (10–20px) and hairline borders; shadows are low, navy-tinted, and pulled under the element.
- Code blocks are light and legible, with a navy top edge or title bar.
- Short `fadeUp` entrance motion on page heads only; hover lifts of 2–3px on cards.

## Colors

A warm-neutral paper ground, a deep navy for structure, and a single copper accent used sparingly.

### Primary
- **Workbench Copper** (`copper`): the accent as a *mark*: the progress bar, the `❯` prompt and block cursor, heading-anchor diamonds, borders, focus borders, the active nav underline, the hero headline emphasis (large text). It fails AA as small text, so it never colours small text or sits behind white text.
- **Copper Ink** (`copper-ink`): copper for *small text* on light surfaces: labels, tags, hint keywords, "all posts", text hovers. Passes AA on paper, white and Copper Wash.
- **Copper Fill** (`copper-fill`): copper *behind white text*: primary buttons, badges, chips on hover, the current page number, callout numbers, the tip chip. Hover goes darker to **Copper Fill Hover** (`copper-fill-hover`), never lighter.
- **Bright Copper** (`copper-bright`): copper text and hovers on navy surfaces only. **Copper Wash** (`copper-soft`) is the tint: tag-chip fills, focus rings (3px spread), search-hit `<mark>`, blockquotes and tip admonitions.

### Secondary
- **Cover Navy** (`navy`): headings and titles, footer background, the dark book-ad and feature panels, admonition chips, the 3px top edge of code blocks. **Lifted Navy** (`navy-soft`) is the code-block title bar and the middle stop of panel gradients; **Deep Harbour** (`navy-deep`) is the gradient's far end.

### Neutral
- **Warm Paper** (`paper`): page background, under a faint radial highlight (`#fffefc` at top centre).
- **Paper Shade** (`paper-soft`): inline-code background, list tag chips at rest, table header cells.
- **Card White** (`card`): raised surfaces: cards, search box, TOC, newsletter, post-list hover.
- **Code Paper** (`code-paper`): code block body; whiter than paper, warmer than card.
- **Ink** (`ink`): body text. **Soft Ink** (`ink-soft`): dates, summaries, meta, secondary text.
- **Hairline** (`hairline`): every 1px border and divider.
- **Cream on Navy** (`cream-on-navy`) and **Mist on Navy** (`mist-on-navy`): primary and secondary text on navy panels.
- **Rust Code** (`code-copper`): inline `code` text colour, a darker copper so it stays readable.
- **Note Tint** (`note-tint`), **Warning Tint** (`warning-tint`) with **Signal Red** (`warning`): admonition panels and their chips. Signal Red appears nowhere else.

### Named Rules
**The Small Marks Rule.** Copper is for marks, not surfaces: text, underlines, chips, buttons, bars of 3px or less, diamonds, cursors. It never fills a section, a panel or a hero. When something big needs weight, it is navy.

**The One Dark Panel Rule.** On a blog post, at most one navy panel (the book ad) appears above the content; everything else in the article column is light.

**The Three Coppers Rule.** Copper for marks, Copper Ink for small text, Copper Fill behind white text. Never put small text in plain copper, and never lighten a button on hover; it darkens to Copper Fill Hover.

**The Paper, Not White Rule.** The page is always Warm Paper. Pure white is reserved for raised surfaces sitting on it.

## Typography

**Display Font:** Barlow (sans-serif fallback), weights 400/600/700/800, self-hosted.
**Body Font:** Hanken Grotesk (sans-serif fallback), weights 400/500/600 + 400 italic, self-hosted.
**Label/Mono Font:** Geist Mono (monospace fallback), weights 400/500, self-hosted.

**Character:** Barlow at 700–800 with tight negative tracking gives headings an engineered, slightly condensed confidence. Hanken Grotesk is open and quiet for long reading. Geist Mono gives every piece of metadata a developer's voice. The root size is 17px, so every rem value is a touch larger than usual.

### Hierarchy
- **Display** (`display`): homepage hero headline only, navy, max ~19ch.
- **Headline** (`headline`): article and page `h1`, navy, max ~22ch.
- **Title** (`title`): article `h2` and section heads (1.45–1.55rem), navy, with the copper diamond anchor on hover.
- **Title-sm** (`title-sm`): article `h3`, post-list titles, card and book titles (0.95–1.15rem, 700).
- **Body** (`body`): article prose at 1.05rem / 1.65, in a 740px column (~70ch). The lead paragraph steps up to 1.13rem.
- **Body-sm** (`body-sm`): summaries, card copy, admonition content (0.85–0.95rem), usually Soft Ink.
- **Label** (`label`): uppercase mono with wide tracking (0.12–0.18em) for kickers, badges, TOC title, "Related" and prev/next directions; non-uppercase mono at 0.7–0.78rem for dates, counts, tags, breadcrumbs.
- **Code** (`code`): listings at 0.85rem / 1.7; inline code at 0.84em on Paper Shade in Rust Code.

### Named Rules
**The Mono Means Metadata Rule.** Geist Mono is for things a machine would print: dates, tags, counts, paths, labels, code, the search prompt. Never for headings or prose.

**The Heavy Display Rule.** Headings use Barlow at 700 or 800 with negative tracking (-0.01em to -0.035em), always in navy. No light or regular-weight headings.

## Layout

Single-column, centred. Two containers: `frame` (960px) for the homepage, lists and pages, and `prose-frame` (740px) for articles; both with a 1.6rem side gutter. The masthead is sticky, translucent paper with an 8px backdrop blur and a hairline bottom border.

Vertical rhythm inside articles is a uniform 1.35rem gap between blocks, widening to 1.5rem before code blocks and 2.7rem before an `h2`. Sections breathe generously: hero 4.2rem top, article head 3.8rem, post list bottom 4.5rem, newsletter 3rem/4rem margins.

The post list is a three-column grid (7.2rem date · title+summary · tags) that collapses to one column under 800px. The hero puts the portrait to the right of the text; under 720px the portrait shrinks to 96px and sits beside the standfirst. Two-up grids (book strip, prev/next) go to one column between 680px and 800px. Admonitions stack their label above the content under 480px. Wide tables and code scroll horizontally inside the column; the page itself never scrolls sideways.

## Elevation & Depth

Mostly flat, tonal layering: Warm Paper → Card White → hairline border. Shadows are low, soft and navy-tinted (`rgba(19,32,47,…)`), with large negative spread so they sit under the element rather than around it. Copper-tinted shadows appear only as a hover response on cards. Dark navy panels carry a deeper drop shadow plus a faint copper radial glow in their upper right.

### Shadow Vocabulary
- **Rest lift** (`0 1px 2px rgba(19,32,47,.04), 0 8px 24px -18px rgba(19,32,47,.25)`): search box, newsletter card.
- **Code lift** (`0 14px 34px -28px rgba(19,32,47,.4)`): code blocks.
- **Copper hover** (`0 14px 30px -22px rgba(194,112,46,.55)`) with `translateY(-3px)`: book cards, prev/next, related posts, featured projects.
- **Navy panel** (`0 20px 44px -28px rgba(19,32,47,.65)`): book ad and feature card.
- **Focus ring** (`0 0 0 3px` Copper Wash) together with a copper border: search box, email input.

### Named Rules
**The Flat-At-Rest Rule.** Cards rest flat on a hairline border. Lift and copper shadow arrive only on hover.

## Shapes

Soft, friendly rounding at every scale, sized to the element: 6px for inline code, 10px for buttons, inputs and images in posts, 12px for list rows and admonitions, 14px for cards, code blocks and the TOC, 16px for the book ad and newsletter, 20–22px for the feature card and hero portrait. Chips and badges are full pills.

The recurring motif is the **copper diamond**: a small square rotated 45° with 2–3px corners. It is the wordmark's mark, and it is the `h2` anchor in articles. Badges ("From the author", the newsletter tag) sit slightly rotated (-1° to -1.5°), like a sticker on the bench. The portrait has a layered ring (hairline, paper gap, copper line).

## Components

### Buttons
Solid copper and to the point.
- **Shape:** gently rounded (10px).
- **Primary:** Copper Fill, white Barlow 700 at 0.82–1rem, padding about 0.7rem 1.5rem.
- **Hover:** fill darkens to Copper Fill Hover (0.15s ease). No lift on buttons.
- **Ghost (on navy only):** transparent with a 35%-opacity light border; hover turns border and text Bright Copper.

### Tags / Chips
- **Article meta tags:** mono 0.68rem, Copper Ink on Copper Wash, pill; hover inverts to white on Copper Fill.
- **Post-list tags:** Soft Ink on Paper Shade at rest; they turn copper when the row is hovered.
- **Tag cloud:** white pill with hairline border, copper count; hover gets copper border, text and wash.

### Cards / Containers
- **Corner Style:** 14px.
- **Background:** Card White on Warm Paper.
- **Border:** 1px Hairline; turns copper on hover.
- **Shadow Strategy:** flat at rest, copper hover lift (see Elevation).
- **Internal Padding:** about 1–1.4rem.

### Inputs / Fields
- **Search prompt (signature):** white box, 14px radius, `❯` copper chevron, blinking copper block cursor that hides on focus or value, mono input with copper caret, mono hint line below. Focus: copper border + 3px Copper Wash ring. Typing anywhere on the homepage focuses it; `/` focuses, Esc clears.
- **Email field:** Warm Paper background, hairline border, 10px radius, mono text; same copper focus treatment.

### Navigation
- **Masthead:** wordmark in Barlow 700 led by the copper diamond; nav links in body font 500 at 0.9rem, Soft Ink, turning Ink on hover; the active link gets a 2px copper underline.
- **Footer:** solid navy band, Barlow signature in cream with a Bright Copper accent, mono links that turn Bright Copper on hover.
- **Breadcrumb:** mono 0.72rem with a copper `❯`.

### Code Block (signature)
Light and readable. Code Paper background, 14px radius, hairline border with a 3px navy top edge. A titled block gets a Lifted Navy title bar in mono 0.68rem. The body is Geist Mono 0.85rem / 1.7. Syntax colours are Rouge token classes styled in `main.css` (`rouge-css = "class"` in `config.toml` overrides the per-post `style`): navy keywords, Soft Ink italic comments, brick strings, teal numbers and attributes, blue types, purple annotations; every one clears 4.5:1 on Code Paper. Callout numbers are copper circles with white numerals.

### Book Ad (signature)
One per post, above the article body. A navy gradient panel (navy → navy-soft → navy-deep, 115°) with a copper radial glow, a rotated copper "From the author" badge overlapping the top edge, a book cover with a deep shadow that tilts on hover, a white Barlow title, Mist copy and a copper button.

### Admonitions
Tinted panels (12px). Note is Note Tint with a navy chip; tip is Copper Wash with a copper chip; warning, caution and important are Warning Tint with a Signal Red chip. The chip is the uppercase mono type name (no icon font), and a thin divider separates it from the content.

### Reading Progress
A 3px copper bar fixed at the very top of blog posts, growing with scroll.

## Do's and Don'ts

### Do:
- **Do** set every page on Warm Paper and lift content onto Card White with a 1px Hairline border.
- **Do** keep copper to small marks: links, chips, buttons, 3px bars, diamonds, focus rings.
- **Do** use navy for headings and for the few heavy structural surfaces (footer, code title bar, the one book ad).
- **Do** use Geist Mono for dates, tags, counts, labels and code, and Barlow 700–800 with negative tracking for headings.
- **Do** keep code blocks light with the navy top edge or title bar, and let them scroll horizontally inside the column.
- **Do** keep motion short and purposeful: `fadeUp` (0.5–0.6s) on page heads, 0.15–0.18s hover transitions, 2–3px card lifts.
- **Do** check every change at ~390px as well as desktop; nothing may cause a horizontal page scroll.

### Don't:
- **Don't** fill large areas with copper; when something needs weight, use navy.
- **Don't** add dark code themes; listings stay light.
- **Don't** add popups, sticky promo banners, or ads inside the article body; one ad at most, above the content.
- **Don't** reach for the generic SaaS look: purple or rainbow gradients, glassmorphism cards, stock template heroes.
- **Don't** add dark-mode variants unless explicitly asked; the system is light-only.
- **Don't** use pure white as the page background or hard black for text.
- **Don't** introduce new accent hues; Signal Red is reserved for warnings only.
