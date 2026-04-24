import { getLocale } from 'next-intl/server'
import { getTermsContent } from '@/lib/legal/terms'

export default async function TermsPage() {
  const locale = await getLocale()
  const content = getTermsContent(locale)

  return (
    <main className="min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-display text-4xl font-800 text-paper mb-2">{content.title}</h1>
        <p className="text-muted font-body text-sm mb-4">{content.lastUpdated}</p>

        {content.disclaimer && (
          <div className="mb-10 p-4 bg-accent/5 border border-accent/20 rounded-xl">
            <p className="text-xs text-accent font-body">{content.disclaimer}</p>
          </div>
        )}

        <div className="space-y-10 font-body text-muted leading-relaxed">
          {content.sections.map((section, i) => (
            <section key={i}>
              <h2 className="font-display text-xl font-700 text-paper mb-3">{section.title}</h2>

              {section.content && (
                <p className={section.list ? 'mb-3' : section.extra ? 'mb-3' : ''}>
                  {section.content}
                </p>
              )}

              {section.list && (
                <ul className="space-y-2 ml-4 mb-3">
                  {section.list.map((item, j) => (
                    <li key={j}>• {item}</li>
                  ))}
                </ul>
              )}

              {section.extra && (
                <p className={section.extra2 ? 'mb-3' : ''}>{section.extra}</p>
              )}

              {section.extra2 && <p>{section.extra2}</p>}

              {section.contacts && (
                <div className="space-y-1">
                  {section.contacts.map((c, j) => (
                    <p key={j}>
                      {c.label}:{' '}
                      <a href={`mailto:${c.email}`} className="text-accent hover:underline">
                        {c.email}
                      </a>
                    </p>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}