# sim-doorflee-b — FROZEN prereg (Loop B adoption round fleshout-loop-b-20261121T2030Z)

**Frozen:** 2026-11-21 ~23:00 UTC, BEFORE any judged sim. Base master
`3329f4441` (full `3329f4441fb4b5e6e8c0a3bf5a7b8456aebecb27`,
round record — d3refreeze NO-GO, dmgpin-report GO, costbar COST PASS).
Branch `sim-doorflee-b`, worktree
`~/workspace/worktrees/sim-doorflee-b`. Run
`fleshout-loop-b-20261121T2030Z`, arm `sim-doorflee-b` (the
door-flee arm: why a winning pinned quad still flees at doors, and
the staying/commitment lever).

## The question (finding #2619, next step after the dmgpin GO)

The dmgpin lever went GO on the 1630Z round: pinned-quad damage
doubled (85.9 → 170.9 dealt/round pooled, 3 fresh door kills) — but
8 of 11 armed fought doors still end with the villagers fleeing,
while control villages already killed 2 doors. Damage was never the
binding constraint. The next question is why a pinned quad that is
winning the damage race still flees. This arm answers it from the
dmgpin corpora (re-derived here — the dead run's Phase 1 scratch
extractors were in /tmp and are LOST) and pilots a staying lever.

## The diagnosis (derived from the on-master corpora, re-derived — §1)

Door = wave ≥ 4, `origin === 'expedition'`, `allyFromStart`,
`pinned`, rounds ≥ 1. Across the dmgpin corpora (13 control + 11
armed fought doors): **18 vFlee, 5 vKill, 1 mFlee** (a Peacemaker
dismissal). **All 18 flights are the HOPELESS branch** — the log
line is always "sees how this ends — and runs while running still
works", intent always `engage`, never learn, never the floor, never
the committed-finish floor.

Recomputing the morale race on LIVE numbers (actual post-armor
damage taken, live HP left, same 1.1 winning margin the engine
uses): **15 of the 18 flees are WINNING** — the party drops the
monster first. Only 3 control flees (106809 reunion both legs
counted once per leg, 106817 control, 106824 control) are hopeless
on live numbers. The two most extreme: 106829 algorithm control
fled at round 9 with the monster at 248/1100 HP (23% left, 2.6
rounds to the kill, party HP 270); 106830 algorithm armed fled at
round 5 with the monster at 193/1099 HP (18% left, 1.0 round to the
kill, party HP 173). At flee time the leader is at 25–58% HP while
three allies stand nearly untouched at 45–100 HP; the leader takes
nearly all the damage (in 12/18 flees the leader took ≥ 2× any
ally).

**The mechanism (plain words):** the flee decision is made on an
IMAGINED fight, not the real one. The morale read (FIGHTBLEND-B)
replays the fight as if everyone's armor were only protection 4,
while the monster's damage stays real. A door fighter in
tier-appropriate armor (protection ~33) actually lets through only
~20% of a blow; imagined at protection 4, ~68% gets through —
about 3× the real damage (`armorReduction`: P4/pierce-0.3 = 0.32
absorbed; P33/pierce-0.3 = 0.79 absorbed). After a few rounds the
leader's imagined health is deeply negative (they "would have died
twice over"), and that negative number drags the whole four-person
party's pooled survival below the kill horizon — so a party that is
actually winning reads as hopeless and runs.

**The dead run's lead — VERDICT: half right.** Right that the flee
traces to the P4 hopeless read. WRONG on the "party-pool misread":
the pool DOES include the third ally — the pinquad port adds
`ally3EntryHp - rec.ally3TakenP4` to the party pool at the morale
read (verified in the branch code). The misread is not a missing
ally — it is the NEGATIVE-HP drag: the pool is a single sum, so one
fighter's deeply-negative hypothetical HP outweighs three healthy
allies. A fighter who "would have dropped" under P4 contributes
negative survival instead of zero.

**Second finding (documented, not the lever):** door parties launch
with members at near-death HP — the 106809 reunion's third ally
entered at 3 HP (both legs), and the 106830 d107 audit's leader
entered at 19 HP. The pin/expedition formation does not HP-gate
its members. Not judged here; owed as a follow-up blank.

**Rejected alternative (recorded, not built):** flooring each
fighter's hypothetical HP at 0 in the pool. It leaves the P4
incoming RATE ~3× actual, so the survival horizon stays below the
kill horizon on most doors (estimated on 106830 d105: floored rtd
~7.8 rounds vs a 9.7-round kill horizon — still hopeless). The
floor fixes the sign, not the rate. The live-race hold below is the
lever; the floor stays an open alternative if the hold NO-GOs on
deaths.

## The lever (DOORFLEE) — built, env-gated OFF by default

A pinned quad at a door holds while the LIVE race says it is
winning. In `src/js/fieldFights.js`, beside the DMGPIN gate:

- **Gate (computed once, same terms as DMGPIN):** `DOORFLEE=1` in
  env AND wave ≥ 4 AND `opts.allyFromStart` AND the full pinned
  trio matches `pinnedQuadAllies(vid)` (a trio that joins later
  through the shout ladder never qualifies). In the browser
  `process` is undefined, so the flag is never on there.
- **Hold (after the FINISHERSIZE block, mirroring its shape):**
  when the P4 read actually said `hopeless`, at round ≥ 2, re-read
  the SAME race on live numbers — live party HP left against live
  damage taken per round, same 1.1 winning margin — and if the
  live race says winning AND the leader themself can survive
  another round at the current incoming rate (`vHp > leaderRate`),
  suppress the hopeless flee (`hopeless = false`, `winning = true`,
  `fleeAt = 0.05`, `rec.doorHold++`, one "(Door hold)" log line).
  The leader-next-round guard is a precondition, not a knob: a quad
  whose leader is about to drop is not committing, it is dying —
  the hold releases and the normal floor decides.
- **Untouched:** learn-first withdrawal, death, the 5% winning
  floor, signature exits, sealed arenas, solo/non-door/shout-ladder
  fights, and every fight with the flag off (no RNG is drawn —
  verified by the proof test's §0 source check; off-mode is
  byte-identical).
- **Known cost mode (from the proof probe, priced by M5):** the
  hold can trade a flee for a leader death when one big hit lands
  on a wounded leader — the staged 84-HP algorithm fight holds
  twice and the leader dies on round 6, one round from the kill.
  The pilot's M5 deaths guardrail prices this at scale; if deaths
  regress, the verdict is NO-GO and the next arm tightens to a
  leader-survival-only hold.

Canon grounding: MONSTER-WAVES.md wave-4 bands (HP 850–1500,
damage 35–95, pierce 0.2–0.5; "a 4-6 round fight for a godhood
build (~220 dmg/round)"). No canon doc prices a morale read or a
commitment hold — the hold is a sim lever to test whether the flee
is the binding constraint, judged on flee rate + kills; landing it
as a game change would still be a Steve/design call, not this
arm's. The lever stays env-gated / default-OFF exactly as built —
NO default flip in this arm.

## Design — paired pilot on the designated band

**Band (REUSED, per the adoption brief — do NOT burn a fresh band
for the pilot):** the 8 designated seeds from the dmgpin scout:
106809, 106812, 106816, 106817, 106820, 106824, 106829, 106830.
Both legs are FRESH runs on this arm's ported tree (the dmgpin
corpora are cross-checks only, never the judged control — the base
moved `cb20cd650` → `3329f4441` and this tree carries the DOORFLEE
code, so a reused control would measure a different substrate).

- **Control leg:** `PINQUAD=1 ALLYSLOT3=1 DMGPIN=1`, DOORFLEE
  unset (pin + damage, no hold — the dmgpin armed configuration,
  re-run). Expect ~11 fought doors, ~8 vFlee, ~3 fresh kills (the
  dmgpin armed numbers on the same seeds).
- **Armed leg:** control flags + `DOORFLEE=1`, nothing else. Same
  seeds, same policy, same horizon. The only difference between
  the legs is the hold.
- **Substrate flags (both legs):**
  `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1
  LAUNCHSURVIVE=1 ALLYSLOT3=1 PINQUAD=1 DMGPIN=1`.
- **Policy frozen:** `scripts/policies/competent.js` sha256
  `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
  (first 12: `1884c8852d38`) — verified live on this base at freeze
  time. IDENTICAL to the dmgpin band.
- **Horizon:** 150d, death-aware (dead villages stop, +10d tail
  max). Same horizon as every prior band in this program.
- **Legs chunked at 4 seeds per call** (the wide arm's 16-seed
  single call was SIGTERMed at ~16.5 min; the reprereg split each
  8-seed leg 4+4). Per-seed files persist across kills; resume,
  never re-run completed seeds. The driver refuses to overwrite
  (exit 3) — a re-run over a completed seed is a hard stop, not a
  silent overwrite.
- **Driver env:** `EVIDENCE_DATE=2026-11-21
  CORPUS_PREFIX=doorflee-b RUN=doorflee-b
  OUTDIR=perseed-doorflee-b-control` / `...-armed` (+ `DOORFLEE=1`
  armed only). Corpus files
  `doorflee-b-s<seed>-doorflee-b-pinquaddoor.json`.
- **Confirm rule:** a 12–16-seed confirm runs ONLY if this pilot
  GOes on every bar. A pilot NO-GO spends no confirm seeds.
- **Master movement:** if master moves after the legs start, this
  arm does NOT rebase mid-run — the anchor is frozen at
  `3329f4441` and the legs judge on it; the coordinator merges
  afterward.

## Frozen bars (a miss is NO-GO, never re-scored)

The panel census of wave-4+ encounters (`v4encounters` rows) on
both legs, through the doorflee analyzer (`scripts/analyze-doorflee-b.js`,
selftest 11/11; the door definition and freshness judges are reused
from `scripts/analyze-pinquaddoor-b.js` unchanged), plus a node
one-liner over the raw corpora for the door table (the dmgpin
method). The analyzer's B2 subset was verified against the dmgpin
report before freezing (pinned wave-4+ subset: armed total 2,162,
max 404, 31 rows; control 1,593 / 450 / 43 rows — exact).

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
- (M3d) **Staying proof** (`scripts/test-doorflee-b.js`, NEW):
  42/42 on the ported tree — the hold fires on the staged
  algorithm/leader-60 door (control flees R2 hopeless, armed
  holds to R3 and leaves alive), inert without the pin, inert at
  wave 1, inert off the door, driver smoke with `doorfleeFlag`
  '1', base gates green.
- (M3e) **Downedtwice regression** (`scripts/test-downedtwice-b.js`):
  exit 0, **25/25**, on the ported tree (the #2634 fix is the port's
  conflict point — the regression proves the hand-merge kept it).
  [Count recorded post-freeze from the standalone post-freeze run
  (25 passed, 0 failed); the bar is exit 0 and is unchanged.]
- (M4) **Panel bars** (control PIN+DMGPIN vs armed PIN+DMGPIN+
  DOORFLEE, same seeds, same policy):
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
    `doorfleeFlag` null AND `dmgpinFlag` '1' AND `pinquadFlag`
    '1'; every armed file carries `doorfleeFlag` '1' AND
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
  fight blow-by-blow), the diag table (§1 above), and the
  balanced-panel compare output attached; corpora under
  `evidence/2026-11-21/perseed-doorflee-b-control/` and
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
  at death (the hold's cost mode, counted, not waved away).
- (S4) Pin-subset B1 rate (wave-4+ and all-waves, fought subset).
- (S5) Door-fight table: every fought door — seed, day, monster,
  rounds, dealt, derived entry HP, outcome, D/round, fleeHpFrac,
  doorHold rounds, party HP at flee time.
- (S6) Wall numbers: wins / national / table, wave 4–5 unlocks,
  median survival, deaths, villages lost, starvation — control vs
  armed.
- (S7) The diag's second finding (near-death members pinned into
  doors) — count doors where any party member entered below 25 HP,
  both legs, for the follow-up blank.

## Base + substrate (verified, not assumed)

- Base: master `3329f4441` (full
  `3329f4441fb4b5e6e8c0a3bf5a7b8456aebecb27`) at arm start.
  Delta `cb20cd650..3329f4441` in `src/js/`: betrayal.js,
  conversation.js, convo-wants.js only (74 insertions) — no
  fieldFights.js, game.js, party-wiring, villager-agency,
  villager-brain, or win-plan change, so the port below applies
  exactly as on the dmgpin base.
- **Policy frozen:** `scripts/policies/competent.js` sha256
  `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
  (first 12: `1884c8852d38`) — verified live on this base at
  freeze time.
- Substrate flags (both legs):
  `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1
  LAUNCHSURVIVE=1 ALLYSLOT3=1 PINQUAD=1 DMGPIN=1`. Armed leg adds
  `DOORFLEE=1` only.

## Anchor rule (the poolfirstfail lesson, frozen)

- The driver stamps `anchorCommit` as `git rev-parse HEAD` at
  load time. The FROZEN BASE is master `3329f4441` (full
  `3329f4441fb4b5e6e8c0a3bf5a7b8456aebecb27`). **Nothing is
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
  `sim-pinquaddoor-b` tip `94e0b5b85`, merge-base `b20328ad9`,
  the 6-file list, and the applied diff's sha256
  (`3107d05f894d833ea5b84bdcac0a95490988d1008436f31fb20fc98e918e5ad5`
  — identical to the dmgpin arm's port diff).

## Port plan (what actually happened)

The DMGPIN lever, the PINQUAD lever, and the ALLYSLOT3 slot live
on the HELD branch `sim-pinquaddoor-b` (tip `94e0b5b85`) and are
NOT on master (verified: master `src/js/` contains no `DMGPIN`
or `PINQUAD` string). The port is:

- `git diff b20328ad9 94e0b5b85 -- src/` (6 files, 324
  insertions / 25 deletions: `fieldFights.js` +210,
  `villager-agency.js` +79, `party-wiring.js` +33, `game.js`
  +10, `villager-brain.js` +8, `win-plan.js` +9), sha256
  `3107d05f894d833ea5b84bdcac0a95490988d1008436f31fb20fc98e918e5ad5`.
- The other 5 files applied cleanly (`git apply` exit 0):
  `game.js`, `party-wiring.js`, `villager-agency.js`,
  `villager-brain.js`, `win-plan.js`.
- `fieldFights.js`: 26 of 27 hunks applied via `patch`; the one
  reject was the @@ -1756 hunk (monster-phase ally pick block).
  HAND-MERGED exactly as the dmgpin prereg prescribes: master's
  #2634 pick line kept VERBATIM
  (`_liveAllies.length >= 2 ?
  _liveAllies[Math.floor(RR() * _liveAllies.length)] :
  _liveAllies[0]`); the branch's `_hVid` / `_hName` / `_hArmor` /
  `_hHp` 3-ternaries and the `_wardAllyVid` 3-case applied around
  it. The @@ -1885 hunk (fall block) applied cleanly with the
  `_hWasLive` transition guard intact and the ally3 fall line
  inside it. Verification: `node --check` passes on all 6 files;
  all 6 ported files are BYTE-IDENTICAL to the dmgpin-report-b
  port commit `c48854921`'s src; the #2634 pick line and
  `_hWasLive` guard match this base's HEAD verbatim (same text,
  shifted line numbers). No other master line is reverted
  anywhere in the 6 files. DMGPIN remains env-gated
  (`process.env.DMGPIN === '1'`); no default flip.
- The held branch is NOT merged, NOT modified, NOT rebased; no
  branch of another arm is touched.
- COMMIT DISCIPLINE: this arm commits its work at the end with
  `scripts/safe-commit.sh` (port + instrument + lever + prereg +
  evidence, one branch for the coordinator to merge). NOTHING is
  committed before the judged legs (anchor rule above).

## Instrument (copied from the held port commit — read-only copies + the doorflee additions)

- Driver: `scripts/pinquaddoor-driver-b.js` — copied VERBATIM
  from the held port commit `c48854921`, PLUS two documented
  additions for this arm: the corpus stamp gains
  `doorfleeFlag: process.env.DOORFLEE || null` (so each file
  self-describes the hold) and the per-seed legs-log line gains
  `doorfleeFlag`; each v4 row gains `doorHold`
  (`rec.doorHold`, 0 when the hold never fired) and
  `everHopeless` (`!!rec.everHopeless`). No other driver behavior
  changes; the M2w wide test (which asserts the driver defaults)
  re-runs green on the edited copy.
- Analyzer: `scripts/analyze-pinquaddoor-b.js` — copied verbatim
  from the held port commit (exports `deriveDoorEntryHp` /
  `dealtBound` / `freshDoorKill` / `b1NonInferiority` /
  `isDoorFight` unchanged). No changes.
- Door-flee analyzer: `scripts/analyze-doorflee-b.js` (NEW) —
  the frozen-bar judge (F1/P2/P3/B1/B2/B3a/B4) over the two corpus
  dirs, reusing the shared analyzer's door/freshness judges; its
  own selftest is 11/11.
- Proof tests: `scripts/test-allyslot3-b.js` (M1),
  `scripts/test-pinquaddoor-b.js` (M2),
  `scripts/test-pinquaddoor-wide-b.js` (M2w),
  `scripts/test-dmgpin-b.js` (M3) — copied verbatim from the
  held port commit;
  `scripts/test-dmgpin-reprereg-b.js` (carried, not a frozen bar
  here), `scripts/test-dmgpin-scout-b.js` (carried, not a frozen
  bar here);
  `scripts/test-doorflee-b.js` (M3d, NEW — 42 checks);
  `scripts/test-downedtwice-b.js` (M3e — on master already).
- Fixtures (read-only copies of prior judged data, for the
  proofs only — never judged data in this arm):
  `scripts/fixtures/dmgpin-b-s106722-control.json` and
  `...-armed.json` (same shas as the dmgpin prereg).
- Panel: `scripts/build-pinquaddoor-b-panels.js` — copied
  verbatim from the held port commit; run as
  `RUN=doorflee-b CORPUS_PREFIX=doorflee-b node
  scripts/build-pinquaddoor-b-panels.js --out
  evidence/2026-11-21/doorflee-b-panel --before
  evidence/2026-11-21/perseed-doorflee-b-control --after
  evidence/2026-11-21/perseed-doorflee-b-armed --seeds
  106809,106812,106816,106817,106820,106824,106829,106830
  --before-seeds <same>` +
  `node scripts/balance-panel.js compare`; the compare `.md` is
  attached to the evidence file.

## Proofs (all green, before judged legs, on the ported tree)

- M1 `test-allyslot3-b.js` **18/18** (to be run after freezing
  — recorded in the evidence file).
- M2 `test-pinquaddoor-b.js` **35/35** (same).
- M2w `test-pinquaddoor-wide-b.js` **16/16** (same).
- M3 `test-dmgpin-b.js` **29/29** (same).
- M3d `test-doorflee-b.js` **42/42** (same; development runs
  before freezing: 38/40 with two test-side expectation bugs —
  a §1 check that assumed the hold suppresses later flees (it
  releases when the leader guard fails, so the round-3 flee is a
  fresh decision) and a §2 comparator that compared the no-pin
  load against the doubled pinned control instead of a second
  no-pin load — both fixed in the test, no lever change; the fix
  also added 2 checks, hence 42; the post-freeze run is the judged
  one).
- M3e `test-downedtwice-b.js` **exit 0** (same; count recorded
  in the evidence from the §6 run).
- Analyzer selftest `analyze-doorflee-b.js --selftest` **11/11**
  (run before freezing; re-run with the proofs).

## Expectation (not a bar)

Control (pin+damage, no hold) should reproduce the dmgpin armed
numbers on the same seeds: ~11 fought doors, ~8 vFlee, ~3 fresh
kills. The hold fires on the doors whose live race says winning
(15/18 of the dmgpin flees were live-winning); expect armed flees
in the 2–5 range and kills at or above control. The open variable
is the death price: held fights can kill the leader (the staged
84-HP probe death), so M5 may bind before F1 does. If armed flees
fall but deaths regress, the verdict is NO-GO and the evidence
names the leader-death count as the next lever's design input.

## Legs log + evidence discipline

- Legs tee to `evidence/2026-11-21/doorflee-b-legs.log`
  (one JSON line per seed + EXIT lines; fallback recovery).
  The port diff sha, the fixture copy shas, and the proof counts
  are recorded there.
- Evidence: `evidence/2026-11-21/sim-doorflee-b.md` (verdict,
  frozen-bar table, door-fight table with flee rounds + party
  state + doorHold, wall numbers, sense-test transcript read,
  metric review) + `doorflee-b-panel.md` + panel JSONs +
  analysis JSON (analyzer --json over each corpus dir).
- `check.js --quick`: attempted once after any src change, but
  SERIALIZED — pgrep for any running check.js first and wait
  until none is running; never run two concurrently.
- Write flap: intermittent EPERM on fresh-file writes has struck
  this program repeatedly (latest window 2026-11-21 ~18:41–20:00Z
  on the dmgpin arm). Probes run before writes that matter; the
  driver uses write-robust paths; a blocked final commit leaves
  files on disk intact for coordinator adoption, never forced.
- Git slowness: index-touching git commands can run minutes
  under hot-tree load. All port verification in this arm used
  commit-to-commit reads (`git show` / `git diff <commit>
  <commit>`) and plain `diff`, which stay fast.

## Metric review (for the NEXT run — this run is judged as frozen)

- F1's count bar (≤ 4) is priced for the ~11-door denominators
  the dmgpin band supplied. If the control re-run supplies far
  fewer doors (trajectories diverge after the base move), the
  count bar may be unreachable for reasons that have nothing to
  do with the lever — the evidence must report the denominators
  and the rate drop alongside the count.
- P2's exact non-regression (≥ control) is strict at kill counts
  of 2–3: a single kill swinging on one seed's trajectory flips
  the bar. That strictness is deliberate for a pilot — a hold
  that trades kills for holds is not a win — but the confirm
  prereg should price P2 with a margin if the pilot lands close.
- The door-line order quirk (door lines print 2, 3, 1) persists
  in the ported slot code; cosmetic, no bar.
- The pin's near-death members (3-HP third ally, 19-HP leader)
  are a formation question, not a morale question; no bar turns
  on them here.

## What was read first (do not re-measure what they answered)

- `docs/CANON.md` + `docs/MONSTER-WAVES.md` wave-4 bands (no
  canon doc prices a morale read or a commitment hold — the hold
  is a sim lever, judged on flee rate + kills).
- `evidence/2026-11-21/sim-dmgpin-report-b.md` + its frozen
  prereg (`sim-dmgpin-report-b-prereg.md`) — the damage GO, the
  8/11 flee wall, the port procedure, the #2634 conflict and its
  hand-merge, the re-registered P1/B1 bars, the band reservation.
- `evidence/2026-11-21/sim-dmgpin-report-b.md` §4 door tables +
  the on-master corpora `perseed-dmgpin-report-b-control/` and
  `...-armed/` — re-derived in full here (diag §1); the dead
  run's Phase 1 scratch was lost with /tmp.
- `docs/MEASUREMENT.md` §§9–12, 14–15 (staged method, metric
  binding, balanced panels).
- `~/workspace/custom-skills/local_seed_band_freshness/SKILL.md`
  — the band is a designated REUSE per the adoption brief, not a
  fresh band; no freshness search applies.

## Files

- Prereg: `evidence/2026-11-21/sim-doorflee-b-prereg.md` (this file)
- Instrument: `scripts/pinquaddoor-driver-b.js` (doorfleeFlag stamp
  + doorHold/everHopeless row fields),
  `scripts/analyze-pinquaddoor-b.js`,
  `scripts/analyze-doorflee-b.js` (NEW, selftest 11/11),
  `scripts/test-allyslot3-b.js`, `scripts/test-pinquaddoor-b.js`,
  `scripts/test-pinquaddoor-wide-b.js`, `scripts/test-dmgpin-b.js`,
  `scripts/test-dmgpin-reprereg-b.js`,
  `scripts/test-dmgpin-scout-b.js`,
  `scripts/test-doorflee-b.js` (NEW, 42 checks),
  `scripts/build-pinquaddoor-b-panels.js`,
  `scripts/fixtures/dmgpin-b-s106722-control.json`,
  `scripts/fixtures/dmgpin-b-s106722-armed.json`
- Corpora (fresh): `evidence/2026-11-21/perseed-doorflee-b-control/`
  (8 files) + `evidence/2026-11-21/perseed-doorflee-b-armed/`
  (8 files)
- Analysis: `evidence/2026-11-21/doorflee-b-analysis-control.json`
  + `doorflee-b-analysis-armed.json` (analyzer --json over each
  corpus dir) + `doorflee-b-panel.md` + panel JSONs
- Evidence: `evidence/2026-11-21/sim-doorflee-b.md`
- Leg log: `evidence/2026-11-21/doorflee-b-legs.log`
- `src/` diff: the ported lever (6 files, hand-merged as
  documented above) + the DOORFLEE hold in `src/js/fieldFights.js`
  + the driver additions. No default flip.
