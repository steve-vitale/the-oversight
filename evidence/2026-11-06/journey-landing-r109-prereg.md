# journey-landing r109 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon to d28)

**Run id:** laneA-20261106T0745Z (scheduled 01:45 CST 2026-11-06, started ~07:54Z).
Rotation read 0 → leg 0 LANDING; wrote 0→1 at run start, verified by read-back.
**Rotation-write discrepancy (6th sighting):** r108's note claimed 0→1 was written
and verified at closeout, but the file read 0 again at this run's start. The
closeout write fails silently and intermittently (deepening r103/r104/r105,
r106, r107, r108 all documented it). This run's write is verified immediately
above and will be re-verified at closeout.
**Base:** master@49215d0f8 at run start (`git pull` already up to date; main tree
clean; disk 25%). **Seed band 1023–1032 (fresh — see below).**
**Registration:** single attempt, succeeded in ~5 min (loaded box; `git worktree
add` slow, no EPERM). Heartbeat at registration + 10-min loop (PID 54677).
**Numbering note:** the Lane A counter is global across legs; r108 (landing) was
last, so this run is r109.
Driver: scripts/journey-landing-r109-20261105.js (committed by r108: r108 driver
verbatim except seeds 1023–1032, OUTDIR landing-r109, header; diff-verified at
run start — only header/seeds/OUTDIR differ). Analyzer:
scripts/analyze-landing-r104-20261105.js (unchanged). Commit-offer:
scripts/analyze-landing-r107-commit-offer.js (unchanged; thread-gate cases read
from saved transcripts by hand).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, or gate
change in this run. **Perception law (2026-10-28) stands** — all instruments
read-only; pickers press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** a code change lands ONLY if a defect is
proven in game code (not driver policy) with a before/after proof test; otherwise
document and move on. This run carries NO planned code change — the questions are
adjudications and watches; a fix follows only if Q1/Q2 proves a game-code defect.

## Seed-band freshness (skill: local_seed_band_freshness)
- **Chosen band 1023–1032**, verified fresh across ALL dated preregs (not just
  today's): word-boundary grep for 1023–1032 over `evidence/*/sim-*-prereg.md`
  and `evidence/*/journey-*-prereg.md` returns only round-number filenames
  (sim-scale-onramp-round-1030.md, sim-winnability-round-1030.md), a line-number
  mention ("spring line 1028" in journey-social-life-r113-prereg.md), and zero
  prereg names any of 1023–1032 as panel seeds. No corpus files for these seeds
  exist.
- Forbidden/contaminated-band files checked explicitly (no hits for 1023–1032):
  evidence/2026-11-06/sim-spandraw-census-a-prereg.md,
  evidence/2026-11-06/sim-finishprobe-a-prereg.md,
  evidence/2026-11-05/sim-gearoff-confirm-b-prereg.md,
  evidence/2026-11-05/sim-trickoff-confirm-b-prereg.md,
  evidence/2026-11-05/journey-social-life-r144.md.
- Contaminated bands NOT reused: 897–906, 1301–1304, 917–926, 1001–1010,
  1101–1110, 1201–1210, 2001–2010, 3001–3010 (all named in r107/r108 preregs as
  used).

## Q1 (PRIMARY) — THE THREAD-GATE OPEN QUESTION (r107 seed 1010 d12, n=1)
**Basis:** one r107 sitting (1010 d12) had engagement PICKED but the want stayed
stage 1. Code-read hypothesis from r107: convo-dialogue.js:293 engages only
when the thread is null/'want'/'small' — a non-null thread (gossip, personal)
may block engagement even when the option is picked. r108 returned 0 cases.
**Pre-registered metric (binding):**
- M-TG: count r109 sittings where engagement was PICKED but the want stayed
  stage 1. For each, read the saved transcript and name the thread at pick
  time. If ≥2 such cases share a non-null/non-'want'/non-'small' thread, the
  thread gate is a REAL mechanism — name it and its frequency. If 0–1 cases,
  the question stays open (n≤2), not a verdict. Pooled with r107+r108: a
  second instance anywhere in the three panels (n=2) also counts as a
  mechanism candidate, to be named with its thread.
- A miss is NO-GO, never re-scored.

## Q2 (PRIMARY) — FLESH CHANNEL FRICTION: PATTERN OR ONE-SEED NOISE?
**Basis:** r108 flesh: arrivalSeeds=9/10, testSeeds=9, exitSeeds=7, stuckSeeds=2
(1017 rot, 1020 poison), no-arrival 1018 (14 kills, 0 tests, 0 exits). r107
also 7/10 exit. Two stuck seeds with different causes and one no-arrival seed
is not yet a mechanism — but if the same cause recurs, it is.
**Pre-registered metric (binding):**
- M-FLESH: per-seed arrival/test/exit/stuck-cause. If ≥3 r109 seeds share one
  stuck cause (rot / poison / no-arrival-with-kills), that cause is a named
  channel defect to dig into (read the seed's meat ledger). If stuck seeds are
  ≤2 with mixed causes, the friction stays documented noise. Pooled
  r107+r108+r109 exit rate reported for the record; no bar on the pooled rate
  this run (the question is the cause, not the rate).
- A miss is NO-GO, never re-scored.

## Q3 (CARRIED) — ENGAGEMENT REGRESSION LINES (M-PR1 / M-PR2)
r108 closed M-PR1-pooled (14/60 = 23.3% < 25%) and M-PR2 (90% promised).
Carried as regression lines, not re-adjudication:
- M-PR1-r109: never-offered sittings / r109 sittings <25% = line holds.
- M-PR1-per-seed: never-offered ≤1 sitting on ≥8/10 seeds = line holds.
- M-PR2: of sittings where dlg:commit was PICKED, fraction resolving
  'promised' ≥80% with all 'stated' refusals explained by an honest-by-design
  guard = line holds.

## Q4 (CARRIED) — R104-GOAROUND AT PANEL SCALE (M7)
r108: GOAROUND-HOLDS (3/3 kcal skips). Carried as a regression check.
**Pre-registered metric (binding):** M7-r109 kcal: arrived / kcal-skips ≥80% =
GOAROUND-HOLDS; <80% = GOAROUND-WEAK (name the failing seeds/days and the rung
that stopped). Rung fires reported as counts with seed/day.

## Q5 (CARRIED) — DOORSTEP-OUTINGLIVE REGRESSION (M6)
r108: DOORSTEP-GO (281 checks, 3 triggered, ate 3). Carried as a regression
check: M6 clauses hold (complete eatRecs on triggered steps; 0 class-E scholar
starvation deaths; 0 triggered steps ending enterResult===false). Includes the
R105-DOORSTEP-DRINK-ENTRY fix.

## Q6 (CARRIED) — WATER CLAUSE, STILL UNTESTED
0 wild water skips since r87 (now twenty runs deep). Record wild outing
iterations + min hydration; if 0 wild water skips again, stays UNTESTED. Not a
re-proof — a standing blind spot, reported, not chased by changing the panel.

## Carried bindings (r108 verdicts, re-judged fresh)
- **M1 ALIVE-D14: 10/10** (no village lost by day 14).
- **M2 SYSTEM CONTACT: 10/10** (first contact ~day 8).
- **M3 FIGHT-LOG:** all hunt fights complete, 0 unknown/mixed trigger.
- **M5 PEOPLE:** wind-down picks, WD probe gates, betrayal held-offers 0, party
  invites spoken/dry; two full transcripts read for sense (SENSE-TESTING LAW).
- **M-R70 (closed r107):** consistency check only — live-promise dawn opps
  with waiting=false should stay explained (has-run / kept / dead promiser),
  0 genuine defects expected.

## Watch items (not verdicts)
- **R73 NARROW-PATTERN:** r108 promised=13, all NARROW, keptInsideNarrow=4
  (r107: 15/15 NARROW). Design input, carried.
- **R66 HUNGRY horizon pantry:** r108 7/10 seeds end hungry (r107: 9/10).
  Starvation deaths 0 on r108. The landing pantry is a slow leak everywhere, a
  collapse on one seed in ten.
- **Mantle latency (owed item, r107 seed 1009):** a 2-day gap between scholar
  death and mantle pass (Wanjiru d24 → Felicia d26). r108 saw latency 1 only.
  Watch whether any r109 mantle pass exceeds 1 day.
- **Scholar-eats-first (held design question for Steve, not changed):** the
  scholar's villageMeal is drawn BEFORE villagers eat in endDay, so in a famine
  the player eats while villagers starve. Document only.
- **M-A2 design question (for Steve, not re-measured):** the win-plan arms'
  gear/bond/muster/standing stages are proved structurally unreachable before
  day 28 (r106 M-A2, re-confirmed r107/r108). Re-proving the staging adds
  nothing (DELIVER OVER MEASURE).

## Seeds, pilot, shape
- Panel: fresh seeds 1023–1032, DAYS=28, OUTDIR landing-r109 (goal hidden_files
  evidence/2026-11-05/landing-r109 — date folder as prepared by r108; the run
  note itself is filed under evidence/2026-11-06/).
- PILOT FIRST: 3 seeds (1023–1025) before expanding. The pilot validates (a)
  the seed band (driver runs seeds 1023+), (b) the commit-offer transcript
  method reproduces on the pilot transcripts, (c) Q1/Q2 show a live signal
  (ask_favor sittings exist; flesh arrivals populate). If the pilot shows 0
  ask_favor sittings AND 0 flesh arrivals, document and still run the panel
  only if the carried bindings need the panel — the pilot decides; do not burn
  a full run on a dead question.
- Shape: pilot validates the R108 commit-offer analyzer populates (no nulls on
  live fields) and the waitDiag live/ledger split reports.

## Metric review (filled at closeout, never mid-run)
- (to be filled)
