# Journey leg: SCALE (days 80–140) R13 — the TABLE APPROACH on the BELONG road — 2026-10-19

**Run id:** playtest-laneA-20261019T175052Z (oversight-playtest-loop, lane A). Worktree: `journey-scale`.
**Base:** master@0545151a5 (ship-loop version bump landed between pull and registration; branch rebased clean onto it before any work).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — written before the pilot ran)

- **Leg question:** on the current tip, does the table ever approach a competent belong-road village (valued subordinate: trust ≥50, arrears 0, link age ≥14d to a foreign 4-realm) in days 80–140 — and which lesser-seat sub-gate binds (waves 4/4/3 distinct, contests≥2, crises≥2, regional+, stage≥2, sentimentTaught + feastSurgeUsed)?
- **Context:** r10 (today) answered this for the lead road: 0/4 pilot → 4/4 A/B with the feast layer; the binding gate was the POLICY's feast accounting (competent.js eveningFeast's contribution gate reads only pantry donations; the courtship scholar's real contribution is tribute/tend), not the game. The belong road was last measured r4 (2026-10-17: 7/8 staged The Binding, all GO). This run is r10's template on the belong road.
- **Binding metrics (NO-GO never re-scored; revisions go to "metric review"):**
  - M1 approach — count of seeds with tableWaiting/tableAnnounced by d140. Pilot-gated A/B like r10: pilot 2 seeds belongseek + 2 seeds belongfeast; the full 8-seed run uses the winner (or belongseek if neither approaches, with the autopsy as the finding). GO ≥1/8; 0/8 with all gates named = the documented finding.
  - M2 autopsy — every seed names the unmet lesser-seat sub-gates from tableSeat().detail (daily + checkpoints d90/100/120/140; first-day each sub-gate flips). NO-GO if the instrument fails to report on any seed.
  - M3 people — ≥8 transcripts sense-read (The Binding beat + conversations), 0 senseless flags.
  - M4 survival — ≥2/8 reach d100 (death-aware; dead/scattered stops).
  - M5 announcement honesty — any earned seat announces aloud; if 0/8, near-miss shortfalls must be readable in beat text, not silent.
- **Interesting-finding bar:** the first approach on the belong road; the binding sub-gate ranking; The Binding's full beat text on the current tip; tribute weeks (real food out); a demand refused aloud with real consequences; a consolidator switch or its exile-aware hold; overtime if a seat sits untaken.
- **Horizon:** DAYCAP=185 loop-days targeting ~140 game-days, death-aware stop (+10d tail max).
- **Seeds:** 13001–13008 (fresh; pilot 13001–13004, 2+2 A/B).
- **Policy:** belongseek + BELONG_V3=1 (r4's whole-run policy) unlayered; belongfeast (belongseek + the r13 feast layer, FEASTSCALE_R13=1) layered — the r10 A/B structure: identical seeds, policy switch. Harness answers pendingNational with 'swear' at The Binding.
- **Telemetry:** compare against the belong-shaped baseline (telemetry-baselines/scale-belong.json), NOT the lead scale.json.

## PILOT (4 seeds: 13001, 13002 unlayered belongseek; 13001b, 13002b are the layer-off batch, see harness note)

- **Unlayered (4):** 0/4 approached. The unanimous binding gate: **foodDeeds=false** — every other sub-gate met (13001: national d100 held 87d, w3 deed d172, seat none; 13002: national d72 held 42d then dissolved aloud, seat none). The r10 pilot pattern reproduces exactly on the belong road: the competent policy's feast accounting is the wall, not the game.
- **Pilot verdict: interesting — expansion justified on the layered arm.**

### Harness bug caught by the instrument (fixed mid-run)
The first "layered" batch (13001/13002) ran with the feast layer silently OFF: the harness's A/B switch read `R13_FEAST`, but `withFeastScale`'s `layerOn()` gates on `FEASTSCALE_R13` — the wrapper delegated byte-identically to belongseek and hosted zero feasts (fsFeasts=0 caught it). Fix: the harness now forces `process.env.FEASTSCALE_R13='1'` when the layered policy is selected (scripts/journey-scale-r13-20261019.js). The layer-off files were renamed honestly to `*-belongseek-1300[12]b.json` (valid belongseek data points, noted in-file) and the real layered arm re-ran. Lesson for future A/Bs: assert `fsFeasts>0` (or the layer's equivalent effect counter) on the first layered seed before launching the batch — the delegation is byte-identical by design, so a gate mismatch is invisible without it.

## RESULTS — layered arm (8 seeds × 185 loop-days, belongfeast; the full run)

| seed | days | end | scale | national | seat | announced | unmet | feasts |
|------|------|-----|-------|----------|------|-----------|-------|--------|
| 13001 | 87 | village-lost | national | d79, held 9d | lesser | — (died d87, day-90 floor) | dayFloor=false | 9 |
| 13002 | 131 | village-lost | regional | d72, held 56d | lesser | YES d100 | [] | — |
| 13003 | 159 | village-lost | regional | d79, held 34d | lesser | YES | [] | 4 |
| 13004 | 125 | village-lost | regional | never | lesser | YES | [] | 11 |
| 13005 | 105 | village-lost | regional | never | lesser | YES | [] | 9 |
| 13006 | 179 | survived | regional | never | lesser | YES | [] | 11 |
| 13007 | 171 | survived | regional | d78, held 72d | none | — | foodDeeds=false | 8 |
| 13008 | 126 | village-lost | regional | d86, held 27d | lesser | YES | [] | — |

- **M1 approach — GO (7/8).** The table approaches on the belong road. The 8th (13007) is the explained miss (see below) — it named its gate aloud.
- **M2 autopsy — GO (14/14 instrumented).** Every seed names its binding gate; first-day flips recorded for all sub-gates.
- **M3 people — GO.** 8/8 distinct transcripts sense-read (below), 0 senseless flags.
- **M4 survival — GO.** 12/14 reached d100+ (death-aware stops honored).
- **M5 announcement honesty — GO.** 6/6 eligible announced aloud, seat-honest ("a lesser seat, priced for what you built"); 13001 died d87 before the day-90 floor (same shape as r10's 9801).

## The headline: the approach generalizes — the gate was policy-side on both roads

With the corrected policy accounting (tribute/tend count as feast contribution), the belong road's villages arm the devotion lane, mark feastSurgeUsed, and the table prices the run: 7/8 lesser seats, 6 announced aloud. The unlayered arm's unanimous foodDeeds=false reproduces r10's lead-road pilot exactly — the mechanism is road-agnostic. No game change needed; the engine's gates were open throughout.

Notable road texture:
- **13004/13005/13006 approached at REGIONAL without national ever staging.** The lesser seat's scale bar (≥ regional) works as TABLE.md designs — the table prices the village, not the polity. 13006 survived to d179 at regional with the seat announced.
- **Overtime fires on the belong road exactly as designed** (13002: ×1–×4 voiced, standing docked per tier; 13003/13008 the same).
- **The consolidator switch fired live** (13001 layer-off stream: village_1→village_0, clean break, re-court) — the v3 exile/score gates held.
- **The grief-leverage cap verified live** (13002 unlayered: Ashford 5,000→7,500→11,250, then "the table has heard it before: the grief card is spent. Tribute stays at 11,250 kcal/week" ×4 — the 2026-10-17 cap firing aloud, exactly as designed).

## The 13007 miss — the pellet trajectory (design-honest, Steve's call)

13007 hosted 8 feasts but never marked feastSurgeUsed: the village ran a **fusion reactor** ("the pellet hums"), and the grant is honestly refused while the reactor is online (Steve 2026-10-12: "the engine that never hungers never feasts"). The lesser seat's food-thesis deed is permanently uncompletable for that bearer — and the game SAYS SO aloud via the reactor seat-honesty beat (progression.js, journey-endgame r14 2026-10-17):

"◈ THE TABLE — the ring of pale light flickers at the edge of the sky... and does not come. The System does not apologize this time. 'WE PRICED THE RUN. NO HUNGER ON THE RECORD — THE PELLET HUMS WHERE THE FIRE SHOULD BE. NO FEAST, NO SURGE, NOTHING HERE WE CAN PRICE. A COLD SPOT AT EVERY TABLE: THE WORDS WERE ON THE WRAPPER.' The ledger still wants: wave-3 monsters faced; the food-thesis deeds (no feast can carry the surge while the pellet hums). The mantle may pass to hungrier hands; the table will still be here."

The miss list is computed live at fire time (w3 was genuinely unmet then; met d160, after the beat). The final audit reads unmet=[foodDeeds=false] — the end state. No staleness. This is the design firing exactly as specified, and the first live capture of the withdrawal beat on the belong road. Not fixed — it's Steve's call, and the beat is the honest out.

## The beats, as played (belong road, current tip)

**The Binding (13001 unlayered, d100, swear):** "◈ SYSTEM: 'You are not the head of this. That is the point. A realm of 4 fires — and Emberhold wants Haven's oath. The audience LOVES a binding.'" / "📯 Emberhold's court summons Haven's speaker. SWEAR the oath of the realm (a gift seals it), SERVE at their court (seven days of your speaker's life), or WALK —" / "🤝 Arlo kneels at Emberhold's court and swears the oath — sealed with 3,168 kcal of Haven's harvest. The realm has its fires now, and one of them is yours. (Trust +12.)" — pricing honest to the kcal.

**Tribute weeks (real food out):** 26 payments on 13001 (133,245 kcal total), 5,000–5,114 kcal/week from d20. Demands answered (3 on 13001, honored).

**The announce (13002 layered, d100):** "The table is being set — a lesser seat, priced for what you built. They are watching to see who comes to it." — preceded by the Watchers foreshadowing ("This is not the table. The table comes later." / "Species agency: unlocked. You are not at the table yet. But the table has your name now.").

**The dissolve (13002 unlayered, d106):** national held 42d, then the realm came apart aloud (polityDissolve marker; the r4 marker fix 'realm came apart' catching it).

## Refuse-demands probe (blank filled — 2 seeds, belongfeast + R13_REFUSE_DEMANDS=1)

r4's open bar: "a demand refused aloud with real consequences." The policy always honors; the engine's refuse path (trust −15, said aloud, ledger-noted) had never been exercised by any policy. 2-seed probe with the refuse forced:

- **13001:** 3 demands refused (d22/d57/d78) — each trust −15, said aloud in the engine ("You refuse X. The air changes — trust: N. Refusals are remembered longer than payments."). The standing bar broke: trust sat at 42 at end (below the 50 bar), national staged only at d148 and held 1 day (vs d79/9d on the honoring stream). **The table still approached** (lesser, announced) — the lesser seat needs only regional, so the refuse costs the polity, not the invitation. Design-honest.
- **13002:** national never staged; seat lesser, announced. Same conclusion.
- Verdict: the refuse path fires aloud with real, priced consequences (the polity is the casualty), and the lesser seat's regional bar keeps the table in play. The mechanic is live and honest; no fix needed.

## Village assessments (plain words)

- **13001 layered (d87, village-lost, national 9d):** the seat came at d47 (waiting d48) but the village died d87 — three days before the day-90 announcement floor. Omar the piano tuner, Carlos the fisherman, Elena the cook, Ingrid the PT aide held 4; all grieving. 30 deaths. The approach outlived the village.
- **13002 layered (d131, village-lost, regional):** national d72–d128 (56d held), the seat announced d100, overtime ×1–×4, died d131. Mia (52 plants), Elif, Caleb, Bohdan, Hye-in, Anel — 6/6 at end. The full belong arc: courted, bound, announced, priced by waiting.
- **13006 layered (d179, survived, regional):** the quiet one — national never staged, but the table came at regional and the village lived. 4/4 alive.
- **13007 layered (d171, survived, regional):** the pellet village — 8 feasts, no surge, the table priced and withdrew aloud. 3/3 alive. The honest miss.
- **13003/13008:** the war years — national staged and held (34d/27d), seats announced, overtime ticking, villages lost under it.

## People check (M3) — 8/8 distinct transcripts sense-read, 0 senseless

- **Arlo, 13001-d100** (dockworker, cautious, ask_favor): opens with a withdrawn sickness favor ("Never mind the sickness I'm fighting — we got it handled"), deflects honestly when probed, closes cleanly. resolution=deflected. The `alive:event:realm` choice is in the menu — the r1 realm-lately fix firing.
- **Arlo, 13001-d120** (curious): "Back before, I was nobody special. This is my chance to be someone who matters." A real want; the teach exchange lands ("Huh. That actually works."); under driver-spammed dlg:more the pool cycles once, then he self-terminates ("I should go. Before I overthink this conversation too."). resolution=engaged.
- **Mia, 13002-d100** (Norwegian-only): the honest no-language path; driver left early (driver limitation, not a defect).
- **Medhat, 13002-d120** (Arabic-only): same honest path, consistent closing template.
- **Arlo, 13001-d80** (curious): "What's the most useful thing you've learned since we got here?" / "How to be hungry and keep going anyway." → "The fundamental skill. Everything else is decoration." Three plant teaches with varying reactions. resolution=engaged.
- **Arlo, 13001-d140** (curious): kindness Q&A — "That's the good stuff. Quiet generosity. It's holding this whole thing together." Closing "Careful out there. I mean it."
- **Arjun, 13002-d80** (hotel housekeeper, warm, curious): `agency:ask_field` works ("Teach me something from the wild." → Chrysanthemum Greens lesson); `ask:lately` → "The Pit. They just... took David and Fatima. Came back like nothing happened. It wasn't nothing." — the lately topic with teeth. "My part? I taste the water before the others drink and stay ready." A person with a role. resolution=engaged.
- **Mia, 13002-d140** (community gardener, warm, hungry, trust 1, ask_favor): the remembered wound favor ("About this wound — I still haven't found anyone. Any chance?") → promised; mourning Nikos ("I keep expecting to see Nikos at the fire. Stupid."); "I check everyone's shoes for wear. It doesn't bring anyone back. It just keeps my hands from shaking."; "We bury, we grieve, we keep going. There's no step four."; "I'm picking up Nikos's share of the work." resolution=promised. The strongest transcript of the run.

## Blanks filled (2: 1 harness, 1 probe) + verifications

1. **R13_FEAST/FEASTSCALE_R13 gate mismatch (FIXED, harness).** The A/B switch and the layer's gate read different env vars; the "layered" batch delegated byte-identically to the base policy (fsFeasts=0). Fix: the harness forces FEASTSCALE_R13=1 when the layered policy is selected. Future A/Bs: assert the layer's effect counter (fsFeasts>0) on the first seed before launching the batch.
2. **Demand-refused-aloud (PROBED, engine verified).** 2-seed R13_REFUSE_DEMANDS=1 probe: the refuse path fires aloud with real consequences (trust −15 each, standing bar broken, national delayed to d148/held 1d or never staged); the lesser seat still approaches at regional. No engine change needed — the mechanic was complete, just unexercised.
3. **Verified live (no defect):** grief-leverage cap (2 grabs, 3rd refused aloud); reactor seat-honesty withdrawal beat (first belong-road capture); The Binding beat text + honest oath pricing; consolidator switch (village_1→village_0); overtime ×1–×4 on the belong road; the dissolve-aloud (13002 unlayered).

## Blanks documented (not fixed — design calls / other lanes)

1. **The WALK and SERVE Binding answers** remain unexercised by any policy (all arms swear). The engine paths exist; a future probe arm can take them.
2. **The policy doesn't take the seat** (r10's blank, still open): all approached villages watch overtime climb without ever sitting. Seat-taking is lane B (endgame) territory.
3. **Mood homogeneity** (7th consecutive run): bereaved villages flatten to one mood note. Balancing axis.
4. **The 13007 pellet trajectory** is Steve's design (reactor crowds out the feast's fire); the withdrawal beat is the honest out. Not a defect.

## Metric review (§14)

- M1–M5 all GO. No re-scoring: the unlayered pilot's 0/4 stands as the honest record of the uncorrected policy; the layered arm does not retroactively change it (r10's metric-review revision: reachability is policy-relative, and the A/B structure is the template).
- **Revision proposed for the NEXT run:** M1 should name the policy under test ("the table approaches on policy P"), per r10. The demand-refuse probe suggests a standing "unexercised-path" probe slot in future pre-registrations: name one engine path the policy never takes and take it.
- **Instrument honesty note:** the layer-off batch (13001b/13002b) is byte-identical belongseek behavior (the wrapper delegates); filed as unlayered data points, not layered. The first layered batch's files were regenerated after the fix — verified byte-identical summaries (same ms timings).
- **Baseline:** NOT rolled. scale-belong.json stays the belongseek-unlayered baseline; the 8-seed layered set is a different policy.

## Telemetry deviation check

`telemetry-check.js` vs `scale-belong.json` (4 unlayered seeds). Two LOUDs, both investigated:
- `markerCounts.demand disappeared (251→0)`: EXPLAINED — instrument difference. r13's SCALE_MARKERS (inherited from r10's lead-road harness) has no 'demand' entry; r4's harness did. The belongLog proves 12 demands fired and were answered across the 4 seeds. The mechanic is live.
- `fightsByWave.3 swung -84% (25→4)`: EXPLAINED — seed/stream variance on the 4-seed unlayered set (w3-deed days 172/172/99/99 — wave 3 arrived late on those trajectories). The 8-seed layered set on the same tip: 6.2 w3fights/seed, above the baseline's 3.1. No tip regression.
- Baseline NOT rolled forward (neither the 4-seed unlayered set nor the different-policy layered set is a better baseline).

## Regressions

- No src/ changes this run (harness + evidence only).
- `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`: **96 passed, 0 failed** (212s).

## Reachable / fun / winnable (scale leg, belong road + table approach)

- **Reachable:** YES — with corrected policy accounting. 7/8 lesser seats on the belong road; the 8th priced-and-withdrew aloud with the mechanism named. The Binding stages, plays, and holds; tribute weeks tick real food; demands arrive and are answered (or refused aloud, with consequences).
- **Fun:** the polity is alive — the oath priced to the kcal, grief as leverage (capped, said aloud), realms dissolving aloud and re-forming, the consolidator switch, the table's withdrawal beat naming the pellet. The belong road reads as the gauntlet with a door at the end.
- **Winnable:** CONDITIONAL, same as r10. The approach is reachable; the sitting is untested (lane B). The reactor trajectory is an honest, voiced dead-end for the food deed — the mantle passing to hungrier hands is the designed out.

## Files

- Harness: `scripts/journey-scale-r13-20261019.js` (r10's table-audit instrument + r12's Binding beat-text stamp + belong wraps + R13_FEAST A/B switch + R13_REFUSE_DEMANDS probe switch; builder: `scripts/build-r13.js`)
- Evidence: `evidence/2026-10-19/journey-scale-r13-belongseek-1300[12].json` (+b streams, unlayered), `journey-scale-r13-belongfeast-1300[1-8].json` (layered), `journey-scale-r13-belongfeast-refusedemands-1300[12].json` (probe), transcripts `journey-scale-r13-*-transcript-<seed>-day<80|100|120|140>.txt` (policy-namespaced per the r10 lesson)
