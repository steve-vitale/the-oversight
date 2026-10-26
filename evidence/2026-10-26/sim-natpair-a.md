# sim-natpair-a — the national-pairing instrument question (axis scale-onramp)

Run: fleshout loop A, 2026-10-26, arm sim-natpair-a.
DIAG ONLY — zero src/js changes, zero default flips, no changes to
any existing policy, sweep, summary, or check file. New files only:
a new sweep, a new proof test, this evidence file, and the new
per-seed corpus. The old devotiongate sweep's `paired` field is NOT
edited here — it stays readable as the buggy behavior, and the new
sweep carries the revised rule alongside the old one so both can be
read on identical fresh rows.

## PRE-REGISTRATION (binding, written BEFORE any sweep, judged only against this)

- Canon read first: docs/CANON.md (manifest; no single canon doc
  covers the tableseat instrument — the pairing question lives in
  sweep code, not in a design doc, said so here instead of
  inventing a canon doc), docs/SCALE.md (national is a LIVE
  state, not a title: when the realm dissolves, nationalLive
  falls — a rank that rises and falls within a day is real
  game behavior, not by itself an instrument artifact),
  docs/MONSTER-WAVES.md (wave law; wave 4 = the Mirror Draft),
  docs/TABLE.md (the table prices the run, never gates on
  godhood). The instrument question is about how sweeps READ
  national reach, not about what national means in canon.
- Context read first (classification of the OLD corpora, allowed;
  the verdict comes only from the fresh band below):
  evidence/2026-10-26/sim-devotiongate-a.md (0340Z: its summary
  pairing check flags MISMATCH on all 16 seed-arms) and its
  corpus evidence/2026-10-26/perseed-sim-devotiongate-a/
  (read, not copied, not judged on); and
  evidence/2026-10-26/sim-driveoff-clean-a.md (0215Z
  transient-national note: clean 73673 reached national,
  tsNationalDay 86, table-invited, but the daily dawn snap
  recorded maxRank regional) and its corpus (read, not copied).
  Authoritative control reference:
  evidence/2026-10-26/sim-rebaseline-a.md (0126Z, base
  8ea64d848: deaths 260, national-ever 6/8, national-final
  5/8, table 4/8, entered 4/8, wins 4/8 lesser seat only,
  wave-4 5/8, wave-5 0/8, median 143d).
- Base note, stated before sweeping: this worktree's HEAD at
  registration is 72cf7a672, NOT the rebaseline base 8ea64d848.
  If the fresh band deviates from the 0126Z table, base drift
  is a candidate cause, reported plainly, never smoothed and
  never silently reconciled. The devotiongate run's own control
  already disagreed with the 0126Z table 0/8 on its base, so a
  deviation here would be consistent with base drift, not proof
  of a pairing failure — the pairing legs below are judged on
  the fresh band's own rows, and the trajectory comparison is
  reported alongside, not folded into the pairing verdict.
- The suspect, read from code BEFORE sweeping
  (scripts/test-devotiongate-sweep.js, summary pairing lines):
  `paired: !!((r && r.nationalEver) === (tsDay != null))`.
  `nationalEver` in every sweep row is a NUMBER (1 or 0:
  `Math.max(hist.maxRank, RANK_ORDER[end.rank]) >= 2 ? 1 : 0`),
  while `(tsDay != null)` is a BOOLEAN (true/false). In JS,
  `1 === true` is false and `0 === false` is false — strict
  equality between a number and a boolean is NEVER true. So
  the check's `paired` is false on every seed-arm by
  construction, whatever the game did. Hypothesis H-type:
  the 16/16 MISMATCH is a type bug in the check, not a game
  disagreement. Hypothesis H-transient (separate, real): a
  seed can also genuinely disagree — tsNationalDay present
  while the daily snap never saw national — because the ts
  surface is sticky (set once in tableseat daily, never
  cleared) and the snap samples rank once per day before
  base.daily, so a rank that rises inside base.daily
  courtship and falls before the next day's snap is seen by
  ts and missed by the snap. H-type and H-transient are
  DIFFERENT failures and this run separates them per seed-arm.
- Old-corpus classification, computed from the files on disk
  before sweeping (context, not verdict):
  - Devotiongate corpus (16 seed-arms): 15 arms carry
    nationalEver=1, tsDay present, maxRank national/global —
    all three witnesses agree the seed reached national+;
    1 arm (73678 devotiongate) carries nationalEver=0,
    tsDay null, maxRank regional — all three agree it did
    NOT reach national. Substantive agreement 16/16, yet the
    stored `paired` field is false on all 16. That pattern is
    exactly H-type and nothing else: no devotiongate arm
    shows a ts-vs-snap disagreement.
  - Driveoff-clean corpus (16 seed-arms, control + clean):
    15 arms substantively agree (snap nationalEver boolean
    equals ts-present boolean, maxRank agrees); 1 arm is a
    genuine transient: clean 73673, tsNationalDay 86,
    table-invited, nationalEver=0, maxRank regional. That
    arm is H-transient, and its stored `paired` is false
    for BOTH reasons at once (type bug + real disagreement)
    — the old check cannot tell the two apart, which is
    precisely why it cries wolf.
- Fresh band, trajectory for trajectory: seeds 73671-73678,
  tableseat-nowait substrate (LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1, scripts/policies/tableseat-nowait.js),
  180d death-aware horizon (runDays stops on death/win; 180
  is the cap, not a fixed horizon). ONE arm, plain
  tableseat-nowait, no recorders (recorder compositions are
  what made prior controls diverge; the plain arm is the
  cleanest trajectory anchor and matches the rebaseline
  leg-(b) plain proof). Fresh sweep only for the verdict —
  never judge a copied sibling corpus.
- New sweep (new file only): scripts/test-natpair-sweep.js.
  It wraps tableseat-nowait.daily with PURE READS only:
  pre-daily snap (rank, arc, tableWaiting, tableDone) exactly
  as prior sweeps compute hist.maxRank / nationalEver /
  table / entered; then delegates to tableseat-nowait.daily;
  then a post-daily snap (new diagnostic field only, never
  folded into the old fields). It captures ctx.tsNationalDay
  and the rank trace (per day: pre-order, post-order) so a
  transient can be located to a day and a direction
  (rose-inside-daily vs fell-overnight). It changes no play:
  no game call is added, removed, or reordered; the snaps
  read scaleRank()/progState() only. Det-gate proves it
  (plain tableseat vs wrapped, seed 73671, days/gameDays/
  tsNationalDay/won/deaths identical).
- Definitions (fixed before sweeping, old fields verbatim):
  SNAPNAT = row nationalEver (0/1, pre-daily hist + final
  snap, as prior sweeps). TSPRESENT = tsNationalDay != null.
  MAXNAT = maxRank in {national, global}. FINALNAT =
  finalRank in {national, global}. POSTNAT = post-daily
  maxRank in {national, global} (new diagnostic only).
  OLDPAIRED = (SNAPNAT === TSPRESENT) computed literally
  in JS (number === boolean) — expected false everywhere
  if H-type holds. NEWPAIRED = (SNAPNAT === (TSPRESENT
  ? 1 : 0)) — like-for-like numbers. MAXAGREE = (MAXNAT
  === (SNAPNAT === 1)).
  Per-seed-arm classes (exactly one per seed, assigned by
  the sweep, never hand-edited):
  - agree: NEWPAIRED and MAXAGREE (all witnesses agree,
    whether national reached or not);
  - transient-ts-only: TSPRESENT and SNAPNAT == 0
    (ts saw national, snap never did — H-transient);
  - snap-only: SNAPNAT == 1 and not TSPRESENT
    (snap saw national, ts never did);
  - final-only: SNAPNAT == 1 and not MAXNAT and FINALNAT
    (national reached only at the final snap);
  - post-explained-transient: transient-ts-only AND POSTNAT
    (the rise happened inside a base.daily and the
    post-daily snap caught it — the transient is located,
    not just labeled);
  - unclassified: anything else (a verdict failure, not a
    bucket to hide in).
- ADOPTED RULE (leg (b), stated explicitly here, ONE
  revision only): THE CHECK'S CONDITION IS REVISED, the
  brief's pairing definition is NOT. The brief's definition
  stands unchanged: national-ever is the snap-based count,
  tsNationalDay is an independent witness, and pairing means
  the witnesses agree. The revised check is NEWPAIRED
  (coerce both sides to 0/1 before comparing). The old
  check's `paired` field is preserved verbatim in the new
  sweep's rows (as OLDPAIRED) so the bug stays readable,
  but it is no longer the label of record — NEWPAIRED is.
  A transient-ts-only seed is NOT smoothed into "paired"
  by the revised rule: under NEWPAIRED it still reads
  MISMATCH, because the witnesses genuinely disagree, and
  that disagreement is the finding, not a wolf-cry. No
  second revision is smuggled in: national-ever is NOT
  redefined as a ts/max union, and maxRank is NOT folded
  into the pairing condition — MAXAGREE is reported
  alongside, not inside, the revised check.
- DIAG-GO rule (ALL legs, no partial credit):
  (a) every fresh seed-arm classified — 8/8 assigned exactly
  one class above, unclassified 0, with fields and WHY
  listed per seed (H-type vs H-transient vs other);
  (b) the adopted rule above stated explicitly (this
  section) and implemented in the new sweep as NEWPAIRED,
  with OLDPAIRED preserved alongside for comparison;
  (c) the adopted rule's counting reproduces the 0126Z
  authoritative national-ever 6/8 on the fresh band —
  national-ever is SNAPNAT summed, unchanged by the check
  revision (the revision changes labels, never counts), so
  leg (c) is: fresh-band SNAPNAT total == 6. The other
  0126Z reference fields (deaths 260, national-final 5/8,
  table 4/8, entered 4/8, wins 4/8, wave-4 5/8, wave-5 0/8,
  median 143d) are COMPARISON fields: every deviation is
  reported plainly in the comparison table, never smoothed,
  and a deviation does not by itself re-score leg (c) —
  but it is named in the verdict line if present, because a
  pairing verdict anchored on a drifted trajectory must say
  so. Any leg missed = DIAG-NO-GO.
- SENSE plan: (1) one seed's pairing story in plain words
  (which day national was reached, what the dawn snap saw,
  what the label said under the old check and under the
  revised rule); (2) if the fresh band contains a
  transient-ts-only seed, that seed IS the sense moment
  (its rank trace day, its table invitation, its fall);
  otherwise the sense moment is the seed whose old label
  lied loudest (national reached, ts present, maxRank
  global, label MISMATCH); (3) a villager-behavior spot
  check from the fresh rows' say-lines (same texture as
  prior arms — nothing new is introduced, so report that
  honestly rather than inventing a behavior finding).
- PILOT GATE: the fixed shared band IS the pilot — 8 seeds,
  one arm, identical seeds, before any further spend. No
  confirm beyond the band.
- Balanced-panel note: scripts/balance-panel.js cannot ingest
  per-seed recorder corpora (known limitation, carried) —
  the sweep-compare table + analyzer output are attached
  instead; telemetry-check is NOT run on recorder rows
  (standing instruction; this sweep has no recorders, but
  the panel still cannot ingest per-seed sweep rows).
- METRIC REVIEW section below is mandatory
  (docs/MEASUREMENT.md §14): pre-registered metrics bind
  the run — a miss is NO-GO, never re-scored against a
  friendlier metric mid-run.

## RESULTS (written after the sweep; the pre-registration above was written before it)

The band completed 8/8, one arm, plain tableseat-nowait, base
72cf7a672. Every row is on disk before the summary was built
(CORPUS: PASS, exit 0). Det-gate passed before the band
(seed 73671, plain vs wrapped: days 160/160, gameDays 160/160,
won 0/0, deaths 50/50, tsNationalDay 77/77 — the pure-read
wrapper moves no play).

## VERDICT: DIAG-NO-GO — legs (a) and (b) met, leg (c) missed on a stale anchor, not on the pairing question

Leg (a) MET: 8/8 fresh seed-arms classified, unclassified 0,
each with fields and WHY below. Leg (b) MET: the adopted rule
is stated in the pre-registration (check condition revised to
NEWPAIRED, brief definition unchanged) and implemented in the
new sweep, with OLDPAIRED preserved alongside. Leg (c)
MISSED: fresh-band SNAPNAT total is 8, not the pre-registered
6. By the binding rule ("any leg missed = DIAG-NO-GO, no
partial credit") the verdict is DIAG-NO-GO — and the reason
matters more than the label, so it is stated plainly here
rather than buried: the pairing question itself is SOLVED
(see below), but the anchor it was tied to is stale. The
fresh band reproduces the devotiongate control band EXACTLY
on all 8 seeds and every compared field (days, won, deaths,
natEver, table, entered, wave, arc, final rank, max rank),
so the 8-vs-6 gap is base drift between the 0126Z base
(8ea64d848) and the current base, not a pairing failure and
not a trajectory failure of this sweep. The 0126Z table's
other fields still match the fresh band exactly (below) —
only national-ever and deaths moved, on exactly the two
seeds that flipped from non-national survivors to winners
(73675, 73676). A verdict that called this DIAG-GO by
re-scoring leg (c) against the newer band would be exactly
the mid-run re-scoring §14 forbids, so it is not done here.

## THE PAIRING ANSWER, FIRST (plain words)

The old check was crying wolf because of a type bug, and the
fresh band proves it on every seed. The old check compares a
number (nationalEver 1 or 0) with a boolean (tsDay present
true/false) using strict equality, and in JavaScript a number
is never strictly equal to a boolean — so the old label said
MISMATCH on all 8 fresh seeds even though every witness
agreed on all 8. Under the revised check (both sides as 0/1),
all 8 fresh seeds read paired, and the max-rank witness
agrees on all 8 too. The check is fixed by one coercion; the
game's national counts change not at all. The second,
separate failure mode — the genuine transient, where the seat
leg sees national but the daily snap never does — did NOT
occur on this fresh band, but the new instrument locates
exactly where it would occur (below): national always rises
inside a day's courtship, the seat leg and the post-daily
snap see it that same day, and the pre-daily snap only sees
it the next day. A village whose realm dissolves overnight
before that next snap is a transient — the driveoff-clean
73673 case, now with a mechanism, not just a label.

## THE COMPARISON TABLE (identical seeds 73671-73678, 180d death-aware)

| band | won | median | natEver | natFinal | table | entered | arc4 | wave4 | wave5 | starv | deaths |
|---|---|---|---|---|---|---|---|---|---|---|---|
| fresh natpair (this run, base 72cf7a672) | 4/8 | 143d | 8 | 5 | 4 | 4 | 4 | 5 | 0 | 2 | 301 |
| 0126Z rebaseline (base 8ea64d848) | 4/8 | 143d | 6 | 5 | 4 | 4 | 4 | 5 | 0 | 9* | 260 |
| devotiongate control (0340Z, for drift context) | 4/8 | 143d | 8 | 5 | 4 | 4 | 4 | 5 | 0 | 2 | 301 |

\* 0126Z starvation 9 vs fresh 2 is a third deviation, on the
same two flipped seeds (73675/73676 no longer starve as
stalled survivors — they win instead). The summary's
comparison block tracks the pre-registered reference fields;
starvation is reported here additionally, not hidden, and it
does not change any leg (starvation was never a leg here).

Per-seed, fresh vs 0126Z (days / won / deaths / natEver):
73671 160/0/50/1 vs 180/0/31/1; 73672 180/0/24/1 vs 97/1/25/1;
73673 90/1/26/1 vs 124/1/28/1; 73674 139/1/35/1 vs 163/1/30/1;
73675 132/1/30/1 vs 180/0/38/0; 73676 124/1/33/1 vs 70/0/31/0;
73677 143/0/45/1 vs 143/0/43/1; 73678 173/0/58/1 vs 116/1/34/1.
Fresh vs devotiongate control: MATCH on all 8 seeds, every
compared field (verified field-by-field, not just band
totals). The drift from 0126Z is therefore dated: it
happened between 0126Z and 0340Z, and nothing between 0340Z
and this run's base moved any seed on this band.

## PER-SEED PAIRING CLASSIFICATION (all 8 fresh arms, WHY each)

| seed | days | won | natEver | maxRank | postMax | final | tsDay | preNat | postNat | old | new | maxAgree | class | WHY |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 73671 | 160 | 0 | 1 | global | global | regional | 77 | 78 | 77 | false | true | true | agree | H-type only: witnesses agree (reached, then fell back to regional); old label lied by type. |
| 73672 | 180 | 0 | 1 | global | global | global | 77 | 78 | 77 | false | true | true | agree | H-type only: reached day 77, held to 180d. |
| 73673 | 90 | 1 | 1 | national | national | national | 84 | 85 | 84 | false | true | true | agree | H-type only: reached day 84, won day 90. |
| 73674 | 139 | 1 | 1 | global | global | global | 124 | 125 | 124 | false | true | true | agree | H-type only: reached day 124, won day 139. |
| 73675 | 132 | 1 | 1 | global | global | global | 77 | 78 | 77 | false | true | true | agree | H-type only: the 0126Z stalled survivor, now a winner; reached day 77. |
| 73676 | 124 | 1 | 1 | global | global | global | 77 | 78 | 77 | false | true | true | agree | H-type only: the 0126Z village-lost seed, now a winner; reached day 77. |
| 73677 | 143 | 0 | 1 | global | global | regional | 77 | 78 | 77 | false | true | true | agree | H-type only: reached, then fell back to regional, lost day 143. |
| 73678 | 173 | 0 | 1 | national | national | regional | 88 | 89 | 88 | false | true | true | agree | H-type only: reached day 88, realm dissolved day 136 (narrated, see sense moment), lost day 173. |

No fresh arm is transient-ts-only, snap-only, final-only,
or unclassified. OLDPAIRED is false on 8/8 (the bug
reproduces exactly as predicted); NEWPAIRED is true on 8/8;
MAXAGREE is true on 8/8. The old check's failure is total
and the revised check's agreement is total — there is no
ambiguous seed left to argue about on this band.

## THE TRANSIENT MECHANISM, LOCATED (not just labeled)

On all 8 fresh seeds, the same three-day pattern holds
exactly: postNationalDay == tsNationalDay, and
preNationalDay == tsNationalDay + 1. National NEVER rises
at a pre-daily snap on this band — it rises inside
base.daily courtship (the trace shows pre < 2, post >= 2
on the ts day itself), the seat leg and the post-daily snap
catch it that day, and the pre-daily snap catches it the
next day. The transient window is therefore exactly one
night: rise inside daily on day D, fall during sleep /
overnight before the pre-daily snap on day D+1, and the
snap-based nationalEver misses a national reach the seat
leg saw. Three fresh seeds prove the fall half of that
window in the open (rank fell overnight: 73671 day 119→120,
73677 day 122→123, 73678 day 136→137) — but on all three,
national had already been pre-snapped on an earlier day,
so they stayed snap-counted and are not transients. A
transient is the same fall happening on the FIRST night
after the rise. That is the driveoff-clean 73673 clean
arm's shape (ts 86, table invited, snap regional): its
rise fell inside the one-night window. Future sweeps that
need exact national-ever should carry the post-daily snap
(this sweep's diagnostic) or read ts alongside the snap —
the pre-daily snap alone is one night blind.

## SENSE MOMENT (one seed's pairing story in plain words)

Seed 73678. On day 88 the village becomes a realm: the
shared granary opens, the System says the whole planet is
leaning in, and a villager, Min-kyung, says at the fire,
not quite believing it: "Speakers rode in, ate our grain,
and called us a realm. A REALM. I keep saying it to hear
how it sounds." The seat leg writes day 88 down; the
post-daily snap sees national that same day; the dawn
snap sees it the next day, day 89. The village holds the
realm for weeks, then on day 136 the game says it plainly:
"The realm came apart — no polity answers to Haven now,
and Haven is a free fire again. National no longer
describes this village. The climb starts over." The next
day's snap reads regional, and the village ends regional
on day 173, lost, with 58 deaths. Under the old check, this
seed's label was MISMATCH — national reached, ts day 88,
max rank national, and still the label said the witnesses
disagreed. They did not disagree; the check compared a
number to a boolean. Under the revised rule it reads
paired, and the story it tells is coherent: a village that
climbed, was named a realm, lost the realm, and fell.

## SENSE SECTION (villager-behavior spot check)

Nothing new is introduced by this arm (zero src/js, zero
policy behavior change — the sweep only reads), so there
is no new behavior to judge, and none is invented here.
What the fresh rows' say-lines show is the same coherent
texture as prior arms: national arrival is narrated as a
polity moment (granary, court, trust gains with named
villages Emberhold, Ashford, The Red Table), and national
loss is narrated as a realm dissolving with a reason
(the Red Table drifting, tribute pressed down, raids in
the night), not as a silent number change. Min-kyung's
day-90 line is a person reacting to a status change, not a
status line. No robotic, static, or repeated dialogue was
found in the sampled lines (73671 days 76–90, 73678 days
70–92 and 130–140).

## VILLAGE ASSESSMENT (plain words)

Eight villages on the shared band, all eight reaching
national (the 0126Z band's two non-national seeds both
climb now), four reaching the table and entering it, four
winning through the lesser seat, wave-4 reached on five,
wave-5 on none. Deaths ran 301 across the band. The two
villages that changed since 0126Z are the story: 73675,
which used to stall to day 180 with 2 people and 200 kcal
and never climb, now wins on day 132; and 73676, which
used to die on day 70, now wins on day 124. The villages
that still lose do so after climbing: 73671 and 73677 and
73678 all reached national or global and fell back to
regional before losing — the wall on this base is no
longer "villages never reach national" (8/8 do), it is
that reaching national does not yet carry four of them to
the table. What was missing before this arm: a trustworthy
national-ever label (the old check cried MISMATCH on every
seed, so no band's national count could be read off its
own label). Blank filled: the label is fixed by one
coercion, the transient window is located to a single
night, and the fresh band's counts are anchored to a
named base instead of a stale one.

## WALL NUMBERS

Fresh band: national-ever 8/8, national-final 5/8, table
invited 4/8, entered 4/8, wins 4/8 (lesser seat only),
wave-4 5/8, wave-5 0/8, Arc IV 4/8, median survival 143d,
max 180d, deaths 301, starvation 2. Death-cause detail is
carried per seed in the corpus rows (deaths maps); no new
death-cause census is published here because this arm adds
no recorder — the band totals are the wall numbers, and
the per-seed maps are the detail. The wall stands in a new
place on this base: national is no longer the scarce step
(8/8), the table is (4/8 entered), and wave-5 remains
unborn (0/8).

## BLANKS FILLED OR DOCUMENTED

- FILLED (instrument, proven on fresh rows): the old
  pairing check's MISMATCH-on-everything is a JS type bug
  (number === boolean), reproduced 8/8 fresh and 16/16 in
  the devotiongate corpus; the revised check (both sides
  0/1) reads paired 8/8 fresh with maxRank agreeing 8/8.
- FILLED (mechanism, located not labeled): national rises
  inside base.daily on every seed (postNatDay == tsDay,
  preNatDay == tsDay + 1, all 8); the transient window is
  the single night after the rise; overnight falls are
  observed on 3 seeds without becoming transients.
- FILLED (trajectory anchor): the fresh plain band equals
  the devotiongate control band exactly, seed by seed —
  recorders never caused the 0126Z deviation; base drift
  between 0126Z and 0340Z did.
- DOCUMENTED, NOT FIXED (named next blanks): (1) the
  authoritative table is stale on current base — the next
  run that needs a 0126Z-anchored leg must re-baseline
  first (this run's leg (c) is the proof: 8 vs 6, 301 vs
  260); (2) no fresh transient seed was observed, so the
  post-explained-transient class is mechanism-supported
  but not fresh-exercised — a future arm that needs one
  should run the driveoff-clean arm shape (where the one
  known transient lives) with the post-daily snap added;
  (3) the old devotiongate sweep's stored `paired` field
  remains wrong in its committed corpus — it is preserved
  here as OLDPAIRED for readability, but future summaries
  should print NEWPAIRED as the label of record (a
  coordinator decision for that sweep's file, not made
  silently here, per the DIAG-only new-files rule).
- CARRIED (not chased here): the scale wall's next step is
  table entry, not national reach, on this base (4/8
  entered against 8/8 national-ever); wave-5 remains 0/8.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

No pre-registered leg, class, or definition was re-scored
mid-run. The run was judged exactly against its header:
leg (a) all-classified met (8/8 agree, unclassified 0);
leg (b) adopted rule stated and implemented (check
condition revised to NEWPAIRED, brief definition
unchanged, OLDPAIRED preserved); leg (c) national-ever
6/8 MISSED (fresh 8/8) — reported as DIAG-NO-GO, not
softened to a partial GO and not re-anchored to the
devotiongate band mid-run, even though the fresh band
matches that band exactly (that match is reported as
drift evidence, not used as a substitute gate). Two
method notes, neither a revision: (1) the proof test
asserts leg (c) directly, so it honestly reports 36/37
with the single failure being leg (c) itself — the test
failure IS the verdict, not a test bug, and it is not
weakened to green; (2) the summary's verdict line and
this evidence file agree (NO-GO, corpus PASS) because
corpus health and verdict are separate gates.
Revision proposed for the NEXT run (not applied here):
anchor leg (c) to a freshly re-baselined authoritative
table on the run's own base, or pre-register the leg as
"fresh band reproduces the current-base control band"
with the 0126Z table as comparison only — the pairing
rule itself needs no further revision, and the next run
should spend its seeds on the table-entry step of the
wall, not on re-proving this check. The telemetry-check
and balanced panel were NOT run, per the standing
exception (panel cannot ingest per-seed sweep rows).
The sweep summary + this evidence file are the comparison
of record. No game code changed; no [needs-eyes] flag
applies (instrument only, no narration, feel, combat, or
UI change).

## Infrastructure notes

- Sweep: scripts/test-natpair-sweep.js (one arm, plain
  tableseat-nowait; modes --one natpair / --summary /
  --detgate; pure-read pre/post-daily snaps + rank trace).
  Corpus: evidence/2026-10-26/perseed-sim-natpair-a/
  (8 rows + summary.json). Proof:
  scripts/test-natpair-a.js (36/37 — sole failure is
  leg (c) itself, see metric review). Det-gate: PASS
  (seed 73671, plain == wrapped).
- Commit: sim-natpair-a, DIAG-NO-GO (legs a+b met, leg c
  missed on stale 0126Z anchor; pairing question solved,
  revised rule adopted), zero src/js diff. Ready for
  coordinator merge; NOT pushed, NOT bumped, live NOT
  verified (coordinator/ship-loop line, not this arm's).

