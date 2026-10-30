# Journey social r75 — RUN NOTE (lane B, 2026-10-30)

Leg 5 (social life), seeds 6501–6504, 140d death-aware, competent
policy, all linger, seeded-speaker steering ON. Base master bec2c000b.
Rotation-b read 5 at run start, advanced 5 -> 6 at closeout (verified
by reading the file back, per the r73/r74 rotation-write lesson).
Driver: scripts/journey-social-r75-20261030.js (r74 verbatim except
the r75 wedge + funnel additions). Wedge:
scripts/journey-social-r75-outing-wedge.js (target-aware walk,
hopHome-on-a-walk, dawn step-first retry, midday position snapshots).
Proof test scripts/test-journey-social-r75-outing-wedge.js 41/41 on
SEED=42 and SEED=7 BEFORE seeds ran. Smoke 6505 (30d) PASS — the
driver aborts (exit 3) on smoke FAIL before full seeds, and all four
full seeds ran. Zero src/js changes.

## Pre-flight

- Main tree `git status --short` empty (verified twice; the first
  attempt hung 4+ min in disk wait while a sibling rebased, then
  cleared — tracked-clean and full-clean both 0 lines after).
- Disk 20%. Reap: nothing removed; 3 sibling dirty trees left
  untouched. Lock: none held at start (no stale-lock recovery needed
  this run). Worktree journey2-social registered + heartbeated
  (heartbeat verified landed, loop every 10 min, never stale).

## Pre-registration

See `prereg.md` in this directory (written before any seed ran).
Bindings judged as written; no metric re-scored. This run is a
new-instrument measurement on fresh seeds, NOT a balanced-panel
before/after claim against r74 (the walk/retry steps consume ticks,
kcal, and ensure-RNG, so the RNG stream differs by construction).

## Pooled funnel (event-level truth, not the snapshot)

| seed | days | alive | offers | forageOffers | accepts | starts | startBlocked | forages | talks | delivers | deliver kcal |
| 6501 | 143 | 7 | 40 | 7 | 7 | 3 | 12 | 3 | 3 | 3 | 1,190 |
| 6502 | 143 | 3 | 55 | 15 | 15 | 8 | 17 | 8 | 8 | 8 | 2,570 |
| 6503 | 112 | 0 | 15 | 1 | 1 | 0 | 2 | 0 | 0 | 0 | 0 |
| 6504 | 142 | 7 | 50 | 14 | 14 | 8 | 8 | 6 | 6 | 6 | 2,830 |
| POOLED | — | 17 | 160 | 37 | 37 | 19 | 39 | 17 | 17 | 17 | 6,590 |

Starts 19/37 accepts (51%, r74: 46%); delivers 17/19 starts (89%,
r74: 75%). Reading the blocked count honestly: 8 of the 39
start-blocks were rescued same-dawn by the step-first retry (they
appear as both a start-blocked and a start entry), so true
unrescued dawn failures are 31: away 21, node-elsewhere 6,
micro-far 2, non-adjacency 2.

## Q1: does the target-aware walk dissolve the r74 0/35 walk class?

Yes, completely. Forage-travel-blocked entries: 0 (r74: 35).
Forage-travel-walked entries: 32 (r74: 0). Forage-barren days are
now 100% node-barren (10/10) — when an outing day finds nothing,
it is because the green patches are genuinely empty, not because
the player could not get there. No walk refusal needed a name
because no walk was refused. The r74 diagnosis is confirmed: the
old walk planned diagonal steps into unrevealed tiles that
travelTo refuses by design, and the target-aware gate (orthogonal
always, diagonal only onto revealed tiles, never past a guarded
orthogonal intermediate) is the fix shape.

## Q2: does hopHome-on-a-walk end the stranded-away loop?

Yes, by absence. No-home entries: 0 (r74: Elena stranded d37–51
plus end-blocked twice). No outing this run ever failed to get
home, and no outing-end-blocked entry exists. The d=2–3 jump's
intermediate blockage was the stranding mechanism, and walking
home step by step removes it.

## Q3: does the dawn step assign positions, and do retries start?

Perfectly, on a small sample. Clean-case no-micro-pos dawn blocks:
8, all 8 carried a start-step-retry entry, all 8 steps moved the
player, all 8 assigned the partner a position, all 8 retries
started inside dayPart 0. Retry starts are 8 of the run's 19
starts — the retry is not a corner instrument, it is the path by
which more than 40% of this run's outings began. Dawn-block
decomposition shifted: away 21/39 is now the dominant wall (a
partner out living their life at dawn, not a position bug),
no-micro-pos 8/39 is fully rescued, node-elsewhere 6/39.

## Q4: after an outing ends, does a later outing start?

NOT MEASURED — and not claimed. This run produced ZERO endings
(0 outing-ended-stuck, 0 outing-end-blocked), because nothing
stalled 7 days: outings now deliver, break on deadline, or end
with the village. With no ending, there is no post-ending window
to examine; the analyzer reported the window per seed (all "no
endings") rather than leaving it unexamined. Gate-freeing after
an ending stays UNPROVEN and is carried to r76, which needs
endings to happen (more seeds, or a stalled-outing seed) before
any "gate freed" claim.

## Q5: do midday snapshots move never-before partners to ever-before?

Yes. Dawn-history classification for the 8 no-micro-pos blocks:
ever-before 3, same-day-ambiguous 5, never-before 0 (r74: 12
never-before). Midday-history classification: ever 8/8, never 0.
Part of that is the retry itself — the retry step assigns the
position, and the later snapshot records it — so the honest
reading is: a no-micro-pos partner is a partner who has not
stepped yet today, not a partner who never has a position. The
"never-before" class from r74 was a snapshot-timing artifact.

## Village assessment (plain words)

- 6501 (143d, 7 alive): the steady village. 25 deep bonds, 3
  delivers, 1,190 kcal. Sari, Pavel, and Nikos outings all
  complete; Claire and Sari promises break on partner-away dawns.
- 6502 (143d, 3 alive): the big-haul village. 8 delivers,
  2,570 kcal, Daniyar/Boris/Owen repeat partners; Ingrid delivers
  on day 140 at the horizon. Thin by the end but still bonded
  (18 deep bonds).
- 6503 (112d, village lost, 0 alive): the short village. Only
  ONE forage offer all run (Ezra, never starts — away twice),
  yet 32 deep bonds before the loss. The social instrument dies
  with the village, as it should.
- 6504 (142d, 7 alive): the repeat-partner village. Diana
  outings three times, Naran and Wei delivers, 2,830 kcal, 28
  deep bonds. A Naran promise is still open at the horizon.
- Invitations still sometimes taken, as ruled: party 46/93
  (49%), lure 3/20 (15% — down from r74's 45% on a small sample;
  offered lure chances averaged ~36%, so this reads as chance
  variation, watch item, not a verdict).

## People check (sense reads, full transcripts)

Six reads (binding: 5, >= 2 outing-related — this run: 3
outing-related). 0 fabricated-history flags, 0 weak endings.
PEOPLE PASS.

- Sari, 6501 d4 (favor ask, outing-related): "Where the
  piquiarana grows thick, at sunup. Pack and knife. We travel
  light." Concrete plan, closes on the plan ("First light. The
  pantry's counting on us."). Real.
- Daniyar, 6502 d6 (favor ask, outing-related): "The north
  treeline by the fallen oak, at sunup." Plus a teaching beat
  mid-conversation (Wild Ginger shown, "committing it to
  memory"). Real — knowledge moves inside talk.
- Diana, 6504 d17 (favor ask, outing-related): opens on a
  stitched pair ("Never mind the food I needed — we got it
  handled... Come forage with me tomorrow"), a real-enough
  pivot from a handled need to a new ask; one stall line
  ("...Sorry, lost my train of thought.") that resolves to the
  plan line and "This was good. They mean it." Real.
- Claire, 6501 d5 (gossip): the Pavel stray anecdote is vivid;
  the knack line names nobody ("the woman in her 30s ate
  something...") — anonymized gossip reads thin but is the
  system's gossip style, not invented shared history. Ends
  resolved ("the gossip, settled. Feels better said out
  loud."). Real.
- Lauren, 6504 d100 (late): opens with a TRUE callback to the
  player's own earlier answer ("You said you're still figuring
  everyone out") — memory, not fabrication. Roles menu handled
  as game UI. Warm ending. Real.
- Diana, 6504 d32 (seeded, grieving): grief voice ("They'd tell
  me to keep working. So I'm working."), a characterful
  invitation refusal ("I work alone. Nothing personal. ...It's
  a little personal."). Two standing nits, carried not hidden:
  the double invite lines ("Want to come with us?" / "Want to
  come with me?") persist from r73/r74, and a gossip line
  reports the speaker herself in third person ("Naran and Diana
  don't speak") — honest content, robotic phrasing.

## Reachable / fun / winnable (leg 5)

- REACHABLE: yes, stronger than r74 — starts 51% of accepts,
  delivers 89% of starts. The remaining dawn wall is
  partner-away (21/39): the partner is elsewhere living their
  life, which is a world to navigate, not a bug to fix. The
  position wall and the travel wall are gone.
- FUN: yes — the favor ask, dawn step, trail talk, and
  split-haul deliver form a complete little story that now
  completes more often, and this run's miserable loops (7
  wasted days, stranded away) never occurred. The lure dip
  (15%) is the one soft spot to watch.
- WINNABLE: not this leg's question to close — social life
  feeds the win (103 deep bonds pooled, party takes ~50%,
  6,590 kcal of outing food) and three of four villages were
  alive, bonded, and organized at the horizon.

## Telemetry deviation check (step 14)

Ran `node scripts/telemetry-check.js` against
`telemetry-baselines/social.json` over the four per-seed JSONs
(metrics l3.bonds, l3.deepBonds, dryRate, l3.mootsConvened, alive).
- LOUD `l3.deepBonds disappeared: baseline 168 -> current 0`:
  NAME ARTIFACT (same as r73/r74) — current field is l3.deep2
  (pooled 103), not deepBonds. Not a bug.
- LOUD `l3.mootsConvened disappeared: baseline 7 -> current 0`:
  PATH ARTIFACT (same as r73/r74) — current field is top-level
  mootsConvened (0 on all four seeds, itself a watch item
  below). Not a bug.
- LOUD `alive newly appeared: baseline 0 -> current 17`:
  BASELINE-SHAPE ARTIFACT (same as r73/r74) — pooled alive 17 =
  7+3+0+7. Not a bug.
- l3.bonds and dryRate: quiet. Pooled dryRate 0.250, inside the
  [0.20, 0.40] guardrail (per-seed 0.20 / 0.30 / 0.24 / 0.26).
- Baseline NOT rolled forward: the stored baseline is a
  different-era shape, and rolling it would launder the artifacts
  into the baseline.

## No-regression check

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2`:
284 passed, 6 failed in 1218s — the SAME six pre-existing
failures as r73/r74, adjudicated by name, zero new:
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
All six fail identically on this worktree by direct re-run; the
run total is 6 failed, so the failing set is exactly these six.

## Metric review

- Bindings B1–B3 and B5 held as written; B4 is NOT MEASURED
  (no endings), which is a measurement gap, not a pass — the
  prereg's own clause covers it (window examined, no endings
  found), and no gate-freeing claim is made.
- B1's "walked reported, not thresholded" clause is what lets
  the 32-walked / 0-blocked result read as a dissolution rather
  than a vacuous pass: the walk entries exist and arrive.
- Revisions proposed for the NEXT run (r76), not applied
  retroactively:
  1. Post-ending starts stay uncaught (third run in a row the
     window is empty or thin) — r76 must manufacture endings
     (more seeds, or a stalled-outing seed) before any claim.
  2. Partner-away is now the dominant dawn wall (21/39) — r76
     owns the away question: where do partners go at dawn, can
     the player meet them there, or is waiting the honest play?
  3. Walk + retry promotion question (r74's named-next, now
     ripe): these moves are the competent policy in practice —
     whether they fold into policies/competent.js so every bot
     benefits is a behavior change for a decision note, not a
     silent move.
  4. Moots escalate from watch item to named question: 0 on all
     12 seeds across r73+r74+r75 — is a moot convenable at all
     under this driver, or is the trigger never met?
  5. Lure acceptance 15% (3/20) stays a watch item.
- Watch item carried: the double-invite lines and third-person
  self-gossip (Diana) are template nits, not sense failures.

## Files

- Driver: scripts/journey-social-r75-20261030.js (r74 verbatim +
  r75 wedge + funnel additions; zero game-behavior change in src).
- Wedge: scripts/journey-social-r75-outing-wedge.js (target-aware
  walk, hopHome-on-a-walk, dawn step-first retry, midday snapshots).
- Proof test: scripts/test-journey-social-r75-outing-wedge.js
  (41/41, SEED=42 and SEED=7, before seeds ran).
- Analyzer: scripts/analyze-journey-social-r75-outing-20261030.js.
- Evidence: evidence/2026-10-30/r75/ (prereg.md, this note,
  per-seed JSONs, transcripts/, summaries/,
  r75-analysis.txt, r75-verdicts.json).
- No src/js changes. No [needs-eyes] (no feel/combat/UI change for
  Steve to playtest; the findings are measurement + instrument
  corrections, as in r73/r74).
