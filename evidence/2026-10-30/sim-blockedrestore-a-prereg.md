# sim-blockedrestore-a — PREREGISTRATION (binding, committed BEFORE any judged analysis)

Run: flesh-out loop, run fleshout-20261030T1015Z, worker
sim-blockedrestore-a. Axis: scale-onramp (blocking axis,
converging, NOT converged). Ranked-next #1 from run
fleshout-20261030T1015Z
(evidence/2026-10-30/sim-scale-onramp-round-1015.md) and
draftflag ranked-next #2: the BLOCKED-RESTORE CENSUS.

DIAG ONLY, measurement only, zero src/js game changes, no
default flip, no gate move, no deed-bar move. No [needs-eyes]:
this arm changes no feel, combat, or UI — it only analyzes
an already-recorded corpus. No new recorder: see the gap
analysis below — the tbend events already in the draftflag
corpus carry everything the blocked question needs except
one named gap, which is reported as UNMEASURED-cause rather
than papered over with a new sweep.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; wave-3
callback and wave-4 suburb/audit instances are the
characters in this census). NO CANON-registered doc covers
a tbEnd restore or a blocked restore specifically — the
mechanism below is read from code (src/js/game.js tbEnd,
never invented), stated exactly so it can be checked, and
is NOT canon.

## Mechanism, read from code (game.js tbEnd, ~line 44359)

The restore block runs only when a worldOrigin exists and
the result is not 'won'. Inside it:

- isLingerer = origin.lingering AND NOT origin.titan.
- lingererKeeps = isLingerer AND (result === 'fled' OR
  result === 'lost'). A routed lingerer broke and ran
  (treeline clear of it); a slain one is gone. A routed
  NON-lingerer (wild non-lingering origin, or a titan
  piece) is still restored, as is a fled/lost lingerer.
- Restore is attempted only if stillUp (some fighter copy
  of the origin is alive with hp > 0, or there is no
  fighter copy at all) AND the origin is not already in
  the world list AND monsterAt(origin.tx, origin.ty) is
  empty (one tile, one monster). On restore, a lingerer
  keeps its pre-fight wounds (capped at pre-fight hp, never
  healed); a non-lingerer restores at full hp.
- CONSEQUENCE for classification: a not-restored origin is
  NOT automatically "blocked". It is blocked only when the
  guard's tile-occupancy test is what failed — i.e. the
  tbend event's occupantBefore is a DIFFERENT monster
  standing on the origin tile. A 'won' result and a
  routed lingerer are BY-DESIGN-NOT-RESTORED (the code
  never attempts the restore). Any other not-restored
  eligible case with no occupant is a different cause
  (most plausibly stillUp false — the fighter copy died —
  but stillUp is NOT recorded in the tbend event), and
  must be reported UNMEASURED-cause, never called blocked.

## Corpus and substrate (binding, verbatim from the assignment)

- Corpus: evidence/2026-10-30/perseed-draftflag-a/ as
  committed by sim-draftflag-a (16 seeds 75101-75116,
  180d death-aware horizon, tableseat-nowait substrate).
  This arm runs NO new sweep and NO new sims: the
  analyzer reads the committed corpus read-only and
  writes only evidence/2026-10-30/sim-blockedrestore-a-analysis.json
  (plus this prereg and the evidence file).
- Gap analysis (why no new recorder): the draftflag
  tbend events already carry, per worldOrigin tbEnd call:
  origin (uid, id, wave, hp, maxHp, tx, ty, lingering,
  raidBorn, titan), occupantBefore (same snapshot shape
  or null), occupantSameAsOriginBefore, originInWorldBefore,
  result, restored, originInWorldAfter, occupantAfter, day,
  seq. That is sufficient to judge blocked-vs-restored
  for every tbend event. The ONE gap: fighter-standing
  state (stillUp) at tbEnd is not in the event, so an
  eligible not-restored row with no occupant cannot be
  attributed to a cause from this corpus. That gap is
  named as the missing hook (a tbEnd-wrap fighter-standing
  snapshot) and those rows are UNMEASURED-cause; building
  that recorder plus a re-sweep is a follow-up arm, NOT
  this one, because the assignment directs an analyzer
  over the existing corpus. No new recorder is built here
  and no gap is silently filled.
- Dissolved rows: scholarmelt meetings with result
  'dissolved-no-tbend' ended WITHOUT a tbEnd call (the
  scholarmelt recorder flushes them when tbfight is null
  with no tbEnd). They therefore have NO tbend event by
  construction and cannot be classified from tbend
  events. They are counted band-wide and reported
  UNMEASURED for the blocked question, with the named
  missing hook (a dissolve-path recorder). They are never
  folded into the blocked count.

## Populations and classification rules (binding)

Notation: an event is ELIGIBLE iff origin exists AND
result !== 'won' AND (NOT isLingerer OR result in
{'fled','lost'}), where isLingerer = lingering AND NOT
titan, all read from the event's origin + result fields.

PRIMARY POPULATION — every tbend event with result
'lost' (the melt question: a scholar loss against a
lifted origin that should have gone back to the treeline).
Each such event is classified exactly one way:

- RESTORED: restored true.
- BLOCKED: restored false AND ELIGIBLE AND
  occupantBefore non-null AND NOT
  occupantSameAsOriginBefore AND originInWorldBefore < 0.
  The blocker is occupantBefore, reported with uid, id,
  hp, maxHp, wave, tx, ty, lingering, raidBorn, titan.
  The block is judged on occupantBefore (guard time),
  never on occupantAfter.
- BY-DESIGN-NOT-RESTORED: restored false AND NOT
  ELIGIBLE (result 'won', or a routed lingerer). This
  class cannot occur inside the 'lost' population except
  via a corrupt event (a 'lost' event is ELIGIBLE by
  construction for lingerers and non-lingerers alike) —
  if one appears, it is a data error, reported as such.
- UNMEASURED-cause: restored false AND ELIGIBLE AND NOT
  BLOCKED (occupantBefore null, or same-as-origin, or
  originInWorldBefore >= 0). Cause not in the event;
  missing hook: tbEnd-wrap fighter-standing snapshot
  (standing fighter hp/alive at tbEnd, i.e. stillUp).
  NEVER called blocked.

EXTENDED POPULATION — all tbend events (every result),
same four classes. This gives the band rate of blocked
restores on the full denominator as well as on the lost
denominator, so a 'lost'-only rate cannot hide a
'routed'-origin block pattern or vice versa.

DISSOLVED POPULATION — scholarmelt meetings with result
'dissolved-no-tbend': counted per seed and band-wide,
reported UNMEASURED (no tbend event exists; missing hook:
dissolve-path recorder). Not classified, not counted as
blocked or restored.

SCHOLARMELT LINKAGE (context only, never the census):
scholarmelt meetings with result 'lost' are counted, and
each tbend 'lost' event is heuristically linked to a
meeting on the same seed where dayStart <= tbend.day <=
dayEnd AND worldOrigin.id == tbend.origin.id AND
worldOrigin.hp == tbend.origin.hp. Linked/unlinked counts
are reported to show coverage; the census itself is over
tbend events directly and does not depend on linkage.
A tbend 'lost' event with no linked meeting is UNLINKED,
not UNMEASURED — its classification stands on its own
fields.

ANCHOR (regression, must reproduce exactly): the
draftflag secondary leg — s75116, day 159, tbend event
with origin uid 29 (suburb, 960, (4,4), lingering true),
result 'lost', restored false, occupantBefore uid 33
(callback, hp 1, (4,4), lingering true, raidBorn true).
If the analyzer does not reproduce this row exactly, the
analyzer is wrong and the run is DIAG-NO-GO.

BLOCKER BREAKDOWN (for every BLOCKED row): blocker hp
(hp == 1 vs hp > 1), wave, id, tile (haven (4,4) vs
other), lingering, raidBorn, titan. 1-HP marker
corroboration (reported, not required for the class):
whether the blocker uid has a draft event in the same
seed's corpus with hpAfter == 1 (the wall-floor
signature); a 1-HP blocker with raidBorn + lingering +
a floor-tolled draft row is the floor class, a 1-HP
blocker without it is 1-HP by fight damage or spawn.
The floor itself cannot be proven from the tbend event
alone, and the evidence must say so.

1-HP PATTERN VERDICT RULE (judged on the BLOCKED rows
of the extended population): let n = number of BLOCKED
rows, k = BLOCKED rows whose blocker hp == 1.
- If n < 4: pattern verdict INSUFFICIENT-DATA (shares
  on fewer than 4 rows cannot support rule-vs-rarity).
- Else if k/n > 0.50 AND the 1-HP blockers span >= 2
  seeds: the 1-HP pattern is THE RULE (majority of
  blocks, not confined to one seed).
- Else if k/n <= 0.25: the 1-HP pattern is A RARITY.
- Else: COMMON BUT NOT THE RULE (between a quarter and
  a half, or confined to one seed).
The census verdict (DIAG-GO/NO-GO) is independent of
which pattern verdict comes out; only the pattern
verdict may be INSUFFICIENT-DATA.

## GO thresholds (binding)

- Prereg committed BEFORE any judged analysis: PASS
  required. (Instrument-design inspection of field
  vocabulary — event/result field names — and code
  reading preceded this prereg; no census count was
  judged before it. The analyzer's counts are the judged
  numbers.)
- Pilot gate (before the full-corpus census is judged):
  fixtures green + analyzer run on seed 75102 alone
  reproduces that seed's tbend rows exactly as in the
  full-corpus run + corpus integrity (git status clean
  for perseed-draftflag-a; corpus files untouched) +
  instrument firing evidenced from the corpus diag
  (pilot seed tbEndWithOrigin > 0, errs 0, overflow
  empty). A failed pilot gate stops the run.
- Seeds: 16/16 valid (row days > 0, draftflag errs 0,
  overflow empty, census present/sorted/within-1 — the
  validity criteria carried from the draftflag arm).
- Substrate: (a) corpus files byte-unchanged vs HEAD
  (this arm writes nothing into the corpus); (b)
  analyzer tbend totals reconcile per seed to the
  draftflag diag tbEndWithOrigin values already in the
  corpus; (c) row-minus-additive identity re-verified
  by the test script: every draftflag row minus
  {draftflag, scholarmelt, removal} byte-identical to
  the chainclose row for the same seed (the identity
  the draftflag arm proved; carried, re-checked here
  because this arm's substrate claim rests on it).
- Census completeness: every tbend 'lost' event
  classified (restored/blocked/by-design/unmeasured,
  zero unclassified); every dissolved meeting counted
  as UNMEASURED with its hook named; anchor reproduced
  exactly; blocker uid/hp/wave/tile stated for every
  BLOCKED row (a BLOCKED row missing any of those
  fields is UNMEASURED, not blocked).
- Determinism: analyzer run twice into separate outputs
  (second into a scratch dir) produces byte-identical
  analysis JSON; scratch removed after the diff.
- Sense: the anchor chain (fightSeq 23 + blocker uid 33
  census/draft context) and at least two further BLOCKED
  rows' census/draft context read end to end for meaning
  (does the blocker story cohere — a lingerer at the
  haven tile in the census, a draft row putting it
  there), not just counts. Node-sim stubs Game.say to
  no-op, so there is no say transcript; sense evidence
  is the structured trace, stated as such.
- Fixtures: scripts/test-blockedrestore-a.js green
  before the judged census is analyzed: classification
  rules on synthetic tbend events (restored; blocked
  1-HP; blocked high-HP; by-design won; by-design
  routed-lingerer; eligible routed non-lingerer blocked;
  titan routed eligible; unmeasured occupant-null
  eligible; same-as-origin not-blocked; already-in-world
  not-blocked), floor-marker corroboration lookup,
  anchor-shape check, substrate-identity leg, and the
  analyzer's per-seed reconciliation rule on a synthetic
  corpus.

## Verdict rule

- DIAG-GO iff prereg PASS + pilot gate PASS + 16/16
  seeds + substrate PASS + census completeness PASS +
  determinism PASS + sense PASS + fixtures PASS.
- DIAG-NO-GO on any failed leg. A miss is NO-GO, never
  re-scored against a friendlier metric mid-run; metric
  doubts go under "metric review" for the NEXT run.
  Every evidence file carries a "metric review" section.
- INSUFFICIENT-DATA is a verdict only for the 1-HP
  pattern sub-question (n < 4 blocked rows); it does not
  by itself fail the census if every other leg passes,
  in which case the verdict is DIAG-GO with the pattern
  sub-verdict INSUFFICIENT-DATA, stated plainly.
- NO lever verdict: this arm proposes no damage buff,
  gate move, deed-bar move, or game change. Its verdict
  is about the measurement (how often restores block,
  and on what), not about building to anything.
- Draftflag's, scholarmelt's, and removal's verdicts are
  carried, never re-judged: this arm censuses the
  draftflag corpus; it does not re-score their melts or
  their drafts. Do NOT re-judge draftflag targets under
  a different window without stating it as a new
  judgment under this prereg — no such re-judgment is
  made here.

## Method (staged, binding order)

1. This prereg, committed BEFORE any judged analysis.
2. Analyzer (scripts/analyze-blockedrestore-a.js, pure:
   reads corpus JSON, never touches game state, never
   writes into the corpus) + fixtures
   (scripts/test-blockedrestore-a.js), committed before
   the judged census is analyzed (fixture bar green
   first).
3. Pilot: seed 75102 — fixtures + per-seed reproduction
   + corpus integrity + instrument firing — before the
   full census is judged.
4. Full census (16 seeds), determinism gate (second run
   to scratch, diff, scratch removed), sense reads per
   the bar above.
5. Evidence evidence/2026-10-30/sim-blockedrestore-a.md
   with a prereg-legs table, per-class census numbers on
   both denominators, blocker breakdown by hp/wave/tile/
   lingering/raidBorn, the 1-HP pattern verdict under the
   prereg rule, the dissolved count with its hook named,
   wall numbers (report-only, substrate-identical,
   carried from the draftflag corpus), plain-words
   village assessment, metric review, and ranked next.
6. No src/js change, no push, no bump, no live
   verification, no merge to master by this worker (the
   coordinator merges; sibling loop B may move master
   under this branch — rebase cleanly at the end and
   re-run the proof; rebase conflict = FAIL LOUDLY, no
   force, no merge).

## Node harness

No harness is run by this arm: the analyzer and the test
script are plain node scripts over committed JSON (the
draftflag corpus). No jest is run by this arm (the
sweep/analyzer/test are plain node scripts); the
--cacheDirectory rule is therefore vacuous here and is
recorded as such rather than claimed.
