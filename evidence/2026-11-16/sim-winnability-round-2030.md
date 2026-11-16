# sim-winnability-round-2030 — Loop B coordinator evidence

Run: fleshout-loop-b-20261116T2030Z (Loop B), axis winnability chain,
scheduled 14:30 CST. Two DIAG arms, both instrument-only, zero net `src/js`
game-code change. Base master `7bb50f3dc` at arm start. Master moved once
under the run: `7ebb2b26e` (journey-crisis r228, playtest loop) — zero file
overlap with either arm. Both branches rebased clean onto the then-current
master before merging; proofs re-run on each rebased tip and green; merges
`--ff-only`.

Loop A was live the whole run on planignite / trickshare / vetreengage
(claim `fleshout-20261116T2015Z`, band 102601–102608) — not touched. The
body's re-point queue was already fully disposed by the 0915Z run (arm-2
toggle CLOSED 2026-11-06; flee-repair LANDED by Loop A; standing
accumulation answered in the 99107 sense) — recorded again so the next run
does not re-take a stale queue item. This run took the two open Loop B
items that were NOT claimed by Loop A: tracker blank #5 (seasoning gate G1
ruling, held by Loop B) and the standing-199 stall (haventarget finding —
the live form of the standing-accumulation blank).

## Arm 1 — sim-seasoning-g1-b (DIAG GO, LANDED `9c78fd585`)

The G1 ruling (tracker blank #5): re-judged under the phase-corrected
classifier proposed in sim-seasoning-b.md §Metric review (items 1–3, plus
item 5 raw-standing alongside gated). No new sims — re-judgment on the
existing committed corpora (band 102201–102208, 150d, 16 configs; reused
band, stated as not fresh in the prereg; fresh band 102701–102708 verified
unused and reserved, not spent).

**GO — all three frozen bars pass.** Unknown **0 band-wide** (frozen 4);
0 unknown days, 9 precursor days (frozen 9 unclassified) — the frozen
proof's failing `--corpus "unknown 0"` check now passes under the corrected
instrument. Courtship daysLost **[0, 11, 1, 0, 0, 0, 17, 30], median 0.5d**
(frozen [0, 12, 2, 0, 0, 0, 18, 31], median 1d); covenant 102204 unchanged
(44 blocked days, 44 censored). Decisive non-null exactly on the four
link-seasoning seeds (102202 village_spl_26_60773 age 29→30; 102203
village_1 trust 38→46; 102207 village_spl_38_6557; 102208
village_spl_31_32776), null-by-design on the four rung seeds; frozen
decisive null on all 8 (the off-by-one, fixed). Seasoning-blocked share
unchanged **1/8 (12.5%)**; D3 unchanged (150/150, 11/11, 0 misses).

**G1 ruling, in one sentence:** the G1 ruling now stands on numbers —
unknown 0, every staging decision classified — so the gate is a real,
voiced, measurable wait, not a mystery.

**Wall (three ways):** gated standing covenant 2/8, courtship 0/8; **raw
standing 6/8, 7/8**; scaleRank 0/8, 7/8; nationalEver 0/8, 8/8; table 0,
wins 0; wave 4–5: 8/8, 2/8 covenant / 8/8, 0/8 courtship; median survival
150.5d / 151d.

Proof: new `scripts/test-seasoning-g1-b.js` **56/56** on the instrument tip
and **56/56 on the rebased tip** (re-run by the coordinator); frozen
`scripts/test-seasoning-b.js` **59/59** on both tips; frozen analyzer
re-run byte-identical to `seasoning-b-analysis.json`. Commits: worker
`f82e2399f` (5 files), rebased to `9c78fd585`, ff-merged, tree released,
branch deleted. Evidence: evidence/2026-11-16/sim-seasoning-g1-b.md +
prereg + seasoning-g1-b-analysis.json.

**Caveat (reported in the evidence, not hidden):** the prereg predicted
the firstOpportunityDay shift on 102201 only; the same rule moves it on
all four rung seeds (102204 d64→d63, 102205 d67→d66, 102206 d65→d64).
DaysLost is 0 on all four either way, so no judged number moved.

## Arm 2 — sim-stand199-b (DIAG GO, LANDED `2eadead80`)

The standing-199 stall (haventarget finding): on fresh band 102701–102708
(8 seeds, 150d, competent verbatim, OFF/ON legs), the stall is the
**defer5 combat-readiness deferral** (`villageStandingTotal()`,
`src/js/standing.js`) — a stage gate, not a cap and not a contribution
that stops counting. The gate **opens 4/8 times**.

**In plain words:** the village earns standing past 200 in blood and
bread, then waits at the fifth door for a second living wave-4 killer.
Every pinned seed pins on defer5 with **veterans the only short bar at
first pin (8/8)**; the plenty-cap hold fires **0 days**; no contribution
stops before the pin — war is still growing on the first-pin day on all 8
seeds and keeps growing under the pin on 7/8. All 4 releases land on the
exact day the second living veteran arrives (d98/d102/d115/d151; one via a
`visjoin_*` incomer). Released seeds differ from pinned seeds in
**readiness, not in any standing contribution** (diplomacy 0 everywhere;
war differs in amount only). The 199 stall and the national trust-lapse
are **different mechanisms**: pins on 8/8 seeds while national is never
reached on any (0 lapses; max 1 link per village, never regional+).
Bonus first: **wave-5 kills measured for the first time on a standing band**
(3 kills, 2/8 seeds).

**Wall (both legs identical, D2 0 divergences):** national by standing 4/8
· national by scaleRank 0/8 · national ever 0/8 · table 0/8 · wins 0/8 ·
wave 4 8/8 · wave 5 unlocked 4/8 · wave-5 faced 2/8 · median survival 139d
· survived 3/8 · wave-4 kills 24 · deaths 618.

Proof: `scripts/test-stand199-b.js` **32/32** on the instrument tip and
**32/32 on the rebased tip** (re-run by the coordinator, D1 + D2 inside).
Analyzer: 8/8 classified (released 4, defer5 4), 0 unclassified, 0
reconcile errors, 0 instrument errors, D2 full-band 0 divergences.
Commits: worker `4479b6e78` (frozen prereg), `8297e0dd7` (instruments +
proof), `3f34fc473` (pilot + evidence), rebased to `efe887e2d` /
`abc5ea98f` / `2eadead80`, ff-merged, tree released, branch deleted.
Evidence: evidence/2026-11-16/sim-stand199-b.md + prereg +
stand199-b-analysis.json + 16 per-seed JSONs. Four findings appended to
the goal's `hidden_files/sim-findings.md` by the worker.

**Named next lever (not built, per brief):** veterans alive together —
killer survival after the blood, veteran overlap, or a bar counting a dead
veteran's kill once (VETSHAPE instrument exists, default OFF; Steve's #427
readiness-gate call owns the decision). Coordinate with, do not duplicate,
the win-fielddmg and win-allyjoin lanes.

**Caveat:** 102706 releases on the post-horizon snapshot (d151) — the door
opened on the last possible day; whether it then faces wave 5 is unmeasured
(appended as a finding).

## Wall (this run's judged corpora, 32 configs)

| | seasoning covenant | seasoning courtship | stand199 both legs |
|---|---|---|---|
| National (standing ≥200) | 2/8 | 0/8 | 4/8 |
| National (scaleRank) | 0/8 | 7/8 | 0/8 |
| National ever | 0/8 | 8/8 | 0/8 |
| Table / wins | 0 / 0 | 0 / 0 | 0 / 0 |
| Wave 4 unlocked | 8/8 | 8/8 | 8/8 |
| Wave 5 unlocked | 2/8 | 0/8 | 4/8 |
| Median survival | 150.5d | 151d | 139d |

Telemetry deviation check: the coordinator ran it on the stand199 on-leg
corpus — **REFUSED, exit 2** (recorder-corpus guard: all 9 rows carry
top-level anchorCommit), the same documented refusal as the 1631Z/1730Z
arms and both workers' own runs. No LOUD lines, no deviation claimed;
baseline NOT rolled. The seasoning arm's worker hit the same refusal
(exit 2, both legs).

## Metric review

- Seasoning G1: the prereg's firstOpportunityDay prediction was imprecise
  (see caveat above) but no judged number moved — the imprecision is
  recorded here, not re-scored. The phase-corrected classifier is now the
  instrument of record for this corpus; future seasoning arms should use
  it, not the frozen one.
- Stand199: bars held as frozen. The instrument reuses the standing199-a
  instrument; the D2 full-band 0-divergence leg is the neutrality proof.
  The d151 post-horizon release is a horizon artifact of the 150d pilot,
  not a verdict — the next arm that follows 102706 needs a longer horizon
  or a release-day instrument.

## Infrastructure

- Pre-flight: main tree clean, disk 42%, reap SKIPPED (registry lock held
  by another reaper run, consecutive skips: 2 — the reaper cron's own
  business, no cleanup forced).
- Registration took ~15 min per tree (registry-lock contention; Loop A's
  sim-trickshare-a registration held the lock during the first).
- **Write flap 21:00–21:01Z** (EPERM on write, git update-ref failures —
  flap-watch log caught it at the write step on six probes): the first
  sim-stand199-b registration failed on it (fatal checkout write errors
  on tools/mobile-sim.html + version.json, "Could not reset index file").
  The command had been piped through `tail -5`, which masked the failure
  exit code (exit 0 was the pipeline's, not the script's) — the failure
  was caught from the output text plus the missing tree/registry entry.
  Lesson recorded: never pipe a registration through tail without
  PIPESTATUS. The retry ran unpiped after probe writes passed (21:02Z)
  and succeeded (REGISTER_EXIT=0). Flap-watch ALL-OK from 21:08Z.
- A service restart interrupted the stand199 heartbeat call mid-run; the
  heartbeat had in fact applied (registry showed 21:09:22Z) — verified
  before proceeding, not re-run blindly.
- Safe-commit index clobber struck both workers' commits (all 5 seasoning
  files; all 3 stand199 commits) — repaired via the ls-tree pipe each
  time, commits verified correct by hash before landing. No clobber on
  either coordinator merge (ff-only, no commit created) or the coordinator
  evidence commit (this file).
- No `check.js --quick` (zero net src/js both arms; both proofs green on
  merged master; the standing profile is recorded by the playtest loop's
  r228 gate on the same master line).
- No pushes, no version bumps, no live verification (ship loop owns
  deploys).

## What this run settles, and what it does not

Settled: the seasoning G1 ruling now stands on corrected numbers (unknown
0, every staging decision classified) — tracker blank #5 is CLOSED. The
199 stall is decomposed to a single named gate: defer5, the second living
wave-4 killer — not a cap, not a missing contribution, and not the
trust-lapse mechanism. The wall is now visible as two separate doors:
standing is earned past 200 while the fifth door waits on veterans, and
national-by-rank stays 0 on competent legs even where standing clears.

Not settled: no lever has yet turned a launch into a repeatable wave-4
kill, and wins are still 0 everywhere on competent legs. The next lever
the numbers point at is veterans alive together — but the readiness-gate
decision is Steve's (#427), so the next build arm needs his call or a
narrower instrument that does not move the gate.

winnability chain stays converging (NOT converged): blank #5 CLOSED this
run (seasoning G1 ruling GO) and the standing-199 stall is diagnosed
(defer5, 4/8 released), but wins are still 0 on competent legs, the table
is still unreached, and the trick question + profile-gate decision are
still open (Loop A 2015Z has trickshare / planignite / vetreengage in
flight). Next blanks, in order: (3) trick question (Steve/design call —
Loop A 2015Z in flight); (4) profile-gate design call (Loop A — the
shadow numbers are in, the decision is Steve's); (5) veterans alive
together (stand199 named next lever — Steve's #427 readiness-gate call
owns the decision); (6) medic-duty candidate starves expeditions on
whole seeds (haventarget finding — candidate picker never tries the next
villager; DIAG first, design question before any build); (7) national is
not sticky (seasoning finding — one point of trust drift costs the scale;
grace/lapse design question); (8) 102706 d151 release follow-up (does it
face wave 5?); (9) rumor-born plans + world-tick seeding as design calls;
(10) answercourt landing decision, competent seat-taking BUILD, family-7
program decision (Steve-calls). Scale-onramp stays converging (untouched;
sibling loop A). food-economy stays converging (parked). Claim deleted;
lock deleted. Evidence: evidence/2026-11-16/sim-winnability-round-2030.md
(this file).
