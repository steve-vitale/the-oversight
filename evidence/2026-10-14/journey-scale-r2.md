# Journey SCALE r2 — run note (2026-10-14, oversight-playtest-loop)

## Pre-registration (MEASUREMENT §§9–12, 14) — written before any sim

- **Leg:** 3 (scale) — days 80–140: regional → national, hierarchy, the table approach.
- **Question:** Do the national beats PLAY sensibly when a competent player actually reaches them? Do they land as moments (canon: "a moment, not a threshold")? Does the village know it's a realm?
- **What would count as interesting:** beat copy that reads flat/broken on transcript; beats answered with no visible consequence ("silent actions"); villagers never mentioning the biggest political event of their lives; reachability of national under courtship policies on pilot seeds.
- **Seeds:** 11, 22 (leadcourt) · 33, 44 (belongseek) · 55 (belongseek, REFUSE_TEST=1). Horizon 150d, death-aware.
- **Pilot:** 5 seeds — the leg's question showed plenty; no expansion needed.
- **Metric binding (§14):** this is an assessment run, not a lever run — the deliverable is the sense-tested assessment + blanks. Metrics (beats staged/answered, rank trajectory, transcripts) bind the assessment; revision proposals go under "metric review".

## What ran

New harness `scripts/journey-scale-r2-20261014.js`: courtship policies, watches `state.pendingNational`/`pendingGlobal` daily, answers beats with a canon option spread (generous first, alternate second; REFUSE_TEST answers 'refuse' on the first beat), captures marker-anchored staging blocks + synchronous answer lines + next-day aftermath, full conversations at days 85/105/125, end-of-run census. Per-seed evidence: `evidence/2026-10-14/journey-scale-r2-<policy>-<seed>.json`.

## Pilot results (5 seeds)

| seed | policy | days | end | rank trajectory | beats |
|---|---|---|---|---|---|
| 11 | leadcourt | 152 | survived | regional d50 → **national d81 (lead, feast)** → **global d82** → back to regional d141 (realm dissolved) | 2 |
| 22 | leadcourt | 97 | village-lost | regional d47 → **national d78 (lead)** | 1 |
| 33 | belongseek | 109 | village-lost | regional d42, never national | 0 |
| 44 | belongseek | 152 | survived | regional d42 → **national d73 (belong, swear)** → back to regional d142 | 1 |
| 55 | belongseek | 152 | survived | regional d42; beat staged d78 (belong, 6-fire realm) → **REFUSED** | 1 |

National reached on 3/5 (2 lead, 1 belong), refused on 1/5. Pacing matches canon (national d73–81, the designed 65–90 courtship window; one rung per season). Villager deaths 7–18/run.

## Sense-test findings

**The beats PLAY.** The First Court staging — "Speakers from Thornfield, The Red Table, Stonebridge ride in for the first court — and every one of them is measuring you" — is a real moment with named villages and legible pressure. The Binding — "You are not the head of this. That is the point" — works. Every answer I exercised said its consequence aloud (feast 🍲 5,000 kcal line verified in code; refuse's "Noted. The offer is withdrawn — permanently" + plain-price line verified in code; walk/defer line verified). No silent actions in the beat machinery.

**The realm dissolved aloud, twice.** Seeds 11 and 44 lost their polities (~d141–142) and dropped back to regional — the live-state mechanic (2026-10-10) working as designed, rank read defensively.

**The Watchers staged the day after national (seed 11, d82).** Viewership 32 bar cleared immediately on the national deed-spike — the "season of being worth watching" landed in ~1 day of national, not a season. Whether that's too fast is a design-feel question (Steve's call), not a bug — but it did not feel like a separate earned rung. Noted, not changed.

## Blank 1 (FIXED): `Name: "undefined"` in ambient villager narration

`villageLives()`'s "discovers something" branch fell through to `this.say(`${first}: "${person.line}"`)` — `person.line` is not a real field, so ~15% of ticks rendered e.g. `Priya: "undefined"`. The same bug class conversation.js:3927 already guarded against; this emitter was missed.
Fix (game.js): knowledge-gated discovery-echo lines (`plantDisplayName`) — "The wild strawberry patch is fruiting again. Somebody should get out there." — or a land-reading fallback. Proof `scripts/test-ambient-discovery-line-20261014.js`: RED 46/300 ticks on pristine; GREEN ×3 seeds after (0 undefined, 50 echo lines fired on seed 7, names correctly descriptor-gated).
Regressions: test-drifter-presence (18/18), test-villager-xp, test-dialog-gating (ALL GREEN).

## Blank 2 (FIXED): the national beat never entered the village's social fabric

Across 6 full transcripts on days 85/105/125 (after a day-80 First Court + day-81 Watchers), NO villager ever mentioned the realm, the court, the oath, or the four fires. Gossip carried "Ruby walked away" but not "we are a realm now." The ladder's biggest beats were engine state, not lived fact — contra Steve's "information spreads by gossip, not broadcast."
Fix (scaleDiscovery.js + hierarchy.js): `_sdNationalBeatEcho()` — a shape-aware villager echo at the fire, 2+ days after nationalLive goes live, once per run (follows the `_sdNationEcho` "gossip, not broadcast" precedent). hierarchy.js records `nationalShape`/`nationalPrimary` at the beat choke point (non-behavioral). Also fixed `_sdName` rendering stranger descriptors as bare "A" (whole-descriptor, hierarchy._repName precedent).
Proof `scripts/test-national-beat-echo-20261014.js`: RED on pristine (0 echo lines); GREEN ×5 shapes, once-only verified, names whole. All new lines are in the [needs-eyes] commit for Steve's ear.

## People check (SENSE-TESTING LAW)

- Concrete wants PLAY: Victor's ask_favor (wound cleaning) progressed stage 0→3 with a real ask, escalation ("getting worse, not better"), commitment ("Count me in"), and resolution=promised — an obligation created. Meets the bar.
- Open-ended wants STALL: three `curious`-want conversations opened with real questions ("What do YOU think actually happened to us?") then degraded into 4–5 exchanges of filler ("That's the whole of it. Sorry." / "So." / "They nod slowly, not quite done") with resolution=engaged — a lie; nothing resolved, planted, or owed. The want has no third act. (General conversation-system pattern, not leg-specific — noted, not fixed here.)
- Teaching beats land: plant-teaching responses are varied and human ("And I've been walking past it for weeks.").
- Gossip is alive and specific ("Ruby just walked away from Haven. Didn't look back." / "Meera is back. Walked in like they'd never left.") — the village tracks its people.

## Village assessment (plain words)

Seed 11 (the full-arc run): Haven survived 152 days, built a 3-subordinate realm by day 80 (Thornfield, The Red Table, Stonebridge), feasted the first court, watched the planet lean in the next day, then lost the realm around day 141 when the links snapped — back to a free fire at regional, still alive. 18 villagers died along the way, mostly to monsters. The tribute worked: 2,546 kcal walked in from The Red Table with pack-mules, "real pieces, honestly counted." Nobody in the village talked about any of it until this run's fix.

## Reachable / fun / winnable verdict

- **Reachable:** yes, on the courtship roads — a player who does diplomacy (gifts, tribute, tending) reaches national in the designed window. A competent player who never courts never leaves regional (r1 + the r17 finding: competent proposes 0 links) — honest, not a wall: the scale IS the diplomacy game.
- **Fun:** the beats are the fun — staging copy is strong, answers have real costs said aloud, the realm dissolving is dramatic rather than buggy. The missing villager echo was the one dead spot; fixed.
- **Winnable:** this leg doesn't reach the table (0/5 table approaches; the table is leg 4's question). National is reachable; the endgame chain beyond it stays the flesh-out loops' wall work.

## Metric review (for the NEXT run)

- `markerCounts.national` read 0/5 runs despite 4 beats staging — the marker regexes ("national", "first court") don't match the actual staging copy ("Four fires. One head."), and the journal line bypasses the say-capture. The beats ARRAY is the honest signal; next run's telemetry metrics should use `beats` (already the seeded baseline's primary).
- The seeded baseline (`telemetry-baselines/scale.json`) sums 5 pilot runs: beats=5, villagerDeaths=61, monsterSlain=78, rosterAlive=22, maxGameDay=662, tribute mentions=10. All LOUD lines on seeding were "newly appeared" — expected, no investigation needed.
- `test-scale-ladder-20261010.js` (24 failures) and `test-national-shapes-20261010.js` (3 failures) fail IDENTICALLY on pristine code — rotted scripts from 2026-10-10, not this run's regressions. Flagging for the tooling backlog: the scale regression suite needs a refresh pass.
- The Watchers staging 1 day after national (viewership bar cleared on the national deed-spike) deserves a design-feel ruling from Steve — is global supposed to be nearly automatic once national lands?
