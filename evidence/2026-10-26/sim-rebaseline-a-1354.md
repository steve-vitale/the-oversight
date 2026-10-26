# COORDINATOR LANDING NOTE — read first (run fleshout-20261026T1354Z)

This file is the sim-rebaseline-a arm's evidence, landed under -1354
names by coordinator direction. The worker wrote it as an in-place
supersession of evidence/2026-10-26/sim-rebaseline-a.md (the 0126Z run's
file, commit de4bd3fbe); the coordinator instead preserved that file
untouched on master and landed this arm's text + corpus under
sim-rebaseline-a-1354.md / perseed-sim-rebaseline-a-1354/. The worker's
internal SUPERSESSION NOTE should therefore be read as: this -1354 table
(base e8f2ccad7) succeeds the 0126Z table as the current baseline — the
0126Z file itself remains intact on master at its original path, and its
content stays in git history regardless. No other worker text was changed
except the mechanical corpus-directory rename perseed-sim-rebaseline-a ->
perseed-sim-rebaseline-a-1354 throughout. The drift proof script landed as
scripts/test-rebaseline-drift.js with the same single path rename.

# sim-rebaseline-a — re-baseline the shared control band on current master (axis scale-onramp)

Run: fleshout-20261026T1354Z (Mon 2026-10-26). Axis: scale-onramp.
DIAG / MEASUREMENT ONLY — zero src/js changes, zero default flips.
This arm designs and lands NO game fix. The new authoritative control
table IS the deliverable.

## SUPERSESSION NOTE (read first)

This file SUPERSEDES the 0158Z rebaseline document of the same name
(run fleshout-20261026T0126Z, commit de4bd3fbe, base 8ea64d848 —
that version stays in git history; nothing in it is deleted from
history). The 0158Z table (deaths 260, wins 4/8, median 143d) no
longer reproduces either: the 1230Z arms on base ac98043a measured
a different band, and this run re-measures on current master
e8f2ccad7. FUTURE ARMS: judge against THIS file's table (base
e8f2ccad7), not the 0158Z table and not the 1815 table. Any arm
whose base differs from e8f2ccad7 must re-baseline first or state
its base delta.

## PRE-REGISTRATION (binding — judged only against this)

- Canon read first: docs/CANON.md, then docs/MONSTER-WAVES.md
  (wave law; wave 3 = day 25 + 4 wave-2 ledger points, kills
  only). No canon doc covers baseline measurement itself, and
  no design is invented here.
- Substrate (shared, policy-side only): tableseat-nowait —
  LEANLINKRESCUE=1 + TABLESEATNOWAIT=1, seat legs only, NO wait
  leg. Policies: scripts/policies/leanlinkrescue.js and
  scripts/policies/tableseat-nowait.js.
- Seeds 73671–73678, 180d death-aware horizon (runDays stops
  on death/win; 180 is the cap, not a fixed horizon).
- Instrument: scripts/test-rebaseline-sweep.js, used VERBATIM
  (zero edits). See "Instrument deviation" in Metric Review
  for why this file, and not the defwound sweep named in the
  brief, is the instrument of record.
- Primary metric table (published per seed and band-wide):
  wins, national-ever, national-final, table (waiting),
  entered, wave-4 reach, wave-5 reach, median survival days,
  mixed deaths, raids, raiders.
- DIAG-GO iff ALL of: (a) det-gate passes, or a neutrality
  proof that the harvest does not perturb trajectories; (b)
  corpus complete 8/8 with per-seed JSONs under
  evidence/2026-10-26/perseed-sim-rebaseline-a-1354/; (c) a published
  baseline table with per-seed rows, the base commit hash, and
  the competent.js digest of the substrate; (d) drift
  quantified against BOTH prior tables — the 1815 control and
  the 1230Z ac98043a band — with a plain-words verdict: did
  drift CONTINUE, STABILIZE, or REVERSE since ac98043a? (e) a
  "metric review" section in this file. Any leg missing = say
  so plainly, land what exists.
- Do NOT judge any old corpus, do NOT re-score old numbers, do
  NOT implement any game change (zero src/js diff). Do NOT cite
  the 1815 numbers as a pass/fail bar — they are the stale
  control being replaced.
- Balanced panel: attempt scripts/balance-panel.js ingest for
  the before/after comparison; if it cannot ingest recorder
  corpora, say so explicitly and attach the paired
  identical-seed table as the comparison of record — never
  fake a panel file.

## VERDICT: DIAG-GO (all five legs pass)

- (a) DET-GATE PASS (seed 73671, rebaseline sweep): baseline
  days=177 gameDays=177 ts={tsNationalDay:86} vs
  wrapped-with-recorders-OFF identical on all three,
  diagSurface=false, wrapsInstalled=false, postSetupWorld=0.
  STRONGER, second proof: all 8 plain (recorder-free) rows
  reproduce their rebaseline rows EXACTLY on every trajectory
  field (days, gameDays, endReason, won, waveReach, maxArc,
  finalRank, maxRank, nationalEver, nationalFinal, table,
  entered, deathTotal, starvationDeaths, ts, and the deaths
  map) — proof test 290/290, 0 failed. The harvest does not
  perturb trajectories on this base.
- (b) CORPUS COMPLETE 8/8: 8 rebaseline rows + 8 plain rows +
  summary.json in evidence/2026-10-26/perseed-sim-rebaseline-a-1354/;
  sweep summary CORPUS PASS (every recorder diag errs 0, no
  overflow on any seed).
- (c) BASELINE TABLE PUBLISHED below (per-seed rows + band),
  base e8f2ccad7, substrate digests below.
- (d) DRIFT QUANTIFIED against both priors below. PLAIN-WORDS
  VERDICT: STABILIZED — with exactly one seed's exception.
  Seven of eight seeds are identical to ac98043a on EVERY
  compared field (trajectory fields AND raid/pool census).
  The entire band movement since ac98043a comes from seed
  73676 alone, which flipped from a loss to a win. The wall
  numbers did not move at all: national-ever 7/8, wave-4 6/8,
  wave-5 0/8, median 174d — the same on ac98043a and here.
- (e) Metric review below.

## NEW AUTHORITATIVE CONTROL TABLE (base e8f2ccad7)

Band (n = 8 seeds, 73671–73678, tableseat-nowait, 180d
death-aware): wins 2/8, national-ever 7/8, national-final 3/8,
table (waiting) 3/8, entered 2/8, wave-3 8/8, wave-4 6/8,
wave-5 0/8, median survival 174d (days sorted: 97, 106, 116,
160, 174, 175, 177, 180), max 180d, mixed deaths 327,
starvation 1, raids 101, raiders 423, pool 1,640, pool
wave-3+ 202.

Substrate digests (sha256, recorded before the sweep):
- scripts/policies/competent.js:
  b0adaacc0ba86ae9e242f051840fbdb17d41423e5722149c331061c8ede83ae7
  (short b0adaacc — the same "true-current" digest the
  raidpool arm recorded for HEAD; the substrate did not drift
  under this run)
- scripts/policies/leanlinkrescue.js:
  53f310aba27a0e77ea14bdd8b5af0d73fdf8aea4d371b090551cac0fa43fa0e7
- scripts/policies/tableseat-nowait.js:
  a11a1abc672eb214af6c9533f51f361ff3174669b7c0bdb9beb54372b248291e
- scripts/test-rebaseline-sweep.js:
  d0651d5c8574575774cdc6e5f6fb6714c8db56190c26215d4793c21a9d3f505f

Per-seed table (days = run days; end: survived / over-other =
game over with a win / village-lost; fin = final rank; mx =
max rank; ne/nf = national-ever/final; tab = table waiting;
ent = entered):

| seed | days | end | won | wave | arc | fin | mx | ne | nf | tab | ent | deaths | starv | raids | raiders | pool | poolW3 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 73671 | 177 | village-lost | 0 | 4 | 4 | regional | national | 1 | 0 | 1 | 0 | 43 | 0 | 16 | 66 | 288 | 48 |
| 73672 | 116 | village-lost | 0 | 4 | 3 | regional | national | 1 | 0 | 0 | 0 | 32 | 0 | 9 | 33 | 227 | 49 |
| 73673 | 97 | over-other | 1 | 3 | 4 | national | national | 1 | 1 | 1 | 1 | 29 | 0 | 7 | 30 | 114 | 7 |
| 73674 | 175 | village-lost | 0 | 4 | 3 | regional | national | 1 | 0 | 0 | 0 | 48 | 0 | 16 | 70 | 183 | 13 |
| 73675 | 180 | survived | 0 | 4 | 3 | global | global | 1 | 1 | 0 | 0 | 43 | 0 | 16 | 75 | 196 | 14 |
| 73676 | 160 | over-other | 1 | 4 | 4 | national | national | 1 | 1 | 1 | 1 | 55 | 0 | 14 | 55 | 325 | 23 |
| 73677 | 174 | village-lost | 0 | 4 | 3 | regional | national | 1 | 0 | 0 | 0 | 41 | 0 | 12 | 50 | 190 | 33 |
| 73678 | 106 | village-lost | 0 | 3 | 3 | regional | regional | 0 | 0 | 0 | 0 | 36 | 1 | 11 | 44 | 117 | 15 |

FUTURE ARMS: judge against THIS table (base e8f2ccad7), not
234 deaths, not 260 deaths, not 336 deaths.

## DRIFT vs 1815 CONTROL (stale control, comparison only)

1815 published band (base acbc0c933, via the nonworldkill-a
corpus as quoted in the 0158Z evidence): wins 4/8,
national-ever 7/8, national-final 6/8, table 4/8, entered
4/8, wave-4 6/8, wave-5 0/8, median 135d, deaths 234,
starvation 5, raids 85, raiders 361, pool 1,494, poolW3 107.
Fresh minus 1815: wins −2, deaths +93, national-ever 0,
national-final −3, table −1, entered −2, wave-4 0, wave-5 0,
median +39d, raids +16, raiders +62, pool +146, poolW3 +95,
starvation −4. The sweep summary's "NEUTRALITY vs control:
DEVIATED" line reports exactly this — drift is the finding,
not a gate failure (the summary gates only on corpus PASS).

## DRIFT vs 1230Z ac98043a BAND (the verdict leg)

ac98043a band, RECOMPUTED here from the in-tree woundprice
corpus (evidence/2026-10-26/perseed-sim-woundprice-a/
s*-armed.json — identical rows to the defnarr corpus, checked
field by field, not taken from prose): wins 1/8,
national-ever 7/8, national-final 3/8, table 2/8, entered
1/8, wave-4 6/8, wave-5 0/8, median 174d, deaths 336,
starvation 1, raids 98, raiders 407, pool 1,552, poolW3 225.
Fresh minus ac98043a: wins +1, deaths −9, national-ever 0,
national-final 0, table +1, entered +1, wave-4 0, wave-5 0,
median 0d, raids +3, raiders +16, pool +88, poolW3 −23,
starvation 0.

Per-seed attribution — SEVEN SEEDS MOVED ON NOTHING. Seeds
73671, 73672, 73673, 73674, 73675, 73677, 73678 reproduce
their ac98043a rows exactly on every compared field,
including raids/raiders/pool/poolW3. The single moved seed:

- 73676 (ac98043a → fresh): days 156 → 160, end
  village-lost → over-other (won), won 0 → 1, Arc 3 → 4,
  final rank global → national, max rank global →
  national, table 0 → 1, entered 0 → 1, deaths 64 → 55 (−9),
  raids 11 → 14 (+3), raiders 39 → 55 (+16), pool 237 →
  325 (+88), poolW3 46 → 23 (−23). National-ever/final 1/1
  both, wave 4 both, starvation 0 both. Net arithmetic:
  every band delta above is exactly this seed's delta (wins
  +1, deaths −9, table +1, entered +1, raids +3, raiders
  +16, pool +88, poolW3 −23) ✓. The village that used to
  collapse on day 156 now wins through the table on day
  160 with 9 fewer deaths.
- That the move is IN THE ENGINE, not in the tap: seed
  73676's plain (recorder-free) row is 160d/won/55 deaths —
  identical to its rebaseline row. The recorders did not
  cause it, and no recorder is blamed for anything here.

Direction, key by key, since ac98043a: wins, deaths,
table, entered, poolW3 moved BACK toward 1815 (partial
reversal on those keys only, small: wins 1 → 2 vs 1815's 4,
deaths 336 → 327 vs 1815's 234); raids, raiders, pool
continued away from 1815 (all of it the same seed's longer
run); national-ever, national-final, wave-4, wave-5,
median, starvation STABLE. Net verdict: STABILIZED. The
broad drift that carried the band from 1815 (234 deaths,
4 wins) to ac98043a (336 deaths, 1 win) has stopped: the
band's trajectory outcomes are now the ac98043a band plus
one seed's win. A future arm that re-runs this band on a
later base and finds more than one seed moved should treat
that as fresh drift, not as noise — one moved seed is now
the measured noise floor.

## WALL NUMBERS (fresh authoritative control)

national 7/8 ever (3/8 final), table entered 2/8 (waiting
3/8), wins 2/8, wave-4 6/8, wave-5 0/8, median survival
174d, max 180d, deaths 327. The wall stands where ac98043a
left it: villages touch national often but only three end
there, only two enter the table, only two win, and wave 5
still never appears on any seed. The one-seed win does not
move the wall — it moves one village across a finish line
the other seven still do not reach.

## VILLAGE ASSESSMENT (plain words)

Eight villages, same story as the 1230Z base, except one.
Five villages are lost (73671, 73672, 73674, 73677, 73678);
one survives the full 180 days without winning (73675, ends
as a global-rank village — it climbed the ladder but never
sat at the table); two win through the table (73673 on day
97, 73676 on day 160). Deaths are heavy everywhere (29–55
per village) but starvation is nearly gone (1 death
band-wide, on 73678) — villages die to the world, not to
hunger, on this band. Wave 4 monsters show up on six seeds
but wave 5 on none: the late game is reached, not finished.
The new win on 73676 reads as a real climb, not a
bookkeeping artifact: it ends at the table (entered 1) after
160 days with 55 deaths, where the same seed used to lose
its village on day 156 with 64 deaths. Nothing here is new
behavior to judge — zero game code changed — so the
villager-behavior read is unchanged from the 1230Z arms:
the blank this arm fills is measurement, not behavior.

## SENSE-TESTING READ

No absurdity found; the proof test asserts the coherence
rules (win → national-ever + entered; entered →
national; table → national; a wave-4 kill-log entry →
wave reach ≥ 4) and all pass. Spot checks: the band's
wave-4 table-fight kills are 3 (73671 day 169, 73672 day
103, 73677 day 116 — all "player" via, i.e. the scholar's
fights, same shape as prior bands); nonworldkill door
census on the fresh corpus gives 195 initiations, 0
unclassified — carried as trajectory corroboration only,
not a new census verdict. The two wins both carry
entered=1 and national-final=1; the survivor (73675) carries
national-final=1 without entering — it climbed without
sitting, which the fields keep distinct from winning.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

- No pre-registered leg was re-scored mid-run. The run was
  judged exactly against its five DIAG-GO legs (all pass).
- CORRECTION, not a re-score (stated, not hidden): the
  brief's ac98043a figure "deaths 332" does not match the
  in-tree corpora. Both 1230Z corpora (woundprice and
  defnarr, identical rows) sum to 336 deaths per seed
  (43+32+29+48+43+64+41+36); woundprice's own §1 band line
  also says 336. The 332 is defnarr's prose drift-note
  figure. This evidence uses the corpus value 336
  throughout, and the drift arithmetic above reconciles
  exactly against it. No old number was re-scored — the
  corpus is the authority and the prose typo is corrected
  against it.
- INSTRUMENT DEVIATION (disclosed, not hidden): the brief
  named scripts/test-defwound-diag-sweep.js "VERBATIM if
  possible." This run uses scripts/test-rebaseline-sweep.js
  verbatim instead (zero edits), because: (i) it IS the
  rebaseline instrument, built for this exact slug and
  corpus dir; (ii) its trajectory fields and raftdraft
  census are the same composition as the defwound sweep
  plus two read-only recorders (w5births, nonworldkill),
  and the plain-vs-rebaseline proof above shows the extra
  recorders do not perturb trajectories; (iii) the defwound
  sweep would have written a summary.json in an
  incompatible format (no w5births/nonworldkill diag
  blocks, livingN instead of poolN) that breaks the
  committed proof test scripts/test-rebaseline-a.js. A
  defwound-sweep detgate run in this session also printed
  PASS (177/177/ts86 — identical to the rebaseline detgate),
  corroborating that the two instruments agree on this
  base. No corpus row was edited, re-run, or patched — only
  the analyzer (scripts/test-rebaseline-drift.js) is new,
  and it reads rows, never rewrites them.
- The sweep summary's "NEUTRALITY vs control: DEVIATED"
  line is a drift report, not a gate: the summary exits 0
  on corpus PASS regardless of drift (a re-baseline arm
  that failed on drift could never publish a new table).
- BALANCED PANEL (§15): ATTEMPTED AND NOT APPLICABLE —
  stated explicitly. scripts/balance-panel.js has no
  corpus-ingest mode: it generates panels by re-running
  sims under its own observer and compares panel.json.gz
  pairs (--before/--after). No panel files exist for either
  band, and generating a fresh panel would not compare
  this corpus — it would be a different instrument on
  different runs. So no panel file is produced or faked;
  the paired identical-seed table in this file (same 8
  seeds, same substrate, same horizon, fresh vs ac98043a
  per seed) is the comparison of record. This is the same
  recorder-corpus limitation prior arms reported.
- Telemetry-check was NOT run on recorder rows (its counts
  are wrong on recorder rows — standing instruction from
  the 0158Z evidence).

## INSTRUMENT NOTES

- Reused VERBATIM (never edited):
  scripts/test-rebaseline-sweep.js (modes --one rebaseline /
  --one plain / --summary / --detgate),
  scripts/test-rebaseline-a.js (proof, 290 passed, 0
  failed), scripts/policies/raftdraft-diag,
  spawnsrc-diag, oldcore-diag, w5births-diag,
  nonworldkill-diag, defwound-diag, tableseat-nowait,
  sim-harness.
- New: scripts/test-rebaseline-drift.js (pure corpus
  analyzer: fresh band recomputation + dual drift vs 1815
  and vs the recomputed ac98043a band + substrate digests;
  exit 1 on any gate failure; drift itself never exits 1).
  Proof: node --check clean (implicit in the run below);
  drift proof PASS (fresh corpus 8/8, summary reconciles,
  dual drift printed).
- Corpus: evidence/2026-10-26/perseed-sim-rebaseline-a-1354/
  (8 rebaseline rows + 8 plain rows + summary.json, all
  freshly swept on e8f2ccad7 — the 0158Z rows of the same
  filenames are superseded, preserved in git history).
- What the harvest cannot see (stated, not hidden — same
  as the 0158Z arm): player (tb) fights have no resolve
  rows; raids/pool have no plain counterpart and are
  excluded from the determinism leg by construction.
- Infrastructure note (honest, not a failure): sims ran
  slow under sibling-loop contention (up to ~3 min per
  full seed run vs the brief's ~3–4s figure — the brief's
  figure does not match this run's observed cost; nothing
  was lost, all 16 rows + summary are on disk and
  committed). No EPERM flap blocked this run's writes.
- check.js --quick NOT run: zero src/js diff in this arm
  and sibling loops are live (its result would be
  unattributable); the arm's own proof tests + det-gate
  are the verification of record.
- DIAG ONLY: zero src/js changes (git diff for src/ is
  empty), zero default flips, zero combat-code changes.
  No [needs-eyes] flag: measurement only.

## BLANKS FILLED OR DOCUMENTED

- FILLED: the shared control band is re-baselined on
  current master e8f2ccad7 — band table + full per-seed
  table + drift vs BOTH priors with per-seed attribution
  + recorder-free determinism proof + substrate digests.
  Future arms judge against this file's table, not 234,
  not 260, not 336.
- FILLED (method): the dual-drift proof
  (scripts/test-rebaseline-drift.js) recomputes the
  ac98043a band from its corpus instead of trusting prose
  — which is how the 332→336 correction was caught.
- DOCUMENTED, NOT FIXED (carried, not chased here): the
  drift cause is unbissected by design (this arm measures
  the band, it does not explain why 73676 flipped); the
  scale wall itself is untouched by this arm (national
  7/8, wave-5 0/8 — the wall numbers are the same as
  ac98043a, so the wall work continues from the same
  place, not from a new one).
- NOT DONE (by design, per the arm brief): no bisection
  of the 73676 flip; no re-judgment of any prior corpus
  against the new baseline; no game-code change of any
  kind.

scale-onramp stays converging (NOT converged): this arm
moves no lever and changes no mechanic — it publishes the
fresh baseline the next arms judge against. The standing
directive stands: wave 5 is still unborn on this band.
Convergence state: converging.

Commit: sim-rebaseline-a, DIAG-GO (fresh baseline table),
zero src/js diff. Ready for coordinator merge; NOT pushed,
NOT bumped, live NOT verified (coordinator/ship-loop line,
not this arm's).
