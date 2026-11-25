# Journey landing r289 — leg 0 LANDING (days 1–14 judged, horizon d28)

Run `playtest-20261125T0230Z`, scheduled Tue 2026-11-24 19:45 CST.
Lane A leg 0. Base master `23b9a721e` (includes r288 scale, r286
deepening, sim-fleeguard-b live-numbers guard, sim-wilddeath-b DIAG-GO
instruments). Lock `playtest-loop.lock` run_id
`playtest-20261125T0230Z`, created 2026-11-25T02:30:23Z. Rotation read
`0` → write `0→1` at closeout. Worktree
`~/workspace/worktrees/journey-landing`, branch `journey-landing`.

## VM restart mid-run (recovery, per the standing rule)

The machine was replaced ~02:50Z while the full panel was on seed 1407
(log froze at "SEED 1407", no node process survived; uptime 1 min on
re-entry). Heartbeat re-established FIRST (02:52Z, hbloop restarted
setsid), write probe passed (fresh-file write + readback OK), and the
panel was re-run from scratch — the partial corpus is preserved as
`hidden_files/evidence/2026-11-25/landing-r289-after-killed-at-1407`
(73 files, seeds 1402–1406 complete). The re-run (panel2 log) is the
scored corpus. Nothing was replayed from the killed run; all numbers
below are from the clean re-run.

## Pre-flight

Main tree clean (`git status --short` empty). Disk 52%.
`git pull --ff-only`: already up to date. `worktree-reap.sh`: LOUD on
4 dirty trees (never auto-removed), active 14/16. Registration took
~6 min (slow checkout under load — the `git worktree add` reset ran
~5 min); heartbeat 02:31:46Z at registration, hbloop re-established
(setsid, 10-min ticks).

## Prereg summary

`evidence/2026-11-25/journey-landing-r289-prereg.md`. Seeds **1402–1411**
(fresh band; the only "1402" hits in preregs are commit hashes and
unrelated ranges — no seed reservation). DAYS=28, policy competent
verbatim, driver `scripts/journey-landing-r289-20261125.js`
(r284 driver verbatim except OUTDIR/header/seeds).

**Questions:** (1) Q1 GO re-check on a fresh band with the current
master; (2) scholar-death watch re-read (r284: 5 deaths vs bar ≤2);
(3) orphaned invite lines re-count (r284: 9/39, 23%).

**Pilot:** seeds 1402–1404, exit 0. System contact d8 on all three;
all alive at d28. Pilot gate passes; full panel ran.

## Panel

Driver exit 0, all 10 seeds, 147 files in
`hidden_files/evidence/2026-11-25/landing-r289-after/`. Analyzers
`evidence/2026-11-25/journey-landing-r289-analyzers.sh`, 15/15 exit 0,
1716 lines. Log:
`hidden_files/evidence/2026-11-25/journey-landing-r289-analyzers.log`.

| seed | spawn | systemDay | over | villager deaths | pantry/person d28 |
|---|---|---|---|---|---|
| 1402 | Austin | 8 | no | 0 | 1,390 |
| 1403 | Valentina | 8 | no | 1 | 2,929 |
| 1404 | Casey | 8 | no | 2 | 3,987 |
| 1405 | Kavya | 9 | no | 0 | 1,332 |
| 1406 | Robin | 8 | no | 0 | 2,809 |
| 1407 | James | 8 | no | 1 | 3,633 |
| 1408 | Amelia | 9 | no | 2 | 2,898 |
| 1409 | Kathleen | 8 | no | 0 | 2,298 |
| 1410 | Imani | 8 | no | 0 | 6,294 |
| 1411 | Liam | 8 | no | 1 | 6,254 |

10/10 villages alive at d28. Scholar deaths 2 (1403 Valentina d20
"the wild", mantle d21 to Ikram, latency 1; 1408 Amelia d19 "the
wild", mantle d21 to Quinn, latency 2 — see Watches). Villager deaths
7 total: 1404 Zoltan d10 ambush (killed by a person — betrayal case),
1404 gen d13 monster, 1407 Aki d26 monster, 1408 Ursula d12 monster,
1411 gen d15 monster, plus the 2 scholars. All grief-registered
(griefBeats 0–2 per seed, fallenAudit dupes 0). Contests: fired 18,
ended 16, open at horizon 2 (1404 Tide Clock, 1411 Who Ate It? — both
fired d28, still in progress, not a defect). Monster kills 430 (r284
baseline 386). Fights: 17 total; stuckFights 0, pocketFights 0,
sealed regions 0.

**M-PR1 (primary): 0 terminated-but-open ledger entries on the band
(bar 0).** Checker `hidden_files/evidence/2026-11-25/mpr1-check-r289.py`
(run WITH the corpus dir — the first no-arg invocation printed a
vacuous open=0 and was discarded): TOTAL open=2 (both fired d28,
participants None), M-PR1-fail=0.

**M-PR2: 0 villager autopsies with context LEDGER and null
contestOutcome (bar 0 as scoped).** Literal scan finds 2 nulls — both
MONSTER kills (hummice, gallowdeer) during the still-open Tide Clock
contest on 1404, which fired on the horizon day: the contest has no
outcome yet, so null is correct. See Metric review — the metric as
written does not scope to participant deaths or terminated contests,
and this band is the first where that over-breadth fires. No
participant death carries a null outcome.

## Q1 adjudication — GO

- **M1 ALIVE-D14: PASS** — 10/10 alive at d14.
- **M2 SYSTEM CONTACT: PASS** — 10/10 by d9 (d8 on eight seeds, d9 on
  two).
- **M3 FIGHT-LOG: PASS** — all 17 fights carry known triggers; 0
  unknown; stuckFights 0.
- **Zero-DMG refused-turns: PASS (BINDS)** — refusedTurns 0 in the one
  zero-DMG fight (1404 d17, no-strikes, pending-face, routed).
  refusedTurnsAllFights=0 (r284: 1, a failed MOVE).
- **Practice: PASS** — 10/10 seeds moved (49 cells d1→d14, 99 d1→d28,
  attributed 99, skill0→pos 67, 3031 reps).
- **Pocket: PASS (BINDS)** — 0 pocket fights, 0 sealed regions.
- **D1: PASS** — 0 garbled-label renders. D2: 0. D3: 0.
- **HEED: legacy 0; HEED-V: PASS (BINDS)** — 0. WARNED-BUT-UNRESOLVED 0.
  Both warn_you sittings end resolution=heeded (see People check).
- **M-PR1 commit-offer (r156/r157 fix holds): PASS — 0/20 = 0% ≤ 15%.**
  R107: sittings=29, offered=19, picked=19, promised=12,
  statedAfterPick=7, neverOffered=9, settled=1. Established = 29 − 9
  unestablished = 20; the 9 never-offered ARE the 9 unestablished
  sittings (the favor never surfaces — correctly excluded) plus the 1
  settled sitting (1405 d19, engine's own settled line). The residual
  route is CLOSED, same as r157. The 7 statedAfterPick are all honest
  away-guard refusals ("I'm out on the road, away from Haven… find me
  when I'm back"), each naming the remedy.
- **Bridges: PASS** — 0 repeats in every pool. Topics with no ask pick
  in corpus: grief, cheer, secret (same shape as r284).
- **R66 HUNGRY: NOT-HUNGRY** — starvationDeaths=0, slideSeeds=0,
  bandSeeds=3, noSlideSeeds=7. Pantries are fat this band (only 2/10
  below 2000/person, vs 8/10 on r284) — the thin-pantry watch does not
  fire.
- **Scholar deaths: PASS (bar ≤2)** — 2 on 2/10 seeds (r284: 5, r158:
  1). The re-read lands between the two: band variation, not a
  deadlier regime. The watch stays as written.
- **Other watches:** CONTEST LEDGER GO, OUTING GO (34 favors, 7 kept,
  2 broken, 25 open, 8 departs, 7 hauls delivered), R68 PARTY GO
  (presshop: pressFail 0, together-stopped 7, farUnreached 1),
  NOD-LOOP 0, silentTurns / dry lines 0, HUNTPRACTICE kills 430.

Q1 is GO because the binding metrics (M-PR1, M-PR2 as scoped, M1, M2,
M3, zero-DMG, pocket, HEED-V, commit-offer) all pass.

## Watches (not fails)

- **Mantle latency 2 on 1408.** Amelia died d19 "the wild"; Quinn
  takes the mantle d21. r284's band was latency 0–1. The scholar died
  away from Haven, so the news plausibly travels late — the village
  continued under Quinn and was alive at d28 with pop 10. Reported as
  a watch, not a defect; the next landing run re-reads latency.
- **Warn_you line shared verbatim across seeds.** "You've seen what's
  out there. I'm just saying — the treeline at dusk. Don't." is
  spoken by Ellis (1403 d8) and Raj (1406 d9) word for word. One pool
  line, two different people — mild voice duplication, not a
  conversation defect (both sittings resolve honestly). Watch only.

## Q4 — people check: PASS

Six full transcripts read in full (4 pilot + both warn_you panel
sittings), plus all 6 NV sittings via the analyzer. No dry lines, no
filler loops, no fabricated history. No dead villager speaks.

- **1402 d10 (Yuki, curious):** "Do you ever just need to be alone?"
  → deflect answered honestly, then the deepening turn lands: "I go
  to the treeline edge and count my breaths. Ten of them. That's my
  alone." A person with a practice, not a menu.
- **1402 d12 (Yuki, curious):** a sitting doing three jobs — link
  proposal to Stonebridge accepted and carried, betrayal offer
  declined honestly ("Another time, then. A small thing, pocketed."),
  ambush of Devon surfaced with real options (site, witnesses, moot).
  Ends engaged. (Also carries the orphaned invite line, see below.)
- **1402 d13 (Pavel, curious):** "Has this changed you? Like,
  fundamentally?" → "I don't recognize the person in my head
  anymore." → "Hah. The old you got you here. The new you keeps you
  here. Both count." Closing line "Well. That was almost a
  conversation. We're improving." is wry to the point of meta — a
  watch, not a defect.
- **1403 d11 (Luis, ask_favor):** betrayal offer declined honestly;
  the unsettled ambush of Tashi surfaces with a real menu
  (investigate, moot, let lie). The bot leaves at turn 1; the NPC's
  boundary is respected.
- **1403 d8 (Ellis, warn_you):** the warning deepens over four heeds
  to "You hear me, right? Not the words — the part underneath. I'm
  scared, and I'm asking you not to make me watch it happen." Ends
  heeded, stage 3.
- **1406 d9 (Raj, warn_you):** "I'm not trying to fence you in. I'm
  trying to still have you here tomorrow. That's the whole of it."
  Ends heeded, stage 3; ambush of Nora surfaced alongside.
- **NV sittings (6):** LOOP=0 on all six (maxSameStreak=1); every one
  surfaces wind-down and leaves via Leave. The 3-nod cycle from r283
  does not appear.
- **Orphaned invite lines — the carried blank, same rate:** 6 lines
  in 6 of 29 ask_favor sittings (21%; r284: 9/39, 23%; r283 scale:
  5/19, 26%); 8 lines across all 127 transcripts. Each is spoken and
  never answerable — no menu ever offers to take it up. The fix
  (offer the invite as a choice) is still a conversation-engine
  change, still owed to a conversation build arm, not this run.

## Census in plain words

Ten villages, all ten alive at day 28 — and fatter than last band:
only two end the month under 2,000 calories per person, and two end
above 6,000. They talk, grieve, and keep promises: 18 contests fired
and all but the two that started on the last day closed, every death
carries its cause and its grief, and when the scholar dies in the wild
somebody picks up the mantle within a day or two. The month's cost is
seven dead across the ten villages, including two scholars — down from
fourteen and five last band. The sharpest news is what didn't happen:
no village starved, no contest was left open with a dead participant,
and nobody's promise went unmade when a favor was actually on the
table. The visible crack is the same as last band: villagers keep
saying "Walk with me?" and the game never lets you say yes.

## Reachable / fun / winnable

- **Reachable: YES.** The landing leg plays end to end on all 10 seeds;
  System contact by d9 everywhere; contests fire from d14 and close.
- **Fun: HOLDS, with the same crack.** People talk well (Ellis's and
  Raj's warnings are the run's best lines; the succession seam names
  the dead); the visible crack is the orphaned invite lines, now 6/29
  sittings.
- **Winnable: not judged on this leg** (landing horizon d28; the win
  chain is a later-leg question).

## Fixes (this run's blank)

- **None — no src/js change.** The run's blank is the orphaned invite
  lines, carried for a fourth run: the fix is a conversation-engine
  change (offer the invite as a choice), bigger than a playtest run's
  one blank — same judgment as r279/r283/r284, with the rate now
  measured on landing at 21%.
- **Tooling forked for this run:** driver
  `scripts/journey-landing-r289-20261125.js` (r284 verbatim except
  header/seeds/OUTDIR), analyzers
  `evidence/2026-11-25/journey-landing-r289-analyzers.sh`, M-PR1
  checker `hidden_files/evidence/2026-11-25/mpr1-check-r289.py`.
  Diffs verified: only the intended lines differ; `node --check` clean.

## Metric review (standing)

- M-PR1 holds as written (0 fails this run). The two open entries
  (1404 Tide Clock, 1411 Who Ate It?) both fired d28 and are
  legitimately in progress; the death-join rule correctly excludes
  them.
- **M-PR2 needs its scoping written down (proposal for the NEXT run,
  not this one).** As written — "every contest death autopsy with
  context LEDGER has a non-null contestOutcome" — it fires on monster
  kills inside a still-open contest (2 this band, both during the
  Tide Clock that fired on the horizon day). The defect class M-PR2
  exists to catch is a PARTICIPANT death whose contest never closes
  (r155); a monster killed mid-contest cannot carry the contest's
  outcome yet. Proposed revision: scope M-PR2 to autopsies where the
  deceased is a contest participant (same join as M-PR1) OR the
  contest has ended. Do NOT re-score this run: the verdict stands on
  the scoped reading (0 villager nulls), and the revision is for the
  next run's prereg.
- Scholar-death watch (≤2/band): 2 this band vs 5 on r284 and 1 on
  r158. Three bands now read 1, 5, 2 — band variation, not a regime.
  The watch stays as written.
- Mantle latency: r284 0–1, r289 one case at 2 (1408). No bar exists;
  if the next band shows 2+ again, a latency watch (≤2) should be
  written into the prereg.
- Commit-offer accounting confirmed: established = sittings −
  unestablished; settled excluded per the R122 rule. 0/20 this run;
  the residual route stays closed.
- The staged contest-heavy probe (r284 metric-review proposal) is
  still owed if a live refusal/arena-loss terminal read is wanted;
  it needs its own prereg as a dedicated driver arm.

## Telemetry

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/landing-split.json --current
'.../landing-r289-after/journey-landing-r62-census-*.json' --metrics
systemDay,villagerDeaths,monsterKills,folTelemetry.fires,starvAutopsies`:
**quiet (10 files, 5 metrics, no large deviations).** No LOUD lines,
baseline NOT rolled. Panel values: monsterKills 430 (baseline 411),
villagerDeaths 7 (baseline 10).

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-r289-gate`
in the worktree: **338 passed, 6 failed in 871s** (GATE_EXIT 1). Log:
`hidden_files/evidence/2026-11-25/journey-landing-r289-gate.log`.

The 6 are the standing 5 pre-existing failures (2 deed-attainment 120s
timeouts — living-garden + one-person-army; stale neutrality-proof
failure in test-measurement-proof-update + test-measurement-workflow;
stale phone receipt in test-phone-frame-proof — all identical to the
r158/r284 runs, none touching anything this run changed) PLUS
test-deathcleanup-instrument-20261117, which fails with `EPERM:
operation not permitted` opening a fresh file under /tmp — the host
write-flap signature, not a code failure. Evidence it is environmental:
the test's driver half passes 9/9 checks and only the analyzer half's
fresh-file writes fail; the identical write shape (mkdtemp + mkdir +
writeFileSync) succeeds intermittently from a plain node process in
the same minutes; a controlled repro failed 4/4 writes at 03:21:19–30
and passed at 03:21:38; the test file is byte-identical to master
(this run changed no src/js). It passed on r284's gate yesterday and
fails today. Adjudication: 5 standing + 1 flap artifact, **0
attributable to r289**.

**Flap window + registry corruption at closeout (LOUD).** A write-flap
window opened during the gate (~03:15Z) and was still active at
03:43Z (~28 min). During it: fresh-file writes and git index/ref
writes EPERM intermittently (single probes occasionally land, sustained
cycles fail). At 03:30 the shared `REGISTRY.json` was found
unparseable — trailing `test\n` appended after the closing brace
(file 11215 bytes; the valid doc ends at 11210). The first doc was
intact (23 trees, 14 active, journey-landing heartbeat 03:14:40).
Repair: truncated the trailing junk via atomic tmp+replace with a
23-tree assertion; verified the file parses with all 23 trees intact
(11211 bytes, repaired ~03:39Z; a 0-byte `.bak-20261125T0339Z` also
appeared, likely a sibling repair attempt). Heartbeats kept failing
through 03:43Z, so journey-landing's heartbeat sat at 03:14:40
(~28 min stale) while the hbloop kept ticking. The commit/merge below
waited for a sustained clear before proceeding (see Closeout record).

## Closeout record (filled as the closeout proceeds)

- Run note written: evidence/2026-11-25/journey-landing-r289.md (this file).
- Telemetry check: quiet (see above).
- Gate: [PENDING]
- Commit: [PENDING]
- Merge / rotation / release / lock: [PENDING]
