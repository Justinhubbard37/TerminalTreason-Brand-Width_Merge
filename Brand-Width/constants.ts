import { BrandPolicy } from './types.ts';

export const DEFAULT_BRAND_POLICY: BrandPolicy = {
  pillars: [
    "Structural Integrity",
    "Sovereignty",
    "Engineering over Magic",
    "Clarity over Hype"
  ],
  toneRules: [
    "Lucid",
    "Definitive",
    "Structural",
    "Enduring",
    "Calm Confidence"
  ],
  bannedTerms: {
    "magic": "engineering",
    "transmute": "restructure",
    "soul": "core logic",
    "unleash": "deploy",
    "game-changer": "paradigm shift",
    "boost": "optimize",
    "secret sauce": "proprietary protocol",
    "hustle": "execution",
    "grind": "iteration",
    "hack": "solution"
  },
  preferredTerms: [
    "engineer", "blueprint", "infrastructure", "sovereignty", "deploy", "scale", "protocol", "asset"
  ],
  ctaStyle: "Direct, low-friction, utilitarian. No false urgency.",
  doAndDonts: {
    do: [
      "Speak like a Chief Engineer",
      "Diagnose before prescribing",
      "Focus on systems"
    ],
    dont: [
      "Use exclamation points unnecessarily",
      "Promise easy wins",
      "Use spiritual metaphors for technical problems"
    ]
  }
};

export const MOCK_LEADS = [
  {
    id: 'lead-1',
    company: 'Nexus Corp',
    site: 'nexus.example.com',
    niche: 'Fintech',
    painSignal: 'Complaining about manual reconciliation data lag on Twitter',
    contactChannels: 'LinkedIn, Email',
    notes: 'CTO is active on standard protocols.',
    score: 0,
    evidenceLinks: ['https://twitter.com/nexus_cto/status/12345'],
    status: 'new',
    createdAt: Date.now()
  }
];

export const MOCK_SOURCES = [
  {
    id: 'src-1',
    url: 'https://techcrunch.com/2024/05/21/fintech-implosion',
    title: 'The Great Fintech Implosion of 2024',
    snippet: '...infrastructure costs are ballooning while efficiency stagnates...',
    tags: ['market-trend', 'risk'],
    timestamp: Date.now()
  }
];