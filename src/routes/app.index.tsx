import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ArrowRight, Combine, Inbox, Network, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { ObjectTag, ScoreMeter, relTime, tierLabel } from '@/components/kinfold'
import { useWorkspace } from '@/lib/workspace-store'
import { healthTrend, objectFields, stats, tierFor, type ObjectType, type Tier } from '@/lib/fixtures'
import { clusterTitle, countChanged, defaultMasterIndex, defaultSelections } from '@/lib/merge'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/app/')({
  head: () => ({ meta: [{ title: 'Review queue · Kinfold' }] }),
  component: Queue,
})

const objectFilters: ('All' | ObjectType)[] = ['All', 'Lead', 'Contact', 'Account']
const tierFilters: ('all' | Tier)[] = ['all', 'auto', 'review', 'possible']

function Queue() {
  const { openClusters, merge, undo } = useWorkspace()
  const [object, setObject] = React.useState<'All' | ObjectType>('All')
  const [tier, setTier] = React.useState<'all' | Tier>('all')
  const [q, setQ] = React.useState('')
  const [selected, setSelected] = React.useState<Set<string>>(() => new Set())

  const visible = openClusters.filter((c) => {
    if (object !== 'All' && c.object !== object) return false
    if (tier !== 'all' && tierFor(c.score) !== tier) return false
    if (q) {
      const hay = c.records.flatMap((r) => Object.values(r.fields)).join(' ').toLowerCase()
      if (!hay.includes(q.toLowerCase())) return false
    }
    return true
  })

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })

  const allChecked = visible.length > 0 && visible.every((c) => selected.has(c.id))

  function bulkMerge() {
    const targets = openClusters.filter((c) => selected.has(c.id))
    const events = targets.map((c) => {
      const master = defaultMasterIndex(c.records)
      const picks = defaultSelections(c, master, objectFields[c.object])
      return merge(c, {
        survivor: c.records[master].fields.Name,
        fieldsChanged: countChanged(c, master, picks),
        mode: 'Bulk',
      })
    })
    setSelected(new Set())
    toast.success(`Merged ${events.length} cluster${events.length === 1 ? '' : 's'}`, {
      description: 'Survivorship rules applied. A snapshot of each merge is in Merge history.',
      action: { label: 'Undo', onClick: () => events.forEach((e) => undo(e.id)) },
    })
  }

  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:py-10">
      <header className="rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-signal">Review queue</p>
          <h1 className="mt-1 font-display text-4xl sm:text-5xl">Duplicates to review</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Clusters scoring 92 or higher merge automatically each night. The clusters below scored lower and need a
            person to decide.
          </p>
        </div>
      </header>

      <section aria-label="Org health" className="rise mt-8 grid gap-px overflow-hidden rounded-lg border bg-border [animation-delay:80ms] sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex items-end justify-between gap-4 bg-card p-5">
          <div>
            <p className="text-xs text-muted-foreground">Data health score</p>
            <p className="mt-1 font-mono text-3xl font-medium">{stats.healthScore}</p>
            <p className="mt-1 text-xs text-match-high">+14.9 pts in 8 weeks</p>
          </div>
          <Sparkline values={healthTrend} />
        </div>
        <Stat label="Open clusters" value={stats.openClusters.toLocaleString('en-US')} hint="across 3 objects" />
        <Stat label="Auto-merged this week" value={stats.autoMergedWeek.toLocaleString('en-US')} hint="0 undone" />
        <Stat label="Blocked at entry" value={stats.blockedAtEntry.toLocaleString('en-US')} hint="web forms, imports, API" />
      </section>

      <div className="rise mt-8 flex flex-wrap items-center gap-3 [animation-delay:140ms]">
        <div role="group" aria-label="Object" className="flex rounded-md border bg-card p-0.5">
          {objectFilters.map((o) => (
            <button
              key={o}
              onClick={() => setObject(o)}
              aria-pressed={object === o}
              className={cn(
                'rounded-[5px] px-3 py-1.5 text-sm transition-colors motion-reduce:transition-none',
                object === o ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {o === 'All' ? 'All objects' : `${o}s`}
            </button>
          ))}
        </div>
        <div role="group" aria-label="Confidence" className="flex rounded-md border bg-card p-0.5">
          {tierFilters.map((t) => (
            <button
              key={t}
              onClick={() => setTier(t)}
              aria-pressed={tier === t}
              className={cn(
                'rounded-[5px] px-3 py-1.5 text-sm transition-colors motion-reduce:transition-none',
                tier === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t === 'all' ? 'Any score' : tierLabel[t]}
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search names, emails, companies"
            aria-label="Search clusters"
            className="bg-card pl-9"
          />
        </div>
      </div>

      <div className="rise mt-4 overflow-hidden rounded-lg border bg-card [animation-delay:200ms]">
        <div className="flex items-center gap-4 border-b bg-muted/50 px-4 py-2.5 text-xs text-muted-foreground">
          <Checkbox
            checked={allChecked}
            onCheckedChange={(v) =>
              setSelected(v ? new Set(visible.map((c) => c.id)) : new Set())
            }
            aria-label="Select all visible clusters"
          />
          <span>
            Showing {visible.length} of {openClusters.length} loaded clusters, highest score first
          </span>
        </div>

        {visible.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-accent">
              <Inbox className="size-5 text-accent-foreground" aria-hidden />
            </div>
            <h2 className="mt-4 font-display text-2xl">Nothing left in this view</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Clear the filters, or open Merge history to undo a merge and send its cluster back here.
            </p>
            <div className="mt-5 flex gap-2">
              <Button variant="outline" onClick={() => { setObject('All'); setTier('all'); setQ('') }}>
                Clear filters
              </Button>
              <Button asChild variant="ghost">
                <Link to="/app/history">Merge history</Link>
              </Button>
            </div>
          </div>
        ) : (
          <ul>
            {[...visible]
              .sort((a, b) => b.score - a.score)
              .map((c) => {
                const names = clusterTitle(c)
                return (
                  <li
                    key={c.id}
                    className={cn(
                      'group grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 border-b px-4 py-4 transition-colors last:border-b-0 hover:bg-muted/40 motion-reduce:transition-none md:grid-cols-[auto_9rem_1fr_auto]',
                      selected.has(c.id) && 'bg-accent/40',
                    )}
                  >
                    <Checkbox
                      checked={selected.has(c.id)}
                      onCheckedChange={() => toggle(c.id)}
                      aria-label={`Select cluster ${names.join(' and ')}`}
                    />
                    <ScoreMeter score={c.score} className="md:order-none" />
                    <div className="col-span-2 min-w-0 md:col-span-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <ObjectTag object={c.object} />
                        <Link
                          to="/app/merge/$clusterId"
                          params={{ clusterId: c.id }}
                          className="truncate font-medium hover:underline"
                        >
                          {names.join('  ·  ')}
                        </Link>
                        <span className="text-xs text-muted-foreground">{c.records.length} records</span>
                        {c.crossObject && (
                          <span className="inline-flex items-center gap-1 rounded-sm bg-accent px-1.5 py-0.5 text-[11px] font-medium text-accent-foreground">
                            <Network className="size-3" aria-hidden /> Matches account {c.crossObject.accountName}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {c.signals.map((s) => (
                          <span
                            key={s.field}
                            title={`${s.method}, ${Math.round(s.similarity * 100)}% similar, weight ${s.weight}`}
                            className="rounded-sm border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                          >
                            {s.field} {Math.round(s.similarity * 100)}%
                          </span>
                        ))}
                        <span className="ml-1 text-xs text-muted-foreground">
                          {c.detectedBy} · {relTime(c.detectedAt)}
                        </span>
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm" className="col-span-2 justify-self-start md:col-span-1 md:justify-self-end">
                      <Link to="/app/merge/$clusterId" params={{ clusterId: c.id }}>
                        Review <ArrowRight />
                      </Link>
                    </Button>
                  </li>
                )
              })}
          </ul>
        )}
      </div>

      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-6 z-30 flex justify-center px-4">
          <div className="rise flex items-center gap-3 rounded-lg bg-primary py-2 pr-2 pl-4 text-primary-foreground shadow-xl">
            <span className="text-sm">
              <span className="font-mono">{selected.size}</span> selected
            </span>
            <Button size="sm" onClick={bulkMerge} className="bg-signal text-signal-foreground hover:bg-signal/90">
              <Combine /> Merge with survivorship rules
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Clear selection"
              onClick={() => setSelected(new Set())}
              className="hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <X />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="bg-card p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-3xl font-medium">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}

function Sparkline({ values }: { values: number[] }) {
  const w = 120
  const h = 40
  const min = Math.min(...values) - 2
  const max = Math.max(...values) + 1
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, h - ((v - min) / (max - min)) * h] as const)
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const last = pts[pts.length - 1]
  return (
    <svg viewBox={`-2 -4 ${w + 6} ${h + 8}`} className="h-10 w-28 shrink-0" role="img" aria-label="Health score rising from 71.4 to 86.3 over 8 weeks">
      <path d={`${d} L${w},${h} L0,${h} Z`} fill="var(--match-high)" opacity="0.1" />
      <path d={d} fill="none" stroke="var(--match-high)" strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="3" fill="var(--match-high)" />
    </svg>
  )
}
