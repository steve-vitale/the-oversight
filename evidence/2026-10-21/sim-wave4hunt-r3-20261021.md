# sim-wave4hunt-r3 — evidence (flesh-out loop, run fleshout-20261021T1515Z, axis scale-onramp)

Backlog #747 lineage. sim-wave4hunt-r2 (this run's 1215Z arm) went GO on the
PRIMARY (3/8 armed seeds with a villager wave-4 kill vs 1/8 control; 0
scholar wave-4 kills in 16 armed runs — the no-finish discipline holds) but
was KILLED-AFTER-CONFIRM on the scholar-deaths guardrail: +10 bearer deaths
(65 vs the 57 cap), ~3.3 deaths per manufactured kill, plus the
s64847-belongfeast village loss (d72; control won d92). Per r2's metric
review, this arm RE-PRICED the cost instead of re-scoring the lever: a
sortie budget (max 2/week; r2 ran 39 sorties/16 runs unbudgeted) plus
tightened survival gates (scholar hp>=75% was 60%, kcal>=60% of cap was
40%, 2 staged companions unchanged), and a cost-priced guardrail: armed
bearer deaths <= control + 1/16 per villager wave-4 kill armed (each
manufactured kill buys ONE bearer death of budget, not ten). The r2 layer
was deleted zero-trace per kill protocol; the r3 layer was re-derived from
the evidence's design section (not resurrected byte-identical).

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the sweep, in the arm brief)

**PRIMARY:** number of runs (of 16) with >=1 villager wave-4 kill
(kill-time attributed: waveKillLog w=4, by != scholar-vid-at-that-day, by !=
'player'; killdisc-instrument-20261021.js v2 + daily vid sampling).
**PILOT GO (4 seeds x {leadfeast,belongfeast} x {control,armed} = 16
configs):** >= 2/8 armed configs with a villager wave-4 kill AND armed >=
control + 1. On pilot GO run the confirm (remaining 4 seeds); on pilot
NO-GO execute the kill protocol.
**FULL GO (8 seeds, 32 configs):** >= 3/16 armed runs AND armed >= control +
2. Miss = NO-GO, never re-scored (§14).
**RE-PRICED GUARDRAILS:** bearer deaths <= control+1/16 per villager wave-4
kill armed (cost-priced, not flat); villager combat deaths <= control x
1.25; wins >= control-4/16; starvation deaths <= control; no new death mode
(>=2-event rule); NO village loss on a seed the control wins (the s64847
tail-risk rule — one recurrence = NO-GO). Median-survival guardrail:
N/A-pass declared when all runs win (per r2's metric review); otherwise >=
control-10d.
**Seeds:** same 8 as r2 {64406, 64703, 64858, 64843, 64847, 64841, 64842,
64844}; pilot = {64406, 64703, 64858, 64843}, confirm = {64847, 64841,
64842, 64844}. Inline banned-list assertion. **Policies:** control =
VCE.armedFor; armed = W4H3.armedFor (WAVE4HUNT_R3=1 OUTSIDE the same VGEAR=1
stack). **Env:** FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
SEATDRIVE=1 VGEAR=1 KILLDISC=1 (asserted up front). **Horizon:** 180d
death-aware (+10d tail max).
**SECONDARY (report):** wall numbers both arms; wave-4 fights by channel
(herald vs monster, #749 split); bearer deaths per sortie; engagements per
run.
**§15:** before/after through scripts/balance-panel.js; the compare .md is
attached (evidence/2026-10-21/wave4hunt-r3-panel-primary.md).
**KILL PROTOCOL:** on NO-GO (primary miss OR any hard guardrail miss)
delete scripts/policies/wave4hunt-r3.js zero-trace; instruments + evidence
+ proof land with the KILLED-VERDICT.
**SENSE-TESTING:** re-run the armed run with the most villager wave-4 kills
with narration live; read the hunt-to-wave-4 sequence; judge whether staged
villagers behave like people. Quote lines.

## The design (scripts/policies/wave4hunt-r3.js, default-OFF, WAVE4HUNT_R3=1, zero src/js)

Wraps the VGEAR=1 stack: `w4h3.armedFor(base)` where base = VCE.armedFor.
The layer engages only when WAVE4HUNT_R3=1 AND VGEAR=1; otherwise pure
delegation (E1/E1c det-gates).

**Leg 1 — ENGAGEMENT TARGETING, BUDGETED** (upkeep, after the base upkeep):
once wave-4 is unlocked or wave-4 omens are active, and the w5 veterans bar
is unmet, the scholar deliberately walks toward the nearest live non-titan
wave-4 world monster (within 4 tiles) and starts the fight honestly
(walk closer + the phone's Fight flow via Game.startCombat). Gates:
not exiled, wave-4 open, veterans bar unmet; **sortie budget max 2/week**
(new — the re-priced cost control); scholar hp>=75% (was 60%);
kcal>=60% of cap (was 40%); 2 staged companions in party (unchanged —
fewer than 2 and the scholar can't finish what they start under the
no-finish discipline). Titans EXCLUDED by design (backlog #749 canon).

**Leg 2 — NO-FINISH DISCIPLINE** (fight hook, scholar turns in wave-4
fights; re-derived twovets T3/T4 shape): the scholar softens (strikes the
weakest live wave-4 only above 50% maxHp, directly via Game.tbPlayerStrike
+ the r2 strikeAndEndTurn turn-hygiene fix — never delegates the strike)
but NEVER lands the killing blow. Yield at/below 30% (bounded: scholar
hp>=50%, round>=2, <=8 yield turns/fight, 2-turn stall guard -> breakoff,
never finish); chaff/hold in the (30%,50%] band (never strikes a wave-4
at/below half); breakoff on stall or hurt companion (<40%, unless the beast
is near death — then keep yielding for the companions to close);
KILL-LEAK FIX — breakoff-failure delegations to the inner fight happen ONLY
when every live wave-4 monster is above 50% maxHp. Non-wave-4 fights
delegate untouched.

## Proof (scripts/test-wave4hunt-r3-20261021.js)

**Result: 21/21 PASS, 0 fail** (log: /tmp/w4h3-proof.log — scratch, not the
repo; the gates are re-runnable via the script).
- E0 (8/8): exports, id tags, normBase, w4h3On/vgearOn/layerLive/noFinishOff
  gates, and E0h — the sortie-budget unit gate (2/week cap + week-rollover
  reset, proven on a fake Game/ctx without a sim).
- E1a/E1b: WAVE4HUNT_R3-off armed == VCE.armedFor byte-identical (s64701/s64702, 60d).
- E1c: WAVE4HUNT_R3=1 + VGEAR-unset == seat stack byte-identical (s64701, 60d).
- E2: substrate env gate asserted up front.
- E3a/E3c: WAVE4HUNT_R3=1 fires w4h3 counters (sorties + fights) on
  wave-4-reaching s64703-leadfeast / s64704-belongfeast (150d).
- E3b/E3d: scholar wave-4 kills = 0 on both (the discipline holds).
- E3f RED: WAVE4HUNT_R3-off fires zero w4h3 counters.
- R1-RED: W4H3_TEST_NOFINISH_OFF=1 -> scholar lands wave-4 kills
  (s64703-leadfeast, 150d) — the kill-leak regression re-proven on THIS
  file (the R1 kill-leak RED regression from r2). R1-GREEN: fix on ->
  scholar wave-4 kills = 0, same seed/config.
- E4: armed+KILLDISC deterministic across runs.
- D2a/D2b: 180d armed runs complete per policy + deterministic re-run.

## Pilot sweep (scripts/sweep-wave4hunt-r3-20261021.js)

16 configs (4 seeds x {leadfeast,belongfeast} x {control,wave4hunt}), 180d
death-aware, paired identical seeds. Per-seed JSONs:
evidence/2026-10-21/perseed-wave4hunt-r3/. Analyzer:
scripts/analyze-wave4hunt-r3-20261021.js.

**PILOT VERDICT: GO** — armed 2/8 configs (s64858-belongfeast,
s64843-belongfeast — the same two as r2's pilot) vs control 0/8. Bar (>=
2/8 AND >= control+1) met. Bearer deaths at pilot: armed 25 vs control 20
(+5 for 2 kills = 2.5/kill — already above the 1/kill budget; flagged as a
warning, not judged at pilot).

## Confirm sweep (remaining 4 seeds x 2 feats x 2 policies = 16 configs, total 32)

**FULL VERDICT: GO on the primary** — armed 3/8 seeds (s64858, s64843,
s64847) vs control 1/8 seeds (s64847). Bar (>= 3/16 AND >= control+2): 3 >=
3 and 3 >= 1+2. Met exactly — the same bar as r2, met exactly again.

Seed table (v=villager wave-4 kills, s=scholar wave-4 kills; * = seed counts):

| seed | control lead | control belong | armed lead | armed belong |
|------|--------------|----------------|------------|--------------|
| 64406 | v=0,s=0 | v=0,s=0 | v=0,s=0 | v=0,s=0 |
| 64703 | v=0,s=1 | v=0,s=0 | v=0,s=0 | v=0,s=0 |
| 64858 | v=0,s=0 | v=0,s=0 | v=0,s=0 | v=1,s=0* |
| 64843 | v=0,s=0 | v=0,s=2 | v=0,s=0 | v=1,s=0* |
| 64847 | v=1,s=3* | v=0,s=0 | v=1,s=0* | v=0,s=0 |
| 64841 | v=0,s=0 | v=0,s=1 | v=0,s=0 | v=0,s=0 |
| 64842 | v=0,s=0 | v=0,s=0 | v=0,s=0 | v=0,s=0 |
| 64844 | v=0,s=0 | v=0,s=0 | v=0,s=0 | v=0,s=0 |

The discipline holds: **0 scholar wave-4 kills across all 16 armed runs**
(R1-GREEN in proof; the sweep confirms). The three armed villager wave-4
kills: Chloe vs THE INFLUENCER d92 (s64858-b), Phimpa vs THE CONGREGATION
d87 (s64843-b), Xavier vs THE STRIKE d73 (s64847-l).

## Mechanism (w4h3 counters, armed arm — the lever fires, budgeted)

Sorties (deliberate wave-4 hunts): 21 total across 16 configs (s64406-b:2,
s64703-l:1, s64703-b:2, s64858-b:1, s64843-l:2, s64843-b:3, s64847-l:6,
s64847-b:2, s64841-b:2) — vs r2's 39. The budget bites where it should:
s64406-b skipped 16 sorties on budget, s64847-l skipped 34. But note
s64847-l still ran 6 sorties — the 2/week budget allows ~6 over a ~13-week
wave-4 window; it does not bind on long runs. The tighter survival gates
bite too: SkippedHurt 8-27 on the hunting configs (hp<75%), SkippedHungry
up to 8, SkippedParty scattered. Fights entered: 3 (approachAndFight
startCombat) + the hook saw 27 wave-4 fights. Soft strikes 119, yields 25,
holds 79, breakoffs 20, chaff 2, delegates 15. The no-finish discipline is
active in every wave-4 fight; the turn-hygiene fix holds (no 98k spins).

**Wave-4 fight channels (#749):** control 17 monster / 0 herald / 1
herald-refused; armed 21 monster / 0 herald / 0 herald-refused. The lever
targets the monster channel (titans excluded by design); herald fights
remain muster-only canon.

**Bearer deaths per sortie (secondary):** the price tracks the hunts.
Configs that hunted paid: s64406-b +3 (2 sorties), s64843-b +4 (3
sorties), s64847-l +2 (6 sorties), s64847-b +2 (2 sorties), s64841-b +2 (2
sorties). Configs with 0 sorties are byte-identical to control on deaths
(6/6, 4/4, 5/5, 3/3, 5/5) — composition honesty confirmed in the wild.

## §15 panel compare

`evidence/2026-10-21/wave4hunt-r3-panel-primary.md` — **decision:
review_required**.
- leadfeast: no material signal on any metric (8/8 pairs).
- belongfeast: won -0.125 (change_watch); communityLost +0.125
  (regression_watch). Both from the single s64847-belongfeast armed loss
  (village-lost d72) — the same shape as r2's panel.

## Village assessment

The re-pricing did not fix the cost. The lever manufactures kills (3/8 vs
1/8, discipline holds, 0 scholar kills) but the village pays MORE per kill
than r2: +11 bearer deaths (66 vs 55) for 3 kills = ~3.7/kill against the
re-priced budget of 1/kill. The budget (2/week) and tighter gates cut
sorties 39->21 but did not cut bearer mortality: every config that hunted
paid +2 to +4 bearer deaths, exactly as in r2. The cost is intrinsic to
sending the bearer into wave-4 fights, not to the sortie count — a budget
can't price what the mechanism guarantees.

The tail risk recurred EXACTLY: s64847-belongfeast armed lost the village
at d72 (endReason village-lost), the same seed, same feat, same day as
r2's loss, while the same-seed control won at d92 (both feats won). One
recurrence = NO-GO per the pre-registered tail-risk rule.

## Sense-testing

Re-ran s64843-belongfeast armed (Phimpa's Congregation kill, d87 — the same
seed r2 sense-tested) with narration live
(scripts/sense-wave4hunt-r3-20261021.js, log /tmp/w4h3-sense-full.log).

The hunt-to-wave-4 sequence (D87, The Congregation):

> D87 SAY: 🌙 The cookfire's smell carried further than the laughter did — smoke and grease on the night wind. The Congregation is circling the edge of the light.
> D87 SAY: The village is rattled. Everyone's jumpy — eyes on the treeline.
> D87 SYS: COMBAT! THE CONGREGATION! The gamblers lean in. ROUND 1 — FIGHT!
> D87 SAY: You STRIKE the congregation for 400 (Machete).
> D87 SAY: Phimpa strikes the Congregation.
> D87 SAY: 🔔 The steeple RINGS — the bell is the telegraph. ABSOLUTION falls like a beam.
> D87 SAY: Phimpa strikes the Congregation. ... (the grind — ~20 rounds, the scholar never strikes again)
> D87 SAY: The Congregation falls.
> D87 SAY: 📺 SYSTEM: "Oh — OH. Everybody saw that, right? Phimpa just put down The Congregation... on CAMERA. That's a veteran kill, folks. REMEMBER the name."
> D87 SYS: ◈ The Records: An apex thing died by village hands: The Congregation. The Records hold it up to the light.
> D87 SAY: Phimpa stares at the body, then at you.
> D87 SAY: It is a church. Do not eat the church.
> D87 SAY: You came back bloody. Nobody asks. Someone saves you the good seat by the fire.

The staged villagers behave like people: Phimpa grinds the Congregation
down round after round while its attention snaps between them; the
scholar's restraint is invisible in the narration (correct — discipline,
not theater); after the kill the System names it a veteran kill ON CAMERA
and Phimpa processes it socially ("stares at the body, then at you" — the
same beat as r2's Elder Buffering kill, not a loot prompt, a moment). The
village reacts to death with weight earlier the same day: "🕯️ Farid Ahmed
is dead — combat. The village stops. Somebody screams. Somebody else starts
digging." and "At the grave, Lamar, Phimpa, Mina speak for the dead."

One robotic note (engine, not the policy): "The congregation's attention
SNAPS to you — proximity overrules patience" repeats ~20 times through the
fight — the attention narration has no variety budget.

**Verdict:** the hunt reads as people hunting together, not as a policy
moving pieces. The sense verdict is unchanged from r2: the mechanism is
sensical; the cost is the problem.

## Metric review

Per §14, pre-registered metrics BIND the run. The primary (villager wave-4
kills >=1, kill-time attributed) was met exactly (3/8 vs 1/8; bar 3/16 and
+2). No metric was re-scored mid-run. The pilot bar (>= 2/8 and +1) was
also met exactly (2/8 vs 0/8).

**Metric doubts for the NEXT run (not this one):**
1. The cost-priced bearer-death guardrail (1 death per kill) may be
   unmeetable by ANY deliberate-engagement lever: the price tracked the
   hunts, not the sortie count (configs that hunted paid +2 to +4 bearer
   deaths each; the budget cut sorties 39->21 without cutting deaths).
   The honest reading is r2's finding #2 restated harder: engagement
   without survival economics — the mechanism guarantees the bearer walks
   into wave-4 damage bands (35–95), and no budget changes the band.
2. The median-survival guardrail could not be computed (n=0 per-seed
   matched non-winning pairs — control won all 16, armed won 15/16). The
   brief's literal phrasing ("N/A-pass when all runs win; otherwise >=
   control-10d") leaves this case unresolved; r2's precedent declared the
   identical case N/A-not-a-miss (the single loss is already judged by the
   tail-risk rule). This does not change the verdict (two hard misses
   stand), but a future pre-registration should name the n=0 case.
3. The s64847 recurrence deserves the autopsy r2's metric review called
   for: same seed, same feat, same day (d72) — two different tunings of the
   same mechanism lost the same village on the same day. The mechanism's
   failure mode is seed-deterministic, not noise.

## Guardrails detail

- **MISS — bearer deaths 66 vs cap 58** (control 55 + 3 armed villager
  wave-4 kill events). +11 over control = ~3.7 deaths per manufactured
  kill, against the re-priced budget of 1/kill. WORSE than r2's 3.3/kill.
  The price is hunt-caused (0-sortie configs match control exactly on
  deaths) and intrinsic to the mechanism (the bearer walks into wave-4
  damage bands; a sortie budget can't price that away).
- **PASS — villager combat deaths 335 <= 440** (control x 1.25).
- **PASS — wins 15 >= 12** (control-4/16). The single loss is
  s64847-belongfeast armed (village-lost d72; control won d92).
- **N/A — median survival.** Control won 16/16, armed 15/16; n=0 per-seed
  matched non-winning pairs, uncomputable. Per the r2 precedent this is
  recorded N/A-not-a-miss (the loss is judged by the tail-risk rule). The
  brief's literal phrasing is noted in the metric review; it does not
  change the verdict.
- **PASS — starvation deaths 3 <= 4.**
- **PASS — no new death mode** (>=2-event rule).
- **MISS — tail-risk rule.** s64847-belongfeast armed lost the village at
  d72; the same-seed control won at d92 (both feats won). Exact recurrence
  of r2's loss (same seed, same feat, same day). One recurrence = NO-GO.

## Wall numbers (secondary)

| arm | national | table | wins | wave4 | wave5 | exiled | medSurv | maxSurv |
|-----|----------|-------|------|-------|-------|--------|---------|---------|
| control | 14 | 16 | 16 | 13 | 0 | 0 | 94.5 | 175 |
| armed | 14 | 16 | 15 | 13 | 0 | 0 | 92.5 | 175 |

(wave4=13 both arms, wave5=0 both. The scale wall is unchanged
by the lever: national and table reach identically on both arms; the armed
arm's single loss is the s64847 tail-risk event.)

## Convergence

The arm is **KILLED-AFTER-CONFIRM**: primary GO (3/8 vs 1/8, bar met
exactly per §14) but the re-priced guardrails MISS — bearer deaths 66 vs
the 58 cap (~3.7/kill vs the 1/kill budget; worse than r2's 3.3/kill) and
the s64847 village-loss tail risk recurred exactly (same seed, same feat,
same day). Per the kill protocol the policy layer
(`scripts/policies/wave4hunt-r3.js`) is deleted zero-trace; instruments,
evidence, corpus, and panel compare land with this KILLED-VERDICT.

**The mechanism is closed:** two tunings of the deliberate wave-4
engagement lever (r2 unbudgeted, r3 budgeted+repriced) both manufacture
villager wave-4 kills (3/8 both), both hold the no-finish discipline (0
scholar kills in 32 armed runs combined), and both kill bearers at
~3.3–3.7 per kill and lose s64847-belongfeast at d72. The cost is not a
tuning problem — it is the mechanism. Backlog #747's hunt-side answer is:
deliberate wave-4 engagement manufactures veterans, and the village can't
afford the price. The next step is not another re-pricing; it is a
different mechanism (or Steve's call that the price is worth paying).
