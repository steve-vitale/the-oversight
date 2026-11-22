# sim-doorflee2-b — the leader-survival-only hold (Loop B run fleshout-loop-b-20261122T0130Z, arm 1 of 2)

**Verdict: NO-GO on F1 only.** The stricter guard does exactly what
it was designed to do — it fires less often (6 fights / 9 rounds
vs DOORFLEE's 8 fights / 24 rounds), converts the same 106830 d98
algorithm door to a kill with the leader alive, and kills NO
leader (0 hold deaths vs DOORFLEE's 3) — and the deaths guardrail
passes this time (M5: `review_required`, no `regression_signal`).
But the flee count barely moves: armed 9 flees on 16 fought doors
vs control 8 on 11 — the rate drops only 16.5pp against a 20pp
bar, and the count (9 vs ≤ 4) is nowhere near it. The hold is
safer; it is not strong enough. No confirm runs. The next arm's
design input is in §7.

**Arm:** sim-doorflee2-b. **Branch:** `sim-doorflee2-b`, worktree
`~/workspace/worktrees/sim-doorflee2-b`. **Frozen prereg:**
`evidence/2026-11-21/sim-doorflee2-b-prereg.md` (frozen 2026-11-22
~02:15 UTC, before any judged sim; no amendments). **Frozen base:**
master `0ea9789d7` (full
`0ea9789d7aab4bc727dc19b0b88507d444a577ef`). **Band (designated
reuse):** 106809, 106812, 106816, 106817, 106820, 106824, 106829,
106830. **Policy:** `scripts/policies/competent.js` sha256
`1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
(first 12: `1884c8852d38`, verified live at freeze). **Horizon:**
150d death-aware. **Substrate (both legs):** `SENSEEXPED=1
PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 LAUNCHSURVIVE=1
ALLYSLOT3=1 PINQUAD=1 DMGPIN=1`. **Control** = that substrate,
DOORFLEE2 unset (pin + damage, no hold — the dmgpin armed
configuration, re-run fresh). **Armed** = same + `DOORFLEE2=1`.
Nothing else differs between the legs. Legs chunked 4+4 seeds; all
four chunks exit 0, 0 instrument errors per seed, anchor/flags
verified on every file (analyzer B4 green on both legs).

## 1. The diagnosis (carried from the doorflee evidence — §1 there)

Door = wave ≥ 4, `origin === 'expedition'`, `allyFromStart`,
`pinned`, rounds ≥ 1. The flee mechanism is NAMED: the morale read
replays the fight as if everyone's armor were only protection 4
while monster damage stays real (~3x real damage), so a winning
quad reads as hopeless and runs; 15/18 dmgpin flees were winning
on live numbers. Morale read location: `src/js/fieldFights.js`
~2537-2610 (rtd = vHpHypo/mDpr at imagined prot 4; hopeless =
rtd < rtk*0.85; party variant pools hypothetical ally HP). The
DOORFLEE hold (live-race winning + leader survives next round)
fired on 8 doors: 2 kills, 3 later flees, 3 dead leaders — pilot
NO-GO: F1 FAIL (6 flees vs bar ≤4), P3 FAIL (0.897x vs 0.90), M5
FAIL (regression_signal deaths/100d 64.59→67.28). The
leader-next-round guard isn't enough — the leader survives the
next round and dies two rounds later.

## 2. The lever (DOORFLEE2) — built, env-gated OFF by default

A pinned quad at a door holds while the LIVE race says it is
winning AND the leader themself can survive the whole remaining
fight. In `src/js/fieldFights.js`, REPLACING the DOORFLEE gate and
hold (the DOORFLEE env flag is no longer read; the held branch
`sim-doorflee-b` keeps it):

- **Gate (computed once, same terms as DMGPIN):** `DOORFLEE2=1` in
  env AND wave ≥ 4 AND `opts.allyFromStart` AND the full pinned
  trio matches `pinnedQuadAllies(vid)` (a trio that joins later
  through the shout ladder never qualifies). In the browser
  `process` is undefined, so the flag is never on there.
- **Hold (after the FINISHERSIZE block, mirroring its shape):**
  when the P4 read actually said `hopeless`, at round ≥ 2, re-read
  the SAME race on live numbers — live party HP left against live
  damage taken per round, same 1.1 winning margin — and if the
  live race says winning AND the leader's live HP exceeds their
  incoming rate times the rounds left to kill
  (`vHp > leaderRate * rtk`), suppress the hopeless flee
  (`hopeless = false`, `winning = true`, `fleeAt = 0.05`,
  `rec.doorHold++`, one "(Door hold)" log line). The leader must
  plausibly survive the whole remaining fight, not just the next
  round.
- **Untouched:** learn-first withdrawal, death, the 5% winning
  floor, signature exits, sealed arenas, solo/non-door/shout-ladder
  fights, and every fight with the flag off (no RNG is drawn —
  verified by the proof test's §0 source check; off-mode is
  byte-identical).
- **Known cost mode (from the doorflee pilot, priced by M5):** the
  old hold traded flees for leader deaths. DOORFLEE2 is designed
  to price that trade out of existence. The pilot's M5 deaths
  guardrail prices this at scale.

Canon grounding: MONSTER-WAVES.md wave-4 bands (HP 850–1500,
damage 35–95, pierce 0.2–0.5; "a 4-6 round fight for a godhood
build (~220 dmg/round)"). No canon doc prices a morale read or a
commitment hold — the hold is a sim lever to test whether the flee
is the binding constraint, judged on flee rate + kills; landing it
as a game change would still be a Steve/design call, not this
arm's. The lever stays env-gated / default-OFF exactly as built —
NO default flip in this arm.

**Port:** the DMGPIN lever, the PINQUAD lever, the ALLYSLOT3 slot,
and the DOORFLEE hold live on the HELD branch `sim-doorflee-b`
(tip `e71dd5ea4`, base `3329f4441`) and are NOT on master. Ported
as `git diff 3329f4441 e71dd5ea4 -- src/` (6 files) onto current
master tip `0ea9789d7` (`git apply`, exit 0, clean). Verified:
source port diff sha256
`3107d05f894d833ea5b84bdcac0a95490988d1008436f31fb20fc98e918e5ad5`
matches the recorded port exactly; `git diff c48854921
e71dd5ea4 -- src/` is `fieldFights.js` +65 ONLY (the DOORFLEE
hold — the sibling files in that range are base-move noise, not
ported); `fieldFights.js`, `party-wiring.js`,
`villager-agency.js` are BYTE-IDENTICAL to `e71dd5ea4`;
`game.js`, `villager-brain.js`, `win-plan.js` differ from
`e71dd5ea4` by EXACTLY the base-move hunks (`3329f4441..0ea9789d7`,
same hunk sets) and nothing else; `node --check` passes on all 6
files; the #2634 pick line is kept VERBATIM and the `_hWasLive`
guard intact. The DOORFLEE → DOORFLEE2 replacement is a further
edit confined to `src/js/fieldFights.js`. The held branch is NOT
merged, NOT modified, NOT rebased. Master moved past the spawn
base (`c8708ad2c` → `0ea9789d7`, Loop A's three scale-onramp arms
merged); this arm rebased onto `0ea9789d7` BEFORE the judged legs
(fast-forward — the spawn base is an ancestor of the tip).

**Driver additions (this arm only, documented in the prereg):**
the corpus stamp gains `doorflee2Flag: process.env.DOORFLEE2 ||
null` (replacing `doorfleeFlag`) and each v4 row gains `doorHold`
(`rec.doorHold`, 0 when the hold never fired) and `everHopeless`
(`!!rec.everHopeless`). No other driver behavior changes.

## 3. Frozen-bar verdict (M1–M6)

| Bar | Requirement | Result | Pass? |
| --- | --- | --- | --- |
| M1 port gate | `test-allyslot3-b.js` 18/18 | **18/18** | ✅ |
| M2 staged pin proof | `test-pinquaddoor-b.js` 35/35 | **35/35** | ✅ |
| M2w wide-instrument proof | `test-pinquaddoor-wide-b.js` 16/16 | **16/16** | ✅ |
| M3 damage proof | `test-dmgpin-b.js` 29/29 | **29/29** | ✅ |
| M3d staying proof | `test-doorflee2-b.js` 49/49 | **49/49** | ✅ |
| M3e downedtwice regression | `test-downedtwice-b.js` exit 0 | **exit 0, 25/25** | ✅ |
| Analyzer selftest | `analyze-doorflee2-b.js --selftest` 11/11 | **11/11** | ✅ |
| F1 flee (PRIMARY) | armed vFlee ≤ 4 AND armed flee rate ≤ control rate − 20pp | armed **9** flees on 16 doors (56.25% vs control 72.73%, **−16.5pp**) — count fails AND rate fails | ❌ |
| P2 door kills | armed FRESH door kills ≥ control | armed **6** vs control **3** (all 6 fresh, roundsDetail-derived entry HP ≥ 500) | ✅ |
| P3 damage shape | armed pooled dmg/round ≥ 0.9× control | armed **159.7** vs control **170.9** = **0.935×** | ✅ |
| B1 pin delivery | armed ally3Vid rate ≥ control − 10pp AND ≥ 3 armed rows | **16/16 (100%)** vs control 11/11 (100%) | ✅ |
| B2 ally3Dealt | armed total > 0 AND ≥ 1 fight ≥ 10 (pinned wave-4+ subset) | total **3,408**, max **504**, 53 rows (control 2,162 / 404 / 31) | ✅ |
| B3a kill conversion | armed wave-4+ vKill rate ≥ control − 2pp | armed **7.69%** (17/221) vs control **7.18%** (14/195), +0.51pp | ✅ |
| B4 substrate | every file: anchor == frozen base, policySha `1884c8852d38`, pinquadFlag '1', dmgpinFlag '1', doorflee2Flag null (control) / '1' (armed), slot+pin present | **8/8 + 8/8 files clean** | ✅ |
| M5 guardrail | balanced-panel compare `review_required` with NO `regression_signal` on village deaths / deaths-per-100d | `review_required`, NO `regression_signal` — deaths/run `regression_watch` (+2.88, CI 0–7.38); deaths/100d `regression_watch` (+1.40, CI 0–4.11) | ✅ |
| M6 deliverable | evidence file + panel + sense-test transcript | this file + `doorflee2-b-panel.md` + panel JSONs + `doorflee2-b-analysis.json` + transcript (§5) | ✅ |

**The analyzer's own verdict is `pass: false`** (exit 1 — the
judge exits nonzero on a NO-GO; the JSON is still written in
full). One frozen bar misses — F1, on both its legs — so the
pilot is **NO-GO**. A miss is NO-GO, never re-scored; the
metric-review notes in §8 are for the NEXT run, not a revision
of this one.

**Reading the F1 miss honestly:**

- The count leg (9 vs ≤ 4) is a denominator effect AND a lever
  effect. The armed leg fought 16 doors vs control's 11 — the
  hold kept parties alive long enough to reach 5 more doors
  (106830 fought 6 doors armed vs 2 control; 106820 fought 2 vs
  1). But unlike doorflee-b, the rate leg ALSO misses: −16.5pp
  against a 20pp bar. The guard is so strict it fires on only 6
  of 16 doors (9 rounds, vs DOORFLEE's 8 fights / 24 rounds) —
  and 3 of those 6 holds change nothing observable (see §4).
  The lever converts 1 flee to a kill and stretches 2 more
  fights by a round each; that is not enough to move the flee
  rate 20 points on a 16-door denominator.
- The good news inside the miss: P3 passes comfortably this time
  (0.935× vs doorflee-b's 0.897× — shorter holds dilute less),
  P2 doubles the fresh kills (6 vs 3), and M5 passes (no
  regression signal; the deaths/100d interval touches 0). The
  guard bought safety at the price of bite: 0 hold deaths, but
  also only 1 conversion.

## 4. Door-fight tables (every fought door, both legs)

Party HP columns are `[leader, ally, ally2, ally3]` at fight
entry (roundsDetail round 1 `*HpStart`) and at fight end (last
round `*HpEnd`). `entryHp` is the roundsDetail-derived fresh-entry
HP (`mHpStartRec`). `dpr` is dealt/round. `vTaken` is damage the
leader took. `doorHold` is rounds the hold fired.

### Control — 11 fought doors: 8 vFlee, 3 vKill, 0 vDie

| seed | day | monster | w | rnd | outcome | dealt | entryHp | dpr | fleeFrac | hold | hopeless | vTaken | a3Dealt | entry HP | end HP |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 106809 | 93 | cancellation | 5 | 3 | vFlee | 816 | 1936 | 272.0 | 0.35 | 0 | Y | 53 | 318 | [68,73,85,80] | [35,73,71,80] |
| 106809 | 93 | reunion | 4 | 2 | vFlee | 284 | 1365 | 142.0 | 0.37 | 0 | Y | 63 | 34 | [80,73,71,3] | [37,73,71,3] |
| 106812 | 100 | influencer | 4 | 2 | vFlee | 272 | 968 | 136.0 | 0.46 | 0 | Y | 39 | 58 | [85,56,67,90] | [46,56,67,90] |
| 106816 | 146 | audit | 4 | 5 | vKill | 1182 | 1166 | 236.4 | — | 0 | N | 48 | 404 | [100,86,100,99] | [72,86,100,91] |
| 106817 | 59 | reunion | 4 | 3 | vFlee | 428 | 1356 | 142.7 | 0.31 | 0 | Y | 58 | 94 | [89,68,82,93] | [31,54,82,93] |
| 106820 | 45 | eater | 4 | 4 | vFlee | 613 | 1083 | 153.3 | 0.38 | 0 | Y | 42 | 106 | [80,72,100,100] | [38,72,100,70] |
| 106824 | 82 | algorithm | 4 | 3 | vFlee | 302 | 1032 | 100.7 | 0.25 | 0 | Y | 35 | 70 | [40,69,88,69] | [25,69,73,60] |
| 106829 | 115 | algorithm | 4 | 6 | vKill | 1130 | 1100 | 188.3 | — | 0 | Y | 68 | 362 | [100,90,100,100] | [52,90,93,80] |
| 106829 | 115 | strike | 4 | 2 | vFlee | 330 | 1110 | 165.0 | 0.12 | 0 | Y | 78 | 100 | [90,52,93,80] | [12,52,93,80] |
| 106830 | 97 | influencer | 4 | 7 | vKill | 883 | 858 | 126.1 | — | 0 | N | 27 | 236 | [91,51,84,60] | [64,47,59,60] |
| 106830 | 98 | algorithm | 4 | 5 | vFlee | 937 | 1130 | 187.4 | 0.41 | 0 | Y | 42 | 350 | [63,45,52,62] | [41,45,25,62] |

Control reproduces the dmgpin armed / doorflee control shape
EXACTLY as expected: 11 fought doors, 8 flees, 3 kills — the same
counts, and byte-identical door rows (outcomes, rounds, dealt,
entry HPs) to the doorflee-b control table. 9/11 doors read
hopeless at some point; every flee is the hopeless branch, flee
fractions 0.12–0.46, leaders ending at 12–46 HP while allies stand
at 45–100 HP.

### Armed — 16 fought doors: 9 vFlee, 6 vKill, 1 vDie

| seed | day | monster | w | rnd | outcome | dealt | entryHp | dpr | fleeFrac | hold | hopeless | vTaken | a3Dealt | entry HP | end HP |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 106809 | 93 | cancellation | 5 | 3 | vFlee | 816 | 1936 | 272.0 | 0.35 | **1** | Y | 53 | 318 | [68,73,85,80] | [35,73,71,80] |
| 106809 | 93 | reunion | 4 | 2 | vFlee | 284 | 1365 | 142.0 | 0.37 | 0 | Y | 63 | 34 | [80,73,71,3] | [37,73,71,3] |
| 106812 | 100 | influencer | 4 | 2 | vFlee | 272 | 968 | 136.0 | 0.46 | 0 | Y | 39 | 58 | [85,56,67,90] | [46,56,67,90] |
| 106816 | 146 | audit | 4 | 5 | vKill | 1182 | 1166 | 236.4 | — | 0 | N | 48 | 404 | [100,86,100,99] | [72,86,100,91] |
| 106817 | 59 | reunion | 4 | 3 | vFlee | 428 | 1356 | 142.7 | 0.31 | 0 | Y | 58 | 94 | [89,68,82,93] | [31,54,82,93] |
| 106820 | 45 | eater | 4 | 5 | vFlee | 759 | 1083 | 151.8 | 0.23 | **1** | Y | 57 | 134 | [80,72,100,100] | [23,72,100,70] |
| 106820 | 46 | eater | 4 | 4 | vDie | 448 | 1025 | 112.0 | — | 0 | N | 39 | 76 | [26,75,100,73] | [0,75,77,73] |
| 106824 | 82 | algorithm | 4 | 3 | vFlee | 302 | 1032 | 100.7 | 0.25 | **1** | Y | 35 | 70 | [40,69,88,69] | [25,69,73,60] |
| 106829 | 115 | algorithm | 4 | 6 | vKill | 1130 | 1100 | 188.3 | — | **1** | Y | 68 | 362 | [100,90,100,100] | [52,90,93,80] |
| 106829 | 115 | strike | 4 | 2 | vFlee | 330 | 1110 | 165.0 | 0.12 | 0 | Y | 78 | 100 | [90,52,93,80] | [12,52,93,80] |
| 106830 | 97 | influencer | 4 | 7 | vKill | 883 | 858 | 126.1 | — | 0 | N | 27 | 236 | [91,51,84,60] | [64,47,59,60] |
| 106830 | 98 | algorithm | 4 | 7 | vKill | 1159 | 1130 | 165.6 | — | **3** | Y | 42 | 420 | [63,45,52,62] | [41,45,25,52] |
| 106830 | 98 | influencer | 4 | 1 | vFlee | 197 | 1017 | 197.0 | 0.14 | 0 | N | 11 | 66 | [25,45,41,52] | [14,45,41,52] |
| 106830 | 103 | influencer | 4 | 7 | vKill | 902 | 873 | 128.9 | — | 0 | N | 51 | 330 | [66,65,94,69] | [35,65,62,60] |
| 106830 | 131 | eater | 4 | 5 | vFlee | 872 | 1150 | 174.4 | 0.18 | **2** | Y | 73 | 148 | [91,92,76,84] | [18,92,76,84] |
| 106830 | 135 | suburb | 4 | 9 | vKill | 1376 | 1347 | 152.9 | — | 0 | N | 11 | 504 | [88,100,85,88] | [77,76,75,80] |

**The hold's ledger (6 held doors, 9 hold-rounds):** 1 kill
(106830 d98 algorithm, held 3 — the transcript in §5, the same
door DOORFLEE converted), 2 stretched-then-fled (106820 d45
eater, held 1, fled a round later at 0.23 with +146 damage;
106830 d131 eater, held 2, fled at 0.18 with the leader at 18
HP), and 3 no-observable-change (106809 w5 cancellation, held 1,
fled at the same round with identical damage; 106824 algorithm,
held 1, identical; 106829 algorithm, held 1, already a kill with
identical numbers). **0 leader deaths on held doors** — the
guard's design goal, met. The single armed door death (106820
d46 eater) had no hold and never read hopeless — a straight loss
on a NEW door the armed leg reached the day after the d45 hold
kept the party alive longer, with the leader entering at 26 HP.
It is trajectory divergence downstream of a hold, not a hold
death — but the hold is what put that wounded leader in front
of a second eater the next day, so the death belongs on the
hold's ledger as a downstream cost, not as a clean bill.

**Matched-seed pairs (the same 11 doors in both legs):** 7 are
byte-identical in outcome, rounds, and dealt (106809 reunion
284; 106812 influencer 272; 106816 audit kill 1182; 106817
reunion 428; 106829 strike 330; 106830 d97 kill 883; 106829
algorithm kill 1130 — identical numbers, though the armed leg
recorded 1 hold round on it). 4 changed: 2 identical-number
holds (106809 w5: hold 1, same R3 flee, 816; 106824: hold 1,
same R3 flee, 302), 1 stretched flee (106820: R4→R5, 613→759),
1 fled → killed (106830 d98: 937 → 1159). The armed leg also
fought 5 doors the control never reached (106820 d46 eater
vDie; 106830 d98 influencer vFlee R1; 106830 d103 influencer
vKill; 106830 d131 eater vFlee, held 2; 106830 d135 suburb
vKill).

## 5. Sense-test transcript — the held kill, read blow by blow

Seed 106830, day 98, the algorithm (shown in the fight as
"Loud-Eyes"; its attacks are named "Recommended For You",
"Engagement", "Demonetized"). Victor leads; Xavier, Jorge, and
Lucas are the pinned trio. The same door in the control leg fled
at round 5 with the monster at 193 HP (18% left, 1.0 round to the
kill). Armed, the hold fires after round 2 and the quad fights
on to the round-7 kill. Full 49-line log, verbatim from the
armed corpus (`doorflee2-b-s106830-doorflee2-b-pinquaddoor.json`,
v4encounters, day 98, algorithm) — **line-for-line identical to
the doorflee-b §5 transcript**: the same fight, the same
trajectory, the same hold after R2, the same R7 kill. The
stricter guard still passes here, and only just in the right
terms: Victor binds a wound at R2 (+20 HP), the monster's damage
spreads onto Jorge and Lucas in rounds 3–6, and Victor's net
incoming rate stays tiny — at the R2 check his live HP (58)
far exceeds his net rate (~2.5/round, damage minus the binding)
times the ~4.2 rounds left to kill.

```
Victor walks straight into Loud-Eyes. No avoiding it.
Victor sees Loud-Eyes coming and nocks an arrow — the fight opens at range (2 shots).
  loosed — it takes Loud-Eyes for 16 (1114 left).
  loosed — it takes Loud-Eyes for 15 (1099 left).
Victor lowers the bow — Loud-Eyes is on them now. (2/2 hit)
Jorge is already at the door too — charges in with Victor!
Lucas is already at the door too — charges in with Victor!
Xavier is already at the door — charges in with Victor!
The pinned quad fights as one — every strike lands with the unit's weight behind it. (Coordinated strikes x2)
R1: Victor strikes for 38 (pinned quad x2) (1061 left)
R1: Xavier strikes for 32 (pinned x2) (1029 left)
R1: Jorge strikes for 48 (x1.3) (pinned x2) (981 left)
R1: Lucas strikes for 70 (x1.3) (pinned x2) (913 left)
Victor's gear absorbs 38.
R1: Recommended For You hits Victor for 12 (51 left)
R2: Victor stops mid-fight and binds the wound — field medicine, +20 HP.
R2: Xavier strikes for 32 (pinned x2) (881 left)
R2: Jorge strikes for 46 (x1.3) (pinned x2) (835 left)
R2: Lucas strikes for 70 (x1.3) (pinned x2) (765 left)
Victor's gear absorbs 41.
R2: Recommended For You hits Victor for 13 (58 left)
Victor holds the door — the fight is theirs on the numbers they can see, and the quad is not leaving it. (Door hold)
R3: Victor strikes for 40 (pinned quad x2) (725 left)
R3: Xavier strikes for 34 (pinned x2) (691 left)
R3: Jorge strikes for 46 (x1.3) (pinned x2) (645 left)
R3: Lucas strikes for 66 (x1.3) (pinned x2) (579 left)
Jorge's gear absorbs 29.
R3: Recommended For You hits Jorge for 11 (41 left)
R4: Victor strikes for 42 (pinned quad x2) (537 left)
R4: Xavier strikes for 30 (pinned x2) (507 left)
R4: Jorge strikes for 52 (x1.3) (pinned x2) (455 left)
R4: Lucas strikes for 70 (x1.3) (pinned x2) (385 left)
Jorge's gear absorbs 43.
R4: Engagement hits Jorge for 16 (25 left)
R5: Victor strikes for 36 (pinned quad x2) (349 left)
R5: Xavier strikes for 32 (pinned x2) (317 left)
R5: Jorge strikes for 48 (x1.3) (pinned x2) (269 left)
R5: Lucas strikes for 76 (x1.3) (pinned x2) (193 left)
Victor's gear absorbs 54.
R5: Demonetized hits Victor for 17 (41 left)
Lucas's gear absorbs 43.
R6: Recommended For You hits Lucas for 10 (52 left)
R6: Victor strikes for 40 (pinned quad x2) (153 left)
R6: Xavier strikes for 28 (pinned x2) (125 left)
R6: Jorge strikes for 46 (x1.3) (pinned x2) (79 left)
R6: Lucas strikes for 70 (x1.3) (pinned x2) (9 left)
Loud-Eyes is wounded past its line — and holds its ground. It is not leaving. (Committed)
R7: Victor strikes for 38 (pinned quad x2) (0 left)
The lead falls — the pack's coordination shatters. The rest scatter or die.
```

What this shows, plainly: the hold fires once in the log
(doorHold counts 3 rounds, the line prints once), the quad keeps
fighting, the monster's damage spreads off the leader onto Jorge
and Lucas in rounds 3–6, Victor binds a wound mid-fight, and the
quad takes the kill at round 7 with Victor at 41 HP and all four
alive. This is the lever working exactly as designed — and it is
also the ONLY clean conversion in the pilot. The other held doors
ended in a later flee (2) or no observable change (3). The
transcript's identity with the doorflee-b transcript is itself
evidence: the two holds agree exactly where the leader's
trajectory is genuinely survivable, and disagree everywhere else
— DOORFLEE held 8 doors, DOORFLEE2 held 6, and the 2 it dropped
were a later-flee (106812, held 5 under DOORFLEE, fled at 0.10
with the leader at 10 HP) and a leader death (106817, held 2
under DOORFLEE, leader 89 → 0). The third old-pilot leader death
(106830 d131 eater, held 5) still holds under DOORFLEE2 — but
only 2 rounds, and the quad flees at 0.18 with the leader alive
at 18 HP instead of dying.

## 6. Wall numbers (control vs armed, 8 seeds each)

| | Control | Armed |
| --- | --- | --- |
| Full-seat wins | 0/8 | 0/8 |
| National scale reached | 0/8 | 0/8 |
| Wave 5 reached | 3/8 | 4/8 (106820 newly reaches wave 5) |
| Villages survived 150d | 2/8 | 3/8 |
| Villages lost | 6/8 | 5/8 |
| Median survival | 136.5d | 139d |
| Village deaths (total) | 681 | 704 |
| Village deaths / run (panel) | 85.1 | 88.0 (+2.88, `regression_watch`) |
| Village deaths / 100d (panel) | 64.59 | 65.98 (+1.40, 95% CI 0–4.11, `regression_watch`) |
| Starvation deaths | 3 | 2 |
| Wound-that-wouldn't-close deaths | 8 | 9 |
| Wound-fever deaths | 2 | 1 |
| Monster-kind deaths | 560 | 576 |
| Villager-kind deaths | 116 | 123 |
| Standing (best village) | 580 (106809) | 580 (106809) |
| Standing gains | — | 106820: 199→370 (wave 5); 106830: 420→535 |
| Fought doors | 11 | 16 |
| Fresh door kills | 3 | 6 |

No win, no national seat on either leg — the hold moves door
outcomes, not the endgame. The standing gains on two seeds
(106820, 106830) are real, and unlike doorflee-b the survival
cost does not carry a regression signal: median survival ROSE
2.5 days, one more village survived, and the deaths/100d
interval touches 0. The deaths total still rose (+23), driven
by the two armed legs that lived longer and fought more doors
(106820: 92→97 deaths over 6 extra days alive; 106830: 87→105
over 5 extra days and 5 extra doors) — longer-lived villages
accumulate more deaths, which is what the per-100d guardrail is
for, and it passes. The starvation-death count fell (3 → 2);
there is no starvation signal this time.

**Secondaries (S1–S7):**
- S1 hold census: 9 hold-rounds across 6 fights (armed); 0
  control. 10/16 armed doors read hopeless at some point
  (everHopeless), vs 9/11 control.
- S2 flee-round shift: control flees at rounds 2–5 (median 3);
  armed flees at rounds 1–7 (median 3) — the R1 flee (106830 d98
  influencer, hopeless N) is a pre-morale path the hold never
  touches; held fights flee at rounds 3–5, at flee fractions
  0.18–0.35 (vs control 0.12–0.46).
- S3 leader-death census: 0 control door deaths; 1 armed (the
  106820 d46 eater straight loss, leader entered at 26 HP, hold
  0, never hopeless). **0 hold deaths.**
- S4 pin-subset B1 rate: 100% ally3Vid on fought doors both
  legs (16/16 vs 11/11).
- S5 door table: §4 above.
- S6 wall numbers: this section.
- S7 near-death members: **0 doors per leg with a member entering
  below 25 HP** (strict <25) — no 3-HP third ally this time. But
  the formation blank persists in milder form: two armed doors
  entered at the edge — the 106820 d46 eater's leader at **26
  HP** (and died there the next day), and the 106830 d98
  influencer's leader at **25 HP** exactly (fled R1). The pin
  still takes a near-dead leader to a door; it just didn't go
  below 25 this pilot.

## 7. Reachability verdict + what the next arm should build

**Reachability: the flee is NOT the binding constraint — the
hold is now safe, but too weak to matter at pilot scale.** The
diag was right about the mechanism and the guard does its job
(0 hold deaths, the deaths guardrail passes, the one clean
conversion replays line-for-line). But the pilot's own ledger
says the hold is a small lever at this shape: 6 holds → 1 kill,
2 stretched flees, 3 no-change. The leader-survival guard
passes only where the leader's trajectory is already comfortable
— wound-binding, spreading damage, a monster nearly dead — which
is exactly where the quad was likeliest to win anyway. The
flee that matters is the one where the leader is hurting and the
party is still winning; the guard releases there by design. The
two candidate next steps from the doorflee evidence §7 that this
pilot does NOT test remain the named inputs:

- The hypo-floor alternative (floor each fighter's hypothetical
  HP at 0 in the P4 pool) combined with the hold, so the P4 read
  stops dragging the pool negative before the hold ever has to
  fire — this attacks the flee at its source (the misread)
  rather than at its consequence (the decision), and it is the
  lever most likely to move the flee RATE 20 points.
- HP-gate door parties (the S7 blank): a pin that refuses a
  member below ~25 HP would stop the 25/26-HP leaders who still
  walk into doors and die there — the cheapest fix in the
  pilot's evidence, and it is a formation question, not a morale
  question. The 106820 d46 death is the exhibit: a 26-HP leader
  died the day after a hold kept the party alive.
- F1 for the next run should be priced on the flee RATE with the
  count as a secondary (the armed leg fought 5 more doors; a
  count bar punishes the lever for reaching more doors), and P3
  should be priced on total damage per door or per fight, not
  per round (longer held fights dilute per-round damage by
  construction) — both carried from the doorflee metric review,
  still unadopted because this run's frozen bars were the
  doorflee-b bars verbatim.

## 8. Metric review (for the NEXT run — this run is judged as frozen)

- F1's count bar (≤ 4) failed alongside the rate bar this time
  (9 vs ≤ 4; −16.5pp vs −20pp), so the count is not the whole
  story — but it is still priced for an ~11-door denominator
  while the armed leg supplied 16. Price the next F1 on the
  rate, with the count as a secondary.
- P3's per-round damage guard PASSED this time (0.935 vs 0.90)
  — the shorter holds dilute less. It is still a composition
  metric; price the next P3 on damage per door or total dealt,
  not per round.
- "Hold fired" overstates the lever's bite: 3 of the 6 holds
  changed nothing observable (the hold fired on a round where no
  flee was imminent — hopeless triggers a shout first, not an
  immediate flee — so suppressing it bought nothing). The next
  run should count conversions (flee→kill, flee→later-flee),
  not hold rounds, as the effect metric.
- The door-line order quirk (door lines print 2, 3, 1) persists
  in the ported slot code; cosmetic, no bar.
- The pin's near-death members (26-HP / 25-HP leaders) are a
  formation question, not a morale question; no bar turned on
  them here, but S7 counts them for the next arm.
- **Analyzer output deviation (documentation, not a bar):** the
  prereg lists `doorflee2-b-analysis-control.json` +
  `doorflee2-b-analysis-armed.json` as separate files, but the
  analyzer's `--json` emits ONE combined judged comparison,
  `doorflee2-b-analysis.json` (control + armed + kill rates +
  bars + `pass: false`). That is the file attached; the
  per-leg sections inside it carry the same numbers the two
  files would have. (Same deviation as doorflee-b.)
- **check.js --quick:** attempted once after the legs, serialized
  (no sibling check.js live at start) — the process was SIGTERMed
  ~29s in (exit signal 15, log holds only the header + dots, no
  surviving jest process) and was NOT re-run: it is not a frozen
  bar for this arm, the frozen gates (proof tests + analyzer)
  are green, and the src change is env-gated sim code. The
  partial log is kept at `doorflee2-b-checkquick.log`. The
  doorflee-b arm's completed run (338 passed, 6 failed — 3
  contention timeouts + 3 proof-freshness failures, none a
  behavior regression) is the standing expectation for what a
  completed run on this tree would show; the proof-hash refresh
  belongs with the coordinator's merge decision, not with a
  pilot's evidence.

## 9. Proofs (all green, post-freeze, on the ported tree)

M1 `test-allyslot3-b.js` **18/18** · M2 `test-pinquaddoor-b.js`
**35/35** · M2w `test-pinquaddoor-wide-b.js` **16/16** · M3
`test-dmgpin-b.js` **29/29** · M3d `test-doorflee2-b.js` **49/49**
· M3e `test-downedtwice-b.js` **exit 0, 25/25** · analyzer
selftest **11/11**. Development runs before freezing: the
doorflee2 test was written fresh for the new guard — the §1a
herald case was found by probe (the algorithm case, DOORFLEE's
proof fight, does NOT hold under the new guard at any leader HP
60–100, so it became the §1b tightening case instead: armed
identical to control, old-guard-true / new-guard-false computed
from the control rec). Two probe scripts in /tmp found the
herald case (probe 2: the hold fires on the suburb/herald at
leader 100 with both legs killing; probe 3: the herald at leader
60–80 converts flee→kill) — the probes are scratch, not repo
files. The post-freeze run is the judged one.

## 10. Files

- Prereg: `evidence/2026-11-21/sim-doorflee2-b-prereg.md`
- Evidence: `evidence/2026-11-21/sim-doorflee2-b.md` (this file)
- Legs log: `evidence/2026-11-21/doorflee2-b-legs.log`
- Corpora: `evidence/2026-11-21/perseed-doorflee2-b-control/` (8
  files) + `evidence/2026-11-21/perseed-doorflee2-b-armed/` (8
  files)
- Analysis: `evidence/2026-11-21/doorflee2-b-analysis.json`
  (analyzer --json over both corpus dirs; `pass: false`, exit 1)
- Panel: `evidence/2026-11-21/doorflee2-b-panel.md` +
  `doorflee2-b-panel.json` +
  `doorflee2-b-panel-before.json.gz` +
  `doorflee2-b-panel-after.json.gz`
- Check log (partial, SIGTERMed): `evidence/2026-11-21/doorflee2-b-checkquick.log`
- Instrument: `scripts/pinquaddoor-driver-b.js` (doorflee2Flag
  stamp + doorHold/everHopeless row fields),
  `scripts/analyze-pinquaddoor-b.js`,
  `scripts/analyze-doorflee2-b.js` (NEW, selftest 11/11),
  `scripts/test-allyslot3-b.js`, `scripts/test-pinquaddoor-b.js`,
  `scripts/test-pinquaddoor-wide-b.js`, `scripts/test-dmgpin-b.js`,
  `scripts/test-dmgpin-reprereg-b.js`,
  `scripts/test-dmgpin-scout-b.js`,
  `scripts/test-doorflee2-b.js` (NEW, 49 checks),
  `scripts/build-pinquaddoor-b-panels.js`,
  `scripts/fixtures/dmgpin-b-s106722-control.json`,
  `scripts/fixtures/dmgpin-b-s106722-armed.json`
- `src/` diff: the ported lever (6 files, verified as documented
  in §2) + the DOORFLEE → DOORFLEE2 replacement in
  `src/js/fieldFights.js`. No default flip.
