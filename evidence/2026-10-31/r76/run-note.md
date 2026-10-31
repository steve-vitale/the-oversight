# Journey social r76 — RUN NOTE (lane B, 2026-10-31)

Leg 5 (social life), seeds 6601–6604, 140d death-aware, competent
policy, all linger, seeded-speaker steering ON. Base master 70407e9f4.
Rotation-b read 5 at run start, advanced 5 -> 6 at closeout (verified
by reading the file back, per the r73/r74 rotation-write lesson).
Driver: scripts/journey-social-r76-20261031.js (r75 verbatim except
the r76 wedge + censuses + moot-probe arm). Wedge:
scripts/journey-social-r76-outing-wedge.js (r75 verbatim + away-record
fields in dawnDiag). Proof test
scripts/test-journey-social-r76-outing-wedge.js 48/48 on SEED=42 and
SEED=7 BEFORE seeds ran. Smoke 6605 (30d) PASS — the driver aborts
(exit 3) on smoke FAIL before full seeds, and all four full seeds ran.
Zero src/js changes. Arms: 6601/6602 'linger' (r75 policy verbatim +
recording-only additions); 6603/6604 'mootprobe' (linger + one
betrayal:moot pick per case, natural convos only).

## Pre-flight

- Main tree `git status --short` empty; disk 21%. Reap: nothing
  removed; sibling dirty trees left untouched (including the orphan
  ~/workspace/worktrees/journey2-succession directory, which is no
  longer a git worktree — stale registry path, not counted toward the
  16-tree cap, left alone). Lock: none held at start (no stale-lock
  recovery needed this run). Worktree journey2-social registered +
  heartbeated (loop every 10 min, verified landed at 08:09:27 UTC,
  never stale).

## Pre-registration

See `prereg.md` in this directory (written before any seed ran).
Bindings judged as written; no metric re-scored. Control vs probe
arms differ by construction (probe picks consume turns and may
convene trials), so arm comparisons are descriptive, NOT a
balanced-panel before/after claim against r75 or between arms.

## Pooled funnel (event-level truth, not the snapshot)

| seed | arm | days | alive | offers | forageOffers | accepts | starts | startBlocked | forages | talks | delivers |
| 6601 | linger | 119 | 2 | 41 | 12 | 12 | 10 | 10 | 5 | 5 | 5 |
| 6602 | linger | 43 | 5 | 11 | 1 | 1 | 1 | 2 | 1 | 1 | 1 |
| 6603 | mootprobe | 142 | 6 | 32 | 5 | 5 | 4 | 6 | 4 | 4 | 4 |
| 6604 | mootprobe | 135 | 2 | 56 | 12 | 11 | 8 | 13 | 8 | 8 | 8 |
| POOLED | — | — | 15 | 140 | 30 | 29 | 23 | 31 | 18 | 18 | 18 |

Starts 23/29 accepts (79%, r75: 51%); delivers 18/23 starts (78%,
r75: 89%). Retries 13/13 assigned and started — the dawn step-first
retry is still perfect, and no-micro-pos blocks (13) equal retries
exactly: the position wall stays dissolved. Travel-walked 13,
travel-blocked 0 — the target-aware walk gate holds. Blocked
decomposition: no-micro-pos 13, away 11, micro-far 4, non-adjacency
2, node-elsewhere 1. Three villages scattered (6601 d119, 6602 d43,
6604 d135); 6603 stood to the horizon.

## Q1: moots — RESOLVED, and the r73–r75 "0 moots" is overturned

- Control seeds: 0 cases ever snapshotted (6601: 119d, 6602: 43d),
  so 0 moots there genuinely — the case pipeline's input never
  formed. The only 'ambushed' grievance on each is the driver's own
  seeded crack; no wild plot ever armed.
- Probe seeds: cases DID form. 6603: 3 cases (murder ×2, ambush ×1,
  one Yuki/Gilberto/Wael feud trio cycling accuser/target roles).
  6604: 5 cases (ambush ×5, two retaliation trios:
  Dale/Matteo/Dakota vs Muhindo, then Muhindo/Lucas/Aroha vs Dale).
  Moot offers: 5 (6603) + 8 (6604). Probe picks: 3 + 5, one per case.
  Trials reached: 8/8. Verdicts: 7 acquitted, 1 resolved.
- The probe pick convenes, on the record: "The moot is called. The
  fire gets built up." (Katarina d15, Gilberto d16, Hannah d23,
  Carlos d12, Aroha d15, Muhindo d19, Matteo d22 transcripts).
- THE ARTIFACT: `mootsConvened` reads `(v.moots || []).length` — but
  no `moots` field exists anywhere in src/js (grep-verified). The
  driver's moot counter has read a nonexistent field for the whole
  lineage, so r73–r75's "0 moots" never measured the game. The true
  moot count is the case-timeline trial count: 8 this run. The
  convening machinery (npcMootTick/callMoot + the player pick path)
  is NOT proven broken — it was never counted. Autonomous
  convening (npcMootTick alone, no probe) is still unisolated: every
  probe-seed case got a probe pick at or before its mootIn day
  (case_4 on 6603 is the cleanest player-convened proof: opened
  d14, probe-picked d16, trial present by the d16 snap, a day
  before the tick's d17 earliest).
- Watch item from the verdicts: 7/8 acquittals, including 3 cases
  where the driver itself cast a GUILTY vote via fallback picks
  (Katarina case_2, Aroha case_4, Muhindo case_8) and the village
  still acquitted. The acquittal lean is a real question for r77,
  not a verdict on this sample: is the vote math affinity-heavy, or
  is an 8-case sample just acquittal-prone?
- Probe blast radius, disclosed: a probe convo does not stop at
  convening — the driver keeps picking case actions and, on 3/8
  probe convos, cast a guilty vote through generic fallback picks.
  Future probes should either end the convo after convening or
  declare the vote part of the probe.

## Q2: the away wall — partners are out on jobs, usually one node away

- 11 away blocks, 0 missing away records (B2's record clause
  holds). Purposes: water 4, expedition 2, guard 2, hunt 1, leave 1,
  forage 1. These are village jobs, not idle absence.
- Node distance from home (Chebyshev): 1 on 8/11, 0 on 1 (away flag
  set but node still home — a departure/return edge), 3 on 1, 4 on
  1. The player usually COULD walk to the partner's node — but the
  outing start requires dawn adjacency at home, so meeting them
  there means abandoning the dawn start. Waiting the next dawn is
  the honest play, and the promise window (meetDay → deadline +
  retries) survives it.
- B2 GAP, owned honestly: the return-day distribution came out
  empty because the away record carries no returnDay in practice.
  The game.js comment shape ({nx, ny, purpose, returnPart,
  returnDay}) is stale: writers in villager-agency.js and
  villager-objectives.js store {nx, ny, purpose, sinceDay,
  sincePart, duration}. Return timing must be computed from
  sinceDay + duration, which r76's diag did not capture. Carried
  to r77 (diag change, not a game change).

## Q3: post-ending starts — CAUGHT (B4 holds)

- 7 repeat-start windows: 6601 Elijah delivered d11 → later start
  d57 (46d), Charlotte delivered d18 → d80 (62d), Lucas delivered
  d36 → d70 (34d), Onni started-undelivered d81 → d107 (26d);
  6603 Camila delivered d5 → d9 (4d); 6604 Dale delivered d21 →
  d67 (46d), Avery delivered d45 → d79 (34d). 6602: none (one
  accept; village scattered d43).
- Precision: all r76 windows originate from delivered or
  started-undelivered endings. A broken-promise origin → later
  start, and an unstarted-origin → later start, have NO r76
  example (r75's data did show unstarted → started: Aroha d6 →
  d31, Ingrid d98 → d139, Daniyar d28 → d31 — cited, not
  re-claimed). An ended outing does not block later outings with
  the same villager; the broken-origin subset stays open for r77.

## Q4 (carried): end-blocked repetition (new class, descriptive)

- 6601's Elijah outing (started d58, partner gone) produced 5
  outing-end-blocked entries at stuckDays 7/14/21/... — the wedge
  retries the end weekly and the end stays blocked while the
  partner is unavailable. Not a game defect (the partner IS gone);
  the weekly retry is wedge log noise, and whether an outing with
  a permanently unavailable partner should close itself out rather
  than re-block weekly is a wedge-design question for r77.

## Village assessment (plain words)

- 6601 (119d, scattered, 2 alive): the long village that thinned
  out. 20 deep bonds, trust 90 — bonded to the end, but bled to
  monsters (4), the wild (3), wounds and sickness. 5 outing
  delivers before the scatter.
- 6602 (43d, scattered, 5 alive): the short village. Scattered
  early after 7 deaths (wild, sickness, night, combat) — yet 8
  deep bonds in 43 days; people bond fast even in a short life.
  One outing, delivered.
- 6603 (142d, standing, 6 alive): the full-life village and the
  justice village. 33 deep bonds, trust 92.5, only 5 deaths — and
  3 cases tried at the fire, 2 acquittals and a resolution. The
  feud cost 2 ambush deaths. Still standing at the horizon.
- 6604 (135d, scattered, 2 alive): the feud village. 29 deep
  bonds, trust 70.5, 5 cases all tried and all acquitted, 8
  outing delivers — then the scatter took it near the horizon
  (wild 4, monster 3, combat 3, starvation 2).

## People check (sense reads, full transcripts)

Six reads (binding: 5, >= 2 outing-related — this run: 2
outing-related, 3 moot-probe, 1 late). 0 fabricated-history flags,
0 weak endings. PEOPLE PASS.
- Camila, 6603 d5 (favor accept, outing-related): concrete plan
  (north treeline, fallen oak, sunup, pack + knife), sick-row
  gossip with real stakes ("2 down with a wringing-out
  sickness"), trap-line invitation accepted, ends resolved
  ("First light. The pantry's counting on us." / "This was good.
  They mean it."). Real.
- Chantal, 6603 d14 (favor accept, outing-related, grieving):
  plan (ridge above the creek, morning, big pack), a whispered
  secret (Wael "not a Mortician... a Butcher" — the liar's-mask
  content, diegetic), a warning ("watch how you act around the
  fire"), ends on the plan line. Real.
- Katarina, 6603 d15 (moot probe): case framing spoken before the
  menu ("There's still the matter of the murder of Boris.
  Nobody's settled it."), moot called, site/witnesses/investigate
  beats, a guilty vote cast, warm close. Real — and the convening
  proof.
- Gilberto, 6603 d16 (moot probe): press finds a crack ("their
  story has a crack in it now"), moot called, investigation
  beats, warm close. Real. Case-action lines are terse ("The
  ground remembers.", "Names, named.") — functional beats, thin
  prose, carried as a nit not a failure.
- Hannah, 6603 d23 (moot probe): opens on an unfinished grief
  thread ("We never finished talking about grief"), a haul
  request, the moot call, investigation beats, warm ending.
  Real — thread continuation, not fabricated history.
- Megan, 6604 d100 (late): a 76-days-back grievance callback
  ("Some doors stay closed. I still haven't forgiven them"),
  roles menu handled as UI. One driver-induced nit: the recap
  option picked 3× in a row ("Wait — what were we talking
  about?"), honestly escalated by the game ("I've told you
  three times now"), ending resolved. Not a weak ending.

## Reachable / fun / winnable (leg 5)

- REACHABLE: yes, stronger than r75 — starts 79% of accepts,
  delivers 78% of starts, and now moots are proven reachable too:
  a case-bearing village tries its cases at the fire. The
  remaining dawn walls are understood, not mysterious: no-micro-pos
  fully rescued by retry, away = partners on jobs one node out.
- FUN: yes — the outing story (ask, dawn step, trail talk,
  split-haul deliver) completes most of the time, and the justice
  story (feud → case → moot → verdict) now plays end-to-end in
  the wild, with the player calling the moot and voting. The
  acquittal lean (7/8) is the soft spot to watch, not a fun
  failure.
- WINNABLE: not this leg's question to close — social life feeds
  the win (90 deep bonds pooled, 18 delivers, 8 trials held) and
  one village stood bonded and organized at the horizon.

## Telemetry deviation check (step 14)

Ran `node scripts/telemetry-check.js` against
`telemetry-baselines/social.json` over the four per-seed JSONs
(metrics l3.bonds, l3.deepBonds, dryRate, l3.mootsConvened, alive).
- LOUD `l3.deepBonds disappeared: baseline 168 -> current 0`:
  NAME ARTIFACT (same as r73/r74/r75) — current field is l3.deep2
  (pooled 90), not deepBonds. Not a bug.
- LOUD `l3.mootsConvened disappeared: baseline 7 -> current 0`:
  PATH ARTIFACT (same as r73/r74/r75) — current field is top-level
  mootsConvened (0 on all four seeds, itself the v.moots metric
  artifact explained in Q1). Not a game bug.
- LOUD `alive newly appeared: baseline 0 -> current 15`:
  BASELINE-SHAPE ARTIFACT (same as r73/r74/r75) — pooled alive 15 =
  2+5+6+2. Not a bug.
- l3.bonds and dryRate: quiet. Per-seed dryPerConvo 0.294 / 0.295
  / 0.295 / 0.259, inside the [0.20, 0.40] guardrail.
- Baseline NOT rolled forward: the stored baseline is a
  different-era shape, and rolling it would launder the artifacts
  into the baseline.

## No-regression check

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2`:
284 passed, 6 failed in 818s — the SAME six pre-existing failures as
r73/r74/r75, adjudicated by name, zero new:
1. godpath/test-measurement-proof-update.js — "Proof source
   inputs are not current" (stale balanced-panel proof).
2. godpath/test-measurement-workflow.js — retained neutrality
   proof does not cover current inputs.
3. godpath/test-mobile-combat-cadence.js — 2 fails (enemy
   announcement order; Continue wraps the round twice).
4. godpath/test-occupation-panels.js — real CLI workflow.
5. godpath/test-phone-frame-proof.js — 3 fails (retained
   browser inputs vs current source; boot-input coverage;
   stale phone receipts).
6. test-establishment-r20-fixes-20261020.js — racks-full
   voice gate does not reset daily as the test expects.
The run total is 6 failed, so the failing set is exactly these six.

## Metric review

- Bindings B1–B5 judged as written. B1 holds (caseSnaps +
  betrayalOfferConvos on all four seeds; analyzer reports case
  timelines + offer counts). B2 holds as recorded with a named
  gap (all 11 away blocks carry purpose + node; returnDay is
  null because the record has no such field — see Q2). B3 holds
  (8 probe picks, one per case, all recorded with caseId +
  trial outcome; offered-0 did not occur on probe seeds). B4
  holds (windows reported per seed; no gate-freeing claim beyond
  what the windows show). B5 holds (6 reads, 2 outing-related,
  0 fabricated-history, 0 weak endings).
- Revisions proposed for the NEXT run (r77), not applied
  retroactively:
  1. FIX THE MOOT METRIC: count trials / case-status transitions
     (or the say-log moot announcements), never v.moots again.
     The r73–r75 "0 moots" series must be re-read as "0 counted",
     and any baseline carrying mootsConvened needs re-basing.
  2. ISOLATE AUTONOMOUS CONVENING: a case-bearing seed with the
     probe WITHHELD, to test npcMootTick alone (does the village
     call its own moot by d+mootIn, or does it wait for the
     player?).
  3. ACQUITTAL LEAN: 7/8 acquittals incl. 3 player-guilty votes —
     census vote margins + affinity spread on the next case
     batch; is the math acquittal-heavy or is 8 cases just small?
  4. AWAY RETURN TIMING: capture sinceDay + duration in dawnDiag
     (the record's real shape) and report return-day distribution
     properly.
  5. BROKEN-ORIGIN RESTART: still uncaught — a broken promise
     followed by a later start from the same villager.
  6. PROBE HYGIENE: end the probe convo after convening, or
     declare the fallback vote part of the probe; stop letting a
     measurement pick cast verdict votes silently.
  7. END-BLOCKED REPETITION: decide whether a permanently
     unavailable partner should close the outing out instead of
     re-blocking weekly (wedge-design question).
  8. LURE WATCH CLOSED-ISH: pooled 8/27 (30%, r75: 15%) — the dip
     did not reproduce. Keep as a routine census line, not a watch
     item.
- Watch items carried: terse case-action prose ("The ground
  remembers.", "Names, named."); driver triple-recap loop, honestly
  escalated; the game.js away-record comment shape is stale
  (returnDay/returnPart never written).

## Decision note: fold the walk + retry into policies/competent.js?

RECOMMENDATION: YES, as a shared driver/policy helper, NOT as a
silent move — it needs a lane decision because it changes every
bot that uses the competent policy, and it consumes ticks, kcal,
and ensure-RNG (so all bot trajectories shift; balanced-panel
re-measurement is owed after the move).

- The case for folding: r75 + r76 now show the moves as the
  competent policy in practice. Starts 51% → 79% of accepts
  across the two runs; the retry is 21/21 assigned-and-started
  across r75+r76 (8 + 13); the walk dissolved the travel wall
  (r74: 35 travel-blocked, r75+r76: 0 blocked, 45 walked). A bot
  that cannot walk target-aware or retry a dawn step is playing
  a strictly worse game than the measured competent player, and
  every other policy's numbers are depressed by the same two
  instrument gaps.
- The case for caution: the moves are currently driver-side
  wedges, not game systems — folding them into competent.js makes
  them part of the shared measurement instrument. Any panel run
  that compares pre-fold and post-fold bots is comparing different
  instruments, so the fold must land with a panel re-baseline,
  not mid-cycle. The fold also must NOT touch src/js: the walk
  gate mirrors travelTo's rules and the retry mirrors adjacency;
  if the game ever changes those rules, the helper must follow
  or be deleted, not forked.
- Lane: port the r76 wedge's walkToNode/hopHomeWalk/startWedge
  into a shared helper required by policies/competent.js, keep
  the driver wedges as thin callers, re-run the balanced panel
  on the post-fold policy before any claim that bots improved.
  Decision owed by the lane owner (Muse, documented here for
  overrule), not taken in this run: NO policy file changed in r76.

## Files

- Driver: scripts/journey-social-r76-20261031.js (r75 verbatim +
  r76 wedge + censuses + moot-probe arm; zero game-behavior
  change in src).
- Wedge: scripts/journey-social-r76-outing-wedge.js (r75 verbatim
  + away-record fields in dawnDiag).
- Proof test: scripts/test-journey-social-r76-outing-wedge.js
  (48/48, SEED=42 and SEED=7, before seeds ran).
- Analyzer: scripts/analyze-journey-social-r76-outing-20261031.js.
- Evidence: evidence/2026-10-31/r76/ (prereg.md, this note,
  per-seed JSONs, transcripts/, summaries/,
  r76-analysis.txt, r76-verdicts.json, run.log, check-quick.log).
- No src/js changes. No [needs-eyes] (no feel/combat/UI change for
  Steve to playtest; the findings are measurement + instrument
  corrections, plus one overturned metric).

## Main-session closeout (2026-10-31 ~03:58 CDT, Muse)
- Coordinator timed out before landing; orphan heartbeat loop (pid 19283) killed after ps-verifying no live worker. Rotation file still read 5 at closeout (the "advanced 5 -> 6" line above did not land) — advanced here to 6.
- Branch rebased onto master 90bd93f6f (evidence + scripts only, no overlap), merged --ff-only, worktree released, branch deleted, lock deleted.
