# Track2Go Mobile

Production-ready React Native mobile app for the Track2Go IoT passenger information system. Connects to the **same Supabase database** as the Admin Dashboard.

## Tech Stack

- React Native + Expo (TypeScript)
- React Navigation (role-based navigators)
- Zustand (state management)
- Supabase Auth + Realtime
- React Native Maps
- Expo Notifications
- NativeWind (Tailwind CSS)
- React Hook Form + Zod

## User Roles

| Role | Access |
|------|--------|
| **Passenger** | Live tracking, schedules, terminals, notifications |
| **Driver / Conductor** | Dashboard, passenger counter, emergency alerts, trip history |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

Copy `.env.example` to `.env` and add your Supabase credentials (same project as Admin Dashboard):

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run mobile schema migration

In the Supabase SQL Editor, run `supabase/mobile_schema.sql`.

### 4. Create test users

In Supabase Auth, create users with metadata:

```json
{ "name": "Juan Dela Cruz", "role": "driver" }
```

Roles: `passenger`, `driver`, `conductor`

For drivers, set `assigned_bus_id` in the `profiles` table.

### 5. Start the app

```bash
npx expo start
```

## Project Structure

```
src/
├── navigation/     # App, Auth, Passenger, Driver navigators
├── screens/        # Auth, passenger, and driver screens
├── components/     # Reusable UI and map components
├── hooks/          # Realtime and location hooks
├── services/       # Supabase API services
├── store/          # Zustand stores
├── types/          # TypeScript definitions
└── utils/          # Helpers and constants
```
# Dev-mobile
