# sim-sameday-a — same-day matching window with part-stamped ordering (DIAG-GO)

**Verdict: DIAG-GO** (every GO bar met; the algorithm chain promotes).
Run: flesh-out loop, run fleshout-20261030T1015Z, axis scale-onramp
(blocking axis, converging, NOT converged). Ranked-next #1 from run
fleshout-20261030T0855Z and scholarmelt ranked-next #2. Sibling
loop B live on food-economy the whole run — NOT touched; a sibling
draftflag sweep was also running in its own worktree — NOT touched.
DIAG ONLY — no game changes, no default flip, no gate move, no
deed-bar move. Committed on branch, pending coordinator merge. No
push, no version bump, no live verification (the batch ship job
owns deploys). No [needs-eyes] (diag only).

Prereg: `evidence/2026-10-30/sim-sameday-a-prereg.md` (committed
eb0ada8f8 before any judged analysis; correction #1 1bd2a1261,
committed after the pilot seed, before the judged sweep — see
below). Corpus: `evidence/2026-10-30/perseed-sameday-a/` (row +
enriched census per seed), analysis:
`evidence/2026-10-30/sim-sameday-a-analysis.json`. Instruments:
`scripts/policies/sameday-diag.js` (record-only part/sequence-stamp
recorder), `scripts/sweep-sameday-a.js`, `scripts/analyze-sameday-a.js`,
fixtures `scripts/test-sameday-a.js`. Reused verbatim, never edited:
the chainclose six recorders plus scholarmelt-diag and removal-diag
(final diff shows zero changes to those files).

## What was asked

Under a NEW pre-registered same-day window, does the s75102
algorithm 959 chain promote to primary SCHOLAR-MELT or honestly
stay INSUFFICIENT-DATA? The old window (scholarmelt) required a
scholar fight strictly after the chain's last meeting day, so the
d71 fight — same day as the last meeting — could not match. The
removal window classified the same chain SCHOLAR-MELT (EDGE)
because the removal day equals the last meeting day. This arm
supplies the missing instrument: a part/sequence stamp proving
within-day order between the day's villager field-meeting log and
the scholar fight start for the same beast, and judges the chain
under the new window [lastDay, firstAbsentDay] with that stamp
as the same-day gate.

## The stamp (stated honestly)

The engine DOES record a day-part: Game.dayPart is 0 dawn, 1
midday, 2 dusk, 3 night (game.js advancePart comment and dayPart
clock; 4 parts per day). No day-part was fabricated. Every
sameday event carries that engine value (numeric, primary) plus
its name — AND a global sequence number assigned by the recorder
at pre-record time, in single-threaded execution order, which is
the stamp when two events share one part. For the judged pair
both clocks agree: the meeting and the fight fall in the same
part, and the sequence decides them.

## Prereg legs (header vs result)

| Leg | Prereg bar | Result |
|---|---|---|
| Prereg | committed before judged analysis | PASS — eb0ada8f8 before any judged analysis; correction #1 1bd2a1261 after pilot, before judged sweep (install order only, see below) |
| Pilot gate | fixtures + 1-seed determinism + substrate identity before full sweep | PASS — fixtures 39/39; pilot s75102 row-minus-three-fields byte-identical to chainclose after correction #1 (before it, only the fieldparty stack tail differed — see correction); pilot joins 0 errors; pilot stamps already showed meeting 98 < fight 99 |
| Seeds | 16/16 valid | PASS — 16/16 rows (days > 0, all recorder errs 0, no overflow), census present/sorted/within-1 on all 16 |
| Substrate | every row minus `sameday`, `scholarmelt`, `removal` byte-identical to chainclose | PASS — 16/16; stripped census (id,tx,ty,hp) also equals recurrence's census 16/16 (diagnostic, also PASS); own scholarmelt meetings byte-identical to the committed scholarmelt corpus 16/16 |
| Sameday joins | meeting join errors 0 AND fight join errors 0 band-wide | PASS — meeting join 2257/0, fight join 424/0 (424 = 427 scholar rows minus 3 orphan-end rows, which have no start by construction) |
| Algorithm decision | primary SCHOLAR-MELT with ORDER-PROVEN stamps, or INSUFFICIENT-DATA with the failed rule honestly named | PASS — promoted (see decision below) |
| Other-chains re-judgment | all 4 vanished chains re-judged under the NEW window only, every change vs scholarmelt listed | PASS — only algorithm changes; the other 3 are no-change with reasons (see table) |
| Determinism | 1 seed re-run, row + census byte-identical, scratch removed | PASS — seed 75102: row IDENTICAL, census IDENTICAL, DETERMINISM-PASS, scratch-removed=true |
| Sense | judged chain's villager logs + matched scholar trace read end to end | PASS — all 4 algorithm meetings + the d71 scholar trace read (see sense section) |
| Fixtures | test script green | PASS — FIXTURES-PASS 39/39 |

**Formal verdict is DIAG-GO.** Scholarmelt's verdict for the
algorithm chain stands under ITS prereg (INSUFFICIENT-DATA there);
this arm's verdict is a new judgment under a new prereg and does
not re-score the old one — the comparison table below keeps the
two preregs separate.

## The decision — s75102 algorithm PROMOTES to primary SCHOLAR-MELT

- Chain: n=4, d65–d71, remaining HP 959, firstAbsentDay 72,
  finalDay 85 (village-lost).
- Candidate fight: fightSeq 21, d71, tile [4,4], intendedMid
  algorithm, wild (titan false, lingering false, veteran
  false), lift HP 959, lifted true, fighter HP 959→957 alive
  at end, scholar HP 100→−15 (scholar died), result lost,
  restoredIdentity false, restoredEntry false, restoredHp null
  → fate SCHOLAR-FLEE-MELT under the required classifyFight.
- Meeting stamp (joined to the chain's last meeting, w4dpr
  index-aligned): seq 98, day 71, dayPart 3 (night),
  partCounter 283, vid ursula_weber, mHpStart 959, mHpLeft 959.
- Fight stamp (joined to fightSeq 21, scholarmelt non-orphan
  index-aligned): seq 99, day 71, dayPart 3 (night),
  partCounter 283.
- Order judgment, stated numerically: meeting seq 98 < fight
  seq 99 AND meeting dayPart 3 <= fight dayPart 3 →
  ORDER-PROVEN. The meeting and the fight share one part
  (night, partCounter 283 — the same counter value the w4dpr
  meeting itself carries, a consistency note, never a join
  key), and the sequence decides them: the meeting ran first.
- Removal corroboration (own corpus, never the verdict):
  removal seq 47, d71, algorithm hp 959, tile (4,4), uid 26,
  startCombat stack — exactly the row the prior arms quoted.
  The verdict rests on the scholar fight + the stamp order,
  not on this row.
- Why the old window missed it: dayStart 71 is not strictly
  after lastDay 71, so scholarmelt correctly refused the match
  under its rules. Under the new window [71, 72] with the
  stamped-order gate, the same fight matches, and the chain
  promotes. Nothing was force-matched: hp is exact (959),
  the lift tile is the chain's tile [4,4], the fighter hp
  path corroborates the lift, and no restore exists.

## Other chains re-judged under the NEW window (no silent re-scoring)

| Chain (seed, mid) | Scholarmelt (old window, quoted) | This arm (new window) | Changed? | Reason |
|---|---|---|---|---|
| s75102 algorithm | INSUFFICIENT-DATA | SCHOLAR-MELT (primary, same-day stamped) | YES — the assigned decision | Matched fightSeq 21 d71, ORDER-PROVEN (98 < 99, night = night) |
| s75102 eulogy | INSUFFICIENT-DATA | INSUFFICIENT-DATA | No | No candidate in [59, 62]: the only near-miss is fightSeq 17 d62, a bystander lift of 146 HP (not-lifted, hp-mismatch vs 853). Its removal verdict (LOSTSIGHT-REMOVE) belongs to removal, not to this window. |
| s75116 audit | scholar-flee-melt | scholar-flee-melt | No | Already primary under the old window (fightSeq 21 d140 after d139). Stamps corroborate: meeting seq 195 d139 night → fight seq 196 d140 dawn, consecutive across the day boundary. |
| s75116 suburb | INSUFFICIENT-DATA | INSUFFICIENT-DATA | No | Near-miss fightSeq 23 d159 still fails hp-exact (lift 960 vs chain 1285). Its uid/toll identity proof (1285→960 via the palisade toll) belongs to removal, not to this window, and is NOT imported as a promotion here. |

Band-wide completeness of the re-judgment: the new-window match
was run over all 4 BEAST-VANISHED chains — the only chains with
an end to judge. The other 6 wild wave-4 chains carry no melt
verdict under either window (4 NEVER-CROSSED, still present at
run end; 2 VILLAGE-GONE, run-end). No other same-day matched
fight appears anywhere on the band: near-miss lists total
exactly the two rows above (eulogy, suburb), both failing
non-stamp rules. Old-window verdicts recomputed with
scholarmelt's matchCandidate agree with the quoted committed
verdicts on all 4 chains (oldAgrees=true throughout), so the
comparison table is not comparing against a drifted baseline.

## Band scholar tb-combat census (re-derived on this corpus, context only)

427 scholar tb-combats, 0 refused excluded. Fate counts:
SCHOLAR-KILL 182, SCHOLAR-FLEE-MELT 63, SPAWN-ENDED 70,
SCHOLAR-RESTORED 87, BYSTANDER-OR-NONMONSTER 22, UNCLASSIFIED 3.
The 3 UNCLASSIFIED are the same empty-fighter orphan tbEnds
scholarmelt reported (s75105 seq 14, s75107 seq 5, s75116 seq
26); they have no lift and no worldOrigin, so they cannot match
any chain and do not affect any verdict here. Fate × wave
matches scholarmelt exactly (wave-4: kill 4, flee-melt 15,
spawn-ended 3, restored 9, bystander 4). Sink size, re-derived:
all melts 63, wave-4 melts 15, wild non-titan non-lingerer melts
38 — identical to scholarmelt's numbers, as substrate identity
requires. Per-seed tb counts identical to scholarmelt's
(75101:11, 75102:62, 75103:7, 75104:57, 75105:81, 75106:13,
75107:11, 75108:2, 75109:11, 75110:29, 75111:18, 75112:10,
75113:35, 75114:43, 75115:9, 75116:28).

## Wall numbers (this band's own corpus, report-only)

Identical to chainclose/scholarmelt/removal (a consequence of
the byte-identical rows, reported here as this run's own
corpus, never as a before/after): wins 9/16 (all lesser, full
0), national ever 13/16, national final 11/16, table reached
12/16, table entered 9/16, wave reach 16/16/14/9/0, median
survival 118d, deaths 527, starvation 3, fieldparty meetings
2257. Telemetry vs the scale-wall baseline is the
coordinator's step (this worker reports the numbers, not the
baseline roll).

## Reachability verdict

Unchanged by this arm (measurement only): waves 1–4 reachable,
wave 5 unreachable on this band (0/16), the table reachable
only through the lesser seat, the full seat unreached. What
this arm changes is the accounting, not the wall: the last
vanished chain that sat in scholarmelt's INSUFFICIENT-DATA
column for a window technicality now has a primary verdict
with a stamped order behind it. All 4 vanished chains now
have a primary explanation across the scholarmelt + removal +
sameday instruments (audit: melt; algorithm: melt, same-day
stamped; eulogy: lost-sight removal; suburb: melt via the
toll bridge, uid-proven by removal).

## Village assessment (plain words)

The village in this band no longer has a beast that vanished
on a technicality. On the night of day 71, Ursula went out
with a bow and no arrows, took two rounds of punishment from
the beast that calls itself Recommended For You, bound her
own wound mid-fight, and died with the beast still standing
at 959 — the same strength it had when she met it. Later
that same night, the scholar met that same beast on the
haven tile, lost, and the beast melted away instead of
staying on the map. The old records filed that as two
separate stories — a meeting with no ending, and a fight
with no beginning — because the old rule refused to look at
fights on the same day as the meeting. The new record stamps
both moments in the order they happened: meeting first,
fight second, both at night. The beast's story now reads
straight through, from Ursula's death to the scholar's loss
to an empty tile by morning. The wall itself has not moved
— no full seat, no wave 5 — but the last gap in the
comings and goings behind it is closed.

## Sense notes (logs read end to end)

- SENSE-PASS on the judged chain. All 4 algorithm meetings
  read: d65 (aid, vFlee, 1000→971, 29 dealt), d67 (aid, vDie,
  971→971, 0 dealt), d70 (aid, vDie, 971→959, 12 dealt),
  d71 (resolve, vDie, 959→959, 0 dealt). The d71 log in full:
  Ursula has a bow but no arrows, her gear absorbs 25 then
  23, she binds her own wound mid-fight (+20 HP), and dies
  in round 2 to a 77-damage hit — the beast stands at 959
  after every meeting, and nothing in any of the four logs
  removes it. The scholar trace completes it: lift 959 at
  [4,4], fighter 959→957 alive, scholar dead, result lost,
  no restore. Meeting-then-fight is the only order that
  leaves both records true, and the stamps now prove it
  instead of arguing it.
- Limitation, stated plainly: node-sim stubs Game.say to
  no-op, so there is no say transcript for the scholar fight
  — evidence is the structured trace (stamps, lift snapshot,
  fighter HP path, restore check), as the prereg states.
- A sense flag, not a verdict: the meeting and the fight
  share one night part. A villager who watched Ursula die
  would have to be on the haven tile that night to see the
  scholar's fight follow — the corpus records the order, not
  the witness. Whether the village should be able to tell
  this story in-world (a witness, a rumor, a haven report)
  is a narration question for a later arm, not a finding
  of this one.

## Metric review

- The prereg bound the run and was honored: no metric was
  re-scored mid-run. The algorithm promotion comes from a
  NEW prereg's window, applied prospectively to this
  corpus, with the old verdict quoted alongside — exactly
  the separation MEASUREMENT.md §14 requires.
- Prereg correction #1 (install order, after pilot, before
  judged sweep): with the sameday wrap outermost over
  fieldFight, fieldparty's 20-frame caller stack lost its
  trailing frame (one extra wrapper frame at the top pushes
  the 20th name off), breaking row byte-identity on game-
  identical content. Installing sameday FIRST (innermost)
  restores the stack exactly, because fieldparty's stack is
  captured before the sameday wrap is in the chain above
  it. Stamp semantics are unchanged (pre-records still run
  before the wrapped original; meeting-before-fight order is
  preserved). This is an instrument correction, not a metric
  change — the window, the stamp rule, and every GO leg
  stand as written.
- The audit corroboration (meeting seq 195 d139 night →
  fight seq 196 d140 dawn) shows the stamp instrument also
  resolves cross-day order cleanly; future chain arms can
  adopt the stamped window as their standard matching rule
  instead of re-litigating same-day edges chain by chain.
- Instrument lesson (test hygiene, carried from removal):
  the determinism helper exits only after its finally block
  removes the scratch dir — verified here (scratch-removed
  =true).
- Safe-commit index-clobber variant (known, from the 0855
  run): both this run's commits initially left the main
  index showing bogus staged deletions for the just-committed
  files (worktree files intact, commit contents verified
  correct). Repaired each time via update-index --cacheinfo
  from the HEAD blob and verified with an empty git status
  before proceeding. The commit is always correct; only the
  main index lies.

## RANKED NEXT (with numbers — no lever built here)

1. DRAFT RECORDER (unchanged from 0855, still #2 there).
   The suburb bridge (1285→960) and the audit pre-d133 draft
   (1100→825) still rest on toll signature + uid continuity.
   A record-only draft recorder (day, entity uid, hp/maxHp
   before/after, palisade flag) would date both directly.
2. BLOCKED LINGERER RESTORE (why fightSeq 23 was not
   restored). The tbEnd restore requires the origin tile to
   be unoccupied; the corpus does not record tile occupancy
   at tbEnd. A restore-guard recorder would say whether the
   (4,4) tile was occupied at d159 tbEnd.
3. UID-CARRYING CHAIN MATCHER. Hp-exact chain matching
   systematically misses drafted instances (suburb 1285→960
   is the proof, and it stays INSUFFICIENT-DATA under any
   hp-exact window, including this one). Future chain arms
   should match by census uid first, hp second — with the
   stamped window from this arm as the day rule.
4. SIEGE-FLAG LIFECYCLE RECORDER — pin when wild instances
   become siege drafts (suburb 1285→960 conversion happens
   between censuses).
5. SCHOLAR-TILE-PRESENCE CENSUS — price how often the tick
   mechanism even gets a chance (16/32 wild instances never
   share the scholar tile for a turn, per stalkertick).
6. CROSS-WAVE LOSTSIGHT CENSUS — 4 lostSight removals in 313
   removal events across waves 1–4 (per stalkertick).
7. FLED-CLASS COVERAGE. FLED-BOLT / FLED-GAVE-UP (and
   CAMPAIGN-CLEAR / TITAN-FALL-CLEANUP) have zero wave-4
   rows on this band. A band where a wave-4 beast flees
   across a grid edge would exercise them; until then they
   stay code-read classes, not observed ones.
8. HAVEN-ANCHOR DESIGN QUESTION (steve-call): should a
   haven-pinned beast be able to lose sight and fade, or
   should haven presence anchor it?
9. WITNESS/NARRATION QUESTION (new, from the sense flag):
   should a same-night meeting→fight sequence like Ursula's
   reach the village as a tellable story (witness, rumor,
   haven report), or stay a measurement-only order?

## Convergence state

scale-onramp: converging, NOT converged. Full seat 0, wave 5 0
on this band, as on every band this cycle. No axis is
converged. No gate number was moved on this evidence, per the
2026-10-29 gate-sequencing note (prove behavior normal before
tuning gates to it). What converged further is the
disappearance accounting: under the stamped window, all 4
vanished chains on this band now carry a primary verdict
across the three instruments, with zero chains left in
INSUFFICIENT-DATA for a window technicality (eulogy and
suburb remain INSUFFICIENT-DATA only under the hp-exact
scholar window — their explanations live in the removal
instrument, where they are resolved).

## Commits (worktree sim-sameday-a; coordinator merges)

- eb0ada8f8 — preregistration (band, substrate legs, new
  window + stamped-order rule).
- 1bd2a1261 — prereg correction #1 (sameday installed first,
  innermost; stamp semantics unchanged).
- 4d7368ac0 — instruments (sameday recorder + sweep copy +
  analyzer + fixtures, 39 checks).
- Evidence + corpus + analysis: committed together with this
  file (hash in the worker's final report to the coordinator;
  worktree shows only committed work at handoff).

No src/js game changes. No push, no version bump, no live
verification (measurement only). No [needs-eyes].
