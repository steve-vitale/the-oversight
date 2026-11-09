# sim-medheadcount-suite-a — SUITE UPDATE (evidence)

Run: oversight-flesh-out-loop, run fleshout-20261109T1015Z (Loop A).
Axis food-economy. Worker tree: ~/workspace/worktrees/sim-medheadcount-suite-a,
branch sim-medheadcount-suite-a. Base master: 8cee6a8d2.
Prereg: evidence/2026-11-08/sim-medheadcount-a-prereg.md (G1 share ≥70% +
zero-medic seeds ≤1/8; G2 median ≥0.8× before, starvation ≤ before+2, no new
death-cause mode ≥2; G3 panel; G4 proof 7/7). Pilot numbers stand from the
prior run (G1 82.3%, 0/8 zero-medic; G2 pass) but are NOT leaned on until the
confirm band passes — the confirm was not run in this session (see §Confirm).

## Verdict

**NO-GO ON LANDING — suite update incomplete, lever HELD (not a lever
rejection).** All 10 gate failures are attributed with mechanism (below);
none is a lever regression. Three are fixed by assertion repair (sketches in
§Fixes, not yet applied); seven are fixture-seed refreshes (search procedures
in §Fixes, not yet run). The full `check.js --quick` re-run, the proof test
7/7, and the 12–16 seed confirm band are all OWED to the next run. Evidence
commits alone; the lever (game.js, uncommitted, patch also held outside the
repo) and the test files stay as found for the coordinator.

## Step 1 — BLOCKING UNKNOWN: RESOLVED (test-region-start mechanism)

The closeout's unexplained item — why the lever makes newGame write
`oversight.meta.v1` 30× — is fully explained by code read + differential
probe (probe: scripts/test-region-start-probe-TMP.js, since deleted; rerun
from the test file if needed).

Chain, every link verified:
1. `_newGameInner` (game.js ~2789): when the chosen hero's familiarity tier
   has `animalLevel > 0`, every common animal in the region pool gets
   `_noteAnimalDepth(aid, level, {type:'home', day:0})`.
2. `characterGen.json` familiarity tiers: ONLY `native` has
   `animalLevel: 1`; local/neighbor/visitor/stranger all have 0.
3. `familiarityTier()` returns `native` only when `isNativeLanding()` —
   the hero's lifeseed sub-area lists the picked landing variant
   (`state.startLocation`) as home ground.
4. `metaProgression.js` wraps `_noteAnimalDepth`: every call returning
   truthy fires `metaNoteAnimal` → `metaSave` → one
   `localStorage.setItem('oversight.meta.v1', …)`.
5. The lever shifts the shared seeded RNG stream (the forced draw from a
   7-occupation pool with dedup re-rolls consumes a different number of
   draws than the 78-pool draw), so by the test's S9 section the drawn hero
   differs. Probe, seed 20261015, full test flow:
   - BASE: hero Luigi Boateng, rail conductor, homeRegion Columbus, Ohio,
     famTier=**local**, codex animals noted=0, meta writes=0, test 55/55.
   - LEVERED: hero Hunter Cole, rail conductor, same homeRegion,
     famTier=**native**, codex animals noted=**32** (common animals in the
     eastern-woodlands pool=32), meta writes=**30** (32 noted minus 2
     already in the store from earlier starts in the same process).
6. No game code READS the meta store during newGame (grep: `metaGet` /
   `_metaCache` occur only inside metaProgression.js). The writes are
   store-only cross-run achievement notes — the designed behavior of the
   native path, per metaProgression.js `read_only_power` ("achievements
   write ONLY to localStorage key oversight.meta.v1. They never touch game
   state"). A fresh game is unaffected.

Conclusion: the S9 zero-write assertion encodes "the fixture hero is a
non-native", not a lever regression. The test's own seed comment documents
exactly this fragility (seed refreshed 20261014→20261015 on 2026-10-31
because "at the old seed S9's roster[0] is a home native whose animal
familiarity legitimately notes home animals into the meta store during
newGame"). Fix: seed refresh (procedure in §Fixes). The blocking unknown is
closed; it does not block landing once the seed is refreshed.

## Attribution (verified standalone, this tree)

Base = lever stashed (0 `forceOccIds` matches); levered = patch applied
(22 insertions, 5 deletions, matches
hidden_files/medheadcount-a-gamejs.patch byte-for-byte in diff stat).
Every one of the 10 tests PASSES standalone on base and FAILS standalone on
the levered tree (base runs, this session):
- occupation-cohorts 6/6, cornucopia-wired 33/33, feast-healing-use 21/21,
  titan-standdown 22/22, party-opening-turn 9/9, region-start 55/55,
  table-ascension 17/17, pellet-boost 39/39, pellet-q4 19/19,
  capable-bot-20261014 40/40.
Base full-gate profile on this commit is the HEAD commit's recorded 294/6
(4 standing + measurement-proof staleness pair). WARNING: the full
`check.js --quick` I ran this session returned 275/25 and is NOT a clean
profile — I applied the patch mid-run, so node processes spawned after that
point loaded the levered game.js, and three sibling gates ran concurrently
(five tests hit the 120s timeout). Do not quote 275/25 as a base number; the
standalone runs above are the clean attribution evidence.

Levered standalone failures (DIAG runs, this session — DIAG copies deleted
after use; values below are the record):
- occupation-cohorts: npc-only 1 fail. feast-healing-use: 2 fails.
  titan-standdown: 3 fails in the DIAG run (1 in the gate log — the extra
  two cascade from the first: once standdown fires during a non-live fight
  the muster is gone, so the later dispatch/voice checks fail too).
  cornucopia-wired: 2 fails. table-ascension: 3 fails (T4b/T4c-pre/T4c).
  pellet-boost: 7 fails (cascade from one root, see below).
  pellet-q4: 1 fail. region-start: 1 fail (S9, mechanism above).
  capable-bot: 1 fail (§7 player-first food deed). party-opening-turn: 1
  fail (distinct squares).
- Load artifacts (not lever-attributable, re-check standalone on the final
  tree): test-contest-win-credit, test-time-save-crashes — both passed
  standalone on the fixed tree in the closeout; both failed in my
  contaminated gate run, which proves nothing either way.
- Standing failures (present on base too, untouched by this arm):
  mobile-combat-cadence, occupation-panels, phone-frame-proof,
  establishment-r20.
- Measurement-proof staleness pair (expected, allowed by the brief):
  test-measurement-proof-update + test-measurement-workflow — game.js is
  a manifest input; cured by the owed proof refresh, not by this arm.

## Per-test justifications (old expectation → lever change → fix)

1. **test-occupation-cohorts (npc-only)** — Old: fixture seed 4058's roster
   holds an er_nurse NPC (candidate=false), so setupGame with
   occupation er_nurse excludes with reason occupation_not_offered. Lever:
   the forced medic draws a different medical occupation and the RNG stream
   shifts; the roster still holds a medic NPC (guaranteed) but no er_nurse.
   The test's contract is "an NPC-only occupation is not a playable
   offer" — the specific occupation is fixture, not contract. FIX: refresh
   npcOnlySeed (procedure §Fixes). No assertion changes.
2. **test-region-start (S9)** — mechanism above. FIX: refresh SEED
   20261015. No assertion changes.
3. **test-party-opening-turn** — Old: seed 20 stages exactly player + 2
   companions in the opening bulldozer fight on distinct squares. Lever:
   the roster/party draw shifts; the joined humans no longer land on
   distinct squares. The contract is the opening-turn placement machinery,
   not which seed stages it. FIX: refresh seed 20 (same documented
   procedure as the file's own 7→64→20 refresh). No assertion changes.
4. **test-table-ascension (T4b/T4c-pre/T4c)** — DIAG: seat="none",
   ladder 11/12 (Fight 0 · Forage 2 · Craft 7 · Talk 2 · Explore 0, short
   1). The table never comes, so the audit line, the beloved offer and the
   epilogue never run; T4pre/T4a (ascension +10) still pass. The ladder
   counts summed track XP across the live roster (`_ladderSummedXp`), so a
   different roster moves the count by one bucket. The file's own comment
   says the bars are "the lever worker's territory; this test judges the
   ascension machinery past the bars". FIX: refresh SEED 1313 until the
   synthetic village clears 12/12 with all 17 passing. No assertion
   changes.
5. **test-capable-bot-20261014 (§7)** — Old: seed 81 stages player-first
   feast-deed banking. Lever: a villager's fight banks the deed before the
   player's first combat use. This is the file's own documented seed-drift
   class (header: "a villager banking the deed first is legitimate play,
   which is why the fixture is re-seeded rather than the assertion
   loosened"; SEATBLOW-OPEN first-source-wins stands). FIX: refresh seed
   81 (header documents the search; try 82+). No assertion changes.
6. **test-main67-titan-standdown** — DIAG: `K.fight(...,
   'speedbump_turtle', {party:true})` leaves `Game.tbfight` falsy — the
   party kills the turtle (or the fight never stages) before the check, so
   standdown dispatches instead of refusing, and the later checks cascade.
   The contract is "standdown refuses a LIVE fight"; the fixture (turtle +
   this party) no longer stages one. FIX: refresh seed 8991 until the
   turtle survives the opening with all 22 passing. No assertion changes.
7. **test-cornucopia-wired (2 fails)** —
   (a) Return: pantry=460 ✓, mult=1.15 ✓, streak {1,1} ✓ — the return
   WORKED. But `v.away[npc]` is a NEW expedition record (purpose
   expedition, sinceDay 20, duration 11): the NPC returned from foraging
   and immediately re-departed on an expedition via the villager-agency
   hook. The `!v.away[npc]` conjunct encodes "the NPC stays home after
   returning", which is not the contract — the contract is the haul + the
   chain. FIX (assertion repair, sketch in §Fixes): assert the FORAGE
   trip ended — `!v.away[npc] || v.away[npc].purpose !== 'forage'` —
   keeping pantry===460 and mult===1.15.
   (b) Finite harvests: mult=1.3 ✓, sequence=2 ✓ — the chain is correct.
   Units=21 (10+11) vs 15: cell-harvest yields are hero-competence
   dependent; the new hero yields more per cell. The chain properties
   hold; only the exact yield total is hero-drawn. FIX: refresh TEST_SEED
   7 until the full test passes (with repair (a) applied, the search only
   needs the finite total to be 15). No other assertion changes.
8. **test-feast-healing-use (2 fails)** — DIAG: ally kind=villager ✓,
   feasted=true, mult=2.03, enemy 10000→9998 — the companion's blow lands
   and the feast hook fires. BUT `surgeByBefore=v:gen_1wlybx4`: a DIFFERENT
   party villager already banked the deed during the fight's opening, and
   noteFeastedCombatUse is idempotent (first source wins, by design).
   The test assumes the first adult roster member is the first striker —
   a roster-draw accident, not a contract. FIX (assertion repair, sketch
   in §Fixes): derive the companion from the actual first-blow owner —
   after K.fight, if `s.prog.feastSurgeBy` is already `v:X`, use X as the
   companion (find their fighter); else use the roster companion as now.
   Both assertions then test the same properties (first-blow ownership
   preserved; later bearer blow cannot steal/repeat). No assertion
   wording changes.
9. **test-pellet-boost-20261108 (7 fails, one root)** — Focused probe
   (3 consecutive fresh hummice fights, scholar bearer): strike 1
   full-pantry landed 30 (boost 1) ✓; strike 2 empty-pantry landed 30
   (boost 2) ✓ — the empty pantry is NOT the cause; strike 3 landed 0,
   no boost. So the §3 "empty pantry" failure is a mislabel: the third
   consecutive fresh fight's strike lands 0 (monster unhittable/dodging/
   walkout on that draw — fight-level, draw-dependent), and every later
   count (floor boosts, heal rads, scholar exposure 8 vs 10) cascades
   from the missing boost #3. The pellet ledger/rads/exposure logic
   itself works (strikes 1–2 and both heals record correctly when the
   strike lands). FIX: refresh SEED 20261108 until all 39 pass. No
   assertion changes. NOTE for the next run: if the zero-strike
   reproduces on a fresh seed in a way that implicates the lever (it did
   not here — the probe ran on the levered tree and strikes 1–2 were
   correct), treat it as a real regression, not drift.
10. **test-pellet-q4-20261108 (1 fail)** — DIAG: bearer gen_wco817u
    (postal worker) is not among the fight's fighters (4 villagers joined
    a plain hummice fight; roster[0] did not). The test assumes roster[0]
    joins a plain startCombat — draw-dependent (which villagers join is
    proximity/willingness + RNG). FIX (assertion repair, sketch in
    §Fixes): derive the bearer from the actual fighters — start the fight
    first, pick a villager fighter present, grant THEM the reactor, then
    strike. The §5 pass rule still uses roster-derived ids and is
    unaffected. No assertion wording changes.

## Fixes (for the next run — NOT applied this session)

Assertion repairs (apply exactly as sketched, verify standalone):
- feast-healing-use §final: after `K.fight(G, 'hushwolf', {party:true})`,
  `const firstBy = s.prog.feastSurgeBy; const companion = firstBy &&
  firstBy.indexOf('v:') === 0 ? firstBy.slice(2) : <current roster find>;`
  then `ally = fighters.find(f => f.villagerId === companion)` as now.
- pellet-q4 §4: move `f = startFight(G)` before the grant; `const vf =
  (G.tbfight.fighters||[]).find(x => x.kind === 'villager'); const
  bearerVid = vf.villagerId;` then grant the reactor to bearerVid; keep
  all later uses of bearerVid.
- cornucopia-wired return line: replace `!v.away[npc]` with
  `(!v.away[npc] || v.away[npc].purpose !== 'forage')`.

Seed refreshes (run the full test per candidate; first all-green seed
wins; update the seed constant + a header comment line in the file's own
style — no assertion changes):
- occupation-cohorts: find a new npcOnlySeed where the roster holds an
  er_nurse with candidate===false and er_nurse is not among the 4 offered
  cards. Fast probe: loadGame({seed}) → genRoster('Columbus, Ohio') →
  check the shape (no full test needed for the search; verify with the
  full test once). NOTE: the excluded-driver scenario also uses
  npcOnlySeed (needs er_nurse absent from offers — same condition).
- region-start: SEED 20261015 → try 20261016, 20261017, … (full test ~5s).
- party-opening-turn: seed 20 → try 21, 22, … (full test ~3s).
- table-ascension: SEED 1313 → try 1314, 1315, … (full test ~5s; T4's
  village must clear ladder 12/12 with all 17 passing).
- titan-standdown: seed 8991 → try 8992, 8993, … (full test ~3s; the
  turtle must survive the opening with all 22 passing).
- cornucopia-wired: TEST_SEED 7 → try 8, 9, … AFTER repair (a) (full
  test ~6s; finite total must be 15 with everything else green).
- pellet-boost: SEED 20261108 → try 20261109, … (full test ~3s).
- capable-bot: seed 81 → try 82, 83, … (full test ~60s solo, slowest;
  budget the search; §7 must show player-first banking with all 40
  passing).

Then, in order: (1) re-run the 10 tests standalone on the final tree
(all green); (2) `node scripts/test-medheadcount-a.js` must pass 7/7
(L0–L3 need the lever; L4–L6 need the pilot corpora, already in-tree);
(3) `node scripts/check.js --quick` on a FROZEN tree — green except the
two measurement-proof staleness failures (do not mutate game.js or run
other node work mid-gate; the 275/25 in this session is the cautionary
tale); (4) confirm band (§Confirm); (5) commit with safe-commit.sh from
INSIDE the worktree (never the main-tree copy — the 2026-11-09 CD trap).

## Confirm band (NOT RUN — owed, band verified fresh)

Fresh band: **96009–96024 (16 seeds)**. Freshness search, per the
seed-band skill: `grep -rhoE "\b9[0-9]{4}\b"` over
`evidence/*/sim-*-prereg.md` (550 used) and over all of `evidence/` (1359
used), plus word-boundary checks of 96009–96024 in docs/ and
hidden_files/. 96401–96416 was rejected: 96401–96404 are used by
journey-deepening r116 (evidence/2026-11-07/journey-deepening-r116-prereg.md).
96009–96024 appears nowhere. Searched files: all sim-*-prereg.md under
evidence/, all evidence/*.md, docs/, hidden_files/ (word-boundary).

Procedure for the next run:
- Generalize the instruments first (they hardcode the pilot band):
  `scripts/sweep-medheadcount-a.js` main() FATALs unless SEEDS is exactly
  96301–96308 and DAYS=150 — relax to any 8–16 seed list (keep the
  96301–96308 default and DAYS=150). `scripts/analyze-medheadcount-a.js`
  `summarize()` hardcodes seeds 96301–96308 and /8 denominators — accept
  `--seeds <csv>` (default the pilot band) and derive denominators from
  the seed count. Keep 8-seed behavior byte-identical (proof test L5 pins
  the pilot numbers: share 56.1%, zeroMedicSeeds 2/8,
  spawnSeedsWithMedic 4/8).
- Run: `PLENTYDEPRI=1 DEPOSITGATE=1 SEEDS=96009,…,96024 DAYS=150
  OUT=evidence/2026-11-09/medheadcount-confirm-before/sweep-competent.json
  PERSEED_DIR=evidence/2026-11-09/medheadcount-confirm-before node
  scripts/sweep-medheadcount-a.js` on BASE (lever stashed), then the same
  with `medheadcount-confirm-after` on the LEVERED tree. Then
  `node scripts/analyze-medheadcount-a.js --before …-before --after
  …-after`.
- Judge against the prereg bars, proportionally scaled to 16 seeds
  (recorded here so the next run does not re-decide them): G1 share
  ≥70%, zero-medic seeds ≤2/16; G2 median ≥0.8× before median, starvation
  ≤ before+4, no new death-cause mode ≥2 (mode reading per the adoption
  run's Metric review; the analyzer does not wire the clause yet — judge
  it by hand from the analyzer's deathCauses output, or wire it: collapse
  fight labels monster/arena/combat/wild/expedition/duel/raid into one
  'fight' mode and flag any other cause present in after with count ≥2
  that was absent in before).
- The 82.3% pilot number must not be leaned on until this confirm passes.
- G3 panel (§15 balanced panels before/after on the confirm corpora) is
  also owed; the pilot panel stands at review_required, no
  regression_signal, with the seed-42 capable watch carried (village
  deaths 68.5 → 89.5 on one seed, expedition-led).

## Metric review

- The G2 third clause ("no new death-cause mode ≥ 2") remains
  hand-judged, as in the adoption run; the analyzer wiring is owed
  (sketched in §Confirm). No clause is re-scored here.
- The prereg's G1/G2 bars are unchanged; the confirm's proportional
  scaling (≤2/16 zero-medic, starvation ≤ before+4) is a stated scaling
  for the 16-seed band, not a loosening of the 8-seed bars.
- The contaminated 275/25 full-gate number in this session is DISCARDED
  as a profile (tree mutated mid-run + 120s timeouts under 3-way gate
  contention); the standalone attributions above replace it.
- Proof test 7/7 not yet re-verified on this tree (needs the suite fixes
  first); its STATUS header still describes the reverted tree (4/7 by
  design). Do NOT add it to the green list until it passes 7/7 levered.

## Sense (SENSE-TESTING LAW)

No new sense probe this session; the pilot's sense record stands
(medic teaching chains form within days, duty line lands day 1, the
guarantee is invisible in fiction — correct). The feast DIAG adds one
sense note: the first-blow deed banking by a non-party joiner
(gen_1wlybx4) is the System crediting whoever's blow actually lands
first — the fiction ("the feast was the weapon") is honest about that,
which is why the fix derives the companion from the fight rather than
renaming the deed.

## Village assessment in plain words

Nothing new measured this session — no sims were run beyond the pilot
corpora (the confirm band is owed). The pilot's picture stands: every
village starts with a healer, four days in five have one present, and
the two villages that never had a healer now do. The gate work this
session was all about the test suite catching up to that change: the
opening cast is different people now, so ten fixture tests that had
memorized the old cast's exact faces, yields, and first blows need their
fixtures re-picked. None of the ten failures is the game getting worse —
each one, read closely, is the game doing the same thing with different
people in the room.

## Blanks filled or documented

- FILLED (explained): the test-region-start blocking unknown — mechanism
  fully traced (RNG shift → native hero → 32 home-animal notes → 30
  meta-store writes, store-only by design, zero meta reads).
- DOCUMENTED (attributed, fixes briefed): all 10 gate failures with
  per-test DIAG values and fix procedures (§Per-test justifications,
  §Fixes).
- DOCUMENTED (freshness): confirm band 96009–96024 verified fresh
  (search scope recorded in §Confirm); 96401–96416 rejected (r116
  collision).
- OWED (not done): 7 seed refreshes + 3 assertion repairs; proof test
  7/7; full gate on a frozen tree; 16-seed confirm band (before + after)
  + G1/G2 judgment; G3 panel on the confirm corpora; G2 third-clause
  analyzer wiring.

## Files

- Evidence (this file): evidence/2026-11-09/sim-medheadcount-suite-a.md
- Lever (uncommitted in the worktree; patch copy outside the repo):
  ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/medheadcount-a-gamejs.patch
- Prior record: evidence/2026-11-08/sim-medheadcount-a.md (+ prereg
  evidence/2026-11-08/sim-medheadcount-a-prereg.md)
- Base standalone logs: /tmp/base-test-*.log, /tmp/base-capable-bot.log
  (ephemeral; values quoted in §Attribution)
