# Newsletter migration: Mailchimp → EmailOctopus

Status as of 2026-08-21. **All three waves sent, wave-3 pruned, list at 102 real contacts.
The urgent item is now the signup form: a bot campaign is hitting it live** — 33 signups in
the 20 hours to 2026-08-21T03:00Z, against a ~2/month baseline. See *The form is under
attack*.
**Wave-1 sent 2026-07-27** from `newsletter@wimdeblauwe.com`, after a test send exposed a
sender-identity bug: 0 bounces, 40% opens.
**Wave-2 sent 2026-07-28** (495 contacts, `newsletter-wave-2.html`) and **bounced at
37.4%** — the 2025 cohort is a bot signup campaign, not an audience. **285 bot contacts
purged 2026-07-31**, leaving **207 subscribed**. (667 imported − 174 bounce-suppressed − 1
unsubscribed − 285 deleted. Only 174 of the 185 bounces suppressed themselves; the other 11
were soft bounces that stayed `subscribed` and went out with the purge.)
**Wave-3 sent as a 30 + 100 canary split** (2026-07-31, 2026-08-03) and produced **26
clickers out of 130 sent**, 0 complaints. **Pruned 2026-08-21** to those 26. The list is now
**102 subscribed** (40 wave-1, 35 wave-2 survivors, 26 wave-3, 1 website signup) — small,
but every wave-3 contact on it clicked something this month.
The "667 subscribers" figure was never real; see *The 2025 cohort is fake*.
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

- [x] Confirm on the next send that link hrefs point at `eot.wimdeblauwe.com`, not
      `sptr.eomail5.com`. **Verified in the delivered wave-1 mail (2026-07-28)** — the
      From-address fix did switch DKIM, return-path and tracking over together, as expected.

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

### Wave-1 result (measured 2026-07-28, ~24h after send)

| Metric | Value | Gate | Verdict |
|---|---|---|---|
| Opens | **16 / 40 = 40%** | — (signal, not a gate) | Strong. 20–30% is typical; the cold-domain problem is not live. |
| Bounces | **0** | under ~2% (i.e. 0 of 40) | Pass |
| Complaints | **no figure shown in EmailOctopus** | under 0.1% | See below |

EmailOctopus surfaces no complaint count on this report. Absence of the metric is not the
same as a measured zero — read the **unsubscribe count** as the proxy, since a Gmail/Outlook
"report spam" click lands as an unsubscribe here. With 0 bounces and 40% opens the send is
clearly healthy, so wave-2 was approved on that basis.

> **Superseded 2026-07-31.** The proxy was only ever needed because the *UI* hides the
> figure; the **API exposes complaints directly** — `GET /campaigns/{id}/reports?status=
> complained`. Use that. The proxy is also now broken on this list: 185 of its 186
> unsubscribes are bounces. See *Account standing* under wave-2.
>
> The deeper error was not the metric but the inference. Wave-1 was the previously-engaged
> segment — structurally the one cohort that could not contain 2025 bot signups. "Wave-1
> was clean, so wave-2 was approved on that basis" is the reasoning that let 495 go out.
> A clean send to your friendliest 40 says nothing about the 495 behind it.

*(The gate this replaced: bounces under ~2% — under 1 hard bounce in 40 — and complaints
under 0.1%. With 40 contacts a single complaint is 2.5%, so it was read as "any complaint at
all is worth pausing over", not as a percentage.)*

## 2026-07-28 — wave-2 sent (495 contacts)

`newsletter-wave-2.html`, to tag `wave-2`. Content differs from wave-1 because this cohort
has **never** received anything: the opener says so directly, states what the newsletter is
and its cadence, and makes the unsubscribe explicit — with a 1–2 year gap between signup and
first email, that line is what turns a would-be spam complaint into an unsubscribe.

Only part 1 of the Thymeleaf series is linked; parts 2–4 are still `draft: true` (dated
2026-08-03/10/17) and their URLs 404. All other linked URLs verified 200 before sending.

The plan's "you subscribed in \<month\> 2025" opener (step 3) was **not** used — the
`Signup date` custom field is a date type and EmailOctopus merge tags substitute raw values
without formatting, so `{{SignupDate}}` renders `2025-07-14`, not `July 2025`. Copy says
"sometime in 2025" instead. A month-name opener would need a separate **text** custom field
populated from the CSV at import time.

### Wave-2 result (measured 2026-07-31, ~72h after send) — FAILED

| Metric | Value | Gate | Verdict |
|---|---|---|---|
| Bounces | **185 / 495 = 37.4%** | under ~2% (under 10 of 495) | **Fail, by ~18×** |
| Unsubscribes | 1 / 310 delivered = 0.32% | watch for a spike | Pass |
| Opens | 47 / 310 delivered = 15.2% (9.5% of sent) | no gate | Meaningless here — see below |

The recipients who existed behaved fine. One unsubscribe out of 310 is a healthy number,
and it means the "you signed up a year ago" framing worked. **The list is what failed.**

Treat the 47 opens as an upper bound on humans, not a count of them: open tracking is a
pixel load, and Gmail image proxying, security scanners and Apple MPP all inflate it.
Delivered ≠ real, either — Gmail accepts-then-discards for some invalid mailboxes rather
than bouncing, so the true bot share is *higher* than 37.4%, not lower.

## The 2025 cohort is fake

The mid-2025 signup spike was a bot campaign. Wave-2 was that spike, and it is why the
send bounced. From `emailoctopus-import-670.csv`, wave-2's 495 contacts:

| Signal | Measured | What a real audience looks like |
|---|---|---|
| Domains | 386 gmail + 91 yahoo = **96.4%** | long tail of corporate/EU/self-hosted — there are ~18 |
| Local-part shape | **318 (67%)** match `name` + exactly 2 digits | mixed `first.last`, initials, handles |
| Distinct signup IPs | **489 of 495** — near-zero reuse | organic traffic repeats IPs |
| Geography | IN 64, BR 60, VN 37, **KH 37**, ID 28, ZA 24, BD 23, KE 16 | EU/US-weighted, for a Belgian Spring/Thymeleaf blog |
| Signup months | 52 / 109 / **164** / 86 / 63 across May–Sep 2025 | not a 5-month rectangular pulse |

91 yahoo.com addresses on a modern Java blog, and Cambodia as the #4 country, are not
plausible. Near-zero IP reuse across 495 signups is *more* damning than reuse would be —
it means a residential-proxy network was rotating exits per request.

**Every check in `subscribe.mjs` passed these.** gmail.com and yahoo.com are not on the
disposable blocklist; the generated names were varied enough to dodge the pattern
clusters; and `resolveMx` (line 122) resolves the **domain**, so `anything@gmail.com`
passes validation and then hard-bounces at the mailbox. Domain-level MX cannot detect
this class of address. Only mailbox-level verification or a challenge at signup can.

### What this costs

- **Gmail reputation.** 386 of the 495 targeted gmail.com, and most did not exist. A
  sender blasting hundreds of non-existent Gmail mailboxes on its second-ever send is
  behaviourally identical to a dictionary spam attack. This is the worst possible event
  for a domain still warming, and it is the real damage — worse than the bounce number.
- **Account standing.** 37.4% is far above the ~5% that triggers automated ESP review.
  **Check whether EmailOctopus has flagged or suspended the account — do this first.**
- **The list.** Provable humans across all sends: 16 wave-1 openers + at most 47 wave-2
  openers ≈ **63**, against a nominal 667. Wave-3's 132 (2020–2024) predate the attack
  and are probably genuine, but are 4–6 years stale and untested.

### Account standing — checked 2026-07-31, OK

Not suspended, not flagged. **186 contacts moved to `unsubscribed`** = the 185 bounces
plus the 1 genuine unsubscribe.

EmailOctopus's contact-status enum is only `subscribed` / `unsubscribed` / `pending` —
**there is no "bounced" contact status**, so bounces have nowhere else to go. `bounced`
exists only as a *campaign report* status, not on the contact record.

Two consequences:

- **~11 bounced addresses are still `subscribed` and will bounce again.** 495 wave-2
  contacts − 320 still subscribed = 175 that left the subscribed state, one of which is
  the genuine unsubscriber. So ~174 contacts were suppressed by bouncing, against **185
  bounce events** — the ~11 soft bounces stayed put. (The list's 186 unsubscribed = those
  175 + the 11-address Mailchimp suppression list imported in step 2.)
  **Correction:** an earlier revision of this section claimed hard-vs-soft didn't matter
  because everything collapses to `unsubscribed`. Only *hard* bounces do. `wave2-triage.mjs`
  now marks any survivor appearing in the bounce report as DELETE, above every keep rule.
- **The unsubscribe count is dead as a complaint proxy.** Wave-1's section and the wave-2
  watch table both lean on it, because the UI report shows no complaint figure. With 185
  of 186 unsubscribes being bounces, that reading is now meaningless. **Use the API
  instead — it exposes complaints directly**, which the UI does not:

  ```
  GET /campaigns/{id}/reports?status=complained   # the real complaint count
  GET /campaigns/{id}/reports?status=opened       # the 47 openers, with addresses
  GET /campaigns/{id}/reports?status=bounced      # the 185, with addresses
  GET /lists/{id}/contacts?tag=wave-2&status=subscribed   # the 310 survivors
  ```

### Measured engagement — wave-2 produced at most one human

Pulled via API on 2026-07-31 (`wave2-triage.mjs audit`), none of it visible in the UI:

| Report | Count | Reading |
|---|---|---|
| complained | **0** | Nobody marked it spam |
| unsubscribed | 1 | The genuine one |
| opened | 47 | **20 (43%) are bot-shaped** — pixel loads, not readers |
| clicked | **2** | **1 of the 2 is bot-shaped** — consistent with link-scanning (Proofpoint, Outlook ATP) |

**Out of 495 sent, one click that plausibly came from a person.** There is no audience to
salvage in this cohort.

**Zero complaints is the good news, and it matters for recovery.** The damage is purely
invalid-recipient, not complaint-driven — much the more recoverable of the two failure
modes.

**But do not read it as evidence that the copy works.** An earlier revision of this section
claimed the "you signed up a year ago, here is the unsubscribe" framing had converted
complaints into a clean unsubscribe. It cannot have: at most one human received wave-2, and
bots do not file spam complaints. Zero complaints out of ~1 human is not a result. The only
real human complaint data on record is wave-1's 40 — all previously engaged — which says
nothing about how disengaged strangers react. **The copy is still untested.**

**Do not use opens as a keep signal on this list.** At 43% bot-shaped they are worse than
useless — they would have rescued ~20 bot addresses into the "engaged" segment and carried
the contamination into every future send. `wave2-triage.mjs` ranks address shape above
opens for this reason; only clicks are treated as a signal that a pixel cannot fake.

### Wave-1 and wave-3 are genuine — the attack is confined to 2025

Same measurements as the table above, run against the other 175 contacts:

| Signal | wave-2 (495) | wave-1 + wave-3 (175) |
|---|---|---|
| `name`+2digits | 318 (67%) | **11 (6.3%)** |
| yahoo.com | 91 | **4** |
| Top countries | IN, BR, VN, KH, ID, ZA | **US 23, IN 14, UK 9, NL 8, DE 7, BE 5** |
| Domain tail | ~18 | outlook, icloud, hotmail, yandex, yahoo.gr, wisdomofcode.com |

US/UK/NL/DE/BE with a real provider spread is what this blog's audience should look like.
**Wave-3's 132 are real people** — 4–6 years stale, but not bots. The bot campaign is
bounded to the May–Sep 2025 window.

### Remediation, in order

1. **Send nothing.** Not wave-3, not a "sorry" mail. Another send now compounds it.
2. ~~Check EmailOctopus account standing.~~ Done 07-31, clean.
3. **Purge the wave-2 remnant.** 310 are still marked `subscribed` and only ~47 showed
   any sign of life. The bounces suppressed themselves; **the silent ones did not**, and
   they are the more dangerous half — Gmail accepts-then-discards for some dead mailboxes,
   so a resend to them bounces *less* while hurting reputation *more* (spam placement
   rather than rejection). Keep the openers and the ~18 non-gmail/yahoo; delete the rest.
4. **Set up Google Postmaster Tools** on the apex `wimdeblauwe.com` — that is the DKIM
   `d=` domain, and Google attributes to the DKIM domain when it and SPF differ.
   (`eom.wimdeblauwe.com`, the return-path, is optional and secondary.) Verification is a
   TXT record at the apex; **it is not an SPF record, so it does not conflict with the
   single-`v=spf1` rule above.** This is the monitoring gap, not DMARC `rua` — bounces are
   invalid recipients, not an auth failure, so `rua` would not have caught this.

   **Two limits, so an empty dashboard is not read as good news:**
   - **It does not backfill.** Collection starts at verification, so the 2026-07-28 event
     will never appear there. Set it up anyway — it is insurance against the next one.
   - **It will probably stay empty at this volume.** Google needs meaningful daily volume
     to Gmail (order of 100+/day) before the reputation dashboards populate. A ~172-person
     list sending occasionally will show sparse data or none. **Postmaster Tools cannot
     tell you whether it is safe to send wave-3.**

5. **Seed test before any real send — this is what replaces the dashboard.** Works at any
   volume, and it is the same technique that caught the original sender-identity bug.
   `seed-test.mjs` (in the working dir) adds a `seed-test`-tagged segment, and removes it
   afterwards:

   ```
   node seed-test.mjs add       # reads seed-addresses.txt
   # send a campaign to the seed-test tag, record placement per inbox
   node seed-test.mjs remove    # do not skip — seeds must not linger in the list
   ```

   Seeds are created `subscribed`, not `pending`: double opt-in is on, and a pending
   contact never receives the campaign.

   **Record Inbox / Promotions / Spam per provider. Placement is the signal — not whether
   it arrived.** Weight the set to the real audience (gmail 115, outlook 5, yahoo 4,
   icloud 3, hotmail 3 across wave-1 + wave-3): a Gmail seed matters more than the rest
   combined, then Microsoft, then Yahoo/iCloud, plus `wim.deblauwe@widit.be` for
   corporate filtering.

   **Do not seed `wim.deblauwe@gmail.com`.** It is the campaign Reply-To, and Gmail
   personalises placement around correspondence history — it will inbox regardless of
   domain reputation and report all-clear while strangers get filtered. Use a Gmail
   account with **no** prior correspondence. This is the same error as reading a clean
   wave-1 as evidence about wave-2: testing against the one recipient guaranteed to be
   friendly.
6. **Fix the form before it refills the list** — see the reversed Turnstile decision under
   *Steps 4 & 5*. The hole is still open.
7. Only then wave-3 — and **split it**, see below.

## The form is under attack — found 2026-08-21

Discovered while verifying the prune: **33 contacts sitting at `pending`, every one tagged
`website-signup`, every one created between 2026-08-20T06:30Z and 2026-08-21T02:56Z.** That
is 33 signups in under 21 hours against a ~2/month baseline, plus 5 more from August already
in `unsubscribed`. Two of the 33 share an identical timestamp to the second.

**This is a second bot campaign, in progress now.** It is not the 2025 one resuming — the
shape is different:

| Signal | 2025 campaign (wave-2) | 2026-08 campaign |
|---|---|---|
| Domains | 96.4% gmail + yahoo | 18/33 gmail, then US corporate/gov/edu — `detcog.gov`, `rsd.edu`, `gray.tv`, `phly.com`, `hydro-tex.com`, `ballardexpl.com` |
| Local-part | 67% `name`+2 digits | **3 / 33** |
| Window | 5 months | **21 hours** |

The corporate/gov/edu tail reads as a scraped B2B list rather than generated addresses, and
it defeats every heuristic in `subscribe.mjs`: real domains, real MX, not on any blocklist,
plausible local-parts. Exactly the blind spot recorded under *Steps 4 & 5*.

### What is and isn't working

**Double opt-in is holding.** All 33 are stuck at `pending`, so **none can receive a
campaign and none can inflate a send**. The step-6 root-cause fix is doing precisely its
job — without it these would be `subscribed` and the next send would repeat wave-2.

**But the confirmation emails are still going out, from the verified domain, to addresses
that may not exist.** Every bot signup triggers one. 33 in a day, and the 5 August contacts
already at `unsubscribed` suggest some are bouncing. **This is wave-2's reputation damage
again, just metered through the opt-in flow instead of a campaign** — and it lands on
`wimdeblauwe.com`, the domain painstakingly warmed since 2026-07-27. A form that anyone can
use to make your domain send mail to arbitrary addresses is an open relay with extra steps.

### Do this now

1. **Turnstile.** No longer a deferred nice-to-have — it is the control that stops the send,
   not just the subscribe. The deferral was already reversed on 2026-07-31; this is the
   second campaign in a year, so the "~23 bots/year" premise is dead twice over.
2. **Rate-limit `/api/subscribe`** regardless of Turnstile — per-IP and global. 33/day is
   trivially above any legitimate rate for this site, and a global cap bounds the blast
   radius of the next campaign before a widget is even wired up.
3. **Delete the 33 pending** once the form is closed, not before — otherwise they refill.
   They are unconfirmed, so nothing is lost; a genuine signup among them can sign up again.
4. **Watch `pending` as a monitoring signal.** It is the leading indicator this list has —
   it moved 20 hours before anyone would have noticed, and nothing surfaces it. The wave-2
   attack ran for five months undetected because nobody was looking at signup rate.

**Nobody would have caught this from the UI.** It surfaced only because the post-prune
verification counted contacts by status, and `pending` is a status the migration had checked
exactly once, back at import.

## Wave-3 — send as a canary split, not in one go

**Waiting does not repair reputation.** It is not a cooldown timer; reputation recovers
through sustained good sending, not idle time. What time does buy is letting the bounce
event age out of Gmail's rolling window, and that window is ~30 days, not a few days.
"Wait a few days then send" leaves you approximately where you are now.

### What wave-3 actually is

`MEMBER_RATING` from the Mailchimp export, which the migration never looked at:

| Cohort | Ratings | Read |
|---|---|---|
| wave-1 (42) | 2★=14, 3★=15, 4★=12 | 27 with real engagement history — hence 0 bounces, 40% opens |
| wave-3 (133) | **1★=6, 2★=127** | **Not one contact above 2★** |

2★ is Mailchimp's default and only rises with engagement, so **no wave-3 contact has ever
opened or clicked anything sent from this list**, and 6 carry negative signals. The
2021–2023 signups were mailed the Dec 2024 campaign and ignored it. Signup years:
2020=2, 2021=19, 2022=34, 2023=31, 2024=47.

These are real people — the bot fingerprints are absent (see the cohort comparison above).
They are simply the least interested people on the list.

### Status: canary sent 2026-07-31

Sent to tag `wave-3a` (30 contacts). Two dated checkpoints follow — **both are easy to
let slip, and the second is a promise made in the email body**:

| When | Date | Do |
|---|---|---|
| +48h | **2026-08-02** | ~~Read the gate. If clean, send the same content to the remaining 102.~~ **Done 2026-08-03: all gates passed, remaining batch sent.** |
| +2 weeks | **2026-08-14** | ~~`?status=clicked` → keep. **Delete everyone else.**~~ **Done 2026-08-21** (a week late): kept 26, deleted 103, 0 failures. Promise honoured. |

**Remaining batch sent 2026-08-03.** Same `newsletter-wave-3.html`, verbatim, after the
canary cleared all three gates. **100 contacts, not the 102 predicted** — 2 of wave-3 had
dropped out of `subscribed` since the split. Segment was **has tag `wave-3` AND NOT tag
`wave-3a`**: the 30 canary contacts still carry the `wave-3` tag, so targeting `wave-3`
alone would have re-mailed them. The 2026-08-14 prune now applies to all of `wave-3`.

#### Canary result (measured 2026-08-03, ~48h after send) — ALL GATES PASS

30 sent, ~29 delivered. Pulled via `wave3-followup.mjs report` (campaign
`bfa9c05e-8cac-11f1-b84c-a3273ded34a4`, sent 2026-07-31T07:06Z).

| Metric | Value | Gate | Verdict |
|---|---|---|---|
| Bounces | **1 / 30 = 3.3%** | under 2 | **Pass** — below the 5–15% expected on 4–6-year-old addresses |
| Complaints | **0** | exactly 0 | **Pass** (API `?status=complained` — UI hides it) |
| Unsubscribes | **0** | under 3 | **Pass** |
| Clicks | **6 / 30 = 20%** | — (keep signal, not a gate) | Strong. The doc set expectations at 2–5 readers; this is at/above the top |
| Opens | 10 | — | Not a keep signal — bot/proxy-inflated per wave-2 |

**Gate cleared — cleared to send the remaining 102** (same `newsletter-wave-3.html`, tag
`wave-3` excluding `wave-3a`). 6 clicks is genuine engagement — more than wave-2's 495
produced — though discount 1–2 as possible link-scanner clicks (Proofpoint/Outlook ATP).
The 2026-08-14 checkpoint still stands: `wave3-followup.mjs prune` keeps the clickers and
deletes the rest, honouring the removal the email body promised.

#### Wave-3b result (measured 2026-08-21, ~18 days after send)

100 sent. Pulled via `wave3-followup.mjs prune` (campaign `115911f8-8f63-11f1-b444-d9232482b9e3`).

| Metric | 3b (100) | 3a canary (30) | Reading |
|---|---|---|---|
| Bounces | **5 = 5.0%** | 1 = 3.3% | Within the 5–15% predicted for 4–6-year-old addresses |
| Complaints | **0** | 0 | API `?status=complained` — the UI still shows no figure |
| Unsubscribes | 1 | 0 | Healthy |
| Clicks | **19 = 19%** | 7 = 23% | The canary predicted the remainder almost exactly |
| Opens | 37 | 11 | Not a keep signal |

**The canary split did what it was supposed to do.** A random 30 forecast 19% clicks against
the remainder's actual 19%, and 3.3% bounces against 5.0% — the homogeneous-cohort reasoning
held. That is the method to reuse, and the contrast with reading wave-1 as evidence about
wave-2 is the whole lesson of this migration.

**Wave-3a's own numbers moved after the 48h gate**: 6 clicks → 7, 10 opens → 11. Late
clickers are real on a re-permission ask with a two-week deadline. **Re-pull every campaign
at prune time; never prune against a figure recorded at the gate.**

The 26 keepers look like an audience — 13 gmail, and a tail of `outlook`, `icloud`, `gmx`,
`mac`, plus self-hosted domains (`wisdomofcode.com`, `surly.dev`, `evol-tech.com`,
`kobelnet.ch`, `insuit.cz`, `wadley.org`, `daly.ws`, `arnhart.com`, `irsch.net`). 50% gmail
with a long tail is the wave-1/wave-3 fingerprint, not wave-2's 96.4%.

### The prune — scope bug found 2026-08-21

`wave3-followup.mjs prune` was written during the canary and hardcoded `TAG = 'wave-3a'`
with a `resolveCampaign()` that returns the **most recent** wave-3 campaign. Run unchanged
after 3b, it would have:

- taken its pool from tag `wave-3a` — the 30 canary contacts, not the 129-strong cohort;
- taken its keep set from wave-3b's clickers — 19 addresses, **none of which are in that
  pool**;
- therefore **deleted all 30 canary contacts, including the 7 who clicked**, and left every
  wave-3b non-clicker untouched.

Exactly inverted, and it would have destroyed the best contacts on the list while keeping
the dead weight. Fixed: the pool is now `wave-3` ∪ `wave-3a`, and the keep set is the union
of clickers across **every** wave-3 campaign.

**The general rule: a script written for one batch does not become a cohort-wide tool by
being run later.** Both the tag and the campaign were scoped to the canary, and neither
would have failed loudly.

Two more rules the plan encodes:

- **Still-subscribed bouncers are deleted regardless of clicks.** 6 bounce events across 3a
  and 3b, but only 4 contacts left `subscribed` — **3 soft bounces stayed put**, because
  EmailOctopus has no `bounced` contact status. Same precedence as `wave2-triage.mjs`.
  (None of the 3 had clicked, so nothing was lost to this rule.)
- The plan is written to `wave3-prune-plan.csv` and `--confirm` executes *that file*, so
  what is reviewed is what runs.

### The split

Send to a **random 30 of the 132**, wait 48h, then send the remaining 102 only if clean.

| Gate on the 30 | Threshold |
|---|---|
| Bounces | under 2 |
| Complaints (`?status=complained`) | 0 |
| Unsubscribes | under 3 |

**The free Starter plan caps a list at 10 tags.** Creating the 11th fails with
`403 out-of-limits`, which blocked the first attempt at tagging the canary batch. The cap
is on tags existing on the list, not per contact, so the 11th fails for every contact at
once — nothing is partially tagged, and the state stays clean. Free a slot with
`tags.mjs delete <tag> --confirm`; the provenance-only tags (`mailchimp-import`,
`never-emailed`) are the cheap ones, since the source CSVs in the working directory still
carry that information. Then re-run `wave3-split.mjs apply` — the drawn sample is on disk,
so it does not need redrawing.

**Budget the remaining slots.** Every future cohort split costs one, so delete a tag when
its wave is finished rather than accumulating them.

**Cleared 2026-08-21, after the prune:** `wave-1`, `wave-3` and `wave-3a` are spent — both
wave-3 checkpoints are closed and every contact still carrying them clicked. All four wave
tags are re-derivable from disk if ever needed (`emailoctopus-import-670.csv` Tags column
for wave-1/2/3, `wave3-canary.csv` for the wave-3a thirty), so none of this is a one-way
door. `never-emailed`, `engaged` and `mailed-before` are staler still — they describe
Mailchimp-era state from before three sends, and `never-emailed` is now false for everyone.

**Keep `wave-2` until the 35 have earned their place.** They are the only unproven segment
left on the list — a third of it. The triage kept 2 clickers (1 bot-shaped), **25 on opens**
and **13 on nothing but a non-freemail domain**, which contradicts this document's own rule
that opens are not a keep signal on this list. Until they click something, `wave-2` is what
lets you attribute a bounce or complaint on the next send, and what scopes the click-or-go
rule wave-3 just passed. Re-deriving it later costs an API re-tagging loop and a slot.

**Never delete `website-signup`** — `subscribe.mjs` writes it on every new signup, and it is
what made the 2026-08 bot campaign legible.

**Why a subsample works here when wave-1 did not.** Wave-1 and wave-2 were different
populations, so a clean wave-1 was never evidence about wave-2 — that is the reasoning
error that sent 495 emails into the void. Wave-3 is one homogeneous cohort, so a *random*
30 genuinely predicts the other 102. Draw it randomly; do not take the first 30
alphabetically or by signup date.

Expect 5–15% bounces on 4–6 year old addresses (7–20 of 132). Above the 2% gate, but
nowhere near wave-2, and the canary catches it at 30 rather than 132.

### The email — `newsletter-wave-3.html`

Not a newsletter issue. It asks one question and makes silence the default outcome: click
to stay, no click and you are removed. Sending a normal issue to people who have never
engaged assumes a relationship the data says does not exist.

- **Retention is decided on clicks, not opens.** EmailOctopus records clicks per contact
  rather than per link, so any click counts. Opens are unusable — 43% of wave-2's openers
  were bot-shaped, plus Gmail proxying, scanners and Apple MPP.
  `GET /campaigns/{id}/reports?status=clicked` → keep. Everyone else → delete.
- **The body promises removal in two weeks. Honour it.** Saying "I will remove you" and
  then not doing it makes any future re-permission ask worthless, and leaves exactly the
  dead weight this send exists to shed. The deadline is relative, not a fixed date, so it
  stays correct if the send slips.
- **Does not reuse wave-2's opener.** That said "this is the first email you are getting",
  which is false here — many of this cohort received the Dec 2024 send.
- `/newsletter-confirmed/` is the landing page for the keep-me button. Confirm it is live
  before sending; it went up 2026-07-31.

### Set expectations

132 never-engaged contacts might yield 10–20 actual readers, and the canary batch of 30
might yield 2–5. That is the realistic prize, and a low response rate is the expected
result rather than a failure. Unsubscribes and non-responses are both successes here.
Re-permission only: send once, keep whoever clicks, let the rest go. Do not build a
recurring send on this segment.

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

| Segment | Size | Content | Outcome |
|---|---|---|---|
| `wave-1` | **40** | Re-introduction. The 28 previously-engaged + 2026 signups — friendliest audience. | Sent 07-27. Clean: 0 bounces, 40% opens |
| `wave-2` | 495 | The 2025 cohort. Open with "you subscribed in \<month\> 2025". | Sent 07-28. **37.4% bounce — cohort was bots** |
| `wave-3` | 132 | 2020–2024 leftovers, coldest. Re-permission only; drop non-openers. | Pending — send as a **30 + 102 canary split** |

Also available: `engaged` (28), `never-emailed` (~511), `mailed-before` (~156).

Between waves check: **bounces under ~2%, complaints under 0.1%**. If wave 1 looks clean,
continue. If 40 addresses bounce hard, stop and diagnose before burning 495 more.

**The wave strategy worked — it is the reason this was survivable.** Blasting all 670 at
once would have put the same 185 bounces into a single send with no prior clean history,
and taken the account down. What it could not do is catch the problem *before* wave-2,
because wave-1's segment was the previously-engaged cohort — the one group guaranteed not
to contain 2025 bot signups. **A clean wave-1 was never evidence about wave-2's quality.**
Next time, order waves so the first send samples the segment you are least sure of, or
verify a random sample of a cohort before mailing all of it.

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
- **Cloudflare Turnstile — DEFERRAL REVERSED 2026-07-31. Add it.** The original reasoning
  was: "all 71 junk entries would have been caught by checks 3–4 alone; at ~23 bots/year a
  widget isn't worth the friction on a form converting at ~0.1%." **Both halves were wrong,
  because the bot count was read off `newsletter-junk-71.csv` — which only ever contained
  the bots that were *easy to spot*.** Wave-2's 37.4% bounce exposed ~474 more in May–Sep
  2025 alone: roughly **100× the estimate**, and checks 3–4 do *not* catch them, since they
  use real gmail.com/yahoo.com domains that pass both the blocklist and the MX lookup. The
  0.1% conversion rate that made the friction look expensive was itself an artifact — the
  denominator was inflated by the same bots. Client widget → hidden `cf-turnstile-response`
  → verify at `https://challenges.cloudflare.com/turnstile/v0/siteverify`.
- **Domain-level MX is not address validation.** `resolveMx` (line 122) proves the domain
  can receive mail, not that the mailbox exists. It earns its keep against typos like
  `outlookc.om`, but it is structurally blind to `plausiblename47@gmail.com`. Closing that
  gap needs either a challenge at signup (above) or mailbox-level verification.

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

**Superseded 2026-07-31 — the premise was wrong.** This section read the mid-2025 spike as
a growth win worth reverse-engineering: "474 signups May–Sep 2025, peaking at 164 in July,
then a fall back to ~2/month… something in mid-2025 worked very well."

Nothing worked. That spike is the bot campaign — same months, same shape, and it is exactly
the cohort that bounced at 37.4%. There is no tactic to rediscover. **~2 signups/month is
not a fall back to baseline; it is the baseline**, and the ~0.1% conversion figure was
computed against a denominator the bots inflated, so the real rate was never that bad.

The ad arithmetic below is unaffected and still holds — if anything more so, since the true
list is ~63 provable humans rather than 667:

At ~3–5K pageviews/month, AdSense would pay roughly $3–15/month, wouldn't qualify
for Mediavine (50K sessions) or Raptive (100K pageviews), and would force a cookie-consent
banner onto a currently tracker-light site. The three product placements already in
`layouts/blog/single.html` are worth far more per visitor — one Leanpub sale ≈ two to three
years of AdSense at this traffic.

Cheap wins there:
- Instrument the book placements (CTR / Leanpub referrals) — currently unmeasured.
- Order them by post tag instead of fixed order, so a Thymeleaf post leads with
  *Taming Thymeleaf*.
- Add GitHub Sponsors links on the OSS repos and in the site footer.