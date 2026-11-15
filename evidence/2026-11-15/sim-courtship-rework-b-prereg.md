# sim-courtship-rework-b — PREREG (rework of the courtship-deeds lever)

Run: fleshout-loop-b-20261115T1810Z (Loop B), arm sim-courtship-rework-b
Axis: winnability chain. Rework arm — the courtship-deeds lever that
PILOT NO-GO'd in the 1630Z run (evidence/2026-11-15/sim-courtship-b.md).
Branch: sim-courtship-rework-b — worktree ~/workspace/worktrees/sim-courtship-rework-b
Base: master at worktree creation (tip f8f6265b9 — the 1630Z coordinator
evidence commit, which landed the courtship-b instrument + evidence)
Date: 2026-11-15
Findings backlog: claims "2026-11-15 — winnability chain — THE
PILGRIMAGE STALLS ON FAR VILLAGES" (sim-findings.md, [open]; marked
[claimed] by this arm; [fixed] only if this arm lands a working lever —
a pilot GO that confirms). The covenant-road item ("THE COVENANT ROAD
IS GATED BY OPINION", [claimed] by sim-courtship-b) stays [claimed] —
this arm does not re-claim it.

## Canon note (read first)

docs/CANON.md was read, then docs/SCALE.md and the opinion machinery
itself (src/js/hierarchy.js `_nudgeOpinion`, `_proposePeer`,
`_courtshipNextStep`, `studyVillageCodex` wrap, `answerAccord`;
src/js/villageAgency.js `aidVillage`; src/js/membership.js
`proposeAlliance` / `guestMeal`; src/js/game.js
`studyVillageCodex`, `travelTo`, `travelTargets`, `travelBlockage`;
src/js/villageAgency.js `_vaMakeSplinterVillage`) — as already
grounded in evidence/2026-11-15/sim-onlylead-b-prereg.md,
sim-onlylead2-b-prereg.md, and sim-courtship-b-prereg.md, which this
prereg inherits. Nothing below is invented. The covenant shape, in
one line: Haven holds ≥3 SEASONED covenant peer links (kind
'covenant', no primary/subordinate; seasoned = 30+ days old AND trust
40+), the rung (regional a full season: networkLiveDay + 30) has
passed, and no higher-priority shape's beat is pending/live — then
"The Founding Council" stages (pact/pool/walk). Peer proposals need
opinion 10+ first (the engine refuses below the bar before judging,
honestly, with no −5). The travel canon (docs/CANON.md via game.js):
blockages offer multiple ways through — cut, clear, bridge, swim, or
go around, never one mandatory path — and travelTo's intermediate
scan refuses a jump whose shortest path crosses a blocked tile.

## The diagnosis (step 1 — DONE, from the committed corpora + live probes)

Read first, in full: evidence/2026-11-15/sim-courtship-b.md and
sim-courtship-b-prereg.md. The 1630Z pilot: G2 GO (covenant staged
3/8, all 'pact', all sat; opinion 10 by median day 6 vs 57 baseline)
and cost bar FAIL (starvation 5 vs 0). Two diagnosis questions were
left open; both are now answered from the committed corpora
(perseed-courtship-b-control/ + -on/) and four live probe scripts
(scripts/probe-pilgrim-b.js, probe-pilgrim2-b.js, probe-pilgrim3-b.js,
probe-pilgrim4-b.js — diagnostic only, no corpora written).

### (a) The 5 starvation deaths — lever-spend vs trajectory/absence

Per-seed, from the deaths lists + pantry series:

| seed | starvation day(s) | aid paid (day) | pantry on death day | scholar absence before death |
|------|-------------------|----------------|---------------------|------------------------------|
| 100604 | d12 (1) | 2,000 kcal (d4) | 10,100 kcal | pilgrimage d5–7 (study done d7); home d8+ |
| 100606 | d38, d83 (2) | 2,000 (d4) + 2,000 (d51) | 2,000 / 270 kcal | 6 pilgrim-days total |
| 100607 | d84 (1) | 4,000 (d41 ×2) | 0 kcal (village dies d86) | 31 pilgrim-days total |
| 100608 | d118 (1) | 2,000 (d12) + 2,000 (d87) | 0 kcal (pop 3, collapse) | 17 pilgrim-days total |

Findings:
- Every death sits 8–43 days after the last aid (100604: 8 days;
  the other four: 30+ days). Four of the five sit in endgame
  pantry-collapse troughs (pantry 0–2,000 kcal, village dying
  within days); the fifth (100604 d12) sits on a pantry holding
  10,100 kcal — an individual hunger death while the pantry was
  stocked, which no 2,000-kcal gift eight days earlier can explain.
- NO dose-response in either direction: the three seeds that paid
  the full 6,000 kcal (100601, 100602, 100605) starved 0; the
  deaths sit on seeds that paid 2,000–4,000. Absence does not
  dose-respond either (100606: 6 pilgrim-days, 2 deaths; 100604:
  156 pilgrim-days, 1 death).
- The legs diverge by trajectory, not by spend: on 100607 the
  control pantry sat at 115,555 kcal on day 41 while the armed leg
  sat at 19,156 — a ~96,000 kcal gap no 4,000-kcal gift can make.
  The policy changes the scholar's days, the days change the fights
  and raids, and the trajectories diverge from there.
- CONCLUSION: the starvation is trajectory divergence (different
  RNG draws after the policy changes what the scholar does each
  day), not lever spend. NO aid-price tuning is made in this rework
  — the aid stays 2,000 kcal, pantry gate 12,000, max 6,000/run.
  The stall fix IS the cost fix, and this prereg says so
  explicitly: it removes up to 156 days of scholar absence — the
  largest trajectory distortion the lever introduces — so the
  re-pilot's cost bar is judged on a lever that no longer strands
  the scholar for seasons. If the cost bar fails again with the
  stall fixed, the failure is evidence against the lever itself,
  not against an unmeasured confound.

### (b) WHY the scholar never arrives in 14 days — ESTABLISHED

Not too far, not blocked travel in general, not fights. The probes
(seed 100604, courtship leg, 200d) establish it day by day:
- The scholar NEVER MOVES on 196 pilgrim-days (probe-pilgrim-b:
  position (4,4) every day, distance stuck at 3, tbfight false
  every day, 14 pilgrimages, 183 pilgrim-days, 0 studies on the
  current tip).
- The cause is one rubble tile at (4,6) plus a greedy walk
  (probe-pilgrim4-b, pre-walk reads): walkTo picks the
  minimum-distance offered target — a 2–3 tile jump straight at
  the village — and travelTo refuses it because the intermediate
  tile (4,6) carries rubble. 146/196 pilgrim-days are
  inter-blocked rubble@(4,6); 50/196 are dest-blocked rubble@(4,6)
  (the best target IS the rubble tile itself). A passing detour
  ((5,4) → (5,5) → (5,6)) exists on every day. walkTo breaks on
  the first refused hop instead of trying the next-best target,
  so the scholar retries the identical refused jump for 14 days,
  goes stale, restarts on the same nearest village, and repeats.
- Distance was never the cause: the villages sit 3 tiles from
  Haven (genVillages places them on the 9x9 board, Manhattan 3–8
  from Haven), and a working walk covers that in 1–2 days. The
  direct-call probe (probe-pilgrim3-b) confirms travelTo itself
  moves fine (hop (4,4)→(4,5) succeeds) and that a village in
  study range studies the same day.
- Splinter villages sit at (parent.x+1, parent.y) — on the board
  too (villageAgency.js `_vaMakeSplinterVillage`). No far-village
  distance problem exists anywhere in the road.
- The stall is silent: 44 pilgrimages in the pilot left zero
  played lines naming the road.

## THE REWORK — courtship deeds, fixed (policy-side, frozen here)

The lever is the same two deeds, same prices, same gates. What
changes is the WALK, the STALE handling, and the VOICE — all in
scripts/policies/competent-courtship-b.js, zero src/js:

1. **walkTo fallback (the stall fix).** walkTo tries EVERY offered
   target nearest-first (deterministic order: distance-to-target
   asc, then x, then y), pre-checking each with a pure-read
   blockage check (destination + intermediates — the same scan
   travelTo runs, replicated in `pathBlocked`), and takes the
   first step that moves the scholar. It never steps AWAY from the
   village (distance-to-target never grows), so it cannot
   oscillate, and it stops only when NO offered step moves the
   scholar (genuinely walled in) or a fight goes live. A refused
   jump now routes around the rubble instead of stranding the
   scholar for a season.
2. **Stale drop walks home + unreachable cap.** When a trip goes
   stale (day − startDay > 14, unchanged), the scholar WALKS HOME
   (ctx._returning) instead of the trip dropping and the start
   logic re-picking the same village in the same call. A village
   that goes stale TWICE is never re-pilgrimaged
   (PILGRIM_MAX_STALE_DROPS = 2; the aid gift can still court it).
3. **Voice the pilgrimage (no-silent-actions rule).** Played lines
   for start ("You set out on the pilgrimage road to {name}'s
   fire — their codex waits…"), stale turn-home ("The road to
   {name}'s fire will not open — fourteen days of refused paths.
   You turn for home; their codex stays unread."), and return
   ("You walk back into Haven, {name}'s codex still open in your
   head."). All three carry the word 'codex', so the driver's
   LINK_LINE_RE already captures them. The study already voices
   itself through the engine's keeper line — no added line there.

WHAT IS NOT CHANGED (frozen): the aid price (2,000 kcal, pantry
gate 12,000, max 6,000/run); the stale window (14 days — NOT
scaled: the probes prove distance was never the cause, and 14
days is ~7× the honest walk to the farthest on-board village, so
scaling it would only have lengthened the stall); the tend gate
(20,000 — onlylead2 finding #3 stays the next arm's question);
engine-courtship surfacing (finding #2, next arm); no src/js.

EXPECTED ARITHMETIC (frozen prediction, not a bar): with the walk
fixed, each pilgrimage completes in 1–3 days (start day + walk +
study + walk home) instead of 15-day restart loops; pilgrim-days
per seed fall from the pilot's band-wide 354 (median ~31, max 156)
to roughly 3 villages × ~4 days ≈ 12; studies complete on ~every
attempted village instead of 22/44 attempts; opinion-10 timing is
unchanged (median ~day 6 — the aid, not the walk, opens the gate
on most seeds). Covenant staging expectation is the courtship-b
number (≥3/8) on a lever that no longer pays 156 absent days.

## Seed-band freshness (verified BEFORE any judged sim)

Per ~/workspace/custom-skills/local_seed_band_freshness/SKILL.md —
grep of EVERY dated prereg under evidence/ (evidence/*/sim-*-prereg.md),
plus evidence filenames, scripts/, and the convergence tracker:

- PILOT BAND 100641–100648: exact-seed grep (100641…100648) over
  all preregs = 0 hits for 100641/100642/100643/100645/100646/
  100647/100648; the "100644" hits (5 preregs) are all git-mode
  strings "100644 <oid>" in transplant preregs (file modes, not
  seed bands — the same note the courtship-b prereg records).
  Prefix grep (10064) over all preregs + scripts/ + tracker = no
  seed-band hits. FRESH. The coordinator's brief proposed this
  band; this prereg spends it as the pilot band.
- CONFIRM BAND 100621–100636 (16 seeds): named ONLY by the
  courtship-b prereg as its reserved confirm band, UNSPENT (that
  pilot was a NO-GO; no confirm ran). This prereg carries the
  reservation forward: spent ONLY on a re-pilot GO. The onlylead2
  reserved bands 100429–100436 + 100441–100448 stay fresh and
  unused, as before.

## Primary metric + GO bars (binding, §14)

COMBINATION RULE (one line — courtship-b metric review #2,
resolved here): **GO requires G1 AND G2 AND G3 AND the cost bar;
any FAIL = PILOT NO-GO, and the cost bar is a veto.** No bar is
re-scored mid-run; a miss is written under "metric review" with a
revision proposed for the NEXT run.

- G1 INSTRUMENT VALIDITY — GO iff the driver captures a full
  per-day link roll + shape-candidate roll + DAILY MAX-KNOWN-
  OPINION read + DAILY SCHOLAR POSITION + pilgrim state on all 16
  configs (8 seeds × covenant-baseline / courtship-armed), 0
  instrument errors, EVERY staged beat classified by shape with
  sat/unsat, UNCLASSIFIED ≤ 1 per 8 seeds on the armed leg, and
  the pilgrim rollup present on every armed record. Any instrument
  error, unclassified shape beyond the bar, staged beat without a
  shape, or missing pos/pilgrim field = NO-GO.
- G2 THE LEVER — GO iff on the courtship leg, COVENANT BEATS
  STAGED on ≥3/8 pilot seeds (same form as courtship-b; baseline
  expectation ~0/8 — the courtship-b control number) AND every
  staged covenant beat is answered 'pact' and sat, AND the stall
  read holds: zero-movement continuation pilgrim-days band-wide
  ≤ 8 AND stale drops band-wide ≤ 4 (the 15-day restart loop is
  gone: every pilgrimage ends in a study, a stale turn-home, a
  link, or the run's end). A miss on any third = NO-GO, never
  re-scored mid-run. Lead beats staged on the courtship leg are
  reported (expectation: 0 — the leg proposes no lead links); a
  lead staging means the isolation failed and the pilot is
  re-examined, not re-scored.
- G3 LEVER-ONLY — GO iff zero `src/js` changes in the branch
  diff and the proof tests are green (test-courtship-rework-b.js,
  new — the rework + instrument, GREEN before any landing;
  test-covenant-b.js 33/33, test-onlylead-b.js 29/29,
  test-onlylead2-b.js and test-courtship-b.js re-verified on this
  tip with their KNOWN drift recorded: test-courtship-b 56/57 and
  test-onlylead2-b 24/25 are the rebased-tip baselines from master
  game-code drift, bisected green at the pre-rebase instrument
  commit (courtship-b metric review #10); a CHANGE from those
  numbers is a failure, the known numbers are the baseline — no
  test is edited to go green). Any src/js change = NO-GO.

Cost bar (courtship-b form, KEPT as the binding bar — the veto —
with the metric-review #3 split reported alongside): starvation
deaths pooled courtship ≤ baseline + 2 AND median survival
courtship ≥ 0.8× baseline median. Guardrail (§14c): villager
(non-scholar) combat deaths are a co-primary read on every seed
— the evidence names any seed where courtship deaths exceed the
before leg by >50%. SPLIT (analysis, not a second bar): the
evidence ALSO reports starvation per seed split by lever spend
(aid kcal paid before the death day) AND by scholar absence
(pilgrim-days before the death day), so the bar's verdict can be
read against the lever's own spend and its own absence instead
of the weather. This prereg's diagnosis says the 1630Z failure
was trajectory, and the stall fix IS the cost fix — if this
re-pilot's cost bar fails again with the stall fixed, the
evidence says so plainly and the verdict still stands as
written (veto).

## Method (staged, §§9–12, 14–15)

- STAGE 0 SUBSTRATE SMOKE (before the pilot, in-memory only):
  the proof test (§2 game smoke) runs the REWORKED policy on
  pilot seed 100641, 200d, via the driver as a module — NO corpus
  is written, so the pilot band is not spent. It must show the
  deeds firing (aidVillage ≥ 1 call, studyVillageCodex ≥ 1 call
  — the study is the arrival proof the old smoke lacked),
  max-known-opinion ≥ 10 reached in-window, the pilgrimage
  arriving (a study completes within 3 days of its pilgrimage
  start), and the pos/pilgrim snapshot fields present every day.
  If the smoke shows zero courtship contact, the pilot is NOT
  spent (SUBSTRATE-MISSING re-check, onlylead precedent).
  (AMENDED pre-pilot, before any judged sim: on seed 100641 the
  aid fires 0 times — not a defect. The studies complete d13/d17,
  opinion 10 arrives d29 without aid, links form d32/33, and the
  counters account for every non-pilgrim day exactly (13
  pantry-blocked + 12 no-candidate + 78 cap-blocked = 103 =
  111 days − 8 pilgrimage days): the pantry trough + fast link
  formation close the aid window before it opens, and the aid is
  a gate-opener, not a quota. The smoke gate is therefore:
  study ≥ 1 (arrival proof) + opinion ≥ 10 in-window +
  pos/pilgrim fields, AND aid ≥ 1 OR the counters account for
  the window as above. No judged numbers have been seen; no sim
  has run.)
- STAGE 1 PILOT (8 seeds × 2 policies = 16 configs, 200d
  death-aware, identical seeds, BOTH legs run fresh): the judged
  run. Horizon 200d because the covenant road needs it
  (courtship-b: first beat day 62 even on the fastest staging
  seed). Seeds (exact literals): 100641, 100642, 100643, 100644,
  100645, 100646, 100647, 100648. Policies:
  competent-covenant-b (baseline — the road walked, no opinion
  lever) vs competent-courtship-b (reworked — the same road +
  courtship deeds with the walk fixed), identical seeds. The
  courtship leg is the judged leg; the covenant leg is the
  control. The contrast isolates the rework: same road, same
  deeds, fixed walk.
- CONFIRM (16 seeds × 2 policies) ONLY on a pilot GO, on the
  fresh band 100621–100636 (carried above). A borderline pilot
  is reported as-is; the coordinator decides. Do NOT spend a
  confirm to rescue a NO-GO.
- DRIVER: scripts/onlylead-driver-20261115.js (extended — see
  instrument changes below; same recorder, same shape-candidate
  roll). Per-seed JSON to
  evidence/2026-11-15/perseed-courtship-rework-b-control/
  (baseline) and evidence/2026-11-15/perseed-courtship-rework-b-on/
  (courtship). Zero src/js. RUN=courtship-rework-b.
- ANALYZER: scripts/analyze-onlylead-b.js (extended — see below).
  Writes evidence/2026-11-15/courtship-rework-b-analysis.json.
- BALANCED PANEL (§15): a pseudo-panel compare is built for the
  record (answercourt precedent — the real balance-panel.js
  compare cannot judge a policy contrast); the preregged G2 bar
  is the judge. Built for the record whether the pilot is GO or
  NO-GO (onlylead2 precedent).
- ENV: defaults, matching the courtship-b legs — COUNTER_ANSWER
  unset, COMPETENT_FLEE_REPAIR unset, ANSWERMAIL_DRIVE unset. No
  other env.
- ENCOUNTER-GEAR RULE (Steve 2026-11-13): no staged fixtures —
  the driver observes the policies' own play; nothing is staged.

## Instrument changes (frozen BEFORE the pilot — all in this prereg)

1. POLICY REWORK — scripts/policies/competent-courtship-b.js:
   walkTo fallback (try every offered target nearest-first with
   the pathBlocked pure-read pre-check; never step away from the
   village); stale drop walks home + twice-stale villages never
   re-pilgrimaged (PILGRIM_MAX_STALE_DROPS = 2); voiced
   pilgrimage lines (start / stale turn-home / return, all
   carrying 'codex' so LINK_LINE_RE already captures them);
   counters walkRefusals + staleDrops. Aid price, pantry gate,
   stale window, tend gate: UNCHANGED.
2. DRIVER — scripts/onlylead-driver-20261115.js: snapshot gains
   `pos` (scholar map.px/py, pure read) every day; snap() attaches
   `pilgrim` ({vid, startDay} or null) + `returning` from the
   harness ctx; dirFor maps RUN=courtship-rework-b to
   perseed-courtship-rework-b-control / -on (covenant → control,
   courtship → on). No other driver change.
3. ANALYZER — scripts/analyze-onlylead-b.js: `pilgrim` rollup
   (pilgrimDays / zeroMoveDays / maxZeroMoveRun per record;
   zero-move counts only continuation days — the start day never
   walks by design). scripts/analyze-answercourt-b.js:
   tendsPaidKcal falls back to the nested covenant figure
   (courtship-b metric review #7 — the courtship driver's
   capSummary nests covenant counters under .covenant, so the
   top-level read was 0 while the driver paid 43,500 kcal).
4. PROBES (diagnostic, committed as evidence of the diagnosis):
   scripts/probe-pilgrim-b.js (position trace), probe-pilgrim2-b.js
   (refusal tally), probe-pilgrim3-b.js (direct travelTo test),
   probe-pilgrim4-b.js (intermediate-blockage scan).
5. PROOF — scripts/test-courtship-rework-b.js (new; §1 static:
   walkTo fallback + stale-home + unreachable cap + voice lines +
   aid unchanged + analyzer pilgrim rollup + tendsPaidKcal
   fallback; §2 game: live 200d smoke on pilot seed 100641,
   in-memory only, + determinism). The four older proof tests are
   re-verified on this tip (see G3).

## Wall numbers (every run)

National / table / wins, wave 4–5 unlocks, median survival —
reported for both policies in the evidence file.

## Sense-testing (SENSE-TESTING LAW)

Quote the staged beat + answer lines the driver captures and judge
whether the Founding Council reads like a played ceremony — AND
read the pilgrimage lines the rework voices: does the start line
name the village and the road, does the stale turn-home line say
WHY the scholar turns (fourteen days of refused paths, codex
unread), does the return line land once (not daily)? Do the deeds
arrive as played lines with named villages and remembered gifts,
or as ledger entries? Judge meaning and coherence, never just
counts. In particular: does any pilgrimage line repeat daily, and
does the stall — if any trip still goes stale — read aloud
instead of vanishing?

## Evidence

- Prereg: this file.
- Instrument substrate (on master, unchanged):
  scripts/policies/competent-scaleclimb-b.js and
  scripts/policies/competent-covenant-b.js (the covenant road).
- Lever: scripts/policies/competent-courtship-b.js (reworked).
- Probes: scripts/probe-pilgrim-b.js, probe-pilgrim2-b.js,
  probe-pilgrim3-b.js, probe-pilgrim4-b.js.
- Driver: scripts/onlylead-driver-20261115.js (extended: pos +
  pilgrim snapshot fields + courtship-rework-b dirs).
- Analyzer: scripts/analyze-onlylead-b.js (extended: pilgrim
  rollup) + scripts/analyze-answercourt-b.js (tendsPaidKcal
  fallback).
- Proof: scripts/test-courtship-rework-b.js (new); re-verified:
  scripts/test-courtship-b.js, scripts/test-covenant-b.js,
  scripts/test-onlylead-b.js, scripts/test-onlylead2-b.js.
- Panel builder: scripts/build-courtship-rework-panels-20261115.js
  (new).
- Per-seed JSON: evidence/2026-11-15/perseed-courtship-rework-b-control/
  (8 files) and evidence/2026-11-15/perseed-courtship-rework-b-on/
  (8 files).
- Analysis: evidence/2026-11-15/courtship-rework-b-analysis.json.
- Panel (GO and NO-GO, for the record):
  evidence/2026-11-15/courtship-rework-b-panel.*
- Evidence: evidence/2026-11-15/sim-courtship-rework-b.md
  (per-seed per-shape tables with ALL failing gates + rung naming,
  opinion trajectories per leg, pilgrim stall table, deeds table,
  wall numbers, sense-testing, metric review).

## Convergence state

Courtship-deeds rework arm on a 200d horizon. The verdict is GO /
NO-GO against G1/G2/G3 + the cost bar above (pilot), plus confirm
on GO. If GO, the reworked courtship policy lands as its own
commit(s) — policy + evidence + tests; NO default flip, NO src/js
change. If NO-GO, evidence-only record; no game change. Killed
arms leave no trace. The findings-backlog item ("THE PILGRIMAGE
STALLS ON FAR VILLAGES") is marked [fixed] only if this arm lands
a working lever — a pilot GO that confirms. The covenant-road
item stays [claimed] until the same bar is met on the road itself.
