# sim-scale-onramp-round-0815 — Loop A lever round (ADOPTION)

Run `fleshout-20261122T0815Z`, axis scale-onramp. The round timed out
before closeout; this record is the adoption closeout by the
coordinator. Base `e67224635` (the 0215Z round record); master at
adoption closeout `dd740ad83` (the gunlife merge — this record's
commit follows it).

All three arms were the 0215Z adoption's next blanks, in order:
(1) trace one granted gun's life (#2667); (2) a code-level read of
the tier-4 kill-roll rate (#2649); (3) crossbow/sling narration,
same class as searvoice. All three ran; all three are GO.

## Arm 1 — sim-killrate-a: CODE-LEVEL READ OF THE TIER-4 KILL-ROLL RATE

Finding #2649. Evidence: `evidence/2026-11-22/sim-killrate-a.md`.

- Code rate quantified from `src/js/game.js` rollAlienLoot: pool
  15, searcaster 1/15, taper 5/10/15/20%, tier4Chance 0.25. Fresh
  band: 12 tier-4 in 88 drops = 13.6% vs the 4.4% point prediction —
  3.1x, outside 2x, BUT explained (§4): conditioned on the fresh
  band's measured tier-3-base share (39.8%) the code predicts
  2.0–14.4%, observed inside; implied up-rate 34.3% in the per-wave
  range; pooled 17/193 = 8.8% within 2x (bound 8.82%) by a hair;
  searcaster 0/193, P(0) = 0.32 at the measured rate.
- **Verdict: GO — code rate quantified, band-observed tier-4 rate
  reported, sized band delivered (49 seeds pooled)** for P(>=1
  kill-loot searcaster) >= 90% (tier-4 8.8% x 1/15 per drop, 8.04
  drops/seed -> 4.6% per seed).
- Wall: wins 0/8, national 0/8, wave-5 5/8, median survival 150.5d
  (analyzer gameDays; driver-days median 139.5d).
- Findings filed: #2650 CONTEST GUNS FIRE TWICE, THEN GO DRY
  (§6 — a bundled kill-loot gun fires 2 shots, then the cells are
  spent); #2651 EARLY TIER-4 KILL DROPS NEED APEX ATTRIBUTION
  (§4/§9).
- Merge: `96f638c8a` (record rebase onto `4681e740f` hypofloor-b, no
  arm files touched, proofs re-green, band stands). Verified an
  ancestor of HEAD by the adoption.

## Arm 2 — sim-crossvoice-a: CROSSBOW/SLING VOLLEYS READ AS THEIR OWN WEAPONS

Leftover from searvoice-a (#2623 class). Evidence:
`evidence/2026-11-22/sim-crossvoice-a.md`.

- **Verdict: GO — the crossbow reads as a crossbow, the sling as a
  sling; the bow lines survive untouched.** All six frozen bars
  pass on the judged run (exit 0). The crossbow fixture still
  passes (`--compare` GO); mechanics byte-identical. Fix commit
  `a730a0612` in `src/js/fieldFights.js` (narration strings only:
  crank/bolt for crossbow, whirl/stone for sling; bow lines
  byte-identical, gun lines byte-identical). [needs-eyes].
- Adoption landing: the worker's branch (tip `8ec05e1a8`) was
  rebased onto current master `e56ea1383` — the FOURTH rebase of
  this branch — with the stop-at-pick quirk striking 3x (picks
  `d61932a33`, `1e28ad16c`, `8ec05e1a8`; each verified unapplied via
  `git diff <pick> -- evidence/` then `GIT_EDITOR=true git rebase
  --continue`). Fix patch byte-identical to the original
  `0168ec2cf` except the index-hash line. Proofs re-run on the
  rebased tip: test-killlootbundle 12/12, selftest 17/17,
  `test-crossvoice-a.js` GO S1–S6 exit 0. Merge: `1417fb148`
  (ff-only, exit 0). Worktree released done-merged, branch deleted.
  Verified an ancestor of HEAD by the adoption.
- Finding filed [fixed] in sim-findings.md (line 2674).

## Arm 3 — sim-gunlife-a: TRACE ONE GRANTED GUN'S LIFE

Finding #2667. Evidence: `evidence/2026-11-22/sim-gunlife-a.md`.

- Prereg `622a0ff20`, fresh band 107321–107328, 150d, competent
  verbatim, single ctl leg (KILLBUNDLE unset). The worker stopped
  at the cron timeout with the tracer written but buggy, no proof
  test, no band; the adoption resumed it.
- Tracer fix (before the band): `prevHolderState` clobber in the
  `st`-branch transfer path — the previous-day state is now the NEW
  holder's state, not the old holder's. Fixture-6 expectation
  corrected 4 -> 3 equipped days (the worker miscounted: day 3 is
  carried, not equipped). Regression fixture 8 added (two-gun stock,
  second transfer must still be detected). Proof that the fix
  matters: with the fix reverted the selftest fails 2 checks
  (23/25); fixed, 25/25. Proof test `scripts/test-gunlife-a.js`
  written, 11/11. Instrument commit `01ff4956f` (pre-band).
- Pre-flight on the rebased base `1417fb148`: test-killlootbundle
  12/12, analyzer selftest 17/17, test-gunlife 11/11, gunlife
  selftest 25/25. Band: 2 detached legs, 4 seeds each, ~4 min,
  8/8 files, 0 instrument errors (leg 2's first launch died
  instantly on MODULE_NOT_FOUND — it ran from /home/hatch because
  the `cd` was inside the backgrounded `&&` chain; relaunched
  with an explicit subshell `cd`; no judged numbers from the
  failed launch).
- **Verdict: GO — the trace names why contest guns never fire, on
  7 of 8 grants.** 8 grants, 7 traced (87.5% >= 80% bar).
  Mechanisms: equipped-never-led-wave4+ 4, fired 2, never-equipped
  1, unexplained-vanish 1. The LEAD gate is the mechanism: the
  volley belongs to the lead fighter only, and in 4/8 traces the
  holder carries the gun equipped for 29–65 days with cells and
  never leads a wave-4+ fight while holding it. The CELLGATE hold
  is exonerated (12 held volleys below wave 4, working as
  designed). One gun did fire — 2 shots, 1 hit, 68 damage vs a
  wave-4 Eater on 107323 day 103, after two unattributed transfers
  (chen_wei -> scholar -> hannah_kim), then went dry for 4 more
  wave-4/5 fights. One grant vanished off its holder's corpse
  (world total 2 -> 1 on day 105, no event; corpse-cap cull is the
  named hypothesis, never asserted) — the tracer names the vanish
  but its rows don't tile past it, so it counts untraced; the
  instrument was NOT changed post-band (frozen; verdict GO either
  way). A future arm can fix the tracer and re-run the analysis
  deterministically on this same corpus.
- Wall: wins 0/8, national 0/8, table not instrumented, wave-5
  4/8, wave-4 8/8, median survival 150d, village-lost 3/8, deaths
  921, starvDeaths 2.
- Merge: `dd740ad83` (rebased onto `3d7a25427` r249 gate record,
  3/3 clean, no quirk; proofs re-run green on the rebased tip
  12/12 + 17/17 + 11/11 + 25/25; analysis re-run byte-identical;
  ff-only exit 0). Worktree released done-merged, branch deleted.
- Findings: #2667 ANSWERED (line 2667 — the lead gate, with the
  next question named: why the gun's holder is never the wave-4+
  lead, party formation); NEW finding filed (line 2675):
  VANISHED-GUN TRACE DOESN'T TILE (instrument gap, fix + re-run
  analysis on the 107321–107328 corpus, no new band needed).

## Wall (arm legs)

| | killrate | gunlife |
| --- | --- | --- |
| Wins | 0/8 | 0/8 |
| National | 0/8 | 0/8 |
| Table | not instrumented | not instrumented |
| Wave-5 reached | 5/8 | 4/8 |
| Wave-4 reached | 8/8 | 8/8 |
| Median survival | 150.5d | 150d |
| Village-lost | — | 3/8 |

Crossvoice is a narration fix (fixture arms, no per-seed wall).
All seeds regional; the scale wall still binds everywhere.

## Telemetry

`telemetry-check` ran against the scale-wall baseline
(`--allow-recorder-corpus`, metrics national,table,wins,exiled) on
both per-seed corpora (killrate
`evidence/2026-11-21/perseed-killrate-a-ctl/`, gunlife
`evidence/2026-11-21/perseed-gunlife-a-ctl/`): the same 3 LOUD
regime lines as 2030Z/2315Z/0130Z on both (national 12 -> 0, table
16 -> 0, wins 16 -> 0) — EXPLAINED, regime artifact (the baseline
is the winseat regime; these corpora are pre-seat competent-policy
substrates where wins are structurally ~0; the baseline's own note
says this comparison fires a spurious LOUD), baseline NOT rolled.
Exiled quiet. Without `--allow-recorder-corpus` the corpora refuse
by design (recorder rows, exit 0 with the refusal message).
Crossvoice has no per-seed corpus (fixture-only arm) — no telemetry
input, recorded.

## Gate

`node scripts/check.js --quick` ran on the merged tip `dd740ad83`
in the adoption worktree (344 scripts, 4 parallel, 917s, log
`hidden_files/check-quick-0815-adoption.log`):
**339 passed, 5 failed, 0 attributable.** All 5 are exactly the
standing set, identical to r249/r263/social-r265:
test-measurement-proof-update.js + test-measurement-workflow.js
(the measurement-proof staleness pair), test-phone-frame-proof.js
(stale receipt), test-living-garden-deed-attainment.js +
test-one-person-army-deed-attainment.js (120s timeouts under load).
No other gate was running (ps verified before launch; the gate ran
from a script file, detached via setsid nohup). The r266
succession and r249 deepening adoptions both completed before this
gate started; Loop B 0930Z's sim-hpgate-b was still running but ran
no gate during this window (ps re-verified at gate end — the only
check.js process was this gate's).

## Flap

- The round's own window (onset 08:49:11Z) CLEARED ~09:36–09:48Z
  by machine replacement ~09:31Z (new boot `db346c9b`); onset
  reported ~02:58 CST, closure delivered ~04:06 CST. Duration
  ~50 min. Pattern change in that window: the flap returned
  mid-boot after a ~20-min clear gap — the first re-opening after
  a confirmed self-clear on the same boot, ~57–62 min post-boot,
  outside the 1–16 min restart-recurrence band; reported to Steve
  ~03:31 CST. Strace captured `write(3) = -1 EPERM` at syscall
  level in the window.
- No flap during the adoption: every adoption write (evidence,
  commits, merges, registry) succeeded; the flap-watchdog's
  04:05 CST run showed cycles 09:48–10:06Z all ALL-OK.

## Lock / claim

Claim file `hidden_files/lever-claims/fleshout-20261122T0815Z.json`
(arms gunlife/killrate/crossvoice, axis scale-onramp, base
`e67224635`) deleted by the adoption at closeout. Lock
`hidden_files/fleshout-loop.lock` (run_id
`fleshout-20261122T0815Z`, created 2026-11-22T08:17:00Z) deleted
LAST by the adoption, in the same exec call as its read, run_id
matched per-line with `grep -qx`. Rotation index 5 -> 6 written
at closeout.

## Closeout mechanics (for the record)

- Index clobber struck on nearly every safe-commit in this
  adoption (staged-D + untracked on the same files, including
  after the gunlife band commit). Repaired each time via
  `git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info`; every commit verified blob-identical to the
  worktree files before proceeding.
- safe-commit.sh does NOT accept directory paths: the first
  gunlife band commit passed the corpus dir and created an EMPTY
  commit `79ef79390` (fatal "Unable to add ... to database", then
  "Committed" anyway). Recovered with `git reset --soft HEAD~1`
  on the private branch (index clobber cleared by the reset),
  then recommitted with the expanded 11-file list as
  `67ea90361`. The empty commit never reached master.
- Rebase stop-at-pick quirk struck 3x on the crossvoice rebase
  (see Arm 2); the gunlife rebase (3/3) and the killrate record
  rebase were clean.
- Heartbeats ran until session end (adoption worktree
  `sim-winnability-round-0815`, registered; hbloop + manual
  heartbeats).

## Commits

- sim-killrate-a: merge `96f638c8a` (already on master at adoption
  start; verified ancestor of HEAD).
- sim-crossvoice-a: fix `a730a0612`; merge `1417fb148`.
- sim-gunlife-a: prereg `d7bbb4f1a` (rebased), tracer+proof
  `b50562d2e` (rebased), band+evidence `dd740ad83` (merge tip).
- Round record: this commit (follows `dd740ad83`).
