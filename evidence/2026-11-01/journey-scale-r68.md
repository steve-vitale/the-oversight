# journey-scale r68 — Lane A, leg 3 SCALE (2026-11-01)

**Run id:** laneA-scale-2026-11-01T19:43Z (scheduled 13:45 CST 2026-11-01).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success.
This run's 3 follows the deepening leg's 2→3 write (rotation file
mtime 19:25Z, minutes before this run's lock), so it is
queue-correct, not the r61–r64 "still reads 3" anomaly.
**Base:** master@be352e2cb at branch creation (Loop A 1742Z tip).
**Pre-register:** evidence/2026-11-01/journey-scale-r68-prereg.md
(written and committed before any scored seed ran; the driver fix
below was committed before the scored quad too — the only runs
before it were un-scored DAYCAP debug runs).
**Change set at closeout:** ONE driver fix (gossipPicks block-scope
bug, no game code) + tooling (r67 driver/analyzer relabeled, gossip
forcing picker, r68 analyzer with gossip-exposure counts) +
evidence. ZERO src/js, zero src/data. Gating freeze honored;
perception law honored (all instruments read-only; the gossip
picker only presses an offered menu item, never engine state).

## Infrastructure notes (loud, first)
- **No lock contention at start:** no playtest-loop.lock existed; this
  run created it and deletes it at closeout.
- **Pre-flight clean:** main-tree `git status` empty, disk 22%,
  `git pull` already up to date, worktree-reap ran (7/16 active —
  the active trees are all dirty/held lane-B trees, correctly
  untouched).
- **Heartbeat:** manual heartbeat at registration verified landed
  (19:45:36Z). The first 10-minute nohup loop DIED after its
  19:57:26Z beat (reaped with its exec session — no processes left,
  registry stale past the 15-minute threshold at the pilot's end).
  Caught by registry read-back, manual heartbeat re-landed
  20:21:07Z, and the loop was restarted as a tracked background
  session (proc_e6198636eed6), which heartbeated for the rest of
  the run. Lesson, restated: never trust a silenced loop — verify
  by registry read-back, and a nohup loop inside a reaped exec
  session does not survive it.
- **Safe-commit index clobber struck TWICE**, same class as r66/r67:
  after each correct private-index commit, the worktree's main
  index lied (prereg commit: all 3 files staged-as-deleted +
  untracked; fix commit: index still holding the pre-fix blob
  while HEAD and worktree held the fix). Repaired both times via
  HEAD-blob cacheinfo, verified: `git status` clean apart from
  untracked evidence, `git diff HEAD` empty, hash-object matches
  HEAD. Both commits themselves were correct.
- **Driver bug found by this run's own pilot, fixed before scoring
  (see §5).** The pilot's transcripts were missing, which started
  a debug chase (full detail in §5 — the short version: a
  try-block-scoped `let` referenced after the try threw
  ReferenceError at every conversation's end, silently swallowed
  by the driver's own catch, so no transcript file was ever
  written). The full pilot was re-run clean after the fix and its
  census line is IDENTICAL to the buggy pilot's (DEAD d130, same
  scalars) — the throw happened after endConvo, so the sim
  trajectory was unaffected. All scored data comes from the fixed
  driver.

## Verdicts (binding questions, answered)

### 1. GOSSIP EXPOSURE + FIX GATE: GATE STAYS CLOSED — no fix lands
Forced band (GOSSIP_FIRST=1, fresh seeds 85021–85024): 5
transcripts, **0 repeat pairs, 0 fallback pairs** (r67 gossip
analyzer, reused as-is, output saved as gossip-analysis.txt).
Exposure, counted per sitting:
- 85021 d90: 1 gossip pick → 2 gossip beats (Elena the Baker,
  then "Elena is back" — distinct lines, same thread).
- 85021 d120: 1 gossip pick → gossip chain (Miguel / Aria
  Exchange walk-outs, then reputation beats — distinct lines).
- 85023 d120: 1 gossip pick → 5 distinct gossip beats (Lounes
  out, Miguel snares, Miguel back, Pavel bush pilot, Erin creek
  water — a news roundup, zero repeats).
- 85022 d90 + 85023 d90: 0 gossip picks — ask:gossip was NEVER
  OFFERED in those sittings' menus (goal thread / favor thread
  consumed every turn), so the forcing branch had nothing to
  press. Forcing works when offered; it cannot conjure an offer.
Per the prereg verdict rule, 0 fallback repeats DESPITE genuine
multi-beat gossip exposure (3 sittings served 2, ~4, and 5 gossip
beats) means the r66 Henrique instance STANDS as a
single-instance blemish, not systemic, and **no fix lands this
run**. The mechanism stays code-proven (two null-top entries
render the same fallback line) but unconfirmed in play for a
second band running. Coverage caveat, stated plainly: 2 of 5
sittings were never exposed at all (gossip not offered), so the
non-reproduction rests on 3 exposed sittings, not 5 — but those
3 served 11 gossip beats between them, including a 5-beat chain
with every opportunity to repeat, and none did.

### 2. PEOPLE CHECK (sense law — all 5 transcripts read in full)
5 of 5 fully real. No fabricated shared history, no static menus,
no filler loops, no repeat class of any kind (analyzer: 0 pairs).
- **85021 d90 Víctor (betrayal accept, ordinary):** invitation
  TAKEN, outing played (torn ground at the ridge, hand on sleeve,
  faster home), then a trade pitch ("I trade in what I know")
  and an Elena-return gossip thread. Real scene, not filler.
- **85021 d120 Víctor (betrayal accept, ordinary):** invitation
  TAKEN again, quiet-hollow outing, comfort lands ("It helps,
  hearing that"), gossip chain (Miguel/Aria Exchange walk-outs),
  reputation beats (player's Exchange win on camera). Real.
  Same Víctor as d90 (convoCount 15) — continuity holds.
- **85022 d90 Harold (goal, belonging):** a coherent outsider's
  monologue ("I just want someone to need me here", "Twelve
  strangers. But maybe — maybe not strangers forever"). The
  "They nod slowly" / "So." beats are generic continuers, not
  repeated content. Real. (No gossip offered this sitting.)
- **85023 d90 Ryan (favor + betrayal accept, ordinary):** favor
  committed ("The ridge above the creek, first light"), then a
  goon leads to an invitation, TAKEN, and the outing turns on
  fresh tracks — "We go back now. Quietly." A played consequence
  that aborts the forage plan; want stage 1→3. Real.
- **85023 d120 Ryan (grief/curious + gossip):** comfort lands,
  then the 5-beat gossip roundup above — including a mini-arc
  (Miguel out to the snares, then Miguel back). Real, and the
  band's best proof that gossip serves varied entries.
- **Olivia post-accept adjudication: DOES NOT REPRODUCE in kind.**
  Three fresh betrayal accepts (Víctor x2, Ryan x1) all lead to
  played outings with distinct threads and consequences — none
  to the aphorism loop. The Olivia blemish stays instance-
  specific (no Olivia accept arose, so Olivia herself is still
  unre-tested), but the accept PATH is now proven to produce
  real content on 3 fresh instances. No recurrence of the Deon
  goal-opener repeat (r67 fix holds on this band), Irving
  displacement, Thabo withdrawal-only talk, Meera/Dale gossip
  tail, or Boris nod-loop.
- Observation, not a defect: Víctor's seek_taken want stays
  stage 0 across both accepts — the accept IS the content, but
  it does not advance that want. Ryan's favor want, by contrast,
  advances 1→3 on its sitting.

### 3. DUTY REACHABILITY + WSPLIT CONTINUITY (counts, report-only)
Quad totals (pre-fix instrument, fixed driver): villager-days
2,052; knower-days 766; armed knowers 766 (all real weapons);
weaponless days 0; weaponless-knower days 0; eligible days 0;
attempts (Cd advances) 0; unexplained non-attempts 0; stick-only
knower-days 0; stick-blocked counterfactual days 0.

| seed | villager-days | knower-days | weaponless-knower | eligible | attempts |
|---|---|---|---|---|---|
| 85021 | 517 | 272 | 0 | 0 | 0 |
| 85022 | 503 | 276 | 0 | 0 | 0 |
| 85023 | 747 | 121 | 0 | 0 | 0 |
| 85024 | 285 | 97 | 0 | 0 | 0 |

- Weapon-craft lines 0/4 seeds; deadfall-duty lines 0/4 seeds —
  the EIGHTH consecutive 0/4 for both duties (r61–r68).
- The r66 armed-gate classification REPRODUCES for a third band
  running: knowledge and armament coincide by construction
  (every knower-day armed), so the duty's eligible population
  is structurally ~empty on the competent scalecourt path.
- Instrument wart, one line: hungerwatch shows duplicate days
  (d2/d4/d29 twice, d114 twice with d113 missing) — policy.daily
  occasionally runs twice for one day value. Totals above count
  rows, so a few days double-count (<1% of rows); every key
  metric here is 0 regardless, so no verdict moves.

### 4. TABLE-APPROACH + CENSUS (report-only)
| seed | end | day | pop | pantry | rank | seat | arc | maxWave | pilg |
|---|---|---|---|---|---|---|---|---|---|
| 85021 | DEAD | 130 | 0/0 | 0 | regional | lesser | 4 | 4 | 8 |
| 85022 | DEAD | 116 | 0/0 | 2,017 | national | lesser | 4 | 4 | 11 |
| 85023 | ALIVE (day cap) | 181 | 6/6 | 8,377 | national | none | 3 | 4 | 3 |
| 85024 | SCATTERED | 47 | 7/7 | 0 | regional | none | 3 | 2 | 3 |

- Lesser seat 2/4; full seat 0/4; wave 5 reached 0/4;
  national reached 2/4 (85022, 85023) — up from 0/4 on r67's
  scored band, but on fresh seeds with a picker that moves the
  RNG stream; r67's own post-fix control also reached national
  on a seed, so band rank counts swing on small perturbations
  and no fix effect is claimed.
- **85022 dissolve-and-reform, explained (not a gating
  violation):** national d106 → global d107 → rank REGIONAL
  d114 (realm dissolved, correctly clearing both live flags)
  → national again d115 (court sat anew). The census stamps
  (globalDay 107 < nationalDay 115) look inverted only if read
  as current-state proofs; they are historical stamps, and the
  wantwatch rank trace proves the sequence: global was answered
  while national, the dissolve cleared it aloud in the rank
  trace, and the second court re-earned national. The live-
  state design from SCALE.md holds.

## BARRIER PIN (standing instrument)
Barrier lines: 85021: 0, 85022: 2, 85023: 0, 85024: 0. Both
85022 lines are the guard WORKING as designed (sleep refused
mid-fight, d87; boil-water refused mid-fight, d116 — inCombat
true, tbfight true, not over), same class as r67's finding.
The pin stands in its r55 form; it does not overturn.

## FUN / REACHABLE / WINNABLE (scale leg, plain words)
- REACHABLE: unchanged in kind — the climb's machinery fires
  (courts, covenants, pilgrimages, national/global voicing,
  lesser seats waiting on 2/4), and this band reaches national
  on 2/4. The self-craft duty's non-firing is now an
  eight-band structural fact (armed-gate), not a mystery. The
  gossip system, when reached, serves varied real news — but
  two sittings never offered gossip at all, so gossip's
  reachability from ordinary talk still depends on the menu
  offering it.
- FUN: unchanged in kind — the best writing this run is small
  and human (Harold on belonging; Ryan's fresh-tracks retreat;
  the 5-beat gossip roundup). The betrayal-accept path, the
  leg's old thin spot, now plays three distinct outings with
  consequences instead of the aphorism loop.
- WINNABLE: not shown, again. The lesser seat waits on 2/4;
  the full seat stays unwon (wave 5 reached 0 everywhere).
  National on 2/4 is progress on the ladder, not on the seat.

## Metric review
- Census scalars unchanged from r51's list (19 scalars +
  covenant trusts), plus the fusion/ability columns (reads, not
  scores), plus the r61 end-state class, the weapon-craft-line
  and deadfall-duty line counts, and the new gossip-exposure
  counts (ask:gossip picks, gossip THEM lines, sittings). The
  gossip analyzer is reused unchanged from r67 (its
  normalization rules were fixed there); the r68 analyzer drops
  the r65 purity diff (fresh seeds + forced picker change the
  RNG stream, so a diff would be meaningless) and reports
  census without diffing.
- No metric was re-scored mid-run. The prereg's pilot gate
  passed on the re-run (85021 ran clean, capture 991KB on the
  buggy pilot, transcripts present on the fixed re-run). The
  prereg's Q1 verdict rule fired as written: 0 fallback pairs
  with multi-beat exposure → gate closed, no fix — even
  though 2 of 5 sittings were never exposed, which is recorded
  as a caveat rather than used to re-open the gate mid-run.
- The gossipPicks driver fix was NOT pre-registered (it is a
  new finding from this run's pilot, not a Q1 item), so it was
  held to the stricter bar instead: root-caused to a single
  line (try-scoped `let` referenced post-try), fixed by moving
  the declaration, proven by the fixed pilot producing both
  transcripts with gossip picks, and committed before any
  scored seed ran. If the fix had not produced transcripts, the
  scored quad would not have run on it.
- Carried, still unre-tested: Olivia post-accept aphorism loop
  as an Olivia instance (the accept path in general now has 3
  fresh real instances); r65 bank-trace finding; r63
  mantle-pass proof; r58 Irving-displacement, subject-menu,
  Boris nod-loop; r56 chooseAbility-unguarded note; r55 barrier
  pin form (see above — guard confirmed working, not
  overturned). r67's capable-bot section 7 test-maintenance
  item (re-seed or order-tolerant first-use assertion) is still
  queued for a later run.

## Telemetry deviation check (step 14 — NOT rolled)
`node scripts/telemetry-check.js --baseline
.../scale-census.json --current
'evidence/2026-11-01/journey-scale-r68/journey-scale-r68-trust-*.json'
--metrics census.day,census.popAlive,census.pantryKcal,census.maxWave,census.pilgrimages`
→ two LOUD lines, both investigated same-run, both EXPLAINED:
- `census.pantryKcal newly appeared: baseline 0 -> current
  10394 (n=4 files)`: identical in kind to r62's–r67's verdict.
  The baseline is the old-base quad's SUMS (all villages
  dead/scattered, empty pantries). The r68 quad's pantry is
  85022's 2,017 + 85023's 8,377 (the other two seeds hold 0).
  A surviving village holding a pantry is not a defect.
- `census.pilgrimages swung -64%: baseline 69 -> current 25
  (n=4 files)`: band variance against a stale baseline, not a
  broken counter. Pilgrimages are climb-means: they start only
  for unstudied below-bar candidates while the scholar is
  healthy, and stop when the climb completes or candidates run
  out. 85023 — the band's long-lived village — stopped at 3
  pilgrimages (d26/d75/d78) because it COMPLETED its climb
  (3 covenants + 1 primary-sub at end state, national d170);
  r67's 75-pilgrimage village never left regional, so it kept
  climbing all season. The counter works (per-day progression
  visible in hungerwatch on all four seeds); the baseline sums
  a different band's fates. The baseline is NOT rolled on this
  run's numbers (prereg decision stands).

## Tests
- `node --check` clean on the r68 driver and analyzer at creation,
  and again on the fixed driver before the scored quad.
- R68 analyzer proof-by-use: it reproduces the r67 analyzer's
  wsplit shape on the fresh band (totals + armed classes +
  counts) and adds gossip-exposure counts that match the
  transcripts by hand-count (85021: 2 picks / 2 sittings;
  85022: 0 / 1; 85023: 1 / 2; 85024: 0 / 0).
- Gossip analyzer (r67, reused): 0 pairs on the r68 band, and it
  still flags exactly the r66 Henrique pair when run on r66's
  transcripts (r67's validation, not re-run here — the analyzer
  is byte-unchanged from r67).
- `node scripts/check.js --quick
  --cacheDirectory=/tmp/jest-cache-playtest`: **283 passed, 7
  failed in 454s** (290 scripts; log at
  evidence/2026-11-01/journey-scale-r68/checkquick.log). The 7
  split into the 6 pre-existing assertion failures (identical
  to r67's 6, same names, fast exits:
  godpath/test-measurement-proof-update,
  godpath/test-measurement-workflow,
  godpath/test-mobile-combat-cadence,
  godpath/test-occupation-panels,
  godpath/test-phone-frame-proof, and
  test-establishment-r20-fixes-20261020.js with the same
  racks-full "next day voices once more" gate assertion) + 1
  KNOWN item newly visible in-suite: test-capable-bot-20261014
  (39 passed, 1 failed: "real capable player combat earns the
  food deed at first use"). That is r67's adjudicated solo-only
  fixture-sensitivity finding (section 7): it reproduces
  deterministically post-r67-fix and passes pre-fix (verified
  by stashing the fix in r67), with the deed mechanism intact
  — a trajectory shift when a pick pool shrinks by one line
  (a villager's fight consumes the feast buff before the
  player's first combat use), not a deed regression. It
  appears in-suite this run only because capable-bot completed
  in 54s (under the 120s cap) instead of timing out as in r67,
  where the suite never evaluated section 7. The fix is NOT
  reverted for it, and the test is NOT loosened to fit the new
  trajectory (green-list rule) — the re-seed / order-tolerant
  maintenance item stays queued for a later run. r67's 3
  timeouts all passed this run (trust-observer-neutrality 45s,
  table-endings 37s, capable-bot 54s — all in the slowest list
  but green except section 7), and r67's cache-flags contention
  failure passed too. No quick-list test imports this run's
  scripts, and this run's change set is drivers + analyzers +
  evidence with ZERO src/js, so it cannot have caused any of
  the 7.
- Suite side effect, checked not assumed: `git status` after
  the suite run shows only this run's evidence paths untracked
  (run note + checkquick log) — no stray modifications,
  nothing to discard.

## Landing (filled at closeout)
Master at worktree creation: be352e2cb. At closeout master had
moved to 9aaf0a5f7 (11 commits: Loop A 1935Z coordinator evidence,
sim-freeface-a, sim-latewin-a, journey-crisis r96 closeout,
sim-gatecover-b, sim-routeblock-b — ZERO src/js + src/data in
the range, verified by diff). The branch was rebased cleanly onto
9aaf0a5f7 (4/4 picks, no conflicts, no stop-at-pick quirk), and
proofs were re-run after the rebase as the body requires: node
--check clean on driver + analyzer, gossip analyzer TOTAL
unchanged (0 pairs / 0 fallback, 5 transcripts), r68 analyzer
totals byte-identical on all four seeds. NO quad re-run after
the rebase: the rebase range holds zero game code, so the
measured quad stands unchanged on the new base.
Merged locally via `git merge --ff-only journey-scale` → master
(verified: master tip equals the branch tip after merge), pending
ship (no bump, no push, no live verify — ship loop owns those).
Branch commits: 942817444 (prereg + gossip-first driver/analyzer),
2fcf2ce85 (gossipPicks block-scope fix), 6561b2d46 (quad +
analyses + run note), d09258152 (run note tests section +
checkquick log), plus this landing section as the final branch
commit, merged by a second fast-forward.
Worktree released + branch deleted at closeout; final main-tree
status clean. Rotation file written 3→0 at closeout and verified
by reading it back. Playtest lock deleted at closeout. Heartbeat
loop stopped at closeout.
