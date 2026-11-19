# journey-endgame r246 — run note (adoption of the timed-out Lane B run)

Adoption of the scheduled Lane B endgame run r246 (00:00 CST Nov 19, 2026),
which hit its 3600s budget before playing any seeds — the write flap blocked
its clone writes. Everything below verified from files/git by the adoption;
the timed-out run's word was taken for nothing. Worktree
`~/workspace/worktrees/journey2-endgame`, branch `journey2-endgame`, base
master `b76d65445` (ship bump). Prereg:
`evidence/2026-11-19/journey-endgame-r246-prereg.md`.

## Adoption recovery

- Orphan heartbeat: the dead run's hbloop (pid 3931) killed; adoption took
  over heartbeating until session end. Lock `playtest-loop-2.lock` run_id
  `2026-11-19T05:56:00Z-laneB-endgame-r246`.
- Clone-script bug found + fixed in the worktree: `scripts/clone-endgame-r246.py`
  `robust_write` compared file byte size to `len(content)` (character
  count); the probe has 348 non-ASCII bytes, so every write "failed" its
  check (154041 bytes vs 153810 chars) and retried 150x before raising.
  Fix: compare against `len(content.encode('utf-8'))`. The script's
  `--print-analyzer` fallback is broken by design — the probe
  `robust_write` runs first and blocks it. After the fix the clone ran
  in <2s. (Lesson for AGENTS.md: byte/char size checks fail on
  non-ASCII content.)
- Clones verified: probe `scripts/probe-endgame-r246-20261119.js`
  (154,041 bytes) + analyzer `scripts/analyze-endgame-r246-20261119.js`
  (106,632 bytes), both `node --check` clean. Diff vs r243 originals =
  renames only + PLAN band 89810–89817 + NOTICK/CARRY instrument (daily
  `vbrainLogs` scan + live-commit scan, persisted as `noTickDeferrals`
  + `trioCarry`).
- Smoke: seed 89706, 120d, village-lost d69 (same as r243 Pass A),
  instrument fields present, `instrumentErrors 0`. Smoke outputs moved
  to `evidence/2026-11-19/perseed-endgame-r246-smoke/`.
- Flap: two write-refusal windows overnight (23:55:32 CST Nov 18,
  00:21:44 CST Nov 19), cleared ~06:58Z; probe ALL-OK after stale
  `.lock` debris was cleared. No work lost.

## Headline: the matched band reproduces r243 exactly

Pass A, C and D on seeds 89701–89706 are bit-identical to r243 on every
comparable number — seats, seat days, kills per seed, M23b seeds/days,
M25c buy days, peakVet per seed, standing per seed, guard skips, death
cleanups, medicDutyBlocked. The two live substrate deltas under test —
(a) the new fight code, (b) the dawn-decision/drive-reading code — moved
nothing at all on the matched seeds. Only the fresh C-wide band differs,
as a fresh band should.

| pass | lesser | full | lost | won | kills | M23b | M25c bought | verdict |
|------|--------|------|------|-----|-------|------|-------------|---------|
| A    | 5/6    | 0/6  | 1/6 (89706 d69) | 5/6 | 6 | 0/6 | n/a (disabled) | PRIMARY GO \| ALL GO |
| C    | 5/6    | 1/6 (89702 d101) | 0/6 | 5/6 | 10 | 1/6 (89702@d86) | 6/6 | PRIMARY GO \| ALL GO |
| C-wide | 7/8  | 0/8  | 1/8 (89817 d48) | 7/8 | 3 | 0/8 | 6/8 | WIDE GO |
| D (FIGHTALLY2) | 5/6 | 1/6 (89705 d90) | 0/6 | 5/6 | 6 | 1/6 (89705@d73) | 6/6 | PRIMARY GO \| ALL GO |

Corpus purity 6/6 (A, C, D), 8/8 (C-wide). NOTICK deferrals 0 and
trioCarry 0 on ALL FOUR passes — the instrument records clean zeros;
the (a)/(b) gates stayed off as expected. This closes the r243
instrument gap: the first observation is that neither the deferral
nor the carry ever fires on this band.

## Pass A (control; competent policy, no capstone)

- 89701 sat lesser d119 (defer 29d, same as r243 — one day under the
  30-day LOUD line, total-deferral variant). 89702 sat d90, peak 462,
  peakVet 2, kills 5. 89703 sat d118. 89704 sat d105, peak 120.
  89705 sat d104, peak 199. 89706 village-lost d69.
- Guard-stall: none (longest same-reason run ~4d). F5 + C3d vacuous.
- PeakVet per seed 1,2,0,0,0,1 — sum 4, 5-seed sum 3. uw sum 21, won 5.

## Pass C (CAPSTONE + BUYOUT + BUYOUT_EARLY)

- **89702 took the full seat d101 again** (feast_embassy d86,
  firstFullSeatDay d87, standing 396, peakVet 2) — second consecutive
  round on this seed/day. M23b 1/6, same seed/day as r243.
- M25c 6/6 bought early, buy days identical to r243
  (d48/d18/d44/d39/d17/d25). 89705 standing 562, sat lesser d90.
- PeakVet sum 9 (2,2,1,1,2,1). Kills 10 (per seed 2,3,1,1,2,1).

## Pass C-wide (fresh band 89810–89817)

- Lesser 7/8, full 0/8, lost 1/8 (89817 village-lost d48).
  89810 sat lesser d91 (standing 199), 89811 d90 (145), 89812 d115
  (199), 89813 d90 (99), 89814 d93 (199), 89815 d108 (187),
  89816 d90 (199). No seed faced wave 5 (r243's band had 89795
  facing x2); uw 4 on six seeds, 3 on 89813/89817. M23b 0/8.
- M25c 6/8 bought (89810 d39, 89811 d39, 89812 d34, 89814 d44,
  89815 d58, 89816 d34); 89813 refused d90 and never bought; 89817
  never bought (lost d48).
- Kills 3 (one each on 89810/89814/89816; r243's band had all 3 on
  89795). Starvation 4 deaths (Andre Nelson d11 on 89815; Yerlan d34,
  Fiona d39, Abdelmalek d48 on 89817) — lighter than r243's 8 on 6/8
  seeds. 89817 is a starvation collapse: pantry empty 3 days, then
  the scattering (see people check).
- WIDE-VERDICT GO (M25c + purity). Full-bindings run is ALL NO-GO
  by construction on a wide pass, as designed.

## Pass D (FIGHTALLY2 — third sighting)

- **89705 took the full seat d90 again** — third identical
  reproduction (r243 Pass D and r246 Pass D agree on every number:
  gate ok d73, feast_embassy d73, firstFullSeatDay d74, standing 612,
  peakVet 3, faced wave 5 x2). M23b 1/6, same seed/day as r243.
- Kills 6 (per seed 1,4,0,3,0 on waves seeds; C 10, A 6). The r239
  uplift (D 13 kills, full 2/6) does NOT repeat for the second straight
  round. The slot stays env-gated OFF; no further sighting is owed
  unless a fix arm changes the fight engine.
- Longest fight: 57 turns (89706, ended vDie) — long, but not the
  159-turn Algorithm case; no recurrence.

## People check (full transcripts read)

Read in full: Pass C 89702 (1,097 lines, announce window), Pass D
89705 (55 lines), C-wide 89817 days 1–6 + tail (6,127-line file).
Panel-wide greps over all 27 transcripts (6 A + 6 C + 8 C-wide + 6 D
+ 1 smoke):

- DRY census: 0 ("lost my train of thought" nowhere). SYSTEM: "" 0.
  Parrot line ("All right — let's ask them") 0 — the link-accept
  voice fix holds. Want-bridge repeat line 0. F5 exact variant 0
  (vacuous, fifth straight endgame round). "recap" mentions 0 (C3d
  vacuous). fledBad firings 0 (the recorder never fired in the wild;
  itself untested). Door-tile fight ejects 0 (all closes are
  ref-change / day-boundary / day-end).
- Funeral-mend FIRED with voicing this round (first observation):
  Guizhen's feast on Pass C 89703, Terrence's on C-wide 89814,
  Rasha's on Pass A/smoke 89706 — "Trust mended — the -8 bought back
  with grain."
- 89702 (full seat): Ruth the Scout dies d101, the day the village
  sits — "Ruth is gone. The Scout — the role sits empty now, and
  nobody reaches for it. ... It carries Ruth in it, the way a bell
  keeps ringing." The village whispers "Ruth is dead. that stranger
  did it." The table notes the overtime: "1 of Haven lost meanwhile.
  Every door's standing −3." Two ascensions from one village —
  Samuel Grilo (relay) and Ruby Callaghan — "Nobody has ever seen
  that before." Samuel's arc lands: the Portuguese-only speaker from
  the early days learns the language and ascends. The beloved path
  ("Speak for the quiet ones") spends the love on the unfilmed
  villages and the dead. War path names real kills (Saiful put down
  Ugly-Eyes d58, The Loud Beast d46).
- 89705 (full seat): same script as r243, beat for beat — the grief
  ledger ("I HAVE NEVER BEEN WORTH ANYONE'S NOISE"), Hannusya's
  Big-Eyes d71, Ethan's Loud-Eyes d55, "Teach them freely."
- 89817 (village-lost d48): day 1 is all anonymous — nobody has a
  name, trust too low for everything; names arrive one by one.
  Miguel's arc in miniature: "Interesting. Nobody asked me." →
  "I want a say in how this village runs." → "Miguel stopped
  asking. They just started organizing the Fish crews. Nobody
  stopped them." Fiona proposes relief on d3 ("The sick can't wait
  us out... we need a plan, tonight") with real options; the moment
  passes d6. The medicine hole is voiced d3: "Nobody here knows
  doctoring, and Brian is burning up. The village has no healer —
  someone has to learn, or find one." The collapse is legible:
  pantry empty 3 days, Abdelmalek walks away hurt (7 HP) and dies
  alone — "The Codex turns a page on its own. Abdelmalek is dead.
  You didn't ask. It knew." — then "Haven couldn't hold. On the
  third hungry day, people started walking — in different
  directions. The scattering, again." Meanwhile the standings call
  Haven "1st of 6... The audience has a favorite" while it starves.
- One blank filled: Chloe's d6 counter line reads "Here's what we
  figured out about the creek went still, and your arm-hairs stood
  up." The monster is living_wire (electric eel); its unknown
  descriptor is a prose clause. Journey-crisis r192 fixed this class
  at the kill-composition site (monsterNoun guard) but the five
  counter-learned render sites still used raw monsterDisplayName.
  Fixed this run — see below.

## Fix landed: monsterCounterLabel (game.js)

- `monsterCounterLabel(mid)`: returns the display name everywhere
  except where the guarded `monsterNoun()` falls back to 'something'
  (clause heads / long-prose descriptors — 8 defs: living_wire,
  memory_projector, ducks_in_a_row, understudy, landlord, heckler,
  paparazzo, chorus_line). Swapped in at all five counter-learned
  render sites (taught line, discoverMonsterCounter, two observation
  channels, witness channel).
- Proof test `scripts/test-journey-endgame-r246-counter-label-20261119.js`:
  9/9 pass (was RED pre-fix: helper missing + clause in the rendered
  line). Rendered line now: "COUNTER LEARNED — something: Get OUT of
  the water. ..." Blast radius pinned by a whole-roster audit in the
  test: only those 8 labels change; every other monster renders
  byte-identical; a village-named monster keeps its name.
- Regression: r192 test `scripts/test-journey-crisis-r192-monsternoun-clause-20261113.js`
  3/3 pass.

## Metric review (watches)

- Guard-stall: none on any pass (Pass A longest same-reason run ~4d;
  C/C-wide/D have 0 NOTICK deferrals total, so no stall is possible).
  Total deferral 89701-A = 29d, one day under the 30-day LOUD line.
- companionGuardSkips: A 10, C 11, C-wide 1, D 15
  (r243 recomputed: A 10, C 11, C-wide 2, D 15 — C-wide differs by 1).
  deathCleanups: A 11, C 12, C-wide 9, D 11 (r243: 11, 12, 21, 11).
  medicDutyBlocked: A 225, C 147, C-wide 375, D 162 (r243: 225, 147,
  219, 162 — C-wide up sharply on the fresh band; the medic-duty
  block still dwarfs the companion guard, as the wall notes).
- M9-supply blocked arrivals: A 128, C 106, C-wide 127, D 125
  (judged against the code rule, not by count, per the analyzer).
- Prose nits (dialogue-pass items, not defects): "the the" 11x
  panel-wide (8x "the the pantry", 3x "the the creek"); "Ruth is
  dead. that stranger did it." and "the woman in her 30s spent the
  afternoon..." capitalization slips; "1 sticks now" pluralization.
  "The feast was the weapon" refrain fires 1,075x panel-wide (once
  per relic epitaph — by design, but the identical refrain is the
  loudest repeated line in the game).

## Telemetry baseline — peakVet RE-BASELINED

- uw/won (Pass A 5-seed sums): uw 21 vs 22, won 5 vs 4 — quiet,
  NOT rolled. r188 stands for uw/won.
- peakVet (Pass A 5-seed sum): 3 vs 8 — a LOUD line by the rule
  (|rel change| 0.625 ≥ 0.6), adjudicated explained: the drop from 8
  happened at or before r239; three consecutive observations now sit
  in the 3–4 band (r239: 4, r243: 3, r246: 3); kills still happen
  panel-wide (A 6, C 10, D 6 vKills, all identical to r243). Per the
  prereg's binding, the peakVet key is RE-BASELINED this run:
  **peakVet 8 → 3 (5-seed sum; per-seed mean 1.6 → 0.6)**. uw/won
  unchanged. No machine-readable endgame.json baseline file exists
  in the repo (searched: tracked files, likely paths) — the baseline
  lives as recorded sums in the run notes, so this note is the
  re-baseline record; future runs compare peakVet against 3.
- No other LOUD lines. C-wide peakVet sum 3 (r243 C-wide: 3).

## Gate

- `node scripts/check.js --quick`: **338 passed, 6 failed in 1098s, 0
  attributable to this run** (log
  `evidence/2026-11-19/journey-endgame-r246-checkquick2.log`). The 6:
  measurement-proof staleness pair
  (test-measurement-proof-update.js, test-measurement-workflow.js),
  stale phone-frame receipt (test-phone-frame-proof.js), 3x 120s
  timeouts (test-living-garden-deed-attainment.js,
  test-one-person-army-deed-attainment.js,
  test-capable-bot-20261014.js). All six are the standing set — the
  deepening-r243 gate on master minutes earlier, without this run's
  change, reported the identical 338/6 tally. The proof test for the
  counter-label fix passes standalone (9/9); the r192 regression
  passes (3/3).
- First gate attempt died with the machine: a VM restart at ~08:11Z
  killed check.js at 97/344 scripts (partial log
  `journey-endgame-r246-checkquick.log` kept as the record). Heartbeat
  was re-established immediately after the reboot (hbloop pid 2128)
  and writes re-probed OK before the re-run.

## Open / held

- FIGHTALLY2 stays env-gated OFF (third sighting confirms r243's
  level result, not r239's uplift).
- The deed gate after national remains the binding wall: M23b 0/6
  (A), 1/6 (C, D), 0/8 (C-wide). Full seats continue to arrive only
  via the early buy-out road.
- Medicine supply hole re-confirmed in the wild (89817 d3, no healer,
  sickness spreading) — the richer layered design is still owed.
- Prose nits above are dialogue-pass items, not adoption fixes.
- No win price or deed gate changed.

## Verdicts

- Reachable: YES — full seats on the matched band 2/3 passes
  (C 89702 d101, D 89705 d90), same as r243.
- Fun: YES, with the usual caveat — the people check shows real
  arcs (Miguel seizing the crews, Samuel's ascent, Ruth's mourned
  death, a legible starvation collapse) alongside the repeated
  refrains and the "the the" typo.
- Winnable: YES on the matched band via the early buy-out road;
  the fresh band still never reaches the full seat (0/8) and never
  faces wave 5 — the deed-gate wall stands.
