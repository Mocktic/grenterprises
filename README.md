# GR Enterprises — quote-request catalogue

A product catalogue for GR Enterprises (medical equipment, Mohali) where every
product ends in **Get a Quote** rather than a cart. There is no checkout, no
payment and no delivery: the site's only job is to turn a visitor into a lead
the owner can call.

Design spec: [`docs/superpowers/specs/2026-09-19-gr-enterprises-quote-site-design.md`](docs/superpowers/specs/2026-09-19-gr-enterprises-quote-site-design.md)

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| CMS + admin | Payload 3, embedded at `/admin` |
| Database | Neon Postgres |
| Images | Cloudflare R2 (S3-compatible), local disk in development |
| Email | Resend |
| Styling | Tailwind v4, IBM Plex Sans / Mono |

## Running it locally

```bash
npm install
cp .env.example .env     # then fill in DATABASE_URI and PAYLOAD_SECRET
npm run seed             # optional: a small slice of the real catalogue
npm run dev
```

- Site — http://localhost:3000
- Admin — http://localhost:3000/admin

The first visit to `/admin` asks you to create an administrator account. Nothing
else is needed to start adding products.

### Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run seed` | Adds sample categories, brands and products. Idempotent — matches products by part number and only creates what is missing. |
| `npx payload run src/scripts/make-heroes.ts` | Regenerates the three hero illustrations into the media library. |
| `npm run generate:types` | Regenerates `src/payload-types.ts` after changing a collection |
| `npm run generate:importmap` | Regenerates the admin import map after adding a custom admin component |

**Run `generate:types` after every collection change.** The rest of the codebase
is typed from that file.

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URI` | yes | Neon connection string |
| `PAYLOAD_SECRET` | yes | 32+ random bytes. `openssl rand -hex 32` |
| `NEXT_PUBLIC_SERVER_URL` | yes in production | Canonical URLs, sitemap, admin links in emails |
| `RESEND_API_KEY` | no | Blank means leads still save; the notification is logged to the console instead |
| `LEAD_NOTIFY_TO` | no | Where quote requests are emailed |
| `TURNSTILE_SECRET_KEY` / `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | no | Blank disables the bot check, which is what you want locally |
| `STORAGE_DRIVER` | no | `vercel-blob`, `r2` or `local`. Blank auto-detects |
| `BLOB_READ_WRITE_TOKEN` | no | Set automatically when a Blob store is attached in Vercel |
| `R2_*` | no | Blank stores uploads on local disk |

Every optional variable degrades safely, so the site runs with only a database.

## How it is put together

```
src/
  app/
    (frontend)/        public site + /enquiry endpoint
    (payload)/         admin panel and Payload REST/GraphQL
  collections/         Products, Categories, Brands, Leads, Media, Users
  globals/             SiteSettings — the owner-editable shop details
  components/
    ui/                buttons, inputs, dialog, badges, spec plate
    site/              header, sidebar, product card, quote form
  lib/                 queries, SEO, pricing, notifications
  scripts/seed.ts
```

### Decisions worth knowing

**Leads are saved before any notification is sent.** If Resend is down the
enquiry is still in the admin panel. A lost lead is the one failure this
business cannot absorb, so nothing that can fail runs ahead of the write.

**The quote endpoint is `/enquiry`, not `/api/quote`.** Payload owns the entire
`/api` namespace.

**Product pages stack rather than tab.** Specifications and compatibility are the
most valuable content for search; tabs would hide them from crawlers.

**Prices are optional per product.** `showPrice` off renders "Price on request"
and omits the `offers` block from the structured data. Structured data that
contradicts the visible page is a manual-action risk, so a hidden price means no
offer rather than a fabricated one. Turning a price on also makes that product
eligible for price-in-search rich results.

**Part numbers are set in monospace.** They get transcribed into purchase orders,
and monospace disambiguates `0`/`O` and `1`/`l`. A wrong digit is a returned order.

**The honeypot returns 200, not an error.** Failing validation would name the trap
field and teach scrapers to skip it.

**Cache invalidation is path-based.** Payload `afterChange` hooks call
`revalidatePath('/', 'layout')` so an edit appears on the site immediately. Blunt,
but catalogue edits are infrequent and a stale sidebar is worse than a cold cache.

## Where uploads are stored

Both adapters are wired up, so the choice is an environment variable rather than
a code change:

| `STORAGE_DRIVER` | Uses |
| --- | --- |
| `vercel-blob` | Vercel Blob (needs `BLOB_READ_WRITE_TOKEN`) |
| `r2` | Cloudflare R2 (needs the four `R2_*` vars) |
| `local` | Local disk under `media/` |
| *(blank)* | Blob if its token is set, else R2, else local |

**Switching drivers does not move existing files.** Anything already uploaded
stays in the old store and has to be re-uploaded, so change driver before the
catalogue is populated rather than after.

### Switching storage driver

Changing `STORAGE_DRIVER` only changes where *new* files go. Existing rows keep
their filenames, the new adapter looks for them in a store that does not have
them, and every image 404s. Run `src/scripts/migrate-media.ts` after switching:
it backs up every original to a timestamped folder and verifies the copy before
uploading anything, so a failed upload cannot destroy the source.

`src/scripts/restore-media.ts` re-uploads originals from those backups if a
migration goes wrong.

### Vercel Blob needs a PUBLIC store

Payload's Blob adapter only supports `access: 'public'` — the option is typed as
the literal `'public'`, and a private store rejects every upload with
*"Cannot use public access on a private store"*. Create the Blob store as
**public** in the Vercel dashboard; store access cannot be changed afterwards.

Public is also the right choice here: product photos are meant to be fetched
directly by browsers and indexed by Google, and public delivery is roughly 3x
cheaper per GB than proxying private blobs through a Function.

### Vercel Blob on the Hobby plan

Included per month: **1 GB storage, 10 GB data transfer, 10,000 simple
operations, 2,000 advanced operations.**

Two things to watch:

- **Advanced operations are the tight one.** Every `put()` counts, and Payload
  writes four files per upload — the original plus the thumbnail, card and hero
  sizes. That is 2,000 ÷ 4 = **500 product uploads a month**, and browsing the
  Blob dashboard consumes them too. Adding products steadily is fine; bulk
  importing several hundred at once is not.
- **Exceeding a limit disables Blob for up to 30 days.** On Hobby you cannot pay
  your way out of it — images simply stop loading until the window resets. That
  is the argument for moving to R2 before the catalogue gets large.

## The admin panel

- **Dashboard** opens with unanswered quote requests first, then the pipeline
  (new / contacted / quoted / won), the latest five enquiries, and catalogue
  counts. A "Dashboard" link sits at the top of the sidebar, because Payload
  does not provide a route home from inside a collection.
- **Export** lives in the "..." menu on every list view — CSV opens straight in
  Excel. **Import** is on the same menu, and is the only sane way to load the
  remaining hundreds of catalogue lines.
- **Quote requests are read-only** apart from status and internal notes. What a
  customer submitted is a record, not a draft; silently fixing a typo in someone's
  phone number is how a lead quietly dies.
- **Cancel** sits next to Save and returns to the list. Payload's own
  unsaved-changes prompt still fires, so nothing is lost by accident.

## Hero artwork

Three original illustrations ship in the media library — an ECG waveform, a
connector array, and a parts grid. Pick one under **Shop details → Home page**.

They are drawn from scratch in the site palette on purpose. The catalogue PDF
embeds third-party manufacturer marketing images (Covidien/TY-CARE branding
among them) which are not GR Enterprises' to republish, and licence-unclear
stock photography is no safer on a commercial site.

**A photograph of the actual Mohali showroom will beat all three.** Upload one to
the same field when you have it.

## Deploying to Vercel

1. Push to GitHub and import the repository into Vercel.
2. Set every variable from the table above in Project Settings → Environment Variables.
3. Set `NEXT_PUBLIC_SERVER_URL` to the live domain.
4. Deploy.

Vercel's Hobby tier forbids commercial use, so this needs a **Pro** plan.

### Database migrations

Development uses Drizzle's push mode, which syncs schema automatically. **Do not
rely on that in production.** Before the first deploy, generate a migration:

```bash
npx payload migrate:create
```

Note that push mode cannot run unattended when a change looks like a column
rename — it waits for a confirmation prompt that CI has no way to answer.

## Still to do

- [ ] **Hero photograph** of the showroom or stock, to replace the placeholder illustration
- [ ] Product photography — every product currently shows the brand mark placeholder
- [ ] Cloudflare R2 bucket and credentials
- [ ] Resend domain verification, so mail comes from the company domain
- [ ] Turnstile keys before going live; the form is otherwise open to bots
- [ ] Google Business Profile at the Mohali address, Search Console, GA4
- [ ] Vector or transparent-PNG logo. The header currently pairs the hexagon mark with the wordmark set in live type, because the tagline in `logo.jpg` is about twelve pixels tall and illegible at any header size.
- [ ] Owner alerts on WhatsApp — add an adapter alongside `emailNotifier` in `src/lib/notify.ts`
