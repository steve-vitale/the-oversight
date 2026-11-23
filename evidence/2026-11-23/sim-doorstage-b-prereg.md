# sim-doorstage-b — FROZEN prereg (Loop B run fleshout-loop-b-20261123T1230Z)

**Frozen:** 2026-11-23 ~07:10 UTC, BEFORE any judged leg. Base master
`7ade8d3bf4a53f251845af1d5e0d079fd7f3fd0a` (worktree HEAD at freeze: the
0230Z adoption closeout). Branch `sim-doorstage-b`, worktree
`~/workspace/worktrees/sim-doorstage-b`. Run
`fleshout-loop-b-20261123T1230Z`, arm `sim-doorstage-b` (the STAGED-DOOR
re-judge of the leader-projection gate — the tracker's topmost next
blank for Loop B after the doorrich DIAG-NO-GO).

## The question (the third consecutive supply failure, and the named next step)

The leader-projection gate's D1 is UNJUDGED after three supply failures:

1. **leaderproj-b** (2026-11-22): the gate fired 8 times and the armed
   leg fought ZERO collapse-band doors — the mechanism works — but D1
   was blind: gate-avoid notes are deleted at `expeditionReturn`, so
   9 fires read as 1 note. NO-GO kind METRIC-BROKEN.
2. **gateavoid-b** (2026-11-23 0030Z): the durable log (`st.gateAvoids`)
   proved attribution works (the one pool door was proj-attributed),
   but the control pool collapsed to a single door that was already
   GOOD — a −20pp improvement on a 0%-bad pool is mathematically
   unpassable. NO-GO kind METRIC-BROKEN (bar unpassable on this pool).
3. **gateavoid-doorrich-b** (2026-11-23 0230Z): three fresh 8-seed
   bands screened, each returning exactly **1 pool door** — fought
   doors are rare (12/24 seeds) and leaders rarely enter them at
   ≤ 75 HP (3/12). DIAG-NO-GO on supply. Its metric review names the
   next supply strategy verbatim: **stop screening fresh bands and
   stage pool doors deliberately**.

This arm is that strategy. It stages the doors the sims will not
supply: a geared pinned quad walks into a wave-4+ door with its
leader hurt (≤ 75 HP), through the real `expeditionMonster` door-open
decision, on both legs — control (gate OFF, the door is fought) vs
armed (LEADERPROJ=1, the gate refuses it). D1 is judged on the
staged pool only, by the same analyzer and the same frozen rule.

## What was read first (do not re-measure what they answered)

- `docs/CANON.md` + `docs/MONSTER-WAVES.md` (wave-4 bands: damage
  35–95, HP 850–1500, a 4–6 round fight; wave-5 bands: damage 50–130,
  HP 1000–2200). The gate is a sim lever, judged door by door.
- `evidence/2026-11-22/sim-leaderproj-b.md` + its frozen prereg (the
  original D1 rule; the 8-fires / 1-note diag; the door-fight and
  matched-pool tables).
- `evidence/2026-11-23/sim-gateavoid-b.md` + its frozen prereg (D1–D6
  carried verbatim here; the durable log; the 1-door 0%-bad pool).
- `evidence/2026-11-23/sim-gateavoid-doorrich-b.md` + its frozen
  prereg (the screen rule; exactly 1 pool door per band across 3
  bands; the metric review naming this arm).
- `evidence/2026-11-23/sim-winnability-chain-round-0230.md` (the
  adoption record; the three supply failures in one place).
- `docs/MEASUREMENT.md` §§9–12, 14–15 (staged method, metric
  binding, §14a kill taxonomy, balanced panels).
- `~/workspace/custom-skills/local_seed_band_freshness/SKILL.md` —
  see "Seed bands" below: no sim band is consumed by this arm.

## The mechanism (read from the sources, not taken on trust)

The door-open decision lives in `expeditionMonster`
(`src/js/villager-agency.js`). A pinned quad (`PINQUAD=1`, three
pinned allies, `_pinDoor` true) meeting a wave-4+ monster passes
three gates in order, each with the same avoid verb (encounter note
+ return, no fight, no flee, no death) and the same counter shape:

- HPGATE (landed): whole party, any member < 25 HP → 'hold' note,
  counter `st.hpgateFires`.
- LEADERHPGATE (landed, subsumed): leader < 25 HP → 'lead' note,
  counter `st.leaderhpgateFires`.
- LEADERPROJ (landed, env-gated): leader projected ≤ 25 HP after two
  rounds at 25/round (leader HP ≤ 75) → 'proj' note, counter
  `st.leaderprojFires`, durable log entry in `st.gateAvoids`.

Then `fieldFight(vid, m, null, {awareness, allies, allyVids,
allyFromStart: _pinDoor})`. The staging pattern is the one the
proof tests already prove (`scripts/test-leaderproj-b.js`
`stageMeeting`, `scripts/test-gateavoid-b.js` `stageMeeting`):
`loadGame({seed, mode:'pinquaddoor'})` + `setupGame`, pick four
ranging villagers, gear them, `startExpedition` ×4, `pinQuadParty`,
set the leader's HP, force the monster pool, call
`expeditionMonster(holder, 3, false)` until a fight (rounds ≥ 1)
or a gate fire — max 30 calls, then an instrument error. Zero
`src/js` changes in this arm: the gate already exists env-gated;
the driver stages through existing entry points. **If the staged
driver needs a game-code hook that does not exist, STOP and report
the exact missing entry point instead of inventing one.**

## THE STAGED-DOOR SPEC — frozen (the driver implements exactly this)

The spec is frozen twice: here in markdown, and machine-readably in
`evidence/2026-11-23/doorstage-b-spec.json` (committed with this
prereg). The proof test (M3l) asserts the JSON matches this table
door for door; a mismatch is a loud failure before any leg runs.

**Party (every door, both legs):** a geared wave-4 hunting party —
four villagers (holder + 3 pinned companions), each equipped
`hide_armor` + `hunting_spear` (the pinquaddoor / leaderproj /
gateavoid encounter-gear fixture; armor P measured back in the live
8–30 range per member — the driver records the measured P per door
and the proof test asserts the range). Allies at 100 HP. The leader
at the staged HP. **Why a villager quad, not the scholar:** the
projection gate reads a villager expedition leader at the
`expeditionMonster` door-open decision; the scholar has no
expedition path through this gate, so a scholar-led door cannot
test it. The encounter-gear rule (Steve 2026-11-13) is met by the
geared party with average wave-4 gear — never a fresh un-geared
solo scholar — exactly as the three prior arms staged it.

**Monster pool override:** the driver sets
`Game.monsterWavePool = function () { return [mdef]; }` for the
staged door's single monster def (the same staging mechanism the
leaderproj/gateavoid proof tests use with the whole wave pool; here
narrowed to one def so each door tests its named monster). The gate
reads the def's real `wave` and the fight uses the def's real stats.
The override is driver-side staging, not a game change.

**No dead1 doors:** the staged leader HPs are 30–95. A leader below
25 HP is refused by HPGATE ('hold') before LEADERPROJ is ever
reached, so dead1 (≤ 25) is outside the projection gate's marginal
pool (26–75) by construction — staging it would price HPGATE, not
LEADERPROJ. Stated, not hidden.

**"Safe-but-≤75HP":** read as pool doors the quad WINS despite the
projection (the forecast is pessimistic — the 107394 rerun vKill at
38 HP is the worked example). It is an outcome property of pool
doors, not a separate HP band. The safe controls below (leader
> 75 HP) prove the gate does NOT refuse healthy doors.

| Door | Seed | Monster | Wave | Leader HP | projHp2 | Band | Pool? |
|---|---|---|---|---|---|---|---|
| 1 | 424200 | audit | 4 | 30 | −20 | dead2 | pool |
| 2 | 424201 | reunion | 4 | 40 | −10 | dead2 | pool |
| 3 | 424202 | eater | 4 | 50 | 0 | dead2 | pool |
| 4 | 424203 | strike | 4 | 35 | −15 | dead2 | pool |
| 5 | 424204 | suburb | 4 | 55 | 5 | collapse2 | pool |
| 6 | 424205 | eulogy | 4 | 65 | 15 | collapse2 | pool |
| 7 | 424206 | algorithm | 4 | 75 | 25 | collapse2 (boundary) | pool |
| 8 | 424207 | congregation | 4 | 60 | 10 | collapse2 | pool |
| 9 | 424208 | influencer | 4 | 70 | 20 | collapse2 | pool |
| 10 | 424209 | audit | 4 | 55 | 5 | collapse2 | pool |
| 11 | 424210 | rerun | 5 | 45 | −5 | dead2 | pool |
| 12 | 424211 | spoiler | 5 | 65 | 15 | collapse2 | pool |
| 13 | 424212 | reunion | 4 | 85 | 35 | safe | control (negative) |
| 14 | 424213 | eater | 4 | 95 | 45 | safe | control (negative) |
| 15 | 424214 | audit | 4 | 80 | 30 | safe | control (negative) |
| 16 | 424215 | cancellation | 5 | 90 | 40 | safe | control (negative) |

**Pool size: N = 12 staged pool doors (4 dead2 + 8 collapse2; 10
wave-4 + 2 wave-5) + 4 safe negative controls = 16 staged doors.**
Bands per `projectionBand` in `scripts/analyze-gateavoid-b.js`
(dead1 ≤ 25, dead2 26–50, collapse2 51–75, safe > 75).

## Seed bands

**No sim seed band is consumed by this arm.** The door seeds
424200–424215 are FIXTURE seeds for staged single-door loads
(each door is one fresh `loadGame`, not a 150d sim) — the same
class of seed as the proof tests' 11 and 424242. Grep of
`evidence/*/sim-*-prereg.md` for `42420` / `42421` returns no hits
(the only `424242` hits are the pinquaddoor / finalvoice preregs
naming it as a fixture seed; 424242 is outside this arm's range).
No band-freshness verification applies, because no band is used;
stated here so a later reader does not mistake the door seeds for
a sim band.

## Design — paired staged legs on the SAME doors

- **Control leg:** substrate flags only (LEADERPROJ unset — gate
  OFF, every staged door is fought). Same 16 door seeds, same spec,
  same staging.
- **Armed leg:** substrate + `LEADERPROJ=1`, nothing else. Same 16
  door seeds, same spec, same staging. The only difference between
  the legs is the projection gate.
- **Substrate flags (both legs):**
  `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1
  LAUNCHSURVIVE=1 ALLYSLOT3=1 PINQUAD=1 DMGPIN=1 DOORFLEE2=1
  HYPOFLOOR=1 HPGATE=1`. LEADERHPGATE unset on both legs (D5
  requires it null — the leader floor is NOT carried; the
  projection gate is the only difference).
- **Policy frozen:** `scripts/policies/competent.js` sha256
  `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
  (first 12: `1884c8852d38`) — verified live on this base at freeze
  time, identical to the three prior arms. **The staged driver runs
  NO day loop and does NOT execute the policy** (each door is one
  staged load + one door call); the policySha is stamped on the
  corpus as the substrate identifier so the reused analyzer's D5
  check still binds both legs to the same substrate. Stated
  plainly — the sha is an anchor, not a claim that competent.js ran.
- **Horizon:** none. One staged door per fresh load; no day loop,
  no death-aware horizon — there is no village to survive. Wall
  numbers that need a horizon (median survival, starvation) are
  NOT measurable on this instrument; see M5 and S6.
- **Driver env:** `LEG=control|armed
  EVIDENCE_DATE=2026-11-23 CORPUS_PREFIX=doorstage-b
  RUN=doorstage-b OUTDIR=perseed-doorstage-b-control` /
  `...-armed` (+ `LEADERPROJ=1` armed only). Corpus files
  `doorstage-b-s<seed>-doorstage-b-pinquaddoor.json` (the
  `-pinquaddoor` suffix is the panel builder's filename pattern —
  see M5). The driver refuses to overwrite, exit 3.
- **Determinism tripwire (frozen):** the 4 safe doors must fight
  BYTE-IDENTICALLY on the two legs (same door seed, gate does not
  fire, same RNG stream → outcome/rounds/mDealt/vTaken/log equal
  exactly). The driver verifies this per safe door at write time
  and the evidence reports it. Any mismatch = STOP and investigate
  (the staging drifted between legs); do not judge D1 against a
  drifted control. The pool doors have no such tripwire (the armed
  leg refuses them — there is no armed fight to compare), which is
  the point of the arm.
- **Corpus shape (frozen):** one file per staged door per leg,
  readable by `scripts/analyze-gateavoid-b.js` WITHOUT modification
  (the analyzer is reused verbatim): `seed` (door seed),
  `anchorCommit`, `policySha`, `pinquadFlag`/`dmgpinFlag`/
  `doorflee2Flag`/`hypofloorFlag`/`hpgateFlag` '1' (both legs),
  `leaderhpgateFlag` null (both legs), `leaderprojFlag` null
  (control) / '1' (armed), `hpgateFires`/`leaderhpgateFires`/
  `leaderprojFires` numbers (agency-state counters at end of the
  staged door), `gateAvoidNotes` array (parsed from the live
  expedition record, same regex as the pinquaddoor driver),
  `gateAvoidLog` array (the durable log, stamped verbatim from
  `st.gateAvoids`), `slotPresent` + `pinPresent` true,
  `v4encounters` (one row per fought door — the pinquaddoor row
  shape: day, vid, mid, wave, origin 'expedition', allyFromStart,
  pinned, pinnedAllies, allyVids, allyVid/ally2Vid/ally3Vid,
  ally3Dealt, rounds, outcome, mDealt, vTaken, fleeHpFrac,
  doorHold, everHopeless, leaderEntryHp, roundsDetail,
  flPreRoundDealt, mHpStartRec, log; empty when the door was
  refused), `instrumentErrors` (empty on a clean door),
  `doorSpec` (the staged door's spec row, frozen), `measuredArmorP`
  (per-member armor P), `deaths` (party members whose person
  record is dead after the door call but was alive before — the
  panel's villageDeaths input; see M5), `won` false, `scaleRank`
  null, `gameDays` (scholar.day at staging end), `endReason` null.
  The analyzer's D1 matches on seed+day+mid; the day is the
  staged game's scholar.day, identical on both legs for the same
  door seed (same load, same staging).

## Frozen bars (a miss is NO-GO, never re-scored)

Judged by `scripts/analyze-gateavoid-b.js` (reused VERBATIM —
no fork, no adaptation) over the two staged corpus dirs, plus the
proof battery below and the balanced-panel compare for M5.

**GO requires ALL of:**

- (M1) **Port gate:** `test-allyslot3-b.js` 18/18 on this tree.
- (M2) **Staged pin proof** (`scripts/test-pinquaddoor-b.js`):
  35/35 on this tree.
- (M2w) **Wide-instrument proof**
  (`scripts/test-pinquaddoor-wide-b.js` + analyzer selftest):
  16/16 on this tree.
- (M3) **Damage proof** (`scripts/test-dmgpin-b.js`): 29/29 on
  this tree.
- (M3d) **Staying proof** (`scripts/test-doorflee2-b.js`):
  49/49 on this tree.
- (M3e) **Downedtwice regression** (`scripts/test-downedtwice-b.js`):
  exit 0, **25/25**, on this tree.
- (M3f) **Floor proof** (`scripts/test-hypofloor-b.js`): 48/48
  on this tree.
- (M3g) **Whole-party gate proof** (`scripts/test-hpgate-b.js`):
  43/43 on this tree.
- (M3h) **Leader-gate proof** (`scripts/test-leaderhpgate-b.js`):
  50/50 on this tree.
- (M3i) **Projection-gate proof** (`scripts/test-leaderproj-b.js`):
  55/55 on this tree.
- (M3j) **Durable-log proof** (`scripts/test-gateavoid-b.js`):
  36/36 on this tree.
- (M3k) **Screen proof** (`scripts/test-gateavoid-screen-b.js`):
  11/11 on this tree.
- (M3l) **Staged-door proof** (`scripts/test-doorstage-b.js`,
  NEW): count recorded at build (the development run is the
  rehearsal; the post-freeze run is the judged one) — gate refuses
  a staged dead2 door (no fight, proj fire, log entry with the
  staged HP/projHp2), fights a staged safe door (door opens,
  allyFromStart, pinned trio), control/armed determinism on
  identical staged safe doors (outcome/rounds/mDealt/vTaken/log
  equal exactly), log-vs-notes attribution (the refused door is
  attributed from `gateAvoidLog`, keyed seed+day+mid, with the
  parsed notes as the cross-check), spec-table conformance (the
  driver's spec JSON matches this prereg's table door for door),
  driver smoke (one staged door per leg, exit 0, 0 instrument
  errors, corpus carries every D5 field), base gates re-run green
  (leaderproj 55/55, gateavoid 36/36).
- (Analyzer selftest) `analyze-gateavoid-b.js --selftest` 39/39
  on this tree.
- (M4) **Panel bars** (control vs armed +LEADERPROJ, same staged
  doors, same substrate) — D1–D6 carried VERBATIM from the
  gateavoid prereg; only the corpus population changes (staged
  doors instead of sim fought doors):
  - (D1) **Bad-outcome rate on the matched projection pool,
    PRIMARY (VERBATIM):** for each CONTROL fought door whose
    leader entered ≤ 75 HP (projHp2 ≤ 25), the armed leg's outcome
    on the SAME door (same seed + day + monster): GOOD = 'proj'
    avoid, vKill, or mFlee; BAD = vFlee, vDie, divergence (no
    armed row, no gate log entry), 'hold'/'lead' avoid, or any
    other armed outcome. Armed bad rate ≤ control bad rate − 20pp,
    where the control bad rate is the vFlee+vDie share of its own
    pool. If the control pool is empty, D1 is UNMEASURABLE and
    FAILS.
  - (D2) **Kill rate per FOUGHT door (per-door, NOT leg-total
    kills; VERBATIM):** armed vKill rate per fought door ≥ control
    rate − 2pp.
  - (D3) **Damage guard (VERBATIM):** armed TOTAL damage per
    door/fight ≥ 0.9× control (total dealt on fought doors divided
    by fought doors — NOT per-round).
  - (D4) **Mechanism engagement (VERBATIM):** armed
    `leaderprojFires` ≥ 1 — the lever must fire at least once to
    be judged a lever at all. (Expectation, not a bar: 12 — one
    per pool door.)
  - (D5) **Substrate sanity (VERBATIM + the log):** every corpus
    file carries `anchorCommit` equal to the frozen anchor (see
    "Anchor rule") and `policySha` `1884c8852d38` and
    `pinquadFlag` '1' AND `dmgpinFlag` '1' AND `doorflee2Flag`
    '1' AND `hypofloorFlag` '1' AND `hpgateFlag` '1' (BOTH legs)
    AND `leaderhpgateFlag` null (BOTH legs) AND `leaderprojFlag`
    null (control) / '1' (armed) AND `leaderprojFires` /
    `leaderhpgateFires` / `hpgateFires` as numbers AND
    `gateAvoidNotes` / `gateAvoidLog` as arrays AND `slotPresent`
    + `pinPresent` true.
  - (D6) **Durability (VERBATIM):** per leg, the durable log is
    COMPLETE — `gateAvoidLog` length equals the total gate fires
    (`hpgateFires + leaderhpgateFires + leaderprojFires`) AND the
    per-kind log counts equal the per-kind counters, with no entry
    of unknown kind. A D6 miss means the log itself is broken and
    the re-judge cannot be trusted — verdict NO-GO kind
    METRIC-BROKEN regardless of D1.
  - **SUPPLY rule (frozen, adapted):** if the CONTROL leg yields
    ZERO fought doors, D2/D3 are unmeasurable and the verdict is
    NO-GO kind SUPPLY-THIN, not a lever failure. (An empty D1 pool
    with fought doors present is NOT supply-thin — it is judged
    under D1 as above.)
- (M5) **Guardrail — no regression (ADAPTED for the staged
  instrument):** the balanced-panel compare
  (`scripts/build-pinquaddoor-b-panels.js` reused verbatim +
  `node scripts/balance-panel.js compare`) returns
  `review_required` with NO `regression_signal` on village deaths
  (per-door party deaths — the only death population the staged
  instrument observes). **Starvation and median survival are NOT
  measurable on staged corpora** (no day loop, no pantry, no
  village to starve or survive) — they are reported as
  not-measurable, never faked. The panel builder's `options.days`
  reads 150 (its fixed label); the staged rows carry their real
  `gameDays` (~1) and the compared metrics are per-row, so the
  label does not enter the decision — the scorecard requires the
  two panels' options to match, and both are built by the same
  builder. A `regression_signal` on village deaths is NO-GO.
- (M6) **Deliverable:** evidence file with the frozen-bar table,
  the staged-door table, the door-fight table (every fought door,
  both legs), the matched-pool table, wall numbers as measurable
  on staged corpora (with plain statements where a wall number is
  not measurable), a sense-test transcript read (at least one
  refused door quoted from its durable log entry and one fought
  door quoted blow-by-blow), the diag table, the balanced-panel
  compare output attached, and a metric-review section; corpora
  under `evidence/2026-11-23/perseed-doorstage-b-control/` and
  `...-armed/`; analysis JSON (analyzer --json over both corpus
  dirs).

A miss on any of M1–M5 is NO-GO, never re-scored against a friendlier
metric. If the metric proves wrong, write it under "metric review" and
propose the revision for the NEXT run. A NO-GO is classified per §14a
(CONCEPT-DEAD / METRIC-BROKEN / SUBSTRATE-MISSING / SUPPLY-THIN) in
the evidence file's verdict section.

## Secondary (REPORTED, not binding — do not re-score the primaries)

Carried from the gateavoid prereg, adapted to staged doors:

- (S1) Hold census: `doorHold` rounds per leg, fights with a hold,
  `everHopeless` fights per leg.
- (S2) **Conversion census:** matched-seed door pairs (same seed +
  day + monster): control vFlee → armed vKill (conversion), control
  vFlee → armed vFlee at a later round (later-flee), control vFlee
  → armed identical (no-change), control door with NO armed
  counterpart (avoided — reported with its S9 attribution).
- (S3) Leader-death census: `vDie` doors per leg + the leader HP at
  death.
- (S4) Pin-subset B1 rate — RATE ONLY, no ≥3-row floor.
- (S5) Door-fight table: every fought door — seed, day, monster,
  rounds, dealt, entry HP, outcome, D/round, fleeHpFrac, doorHold
  rounds, party HP at flee time, leader entry HP, projection band.
- (S6) Wall numbers — ADAPTED: wins / national / table / wave-4–5
  unlocks / median survival are NOT measurable on staged corpora
  (no day loop, no standing, no table — a staged door never plays
  to a win). Report each as not-measurable with the reason. The
  per-door wall analogue is the pool table itself (12 staged pool
  doors, their control outcomes, their armed avoids).
- (S7) Sub-floor census: fought doors where the LEADER entered below
  25 HP (expect 0 — no dead1 doors are staged) + fought doors where
  ANY party member entered below 25 HP as read from the gate-avoid
  log.
- (S8) Gate-fire census: `hpgateFires` + `leaderhpgateFires` +
  `leaderprojFires` summed per leg, plus the gate-avoid notes AND
  the durable log (S8c). The log-vs-notes gap is reported as the
  measured size of the old blind channel.
- (S9) Avoided-doors census: control doors with no armed counterpart
  row, ATTRIBUTED via the armed leg's durable log.
- (S10) Leader-projection census: per fought door, the leader's
  projection band and projected HP after one/two rounds; per fired
  door (log entry), the fired member's projection.
- (S11) D1fought (reported secondary): flee rate on fought
  projection-pool doors per leg — expected unmeasurable on the armed
  leg when the gate works (it refuses every pool door).

## Base + substrate (verified, not assumed)

- Base: master `7ade8d3bf4a53f251845af1d5e0d079fd7f3fd0a` at arm
  start (worktree HEAD; the 0230Z adoption closeout). The LEADERPROJ
  lever, the GATEAVOID durable log, PINQUAD, DMGPIN, DOORFLEE2,
  HYPOFLOOR, HPGATE are all ON this base (landed on master; zero
  `src/` changes in this arm). No port from any held branch was
  needed; the held branches are NOT merged, NOT modified, NOT
  rebased.
- **Policy frozen:** `scripts/policies/competent.js` sha256
  `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
  (first 12: `1884c8852d38`) — verified live on this base at freeze
  time (sha256sum). The staged driver does not execute the policy;
  see "Design".
- Substrate flags (both legs):
  `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1
  LAUNCHSURVIVE=1 ALLYSLOT3=1 PINQUAD=1 DMGPIN=1 DOORFLEE2=1
  HYPOFLOOR=1 HPGATE=1`. Armed leg adds `LEADERPROJ=1` only.

## Anchor rule (the poolfirstfail lesson, frozen — adapted for the prereg commit)

- This arm's task brief directs the prereg to be COMMITTED before
  the judged legs run. The commit that adds this prereg (+ the spec
  JSON) therefore becomes the legs' anchor: the driver stamps
  `anchorCommit` as `git rev-parse HEAD` at load time, and HEAD at
  leg time MUST be that prereg commit (it adds only this file + the
  spec JSON — zero code changes vs the frozen base
  `7ade8d3bf4a53f251845af1d5e0d079fd7f3fd0a`). The evidence records
  the prereg commit's full sha and verifies `anchorCommit` on EVERY
  corpus file against it; a mismatch voids that leg.
- **Nothing else is committed before the judged legs run** — the
  instrument (driver + proof test) stays uncommitted during the
  legs; its content is frozen by sha, recorded in the evidence.
  The final commit (instrument + corpora + panel + evidence)
  happens only AFTER the legs + evidence are written.
- **If anything is committed before the judged legs besides the
  prereg + spec, the legs must be re-run after a dated prereg
  CORRECTION** — never amend the expected anchor post-hoc.

## Instrument (the gateavoid analyzer reused verbatim; the driver is new)

- Driver: `scripts/doorstage-driver-b.js` — NEW. One staged door
  per fresh load (the `stageMeeting` pattern from
  `test-leaderproj-b.js` / `test-gateavoid-b.js`, extended to a
  16-door spec read from `doorstage-b-spec.json`): pickQuad +
  gearUp + startExpedition ×4 + pinQuadParty + staged leader HP +
  single-monster pool override + `expeditionMonster` loop (max 30
  calls to a fight or a gate fire). Corpus stamp: the pinquaddoor
  driver's stamp shape (flags, counters, gateAvoidNotes regex,
  gateAvoidLog verbatim, slot/pin presence, policySha, anchor) +
  the staged fields (`doorSpec`, `measuredArmorP`, `deaths`, `won`
  false, `scaleRank` null, `gameDays`, `endReason` null). The
  fieldFight wrap builds the v4encounters row in the pinquaddoor
  row shape (origin 'expedition', pinned, allyFromStart from the
  opts). Refuses to overwrite, exit 3. `writeRobust` for the flap.
- Analyzer: `scripts/analyze-gateavoid-b.js` — REUSED VERBATIM
  (D1 matched-pool + S9 attribution from the durable log + D6
  durability + S8c log census, selftest 39/39). No fork, no
  adaptation: the staged corpora are shaped to its contract.
- Proof tests: `scripts/test-allyslot3-b.js` (M1),
  `scripts/test-pinquaddoor-b.js` (M2),
  `scripts/test-pinquaddoor-wide-b.js` (M2w),
  `scripts/test-dmgpin-b.js` (M3),
  `scripts/test-doorflee2-b.js` (M3d),
  `scripts/test-downedtwice-b.js` (M3e),
  `scripts/test-hypofloor-b.js` (M3f),
  `scripts/test-hpgate-b.js` (M3g),
  `scripts/test-leaderhpgate-b.js` (M3h),
  `scripts/test-leaderproj-b.js` (M3i),
  `scripts/test-gateavoid-b.js` (M3j),
  `scripts/test-gateavoid-screen-b.js` (M3k) — on master already,
  run verbatim;
  `scripts/test-doorstage-b.js` (M3l, NEW — see "Frozen bars").
- Panel: `scripts/build-pinquaddoor-b-panels.js` — REUSED VERBATIM
  (`RUN=doorstage-b CORPUS_PREFIX=doorstage-b node
  scripts/build-pinquaddoor-b-panels.js --out
  evidence/2026-11-23/doorstage-b-panel --before
  evidence/2026-11-23/perseed-doorstage-b-control --after
  evidence/2026-11-23/perseed-doorstage-b-armed --seeds
  <16 door seeds> --before-seeds <same>`) +
  `node scripts/balance-panel.js compare`; the compare `.md` is
  attached to the evidence file. Corpus filenames follow the
  builder's pattern (`doorstage-b-s<seed>-doorstage-b-pinquaddoor.json`).

## Proofs (to run after freezing, before judged legs, on this tree)

- M1 `test-allyslot3-b.js` **18/18** (target).
- M2 `test-pinquaddoor-b.js` **35/35** (target).
- M2w `test-pinquaddoor-wide-b.js` **16/16** (target).
- M3 `test-dmgpin-b.js` **29/29** (target).
- M3d `test-doorflee2-b.js` **49/49** (target).
- M3e `test-downedtwice-b.js` **exit 0, 25/25** (target).
- M3f `test-hypofloor-b.js` **48/48** (target).
- M3g `test-hpgate-b.js` **43/43** (target).
- M3h `test-leaderhpgate-b.js` **50/50** (target).
- M3i `test-leaderproj-b.js` **55/55** (target).
- M3j `test-gateavoid-b.js` **36/36** (target).
- M3k `test-gateavoid-screen-b.js` **11/11** (target).
- M3l `test-doorstage-b.js` (target: count recorded at build;
  the post-freeze run is the judged one).
- Analyzer selftest `analyze-gateavoid-b.js --selftest` (target:
  39/39 green).

## Expectation (not a bar)

Control should fight all 16 staged doors (12 pool + 4 safe). Armed
should refuse all 12 pool doors (12 'proj' fires, 12 log entries)
and fight the 4 safe doors identically to control (the tripwire).
D1 arithmetic on 12 pool doors: GO needs controlBad − armedBad ≥ 3
(20% of 12 = 2.4 → 3 doors). The three prior arms' fought pool
doors ran 2 bad of 6 (33% — reunion 61 vDie, reunion 62 vDie, the
rest vKill); the staged pool stages leaders lower on average
(dead2 30–50), so control bad 3–4 is the honest expectation, not a
promise. **If control bad lands at 0–2, D1 is unpassable even with
a perfect gate** — the verdict is then NO-GO kind METRIC-BROKEN
(the same shape as gateavoid-b: the bar presumes bad outcomes to
reduce), and the evidence must say so rather than re-scoring. D2/D3
compare different door mixes (armed fights only safe doors) — the
metric review must note the composition effect. If the armed leg's
`leaderprojFires` is 0, STOP: the gate's condition never met a
staged door, and the verdict must be re-derived from the mechanism,
not from the frozen expectation. If the control leg yields 0 fought
doors, the verdict is NO-GO kind SUPPLY-THIN per the frozen rule.

## Legs log + evidence discipline

- Legs tee to `evidence/2026-11-23/doorstage-b-legs.log` (one JSON
  line per staged door + EXIT lines; fallback recovery).
- Evidence: `evidence/2026-11-23/sim-doorstage-b.md` (verdict,
  frozen-bar table, staged-door table, door-fight table with flee
  rounds + party state + doorHold + conversions + gate fires +
  leader entry HP + projection band, matched-pool table, wall
  numbers as measurable, sense-test transcript read, metric
  review) + `doorstage-b-panel.md` + panel JSONs + analysis JSON
  (analyzer --json over each corpus dir).
- `check.js --quick`: NOT run by this arm (zero `src/` changes;
  the gate is already on master and the prior arms' gates cover
  it). The proof battery above is the gate for this arm.
- Write flap: intermittent EPERM on fresh-file writes is active
  this week (windows Nov 19–21, brief blips + long blocks, all
  clearing on their own, nothing lost). Probes run before writes
  that matter; the driver uses write-robust paths; a blocked final
  commit leaves files on disk intact for coordinator adoption,
  never forced. Never remove an index.lock on a ps grep alone.
- Git slowness: index-touching git commands can run minutes under
  hot-tree load. Prefer commit-to-commit reads (`git show` /
  `git diff <commit> <commit>`) and `git grep`, which stay fast.
- VM replacement: if a process dies or the machine restarts under
  this run, re-establish state from disk and report it — do not
  redo finished work silently.

## Metric review (adopted from gateavoid-b §8 — this run is judged as frozen)

- **D1 is carried verbatim; only the population changes.** The
  staged pool replaces the sim-supplied pool. The −20pp bar is
  unchanged, and the 12-door arithmetic (needs controlBad −
  armedBad ≥ 3) is stated above, not hidden.
- **Divergence stays BAD by design** — but on staged doors it
  should not bite: each door is its own fresh load, so the armed
  leg cannot diverge away from a pool door by trajectory drift.
  The only way a pool door scores divergence is if the armed
  leg's staged call fails to reach the gate at all (staging
  failure) — which the driver reports as an instrument error, not
  a D1 score. If divergence appears anyway, it returns in this
  arm's metric review for the NEXT run.
- **D4's bar (≥ 1 fire) is still weak as written** — D6 pairs it
  with the durability check, so a blind gate cannot pass D4+D6
  together. On this arm the expectation is 12 fires; a 1-fire D4
  on a 12-door pool would be thin evidence and must be said so.
- **D2/D3 compare different door mixes** (armed fights only safe
  doors; control fights pool + safe). A D2/D3 pass on this arm
  prices the safe doors, not the pool — the pool's price is D1
  alone. Do not over-read D2/D3 here.
- **The panel's villageDeaths is per-door party deaths** (see M5):
  the guardrail prices whether the gate kills more villagers per
  staged door, not 150d village survival. Starvation and median
  survival are not measurable on this instrument.
- **D1fought stays a reported secondary** — expected unmeasurable
  on the armed leg when the gate works (it refuses every pool
  door).

## Files

- Prereg: `evidence/2026-11-23/sim-doorstage-b-prereg.md` (this file)
- Spec: `evidence/2026-11-23/doorstage-b-spec.json` (the frozen
  16-door table, machine-readable)
- Instrument: `scripts/doorstage-driver-b.js` (NEW),
  `scripts/test-doorstage-b.js` (NEW, M3l),
  `scripts/analyze-gateavoid-b.js` (reused verbatim),
  `scripts/build-pinquaddoor-b-panels.js` (reused verbatim)
- Corpora (fresh, judged): `evidence/2026-11-23/perseed-doorstage-b-control/`
  (16 files) + `evidence/2026-11-23/perseed-doorstage-b-armed/`
  (16 files)
- Analysis: `evidence/2026-11-23/doorstage-b-analysis.json`
  (analyzer --json over both corpus dirs) + `doorstage-b-panel.md`
  + panel JSONs
- Evidence: `evidence/2026-11-23/sim-doorstage-b.md`
- Leg log: `evidence/2026-11-23/doorstage-b-legs.log`
- `src/` diff: NONE. No default flip.
