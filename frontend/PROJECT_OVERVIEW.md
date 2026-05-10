# DevSpot AI — Project Overview

## What this app is

DevSpot AI is a hackathon-ready developer event discovery and planning platform for Bangalore.
It combines realistic local event data with AI-style recommendation features to help developers discover meetups, find hackathons, optimize networking, and plan a developer day.

## Current structure

```
app/
├── api/
│   └── recommend/
│       └── route.ts
├── discover/
│   └── page.tsx
├── event/
│   └── [id]/
│       └── page.tsx
├── planner/
│   └── page.tsx
├── globals.css
├── layout.tsx
└── page.tsx

components/
├── event/
│   ├── EventCard.tsx
│   ├── FeaturedEvent.tsx
│   ├── EventGrid.tsx
│   └── RecommendationReason.tsx
├── home/
│   ├── Hero.tsx
│   ├── FeatureSection.tsx
│   └── NearbyEvents.tsx
├── layout/
│   ├── Footer.tsx
│   └── Navbar.tsx
├── planner/
│   ├── AIInsightCard.tsx
│   ├── InterestSelector.tsx
│   ├── PlannerForm.tsx
│   └── PlannerResults.tsx
├── ui/
│   └── ... shadcn UI wrappers
└── EventCard.tsx

lib/
├── ai.ts
├── distance.ts
├── planner.ts
├── scoring.ts
├── types.ts
└── utils.ts

data/
└── mockEvents.ts
```

## Key features

- Multi-page app with landing page, discovery page, planner page, and event detail pages
- Bangalore-focused mock event data with real neighborhoods and developer venues
- Interest-based event ranking with distance, networking, and technical relevance
- Planner UI with location, time, and interest inputs
- AI-style recommendation reasoning and explanations
- Modern dark startup UI with glassmorphism, gradients, and responsive layout
- Minimal backend complexity using a simple Next.js API route

## Pages

- `/` — landing page with hero, product story, featured events, and CTA
- `/discover` — searchable event grid with filters, categories, and distance emphasis
- `/planner` — AI developer day planner with dynamic recommendations and optimized schedule
- `/event/[id]` — event detail page with full event info, organizer data, and recommendation rationale
- `/api/recommend` — POST endpoint powering planner interactions

## Data & AI experience

- `data/mockEvents.ts` contains Bangalore-based developer events with:
  - Koramangala, HSR Layout, Whitefield, Indiranagar, MG Road, Electronic City, Bellandur
  - real venue names, organizers, URLs, dates, and coordinates
- `lib/scoring.ts` builds ranked results using:
  - interest matching
  - networking score
  - technical score
  - nearby distance
- `lib/planner.ts` optimizes final recommendations for developer schedules
- `lib/ai.ts` provides AI-style explanation messages and reason summaries

## UI & design

- Uses Tailwind CSS and ShadCN UI components
- Black/zinc color palette with purple/cyan accent tones
- Rounded cards, subtle borders, and responsive spacing
- Emphasis on premium pitch-ready hackathon presentation

## Running locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.
