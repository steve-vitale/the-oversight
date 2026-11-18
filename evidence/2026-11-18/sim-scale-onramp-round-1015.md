# sim-scale-onramp-round-1015 — Loop A 1015Z adoption closeout + re-judge round

Run: fleshout-20261118T1315Z, axis scale-onramp. This run adopts the dead
1015Z Loop A run and runs a second-round re-judge pair on its held arms.
Base master at adoption: `c78cf83a6` (Loop B winplandepart); Loop B's 1030Z
adoption landed concurrently during this run (`d84d63ba0`, no interference —
different axis, different files).

## Stale-lock recovery

Lock `fleshout-20261118T1015Z` created 2026-11-18T10:18:50Z; this run started
13:15:39Z, lock ~177 min old (> 90 min fallback). Registry heartbeats for
the run's trees: sim-launchparty-sense-a 10:19:21Z, sim-wildavoid-a
10:22:34Z, sim-handoffrec2-a 12:08:43Z — all >15 min stale. No live
coordinator process visible (`ps`). DEAD per the guard. Lock deleted,
stale-lock recovery noted here. New lock `fleshout-20261118T1315Z` created
13:31:00Z; claim
`hidden_files/lever-claims/fleshout-20261118T1315Z.json` written before any
re-judge analysis.

Pre-flight: main tree clean at start except one untracked file owned by the
sibling loop's live adoption (`evidence/2026-11-18/sim-winnability-round-1030.md`,
written 13:19:29Z, committed by that adoption as `d84d63ba0` during this
run — NOT touched, NOT committed by this run; main tree clean after it
landed). Disk 51%. `worktree-reap.sh`: active 14/16; skipped trees with
uncommitted changes owned by other loops (sim-siegedialog-a,
sim-inffight-ab, sim-fleerepair2-b, journey2-crisis) — not touched.

## Adoption method

No re-scoring of any prereg bar. Each arm's committed evidence was read in
full; each proof test was re-run by the adoption on the branch tip; each
verdict stands as the worker froze it. Nothing was merged from the 1015Z
arms — all three are NO-GO pilots, all HELD on their branches.

## Arm 1 — sim-launchparty-sense-a — frozen NO-GO, HELD (`364604b9f`)

Finding #2515 (the 4th seat cannot appear at a meeting). Fix in
`src/js/party-wiring.js` only (+ `partyTrios` bump in
`src/js/villager-brain.js`): meeting sense source 0 prefers the fighter's
launch party (same-target live expedition), cap stays 2, env-gated
`LAUNCHPARTY=1`. Staged probe pre-fix 2/12 → post-fix 12/12.

Frozen primary (launch-arrival, `allyVids ⊆ planParty` AND
`|allyVids| = min(2, |planParty|)`): ctl 0.06 (2/31) → arm 0.09 (3/33);
bar arm ≥ 0.80 and diff ≥ +0.40 — FAIL. Cost bars PASS (starvation arm 4
vs ctl 2; median survival ratio 0.89). Panel `review_required`
(community-loss regression signal 0.125 → 0.5).

§14 metric review (diagnostic, not a re-score): the frozen bar misfires on
pair launches — the fix's specified behavior fills the spare seat from the
proximity sense, which the frozen bar counts as failure. Corrected bar
(`planParty ⊆ allyVids`; quads additionally `allyVids ⊆ planParty`,
`|allyVids| = 2`): arm 0.88 (29/33) vs ctl 0.48 (15/31); trio arrival 3/3;
fought-joiners 10/13 vs 3/12. The 4 corrected misses are stale-plan
meetings (wave-3/targetless launches days earlier, expeditions ended).

NEW finding #2538 (the arrival price): gate avoid share 71% → 53% (all
`outmatched`, party-size-driven, gear identical); three arm villages lost
that survived on ctl (104404 d113, 104405 d105, 104407 d117); launch
members die days after the meetings (104407 cluster d57–60; maya_singh
d45 in the meeting). Next arm: can launched parties WIN wave-4 fights.

#2515 stays OPEN (4th seat engine-blocked: `fieldFights.js:1230` slices
`allyVids` to 2, `game.js` wild path caps at 2; needs a 3rd-ally-slot arm).
`partyTrios` counter VERIFIED in live sims ON THIS BRANCH (arm 3 =
departs-derived 3; ctl 12 = 12) — but the fix it verifies (the
`vbrainExecuteDepart` bump) is ON THIS HELD BRANCH, not on master, so the
counter-fix blank stays OPEN on master: the bump lands only with this
branch or as a separate split-out. The 0130Z "counter still broken" thread
is answered on the branch, not on master.

Adoption proof re-run: `scripts/test-launchparty-sense-a.js` 12 passed,
0 failed on the branch tip; tree clean after.

Wall (band 104401–104408): national 0/8 both legs, table null (not
instrumented), wins 0/8, wave-5 ctl 4/8 arm 2/8, standing-199 stall on
both legs.

## Arm 2 — sim-wildavoid-a — NO-GO (B4), HELD (`aec52a81b`)

Finding #2506 (aid/world-tick meetings never consult the fight gate).
Fix in `src/js/game.js` (+43) + `src/js/win-plan.js` (+81/−11),
env-gated `WILDAVOID=1`: outmatched wild meetings (party < 3 or anyone
unarmed/unarmored, wave ≥ 4) step aside with a spoken line; raids exempt;
post-flee rest exempt.

Bars (GO iff B1&&B2&&B3&&B4&&B5): B1 PASS (13 arm avoids vs 10 ctl
would-avoids, ratio 1.3 ≥ 0.50); B2 PASS (launches 30/30 both legs);
B3 PASS (wild deaths 18 → 12, flee damage 4,288 → 3,552); B4 FAIL
(arm wild Suburb deaths 1, bar == 0); B5 PASS (D3 1.0 both legs, 0
unclassified rows, `wildAvoids` 13 == 13, say-lines 13 == avoids).
Verdict NO-GO on B4 alone.

The B4 death (seed 104417 d98, aid origin) is identical on both legs
(same day, same outcome vDie, same damage 17, same party — three armed,
armored villagers), trajectories identical through d98, first divergence
d141, first avoid d141. Mechanism: pre-learning mauling (d94–97, 25/13/
13/14/14 damage, all fled) — the village had not yet learned the Suburb
leave-trick; the trio fought for real each time and one died wounded on
d98. The avoid rule correctly did not fire (matched party). The prereg's
B4 zero bar measures the trick-learning window, not the lever. Re-scope
proposal (for the next run): B4 on outmatched Suburb meetings only (arm
avoided 1/1 it met).

Panel `review_required`, two regression_watch lines investigated, no
material signal (deaths/100d +0.51 interval includes 0, denominator
effect; community loss +0.125 from the single seed 104416 divergence).
Sense notes: the avoid line reads well once, repeats identically (Tanya
meets the same audit 6× in 8 days), and promises help ("going back for
help") that never comes — no plan is seeded.

Adoption proof re-run: `scripts/test-wildavoid-a.js` ALL PASS (91
assertions) on the branch tip; tree clean after.

Wall (band 104411–104418): national 3/8 both legs (standing; rank 0),
table 0, wins 0, wave-4 7/8, wave-5 3/8, median survival 132.5d both legs.

## Arm 3 — sim-handoffrec2-a — NO-GO bar 1 (staging clause), HELD (`82519c1dc`)

Finding #2510/#2536 follow-up: recorder re-run + classification closure.
No `src/` change at any point (net `src/` diff vs base: zero). Branch base
master `27eec991b` + cherry-picks `8285c1b63` (recorder fix) and
`48575f9eb` (F2 scope correction) from held branch `sim-handoffrec-a`.

Bar 1 FAIL on the staging clause: the 4 frozen unknowns are ABSENT from
the re-run (staging band 103411–103418: 5 selections vs frozen 79 — the
instance set moved under two landed `src/js` changes since the frozen
base; the population no longer stages). Unknown = 0 ✓ (5/5 classified),
≥1 mid-day-backed ✓ (3 of 5, part-1). Fallback screen (fresh band
104421–104428, per the prereg fallback clause) staged 18 selections:
unknown = 0 AND ≥1 mid-day-backed PASS (4 mid-day-backed). Bar 2 PASS
(frozen reproduction exact: 79 selections, tally 28/0/47/4, same 4
unknowns). Bar 3 PASS (recorder fires 416/416 scored calls, 112/112
departs, 0 errors, both corpora). D1 PASS, D2 PASS. Verdict NO-GO on bar
1 with the fallback's recorder evidence alongside. Does NOT re-score
sim-handoffrec-a's NO-GO.

The fallback band is the first band staging ≥1 range-0-holder blocked
selection — the 0647Z follow-up ("re-run the classification on a band
that stages ≥1 range-0-holder blocked selection") is SATISFIED: 18
selections, all handoff-available, 0 unknown. The 4 named frozen unknowns
remain unclosed BY NAME (never re-staged) — filed as a steering-call
follow-up (#2510 PARTIAL CLOSURE, see findings). The blocked-morning
picture: a homebody holder held on the same eater plan 14× across 60
days (104424, gen_nqpt6w2) while walkers stand available at Haven — the
plan is not stuck for lack of a person; handing a plan on is not a thing
anyone can do yet. No transcript line voices a hand-off (extends #2499).

Adoption proof re-run: `scripts/test-handoffrec2-a.js` with the staging
ON corpus — 13 passed, 2 failed, 1 skipped. F7 fails by verdict
(bar 1 staging clause, expected). F11 failed ONLY because the adoption
passed the FALLBACK corpus as the REC dir (the REC leg scratch was
deleted per the prereg after the worker verified D2; the FB band is a
different population, so its fingerprints differ by construction).
F10 skipped (D1 scratch likewise deleted per the prereg). The verifiable
checks are consistent with the worker's reported 15/16 (F7 = verdict);
F10/F11 were verified by the worker at the time and are recorded, not
re-verified. Tree clean after.

Wall: staging band national 0/8, table 0, wins 0, wave-4 8/8, wave-5 0/8,
median survival 150.5d, 5/8 stall at standing 199. Fallback band
national 0/8, table 0, wins 0, wave-4 7/8, wave-5 0/8, median survival
131.5d, 4/8 stall at 199.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'<launchparty-sense ctl per-seed glob>' --metrics national,table,wins,exiled
--sweep-rows`: REFUSED recorder-corpus input (all 8 rows carry
top-level anchorCommit; exit 2) — same documented refusal as prior runs.
Baseline NOT rolled. No LOUD lines (no compare ran).

## Re-judge round — second round (frozen preregs, existing corpora, no new sims)

### Arm 1 — sim-wildavoid-rejudge-a — GO, LANDED (`95ba293f2`)

Re-judge of the wildavoid pilot under a corrected frozen prereg (B4
re-scoped to outmatched Suburb meetings only), all bars recomputed from
the corpora with a fresh independent script (`scripts/rejudge-wildavoid-a.py`),
not taken from the 1015Z evidence. Prereg
`evidence/2026-11-18/sim-wildavoid-rejudge-a-prereg.md` written before any
analysis.

| Bar | Recomputed | Result |
|---|---|---|
| B1 (arm avoids ≥ 50% of ctl would-avoids) | 13 vs 10 (ratio 1.3) | PASS |
| B2 (launches ≥ 90% of ctl) | 30/30 events, 30/30 instances | PASS |
| B3 (wild deaths + flee damage arm ≤ ctl) | deaths 18 → 12; damage 4,288 → 3,552 | PASS |
| B4 re-scoped (outmatched-Suburb deaths == 0; every outmatched Suburb meeting avoided) | 0 deaths; the one outmatched Suburb meeting met (104414 d127, duo) was avoided | PASS |
| B5 (instruments) | 8/8 files per leg, 0 errors, D3 1.0 both legs (independent counts 46/46 ctl, 44/44 arm — see note), `wildAvoids` == avoids == say-lines == 13, trajectory control 8/8 | PASS |
| Proof test | `scripts/test-wildavoid-a.js` ALL PASS, 91 assertions, re-run on the rebased tip | PASS |

The 104417 d98 death verified from the corpora (not on trust): day 98,
aid origin, Suburb, vDie, 17 damage, party visjoin_92 + gen_0og0xvr +
desmond_clarke — identical day/outcome/damage/party and byte-identical
wild snapshots (party 3, all armed, all armored) on both legs; classifier
matched on both legs, so the rule correctly did not fire. First avoid and
first divergence on that seed both day 141 — 43 days after the death.

**Correction to the 1015Z mechanism story (from the re-judge):** the d94–98
chain was NOT a pre-learning mauling. `trickBefore` is true and `fleeWise`
true on all seven meetings on both legs — the village knew the trick and
did the wise round-1 leave each time, yet still took 13–25 damage per
meeting and one villager died to a 17-damage hit. The leave-trick does
not make the leave free on the aid path. Verdict-relevant facts unchanged;
the mechanism was wrong. Filed as a new open finding (see findings).

D3 note: the independent D3 counts (46/46, 44/44) differ slightly from
the original analyzer's (48/48, 45/45) because the replica implements only
the outmatched rule and honestly excludes 2 ctl + 1 arm expedition rows
whose live gate reason is `seek`; the original counts SEEK rows as
agreement. Both give agreement 1.0 with n ≥ 5 — B5 passes either way.

Landing: branch rebased onto `d84d63ba0` clean (3/3, no conflicts — the
master-side game.js change since the base is the journey-landing pocket
repair at ~line 35699, far from the wildavoid hunks); proof re-run ALL
PASS on the rebased tip; ff-merged to master as `95ba293f2` (no conflicts,
no force); worktree released as done-merged, branch deleted. No push, no
bump — merged locally, pending ship. Panel: review_required, no
`regression_signal`. No confirm spend (re-judge only; pilot band stays
8 seeds).

**Master-tree proof-test anchor note (not a defect):** running
`scripts/test-wildavoid-a.js` on master itself shows 1 failure — §5 "src
changes are exactly game.js + win-plan.js (got [])". The test anchors on
`git merge-base HEAD master` (line 502); on master that is HEAD itself,
so the diff is empty by construction. All 90 other assertions pass on
master, and the test is ALL PASS on any branch tip. Same family as the
launchparty-sense anchor correction. Do NOT "fix" the test to green on
master; if the anchor is ever reworked it should fall back to the
prereg's frozen base commit when HEAD == master.

### Arm 2 — sim-launchparty-rejudge-a — NO-GO, fix stays HELD (`d01eaf0a5` on branch `sim-launchparty-sense-a`)

Re-judge of the launchparty-sense fix under a corrected frozen prereg
(primary: corrected arrival on LIVE wave-4 launches; cost bars incl.
community loss), all numbers recomputed from the corpora with a fresh
independent analyzer (`scripts/analyze-launchparty-sense-rejudge-a.js`,
selftest 18/18), not taken from the 1015Z evidence. Prereg
`evidence/2026-11-18/sim-launchparty-rejudge-a-prereg.md` written before
any recomputation.

| Bar | Recomputed | Result |
|---|---|---|
| Primary (corrected arrival, live launches; arm ≥ 0.80 AND arm − ctl ≥ +0.40) | arm 0.88 (29/33) vs ctl 0.48 (15/31); gap +0.395 | **FAIL by 0.005** — one meeting either way |
| Cost: community loss (arm ≤ ctl + 0.125 = 0.250) | arm 0.500 (4/8 villages lost) vs ctl 0.125 (1/8) | **FAIL decisively** — #2538 verdict-driving |
| Cost: villager starvation (arm ≤ ctl + 2) | arm 2 vs ctl 0 | PASS, exactly at the boundary, no headroom (totals 4 vs 2, also within +2) |
| Cost: median survival (ratio ≥ 0.80) | arm 133.5d vs ctl 150d, ratio 0.89 | PASS |
| Secondaries | trio rate arm 3/3 vs ctl 2/11; fought-corrected arm 10/13 vs ctl 3/12 — reproduces the 1015Z diagnostic exactly | reported |

The fix fails on TWO independent bars, so it is not landable. No src
changes in this arm; branch clean and committed; nothing merged.

**The live restriction excluded nothing (retires the 1015Z §3
diagnosis).** The prereg defined "live wave-4 launch" precisely (a
`launch` depart, same launch group as a set, within the 2–5-day
expedition window derived from code). `notLive` = 0 on both legs; the
live meeting sets are identical to the unrestricted sets (verified by
direct set comparison). All four corrected misses have matching departs
1–4 days before the meeting (a 1-day-old launch cannot have ended —
minimum expedition is 2 days). The real mechanism is unobservable in
this corpus (companion-guard skip / same-target mismatch are the
candidates); a future recorder must stamp expedition state at the
meeting instant. The prereg's first draft of the quad clause was
self-contradictory (3 members can't sit in 2 ally seats) — the analyzer
selftest caught it before any corpus computation; amended 13:35 UTC, and
no quads exist in either population, so no judged number changed.

Proof tests on the branch tip: `test-launchparty-sense-a.js` 12/12;
`analyze-launchparty-sense-a.js --selftest` 14/14; new re-judge analyzer
selftest 18/18. Safe-commit index clobber struck the worker's commit;
repaired via the `ls-tree -r` pipe, blobs verified against HEAD.

Wall (band 104401–104408, re-judge): national 0/8, wins 0/8, wave-5
ctl 4/8 arm 2/8.

## Convergence state

**Scale-onramp: converging** (NOT converged). One lever landed this run
(wildavoid, outmatched-avoid on the wild routers — wild deaths 18 → 12
on its band), but the wall is unchanged on every band this run:
national 0/8 (3/8 standing on the wildavoid band, rank 0), table 0,
wins 0, wave-5 0–4/8, standing-199 stall dominant. The binding question
is now sharper and confirmed by measurement: launched parties arrive
(sense fix proven under the corrected bar, 0.88) and then DIE in wave-4
fights (#2538 — community loss 0.5 vs 0.125, verdict-driving). The next
arm is fight capability, not another sense fix.

**Winnability chain: converging** (untouched; Loop B live — its 1030Z
adoption closed during this run, evidence `d84d63ba0`). **Food-economy:
converging (parked).**

Next blanks, in order: (1) #2538 fight capability — can launched
parties WIN wave-4 fights (fight capability, gate calibration, or both);
(2) #2515 4th seat — 3rd-ally-slot arm in `fieldFights.js` (engine cap),
after fight capability exists (sense fix stays HELD until parties can
win); (3) NEW #2539 aid-path leave-trick not free — trick-known wise
leaves on aid still take 13–25 damage; does the aid path consult the
trick-hold like the expedition gate, or is the leave-hit intended;
(4) #2510 steering call — accept the 4 unknowns as closed-by-instrument
or stage them deliberately; (5) veteran-guard half of the fight gate
(unmeasured — needs a table-stage veteran first); (6) wildavoid confirm
on a fresh 12–16 seed band (this landing rests on the 8-seed pilot band
only); (7) `partyTrios` counter bump — the fix is verified on the HELD
launchparty-sense branch (3=3, 12=12) and lands with that branch or as a
separate split-out.

Closed this run: outmatched-avoid on the wild routers (#2506 — LANDED);
handoffrec re-run on a band staging ≥1 range-0-holder blocked selection
(fallback band staged 18 — SATISFIED); #2515-confirm as scoped by Loop B
("waits on the 1015Z launchparty-sense landing") — answered NO-GO by the
re-judge, fix HELD.

## Files

- This evidence: `evidence/2026-11-18/sim-scale-onramp-round-1015.md`
- Arm evidence (on held branches): `evidence/2026-11-18/sim-launchparty-sense-a.md`,
  `sim-wildavoid-a.md`, `sim-handoffrec2-a.md` (+ preregs, corpora, panels)
- Claim: `hidden_files/lever-claims/fleshout-20261118T1315Z.json`
