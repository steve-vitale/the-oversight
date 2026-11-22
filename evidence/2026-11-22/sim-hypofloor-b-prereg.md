# sim-hypofloor-b — FROZEN prereg (Loop B run fleshout-loop-b-20261122T0530Z, arm 1 of 2)

**Frozen:** 2026-11-22 ~06:56 UTC, BEFORE any judged sim. Base master
`68e0503c4` (full `68e0503c4f22fbac4585dc323dc2ef54a099440c`,
"Journey establishment r265: adoption gate 3 record (339/5, 0
attributable) + closeout rebase note"). Branch `sim-hypofloor-b`,
worktree `~/workspace/worktrees/sim-hypofloor-b`. Run
`fleshout-loop-b-20261122T0530Z`, arm `sim-hypofloor-b` (the
HYPO-FLOOR + DOORFLEE2 hold: the next step after the doorflee2
NO-GO, finding #2619 kill conversion).

## Base discrepancy (recorded at freeze, NOT amended post-hoc)

The run brief states the base master at spawn as `e67224635`
(Loop A 0215Z adoption round record). The worktree's actual HEAD
at arm start is `68e0503c4`, exactly ONE commit behind:
`e67224635` is one commit ahead of `68e0503c4` (`git rev-list
--count HEAD..e67224635` = 1, `e67224635..HEAD` = 0) and the
single delta commit touches ONE file only —
`evidence/2026-11-22/sim-winnability-round-0215.md` (246
insertions, evidence-only, no `src/` change). The frozen base for
this arm is therefore the actual worktree HEAD `68e0503c4`, and
the anchor stamped on every corpus file is `68e0503c4`. The
one-commit difference is a round record, not game code; no
rebase is performed mid-run (anchor rule below).

## The question (finding #2619, next step after the doorflee2 NO-GO)

The doorflee2 pilot proved the hold safe (0 hold deaths, M5
passes) but too weak: armed 9 flees on 16 fought doors vs
control 8 on 11 — the flee rate drops only 16.5pp against a
20pp bar, and the stricter guard fires on only 6 of 16 doors.
The guard passes only where the leader's trajectory is already
comfortable, which is exactly where the quad was likeliest to
win anyway. The flee that matters is the one where the leader
is hurting and the party is still winning; the guard releases
there by design. The doorflee2 evidence §7 names the next step:
attack the flee at its SOURCE (the misread) rather than at its
consequence (the decision) — floor each fighter's hypothetical
HP at 0 in the P4 pool, COMBINED with the hold.

## The mechanism (read from the sources, not taken on trust)

`evidence/2026-11-21/sim-doorflee-b.md` §1 and
`evidence/2026-11-21/sim-doorflee2-b.md` §1, verified live in
`src/js/fieldFights.js` on this base (morale read now
~2729-2810; the prereg's ~2537-2610 line numbers drifted): the
morale read replays the fight at imagined protection 4 while
monster damage stays real (~3x real damage), so a winning quad
reads as hopeless and runs; 15/18 dmgpin flees were winning on
live numbers. `rtd = vHpHypo/mDpr`; `hopeless = rtd < rtk*0.85`;
the party pools hypothetical ally HP, so one fighter's
deeply-negative hypothetical HP drags the whole pool negative.
The record fields already floor the same hypothetical HP at 0
for reporting (`rec.vHpHypoLeft = Math.max(0, vHpStart -
rec.vTakenP4)`, ~line 3363, with floored ally fields beside
it) — the decision pool is the one place the floor is missing.

## The lever (HYPOFLOOR) — built, env-gated OFF by default

Floor each fighter's hypothetical HP at 0 in the P4 pool,
COMBINED with the DOORFLEE2 hold (already on master, merged
`4266e6cce` — verified ancestor of this base; NO port from the
held `sim-doorflee-b` branch; built on master directly).
In `src/js/fieldFights.js` (diff: +42/−3, one file):

- **Gate (computed once, beside DOORFLEE2, same terms):**
  `HYPOFLOOR=1` in env AND wave ≥ 4 AND `opts.allyFromStart`
  AND the full pinned trio matches `pinnedQuadAllies(vid)` (a
  trio that joins later through the shout ladder never
  qualifies). Independent of DOORFLEE2: its own flag, so the
  proof can isolate the floor from the hold. In the browser
  `process` is undefined, so the flag is never on there.
- **Floor (in the morale read, `hypoFloorQuad` only):** the
  leader's `vHpHypo` floors at 0 (`if (hypoFloorQuad &&
  vHpHypo < 0) vHpHypo = 0`) and each ally term floors at 0
  (`Math.max(0, allyEntryHp - rec.allyTakenP4)` and the ally2 /
  ally3 equivalents). The P4 incoming RATE is untouched (still
  ~3x real — the doorflee-b §1 caution stands: the floor ALONE
  was estimated insufficient, 106830 d105 floored rtd ~7.8 vs a
  9.7-round kill horizon) — that is why the floor ships
  COMBINED with the hold, not alone. The hold still catches
  the fights that read hopeless even floored.
- **Untouched:** learn-first withdrawal, death, the 5% winning
  floor, signature exits, sealed arenas, solo/non-door/shout-
  ladder fights, the DOORFLEE2 hold's own live-race re-read,
  and every fight with the flag off (no RNG is drawn — verified
  by the proof test's §0 source check; off-mode is
  byte-identical).
- **Scope decision (recorded, not assumed):** the floor is
  door-scoped on the DOORFLEE2 gate terms, not global. The
  misread exists in every fight, but this arm's question is
  the door kill conversion and its bars are door-priced; a
  global floor would move morale in fights no bar prices.
  Widening the scope is a later arm's call, with its own bars.
- HP-gating door parties is the NEXT arm after this one, not
  part of it (doorflee2 §7 / S7 blank).

Canon grounding: MONSTER-WAVES.md wave-4 bands (HP 850–1500,
damage 35–95, pierce 0.2–0.5; "a 4-6 round fight for a godhood
build (~220 dmg/round)"). No canon doc prices a morale read,
a hypothetical-HP floor, or a commitment hold — the floor +
hold is a sim lever to test whether the flee is the binding
constraint, judged on flee rate + kills; landing it as a game
change would still be a Steve/design call, not this arm's.
The lever stays env-gated / default-OFF exactly as built — NO
default flip in this arm.

## Design — paired pilot on a fresh band

**Band (FRESH):** 107311, 107312, 107313, 107314, 107315,
107316, 107317, 107318. Both legs are FRESH runs on this
arm's tree.

**Seed-band freshness check (recorded at freeze, per
`~/workspace/custom-skills/local_seed_band_freshness/SKILL.md`):**
grep over ALL `evidence/*/sim-*-prereg.md` (1100 files) for
each of the 8 seeds — ZERO hits for every seed. Grep over ALL
`evidence/` `*.md` (6378 files) for each seed — ZERO hits for
every seed. A supplementary grep over `evidence/` `*.json`
finds each 6-digit string inside OLD measurement corpora only
(e.g. `107311` inside the kcal float `22349.107311423355` in
`evidence/2026-10-18/armorstock2-panel-compare.json`;
`107312`–`107318` likewise inside float fragments / case
hashes in 2026-10/11 panel and sweep JSONs) — numeric
fragments in measurement data, not a naming of the band in any
prereg, forbidden/contaminated list, screen, or extension band.
Band is FRESH; no collision, no correction needed.

- **Control leg:** `PINQUAD=1 ALLYSLOT3=1 DMGPIN=1 DOORFLEE2=1`,
  HYPOFLOOR unset (the doorflee2 ARMED configuration, re-run
  fresh on current master). Expect the doorflee2 armed shape
  on the designated band (~16 fought doors, ~9 vFlee, ~6 fresh
  kills) — but this band is fresh, so report this band's own
  numbers; do not force a match.
- **Armed leg:** control flags + `HYPOFLOOR=1`, nothing else.
  Same seeds, same policy, same horizon. The only difference
  between the legs is the floor.
- **Substrate flags (both legs):**
  `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1
  LAUNCHSURVIVE=1 ALLYSLOT3=1 PINQUAD=1 DMGPIN=1 DOORFLEE2=1`.
- **Policy frozen:** `scripts/policies/competent.js` sha256
  `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
  (first 12: `1884c8852d38`) — verified live on this base at
  freeze time. IDENTICAL to the dmgpin/doorflee/doorflee2 bands.
- **Horizon:** 150d, death-aware (dead villages stop, +10d tail
  max). Same horizon as every prior band in this program.
- **Legs chunked at 4 seeds per call** (a 16-seed single call was
  SIGTERMed before; per-seed files persist across kills;
  resume, never re-run completed seeds. The driver refuses to
  overwrite, exit 3).
- **Driver env:** `EVIDENCE_DATE=2026-11-22
  CORPUS_PREFIX=hypofloor-b RUN=hypofloor-b
  OUTDIR=perseed-hypofloor-b-control` / `...-armed` (+
  `HYPOFLOOR=1` armed only). Corpus files
  `hypofloor-b-s<seed>-hypofloor-b-pinquaddoor.json`.
- **Confirm rule:** a 12–16-seed confirm runs ONLY if this pilot
  GOes on every bar. A pilot NO-GO spends no confirm seeds.
- **Master movement:** if master moves after the legs start, this
  arm does NOT rebase mid-run — the anchor is frozen at
  `68e0503c4` and the legs judge on it; the coordinator merges
  afterward.

## Frozen bars (a miss is NO-GO, never re-scored)

The panel census of wave-4+ encounters (`v4encounters` rows) on
both legs, through the hypofloor analyzer
(`scripts/analyze-hypofloor-b.js`, selftest green; the door
definition and freshness judges are reused from
`scripts/analyze-pinquaddoor-b.js` unchanged), plus a node
one-liner over the raw corpora for the door table (the dmgpin
method). The analyzer is the doorflee2 analyzer with the flag
renamed (`doorflee2Flag` → `hypofloorFlag`, B4 now also
requiring `doorflee2Flag` '1' on BOTH legs) and the two
repriced items from the doorflee2 metric review ADOPTED here:
F1 priced on the flee RATE with the count secondary; P3 priced
on TOTAL damage per door/fight, not per round. The effect
metric is conversions (flee→kill / flee→later-flee), NOT hold
rounds (doorflee2 §8: 3 of 6 holds changed nothing observable).

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
- (M3f) **Floor proof** (`scripts/test-hypofloor-b.js`, NEW):
  staged control flees / armed converts or holds-to-kill;
  inert when HYPOFLOOR unset; inert without the pin, at wave 1,
  off the door; no RNG drawn when off; off-mode byte-identical
  (staged control reproduces the doorflee2 staged numbers
  exactly with the flag unset).
- (M4) **Panel bars** (control PIN+DMGPIN+DOORFLEE2 vs armed
  +HYPOFLOOR, same seeds, same policy):
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
    `hypofloorFlag` null AND `doorflee2Flag` '1' AND `dmgpinFlag`
    '1' AND `pinquadFlag` '1'; every armed file carries
    `hypofloorFlag` '1' AND `doorflee2Flag` '1' AND `dmgpinFlag`
    '1' AND `pinquadFlag` '1'; every corpus file carries
    `anchorCommit` equal to the frozen base (§"Anchor rule") and
    `policySha` `1884c8852d38`.
  - If either leg yields ZERO fought door fights, the verdict is
    NO-GO kind SUPPLY-THIN, not a lever failure.
- (M5) **Guardrail — no regression:** the balanced-panel compare
  returns `review_required` with NO `regression_signal` on
  village deaths / deaths-per-100d. (This is the bar that prices
  the hold's known death mode and the floor's — a lever that
  converts flees to leader deaths fails here.)
- (M6) **Deliverable:** evidence file with the frozen-bar table,
  the door-fight table (every fought door, both legs, with flee
  round + party state at flee time + doorHold rounds +
  conversions), wall numbers, a sense-test transcript read (at
  least one door fight quoted blow-by-blow; if a door kill
  happens, quote that fight blow-by-blow), the diag table (§1 of
  the doorflee evidence), the balanced-panel compare output
  attached, and a metric-review section; corpora under
  `evidence/2026-11-22/perseed-hypofloor-b-control/` and
  `...-armed/`.

A miss on any of M1–M5 is NO-GO, never re-scored against a
friendlier metric. If the metric proves wrong, write it under
"metric review" and propose the revision for the NEXT run.

## Secondary (REPORTED, not binding — do not re-score the primaries)

- (S1) Hold census: `doorHold` rounds per leg, fights with a hold,
  `everHopeless` fights per leg — did the hold fire where the P4
  read said hopeless, and did the floor starve it (fewer
  hopeless reads)?
- (S2) **Conversion census (the effect metric):** matched-seed
  door pairs (same seed + day + monster): control vFlee →
  armed vKill (conversion), control vFlee → armed vFlee at a
  later round (later-flee), control vFlee → armed identical
  (no-change). The conversion count is the lever's bite; hold
  rounds are not.
- (S3) Leader-death census: `vDie` doors per leg + the leader HP
  at death (the hold's cost mode, counted, not waved away). The
  priced ledger per converted door (kills / later flees /
  leader deaths) is the verdict's core.
- (S4) Pin-subset B1 rate (wave-4+ and all-waves, fought subset).
- (S5) Door-fight table: every fought door — seed, day, monster,
  rounds, dealt, derived entry HP, outcome, D/round, fleeHpFrac,
  doorHold rounds, party HP at flee time.
- (S6) Wall numbers: wins / national / table, wave 4–5 unlocks,
  median survival, deaths, villages lost, starvation — control vs
  armed.
- (S7) The diag's second finding (near-death members pinned into
  doors) — count doors where any party member entered below 25 HP,
  both legs, for the follow-up blank (HP-gating is the NEXT arm,
  not this one). Recorded as a finding, NOT expanded into
  HP-gating here.

## Base + substrate (verified, not assumed)

- Base: master `68e0503c4` (full
  `68e0503c4f22fbac4585dc323dc2ef54a099440c`) at arm start.
  The brief's stated spawn base `e67224635` is one commit ahead
  and differs by ONE evidence-only file (see "Base discrepancy"
  above); the anchor is the actual HEAD.
- DOORFLEE2 merge `4266e6cce` IS an ancestor of this base
  (verified); `DOORFLEE2` occurs 5× in `src/js/fieldFights.js`
  on this base (gate ~1552-1570, hold ~2814-2860).
- **Policy frozen:** `scripts/policies/competent.js` sha256
  `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
  (first 12: `1884c8852d38`) — verified live on this base at
  freeze time.
- Substrate flags (both legs):
  `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1
  LAUNCHSURVIVE=1 ALLYSLOT3=1 PINQUAD=1 DMGPIN=1 DOORFLEE2=1`.
  Armed leg adds `HYPOFLOOR=1` only.

## Anchor rule (the poolfirstfail lesson, frozen)

- The driver stamps `anchorCommit` as `git rev-parse HEAD` at
  load time. The FROZEN BASE is master `68e0503c4` (full
  `68e0503c4f22fbac4585dc323dc2ef54a099440c`). **Nothing is
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
- The lever's exact identity is recorded alongside the anchor:
  `src/js/fieldFights.js` diff +42/−3 (HYPOFLOOR gate +
  morale-pool floor), `node --check` green, no other `src/`
  file touched by this arm's lever.

## Instrument (copied from master, adapted only where the flag changes)

- Driver: `scripts/pinquaddoor-driver-b.js` — on master already
  (doorflee2 arm's version); this arm's adaptation ONLY: the
  corpus stamp gains `hypofloorFlag: process.env.HYPOFLOOR ||
  null` (beside `doorflee2Flag`) and the per-seed legs-log line
  gains `hypofloorFlag`. `doorHold` / `everHopeless` row fields
  already present. No other driver behavior changes; the M2w
  wide test (which asserts the driver defaults) re-runs green
  on the edited copy.
- Analyzer: `scripts/analyze-pinquaddoor-b.js` — on master
  already, copied verbatim (exports `deriveDoorEntryHp` /
  `dealtBound` / `freshDoorKill` / `b1NonInferiority` /
  `isDoorFight` unchanged). No changes.
- Hypo-floor analyzer: `scripts/analyze-hypofloor-b.js` — the
  doorflee2 analyzer with only the flag renamed
  (`doorflee2Flag` → `hypofloorFlag`, B4 now also requiring
  `doorflee2Flag` '1' on BOTH legs) + the two repriced bars
  (F1 rate-only with count reported; P3 total damage per door)
  + the matched-pair conversion census (S2); its own selftest
  stays green.
- Proof tests: `scripts/test-allyslot3-b.js` (M1),
  `scripts/test-pinquaddoor-b.js` (M2),
  `scripts/test-pinquaddoor-wide-b.js` (M2w),
  `scripts/test-dmgpin-b.js` (M3),
  `scripts/test-doorflee2-b.js` (M3d),
  `scripts/test-downedtwice-b.js` (M3e) — on master already,
  run verbatim;
  `scripts/test-dmgpin-reprereg-b.js` (carried, not a frozen bar
  here), `scripts/test-dmgpin-scout-b.js` (carried, not a frozen
  bar here);
  `scripts/test-hypofloor-b.js` (M3f, NEW).
- Fixtures (read-only copies of prior judged data, for the
  proofs only — never judged data in this arm):
  `scripts/fixtures/dmgpin-b-s106722-control.json` and
  `...-armed.json` (same shas as the dmgpin prereg).
- Panel: `scripts/build-pinquaddoor-b-panels.js` — on master
  already, run verbatim as
  `RUN=hypofloor-b CORPUS_PREFIX=hypofloor-b node
  scripts/build-pinquaddoor-b-panels.js --out
  evidence/2026-11-22/hypofloor-b-panel --before
  evidence/2026-11-22/perseed-hypofloor-b-control --after
  evidence/2026-11-22/perseed-hypofloor-b-armed --seeds
  107311,107312,107313,107314,107315,107316,107317,107318
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
- M3f `test-hypofloor-b.js` (NEW — target count set by the
  test's own sections; staged floor conversion + inertness +
  off-mode identity).
- Analyzer selftest `analyze-hypofloor-b.js --selftest`
  (target: green).

## Expectation (not a bar)

Control (pin+damage+hold, no floor) should reproduce the
doorflee2 armed shape on the designated band (~16 fought
doors, ~9 vFlee, ~6 fresh kills) — but this band is fresh, so
report this band's own numbers and do not force a match. The
question is whether the floor + hold converts doors the hold
alone could not: expect the armed leg's `everHopeless` count
to fall (the floor starves hopeless reads at the source) and
the conversion census (S2) to show flee→kill conversions the
doorflee2 pilot's 1 conversion did not reach. If the armed
flee rate falls less than 20pp, the verdict is NO-GO and the
evidence names the next input (HP-gating formation is already
named; the floor's own insufficiency estimate — floored rtd
~7.8 vs a 9.7-round kill horizon — says the rate, not the
pool, may still bind).

## Legs log + evidence discipline

- Legs tee to `evidence/2026-11-22/hypofloor-b-legs.log`
  (one JSON line per seed + EXIT lines; fallback recovery).
  The lever diff, the fixture copy shas, and the proof counts
  are recorded there.
- Evidence: `evidence/2026-11-22/sim-hypofloor-b.md` (verdict,
  frozen-bar table, door-fight table with flee rounds + party
  state + doorHold + conversions, wall numbers, sense-test
  transcript read, metric review) + `hypofloor-b-panel.md` +
  panel JSONs + analysis JSON (analyzer --json over each
  corpus dir).
- `check.js --quick`: attempted once after any src change, but
  SERIALIZED — pgrep for any running check.js first and wait
  until none is running; never run two concurrently. (The
  proof tests are plain node, not jest, so they run without
  adding a jest process.)
- Write flap: intermittent EPERM on fresh-file writes has struck
  this program repeatedly (this arm already saw one: a
  `git diff --stat` failed with `index.lock` write error
  `Operation not permitted` at ~06:5x UTC — no stale lock left
  behind, HEAD unchanged, diff re-verified by read). Probes run
  before writes that matter; the driver uses write-robust
  paths; a blocked final commit leaves files on disk intact
  for coordinator adoption, never forced.
- Git slowness: index-touching git commands can run minutes
  under hot-tree load (a `git status --short` took ~90s at arm
  start). Prefer commit-to-commit reads (`git show` / `git diff
  <commit> <commit>`) and plain `grep`/`diff`, which stay fast.

## Metric review (adopted from doorflee2 §8 — this run is judged as frozen)

- F1 is priced on the flee RATE with the count as a secondary
  (the armed leg may fight more doors; a count bar punishes the
  lever for reaching more doors).
- P3 is priced on TOTAL damage per door/fight, not per round
  (longer held fights dilute per-round damage by construction).
- The effect metric is conversions (flee→kill, flee→later-flee),
  not hold rounds (3 of DOORFLEE2's 6 holds changed nothing
  observable — a hold can fire on a round where no flee was
  imminent).
- The door-line order quirk (door lines print 2, 3, 1) persists
  in the ported slot code; cosmetic, no bar.
- The pin's near-death members (26-HP / 25-HP leaders in the
  doorflee2 pilot) are a formation question, not a morale
  question; no bar turned on them here, but S7 counts them for
  the next arm.

## What was read first (do not re-measure what they answered)

- `docs/CANON.md` + `docs/MONSTER-WAVES.md` wave-4 bands (no
  canon doc prices a morale read, a hypothetical-HP floor, or a
  commitment hold — the floor + hold is a sim lever, judged on
  flee rate + kills).
- `evidence/2026-11-21/sim-doorflee2-b.md` (§§1, 5, 7, 8 — the
  NO-GO on F1 only, the 6-hold ledger, the held-kill
  transcript, the hypo-floor next step, the metric review
  ADOPTED here) + its frozen prereg
  (`sim-doorflee2-b-prereg.md` — the designated-band method,
  the anchor rule, the proof suite).
- `evidence/2026-11-21/sim-doorflee-b.md` (§1 — the mechanism,
  the negative-HP drag, the rejected floor alternative and its
  106830 d105 estimate; §7 — the design inputs) + its frozen
  prereg.
- `docs/MEASUREMENT.md` §§9–12, 14–15 (staged method, metric
  binding, balanced panels).
- `~/workspace/custom-skills/local_seed_band_freshness/SKILL.md`
  — the full freshness search is recorded above (1100 preregs +
  6378 evidence .md, zero hits; JSON float fragments noted).

## Files

- Prereg: `evidence/2026-11-22/sim-hypofloor-b-prereg.md` (this file)
- Instrument: `scripts/pinquaddoor-driver-b.js` (hypofloorFlag stamp
  + legs-log line),
  `scripts/analyze-pinquaddoor-b.js`,
  `scripts/analyze-hypofloor-b.js` (NEW — flag rename + repriced
  F1/P3 + conversion census, selftest green),
  `scripts/test-allyslot3-b.js`, `scripts/test-pinquaddoor-b.js`,
  `scripts/test-pinquaddoor-wide-b.js`, `scripts/test-dmgpin-b.js`,
  `scripts/test-dmgpin-reprereg-b.js`,
  `scripts/test-dmgpin-scout-b.js`,
  `scripts/test-doorflee2-b.js`,
  `scripts/test-hypofloor-b.js` (M3f, NEW),
  `scripts/build-pinquaddoor-b-panels.js`,
  `scripts/fixtures/dmgpin-b-s106722-control.json`,
  `scripts/fixtures/dmgpin-b-s106722-armed.json`
- Corpora (fresh): `evidence/2026-11-22/perseed-hypofloor-b-control/`
  (8 files) + `evidence/2026-11-22/perseed-hypofloor-b-armed/`
  (8 files)
- Analysis: `evidence/2026-11-22/hypofloor-b-analysis.json`
  (analyzer --json over both corpus dirs) + `hypofloor-b-panel.md`
  + panel JSONs
- Evidence: `evidence/2026-11-22/sim-hypofloor-b.md`
- Leg log: `evidence/2026-11-22/hypofloor-b-legs.log`
- `src/` diff: the HYPOFLOOR lever in `src/js/fieldFights.js`
  only (+42/−3). No default flip.
