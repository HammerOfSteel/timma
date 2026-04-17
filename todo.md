# Timma — Project Roadmap & Todo

## Phase 1: Foundation & MVP

The minimum viable product — a functional day planner with visual support that one household can use.

### 1.1 Project Setup

- [x] Initialize Next.js project with TypeScript
- [x] Configure Tailwind CSS (or chosen styling solution)
- [x] Set up ESLint + Prettier
- [x] Configure PWA (next-pwa / Serwist) with service worker
- [x] Set up Docker Compose (Next.js app + PostgreSQL)
- [x] Set up Prisma ORM with PostgreSQL
- [x] Define initial database schema (users, profiles, schedules, activities)
- [x] Seed script with sample data

### 1.2 Authentication & User Model

- [x] Caregiver registration (email/password)
- [x] Caregiver login / logout
- [x] Household model: create & manage user profiles under one account
- [x] Profile switching via PIN or avatar tap
- [x] Admin role: edit, delete, add profiles
- [x] Protected routes & session management

### 1.3 Day Planner / Schedule View

- [x] Daily schedule view — default block-based layout
- [x] Add / edit / delete activities (caregiver)
- [ ] Drag-and-drop reordering
- [x] Activity cards with title, time, icon/image, and color
- [x] "Now → Next → Later" card strip view
- [x] Traditional timeline view (optional per user)
- [x] Configurable view mode per user profile (caregiver setting)

### 1.4 PECS & Visual Support (Basic)

- [x] Integrate open-source symbol library (Mulberry Symbols)
- [x] Symbol picker when creating/editing activities
- [x] Custom image upload per activity
- [x] Display symbols on schedule cards

### 1.5 Basic Themes

- [x] Light and dark mode
- [x] 3–4 pre-built themes (calm pastel, high contrast, nature, space)
- [x] Per-user theme assignment (caregiver setting)
- [x] Sensory profile toggle: low stimulation vs. high engagement

### 1.6 Calendar Integration (MVP)

- [x] iCal export (generate .ics file for schedule)
- [x] Google Calendar sync (read/write via API)
- [x] Apple Calendar sync via iCal subscription URL

### 1.7 PWA & Offline

- [x] App manifest with icons and splash screens
- [x] Offline schedule viewing (cache current day/week)
- [x] Install prompt on supported browsers
- [x] Background sync for schedule changes made offline

---

## Phase 2: Core Features

Building out the full feature set beyond basic scheduling.

### 2.1 Weekly & Monthly Views

- [x] Week view (7-day grid or horizontal scroll)
- [x] Month view (traditional calendar grid)
- [x] Navigation between day / week / month
- [x] Recurring activities (daily, weekly, custom)

### 2.2 Kanban Board

- [ ] Kanban view for tasks/todos
- [ ] Customizable columns (e.g., To Do, Doing, Done)
- [ ] Drag-and-drop between columns
- [ ] Link kanban tasks to schedule activities

### 2.3 Reward System (Belöningssystem)

- [ ] Reward mechanic selector per user (points, tokens, stars, badges)
- [ ] **Points system**: earn points per completed task, configurable per activity
- [ ] **Token board**: visual token collection, configurable token count → reward
- [ ] **Star chart**: visual progress bar per day/week
- [ ] **Badges & streaks**: define achievements, track streaks
- [ ] Caregiver defines available rewards and thresholds
- [ ] User-facing reward shop / redemption UI
- [ ] Reward history & stats

### 2.4 Teckenstöd (Sign Support)

- [ ] Takk video clip library (curated Swedish sign videos)
- [ ] Link Takk clips to activities
- [ ] Video playback on activity cards (tap to play)
- [ ] Caregiver can upload custom sign videos

### 2.5 Enhanced PECS

- [ ] Smart symbol suggestions based on activity text (keyword matching)
- [ ] Symbol search & browse interface
- [ ] Favorites / frequently used symbols
- [ ] Category-based symbol organization

### 2.6 Todo List

- [ ] Simple todo/checklist per user
- [ ] Checkable items with optional symbols
- [ ] Link todos to reward system
- [ ] Caregiver and user can both add items (configurable permission)

---

## Phase 3: Polish & Integrations

Expanding reach, improving UX, and connecting with external systems.

### 3.1 Advanced Themes & Customization

- [ ] Fully custom themes (pick colors, fonts, background images)
- [ ] Animated transitions (configurable: on/off per sensory profile)
- [ ] Custom activity sounds/audio cues
- [ ] User avatar customization

### 3.2 Notifications & Alerts

- [ ] Push notifications for upcoming activities
- [ ] Audio/visual alerts configurable per activity
- [ ] Caregiver notification when user completes tasks
- [ ] SMS alerts (via Twilio or similar)

### 3.3 School & Institutional Integrations

- [ ] Google Classroom import
- [ ] Skolplattformen integration (Swedish school platform)
- [ ] Multi-household management (for schools/group homes)
- [ ] Staff roles & permissions

### 3.4 Smart Home Integration

- [ ] Hue lights: color change for activity transitions
- [ ] Smart speaker announcements for activity changes
- [ ] IFTTT / Home Assistant webhooks

### 3.5 Advanced Auth

- [ ] OAuth login (Google, Apple)
- [ ] Swedish BankID authentication (for institutional use)
- [ ] Two-factor authentication for caregiver accounts

---

## Phase 4: Scale & Community

Long-term vision features.

### 4.1 Community & Sharing

- [ ] Share schedule templates between caregivers
- [ ] Community symbol library (user-contributed)
- [ ] Community themes marketplace
- [ ] Public template gallery

### 4.2 Analytics & Insights

- [ ] Activity completion tracking over time
- [ ] Reward system analytics
- [ ] Routine adherence reports for caregivers
- [ ] Export data (PDF, CSV)

### 4.3 Accessibility & Localization

- [ ] Full WCAG 2.1 AA compliance audit
- [ ] Screen reader optimization
- [ ] Multi-language support (Swedish, English, Norwegian, Danish, Finnish)
- [ ] RTL language support

### 4.4 API & Extensibility

- [ ] Public REST/GraphQL API
- [ ] Webhook support for external integrations
- [ ] Plugin/extension system for custom features
- [ ] Third-party developer documentation

---

## Technical Debt & Ongoing

- [ ] Unit test coverage (target 80%+)
- [ ] E2E test suite (Playwright)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Performance monitoring & error tracking
- [ ] Security audit
- [ ] Database backup strategy
- [ ] Documentation (user guide, admin guide, developer docs)
