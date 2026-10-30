# sim-uidmatcher-a — uid-first chain matcher (DIAG-GO)

**Verdict: DIAG-GO** (every GO bar met; all 4 band chains re-judged
under this prereg with uid-first verdicts, drops reproduced exactly
at 29 uid vs 28 per-id with the twin item named, 0 UNCLASSIFIED).
Run: flesh-out loop, run fleshout-20261030T1015Z, worker
sim-uidmatcher-a, axis scale-onramp (blocking axis, converging,
NOT converged). Ranked-next #2 from run fleshout-20261030T1015Z.
Sibling loop B and sibling workers live during this run — NOT
touched. DIAG ONLY — no game changes, no default flip, no gate
move, no deed-bar move. No [needs-eyes]: this arm changes no
feel, combat, or UI — it only judges recorded events.
Committed on branch, pending coordinator merge. No push, no
version bump, no live verification (the batch ship job owns
deploys).

Prereg: `evidence/2026-10-30/sim-uidmatcher-a-prereg.md`
(committed 41186a838 BEFORE any judged analysis; correction #1
742535d03, determinism path normalization, before the pilot;
correction #2 dd7e91a0a, spawn-day chain→uid check, after the
pilot, before the full run — both disclosed below).
Judged corpus: the COMMITTED `evidence/2026-10-30/perseed-sameday-a/`
corpus — no new sweep, no new recorder (the prereg's gap
assessment, honored: census uid + spawn events + removal events
+ scholar fights + sameday stamps already answer every question
this arm asks). Analysis:
`evidence/2026-10-30/sim-uidmatcher-a-analysis.json`.
Instruments: `scripts/analyze-uidmatcher-a.js` (pure analyzer;
chains/fates/fights/removals/drops/stamps all via the REQUIRED
functions from the prior analyzers, never re-implemented),
fixtures `scripts/test-uidmatcher-a.js`. Reused verbatim, never
edited: all prior recorder/policy/analyzer files (final diff
shows zero changes to them).

## What was asked

Does a uid-first matcher (census uid first, hp second) re-judge
the 4 band chains and the band drops consistently, and what does
it change vs hp-exact — without smuggling one prereg's identity
proof into another prereg's verdict window? The matcher resolves
each chain to a census uid trajectory (hp only as a check on
that trajectory), links a scholar fight to the chain through a
removal event for that same uid on the fight's day at the
fight's lift hp (never through chain hp == lift hp), and judges
the chain end under this prereg alone.

## Prereg legs (header vs result)

| Leg | Prereg bar | Result |
|---|---|---|
| Prereg | committed before judged analysis | PASS — 41186a838 before any judged analysis |
| Pilot gate | fixtures + pilot-seed substrate identity + matcher resolves (or names the missing link for) all 4 pilot vanished chains before the full run | PASS — fixtures 12/12 at pilot time; pilot seeds 75102+75116 substrate 2/2; pilot under the original rule resolved 3/4 with suburb UNRESOLVED for a named rule gap (no meeting-day census on a spawn-day chain) — correction #2 fixed the rule, re-pilot resolved 4/4, then the full run |
| Seeds | 16/16 valid | PASS — 16/16 rows (days > 0, all recorder errs 0, overflow empty), census present/sorted/within-1 on all 16, every census entry carries a uid |
| Substrate | every row minus `sameday`, `scholarmelt`, `removal` byte-identical to chainclose | PASS — 16/16 |
| Chains | all 4 BEAST-VANISHED chains get a uid-first verdict or a named missing link; vanished set agrees with recurrence's 4 pairs | PASS — 4/4 verdicts, 0 missing links; vanished set agrees exactly |
| Drops | uid-drop classification rate with counts; uid vs per-id differenced item by item; twin-pair + drafted-instance resolutions counted | PASS — uid 29, per-id 28, difference exactly 1 named item; drafted instances counted (see below) |
| Uid consistency | one uid never carries two monster ids | PASS — 0 conflicts (census + removal events) |
| Determinism | seed 75102 re-run row + census byte-identical, scratch removed | PASS — row normalized-identical (path-only raw diffs, 63 lines), census byte-identical unmodified, scratch removed (see correction #1) |
| Sense | judged chains' logs + traces read end to end | PASS — all 4 chains' logs + matched scholar traces read (see sense section) |
| Fixtures | test script green before judged sweep analyzed | PASS — FIXTURES-PASS 12/12, determinism run 15/15 |
| No-smuggling | matcher code reads no prior arm's verdict/analysis file | PASS — source check in fixtures (0 banned strings); comparison table below quotes prior verdicts with prereg labels only |

**Formal verdict is DIAG-GO.** The verdicts below are NEW
judgments under THIS prereg. Prior verdicts stand under their
preregs whatever this arm finds — nothing here corrects,
promotes, or overturns them; the table keeps each verdict with
its prereg label.

## The 4 band chains, re-judged uid-first

Window agreement first: on all 4 chains the uid-based first
absence (fabUid) EQUALS the hp-based firstAbsentDay (fabHp) —
72, 62, 140, 159 respectively. The uid window and the hp
window are the same window on this band; the matcher does not
win by moving a window.

### s75102 algorithm 959 → SCHOLAR-MELT (uid-first)

- Resolution: uid 26 (spawn d59; census hp matches every
  meeting day: d65 1000, d66 971, d71 959).
- Link: fightSeq 21, d71, lift 959, tile (4,4) — removal event
  for uid 26 on d71 at hp 959 with a startCombat stack.
  Same-day gate: meeting stamp seq 98 < fight stamp seq 99,
  both night (dayPart 3) → ORDER-PROVEN, recomputed here from
  the sameday stamps (not quoted from sameday's verdict).
- Verdict: SCHOLAR-MELT (uid-first) — classifyFight
  SCHOLAR-FLEE-MELT, fighter 959→957 alive, scholar dead, no
  restore. No bridge: lift hp == chain hp.
- Vs hp-exact: sameday already promoted this chain under its
  stamped window; the uid-first matcher agrees, by an
  independent identity route (uid, not hp). No change in
  outcome, a change in grounding: the link no longer depends
  on hp equality at all.

### s75102 eulogy 853 → LOSTSIGHT-REMOVE

- Resolution: uid 25 (census hp matches meeting days).
- Link: no uid-linked scholar fight exists in the window, so
  the removal rule fires: removal seq 41, d62, uid 25,
  monsterTurn, lostSight 7 > 6 → LOSTSIGHT-REMOVE.
- Vs hp-exact: no change. The chain's end was never a fight
  match under any window; uid-first confirms it by the same
  removal row, now keyed to the chain's own uid.

### s75116 audit 785 → SCHOLAR-MELT (uid-first)

- Resolution: uid 28 (spawn d132 at 1100; census d133–139 at
  825, d139 meeting 825→785).
- Link: fightSeq 21, d140, lift 785, tile (4,4) — removal
  event for uid 28 on d140 at hp 785 with a startCombat
  stack. Fighter 785→661 alive, scholar dead, no restore.
  No bridge: lift hp == chain hp (the d132 draft toll
  1100→825 predates the chain's only meeting, so the chain
  hp already includes it).
- Vs hp-exact: no change in outcome — this chain matched
  under every window. Uid-first adds the identity: the
  fought beast IS the chain's beast, not merely a beast with
  the same hp.

### s75116 suburb 1285 → SCHOLAR-MELT (uid-first), WITH A TOLL BRIDGE

- Resolution: uid 29 — via correction #2's spawn-day check:
  the chain's only meeting is d140, the day uid 29 spawned
  (spawn hp 1300 == mHpStart), and the d141 census reads
  1285 == mHpLeft. No other candidate passes (uid 25, the
  other suburb trajectory, fails both checks).
- Link: fightSeq 23, d159, lift 960, tile (4,4), lingering —
  removal event for uid 29 on d159 at hp 960 with a
  startCombat stack. Fighter 960→885 alive, scholar dead,
  no restore. BRIDGE 1285→960, toll-shaped: 325 ==
  round(1300 × 0.25). The matcher links it BECAUSE the uid
  matches, although hp differs by exactly the palisade toll.
- Vs hp-exact: THIS IS THE CHANGE. Under every hp-exact
  window (scholarmelt, sameday) this chain is
  INSUFFICIENT-DATA, because 960 ≠ 1285. Under uid-first it
  carries a primary verdict: SCHOLAR-MELT (uid-first). The
  verdict is computed here from this corpus's own removal
  event + fight — removal-a's toll-bridge proof is NOT an
  input to it (the matcher never reads removal-a's analysis);
  it is quoted below only for comparison, and the two
  independent routes agree.
- Discriminator, stated because it proves the matcher is
  selective: a SECOND suburb fight exists, fightSeq 18 d128
  lift 975 (the uid-25 instance, tolled 1300→975). The
  matcher does NOT link it to this chain — day 128 precedes
  the chain's last day 140 and its uid is 25, not 29. Uid-
  first does not collect every same-type fight; it collects
  the chain's own beast's fight.

## Comparison table (each verdict labeled with its prereg)

| Chain | Scholarmelt (hp-exact, strictly-after window) | Removal (removal-row window) | Sameday (hp-exact, stamped window) | THIS ARM (uid-first) |
|---|---|---|---|---|
| s75102 algorithm | INSUFFICIENT-DATA | SCHOLAR-MELT (EDGE) | SCHOLAR-MELT (primary, same-day stamped) | SCHOLAR-MELT (uid-first) |
| s75102 eulogy | INSUFFICIENT-DATA | LOSTSIGHT-REMOVE | INSUFFICIENT-DATA | LOSTSIGHT-REMOVE |
| s75116 audit | scholar-flee-melt | SCHOLAR-MELT (cross-ref) | scholar-flee-melt | SCHOLAR-MELT (uid-first) |
| s75116 suburb | INSUFFICIENT-DATA | SCHOLAR-MELT via toll bridge (uid-proven) | INSUFFICIENT-DATA | SCHOLAR-MELT (uid-first, bridge 1285→960 toll-shaped) |

Reading the table: uid-first is the first matcher to give all
4 chains a primary verdict from ONE rule set, without a window
edge (algorithm), without a cross-reference (audit), and
without an hp mismatch (suburb). Eulogy is the control: it
stays a removal verdict under uid-first, exactly as it should
— the matcher does not manufacture fight links.

## Band drops: uid-first vs hp-exact, item by item

- Uid drops: 29. Per-id drops: 28. Classification of uid
  drops (REQUIRED classifyDrop): DROP-VILLAGER-FIGHT 7,
  DROP-SCHOLAR-RESTORED-WOUND 4, DROP-RAID-TOLL 18,
  DROP-UNCLASSIFIED 0. These counts reproduce removal-a's
  band numbers exactly (7/4/18, 29 vs 28) — recomputed here
  on the sameday corpus, not copied.
- The difference is exactly ONE item, and it is the named
  twin-pair case: s75102 reunion 1200→1185, d79→80, uid 34,
  DROP-VILLAGER-FIGHT (fieldparty meeting d79, vFlee, closes
  1185). Per-id misses it because two same-id reunion entries
  share day 79 and first-entry picks the wrong one. Per-id-
  only drops: NONE (0). Uid-first is a strict superset here,
  not a different census.
- Twin-pair resolution count: 1 item (the reunion drop).
  No other twin artifact appears on this band.
- Drafted-instance count: 10 census-visible uid trajectories
  with a toll-shaped census drop (drop == round(maxHp ×
  0.25) with a haven-tile (4,4) move) AND a later uid-linked
  scholar fight (removal startCombat event for the uid on
  the fight day at lift hp): s75105 suburb uid 36
  (1300→975 d122→123, fightSeq 25 d128 lift 975); s75110
  eulogy uid 23 (900→675, fightSeq 10 lift 675); s75110
  algorithm uid 24 (1000→750, fightSeq 13 lift 750); s75110
  eater uid 25 (950→712, fightSeq 14 lift 712); s75110 strike
  uid 26 (1000→750, fightSeq 15 lift 750); s75110 audit uid 34
  (1100→825, fightSeq 26 lift 825); s75114 reunion uid 40
  (1200→900, fightSeq 28 lift 900); s75114 algorithm uid 45
  (1000→750, fightSeq 42 lift 750); s75116 suburb uid 25
  (1300→975 d121→122, fightSeq 18 lift 975); s75116 eulogy
  uid 35 (900→675 d158→159, fightSeq 27 lift 675). Plus the
  chain bridge above (s75116 suburb uid 29, 1285→960), which
  has NO census-to-census drop (no post-draft census exists)
  and therefore cannot appear in this count — 11 uid
  trajectories in total show a toll bridge to a scholar
  fight. The drafted count is a fight-link count, not an
  outcome claim: it includes restored fights (e.g. s75105
  fightSeq 25, restored 975→872) as well as melts.
- What uid-first changes vs hp-exact, in one paragraph:
  exactly one chain verdict (suburb: INSUFFICIENT-DATA →
  SCHOLAR-MELT) and exactly one drop (reunion: missed →
  found). Everything else agrees. That is the honest size of
  the improvement on this band: uid-first does not rewrite
  the census, it repairs the two places hp-exact is blind —
  drafted instances and twin pairs — and leaves the other
  28 drops and 3 chain verdicts untouched.

## Wall numbers (this band's own corpus, report-only)

Identical to chainclose/scholarmelt/removal/sameday (a
consequence of substrate identity, reported here as this run's
own corpus, never as a before/after): wins 9/16 (all lesser,
full 0), national ever 13/16, national final 11/16, table
reached 12/16, table entered 9/16, wave reach 16/16/14/9/0,
median survival 118d, max 180d, deaths 527. Telemetry vs the
scale-wall baseline is the coordinator's step (this worker
reports the numbers, not the baseline roll).

## Reachability verdict

Unchanged by this arm (measurement only): waves 1-4 reachable,
wave 5 unreachable on this band (0/16), the table reachable
only through the lesser seat, the full seat unreached. What
this arm changes is the accounting, not the wall: under one
rule set, all 4 vanished chains now carry a primary verdict
with an identity behind it, and the drop census is complete
at 29/29 with 0 UNCLASSIFIED. Nothing here moves a gate or a
deed bar.

## Village assessment (plain words)

The village in this band no longer has a beast whose story
depends on which ruler you measure it with. Measure by
strength alone, and the great beast of the suburb looks like
two different animals — the one Miguel died fighting at
1285, and the one the scholar met at 960 — because the wall
took its quarter-cut in between, in the dark, on a night
nobody fought. Measure by identity — follow the one beast,
not the number — and it is one story straight through:
Miguel strikes it once, dies, and the beast walks the
treeline for eighteen days until the siege draft pulls it
over the wall, taxed, and the scholar meets it there and
loses, and it melts. The other three stories read the same
under either ruler, which is the point: the new ruler does
not invent endings, it only finds the one the old ruler
could not see, and the one drop it could not count — a
twin pair on one tile, where the first name on the list hid
the second beast's wound. The village's hardest beasts now
all have endings with names attached, and the count of their
wounds is complete.

## Sense notes (logs read end to end)

- SENSE-PASS on all 4 chains. The logs cohere with the uid
  stories in every case: Ursula's d71 meeting leaves the
  algorithm beast standing at 959 (bow, no arrows, binds her
  wound, dies in round 2) and the scholar's fight that same
  night lifts exactly 959 and ends with the scholar dead
  and no restore; Daniyar's d59 eulogy meeting ends with
  the beast at 853 and a flee, then silence until the
  lost-sight removal d62 — the beast that narrates deaths
  is itself left unnarrated, which reads as the mechanism,
  not a gap; Miguel and Isabel's d139 audit meeting leaves
  the beast at 785 with Miguel fleeing at 1 HP, and the
  scholar lifts 785 the next day; Miguel's d140 suburb
  meeting is one strike (15 damage, 1300→1285) and a death
  to Property Tax, then eighteen days of roaming before
  the uid-linked d159 fight. The matcher correctly refuses
  the other suburb fight (fightSeq 18, the uid-25 instance)
  — two beasts, one name, and the uid keeps them apart.
- Limitation, stated plainly (carried from removal/sameday):
  node-sim stubs Game.say to no-op, so there is no say
  transcript for any of this — evidence is the structured
  trace (uid trajectories, removal rows, scholar fights,
  stamps, meeting logs). The "lost your trail" line for the
  eulogy removal is code text, not observed narration; a
  browser play pass would be needed to hear it.
- A sense flag, not a verdict: the suburb bridge means a
  villager who watched Miguel die at 1285 and later heard
  of a 960 beast melting at the siege would have no
  in-world way to know they were the same beast — the toll
  is invisible in play. Whether the siege draft should leave
  a tellable trace (a wall report, a rumor, a haven line)
  is a narration question for a later arm, not a finding
  of this one. The measurement identity is proven; the
  village's knowledge of it is not this arm's call.

## Metric review

- The prereg bound the run and was honored, with two
  disclosed corrections, both before the judgments they
  affect: correction #1 (determinism path normalization —
  the committed corpus was generated in another worktree,
  and stack frames embed the worktree path; census stays
  byte-identical unmodified, and the test fails unless
  every raw row difference is a path difference); correction
  #2 (spawn-day chain→uid check — a single-meeting chain on
  its beast's spawn day has no meeting-day census by
  construction; the spawn event is the pre-meeting state
  for that day, so it checks the same logic with the birth
  as the start). No metric was re-scored mid-run: the
  suburb verdict comes from the corrected rule applied to
  the full run, with the original-rule pilot result
  (UNRESOLVED, named gap) disclosed above, not hidden.
- Proposed for the NEXT run only: adopt the uid-first
  matcher (with the spawn-day check and the stamped same-day
  gate) as the standard chain-matching rule, so future
  chain arms never re-litigate hp-exact misses chain by
  chain; and define "drafted instance" in the next prereg
  as the union of the census-visible count (10 here) and
  the chain-bridge count (1 here), since a bridge with no
  post-draft census is invisible to the census count alone.
- Instrument lesson (test hygiene, carried from removal):
  the determinism helper exits only after its finally block
  removes the scratch dir — verified here (scratch-removed
  = true, and the scratch path is worktree-local, never
  /tmp, per the sweep-outputs lesson).
- Safe-commit index-clobber variant (known class): all four
  commits in this run initially left the main index lying
  (bogus staged deletions / stale blobs; worktree files
  intact, commit contents verified correct each time).
  Repaired each time via update-index --cacheinfo from the
  HEAD blob and verified with an empty git status before
  proceeding. The commits are always correct; only the
  main index lies.

## RANKED NEXT (with numbers — no lever built here)

1. ADOPT UID-FIRST AS THE STANDARD MATCHER (this arm's
   proposal, not a change). Future chain arms should match
   by census uid first, hp second, with the spawn-day check
   and the sameday stamped gate — the two hp-exact blind
   spots on this band (1 chain, 1 drop) are now measured,
   and re-using hp-exact would knowingly reproduce them.
2. DRAFT RECORDER (carried, still open as an instrument):
   the suburb bridge's toll is signature + uid continuity
   in this corpus (draftflag dated the drafts directly in
   its own corpus; this matcher does not need it, but a
   single-corpus draft event would let one analyzer carry
   chain, draft, and fight without cross-corpus uid
   comparison).
3. BLOCKED-RESTORE CENSUS (carried from draftflag): the
   1-HP blocker pattern generalized band-wide — how often
   tbEnd restores fail on tile occupancy. This arm's
   drafted list (11 trajectories) is the population to
   census from.
4. FLED-CLASS COVERAGE (carried): FLED-BOLT / FLED-GAVE-UP
   (and CAMPAIGN-CLEAR / TITAN-FALL-CLEANUP) still have zero
   wave-4 rows on this band. A band where a wave-4 beast
   flees across a grid edge would exercise them.
5. HAVEN-ANCHOR DESIGN QUESTION (steve-call, carried):
   should a haven-pinned beast be able to lose sight and
   fade, or should haven presence anchor it?
6. SIEGE-DRAFT NARRATION QUESTION (new, from the sense
   flag): should a toll bridge leave a tellable trace for
   the village, or stay measurement-only?

## Convergence state

scale-onramp: converging, NOT converged. Full seat 0, wave 5 0
on this band, as on every band this cycle. No axis is
converged. No gate number was moved on this evidence, per the
2026-10-29 gate-sequencing note (prove behavior normal before
tuning gates to it). What converged further is the chain
accounting: under one uid-first rule, all 4 vanished chains
carry a primary verdict and the drop census is complete at
29/29, 0 UNCLASSIFIED — the hp-exact blind spots are now
measured, named, and bounded (1 chain, 1 drop on this band),
not open-ended.

## Commits (worktree sim-uidmatcher-a; coordinator merges)

- 41186a838 — preregistration (band, uid-first matcher rules,
  anti-smuggling rule, pilot + determinism gates).
- 742535d03 — prereg correction #1 (determinism path
  normalization; census still byte-identical unmodified).
- dd7e91a0a — prereg correction #2 (spawn-day chain→uid
  check for single-meeting spawn-day chains).
- 431dc4886 — instruments (uid-first matcher analyzer +
  fixtures, 12 checks + determinism gate).
- Evidence + analysis: committed together with this file
  (hash in the worker's final report to the coordinator;
  worktree shows only committed work at handoff).

No src/js game changes. No push, no version bump, no live
verification (measurement only). No [needs-eyes].
