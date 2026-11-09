import type { Config, Context } from "@netlify/edge-functions";

// Content negotiation for AI agents. A request with `Accept: text/markdown`
// gets the Markdown twin of a page (or llms.txt for the homepage)
// instead of the HTML. Markdown responses carry a Link header pointing at
// the canonical HTML page.
export default async (request: Request, context: Context) => {
  const url = new URL(request.url);

  if (url.pathname.endsWith(".md")) {
    const response = await context.next();
    if (!response.ok) return response;
    const canonical = new URL(url.pathname.replace(/\.md$/, "/"), url);
    return withHeaders(response, {
      "Content-Type": "text/markdown; charset=utf-8",
      "Link": `<${canonical.href}>; rel="canonical"`,
      "Vary": "Accept",
    });
  }

  if (wantsMarkdown(request)) {
    const target = url.pathname === "/" ? "/llms.txt" : url.pathname.replace(/\/$/, "") + ".md";
    const markdown = await fetch(new URL(target, url));
    if (markdown.ok) {
      return withHeaders(markdown, {
        "Content-Type": "text/markdown; charset=utf-8",
        "Link": `<${url.href}>; rel="canonical"`,
        "Vary": "Accept",
      });
    }
  }

  const response = await context.next();
  const headers: Record<string, string> = { "Vary": "Accept" };
  if (url.pathname === "/") headers["Link"] = `</llms.txt>; rel="alternate"; type="text/plain"`;
  return withHeaders(response, headers);
};

function wantsMarkdown(request: Request): boolean {
  return (request.headers.get("accept") ?? "").toLowerCase().includes("text/markdown");
}

function withHeaders(response: Response, headers: Record<string, string>): Response {
  const result = new Response(response.body, response);
  for (const [name, value] of Object.entries(headers)) result.headers.set(name, value);
  return result;
}

export const config: Config = {
  path: [
    "/",
    "/blog/*",
    "/books/*",
    "/books.md",
    "/about/",
    "/about.md",
    "/projects/",
    "/projects.md",
    "/conferences/",
    "/conferences.md",
  ],
};
