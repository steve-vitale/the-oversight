# sim-leaderproj-b — FROZEN prereg (Loop B run fleshout-loop-b-20261122T1630Z)

**Frozen:** 2026-11-22 ~16:55 UTC, BEFORE any judged sim. Base master
`1c11dbb14` (full `1c11dbb149a660b7946aaefb2e95c29c14bf5548`,
"journey-establishment r268: PLANWAKE fresh band GO, LAUNCHVOICE speaks,
day-desync answered, STRANDED-CLOSE menu fix [needs-eyes]"). Branch
`sim-leaderproj-b`, worktree `~/workspace/worktrees/sim-leaderproj-b`.
Run `fleshout-loop-b-20261122T1630Z`, arm `sim-leaderproj-b` (the
LEADER-PROJECTION GATE: the named next lever from the leaderhpgate
NO-GO, finding #2619 kill conversion).

## The question (finding #2619, next step after the leaderhpgate NO-GO)

The leaderhpgate pilot proved the leader-HP floor mechanically live
but subsumed: its condition is a strict subset of HPGATE's on the
same leg, so it never fired once and both legs were
trajectory-identical. Verdict NO-GO kind CONCEPT-DEAD (subsumed).
Its §9 names the next arm verbatim: "the leader-PROJECTION gate.
Refuse a wave-4+ door when the leader is projected at or below the
floor within 2 rounds of focused wave-4 damage (~25 HP/round), not
when they are already below it. S10 says it would have touched 4 of
the 6 fought doors (dead2 1 + collapse2 3) — including the d108
leader death, where Petra entered at 64 HP and died in round 7 with
the monster at 44 HP, and the d147 flee, where Vitalina entered at
51 HP and fled at 16." This arm builds that gate, priced door by
door — with a redesigned primary, because a working door-avoiding
gate leaves no armed fought door in its pool to price (see "The D1
redesign" below).

## The mechanism (read from the sources, not taken on trust)

Door parties form at the door-open decision in
`src/js/villager-agency.js` `expeditionMonster`: the pinned trio
(`pinnedQuadAllies`, written at launch by `pinQuadParty` in the
same file) is matched against the sensed allies, and only a FULL
pinned trio opens the door (`_pinDoor`, allyFromStart). The
whole-party gate (HPGATE, landed on master) sits in the same
function, after the `_pinDoor` computation and before
`fieldFight`: it refuses a wave-4+ door when ANY of the four
(leader + pinned trio) is below 25 HP, read live at the door, and
the party gives the monster room (the existing avoid verb —
encounter note + return, no fight, no flee, no death). The leader
gate (LEADERHPGATE, landed on master, subsumed) sits after it
with the same terms for the leader only. The projection gate sits
in the same place, after the LEADERHPGATE block, with the same
terms except the coverage: the LEADER's HP projected two rounds
forward at 25 HP/round.

## THE D1 REDESIGN — read this before the bars (pre-registered, not discovered after)

The leaderhpgate arm priced D1 as a flee rate over FOUGHT doors
in the gate's pool on both legs. For a floor gate that pool is
empty by subsumption; for a PROJECTION gate the pool has the
opposite problem: a working projection gate refuses every
projected-collapse door, so the ARMED leg never fights one — the
armed fought-door pool is empty BY CONSTRUCTION whenever the gate
works, and a flee rate over armed fought doors is unmeasurable
exactly when the lever succeeds. Pricing D1 that way would fail
the lever for working. So D1 is redesigned for this arm:

- **The pool is the CONTROL leg's.** Every control fought door
  whose leader entered projected at-or-below the floor
  (`leaderEntryHp` ≤ 75, i.e. projHp2 ≤ 25 — bands dead1/dead2/
  collapse2) is one pool door.
- **The armed leg is scored on the SAME door** (same seed + day +
  monster). GOOD: the projection gate avoided it (a 'proj'
  gate-avoid note on the same seed + monster), the armed party
  killed the monster, or the monster fled. BAD: the armed party
  fled or died, the door diverged away with no gate note, or
  ANOTHER gate ('hold'/'lead') avoided it — not this gate's
  credit, counted bad conservatively. An 'other' armed outcome
  is also bad.
- **D1 GO:** armed bad rate ≤ control bad rate − 20pp, where the
  control bad rate is the vFlee+vDie share of its own pool.
  The pool must be non-empty; an empty control pool is
  UNMEASURABLE and FAILS (the gate has nothing to price).
- The leaderhpgate-style flee rate over fought pool doors
  survives only as a REPORTED secondary (D1fought): it is
  expected to be unmeasurable on the armed leg when the gate
  works, and is never re-scored.

Worked example from the prior band (not a bar): control pool 4
doors (d106 vFlee, d108 vDie, d112 vKill, d147 vFlee) → control
bad rate 3/4 = 75%. A perfect projection gate avoids all four →
armed bad rate 0/4 → 75pp drop → D1 GO.

## The projection (derived from the evidence, not guessed)

**Refuse when the leader's projected HP after two rounds of
focused wave-4 damage is at or below the 25-HP floor:
`leaderHp − 50 ≤ 25`, i.e. leader HP ≤ 75, read live at the door.**

- **25 HP/round = the top of the hypofloor §4 range** (the d110
  monster hits 22–25 a round, all on the leader). The projection
  uses the top — the conservative read for "the leader is about
  to die". MONSTER-WAVES.md wave-4 bands: damage 35–95, HP
  850–1500, "a 4-6 round fight".
- **Boundary:** leader at 75 HP refuses (projected exactly 25
  HP — at the floor); leader at 76 HP proceeds (projected 26).
  The "at or below" reading is the prereg's: S10's collapse2 band
  is 51–75, "projected at-or-below the floor after two rounds",
  and 75 sits in it.
- **Coverage (leader-only, NOT whole party):** the sense test's
  mechanism is the leader collapsing under focused damage. A hurt
  ally the monster never touches does not cause the flee, and the
  projection gate refusing on an ally's HP would be the hpgate
  trigger again. The proof test §1b stages exactly this: leader
  100, ally3 3 HP, the door OPENS.
- **The forecast is a forecast, not a fact.** The monster may not
  focus the leader, and the quad may kill first — the d112 eulogy
  door (leader 75, collapse2, vKill R7) is a pool door the gate
  would refuse that the village won. D1 prices the refusal's
  effect (fewer flees/deaths per pool door), not whether the
  forecast is exact; D2/D3 guard against refusing winnable doors
  (kill rate and damage per fought door must not fall).
- **The edge cases stay, and are counted.** The 25-HP leader
  (doorflee2-b 106830 d98 influencer, fled R1) and the 26-HP
  leader (106820 d46 eater, died the next day) sit in the dead1/
  dead2 bands and are refused by this gate too (projected −25 /
  −24). That is the design: the projection gate's pool INCLUDES
  the floor gates' pool.

## The lever (LEADERPROJ) — built, env-gated OFF by default

In `src/js/villager-agency.js` `expeditionMonster` (+45/−0, one
file), after the LEADERHPGATE block and before `fieldFight`:

- **Gate (computed once, at the door):** `LEADERPROJ=1` in env
  AND `_pinDoor` true (full pinned trio, allyFromStart) AND wave
  ≥ 4 AND the leader's live HP projected two rounds forward at
  25/round is ≤ 25 (`_lpHp − 50 ≤ 25`, i.e. `_lpHp ≤ 75`) in
  `state.village.health` (missing entry defaults 100, the
  established default). In the browser `process` is undefined, so
  the flag is never on there.
- **Action (the avoid verb):** the agency-state counter
  `st.leaderprojFires` increments (the driver census), an
  encounter note is pushed ("gave <mid> room — <Name> is too
  hurt to lead a door (projected <hp> HP, <proj> HP in two
  rounds)", mirroring the leader gate's note shape with the
  "projected" marker so the driver can tell the gates apart),
  and the function returns — no fight, no flee, no death. The
  monster meeting is consumed; the expedition continues; a later
  door meeting re-checks live HP. The gate fires regardless of
  the win-plan seek flag: HP is a hard floor, not a preference.
- **Considered and NOT built:** (a) launch-time gating — cannot
  catch the evidence (members are hurt en route / in earlier
  doors the same day); (b) swapping a below-projection leader for
  a healthy villager — no replacement pool exists at door time
  (the pin IS the commitment); (c) fighting on as a regular
  (unpinned) fight when the gate refuses — that would spend the
  same flee/death uncounted, denominator surgery, not a fix;
  (d) a one-round projection (leader − 25 ≤ 25, i.e. ≤ 50) — the
  dead2 band only; the evidence's doors sit in collapse2 (64,
  75, 51), so a one-round gate would miss the d108 death and the
  d112/d147 doors; the two-round gate is the named mechanism.
- **Untouched:** the HPGATE whole-party gate, the LEADERHPGATE
  leader floor, learn-first withdrawal, death, the 5% winning
  floor, signature exits, sealed arenas, solo/non-door/shout-
  ladder fights, the DOORFLEE2 hold, the HYPOFLOOR pool floor,
  and every fight with the flag off (no RNG is drawn — verified
  by the proof test's §0 source check + §5 healthy-identity
  check; off-mode is byte-identical: the healthy door fight is
  identical with the flag on vs off).
- **Scope decision (recorded, not assumed):** the gate is
  door-scoped on the pinned-door terms, not global. A hurt
  leader may still fight a wave-1/2/3 monster or a non-door
  wave-4 meeting; this arm's question is the door kill
  conversion and its bars are door-priced. Widening the scope is
  a later arm's call, with its own bars.

Canon grounding: MONSTER-WAVES.md wave-4 bands (HP 850–1500,
damage 35–95, pierce 0.2–0.5; "a 4-6 round fight for a godhood
build (~220 dmg/round)"). No canon doc prices a morale read, a
hypothetical-HP floor, a commitment hold, or an HP gate — the
gate is a sim lever to test whether taking a leader projected to
collapse to doors is the binding constraint, judged door by
door; landing it as a game change would still be a Steve/design
call, not this arm's. The lever stays env-gated / default-OFF
exactly as built — NO default flip in this arm.

## Design — paired pilot on a fresh band

**Band (FRESH):** 107391, 107392, 107393, 107394, 107395, 107396,
107397, 107398. Both legs are FRESH runs on this arm's tree.

**Seed-band freshness check (recorded at freeze, per
`~/workspace/custom-skills/local_seed_band_freshness/SKILL.md`):**
git grep over ALL `evidence/*/sim-*-prereg.md` for each of the 8
seeds — ZERO hits for every seed. Git grep over ALL
`evidence/**/sim-*.md` for each seed — ZERO hits for every seed.
The coordinator's pre-check (107391–107420 with zero mentions)
is corroborated by this re-verification. Band is FRESH; no
collision, no correction needed.

**Band screening (the §14b pool-sizing probe — recorded, not hidden):**
the control config is probed on this band BEFORE freezing, to
check door supply (D1 needs control pool doors; D2/D3 need
fought doors).
**Probe (FULL — 8/8 seeds, filled 2026-11-22 ~21:05Z and completed ~21:08Z by the 1630Z adoption from the frozen analyzer):**
control config on 107391–107395, 0 instrument errors, anchor
`1c11dbb14`, policySha `1884c8852d38`. Fought doors: 3 (vKill 2,
vDie 1, vFlee 0, mFlee 0). D1 matched projection pool (control,
leader ≤ 75 HP): **2 doors, bad 1/2 = 50%** — 107391 d65 reunion
vKill (leader 86, not in pool), 107391 d98 reunion vDie (leader
61, projHp2 11, BAD), 107394 d113 rerun vKill (leader 38,
projHp2 −12, GOOD). D1fought 2/2. S10: dead1 0, dead2 1,
collapse2 1, safe 1, unknown 0. D2 kill rate 2/3 = 0.667; D3
dmg/door 1157.3; D4 leaderprojFires 0 (control config — the gate
is off, expected). The pool is THIN (2 doors / 5 seeds) — the
pilot's D1 will be decided by a handful of doors, and the
empty-pool = UNMEASURABLE rule looms. The earlier hand-joined
"8 pool doors, 7 bad (87.5%)" table is WRONG (joined
v4encounters without the analyzer's isDoorFight + rounds≥1
filter) — the analyzer's numbers above govern. Seeds
107396–107398 added NO fought doors (v4encounters 1/20/32,
pinFights 0 each) — the full-band pool is still the same 2
doors. The judged control leg MUST reproduce this door table
(tripwire).

**Probe determinism tripwire:** the probe runs the control
config on this band (8 seeds, 0 instrument errors, anchor
`1c11dbb14`, policySha `1884c8852d38`). The judged control leg
re-runs the same seeds under the same config and MUST reproduce
the probe's door table — the sims are seeded and deterministic.
If the judged control differs from the probe, STOP and
investigate (the code moved under the run); do not judge the
armed leg against a drifted control.

- **Control leg:** substrate + `DOORFLEE2=1 HYPOFLOOR=1 HPGATE=1`
  (the hpgate ARMED configuration, re-run fresh on current
  master). The leader floor (LEADERHPGATE) is NOT carried on
  either leg — it never fires alongside HPGATE (subsumed), and
  carrying it would only add a dead flag to the substrate.
- **Armed leg:** control flags + `LEADERPROJ=1`, nothing else.
  Same seeds, same policy, same horizon. The only difference
  between the legs is the projection gate.
- **Substrate flags (both legs):**
  `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1
  LAUNCHSURVIVE=1 ALLYSLOT3=1 PINQUAD=1 DMGPIN=1 DOORFLEE2=1 HYPOFLOOR=1
  HPGATE=1`.
- **Policy frozen:** `scripts/policies/competent.js` sha256
  `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
  (first 12: `1884c8852d38`) — verified live on this base at
  freeze time.
  IDENTICAL to the dmgpin/doorflee/doorflee2/hypofloor/hpgate/
  leaderhpgate bands.
- **Horizon:** 150d, death-aware (dead villages stop, +10d tail
  max). Same horizon as every prior band in this program.
- **Legs chunked at 4 seeds per call** (a 16-seed single call was
  SIGTERMed before; per-seed files persist across kills; resume,
  never re-run completed seeds. The driver refuses to overwrite,
  exit 3).
- **Driver env:** `EVIDENCE_DATE=2026-11-22
  CORPUS_PREFIX=leaderproj-b RUN=leaderproj-b
  OUTDIR=perseed-leaderproj-b-control` / `...-armed` (+
  `LEADERPROJ=1` armed only). Corpus files
  `leaderproj-b-s<seed>-leaderproj-b-pinquaddoor.json`.
- **Confirm rule:** a 12–16-seed confirm runs ONLY if this pilot
  GOes on every bar. A pilot NO-GO spends no confirm seeds.
- **Master movement:** if master moves after the legs start, this
  arm does NOT rebase mid-run — the anchor is frozen at
  `1c11dbb14` and the legs judge on it; the coordinator merges
  afterward.

## Frozen bars (a miss is NO-GO, never re-scored)

The panel census of wave-4+ encounters (`v4encounters` rows) on
both legs, through the leaderproj analyzer
(`scripts/analyze-leaderproj-b.js`, selftest green 30/30; the
door definition and freshness judges are reused from
`scripts/analyze-pinquaddoor-b.js` unchanged), plus a node
one-liner over the raw corpora for the door table (the dmgpin
method). The analyzer is the leaderhpgate analyzer with D1
redesigned (matched-pool bad-outcome rate — see "The D1
redesign" above), D4 repointed at `leaderprojFires`, D5 now
requiring `leaderhpgateFlag` null on BOTH legs, and the
gate-notes/avoided-doors censuses extended with the 'proj' kind;
the projection census (S10) is unchanged.

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
  49/49 on this tree (the hold this arm combines with).
- (M3e) **Downedtwice regression** (`scripts/test-downedtwice-b.js`):
  exit 0, **25/25**, on this tree.
- (M3f) **Floor proof** (`scripts/test-hypofloor-b.js`): 48/48
  on this tree.
- (M3g) **Whole-party gate proof** (`scripts/test-hpgate-b.js`):
  43/43 on this tree (the gate this arm combines with).
- (M3h) **Leader-gate proof** (`scripts/test-leaderhpgate-b.js`):
  50/50 on this tree (the gate this arm sits after).
- (M3i) **Projection-gate proof** (`scripts/test-leaderproj-b.js`,
  NEW): 55/55 on this tree — projected leader (64 HP, proj 14)
  refuses the door in isolation (HPGATE + LEADERHPGATE unset:
  no fieldFight, counter 1, narrated note with the projection);
  hurt ally (3 HP) does NOT trigger it (door opens, counter 0
  — leader-only coverage); boundary 75 refuses / 76 proceeds;
  healthy door opens; inert without the pin, at wave 1, and
  with the flag off (healthy fight identical on vs off);
  PLACEMENT staged (§6: with HPGATE=1 the whole-party gate
  fires first on a 21-HP leader, leaderprojFires 0; with
  HPGATE=1 a 64-HP leader reaches the projection gate and it
  fires, leaderprojFires 1, hpgateFires 0; with LEADERHPGATE=1
  and HPGATE unset the leader gate fires first on a 21-HP
  leader); driver smoke green.
- (M4) **Panel bars** (control pin+damage+hold+floor+whole-party
  gate vs armed +LEADERPROJ, same seeds, same policy):
  - (D1) **Bad-outcome rate on the matched projection pool,
    PRIMARY:** for each CONTROL fought door whose leader entered
    ≤ 75 HP (projHp2 ≤ 25), the armed leg's outcome on the SAME
    door (same seed + day + monster): GOOD = 'proj' avoid, vKill,
    or mFlee; BAD = vFlee, vDie, divergence (no armed row, no
    gate note), 'hold'/'lead' avoid, or any other armed outcome.
    Armed bad rate ≤ control bad rate − 20pp, where the control
    bad rate is the vFlee+vDie share of its own pool. If the
    control pool is empty, D1 is UNMEASURABLE and FAILS.
  - (D2) **Kill rate per FOUGHT door (per-door, NOT leg-total
    kills):** armed vKill rate per fought door ≥ control rate −
    2pp. A RATE — the armed leg may fight fewer doors because it
    avoided some; leg-total kills are NOT the judge.
  - (D3) **Damage guard (repriced, carried):** armed TOTAL
    damage per door/fight ≥ 0.9× control (total dealt on fought
    doors divided by fought doors — NOT per-round).
  - (D4) **Mechanism engagement:** armed `leaderprojFires` ≥
    1 — the lever must fire at least once to be judged a lever
    at all. Pre-registered expectation: ≥ 1 (the prior band's
    S10 says the pool exists).
  - (D5) **Substrate sanity:** every control corpus file carries
    `leaderprojFlag` null AND `leaderhpgateFlag` null AND
    `hpgateFlag` '1' AND `hypofloorFlag` '1' AND `doorflee2Flag`
    '1' AND `dmgpinFlag` '1' AND `pinquadFlag` '1'; every armed
    file carries `leaderprojFlag` '1' AND `leaderhpgateFlag`
    null AND `hpgateFlag` '1' AND `hypofloorFlag` '1' AND
    `doorflee2Flag` '1' AND `dmgpinFlag` '1' AND `pinquadFlag`
    '1'; every corpus file carries `leaderprojFires` as a number
    AND `hpgateFires` as a number AND `leaderhpgateFires` as a
    number AND `gateAvoidNotes` as an array AND `anchorCommit`
    equal to the frozen base (§"Anchor rule") and `policySha`
    `1884c8852d38`.
  - **SUPPLY rule (frozen):** if the CONTROL leg yields ZERO
    fought doors, D2/D3 are unmeasurable and the verdict is
    NO-GO kind SUPPLY-THIN, not a lever failure. (An empty D1
    pool with fought doors present is NOT supply-thin — it is
    judged under D1 as above. The distinction is frozen here so
    the two empties are never confused.)
- (M5) **Guardrail — no regression:** the balanced-panel compare
  returns `review_required` with NO `regression_signal` on
  village deaths / deaths-per-100d. **AND the scalemetric
  deciding cost bar (binding for future scale arms,
  convergence-tracker.md):** GO requires starvation ≤ control+2
  on totals AND arm-only deaths AND median survival ≥ 0.8×
  control median; death counts diagnostic only. A breach of
  either half is NO-GO.
- (M6) **Deliverable:** evidence file with the frozen-bar table,
  the door-fight table (every fought door, both legs, with flee
  round + party state at flee time + doorHold rounds +
  conversions + gate fires + leader entry HP + projection band),
  the matched-pool table (every control pool door with its armed
  outcome), wall numbers, a sense-test transcript read (at least
  two fought doors quoted blow-by-blow — if a gate avoid
  happens, quote the avoided meeting's persisted note and the
  nearest fought door), the diag table (§1 of the doorflee
  evidence), the balanced-panel compare output attached, and a
  metric-review section; corpora under
  `evidence/2026-11-22/perseed-leaderproj-b-control/` and
  `...-armed/`.

A miss on any of M1–M5 is NO-GO, never re-scored against a
friendlier metric. If the metric proves wrong, write it under
"metric review" and propose the revision for the NEXT run. A
NO-GO is classified per §14a (CONCEPT-DEAD / METRIC-BROKEN /
SUBSTRATE-MISSING) in the evidence file's verdict section.

## Secondary (REPORTED, not binding — do not re-score the primaries)

- (S1) Hold census: `doorHold` rounds per leg, fights with a hold,
  `everHopeless` fights per leg.
- (S2) **Conversion census (the effect metric):** matched-seed
  door pairs (same seed + day + monster): control vFlee →
  armed vKill (conversion), control vFlee → armed vFlee at a
  later round (later-flee), control vFlee → armed identical
  (no-change), control door with NO armed counterpart (avoided —
  reported with its S9 attribution, never proof on its own).
- (S3) Leader-death census: `vDie` doors per leg + the leader HP
  at death.
- (S4) Pin-subset B1 rate (wave-4+ and all-waves, fought subset)
  — RATE ONLY, no ≥3-row floor (the floor is dropped for this
  arm; see the analyzer header).
- (S5) Door-fight table: every fought door — seed, day, monster,
  rounds, dealt, derived entry HP, outcome, D/round, fleeHpFrac,
  doorHold rounds, party HP at flee time, leader entry HP,
  projection band.
- (S6) Wall numbers: wins / national (by scaleRank ≥ 2 AND by
  standing ≥ 200) / table, wave 4–5 unlocks, median survival,
  deaths, villages lost, starvation — control vs armed.
- (S7) Sub-floor census: fought doors where the LEADER entered
  below 25 HP, both legs (the floor gates' pool) + fought doors
  where ANY party member entered below 25 HP as read from the
  gate-avoid notes (the whole-party gate's pool).
- (S8) Gate-fire census: `hpgateFires` + `leaderhpgateFires` +
  `leaderprojFires` summed per leg (the direct evidence each gate
  fired), plus the gate-avoid notes (`gateAvoidNotes`: mid, member
  name, kind, HP, projected HP — the persisted avoid).
- (S9) Avoided-doors census: control doors with no armed
  counterpart row (seed/day/monster), ATTRIBUTED via the armed
  leg's gate notes (same seed + mid): 'proj' = the projection
  gate fired on that door, 'lead' = the leader gate fired on it,
  'hold' = the whole-party gate fired on it, 'divergence' = no
  gate note — trajectory divergence dropped the row.
- (S10) Leader-projection census: per fought door, the leader's
  projection band (dead1 / dead2 / collapse2 / safe) and
  projected HP after one/two rounds; per fired door (gate note),
  the fired member's projection and whether the fired door's
  leader was projected-dead ('proj' notes carry a known leader
  HP, as do 'lead' notes; 'hold' notes do not).
- (S11) D1fought (reported secondary): flee rate on fought
  projection-pool doors per leg — expected unmeasurable on the
  armed leg when the gate works (it refuses every pool door).

## Base + substrate (verified, not assumed)

- Base: master `1c11dbb14` (full
  `1c11dbb149a660b7946aaefb2e95c29c14bf5548`) at arm start. The
  worktree HEAD at freeze IS the frozen base; the anchor stamped
  on every corpus file is `1c11dbb14`.
- The substrate (PINQUAD + DMGPIN + DOORFLEE2 + HYPOFLOOR +
  HPGATE) is ON this base: the HPGATE lever is in the tree
  (`src/js/villager-agency.js`, HPGATE block, landed on master);
  the LEADERHPGATE lever is also in the tree but its flag is
  NOT carried on either leg (subsumed — it never fires
  alongside HPGATE). The only `src/` change this arm makes is
  the LEADERPROJ lever in the same file (+38/−0). NO port from
  any held branch was needed; the held branches are NOT merged,
  NOT modified, NOT rebased. Note: this base is LATER than the
  leaderhpgate base `bda6ff495` — the intervening master commits
  (journey-establishment r268 work) are unrelated to the door
  substrate, but the anchor is this base, not the leaderhpgate
  base; the probe + judged control leg both run on it, so the
  comparison is self-consistent.
- **Policy frozen:** `scripts/policies/competent.js` sha256
  `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
  (first 12: `1884c8852d38`) — verified live on this base at
  freeze time.
- Substrate flags (both legs):
  `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1
  LAUNCHSURVIVE=1 ALLYSLOT3=1 PINQUAD=1 DMGPIN=1 DOORFLEE2=1 HYPOFLOOR=1
  HPGATE=1`.
  Armed leg adds `LEADERPROJ=1` only.
- The lever's exact identity is recorded alongside the anchor:
  `src/js/villager-agency.js` diff +45/−0 (LEADERPROJ gate +
  avoid in `expeditionMonster`, placed after the LEADERHPGATE
  block), `node --check` green, no other `src/` file touched by
  this arm's lever. Driver diff (stamp + notes-regex + legs-log
  line only).

## Anchor rule (the poolfirstfail lesson, frozen)

- The driver stamps `anchorCommit` as `git rev-parse HEAD` at
  load time. The FROZEN BASE is master `1c11dbb14` (full
  `1c11dbb149a660b7946aaefb2e95c29c14bf5548`). **Nothing is
  committed before the judged legs run** — the prereg, the
  instrument, the lever, and the proof runs all happen with HEAD
  still at the frozen base, so the stamped anchor IS the frozen
  base. The final commit happens only AFTER the legs +
  evidence are written.
- The evidence verifies `anchorCommit` on EVERY corpus file
  against the frozen base; a mismatch voids that leg.
- **If anything is committed before the judged legs, the legs
  must be re-run after a dated prereg CORRECTION** — never amend
  the expected anchor post-hoc.

## Instrument (copied from master, adapted only where the flag changes)

- Driver: `scripts/pinquaddoor-driver-b.js` — on master already
  (leaderhpgate arm's version); this arm's adaptation ONLY: the
  corpus stamp gains `leaderprojFlag: process.env.LEADERPROJ ||
  null` and `leaderprojFires` (the agency-state counter read at
  end of run, 0 when the gate never fires or the flag is off),
  and the gate-avoid-notes regex also parses the projection
  gate's note ("(projected <hp> HP, <proj> HP in two rounds)")
  as kind 'proj' with its projected HP; the legs-log line gains
  `leaderprojFlag` + `leaderprojFires`. No other driver behavior
  changes; the M2w wide test (which asserts the driver defaults)
  re-runs green on the edited copy.
- Analyzer: `scripts/analyze-pinquaddoor-b.js` — on master
  already, copied verbatim (exports `deriveDoorEntryHp` /
  `dealtBound` / `freshDoorKill` / `b1NonInferiority` unchanged).
  No changes.
- Projection-gate analyzer: `scripts/analyze-leaderproj-b.js` —
  the leaderhpgate analyzer with D1 redesigned (matched-pool
  bad-outcome rate) + D4 repointed at `leaderprojFires` + D5
  requiring `leaderhpgateFlag` null on BOTH legs + the 'proj'
  kind in the gate-notes (S8b) and avoided-doors (S9) censuses
  + the matched-pool census (`matchedPool`, exported for the
  evidence); its own selftest stays green (30/30, run pre-freeze
  in development — re-run post-freeze as a frozen bar).
- Proof tests: `scripts/test-allyslot3-b.js` (M1),
  `scripts/test-pinquaddoor-b.js` (M2),
  `scripts/test-pinquaddoor-wide-b.js` (M2w),
  `scripts/test-dmgpin-b.js` (M3),
  `scripts/test-doorflee2-b.js` (M3d),
  `scripts/test-downedtwice-b.js` (M3e),
  `scripts/test-hypofloor-b.js` (M3f),
  `scripts/test-hpgate-b.js` (M3g),
  `scripts/test-leaderhpgate-b.js` (M3h) — on master already, run
  verbatim;
  `scripts/test-leaderproj-b.js` (M3i, NEW, 55 checks).
- Fixtures (read-only copies of prior judged data, for the
  proofs only — never judged data in this arm):
  `scripts/fixtures/dmgpin-b-s106722-control.json` and
  `...-armed.json` (same shas as the dmgpin prereg).
- Panel: `scripts/build-pinquaddoor-b-panels.js` — on master
  already, run verbatim as
  `RUN=leaderproj-b CORPUS_PREFIX=leaderproj-b node
  scripts/build-pinquaddoor-b-panels.js --out
  evidence/2026-11-22/leaderproj-b-panel --before
  evidence/2026-11-22/perseed-leaderproj-b-control --after
  evidence/2026-11-22/perseed-leaderproj-b-armed --seeds
  107391,107392,107393,107394,107395,107396,107397,107398
  --before-seeds <same>` +
  `node scripts/balance-panel.js compare`; the compare `.md` is
  attached to the evidence file.

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
- M3i `test-leaderproj-b.js` **50/50** (target — development
  run pre-freeze: see the proofs log; the post-freeze run is the
  judged one).
- Analyzer selftest `analyze-leaderproj-b.js --selftest`
  (target: 30/30 green).

## Expectation (not a bar)

Control (pin+damage+hold+floor+whole-party gate) should
reproduce the probe on this band — report this band's own
numbers; do not force a match to the probe beyond the tripwire.
The pilot is expected to GO on D1 if the probe pool has bad
outcomes the gate can remove (the prior band's pool went 3/4
bad), with D2/D3 passing on the remaining fought doors and D4 ≥
1. If the probe pool is empty or all-good, D1 is unmeasurable or
misses and the verdict is NO-GO on D1 — the gate's pool, not the
gate's mechanism, decides. If the armed leg's `leaderprojFires`
is 0, STOP: the gate's condition never met a door on this band,
and the verdict must be re-derived from the mechanism, not from
the frozen expectation. If the control leg yields 0 fought doors,
the verdict is NO-GO kind SUPPLY-THIN per the frozen rule (D2/D3
unmeasurable), and the projection question stays open for a
door-richer band.

## Legs log + evidence discipline

- Legs tee to `evidence/2026-11-22/leaderproj-b-legs.log`
  (one JSON line per seed + EXIT lines; fallback recovery).
  The lever diff, the fixture copy shas, and the proof counts
  are recorded there.
- Evidence: `evidence/2026-11-22/sim-leaderproj-b.md` (verdict,
  frozen-bar table, door-fight table with flee rounds + party
  state + doorHold + conversions + gate fires + leader entry HP
  + projection band, matched-pool table, wall numbers, sense-test
  transcript read, metric review) + `leaderproj-b-panel.md` +
  panel JSONs + analysis JSON (analyzer --json over each corpus
  dir).
- `check.js --quick`: attempted once after any src change, but
  SERIALIZED — pgrep for any running check.js first and wait
  until none is running; never run two concurrently. (The
  proof tests are plain node, not jest, so they run without
  adding a jest process.)
- Write flap: intermittent EPERM on fresh-file writes is active
  this week. Probes run before writes that matter; the driver
  uses write-robust paths; a blocked final commit leaves files
  on disk intact for coordinator adoption, never forced.
- Git slowness: index-touching git commands can run minutes
  under hot-tree load (a plain `grep -r` over the evidence tree
  was killed after 2+ min without completing one seed; `git
  grep` over the same scope completed). Prefer commit-to-commit
  reads (`git show` / `git diff <commit> <commit>`) and `git
  grep`, which stay fast.
- VM replacement: if a process dies or the machine restarts
  under this run, re-establish state from disk and report it —
  do not redo finished work silently.

## Metric review (adopted from doorflee2 §8 / hypofloor / hpgate / leaderhpgate — this run is judged as frozen)

- **D1 is redesigned for this arm (see "The D1 redesign").** A
  flee rate over armed fought doors is unmeasurable by
  construction when a door-avoiding gate works; the matched-pool
  bad-outcome rate prices the gate on the doors it would have
  refused. The leaderhpgate-style D1 survives only as the
  reported D1fought secondary.
- F1/D1 is priced on the flee RATE with the count as a secondary
  (the armed leg may fight fewer doors; a count bar punishes the
  lever for reaching fewer doors).
- D2 is priced on the kill RATE per fought door, NOT leg-total
  kills (hpgate P2 as written punished a door-avoiding lever for
  avoiding doors — the metric fix this arm exists to make).
- D3 is priced on TOTAL damage per door/fight, not per round
  (longer held fights dilute per-round damage by construction).
- B1's ≥3-armed-row floor is DROPPED for this arm (reported as
  a rate-only secondary): hpgate-b §10 showed the floor is
  structurally unreachable for a door-avoiding lever on a thin
  band.
- The effect metric is conversions (flee→kill, flee→later-flee)
  PLUS attributed avoids (control door with no armed
  counterpart, with its S9 attribution), not hold rounds.
- The door-line order quirk (door lines print 2, 3, 1) persists
  in the ported slot code; cosmetic, no bar.
- The gate-avoid note is persisted as `gateAvoidNotes` on the
  corpus file, so the sense test can quote the avoid — and the
  projection gate's note carries its projected HP, so the
  attribution names the forecast, not just the fire.
- The S7 blank from doorflee2 is closed as a census in two
  halves: leader-sub-25 fought doors (the floor gates' pool)
  and any-member-sub-25 doors as read from the gate notes (the
  whole-party gate's pool).

## What was read first (do not re-measure what they answered)

- `docs/CANON.md` + `docs/MONSTER-WAVES.md` wave-4 bands (no
  canon doc prices a morale read, a hypothetical-HP floor, a
  commitment hold, or an HP gate — the gate is a sim lever,
  judged door by door).
- `evidence/2026-11-22/sim-leaderhpgate-b.md` (§§1, 5, 9, 10 —
  the NO-GO kind CONCEPT-DEAD (subsumed), the d108/d147 sense
  test, the S10 projection census, the named next lever) + its
  frozen prereg.
- `evidence/2026-11-22/sim-hpgate-b.md` (§§1, 5, 7, 9, 10 — the
  NO-GO kind METRIC-BROKEN, the d57 reunion sense test, the
  leader-vs-trigger analysis) + its frozen prereg.
- `evidence/2026-11-22/sim-hypofloor-b.md` (§§4, 5, 7, 8, 10 —
  the NO-GO on F1 only, the d110 21-HP leader dying next round,
  the 22–25/round focused-damage rate that the projection uses)
  + its frozen prereg.
- `evidence/2026-11-21/sim-doorflee2-b.md` (§§5, 6 S7, 7, 8 —
  the NO-GO on F1 only, the 6-hold ledger, the "~25 HP" gate
  suggestion, the metric review ADOPTED here) + its frozen
  prereg.
- `docs/MEASUREMENT.md` §§9–12, 14–15 (staged method, metric
  binding, §14a kill taxonomy, balanced panels).
- `~/workspace/custom-skills/local_seed_band_freshness/SKILL.md`
  — the full freshness search is recorded above (preregs + all
  evidence .md via git grep, zero hits).
- The scalemetric deciding cost bar (convergence-tracker.md):
  starvation ≤ control+2 (totals AND arm-only) AND median ≥
  0.8× control median.

## Files

- Prereg: `evidence/2026-11-22/sim-leaderproj-b-prereg.md` (this file)
- Instrument: `scripts/pinquaddoor-driver-b.js` (leaderprojFlag +
  leaderprojFires stamps + 'proj' notes parse + legs-log line),
  `scripts/analyze-pinquaddoor-b.js`,
  `scripts/analyze-leaderproj-b.js` (NEW — D1 matched-pool +
  S8b/S9 'proj' kind + S10, selftest 30/30),
  `scripts/test-allyslot3-b.js`, `scripts/test-pinquaddoor-b.js`,
  `scripts/test-pinquaddoor-wide-b.js`, `scripts/test-dmgpin-b.js`,
  `scripts/test-doorflee2-b.js`, `scripts/test-downedtwice-b.js`,
  `scripts/test-hypofloor-b.js`, `scripts/test-hpgate-b.js`,
  `scripts/test-leaderhpgate-b.js`, `scripts/test-leaderproj-b.js`
  (M3i, NEW, 55 checks),
  `scripts/build-pinquaddoor-b-panels.js`,
  `scripts/fixtures/dmgpin-b-s106722-control.json`,
  `scripts/fixtures/dmgpin-b-s106722-armed.json`
- Probe corpora (pre-freeze substrate/pool check, control config):
  `evidence/2026-11-22/perseed-leaderproj-b-probe/` + probe logs
  `leaderproj-b-probe-chunk1.log`, `leaderproj-b-probe-chunk2.log`
- Corpora (fresh, judged): `evidence/2026-11-22/perseed-leaderproj-b-control/`
  (8 files) + `evidence/2026-11-22/perseed-leaderproj-b-armed/`
  (8 files)
- Analysis: `evidence/2026-11-22/leaderproj-b-analysis.json`
  (analyzer --json over both corpus dirs) + `leaderproj-b-panel.md`
  + panel JSONs
- Evidence: `evidence/2026-11-22/sim-leaderproj-b.md`
- Leg log: `evidence/2026-11-22/leaderproj-b-legs.log`
- `src/` diff: the LEADERPROJ lever in `src/js/villager-agency.js`
  only (+45/−0). No default flip.
