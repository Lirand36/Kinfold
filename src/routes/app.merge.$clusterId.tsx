import * as React from 'react'
import { createFileRoute, Link, notFound, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ArrowLeft, Ban, Check, Combine, Crown, Network } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ObjectTag, ScoreMeter, Similarity, relTime } from '@/components/kinfold'
import { useWorkspace } from '@/lib/workspace-store'
import { clusters, objectFields, type Cluster } from '@/lib/fixtures'
import { countChanged, defaultMasterIndex, defaultSelections, survivorRuleFor } from '@/lib/merge'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/app/merge/$clusterId')({
  loader: ({ params }) => {
    const cluster = clusters.find((c) => c.id === params.clusterId)
    if (!cluster) throw notFound()
    return { cluster }
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `Merge ${loaderData?.cluster.records[0].fields.Name ?? 'cluster'} · Kinfold` }],
  }),
  component: MergeWorkspace,
})

function MergeWorkspace() {
  const { cluster } = Route.useLoaderData()
  // Keyed so selections reset when moving to the next cluster.
  return <Workspace key={cluster.id} cluster={cluster} />
}

function Workspace({ cluster }: { cluster: Cluster }) {
  const { openClusters, merge, dismiss, undo } = useWorkspace()
  const navigate = useNavigate()
  const fields = objectFields[cluster.object]
  const [master, setMaster] = React.useState(() => defaultMasterIndex(cluster.records))
  const [picks, setPicks] = React.useState(() => defaultSelections(cluster, master, fields))
  const [convert, setConvert] = React.useState(true)

  const isOpen = openClusters.some((c) => c.id === cluster.id)
  const changed = countChanged(cluster, master, picks)
  const contribution = cluster.signals.map((s) => ({ ...s, points: s.similarity * s.weight }))
  const nextCluster = openClusters.find((c) => c.id !== cluster.id)

  function chooseMaster(i: number) {
    setMaster(i)
    setPicks(defaultSelections(cluster, i, fields))
  }

  function goNext() {
    if (nextCluster) navigate({ to: '/app/merge/$clusterId', params: { clusterId: nextCluster.id } })
    else navigate({ to: '/app' })
  }

  function doMerge() {
    const survivor = cluster.records[master].fields.Name
    const ev = merge(cluster, { survivor, fieldsChanged: changed, mode: 'Manual' })
    toast.success(`Merged into ${survivor}`, {
      description: `${cluster.records.length - 1} record${cluster.records.length > 2 ? 's' : ''} absorbed · ${changed} field${changed === 1 ? '' : 's'} updated`,
      action: { label: 'Undo', onClick: () => undo(ev.id) },
    })
    goNext()
  }

  function notDuplicate() {
    dismiss(cluster.id)
    toast('Marked as not a duplicate', {
      description: 'This pair is excluded from future scans and the rule set is updated.',
    })
    goNext()
  }

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement
      if (!isOpen || e.metaKey || e.ctrlKey || e.altKey || t.closest('input,textarea,[role=switch]')) return
      if (e.key === 'm') doMerge()
      if (e.key === 'n') notDuplicate()
      const n = Number(e.key)
      if (n >= 1 && n <= cluster.records.length) chooseMaster(n - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const cols = cluster.records.length

  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:py-10">
      <Link to="/app" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Review queue
      </Link>

      <header className="rise mt-4 flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <ObjectTag object={cluster.object} />
            <span className="font-mono text-xs text-muted-foreground">{cluster.id}</span>
          </div>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl">
            {[...new Set(cluster.records.map((r) => r.fields.Name))].join(' / ')}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {cluster.records.length} records · detected by {cluster.detectedBy.toLowerCase()} {relTime(cluster.detectedAt)}
          </p>
        </div>
        <ScoreMeter score={cluster.score} className="w-56" />
      </header>

      {!isOpen && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-match-high/40 bg-match-high/10 px-4 py-3 text-sm">
          <span className="flex items-center gap-2">
            <Check className="size-4 text-match-high" aria-hidden /> This cluster has been resolved. You can undo it from Merge history.
          </span>
          <Button asChild size="sm" variant="outline">
            <Link to="/app/history">Merge history</Link>
          </Button>
        </div>
      )}

      {cluster.crossObject && (
        <div className="rise mt-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-accent/50 px-4 py-3 [animation-delay:60ms]">
          <div className="flex items-start gap-3 text-sm">
            <Network className="mt-0.5 size-4 shrink-0 text-accent-foreground" aria-hidden />
            <p>
              These Leads match the existing Account <strong>{cluster.crossObject.accountName}</strong>{' '}
              <span className="font-mono text-xs text-muted-foreground">{cluster.crossObject.accountId}</span>, matched by
              company name and email domain.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="convert" checked={convert} onCheckedChange={setConvert} />
            <Label htmlFor="convert" className="text-sm">Convert survivor to a Contact on this Account</Label>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_18rem]">
        {/* Comparison grid */}
        <section aria-label="Field comparison" className="rise min-w-0 overflow-x-auto rounded-lg border bg-card [animation-delay:120ms]">
          <div
            className="grid min-w-[40rem] text-sm"
            style={{ gridTemplateColumns: `8.5rem repeat(${cols}, minmax(10rem, 1fr)) minmax(10rem, 1fr)` }}
          >
            {/* header */}
            <div className="border-b bg-muted/50 px-3 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Field
            </div>
            {cluster.records.map((r, i) => (
              <div key={r.id} className={cn('border-b border-l px-3 py-3', i === master && 'bg-primary/[0.04]')}>
                <button
                  onClick={() => chooseMaster(i)}
                  aria-pressed={i === master}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-sm px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wider transition-colors motion-reduce:transition-none',
                    i === master ? 'bg-primary text-primary-foreground' : 'border text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Crown className="size-3" aria-hidden />
                  {i === master ? 'Master' : `Make master (${i + 1})`}
                </button>
                <p className="mt-2 truncate font-mono text-[11px] text-muted-foreground">{r.id}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {r.owner} · created {r.createdAt}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-mono text-foreground">{r.activities}</span> activities ·{' '}
                  <span className="font-mono text-foreground">{r.openOpps}</span> open opps
                </p>
              </div>
            ))}
            <div className="border-b border-l bg-match-high/[0.07] px-3 py-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-match-high">Result</p>
              <p className="mt-2 text-xs text-muted-foreground">{changed} field{changed === 1 ? '' : 's'} differ from master</p>
            </div>

            {/* rows */}
            {fields.map((f) => {
              const values = cluster.records.map((r) => r.fields[f] ?? '')
              const allSame = values.every((v) => v.trim().toLowerCase() === values[0].trim().toLowerCase())
              return (
                <div key={f} className="contents">
                  <div className="border-b px-3 py-2.5">
                    <p className="text-xs font-medium">{f}</p>
                    <p className="text-[10px] text-muted-foreground">{survivorRuleFor(cluster, f)}</p>
                  </div>
                  {values.map((v, i) => {
                    const chosen = picks[f] === i
                    return (
                      <button
                        key={i}
                        disabled={!v}
                        onClick={() => setPicks((p) => ({ ...p, [f]: i }))}
                        aria-pressed={chosen}
                        aria-label={`Use ${v || 'empty'} for ${f}`}
                        className={cn(
                          'group relative border-b border-l px-3 py-2.5 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset motion-reduce:transition-none',
                          i === master && 'bg-primary/[0.04]',
                          chosen ? 'font-medium' : 'text-muted-foreground',
                          v ? 'hover:bg-accent/60' : 'cursor-default',
                          !allSame && chosen && 'bg-match-high/10',
                        )}
                      >
                        <span className="flex items-start gap-2">
                          <span
                            className={cn(
                              'mt-1 size-2.5 shrink-0 rounded-full border',
                              chosen ? 'border-match-high bg-match-high' : 'border-border',
                            )}
                            aria-hidden
                          />
                          <span className="break-words">{v || <span className="italic opacity-50">empty</span>}</span>
                        </span>
                      </button>
                    )
                  })}
                  <div className="border-b border-l bg-match-high/[0.07] px-3 py-2.5 font-medium break-words">
                    {cluster.records[picks[f]]?.fields[f] || <span className="italic text-muted-foreground">empty</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Explanation */}
        <aside className="rise space-y-6 [animation-delay:180ms]">
          <div className="rounded-lg border bg-card p-5">
            <h2 className="text-sm font-semibold">Why these match</h2>
            <p className="mt-1 text-xs text-muted-foreground">Each signal’s similarity × weight adds up to the score.</p>
            <ul className="mt-4 space-y-3">
              {contribution.map((s) => (
                <li key={s.field}>
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="font-medium">{s.field}</span>
                    <Similarity value={s.similarity} />
                  </div>
                  <div className="mt-1 flex h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="bg-match-high" style={{ width: `${s.points}%` }} />
                    <div className="bg-match-high/25" style={{ width: `${s.weight - s.points}%` }} />
                  </div>
                  <p className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                    <span>{s.method}</span>
                    <span className="font-mono">
                      +{s.points.toFixed(1)} / {s.weight}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border bg-card p-5 text-sm">
            <h2 className="font-semibold">On merge</h2>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>
                <span className="font-mono text-foreground">
                  {cluster.records.reduce((a, r, i) => (i === master ? a : a + r.activities), 0)}
                </span>{' '}
                activities move to the master
              </li>
              <li>
                <span className="font-mono text-foreground">
                  {cluster.records.reduce((a, r, i) => (i === master ? a : a + r.openOpps), 0)}
                </span>{' '}
                open opportunities are re-parented
              </li>
              <li>Owner stays {cluster.records[master].owner}</li>
              {cluster.crossObject && convert && <li>Survivor converts onto {cluster.crossObject.accountName}</li>}
              <li>A snapshot is kept for 30 days so you can undo</li>
            </ul>
          </div>
        </aside>
      </div>

      {isOpen && (
        <div className="sticky bottom-4 z-10 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card/95 px-4 py-3 shadow-lg backdrop-blur">
          <p className="hidden text-xs text-muted-foreground sm:block">
            Shortcuts: <Kbd>1</Kbd>–<Kbd>{String(cols)}</Kbd> set master · <Kbd>M</Kbd> merge · <Kbd>N</Kbd> not a duplicate
          </p>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={notDuplicate}>
              <Ban /> Not a duplicate
            </Button>
            <Button onClick={doMerge} className="bg-signal text-signal-foreground hover:bg-signal/90">
              <Combine /> Merge {cluster.records.length} records
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="rounded-sm border bg-muted px-1 font-mono text-[10px] text-foreground">{children}</kbd>
}
