// Hugo writes each post's Markdown twin (<slug>/index.md) with the rendered
// Asciidoctor HTML between <!--html-to-markdown BASE-->
// markers. This turns those regions into Markdown and moves each twin to
// <slug>.md, the URL the templates link to.
// Run after `hugo`: node scripts/html-to-markdown.mjs public
import { readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

const MARKER = /<!--html-to-markdown (\S+)-->\n?([\s\S]*?)<!--\/html-to-markdown-->/g;

function createConverter(base) {
  const td = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
    emDelimiter: "_",
  });
  td.use(gfm);

  const absolute = (url) => {
    try {
      return new URL(url, base).href;
    } catch {
      return url;
    }
  };

  // Section anchors, the in-page TOC and the lightbox wrappers add nothing in Markdown.
  td.remove((node) => node.nodeName === "A" && node.classList.contains("anchor"));
  td.remove((node) => node.id === "toc");
  td.remove(["script", "style"]);

  // Asciidoctor wraps list item and table cell text in <p>; keep those inline
  // so lists stay tight and table rows stay on one line.
  td.addRule("inline-paragraph", {
    filter: (node) =>
      node.nodeName === "P" &&
      (node.parentNode.nodeName === "TD" ||
        node.parentNode.nodeName === "TH" ||
        (node.parentNode.nodeName === "LI" && !node.previousElementSibling)),
    replacement: (content, node) => {
      if (node.parentNode.nodeName === "LI") return content.trim();
      return content.trim() + (node.nextElementSibling ? "<br>" : "");
    },
  });

  // Turndown's default pads list markers to four characters ("-   item").
  td.addRule("list-item", {
    filter: "li",
    replacement: (content, node) => {
      const parent = node.parentNode;
      let prefix = "- ";
      if (parent.nodeName === "OL") {
        const start = Number(parent.getAttribute("start") ?? 1);
        prefix = `${start + Array.from(parent.children).indexOf(node)}. `;
      }
      const body = content
        .replace(/^\n+/, "")
        .replace(/\n+$/, "\n")
        .replace(/\n/gm, "\n" + " ".repeat(prefix.length));
      return prefix + body + (node.nextSibling && !/\n$/.test(body) ? "\n" : "");
    },
  });

  td.addRule("code-block", {
    filter: (node) => node.nodeName === "PRE",
    replacement: (_content, node) => {
      const code = node.querySelector("code");
      const lang = code?.getAttribute("data-lang") ?? "";
      const text = (code ?? node).textContent.replace(/\n+$/, "");
      const fence = text.includes("```") ? "````" : "```";
      return `\n\n${fence}${lang}\n${text}\n${fence}\n\n`;
    },
  });

  // Asciidoctor block titles (above listings, images, tables, ...).
  td.addRule("block-title", {
    filter: (node) => node.nodeName === "DIV" && node.classList.contains("title"),
    replacement: (content) => (content.trim() ? `\n\n**${content.trim()}**\n\n` : ""),
  });

  // NOTE/TIP/WARNING/... tables become GitHub-style alerts.
  td.addRule("admonition", {
    filter: (node) => node.nodeName === "DIV" && node.classList.contains("admonitionblock"),
    replacement: (_content, node) => {
      const type = node.getAttribute("class").split(/\s+/).find((c) => c && c !== "admonitionblock") ?? "note";
      const body = td.turndown(node.querySelector("td.content")?.innerHTML ?? "").trim();
      const quoted = body.split("\n").map((line) => (line ? `> ${line}` : ">")).join("\n");
      return `\n\n> [!${type.toUpperCase()}]\n${quoted}\n\n`;
    },
  });

  // Code callout explanations (a two-column table) become a numbered list.
  td.addRule("callout-list", {
    filter: (node) => node.nodeName === "DIV" && node.classList.contains("colist"),
    replacement: (_content, node) => {
      const items = Array.from(node.querySelectorAll("tr")).map((row, i) => {
        const cells = row.querySelectorAll("td");
        const text = td.turndown(cells[cells.length - 1]?.innerHTML ?? "").trim();
        return `${i + 1}. ${text.replace(/\n/g, "\n   ")}`;
      });
      return `\n\n${items.join("\n")}\n\n`;
    },
  });

  td.addRule("iframe", {
    filter: "iframe",
    replacement: (_content, node) => {
      const src = node.getAttribute("src");
      return src ? `\n\n[Embedded video](${absolute(src)})\n\n` : "";
    },
  });

  td.addRule("absolute-links", {
    filter: (node) => node.nodeName === "A" && node.getAttribute("href"),
    replacement: (content, node) => {
      const href = node.getAttribute("href");
      if (!content.trim()) return "";
      return `[${content}](${href.startsWith("#") ? href : absolute(href)})`;
    },
  });

  td.addRule("absolute-images", {
    filter: "img",
    replacement: (_content, node) => {
      const src = node.getAttribute("src");
      return src ? `![${node.getAttribute("alt") ?? ""}](${absolute(src)})` : "";
    },
  });

  return td;
}

const FENCED_CODE = /(^`{3,4}.*\n[\s\S]*?^`{3,4}$)/m;

// Drop whitespace-only lines and runs of blank lines, but leave code blocks untouched.
function tidy(markdown) {
  return markdown
    .split(FENCED_CODE)
    .map((part, i) => (i % 2 ? part : part.replace(/^[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n")))
    .join("")
    .trim();
}

function toMarkdown(base, html) {
  return tidy(createConverter(base).turndown(html));
}

function convert(text) {
  return text.replace(MARKER, (_match, base, html) => toMarkdown(base, html) + "\n");
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

const root = process.argv[2] ?? "public";
let count = 0;
for await (const file of walk(root)) {
  if (!file.endsWith(".md")) continue;
  const text = await readFile(file, "utf8");
  if (!text.includes("<!--html-to-markdown ")) continue;
  await writeFile(`${dirname(file)}.md`, convert(text));
  await rm(file);
  count++;
}
console.log(`html-to-markdown: converted ${count} files in ${root}`);
