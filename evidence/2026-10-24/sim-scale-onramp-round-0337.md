# sim-scale-onramp-round-0337 — coordinator evidence (axis scale-onramp — 1 arm LANDED, 2 arms KILLED at pilot, merged locally pending ship)

Run: fleshout-20261025T0337Z (Sat 2026-10-24 22:37 CDT). Axis: scale-onramp
(converging). Loop B live on food-economy at run start (claim
fleshout-loop-b-20261025T0335Z, arms sim-casecount-adopt-b +
sim-rotdecide-govern-b, heartbeats fresh) — NOT touched. This run
worked the topmost non-converged axis not named in any live claim:
scale-onramp. No sibling claim, tree, branch, or file was touched at
any point; sibling landings below are master-tip moves only.

## PRE-REGISTRATION (coordinator level, binding)

- Substrate (all arms, shared): tableseat-nowait — leanlinkrescue
  courtship (LEANLINKRESCUE=1) + seat legs only (TABLESEATNOWAIT=1),
  no wait leg. Seeds 73671–73678, 180d death-aware — the SAME band
  as standing99 / vetkill / vetshape / encounter-a / arenadeath /
  wave2enc / fieldfinish, reuse intentional: these are
  re-measurements of those seeds with new recorders or new
  behavior, not fresh bands.
- The 0205 round's named next blanks, in order: (1) trace one
  1-HP arrival to its source; (2) a field-finish conversion lever
  with its own pre-registration. This round works both, as three
  arms: two competing conversion variants + the trace.
- Conversion arms share IDENTICAL pre-registered bars so the
  variants are comparable. PRIMARY: villager wave-3+ field kills
  band-wide >= 3 (baseline 0), AND >= 1 of the focus stuck seeds
  (73675/73677/73678) converts >= 1 strict wounded-repeat into a
  villager field kill. COST BAR (must also pass): band median
  survival >= 120d (baseline 150d) AND wave-3+ field vDie <= 12
  (baseline 6). A miss is NO-GO, never re-scored.
- LANDING RULE (stated to both conversion workers up front):
  at most ONE conversion variant lands. If both GO, the one with
  fewer added villager deaths lands; if tied, HOLD (minimal
  change) lands. A killed variant leaves no trace on master.
- Trace arm pre-registration: GO = a named source path with a
  traced event chain for >= 1 arrival from its own corpus, OR all
  candidate paths excluded by instrumented evidence with a
  firing control case each; NO-GO = the arrival still
  unexplained after all candidates are instrumented.
- Balanced panel (§15): attempted by all three arms; all three
  hit the known error (balance-panel.js compare requires panel
  pairs; these corpora are per-seed recorder rows). Sweep-compare
  tables on identical seeds are the comparison for this run.
  Panel-contract lane not touched.

## Arm 1 — sim-ffhold-a (HOLD variant, game-code) — KILLED at pilot, NOT merged

Worker commit b13ac41ca (branch sim-ffhold-a, now deleted).
Change, exactly as pre-registered: in FIELD fights only, when a
fight starts with the monster already below the break line
(0.15 wave >= 2, 0.25 wave 1) AND no damage dealt yet this fight
(rec.mDealt == 0, covering ambush + volley), skip the post-volley
break-flee so the monster stands at least one round. Untouched:
arena (opts.noFlee), volley drive-offs, the in-round break check
after round 1, vFlee/evade, deed credit, tb path.
Evidence (branch-only, dropped with the branch):
sim-ffhold-a.md + perseed-ffhold-a/ (16 rows + summary).

- PRIMARY kills leg: 4 band-wide (baseline 0), bar >= 3 — PASS
  on this leg alone.
- PRIMARY focus-conversion leg: 0/3 — FAIL. A real type-level
  conversion exists on a non-focus seed (73673: baseline strict
  chorus_line -> armed field kill of chorus_line, d53); it is
  reported, NOT counted — the bar named focus seeds only.
- COST median: 98d (baseline 150d), bar >= 120d — FAIL.
- COST wave-3+ field vDie: 15 (baseline 6), bar <= 12 — FAIL.
- Overall: NO-GO. No confirm run started (pilot failed, so no
  12–16 seed band was named or run).
- Mechanism works cleanly: strict wounded-repeats 14 -> 0;
  rounds-0 mFlee 19 -> 0. Deciding reason per mFlee row (the
  0205 gap, now closed by this arm's recorder): baseline (n=36)
  break-arrival 19, volley 0, break-inround 8,
  signature/trick-or-cap 9; armed (n=68) break-arrival 0,
  volley 0, break-inround 34, signature/trick-or-cap 34.
- But it trades stalemate for blood: field-fight volume 87 ->
  202 in fewer total days (1115 -> 761), national-ever 8/8 ->
  3/8, wins 4/8 -> 3/8, wave-5 0/8 both. The stuck state was
  perversely protecting villagers.
- Proofs: unit scripts/test-ffhold-unit.js (U1/U2/U3 pass;
  arena 1-HP arrival still rounds-0 mFlee, unchanged);
  baseline replication reproduced the fieldfinish-a census
  exactly on all 8 seeds. check.js --quick produced no summary
  line in captured output (not claimed green); the directly
  relevant fieldfight suite ran 26 passed, 0 failed.

## Arm 2 — sim-ffnoflee-a (NOFLEE variant, game-code) — KILLED at pilot, NOT merged

Worker commit 6ea63620d (branch sim-ffnoflee-a, now deleted).
Change, exactly as pre-registered: in FIELD fights only, both
break checks (pre-round near line 795 and in-round near line
1576) fire only when opts.noFlee — i.e. no break-flee in field
fights. Untouched: signature/trick mFlee paths, round-cap,
vFlee, evade, deed credit, tb path, arena (keeps both checks).
Evidence (branch-only, dropped with the branch):
sim-ffnoflee-a.md + perseed-ffnoflee-a/ (16 rows + summary).

- PRIMARY kills leg: 8 band-wide (baseline 0), bar >= 3 — PASS
  on this leg alone.
- PRIMARY focus-conversion leg: 0/3 under BOTH readings (the
  analyzer reading is structurally 0 armed — a metric-design
  error the worker reported, not hid; the header-text type-level
  reading agrees: 73675 chorus_line vs spool, 73677 chorus_line
  vs none, 73678 spool vs chorus_line) — FAIL.
- COST median: 86d (baseline 150d), bar >= 120d — FAIL.
- COST wave-3+ field vDie: 14 (baseline 6), bar <= 12 — FAIL.
- Overall: NO-GO. Kill classification (§14a): CONCEPT-DEAD for
  the maximal variant as scoped. No confirm run started.
- Mechanism: the finish itself works (73675 spool 141->0;
  73678 chorus_line 5->0), just never on a pre-registered focus
  type. Field wave-3+ fights 87 -> 119; field vKill 0 -> 8;
  field mFlee 36 -> 8, with break reasons 0 armed (baseline
  break-line-arrival 19 / in-round-break 8). Kill-log
  cross-check: recorder field vKills (8) = log wild kills (8).
- But the villages collapse: national ever 8/8 -> 0/8, final
  7/8 -> 0/8, table entered 4/8 -> 0/8, wins 4/8 -> 0/8,
  wave-4 5/8 -> 6/8, wave-5 0/8 both, total deaths 261 -> 454.
  The variant is global (wave-1 line 0.25 too), so changed
  fights re-route whole runs via RNG cascade — e.g. baseline
  NEVER-FACED seed 73674 (0 wave-3 fights, 180d, national)
  becomes an armed run with 10 wave-3 fights dead at day 84.
- Proofs: unit RED before the edit, GREEN after; check.js
  --only fieldfight 2 passed, 0 failed; check.js --quick
  finished 280 passed / 7 failed, and all 7 failures were
  re-run on pristine parent code (c986f39f7) and fail
  identically there — pre-existing base failures, not
  regressions (measurement-comparison/proof-update/workflow
  neutrality staleness, mobile-combat-cadence, occupation-panels,
  phone-frame-proof, parity-20261014 gear line).
- Landing rule outcome: BOTH conversion variants NO-GO, so
  neither lands and the tie-break never triggers. No conversion
  code reaches master from this run.

## Arm 3 — sim-arrivaltrace-a (DIAG ONLY, zero src/js) — GO, LANDED

Worker commit 0bedafe50, rebased by the coordinator onto
3aff8d64b (ship-loop tip) as fe5e70580, det-gate re-run green
post-rebase, merged --ff-only to master. Evidence:
evidence/2026-10-24/sim-arrivaltrace-a.md. Corpus:
evidence/2026-10-24/perseed-arrivaltrace-a/ (16 rows +
summary.json). Recorder: scripts/policies/arrivaltrace-diag.js
(ARRIVATRACE=1, observational only). Sweep/proof:
scripts/test-arrivaltrace-diag-sweep.js.

- G1 det-gate PASS (73671: days 93 / gameDays 93 / ts
  identical, no recorder surface, no wraps). G2 neutrality
  PASS (8/8 seeds identical on days/gameDays/ts/starvation;
  faced-agree 8/8, kill-log-agree 8/8). G3 corpus integrity
  PASS (16/16 rows + summary, armed rows carry persisted
  census + event rows, not counts alone).
- THE SOURCE: the palisade raid toll — havenGrowth.js
  havenRaidTick(). When raiders come over a tier-2+ Haven wall,
  each takes Math.max(1, hp - round(maxHp x 0.25)). A monster
  already beaten below that quarter bottoms out at exactly
  1 HP, alive — and the fieldfinish break line then makes it
  unfinishable in the field. Found in code audit and written
  into the pre-registration BEFORE sweeping, not after seeing
  results.
- 73675 chorus_line (focus): last fight d91 ends mFlee at
  43 HP -> census d92/d93 (pre-raid) = 43, single live entity
  -> raid d93, tier 3: pre 43, wall 75 (25% of 300), post
  exactly 1 -> first 1-HP fight d93, mFlee rounds 0. Zero
  spawns / reengages / tbRestores in the window.
- 73678 spool (focus): last fight d73 ends mFlee at 28 HP ->
  census d74-d81 = 28, single live entity -> raid d82, tier 3:
  pre 28, wall 70 (25% of 280), post exactly 1 -> first 1-HP
  fight d82, mFlee rounds 0. Zero competing events.
- Bonus traces, same mechanism: 73672 chorus_line raid d76,
  44->1; 73673 chorus_line raid d98, 41->1. The spool's
  same-day gap decomposes exactly: toll 167-70=97, then the
  defender fight inside the same raid tick, 97->28 (field row,
  mFlee r6). Band-wide, raids fired 77 times with 50 hit-1
  events — a routine producer of 1-HP entities, not a one-off.
- Candidate verdicts: (b) trap/wanderer respawn EXCLUDED with
  control-positive evidence (spawn instrument fired 322 times
  band-wide, zero spawns at 1 HP; fresh spawns are full-HP,
  fled restores carry fled.hp verbatim). (c) second entity
  EXCLUDED for both focus arrivals (exactly one live entity
  of the focus type on every day of both windows; the census
  is proven sensitive — 73672 shows 55 multi-entity focus
  days elsewhere). (a) tb door-flee stash floor explicitly
  LEFT OPEN, not claimed excluded: the instrument fired zero
  times on all 8 seeds (the tableseat policy never flees
  through a door here), so there is no firing control case,
  and absence without a control is not an exclusion under the
  pre-registered standard; by code it cannot create 1 from
  43/28 (it preserves stashed hp, flooring only at <=1), and
  no reengage exists in either window. GO rests on the traced
  chain, not on all-excluded. tbEnd worldOrigin restore
  (audited extra path): fired 52 times band-wide, zero in
  either focus window.

## Cross-arm verdict — the finish works, the villages cannot afford it

Two independent game-code variants, built by separate workers
on the same band, agree: removing the break-flee converts the
stuck state into real kills (HOLD 4, NOFLEE 8, break reasons
-> 0) AND collapses the villages that do the killing
(medians 98d / 86d vs 150d baseline, national-ever 3/8 / 0/8
vs 8/8). The break line is not just a bug — it is load-bearing
as villager protection, because field fights are fought by
villagers who die in them once the monster stands its ground.
Any future finish lever needs a survivability companion
(party, trap, hold, or defender finish — design call, not
assumed here), or it costs more than the stalemate it cures.
Separately, the 1-HP arrival is no longer a mystery: the
palisade raid toll manufactures 1-HP entities routinely, and
the break line then traps them. The remedy is now a design
choice among at least three named options — a toll floor
(the raid never drops a monster below its break line), a
break-line exception (raid-tolled entities do not break-flee),
or a defender finish (the raid itself can kill what it
tolls) — each needing its own pre-registration and its own
arm. Do NOT bundle the remedy with a survivability companion
in one arm; the two failure modes (kills cost too much vs
1-HP entities keep arriving) are now separable and must be
measured separately.

## Wall numbers (this run)

On the tableseat-nowait substrate (arrivaltrace corpus, which
replicates 0205 exactly): national ever 8/8, national final
7/8, table invited 5/8, table entered 4/8, wins 4/8 (all lesser
seat — the full seat remains unreached), wave-4 reach 5/8,
wave-5 reach 0/8, max arc 4, median survival 150 days.
The conversion corpora are ARMED behavior changes, not wall
numbers: HOLD national-ever 3/8, wins 3/8, median 98d; NOFLEE
national-ever 0/8, wins 0/8, median 86d. The standing directive
stands: wave 5 is still 0, wins still only via default-OFF
instruments and the lesser seat, and now the wall has two
measured mechanisms (break-line protection vs finish cost,
raid-toll 1-HP manufacture) instead of one unknown.

## Village assessment (plain words)

The village in this band is alive and competent at everything
except the one thing the scale ladder counts — and this run
proved the price of fixing it naively. Let the monsters stand
their ground and villagers DO finish them: beasts that fled
for two months at 1 HP finally die. But the same villages
then bleed out in the fights they finally fight — fighters
die, villages shrink, national rank collapses, and in the
strongest variant nobody reaches the table at all. The
stalemate was cruel but cheap; the finish is honest but
bloody. Meanwhile the raid toll keeps quietly manufacturing
the very 1-HP ghosts the village cannot finish: raiders come
over the wall, the stakes take their quarter, and a monster
the village already beat nearly to death drops to a single
hit point and walks away from every meeting after. Nobody in
the village ever talks about the monster it cannot finish —
in both conversion replays, no field kill ever appears in
village talk. That silence is a blank of its own: a finish
that nobody remarks on is a finish the village never learns
from.

## Blanks filled or documented

- FILLED (measurement): the 1-HP arrival origin — palisade
  raid toll, traced twice with event chains plus two bonus
  traces, landed as a committed recorder + corpus.
- FILLED (measurement): mFlee-reason capture — both conversion
  recorders carry the deciding reason per mFlee row, closing
  the 0205 gap; the reason splits are in the arm evidence.
- DOCUMENTED (not built): the remedy design choice (toll
  floor vs break-line exception vs defender finish) — next
  arm, own pre-registration; a survivability companion for
  any finish lever — next arm, own pre-registration, never
  bundled with the remedy; a field-kill narration/gossip beat
  (kills never enter village talk); the tb door-flee stash
  floor left open (no firing control case on this band).
- KILLED (no trace on master): HOLD and NOFLEE variants —
  branches deleted, worktrees removed, registry entries
  released as abandoned. Their evidence lives only in this
  coordinator file's summary; the detailed arm files were
  dropped with the branches per the killed-arm rule.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-24/perseed-arrivaltrace-a/*.json' --metrics
national,table,wins,exiled` on the merged corpus: 2 LOUD lines
(national 12 -> 0, wins 16 -> 0, n = 17 files). Both are the
known artifact class, not a real deviation: the script reads
top-level national/wins paths that per-seed rows do not carry
(rows carry nationalEver/entered/won — this corpus's actuals
are national ever 8/8, wins 4/8), and the WINSEAT baseline's
own regime note forbids comparing it to a pre-seat
measurement corpus. Baseline NOT rolled. No new investigation;
the same LOUD lines appeared on the 0205, 1822Z, 1955Z, and
leg2drift corpora for the same reason.

## Infrastructure

- Worktree registration took ~7.8 min for three trees (slow,
  not failed); all registered clean at c986f39f7.
- Master moved twice under this run from sibling lanes plus
  the ship loop: journey establishment r35 + journey landing
  r47 + ship-loop version bump 3572c9a3a-20261025-052418
  (3aff8d64b), then journey social r51 (50e4630b6) on top of
  this run's merge. The arrivaltrace branch was rebased by
  the coordinator INSIDE its own worktree (never the main
  tree) onto 3aff8d64b, det-gate re-run green post-rebase,
  merged --ff-only; the sibling r51 landing on top was
  verified to preserve the merge (fe5e70580 is an ancestor
  of HEAD). Zero file overlap in all cases; no conflicts, no
  force, no ref surgery.
- Safe-commit index clobber hit BOTH conversion workers'
  commits and the trace worker's commit (committed files
  shown as staged-deleted, bytes identical to HEAD) —
  repaired by each worker with the cacheinfo recipe, commits
  intact, verified clean by the coordinator before merge
  (trace) or drop (conversions). No clobber on the coordinator
  merge (verified with `git status --short` empty).
- Sweep-process deaths hit all three arms the same way (the
  known vanishing class); all three recovered from
  incremental per-seed rows without re-running completed
  seeds. Lesson restated: never redirect a sweep log to /tmp;
  per-seed invocation is the safer shape.
- No EPERM flap blocked this run's commits, rebase, or merges
  (contrast 1630Z/1822Z). The flap class remains a standing
  risk, not a finding of this run.
- Pre-flight reap removed nothing (all active trees carry
  uncommitted changes or fresh heartbeats); sibling B trees
  untouched throughout. Loop B remained live on food-economy
  for the whole run (its 0335Z claim still live at closeout).

## Metric review

- The pre-registered bars worked as written on all three
  arms; no mid-run re-scoring. The cost bars did their job:
  both conversion variants passed the kills leg and failed
  honestly on cost + focus-conversion, which is exactly what
  a cost bar is for — without it, NOFLEE's 8 kills would
  have read as a win while the villages collapsed.
- The focus-conversion leg is brittle under cascade, and the
  next run should redesign it before reusing it: both
  variants converted real kills on NON-focus types while
  scoring 0/3 on focus types, because changed fights re-route
  whole runs via RNG cascade (baseline NEVER-FACED 73674
  gains 10 wave-3 fights armed). A band kill bar alone cannot
  tell a conversion from a re-route. Proposed for the NEXT
  run's pre-registration, not changed post-hoc here: a
  directed probe (a scripted below-line meeting with a named
  entity) plus the band kill bar, and per-100-fights death
  rate (HOLD baseline 6.9 -> armed 7.4, worker-proposed) as a
  cascade-resistant cost metric alongside median/vDie.
- The ffnoflee analyzer's structurally-0 armed reading of
  focus conversion is a metric-design error the worker
  reported, not hid; the header-text type-level reading
  agrees (0/3), so the verdict stands, but the analyzer must
  be fixed before any arm reuses that reading.
- "Median days" as a cost bar is cascade-sensitive (a
  re-routed early death moves it); it stays as a guard, not
  as the verdict, with per-100-fights rate proposed alongside
  it. Stated again so the next run does not mistake the
  median for the proof.
- Telemetry-check as specified reads paths the per-seed rows
  do not carry; until it reads nationalEver/entered/won (or
  the baseline regime is restated), its LOUD lines on
  measurement corpora will keep being artifacts. Proposed
  for the NEXT run's pre-registration, not changed post-hoc
  here.

## Convergence state

Axis scale-onramp: stays converging (NOT converged). The
mechanism behind the wall is now measured on both sides — a
wounded monster below its break line flees before the first
strike, forever; the palisade raid toll routinely manufactures
those 1-HP entities; and removing the flee converts kills at
a village-collapsing price — but no fix has landed, wins are
still only via default-OFF instruments and the lesser seat,
the full seat is still unreached, and wave 5 is still 0.
The directive stands until the tracker records this axis
converged on measured evidence. Next blanks, in order:
(1) the remedy design choice (toll floor vs break-line
exception vs defender finish), own pre-registration;
(2) a survivability companion for any finish lever, own
pre-registration, never bundled with (1); (3) a field-kill
narration/gossip beat. food-economy stays converging
(untouched; sibling B loop). Rotation left at 3
(convergence work does not cycle it). Claim deleted; lock
deleted. Evidence: this file + sim-arrivaltrace-a.md
(commit fe5e70580, merged locally pending ship). Killed
arms (HOLD b13ac41ca, NOFLEE 6ea63620d) left no trace.
