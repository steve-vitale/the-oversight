# journey-scale r55 — Lane A, leg 3 SCALE (2026-10-29)

**Run id:** oversight-playtest-loop-20261029T2045Z (scheduled 20:45 CDT).
Rotation read 3 → leg 3 SCALE; write 3→0 done at run start.
**Base:** master@d6723d3f3 at worktree creation.
**Pre-register:** evidence/2026-10-29/journey-scale-r55-prereg.md (written before
any seed ran). **Zero src/js changed by this run** — measurement only, plus
one driver script (r55 driver = r54 driver, labels/EVIDIR only, plus the
EVIDIR env override, the PELLET_DECLINE wrapper, and seed-end fusion/ability
reads), one analyzer, and evidence.
**Gating freeze honored; TACKLE ALL not claimed; perception law honored**
(no list-fed work; driver reads only engine-exposed state, as before).
**No lock contention:** no playtest-loop.lock existed at run start; this
run created it and deletes it at closeout.

## Infrastructure notes (loud, first)
- **Probe-overwrite lesson applied, not repeated.** The r55 driver takes
  EVIDIR from the environment; the nopellet arm ran in
  evidence/2026-10-29/journey-scale-r55-nopellet/, never in the quad dir.
  No file moves, no re-runs to repair overwrites.
- **Determinism re-verified on the new base.** Control 85001 was run
  twice; the second capture is BYTE-IDENTICAL to the first. The r55-vs-r54
  divergence below is base-driven, not flaky.
- **Heartbeat:** loop (10-min cadence, log at
  `hidden_files/journey-scale-r55-heartbeat.log`) plus manual heartbeats
  at major steps; registry heartbeat never went stale (last manual
  heartbeat verified landed before check-quick started).
- Driver stdout for each arm went to goal hidden_files logs, not the
  terminal (r50/r51 noise lesson, kept).
- Base drift r54→r55 in src/js is REAL logic, not narration (11 files,
  +383/−68: gaps2-knower per-knower villageLore ledger + peer knowledge
  gate, Lane B social r67 party-name/role picks, raidguard removal,
  shoutrec, joinendlines, hierarchy/party-formal rework, version bumps).
  r54's parity expectation therefore had a live chance to fail — and did.

## Verdicts (binding questions, answered)

### 1. QUAD-CURRENT-R55: DIVERGED — every seed moves, from the first days
Same 4 seeds, control picker, policy scalecourt-nogate UNCHANGED, DAYCAP 180:
- 85001: day 144, died out (pop 2/2), GLOBAL (nationalDay 121,
  globalDay 122, firstCourt 102), lesser seat, arc 4, deaths 41,
  covenant trusts 38/37/30, maxWave 4, pilgrimages 4.
  r54: day 138, regional, national NONE, global NONE, lesser, arc 4,
  deaths 46, cov 15/19/17, pilgrimages 6.
- 85002: day 181, ALIVE 2/2, GLOBAL (nationalDay 104, globalDay 105,
  firstCourt 103), lesser seat, arc 4, deaths 51, cov 72/83/66,
  maxWave 4, pilgrimages 10.
  r54: day 178, scattered, regional, NO seat, arc 3, deaths 36,
  cov 33/26/26.
- 85003: day 88, died out (pop 5/5), regional, lesser seat, arc 4,
  deaths 39, covenant trusts NONE recorded, maxWave 4, pilgrimages 5,
  fusion NOT installed (died before any pellet offer landed).
  r54: day 161, died out (pop 2/2), regional, lesser, arc 4,
  deaths 45, cov 18/19/22, pilgrimages 11.
- 85004: day 181, ALIVE 4/4, pantry 700, REGIONAL, lesser seat, arc 4,
  deaths 48, cov 12/28/30, maxWave 4, pilgrimages 14.
  r54: day 181, ALIVE 7/7, pantry 25,536, NATIONAL day 179, lesser,
  arc 4, deaths 46, cov 51/51/50.
- Descriptive quad count, changed from r54: global-final-rank 2/4
  (85001, 85002), national-final-rank 0/4 by closing rank (85001/85002
  passed nationalDay on the way to global), full seat 0/4, lesser
  seat waiting on 4/4 (85002's no-seat fate is gone). No causal claim
  is made or changed.
- **First-divergence audit (per the prereg's fixed rule):** the 85001
  capture diff vs r54 diverges at line ~56 — inside the first days,
  in landing-phase NPC behavior (who fetches water, water amounts
  +4 vs +3, which plant is identified first, fireside chatter). The
  scale systems did not diverge first; the whole run did. Attribution
  to the knower gate specifically is NOT made: hierarchy, party-formal,
  villageAgency and the other landings all touch early behavior, and
  this run's instrument cannot separate them. The open instrument
  question for a later run is a pinned-base bisection (knower gate
  alone vs the rest of the range), not a guess here.

### 2. PELLET-DECLINE-R55: MIXED — the wrapper works, the restoration is not shown
Same 4 seeds, same policy, same DAYCAP, PELLET_DECLINE=1, separate EVIDIR.
Wrapper verified: fusionInstalled=false on ALL 4 nopellet seeds
(control: true on 85001/85002/85004, false on 85003 which died d88).
Known arm property observed as stated: nopellet abilities include
repeats (85002 green_thumb twice, 85004 survivor three times) — the
pending fusion offer blocks later offers, and the takes that do happen
can repeat an ability. Flagged as an observation, not a bug verdict;
the duplicate-grant path is a separate audit.
- 85001: day 134, died out (pop 0/0), regional at close BUT nationalDay
  114 and globalDay 123 both set (climbed, then collapsed), lesser
  seat, arc 4, deaths 37, cov 36/36/35, pilgrimages 4. Table voicing:
  lesser waiting + species agency, NO no-hunger price line — the same
  voicing class as its control (which also had no no-hunger line).
  Declining changed nothing in the table voicing on this seed.
- 85002: day 180, ALIVE 6/6, pantry 38,797, regional, lesser, arc 4,
  deaths 50, cov 83/26/21, pilgrimages 27 (control: day 181 alive 2/2,
  pantry 0, GLOBAL, deaths 51, cov 72/83/66, pilgrimages 10). The
  village is fatter and more populous — but the arms stop being
  matched worlds at the pellet offer (different ability takes change
  later RNG draws), so this is an arm difference, not a clean pellet
  effect.
- 85003: day 150, died out (pop 1/1), regional, lesser, arc 4,
  deaths 46, cov 11/16/16, pilgrimages 8 (control: day 88). Lived
  longer; same seat class.
- 85004: day 181, ALIVE 2/2, regional, NO seat, arc 3, deaths 39,
  cov 5, pilgrimages 13 (control: day 181 alive 4/4, regional, lesser,
  arc 4). Table voicing names a DIFFERENT missing piece: "The ledger
  still wants: the food-thesis deeds." Without the pellet, the table
  prices food deeds as undone — it does not hand them over.
- Per the prereg's fixed rule, PELLET-RESTORES-HUNGER does NOT fire:
  no nopellet seed shows a feast-deed line class its control lacks
  (FEASTED lines exist on all 8 runs: control 112/174/74/127,
  nopellet 133/259/144/125). And PELLET-IRRELEVANT does not fire
  either (85004's ledger want and seat class move). Verdict is MIXED
  per seed, no panel-wide claim. The one clean comparison in the set:
  the NO-HUNGER price line appears exactly once in 8 runs, on control
  85002 (the only pellet-installed run that reaches pricing with the
  pellet humming); its nopellet counterpart never reaches global, so
  restoration of feast deeds by declining is NOT demonstrated — the
  paired seed for that price does not exist in this quad.

### 3. PEOPLE CHECK (sense law — all 6 control transcripts read fully)
Quad produced 6 talks (85003 died day 88, before the day-90/120 talks):
- 85001 d120 Adaeze — favor asked, committed, thanked. Real, small,
  complete.
- 85001 d90 Irving — goal-thread opening + betrayal invitation; the
  NPC accepts, then backs out ("Maybe not today. The fire's got me"),
  then grief talk that PLANTS a lead ("If I ever get a real lead I'm
  gone that same day"). Coherent and complete as a talk — but the
  seeded ask_favor want (stage 2, fromSeed, planted d89) NEVER surfaces:
  turn-0 choices are betrayal/leave/silence only, stage stays 2 at
  pre-close, no alive:want item. This extends r54's OPENING-ONLY
  finding from stage-0 wants to a stage-2 seed: a competing
  goal-thread opening can displace even an established seed, and the
  talk still works only because the betrayal/grief content carries it.
  Named as the r55 dialogue observation, not a bug report.
- 85002 d120 Jian — first-memory question answered, field teaching
  (Murumuru), a PLANTED place (cellar full of jars, "I'll show you on
  the map sometime"), goon consequence (friendliness thins). Real,
  complete.
- 85002 d90 Jian — pantry-run re-ask via the seed ("hate to ask
  twice"), committed with place and time (east treeline, before the
  dew dries, two packs). Real — the seed loop doing its job.
- 85004 d120 Boris — Polish-only mime invitation, nods only, honest
  about its barrier (same family as r54's Joaquim) — but the nod loop
  repeats five near-identical exchanges without progression: the
  invitation never resolves to going or not going inside the talk.
  Texture note, picker-amplified, not fabricated history.
- 85004 d90 Neomar — spare-something ask, committed, thanked ("I
  won't forget who fed me when it mattered"). Real, small.
Verdict: 5/6 fully real (Irving coherent-but-displaced), 1
honest-barrier with a nod loop (Boris). No fabricated shared history,
no static menus.

### 4. TABLE-APPROACH (standing, report-only)
Control: 85001 lesser waiting + species agency (global reached, lesser
waits); 85002 lesser waiting + the pellet price voiced back hard
("NO HUNGER ON THE RECORD — THE PELLET HUMS WHERE THE FIRE SHOULD
BE") + priced wait (wave-3 monsters faced); 85003 lesser waiting
(arc 4, died d88); 85004 lesser waiting. No seat-taker choice voiced
in-window; no full-seat offer; full seat unwon (w5 0), as ever.
Nopellet: 85001 lesser waiting; 85002 lesser waiting (arc 4, no price
line); 85003 lesser waiting; 85004 NO seat, arc 3, ledger wants the
food-thesis deeds.

### 5. BARRIER PIN (standing instrument — re-open condition MET, guard holds)
Control: sayOncePerFight calls 85001 zero, 85002 two, 85003 zero,
85004 two — ALL the sleep "Not in the middle of a fight." family.
ZERO barrier lines on the control arm; the r52 pin stays closed there.
Nopellet 85003 d126 logs the barrier call itself: "Not mid-fight —
the barrier is the way out." from travelTo (game.js via party.js,
called from favor-company.js forageTripSeedFirst), and the line IS in
that run's capture (line 12732, once — first-per-fight dedup). Per
r52's fixed rule ("do not re-open it without a run that logs a barrier
call"), the pin's re-open condition is now met — and the answer on
re-opening is that the guard WORKS: a mid-fight travel attempt via a
favor-company trip path (outside the policy walk helpers' !tbfight
guards) was refused with the barrier narration. No guard is broken,
no narration is missing. The pin's new form: attempts exist on paths
the policy does not guard; the engine guard catches them.

## Village assessment (plain words)
- **85001 — the village that climbed, then collapsed.** Day 144, died
  out with two people left, but it had reached GLOBAL (day 122) first,
  lesser seat waiting at arc 4, 41 deaths. On the old base it died at
  day 138 without ever leaving regional. Same seed, different world.
- **85002 — the village that made it to the world stage and waited.**
  Day 181, two people alive, GLOBAL since day 105, lesser seat
  waiting, arc 4, 51 deaths, covenants at 72/83/66 — the strongest
  covenants in the quad. On the old base it scattered at day 178 with
  no seat at all. Its table price is the pellet it swallowed.
- **85003 — the village that died before the scale leg began.** Day 88,
  died out with five left, regional, lesser seat, arc 4, 39 deaths, no
  covenants recorded. On the old base it lasted to day 161. The early
  divergence cut this village's story short.
- **85004 — the village that fell back to regional.** Day 181, four
  alive, pantry 700, regional, lesser seat, arc 4, 48 deaths. On the
  old base it was national at day 179 with 25,536 kcal in the pantry.
  The climb is not a stable property of the seed across bases.

## FUN / REACHABLE / WINNABLE (scale leg, plain words)
- REACHABLE: yes, more so than r54 — the climb's machinery fires on
  all four control seeds (courts on 85001/85002, covenants, pilgrimages
  4–14, priced table voicing), and global is now reached on 2/4 seeds
  instead of 0/4. But reachability is base-unstable: the same seeds
  tell different stories after a logic-bearing base change, so no
  seed-level promise ("85004 goes national") survives contact with
  the next landing.
- FUN: mixed, same mix with two sharpenings. The table voicing is
  still the leg's best writing, and the seed loop still visibly
  remembers (Jian's pantry re-ask). New texture: a stage-2 seeded want
  can lose its talk to a competing opening (Irving), and the nonverbal
  nod loop spins without resolving (Boris). Neither breaks the talk;
  both thin it.
- WINNABLE: not shown, again. The lesser seat waits on 4/4 control
  seeds; the full seat stays unwon (w5 0). Declining the pellet does
  not open the full seat either — on 85004 it names food deeds as the
  missing piece without delivering them.

## Metric review
- Census scalars unchanged from r51's list (19 scalars + covenant
  trusts), plus the new fusion/ability columns (reads, not scores).
- r54's QUAD parity expectation is OVERTURNED by this run's fixed rule
  (any scalar difference → first-divergence audit; all four seeds
  differ, first divergence in the first days). This overturns the
  parity claim, not the method: the audit ran before any attribution,
  and no attribution to the knower gate is made without a bisection.
- r54's OPENING-ONLY is EXTENDED, not re-scored: Irving d90 shows a
  stage-2 fromSeed want displaced by a goal-thread opening. The
  stage-0 mechanism stands; the displacement class is now wider.
- r54's PHANTOM-RULE / NOT-RE-PICKED stands (not re-tested here).
- r52's barrier pin: re-open condition met on the nopellet arm
  (barrier call logged d126); verdict on re-opening is guard-holds,
  not guard-broken. The pin is not re-scored as a failure.
- Q2's verdict rules were applied as written: neither
  PELLET-RESTORES-HUNGER nor PELLET-IRRELEVANT fired as written, so
  the verdict is reported as MIXED per seed rather than stretched to
  fit a rule. No metric was re-scored mid-run.
- New observation, not a metric: duplicate ability grants in the
  nopellet arm (green_thumb ×2, survivor ×3) — needs its own audit
  before any claim.

## Telemetry deviation check (step 14 — NOT rolled, fifteenth confirmation)
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale.json
--current 'evidence/2026-10-29/journey-scale-r55/journey-scale-r55-trust-*.json'
--metrics markerCounts.firstCourt,markerCounts.watchers,tableTele,fightsTotal,fightsByWave.4,maxGameDay`
→ 5 LOUD lines, all "disappeared: baseline N → current 0 (n=4 files)" —
the same vacuous shape mismatch as r42–r54 (the journey trust JSONs do
not carry those fields at all). Verdict: NOT a real deviation. NOT rolled.

## Tests
- `node --check` clean on the r55 driver (at creation, and after the
  R55 SUMMARY label fix) and the r55 analyzer (at creation).
- `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
  (filled at closeout — see CHECK-QUICK section below.)
- Zero src/js changes, so no game-code regression surface exists in
  this run's change set; the suite below is the standing proof, not a
  response to a suspected regression.

## Landing (filled at closeout)
Master moved mid-run (d6723d3f3 → e19534e56: sim-joinendlines-a
fieldFights narration + sim-raidname-b1-b evidence, both landed by
sibling loops). Per body step 8 the branch was rebased onto the new
master before merging; proof re-run after rebase (node --check on
driver + analyzer, clean). Measured results above stay pinned to the
run base d6723d3f3 — the rebase changes no measured file's content.

## CHECK-QUICK (filled at closeout)
`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
**282 passed, 8 failed in 1995s** (290 scripts).
The 8 break down as 6 pre-existing assertion-failure scripts + 2
contention timeouts, ZERO attributable to this run — the SAME 8 scripts
r54 recorded:
- The 6 assertion scripts are the SAME families r54 recorded as
  pre-existing (measurement-proof-update, measurement-workflow,
  mobile-combat-cadence, occupation-panels, phone-frame-proof, and the
  establishment-r20 family — here as
  test-establishment-r20-fixes-20261020.js, "NEW: next day voices
  once more (gate resets daily): expected 2, got 1", identical to r54).
- The 2 timeouts (test-trust-observer-neutrality.js and
  test-capable-bot-20261014.js, both exit null at the 120s cap) were
  re-run SOLO after the suite: both PASS clean (trust 6/6, capable
  40/40, 0 failed). Contention artifacts, not regressions.
- No quick-list test imports this run's scripts (verified by grep),
  and this run's change set is driver + analyzer + evidence with ZERO
  src/js, so it cannot have caused any of the 8.
Verdict: zero regressions attributable to this run.
Worktree status after the suite: only this run's entries — no
suite-touched ontology or stray evidence writes.
