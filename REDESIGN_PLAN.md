# wimdeblauwe.com redesign — implement v5-craft on Hugo

> Status: Phases 1–3 done (2026-06-12); Phase 4 (Pagefind search) next.
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

## Phase 1 — Foundation: baseof + CSS + fonts ✅ DONE (2026-06-12)

1. ✅ **Fonts**: 10 woff2 latin subsets in `static/fonts/` (Sora 400/600/700/800, Hanken Grotesk 400/500/600 + 400-italic, Geist Mono 400/500, ~135 KB total); `@font-face` in the new CSS. Removes Google Fonts CDN (GDPR-friendly).
2. ✅ **`layouts/_default/baseof.html`** — single HTML skeleton with blocks (`title`, `main`): meta/canonical/RSS link, existing `partials/opengraph/*` unchanged, GA internal template (production only), favicon, CSS+JS via Hugo Pipes (`minify | fingerprint`, integrity attr), masthead partial, footer partial. Gotcha hit: a `block "title"` may only be defined once in baseof — the home/inner-page title logic lives *inside* the single block.
3. ✅ **`assets/css/main.css`** — v5 mockup CSS ported and organized by component, including a first pass of the asciidoc-output styling (Phase 3 will verify against real posts) and the `wimdeblauwe.css` ports for non-blog pages, restyled to v5 tokens. CDN drops happen when templates switch over (Phase 2).
4. ✅ **`assets/js/main.js`** (Pipes, deferred): reading progress bar only — search wiring is Phase 4, section anchors are Phase 3 (server-side `sectanchors`, NOT JS).

Done early from later phases: new `404.html` (Phase 2 item) — built on baseof to verify the foundation end-to-end; `partials/site-header.html` + `partials/site-footer.html` (baseof needs them). Old `header.html`/`header-blog.html`/`head.html`/`footer.html` partials still exist until Phase 2 rewrites the page templates.

Fixes discovered during Phase 1 (pre-existing, local Hugo 0.163 vs stale netlify 0.110):

- `config.toml` got `security.allowContent = ['.*']` — newer Hugo denies `text/html` content files by default, which broke the build of all non-blog pages.
- Local builds need `bundle install` once (asciidoctor/rouge gems for the current Ruby; plain `asciidoctor` on PATH failed via rvm wrapper).
- Mockup CSS bug (all 5 mockups): `padding: X 0 Y` shorthands on `.hero`/`.top-inner`/`.footer-inner`/etc. wiped the horizontal `1.6rem` padding of `.frame` on the same element — invisible on desktop, content touched the screen edge on mobile. Ported CSS uses `padding-block`. **Check mobile viewport (~390px) whenever porting more mockup CSS.**
- Sticky footer added (`body` flex column + `main { flex: 1 }`) — mockups never had short pages, 404 does.

## Phase 2 — Templates (root `layouts/` only) ✅ DONE (2026-06-12)

All rewritten as `define "main"` blocks, following the mockups:

- `partials/site-header.html` — new masthead (wordmark + nav with active state). Replaces `head.html`; delete `header.html`/`header-blog.html` (content moves into baseof).
- `index.html` — hero (eyebrow "Java · Spring · Thymeleaf · Htmx"), search box, `{{ if .Site.Params.featureNewBook }}` feature card, two book cards, recent posts list, paginator.
- `blog/single.html` — breadcrumb (`❯ blog / YYYY / MM / DD`), title, date + tag chips, ad partials, content, prev/next cards, newsletter. Remove dead Disqus block.
- `_default/single.html` — generic v5 page wrapper for the `.html` content pages.
- `_default/list.html`, `taxonomy/tag.html`, **new** `_default/terms.html` (the `/tags/` page), **new** `partials/paginator.html` (currently theme-provided). (~~404.html~~ done in Phase 1.)
- Restyle ad partials (`taming-thymeleaf-ad`, `modern-frontends-with-htmx-ad`, `testing-spring-boot-masterclass-ad`) — same conditions, mockup book-ad markup ("From the author" badge, navy panel).
- Restyle `newsletter-signup-form` partial + shortcode (same Mailchimp POST URL, no Mailchimp CSS).
- New `partials/new-book-feature.html`; copy `design-mockups/v5-craft/crafting-spring-boot-starters-cover.png` to `static/images/` as placeholder.
- Keep unchanged: `blog/rss.xml`, `partials/opengraph/*`, `shortcodes/screenshot-with-gif*` (re-verify lightbox styling).

Notes from implementation (2026-06-12):

- `partials/footer.html` kept as an **empty stub**: deleting it un-shadows the theme's footer, which
  references the removed `_internal/google_analytics_async.html` and breaks the build. Delete the stub
  together with the theme in Phase 5.
- `fslightbox.js` now loads from baseof (deferred, all pages, as before); lightbox verified working on
  the htmx book page. Newsletter shortcode now just delegates to the partial.
- Masterclass ad uses `book-ad course-ad` + white backdrop CSS (dark rieckpil logo was invisible on navy);
  badge says "Recommended course" since it isn't Wim's own product.
- Mobile fix: long inline code overflowed the 390px viewport → `overflow-wrap: anywhere` on
  `article.prose code` (harmless for `pre code`, which never wraps).
- Verified: URL set of `public/` byte-identical to pre-phase-2 build (279 HTML/XML files); article-body
  HTML of all 123 posts byte-identical; ad conditions hit the same 26/11/40 posts; alias redirects and
  `/blog/index.xml` intact; `featureNewBook = true` renders the feature card correctly (flag still unset).

## Phase 3 — Asciidoctor output styling + anchors ✅ DONE (2026-06-12)

- ✅ Section anchors via `[markup.asciidocExt.attributes] sectanchors = ""` in `config.toml`; the emitted
  `<a class="anchor">` is empty (no `§` in markup — that glyph comes from Asciidoctor's own stylesheet,
  which we don't load). Styled as the copper diamond (`article.prose a.anchor`), replacing the mockup's
  unused `.h-anchor` rules; h4 made flex too (5 posts have `====` sections), with 8px/7px diamonds on h3/h4.
- ✅ Phase 1's asciidoc CSS verified against real posts (titled/untitled listings, callouts+colist,
  admonitions incl. nested code, tables, imageblocks, literalblocks, quoteblock, inline code).
  `pre code` confirmed transparent (no per-line pill bug). Fixes made during verification:
  - Untitled listing/literal blocks get a 3px navy `border-top` (plan's "plain navy top border");
    it blends into the navy title bar on titled blocks so one rule covers both.
  - Wide tables overflowed the article column to the viewport edge (Outbox post) →
    `table.tableblock { display: block; overflow-x: auto; }` (no inline width in the emitted HTML).
  - At 390px, admonitions with nested code listings blew the page width (672px overflow on the
    Laravel-port post) → `.admonitionblock > table { table-layout: fixed; }`; nested `pre` scrolls.
- Notes: `toc::[]` does **not** render (Hugo strips it by default, `preserveTOC` unset) — same as the
  live site, so not a regression; only 1 post uses it; `#toc` CSS kept in case it's ever enabled.
  No posts use footnotes.
- Verified: URL set byte-identical (279 files); diff of all built HTML/XML between builds with/without
  the config block shows the **only** content change is the anchor insertion in headings (70 files incl.
  RSS feeds, where it appears HTML-escaped).

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
