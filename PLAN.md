# Kinfold roadmap

Kinfold is a Salesforce deduplication product. It combines the broad, scheduled, rule-based cleanup of established dedupe tools with the lead-to-account matching of routing platforms. It also fixes the usual complaints about those tools: scores you can't inspect, long setups, dated review screens, no undo, and cleanup that only happens after the duplicates already exist.

The plan is built in stages, starting with the product surface so the workflow can be reviewed early. Each milestone is small and can ship on its own.

## Milestone 1 — Product surface ✅
- Landing page with positioning, a "kept / fixed" comparison, and how it works
- Review queue: health KPIs, object and confidence filters, search, bulk merge with undo toast
- Merge workspace: master record selection, field-level survivorship picks, score explanation, lead-to-account banner, keyboard shortcuts
- Matching rules: weighted signals, threshold sliders with a live score-distribution preview, block-at-entry and scheduled-scan settings, survivorship per field
- Merge history with undo
- All data is stubbed in `src/lib/fixtures.ts`; session state is in `src/lib/workspace-store.tsx`

## Milestone 2 — Accounts and workspaces
- Netlify Identity login; one workspace per Salesforce org
- Roles: Admin (rules, auto-merge), Reviewer (queue), Viewer (history)

## Milestone 3 — Data model (Netlify Database + Drizzle)
- Tables: `orgs`, `rule_sets`, `rule_conditions`, `survivorship_rules`, `clusters`, `cluster_records`, `merge_events`, `merge_snapshots`, `not_duplicate_pairs`
- Replace the fixtures and the workspace store with server functions that read from and write to the database

## Milestone 4 — Salesforce connection
- OAuth 2.0 (web server flow) connected app; encrypted refresh tokens
- Initial sync of Leads, Contacts, and Accounts through the Bulk API 2.0, then incremental sync through Change Data Capture
- Org picker and sync status in the sidebar

## Milestone 5 — Matching engine
- Normalizers: email, phone (E.164), company suffixes, website domain, nicknames
- Comparators: exact, Jaro-Winkler, phonetic (Double Metaphone), domain
- Blocking keys so scans stay fast on large orgs; per-signal contributions are stored so every score can be explained
- Lead-to-account matching

## Milestone 6 — Merge execution and undo
- Run merges through the Salesforce merge API (up to 3 records per call, chained for larger clusters)
- Snapshot the full records and child relationships before each merge; undo recreates the records and re-parents the children
- 30-day retention, audit log export

## Milestone 7 — Automation
- Scheduled scans as Netlify Scheduled Functions; auto-merge above the threshold
- Block at entry: an Apex trigger or Flow calls a Kinfold endpoint before insert (web-to-lead, API, imports)
- CSV import pre-check: upload a file and see duplicates before it reaches Salesforce

## Milestone 8 — Learning and AI assist
- "Not a duplicate" decisions adjust weights for each rule set
- Optional AI Gateway model to explain borderline clusters in plain language and suggest which values to keep

## Milestone 9 — Billing and polish
- Flat per-org pricing, usage dashboard, email digests of the review queue
