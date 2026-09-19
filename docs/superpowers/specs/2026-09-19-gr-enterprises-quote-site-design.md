# GR Enterprises — Quote-Request Catalogue Site

**Date:** 2026-09-19
**Status:** Approved design, ready for implementation planning

## 1. Purpose

A public product-catalogue website for GR Enterprises that converts visitors into
**contactable leads**. There is no cart, no checkout, no payment, and no delivery.
Every product page ends in one action: *Get a Quote*. The owner receives the
enquirer's contact details and follows up directly.

### Success criteria

1. A visitor can find a product and submit an enquiry in under 60 seconds.
2. The owner can add products, categories and prices without a developer.
3. No lead is ever lost, even when an external notification service fails.
4. Category and part-number pages are indexable and technically sound for search.
5. The site is legible and fully usable from 320 px to ultrawide.

## 2. Business context

Drawn from the company's own 2026 catalogue (`CBLLP Catloge 2026-compressed (1).pdf`):

| Field | Value |
| --- | --- |
| Trading name | GR Enterprises |
| Tagline | Touching Hearts — Since 1994 |
| Positioning | Govt. Contractor & General Supplier; Importer / Exporter |
| Address | Plot No. F-247, Industrial Area, Phase 8B, S.A.S. Nagar, Mohali, Punjab 160055 |
| Phone / WhatsApp | +91-9465324507 |
| Email | grenterprises0409@gmail.com |
| GSTIN | 03EDKPS3373H1ZB |
| MSME UAM | PB-20-0092585 |

**The premises are in Mohali, not Chandigarh.** Google Business Profile must carry the
true Mohali address. Search targeting covers the Tricity region — Chandigarh, Mohali
and Panchkula — rather than Chandigarh alone.

**Buyers are institutional**: hospital purchase departments, biomedical engineering
teams, and government tender officers. Established-1994, GSTIN and MSME registration
are purchase-qualifying signals for this audience and belong in persistent site
furniture, not buried on an About page.

### Catalogue shape

Roughly 25 top-level categories spanning several hundred SKUs: SpO2 sensors and
probes, ECG cables and leads, electrosurgical patient plates, fetal transducers and
CTG belts, respiratory and airway devices, oxygen sensors, patient monitors, Erbe
electrosurgery, ECG machines, syringe and infusion pumps, patient warmers,
tourniquets, AED and defibrillators, dopplers, laryngoscopes, thermometers, vein
finders, compatible batteries, and miscellaneous accessories.

Two properties dominate the domain and drive the content model:

- **Compatibility.** Most items are defined by the equipment they fit —
  "Compatible Philips M2735A", "Compatible GE Corometric 5700HAX", "L&T & Erbe".
- **Part numbers.** Items carry exact manufacturer codes — `PSR-11-75-KE7`,
  `M3538A`, `989803206781`, `F7320W/V`, `M5070A`.

Biomedical staff search by part number. These are high-intent, low-competition
queries with national reach, and they are the single largest organic opportunity in
the project — larger than local "medical equipment Chandigarh" terms.

## 3. Non-goals

Explicitly out of scope, now and by design:

- Shopping cart, checkout, payments, online ordering, shipping
- Stock levels or real-time inventory
- Customer accounts or login for the public site
- Multi-language or multi-currency
- Automated WhatsApp replies to customers (deferred; see §8)

Prices are **not** a non-goal — they are optional and admin-controlled per product
(§6). What is excluded is transacting on them.

## 4. Stack

| Layer | Choice | Rationale |
| --- | --- | --- |
| Framework | Next.js 15, App Router | Static generation for catalogue pages; one codebase |
| CMS / Admin | Payload 3, embedded | Full admin UI generated from schema; no admin to build |
| Database | Neon Postgres (free tier) | Private by default; portable; serverless driver |
| Media | Cloudflare R2 via `@payloadcms/storage-s3` | S3-compatible; 10 GB free; **no egress fees** |
| Hosting | Vercel (Pro) | Best-supported Payload deployment path |
| Email | Resend (free tier) | 3,000 emails/month |
| Styling | Tailwind + shadcn/ui | Component reuse; light theme only |

R2 over Vercel Blob specifically for egress: product image bandwidth on a catalogue
site is the cost that grows with success, and R2 charges nothing for it.

### Why not the alternatives

- **WordPress** — cheapest to hand over and easy for any local freelancer to
  maintain, but requires ongoing security patching that a client with no developer
  on call will not perform. An unmaintained WordPress site is an exploited one.
- **Shopify** — ₹1,994/mo minimum, architected entirely around cart and checkout,
  and quote-request needs a paid app. Wrong tool.
- **Sanity** — excellent free tier, but free datasets are **public-only**. Customer
  names and phone numbers in a publicly readable dataset is a privacy exposure and a
  DPDP Act problem. Private datasets start at $15/seat/month.
- **Cloudflare Workers** — $5/mo and cheaper than Vercel, but Payload on Workers with
  the Postgres adapter is newer, less-documented ground. Rejected in favour of the
  well-trodden path, since this project is handed over with no developer on call.

### Recurring cost

| Item | Cost |
| --- | --- |
| Vercel Pro | ~₹1,700/mo |
| Neon, R2, Resend | ₹0 (free tiers) |
| Domain | ~₹900/yr |
| **Total** | **~₹21,300/yr** |

Note: Vercel's Hobby tier forbids commercial use, so Pro is required for a client
business site. This is above the ₹300–800/mo band originally discussed; accepted
deliberately in exchange for the most reliable Payload deployment path.

## 5. Architecture

```
Next.js 15 (App Router) + Payload 3  —  single app, single deploy on Vercel
├── /               public site, statically generated, ISR on publish
├── /admin          Payload admin (products, categories, brands, leads, settings)
└── /api/quote      route handler: validate -> persist lead -> notify
        |
        ├── Neon Postgres   (content + leads)
        ├── Cloudflare R2   (product images, S3-compatible adapter)
        └── Resend          (email notification)
```

Catalogue pages are statically generated and revalidated on publish, so visitors
receive static HTML from Vercel's edge while the owner still edits through a live
admin.

## 6. Content model

### Product

| Field | Type | Notes |
| --- | --- | --- |
| `name` | text | required |
| `slug` | text | auto from name, editable, unique |
| `partNumber` | text | indexed; primary SEO asset |
| `brand` | relationship → Brand | optional |
| `compatibleWith` | array of { brand, models[] } | drives compatibility search |
| `category` | relationship → Category | required |
| `shortDescription` | textarea | used in cards and meta description fallback |
| `description` | richText | Lexical |
| `specifications` | array of { label, value } | renders as a spec table |
| `variants` | array of { label, partNumber } | sizes, e.g. PCGel 1–5, Mac 1–4 |
| `images` | array of upload → Media | first is the card image |
| `price` | number | INR, optional |
| `showPrice` | checkbox | per-product toggle; defaults from Site Settings |
| `priceNote` | text | e.g. "per piece", "excl. GST" |
| `availability` | select | In stock / Made to order / Discontinued |
| `featured` | checkbox | surfaces on home |
| `seo` | group | metaTitle, metaDescription |

**Price display rule.** When `showPrice` is off, or `price` is empty, the UI renders
*"Price on request"* and the Get a Quote action becomes the only path. When on, the
price renders with `priceNote` beneath it. The Get a Quote button is present either
way — showing a price never removes the enquiry path.

Variants are a flat labelled list, **not** priced product variants. There is exactly
one optional price per product.

### Category

Hierarchical via a self-referencing `parent` field (Respiratory → Airway Devices).
Fields: `name`, `slug`, `parent`, `description`, `image`, `displayOrder`, `seo`.

Depth is capped at two levels. The left sidebar renders top-level categories with
their children; deeper nesting would not fit the navigation.

### Brand

Fields: `name`, `slug`, `logo`, `description`, `seo`. Powers `/brands/[slug]`
landing pages — "Erbe accessories supplier India" and similar are real queries with
real buyers.

### Lead

| Field | Type | Notes |
| --- | --- | --- |
| `name`, `phone` | text | required |
| `email`, `city`, `organisation` | text | optional |
| `product` | relationship → Product | set when enquiry starts from a product |
| `quantity` | number | optional |
| `message` | textarea | optional |
| `status` | select | new / contacted / quoted / won / lost |
| `internalNotes` | textarea | admin-only |
| `consent` | checkbox | stored with the record |
| `sourcePage` | text | captured server-side |
| `createdAt` | date | automatic |

Read/write restricted to authenticated admin users. Never exposed through any
public API route.

### Site Settings (global)

`address`, `phone`, `whatsappNumber`, `email`, `gstin`, `msmeNumber`,
`openingHours`, `mapEmbedUrl`, `socialLinks`, `establishedYear`,
`defaultShowPrice`, `priceDisclaimer`.

This exists so the owner can change the shop's phone number without calling a
developer. Anything the owner might plausibly want to edit lives here rather than in
code.

## 7. Routes

| Route | Purpose |
| --- | --- |
| `/` | Home — hero, featured categories, featured products, trust, brands |
| `/products` | All products, filterable by category and brand |
| `/products/[slug]` | Product detail with Get a Quote |
| `/categories/[slug]` | Category landing — primary local-SEO target |
| `/brands/[slug]` | Brand landing page |
| `/search` | Part-number and keyword search results |
| `/quote` | Standalone enquiry form |
| `/thank-you` | Confirmation for the standalone form; conversion-tracking URL |
| `/about`, `/contact` | Company info, credentials, map, NAP block |
| `/sitemap.xml`, `/robots.txt` | Generated |

## 8. Lead capture flow

**Get a Quote opens a modal dialog**, not a new page. The visitor never loses their
place in the catalogue.

1. Get a Quote button appears on product cards and on the product detail page.
2. Clicking opens a dialog pre-filled with the product name and part number
   (shown read-only, so the enquirer can confirm what they are asking about).
3. Fields: name, phone (both required), email, organisation, city, quantity,
   message, consent checkbox.
4. Submit → `POST /api/quote` — zod validation, honeypot, Cloudflare Turnstile,
   rate limit.
5. **Persist the Lead first**, via Payload's Local API.
6. *Then* dispatch notifications, non-blocking.
7. The dialog swaps to an inline success state — no navigation. The conversion
   event fires here. The standalone `/quote` page redirects to `/thank-you` instead.

Step ordering is deliberate. If Resend is down, the lead is still captured and
visible in the admin. A lost lead is the only failure mode this business genuinely
cares about.

**Dialog accessibility is a requirement, not a nicety**: `aria-modal`, labelled by
its heading, focus trapped while open, Escape closes, focus returns to the
triggering button on close. On viewports below `sm` the dialog renders full-screen.

### Notifications

Launch scope is **email only**, to `grenterprises0409@gmail.com`, via Resend.

Notifications sit behind a small `LeadNotifier` interface with one method. Email is
the only implementation at launch; Telegram and WhatsApp Cloud API adapters can be
added later without touching the submission path. Deferring WhatsApp keeps Meta's
Business-verification queue off the launch critical path.

### Anti-spam

Turnstile, honeypot, and rate limiting ship in Phase 1, not later. Quote forms
attract bot traffic, and an owner whose inbox fills with junk stops trusting the
system within a week — at which point real leads get ignored too.

## 9. Design system

Light theme only. Professional, consistent, fully responsive.

### Layout

```
┌──────────────────────────────────────────────────────┐
│ [logo] GR ENTERPRISES   [ search part no… ]  call/WA │  sticky
├──────────────────────────────────────────────────────┤
│ Since 1994 · Govt. Contractor · GSTIN · Mohali       │  trust strip
├───────────────┬──────────────────────────────────────┤
│ CATEGORIES    │  Hero                                │
│ (from admin)  │  Featured categories                 │
│ sticky        │  Brands supplied                     │
│               │  Why GR Enterprises                  │
└───────────────┴──────────────────────────────────────┘
```

Sidebar is sticky on desktop and a drawer below `lg`. **Header search is a primary
feature**, not decoration — part-number lookup is the dominant expert-user
behaviour.

### Colour (from the logo)

| Token | Value | Use |
| --- | --- | --- |
| `--primary` | `#2D5BB9` | links, buttons, active states |
| `--primary-deep` | `#1E3A6E` | headings, sidebar active |
| `--accent-light` | `#5B9BD5` | hovers, highlights |
| `--accent-warm` | `#8B3A2F` | trust badges, used sparingly |
| `--surface` | `#FFFFFF` | page |
| `--surface-muted` | `#F5F7FA` | cards, sidebar |
| `--border` | `#E2E8F0` | dividers, card outlines |
| `--text` / `--text-muted` | `#0F172A` / `#64748B` | body / secondary |

### Typography

| Role | Face | Notes |
| --- | --- | --- |
| Headings | Plus Jakarta Sans 600/700 | professional, slightly warmer than Inter |
| Body / UI | Inter 400/500 | excellent at small sizes in dense spec tables |
| Part numbers, spec values | JetBrains Mono 400 | see below |

Monospace for part numbers is a deliberate usability decision, not decoration.
`989803206781` and `PSR-11-75-KE7` are read character-by-character and transcribed
into purchase orders; a monospace face disambiguates `0`/`O` and `1`/`l` and keeps
columns aligned. Getting a digit wrong costs the customer a returned order.

Fluid scale, clamped so nothing breaks at 320 px or ultrawide:

```
display  clamp(2rem, 1.4rem + 2.4vw, 3rem)      h3     1.25rem
h1       clamp(1.75rem, 1.4rem + 1.6vw, 2.25rem) body  1rem / 1.6
h2       clamp(1.375rem, 1.2rem + 0.8vw, 1.5rem) small 0.875rem
```

Body never drops below 16 px — smaller triggers input zoom on iOS and fails
readability for the older purchase-officer demographic.

### Spacing, shape, motion

4 px base scale (Tailwind default). Radius: 8 px cards, 6 px buttons and inputs.
Borders 1 px `--border`; shadows subtle and reserved for overlays, not cards.
Transitions 150–200 ms on colour and transform only; respect
`prefers-reduced-motion`.

### Consistency rules

One `Button` (variants: primary, secondary, ghost), one `Card`, one `Badge`, one
`Input`. No ad-hoc colours, radii, or font sizes outside the tokens above — every
value comes from the scale. This is what makes the site read as designed rather
than assembled.

### Responsive

Tailwind breakpoints. Behaviour by width:

| Width | Sidebar | Product grid | Header |
| --- | --- | --- | --- |
| < 640 | drawer | 1 column | logo + search icon + menu |
| 640–1024 | drawer | 2 columns | logo + search + call |
| 1024–1280 | sticky rail | 3 columns | full |
| > 1280 | sticky rail | 4 columns | full |

Tap targets minimum 44 × 44 px. Spec tables and long part-number rows scroll inside
their own `overflow-x: auto` container — the page body never scrolls sideways.

### Product detail page

Ecommerce-familiar layout, quote-driven action:

- Image gallery with thumbnails, zoom on desktop, swipe on touch
- Title, part number (monospace), brand, availability badge
- Price **or** "Price on request", per `showPrice`
- **Get a Quote** as the primary button, occupying the position an "Add to cart"
  would in a conventional store
- Tabbed: Description · Specifications · Compatibility
- Related products from the same category

## 10. SEO

**Technical**

- Static generation; editable meta title and description per product, category, brand
- JSON-LD: `MedicalBusiness` on home and contact, `Product` on product pages,
  `BreadcrumbList` throughout
- Generated `sitemap.xml`, canonical URLs, no duplicate content across listing routes
- Images served from R2 as WebP with explicit dimensions, lazy-loaded below the fold
- Core Web Vitals budget enforced on home, category and product templates

**Structured data and the price toggle.** Where `showPrice` is on, the `Product`
JSON-LD includes a valid `offers` block with price and currency, making the product
eligible for rich results with price shown in search. Where it is off, `offers` is
omitted entirely rather than faked — a mismatch between structured data and visible
page content is a manual-action risk. This means the price toggle is also a search
lever, and the owner should be told as much.

**Content strategy, in priority order**

1. **Part-number pages** — national reach, high intent, minimal competition. The
   largest opportunity. Requires `partNumber` and `compatibleWith` to be populated.
2. **Category pages** targeting Tricity local intent — "SpO2 sensor supplier Mohali",
   "Erbe accessories dealer Chandigarh".
3. **Brand pages** — "Erbe accessories supplier India".

**Off-site — where ranking is actually won**

Roughly 70% of local ranking is off-site. This is the owner's work, not the site's:

- Google Business Profile at the Mohali address: correct category, photos, hours,
  posts, and actively solicited reviews
- Consistent NAP across IndiaMART, JustDial, Sulekha, Bing Places
- Google Search Console and GA4 verified at launch

No stack ranks a site by itself.

## 11. Testing

- **Unit** — zod schemas, slug generation, price-display logic, lead creation
- **Integration** — `POST /api/quote` persists a Lead with notifiers mocked; asserts
  the lead survives a notifier throwing
- **E2E (Playwright)** — open quote dialog from a product card, submit, see success
  state, lead visible in admin; keyboard-only pass through the dialog
- **Responsive** — visual checks at 320, 768, 1024, 1440 px
- **Lighthouse** — budget on home, category and product pages

## 12. Phasing

**Phase 1 — launchable**
Payload on Neon; Product, Category, Brand, Lead, Site Settings; design tokens and
base components; header + sidebar shell; home, category, product, search, contact
pages; Get a Quote dialog with email notification; Turnstile and honeypot; SEO
fundamentals; seed content of a few categories and products.

**Phase 2**
Bulk CSV import for products; brand landing pages; GA4 and Search Console;
Telegram or WhatsApp Cloud API notifier.

**Phase 3**
Category content pages; blog for SEO; Google Business Profile and local citations.

Seed data is deliberately small. The owner populates the catalogue, which doubles as
the acceptance test for whether the admin is genuinely usable by a non-developer.

## 13. Handover

A deliverable, not an afterthought:

- One-page illustrated guide: adding a product, a category, toggling price, reading leads
- All credentials in a password manager handed to the owner
- Written list of what recurs, when, and what it costs
- **Every account registered to the owner's email** — domain, Vercel, Neon,
  Cloudflare, Resend. Registering them to the developer makes one person a single
  point of failure for the business.

## 14. Open questions

1. Transparent PNG or SVG versions of the logo — original vector, or trace the JPEGs?
2. Domain name not yet chosen or purchased.
3. The catalogue PDF is titled "CBLLP Catloge 2026" but carries GR Enterprises'
   contact details — confirm whether GR Enterprises distributes for CBLLP, and
   whether product imagery from the PDF may be reused on the site.
4. Logo tagline reads "Govt. Contractor & General Supplier" while the catalogue
   leads with medical equipment. Confirm the primary positioning for homepage copy.
5. Should displayed prices be presented as inclusive or exclusive of GST? Affects
   `priceDisclaimer` default and the `offers` structured data.
