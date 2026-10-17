# sim-trickshape — does performing a trick change fight shape? (flesh-out loop DIAGNOSTIC, 2026-10-17)

**Run:** flesh-out loop DIAGNOSTIC arm sim-trickshape, run_id fleshout-20261017-044712, axis scale-onramp (blocking).
**Type:** READ-ONLY DIAGNOSTIC INSTRUMENT. ZERO src/js changes. ZERO scripts/policies changes. New scripts/trickshape-*-20261017.js + scripts/sweep-trickshape-20261017.js + scripts/test-trickshape-20261017.js + scripts/analyze-trickshape-20261017.js + evidence/2026-10-17/ ONLY.
**Canon:** docs/CANON.md read; evidence/2026-10-16/sim-trickfunnel.md and evidence/2026-10-16/sim-execensus.md read (from the main tree, not copied). No new canon invented.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written before the sweep)

**Question:** the trick funnel measured the perf→attr gap but left it unexplained — 42 performed tricks did not become kill-attributed (98 performed → 56 kill-attributed). Do performed tricks CHANGE FIGHT SHAPE versus matched non-trick fights (better survival, lower HP cost, shorter/longer fights, more flights), or are they inert once performed?

**The verdict must NAME the next lever precisely:**
- (a) **lethality design** — tricks need to hit harder / create kill windows;
- (b) **condition-widening** — performances are fine, the gap is upstream;
- (c) **nothing** — tricks are working as debuffs/openers and the funnel's attr gap is a measurement artifact of kill-attribution.

This arm is a diagnostic; the verdict is the deliverable. No lever is picked or built.

**PRIMARY (diagnostic GO, binding):** 100% attribution — every performed-trick TB fight outcome (every (fight, mid) row with perfs non-empty) is traced to a complete fight-shape record (result, rounds, performer HP start/end, survival) with ZERO unattributed rows. A miss is NO-GO — the instrument is incomplete, never re-scored mid-run.

**Fight shape per (fight, mid):** rounds (f.round at tbEnd), performer HP start/end (HP cost = start−end; death counts full start HP), performer survival, companion deaths, result class (won / fled+routed / lost), trick-bearing species killed?, kill-attributed (waveKillLog ±1d).

**Matched controls:** same mid (species), same era (30d bucket), same partyN bucket (1/2/3+), scholar present. Two comparison sets:
- C1 known-not-performed (known_at_start=1, perfs=0) — controls for knowledge, isolates the performance effect;
- C2 all non-performed (perfs=0).
Metrics: survival-rate delta, mean HP-cost delta, mean rounds delta, outcome-share deltas, with n.

**Scope note:** the matched comparison is the TB path (the engine's own trickLogByMid performance record — the funnel's 98→56 gap). The field-AI path (villagerTrickAction) is captured as a fired-event count for "every trick-performed fight" completeness, reported descriptively (the field-side execution window was measured end-to-end by sim-execensus on its own substrate; this arm does not re-measure it).

**Substrate:** pre-seat courtship — SEATDRIVE=0 EXPLICIT, FEASTSCALE_R13=1, TRIBFLOOR=1 (base leadfeast/belongfeast policies from scripts/policies/tribfloor.js, untouched). NODEWITNESS unset. reposition/vetrel/w3wire: OFF — tribfloor.js composes neither reposition.js nor vetrel.js (grep-verified); no w3wire hook exists anywhere in the tree (repo-wide grep, 0 hits).
**Seeds:** 8 FRESH [1901–1908] × {leadfeast, belongfeast} = 16 runs. FRESH = 0 per-seed filename hits across evidence/ (verified 2026-10-17 with rg: `s190[1-8][^0-9]` → 0 hits).
**Horizon:** 180d death-aware (dead villages stop simulating; +10d tail max). Why: matches the funnel census substrate exactly, so the 98→56 gap's substrate is the comparison's substrate.
**Gates before spend:** proof RED→GREEN (shape classification on synthetic captures) · DET-GATE (instrument attached vs bare byte-identical trajectories) · SMOKE green.
**Guardrails:** wall metrics (national/table/wins) within noise of the funnel census's known wall state on this substrate; no new death mode.

**Per-seed JSONs:** evidence/2026-10-17/perseed-trickshape/ · beats/transcripts: evidence/2026-10-17/trickshape-beats/ · instrument: scripts/trickshape-instrument-20261017.js · sweep: scripts/sweep-trickshape-20261017.js · proof: scripts/test-trickshape-20261017.js (22/22 GREEN) · analyzer: scripts/analyze-trickshape-20261017.js · summary: evidence/2026-10-17/perseed-trickshape/SUMMARY.json.

**Deliverable:** the verdict (a/b/c with the named next) plus mechanism-level numbers (survival delta, HP-cost delta, rounds delta vs matched non-trick fights, with n), 3–4 sense-read transcripts, village assessment, blanks filled or documented.

## Metric review

- **The PRIMARY (100% attribution of performed-trick fight outcomes) was met: 106/106, 100%, GO.** It bound the run: it forced the shape-snapshot design (p HP at fight start/end, rounds, companions, monster end-states) attached to the funnel's proven capture pattern. Zero unattributed rows across 16 runs.
- **No re-scoring.** The verdict (c) is drawn from the pre-registered comparison (survival/HP-cost/rounds deltas vs matched controls + the perf→attr decomposition). The rounds≥2/≥3 restriction (scripts/analyze-trickshape-robust-20261017.js) is a *sensitivity analysis on the descriptive comparison*, not a re-score of any GO/NO-GO — and it is reported honestly as written after the primary analysis, with its direction noted (it strengthens, not weakens, the finding).
- **Scope honesty:** the matched comparison is the TB path only, per the pre-registered scope note. The field-AI path fired 656× on this substrate — but 99%+ on w3+ villagerTricks (redactor/wait 263, spool/wait 184), a different trick system measured end-to-end by sim-execensus. Counting them as "performed" in the TB funnel would have mixed two funnels; they are reported descriptively.
- **Survivor-bias note for the next run:** the pooled survival delta (+40.9pp) mixes causal effect with selection (round-1 one-shots can't perform). The rounds≥2/≥3 cuts address it and the effect persists (+61/+79pp) — but a cleaner future design would match on fight-length *ex ante* (e.g. compare fights that reached round 3 with vs without a performance by round 3). Proposed revision for the NEXT run's header, not this one.

## Results

Sweep complete 2026-10-17: 16/16 runs finished (8 fresh seeds [1901–1908] × {leadfeast, belongfeast}), 180d death-aware, 0 dropped runs. 460 TB fights → 338 trick-bearing (fight,mid) rows → **106 performed**. Per-seed JSONs: evidence/2026-10-17/perseed-trickshape/. Transcripts: evidence/2026-10-17/trickshape-beats/. Summary: evidence/2026-10-17/trickshape-SUMMARY.json.

### PRIMARY: GO — 100.0% attribution (106/106)

Every performed (fight,mid) row carries complete fight shape (result, rounds, p HP start/end, survival). Zero unattributed.

### Do performed tricks change fight shape? YES — but loss→flight, not loss→kill

Pooled, matched on mid + era(30d) + partyN bucket (scholar present):

| metric | T (performed) | C1 (known, not performed) | delta |
|---|---|---|---|
| p survival | 94.3% (n=35) | 53.4% (n=73) | **+40.9pp** |
| mean HP cost | 17.8 | 19.6 | −1.8 |
| mean rounds | 4.6 | 6.5 | −1.9 |
| outcome won | 45.7% | 41.1% | +4.6pp |
| outcome flight | 48.6% | 12.3% | **+36.3pp** |
| outcome lost | 5.7% | 46.6% | **−40.9pp** |

vs C2 (all non-performed, n=44/90): survival 93.2% vs 62.2% (+31.0pp); won 50.0% vs 52.2% (no movement); flight 43.2% vs 10.0%; lost 6.8% vs 37.8%. Companion deaths 0.0% both arms.

Robustness (rounds≥2, n=24/49): survival 95.8% vs 34.7% (+61.1pp); won 29.2% vs 32.7% — **kills do not move**; given survival, won 30.4% vs 94.1%, flight 69.6% vs 5.9%. rounds≥3: same shape (survival +79.0pp; given survival, flight 73.3% vs 20.0%).

**The mechanism-level finding:** performing a trick converts *losses into flights*, not losses into kills. Conditional on the scholar surviving, a performed-trick fight ends in flight ~52–73% of the time vs ~6–23% for matched non-performed fights. Tricks are survival/disengage tools — they get the scholar out alive; they do not, in aggregate, create kills.

### The perf→attr decomposition: where the 43 unattributed performances go

106 performed → **63 won+attributed**, **24 routed+unattributed**, **19 lost+unattributed**.

- **routed (24):** strike_lead 14, keep_distance 5, wait 2, sidestep 2, offer_food 1. The trick-bearing species fled or was driven off — **there is no kill to attribute.** The funnel's attribution channel only records kills, so disengage-shaped tricks systematically under-attribute. This is a measurement artifact of kill-attribution, not a design failure.
- **lost (19):** wait 11, move_windup 3, strike_nonhead 2, strike_first 1, sidestep 1, keep_distance 1. Concentrated in `wait` — the attrition trick (see sense-read 3) — and the known-lethal ducks fight (funnel sense-read 2's finding, replicated: strike_nonhead 2/3 lost).

### Per-kind: tricks have different shapes, and the fiction explains each

| kind | n | won | flight | lost | surv | hpCost | rounds |
|---|---|---|---|---|---|---|---|
| strike_windup | 9 | 100% | 0% | 0% | 100% | 5.7 (C1 45.4) | 2.2 (C1 27.8) |
| shout | 6 | 100% | 0% | 0% | 100% | 0.7 | 4.3 |
| strike_recovery | 3 | 100% | 0% | 0% | 100% | 5.3 | 2.0 |
| move_x2 | 3 | 100% | 0% | 0% | 100% | 1.7 | 7.3 |
| eyes | 2 | 100% | 0% | 0% | 100% | 11.5 | 3.0 |
| strike_first | 5 | 80% | 0% | 20% | 80% | 20.0 | 14.0 |
| move_windup | 14 | 78.6% | 0% | 21.4% | 78.6% | 30.4 | 5.6 |
| sidestep | 9 | 66.7% | 22.2% | 11.1% | 88.9% | 25.7 | 8.9 |
| keep_distance | 16 | 62.5% | 31.3% | 6.3% | 93.8% | 22.8 | 4.8 |
| strike_lead | 16 | 12.5% | **87.5%** | 0% | 100% | 15.1 | 3.4 |
| wait | 19 | 31.6% | 10.5% | **57.9%** | 42.1% | 55.5 | 10.7 |
| strike_nonhead | 3 | 33.3% | 0% | 66.7% | 33.3% | 69.0 | 18.3 |
| offer_food | 1 | 0% | 100% | 0% | 100% | 0.0 | 1.0 |

- **strike_windup is a genuine kill-window creator** (100% won vs 40% matched known-not-performed; HP cost 5.7 vs 45.4; 2.2 vs 27.8 rounds, n=9/5). Lethality design already exists where the fiction supports it — no global "tricks need to hit harder" lever is indicated.
- **strike_lead is a disengager** (87.5% of performances end with the pack routing; 0% lost). The fiction — "Wound the lead: the pack's silence shatters" — is the mechanism (sense-read 4).
- **wait is a war-of-attrition commitment** (10.7 rounds, 55.5 HP cost, 42.1% survival): performing it means *staying* in a fight the scholar would otherwise flee round 1 (matched known-not-performed wait fights: 100% survival, 0 HP cost, 1.0 rounds, 0% won). The trick trades survival for a 31.6% kill chance. The losses are the price of the strategy, visible in the fiction (sense-read 3).
- strike_nonhead (ducks_in_a_row) replicates the funnel's finding: the trick works (discoveries fire) but the ducks are lethal.

### Wall numbers (context — pre-seat by design)

national 7/16, table 12/16, won 0/16 (pre-seat), wave4 0/16, wave5 0/16, median survival 146d (11 villages lost, 5 reached 180d). Within noise of the funnel census's wall state on this substrate (10/16, 15/16 — seed noise; no LOUD lines from telemetry-check on national/table).

## Village assessment

The villages that reached the trick game look like villages learning to use what they know — unevenly. The scholar performs tricks in ~31% of trick-bearing contacts (106/338 rows), and when they do, they come home alive: 94% survival vs 53–62% in matched fights where the known trick went unperformed. The knowledge persists and compounds (203 known-at-start in the funnel's terms), but the *application* is where the village's character shows: the strike_windup interrupt artists who end fights in 2 rounds untouched; the hushwolf pack-breakers who wound the lead and watch the pack run; the moderator-haunted scholars who know silence is the answer and strike anyway.

Who died: 11/16 villages, mostly mid-ambition (median 146d). The wait/moderator arc is the emblematic death: the scholar *knows* the counter ("The algorithm cannot moderate silence"), performs it ("You hold still, watching."), then relapses into the muted verb — five violations, each +3 harder — and goes down. The knowledge is real; the discipline isn't. That's a villager-acting-like-a-person beat, not a robotic one: a person who knows the right thing and does the wrong thing under pressure.

What was missing: not trick lethality, not conditions — **discipline under the mute** (a policy-lane blank, filed to sim-findings) and **attribution for disengagements** (a measurement blank, the verdict's named next). The field path tells its own story: villagers actuate tricks 656× across the 16 runs (nearly all w3+ villagerTricks — redactor/spool/buffering) — the village fights like it knows things constantly; this arm didn't trace those outcomes (execensus's territory on its substrate).

The blank filled: the perf→attr gap is now MECHANIZED — 24 routed (measurement artifact) + 19 lost (fiction-coherent pockets), with per-kind fight shapes and 4 transcript reads. The blank documented: the kill-attribution channel's blindness to trick-driven disengagement.

## Sense-testing (transcript reads)

**Read 1 — the kill window (leadfeast-s1901, d113, drumbelly_tanuki, strike_windup, won, 1 round, 0 HP cost):** "PATIENT AIM: first strike — and your training piles on. (x2.30)" / "AMBUSH: first blood. ×1.5." / "OVERCHARGED ×1.25 (well-fed): food is fuel." / "You STRIKE the tanuki for 263 (Hardlight knife)." / "The Big Loud falls." / "📺 +20 style — dropped the Big Loud!" The scholar interrupts the drum-belly's windup with a single 263-damage first strike and the fight never starts. The trick reads as exactly what the fiction promises — strike the taut drum during the windup — and the engine honors it as a kill window. Coherent, decisive, earned (ambush + overcharged + first-strike stacking).

**Read 2 — the opener (leadfeast-s1901, d113, sanjun "The Mountain Lord", shout, won, 4 rounds, 0 HP cost):** "You cup your hands and BELLOW — raw noise, no words, all lungs." / "The Mountain Lord flinches — its note dies mid-croak. It hops back, throat fluttering." / "📺 +10 style — broke the chorus with raw noise" … then the scholar works it down: "It stops mid-prowl, ears flat. Blood on its muzzle, sides heaving. the mountain lord has decided you are not worth dying for — it melts back into the bamboo." / "The Mountain Lord falls." / "📺 +20 style — dropped the Mountain Lord!" The shout breaks the sanjun's chorus (its signature), the fight becomes a straight brawl the scholar wins untouched. The trick reads as a meaningful opener that neuters the monster's gimmick — a debuff that matters, setting up the kill.

**Read 3 — the attrition (leadfeast-s1901, d120, moderator, wait, lost, 14 rounds, 82 HP cost):** "⚔ THE MODERATOR! You're on your own." / "You hold still, watching." / "CONTENT UNDER REVIEW. It draws a circle on the dirt — purple, the color of a bruise." The scholar strikes twice (43, 39 — "moderator is BLEEDING — and it likes it. Louder, faster, no more feints."), then the field teaches: "🔇 STRIKE MUTED inside the suppression field. (It mutes what you lean on — vary your verbs, or step out of the purple. Comply with the mute and its Notices GRAZE; defy it and every violation hits +3 harder.)" The scholar defies it — violations 1→5, Notices hitting +3/+6/+9/+12/+15 harder — "Moderator's Deplatform hits you for 30." / "You go down." The fiction is brutally coherent: the trick (silence/varied verbs) is real and narrated; the scholar performs it ("You hold still, watching.") but keeps reaching for the muted verb and dies by the escalating violations. This is not a lethality failure — it's a person who knows the answer and can't stop doing the wrong thing. (Policy-lane blank: filed to sim-findings — the bot never varies verbs or steps out of the purple.)

**Read 4 — the disengagement (leadfeast-s1902, d19, hushwolf "Hushpuppy", strike_lead, routed, 3 rounds, 19 HP cost):** "The woods go silent — not quiet. Silent." / "The Hushpuppy is on you — no warning, just teeth." / "Hushpuppy hits you for 11." / "The lead staggers — and the pack's silence shatters into yips and snarls. Coordination broken. (WOUND THE LEAD: it worked.)" / "wolf is hurt — and it goes quiet and clever. It stops rushing. It starts CHOOSING. Watch the spacing." / two more strikes (28, 13) / "Wolf's Harass hits you for 8." / "The Hushpuppy breaks and runs!" The trick works exactly as the fiction promises — wound the lead, break the pack's coordination, the pack runs. The scholar walks away alive at 19 HP cost. And the funnel counts this performance as "unattributed" — because there is no kill. This is the measurement artifact made flesh: the trick did its job; the attribution channel only speaks kill.

Verdict from the reads: tricks read as meaningful in the fiction — a kill-window interrupt, a gimmick-breaking opener, a real-but-undisciplined attrition counter, a pack-breaking disengagement. None reads as a flourish on a decided fight; two read as the *reason* the fight ended the way it did.

## Findings / named nexts

**VERDICT: (c) nothing — no game-design lever.** The perf→attr gap is not a lethality failure and not a conditions failure:

1. **56% of the gap (24/43) is kill-attribution's measurement artifact.** The fights ended `routed` — the trick-bearing species fled or was driven off. There is no kill to attribute, by construction of the channel. Disengage-shaped tricks (strike_lead: 87.5% of performances end in flight) systematically under-attribute. The trick worked; the ledger is blind to it.
2. **The rest (19/43) are fiction-coherent lethality pockets**, not a systemic gap: `wait` (11) is the attrition strategy — performing it means staying in a 10.7-round war instead of fleeing round 1, and the 42% survival / 32% win rate is the strategy's price, legible in the fiction; `strike_nonhead` (2) is the known-lethal ducks fight (the trick works — discoveries fire — the ducks are just lethal, per the funnel's sense-read 2); the remaining 6 are scattered singles.
3. **Performed tricks are not inert** — they change fight shape decisively (survival +40.9pp vs matched known-not-performed, persisting under rounds≥2/≥3 cuts) — but the change is loss→flight, never loss→kill in aggregate. Per-kind, lethality design already exists where the fiction supports it (strike_windup: 100% won, HP cost 5.7 vs 45.4). A global "tricks hit harder" lever would flatten real heterogeneity; a conditions lever would push on the wrong gap (known→cond is the sibling reposition arm's + the knowledge line's territory).

**The named next (precise):** if the funnel's attr number must move, the lever is the *attribution channel*, not the game — record trick-driven disengagements as a distinct outcome class (routed-via-trick) alongside kill-attribution. That is a telemetry/measurement change (waveKillLog or a parallel ledger), zero combat-design change. No (a), no (b).

**Filed to sim-findings (policy lane, not chased):** the moderator verb-variation gap — the scholar performs `wait` correctly ("You hold still, watching.") but then strikes into the mute 5× (violations +3 each) instead of varying verbs or stepping out of the purple, and dies. The fiction explicitly teaches the counter ("vary your verbs, or step out of the purple", "go quiet until it loses the thread"); the tribfloor bot never does. Sibling sim-reposition's territory.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-10-17/perseed-trickshape/*.json' --metrics national,table,wins,exiled` fired 1 LOUD line — EXPLAINED, no baseline roll:
- `wins disappeared: baseline 16 -> current 0`: substrate-mismatch (baseline = win-side stack; this census runs pre-seat, SEATDRIVE=0 explicit — wins 0 by design; the recurring pre-seat LOUD class). national 7/16 and table 12/16 fired nothing (within noise of the funnel census's 10/16, 15/16 on this substrate).
Baseline kept.

## Blank-fill record

- FILLED (instrument): the fight-shape census — per-fight shape snapshots (rounds, performer HP start/end, companions, monster end-states, kill-attribution join) on the funnel's proven capture pattern; proof 22/22 GREEN (PURE, RED→GREEN, LIVE, DET-GATE byte-identical, SMOKE).
- FILLED (measurement): 16-run sweep (8 fresh seeds 1901–1908 × {leadfeast,belongfeast}, 180d death-aware), PRIMARY GO (106/106 attribution); the perf→attr gap mechanized (24 routed + 19 lost, per-kind shapes, matched deltas with n).
- FILLED (sense): 4 transcript reads — the kill window (strike_windup), the opener (shout), the attrition (wait/moderator), the disengagement (strike_lead/hushwolf).
- DOCUMENTED (not fixed — telemetry, not game design): the attribution channel's blindness to trick-driven disengagement (routed-via-trick outcome class); the moderator verb-variation policy gap (filed to sim-findings, sibling lane).
