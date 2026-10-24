# journey-scale r26 — stay-green at the moved tip (2026-10-23, lane A, leg 3)

**Run id:** playtest-loop-a-scale-20261024T004553Z. Rotation read 3 → leg 3 SCALE (days 80–140); wrote 3→0.
**Base:** master@3320f6529 (current at pull; moved since r25: r38 wave-3-in-the-wild surfacing + teach-line fix, r29 establishment contest-news, batch ship bump).
**Driver:** `scripts/journey-scale-r26-20261024.js` (adapted from r24's driver; fresh seeds 81001–81004, DAYCAP=150, leadcourt policy).
**Analyzer:** `scripts/analyze-scale-r26-20261024.js` (worktree-portable DIR fix — the r24 analyzer hardcoded `$HOME/workspace/the-scattering`).

## Pre-register (binding, §14)

Leg question: at the current tip, does the lead road stay green and honest — national ≤140, national voiced, seat approach voiced or the seat-waiting/reactor beat firing where due?

- **L1 stay-green:** ≥2/4 seeds reach national ≤d140.
- **L2 moment:** every national seed has the transition VOICED aloud (sense-read).
- **L3 approach honesty:** every seat-'lesser' opening voiced (Arc IV / tableWaiting, sense-read); every seed ending national/global ≥d90 with seat 'none' and want≥3 (non-reactor bearer) must fire the r24 seat-waiting beat exactly once, or the reactor beat for pellet bearers; silence = NO-GO.
- **L4 people:** ≥4 transcripts sense-read, 0 senseless.
- **L5 survival:** alive+coherent at decision day (150 loop-days) or honest death.
- Interesting-finding bar: r38's wave-3-in-the-wild on wave deeds vs r24; seat-waiting fix still firing; where lead links break.

## Verdicts (binding)

- **L1 GO (3/4).** National at game-days 77, 86, 92 (81001, 81003, 81004). 81002 never went national (stayed regional) — still earned the lesser seat (see datum below).
- **L2 GO (3/3).** "◈ SYSTEM: 'Four fires. One head. GOVERNANCE LAYER: online…'" staged on all three national seeds, sense-read; First Court beat with the feast/host/cold choice, all on the feast answer.
- **L3 GO (4/4).**
  - 81001 (national d77, wipe d121, seat none): pellet bearer — the REACTOR beat fired naming the miss ("the food-thesis deeds (no feast can carry the surge while the pellet hums)"). The r24 seat-waiting beat correctly stood down (`reactorSeatTold` set).
  - 81002 (regional-only, seat LESSER): Arc IV + villager gossip ("The table's set. The ring of pale light — it's just sitting there. Waiting on them.") fully voiced. **Design datum (first lead-road observation): the lesser seat earns at regional without ever going national** — the bar only needs regional+ (2026-10-13 standing change). Not a bug.
  - 81003 (national d86, global d87, dissolved to regional, seat lesser): Arc IV + gossip + Watchers beat ("Species agency: unlocked… the table has your name now", feasted answer). Pellet taken AFTER the seat was earned (~d140); the reactor beat correctly stood down (`seatNow === 'lesser'`), no silence, no contradiction.
  - 81004 (national d92, seat lesser): pellet taken mid-game → reactor beat fired naming the miss → mantle passed → the successor earned the food-thesis deeds → "The table is being set — a lesser seat" + Arc IV. The full designed arc replayed end to end at this tip.
- **L4 GO (6/6 sense-read, 0 senseless).** Kafui (language barrier, honest nodding), Owen (pantry-run favor: "I'm not choosing who eats"; honest decline), Ziad (wound favor, withdrawn-close), Elsie (wound favor, gentle), Joseph (grief: "We gave them a good burial. Doesn't feel like enough, does it?"), Aria (curious: "A plan's just a direction you argue with").
- **L5 GO.** 81001 honest combat wipe d121 ("Brayan is dead — and the dead hold no treaties. Every link Haven has shakes." … "The village dies out — quietly, the way villages do. The season ends here."). Others alive 7–8/7–8 at d151, pantries 9.6k–13.5k.

## Interesting findings

- **Wave-3 deeds (r38 wave-3-in-the-wild):** r26 w3 = 3/7/5/5 (median 5) vs r24 = 0/7/5/6 (median 5.5). No material movement on this road; r38's surfacing didn't inflate or starve deed acquisition here. The wave-5 wall stands in-window (w5 = 0 on all seeds) — consistent with r25; still lane B's endgame business.
- **Seat-waiting fix:** intact. `scripts/test-seat-waiting-honesty-20261023.js` ALL GREEN (A–E) at this tip; wild trajectories show the beat firing exactly where due and standing down on pellet bearers and already-seated runs.
- **Lead links:** 81001's realm dissolved with the wipe; 81003's dissolved after global ("no polity answers to Haven now") — voiced; 81002's 3-link regional and 81004's national both held to d151.

## Blanks / observations (documented, not fixed — non-critical per speed-over-polish)

1. **Knack-gossip template repetition:** in one sitting, Owen's gossip told "Vasyl found a lost knife by smell last week. By SMELL." and later "Pavel found a lost knife by smell last week. By SMELL." (`src/js/spawn-knack.js:216` — one template, `${first}` templated per knack-holder). If both genuinely hold the bloodhound knack it's coherent, but it reads as a duplicated anecdote; there's no per-conversation dedup across knack targets. Minor; single observation.
2. **Driver-choice artifacts (not content bugs):** the journey driver's engage-first picker leaves right after a favor commit, so the generic close line ("That helped. Thank you for sitting with me.") follows a favor nobody has done yet; and it picks `leave` on a grieving NPC when the menu only offers betrayal choices. Playable-read nuance, driver-side.

## Metric review

- No metric re-scored mid-run. All binding metrics GO.
- **Telemetry check:** 2 LOUD lines (`maxGameDay disappeared: baseline 1278 → current 0`, `nationalFirstDay disappeared: baseline 616 → current 0`) — investigated, EXPLAINED: the `scale-lead.json` baseline keys come from an older instrument's corpus aggregates and don't map to this driver's per-seed census shape (`census.day`, `census.nationalDay`). Same artifact r25 documented. Manual comparison shows no deviation: national 77/86/92 vs r24's 77/77/101/106 band; survival 1 wipe + 3 alive vs r24's 2 alive + scatter + wipe; seats 3 lesser + 1 pellet-none vs r24's 1 lesser + 2 none + 1 reactor. Baseline NOT rolled.
- **Metric proposal for the next run (carried from r25):** the leg stays bound to the lesser seat + approach honesty; the full-seat push remains lane B's endgame business. The regional-only lesser seat (81002) is the leg's own business working as designed — no metric change needed.

## Reachable / fun / winnable (scale leg)

- **Reachable:** lead road stages national 3/4 ≤d92 at this tip; the lesser seat opens in-window with full voicing (Arc IV, gossip, tableWaiting) — on the national road, the dissolved-global road, AND the regional-only road.
- **Fun:** the reactor-beat → mantle-passing → successor-earns-the-seat arc (81004) is the System at its most cutting and the food thesis paying off; the dissolve-and-hold arc (81003) keeps the ladder feeling live.
- **Winnable:** the table approach opens on competent lead-road play (3 lesser seats). The win itself is lane B's leg.

## Evidence

`evidence/2026-10-23/journey-scale-r26-lead/` — 4 census JSONs, captures, beats/moments/table line files, 14 transcripts, driver log. Driver + analyzer + this note under `scripts/` / `evidence/`.

## Ops

- Rotation: `journey-rotation-a.txt` → 0 (3→0).
- Commit: tooling + evidence only, no src changes. No [needs-eyes] — no player-facing change.
- Merged locally, pending ship (no bump/push — the ship loop owns those).
- Infra notes: (1) `.git` EPERM flap hit the first worktree-register attempt (branch created, worktree not); cleared within minutes; retried clean. (2) First background launch's stdout redirect raced the mkdir — relaunched after mkdir; smoke seed completed fine. (3) Master moved not at all during the pilot window this run.
