# journey-deepening r193 — deepening leg (days 40–80), Lane A — RUN NOTE

- **Run:** `playtest-loop-a-20261114T2045CST`, scheduled Sat 2026-11-14 20:45 CST (02:45 UTC; run started ~02:56 UTC — scheduler/queue delay ~11 min).
- **Leg:** 2 — deepening (DAYCAP 100, death-aware stop). Rotation read `2`; advance 2→3 at closeout with read-back verification (owed — r192's closeout advance did not stick; the file still read `2` at this run's start).
- **Base:** worktree branch `journey-deepening` at `0054751ad` (sim-holdbuild-b tip). Main `master` was `f1400295b` at reaper time, advanced to `a4d0b2038` (Loop B coordinator evidence, evidence-only) during registration — rebase onto then-current master before landing. `git pull` already up to date. No push (ship loop owns pushes).
- **Branch:** `journey-deepening`, worktree `~/workspace/worktrees/journey-deepening` (registered 02:57–03:01Z, heartbeat 03:01:13Z immediately after registration; 10-min heartbeat loop PID 36873).
- **Lock:** run_id `2026-11-15T02:57:08Z-playtest-loop-a`. No lock present at run start — no stale-lock recovery. **Delete at end, re-reading it first.**
- **Policy:** competent. Seeds: fresh **100083–100090** (8-seed panel, no smoke — the 8 seeds ARE the panel). Freshness verified per the seed-band skill: 0 hits for `10008[3-9]`/`100090` across all `evidence/**/*.md` preregs; the two JSON hits in goal hidden_files are kcal floats, not seeds; forbidden-list keyword hits are metric bans (sim-fallbackfeared-a forbids 74201–74208), not seed bands.
- **Commits:** `77747122` — Q1 prereg + instruments (analyzer proof 10/10, committed BEFORE any judged sim). Safe-commit index clobber struck the commit (repaired via the documented ls-tree pipe; verified: status clean, diff empty, all 4 hashes match HEAD). (Run-note commit owed at closeout.)
- **Corpus:** `hidden_files/evidence/2026-11-14/journey-deepening-r193-*` (goal store).

## Q1 (PRIMARY) — PARTNERBLOCK WATCH ON AN 8-SEED PANEL: WATCH-CLEAR (with a metric-review caveat)

**Panel line: total=4 distinct=3 maxRepeat=2 patternCounts={partnerblock-rightnext:2, partnerblock-nextto:1, partnerblock-beside:1} → REPETITIVE by the letter of the A2 share bar (2/4 = 0.5).**

**Verdict: WATCH-CLEAR.** The detail rows overturn the letter: the 4 firings sit in 4 DIFFERENT sittings (each total=1, maxRepeat=1 per sitting), across 4 seeds/days/villagers — Morgan (100083 d27, link proposal → pantry ask), Booker (100086 d45, water haul), Tom (100084 d60, water haul), Shona (100090 d26, link proposal → forage ask). The 2× rightnext are on different seeds with different wants and different outcomes (Morgan's commit meets the away-line, Booker's meets "Dawn, then"). No sitting repeats the line; no single trigger path. This is the same shape as r192's FAVORBLOCK clearance (9 firings, 9 sittings) at a thinner total — the share bar fires on any 2× wording at n=4.

**Metric-review proposal (not a re-score):** the A2 share bar needs a minimum-total floor before REPETITIVE is meaningful — at total=4, any wording that fires twice reads REPETITIVE. Propose: total < 6 → THIN-PROBE regardless of share; REPETITIVE only at total ≥ 6 with share ≥ 0.5. The next run should adopt the floor or the watch will keep flagging noise.

- **FAVORBLOCK re-verify: total=8 distinct=4 maxRepeat=3 patternCounts={rightnext:3, nextto:3, beside:1, theirside:1} → VARIED.** The r192 clearance holds; 8 firings across 8 sittings, each total=1.
- **Double-ask: 0 across 91 transcripts → WATCH-CLEAR.** Fifth clean panel in a row (r188 0/135, r189 0/79, r191 0/52, r192 0/72, r193 0/91). The r134 fix holds.
- **RE-ASK-ORPHAN: 7 orphans, all FROMSEED, 0 true-no-thread.** The stage-0 guard fix holds in the wild.

## Q2 (SECONDARY) — KNOWLEDGE TRACK + MOOT-EVENTS CORRECTION

- **Moot-events instrument: WORKS, sanity bar PASSED.** Per seed (mentions → events): 14→9, 12→6, 17→8, 7→3, 18→8, 54→41, 13→7, 13→6. Events ≤ mentions on every seed; events ≥ 1 on every seed (all reach day 83+). Median: 13.5 mentions vs 7.5 events. The correction behaves as designed — one gathering that narrates three lines on one day is one event.
  - **Outlier: 100088 gathered 41 times in 97 days** (54 mentions) — a moot roughly every 2.4 days, against 3–9 events on the other seven villages. That village also lost the most people (12 deaths) and died scholar-death-no-successor day 97. A dying village gathering constantly is plausible fiction (funerals, decisions), but the 5× spread is worth one line: moot frequency is not yet understood as a signal. Carried as an observation, not a defect.
  - The "moot pile" reading stays retired. K-CONTEXT now prints `mootMentions` + `mootEvents`.
- **Knowledge track pooled: GOALS-FAULT (tops=1, lined=0, capture=0)** — but tops=1 is below the prereg's ≥4 diagnosis bar, so per the pre-registered decision: report and move on, no build. The single top is 100087 (tops=1, never lined, capture=0); the other seven seeds top knowledge 0 times. Same thin shape as r192 (tops=1, capture=1, HEALTHY-thin). Engagement is still near-zero: the goal tops once in 8 seeds. Carried to the one-brain program as an observation, not a fault.
  - **bank_veterans pooled: HEALTHY this run** (tops=3, lined=0, capture=1) — the r192 GOALS-FAULT did not recur. The one capture sits on 100085, the one top-cluster on 100083 (tops=3, never lined).
  - Other tracks: party_up HEALTHY (71/14/371), build_standing HEALTHY (21/3/53), food_security HEALTHY (24/6/1170), bonds HEALTHY (25/7/284), safety HEALTHY (27/5/275), gear_up NO-DATA (0 tops on all 8 seeds — the gear goal never tops anywhere in this leg; same as r192).
- **Knowledge economy otherwise:** monster meat tested, revealed, and eaten on 7/8 seeds (kills 14–45, reveals 2–19, dinners 0–16). **100087 is the exception: 22 kills, 2 tested, 2 revealed, 0 dinners in 102 days** — the village survived with 10 people and never sat down to monster meat. One seed is not a defect, but the meat economy's last step (eat) not firing on a surviving village is the one census wrinkle this run. Codex growth is not in this run's seed JSON shape (lastLivingCensus carries plants, not codex) — not re-derived.

## Q3 — census (plain words)

Eight villages played. Four survived to day 101–102, four were lost. All eight reached wave 4; **three reached wave 5** (100083, 100087, 100090) — the deepening leg's villages are pushing past the wave-4 door faster than r192's panel (7/8 wave 4, no wave 5 named). Regional on 8/8. Links form — 2–4 per village, several seasoned — but standing POINTS are war/plenty only (diplomacy 0 on all 8 seeds); the relationships exist, the points don't come from them. The link-less-standing question stays with the scale leg.

- **100083 — survived day 101, 8 alive, wave 5.** Regional day 32 (earliest), max standing 245 (war 225, plenty 20). 39 beasts, 2 dead (wild ×2). 3 links, 2 seasoned. 12 meat dinners. Ladder stage 3 holds.
- **100084 — lost day 89, hunger scatter, 3 alive when they walked.** Regional day 47, max standing 245. 14 beasts, 10 dead (wild ×8, arena, night). 2 meat dinners. Ladder peaked 3.
- **100085 — survived day 101, 9 alive, wave 4.** Regional day 41, max standing 225. 45 beasts (most kills), 2 dead (wild ×2). 16 meat dinners. 2 seasoned links. Ladder stage 3 holds.
- **100086 — lost day 83, scholar-death-no-successor, 0 alive.** Regional day 28, max standing 235. 26 beasts, 11 dead (wild ×10, a stranger). 12 meat dinners. Ladder peaked 3, fell to 2.
- **100087 — survived day 102, 10 alive, wave 5.** Regional day 36, max standing 370 — the strongest standing on the panel. 22 beasts, 6 dead (wild ×3, dehydration, lockjaw, arena). 4 links, none seasoned. 0 meat dinners (see Q2). Ladder stage 3 holds.
- **100088 — lost day 97, scholar-death-no-successor, 0 alive.** Regional day 47, max standing 210. 21 beasts, 12 dead (wild ×10, arena ×2). 3 meat dinners. 41 moot events (see Q2). Ladder peaked 3, fell to 2.
- **100089 — survived day 101, 8 alive, wave 4.** Regional day 36, max standing 125 — the weakest standing, and the quietest village (2 deaths: lockjaw, contest). 32 beasts, 14 meat dinners. 3 seasoned links + 1 new. Ladder stage 3 holds.
- **100090 — lost day 95, hunger scatter, 1 alive.** Regional day 34, max standing 225. 33 beasts, 10 dead (wild ×9, dehydration). 4 meat dinners. Wave 5 reached before the scatter. Ladder peaked 3, fell to 2.

## Q4 — people check (full transcripts read): PASS, with two wrinkles carried

Six full transcripts, all coherent — people with wants, consequences, and specific memories.

- **Morgan, 100083 d27 (partnerblock-rightnext).** Appliance repair tech, restless, trust 82: link proposal for Thornfield, then the pantry ask; the block line ("You need to be right next to your partner, same side of the Haven door, to help") fires on the player's "why can't I do this now?"; the commit meets the away-line ("I'm away from Haven right now, out on the road"). Coherent, resolves.
- **Booker, 100086 d45 (partnerblock-rightnext).** Night security guard, gentle, trust 94: pantry handled, water ask ("Water's almost gone — 2 liters. I can't carry enough alone. First light, the creek, you and me?"), same block line, commit → "Dawn, then. Bring something to carry — and thank you." Coherent.
- **Tom, 100084 d60 (partnerblock-nextto).** Crossing guard, fidgety, trust 91: same water-haul shape as Booker ("The cistern's nearly dry — 0 liters left... Two of us, half the trips"), block line in the nextto wording, same "Dawn, then" close. The water-haul ask repeats near-verbatim across villagers — the favor template, not the block line, is the repeated text. Carried as a content-variety observation.
- **Shona, 100090 d26 (partnerblock-beside).** Firefighter, dry, trust 57: link proposal for Emberhold, then the forage ask ("The pantry's nearly bare. Forage with me tomorrow? I know where the mango grows thick."), beside-wording block, commit meets the away-line. Coherent.
- **Gladys, 100083 d80 (curious).** Chimney sweep, dry, trust 98, grateful: "Did you leave someone behind? ...Sorry. You don't have to answer that." → "Yeah." A long quiet. "Me too." → "I don't talk about that. Not because it's secret — because saying it out loud makes it real in a way I can't afford yet. Someday. Not today." Plants a thread, ends gracefully. The best line of the panel.
- **Nora, 100086 d54 (grief, teach loop).** Tailor, gentle, trust 91, grieving: link proposal for The Hungry Road, a walk to the tree line, then FOUR teach picks in a row (Blackberry, Lamb's Quarters, Stinging Nettle, Chickweed) — same player pick "Watch. This matters." four times. Each plant has its own true line ("And I've been walking past it for weeks." / "I never knew that."), but the pick shape repeats mechanically — the same wrinkle r192 noted on Ivan's gossip chain. Also: the walk arrives under the label `betrayal:accept` — a benign walk filed under a betrayal branch name. Both carried as observations, not defects. (Nora is also the villager r192 flagged as top-null on the knowledge goal — here the player teaches HER plants; she never tops the goal herself.)

No senseless dialogue found this run. No fabricated shared history in the wild panel.

## Q5 (carried, read-only)

LADDER opens 8/8, mints 5/5, holds 5/8. SECRET-PROBE FIRES (1 fired, sharedEnd 30). PLACEPROBE bottleneck FIRES (15/91 sittings with places — up from r192's 3/73). B-SIT 30 (accept 17 / decline 13, 0 unanswered); B-FOLLOW 21 (8 with new betrayal); P-KEEP 23 (DEAD 10, SILENT 4, NO-LATER-SITTING 6, NAMED 3). FIZZLE-FIX HOLDS (0 dry sittings). BOND-TELEMETRY PRESENT (144 tele, 67 proposals, 28 decisions, 8 accepts, 12 initiated bonds). REQUESTS REACHED (58 staged, 39 decided, 19 expired, 6 talkable-untalked). BOND-CHOICE 39/39 answered. LANGGATE NOT-REPRODUCED; LANGARC ARC-FLIPS-NO-PAYOFF (7 sittings, 2 grants, 2 flips, 0 post-flip decisions, 0 unmatched). MENU-FLIP NO FLIPS (fix holds). TEACHFRAME VARIED (4 frames, 29 frames, max same-frame 2). TRUST: deaths 55, knownGains 70, strangerGains 2 (strangerTotal -23), lateGains 0 — CARRIED per the r129 rule (computed TRUST-PAID-TO-STRANGERS; r119 verdict stands, no new trust verdict this run). AWAY-LINE OLD LINE GONE (0 old, 1 new). D-THING 9 pocketed / 4 testable / 0 named. RAJ-PHOTO 0. DEBRIEF: villageLost 4, all attributed, 0 unclassified. SOFTWARM 0. GUARDLINES 14. REPLAY NOT-REPRODUCED. CISTERN CLEAN.

## Telemetry

- Check vs the r192 baseline (8-seed sums, seeds 100075–100082), metrics `w3fights,engaged.w3,fightsTotal,fightsByWave.3`: tool **QUIET** (8 files, 4 metrics, no large deviations). Same-n panel (8 vs 8), so the comparison is binding — no LOUD lines, **no baseline roll**.

## Gate

`node scripts/check.js --quick` (340 scripts, 4 parallel, 1766s): **328 passed, 12 failed — GO after adjudication (0 attributable to this run).** Log `hidden_files/journey-deepening-r193-gate.log`, standalone log `hidden_files/journey-deepening-r193-standalone.log`.
- The 12 failures: 7× 120s load timeouts under the parallel gate (living-garden, occupation-panels, one-person-army, solo-campaign-endings, synergy-stall, throttlefeast, capable-bot) + trust-observer-neutrality (exit 1 at 108.6s, near-timeout) + measurement-cache-flags 0/4 + phone-frame-proof (stale receipt — index.html, same pre-existing failure as r189/r191/r192/r197; the receipt refresh is a separate owed job, not this run's) + the measurement-proof-update + measurement-workflow staleness pair.
- Standalone re-runs: ALL 9 GREEN — living-garden rc=0, occupation-panels 25/25, one-person-army rc=0, solo-campaign-endings 15/15, synergy-stall rc=0, throttlefeast 17/0, capable-bot 42/42, trust-observer-neutrality 6/6, cache-flags 4/4 (the AGENTS.md load-artifact reading confirmed: 0/4 under gate load, 4/4 standalone). All 9 are load artifacts, not code failures. (First standalone batch's logs were lost to a VM replacement wiping /tmp mid-run; the batch was re-run with logs in persistent hidden_files storage. The replacement also stalled the tree heartbeat ~1h — re-heartbeat landed immediately on recovery, tree never reaped; run note + corpus verified intact.)
- **Staleness pair — PRE-EXISTING, not this run's:** `B.manifest()` hashes all of `src/` + policies + index.html + sim-harness.js + sweep-compare.js, so any src change invalidates the retained proof. Between r192's base (3263ddb1f) and this run's base (0054751ad), transplant8b changed `src/js/game.js` (+56), `betrayal.js`, `build.js`, `partyTactics.js`. This run changed no `src/js` and no observer file. The refresh (round 15) stays the already-owed job from r192's carried list — not built here.
- This run changed no `src/js` (scripts + evidence only); the r193 analyzer proof is 10/10 green.

## Metric review (§14)

- Q1's metric worked after the detail read: the panel line said REPETITIVE, the sittings said noise — the A2 share bar at total=4 is the finding, not the wording. Proposal for the next run: total < 6 → THIN-PROBE regardless of share (see Q1). The 8-seed panel was enough for Q1 (4 firings, 4 sittings — the thinness IS the evidence) and for Q2's moot-events sanity bar.
- Q2's metric worked: the moot-events count landed with a passing sanity bar on the first run, and the pooled GOALS-FAULT bar correctly stayed below its ≥4 diagnosis threshold (tops=1). The knowledge track's thin engagement (1 top in 8 seeds) is now a two-panel pattern (r192, r193) — still one-brain's, still not this run's to build.
- The flap did not strike this run; the registry-lock queue delayed registration ~4 min (r192: ~15 min). The rotation 2→3 write is owed at closeout with read-back verification.

## Verdicts

- **Reachable:** yes — wave 4 on 8/8 villages, wave 5 on 3/8, regional on 8/8, ladder stage 3 on 5/8, links on 8/8, bonds, secrets, and the meat economy all fire in the wild.
- **Fun:** yes — the transcripts read like people (Gladys's "Someday. Not today.", Morgan's shaking-hands pantry ask in r192, Shona's mango forage), and the surviving villages did so with standing to show for it. The two scholar-death losses and the two hunger scatters are the game's hard edges, not dead ends.
- **Winnable:** partial — 4/8 survive to day 101–102, one reaches 370 standing, three face wave 5, but no village reaches national or the table; standing points are still war/plenty only. The link-less-standing question stays with the scale leg.

## Notes for the next run

- **Rotation:** advance 2→3 at closeout with read-back verification. Next leg is scale (days 80–140).
- **Next blank (r194):** the scale leg owns the link-less standing road; this panel adds 8 seeds of evidence (links form 2–4 per village, standing points stay war/plenty, diplomacy 0 on all 8).
- **Carried:** A2 share-bar floor proposal (total < 6 → THIN-PROBE); knowledge-goal thin engagement + Nora top-null (one-brain); bank_veterans healthy this run (no carry); moot-frequency spread 3–41 events (observation); water-haul favor template repeats near-verbatim across villagers; teach-loop 4× same-pick repetition in one sitting; `betrayal:accept` label on a benign walk; 100087's 0 meat dinners on a surviving village.
- **Held tree (INSPECT HELD WORK, Steve 2026-10-27):** `journey-scale-attr` (heartbeat 2026-11-10 06:08Z, 5+ days stale) still holds the unlanded revert of the live sim-wideduty-a medic-duty code in `src/js/game.js`. Real work-in-progress, not scratch — not released, not touched. Flagged again.
- **No src/js change this run** (instruments + evidence only).
