# Newsletter migration: Mailchimp → EmailOctopus

Status as of 2026-07-27. **Migration complete — 667 subscribers live in EmailOctopus.**
**Wave-1 sent 2026-07-27 from `newsletter@wimdeblauwe.com`, after a test send exposed a
sender-identity bug. Open follow-ups below before wave-2.**
Working files live in `~/Downloads/audience_export_18e5870fbf/` (**not** in this repo — they
contain email addresses and this repo is on GitHub).

## Why this migration

- Mailchimp free tier ended at 250 subscribers; list sat at 741 and went unused.
- EmailOctopus free tier covers up to 2,500 subscribers — 667 fits with room to grow.
- Last campaign sent was **Newsletter December 2024**, i.e. ~19 months of silence.

## What the audit found

| Finding | Detail |
|---|---|
| 741 subscribed | 71 junk (9.6%) + 3 undeliverable removed → **667 clean** |
| Junk sources | 32 on disposable-domain blocklist (`web-library.net` ×12, `wshu.net` ×7, 13 singles); 39 in generated-pattern clusters (`testform.xyz` ×12, `rightbliss.beauty` ×9, `formtest.guru` ×6, `do-not-respond.me` ×6, plus 3 pairs) |
| **List is single opt-in** | `CONFIRM_TIME` == `OPTIN_TIME` and `CONFIRM_IP` empty on all 741 rows — there is no confirmation step, so bots land straight in "subscribed" |
| **~511 of 667 never received any email** | They signed up after the Dec 2024 send |
| Bots now outpace humans | 2026: 23 junk signups vs 14 real |
| Consent record | `OPTIN_TIME` + `OPTIN_IP` present for all — adequate, but no double opt-in confirmation |
| 3 undeliverable | MX check found `outlookc.om` (typo), `warunkpedia.com`, `mailvn.top`. Two were in wave-1 — would have meant a **4.8% bounce rate on the first send**. Deleted. |

## Done

- [x] Export audience from Mailchimp
- [x] Classify and remove junk → `newsletter-clean-670.csv`, `newsletter-junk-71.csv`
- [x] Build import files → `emailoctopus-import-670.csv`, `emailoctopus-suppress.csv`
- [x] Create EmailOctopus account
- [x] Verify sending domain (SPF/DKIM) in EmailOctopus
- [x] Import the 670 + the 11-address suppression list
- [x] Repoint signup form at `/api/subscribe` (step 4)
- [x] Add `netlify/functions/subscribe.mjs` with blocklist + MX check + double opt-in (step 5)
- [x] Set `EMAILOCTOPUS_API_KEY` + `EMAILOCTOPUS_LIST_ID` in Netlify
- [x] Enable double opt-in on the EmailOctopus list (step 6)
- [x] MX-check all 670; delete the 3 undeliverable → **667**
- [x] Confirm all contacts are status `subscribed`, not `pending`

## 2026-07-27 — test send landed in spam. Root cause found and fixed.

The pre-send test (to my own address only — **no subscribers were mailed**) was delivered
but filed as **spam** by Gmail. The step-3 "send a test to yourself" rule is what caught
this before it reached anyone.

**The test was not sent from the verified domain.** The From address was set to
`wim.deblauwe@gmail.com`. EmailOctopus cannot sign as `gmail.com` (Gmail publishes DMARC
`p=reject`), so it silently rewrote the header to its own shared domain:

```
From: Wim Deblauwe <wim.deblauwe.gmail.com@send.eomail5.com>
DKIM-Signature: d=sp.eomail5.com; s=scph0720
dmarc=pass (p=NONE) header.from=send.eomail5.com
```

SPF, DKIM and DMARC all *passed* — but for `eomail5.com`, not for `wimdeblauwe.com`. The
DNS set up in step 1 (`eo._domainkey.wimdeblauwe.com`, `eom.wimdeblauwe.com`) was never
used. Verified against live DNS: both records are correct and in place.

Why Gmail filtered it — nothing in the message corroborated the identity it claimed:

| Signal | Value |
|---|---|
| Display name | Wim Deblauwe |
| From domain | `send.eomail5.com` — shared across free-tier senders |
| Body claims | "You signed up for this newsletter on wimdeblauwe.com" |
| Every link | `sptr.eomail5.com` (shared click-tracking domain) |
| Reply-To | `wim.deblauwe@gmail.com` |
| Recipient | `wim.deblauwe@gmail.com` |

A message to your own address, claiming to be you, from an unrelated bulk domain. That
reads as phishing, and it outweighs the cold-domain reputation problem.

### Fixed

- [x] **From address → `newsletter@wimdeblauwe.com`.** The change that resolved it.
      DKIM now signs `d=wimdeblauwe.com`, Return-Path is `eom.wimdeblauwe.com`, DMARC
      aligns, and the From domain matches the site the content is about. Re-tested and
      confirmed inboxing — **wave-1 (40 contacts) then went out on 2026-07-27.**
- [x] **Reply-To → `wim.deblauwe@gmail.com`** (a mailbox actually read — see step 3).
- [x] **Physical address set in EmailOctopus account settings**, before the wave-1 send.
      `{{SenderInfo}}` had been unconfigured and was rendering the literal placeholder
      *"EO Physical Return Address, 86-90 Paul Street, London EC2A 4NE"* — EmailOctopus's
      own registered office, shared by thousands of entities and well known to filters.

- [x] **Double opt-in confirmation sender.** Configured **separately** from the campaign
      sender, in list settings → *Consent & customisation*. It kept the old gmail address
      after the campaign was fixed, so confirmations were still going out rewritten to
      `send.eomail5.com`. Nothing in this repo controls it — `subscribe.mjs` sends only
      `email_address`, `status`, `tags`, so the sender comes entirely from EmailOctopus.
      **The sender address is configured in two independent places. Check both.**
      A spam-foldered *confirmation* is worse than a spam-foldered campaign: signups sit at
      `pending` forever and nothing signals that it happened.
- [x] **MX + SPF on `wimdeblauwe.com`** (2026-07-27), so `newsletter@` is a real deliverable
      address rather than just a header value, forwarding to Gmail via ImprovMX:
      ```
      wimdeblauwe.com.  MX   10 mx1.improvmx.com
      wimdeblauwe.com.  MX   20 mx2.improvmx.com
      wimdeblauwe.com.  TXT  "v=spf1 include:eu.sparkpostmail.com include:spf.improvmx.com ~all"
      ```
      **One SPF record only** — a second `v=spf1` TXT causes a `permerror`, worse than none.
      Hence both includes merged into one. Verified: 3 DNS lookups, limit is 10. Apex SPF
      isn't needed for DMARC (the envelope uses `eom`), but filters do look it up for the
      visible From domain. No catch-all alias — the domain is public, it would collect junk.
      **Forward tested and working** — mail to `newsletter@wimdeblauwe.com` reaches Gmail.

### Custom click-tracking domain — already configured, was never the problem

`eot.wimdeblauwe.com` (EmailOctopus Tracking) has been in place since setup, alongside
`eo._domainkey` (DKIM), `eom` (return-path) and `111452827` (verification). It resolves
through `stp.eoidentity.com` to EmailOctopus's tracking proxy.

Wave-1's links went through shared `sptr.eomail5.com` **not** because the record was
missing, but because sending from the unverified gmail-based From address bypassed the
entire verified-domain configuration at once — DKIM, return-path *and* tracking. Fixing
the From address switches all three over together.

- [ ] Confirm on the next send that link hrefs point at `eot.wimdeblauwe.com`, not
      `sptr.eomail5.com`.

### DMARC `rua=` reporting — deliberately skipped

`_dmarc.wimdeblauwe.com` stays at `v=DMARC1; p=none;` with no reporting address. It would
**not** have caught the wave-1 bug — that mail's From was `send.eomail5.com`, so its reports
went to EmailOctopus, not here. Authentication is confirmed working by direct header
inspection, which is the check that actually mattered.

Revisit if any of these happen:

- Deliverability problems that header inspection on a single test send can't explain
- Adding another service that sends as `@wimdeblauwe.com` (more sources = more to go wrong
  silently)
- Wanting to tighten `p=none` → `p=quarantine`/`p=reject`. **Do not tighten without
  reporting first** — enforcement without visibility means legitimate mail gets rejected
  and you find out from the recipient, not from a report.

If picked up later, the non-obvious part: because the `rua` mailbox is on a *different*
domain, RFC 7489 requires the receiving domain to authorise it, or Google/Microsoft/Yahoo
silently refuse to send anything:

```
_dmarc.wimdeblauwe.com.                   TXT  "v=DMARC1; p=none; rua=mailto:wim.deblauwe@widit.be"
wimdeblauwe.com._report._dmarc.widit.be.  TXT  "v=DMARC1"
```

Postmark's free DMARC Digests (`dmarc.postmarkapp.com`) avoids the second record — it
publishes a wildcard authorisation and sends a weekly readable summary instead of raw XML.
`widit.be` already has `rua` pointing at itself, which is why reports already arrive for
*that* domain and not this one.

### Watch before committing to wave-2

Per step 3, wave-2 is gated on wave-1's numbers: **bounces under ~2%** (under 1 hard bounce
in 40) and **complaints under 0.1%**. With 40 contacts a single spam complaint is 2.5%, so
read the rate as "any complaint at all is worth pausing over", not as a percentage.

Open rate is the other signal — these 40 are the friendliest segment (28 previously
engaged + 2026 signups). If they open well, the domain starts building reputation and
wave-2 is safer. If they don't, the cold-domain problem is still live and wave-2 at 495
should wait.

Remaining after that: wave-2, wave-3, then step 7.

---

## Step 1 — Import the 670 *(done)*

Upload `emailoctopus-import-670.csv`. In the column-mapping screen every column except
the email address defaults to *"Ignore (do not import)"*, so map these four by hand:

| Column | Map to | Field type |
|---|---|---|
| `Email address` | email address | automatic |
| `Signup date` | new custom field | **date** |
| `Signup IP` | new custom field | text |
| `Country` | new custom field | text |
| `Tags` | **"Import comma-separated tags"** | — not a custom field |

- The Tags mapping is its own dropdown option. Miss it and one contact gets tagged with
  the literal string `never-emailed,wave-2,mailchimp-import`.
- Dates are `YYYY-MM-DD`. Date format is the most common import failure.
- Set status to **Subscribed**.

## Step 2 — Import the suppression list

Separate import of `emailoctopus-suppress.csv` (8 unsubscribed + 3 bounced), status
**Unsubscribed**. Easy to skip; don't. It carries the Mailchimp opt-outs across so nobody
who already left can be re-mailed.

## Step 3 — Send in waves, not all at once

514 people have never heard from you and the account is new. A single 670-blast risks
complaints and bounces that can get a fresh account suspended. Send to a **tag segment**:

| Segment | Size | Content |
|---|---|---|
| `wave-1` | **40** | Re-introduction. The 28 previously-engaged + 2026 signups — friendliest audience. |
| `wave-2` | 495 | The 2025 cohort. Open with "you subscribed in \<month\> 2025". |
| `wave-3` | 132 | 2020–2024 leftovers, coldest. Re-permission only; drop non-openers. |

Also available: `engaged` (28), `never-emailed` (~511), `mailed-before` (~156).

Between waves check: **bounces under ~2%, complaints under 0.1%**. If wave 1 looks clean,
continue. If 40 addresses bounce hard, stop and diagnose before burning 495 more.

Before each send: send a test to yourself, and make sure reply-to is a mailbox you read —
after 19 months you will get "who are you?" replies worth answering.

**Also check the From address is on `wimdeblauwe.com`, every time.** Setting it to an
address on a domain EmailOctopus cannot sign for makes it silently rewrite the header to
its own shared domain, which is what put wave-1 in spam. Verify in the test message's
`Authentication-Results`: it must read `header.from=wimdeblauwe.com`, not `eomail5.com`.

## Steps 4 & 5 — Signup form and hardening *(done)*

The Mailchimp honeypot never worked: bots POST directly to the public `list-manage.com`
endpoint and never render the page, so the hidden field is simply absent. The fix had to be
server-side.

**Files changed**

| File | Change |
|---|---|
| `layouts/partials/newsletter-signup-form.html` | posts to `/api/subscribe`; field renamed `EMAIL` → `email`; honeypot renamed `website_url`; dropped `target="_blank"`; added status message + fetch submit |
| `netlify/functions/subscribe.mjs` | the endpoint |
| `netlify/functions/disposable-domains.mjs` | 8,168-domain blocklist, generated (refresh command in its header) |
| `assets/css/main.css` | `.newsletter-status` styling |

**Flow**

```
browser form
  ↓ POST /api/subscribe   { email, website_url }
function:
  1. honeypot filled?              → report success, do nothing
  2. malformed address?            → reject
  3. domain on blocklist?          → reject   (8,168 public + 7 local)
  4. domain has no MX record?      → reject   (fails open on transient DNS errors)
  5. POST to EmailOctopus, status "pending"  → double opt-in email
  ↓
"Almost there — check your inbox…"
```

Notes on the implementation:

- **The public blocklist wasn't enough.** Only 32 of the 71 junk entries were on it; the
  other 39 came from `testform.xyz`, `rightbliss.beauty`, `formtest.guru`,
  `do-not-respond.me`, `silesia.life`, `mailfroms.info`, `hubmail.info`. Those are hardcoded
  in `EXTRA_BLOCKED` in `subscribe.mjs` — add to it as new clusters appear.
- **The MX check earns its keep**: it rejects `pmanvi@outlookc.om`, a typo'd `outlook.com`
  that is currently sitting in the imported list.
- **`POST` not `PUT`.** A 409 (already subscribed) returns the *same* message as success, so
  the endpoint can't be used to test whether an address is on the list. `PUT` would upsert
  and could resurrect someone from the suppression list.
- Works without JavaScript — the function returns a plain HTML page for non-`fetch` posts.
- Verified: 7 logic cases pass, Hugo builds, layout checked at desktop and 390px.
- **Cloudflare Turnstile is deliberately deferred.** All 71 junk entries would have been
  caught by checks 3–4 alone. At ~23 bots/year, adding a widget to a form already converting
  at ~0.1% isn't worth the friction. Add only if junk keeps arriving: client widget → hidden
  `cf-turnstile-response` → verify at
  `https://challenges.cloudflare.com/turnstile/v0/siteverify`.

## Step 6 — Double opt-in *(done)*

Enabled on the list, so `status: "pending"` from the function triggers a confirmation email.
Existing contacts were verified as `subscribed`, not `pending`. This is the root-cause fix
for the bot problem.

**The confirmation email has its own sender setting**, in list settings → *Consent &
customisation*, independent of the campaign sender. Changing one does not change the other.
See the 2026-07-27 section above — this bit the wave-1 send twice.

## Step 7 — Decommission Mailchimp

1. Delete the 71 from `newsletter-junk-71.csv` (audit the reasons column first).
2. Confirm EmailOctopus is receiving new signups.
3. Close the Mailchimp account.

## Follow-up: growth, not ads

Signup history shows a large spike — **474 signups May–Sep 2025, peaking at 164 in July
2025** — then a fall back to ~2/month. Against ~2K monthly users that's roughly **0.1%
conversion**, where 0.5–2% is typical.

Something in mid-2025 worked very well. Finding out what is worth more than any display-ad
revenue: at ~3–5K pageviews/month, AdSense would pay roughly $3–15/month, wouldn't qualify
for Mediavine (50K sessions) or Raptive (100K pageviews), and would force a cookie-consent
banner onto a currently tracker-light site. The three product placements already in
`layouts/blog/single.html` are worth far more per visitor — one Leanpub sale ≈ two to three
years of AdSense at this traffic.

Cheap wins there:
- Instrument the book placements (CTR / Leanpub referrals) — currently unmeasured.
- Order them by post tag instead of fixed order, so a Thymeleaf post leads with
  *Taming Thymeleaf*.
- Add GitHub Sponsors links on the OSS repos and in the site footer.