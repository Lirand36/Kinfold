/**
 * Stubbed Salesforce data for the product surface.
 *
 * Every screen reads from this module only. A later milestone swaps these
 * exports for real data (Salesforce sync + Netlify Database) without
 * changing the screens. See PLAN.md.
 */

export type ObjectType = 'Lead' | 'Contact' | 'Account'
export type Tier = 'auto' | 'review' | 'possible'
export type DetectedBy = 'Real-time block' | 'Nightly scan' | 'CSV import'

export type MatchMethod =
  | 'Exact'
  | 'Fuzzy (Jaro-Winkler)'
  | 'Phonetic'
  | 'Nickname-aware'
  | 'Email normalized'
  | 'Email domain'
  | 'Phone normalized'
  | 'Company normalized'
  | 'Website domain'

export interface SfRecord {
  id: string
  createdAt: string
  lastActivity: string
  owner: string
  activities: number
  openOpps: number
  fields: Record<string, string>
}

export interface MatchSignal {
  field: string
  method: MatchMethod
  similarity: number // 0..1
  weight: number // 0..100
}

export interface Cluster {
  id: string
  object: ObjectType
  /** Lead that matches an existing Account (lead-to-account) */
  crossObject?: { accountName: string; accountId: string }
  score: number
  detectedBy: DetectedBy
  detectedAt: string
  signals: MatchSignal[]
  records: SfRecord[]
}

export const objectFields: Record<ObjectType, string[]> = {
  Lead: ['Name', 'Company', 'Email', 'Phone', 'Title', 'City', 'Lead Source', 'Status'],
  Contact: ['Name', 'Account', 'Email', 'Phone', 'Title', 'Mailing City'],
  Account: ['Name', 'Website', 'Phone', 'Billing City', 'Industry', 'Employees'],
}

export const org = {
  name: 'Halvorsen Freight — Production',
  instance: 'halvorsen.my.salesforce.com',
  lastSync: '4 min ago',
  scanned: 148_312,
}

export function tierFor(score: number, auto = 92, review = 74): Tier {
  if (score >= auto) return 'auto'
  if (score >= review) return 'review'
  return 'possible'
}

export const clusters: Cluster[] = [
  {
    id: 'c-1042',
    object: 'Lead',
    score: 97,
    detectedBy: 'Real-time block',
    detectedAt: '2026-11-07T18:42:00Z',
    crossObject: { accountName: 'Brightwater Logistics', accountId: '0015g00000KbR2tAAF' },
    signals: [
      { field: 'Email', method: 'Email normalized', similarity: 1, weight: 40 },
      { field: 'Name', method: 'Nickname-aware', similarity: 0.94, weight: 25 },
      { field: 'Company', method: 'Company normalized', similarity: 1, weight: 20 },
      { field: 'Phone', method: 'Phone normalized', similarity: 0.88, weight: 15 },
    ],
    records: [
      {
        id: '00Q5g00000Ab1xQEAR',
        createdAt: '2025-03-14',
        lastActivity: '2026-10-30',
        owner: 'Priya Ramaswamy',
        activities: 23,
        openOpps: 0,
        fields: {
          Name: 'Katherine Oduya',
          Company: 'Brightwater Logistics, Inc.',
          Email: 'k.oduya@brightwaterlogistics.com',
          Phone: '(312) 555-0187',
          Title: 'VP, Procurement',
          City: 'Chicago',
          'Lead Source': 'Webinar',
          Status: 'Working',
        },
      },
      {
        id: '00Q5g00000Cz7pLEAZ',
        createdAt: '2026-11-07',
        lastActivity: '2026-11-07',
        owner: 'Integration User',
        activities: 1,
        openOpps: 0,
        fields: {
          Name: 'Kate Oduya',
          Company: 'Brightwater Logistics',
          Email: 'K.Oduya@BrightwaterLogistics.com',
          Phone: '312.555.0187 x12',
          Title: '',
          City: 'Chicago',
          'Lead Source': 'Trade Show',
          Status: 'New',
        },
      },
    ],
  },
  {
    id: 'c-1039',
    object: 'Account',
    score: 94,
    detectedBy: 'Nightly scan',
    detectedAt: '2026-11-07T06:10:00Z',
    signals: [
      { field: 'Website', method: 'Website domain', similarity: 1, weight: 45 },
      { field: 'Name', method: 'Company normalized', similarity: 0.91, weight: 35 },
      { field: 'Phone', method: 'Phone normalized', similarity: 1, weight: 20 },
    ],
    records: [
      {
        id: '0015g00000KbR2tAAF',
        createdAt: '2021-08-02',
        lastActivity: '2026-11-03',
        owner: 'Marcus Lindqvist',
        activities: 412,
        openOpps: 3,
        fields: {
          Name: 'Northgate Cold Chain',
          Website: 'https://northgatecold.com',
          Phone: '+1 206 555 0143',
          'Billing City': 'Seattle',
          Industry: 'Transportation',
          Employees: '1,240',
        },
      },
      {
        id: '0015g00000Pq88hAAB',
        createdAt: '2024-01-19',
        lastActivity: '2025-12-11',
        owner: 'Dana Whitcombe',
        activities: 37,
        openOpps: 1,
        fields: {
          Name: 'Northgate Cold-Chain LLC',
          Website: 'www.northgatecold.com/contact',
          Phone: '206-555-0143',
          'Billing City': 'Seattle',
          Industry: '',
          Employees: '1,100',
        },
      },
      {
        id: '0015g00000Tm41cAAD',
        createdAt: '2026-06-27',
        lastActivity: '2026-07-02',
        owner: 'Integration User',
        activities: 2,
        openOpps: 0,
        fields: {
          Name: 'NORTHGATE COLD CHAIN',
          Website: 'northgatecold.com',
          Phone: '',
          'Billing City': 'Tukwila',
          Industry: 'Logistics',
          Employees: '',
        },
      },
    ],
  },
  {
    id: 'c-1037',
    object: 'Contact',
    score: 88,
    detectedBy: 'Nightly scan',
    detectedAt: '2026-11-07T06:10:00Z',
    signals: [
      { field: 'Name', method: 'Phonetic', similarity: 0.9, weight: 30 },
      { field: 'Account', method: 'Exact', similarity: 1, weight: 30 },
      { field: 'Phone', method: 'Phone normalized', similarity: 1, weight: 25 },
      { field: 'Email', method: 'Email domain', similarity: 0.6, weight: 15 },
    ],
    records: [
      {
        id: '0035g00001Hd9kWAAR',
        createdAt: '2022-05-09',
        lastActivity: '2026-09-18',
        owner: 'Marcus Lindqvist',
        activities: 88,
        openOpps: 1,
        fields: {
          Name: 'Siobhan Gallagher',
          Account: 'Northgate Cold Chain',
          Email: 'sgallagher@northgatecold.com',
          Phone: '(206) 555-0199',
          Title: 'Director of Operations',
          'Mailing City': 'Seattle',
        },
      },
      {
        id: '0035g00001Lr2aPAAR',
        createdAt: '2025-11-21',
        lastActivity: '2026-10-29',
        owner: 'Dana Whitcombe',
        activities: 14,
        openOpps: 0,
        fields: {
          Name: 'Shavaun Gallager',
          Account: 'Northgate Cold Chain',
          Email: 'shavaun.g@gmail.com',
          Phone: '206 555 0199',
          Title: 'Dir. Operations',
          'Mailing City': '',
        },
      },
    ],
  },
  {
    id: 'c-1036',
    object: 'Lead',
    score: 81,
    detectedBy: 'CSV import',
    detectedAt: '2026-11-06T21:04:00Z',
    crossObject: { accountName: 'Pinecrest Medical Supply', accountId: '0015g00000Wx12eAAB' },
    signals: [
      { field: 'Company', method: 'Company normalized', similarity: 0.96, weight: 35 },
      { field: 'Name', method: 'Fuzzy (Jaro-Winkler)', similarity: 0.89, weight: 35 },
      { field: 'Email', method: 'Email domain', similarity: 1, weight: 30 },
    ],
    records: [
      {
        id: '00Q5g00000Ff3qREAZ',
        createdAt: '2026-02-03',
        lastActivity: '2026-08-14',
        owner: 'Tomás Echeverría',
        activities: 9,
        openOpps: 0,
        fields: {
          Name: 'Jonathan Abernathy',
          Company: 'Pinecrest Medical Supply',
          Email: 'jabernathy@pinecrestmed.com',
          Phone: '',
          Title: 'Supply Chain Manager',
          City: 'Denver',
          'Lead Source': 'Content Download',
          Status: 'Nurturing',
        },
      },
      {
        id: '00Q5g00000Gg8uTEAR',
        createdAt: '2026-11-06',
        lastActivity: '2026-11-06',
        owner: 'Integration User',
        activities: 0,
        openOpps: 0,
        fields: {
          Name: 'Jon Abernethy',
          Company: 'Pinecrest Medical Supply Co.',
          Email: 'jon.abernethy@pinecrestmed.com',
          Phone: '720-555-0112',
          Title: 'Supply Chain Mgr',
          City: 'Denver',
          'Lead Source': 'Purchased List',
          Status: 'New',
        },
      },
    ],
  },
  {
    id: 'c-1033',
    object: 'Account',
    score: 77,
    detectedBy: 'Nightly scan',
    detectedAt: '2026-11-06T06:10:00Z',
    signals: [
      { field: 'Name', method: 'Fuzzy (Jaro-Winkler)', similarity: 0.86, weight: 45 },
      { field: 'Billing City', method: 'Exact', similarity: 1, weight: 25 },
      { field: 'Website', method: 'Website domain', similarity: 0.4, weight: 30 },
    ],
    records: [
      {
        id: '0015g00000Ab90zAAB',
        createdAt: '2020-10-12',
        lastActivity: '2026-10-21',
        owner: 'Priya Ramaswamy',
        activities: 230,
        openOpps: 2,
        fields: {
          Name: 'Ostrander & Vey Packaging',
          Website: 'ostrandervey.com',
          Phone: '(414) 555-0120',
          'Billing City': 'Milwaukee',
          Industry: 'Manufacturing',
          Employees: '380',
        },
      },
      {
        id: '0015g00000Ry55kAAD',
        createdAt: '2025-04-30',
        lastActivity: '2025-05-02',
        owner: 'Tomás Echeverría',
        activities: 3,
        openOpps: 0,
        fields: {
          Name: 'Ostrander and Vey',
          Website: 'ovpack.net',
          Phone: '',
          'Billing City': 'Milwaukee',
          Industry: 'Packaging',
          Employees: '',
        },
      },
    ],
  },
  {
    id: 'c-1031',
    object: 'Contact',
    score: 95,
    detectedBy: 'Real-time block',
    detectedAt: '2026-11-06T16:22:00Z',
    signals: [
      { field: 'Email', method: 'Email normalized', similarity: 1, weight: 50 },
      { field: 'Name', method: 'Exact', similarity: 1, weight: 30 },
      { field: 'Account', method: 'Exact', similarity: 1, weight: 20 },
    ],
    records: [
      {
        id: '0035g00001Qa3vBAAR',
        createdAt: '2023-07-17',
        lastActivity: '2026-11-01',
        owner: 'Dana Whitcombe',
        activities: 61,
        openOpps: 1,
        fields: {
          Name: 'Emeka Nwachukwu',
          Account: 'Ostrander & Vey Packaging',
          Email: 'emeka.n@ostrandervey.com',
          Phone: '(414) 555-0168',
          Title: 'Plant Controller',
          'Mailing City': 'Milwaukee',
        },
      },
      {
        id: '0035g00001Wv6tCAAR',
        createdAt: '2026-11-06',
        lastActivity: '2026-11-06',
        owner: 'Web-to-Lead',
        activities: 0,
        openOpps: 0,
        fields: {
          Name: 'Emeka Nwachukwu',
          Account: 'Ostrander & Vey Packaging',
          Email: 'Emeka.N@ostrandervey.com ',
          Phone: '',
          Title: 'Controller',
          'Mailing City': 'Milwaukee',
        },
      },
    ],
  },
  {
    id: 'c-1028',
    object: 'Lead',
    score: 68,
    detectedBy: 'Nightly scan',
    detectedAt: '2026-11-05T06:10:00Z',
    signals: [
      { field: 'Name', method: 'Phonetic', similarity: 0.82, weight: 40 },
      { field: 'City', method: 'Exact', similarity: 1, weight: 20 },
      { field: 'Company', method: 'Company normalized', similarity: 0.52, weight: 40 },
    ],
    records: [
      {
        id: '00Q5g00000Hh2wYEAR',
        createdAt: '2025-09-08',
        lastActivity: '2026-01-15',
        owner: 'Priya Ramaswamy',
        activities: 5,
        openOpps: 0,
        fields: {
          Name: 'Lucía Ferreira',
          Company: 'Ferreira Imports',
          Email: 'lucia@ferreiraimports.pt',
          Phone: '+351 21 555 0144',
          Title: 'Owner',
          City: 'Lisbon',
          'Lead Source': 'Partner Referral',
          Status: 'Working',
        },
      },
      {
        id: '00Q5g00000Jk4nMEAR',
        createdAt: '2026-10-28',
        lastActivity: '2026-10-28',
        owner: 'Tomás Echeverría',
        activities: 1,
        openOpps: 0,
        fields: {
          Name: 'Luciana Ferrera',
          Company: 'Atlântico Trading',
          Email: 'l.ferrera@atlanticotrading.pt',
          Phone: '',
          Title: 'Buyer',
          City: 'Lisbon',
          'Lead Source': 'Web',
          Status: 'New',
        },
      },
    ],
  },
  {
    id: 'c-1025',
    object: 'Account',
    score: 92,
    detectedBy: 'CSV import',
    detectedAt: '2026-11-04T14:37:00Z',
    signals: [
      { field: 'Website', method: 'Website domain', similarity: 1, weight: 45 },
      { field: 'Name', method: 'Company normalized', similarity: 0.97, weight: 40 },
      { field: 'Billing City', method: 'Exact', similarity: 0.7, weight: 15 },
    ],
    records: [
      {
        id: '0015g00000Wx12eAAB',
        createdAt: '2022-02-22',
        lastActivity: '2026-10-08',
        owner: 'Tomás Echeverría',
        activities: 154,
        openOpps: 1,
        fields: {
          Name: 'Pinecrest Medical Supply',
          Website: 'pinecrestmed.com',
          Phone: '(303) 555-0101',
          'Billing City': 'Denver',
          Industry: 'Healthcare',
          Employees: '615',
        },
      },
      {
        id: '0015g00000Zc77fAAB',
        createdAt: '2026-11-04',
        lastActivity: '2026-11-04',
        owner: 'Integration User',
        activities: 0,
        openOpps: 0,
        fields: {
          Name: 'Pinecrest Medical Supply Co.',
          Website: 'http://www.pinecrestmed.com',
          Phone: '303.555.0101',
          'Billing City': 'Aurora',
          Industry: 'Medical Devices',
          Employees: '650',
        },
      },
    ],
  },
]

export interface RuleCondition {
  id: string
  field: string
  method: MatchMethod
  weight: number
}

export interface RuleSet {
  id: string
  name: string
  object: ObjectType
  active: boolean
  autoThreshold: number
  reviewThreshold: number
  realTime: boolean
  crossObject: boolean
  schedule: 'Off' | 'Hourly' | 'Nightly' | 'Weekly'
  conditions: RuleCondition[]
  survivorship: Record<string, SurvivorRule>
}

export type SurvivorRule =
  | 'Master record'
  | 'Most recent value'
  | 'Oldest value'
  | 'Most complete'
  | 'Most active record'

export const survivorRules: SurvivorRule[] = [
  'Master record',
  'Most recent value',
  'Oldest value',
  'Most complete',
  'Most active record',
]

export const matchMethods: MatchMethod[] = [
  'Exact',
  'Fuzzy (Jaro-Winkler)',
  'Phonetic',
  'Nickname-aware',
  'Email normalized',
  'Email domain',
  'Phone normalized',
  'Company normalized',
  'Website domain',
]

export const ruleSets: RuleSet[] = [
  {
    id: 'r-lead-std',
    name: 'Leads — person + company',
    object: 'Lead',
    active: true,
    autoThreshold: 92,
    reviewThreshold: 74,
    realTime: true,
    crossObject: true,
    schedule: 'Nightly',
    conditions: [
      { id: 'a', field: 'Email', method: 'Email normalized', weight: 40 },
      { id: 'b', field: 'Name', method: 'Nickname-aware', weight: 25 },
      { id: 'c', field: 'Company', method: 'Company normalized', weight: 20 },
      { id: 'd', field: 'Phone', method: 'Phone normalized', weight: 15 },
    ],
    survivorship: {
      Name: 'Master record',
      Company: 'Most complete',
      Email: 'Master record',
      Phone: 'Most recent value',
      Title: 'Most recent value',
      City: 'Master record',
      'Lead Source': 'Oldest value',
      Status: 'Master record',
    },
  },
  {
    id: 'r-acct-domain',
    name: 'Accounts — domain first',
    object: 'Account',
    active: true,
    autoThreshold: 93,
    reviewThreshold: 76,
    realTime: true,
    crossObject: false,
    schedule: 'Nightly',
    conditions: [
      { id: 'a', field: 'Website', method: 'Website domain', weight: 45 },
      { id: 'b', field: 'Name', method: 'Company normalized', weight: 35 },
      { id: 'c', field: 'Phone', method: 'Phone normalized', weight: 20 },
    ],
    survivorship: {
      Name: 'Most active record',
      Website: 'Most complete',
      Phone: 'Most recent value',
      'Billing City': 'Master record',
      Industry: 'Master record',
      Employees: 'Most recent value',
    },
  },
  {
    id: 'r-contact',
    name: 'Contacts — within account',
    object: 'Contact',
    active: true,
    autoThreshold: 94,
    reviewThreshold: 78,
    realTime: false,
    crossObject: false,
    schedule: 'Weekly',
    conditions: [
      { id: 'a', field: 'Email', method: 'Email normalized', weight: 35 },
      { id: 'b', field: 'Name', method: 'Phonetic', weight: 30 },
      { id: 'c', field: 'Account', method: 'Exact', weight: 20 },
      { id: 'd', field: 'Phone', method: 'Phone normalized', weight: 15 },
    ],
    survivorship: {
      Name: 'Master record',
      Account: 'Master record',
      Email: 'Most active record',
      Phone: 'Most recent value',
      Title: 'Most recent value',
      'Mailing City': 'Most complete',
    },
  },
]

export interface MergeEvent {
  id: string
  clusterId: string
  object: ObjectType
  survivor: string
  merged: number
  mode: 'Auto-merge' | 'Manual' | 'Bulk'
  by: string
  at: string
  fieldsChanged: number
  undone?: boolean
}

export const mergeHistory: MergeEvent[] = [
  { id: 'm-5531', clusterId: 'c-1019', object: 'Lead', survivor: 'Ravi Deshpande', merged: 2, mode: 'Auto-merge', by: 'Kinfold', at: '2026-11-07T17:58:00Z', fieldsChanged: 3 },
  { id: 'm-5530', clusterId: 'c-1017', object: 'Account', survivor: 'Halcyon Rail Partners', merged: 4, mode: 'Manual', by: 'Priya Ramaswamy', at: '2026-11-07T15:12:00Z', fieldsChanged: 7 },
  { id: 'm-5527', clusterId: 'c-1014', object: 'Contact', survivor: 'Ingrid Solberg', merged: 2, mode: 'Bulk', by: 'Marcus Lindqvist', at: '2026-11-07T11:40:00Z', fieldsChanged: 2 },
  { id: 'm-5522', clusterId: 'c-1011', object: 'Lead', survivor: 'Aiyana Redcloud', merged: 3, mode: 'Auto-merge', by: 'Kinfold', at: '2026-11-06T22:03:00Z', fieldsChanged: 4 },
  { id: 'm-5519', clusterId: 'c-1008', object: 'Account', survivor: 'Duarte Agro Holdings', merged: 2, mode: 'Manual', by: 'Dana Whitcombe', at: '2026-11-06T13:27:00Z', fieldsChanged: 5, undone: true },
  { id: 'm-5514', clusterId: 'c-1004', object: 'Contact', survivor: 'Bartholomew Fitch', merged: 2, mode: 'Auto-merge', by: 'Kinfold', at: '2026-11-05T06:14:00Z', fieldsChanged: 1 },
  { id: 'm-5508', clusterId: 'c-0998', object: 'Lead', survivor: 'Mireille Okonkwo', merged: 2, mode: 'Bulk', by: 'Tomás Echeverría', at: '2026-11-04T19:51:00Z', fieldsChanged: 2 },
]

export const healthTrend = [71.4, 72.9, 74.1, 76.8, 78.2, 81.6, 83.9, 86.3]

export const stats = {
  healthScore: 86.3,
  openClusters: 1_284,
  autoMergedWeek: 3_917,
  blockedAtEntry: 642,
  hoursSaved: 211.5,
}
