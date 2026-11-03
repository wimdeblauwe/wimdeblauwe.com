# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary: searchers with a problem.** Java/Spring developers landing from a search engine on a single post because they need to solve something specific (Thymeleaf, htmx, testing, Spring Boot auto-configuration, tooling). They read that post, maybe a related one, and leave.
- **Secondary: regular followers.** Returning readers and newsletter subscribers who follow Wim's work and read new posts and release announcements as they come out.

## Product Purpose

The personal blog of Wim Deblauwe, a freelance Java/Spring developer from Belgium. Its main purpose is sharing knowledge: practical write-ups of what he learns and builds. Book/course sales, newsletter growth and professional visibility are welcome side effects, not the primary goal. Success means a reader leaves with their problem solved and a reason to trust the next post.

## Positioning

Written by a working practitioner: practical, battle-tested, production-ready Spring Boot code drawn from real projects, not tutorials written for their own sake. The same person also maintains the open-source libraries and writes the books on these topics.

## Operating Context

- Readers arrive deep-linked on a post, usually from search; the homepage is a secondary entry point for followers.
- Posts are long-form technical articles with substantial code listings, headings, and occasional images.
- New posts and release announcements also go out through the newsletter (EmailOctopus).

## Capabilities and Constraints

- Static site built with Hugo; posts are AsciiDoc rendered by external Asciidoctor with Rouge highlighting. Deployed on Netlify.
- ~130 posts from 2010 to today. Post URLs (`/blog/YYYY/MM/DD/<slug>/`, pre-2021 aliases, `/tags/<tag>/`, RSS at `/blog/index.xml`) must never change.
- Full-text search via Pagefind; type-anywhere search on the homepage.
- Pages: homepage (post list), blog post, tag pages, About, Books, Projects, Conferences, newsletter confirmation, 404.
- Each post shows at most one tag-driven book/course ad (`data/ads.toml`); posts can force or suppress it.
- Newsletter signup via a Netlify function to EmailOctopus.
- Generated social cards per post.

## Brand Commitments

- Name: Wim Deblauwe, personal brand; first-person voice.
- Topic line: "Java · Spring · Thymeleaf · Htmx".
- Products promoted on the site: *Taming Thymeleaf*, *Modern frontends with htmx*, *Crafting Spring Boot Starters* (books) and the *Testing Spring Boot Masterclass* (course).
- Open-source projects, e.g. error-handling-spring-boot-starter.

## Evidence on Hand

- The posts themselves (`content/blog/`), book pages and covers (`content/books/`, `static/images/`), conference talk list (`content/conferences/`), project list (`content/projects/`), author photo (`static/images/wim-deblauwe.jpg`).
- No testimonials, reader counts or subscriber numbers are recorded in the repo; don't invent any.

## Product Principles

1. The post is the product. A reader arriving from search should find the answer fast and read it comfortably; everything else gets out of the way.
2. Practical over promotional. Promotion stays secondary to the knowledge being shared: one relevant ad at most, never interrupting the reading.
3. Code is first-class content. Code listings must be as legible and well presented as the prose.
4. Earn the return visit. Related posts, search and the newsletter give a satisfied searcher a reason to come back, without nagging.
5. Links are permanent. Fifteen years of URLs keep working.
