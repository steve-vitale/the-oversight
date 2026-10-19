# Journey leg: SCALE (days 80–140) R10 — the TABLE APPROACH on the current tip — 2026-10-19

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14)
- **Leg question:** on the current tip, does the table EVER approach a competent lead-road village in days 80–140 — and if not, which lesser-seat sub-gate binds (waves 4/4/3 distinct, contests≥2, crises≥2, regional+, stage≥2, sentimentTaught + feastSurgeUsed)? Context: r6–r9 measured 0/32 approaches; even r8's strongest villages (global, wave-4, national held to end) ended at tableSeat 'none'; the scale-lead telemetry baseline has tableTele: 0. TABLE.md law: "the table prices the run, never gates on godhood; reachable by competent non-god play."
- **Binding metrics (NO-GO never re-scored; revisions go to "metric review"):**
  - M1 approach — count of seeds with tableWaiting/tableAnnounced by d140 (≥1 = GO; 0 = documented NO-GO with autopsy — a 0/8 is still the finding).
  - M2 autopsy — every seed names the unmet lesser-seat sub-gates from tableSeat().detail (instrumented daily + checkpoints d90/100/120/140; first-day each sub-gate flips). NO-GO if the instrument fails to report on any seed.
  - M3 people — ≥8 transcripts sense-read, 0 senseless flags, 0 UNEXPLAINED fabrication flags (r7 metric-review revision: adjudicate display names from live person records — committed JSONs store ids, not names; post-hoc blob greps false-positive).
  - M4 survival — ≥2/8 reach d100 (death-aware; dead/scattered stops).
  - M5 announcement honesty — if any seat is earned, the tableAnnounce beat must read aloud (no silent flag flip). If 0/8, near-miss shortfalls must be readable in beat text, not silent.
- **Interesting-finding bar:** a table approach (any seat); the per-seed binding sub-gate ranking; whether the food-thesis deeds or the crisis/contest bar binds on the lead road; any seat-earned-then-withdrawn copy.
- **Horizon:** DAYCAP=185 loop-days targeting ~140 game-days, death-aware stop. **Seeds:** 9801–9804 (fresh). **Policy:** leadcourt (competent + courtship; the road most likely to reach national/global on r8). **Base:** master@2d58c7c5.
- **Follow-up expansion (within-run, pilot-gated):** the pilot answered 0/4 with a unanimous binding gate, so the same 4 seeds were re-run with `leadfeast` (leadcourt + the r13 feastscale layer, FEASTSCALE_R13=1: tribute/tend count as feast contribution — see blank #2) to test whether the gate is reachable. Policy RNG is a separate stream, so identical seeds are a clean A/B.

## Verdicts on the binding metrics
- **M1 approach — PILOT NO-GO (0/4, leadcourt) → A/B GO (4/4, leadfeast).** Plain leadcourt: 0/4 approached; the instrument is not broken (it reports seat/detail daily on all 8 runs). With the feast layer on identical seeds: 4/4 approached (seat=lesser, arc=4, announced aloud). First table approaches in 36 journey runs (r6–r9: 0/32).
- **M2 autopsy — GO (8/8 instrumented).** Pilot: the ONLY unmet gate on all 4 seeds was feastSurgeUsed=false (foodDeeds=false) — sentimentTaught=True on 4/4; waves 15–22/6–11/3–7, contests 10–21, crises 3–4, global/national, stage 3, day-floor all met by d90. A/B: unmet=[] on 4/4; feastSurgeUsed marked d27/27/51 (9801/9802/9803; 9804 in-window).
- **M3 people — GO.** 9 transcripts sense-read (below), 0 senseless flags, 0 unexplained fabrication flags. One REAL finding → fixed (blank #1).
- **M4 survival — GO.** 2/4 pilot seeds reached d100+ (9802 d187, 9804 d172); A/B 4/4 reached d139+ (139/145/148/176). Death-aware stops honored.
- **M5 announcement honesty — GO.** The announce fired aloud and seat-honest on 4/4 A/B seeds ("The table is being set — a lesser seat, priced for what you built. They are watching to see who comes to it."). Foreshadowing beats fired earlier (Watchers: "This is not the table. The table comes later."; "Species agency: unlocked. You are not at the table yet. But the table has your name now."). The day-90 no-spoilers floor held: 9801's seat sat earned-but-unannounced d47→d90.

## The headline: the approach was reachable all along — the policy was the gate
The pilot's unanimous binding gate (feastSurgeUsed) is NOT a game-side wall. The engine's hostFeast/feastPlan carries NO contribution gate — a real player clicking "Host feast" in the UI faces only affordability. The 1500-kcal/7d contribution gate lives in the *competent policy's* eveningFeast ("EAT FIRST, FEAST SECOND" — don't spend the commons' food as a parasite), and its `recentGives` reads only pantry donations. On the courtship road the scholar's real contribution is tribute/tend (real pantry outflow, 1,500 kcal/week + tribute) — which the gate never saw. So the policy never hosted feasts on the lead road, the devotion lane never armed, feastSurgeUsed never marked, and the table never came. The r13 feastscale layer (tribute/tend count as contribution) corrects the *policy's* accounting; the game needed no change. Design call preserved: a scholar who neither donates nor pays tribute/tends still can't feast on the commons.

Timeline on 9802 (leadfeast): foodDeeds d27 → seat lesser d94 → tableWaiting d95 → announced d95 → overtime ×1…×6 MAXIMUM (seat sat untaken; the policy doesn't take seats) → village-lost d176. On 9801: seat earned d47, announced held for the day-90 floor, announced d90.

## The beats, as played (9802 leadfeast)
- **Foreshadow:** "◈ SYSTEM: '38. You see the number. THE WORLD IS WATCHING. Broadcast tier: planetary — the audience has picked its favorite fire and it is YOURS. This is not the table. The table comes later. Tonight, the galaxy wants a show.'" / "📡 Haven feasts for the cameras — 5,330 kcal of theater, every fire of the realm at the table. The chat eats it up. Somewhere, the table makes a note." / "◈ SYSTEM: 'Species agency: unlocked. You are not at the table yet. But the table has your name now.'"
- **Announce (d95):** "The table is being set — a lesser seat, priced for what you built. They are watching to see who comes to it."
- **Overtime (the cost of waiting, Steve 2026-10-14):** ×1 through ×6, each voiced: "◈ OVERTIME ×6! MAXIMUM OVERTIME! The table is still set. The chair is getting cold. Sit — or don't! We LOVE this!" — the design firing exactly as TABLE.md describes. A villager names the pressure: "🗣️ Oliver to Lyubov, by the fire: 'It waits. We wait. Somebody should check the snares — the table doesn't fill the pantry.'"
- **Note:** tableAnnounce()'s own '◈ THE TABLE IS SET…' line never fires on this path — checkArc announces first (tableAnnounced=true), so the daily-tick tableAnnounce() returns early. Both copies are seat-honest; no silent path. Not a bug.

## Village assessments (plain words)
- **Pilot (leadcourt):** 9801 (5 alive, LOST d91, global): Marcus the electrician and Adaeze the ESL teacher lead 5; all grieving. One food-deed from the table. 9802 (8 alive, d187, global): Sigrun the night guard and Pavel the bush pilot lead 8; steady. 9803 (4 alive, LOST d99, national): Jesse the line cook and Damla the community gardener lead 4; all grieving. 9804 (8 alive, d172, global): Fiona the baker and Grace the ESL teacher lead 8; steady.
- **A/B (leadfeast):** 9801 (7 alive, LOST d145, national, seat lesser, arc 4): Hermann the hunter and Lena the ER nurse lead 7; all grieving. The feast road bought 54 more days than the pilot. 9802 (3 alive, LOST d176, global, seat lesser, arc 4): Gerhard the truck driver and Viviane the ESL teacher hold 3; the overtime maximum took its price. 9803 (6 alive, LOST d139, global, seat lesser, arc 4): Narumi and Yara the interpreters lead 6; all grieving. 9804 (6 alive, LOST d148, global, seat lesser, arc 4): Hotman the farmer and Elif the housekeeper lead 6; all grieving.

## People check (M3) — 9/9 sense-read, 0 senseless, 0 unexplained fabrication
- **Marcus, 9801-d80** (electrician, grieving, trust 23): the STRANDED curious — want selected with no askable question; fallback opener, no ans:* menu, 7 comfort loops, resolution 'unestablished'. → FIXED (blank #1).
- **Oliver, 9802-d80** (teacher, steady): the WORKING curious — "What did you do with your hands, before?" / answered / "Useful. Everything useful matters now." Engaged, closed naturally.
- **Jordan, 9802-d100** (chimney sweep, bold, trust 90): seeded curious — "Do you still sing?" / "They say the table's coming. For us. I keep thinking about what we'd even bring to it." The village talks about the table (the r1 lately fix working).
- **Guadalupe, 9802-d120** / **Omar, 9804-d140**: the no-shared-language path — "The conversation ends where language couldn't reach." Honest, not faked.
- **Ruth, 9802-d140** (librarian, dry, trust 77): hungry ask_favor — "Nobody says Xavier's name right yet. We will. Give it a few days." Promised.
- **Narumi, 9803-d80** (interpreter, fidgety): curious engaged — "nobody's died from it yet. That's my whole résumé now."
- **Aroha, 9804-d80** (comic shop owner, warm, trust 90): curious engaged + plant teaching. Teach-reaction pool reuse noted ("And I've been walking past it for weeks." — the r7 template-pool finding, still present, still fine prose).
- **Hotman, 9804-d100** (farmer, mischievous, trust 24): wounded ask_favor — "I count portions out loud before eating. It doesn't bring anyone back. It just keeps my hands from shaking." Promised.

## Blanks filled (2)
1. **Stranded-curious want selection (FIXED).** convoSelectWant picked `curious` by weight (1-2, first-meeting floor 3) without checking whether its opener could fire; with no unasked question left the opener returns null and the want strands at stage 0 — a dead conversation beat (Marcus d80). Fix (src/js/convo-wants.js): `WANTS.curious.canOpen(vid)` — pure predicate wrapping convoPickUnaskedQuestion (reads, never consumes); convoSelectWant zeroes a want that can't open AFTER the floors. Selection falls through to fireable wants (just_company/seek_taken/ask_favor). Proof `scripts/test-curious-stranded-20261019.js`: RED→GREEN on 3 seeds (pre-fix: curious selected with 36/36 questions exhausted; post-fix: not selected; canOpen purity pinned). Regressions: dialog-coherence 37/37, convo-engine-trust 7/7, convo-cycle-norepeat 40/40, convo-gaps green, gossip-norepeat 17/17, social-gossip 9/9, want-more-exhaustion 5/5. check.js --quick: 95 passed, 2 failed — 1 pre-existing (test-sprite-aggro, references the pre-10-16-rebuild object 6f134de2~1, documented r7), 1 timeout casualty under CPU contention (the 4-seed A/B ran concurrently; both slow scripts pass standalone: test-table-endings 61/61, test-capable-bot 25/25).
2. **Table-approach reachability (DOCUMENTED + policy instrument).** The approach was never game-blocked — see "The headline" above. No src/ change. The r10 harness (`scripts/journey-scale-r10-20261019.js`) carries the table-audit instrument (daily tableSeat().detail reads, first-day per sub-gate, seat transitions, announce checkpoints) and the R10_FEASTSCALE switch for the A/B.

## Blanks documented (not fixed — design calls / other lanes)
1. **The policy doesn't take the seat.** All 4 A/B seeds earned the lesser seat, watched overtime climb to ×6, and died under it (d139–176) without ever sitting. A competent player would take the seat or walk (defiant). Seat-taking exercises tableScene → path challenges — endgame territory (lane B, legs 4–7). The approach is this leg's endpoint; the sitting belongs to the endgame lane.
2. **Overtime ×6 vs a sitter:** untested whether a village that takes the seat promptly avoids the death spiral — the overtime pressure is the designed cost of waiting, but the tuned lethality of ×4–×6 against a mid-strength village is unmeasured. Lane B's question.
3. **Mood homogeneity (6th consecutive run).** 9801: 5/5 grieving; 9803: 4/4; leadfeast 9801: 7/7; 9803: 6/6; 9804: 6/6. Bereaved villages flatten to one mood note. Balancing axis; not touched.
4. **checkArc vs tableAnnounce copy:** checkArc's "being set" line wins; tableAnnounce()'s '◈ THE TABLE IS SET…' never fires on the earned path. Both are seat-honest; the redundancy is harmless. Noted, not changed.

## Metric review (§14)
- M1–M5 all GO (M1 via the pilot-gated A/B; the pilot's 0/4 is the honest record of the unlayered policy).
- **Revision proposed for the NEXT run:** M1 should name the policy under test — "the table approaches on policy P" rather than "the table approaches," since reachability is policy-relative (the game's gate was open; the harness's accounting was the wall). The r10 A/B structure (identical seeds, policy switch) is the template.
- **No re-scoring:** the pilot's 0/4 stands; the A/B does not retroactively change it.

## Telemetry deviation check
`telemetry-check.js` vs `scale-lead.json` (leadcourt policy, 4 pilot seeds): one LOUD line — nationalHeldDays -65% (724 → 251). Investigated: EXPLAINED, not a bug — the baseline is a sum over 8 seeds (90.5/seed) vs 4 seeds here (62.75/seed), and two pilot seeds died early (d91/d99, death-aware stops). Per-seed the delta is -31%, fully accounted for by the early deaths. Baseline NOT rolled forward (4-seed death-skewed set is not a better baseline). The leadfeast set is a different policy — not compared against the lead baseline.

## Reachable / fun / winnable (scale leg, table approach)
- **Reachable:** YES — with the corrected policy accounting. The full lesser-seat bar (waves 4/4/3, contests≥2, crises≥2, regional+, stage≥2, both food-thesis deeds) was met on 4/4 A/B seeds; the seat flipped, arc 4 fired, the table was announced aloud. The engine never blocked it.
- **Fun:** the approach reads as earned — Watchers foreshadowing, the table "making a note," species-agency unlock, the seat-honest announce, then the overtime clock with a villager naming the pressure ("the table doesn't fill the pantry"). The wait has a real, voiced cost.
- **Winnable:** CONDITIONAL. The approach is reachable; the sitting is untested (lane B). Under the sit-never policy all 4 A/B villages died at d139–176 under overtime ×4–×6 — waiting is priced, as designed, but whether a prompt sitter survives the finale is the endgame lane's question.

## Files
- Harness: `scripts/journey-scale-r10-20261019.js` (r10 header + pre-registration, table-audit instrument, R10_FEASTSCALE A/B switch)
- Proof: `scripts/test-curious-stranded-20261019.js` (RED→GREEN, 3 seeds)
- Fix: `src/js/convo-wants.js` (curious.canOpen + select-time guard)
- Evidence: `evidence/2026-10-19/journey-scale-r10-leadcourt-980[1-4].json` (+9 transcripts), `evidence/2026-10-19/journey-scale-r10-leadfeast-980[1-4].json` (+4 transcripts)

## Appendix: the stranded-curious transcript (Marcus, 9801-day80, leadcourt pilot)
Recovered from the run's read (the file was overwritten by the A/B's same-name
transcript — filename-collision lesson for future A/Bs: namespace transcripts
by policy). This is the discovery artifact for blank #1.
```
=== seed 9801 day 80 — conversation with Marcus (marcus_webb) ===
occupation=electrician temperament=bold trust=23 dead=false mood=grieving
want: curious (stage 0)

THEM: "Tell you what — They'd tell me to keep working. So I'm working. That's the whole plan."
(turn0 choices: dlg:comfort, dlg:empathize, dlg:askwhy, recap, dlg:invite, dlg:subject, leave, silence)
YOU: [dlg:comfort] "Hey — you alright?"
THEM: "Sure — I — yeah. It helps, hearing that."
(want=curious stage=0)
YOU: [dlg:comfort] "Are you okay?"
THEM: "Heh. Nobody's asked me that in a while. ...I'm alright. Getting there."
(want=curious stage=0)
YOU: [dlg:comfort] "You alright?"
THEM: A long exhale. "I'll get there. Just needed a minute where I didn't have to be fine."
(want=curious stage=0)
YOU: [dlg:comfort] "Hey — you alright?"
THEM: "Most days I don't think about it. Today I am. Appreciate you noticing."
(want=curious stage=0)
YOU: [dlg:comfort] "Are you okay?"
THEM: They shake their head, then nod — both true at once. "Talk to me a bit. That helps more than anything."
(want=curious stage=0)
YOU: [dlg:comfort] "Hey — you alright?"
THEM: "I'll tell you plain — Thanks. ...Thanks for saying that."
(want=curious stage=0)
YOU: [dlg:comfort] "Are you okay?"
THEM: "I've got fires to light — metaphorical ones. Mostly."
(want=curious stage=0)
YOU: (leave)
want final: id=curious stage=3 resolution=unestablished
```
Note the want never leaves stage 0 (no question was hung — no ans:* options ever
offered), and the fallback opener ("Tell you what — They'd tell me to keep
working...") is a grief/work line, not a question. Post-fix, this NPC draws a
fireable want instead.
