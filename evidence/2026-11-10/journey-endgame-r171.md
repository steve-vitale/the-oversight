# Journey endgame r171 — RUN NOTE (lane B, 2026-11-10; adoption closeout)

Leg 4 (endgame). Rotation-b read 4 at run start; this adoption advances it
to 5 after a verified landing. The 07:00 run found the FIRST FULL-SEAT WIN
in bot play and timed out before closeout; the 10:00 occurrence did
stale-lock recovery and also timed out mid-adoption (all 6 closeout steps
undone). This note closes out both, by adoption.

- Run: Lane B endgame r171, 07:00 CST occurrence (run `86a57ff8`) + 10:00
  adoption attempt (lock `2026-11-10T16:13:48Z`, hbloop dead on verification).
- Substrate (pilots): master `7c2591d1f` EXACTLY. Prereg:
  `evidence/2026-11-10/journey-endgame-r171-prereg.md` (5 seeds, passes A+B).
- Adoption: coordinator (this note). Branch `journey2-endgame`, commit
  `fc556edec` (rebased onto master `e5c19e54e`, see §Closeout).
- Probe: `scripts/probe-endgame-r171-20261110.js` (+ M2b fix, this adoption).
  Analyzer: `scripts/analyze-endgame-r171-20261110.js`. Dark probe:
  `scripts/probe-darktable-r171-20261110.js`.

## Headline

**First full-seat win in bot play, reproduced.** Seed 89704 (forcedrift):
capstone `military_tribute` delivered d77 (Jorge Silva + Henrik Lien, 2 of
4 living veterans on hand, need 2), deedGate first ok d77, sat FULL d90,
pantry 21067 kcal at Haven, w5:2, standing counted 72/82. The win came on
the PRE-scholar-counts substrate (see §Amendment A2 below); with Steve's
ruling (scholar counts as a villager) more villages should reach it.
Re-run with the fixed probe reproduces it exactly (same day, same veterans,
same seat).

Pass A (matched re-run, no delivery policy): lesser 4/5, full 0/5.
Pass B (CAPSTONE=1 BUYOUT=1): lesser 3/5, full 1/5 (89704), village-lost
1/5 (89702). M23-capstone GO, M24-tribute-agreement GO (per Amendment A1),
M25-buyout VACUOUS NO-GO (same as the pilot — see §Metric review).

## Pilots (07:00 run, substrate 7c2591d1f)

Per-seed (pass A / pass B identical trajectories except capstone/buyout):

| seed | plan | pass A | pass B |
|---|---|---|---|
| 89701 | waves | lesser, sat d90, feared/light, final:mercy | lesser, sat d90 |
| 89702 | waves | village-LOST d56 (reunion d54/d56) | village-LOST d56 |
| 89703 | waves | lesser, sat d96, feared/light, final:pledge | lesser, sat d96 |
| 89704 | forcedrift | lesser, sat d90, relay/dark, capstone MISSED SIT (military_tribute ready, no delivery policy) | **FULL, sat d90, military_tribute d77 (Jorge + Henrik)** |
| 89705 | wavesnw | lesser, sat d91, feared/light, final:pledge | lesser, sat d91 |

Analyzer verdicts (pilot): pass A 39 GO / 2 NO-GO (M2c-engine-coverage 3/4,
M3-conversion armB 1 vs armA 8); pass B 37 GO / 4 NO-GO (M2c, M3,
M21-audit-crosscheck 3/4, M25-buyout VACUOUS). M2b-attribution read GO on
1/1 — **that read was masking the defect below.**

Q1 (pass A vs r162 modulo named deltas): reproduced — lesser 4/5, full 0/5,
same shape; the wave5kill lever (a) did not flip w5:0 on 89701/89703/89705
(deedGate never ok on those seeds; w5 faced on 89701 only). Q2: wideduty
(b) — Jorge Silva survived to the window on 89704 (living veterans 5 at
peak, 4 on hand at delivery d77; in r162 he died of sickness d70). Q3:
tribute fired on 89704 (the only seed with 2 veterans living to the
window). Q4: buy-out did NOT fire (M25 vacuous — no in-window day with
pantry ≥8000 at Haven and nothing ready; window days: 1). Q5: see M2b
below. Q7: dark re-verify — see §Dark probe. Q8: people check — see
below. Q9: pellet rads — no rads death / cure voicing observed in the
pilot transcripts (gap carried, not fixed here). Q10: M3-conversion NO-GO
(armB kills 1 vs armA 8) persists. Q11: diag-layer staleness blank carried.

## M2b defect, fix, and proof

**Defect (found in the pilot corpus, not by the analyzer).** In
`closeFightRec`, the party set maps key `'p'` via `G.villagerId` read at
CLOSE time. When the scholar dies in a fight, the mantle passes
immediately, so `G.villagerId` at close is the SUCCESSOR's id, not the
dead scholar's. The dead scholar is in `died` (startAlive − endAlive) but
not in `partyVids`, so `diedParty` excludes them and `scholarDiedInFight`
(which checks the current, living successor) is false → `diedParty=[]`,
`die=false`, outcome `otherEnd` instead of `vDie`. On 89702 the pilot
missed **SIX** scholar deaths, not three: Peyton Michalski, Chris
Thompson, Agnese Barbagallo d54; Ivy Wang, Ines Duarte, Wanjiru Kamau
d56. Only Meera Reddy d56 was captured — her fight was the last of the
day and the village then died out, so no successor existed and
`G.villagerId` still named her. The pilot's M2b-attribution GO on 1/1
masked the 6 misses. (The d54 Agnese fight read `vFlee` pre-fix — the
party fled while the scholar died; with dieFlag true it correctly reads
`vDie`, since dieFlag outranks vFlee in the outcome priority.)

**Fix (probe-side only, zero src/js).** Record `scholarIdAtOpen` — the
scholar's villagerId at fight open — on every census record (engine-open
via the startCombat wrapper, policy committed open, policy pending,
pending→open conversion, closePending passthrough) and map deaths
through it in `closeFightRec` (party mapping, `scholarDiedInFight`
check, diedInFight push). The open-time id is also recorded on the pushed
census entry for audit. Records predating the field fall back to the
close-time id. The fast branch (which pushes directly, never through
closeFightRec) does NOT use the mapping — its outcome already reads vDie
via causal deaths — but it hardcodes `diedInFight: []`, so its party list
understates in the analyzer print; follow-up, not fixed here (fastW4 was
empty on all 10 seed-runs).

**Proof test** `scripts/test-m2b-scholar-open-r171.js` (runs the real probe
on seed 89702, 60 days, temp dir):
- v1 (named fixture): RED on the unfixed probe (Ivy/Ines/Wanjiru all
  `otherEnd/diedParty=[]`, control Meera PASS), GREEN after the fix (4/4).
- v2 (property, current): after the rebase the fixture moved (see §Rebase),
  so the test now asserts the mapping PROPERTY over whatever scholar
  deaths occur — every fight whose causal deaths include its own
  scholar-at-open must read vDie/dieFlag/diedInFight/scholarDiedInFight,
  non-vacuous (fails loudly if no scholar-death fight occurs), plus a
  distinct failure for causal-death fights carrying no scholarIdAtOpen
  (probe predates the fix). Validated against corpora: FAIL on the pilot
  (7 field-absent violations), PASS on the re-run (7/7), PASS on the
  new-substrate run (3/3). Live post-rebase run: PASS 3/3 (Saiful Dutta
  d47, Peyton Michalski d48, Chris Thompson d60).

## Re-runs with the fixed probe (this adoption)

Pass A re-run (`perseed-endgame-r171-rerun-a/`, 583s, exit 0) and pass B
re-run (`perseed-endgame-r171-rerun-b/`, CAPSTONE=1 BUYOUT=1, 170s, exit
0). Same seeds/policies as the pilots.

- **Trajectories identical to the pilots except the M2b fields** — verified
  by full per-seed JSON comparison stripping the 5 M2b fields
  (outcome/dieFlag/diedInFight/scholarDiedInFight/scholarIdAtOpen): all 10
  seed-runs identical. The fix is probe-side read-only instrumentation
  (no game state, no RNG), as designed.
- **89704 full-seat win reproduces exactly** (pass B): military_tribute
  d77, Jorge + Henrik, sat full d90, firstFullSeatDay 77. All 5 seeds
  match the pilot on seat/satDay/won/capstone in both passes.
- **M2b-attribution now 7/7 named on both passes** (was 1/1): d54 Peyton
  Michalski, Chris Thompson, Agnese Barbagallo; d56 Ivy Wang, Ines
  Duarte, Wanjiru Kamau, Meera Reddy — all with named diedParty +
  scholarDied=true + causal registerDeath. Analyzer verdicts otherwise
  identical to the pilots (A 39 GO/2 NO-GO, B 37 GO/4 NO-GO; the only
  other changed lines are the M2-census outcome lists, one M2d label, and
  the KILL-ANATOMY vDie/vFlee/otherEnd counts, all following from the
  fix). M23 GO (delivered 1/1, pricedFull 1/1), M24 GO (onHand=4 need=2
  paid=2), M25 VACUOUS NO-GO (unchanged).
- Corpus purity: re-run dirs contain only per-seed JSON + transcripts;
  no diagnostics in the pilot dirs.

## Dark probe (prereg Q7)

Full re-run as r171 (all 7 variants, fresh dir
`perseed-endgame-r171-dark/`, exit 0): **7 variants, one failed step —
`v1a-loss:D2-twist-fired`, the expected curdle** (the loss variant's D2
twist is supposed to curdle, not pass), identical to r162/r158.
- S1 HOLDS: the v3 walk-out line names **Amelia Moon**, not Bill Palmer
  (sitter coda ok; bearer <redacted> named in walk-out).
- S2 HOLDS: D1–D4/D6 hold (branch-dark on all variants; trial fight live
  + resolved + resume on v1a/v1b/v1c; finals + ending recorded everywhere;
  v5 day-floor withholds the win as designed; conscript gate/refusal ok).
- The dark rig's "For a full seat" line names the ladder and the capstone
  honestly (same as r162).

## People check (SENSE-TESTING LAW)

Read in full: 89704 pass-B finale (119 lines, the full-seat win), 89704
pass-A (41), 89701 (69), 89705 (186); sampled 89703 tail (finale).
**The finales read as people and earned.** The full-seat dark-relay finale
is specific and morally costly ("You say yes. The word is small. The pods
open — not like morning. Like a barracks." Rosa's aunt / Tiare's mother in
the row, "Rosa will remember the exact shape of your hand when you did
it"; "The village doesn't cheer. The village has never been this quiet.";
"The System is delighted. That's the worst part."). The Feared pledge,
the Oversight coda, the War Path audit (named days/killers), and the
Pantheon beat ("gods, it turns out, have politics") all read as people.
Q8: YES — the full-seat finale reads as earned, not a default. The pass-A
89704 lesser finale carries the same dark content with the "Merge fully.
No way back." final (vs pass B's "Become its voice."), and honestly names
the gap ("For a full seat, the ledger still wants: no capstone deed
delivered").

Senseless clusters filed in `sim-findings.md` (2026-11-10, "FINALE READS
EARNED, WINDOW READS ROBOTIC"): (1) EATING LOOPS — the bot eats its
stockpile one item at a time in the announce window (~25x identical
blackberry lines on 89704-B, ~9x "You eat Foraged food (200 kcal)" on
89705); reads as a stuck record. (2) POST-FINALE ORDERING — foraging
lines land between the merge paragraph and OUTSHONE in both 89704
finales; keepsake lines land AFTER the Oversight coda's closing line in
89701/89703/89705. (3) "The The Big-Eyes freezes" — doubled article in
the stun line (89703, 2x). (4) Hit lines use the monster KIND id ("Ruby
hits influencer for 12") instead of the display name (Big-Eyes).
(5) Scream ability line repeats verbatim from 4 fighters in one fight
(89703). (6) Same short line from different mouths in one window ("Stay
close, yeah?" Ivy + Nadia; "Huh. Never been this way before." Omar +
Gerald) — thin small-talk pool. (7) RECURRENCE of the filed r168 item:
role re-pick loop re-assigns Scout twice (Sanne → Ethan → Sanne, 89705).

## Telemetry

`node scripts/telemetry-check.js --baseline <goal>/hidden_files/
telemetry-baselines/endgame.json --current 'evidence/2026-11-10/
perseed-endgame-r171-rerun-{a,b}/*.json' --metrics
veterans.unlockedWave,won,peakLivingVeterans` — **quiet on both passes**
(5 files, 3 metrics, no large deviations), exit 0. Baseline NOT rolled on
a quiet check, per r162 precedent. (r51-era maxTier/satPenalty keys not
compared — mixed-regime file, per its own note.)

## Gate

`node scripts/check.js --quick` in the worktree (before the rebase):
**291 passed, 9 failed in 1157s** (load avg ~11; the gate ran long).
Adjudication, every failure:
- 4 standing pre-existing: mobile-combat-cadence (Continue wrap),
  occupation-panels (real CLI workflow), phone-frame-proof (stale receipt),
  establishment-r20-fixes (racks-full next-day voice, expected 2 got 1).
- 2 load artifacts, proven standalone: synergy-stall (120s gate timeout;
  standalone exit 0 in ~135s — longer than the gate's 120s job budget),
  capable-bot-20261014 (120s gate timeout; standalone 42 passed, 0 failed).
- 3 proof-family (proof-update, workflow, cache-flags): PRE-EXISTING BASE
  STALENESS. The branch tree was exactly `7c2591d1f` and this branch
  changed zero manifest inputs (all new files are probe/test/evidence —
  none under `src/`, `scripts/policies/`, and not sim-harness.js /
  sweep-compare.js / index.html), so the retained proof was already stale
  at the base. Resolved by the rebase (see §Rebase): post-rebase
  re-verification on the rebased tree is **proof-update 9/9, workflow 9/9,
  cache-flags 4/4, all green**, plus the M2b property test PASS 3/3.

## Rebase (closeout)

Master moved during the adoption (f21b474e4 → e5c19e54e). Read
`git rev-parse master` in the main tree immediately before rebasing;
rebased onto explicit SHA `e5c19e54e20360d8f024e3b459e382e29df112ce`
(`git rebase <sha>`, exit 0, no conflicts — the branch held one add-only
commit). Branch tip after rebase: `fc556edec`. `git log master..HEAD`
re-verified after; master has not moved again at merge time (still
`e5c19e54e`).

**Amendment A2 realized:** the scholar-counts fix LANDED on master during
this adoption (`3995d21d6`, adopted as `a663f3ccf`/`fe45ff679` by the Loop A
09:15 occurrence; gate 296/4 standing). The closeout rebase picked it up
per normal discipline, as A2 provides. The pilots and re-runs in this note
measured the PRE-fix substrate; the fix's endgame effect is measured by
the NEXT endgame run, not by re-running this pilot mid-run. (The
scholarcount adoption also updated 3 ladder tests: scholar + 1 villager
reads ready, payable 1; delivery still refuses — the M24 question A2
flagged for the next run's prereg.)

**Fixture move on the new substrate:** master also landed `sim-roleform-b`
(`e5c19e54e`, role-formation first numbers — coverage Tier 1 #1 of the
MEASURE ALL program). On the new substrate, seed 89702's first 60 days
play out differently (village survives past d56; 5 census fights, not 9;
scholar deaths on d47/d48/d60 instead of d54/d56). The M2b proof test's
v1 named fixture therefore failed post-rebase — not a fix regression:
the fix is verified working on the new substrate too (all 3 scholar
deaths mapped, see §M2b). The test was rewritten as the property
assertion (v2) instead of re-pinning names; the old fixture is recorded
here and in the commit message. Lesson for the next run: trajectory-pinned
proof tests go stale when a sibling landing moves the seed; prefer the
property form.

## Metric review (§14 — revisions for the NEXT run, never re-scored here)

- M2b: revised this run per r162's proposal; the party restriction now
  classifies correctly (7/7 named, was 1/1 masked). Kept as-is for the
  next run. Remaining gap (not a revision): the fast branch hardcodes
  `diedInFight: []` — a fast fight with a causal scholar death would read
  vDie but print an empty party list; the next arm touching the fast
  branch owns it.
- M25: vacuous again (no in-window day with pantry ≥8000 at Haven and
  nothing ready). Proposed revision for the next run: a buy-out policy
  that attempts earlier (e.g. on peak ≥ 3 without the deedGate condition)
  or a tribute-first policy that banks a second living veteran — proposed,
  not applied mid-run.
- M3-conversion: NO-GO persists (armB kills 1 vs armA 8). Kept.
- M23/M24: kept from r162; both GO on the re-run.
- M2b proof test: now property-based (see §Rebase) — the fixture-move
  lesson above is the revision.
- Next run's prereg must say how readiness and delivery agree once
  readiness counts the scholar (A2: scholar+1 reads ready while delivery
  of 2 non-scholar veterans refuses).

## Closeout

- Commit 1 (`a869d9c46`, rebased to `fc556edec`): probe M2b fix + proof
  test + analyzer + dark probe + prereg + pilot/re-run/dark corpora +
  logs + gate log (86 files). Safe-commit index clobber struck (all 86
  files D + ??); repaired via the ls-tree pipe; status empty + diff HEAD
  empty verified. The commit is probe-side only — zero src/js.
- Commit 2 (this run note + updated M2b property test): see `git log`
  on the branch — this note is committed as part of it, so its own SHA is
  not self-recorded here; the merge SHA is reported in the adoption
  closeout to the main session.
- Merge: `git merge --ff-only journey2-endgame` in the main tree; HEAD +
  ancestor check in a separate command; tree released done-merged; branch
  deleted.
- Rotation-b: 4 → 5 (verified the file reads 4 before writing 5).
- Lock: `playtest-loop-2.lock` (`2026-11-10T16:13:48Z`, the 10:00 run's)
  deleted after re-reading at closeout.
- Main tree verified clean at closeout.
