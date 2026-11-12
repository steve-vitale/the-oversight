# Journey leg ESTABLISHMENT — r134 pre-registration (2026-11-12, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84–r118/r128/r131/r132/
r133 precedent). Death-aware: stop after 10 consecutive all-dead daily checks;
never tick a dead village to fill the leg.

## Run
Run id `playtest-loop-a-20261112T1645Z` (scheduled Thu 2026-11-12 10:45 CST).
Rotation read `1` (establishment); write `1→2` at closeout.
**Base:** local master `ea1ef5a75` (sim-cut7confirm-b landed; r128 landing
`87f00547d` verified in master).
Pre-flight deviations (LOUD):
- **Stale-lock recovery.** Lock held by run `2026-11-12T13:31:22Z` (landing
  r128, created 13:31:22Z) — 3h12m old, NO registry entry for that run_id,
  no heartbeat. Per the overlap guard the previous run is DEAD no matter
  how fresh the lock looked. Lock deleted, proceeded. The r128 run itself
  COMPLETED and LANDED (commit `87f00547d` in master, worktree released,
  rotation-a already `1`); its lock file survived its own closeout — the
  anomaly is recorded here, not repaired beyond the recovery. Nothing held
  to adopt: no `journey-landing` worktree or branch remains on disk.
- Main tree clean; disk 39%. Flap-watch ALL-OK at run start (16:45–16:49Z).
  Registration took ~204s (slow host; internal reap) — no flap observed.
  Heartbeat loop runs from the goal hidden_files dir (not /tmp, r128 lesson),
  10-min cadence, PID 30898 at run start.

## Leg questions (named by r133's metric review — both of them)

**Q1 (primary — LADDER STALL DIAGNOSIS).** r133: specialist-ladder moves
per window 34 (d1–14), 24 (d14–28), 4 (d28–dEnd) on the AFTER panel, and
the BEFORE panel shows the same shape (5 moves d28–dEnd) — the unit cap
does not cause it. The question r133 left open: **why does specialist
learning stop after the second fortnight — pantry satiety, assignment
saturation, or the rung math?** This run DIAGNOSES it from the r133 panel
data (no new sims for Q1 — the panel is the instrument; the numbers
already exist). Q1 delivers the diagnosis + the next dial. **No game-code
fix from Q1 in this run** (pre-registered): if the diagnosis names a lever,
it is proposed in metric review for the next run, not landed silently here.

**Q2 (people-check dial — CANNED GUARD LINES).** r133: "Something in them
almost softens — then doesn't. Not yet." 11× and "They hear the warmth in
it." 11×, both rising, firing as generic go-on responses — e.g. after a
gossip line about Joyce humming at the beans, where nothing soft was
happening. Mechanism (read from code, `src/js/convo-mood.js`
`convoMoodShift` guard branch): when a villager's recent lived memory
(last 5 days) holds a hurt, the FIRST warming move (+mood consequence)
per conversation is absorbed — mood does not move — and one of a 2-line
pool is queued as a held beat, flushed after the turn's line. The pool
has 2 lines and `convoPickCycle` alternates them, so the same lines recur
verbatim across villagers and sittings. The defect, in plain words: a
small agree (warming by the numbers) gets the same heavy "almost
softens" line as a real comfort — the beat claims an emotional near-miss
the scene didn't earn, and the 2-line pool makes it read canned.
Fix shape (this run): rewrite the guard pool into 6 observational lines
that describe the villager holding the moment at arm's length instead of
claiming softening/warmth the exchange didn't contain. Same trigger, same
once-per-conversation, same absorbed move — only the spoken lines change.
Feel/copy change → `[needs-eyes]` in the commit message.

## Q1 diagnosis (binding, §14 — no mid-run re-scoring)
Instrument: the r133 AFTER panel JSONs (16 seeds, 2501–2516, already
committed in `evidence/2026-11-12/journey-establishment-r133-after-seed*.json`).
Per specialty s in {butcher, cook, preserver, builder} and window w in
{d1–14, d14–28, d28–dEnd}, from practice snapshots (foodXp/spec deltas),
cookLog/mendLog/huntLog (granting resolutions where the log carries them),
and daily rows (pantry):
- G[s][w] = panel total foodXp[s] gained in the window.
- W[s][w] = distinct villagers with G>0 in the window.
- NEW[s][w] = villagers crossing spec 0→positive in the window.
- RES[s][w] = granting resolutions in the window (log rows with an fx
  delta > 0 for s; reported as unavailable per specialty if the log does
  not carry it — the snap-derived G/W/NEW are the primary instrument).
- Pantry median at window start (d1/d14/d28 daily rows).
- NEAR-MISS pool: villagers at 1–4 foodXp[s] at d28 who never cross 5 by
  dEnd, per specialty.
Verdict rules (the mechanism whose bars hold is named; bars are checked
in this order, several may hold — report the combination):
- **SATIETY** iff RES[preserver][w3] ≤ 0.25 × RES[preserver][w1] AND
  RES[cook][w3] ≤ 0.25 × RES[cook][w1] AND median pantry at d28 ≥ 60,000
  kcal. (Work stops because the village is fed.)
- **SATURATION** iff W[w3] ≤ 0.5 × W[w1] for ≥3 of 4 specialties AND
  ≥80% of w3 workers already held spec>0 at d28. (Same old hands; no
  new blood gets the work.)
- **RUNG-MATH** iff neither SATIETY nor SATURATION holds (work continues:
  RES[w3] > 0.5 × RES[w1] for ≥3 specialties) AND NEW[w3] ≤ 0.25 ×
  NEW[w1] panel-wide. (The un-moved pool is exhausted or XP per worker
  too thin to cross 5 — the 2:1 dilution above 5 XP and the 30-XP rung 3
  make late-window crossings rare.)
- **UNRESOLVED** iff no rule's bars hold: the diagnosis failed; report
  the numbers, propose the next probe, do not force a mechanism.
Before/after note: the stall shape is already established on BEFORE by
r133 (5 moves d28–dEnd); the diagnostic runs on AFTER and spot-checks
that BEFORE's window shape matches (moves per window from the r133
BEFORE JSONs via the same analyzer).

## Q2 bars (binding, §14 — no mid-run re-scoring)
BEFORE corpus: the 16 r133-after convo transcripts
(`evidence/2026-11-12/journey-establishment-r133-after-convo-seed*.txt` —
same driver, same seeds, same code except the Q2 fix; the r133 preserver
cap is in both, so the only delta is the guard pool).
AFTER: r134 driver (r133 driver clone — tag rename only) on the SAME
16 seeds 2501–2516, 42d, competent + withDelegate + HUNTSTAFF=2, on the
fixed tree.
- Q2a GUARD COUNT: guard-line occurrences per convo on AFTER within
  ±25% of BEFORE (mechanic unchanged — the guard still absorbs the first
  warming move). A large drop means the fix broke the mechanic; a large
  rise means it fires more.
- Q2b BREADTH: distinct guard lines used on AFTER ≥ 4 (pool of 6;
  BEFORE used 2).
- Q2c HONESTY (sense-read, not counted): I read all AFTER transcripts
  in full; zero guard lines claiming softening/warmth the scene didn't
  contain — judged by reading, worst instance quoted if any survives.
  The proof test also prints the lines and I read them (§4).
- Q2d GUARDS CARRIED (r133 Q2/Q3 + M3/M4): invitations answered ≥80%
  (r133: 96%); null lines = 0 (r133: 0); M3 survival-42 ≥12/16; M4
  0 starvation deaths ≥12/16.
- Q2e SPOTTER GUARD: foodXp['spotter'] total = 0 on the AFTER panel
  (r133 Q1e carried).

## Seeds, policy, horizon
Q1: no new seeds — r133 AFTER panel (2501–2516), BEFORE spot-check from
the r133 BEFORE JSONs.
Q2: **band 2501–2516, DELIBERATE MATCHED REUSE** (see freshness below):
same seeds as r133's corpus — the §15 before/after comparison requires
identical seeds. Policy: competent + withDelegate + HUNTSTAFF=2.
Horizon 42d.
Driver: `scripts/journey-establishment-r134-20261112.js` (r133 driver
clone — tag rename only).
Analyzer: `scripts/analyze-journey-establishment-r134-20261112.py`
(r133 analyzer clone + Q1 stall diagnostic + Q2 guard-line counter).
Proof test: `scripts/test-journey-establishment-r134-moodguard.js`
(guard still absorbs the first warming move — mood unchanged, beat
queued; second warming move lands; pool has ≥6 distinct lines; the two
old lines are gone from the guard pool; ≥3 seeds).

## Seed-band freshness (skill: local_seed_band_freshness)
- **Band 2501–2516 is NOT fresh — it is a deliberate matched reuse.**
  It is named in `evidence/2026-11-12/journey-establishment-r133-prereg.md`
  (the r133 panel band). Per the skill a named band counts as used; the
  reuse is the §15 matched-pair design: Q2's before/after comparison is
  only valid on identical seeds, and the r133-after corpus IS the BEFORE.
  No new question in this run assigns a fresh band — Q1 uses existing
  data, Q2 reuses r133's band for the matched pair. A future run asking a
  NEW question on this leg must pick a fresh band (next unused: 2601+,
  to be verified against all dated preregs at that time).
- Contaminated bands NOT reused for new questions (r133 list carried):
  1502, 1504, 1603, 1604, 17101–17112, 1142–1151, 1801–1804, 1901–1916,
  2001–2010, 2101–2116, 2201–2216, 2301–2316, 2401–2416, 100001–100008,
  1200–1209, 2501–2516 (matched reuse only, this run).

## Canon
docs/CANON.md + docs/PRESERVATION.md + docs/CONVERSATIONS.md read at run
start. PRESERVATION.md covers the smoking ladder — Q1 touches only the
PRACTICE CREDIT a resolution awards, not yields, shelf, or time (and Q1
changes no code at all). CONVERSATIONS.md: "A genuine queued beat can
offer 'Go on'; an exhausted topic offers a pivot or exit, rather than
filler choices" — the guard beat is a queued beat, so it must read as a
real reaction to what was said, not filler. The guard mechanic itself
(recent hurt absorbs the first warming move) is characterization, not
canon — no canon doc covers it; Q2 rests on code + transcripts, not
invented canon. docs/DIRECTIVES.md re-read (hard rule). No gate/price/
threshold change. Gating freeze (2026-10-27) stands. Perception law
(2026-10-28) stands — all instruments read-only; pickers press offered
menu items only.

## People check
Read the AFTER convos from the Q2 panel in full (same method as
r114–r118/r127/r128/r131/r132/r133). Standing watch (r133 items):
"taken-kin pod-dream closing" (5×, resolves with an owed promise —
template doing heavy lifting, watch); "Take it for what it's worth."
gossip closer (4×); deflect pivot "Sorry — I shouldn't load that on
you. What's up?" (3×); field-teaching closer variants; accept-then-
back-out (r133: 0× — confirm it stays gone); stitched fragments (r133:
0× — confirm). Note whether they recur. The spotter blank stands from
r131/r133 (a villager can stare at the wild all day and learn nothing).

## Gating freeze (2026-10-27 16:53) stands
No threshold, bar, price, or gate change in this run. The Q2 fix changes
spoken lines only — no numbers move.

## Pilot gate
Q2, 4 seeds first (2501–2504), fixed tree, 42d. The pilot validates (a)
the driver runs and convo files are written; (b) guard lines fire ≥1
per seed on average on the pilot (the question is live — if 0, the
question is UNTESTED on this band: report, do not burn a full panel);
(c) no trajectory breakage vs BEFORE on matched seeds (deaths/pantry
within a few). On pilot GO, run seeds 2505–2516 the same way.
Q1 has no pilot — it reads committed data; if a log field the
diagnostic needs is missing from the JSONs, the diagnostic reports
that field as unavailable and leans on the snap-derived measures.

## Telemetry
The live baseline is the r132 BEFORE panel (competent + withDelegate +
HUNTSTAFF=2, seeds 2401–2416), rolled forward at r132 closeout; r133
did NOT roll forward. This run's Q2 panel is the SAME regime on the
matched band 2501–2516 — guardrails should stay quiet; any LOUD line
is adjudicated as band noise vs real bug BEFORE rolling the baseline
forward. Run the telemetry check at closeout.

## Measurement-proof refresh (owed)
Still owed since r129. `scripts/balance-proof-update.js` takes a
retained real observer-neutral panel as its argument — it validates and
installs one, it does not generate one — and no fresh retained panel
exists yet. This run lands src/js (convo-mood.js lines only) — attempt
the refresh at closeout if a retained panel exists; if none exists,
report it as still owed with the reason, do not silently deepen the
debt, and do not run a competing panel in this lane.

## Amendment 1 (pilot, before the scored panel — not a re-score: no Q2
verdict numbers exist yet)
The pilot (4 seeds, 2501–2504, fixed tree) shows the r133-after corpus
is NOT a clean BEFORE for Q2: trajectories diverged on 2/4 pilot seeds
vs r133-after (seed 2502: alive 10 vs 11, pantry 77k vs 64k; seed 2504:
alive 9 vs 10, pantry 130k vs 106k; seeds 2501/2503 identical). Master
moved between r133's panel (base a0039d484) and this run (ea1ef5a75), so
the divergence is confounded with the fix — it cannot be attributed to
the guard-pool change from this comparison. The binding Q2 comparison
is therefore re-pointed: a fresh BEFORE panel (`r134-before`, 16 seeds,
r134 driver, fix OFF, current master) is generated in this run, and the
analyzer's BEFORE tag becomes `r134-before`. The r133-after transcripts
remain the historical corpus (quoted in the run note for continuity).
Q1's diagnostic is UNAFFECTED: it reads the committed r133-after JSONs
(the stall was measured there) and its verdict already stands (RUNG-MATH,
see the run note). Pilot gate: (a) driver runs, convos written ✓;
(b) guard lines fire on the pilot (AFTER 4 lines / 4 seeds = 1.0/seed,
BEFORE 7/4 = 1.75/seed — the question is live; the rate gap is the
confound this amendment removes, not a verdict); (c) seed 2501: endDay/alive/practice identical vs r133-after, but pantry
differs by 1.2k (94701 vs 95909) — a small downstream divergence the
matched pair will adjudicate (master movement vs the pool change). The pilot AFTER files (2501–2504) stand — the driver is
deterministic, so only seeds 2505–2516 are run for AFTER after the
BEFORE panel. No stash is used for the fix-off run (shared-repo stash
collision lesson): the fixed file is copied aside, HEAD's version is
restored, the panel runs, the fixed file is copied back and verified.


## Metric review (filled at closeout, never mid-run)
- Q1 verdict RUNG-MATH: work continues at ~83% rate (RES w3/w1 =
  322/386) while first crossings collapse (NEW 4/34). The 0→positive
  metric saturates by design once regular workers hold rung 1; rung 2
  needs ~25 granting days, rung 3 ~55 — beyond a 42-day leg. Next
  establishment question should measure rung-2/3 crossings per window
  and XP per worker, not just first crossings; whether rung 2 belongs
  inside 42 days is a Steve design question. Full diagnosis in the
  run note.
- Q2 verdict GO: guard count ratio exactly 1.00, 6 distinct lines all
  used, zero old lines, zero regressions, invitations 23/24. The pool
  works. Watch whether 6 lines stay fresh over more panels; deflect
  pivot (6×, rising) and "another fire" closer (12×) are the next
  conversation-flow candidates.
- Pilot lesson: r133-after was not a clean BEFORE (master moved);
  re-baselining in-run with a matched fix-off panel (Amendment 1)
  should be the default whenever a run's BEFORE corpus predates a
  master move.
