import { Building2, Contact2, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import { tierFor, type ObjectType, type Tier } from '@/lib/fixtures'

export const tierLabel: Record<Tier, string> = {
  auto: 'Auto-merge',
  review: 'Needs review',
  possible: 'Possible',
}

const tierColor: Record<Tier, string> = {
  auto: 'bg-match-high',
  review: 'bg-match-mid',
  possible: 'bg-match-low',
}

const tierText: Record<Tier, string> = {
  auto: 'text-match-high',
  review: 'text-[oklch(0.5_0.12_70)]',
  possible: 'text-muted-foreground',
}

export function ScoreMeter({
  score,
  className,
  showLabel = true,
}: {
  score: number
  className?: string
  showLabel?: boolean
}) {
  const tier = tierFor(score)
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="font-mono text-lg font-medium tabular-nums w-9">{score}</span>
      <div className="flex-1 min-w-16">
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={cn('h-full rounded-full', tierColor[tier])}
            style={{ width: `${score}%` }}
          />
        </div>
        {showLabel && (
          <span className={cn('mt-1 block text-[11px] font-medium uppercase tracking-wider', tierText[tier])}>
            {tierLabel[tier]}
          </span>
        )}
      </div>
    </div>
  )
}

const objectIcon = { Lead: UserRound, Contact: Contact2, Account: Building2 }

export function ObjectTag({ object, className }: { object: ObjectType; className?: string }) {
  const Icon = objectIcon[object]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border bg-card px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground',
        className,
      )}
    >
      <Icon className="size-3" aria-hidden />
      {object}
    </span>
  )
}

export function Similarity({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  return (
    <span
      className={cn(
        'font-mono text-xs tabular-nums',
        pct >= 95 ? 'text-match-high' : pct >= 80 ? 'text-[oklch(0.5_0.12_70)]' : 'text-muted-foreground',
      )}
    >
      {pct}%
    </span>
  )
}

export function KinfoldMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-7', className)} aria-hidden>
      <rect x="3" y="6" width="16" height="20" rx="3" fill="currentColor" opacity="0.35" />
      <rect x="13" y="6" width="16" height="20" rx="3" fill="currentColor" opacity="0.35" />
      <path d="M13 9a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3h0a3 3 0 0 1-3-3Z" fill="var(--signal)" />
    </svg>
  )
}

/** Fixtures are pinned to this moment so SSR and client render identically. */
const FIXTURE_NOW = Date.parse('2026-11-07T19:30:00Z')

export function relTime(iso: string) {
  const mins = (FIXTURE_NOW - Date.parse(iso)) / 60000
  if (mins < 1) return 'just now'
  if (mins < 60) return `${Math.round(mins)}m ago`
  if (mins < 60 * 24) return `${Math.round(mins / 60)}h ago`
  return `${Math.round(mins / 1440)}d ago`
}
