# journey-scale r195 — PRE-REGISTER (lane A, leg 3 SCALE, national on-ramp on current master)

**Run id:** `playtest-loop-a-20261113T1927Z` (lock run_id `2026-11-13T19:27:31Z`).
**Run:** scheduled Fri 2026-11-13 12:45 CST (18:45 UTC); this run's lock created
19:27:31Z — the run started ~42 min late (scheduler/queue delay, not a run
decision).
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only**
(a pilot-gate stop is not success; rotation stays 3).
**Base:** local master `e2e35630c` (journey-endgame r194 addendum). Pre-flight
`git pull` FAILED at 19:27Z (`fatal: unable to access
'https://github.com/steve-vitale/the-oversight.git/': Recv failure:
Connection reset by peer`) — transient network, not a repo state problem;
local master is the r194-adopted tip verified by the main session, so the
run proceeds on it. Retry the pull at merge time; if master has moved under
the run, rebase the branch onto the new master and re-run proof tests
before merging (AGENTS.md push discipline).
**Worktree:** `journey-scale`, registered ~19:32Z (register took 3.6 min —
restat under heavy sibling load, not stuck). Heartbeat landed at
registration; hbloop `/tmp/journey-scale-hbloop-r195.sh` (setsid, PID 167724,
10-min cadence, verified alive at start; re-check the loop PROCESS at each
phase — r134's loop died silently mid-run).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, nor
gate change in this run. **Perception law (2026-10-28) stands.**
**Combat-play gate (Steve 2026-11-10 17:52 CST):** no toughness/gear/ability
tuning in this run — it measures the on-ramp and reads people; any fix it
finds is dialogue/narration-scoped, or it is documented, not built.
**DELIVER OVER MEASURE (2026-11-01):** this run measures the national
on-ramp on current master after a day of landings (r134 raise fix, r194
endgame, steeple/strikefall narration, culpritbisect narrowing). It does
not re-prove the veteran census or the survival collapse (the bisect owns
that) — but the panel's wall reading IS a fresh-band check on the collapse
shape, and a moved wall would be the run's headline.

## Standing context (read before scoring)

- **r134 scale (landed 2026-11-12, a60da9ae3):** spoken-raise answer window
  fix — GO, 21 raise talks, 0 spoken-but-unanswerable, 5 properly answered.
  Panel: 2 alive / 2 dead, all regional (polity rank), ladder peak stage 3
  (National Standing on points), lesser seat priced 4/4, tribute delivered
  1/4, lived-days 471. The r134 fix is IN this run's base — the analyzer
  keeps it as a regression guard (Q2), not a re-proof.
- **r194 endgame (landed 2026-11-13, e2e35630c):** 4 full seats via the
  bought bundle, 0 via tribute (0/13); pass A 0/5 full; M23 NO-GO is a
  metric artifact (scholar+1 'veterans-short' refusals); M24b fired GO;
  159-turn Algorithm fight reproduces on the frozen arm (win-plan-null
  shape at scale, filed). Q1 (l) EXONERATED.
- **The wall (tracker, scale-onramp — converging, NOT converged):** on
  every judged corpus this week, survived 1–2/8, regional 8/8, national
  0/8, table 0/8, wins 0/8, wave-5 1–2/8, median ~134–139d. The collapse
  cause is localized to merge e4dbe581b (CULPRIT_MERGE); the inside-the-
  merge bisect narrowed to 39 revisions (203a32775, aa5d9ef92] — round 12
  is the tracker's next blank, NOT this run's job. This run plays the
  scheduled scale leg; its panel is a fresh-band wall reading, not a
  bisect step.
- **Scale canon (docs/SCALE.md):** national is a POLITY — one primary with
  ≥3 SEASONED subordinates (30+ days old, trust 40+), or BELONG (valued
  subordinate in a ≥4-village realm), COVENANT (≥3 seasoned peer links),
  TRADE (≥3 seasoned trade links), CONQUEST, or REFUSE. Ladder stage 3
  (National Standing, points) is NOT national (polity rank) — the r134
  panel reached stage 3 on points while staying regional. Q1 measures the
  polity (natgate `nat=1`), with ladder stage as the secondary read.
- **Carried gaps (not this run's to build):** daily-play chooser never
  takes invites (verbal or mimed) — lane decision owed; Nikolai
  (Russian-only, r134) mimes unanswered in daily play; agency
  reactive-budget trim splits a live ask's accept/decline pair (latent);
  headcount-ceiling (Steve-call); Reunion mirror pack in the wild (Steve
  design call); monster-veteran +3 damage gap (Steve call).

## Q1 (PRIMARY) — NATIONAL ON-RAMP: measure it on current master

**Question:** in a competent 140d panel on fresh seeds, how many villages
reach national (a polity lives, `nat=1` in the natgate file), and when they
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
- Lived-days within ±25% of the r134 band's 471; no alive/dead flip
  without an attributed cause.
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
"And?"/"Yeah?" filler repeats (r134 observation) and the raise-talk vs
transcript attribution split (mime lines to YOU in raise-talk files, to
THEM in transcripts) are re-checked, not re-litigated as defects.

## Q5 — CENSUS (plain words)

Per-seed: who lived/died, what they knew (monster meat, places, links),
what was missing. Standard scale census fields (ladder stage, lesser/full
seat, national, deaths by cause, books close).

## Panel

- **Seeds: FRESH 135101–135104** (freshness verified below). One seed per
  process (r183 adoption: driver multi-seed state leak).
- **Horizon:** DAYCAP=140, death-aware stop (+10d tail max).
- **Policy:** `scalecourt-traderoad-r113-linkraise-sit` (same as
  r131/r132/r133/r134) — NO chooser change in this run (Q3 is read-only).
- **Driver:** `scripts/journey-scale-r195-20261113.js` (r134 driver cloned:
  labels/EVIDIR/seed list only; r134 picker, full-opening-transcript log,
  nonverbal sitting on CONVO_DAYS, vetbar recorder kept).
- **Analyzer:** `scripts/analyze-journey-scale-r195-20261113.js` (r134
  analyzer cloned + the Q1 NATIONAL section: natgate parse per seed —
  national days, max rank, final-day closest road + blocker diagnosis;
  Q3 control re-based to the r134 band's 471 lived-days).
- **Proof:** `scripts/test-journey-scale-r195-analyzer-20261113.js` — the
  real analyzer on synthetic corpora (17 assertions: national 1/4 GO,
  national 0/4 with blockers NO-GO-on-the-wall at exit 0, raise defect
  exit 1, vetbar disagreement exit 1, no raise talks exit 2, lived-days
  breach exit 1, missing natgate file ERROR row at exit 0). 17/17 green
  before the panel runs.
- **Pilot:** seed 135101 first. Pilot gates: crash, census errors > 0,
  0 census rows, reconciliation residual != 0, teleOnly > 0,
  0 trustset rows by d60, 0 national-gate rows, or no vetbar rows by
  d60 → STOP and diagnose (INCOMPLETE, not a verdict).

## Seed freshness

135101–135104: 0 hits for the exact literals in tracked preregs
(`evidence/**/*.md`) and drivers (`scripts/*.js`) via `git grep`
(2026-11-13); 0 filename hits. The only `13510` prereg hit anywhere is a
line-number citation (`game.js:13510` in sim-meleefirst-b-prereg.md) — not
a seed. A full-tree `grep -r` returned only numeric coincidences inside
JSON telemetry corpora (pantry/kcal/day numbers containing the digit
string) — no seed namings; no forbidden-band or contaminated-band list
exists in evidence/. Fresh band confirmed before the panel runs. No game
fixture seed is needed this run (the analyzer proof uses synthetic
corpora, no staged game).

## Metric review (to fill at closeout)

- Q1: the interesting-finding rule as written (national count + per-seed
  blocker).
- Q2: the guards as written.
- Q3/Q4/Q5: as written.

## Carried (not this run's to build)

Daily-play chooser never takes invites — lane decision owed (see Q3);
resolveInvite outcome lines quote the NPC in English in no-shared-words
sittings; nod-loop variety in nonverbal sittings; spoken-raise +
invitation both-spoken precedence (noted in Q1, not built); Baraka
unvoiced raise (re-check Q3, not a build); monster-veteran +3 damage gap
(Steve call); `tbVillagerFalls` vp.dead lie; guest-death (Bing) prereg;
scholar-payment open item (Steve-call); scale.json baseline regime
re-label; measurement-proof refresh owed (r134 + r129 + r192 +
combatdedup + steeple + strikefall src/js changes — proof rounds 11 + 12
still owed); reaper-lock self-contention fix (Steve-approved 2026-11-12,
needs the build, not this run); heartbeat-loop death mode (r134: check the
loop process at each phase — it DIED this run ~00:16Z, caught 01:08Z);
agency reactive-budget trim splits a live ask's accept/decline pair when a
question's answers are live (villager-agency.js ~1810-1860; probed r134,
latent edge case, NOT in the wild band; fixing it changes the answers+2
contract, a design call for a later run); culpritbisect round 12 (the
tracker's next blank — a bisect step, not a journey leg; not this run).
