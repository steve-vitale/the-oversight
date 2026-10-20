# sim-contestcensus — contest lethality for recovering champions (flesh-out loop, 2026-10-20)

Run: fleshout-20261020T2145Z, arm sim-contestcensus. Axis: scale-onramp (the blocking axis — the wave-5 door's veteran leg needs 2 LIVING veterans).
Backlog: killeraftermath named next #3 (contest lethality for recovering champions, UNMEASURED).
Worktree: ~/workspace/worktrees/sim-contestcensus. DIAGNOSTIC, ZERO new sims, ZERO src/js.

Canon: docs/CANON.md (read), docs/CONTESTS.md (read — contests UNAVOIDABLE; the grab lands; even refusal is a played sequence; eligibility visible; "battered scholar IS eligible"; the player is the surest star, taken first when castable; casting weighted by notabilityWeight).

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE analysis)

**Question:** among villagers/scholars who land a wave-4+ kill, what share of their post-kill deaths (within +30d, E3 convention) are contest deaths, and by what mechanism per case?

**Census corpus (scope decision, documented):** `perseed-killattr/{control,armed}/{leadfeast,belongfeast}/s64xxx.json` (32 runs). These are the ONLY corpora with per-vid death records (KILLATTR instrument). The villagergear corpora (`perseed-villagergear-pilot/`, `perseed-villagergear-confirm/`) carry `w4killsDetail` (killer vid + kill day) but only AGGREGATE `deathCauses` — no per-vid death records, so killer-death attribution is impossible there. They enter as a SECONDARY contest-count correlation, and the gap is a named next (re-instrument with per-vid death records). The armed corpus is included alongside control: same KILLATTR instrument, identical seeds/substrate, the lever (KILLERSTAND, killed-at-pilot, reverted zero-trace) did not touch the contest engine — and it is where the flagship contest deaths live (leadfeast s64002 d79). Reported separately, then pooled for the contest-share question.

**PRIMARY (binding):** classification completeness — 100% of post-wave-4-kill killer-deaths-within-30d in the census corpus classified by mechanism, **0 unexplained**. A death that cannot be placed by cause+ctx flags is `unexplained` (never silently `alive`). GO: 0 unexplained. A miss is NO-GO, never re-scored.

**SECONDARY (report, not judge):** contest share of killer deaths within +30d; per-case mechanism table; median kill→death lag; censored/non-scholar tallies with exact reconciliation (rows + censored + nonScholar == w4+kills).

**Method:** `scripts/analyze-contestcensus-20261020.js` (deterministic classifier, exports pure functions). Proof: `scripts/test-contestcensus-20261020.js` — RED→GREEN on hand-built fixtures (contest death → contest; noFlee/arena → sealed-fight; haven combat alone → haven-encounter; raid-night → raid; same-day → kill-fight; starvation → attrition; no death → alive; missing cause+flags → unexplained; named unknown cause → other:<cause>; censored at kill+30d > run end; counts reconcile exactly with the input waveKillLog entries). No game modules are eval'd (pure data analysis), so the harness seeding rules do not apply. Test writes nothing into the repo. Classifier taxonomy ordering (first match wins): kill-fight (death.day === kill.day) → contest (cause='contest') → sealed-fight (noFlee || arena) → raid (raidNight && atHaven && combatish) → haven-encounter (atHaven && inTb && combatish; allies counted) → expedition-encounter / wild-encounter / combat-non-tb → attrition → alive → other:<cause> → unexplained.

**Sense-testing (SENSE-TESTING LAW):** 2–3 contest deaths of recovering champions. NOTE (documented before analysis): no Game.say transcript of any contest death exists in the committed corpora (sweep logs are progress lines only), and new sims are prohibited for this arm. The sense leg therefore reads (a) the full death-record context windows of the contest deaths, and (b) the contest engine's own authored strings — the exact text a champion would see before the grab (announcement, countdown dread, grab-day, recast) — quoted from src/js/contests.js, plus the casting rules (notability-weighted, surest-star-first, recency repel, gravely-wounded bar). Judgment against docs/CONTESTS.md: does a recovering champion being taken read as a real contest with stakes, and as fair vs a trap?

**Metric review (§14):** [filled after analysis]

**Convergence state for this axis:** [filled after analysis]

---

*(results below — filled after analysis; the pre-registration above is unchanged)*

## Results

Analyzer run 2026-10-20: 32/32 committed corpus files present (control 16 + armed 16), 0 instrument errors, 0 missing files. Census JSON: `evidence/2026-10-20/contestcensus.json`.

**Corpus:** 36 wave-4+ kills total → 28 censused rows (scholar kills, uncensored), 8 censored, 0 non-scholar. Reconciliation exact: 28 + 8 + 0 === 36.

**Taxonomy (pooled):** haven-encounter 19, kill-fight 3, contest 3, sealed-fight 3. Median kill→death lag 7.5d. **Alive at +30d: 0/28.**

Split by arm — control: haven-encounter 10, kill-fight 1, contest 0 (11 rows, matches the committed `killattr-taxonomy.json` exactly). Armed: haven-encounter 9, kill-fight 2, contest 3, sealed-fight 3 (17 rows, matches the killerstand autopsy's "9 / 2 / 3 / 3" exactly).

### PRIMARY verdict: GO — 0 unexplained

All 28 killer deaths within +30d classified by mechanism with named evidence. No `unexplained`, no silent `alive`.

### The contest share: 3/28 = 10.7%

All three contest deaths are ONE event: **armed leadfeast s64002, day 79** — the run's entire champion line (eater d71 killHP=70, strike d77 killHP=98, algorithm d78 killHP=40; lags +8d/+2d/+1d) died in a single contest, recorded at the teleport (cause='contest', atHaven=true, inTb=false, arena=false, allies=0). The same seed's CONTROL twin tells the counterfactual: the identical three kills died d85 to a feast-drawn suburb haven-encounter (+14/+8/+7d). The contest didn't steal a survivor — it rerouted a champion who was going to die within the week. (Armed s64002 recorded standBeats=1 — the killed lever fired once, then the contest took the champion.)

Background rate for context: the corpora carry 8 contest deaths per arm per 16 runs (~0.5/run) — contests kill scholars at a steady background rate. The champion-specific toll is 3 deaths in 32 runs. The champion is not disproportionately taken; but when taken, the contest can sweep an entire run's champion line at once.

### Per-case table (censused rows; abbreviations: HE=haven-encounter, KF=kill-fight, C=contest, SF=sealed-fight)

| arm | policy | seed | kill | kill day | killHP | death | lag | class | ctx |
|---|---|---|---|---|---|---|---|---|---|
| control | leadfeast | 64002 | eater | d71 | 70 | d85 | +14 | HE | suburb, allies=0 |
| control | leadfeast | 64002 | strike | d77 | 98 | d85 | +8 | HE | suburb, allies=0 |
| control | leadfeast | 64002 | algorithm | d78 | 70 | d85 | +7 | HE | suburb, allies=0 |
| control | leadfeast | 64003 | algorithm | d94 | 39 | d94 | +0 | KF | moderator |
| control | leadfeast | 64008 | strike | d61 | 100 | d62 | +1 | HE | audit, allies=0 |
| control | belongfeast | 64006 | strike | d57 | 97 | d64 | +7 | HE | congregation, allies=0 |
| control | belongfeast | 64007 | strike | d62 | 100 | d87 | +25 | HE | redactor, allies=0 |
| control | belongfeast | 64007 | strike | d76 | 100 | d87 | +11 | HE | redactor, allies=0 |
| control | belongfeast | 64007 | congregation | d83 | 100 | d87 | +4 | HE | redactor, allies=0 |
| control | belongfeast | 64008 | influencer | d71 | 50 | d81 | +10 | HE | reunion, allies=0 |
| control | belongfeast | 64008 | strike | d97 | 97 | d104 | +7 | HE | eater×2, allies=0 |
| armed | leadfeast | 64002 | eater | d71 | 70 | d79 | +8 | C | teleport, allies=0 |
| armed | leadfeast | 64002 | strike | d77 | 98 | d79 | +2 | C | teleport, allies=0 |
| armed | leadfeast | 64002 | algorithm | d78 | 40 | d79 | +1 | C | teleport, allies=0 |
| armed | leadfeast | 64003 | algorithm | d94 | 39 | d94 | +0 | KF | moderator |
| armed | leadfeast | 64008 | strike | d61 | 100 | d67 | +6 | HE | reunion, allies=0 |
| armed | leadfeast | 64008 | audit | d62 | 58 | d67 | +5 | HE | reunion, allies=0 |
| armed | belongfeast | 64006 | strike | d57 | 97 | d74 | +17 | HE | reunion, allies=0 |
| armed | belongfeast | 64006 | congregation | d64 | 76 | d74 | +10 | HE | reunion, allies=0 |
| armed | belongfeast | 64006 | eater | d97 | 71 | d97 | +0 | KF | reunion |
| armed | belongfeast | 64007 | strike | d62 | 100 | d85 | +23 | HE | moderator, allies=0 |
| armed | belongfeast | 64007 | influencer | d83 | 63 | d85 | +2 | HE | moderator, allies=0 |
| armed | belongfeast | 64007 | influencer | d97 | 77 | d116 | +19 | HE | reunion×4, **allies=2** |
| armed | belongfeast | 64007 | strike | d124 | 85 | d150 | +26 | SF | reunion×5, allies=1, arena |
| armed | belongfeast | 64007 | strike | d124 | 85 | d150 | +26 | SF | reunion×5, allies=1, arena |
| armed | belongfeast | 64007 | strike | d124 | 85 | d150 | +26 | SF | reunion×5, allies=1, arena |
| armed | belongfeast | 64008 | influencer | d71 | 50 | d81 | +10 | HE | reunion, allies=0 |
| armed | belongfeast | 64008 | strike | d97 | 97 | d104 | +7 | HE | eater×2, allies=0 |

Censored (8): control leadfeast s64005 congregation d154; s64006 suburb d100; s64008 eater d83, influencer d90, strike d98, congregation d108; armed leadfeast s64005 congregation d154; s64006 suburb d100. (Kill+30d beyond run end; listed, excluded.)

### Villagergear secondary (aggregate only — the documented gap)

28 per-seed files carry wave-4+ kills; total aggregate contest deaths: 13 (unattributable to vids). Companion-killer files (7): Dante d103, Mara d181×2, Meera d106, Tariq d61, Aurora d71, Nina d83, Luis d153. In 6 of 7, the seed's aggregate contest-death count is **0** — so those companion killers provably did NOT die to contests. The 7th (s64012, contestDeaths=2) is unattributable between Meera (companion kill) and Thabo (player kill). No evidence that villager champions die to contests; one unattributable case.

### Sense-testing (SENSE-TESTING LAW)

No Game.say transcript of any contest death is committed, and this arm runs zero new sims — so the transcript leg is the death records plus the contest engine's own authored strings, the exact text the d79 champion would have seen. The mechanism: a wave-4 kill writes notability; casting is notability-weighted (`notabilityWeight` — depth + impact), the player is "the surest star and is taken first when castable" (docs/CONTESTS.md), the whim and the player's first slot skip the recency repel (contests.js:91), and crucially **"Player bar unchanged (battered scholar IS eligible)"** (contests.js:75) — villagers get the health>20 "gravely wounded" floor; the scholar does not.

What the champion saw, day before (fireContest):
> 📺 The System has taken you. The village holds its breath.
> 📺 The grab comes at dawn. One more day. Sleep if you can.

Grab day (resolveContest):
> 📺 It is today. You dreamed about the cameras. Everyone did. The village is very quiet.

Then the interruption — "You go through the sequence. Participate or don't — but skipping isn't a thing." Contests are played, not RNG; the champion enters with their real stats.

**Judgment.** The fiction reads as a real contest with real stakes — announced a day out, the village reacting, the grab landing as an interruption. As fair vs trap: per canon it is fair-by-design. Contests are unavoidable; death is on the table; the System takes its stars, and a scholar fresh off three wave-4 kills (one walked out at 40 HP) is the galaxy's most interesting human. The refusal path exists and is itself played. The trap-reading has one honest leg, and it is a design asymmetry, not a bug: the "gravely wounded" bar protects villagers from being televised while the champion — who earned the slot with their blood — can be taken battered, because "battered scholar IS eligible." Whether that asymmetry is intended is a **steve-call** (it is the System's cruelty working exactly as written). And the counterfactual softens the charge: the d79 champion's control twin died six days later anyway. The contest didn't kill someone who would have lived; it changed the scenery of a death.

**Verdict on the named next:** contest lethality for recovering champions is REAL (one documented sweep: a single contest erased all three wave-4 kills of armed leadfeast s64002) but SECONDARY — 3/28 post-kill deaths (10.7%), against haven-encounter 19/28 (67.9%). The killeraftermath autopsy's #3 is answered: yes, contests can kill recovering champions, by design, and the observed instance killed a champion who was already doomed within the week.

## Metric review (§14 — binding, never re-scored)

- PRIMARY: GO. 0 unexplained across 28 censused killer deaths. The classifier's taxonomy matched both committed references exactly (control: 10 HE + 1 KF = `killattr-taxonomy.json`; armed: 9 HE + 2 KF + 3 contest + 3 SF = the killerstand autopsy). The 14-fixture proof test is GREEN (RED→GREEN cycle: missing module → 13/14 on a fixture arithmetic error of my own → 14/14).
- Corpus-scope note (§14): the villagergear corpora were excluded from the census by design, not by re-scoring — their per-seed JSONs carry only aggregate deathCauses, so killer-death attribution is impossible. This was a schema discovery during pre-flight, documented in the pre-registration above; the census GO gate covers the instrumented killattr corpus only. The villagergear bound (6/7 companion-killer seeds with 0 aggregate contest deaths) stands as secondary evidence.
- No metric was revised mid-run.

## Named nexts

1. [open] **Re-instrument the villagergear sweep with per-vid death records** (KILLATTR-style death-time ctx) before the census can cover villager killers. The `w4killsDetail` + aggregate `deathCauses` schema cannot attribute deaths to vids — the working VGEAR channel's champion fates are untraceable in the committed corpora. Small change: the sweep collector should emit the same death records the killattr sweep emits.
2. [open] **If contest lethality for recovering champions is real: what could a policy-side contest-prep lever honestly do, given contests are unavoidable?** The honest channel is narrow by design: the champion cannot be kept off the cast list (surest-star-first, battered-scholar-eligible, no recency repel on the player slot), so the only lever is entering the contest in fighting shape — a post-kill recovery protocol (heal, eat, rest, trauma management) maximizing survival odds in a PLAYED contest. Measurable on identical seeds as contest-death share among champions; expected effect small (3/28 of post-kill deaths), and it cannot touch the haven-encounter channel (19/28).
3. [steve-call] **The eligibility asymmetry:** villagers are off the board below 20 HP ("gravely wounded"), but the battered scholar is always castable. The d79 champion walked into the contest one day after walking out of a wave-4 kill at 40 HP. Working as designed — is it intended that the champion can be taken while wounded where a villager would be protected? A design ruling, not a bug fix.
4. [open] The sealed-fight d150 deaths (3× strike d124 → d150, arena=true, 5× reunion) remain the #695 sealed-fight shape killing a veteran at +26d — outside any recovery window and untouched by this census's verdict.

## Convergence state for this axis

Converging, unchanged. This arm was a diagnostic census, not a lever: the w5 door's veteran leg remains the binding wall. The contest channel is now measured (3/28, secondary to haven-encounter 19/28); no lever is proposed for it this run. The working veteran path remains VGEAR's villager-killer channel, whose contest exposure is bounded (6/7 companion-killer seeds with zero contest deaths) but unattributable at the per-killer level pending named next #1.

Wall numbers (carried from the killattr control corpus, `killattr-taxonomy.json`; this arm ran zero sims): national 8/16, table 13/16, wins 0/16, wave4 14/16, wave5 0/16, median survival 139d.
