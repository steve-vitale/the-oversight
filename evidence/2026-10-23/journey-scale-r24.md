# Journey SCALE r24 — THE LEAD ROAD, STAY-GREEN + TABLE-APPROACH VOICING (2026-10-23)

**Run id:** oversight-playtest-loop-2026-10-23T13:44:12Z (lane A). Worktree: `journey-scale` (base master@8bbfcc205, registered, heartbeated <15min throughout).

**Rotation:** read 0 at run start — but this run played leg 3 (SCALE), not leg 0. Reason: the 07:45 CDT lane-A run (scale r24 attempt) EPERM-failed before playing its leg yet advanced the rotation 3→0 (its own run summary). Replaying landing (r39 completed 04:45, merged 751ade579) would be thrash; the scale leg was the unplayed gap. r24 plays leg 3 and writes 0 on completion (3→0, file already read 0 — verified content unchanged). Queue-jump noted per the loop body.

**Canon read:** CANON.md (standing rules), SCALE.md (Iron Court, Watchers, table approach), TABLE.md (seat pricing). No new canon invented.

## Pre-registration (MEASUREMENT.md §§9–12, 14 — written BEFORE the pilot ran)

**Leg question:** on the lead road at the current tip, does the climb stay green (national ≤140, global earned), and is the table approach honest — when the seat opens is it voiced, and when it doesn't (seat 'none' at national/global), does the game name what's missing or sit silent?

**Binding metrics (NO-GO never re-scored; revisions go to "metric review"):**
- L1 stay-green — ≥2/4 seeds reach national ≤d140.
- L2 moment — every national seed has the transition VOICED aloud (sense-read).
- L3 table-approach honesty — every seed ending national/global: tableSeat() detail sampled weekly + at end; seat openings voiced aloud (GO); seat-'none' endings checked for ANY seat-bar voicing — silence is a DOCUMENTED BLANK.
- L4 people — ≥4 full transcripts sense-read in the scale window, 0 senseless.
- L5 survival — villages alive+coherent at decision day or honest death.

**Interesting-finding bar:** tending engine at this tip; seat detail on lead-road globals; the Watchers' feast answer; where lead links break.
**Horizon:** DAYCAP=150 loop-days, death-aware stop. **PILOT FIRST:** 4 seeds 70001–70004 (fresh; r21 30001–30004, r22 40001–40004, r23 60001–60004). **Policy:** leadcourt (competent + lead-road courtship).
**Script:** scripts/journey-scale-r24-20261023.js (r21 lineage + seatWatch weekly tableSeat sampling, table-approach line extraction, global-answer notes, corrected national-voicing markers per r21's metric review). Analyzer: scripts/analyze-scale-r24-20261023.js.

## Verdicts (binding)

- **L1 GO (4/4).** National at game-days 77, 77, 101, 106 (all ≤140). Matches r21's 77/77/98/92 band.
- **L2 GO (4/4).** "◈ SYSTEM: 'Four fires. One head. GOVERNANCE LAYER: online'" staging + "The shared granary opens" resolution, sense-read in captures (the r21-note-corrected markers; the driver's old regex was fixed in-run).
- **L3 MIXED → BLANK FILLED (see below).** Seat openings are voiced richly (70003: Arc IV + villager gossip + tableWaiting). Seat-'none' endings were SILENT for non-reactor bearers — fixed in-run.
- **L4 GO.** 6/6 transcripts sense-read (70001 d60/d90/d120/d140, 70003 d140, 70004 d120), 0 senseless, 0 fabricated history.
- **L5 GO.** 70001 alive 10/10 d151; 70003 alive 8/8 d151; 70002 honest scattering (famine, voiced "The scattering, again."); 70004 honest combat wipe d127 (0/0, all causes recorded).

## The find + fix: seat-waiting silence at the top of the ladder (FIXED)

r23's 60001 reached GLOBAL (d94) with seat 'none' (one wave-2 fight short) and sat silent to d155. r24 reproduced it twice on the lead road: 70002 (global d128, seat 'none', missing food-thesis deeds, scattered d146 in silence) and 70004 (national d106, seat 'none', wiped d127 in silence). The reactor beat (journey-endgame r14) named the miss-list aloud — but only for pellet bearers. The Watchers' promise ("the table has your name now") followed by total silence about what's missing is a no-silent-actions violation.

**Fix** (`src/js/progression.js`, checkArc): SEAT-WAITING HONESTY block — non-reactor bearers at want≥3, day≥90, seat 'none' get the same once-per-run miss-list voicing ("◈ THE TABLE — the ring of pale light flickers... and does not come. Not yet... The ledger still wants: X. The climb is not over."), guarded by `!pg.reactorSeatTold` (reactor path keeps its own beat) and `pg.seatWaitingTold` (once per run). No pellet framing; a status, not a verdict — the seat can still be earned.

**Proof:** `scripts/test-seat-waiting-honesty-20261023.js` — A: fires once naming a bar; B: no re-fire; C: silent on lesser seat; D: stands down when reactorSeatTold set; E: day-89 floor respected, fires at 95. ALL GREEN on fixed code; FAILS on pre-fix code (A: 0x fired — the observed silence). Wild re-run (4 seeds, post-fix): trajectories byte-identical on every binding metric; the new beat fired once each on 70002 ("the food-thesis deeds") and 70004 ("the food-thesis deeds"); 70001's reactor beat still fired and the new block correctly stood down.

## The arcs, in plain words

- **70001 — the pellet village.** National d77, global d78 (Watchers feasted, viewership 56). The scholar took the fusion reactor; the reactor beat named the one missing bar (wave-3 monsters faced, w3=0). 10/10 alive, 46,939 kcal, arc 3. Grayson's leadership arc across d120→d140 ("I've been the one in the corner with the plan... Leadership isn't a title. It's the person who stays up wondering if everyone ate.") — an NPC with a developing political agenda.
- **70002 — the climb's price.** Global d128, then the granary emptied: famine scattering d146, voiced aloud ("Haven couldn't hold... The scattering, again."). Seat 'none' (missing food-thesis deeds) — the new beat now says so. Tending cost is real (34 tends).
- **70003 — the table approach, working.** National d101, global d102, lesser seat ~d112 (w1=19, w2=10, w3=5, w4=4, w5=1, 18 contests, 4 crises, food-thesis deeds done). Arc IV fired: "ROUNDING ERROR RECLASSIFIED: ANOMALY. Organic consumption yields impossible output... The case is made of deeds, not words." Villagers gossip by the fire: "The table's set. The ring of pale light — it's just sitting there. Waiting on them." Then the realm came apart (voiced: "no polity answers to Haven now, and Haven is a free fire again") — and the seat HELD through the dissolution (regional still qualifies). 8/8 alive.
- **70004 — the honest wipe.** National d106, combat wipe d123–127 (hushwolf, then player deaths in honest fights). 0/0. Every cause recorded.

## People check (6/6)

- 70001-d60 Hassan (butcher, steady): anger want engaged honestly ("Anger's a fire — useful if you cook with it, deadly if you sleep next to it. I cook with mine.").
- 70001-d90 Grayson (army medic, intense): laugh-memory + field teaching (Chrysanthemum Greens, Lotus Root — real specifics) + places.
- 70001-d120 Grayson: ask_favor as leadership bid — 7 distinct escalating lines under repeated "tell me more", ends naturally. Political agency, no fabricated history.
- 70001-d140 Grayson: the bid continues 20 days later ("Might as well be the one in the middle with it"), closes planting an open thread ("Think about it. Really think. Then come find me.").
- 70003-d140 Vasyl (infantry, withdrawn): seek_comfort grief, brief and temperament-true ("...Thanks for being here. That's all.").
- 70004-d120 Haojie (joined villager, tattoo artist): wants to learn, accepts deferral gracefully, asks for company ("Come get air with me. I need to think out loud.") — 7 days before the wipe.

## Metric review

- No metric re-scored mid-run. L3's "silence is a documented blank" was the pre-registered framing; the blank turned out fixable, so it was fixed with before/after proof rather than merely documented.
- Telemetry check vs `telemetry-baselines/scale-lead.json` (maxGameDay, nationalFirstDay — the honestly mappable metrics): quiet, no LOUD lines. Baseline NOT rolled.
- Pre-existing test failures (reproduce on pristine HEAD, unrelated): test-table-core-20261011.js crashes; test-progression.js fails in freshGame/genRoster. Reactor-seat-honesty PASS, tablewithdraw GREEN on this tip.
- Driver note: the r21 script's nationalVoiced regex still carried the stale markers r21's own metric review corrected — fixed in the r24 driver (both regexes).

## reachable / fun / winnable (scale leg)

- **Reachable:** lead road stages national 4/4 ≤d106; global 3/4; the lesser seat opens in-window with full voicing (Arc IV, gossip, tableWaiting).
- **Fun:** the Watchers' feast answer plays; the realm-dissolve-and-hold arc (70003) is the system at its most alive; Grayson's slow leadership bid is real social emergence.
- **Winnable:** the table approach opens on the lead road for competent play (70003 lesser seat, arc 4, tableWaiting=true). The win itself is lane B's leg.

## Evidence

`evidence/2026-10-23/journey-scale-r24-lead/` — 4 census JSONs (pre-fix run preserved in `journey-scale-r24-lead-prefix/`), per-seed captures, beats/moments/table line files, 14 transcripts. Driver + analyzer + proof test under `scripts/`. Fix: `src/js/progression.js` (+29 lines).

## Ops

- Rotation: `journey-rotation-a.txt` → 0 (3→0; file already read 0 — the failed 07:45 run's advance stands, this run played the missed leg).
- Commit: [needs-eyes]? The fix is voicing-only (one new once-per-run line, player-facing prose). Per the loop body, feel-affecting changes get [needs-eyes] — this is a System-voiced line players will hear. Flagging it.
- Merged locally, pending ship (no bump/push — the ship loop owns those).
