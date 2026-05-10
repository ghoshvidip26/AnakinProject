# DevSpot AI

> AI-powered developer event discovery and developer-day planning platform for Bangalore.

DevSpot AI helps developers discover the best tech events, meetups, hackathons, and networking opportunities happening across Bangalore — while intelligently generating optimized event schedules based on interests, commute distance, networking value, and available time.

---

# Problem

Developer events are fragmented across multiple platforms:

* Luma
* Meetup
* Eventbrite
* Community groups
* Startup networks

Most developers:

* don’t know which events are worth attending
* waste time searching across platforms
* struggle to optimize travel and schedules
* miss networking opportunities

---

# Solution

DevSpot AI acts as an intelligent developer-day planner.

Users can:

* select interests
* choose their location
* choose available time

DevSpot AI then:

* ranks nearby events
* optimizes commute efficiency
* prioritizes networking opportunities
* generates a developer event timeline

---

# Core Features

## AI Developer Day Planner

Generate an optimized Bangalore developer schedule using:

* interests
* nearby locations
* free time
* networking quality
* technical relevance

---

## Bangalore-Focused Event Discovery

Curated Bangalore developer ecosystem events including:

* AI meetups
* React events
* Startup networking
* Cloud & DevOps meetups
* Security workshops
* Hackathons

Areas include:

* Koramangala
* HSR Layout
* Whitefield
* Indiranagar
* Bellandur
* MG Road
* Electronic City

---

## Smart Event Ranking

Recommendations are generated using:

* interest matching
* networking score
* technical relevance
* commute distance
* timeline compatibility

---

## AI Timeline Experience

Instead of static event cards, DevSpot AI creates:

* connected developer-day timelines
* commute-aware event sequencing
* networking-focused recommendations
* intelligent schedule flow

---

# Tech Stack

## Frontend

* Next.js 16
* TypeScript
* Tailwind CSS
* ShadCN UI
* Framer Motion

## AI & Logic

* Gemini API
* Custom scoring engine
* Timeline generation logic
* Haversine distance calculation

## Backend

* Next.js Route Handlers

---

# Project Structure

```bash
app/
├── api/
│   └── recommend/
├── discover/
├── planner/
├── event/
│   └── [id]/
├── globals.css
├── layout.tsx
└── page.tsx

components/
├── event/
├── home/
├── layout/
├── planner/
└── ui/

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

---

# AI Planning Flow

```txt
User Preferences
      ↓
Event Ranking
      ↓
Distance Optimization
      ↓
Timeline Sequencing
      ↓
AI Recommendation Layer
      ↓
Generated Developer Day
```

---

# Planner Experience

Example:

```txt
5:00 PM → AI Builders Meetup (HSR Layout)

↓ 15 min commute

7:00 PM → Founder Networking Mixer (Koramangala)

↓ 12 min commute

9:00 PM → Hackathon Afterparty (Indiranagar)
```

---

# Running Locally

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

---

# Future Improvements

* Real-time event scraping
* Live Google Maps integration
* Personalized AI networking recommendations
* Calendar sync
* Smart commute optimization
* Multi-city support

---

# Vision

DevSpot AI aims to become the intelligent operating system for developer communities — helping developers maximize learning, networking, and opportunities through AI-powered event planning.

---

# Built For

Hackathons, developer communities, startup ecosystems, and Bangalore’s growing tech network.
