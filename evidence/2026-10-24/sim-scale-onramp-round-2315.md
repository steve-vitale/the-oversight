# sim-scale-onramp-round-2315 — coordinator evidence (axis scale-onramp)

Run: fleshout-20261024T2315Z (loop A). Claim + lock held for the run, both
deleted at closeout. Sibling loop B live during this run on food-economy
(new trees sim-fullpantry-confirm-b and sim-awayration-size-b appeared
mid-run — NOT touched; their trees appear in the reap output and were left
alone, as were the older dirty sibling trees).

## Standing directive status

Still stands. Scale-onramp stays converging (NOT converged): wins are real
but only through default-OFF courtship + seat instruments, only through the
lesser seat, wave 5 still 0 everywhere. This run does not climb past
national — it decomposes the lock behind the 99-pin into two different
problems that need two different levers, and it kills the shape lever on
this band. The directive stands until the tracker records this axis
converged on measured evidence.

## Arms (both pre-registered in their own evidence headers before sweeping)

Shared substrate, shared band, shared baseline: tableseat-nowait
(leanlinkrescue courtship + seat legs only, no wait leg), seeds 73671–73678,
180d death-aware. Both arms' baselines replicate the published
sim-standing99-diag-a baseline exactly (won 4/8, national ever 8/8, final
7/8, wave 4 5/8, wave 5 0/8, starvation 3, median 150, deaths 261) — the
third independent replication of that baseline on this band.

### Arm 1 — sim-vetkill-a: DIAG-GO

Question: on the stuck seeds, did villages never kill a wave-3+ monster,
or kill one and lose the killer? New pure-read recorder
scripts/policies/vetkill-diag.js (VETKILL=1, default-OFF; copies
state.waveKillLog, never calls side-effecting villageStandingTotal
mid-run; fallen map for death days, first-entry-wins). G1 det-gate PASS,
G2 recorder neutrality PASS (8/8 seeds identical on days/gameDays/ts
counters/starvation; deaths 261 = 261), G3 corpus integrity PASS (16/16
rows), G4 classification completeness PASS (all four focus seeds
classified, none UNCLASSIFIED; baseline and armed classifications agree
on all 8 seeds).

Finding, in plain words: the lock splits in two. Three stuck seeds never
killed anyone — 73674 (log 18 entries, 0 wave-3+), 73675 (22 entries, 0),
73677 (14 entries, 0). One stuck seed killed and lost the killer the
same day — 73676: exactly 1 wave-3+ kill (day 116, buffering, killer
nadia_khoury, via player), killer dead day 116, fallen cause the arena.
The daily trajectory missed that kill entirely (0 sampled veteran days);
the log is the only witness, and it is decisive. Across the whole band:
3 never-killed, 4 killed-dead-killer (73671/73672/73673/73676), 1
killed-living-killer (73678, nadia_khoury alive at end). Wave-4+ kills:
0 on all 8 seeds — nobody has ever killed a wave-4 monster in this band,
so the wave-5 bar (2 living wave-4 killers) has nothing to count.

Two sharper patterns inside the ledger: killers die in the arena, not to
monsters (7 of 8 dead killers, fallen cause the arena; only 1 monster),
and killer lifespans after first blood are short (0–27 days, excluding
the living nadia: 27, 7, 19, 7, 5, 0 same-day, 1). A veteran is a fleeting
state in this band — the bar demands a LIVING killer, and killers keep
dying within days of earning the title.

Commit: a53f7d5c8 (single commit, rebased onto the ship bump; proof
TEST-OK post-rebase and on merged master). Proof:
scripts/test-vetkill-diag.js, 21 checks, ALL PASS (re-ran green after
the rebase and on merged master; det-gate PASS on merged master).
Check.js --quick on the arm's base (worker's run): 280 passed, 7 failed
in 550s — the SAME pre-existing profile as 2115Z/2215Z (visible failure
the parity gear assertion, "they still wear their spear and jacket");
zero src/js and zero modified files in the arm, so not attributable
here. The worker's first check.js note (exit 0) was the tail pipeline's
code, not check.js's — corrected in its follow-up, and the correction
is recorded here, not hidden.

### Arm 2 — sim-vetshape-a: NO-GO (pre-registered bar, not re-scored)

Question: is the veterans-bar SHAPE (living-only vs living-or-dead
killers) the binding constraint? Probe of the already-existing default-OFF
instrument in src/js/standing.js (VETSHAPE=1; no src/js changes, no
default flips, no new policy file — environment flag + sweep script
only). GO required armed releases ≥2 of {73674, 73675, 73677} vs 0 in
baseline, plus the scalemetric cost bar.

Result: baseline 0/3, armed 0/3 — FAIL. Cost bar passed trivially
(starvation 3 = 3, median 150 = 150) because the lever is inert here.
Post-run ledger reads: 73674/73675/73677 living 0 / dead 0 wave-3+
killers in BOTH arms — there are no killers at all to count differently.
The instrument demonstrably works where dead killers exist (armed rd4
veteran counts rose on 73672: 1→2, 73673: 1→2, 73676: 0→1, flipping
73676's release label from wave4 to ready+gated on day 117) — yet every
outcome on every seed stayed identical. Shape changes the count; the
count changes nothing on this band. Per the pre-registration, this is a
decided outcome: the bar's shape is NOT the binding constraint here.

Commit: 46ddf17ff (tip; main commit e856897e8, rebased twice — onto the
ship bump, then onto the vetkill merge after ff-only correctly refused
the diverged branch; proof TEST-OK after every rebase and on merged
master). Proof: scripts/test-vetshape-a.js, 14 checks, ALL PASS;
det-gate PASS; G1 baseline replication PASS (all 8 aggregates exact);
G2 corpus integrity PASS (16/16 rows, engine-gated validation 16/16).
Existing VETSHAPE unit proof re-run (scripts/test-vetshape-20261017.js):
10 passed, 6 failed — all 6 are stale demand expectations from the
2026-10-18 recalibration (old proof expects wave-4 veterans demand 2,
wave-5 demand 3; current code is 1 / 2); all shape assertions pass. The
old proof was NOT edited; updating its demand numbers is its owner's
maintenance call (filed as a finding, not chased here). No [needs-eyes]:
a NO-GO probe changes nothing player-facing.

## Cross-arm verdict

The two arms agree and together close the 2215Z next blank (1) completely:

- The never-killed seeds (73674/73675/73677) need a wave-3
  encounter/kill-opportunity lever. Lowering demand numbers changes
  nothing there — there is no kill for any bar shape to count, and
  VETSHAPE proves it: counting dead killers differently moves nothing
  when the ledger is empty.
- The killed-dead seeds (73671/73672/73673/73676) need a killer
  survivorship lever, and the arena is where that lever lives — 7 of 8
  dead killers died there, within days of first blood. VETSHAPE's
  living-or-dead counting would rescue the gate on those seeds only if
  it were flipped to default, which is a Steve/coordinator call, NOT
  made by this run — and it would do nothing at all for the
  never-killed seeds, so the two levers must not be conflated into one
  "veterans" fix.
- Wave 5 cannot be the next lever on this band: wave-4+ kills are 0/8,
  so the rd5 bar has nothing to count until a wave-4 kill happens
  somewhere.

## Wall numbers (this run's judged corpora, 32 configs on one band)

| metric | baseline (tableseat-nowait) | vetkill armed (recorder) | vetshape armed (VETSHAPE=1) |
|---|---|---|---|
| n | 16 (8+8 replicated) | 8 | 8 |
| national ever / final | 8/8, 7/8 | 8/8, 7/8 | 8/8, 7/8 |
| table entered | 4 (feared, baseline) | 4 | 4 |
| wins | 4/8 | 4/8 | 4/8 |
| entered FULL | 0 | 0 | 0 |
| wave 4 / wave 5 reach | 5/8, 0/8 | 5/8, 0/8 | 5/8, 0/8 |
| median days | 150 | 150 | 150 |
| starvation | 3 | 3 | 3 |
| deaths | 261 | 261 (identical breakdown) | 261 |

The door rule and the bar shape change nothing about whether villages
get there on this band: national/wave/win numbers are identical across
all three columns. The wall past national is the kill ledger, not the
menu and not the bar's shape.

## Village assessment (plain words)

These villages climb to three regional links and then wait at a door
that opens only for a fighter who has killed one of the new monsters
and lived. On three of them, nobody ever does — for 98 to 180 days, no
wave-3 monster dies by village hands at all, and the village lives a
full, fed, ordinary life underneath a System line that says "blood your
fighters" without ever saying what that means or which monsters count.
On a fourth, a fighter finally does it and dies in the arena the same
day, and only the System's ledger remembers she ever existed — the
daily record shows nothing. On the villages that do open the door, the
fighters who opened it are almost all dead within days, again mostly in
the arena, so the door stays open only because the System remembers, not
because anyone lived to hold it. Nobody killed a wave-4 monster, nobody
sat a full seat, and nobody reached wave 5. The next work is not
counting veterans differently — it is getting a wave-3 monster killed
on the villages that never kill one, and keeping the fighters who do
kill one alive past the arena.

## Balanced panel (§15)

Attempted on both corpora; throws the known error both times —
TypeError: Cannot read properties of undefined (reading 'days') in
scripts/lib/balance-scorecard.js comparePanels (panel wants panel-driver
output, not per-seed rows; same as 1955Z/2115Z/2215Z). Sweep-compare
tables above are the before/after comparison, on identical seeds, judged
against the pre-registered bars. Panel-contract lane's item, not chased
here.

## Metric review

- Both arms' pre-registrations held as written; no mid-run re-scoring.
  The vetshape NO-GO was judged against its bar, not softened to "the
  count moved on 73676" (a label change with identical outcomes).
- "Median days" is uninformative for both arms (150 = 150 by
  construction for a recorder; 150 = 150 for an inert lever) — the
  informative proofs are per-seed identity (vetkill G2) and the
  release/cost-bar computation (vetshape), same lesson as standing99.
- Two metric gaps for the NEXT arms, found by this run: (1) the daily
  veteran trajectory UNDERSTATES fleeting veterans (73676: 0 sampled
  days, 1 real kill) — future evidence must cite the log for kills,
  never the trajectory alone; (2) the vetkill recorder's fallen map is
  first-entry-wins per vid, and the 73672 ethan_hunt anomaly (fallen
  death day 56, wave-3 kill day 103 — a death before the kill, impossible
  for one life) shows a first entry is not always the death that ended
  the killer's life — a future arm that needs killer timing must record
  the FULL fallen list. Neither gap touches either verdict (73672's
  verdict stands on gen_yg1x0kp alone).
- The vetkill worker's check.js correction (tail-pipeline exit code vs
  check.js's own result) is recorded in the arm section above; the
  280/7 profile matches 2115Z/2215Z exactly and is pre-existing.

## Telemetry deviation check

Ran on both landed corpora (baseline
telemetry-baselines/scale-wall.json, metrics national,table,wins,
exiled): both corpora print the same 2 LOUD lines — "national
disappeared: baseline 12 -> current 0 (n=17 files)", "wins disappeared:
baseline 16 -> current 0 (n=17 files)". Verdict: REGIME + FIELD-SHAPE
artifacts, same as 1955Z/2115Z/2215Z. The WINSEAT baseline's own _regime
note forbids comparing courtship/pre-seat substrates against it, and the
script reads top-level national/wins paths that per-seed rows do not
carry (n=17 = 16 rows + summary.json). Judged numbers above (national
ever 8/8, wins 4/8) contradict the LOUD lines on the rows themselves.
Baseline NOT rolled, no new investigation.

## Infrastructure

- Master moved once under the run (batch ship bump 327e16b69, version
  files only — index.html, src/js/build.js, sw.js, version.json — zero
  overlap with either arm). Both branches rebased clean in their own
  worktrees (vetkill once, vetshape twice — the second after the
  vetkill merge, because ff-only correctly refused the diverged
  branch); proofs green after every rebase and on merged master.
- Safe-commit index clobber hit the vetshape worker's commits twice —
  repaired via cacheinfo each time, commits verified correct. No
  clobber on the coordinator merges. No EPERM flap this run (all
  coordinator git/file writes succeeded first attempt).
- Proofs on merged master (coordinator, after both merges):
  test-vetkill-diag.js 21/21, test-vetshape-a.js 14/14, both det-gates
  PASS. Main tree clean at closeout.
- Merged locally, pending ship. Do NOT bump, do NOT push — the batch
  ship job owns version bumps, pushes, and live verification.

## Next blanks, in order

1. A wave-3 encounter/kill-opportunity arm on the NEVER-KILLED seeds
   (73674/73675/73677): why does no wave-3 monster die by village hands
   in 98–180 days? 73674 never even leaves wave 2 (wave-2 ledger points
   < 5 all run). This is a different lever from survivorship and must
   not be conflated with it.
2. A killer-survivorship / arena-death arm on the KILLED-DEAD-KILLER
   seeds (73671/73672/73673/73676): why do veterans die in the arena
   within days of first blood, and is that death avoidable? Includes
   the Steve/coordinator call on whether VETSHAPE=1 ever becomes
   default — NOT decided by this run.
3. Whether waiting matters on bands where the seat stays unready longer
   (carried from 2215Z, still untested).
4. A wave-4 kill must happen somewhere before any wave-5 lever is
   meaningful (wave-4+ kills 0/8 on this band).

## Convergence state

Axis scale-onramp: this run's arms DIAG-GO (vetkill) and NO-GO
(vetshape) as measurements, and the THING measured is now decomposed
one level deeper than standing99: the standing-99 veterans lock is
NEVER-KILLED on 3/4 focus seeds and KILLED-DEAD-KILLER (same-day kill +
arena death) on the fourth, and the bar's shape is proven inert where
the ledger is empty. Wave 5 remains 0/8, the full seat remains
unreached, and the standing directive stands — the wall now has two
named keys (encounter opportunity for the never-killed, killer
survivorship for the killed-dead), and the next arms are specified
above. No default flips; no src/js changes in either arm.
food-economy stays converging (untouched; sibling B loop).
Claim deleted; lock deleted.
