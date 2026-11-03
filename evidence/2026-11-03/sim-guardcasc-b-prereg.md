# sim-guardcasc-b — PREREG (committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-guardcasc-b
(coordinator brief 2026-11-03, run
fleshout-loop-b-20261103T0856Z, axis food-economy).
Worktree sim-guardcasc-b, branch sim-guardcasc-b.
Base: 5440b7747 (includes the guarde-deploy edit
d29ede83f: guard vetoes on NOT allow', entry-checked).
This worker does NOT push, bump, verify live, merge, or
rebase; the coordinator lands the branch. Status to
coordinator: committed in worktree, pending coordinator
merge.

## Predecessors (read, never re-litigated, never re-judged)

- evidence/2026-11-02/sim-homewardac-b.md (1636Z):
  the 69604 divergence section — a single outward
  veto (2,8)->(1,8) on day 5 rerouted the armed
  scholar's day; by day-6 record start the armed
  scholar was dead (death tele day 6, kind villager,
  cause "the wild", player=true) and its successor
  started day 6 at haven on 1500 kcal, while the
  shadow scholar camped on at (2,8) on 234 kcal.
  Reported, not chased, as finding
  "guard-succession-cascade" (080700Z next blank
  (3)). This diagnostic chases exactly that finding
  and nothing else.
- evidence/2026-11-02/sim-cband-b.md (2233Z): 7
  judged C trips fenced outward; 0 homeward vetoes;
  0 C episodes under the inherited definition.
  Outward attempt vetoes carry originSimOk null.
- evidence/2026-11-03/sim-guarde-deploy-b.md
  (080700Z): the guard instrument on THIS base
  vetoes on NOT allow' (E pass AND raw checkHop
  clear), with distinguished entry/escape lines.
  Vetoes on E-fail hops are UNCHANGED (0 veto
  changes, 0 E-fail outcome changes, pilot +
  confirm); armed old-vs-new trajectories are
  EXACTLY identical on 24 pairs. The original
  69604 veto (2,8)->(1,8) was an ESCAPE veto
  (E-fail, simOk false), so the deploy predicts
  it still fires — but the prediction is CHECKED
  by the fresh re-run, not assumed.
- scripts/policies/competent-homewardconstruct-b.js
  (construct-shadow / construct-armed) and
  scripts/homeconstruct-b-driver.js: REUSED
  VERBATIM, never edited. The guard is installed
  ONLY on construction days (C: days 5-6).

## Canon note

docs/CANON.md read first; docs/MAP.md states the
way home as travel through the same travelTo
pipeline. No canon doc covers the pocket guard
itself: it is a policy-side sim instrument (a
competent variant), not a game system, so there
is no canon to invent from — the guard's E(D)
model and the allow' deploy are inherited
verbatim from the predecessors. This run is
DIAGNOSTIC: zero src/js changes, zero edits to
scripts/policies/competent.js, the guard policy,
the construct policy, or the drivers, zero
default flips, zero bundled fix, NO game-code
change, NO deploy. New files only (this prereg,
the cascade analyzer, its proof test, the fresh
69604 pair, the corpus scan, the evidence file),
all named *-guardcasc-b.*.

## Questions (fixed now, before any judged leg)

(a) REPRODUCIBILITY on the current base — does a
fresh re-run of the 69604 shadow/armed legs
reproduce the same divergence?
(b) DEATH ATTRIBUTION — what killed the armed
scholar (full death-cause detail, tile, day,
energy/hunger chain), and is the death downstream
of the reroute or an independent RNG roll? Trace
the first differing evening/event between the
legs.
(c) PATTERN vs SINGLETON — re-derive from the
EXISTING homewardac/cband corpora whether any
other leg shows veto -> death/succession. NO
fresh screening beyond the 69604 pair: no fresh
seeds are fixed by this prereg, and none will be
screened. (Unbounded screening is excluded by
design; a non-reproduction is reported as
DIAG-NONREPRO below, not chased with new seeds.)
(d) SENSE TEST — read the armed death transcript
and judge in plain words whether the death reads
as a consequence of being rerouted.

## Method

### Legs

Exactly ONE fresh pair, both legs fresh on the
current base (standing lesson: never reuse a
prior run's baseline leg):
- Seed 69604, shape C construction (walk-out
  days 5: (4,4) 4,5 -> 4,6 -> 4,7 -> 4,8 -> 3,8
  -> 2,8; attempt day 6: (2,8)->(4,8) if offered),
  30d, construct-shadow vs construct-armed, via
  scripts/homeconstruct-b-driver.js with
  COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
  DEPOSITGATE=0, packcomp *=1 flags not 1
  (driver-enforced, FATAL otherwise).
- Output: evidence/2026-11-03/
  sim-guardcasc-b-repro69604-{shadow,armed}.jsonl
  (+ .log stderr). These two files ARE the judged
  legs. No other fresh sim is judged.

### Day-1 identity (STOP condition, before any judged number is read)

The fresh pair's day-1 records (start/end
pos/kcal/hydration, forage additions, sayLines
count) must be IDENTICAL between legs. Any
mismatch: stop, report substrate drift with the
diverging fields, do not judge. (Expected to
hold exactly: guard off before construction day,
identical policies, identical seeds.)

### (a) Reproducibility — three levels, reported separately

- R-SHADOW: fresh shadow leg day records days
  1-6 EQUAL to the original shadow corpus
  (sim-homewardac-b-pilotC-shadow.jsonl, seed
  69604) on start/end pos/kcal and day-5/6
  construct reports. Shadow mode never vetoes
  and the deploy does not change shadow
  decisions, so exact equality is expected; any
  difference is substrate drift, reported loudly.
- R-VETO: fresh armed leg day-5 hops contain the
  veto (2,8)->(1,8), vetoed, silent=false,
  simOk=false (escape veto, as original).
- R-OUTCOME: fresh armed leg shows the same
  outcome class as the original: a player=true
  villager death tele with cause "the wild" on
  day 6, and a successor-signature day-6 record
  start (haven (4,4), kcal 1500).
- REPRO-YES iff R-SHADOW + R-VETO + R-OUTCOME
  all hold. Otherwise REPRO-NO, with the failing
  level named and the deploy-delta analysis
  applied: list every ENTRY veto (vetoCause
  'entry', new in the deploy) on fresh armed
  days 5-6. If entry vetoes exist on those days,
  the divergence from the original armed leg is
  attributed to the deploy (the only decision
  change between the legs) and reported as such.
  If NO entry veto exists on days 5-6 and the
  outcome still differs, that is substrate drift
  (same decisions, different trajectory), reported
  loudly, not explained away.

### (b) Death attribution — the trace (on the FRESH pair if REPRO-YES, else on the ORIGINAL pair, stated explicitly)

Extract, for both legs: day records days 5-7
(start/end pos/kcal, construct reports, hops,
vetoes), the full deaths array (filter
player=true), and sayLines days 5-6 with seq
numbers. Then:

1. FIRST DIVERGENCE: align day-5 sayLines by
   index; report the first index where the legs
   differ (original: index 60, shadow "Travel 1
   tile to creek" vs armed veto line). Then
   report the reroute in full: veto hop, the
   armed leg's subsequent hops/forages that day
   (original: forage success at (2,6), +7
   unknown shoots, vs shadow's two failed
   forages at (1,8)/(0,8)), and day-5 end
   pos/kcal on both legs (original: both (2,8),
   armed 920 vs shadow 980).
2. DEATH TIMING — resolve, do not assume. The
   original corpus contains an apparent
   record/say tension that this diagnostic must
   settle explicitly: the original armed day-6
   record start is the successor signature
   ((4,4)/1500, construct startPos (4,4),
   attempt not-offered), while the original
   armed day-6 sayLines show an exposed wake,
   a pack with the day-5 unknown shoots, a
   night boulder fight ("You go down"), and
   only then the death line ("Ingrid Kelleher
   is dead — the wild") and mantle transfer
   ("You wake up somebody else. Colton Ochoa").
   The trace MUST state which of these holds
   on the fresh legs (and, for the original
   legs, what the evidence actually shows):
   (i) death during the night of day 5->6
   (harness sleep after the day-5 daily), with
   the day-6 sayLines belonging to the
   successor's day; or (ii) death during day
   6's night (boulder fight), with the day-6
   record start being a snapshot artifact to
   be named as such; or (iii) another timing
   the evidence supports. The death's tile,
   proximate mechanism (fight? starvation
   spiral? exposure?), and energy/hunger chain
   (day-5 end kcal, overnight change, day-6
   kcal at death) are reported from the
   resolved chain, not from the homewardac
   summary's shorthand.
3. ATTRIBUTION TEST (decided now): the death is
   DOWNSTREAM of the reroute iff the resolved
   chain shows the death's proximate mechanism
   depends on a reroute-created state — a
   different tile at nightfall, a materially
   different kcal/hunger state, or a different
   encounter that the shadow leg's state would
   not have produced. The death is RNG-CASCADE
   (coincidence in the causal sense) iff both
   scholars reach the same night state (same
   tile, comparable kcal, same exposure) and
   the death turns only on a roll that differs
   because post-veto RNG consumption diverged
   — the veto changed the dice, not the
   situation. A 60-kcal day-5-end gap on the
   same tile is NOT by itself a state
   difference: the trace must show the gap
   mattering (e.g. a threshold crossed) or say
   it does not.

### (c) Pattern vs singleton — corpus re-derivation (NO new sims)

Scan the EXISTING corpora with
scripts/analyze-guardcasc-b.js (new file):
- homewardac pilotA pairs (69501-69508) and
  pilotC pairs (69601-69608): 16 pairs, 32 legs
  (evidence/2026-11-02/sim-homewardac-b-pilotA/
  pilotC-{shadow,armed}.jsonl).
- cband judged pairs (69702, 69704, 69706, 69707,
  69709, 69713, 69714, 69717): 8 pairs, 16 legs
  (evidence/2026-11-02/sim-cband-b-judged-<seed>-
  <origin>-to-<dest>-{shadow,armed}.jsonl).
- The cband band files (sim-cband-b-band-
  {shadow,armed}.jsonl) are included ONLY if
  they parse as per-seed leg records in the
  same format; otherwise they are listed as
  not-scanned with the reason. No other corpus
  is scanned; shapes-b natural bands are NOT
  re-scanned (different instrument, no
  constructed veto days).
Candidate definition (fixed now): a pair is a
VETO->DEATH/SUCCESSION candidate iff ALL hold:
(i) the armed leg has >= 1 veto on a
construction day (day 5, or day 5-6 for C);
(ii) the armed leg has a player=true villager
death tele with day in [veto day, veto day+2];
(iii) the shadow leg has NO player=true death
tele in the same window; (iv) the armed leg
shows a successor signature in that window (a
day-record start at haven (4,4) with kcal
1500, or a mantle-transfer say line).
Report per pair: candidate yes/no, veto hops,
death tele, shadow window deaths, successor
signature. 69604 itself is counted in the scan
(it must come out candidate under this
definition, or the definition is wrong and that
failure is reported, not patched mid-run).

### (d) Sense test

Read the armed death transcript (veto line,
reroute, night, death, mantle transfer) and
judge in plain words whether the death reads
as a consequence of being rerouted — or as a
death that happens to follow a reroute. Quote
the veto line, the death line, and the mantle
line. The sense verdict is reported alongside
the causal verdict, never substituted for it.

## Verdict words (decided now)

Attribution first, then count — applied to the
ORIGINAL 69604 event's resolved chain and the
corpus scan; reproducibility is reported
alongside, never folded into the word:

- DIAG-COINCIDENCE: the resolved chain shows
  RNG-CASCADE per the attribution test above —
  the veto rerouted the day but did not cause
  the death in any state sense. The cascade
  (veto -> divergence -> different dice) is
  real; the death is not attributable to the
  veto.
- DIAG-SINGLETON: the death is DOWNSTREAM per
  the test, the pair reproduces or the original
  chain is unambiguous, BUT no other corpus
  pair meets the candidate definition. One
  guard veto demonstrably killed a scholar
  through succession — once.
- DIAG-PATTERN: the death is DOWNSTREAM, AND
  >= 1 other corpus pair meets the candidate
  definition. Veto -> death/succession is a
  recurring guard trajectory effect, not a
  one-off.
- If REPRO-NO: the verdict word still applies
  to the ORIGINAL event (from the original
  corpus chain), and is marked "on original
  legs only, not reproduced on current base",
  with the failing level and deploy-delta
  analysis attached. Non-reproduction does NOT
  silently convert a verdict, and no fresh
  seeds are screened to rescue it.

## What a future guard prereg must control for (deliverable of this diagnostic)

The evidence file MUST end with a control list
for any future guard prereg that wants to judge
guard effects on scholar fate, including at
least: (1) succession-aware integrity — a pair
whose armed leg successions before the judged
day fails integrity (as 69604 failed C
integrity) and must be analyzed as a cascade
leg, not dropped silently; (2) veto-death
attribution — a player-death window after any
veto day, with the shadow leg as the control
for the same window; (3) the record/say timing
rule settled by this diagnostic (which source
fixes death timing when record starts and say
order disagree); (4) deploy-delta reporting —
when the guard instrument changes between the
original event and the re-run, entry vetoes on
the judged days must be listed before any
reproducibility claim.

## Balanced panel (§15)

VACUOUS by design, as in the cband run (not
fabricated): the panel expresses the guard
policies on natural campaigns; this diagnostic's
before/after IS the shadow/armed pair on
identical seeds. No compare file is fabricated.

## Measurement notes (MEASUREMENT.md §§9-12, 14-15)

- Pilot gate (§9): this diagnostic's "pilot" is
  the single 69604 pair; there is no confirm
  spend (no fresh seeds fixed, no confirm band).
- Death-aware horizons (§10): the 30d window is
  kept for comparability with the predecessor
  corpora; scholar death is not village death
  (daysAlive stays 30 via succession), so the
  horizon is not cut by the scholar death — the
  death window [veto day, veto day+2] is the
  analyzed span.
- Pre-registration (§11): this file. Judge
  against this header; a miss is reported as a
  miss, never re-scored (§14). Metric doubts go
  under "metric review" for the NEXT run.
- Wall numbers: reported for the fresh pair
  only (survival, wave reach, national/table/
  wins within the 30d window), honestly limited
  — no wall movement is shown or claimed by a
  diagnostic pair.

## Census (proof, not judged evidence)

BEFORE any judged number is read from the fresh
legs, scripts/test-guardcasc-b.js must show:
(a) the cascade analyzer flags a fixture
veto->death/succession pair as candidate
(armed veto day 5, player death day 6,
shadow alive, successor signature) and
rejects the controls: shadow-also-dies,
no-veto-but-death, death-outside-window,
no-successor-signature; (b) the analyzer
reproduces the 69604 candidate verdict from
the ORIGINAL corpus files (not from
hand-written fixtures); (c) the reused files
are unmodified in this worktree (construct
policy, homeconstruct driver, guard policy,
competent.js — git check). Any proof failure
is a proof failure: fix the instrument, do not
judge legs against a failing one.

## Explicitly excluded

No game-code change, no default flip, no
deploy, no fresh seeds beyond the 69604 pair,
no re-judging of homewardac/cband verdicts, no
escape shape (shape D) implementation, no other
worktree touched, no push, bump, live
verification, merge, or rebase.
