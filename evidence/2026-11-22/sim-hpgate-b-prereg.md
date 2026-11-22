# sim-hpgate-b — FROZEN prereg (Loop B run fleshout-loop-b-20261122T0930Z)

**Frozen:** 2026-11-22 ~10:45 UTC, BEFORE any judged sim. Base master
`4681e740f` (full `4681e740f89ae76adb00d14bebd35668e587ee19`,
"sim-hypofloor-b: hypo floor for pinned-door flee — NO-GO on F1").
Branch `sim-hpgate-b`, worktree `~/workspace/worktrees/sim-hpgate-b`.
Run `fleshout-loop-b-20261122T0930Z`, arm `sim-hpgate-b` (the HP-GATE:
HP-gating door parties — the named next input from the
doorflee2/hypofloor line, finding #2619 kill conversion).

## The question (finding #2619, next step after the hypofloor NO-GO)

The hypofloor pilot proved the floor mechanically live but unexercised
by its band's flees: armed 2/6 vs control 2/6 (0.0pp), both flees
early leader-hurting flees at rounds 2–3, not the pooled-negative-HP
drag the floor is built for. Its §4 names the shape precisely: the
107314 d110 flee is a leader at 21 HP dying next round (monster hits
22–25 a round), and §10 names the next arm verbatim: "HP-gating door
parties. Don't take near-dead leaders to doors." This arm builds it.

## The mechanism (read from the sources, not taken on trust)

Door parties form at the door-open decision in
`src/js/villager-agency.js` `expeditionMonster`: the pinned trio
(`pinnedQuadAllies`, written at launch by `pinQuadParty` in the same
file) is matched against the sensed allies, and only a FULL pinned
trio opens the door (`_pinDoor`, allyFromStart). The evidence's
near-dead members are near-dead AT THE DOOR, not at launch — the
106809 ally3 entered at 3 HP after being hurt in the same day's
earlier door (doorflee-b §6 S7) — so the gate is read at the
door-open decision, not at launch: a launch-time gate cannot catch
the exhibit cases. When the gate fires the party gives the monster
room — the existing avoid verb in the same function (`_wpg.avoid`:
encounter note + return, no fight) — not a fight relabelled: no
fight, no flee, no death.

## The floor (derived from the evidence, not guessed)

**Floor: 25 HP, strict (`< 25` refuses), whole party (leader + all
three pinned allies), read live at the door.**

- **25 HP = one round of focused wave-4 damage.** Hypofloor-b §4:
  the d110 monster hits Walkout 23, 22, 25 a round, all on the
  leader; the leader at 21 HP "dies next round". MONSTER-WAVES.md
  wave-4 bands: damage 35–95, HP 850–1500, "a 4-6 round fight".
  A member below 25 HP is inside one round of death — they cannot
  survive even the first exchange of a 4–6 round door fight, let
  alone the kill horizon.
- **The number is the prior arms' named number.** Doorflee2-b §7:
  "a pin that refuses a member below ~25 HP would stop the 25/26-HP
  leaders who still walk into doors and die there". This arm takes
  that number literally.
- **Coverage (whole party, not leader-only):** the original exhibit
  is an ALLY — the 106809 third ally at 3 HP (doorflee-b §6 S7;
  9 HP armed) — and the leaders at 21/25/26 HP (hypofloor-b §4;
  doorflee2-b §6 S7). A leader-only gate lets the 3-HP ally
  through. The gate covers leader + all three pinned allies.
- **The edge cases stay, and are counted.** The 25-HP leader
  (doorflee2-b 106830 d98 influencer, fled R1) and the 26-HP leader
  (106820 d46 eater, died the next day) sit AT the line: strict
  `< 25` refuses neither. That is the documented cost of taking the
  evidence's number rather than padding it — S7 counts sub-25 doors
  on both legs, and the 25/26-HP doors remain visible in the door
  table for the next arm.

## The lever (HPGATE) — built, env-gated OFF by default

In `src/js/villager-agency.js` `expeditionMonster` (+43/−0, one
file), after the `_pinDoor` computation and before `fieldFight`:

- **Gate (computed once, at the door):** `HPGATE=1` in env AND
  `_pinDoor` true (full pinned trio, allyFromStart) AND wave ≥ 4
  AND any of the four (leader + pinned trio) has live HP < 25 in
  `state.village.health` (missing entry defaults 100, the
  established default). In the browser `process` is undefined, so
  the flag is never on there.
- **Action (the avoid verb):** the agency-state counter
  `st.hpgateFires` increments (the driver census), an encounter
  note is pushed ("gave <mid> room — <Name> is too hurt to hold a
  door (<hp> HP)", mirroring the `_wpg.avoid` note shape), and the
  function returns — no fight, no flee, no death. The monster
  meeting is consumed; the expedition continues; a later door
  meeting re-checks live HP. The gate fires regardless of the
  win-plan seek flag: HP is a hard floor, not a preference.
- **Considered and NOT built:** (a) launch-time gating — cannot
  catch the evidence (members are hurt en route / in earlier
  doors the same day); (b) swapping a below-floor member for a
  healthy villager — no replacement pool exists at door time (the
  pin IS the commitment; the sense returns whoever is standing
  together), so the gate refuses the door rather than inventing a
  member; (c) fighting on as a regular (unpinned) fight when the
  gate refuses — that would spend the same flee/death uncounted,
  denominator surgery, not a fix.
- **Untouched:** learn-first withdrawal, death, the 5% winning
  floor, signature exits, sealed arenas, solo/non-door/shout-ladder
  fights, the DOORFLEE2 hold, the HYPOFLOOR pool floor, and every
  fight with the flag off (no RNG is drawn — verified by the proof
  test's §0 source check; off-mode is byte-identical: the healthy
  door fight is identical with the flag on vs off).
- **Scope decision (recorded, not assumed):** the gate is
  door-scoped on the pinned-door terms, not global. A hurt villager
  may still fight a wave-1/2/3 monster or a non-door wave-4
  meeting; this arm's question is the door kill conversion and its
  bars are door-priced. Widening the scope is a later arm's call,
  with its own bars.

Canon grounding: MONSTER-WAVES.md wave-4 bands (HP 850–1500,
damage 35–95, pierce 0.2–0.5; "a 4-6 round fight for a godhood
build (~220 dmg/round)"). No canon doc prices a morale read, a
hypothetical-HP floor, a commitment hold, or an HP gate — the gate
is a sim lever to test whether taking near-dead members to doors is
the binding constraint, judged on flee rate + kills; landing it as
a game change would still be a Steve/design call, not this arm's.
The lever stays env-gated / default-OFF exactly as built — NO
default flip in this arm.

## Design — paired pilot on a fresh band

**Band (FRESH):** 107351, 107352, 107353, 107354, 107355, 107356,
107357, 107358. Both legs are FRESH runs on this arm's tree.

**Seed-band freshness check (recorded at freeze, per
`~/workspace/custom-skills/local_seed_band_freshness/SKILL.md`):**
grep over ALL `evidence/*/sim-*-prereg.md` for each of the 8 seeds
— ZERO hits for every seed. Grep over ALL `evidence/` `*.md` for
each seed — ZERO hits for every seed. (The hypofloor prereg's
caveat applies: 6-digit strings can occur inside float fragments
in old measurement JSONs — numeric fragments, not a naming of the
band in any prereg, forbidden/contaminated list, screen, or
extension band.) Band is FRESH; no collision, no correction needed.

**Band screening (the §14b pool-sizing probe — recorded, not hidden):**
three earlier fresh bands were probed with the control config and
REJECTED for failing pool sizing, before this band was frozen.
They are named here so the next worker does not repeat them:

- 107321–107328 (full 8-seed probe, `perseed-hpgate-b-probe`):
  10 door meetings, 3 fought doors (all vKill), 0 flees, 0
  sub-floor doors (min entry HP 48). F1 unmeasurable (control flee
  rate 0/3) and the gate's pool empty. REJECTED.
- 107331–107338 (4-seed probe, then abandoned): 0 door meetings
  in 4 seeds, pinFights 0 on all 4. REJECTED.
- 107341–107348 (2-seed screen, then abandoned): pinFights 0 on
  both seeds. REJECTED.
- 107351–107358 (CHOSEN): 10 door meetings, 4 fought doors
  (1 vFlee, 3 vKill), 1 sub-floor door — 107352 d57 reunion, ally2
  entered at 23 HP, fled R2. The full probe table is in the
  evidence file (§3). The band is THIN (n=4 fought doors) and the
  verdict turns on a single door — stated here before freezing, not
  discovered after.

**Probe determinism tripwire:** the probe ran the control config
on this band (8 seeds, 0 instrument errors, anchor `4681e740f`,
policySha `1884c8852d38`). The judged control leg re-runs the same
seeds under the same config and MUST reproduce the probe's door
table (4 fought, 1 flee, 3 fresh kills) — the sims are seeded and
deterministic. If the judged control differs from the probe, STOP
and investigate (the code moved under the run); do not judge the
armed leg against a drifted control.

- **Control leg:** substrate + `DOORFLEE2=1 HYPOFLOOR=1` (the
  hypofloor ARMED configuration, re-run fresh on current master).
  Expect the probe shape on this band (4 fought doors, 1 vFlee, 3
  fresh kills) — report this band's own numbers; do not force a
  match to the probe beyond the tripwire above.
- **Armed leg:** control flags + `HPGATE=1`, nothing else. Same
  seeds, same policy, same horizon. The only difference between
  the legs is the gate.
- **Substrate flags (both legs):**
  `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1
  LAUNCHSURVIVE=1 ALLYSLOT3=1 PINQUAD=1 DMGPIN=1 DOORFLEE2=1 HYPOFLOOR=1`.
- **Policy frozen:** `scripts/policies/competent.js` sha256
  `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
  (first 12: `1884c8852d38`) — verified live on this base at
  freeze time (and stamped on every probe corpus file).
  IDENTICAL to the dmgpin/doorflee/doorflee2/hypofloor bands.
- **Horizon:** 150d, death-aware (dead villages stop, +10d tail
  max). Same horizon as every prior band in this program.
- **Legs chunked at 4 seeds per call** (a 16-seed single call was
  SIGTERMed before; per-seed files persist across kills; resume,
  never re-run completed seeds. The driver refuses to overwrite,
  exit 3).
- **Driver env:** `EVIDENCE_DATE=2026-11-22
  CORPUS_PREFIX=hpgate-b RUN=hpgate-b
  OUTDIR=perseed-hpgate-b-control` / `...-armed` (+
  `HPGATE=1` armed only). Corpus files
  `hpgate-b-s<seed>-hpgate-b-pinquaddoor.json`.
- **Confirm rule:** a 12–16-seed confirm runs ONLY if this pilot
  GOes on every bar. A pilot NO-GO spends no confirm seeds.
- **Master movement:** if master moves after the legs start, this
  arm does NOT rebase mid-run — the anchor is frozen at
  `4681e740f` and the legs judge on it; the coordinator merges
  afterward.

## Frozen bars (a miss is NO-GO, never re-scored)

The panel census of wave-4+ encounters (`v4encounters` rows) on
both legs, through the hpgate analyzer
(`scripts/analyze-hpgate-b.js`, selftest green 21/21; the door
definition and freshness judges are reused from
`scripts/analyze-pinquaddoor-b.js` unchanged), plus a node
one-liner over the raw corpora for the door table (the dmgpin
method). The analyzer is the hypofloor analyzer with the flag
renamed (`hypofloorFlag` → `hpgateFlag`, B4 now also requiring
`hypofloorFlag` '1' on BOTH legs) + the gate-fire census (S8) and
the avoided-doors census (S9); F1 stays priced on the flee RATE
with the count secondary and P3 on TOTAL damage per door (the
doorflee2 metric-review adoptions, carried).

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
- (M3g) **Gate proof** (`scripts/test-hpgate-b.js`, NEW): 43/43
  on this tree — hurt leader (21 HP) and hurt ally (3 HP) refuse
  the door (no fieldFight, counter 1, narrated note); boundary
  24 refuses / 25 proceeds; healthy door opens; inert without the
  pin, at wave 1, and with the flag off (healthy fight identical
  on vs off); driver smoke green.
- (M4) **Panel bars** (control pin+damage+hold+floor vs armed
  +HPGATE, same seeds, same policy):
  - (F1) **Flee, PRIMARY (repriced):** armed flee rate ≤
    control flee rate − 20pp, on fought doors. The flee COUNT
    is reported as a secondary only (both legs' counts in the
    table) — it does not pass or fail the bar.
  - (P2) **Door kills, non-regression:** armed FRESH door kills
    ≥ control fresh door kills (roundsDetail-derived entry HP ≥
    500, same re-registered freshness as dmgpin P1: NEVER on
    `mHpStart`; dealt bound + `mHpStartRec` cross-checks).
  - (P3) **Damage guard (repriced):** armed TOTAL damage per
    door/fight ≥ 0.9× control (total dealt on fought doors
    divided by fought doors — NOT per-round; held fights run
    longer and their late rounds deal less by construction).
  - (B1) **Pin delivery:** `b1NonInferiority` — armed
    fought-subset ally3Vid rate ≥ control rate − 10pp AND ≥ 3
    armed ally3Vid rows.
  - (B2) **ally3Dealt:** armed total `ally3Dealt` > 0 AND at
    least one armed fight with `ally3Dealt` ≥ 10 (pinned wave-4+
    subset, same as dmgpin).
  - (B3a) **Kill conversion (non-inferiority):** armed
    corpus-wide vKill rate on wave-4+ ≥ control rate − 2pp.
  - (B4) **Substrate sanity:** every control corpus file carries
    `hpgateFlag` null AND `hypofloorFlag` '1' AND `doorflee2Flag`
    '1' AND `dmgpinFlag` '1' AND `pinquadFlag` '1'; every armed
    file carries `hpgateFlag` '1' AND `hypofloorFlag` '1' AND
    `doorflee2Flag` '1' AND `dmgpinFlag` '1' AND `pinquadFlag`
    '1'; every corpus file carries `hpgateFires` as a number AND
    `anchorCommit` equal to the frozen base (§"Anchor rule") and
    `policySha` `1884c8852d38`.
  - **SUPPLY rule (frozen):** if the CONTROL leg yields fewer
    than 4 fought doors, the verdict is NO-GO kind SUPPLY-THIN,
    not a lever failure. If the control leg yields ZERO flees,
    F1 is unmeasurable and the verdict is likewise SUPPLY-THIN.
    (Probe says 4 fought / 1 flee — neither clause should
    trigger; they are pre-registered for the judged legs, which
    must reproduce the probe per the tripwire above.)
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
  conversions + gate fires), wall numbers, a sense-test transcript
  read (at least two fought doors quoted blow-by-blow — if a gate
  avoid happens, quote the avoided meeting's note and the nearest
  fought door), the diag table (§1 of the doorflee evidence), the
  balanced-panel compare output attached, and a metric-review
  section; corpora under
  `evidence/2026-11-22/perseed-hpgate-b-control/` and
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
  the gate's candidate effect; reported, never proof on its own).
- (S3) Leader-death census: `vDie` doors per leg + the leader HP
  at death. The priced ledger per converted door (kills / later
  flees / leader deaths / avoids) is the verdict's core.
- (S4) Pin-subset B1 rate (wave-4+ and all-waves, fought subset).
- (S5) Door-fight table: every fought door — seed, day, monster,
  rounds, dealt, derived entry HP, outcome, D/round, fleeHpFrac,
  doorHold rounds, party HP at flee time.
- (S6) Wall numbers: wins / national (by scaleRank ≥ 2 AND by
  standing ≥ 200) / table, wave 4–5 unlocks, median survival,
  deaths, villages lost, starvation — control vs armed.
- (S7) Sub-floor census: doors where any party member entered
  below 25 HP, both legs (the gate's own pool — the S7 blank from
  doorflee2, now the lever's question, not a follow-up).
- (S8) Gate-fire census: `hpgateFires` summed per leg (the direct
  evidence the gate fired), plus the avoided meetings' notes.
- (S9) Avoided-doors census: control doors with no armed
  counterpart row (seed/day/monster), named.

## Base + substrate (verified, not assumed)

- Base: master `4681e740f` (full
  `4681e740f89ae76adb00d14bebd35668e587ee19`) at arm start. The
  worktree HEAD at freeze IS the frozen base; the anchor stamped
  on every corpus file is `4681e740f`.
- The substrate (PINQUAD + DMGPIN + DOORFLEE2 + HYPOFLOOR) is ON
  this base: the hypofloor merge `4681e740f` is the HEAD, and the
  only src change between the hypofloor base `68e0503c4` and this
  base is the HYPOFLOOR lever itself (`fieldFights.js` +42/−3;
  `git diff --stat 68e0503c4 4681e740f -- src/`). NO port from the
  held `sim-doorflee-b` / `sim-pinquaddoor-b` branches was needed;
  the gate is a fresh env-gated addition on current master, like
  hypofloor was. The held branches are NOT merged, NOT modified,
  NOT rebased.
- **Policy frozen:** `scripts/policies/competent.js` sha256
  `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
  (first 12: `1884c8852d38`) — verified live on this base at
  freeze time.
- Substrate flags (both legs):
  `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1
  LAUNCHSURVIVE=1 ALLYSLOT3=1 PINQUAD=1 DMGPIN=1 DOORFLEE2=1 HYPOFLOOR=1`.
  Armed leg adds `HPGATE=1` only.
- The lever's exact identity is recorded alongside the anchor:
  `src/js/villager-agency.js` diff +43/−0 (HPGATE gate + avoid in
  `expeditionMonster`), `node --check` green, no other `src/`
  file touched by this arm's lever. Driver diff +16/−2 (stamp
  only: `hpgateFlag` + `hpgateFires`).

## Anchor rule (the poolfirstfail lesson, frozen)

- The driver stamps `anchorCommit` as `git rev-parse HEAD` at
  load time. The FROZEN BASE is master `4681e740f` (full
  `4681e740f89ae76adb00d14bebd35668e587ee19`). **Nothing is
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
  (hypofloor arm's version); this arm's adaptation ONLY: the
  corpus stamp gains `hpgateFlag: process.env.HPGATE || null`
  and `hpgateFires` (the agency-state counter read at end of run,
  0 when the gate never fires or the flag is off) and the per-seed
  legs-log line gains both. `doorHold` / `everHopeless` row fields
  already present. No other driver behavior changes; the M2w
  wide test (which asserts the driver defaults) re-runs green
  on the edited copy.
- Analyzer: `scripts/analyze-pinquaddoor-b.js` — on master
  already, copied verbatim (exports `deriveDoorEntryHp` /
  `dealtBound` / `freshDoorKill` / `b1NonInferiority` /
  `isDoorFight` unchanged). No changes.
- HP-gate analyzer: `scripts/analyze-hpgate-b.js` — the hypofloor
  analyzer with only the flag renamed (`hypofloorFlag` →
  `hpgateFlag`, B4 now also requiring `hypofloorFlag` '1' on BOTH
  legs) + the gate-fire census (S8) + the avoided-doors census
  (S9); its own selftest stays green (21/21, run pre-freeze in
  development — re-run post-freeze as a frozen bar).
- Proof tests: `scripts/test-allyslot3-b.js` (M1),
  `scripts/test-pinquaddoor-b.js` (M2),
  `scripts/test-pinquaddoor-wide-b.js` (M2w),
  `scripts/test-dmgpin-b.js` (M3),
  `scripts/test-doorflee2-b.js` (M3d),
  `scripts/test-downedtwice-b.js` (M3e),
  `scripts/test-hypofloor-b.js` (M3f) — on master already,
  run verbatim;
  `scripts/test-dmgpin-reprereg-b.js` (carried, not a frozen bar
  here), `scripts/test-dmgpin-scout-b.js` (carried, not a frozen
  bar here);
  `scripts/test-hpgate-b.js` (M3g, NEW).
- Fixtures (read-only copies of prior judged data, for the
  proofs only — never judged data in this arm):
  `scripts/fixtures/dmgpin-b-s106722-control.json` and
  `...-armed.json` (same shas as the dmgpin prereg).
- Panel: `scripts/build-pinquaddoor-b-panels.js` — on master
  already, run verbatim as
  `RUN=hpgate-b CORPUS_PREFIX=hpgate-b node
  scripts/build-pinquaddoor-b-panels.js --out
  evidence/2026-11-22/hpgate-b-panel --before
  evidence/2026-11-22/perseed-hpgate-b-control --after
  evidence/2026-11-22/perseed-hpgate-b-armed --seeds
  107351,107352,107353,107354,107355,107356,107357,107358
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
  pre-freeze was 43/43; the post-freeze run is the judged one).
- Analyzer selftest `analyze-hpgate-b.js --selftest`
  (target: 21/21 green).

## Expectation (not a bar)

Control (pin+damage+hold+floor, no gate) should reproduce the
probe on this band: 4 fought doors (1 vFlee, 3 vKill, all fresh),
10 door meetings, 1 sub-floor door (107352 d57 reunion, ally2 at
23 HP, fled R2). The pilot GOes on F1 iff the gate avoids that
one flee (armed 0 flees on its fought doors) and no new armed
flee appears — the verdict turns on a single door, which is why
the band is called THIN in the prereg and why S8/S9 (gate fires,
avoided doors) carry the mechanism story either way. If the armed
leg's `hpgateFires` is 0, the gate never engaged on this band and
the NO-GO is a pool story, not a concept story. If the gate fires
but F1 still misses, the next arm's question is whether the flee
is the P4 misread (doorflee2's mechanism) rather than the HP
shape — the gate and the hold attack different halves of the
flee, and this pilot prices only the HP half.

## Legs log + evidence discipline

- Legs tee to `evidence/2026-11-22/hpgate-b-legs.log`
  (one JSON line per seed + EXIT lines; fallback recovery).
  The lever diff, the fixture copy shas, and the proof counts
  are recorded there.
- Evidence: `evidence/2026-11-22/sim-hpgate-b.md` (verdict,
  frozen-bar table, door-fight table with flee rounds + party
  state + doorHold + conversions + gate fires, wall numbers,
  sense-test transcript read, metric review) + `hpgate-b-panel.md`
  + panel JSONs + analysis JSON (analyzer --json over each
  corpus dir).
- `check.js --quick`: attempted once after any src change, but
  SERIALIZED — pgrep for any running check.js first and wait
  until none is running; never run two concurrently. (The
  proof tests are plain node, not jest, so they run without
  adding a jest process.)
- Write flap: intermittent EPERM on fresh-file writes is active
  this week (a `git status --short` hung ~90s+ at arm start; the
  06:32Z window hit the hypofloor arm mid-run). Probes run before
  writes that matter (scratch write + `git hash-object -w`
  verified 10:09Z, PROBE_OK); the driver uses write-robust
  paths; a blocked final commit leaves files on disk intact
  for coordinator adoption, never forced.
- Git slowness: index-touching git commands can run minutes
  under hot-tree load. Prefer commit-to-commit reads (`git show` /
  `git diff <commit> <commit>`) and plain `grep`/`diff`, which
  stay fast.
- VM replacement: the VM was replaced ~09:31Z today (uptime 10
  min at 09:41Z). If a process dies or the machine restarts under
  this run, re-establish state from disk and report it — do not
  redo finished work silently.

## Metric review (adopted from doorflee2 §8 / hypofloor — this run is judged as frozen)

- F1 is priced on the flee RATE with the count as a secondary
  (the armed leg may fight more doors; a count bar punishes the
  lever for reaching more doors).
- P3 is priced on TOTAL damage per door/fight, not per round
  (longer held fights dilute per-round damage by construction).
- The effect metric is conversions (flee→kill, flee→later-flee)
  PLUS avoids (control door with no armed counterpart), not hold
  rounds (3 of DOORFLEE2's 6 holds changed nothing observable —
  a hold can fire on a round where no flee was imminent).
- The door-line order quirk (door lines print 2, 3, 1) persists
  in the ported slot code; cosmetic, no bar.
- The pin's near-death members are now the LEVER, not a
  follow-up: S7 counts sub-25 doors on both legs as the gate's
  own pool.

## What was read first (do not re-measure what they answered)

- `docs/CANON.md` + `docs/MONSTER-WAVES.md` wave-4 bands (no
  canon doc prices a morale read, a hypothetical-HP floor, a
  commitment hold, or an HP gate — the gate is a sim lever,
  judged on flee rate + kills).
- `evidence/2026-11-21/sim-doorflee-b.md` (§§1, 6 S7, 7 — the
  mechanism, the 3-HP third ally, the HP-gate next step) +
  its frozen prereg.
- `evidence/2026-11-21/sim-doorflee2-b.md` (§§1, 5, 6 S7, 7, 8
  — the NO-GO on F1 only, the 6-hold ledger, the held-kill
  transcript, the "~25 HP" gate suggestion, the metric review
  ADOPTED here) + its frozen prereg.
- `evidence/2026-11-22/sim-hypofloor-b.md` (§§4, 5, 7, 8, 10 —
  the NO-GO on F1 only, the d110 21-HP leader dying next round,
  the door-thin band lesson, the "HP-gating door parties" next
  arm input) + its frozen prereg
  (`sim-hypofloor-b-prereg.md` — the designated-band method,
  the anchor rule, the proof suite, the repriced F1/P3).
- `docs/MEASUREMENT.md` §§9–12, 14–15 (staged method, metric
  binding, balanced panels).
- `~/workspace/custom-skills/local_seed_band_freshness/SKILL.md`
  — the full freshness search is recorded above (preregs + all
  evidence .md, zero hits; three screened bands named with
  their probe numbers).
- The scalemetric deciding cost bar (convergence-tracker.md):
  starvation ≤ control+2 (totals AND arm-only) AND median ≥
  0.8× control median.

## Files

- Prereg: `evidence/2026-11-22/sim-hpgate-b-prereg.md` (this file)
- Instrument: `scripts/pinquaddoor-driver-b.js` (hpgateFlag +
  hpgateFires stamp + legs-log line),
  `scripts/analyze-pinquaddoor-b.js`,
  `scripts/analyze-hpgate-b.js` (NEW — flag rename + S8/S9
  censuses, selftest 21/21),
  `scripts/test-allyslot3-b.js`, `scripts/test-pinquaddoor-b.js`,
  `scripts/test-pinquaddoor-wide-b.js`, `scripts/test-dmgpin-b.js`,
  `scripts/test-dmgpin-reprereg-b.js`,
  `scripts/test-dmgpin-scout-b.js`,
  `scripts/test-doorflee2-b.js`, `scripts/test-hypofloor-b.js`,
  `scripts/test-hpgate-b.js` (M3g, NEW, 43 checks),
  `scripts/build-pinquaddoor-b-panels.js`,
  `scripts/fixtures/dmgpin-b-s106722-control.json`,
  `scripts/fixtures/dmgpin-b-s106722-armed.json`
- Probe corpora (pre-freeze substrate/pool check, control config):
  `evidence/2026-11-22/perseed-hpgate-b-probe/` (22 files:
  bands 107321–107328, 107331–107334, 107341–107342,
  107351–107358) + probe logs `hpgate-b-probe-chunk1.log`,
  `hpgate-b-probe-chunk2.log`, `hpgate-b-probe2-chunk1.log`,
  `hpgate-b-probe3-screen.log`, `hpgate-b-probe4-screen.log`,
  `hpgate-b-probe4-chunk1.log`, `hpgate-b-probe4-chunk2.log`
- Corpora (fresh, judged): `evidence/2026-11-22/perseed-hpgate-b-control/`
  (8 files) + `evidence/2026-11-22/perseed-hpgate-b-armed/`
  (8 files)
- Analysis: `evidence/2026-11-22/hpgate-b-analysis.json`
  (analyzer --json over both corpus dirs) + `hpgate-b-panel.md`
  + panel JSONs
- Evidence: `evidence/2026-11-22/sim-hpgate-b.md`
- Leg log: `evidence/2026-11-22/hpgate-b-legs.log`
- `src/` diff: the HPGATE lever in `src/js/villager-agency.js`
  only (+43/−0). No default flip.
