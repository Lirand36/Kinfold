import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { RotateCcw, Bot, UserRound, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ObjectTag, relTime } from '@/components/kinfold'
import { useWorkspace } from '@/lib/workspace-store'
import type { MergeEvent } from '@/lib/fixtures'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/app/history')({
  head: () => ({ meta: [{ title: 'Merge history · Kinfold' }] }),
  component: HistoryPage,
})

const modeIcon: Record<MergeEvent['mode'], React.ComponentType<{ className?: string }>> = {
  'Auto-merge': Bot,
  Manual: UserRound,
  Bulk: Layers,
}

const modes = ['All', 'Auto-merge', 'Manual', 'Bulk'] as const

function HistoryPage() {
  const { history, undo } = useWorkspace()
  const [mode, setMode] = React.useState<(typeof modes)[number]>('All')
  const rows = history.filter((e) => mode === 'All' || e.mode === mode)

  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:py-10">
      <header className="rise">
        <p className="text-xs font-medium uppercase tracking-widest text-signal">Merge history</p>
        <h1 className="mt-1 font-display text-4xl sm:text-5xl">Every merge can be undone</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Kinfold saves a full snapshot before each merge: field values, child records, and ownership. Undo restores
          the original records for up to 30 days.
        </p>
      </header>

      <div role="group" aria-label="Merge type" className="rise mt-8 inline-flex rounded-md border bg-card p-0.5 [animation-delay:80ms]">
        {modes.map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={cn(
              'rounded-[5px] px-3 py-1.5 text-sm transition-colors motion-reduce:transition-none',
              mode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="rise mt-4 overflow-hidden rounded-lg border bg-card [animation-delay:140ms]">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="pl-4">Survivor</TableHead>
              <TableHead>Object</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Records</TableHead>
              <TableHead className="text-right">Fields changed</TableHead>
              <TableHead>By</TableHead>
              <TableHead>When</TableHead>
              <TableHead className="pr-4 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                  No {mode.toLowerCase()} merges yet.
                </TableCell>
              </TableRow>
            )}
            {rows.map((e) => {
              const Icon = modeIcon[e.mode]
              return (
                <TableRow key={e.id} className={cn(e.undone && 'opacity-55')}>
                  <TableCell className="pl-4">
                    <p className={cn('font-medium', e.undone && 'line-through')}>{e.survivor}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {e.id} · {e.clusterId}
                    </p>
                  </TableCell>
                  <TableCell>
                    <ObjectTag object={e.object} />
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-sm">
                      <Icon className="size-3.5 text-muted-foreground" /> {e.mode}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono">{e.merged}</TableCell>
                  <TableCell className="text-right font-mono">{e.fieldsChanged}</TableCell>
                  <TableCell className="text-sm">{e.by}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{relTime(e.at)}</TableCell>
                  <TableCell className="pr-4 text-right">
                    {e.undone ? (
                      <span className="text-xs text-muted-foreground">Restored</span>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          undo(e.id)
                          toast.success(`Restored ${e.merged} records`, {
                            description: `${e.survivor} has been split back into its original records.`,
                          })
                        }}
                      >
                        <RotateCcw /> Undo
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
