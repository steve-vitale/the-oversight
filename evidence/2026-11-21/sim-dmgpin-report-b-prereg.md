# sim-dmgpin-report-b — FROZEN prereg (Loop B 1630Z, arm 2 of 3)

**Frozen:** 2026-11-21 ~18:15 UTC, BEFORE any judged sim. Base master
`cb20cd650` (full `cb20cd650afd4a6cae610ad06c942300faf4b9b9f`, batch-ship
version bump only — no game logic). Frozen base:
`cb20cd650afd4a6cae610ad06c942300faf4b9b9f`. Branch
`sim-dmgpin-report-b`, worktree
`~/workspace/worktrees/sim-dmgpin-report-b`, registered from the main
tree. Run `fleshout-loop-b-20261121T1630Z`, coordinator claim
`hidden_files/lever-claims/fleshout-loop-b-20261121T1630Z.json`
(arm 2 of 3: sim-d3refreeze-b, sim-dmgpin-report-b, sim-costbar-b).
Lever arm: DMGPIN re-judged on a band PRE-SCREENED for pin formation
by a control-only scout — the 0430Z reprereg went NO-GO kind
SUPPLY-THIN on a fresh band that supplied zero fought door fights.
This arm is the re-issue of the 1430Z scout arm
(sim-dmgpin-scout-b), which STOPPED at the port gate
(`evidence/2026-11-21/dmgpin-scout-b-STOP.md`, read-only in the
scout tree): the port conflicted on `fieldFights.js:1756`, the
monster-phase ally pick block carrying the #2634 downedtwice fix.
The coordinator's re-issue decision (this brief, STOP note option 1)
is to resolve the conflict by a hand-merge that keeps the fixed
form — done here as a port onto current master, NOT a rebase of the
held branch. The held branch `sim-pinquaddoor-b` is NOT merged, NOT
modified, NOT rebased.

## The question (findings #2619 + #2636)

- **#2619 — the pin, not the damage, is the binding constraint.**
  The 0330Z pilot proved DMGPIN doubles door damage when the fight
  happens (112.4 → 216.8/round; the 106722 d115 kill); the 0430Z
  reprereg re-judged it on fresh band 106729–106736 and supplied
  ZERO fought door fights on the armed leg (only 1/8 villages ever
  pinned, days 131–132, six pinned fights, all wave 1–2). The
  re-registered P1/P2/B1 bars were unmeasurable — not failed by the
  lever, never reached by it. The round record prescribes the next
  re-judge: run wider OR pre-screen the band for pin formation with
  a control-only scout. This arm does the scout.
- **#2636 — rides with the re-judge.** P1 re-registered on the dealt
  bound / roundsDetail-derived entry HP (proof 30/30) is
  instrument-proven, never kill-judged. It is judged here, on the
  scouted band, under the same re-registered bars as the reprereg.

## The lever (DMGPIN) — unchanged from the 0330Z / reprereg preregs

A pinned quad strikes as one unit: in a field fight where the full
pinned trio entered at the door, every party member's strike damage
is doubled (x2.0) — fighter + all three allies + the Live Broadcast
echo; strikes only, after every other strike modifier; wave-gated
≥ 4; env-gated OFF by default; inert without the pin. Canon
grounding unchanged: MONSTER-WAVES.md wave-4 bands (HP 850–1500,
damage 35–95; "a 4-6 round fight for a godhood build (~220
dmg/round)"). No canon doc prices a coordinated-strike multiplier —
the multiplier is a sim lever to test whether damage is the binding
constraint, judged on kills; landing it as a game change would still
be a Steve/design call, not this arm's. The ported lever stays
env-gated / default-OFF exactly as on the branch — NO default flip
in this arm.

## Design, in two stages

**Stage 1 — SCOUT (control-only pre-screen).** Run the pinquaddoor
driver with PINQUAD=1, DMGPIN unset, on 24 fresh seeds (3 bands of
8), 150d death-aware, competent verbatim, full substrate. The scout
measures pin formation on control: per seed, the fought-door count
(a "door fight" is a wave-4+ encounter row with
`origin === 'expedition'` AND `allyFromStart` true AND `pinned`
true; "fought" means `rounds >= 1`). A seed **DESIGNATES** iff its
control corpus has ≥ 1 fought door fight. The designation table
(per-seed fought doors, pinned wave-4+ encounters, pinned fights at
all waves) is the scout's deliverable.

**Stage 2 — RE-JUDGE (paired, on the scouted band only).** The
re-judge band is the designated seeds (see "Scout bar" for the
selection rule). Control leg = the scout corpora for those seeds,
reused as byte-identical copies (same substrate, same frozen base,
deterministic — D1-proven; the copy is sha-verified before/after
and recorded in the legs log). Armed leg = the same seeds, fresh,
with DMGPIN=1 added and nothing else. The re-judge judges the
reprereg's re-registered bars (P1/P2/B1/B2/B3a/B4/M5/M6, §"Frozen
bars" below) on that band. Nothing else about the lever, the
substrate, or the policy changes between the scout and the re-judge.

## Scout bar (frozen — a miss is NO-GO, never re-scored)

- **SCOUT-GO iff ≥ 1 scouted seed designates.** The re-judge band
  is ALL designated seeds (first 8 in seed order if more than 8
  designate — a cap that is not expected to bind; designation is
  rare). If exactly 1 seed designates, the re-judge runs on that
  single seed and the bars judge as frozen (a single door-rich
  seed supplied 5 fought doors / 1 door kill / 5 ally3Vid rows on
  the dmgpin band, so one seed can carry the bars).
- **If 0 seeds designate, the verdict is NO-GO kind SCOUT-EMPTY
  and the re-judge is NOT run.** That is a verdict about the
  re-judge design — pins do not form at wave-4 doors anywhere in
  24 fresh seeds — not a reason to re-roll the band, substitute
  seeds, or widen the scout after the fact. The evidence reports
  the scout census in full (per-seed pin formation, waves, days)
  and the finding is updated with the measured rate.

## Frozen bars — re-judge (carried verbatim from the reprereg)

The panel census of wave-4+ encounters (`v4encounters` rows) on
both legs, through the pinquaddoor analyzer (extended with the
re-registered P1/B1 computation), plus a node one-liner over the
raw corpora for the door table (the reprereg's method).

**GO requires ALL of:**

- (M1) **Port gate:** `test-allyslot3-b.js` 18/18 on the ported
  tree.
- (M2) **Staged pin proof** (`scripts/test-pinquaddoor-b.js`):
  35/35 on the ported tree.
- (M2w) **Wide-instrument proof**
  (`scripts/test-pinquaddoor-wide-b.js` + analyzer selftest):
  16/16 on the ported tree.
- (M3) **Damage proof** (`scripts/test-dmgpin-b.js`): 29/29 on
  the ported tree.
- (M3b) **Re-registration proof**
  (`scripts/test-dmgpin-reprereg-b.js`, adapted §0 to this
  prereg): the re-registered P1/B1 computation, green before
  judged legs.
- (M3c) **Scout proof** (`scripts/test-dmgpin-scout-b.js`, NEW):
  the scout design as frozen (§0: this prereg names the scout
  bands + designation rule; §1: the ANCHOR assertion — the
  anchor stamped on a driver-written smoke corpus equals the
  frozen base, read from the corpus, never from live HEAD; §2:
  the designation rule on synthetic corpora; §3: a live 30d
  control-only shape run on a screening seed, 0 instrument
  errors, pin fields present), green before judged legs.
- (M4) **Panel bars** (control PIN-ONLY vs armed PIN+DMGPIN,
  same seeds, same policy):
  - (P1) **Door kill, RE-REGISTERED:** ≥ 1 armed FRESH door
    kill (expedition-origin, `allyFromStart`, pinned, wave ≥ 4,
    outcome vKill, derived entry HP ≥ 500). **Freshness is priced
    on the roundsDetail-derived entry HP:**
    `roundsDetail[0].mHpStart + flPreRoundDealt`. **NEVER on `mHpStart`**
    — the recorder nulls it on every vKill row by design. Cross-checks, recorded in the evidence (not separate
    judges): (a) the **dealt bound** — entry HP > `mDealt` −
    final blow, where the final blow is the last "strikes for N"
    value in the row's `log`; the derived entry HP must be ≥ the
    dealt bound; (b) `mHpStartRec` must equal the derived entry
    HP when present. If `roundsDetail` is absent on a kill row,
    the dealt bound alone judges freshness; if no final-blow
    strike line exists either, the row is UNJUDGEABLE and P1
    counts it as not fresh (record it — do not guess).
  - (P2) **D-shape, UNCHANGED:** mean damage/round across
    FOUGHT armed door fights (mDealt / rounds, rounds ≥ 1)
    ≥ 111/round.
  - (B1) **Pin delivery, RE-REGISTERED as non-inferiority:**
    armed fought-subset ally3Vid rate ≥ control fought-subset
    rate − 10pp AND ≥ 3 armed ally3Vid rows. The 10pp margin is
    kept as frozen (calibrated for denominators of 12–15; this
    is a pilot, not a confirm — the margin does not shrink here).
  - (B2) **ally3Dealt, UNCHANGED:** armed total `ally3Dealt`
    > 0 AND at least one armed fight with `ally3Dealt` ≥ 10.
  - (B3a) **Kill conversion (non-inferiority), UNCHANGED:**
    armed corpus-wide vKill rate on wave-4+ encounters ≥
    control rate − 2pp.
  - (B4) **Substrate sanity, REVISED per the reprereg metric
    review:** every control corpus file carries `dmgpinFlag`
    null AND `pinquadFlag` '1'; every armed file carries
    `dmgpinFlag` '1' AND `pinquadFlag` '1'; every corpus file
    (both legs, scout included) carries `anchorCommit` equal to
    the frozen base (§"Anchor rule") and `policySha`
    `1884c8852d38`. The old control-supply clause (control
    pinned wave-4+ fights ≥ 1) is FOLDED into the SUPPLY-THIN
    rule — it conflated substrate sanity with band supply, and
    a pilot whose control supplies zero pins must not read as
    two failures.
  - If the armed leg yields ZERO fought door fights, the verdict
    is NO-GO kind SUPPLY-THIN, not a lever failure. If ≥ 1
    fought door exists and P1 misses, that is a lever NO-GO.
- (M5) **Guardrail — no regression, UNCHANGED:** the
  balanced-panel compare returns `review_required` with NO
  `regression_signal` on village deaths / deaths-per-100d.
- (M6) **Deliverable, UNCHANGED:** evidence file with the
  frozen-bar table, the scout designation table, a sense-test
  transcript read (at least one door fight quoted blow-by-blow;
  if a door kill happens, quote that fight blow-by-blow), wall
  numbers, and the balanced-panel compare output attached;
  corpora under `evidence/2026-11-21/perseed-dmgpin-report-b/`
  (scout), `...-control/` and `...-armed/` (re-judge).

A miss on any of M1–M5 is NO-GO, never re-scored against a
friendlier metric. If the metric proves wrong again, write it under
"metric review" and propose the revision for the NEXT run.

## Secondary (REPORTED, not binding — do not re-score the primaries)

- (S1) Pin-subset B1 rate (wave-4+ and all-waves, fought subset).
- (S2) Drive-offs on pinned fights (`mFlee` + end-cause taxonomy).
- (S3) SEEK decisions (`v4gates` rows, pinned vs unpinned).
- (S4) Pinned fights at all waves (the `pinFights` census).
- (S5) Door-fight table: every armed door fight — seed, day,
  monster, rounds, dealt, derived entry HP (+ dealt bound +
  `mHpStartRec`), outcome, D/round, HP/dealt counterfactual.
- (S6) Wall numbers: wins / national / table, wave 4–5 unlocks,
  median survival, deaths, villages lost, starvation — control vs
  armed (re-judge); scout band wall numbers reported for the full
  24-seed scout.
- (S7) Scout census: per-seed pin formation (pinned fights by
  wave, first pin day, fought doors), so the next arm can see
  WHERE pins form, not just whether.

## Base + substrate (verified, not assumed)

- Base: master `cb20cd650` (full
  `cb20cd650afd4a6cae610ad06c942300faf4b9b9f`) at arm start;
  worktree HEAD verified `cb20cd650...` after a fast-forward
  from the registered base `c7be183e0` (version bump only:
  index.html / sw.js / version.json / build.js — no game code;
  `git diff c7be183e0 cb20cd650 --stat` shows those 4 files
  only). Delta `b20328ad9..cb20cd650` in `src/js/`: the downedtwice
  fix (`fieldFights.js`, #2634: `_liveAllies`-indexed pick +
  transition-gated fall) + the PROFILEGATE4 env-gated lever
  (`villager-brain.js`, `win-plan.js`, 25 insertions + 1 line
  each — env-gated OFF, NOT in this arm's substrate, so inert
  here) + conversation/convo-dialogue lines — no judged-path
  behavior change under the frozen env except the downedtwice
  fix, which the port preserves (see "Port plan").
- **Policy frozen:** `scripts/policies/competent.js` sha256
  `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
  (first 12: `1884c8852d38`) — verified live on this base at
  freeze time. IDENTICAL to sense3, pinquaddoor-b, the wide band,
  the reprereg, the dmgpin run, and the poolfirstfail band.
- Substrate flags (scout + both re-judge legs):
  `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1
  LAUNCHSURVIVE=1 ALLYSLOT3=1 PINQUAD=1`. Scout and control leg:
  DMGPIN unset (pin only). Armed leg: DMGPIN=1 added, nothing
  else. NOTE — the same flag list as the reprereg prereg (the
  resumption brief's list omits FLEEREPAIR2; the driver
  hard-requires it, exit 2 without it).
- Horizon: 150d, death-aware (dead villages stop, +10d tail max).
  Same horizon as every prior band in this program — the pin
  formed at day 131 on the reprereg band, so a shorter horizon
  would cut the phenomenon off.
- **Control re-run NOT required:** the scout corpora ARE the
  re-judge control leg (byte-identical copies for the designated
  seeds — see "Design"). The prior corpora are cross-checks only,
  never the judged control.
- **Legs chunked at 4 seeds per call:** the wide arm's 16-seed
  single call was SIGTERMed at ~16.5 min; the reprereg split
  each 8-seed leg 4+4. The scout runs 6 chunks of 4; the armed
  leg runs in chunks of 4. Per-seed files persist across kills;
  resume, never re-run completed seeds. The driver refuses to
  overwrite (exit 3) — a re-run over a completed seed is a hard
  stop, not a silent overwrite.
- **Confirm rule:** a 12–16-seed confirm runs ONLY if this pilot
  GOes on every bar. A pilot NO-GO (any kind, including
  SCOUT-EMPTY and SUPPLY-THIN) spends no confirm seeds.
- **Master movement:** Loop A is live on scale-onramp (1615Z
  claim: shelterdraft in flight in sim-shelterdraft-a — NOT
  touched). If master moves after the legs start, this arm does
  NOT rebase mid-run — the anchor is frozen at `cb20cd650` and
  the legs judge on it; the coordinator merges afterward and
  handles any game.js overlap. A rebase after legs start would
  void the anchor and is forbidden by the anchor rule.

## Bands + freshness (verified before freezing, per the seed-band skill)

- **Scout bands (24 seeds): 106809–106816, 106817–106824,
  106825–106832** — the full scout range **106809–106832**.
  The immediate successors of the highest used band (106801–106808,
  downedtwice-b, 0430Z arm 3). Search scope, run 2026-11-21
  ~18:00–18:10 UTC on current master: (1) `grep` over
  `evidence/*/sim-*-prereg.md` and `evidence/*/sim-*.md`
  (every seed individually, excluding only the scout prereg
  itself, which names them as this arm's inherited
  reservation); (2) `grep` over `scripts/` + `docs/` for the
  whole range; (3) filename `find` over `evidence/*/perseed-*`;
  (4) corpus JSON `"seed":` cites over the Nov 20–21 `perseed-*`
  dirs; (5) `grep` over goal `hidden_files/*.md`. Result: ZERO
  hits in every scope — no prereg, sim note, script, doc, goal
  file, live claim, or corpus file/dir names any of 106809–106832.
  The only 10680x hits are the downedtwice band 106801–106808.
  The scout arm's 13:35Z check found the same; this re-check
  covers everything written since (no new namer appeared).
  **FRESH.** The scout arm never ran a judged sim, so the bands
  carry no corpora from it — the reservation passes to this arm
  intact.
- Already-used bands NOT reused: 106081–106088, 106151–106158,
  106161–106168, 106171–106178, 106181–106188, 106191–106198
  (dmgsurvey-b); 105931–105938 (dmgshape-b 1230Z); 106211–106218,
  106221–106228, 106231–106238 (strikeband-b); 106241–106248
  (strikeband4-b); 106251–106258 (sense3-b); 106501–106516
  (pinquaddoor-wide-b); 106601–106616 (reseedexpiry);
  106701–106716 (pinquaddoor-reprereg-b); 106721–106728 (dmgpin-b
  + holderstate-b); 106729–106736 (dmgpin-reprereg-b);
  106731–106738 (poolfirstfail-b); 106801–106808
  (downedtwice-b). (107051+ bands belong to Loop A arms today;
  not reused.)
- **Re-judge band:** NOT pre-chosen — it is the designated
  subset of the scout bands, determined by the frozen
  designation rule after the scout runs. The evidence records
  the designated seeds, the designation table, and the copy
  shas. No seed outside the scout bands may enter the re-judge.

## Expectation (not a bar)

Pin supply is the open variable: fought doors per 8-seed band
were 6 (dmgpin), 0 (reprereg), ~27/16 (wide), 4/16
(pinquaddoor-reprereg) — carried by one village per band. On 24
scouted seeds, expect 1–4 designating seeds; 0 is possible and
is a verdict (SCOUT-EMPTY), not a failure of the scout. P1 (≥ 1
fresh door kill) is reachable if a designated seed supplies a
long door fight in the HP/dealt ≤ 2.0 class; P2 (≥ 111/round)
should pass whenever ≥ 1 strike-fight occurs. Do not drop dead
seeds or re-scope the band.

## Anchor rule (the poolfirstfail lesson, frozen)

- The driver stamps `anchorCommit` as `git rev-parse HEAD` at
  load time. The FROZEN BASE is master `cb20cd650` (full
  `cb20cd650afd4a6cae610ad06c942300faf4b9b9f`). **Nothing is
  committed before the judged legs run** — the prereg, the
  instrument, the port, and the proof runs all happen with HEAD
  still at the frozen base, so the stamped anchor IS the frozen
  base. The port is applied uncommitted; the instrument files
  are written uncommitted. The final commit happens only AFTER
  the legs + evidence are written.
- The proof test (M3c §1) asserts the stamped anchor on a
  driver-written smoke corpus equals the frozen base — read from
  the corpus file, never from live HEAD (the poolfirstfail arm's
  proof asserted policy sha but never the anchor, and its
  analyzer's stricter check failed on the label alone).
- The evidence verifies `anchorCommit` on EVERY corpus file
  (scout + both re-judge legs) against the frozen base; a
  mismatch voids that leg.
- **If anything is committed before the judged legs, the legs
  must be re-run after a dated prereg CORRECTION** — never amend
  the expected anchor post-hoc. (A correction names the new
  frozen tip and re-freezes the bars unchanged.)
- The port's exact identity is recorded alongside the anchor so
  the judged code is recoverable: source branch
  `sim-pinquaddoor-b` tip `94e0b5b85`, merge-base `b20328ad9`,
  the 6-file list, and the applied diff's sha256 (recorded in
  the legs log + evidence at apply time).

## Port plan (what actually happened — the scout STOP resolved)

The DMGPIN lever, the PINQUAD lever, and the ALLYSLOT3 slot live
on the HELD branch `sim-pinquaddoor-b` (tip `94e0b5b85`) and are
NOT on master (verified: master `src/js/` contains no `DMGPIN`
or `PINQUAD` string). The port is:

- `git diff b20328ad9 94e0b5b85 -- src/` (6 files, 324
  insertions / 25 deletions: `fieldFights.js` +210,
  `villager-agency.js` +79, `party-wiring.js` +33, `game.js`
  +10, `villager-brain.js` +8, `win-plan.js` +9 — the ALLYSLOT3
  port + PINQUAD + DMGPIN, nothing else), sha256
  `3107d05f894d833ea5b84bdcac0a95490988d1008436f31fb20fc98e918e5ad5`.
- The other 5 files applied cleanly (`git apply --check` exit 0):
  `game.js`, `party-wiring.js`, `villager-agency.js`,
  `villager-brain.js`, `win-plan.js`.
- `fieldFights.js` did NOT apply cleanly: TWO hunks conflicted,
  not one. The scout STOP note predicted the first; the second
  was found at apply time on the newer base (`c7be183e0`, which
  postdates the scout's `9c4ed7a87`):
  - **Hunk @@ -1756,15 +1829,19 @@** (monster-phase ally pick
    block): the patch's context carries the OLD pick line
    (`_liveAllies.length === 2 ? (RR() < 0.5 ? 1 : 2) :
    _liveAllies[0]`). Master carries the #2634 fix on that exact
    line. HAND-MERGED: master's pick line is kept VERBATIM
    (`_liveAllies.length >= 2 ?
    _liveAllies[Math.floor(RR() * _liveAllies.length)] :
    _liveAllies[0]`, byte-identical to master — verified with
    `cmp` on the extracted line); the branch's `_hVid` /
    `_hName` / `_hArmor` / `_hHp` 3-ternaries and the
    `_wardAllyVid` 3-case are applied around it. The branch's
    own 3-way pick is SUBSUMED by the #2634 line: uniform index
    over `_liveAllies` of any length ≥ 2 draws the third ally
    exactly when three stand, and — unlike the branch's
    hardcoded 1/2 fallback — never lands on a downed ally when
    the live pair is (1,3) or (2,3). The branch's ALLYSLOT3 pick
    comment is replaced by the #2634 comment, which documents
    the same behavior with the fix.
  - **Hunk @@ -1885,7 +1963,7 @@** (the fall block): the patch's
    context expects `if (_hHp <= 0) {`; master (post-#2634)
    carries `if (_hWasLive && _hHp <= 0) {` — the transition
    guard, with `_hWasLive` declared just above. HAND-MERGED:
    the guard line is kept VERBATIM; only the fall line inside
    it changes per the branch (`if (_hIdx === 3) ally3In = false;
    else if (_hIdx === 2) ally2In = false; else allyIn = false;`).
    This is the "ally3In line inside the fall block" the 0430Z
    round record predicted.
- Verification (hunk by hunk, before freezing): `node --check`
  passes on all 6 touched files; `diff` of the ported
  `fieldFights.js` against the branch tip shows EXACTLY the
  two #2634 pieces (pick line + comment, `_hWasLive`
  declaration + guard) and nothing else; `diff` of the other 5
  files against the branch tip shows byte-identical for
  `game.js`, `party-wiring.js`, `villager-agency.js`, and ONLY
  the PROFILEGATE4 env-gated lever for `villager-brain.js` /
  `win-plan.js` (master lines preserved, pin changes present;
  PROFILEGATE4 is env-gated OFF and not in this arm's
  substrate). No other master line is reverted anywhere in the
  6 files. DMGPIN remains env-gated (`process.env.DMGPIN ===
  '1'`); no default flip.
- The held branch is NOT merged, NOT modified, NOT rebased; no
  branch of another arm is touched.
- COMMIT DISCIPLINE (deviation from the scout prereg, per the
  re-issue brief): this arm commits its work at the end with
  `scripts/safe-commit.sh` (port + instrument + prereg +
  evidence, one branch for the coordinator to merge) — the
  scout arm's "port stays uncommitted" instruction applied to
  the STOPPED run, which had no judged legs to land. NOTHING is
  committed before the judged legs (anchor rule above).
- The driver's own src-presence gates (SLOT_PRESENT,
  PIN_PRESENT, SENSE_PRESENT, BUMP_PRESENT, CARRY_PRESENT)
  hard-stop the legs (exit 2) if the port is incomplete — a
  second, independent check on the port.

## Instrument (copied from the held branch tip — read-only copies)

- Driver: `scripts/pinquaddoor-driver-b.js` — copied VERBATIM
  from the held branch tip `94e0b5b85`. DEVIATION from the
  scout prereg, with reason: the scout prereg prescribed
  changing the driver's RUN/OUTDIR defaults to the scout names,
  but `test-pinquaddoor-wide-b.js` §0 asserts the driver
  defaults ARE the wide leg (`RUN = process.env.RUN ||
  'pinquaddoor-wide-b'`); renaming the defaults would fail M2w
  §0. The driver already makes RUN / OUTDIR / CORPUS_PREFIX /
  EVIDENCE_DATE env-overridable, so run identity is carried by
  env vars, never by editing the driver. Env for this run:
  `EVIDENCE_DATE=2026-11-21 CORPUS_PREFIX=dmgpin-report-b
  RUN=dmgpin-report-b OUTDIR=perseed-dmgpin-report-b` (scout) /
  `...-armed` (re-judge armed) + `DMGPIN=1` (armed only).
  Corpus files
  `dmgpin-report-b-s<seed>-dmgpin-report-b-pinquaddoor.json`.
- Analyzer: `scripts/analyze-pinquaddoor-b.js` — copied verbatim
  from the held branch (exports `deriveDoorEntryHp` /
  `dealtBound` / `freshDoorKill` / `b1NonInferiority` /
  `isDoorFight` unchanged). No changes.
- Proof tests: `scripts/test-allyslot3-b.js` (M1),
  `scripts/test-pinquaddoor-b.js` (M2),
  `scripts/test-pinquaddoor-wide-b.js` (M2w),
  `scripts/test-dmgpin-b.js` (M3) — copied verbatim from the
  held branch (arm strings in comments only; no test asserts a
  prereg path or band for these four);
  `scripts/test-dmgpin-reprereg-b.js` (M3b) — copied with §0
  re-pointed at THIS prereg (it names the re-registered bars +
  the scout bands 106809–106832) and §1/§2/§5 reading the two
  106722 fixture files below (the reprereg test as written reads
  `evidence/2026-11-21/perseed-dmgpin-b-*/`, which are NOT on
  master — only the reprereg corpora were cherry-picked);
  `scripts/test-dmgpin-scout-b.js` (M3c, NEW) — the scout proof
  (anchor assertion + designation rule + live shape run).
- Fixtures (read-only copies of prior judged data, for the
  proofs only — never judged data in this arm):
  `scripts/fixtures/dmgpin-b-s106722-control.json` and
  `...-armed.json`, byte-identical copies of
  `evidence/2026-11-21/perseed-dmgpin-b-control/dmgpin-b-s106722-dmgpin-b-pinquaddoor.json`
  and its armed twin from the held branch tip (shas:
  control `1c207262cdfd49fcebbefeec9e38f486c73c5d4f2569b7a134b928069be15e4d`,
  armed `c3dcc7e0062695013535f3cda4ec9562b4b1c1cfc4aae942ec921c0f072cc30f`).
- Panel: `scripts/build-pinquaddoor-b-panels.js` — copied
  verbatim from the held branch (CORPUS_PREFIX / RUN are
  env-overridable; the builder is always invoked with explicit
  `--before` / `--after` / `--seeds` / `--before-seeds`); run as
  `RUN=dmgpin-report-b CORPUS_PREFIX=dmgpin-report-b node
  scripts/build-pinquaddoor-b-panels.js --out
  evidence/2026-11-21/dmgpin-report-b-panel --before
  evidence/2026-11-21/perseed-dmgpin-report-b-control --after
  evidence/2026-11-21/perseed-dmgpin-report-b-armed --seeds
  <designated,comma-separated> --before-seeds <same>` +
  `node scripts/balance-panel.js compare`; the compare `.md` is
  attached to the evidence file. (The builder loads before/after
  by the same prefix+run names, so the copied control files and
  the fresh armed files pair by seed.)

## Proofs (all green, before judged legs, on the ported tree)

- M1 `test-allyslot3-b.js` **18/18** (to be run after freezing
  — recorded in the evidence file).
- M2 `test-pinquaddoor-b.js` **35/35** (same).
- M2w `test-pinquaddoor-wide-b.js` **16/16** (same).
- M3 `test-dmgpin-b.js` **29/29** (same).
- M3b `test-dmgpin-reprereg-b.js` **30/30** (same; adapted §0).
- M3c `test-dmgpin-scout-b.js` **(NEW, to be run after freezing
  — recorded in the evidence file)**.

## Legs log + evidence discipline

- Legs tee to `evidence/2026-11-21/dmgpin-report-b-legs.log`
  (one JSON line per seed + EXIT lines; fallback recovery).
  The port diff sha, the fixture copy shas, and the control-copy
  shas are recorded there.
- Evidence: `evidence/2026-11-21/sim-dmgpin-report-b.md` (verdict,
  frozen-bar table, scout designation table, wall numbers,
  sense-test transcript read, metric review) +
  `dmgpin-report-b-panel.md` + panel JSONs + scout/re-judge
  censuses.
- `check.js --quick`: attempted once after any src change, but
  SERIALIZED — pgrep for any running check.js first and wait
  until none is running; never run two concurrently. Reported
  honestly (the 0430Z adoption gate ran 332 passed / 12 failed
  under concurrent load; load flake is reported as load flake,
  never as a pass).
- Write flap: intermittent EPERM on fresh-file writes has struck
  this program repeatedly (latest window 11:06Z–~12:55Z, cleared
  ~12:56Z; O_EXCL probe PASS at 13:00Z and 13:35Z). Probes run
  before writes that matter; the driver and panel builder use
  write-robust paths; a blocked final commit leaves files on
  disk intact for coordinator adoption, never forced.
- Git slowness (this run, ~18:00Z): index-touching git commands
  (`git status`, `git diff` worktree, `git merge`) run 2–20+
  minutes under the current hot-tree load (load average ~16 on
  1.5 shared CPUs; the ship loop's own `git status` ran 1:54+
  and its `git merge --ff-only journey-scale` 18+ min). This
  arm's fast-forward `c7be183e0..cb20cd650` took ~11 min. All
  port verification in this arm used commit-to-commit reads
  (`git show` / `git diff <commit> <commit>`) and plain `diff`,
  which stay fast. Do not read a slow `git status` as a dirty
  tree — verify by targeted greps instead.

## Metric review (for the NEXT run — this run is judged as frozen)

- P1's primary derivation needs `roundsDetail` (present on only
  36/73 kill rows across prior corpora — though on BOTH known
  door kills). If the pilot's only door kill lacks
  `roundsDetail`, the dealt bound alone judges it — the evidence
  must say which leg the verdict stood on.
- B1's 10pp margin is priced for denominators of 12–15. On a
  wider confirm band (denominators ~20+) the margin should shrink
  toward the B3(a) 2pp shape — the margin scales with the
  denominator, and the confirm prereg must say so.
- P2's mean over fought doors stays vulnerable to a 1-round door
  in a tiny pilot sample (carried from the dmgpin prereg).
- The SEEK side effect (armed pinned fighters seek 0/9 on the
  dmgpin band vs 50.0% reprereg / 9.1% wide) stays unproven; no
  bar turns on it.
- The door-line order quirk (door lines print 2, 3, 1) persists
  in the ported slot code; cosmetic, no bar.
- B4's old control-supply clause is folded into SUPPLY-THIN by
  this prereg (see B4) — the reprereg metric review's
  prescription, applied here rather than re-argued.

## What was read first (do not re-measure what they answered)

- `docs/CANON.md` (+ `docs/MONSTER-WAVES.md` wave-4 bands, via
  the reprereg prereg — no canon doc prices a coordinated-strike
  multiplier; the lever is a sim lever, judged on kills).
- `docs/MEASUREMENT.md` §§9–12, 14–15 (staged method, metric
  binding, balanced panels).
- `evidence/2026-11-21/dmgpin-scout-b-STOP.md` + its frozen
  prereg (`sim-dmgpin-scout-b-prereg.md`, scout tree, read-only)
  — the port conflict, the frozen bars, the scout design, the
  band reservation (inherited, re-verified above).
- `evidence/2026-11-21/sim-dmgpin-reprereg-b.md` + its frozen
  prereg (held branch `5462be81`) — the re-registered bars, the
  supply story, the 0-fought-doors verdict, the metric review.
- `evidence/2026-11-21/sim-winnability-round-0430.md` — the
  round record (arm 1 NO-GO SUPPLY-THIN + #2619/#2636 updates;
  arm 2's anchor-label lesson; arm 3's downedtwice fix + the
  expected pin-branch rebase conflict).
- `evidence/2026-11-21/sim-poolfirstfail-b-prereg.md` —
  substrate + band discipline + the anchor-label lesson
  (driver stamps HEAD; proof never asserted the anchor; do NOT
  amend EXPECTED.anchor12 post-hoc).
- `sim-findings.md` #2619 + #2636 (full entries, incl. the
  1030Z claim line for this arm).
- `~/workspace/custom-skills/local_seed_band_freshness/SKILL.md`
  — followed for the band choice above.

## Files

- Prereg: `evidence/2026-11-21/sim-dmgpin-report-b-prereg.md` (this file)
- Instrument: `scripts/pinquaddoor-driver-b.js`,
  `scripts/analyze-pinquaddoor-b.js`,
  `scripts/test-allyslot3-b.js`, `scripts/test-pinquaddoor-b.js`,
  `scripts/test-pinquaddoor-wide-b.js`, `scripts/test-dmgpin-b.js`,
  `scripts/test-dmgpin-reprereg-b.js`,
  `scripts/test-dmgpin-scout-b.js` (NEW),
  `scripts/build-pinquaddoor-b-panels.js`,
  `scripts/fixtures/dmgpin-b-s106722-control.json`,
  `scripts/fixtures/dmgpin-b-s106722-armed.json`
- Corpora (fresh): `evidence/2026-11-21/perseed-dmgpin-report-b/`
  (24 files, scout) + `evidence/2026-11-21/perseed-dmgpin-report-b-control/`
  (designated-seed copies) + `evidence/2026-11-21/perseed-dmgpin-report-b-armed/`
  (designated seeds, fresh)
- Analysis: `evidence/2026-11-21/dmgpin-report-b-analysis.json`
  (analyzer --json over each corpus dir) + scout designation
  table (in the evidence file)
- Evidence: `evidence/2026-11-21/sim-dmgpin-report-b.md`
- Leg log: `evidence/2026-11-21/dmgpin-report-b-legs.log`
- `src/` diff: the ported lever (6 files, hand-merged as
  documented above) + the PROFILEGATE4 master lines preserved.
