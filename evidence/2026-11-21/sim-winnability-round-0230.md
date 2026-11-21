# sim-winnability-round-0230 — Loop B lever round fleshout-loop-b-20261121T0230Z

**Round verdict: 0 arms LANDED, 2 arms HELD. Winnability chain stays converging
(NOT converged).** Arm 1 re-registers the pinquaddoor bars and judges them on a
fresh band: NO-GO — the pin delivers the party and the door, but the door has
now killed 0/31 wave-4+ monsters. Arm 2 builds the #2632 re-seed-day fireside
beat, proves it (old-code control included), and observes it firing in live
play — HELD unmerged with the combined reseed fix, pending the re-derived bar
and an analyzer fix the observation exposed. Both held branches keep holding
`src/js/villager-brain.js` + `win-plan.js`, so #2605 stays BLOCKED for the next
run too.

## Run setup

- Run: fleshout-loop-b-20261121T0230Z. Base master `f9ed3a851` (Loop A 0015Z
  round evidence). Master moved once under the run (journey-crisis r261,
  `b7c8eff2c`, evidence-only + dodge fix, zero overlap with either arm).
- Loop A closed its 0015Z round at 02:31:26Z (`f9ed3a851`: lendpool DIAG-GO,
  fibersupply DIAG-NO-GO, fiberfetch NO-GO CONCEPT-DEAD) but left its lock +
  claim as closeout debris; its arms (#2590/#2628/#2629) were NOT touched.
  Loop A started a new run at 03:15Z (fleshout-20261121T0315Z, rollwall-a +
  holdersupply-a) — live at closeout, NOT touched.
- Tracker latest review at run start: 0030Z (commit `7f5693467`). Next blanks
  taken in order: (2) #2619 pinquaddoor re-prereg, (3) #2626/#2632 re-seed-day
  beat. (1) #2605 launch engine BLOCKED — verified before spawning that both
  held branches hold `src/js/villager-brain.js` + `win-plan.js`
  (`git diff --name-only master..branch -- src/js/`). (4) #2590/#2628/#2629
  owned by Loop A this round.
- Claim `fleshout-loop-b-20261121T0230Z.json` written before any sims; lock
  created 02:31:00Z. Pre-flight: main tree clean, disk 45%, reap done (9/16
  trees active).

## Arm 1 — sim-pinquaddoor-reprereg-b (finding #2619) — NO-GO, HELD

Branch `sim-pinquaddoor-b`, tip `be34358a7` (prereg `8b6e3eab`, rebased base
`3a821fa86` on master `f9ed3a851`). Rebase clean, 7 commits, `src/js/` delta
ZERO files across the rebase. Worktree clean, only committed work.

Corrected prereg (frozen before judged sims, per wide evidence §6): B4
sanity-only (control expedition doors = 0 AND control pinned fights = 0,
three-vid count dropped); B3(b) split into B3(b1) ≥1 pinned-quad wave-4+ kill
AND B3(b2) ≥1 door kill, BOTH required for GO; B1 as fought-subset rate
(≥50% among fought pinned fights, absolute floor ≥3 rows); B2/B3(a)/M1/M2/M2w
unchanged.

Fresh band 106701–106716 (verified fresh; 10 loose-pattern hits all false
positives), 16 seeds, 150d death-aware, substrate SENSEEXPED=1 PARTYSIZE4=1
VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 LAUNCHSURVIVE=1 ALLYSLOT3=1
(+PINQUAD=1 armed), competent policy `1884c8852d38`. Legs chunked 8+8, all
exit 0, 0 instrument errors on all 32 per-seed files.

| Bar | Observed | Verdict |
|---|---|---|
| M1 test-allyslot3-b.js | 18/18 | PASS |
| M2 test-pinquaddoor-b.js | 35/35 (selftest 26/26; run twice) | PASS |
| M2w test-pinquaddoor-wide-b.js | 16/16 (run twice) | PASS |
| B1 fought-subset rate | 3/5 = 60.0% (floor 3 rows, exactly at floor) | PASS |
| B2 ally3Dealt | 331 total, max 125 | PASS |
| B3(a) kill conversion | armed 4.7% vs control 5.4%, floor 3.4% | PASS |
| B3(b1) pinned kill | 0 in 6 pinned fights (vFlee 4, evade 1, vDie 1) | MISS |
| B3(b2) door kill | 0 in 4 doors (vFlee 3, evade 1) | MISS |
| B4 control sanity | 0 expedition doors, 0 pinned fights | PASS |

**GO requires all bars. B3(b1) + B3(b2) miss → NO-GO. The lever stays HELD,
unmerged, flag-gated OFF.** Cumulative door kills are now 0/31 (27 wide + 4
here). The pin delivers the party (4 doors, third ally dealing 122/125/84 in
every fought door fight) but the party still cannot kill a wave-4 monster:
best door fight (106707 d67 eater) ran 7 rounds at ~81/round against 953 HP
and fled at 38 HP. Diagnostic re-read: the wide band under the corrected bars
would still be NO-GO on B3(b2) alone (B1 68.2%, B3(b1) 1 kill, B4 pass) — the
corrected bars relocate the failure from the control to the door, as designed.
Band launch-thin (4 quads armed vs 18 wide); 12/16 seeds have zero pinned
fights. S3 SEEK effect holds (pinned seek 2/4, avoid 0/4 vs unpinned seek
2/120, avoid 57/120).

Wall (reprereg band): wins/national/table 0 both legs; standing ≥200 5/16
both; wave-5 5/16 both; wave-4 16/16 both; survived 10/16 both; median
survival 151d vs 150d; deaths 1,181 vs 1,156. Panel review_required, 16 paired
cases, NO regression_signal (deaths/run −1.56, interval includes 0).

Sense-test: three door fights quoted blow-by-blow in the arm evidence. One
incoherent beat: on the 106705 d144 audit door fight, Lenkina is hit at 0 HP
and "goes down" a second time — filed as new finding #2634 (numbered by the
coordinator; the worker's entry carried no number). Door-line order quirk
(2, 3, 1) persists, cosmetic.

Evidence: `evidence/2026-11-21/sim-pinquaddoor-reprereg-b.md` + prereg
`evidence/2026-11-21/sim-pinquaddoor-reprereg-b-prereg.md` + panel
`evidence/2026-11-21/pinquaddoor-reprereg-b-panel.md`; corpora
`evidence/2026-11-21/perseed-pinquaddoor-reprereg-b-control/` + `-armed/`
(16 files each).

## Arm 2 — sim-reseedbeat-b (findings #2626 / #2632) — BEAT BUILT + PROVEN, HELD

Branch `sim-reseedexpiry-b`, tip `80e79fedc` (build `3815f2076`, evidence
`770b01212`, corpora `befe2af92`, test-pin `e9edc1cd8`, §9 bookkeeping
`80e79fedc`). Rebase onto master `f9ed3a851` clean 9/9, new base tip
`6ec74e210`. Worktree clean, only committed work. **HELD, not merged; the
combined reseed fix stays held with it.**

The beat: when an expired plan re-seeds AND launches, the fire now speaks one
line at the launch — *"Amina is hunting Buffering now — the fire found a new
trail."* The commit stamps `plan.reseedLaunchBeat` instead of speaking;
`winPlanReseedLaunchBeat` speaks it at the actual departure on both paths
(`winPlanDepart`'s `launchParty` and `vbrainExecuteDepart`'s party_launch
branch), only while the plan still carries the stamped target, clearing the
stamp before speaking (at most once per launch, never for a non-expired
re-seed). The old commit-time line is gone, so no double-speak. The driver's
SAY_RE gained `"new trail"` so the corpus records the line.

Proofs (all green on the rebased tip): new `scripts/test-reseedbeat-b.js`
**30/30** — §A pins, §B staged Amina-shape fixture on both departure paths
(incl. the split-day shape: silent at commit, one line at the later launch),
§C **old-code control** (same fixture against pre-change `win-plan.js`
launches with NO launch-beat line — fail on old, pass on new; pinned to
`6ec74e210` after HEAD moved under it), §D negatives (dead-target re-seed,
no-rumor hold, second launch, flag off, stale-stamp clearing). Fixture gear is
the measured shape (holder armed + armored, companion likewise, party of 2).
Regressions: `test-reseed-b.js` 97/97 (96 + 1 new launch check),
`test-reseedexpiry-b.js` 58/58, `test-reseedwide-b.js` 28/28, analyzer
selftest 57/57 (52 + 5 §H). Two existing tests updated on purpose (the beat
moved commit→launch).

Live observation: one 8-seed armed band, fresh seeds 106701–106708, 150d,
policy `1884c8852d38`, anchor `3815f2076`, 0 instrument errors. **One expiry
occurred and the beat fired in the wild**: seed 106705, Amina — expiry d37
(*"Amina was ready to hunt Loud-Eyes — but the fire says that kind is already
put down, and no one has seen another trail. The hunt is called off."*),
launch beat d53 (*"Amina is hunting Loud-Eyes now — the fire found a new
trail."*), via the brain path, 16 days later, re-seeded onto spool (live again
via a d40 sighting). No encounter rows in her window. No control leg —
observation only, nothing re-judged. Wall: wins 0, national 0, table not
observed, wave 5 unlocked 4/8, wave 4 8/8, survived 6/8, median survival
150.5d, starvation 1 of 620 deaths.

Re-derived 7-day bar (proposal for the NEXT prereg, NOT a re-score): frozen
pool 4 expiries / 32 seeds (re-seed days 14, 6, 3, 8); this band adds one
(16d) → extended 5/40. Proposed: **primary re-seed within 14 days, ≥ 2/3,
n ≥ 3 floor** (frozen 4/4, extended 4/5); 7-day share reported only (2/5);
encounter-based "fought again" (rounds > 0) is 0/5 — a diagnostic, not a GO
bar. The frozen NO-GO verdict stands un-re-judged.

Instrument finding (new finding #2633, filed by the worker): the analyzer
missed the 106705 expiry (`expiryRuleMismatch` 1, pooled NO-GO INSTRUMENT):
`expiriesOf` requires `companionExped === false`, but the dawn companion was
already out on an expedition. The verdict is an instrument gap, not a lever
verdict — the next arm on this question must fix the counter first (relax
`expiriesOf` path (a) to count an expiry on dead target + pool 0 + result
normal regardless of `companionExped`, with a companion-out expiry fixture in
the analyzer selftest) before judging any expiry denominator.

Sense-test note (evidence, not a defect): the launch beat repeats the display
name "Loud-Eyes" from the call-off — the kind came back via a new sighting,
and the line never says the kind was seen again. A possible future wording
tweak.

Evidence: `evidence/2026-11-21/sim-reseedbeat-b.md`; corpora
`evidence/2026-11-20/perseed-reseedbeat-b-106701-armed/`; analyzer output
`evidence/2026-11-21/reseedbeat-b-106701-analysis.json`. Evidence §9 names
`e9edc1cd8` as the tip; the actual tip is `80e79fedc` (a one-line §9
bookkeeping commit) — substance accurate, pointer one commit behind.

## Telemetry deviation check (coordinator-verified, both corpora)

- Pinquaddoor reprereg armed corpus: exit 2, designed recorder-corpus refusal
  ("all 16 --current rows carry top-level anchorCommit").
- Reseedbeat armed corpus: exit 2, designed recorder-corpus refusal
  ("all 8 --current rows carry top-level anchorCommit").
- Baseline NOT rolled, no LOUD lines, no investigation item. Wall numbers are
  reported directly in each arm's section above.

## Infrastructure

- Safe-commit index clobber hit Arm 1 after both commits and Arm 2 three
  times (known class) — every commit verified correct by blob hash, repaired
  via `ls-tree -r` + `update-index --index-info`, worktrees verified clean.
- Arm 1 chunking held: armed chunk 2 ~11 min, no SIGTERM (8 seeds/call).
- No `check.js --quick` on either arm (sibling gates running at closeout;
  Arm 2) / arm gates are the proof tests (Arm 1: M1/M2/M2w all green twice).
- Write flap quiet this run.
- Both held trees left registered with FRESH heartbeats (03:33:59Z /
  03:34:00Z) so the reaper will not touch them. Master moved once under the
  run (journey-crisis r261 `b7c8eff2c`); neither arm rebased onto it — Arm 1
  is HELD on its `f9ed3a851` base, Arm 2 is HELD on its `f9ed3a851` base; the
  next run rebases whichever arm it adopts.
- Loop A lock `fleshout-20261121T0015Z` + claim still present at closeout
  (closeout debris from the closed 0015Z round; the new 0315Z run uses its own
  lock/claim) — NOT touched, NOT deleted; they belong to Loop A.

## Findings

- #2619 stays OPEN. Mechanism proven, lever built, kill conversion now
  measured on two bands: wide 1 pinned kill / 38 pinned fights (door 0/27),
  reprereg 0 pinned kills / 6 pinned fights (door 0/4). Cumulative door kills
  0/31. Next move is a damage lever carried with the pin (#2605), not another
  re-registration.
- #2626 stays OPEN (combined fix HELD). Beat built + proven + observed live;
  7-day bar re-derived (14-day primary proposed); analyzer counter gap is now
  finding #2633 and must be fixed before any expiry denominator is judged.
- #2632 stays OPEN as a lever question but its build is DONE: the beat exists,
  is proven, and fired in the wild. It lands only with the combined fix.
- #2633 NEW (open): expiry analyzer misses expiries whose companion is
  already out.
- #2634 NEW (open, numbered by the coordinator): a downed companion is struck
  again and "goes down" a second time.

## Winnability chain stays converging (NOT converged)

The launch gate is named, the pin's kill conversion is unproven at the door
(0/31), the re-seed fix is built-complete but unlanded, and the standing-199
stall / deed-gate walls are unchanged by this round. Next blanks, in order:
(1) #2605 — launch-engine lever (trust-gated Haven companion) after a
per-part holder-state recorder closes the 10 unknown days; do not start it
while the held branches hold villager-brain.js/win-plan.js; (2) #2619 —
damage lever carried with the pin (the pin delivers the party; party damage
~81–90/round cannot kill wave-4 HP 850–1500); (3) #2626 — fix the #2633
analyzer counter, then judge the combined fix under the re-derived 14-day
bar; (4) #2590 / #2628/#2629 — Loop A owns this round, do not duplicate.
Claim deleted; lock deleted.
Evidence: arm evidence `evidence/2026-11-21/sim-pinquaddoor-reprereg-b.md`
(branch `sim-pinquaddoor-b`, tip `be34358a7`) +
`evidence/2026-11-21/sim-reseedbeat-b.md` (branch `sim-reseedexpiry-b`, tip
`80e79fedc`).
