# sim-stalkertick-a — stalker-tick recorder: do vanished wave-4 beasts tick toward the >6 removal?

**Verdict: DIAG-GO** (all prereg legs pass; see header-vs-result below).
Run: fleshout-20261030T0855Z, axis scale-onramp (converging, NOT
converged). DIAG ONLY — no game changes. Prereg:
`evidence/2026-10-30/sim-stalkertick-a-prereg.md` (committed before
any judged analysis; correction #1 committed after the 1-seed pilot,
before the judged full-band sweep — see below). Band: seeds
75101–75116, 180d death-aware, substrate tableseat-nowait exactly as
chainclose/recurrence/spawnhp/scholarmelt/removal used it (verified
from chainclose's sweep, not assumed). Corpus:
`evidence/2026-10-30/perseed-stalkertick-a/` (row + tick census per
seed), analysis: `evidence/2026-10-30/sim-stalkertick-a-analysis.json`.
Instruments: `scripts/policies/stalkertick-diag.js`,
`scripts/sweep-stalkertick-a.js`,
`scripts/analyze-stalkertick-a.js`, fixtures
`scripts/test-stalkertick-a.js`.

## The question, answered first

Do vanished wave-4 beasts accumulate lostSight ticks toward the >6
removal threshold? **For the eulogy, yes — and the tick path is now
traced turn by turn. For the suburb and the algorithm, no — their tick
paths are flat zero at every observation, and both were removed by a
fight, not by ticks.** The sibling arms' verdicts are CARRIED, not
re-judged here; what this arm adds is the tick evidence underneath
them, and it lines up exactly:

- s75102 eulogy 853: the tick path CONFIRMS the carried
  LOSTSIGHT-REMOVE verdict on independent instrumentation — 7
  consecutive monsterTurn ticks 0→7 on d62, removal at lostSight 7,
  no fight live, same HP (853), same tile (4,4).
- s75116 suburb 1285: the tick path RULES OUT lostSight — lostSight 0
  on all 18 census days and all 11 removal-day turn events; removal at
  lostSight 0 with a fight live, consistent with the carried
  SCHOLAR-MELT (toll bridge) verdict.
- s75102 algorithm 959: the tick path RULES OUT lostSight — lostSight
  0 on all 13 census days and all 3 turn events; removal at lostSight
  0 with a fight live, consistent with the carried SCHOLAR-MELT
  (EDGE) verdict. The same-day matching-window question is untouched
  by this arm (ranked-next #1).

## Prereg legs (header vs result)

| Leg | Prereg bar | Result |
|---|---|---|
| Completeness | 16/16 valid seeds, all recorders errs 0, overflow empty, census sorted + last day within 1 of row days | PASS — 16/16 rows, stalkertick errs 0 on all seeds, overflow empty everywhere, census sorted, last snapshot within 1 day on all seeds (75104/75113/75114 land 1 day short of row days, inside the bar) |
| Substrate equivalence | own row minus `stalkertick` byte-identical to chainclose's row per seed | PASS — 16/16 |
| Trace coverage | a trace for EVERY wild wave-4 instance; all 3 judged chains COMPLETE tick paths | PASS — 32 wild wave-4 traces; all 3 judged chains EXACT instance matches with COMPLETE tick paths (0 null lostSight values anywhere: 28,880 census entries, 0 null) |
| Determinism | 1 seed re-run, row + tick census byte-identical, scratch removed | PASS — seed 75102: row IDENTICAL, tick census IDENTICAL, DETERMINISM-PASS, no scratch left |
| Sense | full tick traces of the 3 judged chains + ≥3 non-vanishing wild instances read end to end | PASS — judged traces + 5 survived traces + 3 near-miss climbs + the second wave-4 lostSight removal read (see sense section) |
| Fixtures | test script green before judging | PASS — FIXTURES-PASS (36 checks, 0 fails) |

## Prereg correction #1 (pilot-caught, pre-sweep)

The original "wild = lingering false on every snapshot" rule
EXCLUDED the judged chains themselves: the pilot exposed that
`lingering` is a MUTABLE flag on the same object, not an identity
trait — the eulogy reads lingering=true on census d56–61 but
lingering=false on its d62 turns and removal; the algorithm flips
false (d59–64) → true (d65–70) → false (d71 removal); havenGrowth.js
sets/clears it around sieges. Corrected rule (committed before the
judged sweep): wild = wave 4, not a titan, and not lingering AT THE
FATE OBSERVATION (removal event, else final census) — matching the
sibling arms' fight-time semantics. The judged tick paths themselves
are unchanged by the correction; only universe membership moved, and
it moved to INCLUDE the chains this arm exists to trace. A second
pilot-caught fix in the same commit: the judged tick-path window runs
to firstAbsentDay (not lastSeenDay) so the removal day's monsterTurn
events — the climb itself — sit inside the path.

## The three judged tick paths, day by day

### s75102 eulogy (inst i25) — LOSTSIGHT-REMOVE, tick path COMPLETE

Carried verdict: LOSTSIGHT-REMOVE (sibling removal arm: removal seq
41, d62, lostSight=7 > 6, monsterTurn stack, no fight). This arm's
independent trace reproduces every element of it:

- Census (first census sighting d56; the chain's first villager
  meeting was d55 — the snapshot phase means a beast met during d55
  first appears on the d56 census): d56–61, tile (4,4) throughout,
  HP 877 → 853 (d57) → 853, lostSight **0 on all six days**,
  lingering=true on all six census days.
- MonsterTurn events before d62: NONE. The beast never ticked on any
  earlier day in this corpus — it was seen (or never monsterTurned
  unseen) on every day it was censused.
- d62 (removal day, scholar tile (4,4)): SEVEN consecutive
  monsterTurn events, 0→1 → 2 → 3 → 4 → 5 → 6 → 7 REMOVED, then the
  removal event: day 62, dayPart 2, HP 853, tile (4,4), lostSight 7,
  inMonsterTurn=true, tbfightLive=false, lingering=false.
- FirstAbsentDay 62. Fate LOSTSIGHT-REMOVE.

The climb lived ENTIRELY between censuses: no census day ever shows
lostSight > 0 for this beast. A census-only instrument would report
"never ticked" and miss the removal mechanism completely. The turn
events are the required instrument — that is the methodological
finding of this arm.

### s75116 suburb (inst i29) — tick path COMPLETE, lostSight ruled out

Carried verdict: SCHOLAR-MELT via toll bridge (uid-proven 1285→960
draft). Tick path:

- Census: d141–158 (first census sighting d141; chain meeting d140),
  wandering (5,3)→(5,4)→(6,4)→(5,5)→(6,4)→(8,4)→(7,4)→(7,3)→(7,4)→
  (6,4), HP 1285 throughout, lostSight **0 on all 18 days**,
  lingering=false throughout the census.
- MonsterTurn events: 11 on d159, ALL 0→0 (seen every time), the last
  REMOVED. Removal event: day 159, dayPart 2, HP **960** (not 1285),
  tile (4,4), lostSight 0, inMonsterTurn=true, tbfightLive=true,
  lingering=true.
- FirstAbsentDay 159. Fate OTHER-REMOVE.

Two things to say plainly. First, the tick answer is clean: zero
ticks at every observation, removal with a fight live — lostSight
played no part. Second, the removal object's HP (960) and lingering
flag (true) differ from the census instance (1285, lingering false):
that is exactly the sibling toll-bridge shape (the wild instance
becomes the 960 lingering draft), reported here as corroboration of
the carried verdict, NOT as a re-judgment of it. Phase note: the
beast is absent from the d159 census snapshot yet present in d159
turn events — the known snapshot-phase offset (scholarmelt's
finding): day-boundary-phase events carry the new day's label but
run before that day's census snapshot. The tick conclusion is
unaffected: every observation, census or turn, reads 0.

### s75102 algorithm (inst i26) — tick path COMPLETE, lostSight ruled out

Carried verdict: SCHOLAR-MELT (EDGE) under a same-day caveat. Tick
path:

- Census: d59–71 (the instance wanders from (5,5) from d59, moves to
  (4,4) on d65, HP 1000 → 971 (d66) → 959 (d71)), lostSight **0 on
  all 13 days**. Lingering flips false (d59–64) → true (d65–70) →
  false (d71) — the mutability finding again, in the same instance.
- MonsterTurn events: d65 0→0; d71 0→0, then 0→0 REMOVED. Removal
  event: day 71, dayPart 3, HP 959, tile (4,4), lostSight 0,
  inMonsterTurn=true, tbfightLive=true, lingering=false.
- FirstAbsentDay 72. Fate OTHER-REMOVE.

Tick answer: zero ticks, removal with a fight live — lostSight
played no part. The same-day matching-window question (whether the
d71 fight belongs to this chain) is NOT answered here; the tick
path is consistent with the melt story but does not itself resolve
the window (ranked-next #1).

## Band tick census (32 wild wave-4 instances, 601 instances total)

- Wild wave-4 instances: 32. With ≥1 monsterTurn event: 16. Ever
  ticked (max lostSight > 0): 5. Max-lostSight distribution: 0: 27,
  1–3: 2, 4–6: 2, 7+: 1 (the eulogy).
- Wild fates: SURVIVED-TO-END 20, LOSTSIGHT-REMOVE 1, OTHER-REMOVE
  11, NO-REMOVAL-EVENT 0. No wild instance vanished without a
  recorded removal event — the instrument has no census gaps on the
  wild universe.
- Removal events band-wide: 313. LostSight removals (inMonsterTurn
  + lostSight ≥ 7 + no fight live): 4. Of those 4, only 1 is
  wild-at-fate wave-4 (the eulogy). The other 3: s75105 hushwolf
  (wave 1, lingering-at-fate, HP 1), s75111 nightcourt (wave 1),
  s75113 eulogy (wave 4, lingering-at-fate — see below).
- Turn events band-wide: 3,887 (all instances; per-seed stTurns sum from the sweep log). Two seeds record
  ZERO monsterTurn events (s75103, s75108): the scholar never shared
  a tile with a monster during an action there. Turn coverage is
  tile-gated by construction (monsterTurn runs only for the
  scholar-tile monster); for beasts never on the scholar tile, the
  census value (0 throughout) IS the answer, by the structural rule
  in the prereg.

## The second wave-4 lostSight removal (s75113 eulogy, inst i47)

This beast is NOT in the wild-at-fate count (it ended
lingering=true), but it proves the mechanism fires for wave-4 beasts
beyond the judged chain, and it proves something the judged chain
cannot: **lostSight persists across day boundaries.** Its climb
splits across two days: d113 0→1→2→3→4→5, then d114 5→6→7 REMOVED
(removal LS 7, inMonsterTurn, no fight live). The counter is NOT
reset daily; it sits on the object until the beast sees a target.
Census: d112 HP 900 LS 0, d113 HP 675 LS 0 (lingering) — again, the
census never shows the climb; only the turn events do.

## Near-misses: the reset path is live, and 6 is not removal

- s75113 suburb (inst i49, wild): climbs 0→1→2→3→4 (d118–119) →5→6,
  then 6→0 on being seen again, then 8 more seen turns, then a fight
  removal. Six ticks did not remove it; being seen reset it.
- s75114 reunion (inst i40, wild): climbs to 5, then resets to 0,
  later fight removals.
- s75105 suburb (inst i36, wild): climbs to 2, resets, later fight
  removal.
- s75116 congregation (inst i26, wild): climbs to 3, then a
  3→0 REMOVED turn (seen-reset turn that also removed via fight).

The 7th unseen turn is the removal; the 6th is survivable. The
mechanism's edge is exactly where the code says it is (> 6).

## Sense (transcripts read, judged for meaning — not just counts)

Transcript limitation, stated plainly: node-sim stubs Game.say to a
no-op, so evidence here is structured trace (census + turn events +
removal events), not say transcript. What the traces say, read end
to end:

- The eulogy's story is coherent and complete: a beast that sat on
  the scholar's tile (4,4) for six census days, seen each day (LS 0),
  then spent one day unseen through seven consecutive scholar
  actions and faded. Nothing in the trace fights it, wounds it
  further, or moves it — the removal is the trail going cold, in
  exactly the code's terms ("it lost your trail").
- The suburb's story is coherent and complete as a contrast: 18
  days of wandering with a flat-zero tick line, then a fight removal
  whose object carries different HP and a different siege flag. The
  tick line excludes the trail-going-cold story for this beast as
  firmly as the eulogy's includes it.
- The algorithm's story matches its carried caveat: a beast that
  wanders in, lingers through a siege window (flag on d65–70, off
  d71), and is removed in a fight on the chain's last day with zero
  ticks anywhere. The tick evidence neither widens nor narrows the
  same-day window — it answers only the tick question, which is
  this arm's job.
- Non-vanishing comparison traces (all read): s75102 reunion i24
  (33 census days wandering (5,5)→(4,8), 0 turns, LS 0, survived);
  s75102 algorithm i28 (21 days roaming to the map edge (0,0),
  0 turns, LS 0, survived); s75102 strike i30 (survived, 0 turns);
  s75105 eater i39 (12 seen turns 0→0 across d156–160, LS 0,
  survived); s75105 strike i42 and suburb i43 (4 seen turns each,
  LS 0, survived). The normal wild life is: wander for weeks, never
  tick, never be removed — or be seen repeatedly on the scholar's
  tile with LS pinned at 0. Ticking is the rare exception (5/32),
  not the background condition.
- The chorus_line d58 trace (non-wild, wave 3) is the cleanest
  reset demonstration in miniature: 0→1→2→3→4 across one day, then
  back to 0 — the beast was seen again before the 7th unseen turn.

Sense conclusion: the tick instrument reads coherently against the
code (climb only while unseen on the scholar tile, reset on sight,
persistence across days, removal exactly at the 7th unseen turn),
and its verdicts line up with the sibling arms' verdicts on all
three judged chains without re-judging any of them.

## Wall numbers (report-only, not judged)

Won 9/16 (all lesser seats, full 0), national ever 13, national
final 11, table reached 12, table entered 9, wave reach 1:16, 2:16,
3:14, 4:9, 5:0, median survival 118d (upper-middle convention),
deaths 527, starvation 3, fieldparty meetings 2257. Identical to
chainclose/scholarmelt wall numbers, as substrate equivalence
requires.

## Determinism

`node scripts/test-stalkertick-a.js --determinism 75102`: row
IDENTICAL, tick census IDENTICAL, DETERMINISM-PASS, scratch removed.
Fixtures: `node scripts/test-stalkertick-a.js`: FIXTURES-PASS (36
checks, 0 fails).

## Ranked next (for follow-up arms, not this one)

1. **Same-day matching window with part-stamped ordering (would
   resolve algorithm).** Carried from scholarmelt ranked-next #2.
   This arm's algorithm tick path (LS 0, fight removal d71) is
   consistent with the melt story but does not resolve the window;
   a follow-up prereg should admit same-day fights when the day's
   meeting log provably precedes the scholar fight.
2. **Siege-flag lifecycle recorder.** `lingering` flips mid-life
   (eulogy, algorithm) and the suburb's 1285→960 + lingering-set
   conversion happens between censuses. A within-day flag/HP-change
   recorder would pin when wild instances become siege drafts —
   the toll bridge's middle step, currently inferred from endpoints.
3. **Scholar-tile-presence census.** 2/16 seeds record zero
   monsterTurn events and 16/32 wild instances never share the
   scholar tile for a turn. A presence census (which days the
   scholar shares a tile with each wild beast) would price how
   often the tick mechanism even gets a chance, per beast.
4. **Cross-wave lostSight census.** This band has 4 lostSight
   removals in 313 removal events across waves 1–4. A dedicated
   census arm could price the mechanism's overall frequency and
   check whether wave-4 beasts tick more or less often than the
   wave-1/2 beasts that also fade this way.
5. **Census-phase documentation.** The d159 suburb offset (absent
   from the census, present in same-day turns) and the d140 audit
   offset (scholarmelt) should be pinned in the sweep header so the
   next arm does not re-litigate snapshot-vs-boundary day labels.

## Findings-backlog items found (reported to the coordinator; NOT appended to sim-findings.md by this worker)

- **Census-only lostSight observation is blind.** The eulogy's
  0→7 climb lived entirely between daily censuses; a census-only
  instrument reports "never ticked" for a beast removed by ticks.
  Turn events are the required instrument for any tick claim.
- **lingering is mutable, not an identity trait.** It flips on and
  off the same object around sieges (eulogy, algorithm). Any
  instrument keying "wild" off a lingering snapshot misclassifies;
  fate-observation flags are the fix (prereg correction #1).
- **lostSight persists across day boundaries.** s75113 eulogy
  climbs 0→5 on d113 and 5→7 + removal on d114. It is not a per-day
  counter.
- **Six ticks is not removal.** s75113 suburb resets at 6 on being
  seen; only the 7th unseen turn removes. The edge is exactly > 6.
- **Turn-event coverage is tile-gated by construction.** 2/16 seeds
  (s75103, s75108) record zero monsterTurn events; beasts never on
  the scholar tile have no turn events, and their census LS 0 is
  itself the structural answer for them.

## Metric review (mandatory)

- **Wild definition (correction #1).** The original "false on every
  snapshot" rule was wrong for a mutable flag and would have
  excluded the judged chains. The fate-observation rule fixes it
  and matches sibling fight-time semantics, but it has its own
  edge: an instance that ENDS lingering (still besieging at run
  end) is excluded from judged tables even if wild-born. That edge
  is named, not hidden; a follow-up arm with a spawn-origin field
  could close it.
- **Tick-path window.** The original window (to lastSeenDay) would
  have excluded the removal day's turns — the climb itself. The
  corrected window (to firstAbsentDay) is what the evidence tables
  use. Any arm reusing tickPath should keep the removal day inside
  the window.
- **Removal-event attribution.** removeWorldMonster fires for lifts
  too; the analyzer labels non-monsterTurn removals OTHER-REMOVE
  without attributing a code path. That restraint is deliberate —
  the melt sink belongs to the sibling arms — but it means this
  arm's OTHER-REMOVE class is a bucket, not a verdict.
- **No metric was re-scored.** The GO bars (completeness,
  substrate, coverage, determinism, sense, fixtures) are judged
  exactly as preregistered; correction #1 changed a universe
  definition before the judged sweep, with the change and its
  reason committed, not a threshold moved after seeing full-band
  results.

## Commits (worktree sim-stalkertick-a; coordinator merges — merged locally, pending ship)

- 6a95014e8 — preregistration (band, substrate legs, GO bars).
- 4b50ee84d — instruments (recorder + sweep copy + analyzer +
  fixtures, 33 checks).
- c755ac243 — prereg correction #1 + analyzer window + fixtures
  (36 checks).
- Evidence + full-band corpus + analysis: committed together with
  this file (hash in the worker's final report to the coordinator;
  worktree shows only committed work at handoff).

No src/js game changes. No push, no version bump, no live verification
(measurement only). No [needs-eyes].
