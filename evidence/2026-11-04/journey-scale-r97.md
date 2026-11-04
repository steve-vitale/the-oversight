# journey-scale r97 — Lane A, leg 3 SCALE (2026-11-04 afternoon)

**Run id:** laneA-scale-2026-11-04T14:45CST (scheduled 14:45 CST 2026-11-04).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success.
**Base:** master@f6ee419ec at branch creation.
**Pre-register:** evidence/2026-11-04/journey-scale-r97-prereg.md
(committed as ca030b4e3 before any scored seed ran).
**Change set at closeout:** ONE src/js line (conversation.js frag framing,
proof RED→GREEN) + proof test + tooling (morntrace policy clone, driver/
analyzer clones, labels only, diffs verified) + evidence + run note.
Gating freeze honored; perception law honored (all instruments read-only;
pickers press offered menu items only).
**Fix-gate verdict: the Q3 fix lands; the Q1 trace does not become a
src/ change.** Q1 identifies the mover completely (COMPETENT thirst
walk, 28/28 resets, counter-corroborated) but the mover is CORRECT
policy behavior — a dehydrated scholar walking home to drink is a
player acting sensibly, not a bug. The defect behind the loop is the
overnight hydration collapse that makes the scholar thirsty, and this
run does not identify its mechanism (see carried question) — so no
game-code change is made on Q1's evidence. The Q3 fix is different in
kind: a one-line framing inconsistency between two code paths, proven
by a direct-drive test before and after.

## Infrastructure notes (loud, first)
- No lock contention at start: no playtest-loop.lock existed; this run
  created it and deletes it at closeout.
- Pre-flight clean: main-tree `git status` empty, disk 29%,
  `git pull` already up to date, worktree-reap ran (11/16 active —
  dirty/held sibling trees correctly untouched; one locked sibling
  tree's removal failed aloud in reap, not mine to force).
- Registration was slow, not stuck (~2 min under sibling load).
- Heartbeat loop verified by registry read-back (21:15:34Z, active),
  10-minute loop, alive for the whole run.
- **Safe-commit index clobber struck on the prereg commit**, same
  class as r90/r94/r95/r96: after the correct private-index commit
  (ca030b4e3, 4 files), the worktree's main index lied (4 files
  staged-as-deleted + untracked). Repaired via HEAD-blob cacheinfo,
  verified: `git status` clean, `git diff HEAD` empty, hash-object
  matches HEAD for all 4 files. The commit itself was correct.
- **Base drift, stated plainly:** r96's base was 62a67de7d; this run's
  base is f6ee419ec (sibling landings in between). The quad's SHAPE
  reproduces r96 exactly (regional 2/4, national 0/4, lesser waiting
  2/4, early hunger deaths 2/4), and 85503 reproduces r96 trip-for-trip
  (same edge trip, same days, same retry) — but 85504 ends at d113
  where r96's ended at d116, so per-seed day counts are not claimed
  identical. The Q1 verdict does not depend on that drift: the mover
  is identical on both looping seeds.
- **Day-label quirk (read before counting resets by day):** morntrace
  rows are keyed by scholar.day, which can roll mid-daily — one
  loop-day surfaces as "d50 entry → d51 postCompetent" with no d50
  postCourt row. Resets are counted by SEQUENCE (14 per looping seed),
  not by day arithmetic. The analyzer's reset list is the count.

## Q1 — MORNING TRACE (binding; closes r96's micro-question)
**FINDING clause: FIRED.** 28 overnight resets on the band, ALL in one
segment — COMPETENT — with counter corroboration on every one.
Prereg gate (≥3 resets sharing a segment + corroboration) is met by
an order of magnitude, on two independent seeds.

The mover is competent.daily's thirst walk home. In full, plain words:
the scholar walks to a neighbour's fire, sleeps there, and wakes up
parched. Before courtship ever gets a look-in, the morning routine
does the sensible thing — it walks the thirsty scholar home to Haven
to drink — and courtship then walks the scholar straight back out to
the same fire. Every morning. Until the trip goes stale and is dropped.
Sleep + morning waits NEVER move the scholar: on every looping night
the entry snapshot still stands at the target tile, and on every
holding night the position survives both sleep+waits AND competent.daily.

Evidence (analyzer: journey-scale-r97-analysis.txt; raw rows in
journey-scale-r97-morntrace-<seed>.txt, cross-checked against
journey-scale-r97-postrace-<seed>.txt):
- 85503, village_spl_28_58496 → (8,5): 14 COMPETENT resets
  (d37–d49 + the d51 drop morning). Entry hydration 8, then 0 on
  every reset morning (thirst threshold is 45); dThirst=1 on all 14;
  dStanding=0, dDetours=0 throughout. PostCompetent hydration
  50–58 (drank at Haven). Walk back out each courtship, hydration
  unchanged by the walk.
- 85504, village_2 → (3,1): 14 COMPETENT resets (d35–d48).
  Entry hydration 28 → 14 → 9 → 0; dThirst=1 on all 14.
  Band total: 28/28 COMPETENT, 0 SLEEP-WAITS, 0 standing-home.
- Holding nights (the contrast that proves it): interior trips that
  study first try enter the morning at hydration 95–100, no thirst
  walk fires, position holds through competent.daily, study fires
  next courtship. Held nights: 25 (85503) + 19 (85504) by the
  analyzer's sleep+waits-held count; the two retry nights hold
  through competent.daily as well (see below).

**Correction to r96's framing, stated plainly:** the mover is NOT
edge-specific. r96 had one looping instance and it happened to sit
on the map's edge column, so "edge tile" became the suspect. This
run's second looping instance sits at (3,1) — interior — and loops
identically, same segment, same thirst counter, same shape. Edge was
a red herring from a single instance. The prereg's second question
("does the mover differ between edge and interior?") is answered NO:
same mover, both tiles.

**Why the retry holds (the d55→56 / d49→50 nights, now explained at
the mover level):** on the retry, the scholar enters the target night
hydrated enough that no thirst walk fires — 85503: walk ends hyd 92,
next entry hyd 78; 85504: walk ends hyd 86, next entry hyd 72.
Position holds, study fires next courtship. The retry does not fix
the walk or the tile; it arrives at the night with water in the body.
Which is exactly why the next question is about the night, not the walk:

**Carried, still open — the overnight hydration drain (new
micro-question for the next run):** first-attempt nights drain
~58–64 hydration at the target tile (85503: 72→8; 85504: 86→28, then
50→0 nightly), while retry nights at the SAME tile drain only ~14
(92→78; 86→72). Tile alone does not explain it, entry hydration
alone does not explain it (both attempts walk out at 86–92), and
this run's trace does not capture pack water, tent/shelter state, or
tile water at sleep — so no mechanism is claimed. The next instrument
is an entry snapshot adding pack-water units, insideTent, and the
sleep tile's water offering, on first-attempt vs retry nights.
Candidates to test, not conclusions: pack water carried at sleep,
shelter state, tile water drunk during morning waits.

## Q2 — CENSUS CONTINUITY (report-only; r93–r96 metric unchanged)

| seed | end | day | pop | pantry | rank | seat | arc | seasoned peers (final) | shape |
|---|---|---|---|---|---|---|---|---|---|
| 85501 | over (pantry 0) | 38 | 3/3 | 0 | village | none | 3 | 0 (lead 38/13d) | early hunger |
| 85502 | over (pantry 0) | 29 | 6/6 | 0 | village | none | 3 | 0 (lead 20/4d) | early hunger |
| 85503 | over (pantry 0) | 121 | 1/1 | 0 | regional | lesser waiting | 4 | 1 (lead 70/96d; covenant 29/25/30, trade 29/28) | trust-blocked |
| 85504 | over (pantry 0) | 113 | 0/0 | 0 | regional | lesser waiting | 4 | 1 (covenant 60/60d; lead 30/87d, covenant 31/44d) | trust-blocked |

National staged 0/4, courtNational answers 0/4 — same as r96. The two
long-lived villages again die with a lesser seat waiting (arc 4),
and again each holds exactly one seasoned bond while the rest sit
2–15 trust short of the 40 bar. No dissolution timeline exists on
this band either (nothing staged to dissolve), so r95's
staged-and-lost shape is still unreproduced.

## Q3 — PEOPLE CHECK (sense law — 2 sittings read in full)
Corpus: d90 on 85503 and 85504 only (85501/85502 died before day 90;
no day substitution, per prereg). 1 of 2 fully real, 1 real with a
framing defect — fixed below.

- **85503 d90 Yoleida (florist, fidgety, trust 24, Spanish-only,
  nonverbal):** a real sitting with a real invitation. She mimes
  walking — self, then player, then the ridge — "come with me," the
  spoken-lure gesture firing correctly in the nonverbal path. The
  player (control picker) nods through the exchange; she answers at
  length, nods back with cycling narrations (the r72 fix holding),
  and the sitting closes true ("They press their palms together —
  thanks, or goodbye, or both."). The defect sat mid-sitting: the
  Mario-moment fragment fired as a bare quote — "They nod back, a
  little quicker this time. "Fuck you."" — which reads as hostility
  from a villager who shares no words, not as the designed moment.
  Mechanism (code, not inference): the verbal path frames the same
  fragment ("— they grin, proud of the one English they know."),
  but Game.nvRespond's react branch appended it bare. The fragment
  itself is deliberate design (foreignSpeech.json fewWords pool, one
  English phrase a zero-English speaker proudly knows); only the
  missing framing is the defect. FIXED this run (see Blanks).
- **85504 d90 Randa (tattoo artist, stoic, trust 91, ask_favor
  stage 1):** fully real and short. A real want, plainly stated
  ("The pantry run — I haven't stopped thinking about it."), a real
  commitment ("I'll come back to help."), and a concrete plan in
  reply ("The far treeline, past the rocks, first light. Pack and
  knife. We travel light."). The picker left after the commit —
  the instrument's choice, not a defect. No gossip pick in either
  sitting (control picker; unforced band).

## Village assessment (plain words)
Four villages, same shape as this morning. Two never get out of the
first month: pantries run to zero and the flag falls while people are
still standing. The two that live past day 90 both reach the region,
both court their neighbours properly — pilgrimages walked and
studied, covenants sworn — and both die with a lesser seat still
waiting for them, the way waiting seats keep outliving villages.
Neither reaches a nation: each holds one seasoned bond and a set of
neighbours whose trust sits just short of the line. The pilgrims, for
their part, are not lost — they are thirsty. A scholar who sleeps at
a neighbour's fire wakes parched, walks home to drink before the
day's courtship, and walks back out again, fourteen mornings in a
row, until the trip itself gives up. When the same scholar arrives
at the same fire with water in the body, the trip completes in two
days. The loop is a morning routine doing its job, not a walk failing.

## Reachable / Fun / Winnable (leg verdict)
- **REACHABLE — PARTLY, unchanged from r96.** Regional on 2/4 seeds;
  national staged 0/4. The covenant road opens in play (85504 swears
  and holds covenants 60+ days), but the season to hold a third
  seasoned peer is not reached on these seeds — trust-blocked, not
  unreachable.
- **FUN — YES, with the same honest caveat.** Conversations are
  genuinely good (Randa's pantry-run commitment; Yoleida's mimed
  invitation, now with its punchline framed as pride instead of a
  slur). The dull spot is the early-death band: two villages end
  before the leg's window (day 80) even opens.
- **WINNABLE — NOT YET.** No national, no global, no full seat on any
  seed; the lesser seat waits on 2/4 while the villages die. Behind
  this wall still sits the wave-4 kill wall from the November 3
  picture; this run faced no wave-5 content and claims no kill.

## Telemetry deviation check (step 14 — NOT rolled)
`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale.json --current
'evidence/2026-11-04/journey-scale-r97/journey-scale-r97-trust-*.json'
--metrics nationalLive,scaleRank` → "quiet (4 files, 2 metrics, no
large deviations)". Same caveat as r93–r96: that baseline is an old
aggregate shape, so "quiet" means "no large deviation on these two
metrics", not a clean bill. Baseline NOT rolled forward.

## Tests
- Proof test (new): scripts/test-foreign-react-fragframe-r97.js —
  drives Game.nvRespond for a foreign speaker with a forced fragment.
  RED before the fix (3/5: bare quote on nod + smile), GREEN after
  (5/5). The fix changes narration text only: no trust, temper,
  exposure, or routing line touched.
- Regression: scripts/test-foreign-react-nod-r72.js — 10/10 GREEN
  after the fix (narration cycling untouched).
- `node scripts/check.js --quick` (on the branch code,
  `--cacheDirectory=/tmp/jest-cache-playtest`): **283 passed, 7 failed
  in 906s.** The 7 are r96's same 6 pre-existing failures (same files:
  godpath/test-measurement-proof-update, test-measurement-workflow,
  test-mobile-combat-cadence, test-occupation-panels,
  test-phone-frame-proof, test-establishment-r20-fixes-20261020) PLUS
  godpath/test-trust-observer-neutrality hitting check.js's 120s cap
  (exit null) while a sibling check.js ran concurrently. Standalone
  re-run of that test: **6/6 GREEN in 70s**, all assertions passing —
  the timeout was load contention, not a regression. No failure
  touches conversation or foreign speech. Full log:
  evidence/2026-11-04/journey-scale-r97-checkquick.log.
- Quad determinism note: the fix touches only a narration string, so
  the pre-fix quad trajectories stand (no trust/routing input
  changed); the quad was not re-run for a text string.

## Metric review
- Q1's FINDING clause fired exactly as written: 28 resets, all one
  segment (COMPETENT), every one corroborated (entry hydration
  <45 + dThirst=1). The prereg's edge-vs-interior sub-question is
  answered NO by the (3,1) instance — no re-scoring, no threshold
  moved: the gate was about segment agreement, and the band agrees
  28/28.
- Q2's metric is unchanged from r93–r96 (seasoned-peer count AND
  scatter-day gap); it separates this band's four failures cleanly
  (early hunger ×2, trust-blocked ×2).
- Q3's corpus rule held: d90 exists for 2 seeds; no day substitution.
  Corpus is 2 sittings, and the verdict is split (1 real, 1 real
  with a fixed framing defect) — labeled so, not padded to 2/2 real.
- Carried, still open: the overnight hydration drain (first-attempt
  ~58–64 vs retry ~14 at the same tile — needs pack-water/tent/
  tile-water snapshots); the crisis-cycle / distress-economy design
  question (Steve's call, freeze stands); the wave-4-kill wall
  behind the scale wall (unchanged, not re-proven here).

## Blanks: filled or documented
- FILLED (src/ fix + proof test): the Mario-moment fragment's missing
  framing in the nonverbal react path — conversation.js, one line:
  the react branch now appends "— they grin, proud of the one
  English they know." exactly as the verbal path does. A player
  meeting Yoleida now reads pride, not hostility. [needs-eyes]
  (dialogue feel — worth one nonverbal sitting on his phone.)
- DOCUMENTED, mechanism traced (policy instrument, not game code):
  the pilgrimage stale-restart loop — mover identified as the
  COMPETENT thirst walk home, edge framing corrected to interior
  included, retry-hold explained at the mover level.
- DOCUMENTED (no instance this run): national staging — 0/4, with
  the trust-short shape named per seed.
