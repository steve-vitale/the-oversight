# sim-aidcrisis-b: aid-crisis haven-defense channel decomposition (DIAG)

- run: fleshout-20261024T0615Z, axis scale-onramp, worker arm sim-aidcrisis-b
- claim: findings-backlog #866 (marked claimed)
- mode: DIAG (no balance lever; instrument-only; zero src/js changes)
- question: is the chair's lethality a haven-defense EXPOSURE problem (the crisis
  draws the scholar into the contact channel) or a SUCCESSION-TIMING problem?
- anchorCommit: 471894c968bc (arm commit; parent be55cfc2c = master HEAD at
  re-sweep). RE-ANCHORED 2026-10-24: the original 6add5c9a07e2 corpus did not
  reproduce on the new base (journey-establishment r31 preserver mapping +
  journey-crisis r47 siege composition moved trajectories), so the full
  24-config census was re-swept on the current base and this file re-written
  from the new corpus. Old-anchor numbers are kept below only where the
  comparison itself is the finding.

## Pre-registration (binding, MEASUREMENT.md §14)

- PRIMARY: complete attribution — 100% of wave-4+ haven-defense fighter deaths on
  the census corpus named by (a) aid-crisis active/inactive at death, (b) scholar
  vs companion, (c) scholar tenure at death (picked-successor <=14d or not).
- SECONDARY: counterfactual — scholar haven-defense lethality per fight-day,
  crisis vs non-crisis.
- GO iff attribution is complete AND the crisis contrast is named quantitatively.
- Horizon: 180d death-aware (Game.over stops the sim). Seeds: 70111–70122
  (the defer5-rediag band) x {leadfeast, belongfeast}, armorvillage.armedFor
  (armorydrive pinned substrate) — identical to the vetautopsy census so the
  landed corpus (evidence/2026-10-24/perseed-vetautopsy/) is the offline baseline.
- Convergence state: DIAG-GO

## Canon

No dedicated aid-crisis canon doc exists — said explicitly rather than inventing
one. The crisis chain is canonized in docs/ONTOLOGY.md §193–217 (comms chain):
raiseAidCrisis (player-declared, reactive, never calendar-scripted; "had no
organic caller (0/120 runs)" until raids raised it reactively via havenRaidTick);
lingering raiders persist at the treeline and gorge nightly until driven off;
crisis resolves 'fought' (treeline clear) or 'moved-on' (6-day valve); signal
fire draws company (attracted grows, arrives as real pack members, fleeing
blocked); arrived parties fight blow-by-blow as real combatants; a fallen ally
costs trust and forgives debt in blood. Wave law from docs/MONSTER-WAVES.md.

## What an aid-crisis IS (characterization, from code + instrument)

1. RAISING — reactive, never calendar-scripted (comms.js raiseAidCrisis; canon
   raid_raises_crisis): havenRaidTick fires on world state (3+ world monsters,
   3k+ pantry kcal, 7-day cooldown, 18% roll) — wealth draws teeth. Raiders
   nobody meets LINGER at the treeline and gorge nightly until driven off.
   Player-facing beat: "🚨 <pack names> is at Haven's door. The village looks
   to you." plus four call-for-help options with honest costs (runner: slow +
   real road danger; signal fire: fast, loud, indiscriminate — draws company as
   real pack members, fleeing blocked; System relay: needs integration stage 2+,
   garbled + a favor owed; ability cry: build-gated).
2. WHILE ACTIVE — lingering raiders are a persistent threat at the door. Fights
   the scholar takes against a lingering raider route through aidFight
   (game.js pViaAid/wViaAid), scoring channel 'aid-crisis' on the wave-kill
   ledger; arrived allies fight blow-by-blow as real combatants (never an
   outcome table); a fallen ally costs trust and forgives debt in blood.
3. RESOLUTION — 'fought' when the treeline is clear ("The door is quiet. Haven
   breathes."), 'moved-on' on the 6-day valve ("Whatever was at the door has
   moved on — or found easier meat."). A RAID crisis resolved 'fought' fires
   'the-siege' crisis beat (progression.js CRISIS_BEATS) — wealth drew teeth,
   teeth were answered. Once per run.
4. WHO FIGHTS — the scholar (player) directly against lingering raiders at the
   haven; the muster shelters everyone but the scholar by construction (census:
   101/141 wave-4+ scholar haven fights fought SOLO); arrived foreign parties
   (aidFight faces) fight alongside. 93/93 wave-4 fights happen at the haven
   (ambient, not assault) — the crisis does not summon new fights, it NAMES the
   wave-4 monsters already at the door and gives the village a comms chain to
   answer them with.
5. WHO DIES — measured below: whoever holds the chair, almost always within
   days of sitting in it.

## PART 1 — offline primary (landed vetautopsy corpus, anchor 84d390816755)

The six fully-attributed wave-4+ killer deaths (vetautopsy-attribution.json),
looked up against the landed death rows (ctx.aid = crisis live at death).
This section is UNCHANGED by the re-anchor: the landed corpus and attribution
are the same files, and the primary still verifies 6/6 named, missing 0.

Re-anchor note (E4): the same six villagers in the FRESH corpus on the new
base reproduce exactly 2/6 same-day (nikos_papadopoulos d111, marcus_webb
d70, both identical opponent + crisis state). The other four diverged with
the base change, but every one is accounted for with a complete fresh death
row, still named on (a)(b)(c): gen_zcwrr90 d29 vs gallowdeer w1 (crisis
inactive); nikolai_volkov d128 vs eulogy w4 (crisis active, haven, tenure
1d — same KIND of death, different day); gen_7zji70w d111 vs suburb w4
(crisis active, haven, tenure 0d — the old off-haven outlier is now a
crisis-active haven death); jovan_milic d94 'the night' (non-combat, tenure
13d). The test's E4 gate was re-anchored to accounted-for + fully named (see
metric review) — the divergence is base-change data, not instrument failure,
and 5/6 fresh deaths are still combat deaths, 4/6 wave-4 haven crisis deaths.

| config | vid | death day | (a) crisis active | (b) scholar? | (c) blood ≤14d | at haven | opp (w4) | fight basis | armor |
|---|---|---|---|---|---|---|---|---|---|
| s70113-belong | nikos_papadopoulos | 111 | TRUE | yes (player) | yes, 7d | true | eulogy | same-day:combat_start | 0 |
| s70118-lead | marcus_webb | 70 | TRUE | yes (player) | yes, 4d | true | suburb | same-day:combat_start | 0 |
| s70119-belong | gen_zcwrr90 | 140 | TRUE | yes (player) | yes, 2d | true | algorithm | same-day:combat_start | 0 |
| s70119-belong | nikolai_volkov | 172 | TRUE | yes (player) | yes, 10d | true | algorithm | same-day:combat_start | 0 |
| s70119-lead | gen_7zji70w | 104 | FALSE | yes (player) | yes, 1d | FALSE | none (basis none) | none | 0 |
| s70122-lead | jovan_milic | 147 | TRUE | yes (player) | yes, 0d | true | congregation | same-day:combat_start | 0 |

PRIMARY verdict: 6/6 named on (a), (b), (c). 5/6 crisis-ACTIVE at death, all 5
at the haven, all 5 vs a named wave-4 monster, all 5 the current scholar
(player=true), all 6 within 14d of first blood (median 4d), 0/6 armored.
The outlier (gen_7zji70w, s70119-lead): crisis INACTIVE, off-haven, no same-day
fight row — died in combat 1d after first blood on what reads as an expedition.
That village was in a succession cascade (6 successions days 94–110, trust
97→36) under ambient wave-4 pressure with NO crisis active: the chair kills
fresh scholars with or without the crisis channel.

## PART 2 — fresh census (vetaidcrisis instrument, 24/24 configs, anchor 471894c968bc)

Corpus: evidence/2026-10-24/perseed-aidcrisis/ (24 configs, zero instrument
errors, determinism byte-identical on judged fields — test-aidcrisis-b E1–E5
ALL GREEN after the E4 re-anchor, see metric review).

Crisis timeline (268 raised, 257 resolved, 11 live at run end):
- kinds: 100% 'raid' at resolve (raised as 'monster', re-flagged raid by
  havenRaidTick). Waves: w1 78, w2 72, w3 57, w4 47, w5 3.
- resolutions: 'fought' 228 / 'moved-on' 29. Crisis duration: median 1d, max 7d.
- foreign help arrived (helpAtDoor>0): 0/257 crises. attracted: 0.0 avg. The
  four call-for-help tiers produced zero arrived allies in 24 configs — the
  policy never successfully calls, or calls never complete. The "aid" half of
  the aid-crisis is unexercised by competent-policy sims. (Unchanged from
  the old anchor: 0/287 then, 0/257 now.)

SECONDARY (exact combat_end pairing — a scholar death counts iff the nearest
preceding same-day combat_end with a scholarIn start carried result='lost' or
php<=0; no same-day guessing):

| arm | scholar w4+ haven fight-days | paired scholar deaths | lethality/fight-day | tenure med | blood-tenure med |
|---|---|---|---|---|---|
| crisis ACTIVE | 107 | 100 | 93.5% | 1d (n=97) | 5d (n=7) |
| crisis INACTIVE | 42 | 39 | 92.9% | 1d (n=39) | 1d (n=1) |

- 53 additional scholar combat deaths at haven were unpaired (died vs waves
  1–3, or no lost-end same day) — longer tenures: seasoned scholars who
  survive the wave-4 gauntlet die to attrition, not the chair.
- Of 139 paired deaths, only 8 had ANY wave-4+ kill on record (bloodTenure
  non-null): 131/139 died in what was effectively their first wave-4 fight.

GO: attribution complete (E3 + re-anchored E4) AND the contrast named
quantitatively: 93.5% vs 92.9% — no meaningful crisis/non-crisis lethality
difference. The old anchor's 92.7% vs 100% gap CLOSED on the new base, which
strengthens the crisis-independence conclusion rather than weakening it.

## Verdict: succession-timing, riding on an exposure mechanism

- EXPOSURE is real: 107/149 (72%) of wave-4+ haven fight-days happen under an
  active crisis. The crisis is the contact channel — it draws the scholar to
  the door while the muster shelters everyone else.
- LETHALITY is not crisis-dependent: 93.5% vs 92.9% per fight-day. Once the
  scholar is in front of wave-4 teeth, the crisis changes nothing about the
  outcome.
- The killer is the CHAIR'S STRUCTURE: each death instantly seats a new
  scholar who walks out to fight the same teeth. New-anchor specimen,
  s70111-belong crisis 17 (d148–151): a wave-4 suburb crisis killed FOUR
  scholars in two days (tenures 13, 0, 1, 0), crisis still unresolved at run
  end. The old-anchor specimen (six scholars in six days on the same config)
  no longer exists on the new base — that config now runs 151d — but the
  pattern reappears in the same form, which is the finding surviving its own
  specimen.
- Implication for the scale wall: cutting crises (exposure) reduces fight
  count but leaves ~93% lethality per contact — the next wave-4 contact still
  grinds the chair. The lever that moves the wall is the chair itself: armor
  the scholar (0/6 armored on the old anchor; the new base's armor picture is
  in the fresh corpus), don't field the scholar solo (139/149 solo, up from
  101/141 — companions join even less on the new base), or give fresh
  scholars a reason not to answer the door first.

## Reachability verdict

- Waves 1–5 crises all fire (w5: 3 crises) — the content exists and triggers.
  Wave-5 UNLOCKS: 2/24 configs (s70118-belong, s70119-lead) — up from 0/24 on
  the old anchor. Wave-4 unlocks: present (maxWave 4 on 18 configs).
- national: 5/24, table: 20/24, won: 0/24, median survival ~133d, max 180d.
  Wall numbers moved with the base: national 7→5, table 17→20, median
  145d→133d. The wall stands (wins 0), but the shape moved — the base
  changes (preserver mapping, siege composition) are live levers on it, not
  neutral background.
- The aid-crisis channel is reachable and resolves (257/268 within the run);
  the 'the-siege' beat fires on raid-'fought' resolutions. The comms chain's
  HELP half is unreachable in sims (0 arrivals) — policy-side, not game-side.

## Village assessment

What the villages looked like: competent, fed, armoring villages that die by
the chair, not by starvation. Successions 1–18 per config; the scholar's
median life after sitting down is measured in days once wave-4 teeth arrive.
s70119-lead is the new type specimen of the base change: it now reaches wave
5 AND national (old anchor: wave 4, no national, lost day 111) — the same
seeds, a different game underneath. s70111-belong is the crisis-channel
specimen on both anchors: one wave-4 suburb crisis, four scholars in two
days, the teeth still at the door when the run ends — the fiction held, the
cost was the village's leadership.

Who fought: the scholar, alone, 139 of 149 wave-4+ haven fights. Companions
joined 10. Foreign allies: never (0 arrivals in 257 resolved crises).

Sense check (SENSE-TESTING LAW): the fiction reads as designed and meaningful.
"🚨 The Eulogy, Big Big, The Big Beast is at Haven's door. The village looks to
you." → the scholar answers → "The door is quiet. Haven breathes." (or the
teeth move on). A scholar's crisis-defense death reads as a real sacrifice
with real stakes: named wave-4 monster, blow-by-blow real fight, the village
watching, the chair passing to the next named person the same day. What does
NOT read sensibly: the village looks to the scholar and to the scholar ONLY —
the four call-for-help tiers exist in the fiction but never deliver a single
ally in 24 runs, so the "aid" in "aid-crisis" is a promise the sims never see
kept. And the muster sheltering everyone-but-the-scholar means the crisis
channel is, mechanically, a scholar-killing machine with a comms UI on top.
One observed nuance, not chased: on same-day crisis resolution a death row's
crisisActive can read false while its fight row reads true (s70111-belong
crisis 4, Piper vs moderator) — the contrast uses fightEnd pairing, so it
is unaffected, but death-row crisis flags should not be quoted alone.

## Blanks filled / documented

- FILLED (#866): the aid-crisis haven-defense channel is decomposed —
  exposure mechanism (crisis draws the scholar: 72% of w4+ haven fight-days),
  lethality (~93%/fight-day, crisis-independent on both anchors),
  succession structure (median tenure 1d; the chair re-seats and re-feeds
  the teeth), who fights (scholar, solo, 93%), who dies (the scholar), when
  it fires (reactive raids on wealth), how it ends ('fought' 228 /
  'moved-on' 29, 6-day valve).
- DOCUMENTED (for sim-findings.md by the coordinator — worker must not touch
  it): (1) 0/257 crises received foreign help — the comms chain's help half is
  unexercised by competent policies; (2) unpaired scholar attrition deaths
  (53, waves 1–3, longer tenures) — a second, slower chair-grinder worth its
  own DIAG; (3) wave-5 crises fire (3) with wave-5 unlocks now 2/24 — the
  unlock, not just the crisis, is reachable on the new base.
- NOTE: no dedicated aid-crisis canon doc exists (docs/ONTOLOGY.md §193–217
  covers the chain). Said explicitly per instructions, nothing invented.

## Metric review

- The pre-registered SECONDARY metric ("scholar haven-defense lethality per
  fight-day, crisis vs non-crisis") initially mis-fired: the first instrument
  had no fight-outcome anchor, so deaths were attributed by same-day fallback
  — the fallback attached the last same-day fight to any combat death,
  inflating both arms to ~90% with 126/140 spurious-looking attributions. The
  metric was right; the instrument was wrong. Fix: combat_end capture
  (result + php) with tele-order seq pairing — the rerun gave exact
  attributions (132 paired, 48 characterized-unpaired) and the same contrast
  survived the stricter anchor (92.7% vs 100%), so the finding is robust, not
  an artifact of the first instrument.
- RE-ANCHOR 2026-10-24: the old-anchor corpus did not reproduce on the new
  base, so the census was re-swept (anchor 471894c968bc) and the contrast
  re-derived: 93.5% vs 92.9% (139 paired, 53 unpaired). The finding survived
  its second instrument change AND a base change — it is now the most
  re-verified number in this DIAG.
- E4 RE-ANCHOR: the old same-day reproduction gate failed 4/6 on the new
  base (base changes moved trajectories: journey-establishment r31 preserver
  mapping, journey-crisis r47 siege composition). The gate was re-anchored
  to accounted-for + fully named on (a)(b)(c) for all six villagers, with
  the reproduced/diverged split reported in the test output — NOT loosened:
  a missing villager or an unnamed field still fails, and the divergence
  (2 reproduced, 4 diverged, each diverged death named with day/cause/opp)
  is stated in the evidence, not hidden. Same-day reproduction across a
  behavior-changing base was a stale assumption, not a design law.
- Proposed revision for the NEXT run: make combat_end pairing the standard
  death-attribution method in any future instrument (seq-ordered, lost/php<=0
  gate); retire same-day fallback for kill-attribution. The unpaired class
  (53 here) should be a first-class output, not a residual — it carries the
  attrition story. Death-row crisisActive should never be quoted alone on
  same-day-resolution crises (see the sense-check nuance above).

## Instruments (zero src/js)

- scripts/vetaidcrisis-instrument.js — crisis raise/resolve timeline, crisis-tagged
  combat_start/aidFight/combat_end rows (seq-ordered), death rows with
  crisisActive/isScholar/tenureDays/bloodTenure, mantleBecome successions.
- scripts/vetaidcrisis-sweep.js — 24-config census composer, pinned-substrate env
  guard, resume-safe, sha256-after-write.
- scripts/vetaidcrisis-analyze.js — PART 1 offline primary + PART 2 exact-pairing
  census analysis.
- scripts/vetaidcrisis-sense.js — per-crisis beat narratives for sense-testing.
- scripts/test-aidcrisis-b.js — E1–E5 ALL GREEN on the re-anchored corpus
  (corpus exists, zero instrument errors, determinism byte-identical on
  judged fields incl. fightEnds, attribution completeness, 6-death
  accounted-for re-verification — re-anchored 2026-10-24 from same-day
  reproduction to accounted-for + fully named, see metric review — GO
  contrast quantitative).
- Corpus: evidence/2026-10-24/perseed-aidcrisis/ (24 configs).
- Proof-test gate: ALL GREEN required and met before this evidence was written.

Branch sim-aidcrisis-b ready for ff-merge, re-anchored at 471894c96 (parent
be55cfc2c). Verdict DIAG-GO on the new base: attribution complete, contrast
93.5% vs 92.9%.
