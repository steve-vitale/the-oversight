# Journey-scale r110 — Lane A leg 3 SCALE (days 80–140): the feast-surge chain DIAG

**Run:** r110, scheduled Sat 2026-11-07 20:45 CST, ran 2026-11-08 ~03:11–05:15Z. Base `fc2cdb0b6`.
**Branch:** `journey-scale` (commit `7371a5962` instruments + proof 7/7; this note + analysis to follow).
**Zero src/js changes this run** (scripts + evidence only; gating freeze stands).

## Pre-registration (from `journey-scale-r110-prereg.md`)

**Question:** r109 (band 97001–97004) verdict was NO-GO — the wall is PRICING, not sitting:
`feastSurgeUsed` False on 4/4 seeds, every other lesser-seat bar met. r110 is a DIAG:
**where does the feast-surge chain break?**

Chain, read from code (no FEAST canon doc exists — noted in the prereg, not invented):
S0 `teachSentiment()` at the slot moment (t=60) → S1 keepsake held → S2 `channelSentiment`
arms at 3+ abilities at L3 OR `surgeResonance ≥ 35` → S3 `hostFeast` (Haven, dusk, 1/day,
pantry ≥ max(1500, 400×(heads+1))) → S4 `grantFeastBuff` (refuses if fusion reactor online
or unarmed) → S5 FEASTED 2 dawns → S6 `noteFeastedCombatUse` (strike/ability while feasted
in combat) → S7 `tableSeat` foodDeeds = sentimentTaught && feastSurgeUsed.

Pre-registered verdicts: FINDING (stall stage named per seed with counts) /
CHAIN-COMPLETES (surge marks on ≥1 seed) / INCOMPLETE (instrument fails to attribute).
Seeds 97001–97004, deliberate §15 reuse of the r107/r108/r109 band. DAYCAP=180, death-aware.

## Q1 verdict: FINDING — the stall is S3, the feast itself (the "eat first" gate), on 3 of 4 seeds — with a completing control seed that proves it

| seed | end | chain stall | sentiment | armed | maxRes | channels | feasts | maxGives7 | gives7okDays | fights (feasted) |
|---|---|---|---|---|---|---|---|---|---|---|
| 97001 | d122, all dead in combat, pop 0/0, pantry 12,192 | **S3-feast** | d13 | d19 | 220 | 132 | 0/0 | 800 | 0 | 49 (0) |
| 97002 | d61, scattered hungry, pop 4/4, pantry 0 | **S3-feast** | d9 | d25 | 45 | 56 | 0/0 | 0 | 0 | 4 (0) |
| 97003 | d83, all dead in combat, pop 0/0, pantry 1,450 | **S3-feast** | d10 | d15 | 116 | 78 | 0/0 | 0 | 0 | 24 (0) |
| 97004 | **d102, WON, pop 8/8, pantry 28,865** | **COMPLETE** | d16 | d27 | 138 | 96 | **1/1, d98** | **1,890** | **1** | 53 (1) |

**The mechanism, in plain words.** The feast the table counts only happens if the
village's head scholar has personally given the village at least 1,500 calories' worth of
food in the past week. On hungry bands the scholar gives almost nothing — they are eating
everything themselves just to survive (0 given on two seeds, 800 at most on the third).
So the feast never fires, the deed never marks, and the seat never gets priced. The
earlier stages all work fine on every seed: the lesson lands (d9–d16), the keepsake is
held from d2, the channel arms (resonance 45–220 against a 35 bar, 56–132 channels).
The feast plan itself was fine on 105 of 121 days on 97001 — the plan is not the wall.
The wall is the one gate that asks a hungry scholar to have donated 1,500 calories in a week.

**The smoking gun.** `gives7okDays` maps exactly to feasts and seats across the band:
0/0/0/1 → feasts 0/0/0/1 → seats none/none/none/lesser-sat. One metric, one day, one feast,
one seat, one win.

**97004, the day it happened (d98).** The scholar's giving crept up — 1,365 on d95–96,
then 1,890 on d97 (a haul donation crossed the line). On d98 the feast fired at dusk
(`FEAST ok=1`), the blessing was granted (`GRANT granted=1`), the scholar fought the
beast the feast drew while feasted, and the deed marked 13 times that day (`surgeUsed`
d98). The feast-day scholar died in the wild that same day, d98. Four days later the
successor sat the lesser seat (d102, taken by Liam Davis himself, beloved door,
strength 97, tie beloved/feared, 5 modal answers, drained, phase done, branch light)
and the run won — **the first sat seat and the first win on the scale driver.**
The r109 sit-and-modal drive is now exercised live (previewSeen 4, attempts 1, taken 1,
failed 0, guardRefused 0): r109's "sitting" half is GO on live evidence. The wall was
upstream at pricing all along, exactly as r109 judged.

**Lever target for the next run (a design call, NOT this run's change):** the
`recentGives7 ≥ 1500` gate, and/or enabling the surplus-feast path
(`COMPETENT_SURPLUS_FEAST`, off in the scale driver — the feast the village's shared
stores could throw). The design question: is the feast supposed to require the
scholar's *personal* donations, or should the village's shared stores count? Same
family as the pellet-bearer lock (a bearer who never hungers never triggers the village
feast; pellet-pass ruled 2026-11-07, build in progress). Win prices and deed gates stay
untouched unless Steve orders otherwise.

## Q2 census — the villages, in plain words

| seed | end | day | pop | pantry | rank path | seat | arc | seasoned peers |
|---|---|---|---|---|---|---|---|---|
| 97001 | all dead in combat | 122 | 0/0 | 12,192 | regional d33 → national d62 → global d63, stayed global | none | 3 | 4 (3 leads + 1 covenant) |
| 97002 | scattered, hungry | 61 | 4/4 | 0 | regional d28 | none | 3 | 1 of 3 |
| 97003 | all dead in combat | 83 | 0/0 | 1,450 | regional d41 | none | 3 | 1 of 2 |
| 97004 | **won** | 102 | 8/8 | 28,865 | regional d41 → national d80 → global d81 → **regional d99 (realm came apart)** | **lesser, sat d102** | 4 | 1 of 4 |

- **97001** was the strongest village of the band by standing — a global realm with four
  seasoned peers, pantry over 12,000 — and it still died fighting, not hungry. National
  staged d62 (lead 3/3), global the next day, and it held to the end.
- **97002** starved on the road: pantry 0 by d61, four people alive, nothing to eat. The
  scholar spent weeks walking to villages and studying them from 4–6 tiles away without
  ever closing — two pilgrimages stale-dropped after 14–15 days of evaluating from a
  distance (court-poor 37 days). The climb never completes.
- **97003** is the courtship grind: the scholar studied the *same* village 28 times, every
  other day for two months, before the link formed on d62. It works, but it eats a life —
  the village then died in combat at d83.
- **97004** climbed to global (d81), then the realm came apart on d99 ("no polity answers
  to Haven now") and fell back to regional — and the lesser seat still priced and sat
  three days later. The dissolve did **not** block the lesser seat. Dissolves this band:
  1. Re-stages: 0.

**Raise ledger, pooled:** seen-days 18, answered 12, linked 12, countered 0,
skipped-not-ready 0, skipped-no-raiser 3, not-offered 3, talk-failed 0, errors 0.
Proposed links formed 13/13. National gate: 97001 staged d62, 97004 staged d80;
97002/97003 never qualified (lead 1/3, 1/2).

**Q1 GATE (thirst):** dry=0 on all four seeds (wet walkouts 3/0/0/4). No departure was
blocked by thirst on this band.

## Q3 people check — do the villagers act like people?

**Transcripts read (3):** 97001 d90 (Eloá, Portuguese-only, trust 31 — the r97 framing fix
holds: "they grin, proud of the one English they know"); 97001 d120 (Diana, Twi-only,
bold, trust 89, convoCount 8, still no shared words — an honest long relationship
across a language wall); 97004 d90 (Liam Davis, farmer, steady, trust 90 — a real talk
about regrets: "I didn't say what I needed to say. To someone. Now I can't." / "I regret
the ordinary days I rushed through. All those Ames, Iowa mornings I spent annoyed at
small things. I'd pay anything for one annoyed morning now."). All three pass the sense
test: the NPC wants something, the exchange means something, endings resolve or plant.
**Liam Davis is the villager who took the lesser seat on d102** — the win has a human
face the scholar actually talked with.

**Raise talks read (15/15):** 12 accepted, 3 not-offered. **Senseless sittings: 0.**

Wrinkles, all cosmetic, all counted (carried, not fixed — no src changes this run):
- The accept echo — "All right. Let's ask them." appears as both YOU and THEM — in
  **12/12** accepted talks.
- The raise never voiced in 2/12: Maricela (97001 d14) and Caleb (97004 d32). Caleb's
  is the sharpest: he opens with a foraging invitation ("We're eating through stores
  faster than we replace them. Will you forage with me tomorrow? Two pairs of eyes,
  twice the ground.") and the scholar answers with the link-accept line while the
  system narrates "You carry the proposal to The Red Table." The foraging invitation
  is never answered; the raise line was never spoken.
- Post-accept close lines read like brush-offs after an agreement ("Oh — okay. Later,
  then.", "Sure. I'll be around.").
- 97003 d19 plants a thread with no resolution in this band: "There's still the matter
  of the murder of Rafael. Nobody's settled it." (A planted ending is good per the bar;
  whether the murder ever resolves is the open part.)

**Mutlaq — carried design question, sharper now.** On 97002 the same no-shared-words
raiser (Mutlaq, Arabic-only) was selected three days running (d14, d15, d16) and the
talk could never be offered. The not-offered outcome is correct — no fabricated shared
history — but the selection does not learn from the failed attempt. Design question for
Steve, still open: should raiser selection skip villagers with no shared language, or
should the proposal find a non-verbal way across?

## Reachable / fun / winnable

- **Reachable:** the chain is reachable in the code path (S0–S2 fire on every seed,
  56–132 channels), but the S3 gives gate makes the seat unreachable on hungry bands
  (0 gives-ok days on 121/61/82 days). A real player who donates reaches it; a player
  who eats everything to survive never will.
- **Fun:** the 97004 arc — feast, gavel fight, deed, the feaster's death, the successor
  sitting the beloved door — is the game working as designed, and the Liam talk is the
  kind of moment the game is for. The 97002/97003 arcs (weeks of distant studying; 28
  repeat studies of one village) are grind, not fun.
- **Winnable:** YES, now demonstrated on the scale driver — first sat seat and first
  win (lesser, beloved door, d102). The chain from feast to win is proven end-to-end
  on one seed; the blocker is the gives gate's rarity, not the sitting. The full seat
  is still unproven on this band (lesser only; the realm dissolved before a full seat
  could price).

## Telemetry deviation check

Command: `telemetry-check.js --baseline …/telemetry-baselines/scale.json --current
'…/journey-scale-r110-trust-*.json' --metrics firstCourt,watchers,tableTele,
fightsTotal,fightsByWave.4,maxGameDay`

Three LOUD lines, all the **known shape artifact** (same as r109): `fightsTotal`,
`fightsByWave.4`, `maxGameDay` "disappeared" (baseline → current 0). Verified: the
scale driver's census never emits those keys — they are absent from all four trust
JSONs by design; the equivalent data lives in `feastChain.fights` (49/4/24/53) and
`census.day` (122/61/83/102). **Baseline NOT rolled forward.** Proposed tooling fix
for the next run: emit the three keys from the scale driver census so the check can
actually compare.

## Tests

- Proof `scripts/test-journey-scale-r110-feastchain-20261107.js`: **7/7 green**
  (first run 6/7 — test bug, strictEqual on two fresh `{ok:true}` literals, fixed with
  a sentinel object; re-ran 7/7, including a live smoke leg seed 97001 DAYCAP 60,
  0 instrument errors, feast-chain rows present).
- Pilot gate (seed 97001, DAYCAP 180): passed, no crash, errors 0, reggate rows 116.
- `check.js --quick`: first attempt **timed out at 600s** (290 scripts, 4 parallel;
  ~112 passed, 1 F visible before the cutoff). Background re-run with a 1500s cap
  **completed: 279 passed, 11 failed in 1490s** (`check exit:1`). The 11: proof-freshness
  (`test-measurement-proof-update`, `test-measurement-workflow` — "proof source inputs
  are not current" / neutrality proof does not cover current inputs), phone-frame
  receipt stale (`test-phone-frame-proof` — index.html), cache-flag isolation
  (`test-measurement-cache-flags`, 4), mobile combat cadence (`test-mobile-combat-cadence`,
  2), `test-occupation-panels` (CLI workflow), `test-trust-observer-neutrality`
  (error), three 120s timeouts (`test-synergy-stall`, `test-throttlefeast-20261014`,
  `test-capable-bot-20261014`), and `test-establishment-r20-fixes-20261020` (racks-full
  voice gate: next-day re-voice expected 2, got 1). The r114 gate was 284/6, so this
  is 5 more failures — but **none of the 11 touch this run's changes**: r110 changes
  zero src/js (only the feast-chain instrument/driver/analyzer/proof + evidence),
  and master has moved since r114 (fightloop + xphalf + deepening-r118 landings),
  which is what stales proofs and receipts. The delta is master drift since the last
  adjudicated gate, not a regression from this branch — but it is **not** re-adjudicated
  here, and the ship loop owns the fresh gate. Reported honestly; the merge below is
  scripts+evidence only and does not change the game's test state.

## Metric review

1. **Analyzer stall label (fixed in-run, analysis re-generated).** 97004 was first
   labeled S5-window because `feastedDays=0` in the daily snapshots, though the grant
   fired and the deed marked. Two causes: the stall logic checked feastedDays before
   deeds, and the snapshot missed the window because the feaster died the same day
   (the successor's d98 snapshot reads feasted=0, gives=0, but surgeUsed=1 —
   succession carries the deed, not the buff or the giving record). Fixed the analyzer
   (deed/surge checks before the feasted-days check; S5-window now means grants with
   no deed AND no feasted day observed) and re-ran; 97004 now reads COMPLETE and the
   analysis file in this commit reflects the fix. Lesson: snapshot-based "observed
   live" checks are fragile across succession — deeds and surgeUsed are the durable
   marks. Open instrument question, unverified: whether the buff is *supposed* to die
   with the feaster, or carry to the successor.
2. **Verdict taxonomy gap (proposal for the next run, not a re-score).** The prereg's
   CHAIN-COMPLETES branch said "the wall is elsewhere" — wrong for a mixed band where
   three seeds stall and one completes *and wins*. The completion proves the stall is
   the wall. Proposed revision: add a FINDING-WITH-CONTROL verdict (stall named on
   ≥1 seed + a completing seed that proves the stall is the wall). Judged as FINDING
   under the prereg (stall named per seed: S3 ×3, COMPLETE ×1).
3. **"deeds" counts `noteFeastedCombatUse` calls (13 on d98), not markings** — the deed
   marks once (idempotent spend); `surgeUsed` d98 is the marking. Keep the count, label
   it calls.
4. **`gives7okDays` is the metric that mattered** — it maps 1:1 to feasts and seats.
   Keep it as the headline S3 metric for the next run.
5. **Telemetry metrics don't exist in the scale driver census** (see above) — add them
   next run so the deviation check can compare.
6. **r97 hydration drain, carried:** overnight drain on this band is small
   (first-attempt avg 1.3 on 97001, 0.4 on 97002; retry avg −0.8 on 97003) — the
   ~58–64 first-attempt drain from r97 does **not** reproduce here. The scholar drinks
   during the morning before the snapshot, so the drain metric as instrumented mostly
   measures post-drink hydration. Still open as a question, but this band's data says
   the overnight drain is not the 58–64 shape, and no departure was blocked by thirst.

## Notes for the next run

- The lever is the S3 gives gate (or the surplus-feast path). That is a design/Steve
  call — the feast-as-gate design brief (approved 2026-11-07 19:28 CST, staged Standing
  ladder, feast demoted to an optional bundle deed) may supersede this gate entirely;
  check whether that build has landed before re-testing the gives gate.
- Rotation: this run played leg 3; write **3 → 0** and verify by re-reading — r108
  and r109 both claimed to write it, but the file still read 3 at this run's start.
- A sibling Lane A establishment-r110 run wrote files into `evidence/2026-11-07/`
  during this run (dated Nov 8 03:15) — master may have moved since base `fc2cdb0b6`;
  check the master tip before merging and rebase if needed.

## Files

- Prereg: `evidence/2026-11-07/journey-scale-r110-prereg.md`
- Instrument: `scripts/feastchain-instrument-20261107.js`; driver:
  `scripts/journey-scale-r110-20261107.js`; analyzer:
  `scripts/analyze-journey-scale-r110-20261107.js` (stall-logic fix in this commit);
  proof: `scripts/test-journey-scale-r110-feastchain-20261107.js`
- Evidence: `evidence/2026-11-07/journey-scale-r110/` (4 trust JSONs, 15 raise talks,
  3 transcripts, feast-chain rows), `journey-scale-r110-pilot.log`,
  `journey-scale-r110-band.log`, `journey-scale-r110-analysis.txt`
