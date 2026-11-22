# Loop B round 0130Z — adoption round record (ADOPTION of timed-out round)

Run: `fleshout-loop-b-20261122T0130Z`, axis winnability chain, base master
`c8708ad2c`. Claim: `hidden_files/lever-claims/fleshout-loop-b-20261122T0130Z.json`
(arms sim-doorflee2-b + sim-launchstate-b, started 2026-11-22T01:33:00Z).
The dead run timed out at ~03:25Z (2h) with both arms merged but the
gate aborted, no round record, tracker untouched, claim + lock still in
place. The adoption wrote this record, updated the tracker, and closed
out. A second scheduled occurrence (0330Z) started the same adoption
in parallel, detected this live coordinator, and FROZE — but not before
running the full gate on tip `f80f68b8c3bf` (339/5, log
`hidden_files/check-quick-0130Z-adoption.log`, verified by this
adoption from the log — no re-run), deleting the 0130Z lock at ~03:52Z
under the 90-min fallback, retiring the claim to `.DEAD`, and re-running
both arm proofs on merged master (see Arm 1/Arm 2). The 0330Z handover
is `hidden_files/adoption-0130Z-handover-0330Z.md`. Both arms merged
locally, pending ship. No push, no version bump, no live verification —
the ship loop owns those.

Note on the start: STALE-LOCK RECOVERY at run start — the 2030Z B lock
was ~5h old (past the 90-min fallback); its adoption coordinator was
LIVE at run start and finished closeout during the guard check (round
record c8708ad2c on master; lock + claim deleted by the adoption
itself ~01:31Z). No lock deleted by this run.

## Arm 1 — sim-doorflee2-b: NO-GO on F1 only (merged 4266e6cce)

Leader-survival-only hold for pinned-door fights, on the held
sim-doorflee-b port. Evidence: `evidence/2026-11-21/sim-doorflee2-b.md`
(prereg `sim-doorflee2-b-prereg.md`, frozen 2026-11-22 ~02:15 UTC, no
amendments). Band 106809–106830 (designated reuse, 8 seeds), 150d
death-aware, competent policy. Substrate both legs: SENSEEXPED=1
PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 LAUNCHSURVIVE=1
ALLYSLOT3=1 PINQUAD=1 DMGPIN=1; armed adds DOORFLEE2=1.

The lever: a pinned quad at a door holds while the LIVE race says it is
winning AND the leader themself can survive the whole remaining fight
(live HP > incoming rate × rounds left to kill) — the DOORFLEE hold
with the leader-next-round guard replaced by a whole-fight guard.
Ported from the HELD branch `sim-doorflee-b` (tip `e71dd5ea4`, base
`3329f4441`) as `git diff 3329f4441 e71dd5ea4 -- src/` (6 files) onto
`0ea9789d7`, verified (port diff sha256 matches; fieldFights.js,
party-wiring.js, villager-agency.js byte-identical to e71dd5ea4;
game.js, villager-brain.js, win-plan.js differ by exactly the
base-move hunks and nothing else; the #2634 pick line kept verbatim).
The DOORFLEE → DOORFLEE2 replacement is confined to
`src/js/fieldFights.js`. Env-gated OFF by default — NO default flip.
The held branch is NOT merged, NOT modified, NOT rebased.

Frozen-bar verdict: **NO-GO, F1 only.** Armed 9 flees on 16 fought
doors vs control 8 on 11 — the flee rate drops only 16.5pp against a
20pp bar, and the count (9 vs ≤ 4) is nowhere near it. Everything
else passes: fresh door kills 6 vs 3 (P2), damage 0.935× control
(P3), M5 guardrail `review_required` with NO `regression_signal`
(deaths/100d +1.40, CI 0–4.11), B1 16/16 (100%) ally3Vid, B2 3,408
total ally3 damage, B3a kill conversion +0.51pp, B4 substrate clean
8/8 + 8/8. Proofs green: M1 18/18, M2 35/35, M2w 16/16, M3 29/29,
M3d 49/49, M3e 25/25, analyzer selftest 11/11.

Hold ledger (6 held fights / 9 hold-rounds): 1 kill (106830 d98
algorithm — transcript line-for-line identical to doorflee-b's §5),
2 stretched-then-fled, 3 no-observable-change, **0 hold deaths**.
The guard does its design job (no leader dies on a held door) but
fires on only 6 of 16 doors and converts only 1 — too weak to move
the flee rate 20 points on a 16-door denominator. The count bar
binds partly because the armed leg fought 5 more doors (the hold
kept parties alive long enough to reach them).

Wall (control vs armed, 8 seeds each): wins 0/8 both, national 0/8
both, wave 5 reached 3/8 → 4/8, median survival 136.5d → 139d,
survived 2/8 → 3/8, village deaths 681 → 704 (longer-lived villages
accumulate more deaths; per-100d guardrail passes).

Finding #2619 stays OPEN on kill conversion. Next arm inputs, in
order: (1) the hypo-floor alternative — floor each fighter's
hypothetical HP at 0 in the P4 pool, attacking the flee at its
source (the misread) rather than at the decision; (2) HP-gating
door parties — the formation blank persists in milder form (0 doors
below 25 HP entry, but 25/26-HP leaders still walk into doors; the
106820 d46 eater death is the exhibit).

## Arm 2 — sim-launchstate-b: DIAG-NO-GO, completeness (merged 4812f62f1)

Per-part holder-state recorder instrument. Evidence:
`evidence/2026-11-21/sim-launchstate-b.md` (prereg
`sim-launchstate-b-prereg.md`, frozen before any judged sim;
AMENDMENT 1 + CORRECTION 2026-11-22 appended, frozen body
untouched). Band 107301–107308 (fresh, verified zero hits), 8 seeds,
150d death-aware, competent verbatim. Instrument only — `scripts/` +
`evidence/` only, NO `src/js` change. The launch-engine lever (a
trusted villager at Haven as a wave-4+ companion) is NOT built here —
it lives in villager-brain.js/win-plan.js, blocked on the held
sim-pinquaddoor-b branch.

Frozen bar (a) required 0 unknown across all instance-days AND 0
unexplained parts in the Leg S ledger. The day-level half passes
outright (B′ unknown = 0; the 4 B-unknown days all explained by
Taxonomy H; Leg R reproduces the 10 launcheng unknown days exactly,
10/10). The per-part half misses by **2 parts of 324** — both seed
107305, day 150, part 3 (`no-rows`): each holder was at Haven for
parts 0–2, scored, then a wave-4 field encounter consumed part 3
(they fled), and the recorder — which samples inside `objTick` at
Haven — never fires for that part. Named gap: the Leg S ledger has
no per-part `field-encounter` fallback (the day-level taxonomy has
one). Instrument validity passes: 8/8 files, 0 instrument errors,
13,277 holder-state rows, 236 gate rows. Proof 43/43 on the branch,
analyzer selftest 66/66. A miss is a miss: **DIAG-NO-GO, not re-scored.**

Post-landing proof artifact (0330Z occurrence, verified from
`/tmp/launchstate-proof.log`): re-run on merged master
`test-launchstate-b.js` is **42/43, not 43/43**. The 1 failure is §6
live-anchor: `anchorCommit == anchorHead == HEAD` (`f80f68b8c3bf`),
because the coordinator re-freeze (`4812f62f1`) pins the check to
`git('merge-base HEAD master')`, which equals HEAD once the branch is
merged — the "they differ" clause cannot pass on master by
construction. Instrument and judged corpus are unaffected (corpora
stay anchored at `a0a2bf26d`; analyzer selftest 66/66; doorflee2 proof
49/49 green on the same tip). Neither new proof test is on the green
list, so `check.js` does not run it. The proof was NOT silently edited
green; the fix prescription (pin the anchor expectation to the frozen
base, or record the rebase-time merge-base as a constant; the driver
should record the arm's frozen base, not a run-time merge-base) is
recorded in finding #2605.

What the band shows: instances opened 19 — launched 9, target-killed
1, plan-churned-before-dawn 4, candidate-not-bid 5, unknown 0.
Binding gate (reported, not gating): **party-no-companion on 27/27
assessed days.** Pool eligible 0 on all 16 pool snapshots
(first-fail selfOrScholar 32, notRanger 53, away 25, eligible 0).
The launch engine still denies every launch for want of a companion.

Wall: wins 0/8, national 0/8, table 0/8, wave 4 unlocked 8/8,
wave 5 unlocked 4/8, median survival 137 days, survived 3/8,
deaths 608, standing-199 stall 3/8. In plain words: every village
reaches wave 4, half reach wave 5, none wins, none reaches national
standing — the same wall as the launcheng band, and the launch gate
(no companion) is still the binding denial on every assessed day.

Finding #2605 stays OPEN as a lever question — the gate is named,
the instrument to close the last 2 parts is named, the lever is not
yet built. Next instrument step: a per-part `field-encounter`
fallback reading `v4encounters` rows for the day.

## Gate

`node scripts/check.js --quick` on tip `f80f68b8c3bf` (run by the
frozen 0330Z occurrence; log
`hidden_files/check-quick-0130Z-adoption.log`, read and classified by
this adoption — no re-run, and the slot was busy with two playtest
gates at verification time): **339 passed, 5 failed in 962s, 0
attributable** to the doorflee2/launchstate arms. The 5 failures are
exactly the standing families:

- `test-living-garden-deed-attainment.js` — 120s timeout (exit null,
  120.3s), standing deed-attainment family.
- `test-one-person-army-deed-attainment.js` — 120s timeout (exit null,
  120.1s), standing deed-attainment family.
- `test-measurement-proof-update.js` — exit 1, 3.6s, measurement-proof
  staleness.
- `test-measurement-workflow.js` — exit 1, 2.8s, measurement-workflow
  neutrality proof.
- `test-phone-frame-proof.js` — exit 1, 4.5s, phone-frame stale
  receipt.

No occupation-panels load flake this run. Arm proofs re-run on merged
master by the 0330Z occurrence: `test-doorflee2-b.js` 49/49 PASS on
`4812f62f1` and again 49/49 on `f80f68b8c3bf` (analyzer selftest 11/11;
dmgpin 29/29 + downedtwice 25/25 embedded re-runs green);
`test-launchstate-b.js` 42/43 on `f80f68b8c3bf` — the 1 failure is the
§6 live-anchor artifact described under Arm 2, not a game or
instrument regression.

## Telemetry

`node scripts/telemetry-check.js` (baseline
`hidden_files/telemetry-baselines/scale-wall.json`,
`--allow-recorder-corpus`, `--sweep-rows`) on all three corpora —
`perseed-launchstate-b-107301-107308/`, `perseed-doorflee2-b-control/`,
`perseed-doorflee2-b-armed/` — gives the SAME 3 LOUD lines on each:
wins 16 → 0, national 12 → 0, table 16 → 0. EXPLAINED regime
artifact, same signature as 1530Z/1630Z/2215Z/2030Z: the baseline is
a pre-seat regime sum while these corpora are recorder rows on bands
where no village reaches national. Baseline NOT rolled. (Without
`--allow-recorder-corpus` the launchstate corpus refuses by design
with exit 2, as recorded in its evidence.)

## Wall numbers (round, plain words)

Wins 0 everywhere, national 0 everywhere, table 0 everywhere. Wave 5:
doorflee2 3/8 control → 4/8 armed; launchstate 4/8. Median survival
~137–139 days on all legs. The scale wall still binds. The hold is
now safe but too weak to matter at pilot scale; the launch gate is
still denied on every assessed day for want of a companion. The
binding constraint has moved from the flee decision to the flee
misread (hypo-floor) and from the launch day to the companion pool.

## Closeout state

- Arms merged before adoption: doorflee2 `4266e6cce`, launchstate
  `4812f62f1` (both ancestors of HEAD at merge; branches deleted,
  worktrees released, registry entries gone — verified by the 0330Z
  occurrence and this adoption against `git worktree list` + registry).
- Gate 339/5, 0 attributable (0330Z run, log verified by this
  adoption; see Gate above).
- Findings: #2605 and #2619 already carry 2026-11-22 UPDATE lines
  from the arm workers; the 0330Z occurrence appended one further
  UPDATE to #2605 documenting the §6 post-landing proof artifact +
  fix prescription. No new findings filed by this adoption.
- Claim `fleshout-loop-b-20261122T0130Z.json` retired to `.DEAD` by
  the 0330Z occurrence (~03:52Z); content preserved in the `.DEAD`
  file.
- Lock `fleshout-loop-b-20261122T0130Z` deleted by the 0330Z
  occurrence (~03:52Z, 90-min fallback, both arm workers done, no
  live B coordinator); verified absent by this adoption at closeout.
  The 0330Z occurrence's own lock is also deleted. This adoption
  deleted no lock.
- Master tip after this round: this record's merge (see log).
- No worktree reap run by this adoption — Loop A 0215Z workers still
  hold trees (sim-tier4gate-a / sim-killloot16-a / sim-searvoice-a);
  reaping waits for a quiet moment.
- Main-tree note (from the 0330Z handover, untouched):
  `evidence/2026-11-22/killlootfixture-a-ctl.json` sat at 0 bytes at
  ~04:11Z during Loop A's live killloot16-a closeout; by ~04:17Z it
  was 13,181 bytes and the main tree clean — the writer had finished.
  Left alone throughout.
