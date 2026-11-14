# journey-scale r196 — RUN NOTE (lane A, leg 3 SCALE, national on-ramp on current master)

**Run id:** `playtest-loop-a-20261114T0258Z` (lock run_id `laneA-scale-20261114T025800Z`).
**Run:** scheduled Fri 2026-11-13 20:45 CST; lock created 02:58:00Z (started
~13 min late — scheduler/queue delay). Pre-flight: main tree clean, disk
39%, lock absent (no stale-lock recovery), `git pull` already up to date at
443255263 — master then moved twice under the run (r197 adoption bb9e63e7b,
transplant7 record 486405e05); the worktree registered on 486405e05, so no
rebase is owed at merge time unless master moves again. Reap: nothing
removed; 13/16 active; 4 dirty trees LOUD (owners must commit/release —
none mine).
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only.**
**Base:** local master `486405e05` (sim-transplant7 record-only).
**Worktree:** `journey-scale` (registered 03:13Z; first attempt was killed
by a runtime restart mid-`git worktree add`, leaving a half-checked-out tree
on a stale branch that pointed at the lane-B succession tip bb9e63e7b —
recovered by removing the broken tree + deleting the stale branch and
re-registering clean; registry entry verified present after). Heartbeat at
registration + hbloop `~/workspace/worktrees/journey-scale-hbloop-run.sh`
(10-min cadence, verified alive at each phase).
**Prereg:** `evidence/2026-11-14/journey-scale-r196-prereg.md` (committed
BEFORE any judged sim: instruments commit 02cdaa368).
**Corpus:** `hidden_files/evidence/2026-11-14/journey-scale-r196-*` (goal
store — moved from the repo evidence subdir to follow the r188 pattern).
**Driver:** `scripts/journey-scale-r196-20261114.js` (r195 clone).
**Analyzer:** `scripts/analyze-journey-scale-r196-20261114.js` (r195 clone
+ lived-days control re-based to the r195 band's 392). **Proof:**
`scripts/test-journey-scale-r196-analyzer-20261114.js` (29/29 green — see
§Analyzer).

## Panel (seeds 135201–135204, DAYCAP=140, policy scalecourt-traderoad-r113-linkraise-sit)

| seed | days | over | pop | rank | peakStage | lesser | wave-4 kills | deaths (top cause) |
|---|---|---|---|---|---|---|---|---|
| 135201 | 82 | over | 0/0 | regional | 3 (d28) | d38 | 1 (scholar 1) | 18 (the wild 13) |
| 135202 | 97 | over | 0/0 | regional | 3 (d39) | d47 | — | 18 (the wild 12) |
| 135203 | 141 | alive | 4/4 | regional | 3 (d30) | d34 | 5 (scholar 1, villagers 4) | 15 (the wild 10) |
| 135204 | 140 | alive | 4/4 | regional | 3 (d41) | d107 | — | 11 (the wild 4) |

Lived-days 460 vs r195 band 392 (+17.3%, guardrail ±25%: HOLD). Lesser
seat priced 4/4 (bar ≥3/4: HOLD). Books close on all 4 seeds;
unattributed 0; teleOnly 0. Fights (startCombat count): 34/24/62/95 =
215; wave-4 fights 30/10/43/72 = 155; **wave-5 fights 0 on all seeds**
(the wave-5 door never opened). Tribute: military_tribute ready d127 on
135203, **delivered d140 — 1/11 attempts** (see §Tribute).

## Q1 (PRIMARY) — NATIONAL ON-RAMP: NO-GO on the wall, blocker named per seed (interesting)

National 0/4 — no village reached national (a polity). Per the
pre-registered interesting-finding rule, 0/4 with a named per-seed blocker
IS the informative outcome:

- **135201 (over d82):** COLLAPSE — village over before national (final:
  LEAD 0/3 seasoned).
- **135202 (over d97):** COLLAPSE — village over before national (final:
  LEAD 0/3, TRADE 1/3).
- **135203 (alive d141):** closest road LEAD 0/3 seasoned (1 active) —
  needs 3 more seasoned. The one active link (village_1, formed d12) sits
  at trust 26 — decayed below the 40 bar (mournUntil d144).
- **135204 (alive d140):** closest road LEAD 0/3 seasoned (3 active) —
  needs 3 more seasoned. **New shape vs r195:** the village HAS three
  subordinates, but none is seasoned — village_3 (formed d12, trust 54 at
  d49) fell to 35 after a succession crisis (-8 at d50) plus slow decay;
  village_2 (formed d42) sits at trust 7; village_1 formed d125, too late
  to season. One link WAS seasoned at d42 (lead=1/2) — the realm was one
  link away, then trust decay took it back.

The wall stands on a fresh band: survived 2/4 (up from r195's 1/4),
regional 4/4, national 0/4, table 0/4, wins 0/4, wave-5 0/4. The collapse
is combat-driven, not food-driven: 39 of 62 deaths are "the wild", and the
living seeds end with food in hand. Nothing in this panel overturns the
picture; the 135204 shape sharpens it — the binding constraint is now
trust *held* above 40 for a season, not links acquired.

## Tribute — delivered at last (135203)

- military_tribute ready d127, **delivered d140, 1/11 attempts**
  (deliveriesOk 1, attempts 11). First tribute delivery on the scale leg
  since r134's 1/4 — r195's 0/7 echo does NOT repeat.
- The d137–d140 sequence corroborates r194's M23 call (metric artifact,
  not a delivery bug): d137 military_tribute reads `veterans-short`
  (vets=1 — the scholar had died and the successor had 1 living vet);
  d139 back to `ready` (vets=2); d140 delivered. Delivery follows the
  living-veteran count.
- The same window shows succession working in the wild: the scholar died
  between d136 and d137 (ingrid_vik → visjoin_128), tracks dropped
  (counted 62→55, fXp 165→128), and the village still delivered.
- Observation (not a defect): the d140 ladder line prints all three caps
  as `delivered` (`trade_charter=delivered,feast_embassy=delivered,
  military_tribute=delivered`) while the census names only
  military_tribute as delivered (capstoneDelivered kind=military_tribute
  d140). Either the caps field collapses after any delivery or the other
  two delivered silently — a follow-up read, not this run's fix.

## Q2 — REGRESSION GUARDS: all GO/HOLD (exit 0)

- Spoken-raise (r134 fix): 6 talks — 5 properly answered, 1
  not-offered-unspoken (correct hold), 0 not-offered-spoken. GO. The
  strongest raise talk in the band is Wolfgang 135204 d125 (see Q4).
- Vetbar: 0 disagreements on all 4 seeds. GO. (One phantom day: 135203
  d140 shadow4=3 vs r4=1 — a same-day death boundary artifact; readiness
  and ladder agree at 1. See §Analyzer notes.)
- Trap-line: SILENT — 0 mime sittings in driver transcripts this band
  (nothing to regress-check; 21 mimes in the say-capture, all daily-play).
- Betrayal sibling: 3 turn-0 offers, all with the invite label in the
  opening THEM lines. HOLD.
- Lived-days HOLD; lesser 4/4 HOLD.

## Q3 — DAILY-PLAY MIME (read-only, carried)

Daily-play mimes 21 (capture 21 minus 0 driver sittings with mimes);
daily-play accepts proven 0 (walk-line lower bound; 0 off-day events in
the betray watch). The gap stands: the shared chooser never takes
`betrayal:accept` / `nv:accept` in daily play. Baraka re-check: one
comm-'none' villager in the band — **Herve** (French-only dentist,
135203, trust 92), whose driver sitting (d120-nv) showed no mime, just
the nod loop (see Q4). Lane decision still owed: teach the shared
chooser to take betrayal:accept + nv:accept when offered, or keep proving
fixes only where the driver looks.

## Q4 — PEOPLE CHECK: PASS (all transcripts + all 6 raise talks read in full)

- **Wolfgang 135204 d125** (raise talk, hotel housekeeper, trust 90):
  "Did you leave someone behind? ...Sorry. You don't have to answer
  that." — "Yes." — "Yeah." A long quiet. "Me too." — loss, then the
  raise, answered. The strongest exchange in the band.
- **Wolfgang 135204 d90** (curious): first-memory exchange — "Mine's
  Columbus, Ohio, I think — heat on pavement, someone's hand huge around
  mine. Or I invented it." Real, specific, voice fits stoic.
- **Gisele 135202 d90** (crossing guard, withdrawn, grief thread,
  warn_you): she warns, the player heeds, she needs a minute. Coherent;
  the "I'll be careful" heed line is offered twice in a row (same choice
  twice — mild repetition, each a distinct pick).
- **Morris 135203 d90** (police officer, trust 100, ask_favor stage 2):
  food philosophy — "Food's the first promise a group makes to itself:
  we won't let each other starve." Coherent, but the favor itself is
  never asked.
- **Thien 135203 d120** (farmer, secret thread): opens with a real
  confession ("Before the scattering, I froze when it mattered"), the
  player walks away, the close lands ("We're done here. For now."). A
  declined confidence, played straight.
- **Herve 135203 d120-nv** (French-only): **the nod loop persists** —
  five consecutive `nv:nod` exchanges, each answered with a French
  agreement line, no mime, no progression. Ends gracefully ("They glance
  toward their own thoughts; the exchange is winding down" + palms-pressed
  close), but five identical nods is a filler loop. Carried observation,
  not a new defect.
- **Raise talks:** Milo d16, Gertrude d17, Wanjiru d12, Adaeze d12, Diana
  d120 (not-offered-unspoken, correct hold), Wolfgang d125 — all clean.
  Closers are formulaic ("Sure. I'll be around." ×4, "All right — let's
  ask them." echo ×5) but sensible.
- **New surfaces (r130 injured question, r195-social favor spend-out):
  NOT exercised in this band** — no injured-question answer and no
  spend-out line appears in any capture; the "injur" hits are ability
  learnings (Scarecrow, Reading Tracks). No verdict from this panel; the
  landings' own proofs cover them.
- **ask_favor pattern (observation):** both stage-2 ask_favor sittings
  this band (Morris d90, Wolfgang d120) stage a philosophy/place talk
  and never surface the favor. The endings plant/owe ("See you at the
  fire", "Good talking. We'll figure it out"), so they pass the bar as
  plants — but 2/2 with the want never voiced is a pattern worth naming.
- Senseless 0 for the raise-answer class.

## Q5 — CENSUS (plain words)

- **135201 — ended d82, nobody left.** They knew Emberhold (link raised
  and answered d16) and priced the lesser seat d38. The scholar killed 1
  wave-4 beast. Thirteen of eighteen deaths were "the wild".
- **135202 — ended d97, nobody left.** They knew Stonebridge (link
  answered d17) and priced the lesser seat d47. Twelve of eighteen deaths
  were "the wild".
- **135203 — alive d141, four of four.** They knew Stonebridge and
  Emberhold (tribute arriving from both, 713–1,688 kcal a time), priced
  the lesser seat d34, delivered a military tribute on the final day, and
  buried one scholar mid-run (the successor delivered). Ten of fifteen
  deaths were "the wild". What they lack: seasoned links — one active
  subordinate at trust 26.
- **135204 — alive d140, four of four.** They held three subordinates and
  fought the most (95 fights, 72 wave-4), priced the lesser seat late
  (d107), and ended with viewership 34 — above the global bar of 32 —
  but no polity, so no Watchers. What they lack: trust held above 40 —
  the oldest link decayed from 54 to 35.

## The blank filled: none in game code — instrument label + one display observation

- **Driver label (fixed at pilot, before the panel):** the r195 clone
  printed `===== R195 SUMMARY =====` in the pilot stdout. One-line fix
  (commit 8c7b802f1); corpus files were unaffected, no re-run needed.
- **Ladder-line caps display (observation, not built):** the d140 line on
  135203 prints all three caps as `delivered` while the census names only
  military_tribute. Follow-up read owed; the census JSON is authoritative
  (1 delivery) and the analyzer reads the census, not the line.
- No src/js change this run: no game defect was found with a narrow fix.
  The nod loop, the ask_favor-never-voiced pattern, and the formulaic
  raise closers are carried observations, not defects under the bar.

## Analyzer notes

- The r195 instrument ran clean on the r196 corpus — no analyzer fix
  was needed. The proof test (29/29) covers the re-based lived-days
  control: the base corpus totals 471 lived-days (+20.2% vs the new 392
  control, still HOLD), and case (6) still breaches at 160 total.
- **Phantom day 135203 d140:** roster 5→4 (a death on the final day),
  r4 3→1 and l3 3→1 (readiness and ladder agree), shadow4 stays 3. The
  shadow is the would-be counter; it lags the same-day death by one tick.
  Guard is disagreements only (0) — not a defect, recorded here.
- **Trap-line SILENT, not GO:** 0 mime sittings in driver transcripts
  means the guard had nothing to check this band. The r134 fix is not
  re-proven by r196; it stands on r195's Boris sitting.

## Telemetry check: QUIET — no LOUD lines, baseline NOT rolled

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale.json
--current '.../journey-scale-r196-trust-*.json' --metrics
fightsTotal,fightsByWave.4,maxGameDay` → quiet (4 files, 3 metrics).
Verified the sums by hand: fightsTotal 215 (-51.8% vs 446), w4 155
(-46.4% vs 289), maxGameDay 460 (-28.8% vs 646) — all under the tool's
60% LOUD bar, so quiet is correct. The direction matches r195's finding
(fights down; collapse + flee-behavior + band noise) but less extreme
this band because two seeds lived to d140. Baseline NOT rolled — the
re-base on a larger panel is still owed, not this run.

## Metric review

- Q1: the interesting-finding rule held as written (0/4 national + named
  per-seed blockers = informative). The 135204 shape (3 active, 0
  seasoned) is a new blocker flavor the analyzer names correctly.
- Q2: the guards held as written. The lived-days re-base (r134 471 →
  r195 392) held — 460 lands inside 294–490, and the proof's base corpus
  still passes under the new control. The re-base itself was recorded in
  the prereg before the panel ran.
- Q3/Q4/Q5: as written. The trap guard's SILENT reading is a coverage
  note, not a panel property — the guard needs a mime sitting to speak.
- Telemetry: see above — quiet under the 60% bar; the fightsTotal
  baseline re-base stays owed.

## Verdicts

- **Reachable: YES.** Regional 4/4, ladder stage 3 on points 4/4, lesser
  seat priced 4/4, raise answers work, a military tribute delivered.
- **Fun: YES.** Conversations read as people (Wolfgang d125, Morris's
  food philosophy, Thien's confession); the scale climb is visible —
  links form, tribute arrives, the lesser seat prices, and one village
  held three subordinates even as trust slipped away.
- **Winnable: NO (this leg).** 0/4 national, 0/4 full seat, 2/4 villages
  end before d100; the binding constraint is now trust held above 40
  for a season, and on the living villages, seasoning — not acquisition.

## Gate / landing

- Proof test `test-journey-scale-r196-analyzer-20261114.js`: 29/29 green
  (re-run after the lived-days re-base; green before the panel ran).
- `check.js --quick`: **335 passed, 5 failed in 662s — GO after
  adjudication (0 attributable; log
  `evidence/2026-11-14/journey-scale-r196-gate.log`).** The 5 failures:
  measurement-proof-update + measurement-workflow (staleness pair —
  "Proof source inputs are not current", proof refresh round 14 owed;
  same failure as r189/r195 on master), phone-frame-proof (3/3 stale
  receipt, same as r189/r195), living-garden + one-person-army (120s load
  timeouts in the gate, exit 0 standalone — 76s / 58s). This run changed
  no `src/js` (scripts + evidence only).
- Commits on branch `journey-scale`: 02cdaa368 (prereg + instruments),
  8c7b802f1 (R195 SUMMARY label fix), [run-note commit]. Safe-commit
  index clobber struck both commits (repaired via ls-tree pipe,
  verified: status empty, diff HEAD empty, hashes match).
- Merge/release/rotation: [TO FILL at closeout.]

## Carried (not this run's to build)

Daily-play chooser never takes invites — lane decision owed; tribute
ready-but-undelivered is now 1/11 delivered (r195's 0/7 echo broken);
belong-good-but-realm-less (no belong-good seed this band); wave-5 door
never opened on any seed (0 wave-5 fights); nod loop 5× (Herve d120);
ask_favor stage 2 never surfaces the favor (2/2 this band); "I'll be
careful" heed line twice (Gisele d90); raise-talk closers formulaic;
ladder-line caps display (all three read delivered after one delivery);
telemetry fightsTotal baseline re-base (next run); culpritbisect
narrowed 4b/5b (tracker blanks — bisect steps, not a journey leg); proof
refresh round 14 (owed).
