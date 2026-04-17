# Timma — Project Overview

> **En Timma** (Swedish: "An Hour") — A digital calendar, day planner, and visual schedule designed for individuals with neurodevelopmental conditions (NPF).

## Vision

Timma is a flexible, accessible planning tool that empowers individuals with NPF (ADHD, autism, intellectual disabilities, etc.) to understand and navigate their day — while giving caregivers full control over setup and customization. It bridges the gap between rigid paper-based visual schedules and overly complex mainstream calendar apps.

## Target Users

- **Mixed ages** — children, teens, and adults with NPF
- **Caregiver-managed setup** — parents, teachers, support staff configure schedules, rewards, and visual profiles
- **Age-appropriate interaction** — users interact with a UI tailored to their cognitive and sensory needs
- **Household model** — one caregiver account manages multiple user profiles (like Netflix)

## Core Concepts

### 1. Visual Schedule & Day Planner

- Configurable time visualization per user:
  - **Traditional timeline** (vertical hours)
  - **Block-based schedule** (colored activity blocks, no clock numbers)
  - **Sequential card strip** ("Now → Next → Later" horizontal scroll)
- Weekly and monthly calendar views
- Kanban board view for task management

### 2. PECS & Teckenstöd (Sign Support)

- **Built-in open-source symbol library** (e.g., Mulberry Symbols for AAC)
- **Custom image uploads** — photos, drawings, or imported pictograms
- **Takk video clips** (Swedish sign support) linked to activities
- Symbols automatically suggested based on activity text

### 3. Reward System (Belöningssystem)

- Fully customizable per user — caregiver selects the reward mechanic:
  - **Points** — earn per completed task, redeem for set rewards
  - **Token board** — digital version of classic ABA token boards
  - **Star chart / progress bar** — visual fill-up over day/week
  - **Badges & streaks** — gamified achievements
- Caregiver defines rewards and thresholds per profile

### 4. Themes & Sensory Profiles

- **Pre-built themes**: calm pastel, high contrast, nature, space, etc.
- **Sensory profiles**: "low stimulation" (minimal, muted) vs. "high engagement" (colorful, animated)
- **Per-user theme assignment** by caregiver
- Light/dark mode support within each theme

### 5. Authentication & User Model

- **Household model**: one caregiver account → multiple user profiles
- Caregiver login via email/password (expandable to OAuth/BankID)
- User profile switching via **PIN or avatar tap** (no passwords for end users)
- **Admin role**: full access to edit, delete, and manage users

### 6. Integrations

- **MVP**: Google Calendar / Apple Calendar (iCal) sync
- **Post-MVP**:
  - School platforms (Google Classroom, Skolplattformen)
  - Smart home (Hue lights for visual time cues, speakers for audio reminders)
  - Push notifications, SMS, caregiver alerts

## Tech Stack

| Layer       | Technology                          |
| ----------- | ----------------------------------- |
| Language    | TypeScript (end-to-end)             |
| Frontend    | Next.js (React, SSR/SSG)           |
| Styling     | TBD (Tailwind CSS recommended)      |
| PWA         | next-pwa or Serwist                 |
| Database    | PostgreSQL                          |
| ORM         | Prisma (recommended)                |
| Auth        | Custom (PIN profiles) + NextAuth.js |
| Deployment  | Docker Compose                      |
| CI/CD       | TBD                                 |

## Platform

- **Progressive Web App (PWA)** — installable on any device, offline support
- Responsive design: works on wall-mounted tablets, phones, laptops, and desktops
- Offline-first for schedule viewing (sync when back online)

## Design Principles

1. **Clarity over decoration** — every visual element serves a purpose
2. **Predictability** — consistent layout, transitions, and interaction patterns
3. **Flexibility** — no two NPF individuals are the same; everything is configurable
4. **Caregiver empowerment** — easy setup, powerful customization, minimal tech knowledge required
5. **Accessibility** — WCAG compliance, screen reader support, keyboard navigation
