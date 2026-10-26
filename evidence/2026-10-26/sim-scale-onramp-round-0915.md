# sim-scale-onramp-round-0915 — coordinator evidence (axis scale-onramp)

Run: flesh-out loop A, 2026-10-26, run fleshout-20261026T0915Z.
Axis scale-onramp (converging, NOT converged — the standing directive
stands). Loop B live on food-economy for the whole run (0630Z claim,
fishfallback + racksvoice-gate, NOT touched; B landed mid-run, see
Infrastructure). This run took the 0830Z run's named next blanks in
order: (1) the wider drift bisect, (2) the re-anchored transient arm.
Both arms DIAG ONLY: zero src/js, zero default flips, zero game-code
changes. Merged locally, pending ship — the ship loop owns bumps,
pushes, and live verification.

## Pre-registration (per arm, in each arm's evidence header)

- Arm sim-driftwide-a: wider drift bisect on seeds 73671–73678,
  tableseat-nowait substrate (LEANLINKRESCUE=1, TABLESEATNOWAIT=1),
  180d death-aware. Candidate set pre-registered before any sweep:
  C1 src/data+src/js delta, C2 policy/substrate history (competent.js
  delegation chain), C3 harness inputs, C4 base misattribution, C5
  instrument-coverage delta (starvation regex, NEWPAIRED pairing;
  raids/pool explicitly NOT adjudicated — plain rows carry no
  raftdraft census). DIAG-GO = one candidate CONFIRMED, or every
  candidate EXCLUDED (raids residue excepted). Three columns, one
  script, differing ONLY in scripts/policies/competent.js swapped
  from git: colA current (cook+fish fallbacks), colB base-era
  8ea64d848 (neither fallback), colC cook-only 3701dfa4a (conditional
  on colA==current band and colB==0126Z band).
- Arm sim-transient2-a: re-anchored transient hunt on verified-fresh
  band 73901–73908 (freshness verified from evidence filenames +
  dated .md files before any spend: only the two reservation
  mentions, zero perseed filename hits). Anchor first (plain
  tableseat-nowait + pre/post-daily snaps), then hunt
  (driveoff-clean shape + same snaps). DIAG-GO = one genuine
  transient with rise day AND overnight fall day snap-located,
  OR a full-band negative with snap coverage proven for all 8
  seeds plus the anchor table published. Stop rule: broken anchor
  or failed neutrality stops the hunt (0830Z lesson: no stale
  anchor, no re-use of 73673 as a positive control).

## Arm 1 — sim-driftwide-a: DIAG-GO, C2 CONFIRMED in two steps

Commit af9a53160 (rebased onto B's tip d8efdb566; proof 97/97
pre-B-landing, 96/1 on merged master — the 1 failure is the
HEAD-sensitive C1 diff leg, see Infrastructure; verdict legs
pass). Corpus: evidence/2026-10-26/perseed-sim-driftwide-a/
(24 rows + 2 reruns + summary).

- colB (base competent) reproduces the 0126Z band EXACTLY, per-seed
  exact on every trajectory field, deaths map, ts, pop/pantry:
  deaths 260, natEver 6/8, natFinal 5/8, table 4/8, entered 4/8,
  wins 4/8, wave-4 5/8, wave-5 0/8, median 143d, starvation 9.
- colC (cook-only) reproduces the 301 band EXACTLY, per-seed exact
  against both the natpair rows and the r54bisect colA rows:
  deaths 301, natEver 8/8, natFinal 5/8, table 4/8, entered 4/8,
  wins 4/8, wave-4 5/8, wave-5 0/8, median 143d, starvation 2.
- colA (true current, cook+fish) is a NEW band, measured here for
  the first time: deaths 294, natEver 8/8, natFinal 5/8, table 4/8,
  entered 3/8, wins 3/8, wave-4 4/8, wave-5 0/8, median 143d,
  starvation 2.
- Decomposition, no trajectory residue: cook fallback moves
  0126Z -> 301 (deaths +41, natEver +2, starvation -7); fish
  fallback moves 301 -> true-current (deaths -7, wins -1,
  entered -1, wave-4 -1, starvation unchanged). The fish
  fallback is NOT a pure improvement here: it flips two winners
  to losses (73675, 73676) and one loss to a win (73678).
- CORRECTION to a shared label (not a re-judgment): the "current
  band" (301) in the brief and in natpair/drawwave/r54bisect
  evidence is the COOK-ONLY band. The r54bisect corpus was
  carried across its rebase without re-sweeping, so its rows
  kept the old substrate silently. Future arms must cite colA
  (294/3 wins) as true-current, colC (301/4 wins) as cook-only,
  colB (260/4 wins) as 0126Z. Prior verdicts stand (natpair
  pairing, drawwave appropriateness, r54 exoneration) — only
  the substrate label was wrong.
- Per-candidate: C1 EXCLUDED (sweep-time src diff exactly
  conversation.js grace beat + build.js version string;
  src/data empty; colB reproduction from current src/js is
  independent confirmation); C2 CONFIRMED (tableseat-nowait,
  leanlinkrescue, leanlink byte-identical base..HEAD; the ONLY
  substrate change is competent.js, exactly the two staffing
  fallbacks); C3 EXCLUDED (one script/harness for all columns;
  sim-harness + sweep-compare diffs empty); C4 EXCLUDED
  (8ea64d848 verified as the 0017Z coordinator commit; header
  matches; colB reproduces the anchor rows); C5 PARTIALLY
  EXCLUDED (starvation regex identical /starv|hunger/i;
  NEWPAIRED holds on all 24 rows; raids/pool residue OPEN —
  needs a raftdraft-census rerun under colB/colC, and colA
  has no raids/pool measurement yet).
- One disclosed pre-registration deviation: the instrument gate
  (colA reproduces r54bisect colA) failed on 73671, and a single
  diagnostic colC seed ran out of column order to attribute it.
  The diagnostic proved the instrument valid and the comparator
  mislabeled (cook-only, not current). No threshold changed;
  band rules applied as written with corrected labels.

## Arm 2 — sim-transient2-a: DIAG-GO, proven full-band negative

Commit 20ce5fb7d (proof 54/54 post-rebase and on merged master).
Corpus: evidence/2026-10-26/perseed-sim-transient2-a/ (16 rows +
summary + 4 detgate artifacts).

- Anchor table (plain tableseat-nowait, base fbcb4e0b8, band
  73901–73908 — the comparison base for future transient work,
  judged on its own rows, never against 0126Z or 73671): won 6/8,
  median 109d, max 137d, natEver 7/8, natFinal 7/8, table 6/8,
  entered 6/8, Arc IV 6/8, wave-4 5/8, wave-5 0/8, deaths 180,
  starvation 3. One stall noted: 73905 reaches global, hears
  "the table has your name now," never gets invited, lost day 127.
- Hunt band (driveoff-clean + snaps, same seeds/base): won 1/8,
  median 170d, natEver 7/8, natFinal 6/8, table 1/8, entered 1/8,
  Arc IV 1/8, wave-4 5/8, wave-5 0/8, deaths 206, starvation 4,
  46 feast draws, all 46 driven off by the watch. Classes:
  agree 8/8 in both arms; transient-ts-only, snap-only,
  final-only, post-explained-transient, unclassified all 0.
- Why the negative is proven, not 0/8: 16/16 rows classified
  agree with NEWPAIRED + MAXAGREE true; every rise's first
  morning snap-counted (postNationalDay == tsNationalDay AND
  preNationalDay == tsNationalDay + 1 on all 14 ts-present rows);
  rank traces cover every day (length == days, or days-1 on 3
  final-partial-day rows); overnight falls ARE detectable
  (3 hunt seeds: 73902 day 92, 73906 day 99, 73908 day 141 —
  all pre-snapped earlier, so snap-counted, not transient).
  The window was exercised end-to-end and is empty on this band.
- Detgates MATCH on both arms (73901: 23/23 days, 8/8 deaths,
  ts null/null). The anchor-vs-hunt trajectory differences are
  the policy difference (driven-off draws change play), not
  instrument perturbation.
- Sense read (transcripts, not counts): 73906's realm dissolves
  day 98 aloud ("The realm came apart... The climb starts
  over"), dawn snap day 99 reads regional, village lost day 143;
  Tomás of The Red Table walks in, asks for food, gets silence,
  walks back — "They'll remember the silence." Driveoff lines
  are named villagers with brands, not status lines. No robotic
  or repeated dialogue found in the sampled lines.

## Wall numbers (judge future arms against driftwide colA)

True-current band (73671–73678, tableseat-nowait): national-ever
8/8, national-final 5/8, table invited 4/8, entered 3/8, wins 3/8
(lesser seat only), wave-4 4/8, wave-5 0/8, full seat 0/8,
Arc IV 4/8, median survival 143d, max 180d, deaths 294,
starvation 2. Transient anchor band (73901–73908): national-ever
7/8, wins 6/8, wave-5 0/8, median 109d, deaths 180. The wall
stands where it stood, one step worse on true current: wave 5
still unborn, the full seat still untouched, wins 3/8 not 4/8.
Villages reach national 8/8 yet still die — scale-and-die, not
fail-to-scale.

## Village assessment (plain words)

Three times the same eight villages lived, and each time the
kitchen staff changed, the villages changed with it. With
nobody reliably staffing the cook fire or the creek, two
villages stalled out hungry while four won through the lesser
seat. Once a cook could be found when the first choice refused,
the stalled villages climbed — and deaths rose, because villages
lived long enough to fight more battles. Then the creek got the
same treatment, and the story reshuffled rather than improving:
two villages that had just learned to win fell apart again,
while a village that had died under cook-only now wins. Better
staffing does not mean better villages one for one — it means
different villages, because who eats, who fishes, and who stands
in the arena all change downstream. And on the fresh band, the
transient hunt found no village that rose to national and fell
overnight uncounted: every rise was counted the next morning,
every fall happened in the open with a spoken reason. The two
blanks this run fills are measurement, not behavior — the drift
that haunted three runs now has a name (two staffing fallbacks,
in order), and the transient window is proven observable and
empty on this band.

## Infrastructure

- Container EPERM flap: blocked transient2 worktree registration
  from ~09:24Z for ~75 minutes (hidden fallback error behind
  "branch already exists"; branch shell verified at master HEAD,
  0 ahead; no ref surgery forced; registered clean once the
  flap cleared). The same flap truncated driftwide's
  scripts/policies/competent.js to 0 bytes on a `git checkout --`
  restore (recovered from git, sha-verified b0adaacc; final
  tree verified HEAD content; competent.js variants restored
  after their columns — zero policy diff in the final commit).
  Safe-commit index clobber: NOT hit on either worker commit
  this run (both verified by file list + status clean); the
  coordinator commit below is checked the same way.
- Loop B landed mid-run, twice: racksvoice-gate-b adoption
  (758a9d8bc + verification note 750b3d9f3) and its coordinator
  evidence (d8efdb566). Both arm branches were based on
  fbcb4e0b8, so ff-only correctly refused each time; each
  branch rebased clean in its own worktree (driftwide twice,
  transient three times — the last transient rebase stacked
  onto the driftwide merge tip), proofs re-run green after
  every rebase, zero file overlap with B's files.
- Driftwide proof on merged master: 96 passed / 1 failed. The
  single failure is the HEAD-sensitive C1 leg ("src diff is
  exactly build.js + conversation.js"): B's racksvoice-gate
  landing added src/js/game.js (+22/-5) after driftwide's
  columns ran, so the diff is now 3 files, not 2. Verdict legs
  (colB == 0126Z, colC == 301) pass. This does NOT overturn
  C1's exclusion, which also rests on colB's per-seed
  reproduction from the sweep-time src/js; it is recorded
  here as a HEAD-moved leg, not a verdict failure, and the
  test is NOT weakened to green.
- check.js --quick NOT re-run: zero src/js in both arms, own
  proofs green on merged master, standing pre-existing profile
  (279/8) just re-attributed by B's 0935Z run on the same base.
- Pre-flight reap: clean (7/16 active at start, all sibling
  trees protected, none removed). Final reap: see closeout
  note below. Main tree clean at closeout except this evidence
  file (committed below).

## Telemetry deviation check (body step 10)

Ran per the body on both corpora against
hidden_files/telemetry-baselines/scale-wall.json, metrics
national,table,wins,exiled. Driftwide corpus: 2 LOUD lines
(national 12->0, wins 16->0, n=27 files). Transient corpus:
2 LOUD lines (national 12->0, wins 16->0, n=21 files). All 4
are the known ingestion-shape artifact class (the checker
reads top-level national/wins keys that sweep/recorder rows
do not carry; rows carry nationalEver/won/table; actuals
driftwide colA national-ever 8/8 wins 3/8, transient anchor
national-ever 7/8 wins 6/8). Baseline NOT rolled. No new
investigation item.

## Metric review (§14 — binding, no mid-run re-scores)

- Driftwide: judged exactly against its header. colB==0126Z
  and colC==301 both true on the letter AND per-seed exact.
  colA==301 is false and is reported as a finding (new
  true-current band), not scored against the 301 label. The
  one deviation (diagnostic colC seed out of column order)
  changed no threshold; see the arm evidence. Proposed
  revision for the NEXT run (not applied here): any arm that
  carries a corpus across a rebase must re-sweep, or state
  that its corpus predates the rebase — and band tables
  should name their competent.js digest (base 76abf6f3 /
  cook-only 926f87f9 / current b0adaacc) so a substrate
  label can never drift silently again.
- Transient2: judged exactly against its header. Capture
  branch MISSED (0 transients); proven-negative branch MET
  (anchor published, snap coverage proven on all 8 seeds).
  Verdict DIAG-GO (proven negative), not a softened partial
  and not a re-scored capture claim. Anchor and hunt bands
  are different trajectories by design and are never compared
  as before/after.
- Balanced panel NOT run as a compare (cannot ingest
  sweep/recorder corpora — standing exception); sweep
  summaries + arm evidence files are the comparison of record.

## Blanks filled or documented (this run)

- FILLED: the wider drift bisect (C2, two steps, per-seed
  exact) + the substrate-label correction (301 = cook-only,
  294/3 wins = true current). Findings backlog drift item
  marked fixed.
- FILLED: the re-anchored transient exercise (proven
  negative, anchor table published, instrument needs no
  further work). Findings backlog transient-exercise item
  marked fixed.
- DOCUMENTED (new open items appended to the backlog):
  (1) hunt-band table collapse — same seeds/base, national
  7/8 both arms, but table 1/8 + wins 1/8 on driveoff-clean
  vs 6/8 + 6/8 anchor; whether feast-draw refusal deprives
  table-qualifying deeds, or longer survival without Arc IV
  deeds is the cause, is a next arm's question;
  (2) raids/pool drift residue (85→91 / 352→404 / 1527→1346)
  still unadjudicated — needs a raftdraft-census rerun under
  colB/colC, and colA has no raids/pool measurement yet;
  (3) carried-corpus re-sweep rule (method) — a corpus
  carried across a rebase keeps its old substrate label
  silently; future arms must re-sweep or declare it.
- NOT DONE (by design): no game-code change of any kind; no
  tuning against any band; no re-judgment of prior corpora;
  no push, no bump, no live verification.

## Next blanks, in order

(1) the hunt-band table collapse (driveoff-clean vs anchor
table step — mechanism, not correlation); (2) the raids/pool
census rerun under colB/colC; (3) wound-closure pricing
paper, then Steve's ruling on met-below-line finishing
(defender-finish stays KILLED); (4) melt ruling for Steve;
(5) defender-fight narration boilerplate + wait-line
repetition (sense arms); (6) a future transient hunt needs
more seeds or a first-night stressor, not a new instrument.
food-economy stays converging (untouched; sibling loop B).
Rotation left at 3 (convergence work does not cycle it).
Claim deleted; lock deleted.
