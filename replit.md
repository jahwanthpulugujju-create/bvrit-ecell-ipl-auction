# BVRIT E-Cell IPL Auction 2026

A real-time cricket player auction platform built for BVRIT's E-Summit 2026 (25–26 March 2026).

## Stack
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend / DB**: Supabase (PostgreSQL + Realtime channels)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Fonts**: Rajdhani (headings), Orbitron (display), Space Grotesk (body)

## Architecture

### Data Flow
- **Players** — defined locally in `src/data/players.ts` (75 players, IDs `p1`–`p75`). No player rows in Supabase; all player metadata stays in the bundle.
- **Teams** — stored in Supabase `teams` table. Fetched and synced via Realtime.
- **Auction state** — single row in `auction_state`. Controls current player, phase, timer, bids.
- **Freezes / Cooldowns** — `team_player_freezes` and `team_global_cooldowns` tables.
- **RTM** — `rtm_state` table (one row per active RTM).
- **Bid log** — `auction_log` table (append-only).
- **Squad** — `team_squads` table (sold players per team).

### Context (`src/context/AuctionContext.tsx`)
Single context that:
1. Subscribes to 6 Supabase Realtime channels (auction_state, teams, freezes, cooldowns, rtm, squads).
2. Derives enriched player list (status: available / live / sold / unsold) from local data + DB state.
3. Exports all action functions: `registerBid`, `confirmSale`, `markUnsold`, `setCurrentPlayer`, `clearTeamFreeze`, `useRtm`, `cancelRtm`, etc.
4. Exports standalone `formatPrice(lakhs: number): string` helper.

### Pages
| Route | File | Description |
|-------|------|-------------|
| `/` | `src/pages/Index.tsx` | Landing hero |
| `/players` | `src/pages/Players.tsx` | Full player pool with filters |
| `/teams` | `src/pages/Teams.tsx` | Teams overview |
| `/team/:slug` | `src/pages/Teams.tsx` (`TeamDashboard`) | Team-specific dashboard with auth |
| `/admin` | `src/pages/Admin.tsx` | Auctioneer control panel (pw: `BVRIT2026`) |
| `/display` | `src/pages/Display.tsx` | Broadcast-style projector display with format stats card |

### Admin Password
`BVRIT2026` — stored in `src/pages/Admin.tsx` constant, checked client-side.

### Team Auth
`btoa(slug + ':' + password)` — simple base64 token stored in sessionStorage.  
Passwords generated via `generateTeamPassword()` and hashed via `hashTeamPassword()` in `src/data/teams.ts`.

## Key Files
```
src/
  context/AuctionContext.tsx   # All realtime state + actions
  data/players.ts              # 75 players (local, no DB)
  data/teams.ts                # Team helpers, slug/password utils
  lib/sounds.ts                # Web Audio API sound effects
  lib/supabase.ts              # Supabase client
  pages/Admin.tsx              # Auctioneer panel
  pages/Teams.tsx              # Team dashboard + TeamDashboard export
  pages/Display.tsx            # Broadcast-style projector view with format stats
  pages/Players.tsx            # Player pool browser
  components/AuctionTimer.tsx  # Countdown timer + TimerBar
  components/ConnectionStatus.tsx
  components/PlayerCard.tsx
  components/Navbar.tsx
supabase/
  migrations/20260318090000_sprint2_schema.sql  # Must be applied manually
```

## Database Migration
`supabase/migrations/20260318090000_sprint2_schema.sql` must be applied to the Supabase project manually (via dashboard SQL editor or Supabase CLI). It:
- Drops UUID FK constraints on `player_id` columns → changes to TEXT (local IDs like `p1`)
- Adds `bid_reset_seconds` column to `auction_state`
- Creates `team_global_cooldowns` table
- Creates `rtm_state` table
- Creates `register_bid(...)` atomic RPC function

## Purse / Price Units
- DB stores prices in **lakhs** (integer). Example: `12000` = ₹120 Cr.
- `formatPrice(lakhs)` converts to human-readable string (e.g. "₹1.20 Cr", "₹50 L").
- Admin forms accept input in **Crores**; multiply by 100 before writing to DB.

## Sprint 2 Features (added 2026-03-18)
- Freeze rings on team bid buttons (SVG countdown arc)
- Global team cooldown tracking
- RTM (Right To Match) overlay on team dashboard
- Atomic bid registration via `register_bid` RPC
- Sound effects (bid beep, freeze rejected, sold fanfare, urgent beep, unsold)
- 5-zone Display: stats bar, main player card, team bid grid, sold ticker, team budgets sidebar
- Team dashboard: FreezeBanner (circular countdown), RTM overlay, 3-strike auth lockout
- Admin: TeamQuickView (right-click), LiveMonitor tab, announcement system

## CSS Animations
Defined in `src/index.css`:
- `.animate-marquee` — horizontal scroll for sold ticker
- `.animate-sold-stamp` — stamp-in effect for SOLD badge
- `.animate-bounce-in` — slide-up for announcements
- `.animate-pulse-glow`, `.animate-float`, `.animate-ticker`
