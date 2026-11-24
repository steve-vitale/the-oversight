# sim-ammosupply-a — EVIDENCE (adoption landing, Loop A run fleshout-20261124T2015Z)

**Arm:** sim-ammosupply-a · **Loop A run:** fleshout-20261124T2015Z (adoption of the
1815Z run, which timed out before closeout)
**Verdict: NO-GO, kind THIN-POOL — the departure-supply lever is KILLED as designed.
Landing is EVIDENCE-ONLY; the game code is reverted to base.**
**Prereg:** `evidence/2026-11-24/sim-ammosupply-a-prereg.md` (frozen 2026-11-24 ~19:10 UTC,
before any judged sim). **Bars in prereg §2 bind; §14 metric binding holds.**
**Analysis:** `evidence/2026-11-24/ammosupply-a-analysis.json` (reproduced §12).
**Panel:** `evidence/2026-11-24/ammosupply-a-panel-compare.md` (§15).
**Branch:** `sim-ammosupply-a` (worktree `~/workspace/worktrees/sim-ammosupply-a`).
**Base:** 04918a1e2. **Lever commit:** 154c1b08b (reverted by this adoption commit).
**Finding #2544 stays OPEN** (fight capability: damage output — the ammunition-supply half).

## §0. The question, in plain words

Departing villagers carry bows but walk into wave-4 fights with empty quivers: on the
bowopen-recheck band only 29 of 88 ranged-at-entry fighters had ammunition. This arm built
the ammunition-supply lever — arrows/stones put in departing hands at departure, at a real
material cost — and measured whether supplied ammo turns into volleys, damage, and kills.
The answer is: the lever supplied nothing at all, on the whole pilot band.

## §1. Verdict and bars (frozen prereg §2, judged as written)

| Bar | Threshold | Arm | Control | Result |
|---|---|---|---|---|
| Pool floor (pair-inclusive engaged) | arm ≥ 10 | 3 | 3 | **FAIL** |
| Kill share (pair-inclusive) | arm ≥ 0.25 | 1/3 = 0.333 | 1/3 = 0.333 | PASS |
| Damage/round (pair-inclusive) | arm ≥ 70 | 40.6 | 40.6 | **FAIL** |
| Mechanism — volley fired | ≥ 0.50 of engaged meetings | 2/3 = 0.67 | 2/3 = 0.67 | PASS (check, not a verdict bar) |
| **Mechanism — ammo at entry** (all wave-4+ encounters) | arm ≥ 0.70 | 17/38 = 0.447 | 13/30 = 0.433 | **FAIL** (binding) |
| Cost — community loss | arm ≤ ctl + 0.125 | 3/8 | 4/8 | PASS |
| Cost — starvation (totals) | arm ≤ ctl + 2 | 6 | 10 | PASS |
| Cost — starvation (villager-only) | arm ≤ ctl + 2 | 5 | 9 | PASS |
| Cost — median survival | arm ≥ 0.8 × ctl | 150d | 127d | PASS |
| Instrument errors | 0 | 0 | 0 | PASS |

**GO threshold** (pool floor AND mechanism bar AND kill share AND damage/round AND volley
fired AND all cost bars) is not met: three bars fail. **Verdict NO-GO, kind THIN-POOL.**
The prereg §2 staging sniff test also fires: arm `ammoSupply.supplied = 0` — so per the
frozen prereg the verdict is NO-GO on the pilot with the mechanism diagnosis as the finding,
and **no 12–16 seed confirm is run on a null**.

## §2. The supply-counter diagnosis — supplied = 0 is the story

Arm-leg `village.ammoSupply` counters over the whole 8-seed pilot (control leg: all zero,
as designed — the flag was off):

| Counter | Arm | What it means |
|---|---|---|
| alreadyArmed | 85 | Departing ranged holders who already had ammo after `villagerPocketAmmo` — counted, never re-supplied |
| **supplied** | **0** | **Batches the lever actually put in a departing hand: none** |
| craftFail | 5 | Craft attempts that spent materials and failed |
| noMats | 3 | Empty quiver, no materials anywhere to craft from |
| noRecipe | 4 | Searcaster (fusion cells — no recipe, no pile source) |
| vids touched | 16 | Distinct villagers the supply function ran for |

16 villagers reached the supply function with an empty quiver, and 12 of them hit a terminal
no (5 failed crafts + 3 no materials + 4 no recipe) while the other 4 were... not supplied
either — the counters sum to 97 touches (85 alreadyArmed + 12 terminal), and `supplied`
stayed 0. The lever's craft path never succeeded once in live play: every villager who
needed arrows either failed the craft roll (blind 35% / learned 85% — the 5 failures spent
real materials for nothing) or had nothing to craft from. The proof test proved the
mechanism *can* supply on a staged village (53/53 green, §12); in the live pilot it never
did. That gap — works staged, never fires live — is the finding, not a test artifact:
departures that reach the function with an empty quiver are rare (16 in 8 seeds × 150 days)
and, when they happen, the crafter usually cannot complete a batch.

## §3. Mechanism bar — the pre-registered headwind, confirmed

Ammo-at-entry among ranged-at-entry fighters in **all** wave-4+ encounters (every origin,
evades included):

- Arm 17/38 = **0.447** vs bar ≥ 0.70; control 13/30 = 0.433. The lever moved the rate by
  +0.014 — noise, on a base the lever could not reach.
- Ammo-capable-only (weapons whose def carries `weapon.ammo`): arm 17/23 = **0.739**,
  control 13/18 = 0.722. The capable population was already near the bar; the lever added
  nothing to it.
- By origin (arm, [ranged, with ammo]): expedition [7, 5], world-tick [19, 8], aid [12, 4].
  Control: expedition [7, 5], world-tick [11, 4], aid [12, 4]. Expedition — the only
  origin a departure lever can touch — is **identical** on both legs (5/7 with ammo).
  The empty quivers sit in world-tick (8/19) and aid (4/12), where the fighter never
  departs, and in spears (arm 15 of 38 ranged-at-entry are spears, which take no
  ammunition at all: 3 fire-hardened + 12 hunting).
- This is exactly the prereg §1 pre-registered headwind, measured on a fresh band rather
  than sprung as a surprise: a departure-only lever cannot reach 0.70 because expedition
  is a small share of ranged-at-entry and expedition fighters are already stocked 5/7 by
  the existing `villagerPocketAmmo` + home duty. The pilot confirms the desk diagnosis;
  it does not overturn it.

## §4. Thin-pool outcome bars — the three meetings are byte-identical

Pair-inclusive engaged meetings (size ≥ 2, present, engaged): **3 on each leg, and the
three meetings are byte-identical between legs** (same seeds, days, fighters, outcomes,
damage, volleys). The lever changed nothing in the judged population:

| Seed / day | Monster | Outcome | Rounds | Dealt | Volley |
|---|---|---|---|---|---|
| 110401 / d94 | Eulogy | vKill | 12 | 1036 | 4 shots, 67 dmg |
| 110402 / d58 | Reunion | vDie | 1 | 0 | none (no ranged fighter) |
| 110405 / d46 | Reunion | vFlee | 2 | 71 | 2 shots, 31 dmg |

- Pool floor 3 < 10: the band's launched-party density is far below the floor the
  bowopen-recheck band suggested (21 / 11 pair-inclusive engaged per 8 seeds there).
  The funnel shows why: 11 encounters joined per leg, but 7 excluded as evades and 1
  party-absent, leaving 3. The thin pool is a property of this band/substrate, not of
  the lever — but the floor is the floor, and the pilot does not earn a confirm.
- Kill share 1/3 = 0.333 passes its bar on both legs — identically, so it is not a
  lever effect.
- Damage/round 40.6 on both legs vs bar 70: the winning shape needs ~111/round; the
  pilot's one kill ran 86.3/round and the two losses 0 and 35.5. Nothing here moves
  toward the bar.

## §5. Cost bars — all pass

Community loss arm 3/8 vs control 4/8; starvation totals 6 vs 10 (villager-only 5 vs 9);
median survival 150d vs 127d. The lever cost nothing measurable — unsurprising, since it
supplied nothing and its 5 failed crafts spent only a handful of sticks/stone/fiber.
No cost bar is anywhere near its guardrail.

## §6. Sense-test — the three pair meetings, read in full

The captured logs are the analyzer's log excerpts (the 110401 log runs through round 4 of
a 12-round fight — a prefix, not the full transcript; the kill itself is not narrated in
the captured lines). Read as fights:

**110401, day 94 — Mateo vs The Eulogy, vKill (12 rounds, 1036 dealt).** The one real
fight in the band, and it reads like a fight. The volley opens it honestly — four arrows,
all hit, 67 damage — then Mateo uses Take Aim, takes small hits through his gear (6–8 a
round after absorption), and shouts for help as he loses; Catalina charges in on the
first shout, Hassan on the second. The party forms one ally at a time, mid-fight, and the
kill comes after the trio is together. Coherent, tense, and earned — and it is the
bowopen-recheck shape, not an ammosupply shape: Mateo's 5 arrows were already his before
the lever existed. The volley matters (67 of the opening) but the fight is won in melee
over 12 rounds.

**110402, day 58 — Ananya vs The Reunion, vDie (1 round, 0 dealt).** Brutal and stark:
"Ananya walks straight into The Reunion. No avoiding it." Gear absorbs 43; "Your Move
hits Ananya for 30 (0 left)." One hit, dead, before the party — three people, 2.33
abilities each, all armed and armored — ever acts. No ally joins, no strike is thrown.
It reads as a one-shot, not a fight: the Reunion's opening move kills the lead before the
party the launch was supposed to provide can form. No ammunition angle at all (no ranged
fighter, ammo at entry 0). The gate said null on all three meetings — it never held a
party back, and never sent one forward either.

**110405, day 46 — Wanjiru vs The Reunion, vFlee (2 rounds, 71 dealt).** The volley
fires (2/2, 31 damage), Wanjiru lands two 20-damage strikes, takes 30 then 40, and at
21 HP shouts; Duc answers — but Wanjiru is "past holding" and runs "while running still
works." The flee is the right call and it reads as one: 71 damage against a 1311-HP
monster (5.4%) with the lead at 21 HP is not a fight to stay in. The naming is
consistent (Duc is the first name of the gen_0u2wci2 ally). Nothing robotic here — the
blank is that the party was never going to win this, and the gate (null) offered no
judgment before they walked in.

## §7. Wall numbers (scale-onramp axis)

| Metric | Control (8 seeds) | Arm (8 seeds) |
|---|---|---|
| National reached | 0/8 | 0/8 |
| Table (win flag) | 0/8 | 0/8 (table not instrumented by this driver — null, never faked) |
| Wins | 0/8 | 0/8 |
| Wave 4 unlocked | 6/8 | 7/8 |
| Wave 5 unlocked | 1/8 | 1/8 |
| Median survival | 127d | 150d |
| Scale ranks | regional 5, village 3 | regional 6, village 2 |

Per-seed (both legs; only 110407 differs):

| Seed | Days ctl/arm | End ctl/arm | Max wave ctl/arm | Standing ctl/arm | Deaths ctl/arm |
|---|---|---|---|---|---|
| 110401 | 150 / 150 | survived / survived | 5 / 5 | 535 / 535 | 96 / 96 |
| 110402 | 104 / 104 | village-lost / village-lost | 4 / 4 | 199 / 199 | 91 / 91 |
| 110403 | 150 / 150 | survived / survived | 4 / 4 | 199 / 199 | 87 / 87 |
| 110404 | 47 / 47 | village-lost / village-lost | 3 / 3 | 0 / 0 | 46 / 46 |
| 110405 | 50 / 50 | village-lost / village-lost | 4 / 4 | 165 / 165 | 40 / 40 |
| 110406 | 150 / 150 | survived / survived | 4 / 4 | 199 / 199 | 49 / 49 |
| **110407** | **57 / 150** | **village-lost / survived** | **3 / 4** | **50 / 199** | **36 / 74** |
| 110408 | 150 / 150 | survived / survived | 4 / 4 | 199 / 199 | 106 / 106 |

Death-cause shares (raw death records, 551 ctl / 589 arm): monster-related causes
(villager combat + expedition + combat + monster + named monsters) ~89% on both legs
(ctl 488/551, arm ~524/589); sickness 11 vs 10; starvation 10 vs 6; thirst 7 vs 8.
Seed 110401 is the only wave-5 village on either leg (standing 535, regional).
Four villages stall at standing 199 — the same 199 wall seen across the program.

## §8. Balanced panel (§15) — review_required

`ammosupply-a-panel-compare.md`: **decision review_required**, 8 paired cases, screen only.
The driver is one line: **village deaths per run, regression_watch, +4.75 (interval 0 to
14.25)** — 68.875 ctl → 73.625 arm. Everything else is no_material_signal (national 0/16,
table win rate 0/16, community loss −0.125, first-bearer day-60 survival 0.625 → 0.75).

Verdict on the watch line: it is a **survival artifact, not a lethality increase**. The
+38 raw deaths on the arm leg come almost entirely from seed 110407 surviving (74 deaths
over 150 days vs 36 over 57 days on the control leg) — a longer-lived village accumulates
more deaths. Deaths per 100 calendar days actually *fell* (−1.67, 69.67 → 68.00,
no_material_signal), and every per-day lethality signal is flat or favorable. The panel
is the instrument; the frozen bars are the judge — and the cost bars (§5) pass. The
regression_watch is explained, not a lever effect, and it does not change the NO-GO.

## §9. Metric review (§14)

- Bars judged as written; no re-scoring. The three failures are independent kinds:
  the **pool floor** is about launched-party density on this band (3 meetings where the
  sizing assumed ~11+); the **mechanism bar** is about ammo at entry across all origins
  (0.447 vs 0.70); the **damage bar** is about what parties do once engaged (40.6 vs
  70). A lever could in principle pass any one of them while failing the others — this
  one failed all three that matter, for three different reasons, and the thin pool means
  the kill-share pass (1/3) is a single meeting's luck either way.
- The pool-floor vs mechanism distinction matters for the next arm: the mechanism bar
  failed because the reachable population (expedition) is small and already stocked, not
  because the pool was thin. Even with a full pool, a departure lever could not have
  passed 0.70 — the headwind math in prereg §1 caps it near ~0.47 on this band's mix.
- **110407 RNG-divergence caveat (determinism):** seed 110407 diverges between legs
  although the lever supplied nothing — control village-lost day 57, arm survived 150d
  with 8 wave-4 encounters and 53 dawn-bid census entries (Chantal Mukendi, herald,
  party stage, empty party, days 99–151) vs 0 on the control leg. The likely mechanism
  is RNG-stream divergence from the lever's 5 failed craft attempts consuming random
  draws on the arm leg. Do **not** claim a lever effect from it: the arm leg's better
  survival, wave-4 unlock, median, and deaths/run numbers all ride on this one seed.
  With 110407 excluded, the legs are byte-identical on every measured number (the other
  seven seeds match on days, end reason, wave, standing, and deaths).
- The panel regression_watch (§8) is the only same-run investigation item, and it is
  explained above as the 110407 survival artifact.
- The staging sniff test (prereg §2) worked as designed: supplied=0 stopped the run at
  the pilot instead of spending a 12–16 seed confirm on a null.

## §10. Infrastructure — write flap + VM restart (adoption run)

- The 1815Z run timed out before closeout; this adoption run (2015Z) recovered its
  complete pilot (8/8 valid each leg, 0 instrument errors, both sweep exits 0).
- **Write flap active at adoption start:** the probe `git update-ref refs/heads/probe
  HEAD` failed 20:25–20:27 UTC in the main repo ("couldn't write .../probe.lock");
  still failing at 20:29, 20:31, 20:36, 20:41 UTC. The worktree heartbeat also failed
  at ~20:29 (`worktree-heartbeat.sh`: PermissionError writing REGISTRY.json.tmp) — noted,
  continued, flap is the known cause. Plain file writes were intermittent: a shell
  redirect to /tmp failed at 20:31, passed at 20:41, failed again at 20:42 — the flap
  refuses writes unpredictably, not uniformly.
- **VM restart:** `uptime` 1:07 at 20:36 UTC → machine booted ~19:29 UTC, inside the
  flap's window. The restart is part of the flap's known shape (windows keep starting
  minutes after a machine replacement).
- **Truncation incident (this adoption, 20:30 UTC):** while the probe was failing, a
  `git show 04918a1e2:src/js/game.js > src/js/game.js` redirect truncated both
  `src/js/game.js` and `src/js/villager-agency.js` to **0 bytes** (the known flap
  pattern: the file is truncated first, the write then refused). No data was lost:
  both files exist committed (lever version at HEAD 154c1b08b, base version at
  04918a1e2). Recovery: leave the 0-byte files untouched until the probe passes, then
  restore with `git checkout 04918a1e2 -- src/js/game.js src/js/villager-agency.js`
  and verify byte-identical to base (blobs fdfcd84c34dea11498fad1f4e6fecd478c8d7483 /
  e8c184aa38e592db4496f995cba8ca064b70787c). The flap rule held: never force a commit
  through a failing probe.
- Sweep logs: `ammosupply-a-sweep.log` (combined) is 0 bytes; the per-leg logs
  (`-ctl.log` 5789 B, `-arm.log` 6620 B) and both `.err` files (0 B) are intact.
  All 16 per-seed files present, 8/8 valid per leg.

## §11. Next arm — named from the diagnosis, not another departure tweak

**An aid/world-tick ammo-supply diagnostic** (a sibling worker is running it this round).
The empty quivers are in aid (4/12 with ammo) and world-tick (8/19) fights, where the
fighter never departs — a home/away question, not a departure question. Do NOT land
another departure-only tweak: the departure population is already stocked, the craft path
never completed a batch live, and the headwind math caps any departure lever below the
mechanism bar. Finding #2544 stays **OPEN** with the failing bars named: pool floor 3 <
10, ammo-at-entry 0.447 < 0.70, damage/round 40.6 < 70 — and the mechanism diagnosis:
the lever supplied 0 batches in 8 seeds.

## §12. What was reverted, what was kept, and the proof

**Reverted** (game code back to base 04918a1e2): `Game.villagerAmmoSupply` plus its call
sites in `startExpedition` (`src/js/villager-agency.js`) and `resolvePatrol`
(`src/js/game.js`). The lever commit was purely additive — +197 lines in `src/js/game.js`,
+5 in `src/js/villager-agency.js`, 0 deletions — so the revert removes exactly the lever
and nothing else (verified: `git diff 04918a1e2 -- src/js/game.js
src/js/villager-agency.js` empty after the revert; `grep -rn villagerAmmoSupply src/js/`
returns nothing; no `AMMOSUPPLY` references remain in `src/js/`).

**Deleted:** `scripts/test-ammosupply-a.js` — it tests the reverted lever and cannot pass
without it. Do NOT keep a failing test.

**Kept (the instrument):** `scripts/ammosupply-driver-a.js`,
`scripts/analyze-ammosupply-a.js`, `scripts/build-ammosupply-panels-a.js`, the prereg,
the analysis JSON, the panel files, the sweep logs, and both per-seed corpora
(`perseed-ammosupply-a-{ctl,arm}/`, 8 files each).

**Proof:**
- `scripts/test-ammosupply-a.js` ran **BEFORE the revert: 53/53 PASS** (green on the
  lever code as committed — the mechanism works staged; it never fired live).
- Analyzer `--selftest`: **40 passed, 0 failed**.
- Analyzer reproduction over the committed corpus: verdict NO-GO, kind THIN-POOL, all 8 bars
  (pass + detail) and all 6 summary blocks (ctl / arm / ctlPair / armPair / ctlAll /
  armAll) identical to `ammosupply-a-analysis.json` — verified twice, once via the
  stdout summary and once by an in-memory rebuild of the full result object
  (verdict, kind, bars, ctlAll, armAll, and all four meetingsDetail arrays deep-equal
  to the committed file). No `--out` file write was needed or used; the flap (§10)
  refused fresh-file writes from shell processes during the adoption, and the
  in-memory comparison covers every field of the committed JSON.
- The analyzer selftest + reproduction run are the proof for this evidence-only landing;
  the lever's own proof test is deleted with the lever, as stated in the task.

**Adoption note (to be completed at commit time):** after the flap clears, the adoption
commit restores the two source files, deletes the test, and commits this evidence file
plus the analysis/panel/sweep/corpus files with `scripts/safe-commit.sh`. No
[needs-eyes]: the kill lands as evidence-only with the game code reverted; the original
lever commit already carried it. No push, no version bump, no live verification — the
coordinator merges to local master via --ff-only; report 'ready to merge, pending ship'.

## §14. Adoption status at 21:08 UTC — commit BLOCKED by the write flap (resume commands)

The write flap did **not** clear during this adoption. Probe
`git update-ref refs/heads/probe HEAD` failed 11 consecutive times: 20:25 (run start),
20:29, 20:31, 20:36, 20:41, 20:48, 20:53, 20:58, 21:03, 21:08, 21:13 UTC (failures at
~5-min intervals throughout, flap ~48 min and counting at wrap-up). Heartbeat writes
failed twice with the same cause (20:29, ~20:59).
No stale lock files exist (no `probe.lock`, no `index.lock`) — the refusals are live
EPERM write denials, not stale locks. The adoption commit was **not** forced through
the failing probe, per the flap rule.

Everything else is done and verified; the resume is mechanical. From the worktree
(`cd ~/workspace/worktrees/sim-ammosupply-a`), once the probe passes:

```
git update-ref refs/heads/probe HEAD   # must print nothing and exit 0 first
git checkout 04918a1e2 -- src/js/game.js src/js/villager-agency.js
git diff 04918a1e2 -- src/js/game.js src/js/villager-agency.js  # must be empty
git hash-object src/js/game.js src/js/villager-agency.js
# expect fdfcd84c34dea11498fad1f4e6fecd478c8d7483 e8c184aa38e592db4496f995cba8ca064b70787c
grep -rn villagerAmmoSupply src/js/   # expect no output
grep -rn AMMOSUPPLY src/js/           # expect no output
rm scripts/test-ammosupply-a.js
node scripts/analyze-ammosupply-a.js --selftest   # expect 40 passed, 0 failed
bash scripts/safe-commit.sh "sim-ammosupply-a: KILL departure ammo-supply lever, evidence-only (NO-GO THIN-POOL, supplied 0)" -- src/js/game.js src/js/villager-agency.js scripts/test-ammosupply-a.js evidence/2026-11-24/sim-ammosupply-a.md evidence/2026-11-24/ammosupply-a-analysis.json evidence/2026-11-24/ammosupply-a-panel-before.json.gz evidence/2026-11-24/ammosupply-a-panel-after.json.gz evidence/2026-11-24/ammosupply-a-panel-compare.json evidence/2026-11-24/ammosupply-a-panel-compare.md evidence/2026-11-24/ammosupply-a-sweep.log evidence/2026-11-24/ammosupply-a-sweep-ctl.log evidence/2026-11-24/ammosupply-a-sweep-ctl.err evidence/2026-11-24/ammosupply-a-sweep-arm.log evidence/2026-11-24/ammosupply-a-sweep-arm.err evidence/2026-11-24/perseed-ammosupply-a-ctl evidence/2026-11-24/perseed-ammosupply-a-arm
git status --short   # must be empty after the commit
```

Note: the two source files currently sit at **0 bytes** (truncated 20:30 UTC, §10) — the
checkout above is their recovery, not just the revert. Do NOT run any other write to
them first. The prereg (`sim-ammosupply-a-prereg.md`) is already committed at
154c1b08b and is not in the commit list.

## §13. Canon

`docs/CANON.md` (manifest), `docs/MONSTER-WAVES.md` (wave 4: The Mirror Draft,
standing ≥ 100; damage 35–95, HP 850–1500, pierce 0.2–0.5; wave 5: standing ≥ 200 AND
wave-4 faced), and `docs/BALANCING.md` (ranged opening volleys: shots = min(ammo,
clamp(1 + floor(range / monster speed), 1, 4)), each shot spends 1 real ammo; empty
quiver → narrated "no arrows") read before the adoption. **No canon doc covers
ammunition supply specifically** — said here rather than inventing one, as the prereg
already records. Arrow-crafting is a human skill (CANON.md), never an alien ability.
