import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

const startOfDaysAgo = (days: number) => {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

/**
 * Dashboard summary.
 *
 * Ordered by what the owner needs to act on rather than by what is easiest to
 * count: unanswered quote requests come first, because an enquiry left sitting
 * for two days is a lost sale. Catalogue totals are further down — they are
 * reassurance, not a task.
 */
export const DashboardStats = async () => {
  const payload = await getPayload({ config })

  const [newLeads, weekLeads, totalLeads, contacted, quoted, won, products, categories, brands, recent] =
    await Promise.all([
      payload.count({ collection: 'leads', where: { status: { equals: 'new' } } }),
      payload.count({ collection: 'leads', where: { createdAt: { greater_than: startOfDaysAgo(7) } } }),
      payload.count({ collection: 'leads' }),
      payload.count({ collection: 'leads', where: { status: { equals: 'contacted' } } }),
      payload.count({ collection: 'leads', where: { status: { equals: 'quoted' } } }),
      payload.count({ collection: 'leads', where: { status: { equals: 'won' } } }),
      payload.count({ collection: 'products' }),
      payload.count({ collection: 'categories' }),
      payload.count({ collection: 'brands' }),
      payload.find({ collection: 'leads', limit: 5, sort: '-createdAt', depth: 1 }),
    ])

  const pipeline = [
    { label: 'New', value: newLeads.totalDocs, tone: 'urgent' },
    { label: 'Contacted', value: contacted.totalDocs, tone: 'plain' },
    { label: 'Quoted', value: quoted.totalDocs, tone: 'plain' },
    { label: 'Won', value: won.totalDocs, tone: 'good' },
  ]

  const catalogue = [
    { label: 'Products', value: products.totalDocs, href: '/admin/collections/products' },
    { label: 'Categories', value: categories.totalDocs, href: '/admin/collections/categories' },
    { label: 'Brands', value: brands.totalDocs, href: '/admin/collections/brands' },
  ]

  return (
    <section className="gr-stats">
      <div className="gr-stats__headline">
        <div>
          <p className="gr-stats__eyebrow">Needs your attention</p>
          <p className="gr-stats__big">
            {newLeads.totalDocs}
            <span> new quote {newLeads.totalDocs === 1 ? 'request' : 'requests'}</span>
          </p>
          <p className="gr-stats__sub">
            {weekLeads.totalDocs} received in the last 7 days · {totalLeads.totalDocs} all time
          </p>
        </div>
        <Link className="gr-stats__cta" href="/admin/collections/leads?where[status][equals]=new">
          Open quote requests
        </Link>
      </div>

      <div className="gr-stats__row">
        {pipeline.map((item) => (
          <div key={item.label} className={`gr-stat gr-stat--${item.tone}`}>
            <span className="gr-stat__value">{item.value}</span>
            <span className="gr-stat__label">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="gr-stats__split">
        <div className="gr-stats__panel">
          <h3 className="gr-stats__panel-title">Latest enquiries</h3>
          {recent.docs.length === 0 ? (
            <p className="gr-stats__empty">No quote requests yet.</p>
          ) : (
            <ul className="gr-stats__list">
              {recent.docs.map((lead) => (
                <li key={lead.id}>
                  <Link href={`/admin/collections/leads/${lead.id}`}>
                    <span className="gr-stats__name">{lead.name}</span>
                    <span className="gr-stats__meta">
                      {typeof lead.product === 'object' && lead.product
                        ? lead.product.name
                        : 'General enquiry'}
                    </span>
                  </Link>
                  <span className={`gr-tag gr-tag--${lead.status}`}>{lead.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="gr-stats__panel">
          <h3 className="gr-stats__panel-title">Catalogue</h3>
          <ul className="gr-stats__list gr-stats__list--counts">
            {catalogue.map((item) => (
              <li key={item.label}>
                <Link href={item.href}>
                  <span className="gr-stats__name">{item.label}</span>
                </Link>
                <span className="gr-stats__count">{item.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
