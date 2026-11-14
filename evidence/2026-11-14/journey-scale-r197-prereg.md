# journey-scale r197 — PRE-REGISTER (lane A, leg 3 SCALE, national on-ramp on current master)

**Run id:** `playtest-loop-a-20261114T1032Z` (lock run_id `playtest-loop-a-20261114T103250Z`).
**Run:** scheduled Sat 2026-11-14 03:45 CST (2026-11-14 09:45 UTC); lock created
10:32:50Z (started ~48 min late — scheduler/queue delay, not a run decision).
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only**
(a pilot-gate stop is not success; rotation stays 3).
**Base:** local master `b81fde1c5` (journey-deepening r191) at worktree
registration; master moved to `2042cb96c` during registration
(sim-transplant15d-a STOP evidence, 2 commits, evidence-only) — rebase
onto current master is owed at merge time unless master moves again.
**Pre-flight:** main tree clean, disk 39%, lock absent (no stale-lock
recovery). `git pull` at 10:32Z: already up to date at b81fde1c5. Reap:
SKIP — registry lock held by another reaper run (consecutive skips: 1);
no cleanup this run, nothing removed.
**Worktree:** `journey-scale`, registered 10:34Z, completed 11:06Z (~23
min — registry-lock queue behind a live sim-transplant15a-narrowed-a
registration, then a slow checkout under box load 11–17; no half-checked-out
recovery needed this time). Registry entry verified present; tree clean at
b81fde1c5. Heartbeat at registration (11:06:45Z) + hbloop
`~/workspace/worktrees/journey-scale-hbloop-r197.sh` (PID 66556, 10-min
cadence, re-check the loop PROCESS at each phase — r134's loop died
silently mid-run).
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

- **r196 scale (landed 2026-11-13, 8c83b6a9a):** national 0/4 on fresh
  seeds 135201–135204; 2/4 survived (135203 alive d141, 135204 alive
  d140); lived-days 460 vs r195 band 392 (+17.3%, HOLD); lesser seat
  priced 4/4; wave-5 fights 0 on all seeds; tribute DELIVERED first time
  since r134 (135203 military_tribute d140, 1/11 attempts). NEW
  DIAGNOSIS: the wall is now trust-hold, not link count — national needs
  seasoned links at trust 40+ for a season; 135204 had 3 active
  subordinates, 0 seasoned (oldest link decayed 54→35 after a succession
  crisis). The r196 analyzer fixes are IN this run's instruments — the
  analyzer keeps them as the instrument, not a re-proof. The r196
  telemetry verdict (QUIET; fightsTotal -51.8%, w4 -46.4%, maxGameDay
  -28.8% vs baseline; baseline NOT rolled) stands — this run re-checks
  telemetry against the same scale.json baseline and does not roll it
  without an investigation first.
- **What changed in the game since r196's base (486405e05 → 2042cb96c):**
  three src/js landings — journey-deepening r191 (4c860321d: stage-0
  guard fresh-favor reorder in conversation.js — a villager was asking
  about food with a re-ask phrasing for a same-sitting favor),
  journey-landing r131 (63c051206: HEED fix — warn_you warning now
  engages the want), sim-rageprecheck-b (e73ee835d: refuse Unleash Rage
  re-press while rageActive live). None touches combat initiation or the
  hierarchy/scale systems; the conversation fixes touch the dialogue
  surface this leg's people check reads. The rest of the delta is
  record/evidence-only (transplant arms UNMEASURED, proofrefresh-b14,
  r199 endgame analyzer fix — scripts only).
- **The wall (tracker, scale-onramp — converging, NOT converged):** on
  every judged corpus this week, survived 1–2/8, regional 8/8, national
  0/8, table 0/8, wins 0/8, wave-5 1–2/8, median ~134–139d. The collapse
  cause is localized to merge e4dbe581b (CULPRIT_MERGE); the inside-the-
  merge bisect narrowed to 39 revisions (203a32775, aa5d9ef92] — narrowed
  15A–15F arms are the tracker's next blanks, NOT this run's job. This run
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
  takes invites (verbal or mimed) — lane decision owed; wave-5 door never
  opened on any seed (0 wave-5 fights); Herve nod loop (5× French-only
  nod, r196); ask_favor stage 2 never surfaces the favor (2/2, r196);
  Gisele heed duplication; raise-talk closers formulaic; telemetry
  fightsTotal baseline re-base (owed — evaluate after this panel);
  culpritbisect narrowed 15A–15F (tracker blanks — bisect steps, not a
  journey leg); proof refresh round 15 (owed after the next manifest
  change).

## The blank to fill this run (r196 follow-up, owed)

**Ladder-line caps display:** on r196 seed 135203 d140, the ladder line
prints all three caps as `delivered`
(`trade_charter=delivered,feast_embassy=delivered,military_tribute=delivered`)
while the census names only military_tribute as delivered
(capstoneDelivered kind=military_tribute d140). Either the caps field
collapses after any delivery or the other two delivered silently. This
run reads the ladder-line writer + the caps field in the census JSON and
determines which: a narrow display/code defect gets a fix + proof test;
a silent-delivery truth gets documented with the evidence. The census
JSON is authoritative (1 delivery); the analyzer reads the census, not
the line.

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
- Lived-days within ±25% of the **r196 band's 460** (re-based from r195's
  392 — most recent same-instrument band; guardrail 345–575); no
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
transcript attribution split (file-level) are re-checked, not re-litigated
as defects. NEW surface this run: the r191 stage-0 guard reorder (a
fresh-need line must come before a re-ask phrasing in the same sitting)
and the r131 HEED fix (a warn_you warning must engage the want) — read
any sitting that touches them for sense.

## Q5 — CENSUS (plain words)

Per-seed: who lived/died, what they knew (monster meat, places, links),
what was missing. Standard scale census fields (ladder stage, lesser/full
seat, national, deaths by cause, books close).

## Panel

- **Seeds: FRESH 135301–135304** (freshness verified below). One seed per
  process (r183 adoption: driver multi-seed state leak).
- **Horizon:** DAYCAP=140, death-aware stop (+10d tail max).
- **Policy:** `scalecourt-traderoad-r113-linkraise-sit` (same as
  r131/r132/r133/r134/r195/r196) — NO chooser change in this run (Q3 is read-only).
- **Driver:** `scripts/journey-scale-r197-20261114.js` (r196 driver cloned:
  labels/EVIDIR/seed list only; r196 picker, full-opening-transcript log,
  nonverbal sitting on CONVO_DAYS, vetbar recorder kept).
- **Analyzer:** `scripts/analyze-journey-scale-r197-20261114.js` (r196
  analyzer cloned + lived-days control re-based to the r196 band's 460).
- **Proof:** `scripts/test-journey-scale-r197-analyzer-20261114.js` — the
  real analyzer on synthetic corpora (29 assertions: national 1/4 GO,
  national 0/4 with blockers NO-GO-on-the-wall at exit 0, raise defect
  exit 1, vetbar disagreement exit 1, no raise talks exit 2, lived-days
  breach exit 1, missing natgate file ERROR row at exit 0, -nv header/
  mime cases, regular-transcript mime case, verbal-sitting exclusion).
  29/29 green before the panel runs.
- **Pilot:** seed 135301 first. Pilot gates: crash, census errors > 0,
  0 census rows, reconciliation residual != 0, teleOnly > 0,
  0 trustset rows by d60, 0 national-gate rows, or no vetbar rows by
  d60 → STOP and diagnose (INCOMPLETE, not a verdict).

## Seed freshness

135301–135304: 0 hits naming the band in any dated prereg
(`evidence/*/sim-*-prereg.md` and `evidence/**/*prereg*` greps, run
2026-11-14 in the main tree before registration completed). No
forbidden-band or contaminated-band list exists in evidence/ naming this
band. Fresh band confirmed before the panel runs. No game fixture seed is
needed this run (the analyzer proof uses synthetic corpora, no staged
game).

## Metric review (to fill at closeout)

- Q1: the interesting-finding rule as written (national count + per-seed
  blocker).
- Q2: the guards as written (lived-days control re-based r195 392 → r196
  460 — the re-base itself is this run's metric change, recorded here
  before the panel ran).
- Q3/Q4/Q5: as written.

## CLOSEOUT — run 2026-11-14T1032Z (this run)

**Panel (seeds 135301–135304, DAYCAP=140):** 135301 alive d141 (3/3,
regional, lesser d40, tribute ready d138 undelivered); 135302 alive d141
(8/8, lesser d37, military_tribute delivered d96, 1 wave-5 kill — Editor
d87); 135303 alive d140 (8/8, lesser d51, 140 fights, 124 wave-4, 0
wave-5); 135304 over d104 (SCATTERED from hunger, 11 alive when they
walked, 7 wave-5 fights, 4 kills). Lived-days 526 vs r196 band 460
(+14.3%, HOLD). Lesser 4/4. Books close, unattributed 0, teleOnly 0.
Wave-5 fights 8 (door opened on 2/4 seeds, 5 kills — first time on the
scale leg in recent bands).

**Q1 — NO-GO on the wall, blocker named per seed (informative):** national
0/4. 135301: LEAD 2/3 (needs 1 more seasoned). 135302: TRADE 1/3 (needs
2). 135303: LEAD 2/3 (needs 1). 135304: COLLAPSE (hunger scatter d104).
Wall stands on a fresh band: survived 3/4, national/table/wins 0/4. The
binding constraint is still trust held above 40 for a season; the
fourth seed adds a hunger-scatter collapse flavor.

**Q2 — all GO/HOLD (exit 0):** raise 6 talks (3 answered, 3
not-offered-unspoken correct holds, 0 defects); vetbar 0 disagreements
(phantomDays d96–d140 on 135302 — shadow tracks kill history, stays
elevated after the tribute delivery removed 2 veterans); trap HOLD (Xue
d120-nv mime shown + answered — r134 fix re-proven); betrayal HOLD (3
turn-0 offers, all labeled); lived-days HOLD; lesser 4/4.

**Q3 — RECORDED:** daily-play mimes 25, daily accepts proven 0; Xue
(Mandarin-only, trust 90) mime shown + nv:accept taken in the driver
sitting; Mariko (Japanese-only, trust 90) no mime, 4× nod. Lane decision
still owed.

**Q4 — PASS:** all d90/d120 transcripts + all 6 raise talks read in full.
Senseless 0. Strongest: Ho-jun d120 ("Did you leave someone behind? ...
'Me too.'"). Observations: Mariko 4× nod loop (no mime); Xue 3× nod
after a real exchange; ask_favor surfaces on the want thread (Ava d90,
Fernando d120) but not the goal thread (Fernando d90); Omar raised 3
days running with no shared words (correct holds); first-memory +
"left someone behind" line-pool reuse; formulaic raise closers. New
surfaces (r191 stage-0 guard, r131 HEED fix) not exercised in this band.

**Q5 — census in the run note** (`evidence/2026-11-14/journey-scale-r197.md`).

**The blank filled:** ladder-line caps display diagnosed + fixed —
the caps field collapses after any delivery (engine's 'delivered' reason
is global, one-shot by design; the other two never delivered — census is
authoritative). Fix: `scripts/ladder-caps-render.js` (new) + driver
wiring; proof 8/8. No src/js change.

**Telemetry:** QUIET (0 LOUD lines) — fightsTotal -17.0%, w4 +6.6%,
maxGameDay -18.6% vs baseline, all under the 60% bar. Baseline NOT
rolled.

**Verdicts:** reachable YES, fun YES, winnable NO (this leg).

**Gate / landing:** see the run note's Gate/landing section (filled at
closeout). Full record: `evidence/2026-11-14/journey-scale-r197.md`.
Corpus: `hidden_files/evidence/2026-11-14/journey-scale-r197-*` (goal
store).
