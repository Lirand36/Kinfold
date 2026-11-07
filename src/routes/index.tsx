import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Check,
  CornerDownRight,
  History,
  Network,
  ScanSearch,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { KinfoldMark } from '@/components/kinfold'

export const Route = createFileRoute('/')({
  component: Home,
})

const keptFixed = [
  {
    kept: 'Scan every standard and custom object, on a schedule you set',
    fixed: 'Filters you build in plain language instead of nested rule screens',
  },
  {
    kept: 'Match Leads to the Accounts they already belong to',
    fixed: 'Comes with matching on day one, not after a months-long rollout',
  },
  {
    kept: 'Fuzzy matching that catches “Kate” vs “Katherine” and “LLC” vs “Inc.”',
    fixed: 'Each score shows which fields matched and how much each one counted',
  },
  {
    kept: 'Bulk merges for the obvious duplicates',
    fixed: 'Pick the surviving value field by field, and undo any merge for 30 days',
  },
  {
    kept: 'Clean up after imports and integrations',
    fixed: 'Stop duplicates when they are created, before a rep ever sees them',
  },
]

const steps = [
  {
    icon: ScanSearch,
    title: 'Connect and scan',
    body: 'OAuth into your org. Kinfold reads Leads, Contacts, and Accounts and clusters likely duplicates with templates that fit most orgs as they are.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Tune with a live preview',
    body: 'Drag a threshold and see how many clusters move between auto-merge, review, and ignore before you save anything.',
  },
  {
    icon: Sparkles,
    title: 'Review only the hard ones',
    body: 'High-confidence clusters merge on their own. Your queue holds the borderline cases, with every signal laid out side by side.',
  },
  {
    icon: History,
    title: 'Merge without fear',
    body: 'Every merge is a snapshot. Child records, field values, and ownership come back with one click.',
  },
]

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-content items-center justify-between px-4 py-5 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 text-foreground">
          <KinfoldMark />
          <span className="text-lg font-semibold tracking-tight">Kinfold</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <a href="#why" className="hidden px-3 py-2 text-sm text-muted-foreground hover:text-foreground sm:inline">
            Why Kinfold
          </a>
          <a href="#how" className="hidden px-3 py-2 text-sm text-muted-foreground hover:text-foreground sm:inline">
            How it works
          </a>
          <Button asChild size="sm">
            <Link to="/app">
              Open workspace <ArrowRight />
            </Link>
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="paper-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" aria-hidden />
        <div className="relative mx-auto grid max-w-content items-center gap-12 px-4 pt-12 pb-20 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-20 lg:pb-28">
          <div className="rise">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-signal" /> Built for Salesforce admins and RevOps teams
            </p>
            <h1 className="font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Two records.
              <br />
              One truth.
              <br />
              <em className="text-signal">Every merge explained.</em>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Kinfold finds duplicate Leads, Contacts, and Accounts, shows you why they match, and merges them with
              field-level control. If a merge was wrong, you can undo it.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="bg-signal text-signal-foreground hover:bg-signal/90">
                <Link to="/app">
                  Explore the demo org <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/app/rules">See matching rules</Link>
              </Button>
            </div>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t pt-6">
              {[
                ['3,917', 'auto-merged this week'],
                ['642', 'blocked at entry'],
                ['211.5h', 'of manual review saved'],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="sr-only">{l}</dt>
                  <dd className="font-mono text-xl font-medium">{v}</dd>
                  <dd className="mt-1 text-xs text-muted-foreground">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <HeroMergeVisual />
        </div>
      </section>

      {/* Kept / fixed */}
      <section id="why" className="border-y bg-card">
        <div className="mx-auto max-w-content px-4 py-20 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-signal">Why Kinfold</p>
              <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
                What works in today’s dedupe tools, without the parts that don’t.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Rule-based cleanup tools are thorough but hard to configure. Routing platforms match well but are
                expensive and slow to set up. Kinfold does one job, keeping duplicates out of your CRM, and you can
                set it up in an afternoon.
              </p>
            </div>
            <div className="overflow-hidden rounded-lg border">
              <div className="grid grid-cols-2 border-b bg-muted/60 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <div className="px-5 py-3">What we kept</div>
                <div className="border-l px-5 py-3">What we fixed</div>
              </div>
              {keptFixed.map((row, i) => (
                <div key={i} className="grid grid-cols-1 border-b last:border-b-0 sm:grid-cols-2">
                  <div className="flex gap-3 px-5 py-4 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-match-high" aria-hidden />
                    {row.kept}
                  </div>
                  <div className="flex gap-3 border-t bg-accent/40 px-5 py-4 text-sm sm:border-t-0 sm:border-l">
                    <CornerDownRight className="mt-0.5 size-4 shrink-0 text-signal" aria-hidden />
                    {row.fixed}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-content px-4 py-20 sm:px-6">
        <p className="text-xs font-medium uppercase tracking-widest text-signal">How it works</p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
          Set it up in an afternoon. It keeps working after that.
        </h2>
        <ol className="mt-12 grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2">
          {steps.map((s, i) => (
            <li key={s.title} className="bg-background p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                <s.icon className="size-5 text-signal" aria-hidden />
              </div>
              <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {[
            { icon: Zap, t: 'Real-time blocking', b: 'Web-to-Lead, integrations, and CSV imports are checked before the record is saved.' },
            { icon: Network, t: 'Lead-to-Account matching', b: 'New Leads are linked to the Account they belong to, so they go to the right owner.' },
            { icon: ShieldCheck, t: 'Audit trail', b: 'Every merge records who ran it, which rule matched, and which values were kept.' },
          ].map((f) => (
            <div key={f.t} className="flex gap-4">
              <f.icon className="mt-1 size-5 shrink-0 text-foreground" aria-hidden />
              <div>
                <h3 className="font-semibold">{f.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.b}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-sidebar text-sidebar-foreground">
        <div className="mx-auto flex max-w-content flex-col items-start justify-between gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center">
          <h2 className="max-w-xl font-display text-4xl leading-tight">
            Your demo org has <em className="text-sidebar-primary">1,284 clusters</em> waiting for review.
          </h2>
          <Button asChild size="lg" className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90">
            <Link to="/app">
              Open the review queue <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="mx-auto flex max-w-content items-center justify-between px-4 py-8 text-xs text-muted-foreground sm:px-6">
        <span>© 2026 Kinfold</span>
        <span>Not affiliated with Salesforce, Inc.</span>
      </footer>
    </div>
  )
}

function HeroMergeVisual() {
  const rows: [string, string, string, 'a' | 'b'][] = [
    ['Name', 'Katherine Oduya', 'Kate Oduya', 'a'],
    ['Email', 'k.oduya@brightwater…', 'K.Oduya@Brightwater…', 'a'],
    ['Phone', '(312) 555-0187', '312.555.0187 x12', 'b'],
    ['Title', 'VP, Procurement', '—', 'a'],
  ]
  return (
    <div className="rise relative [animation-delay:150ms]">
      <div className="absolute -inset-6 -z-10 rounded-3xl bg-accent/50 blur-2xl" aria-hidden />
      <div className="rounded-xl border bg-card shadow-[0_24px_60px_-28px_oklch(0.22_0.02_255/0.35)]">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="size-3.5 text-signal" aria-hidden /> Blocked at entry · Web-to-Lead
          </div>
          <span className="font-mono text-sm font-medium text-match-high">97 match</span>
        </div>
        <div className="grid grid-cols-[5.5rem_1fr_1fr] text-sm">
          <div />
          <div className="border-l px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Existing · 2025
          </div>
          <div className="border-l px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Incoming · today
          </div>
          {rows.map(([f, a, b, keep]) => (
            <div key={f} className="contents">
              <div className="border-t px-4 py-3 text-xs text-muted-foreground">{f}</div>
              <div className={`truncate border-t border-l px-4 py-3 ${keep === 'a' ? 'bg-match-high/10 font-medium' : 'text-muted-foreground line-through decoration-border'}`}>
                {a}
              </div>
              <div className={`truncate border-t border-l px-4 py-3 ${keep === 'b' ? 'bg-match-high/10 font-medium' : 'text-muted-foreground line-through decoration-border'}`}>
                {b}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t bg-muted/50 px-5 py-3">
          <div className="flex flex-wrap gap-1.5">
            {['Email exact · 40', 'Nickname · 25', 'Company · 20'].map((s) => (
              <span key={s} className="rounded-sm border bg-card px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                {s}
              </span>
            ))}
          </div>
          <span className="hidden text-xs font-medium sm:inline">Linked to Brightwater Logistics</span>
        </div>
      </div>
    </div>
  )
}
