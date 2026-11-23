# sim-doorstage-b — staged pool doors for the leader-projection gate's D1

- Run: `fleshout-loop-b-20261123T1230Z`, Loop B arm 1 of 2 (sim-doorstage-b)
- Date: 2026-11-23. Base: master `7ade8d3bf4a53f251845af1d5e0d079fd7f3fd0a`
  (0230Z adoption closeout). Anchor (prereg commit):
  `97e00d5ba443b56f88b1afaaf4334fa132c6f5c9`
- Gate: LEADERPROJ (env-gated, `src/js/villager-agency.js`) — refuses a
  wave-4+ door when the leader enters at ≤75 HP and is projected ≤25 HP
  after two focused rounds. Zero `src/js` changes in this arm.
- Instrument: `scripts/doorstage-driver-b.js` (new) + the gateavoid
  analyzer `scripts/analyze-gateavoid-b.js` (reused verbatim) +
  `scripts/test-doorstage-b.js` (M3l, new). No seed band consumed —
  door seeds 424200–424215 are fixture seeds for staged single-door
  loads, not 150d sims.

## Verdict: GO

D1 is **JUDGED for the first time** after three consecutive supply
failures (leaderproj-b: 2-door pool, attribution blind; gateavoid-b:
pool collapsed to 1 door 0%-bad; gateavoid-doorrich-b: exactly 1 pool
door per 8-seed band). The staged-door supply strategy works: 11
scored pool doors, every one of them bad on the control leg (6 flees,
5 deaths, 0 kills) and every one refused by the gate on the armed
leg (11 `proj` fires, 0 bad). **Control bad 100% → armed bad 0%: a
100-point drop against a 20-point bar.** All frozen bars pass; M5 is
`review_required` with no regression signal.

In plain words: when a hurt leader walks up to a wave-4 (or wave-5)
door, the gate says no — and without the gate, that walk ends in
flight or death every single time in this staging. The gate's forecast
is not pessimistic here; it is accurate across the whole band,
including the boundary door (leader 75 HP, projected exactly 25 —
fled in 2 rounds when fought).

Two deviations from the frozen expectation, reported plainly and NOT
re-scored (see §8):

1. The scored pool is **11 doors, not 12**. Door 10 (audit, leader
   55 HP) never reached the projection gate on either leg: the
   earlier win-plan gate turned its party back ("going back for
   help") on all 30 calls, because one member wore no armor at all.
   It is unscored on both legs — it neither helps nor hurts D1.
2. Both legs exited **1**, not 0 — solely because of door 10's
   instrument error. The corpus is complete (32/32 files, D5-verified
   on every file); the exit code records the unscored door, it does
   not void the legs.

## §1 Frozen-bar table (judged as frozen in the prereg)

| Bar | Frozen bar | Measured | Verdict |
|---|---|---|---|
| D1 (PRIMARY) matched-pool bad rate | armed ≤ control − 20pp | pool 11; control bad 11/11 (100%); armed bad 0/11 (0%); drop **100pp** (11 projAvoids, 0 divergence) | **PASS** |
| D1fought (secondary) | flee rate on fought pool doors | control 6/11 (0.545); armed **unmeasurable** — 0 fought pool doors (a working gate leaves none; expected, not a failure) | unmeasurable |
| D2 kill rate per fought door | armed ≥ control − 2pp | armed 0.25 (1/4) vs control 0.0667 (1/15) | **PASS** |
| D3 total damage per door | armed ≥ 0.9× control | armed 743 vs control 351.7 (2.11×) | **PASS** |
| D4 gate fires | armed `leaderprojFires` ≥ 1 (expectation 12) | **11** (door 10 never reached the gate) | **PASS** |
| D5 substrate sanity | anchor + policy + flags + counters + notes/log arrays + slot/pin | 32/32 files clean, anchor `97e00d5b…` on every file | **PASS** |
| D6 durability | log length = total gate fires, per-kind counts = per-kind counters, both legs | armed log 11 entries == 11 fires (all `proj`); control 0 == 0 | **PASS** |
| M5 guardrail (balanced panel) | `review_required` with NO `regression_signal` on village deaths | `review_required`; village deaths/run 0.4375 → 0.125 (Δ −0.3125, `no_material_signal`); no `regression_signal` anywhere | **PASS** |

D1 arithmetic on the scored pool: the frozen bar needs a drop of
20pp; on 11 doors that is ≥3 doors' difference (20% of 11 = 2.2 → 3).
The measured difference is 11 doors. D2/D3 compare different door
mixes (the armed leg fights only the 4 safe doors, which include the
single kill and the longest fights) — the composition effect inflates
both; do not over-read D2/D3 (see §10).

Overall analyzer result: `pass: true`, exit 0
(`evidence/2026-11-23/doorstage-b-analysis.json`).

## §2 Staged-door table (frozen spec — 16 doors, 12 pool + 4 safe)

Party (every door, both legs): geared villager quad (holder + 3 pinned
companions), each issued `hide_armor` + `hunting_spear`; issued armor P
measured 30/30/30/30 on every door (read right after gear-up, the
same point the pinquaddoor proof measures at). Allies at 100 HP;
leader at the staged HP. "At-door P" is what the fight actually wore:
the expedition start re-equips each villager from their own pack (the
game's own autoEquip — the issued hide_armor is not in their packs, so
it cannot be re-selected). See §10 for what this means for the
encounter-gear rule.

| Door | Seed | Monster | Wave | Leader HP | projHp2 | Band | At-door P (control) | Pool? |
|---|---|---|---|---|---|---|---|---|
| 1 | 424200 | audit | 4 | 30 | −20 | dead2 | 17, 55, 4, 5 | pool |
| 2 | 424201 | reunion | 4 | 40 | −10 | dead2 | 5, 5, 22, 17 | pool |
| 3 | 424202 | eater | 4 | 50 | 0 | dead2 | 27, 17, 17, 8 | pool |
| 4 | 424203 | strike | 4 | 35 | −15 | dead2 | 8, 17, 5, 12 | pool |
| 5 | 424204 | suburb | 4 | 55 | 5 | collapse2 | 5, 4, 5, 5 | pool |
| 6 | 424205 | eulogy | 4 | 65 | 15 | collapse2 | 17, 5, 7, 14 | pool |
| 7 | 424206 | algorithm | 4 | 75 | 25 | collapse2 (boundary) | 5, 17, 3, 5 | pool |
| 8 | 424207 | congregation | 4 | 60 | 10 | collapse2 | 17, 17, 13, 11 | pool |
| 9 | 424208 | influencer | 4 | 70 | 20 | collapse2 | 2, 5, 15, 7 | pool |
| 10 | 424209 | audit | 4 | 55 | 5 | collapse2 | 5, 5, 5, 0 | pool — UNSCORED (win-plan avoid, both legs) |
| 11 | 424210 | rerun | 5 | 45 | −5 | dead2 | 5, 5, 5, 5 | pool |
| 12 | 424211 | spoiler | 5 | 65 | 15 | collapse2 | 5, 17, 5, 44 | pool |
| 13 | 424212 | reunion | 4 | 85 | 35 | safe | 17, 17, 17, 5 | control (negative) |
| 14 | 424213 | eater | 4 | 95 | 45 | safe | 4, 17, 8, 7 | control (negative) |
| 15 | 424214 | audit | 4 | 80 | 30 | safe | 17, 17, 5, 5 | control (negative) |
| 16 | 424215 | cancellation | 5 | 90 | 40 | safe | 17, 17, 4, 7 | control (negative) |

No dead1 doors were staged (a leader below 25 HP is refused by
HPGATE before LEADERPROJ is reached, so dead1 is outside the
projection gate's marginal pool by construction). The
"safe-but-≤75HP" class (pool doors the quad wins despite the
projection) came out **empty: 0 of 11 pool doors won on control**.
The forecast was not pessimistic — it was right.

## §3 Door-fight table (S5 — every fought door, both legs)

Control leg: 15 fought (11 pool + 4 safe), 7 vFlee, 1 vKill, 7 vDie,
5,276 dealt over 41 rounds, 7 party deaths. Armed leg: 4 fought (all
4 safe doors — the 11 pool doors were all refused), 1 vFlee, 1 vKill,
2 vDie, 2,972 dealt over 21 rounds, 2 party deaths. The 4 armed safe
rows are byte-identical to the control safe rows (the determinism
tripwire — §4).

| Seed | Monster | W | Leg | Rounds | Outcome | Dealt | D/round | Entry HP | Band | projHp1 | projHp2 | fleeHpFrac | Hold | Hopeless |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 424200 | audit | 4 | control | 1 | vFlee | 154 | 154 | 30 | dead2 | 5 | −20 | 0.06 | 0 | no |
| 424201 | reunion | 4 | control | 1 | vDie | 0 | 0 | 40 | dead2 | 15 | −10 | — | 0 | no |
| 424202 | eater | 4 | control | 2 | vFlee | 220 | 110 | 50 | dead2 | 25 | 0 | 0.33 | 0 | yes |
| 424203 | strike | 4 | control | 1 | vDie | 136 | 136 | 35 | dead2 | 10 | −15 | — | 0 | no |
| 424204 | suburb | 4 | control | 4 | vDie | 490 | 122.5 | 55 | collapse2 | 30 | 5 | — | 0 | no |
| 424205 | eulogy | 4 | control | 2 | vFlee | 270 | 135 | 65 | collapse2 | 40 | 15 | 0.27 | 0 | yes |
| 424206 | algorithm | 4 | control | 2 | vFlee | 256 | 128 | 75 | collapse2 | 50 | 25 | 0.20 | 0 | yes |
| 424207 | congregation | 4 | control | 2 | vFlee | 254 | 127 | 60 | collapse2 | 35 | 10 | 0.24 | 0 | yes |
| 424208 | influencer | 4 | control | 2 | vDie | 208 | 104 | 70 | collapse2 | 45 | 20 | — | 0 | no |
| 424209 | audit | 4 | both | — | NO FIGHT, NO FIRE (win-plan avoid ×30 calls) | — | — | 55 | collapse2 | 30 | 5 | — | 0 | — |
| 424210 | rerun | 5 | control | 2 | vFlee | 214 | 107 | 45 | dead2 | 20 | −5 | 0.45 | 0 | yes |
| 424211 | spoiler | 5 | control | 1 | vDie | 102 | 102 | 65 | collapse2 | 40 | 15 | — | 0 | no |
| 424212 | reunion | 4 | both | 7 | vDie | 1026 | 146.6 | 85 | safe | 60 | 35 | — | 0 | no |
| 424213 | eater | 4 | both | 4 | vDie | 534 | 133.5 | 95 | safe | 70 | 45 | — | 0 | no |
| 424214 | audit | 4 | both | 8 | vKill | 1154 | 144.3 | 80 | safe | 55 | 30 | — | 0 | no |
| 424215 | cancellation | 5 | both | 2 | vFlee | 258 | 129 | 90 | safe | 65 | 40 | 0.45 | 0 | yes |

Pool fights are short and bad: 1–4 rounds, 0–490 dealt, and not one
kill. The safe doors last longer (2–8 rounds) and hold the only kill
in either leg — door 15, audit at 80 HP, 8 rounds, 1,154 dealt.
Two pool fights dealt 0 and 102 damage before the leader died in
round 1 (doors 2 and 12); the projection's "two focused rounds"
arithmetic is, if anything, generous to the leader.

## §4 Matched-pool table (D1 — 11 doors)

| Seed | Day | Monster | Control outcome | Leader entry HP | Armed |
|---|---|---|---|---|---|
| 424200 | 1 | audit | vFlee (1 round) | 30 | projAvoid |
| 424201 | 1 | reunion | vDie (1 round) | 40 | projAvoid |
| 424202 | 1 | eater | vFlee (2 rounds) | 50 | projAvoid |
| 424203 | 1 | strike | vDie (1 round) | 35 | projAvoid |
| 424204 | 1 | suburb | vDie (4 rounds) | 55 | projAvoid |
| 424205 | 1 | eulogy | vFlee (2 rounds) | 65 | projAvoid |
| 424206 | 1 | algorithm | vFlee (2 rounds) | 75 | projAvoid |
| 424207 | 1 | congregation | vFlee (2 rounds) | 60 | projAvoid |
| 424208 | 1 | influencer | vDie (2 rounds) | 70 | projAvoid |
| 424210 | 1 | rerun | vFlee (2 rounds) | 45 | projAvoid |
| 424211 | 1 | spoiler | vDie (1 round) | 65 | projAvoid |

Pool 11, controlBad 11, armedBad 0, good 11, bad 0, projAvoids 11,
kills 0, mFlees 0, flees 0, dies 0, divergence 0, otherGate 0, other 0.
Every refused door is attributed from the armed leg's durable log
(seed + day + mid), one `proj` entry per door:

| Door | Monster | Log HP | projHp2 |
|---|---|---|---|
| 1 | audit | 30 | −20 |
| 2 | reunion | 40 | −10 |
| 3 | eater | 50 | 0 |
| 4 | strike | 35 | −15 |
| 5 | suburb | 55 | 5 |
| 6 | eulogy | 65 | 15 |
| 7 | algorithm | 75 | 25 |
| 8 | congregation | 60 | 10 |
| 9 | influencer | 70 | 20 |
| 11 | rerun | 45 | −5 |
| 12 | spoiler | 65 | 15 |

## §5 Wall numbers (S6 — as measurable on staged corpora)

A staged door never plays to a win: there is no day loop, no
standing, no table, no pantry. Each of these is **not measurable** on
this instrument, stated plainly rather than faked:

- **Wins:** not measurable — no day loop, no table; a staged door
  never plays to a win.
- **National scale access:** not measurable — no standing
  progression on a single-door load.
- **Table (entry / sitting):** not measurable — no table on a
  single-door load.
- **Wave-4–5 unlocks:** not measurable — unlocks are standing-gated
  over days; the doors are staged, not unlocked.
- **Median survival:** not measurable — `gameDays` is ~1 per door;
  there is no 150-day horizon.
- **Starvation:** not measurable — no pantry, no day loop.

The per-door wall analogue is the pool table itself (§4): 11 staged
pool doors, 11 bad on control (6 flees, 5 deaths), 0 bad on armed.
Party deaths avoided by the gate: **5** (the 5 pool deaths on
control; armed pool deaths 0). The 2 armed deaths are both safe
doors (13, 14) — healthy-HP doors the gate is not asked to judge.

## §6 Sense-test transcript read (do the doors read as sensible?)

**A refused door (door 1, audit, leader 30 HP, armed leg)** — quoted
verbatim from its durable log entry:

> "gave audit room — A person, maybe 40s is too hurt to lead a door
> (projected 30 HP, -20 HP in two rounds)"

The refusal reads as a sensible call by a leader who knows they would
die at the door — and the control leg proves the knowledge: the same
door, fought, fled in 1 round after dealing 154. The note names the
monster, the leader, the entry HP, and the projection; nothing about
it reads as a bug or a cop-out.

**A fought door (door 15, audit, leader 80 HP, control leg — the one
kill)** — from its 52-line fight log:

> "the person in their 30s, with a farmer's tan, the doctor walks
> straight into the grey man with your paperwork. No avoiding it."
> "the person in their 40s, with a burn-scarred forearm is already at
> the door too — charges in …"
> "The pinned quad fights as one — every strike lands with the unit's
> weight behind it. (Coordinated strikes x2)"
> "R1: … strikes for 32 (pinned quad x2) (1091 left)" …
> "R8: … strikes for 66 (x1.3) (pinned x2) (0 left)"
> "The lead falls — the pack's coordination shatters. The rest scatter
> or die."

It reads as a real, hard-won kill: four people charging in together,
eight rounds, the audit ground down from 1,091 to 0. It took a leader
at 80 HP to get the only kill in either leg — which is the point the
gate makes: below that, the same monster ends the party.

**The pattern across the pool** reads as protective, not cowardly:
every refused door ended in flight or death when fought, including
the boundary door 7 (leader 75, projected exactly 25 — fled in 2
rounds). The gate refuses the doors that would have hurt, and lets
through the healthy ones — even though two of those healthy doors
still killed their leaders (doors 13, 14), which is the gate's honest
limit: it reads the leader's HP, not the fight.

**Door 10** reads as a different, earlier caution: a party with one
member wearing no armor at all is turned back by the win-plan gate
before any door is even picked ("going back for help"). Sensible —
and it is the reason that door is unscored, not a hole in the
instrument.

## §7 Secondaries (S1–S11 — reported, not binding)

- **S1 Hold census:** `doorHold` 0 rounds on both legs; `holdFights`
  0/0. `everHopeless` fights: control 6 (doors 3, 6, 7, 8, 11, 16),
  armed 1 (door 16 — the only armed fight that ever went hopeless).
- **S2 Conversion census:** matched-seed pairs 1 (door 16,
  no-change: vFlee in 2 rounds on both legs); conversions 0;
  later-flees 0; avoided 11, all proj-attributed (S9).
- **S3 Leader-death census:** vDie doors — control 7 (leader HPs 40,
  35, 55, 70, 65 pool + 85, 95 safe); armed 2 (85, 95 safe). The
  gate removed all 5 pool deaths.
- **S4 Pin-subset B1 rate (rate only):** armed 1.0 (4/4 pinned rows),
  control 1.0 (15/15).
- **S5 Door-fight table:** §3 above.
- **S6 Wall numbers:** §5 above — all not measurable on staged
  corpora; per-door analogue is the pool table.
- **S7 Sub-floor census:** fought doors with the LEADER below 25 HP:
  0 on both legs (expected — no dead1 doors staged). Fought doors
  with ANY member below 25 HP as read from the gate-avoid log: 0
  (HPGATE never fired on either leg).
- **S8 Gate-fire census:** control `hpgateFires` 0,
  `leaderhpgateFires` 0, `leaderprojFires` 0; armed 0, 0, **11**.
  Notes: control 0, armed 11 (all `proj`). Durable log: control 0,
  armed 11 (all `proj`). Log-vs-notes gap: **0** — the old blind
  channel is closed on this instrument (the driver reads the notes
  before any expedition return could delete them).
- **S9 Avoided-doors census:** 11 control doors with no armed
  counterpart row, all 11 attributed `proj` from the durable log
  (seed + day + mid); divergence 0.
- **S10 Leader-projection census:** per fought door — bands and
  projHp1/projHp2 in §3 (dead2: doors 1–4, 11; collapse2: doors
  5–9, 12; safe: doors 13–16). Per fired door — the 11 log entries
  in §4 (HP 30–75, projHp2 −20 to +25).
- **S11 D1fought:** control flee rate on fought pool doors 6/11
  (0.545); armed **unmeasurable** (0 fought pool doors — expected
  when the gate works).

## §8 Diag table

| # | Observation | Cause (verified) | Impact on the verdict |
|---|---|---|---|
| 1 | Door 10 unscored on both legs (30 calls, no fight, no fire) | Win-plan gate `winPlanOutmatched`: a wave-4+ meeting is avoided when any party member is unarmed or unarmored; door 10's quad has a member at at-door armor P 0 (total 15, lowest of the 16). The gate fires before the pool is picked, so LEADERPROJ is never reached. | Pool 11, not 12; D4 fires 11, not 12. D1 is a rate bar, so it still judges — and passes at 100pp. |
| 2 | Both legs exited 1, not 0 | Solely door 10's instrument error (`no-fight-no-fire after 30 calls (winPlanFightGate avoid)`), one per leg. | None on the corpus: 32/32 files written, D5-verified. The exit code records the unscored door. |
| 3 | D4 fires 11 vs expectation 12 | Same cause as #1 (door 10). | None — bar is ≥1. |
| 4 | M3l dev run 1: 8 failures (armorP out of range: 55, 4, 5) | The driver measured armor P AFTER `startExpedition`, which re-equips the quad from their packs (autoEquip). The pinquaddoor proof measures right after gear-up. | Fixed before the judged runs: measurement moved to right after gear-up (all 30); the at-door gear is stamped separately as observed (`measuredArmorPAtDoor`). Dev run 2 + judged battery run green 38/38. |
| 5 | One VM restart (~13:24Z) killed the first M3l dev run mid-§7 | Machine restart (uptime 1 min on recovery); the run's output was piped through `tail`, so no partial log survived. | No work lost. The test re-ran to a durable log file and went green. No write-flap episode was observed during this arm's writes. |
| 6 | Safe doors 13/14 still kill their leaders on the armed leg | The gate reads the leader's HP (>75 → no fire), not the fight. Healthy-HP doors can still be lethal. | None on D1 (safe doors are not in the pool). It bounds what the gate claims: it prevents hurt-leader disasters, not all deaths. |

## §9 Balanced panel (M5) — attached

`evidence/2026-11-23/doorstage-b-panel.md` (+ `.json`,
`-before.json.gz`, `-after.json.gz`). Built with
`RUN=doorstage-b CORPUS_PREFIX=doorstage-b` over the 16 staged door
seeds, control vs armed. Decision: **`review_required`**. The only
observed death metric moves in the gate's favor:

| Metric | Before (control) | After (armed) | Paired delta | Status |
|---|---|---|---|---|
| Village deaths per run | 0.4375 (7/16) | 0.125 (2/16) | −0.3125 | no_material_signal |
| Village deaths per 100 calendar days | 43.75 | 12.5 | −31.25 | no_material_signal |

No `regression_signal` anywhere in the report. Starvation and median
survival are NOT measurable on staged corpora (no day loop, no
pantry) — reported as not-measurable, never faked; the panel builder's
`options.days` reads 150 (its fixed label) while staged rows carry
real `gameDays` ~1, and the compared metrics are per-row, so the
label does not enter the decision. The deaths counted are the
per-door party deaths — the only death population observed.

## §10 Metric review

- **D1 is judged on the staged pool as frozen.** The pool came in at
  11, not 12 (door 10 unscored — §8 #1). The bar is a rate (20pp),
  not a count, so 11 vs 12 does not change the bar; the measured
  100pp drop clears it five times over. No re-scoring, no
  re-interpretation.
- **D2/D3 are composition artifacts on this instrument.** The armed
  leg fights only the 4 safe doors — the longest fights, holding the
  only kill — so its kill rate (0.25) and damage per door (743) are
  higher than control's by construction. They pass the frozen bars,
  but they measure the safe doors, not the gate. Do not cite D2/D3
  as evidence the gate improves fighting; the gate's evidence is D1.
- **The control pool ran 100% bad** (11/11), against the prior arms'
  fought pool at 33% (2/6). The staging deliberately covered
  dead2/collapse2 with lower leaders on average, and the result says
  the projection's forecast is accurate across the whole band —
  including the boundary (door 7, 75 HP → fled) and the wave-5 doors
  (11 rerun fled, 12 spoiler died in round 1). The
  "safe-but-≤75HP" class is empty (0/11 won) — the prereg's worked
  example (107394 rerun vKill at 38 HP, from a sim-fought door) did
  not reproduce on staged doors.
- **The instrument-error exit is a reporting deviation, not a
  judging deviation.** Both legs exited 1 on door 10 alone; the
  corpus is complete and D5-verified. The prereg's "exit 0" line
  assumed every staged door would reach a fight or a fire; door 10
  shows an earlier gate can pre-empt both. Future staging should
  check at-door armor (all four members armored) or accept the
  occasional unscored door.
- **Encounter gear: the issued kit is the floor, the fight wears
  pack-best.** `startExpedition` re-equips each villager from their
  own pack (the game's own autoEquip); the issued hide_armor is not
  in their packs, so it cannot be re-selected. The fight therefore
  wears organic pack gear (at-door P 0–55 across the 16 doors,
  stamped per door as `measuredArmorPAtDoor`). The issued kit
  (hide_armor + hunting_spear, P 30 each, measured right after
  gear-up) satisfies the prereg's party spec exactly as the prior
  arms measured it, and the leaderproj/gateavoid arms staged
  identically — so cross-arm comparability holds. The encounter-gear
  rule is met by the issued kit plus the game's own organic pack
  gear; no staged fight ran on a fresh un-geared solo scholar.
- **Next supply question (for the coordinator, not this arm):** the
  win-plan outmatched gate now bounds staged supply from below — a
  staged quad with an unarmored member never reaches the projection
  gate. Any future staged pool should either pre-check at-door armor
  or budget one unscored door per 12.
- **What this does NOT show:** the gate was judged on staged doors
  with leaders at 30–75 HP. It says nothing about leaders above 75
  HP (the safe controls still lost 2 of 4), nothing about the gate's
  effect over a 150-day horizon (no day loop here), and nothing
  about whether villages in organic play actually reach these doors
  with hurt leaders. Those are sim questions, not staged-door
  questions.

## §11 Proof battery (run after freezing, before the judged legs, on this tree)

All suites exit 0; the M3l count below is the judged post-freeze run.

| Proof | Target | Measured |
|---|---|---|
| M1 test-allyslot3-b | 18/18 | 18 passed, 0 failed |
| M2 test-pinquaddoor-b | 35/35 | 35 passed, 0 failed (+ analyze-pinquaddoor-b selftest 26/26) |
| M2w test-pinquaddoor-wide-b | 16/16 | 16 passed, 0 failed |
| M3 test-dmgpin-b | 29/29 | 29 passed, 0 failed |
| M3d test-doorflee2-b | 49/49 | 49 passed, 0 failed |
| M3e test-downedtwice-b | 25/25, exit 0 | 25 passed, 0 failed, exit 0 |
| M3f test-hypofloor-b | 48/48 | 48 passed, 0 failed |
| M3g test-hpgate-b | 43/43 | 43 passed, 0 failed |
| M3h test-leaderhpgate-b | 50/50 | 50 passed, 0 failed |
| M3i test-leaderproj-b | 55/55 | 55 passed, 0 failed |
| M3j test-gateavoid-b | 36/36 | 36 passed, 0 failed |
| M3k test-gateavoid-screen-b | 11/11 | 11 passed, 0 failed |
| M3l test-doorstage-b (NEW) | count at build | **38 passed, 0 failed** |
| Analyzer selftest | 39/39 | 39 passed, 0 failed |

Battery log (run record, not committed):
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/doorstage-b-proof-battery.log`.
One VM restart interrupted the first M3l dev run (§8 #5); the re-run
and the judged battery run both went green.

## §12 Files

- Prereg (anchor commit `97e00d5ba443b56f88b1afaaf4334fa132c6f5c9`):
  `evidence/2026-11-23/sim-doorstage-b-prereg.md` (sha256
  `612ef2456b86868331b5314884515e45698f055b60bb8176ca8be9b2750d27f8`)
- Staged-door spec: `evidence/2026-11-23/doorstage-b-spec.json`
  (sha256 `a285aede5cd4f8f265cf57b7e568300856d42f8babfcc295bae74eb8d4224143`)
- Driver: `scripts/doorstage-driver-b.js` (sha256
  `68a4d9dc25c00b9304cdae182bb4f0770e669b1ec424b1d58597eaecf541f7be`)
- Proof test (M3l): `scripts/test-doorstage-b.js` (sha256
  `a98cb6614612f27bb72dc6da3ab52c9d9949eeb4c1dd73ef5b316c752e425d18`)
- Control corpus (16 files):
  `evidence/2026-11-23/perseed-doorstage-b-control/`
- Armed corpus (16 files):
  `evidence/2026-11-23/perseed-doorstage-b-armed/`
- Analysis: `evidence/2026-11-23/doorstage-b-analysis.json` (sha256
  `ed0bf6c43d4906ec251ec908de53d15581f598fff98bd9f12e96628decdfbbbf`)
- Balanced panel: `evidence/2026-11-23/doorstage-b-panel.md`,
  `doorstage-b-panel.json`, `doorstage-b-panel-before.json.gz`,
  `doorstage-b-panel-after.json.gz`
- Legs log: `evidence/2026-11-23/doorstage-b-legs.log` (38 lines)
- This evidence: `evidence/2026-11-23/sim-doorstage-b.md`
- Policy frozen: `scripts/policies/competent.js` sha256
  `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
  (first 12: `1884c8852d38`); the driver does not execute the policy
  (`policyExecuted: false`).

Substrate flags (both legs): `SENSEEXPED=1 PARTYSIZE4=1
VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 LAUNCHSURVIVE=1
ALLYSLOT3=1 PINQUAD=1 DMGPIN=1 DOORFLEE2=1 HYPOFLOOR=1 HPGATE=1`.
Armed leg adds `LEADERPROJ=1` only. `LEADERHPGATE` unset on both
legs. Base `7ade8d3bf4a53f251845af1d5e0d079fd7f3fd0a`; zero `src/js`
changes in this arm.

## §13 What was frozen, and what moved

Frozen (prereg commit `97e00d5b`): the 16-door spec, the pool size
(12 staged), D1/D2/D3/D4/D5/D6 + M5 bars, the staged-door method, the
analyzer reuse. Moved after freezing, before the judged legs, with
the instrument still uncommitted and frozen by sha at leg time (see
§12): the driver's armor-P measurement point (right after gear-up
instead of after expedition start — §8 #4) and the added
`measuredArmorPAtDoor` observation field. Neither changes any fight:
the staging, the seeds, the legs, and the bars are exactly as
preregistered. The scored pool is 11, not 12 (§8 #1); the bar is a
rate and judges as frozen.
