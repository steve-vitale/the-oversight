# sim-outshone-liveness — DIAG/fix arm: OUTSHONE epilogue naming dead villagers (flesh-out loop, 2026-10-20)

Run: fleshout-20261020T0715Z (diag arm on out-of-arm finding from arm sim-tablepathdriver-confirm, run fleshout-20261020T0715Z, "OUTSHONE liveness check").
Axis: scale-onramp (diag — no lever arm; a text/liveness bug in the win-epilogue path that prices the same ascensions into the table audit).

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE any sim)

**Finding under test:** the leadfeast-s81302 armed epilogue (evidence/2026-10-20/tableconfirm-transcripts/leadfeast-s81302.txt:356) says "◈ OUTSHONE — Marcus Webb did what you would not: acted, boldly, while there was still time. The village thrives. The god is someone else." — while a villager named Marcus died day 88 to The Callback on the same run (per-seed record perseed-tableconfirm/armed/leadfeast/s81302.json: deaths {combat:15, 'villager combat':6, expedition:2, 'The Callback':1}).

**Question:** bug (dead villagers eligible in the ascension name pool) or design (deliberate memorialization)?

**PRIMARY metric (GO):** in the armed corpus (seeds s81301–s81312 × {leadfeast, belongfeast}, SEATDRIVE=1/tablepath instruments), every villager NAMED in an epilogue beat (OUTSHONE / THE ARCHITECT / THE PANTHEON) and COUNTED in the AUDIT's ascension line resolves to a villager alive at epilogue time. GO = 0 dead namings post-fix, with the pre-fix corpus showing ≥1 (s81302 Marcus Webb) as the RED demonstration.

**Corpus:** the tableconfirm armed sweep seeds 81301–81312 (NOT the pilot's 64201–64208) × {leadfeast, belongfeast} × SIDE=armed, identical seeds before/after. Substrate identical to the confirm: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1 KILLDISC=1 TABLEPATHDRIVER=1 RELAYDARK=1, slot placement via scripts/tableconfirm-slots-20261020.js. Death-aware horizons: 180d max, dead villages stop (+10d tail) — set from the confirm's own horizon since this is a re-run of its armed side, not a new longevity question. Epilogues fire only when a run reaches the table; runs that never sit contribute no naming data (recorded as N/A, not as passes).

**Policies:** read-only landed instruments (probe-tablepathdriver-20261020, policies/tablepathdriver, relaydark). Zero policy edits in this arm.

**Instrument note:** the balanced panel (MEASUREMENT.md §15) is the instrument for before/after BALANCE comparisons. This arm fixes a deterministic code-path liveness bug with a binary metric (named-dead / not-named-dead) — the panel's distributional machinery does not apply. The instrument here is the identical-seed armed-corpus epilogue audit: same seeds, same substrate, same instruments, pre-fix vs post-fix, names checked against the live dead flags.

**Convergence (scale-onramp axis):** unchanged by this arm — a diag/fix, not an on-ramp experiment. Reported at the bottom.

## Diagnosis

Canon read FIRST (docs/CANON.md + docs/TABLE.md):
- TABLE.md: "If NO facilitation and an unbacked villager outscores the Bearer: the honest outshone epilogue — the village thrives, the god is someone else, the record notes you watched." Present-tense claim about a living ascendant.
- No canon anywhere describes posthumous ascension, epitaph epilogues, or the table honoring the dead as gods.

Code (src/js/table.js):
- `tableEpilogue()` (~line 1229) fires the ARCHITECT / OUTSHONE beats from `tableAscended()` (~line 1211).
- `tableAscended()` iterates `this.data.villagers` and excludes ONLY the player's villagerId. NO dead filter.
- The same dead ascensions also price the audit: line 117 (`ascBonus = tableAscended().length * 10`) and line 492's voiced audit line "The table notes N ascension(s) from one village — its terms improve accordingly."
- The codebase's own conventions elsewhere require living villagers: table.js:293 names villagers with `!x.dead` for the grounding beats; table.js:1156 refuses `tableFacilitate('teach')` with `person.dead` ("There is no living villager here to receive that lesson."). The ascension pool is the only naming surface that forgot the filter.
- `v.dead` is set on the SHARED `data.villagers` records at death (game.js:1642 comment; betrayal.js:1000, alienPlayers.js:1039/2252/2593), and `tableAscended()` reads those same shared records — so the dead flag is reliably visible at epilogue time.

Sense-read of the s81302 transcript line (d102): "◈ OUTSHONE — Marcus Webb did what you would not: acted, boldly, while there was still time. The village thrives. The god is someone else. The record notes, kindly and accurately, that you watched. It stings exactly as much as it should."
- If Marcus died day 88 and the table sits day ~102, "The god is someone else" is false in present tense — there is no living god Marcus. There is no epitaph language anywhere in the beat; nothing marks it as remembrance. It reads as a writer's honest sentence applied to the wrong person: a liveness bug, not a memorial design.

**Verdict: BUG.** Dead villagers are eligible in the ascension candidate pool, and the dead figure is named as the present-tense outshining god (and priced into the audit's standing). Small, exact fix: `tableAscended()` skips villagers with `v.dead`. Text-adjacent (epilogue naming surface) — commit carries [needs-eyes].

## The fix

src/js/table.js, `tableAscended(bar)`: skip dead villagers (`if (!v || v.id === this.villagerId || v.dead) continue;`). One predicate, one line, no behavior change for living villagers. The ARCHITECT/OUTSHONE/PANTHEON beats and both audit-pricing sites (line 117, line 492) all consume `tableAscended()`, so all are covered by the single fix. `villagerAscensionScore()` itself is left untouched — its other caller (`tableFacilitate('teach')`) already rejects the dead before scoring.

Proof: scripts/test-outshone-liveness-20261020.js (RED→GREEN, below).

## Results

**RED→GREEN proof (scripts/test-outshone-liveness-20261020.js):**
- Pre-fix (hunk reverted via patch file, stash forbidden on this tree): 3/6 FAIL — dead hero "Ali Al-Luhaidan" (score ≥45) in `tableAscended()` pool, named in the OUTSHONE beat, counted in audit pricing.
- Post-fix: 6/6 PASS — dead villager excluded from pool, OUTSHONE names only the living hero, audit counts 1.
- Regression: scripts/test-table-ascension-20261013.js 17/17 green; scripts/test-tableconfirm-20261020.js ALL GREEN.
- NOTE: scripts/test-tablepathdriver-20261020.js fails identically WITH and WITHOUT the fix (RELAYDARK REAL-VERB grounding erosion assertion, pre-existing on the landed tree) — unrelated to this arm, not chased (staying on axis).

**Identical-seed before/after on leadfeast-s81302 (the finding's seed), same harness, only the hunk differing:**
- PRE-FIX: epilogue fires d102 — "The table notes 1 ascension from one village" + "◈ OUTSHONE — Marcus Webb did what you would not...". Exactly one villager named Marcus Webb exists in the run (id=marcus_webb), dead=true, ascension score 45 (exactly the bar) — he IS the entire ascended pool. The epilogue named a dead man as the present-tense god.
- POST-FIX: no epilogue fires; the run ends d102 without sitting. Causal, not incidental: the ghost ascension's +10 standing was priced into `tableEarnedPaths()`, and the invitation's door list (table.js:550 `tableEarnedPaths().filter(p => p.earned)`) carried it. The dead villager wasn't just misnamed — he was load-bearing in the table's pricing on that seed.

**Corpus (post-fix armed sweep re-run, seeds s81301–s81312 × {leadfeast, belongfeast}, identical substrate/slots as the confirm; pre-fix record: 1 dead naming in 1 pre-fix epilogue):**
- 24/24 FIDELITY-OK (same end day as the pre-fix sweep on every seed).
- Only one run fired epilogue beats post-fix: belongfeast-s81302 — OUTSHONE + PANTHEON naming "Eduardo Epstein and Marcus Webb", audit "2 ascensions". Liveness check at epilogue time: all named figures alive (dead=false, deadDay null); ascended pool both alive. (This run's Marcus Webb is a different, LIVING person — names regenerate per run — and the beat reads coherently: "The god is someone else", PANTHEON "the way the living argue about weather".)
- All other 23 runs: no epilogue beats fired (runs never sat, or no villager cleared the bar) — recorded N/A, not passes.
- PRIMARY metric: 0 dead namings post-fix vs 1 pre-fix. GO.

## Metric review (§14 — anti-drift)

The metric was honest and bound the run. Two notes for the NEXT run, not this one:
1. The corpus is epilogue-thin: only 2 of 26 armed runs (pre + post) ever fired naming beats — epilogues need the table + a ≥45 ascendant, which is rare in this corpus. The binding evidence is the identical-seed before/after + the RED→GREEN proof, not the corpus breadth. A future liveness arm that wants corpus breadth should synthesize seated villages (like the proof test) rather than harvest long sims.
2. The fix has a real mechanical consequence beyond the text: removing a dead ascension can un-earn doors (s81302's relay seat depended on the ghost's +10). This is the CORRECT behavior (the table prices the run, not its ghosts), but it means the fix is not cosmetically neutral on trajectories — worth one line in the ship note.

## Sim-findings appended

- [open] 2026-10-20 — table epilogue — `tableAscended()` also priced dead ascensions into the table audit's standing (+10/path) and the invitation's door list (table.js:550); fixed in this arm's commit (the naming bug and the pricing bug were one predicate). (arm sim-outshone-liveness, evidence/2026-10-20/sim-outshone-liveness.md)
- [fixed] 2026-10-20 — table epilogue — OUTSHONE/ARCHITECT/PANTHEON beats named dead villagers as present-tense gods (leadfeast-s81302: dead Marcus Webb, score 45, entire ascended pool). Fixed: `tableAscended()` skips `v.dead`; RED→GREEN proof + identical-seed before/after. (arm sim-outshone-liveness)

## Convergence

Scale-onramp axis: UNCHANGED by this arm — a diag/fix, not an on-ramp experiment. The axis's blocking question (villages reaching national/table in sims) is untouched; this arm repaired a win-path epilogue bug found while measuring the table. Report state: converging (no new on-ramp evidence this run).

## Village assessment

What the post-fix corpus villages looked like: 24 armed seated-stack runs, all fidelity-pinned to the pre-fix sweep. The villages themselves are unchanged (the fix touches only table-time naming/pricing, and trajectories match on every seed except s81302, where the table seat was ghost-priced). The one post-fix epilogue that fired (belongfeast-s81302, d156) reads honestly: two living ascendants outshine a passive Bearer <redacted>, the PANTHEON beat lands, the audit's "2 ascensions" counts the living. Blanks filled: (1) dead villagers eligible in the ascension pool — fixed; (2) ghost ascensions pricing the audit and invitation — fixed by the same predicate. Blanks documented: epilogue corpus is thin by construction (see metric review); the "different Marcus Webb" naming-confusion question is answered — names regenerate per run, and liveness is now enforced at the pool, so a living same-named villager names correctly and a dead one never does.
