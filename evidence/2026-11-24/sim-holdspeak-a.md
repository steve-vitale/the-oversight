# sim-holdspeak-a — held departures speak

**Run:** Loop A fleshout-20261124T0715Z, axis scale-onramp · **Arm:** sim-holdspeak-a ·
**Base:** `60f6e7436` (master tip at worktree creation) · **Band:** 109409–109416 (8 seeds, fresh — verified §5) ·
**Verdict: GO — CONFIRMED** (pilot + 16-seed confirm, §9) ·
**Branch:** `sim-holdspeak-a`, worktree `~/workspace/worktrees/sim-holdspeak-a` ·
**Prereg:** `evidence/2026-11-24/sim-holdspeak-a-prereg.md` (frozen before any sims; Amendment 1 recorded the confirm band before the confirm runs)

## 1. The bug — finding #2713

Across 16 seeds the safety check held 44 departures and **zero** beat lines
contained any hold wording (searched: wait / hold / not yet / not ready /
hurt / sick / kit / armor / ready — 0 hits). The plan stays staged, the
party re-bids tomorrow, and nothing is ever said about waiting for kit or
health. A player watching would see a party that keeps not leaving, with no
explanation.

**Scope correction (recorded in the prereg before any fix):** the departsafe
safety check is NOT on master — it lives held on branch `sim-departsafe-a`
(commit `e9dcc0ffe`), env-gated `DEPARTSAFE=1`, never landed. This arm does
NOT land it. The holds that DO occur on master are the win-plan hold verdicts
in `vbrainExecuteDepart` (src/js/villager-brain.js). Census on the frozen
departname before-corpus (19 seeds, competent, 150d): **463 `result: 'hold'`
departCalls vs 450 launches**, all source `brain`, up to 3 holds per
(seed, day, vid), 208 distinct (seed, day, vid) hold-days. The silence this
arm fixes is that silence — the on-master one.

## 2. Root cause — three hold shapes, all silent at the hold return

Enumerated from the code (prereg §Grounding):

- **H1 — hold-action commit.** `gear_hold` (stage gear, holder unarmed AND
  unarmored — reason kit), `party_wait` (stage party, no companion at Haven —
  reason no companion), `veteran_guard` (stage table, holder has a wave-4+
  kill, no companion — reason no companion yet). Silent at the hold return.
- **H2 — expired-plan held** (`winPlanCommitDeadTarget` returns 'held'): the
  plan's target died, the expiry beat already spoke once ("the hunt is called
  off"), and the plan sits targetless in stage 'party' re-bidding daily while
  no rumor or lived fight re-seeds a target — reason **no trail**. Silent on
  every held day after expiry day.
- **H3 — party_launch execute-fail.** The holder's `startExpedition` returns
  without an expedition record and the homebody handoff finds no walking
  companion. The holder is blocked by `startExpedition`'s gates: **sick**
  (`village.sick[vid]`), **hurt** (`villagerHealCheck`: HP < 70 with no
  medicine and no healer), or **cannot walk** (`npcMaxDist < 1`). Silent at
  the hold return.

Note: when `villagerHealCheck` blocks, it ALREADY says a line ("🩹 {nm} is
still hurting ({cur} HP) — no healer at haven. They rest today instead of
ranging out.") — so the H3-hurt hold line adds the party consequence, not a
duplicate (see §6 for the echo this makes, and the diagnostic that settles
it).

## 3. The fix

`src/js/villager-brain.js` — `holdVoice` speaks at each of the three
`return 'hold'` sites in `vbrainExecuteDepart` (H1 maps commit action → kind:
gear_hold→kit, veteran_guard→veteran, else companion; H2 passes 'no-trail';
H3 passes `holdBlockKind`):

- `holdName(self, vid)` — mirrors departname-a `beatName` (win-plan.js:515):
  true first name via `npcName` first (prefers bestowed calledName), then
  `disp`/`displayName`, then `'Someone'`; never a stranger descriptor.
- `holdBlockKind(self, vid)` — pure-read classification of the H3 block,
  mirroring `startExpedition`'s gate order (hurt, then sick, then range-0);
  never re-calls `villagerHealCheck` (the check has side effects).
  Known corner, documented in code + prereg: a holder healed part-way (still
  <70) who is ALSO sick reads as hurt, though the sick gate stopped them —
  both are health reasons about the same person, never kit/health confusion.
  `'unknown'` is the honest residual (expected ~0; fired 0 times in the
  pilot).
- Dedup: at most one hold line per (holder, day) via a `br.holdSaid` map on
  brain state (beside `homebodySaid`/`holderSaid`). A hold is a daily fact:
  once-ever dedup would re-silence a party held for weeks; un-deduped
  3-ticks/day would spam. Text-only: `say()` consumes no RNG; the only state
  written is the dedup map.
- Every line ends with the shared closer **"— the party waits."** (the SAY
  capture token the band check reads, following the departname convention).
  All lines start with the holder's true first name.

Line templates (phrasing for kit is read live from `gearRead` at voice
time):

| Kind | Line |
|---|---|
| kit, neither | "{H} has no weapon and no armor yet — the party waits." |
| kit, armed only | "{H} still has no armor — the party waits." |
| kit, armored only | "{H} still has no weapon — the party waits." |
| companion | "{H} has no one to walk out with — the party waits." / "{H} is still waiting on a companion — the party waits." (live `findCompanion` re-read variant) |
| veteran | "{H} has the kills for the table, but no one to walk out with yet — the party waits." |
| no-trail | "{H} still has no trail to follow — the party waits." |
| sick | "{H} is sick, and no one who can walk will take the plan — the party waits." |
| hurt | "{H} is still hurt, and no one who can walk will take the plan — the party waits." |
| range0 | "{H} never leaves Haven, and no one who can walk will take the plan — the party waits." |
| unknown | "{H} couldn't get out today, and no one could take the plan — the party waits." |

**Instrument** (`scripts/dawnchoke-driver-a.js`, not game code): `HOLD_BEAT_RE`
/ `HOLD_NAME_RE`, a new `holdLines` stream (`{day, name, text}`) captured in
the `Game.say` wrap; a `startExpedition` wrap counting holder-vid calls per
depart call (H2/H3 split); a `vbrainExecuteDepart` wrap classifying every
`'hold'` verdict into `holdCause` (H1 from commit action; H2
`expired:no-trail` vs H3 by whether holder startExpedition ran; H3
sub-cause from pure reads mirroring gate order hurt→sick→range0→unknown)
and recording `holderName` (npcName at call time) as the join key.

**Judge** (`scripts/analyze-holdspeak-a.js`): joins hold-days (distinct
(day,vid) 'hold' verdicts, first verdict's cause that day) to holdLines by
(day, holderName), conservatively min(lines, days) per group for
same-first-name ambiguity. Checks B1 (voiced share ≥80% with ≥5 hold-days,
0 reason mismatches) and B2 (hold-day sets identical, deaths/launches/
beatLines/departBeats/days/endReason identical, before leg has 0 holdLines,
no malformed hold lines). Outputs an audit sample (all mismatches + up to 10
matched lines per family).

**Panel builder** (`scripts/build-holdspeak-a-panels.js`): converts the
driver corpora into pseudo-panels (pseudo-policy 'holdspeak-a', case identity
= seed) in the `balance-panel.js` schema, following the build-aidleave-b
pattern; then `balance-panel.js compare`.

**Driver validation (before the pilot):** seed 107601 on control code
reproduced the frozen departname corpus exactly on all streams (deaths 108,
beatLines 29, departBeats 29, departCalls 69 rows identical apart from added
null holdCause/holderName fields; only new key holdLines, empty; brainSha
dc247673d540 matched the frozen ctl anchor; winplanSha cbe644ec1dfe = the
departname-fixed winplan, expected on this base). Validation corpus kept at
`evidence/2026-11-22/perseed-holdspeak-a-drivervalid/` (one-seed validation
artifact, committed with the arm).

## 4. Proof test — `scripts/test-holdspeak-a.js`

**30/30 PASS** (first run 29/30; A6's check was buggy — it tested
`SRC.indexOf('villagerHealCheck') === -1` but the file legitimately mentions
it in a comment; fixed to pin no `villagerHealCheck(` call expression).
§A code pins (8), §B staged fixtures through the REAL `vbrainExecuteDepart`
with a fake ctx (B1–B19: kit ×3, companion ×2, veteran, no-trail, sick, hurt
+ medicine pile untouched proving no heal-check re-run, range0, unknown,
dedup 3 ticks/1 day + next day speaks again, pre-System true-name, calledName
"Ash", nameless "Someone", launch speaks no hold line, HOLD_BEAT_RE token
present / DEPART_BEAT_RE absent, hurt+sick corner reads hurt, expired plan
returns normal with no line), §C old-code control (child mode `--old-code`,
`git show 60f6e7436:src/js/villager-brain.js` → 'hold' with ZERO hold lines).
Fixtures seed Math.random deterministically (LCG). Analyzer selftest
**12/12 PASS** (`node scripts/analyze-holdspeak-a.js --selftest`).

## 5. Before/after — pilot band 109409–109416

- **Band freshness:** 109409–109416, zero hits in dated `.md` evidence files
  and filenames (only 10940x hits are 109401–109403 in
  journey-deepening-r278 and a kcal float). Does NOT reuse 107633–107648,
  107601–107616, or Loop B's live band 109309–109324.
- **Legs:** 8 seeds × 2 legs, 150d death-aware, competent policy verbatim
  (`scripts/policies/competent.js`), substrate env identical on both legs:
  `GUNRATE=1 CELLGATE=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 VETREENGAGE=1
  PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1`, `MODE=ctl`;
  `KILLBUNDLE`, `LEND`, `PRESENCE`, `HPGATE`, `PINQUAD`, `PROFILEGATE4` all
  unset. Before = base code, `RUN=holdspeak-a-before`,
  `OUTDIR=perseed-holdspeak-a-before`; after = fixed code,
  `RUN=holdspeak-a-after`, `OUTDIR=perseed-holdspeak-a-after`. Corpora under
  `evidence/2026-11-22/` (driver hardcodes the date dir; departname-a
  precedent).
- **Control leg** (~290s): 36 hold-days, 75 hold verdicts, **0 holdLines**.
  Causes (verdicts): execute:hurt 58, execute:range0 8, party_wait 8,
  execute:sick 1; gear_hold 0, veteran_guard 0, expired:no-trail 0.
  No extension needed (36 ≥ 5).
- **Arm leg** (~276s): **36 holdLines for 36 hold-days** (per seed: 1, 1, 3,
  14, 17, 0, 0, 0). brainSha changed to f9cf9be25ede (expected); gameSha
  unchanged 950901f3fdcc.
- **Analyzer judgment** (`evidence/2026-11-24/holdspeak-a-analysis.json`,
  exit 0): **verdict GO**. B1_voicedShare 1.0 (36/36), B1_pass true,
  B2_pass true, B2_fails []. Totals: holdDays 36, voicedDays 36,
  reasonMismatches 0, badLines 0, sampleSize 22.

Per-seed table (from the analyzer; beatsEqual / departBeatsEqual /
daysEqual / endReasonEqual / holdDaysIdentical all true on every seed):

| Seed | Hold-days | Hold verdicts | Hold lines before → after | Deaths before → after | Launches before → after | Beat lines before → after |
|---:|---:|---:|---:|---:|---:|---:|
| 109409 | 1 | 1 | 0 → 1 | 100 → 100 | 6 → 6 | 23 → 23 |
| 109410 | 1 | 1 | 0 → 1 | 107 → 107 | 0 → 0 | 13 → 13 |
| 109411 | 3 | 3 | 0 → 3 | 99 → 99 | — | — |
| 109412 | 14 | — | 0 → 14 | 69 → 69 | — | — |
| 109413 | 17 | — | 0 → 17 | 84 → 84 | — | — |
| 109414 | 0 | 0 | 0 → 0 | 77 → 77 | — | — |
| 109415 | 0 | 0 | 0 → 0 | 78 → 78 | — | — |
| 109416 | 0 | 0 | 0 → 0 | 104 → 104 | — | — |

(Full per-seed rows — launches, beat lines, causes — are in
`holdspeak-a-analysis.json` under `perSeed`; every seed is identical on
deaths/launches/beats except the added hold lines.)

**Balanced panel (§15):** `scripts/build-holdspeak-a-panels.js` +
`balance-panel.js compare` →
`evidence/2026-11-24/holdspeak-a-panel.{json,md}` (before/after
`.json.gz` alongside). Decision **`review_required`**, compare exit 2 —
adjudicated PASS under B2 (see §8): every observed contract metric is
exactly 0 delta (village deaths 89.75 → 89.75, national 0 → 0, won 0 → 0,
community loss 0.5 → 0.5, first-bearer survival 1 → 1 at day 30 and day 60).
The `review_required` label is the scorecard's default when a descriptive
row exists (table win rate 0 → 0 with no variance); it carries no delta.

**Wall numbers (pilot band, identical on both legs):** wins 0, national 0,
wave 5 reached on 109409/109410/109416 (3/8), median survival ~148.5 days
(gameDays 137/151/147/151/90/85/151/150), scaleRank regional on all 8.

## 6. Sense test — read aloud

**Best lines** (each names the holder and the true reason, in plain words):

- 109409 d48 — "Yohana is sick, and no one who can walk will take the plan
  — the party waits." (sick; the only sick hold in the pilot)
- 109413 d14 — "Autumn is still waiting on a companion — the party waits."
  (the live re-read variant fired: a companion became available by execute
  time but the hold stood, so the line softens from "no one" to "still
  waiting")
- 109413 d51 — "Nikolai never leaves Haven, and no one who can walk will
  take the plan — the party waits." (range0; see the diagnostic below — the
  classifier correctly read range0, not hurt, because Chantal had patched
  Nikolai to 88 HP that morning)

**Worst lines:**

- Repetition: Hannah (109412) held hurt d37–49, the same line daily
  ("Hannah is still hurt, and no one who can walk will take the plan — the
  party waits."). This is the designed daily cadence — a hold is a daily
  fact, and the line is short — but a player watching one village for two
  weeks hears the same sentence ~13 times. A future pass could vary the
  wording by day-count; not a defect, noted as a follow-up (§7).
- The H3-hurt echo: on hurt-hold days the fireside hears the heal-check line
  ("🩹 Nikolai is still hurting (48 HP) — no healer at haven. They rest today
  instead of ranging out.") AND the hold line ("Nikolai is still hurt, and no
  one who can walk will take the plan — the party waits."). The two lines
  state different facts (the wound + no healer; the party consequence), and
  the hold line fires exactly once per day while the heal-check line fires
  2–3× per day (once per dawn part — pre-existing behavior, not this arm's).
  The pair reads as a wound report followed by its consequence, not as a
  duplicate.

**Nikolai double-voice diagnostic (settled, not assumed).** The open question
was whether the d51 range-0 hold line double-voiced with the commit-time
holder voice ("Nikolai meant to walk out with Owen — but Nikolai never
leaves Haven, so Nikolai stays home."). The corpus cannot show it — the
holder voice is not a depart beat and no stream records the companion — so
a diagnostic replay was run: a /tmp copy of the driver with an added
full-say capture for lines naming Nikolai, seed 109413, identical substrate
and arm code (reproduced the pilot exactly: deaths 84, holdLines 17). It
found:

- d46: holder voice DID fire ("meant to walk out with Owen") — but the hold
  line that day was HURT, a different fact. Three lines, three facts: the
  bid with Owen, the wound (48 HP, no healer), the party consequence.
- d51: NO holder voice — the pair (Nikolai, Owen) was already voiced on d46,
  so the once-per-pair dedup held. Only the range0 hold line. The classifier
  was right: Chantal patched Nikolai 63 → 88 HP that morning, so the hurt
  gate passed and range-0 stopped them.
- d55: holder voice DID fire with a NEW companion ("meant to walk out with
  Catalina") AND the range0 hold line fired the same day. This is the one
  real same-day echo of the range-0 fact in the pilot: the first line names
  the specific bid (with Catalina), the second names the consequence (the
  party waits, nobody can take the plan). It echoes but does not contradict
  — the same shape the holder/homebody voice precedent already accepts
  ("when both holder and companion are range-0, both lines fire (two true
  facts)"). Judged acceptable, not a defect.
- d61: NO holder voice (pair already voiced), only the hold line.

## 7. Village assessment, blanks, follow-ups

- **Blanks (families unexercised in the pilot band):** kit (gear_hold 0),
  veteran (veteran_guard 0), no-trail (expired:no-trail 0), unknown (0).
  Those four templates are proven only by staged fixtures (§4), not by live
  sims — the pilot band's holds were hurt 58 / range0 8 / companion 8 /
  sick 1 (verdicts). **Update after confirm (§9): the confirm band
  exercised no new families either** (hurt 124 / range0 36 / companion 33 /
  sick 4 over 197 hold-days; kit / veteran / no-trail / unknown still 0
  across 24 seeds total). The templates stand on fixtures alone and should
  be called out that way at merge.
- **Hurt+sick corner:** a holder healed part-way (still <70) who is ALSO
  sick reads as hurt (gate order). Both are health reasons about the same
  person; no kit/health confusion is possible. Did not fire in the pilot
  (the single sick hold was a clean sick).
- **Daily repetition:** see §6 worst lines. A day-count-varied wording pass
  is a follow-up, not part of this arm.
- **Does the hold line teach the name?** Same open question as the
  departure beat (departname-a): the line uses the holder's true first name,
  which the player may or may not know yet. Left open; the name is the
  holder's own, already used by the holder/handoff voices.
- **Safety-check wiring (future landing):** the voice helper takes a cause
  struct covering the same families as the departsafe safety-check reasons,
  so when/if the departsafe lever lands, its holds can speak through the
  same path. Exact wiring is documented in the prereg, not implemented —
  the lever code is not in this tree.
- **Write flap during this arm:** the first panel-build write hit an EPERM
  write denial (evidence/2026-11-24/holdspeak-a-panel-before.json.gz left at
  0 bytes); probe (`git update-ref refs/heads/probe HEAD`) failed, flap
  confirmed in progress. Waited ~7 min, re-probed OK, rebuilt — both panel
  files verified non-zero (775/776 bytes) and the compare ran clean. The
  0-byte file was a new file, regenerable from the corpora; no tracked file
  was truncated. Recorded per the flap-response skill.

## 8. Judgment vs frozen bars

- **B1 — ≥80% of hold-days voiced, reason matches on sampled audit:**
  **PASS.** 36/36 hold-days voiced (share 1.0), 0 reason mismatches in the
  22-line audit sample, 0 malformed lines. Hold-days whose verdict is a
  `winPlanDepart` 'hold': none in either leg (reported separately per the
  prereg — none appeared).
- **B2 — no regression:** **PASS.** Per-seed deaths identical, launches
  identical, departure-beat counts identical, every after beat line equals
  its before counterpart except the added hold lines. Balanced panel:
  decision `review_required` with all-zero deltas on every observed metric
  — adjudicated as no material signal, not a regression (the label comes
  from the descriptive 0→0 table-win row, not from any movement).
- **B3 — sense test:** **PASS.** Lines read as people waiting for kit or
  health, never system messages (§6). Worst case is repetition and one
  same-day echo (d55), both judged acceptable, neither a wrong reason.
- **B4 — proof test green on new code, hold assertions RED on old code;
  analyzer selftest green; `check.js --quick` green or pre-existing
  failures only:** **PASS (adjudicated).** Proof test 30/30 green on new
  code, §C RED on old code; analyzer selftest 12/12 green.
  `node scripts/check.js --quick`: **335 passed, 9 failed in 1497s**
  (departname-a precedent on this tree: 336 passed / 8 failed). Each of
  the 9 was adjudicated individually, none arm-caused:
  - `test-measurement-proof-update.js`, `test-measurement-workflow.js`,
    `test-phone-frame-proof.js` — fail IDENTICALLY on base code
    (`git stash` of the arm's two modified files, re-run, `git stash pop`;
    tree verified restored after: holdVoice ×5, `node --check` OK). All
    three are retained-proof staleness (neutrality proof inputs not
    current; phone receipt stale/missing) — pre-existing on
    `60f6e7436`, untouched by this arm (it changes no phone/boot input
    and the neutrality-proof refresh is a maintenance step, not this
    arm's scope).
  - `test-measurement-cache-flags.js` (0/4 in the check) — passes 4/4 on
    the ARM tree with the box quiet. Load artifact: the test spawns
    `balance-panel.js` three times with a 30s budget each (check run
    91.5s ≈ 3×30s) while check.js runs 4-parallel on a 1.5-CPU box; the
    same signature departname-a recorded for this test.
  - 5 timeouts (exit null, 120.1s): `test-living-garden-deed-attainment`,
    `test-occupation-panels`, `test-one-person-army-deed-attainment`,
    `test-solo-campaign-endings`, `test-trust-observer-neutrality` —
    load timeouts under the parallel check; spot check
    `test-trust-observer-neutrality.js` alone on the arm tree passes
    6/6. Same class as the departname precedent's load timeouts.
  - Note: `check.js --only holdspeak` matches 0 scripts — the new proof
    test is not on the check.js list (green-list selection, not a glob);
    its gate record is the direct 30/30 run above.

**Verdict: GO (pilot)**, subject to B4's check result and the §9 confirm —
**confirmed by the adoption worker: confirm GO on 16 fresh seeds (§9),
final verdict GO.**

## 9. Confirm — 16 fresh seeds (prereg-frozen)

The prereg froze: if the pilot is GO, confirm on 16 fresh seeds (band
verified fresh first, recorded as prereg amendment before confirm runs).

**COMPLETED by the adoption worker (Loop A fleshout-20261124T0915Z).**
The 0715Z run was cancelled mid-confirm: confirm-before complete (16/16),
confirm-after partial (12/16, seeds 109417–109428, last file 09:18Z). The
adoption worker ran the missing after seeds 109429–109432 on the fixed code
with the identical substrate env (~297s for the 4 seeds, exit 0, errors 0,
brainSha `f9cf9be25ede`, gameSha unchanged `950901f3fdcc`), so the confirm
leg is complete: 16 before + 16 after, paired on identical seeds.

- **Band:** 109417–109432 (16 seeds, fresh — verified in prereg Amendment 1).
  Legs identical to the pilot (150d death-aware, competent policy verbatim,
  same substrate env; before `RUN=holdspeak-a-confirm-before`,
  after `RUN=holdspeak-a-confirm-after`, corpora under
  `evidence/2026-11-22/perseed-holdspeak-a-confirm-before/after`).
- **Analyzer judgment** (`evidence/2026-11-24/holdspeak-a-confirm-analysis.json`,
  exit 0, re-run by the adoption worker over the completed corpora):
  **verdict GO**. B1_voicedShare 1.0 (**197/197 hold-days voiced**),
  B1_pass true, B2_pass true, B2_fails []. Totals: holdDays 197, voicedDays
  197, reasonMismatches 0, badLines 0, sampleSize 34 (audit families:
  sick, range0, hurt, companion — every family present sampled, all
  matched). Causes (after verdicts): hurt 124, range0 36, companion 33,
  sick 4; gear_hold / veteran_guard / expired:no-trail / unknown **0** —
  those four templates still stand on staged fixtures alone (§7).
- **B2 per seed:** deaths, launches, beat lines, depart beats, days, and
  end reason identical on all 16 seeds (e.g. 109419: 49 deaths both legs,
  73 hold lines after vs 0 before; 109430: 52 deaths both legs, 46 hold
  lines after; 109429: 104 deaths both legs, 15 hold lines after).
- **Balanced panel (§15):** the panel builder gained a `--run` flag so the
  confirm legs could be built (default behavior unchanged — pilot panel
  rebuild is byte-identical to the frozen files);
  `evidence/2026-11-24/holdspeak-a-confirm-panel.{json,md}` (+
  before/after `.json.gz`). Decision **`review_required`**, compare exit 2
  — adjudicated PASS under B2 exactly as in the pilot: every observed
  contract metric is exactly 0 delta (village deaths 99.5625 → 99.5625,
  national 0 → 0, won 0 → 0, community loss 0.5625 → 0.5625, first-bearer
  survival 1 → 1 at day 30, 0.9375 → 0.9375 at day 60). Same label
  artifact, no signal.
- **Sense test (B3) on the confirm lines** (read by the adoption worker):
  lines read as people waiting — "Ruby is sick, and no one who can walk
  will take the plan — the party waits." (109432 d38, sick); "Henry never
  leaves Haven, and no one who can walk will take the plan — the party
  waits." (109429 d39, range0). Worst case is repetition, now measured on
  a second band: Eamon's hurt line repeats 31× over 79 days (109430),
  Elif's 21× over 47 days (109419). Same designed daily cadence, same
  follow-up as §6/§7 (day-count-varied wording), not a wrong reason and
  not a B3 miss — but the numbers are now two-band, so the follow-up is
  firmer than a hunch.
- **Wall numbers (confirm band, identical on both legs):** wins 0, national
  0, wave 5 reached on 8/16, median survival 130.5 days, deaths 1593.

**Confirm verdict: GO.** The pilot GO stands, confirmed on 16 fresh seeds.
No confirm miss; nothing overturns the pilot.

## 10. Metric review

- **Denominator choice:** B1 judges distinct (seed, day, vid) hold-DAYS, not
  hold verdicts (75 verdicts over 36 days — up to 3 ticks per day). The day
  is the unit the player experiences; the dedup is per-day by design. A
  verdict-denominated bar would have read 36/75 and misjudged a deliberate
  design choice as a miss.
- **Analyzer join:** conservative min(lines, days) per (day, first-name)
  group for same-first-name ambiguity; the pilot had no ambiguous groups
  (0 mismatches, sample unambiguous throughout).
- **Panel decision label:** `review_required` with all-zero deltas is a
  label artifact, not a signal. Future arms using pseudo-panels should note
  in their prereg that the decision label alone does not judge B2 — the
  deltas do.
- **Confirm repetition (adoption note):** the daily-cadence repetition is
  now measured on two bands — Eamon 31× / Elif 21× on confirm vs Hannah
  ~13× on pilot. If a future arm varies wording by day-count, the metric
  to beat is max repeats of one line per (seed, holder); no re-score
  proposed for this arm (B3's bar is "reads as people waiting", which the
  lines meet).
- **No metric proved wrong.** No re-score proposed.

## Convergence

**Converged on measured evidence.** The on-master hold silence (finding
#2713) is voiced at 100% on the pilot band (36/36) and the 16-seed confirm
band (197/197) with zero sim-outcome movement on either band; the four
unexercised templates (kit / veteran / no-trail / unknown) stand on staged
fixtures alone and are called out at merge.
