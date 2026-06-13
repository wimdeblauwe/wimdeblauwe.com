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
