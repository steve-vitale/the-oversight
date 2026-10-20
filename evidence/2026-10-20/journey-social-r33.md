# Journey social r33 — the rivalry lifecycle (lane B, 2026-10-20)

**Run id:** playtest-loop-2-20261020T1300Z (oversight-playtest-loop-2, lane B). Worktree: `journey2-social`.
**Base:** master e9bbbf0d0 (r26 endgame landed; rotation advanced 4→5 by main-agent closeout).
**Rotation:** read 5 (social life); advancing to 6 at closeout.

## PRE-REGISTRATION (MEASUREMENT.md §§9–12, 14 — written before the pilot ran)

**Leg question: THE RIVALRY LIFECYCLE.** r32's M2 went NO-GO (citizen villages
see ~0.5 moots/140d) and the gate-tuning call sits with Steve. This run
measures the fuel, not the gate: the 1–2 seeded NPC-NPC conflicts per village
(tension 55–75, kind old_wound/friction) simmer at +2 @ 10%/day
(`betrayalDaily`). Across a 140-day citizen run:
1. Do tensions climb toward the motive bar (70+)?
2. When a pair's motive crosses ≥45, does a plot form — or do the
   beloved-gate (90% skip at avg trust >55) / 40%-day / 2-accomplice bars
   suppress it?
3. Do high-tension pairs surface visibly (confrontations, gossip, cold
   conversation) or stay invisible until a plot fires?

**Design math (from code, verified this run):** grievance = tension×0.8
(unresolved); motive = grievance×0.8 = tension×0.64 (+25 lead-goal, +12
prove-goal). Plot needs motive ≥45 → tension ≥71 alone, or ≥32 with a
lead-goal ringleader. Simmer expectation: +0.2/day → 55→71 in ~80 days.

**Interesting-finding bar:** (a) pairs cross 70 and plots form → the pipeline
is alive, the gate is the story (data for Steve's ruling); (b) pairs cross 70
but no plots form → the accomplice/beloved bars suppress even qualified pairs
(names the suppressor); (c) pairs never reach 70 → the simmer can't feed the
gate (fuel missing).

**Binding metrics (a miss is NO-GO, never re-scored mid-run):**
- M1 instrument GO: daily conflict snapshots complete on 4/4 runs (no gaps
  >2 days); per-pair motive computed per snapshot.
- M2 fuel GO: on ≥2/4 seeds, ≥1 pair at tension ≥70 at some snapshot day ≥6.
- M3 people GO: 1 sense-read per run of a conversation with a conflict-pair
  member (4 reads); 0 senseless flags. Question: do they talk about the
  other — coldness, gossip, history?
- M4 census GO: alive/dead recorded cleanly on all runs.
- L3 informational: the theft-driver telemetry baseline does not bind the
  citizen arm (r32 metric review stands).

**Method:** r32's citizen driver unchanged (law-abiding: no theft, no cruel
picks, no player-initiated violence; comfort duty + gossip forcing + moot
duty voting with the room) + daily conflict telemetry (tension/kind/stage/
resolved/known per pair + motiveBetween) + plot-formation events. 4 fresh
seeds (3104–3107), DAYCAP=140, death-aware (+10d tail). 10-day smoke on seed
3008 first (instrument self-test).

**Stack:** TRIBFLOOR=1 (r32 pattern). No game-code changes planned; this is
a measurement run. If the instrument finds a bug-class blank (e.g. the
simmer never fires), it gets a proof test and a fix; otherwise evidence only.

---
*(results appended below after the runs)*

## RESULTS (4 seeds × 140d citizen runs, base e9bbbf0d0)

| seed | days | alive | pairs seeded | t0 range | tmax | ≥70 on d≥6 | plots | moots | end state |
|------|------|-------|--------------|----------|------|------------|-------|-------|-----------|
| 3104 | 142 | 6 | 1 (Rahul/Patryk) | 68 | 68 | 0 | 3 (d7,12,14) | 3 (all acquitted) | resolved d14 |
| 3105 | 142 | 8 | 1 (Francesca/Ines) | 73 | 73 | 0 | 0 | 0 | mediated d22 |
| 3106 | 142 | 7 | 1 (Christian/Olivia) | 64 | 65 | 0 | 0 | 0 | mediated |
| 3107 | 66 | 5 | 2 | 63–67 | 67 | 0 | 0 | 0 | 2 resolved; village collapsed (10 deaths) |

- **M1 (instrument): GO.** 140–146 snapshots/run, no gaps >2 days; motive computed per snapshot via `Game.motiveBetween`.
- **M2 (fuel): NO-GO (0/4).** No pair at tension ≥70 on day ≥6 on any seed. On 3/4 seeds `evermax == t0` — tensions never exceeded their seeded values.
- **M3 (people): GO.** 4 sense-reads, 0 senseless. Rivalries surface obliquely ("choosing sides", "I talk to both sides", "never speak"); the old_wound history unfolds at trust 45/70 via `convoConflictFallout`. 1/4 reads (3107 Stan, comfort sitting) didn't touch the rivalry — coherent, just not about it.
- **M4 (census): GO.** Recorded on all runs.

### The mechanism (the finding)

Two systems push tension in opposite directions, and the decay wins 5:1:

- `betrayal.js` `betrayalDaily` (the simmer): +2 @ 10%/day = **+0.2/day** expected.
- `game.js` `socialSimmer` (uncommented): `if (c.tension > 30) c.tension -= 1` = **−1.0/day**.
- `conflictIncident` (known + tension>40, 10%/day): ≈ +0.2/day expected.

**Net: −0.6/day.** Tensions decay toward 30 and can never climb to the plot
bar (motive ≥45 needs tension ≥71, or ≥32 with a lead-goal ringleader).
The motive bar is reachable only via (a) seeded tension ≥71 (~24% of the
55–75 range — a ~4-day eligibility window before decay closes it), (b) goal
bonuses (3104: prove +12 pushed 43.5 → 55.5, plot armed d7), or (c) recorded
grievances from actual events.

Seed 3105 is the clean demonstration: pair seeded at 73 (motive 46.7,
eligible days 2–4), no plot formed (beloved-gate: trust 91 → 90% skip; plus
40%/day and the 2-accomplice bar), decayed below the bar by day 6, mediated
on day 22. The fuel was there and drained unused.

Seed 3107 (trust 37.8 — beloved-gate OFF): still 0 plots, because motives
peaked at 40–42, never reaching 45. The gate isn't the only suppressor; the
fuel itself can't accumulate.

### Village assessment (census in plain words)

- **3104** (142d, 6 alive): the village that judged. Patryk's plot against
  Rahul (prove-goal ambition) armed day 7; three moots days 11–14, all
  acquitted; the conflict resolved and the village moved on. 69 bonds.
- **3105** (142d, 8 alive): the beloved village. Trust 91.3, nothing bad
  happened, Francesca and Ines's old wound (73!) quietly mediated away on
  day 22. Peaceful to the point of uneventful — the fuel drained unused.
- **3106** (142d, 7 alive): the friendly village. Christian and Olivia's
  friction (64→65→0) mediated away. 30 gossip convos — people talked.
- **3107** (66d, 5 alive): the village that died. Ten deaths in 66 days —
  mortality, not plot. Two old wounds decayed unremarked. The run stopped
  death-aware; no tail-ticking a dead village.

### Reachable / Fun / Winnable

- **Reachable:** rivalries are seeded in every village and surface visibly —
  the discovery beat ("never speak... Something old lives in Haven"), the
  incidents (sharp arguments, favoritism corners, eating apart), the
  trust-gated history unfolds. All fire under normal play.
- **Fun:** the rivalry content reads well — oblique, human, knowledge-gated.
  What's missing is *escalation*: rivalries only ever cool. They never
  boil. A player can watch a 73-tension old wound and know, mechanically,
  it will only fade.
- **Winnable:** n/a for the social leg; no run blocked by social systems.

## Design notes for Steve (not landed — extends r32's M2 note)

r32's M2 headline stands and sharpens. The formation gate has FOUR
suppressors, not three: (1) beloved-village 90% skip, (2) motive ≥45 bar,
(3) 40%/day roll + 2-accomplice bar — and now (4) **the tension decay
(−1/day) beats the simmer (+0.2/day) 5:1, so rivalries can never escalate
organically**. If moots should be a living institution, the question isn't
just the beloved-gate — it's whether rivalries should be able to boil at
all. If peaceful villages shouldn't do moots, say so and I'll close both
questions. **No tuning applied** — this run measured only.

## Regression

- `node scripts/check.js --quick` (--cacheDirectory=/tmp/jest-cache-playtest2): PENDING at note time — result appended below.
- `node --check` on the new driver: clean. No src/js changes this run (instrument + evidence only).

## TELEMETRY DEVIATION CHECK

`telemetry-check.js` vs `hidden_files/telemetry-baselines/social.json`:
4 LOUD lines, all explained, none rolled forward (r32's metric review
stands — baseline is theft-driver-bound):
- l3.deepBonds 70→126 (+80%): citizen driver builds deeper bonds. Driver-caused, good direction.
- l3.betrayalCases 53→3 (−94%), l3.mootsConvened 53→3 (−94%): baseline rolled under the theft driver; citizen arm generates few plots. Expected, pre-registered.
- l2prime.count 5→0 (disappeared): the r31 fix holding. Expected, good.

## METRIC REVIEW (§14)

- M1, M3, M4 GO. M2 NO-GO (0/4) — not re-scored; the bar stands.
- M2's bar (tension ≥70) measured the simmer's escalation ability. The
  mechanism found (decay 5:1 over simmer) suggests the bar was testing the
  right thing — the simmer genuinely cannot escalate. No metric revision
  proposed; the design question (should rivalries boil?) is Steve's.
- The 3107 run ended day 66 (village collapse, death-aware stop). Per
  §10 death-aware horizons, no tail-ticking. Its 66 days of telemetry are
  valid (M1's no-gap bar met).

## Evidence

- `evidence/2026-10-20/journey-social-r33.md` (this note)
- `evidence/2026-10-20/journey-social-r33-pilot-s{3104,3105,3106,3107}.json` (4 full runs + conflict telemetry)
- `evidence/2026-10-20/journey-social-r33-pilot.log`, `journey-social-r33-s3107.log`
- `evidence/2026-10-20/social-r33-transcripts/` (rival/comfort/gossip/deep sense-read sets)
- `evidence/2026-10-20/social-r33-moots/` (moot files; only 3104 had moots)
- `scripts/journey-social-r33-20261020.js` (citizen driver + conflict telemetry)

**Game-code changes:** none (instrument + evidence only). Merged locally, pending ship — no bump/push (ship loop owns that).

**Named next:** Steve's ruling on the moot/rivalry gate (r32 + r33 design notes). If he wants rivalries to boil: the decay-vs-simmer contradiction is the first knob, then the beloved-gate.
