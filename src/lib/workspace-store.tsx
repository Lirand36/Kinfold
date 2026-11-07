import * as React from 'react'
import {
  clusters as seedClusters,
  mergeHistory as seedHistory,
  type Cluster,
  type MergeEvent,
} from '@/lib/fixtures'

/**
 * Client-side session state for the stubbed product surface.
 */
interface WorkspaceState {
  openClusters: Cluster[]
  history: MergeEvent[]
  merge: (
    cluster: Cluster,
    opts: { survivor: string; fieldsChanged: number; mode: MergeEvent['mode'] },
  ) => MergeEvent
  dismiss: (clusterId: string) => void
  undo: (eventId: string) => void
}

const WorkspaceContext = React.createContext<WorkspaceState | null>(null)

let seq = 5532

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [resolved, setResolved] = React.useState<Set<string>>(() => new Set())
  const [history, setHistory] = React.useState<MergeEvent[]>(seedHistory)

  const openClusters = React.useMemo(
    () => seedClusters.filter((c) => !resolved.has(c.id)),
    [resolved],
  )

  const value = React.useMemo<WorkspaceState>(
    () => ({
      openClusters,
      history,
      merge: (cluster, { survivor, fieldsChanged, mode }) => {
        const event: MergeEvent = {
          id: `m-${seq++}`,
          clusterId: cluster.id,
          object: cluster.object,
          survivor,
          merged: cluster.records.length,
          mode,
          by: mode === 'Manual' ? 'You' : 'You (bulk)',
          at: new Date().toISOString(),
          fieldsChanged,
        }
        setResolved((s) => new Set(s).add(cluster.id))
        setHistory((h) => [event, ...h])
        return event
      },
      dismiss: (clusterId) => setResolved((s) => new Set(s).add(clusterId)),
      undo: (eventId) => {
        setHistory((h) => {
          const ev = h.find((e) => e.id === eventId)
          if (ev) {
            setResolved((s) => {
              const next = new Set(s)
              next.delete(ev.clusterId)
              return next
            })
          }
          return h.map((e) => (e.id === eventId ? { ...e, undone: true } : e))
        })
      },
    }),
    [openClusters, history],
  )

  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const ctx = React.useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used inside WorkspaceProvider')
  return ctx
}
