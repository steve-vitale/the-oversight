# journey-scale r196 — PRE-REGISTER (lane A, leg 3 SCALE, national on-ramp on current master)

**Run id:** `playtest-loop-a-20261114T0258Z` (lock run_id `laneA-scale-20261114T025800Z`).
**Run:** scheduled Fri 2026-11-13 20:45 CST (2026-11-14 02:45 UTC); lock created
02:58:00Z (started ~13 min late — scheduler/queue delay, not a run decision).
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only**
(a pilot-gate stop is not success; rotation stays 3).
**Base:** local master `486405e05` (sim-transplant7 record-only; r197 succession
adoption + r189 deepening already in). Pre-flight: main tree clean, disk
39%, lock absent (no stale-lock recovery). `git pull` at 02:58Z: already up
to date at 443255263 — master then moved twice under the run (r197 adoption
bb9e63e7b, transplant7 record 486405e05); the worktree was registered on
486405e05, so no rebase is owed at merge time unless master moves again.
**Worktree:** `journey-scale`, registered 03:13Z (register took ~8 min —
first attempt was killed by a runtime restart mid-`git worktree add`,
leaving a half-checked-out tree on a stale branch; recovered by removing
the broken tree + branch and re-registering clean; registry entry verified
present after). Heartbeat at registration + hbloop
`~/workspace/worktrees/journey-scale-hbloop-run.sh` (10-min cadence,
re-check the loop PROCESS at each phase — r134's loop died silently
mid-run).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, nor
gate change in this run. **Perception law (2026-10-28) stands.**
**Combat-play gate (Steve 2026-11-10 17:52 CST):** no toughness/gear/ability
tuning in this run — it measures the on-ramp and reads people; any fix it
finds is dialogue/narration-scoped, or it is documented, not built.
**DELIVER OVER MEASURE (2026-11-01):** this run measures the national
on-ramp on current master after a day of landings (see below). It does not
re-prove the veteran census or the survival collapse (the bisect owns
that) — but the panel's wall reading IS a fresh-band check on the collapse
shape, and a moved wall would be the run's headline.

## Standing context (read before scoring)

- **r195 scale (landed 2026-11-13, 7982d7ba4):** national 0/4 on fresh
  seeds 135101–135104; 1/4 survived (135101 alive d141, LEAD 2/3 seasoned,
  BELONG good but realm-less); 3/4 collapse before d100; lived-days 392
  vs r134 band 471 (-16.8%, HOLD); lesser seat priced 4/4; wave-5 fights
  0 on all seeds; tribute ready-but-undelivered echoed (0/7). The r195
  analyzer fixes (natgate booleans, trap-line glob, header scan + Baraka
  filter, COLLAPSE blocker rule) are IN this run's instruments — the
  analyzer keeps them as the instrument, not a re-proof. The r195
  telemetry verdict (fightsTotal -75% LOUD, explained as collapse +
  flee-behavior + band noise; baseline NOT rolled) stands — this run
  re-checks telemetry against the same scale.json baseline and does not
  roll it.
- **What changed in the game since r195's base (e2e35630c → 486405e05):**
  three src/js landings — sim-retribution-b (855764c3b: defer retribution
  death lines until after the RETRIBUTION summary), journey-landing r130
  (6ccdc325e: ask:village injured question gets an injured answer),
  journey-social r195 (56655e81e: favor-requirements spend-out fires
  under the door-block cycle + empty-recap 4-variant pool). None touches
  combat initiation; the injured-question and favor changes touch the
  conversation/social surface this leg's people check reads. The rest of
  the delta is record/evidence-only (transplant arms UNMEASURED,
  proofrefresh-b13, r189 instrument-only, r197 no src/js).
- **The wall (tracker, scale-onramp — converging, NOT converged):** on
  every judged corpus this week, survived 1–2/8, regional 8/8, national
  0/8, table 0/8, wins 0/8, wave-5 1–2/8, median ~134–139d. The collapse
  cause is localized to merge e4dbe581b (CULPRIT_MERGE); the inside-the-
  merge bisect narrowed to 39 revisions (203a32775, aa5d9ef92] — narrowed
  4b/5b arms are the tracker's next blanks, NOT this run's job. This run
  plays the scheduled scale leg; its panel is a fresh-band wall reading,
  not a bisect step.
- **Scale canon (docs/SCALE.md):** national is a POLITY — one primary with
  ≥3 SEASONED subordinates (30+ days old, trust 40+), or BELONG (valued
  subordinate in a ≥4-village realm), COVENANT (≥3 seasoned peer links),
  TRADE (≥3 seasoned trade links), CONQUEST, or REFUSE. Ladder stage 3
  (National Standing, points) is NOT national (polity rank) — the r134
  panel reached stage 3 on points while staying regional. Q1 measures the
  polity (natgate `nat=true`), with ladder stage as the secondary read.
- **Carried gaps (not this run's to build):** daily-play chooser never
  takes invites (verbal or mimed) — lane decision owed; tribute
  ready-but-undelivered (r194's finding, echoed 0/7 in r195); belong-good-
  but-realm-less on the living village (correct per canon — BELONG needs
  a realm, not a defect); wave-5 door never opened on any seed (0 wave-5
  fights); "Yeah?" filler; flat closer "Well. That happened."; raise-talk/
  transcript attribution split (file-level); telemetry fightsTotal
  baseline re-base (next run); culpritbisect round 12 (tracker blank #1 —
  a bisect step, not a journey leg); proof refresh round 14 (owed).

## Q1 (PRIMARY) — NATIONAL ON-RAMP: measure it on current master

**Question:** in a competent 140d panel on fresh seeds, how many villages
reach national (a polity lives, `nat=true` in the natgate file), and when they
don't, what is the single binding constraint per seed — the closest road
(LEAD/COVENANT/TRADE seasoned counts), what it lacks, the pending shape,
the belong good flag, or collapse before the national window?

**Interesting-finding rule (binding):** the run is informative iff EITHER
≥1/4 seeds reach national (GO — the on-ramp is open on current master, the
wall moved) OR 0/4 AND the analyzer names a per-seed blocker for every
seed (NO-GO on the wall, blocker named — the finding IS the blocker). 0/4
with no diagnosable constraint (e.g. all seeds die before d60 with no links
at all) = INCOMPLETE — document and move on, do not re-score the panel
against a friendlier metric.

**What would overturn the picture:** ≥2/4 national, or a full seat, or a
seed whose blocker is a named defect with a narrow fix (that becomes the
run's blank — fix + proof, or document in sim-findings.md).

## Q2 — REGRESSION GUARDS (fail the run if any breaches)

- r134 spoken-raise: 0 not-offered-spoken raise talks AND ≥1 properly
  answered (the analyzer's classifier; exit 2 if the band has no raise
  talks at all — INCOMPLETE, not a verdict).
- Vetbar: 0 days where readiness veterans != ladder veterans per wave 4
  and wave 5.
- Trap-line: 0 defect sittings (mime shown, no nv:answer at turn 0).
- Betrayal sibling: 0 turn-0 betrayal:accept offers without the invite
  label in the sitting's opening THEM lines.
- Lived-days within ±25% of the **r195 band's 392** (re-based from r134's
  471 — most recent same-instrument band; guardrail 294–490); no
  alive/dead flip without an attributed cause.
- Lesser seat priced ≥3/4.

## Q3 — BARAKA / DAILY-PLAY MIME (read-only, carried)

Count in the panel's say-captures: daily-play mimes shown vs
nv:accept/betrayal:accept taken in daily play (capture lower bound + betray
watch off-day events). Expected 0 daily accepts — the gap, confirmed.
Record the lane decision owed; no build claimed. Baraka re-check: any
comm-'none' villager with a staged raise in the band, and what happened.

## Q4 — PEOPLE CHECK (d90/d120 + nonverbal + raise talks, in full)

Read in full: the d90/d120 transcripts AND the explicit nonverbal sittings
AND all raise talks. Bar: senseless 0 for the raise-answer class (a spoken
raise answered with the words that fit what was said; no English YOU lines
in a no-words sitting; no nod loops past the answer). The generic-question
"And?"/"Yeah?" filler repeats (r195 observation) and the raise-talk vs
transcript attribution split (mime lines to YOU in raise-talk files, to
THEM in transcripts) are re-checked, not re-litigated as defects. NEW
surface this run: the r130 injured-question answers and the r195-social
favor spend-out — read any sitting that touches them for sense (an injured
answer must fit an injured villager; a spend-out must name what was spent).

## Q5 — CENSUS (plain words)

Per-seed: who lived/died, what they knew (monster meat, places, links),
what was missing. Standard scale census fields (ladder stage, lesser/full
seat, national, deaths by cause, books close).

## Panel

- **Seeds: FRESH 135201–135204** (freshness verified below). One seed per
  process (r183 adoption: driver multi-seed state leak).
- **Horizon:** DAYCAP=140, death-aware stop (+10d tail max).
- **Policy:** `scalecourt-traderoad-r113-linkraise-sit` (same as
  r131/r132/r133/r134/r195) — NO chooser change in this run (Q3 is read-only).
- **Driver:** `scripts/journey-scale-r196-20261114.js` (r195 driver cloned:
  labels/EVIDIR/seed list only; r195 picker, full-opening-transcript log,
  nonverbal sitting on CONVO_DAYS, vetbar recorder kept).
- **Analyzer:** `scripts/analyze-journey-scale-r196-20261114.js` (r195
  analyzer cloned + lived-days control re-based to the r195 band's 392).
- **Proof:** `scripts/test-journey-scale-r196-analyzer-20261114.js` — the
  real analyzer on synthetic corpora (29 assertions: national 1/4 GO,
  national 0/4 with blockers NO-GO-on-the-wall at exit 0, raise defect
  exit 1, vetbar disagreement exit 1, no raise talks exit 2, lived-days
  breach exit 1, missing natgate file ERROR row at exit 0, -nv header/
  mime cases, regular-transcript mime case, verbal-sitting exclusion).
  29/29 green before the panel runs.
- **Pilot:** seed 135201 first. Pilot gates: crash, census errors > 0,
  0 census rows, reconciliation residual != 0, teleOnly > 0,
  0 trustset rows by d60, 0 national-gate rows, or no vetbar rows by
  d60 → STOP and diagnose (INCOMPLETE, not a verdict).

## Seed freshness

135201–135204: 0 hits naming the band in any dated prereg
(`evidence/*/sim-*-prereg.md` and `evidence/**/*prereg*` greps, run
2026-11-14 in the worktree). The only `13520[1-4]` hits anywhere in
tracked evidence are numeric coincidences inside JSON telemetry corpora
(float digits such as 4.813520488410844; long digit strings) — no seed
namings; the three Nov 1 preregs naming "forbidden" (sim-fallen90-b,
sim-fullseat-recheck-a, sim-stay-a) name no 1352xx band. No forbidden-band
or contaminated-band list exists in evidence/ naming this band. Fresh band
confirmed before the panel runs. No game fixture seed is needed this run
(the analyzer proof uses synthetic corpora, no staged game).

## Metric review (to fill at closeout)

- Q1: the interesting-finding rule as written (national count + per-seed
  blocker).
- Q2: the guards as written (lived-days control re-based r134 471 → r195
  392 — the re-base itself is this run's metric change, recorded here
  before the panel ran).
- Q3/Q4/Q5: as written.

## CLOSEOUT — run 2026-11-14T0258Z (this run)

**Panel (seeds 135201–135204, DAYCAP=140):** 135201 over d82; 135202 over
d97; 135203 alive d141 (4/4, lesser d34, military_tribute delivered d140
1/11 attempts); 135204 alive d140 (4/4, lesser d107, 3 active subs, 0
seasoned). Lived-days 460 vs r195 band 392 (+17.3%, HOLD). Lesser 4/4.
Books close, unattributed 0, teleOnly 0. Wave-5 fights 0 on all seeds.

**Q1 — NO-GO on the wall, blocker named per seed (informative):** national
0/4. 135201/135202: COLLAPSE (over d82/d97). 135203: LEAD 0/3 (1 active,
trust 26). 135204: LEAD 0/3 (3 active, 0 seasoned — trust decay: oldest
link 54→35 after a succession crisis; one link trust 7; third formed
d125). Wall stands on a fresh band: survived 2/4, national/table/wins
0/4. Deaths combat-driven (39/62 "the wild"), not food-driven.

**Q2 — all GO/HOLD (exit 0):** raise 6 talks (5 answered, 1
not-offered-unspoken correct hold, 0 defects); vetbar 0 disagreements;
trap SILENT (0 mime sittings — no regression check this band); betrayal
HOLD (3 turn-0 offers, all labeled); lived-days HOLD; lesser 4/4.

**Q3 — RECORDED:** daily-play mimes 21, daily accepts proven 0; Herve
(French-only, trust 92) nod loop in the driver sitting. Lane decision
still owed.

**Q4 — PASS:** all d90/d120 transcripts + all 6 raise talks read in full.
Senseless 0. Strongest: Wolfgang d125 ("Did you leave someone behind?
... 'Me too.'"). Observations: Herve 5× nod loop; ask_favor stage 2
never surfaces the favor (Morris d90, Wolfgang d120 — 2/2); Gisele heed
line twice; formulaic raise closers. New surfaces (r130 injured
question, r195-social favor spend-out) not exercised in this band.

**Q5 — census in the run note** (`evidence/2026-11-14/journey-scale-r196.md`).

**The blank filled:** driver R195 SUMMARY label fixed at pilot (commit
8c7b802f1); ladder-line caps display observed (all three read delivered
after one delivery — follow-up, not built). No src/js change; the nod
loop, ask_favor pattern, and formulaic closers are carried observations.

**Telemetry:** QUIET (0 LOUD lines) — fightsTotal -51.8%, w4 -46.4%,
maxGameDay -28.8% vs baseline, all under the 60% bar. Baseline NOT
rolled.

**Verdicts:** reachable YES, fun YES, winnable NO (this leg).

**Gate / landing:** see the run note's Gate/landing section (filled at
closeout). Full record: `evidence/2026-11-14/journey-scale-r196.md`.
Corpus: `hidden_files/evidence/2026-11-14/journey-scale-r196-*` (goal
store).
