# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Personal site/blog of Wim Deblauwe, built with Hugo (extended, ≥ 0.163). Posts are AsciiDoc, rendered by Hugo's external Asciidoctor converter (Ruby, Rouge highlighting). Search is Pagefind. Deployed on Netlify (`netlify.toml`).

## Commands

```sh
bundle install                                     # first time: Asciidoctor + Rouge gems
hugo server                                        # dev server on :1313, no search index
hugo server -D -F                                  # include drafts / future-dated posts
hugo && npx pagefind --site public && hugo server --renderStaticToDisk   # dev with working search
hugo && npx pagefind --site public                 # production build (what Netlify runs)
```

There are no tests or linters. Verify changes by building (`hugo` must finish without errors) and inspecting output in `public/` or the running server. Build to a scratch directory with `hugo -d <dir>` if you don't want to touch `public/`.

## Content

- **Blog posts**: `content/blog/YYYY/MM/DD/<Title>.adoc` (2021+). Pre-2021 posts are flat files `content/blog/YYYY/YYYY-MM-DD-<Slug>.adoc` with `aliases:` to preserve old URLs. Public URLs are `/blog/YYYY/MM/DD/<urlized-filename>/` and must not change.
- Front matter: `title`, `date`, `draft`, `tags`, `keywords`, optionally `ad` (see below) and `hidden: true` (excluded from the homepage list). Copy the AsciiDoc attribute header (`:source-highlighter: rouge`, `:rouge-css: style`, `:imagesdir: /images`, `:toc: macro`, …) from an existing recent post; new posts don't use the archetype.
- Images referenced from posts live under `static/images/`.
- **Non-blog pages** (about, books, projects, conferences, newsletter-confirmed) are `.html` content files with `type: "page"` — this is why `security.allowContent` is set in `config.toml`.
- `newsletters/YYYY/` holds sent newsletter HTML; `newsletter.md` is a working log of the Mailchimp → EmailOctopus migration. Never commit subscriber email addresses — the repo is public.

## Layout architecture

- No theme; everything is in root `layouts/`. `_default/baseof.html` is the single skeleton (meta, OpenGraph/Twitter partials, JSON-LD schema for blog posts, GA in production only). CSS/JS come from `assets/css/main.css` and `assets/js/main.js` via Hugo Pipes (minify + fingerprint).
- `layouts/index.html` is the homepage (hero, search box, book strip, paginated posts). `layouts/blog/single.html` is the post template (progress bar, book ad, content, related posts via `[related]` config on tags, prev/next, newsletter form).
- Pagefind indexes only elements marked `data-pagefind-body` (the post article).
- Social card images are generated at build time by `layouts/partials/opengraph/get-featured-image.html`, overlaying text on `assets/images/twittercard/template.png` (coordinates are hard-coded to that template).
- `featureNewBook` in `config.toml` toggles the navy "new book" feature card on the homepage.

### Book/course ads on posts

Each post shows **at most one** ad. Rules live in `data/ads.toml`: an ordered list; the first ad whose `tags` intersect the post's tags wins, so list order is the priority. `layouts/partials/book-ad.html` does the selection; the ad markup is in `layouts/partials/ads/<name>.html` (markup only, no conditions). A post can set `ad: none` to suppress it or `ad: <name>` to force one. To add an ad: create the partial and add an entry to `data/ads.toml` at the right priority.

### Newsletter signup

The form (`layouts/partials/newsletter-signup-form.html`, also exposed as a shortcode) POSTs to `/api/subscribe`, a Netlify function in `netlify/functions/subscribe.mjs` that does bot/disposable-domain filtering and calls the EmailOctopus API (needs `EMAILOCTOPUS_API_KEY` / `EMAILOCTOPUS_LIST_ID` env vars on Netlify). It does not run under `hugo server`.

## Other

- `design-mockups/` holds static HTML mockups; `v5-craft` is the design the current site implements (see `REDESIGN_PLAN.md`). Earlier versions are reference only.
- When checking UI changes, check a mobile viewport (~390px) as well as desktop.
