# sim-fightgate-scope-b — DIAGNOSTIC census on finding #2506

**Arm:** sim-fightgate-scope-b (Loop B, run fleshout-loop-b-20261118T0130Z) ·
**Branch tip:** `ef59e68dd` (prereg + instruments + proof; evidence + corpus
follow in a second commit) · **Prereg:**
`evidence/2026-11-18/sim-fightgate-scope-b-prereg.md` (frozen before any
sims) · **Band:** 104301–104308 (fresh — see prereg) · **Horizon:** 150d
death-aware · **Policy:** competent verbatim · **Substrate:**
`VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1` (the seekgate substrate) ·
**Legs:** one census leg, MODE=diag (no lever, no contrast).

## Verdict: DIAG-GO per the frozen prereg

All five bars pass. The diagnostic answers the question it was asked:
the fight gate's scope gap is real, measurable, and small on this band
— and it is NOT the SEEK gate's scope that is the gap.

| Bar | Result | Numbers |
| --- | --- | --- |
| D1a (completeness): wild meetings unclassified | **PASS** | 0 unclassified of 113 wild meetings |
| D1b (population): wild wave-4+ meetings | **PASS** | 113 (>= 40) — world-tick 62, aid 51, patrol 0 |
| D2 (Suburb presence): wild Suburb meetings | **PASS** | 8 (>= 3) — all on seed 104307 |
| D3 (classifier validity): replica vs live gate on expedition rows | **PASS** | 47/47 = 1.000 (>= 0.95, n >= 5) |
| Instrument | **CLEAN** | 8/8 files, exact frozen seed list, 0 instrument errors, missingHp 0, recMismatch 0 |
| Proof | **PASS** | `scripts/test-fightgate-scope-b.js` 53/53, 0 fail; `analyze-fightgate-scope-b.js --selftest` 22/22 |

## The answer (the substance, reported not gated)

**The wild paths are where wave-4 meetings happen, and the gate would
have avoided 1 in 6 of them.** Of 160 wave-4+ meetings on the band,
113 arrive by world-tick (62) or aid (51) — patrol 0 — against 47 by
expedition. The expedition gate would have avoided **18 of the 113
wild meetings (15.9%), all by the outmatched rule** (party under 3, or
not all armed/armored); the veteran-guard rule fires **nowhere** — not
on any wild meeting, and not on any of the 73 live gate calls either
(26 avoid/outmatched, 46 null, 1 seek, 0 veteran-guard).

**What those 18 meetings cost:** 2 villager deaths (both eulogy:
104302 day 150, taken 8 — entered the fight already hurt; 104306 day
96, taken 82) and 10 flees carrying 288 damage, plus 5 monster-flees
and 1 kill. Sixteen of the 18 are eulogies, on three seeds
(104302: 10, 104306: 5, 104308: 2); the trick was already known on 14
of the 18 — these are not trick-ignorance deaths, they are outmatched
parties fighting anyway. Against that: 11 wild wave-4 deaths total on
the band, so the gate's avoid surface covers 2 of 11 (18%). The other
9 died in fights the gate would NOT have avoided — full geared parties
losing fair fights (including 104306 day 67, a hunt-plan fighter killed
by an eater with a would-avoid of false).

**The Suburb slice — the #2506 species — shows no harm.** All 8 wild
Suburb meetings are on one seed (104307), all end in a round-1 flee
with 0 damage dealt, 0 deaths, 49 damage taken total. The sequence
reads as the learning path working: days 89–90 the trick is unknown
and the fighter flees on morale (fleeWise false, taken 5 and 4); from
day 91 the trick is known and all six meetings are wise leaves
(fleeWise true, taken 4–8 each — the parting hit). Seven arrive by aid,
one by world-tick; the fighter holds a party-stage plan throughout.
Post-learning, the wild Suburb meeting is already correct as fought.

**The launched-party slice is empty — because there are no launched
parties.** Wild launched-plan meetings: 0. That is not a wild-path
miss: there are **zero wave-4 launches on the whole band**. The 131
depart:launch rows are all wave-3 hunts (targetWave 3: 80, null: 51 —
callback, redactor, spool, ad_break...). No plan ever reaches needWave
4 here (standing caps at 199 on 5/8 seeds — the veteran lock), so no
wave-4 party ever sets out to be jumped. Five wild meetings do hit
hunt-stage plan holders (104302 day 46, 104306 days 56/57/58/67), all
with would-avoid false — plans exist on the road, launches do not.
The "does the scope gap hit launched parties" sub-question is therefore
UNANSWERED on this band, not answered-no; it needs a band where wave-4
parties actually launch.

**Expedition contrast:** 47 expedition meetings, would-avoid 0 — the
avoids never become encounter rows, because an avoided fight never
happens. The 26 live avoid/outmatched gate calls are the gate working
where it runs.

## The scope gap, in plain words

Finding #2506 said the SEEK gate's scope is expedition-only because
aid/world-tick meetings never consult `winPlanFightGate`. The code
reading behind this arm says the shape is different from the finding's
implication: there is no SEEK decision on the wild paths to gate — the
wild paths never walk in on purpose, they get jumped, and the only
protection they have is the in-fight trick, which already works there.
The real scope gap is the gate's two AVOID rules: on the expedition
path an outmatched party goes back for help and a table veteran is
guarded; on the road the same party fights. Measured: 18 meetings in
113 where the road party would have gone back, costing 2 deaths and
288 flee damage. The SEEK clause itself is untouched by this gap — no
wild meeting is a SEEK walk, and none could be gated by extending the
SEEK clause.

## Sense-testing

- The 104307 Suburb run reads as people learning: two maulings (days
  89–90, trick unknown, morale flees), then the trick lands and six
  straight wise leaves (days 91–95), each taking one parting hit
  (4–8 damage). Nobody dies; the street is never fought, only left.
- The one would-avoid kill is the honest exception: 104302 day 127,
  a duo meets a Herald on the road (would-avoid: party of 2), and the
  ranged opening volley kills it before round 1 ("Helga sees The Herald
  coming and nocks an arrow — it takes The Herald for 16 (0 left)").
  The classifier judges pre-fight inputs; the volley is a fight
  outcome. An outmatched party can still win — the gate avoids the
  fight, it does not predict it.
- The fair-fight death: 104306 day 67, a hunt-plan fighter with a full
  geared party is killed by an eater. The gate's bar (full + armed +
  armored) is a survivability screen, not a guarantee.
- The eulogy cluster: 16 of the 18 would-avoids are eulogies, and on
  104302 they arrive almost daily from day 129 to 150 (flee, flee,
  monster-flee, monster-flee, flee, death). The same under-geared
  villagers keep meeting the same street's story and paying for it.

## Metric review

- **D1b/D2 bars were floors, and the band cleared them with room:**
  wild 113 vs bar 40, Suburb 8 vs bar 3. The fleerepair2 calibration
  (wild 134, Suburb wild 4) predicted this band well.
- **D3 is stronger than frozen (supplementary, not re-scored).** The
  frozen D3 checks the replica against the live gate on expedition
  ENCOUNTER rows (47/47). The same corpus also carries all 73 live
  gate rows (v4gates), including the 26 avoid rows that never become
  encounters: replica vs gate agrees **73/73, 0 disagreements**. The
  avoid branch is therefore validated on live data too, not only by the
  proof-test table. This does not change the frozen verdict (already
  DIAG-GO); it is reported so the next run can promote it.
- **Veteran-guard fired nowhere.** No wild meeting, no gate call, no
  would-avoid is a veteran-guard. The rule needs a table-stage veteran
  meeting a wave-3+ beast under-geared — that shape does not occur on
  this band (table 0 on all 8 seeds). A gate arm for the wild paths
  would be an outmatched-only gate on this evidence; the veteran-guard
  half is unmeasured.
- **Patrol 0, again.** Like the fleerepair2 control corpus, this band
  has zero wave-4+ patrol meetings. The patrol path exists in the
  taxonomy but contributes nothing to the wave-4 census on either band.
- **Launches 0 is the band's real hole.** The diagnostic cannot say
  whether launched parties are hit on wild paths, because no wave-4
  party launches here. That is a property of the band (veteran lock
  at 199), not of the instrument. Do not re-score the verdict from it;
  the verdict is about the wild census, which is complete.
- **recMismatch 0, missingHp 0.** The recorder is clean on this corpus
  (the fleerepair2 band carried the known #2497 Pack Hunt mismatch;
  this band does not).

## Infrastructure notes (for the record, not the verdict)

- **Proof re-runs:** `scripts/test-fightgate-scope-b.js` 53/53 ALL PASS
  on the final tip (live §1 wild-path Suburb leave with trick known /
  none without; §2 wildSnapshot + fightOrigin; §3 analyzer incl.
  --selftest 22/22; §4 driver exports). Analyzer `--selftest` 22/22.
- **Driver smoke:** 1 seed (104301) 30d before the census — 0 errors,
  file written, 0 v4encounters (maxWave 2 at 30d — no wave-4 unlocked
  yet, expected). Smoke output discarded, not judged; the smoke
  directory is not committed.
- **Census:** 8/8 seeds, 150d, 0 instrument errors on every seed
  (per-seed v4encounters 18/32/21/10/37/22/12/8). One village lost
  (104306, day 110); the rest survived to 150d. Wall: national
  standing 3/8, rank 0, table 0, wins 0, wave 4 8/8, wave 5 3/8,
  median survival 150.5d.
- **No check.js run:** per the arm brief, the coordinator runs the
  gate if needed; no `node scripts/check.js` was run (a Lane B endgame
  r239 adoption gate may be running). Zero src/js changed, so no
  green-list file is touched.
- **No write flap struck this arm.** Registration took ~8 min (the
  reaper runs first inside the register script); the rebase onto
  master (62b1e749d) was clean; the safe-commit index clobber hit the
  first commit exactly as warned and was repaired via the ls-tree -r
  pipe (commit verified correct, worktree clean after repair).

## Limitations and next arms

1. **The gate shape, for the next run:** an outmatched-avoid on the
   wild routers (`resolveWildMonsterEncounter` / `resolvePatrol`) —
   consult `winPlanFightGate`'s avoid rules (or a shared helper) before
   `fieldFight` on those paths, returning the fighter to gathering
   instead of forcing contact when outmatched. Measured prize on this
   band: 2 deaths + 288 flee damage across 18 meetings. Whether that
   prize is worth a new gate — and whether the "go back for help"
   fiction reads on a roadside jumping — is the next arm's call, with
   this census as its numbers. The veteran-guard half needs its own
   band (a table-stage veteran must exist first).
2. **Launched-party slice needs a launching band.** Re-run this census
   (same frozen bars) on a band where wave-4 parties launch — or fold
   the wild snapshot into a launch-rich panel — before claiming anything
   about launched parties on wild paths.
3. **D3 promotion:** the supplementary 73/73 gate-row agreement should
   be promoted into the frozen D3 for the next census (same corpus,
   stronger bar).
4. **The Suburb question is closed on this evidence.** Post-learning
   wild Suburb meetings end in wise leaves with 0 deaths on two bands
   now (seekgate 103601–103608, this census 104301–104308). Do not
   re-measure the Suburb slice without a new lever or a new shape.
5. **Merge order:** none — this branch changes no game code (driver +
   analyzer + proof test + evidence only). It can merge whenever the
   coordinator wants it; nothing depends on it and it depends on
   nothing.

## Files

- Prereg: `evidence/2026-11-18/sim-fightgate-scope-b-prereg.md`
- Evidence (this file): `evidence/2026-11-18/sim-fightgate-scope-b.md`
- Census driver + analyzer + proof:
  `scripts/fightgate-scope-driver-b.js`,
  `scripts/analyze-fightgate-scope-b.js`,
  `scripts/test-fightgate-scope-b.js`
- Census corpora: `evidence/2026-11-18/perseed-fightgate-scope-b-diag/`
  (8 files)
- Census analysis: `evidence/2026-11-18/fightgate-scope-b-analysis.json`
- Run log: `evidence/2026-11-18/fightgate-scope-b-analyze.log`
