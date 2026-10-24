# sim-tableseat-a — leanlinkrescue courtship + table seat/wait legs (arm 1 of 2)

Run: fleshout-20261024T1955Z. Axis: scale-onramp. Worktree: sim-tableseat-a.
Sibling arm sim-tableseat-nowait-a tests the seat WITHOUT the wait leg — not
touched here; no file overlap (this arm owns scripts/policies/tableseat.js
and scripts/test-tableseat-sweep.js; the sibling owns its own policy file).

## Canon read

- docs/CANON.md (manifest) and docs/TABLE.md (the table contract) read
  before building. Contract points used: the full seat keeps the national
  bar; the lesser seat is priced without national; the seat is taken from
  Haven via tableTakeSeat; table sanctity suspends ambient monster
  pressure while the table sits. No canon invented: the seat/wait legs
  are copied from scripts/test-tablesit-sweep.js, and the courtship is
  leanlinkrescue verbatim (wrapped, not re-implemented).

## Why this arm

Backlog #906 + run 1822Z next blank — no beat-answering policy ever took
the table seat. sim-tablesit proved the seat/wait legs are never exercised
against competent (0 attempts: competent never reached national), while
leanlinkrescue reaches national reliably (confirm: final 6/8, ever 8/8).
This arm finally exercises the seat, on top of the courtship that already
reaches national, so the seat legs — not the courtship — are the delta.

## Pre-registration (binding — written before sweeping, judged against, never re-scored mid-run)

- Baseline: leanlinkrescue-only (LEANLINKRESCUE=1, TABLESEAT unset),
  identical seeds, same instrument. This arm runs its own baseline (8) +
  armed (8) = 16 configs.
- Seeds (pilot): 73601–73608. Verified before sweeping: no filename or
  script hits (grep -l on scripts/ only for "73601" and "tableseat" —
  both empty before the policy/sweep files were written; evidence/ was
  never grepped with output).
- Horizon: 180 loop-days, death-aware (runDays breaks on Game.over).
- Primary: table entered (tableDone ever) armed vs baseline.
  GO requires armed entered >= baseline entered + 2.
- Deciding cost bar (from sim-scalemetric, binding): starvation deaths
  armed total <= baseline total + 2 AND arm-only starvation (armed
  starvation deaths on seeds where the paired baseline row had none)
  <= 2 AND median days armed >= 0.8 x baseline median days. All three
  must pass with the primary or the arm is NO-GO. Starvation = a death
  whose cause matches /starv|hunger|famine/i; the full by-cause table
  is carried per row so the bar is auditable.
- Secondary (reported, not judged): table invited ever, national
  final/ever, wins, wave 4/5 reach, max arc, death-cause shares, seat
  attempts/taken/kind/day, wait days/returns, median/max survival.
- Proof gates: G1 det-gate (TABLESEAT unset, 1 seed: armed days ==
  leanlinkrescue-only days, no ts counters); G2 pre-national read-only
  (seeds where neither arm ever reached national must match on
  days/gameDays); G3 corpus integrity (16/16 rows, days > 0, counters
  objects present).
- GO → policy file lands as its own commit, default-OFF only, NO
  default flips (a GO means GO CANDIDATE as an instrument, not
  competent play). NO-GO → DELETE the policy file, land only
  instruments + evidence (the sweep then carries the tested logic
  inline, per the sim-tablesit killed-arm precedent, so the NO-GO
  remains reproducible).
- Balanced panel (§15): attempted on the corpus; compare .md attached
  if the panel ingests it, else the exact reason + sweep-compare
  tables recorded below.
- Sense-testing law: one NON-MEASURED narration-on replay read of a
  seated/table run — meaning/coherence/consequences judged, never
  numbers (replay trajectories diverge).

## Instrument

- scripts/policies/tableseat.js: leanlinkrescue.daily wrapped with the
  tablesit seat leg (before courtship) + wait leg (after courtship:
  while tableWaiting + national+ + !tableDone, end the day at Haven
  (4,4)). TABLESEAT=1 on; anything else delegates to
  leanlinkrescue.daily. Zero src/js.
- scripts/test-tableseat-sweep.js: modes sweep / --detgate / --sense.
  Per-config INCREMENTAL corpus writes to
  evidence/2026-10-24/perseed-tableseat-a/ (direct write with a
  writer-subprocess fallback + read-back verification; the tablesit
  first attempt died silently mid-run with no corpus — never batch
  at the end). Sweep aggregate:
  evidence/2026-10-24/sim-tableseat-a-sweep.json.

## Results

Sweep: 16/16 configs, seeds 73601–73608, horizon 180 loop-days,
death-aware. All per-config writes landed via direct write (no
writer-subprocess fallback needed). Anchor: branch sim-tableseat-a at
b9c33fefc (the sweep records its own anchorCommit per row).

| Metric | Baseline (leanlinkrescue-only) | Armed (tableseat) |
|---|---|---|
| n | 8 | 8 |
| Won (table win flag) | 0 | 3 (seeds 73601, 73604, 73605) |
| Median days / max days | 173 / 180 | 161 / 180 |
| National ever / final | 5 / 1 | 5 / 4 |
| Table invited ever | 5 | 5 |
| Table entered (tableDone ever) — PRIMARY | 0 | 3 |
| Wave 4 / wave 5 reach | 7 / 0 | 6 / 0 |
| Max arc | 4 | 4 |
| Starvation deaths | 5 | 5 |
| Total deaths | 402 | 353 |
| Seat attempts / taken | 0 / 0 | 3 / 3 |
| Seat days / kinds | — | 129, 142, 161 / lesser × 3 |
| Table answers / paths | 0 / — | 15 / feared × 3 |
| Wait days / returns / stranded | 0 / 0 / 0 | 2 / 0 / 1 |
| Previews seen / not-ready | 0 / 0 | 5 / 2 |

Per-seed (baseline → armed; only the 3 seated seeds diverge, all other
5 pairs byte-identical on days, deaths, and court counters):

| Seed | Baseline | Armed |
|---|---|---|
| 73601 | 179d, village-lost, global→regional, tab 1, ent 0, won 0 | 129d, over-other, global→global, tab 1, ent 1, won 1, seat d129 lesser, feared |
| 73602 | 180d, survived, regional, tab 1, ent 0, starv 3 | identical (no national ever → legs never gated in) |
| 73603 | 160d, village-lost, regional, tab 1, ent 0, starv 1 | identical (no national ever) |
| 73604 | 157d, village-lost, global→regional, tab 1, ent 0 | 142d, over-other, global→global, ent 1, won 1, seat d142 lesser, feared |
| 73605 | 180d, village-lost, global→regional, tab 1, ent 0 | 161d, over-other, global→global, ent 1, won 1, seat d161 lesser, feared, wait 2d (1 stranded) |
| 73606 | 173d, village-lost, global→regional, tab 0, ent 0 | identical except tsNationalDay 85 (national reached, no invitation → preview null, no attempt) |
| 73607 | 167d, village-lost, national→national, tab 0, ent 0 | identical except tsNationalDay 77 (same: national, no invitation) |
| 73608 | 150d, village-lost, regional, tab 0, ent 0, starv 1 | identical (no national ever) |

Verdict: **GO (GO CANDIDATE, default-OFF instrument only).**

- PRIMARY: armed entered 3 >= baseline entered 0 + 2 → PASS.
- Cost bar: starvation total armed 5 <= baseline 5 + 2 → PASS;
  arm-only starvation 0 <= 2 → PASS; median days armed 161 >= 0.8 ×
  baseline 173 (= 138.4), ratio 0.93 → PASS.
- Proof gates: G1 det-gate PASS (seed 73601: baseline 179/179 vs
  tableseat-with-TABLESEAT-unset 179/179, ts counters empty, court
  counters present); G2 pre-national read-only PASS (3 comparable
  seeds — 73602, 73603, 73608, neither arm ever national — identical
  days/gameDays); G3 corpus integrity PASS (16/16 rows, days > 0,
  ts + court objects present on every row).
- Courtship shared exactly: paired court counters identical on all
  8 seeds (proposedLead, courtAccords, tended, courtNational,
  courtGlobal) — the delta is the seat/wait legs alone.
- Death-cause shares (both arms combat-dominated; starvation
  identical 5/5 on the same seeds): baseline — villager combat 168,
  villager:villager combat 88, player arena 78, villager monster 24,
  villager expedition 15, villager starvation 5, villager sickness 5;
  armed — villager combat 140, villager:villager combat 87, player
  arena 64, villager monster 20, villager expedition 15, villager
  starvation 5, villager sickness 5. The armed arm's lower death
  total (353 vs 402) is the 3 runs ending early at table wins, not a
  safety effect — the per-seed causes on non-seated seeds are
  identical.
- Wave 4 armed 6 vs baseline 7 is NOT a regression: armed 73601 won
  at the table on day 129 at wave 3, before wave 4 unlocked.

## Village assessment (plain words)

The villages in this pilot are leanlinkrescue villages: they court,
they climb, they reach national on 5 of 8 seeds — and then the story
splits. Left alone (baseline), a village that gets invited to the
table never sits down. It waits, its standing decays — three seeds
peaked at global and ended the run back at regional — and it dies
with the invitation unanswered (5 invitations, 0 seats). With the
seat legs on, the same villages sit the moment the seat is ready:
three lesser seats, three wins, all on the Feared path's light road
(protective terror, mercy final choice — first-option answering, so
"feared × 3" is the answering rule, not a path preference). The
waiting itself worked once: on 73605 the seat wasn't ready for two
days, the village held at Haven (one day it didn't make it back in
time — "stranded" — and sat the next day). Where no invitation
came, the legs did nothing at all: national villages without a table
invitation, and regional villages with invitations but no national
standing, ran byte-identical to baseline. That restraint is the
point — the legs are a door-opener, not a thumb on the scale.

## Reachability verdict

- Table seat: REACHABLE, and now EXERCISED — 3/8 armed seeds sat and
  won (all lesser seats; no full seat appeared, which matches the
  contract: full keeps the national bar and more). The missing beat
  was never the invitation (baseline got 5) — it was a policy that
  sits down.
- Table win flag: REACHED — 3/8 armed, 0/8 baseline.
- National: reached on 5/8 both arms (ever); final standing held on
  4/8 armed vs 1/8 baseline, because the wins end at global.
- Wave 5: still 0/16 — the scale wall past national stands. The table
  win does not need wave 5 (all three wins at wave 3–4), so wave 5
  remains its own blank.
- Arc IV: reached (max arc 4 both arms).

## Metric review

Pre-registered metrics bind this run and the verdict above stands on
them; no re-scoring was done. One revision proposed for the NEXT
seat-arm run (not applied here): the median-days cost bar is
confounded by table wins, because a win ENDS the run early by design
— a future arm that wins on many seeds could trip the 0.8 floor
while winning. Proposed revision: for seat arms, judge median days
among non-won seeds (here: baseline 173 vs armed non-won median
167, ratio 0.97 — the same PASS, cleaner logic). Also proposed:
record "invitation-to-seat latency" (days from tableWaiting to
seat) as a secondary, since 73605 showed a 2-day wait with one
stranded day.

## Balanced panel

ATTEMPTED, NOT INGESTED. `node scripts/balance-panel.js compare
--before evidence/2026-10-24/sim-tableseat-a-sweep.json --after
(same) --out /tmp/tableseat-panel` throws
`TypeError: Cannot read properties of undefined (reading 'days')`
at scripts/lib/balance-scorecard.js:44 (comparePanels). Cause: the
panel compare ingests panel-driver output (panel.json.gz with the
scorecard's row shape), not a per-seed sweep corpus — there is no
before/after panel pair for this arm, so no compare .md exists to
attach. The sweep-compare tables above (identical seeds, paired
rows, shared court counters, G1/G2/G3 gates) are the §15 substitute
for this run; a future run that wants a real panel compare must
first generate panel-driver output for both arms, which is a
tooling task, not a measurement task.

## Sense read

NON-MEASURED narration replay, seed 73601, tableseat armed (ring 240
lines; the replay also reached the seat and the win — judged here
for WORDS only, never numbers, since narration shifts trajectories).
The seat scene reads sensibly, in order: d128 "The table is being
set — a lesser seat, priced for what you built. They are watching
to see who comes to it." d129 the ring of pale light and the
trillions-eyed audience; the audit reads the run aloud (lesser
seat, global standing, waves 1–3 faced 11/7/3, 10 contests
survived, 3 crises weathered — "The table does not rise. It
prices."); the sanctity line ("EVERYONE. SIT. WATCH. The teeth and
the weather can WAIT"); the Feared beats as a tightrope (terror
pledged as shield, "your own people go still too — a different
stillness"); the light road opening because the protected
outnumber the killed and the food truth was shared; the final
choice "Show mercy" resolving into the shield-over-every-village
epilogue, bearer Nina Petrova walking out of the light alone.
Villagers react around the table (Nino: "My kid asked if the
watchers have favorites. I didn't know what to tell her.") — thin
but present; the table sequence itself carries the weight. One
honest thread left open by design: the win epilogue notes the
stasis kids still napping ("You never asked. Not once.") — the
non-hosts ending does not bring the Taken home (that is THE HOSTS
priced choice per TABLE.md), so the open thread is canon, not a
gap. No robotic repetition, no filler loops, no contradiction in
the table sequence.

## Findings outside this arm

Reported, not chased; goal hidden_files not touched by this worker.

- PERISHABLE NATIONAL WINDOW: baseline villages peaked at global
  then decayed to regional and died with table invitations
  unanswered (3 seeds). National standing is not sticky — a
  seat-taking policy matters because the window closes. (For the
  coordinator: this is the mechanism behind "invited but never
  seated.")
- FIRST-OPTION ARTIFACT: all 3 seats resolved to the Feared path
  because the legs answer first-option every beat. Other paths are
  unexercised by this arm; a future arm should vary table-choice
  answering to walk other doors.
- WAVE 5 STILL 0/16: national + table win do not imply wave 5.
  Wave-5 unlock remains a separate blank for the scale-onramp axis.
- WAIT-LEG STRANDED DAY: on 73605, walkTo(4,4) did not reach Haven
  in one day (tsWaitStranded 1); the seat was taken the next day.
  Single instance, no action — but if a village is far afield when
  invited, the wait costs days.
- TELEMETRY LABEL NOTE: death causes carry both "villager:combat"
  and "villager:villager combat" as separate labels (88 + 168
  baseline). Possibly two labels for one class; not investigated.
