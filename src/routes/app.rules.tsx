import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { AlertTriangle, Network, Plus, Save, Trash2, Zap, CalendarClock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ObjectTag } from '@/components/kinfold'
import {
  matchMethods,
  objectFields,
  ruleSets as seedRuleSets,
  survivorRules,
  type MatchMethod,
  type RuleSet,
  type SurvivorRule,
} from '@/lib/fixtures'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/app/rules')({
  head: () => ({ meta: [{ title: 'Matching rules · Kinfold' }] }),
  component: Rules,
})

const selectCls =
  'h-9 w-full rounded-md border border-input bg-card px-2.5 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'

/** Deterministic score distribution for the live threshold preview (stub). */
function distribution(seed: number) {
  const bins: { score: number; count: number }[] = []
  for (let s = 50; s <= 100; s += 2) {
    const base = 900 * Math.exp(-(((s - 62) / 10) ** 2)) + 260 * Math.exp(-(((s - 95) / 3.5) ** 2)) + 40
    bins.push({ score: s, count: Math.round(base * seed + ((s * 37) % 23)) })
  }
  return bins
}

function Rules() {
  const [sets, setSets] = React.useState<RuleSet[]>(seedRuleSets)
  const [activeId, setActiveId] = React.useState(seedRuleSets[0].id)
  const [dirty, setDirty] = React.useState(false)
  const rs = sets.find((r) => r.id === activeId)!

  const update = (patch: Partial<RuleSet>) => {
    setSets((all) => all.map((r) => (r.id === activeId ? { ...r, ...patch } : r)))
    setDirty(true)
  }

  const seed = rs.object === 'Lead' ? 1 : rs.object === 'Account' ? 0.55 : 0.72
  const bins = React.useMemo(() => distribution(seed), [seed])
  const maxCount = Math.max(...bins.map((b) => b.count))
  const sum = (pred: (s: number) => boolean) => bins.filter((b) => pred(b.score)).reduce((a, b) => a + b.count, 0)
  const autoN = sum((s) => s >= rs.autoThreshold)
  const reviewN = sum((s) => s >= rs.reviewThreshold && s < rs.autoThreshold)
  const ignoreN = sum((s) => s < rs.reviewThreshold)
  const weightTotal = rs.conditions.reduce((a, c) => a + c.weight, 0)
  const fields = objectFields[rs.object]

  function save() {
    setDirty(false)
    toast.success(`Saved “${rs.name}”`, {
      description: `${autoN.toLocaleString('en-US')} clusters will auto-merge on the next ${rs.schedule.toLowerCase()} run.`,
    })
  }

  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:py-10">
      <header className="rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-signal">Matching rules</p>
          <h1 className="mt-1 font-display text-4xl sm:text-5xl">How Kinfold decides</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Each rule set gives weights to field comparisons and sets two thresholds. The preview updates as you edit,
            before anything changes in Salesforce.
          </p>
        </div>
        <Button onClick={save} disabled={!dirty || weightTotal !== 100}>
          <Save /> {dirty ? 'Save changes' : 'Saved'}
        </Button>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[15rem_1fr]">
        <nav aria-label="Rule sets" className="rise flex gap-2 overflow-x-auto lg:flex-col [animation-delay:60ms]">
          {sets.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveId(r.id)}
              aria-current={r.id === activeId}
              className={cn(
                'shrink-0 rounded-lg border px-4 py-3 text-left transition-colors motion-reduce:transition-none',
                r.id === activeId ? 'border-primary bg-card shadow-sm' : 'bg-transparent hover:bg-card',
              )}
            >
              <ObjectTag object={r.object} />
              <p className="mt-2 text-sm font-medium">{r.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {r.active ? 'Active' : 'Paused'} · {r.conditions.length} signals · {r.schedule}
              </p>
            </button>
          ))}
        </nav>

        <div className="rise min-w-0 space-y-6 [animation-delay:120ms]">
          {/* Name + active */}
          <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-card p-5">
            <div className="min-w-60 flex-1">
              <Label htmlFor="rs-name" className="text-xs text-muted-foreground">Rule set name</Label>
              <Input id="rs-name" value={rs.name} onChange={(e) => update({ name: e.target.value })} className="mt-1.5" />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="rs-active" checked={rs.active} onCheckedChange={(v) => update({ active: v })} />
              <Label htmlFor="rs-active">{rs.active ? 'Active' : 'Paused'}</Label>
            </div>
          </div>

          {/* Threshold preview */}
          <section className="rounded-lg border bg-card p-5" aria-labelledby="thr">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="thr" className="font-semibold">Thresholds, with a live preview</h2>
              <p className="text-xs text-muted-foreground">Existing {rs.object} clusters by score</p>
            </div>
            <div className="mt-5 flex h-32 items-end gap-[3px]" role="img" aria-label={`${autoN} auto-merge, ${reviewN} review, ${ignoreN} ignored`}>
              {bins.map((b) => (
                <div
                  key={b.score}
                  title={`Score ${b.score}–${b.score + 1}: ${b.count} clusters`}
                  className={cn(
                    'flex-1 rounded-t-[2px] transition-colors motion-reduce:transition-none',
                    b.score >= rs.autoThreshold ? 'bg-match-high' : b.score >= rs.reviewThreshold ? 'bg-match-mid' : 'bg-match-low/30',
                  )}
                  style={{ height: `${Math.max(3, (b.count / maxCount) * 100)}%` }}
                />
              ))}
            </div>
            <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <ThresholdSlider
                id="auto"
                label="Auto-merge at or above"
                value={rs.autoThreshold}
                min={Math.max(rs.reviewThreshold + 2, 80)}
                onChange={(v) => update({ autoThreshold: v })}
              />
              <ThresholdSlider
                id="review"
                label="Send to review at or above"
                value={rs.reviewThreshold}
                min={50}
                max={rs.autoThreshold - 2}
                onChange={(v) => update({ reviewThreshold: v })}
              />
            </div>

            <dl className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-md border bg-border text-center">
              {[
                ['Auto-merge', autoN, 'text-match-high'],
                ['Review queue', reviewN, 'text-[oklch(0.5_0.12_70)]'],
                ['Ignored', ignoreN, 'text-muted-foreground'],
              ].map(([l, n, c]) => (
                <div key={l as string} className="bg-background px-3 py-3">
                  <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{l}</dt>
                  <dd className={cn('mt-1 font-mono text-xl font-medium', c as string)}>{(n as number).toLocaleString('en-US')}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Signals */}
          <section className="rounded-lg border bg-card p-5" aria-labelledby="sig">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="sig" className="font-semibold">Match signals</h2>
              <p className={cn('flex items-center gap-1.5 text-xs', weightTotal === 100 ? 'text-muted-foreground' : 'text-destructive')}>
                {weightTotal !== 100 && <AlertTriangle className="size-3.5" aria-hidden />}
                Weights total <span className="font-mono">{weightTotal}</span> / 100
              </p>
            </div>
            <ul className="mt-4 space-y-3">
              {rs.conditions.map((c) => (
                <li key={c.id} className="grid grid-cols-2 items-center gap-3 rounded-md border bg-background p-3 sm:grid-cols-[1fr_1.3fr_1.4fr_auto]">
                  <select
                    aria-label="Field"
                    className={selectCls}
                    value={c.field}
                    onChange={(e) => update({ conditions: rs.conditions.map((x) => (x.id === c.id ? { ...x, field: e.target.value } : x)) })}
                  >
                    {fields.map((f) => <option key={f}>{f}</option>)}
                  </select>
                  <select
                    aria-label="Comparison method"
                    className={selectCls}
                    value={c.method}
                    onChange={(e) => update({ conditions: rs.conditions.map((x) => (x.id === c.id ? { ...x, method: e.target.value as MatchMethod } : x)) })}
                  >
                    {matchMethods.map((m) => <option key={m}>{m}</option>)}
                  </select>
                  <div className="col-span-2 flex items-center gap-3 sm:col-span-1">
                    <input
                      type="range"
                      min={0}
                      max={60}
                      value={c.weight}
                      aria-label={`Weight for ${c.field}`}
                      onChange={(e) => update({ conditions: rs.conditions.map((x) => (x.id === c.id ? { ...x, weight: Number(e.target.value) } : x)) })}
                      className="w-full accent-[var(--signal)]"
                    />
                    <span className="w-8 text-right font-mono text-sm tabular-nums">{c.weight}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove ${c.field} signal`}
                    onClick={() => update({ conditions: rs.conditions.filter((x) => x.id !== c.id) })}
                    className="justify-self-end"
                  >
                    <Trash2 />
                  </Button>
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() =>
                update({
                  conditions: [...rs.conditions, { id: `n${Date.now()}`, field: fields[0], method: 'Fuzzy (Jaro-Winkler)', weight: 0 }],
                })
              }
            >
              <Plus /> Add signal
            </Button>
          </section>

          {/* Automation */}
          <section className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-3" aria-label="Automation">
            <Toggle
              icon={Zap}
              id="rt"
              title="Block at entry"
              body="Check web forms, API inserts, and imports against this rule before the record is saved."
              checked={rs.realTime}
              onChange={(v) => update({ realTime: v })}
            />
            <Toggle
              icon={Network}
              id="xo"
              title="Match to Accounts"
              body="Link Leads to the existing Account they belong to, matched by domain and company name."
              checked={rs.crossObject}
              onChange={(v) => update({ crossObject: v })}
              disabled={rs.object !== 'Lead'}
            />
            <div className="bg-card p-5">
              <CalendarClock className="size-4 text-signal" aria-hidden />
              <Label htmlFor="sched" className="mt-3 block font-semibold">Scheduled scan</Label>
              <p className="mt-1 text-xs text-muted-foreground">Re-scan the whole object and auto-merge anything above the threshold.</p>
              <select
                id="sched"
                className={cn(selectCls, 'mt-3')}
                value={rs.schedule}
                onChange={(e) => update({ schedule: e.target.value as RuleSet['schedule'] })}
              >
                {(['Off', 'Hourly', 'Nightly', 'Weekly'] as const).map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </section>

          {/* Survivorship */}
          <section className="rounded-lg border bg-card p-5" aria-labelledby="surv">
            <h2 id="surv" className="font-semibold">Survivorship</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Sets which value is kept for each field on a merge. Reviewers can still change any field in the merge
              screen.
            </p>
            <div className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {fields.map((f) => (
                <div key={f} className="flex items-center justify-between gap-3">
                  <Label htmlFor={`sv-${f}`} className="text-sm">{f}</Label>
                  <select
                    id={`sv-${f}`}
                    className={cn(selectCls, 'w-48')}
                    value={rs.survivorship[f] ?? 'Master record'}
                    onChange={(e) => update({ survivorship: { ...rs.survivorship, [f]: e.target.value as SurvivorRule } })}
                  >
                    {survivorRules.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function ThresholdSlider({
  id,
  label,
  value,
  min,
  max = 99,
  onChange,
}: {
  id: string
  label: string
  value: number
  min: number
  max?: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <Label htmlFor={id} className="text-sm">{label}</Label>
        <span className="font-mono text-lg font-medium">{value}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[var(--signal)]"
      />
    </div>
  )
}

function Toggle({
  icon: Icon,
  id,
  title,
  body,
  checked,
  onChange,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>
  id: string
  title: string
  body: string
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className={cn('bg-card p-5', disabled && 'opacity-55')}>
      <div className="flex items-center justify-between">
        <Icon className="size-4 text-signal" />
        <Switch id={id} checked={checked && !disabled} onCheckedChange={onChange} disabled={disabled} />
      </div>
      <Label htmlFor={id} className="mt-3 block font-semibold">{title}</Label>
      <p className="mt-1 text-xs text-muted-foreground">{disabled ? 'Only available for Lead rule sets.' : body}</p>
    </div>
  )
}
