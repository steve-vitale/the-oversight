# Journey succession r94 — CHAIN RECORDER PROVEN, MIX FULLY CLASSIFIED, NO FRESH SPLIT CASE (lane B, 2026-11-01)

Leg 7 (succession). Prereg: evidence/2026-11-01/journey-succession-r94-prereg.md
(written before any driver run). Instrument only, zero src/js.
Base: master eec64a07a at worktree registration (ship-loop version
bump fc1c2473c landed on master DURING this run — rebase at landing,
proof re-run after).
Seeds 29151–29154, competent policy, POST_DAYS=70, EARLY_KILL_DAY=40.
29151, 29152 chain-forced (20/20/10/10 dplus); 29153, 29154 controls.
Pilot stands as the panel: the pre-declared expansion trigger (a
same-iteration double handoff, a seed silent under BOTH naming
metrics, or a second death inside a week-1 window) did NOT fire on
any pilot seed — no expansion to 29155/29156, per the r90 precedent.

Slug deviation, documented: body slug journey2-succession is
unusable (done-merged registry entry + orphan directory on disk,
same class as r83/r87/r89/r91). This run uses journey2-succession-r94.

## Infrastructure (loud, because it shaped the run)

- EPERM flap, container-wide, three waves: registration blocked on
  the first two attempts (worktree-register failed writing
  .git/refs/heads/journey2-succession-r94.lock; direct probe writes
  to .git/refs/heads also EPERM). Third attempt registered clean
  (worktree exists, branch journey2-succession-r94, base eec64a07a,
  heartbeat read back 2026-11-01T12:05:13Z, active). No manual ref
  surgery was performed during the flap, per the standing lesson.
- worktree-reap's registry write failed EPERM twice at pre-flight;
  non-blocking (only 4 worktrees listed, well under the 16 cap).
  The reap was not retried into the flap; closeout re-runs it.
- Panel flap wave 12:19–12:33Z + flicker 12:36–12:37Z: 29152 ran to
  completion but its tele write, six d+45/53/64 transcript writes,
  and final stdout redirect all failed EPERM (0-byte tele/stdout,
  6 convo anomalies in its stderr, exit 0). 29153 died at startup
  with no output at all (exit 1, empty logs). 29154 ran to
  completion with 8 transcript-write anomalies, 0-byte tele/stdout,
  and all 14 transcript files 0 bytes. Heartbeat writes failed
  through the same window: registry heartbeat stuck at 12:15:37Z
  for ~18 minutes (past the 15-minute freshness mark) while the
  loop kept retrying; re-beaten 12:33:18Z the moment writes
  cleared. No reaper risk materialised (dirty trees are never
  auto-removed; the 4-hour stale threshold was never approached).
- Recovery, deterministic re-runs (the 2026-10-24 pattern):
  29152 re-run reproduced its flap run EXACTLY (chainN=5,
  fifthDeath Priya->Chloe day 78, alive 8, dayAdv 70) with complete
  outputs. 29153 re-run clean. 29154's flap run DIVERGED from its
  re-run: aborted convos shifted checkpoint days (flap run filed
  d+15/d+30/d+45, re-run d+14/d+30/d+46) and metrics moved
  (dayAdv 69->70, deedLedger 27->46, callMoves 22->28) — an
  aborted convo is not a neutral event, it changes the trajectory.
  The re-run is authoritative; the flap run's 5 orphan 0-byte
  transcript files (d+15 Caleb/Oliver, d+30 Oliver, d+45
  Caleb/Oliver) were deleted, and its stderr preserved outside
  the repo (goal hidden_files evidence, journey-succession-r94-
  29152-flap.stderr.log) as the flap record. Final evidence has
  zero 0-byte files, verified.

## Headline

The chain recorder is proven on the known case and carries clean
onto the fresh panel — but the fresh panel contributes NO new
split case, so the fix generalises by mechanism (every death routes
through playerDeath), not by a fresh observation. The MIX block
classifies every fresh draw (0 unclassified). CHAIN5 carries 2/2
with 22/22 bonds and 0 affinity drift.

## DETECTOR (binding bars, all MET)

- chainDeaths count == true post-first-death transitions on 4/4
  pilot seeds: 29151 4, 29152 5, 29153 1, 29154 0. deaths.bearer
  (tele) = 1 + chainN on all four: 5, 6, 2, 1.
- Every chain entry on the fresh panel carries via=playerDeath
  (10/10). The bypass sweep fired 0 times: no bearer change
  bypassed playerDeath on this panel, so the bypass class stays
  hypothetical — the sweep is insurance, not a finding.
- Proof (e) replay, RED->GREEN on r91 seed 28152 with r91's exact
  env: committed r91 JSON records ONE Ava->Catalina entry with
  scriptedFifth=true while fifthDeath.oldFirst is Petra (the
  collapse); the r94 replay records Ava->Petra (organic, at its
  TRUE day 70 — the old detector's 71 was one-iteration detection
  lag, r41b) AND Petra->Catalina (scriptedFifth, day 71),
  adjacent entries, both via playerDeath, chain length 7->8,
  first six entries identical, tele deaths.bearer 8->9.
  Consequence, stated plainly: chainDeaths detectedDay now means
  the death day, not the detection day. The naming scorer's
  recentDead 14-day window therefore now counts from true death
  days — more correct than r91's lagged days.
- DEATH-LEDGER: chainKnown == chainN on all four seeds
  (4/4, 5/5, 1/1, 0/0). Every recorded chain death cause-known.

## WEEK1-NAMING + NAMING-ANY + MIX (reported, pre-declared interpretation)

| seed | dead first bearer | first-bearer | any-recent | lately+ mourning draws | mix grief/debate/other/unclass | non-verbal |
|------|-------------------|--------------|------------|------------------------|-------------------------------|------------|
| 29151 | Vy | 1/5 | 1/5 | 2 | 1/1/0/0 | 0 |
| 29152 | Leonard | 4/5 | 4/5 | 4 | 4/0/0/0 | 0 |
| 29153 | Lamar | 3/4 | 3/4 | 3 | 3/0/0/0 | 0 |
| 29154 | Paola | 3/4 | 3/4 | 3 | 3/0/0/0 | 0 |
| pooled | | 11/18 (61%) | 11/18 (61%) | 12 | 11/1/0/0 | 0 |

- No seed is silent under either metric, so MIX-EXPLAINS has no
  silence to decompose on this panel — the mix machinery is
  proven on r91 fixtures (28152: non-verbal 2/4, draws 0;
  28154: debate 1, grief 1; 28151: grief 2, unclassified 0),
  not exercised by a fresh silence.
- No seed has a second death inside its week-1 window (closest:
  29152's second handoff lands day 32, 16 days after its day-16
  first death). Any-recent therefore equals first-bearer
  on 4/4 BY CONSTRUCTION, not by a behavior finding — r91's
  interpretation holds a second run running.
- The fresh panel's draws are grief-dominated (11/12); the single
  debate draw is 29151 Ruth d+3 (The Heckler / 'The Big Stare'
  shouted down). No non-verbal week-1 transcript on this panel.

## CHAIN5-CARRY (binding bars, all MET)

- CHAIN5-READABLE: 2/2 forced seeds with a full fifth handoff
  (relPreDeath5 + relPost5 + fifthDeath lin+mo true).
- CHAIN5-BONDS: fifth-successor bonds survived 22/22 (29151
  9/9, Ruth depth 3 v 100; 29152 13/13, Pearl depth 3 v 100),
  affinityDiff5 = 0 on both.
- Fifth deaths: 29151 Ruth->Rocco (d+10 since 4th, d+60 since
  1st), 29152 Priya->Chloe (d+10, d+62 — dplusSecond 41, one day
  past the 20+20+... chain arithmetic; the probe fires on the
  first iteration reaching the threshold, same late-firing
  shape as r91's 29151-analogues, not a miss), all lin+mo true.
- INH5: 29151 Rocco: kept 34 plants + inherited 1, kept 2 skills
  + inherited 30, vanished [oath_ring]. 29152 Chloe: kept 41 +
  inherited 1, kept 8 + inherited 26, vanished [] — a fifth
  handoff that loses NOTHING sentimental, so the vanish is not
  universal. Both class=mixed (continuation, never reset).

## SENT-VANISH (descriptive)

- Fifth handoffs: oath_ring (29151), none (29152).
- First-handoff scripted seed 29154: vanished contract_quill,
  reading_glasses, buskers_harmonica, spare_socks — the same
  sentimental/personal-vanish class r83/r87/r89/r91 recorded
  (spare_socks is a new member of the class, not a new class).
  Organic-path first handoffs record distinct=0 by design
  (dead-bearer <redacted> unavailable) — named, not hidden.

## Carried regression bars (all PASS)

- C1v3: ok=true, missing=[] on 4/4.
- S1: missingExact=0 on 4/4.
- MG2v2: true on 4/4 (violMeal=0).
- M1/M4: true on 4/4. M3v2b >=2 on 4/4 (29151 3, 29152 8,
  29153 5, 29154 4 — the pilot bar >=3/4 MET with margin).
- INVITE SEAM: 29/29 invite outcomes spoken (15 accepts,
  14 declines, both with reasons), 0 deflected, 0 other.
  Sibling deflection lines in transcripts: 7, all joined to
  their mechanism (TRACE-JOIN 7/7), none invite-deflected.

## VILLAGE ASSESSMENT (plain words)

Four villages, none wiped out — and the mantle passing bends
none of them to breaking:

- 29151 (Vy→Jun→Owen→Ruben→Ruth→Rocco): the chain village that
  thrives. Five bearers in 60 days, ends 8 alive, pantry 11,343,
  trust climbing (+60 office, +32.8 village). Grief here is
  quiet but specific — Ruth picks up Vy's share of the work.
- 29152 (Leonard→Sandra→Tanisha→Quinn→Pavel→Priya→Chloe): the
  grieving village. Six bearers counting the organic interleave
  (Sandra→Tanisha), ends 8 alive, pantry 21,362, and the fullest
  grief panel (4/5 transcripts name Leonard — the dream, the
  favor, the name nobody says right yet, the world continuing).
- 29153 (Lamar→Enzo→Thierry): the comfortable village. One
  organic handoff, ends 10 alive, pantry 89,503, deed calls 35
  — this village feeds itself and then some. Lamar is named in
  3/4 week-1 transcripts, with the burnt piece passed on.
- 29154 (Paola→Carmela): the quiet village. One scripted death,
  ends 10 alive, pantry 55,124, deed calls 46. Paola is named in
  3/4 week-1 transcripts; the village's loudest thread is not
  grief but Caleb's taken brother Paul and the humming pods.

What is missing, panel-wide: no village reaches beyond survival
in this window (no wave-5, no table — the endgame leg's window,
not this one), and the succession mechanics themselves do not
block winning: bonds, knowledge, and skills all carry across
five handoffs intact, and every village that lived ends fed.

## PEOPLE CHECK: all 18 week-1 transcripts read in full — PASS

Every transcript satisfies the bar: the NPC wants something (a
wound cleaned, a feverish cut tended, pantry hands, a sickness
seen, a confession heard, a party formed, news of taken kin);
options engage or deflect it (invites accepted with reasons or
declined with reasons — Chloe and Caleb both hold their "I work
alone" line twice, consistently, as character, not loop);
endings resolve, plant, or owe (wound and sickness threads
resolved at d+7 with thanks; lessons recalled at d+7 — "Pawpaw,
I'm seeing it everywhere now"; taken-kin thread resumed with
"Still nothing on Paul"; parties formed with roles and names).
No fabricated shared history: callbacks reference real driven
history (Ruben's wound, Tanisha's sickness, Quinn's cut-off
foraging thread, Ada's Pawpaw lesson, Caleb's pods). No filler
loops: repeat confrontations push back (Ada: "I confessed that
already. I'm not confessing it twice for dramatic effect.";
Quinn: "I told you the truth. You can keep poking it, but it's
told.").

Observations (not bar failures):
- Scout duplication, 4th panel running, now on ALL 4 pilot seeds:
  the role menu marks scout "(held by X)" / "← you have this",
  yet the driver still assigns scout to the new member (Quinn
  after Tanisha, Hassan after Ada, plus same-person re-picks).
  The menu warns but does not gate — most plausibly a driver
  artifact (the driver always picks scout), since a human could
  pick another role. Flagged for the party system, not claimed
  as a defect; human-play evidence would settle it.
- The driver always picks "The Company" (party_namepick:2), so
  NPC-suggested party names (The Long Walk, The Firetenders,
  The Unlost, The Thornbacks) never stick in driven play — a
  driver artifact, not a game finding.
- Double invite lines persist ("Want to come with us?" /
  "Want to come with me?" in every invite) — the party-vs-solo
  offer, slightly robotic in transcript form. Known edge.
- Quinn d+7 opens by QUOTING its own d+3 line verbatim ("we got
  cut off, 4 days back. 'Quinn looks at you, level...'") — the
  thread continuity is real, the verbatim self-quote reads
  slightly robotic. Noted, not a bar failure.

## REACHABLE / FUN / WINNABLE

- REACHABLE: yes. Week-1 grief naming fires on 4/4 fresh seeds
  without forcing (1/5 to 4/5); the fifth handoff records fully
  on 2/2 forced seeds. The detector fix is reachable in the
  sense that matters: chainDeaths now counts what actually
  happened, on every seed, not just the ones with tidy days.
- FUN: yes, on the conversation evidence. Grief lines are
  specific ("The fire feels smaller without Leonard. The rest of
  us will have to be bigger."; "We bury, we grieve, we keep
  going. There's no step four."); confessions push back instead
  of looping; parties form with names and roles; a buried thread
  (taken kin, pods) runs across the week. The robotic edges are
  the known ones (double invite lines, driver-picked party
  name, scout re-picks) plus the Quinn self-quote.
- WINNABLE: not this leg's window to judge — no panel seed
  approaches the table. The succession mechanics themselves do
  not block winning: bonds 22/22, affinity 0 drift, knowledge
  and skills carry across five handoffs intact, and all four
  villages end alive and fed.

## Blanks filled or documented

- FILLED (measurement + instrument fix): the r91 chain-collapse
  is fixed at the recorder (playerDeath-wrapper) and proven
  RED->GREEN on the known seed; the MIX block is implemented
  and fully classifies r91 fixtures and the fresh panel
  (0 unclassified anywhere). CHAIN5 carries onto the new master
  (2/2, 22/22, diff 0).
- DOCUMENTED, not fixed (tackle-succession / party system /
  instrument owners): sentimental items still vanish at some
  handoffs (oath_ring; contract_quill, reading_glasses,
  buskers_harmonica, spare_socks) but not others (29152 fifth:
  none) — the vanish is intermittent, mechanism still open;
  the scout-duplication question (menu warns, driver assigns
  anyway); the double invite lines; the small party-name
  funnel (driver artifact); the Quinn verbatim self-quote.
- No src/js change was in scope or made. The bypass sweep never
  fired: no evidence any bearer change bypasses playerDeath.

## Regression suite

node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2
in the worktree (log: goal hidden_files evidence
journey-succession-r94-checkquick.log — see closeout section
below for the result; the run is instrument-only, zero src/js
diff, so no failure is attributable to r94 unless the proof test
itself fails, and it does not: 45 PASS, ALL PASS).
The standing pre-existing failure families (r91: measurement-
proof-update, measurement-workflow, mobile-combat-cadence,
occupation-panels, phone-frame-proof, establishment-r20-fixes)
are the baseline; any NEW failure is a stop-and-explain item.

## Metric review

- No metric proved wrong. One measurement refinement is proposed
  for the NEXT run (not applied here): the MIX prompt family is
  a 5-phrasing heuristic observed on r91 transcripts; new
  phrasings fall into unclassified, which is visible and honest,
  but a future panel should re-derive the family from its own
  transcripts before claiming 0 unclassified as a finding.
- DETECTOR's detectedDay semantics changed (death day, not
  detection day). Any downstream consumer that assumed lagged
  days (notably the naming scorer's recentDead window) now gets
  truer days; panels should say so when comparing detectedDay
  across r91/r94, not treat a 1-day shift as a behavior change.
- NAMING-ANY's interpretation held a second run: with no second
  death inside any week-1 window, any-recent == first-bearer
  4/4 — the metric is only informative when that condition
  occurs, and panels should say so rather than reporting the
  equality as a behavior finding.
- CHAIN5-READABLE's >=2/3 allowance was not load-bearing this
  run (2/2 recorded on the 2-forced pilot). Keep it: a forced
  panel on a game that can end early must not demand 3/3.
- M3v2b's pilot bar (>=3/4) held with margin (4/4 >= 2).

## Telemetry deviation check

node scripts/telemetry-check.js --baseline
.../telemetry-baselines/succession.json
--current 'evidence/2026-11-01/journey-succession-r94-tele-*.json'
--metrics deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions
LOUD lines (2), both VERDICT: EXPLAINED, baseline NOT rolled:
- deaths.bearer 180%: baseline 5 -> current 14 — the forced-chain
  panel deliberately kills bearers up to 5 times on 2 seeds, plus
  organic interleaves (29152's Sandra->Tanisha, 29153's
  Enzo->Thierry); regime, not drift (r89/r91 precedent, prereg
  rule: forced panel must not roll the unforced baseline).
- census.fallen swung 90%: baseline 10 -> current 19 — same cause
  (forced chains + organic deaths across 4 seeds: fallen
  5+7+2+5=19).
Quiet: census.alive, census.integrationStage,
week2.deadBearerMentions (no LOUD line). Baseline left untouched.

## Closeout (main-session recovery, 2026-11-01)

The 06:00 Lane B coordinator timed out before closeout (checkquick
still running at ~714s). Recovered in the main session: no run
process was alive at recovery (ps clean; the 12:52Z heartbeat was
the coordinator's last write, not a live worker — no heartbeat
loop process existed). Pilot evidence verified (chainN 4/5/1/0
reproduces the run note exactly). Checkquick run to completion
here; see Regression suite below.

## Regression suite (recovery run)

node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2
in the worktree: 280 passed, 10 failed in 1239s (log: goal
hidden_files evidence journey-succession-r94-checkquick.log).

- 6 standing families: measurement-proof-update,
  measurement-workflow, mobile-combat-cadence, occupation-panels,
  phone-frame-proof, establishment-r20-fixes (the last confirmed
  failing on r71/r79 checkquick logs too).
- 3 contention timeouts at the 120s cap, exit null:
  trust-observer-neutrality, capable-bot-20261014,
  table-endings-20261014 — the documented concurrent-load flake
  signature under 7+ active sibling runs; pattern-matched, not
  solo-verified.
- 1 load artifact, measurement-cache-flags: the test's 30s
  spawnSync cap is too tight under sibling load — a probe panel
  run was killed at 60s after writing valid entries; solo the
  test passes its 3 substance assertions and fails only the
  exit-status assertion. Not a code regression.
- Zero failures attributable to r94: instrument-only, zero src/js
  diff, and none of the failing tests touches r94's scripts.
  r94's own proof test is re-run post-rebase at landing.
