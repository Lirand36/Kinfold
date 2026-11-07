# Kinfold

Kinfold finds and merges duplicate Leads, Contacts, and Accounts in Salesforce, and shows why each cluster matched. It combines scheduled, rule-based cleanup with lead-to-account matching, field-level survivorship, blocking duplicates at entry, and undo for every merge.

## What's here today

- **Landing page** (`/`): positioning and how it works
- **Review queue** (`/app`): KPIs, filters, search, bulk merge
- **Merge workspace** (`/app/merge/:id`): choose the master record and the value kept for each field, with a breakdown of the score
- **Matching rules** (`/app/rules`): weighted signals, thresholds with a live preview, automation settings, survivorship
- **Merge history** (`/app/history`): audit trail with undo

All data is stubbed for now (`src/lib/fixtures.ts`). Changes you make last only for the current browser session.

## Tech

TanStack Start (React 19, TanStack Router), Tailwind CSS 4, shadcn/ui (Radix), lucide-react, sonner, and TypeScript. The app deploys to Netlify.

## Run locally

```bash
pnpm install
netlify dev    # or: pnpm dev
```

## Roadmap

See [PLAN.md](PLAN.md). Next up: accounts and workspaces, the Netlify Database data model, the Salesforce OAuth connection and sync, the matching engine, merges through the Salesforce API with snapshots for undo, and scheduled and real-time automation.
