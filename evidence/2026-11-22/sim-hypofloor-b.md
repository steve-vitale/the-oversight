# sim-hypofloor-b — the hypo floor (Loop B adoption round fleshout-loop-b-20261122T0530Z)

**Verdict: NO-GO on F1 only.** The floor is mechanically live — the staged
proof shows it converting a round-6 hopeless-read flee into a stay-and-kill —
but on the frozen band it changes nothing: the flee rate is 2/6 armed vs 2/6
control (0.0pp drop against a −20pp bar), the two flees are byte-identical
conversions of nothing, and every other frozen bar passes. The band's flees
are early leader-hurting flees at rounds 2–3, not the late pooled-negative-HP
drag the floor is built for. No confirm runs. The lever stays env-gated OFF.
The next arm's input is HP-gating door parties, not a re-run of this lever.

**Arm:** sim-hypofloor-b. **Branch:** `sim-hypofloor-b`, worktree
`~/workspace/worktrees/sim-hypofloor-b`. **Frozen prereg:**
`evidence/2026-11-22/sim-hypofloor-b-prereg.md` (frozen 06:56Z Nov 22, before
any judged sim; one §6 anchor amendment after the §6 live-anchor proof
artifact — bars unchanged). **Frozen base:** master `68e0503c4` (full
`68e0503c4f22…`, r265 closeout). **Band:** 107311–107318 (8 seeds, fresh,
verified unused by the worker's freshness search before freezing).
**Policy:** `scripts/policies/competent.js` sha256
`1884c8852d38…` (first 12 `1884c8852d38`, verified live at freeze).
**Horizon:** 150d death-aware. **Substrate (both legs):**
`SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1
ALLYSLOT3=1 LAUNCHSURVIVE=1`, MODE=vre, one leg recorder ON.
**Control** = that substrate, HYPOFLOOR unset. **Armed** = same +
`HYPOFLOOR=1`. Nothing else differs between the legs. Legs chunked 4+4
seeds; all four chunks exit 0, 0 instrument errors per seed, anchors
`68e0503c4f22`, hypofloorFlag null control / `'1'` armed on every file
(analyzer B4 green on both legs).

## 0. The lever (plain words)

The morale read that decides whether a party flees replays the fight as if
everyone's armor were only protection 4, while the monster's damage stays
real — about 3× the real damage after armor. After a few rounds the
leader's imagined health is deeply negative ("would have died twice over"),
and that negative number drags the whole four-person party's pooled
survival below the kill horizon, so a party that is actually winning reads
as hopeless and runs. The floor clamps each fighter's hypothetical HP at 0
at the morale read, so one fighter's deeply-negative imagined health can
no longer drag the pooled party survival below the kill horizon. It sits
beside the DOORFLEE2 hold in `src/js/fieldFights.js` (+42/−3 per prereg;
gate beside DOORFLEE2, floor in the morale read, env-gated OFF).

## 1. The diagnosis (carried from doorflee-b §1)

Door = wave ≥ 4, `origin === 'expedition'`, `allyFromStart`, `pinned`,
rounds ≥ 1. Across the dmgpin corpora (13 control + 11 armed fought doors):
**18 vFlee, 5 vKill, 1 mFlee**. All 18 flights are the HOPELESS branch —
the log line is always "sees how this ends — and runs while running still
works", intent always `engage`.

Recomputing the morale race on LIVE numbers (actual post-armor damage
taken, live HP left, the engine's own 1.1 winning margin): **15 of the 18
flees are WINNING** — the party drops the monster first. Only 3 control
flees are hopeless on live numbers. The two most extreme: 106829 algorithm
control fled at round 9 with the monster at 248/1100 HP (23% left, 2.6
rounds to the kill, party HP 270); 106830 algorithm armed fled at round 5
with the monster at 193/1099 HP (18% left, 1.0 round to the kill, party HP
173). At flee time the leader is at 25–58% HP while three allies stand
nearly untouched at 45–100% HP; the leader takes nearly all the damage
(in 12/18 flees the leader took ≥ 2× any ally).

**The dead run's lead — VERDICT: half right.** Right that the flee traces
to the P4 hopeless read. WRONG on the "party-pool misread": the pool DOES
include the third ally — the pinquad port adds `ally3EntryHp -
rec.ally3TakenP4` to the party pool at the morale read (verified in the
branch code). The misread is not a missing ally — it is the NEGATIVE-HP
drag: the pool is a single sum, so one fighter's deeply-negative
hypothetical HP outweighs three healthy allies.

**The §1 caution that binds here:** on 106830 d105 the floored rtd is
~7.8 rounds against a 9.7-round kill horizon — flooring at 0 still reads
hopeless when the kill horizon is long. The floor can only convert flees
where the pooled read is dragged below the horizon by a negative term, not
flees where the rate itself is too slow. This band's flees are the second
kind (see §4).

## 2. Frozen-bar table

| Bar | Control | Armed | Bar | Result |
| --- | --- | --- | --- | --- |
| F1 flee rate (fought doors) | 2/6 = 33.3% | 2/6 = 33.3% | drop ≥ 20pp | **FAIL** (0.0pp) |
| P2 fresh door kills | 2 | 2 | ≥ control | PASS |
| P3 damage per door | 617.7 | 617.7 | ≥ control | PASS |
| B1 ally3 visible rate | 1.000 (6/6) | 1.000 (6/6) | ≥ 0.90 | PASS (+10pp margin) |
| B2 ally3 dealt (total / max) | 804 / 288 | 804 / 288 | > 0 / no cap | PASS |
| B3a kill conversion | 0.077 (12/155) | 0.077 (12/155) | ≥ control | PASS |
| B4 substrate / instrument | 8 files, 0 bad | 8 files, 0 bad | 0 bad | PASS |

Analyzer verdict FAIL (exit 1) on F1 alone. All other bars pass, all
identical between legs — the armed leg is trajectory-identical to control
(no RNG drawn by the lever, no fight outcome diverged anywhere in the band).

## 3. Door-fight table (all 6 fought doors, byte-identical both legs)

| Seed | Day | Monster | Wave | Rounds | Outcome | Dealt | Dmg/round | Flee HP frac | everHopeless | doorHold | ally3 dealt |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 107314 | 109 | suburb | 4 | 8 | vKill | 1460 | 182.5 | — | true | 1 | 282 |
| 107314 | 110 | strike | 4 | 3 | vFlee | 588 | 196.0 | 0.21 | true | 0 | 118 |
| 107314 | 115 | congregation | 4 | 1 | mFlee | 0 | 0 | — | false | 0 | 0 |
| 107314 | 115 | suburb | 4 | 10 | vKill | 1336 | 133.6 | — | false | 0 | 288 |
| 107314 | 120 | cancellation | 5 | 1 | mFlee | 0 | 0 | — | false | 0 | 0 |
| 107316 | 86 | reunion | 4 | 2 | vFlee | 322 | 161.0 | 0.25 | true | 0 | 116 |

Totals: fought 6, vFlee 2, vKill 2, mFlee 2, vDie 0. Dealt 3706 over 25
rounds (148.24/round, 617.7/door) both legs. doorHold rounds 1 vs 1;
everHopeless fights 3 vs 3 — the floor starved zero hopeless reads.

**Door-thin panel, said plainly:** 6 fought doors against ~16 expected.
Five of eight seeds fought no door at all (pinFights 0 on 107311, 107312,
107313, 107315, 107317, 107318); all six doors sit on 107314 (5) and
107316 (1). The panel is door-thin, but the verdict is still NO-GO on F1,
not SUPPLY-THIN: 6 doors is thin but non-zero, both flees are no-change
conversions with a mechanism story (§4), and the frozen bar binds as
written. A thicker band would not change the mechanism — it would only
add more of the same early flees.

## 4. The two flees — why the floor converts nothing

**Conversions: 0.** Both matched control flees → 0 kills, 0 later flees,
2 no-change.

- **107314 d110 strike** (control vFlee r3 → armed vFlee r3). The quad
  deals 588 in 3 rounds (196/round) against a monster with ~1063 HP
  (475 left at flee time, 45%). But the leader, Diana, takes every blow:
  71 HP at fight start, 48 after R1, 46 after R2, **21 after R3** — the
  monster hits 22–25 per round and she has 21 left. On live numbers she
  dies next round. The flee is a leader-survival flee, not a misread
  flee: the pooled read is irrelevant when the leader herself is one hit
  from death. The floor clamps her hypothetical HP at 0 — 0 rounds-to-drop
  is still hopeless, and the rate (2.4 rounds to the kill vs a leader who
  survives ~1) still fails.
- **107316 d86 reunion** (control vFlee r2 → armed vFlee r2). Two rounds,
  322 dealt (161/round), leader Nadia at 25% HP at flee time. Same shape:
  an early flee with a hurting leader, before the hypo pool has had the
  rounds to go deeply negative.

The floor's mechanism needs several rounds for the imagined 3× damage to
drag a term deeply negative. These flees fire at rounds 2–3, while the
leader is genuinely about to die on live numbers. The floor cannot touch
that shape — it is the §1 caution (floored rtd vs kill horizon) and the
leader-survival problem, not the pooled-negative-HP drag.

**S7 (follow-up blank):** 0 of 6 doors had any party member enter below
25 HP (minimum entry HP across the band: 65 — d109 Diana 100 / Wanjiru 93
/ Mara 89; d110 Diana 71; d115 suburb min 65; d86 Nadia 100 / Yara 65).
The doorflee2 near-death formation issue (a third ally entering at 3 HP)
does NOT recur on this band. Entry HPs are parsed from each fight log's
first "(N left)" reading plus that hit's damage, both legs identical.

## 5. Sense test — transcripts read (control leg; armed identical)

**The held kill — 107314 d109, The Suburb, wave 4, entry HP 1452, 8
rounds, vKill.** The doorflee2 hold fires after R2 and the quad stays to
the kill. Quoted blow-by-blow from the corpus fight log:

> Diana walks straight into The Suburb. No avoiding it.
> Diana has Crude bow but no arrows — the string stays drawn, useless.
> Chantal is already at the door too — charges in with Diana!
> Wanjiru is already at the door too — charges in with Diana!
> Mara is already at the door — charges in with Diana!
> R1: Diana's eyes go red. Next 3 strikes hit twice as hard. (Rage)
> The pinned quad fights as one — every strike lands with the unit's weight behind it. (Coordinated strikes x2)
> R1: Mara strikes for 46 (pinned x2) (1406 left)
> R1: Chantal strikes for 52 (x1.3) (pinned x2) (1354 left)
> R1: Wanjiru strikes for 46 (x1.3) (pinned x2) (1308 left)
> Diana's gear absorbs 38.
> R1: Property Tax hits Diana for 13 (87 left)
> R2: Diana strikes for 80 (x2.5) (pinned quad x2) (1228 left)
> R2: Mara strikes for 50 (pinned x2) (1178 left)
> R2: Chantal strikes for 62 (x1.3) (pinned x2) (1116 left)
> R2: Wanjiru strikes for 40 (x1.3) (pinned x2) (1076 left)
> Diana's gear absorbs 30.
> R2: HOA Fine hits Diana for 11 (76 left)
> Diana holds the door — the fight is theirs on the numbers they can see, and the quad is not leaving it. (Door hold)
> R3: Diana strikes for 86 (x2.5) (pinned quad x2) (990 left)
> R3: Mara strikes for 48 (pinned x2) (942 left)
> R3: Chantal strikes for 60 (x1.3) (pinned x2) (882 left)
> R3: Wanjiru strikes for 36 (x1.3) (pinned x2) (846 left)
> R4: Diana strikes for 96 (x2.5) (pinned quad x2) (750 left)
> R4: Mara strikes for 44 (pinned x2) (706 left)
> R4: Chantal strikes for 60 (x1.3) (pinned x2) (646 left)
> R4: Wanjiru strikes for 46 (x1.3) (pinned x2) (600 left)
> R5: Diana strikes for 46 (x1.3) (pinned quad x2) (554 left)
> R5: Mara strikes for 48 (pinned x2) (508 left)
> R5: Chantal strikes for 52 (x1.3) (pinned x2) (456 left)
> R5: Wanjiru strikes for 40 (x1.3) (pinned x2) (416 left)
> R6: Diana strikes for 50 (x1.3) (pinned quad x2) (366 left)
> R6: Mara strikes for 48 (pinned x2) (318 left)
> R6: Chantal strikes for 58 (x1.3) (pinned x2) (260 left)
> R6: Wanjiru strikes for 38 (x1.3) (pinned x2) (222 left)
> The Suburb is wounded past its line — and holds its ground. It is not leaving. (Committed)
> R7: Diana stops mid-fight and binds the wound — field medicine, +20 HP.
> R7: Mara strikes for 48 (pinned x2) (174 left)
> R7: Chantal strikes for 62 (x1.3) (pinned x2) (112 left)
> R7: Wanjiru strikes for 36 (x1.3) (pinned x2) (76 left)
> R8: Diana strikes for 40 (x1.3) (pinned quad x2) (36 left)
> R8: Mara strikes for 44 (pinned x2) (0 left)
> The lead falls — the pack's coordination shatters. The rest scatter or die.

The hold (doorflee2's lever, not this arm's) is what keeps this quad in
the fight — everHopeless true, doorHold 1, won in 8 rounds. The floor
changed nothing here either: the armed leg's log is byte-identical.

**The flee — 107314 d110, The Ugly Bastard, wave 4, 3 rounds, vFlee.**
Quoted blow-by-blow:

> Diana walks straight into The Ugly Bastard. No avoiding it.
> Chantal is already at the door too — charges in with Diana!
> Wanjiru is already at the door too — charges in with Diana!
> Mara is already at the door — charges in with Diana!
> R1: Diana's eyes go red. Next 3 strikes hit twice as hard. (Rage)
> The pinned quad fights as one — every strike lands with the unit's weight behind it. (Coordinated strikes x2)
> R1: Mara strikes for 66 (x1.3) (pinned x2) (997 left)
> R1: Chantal strikes for 58 (x1.3) (pinned x2) (939 left)
> R1: Wanjiru strikes for 42 (x1.3) (pinned x2) (897 left)
> Diana's gear absorbs 53.
> R1: Walkout hits Diana for 23 (48 left)
> R2: Diana stops mid-fight and binds the wound — field medicine, +20 HP.
> R2: Mara strikes for 62 (x1.3) (pinned x2) (835 left)
> R2: Chantal strikes for 60 (x1.3) (pinned x2) (775 left)
> R2: Wanjiru strikes for 40 (x1.3) (pinned x2) (735 left)
> Diana's gear absorbs 50.
> R2: Walkout hits Diana for 22 (46 left)
> R3: Diana strikes for 96 (x2.5) (pinned quad x2) (639 left)
> R3: Mara strikes for 66 (x1.3) (pinned x2) (573 left)
> R3: Chantal strikes for 62 (x1.3) (pinned x2) (511 left)
> R3: Wanjiru strikes for 36 (x1.3) (pinned x2) (475 left)
> Diana's gear absorbs 56.
> R3: Walkout hits Diana for 25 (21 left)
> Diana sees how this ends — and runs while running still works.

The quad is dealing 196/round and the monster is at 45% — but Diana is
at 21 HP and the monster hits 22–25 a round. The three allies took no
hits at all (the monster focuses the leader). The flee reads as hopeless
because the leader is about to die, not because the pool is dragged
negative. That is the shape the floor cannot fix.

## 6. Wall numbers (both legs identical)

| Metric | Control | Armed |
| --- | --- | --- |
| Wins (full seat) | 0/8 | 0/8 |
| National scale | 0/8 | 0/8 |
| Table (seat taken) | 0/8 | 0/8 |
| Wave 4 unlocked | 8/8 | 8/8 |
| Wave 5 unlocked | 5/8 | 5/8 |
| Median survival | 149.5d | 149.5d |
| Villages lost | 4/8 | 4/8 |
| Village deaths (total) | 835 | 835 |
| Starvation / thirst deaths | 7 | 7 |
| Kill conversion (all fights) | 12/155 = 7.7% | 12/155 = 7.7% |
| Standing (max) | 630 | 630 |
| Scale rank (max) | regional | regional |

Per-seed survival (days): 107311: 112, 107312: 125, 107313: 150, 107314:
149, 107315: 150, 107316: 137, 107317: 150, 107318: 150. Deaths per seed:
125, 99, 74, 117, 105, 154, 74, 87. The armed leg is trajectory-identical
— no wall number moves at all.

## 7. Balanced panel compare (M5)

`node scripts/balance-panel.js compare` on the paired 8-seed panel:
decision **review_required**, exit 2 (review, not failure). Village deaths
per run 104.375 vs 104.375 (paired delta 0, 95% interval 0 to 0, 8/8
pairs, no_material_signal); village deaths per 100 calendar days 76.2522
vs 76.2522 (delta 0, no_material_signal). Every observed metric has
delta 0; no metric carries a `regression_signal`. **M5 PASSES** — the
panel compare returns `review_required` with NO regression signal on
village deaths or deaths-per-100d, exactly as the frozen bar requires.

## 8. Metric review

- **F1 is adjudicated on the frozen bar as written** (2/6 vs 2/6, 0.0pp
  vs −20pp). Not re-scored as SUPPLY-THIN: the panel is door-thin (6
  doors vs ~16 expected) but non-zero, and the two flees are both
  no-change conversions with a mechanism story — a thicker band would add
  more early leader-hurting flees, not more floor-convertible ones.
- **B3a kill conversion** (12/155 = 7.7% both legs) is byte-identical;
  the instrument is not the story here.
- **B1/B2** confirm the pin substrate is intact (ally3 visible 6/6,
  dealt 804 total, max 288) — the floor's no-op is not a substrate
  failure.
- **Door-thin caveat for the record:** pinFights 0 on 5/8 seeds. The
  door supply on this band is concentrated on one seed (107314 fought 5
  of 6 doors). Future door arms should check door supply per seed before
  freezing the band, or accept a 6-door panel as the instrument it is.

## 9. Proofs (all green, worktree base 68e0503c4)

| Proof | Result |
| --- | --- |
| M1 allyslot3 | 18/18 |
| M2 pinquaddoor | 35/35 |
| M2w pinquaddoor-wide | 16/16 |
| M3 dmgpin | 29/29 |
| M3d doorflee2 | 49/49 |
| M3e downedtwice | 25/25 |
| M3f hypofloor | 48/48 |
| Analyzer selftest | 18/18 |

**M3 flap artifact (recorded, not a real failure):** the first direct
dmgpin run scored 26/2 — the driver smoke exited 0 but the corpus-file
check failed because a write was refused mid-run during the 06:32Z flap
window. The doorflee2/hypofloor §6 sub-runs in the same session saw
dmgpin 29/29, and a direct re-run on clear writes gave 29/29. The
cancelled worker's smoke dir
`evidence/2026-11-21/perseed-dmgpin-b-smoke/` is gone (the driver cleans
OUTDIR first) — no evidence was lost from the judged legs.

## 10. Disposition

- **Lever stays env-gated OFF.** HYPOFLOOR default OFF; no default flip.
  The lever is mechanically live (staged proof §6: control flees at
  leader 9 HP vs monster 33/300 left; armed stays and kills next round)
  but unexercised by this band's flees.
- **No confirm runs.** A confirm would re-spend 8 seeds on a lever whose
  mechanism the pilot already shows cannot engage the band's flee shape.
- **Next arm input: HP-gating door parties.** Don't take near-dead leaders
  to doors — the d110 flee is a leader at 21 HP dying next round, and the
  d86 flee is the same shape at 25%. That is the follow-up, not a re-run
  of the floor.
- **Findings:** #2619 (kill conversion) updated — stays OPEN; hypofloor-b
  NO-GO on F1 recorded alongside doorflee-b and doorflee2-b.

## 11. Evidence files

- Prereg: `evidence/2026-11-22/sim-hypofloor-b-prereg.md`
- This file: `evidence/2026-11-22/sim-hypofloor-b.md`
- Analysis: `evidence/2026-11-22/hypofloor-b-analysis.json`,
  `hypofloor-b-analysis.txt`
- Legs log: `evidence/2026-11-22/hypofloor-b-legs.log`
- Per-seed corpora: `evidence/2026-11-22/perseed-hypofloor-b-control/`
  (8 files), `evidence/2026-11-22/perseed-hypofloor-b-armed/` (8 files)
- Balanced panel: `evidence/2026-11-22/hypofloor-b-panel-before.json.gz`,
  `hypofloor-b-panel-after.json.gz`, `hypofloor-b-panel.json`,
  `hypofloor-b-panel.md`
- Lever: `src/js/fieldFights.js` (+42/−3); driver adapted
  (`hypofloorFlag` stamp); analyzer `scripts/analyze-hypofloor-b.js`;
  proof `scripts/test-hypofloor-b.js`.
