# journey-landing r107 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon to d28)

**Run id:** laneA-20261105T1945Z (scheduled 13:45 CST 2026-11-05).
Rotation read 0 → leg 0 LANDING; wrote 0→1 at run start (20:07:33Z), verified by
read-back (`cat` shows 1). **Rotation-write discrepancy (4th sighting):** r106's
note claimed 0→1 was written, but the file still read 0 at this run's start
(mtime 18:42:48Z — scale r100's 3→0 closeout write). The write fails silently
and intermittently (deepening r103/r104/r105 documented the same for 2→3; r105's
write DID stick, r106's did not). This run's write is verified immediately
above and will be re-verified at closeout.
**Base:** master@bb703eb19 at run start (`git pull` already up to date; main tree
clean; disk 30%). **Seed band 1003–1012 (fresh — see below).**
**Master advanced during registration:** Loop A sim-enddaybeats-a landed 4 commits
(ce65b233e prereg, d0da37085 instrument+proof, 739fc057f evidence, 5d8715e80 corpus;
HEAD now 5d8715e80, evidence/scripts only, zero src/js). The journey-landing branch
already exists at bb703eb19, so the worktree bases there; per the body, the branch
is REBASED onto the new master at closeout (zero file overlap expected — my files
are landing-r107 prereg/note/analyzer + the driver seed line; theirs are
sim-enddaybeats-a), proof tests re-run, then merged.
**Registration:** attempt 1 hit the 180s timeout (loaded box; Lane B
journey2-crisis registering concurrently, its `git worktree add` in D state);
retry waits for the sibling add to clear, then registers with a 600s timeout.
**Numbering note:** the Lane A counter is global across legs; r106 (landing) was
last, so this run is r107.
Driver: scripts/journey-landing-r107-20261105.js (r106 verbatim + SEEDS default
corrected 897–906 → 1003–1012 in the worktree — the ONLY driver change;
diff-verified at run start; run with SEEDS env as well). Analyzer:
scripts/analyze-landing-r104-20261105.js (unchanged, + R106 class-F fix carried).
Fights: scripts/analyze-fights89-20261102.js (unchanged, dir-as-argv).
Shape tests: scripts/test-landing-r94-shape.js + scripts/test-landing-r104-rescue-goaround.js
+ scripts/test-landing-r106-starvation-class-f.js (re-run as regression).
Transcript method: scripts/analyze-landing-r107-commit-offer.js (new, small:
parses the panel's saved transcripts for ask_favor sittings — commit offered?
picked? resolution? — method proven on the r106 corpus pre-panel, see Q1b basis).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, or gate
change in this run. **Perception law (2026-10-28) stands** — all instruments
read-only; pickers press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** a code change lands ONLY if a defect is
proven in game code (not driver policy) with a before/after proof test; otherwise
document and move on. This run carries NO planned code change — the questions are
adjudications; a fix follows only if M-R70 / M-PR proves a game-code defect.

## Seed-band freshness (skill: local_seed_band_freshness)
- r106's prepared band **897–906 is CONTAMINATED**: seeds 901–907 were used
  2026-10-13 by journey-succession corpora
  (evidence/2026-10-13/journey-succession-seed901.json … seed907.json). 897–900
  appear free, but the band as a whole is not fresh; per the skill a different
  band was picked. The collision is recorded here so the next worker does not
  repeat it — and the r107 driver's SEEDS default is corrected in the worktree.
- **Chosen band 1003–1012**, verified fresh: (1) filename map — `find evidence
  -name "*s[0-9]*"` → 6,327 distinct seed numbers; free run 1003–1100 (next used
  seed after 1002 is 1101); (2) prereg naming grep — no hits for 1003–1012 in any
  `evidence/*/*-prereg.md` (word-boundary, 5-digit extensions excluded), no
  SEEDS=/`"seed":` mentions in 2026-10/2026-11 .md files.
- Fallback checked and REJECTED: 1304–1313 contaminated —
  journey-establishment-r99-prereg.md names seeds 1301–1304 ("Seeds (fresh,
  unused band): 1301, 1302, 1303, 1304") and a seed1304 corpus exists.
  Other bands spot-checked and rejected: 917–926 (Oct 16 witnesslearn/patrolwave
  corpora s917–s925), 1001–1010 (Oct 16 trickmatter s1001/s1002), 1101–1110,
  1201–1210, 2001–2010, 3001–3010 (all with prior corpora).

## Q1 (PRIMARY) — R70 NEVER-WAITED, ADJUDICATED BY LIVE-PROMISE STATUS
**Why this run, why now:** r106 named R70 a carried friction (6/10 seeds never
waited at dawn; dominant reasons the door-side mismatch). Re-analysis of the
r106 corpus BEFORE this panel (analyzer re-run on landing-r106; transcript
parse) overturns the naming: the never-waited opps are dominated by
waitDiag=promise-favorId on STALE ledger rows (live={} on 4 of the 6 seeds) —
favors asked but never promised (R73: promised=13, askedOnly=19). The door-side
action reasons are the action check's reply on rows with no live promise, not
evidence of a door block on a live promise. On the 2 seeds with live opps,
waiting=false is explained by has-run (run already live), kept (already kept),
or node-not-home. The door-side dawn block as named is therefore a MEASUREMENT
ARTIFACT unless the fresh panel shows live-promise dawn failures.
**Pre-registered metric (binding):**
- M-R70: per-seed dawn opps with livePromise=true and waiting=false, by
  waitDiag. If >=3 seeds show a live promised favor at dawn with waiting=false
  and waitDiag in {node-not-home, before-meet, past-due, unexplained, dayPart},
  that is a LIVE DAWN-WAIT DEFECT — name the dominant waitDiag and dig into
  the mechanism. If 0–2 seeds show that and the never-waited seeds are again
  explained by never-promised asks / has-run / kept, then R70-as-named
  (door-side dawn block) is CLOSED as a stale-ledger artifact and the live
  question moves to Q1b.
- A miss on M-R70 is NO-GO, never re-scored against a friendlier metric mid-run
  (metric review below if the metric proves wrong).

## Q1b (PRIMARY) — THE PROMISE BOTTLENECK: WHY DO 19/32 ASKS NEVER BECOME PROMISES?
**Basis (r106 transcript re-analysis, 27 ask_favor sittings, method proven
pre-panel):** commit offered 20/27, promised 18/27; 7 never offered (want never
engaged — resolutions unresolved/unestablished; the driver never picked the
want-engagement option [alive:want:ask_favor] in those sittings); 2
offered-but-stated — commit PICKED but refused by the R72 away guard
(transcript line: "Wait — I'm out on the road. I can't ask you to meet me at
dawn when I'm miles away. Find me when I'm back, and we'll set it then."),
honest by design. Code-read (convo-wants.js:1603 convoFavorCommit;
convo-dialogue.js:503 dlg:commit): commit creates the obligation ONLY if the
villager is present (away guard), the action is supported, the favor is open,
and no unkept promise to that villager already exists (one open commitment per
villager, keyed by vid).
**Pre-registered metrics (binding), from the panel's transcripts + census via
scripts/analyze-landing-r107-commit-offer.js:**
- M-PR1 (engagement): of ask_favor sittings, the fraction where dlg:commit was
  never offered. If >=25% never offer commit, the engagement bottleneck is
  confirmed at panel scale (r106: 7/27 = 26%). Adjudicate by reading which menu
  options were available vs picked in a sample of never-offered sittings
  (driver never engages the want vs game never surfaces engagement).
- M-PR2 (refusal): of sittings where dlg:commit was PICKED, the fraction
  resolving 'promised'. Name every 'stated' refusal with its spoken line (away
  guard / open-commitment / unsupported). If all 'stated' refusals are away-guard
  (honest by design), the commit path is working as designed and the
  promise-rate limit is engagement + away villagers, not a commit defect.
- A miss on any M-PR metric is NO-GO, never re-scored.

## Q2 (CARRIED) — R104-GOAROUND AT PANEL SCALE (M7 REVISED)
r106 proved rung fires at panel scale (4 arrivals / 4 skips = 100%; R86 CLEAR
fired). Carried as a regression check.
**Pre-registered metrics (binding):**
- M7-r107 kcal: arrived / kcal-skips >= 80% = GOAROUND-HOLDS; < 80% =
  GOAROUND-WEAK (name the failing seeds/days and the rung that stopped).
- Rung fires (bridge / detour / no-onboard-path) reported as counts with seed/day.

## Q3 (CARRIED) — DOORSTEP-OUTINGLIVE REGRESSION
r106 carried it GO (282 checks, 1 triggered, ate 1, 0 class-E scholar
starvation deaths). Carried as a regression check: M6 clauses hold (complete
eatRecs on triggered steps; 0 class-E scholar starvation deaths; 0 triggered
steps ending enterResult===false). Includes the R105-DOORSTEP-DRINK-ENTRY fix.

## Q4 (CARRIED) — WATER CLAUSE, STILL UNTESTED
0 wild water skips since r87 (now eighteen runs deep). Record wild outing
iterations + min hydration; if 0 wild water skips again, stays UNTESTED. Not a
re-proof — a standing blind spot, reported, not chased by changing the panel.

## Carried bindings (r106 verdicts, re-judged fresh)
- **M1 ALIVE-D14: 10/10** (no village lost by day 14).
- **M2 SYSTEM CONTACT: 10/10** (first contact ~day 8).
- **M3 FIGHT-LOG:** all hunt fights complete, 0 unknown/mixed trigger.
- **M5 PEOPLE:** wind-down picks, WD probe gates, betrayal held-offers 0, party
  invites spoken/dry; two full transcripts read for sense (SENSE-TESTING LAW).

## Watch items (not verdicts)
- **R69 ARMOR tele/line disagree:** r106 teleOk counts vs narration lines
  disagree on 7 seeds. Investigate before trusting either — if time permits,
  adjudicate one seed; otherwise carried.
- **R73 NARROW-PATTERN:** promised favors mostly break on 1-day windows (r106:
  13 promised, all 13 NARROW, 7 kept inside narrow). Design input, carried.
- **R66 HUNGRY horizon pantry:** 7/10 seeds end hungry in r106; the landing
  pantry is a slow leak everywhere, a collapse on one seed in ten.
- **Scholar-eats-first (held design question for Steve, not changed):** the
  scholar's villageMeal is drawn BEFORE villagers eat in endDay, so in a famine
  the player eats while villagers starve. Whether the player should eat in
  roster order is a design call with balance consequences; this run documents
  only.
- **Pantry-measure discrepancy (unadjudicated):** r106 d23 death-day pantry reads
  1,800 (autopsy live sum) vs 1,000 (series pantryKcal) — two measures of the
  same pantry disagree by 800 kcal.
- **M-A2 design question (for Steve, not re-measured):** the win-plan arms'
  gear/bond/muster/standing stages are proved structurally unreachable before
  day 28 (r106 M-A2). Should the stages be reachable earlier? A design
  question — re-proving the staging adds nothing (DELIVER OVER MEASURE).
- **Steve's XP/ABILITIES+GEAR direction (2026-11-05 07:09 CST):** the queued build
  (XP coverage + synergy bonus + gear protection retune) is still in its
  worktree (build-xp-gear, active, not landed on master). r107 runs on the same
  base as r106 (bb703eb19); no verdict in this run changes; no work in this run
  touches that build.

## Seeds, pilot, shape
- Panel: fresh seeds 1003–1012, DAYS=28, OUTDIR landing-r107 (goal hidden_files
  evidence/2026-11-05/landing-r107).
- PILOT FIRST: 3 seeds (1003–1005) before expanding. The pilot validates (a)
  the seed-band correction (driver runs seeds 1003+), (b) the commit-offer
  transcript method reproduces on the pilot transcripts, (c) Q1/Q1b show a
  live-promise dawn question or an engagement/refusal signal. If the pilot shows
  0 live-promise dawn opps AND 0 ask_favor sittings, document and still run the
  panel only if the carried bindings need the panel — the pilot decides; do not
  burn a full run on a dead question.
- Shape: pilot validates the R107 commit-offer analyzer populates (no nulls on
  live fields) and the waitDiag live/ledger split reports.

## Metric review (filled at closeout, never mid-run)
- (to be filled)
