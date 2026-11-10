# sim-doorwalk-feared-b — the un-walked doors: feared ×2, witness ×2 — PILOT NO-GO on a classifier artifact

**Arm:** sim-doorwalk-feared-b · **Run:** oversight-playtest-loop-2, 2026-11-10 00:56Z (Lane B leg 4 — endgame, journey-endgame r167) · **Branch:** journey2-endgame, base master `a64d6e91a` · **Policy:** `scripts/policies/competent-doorwalk-b.js` + new env gate `DOORWALK_ROTATION=feared-witness` (default rotation unchanged; policy-side only, zero src/js, zero default flips) · **Horizon:** 150d death-aware · **Proof:** `scripts/test-doorwalk-feared-b.js`, **41/41 green** · **Analyzer:** `scripts/doorwalk-feared-b-analyze-20261110.js` · **Driver:** `scripts/doorwalk-feared-b-driver-20261110.js` · **Transcripts:** `scripts/doorwalk-feared-transcript-20261110.js` + `evidence/2026-11-10/table-transcripts-doorwalk-feared-b-s<seed>.json` (full say stream from day 85) · **Prereg:** `evidence/2026-11-10/sim-doorwalk-feared-b-prereg.md` (committed 550e25861 before any judged sim, plus Corrections 1–2).

## The question (from the prereg)

The doorwalk arm (2026-11-07) walked beloved, relay ×2, defiant, assimilated — all light/grey, all won 5/5 through first-option beats. Feared was offered on all five sits and never walked; witness was offered on four and never walked. This run walks the un-walked doors: when a competent player sits and is assigned feared or witness, does the door walk and resolve — and do its beats read as real choices with real stakes (sense-test), not a first-option drain to a foregone win?

## PILOT VERDICT: NO-GO — on a classifier artifact, not a lever failure

Frozen band 53001–53008, 150d, before vs after on identical seeds, one master (`a64d6e91a`).

| Bar | Result |
|---|---|
| 1. Primary — doors entered ≥3/8 armed vs 0/8 baseline; every entered door feared/witness (fallback only if assigned not offered/earned); every entered door reaches a resolution | **PASS.** Entered **5/8** armed vs 0/8 baseline. Feared ×2 (53003, 53007), witness ×2 (53006, 53008), beloved ×1 — the beloved is the documented fallback (53004: witness never offered, 5 doors; rule `fallback-non-feared` recorded). Non-compliant walks **0**. Unresolved **0** (all five reached a finals answer and won). |
| 2. Substrate sanity — baseline lesser ≥3/8 AND sat ≥3/8 | **PASS.** Lesser **5/8**, sat **5/8**. |
| 3. Substrate guard — per-seed exact reproduction ≥6/8 | **PASS. 8/8.** Never-entered seeds reproduce the baseline whole-run; entered seeds reproduce every daily row before the entry day. |
| 4. Cost — starvation ≤ baseline+2 AND arm-only ≤2 | **PASS.** Starvation **2 → 2**, arm-only **0**. |
| 5. Cost — survival non-inferiority (REVISED — per-seed, won seeds count as success) | **PASS. 0 violations.** No non-won armed seed dies earlier than its baseline pair. |
| 6. Reachable — every reachable seed sits AND walks; offered-not-taken empty on armed leg | **FAIL — the artifact.** Reachable set {53003, 53004, 53006, 53007, 53008}: **all 5 sat AND walked, missed 0**. But the classifier counts **10 offer-not-taken gate days** on the armed leg (53004: 5, 53006: 1, 53008: 4). |
| 7. Sense-test — full transcript read per walked door | **PASS.** All five walks read as that door's game (see Sense-test read). |

**The 10 offer-not-taken days are a stale-snapshot artifact.** The classifier labels a day offer-not-taken from the once-daily snapshot (preview.ready at snapshot time) + no verb call that day. But the sit drive decides 3×/day on the LIVE preview (`competent-linkfeast-b.js:132–136`: `tablePreview()` read at upkeep; `!ready` → classified skip `not-ready:<why>`, verb never called). On every one of those 10 days the drive ATTEMPTED and was refused by a live encounter: 53004 carries 30 `not-ready:Finish the current encounter before taking your seat.` skips across its 10 preview-seen days (d90–99, fights live d91–98), 53006 carries 2, 53008 carries 12 — and each sat on the first day the engine let it through (d100 / d91 / d94). The drive never ignored a ready offer; the snapshot went stale between the daily read and the upkeep calls. The metric review below carries the fix for the next run. Per §14 the verdict stands as NO-GO on the frozen header — the landing call belongs to the coordinator, as with doorwalk-b's median artifact.

**Confirm: NOT run.** The prereg stages the 12-seed confirm (fresh band 53201–53212) on a pilot GO only; the pilot as judged is NO-GO, so no confirm spend. The confirm band stays fresh for the next run under the revised classifier.

## The walks, per seed

| Seed | Assigned | Offered | Walked | Branch | Sit / entry day | Answers | Final | Win day |
|---|---|---|---|---|---|---|---|---|
| 53003 | feared | 6 | **feared** | light | d90 / d90 | 5 | final:mercy | d90 |
| 53004 | witness | 5 (no witness) | **beloved** (fallback) | light | d100 / d100 | 5 | final:audience | d100 |
| 53006 | witness | 6 | **witness** | light | d91 / d91 | 5 | final:charges | d91 |
| 53007 | feared | 6 | **feared** | light | d90 / d90 | 5 | final:mercy | d90 |
| 53008 | witness | 6 | **witness** | light | d94 / d94 | 5 | final:charges | d94 |
| 53001/02/05 | feared/witness/feared | — (no seat) | — | — | — | 0 | — | — |

Every walk took its ASSIGNED door except 53004's documented fallback (witness never offered — the same 5-door shape as the Nov-7 doorwalk corpus on this seed). Every walk played its challenge straight through on the entry day (door + 3 beats + final, 5 answers, no downgrade, no conscript — all five branches light, so no dark conscript was ever offered, and no trial was ever taken). Entry lag is 0 on all five. The two independent records agree on every seed (policy walked list vs driver door-verb record). Indispensable correctly absent everywhere (full-seat-only). All five branches came out light — the dark branches were never exercised (ledger-earned; the driver never overrides `tableBranch`).

## Per-seed table

| Seed | Leg | Days | End | Standing | Scale | Max wave | Seat | Sat | Entered | Starv | w4 kills |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 53001 | base/armed | 62/62 | village-lost | 199/199 | regional | 4/4 | none | — | — | 0/0 | 0/0 |
| 53002 | base/armed | 89/89 | village-lost | 489/489 | regional | 5/5 | none | — | — | 0/0 | 5/5 |
| 53003 | base/armed | 150/90 | survived/won | 199/199 | regional | 4/4 | lesser | d90 | feared/light | 1/1 | 2/2 |
| 53004 | base/armed | 150/100 | survived/won | 399/320 | regional | 5/5 | lesser | d100 | beloved/light | 0/0 | 5/5 |
| 53005 | base/armed | 83/83 | village-lost | 199/199 | regional | 4/4 | none | — | — | 0/0 | 1/1 |
| 53006 | base/armed | 150/91 | survived/won | 580/475 | regional | 5/5 | lesser | d91 | witness/light | 0/0 | 2/2 |
| 53007 | base/armed | 150/90 | survived/won | 184/150 | regional | 4/4 | lesser | d90 | feared/light | 1/1 | 1/1 |
| 53008 | base/armed | 150/94 | survived/won | 199/199 | regional | 4/4 | lesser | d94 | witness/light | 0/0 | 3/3 |

Standing reads lower on the won seeds because the run ENDS at the win (d90–100): standing stops accruing and the later wave-4 kills the baseline plays never happen. 53002 died at d89 — one day before the day-90 floor, with a lesser seat already earned from d36. 53005 died d83, same shape as the proof smoke leg.

## Wall numbers (this run)

National / table-sat / doors-entered / wins: baseline **0 / 5 / 0 / 0** → armed **0 / 5 / 5 / 5** · Wave-4 unlocks 8/8 → 8/8 · Wave-5 unlocks 3/8 → 3/8 · Lesser seats earned 5/8 → 5/8, sat 5/8 → 5/8 · Full seat 0/8 → 0/8 · Median survival 150d → 90d (all seeds; the five wins end their runs at d90–100) · Max 150d → 100d (the baseline's 150d max is sanctity-extended survival, not wins). National is still 0/8, the full seat still names national — the wins came through the LESSER seat, which is exactly what TABLE.md prices.

## Village assessment (plain words)

Five villages earned the right to sit, and this time somebody walked through the two doors nobody had walked before. Each one sat on the first morning the engine let it — 53004 waited ten mornings while encounters kept the door shut, trying every time, and sat the first clear day — and the table read its life back to it, opened five or six doors, and the village picked one and walked it the same morning: the Feared twice, the Witness twice, and once the Beloved when the Witness was never offered. All five won. The three villages that never earned a seat lived and died exactly as they had before — nothing about the door changed their fates, because no door was ever offered to them. The chain now runs end to end through a won lesser seat on six of the seven doors. What remains is the national Binding behind the full seat — and the dark branches, which no village's ledger has earned yet.

Who died, and why: 53001's village was lost at day 62; 53002's at day 89, one day short of the floor, with the seat already priced; 53005's at day 83. The table had knocked on every door by day 33–55, but the invitation means nothing before day 90, and three villages were already gone by then — the same shape as every arm on this band, and the standing next blank (survival to the floor), not this arm's.

## Sense-test read (walked doors — full transcripts)

**The walks read as distinct games, not one template with the door name swapped.** The full say stream (day 85+, `table-transcripts-doorwalk-feared-b-s<seed>.json`) was read in full for all five walks. The transcript re-runs reproduce the pilot armed leg EXACTLY (days, won, sit day, walked path, answers) — the sense-test reads the same runs, not lookalikes.

**Feared (53003, 53007) — the calibration tightrope is visible.** Beats: kill/mercy/fire → lean/hold/trial/build → spend/keep → mercy/pledge — real choices, each with its own prose. The kill line lands the tension: "The deer. The cleanest kill. The table goes very still. Behind you, your own people go still too — a different stillness." The lean line: "You let them see it. All of it. The table recalculates. The fire back home burns a little lower." The spend line: "You spend it — the shield, not the sword. The small envoy stares. Your people stand a little straighter. Protective terror: the table writes it down and doesn't understand it, which is the point." The final: "The table doesn't know what to do with mercy from a predator. Neither do you, quite. But the audience weeps, and the galaxy learns that the feared one chose gentleness." Path abilities arrive mid-walk (Dreadfield: terror starts at 2; War-table; Oathbound: horror grows half as fast; Shieldbearer offered in the final beat). The audit is specific (waves faced 16/12/6, 9 contests, 3 crises, ladder breakdown) and the full-seat shortfall is named honestly (wave-5 monsters 0/2, regional not national, no capstone deed).

**Witness (53006, 53008) — the trial, and it is a different game.** Beats: cold/names/reserve → let/cross/subpoena/silence/build → public/settle → charges/wayback. The opening: "You didn't come to negotiate. You came with a list. Every bribe, every buried plot, every 'rounding error' — including theirs. The judges are about to be judged." Path abilities arrive mid-walk (Docket: swing starts at 1; Subpoena offered in the second beat; Clean Hands: swing +2; Precedent offered in the final beat). Beat prose: "You read them cold — no heat, no adjectives. The charges land harder for it. One of the judges flickers." / "You let them speak. All of it. The courtroom respects nothing the way it respects a prosecutor who doesn't flinch at their own witnesses." / "You refuse the quiet. 'In public,' you say, 'or not at all.' The precedent is set — the galaxy's court has a new first page, and your name is on it." Final: "The trial of the judges. You read every charge, and some of them flinch — actual flinching, from beings of light."

**A capture gap, closed by the transcript script (not a content gap).** The judged pilot driver's keyword filter MISSED the witness beat lines entirely — none of them contain "table" or any filter term — so the pilot corpora show the witness walks as audit → branch line → "You won." with nothing between. The prose exists in the source (`table-witness.js` beat `say` arrays) and in the full say stream; the transcript script (`doorwalk-feared-transcript-20261110.js`) captures everything from day 85 and is the instrument fix for future sense-tests. The same class as the doorwalk relay miss (metric review #5).

**What first-option play never touches.** The drain takes cold/let/public/charges every time, so the witness's signature mechanic — villagers testifying in their own words (the testimony pool in `table-witness.js`: "They carried me out of the treeline when I couldn't walk. That's the whole testimony — the rest is paperwork.") — is never exercised: subpoena and cross-examine are offered in beat 2 and never taken, and the build option (needs swing 4+) is never reached. A deliberate-choice player would take subpoena; whether the testimony machinery works is UNMEASURED by this run. Same shape on feared: the trial opt-in and the build option (needs terror 4+) are never taken. Filed below.

**The Beloved fallback (53004) reads as its own game too.** "Nora tells the hunt — the real one, with the fear left in. The audience goes silent in the good way." / "The feast song — the one about eating like it matters, because it does. Trillions of beings who never ate anything hear it and feel hungry for the first time." / "You spend it all — the love, the light, the finale slot — on people the cameras never found. You name the unfilmed villages. You name the dead."

**Common to all five:** the Oversight pod beat fires on every walk ("And somewhere out there — past the cameras, past the light — in rows of humming glass, the little ones are still napping..."), with a path-appropriate variant line (feared 53003: "You never asked. Not once."; witness/beloved: "The System put a pod on the screen, and you let the segment play."). Codas differ per seed. The win line is the same plain line on all five. The audit's war-path line names real kills with days and names (Rosa put down Loud-Eyes d68; Amina put down The Herald d93; Mateo put down Loud-Eyes d51).

**People check (beyond the table).** Villagers in the day 85–93 stream read as people in places: "Renato whispers: 'Someone's been leaving food out, and Wren won't admit a thing.'" / "You came back bloody. Nobody asks. Someone saves you the good seat by the fire." / the Flashbulb Moth campfire story. Against that, two verbatim-repeat shapes: the grief-card sentence fires once per grieving link (8 occurrences across the five transcripts — Stonebridge/Ashford back-to-back on 53007 d88, same as the doorwalk finding on 53005 d88), and the idle lines repeat verbatim ("You wait. The light changes. Nothing asks anything of you." 3× a day; "Huh. Never been this way before." across Emma and Raj). Filed below, not fixed here — content-shape questions, not one-line fixes.

## Metric review

- **Metrics held.** The primary, sanity, guard, and both cost bars were judged exactly as pre-registered, with the two committed corrections applied before the numbers they touch were computed (Correction 1 re-pointed the proof's smoke leg at a baseline sitter before the armed leg ran; Correction 2 fixed the analyzer to implement the prereg's fallback exception before the analysis ran). No friendly re-scoring anywhere in this verdict.
- **The reachable bar's offer-not-taken clause is the defective instrument** (see the verdict table): the classifier's day label is built from a once-daily snapshot while the drive decides 3×/day on live state. PROPOSED REVISION for the next run: a day counts as offer-not-taken only when the drive made NO sit attempt that day — no `not-ready` skip and no verb call in the drive's own stats. Under that revision this run passes every bar (0 true offer-not-taken days; reachable missed 0). The classifier lives in the shared analyzer (`doorwalk-b-analyze-20261107.js`, `classifySeatDay`) — changing it touches the sitdrive/doorwalk instruments too, so the fix is a pre-registered next-run change, not a silent edit here.
- **The median is gone and stays gone.** The revised cost bar (per-seed survival non-inferiority) worked as intended: 0 violations, no population-change artifact, and the win-truncation is visible in the wall numbers (median survival 150 → 90) without being judged as a failure.
- **The win is not the judged metric.** Wins moved 0→5/8 as a consequence of sits+walks, and the panel contract (not run — no confirm) would flag the win-rate move as `change_watch`, correctly. The investigation: every win traces to a sit followed by first-option door play through the pre-existing `tableRoad` drain. Whether first-option door play should be able to win is a design question, already filed as a Steve-call — this run's sense-test (bar 7) is the evidence for it: the beats OFFER real choices, but the drain never makes one. A deliberate-choice player has a game here; the bot does not play it.
- **Day-field note (±1d, verdict-neutral).** As in prior arms, the driver's stdout `days` and the corpora's `gameDays` can differ by one day on boundary seeds; the analyzer judges both legs on the same field.
- **Telemetry deviation check:** `node scripts/telemetry-check.js` refuses recorder-corpus input by design ("recorder corpora are compared with sweep-compare tables, never against a run baseline here"), and the endgame baseline's own `_note` forbids comparing pre-seat corpora against it (regime artifact). There is no LOUD line to investigate: the panel compare is the instrument that covers national/table/wins for this arm, and no confirm panel was run (pilot NO-GO on the artifact). Zero src/js changed, so no Game-telemetry baseline exists to deviate from.

## What blank was filled

The coverage blank from doorwalk-b is closed: feared and witness now walk and resolve on the current master (2 feared + 2 witness, all light, all won, full transcripts read), plus the fallback path is exercised and documented (53004: witness never offered → beloved). The rotation gate (`DOORWALK_ROTATION`), the feared/witness driver, the revised-cost analyzer, the 41/41 proof, and the full-capture transcript script are committed alongside it, so the next arm that touches door-walking measures against an instrument that can see the beats.

What was documented, not filled: the day-90-floor survival half (only 5/8 reach the floor alive; 53002 dies one day short); the win that follows a sit is still first-option drain, not played choice; the witness testimony machinery (subpoena/cross) and the swing-4+ build option are unmeasured; dark branches never earned; trial-by-combat never opted into; the grief-card and idle-line verbatim repeats. All in Findings below.

## Findings for the backlog

- [open] 2026-11-10 — scale-onramp / survival — THE DAY-90 FLOOR IS STILL THE BINDING HALF: only 5/8 reach day 90 alive under the doorwalk substrate on `a64d6e91a`; 53002 dies d89 with a lesser seat already priced. The sit drive fixes the sitting half and touches none of this. Next arm: survival to the floor, not sitting. (This arm, § Village assessment.)
- [open] 2026-11-10 — scale-onramp / table — A SIT BECOMES A WIN THROUGH FIRST-OPTION DOOR PLAY (recurs on the new master, now on 6 of 7 doors): every sat seed (5/5) won by walking its assigned door through first-option beats with no played choice. The beats OFFER real choices (this run's sense-test proves it), but the drain never makes one. Steve-call whether a sat seat should wait for a real choice, or whether first-option drain winning is acceptable. (This arm, § Sense-test read.)
- [open] 2026-11-10 — table / witness — THE TESTIMONY MACHINERY IS UNMEASURED: the witness path's signature beat — villagers testifying in their own words (subpoena/cross-examine, `table-witness.js` testimony pool) — is never reached by first-option play, and neither is the swing-4+ build option. A deliberate-choice arm (assign subpoena/cross) is needed to say whether it works. (This arm, § Sense-test read.)
- [open] 2026-11-10 — table — DARK BRANCHES STILL UNEXERCISED: all five walks came out light; no village's ledger has earned a dark branch on any measured band. A dark-ledger village (killed ≫ protected, betrayed > 0) is needed to walk one. (This arm, § The walks.)
- [open] 2026-11-10 — dialogue — GRIEF-CARD SENTENCE REPEATS PER LINK (recurs): the link-tribute grief beat fires the identical sentence once per grieving link (Stonebridge/Ashford back-to-back on 53007 d88; 8 occurrences across the five transcripts). True to the fiction (two links grieving at once) but verbatim-repetitive as dialogue; same class as the doorwalk finding on 53005 d88. (This arm, § People check.)
- [open] 2026-11-10 — dialogue — IDLE LINES REPEAT VERBATIM ACROSS SPEAKERS: "You wait. The light changes. Nothing asks anything of you." fires 3× a day on idle turns, and "Huh. Never been this way before." fires verbatim for Emma and Raj on the same days. Reads as filler. (This arm, § People check.)
- [open] 2026-11-10 — measurement — CLASSIFIER STALE-SNAPSHOT ARTIFACT (binding): `classifySeatDay` labels a day offer-not-taken from the once-daily snapshot while the sit drive decides 3×/day on live state; 10 such days on this pilot are all refused attempts, not ignored offers. Next run's revision: a day counts only when the drive made no sit attempt that day. The shared classifier (`doorwalk-b-analyze-20261107.js`) is the fix site. (This arm, § Metric review.)

## Convergence state

**scale-onramp / winnability chain: converging, NOT converged.** The chain runs end to end through a won lesser seat on six of the seven doors (feared and witness now walked and won). The verdict is NO-GO on a defective classifier clause, not on the lever; the metric review carries the fix. What remains is the national Binding (0/8), the full seat (0/8), the dark branches (0 walks), the trial (never opted into), and the day-90-floor survival half (5/8).

## Files committed with this evidence

- `scripts/policies/competent-doorwalk-b.js` (DOORWALK_ROTATION env gate; default rotation unchanged)
- `scripts/doorwalk-feared-b-driver-20261110.js`, `scripts/doorwalk-feared-b-analyze-20261110.js`, `scripts/test-doorwalk-feared-b.js` (new: driver, analyzer with revised cost bar + fallback compliance, proof 41/41)
- `scripts/doorwalk-feared-transcript-20261110.js` (new: full say-stream capture for sense-tests)
- `evidence/2026-11-10/sim-doorwalk-feared-b-prereg.md` (committed before any judged sim: 550e25861; Corrections 1–2: 0015d18a0, 17971086)
- `evidence/2026-11-10/perseed-doorwalk-feared-b-baseline/` (8 corpora), `perseed-doorwalk-feared-b-armed/` (8 corpora)
- `evidence/2026-11-10/table-transcripts-doorwalk-feared-b-s53003.json`, `-s53004.json`, `-s53006.json`, `-s53007.json`, `-s53008.json` (full say stream day 85+, reproduction-exact vs the pilot armed leg)
- `evidence/2026-11-10/sim-doorwalk-feared-b.md` (this file)
