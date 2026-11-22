# Loop A 2315Z adoption — round record (ADOPTION of timed-out round)

- Run: `fleshout-20261121T2315Z`, Loop A, axis scale-onramp. Timed out
  2026-11-22T01:28:32Z with closeout incomplete; this adoption finished it.
- Base at run start: `c55bc8503` (claim
  `hidden_files/lever-claims/fleshout-20261121T2315Z.json`).
- Adoption base (master tip at adoption start): `c8708ad2c` (2030Z adoption
  round record). All three arms rebased onto it (and re-rebased
  sequentially as merges moved master), proofs re-run green on each
  rebased tip, then merged ff-only, each in its own call.
- No push, no version bump, no live verification — the ship loop owns those.

## Arms

### 1. sim-corpsecap-a — DIAG-NO-GO on the corpse-cap gun sink

Evidence: `evidence/2026-11-21/sim-corpsecap-a.md`. Verdict DIAG-NO-GO.
The cap splice (corpses.js:248-253, list capped at 40, oldest stage-4
'bones' corpse removed items-and-all) fired **301 times** across a fresh
8-seed band (107271–107278, 150d death-aware, competent verbatim) and
ate **0 guns**: not one culled corpse carried a searcaster. 32 gun-days
stranded on corpses (27 on one, 5 on another), both guns survived — one
recovered by the scholar the day its holder died, the other still sitting
on its corpse at the end, 76 death-days behind the cull frontier. Per the
frozen diag rule, **no lever is built and none is forced**; no game code
changed. The 107237 loss (grantrate §4) is real but rare — it needs a
fast-dying village AND a long-unrecovered corpse gun at once, and this
band had neither at once.

- Wall: wins 0/8, national 0/8, table not instrumented, wave 5 3/8,
  wave 4 8/8, median survival 150.5d, community lost 2/8, starvation
  deaths 0.
- Instrument: proof test 30/30, analyzer selftest 32/32 — re-run green
  after the rebase.
- Merged `ebb24ceeb` (prereg `8fe72c19c` + instrument `add1231dd` +
  evidence `ebb24ceeb`, rebased from `7c1d58928`).
- Finding filed: THE CORPSE CAP IS A REAL BUT RARELY-FIRING GUN SINK
  (finding #2635 follow-up; sim-findings.md line 2670). The census
  phantom (§3: `gunLocationsOf` counts a dead holder's equipped slot as
  a live gun) is recorded in that finding line, not fixed here.

### 2. sim-tier4pool-a — GO (lever kept env-gated OFF)

Evidence: `evidence/2026-11-21/sim-tier4pool-a.md`. Verdict GO on all
six frozen bars. The tier-4 POOL, not the gate, was the wall once the
gate opens: on the frozen 12-seed band (107271–107282, 150d, competent
verbatim, GUNRATE=1 + CELLGATE=1 + standard levers), tier-4 rolls paid
the gun **20/42 (47.6%) on the arm vs 11/39 (28.2%) on ctl — ratio
1.69×**, arm above the 15% absolute bar. Contest grants nearly doubled:
**20 vs 11 (10.6% vs 6.1% per contest, ratio 1.73×)**. Holderless
tier-4 rolls paid 12/18 (66.7%, design 50%); zero-grant seeds fell
5 → 1. Guardrails clean (starvation 1 vs 1, arm-only starvation 0,
median 151 vs 151, wins/national 0/0 both legs).

- Lever: TIER4POOL block in `src/js/game.js` (rollAlienLoot, +66
  lines) — +10 searcaster copies for holderless villages (22.2% →
  50% design), contest prizes only, switches itself off once a village
  holds a gun. **Kept env-gated OFF at the tip** (`TIER4POOL=1` only
  in node sims); a default flip is a Steve/design call.
- Wall: wins 0/12 both legs, national 0/12 both legs, table not
  instrumented, wave 5 ctl 7/12 / arm 6/12 (seed 107272 stream
  divergence, not a survival effect), median survival 151d both legs,
  community lost 3/12 both legs.
- Balanced panel (§15): review_required (exit 2, unobserved metrics);
  no material signal on observed metrics; village-deaths regression_watch
  intervals straddle 0 (trajectory noise).
- Instrument: proof test 26/26, analyzer selftest 29/29 — re-run green
  after the rebase. `node --check src/js/game.js` OK.
- Merged `a0a2bf26d` (lever+instrument+prereg `fa9d00a6b` + evidence
  `bce54a587` + corpus `a0a2bf26d`, rebased from `d15e74861` /
  `4c23dcc0d`). The 24 per-seed corpus JSONs (12 ctl + 12 arm) were
  uncommitted at timeout and were committed by the adoption as
  `e6805d6e3` (rebased to `a0a2bf26d`), filenames as the driver wrote
  them, all non-zero (3.9M per leg dir).
- Findings: #2647 FIXED (pool is the wall after the gate) and #2648
  UPDATED (gate still caps the band at ~15% tier-4 rolls; a 25%+ band
  rate needs wider eligibility — a design question, not a knob).

### 3. sim-killlootfixture-a — FIXTURE GO

Evidence: `evidence/2026-11-21/sim-killlootfixture-a.md`. Verdict
FIXTURE GO. The forced-arrival fixture stages what the pilot could not
observe: a kill-loot searcaster drops, the bundle lands (2 cells, same
holder as the gun), and the holder + a 2-ally party fight a wave-4
Herald. Arm leg: **2 shots fired** from the bundled gun before round 1
(cells 2 → 0, honestly spent); control leg: **0 shots** (dry gun:
"has Searcaster but no fusion cells"). All five frozen bars pass;
determinism re-runs identical; neutrality diff empty; holder alive both
legs (vHpLeft arm 44, ctl 61). The "reaches a fight" half of finding
#2649 is now JUDGED.

- Honest nuance: both volley shots MISSED (hit chance 0.37 each at
  range 8; P(0/2) ≈ 40% — an ordinary outcome). The bundle's cells
  bought a volley that dealt 0 damage; the kill came from the gun's
  melee fold-in (holder 64–68/round). The supply reaches the fight;
  whether it matters is a hit-chance story, not a supply story.
- The 16-seed band re-judge (107281–107296) was STARTED then stopped
  by time (driver ~2.7 min/seed; both legs ~85 min) — recorded as the
  next blank with the fixture as justification, not run and not faked.
  Partial ctl smoke only: 2 seeds, 0 kill-loot searcasters, 0 volleys.
- No live-game code change in this arm. KILLBUNDLE stays env-gated,
  default OFF, exactly as the pilot left it.
- Instrument: proof test 12/12, analyzer selftest 17/17, fixture
  compare GO — all re-run green after each rebase.
- Merged `0d283ad95` (prereg+instrument `b702ce419` + corrections
  `71525e5be` + evidence `bb499f424` + rebase `cdd604b8c` + anchor
  refresh `0d283ad95`, rebased from `299cacb28`).
- Findings: #2649 UPDATED (fixture GO, band re-judge is the next
  blank); NEW open narration finding filed (sim-findings.md line
  2668): searcaster volleys narrate as bow-and-arrow ("nocks an
  arrow", "lowers the bow", dry gun "the string stays drawn") — the
  volley block in fieldFights.js uses bow language for every ranged
  weapon.

## Wall numbers (round)

| Metric | Corpsecap (8) | Tier4pool ctl (12) | Tier4pool arm (12) | Killlootfixture (2 smoke) |
| --- | --- | --- | --- | --- |
| Wins | 0/8 | 0/12 | 0/12 | 0/2 |
| National | 0/8 | 0/12 | 0/12 | 0/2 |
| Table | n/i | n/i | n/i | n/i |
| Wave 5 | 3/8 | 7/12 | 6/12 | 2/2 |
| Wave 4 | 8/8 | 12/12 | 12/12 | 2/2 |
| Median survival | 150.5d | 151d | 151d | 150d |

The scale wall still binds: no village reaches national, none wins.
This round was a gun-supply round, not a scale lever — the wall numbers
are recorded, not moved. The binding constraint has moved from the
tier-4 gate to the tier-4 pool draw (now fixed as a lever, OFF by
default), and the kill-loot door is proven to reach a fight; the gate
itself (~15% tier-4 rolls) is the next wall.

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-2315-gate`
on the merged tip `a0a2bf26d` (log
`hidden_files/check-2315-gate.log`): **339 passed, 5 failed in 698s —
0 attributable.** The 5 are exactly the standing families, identical
to r152/r153:

1. `test-measurement-proof-update.js` — measurement-proof staleness
   pair, standing since r151.
2. `test-measurement-workflow.js` — measurement-proof staleness pair
   (retained neutrality proof), standing since r151.
3. `test-phone-frame-proof.js` — stale phone receipt, standing family.
4. `test-living-garden-deed-attainment.js` — TIMEOUT after 120s,
   standing deed-attainment family.
5. `test-one-person-army-deed-attainment.js` — TIMEOUT after 120s,
   standing deed-attainment family.

No failure is attributable to this round: the only src change is the
env-gated TIER4POOL block (default off, node sims only), and the other
two arms changed no game code at all.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-21/perseed-<leg>/*.json' --metrics
national,table,wins,exiled --sweep-rows --allow-recorder-corpus`
(all four leg dirs): **3 LOUD lines on every leg — national 12 → 0,
table 16 → 0, wins 16 → 0 — EXPLAINED, regime artifact, baseline NOT
rolled.** Same signature as 2215Z/2030Z: the baseline is a pre-seat
regime sum while these corpora are recorder rows on a band where no
village reaches national (the wall numbers above). Not a bug, not a
regression — the LOUD lines restate the scale wall.

## Adoption notes (for the next adoption)

- **Sequential rebase-merge is mandatory.** All three branches were
  rebased onto `c8708ad2c`, so after the first ff-only merge the other
  two were no longer descendants ("Not possible to fast-forward").
  Each branch was re-rebased onto the new tip + proofs re-run + merged,
  one at a time. Do not merge in parallel and do not force.
- **Index clobber hit on every safe-commit in this adoption** (tier4pool
  corpus commit: all 24 files staged-as-deleted; killlootfixture anchor
  refreshes ×2). Repaired each time with `git ls-tree -r HEAD --
  <paths> | git update-index --add --index-info`, verified by empty
  status + empty diff HEAD. Check `git status --short` after EVERY
  safe-commit, including in worktrees.
- **Killlootfixture `git status` is pathologically slow** (>280s, 15MB
  index under load) — use pathspec diffs there, never a bare status
  before a commit; safe-commit.sh itself works fine.
- **Merge exit codes:** piping a merge through `tail` masks its exit
  (the killlootfixture merge "failed" with MERGE_EXIT:0 because that
  was tail's exit). Run merges unpiped and read the exit code directly.
- **Flap:** a ~2-min window hit 01:14:32Z during the adoption
  (watchdog-reported); writes were probed CLEAR before every commit and
  no file was lost or truncated. `docs/ONTOLOGY.md` verified intact
  (354,624 bytes) before the gate.
- **Reaper:** skipped on a held registry lock during the adoption
  (live holder: journey2-social registration) — same known class,
  nothing stuck, nothing removed.
- The 2030Z adoption's round record (`c8708ad2c`) landed during this
  adoption; its trees/lock were not touched (separate worker).

## Closeout state

Merged `ebb24ceeb` (corpsecap) + `0d283ad95` (killlootfixture) +
`a0a2bf26d` (tier4pool) + this record; round record
`evidence/2026-11-21/sim-fleshout-2315-adoption.md`. Worktrees
released and removed, branches deleted, claim deleted, lock deleted.
scale-onramp stays converging (NOT converged).
