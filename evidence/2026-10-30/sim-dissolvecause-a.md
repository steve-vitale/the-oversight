# sim-dissolvecause-a — dissolve-cause recorder + fresh sweep (DIAG-GO)

**Verdict: DIAG-GO** (every GO bar met: the recorder fires on
all 120 dissolved rows with a cause and a scholar HP at
dissolve, both sense questions are answered from the fresh
corpus, the substrate is identical, and the instrument moved
nothing in the game).
Run: flesh-out loop, run fleshout-20261030T1215Z, worker
sim-dissolvecause-a, axis scale-onramp (blocking axis, converging,
NOT converged). BUILD + MEASUREMENT: the recorder is built
here, then a fresh sweep on the draftflag substrate. Recorder-only,
additive, no behavior change, no default flip, no gate move,
no deed-bar move. No [needs-eyes]: this arm changes no feel,
combat, or UI — it only records.
Committed on branch, pending coordinator merge. No push, no
version bump, no live verification (the batch ship job owns
deploys).

Prereg: `evidence/2026-10-30/sim-dissolvecause-a-prereg.md`
(committed 734dd74d7c, BEFORE any judged analysis).
Instruments: `evidence/2026-10-30/sim-dissolvecause-a-prereg.md`
plus recorder edit + sweep copy + analyzer + fixtures
(committed 0b688cf4741e901db8a8602015a2fe846e8d4d79, fixtures
52/52) and the analyzer substrate-normalization refinement
(committed be5fa8b8e64be51bd7bc145b64b5afa8eefb4909, before the
confirm sweep).
Corpus (fresh, this arm's sweep):
`evidence/2026-10-30/perseed-dissolvecause-a/` (16 seeds
75101-75116, 180d death-aware horizon, tableseat-nowait
substrate — the draftflag corpus is read-only and untouched).
Analysis: `evidence/2026-10-30/sim-dissolvecause-a-analysis.json`.
Recorder: `scripts/policies/scholarmelt-diag.js` (policy-side
only; zero src/js changes). Sweep:
`scripts/sweep-dissolvecause-a.js` (verbatim copy of the
draftflag sweep except the EVID dir). Analyzer:
`scripts/analyze-dissolvecause-a.js` (reuses dissolve-a's
classifyDissolved/isLingererOrigin by require, never
re-implemented). Fixtures: `scripts/test-dissolvecause-a.js`.

## What was asked

Dissolve-a classified the draftflag corpus's 120 dissolved
scholar fights for FATE (75 SCHOLAR-RESTORED
presence-at-flush, 45 SPAWN-ENDED, 0 melts) but 0 of 120
carried a dissolve CAUSE — no call-site field existed.
Two questions survived: (a) what code path starts a herald
fight with no tile monster (the s75104 phantom-herald seed:
45 spawn-ended dissolved fights, scholar grinding 100->35 HP
over d96-d101), and (b) within-day scholar HP steps at
successive dissolved starts — do dissolved starts
themselves cost HP? The known barrier-death dissolve site
in game.js was a lead to check, NOT a finding. This arm
built the recorder (call-site field + scholar HP at
dissolve time + a barrier-death stamp + a start-post
discrimination snapshot) and ran a fresh sweep on the same
substrate to answer them.

## Prereg legs (header vs result)

| Leg | Prereg bar | Result |
|---|---|---|
| Prereg | committed before judged analysis | PASS — 734dd74d7c before any judged analysis |
| Pilot gate | 8 seeds 75101-75108: fixtures + validity + instrument firing + substrate leg before confirm judged | PASS — fixtures 52/52; 8/8 valid; pilot dissolved 120, cause 120/120, HP 120/120; substrate normalized true 8/8 |
| Seeds | 16/16 valid | PASS — 16/16 (days > 0, scholarmelt errs 0, overflow empty, census sorted + lastDay within 1) |
| Cause coverage | dissolveCause on >= 95% of dissolved rows | PASS — 120/120 (100%), all 'start-post-gone' |
| HP coverage | scholarHpAtDissolve on ALL dissolved rows | PASS — 120/120 (100%), all exact-HP (start-post) rows, 0 bound-HP rows |
| Questions | (a) and (b) answered from the fresh corpus | PASS — see below; (a)'s start path answered, barrier lead rejected by measurement, one residual sub-step named as follow-up, not hidden |
| Classification completeness | every dissolved row classified, 0 UNCLASSIFIED | PASS — 120/120, 0 UNCLASSIFIED |
| Substrate | row-minus-scholarmelt identical 16/16 + census identical 16/16 | PASS (normalized; raw difference disclosed — see substrate section) |
| Determinism | pilot rows re-run byte-identical, scratch removed | PASS — 8/8 pilot seeds byte-identical (rows + census); scratch removed at closeout |
| Sense | >= 2 dissolved chains read end to end | PASS — 3 chains read end to end (see sense section) |
| Fixtures | test script green before judged analysis | PASS — FIXTURES-PASS 52/52 (re-run after the analyzer refinement, before confirm) |
| Wall numbers | recomputed from the fresh corpus, checked vs draftflag | PASS — exact match on every figure (see below) |

**Formal verdict is DIAG-GO.** No lever verdict: this arm
proposes no damage buff, gate move, deed-bar move, or any
game change. The recorder is an instrument; its findings
name follow-up work, but no fix lands here.

## The judged counts

Band dissolved cause distribution (fresh corpus, this arm's
analyzer run):

| Cause | Count | Share |
|---|---|---|
| start-post-gone (fight gone at startCombat post-record, no tbEnd seen) | 120 | 100% |
| flush-next-start / flush-tbend-mismatch / flush-sweep-end | 0 | 0% |
| barrier-death (tbBarrierExit stamp) | 0 | 0% |
| null (instrument failure) | 0 | 0% |
| **Total** | **120** | **100%** |

Per-seed dissolved: 75102: 32, 75104: 45, 75105: 43, all
other seeds 0 — the same three seeds and the same counts
as the draftflag corpus. Every dissolved row is an
exact-HP row (observedAt 'start-post', 120/120) and a
barrier-stamp-free row (0/120 stamped).

Fate split (re-checked on the fresh corpus via dissolve-a's
classifier, verbatim): SCHOLAR-RESTORED 75, SPAWN-ENDED
45, DISSOLVED-MELT 0, BYSTANDER-OR-NONMONSTER 0,
UNCLASSIFIED 0. Lingerer-origin (lift.lingering, never
worldOrigin): 60 rows, 60 SCHOLAR-RESTORED, 0 lacking a
restore fate, all cause 'start-post-gone'.

Start-post probe distribution (120/120 rows carry the
snapshot): tbfightState 'null' 120/120, bearerChanged
false 120/120, gameOverAfter false 120/120. Split by
post-call state: scholar.monster alias still 'herald'
74 rows; scholar.monster null + pendingMonsterId
'herald' 45 rows; scholar.monster 'herald' +
pendingMonsterId 'reunion' 1 row (s75105 fightSeq 56,
d151 — the last dissolved row of that day's cluster,
after the day's real fights left the scholar at 41 HP;
the pending slot is shared, not herald-specific, and
the row's fate and cause are unchanged by it).

## The two assigned questions, answered plainly

1. **(a) What starts a herald fight with no tile monster?
   A pending-encounter resolution, not a world bump —
   and NOT the barrier-death site.** The 45 spawn-ended
   rows have no tile monster at fight start (lift null,
   census: no herald anywhere on the seed's map on those
   days) and a live 'herald' pending that is STILL THERE
   after the call (pendingMonsterId 'herald' on all 45).
   That is the shape the game's own raid-naming code
   describes for a pending-resolved fight: instantiated
   by species id, not lifted from a tile entity — which
   is why there is nothing to lift, nothing to restore,
   and nothing at stake. The pending survives each
   dissolved start (still 'herald' afterwards), so the
   scholar's bot faces it again and again — 5 to 12
   starts a day for six days on s75104 — and every
   attempt dissolves the same way. The barrier-death
   lead is REJECTED BY MEASUREMENT, not by argument:
   0 of 120 rows carry a barrier-death stamp, and the
   probe shows bearer unchanged and game not over on
   120/120 rows — but barrier-death requires a live
   fight, a player turn, and a crossing death, and
   these fights never reach a player turn (they are
   gone at their own startCombat return, with no tbEnd,
   no throw, and no same-call routing on any row).
   RESIDUAL, STATED NOT HIDDEN: the exact in-call step
   that nulls tbfight is not identified by this
   instrument. What is bounded is: it happens inside
   the startCombat call (tbfight null at return),
   without tbEnd, without a throw, without death, and
   without a mantle pass. A follow-up in-call probe
   (tbfight snapshots across the opening-turn window)
   is ranked next #1; the start path above does not
   depend on it.
2. **(b) Do dissolved starts themselves cost HP? No —
   exactly zero, on every row.** Within-fight delta
   (scholarHpAtDissolve minus scholarHpStart of the
   SAME row, exact-HP start-post rows only): 120 rows,
   120 zero, 0 negative, 0 positive, mean 0. A dissolved
   start costs nothing — the scholar's HP at dissolve
   observation equals HP at start on all 120 rows,
   including every row of the s75104 grind. The HP
   steps the prior arm saw are BETWEEN-fight deltas
   (next row's scholarHpStart minus this row's
   scholarHpAtDissolve, exact anchors only): 117 pairs,
   99 zero, 13 negative, 5 positive, mean -0.33.
   Same-day pairs: 100 pairs, 95 zero, 5 negative —
   all five exactly -2 (s75102 only), i.e. a small
   between-start cost (an action or tick between two
   starts on the same day), NOT the dissolved fight
   itself (within delta 0 on those very rows: e.g.
   seq 24 at 65->65, next start at 63). Cross-day
   pairs: 17 pairs, 8 negative, 4 zero, 5 positive.
   The s75104 grind (100->88->76->64->47->35) is
   entirely cross-day between-deltas (-12, -12, -12,
   -17, -12) with ZERO non-dissolved scholar meetings
   on d96-101 and zero within-day movement — overnight
   / between-day attrition while the scholar faces a
   phantom, not damage from the dissolved fights. The
   s75105 cross-day -59 and -48 are real-fight days
   (the scholar fought and bled in real fights those
   days, then dissolved-starts resumed), and the
   cross-day positives (+59, +43, +26, +11, +10) are
   recoveries between days. Nothing in the HP path
   implicates the dissolved starts.

## Substrate (the recorder moved nothing)

- Row-minus-scholarmelt, path-normalized: identical to
  the draftflag corpus rows on 16/16 seeds. Census
  files: byte-identical on 16/16 seeds. Days,
  per-seed meeting counts, and every wall figure match
  exactly (see wall numbers).
- Raw-byte row comparison is false on 16/16 seeds, and
  the reason is disclosed, not smoothed: the removal
  recorder's stack frames embed the ABSOLUTE worktree
  path of the sweep process, and this corpus was
  written from worktree sim-dissolvecause-a while the
  draftflag corpus was written from sim-draftflag-a
  (same file, same line — e.g. sim-harness.js:515 in
  both; only the worktree slug differs). The analyzer
  normalizes that slug and reports both raw and
  normalized results; the leg judges the normalized
  comparison, because the raw one tests the directory
  name, not the game. No game field differs anywhere
  else. (Lesson for a future recorder: stack frames
  should store basenames, as the sweep header already
  requires of corpus rows.)
- The analyzer refinement that added this
  normalization was committed BEFORE the confirm sweep
  (be5fa8b8e64be51bd7bc145b64b5afa8eefb4909) and the
  fixtures were re-run green after it; no comparator
  change was made after any judged number was produced.

## Wall numbers (recomputed from the fresh corpus)

Exact match to draftflag/blockedrestore on every figure:
wins 9/16 (all lesser, full 0), national ever 13/16,
national final 11/16, table reached 12/16, table
entered 9/16, wave reach 16/16/14/9/0, median survival
118d, deaths 527. No before/after claim is made: the
recorder is an instrument, and the identical wall is
its neutrality proof, not a lever result.

## Reachability verdict

Unchanged by this arm (measurement only): waves 1-4
reachable, wave 5 unreachable on this band (0/16), the
table reachable only through the lesser seat, the full
seat unreached. What this arm changes is the wall's
plumbing, not its height: dissolved scholar fights now
have a measured cause (start-post-gone, 120/120) and a
measured HP path (dissolved starts cost 0 HP), the
barrier-death lead is closed, and the phantom-herald
loop is explained — a surviving pending re-faced until
something else breaks the cycle.

## Village assessment (plain words)

When the scholar faces the great herald beast, sometimes
the fight never starts at all — it falls apart in the
same breath it was called, leaving the beast exactly
where it was and the scholar exactly as healthy as
before. On two seeds the scholar meets a real herald at
the haven's edge again and again, and every time the
fight dissolves, the beast is still standing there
afterwards, at the same strength, until its siege
posting ends and it wanders off on its own. On the
third seed there is no beast at all — only the promise
of one, a herald the village was told is coming — and
the scholar spends six days facing that promise, over
and over, while the promise never arrives and never
leaves. The scholar's strength does slip across those
six days, but not because of the empty fights: nothing
happens inside them. The strength goes overnight,
between the days, while the scholar keeps facing a
beast that isn't there. The one thing still unseen is
what, inside the call that starts the fight, makes it
vanish — that step leaves no footprint this recorder
can see, and it is the next thing to look for.

## Sense notes (chains read end to end)

- SENSE-PASS on three chains. Node-sim stubs Game.say to
  no-op, so there is no say transcript; sense evidence is
  the structured trace (meeting rows, probe snapshots,
  census trajectories), stated as such.
- Chain 1 — s75102 herald uid 29 (the pinned herald).
  Census d73: (5,5) 700 non-lingering; d74: (4,4) 700
  lingering; d75: (4,4) 679 lingering; d80: (4,4) 679
  non-lingering; d81: (8,3) 679 (wandered off). The 32
  dissolved starts (d74-d80) all carry cause
  start-post-gone with HP at dissolve equal to HP at
  start (e.g. d75: 89->89, 87->87, 87->87, 87->87, 87->87,
  85->85, 85->85, 85->85, 85->85) and the probe shows
  the scholar.monster alias still 'herald' after each
  call. The cause label coheres with the census: the
  beast persists through every dissolved start at the
  strength the draft left it, and leaves only when its
  posting ends. The d74->d75 census step 700->679 (21
  damage from a source outside the scholar trace) is
  carried from dissolve-a, still unattributed, still
  not claimed as a dissolved-fight effect — the
  dissolved rows now prove they dealt none of it
  (within delta 0).
- Chain 2 — s75104 spawn-ended grind (the phantom
  herald). Census d95-d101: NO herald anywhere; zero
  non-dissolved scholar meetings d96-101. All 45
  dissolved rows carry cause start-post-gone, no lift,
  probe pendingMonsterId 'herald' after every call,
  HP at dissolve equal to HP at start on every row
  (d96: 100 x5; d97: 88 x9; d98: 76 x9; d99: 64 x10;
  d100: 47 x9; d101: 35 x3). The chain reads exactly
  as the (a) answer says: a pending that survives
  every attempt to face it, re-faced 5-12 times a day,
  costing the scholar nothing per attempt, while the
  scholar's strength drains ~12 a night between days
  from something outside these fights. The grind is
  real, but its cause is not the dissolved starts.
- Chain 3 — s75105 herald uid 38 (draft, wound, persist).
  Census d143-144: (4,4) 525 non-lingering; d145: (4,3)
  525 (wandered); d149: (2,4) 525; d150: (4,4) 350
  lingering (re-drafted, toll 175); d156: (4,4) 350
  non-lingering; d157: (4,2) 350 (wandered). Dissolved
  starts track the census exactly (d144 at 525
  non-lingering, d150-d155 at 350 lingering, d156 at
  350 non-lingering), all cause start-post-gone, all
  HP-at-dissolve equal to HP-at-start — including
  d151's dissolved rows at 41 HP after the day's real
  fights (the scholar bled in real fights, not in
  dissolved ones) and d153-d156's rows at 100/100/52/95
  as the scholar recovered between days. The last
  dissolved row of the d151 cluster (fightSeq 56) is
  the corpus's one 'reunion'-pending row: the pending
  slot held a reunion after that call, a reminder the
  slot is shared — but the row's cause, fate, and HP
  are identical in kind to the rest.

## Metric review

- The prereg bound the run and was honored: no metric
  was re-scored mid-run. Cause coverage (100%) and HP
  coverage (100%) both cleared their bars outright;
  no bar needed reinterpretation.
- One prereg-wording refinement, made BEFORE the
  confirm sweep and disclosed in full: the substrate
  leg as literally written (raw byte identity of
  row-minus-scholarmelt) fails on a recording-environment
  artifact — the worktree slug embedded in removal
  stack frames — while every game field is identical.
  The analyzer now reports raw AND normalized substrate
  results and judges the normalized one. This is a
  comparator correction, not a verdict rescue: the
  leg's intent (the recorder must not move the game)
  is met on all game data (census byte-identical,
  wall figures exact), and the raw failure is visible
  in the analysis JSON (substrate.allRowsRaw=false)
  for anyone who wants to check. A future prereg
  should write the substrate leg as "identical modulo
  recorded filesystem paths" from the start.
- The (a) verdict's scope, stated precisely: the
  prereg asked what code path STARTS a herald fight
  with no tile monster, and that is answered (the
  pending-encounter resolution path, barrier-death
  rejected by measurement). The deeper question —
  which in-call step nulls tbfight — is a different,
  narrower question that this instrument bounds but
  does not close; it is ranked next #1 rather than
  answered by assertion. If the coordinator reads the
  (a) bar as requiring that step too, the verdict on
  that reading would be NO-GO on (a) alone — the
  evidence is written so that call can be made without
  re-running anything.
- The fled population is untouched by this arm (no
  fled claim is made here); dissolve-a's fled answer
  (0 tbend fled events) stands as carried.
- Instrument lesson (disclosed): see Infrastructure
  notes — the safe-commit index clobber (known class)
  hit all three commits in this run and was repaired
  the same way each time; the container EPERM flap
  slowed git operations (12s safe-commit) but lost no
  data.

## Infrastructure notes (disclosed, all repaired)

- safe-commit index-clobber (known class from the
  repo's AGENTS.md lessons) hit all three commits in
  this run (prereg 734dd74d7c, instruments
  0b688cf4741e901db8a8602015a2fe846e8d4d79, analyzer
  refinement be5fa8b8e64be51bd7bc145b64b5afa8eefb4909):
  bogus staged deletions (and one staged modification),
  worktree files intact, commit contents verified
  byte-identical to the worktree files before repair;
  repaired each time via update-index --cacheinfo from
  the HEAD blob and verified `git status` clean +
  `git diff HEAD` empty before proceeding. The commits
  themselves are correct; only the main index lied.
- Corpus untouched except by this arm's own sweep: no
  file under evidence/2026-10-30/perseed-draftflag-a/
  or perseed-scholarmelt-a/ was written by this arm.
  The fresh corpus perseed-dissolvecause-a/ is this
  arm's sweep output and is committed with this
  evidence; determinism scratch went to a worktree
  scratch dir and was removed at closeout.
- No jest was run by this arm (sweep + analyzer + test
  are plain node scripts); the --cacheDirectory rule
  is vacuous here, recorded as such in the prereg
  rather than claimed.

## RANKED NEXT (with numbers — no lever built here)

1. IN-CALL DISSOLVE PROBE (the surviving mechanism
   question): 120 dissolved fights vanish inside their
   own startCombat call with tbfight null at return,
   no tbEnd, no throw, no death, no mantle pass, and
   no barrier stamp. A follow-up recorder that
   snapshots tbfight across the opening-turn window
   (tbBeginTurn/tbAdvance entry-exit, plus the
   wrapper post-steps) would bracket the nulling step.
   Until then, no claim about WHICH line dissolves
   these fights should be made — the bounds above are
   the finding.
2. PHANTOM-PENDING LIFECYCLE (design question, from
   the (a) answer): a pending 'herald' survives 45
   dissolved facing attempts across six days. Should a
   pending whose resolution dissolves be consumed,
   expired, or re-offered differently — or is the
   re-facing loop itself the intended pressure? The
   scholar loses ~12 HP a night during the loop from
   an outside source; whether that attrition is the
   intended price of a phantom siege is a design call,
   not a measurement.
3. SAME-DAY -2 STEPS (minor, 5 rows): between-start
   steps of exactly -2 HP on s75102 same-day pairs,
   source not in the scholar trace. Small and bounded;
   a recorder that logs the bot's between-start
   actions would attribute it, but it is not a
   dissolved-fight effect (within delta 0 on those
   rows) and needs no urgent work.
4. STACK-FRAME BASENAMES (recorder hygiene, no game
   change): the removal recorder embeds absolute
   worktree paths in stack frames, breaking raw
   byte-identity across worktrees. Storing basenames
   (as the sweep header already requires of corpus
   rows) would make future substrate legs pass raw.

## Convergence state

scale-onramp: converging, NOT converged. Full seat 0,
wave 5 0 on this band, as on every band this cycle. No
axis is converged. No gate number was moved on this
evidence, per the 2026-10-29 gate-sequencing note (prove
behavior normal before tuning gates to it). What
converged further is the dissolve plumbing: a dissolved
scholar fight now has a measured cause (start-post-gone,
120/120) and a measured HP path (dissolved starts cost
0 HP), the barrier-death lead is closed by measurement,
and the phantom-herald loop is explained as a surviving
pending re-faced until something else breaks the cycle.
The backlog item "dissolved meetings need a dissolve-path
recorder" is now RETIRED: the recorder exists, it fired
on 100% of dissolved rows, and its cause field is the
instrument future arms should reuse.
