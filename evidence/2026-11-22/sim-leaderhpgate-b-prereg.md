# sim-leaderhpgate-b — FROZEN prereg (Loop B run fleshout-loop-b-20261122T1330Z)

**Frozen:** 2026-11-22 ~14:46 UTC, BEFORE any judged sim. Base master
`bda6ff495` (full `bda6ff495513688fc1680d671d1e019013dd7a9a`,
"sim-scale-onramp-round-1115: round record (leadgate DIAG-GO +
vanishtile GO, gate 339/5, 0 attributable)"). Branch
`sim-leaderhpgate-b`, worktree `~/workspace/worktrees/sim-leaderhpgate-b`.
Run `fleshout-loop-b-20261122T1330Z`, arm `sim-leaderhpgate-b` (the
LEADER-HP GATE: the named next lever from the hpgate NO-GO,
finding #2619 kill conversion).

## The question (finding #2619, next step after the hpgate NO-GO)

The hpgate pilot proved the whole-party HP gate mechanically live
but unpriceable on leg totals: it fired once, on the one sub-floor
door in its pool, and the flee it was built to avoid did not happen
on the armed leg (F1 passes, 25pp drop, 0 armed flees) — but P2 and
B1 missed because a single gate fire rewrote seed 107352's whole
future, so the armed leg fought 2 doors instead of 4. Verdict
NO-GO kind METRIC-BROKEN. Its §5 sense test adds the design
question that is this arm's real input: the flee's proximate cause
was the LEADER — Patrick took every hit (23 then 22 — the monster
focused him exclusively; Victor took zero hits in either round)
and dropped 67 → 44 → 22 HP — while Victor, the gate's trigger at
23 HP, was never tested by the monster. The trigger (any member <
25) and the mechanism (leader HP collapse under focused damage)
coincided on that one door without being the same thing. Its §7
names the next arm verbatim: "(c) test a leader-HP floor (or a
leader-projection floor) alongside the whole-party floor, since the
observed flees are leader-driven". This arm builds the leader-HP
floor, priced door by door.

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
encounter note + return, no fight, no flee, no death). The
leader gate sits in the same place, after the HPGATE block, with
the same terms except the coverage: the LEADER only.

## THE SUBSUMPTION — read this before the bars (pre-registered, not discovered after)

The leader gate's condition is a STRICT SUBSET of the
whole-party gate's condition on the same leg. HPGATE checks the
party `[leader, ally1, ally2, ally3]` in order, strict `< 25`,
and fires on the FIRST member below the floor — the leader is
checked first. LEADERHPGATE checks the leader only, strict `<
25`, placed AFTER the HPGATE block. So on any leg carrying
HPGATE=1 (which is BOTH legs of this arm — the control is the
hpgate armed configuration), every door the leader gate could
refuse has already been refused by the whole-party gate: the
leader gate's marginal fires are **expected to be 0**, the legs
are **expected to be trajectory-identical**, and the D1 pool
(leader-sub-25 fought doors on the control leg) is **expected to
be empty** — a door with a sub-25 leader is never fought on the
control leg, because HPGATE refuses it first.

This is stated here, BEFORE any judged sim, because it decides
what this arm can and cannot prove:

- What the arm CAN prove: that the leader floor, as a separate
  gate alongside the whole-party floor, has no marginal pool
  (D4 = 0 fires, D1 unmeasurable, legs identical) — the
  subsumption, confirmed empirically rather than asserted from
  the code — AND the leader-projection diagnostic (S10), which
  prices whether a PROJECTION gate (leader HP after one/two
  rounds of focused wave-4 damage) would have a pool the `< 25`
  floor never touches. The diagnostic is the arm's forward
  yield; the next arm's input is a projection gate, not another
  HP floor.
- What the arm CANNOT prove: any flee-rate or kill-rate effect
  of the leader floor, because there is no door on which it acts
  that HPGATE does not already act on. A GO on D1/D4 is not
  expected; a GO would mean the subsumption analysis is wrong
  (e.g. HPGATE missed a leader-sub-25 door), and would have to
  be investigated as a code-path difference, not celebrated.
- Verdict rule (frozen): if `leaderhpgateFires` = 0 on the armed
  leg AND the legs are trajectory-identical, the verdict is
  NO-GO kind CONCEPT-DEAD (subsumed: the leader floor's
  condition is a strict subset of the whole-party floor's
  condition on the same leg; the mechanism was staged — the
  proof test §1a shows it refusing a door in isolation — the
  metric was fair, and the concept as a SEPARATE lever fails on
  its merits because there is no door left for it to refuse;
  do not retry a leader-HP floor without a new mechanism — the
  named new mechanism is the leader-projection gate). The
  alternative classification (METRIC-BROKEN: D1's pool is empty
  by construction) is recorded in the metric review, not
  re-scored: D1 fails as unmeasurable, which is the honest
  reading of a zero pool, and the CONCEPT-DEAD call rests on
  the mechanism (the subsumption, found in the arm's own logic)
  per §14a's tie-break.
- Placement note (frozen): the leader gate sits AFTER HPGATE
  deliberately — an additional gate alongside the whole-party
  floor — so its counter measures marginal fires ONLY and never
  steals attribution from HPGATE's census. The before-placement
  variant (leader gate first, attributing the leader-driven
  share of HPGATE's fires) is available to a future arm if the
  coordinator wants that attribution; it changes no outcome
  and is NOT built here. No second gate is built in this arm.

## The floor (derived from the evidence, not guessed)

**Floor: 25 HP, strict (`< 25` refuses), LEADER ONLY, read live at the door.**

- **25 HP = one round of focused wave-4 damage.** Hypofloor-b §4:
  the d110 monster hits 22–25 a round, all on the leader; the
  leader at 21 HP "dies next round". MONSTER-WAVES.md wave-4
  bands: damage 35–95, HP 850–1500, "a 4-6 round fight". A
  leader below 25 HP is inside one round of death.
- **The number is the prior arms' named number.** Doorflee2-b §7:
  "a pin that refuses a member below ~25 HP would stop the 25/26-HP
  leaders"; hpgate took that number literally for the whole
  party; this arm takes it literally for the leader.
- **Coverage (leader-only, NOT whole party):** the sense test's
  mechanism is the leader collapsing under focused damage. The
  original whole-party exhibit — the 3-HP third ally
  (doorflee-b §6 S7) — is DELIBERATELY not covered by this gate:
  a hurt ally the monster never touches does not cause the flee,
  and the leader gate refusing on the ally's HP would be the
  hpgate trigger again, not the leader mechanism. The proof test
  §1b stages exactly this: leader 100, ally3 3 HP, the door
  OPENS. The coverage difference between the gates is the
  arm's design, not an oversight.
- **The edge cases stay, and are counted.** The 25-HP leader
  (doorflee2-b 106830 d98 influencer, fled R1) and the 26-HP
  leader (106820 d46 eater, died the next day) sit AT the line:
  strict `< 25` refuses neither. That is the documented cost of
  taking the evidence's number rather than padding it — S7/S10
  count leader-sub-25 doors on both legs, and the 25/26-HP
  doors remain visible in the door table for the projection arm.

## The lever (LEADERHPGATE) — built, env-gated OFF by default

In `src/js/villager-agency.js` `expeditionMonster` (+45/−0, one
file), after the HPGATE block and before `fieldFight`:

- **Gate (computed once, at the door):** `LEADERHPGATE=1` in env
  AND `_pinDoor` true (full pinned trio, allyFromStart) AND wave
  ≥ 4 AND the leader's live HP < 25 in `state.village.health`
  (missing entry defaults 100, the established default). In the
  browser `process` is undefined, so the flag is never on there.
- **Action (the avoid verb):** the agency-state counter
  `st.leaderhpgateFires` increments (the driver census), an
  encounter note is pushed ("gave <mid> room — <Name> is too
  hurt to lead a door (<hp> HP)", mirroring the HPGATE note
  shape with the distinct verb "lead" so the driver can tell the
  gates apart), and the function returns — no fight, no flee, no
  death. The monster meeting is consumed; the expedition
  continues; a later door meeting re-checks live HP. The gate
  fires regardless of the win-plan seek flag: HP is a hard floor,
  not a preference.
- **Considered and NOT built:** (a) launch-time gating — cannot
  catch the evidence (members are hurt en route / in earlier
  doors the same day); (b) swapping a below-floor leader for a
  healthy villager — no replacement pool exists at door time
  (the pin IS the commitment); (c) fighting on as a regular
  (unpinned) fight when the gate refuses — that would spend the
  same flee/death uncounted, denominator surgery, not a fix;
  (d) a leader-PROJECTION gate (refuse when the leader is
  projected dead after one/two rounds of focused damage) — that
  is the NEXT arm's mechanism, priced by this arm's S10
  diagnostic; building it here would be a second gate, and the
  task forbids a second gate in this arm; (e) the
  before-placement attribution variant — see the placement note
  above.
- **Untouched:** the HPGATE whole-party gate, learn-first
  withdrawal, death, the 5% winning floor, signature exits,
  sealed arenas, solo/non-door/shout-ladder fights, the
  DOORFLEE2 hold, the HYPOFLOOR pool floor, and every fight with
  the flag off (no RNG is drawn — verified by the proof test's
  §0 source check + §5 healthy-identity check; off-mode is
  byte-identical: the healthy door fight is identical with the
  flag on vs off).
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
gate is a sim lever to test whether taking a near-dead leader to
doors is the binding constraint, judged door by door; landing
it as a game change would still be a Steve/design call, not this
arm's. The lever stays env-gated / default-OFF exactly as built
— NO default flip in this arm.

## The leader-projection diagnostic (S10 — the arm's forward yield)

For every FOUGHT door, the driver records the leader's live entry
HP (`leaderEntryHp`, the same live read the gates use at the
door), and the analyzer projects it forward at the focused
wave-4 damage rate — **25 HP/round** (the top of the hypofloor
§4 22–25 range, the conservative read for "the leader is about
to die"):

- **dead1:** leader entry ≤ 25 — projected-dead after ONE round
  (the gate's own floor, by construction).
- **dead2:** entry 26–50 — projected-dead after TWO rounds.
- **collapse2:** entry 51–75 — projected at-or-below the 25-HP
  floor after two rounds (the d57 Patrick case at 67 HP and the
  d110 Diana case at 71 HP both sit here — leaders who were
  never refused by any `< 25` floor and collapsed in the fight).
- **safe:** entry > 75 — projected above the floor after two
  rounds.

For every FIRED door (gate-avoid note), the analyzer projects the
fired member's HP the same way (projHp1 = hp − 25, projHp2 =
hp − 50) and reports whether the fired door's leader was
projected-dead. Only a 'lead' note's HP is known to be the
leader's; a 'hold' note's HP is the fired member's (the leader's
HP on that door is unknown from the note alone — reported as
member HP, never attributed to the leader). The diagnostic
answers the next arm's question: how many fought doors had a
leader in the collapse2 band — doors a projection gate would
refuse that no `< 25` floor ever touches.

## Design — paired pilot on a fresh band

**Band (FRESH):** 107375, 107376, 107377, 107378, 107379, 107380,
107381, 107382. Both legs are FRESH runs on this arm's tree.

**Seed-band freshness check (recorded at freeze, per
`~/workspace/custom-skills/local_seed_band_freshness/SKILL.md`):**
git grep over ALL `evidence/*/sim-*-prereg.md` for each of the 8
seeds — ZERO hits for every seed. Git grep over ALL
`evidence/**/sim-*.md` for each seed — ZERO hits for every seed.
Raw git grep over the whole `evidence/` tree for the 8 numbers
returns matches ONLY in JSON/.jsonl corpus and panel-case files
(numeric fragments inside long hashes, IDs, and calorie values —
no prereg, no sim-*.md, no forbidden/contaminated band list, no
screen or extension band names any of these seeds; the only
probe-file match is
`evidence/2026-11-22/perseed-hpgate-b-probe/hpgate-b-s107327-hpgate-b-probe-pinquaddoor.json`,
seed 107327 — a hpgate rejected-band probe seed, not in this
band — where the match is a numeric fragment inside a larger
value). The coordinator's pre-check (0 hits in all preregs, 0
word-boundary mentions in any sim-*.md) is corroborated by this
re-verification. Method note: the first plain-`grep -r` attempt
was killed after 2+ minutes without completing a single seed
(filesystem slowness under hot-tree load); the check was
completed with `git grep` (index-based) over the same scope
instead. Band is FRESH; no collision, no correction needed.

**Band screening (the §14b pool-sizing probe — recorded, not hidden):**
the control config is probed on this band BEFORE freezing, to
check door supply (D2/D3/S10 need fought doors; D1's pool is
empty by construction regardless of band). Probe results
(control config, 8 seeds, 0 instrument errors, anchor
`bda6ff495`, policySha `1884c8852d38`, `leaderhpgate-b-probe-chunk1/2.log`):

- **167 wave-4+ meetings, 6 fought doors: 2 vFlee, 3 vKill, 1
  vDie, 0 mFlee.** Door supply is thin but non-zero with two
  flees and a leader death — the pilot can price D2/D3 and S10.
- **0 leader-sub-25 fought doors (min leader entry HP 42)** —
  the D1 pool is empty exactly as the subsumption predicts, on
  the probe as well as in theory. The armed leg cannot add a
  fought door to this pool either (HPGATE refuses them first).
- **Whole-party gate fires: `hpgateFires` total 3, all on seed
  107379** — but only **1 gate-avoid note persisted**
  ("gave congregation room — Eckart is too hurt to hold a door
  (15 HP)"). Instrument note, recorded pre-freeze: the notes
  census UNDERCOUNTS fires — notes live on the expedition
  record, and records from ended expeditions do not survive to
  the driver's end-of-run read. The counter (`hpgateFires` /
  `leaderhpgateFires`) remains the direct S8 evidence; the notes
  are the quotable sample, not the count. No `leaderhpgateFires`
  on the probe (flag off), as expected.
- **Fought doors (probe):** 107375 d106 audit vFlee R2 (leader
  42, dead2); 107375 d108 influencer vDie R7, dealt 955,
  doorHold 2 (leader 64, collapse2); 107375 d112 eulogy vKill R7,
  dealt 974 (leader 75, collapse2); 107377 d65 influencer vKill
  R5, dealt 1044 (leader 78, safe); 107379 d145 reunion vKill
  R12, dealt 1284 (leader 100, safe); 107379 d147 network_note
  vFlee R2, dealt 376 (leader 51, collapse2).
- **S10 projection bands on the probe:** dead1 0, dead2 1 (42),
  collapse2 3 (64, 75, 51), safe 2 (78, 100). The projection
  diagnostic HAS a pool: three fought doors sit in the collapse2
  band — leaders no `< 25` floor ever refuses, who were inside
  two rounds of the floor when they walked in.
- Per-seed survival (days): 150, 112, 88, 123, 150, 150, 130,
  150. Standing: 460, 199, 150, 560, 225, 475, 199, 380.
  The band is ACCEPTED: door-thin (6 doors) but with flees, a
  leader death, and a collapse2 pool — the verdict will turn on
  few doors, stated here before freezing, not discovered after.

**Probe determinism tripwire:** the probe runs the control
config on this band (8 seeds, 0 instrument errors, anchor
`bda6ff495`, policySha `1884c8852d38`). The judged control leg
re-runs the same seeds under the same config and MUST reproduce
the probe's door table — the sims are seeded and deterministic.
If the judged control differs from the probe, STOP and
investigate (the code moved under the run); do not judge the
armed leg against a drifted control.

- **Control leg:** substrate + `DOORFLEE2=1 HYPOFLOOR=1 HPGATE=1`
  (the hpgate ARMED configuration, re-run fresh on current
  master). Expect the probe shape on this band — report this
  band's own numbers; do not force a match to the probe beyond
  the tripwire above.
- **Armed leg:** control flags + `LEADERHPGATE=1`, nothing else.
  Same seeds, same policy, same horizon. The only difference
  between the legs is the leader gate.
- **Substrate flags (both legs):**
  `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1
  LAUNCHSURVIVE=1 ALLYSLOT3=1 PINQUAD=1 DMGPIN=1 DOORFLEE2=1 HYPOFLOOR=1
  HPGATE=1`.
- **Policy frozen:** `scripts/policies/competent.js` sha256
  `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
  (first 12: `1884c8852d38`) — verified live on this base at
  freeze time (and stamped on every probe corpus file).
  IDENTICAL to the dmgpin/doorflee/doorflee2/hypofloor/hpgate
  bands.
- **Horizon:** 150d, death-aware (dead villages stop, +10d tail
  max). Same horizon as every prior band in this program.
- **Legs chunked at 4 seeds per call** (a 16-seed single call was
  SIGTERMed before; per-seed files persist across kills; resume,
  never re-run completed seeds. The driver refuses to overwrite,
  exit 3).
- **Driver env:** `EVIDENCE_DATE=2026-11-22
  CORPUS_PREFIX=leaderhpgate-b RUN=leaderhpgate-b
  OUTDIR=perseed-leaderhpgate-b-control` / `...-armed` (+
  `LEADERHPGATE=1` armed only). Corpus files
  `leaderhpgate-b-s<seed>-leaderhpgate-b-pinquaddoor.json`.
- **Confirm rule:** a 12–16-seed confirm runs ONLY if this pilot
  GOes on every bar. A pilot NO-GO spends no confirm seeds.
  (Expected: NO-GO on D1/D4 by the subsumption rule above — no
  confirm is expected to be spent.)
- **Master movement:** if master moves after the legs start, this
  arm does NOT rebase mid-run — the anchor is frozen at
  `bda6ff495` and the legs judge on it; the coordinator merges
  afterward.

## Frozen bars (a miss is NO-GO, never re-scored)

The panel census of wave-4+ encounters (`v4encounters` rows) on
both legs, through the leaderhpgate analyzer
(`scripts/analyze-leaderhpgate-b.js`, selftest green 24/24; the
door definition and freshness judges are reused from
`scripts/analyze-pinquaddoor-b.js` unchanged), plus a node
one-liner over the raw corpora for the door table (the dmgpin
method). The analyzer is the hpgate analyzer with the flag
renamed (`hpgateFlag` → `leaderhpgateFlag`, D5 now also requiring
`hpgateFlag` '1' on BOTH legs) + the per-door repricing (D1/D2)
+ the gate-notes census (S8b) + the attributed avoided-doors
census (S9) + the leader-projection census (S10); the hpgate
leg-total bars (P2 as written, B1 as written with its ≥3-row
floor) are NOT the judge — B1 survives only as a rate-only
secondary.

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
- (M3h) **Leader-gate proof** (`scripts/test-leaderhpgate-b.js`,
  NEW): 50/50 on this tree — hurt leader (21 HP) refuses the
  door in isolation (HPGATE unset: no fieldFight, counter 1,
  narrated note); hurt ally (3 HP) does NOT trigger it (door
  opens, counter 0 — leader-only coverage); boundary 24 refuses
  / 25 proceeds; healthy door opens; inert without the pin, at
  wave 1, and with the flag off (healthy fight identical on vs
  off); SUBSUMPTION staged (§6: with HPGATE=1 the whole-party
  gate fires first, leaderhpgateFires 0); driver smoke green.
- (M4) **Panel bars** (control pin+damage+hold+floor+whole-party
  gate vs armed +LEADERHPGATE, same seeds, same policy):
  - (D1) **Flee on leader-sub-25 doors, PRIMARY (per-door):**
    armed flee rate ≤ control flee rate − 20pp, on FOUGHT doors
    whose leader entered below 25 HP. The flee COUNT is reported
    as a secondary only. If either leg's leader-sub-25
    fought-door pool is empty, D1 is UNMEASURABLE and FAILS
    (the pool is the gate's whole question; an empty pool is a
    failed bar, not a pass). Pre-registered expectation: the
    control pool is 0 (HPGATE refuses these doors first).
  - (D2) **Kill rate per FOUGHT door (per-door, NOT leg-total
    kills):** armed vKill rate per fought door ≥ control rate −
    2pp. A RATE — the armed leg may fight fewer doors because it
    avoided some; leg-total kills (hpgate P2 as written) are
    NOT the judge.
  - (D3) **Damage guard (repriced, carried):** armed TOTAL
    damage per door/fight ≥ 0.9× control (total dealt on fought
    doors divided by fought doors — NOT per-round).
  - (D4) **Mechanism engagement:** armed `leaderhpgateFires` ≥
    1 — the lever must fire at least once to be judged a lever
    at all. Pre-registered expectation: 0 (subsumption — see
    above). A 0 here is the subsumption confirmed, not a
    surprise.
  - (D5) **Substrate sanity:** every control corpus file carries
    `leaderhpgateFlag` null AND `hpgateFlag` '1' AND
    `hypofloorFlag` '1' AND `doorflee2Flag` '1' AND `dmgpinFlag`
    '1' AND `pinquadFlag` '1'; every armed file carries
    `leaderhpgateFlag` '1' AND `hpgateFlag` '1' AND
    `hypofloorFlag` '1' AND `doorflee2Flag` '1' AND `dmgpinFlag`
    '1' AND `pinquadFlag` '1'; every corpus file carries
    `leaderhpgateFires` as a number AND `hpgateFires` as a number
    AND `gateAvoidNotes` as an array AND `anchorCommit` equal to
    the frozen base (§"Anchor rule") and `policySha`
    `1884c8852d38`.
  - **SUPPLY rule (frozen):** if the CONTROL leg yields ZERO
    fought doors, D2/D3 are unmeasurable and the verdict is
    NO-GO kind SUPPLY-THIN, not a lever failure. (The D1 pool
    being empty is NOT supply-thin — it is the subsumption, and
    is judged under D1/D4 as above. The distinction is frozen
    here so the two empties are never confused.)
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
  wall numbers, a sense-test transcript read (at least two
  fought doors quoted blow-by-blow — if a gate avoid happens,
  quote the avoided meeting's persisted note and the nearest
  fought door), the diag table (§1 of the doorflee evidence),
  the balanced-panel compare output attached, and a
  metric-review section; corpora under
  `evidence/2026-11-22/perseed-leaderhpgate-b-control/` and
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
  below 25 HP, both legs (the leader gate's own pool — expected
  0 on the control leg, by the subsumption) + fought doors where
  ANY party member entered below 25 HP as read from the
  gate-avoid notes (the whole-party gate's pool).
- (S8) Gate-fire census: `hpgateFires` + `leaderhpgateFires`
  summed per leg (the direct evidence each gate fired), plus the
  gate-avoid notes (`gateAvoidNotes`: mid, member name, kind,
  HP — the persisted avoid, closing the hpgate-b §5 instrument
  gap).
- (S9) Avoided-doors census: control doors with no armed
  counterpart row (seed/day/monster), ATTRIBUTED via the armed
  leg's gate notes (same seed + mid): 'lead' = the leader gate
  fired on that door, 'hold' = the whole-party gate fired on it,
  'divergence' = no gate note — trajectory divergence dropped
  the row. A 'lead'-attributed avoid on a door whose leader was
  NOT sub-25 would falsify the subsumption analysis and must be
  investigated, not celebrated.
- (S10) Leader-projection census (NEW — the diagnostic): per
  fought door, the leader's projection band (dead1 / dead2 /
  collapse2 / safe) and projected HP after one/two rounds; per
  fired door (gate note), the fired member's projection and
  whether the fired door's leader was projected-dead (only
  'lead' notes carry a known leader HP).

## Base + substrate (verified, not assumed)

- Base: master `bda6ff495` (full
  `bda6ff495513688fc1680d671d1e019013dd7a9a`) at arm start. The
  worktree HEAD at freeze IS the frozen base; the anchor stamped
  on every corpus file is `bda6ff495`.
- The substrate (PINQUAD + DMGPIN + DOORFLEE2 + HYPOFLOOR +
  HPGATE) is ON this base: the HPGATE lever is in the tree
  (`src/js/villager-agency.js`, HPGATE block, landed on master
  after the hpgate arm); the only `src/` change this arm makes is
  the LEADERHPGATE lever in the same file (+45/−0). NO port from
  any held branch was needed; the held branches are NOT merged,
  NOT modified, NOT rebased. Note: this base is LATER than the
  hpgate base `4681e740f` — the intervening master commits
  (leadgate, scale-onramp, journey-endgame r267 work) are
  unrelated to the door substrate, but the anchor is this base,
  not the hpgate base; the probe + judged control leg both run
  on it, so the comparison is self-consistent.
- **Policy frozen:** `scripts/policies/competent.js` sha256
  `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
  (first 12: `1884c8852d38`) — verified live on this base at
  freeze time.
- Substrate flags (both legs):
  `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1
  LAUNCHSURVIVE=1 ALLYSLOT3=1 PINQUAD=1 DMGPIN=1 DOORFLEE2=1 HYPOFLOOR=1
  HPGATE=1`.
  Armed leg adds `LEADERHPGATE=1` only.
- The lever's exact identity is recorded alongside the anchor:
  `src/js/villager-agency.js` diff +45/−0 (LEADERHPGATE gate +
  avoid in `expeditionMonster`, placed after the HPGATE block),
  `node --check` green, no other `src/` file touched by this
  arm's lever. Driver diff (stamp + row field + notes parse only).

## Anchor rule (the poolfirstfail lesson, frozen)

- The driver stamps `anchorCommit` as `git rev-parse HEAD` at
  load time. The FROZEN BASE is master `bda6ff495` (full
  `bda6ff495513688fc1680d671d1e019013dd7a9a`). **Nothing is
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
  (hpgate arm's version); this arm's adaptation ONLY: the corpus
  stamp gains `leaderhpgateFlag: process.env.LEADERHPGATE ||
  null`, `leaderhpgateFires` (the agency-state counter read at
  end of run, 0 when the gate never fires or the flag is off),
  and `gateAvoidNotes` (the gate-avoid encounter notes parsed
  from the agency expedition records at end of run — mid, member
  name, kind 'hold'/'lead', HP, verbatim note); each
  `v4encounters` row gains `leaderEntryHp` (the leader's live
  village-health HP read BEFORE the fight — the same live read
  the gates use at the door); the legs-log line gains
  `leaderhpgateFlag` + `leaderhpgateFires` + `gateAvoidNotes`
  count. `doorHold` / `everHopeless` row fields already present.
  No other driver behavior changes; the M2w wide test (which
  asserts the driver defaults) re-runs green on the edited copy.
- Analyzer: `scripts/analyze-pinquaddoor-b.js` — on master
  already, copied verbatim (exports `deriveDoorEntryHp` /
  `dealtBound` / `freshDoorKill` / `b1NonInferiority` unchanged).
  No changes.
- Leader-gate analyzer: `scripts/analyze-leaderhpgate-b.js` —
  the hpgate analyzer with only the flag renamed (`hpgateFlag`
  → `leaderhpgateFlag`, D5 now also requiring `hpgateFlag` '1'
  on BOTH legs) + the per-door repricing (D1/D2) + the
  gate-notes census (S8b) + the attributed avoided-doors census
  (S9) + the leader-projection census (S10); its own selftest
  stays green (24/24, run pre-freeze in development — re-run
  post-freeze as a frozen bar).
- Proof tests: `scripts/test-allyslot3-b.js` (M1),
  `scripts/test-pinquaddoor-b.js` (M2),
  `scripts/test-pinquaddoor-wide-b.js` (M2w),
  `scripts/test-dmgpin-b.js` (M3),
  `scripts/test-doorflee2-b.js` (M3d),
  `scripts/test-downedtwice-b.js` (M3e),
  `scripts/test-hypofloor-b.js` (M3f),
  `scripts/test-hpgate-b.js` (M3g) — on master already, run
  verbatim;
  `scripts/test-leaderhpgate-b.js` (M3h, NEW, 50 checks).
- Fixtures (read-only copies of prior judged data, for the
  proofs only — never judged data in this arm):
  `scripts/fixtures/dmgpin-b-s106722-control.json` and
  `...-armed.json` (same shas as the dmgpin prereg).
- Panel: `scripts/build-pinquaddoor-b-panels.js` — on master
  already, run verbatim as
  `RUN=leaderhpgate-b CORPUS_PREFIX=leaderhpgate-b node
  scripts/build-pinquaddoor-b-panels.js --out
  evidence/2026-11-22/leaderhpgate-b-panel --before
  evidence/2026-11-22/perseed-leaderhpgate-b-control --after
  evidence/2026-11-22/perseed-leaderhpgate-b-armed --seeds
  107375,107376,107377,107378,107379,107380,107381,107382
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
- M3g `test-hpgate-b.js` **43/43** (target — development run
  pre-freeze was 43/43 with a clean env; the post-freeze run is
  the judged one).
- M3h `test-leaderhpgate-b.js` **50/50** (target — development
  run pre-freeze was 50/50; the post-freeze run is the judged
  one. First development run was 46/50: three §0 source-check
  anchors used a comment string that wraps across lines, and
  the §8 hpgate sub-test inherited a stray LEADERHPGATE=1 from
  the test process env, refusing its §5 flag-off hurt leader —
  both fixed in the test, not the lever; the lever's staged
  behavior passed in all sections of the first run, including
  the §6 subsumption staging.)
- Analyzer selftest `analyze-leaderhpgate-b.js --selftest`
  (target: 24/24 green).

## Expectation (not a bar)

Control (pin+damage+hold+floor+whole-party gate) should
reproduce the probe on this band — report this band's own
numbers; do not force a match to the probe beyond the tripwire.
The pilot is expected to NO-GO on D1 (unmeasurable — empty
leader-sub-25 pool) and D4 (0 marginal fires), with D2/D3/D5
passing on identical legs — the subsumption, confirmed
empirically. If instead the armed leg's `leaderhpgateFires` is
> 0, STOP: the subsumption analysis is wrong somewhere (a code
path lets a leader-sub-25 door past HPGATE), and the verdict
must be re-derived from the mechanism, not from the frozen
expectation. If the control leg yields 0 fought doors, the
verdict is NO-GO kind SUPPLY-THIN per the frozen rule (D2/D3
unmeasurable), and S10 is empty — the projection question stays
open for a door-richer band.

## Legs log + evidence discipline

- Legs tee to `evidence/2026-11-22/leaderhpgate-b-legs.log`
  (one JSON line per seed + EXIT lines; fallback recovery).
  The lever diff, the fixture copy shas, and the proof counts
  are recorded there.
- Evidence: `evidence/2026-11-22/sim-leaderhpgate-b.md` (verdict,
  frozen-bar table, door-fight table with flee rounds + party
  state + doorHold + conversions + gate fires + leader entry HP
  + projection band, wall numbers, sense-test transcript read,
  metric review) + `leaderhpgate-b-panel.md` + panel JSONs +
  analysis JSON (analyzer --json over each corpus dir).
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

## Metric review (adopted from doorflee2 §8 / hypofloor / hpgate — this run is judged as frozen)

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
- The hpgate-b §5 instrument gap is CLOSED by this arm's driver:
  the gate-avoid note is now persisted as `gateAvoidNotes` on
  the corpus file, so the sense test can quote the avoid.
- The S7 blank from doorflee2 is now closed as a census in two
  halves: leader-sub-25 fought doors (this gate's pool, expected
  0 on control) and any-member-sub-25 doors as read from the
  gate notes (the whole-party gate's pool).

## What was read first (do not re-measure what they answered)

- `docs/CANON.md` + `docs/MONSTER-WAVES.md` wave-4 bands (no
  canon doc prices a morale read, a hypothetical-HP floor, a
  commitment hold, or an HP gate — the gate is a sim lever,
  judged door by door).
- `evidence/2026-11-22/sim-hpgate-b.md` (§§1, 5, 7, 9, 10 — the
  NO-GO kind METRIC-BROKEN, the d57 reunion sense test, the
  leader-vs-trigger analysis, the next-arm input) + its frozen
  prereg.
- `evidence/2026-11-22/sim-hypofloor-b.md` (§§4, 5, 7, 8, 10 —
  the NO-GO on F1 only, the d110 21-HP leader dying next round,
  the 22–25/round focused-damage rate that the projection
  diagnostic uses) + its frozen prereg.
- `evidence/2026-11-21/sim-doorflee2-b.md` (§§5, 6 S7, 7, 8 —
  the NO-GO on F1 only, the 6-hold ledger, the "~25 HP" gate
  suggestion, the metric review ADOPTED here) + its frozen
  prereg.
- `docs/MEASUREMENT.md` §§9–12, 14–15 (staged method, metric
  binding, §14a kill taxonomy, balanced panels).
- `~/workspace/custom-skills/local_seed_band_freshness/SKILL.md`
  — the full freshness search is recorded above (preregs + all
  evidence .md via git grep, zero hits; raw JSON matches are
  numeric fragments, not namings).
- The scalemetric deciding cost bar (convergence-tracker.md):
  starvation ≤ control+2 (totals AND arm-only) AND median ≥
  0.8× control median.

## Files

- Prereg: `evidence/2026-11-22/sim-leaderhpgate-b-prereg.md` (this file)
- Instrument: `scripts/pinquaddoor-driver-b.js` (leaderhpgateFlag +
  leaderhpgateFires + gateAvoidNotes stamps + leaderEntryHp row
  field + legs-log line),
  `scripts/analyze-pinquaddoor-b.js`,
  `scripts/analyze-leaderhpgate-b.js` (NEW — per-door bars D1/D2
  + S8b/S9/S10 censuses, selftest 24/24),
  `scripts/test-allyslot3-b.js`, `scripts/test-pinquaddoor-b.js`,
  `scripts/test-pinquaddoor-wide-b.js`, `scripts/test-dmgpin-b.js`,
  `scripts/test-doorflee2-b.js`, `scripts/test-downedtwice-b.js`,
  `scripts/test-hypofloor-b.js`, `scripts/test-hpgate-b.js`,
  `scripts/test-leaderhpgate-b.js` (M3h, NEW, 50 checks),
  `scripts/build-pinquaddoor-b-panels.js`,
  `scripts/fixtures/dmgpin-b-s106722-control.json`,
  `scripts/fixtures/dmgpin-b-s106722-armed.json`
- Probe corpora (pre-freeze substrate/pool check, control config):
  `evidence/2026-11-22/perseed-leaderhpgate-b-probe/` + probe logs
  `leaderhpgate-b-probe-chunk1.log`, `leaderhpgate-b-probe-chunk2.log`
- Corpora (fresh, judged): `evidence/2026-11-22/perseed-leaderhpgate-b-control/`
  (8 files) + `evidence/2026-11-22/perseed-leaderhpgate-b-armed/`
  (8 files)
- Analysis: `evidence/2026-11-22/leaderhpgate-b-analysis.json`
  (analyzer --json over both corpus dirs) + `leaderhpgate-b-panel.md`
  + panel JSONs
- Evidence: `evidence/2026-11-22/sim-leaderhpgate-b.md`
- Leg log: `evidence/2026-11-22/leaderhpgate-b-legs.log`
- `src/` diff: the LEADERHPGATE lever in `src/js/villager-agency.js`
  only (+45/−0). No default flip.
