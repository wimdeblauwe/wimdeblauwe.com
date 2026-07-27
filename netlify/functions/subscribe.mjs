// Newsletter signup endpoint.
//
// Replaces the old form that POSTed straight to Mailchimp's public
// list-manage.com URL. That endpoint could be POSTed to directly, so the
// client-side honeypot never ran: 71 of 741 subscribers turned out to be bots.
//
// Required Netlify environment variables:
//   EMAILOCTOPUS_API_KEY   API v2 key (keep secret — server-side only)
//   EMAILOCTOPUS_LIST_ID   target list id

import { promises as dns } from "node:dns";
import { disposableDomains } from "./disposable-domains.mjs";

const API_BASE = "https://api.emailoctopus.com";

// Domains seen abusing this form that the public blocklist does not carry.
// All appeared as clusters of machine-generated local parts.
const EXTRA_BLOCKED = new Set([
  "testform.xyz",
  "formtest.guru",
  "do-not-respond.me",
  "rightbliss.beauty",
  "silesia.life",
  "mailfroms.info",
  "hubmail.info",
]);

const EMAIL_RE =
  /^[^\s@,;:<>()[\]\\"]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

// One message for every accepted path, so the endpoint can't be used to test
// whether an address is already on the list.
const OK = "Almost there — check your inbox and click the confirmation link.";

export default async (req) => {
  if (req.method !== "POST") {
    return reply(req, 405, "Method not allowed.", false);
  }

  const { email, trap } = await readBody(req);

  // Naive bots fill every field. Report success without doing anything.
  if (trap) return reply(req, 200, OK, true);

  const address = String(email ?? "").trim().toLowerCase();
  if (!address || !EMAIL_RE.test(address) || address.length > 254) {
    return reply(req, 400, "That doesn't look like a valid email address.", false);
  }

  const domain = address.slice(address.lastIndexOf("@") + 1);
  if (disposableDomains.has(domain) || EXTRA_BLOCKED.has(domain)) {
    return reply(
      req,
      400,
      "Please use a permanent email address — disposable addresses aren't accepted.",
      false,
    );
  }

  if (!(await hasMx(domain))) {
    return reply(
      req,
      400,
      `No mail server found for "${domain}". Is there a typo in the address?`,
      false,
    );
  }

  const apiKey = process.env.EMAILOCTOPUS_API_KEY;
  const listId = process.env.EMAILOCTOPUS_LIST_ID;
  if (!apiKey || !listId) {
    console.error("Missing EMAILOCTOPUS_API_KEY or EMAILOCTOPUS_LIST_ID");
    return reply(req, 500, "Signup is temporarily unavailable. Sorry!", false);
  }

  let res;
  try {
    res = await fetch(`${API_BASE}/lists/${listId}/contacts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      // "pending" triggers the double opt-in confirmation email.
      body: JSON.stringify({
        email_address: address,
        status: "pending",
        tags: ["website-signup"],
      }),
    });
  } catch (err) {
    console.error("EmailOctopus request failed:", err);
    return reply(req, 502, "Couldn't reach the mailing list. Please try again.", false);
  }

  // 409 = already on the list. Same response as success, deliberately.
  if (res.ok || res.status === 409) return reply(req, 200, OK, true);

  console.error(`EmailOctopus ${res.status}: ${await res.text().catch(() => "")}`);
  return reply(req, 502, "Couldn't add you just now. Please try again.", false);
};

async function readBody(req) {
  const type = req.headers.get("content-type") ?? "";
  try {
    if (type.includes("application/json")) {
      const json = await req.json();
      return { email: json.email, trap: json.website_url };
    }
    const form = new URLSearchParams(await req.text());
    return { email: form.get("email"), trap: form.get("website_url") };
  } catch {
    return {};
  }
}

// Rejects domains that definitively have no mail server. Transient DNS errors
// fail open — better to accept a questionable address than to block a real
// person because a resolver hiccuped.
async function hasMx(domain) {
  try {
    const records = await dns.resolveMx(domain);
    return records.length > 0;
  } catch (err) {
    if (err.code === "ENOTFOUND" || err.code === "ENODATA") return false;
    console.warn(`MX lookup failed for ${domain}: ${err.code}`);
    return true;
  }
}

// JSON for fetch callers, a minimal HTML page for no-JS form submissions.
function reply(req, status, message, ok) {
  const accept = req.headers.get("accept") ?? "";
  if (accept.includes("application/json")) {
    return Response.json({ ok, message }, { status });
  }
  const safe = message.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return new Response(
    `<!doctype html><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Newsletter</title>
<div style="font:16px/1.6 system-ui,sans-serif;max-width:34rem;margin:20vh auto;padding:0 1.5rem;text-align:center;color:#1b2531">
  <p>${safe}</p>
  <p><a href="/" style="color:#c2702e">← Back to wimdeblauwe.com</a></p>
</div>`,
    { status, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

export const config = { path: "/api/subscribe" };