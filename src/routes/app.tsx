import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { Inbox, History, SlidersHorizontal, RefreshCw } from 'lucide-react'
import { KinfoldMark } from '@/components/kinfold'
import { WorkspaceProvider, useWorkspace } from '@/lib/workspace-store'
import { clusters, org, stats } from '@/lib/fixtures'

export const Route = createFileRoute('/app')({
  head: () => ({ meta: [{ title: 'Workspace · Kinfold' }] }),
  component: AppLayout,
})

function AppLayout() {
  return (
    <WorkspaceProvider>
      <div className="min-h-screen bg-background lg:grid lg:grid-cols-[15rem_1fr]">
        <Sidebar />
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </WorkspaceProvider>
  )
}

function Sidebar() {
  const { openClusters } = useWorkspace()
  const nav = [
    { to: '/app', label: 'Review queue', icon: Inbox, count: (stats.openClusters - (clusters.length - openClusters.length)).toLocaleString('en-US'), exact: true },
    { to: '/app/rules', label: 'Matching rules', icon: SlidersHorizontal },
    { to: '/app/history', label: 'Merge history', icon: History },
  ] as const

  return (
    <aside className="sticky top-0 z-20 flex flex-col bg-sidebar text-sidebar-foreground lg:h-screen">
      <div className="flex items-center justify-between gap-2 px-4 py-4 lg:px-5 lg:py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <KinfoldMark className="text-sidebar-foreground" />
          <span className="font-semibold tracking-tight">Kinfold</span>
        </Link>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:pb-0" aria-label="Workspace">
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            activeOptions={{ exact: 'exact' in n }}
            className="flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground motion-reduce:transition-none"
            activeProps={{ className: 'bg-sidebar-accent !text-sidebar-accent-foreground font-medium' }}
          >
            <n.icon className="size-4" aria-hidden />
            {n.label}
            {'count' in n && (
              <span className="ml-auto rounded-sm bg-sidebar-primary px-1.5 font-mono text-[11px] text-sidebar-primary-foreground">
                {n.count}
              </span>
            )}
          </Link>
        ))}
      </nav>
      <div className="mt-auto hidden border-t border-sidebar-border p-5 text-xs lg:block">
        <p className="text-sidebar-foreground/60">Connected org</p>
        <p className="mt-1 font-medium">{org.name}</p>
        <p className="mt-0.5 truncate font-mono text-[11px] text-sidebar-foreground/50">{org.instance}</p>
        <p className="mt-3 flex items-center gap-1.5 text-sidebar-foreground/60">
          <RefreshCw className="size-3" aria-hidden /> Synced {org.lastSync} · {org.scanned.toLocaleString('en-US')} records
        </p>
      </div>
    </aside>
  )
}
