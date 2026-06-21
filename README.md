# 1% Better

A calm, premium habit-tracker built on the idea of improving **1% each day**. Each
day you log progress on your habits and write a single short *learning* — one
insight from the day. Over time, they compound.

Built with **React Native + Expo (Expo Router)** and **TypeScript**. Runs on iOS,
Android, and the web.

## Run it

```bash
npm install && npx expo start --web
```

This installs dependencies and opens the app in your browser at `http://localhost:8081`.
(Use `npx expo start` for the dev menu / native devices.)

## What's inside

Three tabs:

- **Today (Enter)** — today's date, your habits as satisfying tappable toggles, a
  multiline "What's one thing you learned today?" field that auto-saves, and a
  gentle streak counter ("Day 12 of getting 1% better").
- **Dashboard** — a monthly calendar showing completion per day (tap a day to
  reveal its learning), a stats strip (streak / completion rate / total learnings),
  and a curated **Top 5 Learnings** list (star a day to pin it).
- **Tracks (Habits)** — add, rename, recolor, re-icon, and remove habits. Changes
  reflect on Today immediately.

## Data

- **Model:** `Habit { id, name, icon, color, createdAt }` and
  `DailyEntry { id, date, habitCompletions, learning }` — see [`storage/types.ts`](storage/types.ts).
- **Persistence:** all data is stored locally with **AsyncStorage** (backed by
  `localStorage` on web), so it survives reloads — see [`storage/storage.ts`](storage/storage.ts).
- **Seed:** on first run the app seeds 3 example habits and several past entries so
  nothing is empty — see [`storage/seed.ts`](storage/seed.ts).

To wipe local data: clear your browser's site storage (web), or reinstall the app.

## Project structure

```
app/                  Expo Router routes
  _layout.tsx         Root: providers, splash, store loading
  (tabs)/
    _layout.tsx       Bottom tab bar
    index.tsx         Today
    dashboard.tsx     Dashboard
    habits.tsx        Tracks
components/            Reusable UI (Card, Text, Button, HabitToggle, Calendar, …)
theme/tokens.ts       Single source of truth for colors / spacing / type / radii
storage/              Types, AsyncStorage layer, seed data, React store (context)
lib/                  Date helpers, stats (streak / completion rate), icon catalog
```

## Design

A single token file ([`theme/tokens.ts`](theme/tokens.ts)) defines the soft
olive/sage palette, spacing scale, serif headings, rounded radii, and soft
shadows. No colors are hard-coded in components. Micro-interactions (toggle
spring + celebratory checkmark, calendar fades) use `react-native-reanimated`.
