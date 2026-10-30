# sim-dissolveprobe-a — in-call dissolve probe (PILOT-STOPPED, mechanism ANSWERED)

**Verdict: DIAG-NO-GO on the prereg bars — with the mechanism
question itself ANSWERED.** Read that sentence carefully, because
the two halves point in opposite directions and both are true:

- The prereg's bracket bar FAILS as written: 0 of 120
  reproduced dissolved rows bracket to a live→null window,
  because no such window exists. The fight is never created.
  The bar's premise (a live fight that gets nulled inside
  startCombat) is false for this population, so the bar cannot
  be met by any instrument that tells the truth. Per
  MEASUREMENT.md §14 this is recorded as a NO-GO on the bar,
  never re-scored — the revision belongs to the NEXT run
  (see Metric review).
- The pilot-gate substrate leg FAILS as written too:
  row-minus-scholarmelt is NOT path-normalized-identical to
  draftflag (0/8 pilot seeds), because the probe's own
  removeWorldMonster wrapper frame shifts the removal
  recorder's 8-frame stack window. Every game field is
  identical (proven: 0 residual diffs after frame-shift
  reconciliation on all 8 pilot seeds; census byte-identical).
  The leg fails on a recorder-observable artifact of the
  probe, not on a game difference — but as written, it
  fails, and a failed pilot gate stops the run. No confirm
  sweep was run. No 16-seed numbers are claimed.
- THE QUESTION IS ANSWERED ANYWAY: the step that "nulls
  tbfight" is no step at all. The 120 dissolved fights are
  TITAN-ENTRY-GATE REFUSALS. The titans.js startCombat
  wrapper refuses a solo scholar face of the Herald before
  core startCombat ever runs: one say, return null, no fight
  created, no tbEnd, no HP cost, no barrier, no mantle. The
  probe log proves the non-creation (4 events, never live,
  on 120/120 rows), and code elimination names the gate
  (see below). The prior arm's 'start-post-gone' label is a
  misnomer for this population: nothing vanished — nothing
  was ever created.

Run: flesh-out loop, run fleshout-20261030T1315Z, worker
sim-dissolveprobe-a, axis scale-onramp (blocking axis,
converging, NOT converged). DIAG ONLY, no game change, no
src/js change, no gate move, no deed-bar move, no default
flip. No [needs-eyes]: this arm changes no feel, combat, or
UI — it only records. Committed on branch, pending
coordinator merge. No push, no version bump, no live
verification (the batch ship job owns deploys).

Prereg: `evidence/2026-10-30/sim-dissolveprobe-a-prereg.md`
(committed d4c52f84, BEFORE any judged analysis).
Instruments: `scripts/policies/dissolveprobe-diag.js` (NEW
policy file; zero edits to scholarmelt-diag.js or any game
file) + `scripts/sweep-dissolveprobe-a.js` (verbatim copy of
the dissolvecause sweep except the disclosed deltas) +
`scripts/analyze-dissolveprobe-a.js` (reuses the
dissolvecause analyzer by require) + fixtures
`scripts/test-dissolveprobe-a.js` (committed 3a4b5b17,
FIXTURES-PASS 72/72 under BOTH wrap orders, before any
judged analysis).
Pilot corpus (8 seeds 75101-75108 ONLY — the run stopped
at pilot): `evidence/2026-10-30/perseed-dissolveprobe-a/`.
Pilot analysis: `evidence/2026-10-30/sim-dissolveprobe-a-pilot-analysis.json`.
The dissolvecause and draftflag corpora are READ-ONLY and
untouched; the main tree was never touched; no sibling
worktree was touched; no jest was run.

## Prereg legs (header vs result)

| Leg | Prereg bar | Result |
|---|---|---|
| Prereg | committed before judged analysis | PASS — d4c52f84 before any judged analysis |
| Fixtures | test script green before judged analysis | PASS — FIXTURES-PASS 72/72 (both wrap orders) |
| Pilot validity | 8/8 seeds valid (days > 0, scholarmelt errs 0, PROBE errs 0, probe overflow empty, census sorted + lastDay within 1) | PASS — 8/8 valid; probe errs 0 on all seeds; probe overflow empty on all seeds |
| Pilot instrument firing | pilot dissolved rows carry a probe log; probe windows > 0 | PASS — 120/120 dissolved rows carry a probe log; windows 242 across pilot seeds |
| Pilot substrate | row-minus-scholarmelt path-normalized identical to draftflag pilot rows | FAIL AS WRITTEN — 0/8 normalized (see substrate section: the ONLY difference is the probe's own wrapper frame in removal stacks; all game data identical) |
| Pilot reproduction | dissolved rows reproduced (0 = instrument NO-GO) | PASS — 120 rows, same seeds (75102/75104/75105), same counts (32/45/43), same fates (75 SCHOLAR-RESTORED / 45 SPAWN-ENDED), same cause (120 start-post-gone) |
| Probe coverage (pilot) | probe log on >= 95% of dissolved rows | PASS on pilot — 120/120 (100%) |
| Bracket rate (pilot) | counting bracket (call or gap) on >= 95% of probe-carrying dissolved rows | FAIL AS WRITTEN — 0/120 (all 'no-live-event': the fight is never live, so no live→null transition exists to bracket) |
| Classification completeness | every dissolved row classified, 0 UNCLASSIFIED | PASS on pilot — 120/120, 0 UNCLASSIFIED |
| Determinism | pilot rows re-run byte-identical, scratch removed | SPOT-CHECK PASS — s75102 row + census byte-identical on re-run; scratch removed (full confirm-stage leg not run: pilot stopped) |
| Sense | >= 2 dissolved chains read end to end | PASS — s75102 pinned-herald chain + s75104 phantom chain (see sense section) |
| Wall numbers | recomputed, checked vs dissolvecause | PASS on pilot band — row-equality proof (below) implies identical pilot-band wall figures |

**Formal verdict is DIAG-NO-GO** (two failed legs as
written). NO lever verdict: this arm proposes no damage
buff, gate move, deed-bar move, or any game change. The
NO-GO is on the bars, not on the question — the question
has a proven answer, stated next.

## The answer, plainly: a gate refusal, not a dissolve

The step inside the startCombat call that "nulls tbfight"
does not exist, because for these 120 rows core startCombat
never runs. The call chain is:

1. The scholar bot calls `Game.startCombat('herald')` (or
   with the herald pending).
2. The titans.js startCombat wrapper runs FIRST (load-time
   wrap, inside the recorder/probe wraps). It computes
   `titanId = 'herald'` because herald IS a titan def
   (`src/data/titans.json`: herald key, title THE HERALD,
   wave 4, minAllies 10, "arrive by omen and are faced by
   coalition only (hard gate, 10+ allies)").
3. It asks `Game.titanEntryGate('herald')`. That function
   (finale-campaign.js) returns null for every titanId
   except 'finale' — so for herald there is NO campaign
   override, and the flat hard gate applies.
4. The hard gate checks `titanMusterReady('herald')`:
   mustered allied blades + committed Haven blades >=
   minAllies (10). The scholar bot faces alone (or without
   10 mustered blades), so the gate answers false.
5. The wrapper says the muster text once ("⛔ THE HERALD
   does not notice you the way prey notices a hunter... You
   cannot face this alone — sound the call, muster 10
   allied blades (you have N)..."), records
   `titanRecordOutcome('herald', 'refused', {gate:
   'muster', have, need})`, and returns null WITHOUT
   calling core startCombat.
6. No fight object is ever created. No tbEnd runs (there
   is nothing to end). No HP changes (nothing fights).
   No barrier, no mantle, no throw. The recorder,
   watching from outside, sees a startCombat call that
   returns with no fight and no tbEnd — and (correctly,
   by its own definitions) logs 'start-post-gone'. But
   "gone" misleads: the fight did not go. It was never
   let in.

Why this is proven, not guessed — elimination over all
ten startCombat wrappers, read in full: buildarounds,
godpath, godverbs, party, party-formal, and overtime all
always delegate to orig; network refuses only network
piece ids; finale refuses only finale_crew/finale_opening
mids; titans refuses exactly titanDefs mids failing the
entry gate. Core startCombat's own early return (the
'Already in a fight' refusal) requires a LIVE fight at
entry — contradicted on every row by the probe's enter
snapshot (null) and the recorder's kind 'start' (not
'refused'). The probe log shape matches the titans
refusal exactly and nothing else: startCombat enter
(null) → ONE say (enter/exit, null) → startCombat exit
(null). Four events, never live, on 120/120 rows.

What the probe does NOT capture (stated, not hidden):
the say TEXT. Node sims stub Game.say to a no-op, and
this probe records say events without their arguments —
so the log proves a one-say refusal but does not carry
the gate's have/need numbers. The muster-gate
identification above rests on code elimination
(titanEntryGate null for herald → muster branch is the
only branch that can refuse herald), not on captured
text. A follow-up probe that captures say arguments
would close this last inch (see Ranked next #1).

Consequences that follow immediately (for the
coordinator, not decided here):
- The s75104 "phantom-herald grind" is re-explained: the
  pending 'herald' survives because no fight ever starts,
  so nothing ever consumes it — the scholar re-faces a
  gate, not a beast, 5-12 times a day for six days. The
  ~12 HP/night attrition is still between-day, still not
  a dissolved-fight effect (within delta 0, dissolvecause).
- The s75102/s75105 "pinned herald" rows are the same
  refusal wearing a different census: the beast stands on
  the tile, lingering, while the scholar is refused at
  the gate again and again. The beast is untouched by the
  refusals (census HP 700→679 from an outside source,
  same as dissolvecause — still unattributed, still not
  a refusal effect).
- The "dissolved" population is not one mechanism: this
  arm proves the herald 120 are gate refusals. Whether
  OTHER dissolved populations (other mids, other bands)
  are also refusals or true in-call nulls is unmeasured
  — the probe's refusal signature (never-live + one say)
  is the test to apply to them.

## The judged pilot numbers

- Dissolved rows reproduced: 120 (s75102: 32, s75104: 45,
  s75105: 43; all other pilot seeds 0) — identical seeds
  and counts to dissolvecause/draftflag.
- Probe logs: 120/120 (100%). Every log is the same
  4-event shape: startCombat enter (null) → say
  enter/exit (null) → startCombat exit (null). Zero
  tbBeginTurn events, zero tbAdvance events, zero tbEnd
  events, zero body-phase events on any dissolved row —
  because core startCombat never runs.
- Brackets per the prereg rule: 0/120. Reason on all
  120: 'no-live-event' (no event ever shows a live
  fight). Window counts, window×tbEnd counts, and kind
  counts are all empty — correctly, since no bracket
  exists under a rule that requires a live→null
  transition.
- Cause (re-checked via reused classifier): 120/120
  'start-post-gone'. Fate: 75 SCHOLAR-RESTORED, 45
  SPAWN-ENDED, 0 melts, 0 UNCLASSIFIED. (The cause and
  fate labels are carried from the recorder; the
  mechanism section above reinterprets what
  'start-post-gone' MEANS for this population.)
- Non-dissolved scholar fights on the pilot band DO show
  rich windows (e.g. s75105 seq 1: 72 events from enter
  null through beginApexHunt/tele/villageEvent live states
  to exit live) — the probe works; the dissolved rows
  are empty because their calls do nothing.
- Wall numbers, pilot band (8 seeds, recomputed):
  won 6 (full 0), national ever 6, national final 6,
  table reached 7, table entered 6, wave reach
  8/8/7/5/0, median survival 114d, deaths 232. These
  match the dissolvecause pilot subset by the
  row-equality proof below (the wall is computed from
  row fields, which are identical).

## Substrate (the probe moved no game data)

- Row-minus-scholarmelt vs dissolvecause rows (same
  comparator, pilot seeds): identical on EVERY field
  except `removal` stack frames — and within removal,
  identical on every field except the stack window.
- The removal recorder keeps an 8-frame window. The
  probe's removeWorldMonster wrapper frame sits on top
  of that window (it is the direct caller of the
  removal recorder's orig), pushing the deepest frame
  out. After accounting for exactly that one-frame
  shift (probe frames[1:] == baseline frames[:7], same
  for funcs), residual differences are ZERO on all 8
  pilot seeds, all events (53/58/41/54/72/71/46/21).
  Census files: byte-identical 8/8. Event counts
  identical. No game field differs anywhere.
- Against draftflag (the prereg's comparator): the same
  frame shift PLUS the known worktree-slug difference
  (dissolvecause's metric review) explain the whole
  gap; the leg as literally written (path-normalized
  identity) still fails, because the comparator does
  not strip probe frames. That is a comparator gap, not
  a game difference — disclosed here, fixed in the next
  run by dropping the removeWorldMonster wrap (see
  Ranked next #1). The probe's neutrality on game data
  is proven; its neutrality on recorder stack text is
  not, and the distinction is stated rather than
  smoothed.

## Attach-rule findings (disclosed, immaterial to dissolved rows)

- Orphan-end rows (a tbEnd for a fight whose start was
  not recorded) are created OUTSIDE any probe window and
  therefore carry no log of their own; the NEXT window's
  post attaches its log to them (attach rule: fightSeq
  >= max-at-entry, unlogged). This explains attached
  exceeding windows by exactly the orphan count (s75105:
  81 attached / 80 windows, 1 orphan; s75107: 11/10, 1
  orphan). Orphans always carry tbEnd results, never
  dissolved results, so no dissolved bracket is affected.
- Nested startCombat calls are REAL (s75105 seq 46/47:
  two 'won' starts sharing one 72-event log): when a
  startCombat call nests inside another window, the
  inner post attaches its log to both the outer row
  (still unlogged) and its own row, and the outer
  window's true log is discarded. The fix for the next
  run is a claimed-set attach rule (claim only rows
  created during this buffer's lifetime, minus rows
  already claimed by nested buffers) — exact for sweep
  order (probe outermost) and for nesting. This does
  NOT affect dissolved rows: a nested herald call during
  a live fight logs kind 'refused', never dissolved;
  dissolved rows' windows are never nested; and every
  refusal window's log has the identical 4-event shape,
  so even a misattributed refusal log would still read
  as a refusal.
- The prereg's set-difference attach description is
  generalized by the max-fightSeq rule implemented here
  (exact under both wrap orders for non-nested
  windows); the claimed-set rule above supersedes both
  for the next run. Fixtures prove both orders attach
  correctly for non-nested windows (72/72).

## Sense notes (chains read end to end)

- SENSE-PASS on two chains. Node-sim stubs Game.say to
  no-op, so there is no say transcript; sense evidence
  is the structured trace (meeting rows, probe logs,
  census trajectories), stated as such.
- Chain 1 — s75102 pinned herald (32 dissolved rows,
  d74-d80). Census: d73 (5,5) 700 non-lingering; d74
  (4,4) 700 lingering; d75-d79 (4,4) 679 lingering; d80
  (4,4) 679 non-lingering; d81 (8,3) 679 (wandered off).
  Every dissolved row's log is the 4-event refusal
  signature. The chain reads coherently as refusal, not
  combat: the beast sits on the tile, lingering, at
  (4,4), while the scholar is turned away at the gate
  day after day; the beast's HP step 700→679 comes
  from outside the scholar trace (as dissolvecause
  found — still unattributed, still not a refusal
  effect); the beast leaves only when its posting ends.
  A "fight" that leaves both parties exactly as they
  were, 32 times, is not a fight — it is a door that
  does not open.
- Chain 2 — s75104 phantom herald (45 dissolved rows,
  d96-d101). Census d95-d101: NO herald anywhere; zero
  non-dissolved scholar meetings d96-101. Every row's
  log is the same 4-event refusal signature, with the
  pending 'herald' still live afterwards (dissolvecause
  probe). The chain reads as a scholar knocking on a
  door behind which nothing stands: the pending
  promises a coalition fight, the gate refuses the solo
  scholar, the pending survives because no fight ever
  starts, and the scholar knocks again tomorrow. Six
  days of knocking; the strength that drains (~12/night)
  drains between days, from elsewhere.
- What the refusal MEANS for the village (plain words
  below) is a design question the measurement hands
  upward, not a verdict the measurement makes.

## Village assessment (plain words)

When the scholar walks up to the great herald beast, the
fight never starts — not because the beast wins, not
because the scholar runs, but because the call to gather
has not been answered. The herald is not a beast you
meet on the road. It is a beast you face with an army
behind you, ten blades at least, or it does not notice
you at all — the way weather does not notice a field.
So the scholar stands at the edge of the world, alone,
and is turned away. Again the next day. Again the day
after. On one seed there is not even a beast standing
there — only the promise of one, a herald the village
was told is coming — and the scholar spends six days
being turned away from a promise. Nothing is lost in
these turnings-away: no blood, no ground, no beast.
What is lost is the days themselves, and the scholar's
strength between them, worn down by something else
entirely while the door stays shut. The old label said
these fights "dissolved." They did not dissolve. They
were refused. The door was never opened, and the
question now is whether the scholar should keep
knocking, or go and gather the blades that would make
the door open.

## Metric review

- The prereg bound the run and was honored: no metric
  was re-scored mid-run. The bracket bar failed on its
  own terms (0/120) and is reported as failed, not
  reinterpreted — even though the mechanism question
  has a proven answer. The substrate bar failed on its
  own terms (0/8 normalized) and is reported as failed,
  not normalized away — even though the game data is
  proven identical.
- Metric premise failure (for the NEXT run, not this
  one): the bracket rule assumed a live fight that gets
  nulled. For refusal populations the correct bracket
  kind is 'refusal': window never live + a single say
  event + the gate identified from the say text (or
  from wrapper elimination). A revised prereg should
  define: refusal bracket = (windowKind 'refusal',
  gate from say text when captured, else from
  elimination), counted alongside call/gap brackets,
  with probe coverage still >= 95% and a refusal
  distribution reported in full. The 120 pilot rows
  would all take the refusal bracket under that rule —
  but that rule was NOT in force for this run, so no
  GO is claimed on it here.
- Comparator revision (for the NEXT run): the substrate
  leg should read "identical modulo recorded filesystem
  paths AND recorder wrapper frames" — or, preferably,
  the probe should simply not wrap removeWorldMonster
  (its body-gap information is marginal and its stack
  cost is proven), making the existing leg pass raw.
  Either way the leg's intent (the probe must not move
  the game) is met on all game data here.
- Instrument revisions (for the NEXT run, all
  recorder-only, no game change): (a) capture say/sysSay
  first-argument text on window events (the gate's
  have/need numbers live in that text); (b) drop the
  removeWorldMonster wrap; (c) claimed-set attach rule
  (claim rows created during this buffer's lifetime
  minus rows already claimed by nested buffers).
- The pilot-stop rule worked as designed: a failed
  pilot gate stopped confirm spend. The pilot corpus is
  committed as pilot data (8 seeds), not presented as
  a 16-seed band.

## RANKED NEXT (with numbers — no lever built here)

1. REFUSAL-PROBE FOLLOW-UP (the surviving instrument
   work): re-run with say-text capture + refusal bracket
   kind + no removeWorldMonster wrap + claimed-set
   attach, on the same 16-seed band, to confirm the
   gate text (muster have/need per row) on all 120
   rows and to re-judge substrate + bracket under a
   revised prereg. Until then, no claim about WHICH
   gate text fired per row should be made beyond the
   elimination proof here (muster branch, since
   titanEntryGate is null for herald).
2. SCHOLAR-FACES-TITAN DESIGN QUESTION (for the
   coordinator/Steve, not a measurement): the scholar
   bot faces a coalition-only titan solo 5-12 times a
   day, is refused every time, and the pending never
   consumes — is the re-facing loop intended pressure
   (go muster, then return), or should a refused solo
   face route the scholar toward mustering (or stop
   re-facing until the muster is ready)? The refusal
   is correct gate behavior; the LOOP is the open
   question. (Dissolvecause ranked-next #2, the
   phantom-pending lifecycle, is now this question.)
3. OTHER DISSOLVED POPULATIONS (measurement): apply
   the refusal signature (never-live + one say) to any
   dissolved rows on other bands/mids. A dissolved row
   WITH a live window is a true in-call null and would
   be a different mechanism entirely — none exists on
   this band.
4. ATTACH-RULE + STACK HYGIENE (recorder hygiene, no
   game change): claimed-set attach (above); stack
   frames should store basenames (dissolvecause
   ranked-next #4, still open).

## Convergence state

scale-onramp: converging, NOT converged. Full seat 0,
wave 5 0 on this band (pilot subset), as on every band
this cycle. No axis is converged. No gate number was
moved on this evidence, per the 2026-10-29
gate-sequencing note. What converged further is the
dissolve plumbing — decisively: the 120 "dissolved"
herald fights are not fights that vanish, they are
faces refused at the coalition gate, and the
startCombat window for them contains no combat at all.
The backlog item "dissolved meetings need a
dissolve-path recorder" stays retired (the recorder
exists and fired on 100%); the new backlog item is the
refusal probe + the scholar-faces-titan loop question
above.

## Infrastructure notes (disclosed, all repaired)

- safe-commit index-clobber (known class) hit both
  commits in this run (prereg d4c52f84, instruments
  3a4b5b17): bogus staged deletions, worktree files
  intact, commit contents verified byte-identical to
  the worktree files before repair; repaired each time
  via update-index --cacheinfo from the HEAD blob and
  verified `git status` clean + `git diff HEAD` empty
  before proceeding. The commits themselves are
  correct; only the main index lied.
- Corpus untouched except by this arm's own sweep: no
  file under perseed-draftflag-a/ or
  perseed-dissolvecause-a/ was written by this arm.
  The pilot corpus perseed-dissolveprobe-a/ is this
  arm's sweep output (8 seeds) and is committed with
  this evidence; determinism scratch was removed at
  closeout.
- No jest was run by this arm (sweep + analyzer + test
  are plain node scripts); the --cacheDirectory rule is
  vacuous here, recorded as such in the prereg rather
  than claimed. No sibling worktree was touched; the
  main tree was never touched.
- Pilot sweep wall-clock note (not a finding): the
  8-seed pilot took ~7 minutes of process time with
  per-seed output buffered until completion; the rows
  were all on disk before the session result delivered.
  No hang, no data loss.
