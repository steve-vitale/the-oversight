# sim-fledcover-a — fled-with-origin coverage (DIAG-GO, STRONG)

**Verdict: DIAG-GO (STRONG)** — the prereg's stronger bar is met:
3 fled lingerer fights observed with origin, covering the full
contrast: clear-tile fled restores, blocked-tile fled melts
against a named fellow besieger, and a chaser fled restores
after the pursuit exhausts. The code prediction (tbEnd's guard
is textually identical for 'fled' and 'lost') is now an
observation, not just a reading.
Run: flesh-out loop, run fleshout-20261030T1215Z, worker
sim-fledcover-a, axis scale-onramp (blocking axis, converging,
NOT converged). DIAG ONLY — no game changes, no default flip,
no gate move, no deed-bar move. No [needs-eyes]: this arm
changes no feel, combat, or UI — it only measures, using
existing recorder fields plus a scripted scenario harness
that plays real fights through the engine. The flee-inducing
scenarios are instruments and change no default.
Committed on branch, pending coordinator merge. No push, no
version bump, no live verification (the batch ship job owns
deploys).

Prereg: `evidence/2026-10-30/sim-fledcover-a-prereg.md`
(committed f8a7f10e9, BEFORE any judged analysis).
Leg N corpus (fresh band, sweep-draftflag-a.js verbatim):
`evidence/2026-10-30/perseed-fledcover-a/` (8 rows + 8
census files + summary.json; corpus valid, census valid
per the sweep's own summary gate).
Leg S scenarios: `evidence/2026-10-30/sim-fledcover-a-scenarios.json`.
Analysis: `evidence/2026-10-30/sim-fledcover-a-analysis.json`.
Harness: `scripts/test-fledcover-a.js` (fixtures +
scenarios). Analyzer: `scripts/analyze-fledcover-a.js` (pure:
reads corpus JSON + scenario JSON, never touches game
state, never writes into the corpus).

## What was asked

Blockedrestore + dissolve left exactly one half of
linger-keeps unobserved: the fled half. On band
75101-75116 there were 0 tbend 'fled' events, and
dissolved rows cannot supply fled observations by
construction — an EMPTY POPULATION, not a zero rate.
The lost half was measured (13/24 blocked, 54.2%, all
13 blockers fellow besiegers at (4,4)). The open
question: when the scholar FLEES a lingerer fight, does
the restore block the same way as a lost restore?

## Prereg legs (header vs result)

| Leg | Prereg bar | Result |
|---|---|---|
| Prereg | committed before judged analysis | PASS — f8a7f10e9 before any judged analysis |
| Pilot gate | fixtures + 1 natural seed + 1 scripted scenario (S-clear) before full judged runs | PASS — fixtures 19/19; pilot seed 75201 clean (draftflag + scholarmelt firing, errs 0); S-clear reached tbEnd('fled') via the door with origin classified, in prototyping |
| Seeds (Leg N) | 8/8 valid | PASS — 8/8 (days > 0, draftflag + scholarmelt errs 0, overflow empty, sweep corpus + census gates true) |
| GO | >= 1 fled lingerer fight with origin + restore classified | PASS — 3, see below |
| STRONGER GO | >= 3 covering S-clear restored, S-blocked blocked, S-chase restored | PASS — exactly that split |
| Determinism | scenarios run twice byte-identical; analyzer run twice byte-identical; scratch removed | PASS — both DETERMINISM-PASS, scratch removed |
| Sense | >= 2 fled chains read end to end | PASS — all 3 scenario chains read end to end (see sense section) |
| Fixtures | test script green before judged analysis | PASS — FIXTURES-PASS 19/19 |

**Formal verdict is DIAG-GO (STRONG).** No metric was
re-scored mid-run; Leg C (policy-variant flee inducer)
was never invoked, because Leg S produced on its first
run — the contingency stays unbuilt, as preregistered.

## The judged counts

### Leg N — natural fresh band (seeds 75201-75208, 180d
### death-aware, tableseat-nowait policy/env verbatim)

tbend events (worldOrigin fights only): 54 total —
won 25, routed 9, lost 20, **fled 0**. Scholarmelt
meetings: 0 with result 'fled' (all bands' scholar TB
fights: won/lost/routed/dissolved only). The natural
fled population is empty on a SECOND band, with a
different seed set, policy stack, and siege composition
— the emptiness reproduces. No fled-rate claim is made:
with 0 observations there is no rate, on either band.

Nearest-miss corroboration (not a fled result, but the
mechanism's other half reproducing): all 20 Leg N
tbend 'lost' rows are lingerer-origin, and 4 of them
blocked exactly the old-band way — a named fellow
besieger standing on (4,4) at tbEnd:

| Seed | Day | Origin (lost) | Blocker |
|---|---|---|---|
| 75201 | 176 | gallowdeer, 1 HP | eater, 702 HP, w4, (4,4), lingering cleared |
| 75201 | 180 | eulogy, 405 HP | redactor, 195 HP, w3, (4,4), lingering |
| 75208 | 81 | eulogy, 675 HP | eulogy, 675 HP, w4, (4,4), lingering |
| 75208 | 81 | eulogy, 675 HP | herald, 525 HP, w4, (4,4), lingering |

The other 16 lost lingerers restored. The lost-restore
blocking shape (fellow besieger at the treeline tile)
is band-independent; only the fled half was ever
missing, and Leg S supplies it.

### Leg S — scripted scenarios (seed 75102, engine-real)

Each scenario: scholar on the haven tile (4,4), a
lingering raidBorn world monster spawned there,
startCombat on its id (so tbfight.worldOrigin is the
lingerer — verified in the snapshot, never assumed),
>= 2 damaging strikes with real stats, then flee
through the engine's own exit (Haven door, or repeated
barrier crossings for the chaser). Villagers were moved
to the neighbouring node (3,4) so the scholar fights
alone — solo scholar fights are the scholarmelt
corpus's own shape, and the setup is documented in the
test script, not hidden.

| Scenario | Monster (follows) | Flee via | Strikes dealt | Scholar HP end | Restore outcome |
|---|---|---|---|---|---|
| S-clear | gallowdeer (false) | Haven door, 1 step | 18, 13 | 44 | **RESTORED** — origin back at (4,4) at 130 HP (fighter end HP; cap min(400 pre, 130) matches exactly) |
| S-blocked | gallowdeer (false) + callback blocker, 200 HP, same tile | Haven door, 1 step | 18, 13 | 44 | **BLOCKED** — origin absent; callback 200 HP, w3, lingering, (4,4) still stands |
| S-chase | bulldozer (true) | Barrier, 2 crossings | 5, 8 | 100 | **RESTORED** — origin back at (4,4) at 68 HP (fighter end HP; cap min(400 pre, 68) matches exactly) |

Answer, plainly: **yes — a fled restore blocks the
same way as a lost restore.** The guard is one branch
for both results, and observation now agrees with the
code: tile clear → the lingerer comes back wounded;
fellow besieger still on the tile → the lingerer
melts, and the blocker is named. There is no
fled-specific mercy and no fled-specific penalty in
the restore path — the only fled-specific line is the
say text. The fled half of lingerer-keeps is no longer
unobserved: 3 observations, 2 restored, 1 blocked,
with the blocker's identity and tile recorded on the
blocked row.

## Wall numbers (Leg N corpus only, report-only)

won 2/8 (full 0), national ever 7/8, national final
4/8, table reached 4/8, table entered 2/8, wave reach
at-least 8/8/7/4/0 (wave 5: 0/8), sweep median days 180
(capped-horizon median; per-seed days 180, 180, 180,
164, 39, 158, 180, 94), deaths 287. No before/after
claim: Leg N ran the baseline policy stack unchanged,
and Leg S is a scenario harness, not a lever. These
numbers are NOT mixed with the carried 75101-75116
band numbers (wins 9/16, national ever 13/16, median
118d) — two bands, two lines, never averaged.

## Reachability verdict

Unchanged by this arm (measurement only): waves 1-4
reachable, wave 5 unreachable on both bands judged
here (0/16 old, 0/8 fresh), the table reachable only
through the lesser seat, the full seat unreached.
What this arm changes is the wall's plumbing, not its
height: lingerer-keeps is now fully observed — lost
24 + fled 3 (scenario) classified, dissolved 120
classified by dissolve-a — and the fled question is
answered: fled restores block like lost restores.

## Village assessment (plain words)

When the scholar runs from a siege fight, the beast
behaves exactly as when the scholar loses: if the
treeline patch is empty, the beast is still standing
there afterwards, wounded from the fight; if another
besieger is already standing on that patch, the beast
you ran from is gone, crowded out by its own side.
Running does not save a beast that has nowhere to
stand, and it does not doom a beast that has room.
The siege drains the same way whether the scholar
loses or flees — one beast per exit, blocked by the
next beast in line. The one thing natural play still
never shows is the scholar actually running: on two
whole bands of real villages, the scholar fought,
routed, or died, but never fled a siege fight — the
villages' fighters simply don't run from the treeline.
That is a behavior fact about the policies, not about
the restore rule, which the staged fights prove works
as written.

## Sense notes (chains read end to end)

- SENSE-PASS on all three scenario chains (the
  scenario JSON is the trace: origin snapshot, strike
  log, flee steps, post-end world check; node-sim
  stubs Game.say to no-op, so there is no say
  transcript — stated as such, as in prior arms).
- S-clear chain: gallowdeer lingerer lifted from
  (4,4) (origin HP 400 world, fighter 161 fresh roll —
  wave-1 fighters do NOT enter at world HP; the
  wave-4+ world-HP rule in scholarmelt-a does not
  apply here, and the restore cap uses the fighter's
  end HP regardless). Scholar strikes 161→143 (scholar
  88) then 143→130 (scholar 66); steps onto the door
  tile (4,6) and the fight ends 'fled' in one move;
  scholar health settles at 44 (monster turns between
  the last strike and the door step — the exchange
  stays honest).
  Origin back at (4,4) at exactly 130: the wall-wounds
  cap (min of pre-fight 400 and fighter-end 130)
  holds to the number.
- S-blocked chain: identical strikes and door step,
  but the callback (200 HP, lingering, spawned on
  (4,4) before startCombat, never a fighter) still
  stands on the tile at tbEnd, so the gallowdeer is
  absent from the world list afterwards. The block is
  not about the blocker being strong or weak — 200 HP
  is a healthy beast — it is about the tile being
  held. This is the same shape as the 4 fresh-band
  lost blocks above (eater/redactor/eulogy/herald at
  (4,4)); fled and lost blocks are the same event
  with a different exit verb.
- S-chase chain: bulldozer outside Haven. Scholar
  approaches (7,4), strikes 81→76, then 76→68, walks
  to the west edge, crosses to (3,4) — chase
  continues, fighter re-enters at (1,4) — walks to
  the edge again, crosses to (2,4), pursuit exhausts
  (2 crossings = bulldozer's chase persistence), and
  the fight ends 'fled'. Origin back at (4,4) at 68.
  Fidelity flag, disclosed: the bulldozer never landed
  a blow in this scenario (scholar HP 100 throughout).
  Its turns advanced and its pursuit played out on
  the grid, but the damage exchange was one-sided —
  plausibly range/positioning on the grounds grid,
  not investigated further because the restore
  classification does not depend on it. A future
  chase scenario that wants a two-sided damage log
  should pick a chaser that closes range reliably;
  this scenario proves the chase-to-fled-to-restore
  path, not a damage race.
- Leg N nearest-miss sense (why natural fled never
  happens): the scholar's policy fight loop strikes
  until the fight ends won/lost/routed — there is no
  policy leg that walks a lingerer fight to an exit.
  The 20 lost lingerer rows are the counterfactual
  population: the scholar stays and dies (or the
  beast routes) rather than leaving. A natural fled
  observation would need a policy that actually
  chooses to run, which is Leg C territory — unbuilt
  by design here, since Leg S already answered the
  restore question. The natural-band emptiness is a
  finding about policy behavior, not about the rule.

## Metric review

- The prereg bound the run and was honored: no metric
  was re-scored mid-run. The GO bar (>= 1 fled
  lingerer fight with origin + classified restore)
  and the STRONGER bar (clear-restored, blocked,
  chase-restored) were both stated before judged
  analysis and both met exactly as stated.
- Population-definition discipline, kept: "linger-
  origin" here means the tbend/scenario origin
  snapshot (lingering && !titan). It is NOT the
  dissolved-row definition (lift.lingering, used
  because worldOrigin is null on dissolved rows) —
  the two instruments share a concept, not a field,
  and the evidence file states which one applies
  wherever the term appears.
- Scripted scenarios prove mechanism, not frequency:
  2 restored / 1 blocked across 3 staged fights is
  NOT a fled restore rate and must never be quoted as
  one. The natural-band fled rate remains unmeasured
  (0 observations on two bands) — that is a coverage
  statement about natural play, and it stands
  alongside, not against, the mechanism verdict.
- Prereg-wording note for the NEXT run (not a revision
  to this verdict): the pilot-gate phrase "S-clear
  reached tbEnd('fled')" was satisfied in prototyping
  before the full judged run; the judged S-clear run
  itself is the committed scenario JSON, and the
  prototype outputs were scratch and removed — no
  prototype number appears in any judged count.
- Instrument lesson (disclosed): see Infrastructure
  notes — the safe-commit index clobber (known class)
  hit the prereg commit and was repaired the same way
  as prior arms.

## Infrastructure notes (disclosed, all repaired)

- safe-commit index-clobber (known class from the
  repo's AGENTS.md lessons) hit the prereg commit
  (f8a7f10e9): bogus staged deletion, worktree file
  intact, commit contents verified byte-identical to
  the worktree file before repair; repaired via
  update-index --cacheinfo from the HEAD blob and
  verified `git status` clean + `git diff HEAD` empty
  before proceeding. The commit itself is correct;
  only the main index lied.
- Corpus untouched by the analyzer (pure reads; output
  goes to the analysis JSON beside it). Scratch
  (probes, pilot log, determinism second runs) removed
  before the work commit; `git status` shows only
  committed-work files.
- No jest was run by this arm (fixtures + scenarios
  are plain node scripts; the --cacheDirectory rule is
  vacuous here, recorded as such rather than claimed).
  No new recorder field was built: Leg N reuses the
  draftflag + scholarmelt recorder fields verbatim,
  so there is no overlap with the parallel
  sim-dissolvecause-a arm's recorder to flag.

## RANKED NEXT (with numbers — no lever built here)

1. NATURAL FLED OBSERVATION (policy behavior, not a
   rule question): 0 fled tbend events on 24 seeds
   across two bands (75101-75116 + 75201-75208).
   If a future arm wants a natural fled lingerer
   fight, it needs a policy that chooses to run from
   a lingerer fight (the prereg's Leg C, unbuilt) —
   the restore answer no longer depends on it, but
   the "villagers never flee sieges" behavior fact
   is now the open item, and it bears on whether
   siege fights ever end any way but death or rout.
2. BLOCKED-RESTORE DESIGN QUESTION (steve-call,
   carried from blockedrestore, now strengthened):
   a fled lingerer melts whenever ANY fellow besieger
   still stands on the treeline tile — 1/1 blocked
   scenario here, 13/24 lost on the old band, 4/20
   lost on the fresh band. Should the restore
   displace/queue when the tile is held, or is
   melt-while-the-siege-continues intended? The
   question now covers fled as well as lost, by
   observation, not just by code reading.
3. CHASE-SCENARIO FIDELITY (small): the S-chase
   bulldozer never landed a blow (scholar HP 100
   throughout). A two-sided chase scenario would
   firm up the chase path's damage story; the
   restore verdict does not wait on it.
4. DISSOLVE-CAUSE RECORDER (carried, parallel arm's
   work — not touched here): 120 dissolved fights, 0
   with a recorded cause. Fate is settled (dissolve-a
   + this arm); cause is not.

## Convergence state

scale-onramp: converging, NOT converged. Full seat 0,
wave 5 0 on both bands judged here, as on every band
this cycle. No axis is converged. No gate number was
moved on this evidence, per the 2026-10-29
gate-sequencing note (prove behavior normal before
tuning gates to it). What converged further is the
linger-keeps rule in full: lost, fled, and dissolved
halves all now have measured fates, and the fled
answer is the same as the lost answer — the treeline
tile decides, not the exit verb.
