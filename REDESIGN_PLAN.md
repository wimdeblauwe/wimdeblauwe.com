# wimdeblauwe.com redesign — implement v5-craft on Hugo

> Status: plan approved in concept, implementation not started.
> Design spec: `design-mockups/v5-craft/index.html` and `design-mockups/v5-craft/blog-post.html` (open in a browser).
> Other mockup folders (v1–v4) are earlier iterations, kept for reference only.

## Context

The site's ezhil-theme design is dated. A new design ("v5-craft") was approved as static mockups:
light warm-neutral palette, deep navy `#13202f` + copper `#c2702e` accents (palette taken from the
*Crafting Spring Boot Starters* book cover), Sora (display) / Hanken Grotesk (body) / Geist Mono (mono)
typography, terminal-style search prompt, restyled tag-driven book ads with a "From the author" badge.

**Decisions made with Wim:**

- Stay on **Hugo** — no Astro migration. The AsciiDoc + external Ruby Asciidoctor + Rouge pipeline stays untouched.
- Search: **Pagefind** indexing the built `public/` folder.
- Scope: **whole site** — homepage, blog single, tag pages, `/tags/`, pagination, About/Books/Projects/Conferences, 404.
- The navy "Crafting Spring Boot Starters" feature card is built behind a config flag (`featureNewBook`), default **off** (cover not final yet).
- URLs must not change: `/blog/YYYY/MM/DD/slug/`, pre-2021 aliases (frontmatter `aliases:`, Hugo handles), `/tags/<tag>/`, RSS at `/blog/index.xml`.
- The three tag-driven book-ad partials keep their **exact** conditions/exclusions, restyled only.
- UX details locked in during mockup review: type-anywhere focuses search ('/' shortcut, Esc clears), book banners collapse while searching, eyebrow text "Java · Spring · Thymeleaf · Htmx", no social pills in hero, light readable code blocks with navy title bar, section-heading diamonds are clickable anchors, reading progress bar on posts.

**Repo naming trap:** `layouts/partials/header.html` + `header-blog.html` are the `<head>` element templates;
`layouts/partials/head.html` is the visible masthead. Don't confuse them.

**Current architecture facts (verified):**

- Theme `themes/ezhil` (git submodule) still provides: `404.html`, `_default/terms.html`, `partials/disqus.html`, `partials/paginator.html`, CSS (`normalize/main/dark.css`) and `js/main.js`. Everything else is already overridden in root `layouts/`.
- CSS today is plain static links: theme CSS + `static/css/wimdeblauwe.css` (884 lines) + Google Fonts (Open Sans|Rokkitt) + Font Awesome CDN + Mailchimp CDN CSS. JS: feather-icons CDN, theme `main.js`, `static/js/fslightbox.js` (footer).
- 123 `.adoc` posts under `content/blog/`; per-post attributes `:source-highlighter: rouge`, `:rouge-css: style` (inline colors), `:imagesdir: /images`, `:icons: font`, `:toc: macro`.
- Non-blog pages are `.html` content files with `type: "page"` frontmatter.
- Newsletter: Mailchimp POST to `wimdeblauwe.us4.list-manage.com/...` (partial + shortcode variants).
- `config.toml`: no `[markup]` section, no `mainSections`; `netlify.toml`: `HUGO_VERSION=0.110.0` (stale — local Hugo is newer; recent commits fixed e.g. `Site.Author` removal), command `hugo`, publish `public`.
- Disqus logic in `blog/single.html` is dead code (no `disqusShortname` configured) — drop it.

## Phase 1 — Foundation: baseof + CSS + fonts

1. **Fonts**: download woff2 (latin subsets) of Sora (400/600/700/800), Hanken Grotesk (400/500/600 + italic), Geist Mono (400/500) into `static/fonts/`; `@font-face` in the new CSS. Removes Google Fonts CDN (GDPR-friendly).
2. **`layouts/_default/baseof.html`** — single HTML skeleton with blocks (`title`, `main`): meta/canonical/RSS link, existing `partials/opengraph/*` unchanged, GA internal template (production only), favicon, CSS via Hugo Pipes, masthead partial, footer partial. All page templates become `{{ define "main" }}` blocks.
3. **`assets/css/main.css`** — port the v5 mockup CSS, organized by component (tokens / header / hero / search / feature-card / book-cards / post-list / article / asciidoc-output / ads / newsletter / pagination / footer / static pages). Load with `resources.Get | minify | fingerprint`. Drop: theme CSS, `wimdeblauwe.css`, Font Awesome CDN, Mailchimp CDN CSS, feather-icons. Port from `wimdeblauwe.css` only what non-blog pages need (book grid, testimonials, screenshot-with-gif/lightbox figures), restyled to v5 tokens.
4. **`assets/js/main.js`** (Pipes, deferred): reading progress bar + search wiring (Phase 4).

## Phase 2 — Templates (root `layouts/` only)

All rewritten as `define "main"` blocks, following the mockups:

- `partials/site-header.html` — new masthead (wordmark + nav with active state). Replaces `head.html`; delete `header.html`/`header-blog.html` (content moves into baseof).
- `index.html` — hero (eyebrow "Java · Spring · Thymeleaf · Htmx"), search box, `{{ if .Site.Params.featureNewBook }}` feature card, two book cards, recent posts list, paginator.
- `blog/single.html` — breadcrumb (`❯ blog / YYYY / MM / DD`), title, date + tag chips, ad partials, content, prev/next cards, newsletter. Remove dead Disqus block.
- `_default/single.html` — generic v5 page wrapper for the `.html` content pages.
- `_default/list.html`, `taxonomy/tag.html`, **new** `_default/terms.html` (the `/tags/` page), **new** `404.html`, **new** `partials/paginator.html` (both currently theme-provided).
- Restyle ad partials (`taming-thymeleaf-ad`, `modern-frontends-with-htmx-ad`, `testing-spring-boot-masterclass-ad`) — same conditions, mockup book-ad markup ("From the author" badge, navy panel).
- Restyle `newsletter-signup-form` partial + shortcode (same Mailchimp POST URL, no Mailchimp CSS).
- New `partials/new-book-feature.html`; copy `design-mockups/v5-craft/crafting-spring-boot-starters-cover.png` to `static/images/` as placeholder.
- Keep unchanged: `blog/rss.xml`, `partials/opengraph/*`, `shortcodes/screenshot-with-gif*` (re-verify lightbox styling).

## Phase 3 — Asciidoctor output styling + anchors

- Style Asciidoctor's real HTML inside the article scope: `.listingblock` + Rouge `.highlight` (listing `.title` → the navy code-block bar; plain navy top border when untitled), inline code, admonitions, tables, `.imageblock`, `#toc`, blockquotes, footnotes. Rouge colors are inline (`:rouge-css: style`) so only container styling is needed. Ensure `pre code` carries no inline-code background (per-line pill bug found during mockup review).
- **Section anchors** without touching the 123 posts — in `config.toml`:

  ```toml
  [markup.asciidocExt.attributes]
  sectanchors = ""
  ```

  Asciidoctor then emits `<a class="anchor" href="#id">` before each heading; style `.anchor` as the copper diamond (suppress its default `§` glyph via CSS).

## Phase 4 — Search (Pagefind)

- `netlify.toml` build command: `hugo && npx -y pagefind --site public` (apply to production, deploy-preview and branch-deploy contexts, keeping the `-D -F -b $DEPLOY_PRIME_URL/` flags where present).
- Homepage JS: lazy-load `/pagefind/pagefind.js` on first keystroke; terminal UX from the mockup (type-anywhere focus, `/`, Esc, `body.searching` hides feature card + book cards); render results (title/date/excerpt) in place of the recent-posts list; graceful "search index not built" no-op under plain `hugo server`.
- Local dev with search: `hugo && npx pagefind --site public && hugo server --renderStaticToDisk` (or accept search-disabled during normal dev).

## Phase 5 — Config + decommission theme

- `config.toml`: remove `theme = "ezhil"`, `customCSS`, `featherIconsCDN`, social params (links move into footer markup); add `mainSections = ["blog"]`, `featureNewBook = false`, the `[markup.asciidocExt.attributes]` block.
- `netlify.toml`: bump `HUGO_VERSION` to match local (`hugo version` first), add Pagefind to commands.
- Remove the theme submodule (`.gitmodules`, `themes/ezhil`) **last**, after the site builds clean without it. Then delete dead static assets (`static/css/wimdeblauwe.css`, theme-copied JS) once nothing references them.

## Verification checklist

1. `hugo` builds clean; visual pass on: homepage; a 2026 post; a 2013 post (aliases); posts with tables/images/admonitions/`:toc:`; each ad-banner case (thymeleaf-only, htmx, junit/assertj/spring-boot-without-thymeleaf, and the two excluded book-launch posts); `/tags/`; one tag page; pagination page 2; About/Books/Projects/Conferences; 404.
2. **URL regression**: build before/after; the set of generated HTML file paths under `public/` must be identical. Spot-check one alias redirect. Confirm `/blog/index.xml` exists.
3. **Content regression**: diff the article-body HTML (content container only) of all 123 posts between old and new builds — only wrapper markup may differ.
4. Pagefind: run the full build command, verify search finds old posts, banners collapse while typing, Esc restores.
5. Lighthouse on homepage + one post (fonts self-hosted, no CDN CSS remaining).
