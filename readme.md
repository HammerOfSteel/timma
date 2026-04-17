# Timma

> **En Timma** (Swedish: "An Hour") — A digital calendar and day planner with visual support, designed for individuals with neurodevelopmental conditions (NPF).

[![License](https://img.shields.io/badge/license-TBD-blue.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)]()
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)]()

## What is Timma?

Timma is a **Progressive Web App** that helps individuals with ADHD, autism, intellectual disabilities, and other neurodevelopmental conditions understand and navigate their day. Caregivers set up schedules, rewards, and visual profiles — users interact with an interface tailored to their needs.

### Key Features

- **Visual Day Planner** — configurable per user: timeline, color blocks, or "Now → Next → Later" cards
- **PECS & Teckenstöd** — built-in symbol library (Mulberry), custom image uploads, and Swedish sign (Takk) video clips
- **Customizable Reward System** — points, token boards, star charts, or badges — caregiver picks per user
- **Themes & Sensory Profiles** — pre-built themes + "low stimulation" / "high engagement" sensory modes, assigned per user
- **Household Model** — one caregiver account, multiple user profiles, switch with PIN or avatar tap
- **Kanban, Weekly & Monthly Views** — flexible task and calendar management
- **Calendar Sync** — Google Calendar and iCal integration
- **Offline Support** — view and interact with schedules without internet

## Tech Stack

| Layer      | Technology                       |
| ---------- | -------------------------------- |
| Language   | TypeScript (end-to-end)          |
| Frontend   | Next.js (React)                  |
| Styling    | Tailwind CSS                     |
| PWA        | next-pwa / Serwist               |
| Database   | PostgreSQL                       |
| ORM        | Prisma                           |
| Auth       | NextAuth.js + PIN-based profiles |
| Deployment | Docker Compose                   |

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/HammerOfSteel/timma.git
cd timma

# Install dependencies
pnpm install

# Start the database
docker compose up -d db

# Run database migrations
pnpm prisma migrate dev

# Start the development server
pnpm dev
```

The app will be available at `http://localhost:3000`.

### Docker (full stack)

```bash
docker compose up
```

## Project Structure

```
timma/
├── overview.md        # Detailed project overview & design decisions
├── todo.md            # Phased roadmap (MVP → future features)
├── readme.md          # This file
├── src/
│   ├── app/           # Next.js app router pages
│   ├── components/    # Reusable UI components
│   ├── lib/           # Utilities, DB client, auth config
│   └── styles/        # Global styles & theme definitions
├── prisma/
│   └── schema.prisma  # Database schema
├── public/            # Static assets, PWA manifest, icons
└── docker-compose.yml
```

## Documentation

- [**Overview**](overview.md) — vision, target users, core concepts, and design principles
- [**Roadmap**](todo.md) — phased todo list from MVP through future features

## Contributing

Contributions are welcome! Please read the contributing guidelines (coming soon) before submitting a PR.

## License

TBD
