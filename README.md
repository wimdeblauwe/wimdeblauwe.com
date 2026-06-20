# wimdeblauwe.com

Personal site built with [Hugo](https://gohugo.io/). Content is written in AsciiDoc, processed by [Asciidoctor](https://asciidoctor.org/) via Hugo's external converter pipeline. Search is powered by [Pagefind](https://pagefind.app/).

## Prerequisites

- **Hugo** (extended) ≥ 0.163 — `brew install hugo`
- **Ruby** ≥ 3.x — used by Asciidoctor
- **Bundler** — `gem install bundler`
- **Node.js** — needed to run Pagefind when developing with search

## First-time setup

Install the Ruby gems (Asciidoctor + Rouge syntax highlighter):

```sh
bundle install
```

## Development

### Without search (fast iteration)

```sh
hugo server
```

The site is served at <http://localhost:1313>. Live-reload is active; search is silently disabled (no Pagefind index).

### With search

Build the site, run Pagefind, then serve with the static output on disk:

```sh
hugo && npx pagefind --site public && hugo server --renderStaticToDisk
```

The site is served at <http://localhost:1313> with a working search index. Live-reload still works, but you need to re-run the two build steps if you change content and want search results to update.

## Production build

```sh
hugo && npx pagefind --site public
```

Output is in `public/`. This mirrors what Netlify runs.

## Testing social images

Each page gets an Open Graph / Twitter card image generated at build time by `layouts/partials/opengraph/get-featured-image.html`. The generator starts from `assets/images/twittercard/template.png` and overlays the page title, tags, and "Wim Deblauwe" onto it.

To check what a given page's card looks like:

1. Build the site: `hugo`.
2. Open the rendered page in `public/<path>/index.html` and locate the `<meta name="twitter:image" ...>` (or `og:image`) tag in `<head>`.
3. Open the URL from that tag — it points to a generated PNG under `public/images/twittercard/` — to preview the card.

For a final check, paste the deployed page URL into the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) or [X Card Validator](https://cards-dev.twitter.com/validator) to see how the card renders on each platform.

If you change `template.png`, also re-check the overlay coordinates in `get-featured-image.html` — the `x`/`y` values assume the existing template layout.
