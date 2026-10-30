# sim-scholarmelt-a — PREREGISTRATION (binding, committed BEFORE any judged analysis)

Run: flesh-out loop, run fleshout-20261030T0738Z (coordinator-assigned
worker sim-scholarmelt-a). Axis: scale-onramp (blocking axis, converging,
NOT converged). Ranked next #1 by sim-recurrence-a
(evidence/2026-10-30/sim-recurrence-a.md).
DIAG arm, MEASUREMENT ONLY — zero src/js game changes, no default flip,
no gate move, no deed-bar move. This arm SPLITS a sink; building to it
is a later arm's job. No lever verdict is proposed here.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (Wave 4: The Mirror Draft;
bands damage 35-95, HP 850-1500). NO CANON-registered doc covers a
scholar tb-combat melt census specifically — the mechanism below is
read from code (game.js startCombat/tbEnd), stated exactly so it can
be checked, and is NOT canon. Governing canon rules: CANON.md
"Monster encounters are fought, not rolled" and the perception law
(Steve 2026-10-28): tile-mate presence is REPORTED from recorded state
only, never fed into any decision.

## Mechanism read from code (the hypothesis under test, never assumed true)

- startCombat (game.js): `_origin = playerMonster()` (tableTrial
  excepted); the tile monster is lifted (removeWorldMonster) ONLY when
  it IS one of this fight's monsters (_originIsFighter, by fighter id
  or mdef id match — the journey-scale r42 bystander hold: a bystander
  that is not a fighter stays on its tile and gets no worldOrigin).
- tbfight.worldOrigin is set ONLY for a lifted fighter that is a titan
  or lingering (besieging raider).
- tbEnd restores worldOrigin only when result !== 'won'; a lingerer
  only on 'fled'/'lost'; a titan on any non-won result if still
  standing (and the origin tile unoccupied). A restored lingerer comes
  back wounded (fighter HP, floored at 1, capped at pre-fight world
  HP); a restored titan comes back full.
- Every other lifted monster is never put back: it melts. A lifted
  ordinary wild monster therefore leaves the world on ANY tb outcome
  in which its fighter survives (fled/lost/routed/won-with-flight),
  and is a kill when its fighter dies.
- TB WORLD-HP (game.js, wave-4+ gate): the primary fighter (i == 0)
  for a lifted world monster enters at that monster's world HP, so a
  wave-4 scholar fight's fighter hpStart equals the world HP at lift
  (veteran fights excepted: tbWorldHpFor returns null for veterans,
  and the fighter rolls fresh — a veteran scholar fight therefore
  cannot be HP-matched to a chain; it is reported as VETERAN-UNMATCHED
  if it is the only candidate, never force-matched).
- In node sims, Game.say is stubbed to a no-op by scripts/sim-harness.js
  (unless narration is on — this arm does NOT turn narration on, because
  that would change the substrate). Scholar tb fights therefore have NO
  say transcript in this corpus. "Transcript evidence" for a scholar
  fight in this arm means its structured trace: lift snapshot, fighter
  HP path, tb result, post-end world presence. Villager field-meeting
  transcripts (w4dpr rec.log, engine-internal, not say) DO exist and
  are read under the sense bar. This limitation is stated here, not
  discovered after judging.

## Band and substrate (binding)

- Seeds 75101-75116 (16, the chainclose/recurrence band), 180d
  death-aware horizon (dead villages stop simulating; +10d tail max
  per MEASUREMENT.md §10 — the harness's death-aware stop).
- Policy: scripts/policies/tableseat-nowait.js VERBATIM.
- Game substrate env (verbatim from chainclose/recurrence):
  LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1, W4DPR=1,
  BREAKLINE=1, TILEJOIN=1, SHOUTREC=1, JOINENDLINES=1.
- Recorder stack (reused verbatim from the chainclose sweep, never
  edited): fieldparty-form-diag, w4dpr-diag, breakline-diag,
  tilejoin-diag, shoutrec-diag, joinendlines-diag.
- This arm's ONLY new code: scripts/policies/scholarmelt-diag.js (a
  record-only scholar tb-combat recorder: wraps Game.startCombat and
  Game.tbEnd, reads state, draws no RNG, writes no game state, never
  calls playerMonster() — the tile monster is read via
  Game.monsterAt(map.px, map.py) with scholar mx/my fallback, a pure
  scan — never calls villageStandingTotal()/unlockedWave(), and never
  stores tbfight.id (it contains Date.now()+Math.random() and would
  break the determinism gate; fights are keyed by a per-seed
  sequential fightSeq assigned by the recorder)), plus
  scripts/sweep-scholarmelt-a.js (a verbatim copy of the chainclose
  sweep with exactly three disclosed deltas: default EVID dir
  perseed-scholarmelt-a; the scholarmelt recorder installed at setup
  and re-installed in the daily hook alongside the other recorders,
  its store serialized as a new additive `scholarmelt` row field; a
  record-only daily world-monster census snapshot in the daily hook,
  copied verbatim from the recurrence sweep, written to
  census-s<seed>.json beside (never inside) the row),
  scripts/analyze-scholarmelt-a.js (a pure analyzer: reads corpus
  JSON, never touches game state; chains via the REQUIRED
  buildChains from scripts/analyze-chainclose-a.js — the fixed
  (seed,mid) grouping, never re-implemented, never edited there;
  fates via the REQUIRED censusMatch/classifyFate from
  scripts/analyze-recurrence-a.js — never re-implemented; censored
  therefore means horizon-survived ONLY, endReason == 'survived'),
  and scripts/test-scholarmelt-a.js (fixtures + determinism check).
- Existing tb melt recorders (scripts/policies/tbmelt-diag.js,
  scripts/policies/w4melt-diag.js) are NOT reused: tbmelt predates
  the r42 bystander hold (its header claims every tile monster is
  lifted, which current code contradicts), and neither recorder is
  composed on the chainclose six-recorder stack or keyed to the
  recurrence chains. Reusing either without re-proving it on this
  stack would import its assumptions; the new recorder is proven by
  this arm's own fixtures and substrate legs instead.
- RE-DERIVATION CLAUSE (binding): this run's OWN corpus IS the
  baseline. Do NOT quote recurrence's chain fates as current — the
  analyzer re-derives every chain fate from this corpus (own census
  + own six recorders) and cross-checks it against recurrence's
  committed analysis.json. A divergence is reported and investigated
  before judging, never forced.

## Universe and definitions (binding, fixed here)

SCHOLAR TB-COMBAT: every Game.startCombat call that actually starts a
fight (a tbfight exists after the call and was not refused for a live
fight), plus every Game.tbEnd call that ends a fight with no matching
start record (ORPHAN-END: fights whose tbfight was set directly, e.g.
save-restored fights, or started before the recorder installed).
Refused startCombat calls (fight already live) and thrown startCombat
calls lift nothing and are recorded as such, never in the census
denominator. A start with no tbEnd by run end is UNENDED (the run
ended mid-fight), classified as such, never dropped.

RECORDER ROW per fight (deterministic fields only — no tbfight.id,
no Date.now, no object references):
- fightSeq (per-seed sequential index, recorder-assigned), dayStart,
  dayEnd, intendedMid (startCombat arg or pendingMonsterId or
  'bulldozer'), tableTrial, coalitionArena flags as read from
  tbfight where present.
- lift: the pre-start tile monster snapshot or null (id, hp, maxHp,
  tx, ty, titan, lingering, veteran, spawnSeq where present) and
  lifted (true iff the snapshot monster is one of the fight's monster
  fighters — the _originIsFighter rule, read from the post-start
  fighter list — AND absent from worldMonsters() after start).
  A pre-start tile monster that is NOT a fighter is BYSTANDER-STAYS.
  A fight with no pre-start tile monster is SPAWNED (instantiated by
  id: pending wanderer, feast draw, contest wave, etc.).
- fighters: monster fighters at start (key, monsterId, hpStart,
  maxHp, veteran) and at tbEnd pre-call (alive, hpEnd, fled).
- end: tb result verbatim ('won'/'lost'/'fled'/'routed'/other),
  scholarHpEnd (player fighter hp/alive at tbEnd pre-call), and
  post-end world check: restoredIdentity (the lifted object reference
  is back in worldMonsters()), restoredEntry (id+tile match in the
  world list), restoredHp.
- Same-call routed fights (tbEnd runs inside startCombat before the
  start wrapper's post-record): the recorder tracks a pending stack —
  the start pre-record pushes a pending row; a tbEnd whose fight has
  a pending row adopts it; the start post-record then fills start
  fields only and never overwrites end fields. Joining is by pending
  stack order in the recorder, never by tbfight.id.

## CORRECTION #2 (pre-re-run, committed before any judged evidence)

After the first sweep, the recorder was found to leave `lifted` NULL
for every fight whose tbfight was already over (or null) when
startCombat returned — 120 dissolved herald fights, all UNCLASSIFIED
under the classifier, because the start post-record only filled
lift fields for live fights and same-call tbEnd fights. That is an
instrument gap, not a game finding: the prereg's dissolved rule
already assumes lifted is recorded. The fix (recorder only, zero
src/js): when tbfight is over/null at start post-record and no tbEnd
was seen, record post-start world presence of the lift object —
present ⇒ lifted=false (never removed by this fight), absent ⇒
lifted=true (removed during the call, no restore yet) — and mark
startPostFightGone. The dissolved classification order is clarified
to restored-first (an object back in the world by identity is not a
melt, whatever the lift flag says): restored (identity or entry) >
melt (lifted, absent) > spawned (no lift) > never-lifted (lift
present, lifted false). The substrate legs are unchanged and must
still pass on the re-run (row-minus-scholarmelt byte-identical,
census byte-identical); the first sweep's corpus is superseded by
the re-run's corpus, and the first sweep's analyzer output is
discarded (it judged a broken instrument, not the game). The 3
empty-fighter orphan tbEnd rows (no monster fighter, no lift, no
worldOrigin — provably no beast involved) are NOT reclassified by
this correction: prereg rule 2 calls fighters-unreadable orphans
UNCLASSIFIED, and they stay so. Likewise the strict matching window
(lastDay < dayStart) is NOT widened by this correction: a same-day
scholar fight found in the first sweep (s75102 algorithm, d71,
hp-exact 959 melt) stays a near-miss observation, not a judged
match — widening the window mid-run would be re-scoring, and the
same-day rule belongs in the NEXT run's prereg.

## CORRECTION (pre-sweep, committed before any judged analysis)

The fate list below omitted a code path found while writing the
recorder: the game dissolves some fights silently (game.js: tbfight
over=true, result='dissolved', tbfight=null — no tbEnd call), and the
dissolve comment states the monsters "melt back into the wilds like
any other fight that ends without a victor". A start whose fight is
gone without a tbEnd is therefore NOT simply UNENDED: the recorder
flushes it as dissolved when a later non-refused start, or sweep-end
finalize with no live fight, proves no fight is live. The flushed
row's melt verdict reads off the identity world check (tbEnd is the
only restore path, so a lifted object absent by identity has melted;
dayEnd on a flushed row is the FLUSH day, not the dissolve day, and
chain matching uses startDay, never dayEnd). Fate rule 1b is added
below; the sink size counts SCHOLAR-FLEE-MELT + DISSOLVED-MELT
together (reported split). Everything else in this prereg stands.

FATE CLASSIFICATION (priority order, first match; every fight gets
exactly one fate):
1. UNENDED — start with no tbEnd by run end AND a fight still live
   at sweep end (finalize leaves it pending).
1b. DISSOLVED-MELT — start flushed as dissolved (result
   'dissolved-no-tbend'), lifted == true, restoredIdentity false
   (the melt family; result verbatim). A flushed dissolved row with
   restoredIdentity true is SCHOLAR-RESTORED (dissolved subflag),
   and one with no lift is SPAWN-ENDED (dissolved subflag) — the
   flush proves the fight ended, the identity check proves the
   world outcome.
2. ORPHAN-END-RESOLVED / ORPHAN-END-UNRESOLVED — tbEnd with no start
   record: resolved iff its monster fighters are readable (then
   classified by rules 3-6 below with lift=null, i.e. lift unknown);
   unresolved iff fighters unreadable (counts as UNCLASSIFIED for
   the band leg — a recorder failure, not a game finding).
3. SCHOLAR-KILL — at least one monster fighter dead at tbEnd pre-call
   (pyrrhic subflag when result == 'lost'; result recorded verbatim).
4. SCHOLAR-FLEE-MELT — lifted == true, monster fighter(s) alive at
   end, post-end world check absent (restoredIdentity false AND
   restoredEntry false). Result recorded verbatim (fled/lost/routed/
   won-with-flight); the fate name says FLEE-MELT for the family,
   the result says which outcome.
5. SCHOLAR-RESTORED — lifted == true, post-end world check present
   (titan/lingering restore; restoredHp reported).
6. SPAWN-ENDED — lifted == false and no pre-start tile monster
   (spawned fight), monster fighter(s) alive at end (no world
   instance was ever at stake — not a sink).
7. BYSTANDER-OR-NONMONSTER — no monster fighter dead, no lifted
   monster, and either a bystander tile monster stayed or the fight
   had no monster fighters at all (hostile/alien/arena fight).
8. UNCLASSIFIED — anything else (must be 0 band-wide for DIAG-GO).

VANISHED CHAINS (the 4 from recurrence, re-derived here, never
copied): the BEAST-VANISHED chains of this corpus's own fate table,
expected to be (seed,mid) = (75102,algorithm), (75102,eulogy),
(75116,audit), (75116,suburb) — the analyzer ASSERTS the set matches
recurrence's set and reports any difference as a substrate divergence
to investigate before judging; it does not silently re-derive a
different 4 and call it the same question.

CHAIN MATCHING (scholar fight -> vanished chain; ALL must hold):
- Same seed AND same mid.
- Lifted == true AND lift.hp == chain remainingHp (the chain's last
  meeting mHpLeft, instance-level (mid,hp) discipline — type alone
  never matches).
- startDay strictly after the chain's last meeting day AND startDay
  <= firstAbsentDay, where firstAbsentDay is the first post-lastDay
  census snapshot day NOT containing the (mid,hp) instance (if the
  instance is never seen post-lastDay, firstAbsentDay is the first
  post snapshot day).
- Corroboration (reported, not a gate): wave-4 primary fighter
  hpStart == lift.hp; census tile of the instance on the fight day
  vs lift tile (a mismatch is disclosed, not hidden — the scholar
  moves during a day, so the morning snapshot tile need not equal
  the fight tile).
- A matched fight's fate IS the chain's split verdict:
  SCHOLAR-KILL => scholar-kill; SCHOLAR-FLEE-MELT => scholar-flee-melt;
  any other fate => OTHER with the fate named (e.g. a restored
  lingerer cannot explain a vanished wild chain and must be reported
  as a contradiction, not relabeled).
- NEAR-MISS reporting (never matched, always disclosed): scholar
  fights on the same seed+mid in the window that fail exactly one
  match rule (same-day start, hp mismatch, veteran fighter), each
  with the failed rule named.

BAND CENSUS (reported for every scholar tb-combat on the band):
fate counts overall and wave-4-only, lifted vs spawned vs bystander,
result distribution, and the scholar tb-combat count per seed. The
sink size is stated as: SCHOLAR-FLEE-MELT fights (all waves) and
wave-4-only, plus how many of them were lifted wild (non-titan,
non-lingering) instances.

## Primary metrics (binding)

- COMPLETENESS (blocks DIAG-GO): 16/16 valid seeds (days > 0) AND
  every recorder (fieldparty, w4dpr, breakline, shoutrec, tilejoin,
  joinendlines, scholarmelt) errs 0 with overflow empty AND joins
  100% (all six chainclose recorders index-aligned per seed;
  mid/vid/day match at every index; join errors 0) AND mDealt
  agreement breakline==w4dpr at every row AND shoutrec
  PREFIX-CONSISTENCY at every row AND census files present/parseable
  for 16/16 seeds, snapshots sorted by day, final snapshot day
  within 1 of the seed's days.
- SUBSTRATE-EQUIVALENCE (blocks DIAG-GO): every own row with its
  `scholarmelt` field removed is byte-identical to chainclose's
  corpus row for the same seed (the recorder must not perturb the
  game), AND every own census file is byte-identical to recurrence's
  census file for the same seed. Any delta is disclosed per seed
  and investigated before judging; a perturbation delta is
  DIAG-NO-GO, not a footnote.
- CHAIN-SET AGREEMENT (blocks judging the 4): this corpus's own
  BEAST-VANISHED chain set equals recurrence's 4 (seed,mid) pairs.
  A different set is a substrate divergence: report it, do not judge
  a different 4 as if it were the assigned 4.
- CLASSIFICATION (primary metric, blocks DIAG-GO): EVERY scholar
  tb-combat on the band assigned exactly one fate, band-wide
  UNCLASSIFIED == 0, AND 0 UNCLASSIFIED among the 4 vanished chains
  (each resolved to scholar-kill vs scholar-flee-melt vs other, with
  the matched fight's fightSeq + day + result + lift/restore trace
  cited).
- DETERMINISM GATE (blocks DIAG-GO): one seed re-run into a scratch
  EVID dir; its row JSON byte-identical AND its census JSON
  byte-identical to the corpus files. Scratch dir removed after the
  diff.
- SENSE BAR (blocks DIAG-GO): EVERY meeting log of the 4 vanished
  chains read end to end (w4dpr rec.log: algorithm 4 + eulogy 4 +
  audit 1 + suburb 1 = 10 logs), PLUS the matched scholar tb trace
  rows read (structured evidence — say is silenced in node sims,
  disclosed above). Judgment is meaning/coherence/consequences (does
  any villager story remove the beast; does the scholar trace read
  as the removal), not counts (SENSE-TESTING LAW).
- FIXTURE BAR (blocks judging): scripts/test-scholarmelt-a.js must
  prove, before the corpus is judged, on synthetic rows: the fate
  decision tree in priority order (kill > flee-melt > restored >
  spawn-ended > bystander/nonmonster; unended and orphan paths),
  chain grouping through the REQUIRED chainclose buildChains
  (cross-seed separation fixture), censored flag = horizon-survived
  only (a won run ending 'over-other' is NOT censored), chain
  matching (hp-exact, window bounds, same-day near-miss, veteran
  fighter non-match), census matching through the REQUIRED recurrence
  censusMatch, and the byte-identity comparator (row-minus-scholarmelt
  and census).
- INSUFFICIENT-DATA (reported, never silently widened): if the band
  yields ZERO scholar tb-combats, or if any of the 4 vanished chains
  has zero matched scholar fights, the arm reports INSUFFICIENT-DATA
  for that chain (the chain stays unresolved — never force-matched
  to a wrong-HP or out-of-window fight) and states the widen-or-close
  choice for the coordinator. Seeds are NOT widened silently mid-run.

## Verdict rule

- DIAG-GO iff COMPLETENESS PASS + SUBSTRATE-EQUIVALENCE PASS +
  CHAIN-SET AGREEMENT PASS + CLASSIFICATION PASS + DETERMINISM PASS
  + SENSE PASS + FIXTURE PASS + a RANKED NEXT named with numbers.
- A completeness/substrate/chain-set/classification/determinism/
  sense/fixture failure is DIAG-NO-GO.
- INSUFFICIENT-DATA (above) is reported as such, not as GO or NO-GO
  on the split question.
- A miss is NO-GO, never re-scored against a friendlier metric
  mid-run; metric doubts go under "metric review" for the NEXT run.
  Every evidence file carries a "metric review" section.
- NO lever verdict: this arm does not propose a melt fix, gate move,
  or any game change. Its verdict is about the measurement (the
  split, proved per chain), not about building to it.

## Method (staged, binding order)

1. This prereg, committed BEFORE any judged analysis.
2. Instruments (recorder + sweep + analyzer + fixtures), committed
   before the judged sweep is analyzed (fixture bar green first).
3. Sweep (16 seeds), determinism gate (one seed, scratch dir, removed
   after diff), sense logs read per the bar above.
4. Evidence evidence/2026-10-30/sim-scholarmelt-a.md with
   header-vs-result, the 4-chain classification table (chain,
   matched fightSeq/day/result/fate, lift hp, fighter hp path,
   restore check, near-misses), band scholar tb-combat census (fate
   x wave, lifted/spawned, per-seed counts, sink size), substrate
   equivalence report, determinism + sense results, wall numbers
   (report-only, same upper-middle median convention as chainclose),
   ranked next, and findings-backlog items found (reported to the
   coordinator, NOT appended to sim-findings.md by this worker).
5. No src/js change, no push, no bump, no live verification. Report
   'branch ready for coordinator merge, pending ship' (coordinator
   merges; sibling loop B may move master under this branch — rebase
   cleanly at the end and re-run the proof; rebase conflict = FAIL
   LOUDLY, no force, no merge).

## Node harness

Eval the FULL src/js/*.js list in index.html order (minus DOM-only
app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js) via the shared
sim-harness (loadGame seeds Math.random BEFORE eval). Never stub
Game.save. Never run concurrent jest; use
--cacheDirectory=/tmp/jest-cache-sim-scholarmelt-a (no jest is run by
this arm — the sweep/analyzer are plain node scripts).
