# sim-trapvoice-b — backlog #641 logic run (lever loop B, 2026-10-19)

Worker: fleshout-loop-b run 20261019T1530Z, arm sim-trapvoice-b.
Worktree: ~/workspace/worktrees/sim-trapvoice-b. Base: master 6693d9429 (verified at run start).
Canon read: docs/CANON.md (full manifest + standing rules). No hunting/traps canon doc exists in docs/ (verified 2026-10-19 by a prior arm — stated here instead of inventing). Relevant standing rules honored: "If you don't know, it doesn't show" (voice keys on the scholar's actual snare_wire rank); no silent actions (no say() calls added or removed); human skills ≠ alien abilities (snare_wire is a human skill, untouched mechanically); feel over math (lines are a person noticing craft, never a stat readout).

## Pre-registered header (docs/MEASUREMENT.md §§9-12, 14-15)

This is a VOICE-ONLY lever (backlog #641): TRAP BONUS IS FICTION-INVISIBLE. checkTraps() narration never reflects the snare_wire skill rank — the catch line is identical at L0 and L3, while knowledge.json L3 promises "Your traps rarely sit empty." The mechanical pipeline is proven live (loop-B arm sim-snaremech-b, evidence/2026-10-19/sim-snaremech-b.md): KNOWLEDGE_MOD_MAP 'trap_success' → hunt.trap_catch add; checkTraps ~game.js:3631; L2 reachable via core-occupation background, L3 currently unreachable in play — narration must be honest at every rank that can occur.

- **Primary metric (mechanism):** on IDENTICAL seeds with rank-varied scholars, the rank-keyed lines fire where the flat line fired before (≥1 fired instance per rank present in the corpus, attributed to rank).
- **GO bar:** rank-differentiated lines observed firing in live sims + det-gate 16/16 byte-identical game trajectories (narration-only proof) + sense PASS on transcript reads.
- **Guardrails:** trap-narration line counts ≤ control + small band (no spam — zero new say() calls, only string variation); survival/starvation identical to control (voice-only must move nothing).
- **Kill conditions:** any rank line fails to fire in the corpus; det-gate <16/16; any survival/starvation drift; a sense-read line that reads as a stat readout.
- **Horizon:** 180d death-aware (never fixed-200d). **Seeds:** 41101–41108 (8, fresh — verified zero prior use via repo-wide grep 2026-10-19). **Policies:** leadfeast + belongfeast (competent family), FEASTSCALE_R13=1, SEATDRIVE=0 pre-seat substrate.
- **Pilot gate:** 8 seeds × 2 policies before/after on IDENTICAL seeds. Kill fast on a miss.
- **§15:** before/after comparison through scripts/balance-panel.js — the panel is the instrument, the pre-registered threshold is the judge. Compare .md attached (evidence/2026-10-19/trapvoice-panel-primary.md).
- **§14 metric binding:** the header above binds the run. A miss is NO-GO, never re-scored mid-run. Metric doubts go under "metric review."

## The engine (traced, not assumed)

checkTraps() (src/js/game.js:3551) runs inside endDay (29722) before the day increments. Per trap with a live recipe it: relaxes trap-shyness; backfills wildlife; if no eligible game → one quiet line per trap (quietTold gate); else computes trapChance = min(0.95, modTarget('hunt.trap_catch', 0.4)) (+0.15 binoculars, ×0.65^shy); on catch → carcass + the flat line: `🪤 TRAP: Your ${recipe.name} ${dirPhrase(x, y)} caught a ${animal.name}! About ${catchKcal} kcal on the bone — clean it quickly (knife). It rots fast.` The line has NO rank reference — fiction-invisible at every rank (RED-confirmed below).

Skill-level read pattern (used by narration): `((this.state.codex.skills || {}).snare_wire || {}).level || 0` (cf. game.js:2918 for read_people).

Recipe honesty wrinkle: 11 trap recipes carry `catches` (snare, deadfall, box_trap, fish_weir, spring_snare, fish_basket, noose_pole, trotline, minnow_trap, pit_trap, squirrel_pole). The snare_wire mechanical bonus applies to ALL traps, but wire-craft voice ("the loop held") would lie on a deadfall or fish weir. Voice keys on wire-snare family ('snare', 'spring_snare') vs everything else — deterministic, zero RNG.

## The lever + design calls (Steve corrects; numbered)

Voice-only, zero RNG draws: rank (+ recipe family) selects a deterministic line. No say() added or removed — same cadence, one line per check. The kcal/rot functional core is preserved verbatim in every line (rot-priority info players need; not a readout of the skill).

(1) What each rank's catch line says and why:
- L0: the flat line, BYTE-IDENTICAL. An untrained hand got lucky; there is no craft to notice yet. (Also protects the det-gate for the common case — most scholars are L0.)
- L1 ("A loop of wire on a game trail. Simple, effective, ancient."): the catch validates the ancient form. Line: `— set it, waited, and the old way worked.` Fits every trap recipe (all are ancient tech); echoes the codex L1 without quoting it.
- L2 ("Set the loop at head height for the target species. Anchor it solid. Camouflage the wire."): the trapper notices the SET. Wire snares: `— head-high on the trail, anchored solid, wire near-invisible.` (the L2 text's three beats). Other traps: `— read the sign first, set it where the trail says.` (ground-reading craft, recipe-honest).
- L3 ("You read trails like a book and set snares like punctuation. Your traps rarely sit empty."): wire snares: `— read the trail like a book, set the snare like punctuation. They rarely sit empty.` Other traps: `— read the ground like a book; the trap was punctuation. They rarely sit empty.` "They rarely sit empty" is the codex's OWN promise, fired only at the moment it is demonstrated (a catch) — honest, never a promise of future catches; the mechanic (0.95 with eligible unshy game) backs the pattern. L3 is currently unreachable in play; the line stands ready and honest if it ever is.

(2) Catch vs empty-check voicing: catch lines vary at every rank (L1/L2/L3; L0 flat). Empty-check: L0/L1 keep the flat line — the "Try another tile" nudge is still useful early (knowledge-gating: help fades as craft grows). L2+ get the quieter line: `Your ${recipe.name} ${DIR} sits empty. You read the ground on the way in — no sign, no promise.` Shorter, no tutorial nudge, no claimed reason for the emptiness (honest — the branch doesn't distinguish depleted from shy).

(3) How it avoids reading as a stat readout: no numbers, no "rank"/"bonus"/"+" words anywhere in the new prose; craft notes are second-person observations of the trapper's own doing ("the old way worked", "anchored solid", "read the trail like a book"). The only number in the line is the pre-existing kcal figure, which is carcass information, not a skill readout.

## Proof

**RED (pre-fix tree, scripts/test-trapvoice-b.js PART 0, TRAPVOICE_RED=1):** driving the real checkTraps() at ranks L0/L1/L2/L3 yielded the BYTE-IDENTICAL flat catch line at every rank (12/12 RED checks). Catch counts moved with rank (17/40 → 24/40 → 37/40 — the sim-snaremech-b pipeline, live) while the fiction didn't move at all. The blank is real.

**GREEN (post-fix, PARTS A–D): ALL GREEN.**
- PART A (22 checks): L0 byte-matches the flat template; L1 carries "set it, waited, and the old way worked." on snare AND box_trap (recipe-honest generic); L2 wire-snare "head-high on the trail, anchored solid, wire near-invisible." vs box_trap "read the sign first, set it where the trail says." (no wire lie on a box); L3 "read the trail like a book, set the snare like punctuation. They rarely sit empty." with no absolute-future promise; kcal/rot core preserved on every line; 🪤 TRAP: prefix preserved; anti-stat-readout pins (no +0.x/rank/bonus/trap_success tokens); quiet line flat at L0/L1 (said once), quieter L2+ variant ("sits empty. You read the ground on the way in — no sign, no promise."), tutorial nudge gone at L2+.
- PART B (det-gate, 16/16): L0 vs L1 is the voice-only pair — trapChance is 0.4 at BOTH ranks (L1 is unlock-only, sim-snaremech-b), so mechanics are identical and only narration differs. 8 seeds × 2 trap types: state hash identical (excluding the rank input itself) AND Math.random draw count identical AND lines differ per design. Narration provably draws zero RNG and writes zero state. (game.js makes no captured-RNG aliases — verified no `= Math.random` — so the post-eval draw counter sees every draw the narration could make.)
- PART C (live scenario): ≥1 catch line per rank L0..L3 through the real checkTraps() (25/60, 25/60, 38/60, 56/60 dawns).
- PART D (sense): lines printed below.

**Regression check:** scripts/test-hunter-ecology-20261008.js (the trap-ecology proof) — its trap-narration assertions are substring-regex based (/caught a Cottontail Rabbit/i, /sits empty/i) and pass at every rank. Observed 3–4 failures in its net/minnow-trap sections on BOTH trees (pristine: 17/3, 20/0, 20/0; fixed: 16/4, 17/3, 17/3, 20/0, 17/3) — pre-existing flakiness in inventory assertions unrelated to this change (my change touches only two say() strings in checkTraps; the failing sections never reach trap narration).

## Before/after (8 seeds × 2 policies, identical seeds, 180d death-aware)

Pilot: 16/16 runs per arm, FEASTSCALE_R13=1 / SEATDRIVE=0, seeds 41101–41108 (fresh, zero prior use). Attached: evidence/2026-10-19/trapvoice-panel-primary.md (panel = instrument, pre-registered thresholds = judge).

**Trajectory identity (the voice-only proof at full-run scale):** every armed run is identical to its control twin in gameDays, endReason, snare_wire rank transitions, trap catches, trapline kcal, and starvation deaths. 16/16 pairs identical.

**Scale-wall numbers (armed arm, 16 runs):** national 0/16, table 0/16, wins 0/16. Wave unlocks: 9× wave 4, 3× wave 3, 2× wave 2, 2× wave 1. Median survival 107d, max 182d. 12 village-lost, 4 survived to horizon. (The wall stands — reported per the standing directive; this arm didn't target it.)

**Rank-voice firing in live sims (GO bar, primary metric):** 193 trap lines in the armed corpus, 158 carrying a rank-voice marker —
- L1 (scholars who learned mid-run, 0→1): all 41 catch lines voiced ("set it, waited, and the old way worked."); 11 quiet lines flat (L1 keeps the nudge — per design).
- L2 (core-occupation scholars, 2→2): all 107 catch lines voiced ("head-high on the trail, anchored solid, wire near-invisible."); 10 quiet lines voiced ("sits empty. You read the ground on the way in — no sign, no promise.").
- L0: flat everywhere (byte-identical to control).
- L3: unreachable in play (sim-snaremech-b); covered by the unit scenario only.
- The third checkTraps surface (shyness line, "the game trails bend around the hollow now") untouched by design — documented below as a follow-up candidate, not chased mid-run.

**Guardrails (panel §, means across 16 paired runs):** catch lines 10.56/10.56 (Δ0.00), quiet lines 1.50/1.50 (Δ0.00), shy lines 2.50/2.50 (Δ0.00), catches 10.56/10.56, kcal 6375/6375, starvation 0.19/0.19, end rank 0.75/0.75. Zero new say() calls — same cadence, strings only. All measured contract metrics: no_material_signal, Δ exactly 0. (Panel decision reads review_required — driven entirely by unmeasured contract metrics marked not_observed, the same as prior panels wireacquire-b3 and armorprod; not a signal.)

## GO adjudication

**GO — land.** Every pre-registered bar met: (1) rank-differentiated lines fired in live sims at every reachable rank (L1: 41/41, L2 catch: 107/107, L2 quiet: 10/10, L0: flat by design); (2) det-gate 16/16 byte-identical trajectories + zero RNG draws; (3) sense PASS (below); (4) guardrails all Δ0.00 — survival/starvation identical, no spam. No kill condition tripped.

## Sense test (full transcript reads)

**L2 catch in dawn patter** (belongfeast s41104, d47 — the scholar is a core-occupation trapper):
> [d47] 🗣️ Somchai to Devon, by the fire: "Nobody's sleeping. The sky is waiting and nobody knows what to do with their hands."
> [d47] ⚠ STARVING: health and energy falling. You went to bed on an empty stomach.
> [d47] Village meal: +2136 kcal, +1L water from the communal pantry.
> [d47] Devon traded something with someone for something else. The barter economy stirs.
> >>> [d47] 🪤 TRAP: Your Snare 1 tile west caught a Gray Squirrel! — head-high on the trail, anchored solid, wire near-invisible. About 350 kcal on the bone — clean it quickly (knife). It rots fast.
> [d47] 🌙 Raid — Thornfield came in the night from the southwest. They carried off ~1000 kcal from the pantry. [...]

Judgment: PASS. The line reads as the trapper noticing their own set — "head-high on the trail, anchored solid, wire near-invisible" is a person checking their craft at dawn, not a stat readout. It sits naturally among villager dialogue, the meal, the raid. The kcal/rot core is untouched (still scannable for the rot-priority decision).

**L2 quiet variant in context** (leadfeast s41105, d31):
> [d31] 📓 Codex: Tukur taught Petra Wound Care.
> [d31] 🌿 Muscadine Grapes, weeks in the baskets. Handling it day after day, the village has learned what it's FOR [...]
> >>> [d31] Your Snare 1 tile west sits empty. You read the ground on the way in — no sign, no promise.
> [d31] 🪤 TRAP: Your Snare 1 tile east caught a Virginia Opossum! — head-high on the trail, anchored solid, wire near-invisible. About 1200 kcal on the bone [...]

Judgment: PASS. Quieter as designed — shorter, no tutorial nudge, no claimed reason for the emptiness. The two voices (quiet + catch) are consistent: the same trapper, the same dawn.

**Villagers-act-like-people check:** the dawn-check patter around the new lines is people, not UI — Somchai/Devon by the fire, Marcus and Mateo arguing about the watch rotation ("Again. It's almost comforting."), Esther teaching tea bush by the fire ("See the leaves? Like that. Don't mix it up."), Devon drawing grapes in the dirt. Pre-existing ambient repetition noted ("lingered over the fire together" ×N, "traded something with someone for something else") — not mine, not chased.

## Village assessment

What the villages looked like (16 runs, competent-family policies): traplines are real food — 169 catches, 102,000 kcal across the corpus; two villages ran 181–182d traplines (67 catches for the leadfeast s41105 trapper). Scholars reach L1 in 8/16 runs (4 learned mid-run via teaching — the wire lesson sim-snareteach-b shipped is visibly working) and start at L2 in 4/16 (core-occupation backgrounds: hunting guide et al.). Death is combat-shaped (312 combat + 108 villager-combat + 26 monster of ~470 deaths); starvation is rare (3 deaths, one run) — the food economy holds villages up long enough for everything else to kill them. Nobody reached national/table; 9/16 touched wave 4. The scale wall stands; this arm didn't target it.

**Blank filled:** #641 — TRAP BONUS IS FICTION-INVISIBLE. The snare_wire rank now speaks at the dawn check: L1/L2/L3 catch lines + L2+ quiet line, voice-only, zero RNG, same cadence.
**Blank documented (not chased):** the third checkTraps narration surface — the trap-shyness line (game.js:3812, "the game trails bend around the hollow now. This ground has learned your trap. Rest it, or move the line.") — is also rank-invisible. A skilled trapper would read shy ground differently ("they've learned the loop — rest it a week"). Candidate for a follow-up voice arm; out of this arm's scope (brief: catch line and/or empty-check line).
**Known boundary restated:** snare_wire L3 remains unreachable in play (sim-snaremech-b traced every grant path; the missing rung is a skill-lane ability carrier). The L3 voice stands ready and honest for if/when the rung exists — it promises nothing the mechanic doesn't do.

## Metric review

1. The panel's `review_required` decision is comparator mechanics, not evidence: unmeasured contract metrics score `not_observed`, which the policy roll-up treats as review-triggering. Prior panels (wireacquire-b3, armorprod) read identically. Every measured metric: `no_material_signal`, Δ exactly 0. For voice-only levers the trap-guardrail section is the real judge — all Δ0.00.
2. Instrument bug caught mid-run: the sweep's say-log filter (`'nothing it can catch is moving'`) silently dropped the NEW L2+ quiet variant from the armed corpus — the guardrail then read armed quiet lines as *lower* than control. Fixed the filter to the stable surface (`'sits empty'` minus the shy template) and re-ran the 4 L2-scholar armed seeds; guardrail now Δ0.00 and the audit counts the 10 fired L2+ quiet lines. Lesson for future voice arms: filter on the stable surface, never on one variant's prose.
3. The pre-registered metric ("≥1 fired instance per rank present in the corpus, attributed to rank") proved exactly right — attribution was clean: every voiced line matched its scholar's actual rank, and L0 lines stayed byte-flat.

## Convergence verdict

**GO — land as one commit.** Backlog #641 closes: the fiction now reflects the mechanic at every reachable rank, with the det-gate proving the voice moves nothing. No further iteration needed on this lever unless Steve corrects one of the three design calls. The axis question this arm served (are trappers' bonuses visible in the fiction?) is answered; the remaining trap-voice surface (shyness line) is documented for a future arm, not this one.
