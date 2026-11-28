# sim-reunionwild2-b — evidence (Loop B, winnability chain)

**Arm:** sim-reunionwild2-b · **Axis:** winnability-chain · **Branch:** `sim-reunionwild2-b`
**Run lineage:** prereg run fleshout-loop-b-20261127T1930Z; corpus / analyzer /
correction work under fleshout-loop-b-20261127T2130Z (as cited in the committed
bloodcluster correction block); finished by continuation run
fleshout-loop-b-20261128T0230Z. This file is the continuation worker's
write-up; every number below was re-verified against the analyzer output
(`evidence/2026-11-27/reunionwild2-b-analysis.json`) and the raw corpora
before it was written, not taken from the first worker's draft on trust.
**Prereg:** `evidence/2026-11-27/sim-reunionwild2-b-prereg.md` (frozen before
any judged sim; anchor `7f5bd3d14`). **Seeds:** 111501–111508 (8, fresh band,
verified unused). **Policy:** competent verbatim. **Horizon:** 150d
death-aware. **Branch HEAD at write-up:** `7ddd7e607` (pre-rebase; see §Rebase
for the post-rebase state).
**Answers:** the Reunionwild findings cluster — sim-findings.md lines
2756–2759 (bloodcluster table, herald TB entry, Eulogy absorb print,
same-day succession deaths), now annotated fixed / answered / answered /
answered.

## Verdicts (judged ONLY against the frozen prereg bars)

| Item | Verdict | Bar |
|---|---|---|
| 1. Herald never enters TB | **DEFECT NAMED, DIAG-GO** (frozen table branch (c)) | §4 item 1 |
| 2. Bloodcluster per-seed table | **PASS** | §4 item 2 |
| 3. Eulogy armor-absorb print | **GO** (fix landed in branch) | §4 item 3 |
| 4. Same-day succession deaths | **DIAG-GO** (two fights, not one) | §4 item 4 |

No verdict was re-scored against a friendlier metric. Every drafted number
below matches the analyzer output JSON; where the continuation worker checked
further (raw corpus diff, code read), the check is stated.

## Item 1 — Herald: DEFECT NAMED, DIAG-GO (frozen table branch (c))

Fresh band, 8 seeds 111501–111508, competent, 150d:

- Herald `startCombat` calls band-wide: **99**. Genuine TB starts: **0**.
- Refused with a live fight: **0**. Refused with NO live fight: **99**.
- Field contacts: **24**. Unannotated rows: **0** (classification complete).
- Refusals later followed by a herald contact on the same seed: **99/99**.
  Refusals never followed again: **0**.
- Per-seed: 111501 1 call SILENT · 111502 5 SILENT · 111503 6 SILENT ·
  111504 7 SILENT · 111505 0 SILENT · 111506 21 **DEFECT NAMED** ·
  111507 59 **DEFECT NAMED** · 111508 0 SILENT. Audibility bar (≥ 20
  calls) holds band-wide at 99.
- Frozen table branch (c) applies: 0 genuine + refusals with NO live fight
  → **DEFECT NAMED** — TB entry is effectively unreachable for the herald.
  DIAG-GO holds (classification complete, audibility met, verdict read off
  the table).

**The mechanism (found by targeted replay probe, verified in code by the
continuation worker).** The Herald is a titan: `src/data/titans.json`
(`"herald"`, wave 4, `minAllies: 10`). `titanWrapCombat`
(`src/js/titans.js`) hard-refuses a titan's `startCombat` while the muster
is short and says so aloud: "sound the call, muster 10 allied blades (you
have N)". The probe of seed 111507 (59 calls, days 77–81) caught the refusal
with "muster 10 allied blades (you have 0)". So the 99 refusals are
titan-gate refusals, not live-fight refusals — and the herald keeps wandering
into the scholar (24 field contacts) while the gate keeps saying no.

**Prereg §2 refutation — stated plainly.** The prereg read the old band's
84 refusals as "refused while a fight was live" because `rebuilt=false`
was the only signal and `startCombat` refuses on a live fight. That read is
wrong. The fresh band's instrument records the live-fight context at every
refused call, and **0 of 99 refusals had a live fight**. The old band's
"while a fight was live" was an inference from `rebuilt=false`, never a
measurement; the old instrument did not record live-fight context, so the
old 84 cannot be reclassified directly — but the mechanism that explains
them is now measured on the fresh band, and it is the titan gate.
(Old-band spot-check still reproduces: 84 refused / 0 genuine / 19 field.)

**Next step is a Steve-call, NOT a fix — no code change in this arm.** The
gate is deliberate Steve design (2026-10-12, "no solo titans": a titan
without a complete muster is hard-refused, never a likely death). The
question is now a design question, not a defect hunt: is a 10-blade muster
reachable for a wave-4 wanderer that a village bumps into 59 times in 5
days (seed 111507) — and should a wandering herald keep being refused
once a day, every day, while the village never musters? The fix condition
in prereg §4 item 1 (build a fix only under (c), small, in the TB-entry
path, never touching the win-plan/depart path) is not exercised, because
changing the gate would change a deliberate design, and the overlap guard
(win-plan/depart is the sibling arm's area) counsels reporting, not
landing. Finding recorded for Steve; arm leaves the gate untouched.

## Item 2 — Bloodcluster table: PASS

Recompute from the raw v2 judged JSONs only
(`evidence/2026-11-24/perseed-bloodcluster-b/*-v2.json`, 16 files,
`-replay` excluded; frozen definition: fieldFight rows wave ≥ 4 excluding
`alreadyDead` + genuine TB starts `rebuilt !== false` wave ≥ 4):

- 16/16 rows recomputed. Exactly the 10 published-mismatch seeds:
  109310, 109312, 109313, 109314, 109315, 109318, 109319, 109323, 109324,
  109325. Corrected values match the recompute exactly — e.g. 109312:
  56 field + 12 genuine TB = **68** (published 61); 109313: 16 + 12 = 28
  (published 40); 109318: 2 + 4 = 6 (published 17); 109324: 0 + 1 = 1
  (published 2); 109310: 22 + 9 = 31 (published 30).
- Pooled totals reproduce exactly: **300 contacts** (211 field + 89
  genuine TB); **door 167 / non-door 133**.
- No other §5 column disagrees (`otherColumnDiffs: []` — kills, bloodings,
  W5 unlock/faced/kills all reproduce as published).
- The §5 table in `evidence/2026-11-24/sim-bloodcluster-b.md` is corrected
  to the recomputed values (committed in `7ddd7e607`, with a CORRECTION
  block noting the change; pooled totals and downstream verdicts
  unaffected). **PASS** on the frozen bar.

## Item 3 — Eulogy absorb print: GO

The fix (`2552ec764`, already committed before this write-up): a
`bypassArmor` flag threaded from the doom call in `sigEulogyHook`
(`src/js/sigW4.js`) through `tbDamage`, skipping both armor blocks
(player + villager) including the `BA.onBlocked(absorb)` Retribution
credit when set. No other caller sets the flag; `quiet` semantics
untouched.

- Proof test `scripts/test-reunionwild2-b.js`: **11/11 pass** on the
  committed fix (re-run by the continuation worker pre-rebase, same
  result). No absorb line in the doom tail; the scholar still dies to the
  narrated ending; the `maybeCheatDeath` path is intact (a second-wind
  scholar survives the doom with the cheat line, no absorb line either).
  The pre-fix repro failed as the prereg required (absorb 8749 in the
  doom tail, recorded in the instrument commit).
- Wild-corpus confirmation (continuation worker's check, not in the
  draft): the baseline-vs-after raw corpora differ in exactly one kind
  of content — the doom absorb line. Five narrated-doom death tails
  band-wide (111501: 4827; 111502: 9689; 111503: 7718; 111505: 9136;
  111506: 11080); the baseline leg prints the absorb line after the doom
  narration on **5/5**, the after leg on **0/5**. Every other line in
  every death tail is identical; the only other raw-corpus differences
  are leg metadata (`run`, `anchorCommit`) and stack-frame line numbers
  shifted +6 by the fix's added lines in `game.js`. Ordinary armor lines
  are untouched — e.g. Jun-chan's day-145 death to three Eulogies still
  shows "Armor absorbs 41" on a real Final Chapter hit (21 damage), which
  is honest armor math, not the doom.
- Before/after on identical seeds: every judged metric identical between
  the baseline and after legs (wall, per-seed wall fields, herald
  verdicts, same-day doubles, player deaths 69/69, instrument errors
  0/0) — the narration-only fix moves nothing mechanical, as the prereg
  expected. **GO.**

## Item 4 — Same-day succession deaths: DIAG-GO (two fights, not one)

- **Corpus test (frozen):** seed 109460 day 144, two `playerDeaths`
  rows, **distinct `fightId`s** — Saengduean vs two Reunions
  (`fmgpspln9_3ko2kq`, Brian alive as a villager fighter in that fight);
  Brian as scholar vs an Editor, wave 5 (`fmgpsplnu_85n94a`), with a
  fresh party (Lena Ruiz, visjoin_108, visjoin_140, Tariq Mahmood).
  `sameFight: false`, `twoFights: true`. The successor was NOT thrown
  into the predecessor's live fight.
- **Fresh-band watch:** 7 same-day double scholar deaths on
  111501–111508 (one triple, seed 111508 day 137: Lesya vs two
  Influencers, Omar vs two Timeslots wave 5, Benoit vs two Influencers)
  — **ALL distinct fights**. Every one is the wild killing twice (or
  three times) in one day, in separate fights. No successor inherits a
  live fight in any of the 7.
- DIAG-GO holds: linkage determined from the corpus, verdict stated with
  the fight contents named, closing note (two fights) named. The finding
  underneath is the wild's lethality, not a succession bug: a village can
  lose its scholar twice in a single day to two different wave-4/5 packs.

## Wall numbers (baseline = after, identical)

| Metric | Count |
|---|---|
| Wins | 0/8 |
| National | 0/8 |
| Table | 0/8 |
| Wave-4 unlock | 8/8 |
| Wave-5 unlock | 5/8 |
| Wave-5 faced | 3/8 |
| Median survival | 150d censored (5/8 survived; survivals 122, 125, 141, 150, 150, 150, 150, 150) |

The scale wall is unchanged on this band: every village reaches wave 4,
most unlock wave 5, a minority face it, none reaches national, the table,
or a win. Player deaths band-wide: 69. Instrument errors: 0.

## Before / after (§15) — honest record

The prereg §7 called for the before/after comparison through
`scripts/balance-panel.js`. No separate `panel.json.gz` pair was produced
for this arm: the panel's `compare` needs full panel runs, and the arm's
judged comparison was carried by the analyzer's own baseline-vs-after
legs plus the continuation worker's raw-corpus diff. What those show is
the expected no-movement outcome in full: every judged field identical
between legs (wall, per-seed wall fields, herald verdicts, same-day
doubles, player deaths, instrument errors), and the raw JSONs differ
only in the fix's own effect (5 doom absorb lines removed) plus leg
metadata and +6 stack-frame line numbers. No §15 panel compare file is
attached; this paragraph is the record of that, not a claim that one
ran. A future arm that wants the panel pair can regenerate it from the
two committed corpora.

## Reachability verdict

- Waves 1–4: reached on 8/8 seeds; wave 5 unlocked 5/8, faced 3/8.
- The Herald as a *fight* is unreachable through TB: 0 genuine starts in
  99 calls across two bands (84 + 99). It is reachable as a field
  contact (24 on this band) and it does kill that way — but the
  turn-based fight, the deaths the game is built around, never opens for
  it. That is the defect named in Item 1, pending Steve's call on the
  muster.
- Regional: reached (all surviving seeds end regional). National, the
  table, the win flag: reached on 0/8 — decoration on this band, as on
  every recent band. Nothing in this arm moves those numbers; the arm
  was diagnosis + narration + correction, not a scale lever.

## Village assessment, in plain words

Eight villages, 150 days each. They all live long enough to meet wave-4
monsters, and five unlock wave 5 — the villages are not dying early
anymore. They die in the wild, to packs: three Eulogies narrating one
scholar to death on day 145; an Ad Break and fifteen Sponsors grinding
another scholar down over 92 rounds the same day; two Influencers and
two Timeslots taking three scholars on one day on seed 111508. The
kills are real fights, blow by blow, and the villages keep going after
each death — a new scholar picks up the journal, sometimes the same day,
and walks straight into the next pack. What is missing is not survival
to the content but survival *through* it: wave-4 kills stay rare (the
bloodcluster band's 41 kills on 300 contacts is the honest shape), the
Herald will not fight on the game's own terms, and no village converts
reaching wave 5 into standing, a table seat, or a win. The blanks this
arm filled: the bloodcluster table now adds up, the Eulogy's death no
longer prints a nonsense armor number, and the Herald's silence now has
a name and a mechanism instead of a guess. The blank it leaves open is
Steve's: whether ten allied blades is a fair price for facing the
thing that keeps walking into your village.

## Sense-test (death traces read as stories)

1. **Seed 111507, day 145 — Jun-chan vs three Eulogies.**
   "The Eulogy narrates, honestly, always: 'and then they bled,
   politely, where everyone could see.' ... (3 verses remain.
   Contradict it — do the opposite — or give it a better ending.)"
   Then "Final Chapter!" — a real hit, armor absorbs 41, 21 damage,
   "You go down." This death reads right: the monster told the story
   of the death and then dealt it. The narration is the fight, not a
   label pasted on it. (Note: this is a Final Chapter hit, not the
   verses-exhausted doom — the doom is the separate beat Item 3 fixes.)
2. **Seed 111507, day 145 — Melina vs an Ad Break and fifteen
   Sponsors.** ROUND 92. Ninety-two rounds of sponsored pauses, and
   she goes down to a 3-damage hit after armor absorbs 25. The fight
   reads as a grind, not a duel — a crowd of sponsors wearing one
   person down. Sensible, and grim in the right way: the wave-4
   monster that kills you is not always the dramatic one.
3. **Seed 111508, day 137 — three scholars, one day.** Lesya (two
   Influencers, RATIO, "4 followers turn the audience"), Omar (two
   Timeslots, "HIGHLIGHTED: BURNING BUILDING — the set is on fire and
   nobody called cut"), Benoit (two Influencers again). Three separate
   fights, three separate deaths, one day. Each trace is coherent on
   its own; together they say the wild is thick with wave-4/5 packs by
   day 137 and the village is losing a scholar a fight. The repeated
   "OH. Oh no. ...The gamblers are very quiet." closing line on wild
   deaths is still the arena audience's voice speaking for a fight in
   the wild — already an open finding (sim-wilddeath-b); noted again
   here, not re-filed.

## Metric review

- The frozen herald decision table did its job: branch (c) fired
  cleanly on the measured numbers, and the table's wording ("refusals
  with NO live fight") is what forced the instrument to record
  live-fight context — without it, the prereg §2 misread would have
  survived. No revision proposed; the table is right.
- The audibility bar (≥ 20 calls) held at 99 band-wide, but per-seed
  it is lumpy (59 on one seed, 0 on two). A future herald arm should
  keep the band-wide bar — the per-seed spread is the finding (one
  village is camped on by the Herald, others never see it), not a
  reason to demand 20 per seed.
- The prereg §2 read ("84 refusals while a fight was live") was wrong,
  and the error was an inference from `rebuilt=false`, not a
  measurement. Lesson for future preregs: a refusal reason is not a
  live-fight measurement; record the context, don't infer it. The
  analyzer now records it by construction.
- The §15 panel compare (see §Before/after) was not run as a
  `panel.json.gz` pair; the analyzer legs + raw diff carried the
  judgement. If a future arm needs the panel as the instrument, the
  panel runs should be scheduled as their own step, not assumed from
  the corpus.
- Nothing was re-scored. No frozen bar was missed.

## Rebase

*To be filled after the rebase onto current master tip (see coordinator
handoff): pre-rebase HEAD `7ddd7e607`; proof test 11/11 pass pre-rebase
(re-run by the continuation worker). Post-rebase proof + `check.js
--quick` results recorded here if they differ from the pre-rebase run.*

## Files

- Prereg: `evidence/2026-11-27/sim-reunionwild2-b-prereg.md`
- Analyzer output: `evidence/2026-11-27/reunionwild2-b-analysis.json`
- Baseline corpus: `evidence/2026-11-27/perseed-reunionwild2-b/reunionwild2-b-s11150{1..8}-reunionwild2-b.json`
- After corpus: `evidence/2026-11-27/perseed-reunionwild2-b/reunionwild2-b-s11150{1..8}-reunionwild2-b-after.json`
- Instruments / analyzer / proof: `scripts/reunionwild2-b-driver-20261127.js`,
  `scripts/reunionwild2-b-instrument-20261127.js`,
  `scripts/reunionwild2-b-analyze-20261127.js`,
  `scripts/test-reunionwild2-b.js`
- Fix: `src/js/sigW4.js` + `src/js/game.js` (`bypassArmor`, commit
  `2552ec764`)
- Correction: `evidence/2026-11-24/sim-bloodcluster-b.md` §5 (commit
  `7ddd7e607`)
- Findings: `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-findings.md`
  lines 2756–2759 annotated fixed / answered / answered / answered.
