# Journey Deepening — r218 (2026-11-15)

**Leg 2 — deepening (days 40–80, wave 2–3, knowledge economy, regional links, scale pressure).**
Run `loop-a-20261116-0050`. Rotation read `2`, advanced 2→3 at run start (read-back verified).
Seeds **100221–100228** (fresh band, verified unused). DAYCAP 100, competent policy.
Branch `journey-deepening`, base master `5e0bba6e5`. Prereg + Amendment A0 (`0754efb1c`, `63ffa6411`),
instruments (`bdf1c4924`), Amendment A1 (`dfeb2893c`). No `src/js` change in the final branch —
the guard-OFF patch was applied uncommitted for the OFF panel only and reverted before this note
(`git checkout -- src/js/game.js`, diff verified empty, line 24162 restored).

## Short version (plain words)

This run asked one question: is the lingerer guard the reason villages barely kill wave-4 monsters
anymore? The guard is a single line in the fight code that stops a lingering raider from stepping onto
the scholar and starting a solo fight it almost always wins. We played the same eight villages twice —
once with the guard on, once with it off.

**Answer: mixed, and the guard stays.** With the guard off, wave-4 fights more than doubled (37 → 82)
and kills rose (2 → 7), but kills did not get back to the old level (11 in r212), no village banked two
kills, and wave 5 never opened in either arm. And the price of switching it off was brutal: the scholar
died 74 times instead of 30, 59 of those deaths out in the wild, and half the villages were wiped out
(4 of 8 lost, three of them down to zero people) versus one lost with the guard on. The guard is doing
real protective work; taking it out trades lives for a few more kills and still doesn't open the door.

**The door itself turned out to be something else.** The old note said wave 5 opens when a village
banks two wave-4 kills. Reading the actual code this run: it doesn't. Wave 5 opens when the village's
standing reaches 200 *and* it has faced a wave-4 monster *and* it passes a combat-readiness check
(enough well-armored fighters, weapons to hand, tricks known, two living veterans). Six villages held
standing above 200 while wave-4-faced — one sat at 466 for 51 days — and none of them opened wave 5.
The "plenty" cap is ruled out (their capped totals were 245–386). What held them is the readiness
check, but our instruments only record the wave-4 version of that check, so *which* bar failed is
unmeasured. That is the carry for the next run.

**The villages themselves:** with the guard on, 7 of 8 survived; with it off, 4 of 8. Every village
reached wave 4; none reached wave 5. The ladder (village → regional → national → global standing)
opened on all 16 runs. Conversations still read like people talking: 214 sittings, 48 plain
goodbyes ("Same time tomorrow, maybe"), zero sittings without a goodbye. Monster meat still almost
never reaches the table — four villages killed dozens of beasts and ate none of them.

**Verdicts:** reachable — yes (wave 4, ladder, secrets all fire). Fun — yes (conversations hold
meaning; see people check). Winnable — **no**: the wave-4→5 door never opened on 16 villages, and
the chain stalls at wave-4 kills and at readiness, not at standing.

## Q1 — wave-4 kill A/B (PRIMARY): MIXED

Guard = `src/js/game.js:24162` `if (m.lingering) return;` in monsterTurn. ON = guard in place
(pristine game). OFF = that line commented out for the OFF panel only, reverted after. Same 8 seeds
both arms; trajectories diverge after the first lingering-monster turn, so the comparison is
panel-level (8v8), never per-seed paired. Pre-registered bars: GUARD-IS-CAUSE if OFF kills ≥8 AND
fights ≥60 while ON kills ≤2; GUARD-EXONERATED if OFF kills ≤2; MIXED if OFF kills 3–7.

| | ON (guard) | OFF (no guard) | r213 | r212 |
|---|---|---|---|---|
| wave-4 fights | 37 | 82 | 26 | 72 |
| wave-4 kills | 2 | 7 | 1 | 11 |
| kills / seed | 0.25 | 0.875 | 0.125 | 1.375 |
| villages with 2 kills | 0 | 3 (100222, 100225, 100228) | 0 | 3 |
| wave-5 unlocked | 0 | 0 | 0 | 3 |
| scholar deaths (all) | 30 | 74 | — | — |
| scholar deaths, wild | 22 | 59 | — | — |
| villages survived | 7/8 | 4/8 | 8/8 | 8/8 |
| villages lost | 1 (pop 7/7 at loss) | 4 (3× pop 0/0) | 0 | 0 |
| errors | 0 | 0 | 0 | 0 |

OFF kills = 7 lands in the pre-registered MIXED band (3–7): fights cleared the ≥60 bar (82) but kills
fell short of the ≥8 bar, and ON stayed collapsed (2 ≤ 2). **Verdict: MIXED. No game change.**
The guard suppresses fights and kills (37→82 fights, 2→7 kills when removed) but is not the whole
cause of the collapse — and removing it does not restore r212-level killing or open wave 5.

The scholar-death price is reported alongside, never folded into the verdict: OFF playerDeaths 74
vs ON 30; wild deaths 59 vs 22; survival 4/8 vs 7/8. Per-seed OFF: 100221 fights 15 kills 1,
deaths 13 (wild 8); 100222 fights 7 kills 2, deaths 6 (wild 4); 100223 fights 13 kills 0,
deaths 12 (wild 11); 100224 fights 0 kills 0, deaths 1; 100225 fights 11 kills 2, deaths 5
(wild 5); 100226 fights 14 kills 0, deaths 14 (wild 14); 100227 fights 9 kills 0, deaths 14
(wild 11); 100228 fights 13 kills 2, deaths 9 (wild 5). The scholar was in every OFF wave-4 fight
(scholarFights == w4fights on all 8 seeds) — the extra fights are scholar fights, and the scholar
usually loses them.

The three OFF villages with 2 kills won them late: 100222 on days 61+80, 100225 on days 56+91,
100228 on days 66+79. None unlocked wave 5 (see door correction below).

## The wave-5 door — premise corrected by code-reading

The r213 note said "the door opens at 2 banked fourth-wave kills." That was a correlation, not the
gate. The code (`unlockedWave()`, `src/js/game.js:34554`, and `villageStandingTotal()`,
`src/js/standing.js:172`) says wave 5 needs ALL of:

1. the wave-3 rung (day ≥25 and 5 wave-2 ledger kill points) — met on every village that reached
   wave 4;
2. **gated** standing ≥200 (t5) — the gated total, not the raw number;
3. wave-4 faced blow-by-blow (`waveEngaged(4) > 0`);
4. wave-5 combat readiness (`waveUnlockReady(5)`): armored 4 at armor P≥15, armed 6, tricks known 3,
   living veterans 2 (veterans = living roster members with a wave-4+ kill in `waveKillLog`).

Kills feed the door indirectly (war points +25 per wave-3+ ledger kill point; veterans via the kill
log) but the door never counts banked kills directly.

What the panel shows against that gate:

- **Standing is not the binding constraint.** Six villages held raw standing ≥200 while wave-4-faced
  and still never unlocked: ON 100221 (raw 466, days 50–100, 51 days), ON 100226 (310, days 63–100),
  OFF 100221 (332, days 66–90), OFF 100222 (245, days 82–100), OFF 100225 (220, days 92–100),
  OFF 100227 (210, days 95–100).
- **The plenty cap is ruled out.** Capped totals (war + diplomacy + min(plenty, 100)) at peak were
  386, 310, 332, 245 — far above 200. Bread is not what held them.
- **Wave-4 faced is met.** `engaged.w4` is 7, 4, 5, 7, 4 on the checked villages; `wavesFaced`
  lists wave-4 types (algorithm, audit, eulogy, reunion, strike, eater, influencer) on 100221 ON.
- **The remaining hold is the wave-5 readiness deferral** (`defer5`: capped ≥200 but `!rd5.ready`
  holds the gated total at 199). The driver snapshots wave-4 readiness only (demand armored 3 @P≥10,
  armed 5, tricks 3, veterans 1 — met on 100221 ON throughout: veterans 3, armored 8–9, armed 8–12,
  tricks 25–32). It does not snapshot wave-5 readiness, and the wave-5 armor bar is steeper
  (4 fighters at P≥15, not P≥10) while armor is mortality-selected. **Which bar failed is
  unmeasured.** Carry: snapshot wave-5 readiness (armored @P≥15, armed, tricks, veterans) and the
  binding hold kind in the driver.

Note for the metric record: the analyzer's `villageSlainW4` / `banked2` read is snapshot-bound
(last waveLog snapshot predates every wave-4 kill on this panel — all kills fell on days 56–91,
snapshots stop by day 60), so it reads 0 everywhere even where live kills happened. The door read
above uses live state and code, not the snapshot.

## Q2 — parting lines, first readable panel

The driver now logs `winddown THEM:` lines (the exit line, close/lapse beat, mood goodbye the
transcript speaks at `endConvo`). The analyzer classifies each sitting's winddown: PLAIN / WARM-COLD
/ OTHER-CLOSE / NO-CLOSE (no goodbye spoken at all). Old `closing line:` count kept as
`noCloseClosingLine` for comparability.

| | ON | OFF | combined |
|---|---|---|---|
| sittings | 115 | 99 | 214 |
| PLAIN partings | 23 | 25 | 48 |
| WARM-COLD | 92 | 74 | 166 |
| OTHER-CLOSE | 0 | 0 | 0 |
| NO-CLOSE (no goodbye) | 0 | 0 | 0 |
| old-measure no-close closing lines | 23 | 17 | 40 |

The instrument works. Plain parting is real and common (~22% of sittings: "Same time tomorrow,
maybe"), warm/cold closes dominate, and **zero sittings end without a goodbye** in 214 chances.
The old measure's 23/115 (ON) matches r213's 27/123 — same rate, now with the winddown read behind it.
Diagnostic only; no GO/NO-GO. Predicts PLAIN ≥5 across the ON panel — met (23).

## Q3 — carried-wrinkle sweep

| Wrinkle | ON | OFF | Verdict |
|---|---|---|---|
| Meat dinners (0 on a surviving village) | dinners 13, 1, 2, 5, 1, **0, 0**, 20 | dinners 10, 1, 0, 5, 1, **0**, 1, 18 | **CONFIRMED, stronger.** Four zero-dinner villages across 16 runs: ON 100226 (1 reveal, 33 kills), ON 100227 (0 reveals, 48 kills), OFF 100223 (2 reveals, 21 kills), OFF 100226 (1 reveal, 17 kills). The chain stalls at the reveal step — kills plentiful, reveals rare or zero, dinners zero. |
| Water-haul template ("creek water run") | 7 transcript mentions | 4 transcript mentions | **Recurs both arms.** Re-asks run days 45–80 by different villagers (Emilio d60, ON — see people check). |
| Teach-loop same-pick | 35 frames, 4 distinct, max same 2 | 13 frames, 4 distinct, max same 2 | VARIED both arms — not stuck. |
| `betrayal:accept` label | 33 sittings (accept 18 / decline 15) | 32 sittings (accept 18 / decline 14) | **CONFIRMED.** Menu says betrayal; content is trust (Ines d27, ON — see people check). |
| Knowledge-goal thinness | GOALJOIN knowledge tops=0 → NO-DATA | GOALJOIN knowledge tops=2, lined 0, capture 0 → GOALS-FAULT | **Recurs in a new shape.** ON has no knowledge tops at all; OFF has tops that never line up or capture anything. |
| Secret path / post-secret | openers 4, want established 3, post-secret THIN (dryRate 0.50, dryFirst 2/4) | openers 3, want established 2, post-secret MIXED (dryRate 0.33, dryFirst 1/3) | Secret path opens both arms. Post-secret stays thin-to-mixed — the curious-path dry line ("...Sorry, lost my train of thought.") recurs after secrets (Kurt d45, ON). |
| "(ended by engine)" closes | 0 in 115 transcripts | 0 in 99 transcripts | **Absent this run.** The engine-close line never fired once in 214 sittings. |
| Recap paraphrase / secret-template repeat | not re-verified against the new transcripts | not re-verified | **Carried, unmeasured.** No verbatim repeat flagged by the variety panel (ON distinct answers 3, maxRepeat 2; OFF distinct 2, maxRepeat 2). |
| AWAY watch | 13 total, dominant share 0.31 → VARIED | 8 total, dominant share 0.50, 4 sittings / 4 seeds → WATCH-CONTINUES | ON cleared the watch; OFF re-opens it on a small n (8). **Watch continues one more run.** |
| FAVORBLOCK / PARTNERBLOCK | 12 / 19, shares 0.33 / 0.32 → VARIED | 13 / 12, shares 0.38 / 0.42 → VARIED | **WATCH-CLEAR both arms.** All four block lines vary; no single line dominates. |
| RE-ASK orphans | 13 (11 from-seed, 2 true-no-thread) | 10 (9 from-seed, 1 true-no-thread) | Carried clean — mostly re-asks that trace back to a seed thread. |

## Q4 — read-only carries

- **LADDER:** ON opens 8/8, holds 8/8, all 5 tracks minted on all 8, first days all 14. OFF opens 8/8,
  holds 6/8, all 5 tracks minted on all 8, first days all 14. Ladder opens and mints everywhere.
- **SECRET-PROBE:** ON sittings 115, trust≥40 105, eligible 41, fired 4 → FIRES. OFF sittings 99,
  trust≥40 88, eligible 30, fired 3 → FIRES.
- **GUARDLINES:** ON 17 total (hear 7, sit 3, shut 1, nod 2, passes 2, nothing 2). OFF 16 total
  (hear 7, passes 2, shut 1, sit 2, nod 2, nothing 2). Counts only.
- **PLACEPROBE:** ON 14 sittings with places, askField picks 36 → FIRES. OFF 8 sittings, picks 14 → FIRES.
- **REQUESTS:** ON staged 65, decided 53, expired 12 (2 expired talkable-untalked) → REACHED. OFF staged 57,
  decided 47, expired 10 (3 expired talkable-untalked) → REACHED.
- **B-SIT / P-KEEP / B-FOLLOW:** ON betrayal sittings 33, threads 25 (NAMED 3, DEAD 5, SILENT 7,
  NO-LATER 10), follow-ups 23 (11 with new betrayal). OFF sittings 32, threads 23 (NAMED 5, DEAD 10,
  SILENT 3, NO-LATER 5), follow-ups 24 (13 with new betrayal).
- **MENU-FLIP:** 0 flips both arms (fix holds). **DOUBLE-ASK:** 0 both arms (carried clean).
- **LANGGATE:** ON 67 offers / 53 decisions → NOT-REPRODUCED. OFF 59 / 47 → NOT-REPRODUCED.
- **LANGARC:** ON 3 flips, 2 post-flip decisions → ARC-FIRES (first firing; r213 was flips-no-payoff).
  OFF 1 flip, 2 post-flip decisions → ARC-FIRES.
- **REPLAY:** 0 both arms → NOT-REPRODUCED. **CISTERN:** CLEAN both arms.
- **TRUST:** CARRIED both (computed TRUST-PAID-TO-STRANGERS; ON strangerGains 1, total −17; OFF
  strangerGains 3, total −42; r119 verdict stands, no new trust verdict this run).
- **GOALJOIN:** party_up HEALTHY both (tops 83 / 73); gear_up NO-DATA both; bank_veterans HEALTHY both
  (tops 1 / 1); build_standing HEALTHY; food_security HEALTHY; bonds HEALTHY; safety HEALTHY;
  knowledge ON NO-DATA, OFF GOALS-FAULT (see Q3).
- **D-THING:** ON pocketed 13, testable 5, mentioned 1 (1 named, 1 old-rule). OFF pocketed 14, testable 8,
  mentioned 1 (1 named, 2 old-rule). **RAJ-PHOTO:** 0 plants both arms.
- **DEBRIEF:** ON villageLost 1, attributed 1, unclassified 0. OFF villageLost 4, attributed 4,
  unclassified 0.
- **Wave-5 killing read:** stays UNMEASURED-population on the 100-day horizon (0 unlocks in either arm).

## Village census (plain words)

**Guard ON — 7 of 8 survived.** The one loss (100223, day 90) still had its people alive at the end
(7 of 7) — the village broke apart rather than being wiped out. Everyone reached wave 4; nobody
reached wave 5. Standing peaked highest on 100221 (466, the only village to go global alongside
100226 at 310); the weakest, 100222, peaked at 100. The rest sat regional at 134–175. Deaths per
village ran 33–76 — the villages are dying fighting, not hungry: the dead are mostly monsters and
villagers lost in the wild and in combat. Populations held at 8 of 8 on six seeds, 7 of 7 on 100223,
4 of 4 on 100228.

**Guard OFF — 4 of 8 survived, and the losses were wipes.** 100221, 100223 and 100226 all ended with
zero people alive; 100228 lost the village with 5 of 5 still standing. The survivors are thin:
100227 survived with a single person left. Standing peaked at 332 (100221) down to 134; only 100221
went global. The extra wave-4 fights the guard's removal bought were fought by the scholar, and the
scholar kept dying in them — 74 scholar deaths against 30 with the guard on. Villages that look
strong on standing (245 on 100222, 220 on 100225) still never opened wave 5, because the door is
gated on readiness, not standing alone.

## People check (4 full transcripts, ON arm — PASS with structural defects)

1. **Thao, 100221 day 45** — a cistern-dry creek-water ask that reads like a real need from a real
   person; then six consecutive teach picks that vary (plants, frames) instead of looping one pick.
   Defect: the favor-requirements block line ("Move next to your partner, on the same side of the
   Haven door.") still speaks in flat engine voice (known r213 caveat).
2. **Kurt, 100225 day 45 (secret)** — "At night I talk to someone who isn't there anymore." The
   promise is kept inside the sitting; the follow-up `alive:want:curious` draws the dry line
   ("...Sorry, lost my train of thought.") — the curious-path dry line recurs in post-secret shape.
3. **Emilio, 100221 day 60 (water-haul re-ask)** — "About the creek water run — the need hasn't gone
   anywhere. I'm still asking." The player commits ("Dawn, then...") and the ask carries. Defect:
   the favor line again engine-voiced ("Your partner is on the Haven grounds. Step outside to meet
   them."). Closes with a plain parting ("Same time tomorrow, maybe.").
4. **Ines, 100221 day 27 (betrayal-accept)** — the menu offers `betrayal:accept` beside a friendly
   Stonebridge link proposal; picking it yields a warm trap-line walk and a real fear exchange
   ("That it's intentional... Yeah. Me too. The randomness would almost be kinder."). The label
   says betrayal; the content is trust. CONFIRMED again.

Villagers act like people: they ask for what they need, re-ask when it isn't met, keep secrets,
and say goodbye. The standing defects are voice, not structure — the favor block lines still sound
like the engine, not the person.

## Blanks filled / documented

- **Filled:** the wave-4 kill A/B (MIXED — guard suppresses but is not the whole cause; removing it
  costs more than it buys); the parting-line read (first readable panel — plain partings real,
  zero no-goodbye sittings); the wave-5 door mechanism (standing+readiness, not banked kills);
  meat-dinner zero cases (now four villages across 16 runs); AWAY/Favor/Partner block watches
  (ON clears, OFF re-opens AWAY).
- **Documented, not fixed:** the favor block lines' engine voice (r213 caveat, recurs); the
  meat reveal bottleneck (kills plentiful, reveals rare); the knowledge-goal thinness (new
  GOALS-FAULT shape on OFF); the post-secret dry line (thin-to-mixed); the wave-5 readiness bar
  that actually binds (unmeasured — carry).

## Reachable / fun / winnable

- **Reachable — yes.** Wave 4 reached 8/8 in both arms; the ladder opens 8/8; the secret path fires;
  links, bonds, language arcs, and feasts all fire in the wild.
- **Fun — yes.** Conversations have wants, follow-through, and endings that resolve or owe; the
  parting read proves goodbyes land. The defects are voice-level, not structural.
- **Winnable — no.** The full win chain stalls at the wave-4→5 door on 16 consecutive villages:
  wave-4 kills run 2–7 per eight villages against 11 in r212, and even villages that clear the
  standing bar are held by a readiness check whose failing bar we still haven't measured. The
  guard is not the lever that opens it.

## Metric review

- **Amendment A1 (before any verdict):** the pre-registered guard compared `w4fights` to
  `fightsByWave['4']`, but the driver tallies `fightsByWave` once per monster, so a triple-monster
  pack counts 3. Corrected to the per-fight `foughtWaves` denominator; `fightsByWave['4']` rides
  along for audit. Proof (26) pins it (triple pack → fights 1, kills 3, no error). Proof 25/25
  after the fix (24/24 before).
- **Red control nuance:** (23) passes under both the r218 and r213 analyzers (its OTHER-CLOSE
  expectation coincides); (15)/(17)/(18) pass under r213 (it has the third branch — the r213 proof's
  red mode was against r212, not r213). Recorded, not re-scored.
- **Snapshot-bound `banked2`:** the analyzer's `villageSlainW4` reads the last waveLog snapshot,
  which predates every wave-4 kill on this panel (kills days 56–91, snapshots stop by day 60). It
  reads 0 everywhere even where live kills happened. The door verdict above uses live state and
  code, not the snapshot. Next run: snapshot the live `waveKills`/`wave4Slain` at run end, or drop
  the snapshot read.
- **"2 banked kills" premise corrected:** r213's door premise was a correlation. The code gate is
  standing (gated) ≥200 + wave-4 faced + wave-5 readiness. The A/B bars (fights/kills) were
  pre-registered and are unaffected — the verdict is MIXED on those bars — but the door read now
  follows the code.
- **Telemetry:** w4 metrics are note-only this run (the r192 deepening baseline carries no w4
  fields; baseline extension proposed for the next run, not improvised). Telemetry check against
  the r192 baseline runs in the closeout (see below).

## Telemetry

`node scripts/telemetry-check.js --baseline <deepening r192> --current
'journey-deepening-r218-on-seed*.json' --metrics w3fights,engaged.w3,fightsTotal,fightsByWave.3`
— run at closeout; LOUD lines investigated before any baseline roll. (Result recorded here when run.)

## Gate

`node scripts/check.js --quick` in the worktree (`--cacheDirectory=/tmp/jest-cache-playtest`).
Expected known set from r213: measurement-proof staleness, phone-frame proof, deed-attainment 120s
timeouts, ladder-bundle + person-trust substrate failures. Bar is 0 attributable — this run changed
no `src/js` in the final branch. (Result recorded here when run.)

## Carries to the next run (leg 3 — scale)

1. **Snapshot wave-5 readiness in the driver** (armored @P≥15, armed, tricks, veterans for wave 5)
   and the binding hold kind — the unmeasured bar behind 0/16 wave-5 unlocks.
2. **AWAY watch continues** (OFF re-opened it on n=8).
3. **Meat reveal bottleneck** — haul→reveal stalls while kills are plentiful; four zero-dinner
   villages now.
4. **Knowledge-goal thinness** — OFF's GOALS-FAULT shape (tops that never line up or capture).
5. **Post-secret dry line** — ON THIN (0.50), OFF MIXED (0.33); the curious-path dry line recurs.
6. **Recap paraphrase / secret-template repeat** — not re-verified this run; carry.
7. **The guard stays.** MIXED verdict, no game change. Any future guard change needs a fresh
   pre-registered panel — the scholar-death price (74 vs 30) is now measured.
8. **Baseline extension:** add w4 fields to the deepening telemetry baseline for the next run.
