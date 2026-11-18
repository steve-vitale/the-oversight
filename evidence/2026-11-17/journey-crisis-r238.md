# Journey crisis r238 — run note (Lane B, leg 6)

Leg 6 (crisis), run r238, seeds 14511–14515 (fresh band, verified per
`local_seed_band_freshness`). Base master `3d0f5770c`
(sim-scale-onramp-round-2315). Prereg:
`evidence/2026-11-17/journey-crisis-r238-prereg.md`.
Panel: 5/5 seeds exit 0. Driver
`scripts/journey-crisis-r238-delayed-20261117.js`, analyzer
`scripts/analyze-crisis-r238-delayed-20261117.js` (validated: reproduces
r230's full analysis byte-identically on r230's data, modulo the new
DEATHCLEANUP section). Matched-band diagnostic:
`evidence/2026-11-17/journey-crisis-r238-matched-band-analysis.txt`
(r230's seeds 14501–14505 re-run on current code; JSONs in /tmp, not
committed — the analysis txt carries the numbers).

## Panel

| seed | end | days | raids | gorge nights | sorties | convos | alive | pantry |
|------|-----|------|-------|--------------|---------|--------|-------|--------|
| 14511 | game-over | 116 | 7 | 19 | 3 | 8 | 1 | 0 |
| 14512 | horizon | 150 | 10 | 65 | 9 | 8 | 4 | 600 |
| 14513 | horizon | 150 | 11 | 67 | 7 | 8 | 3 | 0 |
| 14514 | game-over | 135 | 11 | 59 | 10 | 8 | 0 | 0 |
| 14515 | game-over | 146 | 10 | 35 | 8 | 8 | 0 | 0 |

3/5 game-over, median 135d (r230: 4/5, median 138d). Two seeds held
to the horizon — 14512 with food to spare (600 kcal, 4 alive), 14513
with three people and an empty pantry.

## Verdicts (pre-registered metrics bind)

- **D1 GO**: snapshots 37/37, missing 0, delayed ≥3 attempts 37/37.
- **DRY3 CONFIRM GO** (binding): 0 dry lines on 40 transcripts — none
  on any of the three r235 fixed surfaces (expedition-ask answer,
  place-ask answer, lesson line), none anywhere else either.
- **DRY2 CONFIRM GO** (binding): 0 dry lines on the three r234 fixed
  surfaces (ask: composed topic line; probe stonewall repeat;
  confront line).
- **C1 GO**: every game-over is attrition with a named cause, no
  softlock seed (R181 SOFTLOCK 0).
- **C2 GO**: raids fire on all seeds; fought resolutions present (all 5
  D2 clears `fought(sortie-call)`); D1 snapshots all delayed ≥3;
  deltaBad empty; D3 drift unknown 0.
- **C2b GO**: every boundary-firable case fired or was refused with a
  recorded reason.
- **C3 GO**: all 40 transcripts read in full; fabricHits 0; no double
  confession (14512 d15's second confront correctly refuses to
  re-confess — the r143 spend working); no voiceLine prefix stacking
  ≥3; no stale-favor resume; no naming-stance wobble.
- **C3b GO**: 5 settled closes, all honest — 14511 d64 (fulfilled
  sick_help: "that one's settled"), 14513 d51 (thanked sick_help:
  "that debt, settled"), 14515 d70 (thanked heal_help: "settled,
  and counted"), 14515 d40 (favor moot: "that visit, settled").
  One soft case: 14515 d32's close names the general thread
  ("what's been happening, settled") while the heal favor stays
  asked — same shape as r230's soft case; the close names the
  thread, not the favor, and the favor's state is untouched, so it
  is not a false settlement.
- **C3c holds**: resume openers name real threads — the kitchen
  memory (14511 d12), the regrets (14511 d56), the fury (14513
  d32), the leadership goal (14514 d22), what's-been-happening
  (14515 d32), the visit (14515 d40), the debt (14515 d70). No
  opener names a changed favor.
- **C3d GO**: "Nothing important" 0 in sayLines and transcripts;
  recaps name the live thread; "We're going in circles" fires as
  the honest third-recap variant (A≠B throughout).
- **WRAP GO**: 40/40 marked, unmarked 0 (39 engine-ended + 1 driver
  cap break on 14515 d39).
- **C7b GO**: buried per seed — 14512 Ruth Mendez, Nora Vega; 14515
  Logan Patel, Kevin Desai, Mario Park, Violet Wang. Corpse causes:
  famine 3 (Ghita d110, Ananya d44, Ryan d134), disease 1 (Fatima
  d71 sickness), wound 7 (Tariq d66, Pablo d84, Juan d85, Nandi
  d118, Meadhbh d73, Salamatu d116, Nu Mac d130), thirst 1 (Luis
  d92). The wild dominates deaths; scholar deaths 0.
- **FUNERAL-MEND CONFIRM GO**: 33 funeral lines — 30 feast lines all
  honest about amounts and links (full feasts 1,500–4,500 kcal;
  partial feasts 400/420/600/1,152/2,062/2,400 kcal each state the
  shortfall aloud, "the feast could not buy back the full -8";
  empty-pantry feasts say the links go unmended and trust -8
  stands). The other 3 lines are the Callback wearing the dead — a
  different mechanic, not a feast. 0 silent mends, 0 over-claims.
- **TITAN-REFUSAL WATCH**: 0 refusal lines panel-wide (vs 13 r230).
  The dedupe holds vacuously. The driver carries no titan-outcome
  counter, so "no calls vs no refusals" is unmeasured — filed as a
  driver gap for the next run (same class as the deathcleanup gap
  this run closed).
- **DEFERRED-ASK WATCH**: "already handled" 0 — no r231 regression.
- **DEATHCLEANUP WATCH** (first scored panel — driver gap closed):
  deathCleanups 12 (7 + 5), removalCleanups 0, planSeeds 12,
  dead-holder entries 0, unseeded seeds [], ignition-after-death
  seeds []. Three villages (14512, 14514, 14515) slept through all
  their deaths with stats null — deaths never ignited the plan
  system. The two villages that seeded plans (14511 firstPlanDay
  36, first death d39; 14513 firstPlanDay 37, first death d44) had
  every plan cleaned at death (12 seeds, 12 cleanups, 0 lingering
  entries). The deathcleanup-b fix holds in the wild.
- **NONDEATHPLAN WATCH**: removalCleanups 0. The panel's removals
  are wild/other/sortie contexts — no non-death removal with a live
  plan occurred, so the watch is vacuous this panel (no qualifying
  case, not a pass of the mechanism).
- **STAGE-0 WATCH**: the only ask_favor sitting (14515 d39) had
  dlg:help offered — the wound ask met with six varied honest
  moot deflections, no dry line. Nothing graduates.
- **NODEAWAY PANEL**: 16 / 9 / worst-5 (14512 d64) vs r230 4/3/worst-2,
  r229 0/0/0, r228 38/9/worst-7. A return toward r228's scale WITH
  an alive bench (up to 7 living besides the player) — the
  muster-vs-travel tension genuinely engaged: on 14512 d64, 5 of 7
  living villagers were out on node-travel when a muster was
  refused. Descriptive, no lever attribution with n=5; no muster
  change landed since r230 (homebodyvoice is voice-only and cannot
  move availability), so the movement reads as band composition —
  busier villages, more node-travel — not a lever.
- **Q6 RETIRED** (descriptive): gorge-after-clear id-matched 0; the
  33 name-matched cases are same-display-name collisions.
- **R88 missed-window**: 8, 6 moved-on-valve + 2 player-drawn-off
  (r230: 8, all valve). Descriptive Q1.
- **R82 defender steering**: latelySteered fired 5×, all early
  (d11–d22); latelyOffered/latelyFired 1× (14513 d50). F1 favor
  no-longer entries empty on all seeds.
- **R126 cross-check**: all ok:true — every boundary sortie had prior
  samples (waited-ge3 or sampled-lt3).
- **R122 gorge attribution**: attributedFields true on all seeds;
  ambiguous only where two monsters share a name on the same night
  (14515).
- **ARENA WATCH** (descriptive): 11 arena-death say lines
  (14511: 1, 14512: 3, 14513: 2, 14514: 3, 14515: 2) vs r230's 10; corpse arena deaths 10
  (Kevin d47 buried, never reaches the corpse list). No win/loss
  instrument exists — say lines only narrate arena deaths — so
  this is a death count, not a win rate.
- **CASCADE WATCH**: scholar deaths 0 — no cascade.
- **STRANGER** (descriptive): 0 kills on all 5 seeds, VACUOUS.
  Eligibility: encounterEligible 0 days on every seed.
- **MEDIC-DUTY**: ability cures 0/27/8/18/16 = 69; medicine cures 0
  everywhere; pharmacy 0 days everywhere. Blocked need-days
  0/113/22/94/48 = 277. Supply: 6 ruin searches panel-wide (14511:
  4 searches, 3 scavenge items; 14513: 2 searches, 2 items), 0
  acquisitions, 0 medicine items. Cumulative 0/314 (prereg carried
  0/308).
- **FIGHT-1**: okSorties 26, brokeAfterFight1 11, cleared 15,
  multiMonsterCleared 10/16. D2 full-clear rate 8/26 (r230: 5/22).
  Matched-band diagnostic (r230's seeds on current code): okSorties
  24, brokeAfterFight1 4, cleared 20, D2 clear 1/24,
  multiMonsterCleared 19/22, breaks at vTaken 50–106 (r230's single
  break: 18). Both candidate levers are provably inert in this
  panel — FIGHTALLY2 is env-gated OFF (never set; off-mode is
  byte-identical per its commit) and the Pack Hunt harry fold is
  recorder-only (no src change); nondeathplan never fired
  (removalCleanups 0). The movement reads as band composition (the
  fresh band's sets skew to single big monsters: setSize 2.04 vs
  r230's 3.23) plus RNG re-roll noise at n=5 — the D2 clear rate
  itself swings 1/24 matched vs 8/26 fresh on the same code. No fix
  in-run; the matched-band numbers are filed as evidence, and a
  two-way A/B is owed before any lever claim. The parties that break
  take 48–106 damage in fight 1 and flee — the engine's flee-when-
  losing, not a defect — but it is the same launched-party damage
  wall the winnability loops already own.
- **R57 early-resolution**: TRUE early count 0 (legacy corpse-counting
  method says 4 — the r57/r58 corpse exclusion stands).
- **R57 D1 drift old-vs-new nightsWaited diffs**: 2 (r230: 7).
- **R155 sayUnknownCause**: 1 on 14514, 1 on 14515 — remote deaths
  (Stonebridge's Rafael, Thornfield's Ines), not Haven villagers.
  Explained, same class as r230.

## Village assessment (plain words)

Five villages went into the long dark and two came out the other side
still standing — 14512 with four people and food on the shelf, 14513
with three people and an empty pantry. The other three came down to
one person or nobody, the slow way: wounds that wouldn't close took
seven, hunger three, one sickness, one thirst, and the wild took the
rest in ones and twos. The scholar never died on any seed.

While they were dying, they behaved like people. Li takes the burnt
piece now because Darius always did; Howard turns over Violet's last
words and can't tell if he's remembering them right; Kevin is looking
for "her" and will leave the day he gets a real lead; Scarlett counts
stars named after people at night; Luigi picks up Caleb's share of the
work because someone should. They named their parties ("The Second
Try", "The Company"), promised each other roles (scout), proposed
links to Thornfield and Ashford, argued about a murder and voted
guilty, and kept their promises to the sick even when there was no
cure to give — the medic's hands did the work 69 times while the
pharmacy stayed empty. The conversations held up: not one dry line in
forty sittings, and the one place the game still stuttered — the same
stonewall line three times in a sitting — is logged below, not fixed,
because it speaks, it just doesn't vary.

## Blanks filled / findings

- **CLOSED IN-RUN — deathcleanup driver gap (r230 metric review 5).**
  The r238 driver records winPlanStats (deathCleanups,
  removalCleanups, planSeeds, partyTrios, partyDissolved) + a winPlan
  census (holder, holderAlive, stage, party size) + firstPlanDay, all
  read-only. First scored panel is clean (see DEATHCLEANUP above).
  The watch is now scored from the panel instead of standing on the
  42/42 proof alone.
- **FIGHT-1 break movement — investigated, no lever, filed as
  evidence.** Matched-band diagnostic above; the two candidate
  levers are provably inert (FIGHTALLY2 off, harry fold
  recorder-only). No fix in-run.
- **r230 blemish (a) did NOT repeat as a repeat.** Ben's buried-cache
  beat fired once (14512 d48, Li, +1642 kcal) — a single honest
  serving, not the same text twice with different amounts. Stays a
  known blemish, no fix.
- **r230 blemish (b) did NOT reproduce.** Tautological recap
  ("We started on X, then got onto X"): 0 "We started on" lines in
  sayLines or transcripts. No fix this run.
- **Doubt-stonewall line repeats verbatim 3× on d56 and 4× on d57**
  (14511: "They shake their head — not no, not yes. Done talking
  about it." 7× across two sittings). Not a dry line — it speaks —
  but flat. Same class as r234's stonewall work; the r234 fix keeps
  it from drying, the repetition itself is a content-variety call.
  Minor finding, logged, no fix this run.
- **Resume-opener quote caps mid-sentence with '…'** (14515 d40:
  "'Three days ago. Someone dropped a whole basket of tubers and we
  just stood there laughing. It wasn't even…' Just an idea."). Single
  entry, ellipsis-marked, meaning survives — NOT the r230 split
  defect (no second entry starting mid-quote). Minor blemish, logged.
- **Ambush case renumbering** (14513: case_4 voted guilty d17, the
  same ambush of Ananya re-appears as case_6 d18). Question, not a
  finding — could be a new suspect round after the vote. Logged for
  the next run to watch.
- **Wren cache note repeats verbatim in sayLines** (9× on 14511:
  "Cache by the hollow. Dried meat, clean water. I can't stay. —
  W.") — the same note every time the cache is found. Honest (it IS
  the same note) but flat across a run. Logged, no fix.
- **"They mime walking" beat repeats verbatim on consecutive days**
  (14512: the cache-spot variant fires 3× in a row twice — d44–46
  and d97–99 — 7× total for that variant; the beat has 5 destination
  variants across 17 firings, so it varies, but the same variant
  three days running reads flat). Same class, logged.
- **Door-position instruction repeats** across sittings (known r234 M4
  instructional cluster) — instructional, not conversational
  parroting.
- **D3 death mismatches**: 0. Leader-aware mismatches 0,
  unattributed death lines 0.
- **Infra note**: none this run — no SIGTERM, no flap window, no
  stale heartbeat. Registration took ~7.4 min (registry-flock queue
  behind siblings); everything else ran clean.

## Reachable / fun / winnable

- **Reachable**: yes — raids fired on every seed, sorties were fought,
  conversations, moots, funerals, betrayals, bonds, party namings
  and link proposals all fired in the wild. Nothing on this leg is
  gated behind content the panel never reached.
- **Fun**: the leg reads as people under pressure, not numbers — grief
  carried across days, a murder case argued and voted on, parties
  named, promises kept to the sick. The one flat note is the
  doubt-stonewall repetition; the buried-cache beat fired once and
  honestly.
- **Winnable**: this leg does not judge the win — it judges bending
  and breaking. Villages bent and mostly broke by slow attrition,
  which is the leg working as designed; two held to the horizon. The
  binding wall stays upstream (wave-4 kills and the veteran bar;
  launched-party damage), unchanged by this run.

## Telemetry

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/crisis.json
--current '.../journey-crisis-r238-delayed-seed1451*.json'
--metrics defendedFights,playerFights,latelyDefenseCount`:
**quiet** — 5 files, 3 metrics, no large deviations. No LOUD lines, no
same-run investigation item. Baseline NOT rolled on single-panel
variance.

## Metric review

1. Supply cumulative corrected: the panel had **6** ruin searches, not
   0 — cumulative 0/314 from the prereg's 0/308 (14511: 4 searches,
   3 items; 14513: 2 searches, 2 items; 0 medicine throughout).
2. C7b counts corrected: famine **3**, disease **1**, wound **7**,
   thirst **1** — the run note's table carries the analyzer's
   corpse-cause counts, not the feed counts (all feed counts are 0;
   the corpse record is the source).
3. The r230 metric-review diagnosis of the truncation (clipSnippet vs
   convoSplitBeats) stands corrected — and this run adds the
   ellipsis-cap shape (14515 d40): a quote capped mid-sentence with
   '…' in a single entry is NOT the split defect; the split defect is
   specifically a quote broken across two transcript entries.
4. Arena watch still needs a win/loss instrument: say lines only
   narrate arena deaths, so the watch can only count deaths, not
   judge the Reunion re-tune. Carried.
5. Deathcleanup watch is now MEASURABLE — the r238 instrumentation
   closes the r230 driver gap. The watch is scored from the panel.
6. Dialogue-only fixes are NOT trajectory-neutral (voiceLine draws
   RNG) — pre/post trajectory comparisons stay descriptive. The
   matched-band diagnostic is the honest form of that comparison:
   same seeds, re-rolled trajectories, no mechanics change in the
   base.
7. FIGHT-1 break rate is band-composition + RNG sensitive at n=5 — a
   matched-band re-run is the discriminator, not a cross-band
   comparison. A two-way A/B (FIGHTALLY2 on/off, harry fold on/off)
   is owed before any lever claim about fight-1 damage.
8. The NodeAway panel metric with an alive bench is the meaningful
   reading — a 0/0/0 on an empty-village band is compositional
   (rule 11), and a return toward r228 with an alive bench names
   the muster-vs-travel tension, not a lever.
9. The titan-refusal watch needs a titan-outcome counter in the
   driver, or 0 lines stays ambiguous between "no calls" and "no
   refusals". Filed as a driver gap for the next run.
10. The homebodyvoice watch needs a qualifying-pick counter
    (party_launch picks with a range-0 companion), or 0 voice lines
    is uninterpretable — the proof carries it in harness, the wild
    panel cannot judge it. Filed as a driver gap for the next run.
11. The D2 full-clear rate is noisy at n=5 (1/24 matched vs 8/26
    fresh on the same code) — a panel-level descriptive, not a
    per-change claim.

## Gate

Adopter re-run (the timed-out run's gate started but never finished;
its partial log is `evidence/2026-11-17/journey-crisis-r238-check-quick.log`).
`node scripts/check.js --quick` in the worktree, 2026-11-18 03:23–03:36Z:
**335 passed, 6 failed in 803s, 0 attributable.** Full log:
`hidden_files/evidence/2026-11-17/journey-crisis-r238-gate.log`.
The 6 failures are exactly the standing set:

1. `test-measurement-proof-update.js` — "Proof source inputs are not
   current" (staleness, standing).
2. `test-measurement-workflow.js` — "retained neutrality proof covers
   the current Game/controller/harness inputs" (staleness pair, standing).
3. `test-living-garden-deed-attainment.js` — TIMEOUT after 120s
   (load artifact, standing).
4. `test-phone-frame-proof.js` — stale receipt (standing).
5. `test-one-person-army-deed-attainment.js` — TIMEOUT after 120s
   (load artifact, standing).
6. `test-ladder-bundle-20261108.js` — control: 200 monster turns
   WITHOUT delivery fire the ambient raid, fires 0 (standing).

Correction to the Remainders expectation above: the measurement-proof
pair does NOT stay green on this run despite zero src/js changes —
it was already stale against base `3d0f5770c` itself (r235's DRY3 src
change re-staled the retained proof; proof-refresh round 21 is still
owed). The pair's failure is pre-existing on the base, 0 attributable
to r238. No measurement-cache-flags failure this run (it passed;
r235's 0/4 was the load artifact).

Gate history this adoption: the first attempt (03:12Z) reached 208/341
with 6 failures showing before a VM replacement ~03:21Z SIGTERMed it
(boot ece0ae50 → 344d0d1f; heartbeat loop restarted after the
replacement). The re-run above is the complete gate.

## Remainders carried (from r235, social leg)

- F5 targeted harness (owed per the r231 rule — third thin panel):
  not touched by this crisis run; still owed.
- Trail-talk pool widening (2 lines deep; line A 12× on 45720):
  social-leg content; not touched.
- repay.engageBeat broken/open pools (same class as F6, unobserved);
  all-3-blocked F5 residual (r226): not touched.
- Proof refresh round 21 (measurement-proof pair fails on any src/js
  change until refreshed): this run changes no src/js, so the pair
  should stay green — the gate result below is the check.
- M4 split (instructional vs conversational) — proposal for next run:
  this panel adds a fresh sighting (door-position instruction repeats
  across sittings, r234 M4 cluster; instructional, not conversational
  parroting). The split proposal stays open.
- DRY3 site-1 wild hold unproven (no fallback collision in the wild):
  this panel also had 0 dry lines and no fallback collision, so the
  wild hold is still carried by the proof, not by a wild collision.
  DRY3 CONFIRM GO stands on the absence (0 dry on 40 transcripts).

## Closeout

- **Adoption:** the 20:00 coordinator timed out at 3600s with the gate
  started but unfinished (panel 5/5, proof red-verified then green,
  telemetry quiet). Adopted after heartbeat staleness (registry hb
  02:54:42Z, stale 03:10Z); tree heartbeated immediately, then every
  10 min. Two stray main-tree files (this run's own analysis output,
  written to the main tree by mistake) moved into the worktree
  evidence dir; main tree verified clean. First gate attempt killed
  at 208/341 by a VM replacement ~03:21Z; gate re-run clean 335/6,
  0 attributable; proof re-run 22/22 on the final tip. Rebase onto
  current master, proof re-run on the rebased tip, then merge — see
  the landing commits in the git log.
- **Merged locally, pending ship** — no bump, no push, no live
  verification (ship loop owns those).
- Rotation 6→7 written with read-back; lock deleted at closeout
  after run_id verification.
