# sim-doorflee2-b — FROZEN prereg (Loop B run fleshout-loop-b-20261122T0130Z, arm 1 of 2)

**Frozen:** 2026-11-22 ~02:15 UTC, BEFORE any judged sim. Base master
`0ea9789d7` (full `0ea9789d7aab4bc727dc19b0b88507d444a577ef`,
Loop A 2315Z adoption round record — corpsecap DIAG-NO-GO +
tier4pool GO + killlootfixture FIXTURE GO). Branch
`sim-doorflee2-b`, worktree `~/workspace/worktrees/sim-doorflee2-b`.
Run `fleshout-loop-b-20261122T0130Z`, arm `sim-doorflee2-b` (the
leader-survival-only hold: the next step after the doorflee NO-GO).

## The question (finding #2619, next step after the doorflee NO-GO)

The doorflee pilot proved the mechanism (the P4 hopeless read flees
winning quads) and proved the hold mechanically (8 held doors, 2
flee→kill conversions) — but the pilot NO-GO'd on three frozen bars:
F1 (6 armed flees vs ≤ 4), P3 (0.897× vs 0.90), M5
(`regression_signal` on deaths/100d, 64.59 → 67.28). The priced
ledger: 8 holds → 2 kills, 3 later flees, **3 dead leaders**. The
leader-next-round guard (`vHp > leaderRate`) is not enough — the
leader survives the NEXT round and dies two rounds later, because
the monster's damage concentrates on the leader and the hold keeps
them in the line of fire while their HP is already spent. The
pooled party race says "winning"; the leader's own body says
"dying". This arm replaces the guard with the leader-survival-only
rule the doorflee evidence named as its first design input: hold
only while the LEADER's live HP exceeds their incoming rate times
the rounds left to kill.

## The lever (DOORFLEE2) — built, env-gated OFF by default

A pinned quad at a door holds while the LIVE race says it is
winning AND the leader themself can survive the whole remaining
fight. In `src/js/fieldFights.js`, replacing the DOORFLEE gate and
hold (the DOORFLEE env flag is no longer read; the held branch
`sim-doorflee-b` keeps it):

- **Gate (computed once, same terms as DMGPIN):** `DOORFLEE2=1` in
  env AND wave ≥ 4 AND `opts.allyFromStart` AND the full pinned
  trio matches `pinnedQuadAllies(vid)` (a trio that joins later
  through the shout ladder never qualifies). In the browser
  `process` is undefined, so the flag is never on there.
- **Hold (after the FINISHERSIZE block, mirroring its shape):**
  when the P4 read actually said `hopeless`, at round ≥ 2, re-read
  the SAME race on live numbers — live party HP left against live
  damage taken per round, same 1.1 winning margin — and if the
  live race says winning AND the leader's live HP exceeds their
  incoming rate times the rounds left to kill
  (`vHp > leaderRate * rtk`, where `rtk` is the monster's current
  HP divided by the party's damage per round), suppress the
  hopeless flee (`hopeless = false`, `winning = true`,
  `fleeAt = 0.05`, `rec.doorHold++`, one "(Door hold)" log line).
  The leader must plausibly survive the whole remaining fight,
  not just the next round. A quad whose leader cannot is not
  committing, it is dying — the hold releases and the normal
  floor decides.
- **Untouched:** learn-first withdrawal, death, the 5% winning
  floor, signature exits, sealed arenas, solo/non-door/shout-ladder
  fights, and every fight with the flag off (no RNG is drawn —
  verified by the proof test's §0 source check; off-mode is
  byte-identical).
- **Known cost mode (from the doorflee pilot, priced by M5):** the
  old hold traded flees for leader deaths. DOORFLEE2 is designed
  to price that trade out of existence: a hold fires only where
  the leader's own trajectory survives the kill horizon. The
  pilot's M5 deaths guardrail prices this at scale; if deaths
  regress, the verdict is NO-GO and the next arm's input is the
  hold ledger again.

Canon grounding: MONSTER-WAVES.md wave-4 bands (HP 850–1500,
damage 35–95, pierce 0.2–0.5; "a 4-6 round fight for a godhood
build (~220 dmg/round)"). No canon doc prices a morale read or a
commitment hold — the hold is a sim lever to test whether the flee
is the binding constraint, judged on flee rate + kills; landing it
as a game change would still be a Steve/design call, not this
arm's. The lever stays env-gated / default-OFF exactly as built —
NO default flip in this arm.

## Port verification (what actually happened)

The DMGPIN lever, the PINQUAD lever, the ALLYSLOT3 slot, and the
DOORFLEE hold live on the HELD branch `sim-doorflee-b` (tip
`e71dd5ea4`, base `3329f4441`) and are NOT on master (verified:
master tip `src/js/` contains no `DMGPIN`, `PINQUAD`, or
`DOORFLEE` string). The port is `git diff 3329f4441 e71dd5ea4
-- src/` (6 files), applied onto current master tip `0ea9789d7`
(`git apply`, exit 0, clean — no conflicts despite the base move,
which touched `game.js`, `villager-brain.js`, `win-plan.js` in
non-overlapping hunks):

- Source port diff sha256 `3107d05f894d833ea5b84bdcac0a95490988d1008436f31fb20fc98e918e5ad5`
  (`git diff b20328ad9 94e0b5b85 -- src/`) — matches the recorded
  port exactly.
- `git diff c48854921 e71dd5ea4 -- src/` is `fieldFights.js` +65
  ONLY (the DOORFLEE hold) — the task's warning verified: the
  sibling files in that range are base-move noise and were NOT
  ported.
- Byte verification on the rebased tree: `fieldFights.js`,
  `party-wiring.js`, `villager-agency.js` are BYTE-IDENTICAL to
  `e71dd5ea4`; `game.js`, `villager-brain.js`, `win-plan.js` differ
  from `e71dd5ea4` by EXACTLY the base-move hunks
  (`3329f4441..0ea9789d7`, same hunk sets, line numbers shifted
  only by the port's own additions) and nothing else.
- `node --check` passes on all 6 files. The #2634 pick line is
  kept VERBATIM (`_liveAllies.length >= 2 ?
  _liveAllies[Math.floor(RR() * _liveAllies.length)] :
  _liveAllies[0]`) and the `_hWasLive` transition guard is intact.
- The DOORFLEE → DOORFLEE2 replacement is a further edit on top
  of the verified port, confined to `src/js/fieldFights.js`
  (gate identifiers + the guard `vHp > _dfLeaderRate` replaced by
  `vHp > _df2LeaderRate * _df2Rtk`); `node --check` passes.
- The held branch is NOT merged, NOT modified, NOT rebased; no
  branch of another arm is touched. Master has since moved past
  the spawn base (`c8708ad2c` → `0ea9789d7`); this arm rebased
  onto `0ea9789d7` BEFORE the judged legs (fast-forward — the
  spawn base is an ancestor of the tip), so the anchor below is
  the current master tip.

**Driver additions (this arm only):** the corpus stamp gains
`doorflee2Flag: process.env.DOORFLEE2 || null` and each v4 row
gains `doorHold` (`rec.doorHold`, 0 when the hold never fired) and
`everHopeless` (`!!rec.everHopeless`). No other driver behavior
changes.

## Design — paired pilot on the designated band

**Band (DESIGNATED REUSE — do NOT burn a fresh band for the
pilot):** the 8 designated seeds from the dmgpin scout, reused by
doorflee-b: 106809, 106812, 106816, 106817, 106820, 106824,
106829, 106830. Both legs are FRESH runs on this arm's ported
tree (the doorflee corpora are cross-checks only, never the judged
control — the base moved `3329f4441` → `0ea9789d7` and this tree
carries the DOORFLEE2 code, so a reused control would measure a
different substrate).

**Seed-band freshness check (recorded at freeze):** grep over all
`evidence/*/sim-*-prereg.md` for each of the 8 seeds — the band
appears ONLY in `evidence/2026-11-21/sim-dmgpin-report-b-prereg.md`
and `evidence/2026-11-21/sim-doorflee-b-prereg.md`, i.e. the
designated-reuse chain itself. No other prereg reserves any of
these seeds; no fresh-band search applies (designated reuse per
the run brief).

- **Control leg:** `PINQUAD=1 ALLYSLOT3=1 DMGPIN=1`, DOORFLEE2
  unset (pin + damage, no hold — the dmgpin armed configuration,
  re-run). Expect ~11 fought doors, ~8 vFlee, ~3 fresh kills (the
  dmgpin armed numbers on the same seeds).
- **Armed leg:** control flags + `DOORFLEE2=1`, nothing else. Same
  seeds, same policy, same horizon. The only difference between
  the legs is the hold.
- **Substrate flags (both legs):**
  `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1
  LAUNCHSURVIVE=1 ALLYSLOT3=1 PINQUAD=1 DMGPIN=1`.
- **Policy frozen:** `scripts/policies/competent.js` sha256
  `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
  (first 12: `1884c8852d38`) — verified live on this base at freeze
  time. IDENTICAL to the dmgpin/doorflee bands.
- **Horizon:** 150d, death-aware (dead villages stop, +10d tail
  max). Same horizon as every prior band in this program.
- **Legs chunked at 4 seeds per call** (the wide arm's 16-seed
  single call was SIGTERMed at ~16.5 min; the reprereg split each
  8-seed leg 4+4). Per-seed files persist across kills; resume,
  never re-run completed seeds. The driver refuses to overwrite
  (exit 3) — a re-run over a completed seed is a hard stop, not a
  silent overwrite.
- **Driver env:** `EVIDENCE_DATE=2026-11-21
  CORPUS_PREFIX=doorflee2-b RUN=doorflee2-b
  OUTDIR=perseed-doorflee2-b-control` / `...-armed` (+ `DOORFLEE2=1`
  armed only). Corpus files
  `doorflee2-b-s<seed>-doorflee2-b-pinquaddoor.json`.
- **Confirm rule:** a 12–16-seed confirm runs ONLY if this pilot
  GOes on every bar. A pilot NO-GO spends no confirm seeds.
- **Master movement:** if master moves after the legs start, this
  arm does NOT rebase mid-run — the anchor is frozen at
  `0ea9789d7` and the legs judge on it; the coordinator merges
  afterward.

## Frozen bars (a miss is NO-GO, never re-scored)

The panel census of wave-4+ encounters (`v4encounters` rows) on
both legs, through the doorflee2 analyzer
(`scripts/analyze-doorflee2-b.js`, selftest 11/11; the door
definition and freshness judges are reused from
`scripts/analyze-pinquaddoor-b.js` unchanged), plus a node
one-liner over the raw corpora for the door table (the dmgpin
method). The analyzer is the doorflee analyzer with only the flag
name changed (`doorfleeFlag` → `doorflee2Flag`); every bar below
is the doorflee-b bar VERBATIM — the task's frozen-bars
instruction — including the F1 count leg and the P3 per-round
guard the doorflee metric review suggested repricing. Those
repricing suggestions stay open for the NEXT run; they do not
change this run's bars.

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
- (M3d) **Staying proof** (`scripts/test-doorflee2-b.js`, NEW):
  49/49 on the ported tree — the hold fires on the staged
  herald/leader-60 door (control flees R2 hopeless, armed holds
  twice to the R6 kill, leader alive at 21 HP) AND the staged
  algorithm/leader-60 door is identical armed vs control (the
  tightening: DOORFLEE held there, DOORFLEE2 releases — old
  one-round guard true, new whole-fight guard false, both
  computed from the control rec), inert without the pin, inert
  at wave 1, inert off the door, driver smoke with `doorflee2Flag`
  '1', base gates green.
- (M3e) **Downedtwice regression** (`scripts/test-downedtwice-b.js`):
  exit 0, **25/25**, on the ported tree (the #2634 fix is the port's
  conflict point — the regression proves the hand-merge kept it).
- (M4) **Panel bars** (control PIN+DMGPIN vs armed PIN+DMGPIN+
  DOORFLEE2, same seeds, same policy):
  - (F1) **Flee, PRIMARY:** armed vFlee count ≤ 4 AND armed flee
    rate ≤ control flee rate − 20pp, on fought doors. (From 8/11:
    halving the flee count with a real rate drop, not a
    denominator game.)
  - (P2) **Door kills, non-regression:** armed FRESH door kills
    ≥ control fresh door kills (roundsDetail-derived entry HP ≥
    500, same re-registered freshness as dmgpin P1: NEVER on
    `mHpStart`; dealt bound + `mHpStartRec` cross-checks).
  - (P3) **Damage shape guard:** armed pooled damage/round on
    fought doors ≥ 0.9× control (the hold extends fights; it must
    not tank the damage rate).
  - (B1) **Pin delivery:** `b1NonInferiority` — armed
    fought-subset ally3Vid rate ≥ control rate − 10pp AND ≥ 3
    armed ally3Vid rows.
  - (B2) **ally3Dealt:** armed total `ally3Dealt` > 0 AND at
    least one armed fight with `ally3Dealt` ≥ 10 (pinned wave-4+
    subset, same as dmgpin).
  - (B3a) **Kill conversion (non-inferiority):** armed
    corpus-wide vKill rate on wave-4+ ≥ control rate − 2pp.
  - (B4) **Substrate sanity:** every control corpus file carries
    `doorflee2Flag` null AND `dmgpinFlag` '1' AND `pinquadFlag`
    '1'; every armed file carries `doorflee2Flag` '1' AND
    `dmgpinFlag` '1' AND `pinquadFlag` '1'; every corpus file
    carries `anchorCommit` equal to the frozen base (§"Anchor
    rule") and `policySha` `1884c8852d38`.
  - If either leg yields ZERO fought door fights, the verdict is
    NO-GO kind SUPPLY-THIN, not a lever failure.
- (M5) **Guardrail — no regression:** the balanced-panel compare
  returns `review_required` with NO `regression_signal` on
  village deaths / deaths-per-100d. (This is the bar that prices
  the hold's known death mode — a hold that converts flees to
  leader deaths fails here.)
- (M6) **Deliverable:** evidence file with the frozen-bar table,
  the door-fight table (every fought door, both legs, with
  flee round + party state at flee time + doorHold rounds),
  wall numbers, a sense-test transcript read (at least one door
  fight quoted blow-by-blow; if a door kill happens, quote that
  fight blow-by-blow), the diag table (§1 of the doorflee
  evidence), and the balanced-panel compare output attached;
  corpora under
  `evidence/2026-11-21/perseed-doorflee2-b-control/` and
  `...-armed/`.

A miss on any of M1–M5 is NO-GO, never re-scored against a
friendlier metric. If the metric proves wrong, write it under
"metric review" and propose the revision for the NEXT run.

## Secondary (REPORTED, not binding — do not re-score the primaries)

- (S1) Hold census: `doorHold` rounds per leg, fights with a hold,
  `everHopeless` fights per leg — did the hold fire where the P4
  read said hopeless?
- (S2) Flee-round shift: control vs armed flee-round distribution
  (did held fights flee later, die, or kill?).
- (S3) Leader-death census: `vDie` doors per leg + the leader HP
  at death (the hold's cost mode, counted, not waved away). The
  priced ledger per held door (kills / later flees / leader
  deaths) is the verdict's core.
- (S4) Pin-subset B1 rate (wave-4+ and all-waves, fought subset).
- (S5) Door-fight table: every fought door — seed, day, monster,
  rounds, dealt, derived entry HP, outcome, D/round, fleeHpFrac,
  doorHold rounds, party HP at flee time.
- (S6) Wall numbers: wins / national / table, wave 4–5 unlocks,
  median survival, deaths, villages lost, starvation — control vs
  armed.
- (S7) The diag's second finding (near-death members pinned into
  doors) — count doors where any party member entered below 25 HP,
  both legs, for the follow-up blank. Recorded as a finding, NOT
  expanded into HP-gating (separate named arm).

## Base + substrate (verified, not assumed)

- Base: master `0ea9789d7` (full
  `0ea9789d7aab4bc727dc19b0b88507d444a577ef`) at arm start.
  Delta `3329f4441..0ea9789d7` in `src/js/`: build.js,
  conversation.js, game.js, villager-brain.js, win-plan.js only —
  the port hunks in those three files apply cleanly onto the
  moved base (verified hunk-by-hunk above); no fieldFights.js,
  party-wiring.js, or villager-agency.js change, so the port
  applies exactly as on the doorflee base.
- **Policy frozen:** `scripts/policies/competent.js` sha256
  `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
  (first 12: `1884c8852d38`) — verified live on this base at
  freeze time.
- Substrate flags (both legs):
  `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1
  LAUNCHSURVIVE=1 ALLYSLOT3=1 PINQUAD=1 DMGPIN=1`. Armed leg adds
  `DOORFLEE2=1` only.

## Anchor rule (the poolfirstfail lesson, frozen)

- The driver stamps `anchorCommit` as `git rev-parse HEAD` at
  load time. The FROZEN BASE is master `0ea9789d7` (full
  `0ea9789d7aab4bc727dc19b0b88507d444a577ef`). **Nothing is
  committed before the judged legs run** — the prereg, the
  instrument, the port, the lever, and the proof runs all happen
  with HEAD still at the frozen base, so the stamped anchor IS the
  frozen base. The final commit happens only AFTER the legs +
  evidence are written.
- The evidence verifies `anchorCommit` on EVERY corpus file
  against the frozen base; a mismatch voids that leg.
- **If anything is committed before the judged legs, the legs
  must be re-run after a dated prereg CORRECTION** — never amend
  the expected anchor post-hoc.
- The port's exact identity is recorded alongside the anchor so
  the judged code is recoverable: source branch
  `sim-doorflee-b` tip `e71dd5ea4`, its base `3329f4441`, the
  6-file list, the applied diff's sha256
  (`3107d05f894d833ea5b84bdcac0a95490988d1008436f31fb20fc98e918e5ad5`
  — identical to the dmgpin/doorflee arms' port diff), and the
  DOORFLEE → DOORFLEE2 replacement confined to
  `src/js/fieldFights.js`.

## Port plan (what actually happened)

The DMGPIN lever, the PINQUAD lever, the ALLYSLOT3 slot, and the
DOORFLEE hold live on the HELD branch `sim-doorflee-b` (tip
`e71dd5ea4`) and are NOT on master (verified: master `src/js/`
contains no `DMGPIN`, `PINQUAD`, or `DOORFLEE` string). The port
is `git diff 3329f4441 e71dd5ea4 -- src/` (6 files), applied with
`git apply` exit 0 onto master tip `0ea9789d7` — see "Port
verification" above. The DOORFLEE2 replacement (gate env flag +
guard) is an edit on top of that verified port, confined to
`src/js/fieldFights.js`. No other master line is reverted
anywhere in the 6 files. DOORFLEE2 remains env-gated
(`process.env.DOORFLEE2 === '1'`); no default flip.
- The held branch is NOT merged, NOT modified, NOT rebased; no
  branch of another arm is touched.
- COMMIT DISCIPLINE: this arm commits its work at the end with
  `scripts/safe-commit.sh` (port + instrument + lever + prereg +
  evidence, one branch for the coordinator to merge). NOTHING is
  committed before the judged legs (anchor rule above).

## Instrument (copied from the held branch — read-only copies + the doorflee2 adaptations)

- Driver: `scripts/pinquaddoor-driver-b.js` — copied VERBATIM
  from the held branch tip `e71dd5ea4`, PLUS the documented
  adaptation for this arm: the corpus stamp gains
  `doorflee2Flag: process.env.DOORFLEE2 || null` (replacing
  `doorfleeFlag`) and the per-seed legs-log line gains
  `doorflee2Flag`; each v4 row gains `doorHold`
  (`rec.doorHold`, 0 when the hold never fired) and
  `everHopeless` (`!!rec.everHopeless`). No other driver behavior
  changes; the M2w wide test (which asserts the driver defaults)
  re-runs green on the edited copy.
- Analyzer: `scripts/analyze-pinquaddoor-b.js` — copied verbatim
  from the held branch tip (exports `deriveDoorEntryHp` /
  `dealtBound` / `freshDoorKill` / `b1NonInferiority` /
  `isDoorFight` unchanged). No changes.
- Door-flee analyzer: `scripts/analyze-doorflee2-b.js` — the
  doorflee analyzer with only the flag name changed
  (`doorfleeFlag` → `doorflee2Flag`); the frozen-bar judge (F1/
  P2/P3/B1/B2/B3a/B4) is unchanged; its own selftest is 11/11.
- Proof tests: `scripts/test-allyslot3-b.js` (M1),
  `scripts/test-pinquaddoor-b.js` (M2),
  `scripts/test-pinquaddoor-wide-b.js` (M2w),
  `scripts/test-dmgpin-b.js` (M3) — copied verbatim from the
  held branch tip;
  `scripts/test-dmgpin-reprereg-b.js` (carried, not a frozen bar
  here), `scripts/test-dmgpin-scout-b.js` (carried, not a frozen
  bar here);
  `scripts/test-doorflee2-b.js` (M3d, NEW — 49 checks);
  `scripts/test-downedtwice-b.js` (M3e — on master already).
- Fixtures (read-only copies of prior judged data, for the
  proofs only — never judged data in this arm):
  `scripts/fixtures/dmgpin-b-s106722-control.json` and
  `...-armed.json` (same shas as the dmgpin prereg).
- Panel: `scripts/build-pinquaddoor-b-panels.js` — copied
  verbatim from the held branch tip; run as
  `RUN=doorflee2-b CORPUS_PREFIX=doorflee2-b node
  scripts/build-pinquaddoor-b-panels.js --out
  evidence/2026-11-21/doorflee2-b-panel --before
  evidence/2026-11-21/perseed-doorflee2-b-control --after
  evidence/2026-11-21/perseed-doorflee2-b-armed --seeds
  106809,106812,106816,106817,106820,106824,106829,106830
  --before-seeds <same>` +
  `node scripts/balance-panel.js compare`; the compare `.md` is
  attached to the evidence file.

## Proofs (all green, before judged legs, on the ported tree)

- M1 `test-allyslot3-b.js` **18/18** (run after freezing — recorded
  in the evidence file; pre-freeze run: 18/18).
- M2 `test-pinquaddoor-b.js` **35/35** (same; pre-freeze: 35/35).
- M2w `test-pinquaddoor-wide-b.js` **16/16** (same; pre-freeze: 16/16).
- M3 `test-dmgpin-b.js` **29/29** (same; pre-freeze: 29/29, also
  re-run green inside the M3d test's §6).
- M3d `test-doorflee2-b.js` **49/49** (same; pre-freeze run:
  49 passed, 0 failed — the herald §1a conversion and the
  algorithm §1b tightening both proven with exact numbers; two
  probe scripts in /tmp found the herald case after the algorithm
  case proved unholdable under the new guard at every leader HP
  60–100 — the probes are scratch, not repo files).
- M3e `test-downedtwice-b.js` **exit 0, 25/25** (same; pre-freeze:
  25 passed, 0 failed).
- Analyzer selftest `analyze-doorflee2-b.js --selftest` **11/11**
  (run before freezing; re-run with the proofs).

## Expectation (not a bar)

Control (pin+damage, no hold) should reproduce the dmgpin armed
numbers on the same seeds: ~11 fought doors, ~8 vFlee, ~3 fresh
kills. The new guard is STRICT: it fires only where the leader's
own trajectory survives the whole kill horizon. Expect FEWER
holds than DOORFLEE's 8 (the staged algorithm case — a real
doorflee conversion — no longer holds at all), and expect the
holds that do fire to convert cleanly: the priced question is
whether any door converts without a leader death. If the guard
fires on 0–2 doors, F1's count bar (≤ 4) is likely out of reach
on the count leg even with a real rate drop — the evidence must
report the denominators, the rate drop, and the hold ledger
alongside the count, and the metric review must say so for the
next run. If armed flees fall but deaths regress anyway, the
verdict is NO-GO and the evidence names the leader-death count
as the next lever's design input (the hypo-floor alternative and
the HP-gate formation fix remain the named next inputs from the
doorflee evidence §7).

## Legs log + evidence discipline

- Legs tee to `evidence/2026-11-21/doorflee2-b-legs.log`
  (one JSON line per seed + EXIT lines; fallback recovery).
  The port diff sha, the fixture copy shas, and the proof counts
  are recorded there.
- Evidence: `evidence/2026-11-21/sim-doorflee2-b.md` (verdict,
  frozen-bar table, door-fight table with flee rounds + party
  state + doorHold, wall numbers, sense-test transcript read,
  metric review) + `doorflee2-b-panel.md` + panel JSONs +
  analysis JSON (analyzer --json over each corpus dir).
- `check.js --quick`: attempted once after any src change, but
  SERIALIZED — pgrep for any running check.js first and wait
  until none is running; never run two concurrently. (A sibling
  journey-establishment check.js --quick was live at arm start;
  the proof tests are plain node, not jest, so they ran without
  adding a jest process.)
- Write flap: intermittent EPERM on fresh-file writes has struck
  this program repeatedly. Probes run before writes that matter;
  the driver uses write-robust paths; a blocked final commit
  leaves files on disk intact for coordinator adoption, never
  forced.
- Git slowness: index-touching git commands can run minutes
  under hot-tree load. All port verification in this arm used
  commit-to-commit reads (`git show` / `git diff <commit>
  <commit>`) and plain `diff`, which stay fast.

## Metric review (for the NEXT run — this run is judged as frozen)

- F1's count bar (≤ 4) is priced for the ~11-door denominators
  the dmgpin band supplied. The armed leg may fight more doors
  (doorflee-b: 15 vs 11) and the stricter guard may hold fewer
  of them — the count leg may fail while the rate leg passes.
  Price the next F1 on the rate, with the count as a secondary.
- P3's per-round damage guard is a composition metric: held
  fights run longer and their late rounds deal less
  (wound-binding actions, the final round dealing only remaining
  HP). Price the next P3 on damage per door or total dealt, not
  per round.
- The door-line order quirk (door lines print 2, 3, 1) persists
  in the ported slot code; cosmetic, no bar.
- The pin's near-death members (3-HP third ally, 19-HP leader)
  are a formation question, not a morale question; no bar turned
  on them here, but S7 counts them for the next arm.
- The DOORFLEE2 guard's strictness is itself a measurement: if
  it fires on 0 doors in the pilot, the next arm must decide
  whether the guard is too strict to matter (the hypo-floor
  alternative) or the hold is simply not the binding lever.

## What was read first (do not re-measure what they answered)

- `docs/CANON.md` + `docs/MONSTER-WAVES.md` wave-4 bands (no
  canon doc prices a morale read or a commitment hold — the hold
  is a sim lever, judged on flee rate + kills).
- `evidence/2026-11-21/sim-doorflee-b.md` + its frozen prereg
  (`sim-doorflee-b-prereg.md`) — the doorflee NO-GO, the 8-hold
  ledger (2 kills / 3 later flees / 3 dead leaders), the port
  procedure, the #2634 conflict and its hand-merge, the
  re-registered P1/B1 bars, the band reservation, the §7 design
  inputs (leader-survival-only hold named first).
- `evidence/2026-11-21/sim-dmgpin-report-b.md` + its frozen
  prereg (`sim-dmgpin-report-b-prereg.md`) — the damage GO, the
  8/11 flee wall, the port procedure, the #2634 conflict and its
  hand-merge, the re-registered P1/B1 bars, the band reservation.
- `docs/MEASUREMENT.md` §§9–12, 14–15 (staged method, metric
  binding, balanced panels).
- `~/workspace/custom-skills/local_seed_band_freshness/SKILL.md`
  — the band is a designated REUSE per the run brief, not a
  fresh band; the freshness grep is recorded above (only the
  dmgpin + doorflee preregs reserve these seeds).

## Files

- Prereg: `evidence/2026-11-21/sim-doorflee2-b-prereg.md` (this file)
- Instrument: `scripts/pinquaddoor-driver-b.js` (doorflee2Flag stamp
  + doorHold/everHopeless row fields),
  `scripts/analyze-pinquaddoor-b.js`,
  `scripts/analyze-doorflee2-b.js` (NEW — flag rename of the
  doorflee analyzer, selftest 11/11),
  `scripts/test-allyslot3-b.js`, `scripts/test-pinquaddoor-b.js`,
  `scripts/test-pinquaddoor-wide-b.js`, `scripts/test-dmgpin-b.js`,
  `scripts/test-dmgpin-reprereg-b.js`,
  `scripts/test-dmgpin-scout-b.js`,
  `scripts/test-doorflee2-b.js` (M3d, NEW — 49 checks),
  `scripts/build-pinquaddoor-b-panels.js`,
  `scripts/fixtures/dmgpin-b-s106722-control.json`,
  `scripts/fixtures/dmgpin-b-s106722-armed.json`
- Corpora (fresh): `evidence/2026-11-21/perseed-doorflee2-b-control/`
  (8 files) + `evidence/2026-11-21/perseed-doorflee2-b-armed/`
  (8 files)
- Analysis: `evidence/2026-11-21/doorflee2-b-analysis.json`
  (analyzer --json over both corpus dirs) + `doorflee2-b-panel.md`
  + panel JSONs
- Evidence: `evidence/2026-11-21/sim-doorflee2-b.md`
- Leg log: `evidence/2026-11-21/doorflee2-b-legs.log`
- `src/` diff: the ported lever (6 files, verified as documented
  above) + the DOORFLEE → DOORFLEE2 replacement in
  `src/js/fieldFights.js` + the driver additions. No default flip.
