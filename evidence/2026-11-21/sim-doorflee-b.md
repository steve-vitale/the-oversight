# sim-doorflee-b — the staying lever (Loop B adoption round fleshout-loop-b-20261121T2030Z)

**Verdict: NO-GO.** The hold works mechanically — it fires on 8 doors,
converts 2 flights into kills and stretches 3 more flights by 2–5
rounds — but it fails three frozen bars at once: the flee count (6
armed flees vs a bar of ≤ 4), the damage-rate guard (0.897× control
vs a 0.90 floor), and the deaths guardrail (a `regression_signal`
on village deaths per 100 days). The trade the hold makes is priced
in the pilot's own numbers: of the 8 doors it holds, 2 become kills,
3 flee later anyway, and **3 kill the leader**. A lever that trades
a flight for a death as often as for a kill is not a win. No confirm
runs. The next arm's design input is in §7.

**Arm:** sim-doorflee-b. **Branch:** `sim-doorflee-b`, worktree
`~/workspace/worktrees/sim-doorflee-b`. **Frozen prereg:**
`evidence/2026-11-21/sim-doorflee-b-prereg.md` (frozen 2026-11-21
~23:00 UTC, before any judged sim; one pre-legs amendment, bars
unchanged: M3e count recorded as 25/25). **Frozen base:** master
`3329f4441` (full `3329f4441fb4b5e6e8c0a3bf5a7b8456aebecb27`).
**Band (designated reuse):** 106809, 106812, 106816, 106817, 106820,
106824, 106829, 106830. **Policy:**
`scripts/policies/competent.js` sha256
`1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
(first 12: `1884c8852d38`, verified live at freeze). **Horizon:**
150d death-aware. **Substrate (both legs):** `SENSEEXPED=1
PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 LAUNCHSURVIVE=1
ALLYSLOT3=1 PINQUAD=1 DMGPIN=1`. **Control** = that substrate,
DOORFLEE unset (pin + damage, no hold — the dmgpin armed
configuration, re-run fresh). **Armed** = same + `DOORFLEE=1`.
Nothing else differs between the legs. Legs chunked 4+4 seeds; all
four chunks exit 0, 0 instrument errors per seed, anchor/flags
verified on every file (analyzer B4 green on both legs).

## 1. The diagnosis (re-derived from the dmgpin corpora — §1 of the prereg)

Door = wave ≥ 4, `origin === 'expedition'`, `allyFromStart`,
`pinned`, rounds ≥ 1. Across the dmgpin corpora (13 control + 11
armed fought doors): **18 vFlee, 5 vKill, 1 mFlee**. All 18 flights
are the HOPELESS branch — the log line is always "sees how this
ends — and runs while running still works", intent always `engage`.

Recomputing the morale race on LIVE numbers (actual post-armor
damage taken, live HP left, the engine's own 1.1 winning margin):
**15 of the 18 flees are WINNING** — the party drops the monster
first. Only 3 control flees are hopeless on live numbers. The two
most extreme: 106829 algorithm control fled at round 9 with the
monster at 248/1100 HP (23% left, 2.6 rounds to the kill, party HP
270); 106830 algorithm armed fled at round 5 with the monster at
193/1099 HP (18% left, 1.0 round to the kill, party HP 173). At
flee time the leader is at 25–58% HP while three allies stand
nearly untouched at 45–100 HP; the leader takes nearly all the
damage (in 12/18 flees the leader took ≥ 2× any ally).

**The mechanism (plain words):** the flee decision is made on an
IMAGINED fight, not the real one. The morale read (FIGHTBLEND-B)
replays the fight as if everyone's armor were only protection 4,
while the monster's damage stays real. A door fighter in
tier-appropriate armor (protection ~33) actually lets through only
~20% of a blow; imagined at protection 4, ~68% gets through —
about 3× the real damage. After a few rounds the leader's imagined
health is deeply negative (they "would have died twice over"), and
that negative number drags the whole four-person party's pooled
survival below the kill horizon — so a party that is actually
winning reads as hopeless and runs.

**The dead run's lead — VERDICT: half right.** Right that the flee
traces to the P4 hopeless read. WRONG on the "party-pool misread":
the pool DOES include the third ally — the pinquad port adds
`ally3EntryHp - rec.ally3TakenP4` to the party pool at the morale
read (verified in the branch code). The misread is not a missing
ally — it is the NEGATIVE-HP drag: the pool is a single sum, so one
fighter's deeply-negative hypothetical HP outweighs three healthy
allies.

**Second finding (documented, still open):** door parties launch
with members at near-death HP — the 106809 reunion's third ally
entered at 3 HP (both dmgpin legs). The pin/expedition formation
does not HP-gate its members. This pilot reproduces it (§6, S7).

**Rejected alternative (recorded, not built):** flooring each
fighter's hypothetical HP at 0 in the pool. It leaves the P4
incoming RATE ~3× actual, so the survival horizon stays below the
kill horizon on most doors (estimated on 106830 d105: floored rtd
~7.8 rounds vs a 9.7-round kill horizon — still hopeless).

## 2. The lever (DOORFLEE) — built, env-gated OFF by default

A pinned quad at a door holds while the LIVE race says it is
winning. In `src/js/fieldFights.js`, beside the DMGPIN gate:

- **Gate (computed once, same terms as DMGPIN):** `DOORFLEE=1` in
  env AND wave ≥ 4 AND `opts.allyFromStart` AND the full pinned
  trio matches `pinnedQuadAllies(vid)` (a trio that joins later
  through the shout ladder never qualifies). In the browser
  `process` is undefined, so the flag is never on there.
- **Hold (after the FINISHERSIZE block, mirroring its shape):**
  when the P4 read actually said `hopeless`, at round ≥ 2, re-read
  the SAME race on live numbers — live party HP left against live
  damage taken per round, same 1.1 winning margin — and if the
  live race says winning AND the leader themself can survive
  another round at the current incoming rate (`vHp > leaderRate`),
  suppress the hopeless flee (`hopeless = false`, `winning = true`,
  `fleeAt = 0.05`, `rec.doorHold++`, one "(Door hold)" log line).
  The leader-next-round guard is a precondition, not a knob: a quad
  whose leader is about to drop is not committing, it is dying —
  the hold releases and the normal floor decides.
- **Untouched:** learn-first withdrawal, death, the 5% winning
  floor, signature exits, sealed arenas, solo/non-door/shout-ladder
  fights, and every fight with the flag off (no RNG is drawn —
  verified by the proof test's §0 source check; off-mode is
  byte-identical).
- **Known cost mode (from the proof probe, priced by M5):** the
  hold can trade a flee for a leader death when one big hit lands
  on a wounded leader — the staged 84-HP algorithm fight holds
  twice and the leader dies on round 6, one round from the kill.

Canon grounding: MONSTER-WAVES.md wave-4 bands (HP 850–1500,
damage 35–95, pierce 0.2–0.5; "a 4-6 round fight for a godhood
build (~220 dmg/round)"). No canon doc prices a morale read or a
commitment hold — the hold is a sim lever to test whether the flee
is the binding constraint, judged on flee rate + kills; landing it
as a game change would still be a Steve/design call, not this
arm's. The lever stays env-gated / default-OFF exactly as built —
NO default flip in this arm.

**Port:** the DMGPIN lever, the PINQUAD lever, and the ALLYSLOT3
slot live on the HELD branch `sim-pinquaddoor-b` (tip `94e0b5b85`)
and are NOT on master. Ported as `git diff b20328ad9 94e0b5b85
-- src/` (6 files, 324 insertions / 25 deletions), sha256
`3107d05f894d833ea5b84bdcac0a95490988d1008436f31fb20fc98e918e5ad5`.
5 files applied cleanly; `fieldFights.js` applied 26/27 hunks
via `patch`, the one reject (the @@ -1756 monster-phase ally
pick hunk) hand-merged per the dmgpin prereg: master's #2634 pick
line kept VERBATIM, the branch's 3-ternaries and 3-case
`_wardAllyVid` applied around it; the @@ -1885 hunk applied
cleanly with the `_hWasLive` transition guard intact. Verified:
`node --check` passes on all 6 files; all 6 ported files are
BYTE-IDENTICAL to the dmgpin-report-b port commit `c48854921`'s
src; the #2634 lines match this base's HEAD verbatim. The held
branch is NOT merged, NOT modified, NOT rebased.

**Driver additions (this arm only, documented in the prereg):**
the corpus stamp gains `doorfleeFlag: process.env.DOORFLEE ||
null` and each v4 row gains `doorHold` (`rec.doorHold`, 0 when the
hold never fired) and `everHopeless` (`!!rec.everHopeless`). No
other driver behavior changes.

## 3. Frozen-bar verdict (M1–M6)

| Bar | Requirement | Result | Pass? |
| --- | --- | --- | --- |
| M1 port gate | `test-allyslot3-b.js` 18/18 | **18/18** | ✅ |
| M2 staged pin proof | `test-pinquaddoor-b.js` 35/35 | **35/35** | ✅ |
| M2w wide-instrument proof | `test-pinquaddoor-wide-b.js` 16/16 | **16/16** | ✅ |
| M3 damage proof | `test-dmgpin-b.js` 29/29 | **29/29** | ✅ |
| M3d staying proof | `test-doorflee-b.js` 42/42 | **42/42** | ✅ |
| M3e downedtwice regression | `test-downedtwice-b.js` exit 0 | **exit 0, 25/25** | ✅ |
| Analyzer selftest | `analyze-doorflee-b.js --selftest` 11/11 | **11/11** | ✅ |
| F1 flee (PRIMARY) | armed vFlee ≤ 4 AND armed flee rate ≤ control rate − 20pp | armed **6** flees (rate 40.0% vs control 72.7%, **−32.7pp**) — rate passes, count fails | ❌ |
| P2 door kills | armed FRESH door kills ≥ control | armed **5** vs control **3** (all 5 fresh, roundsDetail-derived entry HP ≥ 500) | ✅ |
| P3 damage shape | armed pooled dmg/round ≥ 0.9× control | armed **153.2** vs control **170.9** = **0.897×** | ❌ |
| B1 pin delivery | armed ally3Vid rate ≥ control − 10pp AND ≥ 3 armed rows | **15/15 (100%)** vs control 11/11 (100%) | ✅ |
| B2 ally3Dealt | armed total > 0 AND ≥ 1 fight ≥ 10 (pinned wave-4+ subset) | total **3,316**, max **524**, 38 rows (control 2,162 / 404 / 31) | ✅ |
| B3a kill conversion | armed wave-4+ vKill rate ≥ control − 2pp | armed **7.77%** (16/206) vs control **7.18%** (14/195), +0.59pp | ✅ |
| B4 substrate | every file: anchor == frozen base, policySha `1884c8852d38`, pinquadFlag '1', dmgpinFlag '1', doorfleeFlag null (control) / '1' (armed), slot+pin present | **8/8 + 8/8 files clean** | ✅ |
| M5 guardrail | balanced-panel compare `review_required` with NO `regression_signal` on village deaths / deaths-per-100d | `review_required` BUT **`regression_signal` on deaths per 100d** (64.59 → 67.28, +2.69, 95% CI 0.34–4.96); deaths/run `regression_watch` (+1.38, CI −4.5–6.88) | ❌ |
| M6 deliverable | evidence file + panel + sense-test transcript | this file + `doorflee-b-panel.md` + panel JSONs + `doorflee-b-analysis.json` + transcript (§5) | ✅ |

**The analyzer's own verdict is `pass: false`** (exit 1 — the
judge exits nonzero on a NO-GO; the JSON is still written in
full). Three frozen bars miss — F1 (count), P3 (by 0.3pp), M5
(deaths signal) — so the pilot is **NO-GO**. A miss is NO-GO,
never re-scored; the metric-review notes in §7 are for the NEXT
run, not a revision of this one.

**Reading the three misses honestly:**

- **F1's count bar assumed ~11 doors on both legs; the armed leg
  fought 15.** The hold kept parties alive long enough to reach
  MORE doors (106830 fought 5 doors armed vs 2 control; 106809
  fought 3 vs 2). The rate bar passed comfortably (−32.7pp), and
  the count miss is a denominator effect as much as a lever
  effect — but the bar is the bar, and 6 flees is 6 flees. The
  confirm prereg should price F1 on the rate, with the count as a
  secondary, if the next lever re-tests.
- **P3 missed by 0.3pp (0.897 vs 0.90).** The hold stretches
  fights from 2–3 rounds to 5–7, and the stretched rounds deal
  less per round: the leader spends actions binding wounds
  (see the transcript, R2), and the final round only deals the
  monster's remaining HP. Pooled damage/round is a composition
  metric — longer fights dilute it. The raw totals tell the other
  side: armed dealt 11,642 across 76 rounds vs control 7,177
  across 42.
- **M5 is the binding miss, not a technicality.** Villages died
  faster armed (median survival 136.5d → 120d; deaths 681 → 692;
  deaths/run 85.1 → 86.5). The deaths-per-100d interval sits
  entirely above zero. The hold's death mode is visible in the
  door table (§4): 3 of the 4 armed door deaths are hold deaths.

## 4. Door-fight tables (every fought door, both legs)

Party HP columns are `[leader, ally, ally2, ally3]` at fight
entry (roundsDetail round 1) and at fight end (last round).
`entryHp` is the roundsDetail-derived fresh-entry HP
(`mHpStartRec`). `dpr` is dealt/round. `vTaken` is damage the
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

Control reproduces the dmgpin armed shape exactly as expected:
11 fought doors, 8 flees, 3 kills — the same counts the dmgpin
armed leg produced on these seeds. 9/11 flees/kills read
hopeless on the P4 morale read; every flee is the hopeless
branch, flee fractions 0.12–0.46, leaders ending at 12–46 HP
while allies stand at 45–100 HP.

### Armed — 15 fought doors: 6 vFlee, 5 vKill, 4 vDie

| seed | day | monster | w | rnd | outcome | dealt | entryHp | dpr | fleeFrac | hold | hopeless | vTaken | a3Dealt | entry HP | end HP |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 106809 | 93 | cancellation | 5 | 5 | vFlee | 1480 | 1936 | 296.0 | 0.09 | **3** | Y | 79 | 524 | [68,73,85,80] | [9,73,71,48] |
| 106809 | 93 | reunion | 4 | 2 | vFlee | 284 | 1365 | 142.0 | 0.05 | 0 | Y | 63 | 34 | [48,73,71,9] | [5,73,71,9] |
| 106809 | 99 | eulogy | 4 | 5 | vDie | 596 | 1001 | 119.2 | — | 0 | N | 89 | 124 | [53,80,91,94] | [0,71,91,94] |
| 106812 | 100 | influencer | 4 | 7 | vFlee | 844 | 968 | 120.6 | 0.10 | **5** | Y | 95 | 198 | [85,56,67,90] | [10,35,58,90] |
| 106816 | 146 | audit | 4 | 5 | vKill | 1182 | 1166 | 236.4 | — | 0 | N | 48 | 404 | [100,86,100,99] | [72,86,100,91] |
| 106817 | 59 | reunion | 4 | 4 | vDie | 428 | 1356 | 107.0 | — | **2** | Y | 91 | 94 | [89,68,82,93] | [0,54,82,93] |
| 106820 | 45 | eater | 4 | 7 | vFlee | 1049 | 1083 | 149.9 | 0.03 | **3** | Y | 77 | 184 | [80,72,100,100] | [3,34,100,70] |
| 106824 | 82 | algorithm | 4 | 4 | vDie | 302 | 1032 | 75.5 | — | **2** | Y | 64 | 70 | [40,69,88,69] | [0,69,73,60] |
| 106829 | 115 | algorithm | 4 | 6 | vKill | 1130 | 1100 | 188.3 | — | **1** | Y | 68 | 362 | [100,90,100,100] | [52,90,93,80] |
| 106829 | 115 | strike | 4 | 2 | vFlee | 330 | 1110 | 165.0 | 0.12 | 0 | Y | 78 | 100 | [90,52,93,80] | [12,52,93,80] |
| 106830 | 97 | influencer | 4 | 7 | vKill | 883 | 858 | 126.1 | — | 0 | N | 27 | 236 | [91,51,84,60] | [64,47,59,60] |
| 106830 | 98 | algorithm | 4 | 7 | vKill | 1159 | 1130 | 165.6 | — | **3** | Y | 42 | 420 | [63,45,52,62] | [41,45,25,52] |
| 106830 | 98 | influencer | 4 | 1 | vFlee | 197 | 1017 | 197.0 | 0.14 | 0 | N | 11 | 66 | [25,45,41,52] | [14,45,41,52] |
| 106830 | 103 | influencer | 4 | 7 | vKill | 902 | 873 | 128.9 | — | 0 | N | 51 | 330 | [66,65,94,69] | [35,65,62,60] |
| 106830 | 131 | eater | 4 | 7 | vDie | 876 | 1150 | 125.1 | — | **5** | Y | 93 | 146 | [91,92,76,84] | [0,92,15,46] |

**The hold's ledger (8 held doors, 24 hold-rounds):** 2 kills
(106829 d115 algorithm, held 1; 106830 d98 algorithm, held 3 —
the transcript in §5), 3 flees-later (106809 w5, held 3, fled at
0.09 with the leader at 9 HP; 106812, held 5, fled at 0.10,
leader 10 HP; 106820, held 3, fled at 0.03, leader 3 HP), and 3
leader deaths (106817, held 2, leader 89 → 0; 106824, held 2,
leader 40 → 0; 106830 d131, held 5, leader 91 → 0). The fourth
armed door death (106809 d99 eulogy) had no hold and never read
hopeless — a straight loss, not a hold death.

**Matched-seed pairs (the same 11 doors in both legs):** 5 are
byte-identical in outcome, rounds, and dealt (106809 reunion
284; 106816 audit kill 1182; 106829 algorithm kill 1130; 106829
strike flee 330; 106830 d97 kill 883) — the hold never fired on
them, so the trajectories stayed locked. 6 changed: 3 fled later
with +436 to +664 more damage dealt (106809 w5: R3→R5, 816→1480;
106812: R2→R7, 272→844; 106820: R4→R7, 613→1049), 2 fled → died
with identical damage (106817: 428; 106824: 302 — the extra round
dealt nothing; the leader died before striking), 1 fled → killed
(106830 d98: 937 → 1159). The armed leg also fought 4 doors the
control never reached (trajectory divergence after the hold kept
parties alive to fight again).

## 5. Sense-test transcript — the held kill, read blow by blow

Seed 106830, day 98, the algorithm (shown in the fight as
"Loud-Eyes"; its attacks are named "Recommended For You",
"Engagement", "Demonetized"). Victor leads; Xavier, Jorge, and
Lucas are the pinned trio. The same door in the control leg fled
at round 5 with the monster at 193 HP (18% left, 1.0 round to the
kill). Armed, the hold fires after round 2 and the quad fights
on to the round-7 kill. Full 49-line log, verbatim from the
armed corpus (`doorflee-b-s106830-doorflee-b-pinquaddoor.json`,
v4encounters, day 98, algorithm):

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
R1: Lucas strikes for 68 (x1.3) (pinned x2) (913 left)
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

What this shows, plainly: the hold fires once (after R2, when
the P4 read first says hopeless), the quad keeps fighting, the
monster's damage spreads off the leader onto Jorge and Lucas in
rounds 3–6, Victor binds a wound mid-fight, and the quad takes
the kill at round 7 with Victor at 41 HP and all four alive.
This is the lever working exactly as designed — and it is also
the only clean conversion in the pilot. The other held doors
ended in a later flee (3) or a dead leader (3).

## 6. Wall numbers (control vs armed, 8 seeds each)

| | Control | Armed |
| --- | --- | --- |
| Full-seat wins | 0/8 | 0/8 |
| National scale reached | 0/8 | 0/8 |
| Wave 5 reached | 3/8 | 4/8 (106820 newly reaches wave 5) |
| Villages survived 150d | 2/8 | 2/8 |
| Villages lost | 6/8 | 6/8 |
| Median survival | 136.5d | 120d |
| Village deaths (total) | 681 | 692 |
| Village deaths / run (panel) | 85.1 | 86.5 (+1.38, `regression_watch`) |
| Village deaths / 100d (panel) | 64.59 | 67.28 (+2.69, 95% CI 0.34–4.96, `regression_signal`) |
| Starvation deaths | 3 | 7 |
| Wound deaths | 10 | 5 |
| Monster / combat / wild deaths | 486 | 482 |
| Standing (best village) | 580 (106809) | 655 (106809) |
| Standing gains | — | 106809: 580→655; 106820: 199→370 (wave 5); 106830: 420→485 |
| Fought doors | 11 | 15 |
| Fresh door kills | 3 | 5 |

No win, no national seat on either leg — the hold moves door
outcomes, not the endgame. The standing gains on three seeds
(106809, 106820, 106830) are real but small against the survival
cost: median survival fell 16.5 days and deaths-per-100d carries
a regression signal. The starvation-death count (3 → 7) is
small-n noise on its own, but it points the same way as the
deaths signal — held fights cost the village time and people
even when they win the door.

**Secondaries (S1–S7):**
- S1 hold census: 24 hold-rounds across 8 fights (armed); 0
  control. 10/15 armed doors read hopeless at some point
  (everHopeless), vs 9/11 control.
- S2 flee-round shift: control flees at rounds 2–5 (median 3);
  armed flees at rounds 2–7 (median 5) — held fights flee later,
  at flee fractions 0.03–0.12 (vs control 0.12–0.46), i.e. the
  quad stays until it is nearly dead.
- S3 leader-death census: 0 control door deaths; 4 armed (3
  hold deaths + 1 straight loss). Leaders died at entry HP
  89/40/91 (hold deaths) and 53 (straight loss).
- S4 pin-subset B1 rate: 100% ally3Vid on fought doors both
  legs (15/15 vs 11/11).
- S5 door table: §4 above.
- S6 wall numbers: this section.
- S7 near-death members: 1 door per leg with a member entering
  below 25 HP — the SAME door, 106809 day-93 reunion: control
  ally3 entered at **3 HP**; armed ally3 entered at **9 HP**
  (leader 48 vs control 80 — trajectory divergence changed the
  entry state, the fight itself was identical: 284 dealt, flee
  R2). The formation blank from the diag is reproduced, not
  fixed: the pin still takes a near-dead third ally to a door.

## 7. Reachability verdict + what the next arm should build

**Reachability: the flee is NOT the binding constraint — or
rather, removing it exposes the next one.** The diag was right
about the mechanism (the P4 hopeless read flees winning quads)
and the hold proves it mechanically (the 106830 d98 kill is a
flee converted to a kill on live numbers). But the pilot's own
ledger says the hold is a bad trade at this shape: 8 holds → 2
kills, 3 later flees, 3 dead leaders. The leader-next-round
guard is not enough — the leader survives the NEXT round and
dies two rounds later, because the monster's damage concentrates
on the leader and the hold keeps them in the line of fire while
their HP is already spent. The pooled party race says "winning";
the leader's own body says "dying". The guard prices the
pooled race; it does not price the leader's trajectory.

**The next arm's design input (not a re-score of this one):**
- A leader-survival-only hold: hold only while the LEADER's
  live HP stays above a floor that survives the whole remaining
  kill horizon (leader HP > leaderRate × rounds-to-kill), not
  just one more round — the current `vHp > leaderRate` guard is
  one round of foresight on a 3–5-round hold.
- Or the rejected hypo-floor alternative (floor each fighter's
  hypothetical HP at 0 in the pool) combined with the hold, so
  the P4 read stops dragging the pool negative before the hold
  ever has to fire.
- Or HP-gate door parties (the S7 blank): a pin that refuses a
  member below ~25 HP would stop the 3-HP/9-HP third-ally doors
  that make held fights fragile — the cheapest fix in the
  pilot's evidence, and it is a formation question, not a
  morale question.
- F1 for the next run should be priced on the flee RATE with the
  count as a secondary (the armed leg fought 4 more doors; a
  count bar punishes the lever for reaching more doors), and P3
  should be priced on total damage per door or per fight, not
  per round (longer held fights dilute per-round damage by
  construction).

## 8. Metric review (for the NEXT run — this run is judged as frozen)

- F1's count bar (≤ 4) assumed ~11 doors on both legs. The
  armed leg supplied 15. The rate leg (−32.7pp) passed
  comfortably; the count leg failed. Price the next F1 on the
  rate, with the count as a secondary.
- P3's per-round damage guard missed by 0.3pp (0.897 vs 0.90).
  Per-round damage is a composition metric: held fights run
  longer and their late rounds deal less (wound-binding actions,
  the final round dealing only remaining HP). Price the next P3
  on damage per door or total dealt, not per round.
- The door-line order quirk (door lines print 2, 3, 1) persists
  in the ported slot code; cosmetic, no bar.
- The pin's near-death members (3-HP / 9-HP third ally, 48-HP
  leader) are a formation question, not a morale question; no
  bar turned on them here, but S7 counts them for the next arm.
- **Analyzer output deviation (documentation, not a bar):** the
  prereg lists `doorflee-b-analysis-control.json` +
  `doorflee-b-analysis-armed.json` as separate files, but the
  analyzer's `--json` emits ONE combined judged comparison,
  `doorflee-b-analysis.json` (control + armed + kill rates +
  bars + `pass: false`). That is the file attached; the
  per-leg sections inside it carry the same numbers the two
  files would have.
- **check.js --quick:** deferred during the legs because a
  sibling (journey-landing r153 gate) was running it
  concurrently — the rule is never two check.js at once. Retried
  after the legs (started 23:31 UTC, `--cacheDirectory=/tmp/
  jest-cache-sim-doorflee-b`): **338 passed, 6 failed in 1237s**,
  exit 1. The 6 break down as 3 + 3, neither group a behavior
  regression from this arm: (a) three TIMEOUTs at check.js's
  120s per-script cap — `test-trust-observer-neutrality.js`,
  `test-living-garden-deed-attainment.js`,
  `test-one-person-army-deed-attainment.js` — all three pass
  standalone afterward (trust-observer 6/6 in ~85s; the other
  two exit 0), run while a sibling's check.js was hammering the
  shared 1.5 CPUs, i.e. contention artifacts, not code; (b)
  three proof-FRESHNESS failures — `test-measurement-proof-
  update.js` ("Proof source inputs are not current"),
  `test-measurement-workflow.js` ("retained neutrality proof
  covers the current Game/controller/harness inputs", 8 passed
  1 failed), `test-phone-frame-proof.js` (3 failed: retained
  browser inputs vs current source; phone receipt stale on
  index.html) — these fail because ANY src change invalidates
  the retained proof hashes; the repo prescribes refreshing
  them via `scripts/balance-proof-update.js` and
  `scripts/phone-frame-proof-update.js`. That refresh is a
  maintenance action for the ship/merge flow, NOT part of this
  arm's frozen bars, and was deliberately not done here — the
  port is env-gated sim code, and the refresh belongs with the
  coordinator's merge decision, not with a pilot's evidence.
  The arm's own proofs (M1–M3e, §9) are the frozen gate and are
  all green.

## 9. Proofs (all green, post-freeze, on the ported tree)

M1 `test-allyslot3-b.js` **18/18** · M2 `test-pinquaddoor-b.js`
**35/35** · M2w `test-pinquaddoor-wide-b.js` **16/16** · M3
`test-dmgpin-b.js` **29/29** · M3d `test-doorflee-b.js` **42/42**
· M3e `test-downedtwice-b.js` **exit 0, 25/25** · analyzer
selftest **11/11**. Development runs before freezing: the
doorflee test first ran 38/40 with two test-side expectation
bugs (a §1 check that assumed the hold suppresses later flees —
it releases when the leader guard fails, so the round-3 flee is
a fresh decision — and a §2 comparator that compared the no-pin
load against the doubled pinned control instead of a second
no-pin load); both fixed in the test, no lever change; the fix
also added 2 checks, hence 42. The post-freeze run is the
judged one.

## 10. Files

- Prereg: `evidence/2026-11-21/sim-doorflee-b-prereg.md`
- Evidence: `evidence/2026-11-21/sim-doorflee-b.md` (this file)
- Legs log: `evidence/2026-11-21/doorflee-b-legs.log`
- Corpora: `evidence/2026-11-21/perseed-doorflee-b-control/` (8
  files) + `evidence/2026-11-21/perseed-doorflee-b-armed/` (8
  files)
- Analysis: `evidence/2026-11-21/doorflee-b-analysis.json`
  (analyzer --json over both corpus dirs; `pass: false`, exit 1)
- Panel: `evidence/2026-11-21/doorflee-b-panel.md` +
  `doorflee-b-panel.json` +
  `doorflee-b-panel-before.json.gz` +
  `doorflee-b-panel-after.json.gz`
- Instrument: `scripts/pinquaddoor-driver-b.js` (doorfleeFlag
  stamp + doorHold/everHopeless row fields),
  `scripts/analyze-pinquaddoor-b.js`,
  `scripts/analyze-doorflee-b.js` (NEW, selftest 11/11),
  `scripts/test-allyslot3-b.js`, `scripts/test-pinquaddoor-b.js`,
  `scripts/test-pinquaddoor-wide-b.js`, `scripts/test-dmgpin-b.js`,
  `scripts/test-dmgpin-reprereg-b.js`,
  `scripts/test-dmgpin-scout-b.js`,
  `scripts/test-doorflee-b.js` (NEW, 42 checks),
  `scripts/build-pinquaddoor-b-panels.js`,
  `scripts/fixtures/dmgpin-b-s106722-control.json`,
  `scripts/fixtures/dmgpin-b-s106722-armed.json`
- `src/` diff: the ported lever (6 files, hand-merged as
  documented in §2) + the DOORFLEE hold in
  `src/js/fieldFights.js`. No default flip.
