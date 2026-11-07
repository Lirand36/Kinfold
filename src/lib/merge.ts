import { ruleSets, type Cluster, type SfRecord, type SurvivorRule } from '@/lib/fixtures'

/** Index of the record that survives by default: the one with the most activity. */
export function defaultMasterIndex(records: SfRecord[]) {
  let best = 0
  records.forEach((r, i) => {
    const b = records[best]
    if (r.activities + r.openOpps * 50 > b.activities + b.openOpps * 50) best = i
  })
  return best
}

export function survivorRuleFor(cluster: Cluster, field: string): SurvivorRule {
  const rs = ruleSets.find((r) => r.object === cluster.object)
  return rs?.survivorship[field] ?? 'Master record'
}

/** Applies the configured survivorship rule to pick a source record per field. */
export function defaultSelections(cluster: Cluster, master: number, fields: string[]) {
  const recs = cluster.records
  const filled = (i: number, f: string) => (recs[i].fields[f] ?? '').trim() !== ''
  const idx = recs.map((_, i) => i)
  const out: Record<string, number> = {}
  for (const f of fields) {
    const rule = survivorRuleFor(cluster, f)
    const candidates = idx.filter((i) => filled(i, f))
    let pick = master
    if (candidates.length === 0) pick = master
    else if (rule === 'Master record') pick = filled(master, f) ? master : candidates[0]
    else if (rule === 'Most recent value')
      pick = candidates.reduce((a, b) => (recs[b].lastActivity > recs[a].lastActivity ? b : a))
    else if (rule === 'Oldest value')
      pick = candidates.reduce((a, b) => (recs[b].createdAt < recs[a].createdAt ? b : a))
    else if (rule === 'Most complete')
      pick = candidates.reduce((a, b) => (recs[b].fields[f].length > recs[a].fields[f].length ? b : a))
    else if (rule === 'Most active record')
      pick = candidates.reduce((a, b) => (recs[b].activities > recs[a].activities ? b : a))
    out[f] = pick
  }
  return out
}

export function countChanged(cluster: Cluster, master: number, picks: Record<string, number>) {
  return Object.entries(picks).filter(
    ([f, i]) => i !== master && cluster.records[i].fields[f] !== cluster.records[master].fields[f],
  ).length
}

export function clusterTitle(cluster: Cluster) {
  const names = [...new Set(cluster.records.map((r) => r.fields.Name))]
  return names
}
